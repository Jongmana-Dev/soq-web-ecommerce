import type {
  Adapter,
  AdapterUser,
  AdapterAccount,
  AdapterSession,
} from 'next-auth/adapters'
import { sendWelcomeEmail } from '@/lib/notifications/email'
import { notifyNewMember } from '@/lib/notifications/telegram'

const API_URL = process.env.API_URL ?? 'http://localhost:3001'
const ADAPTER_SECRET = process.env.ADAPTER_API_SECRET ?? ''

async function adapterFetch<T>(
  endpoint: string,
  body: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${API_URL}/api/auth-adapter/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Adapter-Secret': ADAPTER_SECRET,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
    // กัน login ค้างไม่มีกำหนดเมื่อ API ช้า — 15s เผื่อ cold start ของ Railway
    signal: AbortSignal.timeout(15_000),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`Adapter API error ${res.status}: ${text}`)
  }

  return res.json()
}

/** JSON ส่ง Date มาเป็น string — แปลงกลับให้ NextAuth */
function fixUserDates(user: AdapterUser): AdapterUser {
  return {
    ...user,
    emailVerified: user.emailVerified
      ? new Date(user.emailVerified as unknown as string)
      : null,
  }
}

export function soqAdapter(): Adapter {
  return {
    async createUser(user) {
      const { data } = await adapterFetch<{ data: AdapterUser }>(
        'create-user',
        {
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified?.toISOString() ?? undefined,
          image: user.image,
        },
      )

      // Fire welcome notifications (non-blocking)
      if (data.email) {
        sendWelcomeEmail(data.name ?? null, data.email).catch(() => {})
        notifyNewMember(data.name ?? null, data.email).catch(() => {})
      }

      return fixUserDates(data)
    },

    async getUser(id) {
      const { data } = await adapterFetch<{ data: AdapterUser | null }>(
        'get-user',
        { id },
      )
      return data ? fixUserDates(data) : null
    },

    async getUserByEmail(email) {
      if (!email) return null
      const { data } = await adapterFetch<{ data: AdapterUser | null }>(
        'get-user-by-email',
        { email },
      )
      return data ? fixUserDates(data) : null
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const { data } = await adapterFetch<{ data: AdapterUser | null }>(
        'get-user-by-account',
        { provider, providerAccountId },
      )
      return data ? fixUserDates(data) : null
    },

    async updateUser(user) {
      const { data } = await adapterFetch<{ data: AdapterUser }>(
        'update-user',
        {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified?.toISOString?.() ?? undefined,
          image: user.image,
        },
      )
      return fixUserDates(data)
    },

    async deleteUser(id) {
      await adapterFetch('delete-user', { id })
    },

    async linkAccount(account) {
      const { data } = await adapterFetch<{ data: AdapterAccount }>(
        'link-account',
        {
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          access_token: account.access_token ?? undefined,
          refresh_token: account.refresh_token ?? undefined,
          expires_at: account.expires_at ?? undefined,
          token_type: account.token_type ?? undefined,
          scope: account.scope ?? undefined,
          id_token: account.id_token ?? undefined,
          session_state: account.session_state ?? undefined,
        },
      )
      return data as AdapterAccount
    },

    async unlinkAccount({ provider, providerAccountId }) {
      await adapterFetch('unlink-account', { provider, providerAccountId })
    },

    async createSession(session) {
      const { data } = await adapterFetch<{ data: AdapterSession }>(
        'create-session',
        {
          userId: session.userId,
          sessionToken: session.sessionToken,
          expires: session.expires.toISOString(),
        },
      )
      return { ...data, expires: new Date(data.expires) }
    },

    async getSessionAndUser(sessionToken) {
      const { data } = await adapterFetch<{
        data: { session: AdapterSession; user: AdapterUser } | null
      }>('get-session-and-user', { sessionToken })
      if (!data) return null
      return {
        session: { ...data.session, expires: new Date(data.session.expires) },
        user: fixUserDates(data.user),
      }
    },

    async updateSession(session) {
      const { data } = await adapterFetch<{ data: AdapterSession | null }>(
        'update-session',
        {
          sessionToken: session.sessionToken,
          expires: session.expires?.toISOString?.(),
        },
      )
      return data ? { ...data, expires: new Date(data.expires) } : null
    },

    async deleteSession(sessionToken) {
      await adapterFetch('delete-session', { sessionToken })
    },

    async createVerificationToken(token) {
      const { data } = await adapterFetch<{
        data: { identifier: string; token: string; expires: Date }
      }>('create-verification-token', {
        identifier: token.identifier,
        token: token.token,
        expires: token.expires.toISOString(),
      })
      return { ...data, expires: new Date(data.expires) }
    },

    async useVerificationToken({ identifier, token }) {
      const { data } = await adapterFetch<{
        data: { identifier: string; token: string; expires: Date } | null
      }>('use-verification-token', { identifier, token })
      return data ? { ...data, expires: new Date(data.expires) } : null
    },
  }
}
