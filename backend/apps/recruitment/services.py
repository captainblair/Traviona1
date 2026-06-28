import json
import os
import re
from urllib.parse import parse_qs, urlencode, urlparse
from urllib.request import Request, urlopen

from django.conf import settings
from django.utils import timezone

from .models import ExternalJobSource, JobPosting
from .scrapers.myjobmag import fetch_myjobmag_jobs


def _get_env_secret(name, default=''):
    configured = getattr(settings, name, None)
    if configured:
        return configured
    return os.environ.get(name, default)


def _read_json_url(url, headers=None, data=None):
    request = Request(url, headers=headers or {}, data=data)
    with urlopen(request, timeout=20) as response:
        return json.loads(response.read().decode('utf-8'))


def _join_location(parts, fallback=''):
    values = [part for part in parts if part]
    return ', '.join(values) if values else fallback


def fetch_greenhouse_jobs(source):
    data = _read_json_url(source.endpoint_url)
    jobs = data.get('jobs', data if isinstance(data, list) else [])
    payloads = []
    for job in jobs:
        title = job.get('title', '')
        if not title:
            continue
        payloads.append({
            'title': title,
            'summary': job.get('content', '')[:300],
            'description': job.get('content', ''),
            'location': (job.get('location') or {}).get('name', source.default_location),
            'employment_type': source.default_employment_type,
            'source_name': source.name,
            'source_url': job.get('absolute_url', ''),
            'external_id': str(job.get('id') or job.get('absolute_url') or title),
            'raw_payload': job,
        })
    return payloads


def fetch_lever_jobs(source):
    data = _read_json_url(source.endpoint_url)
    jobs = data if isinstance(data, list) else data.get('postings', [])
    payloads = []
    for job in jobs:
        title = job.get('text') or job.get('title', '')
        if not title:
            continue
        categories = job.get('categories') or {}
        payloads.append({
            'title': title,
            'summary': job.get('descriptionPlain', '')[:300],
            'description': job.get('descriptionPlain') or job.get('description', ''),
            'location': categories.get('location') or source.default_location,
            'employment_type': source.default_employment_type,
            'source_name': source.name,
            'source_url': job.get('hostedUrl') or job.get('applyUrl', ''),
            'external_id': job.get('id') or job.get('hostedUrl') or title,
            'raw_payload': job,
        })
    return payloads


def fetch_workable_jobs(source):
    token = _get_env_secret(source.api_key_env) if source.api_key_env else ''
    headers = {'Authorization': f'Bearer {token}'} if token else {}
    data = _read_json_url(source.endpoint_url, headers=headers)
    jobs = data.get('jobs', data.get('results', []))
    payloads = []
    for job in jobs:
        title = job.get('title', '')
        if not title:
            continue
        payloads.append({
            'title': title,
            'summary': job.get('shortcode', ''),
            'description': job.get('description', ''),
            'location': _join_location([job.get('city'), job.get('state'), job.get('country')], source.default_location),
            'employment_type': source.default_employment_type,
            'source_name': source.name,
            'source_url': job.get('url') or job.get('application_url', ''),
            'external_id': job.get('shortcode') or job.get('id') or title,
            'raw_payload': job,
        })
    return payloads


def fetch_ashby_jobs(source):
    data = _read_json_url(source.endpoint_url)
    jobs = data.get('jobs', data if isinstance(data, list) else [])
    payloads = []
    for job in jobs:
        title = job.get('title', '')
        if not title:
            continue
        payloads.append({
            'title': title,
            'summary': job.get('descriptionPlain', '')[:300],
            'description': job.get('descriptionPlain') or job.get('description', ''),
            'location': job.get('location') or source.default_location,
            'employment_type': source.default_employment_type,
            'source_name': source.name,
            'source_url': job.get('jobUrl') or job.get('applyUrl', ''),
            'external_id': job.get('id') or job.get('jobUrl') or title,
            'raw_payload': job,
        })
    return payloads


