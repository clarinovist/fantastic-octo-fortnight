"use client";

import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FieldWrapper } from "./field-wrapper";

interface RadioOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface RadioFieldProps {
  name: string;
  label?: string;
  description?: string;
  options: RadioOption[];
  required?: boolean;
  disabled?: boolean;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function RadioField({
  name,
  label,
  description,
  options,
  required,
  disabled,
  className,
  orientation = "vertical",
}: RadioFieldProps) {
  return (
    <FieldWrapper
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
    >
      {(field) => (
        <RadioGroup
          onValueChange={field.onChange}
          value={field.value}
          disabled={disabled}
          className={orientation === "horizontal" ? "flex gap-4" : "space-y-2"}
        >
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem
                value={option.value}
                id={`${name}-${option.value}`}
                disabled={option.disabled || disabled}
              />
              <Label
                htmlFor={`${name}-${option.value}`}
                className="font-normal cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}
    </FieldWrapper>
  );
}