"use client";

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { FieldWrapper } from "./field-wrapper";

interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface AsyncSelectFieldProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  loadOptions: () => Promise<SelectOption[]>;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function AsyncSelectField({
  name,
  label,
  description,
  placeholder,
  loadOptions,
  required,
  disabled,
  className,
}: AsyncSelectFieldProps) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await loadOptions();
        setOptions(data);
      } catch (err) {
        setError("Failed to load options");
        console.error("Error loading options:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, [loadOptions]);

  return (
    <FieldWrapper
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
    >
      {(field) => (
        <Select
          onValueChange={field.onChange}
          value={field.value}
          disabled={disabled || isLoading}
        >
          <SelectTrigger>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <SelectValue placeholder={placeholder || "Select an option"} />
            )}
          </SelectTrigger>
          <SelectContent>
            {error ? (
              <div className="px-2 py-1.5 text-sm text-destructive">
                {error}
              </div>
            ) : (
              options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      )}
    </FieldWrapper>
  );
}