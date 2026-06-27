import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import ExpertPhoto from '../components/ExpertPhoto.jsx';
import Footer from '../components/Footer.jsx';
import TalentHero from '../components/TalentHero.jsx';
import { RevealItem, RevealSection } from '../components/reveal.jsx';
import { expertiseFilters } from '../data/dummyTalents.js';
import { fetchTalents } from '../lib/talentApi.js';

function ExpertTag({ label, primary = false }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[0.65rem] font-semibold sm:text-xs ${
        primary ? 'bg-tide/15 text-harbor' : 'bg-midnight/8 text-ink/70'
      }`}
    >
      {label}
    </span>
  );
}

function ExpertCard({ expert, index, compact = false }) {
  const {
    full_name,
    headline,
    bio,
    tags,
    image,
    imageHeight,
    imageWidth,
    imageTop,
    imageLeft,
    imageTransform,
    imagePosition,
  } = expert;

  if (compact) {
    return (
      <RevealItem
        delay={index * 70}
        as="article"
        className="flex min-w-0 gap-3 rounded-lg border border-ink/8 bg-white p-3 shadow-[0_10px_28px_rgba(7,19,31,0.06)]"
      >
        <ExpertPhoto
          name={full_name}
          image={image}
          compact
          imageHeight={imageHeight || '200%'}
          imageWidth={imageWidth || '120%'}
          imageTop={imageTop ?? '-15%'}
          imageLeft={imageLeft || '50%'}
          imageTransform={imageTransform || 'translateX(-50%)'}
          imagePosition={imagePosition || 'center 10%'}
        />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 font-display text-sm font-bold leading-5 text-ink">{full_name}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink/60">{headline}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.slice(0, 2).map((tag) => (
              <ExpertTag key={tag} label={tag} primary={tag === tags[0]} />
            ))}
          </div>
        </div>
      </RevealItem>
    );
  }

  return (
    <RevealItem
      delay={index * 90}
      as="article"
      className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-ink/8 bg-white shadow-[0_12px_32px_rgba(7,19,31,0.07)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(7,19,31,0.12)]"
    >
      <ExpertPhoto
        name={full_name}
        image={image}
        imageHeight={imageHeight || '100%'}
        imageWidth={imageWidth || '100%'}
        imageTop={imageTop || '0'}
        imageLeft={imageLeft || '0'}
        imageTransform={imageTransform}
        imagePosition={imagePosition || 'center top'}
      />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold leading-6 text-ink">{full_name}</h3>
        <p className="mt-1 text-sm text-ink/60">{headline}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag, tagIndex) => (
            <ExpertTag key={tag} label={tag} primary={tagIndex === 0} />
          ))}
        </div>
        <p className="mt-4 line-clamp-3 flex-1 text-sm leading-6 text-ink/65">{bio}</p>
        <button
          type="button"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-tide px-5 py-3 text-sm font-bold text-ink transition hover:bg-harbor hover:text-white"
        >
          View Profile
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </RevealItem>
  );
}

export default function TalentNetworkPage() {
  const [activeExpertise, setActiveExpertise] = useState('all');
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [experts, setExperts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadExperts() {
      setIsLoading(true);
      const results = await fetchTalents({ expertise: activeExpertise, query: searchTerm });
      if (!cancelled) {
        setExperts(results);
        setIsLoading(false);
      }
    }

    loadExperts();
    return () => {
      cancelled = true;
    };
  }, [activeExpertise, searchTerm]);

  return (
    <>
      <TalentHero
        query={query}
        onQueryChange={setQuery}
        onSearch={() => setSearchTerm(query)}
      />

      <RevealSection className="w-full max-w-full overflow-x-hidden bg-ivory px-4 pb-10 pt-0 sm:px-8 lg:px-10 lg:py-10">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
          <aside className="relative z-10 -mt-8 min-w-0 rounded-xl bg-midnight px-4 py-5 shadow-[0_18px_40px_rgba(7,19,31,0.18)] ring-1 ring-white/10 lg:mt-0 lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none lg:ring-0">
            <h2 className="font-display text-lg font-bold text-white lg:text-xl lg:text-ink">Expertise</h2>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-col lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
              {expertiseFilters.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveExpertise(id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-left text-sm font-semibold transition lg:w-full ${
                    activeExpertise === id
                      ? 'bg-tide text-ink'
                      : 'bg-white/10 text-white/80 ring-1 ring-white/12 hover:bg-white/16 hover:text-white lg:bg-white lg:text-ink/70 lg:ring-ink/10 lg:hover:bg-mist/60 lg:hover:text-ink'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </aside>

          <div className="min-w-0">
            <div className="rounded-xl border border-ink/8 bg-white px-4 py-4 shadow-[0_10px_28px_rgba(7,19,31,0.05)] lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-ink sm:text-2xl lg:hidden">Recent Experts</h2>
                  <h2 className="hidden font-display text-2xl font-bold text-ink lg:block">Expert Directory</h2>
                  <p className="mt-2 text-sm text-ink/60">
                    {isLoading ? 'Loading experts…' : `${experts.length} expert${experts.length === 1 ? '' : 's'} shown`}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 hidden gap-6 lg:grid lg:grid-cols-3">
              {experts.map((expert, index) => (
                <ExpertCard key={expert.id} expert={expert} index={index} />
              ))}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
              {experts.map((expert, index) => (
                <ExpertCard key={expert.id} expert={expert} index={index} compact />
              ))}
            </div>

            {!isLoading && experts.length === 0 && (
              <p className="mt-8 rounded-lg border border-ink/10 bg-white px-4 py-6 text-sm text-ink/70">
                No experts matched your search. Try another expertise area or keyword.
              </p>
            )}
          </div>
        </div>
      </RevealSection>

      <Footer />
    </>
  );
}
