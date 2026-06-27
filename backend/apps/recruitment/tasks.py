from celery import shared_task

from .services import sync_configured_external_jobs, sync_external_jobs


@shared_task
def sync_external_jobs_task(payloads):
    return sync_external_jobs(payloads)


@shared_task
def sync_configured_external_jobs_task():
    return sync_configured_external_jobs()
