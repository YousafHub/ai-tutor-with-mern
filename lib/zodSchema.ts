// lib/zodSchema.ts
import { z } from 'zod';

// ============ AUTH SCHEMAS ============
export const signupSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string()
    .email('Please enter a valid email address'),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(50, { message: "Password must be less than 50 characters" })
    .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Must contain at least one number" })
    .regex(/[@$!%*?&#]/, { message: "Must contain at least one special character" }),
});

export const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address'),
  password: z.string()
    .min(6, 'Password is required'),
});

// ============ ONBOARDING SCHEMA ============
export const onboardingSchema = z.object({
  industry: z.string()
    .min(1, "Please select an industry"),
  subIndustry: z.string()
    .min(1, "Please select a specialization"),
  bio: z.string()
    .max(500, "Bio must be less than 500 characters")
    .optional(),
  experience: z.string()
    .min(1, "Experience is required")
    .refine((val) => !isNaN(Number(val)), "Experience must be a number")
    .refine((val) => Number(val) >= 0, "Experience must be at least 0 years")
    .refine((val) => Number(val) <= 50, "Experience cannot exceed 50 years"),
  skills: z.string()
    .optional(),
});

export interface OnboardingApiData {
  industry: string;
  subIndustry: string;
  experience: number;
  skills: string[];
  bio?: string;
}

// ============ RESUME SCHEMAS ============

// Contact Information Schema
export const contactSchema = z.object({
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(1, "Mobile number is required"),
  linkedin: z.string().url("Invalid LinkedIn URL").optional(),
  twitter: z.string().url("Invalid Twitter URL").optional(),
});

// ✅ FIXED: entrySchema with current as required
// lib/zodSchema.ts
export const entrySchema = z.object({
  title: z.string().min(1, "Title is required"),
  organization: z.string().min(1, "Organization is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(), // ✅ Already optional
  description: z.string().min(1, "Description is required"),
  current: z.boolean(),
}).superRefine((data, ctx) => {
  if (!data.current && !data.endDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End date is required unless this is your current position",
      path: ["endDate"],
    });
  }
});

// Resume Schema
export const resumeSchema = z.object({
  contactInfo: contactSchema,
  summary: z.string().min(1, "Professional summary is required"),
  skills: z.string().min(1, "Skills are required"),
  experience: z.array(entrySchema),
  education: z.array(entrySchema),
  projects: z.array(entrySchema),
});

// ============ TYPES ============
export type ContactFormValues = z.infer<typeof contactSchema>;
export type EntryFormValues = z.infer<typeof entrySchema>;
export type ResumeFormValues = z.infer<typeof resumeSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;