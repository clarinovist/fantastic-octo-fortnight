import { Toaster } from "sonner"
import { UserProfileProvider } from "@/context/user-profile"

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <UserProfileProvider>
      {children}
      <Toaster richColors closeButton />
    </UserProfileProvider>
  )
}
