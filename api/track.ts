import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';
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

const SHEET_ID = '1VZGTKbFvxFjRZ3MJ904Oqn07_9lZozypyPea6dIJ52w';
const TAB_NAME = 'Visitors';

// Helper to parse human-readable device name from User-Agent
function parseDevice(userAgent: string): string {
  if (!userAgent) return 'Unknown Device';
  const ua = userAgent.toLowerCase();
  if (ua.includes('iphone')) return 'Apple iPhone';
  if (ua.includes('ipad')) return 'Apple iPad';
  if (ua.includes('android')) return 'Android Device';
  if (ua.includes('macintosh') || ua.includes('mac os')) return 'Mac Desktop / Laptop';
  if (ua.includes('windows')) return 'Windows PC';
  if (ua.includes('linux')) return 'Linux PC';
  return 'Web Browser';
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

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const pathVisited = body.path || body.page || req.query.path || '/';
    const side = body.side || '';

    // Extract real client IP and Vercel geo headers
    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0].trim() || (req.headers['x-real-ip'] as string) || req.socket.remoteAddress || '127.0.0.1';

    const city = (req.headers['x-vercel-ip-city'] as string) || body.city || 'Local / Unknown';
    const region = (req.headers['x-vercel-ip-country-region'] as string) || body.region || '';
    const country = (req.headers['x-vercel-ip-country'] as string) || body.country || 'IN';
    const userAgent = (req.headers['user-agent'] as string) || '';
    const device = parseDevice(userAgent);

    const now = new Date();
    // 1. IST Equivalent Time
    const istTime = now.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    // 2. Visitor's Local Time (as visited from their specific timezone)
    const clientTimezone = body.timezone || (req.headers['x-vercel-ip-timezone'] as string) || '';
    let visitorLocalTime = body.localTime || '';
    if (!visitorLocalTime) {
      if (clientTimezone) {
        try {
          visitorLocalTime = now.toLocaleString('en-US', {
            timeZone: clientTimezone,
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          });
        } catch (e) {
          visitorLocalTime = istTime;
        }
      } else {
        visitorLocalTime = istTime;
      }
    }
    if (clientTimezone && !visitorLocalTime.includes('(')) {
      visitorLocalTime = `${visitorLocalTime} (${clientTimezone})`;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      return res.status(200).json({ success: false, message: 'Google credentials not configured for logging' });
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'https://developers.google.com/oauthplayground'
    );
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    // Step 1: Verify or create 'Visitors' sheet tab
    try {
      const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
      const sheetTitles = meta.data.sheets?.map((s) => s.properties?.title) || [];

      if (!sheetTitles.includes(TAB_NAME)) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SHEET_ID,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: TAB_NAME,
                    gridProperties: { rowCount: 1000, columnCount: 9 },
                  },
                },
              },
            ],
          },
        });

        // Add headers to new tab
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `${TAB_NAME}!A1:I1`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [
              ['Visitor Local Time', 'IST Equivalent', 'IP Address', 'City', 'Region', 'Country', 'Route / Side', 'Device', 'User Agent'],
            ],
          },
        });
      } else {
        // Ensure header row is up to date with both timezone columns
        const headerCheck = await sheets.spreadsheets.values.get({
          spreadsheetId: SHEET_ID,
          range: `${TAB_NAME}!A1:B1`,
        });
        const firstHeader = headerCheck.data.values?.[0]?.[0];
        if (firstHeader === 'Timestamp (IST)') {
          await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: `${TAB_NAME}!A1:I1`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: [
                ['Visitor Local Time', 'IST Equivalent', 'IP Address', 'City', 'Region', 'Country', 'Route / Side', 'Device', 'User Agent'],
              ],
            },
          });
        }
      }
    } catch (e: any) {
      console.warn('Could not verify sheet tab, continuing append:', e.message);
    }

    // Step 2: Append visitor row to Google Sheet
    const routeInfo = side ? `${pathVisited} (${side.toUpperCase()})` : pathVisited;
    const rowData = [visitorLocalTime, istTime, ip, city, region, country, routeInfo, device, userAgent];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${TAB_NAME}!A:I`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowData],
      },
    });

    return res.status(200).json({
      success: true,
      logged: { ip, city, country, routeInfo, visitorLocalTime, istTime },
    });
  } catch (err: any) {
    console.error('Error logging visitor to Google Sheet:', err);
    // Return 200 so visitor telemetry never blocks or throws errors on user side
    return res.status(200).json({ success: false, error: err.message });
  }
}
