"use client"

import { TutorDocument } from "@/utils/types/document"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Trash2, Calendar, File, Image as ImageIcon } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import React, { useState, useTransition } from "react"
import { deleteDocumentAction } from "@/actions/document"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface DocumentCardProps {
    document: TutorDocument
}

export function DocumentCard({ document }: DocumentCardProps) {
    const [isDeleting, startDelete] = useTransition()
    const [open, setOpen] = useState(false)

    const handleDelete = () => {
        startDelete(async () => {
            const res = await deleteDocumentAction(document.id)
            if (res.success) {
                toast.success("Dokumen berhasil dihapus")
                setOpen(false)
            } else {
                toast.error("Gagal menghapus dokumen")
            }
        })
    }

    const getIcon = () => {
        const type = (document.type || "").toLowerCase()
        const urlStr = (document.url || "").toLowerCase()
        if (type.includes("image") || type === "ktp" || type === "foto" || urlStr.match(/\.(jpeg|jpg|gif|png)$/)) return <ImageIcon className="h-8 w-8 text-blue-500" />
        if (type.includes("pdf") || urlStr.endsWith(".pdf")) return <FileText className="h-8 w-8 text-red-500" />
        return <File className="h-8 w-8 text-gray-500" />
    }

    return (
        <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="p-4 flex items-start gap-4">
                <div className="p-3 bg-muted rounded-lg">
                    {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <a href={document.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        <h4 className="font-semibold text-sm truncate" title={document.name || "Dokumen"}>
                            {document.name || document.url?.split('/').pop() || "Dokumen"}
                        </h4>
                    </a>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                        {(document.type || "Lainnya").replace(/_/g, " ")}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                            {document.created_at ? format(new Date(document.created_at), "d MMMM yyyy", { locale: id }) : "-"}
                        </span>
                    </div>
                </div>
                <AlertDialog open={open} onOpenChange={setOpen}>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Dokumen?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus dokumen <b>{document.name}</b>? Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={(e: React.MouseEvent) => { e.preventDefault(); handleDelete(); }} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Hapus"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    )
}
