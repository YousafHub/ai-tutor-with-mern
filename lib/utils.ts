// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Entry {
  title: string;
  organization: string;
  startDate: string;
  endDate?: string;
  description: string;
  current: boolean;
}

interface ParsedResume {
  contactInfo: {
    email: string;
    mobile: string;
    linkedin: string;
    twitter: string;
  };
  summary: string;
  skills: string;
  experience: Entry[];
  education: Entry[];
  projects: Entry[];
}

// lib/utils.ts - entriesToMarkdown
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

// lib/utils.ts - Complete parseMarkdownToFormData

export function parseMarkdownToFormData(markdown: string): ParsedResume {
  if (!markdown) {
    return {
      contactInfo: { email: "", mobile: "", linkedin: "", twitter: "" },
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    };
  }

  const result: ParsedResume = {
    contactInfo: { email: "", mobile: "", linkedin: "", twitter: "" },
    summary: "",
    skills: "",
    experience: [],
    education: [],
    projects: [],
  };

  // Split by sections (## heading)
  const sections = markdown.split(/## /).filter(Boolean);

  let currentSection: keyof ParsedResume | null = null;

  sections.forEach((section) => {
    const lines = section.split("\n").filter(Boolean);
    const title = lines[0]?.trim();

    if (!title) return;

    // Get the content (everything after the title)
    const content = lines.slice(1).join("\n");

    // --- Parse Contact Info ---
    if (title.includes('align="center"')) {
      const allText = section;
      const emailMatch = allText.match(/📧\s*([^\s|]+)/);
      if (emailMatch) result.contactInfo.email = emailMatch[1].trim();

      const mobileMatch = allText.match(/📱\s*([^\s|]+)/);
      if (mobileMatch) result.contactInfo.mobile = mobileMatch[1].trim();

      const linkedinMatch = allText.match(/💼\s*\[LinkedIn\]\(([^)]+)\)/);
      if (linkedinMatch) result.contactInfo.linkedin = linkedinMatch[1].trim();

      const twitterMatch = allText.match(/🐦\s*\[Twitter\]\(([^)]+)\)/);
      if (twitterMatch) result.contactInfo.twitter = twitterMatch[1].trim();
      return;
    }

    // --- Parse Professional Summary ---
    if (title === "Professional Summary") {
      result.summary = content.trim();
      return;
    }

    // --- Parse Skills ---
    if (title === "Skills") {
      result.skills = content.trim();
      return;
    }

    // --- Parse Work Experience ---
    if (title === "Work Experience" || title.includes("Work Experience")) {
      currentSection = "experience";
      return;
    }

    // --- Parse Education ---
    if (title === "Education" || title.includes("Education")) {
      currentSection = "education";
      return;
    }

    // --- Parse Projects ---
    if (title === "Projects" || title.includes("Projects")) {
      currentSection = "projects";
      return;
    }

    // --- If we're in a section and this line has " @ ", it's an entry ---
    if (currentSection && (title.includes(" @ ") || content.includes(" @ "))) {
      // The title might actually be the entry title
      const entryTitle = title;
      const entryContent = content;

      // Check if this is a valid entry
      if (entryTitle.includes(" @ ")) {
        const titleOrgMatch = entryTitle.match(/^(.*?)\s*@\s*(.*)$/);
        if (titleOrgMatch) {
          const entryTitleText = titleOrgMatch[1].trim();
          const organization = titleOrgMatch[2].trim();

          // Get date and description from content
          const entryLines = [entryTitle, ...lines.slice(1)].filter(Boolean);
          const dateLine = entryLines[1]?.trim() || "";
          let startDate = "";
          let endDate = "";
          let current = false;

          if (dateLine.includes(" - Present")) {
            startDate = dateLine.replace(" - Present", "").trim();
            current = true;
          } else if (dateLine.includes(" - ")) {
            const dates = dateLine.split(" - ");
            startDate = dates[0]?.trim() || "";
            endDate = dates[1]?.trim() || "";
          }

          const description = entryLines.slice(2).join("\n").trim();

          const targetArray = result[currentSection] as Entry[];
          targetArray.push({
            title: entryTitleText,
            organization,
            startDate,
            endDate,
            current,
            description,
          });
        }
      }
    }
  });

  return result;
}