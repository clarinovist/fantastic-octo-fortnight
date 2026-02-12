"use client";

import React from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFormContext, ControllerRenderProps, FieldValues } from "react-hook-form";

interface FieldWrapperProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  children: (field: ControllerRenderProps<FieldValues, string>) => React.ReactNode;
  className?: string;
}

export function FieldWrapper({
  name,
  label,
  description,
  required,
  children,
  className,
}: FieldWrapperProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>{children(field)}</FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}