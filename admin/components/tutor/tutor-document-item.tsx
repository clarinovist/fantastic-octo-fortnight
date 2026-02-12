"use client";

import type { TutorDocument } from "@/utils/types/tutor";

interface TutorDocumentItemProps {
  document: TutorDocument;
  index: number;
  isLoading: boolean;
  onChangeStatus: (documentId: string, currentStatus: TutorDocument["status"], index: number) => void;
}

export default function TutorDocumentItem({
  document,
  index,
  isLoading,
  onChangeStatus,
}: TutorDocumentItemProps) {
  const getStatusColor = (status: TutorDocument["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending_created":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending_deleted":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: TutorDocument["status"]) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <svg
            className="w-10 h-10 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
            document.status
          )}`}
        >
          {getStatusLabel(document.status)}
        </span>
      </div>

      <div className="space-y-2">
        <div className="pt-3 border-t border-gray-100">
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Current Status</p>
            <p className="text-sm font-medium text-gray-900">
              {getStatusLabel(document.status)}
            </p>
          </div>

          <div className="space-y-2">
            <a
              href={document.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-700 py-2 px-3 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              View Document
            </a>

            <button
              onClick={() => onChangeStatus(document.id, document.status, index)}
              disabled={isLoading}
              className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center"
            >
              {isLoading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Change Status
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}