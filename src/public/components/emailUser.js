
/**
 * Reusable Email Logic Component
 */
export const EmailComponent = {
    async getEmails(contextRoot) {
        const response = await fetch(`${contextRoot}/api/emails`);
        return await response.json();
    },

    async updateEmailList(contextRoot, email, action) {
        const response = await fetch(`${contextRoot}/api/emails`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, action })
        });
        return response.ok;
    },

    async sendContactMessage(contextRoot, data) {
        const response = await fetch(`${contextRoot}/api/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response;
    }
};