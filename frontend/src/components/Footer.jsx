import { Globe2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contact" className="w-full max-w-full overflow-x-hidden bg-ink px-4 py-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))] text-white sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-tide/60 bg-tide/15">
            <Globe2 className="h-5 w-5 text-tide" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold">Traviona</span>
        </div>
        <p className="max-w-full break-words text-sm text-white/55">
          Strategic international business consulting and political insights.
        </p>
      </div>
    </footer>
  );
}
