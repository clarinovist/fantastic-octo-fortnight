import type { IconProps } from "../icon"

export function Close(props: IconProps) {
  return (
    <svg
      className={props.className}
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="14"
      viewBox="0 0 48 14"
      fill="none"
    >
      <g clipPath="url(#clip0_1460_49138)">
        <path
          d="M48 7.43662L40.5634 0L24 16.9014L7.43662 0L0 7.43662L16.9014 24L0 40.5634L7.43662 48L24 31.0986L40.5634 48L48 40.5634L31.0986 24L48 7.43662Z"
          fill={props.fill || "currentColor"}
        />
      </g>
      <defs>
        <clipPath id="clip0_1460_49138">
          <rect width="48" height="48" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
