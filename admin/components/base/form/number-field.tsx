"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { FieldWrapper } from "./field-wrapper";

interface NumberFieldProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function NumberField({
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  min,
  max,
  step,
  className,
}: NumberFieldProps) {
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
          type="number"
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          onWheel={(e) => e.currentTarget.blur()}
          onChange={(e) => {
            const value = e.target.value;
            field.onChange(value === "" ? "" : Number(value));
          }}
        />
      )}
    </FieldWrapper>
  );
}