import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import { Underline } from "@tiptap/extension-underline";

interface HeaderFooterModalProps {
  isOpen: boolean;
  onClose: () => void;
  headerContent: string;
  footerContent: string;
  onHeaderChange: (content: string) => void;
  onFooterChange: (content: string) => void;
}

export const HeaderFooterModal: React.FC<HeaderFooterModalProps> = ({
  isOpen,
  onClose,
  headerContent,
  footerContent,
  onHeaderChange,
  onFooterChange,
}) => {
  const headerEditor = useEditor({
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
      Underline,
    ],
    content: headerContent,
    onUpdate: ({ editor }) => {
      onHeaderChange(editor.getHTML());
    },
  });

  const footerEditor = useEditor({
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
      Underline,
    ],
    content: footerContent,
    onUpdate: ({ editor }) => {
      onFooterChange(editor.getHTML());
    },
  });

  const ToolbarButton: React.FC<{
    onClick: () => void;
    isActive: boolean;
    title: string;
    children: React.ReactNode;
  }> = ({ onClick, isActive, title, children }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded text-sm transition-colors ${
        isActive
          ? "bg-blue-100 text-blue-600"
          : "text-gray-500 hover:bg-gray-100"
      }`}
      title={title}
    >
      {children}
    </button>
  );

  const EditorToolbar: React.FC<{ editor: any; label: string }> = ({
    editor,
    label,
  }) => {
    if (!editor) return null;

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
          <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              title="Bold"
            >
              <strong className="text-sm">B</strong>
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              title="Italic"
            >
              <em className="text-sm">I</em>
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive("underline")}
              title="Underline"
            >
              <span className="text-sm underline">U</span>
            </ToolbarButton>

            <div className="w-px h-6 bg-gray-300 mx-1"></div>

            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              isActive={
                editor.isActive({ textAlign: "left" }) ||
                (!editor.isActive({ textAlign: "center" }) &&
                  !editor.isActive({ textAlign: "right" }))
              }
              title="Align Left"
            >
              <span className="text-sm">⫸</span>
            </ToolbarButton>

            <ToolbarButton
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              isActive={editor.isActive({ textAlign: "center" })}
              title="Align Center"
            >
              <span className="text-sm">⫯</span>
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              isActive={editor.isActive({ textAlign: "right" })}
              title="Align Right"
            >
              <span className="text-sm">⫷</span>
            </ToolbarButton>
          </div>
        </div>

        <div className="border border-gray-300 rounded-lg p-3 bg-white min-h-[80px] focus-within:border-blue-500 transition-colors">
          <EditorContent
            editor={editor}
            className="prose prose-sm max-w-none focus:outline-none"
            style={{ minHeight: "60px" }}
          />
        </div>

        {label === "Footer" && (
          <div className="mt-2 text-sm text-gray-500 bg-blue-50 p-2 rounded">
            💡 <strong>Tip:</strong> Use{" "}
            <code className="bg-white px-1 rounded">{"{{pageNumber}}"}</code>{" "}
            and{" "}
            <code className="bg-white px-1 rounded">{"{{totalPages}}"}</code>{" "}
            for dynamic page numbers
          </div>
        )}
      </div>
    );
  };

  const insertQuickContent = (editor: any, content: string) => {
    editor?.chain().focus().insertContent(content).run();
  };

  const QuickInserts: React.FC<{ editor: any; type: "header" | "footer" }> = ({
    editor,
    type,
  }) => {
    const headerTemplates = [
      {
        label: "Company Name",
        content:
          '<p style="text-align: center;"><strong>Your Company Name</strong></p>',
      },
      {
        label: "Confidential",
        content:
          '<p style="text-align: center;"><strong>CONFIDENTIAL</strong></p>',
      },
      {
        label: "Draft",
        content:
          '<p style="text-align: center;"><em>DRAFT - NOT FOR DISTRIBUTION</em></p>',
      },
    ];

    const footerTemplates = [
      {
        label: "Page Numbers",
        content:
          '<p style="text-align: center;">Page {{pageNumber}} of {{totalPages}}</p>',
      },
      {
        label: "Date & Page",
        content:
          '<p style="text-align: center;">{{pageNumber}} | Printed on ' +
          new Date().toLocaleDateString() +
          "</p>",
      },
      {
        label: "Company Footer",
        content:
          '<p style="text-align: center;"><em>Company Name | Address | Phone</em></p>',
      },
    ];

    const templates = type === "header" ? headerTemplates : footerTemplates;

    return (
      <div className="mt-2">
        <div className="text-xs text-gray-500 mb-1">Quick Templates:</div>
        <div className="flex flex-wrap gap-1">
          {templates.map((template, index) => (
            <button
              key={index}
              onClick={() => insertQuickContent(editor, template.content)}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              {template.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h2"
                    className="text-2xl font-bold leading-6 text-gray-900"
                  >
                    Document Header & Footer
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 p-1"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <EditorToolbar editor={headerEditor} label="Header" />
                    <QuickInserts editor={headerEditor} type="header" />
                  </div>

                  <div>
                    <EditorToolbar editor={footerEditor} label="Footer" />
                    <QuickInserts editor={footerEditor} type="footer" />
                  </div>
                </div>

                <div className="mt-8 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Changes are saved automatically and will appear on all
                    printed pages
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={() => {
                        onHeaderChange("");
                        onFooterChange("");
                        headerEditor?.commands.setContent("");
                        footerEditor?.commands.setContent("");
                      }}
                    >
                      Clear All
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={onClose}
                    >
                      Done
                    </button>
                  </div>
                </div>

                {/* Preview Section */}
                <div className="mt-6 border-t pt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Preview:
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4 max-h-60 overflow-y-auto">
                    {headerContent && (
                      <div className="border-b border-gray-200 pb-2">
                        <div className="text-xs text-gray-500 mb-1">
                          Header:
                        </div>
                        <div
                          className="text-sm border border-gray-200 bg-white p-2 rounded"
                          dangerouslySetInnerHTML={{ __html: headerContent }}
                        />
                      </div>
                    )}

                    <div className="text-center text-gray-400 text-sm py-8 border border-dashed border-gray-300 rounded">
                      Document content will appear here...
                    </div>

                    {footerContent && (
                      <div className="border-t border-gray-200 pt-2">
                        <div className="text-xs text-gray-500 mb-1">
                          Footer:
                        </div>
                        <div
                          className="text-sm border border-gray-200 bg-white p-2 rounded"
                          dangerouslySetInnerHTML={{
                            __html: footerContent
                              .replace(/\{\{pageNumber\}\}/g, "1")
                              .replace(/\{\{totalPages\}\}/g, "3"),
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
