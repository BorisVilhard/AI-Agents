import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';

type AuthState = {
	id: string | null;
	username: string | null;
	email: string | null;
	accessToken: string | null;
	isRehydrated: boolean;
};

type AuthActions = {
	setCredentials: (
		id: string,
		username: string,
		email: string,
		accessToken: string | null
	) => void;
	logOut: () => void;
	refreshAccessToken: () => Promise<boolean>;
	setRehydrated: (value: boolean) => void;
	makeAuthenticatedRequest: (
		url: string,
		options?: RequestInit
	) => Promise<Response>;
};

type AuthStore = AuthState & AuthActions;

const useAuthStore = create<AuthStore>()(
	persist<AuthStore>(
		(set, get) => ({
			id: null,
			username: null,
			email: null,
			accessToken: null,
			isRehydrated: false,
			lastUserUpdate: 0,

			setCredentials: (id, username, email, accessToken) => {
				console.log('setCredentials:', {
					id,
					username,
					email,
					accessToken: !!accessToken,
				});

				set((state) => ({
					id,
					username,
					email,
					accessToken: accessToken !== null ? accessToken : state.accessToken,
					isRehydrated: state.isRehydrated,
				}));
			},

			logOut: () => {
				console.log('logOut called');
				set({
					id: null,
					username: null,
					email: null,
					accessToken: null,
					isRehydrated: false,
				});
				document.cookie = 'jwt=; Max-Age=0; path=/; sameSite=lax; secure';
				localStorage.clear();
			},

			refreshAccessToken: async () => {
				console.log('refreshAccessToken called');
				try {
					const response = await fetch(
						`${process.env.NEXT_PUBLIC_BACKEND_URL}/email/auth/refresh-token`,
						{
							method: 'GET',
							credentials: 'include',
						}
					);

					if (response.ok) {
						const data = await response.json();
						console.log('refreshAccessToken response:', { data });

						if (
							data.tokens !== undefined &&
							(typeof data.tokens !== 'number' || data.tokens < 0)
						) {
							console.error('Invalid tokens value:', data.tokens);
							return false;
						}

						set({
							id: data.id || get().id,
							username: data.username || get().username,
							email: data.email || get().email,
							accessToken: data.accessToken,
							isRehydrated: get().isRehydrated,
						});
						return true;
					} else {
						console.log('refreshAccessToken failed:', response.status);
						return false;
					}
				} catch (error) {
					console.error('Failed to refresh access token:', error);
					return false;
				}
			},

			setRehydrated: (value) => {
				console.log('setRehydrated:', value);
				set({ isRehydrated: value });
			},

			makeAuthenticatedRequest: async (url, options = {}) => {
				const accessToken = get().accessToken;
				console.log('makeAuthenticatedRequest:', {
					url,
					hasToken: !!accessToken,
				});
				if (!accessToken) {
					throw new Error('No access token available');
				}

				const headers = {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`,
					...options.headers,
				};

				const fetchOptions: RequestInit = {
					...options,
					headers,
					credentials: 'include',
				};

				try {
					const response = await fetch(url, fetchOptions);
					console.log('makeAuthenticatedRequest response:', response.status);
					if (response.status === 401) {
						const refreshed = await get().refreshAccessToken();
						if (refreshed) {
							const newAccessToken = get().accessToken;
							fetchOptions.headers = {
								...headers,
								Authorization: `Bearer ${newAccessToken}`,
							};
							return await fetch(url, fetchOptions);
						} else {
							throw new Error('Failed to refresh access token');
						}
					}
					return response;
				} catch (error) {
					console.error('makeAuthenticatedRequest failed:', error);
					throw error;
				}
			},
		}),
		{
			name: 'auth-storage',
			getStorage: () => localStorage,
			onRehydrateStorage: () => (state) => {
				console.log('onRehydrateStorage:', state);
				if (state) {
					if (state.isRehydrated && !state.accessToken) {
						state.logOut();
					} else {
						state.setRehydrated(true);
					}
				}
			},
		} as PersistOptions<AuthStore>
	)
);

export const selectCurrentUser = (state: AuthState) => ({
	id: state.id,
	username: state.username,
	email: state.email,
	accessToken: state.accessToken,
});

export default useAuthStore;
