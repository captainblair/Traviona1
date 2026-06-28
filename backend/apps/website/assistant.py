"""Traviona Assistant — system prompt, local fallback, and LLM streaming."""

import json
import re
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings

ASSISTANT_SYSTEM_PROMPT = """You are Traviona Assistant, the official AI guide for Traviona Consulting (https://travionaconsulting.top).

ROLE
- Help visitors understand Traviona's services, insights, careers, and talent network.
- Offer high-level context on global affairs and geopolitical trends relevant to business and policy audiences.
- Be warm, professional, concise, and trustworthy. Never invent specific client names, contracts, or confidential details.

COMPANY OVERVIEW
Traviona Consulting provides strategic international business consulting, political intelligence, and specialist talent for organizations operating across borders. Offices and presence span Nairobi, London, Washington DC, and Singapore.

SERVICES (direct users to /services/{slug} on the website when relevant)
1. Global Strategy — market entry, geopolitical positioning, growth counsel, scenario planning, board support.
2. Public Affairs — policy intelligence, stakeholder mapping, regulatory monitoring, reputation and issue management.
3. Risk Advisory — country risk, due diligence, crisis preparedness, enterprise risk assessments.
4. Geopolitical Shifts and Their Future — forward-looking analysis of power shifts, alliances, elections, trade realignments.
5. Talent Network — vetted analysts and advisors matched to advisory, research, and interim leadership assignments.

INSIGHTS
- Traviona publishes curated global insights on politics, economy, security, human rights, and global trends at /insights.
- Summarize themes at a high level; for the latest articles, encourage visiting the Insights page rather than fabricating headlines.

CAREERS & RECRUITMENT
- Open roles are listed at /careers (MyJobMag Kenya, Adzuna, and other synced sources).
- Encourage qualified candidates to browse careers or contact Traviona for advisory and research roles.

TALENT NETWORK
- Founding leadership experts are featured at /talent-network.
- To join or request an introduction: /contact?topic=talent or browse the Talent Network page.

CONTACT
- General enquiries: /contact or info@travionaconsulting.top

GUARDRAILS
- Do not provide legal, investment, or personal security advice as definitive professional counsel; suggest speaking with Traviona advisors.
- For current events, give balanced, general analysis and note that situations evolve quickly.
- If unsure, say so and point to the relevant Traviona page or contact option.
- Keep replies focused (roughly 2–4 short paragraphs unless the user asks for detail).
"""

LOCAL_SERVICE_REPLY = """Traviona offers five advisory practices:

1. Global Strategy — market entry, geopolitical positioning, growth counsel, and scenario planning for boards and executives.
2. Public Affairs — policy intelligence, stakeholder mapping, regulatory monitoring, and issue management.
3. Risk Advisory — country risk, due diligence, crisis preparedness, and enterprise risk assessments.
4. Geopolitical Shifts and Their Future — forward-looking analysis of power shifts, elections, trade realignments, and alliances.
5. Talent Network — vetted analysts and advisors matched to research, advisory, and interim leadership assignments.

Explore each service on our website under Services, or contact us at /contact for a tailored conversation."""

LOCAL_GEOPOLITICS_REPLY = """Traviona tracks geopolitical themes that shape business and policy decisions, including:

- Shifting great-power competition and trade realignments
- Elections, transitions, and institutional fragmentation
- Regional security, sanctions, and supply-chain exposure
- Energy transitions and technology competition

For timely analysis, visit our Insights page (/insights), where we publish curated articles on politics, economy, security, human rights, and global trends. I can also connect you with Traviona advisors for bespoke briefings."""

LOCAL_TALENT_REPLY = """Traviona's Talent Network connects clients with vetted analysts, researchers, and advisors across Africa, Europe, the Americas, and Asia-Pacific.

To explore the network, visit /talent-network. To request an introduction or discuss joining as a specialist, use /contact?topic=talent or email info@travionaconsulting.top.

Our founding leadership team currently anchors the public directory while we expand verified experts globally."""

LOCAL_CAREERS_REPLY = """Open roles and assignments are listed on our Careers page (/careers), including opportunities synced from MyJobMag Kenya, Adzuna, and other sources.

If you are interested in advisory, research, or operational roles with Traviona, browse current listings or reach out via /contact?topic=careers with your background and areas of expertise."""

LOCAL_INSIGHTS_REPLY = """Traviona Insights publishes curated analysis on politics, economy, security, human rights, and global trends.

Visit /insights to browse the latest articles and filters by category. For deeper advisory support tied to your organization’s exposure, our team can prepare bespoke briefings through Global Strategy or Geopolitical Shifts engagements."""

LOCAL_CONTACT_REPLY = """You can reach Traviona through:

- Contact form: /contact
- Email: info@travionaconsulting.top
- Main office: Nairobi, Kenya (with global presence in London, Washington DC, and Singapore)

Tell us whether your enquiry is about advisory services, careers, or the talent network so we can route it quickly."""

LOCAL_GREETING_REPLY = """Hello — I'm Traviona Assistant. I can help with Traviona's services, global insights, careers, and talent network.

Try asking:
- What services do you offer?
- Tell me about latest geopolitical trends
- How can I join the talent network?"""

