import json
import re
from email.utils import parsedate_to_datetime
from html import unescape
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from xml.etree import ElementTree

from bs4 import BeautifulSoup
from django.conf import settings
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from .models import ExternalInsightSource, Insight, InsightCategory, InsightTag

INSIGHT_USER_AGENT = 'TravionaInsightSync/1.0 (+https://travionaconsulting.top)'
NEWSAPI_TRUNCATION_RE = re.compile(r'\s*\[\+\d+\s+chars\]\s*$', re.IGNORECASE)
HTML_TAG_RE = re.compile(r'<[a-z][\s\S]*?>', re.IGNORECASE)


def _get_env_secret(name, default=''):
    configured = getattr(settings, name, None)
    if configured:
        return configured
    return ''


def _text(element, tag_name):
    child = element.find(tag_name)
    return _element_inner_markup(child)


def _element_inner_markup(element):
    if element is None:
        return ''

    parts = [element.text or '']
    for child in element:
        parts.append(ElementTree.tostring(child, encoding='unicode'))
        if child.tail:
            parts.append(child.tail)
    return ''.join(parts).strip()


def _rss_item_field(item, local_tag):
    for child in item:
        if child.tag.rsplit('}', 1)[-1] == local_tag:
            return _element_inner_markup(child)
    return ''


def _html_to_plain_text(value):
    if not value:
        return ''

    stripped = value.strip()
    if not HTML_TAG_RE.search(stripped) and '&' not in stripped:
        return stripped

    soup = BeautifulSoup(unescape(stripped), 'html.parser')
    for br in soup.find_all('br'):
        br.replace_with('\n')
    for tag in soup.find_all(['p', 'li', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'div', 'tr']):
        tag.insert_after('\n\n')

    lines = [line.strip() for line in soup.get_text('\n').splitlines()]
    paragraphs = []
    buffer = []
    for line in lines:
        if line:
            buffer.append(line)
        elif buffer:
            paragraphs.append(' '.join(buffer))
            buffer = []
    if buffer:
        paragraphs.append(' '.join(buffer))

    return '\n\n'.join(paragraphs)


def _normalize_article_text(value):
    if not value:
        return ''
    text = _html_to_plain_text(value)
    return NEWSAPI_TRUNCATION_RE.sub('', text).strip()


def _article_summary_and_content(description_raw, body_raw=''):
    description = _normalize_article_text(description_raw)
    body = _normalize_article_text(body_raw) if body_raw else description
    content = body if len(body) > len(description) else description
    lead = (description or content).split('\n\n')[0]
    summary = lead[:500] if lead else content[:500]
    return summary, content


def _parse_published_at(value):
    if not value:
        return timezone.now()
    if isinstance(value, str):
        parsed = parse_datetime(value.replace('Z', '+00:00'))
        if parsed:
            return parsed
        try:
            return parsedate_to_datetime(value)
        except (TypeError, ValueError, IndexError):
            pass
    return timezone.now()


def _estimate_read_time(*texts):
    words = len(' '.join(text for text in texts if text).split())
    return max(3, round(words / 200) or 3)


def _category_value(category_ref):
    if not category_ref:
        return 'global_trends'
    slug = category_ref.slug.replace('-', '_')
    valid = {choice[0] for choice in Insight.CATEGORY_CHOICES}
    return slug if slug in valid else 'global_trends'


def _category_ref_for_value(value):
    slug = value.replace('_', '-')
    return InsightCategory.objects.filter(slug=slug).first()


CATEGORY_KEYWORD_GROUPS = {
    'human_rights': [
        'human rights', 'refugee', 'refugees', 'asylum', 'humanitarian', 'famine',
        'discrimination', 'gender violence', 'child marriage', 'poverty', 'hunger crisis',
    ],
    'security': [
        'security', 'military', ' war ', 'conflict', 'defence', 'defense', 'terror',
        'terrorism', 'cyber attack', 'airstrike', 'missile', 'nato', 'army', 'weapon',
        'hostage', 'bomb', 'ceasefire', 'troops', 'invasion',
    ],
    'economy': [
        'business', 'market', 'economy', 'economic', 'trade', 'inflation', 'bank',
        'finance', 'stock', 'investment', 'corporate', 'company', 'gdp', 'currency',
        'interest rate', 'oil price', 'earnings', 'shares',
    ],
    'politics': [
        'election', 'government', 'parliament', 'president', 'minister', 'prime minister',
        'vote', 'political', ' party ', 'senate', 'congress', 'diplomacy', 'sanction', 'cabinet',
    ],
}


