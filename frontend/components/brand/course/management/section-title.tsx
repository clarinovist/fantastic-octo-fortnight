"use client"
import { useState } from "react"

interface SectionTitleProps {
  children: React.ReactNode
  className?: string
  classNameSubtitle?: string
  title: string
  subtitle?: string
}

export function SectionTitle({
  children,
  className,
  classNameSubtitle,
  title,
  subtitle,
}: SectionTitleProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }
  return (
    <div
      className={`bg-white shadow-lg rounded-2xl py-2 px-4 text-sm text-gray-600 leading-relaxed ${className}`}
    >
      <div className="flex items-start justify-between" onClick={toggleExpand}>
        <div className="flex items-start gap-4">
          <div>
            <h2 className="text-lg font-bold">{title}</h2>
          </div>
          <svg
            className="lg:hidden block"
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="8"
            viewBox="0 0 13 8"
            fill="none"
          >
            <path
              d="M0.28615 0.305919C0.469427 0.110039 0.717971 0 0.977125 0C1.23628 0 1.48482 0.110039 1.6681 0.305919L6.5059 5.47795L11.3437 0.305919C11.528 0.115591 11.7749 0.0102748 12.0312 0.0126554C12.2874 0.015036 12.5325 0.124922 12.7137 0.318647C12.895 0.512371 12.9977 0.774433 13 1.04839C13.0022 1.32235 12.9037 1.58628 12.7257 1.78334L7.19688 7.69408C7.0136 7.88996 6.76505 8 6.5059 8C6.24675 8 5.9982 7.88996 5.81493 7.69408L0.28615 1.78334C0.102928 1.5874 0 1.32169 0 1.04463C0 0.767573 0.102928 0.501858 0.28615 0.305919Z"
              fill="black"
            />
          </svg>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M7.2 5.6H8.8V4H7.2M8 14.4C4.472 14.4 1.6 11.528 1.6 8C1.6 4.472 4.472 1.6 8 1.6C11.528 1.6 14.4 4.472 14.4 8C14.4 11.528 11.528 14.4 8 14.4ZM8 0C6.94943 0 5.90914 0.206926 4.93853 0.608964C3.96793 1.011 3.08601 1.60028 2.34315 2.34315C0.842855 3.84344 0 5.87827 0 8C0 10.1217 0.842855 12.1566 2.34315 13.6569C3.08601 14.3997 3.96793 14.989 4.93853 15.391C5.90914 15.7931 6.94943 16 8 16C10.1217 16 12.1566 15.1571 13.6569 13.6569C15.1571 12.1566 16 10.1217 16 8C16 6.94943 15.7931 5.90914 15.391 4.93853C14.989 3.96793 14.3997 3.08601 13.6569 2.34315C12.914 1.60028 12.0321 1.011 11.0615 0.608964C10.0909 0.206926 9.05058 0 8 0ZM7.2 12H8.8V7.2H7.2V12Z"
            fill="#848484"
          />
        </svg>
      </div>
      <div className={`${isExpanded ? "block" : "lg:block hidden"} overflow-hidden mt-4`}>
        <div className="pb-6 px-4 max-h-[500px] overflow-auto">
          {subtitle && <p className={`text-sm text-gray-500 ${classNameSubtitle}`}>{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  )
}
