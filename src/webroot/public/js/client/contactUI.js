
import { contactAPI } from './contactAPI.js';

export const contactUI = {
    async init(contextRoot) {
        try {
            // 1. Inject HTML Fragment
            const response = await fetch(`${contextRoot}/pages/components/emailContact.html`);
            const htmlText = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');

            const contactForm = doc.querySelector('.contact-form');
            const placeholder = document.getElementById('email-contact-component');
            if (!placeholder) {
                return;
            }

            if (!contactForm || !placeholder) return;
            placeholder.innerHTML = contactForm.outerHTML;

            // 2. Bind Events to the newly injected DOM
            this.bindEvents(contextRoot);
        } catch (err) {
            console.error('Error loading Contact UI:', err);
        }
    },

    bindEvents(contextRoot) {
        const form = document.getElementById('contactForm');
        const feedback = document.getElementById('contactFeedback');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await contactAPI.sendContactMessage(contextRoot, data);
                if (response.ok) {
                    feedback.textContent = 'Message sent successfully!';
                    feedback.style.color = 'green';
                    form.reset();
                } else {
                    feedback.textContent = 'Failed to send message.';
                    feedback.style.color = 'red';
                }
            } catch (err) {
                feedback.textContent = 'Network error occurred.';
                feedback.style.color = 'red';
            }
        });
    }
};