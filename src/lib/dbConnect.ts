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

    // Validate MongoDB URI format
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
        console.error('Invalid MongoDB URI format');
        throw new Error('Database connection failed: Invalid MongoDB URI format');
    }

    try {
        connection.isConnecting = true;
        console.log('Connecting to MongoDB...');
        
        const db = await mongoose.connect(mongoUri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000, // Increased timeout for slow connections
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000, // Added connection timeout
            // Add retry configuration
            retryWrites: true,
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

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
            connection.isConnected = 1;
        });

    } catch (error: any) {
        connection.isConnecting = false;
        console.error('Database connection failed:', error.message);
        
        // Provide more specific error messages
        let errorMessage = error.message;
        if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
            errorMessage = 'Database connection failed: Unable to resolve MongoDB host. Please check your connection string.';
        } else if (error.message.includes('authentication failed')) {
            errorMessage = 'Database connection failed: Authentication failed. Please check your username and password.';
        } else if (error.message.includes('IP whitelist') || error.message.includes('not authorized')) {
            errorMessage = 'Database connection failed: IP address not whitelisted. Please add your deployment IP to MongoDB Atlas whitelist.';
        }
        
        throw new Error(errorMessage);
    }
}

export default dbConnect;