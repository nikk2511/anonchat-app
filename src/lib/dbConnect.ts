import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number;
    isConnecting?: boolean;
}

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
    // Check if we're already connected
    if (connection.isConnected === 1) {
        console.log('Already connected to Database');
        return;
    }

    // Check if we're currently connecting
    if (connection.isConnecting) {
        console.log('Connection in progress, waiting...');
        // Wait for connection to complete
        while (connection.isConnecting) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return;
    }

    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI is not set');
        throw new Error('Database connection failed: MONGODB_URI environment variable is not set');
    }

    try {
        connection.isConnecting = true;
        console.log('Connecting to MongoDB...');
        
        const db = await mongoose.connect(process.env.MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferCommands: false,
            bufferMaxEntries: 0,
        });

        connection.isConnected = db.connections[0].readyState;
        connection.isConnecting = false;

        console.log("DB connected Successfully");

        // Handle connection events
        mongoose.connection.on('error', (error) => {
            console.error('MongoDB connection error:', error);
            connection.isConnected = 0;
            connection.isConnecting = false;
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            connection.isConnected = 0;
            connection.isConnecting = false;
        });

    } catch (error: any) {
        connection.isConnecting = false;
        console.error('Database connection failed:', error.message);
        throw new Error(`Database connection failed: ${error.message}`);
    }
}

export default dbConnect;