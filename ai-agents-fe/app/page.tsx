'use client';

import Link from 'next/link';
import ProtectedRoute from './utils/ProtectedRoute';

export default function Home() {
	const agents = [
		{ href: '/SalesLeadsAgent', text: 'Try Sales Lead Agent' },
		{ href: '/VoiceRealEstateAgent', text: 'Try Real Estate Voice Agent' },
		{ href: '/PdfChatAgent', text: 'Try Technical Issues Agent' },
	];

	const buttonClass =
		'rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto';

	return (
		<ProtectedRoute>
			<div className='font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20'>
				<main className='flex flex-col gap-[32px] row-start-2 items-center'>
					<h1 className='text-3xl font-bold'>
						Welcome! Choose an Agent to Try
					</h1>
					<div className='flex flex-col gap-4 items-center'>
						{agents.map((agent) => (
							<Link key={agent.href} href={agent.href} className={buttonClass}>
								{agent.text}
							</Link>
						))}
					</div>
				</main>
			</div>
		</ProtectedRoute>
	);
}
