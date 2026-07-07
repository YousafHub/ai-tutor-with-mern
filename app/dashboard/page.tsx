// app/dashboard/page.tsx
"use client";

import { useFetch } from "@/hooks/useFetch";
import DashboardView from "./_component/dashboard-view";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const IndustryInsightsPage = () => {

    const router = useRouter()

    const { data, loading, error } = useFetch('/api/industry/insights', {
        method: 'POST',
        body: JSON.stringify({}),
    });

    const handleNavigation = async (path: string) => {
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

    if (!data) return null;

    return <DashboardView insights={data} />;
};

export default IndustryInsightsPage;