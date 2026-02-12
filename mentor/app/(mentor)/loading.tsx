import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
            <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-violet-600 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">Memuat halaman...</p>
            </div>
        </div>
    );
}
