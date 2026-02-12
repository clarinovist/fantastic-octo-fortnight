"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldWrapper } from "./field-wrapper";

interface CheckboxFieldProps {
  name: string;
  label?: string;
  description?: string;
  checkboxLabel: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function CheckboxField({
  name,
  label,
  description,
  checkboxLabel,
  required,
  disabled,
  className,
}: CheckboxFieldProps) {
  return (
    <FieldWrapper
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
    >
      {(field) => (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={name}
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
          />
          <label
            htmlFor={name}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            {checkboxLabel}
          </label>
        </div>
      )}
    </FieldWrapper>
  );
}