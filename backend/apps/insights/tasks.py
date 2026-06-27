from celery import shared_task

from .services import sync_configured_external_sources, sync_external_insights


@shared_task
def sync_external_insights_task(payloads):
    return sync_external_insights(payloads)


@shared_task
def sync_configured_external_insights_task():
    return sync_configured_external_sources()
