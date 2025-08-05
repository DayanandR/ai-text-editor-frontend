import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Document {
  id: string;
  title: string;
  content: string;
  characterCount: number;
  wordCount: number;
  saved: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface DocumentState {
  documents: Document[];
  activeDocumentId: string;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: DocumentState = {
  documents: [],
  activeDocumentId: "",
  loading: false,
  saving: false,
  error: null,
};

const documentSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    // Fetch documents
    fetchDocumentsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDocumentsSuccess: (state, action: PayloadAction<Document[]>) => {
      state.loading = false;
      state.documents = action.payload;
      if (action.payload.length > 0 && !state.activeDocumentId) {
        state.activeDocumentId = action.payload[0].id;
      }
    },
    fetchDocumentsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create document - Fixed to accept parameters
    createDocumentRequest: (
      state,
      _action: PayloadAction<{ title: string; content?: string }>
    ) => {
      state.loading = true;
      state.error = null;
    },
    createDocumentSuccess: (state, action: PayloadAction<Document>) => {
      state.loading = false;
      state.documents.unshift(action.payload);
      state.activeDocumentId = action.payload.id;
    },
    createDocumentFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update document - Fixed to accept parameters
    updateDocumentRequest: (
      state,
      _action: PayloadAction<{ id: string; updates: Partial<Document> }>
    ) => {
      state.saving = true;
      state.error = null;
    },

    updateDocumentSuccess: (state, action: PayloadAction<Document>) => {
      state.saving = false;
      const index = state.documents.findIndex(
        (doc) => doc.id === action.payload.id
      );
      if (index !== -1) {
        state.documents[index] = action.payload;
      }
    },
    updateDocumentFailure: (state, action: PayloadAction<string>) => {
      state.saving = false;
      state.error = action.payload;
    },

    // Delete document - Fixed to accept parameters
    deleteDocumentRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteDocumentSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.documents = state.documents.filter(
        (doc) => doc.id !== action.payload
      );
      if (state.activeDocumentId === action.payload) {
        state.activeDocumentId =
          state.documents.length > 0 ? state.documents[0].id : "";
      }
    },
    deleteDocumentFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Set active document
    setActiveDocument: (state, action: PayloadAction<string>) => {
      state.activeDocumentId = action.payload;
    },

    // Auto-save document (optimistic update)
    autoSaveDocument: (
      state,
      action: PayloadAction<{
        id: string;
        content: string;
        characterCount: number;
        wordCount: number;
      }>
    ) => {
      const { id, content, characterCount, wordCount } = action.payload;
      const document = state.documents.find((doc) => doc.id === id);
      if (document) {
        document.content = content;
        document.characterCount = characterCount;
        document.wordCount = wordCount;
        document.saved = false;
        document.updatedAt = new Date().toISOString();
      }
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Manual save document (mark as saved)
    saveDocumentSuccess: (state, action: PayloadAction<string>) => {
      const document = state.documents.find((doc) => doc.id === action.payload);
      if (document) {
        document.saved = true;
        document.updatedAt = new Date().toISOString();
      }
    },

    // Logout/Clear state
    logoutRequest: (state) => {
      state.documents = [];
      state.activeDocumentId = "";
      state.loading = false;
      state.saving = false;
      state.error = null;
    },
  },
});

export const {
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
  setActiveDocument,
  autoSaveDocument,
  clearError,
  saveDocumentSuccess,
  logoutRequest,
} = documentSlice.actions;

export default documentSlice.reducer;
