import type { IconProps } from "../icon"

export function Upload(props: IconProps) {
  return (
    <svg
      className={props.className}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <g clipPath="url(#clip0_1459_39465)">
        <path
          d="M7 12V3.85L4.4 6.45L3 5L8 0L13 5L11.6 6.45L9 3.85V12H7ZM0 16V11H2V14H14V11H16V16H0Z"
          fill={props.fill || "currentColor"}
        />
      </g>
      <defs>
        <clipPath id="clip0_1459_39465">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
