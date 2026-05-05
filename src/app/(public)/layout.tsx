// src/app/(public)/layout.tsx

import { Sidebar } from "../_components/Sidebar";
import { TopNav } from "../_components/TopNav";
import { MobileBottomNav } from "../_components/MobileBottomNav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Sidebar />
      <TopNav showNotifications />
      <MobileBottomNav />
      <main className="md:ml-64 pt-16">{children}</main>
    </div>
  );
}
