import { Lock } from "lucide-react"
import { useEffect, useState } from "react"

type CustomSwitchProps = {
  checked?: boolean
  disabled?: boolean
  className?: string
  onChange?: (checked: boolean) => void
}

export function CustomSwitch({
  checked = false,
  disabled,
  className,
  onChange,
}: CustomSwitchProps) {
  const [enabled, setEnabled] = useState(checked)

  useEffect(() => {
    setEnabled(checked)
  }, [checked])

  const handleClick = () => {
    if (disabled) return
    onChange?.(!enabled)
  }

  return (
    <button
      onClick={handleClick}
      className={`relative flex items-center w-[64px] h-[32px] rounded-full p-1 transition-colors duration-300 ${
        enabled ? "bg-main" : "bg-gray-400"
      } ${className}`}
      disabled={disabled}
      type="button"
    >
      {/* Content */}
      <span
        className={`absolute left-3 text-black font-semibold transition-opacity ${
          enabled ? "opacity-100" : "opacity-0"
        }`}
      >
        ON
      </span>
      {disabled ? (
        <Lock
          size={14}
          className={`absolute right-3 text-gray-700 transition-opacity ${
            !enabled ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : (
        <span
          className={`absolute right-3 text-black font-semibold transition-opacity ${
            !enabled ? "opacity-100" : "opacity-0"
          }`}
        >
          OFF
        </span>
      )}

      {/* Circle */}
      <span
        className={`h-6 w-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
          enabled ? "translate-x-8" : "translate-x-0"
        }`}
      />
    </button>
  )
}
