
/**
 * API wrapper for Survey Form submissions
 */
export const surveyAPI = {
    async sendSurveyMessage(contextRoot, data) {
        const response = await fetch(`/api/survey`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response;
    }
};
