from celery import shared_task

from apps.insights.tasks import sync_external_insights_task


@shared_task
def sync_external_content():
    sync_external_insights_task.delay([])
    return 'External content sync tasks queued successfully.'
