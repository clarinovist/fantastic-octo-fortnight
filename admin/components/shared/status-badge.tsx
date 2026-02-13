import { type ReactNode } from "react";

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    // Positive states
    active: { bg: "bg-emerald-100 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-500/20", dot: "bg-emerald-500" },
    accepted: { bg: "bg-emerald-100 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-500/20", dot: "bg-emerald-500" },
    approved: { bg: "bg-emerald-100 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-500/20", dot: "bg-emerald-500" },
    completed: { bg: "bg-emerald-100 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-500/20", dot: "bg-emerald-500" },
    verified: { bg: "bg-emerald-100 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-500/20", dot: "bg-emerald-500" },

    // Warning/Pending states
    pending: { bg: "bg-amber-100 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-900/30", dot: "bg-amber-500" },
    "waiting for approval": { bg: "bg-amber-100 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-900/30", dot: "bg-amber-500" },
    draft: { bg: "bg-slate-100 dark:bg-slate-700/30", text: "text-slate-600 dark:text-slate-400", border: "border-slate-200 dark:border-slate-700/50", dot: "bg-slate-400" },

    // Negative states
    rejected: { bg: "bg-red-100 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-900/30", dot: "bg-red-500" },
    declined: { bg: "bg-red-100 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-900/30", dot: "bg-red-500" },
    failed: { bg: "bg-red-100 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-900/30", dot: "bg-red-500" },
    cancelled: { bg: "bg-red-100 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-900/30", dot: "bg-red-500" },
    expired: { bg: "bg-red-100 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-900/30", dot: "bg-red-500" },

    // Neutral / inactive
    inactive: { bg: "bg-slate-100 dark:bg-slate-700/30", text: "text-slate-600 dark:text-slate-400", border: "border-slate-200 dark:border-slate-700/50", dot: "bg-slate-400" },
};

const DEFAULT_STYLE = { bg: "bg-slate-100 dark:bg-slate-700/30", text: "text-slate-600 dark:text-slate-400", border: "border-slate-200 dark:border-slate-700/50", dot: "bg-slate-400" };

type StatusBadgeProps = {
    status: string;
    /** Override displayed text (default: capitalize status) */
    label?: ReactNode;
    /** Show dot indicator (default: true) */
    showDot?: boolean;
};

export function StatusBadge({ status, label, showDot = true }: StatusBadgeProps) {
    const key = status.toLowerCase();
    const style = STATUS_STYLES[key] || DEFAULT_STYLE;
    const displayText = label || (status.charAt(0).toUpperCase() + status.slice(1));

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}
        >
            {showDot && (
                <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
            )}
            {displayText}
        </span>
    );
}
