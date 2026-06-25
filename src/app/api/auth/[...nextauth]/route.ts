import NextAuth, { NextAuthOptions, DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import User from '@/features/shared/model/user';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      role?: string;
      emailVerified?: boolean;
      phone?: string;
    } & DefaultSession['user']
  }
  interface User {
    role?: string;
    emailVerified?: boolean;
    phone?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both email and password.');
        }

        await connectDB();

        const loginIdentifier = credentials.email.toLowerCase().trim();

        // Retrieve user by email OR phone number
        const user = await User.findOne({ 
          $or: [
            { email: loginIdentifier },
            { phone: credentials.email.trim() }
          ]
        }).select('+password +isSuperAdmin');

        if (!user) {
          throw new Error('Invalid email, mobile number, or password.');
        }

        // Check if account is locked
        if (user.isLocked) {
          throw new Error('Account is temporarily locked due to multiple failed login attempts. Please try again later.');
        }

        // Verify password
        const isPasswordCorrect = await user.comparePassword(credentials.password);

        // Get headers for login history logging
        const userAgent = req?.headers?.['user-agent'] || 'unknown';
        const ip = req?.headers?.['x-forwarded-for'] || '127.0.0.1';

        if (!isPasswordCorrect) {
          // Increment login attempts and save login history
          await user.incLoginAttempts();
          user.addLoginHistory(Array.isArray(ip) ? ip[0] : ip, userAgent, false);
          await user.save();
          throw new Error('Invalid email or password.');
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error('Please verify your email address. A verification link has been sent to your email.');
        }

        // Reset login attempts on successful login
        await user.resetLoginAttempts();
        user.addLoginHistory(Array.isArray(ip) ? ip[0] : ip, userAgent, true);
        await user.save();

        return {
          id: user._id.toString(),
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          role: user.role,
          emailVerified: user.emailVerified,
          phone: user.phone || ''
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.emailVerified = user.emailVerified;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.emailVerified = token.emailVerified as boolean;
        session.user.phone = token.phone as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
