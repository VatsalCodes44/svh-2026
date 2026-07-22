import 'dotenv/config';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { fileBase64, fileName, teamId } = req.body;

    if (!fileBase64 || !fileName) {
      return res.status(400).json({ message: 'Missing required parameters: fileBase64 or fileName.' });
    }

    const appsScriptUrl = process.env.APPS_SCRIPT_URL || process.env.VITE_APPS_SCRIPT_URL;
    let previewLink = null;
    let fileId = null;

    // OPTION A: Google Apps Script Web App (Uploads using your Personal Google Drive 15 GB Quota!)
    if (appsScriptUrl) {
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1vJgSd32NJWReqzMc4SzI-3oV7ykRQ0G3';
      const appsScriptRes = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: fileBase64,
          fileName: fileName,
          folderId: folderId,
        }),
      });

      const scriptData = await appsScriptRes.json();
      if (!scriptData.success) {
        throw new Error(scriptData.message || 'Failed to upload PDF via Google Apps Script.');
      }
      previewLink = scriptData.pdfUrl;
      fileId = scriptData.fileId;
    } else {
      // OPTION B: Google Drive API with Service Account
      let serviceAccountCredentials;
      if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        try {
          serviceAccountCredentials = typeof process.env.GOOGLE_SERVICE_ACCOUNT_KEY === 'string'
            ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
            : process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
        } catch (err) {
          return res.status(500).json({
            message: 'GOOGLE_SERVICE_ACCOUNT_KEY in .env is invalid.',
          });
        }
      } else if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
        serviceAccountCredentials = {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        };
      } else {
        return res.status(500).json({
          message: 'Drive configuration missing. Please set VITE_APPS_SCRIPT_URL in .env to upload using your personal 15GB Google Drive quota.',
        });
      }

      const auth = new google.auth.GoogleAuth({
        credentials: serviceAccountCredentials,
        scopes: ['https://www.googleapis.com/auth/drive'],
      });

      const drive = google.drive({ version: 'v3', auth });

      const base64Data = fileBase64.replace(/^data:application\/pdf;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      const Readable = (await import('stream')).Readable;
      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);

      const driveResponse = await drive.files.create({
        requestBody: {
          name: fileName,
          parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
        },
        media: {
          mimeType: 'application/pdf',
          body: stream,
        },
        supportsAllDrives: true,
        supportsTeamDrives: true,
        fields: 'id, webViewLink, webContentLink',
      });

      fileId = driveResponse.data.id;

      await drive.permissions.create({
        fileId: fileId,
        supportsAllDrives: true,
        supportsTeamDrives: true,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      previewLink = `https://drive.google.com/file/d/${fileId}/preview`;
    }

    // Save/update ppt_url in Supabase if teamId provided
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (teamId && supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase
        .from('submissions')
        .update({ ppt_url: previewLink })
        .eq('team_id', teamId);
    }

    return res.status(200).json({
      success: true,
      fileId: fileId,
      pdfUrl: previewLink,
    });
  } catch (error) {
    console.error('Google Drive Upload Error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to upload PDF to Google Drive.',
    });
  }
}