def _score_category(text, keywords):
    score = 0
    for keyword in keywords:
        if keyword in text:
            score += 2 if ' ' in keyword else 1
    return score


def _infer_category(title, summary, fallback='global_trends'):
    text = f'{title} {summary}'.lower()
    scores = {category: _score_category(text, words) for category, words in CATEGORY_KEYWORD_GROUPS.items()}
    best = max(scores, key=scores.get)
    if scores[best] >= 2:
        return best
    return fallback if fallback in {choice[0] for choice in Insight.CATEGORY_CHOICES} else 'global_trends'


def _read_url(url, headers=None):
    request = Request(url, headers=headers or {'User-Agent': INSIGHT_USER_AGENT})
    with urlopen(request, timeout=25) as response:
        return response.read()


def _extract_image_from_html(html):
    if not html:
        return ''
    match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', html, re.IGNORECASE)
    return match.group(1).strip() if match else ''


def _rss_media_url(item):
    for element in item.iter():
        url = element.attrib.get('url', '').strip()
        if not url:
            continue
        medium = element.attrib.get('medium', '').lower()
        media_type = element.attrib.get('type', '').lower()
        tag = element.tag.rsplit('}', 1)[-1].lower()
        if medium == 'image' or media_type.startswith('image/') or tag in {'content', 'thumbnail'}:
            return url

    enclosure = item.find('enclosure')
    if enclosure is not None:
        enclosure_type = enclosure.attrib.get('type', '').lower()
        if enclosure_type.startswith('image/'):
            return enclosure.attrib.get('url', '').strip()

    return _extract_image_from_html(_text(item, 'description'))


def parse_rss_feed(xml_content, source_name='RSS'):
    root = ElementTree.fromstring(xml_content)
    channel = root.find('channel')
    items = channel.findall('item') if channel is not None else root.findall('.//item')
    payloads = []

    for item in items:
        title = _text(item, 'title')
        link = _text(item, 'link')
        description_raw = _rss_item_field(item, 'description') or _text(item, 'description')
        body_raw = _rss_item_field(item, 'encoded')
        summary, content = _article_summary_and_content(description_raw, body_raw)
        if not title:
            continue
        pub_date = _text(item, 'pubDate')
        image_url = _rss_media_url(item)
        payloads.append({
            'title': title,
            'summary': summary,
            'content': content,
            'author_name': _text(item, 'author') or source_name,
            'source_name': source_name,
            'source_url': link,
            'external_id': f'rss:{link or title}',
            'published_at': pub_date,
            'featured_image_url': image_url,
            'read_time_minutes': _estimate_read_time(content, summary),
            'raw_payload': {
                'title': title,
                'link': link,
                'description': description_raw,
                'published_at': pub_date,
            },
        })

    return payloads


def fetch_rss_payloads(source):
    return parse_rss_feed(_read_url(source.endpoint_url), source.name)


def fetch_newsapi_payloads(source):
    api_key = _get_env_secret(source.api_key_env or 'NEWSAPI_API_KEY')
    if not api_key:
        return []

    params = {'apiKey': api_key}
    separator = '&' if '?' in source.endpoint_url else '?'
    try:
        raw = _read_url(f'{source.endpoint_url}{separator}{urlencode(params)}')
    except Exception:
        return []

    data = json.loads(raw.decode('utf-8'))
    if data.get('status') != 'ok':
        return []

    payloads = []
    for article in data.get('articles', []):
        title = article.get('title', '')
        if not title or title == '[Removed]':
            continue
        description_raw = article.get('description') or ''
        content_raw = article.get('content') or description_raw
        summary, content = _article_summary_and_content(description_raw, content_raw)
        url = article.get('url') or ''
        payloads.append({
            'title': title,
            'summary': summary,
            'content': content,
            'author_name': article.get('author') or article.get('source', {}).get('name') or source.name,
            'source_name': source.name,
            'source_url': url,
            'external_id': f'newsapi:{url or title}',
            'published_at': article.get('publishedAt'),
            'featured_image_url': article.get('urlToImage') or '',
            'read_time_minutes': _estimate_read_time(content, summary),
            'raw_payload': article,
        })
    return payloads


