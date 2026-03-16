import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    role?: string
    must_change_password?: boolean
  }
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
      must_change_password?: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    must_change_password?: boolean
  }
}
