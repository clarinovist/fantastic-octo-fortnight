"use client"

import { logoutAction } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { useUserProfile } from "@/context/user-profile"
<<<<<<< HEAD
import { useUnreadNotifications } from "@/hooks/use-unread-notifications"
=======
>>>>>>> 1a19ced (chore: update service folders from local)
import { TOKEN_KEY } from "@/utils/constants/cookies"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { BackButton } from "./back-button"
<<<<<<< HEAD
import { NotificationContainer } from "./notification/notification-container"
=======
>>>>>>> 1a19ced (chore: update service folders from local)

interface AppSidebarProps {
  className?: string
  isShowBackButton?: boolean
  isMobileOpen?: boolean
  isShowNotification?: boolean
  backButtonClassName?: string
  backButtonColorSmall?: string
  backButtonColorMedium?: string
  type?: "default" | "main"
  isShowPremium?: boolean
  onMobileClose?: () => void
}

// Convert to a proper React component
const MenuPremium = ({
  isExpanded,
  type,
  className,
}: {
  isExpanded: boolean
  type: "default" | "main"
  className?: string
}) => {
  return (
    <div className={`w-full px-2 ${className}`}>
      <Link href="/plans">
        <Button
          variant="ghost"
          size="sm"
<<<<<<< HEAD
          className={`w-full flex ${
            isExpanded ? "flex-row" : "flex-col"
          } items-center gap-2 h-auto py-3 px-4 ${type === "main" ? "xl:text-main text-white" : "text-white hover:text-white hover:bg-main-lighten"}`}
=======
          className={`w-full flex ${isExpanded ? "flex-row" : "flex-col"
            } items-center gap-2 h-auto py-3 px-4 ${type === "main" ? "xl:text-main text-white" : "text-white hover:text-white hover:bg-main-lighten"}`}
>>>>>>> 1a19ced (chore: update service folders from local)
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            className="size-8"
          >
            <g clipPath="url(#clip0_2303_3772)">
              <circle cx="20" cy="20" r="20" fill="#EEB600" />
              <path
                d="M19.9999 10.9492C19.8351 10.9491 19.673 10.9913 19.5295 11.0716C19.386 11.152 19.2658 11.2677 19.1808 11.4077L15.0889 18.1492L9.05436 14.26C8.90003 14.1607 8.72008 14.1077 8.53611 14.1073C8.35215 14.107 8.17199 14.1593 8.01728 14.258C7.86258 14.3567 7.7399 14.4976 7.66399 14.6638C7.58808 14.8299 7.56216 15.0143 7.58935 15.1947L9.50023 27.8263C9.53412 28.0508 9.64819 28.2558 9.82168 28.4039C9.99516 28.5521 10.2165 28.6335 10.4455 28.6334H29.5543C29.7833 28.6335 30.0047 28.5521 30.1781 28.4039C30.3516 28.2558 30.4657 28.0508 30.4996 27.8263L32.4105 15.1947C32.4377 15.0143 32.4117 14.8299 32.3358 14.6638C32.2599 14.4976 32.1372 14.3567 31.9825 14.258C31.8278 14.1593 31.6477 14.107 31.4637 14.1073C31.2797 14.1077 31.0998 14.1607 30.9455 14.26L24.9109 18.1492L20.819 11.409C20.7341 11.2688 20.6141 11.1527 20.4705 11.0722C20.327 10.9916 20.1649 10.9492 19.9999 10.9492Z"
                fill="white"
              />
              <path
                d="M19.3832 1.26185C18.9182 1.25369 18.5344 1.62416 18.5263 2.08915C18.5181 2.55415 18.8886 2.93789 19.3536 2.94606C23.8979 3.02579 27.5883 5.0328 30.3774 7.55503C33.1746 10.0846 35.0221 13.096 35.856 15.0641C36.0375 15.4923 36.5318 15.6924 36.9601 15.511C37.3883 15.3296 37.5884 14.8352 37.407 14.407C36.4866 12.2347 34.5025 9.01478 31.5069 6.30585C28.5031 3.58949 24.4388 1.35055 19.3832 1.26185Z"
                fill="white"
              />
              <circle cx="37.8948" cy="17.6859" r="0.842105" fill="white" />
            </g>
            <defs>
              <clipPath id="clip0_2303_3772">
                <rect width="40" height="40" fill="white" />
              </clipPath>
            </defs>
          </svg>
          <span className="text-lg font-gochi-hand transition-opacity duration-300 opacity-100">
            Premium
          </span>
        </Button>
      </Link>
    </div>
  )
}

