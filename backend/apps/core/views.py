from django.http import JsonResponse


def api_index(request):
    return JsonResponse({
        'project': 'Traviona',
        'version': '0.1.0',
        'schema_url': '/api/schema/',
        'endpoints': {
            'auth': {
                'base': '/api/users/',
                'register': '/api/users/register/',
                'login': '/api/users/login/',
                'social_login': '/api/users/social-login/',
                'me': '/api/users/me/',
                'password_reset': '/api/users/password/reset/',
                'mfa_setup': '/api/users/mfa/setup/',
            },
            'website': {
                'home': '/api/website/home/',
                'about': '/api/website/about/',
                'services': '/api/website/services/',
                'leadership': '/api/website/leadership/',
                'contact': '/api/website/contact/',
                'global_presence': '/api/website/global-presence/',
            },
            'insights': {
                'public': '/api/insights/',
                'categories': '/api/insights/categories/',
                'tags': '/api/insights/tags/',
                'authors': '/api/insights/authors/',
                'drafts': '/api/insights/drafts/',
                'sources': '/api/insights/sources/',
            },
            'recruitment': {
                'jobs': '/api/recruitment/jobs/',
                'talents': '/api/recruitment/talents/',
                'my_talent_profile': '/api/recruitment/talents/me/',
                'applications': '/api/recruitment/applications/',
                'notifications': '/api/recruitment/notifications/',
                'dashboard': '/api/recruitment/dashboard/',
            },
        },
        'developer_notes': {
            'openapi': 'Use schema_url for generated API contract.',
            'demo_data': 'Run python manage.py seed_demo_data for local frontend fixtures.',
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
