"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import {
  Save,
  Send,
  TrendingUp,
  AlertCircle,
  Bot,
  Upload,
  FileText,
  Edit2,
  Trash2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

interface Draft {
  id: string;
  title: string;
  date: string;
  originalityScore: number;
}

const mockDrafts: Draft[] = [
  {
    id: "1",
    title: "Smart Campus Navigation System",
    date: "2026-02-28",
    originalityScore: 85,
  },
  {
    id: "2",
    title: "AI-Powered Learning Assistant",
    date: "2026-02-25",
    originalityScore: 72,
  },
];

const similarProjects = [
  {
    id: "1",
    title: "Indoor Navigation Using Bluetooth Beacons",
    similarity: 45,
  },
  { id: "2", title: "AR Campus Guide Application", similarity: 38 },
  { id: "3", title: "University Wayfinding System", similarity: 32 },
];

function ProjectSubmissionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editId = searchParams.get("edit");
  const editMode = searchParams.get("mode");
  const draftId = searchParams.get("draft");
  const isDetailsOnly = editMode === "details-only";
  const isEditing = Boolean(editId) || Boolean(draftId);

  const [originalityScore, setOriginalityScore] = useState(0);
  const [hasRunSimilarityCheck, setHasRunSimilarityCheck] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingPDF, setIsProcessingPDF] = useState(false);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    studentNames: "",
    year: "2026",
    category: "",
    technologies: "",
    abstract: "",
    description: "",
    problemStatement: "",
    proposedSolution: "",
    objectives: "",
  });

  // Restore state from sessionStorage on mount if no specific ID is provided
  useEffect(() => {
    if (!editId && !draftId) {
      const savedState = sessionStorage.getItem("projectSubmissionDraft");
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          setFormData(parsed.formData);
          setOriginalityScore(parsed.originalityScore);
          setHasRunSimilarityCheck(parsed.hasRunSimilarityCheck);
        } catch (e) {
          console.error("Failed to parse saved draft state");
        }
      }
    }
  }, [editId, draftId]);

  // Save state to sessionStorage when it changes
  useEffect(() => {
    sessionStorage.setItem("projectSubmissionDraft", JSON.stringify({
      formData,
      originalityScore,
      hasRunSimilarityCheck
    }));
  }, [formData, originalityScore, hasRunSimilarityCheck]);


  // Pre-fill form when editing an approved project or loading a draft
  useEffect(() => {
    if (initialized) return;

    if (editId && isDetailsOnly) {
      // Editing an approved project — load its data
      setFormData({
        title: "Smart Campus Navigation System",
        studentNames: "Mohamed Ayman, Sarah Ahmed",
        year: "2026",
        category: "IoT & Mobile",
        technologies: "React Native, ARKit, Firebase",
        abstract:
          "A mobile application that provides real-time indoor navigation for university campus buildings using augmented reality and Bluetooth beacons.",
        description:
          "The Smart Campus Navigation System is designed to address the challenges faced by students in navigating large university campuses. By integrating AR technology with indoor positioning systems, the application provides an intuitive and interactive wayfinding experience.",
        problemStatement:
          "Students and visitors often struggle to find specific rooms, offices, or facilities within large university buildings, leading to time wastage and frustration.",
        proposedSolution:
          "Develop a mobile AR application that overlays directional arrows and information on the camera view, guiding users to their destination using Bluetooth beacons for accurate indoor positioning.",
        objectives:
          "1. Implement accurate indoor positioning using BLE beacons\n2. Develop an intuitive AR interface\n3. Create a comprehensive database of campus locations\n4. Integrate with university timetable system\n5. Ensure accessibility features",
      });
      setOriginalityScore(85);
      setHasRunSimilarityCheck(true);
      setInitialized(true);
    } else if (draftId) {
      const draft = mockDrafts.find((d) => d.id === draftId);
      if (draft) {
        handleLoadDraft(draft);
        setInitialized(true);
      }
    }
  }, [editId, draftId, isDetailsOnly, initialized]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRunSimilarityCheck = () => {
    const simulatedScore = Math.floor(Math.random() * 40) + 60;
    setOriginalityScore(simulatedScore);
    setHasRunSimilarityCheck(true);

    const categories = [
      "AI & Machine Learning",
      "Web Development",
      "Mobile Development",
      "IoT & Embedded Systems",
      "Blockchain",
      "Computer Vision",
    ];
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];
    setFormData((prev) => ({ ...prev, category: randomCategory }));
    
    toast.success(`Similarity check completed. Score: ${simulatedScore}%`);
  };

  const handleSaveDraft = () => {
    if (!formData.title) {
      toast.error("Please enter a project title to save as draft");
      return;
    }
    toast.success("Draft saved successfully");
  };

  const handleSubmitToSupervisor = () => {
    if (!hasRunSimilarityCheck) {
      toast.error("Please run the similarity check first");
      return;
    }
    if (originalityScore < 60) {
      toast.error("Project originality must be above 60% to submit");
      return;
    }
    
    if (isDetailsOnly) {
      // Simulate originality score changing slightly due to edits
      const newScore = Math.min(100, originalityScore + Math.floor(Math.random() * 5) - 1);
      setOriginalityScore(newScore);
      toast.success(`Project Details Updated. New Originality Score: ${newScore}%`);
      router.push("/project-management");
      return;
    }
    
    router.push("/project-submission/supervisor");
  };

  const handleGetAIHelp = () => {
    if (!hasRunSimilarityCheck) {
      toast.error("Please run the similarity check first to calculate originality before getting AI help.");
      return;
    }
    const contextStr = encodeURIComponent(JSON.stringify({ ...formData, originalityScore }));
    router.push(`/innochat?context=${contextStr}`);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
      processUploadedPDF(file);
    } else {
      toast.error("Please upload a valid PDF file");
    }
  };

  const processUploadedPDF = async (file: File) => {
    setIsProcessingPDF(true);
    toast.info("Extracting data from PDF...");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setFormData({
      title: "Smart Campus Navigation System",
      studentNames: "John Smith, Sarah Ahmed",
      year: "2026",
      category: "",
      technologies: "React Native, ARKit, Firebase, TensorFlow",
      abstract:
        "This project proposes an AI-powered indoor navigation application using Augmented Reality (AR) technology to assist students in finding classrooms, laboratories, and facilities within the university campus. The system leverages machine learning algorithms to provide optimal routes and real-time guidance.",
      description:
        "The Smart Campus Navigation System is designed to address the challenges faced by students, especially new ones, in navigating large university campuses. By integrating AR technology with indoor positioning systems, the application provides an intuitive and interactive wayfinding experience.",
      problemStatement:
        "Students, particularly freshmen and visitors, often struggle to locate specific buildings, rooms, and facilities on large university campuses. Traditional signage and maps are static and may not provide the most efficient routes, leading to time wastage and frustration.",
      proposedSolution:
        "Develop a mobile application that uses AR overlays to guide users to their destinations. The app will integrate with indoor positioning systems using WiFi triangulation and Bluetooth beacons to provide accurate location tracking. Machine learning algorithms will optimize route suggestions based on real-time data such as crowd density and accessibility requirements.",
      objectives:
        "1. Develop an AR-based navigation interface for mobile devices\n2. Implement indoor positioning using WiFi and Bluetooth technologies\n3. Create a database of campus buildings and facilities\n4. Integrate machine learning for route optimization\n5. Ensure accessibility features for users with disabilities",
    });

    setIsProcessingPDF(false);
    toast.success("Project details extracted successfully");
  };

  const handleLoadDraft = (draft: Draft) => {
    setFormData({
      title: draft.title,
      studentNames: "John Smith, Sarah Ahmed",
      year: "2026",
      category: "AI & Machine Learning",
      technologies:
        draft.id === "1"
          ? "React Native, ARKit, Firebase, TensorFlow"
          : "Python, GPT-4, React, Node.js",
      abstract:
        draft.id === "1"
          ? "This project proposes an AI-powered indoor navigation application using Augmented Reality (AR) technology."
          : "An intelligent learning assistant powered by advanced AI to help students with their studies.",
      description: "Comprehensive project description...",
      problemStatement: "Problem statement details...",
      proposedSolution: "Proposed solution details...",
      objectives: "Project objectives...",
    });
    setOriginalityScore(draft.originalityScore);
    setHasRunSimilarityCheck(true);
    setSelectedDraftId(draft.id);
    toast.success(`Draft "${draft.title}" loaded`);
  };

  const handleDeleteDraft = (draftId: string) => {
    toast.success("Draft deleted successfully");
  };

  if (!true) {
    return (
      <div className="p-4 md:p-8 max-w-350 mx-auto">
        <div className="bg-card text-card-foreground rounded-2xl p-12 border border-border shadow-sm text-center backdrop-blur-xl">
          <AlertCircle className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-3">
            Authentication Required
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            You need to be logged in to submit a project proposal. Please sign
            in or create an account to continue.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline">Create Account</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-350 mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <Button
          variant="ghost"
          className="mb-3 -ml-3 text-muted-foreground hover:text-foreground"
          onClick={() => router.push("/project-management")}
        >
          ← Back to Project Management
        </Button>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-2">
          {isDetailsOnly ? "Edit Project Details" : isEditing ? "Edit Draft" : "Project Submission"}
        </h1>
        <p className="text-muted-foreground">
          {isDetailsOnly
            ? "Update the editable details of your approved project"
            : isEditing
              ? "Continue working on your saved draft"
              : "Submit your graduation project proposal"}
        </p>
      </div>

      {/* Details-only mode banner */}
      {isDetailsOnly && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 mb-6">
          <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              Limited Editing Mode
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              This project has been approved. You can edit the title, description, technologies, and objectives. Other proposal fields are locked.
            </p>
          </div>
        </div>
      )}

 



      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form - 2 columns */}
        <div className="lg:col-span-2 space-y-8">
          {/* Project Details Card */}
          <div className="bg-card text-card-foreground rounded-2xl p-6 border border-border shadow-sm transition-all hover:shadow-md">
            <h3 className="text-xl font-semibold mb-6 pb-2 border-b border-border/50">
              Project Details
            </h3>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Smart Campus Navigation System"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="h-12 bg-background/50 focus:bg-background text-lg"
                  />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="studentNames">Student Names *</Label>
                <Input
                  id="studentNames"
                  placeholder="e.g., John Smith, Sarah Ahmed"
                  value={formData.studentNames}
                  onChange={(e) =>
                    handleInputChange("studentNames", e.target.value)
                  }
                  className={isDetailsOnly ? "bg-muted text-muted-foreground" : "bg-background/50 focus:bg-background"}
                  disabled={isDetailsOnly}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    value={formData.year}
                    disabled
                    className="bg-muted text-muted-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category" className="flex items-center gap-2">
                    Category
                    {hasRunSimilarityCheck && (
                      <span className="text-xs text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                        Auto-generated
                      </span>
                    )}
                  </Label>
                  <Input
                    id="category"
                    value={formData.category}
                    placeholder={
                      hasRunSimilarityCheck
                        ? ""
                        : "Run similarity check to generate"
                    }
                    disabled
                    className="bg-muted text-muted-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="technologies">Technologies *</Label>
                <Input
                  id="technologies"
                  placeholder="e.g., React, Python, TensorFlow, Firebase"
                  value={formData.technologies}
                  onChange={(e) =>
                    handleInputChange("technologies", e.target.value)
                  }
                  className="bg-background/50 focus:bg-background"
                />
              </div>
            </div>
          </div>

          {/* Project Description Card */}
          <div className="bg-card text-card-foreground rounded-2xl p-6 border border-border shadow-sm transition-all hover:shadow-md">
            <h3 className="text-xl font-semibold mb-6 pb-2 border-b border-border/50">
              Project Description
            </h3>

            <div className="space-y-6">
              <div className="space-y-1.5">
                <Label htmlFor="abstract" className="flex flex-wrap items-center gap-2">
                  Abstract *
                  <span className="text-xs text-muted-foreground/80 font-normal">
                    (AI-generated summary available after similarity check)
                  </span>
                </Label>
                <Textarea
                  id="abstract"
                  placeholder="Brief summary of your project (150-250 words)"
                  value={formData.abstract}
                  onChange={(e) =>
                    handleInputChange("abstract", e.target.value)
                  }
                  className={isDetailsOnly ? "min-h-[120px] bg-muted text-muted-foreground resize-y" : "min-h-[120px] bg-background/50 focus:bg-background resize-y"}
                  disabled={isDetailsOnly}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Comprehensive description of your project"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="min-h-[160px] bg-background/50 focus:bg-background resize-y"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="problemStatement">Problem Statement *</Label>
                <Textarea
                  id="problemStatement"
                  placeholder="What problem does your project solve?"
                  value={formData.problemStatement}
                  onChange={(e) =>
                    handleInputChange("problemStatement", e.target.value)
                  }
                  className={isDetailsOnly ? "min-h-[120px] bg-muted text-muted-foreground resize-y" : "min-h-[120px] bg-background/50 focus:bg-background resize-y"}
                  disabled={isDetailsOnly}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="proposedSolution">Proposed Solution *</Label>
                <Textarea
                  id="proposedSolution"
                  placeholder="How will your project solve the problem?"
                  value={formData.proposedSolution}
                  onChange={(e) =>
                    handleInputChange("proposedSolution", e.target.value)
                  }
                  className={isDetailsOnly ? "min-h-[160px] bg-muted text-muted-foreground resize-y" : "min-h-[160px] bg-background/50 focus:bg-background resize-y"}
                  disabled={isDetailsOnly}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="objectives">Objectives *</Label>
                <Textarea
                  id="objectives"
                  placeholder="List the main objectives of your project"
                  value={formData.objectives}
                  onChange={(e) =>
                    handleInputChange("objectives", e.target.value)
                  }
                  className="min-h-[120px] bg-background/50 focus:bg-background resize-y"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            {!isDetailsOnly && (
              <Button
                onClick={handleSaveDraft}
                variant="outline"
                className="flex-1 h-12 rounded-xl border-border hover:bg-accent"
              >
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
            )}
            <Button
              onClick={handleGetAIHelp}
              variant="outline"
              className={`flex-1 h-12 rounded-xl border-purple-500/30 text-purple-600 dark:text-purple-400 ${
                !hasRunSimilarityCheck
                  ? "opacity-50 hover:bg-transparent"
                  : "hover:bg-purple-500/10"
              }`}
            >
              <Bot className="w-4 h-4 mr-2" />
              Get AI Help
            </Button>
            <Button
              onClick={handleSubmitToSupervisor}
              className="flex-1 h-12 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20"
              disabled={originalityScore < 60}
            >
              <Send className="w-4 h-4 mr-2" />
              {isDetailsOnly ? "Update Project Details" : "Submit to Supervisor"}
            </Button>
          </div>

          {originalityScore > 0 && originalityScore < 60 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-5 flex items-start gap-4 animate-in slide-in-from-bottom-4">
              <div className="bg-yellow-500/20 p-2 rounded-lg shrink-0">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-300">
                  Originality Score Below Threshold
                </p>
                <p className="text-sm text-yellow-800/80 dark:text-yellow-400/80 mt-1">
                  Your project needs an originality score above 60% to submit to
                  a supervisor. Please revise your project idea to improve
                  originality.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - 1 column */}
        <div className="lg:col-span-1 space-y-8">
          {/* Originality Score */}
          <div className="bg-card text-card-foreground rounded-2xl p-6 border border-border shadow-sm text-center">
            <h3 className="text-lg font-semibold mb-6">
              Originality Score
            </h3>

            <div className="flex flex-col items-center justify-center mb-6">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90 filter drop-shadow-md">
                  <circle
                    cx="80"
                    cy="80"
                    r="72"
                    stroke="currentColor"
                    className="text-muted/30"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="72"
                    stroke={originalityScore >= 60 ? "#10B981" : originalityScore > 0 ? "#EF4444" : "#6366f1"}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 72}`}
                    strokeDashoffset={`${2 * Math.PI * 72 * (1 - (originalityScore || 100) / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold tracking-tighter">
                    {originalityScore}%
                  </span>
                </div>
              </div>
              {hasRunSimilarityCheck && (
                <p className="text-xs text-muted-foreground mt-4">
                  Last checked: Just now
                </p>
              )}
            </div>

            <Button
              variant="outline"
              className="w-full h-11 rounded-xl"
              onClick={handleRunSimilarityCheck}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Run Similarity Check
            </Button>
          </div>

          {/* Similar Projects */}
          {hasRunSimilarityCheck && (
            <div className="bg-card text-card-foreground rounded-2xl p-6 border border-border shadow-sm">
              <h3 className="text-lg font-semibold mb-4">
                Similar Projects
              </h3>

              <div className="space-y-3">
              {similarProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 bg-background/50 rounded-xl border border-border/50 hover:border-border transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="text-sm font-medium flex-1 leading-snug">
                      {project.title}
                    </p>
                    <Badge variant="secondary" className="text-xs font-semibold bg-accent">
                      {project.similarity}%
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 h-8"
                    asChild
                  >
                    <Link href={`/projects/${project.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProjectSubmission() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-muted-foreground">Loading...</div></div>}>
      <ProjectSubmissionPage />
    </Suspense>
  );
}
