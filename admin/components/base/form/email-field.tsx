"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { FieldWrapper } from "./field-wrapper";

interface EmailFieldProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function EmailField({
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  className,
}: EmailFieldProps) {
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
          type="email"
          placeholder={placeholder || "email@example.com"}
          disabled={disabled}
        />
      )}
    </FieldWrapper>
  );
}