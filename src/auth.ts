import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import type { OIDCConfig } from 'next-auth/providers'
import { soqAdapter } from '@/lib/auth-adapter'

// LINE OIDC provider — uses discovery from https://access.line.me/.well-known/openid-configuration
function LINE(options?: { allowDangerousEmailAccountLinking?: boolean }): OIDCConfig<any> {
  return {
    id: 'line',
    name: 'LINE',
    type: 'oidc',
    issuer: 'https://access.line.me',
    authorization: {
      params: { scope: 'profile openid email', bot_prompt: 'normal' },
    },
    clientId: process.env.LINE_CLIENT_ID,
    clientSecret: process.env.LINE_CLIENT_SECRET,
    // LINE discovery claims ES256 but actually signs ID tokens with HS256
    client: { id_token_signed_response_alg: 'HS256' },
    checks: ['state', 'nonce'],
    allowDangerousEmailAccountLinking: options?.allowDangerousEmailAccountLinking,
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email ?? null,
        image: profile.picture ?? null,
      }
    },
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: soqAdapter(),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    LINE({
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === 'google') {
        return profile?.email_verified === true
      }
      if (account?.provider === 'line') {
        if (!account.id_token) return false
        try {
          const res = await fetch(
            'https://api.line.me/oauth2/v2.1/verify',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                id_token: account.id_token,
                client_id: process.env.LINE_CLIENT_ID!,
              }),
            },
          )
          if (!res.ok) return false
          const verified = await res.json()
          if (verified.iss !== 'https://access.line.me') return false
          if (verified.aud !== process.env.LINE_CLIENT_ID) return false
          if (verified.sub !== account.providerAccountId) return false
          return true
        } catch {
          return false
        }
      }
      return false
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.email = user.email
        token.role = (user as any).role ?? 'customer'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.email = (token.email as string) ?? null
        ;(session.user as any).role = token.role ?? 'customer'
      }
      return session
    },
  },
  trustHost: true,
  debug: true, // TODO: remove after LINE login is verified
})
