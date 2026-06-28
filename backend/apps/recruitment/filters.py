from django.db.models import Q

EXPERIENCE_KEYWORDS = {
    'entry': [
        'entry',
        'entry-level',
        'entry level',
        'junior',
        'graduate',
        'intern',
        'no experience',
        'fresh graduate',
        'trainee',
    ],
    'mid': ['mid-level', 'mid level', 'midlevel', 'intermediate', 'mid level'],
    'senior': ['senior', 'sr.', 'sr '],
    'lead': ['lead', 'principal', 'head of', 'director', 'manager', 'chief'],
}

LOCATION_FILTERS = {
    'kenya': Q(location__icontains='kenya') | Q(source_name__icontains='kenya'),
    'nairobi': Q(location__icontains='nairobi'),
    'london': Q(location__icontains='london'),
    'remote': Q(location__icontains='remote') | Q(employment_type='remote'),
    'united states': Q(source_name__icontains='united states') | Q(location__icontains='united states'),
    'south africa': Q(location__icontains='south africa'),
}


def apply_job_search(queryset, search_term):
    term = (search_term or '').strip()
    if not term:
        return queryset
    return queryset.filter(
        Q(title__icontains=term)
        | Q(summary__icontains=term)
        | Q(description__icontains=term)
        | Q(location__icontains=term)
        | Q(source_name__icontains=term)
        | Q(experience_level__icontains=term)
    )


def apply_location_filter(queryset, location):
    value = (location or '').strip().lower().replace('-', ' ')
    if not value or value == 'all':
        return queryset

    location_query = LOCATION_FILTERS.get(value)
    if location_query is not None:
        return queryset.filter(location_query)

    return queryset.filter(location__icontains=value)


def apply_employment_type_filter(queryset, employment_type):
    value = (employment_type or '').strip().lower()
    if not value or value == 'all':
        return queryset

    if value == 'remote':
        return queryset.filter(Q(employment_type='remote') | Q(location__icontains='remote'))

    return queryset.filter(employment_type=employment_type)


def apply_experience_filter(queryset, experience_level):
    value = (experience_level or '').strip().lower().replace('-', ' ')
    if not value or value == 'all':
        return queryset

    keywords = EXPERIENCE_KEYWORDS.get(value, [value])
    query = Q()
    for keyword in keywords:
        query |= Q(experience_level__icontains=keyword)
        query |= Q(title__icontains=keyword)
        query |= Q(summary__icontains=keyword)
        query |= Q(description__icontains=keyword)
    return queryset.filter(query)


def apply_source_filter(queryset, source_name):
    value = (source_name or '').strip().lower().replace('-', ' ')
    if not value or value == 'all':
        return queryset
    return queryset.filter(source_name__icontains=value)


def infer_experience_level(title='', summary='', description=''):
    text = ' '.join(part for part in (title, summary, description) if part).lower()
    if not text:
        return ''

    for level, keywords in EXPERIENCE_KEYWORDS.items():
        if any(keyword in text for keyword in keywords):
            if level == 'entry':
                return 'Entry level'
            if level == 'mid':
                return 'Mid-level'
            if level == 'senior':
                return 'Senior'
            if level == 'lead':
                return 'Lead / Principal'
    return ''
