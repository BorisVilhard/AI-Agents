import {
	exchangeCodeForTokens,
	verifyIdToken,
	handleAuth,
} from '../services/googleAuthService.js';
import {
	fetchWebsiteContent,
	extractRelevantText,
} from '../services/webScraperService.js';
import { analyzeBusiness } from '../services/openAiService.js';
import { sendEmail } from '../services/gmailService.js';
import { getRefreshToken, isValidEmail } from '../utils/email.jss';

export const handleGoogleAuth = async (req, res) => {
	const { code } = req.body;

	if (!code) {
		return res.status(400).json({ message: 'Authorization code is required.' });
	}

	try {
		const tokens = await exchangeCodeForTokens(code);

		if (!tokens.id_token) {
			return res.status(400).json({ message: 'Invalid authorization code.' });
		}

		const payload = await verifyIdToken(tokens.id_token);

		if (!payload) {
			return res.status(400).json({ message: 'Invalid Google token.' });
		}

		const { sub: googleId, email, name } = payload;
		if (!email || !googleId) {
			return res.status(400).json({ message: 'Invalid Google user data.' });
		}

		const user = await handleAuth(req, tokens, payload);

		res.status(200).json({
			id: user.profile.id,
			username: user.profile.displayName,
			email: user.profile.emails[0].value,
			accessToken: user.accessToken,
		});
	} catch (error) {
		console.error('Google authentication error:', error);
		res.status(500).json({
			message: 'Internal Server Error',
			error: error.message,
		});
	}
};

export const processLeads = async (req, res) => {
	const refreshToken = getRefreshToken(req);

	if (!refreshToken) {
		return res
			.status(403)
			.json({ message: 'Google account not linked with API access.' });
	}

	const instructions = req.body.instructions;
	const offer = req.body.offer;
	const leads = req.body.leads || [];

	if (!instructions || !offer || !leads.length) {
		return res.status(400).json({
			message:
				'Instructions, offer, and leads array are required in the request body.',
		});
	}

	try {
		const results = [];

		for (let lead of leads) {
			const { email, website, name, demographic } = lead;
			if (!email || !isValidEmail(email)) {
				results.push({
					username: name,
					email,
					business_type: 'Unknown',
					status: 'invalid email',
				});
				continue;
			}

			let html;
			try {
				html = await fetchWebsiteContent(website);
			} catch (err) {
				console.error(`Failed to fetch website ${website}: ${err.message}`);
				results.push({
					username: name,
					email,
					business_type: 'Unknown',
					status: 'failed to fetch website',
				});
				continue;
			}

			const extractedText = extractRelevantText(html);

			try {
				const jsonResponse = await analyzeBusiness(
					extractedText,
					name,
					demographic,
					instructions,
					offer
				);
				const { business_type, matches, subject, body } = jsonResponse;

				const leadResult = {
					username: name,
					email,
					business_type: business_type || 'Unknown',
					status: matches ? 'pending' : 'does not match',
					subject: matches ? subject : undefined,
					body: matches ? body : undefined,
				};

				if (matches) {
					try {
						await sendEmail(refreshToken, email, subject, body);
						leadResult.status = 'sent';
					} catch (err) {
						console.error(`Error sending email to ${email}: ${err.message}`);
						leadResult.status = 'send failed';
					}
				}

				results.push(leadResult);
			} catch (err) {
				console.error(`Error processing lead ${email}:`, err.message);
				results.push({
					username: name,
					email,
					business_type: 'Unknown',
					status: 'processing error',
				});
			}
		}

		res.json({
			totalLeads: leads.length,
			results,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.message });
	}
};

export const sendSingleEmail = async (req, res) => {
	const refreshToken = getRefreshToken(req);

	if (!refreshToken) {
		return res
			.status(403)
			.json({ message: 'Google account not linked with API access.' });
	}

	const { to, subject, body } = req.body;

	if (!to || !subject || !body) {
		return res
			.status(400)
			.json({ message: 'to, subject, and body are required.' });
	}

	try {
		await sendEmail(refreshToken, to, subject, body);
		res.json({ success: true });
	} catch (err) {
		console.error('Error sending email:', err);
		res
			.status(500)
			.json({ message: 'Failed to send email', error: err.message });
	}
};
