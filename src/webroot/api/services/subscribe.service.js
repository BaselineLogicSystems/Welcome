
import fs from 'fs/promises';
import path from 'path';

import { FILE_PATHS, SERVER_CONFIG } from '../config/serverEnv.js';
import { logger } from "../middleware/logger.js";

export const SubscribeService = {

    async subscribeNewsletter(emailAddress) {
        logger.info({ emailAddress }, 'Adding newsletter subscriber');
        let contacts = [];
        try {
            const data = await fs.readFile(FILE_PATHS.SUBSCRIBE_LIST, 'utf8');
            contacts = JSON.parse(data);
        } catch (err) {
            if (err.code === 'ENOENT') {
                logger.debug('No existing subscriber list found. Creating new file.');
            } else {
                logger.error({ err }, 'Critical error reading subscriber list');
                throw err;
            }
        }
    },

    async getEmailList() {
        if (SERVER_CONFIG.FEATURES.ENABLE_DB_LOCAL && FILE_PATHS.SUBSCRIBE_LIST) {
            try {
                const data = await fs.readFile(FILE_PATHS.SUBSCRIBE_LIST, 'utf8');
                return JSON.parse(data);
            } catch (err) {
                logger.error({err: err}, "Failed to get email list!");
            }
        }
        return [];
    },

    async getNewSubscribers(sinceDate) {
        const emails = await this.getEmailList();
        return emails.filter(e => new Date(e.subscribedAt) >= sinceDate);
    },

    async updateEmailList(email, action) {
        if (SERVER_CONFIG.FEATURES.ENABLE_DB_LOCAL && FILE_PATHS.SUBSCRIBE_LIST) {
            const emails = await this.getEmailList();
            logger.info (`Update email list: ${action}: ${email}`)
            try {
                if (action === 'add') {
                    const exists = emails.find(e => e.email === email);
                    if (!exists) {
                        emails.push({ email, subscribedAt: new Date().toISOString() });
                    }

                } else if (action === 'remove') {
                    const filtered = emails.filter(e => e.email !== email);
                    emails.splice(0, emails.length, ...filtered);
                }

                logger.debug (`Writing file subscriber list (len: ${emails.length})`)

                await fs.mkdir(path.dirname(FILE_PATHS.SUBSCRIBE_LIST), { recursive: true });
                await fs.writeFile(FILE_PATHS.SUBSCRIBE_LIST, JSON.stringify(emails, null, 2));
                logger.debug (`Update wrote file ${FILE_PATHS.SUBSCRIBE_LIST}`)

            } catch (err) {
                logger.error ({ err: err }, "Failed to update email list!");
            }
        }

        return email;
    }
};