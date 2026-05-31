import { PageTransition } from "@/components/ui/animated-loaders";
import { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
