'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as jwt_decode from 'jwt-decode';
import useAuthStore from '../Store/AuthStore';

interface Props {
	children: ReactNode;
}

interface DecodedToken {
	exp: number;
}

const ProtectedRoute = ({ children }: Props) => {
	const { accessToken, refreshAccessToken, logOut, isRehydrated } =
		useAuthStore();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const checkToken = async () => {
			if (!isRehydrated) {
				return;
			}

			if (!accessToken) {
				const refreshSuccess = await refreshAccessToken();

				if (!refreshSuccess || !useAuthStore.getState().accessToken) {
					router.push('/');
					setIsLoading(false);
					return;
				}
			} else {
				try {
					const decoded: DecodedToken = jwt_decode.jwtDecode(accessToken);
					const currentTime = Date.now() / 1000;

					if (decoded.exp < currentTime) {
						const refreshSuccess = await refreshAccessToken();
						if (!refreshSuccess || !useAuthStore.getState().accessToken) {
							router.push('/');
							setIsLoading(false);
							return;
						}
					}
				} catch (error) {
					await logOut();
					router.push('/');
					setIsLoading(false);
					return;
				}
			}
			setIsLoading(false);
		};

		checkToken();
	}, [accessToken, refreshAccessToken, logOut, router, isRehydrated]);

	if (isLoading || !isRehydrated) {
		return <>Loading...</>;
	}

	return <>{children}</>;
};

export default ProtectedRoute;
