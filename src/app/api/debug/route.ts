import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import mongoose from 'mongoose';

export async function GET() {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
      NODE_ENV: process.env.NODE_ENV || 'Not set',
    },
    mongoose: {
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
    },
    connection: {
      isConnected: mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState,
    }
  };

  try {
    console.log('Debug: Attempting database connection...');
    await dbConnect();
    console.log('Debug: Database connection successful');
    
    // Test various operations
    const userCount = await UserModel.countDocuments();
    const testUser = await UserModel.findOne({ username: 'testuser' });
    
    debugInfo.database = {
      connected: true,
      userCount: userCount,
      testUserExists: !!testUser,
      testUserVerified: testUser?.isVerified || false,
    };

    return Response.json({
      success: true,
      message: 'Database connection and operations successful',
      debug: debugInfo
    });
  } catch (error) {
    console.error('Debug: Database connection failed:', error);
    
    debugInfo.error = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    };

    return Response.json({
      success: false,
      message: 'Database connection failed',
      debug: debugInfo
    }, { status: 500 });
  }
} 