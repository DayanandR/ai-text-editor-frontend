import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  sidebarOpen: boolean;
  activeTab: "text" | "page";
  currentPage: number;
  totalPages: number;
  zoom: number;
  showRulers: boolean;
  searchQuery: string;
  searchResults: Array<{ text: string; page: number }>;
}

const initialState: UIState = {
  sidebarOpen: true,
  activeTab: "text",
  currentPage: 1,
  totalPages: 152,
  zoom: 100,
  showRulers: true,
  searchQuery: "",
  searchResults: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<"text" | "page">) => {
      state.activeTab = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload;
    },
    toggleRulers: (state) => {
      state.showRulers = !state.showRulers;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.searchResults = action.payload
        ? [
            { text: "Sample search result", page: 1 },
            { text: "Another result", page: 2 },
          ]
        : [];
    },
    setSearchResults: (
      state,
      action: PayloadAction<Array<{ text: string; page: number }>>
    ) => {
      state.searchResults = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setActiveTab,
  setCurrentPage,
  setZoom,
  toggleRulers,
  setSearchQuery,
  setSearchResults,
} = uiSlice.actions;

export default uiSlice.reducer;
