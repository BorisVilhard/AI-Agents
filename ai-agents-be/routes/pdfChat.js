const express = require('express');
const multer = require('multer');
const {
	createOrUpdateChat,
	getChatById,
} = require('../controllers/pdfChatController');
const {
	uploadDocuments,
	deleteDocument,
} = require('../services/documentService.js');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/documents/:userId', upload.array('files'), uploadDocuments);

router.delete('/documents/:userId/:fileName', deleteDocument);

router.post('/chat/:userId', createOrUpdateChat);

router.get('/chat/:userId', getChatById);

module.exports = router;
