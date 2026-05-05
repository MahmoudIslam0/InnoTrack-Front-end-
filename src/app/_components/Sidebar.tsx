"use client";

import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  LogOut,
  FileText,
  Bot,
  ClipboardList,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface SidebarProps {
  activeItem?: string;
  variant?: "student" | "professor";
}

const studentMenuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { id: "projects", label: "Projects", icon: FolderKanban, path: "/projects" },
  { id: "project-management", label: "Project Management", icon: ClipboardList, path: "/project-management" },
  { id: "innochat", label: "InnoChat", icon: Bot, path: "/innochat" },
  { id: "team-chat", label: "Team Chat", icon: MessageSquare, path: "/team-chat" },
];

const professorMenuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/professor/dashboard" },
  { id: "projects", label: "Projects", icon: FolderKanban, path: "/professor/projects" },
  { id: "project-management", label: "Project Management", icon: ClipboardList, path: "/professor/project-management" },
  { id: "innochat", label: "InnoChat", icon: Bot, path: "/professor/innochat" },
  { id: "team-chat", label: "Team Chat", icon: MessageSquare, path: "/professor/team-chats" },
];

export function SidebarContent({ activeItem, variant = "student" }: SidebarProps) {
  const pathname = usePathname();
  const menuItems = variant === "professor" ? professorMenuItems : studentMenuItems;
  const subtitle = variant === "professor" ? "Professor Workspace" : "Student Workspace";

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl transition-transform hover:scale-105">
            <Image
              src="/logo-light.png"
              alt="InnoTrack Logo"
              width={40}
              height={40}
              className="h-full w-full object-cover dark:hidden"
            />
            <Image
              src="/logo-dark.jpg"
              alt="InnoTrack Logo"
              width={40}
              height={40}
              className="h-full w-full object-cover hidden dark:block"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-none tracking-tight">
              InnoTrack
            </h1>
            <p className="text-xs text-muted-foreground mt-1.5 font-medium">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeItem === item.id ||
              pathname === item.path ||
              (item.path !== "/dashboard" && pathname.startsWith(`${item.path}/`));

            return (
              <li key={item.id}>
                <Link
                  href={item.path}
                  className={`
                    w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                    ${
                      isActive
                        ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-[inset_0_0_0_1px_rgba(79,70,229,0.1)]"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:scale-[1.02]"
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-indigo-600 dark:text-indigo-400" : "group-hover:text-accent-foreground"}`} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      
    </div>
  );
}

export function Sidebar({ activeItem, variant = "student" }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-background/70 backdrop-blur-2xl border-r border-border/50 hidden md:flex flex-col z-20 shadow-[8px_0_30px_rgba(0,0,0,0.03)] dark:shadow-none transition-all duration-300">
      <SidebarContent activeItem={activeItem} variant={variant} />
    </aside>
  );
}
