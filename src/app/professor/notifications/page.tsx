"use client";

import { useState } from "react";
import { Bell, CheckCircle2, MessageSquare, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { notifications as initialNotifications, NotificationType } from "../_data";
import { NotificationList } from "@/app/_components/DashboardUI";
import { PageHeader, SectionCard } from "../_components";

const iconMap: Record<
  NotificationType,
  { icon: typeof Bell; tone: "info" | "warning" | "success" }
> = {
  "Project Update": {
    icon: Bell,
    tone: "info",
  },
  "Member Joined": {
    icon: UserPlus,
    tone: "warning",
  },
  "Feedback Alert": {
    icon: MessageSquare,
    tone: "success",
  },
};

export default function ProfessorNotifications() {
  const [items, setItems] = useState(initialNotifications);

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
    if (lower.includes("proposal")) return "/professor/project-management";
    if (lower.includes("team") || lower.includes("join")) return "/professor/team-chats";
    if (lower.includes("feedback")) return "/professor/feedback";
    return "/professor/notifications";
  };

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Notifications"
        description="Track project updates, join requests, feedback alerts, and read history."
      />

      <SectionCard
        title="System Notifications"
        action={
          <Button
            variant="outline"
            className="border-indigo-200 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/100/10"
            onClick={markAllRead}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
        }
      >
        <div className="-m-6">
          <NotificationList
            items={items.map((notification) => ({
              id: notification.id,
              title: notification.title,
              message: notification.message,
              timestamp: notification.timestamp,
              unread: notification.unread,
              type: notification.type,
              icon: iconMap[notification.type].icon,
              tone: iconMap[notification.type].tone,
              href: getNotificationHref(notification.title),
            }))}
            onRead={markAsRead}
          />
        </div>
      </SectionCard>
    </div>
  );
}
