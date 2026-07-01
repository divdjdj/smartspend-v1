import NextAuth, { NextAuthOptions, DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import User, { IUser } from '@/features/shared/model/user';
import type { IClient } from '@/features/shared/model/client';

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
        let user: IUser | IClient | null = await User.findOne({ 
          $or: [
            { email: loginIdentifier },
            { phone: credentials.email.trim() }
          ]
        }).select('+password +isSuperAdmin');

        let isClient = false;
        if (!user) {
          const Client = (await import('@/features/shared/model/client')).default;
          const foundClient = await Client.findOne({
            $or: [
              { email: loginIdentifier },
              { mobile: credentials.email.trim() }
            ]
          }).select('+password');
          
          if (foundClient) {
            user = foundClient;
            isClient = true;
          }
        }

        if (!user) {
          throw new Error('Invalid email, mobile number, or password.');
        }

        // Check if account is locked
        if (!isClient && (user as IUser).isLocked) {
          throw new Error('Account is temporarily locked due to multiple failed login attempts. Please try again later.');
        }

        // Verify password
        const isPasswordCorrect = await user.comparePassword(credentials.password);

        // Get headers for login history logging
        const userAgent = req?.headers?.['user-agent'] || 'unknown';
        const ip = req?.headers?.['x-forwarded-for'] || '127.0.0.1';

        if (!isPasswordCorrect) {
          if (!isClient) {
            const iUser = user as IUser;
            // Increment login attempts and save login history
            await iUser.incLoginAttempts();
            iUser.addLoginHistory(Array.isArray(ip) ? ip[0] : ip, userAgent, false);
            await iUser.save();
          }
          throw new Error('Invalid email, mobile number, or password.');
        }

        // Check if email is verified
        if (!isClient && !(user as IUser).emailVerified) {
          throw new Error('Please verify your email address. A verification link has been sent to your email.');
        }

        if (!isClient) {
          const iUser = user as IUser;
          // Reset login attempts on successful login
          await iUser.resetLoginAttempts();
          iUser.addLoginHistory(Array.isArray(ip) ? ip[0] : ip, userAgent, true);
          await iUser.save();
        }

        return {
          id: user._id.toString(),
          email: isClient ? (user as IClient).email || '' : (user as IUser).email,
          name: isClient ? (user as IClient).name : `${(user as IUser).firstName || ''} ${(user as IUser).lastName || ''}`.trim() || (user as IUser).email,
          role: isClient ? 'client' : (user as IUser).role,
          emailVerified: isClient ? true : (user as IUser).emailVerified,
          phone: isClient ? (user as IClient).mobile : (user as IUser).phone || ''
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
