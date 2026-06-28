from celery import shared_task

from .services import sync_configured_external_jobs, sync_external_jobs


@shared_task
def sync_external_jobs_task(payloads):
    created, updated, deactivated = sync_external_jobs(payloads)
    return {'created': created, 'updated': updated, 'deactivated': deactivated}


@shared_task
def sync_configured_external_jobs_task():
    created, updated, deactivated = sync_configured_external_jobs()
    return {'created': created, 'updated': updated, 'deactivated': deactivated}
