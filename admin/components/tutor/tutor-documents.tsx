"use client";

import {
  changeDocumentStatusAction,
  uploadTutorDocumentAction,
} from "@/actions/tutor";
import { FilePicker } from "@/components/base/file-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { FileResponse } from "@/utils/types";
import type { TutorDetail, TutorDocument } from "@/utils/types/tutor";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import TutorDocumentItem from "./tutor-document-item";

interface TutorDocumentsProps {
  documents: TutorDocument[];
  tutor: TutorDetail;
}

interface ConfirmationModal {
  isOpen: boolean;
  documentId: string | null;
  currentStatus: TutorDocument["status"] | null;
  newStatus: "active" | "inactive" | null;
  documentIndex: number | null;
}

export default function TutorDocuments({
  documents,
  tutor,
}: TutorDocumentsProps) {
  const router = useRouter();
  const [loadingDocId, setLoadingDocId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmationModal>({
    isOpen: false,
    documentId: null,
    currentStatus: null,
    newStatus: null,
    documentIndex: null,
  });

  const getStatusLabel = (status: TutorDocument["status"]) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const openChangeStatusDialog = (
    documentId: string,
    currentStatus: TutorDocument["status"],
    index: number
  ) => {
    // Determine default new status based on current status
    const defaultNewStatus = currentStatus === "active" ? "active" : "inactive";

    setConfirmModal({
      isOpen: true,
      documentId,
      currentStatus,
      newStatus: defaultNewStatus,
      documentIndex: index,
    });
  };

  const closeConfirmation = () => {
    setConfirmModal({
      isOpen: false,
      documentId: null,
      currentStatus: null,
      newStatus: null,
      documentIndex: null,
    });
  };

  const handleStatusChange = async () => {
    if (!confirmModal.documentId || !confirmModal.newStatus) return;

    setLoadingDocId(confirmModal.documentId);
    closeConfirmation();

    try {
      const result = await changeDocumentStatusAction(
        tutor.id,
        confirmModal.documentId,
        confirmModal.newStatus
      );
      if (result.success) {
        toast.success(
          `Document status changed to ${getStatusLabel(
            confirmModal.newStatus
          )} successfully`
        );
        router.refresh();
      } else {
        toast.error(result.error || "Failed to change document status");
      }
    } catch (error) {
      console.error("Error changing document status:", error);
      toast.error("An error occurred while changing document status");
    } finally {
      setLoadingDocId(null);
    }
  };

  const handleUploadDocument = async (uploadedFile: FileResponse) => {
    setIsUploading(true);
    try {
      const result = await uploadTutorDocumentAction({
        url: uploadedFile.url,
        tutorId: tutor.id,
      });

      if (result.success) {
        toast.success("Document uploaded successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to upload document");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("An error occurred while uploading document");
    } finally {
      setIsUploading(false);
    }
  };

  if (documents.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No Documents
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            No documents have been uploaded yet.
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            disabled={isUploading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {isUploading ? "Uploading..." : "Upload Document"}
          </button>
        </div>

        <FilePicker
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={handleUploadDocument}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Tutor Documents
          </h2>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            disabled={isUploading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {isUploading ? "Uploading..." : "Upload Document"}
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc, index) => (
            <TutorDocumentItem
              key={doc.id}
              document={doc}
              index={index}
              isLoading={loadingDocId === doc.id}
              onChangeStatus={openChangeStatusDialog}
            />
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      <FilePicker
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadDocument}
      />

      {/* Change Status Modal */}
      <Dialog open={confirmModal.isOpen} onOpenChange={closeConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <div className="shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
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
              </div>
              <span className="ml-3">Change Document Status</span>
            </DialogTitle>
          </DialogHeader>

          <div className="mb-6">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Current Status:</p>
              <p className="text-base font-semibold text-gray-900">
                {confirmModal.currentStatus &&
                  getStatusLabel(confirmModal.currentStatus)}
              </p>
            </div>

            <div>
              <label
                htmlFor="status-select"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select New Status
              </label>
              <select
                id="status-select"
                value={confirmModal.newStatus || ""}
                onChange={(e) =>
                  setConfirmModal({
                    ...confirmModal,
                    newStatus: e.target.value as "active" | "inactive",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a status...</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {confirmModal.newStatus && (
              <p className="mt-3 text-sm text-gray-500">
                {confirmModal.newStatus === "active"
                  ? "This document will be available to the tutor."
                  : "This document will be unavailable to the tutor."}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={closeConfirmation}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStatusChange}
              disabled={!confirmModal.newStatus}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Confirm Change
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
