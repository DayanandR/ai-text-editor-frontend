import { useAppSelector } from "../hooks";

// Mock the RTK Query hook for compatibility
export const useGetCurrentUserQuery = () => {
  const { user, loading, error } = useAppSelector((state) => state.auth);

  return {
    data: user ? { user } : null,
    isLoading: loading,
    error: error ? new Error(error) : null,
  };
};
