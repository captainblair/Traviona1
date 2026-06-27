from celery import shared_task

from .services import sync_external_insights


@shared_task
def sync_external_insights_task(payloads):
    return sync_external_insights(payloads)
