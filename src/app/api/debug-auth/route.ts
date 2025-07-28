import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { getToken } from 'next-auth/jwt';

// Force this route to be dynamic since it uses server-side session
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG AUTH STATUS ===');
    
    // Check server-side session
    const session = await getServerSession(authOptions);
    
    // Check JWT token (used by middleware)
    const token = await getToken({ req: request });
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      serverSession: {
        exists: !!session,
        user: session?.user ? {
          username: session.user.username,
          email: session.user.email,
          isVerified: session.user.isVerified
        } : null
      },
      jwtToken: {
        exists: !!token,
        username: token?.username || null,
        email: token?.email || null
      },
      environment: {
        nextAuthUrl: process.env.NEXTAUTH_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nodeEnv: process.env.NODE_ENV
      },
      headers: {
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer'),
        cookie: request.headers.get('cookie') ? 'Present' : 'Missing'
      }
    };
    
    console.log('Debug info:', JSON.stringify(debugInfo, null, 2));
    
    return NextResponse.json({
      success: true,
      debug: debugInfo
    });
    
  } catch (error: any) {
    console.error('Debug auth error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 