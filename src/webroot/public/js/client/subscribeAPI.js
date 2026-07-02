
/**
 * API wrapper for Newsletter Subscription management
 */
export const subscribeAPI = {
    async getEmails(contextRoot) {
        const response = await fetch(`${contextRoot}/api/emails`);
        return await response.json();
    },

    async updateSubscription(contextRoot, email, action) {
        const response = await fetch(`${contextRoot}/api/emails`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, action })
        });
        return response.ok;
    }
};
