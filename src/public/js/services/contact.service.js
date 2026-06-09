
import fs from 'fs/promises';
import path from 'path';
import { FILE_PATHS } from '../config/serverEnv.js';
import { logger } from '../middleware/logger.js';

export const ContactService = {
    async saveMessage(contactData) {
        logger.info({ from: contactData.from }, 'Processing new contact enquiry');
        let messages = [];
        try {
            const data = await fs.readFile(FILE_PATHS.CONTACT_LOG, 'utf8');
            messages = JSON.parse(data);
        } catch (err) {
            if (err.code !== 'ENOENT') {
                logger.error({ err }, 'Critical error reading contact log');
                throw err;
            }
        }

        const newMessage = {
            ...contactData,
            id: crypto.randomUUID(),
            receivedAt: new Date().toISOString()
        };
        messages.push(newMessage);

        await fs.mkdir(path.dirname(FILE_PATHS.CONTACT_LOG), { recursive: true });
        await fs.writeFile(FILE_PATHS.CONTACT_LOG, JSON.stringify(messages, null, 2));
        return newMessage;
    }
};