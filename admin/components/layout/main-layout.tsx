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
      <SiteHeader title={title} />
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="pt-4 px-4">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={crumb.href ?? crumb.label}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={crumb.href}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}
      <div className="flex flex-1 flex-col">{children}</div>
    </>
  );
}
