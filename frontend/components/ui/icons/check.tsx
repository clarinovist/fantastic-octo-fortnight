import type { IconProps } from "../icon"

export function Check(props: IconProps) {
  return (
    <svg
      className={props.className}
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
    >
      <path
        d="M15.7548 43.5701L0 27.9298L7.1797 20.8023L15.7548 29.3402L40.8203 4.43164L48 11.5592L15.7548 43.5701Z"
        fill={props.fill || "currentColor"}
      />
    </svg>
  )
}
