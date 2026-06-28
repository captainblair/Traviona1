from django.core.management.base import BaseCommand

from apps.recruitment.models import ExternalJobSource, JobPosting
from apps.recruitment.services import sync_configured_external_jobs


class Command(BaseCommand):
    help = 'Sync job postings from configured external sources (APIs and scrapers).'

    def handle(self, *args, **options):
        active_sources = ExternalJobSource.objects.filter(is_active=True).count()
        if active_sources == 0:
            self.stdout.write(self.style.WARNING('No active external job sources configured.'))
            return

        created, updated, deactivated = sync_configured_external_jobs()
        total = JobPosting.objects.filter(is_active=True).count()
        self.stdout.write(
            self.style.SUCCESS(
                f'Sync complete: {created} new, {updated} updated, {deactivated} deactivated. '
                f'{total} active job(s) in database.'
            )
        )
