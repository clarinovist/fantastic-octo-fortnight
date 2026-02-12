"use client";

import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { FieldWrapper } from "./field-wrapper";

interface TextareaFieldProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  className?: string;
}

export function TextareaField({
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  rows = 4,
  className,
}: TextareaFieldProps) {
  return (
    <FieldWrapper
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
    >
      {(field) => (
        <Textarea
          {...field}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
        />
      )}
    </FieldWrapper>
  );
}