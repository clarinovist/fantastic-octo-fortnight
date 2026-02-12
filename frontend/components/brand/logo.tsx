import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  size?: "small" | "medium" | "large"
  type?: "full" | "notext" | "full-white"
  className?: string
  isSpecificSize?: boolean
  width?: number
  height?: number
}

export function Logo(props: LogoProps) {
  const { size = "medium", type = "full", width, height, isSpecificSize } = props
  let logoWidth = width
  let logoHeight = height

  switch (size) {
    case "small":
      logoWidth = 100
      logoHeight = 30
      break
    case "large":
      logoWidth = 404
      logoHeight = 118
      break
    default:
      logoWidth = 150
      logoHeight = 45
  }

  return (
    <Link href="/" className={props.className}>
      {type === "full" ? (
        <Image
          src="/lesprivate-logo.png"
          priority
          alt="Lesprivate Logo"
          width={isSpecificSize ? width : logoWidth}
          height={isSpecificSize ? height : logoHeight}
        />
      ) : type === "full-white" ? (
        <Image
          src="/lesprivate-logo-white.png"
          priority
          alt="Lesprivate Logo"
          width={isSpecificSize ? width : logoWidth}
          height={isSpecificSize ? height : logoHeight}
        />
      ) : (
        <Image src="/lesprivate-logo-notext.png" alt="Lesprivate Logo" width={48} height={48} />
      )}
    </Link>
  )
}
