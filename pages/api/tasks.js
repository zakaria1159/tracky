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
        const range = "Sheet2!A1:F100"; // Replace with your sheet name and the range of cells you want to read

        const response = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const data = response.data.values.filter(row => row[0]);
        
        const jobCodes = data.map(row => row[0]);
        const taskUrls = data.map(row => row[1]);
        const durations = data.map(row => row[2]);
        const date = data.map(row => row[3]);
        const taskType = data.map(row => row[4]);
        const taskStatus = data.map(row => row[5]);

<<<<<<< Updated upstream
=======
<<<<<<< HEAD
        res.status(200).json({ jobCodes, taskUrls,durations, date, taskType, taskStatus });
=======
>>>>>>> Stashed changes
    
        res.status(200).json({ jobCodes, taskUrls,durations, date, taskType, taskStatus });   
        
    //    res.status(200).json({ jobCodes, taskUrls,durations, date, taskType, taskStatus });
<<<<<<< Updated upstream
=======
>>>>>>> dev
>>>>>>> Stashed changes
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}