export function AppSidebar(props: AppSidebarProps) {
  const router = useRouter()
  const user = useUserProfile()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
<<<<<<< HEAD
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const { hasUnread, refetch: refetchUnread } = useUnreadNotifications()
=======
>>>>>>> 1a19ced (chore: update service folders from local)
  const [isMobile, setIsMobile] = useState(false)

  // Check if user is logged in by checking for token in cookies
  useEffect(() => {
    const checkAuthStatus = () => {
      // Check for token in cookies
      const token = document.cookie
        .split("; ")
        .find(row => row.startsWith(`${TOKEN_KEY}=`))
        ?.split("=")[1]

      setIsLoggedIn(!!token)
    }

    checkAuthStatus()

    // Optional: Listen for storage events if you want to sync across tabs
    window.addEventListener("storage", checkAuthStatus)

    return () => {
      window.removeEventListener("storage", checkAuthStatus)
    }
  }, [])

  // Check screen size for mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1280) // xl breakpoint is 1280px
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded)
  }

  const handleMobileClose = () => {
    if (props.onMobileClose) {
      props.onMobileClose()
    }
  }

<<<<<<< HEAD
  const handleNotificationClick = () => {
    setIsNotificationOpen(true)
    refetchUnread() // Refresh unread count when opening notifications
  }

  const handleNotificationClose = () => {
    setIsNotificationOpen(false)
  }
