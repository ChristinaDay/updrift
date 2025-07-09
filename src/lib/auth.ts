import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

// TODO: Add proper type for authOptions when NextAuthOptions is available
export const authOptions = {
  // TODO: Replace 'any' with Adapter type from 'next-auth/adapters' or '@auth/core/adapters' when available in node_modules
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    // Email/Password Provider
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      }
    }),

    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),

    // GitHub Provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
  ],

  session: {
    strategy: 'jwt'
  },

  pages: {
    signIn: '/auth/signin',
  },

  callbacks: {
    // TODO: Add proper types for token and user
    async jwt({ token, user }: { token: unknown; user: unknown }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    
    // TODO: Add proper types for session and token
    async session({ session, token }: { session: unknown; token: unknown }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    },
  },

  events: {
    async createUser({ user }) {
      console.log('🎉 New user created:', user.email)
    },
  },
}

// Helper function to get server-side session
// TODO: Update this when getServerSession is available in next-auth
export async function getServerSession() {
  const nextAuth = await import('next-auth')
  if (typeof nextAuth.getServerSession === 'function') {
    return nextAuth.getServerSession(authOptions)
  } else {
    // TODO: Handle missing getServerSession gracefully
    throw new Error('getServerSession is not available in this version of next-auth')
  }
} 