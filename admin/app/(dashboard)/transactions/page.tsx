import { Card } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function TransactionsPage() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <Card className="max-w-md w-full p-12 text-center">
                <div className="flex justify-center mb-6">
                    <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-6">
                        <Construction className="w-16 h-16 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                    Coming Soon
                </h1>
                <p className="text-slate-600 dark:text-slate-300 mb-2">
                    The Transactions page is currently under development.
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    We&apos;re working hard to bring you this feature soon!
                </p>
            </Card>
        </div>
    );
}
