import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

// Force this route to be dynamic since it uses server-side session
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('=== AUTH FLOW TEST ===');
    
    // Check server-side session
    const session = await getServerSession(authOptions);
    console.log('Server session:', session ? 'EXISTS' : 'NULL');
    console.log('Session user:', session?.user?.username || 'NO USER');
    
    return NextResponse.json({
      success: true,
      serverSession: {
        exists: !!session,
        user: session?.user ? {
          username: session.user.username,
          email: session.user.email,
          isVerified: session.user.isVerified
        } : null
      },
      debug: {
        timestamp: new Date().toISOString(),
        sessionStrategy: 'jwt',
        nextAuthUrl: process.env.NEXTAUTH_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET
      }
    });
    
  } catch (error: any) {
    console.error('Auth flow test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      debug: {
        errorType: error.constructor.name,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nextAuthUrl: process.env.NEXTAUTH_URL
      }
    }, { status: 500 });
  }
} 