
import rateLimit from 'express-rate-limit';
import { SERVER_CONFIG } from '../config/serverEnv.js';

export const rateLimiter = rateLimit({
    windowMs: SERVER_CONFIG.RATE_LIMIT_WINDOW,
    max: SERVER_CONFIG.RATE_LIMIT_MAX,
    standardHeaders: 'draft-7', 
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Too many requests from this IP, please try again after 15 minutes.'
    },

    // In production, we only want to rate limit the public API endpoints

});
