from django.core.management.base import BaseCommand

from apps.insights.models import ExternalInsightSource, Insight
from apps.insights.services import sync_configured_external_sources


class Command(BaseCommand):
    help = 'Sync insights from configured external sources (NewsAPI, RSS, GNews).'

    def handle(self, *args, **options):
        active_sources = ExternalInsightSource.objects.filter(is_active=True).count()
        if active_sources == 0:
            self.stdout.write(self.style.WARNING('No active external insight sources configured.'))
            return

        created, updated = sync_configured_external_sources()
        published = Insight.objects.filter(is_published=True).count()
        self.stdout.write(
            self.style.SUCCESS(
                f'Sync complete: {created} new, {updated} updated. {published} published insight(s) in database.'
            )
        )
