import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import uploadHandler from './api/upload';
import blessingsHandler from './api/blessings';
import trackHandler from './api/track';

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
      name: 'local-api-middleware',
      configureServer(server) {
        // Local development middleware for /api/upload
        server.middlewares.use('/api/upload', async (req, res) => {
          try {
            const urlObj = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
            const queryAction = urlObj.searchParams.get('action');
            const queryFileId = urlObj.searchParams.get('fileId');

            const handleRequest = async (bodyObj: any) => {
              const fakeVercelReq: any = {
                method: req.method,
                headers: req.headers,
                url: req.url,
                body: bodyObj,
                query: Object.fromEntries(urlObj.searchParams),
              };

              const fakeVercelRes: any = {
                statusCode: 200,
                setHeader: (k: string, v: string) => res.setHeader(k, v),
                status: function(code: number) {
                  res.statusCode = code;
                  this.statusCode = code;
                  return this;
                },
                json: (data: any) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                },
                send: (data: any) => {
                  res.end(data);
                },
                end: (data?: any) => {
                  res.end(data);
                },
              };

              await uploadHandler(fakeVercelReq, fakeVercelRes);
            };

            if (req.method === 'GET' || queryAction === 'media' || queryAction === 'list') {
              await handleRequest({ action: queryAction, fileId: queryFileId });
            } else {
              let bodyStr = '';
              req.on('data', (chunk) => { bodyStr += chunk; });
              req.on('end', async () => {
                let body: any = {};
                if (bodyStr) {
                  try { body = JSON.parse(bodyStr); } catch (e) {}
                }
                await handleRequest(body);
              });
            }
          } catch (err: any) {
            console.error('Error in local /api/upload middleware:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message || 'Server Error' }));
          }
        });

        // Local development middleware for /api/blessings
        server.middlewares.use('/api/blessings', async (req, res) => {
          try {
            let bodyStr = '';
            req.on('data', (chunk) => { bodyStr += chunk; });
            req.on('end', async () => {
              try {
                const body = bodyStr ? JSON.parse(bodyStr) : {};
                const fakeVercelReq: any = {
                  method: req.method,
                  headers: req.headers,
                  body,
                  query: {},
                };
                const fakeVercelRes: any = {
                  setHeader: (k: string, v: string) => res.setHeader(k, v),
                  status: (code: number) => {
                    res.statusCode = code;
                    return fakeVercelRes;
                  },
                  json: (data: any) => {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                  },
                  end: () => res.end(),
                };
                await blessingsHandler(fakeVercelReq, fakeVercelRes);
              } catch (err: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err.message || 'Server Error' }));
              }
            });
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message || 'Server Error' }));
          }
        });

        // Local development middleware for /api/track
        server.middlewares.use('/api/track', async (req, res) => {
          try {
            let bodyStr = '';
            req.on('data', (chunk) => { bodyStr += chunk; });
            req.on('end', async () => {
              try {
                const body = bodyStr ? JSON.parse(bodyStr) : {};
                const fakeVercelReq: any = {
                  method: req.method,
                  headers: req.headers,
                  body,
                  query: {},
                };
                const fakeVercelRes: any = {
                  setHeader: (k: string, v: string) => res.setHeader(k, v),
                  status: (code: number) => {
                    res.statusCode = code;
                    return fakeVercelRes;
                  },
                  json: (data: any) => {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                  },
                  end: () => res.end(),
                };
                await trackHandler(fakeVercelReq, fakeVercelRes);
              } catch (err: any) {
                res.statusCode = 200;
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
          } catch (err: any) {
            res.statusCode = 200;
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
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
