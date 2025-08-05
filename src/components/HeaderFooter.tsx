import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";

interface HeaderFooterProps {
  label: "Header" | "Footer";
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export const HeaderFooter: React.FC<HeaderFooterProps> = ({
  label,
  content,
  onChange,
  placeholder = `Enter ${label.toLowerCase()} content...`,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        horizontalRule: false,
        codeBlock: false,
      }),
      TextAlign.configure({
        types: ["paragraph"],
      }),
      TextStyle,
      FontFamily,
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[40px] p-2",
        placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return <div className="animate-pulse bg-gray-100 h-12 rounded"></div>;
  }

  return (
    <div className="border rounded-lg bg-white shadow-sm mb-4">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50 rounded-t-lg">
        <div className="font-medium text-sm text-gray-700">{label}</div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1 rounded text-xs w-6 h-6 flex items-center justify-center ${
              editor.isActive("bold")
                ? "bg-blue-100 text-blue-600"
                : "text-gray-500 hover:bg-gray-200"
            }`}
            title="Bold"
          >
            <strong>B</strong>
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1 rounded text-xs w-6 h-6 flex items-center justify-center ${
              editor.isActive("italic")
                ? "bg-blue-100 text-blue-600"
                : "text-gray-500 hover:bg-gray-200"
            }`}
            title="Italic"
          >
            <em>I</em>
          </button>

          <button
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`p-1 rounded text-xs w-6 h-6 flex items-center justify-center ${
              editor.isActive({ textAlign: "left" }) ||
              (!editor.isActive({ textAlign: "center" }) &&
                !editor.isActive({ textAlign: "right" }))
                ? "bg-blue-100 text-blue-600"
                : "text-gray-500 hover:bg-gray-200"
            }`}
            title="Left align"
          >
            ☰
          </button>

          <button
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`p-1 rounded text-xs w-6 h-6 flex items-center justify-center ${
              editor.isActive({ textAlign: "center" })
                ? "bg-blue-100 text-blue-600"
                : "text-gray-500 hover:bg-gray-200"
            }`}
            title="Center align"
          >
            ☷
          </button>

          <button
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`p-1 rounded text-xs w-6 h-6 flex items-center justify-center ${
              editor.isActive({ textAlign: "right" })
                ? "bg-blue-100 text-blue-600"
                : "text-gray-500 hover:bg-gray-200"
            }`}
            title="Right align"
          >
            ☱
          </button>
        </div>
      </div>

      <div className="p-2">
        <EditorContent
          editor={editor}
          className="min-h-[40px] text-sm leading-relaxed"
        />
      </div>

      {label === "Footer" && (
        <div className="px-3 py-2 border-t bg-gray-50 rounded-b-lg">
          <div className="text-xs text-gray-500">
            💡 Use <code>{"{{pageNumber}}"}</code> and{" "}
            <code>{"{{totalPages}}"}</code> for page numbers
          </div>
        </div>
      )}
    </div>
  );
};
