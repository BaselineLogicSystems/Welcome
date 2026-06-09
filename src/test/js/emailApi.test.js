import { describe, it } from 'node:test';

import assert from 'node:assert/strict';
import supertest from 'supertest';

import app from '../../../public/server.js';

const EMAIL_API = '/Welcome/api/emails';
const CONTACT_API = '/Welcome/api/contact';

describe('Email & Contact API - Persistence & Validation', () => {

    describe('Email List API', () => {
        it('GET /api/emails - should return a list of emails as an array', async () => {
            const res = await supertest(app).get(EMAIL_API);
            assert.strictEqual(res.status, 403);
            assert.strictEqual(Array.isArray(res.body), false);
        });

        // TODO: Without an authorization, the get /api/emails should return an auth error!  We need to add check to this call *with* authorization also.

        it('POST /api/emails - should add a valid email to the list', async () => {
            const payload = {
                email: 'test-user@example.com',
                action: 'add'
            };

            const res = await supertest(app)
                .post(EMAIL_API)
                .send(payload);

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.emails, 'test-user@example.com');
        });

        it('POST /api/emails - should remove an existing email from the list', async () => {
            // First ensure the email exists
            await supertest(app).post(EMAIL_API).send({ email: 'remove-me@example.com', action: 'add' });

            const payload = {
                email: 'remove-me@example.com',
                action: 'remove'
            };

            const res = await supertest(app)
                .post(EMAIL_API)
                .send(payload);

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.emails, 'remove-me@example.com');
        });

        it('POST /api/emails - should reject invalid email format', async () => {
            const payload = {
                email: 'not-an-email',
                action: 'add'
            };

            const res = await supertest(app)
                .post(EMAIL_API)
                .send(payload);

            assert.strictEqual(res.status, 400);
            assert.match(res.body.error || JSON.stringify(res.body), /Invalid request/);
        });

        it('POST /api/emails - should reject invalid action', async () => {
            const payload = {
                email: 'valid@example.com',
                action: 'delete-all' // Invalid action
            };

            const res = await supertest(app)
                .post(EMAIL_API)
                .send(payload);

            assert.strictEqual(res.status, 400);
        });

        it('POST /api/emails - should reject missing fields', async () => {
            const payload = {
                email: 'valid@example.com'
                // missing action
            };

            const res = await supertest(app)
                .post(EMAIL_API)
                .send(payload);

            assert.strictEqual(res.status, 400);
        });
    });

    describe('Contact Form API', () => {
        it('POST /api/contact - should accept a valid contact submission', async () => {
            const validContact = {
                from: 'John Doe',
                sender_email: 'john@example.com',
                subject: 'Hello there',
                body: 'This is a test message.'
            };

            const res = await supertest(app)
                .post(CONTACT_API)
                .send(validContact);

            assert.strictEqual(res.status, 201);
            assert.strictEqual(res.body.message, 'Message sent successfully');
        });

        it('POST /api/contact - should reject invalid email in contact form', async () => {
            const invalidContact = {
                from: 'John Doe',
                sender_email: 'not-an-email',
                subject: 'Hello',
                body: 'Test'
            };

            const res = await supertest(app)
                .post(CONTACT_API)
                .send(invalidContact);

            assert.strictEqual(res.status, 400);
            assert.match(res.body.error || JSON.stringify(res.body), /Invalid contact form data/);
        });

        it('POST /api/contact - should reject empty required fields', async () => {
            const invalidContact = {
                from: '', // Empty
                sender_email: 'john@example.com',
                subject: '', // Empty
                body: ''     // Empty
            };

            const res = await supertest(app)
                .post(CONTACT_API)
                .send(invalidContact);

            assert.strictEqual(res.status, 400);
        });
    });
});