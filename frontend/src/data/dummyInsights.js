export const insightCategories = [
  { id: 'all', label: 'All' },
  { id: 'politics', label: 'Politics' },
  { id: 'economy', label: 'Business' },
  { id: 'security', label: 'Security' },
  { id: 'human_rights', label: 'Human Rights' },
  { id: 'global_trends', label: 'Related Topics' },
];

/** Shape mirrors backend InsightSerializer for easy API swap later. */
export const dummyInsights = [
  {
    id: 1,
    slug: 'arctic-trade-routes-reshape-northern-strategy',
    title: 'How Arctic Trade Routes Are Reshaping Northern Strategy',
    summary:
      'Governments and investors are reassessing access, security, and environmental risk as polar shipping lanes open new corridors for commerce.',
    category: 'politics',
    author_name: 'Amara Ndungu',
    published_at: '2026-06-12T09:00:00Z',
    read_time_minutes: 7,
    image: '/images/service-global-strategy.jpg',
    source_name: 'Traviona Editorial',
  },
  {
    id: 2,
    slug: 'emerging-market-currency-volatility-outlook',
    title: 'Emerging Market Currency Volatility: What Leaders Should Watch',
    summary:
      'Central bank decisions, commodity flows, and capital movement patterns are creating uneven pressure across frontier and developing economies.',
    category: 'economy',
    author_name: 'Daniel Mercer',
    published_at: '2026-06-08T14:30:00Z',
    read_time_minutes: 6,
    image: '/images/service-risk-advisory.avif',
    source_name: 'Traviona Editorial',
  },
  {
    id: 3,
    slug: 'maritime-security-and-critical-shipping-corridors',
    title: 'Maritime Security and the Future of Critical Shipping Corridors',
    summary:
      'Naval posture, private security partnerships, and regional alliances are influencing how firms evaluate supply chain resilience at sea.',
    category: 'security',
    author_name: 'Capt. Elena Rostova',
    published_at: '2026-06-03T11:15:00Z',
    read_time_minutes: 8,
    image: '/images/service-geopolitical.avif',
    source_name: 'Traviona Editorial',
  },
  {
    id: 4,
    slug: 'human-rights-due-diligence-in-cross-border-investment',
    title: 'Human Rights Due Diligence in Cross-Border Investment',
    summary:
      'Institutional investors and operators face rising expectations to document social impact, labor standards, and governance risk in new markets.',
    category: 'human_rights',
    author_name: 'Priya Shah',
    published_at: '2026-05-28T16:45:00Z',
    read_time_minutes: 5,
    image: '/images/service-public-affairs.avif',
    source_name: 'Traviona Editorial',
  },
];
