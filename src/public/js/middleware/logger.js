
import pino from 'pino';
import { SERVER_CONFIG } from '../config/serverEnv.js';

const transport = SERVER_CONFIG.ENVIRON_NAME !== 'production'
    ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            // ignore: 'pid,hostname', // Removes noise to keep the focus on LEVEL :: Message
        },
    }
    : undefined;

export const logger = pino({
    level: SERVER_CONFIG.LOG_LEVEL || 'warn',
    transport
});
