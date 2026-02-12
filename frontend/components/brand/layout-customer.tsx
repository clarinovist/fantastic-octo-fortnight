"use client"

import { AppSidebar } from "@/components/brand/app-sidebar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Toaster } from "@/components/ui/sonner"
import { useUserProfile } from "@/context/user-profile"
import { useUnreadNotifications } from "@/hooks/use-unread-notifications"
import { cn } from "@/lib/utils"
import { TOKEN_KEY } from "@/utils/constants/cookies"
import { IS_PREMIUM_ENABLED } from "@/utils/constants"
import { useEffect, useState } from "react"
import { BackButton } from "./back-button"
import { Logo } from "./logo"
import { NotificationContainer } from "./notification/notification-container"

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
  const userContext = useUserProfile()
  const user = userContext?.profile
  const { hasUnread, refetch: refetchUnread } = useUnreadNotifications()
  const isTutor = user?.role === "tutor"

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false)
  }

  const handleNotificationClick = () => {
    refetchUnread()
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
            isShowPremium={IS_PREMIUM_ENABLED && (!isTutor || !isLoggedIn)}
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
          isShowPremium={IS_PREMIUM_ENABLED && (!isTutor || !isLoggedIn)}
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
            {isShowNotification && user && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="ml-auto hidden xl:block p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 relative"
                    aria-label="Show notifications"
                    onClick={handleNotificationClick}
                  >
                    <svg
                      className="size-7"
                      xmlns="http://www.w3.org/2000/svg"
                      width="33"
                      height="39"
                      viewBox="0 0 33 39"
                      fill="none"
                    >
                      <path
                        d="M32.1232 26.4979C31.9841 26.3292 31.8475 26.1604 31.7135 25.9976C29.8702 23.7524 28.7551 22.3973 28.7551 16.0413C28.7551 12.7507 27.9734 10.0507 26.4326 8.02571C25.2965 6.52975 23.7607 5.3949 21.7365 4.55622C21.7105 4.54162 21.6872 4.52248 21.6678 4.49968C20.9398 2.04437 18.9474 0.399902 16.7003 0.399902C14.4532 0.399902 12.4617 2.04437 11.7336 4.49715C11.7142 4.51915 11.6913 4.53769 11.6658 4.552C6.94204 6.51034 4.64637 10.2676 4.64637 16.0388C4.64637 22.3973 3.53289 23.7524 1.68798 25.9951C1.55393 26.1579 1.41736 26.3233 1.27828 26.4954C0.919015 26.9317 0.691392 27.4626 0.622348 28.0251C0.553304 28.5876 0.645729 29.1583 0.888684 29.6696C1.40563 30.7665 2.50738 31.4474 3.76497 31.4474H29.6449C30.8966 31.4474 31.9908 30.7673 32.5094 29.6755C32.7534 29.1641 32.8467 28.5929 32.7783 28.0298C32.7098 27.4666 32.4825 26.935 32.1232 26.4979ZM16.7003 38.1999C17.911 38.1989 19.0989 37.868 20.1379 37.2421C21.177 36.6163 22.0284 35.7189 22.602 34.6452C22.629 34.5937 22.6424 34.5361 22.6408 34.4779C22.6391 34.4197 22.6226 34.363 22.5927 34.3131C22.5629 34.2633 22.5207 34.222 22.4704 34.1934C22.4201 34.1648 22.3632 34.1498 22.3054 34.1499H11.0969C11.039 34.1497 10.9821 34.1646 10.9316 34.1931C10.8811 34.2217 10.8389 34.2629 10.8089 34.3127C10.779 34.3626 10.7624 34.4194 10.7607 34.4777C10.759 34.536 10.7724 34.5937 10.7994 34.6452C11.373 35.7188 12.2243 36.6161 13.2632 37.2419C14.3021 37.8677 15.4897 38.1988 16.7003 38.1999Z"
                        fill="#7000FE"
                      />
                    </svg>
                    {hasUnread && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white"></div>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[350px] max-w-[90vw]">
                  <NotificationContainer className="overflow-auto" />
                </PopoverContent>
              </Popover>
            )}

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
