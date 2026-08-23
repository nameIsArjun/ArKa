import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

export interface BlessingItem {
  id: string;
  name: string;
  relation: string;
  message: string;
  date: string;
  status: 'approved' | 'pending' | 'denied';
  isPinned?: boolean;
}

const DEFAULT_BLESSINGS: BlessingItem[] = [
  {
    id: 'gb-1',
    name: 'Puri & Dhir Elders',
    relation: 'Family Elders',
    message: 'May Lord Ganesha bless Arjun and Kanishka with eternal love, health, and prosperity. Excited for the grand wedding celebrations in Jammu and Bathinda!',
    date: 'Feb 15, 2026',
    status: 'approved',
    isPinned: true,
  },
  {
    id: 'gb-2',
    name: 'Kanishka’s Bridesmaids',
    relation: "Bride's Friends",
    message: 'Counting down the days to the Sangeet night! We are so ready to bring down the dance floor for our favorite couple.',
    date: 'Feb 18, 2026',
    status: 'approved',
    isPinned: true,
  },
];

// Local development fallback: load .env.local
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
        process.env[key] = value;
      }
    });
  }
} catch (e) {}

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
    const { action, name, relation, message, id } = body;

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    const sheetId = (process.env.GOOGLE_SHEET_ID || '1VZGTKbFvxFjRZ3MJ904Oqn07_9lZozypyPea6dIJ52w').replace(/['"]/g, '').trim();

    if (!clientId || !clientSecret || !refreshToken || !sheetId) {
      return res.status(500).json({ error: 'Google Sheets OAuth credentials or GOOGLE_SHEET_ID missing in environment.' });
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'https://developers.google.com/oauthplayground'
    );
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    // Action 1: Submit Blessing to Google Sheet
    if (action === 'submit') {
      if (!name || !message) return res.status(400).json({ error: 'Missing name or message' });

      const newBlessing: BlessingItem = {
        id: `blessing-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: String(name).trim(),
        relation: String(relation || 'Well Wisher').trim(),
        message: String(message).trim(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'pending',
        isPinned: false,
      };

      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'A:G',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            newBlessing.id,
            newBlessing.name,
            newBlessing.relation,
            newBlessing.message,
            newBlessing.date,
            newBlessing.status,
            'false',
          ]],
        },
      });

      return res.status(200).json({
        success: true,
        blessing: newBlessing,
        activeSheetId: sheetId,
        source: 'google-sheets-api-direct',
      });
    }

    // Read rows from Google Sheet (Explicitly specifying Sheet1! range)
    let rows: any[] = [];
    try {
      const sheetRes = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Sheet1!A2:G1000',
      });
      rows = sheetRes.data.values || [];
    } catch (readErr: any) {
      console.error(`[Google API Debug] Failed reading sheetId=${sheetId}:`, readErr.message || readErr);
      // Fallback range check if tab is named differently or fresh
      try {
        const fallbackRes = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: 'A2:G1000',
        });
        rows = fallbackRes.data.values || [];
      } catch (err2: any) {
        return res.status(500).json({
          error: `Google Sheets API Error: ${readErr.message || 'Requested entity was not found'}`,
          debugDetails: {
            sheetId,
            message: readErr.message,
            code: readErr.code || readErr.status,
            hint: 'Ensure Google Sheet is shared with Anyone with the link can edit, or Sheet ID is created under same Google account as OAuth token.',
          },
        });
      }
    }
    let blessings: BlessingItem[] = rows.map((row) => ({
      id: row[0] || `blessing-${Math.random()}`,
      name: row[1] || 'Guest',
      relation: row[2] || 'Well Wisher',
      message: row[3] || '',
      date: row[4] || '',
      status: (row[5] === 'approved' || row[5] === 'pending' || row[5] === 'denied' ? row[5] : 'pending') as any,
      isPinned: String(row[6]).toLowerCase() === 'true',
    }));

    // Action 2: Approve Blessing on Website ➔ Updates Google Sheet Status to 'approved'
    if (action === 'approve' && id) {
      const rowIndex = rows.findIndex((r) => r[0] === id);
      if (rowIndex !== -1) {
        const rowNum = rowIndex + 2; // +2 for header offset
        await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: `F${rowNum}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [['approved']] },
        });
      }
      return res.status(200).json({ success: true, activeSheetId: sheetId, source: 'google-sheets-api-direct' });
    }

    // Action 3: Deny/Delete Blessing ➔ Updates Google Sheet Status to 'denied'
    if ((action === 'deny' || action === 'delete') && id) {
      const rowIndex = rows.findIndex((r) => r[0] === id);
      if (rowIndex !== -1) {
        const rowNum = rowIndex + 2;
        await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: `F${rowNum}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [['denied']] },
        });
      }
      return res.status(200).json({ success: true, activeSheetId: sheetId, source: 'google-sheets-api-direct' });
    }

    // Action 4: Toggle Pin Status ➔ Updates Google Sheet IsPinned column
    if (action === 'pin' && id) {
      const rowIndex = rows.findIndex((r) => r[0] === id);
      if (rowIndex !== -1) {
        const rowNum = rowIndex + 2;
        const currentPinned = String(rows[rowIndex][6]).toLowerCase() === 'true';
        await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: `G${rowNum}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [[!currentPinned ? 'true' : 'false']] },
        });
      }
      return res.status(200).json({ success: true, activeSheetId: sheetId, source: 'google-sheets-api-direct' });
    }

    // If Google Sheet is fresh with 0 rows, return defaults
    if (blessings.length === 0) {
      blessings = DEFAULT_BLESSINGS;
    }

    return res.status(200).json({
      success: true,
      count: blessings.length,
      blessings,
      activeSheetId: sheetId,
      source: 'google-sheets-api-direct',
    });
  } catch (err: any) {
    console.error('Strict Google Sheets API Error:', err.message || err);
    return res.status(500).json({ error: err.message || 'Google Sheets API Error' });
  }
}
