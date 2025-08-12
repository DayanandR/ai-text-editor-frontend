import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  useEditor,
  EditorContent,
  Editor as TiptapEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextAlign } from "@tiptap/extension-text-align";
import { FontFamily } from "@tiptap/extension-font-family";
import { FontSize, TextStyle } from "@tiptap/extension-text-style";
import {
  PrinterIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  DocumentArrowDownIcon,
  FolderOpenIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { geminiService } from "../services/gemini";
import { PageBreak } from "./extensions/PageBreak";
import { HeaderFooterModal } from "./HeaderFooterModal";

interface EditorProps {
  onEditorCreate: (editor: TiptapEditor | null) => void;
  content: string;
  onChange: (content: string) => void;
  activeTab: "text" | "page";
  documentContent: string;
  headerContent?: string;
  footerContent?: string;
  onHeaderChange?: (content: string) => void;
  onFooterChange?: (content: string) => void;
}

const Editor: React.FC<EditorProps> = ({
  onEditorCreate,
  content,
  onChange,
  documentContent,
  activeTab,
  headerContent = "",
  footerContent = "",
  onHeaderChange,
  onFooterChange,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      PageBreak,
      TextStyle,
      FontFamily,
      FontSize,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          activeTab === "page"
            ? "prose prose-lg max-w-none focus:outline-none p-0"
            : "prose prose-lg max-w-none focus:outline-none min-h-full p-8",
      },
    },
  });

  // Pass the editor instance to parent when it's created
  useEffect(() => {
    onEditorCreate(editor);
  }, [editor, onEditorCreate]);

  // Update content when prop changes (for document switching)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  if (!editor) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  // Render different layouts based on active tab
  if (activeTab === "page") {
    return (
      <PageViewWithRulers
        editor={editor}
        documentContent={documentContent}
        headerContent={headerContent}
        footerContent={footerContent}
        onHeaderChange={onHeaderChange}
        onFooterChange={onFooterChange}
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <EditorContent editor={editor} className="h-full" />
    </div>
  );
};

