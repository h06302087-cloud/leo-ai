import { Router } from 'express';
import axios from 'axios';
import crypto from 'crypto';

const router = Router();

const credentials = new Map();

const AVAILABLE_INTEGRATIONS = [
  { name: 'Slack', icon: 'slack', description: 'Send messages and notifications to Slack channels', requiredScopes: ['chat:write', 'channels:read'] },
  { name: 'Stripe', icon: 'stripe', description: 'Process payments and manage subscriptions', requiredScopes: ['read_write'] },
  { name: 'SendGrid', icon: 'sendgrid', description: 'Send transactional and marketing emails', requiredScopes: ['mail.send'] },
  { name: 'Google Sheets', icon: 'google', description: 'Read and write data to Google Sheets', requiredScopes: ['https://www.googleapis.com/auth/spreadsheets'] },
  { name: 'Discord', icon: 'discord', description: 'Post messages via Discord webhooks', requiredScopes: ['webhook'] },
  { name: 'Airtable', icon: 'airtable', description: 'Manage Airtable bases and records', requiredScopes: ['data.records:read', 'data.records:write'] },
];

router.get('/available', (_req, res) => {
  res.json({ success: true, data: { integrations: AVAILABLE_INTEGRATIONS } });
});

router.post('/authorize', (req, res) => {
  const { service, redirectUri, scope } = req.body;
  const state = crypto.randomBytes(32).toString('hex');

  // In production, redirect to actual OAuth provider
  const authUrls: Record<string, string> = {
    slack: `https://slack.com/oauth/v2/authorize?client_id=\${process.env.SLACK_CLIENT_ID}&scope=\${scope}&redirect_uri=\${redirectUri}&state=\${state}`,
    google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=\${process.env.GOOGLE_CLIENT_ID}&scope=\${scope}&redirect_uri=\${redirectUri}&response_type=code&state=\${state}`,
  };

  res.json({
    success: true,
    data: { authUrl: authUrls[service] || '#', state },
  });
});

router.post('/callback', (req, res) => {
  const { code, state } = req.body;
  const credentialId = `cred_${Date.now()}`;

  // In production, exchange code for access token
  credentials.set(credentialId, {
    id: credentialId,
    code,
    state,
    accessToken: `token_${crypto.randomBytes(16).toString('hex')}`,
    expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
  });

  res.json({ success: true, data: { credentialId, expiresAt: credentials.get(credentialId).expiresAt } });
});

router.post('/webhook/test', async (req, res) => {
  const { url, payload, headers } = req.body;

  const startTime = Date.now();
  try {
    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json', ...headers },
      timeout: 10000,
      validateStatus: () => true,
    });

    res.json({
      success: true,
      data: {
        statusCode: response.status,
        responseTime: Date.now() - startTime,
        body: response.data,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
