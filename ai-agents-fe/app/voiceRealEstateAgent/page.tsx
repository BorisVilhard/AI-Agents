import ProtectedRoute from '../utils/ProtectedRoute';
import VoiceRealEstateAgent from '../Views/VoiceRealEstateAgent/VoiceRealEstateAgent';

const VoiceRealEstate = () => {
	return (
		<ProtectedRoute>
			<VoiceRealEstateAgent />
		</ProtectedRoute>
	);
};

export default VoiceRealEstate;
