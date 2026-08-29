import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# In production (Vercel), set DJANGO_SECRET_KEY in the backend project's
# Environment Variables. Falls back to the dev key for local development.
SECRET_KEY = os.environ.get(
    'DJANGO_SECRET_KEY',
    'django-insecure-fmcsa-hos-compliance-trip-planner-key-dev'
)

# Set DEBUG=False via env var in production.
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

# Add your Vercel domains via the ALLOWED_HOSTS env var (comma-separated),
# e.g. "your-backend.vercel.app,your-backend-git-main-you.vercel.app"
ALLOWED_HOSTS = ['*'] if DEBUG else [
    h.strip() for h in os.environ.get('ALLOWED_HOSTS', '.vercel.app').split(',') if h.strip()
]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party
    'rest_framework',
    'corsheaders',
    
    # Local apps
    'planner',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'hos_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'hos_backend.wsgi.application'

import urllib.parse

if os.environ.get("DATABASE_URL"):
    # Vercel Postgres / Neon / Supabase, etc. Set DATABASE_URL in the
    # backend project's Environment Variables if you need persistent storage.
    _url = urllib.parse.urlparse(os.environ["DATABASE_URL"])
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': _url.path.lstrip('/'),
            'USER': _url.username,
            'PASSWORD': _url.password,
            'HOST': _url.hostname,
            'PORT': _url.port,
        }
    }
else:
    # SQLite fallback for local development. Note: on Vercel's serverless
    # filesystem this file is ephemeral (reset on every cold start), so it's
    # fine for this app (the trip planner is stateless) but should NOT be
    # relied on for persisted data (e.g. Django admin/users) in production.
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS Settings
# In production, set CORS_ALLOWED_ORIGINS (comma-separated) to your deployed
# frontend URL(s), e.g. "https://your-frontend.vercel.app". Falls back to
# allowing everything only while DEBUG is True (local dev).
_cors_env = os.environ.get('CORS_ALLOWED_ORIGINS', '').strip()
if _cors_env:
    CORS_ALLOWED_ORIGINS = [o.strip() for o in _cors_env.split(',') if o.strip()]
else:
    CORS_ALLOW_ALL_ORIGINS = DEBUG
