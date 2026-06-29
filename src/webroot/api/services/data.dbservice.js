
import { ContactModel } from '../models/welcome.models.js';
import { SubscribeModel } from '../models/welcome.models.js';
import { WelcomeModels } from '../models/welcome.models.js';

import { logger } from '../middleware/logger.js';

export const DataDbService = {

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

    async getSurveys({ page = 1, limit = 100 }) {
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

    async saveSurvey(surveyData) {
        try {
            const survey = new WelcomeModels(surveyData);
            await survey.save();
        } catch (err) {
            logger.error({ err, surveyData }, 'Database error saving survey data');
            throw err;
        }
    }

};