=======
>>>>>>> 1a19ced (chore: update service folders from local)

  const handleLogout = async () => {
    user?.resetProfile()
    await logoutAction()
    setTimeout(() => {
      setIsLoggedIn(false) // Update state immediately after logout
      router.push("/login")
    }, 500)
  }

  // Helper function to get fill color
  const getFillColor = () => {
    if (isMobile) return "white"
    return props.type === "main" ? "#7000FE" : "white"
  }

  return (
    <>
      <div
        className={`${isExpanded ? "w-screen xl:w-[182px]" : "xl:w-[96px] w-screen"} xl:rounded-lg transition-all duration-300 ease-in-out bg-main flex flex-col xl:my-10 xl:ml-4 items-center py-6 relative my-0 ml-0 xl:h-[92%] h-full ${props.type === "main" ? "xl:bg-white" : "bg-main"} ${props.className}`}
      >
        {/* Close Button for Mobile */}
        <div className="xl:hidden block w-full px-6 pb-6">
          <div className="flex justify-between items-center">
<<<<<<< HEAD
            {props.isShowNotification && (
              <button
                onClick={handleNotificationClick}
                className="xl:hidden p-2 rounded-full transition-colors duration-200 relative"
                aria-label="Show notifications"
              >
                <svg
                  className="size-7"
                  xmlns="http://www.w3.org/2000/svg"
                  width="23"
                  height="27"
                  viewBox="0 0 23 27"
                  fill="none"
                >
                  <path
                    d="M22.5165 18.6415C22.4171 18.5209 22.3196 18.4004 22.2238 18.2841C20.9072 16.6803 20.1107 15.7124 20.1107 11.1725C20.1107 8.82201 19.5523 6.89344 18.4518 5.44701C17.6403 4.37846 16.5433 3.56786 15.0975 2.96879C15.0788 2.95837 15.0622 2.9447 15.0484 2.92842C14.5283 1.17462 13.1052 0 11.5001 0C9.89509 0 8.47257 1.17462 7.95252 2.92661C7.93866 2.94232 7.92227 2.95556 7.90404 2.96578C4.52996 4.3646 2.8902 7.04833 2.8902 11.1706C2.8902 15.7124 2.09485 16.6803 0.777058 18.2823C0.681306 18.3986 0.583758 18.5167 0.484414 18.6396C0.227798 18.9513 0.0652103 19.3305 0.0158932 19.7323C-0.0334239 20.1341 0.0325937 20.5417 0.206133 20.9069C0.575379 21.6904 1.36235 22.1768 2.26062 22.1768H20.7463C21.6403 22.1768 22.4219 21.691 22.7924 20.9111C22.9667 20.5458 23.0333 20.1379 22.9844 19.7356C22.9355 19.3333 22.7731 18.9536 22.5165 18.6415ZM11.5001 27C12.3649 26.9993 13.2134 26.7629 13.9556 26.3159C14.6978 25.8688 15.3059 25.2279 15.7157 24.4609C15.735 24.4242 15.7445 24.383 15.7433 24.3414C15.7422 24.2999 15.7304 24.2593 15.709 24.2237C15.6877 24.1881 15.6576 24.1587 15.6216 24.1382C15.5857 24.1178 15.5451 24.1071 15.5038 24.1071H7.49769C7.45635 24.107 7.41568 24.1176 7.37964 24.138C7.34359 24.1584 7.31341 24.1878 7.29202 24.2235C7.27062 24.2591 7.25876 24.2997 7.25757 24.3413C7.25638 24.3829 7.26591 24.4241 7.28524 24.4609C7.6949 25.2278 8.303 25.8687 9.04506 26.3157C9.78711 26.7627 10.6355 26.9992 11.5001 27Z"
                    fill="white"
                  />
                </svg>
                {hasUnread && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white"></div>
                )}
              </button>
            )}
