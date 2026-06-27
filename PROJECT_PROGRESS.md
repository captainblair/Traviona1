# Traviona Project Progress

## Overview
This document tracks the current state of the Traviona consulting firm backend project and the remaining work from the proposed architecture.

## Status Summary
The backend foundation has been created and verified. The project now includes:

- A Django project scaffold under the backend folder
- App-based structure for core, website, insights, recruitment, and users
- Initial models for:
  - company/about content
  - consulting services
  - insights/articles
  - job postings
  - talent profiles
  - a custom user model
- Admin registration for the main models
- REST API routes and serializers for the main entities
- Media and static file configuration
- A working home endpoint returning a simple JSON payload
- Explicit public permissions for website, published insights, jobs, and talent directory endpoints
- A fixed about-page endpoint that returns the latest active page
- Centralized reusable role permission helpers for admin, recruiter, and content-editor checks
- Talent profile self-service endpoints for authenticated users
- Recruiter/admin talent verification endpoint
- Recruiter-facing application listing with job, status, and applicant filters
- Public insight filtering/search by category, tag, and query text
- Editorial insight APIs for draft creation, update, deletion, publish, and unpublish workflows
- Celery-backed insight ingestion task wired to the external insight sync service
- Hardened job application visibility so applicants only see their own applications, while recruiters/admins can manage applications
- Job application admin registration
- Public OpenAPI schema endpoint for frontend integration at `/api/schema/`
- Schema dependencies and regression coverage for OpenAPI contract generation
- Richer website content APIs with homepage sections, service detail pages, and SEO metadata
- Recruiter dashboard summaries, talent search/filtering, application status history, and in-app recruitment notifications
- Insight taxonomy models, moderation statuses, external source configuration, provider ingestion, and scheduled Celery sync
- Verified Django system checks with no issues
- A passing backend test suite covering core, auth, content, insights, and recruitment behavior

## Completed So Far
### Backend foundation
- Created Django project structure
- Configured settings for apps, static/media files, and REST framework
- Added initial app packages and URL routing

### Data model layer
- Added models for content, insights, recruitment, and users
- Added migrations and applied them successfully

### Admin & management
- Registered models in Django admin
- Added a custom admin site title and management header

### Basic API layer
- Added simplified REST endpoints for:
  - users
  - website/about and services
  - insights
  - job postings and talent profiles
- Added regression coverage for public endpoints and recruitment permissions
- Added recruitment workflow coverage for talent profile creation/update, verification, application visibility, and recruiter filtering
- Added insights coverage for public filtering/search, editorial draft management, publish/unpublish, and ingestion tasks
- Confirmed `python manage.py check` and `python manage.py test` pass

## Remaining Work
The following items are still pending from the planned architecture:

### Authentication & authorization
- User registration and login flow [implemented]
- Role-based access control for public, talent, recruiter, content editor, and admin [partially implemented with model roles, reusable permission helpers, and endpoint-level checks]
- Centralized reusable DRF permission classes for admin, recruiter, and content editor roles [implemented]
- Social login integration for Google and LinkedIn [pending]
- Optional MFA and security hardening [pending]

### Recruitment & talent platform
- Job posting model expanded with salary, location, and experience fields [implemented]
- Talent profile model expanded with experience and verification fields [implemented]
- Job application workflow added [implemented]
- Recruiter-facing job/application endpoints prepared [implemented for creation, listing, filtering, and status/notes updates]
- Talent profile create/update workflow [implemented]
- Talent profile verification workflow [implemented]
- Application status lifecycle [implemented with submitted, reviewing, shortlisted, rejected, and hired statuses]
- Applicant tracking views [partially implemented through application list/detail APIs]

### Insights & editorial content
- Insight model expanded with author, tags, and reading-time metadata [implemented]
- Draft and publish workflow support prepared through dedicated API endpoints [implemented]
- Public article listing and detail endpoints available [implemented]
- Public insight filtering/search [implemented]
- Editorial create/update/delete contract [implemented]
- Publish/unpublish API contract [implemented]
- Celery-backed ingestion task wrapper [implemented]
- Real external news provider integration [pending]
- Wagtail editorial workflow/CMS integration [pending]

### Content management
- Expand the website content model for richer pages and SEO fields [implemented]
- Add more structured content blocks for the homepage and services [implemented]
- Prepare for future CMS integration such as Wagtail

