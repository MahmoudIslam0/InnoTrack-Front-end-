import { AuthProvider } from "@/contexts/AuthContext";
import type { Metadata } from "next";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    default: "InnoTrack — Graduation Project Management",
    template: "%s | InnoTrack",
  },
  description:
    "InnoTrack helps universities manage graduation projects, team collaboration, supervisor assignments, and project submissions — all in one platform.",
  keywords: ["graduation projects", "university", "team management", "project submission", "InnoTrack"],
  authors: [{ name: "InnoTrack Team" }],
  openGraph: {
    title: "InnoTrack — Graduation Project Management",
    description: "Manage graduation projects, teams, and submissions in one place.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
