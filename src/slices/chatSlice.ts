import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: string; // API returns string, not Date
}

interface ChatState {
  messages: ChatMessage[];
  isProcessing: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  isProcessing: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // Send message
    sendMessageRequest: (state, _action: PayloadAction<string>) => {
      state.isProcessing = true;
      state.error = null;
    },
    sendMessageSuccess: (state, action: PayloadAction<ChatMessage>) => {
      state.isProcessing = false;
      state.messages.push(action.payload);
    },
    sendMessageFailure: (state, action: PayloadAction<string>) => {
      state.isProcessing = false;
      state.error = action.payload;
    },

    // Fetch chat history
    fetchChatHistoryRequest: (state) => {
      state.error = null;
    },
    fetchChatHistorySuccess: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },
    fetchChatHistoryFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  sendMessageRequest,
  sendMessageSuccess,
  sendMessageFailure,
  fetchChatHistoryRequest,
  fetchChatHistorySuccess,
  fetchChatHistoryFailure,
  clearError,
} = chatSlice.actions;

export default chatSlice.reducer;
