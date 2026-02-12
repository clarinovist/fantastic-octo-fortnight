"use client"

import { PageHeader } from "@/components/layout/page-header"
import { getTutorDocuments } from "@/services/document"
import useSWR from "swr"
import { UploadDialog } from "@/components/document/upload-dialog"
import { DocumentCard } from "@/components/document/document-card"
import { Loader2, FileText } from "lucide-react"

export default function DocumentsPage() {
    const { data: documentsRes, isLoading } = useSWR("/v1/tutors/documents", getTutorDocuments)
    const documents = documentsRes?.data || []

    return (
        <>
            <PageHeader
                breadcrumbs={[{ label: "Dokumen Saya" }]}
                actions={<UploadDialog />}
            />

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-7xl mx-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground mt-2">Memuat dokumen...</p>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/10">
                            <div className="bg-muted/30 p-4 rounded-full inline-flex mb-4">
                                <FileText className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">Belum ada dokumen</h3>
                            <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
                                Upload dokumen penting Anda seperti KTP, Ijazah, dan Sertifikat untuk verifikasi akun.
                            </p>
                            <div className="mt-6">
                                <UploadDialog />
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {documents.map((doc) => (
                                <DocumentCard key={doc.id} document={doc} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
