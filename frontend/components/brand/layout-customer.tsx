"use client"

import { AppSidebar } from "@/components/brand/app-sidebar"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import { TOKEN_KEY } from "@/utils/constants/cookies"
import { useEffect, useState } from "react"
import { BackButton } from "./back-button"
import { Logo } from "./logo"

export function LayoutCustomer({
  hideLogo,
  header,
  subheader,
  children,
  headerClassName,
  childrenClassName,
  wrapperHeaderChildrenClassName,
  isShowSidebar = false,
  isShowBackButton = false,
  isShowNotification = false,
  className,
  logoTypeOnSmallDevice = "notext",
  logoTypeOnMediumDevice = "full",
  humbergerMenuClassName,
  backButtonClassName,
  backButtonColorSmall,
  backButtonColorMedium,
  sidebarType,
}: Readonly<{
  hideLogo?: boolean
  header?: React.ReactNode
  subheader?: React.ReactNode
  children: React.ReactNode
  headerClassName?: string
  childrenClassName?: string
  wrapperHeaderChildrenClassName?: string
  isShowSidebar?: boolean
  isShowBackButton?: boolean
  isShowNotification?: boolean
  className?: string
  logoTypeOnSmallDevice?: "full" | "notext" | "full-white"
  logoTypeOnMediumDevice?: "full" | "notext" | "full-white"
  humbergerMenuClassName?: string
  backButtonClassName?: string
  backButtonColorSmall?: string
  backButtonColorMedium?: string
  sidebarType?: "default" | "main"
}>) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false)
  }


  useEffect(() => {
    const checkAuthStatus = () => {
      const token = document.cookie
        .split("; ")
        .find(row => row.startsWith(`${TOKEN_KEY}=`))
        ?.split("=")[1]

      setIsLoggedIn(!!token)
    }
    checkAuthStatus()
  }, [])

  return (
    <div className={cn("min-h-screen bg-white md:flex", className)}>
      {/* Desktop Sidebar */}
      {isShowSidebar && (
        <div className="hidden xl:block sticky top-0 h-screen scrollbar-hide pr-2">
          <AppSidebar
            type={sidebarType}
            isShowBackButton={isShowBackButton}
            backButtonClassName={backButtonClassName}
            backButtonColorMedium={backButtonColorMedium}
            backButtonColorSmall={backButtonColorSmall}
            isShowPremium={!isLoggedIn}
          />
        </div>
      )}

      {/* Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed xl:hidden inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed xl:hidden top-0 right-0 h-full z-50 transform transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? "-translate-x-0" : "translate-x-full"
          }`}
      >
        <AppSidebar
          type={sidebarType}
          isShowNotification={isShowNotification}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={closeMobileSidebar}
          isShowPremium={!isLoggedIn}
        />
      </div>

      <div
        className={`flex-1 flex flex-col font-lato h-screen overflow-hidden ${wrapperHeaderChildrenClassName}`}
      >
        <div className={`sticky top-0 bg-white z-10 ${headerClassName}`}>
          <div className="flex items-center justify-between md:justify-normal gap-4 mt-4 xl:px-0 px-8">
            {isShowBackButton && (
              <BackButton
                className={cn("xl:hidden")}
                fillOnMediumDevice={backButtonColorMedium}
                fillOnSmallDevice={backButtonColorSmall}
              />
            )}
            {!hideLogo && <Logo className="pl-8 hidden md:block" type={logoTypeOnMediumDevice} />}
            {!hideLogo && (
              <Logo className="block md:hidden" type={logoTypeOnSmallDevice} size="small" />
            )}
            {header}

            <button
              onClick={toggleMobileSidebar}
              className={`xl:hidden ml-auto p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 ${humbergerMenuClassName}`}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 "
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
          {subheader}
        </div>
        <div className={`flex-1 overflow-y-auto md:px-0 px-4 ${childrenClassName}`}>{children}</div>
      </div>
      <Toaster richColors />
    </div>
  )
}
