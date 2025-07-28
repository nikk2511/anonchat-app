import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnectWithBuffer from '@/lib/dbConnectWithBuffer';
import UserModel from '@/model/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any): Promise<any> {
        console.log('NextAuth authorize called for:', credentials?.identifier);
        
        try {
          // Use buffered connection for authentication to prevent race conditions
          await dbConnectWithBuffer();
          console.log('Database connected for authentication');
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });
          
          if (!user) {
            console.log('User not found for identifier:', credentials?.identifier);
            throw new Error('Invalid email/username or password');
          }
          
          console.log('User found:', user.username);

          // Email verification bypassed for development
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );
          
          if (isPasswordCorrect) {
            console.log('Authentication successful for user:', user.username);
            return {
              id: user._id?.toString() || '',
              _id: user._id?.toString() || '',
              username: user.username,
              email: user.email,
              isVerified: user.isVerified,
              isAcceptingMessages: user.isAcceptingMessages
            };
          } else {
            console.log('Password incorrect for user:', user.username);
            throw new Error('Invalid email/username or password');
          }
        } catch (err: any) {
          console.error('NextAuth authorization error:', err.message);
          throw new Error(err.message);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('JWT callback - setting token for user:', user.username);
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        console.log('Session callback - creating session for user:', token.username);
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
        session.user.email = token.email;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('NextAuth redirect callback:', { url, baseUrl });
      
      // If explicitly signing out or going to sign-in, allow it
      if (url.includes('/api/auth/signout') || url.includes('/sign-in') || url === `${baseUrl}/sign-in`) {
        console.log('Allowing sign-out or sign-in redirect');
        return url;
      }
      
      // Handle sign-in success - redirect to dashboard
      if (url === baseUrl || url === `${baseUrl}/` || url.includes('/api/auth/signin')) {
        console.log('Redirecting to dashboard after sign-in');
        return `${baseUrl}/dashboard`;
      }
      
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        const fullUrl = `${baseUrl}${url}`;
        console.log('Relative URL redirect:', fullUrl);
        return fullUrl;
      }
      
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) {
        console.log('Same origin redirect:', url);
        return url;
      }
      
      // Default to sign-in for safety
      console.log('Default redirect to sign-in');
      return `${baseUrl}/sign-in`;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/sign-in',
    error: '/sign-in', // Redirect errors back to sign-in page
  },

};
