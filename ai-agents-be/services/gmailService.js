const { google } = require('googleapis');
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = require('../constants.js');
const { createEmailRaw } = require('../utils/email.js');

const getUserEmail = async (accessToken) => {
	const fetch = (await import('node-fetch')).default;
	const userInfoRes = await fetch(
		'https://www.googleapis.com/oauth2/v3/userinfo',
		{
			headers: { Authorization: `Bearer ${accessToken}` },
		}
	);
	if (!userInfoRes.ok) {
		throw new Error('Failed to fetch user info.');
	}
	const userInfo = await userInfoRes.json();
	return userInfo.email;
};

const sendEmail = async (refreshToken, to, subject, body) => {
	const oauth2Client = new google.auth.OAuth2(
		GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET
	);
	oauth2Client.setCredentials({ refresh_token: refreshToken });

	const accessTokenResponse = await oauth2Client.getAccessToken();
	const accessToken = accessTokenResponse.token;

	if (!accessToken) {
		throw new Error('Failed to refresh Google access token.');
	}

	const userEmail = await getUserEmail(accessToken);

	if (!userEmail) {
		throw new Error('Unable to retrieve user email.');
	}

	oauth2Client.setCredentials({ access_token: accessToken });

	const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

	const raw = createEmailRaw(to, userEmail, subject, body);

	await gmail.users.messages.send({
		userId: 'me',
		resource: { raw },
	});
};

module.exports = { getUserEmail, sendEmail };
