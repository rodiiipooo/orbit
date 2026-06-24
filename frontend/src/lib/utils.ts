import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatPct(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`;
}

export const PLATFORM_COLORS: Record<string, string> = {
  twitter: "#1DA1F2",
  linkedin: "#0A66C2",
  instagram: "#E1306C",
  facebook: "#1877F2",
  tiktok: "#000000",
};

export const PLATFORM_ICONS: Record<string, string> = {
  twitter: "𝕏",
  linkedin: "in",
  instagram: "📷",
  facebook: "f",
  tiktok: "♪",
};

export const ALL_PLATFORMS = ["twitter", "linkedin", "instagram", "facebook", "tiktok"];
