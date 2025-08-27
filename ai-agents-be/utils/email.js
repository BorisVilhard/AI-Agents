import fs from 'fs';

export const getRefreshToken = (req) => {
	return (
		req.cookies.google_refresh_token ||
		(fs.existsSync('token.json')
			? JSON.parse(fs.readFileSync('token.json')).refresh_token
			: null)
	);
};

export const createEmailRaw = (to, from, subject, body) => {
	const raw = [
		`To: ${to}`,
		`From: ${from}`,
		`Subject: ${subject}`,
		'',
		body,
	].join('\r\n');
	return Buffer.from(raw)
		.toString('base64')
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
};

export const isValidEmail = (email) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};
