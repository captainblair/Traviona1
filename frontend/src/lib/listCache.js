const store = new Map();
const DEFAULT_TTL_MS = 5 * 60 * 1000;

export function buildCacheKey(prefix, params) {
  return `${prefix}:${JSON.stringify(params)}`;
}

export function readListCache(key, ttlMs = DEFAULT_TTL_MS) {
  const entry = store.get(key);
  if (!entry) {
    return null;
  }
  if (Date.now() - entry.at > ttlMs) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

export function writeListCache(key, data) {
  store.set(key, { data, at: Date.now() });
}

export function prefetchList(key, loader) {
  if (readListCache(key)) {
    return;
  }
  loader()
    .then((data) => writeListCache(key, data))
    .catch(() => {});
}
