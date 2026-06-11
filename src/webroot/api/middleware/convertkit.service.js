
import { SERVER_CONFIG } from '../config/serverEnv.js';
import { readConfigFile } from "../config/serverConfig.js";
import { logger } from "./logger.js";

export const ConvertKitService = {
    /**
     * Adds a subscriber to ConvertKit and assigns tags.
     * @param {string} email - The user's email address.
     * @param {string[]} tags - Array of tags to apply (e.g., ['subscribe', 'contact_request']).
     */
    async addSubscriber(email, tags = []) {

        if (SERVER_CONFIG.FEATURES.ENABLE_ANALYTICS_CONVERT && SERVER_CONFIG.KEYS.CONVERTKIT_API_KEY) {
            logger.info("Converting subscriber")
            const config = await readConfigFile();

            const apiKey = SERVER_CONFIG.KEYS.CONVERTKIT_API_KEY;
            if (!apiKey) {
                throw new Error('ConvertKit API Key is not configured.');
            }

            // Note: ConvertKit's API for adding subscribers often requires
            // an API key and specifically targets the /subscribers endpoint.
            const url = SERVER_CONFIG.URLS.CONVERTKIT_SERVER;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': apiKey,
                },
                body: JSON.stringify({
                    email: email,
                    tags: tags,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`ConvertKit API Error: ${errorData.message || response.statusText}`);
            }

            return await response.json();
        }
    }
};
