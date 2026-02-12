"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { FieldWrapper } from "./field-wrapper";

interface PhoneFieldProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function PhoneField({
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  className,
}: PhoneFieldProps) {
  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, "");
    return phoneNumber;
  };

  return (
    <FieldWrapper
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
    >
      {(field) => (
        <Input
          {...field}
          type="tel"
          placeholder={placeholder || "+1 (555) 000-0000"}
          disabled={disabled}
          onChange={(e) => {
            const formatted = formatPhoneNumber(e.target.value);
            field.onChange(formatted);
          }}
        />
      )}
    </FieldWrapper>
  );
}