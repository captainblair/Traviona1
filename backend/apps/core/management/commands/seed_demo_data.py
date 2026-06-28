from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.insights.models import ExternalInsightSource, Insight, InsightAuthor, InsightCategory, InsightTag
from apps.recruitment.models import ExternalJobSource, JobPosting, TalentProfile
from apps.website.models import AboutPage, ContactInformation, GlobalPresence, HomePage, HomePageSection, LeadershipMember, Service

WEBSITE_SERVICES = [
    {
        'slug': 'global-strategy',
        'name': 'Global Strategy',
        'short_description': 'Market entry, geopolitical positioning, and growth counsel.',
        'description': 'Clarity and direction for organizations expanding, investing, or repositioning across international markets.',
        'detailed_description': (
            "Traviona's Global Strategy practice helps leadership teams translate complex international dynamics into actionable growth plans. "
            'We work with boards, executives, and investors who need a disciplined view of where opportunity is real, where risk is rising, and how to sequence decisions across markets with different regulatory, political, and commercial realities.\n\n'
            'Our advisors combine country-level insight with sector expertise to support market entry, portfolio prioritization, partnership strategy, and long-range planning. '
            'Whether you are evaluating a new region, restructuring a global footprint, or preparing for a major transaction, we provide structured analysis that connects macro trends to operational choices.\n\n'
            'Engagements typically include market screening, competitive positioning, scenario planning, and executive-ready recommendations supported by evidence from our research network. '
            'We do not deliver generic slide decks; we help decision-makers understand trade-offs, timing, and the stakeholders who will shape outcomes.\n\n'
            'Clients choose Traviona when they need counsel that is rigorous, globally informed, and grounded in the practical realities of doing business across borders. '
            "We partner closely with your internal teams to ensure strategy is credible, communicable, and ready for implementation."
        ),
        'icon_name': 'globe',
        'display_order': 1,
        'metadata': {
            'image': '/images/service-global-strategy.jpg',
            'subheadline': 'Clarity and direction for organizations expanding, investing, or repositioning across international markets.',
            'benefits': [
                {'label': 'Market entry and expansion roadmaps', 'icon': 'globe'},
                {'label': 'Portfolio and regional prioritization', 'icon': 'layers'},
                {'label': 'Scenario planning for leadership teams', 'icon': 'chart'},
                {'label': 'Executive briefings and board support', 'icon': 'briefcase'},
            ],
            'whyChoose': [
                'Cross-border experience across Africa, Europe, the Americas, and Asia-Pacific',
                'Integrated view of commercial, political, and reputational factors',
                'Deliverables designed for real decisions—not theoretical frameworks',
                "Access to specialist analysts and in-market advisors through Traviona's network",
            ],
        },
    },
    {
        'slug': 'public-affairs',
        'name': 'Public Affairs',
        'short_description': 'Policy intelligence and stakeholder strategy for complex systems.',
        'description': 'Navigate policy change, institutional relationships, and public scrutiny with confidence and foresight.',
        'detailed_description': (
            'Public Affairs at Traviona supports organizations operating in environments where government action, regulatory change, and public debate can materially affect strategy. '
            'We help clients understand how policy is made, who influences outcomes, and how to engage responsibly with institutions, regulators, and communities.\n\n'
            'Our team monitors legislative and regulatory developments, maps stakeholder landscapes, and designs engagement strategies aligned with commercial objectives and corporate values. '
            'From market access and licensing to infrastructure, energy, technology, and financial services, we provide intelligence that helps leaders anticipate shifts before they become crises.\n\n'
            'We advise on messaging, coalition building, and issue management while maintaining a clear-eyed view of political risk. '
            'Our work is particularly valuable for multinationals, investors, and NGOs navigating multi-jurisdiction policy environments where local context determines success.\n\n'
            'Traviona combines research discipline with practical advisory support. '
            'We help you move from reactive firefighting to proactive public affairs planning—so your organization can participate in policy conversations with credibility and strategic intent.'
        ),
        'icon_name': 'shield',
        'display_order': 2,
        'metadata': {
            'image': '/images/service-public-affairs.avif',
            'subheadline': 'Navigate policy change, institutional relationships, and public scrutiny with confidence and foresight.',
            'benefits': [
                {'label': 'Policy and regulatory monitoring', 'icon': 'shield'},
                {'label': 'Stakeholder mapping and engagement plans', 'icon': 'users'},
                {'label': 'Issue and reputation risk assessment', 'icon': 'alert'},
                {'label': 'Government and institutional liaison support', 'icon': 'handshake'},
            ],
            'whyChoose': [
                'Deep familiarity with emerging-market and OECD policy systems',
                'Analysts with backgrounds in government, diplomacy, and corporate affairs',
                'Ethical, transparent approach to stakeholder engagement',
                'Rapid-turnaround intelligence for fast-moving political cycles',
            ],
        },
    },
    {
        'slug': 'risk-advisory',
        'name': 'Risk Advisory',
        'short_description': 'Risk visibility, operating plans, and executive support.',
        'description': 'Identify, prioritize, and manage risk across markets, operations, and strategic investments.',
        'detailed_description': (
            "Traviona's Risk Advisory practice helps organizations see risk clearly and respond with resilience. "
            'We support executives, security leaders, and investment teams who must make high-stakes decisions in environments shaped by political instability, security threats, supply chain disruption, and regulatory uncertainty.\n\n'
            'Our work spans enterprise risk assessments, country and site-level reviews, due diligence support, and crisis preparedness. '
            'We translate complex threat landscapes into prioritized actions—what to monitor, what to mitigate, and what requires immediate leadership attention.\n\n'
            'We integrate open-source intelligence, expert judgment, and client-specific operational knowledge. '
            'Recommendations are tailored to your sector, footprint, and risk appetite, whether you are entering a new market, protecting assets, or evaluating a partner or acquisition target.\n\n'
            'Risk advisory at Traviona is not about alarmism. '
            'It is about giving decision-makers the confidence to act—with a realistic understanding of exposure, mitigation options, and the indicators that should trigger escalation.'
        ),
        'icon_name': 'shield',
        'display_order': 3,
        'metadata': {
            'image': '/images/service-risk-advisory.avif',
            'subheadline': 'Identify, prioritize, and manage risk across markets, operations, and strategic investments.',
            'benefits': [
                {'label': 'Country and regional risk assessments', 'icon': 'map'},
                {'label': 'Investment and partner due diligence', 'icon': 'search'},
                {'label': 'Crisis and continuity planning', 'icon': 'shield'},
                {'label': 'Executive risk dashboards and monitoring', 'icon': 'chart'},
            ],
            'whyChoose': [
                'Practitioner-led analysis grounded in field insight',
                'Clear prioritization—focus on risks that matter to your business',
                'Coordination with legal, security, and communications teams',
                'Flexible support from one-off assessments to ongoing retainers',
            ],
        },
    },
    {
        'slug': 'geopolitical-shifts',
        'name': 'Geopolitical Shifts and Their Future',
        'short_description': 'Forward-looking analysis of regional and global power shifts.',
        'description': 'Anticipate how power, alliances, and competition will reshape the decade ahead.',
        'detailed_description': (
            "Geopolitical Shifts and Their Future is Traviona's forward-looking intelligence offering for leaders who need to understand how global order is changing—and what that means for strategy, investment, and security. "
            'We analyze the forces reshaping relations between major powers, regional blocs, and emerging economies.\n\n'
            'Our analysts track elections, conflict dynamics, trade realignments, technology competition, energy transitions, and institutional fragmentation. '
            'We connect these trends to concrete business implications: supply chain exposure, sanctions risk, market access, capital flows, and reputational considerations.\n\n'
            'Deliverables include strategic outlooks, regional deep dives, executive seminars, and bespoke briefings for boards and investment committees. '
            'We help clients move beyond headlines to structured scenarios that inform capital allocation, geographic strategy, and long-term planning.\n\n'
            "This practice draws on Traviona's editorial and research capabilities, combining timely analysis with disciplined forecasting methods. "
            'Organizations rely on us when they need a trusted partner to interpret geopolitical change—not as abstract theory, but as a driver of commercial and operational outcomes.'
        ),
        'icon_name': 'globe',
        'display_order': 4,
        'metadata': {
            'image': '/images/service-geopolitical.avif',
            'subheadline': 'Anticipate how power, alliances, and competition will reshape the decade ahead.',
            'benefits': [
                {'label': 'Global and regional outlook reports', 'icon': 'globe'},
                {'label': 'Scenario-based strategic forecasting', 'icon': 'layers'},
                {'label': 'Board and leadership briefings', 'icon': 'briefcase'},
                {'label': 'Election and transition monitoring', 'icon': 'chart'},
            ],
            'whyChoose': [
                "Research-led insights aligned with Traviona's Global Insights platform",
                'Multidisciplinary team spanning politics, economics, and security',
                'Clear linkage between macro trends and client-specific exposure',
                'Trusted by leaders who operate where geopolitics is a daily variable',
            ],
        },
    },
    {
        'slug': 'talent-network',
        'name': 'Talent Network',
        'short_description': 'Specialized consultants matched to strategic assignments.',
        'description': 'On-demand expertise for advisory projects, research, and high-impact assignments worldwide.',
        'detailed_description': (
            'The Traviona Talent Network connects clients with vetted consultants, analysts, and subject-matter experts who bring regional fluency and sector depth to complex assignments. '
            'When internal teams need additional capacity or specialized skills, we assemble professionals matched to the scope, timeline, and sensitivity of the work.\n\n'
            'Our network includes policy researchers, former public officials, industry specialists, and operational advisors across Africa, Europe, the Americas, and Asia-Pacific. '
            'Each profile is reviewed for experience, integrity, and fit before introduction to clients.\n\n'
            'We support short-term research tasks, multi-month advisory engagements, due diligence teams, and interim leadership roles. '
            'Traviona manages onboarding, confidentiality expectations, and quality standards so clients can move quickly without compromising governance.\n\n'
            'For independent experts, the Talent Network offers access to meaningful projects with international organizations, investors, and enterprises. '
            'For clients, it delivers flexible talent without the overhead of traditional search—accelerating delivery when decisions cannot wait.'
        ),
        'icon_name': 'users',
        'display_order': 5,
        'metadata': {
            'image': '/images/service-talent-network.jpg',
            'subheadline': 'On-demand expertise for advisory projects, research, and high-impact assignments worldwide.',
            'benefits': [
                {'label': 'Vetted experts by region and specialization', 'icon': 'users'},
                {'label': 'Rapid team assembly for urgent mandates', 'icon': 'briefcase'},
                {'label': 'Flexible engagement models', 'icon': 'layers'},
                {'label': 'Quality oversight and confidentiality standards', 'icon': 'shield'},
            ],
            'whyChoose': [
                'Curated network—not an open marketplace of unverified profiles',
                "Strong alignment with Traviona's advisory and research practices",
                'Transparent engagement terms and professional conduct expectations',
                'Scalable from a single analyst to multi-disciplinary project teams',
            ],
            'ctaHref': '/talent-network',
            'ctaLabel': 'Explore the Network',
        },
    },
]


