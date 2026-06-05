"use client";

import { Search, Bell, User, Menu, LogOut, PanelLeftClose, PanelLeft } from "lucide-react";
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
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useSidebar } from "@/contexts/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";
import * as signalR from "@microsoft/signalr";
import { toast } from "sonner";

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
  profileName = "Mahmoud Islam",
  profileSubtitle = "Software Engineering Student",
  initials = "MI",
  showSearch = false,
  showNotifications = false,
  profileHref = "/profile",
  variant = "student",
}: TopNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useSidebar();
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (showNotifications) {
      api.notifications.getAll()
        .then((data) => {
          setNotifications(data.map((n: any) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            time: timeAgo(n.createdAt),
            unread: !n.isRead,
          })));
        })
        .catch(console.error);
    }
  }, [showNotifications]);

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

  const markAsRead = async (id: number) => {
    const notif = notifications.find(n => n.id === id);
    if (notif && notif.unread) {
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, unread: false } : n)));
      try {
        await api.notifications.markAsRead(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const markAllAsRead = async () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
    try {
      await api.notifications.markAllAsRead();
    } catch (err) {
      console.error(err);
    }
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
    try {
      await api.notifications.clearAll();
      toast.success("Notifications cleared");
    } catch (err) {
      console.error(err);
      toast.error("Failed to clear notifications");
    }
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

  useEffect(() => {
    if (!showNotifications) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://innotrack-aneshpdxd6habnd6.uaenorth-01.azurewebsites.net";
    const hubUrl = `${BASE_URL.replace(/\/$/, '')}/hubs/notifications`;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveNotification", (n: any) => {
      if (!n) return;
      const isReadVal = n.isRead !== undefined ? n.isRead : (n.IsRead !== undefined ? n.IsRead : false);
      const titleVal = n.title || n.Title || "Notification";
      const messageVal = n.message || n.Message || "";
      const idVal = n.id !== undefined ? n.id : (n.Id !== undefined ? n.Id : Date.now());

      setNotifications(prev => [
        {
          id: idVal,
          title: titleVal,
          message: messageVal,
          time: "Just now",
          unread: !isReadVal,
        },
        ...prev,
      ]);

      toast.info(titleVal, {
        description: messageVal,
        action: {
          label: "View",
          onClick: () => {
            const isProf = profileHref.startsWith("/professor");
            const href = getNotificationHref(titleVal, isProf);
            router.push(href);
          }
        },
        style: {
          background: "rgba(30, 64, 175, 0.08)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(59, 130, 246, 0.25)",
          borderRadius: "12px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
        },
        classNames: {
          title: "text-blue-600 dark:text-blue-400 font-semibold text-sm",
          description: "text-muted-foreground/90 dark:text-gray-300 text-xs mt-0.5 leading-relaxed",
          actionButton: "!bg-blue-600 hover:!bg-blue-700 !text-white font-medium text-xs px-3 py-1.5 rounded-lg border-0 transition-colors"
        }
      });
    });

    connection.start()
      .then(() => console.log("SignalR Notifications Connected"))
      .catch((err) => console.error("SignalR Notifications Connection Error: ", err));

    return () => {
      connection.stop();
    };
  }, [showNotifications, profileHref, router]);

  return (
    <header className={`fixed top-0 left-0 ${isSidebarCollapsed ? 'md:left-20' : 'md:left-64'} right-0 h-16 bg-background/90 backdrop-blur-md border-b border-border z-40 transition-all duration-300 ease-in-out`}>
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
          
          <button 
            onClick={toggleSidebar}
            className="hidden md:flex p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-xl transition-colors"
          >
            {isSidebarCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
          
          <div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              {displayTitle}
            </h2>
          </div>
        </div>

        {shouldShowSearch && (
          <div className="hidden lg:block flex-1 max-w-md mx-8">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search projects, teams, students..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-muted border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 focus:bg-background transition-all duration-300"
              />
            </div>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              {showNotifications && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="relative p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-xl transition-colors"
                      aria-label="Open notifications"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background animate-pulse" />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-96 p-0 border-border/50 bg-background/95 backdrop-blur-xl shadow-xl">
                    <DropdownMenuLabel className="px-4 py-3 border-b border-border/50">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">
                          Notifications
                        </span>
                        <div className="flex items-center gap-2">
                          <button onClick={markAllAsRead} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Read all</button>
                          <span className="text-muted-foreground/30 text-xs">|</span>
                          <button onClick={clearAllNotifications} className="text-xs text-muted-foreground hover:text-destructive transition-colors">Clear all</button>
                          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full ml-1">
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
                                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground/60 mt-2 font-medium">
                                  {notification.time}
                                </p>
                              </div>
                              {notification.unread && <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                    <div className="p-2 border-t border-border/50 bg-accent/30">
                      <Link
                        href={notificationsHref}
                        className="flex h-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
                      >
                        View all notifications
                      </Link>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Link href={profileHref} className="flex items-center gap-2 rounded-xl p-1 hover:bg-accent transition-all duration-300 ">
                <Avatar className="w-8 h-8 border border-border/50 shadow-sm">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-accent"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium bg-primary text-primary-foreground hover:bg-indigo-700 transition-colors px-4 py-2 rounded-lg shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
