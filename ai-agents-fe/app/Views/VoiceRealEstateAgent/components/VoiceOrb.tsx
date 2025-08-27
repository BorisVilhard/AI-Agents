import React from 'react';

interface VoiceOrbProps {
	isListening: boolean;
	audioLevel: number;
}

const VoiceOrb: React.FC<VoiceOrbProps> = ({ isListening, audioLevel }) => {
	const generateVisualizationCircles = () => {
		const circles = [];
		const baseRadius = 100;
		const maxRadius = 180;
		for (let i = 0; i < 2; i++) {
			const intensity = Math.max(0.1, audioLevel - i * 0.2);
			const radius = baseRadius + (maxRadius - baseRadius) * intensity;
			const opacity = isListening ? intensity * 0.4 : 0.05;
			circles.push(
				<div
					key={i}
					className='absolute rounded-full border border-blue-300/50'
					style={{
						width: `${radius * 2}px`,
						height: `${radius * 2}px`,
						opacity: opacity,
						animation: isListening
							? `pulse-${i} 2.5s ease-in-out infinite`
							: 'none',
					}}
				/>
			);
		}
		return circles;
	};

	return (
		<div className='relative flex items-center justify-center mb-8'>
			{generateVisualizationCircles()}
			<div
				className={`relative w-28 h-28 rounded-full transition-all duration-300 ${
					isListening
						? 'bg-gradient-to-b from-blue-400 to-purple-400 shadow-xl shadow-blue-400/30'
						: 'bg-gradient-to-b from-gray-800 to-gray-900'
				}`}
				style={{
					transform: isListening
						? `scale(${1 + audioLevel * 0.15})`
						: 'scale(1)',
				}}
			>
				<div className='absolute inset-2 rounded-full bg-gradient-to-b from-white/10 to-transparent'></div>
			</div>
		</div>
	);
};

export default VoiceOrb;
