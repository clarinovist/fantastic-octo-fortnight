"use client";

import React from "react";
import { useFormContext, FieldError } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Trash2 } from "lucide-react";

interface DynamicSocialMediaFieldProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
  platformPlaceholder?: string;
  urlPlaceholder?: string;
}

interface SocialMediaLink {
  platform: string;
  url: string;
}

interface SocialMediaFieldError {
  platform?: FieldError;
  url?: FieldError;
}

export function DynamicSocialMediaField({
  name,
  label = "Social Media Links",
  description,
  required,
  className,
  platformPlaceholder = "e.g., Instagram, LinkedIn",
  urlPlaceholder = "https://...",
}: DynamicSocialMediaFieldProps) {
  const form = useFormContext();
  const formState = form.formState;

  const addSocialMediaLink = () => {
    const currentLinks = form.getValues(name) || [];
    form.setValue(name, [...currentLinks, { platform: "", url: "" }], {
      shouldValidate: false,
    });
  };

  const removeSocialMediaLink = (index: number) => {
    const currentLinks = form.getValues(name) || [];
    form.setValue(
      name,
      currentLinks.filter((_: SocialMediaLink, i: number) => i !== index),
      { shouldValidate: true }
    );
  };

  const getFieldError = (index: number, field: "platform" | "url"): string | undefined => {
    const errors = formState.errors[name] as SocialMediaFieldError[] | undefined;
    return errors?.[index]?.[field]?.message;
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const links: SocialMediaLink[] = field.value || [];

        return (
          <FormItem className={className}>
            {label && (
              <FormLabel>
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
            )}
            {description && <FormDescription>{description}</FormDescription>}

            <div className="space-y-3">
              {links.map((link: SocialMediaLink, index: number) => {
                const platformError = getFieldError(index, "platform");
                const urlError = getFieldError(index, "url");

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex gap-2 items-start">
                      <div className="flex-1 space-y-1">
                        <FormControl>
                          <Input
                            placeholder={platformPlaceholder}
                            value={link.platform}
                            onChange={(e) => {
                              const newLinks = [...links];
                              newLinks[index].platform = e.target.value;
                              field.onChange(newLinks);
                            }}
                            className={platformError ? "border-destructive" : ""}
                          />
                        </FormControl>
                        {platformError && (
                          <p className="text-sm text-destructive">
                            {platformError}
                          </p>
                        )}
                      </div>
                      <div className="flex-[2] space-y-1">
                        <FormControl>
                          <Input
                            placeholder={urlPlaceholder}
                            value={link.url}
                            onChange={(e) => {
                              const newLinks = [...links];
                              newLinks[index].url = e.target.value;
                              field.onChange(newLinks);
                            }}
                            className={urlError ? "border-destructive" : ""}
                          />
                        </FormControl>
                        {urlError && (
                          <p className="text-sm text-destructive">{urlError}</p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeSocialMediaLink(index)}
                        className="shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSocialMediaLink}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Social Media Link
              </Button>
            </div>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}