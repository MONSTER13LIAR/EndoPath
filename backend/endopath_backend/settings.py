import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')

SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

ALLOWED_HOSTS = ['your-app.onrender.com', 'localhost', '127.0.0.1']

INSTALLED_APPS = [
    'django.contrib.staticfiles',
    'corsheaders',
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'endopath_backend.urls'

# No database — no models needed yet
DATABASES = {}

CORS_ALLOWED_ORIGINS = [
    'https://your-app.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

CORS_ALLOW_HEADERS = [
    'content-type',
    'accept',
]

# Featherless AI key — set via environment variable
FEATHERLESS_API_KEY = os.environ.get('FEATHERLESS_API_KEY', '')
FEATHERLESS_BASE_URL = "https://api.featherless.ai/v1"

# Google OAuth
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')

# JWT signing secret
JWT_SECRET = os.environ.get('JWT_SECRET')
if not JWT_SECRET:
    raise RuntimeError('JWT_SECRET environment variable is not set')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
