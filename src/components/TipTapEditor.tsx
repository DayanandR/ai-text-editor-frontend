import React, { useEffect } from "react";
import {
  useEditor,
  EditorContent,
  Editor as TiptapEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextAlign } from "@tiptap/extension-text-align";
import { FontFamily } from "@tiptap/extension-font-family";
import { TextStyle } from "@tiptap/extension-text-style";
import { Underline } from "@tiptap/extension-underline";

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  onEditorCreate?: (editor: TiptapEditor | null) => void;
}

const TipTapEditor: React.FC<TipTapEditorProps> = ({
  content,
  onChange,
  onEditorCreate,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      FontFamily,
      Underline,
    ],
    content:
      content ||
      `
      <p><strong>Do Androids Dream of Electric Sheep?</strong> is a 1968 dystopian science fiction novel by American writer Philip K. Dick. Set in a post-apocalyptic San Francisco, the story unfolds after a devastating global war.</p>
      
      <ol>
        <li><strong>Androids and Humans:</strong> The novel explores the uneasy coexistence of humans and androids. Androids, manufactured on Mars, rebel, kill their owners, and escape to Earth, where they hope to remain undetected.</li>
        <li><strong>Empathy and Identity:</strong> To distinguish androids from humans, the Voigt-Kampff Test measures emotional responses. Androids lack empathy, making them vulnerable to detection. <em>Criminal (2005)</em></li>
      </ol>
    `,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none focus:outline-none min-h-full p-8",
      },
    },
  });

  // Pass the editor instance to parent when it's created (if callback provided)
  useEffect(() => {
    if (onEditorCreate) {
      onEditorCreate(editor);
    }
  }, [editor, onEditorCreate]);

  if (!editor) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <EditorContent editor={editor} className="h-full" />
    </div>
  );
};

export default TipTapEditor;
