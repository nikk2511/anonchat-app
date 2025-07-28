import mongoose from "mongoose";

type ConnectionObject = {
    isConnected ?: number
}

const connection: ConnectionObject = {}

async function dbConnectWithBuffer(): Promise<void> {
    // For critical operations, we need to ensure connection is fully ready
    
    // Check if already connected and ready for operations
    if(connection.isConnected && mongoose.connection.readyState === 1) {
        console.log('Already connected to Database (with buffer)');
        return; 
    }

    // If currently connecting, wait for it to complete
    if(mongoose.connection.readyState === 2) {
        console.log('Connection in progress, waiting for completion...');
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Connection timeout waiting for existing connection'));
            }, 30000);
            
            mongoose.connection.once('connected', () => {
                clearTimeout(timeout);
                resolve(true);
            });
            
            mongoose.connection.once('error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });
        connection.isConnected = mongoose.connection.readyState;
        console.log('Existing connection now ready');
        return;
    }

    // Validate MongoDB URI exists
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI environment variable is not set');
        throw new Error('MONGODB_URI environment variable is required but not provided');
    }

    try {
        console.log('Establishing new MongoDB connection with buffering...');
        console.log('MongoDB URI format check:', process.env.MONGODB_URI.startsWith('mongodb'));
        console.log('Environment:', process.env.NODE_ENV);
        
        // Temporarily enable buffering for this connection
        const originalBufferCommands = mongoose.get('bufferCommands');
        mongoose.set('bufferCommands', true);
        
        try {
            // Connection options optimized for reliability
            const db = await mongoose.connect(process.env.MONGODB_URI, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 30000,
                socketTimeoutMS: 45000,
                connectTimeoutMS: 30000,
                heartbeatFrequencyMS: 10000,
                bufferCommands: true, // Enable buffering for this connection
            });

            // Wait for connection to be fully ready
            await new Promise((resolve, reject) => {
                if (db.connections[0].readyState === 1) {
                    resolve(true);
                    return;
                }
                
                const timeout = setTimeout(() => {
                    reject(new Error('Connection ready timeout'));
                }, 10000);
                
                db.connections[0].once('connected', () => {
                    clearTimeout(timeout);
                    resolve(true);
                });
                
                db.connections[0].once('error', (error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
            });

            connection.isConnected = db.connections[0].readyState;

            // Verify connection is ready for operations
            if (db.connections[0].readyState !== 1) {
                throw new Error(`Connection established but not ready. State: ${db.connections[0].readyState}`);
            }

            console.log("DB connected Successfully (with buffer)");
            console.log(`Connected to: ${db.connection.name}`);
            console.log(`Connection state: ${db.connections[0].readyState}`);
            console.log('Connection verified ready for database operations');
            
        } finally {
            // Restore original buffer setting
            mongoose.set('bufferCommands', originalBufferCommands);
        }

    } catch (error: any) {
        console.error('=== DATABASE CONNECTION ERROR (WITH BUFFER) ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        
        // Reset connection state on failure
        connection.isConnected = 0;
        
        // Check for specific MongoDB errors
        if (error.message.includes('authentication failed')) {
            console.error('❌ AUTHENTICATION ERROR: Check your MongoDB username/password');
        } else if (error.message.includes('network')) {
            console.error('❌ NETWORK ERROR: Check your MongoDB cluster network access');
        } else if (error.message.includes('timeout')) {
            console.error('❌ TIMEOUT ERROR: MongoDB cluster might be slow to respond');
        }
        
        throw new Error(`Database connection failed: ${error.message}`);
    }
}

export default dbConnectWithBuffer; 