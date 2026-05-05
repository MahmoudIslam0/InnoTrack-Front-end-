"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Users,
  BookOpen,
  Code,
  CheckCircle,
  Clock,
  Award,
  Download,
  Presentation,
  MessageSquare,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Project {
  id: string;
  title: string;
  year: number;
  category: string;
  supervisor: string;
  status: string;
  technologies: string[];
  students: { name: string; role: "Leader" | "Member"; major?: string; department?: string }[];
  description?: string;
  abstract?: string;
  problemStatement?: string;
  proposedSolution?: string;
  objectives?: string[];
  dateSubmitted?: string;
  dateApproved?: string;
  originalityScore?: number;
}

const allProjects: Project[] = [
  {
    id: "1",
    title: "Smart Campus Navigation System",
    year: 2026,
    category: "IoT & Mobile",
    supervisor: "Dr. Ahmed Hassan",
    status: "In Progress",
    technologies: ["React Native", "ARKit", "Firebase"],
    students: [
      { name: "John Smith", role: "Leader", major: "Software Engineering", department: "Computer Science" },
      { name: "Sarah Ahmed", role: "Member", major: "AI", department: "Computer Science" },
    ],
    description: "Mobile indoor navigation with AR overlays, crowd-aware routing, and campus facility search. The system provides real-time guidance using Bluetooth beacon positioning.",
    abstract:
      "A mobile application that provides real-time indoor navigation for university campus buildings using augmented reality and Bluetooth beacons. The system helps students, visitors, and staff navigate complex campus buildings efficiently.",
    problemStatement:
      "Students and visitors often struggle to find specific rooms, offices, or facilities within large university buildings, leading to time wastage and frustration. Traditional maps and signage are often confusing or outdated.",
    proposedSolution:
      "Develop a mobile AR application that overlays directional arrows and information on the camera view, guiding users to their destination. The system uses Bluetooth beacons for accurate indoor positioning and provides turn-by-turn navigation.",
    objectives: [
      "Implement accurate indoor positioning using Bluetooth Low Energy (BLE) beacons",
      "Develop an intuitive AR interface for navigation visualization",
      "Create a comprehensive database of campus locations and points of interest",
      "Integrate with university timetable system for automatic classroom navigation",
      "Ensure accessibility features for users with disabilities",
    ],
    dateSubmitted: "2026-02-15",
    dateApproved: "2026-02-20",
    originalityScore: 85,
  },
  {
    id: "2",
    title: "Automated Exam Proctoring",
    year: 2026,
    category: "AI & Computer Vision",
    supervisor: "Dr. Fatima Ali",
    status: "In Progress",
    technologies: ["Python", "OpenCV", "YOLOv8"],
    students: [
      { name: "Mohammed Ali", role: "Leader", major: "Computer Vision", department: "Computer Science" },
      { name: "Noor Hassan", role: "Member", major: "Software Engineering", department: "Computer Science" },
    ],
    description: "Computer vision system that detects exam anomalies and prepares review summaries for instructors. Analyzes video streams and identifies suspicious movement patterns.",
    abstract:
      "An AI-powered system that monitors online exams and detects suspicious behavior using computer vision and machine learning techniques. The system provides real-time alerts to proctors and generates detailed reports.",
    problemStatement:
      "With the rise of online education, maintaining academic integrity during remote examinations has become challenging. Manual proctoring is time-consuming and may not detect all forms of cheating.",
    proposedSolution:
      "Develop an automated proctoring system using computer vision to detect unusual behaviors such as multiple people in frame, looking away from screen, and suspicious objects. The system uses deep learning models for real-time analysis.",
    objectives: [
      "Implement face detection and recognition to verify student identity",
      "Develop behavior analysis algorithms to detect suspicious activities",
      "Create a dashboard for proctors to monitor multiple exams simultaneously",
      "Generate automated reports with flagged incidents and timestamps",
      "Ensure student privacy and data security compliance",
    ],
    dateSubmitted: "2026-02-10",
    dateApproved: "2026-02-18",
    originalityScore: 78,
  },
  {
    id: "3",
    title: "Blockchain-Based Degree Verification",
    year: 2025,
    category: "Blockchain",
    supervisor: "Dr. Omar Khalil",
    status: "Completed",
    technologies: ["Ethereum", "Solidity", "React"],
    students: [
      { name: "Layla Ibrahim", role: "Leader", major: "Cybersecurity", department: "Information Systems" },
      { name: "Youssef Mahmoud", role: "Member", major: "Software Engineering", department: "Computer Science" },
    ],
    description: "Decentralized platform for issuing and verifying academic credentials using smart contracts on Ethereum. Each certificate has a unique hash for instant verification by employers.",
    abstract:
      "A decentralized platform for issuing and verifying academic credentials using blockchain technology. The system ensures tamper-proof storage of degree information and allows instant verification by employers or other institutions.",
    problemStatement:
      "Traditional degree verification processes are slow, costly, and vulnerable to fraud. Employers and institutions often struggle to verify the authenticity of academic credentials.",
    proposedSolution:
      "Create a blockchain-based system where universities can issue digital certificates stored on the Ethereum blockchain. Each certificate has a unique hash that can be verified instantly by anyone with the certificate number.",
    objectives: [
      "Design and deploy smart contracts for certificate issuance and verification",
      "Develop a web portal for universities to issue digital certificates",
      "Create a public verification interface for employers and institutions",
      "Implement IPFS for storing certificate metadata",
      "Ensure compliance with data protection regulations",
    ],
    dateSubmitted: "2025-01-20",
    dateApproved: "2025-02-05",
    originalityScore: 92,
  },
  {
    id: "4",
    title: "Mental Health Support Chatbot",
    year: 2025,
    category: "NLP & Healthcare",
    supervisor: "Dr. Huda Nasser",
    status: "Completed",
    technologies: ["GPT-4", "Node.js", "MongoDB"],
    students: [
      { name: "Amira Saleh", role: "Leader", major: "AI", department: "Computer Science" },
      { name: "Karim Zaki", role: "Member", major: "Data Science", department: "Computer Science" },
    ],
    description: "Conversational tool supporting early wellness triage and connecting students to university-approved counseling resources, with intent-based escalation detection.",
    abstract:
      "An AI-powered chatbot that provides mental health support and resources to university students. The system uses natural language processing to understand user concerns and provide appropriate guidance and referrals.",
    problemStatement:
      "Many university students struggle with mental health issues but hesitate to seek help due to stigma or lack of access to counseling services. Traditional mental health support systems are often overburdened.",
    proposedSolution:
      "Develop an intelligent chatbot using GPT-4 that can engage in empathetic conversations, provide coping strategies, and connect students with appropriate resources or professional help when needed.",
    objectives: [
      "Implement natural language understanding for mental health conversations",
      "Create a knowledge base of coping strategies and mental health resources",
      "Develop crisis detection algorithms to identify users needing immediate help",
      "Integrate with university counseling services for seamless referrals",
      "Ensure user privacy and data confidentiality",
    ],
    dateSubmitted: "2025-03-10",
    dateApproved: "2025-03-22",
    originalityScore: 88,
  },
  {
    id: "5",
    title: "E-Commerce Recommendation Engine",
    year: 2024,
    category: "Machine Learning",
    supervisor: "Dr. Tariq Ahmed",
    status: "Completed",
    technologies: ["Python", "TensorFlow", "Flask"],
    students: [
      { name: "Dina Farouk", role: "Leader", major: "Data Science", department: "Computer Science" },
      { name: "Hassan Omar", role: "Member", major: "Software Engineering", department: "Computer Science" },
    ],
    description: "Hybrid recommendation engine combining collaborative filtering, content-based filtering, and deep learning to deliver personalized product suggestions at scale.",
    abstract:
      "A sophisticated recommendation system for e-commerce platforms that uses collaborative filtering and deep learning to provide personalized product suggestions. The system analyzes user behavior and preferences to improve shopping experience.",
    problemStatement:
      "E-commerce customers are often overwhelmed by product choices and struggle to find items that match their preferences. Traditional recommendation systems lack personalization and accuracy.",
    proposedSolution:
      "Build a hybrid recommendation engine that combines collaborative filtering, content-based filtering, and deep learning techniques to provide highly personalized product recommendations based on user behavior, preferences, and browsing history.",
    objectives: [
      "Implement collaborative filtering algorithms for user-based recommendations",
      "Develop content-based filtering using product features and descriptions",
      "Create deep learning models for pattern recognition in user behavior",
      "Design a real-time recommendation API for integration with e-commerce platforms",
      "Optimize system performance for handling large-scale data",
    ],
    dateSubmitted: "2024-09-15",
    dateApproved: "2024-09-28",
    originalityScore: 75,
  },
];

