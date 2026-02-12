"use client"

import { forwardRef } from "react"
import { Input } from "@/components/ui/input"

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  onChange?: (value: string) => void
  error?: boolean
  icon?: React.ReactNode
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ onChange, error, icon, className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Remove all non-numeric characters
      const numericValue = e.target.value.replace(/\D/g, '')
      
      // Limit to reasonable phone number length (adjust as needed)
      const limitedValue = numericValue.slice(0, 15)
      
      // Call the onChange callback with the cleaned value
      onChange?.(limitedValue)
      
      // Update the input value
      e.target.value = limitedValue
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow: backspace, delete, tab, escape, enter, home, end, left, right
      if ([8, 9, 27, 13, 46, 35, 36, 37, 39].indexOf(e.keyCode) !== -1 ||
          // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
          (e.keyCode === 65 && e.ctrlKey === true) ||
          (e.keyCode === 67 && e.ctrlKey === true) ||
          (e.keyCode === 86 && e.ctrlKey === true) ||
          (e.keyCode === 88 && e.ctrlKey === true)) {
        return
      }
      
      // Ensure that it is a number and stop the keypress
      if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault()
      }
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      const paste = e.clipboardData.getData('text')
      const numericPaste = paste.replace(/\D/g, '')
      
      if (numericPaste !== paste) {
        e.preventDefault()
        const limitedValue = numericPaste.slice(0, 15)
        onChange?.(limitedValue)
        if (e.target instanceof HTMLInputElement) {
          e.target.value = limitedValue
        }
      }
    }

    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
            <div className="w-12 h-12 flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}
        <Input
          {...props}
          ref={ref}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className={`focus-visible:border-main focus-visible:ring-0 border-2 ${icon ? 'pl-12' : 'pl-4'} pr-4 py-6 text-lg rounded-full placeholder:text-main-300 ${
            error ? "border-red-500 placeholder:opacity-75 placeholder:text-[#FF000440]" : "border-main/50"
          } ${className}`}
        />
      </div>
    )
  }
)

PhoneInput.displayName = "PhoneInput"