def fetch_gnews_payloads(source):
    api_key = _get_env_secret(source.api_key_env or 'GNEWS_API_KEY')
    if not api_key:
        return []

    params = {'apikey': api_key}
    separator = '&' if '?' in source.endpoint_url else '?'
    data = json.loads(_read_url(f'{source.endpoint_url}{separator}{urlencode(params)}').decode('utf-8'))

    payloads = []
    for article in data.get('articles', []):
        title = article.get('title', '')
        if not title:
            continue
        description_raw = article.get('description') or ''
        summary, content = _article_summary_and_content(description_raw)
        url = article.get('url') or ''
        payloads.append({
            'title': title,
            'summary': summary,
            'content': content,
            'author_name': article.get('source', {}).get('name') or source.name,
            'source_name': source.name,
            'source_url': url,
            'external_id': f'gnews:{url or title}',
            'published_at': article.get('publishedAt'),
            'featured_image_url': article.get('image') or '',
            'read_time_minutes': _estimate_read_time(content, summary),
            'raw_payload': article,
        })
    return payloads


def fetch_external_source_payloads(source):
    if source.provider == 'rss':
        return fetch_rss_payloads(source)
    if source.provider == 'newsapi':
        return fetch_newsapi_payloads(source)
    if source.provider == 'gnews':
        return fetch_gnews_payloads(source)
    return []


def _resolve_category(value):
    if not value:
        return None
    if isinstance(value, InsightCategory):
        return value
    return InsightCategory.objects.filter(slug=value).first() or InsightCategory.objects.filter(name__iexact=value).first()


def _resolve_tags(value):
    if not value:
        return []
    if isinstance(value, str):
        names = [tag.strip() for tag in value.split(',') if tag.strip()]
    else:
        names = [str(tag).strip() for tag in value if str(tag).strip()]
    tags = []
    for name in names:
        tag, _ = InsightTag.objects.get_or_create(name=name)
        tags.append(tag)
    return tags


def _image_from_raw_payload(raw_payload):
    if not isinstance(raw_payload, dict):
        return ''
    return raw_payload.get('urlToImage') or raw_payload.get('image') or ''


def sync_external_insights(payloads, source=None):
    created_count = 0
    updated_count = 0
    publish_external = source is not None

    for item in payloads:
        title = item.get('title', '').strip()
        external_id = item.get('external_id', '').strip()[:100]
        if not title:
            continue

        category_ref = item.get('category_ref') or _resolve_category(item.get('category'))
        if source and not category_ref:
            category_ref = source.default_category

        source_default = _category_value(category_ref)
        summary, content = _article_summary_and_content(item.get('summary', ''), item.get('content', ''))
        category = _infer_category(title, summary, source_default)
        category_ref = _category_ref_for_value(category) or category_ref

        if publish_external:
            moderation_status = 'published'
            is_published = True
            published_at = _parse_published_at(item.get('published_at'))
        else:
            moderation_status = item.get('moderation_status', 'draft')
            is_published = item.get('is_published', False)
            published_at = item.get('published_at')

        defaults = {
            'title': title,
            'summary': summary,
            'content': content,
            'category': category,
            'category_ref': category_ref,
            'author_name': (item.get('author_name', '') or '')[:200],
            'tags': (item.get('tags', '') or '')[:500],
            'read_time_minutes': item.get('read_time_minutes', _estimate_read_time(item.get('content', ''), item.get('summary', ''))),
            'source_name': (item.get('source_name', source.name if source else '') or '')[:100],
            'source_url': (item.get('source_url', '') or '')[:2048],
            'featured_image_url': ((item.get('featured_image_url') or _image_from_raw_payload(item.get('raw_payload'))) or '')[:2048],
            'external_id': external_id,
            'raw_payload': item.get('raw_payload', item),
            'moderation_status': moderation_status,
            'is_published': is_published,
            'published_at': published_at,
        }

        if external_id:
            insight, created = Insight.objects.update_or_create(external_id=external_id, defaults=defaults)
        elif item.get('source_url'):
            insight, created = Insight.objects.update_or_create(source_url=item.get('source_url'), defaults=defaults)
        else:
            insight, created = Insight.objects.update_or_create(
                title=title,
                source_name=defaults['source_name'],
                defaults=defaults,
            )

        tag_refs = list(source.default_tags.all()) if source else []
        tag_refs.extend(_resolve_tags(item.get('tag_refs') or item.get('tags')))
        if tag_refs:
            insight.tag_refs.set(tag_refs)

        if created:
            created_count += 1
        else:
            updated_count += 1

    return created_count, updated_count


def sync_configured_external_sources():
    created_count = 0
    updated_count = 0
    for source in ExternalInsightSource.objects.filter(is_active=True):
        payloads = fetch_external_source_payloads(source)
        created, updated = sync_external_insights(payloads, source=source)
        created_count += created
        updated_count += updated
        source.last_synced_at = timezone.now()
        source.save(update_fields=['last_synced_at'])
    return created_count, updated_count
