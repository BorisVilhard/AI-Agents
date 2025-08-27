const ChatInput: React.FC<{
	input: string;
	setInput: (value: string) => void;
	isTyping: boolean;
	onSubmit: (
		e:
			| React.KeyboardEvent<HTMLInputElement>
			| React.MouseEvent<HTMLButtonElement>
	) => void;
	onUploadClick: () => void;
	hasUploaded: boolean;
	onClear: () => void;
	fileInputRef: React.RefObject<HTMLInputElement | null>;
	handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({
	input,
	setInput,
	isTyping,
	onSubmit,
	onUploadClick,
	hasUploaded,
	onClear,
	fileInputRef,
	handleFileChange,
}) => (
	<div className='w-full max-w-3xl mt-4'>
		<div className='flex flex-col'>
			<div className='flex items-center space-x-2'>
				<input
					type='file'
					accept='application/pdf'
					multiple
					onChange={handleFileChange}
					ref={fileInputRef}
					className='hidden'
					id='file-upload'
				/>
				<input
					type='text'
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={onSubmit}
					placeholder='Ask about legal documents...'
					className='flex-1 bg-white border border-gray-300 rounded-full px-6 py-4 outline-none text-gray-800 placeholder-gray-400 text-sm shadow-sm hover:bg-gray-50 focus:bg-white focus:border-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50'
					disabled={isTyping}
				/>
				<button
					onClick={onSubmit}
					disabled={isTyping || !input.trim()}
					className='bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full p-3 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 shadow-md'
				>
					<svg
						className='w-5 h-5'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
						xmlns='http://www.w3.org/2000/svg'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='2'
							d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
						/>
					</svg>
				</button>
			</div>
		</div>
		<div className='flex justify-between mt-3'>
			<button
				onClick={onClear}
				className='flex items-center text-sm text-red-500 hover:text-red-600 transition-colors duration-200'
			>
				<svg
					className='w-4 h-4 mr-1'
					fill='none'
					stroke='currentColor'
					viewBox='0 0 24 24'
					xmlns='http://www.w3.org/2000/svg'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth='2'
						d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a2 2 0 012 2v2H8V5a2 2 0 012-2zm-4 4h12'
					/>
				</svg>
				Delete messages
			</button>
			<button
				onClick={onUploadClick}
				className='flex items-center text-sm text-blue-500 hover:text-blue-600 transition-colors duration-200'
			>
				<svg
					className='w-4 h-4 mr-1'
					fill='none'
					stroke='currentColor'
					viewBox='0 0 24 24'
					xmlns='http://www.w3.org/2000/svg'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth='2'
						d='M7 16a4 4 0 01-.88-7.903A5 5 0 0113 6a5 5 0 014.9 6.097A4 4 0 0117 16H7zM12 11v6m-3-3h6'
					/>
				</svg>
				{hasUploaded ? 'Add PDFs' : 'Upload PDFs'}
			</button>
		</div>
	</div>
);

export default ChatInput;
