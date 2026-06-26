from django.http import JsonResponse


def home_view(request):
    return JsonResponse({
        'project': 'Traviona',
        'message': 'Django backend is running.',
        'status': 'ok',
    })
