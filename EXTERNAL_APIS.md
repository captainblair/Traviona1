# Traviona External APIs and Credentials

These are the external credentials the backend can use once you are ready to connect live providers.

## Required for Social Login
- Google OAuth access token verification
  - Google Cloud OAuth client for the frontend
  - Backend verifies frontend-provided access tokens through Google userinfo
- LinkedIn OAuth access token verification
  - LinkedIn app with Sign In with LinkedIn / OpenID Connect enabled
  - Backend verifies frontend-provided access tokens through LinkedIn userinfo

## Required for News Ingestion
- `NEWSAPI_API_KEY`
  - Used by configured insight sources with provider `newsapi`
- `GNEWS_API_KEY`
  - Used by configured insight sources with provider `gnews`
- RSS feed URLs
  - No key required
  - Add feeds in the admin or `/api/insights/sources/` with provider `rss`

## Required for Email
- SMTP host, port, username, password
- `DEFAULT_FROM_EMAIL`

## Optional Production Services
- PostgreSQL database URL
- Redis URL for Celery broker/result backend/cache
- Hosting provider secrets for `SECRET_KEY`, allowed hosts, CORS, and CSRF trusted origins
