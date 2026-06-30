
import mongoose from 'mongoose';
import { logger } from './logger.js';
import { SERVER_CONFIG } from '../config/serverEnv.js';

let dbBrokenUntil = 0;
/**
 * Checks if the database is currently available based on the circuit breaker.
 */
export const isDbAvailable = () => {
    return Date.now() >= dbBrokenUntil;
};

/**
 * Reports a DB failure to trigger the circuit breaker.
 * Can be called from services when queries fail.
 */
export const reportDbFailure = (err) => {
    dbBrokenUntil = Date.now() + SERVER_CONFIG.CIRCUIT_BREAKER_TIMEOUT;
    logger.error({ err }, `Database failure reported. Circuit breaker activated for ${SERVER_CONFIG.CIRCUIT_BREAKER_TIMEOUT / 1000}s`);
};

/**
 * Connects to MongoDB with caching and circuit breaker logic.
 * Returns true if connected or already connected, false otherwise.
 */
export const connectDB = async () => {

    // 0. Feature Flag
    if (SERVER_CONFIG.FEATURES.ENABLE_DB_MONGO === false) return null;

    logger.debug ("Connecting to DB");
    // 1. Check Circuit Breaker
    if (!isDbAvailable()) {
        logger.warn('Database circuit breaker is OPEN. Skipping connection attempt.');
        return false;
    }
    logger.debug ("Circuit is not closed");

    // 2. Check if Mongoose already has an active connection
    // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (mongoose.connection.readyState === 1) {
        return true;
    }

    const mongoUri = SERVER_CONFIG.URLS.DB_MONDO_SERVER;
    if (!mongoUri) {
        logger.error('Database configuration missing');
        return false;
    }

    logger.debug ("Connecting ....");
    try {
        const db = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000, // Fail fast for serverless
            socketTimeoutMS: 45000,
        });

        logger.info('Successfully connected to DB');
        return true;

    } catch (err) {
        // 3. Activate Circuit Breaker on failure
        reportDbFailure(err);
        return false;
    }
};
