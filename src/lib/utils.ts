import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const truncate = (text: string, maxLength = 100) => {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};
