"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { onboardingSchema, type OnboardingInput, type OnboardingApiData } from "@/lib/zodSchema";
import { type Industry } from "@/data/industries";
import { showToast } from "@/lib/showToast";

interface OnboardingFormProps {
  industries: Industry[];
}

export default function OnboardingForm({ industries }: OnboardingFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const router = useRouter();

  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      industry: "",
      subIndustry: "",
      experience: "",
      skills: "",
      bio: "",
    },
  });

  const onSubmit = async (values: OnboardingInput) => {
    try {
      setLoading(true);
      
      const formattedIndustry = `${values.industry}-${values.subIndustry?.toLowerCase().replace(/ /g, "-")}`;

      const apiData: OnboardingApiData = {
        industry: formattedIndustry,
        subIndustry: values.subIndustry,
        experience: parseInt(values.experience, 10),
        skills: values.skills ? values.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
        bio: values.bio,
      };

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      showToast("success", "Profile completed successfully!");
      router.push("/dashboard");
      router.refresh();
      
    } catch (error: any) {
      showToast("error", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const watchIndustry = form.watch("industry");

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-2 pt-24 pb-16">
      <Card className="w-full max-w-lg border-border/50 shadow-lg">
        <CardHeader className="space-y-2 pb-2">
          <CardTitle className="text-2xl md:text-3xl font-bold gradient gradient-title">
            Complete your Profile
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Select your industry to get personalized career insights and recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Form {...form}>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              {/* Industry */}
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Industry</FormLabel>
                    <Select
                      value={field.value} 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedIndustry(
                          industries.find((industry) => industry.id === value) || null
                        );
                        form.setValue("subIndustry", "");
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full h-10 bg-muted/50 cursor-pointer">
                          <SelectValue placeholder="Select an industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem className="cursor-pointer" value={industry.id} key={industry.id}>
                            {industry.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sub Industry */}
              {watchIndustry && (
                <FormField
                  control={form.control}
                  name="subIndustry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Specialization</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full h-10 bg-muted/50 cursor-pointer">
                            <SelectValue placeholder="Select your specialization" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectedIndustry?.subIndustries.map((industry) => (
                            <SelectItem className="cursor-pointer" value={industry} key={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Experience */}
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Years of Experience</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        placeholder="Enter years of experience"
                        className="h-10 bg-muted/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Skills */}
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Skills</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Python, JavaScript, Project Management"
                        className="h-10 bg-muted/50"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Separate multiple skills with commas
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bio */}
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Professional Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your professional background"
                        className="min-h-[100px] bg-muted/50 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-10 cursor-pointer bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 dark:from-gray-500 dark:to-gray-700 dark:hover:from-gray-600 dark:hover:to-gray-800 text-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Complete Profile"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}