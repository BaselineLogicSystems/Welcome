
import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    from: { type: String, required: true },
    sender_email: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    receivedAt: { type: Date, default: Date.now }
});

export const ContactModel = mongoose.model('Contact', contactSchema);

const subscribeSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    subscribedAt: { type: Date, default: Date.now }
});

export const SubscribeModel = mongoose.model('Subscribe', subscribeSchema);

const surveySchema = new mongoose.Schema({
    surveyLocation: { type: String },
    surveyDate: { type: String },
    clarity: { type: Number, required: true },
    knowledge: { type: Number, required: true },
    safety: { type: Number, required: true },
    patience: { type: Number, required: true },
    overall: { type: Number, required: true },
    strengths: { type: String },
    improvements: { type: String },
    clientId: { type: String },
    sessionId: { type: String },
    ipAddress: { type: String },
    createdAt: { type: Date, default: Date.now }
});

export const WelcomeModels = mongoose.model('Survey', surveySchema);
