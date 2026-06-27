from django.http import JsonResponse


def api_index(request):
    return JsonResponse({
        'project': 'Traviona',
        'version': '0.1.0',
        'schema_url': '/api/schema/',
        'endpoints': {
            'auth': '/api/users/',
            'website': '/api/website/',
            'insights': '/api/insights/',
            'recruitment': '/api/recruitment/',
        },
    })


def home_view(request):
    return JsonResponse({
        'project': 'Traviona',
        'message': 'Django backend is running.',
        'status': 'ok',
    })


def health_check(request):
    return JsonResponse({'status': 'ok', 'service': 'traviona-backend'})
