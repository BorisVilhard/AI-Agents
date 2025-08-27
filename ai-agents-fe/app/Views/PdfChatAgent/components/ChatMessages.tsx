import { Message } from '@/app/types';

const ChatMessages: React.FC<{
	messages: Message[];
	isTyping: boolean;
	hasUploaded: boolean;
	formatTime: (dateStr: string) => string;
	renderMessageContent: (message: Message) => React.ReactNode;
	messagesEndRef: React.RefObject<HTMLDivElement | null>;
}> = ({
	messages,
	isTyping,
	hasUploaded,
	formatTime,
	renderMessageContent,
	messagesEndRef,
}) => (
	<div className='w-full max-w-[80%] flex-1 max-h-[60vh] overflow-y-auto'>
		{messages.length === 0 && !hasUploaded ? (
			<div className='h-full flex flex-col items-center justify-center'>
				<p className='mt-2 text-gray-600'>
					Upload your legal documents to begin
				</p>
			</div>
		) : (
			<div className='space-y-4 p-4'>
				{messages.map((message) => (
					<div
						key={message.id}
						className={`flex ${
							message.role === 'user' ? 'justify-end' : 'justify-start'
						}`}
					>
						<div
							className={`max-w-[70%] p-3 rounded-xl shadow-sm transition-all duration-200 ${
								message.role === 'user'
									? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
									: 'bg-gray-100 text-gray-800 border border-gray-200'
							}`}
						>
							<div className='text-sm leading-relaxed'>
								{renderMessageContent(message)}
							</div>
							<p
								className={`text-xs mt-1 ${
									message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
								}`}
							>
								{formatTime(message.timestamp)}
							</p>
						</div>
					</div>
				))}
				{isTyping && (
					<div className='flex justify-start'>
						<div className='bg-gray-100 text-gray-800 rounded-xl p-3 shadow-sm'>
							<div className='flex space-x-1'>
								<div className='w-2 h-2 bg-gray-500 rounded-full animate-bounce'></div>
								<div
									className='w-2 h-2 bg-gray-500 rounded-full animate-bounce'
									style={{ animationDelay: '0.1s' }}
								></div>
								<div
									className='w-2 h-2 bg-gray-500 rounded-full animate-bounce'
									style={{ animationDelay: '0.2s' }}
								></div>
							</div>
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>
		)}
	</div>
);

export default ChatMessages;
