import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

type PaginationProps = {
    page: number;
    pageSize: number;
    total: number;
    /** Additional query params to preserve in pagination links, e.g. { q: "foo", view: "list" } */
    queryParams?: Record<string, string>;
};

export function Pagination({ page, pageSize, total, queryParams = {} }: PaginationProps) {
    const totalPages = Math.ceil(total / pageSize);
    const isFirstPage = page <= 1;
    const isLastPage = page * pageSize >= total;

    function buildHref(targetPage: number) {
        const params = new URLSearchParams({ ...queryParams, page: String(targetPage) });
        return `?${params.toString()}`;
    }

    return (
        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-card">
            <span className="text-sm text-muted-foreground">
                Showing page{" "}
                <span className="font-medium text-foreground">{page}</span> of{" "}
                <span className="font-medium text-foreground">{totalPages}</span>{" "}
                ({total} total)
            </span>
            <div className="flex gap-2">
                <Link
                    href={buildHref(page > 1 ? page - 1 : 1)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors ${isFirstPage ? "opacity-50 pointer-events-none" : ""}`}
                >
                    <ChevronLeft className="size-4" />
                    <span className="hidden sm:inline">Previous</span>
                </Link>
                <Link
                    href={buildHref(page + 1)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors ${isLastPage ? "opacity-50 pointer-events-none" : ""}`}
                >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="size-4" />
                </Link>
            </div>
        </div>
    );
}
