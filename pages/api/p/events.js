import { getToken } from 'next-auth/jwt';
const {google} = require('googleapis');

const [secret,clientId,clientSecret,apiKey] = [
		process.env.SECRET, process.env.GOOGLE_CLIENT_ID, 
		process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_APIKEY
];

export default async (req, res) => {
    const token = await getToken({ req, secret });
    let {access_token,id_token, refresh_token} = {...token};
    
    const auth = new google.auth.OAuth2(clientId, clientSecret);
    auth.setCredentials({refresh_token : refresh_token});
    
    const calendar = google.calendar({version: 'v3', auth});

    const {projectID} = req.query;
    const cal_res = await calendar.events.list({calendarId: projectID});
    // Free text search terms to find events that match these terms in the following fields: summary, description, location, attendee's displayName, attendee's email. Optional.
    // q: 'placeholder-value',

    const events = cal_res.data.items;
    const percent = events.filter(e => e.status == "confirmed").length / events.length
    res.json({percent : percent * 100, lists : events});
};