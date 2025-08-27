import React from 'react';

interface Props {
	subtitles: string;
	isVisible: boolean;
}

const SubtitlesDisplay: React.FC<Props> = ({ subtitles, isVisible }) => {
	if (!subtitles) return null;

	return (
		<div
			className={`text-center mb-8 text-lg font-light text-gray-200 max-w-3xl px-6 py-3 bg-black/20 rounded-full transition-all duration-500 ease-in-out transform ${
				isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
			}`}
		>
			{subtitles}
		</div>
	);
};

export default SubtitlesDisplay;
