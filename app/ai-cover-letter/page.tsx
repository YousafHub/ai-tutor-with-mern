// app/ai-cover-letter/page.tsx
"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterList from "./_components/cover-letter-list";
import { useFetch } from "@/hooks/useFetch";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

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

export default function CoverLetterPage() {
  const router = useRouter();
  
  const { data, loading, error } = useFetch('/api/cover-letter', {
    method: 'GET',
  });

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => handleNavigation("/")}
          className="mt-4 px-4 py-2 bg-primary text-white rounded cursor-pointer"
        >
          Go Home
        </button>
      </div>
    );
  }

  const coverLetters = Array.isArray(data) ? data as CoverLetter[] : [];

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between mb-5">
        <h1 className="text-4xl md:text-6xl font-bold gradient gradient-title">
          My Cover Letters
        </h1>
        <Link href="/ai-cover-letter/new">
          <Button className="cursor-pointer py-4.5 px-3">
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </Link>
      </div>

      {/* ✅ Simple usage - no onDelete prop needed */}
      <CoverLetterList coverLetters={coverLetters} />
    </div>
  );
}