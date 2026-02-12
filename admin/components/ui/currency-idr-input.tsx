import { useRef, useState } from "react";
import { Input } from "../ui/input";

interface CurrencyIdrInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange"
  > {
  value: number;
  onChange: (value: number) => void;
  locale?: string;
}

function formatCurrency(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function CurrencyIdrInput({
  value,
  onChange,
  locale = "id-ID",
  placeholder = "0",
  className = "",
  ...props
}: CurrencyIdrInputProps) {
  const [displayValue, setDisplayValue] = useState(() => {
    return value > 0 ? formatCurrency(value, locale) : "";
  });
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  function parseCurrency(value: string): number {
    // Remove all non-digit characters except decimal point
    const numericValue = value.replace(/[^\d]/g, "");
    return numericValue ? parseInt(numericValue, 10) : 0;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setIsTyping(true);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Parse the numeric value
    const numericValue = parseCurrency(inputValue);

    // Update the actual value
    onChange(numericValue);

    // Update display value
    if (inputValue === "" || numericValue === 0) {
      setDisplayValue("");
    } else {
      setDisplayValue(formatCurrency(numericValue, locale));
    }
  };

  const handleFocus = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set timeout to reformat if user doesn't type within 2 seconds
    timeoutRef.current = setTimeout(() => {
      if (!isTyping && value > 0) {
        setDisplayValue(formatCurrency(value, locale));
      }
    }, 2000);
  };

  const handleBlur = () => {
    // Clear timeout on blur
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsTyping(false);

    // Format back to currency on blur
    if (value > 0) {
      setDisplayValue(formatCurrency(value, locale));
    } else {
      setDisplayValue("");
    }
  };

  const handleKeyDown = () => {
    // Clear timeout when user starts typing
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Show raw number only when user starts typing
    if (!isTyping && value > 0) {
      setDisplayValue(value.toString());
    }
    setIsTyping(true);
  };

  return (
    <Input
      {...props}
      type="text"
      placeholder={placeholder}
      value={displayValue}
      onChange={handleInputChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  );
}
