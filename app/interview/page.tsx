"use client";

import { useFetch } from "@/hooks/useFetch";
import StatsCards from "./_components/stat-cards";
import PerformanceChart from "./_components/performance-chart";
import QuizList from "./_components/quiz-list";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface Assessment {
  id: string;
  userId: string;
  quizScore: number;
  questions: any[];
  category: string;
  improvementTip?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export default function InterviewPage() {
  const router = useRouter();
  const { data, loading, error } = useFetch('/api/interview/assessments', {
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
          className="mt-4 px-4 py-2 bg-black text-white rounded cursor-pointer"
        >
          Go Home
        </button>
      </div>
    );
  }

  const assessments = Array.isArray(data) ? data : [];


  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl md:text-6xl font-bold gradient gradient-title mb-6">
        Interview Preparation
      </h1>

      <div className="space-y-6">
        <StatsCards assessments={assessments} />
        <PerformanceChart assessments={assessments} />
        <QuizList assessments={assessments} />
      </div>
    </div>
  );
}