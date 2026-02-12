import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

<<<<<<< HEAD
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
=======

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
>>>>>>> 1a19ced (chore: update service folders from local)
