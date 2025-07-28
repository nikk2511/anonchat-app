import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Disable mongoose buffering to prevent timeout errors
mongoose.set('bufferCommands', false);

export async function GET(request: NextRequest) {
  try {
    console.log('=== QUICK DB CONNECTION TEST ===');
    
    // Check if MONGODB_URI exists
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        success: false,
        error: 'MONGODB_URI environment variable is missing',
        solution: 'Add MONGODB_URI in Vercel Dashboard → Settings → Environment Variables'
      }, { status: 500 });
    }

    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('URI format check:', process.env.MONGODB_URI.startsWith('mongodb'));
    
    // Close any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('Disconnected from previous connection');
    }

    // Attempt direct connection with minimal options
    console.log('Attempting direct MongoDB connection...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 20000,
      bufferCommands: false,
    });

    console.log('✅ MongoDB connection successful!');
    console.log('Database name:', mongoose.connection.name);
    console.log('Connection state:', mongoose.connection.readyState);

    // Test a simple operation
    const adminDb = mongoose.connection.db.admin();
    const result = await adminDb.ping();
    
    console.log('✅ Database ping successful:', result);

    return NextResponse.json({
      success: true,
      message: 'MongoDB connection and ping successful!',
      details: {
        databaseName: mongoose.connection.name,
        connectionState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        pingResult: result
      }
    });

  } catch (error: any) {
    console.error('=== DB CONNECTION ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);

    let solution = 'Unknown error';
    
    if (error.message.includes('authentication failed')) {
      solution = 'Check MongoDB Atlas username/password in connection string';
    } else if (error.message.includes('bad auth')) {
      solution = 'Verify database user credentials in MongoDB Atlas';
    } else if (error.message.includes('timeout') || error.message.includes('timed out')) {
      solution = 'Add 0.0.0.0/0 to Network Access in MongoDB Atlas';
    } else if (error.message.includes('ENOTFOUND')) {
      solution = 'Check if MongoDB cluster URL is correct';
    } else if (error.message.includes('connection refused')) {
      solution = 'Verify MongoDB Atlas cluster is running and accessible';
    }

    return NextResponse.json({
      success: false,
      error: error.message,
      errorType: error.constructor.name,
      errorCode: error.code,
      solution: solution,
      debug: {
        hasMongoUri: !!process.env.MONGODB_URI,
        nodeEnv: process.env.NODE_ENV,
        mongooseState: mongoose.connection.readyState
      }
    }, { status: 500 });
  }
} 