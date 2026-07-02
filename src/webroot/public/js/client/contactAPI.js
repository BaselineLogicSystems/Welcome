
/**
 * API wrapper for Contact Form submissions
 */
export const contactAPI = {
    async sendContactMessage(contextRoot, data) {
        const response = await fetch(`${contextRoot}/api/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response;
    }
};
