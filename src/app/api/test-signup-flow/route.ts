import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    console.log('=== TESTING SIGNUP FLOW ===');
    
    const body = await request.json();
    const { username = 'testuser', email = 'test@example.com' } = body;
    
    console.log(`Testing signup flow for: ${username} (${email})`);
    
    // Step 1: Test database connection
    console.log('Step 1: Testing database connection...');
    await dbConnect();
    console.log('✅ Database connection successful');
    
    // Step 2: Verify connection state
    console.log('Step 2: Verifying connection state...');
    console.log('Mongoose readyState:', mongoose.connection.readyState);
    console.log('Connection name:', mongoose.connection.name);
    
    if (mongoose.connection.readyState !== 1) {
      throw new Error(`Connection not ready. State: ${mongoose.connection.readyState}`);
    }
    console.log('✅ Connection ready for operations');
    
    // Step 3: Test user lookup (the operation that was failing)
    console.log('Step 3: Testing user lookup...');
    const existingUserByUsername = await UserModel.findOne({ 
      username: username.toLowerCase() 
    });
    console.log('✅ Username lookup successful:', !!existingUserByUsername);
    
    const existingUserByEmail = await UserModel.findOne({ email });
    console.log('✅ Email lookup successful:', !!existingUserByEmail);
    
    // Step 4: Test database ping
    console.log('Step 4: Testing database ping...');
    const adminDb = mongoose.connection.db.admin();
    const pingResult = await adminDb.ping();
    console.log('✅ Database ping successful:', pingResult);
    
    return NextResponse.json({
      success: true,
      message: 'Signup flow test completed successfully!',
      results: {
        databaseConnected: true,
        connectionState: mongoose.connection.readyState,
        connectionName: mongoose.connection.name,
        usernameExists: !!existingUserByUsername,
        emailExists: !!existingUserByEmail,
        databasePing: pingResult
      }
    });
    
  } catch (error: any) {
    console.error('=== SIGNUP FLOW TEST ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Mongoose state:', mongoose.connection.readyState);
    
    let diagnosis = 'Unknown error';
    let solution = 'Check logs for details';
    
    if (error.message.includes('Cannot call') && error.message.includes('before initial connection')) {
      diagnosis = 'Connection race condition - operations called before connection ready';
      solution = 'Fixed with proper connection state checking and awaiting';
    } else if (error.message.includes('authentication failed')) {
      diagnosis = 'MongoDB authentication failed';
      solution = 'Check username/password in MONGODB_URI';
    } else if (error.message.includes('timeout') || error.message.includes('timed out')) {
      diagnosis = 'MongoDB connection timeout';
      solution = 'Add 0.0.0.0/0 to MongoDB Atlas Network Access';
    } else if (error.message.includes('MONGODB_URI')) {
      diagnosis = 'Environment variable missing';
      solution = 'Add MONGODB_URI in Vercel Dashboard';
    }
    
    return NextResponse.json({
      success: false,
      error: error.message,
      errorType: error.constructor.name,
      diagnosis: diagnosis,
      solution: solution,
      debug: {
        mongooseState: mongoose.connection.readyState,
        connectionName: mongoose.connection.name || 'No connection',
        hasMongoUri: !!process.env.MONGODB_URI
      }
    }, { status: 500 });
  }
} 