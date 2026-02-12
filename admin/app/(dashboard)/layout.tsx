import { AppSidebar } from "@/components/app-sidebar";
<<<<<<< HEAD
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { GoogleMapsProvider } from "@/contexts/google-maps";

export default function DashboardLayout({
=======
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { GoogleMapsProvider } from "@/contexts/google-maps";
import { Bell, ChevronRight, Moon, Search } from "lucide-react";
import { getBookings } from "@/services/booking";

export default async function DashboardLayout({
>>>>>>> 1a19ced (chore: update service folders from local)
  children,
}: {
  children: React.ReactNode;
}) {
<<<<<<< HEAD
=======
  const { metadata: bookingsMetadata } = await getBookings({
    page: 1,
    pageSize: 1,
  });

>>>>>>> 1a19ced (chore: update service folders from local)
  return (
    <GoogleMapsProvider>
      <SidebarProvider
        style={
          {
<<<<<<< HEAD
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>{children}</SidebarInset>
=======
            "--sidebar-width": "18rem", // 72 * 0.25rem = 18rem
            "--header-height": "4rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" bookingsCount={bookingsMetadata?.total} />
        <SidebarInset className="bg-muted/10 relative">
          <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl transition-all">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-2 md:hidden" />
              <nav className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">Home</a>
                <ChevronRight className="size-4 text-muted-foreground/50" />
                <span className="font-medium text-foreground">Dashboard</span>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Search className="size-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search..."
                  className="h-10 w-64 rounded-xl border border-input bg-background pl-10 pr-12 text-sm text-foreground placeholder-muted-foreground focus:border-violet-600 focus:ring-1 focus:ring-violet-600 focus:outline-none transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <kbd className="inline-flex items-center rounded border border-input bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </div>
              </div>

              <div className="h-6 w-px bg-border mx-2 hidden sm:block"></div>

              <button className="relative rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <Bell className="size-5" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-violet-600 ring-2 ring-background"></span>
              </button>

              <button className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <Moon className="size-5" />
              </button>
            </div>
          </header>
          <main className="flex-1 overflow-hidden p-6 md:p-10">
            {children}
          </main>
        </SidebarInset>
>>>>>>> 1a19ced (chore: update service folders from local)
      </SidebarProvider>
    </GoogleMapsProvider>
  );
}
