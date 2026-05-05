import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function HeroCard() {
  const originalityScore = 85;

  return (
    <div className="relative overflow-hidden bg-indigo-500/10 rounded-3xl p-8 md:p-10 border border-border shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:border-indigo-500/30 group">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl opacity-50 pointer-events-none transition-transform duration-700 group-hover:scale-150"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl opacity-50 pointer-events-none transition-transform duration-700 group-hover:scale-150"></div>
      
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
            <Link href="/project-submission">
              <Button className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto text-base">
                <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                Submit Idea
              </Button>
            </Link>
          </div>
        </div>

       
      </div>
    </div>
  );
}
