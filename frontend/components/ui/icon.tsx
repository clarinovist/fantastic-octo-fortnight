import { Check } from "./icons/check"
import { Close } from "./icons/close"
import { Info } from "./icons/info"
import { Instagram } from "./icons/instagram"
import { LinkIcon } from "./icons/link"
import { Linkedin } from "./icons/linkedin"
import { PlusSquare } from "./icons/plus-square"
import { Threads } from "./icons/threads"
import { Tiktok } from "./icons/tiktok"
import { TimeIcon } from "./icons/time"
import { Upload } from "./icons/upload"
import { UserTarget } from "./icons/user-target"
import { WarningTriangle } from "./icons/warning-triangle"
import { Whatsapp } from "./icons/whatsapp"
import { X } from "./icons/x"
import { Youtube } from "./icons/youtube"

export type IconProps = {
  className?: string
  fill?: string
}

export type name =
  | "tiktok"
  | "instagram"
  | "threads"
  | "x"
  | "linkedin"
  | "link"
  | "youtube"
  | "whatsapp"
  | "time"
  | "check"
  | "close"
  | "user-target"
  | "upload"
  | "plus-square"
  | "warning-triangle"
  | "info"
export const iconNames: name[] = [
  "tiktok",
  "instagram",
  "threads",
  "x",
  "linkedin",
  "link",
  "youtube",
  "whatsapp",
  "time",
  "check",
  "close",
  "user-target",
  "upload",
  "plus-square",
  "warning-triangle",
  "info",
]

type Props = IconProps & {
  name: name
}

export function Icon({ name, ...props }: Props) {
  return (
    <>
      {name === "tiktok" && <Tiktok {...props} />}
      {name === "instagram" && <Instagram {...props} />}
      {name === "threads" && <Threads {...props} />}
      {name === "x" && <X {...props} />}
      {name === "linkedin" && <Linkedin {...props} />}
      {name === "link" && <LinkIcon {...props} />}
      {name === "youtube" && <Youtube {...props} />}
      {name === "whatsapp" && <Whatsapp {...props} />}
      {name === "time" && <TimeIcon {...props} />}
      {name === "check" && <Check {...props} />}
      {name === "close" && <Close {...props} />}
      {name === "user-target" && <UserTarget {...props} />}
      {name === "upload" && <Upload {...props} />}
      {name === "plus-square" && <PlusSquare {...props} />}
      {name === "warning-triangle" && <WarningTriangle {...props} />}
      {name === "info" && <Info {...props} />}
    </>
  )
}
