// src/test/js/server.test.js  – plain Node http
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import supertest from 'supertest';

import app from '../../../public/server.js';

const testStringHtml = "<html";
const testStringHeader = 'header id=\"site-header\"';
const testStringFooter = 'All Rights Reserved';
const testStringIndexContent = 'content';
const testStringNav = 'Home';

const stripSlash = s => s.endsWith('/') ? s.slice(0, -1) : s;

describe('Express server – status', () => {
  /* ----------------------------------------------------------
   *  0. Redirect from / to /WebLanding/
   * ---------------------------------------------------------- */
  it('GET /status returns 200 and JSON', async () => {
    const response = await supertest(app).get('/status');
    console.log (`DEBUG :: response: ${response.body}`);
    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(response.body, {"status":"ok"});
  });
});

describe('Express server – context‑root handling', () => {
  /* ----------------------------------------------------------
   *  1. Redirect from / to /WebLanding/
   * ---------------------------------------------------------- */
  it('GET / should redirect to /WebLanding/', async () => {
    const res = await supertest(app).get('/');
    assert.strictEqual(res.status, 301);
    assert.strictEqual(res.headers.location, '/WebLanding/');
  });

  /* ----------------------------------------------------------
   *  2. GET /WebLanding to home page
   * ---------------------------------------------------------- */
  it('GET /WebLanding redirects to /WebLanding/', async () => {
    const res = await supertest(app).get('/WebLanding');
    assert.strictEqual(res.status, 301);
    assert.strictEqual(res.headers.location, '/WebLanding/');
  });

  /* ----------------------------------------------------------
   *  3. GET /WebLanding/ to home page (regardless of trailing slash)
   * ---------------------------------------------------------- */
  it('GET /WebLanding/ should return the home page', async () => {
    const res = await supertest(app).get('/WebLanding/');
    assert.strictEqual(res.status, 200);
    assert.match(res.text, /<html/);
    assert.match(res.text, /Baseline Logic Systems/);
  });

  /* ----------------------------------------------------------
   *  4. GET /WebLanding/index.html → home page
   * ---------------------------------------------------------- */
  it('GET /WebLanding/index.html should return the home page', async () => {
    const res = await supertest(app).get('/WebLanding/index.html');
    assert.strictEqual(res.status, 200);
    assert.match(res.text, /<html/);
    assert.match(res.text, /Baseline Logic Systems/);
  });

  /* ----------------------------------------------------------
   *  5. GET /WebLanding/home → 404 (page not defined)
   * ---------------------------------------------------------- */
  it('GET /WebLanding/home should return 404 (not found)', async () => {
    const res = await supertest(app).get('/WebLanding/home');
    assert.strictEqual(res.status, 404);
    assert.match(res.text, /404 – Page Not Found/);
  });
});

describe('Express server – config file handling', () => {

  /* ----------------------------------------------------------
   *  6. GET /WebLanding/config/config.json → JSON payload
   * ---------------------------------------------------------- */
  it('GET /WebLanding/config/config.json should return JSON config', async () => {
    const res = await supertest(app).get('/WebLanding/config/config.json');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers['content-type'].includes('application/json'), true);
    const cfg = JSON.parse(res.text);
    assert.strictEqual(cfg.app.title, 'Web Landing Page');
  });

  /* ----------------------------------------------------------
   *  8. GET /WebLanding/config/unknown.json returns 404
   * ---------------------------------------------------------- */
  it('GET /WebLanding/config/.env.production.json should return 404', async () => {
    const res = await supertest(app).get('/WebLanding/config/.env.production.json');
    assert.strictEqual(res.status, 404);
    assert.match(res.text, /404 – Page Not Found/);
  });

});
