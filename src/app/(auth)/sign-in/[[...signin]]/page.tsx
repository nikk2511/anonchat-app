'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function SignInCatchAll() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session) {
      console.log('User already authenticated, redirecting to dashboard');
      router.replace('/dashboard');
    } else if (status === 'unauthenticated') {
      console.log('User not authenticated, redirecting to sign-in');
      router.replace('/sign-in');
    }
  }, [status, session, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
} 