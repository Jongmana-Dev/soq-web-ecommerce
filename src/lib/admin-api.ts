const ADMIN_PROXY_BASE = '/api/admin-proxy'

type FetchOptions = {
  method?: string
  body?: unknown
}

export async function adminFetch<T = unknown>(path: string, options?: FetchOptions): Promise<T> {
  const url = `${ADMIN_PROXY_BASE}/${path}`
  const init: RequestInit = {
    method: options?.method ?? 'GET',
    headers: { 'Content-Type': 'application/json' },
  }

  if (options?.body !== undefined) {
    init.body = JSON.stringify(options.body)
  }

  const res = await fetch(url, init)

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? data.message ?? `Request failed (${res.status})`)
  }

  return res.json()
}
