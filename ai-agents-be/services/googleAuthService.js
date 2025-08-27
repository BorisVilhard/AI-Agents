import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../contsants.js';

const client = new OAuth2Client(
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	'postmessage'
);

export const exchangeCodeForTokens = async (code) => {
	const { tokens } = await client.getToken({ code });
	return tokens;
};

export const verifyIdToken = async (idToken) => {
	const ticket = await client.verifyIdToken({
		idToken,
		audience: GOOGLE_CLIENT_ID,
	});
	return ticket.getPayload();
};

export const handleAuth = async (req, tokens, payload) => {
	const { sub: googleId, email, name } = payload;

	if (email !== 'fastandfresh4u@gmail.com') {
		throw new Error('Unauthorized email address');
	}

	const user = {
		profile: {
			id: googleId,
			displayName: name,
			name: name,
			emails: [{ value: email }],
		},
		accessToken: tokens.access_token,
		refreshToken: tokens.refresh_token,
	};

	if (tokens.refresh_token) {
		req.res.cookie('google_refresh_token', tokens.refresh_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'None',
			maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
		});
		fs.writeFileSync(
			'token.json',
			JSON.stringify({ refresh_token: tokens.refresh_token })
		);
	}

	return new Promise((resolve, reject) => {
		req.login(user, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve(user);
			}
		});
	});
};
