# Traviona

Traviona is a Django-based enterprise platform for a modern consulting firm. It unifies the firm’s public presence, editorial publishing, and recruitment operations into a scalable backend foundation designed for international deployment and long-term growth.

## Overview
Traviona is designed to support a consulting organization that needs to:
- present its services, expertise, and brand with a professional digital presence
- publish thought leadership, market insights, and curated editorial content
- manage recruitment pipelines and professional talent profiles at enterprise scale
- operate from a robust backend that can support a full web application and API-driven services across teams and regions

## Core Product Areas
### 1. Company and website presence
- public-facing content for the firm
- service and about-page structure
- reusable content modules for future frontend integration

### 2. Insights and editorial publishing
- articles and editorial content around global issues and professional themes
- structured categories and metadata
- support for future publishing workflows and content management

### 3. Recruitment and talent network
- job postings
- talent profiles
- role-based business workflows for hiring and professional networking

### 4. Users and access control
- secure authentication and user management
- role-based access for different business functions
- extensible foundation for admins, recruiters, editors, and talent users

## Architecture
The project is organized as a modular Django backend with dedicated apps for each business domain:
- core for shared infrastructure
- website for company content
- insights for editorial content
- recruitment for jobs and talent profiles
- users for authentication and account management

## Technology Stack
### Backend
- Python 3.11+
- Django
- Django REST Framework
- Pillow for media handling
- SQLite for local development

### Target production stack
- PostgreSQL
- Redis
- Celery
- Docker
- CI/CD pipelines
- JWT-based authentication for API access
- Wagtail CMS as an optional editorial layer

## Project Structure
```text
Traviona/
├── backend/
│   ├── apps/
│   │   ├── core/
│   │   ├── website/
│   │   ├── insights/
│   │   ├── recruitment/
│   │   └── users/
│   ├── config/
│   └── manage.py
├── traviona images/
├── Traviona wireframes/
├── PROJECT_PROGRESS.md
└── README.md
```

## Getting Started
### 1. Activate the virtual environment
```powershell
cd C:\Users\User\Downloads\Traviona
.venv\Scripts\Activate.ps1
```

### 2. Enter the backend folder
```powershell
cd backend
```

### 3. Install dependencies
```powershell
python -m pip install -r requirements.txt
```

### 4. Run migrations
```powershell
python manage.py migrate
```

### 5. Start the development server
```powershell
python manage.py runserver
```

## Current Status
The backend foundation is in place with modular applications, database migrations, authentication support, and structured content and recruitment models. The project is being built as a complete enterprise platform rather than a lightweight prototype.

## Documentation
- [PROJECT_PROGRESS.md](PROJECT_PROGRESS.md) for implementation milestones and ongoing development notes
- [README.md](README.md) for the project overview and setup guidance
