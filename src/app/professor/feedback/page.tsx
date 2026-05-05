import { MessageSquareText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { feedbackHistory } from "../_data";
import { PageHeader, SectionCard } from "../_components";

const decisionTone = {
  "Proposal Approved": "bg-blue-500/20 text-blue-800 border-blue-200",
  "Proposal Rejected": "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/20",
  "Submission Accepted": "bg-green-100 text-green-800 border-green-200",
  "Submission Rejected": "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/20",
};

export default function ProfessorFeedback() {
  const submissionFeedback = feedbackHistory.filter((item) =>
    item.decision.startsWith("Submission"),
  );

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Feedback"
        description="Review feedback attached to final submission accept and reject decisions."
      />

      <SectionCard title="Submission-Related Feedback History">
        <div className="space-y-4">
          {submissionFeedback.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-muted rounded-xl border border-border/50"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <MessageSquareText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {item.projectTitle}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.team} - {item.createdAt}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={decisionTone[item.decision]}
                >
                  {item.decision}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{item.content}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
