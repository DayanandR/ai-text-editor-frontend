import React from "react";
import { Provider } from "react-redux";
import { store } from "./store/store";
import MainApp from "./components/MainApp";
import { useAppDispatch } from "./store/hooks";
import { useGetCurrentUserQuery } from "./store/api/authApi";
import { getCurrentUserRequest } from "./slices/authSlice";
import LoginPage from "./components/LoginPage";


const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: userData, isLoading, error } = useGetCurrentUserQuery();

  // Fetch current user on app start
  React.useEffect(() => {
    dispatch(getCurrentUserRequest());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !userData?.user) {
    return <LoginPage />;
  }

  return <MainApp user={userData.user} />;
};

const AppWrapper: React.FC = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

export default AppWrapper;
