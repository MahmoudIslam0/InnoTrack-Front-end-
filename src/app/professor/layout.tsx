import { Sidebar } from "@/app/_components/Sidebar";
import { TopNav } from "@/app/_components/TopNav";
import { DashboardLayoutWrapper, MainContentArea } from "@/app/_components/DashboardLayoutWrapper";

export default function ProfessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayoutWrapper>
      <Sidebar variant="professor" />
      <TopNav
        title="Professor Dashboard"
        profileName="Dr. Leila Hassan"
        profileSubtitle="Computer Science Department"
        initials="LH"
        profileHref="/professor/profile"
        showNotifications
      />

      <MainContentArea>{children}</MainContentArea>
    </DashboardLayoutWrapper>
  );
}
