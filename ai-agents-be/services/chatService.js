const { ChatOpenAI } = require('@langchain/openai');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { chatStorage } = require('../storage.js');
const { formatMessage } = require('../utils/formatMessage.js');
const { PDF_TEMPLATE, MAX_MESSAGES } = require('../constants.js');

const processChatMessage = async (userId, message) => {
	let chat = chatStorage.get(userId) || {
		userId,
		messages: [],
		fileContentsMap: {},
	};

	let messages = Array.isArray(chat.messages) ? chat.messages : [];

	const recentMessages = messages.slice(-MAX_MESSAGES).map(formatMessage);
	const userMessage = { role: 'user', content: message };
	const allRecentMessages = [
		...recentMessages,
		formatMessage(userMessage),
	].slice(-MAX_MESSAGES);
	const chatHistory = allRecentMessages.join('\n');

	const prompt = ChatPromptTemplate.fromTemplate(PDF_TEMPLATE);

	const model = new ChatOpenAI({
		openAIApiKey: process.env.OPENAI_API_KEY,
		modelName: 'gpt-4-turbo',
		temperature: 0.8,
	});

	const chain = prompt.pipe(model);

	const fileContents = Object.entries(chat.fileContentsMap || {})
		.map(([name, text]) => `\n\n--- Content from ${name} ---\n\n${text}`)
		.join('');

	const assistantResponse = await chain.invoke({
		chat_history: chatHistory,
		file_contents: fileContents || 'No documents uploaded yet.',
		input: message,
	});

	const assistantText = assistantResponse.content.trim();
	const assistantMessage = { role: 'assistant', content: assistantText };

	messages.push(userMessage, assistantMessage);
	messages = messages.slice(-MAX_MESSAGES);

	chatStorage.set(userId, { ...chat, messages });

	return assistantText;
};

const getChat = (userId) => {
	const chat = chatStorage.get(userId);
	if (!chat) {
		throw new Error('Chat not found');
	}
	return {
		userId: chat.userId,
		messages: chat.messages,
		fileNames: Object.keys(chat.fileContentsMap || {}),
	};
};

module.exports = { processChatMessage, getChat };
