
import { subscribeAPI } from './subscribeAPI.js';

export const subscribeUI = {
    async init(contextRoot) {
        try {

            // 1. Inject HTML Fragment
            const response = await fetch(`${contextRoot}/pages/components/emailSubscribe.html`);
            const htmlText = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');

            const subBox = doc.querySelector('.email-subscription-box');
            const placeholder = document.getElementById('email-subscription-component');

            if (!subBox || !placeholder) return;
            placeholder.innerHTML = subBox.outerHTML;

            // 2. Bind Events to the newly injected DOM
            this.bindEvents(contextRoot);

        } catch (err) {
            console.error('Error loading Subscribe UI:', err);
        }
    },

    bindEvents(contextRoot) {

        const emailInput = document.getElementById('emailInput');
        const feedback = document.getElementById('emailFeedback');
        const subBtn = document.getElementById('subscribeBtn');
        const unsubBtn = document.getElementById('unsubscribeBtn');

        const handleAction = async (action) => {
            const email = emailInput.value.trim();
            if (!email) {
                this.showFeedback('Please enter an email address', 'red', feedback);
                return;
            }

            const success = await subscribeAPI.updateSubscription(contextRoot, email, action);
            if (success) {
                this.showFeedback(`Successfully ${action === 'add' ? 'subscribed' : 'unsubscribed'}!`, 'green', feedback);
                emailInput.value = '';
            } else {
                this.showFeedback('An error occurred. Please try again.', 'red', feedback);
            }
        };

        subBtn.addEventListener('click', () => handleAction('add'));
        unsubBtn.addEventListener('click', () => handleAction('remove'));
    },

    showFeedback(msg, color, element) {
        element.textContent = msg;
        element.style.color = color;
    }
};