def fetch_adzuna_jobs(source):
    app_id = _get_env_secret(source.api_key_env or 'ADZUNA_APP_ID')
    app_key = _get_env_secret(source.api_secret_env or 'ADZUNA_APP_KEY')
    if not app_id or not app_key:
        return []

    parsed = urlparse(source.endpoint_url)
    query = parse_qs(parsed.query)
    max_pages = max(1, min(int(query.get('max_pages', ['1'])[0]), 10))
    results_per_page = query.get('results_per_page', ['50'])[0]
    country_match = re.search(r'/jobs/([a-z]{2})/search/', parsed.path)
    country_code = country_match.group(1) if country_match else 'xx'

    payloads = []
    seen_ids = set()

    for page in range(1, max_pages + 1):
        page_path = re.sub(r'/search/\d+/?$', f'/search/{page}', parsed.path.rstrip('/'))
        page_url = f'{parsed.scheme}://{parsed.netloc}{page_path}'
        separator = '&' if '?' in page_url else '?'
        request_url = (
            f'{page_url}{separator}'
            f'{urlencode({"app_id": app_id, "app_key": app_key, "results_per_page": results_per_page})}'
        )
        data = _read_json_url(request_url)

        for job in data.get('results', []):
            title = job.get('title', '')
            if not title:
                continue

            job_id = str(job.get('id') or job.get('redirect_url') or title)
            external_id = f'adzuna:{country_code}:{job_id}'
            if external_id in seen_ids:
                continue
            seen_ids.add(external_id)

            salary_min = job.get('salary_min')
            salary_max = job.get('salary_max')
            salary_range = ''
            if salary_min and salary_max:
                salary_range = f'{salary_min} - {salary_max}'

            payloads.append({
                'title': title,
                'summary': job.get('description', '')[:300],
                'description': job.get('description', ''),
                'location': job.get('location', {}).get('display_name', source.default_location),
                'employment_type': source.default_employment_type,
                'salary_range': salary_range,
                'source_name': source.name,
                'source_url': job.get('redirect_url', ''),
                'external_id': external_id,
                'slug': slugify_adzuna_slug(country_code, job_id, title),
                'raw_payload': job,
            })

    return payloads


def slugify_adzuna_slug(country_code, job_id, title):
    from django.utils.text import slugify

    base = slugify(title)[:180] or 'job'
    suffix = slugify(str(job_id))[:40] or country_code
    return f'{base}-{suffix}'[:240]


def fetch_jooble_jobs(source):
    api_key = _get_env_secret(source.api_key_env or 'JOOBLE_API_KEY')
    body = json.dumps({}).encode('utf-8')
    url = source.endpoint_url.format(api_key=api_key)
    data = _read_json_url(url, headers={'Content-Type': 'application/json'}, data=body)
    payloads = []
    for job in data.get('jobs', []):
        title = job.get('title', '')
        if not title:
            continue
        payloads.append({
            'title': title,
            'summary': job.get('snippet', ''),
            'description': job.get('snippet', ''),
            'location': job.get('location', source.default_location),
            'employment_type': source.default_employment_type,
            'salary_range': job.get('salary', ''),
            'source_name': source.name,
            'source_url': job.get('link', ''),
            'external_id': job.get('id') or job.get('link') or title,
            'raw_payload': job,
        })
    return payloads


def fetch_remoteok_jobs(source):
    data = _read_json_url(source.endpoint_url, headers={'User-Agent': 'Traviona job sync'})
    jobs = data[1:] if isinstance(data, list) else data.get('jobs', [])
    payloads = []
    for job in jobs:
        title = job.get('position') or job.get('title', '')
        if not title:
            continue
        payloads.append({
            'title': title,
            'summary': job.get('description', '')[:300],
            'description': job.get('description', ''),
            'location': job.get('location') or 'Remote',
            'employment_type': 'remote',
            'source_name': source.name,
            'source_url': job.get('url', ''),
            'external_id': str(job.get('id') or job.get('url') or title),
            'raw_payload': job,
        })
    return payloads