=======
>>>>>>> 1a19ced (chore: update service folders from local)
            <button
              onClick={handleMobileClose}
              className="w-8 h-8 ml-auto bg-transparent rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all duration-200"
              aria-label="Close sidebar"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Back Button */}
        {props.isShowBackButton && (
          <BackButton
            className={props.backButtonClassName}
            fillOnMediumDevice={props.backButtonColorMedium}
            fillOnSmallDevice={props.backButtonColorSmall}
          />
        )}

        {isLoggedIn && (
          <>
            {/* Home Button */}
            <div className="mb-6 w-full px-2">
              <Link href="/">
                <Button
                  variant="ghost"
<<<<<<< HEAD
                  className={`w-full flex ${
                    isExpanded ? "flex-row" : "flex-col"
                  } items-center gap-2 h-auto py-3 px-4 ${props.type === "main" ? "xl:text-main text-white" : "text-white hover:text-white hover:bg-main-lighten"}`}
=======
                  className={`w-full flex ${isExpanded ? "flex-row" : "flex-col"
                    } items-center gap-2 h-auto py-3 px-4 ${props.type === "main" ? "xl:text-main text-white" : "text-white hover:text-white hover:bg-main-lighten"}`}
>>>>>>> 1a19ced (chore: update service folders from local)
                >
                  <svg
                    className="size-8"
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="34"
                    viewBox="0 0 40 34"
                    fill="none"
                  >
                    <path
                      d="M20.0001 0C20.9376 7.40183e-06 21.8568 0.264611 22.6547 0.762878L28.1348 4.19171C28.1698 4.21041 28.2048 4.22958 28.2389 4.25103L30.1188 5.43407L33.5595 7.58759C33.6791 7.6592 33.7954 7.73549 33.9078 7.81662L39.204 11.1499C39.9943 11.6474 40.2372 12.6993 39.746 13.4995C39.2548 14.2996 38.2156 14.545 37.4251 14.0482L35.9033 13.0909L33.1543 29.7506C32.9642 30.9374 32.3684 32.0194 31.4697 32.8054C30.5128 33.5794 29.3238 34.0009 28.099 34C26.9385 34 25.9977 33.0476 25.9977 31.8728V20.3753C25.9977 18.5116 24.5054 17.0008 22.6644 17.0008H17.5343C15.6933 17.0008 14.201 18.5116 14.201 20.3753V31.6718C14.201 32.9576 13.1713 34 11.9012 34C10.7171 33.9893 9.5743 33.5569 8.67202 32.7807C7.76974 32.0043 7.16432 30.932 6.96305 29.7506L4.20265 13.0217L2.57506 14.0482C1.78458 14.5454 0.74548 14.2996 0.254111 13.4995C-0.237216 12.6991 0.00551367 11.6473 0.796099 11.1499L6.13298 7.79026C6.22751 7.71944 6.32469 7.65183 6.42432 7.58759L11.1785 4.61517L11.7596 4.25103C11.7713 4.24364 11.7835 4.23668 11.7954 4.22961L17.3455 0.762878C18.1433 0.264654 19.0626 4.09279e-05 20.0001 0Z"
                      fill={getFillColor()}
                    />
                  </svg>
                  <span className="text-lg font-gochi-hand transition-opacity duration-300 opacity-100">
                    Home
                  </span>
                </Button>
              </Link>
            </div>

            {/* Profile Button */}
            <div className="mb-6 w-full px-2">
              <Link href="/account">
                <Button
                  variant="ghost"
<<<<<<< HEAD
                  className={`w-full flex ${
                    isExpanded ? "flex-row" : "flex-col"
                  } items-center gap-2 h-auto py-3 px-4 ${props.type === "main" ? "xl:text-main text-white" : "text-white hover:text-white hover:bg-main-lighten"}`}
=======
                  className={`w-full flex ${isExpanded ? "flex-row" : "flex-col"
                    } items-center gap-2 h-auto py-3 px-4 ${props.type === "main" ? "xl:text-main text-white" : "text-white hover:text-white hover:bg-main-lighten"}`}
>>>>>>> 1a19ced (chore: update service folders from local)
                >
                  <svg
                    className="size-8"
                    xmlns="http://www.w3.org/2000/svg"
                    width="33"
                    height="40"
                    viewBox="0 0 33 40"
                    fill="none"
                  >
                    <path
                      d="M16.5884 0C14.4823 0 12.4624 0.842855 10.9731 2.34315C9.48389 3.84344 8.64723 5.87827 8.64723 8C8.64723 10.1217 9.48389 12.1566 10.9731 13.6569C12.4624 15.1571 14.4823 16 16.5884 16C18.6945 16 20.7144 15.1571 22.2037 13.6569C23.6929 12.1566 24.5296 10.1217 24.5296 8C24.5296 5.87827 23.6929 3.84344 22.2037 2.34315C20.7144 0.842855 18.6945 0 16.5884 0ZM26.5149 20H6.66194C5.08234 20 3.56744 20.6321 2.45049 21.7574C1.33355 22.8826 0.706055 24.4087 0.706055 26C0.706055 30.464 2.52855 34.04 5.51841 36.46C8.46061 38.84 12.4074 40 16.5884 40C20.7694 40 24.7162 38.84 27.6584 36.46C30.6443 34.04 32.4708 30.464 32.4708 26C32.4708 24.4087 31.8433 22.8826 30.7263 21.7574C29.6094 20.6321 28.0945 20 26.5149 20Z"
                      fill={getFillColor()}
                    />
                  </svg>
                  <span className="text-lg font-gochi-hand transition-opacity duration-300 opacity-100">
                    Profile
                  </span>
                </Button>
              </Link>
            </div>

            {/* Premium */}
            {props.isShowPremium && (
              <MenuPremium isExpanded={isExpanded} type={props.type || "default"} />
            )}
          </>
        )}

        {/* Login Button - Only show when NOT logged in */}
        {!isLoggedIn && (
          <div className="mt-16 xl:mt-12 mb-6 w-full px-2">
            <Link href="/login">
              <Button
                variant="ghost"
<<<<<<< HEAD
                className={`w-full flex ${
                  isExpanded ? "flex-row" : "flex-col"
                } items-center gap-2 h-auto py-3 px-4 ${props.type === "main" ? "xl:text-main text-white" : "text-white hover:text-white hover:bg-main-lighten"}`}
=======
                className={`w-full flex ${isExpanded ? "flex-row" : "flex-col"
                  } items-center gap-2 h-auto py-3 px-4 ${props.type === "main" ? "xl:text-main text-white" : "text-white hover:text-white hover:bg-main-lighten"}`}
>>>>>>> 1a19ced (chore: update service folders from local)
              >
                <svg
                  className="size-8"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 36 40"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M21.5717 0.416687C25.2475 0.416687 28.0075 0.579187 29.9525 0.76252C32.9067 1.04169 35.0025 3.43085 35.1617 6.28085C35.3225 9.13335 35.5 13.7075 35.5 20C35.5 26.2917 35.3233 30.8659 35.1625 33.7192C35.0025 36.5692 32.9075 38.9584 29.9533 39.2375C28.0083 39.4209 25.2483 39.5834 21.5725 39.5834C17.9208 39.5834 15.1742 39.4234 13.2308 39.2417C10.2508 38.9617 8.14917 36.54 7.98917 33.6775C7.9 32.0667 7.80417 29.9442 7.73583 27.3734C7.72423 26.9314 7.88865 26.503 8.19293 26.1823C8.49721 25.8616 8.91642 25.675 9.35834 25.6634C9.80025 25.6518 10.2287 25.8162 10.5494 26.1205C10.8701 26.4247 11.0567 26.8439 11.0683 27.2859C11.1213 29.3559 11.2046 31.425 11.3183 33.4925C11.3933 34.8342 12.3292 35.8092 13.5417 35.9225C15.375 36.0942 18.0183 36.25 21.5725 36.25C25.15 36.25 27.8058 36.0917 29.6392 35.9184C30.8417 35.805 31.7608 34.8509 31.835 33.5325C31.9917 30.7409 32.1667 26.23 32.1667 20C32.1667 13.77 31.9917 9.25919 31.835 6.46752C31.76 5.14919 30.8417 4.19502 29.64 4.08169C27.805 3.90835 25.15 3.75002 21.5725 3.75002C18.0183 3.75002 15.375 3.90585 13.5417 4.07752C12.3292 4.19169 11.3933 5.16502 11.3183 6.50752C11.23 8.08835 11.135 10.1792 11.0683 12.7142C11.0567 13.1561 10.8701 13.5753 10.5494 13.8796C10.2287 14.1839 9.80025 14.3483 9.35834 14.3367C8.91642 14.3251 8.49721 14.1384 8.19293 13.8177C7.88865 13.497 7.72423 13.0686 7.73583 12.6267C7.78983 10.5242 7.87457 8.42256 7.99 6.32252C8.14833 3.46002 10.25 1.03835 13.2308 0.758354C15.1717 0.576687 17.92 0.416687 21.5717 0.416687ZM17.7617 10.3834C16.8925 10.78 16.3092 11.6384 16.2408 12.6617C16.19 13.4259 16.1367 14.3242 16.0908 15.3034L3.785 15.8292C2.295 15.8934 0.785 16.9092 0.580002 18.65C0.475441 19.5473 0.475441 20.4536 0.580002 21.3509C0.785835 23.0925 2.295 24.1075 3.785 24.1717L16.0908 24.6967C16.132 25.5774 16.182 26.4578 16.2408 27.3375C16.3092 28.3609 16.8925 29.2192 17.7617 29.6159C18.6433 30.0184 19.6892 29.8834 20.4992 29.1984C21.3208 28.5025 22.3908 27.5392 23.7325 26.2225C25.9692 24.0275 27.0992 22.4475 27.6633 21.4792C27.9274 21.0307 28.0667 20.5197 28.0667 19.9992C28.0667 19.4787 27.9274 18.9677 27.6633 18.5192C27.1 17.5509 25.9692 15.9709 23.7325 13.7767C22.3908 12.46 21.3217 11.4967 20.4992 10.8017C19.6892 10.1159 18.6433 9.98085 17.7617 10.3834Z"
                    fill={getFillColor()}
                  />
                </svg>
                <span className="text-lg font-gochi-hand transition-opacity duration-300 opacity-100">
                  Login
                </span>
              </Button>
            </Link>
          </div>
        )}

        {/* Sign Up Button - Only show when NOT logged in */}
        {!isLoggedIn && (
          <div className="mb-auto w-full px-2">
            <Link href="/signup">
              <Button
                variant="ghost"
                size="sm"
<<<<<<< HEAD
                className={`w-full flex ${
                  isExpanded ? "flex-row" : "flex-col"
                } items-center gap-2 h-auto py-3 px-4 ${props.type === "main" ? "xl:text-main text-white" : "text-white hover:text-white hover:bg-main-lighten"}`}
=======
                className={`w-full flex ${isExpanded ? "flex-row" : "flex-col"
                  } items-center gap-2 h-auto py-3 px-4 ${props.type === "main" ? "xl:text-main text-white" : "text-white hover:text-white hover:bg-main-lighten"}`}
>>>>>>> 1a19ced (chore: update service folders from local)
              >
                <svg
                  className="size-8"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 29 40"
                  fill="none"
                >
                  <path
                    d="M14.7432 0C11.0062 2.09556e-05 8.1935 0.16356 6.20715 0.349069C3.15618 0.635027 1.005 3.10884 0.842947 6.03225C0.853172 6.80912 0.853756 7.74918 0.854609 8.51064C0.842733 8.96192 1.00968 9.39989 1.32106 9.72739C1.63236 10.0548 2.06175 10.2456 2.51385 10.2576C2.96602 10.2695 3.40508 10.1011 3.73328 9.79056C4.06142 9.4799 4.25273 9.05157 4.26471 8.6004C4.26471 7.74934 4.26507 6.80817 4.24971 6.22008C4.32663 4.8492 5.28441 3.85495 6.52533 3.73836C8.40179 3.56306 11.1073 3.40426 14.7449 3.40426C18.4065 3.40426 21.1246 3.56633 23.0028 3.74335C24.2324 3.85939 25.1716 4.83405 25.2484 6.18019C25.4087 9.0313 25.5882 13.6379 25.5882 20C25.5882 26.3621 25.4087 30.9687 25.2484 33.8198C25.1725 35.1662 24.2319 36.1409 23.0011 36.2566C21.1246 36.4337 18.4064 36.5957 14.7449 36.5957C11.1073 36.5957 8.40179 36.4369 6.52533 36.2616C5.28441 36.1459 4.32663 35.1499 4.24971 33.7799C4.16909 32.3408 4.17049 31.4894 4.14809 30.6383C4.13621 30.187 3.9449 29.7589 3.61667 29.4481C3.28861 29.1377 2.85085 28.9694 2.3989 28.9811C1.94671 28.9929 1.51753 29.184 1.20611 29.5113C0.894676 29.8388 0.737995 30.2766 0.737995 30.7281C0.738008 31.4896 0.774681 32.7786 0.84128 33.9678C1.00504 36.8912 3.15703 39.365 6.20715 39.6509C8.19619 39.8365 11.0075 40 14.7449 40C18.507 40 21.3319 39.8348 23.3226 39.6476C26.3463 39.3625 28.4914 36.9216 28.6552 34.011C28.8198 31.0969 29 26.4254 29 20C29 13.5737 28.8181 8.90223 28.6535 5.98903C28.4906 3.07857 26.346 0.637748 23.3226 0.352394C21.3318 0.16516 18.5055 0 14.7432 0Z"
                    fill={getFillColor()}
                  />
                  <path
                    d="M10.2353 8.51064C9.38235 8.51064 8.52941 9.3617 8.52941 10.2128V17.0213H1.70588C0.852942 17.0213 0 17.8723 0 18.7234V20.4255C0 21.2766 0.852942 22.1277 1.70588 22.1277H8.52941C8.52941 22.1277 8.52941 28.0851 8.52941 28.9362C8.52941 29.7872 9.38235 30.6383 10.2353 30.6383H11.9412C12.7941 30.6383 13.6471 29.7872 13.6471 28.9362V22.1277C13.6471 22.1277 19.6176 22.1277 20.4706 22.1277C21.3235 22.1277 22.1765 21.2766 22.1765 20.4255V18.7234C22.1765 17.8723 21.3235 17.0213 20.4706 17.0213H13.6471C13.6471 17.0213 13.6471 11.0638 13.6471 10.2128C13.6471 9.3617 12.7941 8.51064 11.9412 8.51064H10.2353Z"
                    fill="white"
                  />
                </svg>
                <span className="text-lg font-gochi-hand transition-opacity duration-300 opacity-100">
                  Sign up
                </span>
              </Button>
            </Link>
            {/* Premium */}
            {props.isShowPremium && (
              <MenuPremium
                className="mt-6"
                isExpanded={isExpanded}
                type={props.type || "default"}
              />
            )}
          </div>
        )}

        {/* Logout Button - Only show when logged in */}
        {isLoggedIn && (
          <div className="mt-auto">
            <Button
              onClick={handleLogout}
              variant="ghost"
<<<<<<< HEAD
              className={`w-full flex ${
                isExpanded ? "flex-row" : "flex-col"
              } items-center gap-2 h-auto py-3 px-4 ${props.type === "main" ? "xl:text-main text-white" : "text-white hover:text-white hover:bg-main-lighten"}`}
=======
              className={`w-full flex ${isExpanded ? "flex-row" : "flex-col"
                } items-center gap-2 h-auto py-3 px-4 ${props.type === "main" ? "xl:text-main text-white" : "text-white hover:text-white hover:bg-main-lighten"}`}
>>>>>>> 1a19ced (chore: update service folders from local)
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                className="size-8"
              >
                <path
                  d="M35.9805 19.207C35.7844 15.2523 34.1276 11.4987 31.3145 8.68555C28.3139 5.68497 24.2435 4 20 4C17.8988 4 15.8182 4.41467 13.877 5.21875C11.9359 6.02282 10.1712 7.19991 8.68555 8.68555C7.19991 10.1712 6.02282 11.9359 5.21875 13.877C4.41467 15.8182 4 17.8988 4 20L4.01953 20.7871C4.10978 22.6194 4.51523 24.4246 5.21875 26.123C6.02282 28.0641 7.19991 29.8288 8.68555 31.3145C10.1712 32.8001 11.9359 33.9772 13.877 34.7812C15.8182 35.5853 17.8988 36 20 36C24.2435 36 28.3139 34.315 31.3145 31.3145C34.315 28.3139 36 24.2435 36 20L35.9805 19.207ZM24.5859 12.5859C25.367 11.8049 26.633 11.8049 27.4141 12.5859C28.1951 13.367 28.1951 14.633 27.4141 15.4141L22.8281 20L27.4141 24.5859C28.1951 25.367 28.1951 26.633 27.4141 27.4141C26.633 28.1951 25.367 28.1951 24.5859 27.4141L20 22.8281L15.4141 27.4141C14.633 28.1951 13.367 28.1951 12.5859 27.4141C11.8049 26.633 11.8049 25.367 12.5859 24.5859L17.1719 20L12.5859 15.4141C11.8049 14.633 11.8049 13.367 12.5859 12.5859C13.367 11.8049 14.633 11.8049 15.4141 12.5859L20 17.1719L24.5859 12.5859ZM39.9746 20.9922C39.7293 25.9353 37.6588 30.6264 34.1426 34.1426C30.3919 37.8933 25.3043 40 20 40C17.3736 40 14.7722 39.4836 12.3457 38.4785C9.91927 37.4734 7.71454 35.9997 5.85742 34.1426C4.0003 32.2855 2.52658 30.0807 1.52148 27.6543C0.51639 25.2278 0 22.6264 0 20C0 17.3736 0.51639 14.7722 1.52148 12.3457C2.52658 9.91927 4.0003 7.71454 5.85742 5.85742C7.71454 4.0003 9.91927 2.52658 12.3457 1.52148C14.7722 0.51639 17.3736 -3.52236e-08 20 0C25.3043 7.90407e-08 30.3919 2.10669 34.1426 5.85742C37.8933 9.60815 40 14.6957 40 20L39.9746 20.9922Z"
                  fill={props.type === "main" ? "#7000FE" : "white"}
                />
              </svg>
              <span className="text-lg font-gochi-hand transition-opacity duration-300 opacity-100">
                Log out
              </span>
            </Button>
          </div>
        )}

        {/* Toggle Button */}
        <div className="xl:block hidden absolute -right-3 top-1/2 transform -translate-y-1/2">
          <button
            onClick={toggleSidebar}
            className="cursor-pointer w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <svg
