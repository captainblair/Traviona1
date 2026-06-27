import json
import os
from urllib.parse import urlencode
from urllib.request import urlopen
from xml.etree import ElementTree

from django.utils import timezone

from .models import ExternalInsightSource, Insight, InsightCategory, InsightTag


def _text(element, tag_name):
    child = element.find(tag_name)
    return child.text.strip() if child is not None and child.text else ''


def parse_rss_feed(xml_content, source_name='RSS'):
    root = ElementTree.fromstring(xml_content)
    channel = root.find('channel')
    items = channel.findall('item') if channel is not None else root.findall('.//item')
    payloads = []

    for item in items:
        title = _text(item, 'title')
        link = _text(item, 'link')
        summary = _text(item, 'description')
        if not title:
            continue
        payloads.append({
            'title': title,
            'summary': summary,
            'content': summary,
            'source_name': source_name,
            'source_url': link,
            'external_id': link,
            'raw_payload': {
                'title': title,
                'link': link,
                'description': summary,
                'published_at': _text(item, 'pubDate'),
            },
        })

    return payloads


def fetch_rss_payloads(source):
    with urlopen(source.endpoint_url, timeout=15) as response:
        return parse_rss_feed(response.read(), source.name)


def fetch_newsapi_payloads(source):
    params = {'apiKey': os.environ.get(source.api_key_env or 'NEWSAPI_API_KEY', '')}
    separator = '&' if '?' in source.endpoint_url else '?'
    with urlopen(f'{source.endpoint_url}{separator}{urlencode(params)}', timeout=15) as response:
        data = json.loads(response.read().decode('utf-8'))

    payloads = []
    for article in data.get('articles', []):
        title = article.get('title', '')
        if not title:
            continue
        payloads.append({
            'title': title,
            'summary': article.get('description') or '',
            'content': article.get('content') or article.get('description') or '',
            'author_name': article.get('author') or '',
            'source_name': source.name,
            'source_url': article.get('url') or '',
            'external_id': article.get('url') or title,
            'raw_payload': article,
        })
    return payloads


def fetch_gnews_payloads(source):
    params = {'apikey': os.environ.get(source.api_key_env or 'GNEWS_API_KEY', '')}
    separator = '&' if '?' in source.endpoint_url else '?'
    with urlopen(f'{source.endpoint_url}{separator}{urlencode(params)}', timeout=15) as response:
        data = json.loads(response.read().decode('utf-8'))

    payloads = []
    for article in data.get('articles', []):
        title = article.get('title', '')
        if not title:
            continue
        payloads.append({
            'title': title,
            'summary': article.get('description') or '',
            'content': article.get('content') or article.get('description') or '',
            'source_name': source.name,
            'source_url': article.get('url') or '',
            'external_id': article.get('url') or title,
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


def sync_external_insights(payloads, source=None):
    created_count = 0
    for item in payloads:
        title = item.get('title', '').strip()
        external_id = item.get('external_id', '').strip()
        if not title:
            continue

        category_ref = item.get('category_ref') or _resolve_category(item.get('category'))
        if source and not category_ref:
            category_ref = source.default_category

        defaults = {
            'title': title,
            'summary': item.get('summary', ''),
            'content': item.get('content', ''),
            'category': item.get('category', 'global_trends'),
            'category_ref': category_ref,
            'author_name': item.get('author_name', ''),
            'tags': item.get('tags', ''),
            'read_time_minutes': item.get('read_time_minutes', 5),
            'source_name': item.get('source_name', ''),
            'source_url': item.get('source_url', ''),
            'external_id': external_id,
            'raw_payload': item.get('raw_payload', item),
            'moderation_status': item.get('moderation_status', 'draft'),
            'is_published': item.get('is_published', False),
            'published_at': item.get('published_at'),
        }

        if external_id:
            insight, created = Insight.objects.get_or_create(external_id=external_id, defaults=defaults)
        elif item.get('source_url'):
            existing = Insight.objects.filter(source_url=item.get('source_url')).first()
            created = existing is None
            insight = existing
            if created:
                insight = Insight.objects.create(**defaults)
        else:
            existing = Insight.objects.filter(title=title, source_name=item.get('source_name', '')).first()
            created = existing is None
            insight = existing
            if created:
                insight = Insight.objects.create(**defaults)

        if created:
            tag_refs = list(source.default_tags.all()) if source else []
            tag_refs.extend(_resolve_tags(item.get('tag_refs') or item.get('tags')))
            if tag_refs:
                insight.tag_refs.set(tag_refs)
            created_count += 1
    return created_count


def sync_configured_external_sources():
    created_count = 0
    for source in ExternalInsightSource.objects.filter(is_active=True):
        payloads = fetch_external_source_payloads(source)
        created_count += sync_external_insights(payloads, source=source)
        source.last_synced_at = timezone.now()
        source.save(update_fields=['last_synced_at'])
    return created_count
