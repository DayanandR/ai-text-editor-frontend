/* MainApp.tsx – Fixed version with all TypeScript errors resolved */

import React, { useCallback, useEffect, useState } from "react";
import { Editor as TiptapEditor } from "@tiptap/react";
import { useAppDispatch, useAppSelector } from "../store/hooks";

import Editor from "./Editor";
import HeaderBar from "./HeaderBar";
import PreviewPane from "./PreviewPane";
import Sidebar from "./Sidebar";
import Toolbar from "./Toolbar";

import {
  autoSaveDocument,
  createDocumentRequest,
  deleteDocumentRequest,
  fetchDocumentsRequest,
  setActiveDocument,
  updateDocumentRequest,
  saveDocumentSuccess,
} from "../slices/documentSlice";
import { setActiveTab, setSearchQuery, toggleSidebar } from "../slices/uiSlice";
import { sendMessageRequest } from "../slices/chatSlice";

interface MainAppProps {
  user: { id: string; name: string; email: string };
}

const MainApp: React.FC<MainAppProps> = ({ user }) => {
  const dispatch = useAppDispatch();

  /* ─── Redux state ───────────────────────────────────────────── */
  const { documents, activeDocumentId, loading, error } = useAppSelector(
    (s) => s.documents
  );
  const { sidebarOpen, activeTab, searchQuery, searchResults } = useAppSelector(
    (s) => s.ui
  );
  const { messages, isProcessing } = useAppSelector((s) => s.chat);

  /* ─── Local state ───────────────────────────────────────────── */
  const [editor, setEditor] = useState<TiptapEditor | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [bookmarks, setBookmarks] = useState<
    { id: string; title: string; page: number; documentId: string }[]
  >([]);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState<string | null>(null);

  /* Page / TOC state */
  const [pages, setPages] = useState<
    { id: number; content: string; pageNumber: number }[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [tableOfContents, setTableOfContents] = useState<
    { id: string; title: string; level: number; pageNumber: number }[]
  >([]);
  const [docSearch, setDocSearch] = useState<
    { id: string; text: string; pageNumber: number; context: string }[]
  >([]);

  /* Header / footer HTML templates */
  const [headerContent, setHeaderContent] = useState(
    '<p style="text-align:center;"><strong>CONFIDENTIAL LEGAL DOCUMENT</strong></p>'
  );
  const [footerContent, setFooterContent] = useState(
    '<p style="text-align:center;"><em>Page {{pageNumber}} of {{totalPages}}</em></p>'
  );

  const activeDocument = documents.find((d) => d.id === activeDocumentId);

  /* ─── Error handling ────────────────────────────────────────── */
  useEffect(() => {
    if (error) {
      setShowErrorToast(error);
      setTimeout(() => setShowErrorToast(null), 3000);
    }
  }, [error]);

  /* ─── Manual save function ──────────────────────────────────── */
  const handleSave = useCallback(() => {
    if (!activeDocumentId || !activeDocument || activeDocument.saved) return;

    // Mark as saved in Redux
    dispatch(saveDocumentSuccess(activeDocumentId));

    // Show save notification
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);

    // Trigger API save with current document data
    dispatch(
      updateDocumentRequest({
        id: activeDocumentId,
        updates: {
          saved: true,
          content: activeDocument.content,
          title: activeDocument.title,
        },
      })
    );

    console.log("Document saved:", activeDocumentId);
  }, [dispatch, activeDocumentId, activeDocument]);

  /* ─── Ctrl+S Global Handler ─────────────────────────────────── */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        handleSave();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  /* ─── Create document handler ───────────────────────────────── */
  const handleCreateDocument = useCallback(
    (title: string, content: string) => {
      // Dispatch with proper payload
      dispatch(
        createDocumentRequest({
          title,
          content,
        })
      );
    },
    [dispatch]
  );

  /* ─── Update document handlers ──────────────────────────────── */
  const handleTitleChange = useCallback(
    (title: string) => {
      if (!activeDocumentId) return;

      dispatch(
        updateDocumentRequest({
          id: activeDocumentId,
          updates: { title, saved: false },
        })
      );
    },
    [dispatch, activeDocumentId]
  );

  /* ─── Delete document handler ───────────────────────────────── */
  const handleDeleteDocument = useCallback(() => {
    if (!activeDocumentId) return;

    dispatch(deleteDocumentRequest(activeDocumentId));
  }, [dispatch, activeDocumentId]);

  /* ─── Fetch documents once ──────────────────────────────────── */
  useEffect(() => {
    dispatch(fetchDocumentsRequest());
  }, [dispatch]);

  /* ─── Editor-related effect: runs ONCE per editor instance ──── */
  useEffect(() => {
    if (!editor) return;

    /* Helpers local to this effect → never invalidate the effect */
    const buildPages = (): typeof pages => {
      const html = editor.getHTML();
      const parts = html
        .split(/<hr[^>]*data-page-break[^>]*>/)
        .map((p) => p.trim())
        .filter(Boolean);

      if (!parts.length)
        return [{ id: 1, content: html || "<p></p>", pageNumber: 1 }];

      return parts.map((c, i) => ({
        id: i + 1,
        content: c,
        pageNumber: i + 1,
      }));
    };

    const buildTOC = (pgs: typeof pages): typeof tableOfContents => {
      const toc: typeof tableOfContents = [];
      pgs.forEach((p) => {
        const div = document.createElement("div");
        div.innerHTML = p.content;
        div.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach((h, idx) => {
          const level = Number(h.tagName[1]);
          const title = h.textContent?.trim() || `Heading ${idx + 1}`;
          toc.push({
            id: `${p.id}-${idx}`,
            title,
            level,
            pageNumber: p.pageNumber,
          });
        });
      });
      return toc;
    };

    const cursorPage = (): number => {
      const { state } = editor;
      const pos = state.selection.$anchor.pos;
      let breaks = 0;
      state.doc.descendants((n, p) => {
        if (p >= pos) return false;
        if (n.type.name === "pageBreak") breaks += 1;
        return true;
      });
      return breaks + 1; // 1-based
    };

    /* Refresh content */
    const refresh = () => {
      const newPages = buildPages();
      setPages(newPages);
      setTableOfContents(buildTOC(newPages));
    };

    /* Initial run */
    refresh();
    setCurrentPage(cursorPage());

    /* Listeners (debounced) */
    let timer: NodeJS.Timeout | null = null;
    const onUpdate = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(refresh, 120);
    };
    const onSelUpdate = () => setCurrentPage(cursorPage());

    editor.on("update", onUpdate);
    editor.on("selectionUpdate", onSelUpdate);

    return () => {
      editor.off("update", onUpdate);
      editor.off("selectionUpdate", onSelUpdate);
      if (timer) clearTimeout(timer);
    };
  }, [editor]);

  /* ─── Navigation helper ─────────────────────────────────────── */
  const goToPage = useCallback(
    (pageNum: number) => {
      if (!editor) return;

      if (pageNum === 1) {
        editor.commands.focus("start");
        setCurrentPage(1);
        return;
      }

      const { state } = editor;
      let breaks = 0;
      let pos = 0;
      state.doc.descendants((n, p) => {
        if (n.type.name === "pageBreak") {
          breaks += 1;
          if (breaks === pageNum - 1) {
            pos = p + n.nodeSize;
            return false;
          }
        }
        return true;
      });
      if (pos) {
        editor.commands.setTextSelection(pos);
        editor.commands.focus();
        setCurrentPage(pageNum);
      }
    },
    [editor]
  );

  /* ─── Client-side document search ───────────────────────────── */
  const handleDocSearch = useCallback(
    (q: string) => {
      if (!q.trim()) return setDocSearch([]);

      const res: typeof docSearch = [];
      pages.forEach((p) => {
        const div = document.createElement("div");
        div.innerHTML = p.content;
        const text = div.textContent || "";
        const idx = text.toLowerCase().indexOf(q.toLowerCase());
        if (idx !== -1) {
          const ctx = text.slice(Math.max(0, idx - 40), idx + q.length + 40);
          res.push({
            id: `${p.id}-${idx}`,
            text: q,
            pageNumber: p.pageNumber,
            context: ctx.replace(new RegExp(q, "gi"), "<mark>$&</mark>"),
          });
        }
      });
      setDocSearch(res);
    },
    [pages]
  );

  /* ─── Auto-save on editor change ────────────────────────────── */
  const saveDraft = useCallback(
    (html: string) => {
      if (!activeDocumentId) return;
      const txt = html.replace(/<[^>]+>/g, "");
      dispatch(
        autoSaveDocument({
          id: activeDocumentId,
          content: html,
          characterCount: txt.length,
          wordCount: txt.trim() ? txt.trim().split(/\s+/).length : 0,
        })
      );
    },
    [dispatch, activeDocumentId]
  );

  /* ─── Bookmark helpers ──────────────────────────────────────── */
  const addBookmark = useCallback(
    (title: string, page: number) =>
      setBookmarks((b) => [
        ...b,
        {
          id: Date.now().toString(),
          title,
          page,
          documentId: activeDocumentId!,
        },
      ]),
    [activeDocumentId]
  );

  const removeBookmark = useCallback(
    (id: string) => setBookmarks((b) => b.filter((bk) => bk.id !== id)),
    []
  );

  /* ─── Quick early returns (loading / empty) ─────────────────── */
  if (loading && !documents.length) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents…</p>
        </div>
      </div>
    );
  }

  if (!activeDocument && !loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            No documents found
          </h2>
          <p className="text-gray-600 mb-6">
            Get started by creating your first document
          </p>
          <button
            onClick={() =>
              handleCreateDocument(
                `Untitled Document ${documents.length + 1}`,
                "<p>Start writing...</p>"
              )
            }
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create your first document"}
          </button>
        </div>
      </div>
    );
  }

  // ✅ At this point, activeDocument is guaranteed to exist
  if (!activeDocument) {
    return null; // This should never happen but keeps TypeScript happy
  }

  // Create a non-nullable alias for cleaner code
  const currentDoc = activeDocument;

  /* ─── Render ────────────────────────────────────────────────── */
  return (
    <>
      {/* Global Save Toast Notification */}
      {showSaveToast && (
        <div
          className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center"
          style={{
            animation: "slideIn 0.3s ease-out",
          }}
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Document saved! (Ctrl+S)
        </div>
      )}

      {/* Error Toast Notification */}
      {showErrorToast && (
        <div
          className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center"
          style={{
            animation: "slideIn 0.3s ease-out",
          }}
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {showErrorToast}
        </div>
      )}

      {/* Add keyframes for toast animation */}
      <style>
        {`
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
        `}
      </style>

      <div className="flex h-screen w-full overflow-hidden bg-gray-50">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => dispatch(toggleSidebar())}
          documents={documents}
          activeDocumentId={activeDocumentId}
          onDocumentSelect={(id) => {
            dispatch(setActiveDocument(id));
            setPages([]);
            setTableOfContents([]);
            setDocSearch([]);
            setCurrentPage(1);
          }}
          onCreateDocument={() =>
            handleCreateDocument(
              `Untitled Document ${documents.length + 1}`,
              "<p>Start writing...</p>"
            )
          }
          chatHistory={messages}
          chatInput={chatInput}
          onChatInputChange={setChatInput}
          isProcessingChat={isProcessing}
          onSendMessage={(msg) => {
            dispatch(sendMessageRequest(msg));
            setChatInput("");
          }}
          user={user}
          onDeleteDocument={handleDeleteDocument}
        />

        {/* Main column */}
        <div className="flex flex-col flex-1">
          <HeaderBar
            title={currentDoc.title}
            saved={currentDoc.saved}
            onTitleChange={handleTitleChange}
            onSave={handleSave}
            onDelete={handleDeleteDocument}
            bookmarks={bookmarks}
            onAddBookmark={addBookmark}
            currentPage={currentPage}
            totalPages={pages.length}
          />

          <Toolbar
            editor={editor}
            activeTab={activeTab}
            onTabChange={(t) => dispatch(setActiveTab(t))}
          />

          <div className="flex flex-1 overflow-hidden">
            {/* Editor */}
            <div className="flex-1 flex flex-col">
              <Editor
                onEditorCreate={setEditor}
                content={currentDoc.content}
                documentContent={currentDoc.content}
                onChange={saveDraft}
                activeTab={activeTab}
                headerContent={headerContent}
                footerContent={footerContent}
                onHeaderChange={setHeaderContent}
                onFooterChange={setFooterContent}
              />
            </div>

            {/* Preview / thumbnails */}
            <PreviewPane
              searchQuery={searchQuery}
              onSearchChange={(q) => dispatch(setSearchQuery(q))}
              searchResults={searchResults}
              bookmarks={bookmarks.filter(
                (b) => b.documentId === activeDocumentId
              )}
              onRemoveBookmark={removeBookmark}
              currentPage={currentPage}
              totalPages={pages.length}
              onPageChange={goToPage}
              characterCount={currentDoc.characterCount}
              wordCount={currentDoc.wordCount}
              pages={pages}
              onPageSelect={goToPage}
              documentSearchResults={docSearch}
              onDocumentSearch={handleDocSearch}
              tableOfContents={tableOfContents}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default MainApp;
