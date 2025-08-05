import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import authReducer from "../slices/authSlice";
import documentReducer from "../slices/documentSlice";
import chatReducer from "../slices/chatSlice";
import uiReducer from "../slices/uiSlice";
import rootSaga from "../sagas/rootSaga";

// Create saga middleware
const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    documents: documentReducer,
    chat: chatReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(sagaMiddleware),
  devTools: process.env.NODE_ENV !== "production",
});

// Run the root saga
sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
