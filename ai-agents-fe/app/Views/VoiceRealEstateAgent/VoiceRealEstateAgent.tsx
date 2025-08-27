'use client';

import React from 'react';
import useVoiceAssistant from './api';
import VoiceOrb from './components/VoiceOrb';
import SubtitlesDisplay from './components/SubtitlesDisplay';
import Controls from './components/Controls';
import PropertyListingWrapper from './components/PropertyListingWrapper';

const VoiceRealEstateAgent = () => {
	const {
		audioRef,
		isListening,
		audioLevel,
		subtitles,
		isVisible,
		hasStarted,
		listings,
		handleStartConversation,
		handleMicToggle,
		handleClose,
	} = useVoiceAssistant();

	return (
		<div className='min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center justify-center p-4'>
			<audio ref={audioRef} />
			<h1 className='text-3xl font-light mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400'>
				Real Estate AI Agent
			</h1>
			<VoiceOrb isListening={isListening} audioLevel={audioLevel} />
			<SubtitlesDisplay subtitles={subtitles} isVisible={isVisible} />
			<Controls
				hasStarted={hasStarted}
				isListening={isListening}
				onStartConversation={handleStartConversation}
				onMicToggle={handleMicToggle}
				onClose={handleClose}
			/>
			<PropertyListingWrapper listings={listings} />
		</div>
	);
};

export default VoiceRealEstateAgent;
