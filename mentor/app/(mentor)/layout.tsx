import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { GoogleMapsProvider } from "@/contexts/google-maps";

export default function MentorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <GoogleMapsProvider>
            <SidebarProvider>
                <div className="flex min-h-screen w-full">
                    <AppSidebar />
                    <main className="flex-1 flex flex-col overflow-x-hidden">
                        <div className="w-full max-w-[1600px] mx-auto flex-1 flex flex-col">
                            {children}
                        </div>
                    </main>
                </div>
            </SidebarProvider>
        </GoogleMapsProvider>
    );
}
