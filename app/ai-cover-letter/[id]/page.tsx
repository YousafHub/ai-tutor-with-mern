"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterPreview from "../_components/cover-letter-preview";
import { useFetch } from "@/hooks/useFetch";
import { Loader2 } from "lucide-react";
import { use } from "react";

interface CoverLetter {
  _id: string;
  userId: string;
  content: string;
  jobDescription: string;
  companyName: string;
  jobTitle: string;
  status: 'draft' | 'completed';
  createdAt: string | Date;
  updatedAt: string | Date;
}

export default function EditCoverLetterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);


  const { data, loading, error } = useFetch(
    `/api/cover-letter/${id}`,
    {
      method: "GET",
    }
  );

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col space-y-2">
          <Link href="/ai-cover-letter">
            <Button variant="link" className="gap-2 pl-0 cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
              Back to Cover Letters
            </Button>
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold gradient gradient-title mb-6">
            Cover Letter Not Found
          </h1>
          <p className="text-muted-foreground">
            The cover letter you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const coverLetter = data as CoverLetter;

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-2">
        <Link href="/ai-cover-letter">
          <Button variant="link" className="gap-2 pl-0 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            Back to Cover Letters
          </Button>
        </Link>

        <h1 className="text-4xl md:text-6xl font-bold gradient gradient-title mb-6">
          {coverLetter.jobTitle} at {coverLetter.companyName}
        </h1>
      </div>

      <CoverLetterPreview content={coverLetter.content || ""} />
    </div>
  );
}