"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  FileText,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  Info
} from "lucide-react";

import {
  NotificationList,
  PageHeader,
  SectionCard,
} from "@/app/_components/DashboardUI";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} d ago`;
  return date.toLocaleDateString();
}

function getIconForType(type: string) {
  switch (type?.toLowerCase()) {
    case 'success': return CheckCircle2;
    case 'error': return AlertTriangle;
    case 'warning': return FileText;
    default: return Bell;
  }
}

function getToneForType(type: string) {
  switch (type?.toLowerCase()) {
    case 'success': return 'success';
    case 'error': return 'error';
    case 'warning': return 'warning';
    default: return 'info';
  }
}

export default function StudentNotifications() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    api.notifications.getAll()
      .then((data) => {
        setItems(data.map((n: any) => ({
          id: String(n.id),
          title: n.title,
          message: n.message,
          timestamp: timeAgo(n.createdAt),
          icon: getIconForType(n.type),
          tone: getToneForType(n.type),
          type: n.type,
          unread: !n.isRead,
        })));
      })
      .catch(console.error);
  }, []);

  const markAllRead = async () => {
    setItems((currentItems) =>
      currentItems.map((item) => ({ ...item, unread: false })),
    );
    try {
      await api.notifications.markAllAsRead();
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (item && item.unread) {
      setItems((currentItems) =>
        currentItems.map((i) =>
          i.id === id ? { ...i, unread: false } : i
        )
      );
      try {
        await api.notifications.markAsRead(id);
      } catch (err) {
        console.error(err);
      }
    }
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
