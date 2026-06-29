
import fs from 'fs/promises';
import path from 'path';
import { ContactModel, SubscribeModel, WelcomeModels } from '../models/welcome.models.js';
import { logger } from '../middleware/logger.js';
import { FILE_PATHS, SERVER_CONFIG } from '../config/serverEnv.js';

let configured = false;

// --- Survey & Database Service ---
export const SurveyService = {
    async getConfiguredDataService() {
        if (SERVER_CONFIG.FEATURES.ENABLE_DB_MONGO) {
            configured = true;
            return this;
        }
        return null;
    },

    async saveMessage(contactData) {
        try {
            logger.info({ from: contactData.from }, 'Processing new contact enquiry (db)');
            const newMessage = new ContactModel(contactData);
            return await newMessage.save();
        } catch (err) {
            logger.error({ err, contactData }, 'Database error saving contact message');
            throw err;
        }
    },

    async searchMessages({ page = 1, limit = 10 }) {
        try {
            const numericPage = Math.max(1, Number(page));
            const numericLimit = Math.max(1, Math.min(100, Number(limit)));

            const total = await ContactModel.countDocuments();
            const messages = await ContactModel.find()
                .skip((numericPage - 1) * numericLimit)
                .limit(numericLimit);

            return {
                total,
                messages,
                page: numericPage,
                limit: numericLimit
            };
        } catch (err) {
            logger.error({ err }, 'Database error searching contact messages');
            throw err;
        }
    },

    async getSubscribers({ page = 1, limit = 10 }) {
        try {
            const numericPage = Math.max(1, Number(page));
            const numericLimit = Math.max(1, Math.min(100, Number(limit)));
            const total = await SubscribeModel.countDocuments();
            const data = await SubscribeModel.find()
                .skip((numericPage - 1) * numericLimit)
                .limit(numericLimit)
                .sort({ subscribedAt: -1 });

            return { total, data, page: numericPage, limit: numericLimit };
        } catch (err) {
            logger.error({ err }, 'Database error fetching subscribers');
            throw err;
        }
    },

    async removeSubscriber(email) {
        try {
            await SubscribeModel.deleteOne({ email });
            return { success: true };
        } catch (err) {
            logger.error({ err, email }, 'Database error removing subscriber');
            throw err;
        }
    },

    async saveSubscriber(subscriberData) {
        try {
            return await SubscribeModel.findOneAndUpdate(
                {email: subscriberData.email},
                {$setOnInsert: {email: subscriberData.email, subscribedAt: new Date()}},
                {upsert: true, new: true}
            );
        } catch (err) {
            logger.error({ err, email: subscriberData.email }, 'Database error saving subscriber');
            throw err;
        }
    },

    async getSurveysDb({ page = 1, limit = 100 }) {
        try {
            const numericPage = Math.max(1, Number(page));
            const numericLimit = Math.max(1, Math.min(100, Number(limit)));

            const skip = (numericPage - 1) * numericLimit;
            const data = await WelcomeModels.find().sort({ createdAt: -1 }).skip(skip).limit(numericLimit);
            const total = await WelcomeModels.countDocuments();
            return { data, total, page: numericPage, limit: numericLimit };
        } catch (err) {
            logger.error({ err }, 'Database error fetching survey data');
            throw err;
        }
    },

    async saveSurveyDb(surveyData) {
        try {
            const survey = new WelcomeModels(surveyData);
            await survey.save();
        } catch (err) {
            logger.error({ err, surveyData }, 'Database error saving survey data');
            throw err;
        }
    },

    async submitSurvey(surveyData) {
        const dataService = await this.getConfiguredDataService();
        if (!configured || !dataService) return surveyData;
        return await dataService.saveSurveyDb(surveyData);
    },

    async getAllSurveys(params = {}) {
        const dataService = await this.getConfiguredDataService();
        if (!configured) return [];
        const result = await dataService.getSurveysDb({
            page: params.page || 1,
            limit: params.limit || 100
        });
        return result.data;
    }
};

// --- Subscribe Service ---
export const SubscribeService = {
    async subscribeNewsletter(emailAddress) {
        logger.info({ emailAddress }, 'Adding newsletter subscriber');
        try {
            if (SERVER_CONFIG.FEATURES.ENABLE_DB_MONGO) {
                return await SurveyService.saveSubscriber({ email: emailAddress });
            }

            let contacts = [];
            try {
                const data = await fs.readFile(FILE_PATHS.SUBSCRIBE_LIST, 'utf8');
                contacts = JSON.parse(data);
            } catch (err) {
                if (err.code !== 'ENOENT') throw err;
            }

            const exists = contacts.find(e => e.email === emailAddress);
            if (!exists) {
                contacts.push({ email: emailAddress, subscribedAt: new Date().toISOString() });
                await fs.mkdir(path.dirname(FILE_PATHS.SUBSCRIBE_LIST), { recursive: true });
                await fs.writeFile(FILE_PATHS.SUBSCRIBE_LIST, JSON.stringify(contacts, null, 2));
            }
        } catch (err) {
            logger.error({ err }, 'Error in subscribeNewsletter');
            throw err;
        }
    },

    async getEmailList() {
        if (SERVER_CONFIG.FEATURES.ENABLE_DB_MONGO) {
            const result = await SurveyService.getSubscribers({ limit: 1000 });
            return result.data;
        }

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
        if (SERVER_CONFIG.FEATURES.ENABLE_DB_MONGO) {
            if (action === 'add') await SurveyService.saveSubscriber({ email });
            else if (action === 'remove') await SurveyService.removeSubscriber(email);
            return email;
        }

        if (SERVER_CONFIG.FEATURES.ENABLE_DB_LOCAL && FILE_PATHS.SUBSCRIBE_LIST) {
            const emails = await this.getEmailList();
            logger.info (`Update email list: ${action}: ${email}`)
            try {
                if (action === 'add') {
                    const exists = emails.find(e => e.email === email);
                    if (!exists) emails.push({ email, subscribedAt: new Date().toISOString() });
                } else if (action === 'remove') {
                    const filtered = emails.filter(e => e.email !== email);
                    emails.splice(0, emails.length, ...filtered);
                }

                await fs.mkdir(path.dirname(FILE_PATHS.SUBSCRIBE_LIST), { recursive: true });
                await fs.writeFile(FILE_PATHS.SUBSCRIBE_LIST, JSON.stringify(emails, null, 2));
            } catch (err) {
                logger.error ({ err: err }, "Failed to update email list!");
            }
        }
        return email;
    }
};

// --- Contact Service ---
export const ContactService = {
    async saveMessage(contactData) {
        if (SERVER_CONFIG.FEATURES.ENABLE_DB_MONGO) {
            return await SurveyService.saveMessage(contactData);
        }

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
