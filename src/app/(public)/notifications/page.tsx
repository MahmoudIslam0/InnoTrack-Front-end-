"use client";

import { useState } from "react";
import {
  Bell,
  CheckCircle2,
  FileText,
  MessageSquare,
  Sparkles,
} from "lucide-react";

import {
  NotificationList,
  PageHeader,
  SectionCard,
} from "@/app/_components/DashboardUI";
import { Button } from "@/components/ui/button";

const initialStudentNotifications = [
  {
    id: "sn1",
    title: "Similarity Check Completed",
    message: "Your project scored 85% originality.",
    timestamp: "2 hours ago",
    icon: Sparkles,
    tone: "info" as const,
    type: "Project Update",
    unread: true,
  },
  {
    id: "sn2",
    title: "Professor Response",
    message: "Dr. Ahmed reviewed your proposal.",
    timestamp: "1 day ago",
    icon: MessageSquare,
    tone: "success" as const,
    type: "Feedback Alert",
    unread: true,
  },
  {
    id: "sn3",
    title: "Draft Saved",
    message: "Your project draft was saved successfully.",
    timestamp: "3 days ago",
    icon: CheckCircle2,
    tone: "success" as const,
    type: "Project Update",
    unread: false,
  },
  {
    id: "sn4",
    title: "Submission Reminder",
    message: "Complete your abstract and objectives before requesting review.",
    timestamp: "1 week ago",
    icon: FileText,
    tone: "warning" as const,
    type: "Submission",
    unread: false,
  },
  {
    id: "sn5",
    title: "New Team Message",
    message: "Sarah Ahmed shared an updated architecture diagram.",
    timestamp: "1 week ago",
    icon: Bell,
    tone: "info" as const,
    type: "Team Chat",
    unread: false,
  },
];

export default function StudentNotifications() {
  const [items, setItems] = useState(initialStudentNotifications);

  const markAllRead = () => {
    setItems((currentItems) =>
      currentItems.map((item) => ({ ...item, unread: false })),
    );
  };

  const markAsRead = (id: string) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, unread: false } : item
      )
    );
  };

  const getNotificationHref = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes("team") || lower.includes("message")) return "/team-chat";
    if (lower.includes("project") || lower.includes("draft") || lower.includes("submission") || lower.includes("similarity") || lower.includes("response")) return "/project-management";
    return "/notifications";
  };

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Notifications"
        description="Track project updates, supervisor responses, team messages, and submission reminders."
      />

      <SectionCard
        title="System Notifications"
        action={
          <Button
            variant="outline"
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            onClick={markAllRead}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
        }
      >
        <div className="-m-6">
          <NotificationList
            items={items.map(item => ({
              ...item,
              href: getNotificationHref(item.title)
            }))}
            onRead={markAsRead}
          />
        </div>
      </SectionCard>
    </div>
  );
}
