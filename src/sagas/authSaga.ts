import { call, put, takeLatest } from "redux-saga/effects";
import {
  loginRequest,
  loginSuccess,
  loginFailure,
  registerRequest,
  registerSuccess,
  registerFailure,
  logoutRequest,
  logoutSuccess,
  getCurrentUserRequest,
  getCurrentUserSuccess,
  getCurrentUserFailure,
} from "../slices/authSlice";
import type { PayloadAction } from "@reduxjs/toolkit";
import { apiService } from "../services/api";

function* loginSaga(
  action: PayloadAction<{ email: string; password: string }>
) {
  try {
    console.log("🔄 Login saga triggered with:", action.payload);

    const response: { user: any } = yield call(
      apiService.login,
      action.payload
    );

    console.log("✅ Login saga success:", response);
    yield put(loginSuccess(response.user));
  } catch (error: any) {
    console.error("❌ Login saga error:", error);
    yield put(loginFailure(error.message));
  }
}

function* registerSaga(
  action: PayloadAction<{ name: string; email: string; password: string }>
) {
  try {
    console.log("🔄 Register saga triggered with:", action.payload);

    // This will now work without any 'this' issues
    const response: { user: any } = yield call(
      apiService.register,
      action.payload
    );

    console.log("✅ Register saga success:", response);
    yield put(registerSuccess(response.user));
  } catch (error: any) {
    console.error("❌ Register saga error:", error);
    yield put(registerFailure(error.message));
  }
}

function* logoutSaga() {
  try {
    yield call(apiService.logout);
    yield put(logoutSuccess());
  } catch (error: any) {
    // Even if logout fails on server, clear local state
    yield put(logoutSuccess());
  }
}

function* getCurrentUserSaga() {
  try {
    const response: { user: any } = yield call(apiService.getCurrentUser);
    yield put(getCurrentUserSuccess(response.user));
  } catch (error: any) {
    yield put(getCurrentUserFailure(error.message));
  }
}

export default function* authSaga() {
  yield takeLatest(loginRequest.type, loginSaga);
  yield takeLatest(registerRequest.type, registerSaga);
  yield takeLatest(logoutRequest.type, logoutSaga);
  yield takeLatest(getCurrentUserRequest.type, getCurrentUserSaga);
}
