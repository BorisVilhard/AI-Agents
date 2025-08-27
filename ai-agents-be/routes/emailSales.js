const express = require('express');
const {
	handleGoogleAuth,
	processLeads,
} = require('../controllers/emailSalesController');
const { sendEmail } = require('../services/gmailService');

const router = express.Router();

router.post('/auth/google', handleGoogleAuth);

router.post('/process-leads', processLeads);

router.post('/send-email', sendEmail);

module.exports = router;