### Insights section
- Add richer moderation approval states beyond draft/published [implemented]
- Add normalized category/tag/author models when editorial needs outgrow simple fields [implemented]
- Add real NewsAPI/GNews/RSS provider clients [implemented with env-key driven NewsAPI/GNews and keyless RSS support]

### Recruitment system
- Add recruiter dashboard summary endpoints [implemented]
- Add talent search and filtering [implemented]
- Add richer applicant tracking history and notifications [implemented]

### API and integrations
- Add authentication-protected API endpoints [implemented for user profile, editorial, recruitment, and role-management workflows]
- Add public OpenAPI schema/docs for frontend integration [implemented]
- Connect external news/job ingestion services [partially implemented with configured insight sources and job sync service]
- Add Celery beat schedules for recurring automation [implemented for configured insight ingestion]
- Add caching and performance optimization

### Deployment and production readiness
- Move from SQLite to PostgreSQL
- Expand Docker support with PostgreSQL and Celery worker services
- Add environment-based configuration
- Add CI/CD pipeline
- Add monitoring, logging, and security settings

## Latest Foundation Cleanup
- Fixed public/private API boundaries for the current MVP endpoints
- Fixed `/api/website/about/` so it no longer requires a primary key in the URL
- Saved applicant cover letters during job application creation
- Restricted application detail access to the applicant, recruiter, staff, or admin users
- Registered job applications in Django admin
- Increased test coverage from 16 to 23 backend tests

## Recruitment Workflow Milestone
- Added reusable role permission classes in `apps.core.permissions`
- Added `GET`, `POST`, and `PATCH` support for authenticated users at `/api/recruitment/talents/me/`
- Automatically promotes a public user to the talent role after creating a talent profile
- Added recruiter/admin verification for talent profiles at `/api/recruitment/talents/<id>/verify/`
- Added `/api/recruitment/applications/` for applicant-owned application lists and recruiter/admin application management
- Added application filtering by job, status, and applicant for recruiter/admin users
- Formalized application statuses: submitted, reviewing, shortlisted, rejected, and hired
- Increased test coverage from 23 to 29 backend tests

## Insights Editorial & Ingestion Milestone
- Split public and editorial insight serializers so source/raw ingestion metadata is editor-only
- Added public filtering/search on `/api/insights/` using `category`, `tag`, and `q`
- Added editor-only draft list/create at `/api/insights/drafts/`
- Added editor-only retrieve/update/delete at `/api/insights/editor/<slug>/`
- Added explicit publish and unpublish endpoints
- Imported external insights now default to drafts for human review
- Added `sync_external_insights_task` Celery task for queued ingestion
- Increased test coverage from 29 to 34 backend tests

## API Schema & Frontend Readiness Milestone
- Made `/api/schema/` explicitly public while keeping the default API permission policy authenticated
- Added DRF OpenAPI runtime dependencies: PyYAML, inflection, and uritemplate
- Added regression coverage for schema generation and unique OpenAPI operation IDs
- Gave editorial insight detail operations distinct OpenAPI IDs from public insight detail operations
- Increased test coverage from 34 to 35 backend tests

## Content, Recruitment & Insights Expansion Milestone
- Added SEO metadata to homepage, about page, and service content
- Added ordered homepage content sections for CMS-ready frontend composition
- Added detailed service page fields and a public service detail endpoint
- Added recruiter dashboard metrics at `/api/recruitment/dashboard/`
- Added talent directory filters for specialization, location, availability, minimum experience, verification, and search
- Added application status history records and applicant notifications for submissions/status changes
- Added notification list/detail APIs for authenticated users
- Added normalized insight categories, tags, authors, and configured external sources
- Added insight moderation statuses and an editor moderation endpoint
- Added RSS parsing plus NewsAPI/GNews-compatible provider fetchers using environment-based API keys
- Added hourly Celery Beat scheduling for configured insight ingestion
- Expanded Docker Compose with Celery worker and Celery Beat services
- Increased test coverage from 35 to 50 backend tests

## Notes for Future Updates
This file should be updated whenever:
- a major feature is completed
- a new architecture decision is made
- deployment or infrastructure work is added
- the scope of the backend changes significantly

## Next Recommended Step
The next recommended milestone is auth/security, deployment hardening, and frontend readiness polish: social login/MFA, PostgreSQL Docker support, CI/CD, caching, response contract consistency, and seed data.
