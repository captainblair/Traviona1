export const expertiseOptions = [
  { id: 'all', label: 'All expertise' },
  { id: 'geopolitics', label: 'Geopolitics' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'market-intelligence', label: 'Market Intelligence' },
  { id: 'cybersecurity', label: 'Cybersecurity' },
  { id: 'public-affairs', label: 'Public Affairs' },
];

export const locationOptions = [
  { id: 'all', label: 'All locations' },
  { id: 'london', label: 'London, UK' },
  { id: 'nairobi', label: 'Nairobi, Kenya' },
  { id: 'singapore', label: 'Singapore' },
  { id: 'remote', label: 'Remote' },
];

export const experienceOptions = [
  { id: 'all', label: 'All levels' },
  { id: 'entry', label: 'Entry level' },
  { id: 'mid', label: 'Mid-level' },
  { id: 'senior', label: 'Senior' },
  { id: 'lead', label: 'Lead / Principal' },
];

/** Mirrors backend JobPostingSerializer fields plus local requirements bullets. */
export const dummyJobs = [
  {
    id: 1,
    slug: 'geospatial-risk-analyst',
    title: 'Geospatial Risk Analyst',
    summary:
      'Support clients with spatial intelligence, hazard mapping, and location-based risk assessments for high-stakes advisory work.',
    description:
      'Traviona is seeking a Geospatial Risk Analyst to join our advisory team in London. You will translate satellite imagery, open-source data, and field intelligence into actionable risk briefings for corporate and institutional clients.\n\nWorking alongside geopolitical and security specialists, you will build map layers, monitor emerging hotspots, and contribute to client workshops and board-level reporting.',
    location: 'London, UK',
    location_key: 'london',
    employment_type: 'full_time',
    experience_level: 'Mid-level',
    experience_key: 'mid',
    expertise: 'geopolitics',
    salary_range: 'Competitive',
    requirements: [
      "Master's degree in GIS, geography, or related field",
      '3+ years experience in geospatial analysis',
      'Proficiency with QGIS or ArcGIS',
      'Strong written communication skills',
    ],
  },
  {
    id: 2,
    slug: 'strategy-consultant-apac',
    title: 'Strategy Consultant, APAC',
    summary:
      'Advise multinational clients on market entry, regional partnerships, and long-range strategy across Asia-Pacific markets.',
    description:
      'This role supports Traviona clients expanding or repositioning in APAC. You will lead discovery workshops, synthesize market intelligence, and produce executive-ready strategy memos.\n\nThe consultant works closely with our London and Singapore teams, coordinating research sprints and presenting findings to C-suite stakeholders.',
    location: 'London, UK',
    location_key: 'london',
    employment_type: 'contract',
    experience_level: 'Senior',
    experience_key: 'senior',
    expertise: 'strategy',
    salary_range: 'Day rate available',
    requirements: [
      '7+ years in management consulting or corporate strategy',
      'Fluency in APAC market dynamics',
      'Experience presenting to executive audiences',
      'Willingness to travel regionally',
    ],
  },
  {
    id: 3,
    slug: 'geopolitical-risk-analyst',
    title: 'Geopolitical Risk Analyst',
    summary:
      'Monitor political developments, sanctions exposure, and regional instability to inform client decision-making.',
    description:
      'As a Geopolitical Risk Analyst, you will produce timely assessments on elections, regulatory change, conflict spillover, and diplomatic shifts affecting Traviona clients.\n\nYou will contribute to daily monitoring notes, quarterly outlook reports, and bespoke briefings for boards and investment committees operating in volatile jurisdictions.',
    location: 'London, UK',
    location_key: 'london',
    employment_type: 'full_time',
    experience_level: 'Senior',
    experience_key: 'senior',
    expertise: 'geopolitics',
    salary_range: 'Competitive',
    requirements: [
      "Master's degree in Political Science, Economics, or International Relations",
      '5+ years experience in political risk or intelligence',
      'Data analysis and open-source research skills',
      'Excellent communication and client-facing presence',
    ],
  },
  {
    id: 4,
    slug: 'research-consultant',
    title: 'Research Consultant',
    summary:
      'Deliver policy, market, and risk research for cross-border advisory engagements on a flexible contract basis.',
    description:
      'Research Consultants at Traviona support project teams with structured literature reviews, stakeholder mapping, and evidence-based recommendations.\n\nThis remote-friendly role suits analysts who can move quickly across topics—from regulatory change to sector competitiveness—while maintaining Traviona quality standards.',
    location: 'Remote',
    location_key: 'remote',
    employment_type: 'contract',
    experience_level: 'Mid-level',
    experience_key: 'mid',
    expertise: 'market-intelligence',
    salary_range: 'Project-based',
    requirements: [
      'Strong research and synthesis skills',
      'Experience in policy, economics, or security analysis',
      'Ability to work independently across time zones',
      'Portfolio or writing samples preferred',
    ],
  },
];
