"use client";

import { BaseForm, InputField, SelectField } from "@/components/base/form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { CurrencyField } from "../base/form/currency-field";

const subscriptionFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  interval: z.enum(["monthly", "yearly"], {
    message: "Please select an interval",
  }),
  price: z
    .string()
    .min(1, "Price is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Price must be a valid positive number",
    }),
});

type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>;

export type SubscriptionSubmitPayload = {
  name: string;
  interval: "monthly" | "yearly";
  price: number;
};

interface SubscriptionFormProps {
  subscriptionId?: string;
  initialData?: {
    name: string;
    interval: "monthly" | "yearly";
    price?: string;
  };
  action: (
    subscriptionId: string,
    payload: SubscriptionSubmitPayload
  ) => Promise<{ success: boolean; error?: string; data?: unknown }>;
}

const INTERVAL_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export function SubscriptionForm({
  subscriptionId,
  initialData,
  action,
}: SubscriptionFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      interval: initialData?.interval || "monthly",
      price: initialData?.price || "",
    },
  });

  const handleFormSubmit = async (data: SubscriptionFormValues) => {
    if (!subscriptionId) {
      toast.error("Subscription ID is required");
      return;
    }

    setIsLoading(true);

    try {
      const transformedData: SubscriptionSubmitPayload = {
        name: data.name,
        price: data.price ? Number(data.price) : 0,
        interval: data.interval,
      };

      const result = await action(subscriptionId, transformedData);

      if (result.success) {
        toast.success("Subscription updated successfully!");
      } else {
        toast.error(result.error || "Failed to update subscription");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseForm form={form} onSubmit={handleFormSubmit} className="space-y-6">
      <InputField
        name="name"
        label="Subscription Name"
        placeholder="Enter subscription name"
        required
      />

      <SelectField
        name="interval"
        label="Billing Interval"
        placeholder="Select billing interval"
        options={INTERVAL_OPTIONS}
        required
      />

      <CurrencyField name="price" label="Price" placeholder="0.00" required />

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => form.reset()}
          disabled={isLoading}
        >
          Reset
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Update Subscription"}
        </Button>
      </div>
    </BaseForm>
  );
}
