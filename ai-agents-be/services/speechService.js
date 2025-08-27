import axios from 'axios';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import os from 'os';
import FormData from 'form-data';
import ElevenLabsSDK from 'elevenlabs-node';

const elevenLabs = new ElevenLabsSDK({
	apiKey: process.env.ELEVENLABS_API_KEY,
});

export const speechToText = async (audioBuffer) => {
	try {
		if (!process.env.ELEVENLABS_API_KEY) {
			throw new Error('ELEVENLABS_API_KEY is not set in the .env file.');
		}
		if (!Buffer.isBuffer(audioBuffer) || audioBuffer.length === 0) {
			throw new Error('Invalid or empty audio');
		}
		const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'audio-'));
		const tempPath = path.join(tempDir, 'temp_audio.mp3');
		await fsp.writeFile(tempPath, audioBuffer);
		const form = new FormData();
		form.append('file', fs.createReadStream(tempPath));
		form.append('model_id', 'scribe_v1');
		const response = await axios.post(
			'https://api.elevenlabs.io/v1/speech-to-text',
			form,
			{
				headers: {
					'xi-api-key': process.env.ELEVENLABS_API_KEY,
					...form.getHeaders(),
				},
			}
		);
		await fsp.rm(tempDir, { recursive: true });
		return response.data.text;
	} catch (error) {
		console.error(
			'STT Error Details:',
			error.response ? error.response.data : error.message
		);
		throw new Error(`Speech-to-text failed: ${error.message}`);
	}
};

export const textToSpeech = async (text) => {
	try {
		if (!process.env.ELEVENLABS_API_KEY) {
			throw new Error('ELEVENLABS_API_KEY is not set in the .env file.');
		}
		const voiceId = process.env.ELEVENLABS_VOICE_ID;
		if (!text || typeof text !== 'string') {
			throw new Error('Invalid or empty text provided for TTS.');
		}
		const stream = await elevenLabs.textToSpeechStream({
			textInput: text,
			voiceId: voiceId,
			modelId: 'eleven_multilingual_v2',
			voiceSettings: {
				stability: 0.5,
				similarity_boost: 0.8,
				style: 0.0,
				use_speaker_boost: true,
			},
		});
		if (!stream) {
			throw new Error('TTS stream is undefined or invalid.');
		}
		const buffers = [];
		for await (const chunk of stream) {
			buffers.push(chunk);
		}
		const audioBuffer = Buffer.concat(buffers);
		return audioBuffer;
	} catch (error) {
		console.error(
			'TTS Error Details:',
			error.response ? error.response.data : error.message
		);
		throw new Error(`Text-to-speech failed: ${error.message}`);
	}
};
