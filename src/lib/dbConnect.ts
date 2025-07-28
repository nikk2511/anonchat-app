import mongoose from "mongoose";

type ConnectionObject = {
    isConnected ?: number
}

const connection: ConnectionObject = {}

async function dbConnect(): Promise<void>
{
    // Check if already connected
    if(connection.isConnected)
    {
        console.log('Already connected to Database')
        return; 
    }

    // Validate MongoDB URI exists
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI environment variable is not set');
        console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('MONGO')));
        throw new Error('MONGODB_URI environment variable is required but not provided');
    }

    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('MongoDB URI format check:', process.env.MONGODB_URI.startsWith('mongodb'));
        console.log('Environment:', process.env.NODE_ENV);
        
        // Enhanced connection options for Vercel
        const db = await mongoose.connect(process.env.MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000, // Increased for Vercel
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000, // Added for Vercel
            heartbeatFrequencyMS: 10000, // Added for better connection monitoring
        });

        connection.isConnected = db.connections[0].readyState;

        console.log("DB connected Successfully");
        console.log(`Connected to: ${db.connection.name}`);
        console.log(`Connection state: ${db.connections[0].readyState}`);

    } catch (error: any) {
        console.error('=== DATABASE CONNECTION ERROR ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Full error:', error);
        
        // Check for specific MongoDB errors
        if (error.message.includes('authentication failed')) {
            console.error('❌ AUTHENTICATION ERROR: Check your MongoDB username/password');
        } else if (error.message.includes('network')) {
            console.error('❌ NETWORK ERROR: Check your MongoDB cluster network access');
        } else if (error.message.includes('timeout')) {
            console.error('❌ TIMEOUT ERROR: MongoDB cluster might be slow to respond');
        }
        
        connection.isConnected = 0;
        throw new Error(`Database connection failed: ${error.message}`);
    }
}

export default dbConnect;