const express = require('express');
const {
	createOrUpdateChat,
	createOrUpdateVoiceChat,
} = require('../controllers/voiceRealEstateController');

const router = express.Router();

router.post('/users/:userId/chats', createOrUpdateChat);

router.post('/users/:userId/voice-chats', createOrUpdateVoiceChat);

module.exports = router;
