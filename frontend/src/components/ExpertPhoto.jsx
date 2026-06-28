function initials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function ExpertPhoto({
  name,
  image,
  objectPosition = 'center center',
  compact = false,
  className = '',
}) {
  const frameClass = compact
    ? 'h-24 w-24 shrink-0 rounded-full'
    : 'h-36 w-36 rounded-full sm:h-40 sm:w-40';

  const photo = image ? (
    <div className={`relative overflow-hidden bg-[#eef2f6] ring-2 ring-ink/10 ${frameClass}`}>
      <img
        src={image}
        alt={name}
        decoding="async"
        className="h-full w-full object-cover"
        style={{ objectPosition }}
      />
    </div>
  ) : (
    <div
      className={`grid place-items-center bg-gradient-to-br from-ink/90 to-midnight text-lg font-bold text-white sm:text-xl ${frameClass}`}
    >
      {initials(name)}
    </div>
  );

  if (compact) {
    return <div className={className}>{photo}</div>;
  }

  return (
    <div className={`flex justify-center bg-gradient-to-b from-mist/60 to-white px-4 pb-2 pt-6 ${className}`}>
      {photo}
    </div>
  );
}
