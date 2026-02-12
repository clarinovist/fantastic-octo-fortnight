"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { forgotPasswordAction } from "@/actions/auth";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await forgotPasswordAction(email);
            if (res.success) {
                setSuccess(true);
            } else {
                setError(res.message || "Gagal mengirim email reset password.");
            }
        } catch {
            setError("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

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
                        Reset Password Anda
                    </h2>
                    <p className="text-violet-100 text-lg leading-relaxed">
                        Masukkan email yang terdaftar dan kami akan mengirimkan link untuk mengatur ulang password Anda.
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
                        Kembali ke Login
                    </Link>

                    {success ? (
                        <Card>
                            <CardContent className="p-8 text-center space-y-4">
                                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold">Email Terkirim!</h2>
                                <p className="text-muted-foreground">
                                    Kami telah mengirimkan link reset password ke{" "}
                                    <span className="font-semibold text-foreground">{email}</span>.
                                    Silakan cek inbox atau folder spam Anda.
                                </p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => {
                                        setSuccess(false);
                                        setEmail("");
                                    }}
                                >
                                    Kirim ulang email
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold">Forgot Password?</h1>
                                <p className="text-muted-foreground mt-2">
                                    Masukkan alamat email Anda dan kami akan mengirimkan instruksi untuk mengatur ulang password.
                                </p>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-semibold">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="admin@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            className="h-12 pl-10 rounded-xl"
                                        />
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
                                            Mengirim...
                                        </>
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
