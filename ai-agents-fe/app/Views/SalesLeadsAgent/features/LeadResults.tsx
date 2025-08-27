interface Result {
	totalLeads: number;
	results: { email: string; status: string }[];
}

export function LeadResults({ result }: { result: Result }) {
	return (
		<div className='mt-8 bg-neutral-5 p-6 rounded-lg border border-neutral-20'>
			<h2 className='text-2xl font-bold mb-4 text-primary-70'>Results</h2>
			<p className='text-neutral-90 mb-4 font-medium'>
				Total Leads: {result.totalLeads}
			</p>
			<div className='overflow-x-auto'>
				<table className='w-full text-left text-neutral-90'>
					<thead>
						<tr className='bg-neutral-20'>
							<th className='p-3 font-semibold'>Email</th>
							<th className='p-3 font-semibold'>Status</th>
						</tr>
					</thead>
					<tbody>
						{result.results.map((r, i) => (
							<tr
								key={i}
								className='border-b border-neutral-20 last:border-b-0 hover:bg-neutral-10'
							>
								<td className='p-3'>{r.email}</td>
								<td className='p-3'>{r.status}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
