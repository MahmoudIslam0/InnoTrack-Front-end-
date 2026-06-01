"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { studentApi } from "@/lib/student-api";

export function HeroCard() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmitIdea = async () => {
    setIsChecking(true);
    try {
      const team = await studentApi.getMyTeam();
      if (!team) {
        toast.warning("You need to be in a team before submitting a project idea.", {
          description: "Join or create a team first, then come back to submit your idea.",
          action: {
            label: "Go to Teams",
            onClick: () => router.push("/teams"),
          },
        });
        router.push("/teams");
        return;
      }
      // Set the active tab so project-management opens on "New Idea"
      localStorage.setItem("projectManagementActiveTab", "submit-idea");
      router.push("/project-management");
    } catch {
      // If the API call fails, fall back to project-management directly
      localStorage.setItem("projectManagementActiveTab", "submit-idea");
      router.push("/project-management");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-indigo-500/10 rounded-3xl p-8 md:p-10 border border-border shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:border-indigo-500/30 group">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl opacity-50 pointer-events-none transition-transform duration-700 group-hover:scale-150" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl opacity-50 pointer-events-none transition-transform duration-700 group-hover:scale-150" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
        {/* Left Content */}
        <div className="flex-1 max-w-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
              Submit or Improve Your Project Idea
            </h2>
          </div>

          <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed">
            Share your innovative graduation project idea and get instant
            feedback on originality. Our AI-powered system helps you avoid
            redundancy and ensures your project stands out.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4">
            <Button
              onClick={handleSubmitIdea}
              disabled={isChecking}
              className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto text-base disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
            >
              <Sparkles className={`w-5 h-5 mr-2 ${isChecking ? "animate-spin" : "animate-pulse"}`} />
              {isChecking ? "Checking..." : "Submit Idea"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
