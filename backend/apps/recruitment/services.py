from .models import JobPosting


def sync_external_jobs(payloads):
    created_count = 0
    for item in payloads:
        defaults = {
            'summary': item.get('summary', ''),
            'description': item.get('description', ''),
            'location': item.get('location', ''),
            'employment_type': item.get('employment_type', 'full_time'),
            'salary_range': item.get('salary_range', ''),
            'experience_level': item.get('experience_level', ''),
            'source_name': item.get('source_name', ''),
            'source_url': item.get('source_url', ''),
            'external_id': item.get('external_id', ''),
            'raw_payload': item,
        }
        job, created = JobPosting.objects.get_or_create(
            external_id=item.get('external_id', ''),
            defaults=defaults,
        )
        if created:
            created_count += 1
            job.title = item.get('title', job.title)
            job.save(update_fields=['title'])
    return created_count
