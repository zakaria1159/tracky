import { formatDate } from '@/app/lib/utils';
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
    const { jobCode, taskUrl, duration, date, taskType, taskStatus } = req.body;

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
        const [storedJobCode, storedTaskUrl, , storedDate, storedTaskType] = rows[i];
        console.log('storedJobCode:', storedJobCode);
        console.log('storedTaskUrl:', storedTaskUrl);
        console.log('jobCode:', jobCode);
        console.log('taskUrl:', taskUrl);

        if (storedJobCode === jobCode && storedTaskUrl === taskUrl) {

          rowIndex = i;
          break;
        }
      }
      console.log('Rowindex:', rowIndex);
      if (rowIndex === -1) {
        // If no matching row was found, append a new row
        await sheets.spreadsheets.values.append({
          spreadsheetId: documentId,
          range,
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          resource: {
            values: [[jobCode, taskUrl, duration, date, taskType, taskStatus ]],
          },
        });
      } else {
        // If a matching row was found, update the duration in that row
        console.log("a match was found");
        const existingDuration = Number(rows[rowIndex][2]);
        const totalDuration = existingDuration + duration;
        //Update duration
        await sheets.spreadsheets.values.update({
          spreadsheetId: documentId,
          range: `${range}!C${rowIndex + 1}`, // Update with your Sheet name and column letter for duration
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [[totalDuration]],
          },
        });
        const currentDate = new Date().toLocaleDateString('en-GB'); // Get current date and time in ISO format
        await sheets.spreadsheets.values.update({
          spreadsheetId: documentId,
          range: `${range}!D${rowIndex + 1}`, // Update with your Sheet name and column letter for date
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [[currentDate]],
          },
        });
      }

      res.status(200).json({ message: 'Data sent to Google Sheets successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to send data to Google Sheets' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}