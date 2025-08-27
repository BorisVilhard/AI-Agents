'use client';

import useAuthStore from '@/app/Store/AuthStore';
import { Lead, LeadResult, MappedLead } from '@/app/types';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import LeadForm from './features/LeadForm';
import { LeadResults } from './features/LeadResults';

export const schema = z.object({
	file: z
		.custom<FileList>((val) => val instanceof FileList, 'Please upload a file.')
		.refine((val) => val.length > 0, 'Please upload a file.'),
	instructions: z.string().min(1, 'Instructions are required'),
	offer: z.string().min(1, 'Offer is required'),
});

type LeadFormData = z.infer<typeof schema>;

async function parseLeads(file: File): Promise<MappedLead[]> {
	const dataArr = await file.arrayBuffer();
	const workbook = XLSX.read(dataArr);
	const sheet = workbook.Sheets[workbook.SheetNames[0]];
	const leads: Lead[] = XLSX.utils.sheet_to_json(sheet);
	return leads
		.map((l: Lead) => ({
			name: l.username,
			demographic: l.demographic,
			website: l.website?.startsWith('http')
				? l.website
				: l.website
				? `https://${l.website}`
				: undefined,
			email: l.email?.trim().replace(/,(\d)/g, '.$1') || '',
		}))
		.filter((l) => l.email);
}

export default function LeadsPage() {
	const { accessToken, makeAuthenticatedRequest } = useAuthStore();

	const loggedIn = !!accessToken;

	const [leads, setLeads] = useState<LeadResult[]>([]);
	const [loading, setLoading] = useState(false);

	const onSubmit = async (data: LeadFormData) => {
		if (!loggedIn) {
			return;
		}
		setLoading(true);

		setLeads([]);
		try {
			const mappedLeads = await parseLeads(data.file[0]);
			const res = await makeAuthenticatedRequest(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/leads/process-leads`,
				{
					method: 'POST',
					body: JSON.stringify({
						instructions: data.instructions,
						offer: data.offer,
						leads: mappedLeads,
					}),
				}
			);
			if (!res.ok) {
				const text = await res.text();
				console.error('Backend response:', text);
				throw new Error(`HTTP ${res.status}: ${text}`);
			}
			const json = await res.json();
			setLeads(json.results);
		} catch (err: unknown) {
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-neutral-80 p-4'>
			<div className='bg-neutral-80 p-6 rounded-md shadow-lg w-full max-w-4xl border border-neutral-60'>
				<h1 className='text-2xl font-semibold mb-6 text-center text-neutral-5'>
					AI Sales Manager
				</h1>
				<LeadForm onSubmit={onSubmit} loading={loading} loggedIn={loggedIn} />
				{leads.length > 0 && (
					<LeadResults result={{ totalLeads: leads.length, results: leads }} />
				)}
			</div>
		</div>
	);
}