LOCAL_DEFAULT_REPLY = """I'm here to help with Traviona Consulting — our services, insights, careers, and talent network.

Ask about a specific topic, or visit /contact to speak with our team directly. For the latest published analysis, see /insights."""


def _assistant_runtime():
    provider = (getattr(settings, 'ASSISTANT_PROVIDER', '') or 'auto').lower()
    openai_key = getattr(settings, 'OPENAI_API_KEY', '') or ''
    xai_key = getattr(settings, 'XAI_API_KEY', '') or ''
    model = getattr(settings, 'ASSISTANT_MODEL', '') or ''

    if provider == 'openai' and openai_key:
        return 'openai', openai_key, model or 'gpt-4o-mini'
    if provider in {'xai', 'grok'} and xai_key:
        return 'xai', xai_key, model or 'grok-2-latest'
    if provider == 'auto':
        if xai_key:
            return 'xai', xai_key, model or 'grok-2-latest'
        if openai_key:
            return 'openai', openai_key, model or 'gpt-4o-mini'
    return None, '', ''


def assistant_is_configured():
    _provider, api_key, _model = _assistant_runtime()
    return bool(api_key)


def assistant_mode():
    return 'ai' if assistant_is_configured() else 'local'


def _matches(text, *patterns):
    return any(re.search(pattern, text) for pattern in patterns)


def build_local_reply(message):
    text = message.lower().strip()

    if _matches(text, r'\b(hi|hello|hey|good morning|good afternoon)\b'):
        return LOCAL_GREETING_REPLY
    if _matches(text, r'\b(service|services|offer|offerings|what do you do|practice)\b'):
        return LOCAL_SERVICE_REPLY
    if _matches(text, r'\b(geopolitic|political|global trend|current affairs|world affairs|macro)\b'):
        return LOCAL_GEOPOLITICS_REPLY
    if _matches(text, r'\b(talent network|join.*talent|expert network|become an expert|talent)\b'):
        return LOCAL_TALENT_REPLY
    if _matches(text, r'\b(career|careers|job|jobs|vacancy|vacancies|recruit|hiring|role)\b'):
        return LOCAL_CAREERS_REPLY
    if _matches(text, r'\b(insight|insights|article|articles|news|briefing)\b'):
        return LOCAL_INSIGHTS_REPLY
    if _matches(text, r'\b(contact|email|reach|speak with|get in touch|phone)\b'):
        return LOCAL_CONTACT_REPLY
    if _matches(text, r'\b(about|who is traviona|company|consulting)\b'):
        return (
            'Traviona Consulting provides strategic international business consulting, political intelligence, '
            'and specialist talent for organizations operating across borders. '
            'Learn more on our About page (/about) or ask me about services, insights, careers, or the talent network.'
        )

    return LOCAL_DEFAULT_REPLY


def _stream_text_deltas(text, chunk_size=18):
    for index in range(0, len(text), chunk_size):
        yield _sse({'delta': text[index:index + chunk_size]})


def _stream_local_reply(message):
    reply = build_local_reply(message)
    yield from _stream_text_deltas(reply)
    yield _sse({'done': True})


def _sse(payload):
    return f'data: {json.dumps(payload)}\n\n'


def _normalize_messages(messages):
    cleaned = []
    for item in messages[-12:]:
        role = item.get('role')
        content = (item.get('content') or '').strip()
        if role in {'user', 'assistant'} and content:
            cleaned.append({'role': role, 'content': content[:4000]})
    return cleaned


def stream_assistant_reply(messages):
    cleaned = _normalize_messages(messages)
    if not cleaned:
        yield _sse({'error': 'Please enter a message.'})
        yield _sse({'done': True})
        return

    provider, api_key, model = _assistant_runtime()
    if not api_key:
        last_user = next((item['content'] for item in reversed(cleaned) if item['role'] == 'user'), '')
        yield from _stream_local_reply(last_user)
        return

    endpoint = (
        'https://api.openai.com/v1/chat/completions'
        if provider == 'openai'
        else 'https://api.x.ai/v1/chat/completions'
    )

    payload = {
        'model': model,
        'messages': [{'role': 'system', 'content': ASSISTANT_SYSTEM_PROMPT}, *cleaned],
        'stream': True,
        'temperature': 0.55,
        'max_tokens': 900,
    }

    request = Request(
        endpoint,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        },
        method='POST',
    )

    try:
        with urlopen(request, timeout=120) as response:
            for raw_line in response:
                line = raw_line.decode('utf-8').strip()
                if not line.startswith('data:'):
                    continue
                data = line[5:].strip()
                if data == '[DONE]':
                    break
                try:
                    chunk = json.loads(data)
                    delta = chunk['choices'][0]['delta'].get('content', '')
                except (json.JSONDecodeError, KeyError, IndexError, TypeError):
                    continue
                if delta:
                    yield _sse({'delta': delta})
    except HTTPError as exc:
        detail = exc.read().decode('utf-8', errors='ignore')[:300]
        yield _sse({'error': f'Assistant provider error ({exc.code}). Please try again shortly.'})
        if settings.DEBUG and detail:
            yield _sse({'delta': f'\n\n[debug] {detail}'})
    except URLError:
        yield _sse({'error': 'Unable to reach the assistant service. Check your connection and try again.'})

    yield _sse({'done': True})
