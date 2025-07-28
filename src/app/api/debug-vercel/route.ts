import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    console.log('=== VERCEL DEBUG ENDPOINT ===');
    
    // Check environment variables
    const mongoUri = process.env.MONGODB_URI;
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    const nextAuthSecret = process.env.NEXTAUTH_SECRET;
    
    console.log('Environment Check:');
    console.log('- MONGODB_URI exists:', !!mongoUri);
    console.log('- MONGODB_URI length:', mongoUri?.length || 0);
    console.log('- MONGODB_URI starts with mongodb:', mongoUri?.startsWith('mongodb'));
    console.log('- NEXTAUTH_URL exists:', !!nextAuthUrl);
    console.log('- NEXTAUTH_SECRET exists:', !!nextAuthSecret);
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    
    // Check current mongoose connection state
    console.log('Mongoose Connection State:', mongoose.connection.readyState);
    console.log('Connection States: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting');
    
    if (!mongoUri) {
      return NextResponse.json({
        success: false,
        error: 'MONGODB_URI environment variable is missing',
        debug: {
          mongoUri: !!mongoUri,
          nextAuthUrl: !!nextAuthUrl,
          nextAuthSecret: !!nextAuthSecret,
          nodeEnv: process.env.NODE_ENV
        }
      }, { status: 500 });
    }
    
    // Test database connection
    console.log('Attempting database connection...');
    await dbConnect();
    
    console.log('Database connection successful!');
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful on Vercel!',
      debug: {
        mongoUri: !!mongoUri,
        nextAuthUrl: !!nextAuthUrl,
        nextAuthSecret: !!nextAuthSecret,
        nodeEnv: process.env.NODE_ENV,
        connectionState: mongoose.connection.readyState,
        databaseName: mongoose.connection.name
      }
    });
    
  } catch (error: any) {
    console.error('=== VERCEL DEBUG ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      errorType: error.name,
      debug: {
        mongoUri: !!process.env.MONGODB_URI,
        nextAuthUrl: !!process.env.NEXTAUTH_URL,
        nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nodeEnv: process.env.NODE_ENV,
        connectionState: mongoose.connection.readyState
      }
    }, { status: 500 });
  }
} 