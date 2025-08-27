'use client';

import { AIAssistantChatProps, Message } from '@/app/types';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';

const generateId = () => Math.random().toString(36).substr(2, 9);

const AIAssistantChat = ({
	getRecommendedContract,
	userId,
}: AIAssistantChatProps) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState<string>('');
	const [isTyping, setIsTyping] = useState<boolean>(false);
	const [uploadedFileNames, setUploadedFileNames] = useState<string[]>([]);
	const [localUserId] = useState<string | null>(() => {
		if (userId) return null;
		let id = localStorage.getItem('chatUserId');
		if (id) return id;
		const newId = generateId();
		localStorage.setItem('chatUserId', newId);
		return newId;
	});
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const effectiveUserId = userId || localUserId;
	const messagesKey = `messages_${effectiveUserId}`;
	const uploadedFilesKey = `uploadedFiles_${effectiveUserId}`;
	const hasUploaded = uploadedFileNames.length > 0;

	useEffect(() => {
		if (effectiveUserId) {
			const fetchHistory = async () => {
				try {
					const res = await fetch(
						`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/chat/${effectiveUserId}`
					);
					if (res.ok) {
						const data = await res.json();
						const loadedMessages = (data.messages || []).map((msg: any) => ({
							...msg,
							id: msg.id || generateId(),
							timestamp: msg.timestamp || new Date().toISOString(),
						}));
						setMessages(loadedMessages);
						setUploadedFileNames(data.fileNames || []);
						localStorage.setItem(messagesKey, JSON.stringify(loadedMessages));
						localStorage.setItem(
							uploadedFilesKey,
							JSON.stringify(data.fileNames || [])
						);
					} else if (res.status === 404) {
						localStorage.removeItem(messagesKey);
						localStorage.removeItem(uploadedFilesKey);
						setMessages([]);
						setUploadedFileNames([]);
					} else {
						throw new Error('Failed to fetch chat history');
					}
				} catch (error) {
					console.error('Error fetching chat history:', error);
				}
			};
			fetchHistory();
		}
	}, [effectiveUserId, messagesKey, uploadedFilesKey]);

	useEffect(() => {
		localStorage.setItem(messagesKey, JSON.stringify(messages));
	}, [messages, messagesKey]);

	useEffect(() => {
		localStorage.setItem(uploadedFilesKey, JSON.stringify(uploadedFileNames));
	}, [uploadedFileNames, uploadedFilesKey]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, uploadedFileNames]);

	const handleFileChange = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const files = Array.from(e.target.files || []);
			const pdfFiles = files.filter((file) => file.type === 'application/pdf');
			if (pdfFiles.length === 0) {
				if (files.length > 0) {
					const errorMessage: Message = {
						id: generateId(),
						role: 'assistant',
						content: 'Only PDF files are allowed. Non-PDF files were ignored.',
						timestamp: new Date().toISOString(),
					};
					setMessages((prev) => [...prev, errorMessage]);
				}
				return;
			}

			setIsTyping(true);
			const newFileNames = pdfFiles.map((f) => f.name);
			setUploadedFileNames((prev) => [...new Set([...prev, ...newFileNames])]);

			try {
				const formData = new FormData();
				pdfFiles.forEach((file) => formData.append('files', file));

				const uploadUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/documents/${effectiveUserId}`;
				const uploadResponse = await fetch(uploadUrl, {
					method: 'POST',
					body: formData,
				});

				if (!uploadResponse.ok) {
					throw new Error('Failed to upload documents');
				}

				toast.success(`Uploaded ${pdfFiles.length} PDF(s) successfully.`, {
					position: 'top-right',
					autoClose: 3000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
				});

				if (fileInputRef.current) fileInputRef.current.value = '';
			} catch (error) {
				setUploadedFileNames((prev) =>
					prev.filter((name) => !newFileNames.includes(name))
				);
				const errorMessage: Message = {
					id: generateId(),
					role: 'assistant',
					content: 'Sorry, there was an error uploading your files.',
					timestamp: new Date().toISOString(),
				};
				setMessages((prev) => [...prev, errorMessage]);
				console.error('Error in upload:', error);
			} finally {
				setIsTyping(false);
			}
		},
		[effectiveUserId]
	);

	const handleSubmit = useCallback(
		async (
			e:
				| React.KeyboardEvent<HTMLInputElement>
				| React.MouseEvent<HTMLButtonElement>
		) => {
			if (
				(e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') ||
				!input.trim() ||
				!effectiveUserId
			) {
				return;
			}

			e.preventDefault?.();

			const userMessage: Message = {
				id: generateId(),
				role: 'user',
				content: input,
				timestamp: new Date().toISOString(),
			};
			setMessages((prev) => [...prev, userMessage]);

			setInput('');
			setIsTyping(true);

			try {
				const aiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/chat/${effectiveUserId}`;
				const body = { message: input };
				const aiResponse = await fetch(aiUrl, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
				});
				if (!aiResponse.ok) {
					throw new Error('Failed to get AI response');
				}
				const aiData = await aiResponse.json();

				const assistantMessage: Message = {
					id: generateId(),
					role: 'assistant',
					content: aiData.message,
					timestamp: new Date().toISOString(),
				};
				setMessages((prev) => [...prev, assistantMessage]);
			} catch (error) {
				const errorMessage: Message = {
					id: generateId(),
					role: 'assistant',
					content: 'Sorry, there was an error processing your request.',
					timestamp: new Date().toISOString(),
				};
				setMessages((prev) => [...prev, errorMessage]);
			} finally {
				setIsTyping(false);
			}
		},
		[effectiveUserId, input]
	);

	const handleDeleteFile = useCallback(
		async (fileName: string) => {
			try {
				const res = await fetch(
					`${
						process.env.NEXT_PUBLIC_BACKEND_URL
					}/chat/documents/${effectiveUserId}/${encodeURIComponent(fileName)}`,
					{
						method: 'DELETE',
					}
				);
				if (res.ok) {
					setUploadedFileNames((prev) => prev.filter((n) => n !== fileName));
					toast.success(`File ${fileName} deleted successfully.`, {
						position: 'top-right',
						autoClose: 3000,
						hideProgressBar: false,
						closeOnClick: true,
						pauseOnHover: true,
						draggable: true,
					});
				} else {
					throw new Error('Failed to delete document');
				}
			} catch (error) {
				const errorMessage: Message = {
					id: generateId(),
					role: 'assistant',
					content: 'Failed to delete the document.',
					timestamp: new Date().toISOString(),
				};
				setMessages((prev) => [...prev, errorMessage]);
			}
		},
		[effectiveUserId]
	);

	const handleClearConversation = useCallback(() => {
		setMessages([]);
		localStorage.removeItem(messagesKey);
	}, [messagesKey]);

	const formatTime = useCallback((dateStr: string): string => {
		const date = new Date(dateStr);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}, []);

	const renderMessageContent = useCallback(
		(message: Message) => {
			const content = message.content;
			if (
				content.includes('Myslím, že potrebujete kúpnu zmluvu na nehnuteľnosti')
			) {
				const contractName = 'contract';
				return (
					<span
						className='text-blue-600 underline cursor-pointer hover:text-blue-800 flex items-center'
						onClick={() => getRecommendedContract(contractName)}
					>
						<svg
							className='w-6 h-6 mr-1'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth='2'
								d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
							/>
						</svg>
						{content}
					</span>
				);
			}
			return <span className='inline-block'>{content}</span>;
		},
		[getRecommendedContract]
	);

	const handleUploadClick = () => fileInputRef.current?.click();

	return (
		<div className='h-[100vh] bg-gradient-to-tl from-purple-100 via-blue-100 to-white flex flex-col items-center justify-center p-4'>
			<ToastContainer />
			{hasUploaded && (
				<UploadedFiles
					fileNames={uploadedFileNames}
					onDelete={handleDeleteFile}
				/>
			)}
			<ChatMessages
				messages={messages}
				isTyping={isTyping}
				hasUploaded={hasUploaded}
				formatTime={formatTime}
				renderMessageContent={renderMessageContent}
				messagesEndRef={messagesEndRef}
			/>
			<ChatInput
				input={input}
				setInput={setInput}
				isTyping={isTyping}
				onSubmit={handleSubmit}
				onUploadClick={handleUploadClick}
				hasUploaded={hasUploaded}
				onClear={handleClearConversation}
				fileInputRef={fileInputRef}
				handleFileChange={handleFileChange}
			/>
		</div>
	);
};

export default AIAssistantChat;
