const API_BASE = '/api'; // nginx proxies /api -> backend

export async function apiFetch(path, token, opts = {}) {
  const headers = opts.headers || {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!opts.body && opts.method && ['POST','PUT','PATCH'].includes(opts.method)) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers, body: opts.body ? JSON.stringify(opts.body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data;
  return data;
}
