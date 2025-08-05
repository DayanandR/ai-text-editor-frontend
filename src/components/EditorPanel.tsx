import React from "react";
import TopBar from "./TopBar";
import TabBar from "./TabBar";
import TiptapEditor from "./TipTapEditor";

interface EditorPanelProps {
  document: {
    title: string;
    content: string;
    saved: boolean;
    characterCount: number;
  };
  setDocument: React.Dispatch<React.SetStateAction<any>>;
  activeTab: "text" | "page";
  setActiveTab: React.Dispatch<React.SetStateAction<"text" | "page">>;
}

const EditorPanel: React.FC<EditorPanelProps> = ({
  document,
  setDocument,
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="flex-1 flex flex-col bg-white">
      <TopBar title={document.title} saved={document.saved} />
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 overflow-hidden">
        <TiptapEditor
          content={document.content}
          onChange={(content) =>
            setDocument((prev: any) => ({
              ...prev,
              content,
              saved: false,
              characterCount: content.length,
            }))
          }
        />
      </div>
    </div>
  );
};

export default EditorPanel;
