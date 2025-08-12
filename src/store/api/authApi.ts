import { useAppSelector } from "../hooks";

export const useGetCurrentUserQuery = () => {
  const { user, loading, error } = useAppSelector((state) => state.auth);

  return {
    data: user ? { user } : null,
    isLoading: loading,
    error: error ? new Error(error) : null,
  };
};
