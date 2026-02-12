"use client";

import React from "react";
import { UseFormReturn, FieldValues, FormProvider } from "react-hook-form";
import { Form } from "@/components/ui/form";

interface BaseFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export function BaseForm<T extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
}: BaseFormProps<T>) {
  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
          {children}
        </form>
      </Form>
    </FormProvider>
  );
}