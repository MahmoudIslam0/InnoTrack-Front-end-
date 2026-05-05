import { Sidebar } from "@/app/_components/Sidebar";
import { TopNav } from "@/app/_components/TopNav";

export default function ProfessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <Sidebar variant="professor" />
      <TopNav
        title="Professor Dashboard"
        profileName="Dr. Leila Hassan"
        profileSubtitle="Computer Science Department"
        initials="LH"
        profileHref="/professor/profile"
        showNotifications
      />

      <main className="md:ml-64 pt-16">{children}</main>
    </div>
  );
}
