import { google } from 'googleapis'

export default async function handler(req, res) {
  try {
    const auth = new google.auth.GoogleAuth({
        credentials:{
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
        },
        scopes:["https://www.googleapis.com/auth/spreadsheets.readonly"]
    })

    const client = await auth.getClient();

    const googleSheets = google.sheets({ version: "v4", auth: client });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = "Sheet1!A1:A100"; // Replace with your sheet name and the range of cells you want to read

    const response = await googleSheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const jobCodes = response.data.values.flat(); // Flatten the array of arrays into a single array

    res.status(200).json(jobCodes);
  } catch (error) {
    res.status(500).json({ error: error.message });
}
}