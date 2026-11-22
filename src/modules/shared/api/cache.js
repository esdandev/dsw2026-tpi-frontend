const DEFAULT_TTL_MS = 60000;

const cached = new Map();
const inFlight = new Map();

function serializeParams(params) {
  if (!params) return '';

  return Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key] ?? ''}`)
    .join('&');
}

export function buildCacheKey(url, params) {
  return `${url}?${serializeParams(params)}`;
}

export function clearCache() {
  cached.clear();
  inFlight.clear();
}

export function invalidateByPrefix(prefix) {
  for (const key of cached.keys()) {
    if (key.startsWith(prefix)) cached.delete(key);
  }

  for (const key of inFlight.keys()) {
    if (key.startsWith(prefix)) inFlight.delete(key);
  }
}

export async function getCached(
  client,
  url,
  { params, ttl = DEFAULT_TTL_MS } = {}
) {
  const key = buildCacheKey(url, params);
  const entry = cached.get(key);

  if (entry && entry.expiresAt > Date.now()) return entry.data;

  // Dos componentes que piden lo mismo a la vez comparten una sola request.
  if (inFlight.has(key)) return inFlight.get(key);

  const request = client
    .get(url, { params })
    .then((response) => {
      cached.set(key, { data: response.data, expiresAt: Date.now() + ttl });

      return response.data;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, request);

  return request;
}
