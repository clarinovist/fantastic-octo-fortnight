import { SiteHeader } from "@/components/site-header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import React from "react";

type MainLayoutProps = {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: Array<{ label: string; href: string }>;
};

export function MainLayout({ children, title, breadcrumbs }: MainLayoutProps) {
  return (
    <>
      <SiteHeader
        title={title}
        breadcrumbs={breadcrumbs}
      />
      <div className="flex flex-1 flex-col">{children}</div>
    </>
  );
}
