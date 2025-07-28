import mongoose from "mongoose";

type ConnectionObject = {
    isConnected ?: number
}

const connection: ConnectionObject = {}

// Disable mongoose buffering globally to prevent timeout errors
mongoose.set('bufferCommands', false);

async function dbConnect(): Promise<void>
{
    // Check if already connected and ready for operations
    if(connection.isConnected && mongoose.connection.readyState === 1)
    {
        console.log('Already connected to Database')
        return; 
    }
    
    // If connection exists but not ready, wait for it
    if(mongoose.connection.readyState === 2) { // connecting
        console.log('Connection in progress, waiting...');
        await new Promise((resolve) => {
            mongoose.connection.once('connected', resolve);
        });
        connection.isConnected = mongoose.connection.readyState;
        console.log('Connection established, ready for operations');
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
        
        // Enhanced connection options for Vercel - disable buffering to prevent timeout
        const db = await mongoose.connect(process.env.MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 30000, // Increased timeout for Vercel
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000, // Increased for slow connections
            heartbeatFrequencyMS: 10000,
            bufferCommands: false, // Disable mongoose buffering
        });

        connection.isConnected = db.connections[0].readyState;

        // Ensure connection is fully ready for operations
        if (db.connections[0].readyState !== 1) {
            throw new Error('Connection established but not ready for operations');
        }

        console.log("DB connected Successfully");
        console.log(`Connected to: ${db.connection.name}`);
        console.log(`Connection state: ${db.connections[0].readyState}`);
        console.log('Connection ready for database operations');

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