"use client";

import { Input } from "@/components/ui/input";
import { FieldWrapper } from "./field-wrapper";

interface InputFieldProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function InputField({
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  className,
}: InputFieldProps) {
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
          type="text"
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
    </FieldWrapper>
  );
}
