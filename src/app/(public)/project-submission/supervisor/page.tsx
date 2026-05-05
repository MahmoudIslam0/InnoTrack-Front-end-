"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ChevronDown, Send, UserRound, Award } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SavedSubmissionState {
  formData?: {
    title?: string;
    studentNames?: string;
    category?: string;
    technologies?: string;
    abstract?: string;
    description?: string;
  };
  originalityScore?: number;
}

const supervisors = [
  {
    id: "s1",
    name: "Dr. Ahmed Hassan",
    department: "Computer Science",
    tags: ["AI & Machine Learning", "Computer Vision"],
    slots: 2,
    rating: 4.8,
  },
  {
    id: "s2",
    name: "Dr. Fatima Ali",
    department: "Computer Science",
    tags: ["Web Development", "Software Engineering"],
    slots: 3,
    rating: 4.9,
  },
  {
    id: "s3",
    name: "Dr. Omar Khalil",
    department: "Information Systems",
    tags: ["Blockchain", "Distributed Systems"],
    slots: 1,
    rating: 4.7,
  },
  {
    id: "s4",
    name: "Dr. Huda Nasser",
    department: "Computer Science",
    tags: ["NLP", "Data Science"],
    slots: 4,
    rating: 4.9,
  },
  {
    id: "s5",
    name: "Dr. Tariq Ahmed",
    department: "Software Engineering",
    tags: ["Mobile Development", "IoT"],
    slots: 0,
    rating: 4.6,
  },
];

const departments = [
  "Computer Science",
  "Software Engineering",
  "Information Systems",
  "Artificial Intelligence",
  "Cybersecurity",
];

export default function SubmitToSupervisor() {
  const router = useRouter();
  const [selectedSupervisorId, setSelectedSupervisorId] = useState("s1");
  const [submissionState, setSubmissionState] =
    useState<SavedSubmissionState | null>(null);
  const [proposalData, setProposalData] = useState({
    department: "",
    teamSize: "",
    teamMembers: "",
    message: "",
  });

  useEffect(() => {
    const savedState = sessionStorage.getItem("projectSubmissionDraft");
    if (!savedState) return;

    try {
      const parsed = JSON.parse(savedState) as SavedSubmissionState;
      setSubmissionState(parsed);
      setProposalData((current) => ({
        ...current,
        teamMembers: parsed.formData?.studentNames ?? "",
      }));
    } catch {
      setSubmissionState(null);
    }
  }, []);

  const selectedSupervisor = supervisors.find(
    (supervisor) => supervisor.id === selectedSupervisorId,
  );
  const canSubmit =
    Boolean(proposalData.department) &&
    Boolean(proposalData.teamMembers.trim()) &&
    Boolean(proposalData.message.trim()) &&
    Boolean(selectedSupervisor && selectedSupervisor.slots > 0);

  const submitProposal = () => {
    if (!proposalData.department || !proposalData.teamMembers || !proposalData.message) {
      toast.error("Please complete the required proposal details");
      return;
    }

    if (!selectedSupervisor || selectedSupervisor.slots === 0) {
      toast.error("Please select an available supervisor");
      return;
    }

    toast.success(`Proposal submitted to ${selectedSupervisor.name}`);
    router.push("/project-management");
  };

  return (
    <div className="dashboard-page">
      <Button
        variant="ghost"
        className="mb-6 -ml-3 text-slate-600 hover:bg-slate-100 hover:text-slate-950"
        onClick={() => router.push("/project-submission")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Submission
      </Button>

      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-semibold text-slate-950">
          Submit to Supervisor
        </h1>
        <p className="text-slate-600">
          Choose a supervisor and submit your project proposal
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-6">
          <section className="dashboard-surface p-6">
            <h2 className="mb-5 text-lg font-semibold text-slate-950">
              Proposal Details
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="department">Department *</Label>
                <div className="relative">
                  <select
                    id="department"
                    value={proposalData.department}
                    onChange={(event) =>
                      setProposalData((current) => ({
                        ...current,
                        department: event.target.value,
                      }))
                    }
                    className="h-10 w-full appearance-none rounded-lg border border-transparent bg-slate-100 px-3 pr-10 text-sm text-slate-700 outline-none transition-colors focus:border-indigo-200 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">Select your department</option>
                    {departments.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="teamSize">Team Size</Label>
                  <Input
                    id="teamSize"
                    placeholder="e.g., 3"
                    value={proposalData.teamSize}
                    onChange={(event) =>
                      setProposalData((current) => ({
                        ...current,
                        teamSize: event.target.value,
                      }))
                    }
                    className="bg-slate-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="teamMembers">Team Members *</Label>
                  <Input
                    id="teamMembers"
                    placeholder="e.g., John, Sarah, Ali"
                    value={proposalData.teamMembers}
                    onChange={(event) =>
                      setProposalData((current) => ({
                        ...current,
                        teamMembers: event.target.value,
                      }))
                    }
                    className="bg-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="proposalMessage">Proposal Message *</Label>
                <Textarea
                  id="proposalMessage"
                  placeholder="Write a message to the professor explaining why you'd like them to supervise your project. Include your project goals, timeline, and any specific expertise you're seeking..."
                  value={proposalData.message}
                  onChange={(event) =>
                    setProposalData((current) => ({
                      ...current,
                      message: event.target.value,
                    }))
                  }
                  className="min-h-[200px] resize-y bg-slate-100"
                />
                <p className="text-xs text-slate-500">
                  Be specific about what you hope to achieve and why this professor is a good fit
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-6 shadow-sm">
            <h2 className="mb-2 text-base font-semibold text-indigo-900">
              Your Project Summary
            </h2>
            <div className="text-sm text-indigo-700">
              <span className="font-medium">Category:</span>{" "}
              {submissionState?.formData?.category || "Blockchain"}
            </div>
          </section>
        </div>

        <aside className="dashboard-surface overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-950">
              Select Supervisor
            </h2>
          </div>

          <div className="max-h-[500px] space-y-4 overflow-y-auto px-6 py-4 pr-3 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-600">
            {supervisors.map((supervisor) => {
              const isSelected = supervisor.id === selectedSupervisorId;
              const isFull = supervisor.slots === 0;

              return (
                <button
                  key={supervisor.id}
                  type="button"
                  disabled={isFull}
                  onClick={() => setSelectedSupervisorId(supervisor.id)}
                  className={`w-full rounded-xl border p-5 text-left transition-all ${
                    isSelected
                      ? "border-indigo-400 bg-white ring-1 ring-indigo-400 shadow-sm"
                      : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
                  } ${isFull ? "cursor-not-allowed opacity-55" : ""}`}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-500">
                      <UserRound className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-slate-900">
                        {supervisor.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {supervisor.department}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {supervisor.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-slate-100/80 text-slate-700 font-medium border border-slate-200/50 hover:bg-slate-200/80"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                      <Award className="h-4 w-4 text-amber-500" />
                      {supervisor.rating}
                    </div>
                    <Badge
                      className={`font-medium ${
                        isFull
                          ? "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      }`}
                      variant="secondary"
                    >
                      {isFull ? "Full" : `${supervisor.slots} slot${supervisor.slots !== 1 ? 's' : ''}`}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="border-t border-slate-100 p-6">
            <Button
              className="h-11 w-full bg-indigo-500 text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-45"
              onClick={submitProposal}
              disabled={!canSubmit}
            >
              <Send className="mr-2 h-4 w-4" />
              Submit Proposal
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
