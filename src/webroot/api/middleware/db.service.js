
import mongoose from 'mongoose';
import { logger } from './logger.js';
import { SERVER_CONFIG } from '../config/serverEnv.js';

let dbBrokenUntil = 0;

export const connectDB = async () => {

    // 0. Feature Flag
    if (SERVER_CONFIG.FEATURES.ENABLE_DB_MONGO === false) return null;

    // 1. Check Circuit Breaker
    if (Date.now() < dbBrokenUntil) {
        logger.warn('Database circuit breaker is OPEN. Skipping connection attempt.');
        return null;
    }

    // 2. Check if Mongoose already has an active connection
    // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    const mongoUri = SERVER_CONFIG.URLS.DB_MONDO_SERVER;
    if (!mongoUri) {
        logger.error('Database configuration missing');
        return null;
    }

    try {
        const db = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000, // Fail fast for serverless
        });

        logger.info('Successfully connected to DB');
        return mongoose.connection;

    } catch (err) {
        // 3. Activate Circuit Breaker on failure
        dbBrokenUntil = Date.now() + SERVER_CONFIG.CIRCUIT_BREAKER_TIMEOUT;
        logger.error({ err }, 'MongoDB connection error');
        throw err;
    }
};
