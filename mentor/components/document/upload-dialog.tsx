"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Loader2, FileUp, X } from "lucide-react"
import { toast } from "sonner"
import { uploadDocumentAction } from "@/actions/document"

export function UploadDialog() {
    const [open, setOpen] = useState(false)
    const [isPending, startUpload] = useTransition()
    const [file, setFile] = useState<File | null>(null)
    const [type, setType] = useState("")
    const [name, setName] = useState("")

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error("Ukuran file maksimal 5MB")
                return
            }
            setFile(selectedFile)
            if (!name) {
                setName(selectedFile.name.split('.')[0])
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !type || !name) {
            toast.error("Mohon lengkapi semua field")
            return
        }

        startUpload(async () => {
            try {
                // Convert to base64
                const reader = new FileReader()
                reader.onloadend = async () => {
                    const base64String = reader.result as string
                    // Remove data URL prefix (e.g. "data:application/pdf;base64,")
                    // Actually usually backend handles full data URI or just base64? 
                    // Let's assume full data URI is safer or strip it if known backend requirement.
                    // Plan says "base64", usually implies content. But for simplicity let's send full string 
                    // and let backend parse/strip if needed, or stripping it safely.
                    // Common pattern: send full dataURI.

                    const res = await uploadDocumentAction({
                        name,
                        type,
                        file: base64String,
                    })

                    if (res.success) {
                        toast.success("Dokumen berhasil diupload")
                        setOpen(false)
                        setFile(null)
                        setName("")
                        setType("")
                    } else {
                        toast.error("Gagal mengupload dokumen")
                    }
                }
                reader.readAsDataURL(file)
            } catch {
                toast.error("Terjadi kesalahan saat memproses file")
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Dokumen
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload Dokumen Baru</DialogTitle>
                    <DialogDescription>
                        Upload dokumen pendukung seperti KTP, Ijazah, atau Sertifikat. Format PDF atau Image (max 5MB).
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="name">Nama Dokumen</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Contoh: KTP Saya"
                        />
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="type">Jenis Dokumen</Label>
                        <Select onValueChange={setType} value={type}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih jenis dokumen" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ktp">KTP / Identitas</SelectItem>
                                <SelectItem value="ijazah">Ijazah Terakhir</SelectItem>
                                <SelectItem value="sertifikat">Sertifikat Keahlian</SelectItem>
                                <SelectItem value="cv">CV / Resume</SelectItem>
                                <SelectItem value="lainnya">Lainnya</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="file">File</Label>
                        {!file ? (
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <FileUp className="w-8 h-8 mb-2 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">Klik untuk upload file</p>
                                        <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (Max 5MB)</p>
                                    </div>
                                    <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                                </label>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                                <div className="flex items-center gap-3 truncate">
                                    <FileUp className="h-4 w-4 text-primary shrink-0" />
                                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                </div>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setFile(null)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={isPending || !file}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Mengupload...
                                </>
                            ) : (
                                "Upload"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
