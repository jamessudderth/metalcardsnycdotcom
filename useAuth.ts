import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // Try local auth first, then fall back to Replit auth
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
