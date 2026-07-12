"use client";

import { useFetch } from "@/hooks/useFetch";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import ResumeBuilder from "../resume/_components/resume-builder";

interface ResumeResponse {
    content: string;
}

export default function ResumePage() {
    const router = useRouter();

    const { data, loading, error } = useFetch('/api/resume', {
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

    const typedData = data as ResumeResponse | null;
    const initialContent = typedData?.content || "";

    return (
        <div className="container mx-auto p-6">
            <ResumeBuilder initialContent={initialContent} user={null} />
        </div>
    );
}