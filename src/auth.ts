import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import type { OIDCConfig } from 'next-auth/providers'
import { soqAdapter } from '@/lib/auth-adapter'

// LINE OIDC provider
function LINE(): OIDCConfig<any> {
  return {
    id: 'line',
    name: 'LINE',
    type: 'oidc',
    issuer: 'https://access.line.me',
    authorization: {
      url: 'https://access.line.me/oauth2/v2.1/authorize',
      params: { scope: 'profile openid email', bot_prompt: 'normal' },
    },
    token: 'https://api.line.me/oauth2/v2.1/token',
    userinfo: 'https://api.line.me/v2/profile',
    clientId: process.env.LINE_CLIENT_ID,
    clientSecret: process.env.LINE_CLIENT_SECRET,
    checks: ['state'],
    profile(profile) {
      return {
        id: profile.sub ?? profile.userId,
        name: profile.displayName ?? profile.name,
        email: profile.email ?? null,
        image: profile.pictureUrl ?? profile.picture ?? null,
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
    }),
    LINE(),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.role = (user as any).role ?? 'customer'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        ;(session.user as any).role = token.role ?? 'customer'
      }
      return session
    },
  },
  trustHost: true,
})
