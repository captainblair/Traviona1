from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.insights.models import Insight, InsightAuthor, InsightCategory, InsightTag
from apps.recruitment.models import JobPosting, TalentProfile
from apps.website.models import AboutPage, ContactInformation, GlobalPresence, HomePage, HomePageSection, LeadershipMember, Service


class Command(BaseCommand):
    help = 'Create demo content for local frontend development.'

    def handle(self, *args, **options):
        User = get_user_model()

        HomePage.objects.update_or_create(
            title='Traviona',
            defaults={
                'subtitle': 'Strategic advisory for complex global decisions.',
                'seo_title': 'Traviona Consulting',
                'seo_description': 'Traviona provides advisory, insights, and talent solutions.',
                'is_active': True,
            },
        )
        home = HomePage.objects.filter(title='Traviona').first()
        HomePageSection.objects.update_or_create(
            home_page=home,
            title='Global advisory built for movement',
            defaults={
                'section_type': 'overview',
                'body': 'We help organizations understand risk, opportunity, and operating realities across markets.',
                'display_order': 1,
                'is_active': True,
            },
        )

        AboutPage.objects.update_or_create(
            title='About Traviona',
            defaults={
                'summary': 'Traviona combines strategy, research, and operational support.',
                'content': 'Our teams support organizations navigating complex political, economic, and human environments.',
                'seo_title': 'About Traviona',
                'is_active': True,
            },
        )

        Service.objects.update_or_create(
            name='Risk Advisory',
            defaults={
                'short_description': 'Practical risk intelligence and decision support.',
                'description': 'Risk advisory for organizations operating across complex environments.',
                'detailed_description': 'We combine research, field insight, and strategic planning to guide resilient decisions.',
                'outcomes': 'Sharper risk visibility, stronger operating plans, and clearer leadership decisions.',
                'process': 'Discover, assess, advise, support.',
                'icon_name': 'shield',
                'seo_title': 'Risk Advisory',
                'display_order': 1,
                'is_active': True,
            },
        )

        LeadershipMember.objects.update_or_create(
            full_name='Traviona Advisory Lead',
            defaults={'role_title': 'Managing Partner', 'bio': 'Leads multidisciplinary advisory teams.', 'display_order': 1, 'is_active': True},
        )
        ContactInformation.objects.update_or_create(
            label='Main office',
            defaults={'email': 'info@travionaconsulting.com', 'phone': '+254 700 000 000', 'address': 'Nairobi, Kenya', 'is_active': True},
        )
        GlobalPresence.objects.update_or_create(
            region='East Africa',
            defaults={'summary': 'Regional advisory and talent network coverage.', 'display_order': 1, 'is_active': True},
        )

        category, _ = InsightCategory.objects.get_or_create(name='Global Trends')
        tag, _ = InsightTag.objects.get_or_create(name='Strategy')
        author, _ = InsightAuthor.objects.get_or_create(name='Traviona Desk', defaults={'title': 'Editorial Team'})
        insight, _ = Insight.objects.update_or_create(
            title='Global strategy briefing',
            defaults={
                'summary': 'A concise look at strategic shifts shaping organizations.',
                'content': 'Traviona tracks global shifts across politics, markets, security, and society.',
                'category': 'global_trends',
                'category_ref': category,
                'author': author,
                'author_name': author.name,
                'tags': 'strategy,global trends',
                'moderation_status': 'published',
                'is_published': True,
            },
        )
        insight.tag_refs.add(tag)

        recruiter, _ = User.objects.get_or_create(username='demo_recruiter', defaults={'email': 'recruiter@traviona.local', 'role': 'recruiter'})
        if not recruiter.has_usable_password():
            recruiter.set_password('StrongPass123!')
            recruiter.save(update_fields=['password'])
        talent_user, _ = User.objects.get_or_create(username='demo_talent', defaults={'email': 'talent@traviona.local', 'role': 'talent'})
        if not talent_user.has_usable_password():
            talent_user.set_password('StrongPass123!')
            talent_user.save(update_fields=['password'])

        JobPosting.objects.update_or_create(
            title='Research Consultant',
            defaults={
                'summary': 'Support research and advisory projects.',
                'description': 'Work with Traviona teams on policy, market, and risk analysis.',
                'location': 'Remote',
                'employment_type': 'contract',
                'experience_level': 'Mid-level',
                'is_active': True,
            },
        )
        TalentProfile.objects.update_or_create(
            user=talent_user,
            defaults={
                'full_name': 'Demo Talent',
                'headline': 'Research and strategy consultant',
                'specialization': 'Policy research',
                'location': 'Nairobi',
                'years_experience': 5,
                'availability': 'Immediate',
                'is_public': True,
                'is_verified': True,
            },
        )

        self.stdout.write(self.style.SUCCESS('Demo data seeded.'))
