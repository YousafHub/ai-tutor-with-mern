"use client";

import { industries } from "@/data/industries";
import OnboardingForm from "./_component/onboarding-form";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-background">
      <OnboardingForm industries={industries} />
    </div>
  );
}