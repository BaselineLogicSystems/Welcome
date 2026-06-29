
import { DataDbService } from './data.dbservice.js';
import { SERVER_CONFIG } from '../config/serverEnv.js';

let configured = false;

export const SurveyService = {
    async getConfiguredDataService() {
        if (SERVER_CONFIG.FEATURES.ENABLE_DB_MONGO) {
            configured = true;
            return DataDbService;
        }
    },

    async submitSurvey(surveyData) {
        const dataService = await this.getConfiguredDataService();

        if (!configured || !dataService) {
            return surveyData;
        }

        return await dataService.saveSurvey(surveyData);
    },

    async getAllSurveys(params = {}) {
        const dataService = await this.getConfiguredDataService();
        if (!configured) {
            return [];
        }

        const result = await dataService.getSurveys({
            page: params.page || 1,
            limit: params.limit || 100
        });
        return result.data;
    }
};
