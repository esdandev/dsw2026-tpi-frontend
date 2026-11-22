const DEFAULT_TTL_MS = 60000;

const cached = new Map();
const inFlight = new Map();

// Sube en cada invalidación: una request que arrancó antes no debe cachear su resultado.
let generation = 0;

function serializeParams(params) {
  if (!params) return '';

  const search = new URLSearchParams();

  Object.keys(params)
    .sort()
    .forEach((key) => {
      const value = params[key];

      if (value !== undefined && value !== null && value !== '') {
        search.append(key, String(value));
      }
    });

  return search.toString();
}

export function buildCacheKey(url, params) {
  const query = serializeParams(params);

  return query ? `${url}?${query}` : url;
}

export function clearCache() {
  generation += 1;
  cached.clear();
  inFlight.clear();
}

export function invalidateByPrefix(prefix) {
  generation += 1;

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

  const startedAt = generation;

  const request = client
    .get(url, { params })
    .then((response) => {
      // Si hubo una invalidación mientras la request estaba en vuelo, el dato ya es viejo.
      if (startedAt === generation) {
        cached.set(key, { data: response.data, expiresAt: Date.now() + ttl });
      }

      return response.data;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, request);

  return request;
}
