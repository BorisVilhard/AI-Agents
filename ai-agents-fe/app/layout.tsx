'use client';

import { ReactNode, useRef } from 'react';
import Script from 'next/script';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import useAuthStore from './Store/AuthStore';
import './globals.css';
import Navbar from './components/Navbar/Navbar';

declare global {
	interface Window {
		google?: any;
	}
}

const Layout = ({ children }: { children: ReactNode }) => {
	const store = useAuthStore();
	const codeClientRef = useRef<any>(null);

	const initGoogle = () => {
		if (window.google) {
			codeClientRef.current = window.google.accounts.oauth2.initCodeClient({
				client_id: process.env.GOOGLE_CLIENT_ID,
				scope: process.env.GOOGLE_SCOPE,
				ux_mode: 'popup',
				callback: (response: any) => {
					if (response.error) {
						handleGoogleFailure();
						return;
					}
					handleGoogleSuccess(response);
				},
				error_callback: (error: any) => {
					console.error('Google OAuth error:', error);
					handleGoogleFailure();
				},
			});
		}
	};

	const handleGoogleLogin = () => {
		if (codeClientRef.current) {
			codeClientRef.current.requestCode();
		} else {
			if (window.google) {
				initGoogle();
				codeClientRef.current?.requestCode();
			} else {
				toast.error('Google SDK not loaded yet. Please try again.');
			}
		}
	};

	const handleGoogleSuccess = async (response: any) => {
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/leads/auth/google`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ code: response.code }),
					credentials: 'include',
				}
			);

			if (!res.ok) {
				const text = await res.text();
				console.error('Backend response:', text);
				throw new Error(text);
			}

			const data = await res.json();
			const { id, username, email, accessToken } = data;
			store.setCredentials(id, username, email, accessToken);
			toast.success(`Vitajte, ${username}!`);
		} catch (error: any) {
			console.error('Chyba pri autentifikácii cez Google:', error);
			toast.error(error.message || 'Autentifikácia cez Google zlyhala.');
		}
	};

	const handleGoogleFailure = () => {
		toast.error('Autentifikácia cez Google nebola úspešná. Skúste to znova.');
	};

	return (
		<html lang='en'>
			<head>
				<Script
					src='https://accounts.google.com/gsi/client'
					strategy='afterInteractive'
					onLoad={() => {
						console.log('Google SDK loaded');
						initGoogle();
					}}
				/>
			</head>
			<body>
				<Navbar />
				{store.accessToken ? (
					children
				) : (
					<button onClick={handleGoogleLogin}>Prihlásiť sa cez Google</button>
				)}

				<ToastContainer
					position='top-right'
					autoClose={3000}
					hideProgressBar={false}
					newestOnTop={false}
					closeOnClick
					pauseOnFocusLoss
					draggable
					pauseOnHover
					aria-label='Notifikácie'
				/>
			</body>
		</html>
	);
};

export default Layout;
