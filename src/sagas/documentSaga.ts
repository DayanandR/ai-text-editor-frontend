import { call, put, takeLatest, debounce } from 'redux-saga/effects';
import {
  fetchDocumentsRequest,
  fetchDocumentsSuccess,
  fetchDocumentsFailure,
  createDocumentRequest,
  createDocumentSuccess,
  createDocumentFailure,
  updateDocumentRequest,
  updateDocumentSuccess,
  updateDocumentFailure,
  deleteDocumentRequest,
  deleteDocumentSuccess,
  deleteDocumentFailure,
  autoSaveDocument,
} from '../slices/documentSlice';
import type { PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../services/api';

function* fetchDocumentsSaga() {
  try {
    const response: { documents: any[] } = yield call(apiService.getDocuments);
    yield put(fetchDocumentsSuccess(response.documents));
  } catch (error: any) {
    yield put(fetchDocumentsFailure(error.message));
  }
}

function* createDocumentSaga(action: PayloadAction<{ title: string; content?: string }>) {
  try {
    const response: { document: any } = yield call(apiService.createDocument, action.payload);
    yield put(createDocumentSuccess(response.document));
  } catch (error: any) {
    yield put(createDocumentFailure(error.message));
  }
}

function* updateDocumentSaga(action: PayloadAction<{ id: string; updates: any }>) {
  try {
    const { id, updates } = action.payload;
    const response: { document: any } = yield call(apiService.updateDocument, id, updates);
    yield put(updateDocumentSuccess(response.document));
  } catch (error: any) {
    yield put(updateDocumentFailure(error.message));
  }
}

function* deleteDocumentSaga(action: PayloadAction<string>) {
  try {
    yield call(apiService.deleteDocument, action.payload);
    yield put(deleteDocumentSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteDocumentFailure(error.message));
  }
}

function* autoSaveDocumentSaga(action: PayloadAction<{ id: string; content: string; characterCount: number; wordCount: number }>) {
  try {
    const { id, content, characterCount, wordCount } = action.payload;
    yield call(apiService.updateDocument, id, {
      content,
      characterCount,
      wordCount,
      saved: true,
    });
  } catch (error: any) {
    console.error('Auto-save failed:', error.message);
    // Don't show error to user for auto-save failures
  }
}

export default function* documentSaga() {
  yield takeLatest(fetchDocumentsRequest.type, fetchDocumentsSaga);
  yield takeLatest(createDocumentRequest.type, createDocumentSaga);
  yield takeLatest(updateDocumentRequest.type, updateDocumentSaga);
  yield takeLatest(deleteDocumentRequest.type, deleteDocumentSaga);
  yield debounce(2000, autoSaveDocument.type, autoSaveDocumentSaga); // Auto-save with 2-second delay
}
