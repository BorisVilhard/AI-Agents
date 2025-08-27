import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const useVoiceAssistant = () => {
	const [isListening, setIsListening] = useState<boolean>(false);
	const [audioLevel, setAudioLevel] = useState<number>(0);
	const [isRecording, setIsRecording] = useState<boolean>(false);
	const [messages, setMessages] = useState<{ role: string; content: string }[]>(
		[]
	);
	const [listings, setListings] = useState<any[]>([]);
	const [subtitles, setSubtitles] = useState<string>('');
	const [isVisible, setIsVisible] = useState<boolean>(true);
	const [hasStarted, setHasStarted] = useState<boolean>(false);

	const animationRef = useRef<number>();
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const dataArrayRef = useRef<Uint8Array | null>(null);
	const silenceStartRef = useRef<number | null>(null);
	const isSpeakingRef = useRef<boolean>(false);

	const VOLUME_THRESHOLD = 0.01;
	const SILENCE_DURATION = 1500;

	const userId = 'user1';
	const dashboardId = 'realestate';
	const dashboardName = 'Real Estate Agent';

	const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
		let binary = '';
		const bytes = new Uint8Array(buffer);
		const len = bytes.byteLength;
		for (let i = 0; i < len; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return window.btoa(binary);
	};

	const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
		const binary = window.atob(base64);
		const len = binary.length;
		const bytes = new Uint8Array(len);
		for (let i = 0; i < len; i++) {
			bytes[i] = binary.charCodeAt(i);
		}
		return bytes.buffer;
	};

	const updateAudioLevel = () => {
		if (analyserRef.current && dataArrayRef.current) {
			analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
			let sum = 0;
			for (let i = 0; i < dataArrayRef.current.length; i++) {
				const x = dataArrayRef.current[i] / 128 - 1;
				sum += x * x;
			}
			const rms = Math.sqrt(sum / dataArrayRef.current.length);
			setAudioLevel(rms);

			if (rms > VOLUME_THRESHOLD) {
				isSpeakingRef.current = true;
				silenceStartRef.current = null;
			} else if (isSpeakingRef.current) {
				if (!silenceStartRef.current) {
					silenceStartRef.current = Date.now();
				} else if (Date.now() - silenceStartRef.current > SILENCE_DURATION) {
					handleStopRecording();
					isSpeakingRef.current = false;
					silenceStartRef.current = null;
				}
			}
		}
		animationRef.current = requestAnimationFrame(updateAudioLevel);
	};

	const cleanSubtitles = (text: string): string => {
		return text.replace(/<break time="[^"]+"\s*\/>/g, '').trim();
	};

	const updateSubtitles = (newText: string) => {
		setIsVisible(false);
		setTimeout(() => {
			setSubtitles(cleanSubtitles(newText));
			setIsVisible(true);
		}, 300);
	};

	const processResponse = (response: any) => {
		const {
			audio,
			assistantText,
			userText,
			listings: responseListings,
			hasPending,
		} = response.data;
		if (audio) {
			const ab = base64ToArrayBuffer(audio);
			const audioBlobResponse = new Blob([ab], { type: 'audio/mp3' });
			const audioUrl = URL.createObjectURL(audioBlobResponse);
			if (audioRef.current) {
				audioRef.current.src = audioUrl;
				audioRef.current.play();
				updateSubtitles(assistantText);
				if (hasPending) {
					audioRef.current.onended = handleContinue;
				} else {
					audioRef.current.onended = () => {
						setIsListening(true);
						setIsRecording(true);
					};
				}
			}
		}
		const newMessages = [...messages];
		if (userText) {
			newMessages.push({ role: 'user', content: userText });
		}
		newMessages.push({ role: 'assistant', content: assistantText });
		setMessages(newMessages);
		if (responseListings && responseListings.length > 0) {
			setListings(responseListings);
		}
	};

	const sendToBackend = async (audioBase64: string = '') => {
		try {
			const response = await axios.post(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}/voice-chats`,
				{
					audioBuffer: audioBase64,
					dashboardId,
					dashboardName,
					messages,
				},
				{
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);
			processResponse(response);
		} catch (error) {
			console.error('Error communicating with backend:', error);
		}
	};

	const handleContinue = async () => {
		try {
			const response = await axios.post(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}/voice-chats`,
				{
					continue: true,
					dashboardId,
					dashboardName,
					messages,
				},
				{
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);
			processResponse(response);
		} catch (error) {
			console.error('Error continuing with backend:', error);
		}
	};

	const handleStartConversation = async () => {
		await sendToBackend();
		setHasStarted(true);
	};

	const handleStopRecording = async () => {
		if (
			mediaRecorderRef.current &&
			mediaRecorderRef.current.state !== 'inactive'
		) {
			mediaRecorderRef.current.stop();
		}
		setIsListening(false);
		setIsRecording(false);
	};

	useEffect(() => {
		if (isListening) {
			navigator.mediaDevices
				.getUserMedia({ audio: true })
				.then((stream) => {
					mediaRecorderRef.current = new MediaRecorder(stream);
					mediaRecorderRef.current.ondataavailable = (event) => {
						audioChunksRef.current.push(event.data);
					};
					mediaRecorderRef.current.onstop = async () => {
						if (audioChunksRef.current.length > 0) {
							const audioBlob = new Blob(audioChunksRef.current, {
								type: 'audio/mp3',
							});
							const audioBuffer = await audioBlob.arrayBuffer();
							const base64Audio = arrayBufferToBase64(audioBuffer);
							audioChunksRef.current = [];
							await sendToBackend(base64Audio);
						}
					};
					mediaRecorderRef.current.start();

					audioContextRef.current = new AudioContext();
					analyserRef.current = audioContextRef.current.createAnalyser();
					const microphone =
						audioContextRef.current.createMediaStreamSource(stream);
					microphone.connect(analyserRef.current);
					analyserRef.current.fftSize = 256;
					const bufferLength = analyserRef.current.frequencyBinCount;
					dataArrayRef.current = new Uint8Array(bufferLength);

					animationRef.current = requestAnimationFrame(updateAudioLevel);
				})
				.catch((err) => {
					console.error('Error accessing microphone:', err);
					setIsListening(false);
					setIsRecording(false);
				});
		} else {
			if (
				mediaRecorderRef.current &&
				mediaRecorderRef.current.state !== 'inactive'
			) {
				mediaRecorderRef.current.stop();
			}

			if (
				audioContextRef.current &&
				audioContextRef.current.state !== 'closed'
			) {
				audioContextRef.current
					.close()
					.catch((err) => console.error('Error closing AudioContext:', err));
				audioContextRef.current = null;
				analyserRef.current = null;
				dataArrayRef.current = null;
			}
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		}

		return () => {
			if (
				mediaRecorderRef.current &&
				mediaRecorderRef.current.state !== 'inactive'
			) {
				mediaRecorderRef.current.stop();
			}
			if (
				audioContextRef.current &&
				audioContextRef.current.state !== 'closed'
			) {
				audioContextRef.current.close();
			}
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, [isListening]);

	const handleMicToggle = () => {
		setIsListening((prev) => !prev);
		setIsRecording((prev) => !prev);
		isSpeakingRef.current = false;
		silenceStartRef.current = null;
	};

	const handleClose = () => {
		setIsListening(false);
		setIsRecording(false);
	};

	return {
		audioRef,
		isListening,
		audioLevel,
		isRecording,
		messages,
		listings,
		subtitles,
		isVisible,
		hasStarted,
		handleStartConversation,
		handleStopRecording,
		handleMicToggle,
		handleClose,
	};
};

export default useVoiceAssistant;
