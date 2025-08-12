import React from "react";
import {
  DocumentArrowDownIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  PrinterIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAs: () => void;
  onExportHTML: () => void;
  onExportJSON: () => void;
  onExportText: () => void;
  onExportPDF: () => void;
  documentTitle: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onSaveAs,
  onExportHTML,
  onExportJSON,
  onExportText,
  onExportPDF,
  documentTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Save & Export Options
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Save Options
            </h3>
            <button
              onClick={() => {
                onSaveAs();
                onClose();
              }}
              className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
            >
              <DocumentTextIcon className="w-5 h-5 text-indigo-500" />
              <div>
                <div className="font-medium text-gray-900">
                  Save As New Document
                </div>
                <div className="text-sm text-gray-500">
                  Create a copy with a new name
                </div>
              </div>
            </button>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Export Options
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  onExportHTML();
                  onClose();
                }}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
              >
                <CodeBracketIcon className="w-5 h-5 text-green-500" />
                <div>
                  <div className="font-medium text-gray-900">
                    Export as HTML
                  </div>
                  <div className="text-sm text-gray-500">
                    Web-compatible format with styling
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  onExportJSON();
                  onClose();
                }}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
              >
                <DocumentArrowDownIcon className="w-5 h-5 text-yellow-500" />
                <div>
                  <div className="font-medium text-gray-900">
                    Export as JSON
                  </div>
                  <div className="text-sm text-gray-500">
                    Structured data with metadata
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  onExportText();
                  onClose();
                }}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
              >
                <DocumentTextIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium text-gray-900">
                    Export as Text
                  </div>
                  <div className="text-sm text-gray-500">Plain text format</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onExportPDF();
                  onClose();
                }}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
              >
                <PrinterIcon className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="font-medium text-gray-900">Export as PDF</div>
                  <div className="text-sm text-gray-500">
                    Print-ready document
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-gray-50 rounded-b-lg">
          <p className="text-xs text-gray-500">
            Current document:{" "}
            <span className="font-medium">{documentTitle}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