LEADERSHIP_TEAM = [
    {
        'full_name': 'Dr. Tony Wangolo',
        'role_title': 'Managing Director',
        'bio': (
            'Leads Traviona’s advisory practice across Africa and global markets, helping boards and executives '
            'navigate political risk, regional strategy, and institutional partnerships.'
        ),
        'linkedin_url': 'https://www.linkedin.com/in/tony-wangolo-545b23285/',
        'headline': 'Managing Director',
        'specialization': 'Geopolitics',
        'location': 'Nairobi',
        'years_experience': 15,
        'availability': 'Advisory',
    },
    {
        'full_name': 'Dr. Yvette Oster',
        'role_title': 'Chief Strategy Officer',
        'bio': (
            'Shapes Traviona’s strategic advisory work for international organizations, translating complex market '
            'and policy signals into actionable growth and risk frameworks.'
        ),
        'linkedin_url': '',
        'headline': 'Chief Strategy Officer',
        'specialization': 'Strategy',
        'location': 'London',
        'years_experience': 14,
        'availability': 'Advisory',
    },
    {
        'full_name': 'James Okello',
        'role_title': 'Director, Global Affairs',
        'bio': (
            'Advises clients on stakeholder engagement, security risk, and cross-border affairs — supporting '
            'organizations operating in politically sensitive and fast-moving environments.'
        ),
        'linkedin_url': 'https://www.linkedin.com/in/tony-wangolo-545b23285/',
        'headline': 'Director, Global Affairs',
        'specialization': 'Public Affairs',
        'location': 'Nairobi',
        'years_experience': 12,
        'availability': 'Advisory',
    },
    {
        'full_name': 'Sarah Chen',
        'role_title': 'Head of Talent Network',
        'bio': (
            'Builds and curates Traviona’s specialist network, matching analysts and advisors to client mandates '
            'across frontier markets, due diligence, and interim leadership needs.'
        ),
        'linkedin_url': '',
        'headline': 'Head of Talent Network',
        'specialization': 'Market Intelligence',
        'location': 'Singapore',
        'years_experience': 11,
        'availability': 'Advisory',
    },
]


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

        for service_data in WEBSITE_SERVICES:
            slug = service_data['slug']
            Service.objects.update_or_create(
                slug=slug,
                defaults={
                    'name': service_data['name'],
                    'short_description': service_data['short_description'],
                    'description': service_data['description'],
                    'detailed_description': service_data['detailed_description'],
                    'icon_name': service_data['icon_name'],
                    'metadata': service_data['metadata'],
                    'display_order': service_data['display_order'],
                    'is_active': True,
                },
            )

        for index, member in enumerate(LEADERSHIP_TEAM, start=1):
            LeadershipMember.objects.update_or_create(
                full_name=member['full_name'],
                defaults={
                    'role_title': member['role_title'],
                    'bio': member['bio'],
                    'linkedin_url': member['linkedin_url'],
                    'display_order': index,
                    'is_active': True,
                },
            )

        LeadershipMember.objects.filter(full_name='Traviona Advisory Lead').update(is_active=False)
        ContactInformation.objects.update_or_create(
            label='Main office',
            defaults={'email': 'info@travionaconsulting.top', 'phone': '+254 111 414 4441', 'address': 'Nairobi, Kenya', 'is_active': True},
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

        insight_categories = {
            'global_trends': InsightCategory.objects.get_or_create(
                name='Global Trends',
                defaults={'slug': 'global-trends'},
            )[0],
            'politics': InsightCategory.objects.get_or_create(
                name='Politics',
                defaults={'slug': 'politics'},
            )[0],
            'economy': InsightCategory.objects.get_or_create(
                name='Economy',
                defaults={'slug': 'economy'},
            )[0],
            'security': InsightCategory.objects.get_or_create(
                name='Security',
                defaults={'slug': 'security'},
            )[0],
            'human_rights': InsightCategory.objects.get_or_create(
                name='Human Rights',
                defaults={'slug': 'human-rights'},
            )[0],
        }

        external_insight_sources = [
            {
                'name': 'NewsAPI Kenya Headlines',
                'provider': 'newsapi',
                'endpoint_url': 'https://newsapi.org/v2/top-headlines?country=ke&pageSize=30',
                'api_key_env': 'NEWSAPI_API_KEY',
                'default_category': insight_categories['global_trends'],
            },
            {
                'name': 'NewsAPI Global Business',
                'provider': 'newsapi',
                'endpoint_url': 'https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=30',
                'api_key_env': 'NEWSAPI_API_KEY',
                'default_category': insight_categories['economy'],
            },
            {
                'name': 'BBC World RSS',
                'provider': 'rss',
                'endpoint_url': 'https://feeds.bbci.co.uk/news/world/rss.xml',
                'default_category': insight_categories['global_trends'],
            },
            {
                'name': 'BBC Business RSS',
                'provider': 'rss',
                'endpoint_url': 'https://feeds.bbci.co.uk/news/business/rss.xml',
                'default_category': insight_categories['economy'],
            },
            {
                'name': 'Guardian World RSS',
                'provider': 'rss',
                'endpoint_url': 'https://www.theguardian.com/world/rss',
                'default_category': insight_categories['politics'],
            },
            {
                'name': 'Guardian Business RSS',
                'provider': 'rss',
                'endpoint_url': 'https://www.theguardian.com/business/rss',
                'default_category': insight_categories['economy'],
            },
            {
                'name': 'Guardian Global Development RSS',
                'provider': 'rss',
                'endpoint_url': 'https://www.theguardian.com/global-development/rss',
                'default_category': insight_categories['human_rights'],
            },
        ]
        for source in external_insight_sources:
            ExternalInsightSource.objects.update_or_create(
                name=source['name'],
                defaults={
                    'provider': source['provider'],
                    'endpoint_url': source['endpoint_url'],
                    'api_key_env': source.get('api_key_env', ''),
                    'default_category': source['default_category'],
                    'is_active': True,
                },
            )

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

        ExternalJobSource.objects.update_or_create(
            name='MyJobMag Kenya',
            defaults={
                'provider': 'myjobmag',
                'endpoint_url': 'https://www.myjobmag.co.ke/jobs?max_pages=5',
                'default_location': 'Kenya',
                'default_employment_type': 'full_time',
                'is_active': True,
            },
        )

        adzuna_sources = [
            {
                'name': 'Adzuna United Kingdom',
                'endpoint_url': 'https://api.adzuna.com/v1/api/jobs/gb/search/1?results_per_page=50&max_pages=2',
                'default_location': 'United Kingdom',
            },
            {
                'name': 'Adzuna United States',
                'endpoint_url': 'https://api.adzuna.com/v1/api/jobs/us/search/1?results_per_page=50&max_pages=2',
                'default_location': 'United States',
            },
            {
                'name': 'Adzuna South Africa',
                'endpoint_url': 'https://api.adzuna.com/v1/api/jobs/za/search/1?results_per_page=50&max_pages=2',
                'default_location': 'South Africa',
            },
        ]
        for source in adzuna_sources:
            ExternalJobSource.objects.update_or_create(
                name=source['name'],
                defaults={
                    'provider': 'adzuna',
                    'endpoint_url': source['endpoint_url'],
                    'api_key_env': 'ADZUNA_APP_ID',
                    'api_secret_env': 'ADZUNA_APP_KEY',
                    'default_location': source['default_location'],
                    'default_employment_type': 'full_time',
                    'is_active': True,
                },
            )

        for member in LEADERSHIP_TEAM:
            TalentProfile.objects.update_or_create(
                full_name=member['full_name'],
                defaults={
                    'headline': member['headline'],
                    'specialization': member['specialization'],
                    'location': member['location'],
                    'bio': member['bio'],
                    'years_experience': member['years_experience'],
                    'availability': member['availability'],
                    'is_public': True,
                    'is_verified': True,
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
                'is_public': False,
                'is_verified': True,
            },
        )

        self.stdout.write(self.style.SUCCESS('Demo data seeded.'))
