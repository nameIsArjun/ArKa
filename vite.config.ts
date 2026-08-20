import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { google } from 'googleapis';
import { Readable } from 'stream';
import fs from 'fs';

// Helper to load .env.local in Vite config
const loadEnvLocal = () => {
  try {
    const envLocalPath = path.resolve(__dirname, '.env.local');
    if (fs.existsSync(envLocalPath)) {
      const content = fs.readFileSync(envLocalPath, 'utf8');
      content.split('\n').forEach((line) => {
        const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let value = match[2].trim();
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          if (!process.env[key]) process.env[key] = value;
        }
      });
    }
  } catch (e) {}
};

loadEnvLocal();

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    {
      name: 'local-api-upload-middleware',
      configureServer(server) {
        server.middlewares.use('/api/upload', (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end(JSON.stringify({ error: 'Method Not Allowed' }));
            return;
          }
          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });
          req.on('end', async () => {
            const startTime = performance.now();
            try {
              const body = JSON.parse(bodyStr);
              const { action, filename, mimeType, base64, uploadUrl, chunkBase64, contentRange } = body || {};

              const clientId = process.env.GOOGLE_CLIENT_ID;
              const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
              const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
              const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1SmRzW3JpwfkYwQ_hEF9Cr5k7_KVKWUZR';

              if (!clientId || !clientSecret || !refreshToken) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Google OAuth2 credentials missing in .env.local' }));
                return;
              }

              const oauth2Client = new google.auth.OAuth2(
                clientId,
                clientSecret,
                'https://developers.google.com/oauthplayground'
              );
              oauth2Client.setCredentials({ refresh_token: refreshToken });

              if (action === 'start') {
                const tokenRes = await oauth2Client.getAccessToken();
                const accessToken = tokenRes.token;

                if (!accessToken) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: 'Failed to obtain access token for resumable video upload.' }));
                  return;
                }

                const googleRes = await fetch(
                  'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
                  {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                      'Content-Type': 'application/json; charset=UTF-8',
                      'X-Upload-Content-Type': mimeType || 'application/octet-stream',
                    },
                    body: JSON.stringify({
                      name: filename,
                      parents: [folderId],
                    }),
                  }
                );

                if (!googleRes.ok) {
                  const errText = await googleRes.text();
                  res.statusCode = googleRes.status;
                  res.end(JSON.stringify({ error: `Google API Resumable Error: ${errText}` }));
                  return;
                }

                const sessionUrl = googleRes.headers.get('location');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, uploadUrl: sessionUrl, source: 'vite-local-resumable-start' }));
                return;
              }

              if (action === 'chunk') {
                const chunkBuffer = Buffer.from(chunkBase64, 'base64');
                const googleRes = await fetch(uploadUrl, {
                  method: 'PUT',
                  headers: {
                    'Content-Range': contentRange,
                    'Content-Type': mimeType || 'application/octet-stream',
                  },
                  body: chunkBuffer,
                });

                if (googleRes.status === 308 || googleRes.ok) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true, status: googleRes.status, completed: googleRes.ok, source: 'vite-local-resumable-chunk' }));
                  return;
                }

                const errText = await googleRes.text();
                res.statusCode = googleRes.status;
                res.end(JSON.stringify({ error: `Google Chunk Upload Error: ${errText}` }));
                return;
              }

              if (!base64) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Missing base64 parameter.' }));
                return;
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

              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  fileId: driveRes.data.id,
                  fileName: driveRes.data.name,
                  fileUrl: driveRes.data.webViewLink,
                  elapsedSec,
                  source: 'vite-local-direct-oauth-v3',
                })
              );
            } catch (err: any) {
              console.error('Error in local dev upload middleware:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message || 'Server Error' }));
            }
          });
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
