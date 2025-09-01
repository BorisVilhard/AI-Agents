const {
	uploadDocuments,
	deleteDocument,
} = require('../services/documentService.js');
const { processChatMessage, getChat } = require('../services/chatService.js');

const uploadDocumentsController = async (req, res) => {
	try {
		const { userId } = req.params;
		const files = req.files;

		if (!files || !Array.isArray(files) || files.length === 0) {
			return res.status(400).json({ error: 'No files uploaded' });
		}

		await uploadDocuments(userId, files);

		res.status(200).send();
	} catch (error) {
		console.error('Error uploading documents:', error);
		res.status(500).json({ error: error.message });
	}
};

const deleteDocumentController = async (req, res) => {
	try {
		const { userId, fileName } = req.params;

		deleteDocument(userId, fileName);

		res.status(200).json({ message: 'Document deleted successfully' });
	} catch (error) {
		console.error('Error deleting document:', error);
		if (error.message === 'File not found') {
			return res.status(404).json({ error: 'File not found' });
		}
		res.status(500).json({ error: error.message });
	}
};

const createOrUpdateChat = async (req, res) => {
	try {
		const { userId } = req.params;
		const { message } = req.body;

		if (!message || typeof message !== 'string') {
			return res.status(400).json({ error: 'Invalid message format' });
		}

		const assistantText = await processChatMessage(userId, message);

		res.status(200).json({
			message: assistantText,
		});
	} catch (error) {
		console.error('Error processing request:', error);
		res.status(500).json({ error: error.message });
	}
};

const getChatById = async (req, res) => {
	try {
		const { userId } = req.params;

		const chat = getChat(userId);

		res.json(chat);
	} catch (error) {
		console.error('Error retrieving chat:', error);
		if (error.message === 'Chat not found') {
			return res.status(404).json({ message: 'Chat not found' });
		}
		res.status(500).json({ error: error.message });
	}
};

module.exports = {
	uploadDocumentsController,
	deleteDocumentController,
	createOrUpdateChat,
	getChatById,
};
