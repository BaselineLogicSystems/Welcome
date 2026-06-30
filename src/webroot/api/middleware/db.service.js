
import mongoose from 'mongoose';
import { logger } from './logger.js';
import { SERVER_CONFIG } from '../config/serverEnv.js';

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) return;
    if (SERVER_CONFIG.FEATURES.ENABLE_DB_MONGO === false) return;

    const mongoUri = SERVER_CONFIG.URLS.DB_MONDO_SERVER;
    if (!mongoUri) {
        logger.error('MONGODB_URL is not defined in environment variables');
        throw new Error('Database configuration missing');
    }

    try {
        const db = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000, // Fail fast for serverless
        });

        isConnected = true;
        logger.info('Successfully connected to MongoDB');

        return db;
    } catch (err) {
        logger.error({ err }, 'MongoDB connection error');
        throw err;
    }
};
