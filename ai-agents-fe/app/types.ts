export interface LeadResult {
	username?: string;
	email: string;
	business_type: string;
	status: string;
	subject?: string;
	body?: string;
}

export interface Lead {
	username?: string;
	demographic?: string;
	website?: string;
	email?: string;
}

export interface MappedLead {
	name?: string;
	demographic?: string;
	website?: string;
	email?: string;
}

export interface FileInfo {
	name: string;
	path: string;
}

export interface Message {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	timestamp: string;
	files?: FileInfo[];
}

export interface AIAssistantChatProps {
	getRecommendedContract: (contractName: string) => void;
	userId: string | null;
}
