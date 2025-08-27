'use client';

import useAuthStore, { selectCurrentUser } from '../Store/AuthStore';
import ProtectedRoute from '../utils/ProtectedRoute';
import AIAssistantChat from '../Views/PdfChatAgent/AIAssistantChat';

interface Props {}

const AIChat = (props: Props) => {
	const { id: userId } = useAuthStore(selectCurrentUser);

	const getRecommendedContract = (contractName: string) => {
		console.log(`Recommended contract: ${contractName}`);
	};

	return (
		<ProtectedRoute>
			<AIAssistantChat
				getRecommendedContract={getRecommendedContract}
				userId={userId || ''}
			/>
		</ProtectedRoute>
	);
};

export default AIChat;
