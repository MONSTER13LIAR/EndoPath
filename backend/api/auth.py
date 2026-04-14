import json
import time
import jwt
import requests as http_requests
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST


@csrf_exempt
@require_POST
def google_login(request):
    try:
        body = json.loads(request.body)
        access_token = body.get('access_token')
        if not access_token:
            return JsonResponse({'error': 'access_token required'}, status=400)

        # Fetch user profile from Google
        resp = http_requests.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {access_token}'},
            timeout=10,
        )
        if resp.status_code != 200:
            return JsonResponse({'error': 'invalid Google token'}, status=401)

        profile = resp.json()
        user = {
            'email':   profile.get('email', ''),
            'name':    profile.get('name', ''),
            'picture': profile.get('picture', ''),
            'sub':     profile.get('sub', ''),
        }

        # Issue a 24-hour JWT
        payload = {
            **user,
            'iat': int(time.time()),
            'exp': int(time.time()) + 86400,
        }
        token = jwt.encode(payload, settings.JWT_SECRET, algorithm='HS256')

        return JsonResponse({'token': token, 'user': user})

    except json.JSONDecodeError:
        return JsonResponse({'error': 'invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
