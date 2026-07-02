
import { surveyAPI } from './surveyAPI.js';

// Helper for UUID generation (standard browser crypto API)
const generateUUID = () => crypto.randomUUID();

const getTrackingIds = () => {
    // Persistent ID: stays across restarts
    let clientId = localStorage.getItem('bls_survey_client_id');
    if (!clientId) {
        clientId = generateUUID();
        localStorage.setItem('bls_survey_client_id', clientId);
    }

    // Session ID: expires when tab closes
    let sessionId = sessionStorage.getItem('bls_survey_session_id');
    if (!sessionId) {
        sessionId = generateUUID();
        sessionStorage.setItem('bls_survey_session_id', sessionId);
    }

    return { clientId, sessionId };
};

export const surveyUI = {    async init(contextRoot) {
        try {
            // 1. Inject HTML Fragment
            const response = await fetch(`/pages/components/surveyForm.html`);
            const htmlText = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');

            const surveyForm = doc.querySelector('.survey-container');
            const placeholder = document.getElementById('survey-component');
            if (!placeholder) {
                return;
            }

            if (!surveyForm || !placeholder) return;
            placeholder.innerHTML = surveyForm.outerHTML;

            // 2. Bind Events to the newly injected DOM
            this.bindEvents(contextRoot);
        } catch (err) {
            console.error('Error loading survey UI:', err);
        }
    },

    bindEvents(contextRoot) {
        const form = document.getElementById('surveyForm');
        const feedback = document.getElementById('surveyFeedback');
        const submitBtn = form.querySelector('.submit-btn');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Prevent repeated submissions by disabling the button
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            const formData = new FormData(form);
            const rawData = Object.fromEntries(formData.entries());
            const { clientId, sessionId } = getTrackingIds();

            // Clean and truncate data to 8000 chars on client side for better UX
            const truncate = (str, len) => str?.slice(0, len);

            const data = {
                ...rawData,
                clarity: rawData.clarity || undefined, // Let Zod handle the coercion/optional logic
                knowledge: rawData.knowledge || undefined,
                safety: rawData.safety || undefined,
                patience: rawData.patience || undefined,
                overall: rawData.overall || undefined,
                surveyLocation: truncate(rawData.surveyLocation?.trim(), 80) || undefined,
                surveyDate: truncate(rawData.surveyDate?.trim(), 20) || undefined,
                strengths: truncate(rawData.strengths?.trim(), 1200) || undefined,
                improvements: truncate(rawData.improvements?.trim(), 1200) || undefined,
                clientId,
                sessionId
            };

            try {
                const response = await surveyAPI.sendSurveyMessage(contextRoot, data);
                if (response.ok) {
                    // Fetch and display the success response page
                    const respHtml = await fetch(`/pages/components/surveyResponse.html`);
                    const htmlText = await respHtml.text();
                    const placeholder = document.getElementById('survey-component');
                    if (placeholder) {
                        placeholder.innerHTML = htmlText;
                    }
                } else {
                    const errData = await response.json().catch(() => ({}));
                    feedback.textContent = errData.error || 'Failed to send message.';
                    feedback.style.color = 'red';
                }
            } catch (err) {
                feedback.textContent = 'Submit failed: Network error occurred.';
                feedback.style.color = 'red';
            } finally {
                // Re-enable button after request completes
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Feedback';
            }
        });
    }
};