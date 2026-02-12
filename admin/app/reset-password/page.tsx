"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, Lock, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { resetPasswordAction } from "@/actions/auth";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword.length < 8) {
            setError("Password minimal 8 karakter.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Password dan konfirmasi password tidak cocok.");
            return;
        }

        if (!token) {
            setError("Token reset tidak valid. Silakan minta link reset password baru.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await resetPasswordAction(token, newPassword);
            if (res.success) {
                setSuccess(true);
            } else {
                setError(res.message || "Gagal mengatur ulang password.");
            }
        } catch {
            setError("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <Card>
                <CardContent className="p-8 text-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                        <Lock className="h-8 w-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold">Invalid Token</h2>
                    <p className="text-muted-foreground">
                        Link reset password tidak valid atau sudah kadaluarsa. Silakan minta link reset password baru.
                    </p>
                    <Link href="/forgot-password">
                        <Button className="mt-4 bg-violet-600 hover:bg-violet-700">
                            Request New Link
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    if (success) {
        return (
            <Card>
                <CardContent className="p-8 text-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold">Password Updated!</h2>
                    <p className="text-muted-foreground">
                        Password Anda telah berhasil diatur ulang. Silakan login dengan password baru Anda.
                    </p>
                    <Link href="/login">
                        <Button className="mt-4 bg-violet-600 hover:bg-violet-700">
                            Go to Login
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Reset Password</h1>
                <p className="text-muted-foreground mt-2">
                    Masukkan password baru Anda. Pastikan minimal 8 karakter.
                </p>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-semibold">
                        New Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            id="newPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Minimal 8 karakter"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            className="h-12 pl-10 pr-10 rounded-xl"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-semibold">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            id="confirmPassword"
                            type={showConfirm ? "text" : "password"}
                            placeholder="Ulangi password baru"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            className="h-12 pl-10 pr-10 rounded-xl"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Resetting...
                        </>
                    ) : (
                        "Reset Password"
                    )}
                </Button>
            </form>
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-screen">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 relative overflow-hidden p-12 flex-col justify-between">
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_40%)] rotate-[30deg] pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 text-white font-bold text-2xl tracking-tight">
                        <Image
                            src="/lesprivate-logo-notext.png"
                            alt="Lesprivate"
                            width={40}
                            height={40}
                            className="object-contain brightness-0 invert"
                        />
                        Lesprivate
                    </div>
                </div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        New Password
                    </h2>
                    <p className="text-violet-100 text-lg leading-relaxed">
                        Buat password baru yang kuat untuk melindungi akun Anda.
                    </p>
                </div>
                <div className="relative z-10">
                    <p className="text-violet-200 text-sm">
                        © {new Date().getFullYear()} Lesprivate. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md">
                    <Link
                        href="/login"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Login
                    </Link>

                    <Suspense fallback={
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                        </div>
                    }>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