def fetch_custom_json_jobs(source):
    data = _read_json_url(source.endpoint_url)
    jobs = data.get('jobs', data.get('results', data if isinstance(data, list) else []))
    payloads = []
    for job in jobs:
        title = job.get('title', '')
        if not title:
            continue
        payload = {
            'title': title,
            'summary': job.get('summary', job.get('description', '')[:300]),
            'description': job.get('description', ''),
            'location': job.get('location', source.default_location),
            'employment_type': job.get('employment_type', source.default_employment_type),
            'salary_range': job.get('salary_range', ''),
            'experience_level': job.get('experience_level', ''),
            'source_name': source.name,
            'source_url': job.get('source_url', job.get('url', '')),
            'external_id': str(job.get('external_id') or job.get('id') or job.get('url') or title),
            'raw_payload': job,
        }
        payloads.append(payload)
    return payloads


def fetch_external_job_source_payloads(source):
    fetchers = {
        'greenhouse': fetch_greenhouse_jobs,
        'lever': fetch_lever_jobs,
        'workable': fetch_workable_jobs,
        'ashby': fetch_ashby_jobs,
        'adzuna': fetch_adzuna_jobs,
        'jooble': fetch_jooble_jobs,
        'remoteok': fetch_remoteok_jobs,
        'myjobmag': fetch_myjobmag_jobs,
        'custom_json': fetch_custom_json_jobs,
    }
    return fetchers.get(source.provider, fetch_custom_json_jobs)(source)


def sync_external_jobs(payloads, source=None):
    created_count = 0
    updated_count = 0
    seen_external_ids = set()

    for item in payloads:
        title = item.get('title', '').strip()
        if not title:
            continue

        defaults = {
            'title': title,
            'slug': JobPosting.slug_from_external_item(item, title),
            'summary': item.get('summary', ''),
            'description': item.get('description', ''),
            'location': item.get('location', source.default_location if source else ''),
            'employment_type': item.get('employment_type', source.default_employment_type if source else 'full_time'),
            'salary_range': item.get('salary_range', ''),
            'experience_level': item.get('experience_level', ''),
            'source_name': item.get('source_name', source.name if source else ''),
            'source_url': item.get('source_url', ''),
            'external_id': item.get('external_id', ''),
            'raw_payload': item.get('raw_payload', item),
            'is_active': True,
        }
        external_id = str(defaults['external_id'])[:100]
        defaults['external_id'] = external_id
        if external_id:
            seen_external_ids.add(external_id)
        if external_id:
            job, created = JobPosting.objects.update_or_create(external_id=external_id, defaults=defaults)
        elif defaults['source_url']:
            job, created = JobPosting.objects.update_or_create(source_url=defaults['source_url'], defaults=defaults)
        else:
            job, created = JobPosting.objects.update_or_create(
                title=title,
                source_name=defaults['source_name'],
                defaults=defaults,
            )
        if created:
            created_count += 1
        else:
            updated_count += 1

    deactivated_count = 0
    if source and seen_external_ids:
        deactivated_count = (
            JobPosting.objects.filter(is_active=True, source_name=source.name)
            .exclude(external_id='')
            .exclude(external_id__in=seen_external_ids)
            .update(is_active=False)
        )

    return created_count, updated_count, deactivated_count


def sync_configured_external_jobs():
    created_count = 0
    updated_count = 0
    deactivated_count = 0
    for source in ExternalJobSource.objects.filter(is_active=True):
        payloads = fetch_external_job_source_payloads(source)
        created, updated, deactivated = sync_external_jobs(payloads, source=source)
        created_count += created
        updated_count += updated
        deactivated_count += deactivated
        source.last_synced_at = timezone.now()
        source.save(update_fields=['last_synced_at'])
    return created_count, updated_count, deactivated_count
