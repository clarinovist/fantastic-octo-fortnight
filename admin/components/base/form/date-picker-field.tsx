"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import React from "react";
import { FieldWrapper } from "./field-wrapper";

interface DatePickerFieldProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function DatePickerField({
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  minDate,
  maxDate,
  className,
}: DatePickerFieldProps) {
  const [month, setMonth] = React.useState<Date | undefined>(undefined);

  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = minDate?.getFullYear() || currentYear - 100;
    const endYear = maxDate?.getFullYear() || currentYear + 10;
    return Array.from(
      { length: endYear - startYear + 1 },
      (_, i) => startYear + i
    );
  }, [minDate, maxDate]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <FieldWrapper
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
    >
      {(field) => (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-full justify-start text-left font-normal",
                !field.value && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {field.value ? (
                format(field.value, "PPP")
              ) : (
                <span>{placeholder || "Pick a date"}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex gap-2 p-3 border-b">
              <Select
                value={month?.getMonth().toString()}
                onValueChange={(value) => {
                  const newDate = new Date(month || field.value || new Date());
                  newDate.setMonth(parseInt(value));
                  setMonth(newDate);
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((monthName, index) => (
                    <SelectItem key={monthName} value={index.toString()}>
                      {monthName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={month?.getFullYear().toString()}
                onValueChange={(value) => {
                  const newDate = new Date(month || field.value || new Date());
                  newDate.setFullYear(parseInt(value));
                  setMonth(newDate);
                }}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Calendar
              mode="single"
              selected={field.value}
              onSelect={field.onChange}
              disabled={(date) => {
                if (minDate && date < minDate) return true;
                if (maxDate && date > maxDate) return true;
                return false;
              }}
              month={month}
              onMonthChange={setMonth}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      )}
    </FieldWrapper>
  );
}
