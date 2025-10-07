export async function cacheSet(key: string, value: string) {
  if (!('caches' in window)) return;
  const cache = await caches.open('auth-cache');
  const blob = new Blob([value], { type: 'text/plain' });
  const response = new Response(blob);
  await cache.put(`/auth/${key}`, response);
}

export async function cacheGet(key: string): Promise<string | null> {
  if (!('caches' in window)) return null;
  const cache = await caches.open('auth-cache');
  const res = await cache.match(`/auth/${key}`);
  if (!res) return null;
  return await res.text();
}

export async function cacheRemove(key: string) {
  if (!('caches' in window)) return;
  const cache = await caches.open('auth-cache');
  await cache.delete(`/auth/${key}`);
}
