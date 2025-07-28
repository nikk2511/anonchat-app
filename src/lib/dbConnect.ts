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
        throw new Error('MONGODB_URI environment variable is required but not provided');
    }

    try {
        console.log('Attempting to connect to MongoDB...');
        
        const db = await mongoose.connect(process.env.MONGODB_URI, {
            // Add connection options for better reliability
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds
        });

        connection.isConnected = db.connections[0].readyState;

        console.log("DB connected Successfully");
        console.log(`Connected to: ${db.connection.name}`);

    } catch (error: any) {
        console.error('DataBase connection failed:', error.message);
        console.error('Full error:', error);
        
        // Reset connection state on failure
        connection.isConnected = 0;
        
        // Re-throw the error so calling code can handle it appropriately
        throw new Error(`Database connection failed: ${error.message}`);
    }
}

export default dbConnect;