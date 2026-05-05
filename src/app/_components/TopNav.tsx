"use client";

import { Search, Bell, User, Menu, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarContent } from "./Sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

interface TopNavProps {
  title?: string;
  profileName?: string;
  profileSubtitle?: string;
  initials?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  profileHref?: string;
  variant?: "student" | "professor";
}

export function TopNav({
  title = "Student Dashboard",
  profileName = "Mohamed Ayman",
  profileSubtitle = "Student",
  initials = "MA",
  showSearch = false,
  showNotifications = false,
  profileHref = "/profile",
  variant = "student",
}: TopNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState(
    profileHref.startsWith("/professor")
      ? [
          {
            id: 1,
            title: "Proposal waiting for approval",
            message: "Nova Path submitted Smart Campus Navigation System.",
            time: "12 minutes ago",
            unread: true,
          },
          {
            id: 2,
            title: "New team membership request",
            message: "Youssef Mahmoud requested to join Vision Guard.",
            time: "1 hour ago",
            unread: true,
          },
          {
            id: 3,
            title: "Feedback viewed by students",
            message: "Prompt Lab marked your feedback as read.",
            time: "Yesterday",
            unread: false,
          },
        ]
      : [
          {
            id: 1,
            title: "Similarity Check Completed",
            message: "Your project scored 85% originality.",
            time: "2 hours ago",
            unread: true,
          },
          {
            id: 2,
            title: "Professor Response",
            message: "Dr. Ahmed reviewed your proposal.",
            time: "1 day ago",
            unread: true,
          },
          {
            id: 3,
            title: "Draft Saved",
            message: "Your project draft was saved successfully.",
            time: "3 days ago",
            unread: false,
          },
        ]
  );

  const professorTitles: Record<string, string> = {
    "/professor/dashboard": "Professor Dashboard",
    "/professor/projects": "Projects",
    "/professor/project-management": "Project Management",
    "/professor/team-chats": "Team Chats",
    "/professor/innochat": "InnoChat",
    "/professor/feedback": "Feedback",
    "/professor/notifications": "Notifications",
    "/professor/profile": "Profile",
  };
  const displayTitle =
    title === "Professor Dashboard" ? professorTitles[pathname] ?? title : title;
  const notificationsHref = profileHref.startsWith("/professor")
    ? "/professor/notifications"
    : "/notifications";
  const shouldShowSearch = showSearch && pathname !== "/professor/dashboard";

  const handleLogout = () => {
    router.push("/login");
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const getNotificationHref = (title: string, isProf: boolean) => {
    const lower = title.toLowerCase();
    if (isProf) {
      if (lower.includes("proposal")) return "/professor/project-management";
      if (lower.includes("team") || lower.includes("join")) return "/professor/team-chats";
      if (lower.includes("feedback")) return "/professor/feedback";
      return "/professor/notifications";
    } else {
      if (lower.includes("team") || lower.includes("message")) return "/team-chat";
      if (lower.includes("project") || lower.includes("draft") || lower.includes("submission") || lower.includes("similarity") || lower.includes("response")) return "/project-management";
      return "/notifications";
    }
  };

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-background/60 backdrop-blur-2xl border-b border-border/50 z-10 shadow-[0_4px_30px_rgba(0,0,0,0.02)] transition-all duration-300">
      <div className="h-full px-4 md:px-8 flex items-center justify-between">
        {/* Mobile Menu Button & Page Title */}
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-xl transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 bg-background/80 backdrop-blur-xl border-border/50">
              <SidebarContent variant={variant} />
            </SheetContent>
          </Sheet>
          
          <div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              {displayTitle}
            </h2>
          </div>
        </div>

        {shouldShowSearch && (
          <div className="hidden lg:block flex-1 max-w-md mx-8">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search projects, teams, students..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-accent/50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 focus:bg-background transition-all duration-300"
              />
            </div>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          <ThemeToggle />

          {showNotifications && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="relative p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-xl transition-colors"
                  aria-label="Open notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-background animate-pulse" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-90 p-0 border-border/50 bg-background/95 backdrop-blur-xl shadow-xl">
                <DropdownMenuLabel className="px-4 py-3 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      Notifications
                    </span>
                    <div className="flex items-center gap-3">
                      <button onClick={markAllAsRead} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Mark all as read</button>
                      <span className="text-xs font-medium text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <div className="py-1 max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <Link
                        key={notification.id}
                        href={getNotificationHref(notification.title, profileHref.startsWith("/professor"))}
                        className={`block px-4 py-3 hover:bg-accent cursor-pointer transition-colors group relative ${notification.unread ? 'bg-muted/30' : ''}`}
                        onMouseEnter={() => markAsRead(notification.id)}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-foreground group-hover:text-indigo-500 transition-colors">
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground/60 mt-2 font-medium">
                              {notification.time}
                            </p>
                          </div>
                          {notification.unread && <span className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />}
                        </div>
                      </Link>
                    ))
                  )}
                </div>
                <div className="p-2 border-t border-border/50 bg-accent/30">
                  <Link
                    href={notificationsHref}
                    className="flex h-9 items-center justify-center rounded-lg bg-indigo-500/10 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                  >
                    View all notifications
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Link href={profileHref} className="flex items-center gap-2 rounded-xl p-1 hover:bg-accent transition-all duration-300 hover:scale-105 active:scale-95">
            <Avatar className="w-8 h-8 border border-border/50 shadow-sm">
              <AvatarFallback className="bg-indigo-600 text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}
