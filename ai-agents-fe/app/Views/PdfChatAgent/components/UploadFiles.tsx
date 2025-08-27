const UploadedFiles: React.FC<{
	fileNames: string[];
	onDelete: (fileName: string) => void;
}> = ({ fileNames, onDelete }) => (
	<div className='w-full bg-white shadow-md max-w-[80%] mb-4'>
		{fileNames.map((name) => (
			<div
				key={name}
				className='flex justify-between items-center text-black p-2 rounded mb-1'
			>
				<span>{name}</span>
				<button
					onClick={() => onDelete(name)}
					className='text-red-500 hover:text-red-700 transition-colors'
				>
					Delete
				</button>
			</div>
		))}
	</div>
);
