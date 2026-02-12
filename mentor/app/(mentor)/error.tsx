"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Mentor Portal Error:", error);
    }, [error]);

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-slate-50/50 dark:bg-slate-900/50">
            <Card className="max-w-md p-8 text-center shadow-lg">
                <div className="mb-6">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Terjadi Kesalahan</h2>
                    <p className="text-muted-foreground mb-2">
                        {error.message || "Mohon maaf, terjadi kesalahan yang tidak terduga."}
                    </p>
                    {error.digest && (
                        <p className="text-xs text-muted-foreground font-mono mt-2">
                            Error ID: {error.digest}
                        </p>
                    )}
                </div>
                <div className="space-y-2">
                    <Button onClick={reset} className="w-full bg-violet-600 hover:bg-violet-700">
                        Coba Lagi
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.location.href = "/dashboard"}
                        className="w-full"
                    >
                        Kembali ke Dashboard
                    </Button>
                </div>
            </Card>
        </div>
    );
}
