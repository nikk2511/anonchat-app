'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, MessageSquare, Shield, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // If user is authenticated, redirect to dashboard
  if (status === 'authenticated' && session) {
    router.replace('/dashboard');
    return null;
  }

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

  // Landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <MessageSquare className="h-8 w-8" />
            </div>
            <span className="text-5xl font-bold gradient-text">AnonChat</span>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Share thoughts anonymously, connect authentically. Your identity stays private while your voice is heard.
          </motion.p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <Card className="card-hover">
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">100% Anonymous</h3>
              <p className="text-muted-foreground">Your identity is completely protected. Share freely without fear.</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Connect Safely</h3>
              <p className="text-muted-foreground">Build genuine connections without revealing personal information.</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6 text-center">
              <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Instant Messaging</h3>
              <p className="text-muted-foreground">Send and receive messages instantly in real-time conversations.</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-6"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Start Chatting?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Join thousands of users sharing their thoughts in a safe, anonymous environment.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="btn-primary w-full sm:w-auto min-w-[140px]"
              onClick={() => router.push('/sign-up')}
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="w-full sm:w-auto min-w-[140px]"
              onClick={() => router.push('/sign-in')}
            >
              Sign In
            </Button>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-muted-foreground mt-8"
          >
            🔒 Anonymous • Secure • Private
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
} 