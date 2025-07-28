'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Fetch debug info
  useEffect(() => {
    fetch('/api/debug-auth')
      .then(res => res.json())
      .then(data => setDebugInfo(data))
      .catch(err => console.error('Debug fetch error:', err));
  }, []);

  // AUTO REDIRECT DISABLED FOR DEBUGGING
  // useEffect(() => {
  //   if (status === 'authenticated' && session) {
  //     console.log('User authenticated, redirecting to dashboard');
  //     router.replace('/dashboard');
  //   } else if (status === 'unauthenticated') {
  //     console.log('User not authenticated, redirecting to sign-in');
  //     router.replace('/sign-in');
  //   }
  // }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center space-x-3 mb-8"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <MessageSquare className="h-8 w-8" />
            </div>
            <span className="text-4xl font-bold gradient-text">AnonChat</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-lg text-muted-foreground">Loading your experience...</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-6 w-6" />
              <span>AnonChat - Debug Mode</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Session Status */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Session Status</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Status:</strong> {status}
                </div>
                <div>
                  <strong>Has Session:</strong> {session ? 'Yes' : 'No'}
                </div>
                {session?.user && (
                  <>
                    <div>
                      <strong>Username:</strong> {session.user.username}
                    </div>
                    <div>
                      <strong>Email:</strong> {session.user.email}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Navigation</h3>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => router.push('/sign-in')}>
                  Go to Sign In
                </Button>
                <Button onClick={() => router.push('/sign-up')}>
                  Go to Sign Up
                </Button>
                <Button onClick={() => router.push('/dashboard')}>
                  Go to Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
              </div>
            </div>

            {/* Debug Info */}
            {debugInfo && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Debug Info</h3>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 