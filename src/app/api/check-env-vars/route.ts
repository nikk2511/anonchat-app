import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('=== ENVIRONMENT VARIABLES CHECK ===');
    
    const mongoUri = process.env.MONGODB_URI;
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    const nextAuthSecret = process.env.NEXTAUTH_SECRET;
    const nodeEnv = process.env.NODE_ENV;
    
    // Log what we found
    console.log('MONGODB_URI exists:', !!mongoUri);
    console.log('MONGODB_URI length:', mongoUri?.length || 0);
    console.log('MONGODB_URI first 20 chars:', mongoUri?.substring(0, 20) || 'NOT_SET');
    console.log('NEXTAUTH_URL exists:', !!nextAuthUrl);
    console.log('NEXTAUTH_SECRET exists:', !!nextAuthSecret);
    console.log('NODE_ENV:', nodeEnv);
    
    // Check if MONGODB_URI looks like localhost
    const isLocalhost = mongoUri?.includes('localhost') || mongoUri?.includes('127.0.0.1');
    const isAtlas = mongoUri?.includes('mongodb.net') || mongoUri?.includes('mongodb+srv');
    
    let diagnosis = 'Unknown';
    let solution = 'Check environment variables';
    
    if (!mongoUri) {
      diagnosis = 'MONGODB_URI environment variable is completely missing';
      solution = 'Add MONGODB_URI in Vercel Dashboard → Settings → Environment Variables';
    } else if (isLocalhost) {
      diagnosis = 'MONGODB_URI is set to localhost instead of MongoDB Atlas';
      solution = 'Update MONGODB_URI to use your MongoDB Atlas connection string';
    } else if (!isAtlas) {
      diagnosis = 'MONGODB_URI format looks incorrect';
      solution = 'Verify MONGODB_URI follows format: mongodb+srv://user:pass@cluster.mongodb.net/database';
    } else {
      diagnosis = 'MONGODB_URI appears to be correctly formatted for MongoDB Atlas';
      solution = 'Check MongoDB Atlas Network Access and Database User permissions';
    }
    
    return NextResponse.json({
      success: true,
      message: 'Environment variables checked',
      variables: {
        MONGODB_URI: {
          exists: !!mongoUri,
          length: mongoUri?.length || 0,
          preview: mongoUri?.substring(0, 20) || 'NOT_SET',
          isLocalhost: isLocalhost,
          isAtlas: isAtlas,
          format: mongoUri?.startsWith('mongodb') ? 'Valid MongoDB format' : 'Invalid format'
        },
        NEXTAUTH_URL: {
          exists: !!nextAuthUrl,
          value: nextAuthUrl || 'NOT_SET'
        },
        NEXTAUTH_SECRET: {
          exists: !!nextAuthSecret,
          length: nextAuthSecret?.length || 0
        },
        NODE_ENV: nodeEnv
      },
      diagnosis: diagnosis,
      solution: solution,
      connectionAttempt: {
        wouldConnectTo: mongoUri || 'localhost:27017 (default)',
        isProduction: nodeEnv === 'production'
      }
    });
    
  } catch (error: any) {
    console.error('Error checking environment variables:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      variables: {
        available: Object.keys(process.env).filter(key => 
          key.includes('MONGO') || 
          key.includes('NEXTAUTH') || 
          key.includes('NODE')
        )
      }
    }, { status: 500 });
  }
} 