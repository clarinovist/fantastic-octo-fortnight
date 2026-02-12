import type { IconProps } from "@/components/ui/icon"

export function X(props: IconProps) {
  return (
    <svg
      className={props.className}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <g clipPath="url(#clip0_459_16441)">
        <mask
          id="mask0_459_16441"
          style={{ maskType: "luminance" } as any}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="20"
          height="20"
        >
          <path d="M0 0H20V20H0V0Z" fill="white" />
        </mask>
        <g mask="url(#mask0_459_16441)">
          <path
            d="M15.75 1.42871H18.8171L12.1171 8.68956L20 18.5716H13.8286L8.99143 12.5794L3.46286 18.5716H0.392857L7.55857 10.8027L0 1.43006H6.32857L10.6943 6.9061L15.75 1.42871ZM14.6714 16.8313H16.3714L5.4 3.07841H3.57714L14.6714 16.8313Z"
            fill={props.fill || "#000000"}
          />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_459_16441">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
