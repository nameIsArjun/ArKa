import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';

// Local development fallback: load .env.local if process.env is missing keys
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REFRESH_TOKEN) {
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
  } catch (e) {}
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const startTime = performance.now();

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { filename, mimeType, base64, isResumable } = body || {};

    if (!filename) {
      return res.status(400).json({ error: 'Missing filename parameter.' });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1SmRzW3JpwfkYwQ_hEF9Cr5k7_KVKWUZR';

    if (!clientId || !clientSecret || !refreshToken) {
      return res.status(500).json({
        error: 'Google OAuth2 credentials missing. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN.'
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({ refresh_token: refreshToken });

    if (isResumable) {
      // Get OAuth2 Access Token for direct browser-to-Google streaming (bypasses 4.5MB Vercel limit for videos!)
      const tokenRes = await oauth2Client.getAccessToken();
      const accessToken = tokenRes.token;

      if (!accessToken) {
        return res.status(500).json({ error: 'Failed to obtain access token for resumable video upload.' });
      }

      const googleRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json; charset=UTF-8',
            'X-Upload-Content-Type': mimeType || 'video/mp4',
          },
          body: JSON.stringify({
            name: filename,
            parents: [folderId],
          }),
        }
      );

      if (!googleRes.ok) {
        const errText = await googleRes.text();
        return res.status(googleRes.status).json({ error: `Google API Resumable Error: ${errText}` });
      }

      const uploadUrl = googleRes.headers.get('location');
      if (!uploadUrl) {
        return res.status(500).json({ error: 'Google API did not return upload location URL.' });
      }

      return res.status(200).json({
        success: true,
        uploadUrl,
        source: 'google-cloud-direct-resumable',
      });
    }

    if (!base64) {
      return res.status(400).json({ error: 'Missing base64 parameter for direct photo upload.' });
    }

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const buffer = Buffer.from(base64, 'base64');
    const mediaStream = Readable.from(buffer);

    const driveRes = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [folderId],
      },
      media: {
        mimeType: mimeType || 'image/jpeg',
        body: mediaStream,
      },
      fields: 'id, name, webViewLink',
    });

    const elapsedSec = ((performance.now() - startTime) / 1000).toFixed(2);

    return res.status(200).json({
      success: true,
      fileId: driveRes.data.id,
      fileName: driveRes.data.name,
      fileUrl: driveRes.data.webViewLink,
      elapsedSec,
      source: 'google-cloud-direct-api-v3',
    });
  } catch (err: any) {
    console.error('Error in Google Drive API upload function:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
