import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  LinkIcon,
  ListBulletIcon,
  Bars3BottomLeftIcon,
  Bars3Icon,
  Bars3BottomRightIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";

interface ToolbarProps {
  editor: Editor | null;
  activeTab?: "text" | "page";
  onTabChange?: (tab: "text" | "page") => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  editor,
  activeTab = "text",
  onTabChange,
}) => {
  const [fontFamily, setFontFamily] = useState("Avenir Next");
  const [fontSize, setFontSize] = useState("12");

  const fontFamilies = [
    "Avenir Next",
    "Arial",
    "Times New Roman",
    "Georgia",
    "Helvetica",
    "Courier New",
  ];

  const fontSizes = [
    "8",
    "9",
    "10",
    "11",
    "12",
    "14",
    "16",
    "18",
    "20",
    "24",
    "28",
    "36",
    "48",
    "72",
  ];

  // Handle font size change with proper units
  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    if (editor) {
      const sizeWithUnit = `${size}pt`; // Add 'pt' unit
      editor.chain().focus().setFontSize(sizeWithUnit).run();
    }
  };

  return (
    <div className="border-b border-gray-200 bg-white">
      {/* Tab Switcher */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => onTabChange?.("text")}
          className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === "text"
              ? "text-blue-600 border-b-2 border-blue-600 bg-white"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
          style={{
            outline: "none",
            outlineOffset: 0,
          }}
        >
          <DocumentTextIcon className="w-4 h-4 mr-2" />
          Text
        </button>
        <button
          onClick={() => onTabChange?.("page")}
          className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === "page"
              ? "text-blue-600 border-b-2 border-blue-600 bg-gray-50"
              : "text-gray-500 hover:text-gray-700"
          }`}
          style={{
            outline: "none",
            outlineOffset: 0,
          }}
        >
          <DocumentIcon className="w-4 h-4 mr-2" />
          Page
        </button>
      </div>

      {/* Existing Toolbar */}
      <div className="flex items-center space-x-2 px-8 py-3">
        {/* Font Family Dropdown */}
        <div className="relative">
          <select
            value={fontFamily}
            onChange={(e) => {
              setFontFamily(e.target.value);
              editor?.chain().focus().setFontFamily(e.target.value).run();
            }}
            disabled={!editor}
            className="appearance-none bg-white border border-gray-300 rounded px-3 py-1 pr-8 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
          >
            {fontFamilies.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={fontSize}
            onChange={(e) => handleFontSizeChange(e.target.value)}
            disabled={!editor}
            className="appearance-none bg-white border border-gray-300 rounded px-3 py-1 pr-8 text-sm focus:outline-none focus:border-blue-500 w-16 disabled:opacity-50"
          >
            {fontSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Quick Font Size Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleFontSizeChange("10")}
            disabled={!editor}
            className={`px-2 py-1 text-xs rounded hover:bg-gray-200 transition-colors disabled:opacity-50 ${
              fontSize === "10" ? "bg-blue-100 text-blue-600" : "text-gray-700"
            }`}
          >
            A-
          </button>
          <button
            onClick={() => handleFontSizeChange("12")}
            disabled={!editor}
            className={`px-2 py-1 text-xs rounded hover:bg-gray-200 transition-colors disabled:opacity-50 ${
              fontSize === "12" ? "bg-blue-100 text-blue-600" : "text-gray-700"
            }`}
          >
            A
          </button>
          <button
            onClick={() => handleFontSizeChange("16")}
            disabled={!editor}
            className={`px-2 py-1 text-xs rounded hover:bg-gray-200 transition-colors disabled:opacity-50 ${
              fontSize === "16" ? "bg-blue-100 text-blue-600" : "text-gray-700"
            }`}
          >
            A+
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300"></div>

        {/* Format Buttons */}
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          disabled={!editor}
          className={`p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 ${
            editor?.isActive("bold")
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700"
          }`}
          title="Bold (Ctrl+B)"
        >
          <BoldIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          disabled={!editor}
          className={`p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 ${
            editor?.isActive("italic")
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700"
          }`}
          title="Italic (Ctrl+I)"
        >
          <ItalicIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor?.chain().focus().toggleUnderline?.().run()}
          disabled={!editor}
          className={`p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 ${
            editor?.isActive("underline")
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700"
          }`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            const url = window.prompt("Enter the URL");
            if (url) {
              editor?.chain().focus().setLink({ href: url }).run();
            }
          }}
          disabled={!editor}
          className={`p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 ${
            editor?.isActive("link")
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700"
          }`}
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300"></div>

        {/* Alignment Buttons */}
        <button
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
          disabled={!editor}
          className={`p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 ${
            editor?.isActive({ textAlign: "left" }) ||
            (!editor?.isActive({ textAlign: "center" }) &&
              !editor?.isActive({ textAlign: "right" }))
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700"
          }`}
          title="Align Left"
        >
          <Bars3BottomLeftIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
          disabled={!editor}
          className={`p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 ${
            editor?.isActive({ textAlign: "center" })
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700"
          }`}
          title="Align Center"
        >
          <Bars3Icon className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}
          disabled={!editor}
          className={`p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 ${
            editor?.isActive({ textAlign: "right" })
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700"
          }`}
          title="Align Right"
        >
          <Bars3BottomRightIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor?.chain().focus().setTextAlign("justify").run()}
          disabled={!editor}
          className={`p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 ${
            editor?.isActive({ textAlign: "justify" })
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700"
          }`}
          title="Justify"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300"></div>

        {/* List Buttons */}
        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          disabled={!editor}
          className={`p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 ${
            editor?.isActive("bulletList")
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700"
          }`}
          title="Bullet List"
        >
          <ListBulletIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          disabled={!editor}
          className={`p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 ${
            editor?.isActive("orderedList")
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700"
          }`}
          title="Numbered List"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 4a1 1 0 01.5-.866l2-1a1 1 0 111 1.732L5.5 4.5H6a1 1 0 110 2H4a1 1 0 110-2h1zM8 4a1 1 0 011-1h8a1 1 0 110 2H9a1 1 0 01-1-1zm1 6a1 1 0 100 2h8a1 1 0 100-2H9zM3 13v-1a1 1 0 112 0v1a1 1 0 01-1 1H3a1 1 0 110-2h1zm6-3a1 1 0 011-1h8a1 1 0 110 2H9a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Page Break Button */}
        <button
          title="Insert Page Break (Ctrl+Enter)"
          onClick={() => {
            if (editor) {
              console.log("Inserting page break...");
              const success = editor.commands.insertContent({
                type: "pageBreak",
              });
              console.log("Page break inserted:", success);

              // Force re-render
              setTimeout(() => {
                console.log("HTML after page break:", editor.getHTML());
              }, 100);
            }
          }}
          disabled={!editor}
          className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded text-xs font-medium transition-colors disabled:opacity-50"
        >
          ↵ Page Break
        </button>

        {/* Page View Specific Controls */}
        {activeTab === "page" && (
          <>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Zoom:</span>
              <select className="border border-gray-300 rounded px-2 py-1 text-xs">
                <option>50%</option>
                <option>75%</option>
                <option>100%</option>
                <option>125%</option>
                <option>150%</option>
                <option>200%</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
