// File: pages/api/resume.ts
import { NextApiRequest, NextApiResponse } from 'next';
const { google } = require('googleapis');

const credentials = {
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY
};

const documentId = process.env.GOOGLE_SHEET_ID;
const range = 'Sheet2'; // Update with your Sheet name

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { jobCode, taskUrl, duration } = req.body;

    try {
      const auth = new google.auth.JWT(
        credentials.client_email,
        null,
        credentials.private_key,
        ['https://www.googleapis.com/auth/spreadsheets']
      );

      const sheets = google.sheets({ version: 'v4', auth });

      // Fetch all rows from the sheet
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: documentId,
        range,
      });

      // Find the row with the matching jobCode and taskUrl
      const rows = response.data.values || [];
      let rowIndex = -1;

      for (let i = 0; i < rows.length; i++) {
        const [storedJobCode, , storedTaskUrl] = rows[i];

        if (storedJobCode === jobCode && storedTaskUrl === taskUrl) {
          rowIndex = i;
          break;
        }
      }

      if (rowIndex === -1) {
        // If no matching row was found, return an error
        res.status(400).json({ message: 'Task not found' });
      } else {
        // If a matching row was found, update the duration in that row
        const existingDuration = Number(rows[rowIndex][1]);
        const totalDuration = existingDuration + duration;
        await sheets.spreadsheets.values.update({
          spreadsheetId: documentId,
          range: `${range}!B${rowIndex + 1}`, // Update with your Sheet name and column letter for duration
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [[totalDuration]],
          },
        });

        res.status(200).json({ message: 'Task resumed successfully' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to resume task' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}