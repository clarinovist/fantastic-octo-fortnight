"use client";

import Link from "next/link";
import Image from "next/image";
import { GlobalSearch } from "@/components/mentor/global-search";
import { NotificationDropdown } from "@/components/mentor/notification-dropdown";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface PageHeaderProps {
    breadcrumbs: BreadcrumbItem[];
    actions?: React.ReactNode;
}

export function PageHeader({ breadcrumbs, actions }: PageHeaderProps) {
    return (
        <header className="h-16 bg-background border-b flex items-center justify-between px-6 lg:px-8 flex-shrink-0">
            <nav aria-label="Breadcrumb" className="flex">
                <ol className="flex items-center space-x-2">
                    <li>
                        <Link href="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
                            <Image
                                src="/lesprivate-logo-notext.png"
                                alt="Home"
                                width={20}
                                height={20}
                                className="object-contain"
                            />
                        </Link>
                    </li>
                    {breadcrumbs.map((crumb, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                            <span className="text-muted-foreground">/</span>
                            {crumb.href ? (
                                <Link href={crumb.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className="text-sm font-medium">{crumb.label}</span>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>
            <div className="flex items-center gap-4">
                {actions}
                <GlobalSearch />
                <NotificationDropdown />
            </div>
        </header>
    );
}
