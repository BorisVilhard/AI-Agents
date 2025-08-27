'use client';

import ProtectedRoute from '../utils/ProtectedRoute';
import LeadsPage from '../Views/SalesLeadsAgent/SalesLeadsAgent';

export default function Leads() {
	return (
		<ProtectedRoute>
			<LeadsPage />
		</ProtectedRoute>
	);
}
