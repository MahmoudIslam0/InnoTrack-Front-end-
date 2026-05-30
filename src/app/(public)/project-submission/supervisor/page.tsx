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
import { SupervisorDto, studentApi } from "@/lib/student-api";

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

const departments = [
  "Computer Science",
  "Software Engineering",
  "Information Systems",
  "Artificial Intelligence",
  "Cybersecurity",
];

export default function SubmitToSupervisor() {
  const router = useRouter();
  const [supervisors, setSupervisors] = useState<SupervisorDto[]>([]);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<number | null>(null);
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

  useEffect(() => {
    let ignore = false;

    studentApi
      .getSupervisors()
      .then((items) => {
        if (ignore) return;
        setSupervisors(items);
        const firstAvailable = items.find((supervisor) => supervisor.isAvailable) || items[0];
        setSelectedSupervisorId(firstAvailable?.id ?? null);
      })
      .catch(() => {
        if (!ignore) toast.error("Could not load supervisors.");
      });

    return () => {
      ignore = true;
    };
  }, []);

  const selectedSupervisor = supervisors.find((supervisor) => supervisor.id === selectedSupervisorId);
  const canSubmit =
    Boolean(proposalData.department) &&
    Boolean(proposalData.teamMembers.trim()) &&
    Boolean(proposalData.message.trim()) &&
    Boolean(selectedSupervisor && selectedSupervisor.isAvailable);

  const submitProposal = async () => {
    if (!proposalData.department || !proposalData.teamMembers || !proposalData.message) {
      toast.error("Please complete the required proposal details");
      return;
    }

    if (!selectedSupervisor || !selectedSupervisor.isAvailable) {
      toast.error("Please select an available supervisor");
      return;
    }

    const projectId = sessionStorage.getItem("projectSubmissionId");
    if (!projectId) {
      toast.error("Save the project draft before submitting.");
      router.push("/project-submission");
      return;
    }

    try {
      await studentApi.submitProject(projectId, {
        supervisorId: selectedSupervisor.id,
        department: proposalData.department,
        teamMembers: proposalData.teamMembers,
        message: proposalData.message,
      });
      toast.success(`Proposal submitted to ${selectedSupervisor.fullName}`);
      router.push("/project-management");
    } catch (error: any) {
      toast.error(error.message || "Could not submit proposal.");
    }
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
              const isFull = !supervisor.isAvailable;

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
                        {supervisor.fullName}
                      </p>
                      <p className="text-sm text-slate-500">
                        {supervisor.departmentName}
                      </p>
                    </div>
                  </div>

                  

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                   
                    <Badge
                      className={`font-medium ${
                        isFull
                          ? "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      }`}
                      variant="secondary"
                    >
                      {isFull
                        ? "Full"
                        : `${supervisor.maxTeamLoad - supervisor.currentTeamLoad} slot${supervisor.maxTeamLoad - supervisor.currentTeamLoad !== 1 ? "s" : ""}`}
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
