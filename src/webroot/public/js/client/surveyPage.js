
import { surveyUI } from './surveyUi.js';

window.addEventListener('DOMContentLoaded', async () => {
    try {
        await surveyUI.init('');
    } catch (error) {
        console.error('Failed to initialize survey page:', error);
    }
});