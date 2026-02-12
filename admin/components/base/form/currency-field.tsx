"use client";

import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { FieldWrapper } from "./field-wrapper";

interface CurrencyFieldProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function CurrencyField({
  name,
  label,
  description,
  placeholder = "0",
  required,
  disabled,
  className,
}: CurrencyFieldProps) {
  const { setValue, watch } = useFormContext();
  const fieldValue = watch(name);
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState<string>("");

  // Format number to IDR format with dot separators
  const formatCurrency = (value: string | number): string => {
    const numericValue =
      typeof value === "string" ? value.replace(/\D/g, "") : value.toString();

    if (!numericValue || numericValue === "0") return "";

    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Parse formatted string to number
  const parseCurrency = (value: string): string => {
    return value.replace(/\./g, "");
  };

  // Derive display value from field value when not editing
  const displayValue = useMemo(() => {
    if (isEditing) {
      return localValue;
    }
    return formatCurrency(fieldValue || "");
  }, [fieldValue, isEditing, localValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Remove all non-numeric characters
    const numericOnly = inputValue.replace(/\D/g, "");

    // Update local display value with formatting
    const formatted = formatCurrency(numericOnly);
    setLocalValue(formatted);

    // Update form value with raw numeric string
    setValue(name, numericOnly, { shouldValidate: true });
  };

  const handleFocus = () => {
    setIsEditing(true);
    setLocalValue(formatCurrency(fieldValue || ""));
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Ensure consistent formatting on blur
    if (localValue) {
      const numericValue = parseCurrency(localValue);
      setValue(name, numericValue, { shouldValidate: true });
    }
  };

  return (
    <FieldWrapper
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
    >
      {() => (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            Rp
          </span>
          <Input
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className="pl-10"
            inputMode="numeric"
          />
        </div>
      )}
    </FieldWrapper>
  );
}
