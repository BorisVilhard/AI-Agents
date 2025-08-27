import React from 'react';
import { Mic, MicOff, X } from 'lucide-react';

interface Props {
	hasStarted: boolean;
	isListening: boolean;
	onStartConversation: () => void;
	onMicToggle: () => void;
	onClose: () => void;
}

const Controls = ({
	hasStarted,
	isListening,
	onStartConversation,
	onMicToggle,
	onClose,
}: Props) => {
	return (
		<div className='flex justify-center items-center space-x-6 mb-8'>
			{!hasStarted ? (
				<button
					onClick={onStartConversation}
					className='px-6 py-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors text-sm font-light'
				>
					Start Conversation
				</button>
			) : (
				<button
					onClick={onMicToggle}
					className={`p-3 rounded-full transition-all duration-200 ${
						!isListening
							? 'bg-red-500 hover:bg-red-600'
							: 'bg-gray-800 hover:bg-gray-700'
					}`}
				>
					{!isListening ? <MicOff size={20} /> : <Mic size={20} />}
				</button>
			)}
			<button
				onClick={onClose}
				className='p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors'
			>
				<X size={20} />
			</button>
		</div>
	);
};

export default Controls;
