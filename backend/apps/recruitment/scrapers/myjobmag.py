from urllib.parse import parse_qs, urljoin, urlparse
from urllib.request import Request, urlopen

from bs4 import BeautifulSoup

MYJOBMAG_USER_AGENT = 'TravionaJobSync/1.0 (+https://travionaconsulting.top)'


def _fetch_html(url):
    request = Request(url, headers={'User-Agent': MYJOBMAG_USER_AGENT})
    with urlopen(request, timeout=25) as response:
        return response.read().decode('utf-8', errors='replace')


def _page_url(base_list_url, page_number):
    if page_number <= 1:
        return base_list_url.rstrip('/')
    return f'{base_list_url.rstrip("/")}/page/{page_number}'


def _split_title_company(full_title):
    if ' at ' in full_title:
        title, company = full_title.rsplit(' at ', 1)
        return title.strip(), company.strip()
    return full_title.strip(), ''


def _parse_listing_page(html, source_name, default_location, base_url):
    soup = BeautifulSoup(html, 'html.parser')
    payloads = []
    seen = set()

    for link in soup.select('h2 a[href^="/job/"]'):
        href = link.get('href', '').strip()
        if not href or href in seen:
            continue
        seen.add(href)

        full_title = link.get_text(' ', strip=True)
        if not full_title:
            continue

        title, company = _split_title_company(full_title)
        listing = link.find_parent('li')
        description = ''
        if listing:
            desc_node = listing.find('li', class_='job-desc') or listing.select_one('.job-desc')
            if desc_node:
                description = desc_node.get_text(' ', strip=True)

        slug = href.removeprefix('/job/').strip('/')
        source_url = urljoin(base_url, href)
        summary = description[:300] if description else full_title[:300]
        if company and company not in summary:
            summary = f'{company} — {summary}' if summary else company

        payloads.append(
            {
                'title': title or full_title,
                'summary': summary,
                'description': description or summary,
                'location': default_location,
                'employment_type': 'full_time',
                'source_name': source_name,
                'source_url': source_url,
                'external_id': f'myjobmag:{slug}',
                'slug': slug,
                'raw_payload': {
                    'slug': slug,
                    'company': company,
                    'listing_title': full_title,
                    'href': href,
                },
            }
        )

    return payloads


def scrape_myjobmag_listings(endpoint_url, source_name, default_location='Kenya', max_pages=3):
    parsed = urlparse(endpoint_url)
    query = parse_qs(parsed.query)
    max_pages = max(1, min(int(query.get('max_pages', [max_pages])[0]), 20))
    base_list_url = f'{parsed.scheme}://{parsed.netloc}{parsed.path or "/jobs"}'
    base_site = f'{parsed.scheme}://{parsed.netloc}'

    payloads = []
    seen_ids = set()

    for page_number in range(1, max_pages + 1):
        page_url = _page_url(base_list_url, page_number)
        html = _fetch_html(page_url)
        page_payloads = _parse_listing_page(html, source_name, default_location, base_site)

        if not page_payloads:
            break

        for item in page_payloads:
            external_id = item['external_id']
            if external_id in seen_ids:
                continue
            seen_ids.add(external_id)
            payloads.append(item)

    return payloads


def fetch_myjobmag_jobs(source):
    return scrape_myjobmag_listings(
        endpoint_url=source.endpoint_url,
        source_name=source.name,
        default_location=source.default_location or 'Kenya',
    )
