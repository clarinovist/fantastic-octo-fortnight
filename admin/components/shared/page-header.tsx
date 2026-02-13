import { Plus, type LucideIcon } from "lucide-react";
import Link from "next/link";

type PageHeaderAction = {
    label: string;
    href: string;
    icon?: LucideIcon;
};

type PageHeaderProps = {
    title: string;
    subtitle?: string;
    action?: PageHeaderAction;
    children?: React.ReactNode;
};

export function PageHeader({ title, subtitle, action, children }: PageHeaderProps) {
    const Icon = action?.icon || Plus;

    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-muted-foreground text-base max-w-2xl">
                        {subtitle}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-3">
                {children}
                {action && (
                    <Link
                        href={action.href}
                        className="flex items-center justify-center gap-2 h-10 px-5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap"
                    >
                        <Icon className="size-5" />
                        <span>{action.label}</span>
                    </Link>
                )}
            </div>
        </div>
    );
}
