import React from "react";
import {
  DocumentTextIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";

interface TopBarProps {
  title: string;
  saved: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ title, saved }) => {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
      <div className="flex items-center space-x-3">
        <DocumentTextIcon className="w-5 h-5 text-gray-600" />
        <span className="font-medium text-gray-900">{title}</span>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            ℹ️
          </span>
          {saved && (
            <span className="text-xs text-green-600 font-medium">✓ Saved</span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <BookmarkIcon className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <EllipsisHorizontalIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default TopBar;
