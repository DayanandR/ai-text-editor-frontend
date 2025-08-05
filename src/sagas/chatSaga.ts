import { call, put, takeLatest, delay } from 'redux-saga/effects';
import {
  sendMessageRequest,
  sendMessageSuccess,
  sendMessageFailure,
  fetchChatHistoryRequest,
  fetchChatHistorySuccess,
  fetchChatHistoryFailure,
} from '../slices/chatSlice';
import { apiService } from '../services/api';
import type { PayloadAction } from '@reduxjs/toolkit';

function* sendMessageSaga(action: PayloadAction<string>) {
  try {
    // Simulate AI processing delay
    yield delay(1500);
    
    const response: { chat: any } = yield call(apiService.sendChatMessage, action.payload);
    yield put(sendMessageSuccess(response.chat));
  } catch (error: any) {
    yield put(sendMessageFailure(error.message));
  }
}

function* fetchChatHistorySaga() {
  try {
    const response: { chats: any[] } = yield call(apiService.getChatHistory);
    yield put(fetchChatHistorySuccess(response.chats));
  } catch (error: any) {
    yield put(fetchChatHistoryFailure(error.message));
  }
}

export default function* chatSaga() {
  yield takeLatest(sendMessageRequest.type, sendMessageSaga);
  yield takeLatest(fetchChatHistoryRequest.type, fetchChatHistorySaga);
}
