
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Logic to ensure __dirname is always the project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.join(path.dirname(__filename), '..', '..');

const ENV = process.env.NODE_ENV || 'development';

const getEnvBool = (key, defaultValue) => {
    const value = process.env[key];
    if (value === 'true') return true;
    if (value === 'false') return false;
    return defaultValue;
};

export const SERVER_CONFIG = {
    CONTEXT_ROOT: process.env.CONTEXT_ROOT || '',
    ENVIRON_NAME: ENV,
    PORT: parseInt(process.env.PORT, 10) || 8080,
    ROOT_DIR: process.env.ROOTPATH || path.join(process.cwd(), 'public'),

    DATA_DIR: path.join(__dirname, 'data'),
    LOG_LEVEL: process.env.LOG_LEVEL || 'debug',

    // Security
    NOTIFY_EMAIL: process.env.NOTIFY_EMAIL || "BaselineLogicSystems@pm.me",
    RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 15 * 60 * 1000, // 15 mins
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,

    // Feature Toggles
    FEATURES: {
        ENABLE_ANALYTICS_CONVERT: getEnvBool('ENABLE_ANALYTICS_CONVERT', false),
        ENABLE_ANALYTICS_GOOGLE: getEnvBool('ENABLE_ANALYTICS_GOOGLE', false),
        ENABLE_BOOK_PREORDER: getEnvBool('ENABLE_BOOK_PREORDER', false),
        ENABLE_ADMIN_NOTIFICATIONS: getEnvBool('ENABLE_ADMIN_NOTIFICATIONS', false),
        ENABLE_DB_LOCAL: getEnvBool('ENABLE_DB_LOCAL', false),
        ENABLE_DB_MONGO: getEnvBool('ENABLE_DB_MONGO', false),
        ENABLE_DB_REDIS: getEnvBool('ENABLE_DB_REDIS', false),
        ENABLE_OAUTH: getEnvBool('ENABLE_OAUTH', false),
    },

    // Integration Keys (Should only be in environment)
    KEYS: {
        CONVERTKIT_API_KEY: process.env.CONVERTKIT_API_KEY,
        DB_MONGO_USER: process.env.DB_MONGO_USER,
        DB_MONGO_PASS: process.env.DB_MONGO_PASS,
        DB_REDIS_USER: process.env.DB_REDIS_USER,
        DB_REDIS_PASS: process.env.DB_REDIS_PASS,
        GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    },

    URLS: {
        CONVERTKIT_SERVER: process.env.CONVERTKIT_API_URL,
        DB_MONDO_SERVER: process.env.DB_MONDO_SERVER,
        DB_REDIS_SERVER: process.env.DB_REDIS_SERVER,
    }

};

export const FILE_PATHS = {
    CONTACT_LOG: path.join(SERVER_CONFIG.DATA_DIR, 'contact_messages.json'),
    NEWSLETTER: path.join(SERVER_CONFIG.DATA_DIR, 'newsletters.json'),
    SUBSCRIBE_LIST: path.join(SERVER_CONFIG.DATA_DIR, 'subscribe.json'),
};
