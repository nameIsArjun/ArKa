import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Local development fallback: load .env.local if environment variables are not injected
if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
  try {
    const envLocalPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envLocalPath)) {
      const envContent = fs.readFileSync(envLocalPath, 'utf8');
      envContent.split('\n').forEach((line) => {
        const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let value = match[2].trim();
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
    }
  } catch (e) {
    // Ignore local parse error
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { filename, mimeType } = body || {};

    if (!filename) {
      return res.status(400).json({ error: 'Missing filename parameter in request body.' });
    }

    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1SmRzW3JpwfkYwQ_hEF9Cr5k7_KVKWUZR';

    if (!clientEmail || !privateKey) {
      return res.status(500).json({
        error: 'Google Service Account environment variables missing. Please configure GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in your environment.'
      });
    }

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive',
      ],
    });

    const tokenResponse = await auth.getAccessToken();
    const accessToken = tokenResponse.token;

    if (!accessToken) {
      return res.status(500).json({ error: 'Failed to obtain OAuth2 access token from Google.' });
    }

    // Request Google Drive Resumable Upload Session URL
    const googleRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Type': mimeType || 'image/jpeg',
        },
        body: JSON.stringify({
          name: filename,
          parents: [folderId],
        }),
      }
    );

    if (!googleRes.ok) {
      const errText = await googleRes.text();
      return res.status(googleRes.status).json({ error: `Google API Error (${googleRes.status}): ${errText}` });
    }

    const uploadUrl = googleRes.headers.get('location');
    if (!uploadUrl) {
      return res.status(500).json({ error: 'Google API response did not include a location header for the resumable upload.' });
    }

    return res.status(200).json({ uploadUrl });
  } catch (err: any) {
    console.error('Error in /api/upload handler:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
