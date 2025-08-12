import React from "react";

interface Page {
  id: number;
  content: string;
  pageNumber: number;
}

interface ThumbnailPanelProps {
  activeTab: "thumbnail" | "index" | "search";
  setActiveTab: React.Dispatch<
    React.SetStateAction<"thumbnail" | "index" | "search">
  >;
  pages?: Page[];
  currentPage?: number;
  onPageSelect?: (pageNumber: number) => void;
  searchResults?: Array<{
    id: string;
    text: string;
    pageNumber: number;
    context: string;
  }>;
  onSearch?: (query: string) => void;
  tableOfContents?: Array<{
    id: string;
    title: string;
    level: number;
    pageNumber: number;
  }>;
}

const ThumbnailPanel: React.FC<ThumbnailPanelProps> = ({
  activeTab,
  setActiveTab,
  pages = [],
  currentPage = 1,
  onPageSelect,
  searchResults = [],
  onSearch,
  tableOfContents = [],
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");

  const tabs = [
    { id: "thumbnail" as const, label: "Thumbnail" },
    { id: "index" as const, label: "Index" },
    { id: "search" as const, label: "Search" },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  // Extract text content from HTML for thumbnail preview
  const getTextPreview = (htmlContent: string, maxLength: number = 200) => {
    const div = document.createElement("div");
    div.innerHTML = htmlContent;
    const text = div.textContent || div.innerText || "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Generate bullet points for thumbnail preview
  const generateThumbnailPreview = (content: string) => {
    const text = getTextPreview(content, 300);
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10);
    return sentences.slice(0, 5).map((sentence) => sentence.trim());
  };

  // Extract headings for table of contents if not provided
  const extractTableOfContents = () => {
    if (tableOfContents.length > 0) return tableOfContents;

    const extractedTOC: typeof tableOfContents = [];

    pages.forEach((page, pageIndex) => {
      const div = document.createElement("div");
      div.innerHTML = page.content;

      const headings = div.querySelectorAll("h1, h2, h3, h4, h5, h6");
      headings.forEach((heading, headingIndex) => {
        const level = parseInt(heading.tagName.charAt(1));
        const title = heading.textContent || `Heading ${headingIndex + 1}`;

        extractedTOC.push({
          id: `${pageIndex}-${headingIndex}`,
          title,
          level,
          pageNumber: page.pageNumber,
        });
      });
    });

    return extractedTOC;
  };

  const dynamicTOC = extractTableOfContents();

  return (
    <div
      className="flex flex-col h-full bg-gray-50"
      style={{ width: "100%", maxWidth: "280px" }}
    >
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 bg-white">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-2 py-2 text-xs font-medium transition-colors 
    focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0
    ${
      activeTab === tab.id
        ? "text-blue-600 border-b-2 border-blue-600 bg-gray-50"
        : "text-gray-500 hover:text-gray-700"
    }`}
            style={{
              outline: "none",
              outlineOffset: 0,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === "thumbnail" && (
          <div className="space-y-3">
            {pages.length === 0 ? (
              <div className="text-xs text-gray-500 text-center py-8">
                No pages to display
              </div>
            ) : (
              pages.map((page) => {
                const previewText = generateThumbnailPreview(page.content);
                const isSelected = page.pageNumber === currentPage;

                return (
                  <div
                    key={page.id}
                    onClick={() =>
                      onPageSelect && onPageSelect(page.pageNumber)
                    }
                    className={`relative bg-white border rounded-lg shadow-sm cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? "ring-2 ring-blue-500" : "border-gray-200"
                    }`}
                  >
                    <div className="aspect-[3/4] p-2">
                      <div className="w-full h-full bg-white border border-gray-100 rounded flex flex-col overflow-hidden">
                        {/* Document preview content */}
                        <div className="p-2 text-xs text-gray-600 space-y-1 flex-1">
                          <div className="font-semibold mb-1 text-[10px] truncate">
                            {page.content.includes("<h1>")
                              ? (() => {
                                  const div = document.createElement("div");
                                  div.innerHTML = page.content;
                                  const h1 = div.querySelector("h1");
                                  return (
                                    h1?.textContent?.substring(0, 20) + "..." ||
                                    "Page Content"
                                  );
                                })()
                              : `Page ${page.pageNumber}`}
                          </div>

                          {/* Preview text as bullet points */}
                          <div className="space-y-0.5 text-[9px] leading-tight">
                            {previewText.length > 0 ? (
                              previewText.map((line, index) => (
                                <div key={index} className="truncate">
                                  • {line.substring(0, 40)}
                                  {line.length > 40 ? "..." : ""}
                                </div>
                              ))
                            ) : (
                              <div className="text-gray-400 italic">
                                Empty page
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Page number badge */}
                    <div className="absolute bottom-1 right-1 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded">
                      {page.pageNumber}
                    </div>

                    {/* Current page indicator */}
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "index" && (
          <div className="text-sm text-gray-600">
            <div className="space-y-2">
              <div className="font-medium text-xs">Table of Contents</div>
              {dynamicTOC.length === 0 ? (
                <div className="text-xs text-gray-400 italic py-4">
                  No headings found in document
                </div>
              ) : (
                <ul className="space-y-1 text-xs">
                  {dynamicTOC.map((item) => (
                    <li
                      key={item.id}
                      onClick={() =>
                        onPageSelect && onPageSelect(item.pageNumber)
                      }
                      className={`cursor-pointer hover:text-blue-600 transition-colors ${
                        item.level === 1
                          ? "font-medium"
                          : item.level === 2
                          ? "pl-2"
                          : item.level === 3
                          ? "pl-4"
                          : "pl-6"
                      }`}
                      style={{
                        paddingLeft: `${(item.level - 1) * 8}px`,
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="truncate flex-1 mr-1">
                          {item.title}
                        </span>
                        <span className="text-gray-400 text-[10px] flex-shrink-0">
                          {item.pageNumber}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {activeTab === "search" && (
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search document..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.9 14.32a8 8 0 111.414-1.414l4.287 4.287a1 1 0 01-1.414 1.414l-4.287-4.287zM8 14A6 6 0 108 2a6 6 0 000 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Search Results */}
            <div className="space-y-2">
              {searchQuery.trim() === "" ? (
                <div className="text-xs text-gray-500">
                  Enter search terms to find content
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-xs text-gray-500">
                  No results found for "{searchQuery}"
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-700">
                    {searchResults.length} result
                    {searchResults.length !== 1 ? "s" : ""} found
                  </div>
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      onClick={() =>
                        onPageSelect && onPageSelect(result.pageNumber)
                      }
                      className="bg-white border border-gray-200 rounded p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-medium text-blue-600">
                          Page {result.pageNumber}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 leading-relaxed">
                        {result.context}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThumbnailPanel;
