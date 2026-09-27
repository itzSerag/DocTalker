import mongoose from 'mongoose';
import dns from 'node:dns';
import logger from '../utils/logger';

export const connectDB = async (): Promise<void> => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
        logger.fatal('MONGO_URI is not defined in environment variables');
        process.exit(1);
    }

    // Configure public DNS to resolve MongoDB Atlas SRV records reliably on Windows/ISP networks
    try {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch {
        // Fallback to system default if custom DNS cannot be configured
    }

    try {
        await mongoose.connect(MONGO_URI);
        logger.info('Connected to MongoDB successfully');
    } catch (error: any) {
        logger.fatal({ err: error }, `Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export const disconnectDB = async (): Promise<void> => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        logger.info('Disconnected from MongoDB');
    }
};

export default { connectDB, disconnectDB };
