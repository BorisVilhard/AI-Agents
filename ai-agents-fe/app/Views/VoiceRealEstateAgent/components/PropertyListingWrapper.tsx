import React from 'react';
import PropertyListing from './PropertyListing';

interface Props {
	listings: any[];
}

const PropertyListingWrapper: React.FC<Props> = ({ listings }) => {
	if (listings.length === 0) return null;

	return (
		<div className='w-full max-w-6xl p-4'>
			<h2 className='text-xl font-light mb-6 text-center text-gray-300'>
				Top Listings
			</h2>
			<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
				{listings.map((listing, index) => (
					<div
						key={index}
						className='opacity-0 animate-fadeInUp'
						style={{ animationDelay: `${index * 0.15}s` }}
					>
						<PropertyListing property={listing} />
					</div>
				))}
			</div>
		</div>
	);
};

export default PropertyListingWrapper;
