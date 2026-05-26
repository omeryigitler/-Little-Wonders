import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { createAdminToken } from './auth.js';

const ADMIN_TOKEN_KEY = 'mybabyshire-admin-token-v1';

const getBaseUrl = (req: VercelRequest) => {
  const configured = process.env.PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (configured) return configured;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${host}`;
};

const getAdminRedirectUri = (req: VercelRequest) => {
  return process.env.GOOGLE_REDIRECT_URI?.replace(/\/$/, '') || `${getBaseUrl(req)}/api/admin-google-callback`;
};

const getAllowedAdminEmails = () => {
  const emails = [process.env.ADMIN_EMAIL, process.env.GOOGLE_ADMIN_EMAILS]
    .filter(Boolean)
    .join(',')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return new Set(emails);
};

const fail = (res: VercelResponse, message: string) => {
  return res.redirect(`/admin?auth_error=${encodeURIComponent(message)}`);
};

const successHtml = (token: string) => {
  return `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head><body><script>localStorage.setItem('${ADMIN_TOKEN_KEY}', ${JSON.stringify(token)}); window.location.replace('/admin');</script></body></html>`;
};

export async function handleAdminGoogleRequest(req: VercelRequest, res: VercelResponse) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return fail(res, 'Google admin sign-in is not configured.');
  }

  if (!process.env.JWT_SECRET) {
    return fail(res, 'JWT_SECRET is missing.');
  }

  if (!req.query.code && !req.query.error) {
    const state = jwt.sign({ provider: 'google-admin', createdAt: Date.now() }, process.env.JWT_SECRET, { expiresIn: '10m' });
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: getAdminRedirectUri(req),
      response_type: 'code',
      scope: 'openid email profile',
      prompt: 'select_account',
      state,
    });

    return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  }

  try {
    if (req.query.error) return fail(res, `Google admin sign-in failed: ${String(req.query.error)}`);

    const code = String(req.query.code || '');
    const state = String(req.query.state || '');
    if (!code || !state) return fail(res, 'Missing Google admin response.');

    const decodedState = jwt.verify(state, process.env.JWT_SECRET) as { provider?: string };
    if (decodedState.provider !== 'google-admin') return fail(res, 'Invalid Google admin state.');

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: getAdminRedirectUri(req),
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.id_token) return fail(res, tokenData.error_description || tokenData.error || 'Google token failed.');

    const profileResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenData.id_token)}`);
    const profile = await profileResponse.json();
    const email = String(profile.email || '').trim().toLowerCase();
    const verified = profile.email_verified === true || profile.email_verified === 'true';

    if (!profileResponse.ok || profile.aud !== process.env.GOOGLE_CLIENT_ID || !verified || !email) {
      return fail(res, 'Google admin account could not be verified.');
    }

    if (!getAllowedAdminEmails().has(email)) {
      return fail(res, `${email} is not allowed to access the admin panel.`);
    }

    const adminToken = createAdminToken(email);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(successHtml(adminToken));
  } catch (error) {
    return fail(res, (error as Error).message || 'Google admin sign-in failed.');
  }
}
