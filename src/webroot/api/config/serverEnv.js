
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Logic to ensure projectRoot is always the project root
const ENV = process.env.NODE_ENV || 'development';
const filepath = fileURLToPath(import.meta.url);
const projectRoot = path.join(path.dirname(filepath), '..' ,'..');
const envFile = path.join(projectRoot, '..', 'main', 'configEnv', `.env.${ENV}`);

// Load .env config files to process environment first.
function loadLocalEnv() {
    try {
        // We use override: true to ensure the specific environment file takes precedence over default .env
        dotenv.config({ path: envFile, override: true });
        // console.debug (`Loaded config: ${envFile}`);
    } catch (err) {
        console.warn(`No external config found at ${envFile}, using defaults.`);
    }
}

// Apply overrides from the specific environment file if present
// Do this synchronously first!
loadLocalEnv();

const getEnvBool = (key, defaultValue) => {
    const value = process.env[key];
    if (value === 'true') return true;
    if (value === 'false') return false;
    return defaultValue;
};

export const SERVER_CONFIG = {
    CONTEXT_ROOT: process.env.CONTEXT_ROOT || '/',
    ENVIRON_NAME: ENV,
    PORT: parseInt(process.env.PORT, 10) || 8080,
    ROOT_DIR: path.join(process.cwd(), 'public'),

    DATA_DIR: path.join(projectRoot, 'data'),
    LOG_LEVEL: process.env.LOG_LEVEL || 'debug',

    // Performance
    CIRCUIT_BREAKER_TIMEOUT: 60000, // 1 minute lockout

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
        ENABLE_SURVEY: getEnvBool('ENABLE_SURVEY', true),
        ENABLE_SURVEY_NOTICE: getEnvBool('ENABLE_SURVEY_NOTICE', true),
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
        SURVEY_RCPT: process.env.SURVEY_RCPT || 'ZacVohs-Consulting@pm.me',
        SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
        SMTP_PORT: process.env.SMTP_PORT || 465,
        SMTP_USER: process.env.SMTP_USER || 'BaselineLogicNotice@gmail.com',
        SMTP_PASS: process.env.SMTP_PASS
    },

    URLS: {
        CONVERTKIT_SERVER: process.env.CONVERTKIT_API_URL,
        DB_MONDO_SERVER: process.env.MONGODB_URL,
        DB_REDIS_SERVER: process.env.DB_REDIS_SERVER,
    }

};

export const FILE_PATHS = {
    CONTACT_LOG: path.join(SERVER_CONFIG.DATA_DIR, 'contact_messages.json'),
    NEWSLETTER: path.join(SERVER_CONFIG.DATA_DIR, 'newsletters.json'),
    SUBSCRIBE_LIST: path.join(SERVER_CONFIG.DATA_DIR, 'subscribe.json'),
};

export const configJson = {
    "app": {
        "buildStatic": false,
        "contextRoot": "/Welcome",
        "name": "Welcome",
        "title": "Web Landing Page",
        "image": {
            "imageFile": "banner0.jpg",
            "caption": "Welcome!  We're glad you're here!"
        },
        "copyright": {
            "name": "Baseline Logic Systems, LLC",
            "email": "ZacVohs-Consulting@pm.me"
        },
        "features": {
            "authorizationFooter": false,
            "calendarLocal": false,
            "emailLocal": true,
            "newsletterLocal": false,
            "nodeMailerEnabled": false
        },
        "pages": {
            "index": {
                "enabled": true,
                "indexed": false,
                "contentFile": "index",
                "link": "index.html",
                "title": "Home"
            },
            "book": {
                "enabled": true,
                "indexed": false,
                "contentFile": "book",
                "link": "book.html",
                "title": "Backup Book"
            },
            "disclaimer": {
                "enabled": true,
                "indexed": false,
                "contentFile": "disclaimer",
                "link": "disclaimer.html",
                "title": "Disclaimer and Privacy Policy"
            },
            "survey": {
                "enabled": true,
                "indexed": true,
                "link": "survey.html",
                "title": "Survey Questions"
            },
            "policy": {
                "enabled": true,
                "indexed": true,
                "link": "policy.html",
                "title": "Survey Policy"
            }
        }
    }
}

