"use client";

import { LayoutDashboard, FolderKanban, ClipboardList, Bot, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "Home", path: "/dashboard" },
  { icon: FolderKanban, label: "Projects", path: "/projects" },
  { icon: ClipboardList, label: "Manage", path: "/project-management" },
  { icon: Bot, label: "Chat AI", path: "/innochat" },
  { icon: MessageSquare, label: "Team", path: "/team-chat" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-background/80 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || (item.path !== "/dashboard" && pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-all duration-200 ${isActive ? "bg-indigo-500/10" : ""}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-medium leading-none ${isActive ? "text-indigo-600 dark:text-indigo-400" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
