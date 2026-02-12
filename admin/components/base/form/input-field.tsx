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
<<<<<<< HEAD
}: InputFieldProps) {
=======
  type = "text",
}: InputFieldProps & { type?: string }) {
>>>>>>> 1a19ced (chore: update service folders from local)
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
<<<<<<< HEAD
          type="text"
=======
          type={type}
>>>>>>> 1a19ced (chore: update service folders from local)
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
    </FieldWrapper>
  );
}
