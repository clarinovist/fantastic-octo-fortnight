import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

type BackButtonProps = {
  className?: string
  fillOnSmallDevice?: string
  fillOnMediumDevice?: string
}

export function BackButton(props: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }
  return (
    <div className={`xl:mx-auto ${props.className}`}>
      <Button
        variant="ghost"
        className={cn("cursor-pointer hover:bg-transparent p-0")}
        onClick={handleBack}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          className={cn("hidden xl:block")}
        >
          <g clipPath="url(#clip0_626_4138)">
            <path
              d="M18.7526 29.127L17.2088 30.6684C16.5551 31.3211 15.4981 31.3211 14.8513 30.6684L1.33255 17.177C0.678863 16.5243 0.678863 15.4689 1.33255 14.8231L14.8444 1.33169C15.4981 0.678993 16.5551 0.678993 17.2018 1.33169L18.7456 2.87317C19.4063 3.53282 19.3924 4.60907 18.7178 5.25483L10.3451 13.2191L30.3312 13.2191C31.2561 13.2191 32.0002 13.9621 32.0002 14.8856L32.0002 17.1076C32.0002 18.0311 31.2561 18.774 30.3312 18.774L10.3451 18.774L18.7248 26.7453C19.4063 27.3911 19.4202 28.4673 18.7526 29.127Z"
              fill={props.fillOnMediumDevice || "white"}
            />
          </g>
          <defs>
            <clipPath id="clip0_626_4138">
              <rect width="32" height="32" fill="white" />
            </clipPath>
          </defs>
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          className={cn("xl:hidden block")}
        >
          <g clipPath="url(#clip0_426_15819)">
            <path
              d="M18.3944 28.9902L16.8088 30.5156C16.1375 31.1615 15.0519 31.1615 14.3877 30.5156L0.503515 17.1647C-0.167839 16.5188 -0.167839 15.4743 0.503515 14.8353L14.3805 1.48442C15.0519 0.838523 16.1375 0.838523 16.8017 1.48442L18.3872 3.00985C19.0657 3.66262 19.0514 4.72767 18.3587 5.3667L9.75963 13.2481L30.2859 13.2481C31.2358 13.2481 32 13.9833 32 14.8972L32 17.096C32 18.0098 31.2358 18.7451 30.2859 18.7451L9.75963 18.7451L18.3658 26.6333C19.0657 27.2723 19.08 28.3374 18.3944 28.9902Z"
              fill={props.fillOnSmallDevice || "black"}
            />
          </g>
          <defs>
            <clipPath id="clip0_426_15819">
              <rect width="32" height="32" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </Button>
    </div>
  )
}
