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

// Helper to parse human-readable device model, OS, and screen details
function parseDetailedDevice(userAgent: string, clientData: any = {}): string {
  if (!userAgent && !clientData.platform) return 'Unknown Device';

  const ua = (userAgent || '').toLowerCase();
  const screen = clientData.screen || '';
  const gpu = clientData.gpu || '';

  // 1. Android Detection & Exact Model Extraction
  if (ua.includes('android')) {
    const androidMatch = userAgent.match(/Android\s+([0-9\.]+)(?:;\s*([^;\)]+))?/i);
    const androidVer = androidMatch ? `Android ${androidMatch[1]}` : 'Android';
    let model = androidMatch && androidMatch[2] ? androidMatch[2].trim() : '';

    model = model.replace(/Build\/.*$/i, '').replace(/[\/\;].*$/, '').trim();

    if (model.startsWith('SM-') || model.startsWith('SC-')) {
      model = `Samsung (${model})`;
    } else if (model.includes('Pixel')) {
      model = `Google ${model}`;
    } else if (model.includes('OnePlus') || model.startsWith('KB') || model.startsWith('IN20') || model.startsWith('CPH')) {
      model = `OnePlus / Oppo (${model})`;
    } else if (model.includes('Xiaomi') || model.includes('Redmi') || model.includes('POCO') || model.startsWith('22') || model.startsWith('23')) {
      model = `Xiaomi / Redmi (${model})`;
    } else if (model.includes('vivo') || model.startsWith('V2')) {
      model = `Vivo (${model})`;
    } else if (model.includes('moto') || model.startsWith('motorola')) {
      model = `Motorola (${model})`;
    }

    const parts = [model || 'Android Device', `[${androidVer}]`];
    if (screen) parts.push(`(${screen})`);
    return parts.join(' ');
  }

  // 2. iPhone / iPad / iOS Detection with Screen-to-Model Mapping (iPhone 6 up to iPhone 17 Pro Max)
  if (ua.includes('iphone') || ua.includes('ipad') || (ua.includes('macintosh') && clientData.isTouch)) {
    const iosMatch = userAgent.match(/OS\s+([0-9_]+)\s+like\s+Mac/i);
    const iosVer = iosMatch ? `iOS ${iosMatch[1].replace(/_/g, '.')}` : 'iOS';
    const safeTop = Number(clientData.safeAreaTop) || 0;
    const isDynamicIsland = safeTop >= 50;

    let modelName = 'Apple iPhone';
    if (ua.includes('ipad') || (ua.includes('macintosh') && clientData.isTouch)) {
      modelName = 'Apple iPad';
    } else {
      // iPhone 16 Pro Max / 17 Pro Max (6.9" display: 440x956 @ 3x)
      if (screen.includes('440x956')) {
        modelName = iosVer.includes('19') || iosVer.includes('20')
          ? 'Apple iPhone 17 Pro Max'
          : 'Apple iPhone 16 / 17 Pro Max';
      }
      // iPhone 16 Pro / 17 / 17 Pro (6.3" display: 402x874 @ 3x)
      else if (screen.includes('402x874')) {
        modelName = iosVer.includes('19') || iosVer.includes('20')
          ? 'Apple iPhone 17 / 17 Pro'
          : 'Apple iPhone 16 Pro / 17';
      }
      // iPhone 17 Air / Slim (6.6" ultrathin display: 420x910 or 414x896 with Dynamic Island)
      else if ((screen.includes('420x910') || screen.includes('414x896')) && isDynamicIsland) {
        modelName = 'Apple iPhone 17 Air / Slim';
      }
      // iPhone 14 Pro Max / 15 Plus / 15 Pro Max / 16 Plus (6.7" display: 430x932 @ 3x)
      else if (screen.includes('430x932')) {
        modelName = 'Apple iPhone 14 Pro Max / 15 Plus / 15 Pro Max / 16 Plus';
      }
      // iPhone 14 Pro / 15 / 15 Pro / 16 (6.1" display: 393x852 @ 3x)
      else if (screen.includes('393x852')) {
        modelName = 'Apple iPhone 14 Pro / 15 / 15 Pro / 16';
      }
      // iPhone 12 / 13 / 14 (6.1" Notch display: 390x844 @ 3x)
      else if (screen.includes('390x844')) {
        modelName = isDynamicIsland ? 'Apple iPhone 15 / 16' : 'Apple iPhone 12 / 13 / 14 (Notch)';
      }
      // iPhone 12 Pro Max / 13 Pro Max / 14 Plus (6.7" Notch display: 428x926 @ 3x)
      else if (screen.includes('428x926')) {
        modelName = 'Apple iPhone 12/13 Pro Max / 14 Plus (Notch)';
      }
      // iPhone X / XS / 11 Pro / 12 Mini / 13 Mini (5.8" / 5.4" display: 375x812 @ 3x)
      else if (screen.includes('375x812')) {
        modelName = 'Apple iPhone X / XS / 11 Pro / 12-13 Mini';
      }
      // iPhone XR / 11 / XS Max / 11 Pro Max (6.1" / 6.5" display: 414x896 @ 2x/3x)
      else if (screen.includes('414x896')) {
        modelName = 'Apple iPhone XR / 11 / XS Max / 11 Pro Max';
      }
      // iPhone 6 / 7 / 8 / SE (4.7" Home button: 375x667 @ 2x)
      else if (screen.includes('375x667')) {
        modelName = 'Apple iPhone 6/7/8/SE';
      }
      // iPhone 6+ / 7+ / 8+ (5.5" Home button: 414x736 @ 3x)
      else if (screen.includes('414x736')) {
        modelName = 'Apple iPhone Plus (6+/7+/8+)';
      }
    }

    const parts = [modelName, `[${iosVer}]`];
    if (isDynamicIsland && !modelName.includes('Notch') && !modelName.includes('SE')) {
      parts.push('[Dynamic Island]');
    }
    if (screen) parts.push(`(${screen})`);
    return parts.join(' ');
  }

  // 3. Mac Desktop / Laptop
  if (ua.includes('macintosh') || ua.includes('mac os')) {
    const macMatch = userAgent.match(/Mac OS X\s+([0-9_]+)/i);
    const macVer = macMatch ? `macOS ${macMatch[1].replace(/_/g, '.')}` : 'macOS';

    let gpuShort = '';
    if (gpu.includes('Apple') || gpu.includes('M1') || gpu.includes('M2') || gpu.includes('M3') || gpu.includes('M4')) {
      gpuShort = 'Apple Silicon (M-Series)';
    } else if (gpu.includes('Intel')) {
      gpuShort = 'Intel Graphics';
    } else if (gpu.includes('AMD') || gpu.includes('Radeon')) {
      gpuShort = 'AMD Radeon';
    }

    const parts = ['Mac Desktop / Laptop', `[${macVer}]`];
    if (gpuShort) parts.push(`[${gpuShort}]`);
    if (screen) parts.push(`(${screen})`);
    return parts.join(' ');
  }

  // 4. Windows PC
  if (ua.includes('windows')) {
    const winMatch = userAgent.match(/Windows NT\s+([0-9\.]+)/i);
    let winVer = 'Windows PC';
    if (winMatch) {
      if (winMatch[1] === '10.0') winVer = 'Windows 10/11';
      else if (winMatch[1] === '6.3') winVer = 'Windows 8.1';
      else if (winMatch[1] === '6.1') winVer = 'Windows 7';
      else winVer = `Windows NT ${winMatch[1]}`;
    }
    const parts = [winVer];
    if (screen) parts.push(`(${screen})`);
    return parts.join(' ');
  }

  // 5. Linux
  if (ua.includes('linux')) {
    return `Linux PC ${screen ? `(${screen})` : ''}`.trim();
  }

  return userAgent.slice(0, 50) || 'Web Browser';
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
    const device = parseDetailedDevice(userAgent, body);

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
