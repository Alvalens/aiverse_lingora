import { useQuery } from "@tanstack/react-query";

/**
 * Hook for fetching token balance with auto-refresh every 5 seconds.
 * Use this for components that need to display up-to-date balance like navbar.
 */
function useTokenBalance() {
	return useQuery({
		queryKey: ["tokenBalance"],
		queryFn: async () => {
			const response = await fetch("/api/user/tokens");
			if (!response.ok) throw new Error("Failed to fetch token balance");
			return response.json();
		},
		refetchInterval: 5000, // Refetch every 5 seconds
	});
}

/**
 * Hook for fetching token balance once without auto-refresh.
 * Use this for one-time usage scenarios where constant updates are not needed.
 */
function useStaticTokenBalance() {
	return useQuery({
		queryKey: ["staticTokenBalance"],
		queryFn: async () => {
			const response = await fetch("/api/user/tokens");
			if (!response.ok) throw new Error("Failed to fetch token balance");
			return response.json();
		},
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		refetchOnReconnect: false,
		staleTime: Infinity,
	});
}

export { useTokenBalance, useStaticTokenBalance };
