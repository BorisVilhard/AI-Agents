require('dotenv').config();
const cookieParser = require('cookie-parser');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const revoiceRoutes = require('./routes/voiceRealEstate.js');
const emailSalesRoutes = require('./routes/emailSales.js');
const pdfChatRoutes = require('./routes/pdfChat.js');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;
app.use(cookieParser());

app.use(
	cors({
		origin: 'http://localhost:3000',
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
	})
);

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));

app.use(
	session({
		secret: 'your-session-secret',
		resave: false,
		saveUninitialized: true,
		cookie: { secure: false, sameSite: 'Lax' },
	})
);

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: process.env.GOOGLE_REDIRECT_URI,
		},
		(accessToken, refreshToken, profile, done) => {
			console.log('User profile:', profile);
			return done(null, { profile, accessToken, refreshToken });
		}
	)
);

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((user, done) => {
	done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

app.use('/leads', emailSalesRoutes);
app.use('/chat', pdfChatRoutes);
app.use('/voice', revoiceRoutes);

app.use((req, res, next) => {
	res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
