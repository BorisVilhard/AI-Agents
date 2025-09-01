const { speechToText, textToSpeech } = require('../services/speechService.js');
const { searchAndScrape } = require('../services/webservice.js');
const { processSingleStep } = require('../services/openAiService.js');
const { pendingActions } = require('../storage.js');
const { MAX_MESSAGES, MAX_LOOP } = require('../constants.js');

const createOrUpdateChat = async (req, res) => {
	try {
		const { userId } = req.params;
		const { messages, dashboardId, dashboardName } = req.body;
		if (!dashboardId || !dashboardName) {
			return res
				.status(400)
				.json({ error: 'dashboardId and dashboardName are required' });
		}
		if (!messages || !Array.isArray(messages) || messages.length === 0) {
			return res.status(400).json({ error: 'Invalid or empty messages array' });
		}
		let currentMessages = messages.slice(-MAX_MESSAGES);
		const userInput = currentMessages.at(-1)?.content || '';
		let responseTexts = [];
		let listings = [];
		let loopCount = 0;
		while (loopCount < MAX_LOOP) {
			const { jsonResponse, updatedMessages } = await processSingleStep(
				currentMessages,
				loopCount === 0 ? userInput : '[continue]'
			);
			currentMessages = updatedMessages;
			responseTexts.push(jsonResponse.response);
			if (!jsonResponse.action) {
				break;
			}
			let result = '';
			if (jsonResponse.action.type === 'search_and_scrape') {
				console.log(
					'Web agent: Received parameters: ' +
						JSON.stringify(jsonResponse.action.parameters)
				);
				result = await searchAndScrape(jsonResponse.action.parameters);
				listings = JSON.parse(result.replace('Listings after filters: ', ''));
			} else {
				throw new Error('Unknown action type');
			}
			currentMessages.push({ role: 'system', content: result });
			loopCount++;
		}
		res.status(200).json({ message: responseTexts.join('. '), listings });
	} catch (error) {
		res.status(error.status || 500).json({ error: error.message });
	}
};

const createOrUpdateVoiceChat = async (req, res) => {
	try {
		const { userId } = req.params;
		const {
			audioBuffer,
			dashboardId,
			dashboardName,
			messages = [],
			continue: isContinue = false,
		} = req.body;
		if (!dashboardId || !dashboardName) {
			return res
				.status(400)
				.json({ error: 'dashboardId and dashboardName are required' });
		}
		let userInput = '';
		let listings = [];
		let hasPending = false;
		if (audioBuffer) {
			const audio = Buffer.from(audioBuffer, 'base64');
			userInput = await speechToText(audio);
		}
		let fullMessages = [...messages];
		if (userInput) {
			fullMessages.push({ role: 'user', content: userInput });
		} else if (fullMessages.length === 0) {
			fullMessages.push({ role: 'user', content: '' });
		}
		let currentMessages = fullMessages.slice(-MAX_MESSAGES);
		let assistantText = '';
		if (isContinue) {
			const pending = pendingActions.get(userId);
			if (!pending) {
				throw new Error('No pending action found');
			}
			currentMessages = pending.currentMessages;
			const action = pending.action;
			let result = '';
			if (action.type === 'search_and_scrape') {
				console.log(
					'Web agent: Received parameters: ' + JSON.stringify(action.parameters)
				);
				result = await searchAndScrape(action.parameters);
				listings = JSON.parse(result.replace('Listings after filters: ', ''));
			}
			currentMessages.push({ role: 'system', content: result });
			const { jsonResponse, updatedMessages } = await processSingleStep(
				currentMessages,
				'[continue]'
			);
			currentMessages = updatedMessages;
			assistantText = jsonResponse.response;
			pendingActions.delete(userId);
		} else {
			const { jsonResponse, updatedMessages } = await processSingleStep(
				currentMessages,
				userInput
			);
			currentMessages = updatedMessages;
			assistantText = jsonResponse.response;
			if (jsonResponse.action) {
				pendingActions.set(userId, {
					action: jsonResponse.action,
					currentMessages: [...currentMessages],
				});
				hasPending = true;
			}
		}
		const audioResponse = await textToSpeech(assistantText);
		const responseData = {
			audio: audioResponse.toString('base64'),
			assistantText,
			userText: isContinue ? '' : userInput,
			listings,
			updatedMessages: currentMessages,
			hasPending,
		};
		res.status(200).json(responseData);
	} catch (error) {
		res.status(error.status || 500).json({ error: error.message });
	}
};

module.exports = { createOrUpdateChat, createOrUpdateVoiceChat };
