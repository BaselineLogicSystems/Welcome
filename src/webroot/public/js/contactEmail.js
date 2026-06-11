
import { EmailComponent } from '../components/emailUser.js';

document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('emailInput');
    const subscribeBtn = document.getElementById('subscribeBtn');
    const unsubscribeBtn = document.getElementById('unsubscribeBtn');
    const emailFeedback = document.getElementById('emailFeedback');
    const contactForm = document.getElementById('contactForm');
    const contactFeedback = document.getElementById('contactFeedback');

    const contextRoot = '/Welcome';

    async function handleEmailAction(action) {
        const email = emailInput.value.trim();
        if (!email) {
            showFeedback('Please enter an email address', 'red');
            return;
        }

        const success = await EmailComponent.updateEmailList(contextRoot, email, action);
        if (success) {
            showFeedback(`Successfully ${action === 'add' ? 'subscribed' : 'unsubscribed'}!`, 'green');
            emailInput.value = '';
        } else {
            showFeedback('An error occurred. Please try again.', 'red');
        }
    }

    function showFeedback(msg, color) {
        emailFeedback.textContent = msg;
        emailFeedback.style.color = color;
    }

    subscribeBtn.addEventListener('click', () => handleEmailAction('add'));
    unsubscribeBtn.addEventListener('click', () => handleEmailAction('remove'));

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await EmailComponent.sendContactMessage(contextRoot, data);
            if (response.ok) {
                contactFeedback.textContent = 'Message sent successfully!';
                contactFeedback.style.color = 'green';
                contactForm.reset();
            } else {
                contactFeedback.textContent = 'Failed to send message.';
                contactFeedback.style.color = 'red';
            }
        } catch (err) {
            contactFeedback.textContent = 'Network error occurred.';
            contactFeedback.style.color = 'red';
        }
    });
});