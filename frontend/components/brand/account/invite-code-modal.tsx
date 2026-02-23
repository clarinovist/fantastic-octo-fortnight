"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { submitInviteCodeAction } from "@/actions/account"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export function InviteCodeModal() {
    const [open, setOpen] = useState(false)
    const [code, setCode] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!code.trim()) return

        setLoading(true)
        const result = await submitInviteCodeAction(code)

        if (result?.success === false) {
            alert("Gagal Menghubungkan: " + result.message);
        } else {
            alert("Berhasil: Anda telah terhubung dengan Mentor.");
            setOpen(false)
            setCode("")
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="text-blue-600 font-medium cursor-pointer">
                    MASUKKAN KODE MENTOR
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Masukkan Kode Undangan Mentor</DialogTitle>
                    <DialogDescription>
                        Hubungkan akun kamu dengan mentor menggunakan kode undangan yang diberikan oleh mentor.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                    <Input
                        placeholder="Masukkan kode unik dari mentor"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        disabled={loading}
                    />
                    <Button type="submit" disabled={!code.trim() || loading} className="w-full bg-[#1A1A1A] hover:bg-[#333]">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Gunakan Kode"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
