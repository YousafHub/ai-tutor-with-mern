import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// lib/utils/resume.ts
interface Entry {
  title: string;
  organization: string;
  startDate: string;
  endDate?: string; // ✅ Make this optional
  description: string;
  current: boolean;
}

export function entriesToMarkdown(entries: Entry[], type: string): string {
  if (!entries?.length) return "";

  return (
    `## ${type}\n\n` +
    entries
      .map((entry) => {
        const dateRange = entry.current
          ? `${entry.startDate} - Present`
          : `${entry.startDate} - ${entry.endDate || ""}`;
        return `### ${entry.title} @ ${entry.organization}\n${dateRange}\n\n${entry.description}`;
      })
      .join("\n\n")
  );
}
