import pdfParse from 'pdf-parse';
import { chatStorage } from '../storage.js';

export const uploadDocuments = async (userId, files) => {
	let chat = chatStorage.get(userId) || {
		userId,
		messages: [],
		fileContentsMap: {},
	};

	for (const file of files) {
		if (file.mimetype !== 'application/pdf') {
			continue;
		}
		const dataBuffer = file.buffer;
		const data = await pdfParse(dataBuffer);
		chat.fileContentsMap[file.originalname] = data.text;
	}

	chatStorage.set(userId, chat);
};

export const deleteDocument = (userId, fileName) => {
	let chat = chatStorage.get(userId);
	if (!chat || !chat.fileContentsMap[fileName]) {
		throw new Error('File not found');
	}
	delete chat.fileContentsMap[fileName];
	chatStorage.set(userId, chat);
};
