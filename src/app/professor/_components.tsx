import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
} from "lucide-react";

export {
  PageHeader,
  ProjectTable,
  SectionCard,
  StatCard as ProfessorStatCard,
  StatusBadge,
} from "@/app/_components/DashboardUI";

export function OriginalityMeter({ score }: { score: number }) {
  const isLow = score < 70;
  const color = isLow ? "#EF4444" : score < 80 ? "#F59E0B" : "#10B981";

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="#E5E7EB"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-2xl font-bold text-foreground">
          {score}%
        </span>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          {isLow ? (
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          )}
          <p className="text-sm font-semibold text-foreground">
            {isLow ? "Low originality score" : "Originality acceptable"}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Projects below 70% are highlighted for professor review.
        </p>
      </div>
    </div>
  );
}

export const statusIcons = {
  draft: FileText,
  "in-progress": Clock,
  submitted: AlertTriangle,
  completed: CheckCircle2,
};
