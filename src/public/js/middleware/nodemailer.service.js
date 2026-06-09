
import nodemailer from 'nodemailer';
import { logger } from './logger.js';
import { readConfigFile } from "../config/serverConfig.js";
import { SERVER_CONFIG } from '../config/serverEnv.js';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const EmailService = {
    async sendAdminAlert(errorDetails) {

        logger.info ("Reporting error in EmailService");

        // Only when feature flags enabled.  (Yes, 2 different features.)
        if (!SERVER_CONFIG.FEATURES.ENABLE_ADMIN_NOTIFICATIONS || !SERVER_CONFIG.NOTIFY_EMAIL) return;
        const config = await readConfigFile();
        if (!config.features?.nodeMailerEnabled === true) return;

        const mailOptions = {
            from: `"Landing Site Monitor" <${process.env.SMTP_USER}>`,
            to: SERVER_CONFIG.NOTIFY_EMAIL,
            subject: `🚨 CRITICAL NOTICE: Baseline Logic Systems Landing Site`,
            text: `A server error occurred.\n\nPath: ${errorDetails.path}\nMethod: ${errorDetails.method}\nError: ${errorDetails.message}\nStack: ${errorDetails.stack}`,
            html: `<h3>Critical Server Error</h3>
                   <p><strong>Path:</strong> ${errorDetails.path}</p>
                   <p><strong>Method:</strong> ${errorDetails.method}</p>
                   <p><strong>Message:</strong> <code style="color:red">${errorDetails.message}</code></p>
                   <pre style="background:#eee; padding:10px; overflow:auto">${errorDetails.stack}</pre>`
        };

        try {
            logger.debug ("Sending mail to transport");
            await transporter.sendMail(mailOptions);
            logger.info (`Mail sent to ${SERVER_CONFIG.NOTIFY_EMAIL}`);
        } catch (err) {
            logger.error({ err }, 'Internal server error in send admin alert email:');
        }
    },

    async sendContactAlert(contactDetails) {

        // Only when feature flags enabled.
        const config = await readConfigFile();
        if (!config.features?.nodeMailerEnabled === true) return;

        const mailOptions = {
            from: `"Landing Site Monitor" <${process.env.SMTP_USER}>`,
            to: process.env.NOTIFICATION_RCPT,
            subject: `🚨 PAGE CONTACT: ${contactDetails.subject}`,
            text: `Contact request received.\n\nFrom: ${contactDetails.from} <${contactDetails.sender_email}>\nSubject: ${contactDetails.subject}\nReceived: ${contactDetails.receivedAt}\nBody: ${contactDetails.body}`
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (err) {
            logger.error({ err }, 'Internal server error in send contact alert email:');
        }
    }

};
