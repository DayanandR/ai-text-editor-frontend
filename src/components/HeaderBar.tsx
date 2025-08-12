import React, { useEffect, useState } from "react";
import {
  DocumentTextIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";

interface HeaderBarProps {
  title: string;
  saved: boolean;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onDelete: () => void;
  bookmarks: Array<{
    id: string;
    title: string;
    page: number;
    documentId: string;
  }>;
  onAddBookmark: (title: string, page: number) => void;
  currentPage: number;
  totalPages: number;
  onShowExportModal: () => void;
}

const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  saved,
  onTitleChange,
  onSave,
  onAddBookmark,
  currentPage,
  onShowExportModal,
}) => {
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [saveButtonFlash, setSaveButtonFlash] = useState(false);

  // Ctrl+S save functionality
  useEffect(() => {
    const handleSaveShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();

        // Call save function
        onSave();

        // Show visual feedback
        setSaveButtonFlash(true);
        setShowSaveToast(true);

        // Reset visual feedback
        setTimeout(() => {
          setSaveButtonFlash(false);
        }, 200);

        setTimeout(() => {
          setShowSaveToast(false);
        }, 2000);
      }
    };

    document.addEventListener("keydown", handleSaveShortcut);
    return () => document.removeEventListener("keydown", handleSaveShortcut);
  }, [onSave]);

  const handleSaveClick = () => {
    onSave();
    setSaveButtonFlash(true);
    setTimeout(() => setSaveButtonFlash(false), 200);
  };

  // Inline styles for animations
  const slideInKeyframes = `
    @keyframes slideIn {
      from { 
        transform: translateX(100%); 
        opacity: 0; 
      }
      to { 
        transform: translateX(0); 
        opacity: 1; 
      }
    }
  `;

  const pulseKeyframes = `
    @keyframes pulse {
      0%, 100% { 
        opacity: 1; 
      }
      50% { 
        opacity: 0.5; 
      }
    }
  `;

  const toastStyle: React.CSSProperties = {
    position: "fixed",
    top: "1rem",
    right: "1rem",
    backgroundColor: "#10b981",
    color: "white",
    padding: "0.75rem 1rem",
    borderRadius: "0.5rem",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    animation: "slideIn 0.3s ease-out",
  };

  const saveButtonStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    color: "white",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    border: "none",
    cursor: saved ? "default" : "pointer",
    transition: "all 0.2s",
    backgroundColor: saveButtonFlash
      ? "#10b981"
      : saved
      ? "#9ca3af"
      : "#3b82f6",
    transform: saveButtonFlash ? "scale(1.05)" : "scale(1)",
    opacity: saved ? 0.7 : 1,
  };

  const pulsingDotStyle: React.CSSProperties = {
    width: "0.5rem",
    height: "0.5rem",
    backgroundColor: "#f59e0b",
    borderRadius: "50%",
    marginRight: "0.5rem",
    animation: "pulse 2s infinite",
  };

  return (
    <>
      {/* Add keyframes to document head */}
      <style>
        {slideInKeyframes}
        {pulseKeyframes}
      </style>

      {/* Save Toast Notification */}
      {showSaveToast && (
        <div style={toastStyle}>
          <svg
            style={{ width: "1rem", height: "1rem", marginRight: "0.5rem" }}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Document saved! (Ctrl+S)
        </div>
      )}

      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <DocumentTextIcon className="w-5 h-5 text-gray-600" />
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="font-medium text-gray-900 bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-2 py-1 rounded min-w-[200px]"
            placeholder="Document title..."
            style={{ minWidth: "200px" }}
          />
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              ℹ️
            </span>
            {saved ? (
              <span
                className="text-xs text-green-600 font-medium flex items-center"
                style={{ display: "flex", alignItems: "center" }}
              >
                <svg
                  style={{
                    width: "0.75rem",
                    height: "0.75rem",
                    marginRight: "0.25rem",
                  }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Saved
              </span>
            ) : (
              <span
                className="text-xs text-orange-600 font-medium flex items-center"
                style={{ display: "flex", alignItems: "center" }}
              >
                <span style={pulsingDotStyle}></span>
                Unsaved changes
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() =>
              onAddBookmark(`Bookmark at page ${currentPage}`, currentPage)
            }
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
            title="Add bookmark (B)"
            style={{
              padding: "0.5rem",
              borderRadius: "0.5rem",
              transition: "background-color 0.2s",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <BookmarkIcon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
          </button>

          <button
            onClick={handleSaveClick}
            data-save-button
            style={saveButtonStyle}
            title="Save document (Ctrl+S)"
            disabled={saved}
            onMouseEnter={(e) => {
              if (!saved && !saveButtonFlash) {
                e.currentTarget.style.backgroundColor = "#2563eb";
              }
            }}
            onMouseLeave={(e) => {
              if (!saved && !saveButtonFlash) {
                e.currentTarget.style.backgroundColor = "#3b82f6";
              }
            }}
          >
            {saved ? (
              <span style={{ display: "flex", alignItems: "center" }}>
                <svg
                  style={{
                    width: "1rem",
                    height: "1rem",
                    marginRight: "0.25rem",
                  }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Saved
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center" }}>
                <svg
                  style={{
                    width: "1rem",
                    height: "1rem",
                    marginRight: "0.25rem",
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Save
              </span>
            )}
          </button>
          <button
            onClick={onShowExportModal}
            className="flex items-center space-x-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            title="Save & Export Options (Ctrl+E)"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            <span className="text-sm">Export</span>
          </button>

          <div className="relative">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              style={{
                padding: "0.5rem",
                borderRadius: "0.5rem",
                transition: "background-color 0.2s",
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <EllipsisHorizontalIcon className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeaderBar;
