// lib/zodSchema.ts
import { z } from 'zod';

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
    .min(8, { message: "Password must be at least 8 characters" })
    .max(50, { message: "Password must be less than 50 characters" })
    .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Must contain at least one number" })
    .regex(/[@$!%*?&#]/, { message: "Must contain at least one special character" }),
});

// Onboarding schema - all fields are strings (matching your form inputs)
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

// Types
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;

// API data type (transformed)
export interface OnboardingApiData {
  industry: string;
  subIndustry: string;
  experience: number;
  skills: string[];
  bio?: string;
}