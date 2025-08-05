import React, { useState } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

interface FooterProps {
  characterCount: number;
}

const Footer: React.FC<FooterProps> = ({ characterCount }) => {
  const [chatInput, setChatInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 152;

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      // Handle sending message
      console.log("Sending message:", chatInput);
      setChatInput("");
    }
  };

  return (
    <div className="bg-white border-t border-gray-200">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="text-sm text-gray-500">{characterCount} characters</div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Page</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <input
              type="number"
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  setCurrentPage(page);
                }
              }}
              className="w-12 px-2 py-1 text-center border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              min="1"
              max={totalPages}
            />

            <span className="text-sm text-gray-600">of {totalPages}</span>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Right side - Chat input */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Ask Vettam</span>
          <div className="relative flex items-center">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your message..."
              className="w-64 px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSendMessage}
              className="absolute right-2 p-1 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
