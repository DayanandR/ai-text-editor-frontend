import React from "react";

interface TabBarProps {
  activeTab: "text" | "page";
  setActiveTab: React.Dispatch<React.SetStateAction<"text" | "page">>;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "text" as const, label: "Text" },
    { id: "page" as const, label: "Page" },
  ];

  return (
    <div className="flex border-b border-gray-200 bg-gray-50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? "text-blue-600 border-b-2 border-blue-600 bg-white"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabBar;
