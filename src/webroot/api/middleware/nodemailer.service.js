
import nodemailer from 'nodemailer';
import { logger } from './logger.js';
import { SERVER_CONFIG } from '../config/serverEnv.js';

let circuitBrokenUntil = 0;

const validateConfig = () => {
    const requiredKeys = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SURVEY_RCPT'];
    const missingKeys = requiredKeys.filter(key => !SERVER_CONFIG.KEYS[key]);

    if (missingKeys.length > 0) {
        logger.error(`EmailService configuration is incomplete. Missing: ${missingKeys.join(', ')}${!SERVER_CONFIG.KEYS.SURVEY_RCPT ? ', SURVEY_RCPT' : ''}`);
        return false;
    }
    return true;
};

const getTransporter = () => {
    if (!validateConfig()) return null;

    return nodemailer.createTransport({
        host: SERVER_CONFIG.KEYS.SMTP_HOST,
        port: SERVER_CONFIG.KEYS.SMTP_PORT,
        secure: true,
        service: "gmail",
        auth: {
            user: SERVER_CONFIG.KEYS.SMTP_USER,
            pass: SERVER_CONFIG.KEYS.SMTP_PASS,
        },
    });
};

export const EmailService = {
    async sendAdminAlert(errorDetails) {
        if (SERVER_CONFIG.FEATURES.ENABLE_ADMIN_NOTIFICATIONS !== true) return;
        if (Date.now() < circuitBrokenUntil) {
            logger.warn("EmailService circuit is open. Skipping admin alert.");
            logger.error({ err: errorDetails}, "Failed to send admin notice email!");
            return;
        }

        logger.info("Reporting error in EmailService");
        const transporter = getTransporter();
        if (!transporter) return;

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
            circuitBrokenUntil = Date.now() + 60000; // Break for 1 minute
            logger.error({ err }, 'Internal server error in send admin alert email:');
        }
    },

    async sendSurveyAlert(surveyDetails) {
        if (SERVER_CONFIG.FEATURES.ENABLE_SURVEY_NOTICE !== true) return;

        if (Date.now() < circuitBrokenUntil) {
            logger.warn("EmailService circuit is open. Skipping survey alert.");
            logger.error({errorDetails}, "Failed to send survey alert email!");
            return;
        }

        // Only when feature flag is enabled.
        logger.info ("Mailing survey details");
        const transporter = getTransporter();
        if (!transporter) return;

        try {
            // Careful!  Place in try catch, to avoid unexpected failure.
            const mailOptions = {
                from: `"BLS: Survey Notice" <${SERVER_CONFIG.KEYS.SMTP_USER}>`,
                to: SERVER_CONFIG.KEYS.SURVEY_RCPT,
                subject: `🚨 Survey Result on: ${surveyDetails.createdAt}`,
                text: `Survey result received.\n\nFrom: ${surveyDetails.surveyLocation || "(empty)"} on ${surveyDetails.surveyDate || "(empty)"}\nClarity: ${surveyDetails.clarity}, Knowledge: ${surveyDetails.knowledge}, Safety: ${surveyDetails.safety}, Patience: ${surveyDetails.patience}, Overall: ${surveyDetails.overall}\n\nStrengths: ${surveyDetails.strengths || "(empty)"}\nImprovements: ${surveyDetails.improvements || "(empty)"}\nIP Hash: ${surveyDetails.ipAddress?.substring(0,20)}\n\nBest Regards,\nBaseline Logic Systems, LLC\nBaselineLogicSystems@pm.me\n\n`
            };

            const strOptions = JSON.stringify(mailOptions);
            logger.info(`Sending mail: ${strOptions}`);

            // Limit service use until ready.
            if (SERVER_CONFIG.ENVIRON_NAME === 'production') {
                await transporter.sendMail(mailOptions);
            }

            logger.info ("Email sent");
        } catch (err) {
            circuitBrokenUntil = Date.now() + 60000; // Break for 1 minute
            logger.error({ err }, 'Internal server error in send contact alert email:');
        }
    }

};
