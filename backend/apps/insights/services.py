from .models import Insight


def sync_external_insights(payloads):
    created_count = 0
    for item in payloads:
        title = item.get('title', '').strip()
        external_id = item.get('external_id', '').strip()
        if not title:
            continue

        defaults = {
            'title': title,
            'summary': item.get('summary', ''),
            'content': item.get('content', ''),
            'category': item.get('category', 'global_trends'),
            'author_name': item.get('author_name', ''),
            'tags': item.get('tags', ''),
            'read_time_minutes': item.get('read_time_minutes', 5),
            'source_name': item.get('source_name', ''),
            'source_url': item.get('source_url', ''),
            'external_id': external_id,
            'raw_payload': item,
            'is_published': item.get('is_published', False),
            'published_at': item.get('published_at'),
        }

        if external_id:
            _, created = Insight.objects.get_or_create(external_id=external_id, defaults=defaults)
        elif item.get('source_url'):
            existing = Insight.objects.filter(source_url=item.get('source_url')).first()
            created = existing is None
            if created:
                Insight.objects.create(**defaults)
        else:
            existing = Insight.objects.filter(title=title, source_name=item.get('source_name', '')).first()
            created = existing is None
            if created:
                Insight.objects.create(**defaults)

        if created:
            created_count += 1
    return created_count