function getStatusClasses(status: string) {
  switch (status) {
    case "Completed":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
    case "Approved":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
    case "In Progress":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function ProjectDetails() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const project = allProjects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Project not found</p>
          <Button
            onClick={() => router.push("/projects")}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 -ml-3 text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-semibold text-foreground mb-3">
              {project.title}
            </h1>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20"
              >
                {project.category}
              </Badge>
              <Badge
                variant="secondary"
                className={getStatusClasses(project.status)}
              >
                {project.status}
              </Badge>
            </div>
          </div>

          {project.originalityScore && (
            <div className="flex flex-col items-center justify-center bg-card text-card-foreground rounded-xl p-4 border border-border/50 shadow-sm min-w-[140px]">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {project.originalityScore}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Originality Score
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {project.description && (
            <div className="bg-card text-card-foreground rounded-xl p-6 border border-border/50 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Project Description
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            </div>
          )}

          {/* Abstract */}
          <div className="bg-card text-card-foreground rounded-xl p-6 border border-border/50 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Abstract
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {project.abstract}
            </p>
          </div>

          {/* Problem Statement */}
          {project.problemStatement && (
            <div className="bg-card text-card-foreground rounded-xl p-6 border border-border/50 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Problem Statement
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {project.problemStatement}
              </p>
            </div>
          )}

          {/* Proposed Solution */}
          {project.proposedSolution && (
            <div className="bg-card text-card-foreground rounded-xl p-6 border border-border/50 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Proposed Solution
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {project.proposedSolution}
              </p>
            </div>
          )}

          {/* Objectives */}
          {project.objectives && (
            <div className="bg-card text-card-foreground rounded-xl p-6 border border-border/50 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Objectives
              </h2>
              <ul className="space-y-3">
                {project.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-semibold">{index + 1}</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed flex-1">
                      {objective}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Technologies */}
          <div className="bg-card text-card-foreground rounded-xl p-6 border border-border/50 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Technologies Used
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-sm rounded-lg font-medium border border-indigo-500/20"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Project Info */}
          <div className="bg-card text-card-foreground rounded-xl p-6 border border-border/50 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Project Information
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Academic Year
                  </p>
                  <p className="text-sm text-muted-foreground">{project.year}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Supervisor
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {project.supervisor}
                  </p>
                </div>
              </div>

              {project.dateSubmitted && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Date Submitted
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(project.dateSubmitted).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" }
                      )}
                    </p>
                  </div>
                </div>
              )}

              {project.dateApproved && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-500">
                      Date Approved
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(project.dateApproved).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" }
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-card text-card-foreground rounded-xl p-6 border border-border/50 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Team Members
            </h3>

            <div className="space-y-3">
              {project.students.map((student, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-semibold">
                    {student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{student.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {student.role}
                      {student.major && ` • ${student.major}`}
                      {student.department && ` • ${student.department}`}
                    </p>
                  </div>
                  {student.role === "Leader" && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-indigo-500/10 border-indigo-500/20 text-indigo-700 dark:text-indigo-400">
                      Leader
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