<<<<<<< HEAD
              className={`transition-transform duration-300 size-3 ${
                isExpanded ? "rotate-0" : "rotate-180"
              }`}
=======
              className={`transition-transform duration-300 size-3 ${isExpanded ? "rotate-0" : "rotate-180"
                }`}
>>>>>>> 1a19ced (chore: update service folders from local)
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M14.1667 2.9847L14.1667 17.0153C14.1674 17.5692 14.0186 18.112 13.7375 18.5809C13.4563 19.0498 13.0543 19.4256 12.578 19.6648C12.0128 19.9448 11.3841 20.0526 10.7633 19.976C10.1426 19.8994 9.5548 19.6415 9.06703 19.2315L0.964812 12.2162C0.661963 11.9409 0.419078 11.6006 0.252615 11.2182C0.0861511 10.8358 1.14236e-07 10.4204 1.19249e-07 10C1.24261e-07 9.57965 0.0861511 9.1642 0.252615 8.78183C0.419078 8.39945 0.661964 8.05907 0.964812 7.78377L9.06703 0.768461C9.5548 0.358532 10.1426 0.100569 10.7633 0.0239679C11.3841 -0.0526312 12.0128 0.055216 12.578 0.335217C13.0543 0.574406 13.4563 0.950194 13.7375 1.41908C14.0186 1.88797 14.1674 2.43079 14.1667 2.9847Z"
                fill="black"
              />
            </svg>
          </button>
        </div>
      </div>

<<<<<<< HEAD
      {/* Notification Panel */}
      {isNotificationOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
            onClick={handleNotificationClose}
          />

          {/* Notification Panel */}
          <div
            className={`fixed top-0 right-0 h-full w-full bg-white z-50 transform transition-transform duration-300 ease-in-out ${
              isNotificationOpen ? "-translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6">
              <h2 className="text-xl font-semibold text-gray-900">Notification</h2>
              <button
                onClick={handleNotificationClose}
                className="w-8 h-8 bg-transparent rounded-full flex items-center justify-center hover:bg-gray-100 transition-all duration-200"
                aria-label="Close notifications"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Notification List */}
            {isLoggedIn && (
              <div className="flex-1 overflow-y-auto">
                <NotificationContainer className="max-w-none mx-0 bg-transparent rounded-none p-0" />
              </div>
            )}
          </div>
        </>
      )}
=======
>>>>>>> 1a19ced (chore: update service folders from local)
    </>
  )
}