// A4 Page View Component with Auto-Pagination and Modal Header/Footer Editor
const PageViewWithRulers: React.FC<{
  editor: TiptapEditor;
  documentContent: string;
  headerContent: string;
  footerContent: string;
  onHeaderChange?: (content: string) => void;
  onFooterChange?: (content: string) => void;
}> = ({
  editor,
  documentContent,
  headerContent,
  footerContent,
  onHeaderChange,
  onFooterChange,
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showCursor, setShowCursor] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [showRulers, setShowRulers] = useState(true);
  const [showHeaderFooter, setShowHeaderFooter] = useState(true);
  const [showHeaderFooterModal, setShowHeaderFooterModal] = useState(false);
  const [pageContents, setPageContents] = useState<string[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [pageMargins] = useState({
    top: 25.4, // 1 inch in mm
    bottom: 25.4,
    left: 25.4,
    right: 25.4,
  });

  const pageContainerRef = useRef<HTMLDivElement>(null);

  // Zoom levels
  const zoomLevels = useMemo(
    () => [25, 50, 75, 100, 125, 150, 200, 300, 400],
    []
  );

  // Convert mm to pixels based on zoom and DPI
  const mmToPx = useCallback(
    (mm: number) => {
      return (mm * 3.7795275591 * zoom) / 100;
    },
    [zoom]
  );

  // Save As functionality
  const saveAsDocument = useCallback(() => {
    const documentName = prompt("Enter document name to save as:")?.trim();
    if (!documentName) return;

    if (!editor) {
      console.error("Editor not available");
      return;
    }

    try {
      const documentData = {
        content: editor.getHTML(),
        json: editor.getJSON(),
        headerContent,
        footerContent,
        savedAt: new Date().toISOString(),
      };

      const jsonString = JSON.stringify(documentData);
      localStorage.setItem(`document_${documentName}`, jsonString);
      setLastSaved(new Date());
      alert(`Document saved as "${documentName}"`);
    } catch (error) {
      console.error("Save failed:", error);
    }
  }, [editor, headerContent, footerContent]);

  // Load Document functionality
  const loadDocument = useCallback(() => {
    const documentName = prompt("Enter document name to load:")?.trim();
    if (!documentName) return;

    const savedDoc = localStorage.getItem(`document_${documentName}`);
    if (savedDoc && editor) {
      try {
        const docData = JSON.parse(savedDoc);
        editor.commands.setContent(docData.content || "");
        if (onHeaderChange) onHeaderChange(docData.headerContent || "");
        if (onFooterChange) onFooterChange(docData.footerContent || "");
        alert(`Document "${documentName}" loaded successfully.`);
      } catch (error) {
        alert("Failed to load document. File may be corrupted.");
      }
    } else {
      alert("Document not found.");
    }
  }, [editor, onHeaderChange, onFooterChange]);

  // Export functions
  const exportToHTML = useCallback(() => {
    if (!editor) return;

    try {
      const content = editor.getHTML();
      const processedFooter = footerContent
        .replace(/\{\{pageNumber\}\}/g, '<span class="page-number"></span>')
        .replace(/\{\{totalPages\}\}/g, '<span class="total-pages"></span>');

      const fullHTML = `<!DOCTYPE html>
<html>
<head>
    <title>Exported Document</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Georgia, serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; }
        .footer { text-align: center; border-top: 1px solid #ccc; padding-top: 10px; margin-top: 20px; }
    </style>
</head>
<body>
    ${headerContent ? `<div class="header">${headerContent}</div>` : ""}
    <div class="content">${content}</div>
    ${footerContent ? `<div class="footer">${processedFooter}</div>` : ""}
</body>
</html>`;

      const blob = new Blob([fullHTML], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `document_${new Date().getTime()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  }, [editor, headerContent, footerContent]);

  const exportToJSON = useCallback(() => {
    if (!editor) return;

    const exportData = {
      content: editor.getHTML(),
      json: editor.getJSON(),
      headerContent,
      footerContent,
      metadata: {
        exportedAt: new Date().toISOString(),
        zoom,
        margins: pageMargins,
      },
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [editor, headerContent, footerContent, zoom, pageMargins]);

  const exportToText = useCallback(() => {
    if (!editor) return;

    // Helper function to convert HTML to plain text
    const htmlToText = (html: string): string => {
      return html
        .replace(
          /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi,
          (_, _level, content) =>
            `\n${content.toUpperCase()}\n${"=".repeat(content.length)}\n`
        )
        .replace(/<p[^>]*>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<br[^>]*>/gi, "\n")
        .replace(/<li[^>]*>(.*?)<\/li>/gi, "• $1\n")
        .replace(/<ul[^>]*>|<\/ul>/gi, "")
        .replace(/<ol[^>]*>|<\/ol>/gi, "")
        .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
        .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
        .replace(/<[^>]*>/g, "")
        .replace(/\n\s*\n\s*\n/g, "\n\n")
        .trim();
    };

    let textContent = "";

    if (headerContent) {
      const cleanHeaderContent = htmlToText(headerContent);
      textContent += `HEADER:\n${cleanHeaderContent}\n\n`;
    }

    textContent += `CONTENT:\n${htmlToText(editor.getHTML())}\n\n`;

    if (footerContent) {
      const cleanFooterContent = htmlToText(
        footerContent
          .replace(/\{\{pageNumber\}\}/g, "[Page Number]")
          .replace(/\{\{totalPages\}\}/g, "[Total Pages]")
      );
      textContent += `FOOTER:\n${cleanFooterContent}`;
    }

    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [editor, headerContent, footerContent]);

  // Auto-save functionality
  useEffect(() => {
    if (!editor) return;

    const autoSaveTimer = setInterval(() => {
      const documentData = {
        content: editor.getHTML(),
        json: editor.getJSON(),
        headerContent,
        footerContent,
        savedAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem("document_autosave", JSON.stringify(documentData));
        setLastSaved(new Date());
      } catch (error) {
        console.warn("Auto-save failed:", error);
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveTimer);
  }, [editor, headerContent, footerContent]);

  useEffect(() => {
    if (!editor) return;

    const splitContent = () => {
      const fullHTML = editor.getHTML();
      const parts = fullHTML
        .split(/<hr[^>]*data-page-break[^>]*>/)
        .map((p) => p.trim());
      return parts.filter(Boolean).length > 0 ? parts.filter(Boolean) : [""];
    };

    const getCursorPage = () => {
      const { state } = editor;
      const pos = state.selection.$anchor.pos;
      let breaks = 0;

      state.doc.descendants((node, nodePos) => {
        if (nodePos >= pos) return false;
        if (node.type.name === "pageBreak") breaks++;
        return true;
      });

      return breaks;
    };

    const updateContent = () => {
      const newPages = splitContent();
      setPageContents(newPages);
    };

    // Initial update
    updateContent();
    setCurrentPageIndex(getCursorPage());

    // Debounced listeners
    let updateTimer: NodeJS.Timeout | null = null;
    const onUpdate = () => {
      if (updateTimer) clearTimeout(updateTimer);
      updateTimer = setTimeout(updateContent, 150);
    };

    const onSelectionUpdate = () => {
      setCurrentPageIndex(getCursorPage());
    };

    editor.on("update", onUpdate);
    editor.on("selectionUpdate", onSelectionUpdate);

    return () => {
      editor.off("update", onUpdate);
      editor.off("selectionUpdate", onSelectionUpdate);
      if (updateTimer) clearTimeout(updateTimer);
    };
  }, [editor]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!pageContainerRef.current) return;

    const rect = pageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePosition({ x, y });
    setShowCursor(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowCursor(false);
  }, []);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    const currentIndex = zoomLevels.indexOf(zoom);
    if (currentIndex < zoomLevels.length - 1) {
      setZoom(zoomLevels[currentIndex + 1]);
    }
  }, [zoom, zoomLevels]);

  const handleZoomOut = useCallback(() => {
    const currentIndex = zoomLevels.indexOf(zoom);
    if (currentIndex > 0) {
      setZoom(zoomLevels[currentIndex - 1]);
    }
  }, [zoom, zoomLevels]);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const handleTextSelection = async () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selectedText && selectedText.length > 2 && selectedText.length < 50) {
      try {
        const explanation = await geminiService.explainTerm(
          selectedText,
          documentContent
        );
        console.log("Term explanation:", explanation);
      } catch (error) {
        console.error("Term explanation error:", error);
      }
    }
  };

  const handlePrint = useCallback(() => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const content = editor.getHTML();
    const processedFooter = footerContent
      .replace(/\{\{pageNumber\}\}/g, '<span class="page-number"></span>')
      .replace(/\{\{totalPages\}\}/g, '<span class="total-pages"></span>');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Document</title>
          <style>
            @page {
              size: A4;
              margin: ${pageMargins.top + 15}mm ${pageMargins.right}mm ${
      pageMargins.bottom + 15
    }mm ${pageMargins.left}mm;
            }
            
            body {
              font-family: 'Georgia', serif;
              font-size: 12pt;
              line-height: 1.6;
              margin: 0;
              padding: 0;
              color: #000;
            }
            
            .page-header, .page-footer {
              font-size: 10pt;
              text-align: center;
              border-bottom: 1px solid #ccc;
              padding-bottom: 5mm;
              margin-bottom: 5mm;
            }
            
            .page-footer {
              border-bottom: none;
              border-top: 1px solid #ccc;
              padding-top: 5mm;
              margin-top: 5mm;
              margin-bottom: 0;
            }
            
            .document-content {
              max-width: none;
              margin: 0;
              padding: 0;
            }
            
            .page-number::before {
              content: counter(page);
            }
            
            .total-pages::before {
              content: counter(pages);
            }
            
            * {
              background: transparent !important;
              box-shadow: none !important;
            }
          </style>
        </head>
        <body>
          ${
            headerContent
              ? `<div class="page-header">${headerContent}</div>`
              : ""
          }
          ${
            footerContent
              ? `<div class="page-footer">${processedFooter}</div>`
              : ""
          }
          <div class="document-content">${content}</div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }, [editor, pageMargins, headerContent, footerContent]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "p":
            e.preventDefault();
            handlePrint();
            break;
          case "s":
            e.preventDefault();
            saveAsDocument();
            break;
          case "o":
            e.preventDefault();
            loadDocument();
            break;
          case "=":
          case "+":
            e.preventDefault();
            handleZoomIn();
            break;
          case "-":
            e.preventDefault();
            handleZoomOut();
            break;
          case "0":
            e.preventDefault();
            setZoom(100);
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handlePrint, handleZoomIn, handleZoomOut, saveAsDocument, loadDocument]);

  // Generate ruler marks
  const generateHorizontalMarks = () => {
    const marks = [];
    const totalWidth = 250; // A4 width + margins in mm

    for (let i = 0; i <= totalWidth; i += 5) {
      const position = mmToPx(i);
      const isMajor = i % 20 === 0;
      const isMinor = i % 10 === 0;

      marks.push(
        <g key={`h-${i}`}>
          <line
            x1={position}
            y1={isMajor ? 0 : isMinor ? 8 : 12}
            x2={position}
            y2={24}
            stroke="#666"
            strokeWidth={isMajor ? "1" : "0.5"}
          />
          {isMajor && i > 0 && (
            <text
              x={position}
              y={16}
              fontSize="8"
              fill="#666"
              textAnchor="middle"
              className="select-none"
            >
              {i}
            </text>
          )}
        </g>
      );
    }
    return marks;
  };

  const generateVerticalMarks = () => {
    const marks = [];
    const totalHeight = 350; // A4 height + margins in mm

    for (let i = 0; i <= totalHeight; i += 5) {
      const position = mmToPx(i);
      const isMajor = i % 20 === 0;
      const isMinor = i % 10 === 0;

      marks.push(
        <g key={`v-${i}`}>
          <line
            x1={isMajor ? 0 : isMinor ? 8 : 12}
            y1={position}
            x2={32}
            y2={position}
            stroke="#666"
            strokeWidth={isMajor ? "1" : "0.5"}
          />
          {isMajor && i > 0 && (
            <text
              x={16}
              y={position + 3}
              fontSize="8"
              fill="#666"
              textAnchor="middle"
              className="select-none"
              transform={`rotate(-90, 16, ${position + 3})`}
            >
              {i}
            </text>
          )}
        </g>
      );
    }
    return marks;
  };

  return (
    <div
      className="flex flex-col flex-1 overflow-hidden bg-gray-100"
      onMouseUp={handleTextSelection}
    >
      {/* Zoom and Controls Bar */}
      <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center space-x-4">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= zoomLevels[0]}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom Out (Ctrl+-)"
            >
              <MagnifyingGlassMinusIcon className="w-4 h-4" />
            </button>

            <select
              value={zoom}
              onChange={(e) => handleZoomChange(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1 min-w-[80px]"
            >
              {zoomLevels.map((level) => (
                <option key={level} value={level}>
                  {level}%
                </option>
              ))}
            </select>

            <button
              onClick={handleZoomIn}
              disabled={zoom >= zoomLevels[zoomLevels.length - 1]}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom In (Ctrl++)"
            >
              <MagnifyingGlassPlusIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Rulers Toggle */}
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={showRulers}
              onChange={(e) => setShowRulers(e.target.checked)}
              className="rounded"
            />
            <span>Show Rulers</span>
          </label>

          {/* Header/Footer Toggle */}
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={showHeaderFooter}
              onChange={(e) => setShowHeaderFooter(e.target.checked)}
              className="rounded"
            />
            <span>Show Header/Footer</span>
          </label>

          {/* Header/Footer Settings Button */}
          <button
            onClick={() => setShowHeaderFooterModal(true)}
            className="flex items-center space-x-2 px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            title="Edit Header & Footer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-sm">Header & Footer</span>
          </button>

          {/* Save As Button */}
          <button
            onClick={saveAsDocument}
            className="flex items-center space-x-2 px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
            title="Save As Document (Ctrl+S)"
          >
            <DocumentTextIcon className="w-4 h-4" />
            <span className="text-sm">Save As</span>
          </button>

          {/* Load Document Button */}
          <button
            onClick={loadDocument}
            className="flex items-center space-x-2 px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
            title="Load Document (Ctrl+O)"
          >
            <FolderOpenIcon className="w-4 h-4" />
            <span className="text-sm">Load</span>
          </button>

          {/* Export Controls */}
          <div className="flex items-center space-x-2 border-l border-gray-300 pl-4">
            <button
              onClick={exportToHTML}
              className="flex items-center space-x-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              title="Export as HTML"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              <span className="text-sm">HTML</span>
            </button>

            <button
              onClick={exportToJSON}
              className="flex items-center space-x-2 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              title="Export as JSON"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              <span className="text-sm">JSON</span>
            </button>

            <button
              onClick={exportToText}
              className="flex items-center space-x-2 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              title="Export as Text"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              <span className="text-sm">TXT</span>
            </button>
          </div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            title="Print (Ctrl+P)"
          >
            <PrinterIcon className="w-4 h-4" />
            <span className="text-sm">Print</span>
          </button>
        </div>

        <div className="flex items-center space-x-4 text-xs text-gray-500">
          {lastSaved && <div>Last saved: {lastSaved.toLocaleTimeString()}</div>}
          <div>
            Page {currentPageIndex + 1} of {Math.max(1, pageContents.length)} •
            A4 (210 × 297 mm)
          </div>
        </div>
      </div>

      {/* Document Area with Rulers */}
      <div className="flex-1 overflow-auto bg-gray-100 relative">
        {/* Document Container */}
        <div className="flex justify-center p-8 min-h-full">
          <div className="relative">
            {/* Horizontal Ruler */}
            {showRulers && (
              <div className="absolute top-0 left-8 right-0 h-6 bg-white border-b border-gray-300 z-10">
                <svg
                  width="100%"
                  height="24"
                  className="absolute inset-0"
                  style={{
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: "top left",
                  }}
                >
                  {generateHorizontalMarks()}
                  {showCursor && (
                    <line
                      x1={mousePosition.x}
                      y1={0}
                      x2={mousePosition.x}
                      y2={24}
                      stroke="#0066cc"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  )}
                </svg>
              </div>
            )}

            {/* Vertical Ruler */}
            {showRulers && (
              <div className="absolute top-6 left-0 bottom-0 w-8 bg-white border-r border-gray-300 z-10">
                <svg
                  width="32"
                  height="100%"
                  className="absolute inset-0"
                  style={{
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: "top left",
                  }}
                >
                  {generateVerticalMarks()}
                  {showCursor && (
                    <line
                      x1={0}
                      y1={mousePosition.y}
                      x2={32}
                      y2={mousePosition.y}
                      stroke="#0066cc"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  )}
                </svg>
              </div>
            )}

            {/* Pages Container */}
            <div className="space-y-8">
              {pageContents.length === 0 ||
              (pageContents.length === 1 && !pageContents[0]) ? (
                // Single page with live editor
                <div
                  ref={pageContainerRef}
                  className={`bg-white shadow-lg border border-gray-200 relative ${
                    showRulers ? "ml-8 mt-6" : ""
                  }`}
                  style={{
                    width: "210mm",
                    minHeight: "297mm",
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: "top left",
                    marginBottom: "20mm",
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Margin Guides */}
                  <div
                    className="absolute border border-dashed border-gray-300 pointer-events-none"
                    style={{
                      top: `${pageMargins.top}mm`,
                      left: `${pageMargins.left}mm`,
                      right: `${pageMargins.right}mm`,
                      bottom: `${pageMargins.bottom}mm`,
                      opacity: 0.3,
                    }}
                  />

                  {/* Header */}
                  {showHeaderFooter && headerContent && (
                    <div
                      className="absolute left-0 right-0 text-center text-xs border-b border-gray-200 bg-gray-50"
                      style={{
                        top: "10mm",
                        padding: "5mm 25.4mm",
                        minHeight: "10mm",
                      }}
                      dangerouslySetInnerHTML={{ __html: headerContent }}
                    />
                  )}

                  {/* Footer */}
                  {showHeaderFooter && footerContent && (
                    <div
                      className="absolute left-0 right-0 text-center text-xs border-t border-gray-200 bg-gray-50"
                      style={{
                        bottom: "10mm",
                        padding: "5mm 25.4mm",
                        minHeight: "10mm",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: footerContent
                          .replace(/\{\{pageNumber\}\}/g, "1")
                          .replace(/\{\{totalPages\}\}/g, "1"),
                      }}
                    />
                  )}

                  {/* Page Content - Live Editor */}
                  <div
                    className="relative h-full"
                    style={{
                      padding: `${
                        pageMargins.top +
                        (showHeaderFooter && headerContent ? 15 : 0)
                      }mm ${pageMargins.right}mm ${
                        pageMargins.bottom +
                        (showHeaderFooter && footerContent ? 15 : 0)
                      }mm ${pageMargins.left}mm`,
                    }}
                  >
                    <EditorContent
                      editor={editor}
                      className="prose prose-lg max-w-none h-full"
                      style={{
                        fontFamily: "Georgia, serif",
                        lineHeight: "1.8",
                        fontSize: "12pt",
                        minHeight: "100%",
                      }}
                    />
                  </div>
                </div>
              ) : (
                // Multiple pages
                pageContents.map((pageContent, index) => {
                  const isCurrentPage = index === currentPageIndex;

                  return (
                    <div
                      key={index}
                      ref={index === 0 ? pageContainerRef : undefined}
                      className={`bg-white shadow-lg border border-gray-200 relative ${
                        showRulers ? "ml-8 mt-6" : ""
                      }`}
                      style={{
                        width: "210mm",
                        minHeight: "297mm",
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: "top left",
                        marginBottom: "20mm",
                      }}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* Margin Guides */}
                      <div
                        className="absolute border border-dashed border-gray-300 pointer-events-none"
                        style={{
                          top: `${pageMargins.top}mm`,
                          left: `${pageMargins.left}mm`,
                          right: `${pageMargins.right}mm`,
                          bottom: `${pageMargins.bottom}mm`,
                          opacity: 0.3,
                        }}
                      />

                      {/* Header */}
                      {showHeaderFooter && headerContent && (
                        <div
                          className="absolute left-0 right-0 text-center text-xs border-b border-gray-200 bg-gray-50"
                          style={{
                            top: "10mm",
                            padding: "5mm 25.4mm",
                            minHeight: "10mm",
                          }}
                          dangerouslySetInnerHTML={{ __html: headerContent }}
                        />
                      )}

                      {/* Footer */}
                      {showHeaderFooter && footerContent && (
                        <div
                          className="absolute left-0 right-0 text-center text-xs border-t border-gray-200 bg-gray-50"
                          style={{
                            bottom: "10mm",
                            padding: "5mm 25.4mm",
                            minHeight: "10mm",
                          }}
                          dangerouslySetInnerHTML={{
                            __html: footerContent
                              .replace(/\{\{pageNumber\}\}/g, String(index + 1))
                              .replace(
                                /\{\{totalPages\}\}/g,
                                String(pageContents.length)
                              ),
                          }}
                        />
                      )}

                      {/* Page Content */}
                      <div
                        className="relative"
                        style={{
                          padding: `${
                            pageMargins.top +
                            (showHeaderFooter && headerContent ? 15 : 0)
                          }mm ${pageMargins.right}mm ${
                            pageMargins.bottom +
                            (showHeaderFooter && footerContent ? 15 : 0)
                          }mm ${pageMargins.left}mm`,
                        }}
                      >
                        {isCurrentPage ? (
                          // Current page shows live editor
                          <EditorContent
                            editor={editor}
                            className="prose prose-lg max-w-none"
                            style={{
                              fontFamily: "Georgia, serif",
                              lineHeight: "1.8",
                              fontSize: "12pt",
                            }}
                          />
                        ) : (
                          // Other pages show static content
                          <div
                            className="prose prose-lg max-w-none"
                            style={{
                              fontFamily: "Georgia, serif",
                              lineHeight: "1.8",
                              fontSize: "12pt",
                            }}
                            dangerouslySetInnerHTML={{
                              __html: pageContent,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Header/Footer Modal */}
      <HeaderFooterModal
        isOpen={showHeaderFooterModal}
        onClose={() => setShowHeaderFooterModal(false)}
        headerContent={headerContent}
        footerContent={footerContent}
        onHeaderChange={onHeaderChange || (() => {})}
        onFooterChange={onFooterChange || (() => {})}
      />
    </div>
  );
};

export default Editor;
