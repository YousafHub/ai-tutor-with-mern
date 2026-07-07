// app/onboarding/page.tsx
"use client";

import { industries } from "@/data/industries";
import OnboardingForm from "./_component/onboarding-form";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-2xl">
        <OnboardingForm industries={industries} />
      </div>
    </div>
  );
}