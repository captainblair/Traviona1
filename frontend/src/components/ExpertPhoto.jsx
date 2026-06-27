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
  imageHeight = '100%',
  imageWidth = '100%',
  imageTop = '0',
  imageLeft = '0',
  imageTransform,
  imagePosition = 'center top',
  compact = false,
  className = '',
}) {
  const frameClass = compact ? 'h-28 w-28 shrink-0' : 'h-52 w-full sm:h-56';

  if (image) {
    return (
      <div className={`relative overflow-hidden bg-mist ${compact ? 'rounded-md' : 'rounded-t-lg'} ${frameClass} ${className}`}>
        <img
          src={image}
          alt={name}
          decoding="async"
          className="absolute max-w-none object-cover"
          style={{
            height: imageHeight,
            width: imageWidth,
            top: imageTop,
            left: imageLeft,
            transform: imageTransform,
            objectPosition: imagePosition,
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`grid place-items-center bg-gradient-to-br from-ink/90 to-midnight text-xl font-bold text-white ${
        compact ? 'rounded-md' : 'rounded-t-lg'
      } ${frameClass} ${className}`}
    >
      {initials(name)}
    </div>
  );
}
