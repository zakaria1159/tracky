import { NextApiRequest, NextApiResponse } from 'next';

// Import the Google Sheets API client library
const { google } = require('googleapis');

// Your Google Sheets API credentials
const credentials = {
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY
};

// The ID of your Google Sheets document
const documentId = process.env.GOOGLE_SHEET_ID;

// The range of cells to update in your Google Sheets document
const range = 'Sheet2!A1:B1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { jobCode, duration, taskUrl } = req.body;

    try {
      // Authenticate with the Google Sheets API
      const auth = new google.auth.JWT(
        credentials.client_email,
        null,
        credentials.private_key,
        ['https://www.googleapis.com/auth/spreadsheets']
      );

      // Connect to the Google Sheets API
      const sheets = google.sheets({ version: 'v4', auth });

      // The values to insert into the Google Sheets document
      const values = [[jobCode, duration, taskUrl]];

      // Insert the values into the Google Sheets document
      await sheets.spreadsheets.values.append({
        spreadsheetId: documentId,
        range,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values,
        },
      });

      res.status(200).json({ message: 'Data sent to Google Sheets successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to send data to Google Sheets' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}