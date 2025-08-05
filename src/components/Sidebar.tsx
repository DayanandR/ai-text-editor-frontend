import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  LanguageIcon,
  PencilIcon,
  PencilSquareIcon,
  BookmarkIcon,
  UserIcon,
  Bars3Icon,
  ChevronLeftIcon,
  PlusIcon,
  DocumentTextIcon,
  XMarkIcon,
  ClipboardDocumentIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { geminiService } from "../services/gemini";
import { useAppDispatch } from "../store/hooks";
import { logoutRequest } from "../slices/authSlice";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  documents: Array<{
    id: string;
    title: string;
    saved: boolean;
    updatedAt: string;
    content: string;
  }>;
  activeDocumentId: string;
  onDocumentSelect: (id: string) => void;
  onCreateDocument: () => void;
  chatHistory: Array<{
    id: string;
    message: string;
    response: string;
    timestamp: string;
  }>;
  onSendMessage: (message: string) => void;
  chatInput: string;
  onChatInputChange: (input: string) => void;
  isProcessingChat: boolean;
  user: {
    id: string;
    name: string;
    email: string;
  };
  onDeleteDocument: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  documents,
  activeDocumentId,
  onDocumentSelect,
  onCreateDocument,
  onSendMessage,
  chatInput,
  onChatInputChange,
  isProcessingChat,
  user,
  onDeleteDocument,
}) => {
  const [activeSection, setActiveSection] = useState("workspace");
  const [quickLoading, setQuickLoading] = useState<
    null | "summarize" | "keypoints" | "risks"
  >(null);

  // Add state for chat interface
  const [showChatModal, setShowChatModal] = useState(false);
  const [localChatInput, setLocalChatInput] = useState("");
  const [isLocalChatProcessing, setIsLocalChatProcessing] = useState(false);
  const [localChatHistory, setLocalChatHistory] = useState<
    Array<{
      id: string;
      message: string;
      response: string;
      timestamp: Date;
      isUser: boolean;
    }>
  >([]);
  // Add this state with your other state declarations
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dispatch = useAppDispatch();

  // Add this useEffect to close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && !(event.target as Element).closest(".relative")) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const chatInputRef = useRef<HTMLInputElement>(null);
  const chatModalInputRef = useRef<HTMLInputElement>(null);
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  const navigationItems = [
    { id: "workspace", label: "Workspace", icon: HomeIcon, isEnabled: true },
    {
      id: "research",
      label: "Research",
      icon: MagnifyingGlassIcon,
      isEnabled: false,
    },
    {
      id: "translate",
      label: "Translate",
      icon: LanguageIcon,
      isEnabled: false,
    },
    { id: "write", label: "Write", icon: PencilIcon, isEnabled: false },
  ];

  const toolItems = [
    { id: "editor", label: "Editor", icon: PencilSquareIcon, isEnabled: false },
    {
      id: "bookmarks",
      label: "Bookmarks",
      icon: BookmarkIcon,
      isEnabled: false,
    },
  ];

  const recentDocuments = useMemo(
    () =>
      [...documents]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 5),
    [documents]
  );

  // Auto-scroll chat to bottom
  const scrollChatToBottom = () => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  };

  const handleDeleteDocument = (docId: string, docTitle: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${docTitle}"? This action cannot be undone.`
      )
    ) {
      onDeleteDocument(docId);
    }
  };

  useEffect(() => {
    scrollChatToBottom();
  }, [localChatHistory, isLocalChatProcessing]);

  // Focus chat input when modal opens
  useEffect(() => {
    if (showChatModal && chatModalInputRef.current) {
      chatModalInputRef.current.focus();
    }
  }, [showChatModal]);

  // Open chat modal with text and auto-send
  const openChatModalWithText = async (text: string, isAutoSend = false) => {
    setShowChatModal(true);
    setLocalChatInput(text);

    if (isAutoSend) {
      // Wait for modal to open, then auto-send
      setTimeout(() => {
        handleSendLocalChatWithText(text);
      }, 100);
    }
  };

  // Open chat modal with pre-filled result from quick analysis
  const openChatModalWithResult = (
    type: "summarize" | "keypoints" | "risks",
    result: string
  ) => {
    const userMessage = `Please ${type} this document`;
    const messageId = Date.now().toString();

    // Add both user message and AI response to chat history
    setLocalChatHistory([
      {
        id: messageId,
        message: userMessage,
        response: "",
        timestamp: new Date(),
        isUser: true,
      },
      {
        id: messageId + "_response",
        message: userMessage,
        response: result,
        timestamp: new Date(),
        isUser: false,
      },
    ]);

    setShowChatModal(true);
    setLocalChatInput("");
  };

  // Handle quick chat input - open modal instead of legacy send
  const handleQuickChatSubmit = () => {
    if (!chatInput.trim()) return;

    // Clear the quick input and open modal with the text
    const inputText = chatInput.trim();
    onChatInputChange(""); // Clear the quick input
    openChatModalWithText(inputText, true); // Open modal and auto-send
  };

  // Handle local chat in modal
  const handleSendLocalChat = async () => {
    if (!localChatInput.trim() || isLocalChatProcessing) return;
    await handleSendLocalChatWithText(localChatInput.trim());
  };

  const handleSendLocalChatWithText = async (messageText: string) => {
    if (!messageText.trim() || isLocalChatProcessing) return;

    const messageId = Date.now().toString();

    // Add user message to local history
    setLocalChatHistory((prev) => [
      ...prev,
      {
        id: messageId,
        message: messageText,
        response: "",
        timestamp: new Date(),
        isUser: true,
      },
    ]);

    setLocalChatInput("");
    setIsLocalChatProcessing(true);

    try {
      const activeDoc = documents.find((d) => d.id === activeDocumentId);
      const documentContent = activeDoc?.content || "";

      // Call Gemini service
      const response = await geminiService.chatWithDocument(
        messageText,
        documentContent
      );

      // Add AI response to local history
      setLocalChatHistory((prev) => [
        ...prev,
        {
          id: messageId + "_response",
          message: messageText,
          response: response,
          timestamp: new Date(),
          isUser: false,
        },
      ]);
    } catch (error) {
      console.error("Local chat error:", error);
      // Add error message
      setLocalChatHistory((prev) => [
        ...prev,
        {
          id: messageId + "_error",
          message: messageText,
          response: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
          isUser: false,
        },
      ]);
    } finally {
      setIsLocalChatProcessing(false);
      if (chatModalInputRef.current) {
        chatModalInputRef.current.focus();
      }
    }
  };

  const clearChatHistory = () => {
    setLocalChatHistory([]);
  };

  const copyMessageToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const activeDoc = documents.find((d) => d.id === activeDocumentId);

  // Updated quick action handler to open chat modal with results
  const handleQuickAction = async (
    action: "summarize" | "keypoints" | "risks"
  ) => {
    if (!activeDoc || quickLoading) return;

    setQuickLoading(action);
    try {
      let response = "";
      switch (action) {
        case "summarize":
          response = await geminiService.summarizeDocument(
            activeDoc.content ?? ""
          );
          break;
        case "keypoints":
          response = await geminiService.extractKeyPoints(
            activeDoc.content ?? ""
          );
          break;
        case "risks":
          response = await geminiService.analyzeRisks(activeDoc.content ?? "");
          break;
      }

      // Open chat modal with the result
      openChatModalWithResult(action, response);

      // Also send to legacy chat history if needed
      onSendMessage(response);
    } catch (err) {
      console.error("Gemini quick action error:", err);
      const errorMessage =
        "Sorry, there was an error processing your request. Please try again.";
      openChatModalWithResult(action, errorMessage);
    } finally {
      setQuickLoading(null);
    }
  };

  return (
    <>
      {/* Chat Modal - Rendered at root level for center positioning */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 rounded-xl shadow-2xl w-full max-w-4xl h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">AI Assistant</h3>
                  {activeDoc && (
                    <p className="text-sm text-gray-500">
                      Discussing: {activeDoc.title}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {localChatHistory.length > 0 && (
                  <button
                    onClick={clearChatHistory}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
                    title="Clear chat history"
                  >
                    <TrashIcon className="w-5 h-5 text-gray-500 group-hover:text-red-500" />
                  </button>
                )}
                <button
                  onClick={() => setShowChatModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Close chat"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Chat History */}
            <div
              ref={chatHistoryRef}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              {localChatHistory.length === 0 ? (
                <div className="text-center text-gray-500 py-16">
                  <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium mb-2">
                    Start a conversation
                  </h4>
                  <p className="text-sm text-gray-400 max-w-md mx-auto">
                    Ask questions about your document, get legal insights, or
                    request analysis. I'm here to help you understand and
                    improve your legal documents.
                  </p>
                  {activeDoc && (
                    <div className="mt-4 space-y-2">
                      <div className="p-3 bg-blue-50 rounded-lg inline-block">
                        <p className="text-xs text-blue-600">
                          💡 Try asking: "What are the key risks in this
                          document?"
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg inline-block">
                        <p className="text-xs text-green-600">
                          📋 Or use the quick analysis buttons in the sidebar
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                localChatHistory.map((chat) => (
                  <div key={chat.id} className="space-y-3">
                    {chat.isUser ? (
                      /* User Message */
                      <div className="flex justify-end">
                        <div className="bg-blue-600 text-white rounded-2xl px-4 py-3 max-w-[70%] relative group">
                          <p className="text-sm leading-relaxed">
                            {chat.message}
                          </p>
                          <button
                            onClick={() => copyMessageToClipboard(chat.message)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-500 rounded transition-all"
                            title="Copy message"
                          >
                            <ClipboardDocumentIcon className="w-3 h-3" />
                          </button>
                          <span className="text-xs text-blue-200 block mt-2">
                            {chat.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* AI Response */
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-900 rounded-2xl px-4 py-3 max-w-[70%] relative group">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {chat.response}
                          </p>
                          <button
                            onClick={() =>
                              copyMessageToClipboard(chat.response)
                            }
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                            title="Copy response"
                          >
                            <ClipboardDocumentIcon className="w-3 h-3" />
                          </button>
                          <span className="text-xs text-gray-500 block mt-2">
                            AI Assistant • {chat.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Processing indicator */}
              {isLocalChatProcessing && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 rounded-2xl px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                      <span className="text-sm text-gray-600">
                        AI is analyzing your document...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex space-x-3">
                <input
                  ref={chatModalInputRef}
                  type="text"
                  value={localChatInput}
                  onChange={(e) => setLocalChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendLocalChat();
                    }
                  }}
                  placeholder={
                    activeDoc
                      ? "Ask about your document..."
                      : "Start a conversation..."
                  }
                  disabled={isLocalChatProcessing}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 transition-all"
                />
                <button
                  onClick={handleSendLocalChat}
                  disabled={!localChatInput.trim() || isLocalChatProcessing}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  title="Send message"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Press Enter to send • Shift + Enter for new line
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Component */}
      <aside
        className={`bg-purple-900 text-white flex flex-col h-screen transition-all duration-300 ease-in-out overflow-auto relative ${
          isOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Header */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h1
              className={`text-xl font-bold transition-opacity duration-300 ${
                isOpen ? "opacity-100" : "opacity-0"
              }`}
            >
              {isOpen && "Vettam.AI"}
            </h1>

            <button
              onClick={onToggle}
              className="p-1 hover:bg-purple-800 rounded transition-colors cursor-pointer"
              title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isOpen ? (
                <ChevronLeftIcon className="w-5 h-5" />
              ) : (
                <Bars3Icon className="w-5 h-5" />
              )}
            </button>
          </div>

          {isOpen && (
            <button
              onClick={onCreateDocument}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              New Document
            </button>
          )}
        </div>

        {/* Navigation (Features) */}
        <div className="px-4 mb-6">
          {isOpen && (
            <h2 className="text-xs text-purple-300 uppercase tracking-wide mb-3">
              Features
            </h2>
          )}
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => item.isEnabled && setActiveSection(item.id)}
                  disabled={!item.isEnabled}
                  className={`relative w-full flex items-center text-xs ${
                    isOpen ? "px-3" : "px-1 justify-center"
                  } py-1 rounded-lg transition-colors ${
                    isActive && item.isEnabled
                      ? "bg-purple-800 text-white"
                      : item.isEnabled
                      ? "text-purple-200 hover:bg-purple-800 hover:text-white"
                      : "text-purple-400 cursor-not-allowed"
                  }`}
                  title={!isOpen ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 ${isOpen ? "mr-3" : ""}`} />
                  {isOpen && (
                    <span className="flex items-center">
                      {item.label}
                      {!item.isEnabled && (
                        <span className="ml-2 text-[10px] bg-purple-700 px-2 py-0.5 rounded-full text-white">
                          Coming Soon
                        </span>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Recent Documents */}
        {isOpen && (
          <div className="px-4 mb-6">
            <h2 className="text-xs text-purple-300 uppercase tracking-wide mb-2">
              Recent Documents
            </h2>
            <div className="space-y-1">
              {recentDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className={`group w-full text-xs flex items-start rounded transition-colors ${
                    activeDocumentId === doc.id
                      ? "bg-purple-800"
                      : "hover:bg-purple-800"
                  }`}
                >
                  <button
                    onClick={() => onDocumentSelect(doc.id)}
                    className={`flex-1 flex items-start px-2 py-1 text-left transition-colors cursor-pointer ${
                      activeDocumentId === doc.id
                        ? "text-white"
                        : "text-purple-200 hover:text-white"
                    } `}
                    style={{ outline: "none" }}
                  >
                    <DocumentTextIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">
                        {doc.title}
                      </div>
                      <div className="text-[10px] text-purple-300 flex items-center">
                        {!doc.saved && (
                          <span className="w-1 h-1 bg-orange-400 rounded-full mr-1" />
                        )}
                        {new Date(doc.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDocument(doc.id, doc.title);
                    }}
                    className="flex cursor-pointer p-2 mr-1 text-red-500 hover:bg-white  hover:rounded-2xl transition-all"
                    title={`Delete "${doc.title}"`}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tools Section */}
        <div className="px-4 mb-6 flex-1">
          {isOpen && (
            <h2 className="text-xs text-purple-300 uppercase tracking-wide mb-2">
              Tools
            </h2>
          )}
          <nav className="space-y-1">
            {toolItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => item.isEnabled && console.log(item.label)}
                  disabled={!item.isEnabled}
                  className={`relative w-full flex items-center text-xs ${
                    isOpen ? "px-3" : "px-2 justify-center"
                  } py-2 rounded-lg transition-colors ${
                    item.isEnabled
                      ? "text-purple-200 hover:bg-purple-800 hover:text-white"
                      : "text-purple-400 cursor-not-allowed"
                  }`}
                  title={!isOpen ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 ${isOpen ? "mr-3" : ""}`} />
                  {isOpen && (
                    <span className="flex items-center">
                      {item.label}
                      {!item.isEnabled && (
                        <span className="ml-2 text-[10px] bg-purple-700 px-2 py-0.5 rounded-full text-white">
                          Coming Soon
                        </span>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Analysis buttons (Gemini) */}
          {isOpen && activeDoc && (
            <div className="mt-6">
              <h2 className="text-xs text-purple-300 uppercase tracking-wide mb-2">
                Quick Analysis
              </h2>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleQuickAction("summarize")}
                  disabled={!!quickLoading || isProcessingChat}
                  className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded text-xs flex items-center justify-center transition-colors"
                >
                  {quickLoading === "summarize" ? (
                    <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-3 h-3" />
                  ) : (
                    "📋 Summarize Doc"
                  )}
                </button>

                <button
                  onClick={() => handleQuickAction("keypoints")}
                  disabled={!!quickLoading || isProcessingChat}
                  className="w-full py-2 px-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded text-xs flex items-center justify-center transition-colors"
                >
                  {quickLoading === "keypoints" ? (
                    <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-3 h-3" />
                  ) : (
                    "🔍 Key Points"
                  )}
                </button>

                <button
                  onClick={() => handleQuickAction("risks")}
                  disabled={!!quickLoading || isProcessingChat}
                  className="w-full py-2 px-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded text-xs flex items-center justify-center transition-colors"
                >
                  {quickLoading === "risks" ? (
                    <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-3 h-3" />
                  ) : (
                    "⚠️ Risk Analysis"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Quick Chat - Updated to open modal */}
          {isOpen && (
            <div className="mt-6">
              <h2 className="text-xs text-purple-300 uppercase tracking-wide mb-2">
                Quick Chat
              </h2>
              <div className="space-y-2">
                <input
                  ref={chatInputRef}
                  type="text"
                  value={chatInput}
                  onChange={(e) => onChatInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleQuickChatSubmit();
                    }
                  }}
                  placeholder="Ask Gemini…"
                  disabled={isProcessingChat}
                  className="w-full px-3 py-2 bg-purple-800 text-white placeholder-purple-300 rounded text-xs border border-purple-700 focus:border-orange-500 focus:outline-none disabled:opacity-50"
                />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleQuickChatSubmit}
                    disabled={!chatInput.trim() || isProcessingChat}
                    className="py-2 px-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:opacity-50 text-white rounded text-xs font-medium transition-colors"
                  >
                    {isProcessingChat ? "Processing…" : "Send"}
                  </button>
                  <button
                    onClick={() => setShowChatModal(true)}
                    className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors flex items-center justify-center"
                  >
                    <ChatBubbleLeftRightIcon className="w-3 h-3 mr-1" />
                    Chat
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Footer */}
        <div className="p-2 border-t border-purple-800 relative">
          <div
            className={`flex items-center ${!isOpen ? "justify-center" : ""}`}
          >
            {!isOpen ? (
              /* Collapsed state - Only show clickable avatar */
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"
                  title={`${user.name} - Click for menu`}
                >
                  <UserIcon className="w-5 h-5" />
                </button>

                {/* User Menu Dropdown for Collapsed State */}
                {showUserMenu && (
                  <div
                    className="fixed bottom-16 left-16 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[60]"
                    style={{
                      transform: "translateX(0)",
                      marginLeft: "auto",
                      marginRight: "auto",
                    }}
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        alert("Profile settings coming soon!");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <UserIcon className="w-4 h-4 mr-3 text-gray-400" />
                      View Profile
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        alert("Settings panel coming soon!");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-3 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Settings
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        alert("Help documentation coming soon!");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-3 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Help & Support
                    </button>

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          if (
                            window.confirm("Are you sure you want to logout?")
                          ) {
                            localStorage.clear();
                            sessionStorage.clear();
                            dispatch(logoutRequest());
                            window.location.reload();
                          }
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <svg
                          className="w-4 h-4 mr-3 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Extended state - Show user info with dropdown */
              <>
                <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center mr-3">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {user.name}
                  </div>
                  <div
                    className="text-xs text-purple-300 truncate"
                    title={user.email}
                  >
                    {user.email}
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="text-purple-400 hover:text-white transition-colors p-1 rounded-full hover:bg-purple-800"
                    title="User menu"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {/* User Menu Dropdown for Extended State */}
                  {showUserMenu && (
                    <div
                      className={
                        isOpen
                          ? "absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 overflow-hidden"
                          : `fixed bottom-16 right-4 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[60] `
                      }
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div
                          className="text-xs text-gray-500"
                          title={user.email}
                        >
                          {user.email}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          alert("Profile settings coming soon!");
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <UserIcon className="w-4 h-4 mr-3 text-gray-400" />
                        View Profile
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          alert("Settings panel coming soon!");
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <svg
                          className="w-4 h-4 mr-3 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Settings
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          alert("Help documentation coming soon!");
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <svg
                          className="w-4 h-4 mr-3 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Help & Support
                      </button>

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            if (
                              window.confirm("Are you sure you want to logout?")
                            ) {
                              localStorage.clear();
                              sessionStorage.clear();
                              dispatch(logoutRequest());
                              window.location.reload();
                            }
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <svg
                            className="w-4 h-4 mr-3 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
