import React, { useState } from "react";
import ThumbnailPanel from "./ThumbnailPanel";

interface PreviewPaneProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: Array<{ text: string; page: number }>;
  bookmarks: Array<{
    id: string;
    title: string;
    page: number;
    documentId: string;
  }>;
  onRemoveBookmark: (id: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  characterCount: number;
  wordCount: number;
  // New props for dynamic functionality
  pages?: Array<{
    id: number;
    content: string;
    pageNumber: number;
  }>;
  onPageSelect?: (pageNumber: number) => void;
  documentSearchResults?: Array<{
    id: string;
    text: string;
    pageNumber: number;
    context: string;
  }>;
  onDocumentSearch?: (query: string) => void;
  tableOfContents?: Array<{
    id: string;
    title: string;
    level: number;
    pageNumber: number;
  }>;
}

const PreviewPane: React.FC<PreviewPaneProps> = ({
  onSearchChange,
  searchResults,
  bookmarks,
  onRemoveBookmark,
  currentPage,
  totalPages,
  onPageChange,
  characterCount,
  wordCount,
  pages = [],
  onPageSelect,
  documentSearchResults = [],
  onDocumentSearch,
  tableOfContents = [],
}) => {
  const [activeTab, setActiveTab] = useState<"thumbnail" | "index" | "search">(
    "thumbnail"
  );

  // Handle search with fallback
  const handleSearch = (query: string) => {
    onSearchChange(query);
    if (onDocumentSearch) {
      onDocumentSearch(query);
    }
  };

  // Enhanced table of contents that includes bookmarks
  const enhancedTableOfContents = React.useMemo(() => {
    const toc = [...tableOfContents];

    // Add bookmarks as TOC entries if they're not already included
    bookmarks.forEach((bookmark) => {
      const existingEntry = toc.find(
        (entry) =>
          entry.pageNumber === bookmark.page &&
          entry.title.toLowerCase().includes(bookmark.title.toLowerCase())
      );

      if (!existingEntry) {
        toc.push({
          id: `bookmark-${bookmark.id}`,
          title: `📖 ${bookmark.title}`,
          level: 0, // Special level for bookmarks
          pageNumber: bookmark.page,
        });
      }
    });

    // Sort by page number, then by level
    return toc.sort((a, b) => {
      if (a.pageNumber !== b.pageNumber) {
        return a.pageNumber - b.pageNumber;
      }
      return a.level - b.level;
    });
  }, [tableOfContents, bookmarks]);

  // Handle page navigation - use the new onPageSelect if available, fallback to onPageChange
  const handlePageNavigation = (pageNumber: number) => {
    if (onPageSelect) {
      onPageSelect(pageNumber);
    } else {
      onPageChange(pageNumber);
    }
  };

  return (
    <div
      className="bg-gray-50 border-l border-gray-200 flex flex-col"
      style={{
        width: "280px",
        minWidth: "280px",
        maxWidth: "280px",
        height: "100%",
        flexShrink: 0,
      }}
    >
      {/* Enhanced Thumbnail Panel */}
      <div className="flex-1 flex flex-col">
        <ThumbnailPanel
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pages={pages}
          currentPage={currentPage}
          onPageSelect={handlePageNavigation}
          searchResults={documentSearchResults}
          onSearch={handleSearch}
          tableOfContents={enhancedTableOfContents}
        />
      </div>

      {/* Legacy Search Results (for backward compatibility) */}
      {activeTab === "search" &&
        searchResults.length > 0 &&
        documentSearchResults.length === 0 && (
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-700">
                Legacy Results ({searchResults.length})
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    onClick={() => handlePageNavigation(result.page)}
                    className="p-2 bg-gray-50 rounded border text-xs cursor-pointer hover:bg-blue-50 transition-colors"
                  >
                    <div className="text-gray-600 line-clamp-2 mb-1">
                      {result.text}
                    </div>
                    <div className="text-blue-600 font-medium">
                      Page {result.page}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      {/* Bookmarks Section (shown in index tab as well) */}
      {activeTab === "index" && bookmarks.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-white">
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700 flex items-center justify-between">
              <span>Quick Bookmarks</span>
              <span className="text-gray-400">({bookmarks.length})</span>
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="flex items-center justify-between bg-blue-50 rounded px-2 py-1"
                >
                  <button
                    onClick={() => handlePageNavigation(bookmark.page)}
                    className="flex-1 text-left text-xs cursor-pointer hover:text-blue-600 truncate"
                    title={bookmark.title}
                  >
                    📖 {bookmark.title}
                  </button>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">
                      p.{bookmark.page}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveBookmark(bookmark.id);
                      }}
                      className="text-red-500 hover:text-red-700 text-xs ml-1 w-4 h-4 flex items-center justify-center rounded hover:bg-red-100"
                      title="Remove bookmark"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Stats Footer */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="space-y-1 text-xs text-gray-500">
          {/* Page Info */}
          <div className="flex justify-between items-center">
            <span>Pages</span>
            <span className="font-medium">
              {currentPage} of {Math.max(totalPages, pages.length)}
            </span>
          </div>

          {/* Document Stats */}
          <div className="flex justify-between items-center">
            <span>Words</span>
            <span className="font-medium">{wordCount.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center">
            <span>Characters</span>
            <span className="font-medium">
              {characterCount.toLocaleString()}
            </span>
          </div>

          {/* Additional Stats */}
          {bookmarks.length > 0 && (
            <div className="flex justify-between items-center pt-1 border-t border-gray-100">
              <span>Bookmarks</span>
              <span className="font-medium">{bookmarks.length}</span>
            </div>
          )}

          {tableOfContents.length > 0 && (
            <div className="flex justify-between items-center">
              <span>Headings</span>
              <span className="font-medium">{tableOfContents.length}</span>
            </div>
          )}

          {/* Reading Stats */}
          <div className="flex justify-between items-center pt-1 border-t border-gray-100">
            <span>Est. Reading</span>
            <span className="font-medium">
              {Math.ceil(wordCount / 200)} min
            </span>
          </div>
        </div>

        {/* Current Tab Indicator */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-400 text-center">
            {activeTab === "thumbnail" && "📄 Page Thumbnails"}
            {activeTab === "index" && "📑 Table of Contents"}
            {activeTab === "search" && "🔍 Document Search"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPane;
