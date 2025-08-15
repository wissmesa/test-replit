import { useQuery } from "@tanstack/react-query";
import type { UserWithApartment } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery<UserWithApartment | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
