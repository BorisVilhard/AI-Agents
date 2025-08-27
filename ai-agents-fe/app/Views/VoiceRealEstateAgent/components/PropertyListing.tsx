import React, { useState } from 'react';
import { Share, Heart } from 'lucide-react';

interface PropertyData {
	address: string;
	price: string;
	beds: string;
	baths: string;
	imageSrc?: string;
	keyFacts?: string[];
}

interface Props {
	property: PropertyData;
}

const PropertyListing = ({ property }: Props) => {
	const [isLiked, setIsLiked] = useState(false);

	const formatPrice = (price: string): string => {
		return price;
	};

	return (
		<div className='max-w-sm mx-auto bg-gray-800 rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105'>
			<div className='flex flex-col'>
				<div className='w-full'>
					<img
						src={
							property.imageSrc ||
							'https://via.placeholder.com/400x300?text=No+Image'
						}
						alt='Property view'
						className='w-full h-48 object-cover'
					/>
				</div>

				<div className='p-4 text-white'>
					<div className='flex justify-between items-start mb-3'>
						<h1 className='text-xl font-semibold'>
							{formatPrice(property.price)}
						</h1>
						<div className='flex gap-2'>
							<button
								className='p-1.5 rounded-full hover:bg-gray-700 transition-colors duration-200' // No border, minimal
								aria-label='Share property'
							>
								<Share size={16} className='text-gray-400' />
							</button>
							<button
								onClick={() => setIsLiked(!isLiked)}
								className={`p-1.5 rounded-full transition-colors duration-200 ${
									isLiked ? 'bg-red-500/20' : 'hover:bg-gray-700'
								}`}
								aria-label={
									isLiked ? 'Remove from favorites' : 'Add to favorites'
								}
							>
								<Heart
									size={16}
									className={
										isLiked ? 'text-red-400 fill-current' : 'text-gray-400'
									}
								/>
							</button>
						</div>
					</div>

					<div className='flex gap-6 mb-3 text-sm font-light'>
						<div className='flex items-center gap-1'>
							<span>{property.beds} beds</span>
						</div>
						<div className='flex items-center gap-1'>
							<span>{property.baths} baths</span>
						</div>
					</div>

					<p className='text-sm text-gray-300 mb-3'>{property.address}</p>

					{property.keyFacts && property.keyFacts.length > 0 && (
						<div className='flex gap-4 text-xs text-gray-500'>
							{property.keyFacts.map((fact, index) => (
								<span key={index}>{fact}</span>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default PropertyListing;
