
import nodemailer from 'nodemailer';
import { logger } from './logger.js';
import { readConfigFile, SERVER_CONFIG } from '../config/serverEnv.js';

// TODO - add circuit breaker

const transporter = nodemailer.createTransport({
    host: SERVER_CONFIG.KEYS.SMTP_HOST,
    port: SERVER_CONFIG.KEYS.SMTP_PORT,
    secure: true,
    service: "gmail",
    auth: {
        user: SERVER_CONFIG.KEYS.SMTP_USER,
        pass: SERVER_CONFIG.KEYS.SMTP_PASS,
    },
});

export const EmailService = {
    async sendAdminAlert(errorDetails) {

        logger.info("Reporting error in EmailService");

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

    async sendSurveyAlert(surveyDetails) {

        // Only when feature flag is enabled.
        // if (SERVER_CONFIG.FEATURES.ENABLE_SURVEY_NOTICE !== true) return;
        logger.info ("Mailing survey details");

        try {
            const mailOptions = {
                from: `"BLS: Survey Notice" <${SERVER_CONFIG.KEYS.SMTP_USER}>`,
                to: SERVER_CONFIG.KEYS.SURVEY_RCPT,
                subject: `🚨 Survey Result on: ${surveyDetails.createdAt}`,
                text: `Survey result received.\n\nFrom: ${surveyDetails.customerName || "(empty)"} on ${surveyDetails.customerDate || "(empty)"}\nClarity: ${surveyDetails.clarity}, Knowledge: ${surveyDetails.knowledge}, Safety: ${surveyDetails.safety}, Patience: ${surveyDetails.patience}, Overall: ${surveyDetails.overall}\n\nStrengths: ${surveyDetails.strengths || "(empty)"}\nImprovements: ${surveyDetails.improvements || "(empty)"}\n\nBest Regards,\nBaseline Logic Systems, LLC\nBaselineLogicSystems@pm.me\n\n`
            };

            const strOptions = JSON.stringify(mailOptions);

            logger.info(`Sending mail: ${strOptions}`);

            // TODO: Move up after testing!  To:::
            // Only when feature flag is enabled.
            if (SERVER_CONFIG.FEATURES.ENABLE_SURVEY_NOTICE !== true
                 || SERVER_CONFIG.ENVIRON_NAME === 'testrunner')  // Double-careful for now; test often!
                return;

            await transporter.sendMail(mailOptions);

            logger.info ("Email sent");
        } catch (err) {
            logger.error({ err }, 'Internal server error in send contact alert email:');
        }
    }

};
