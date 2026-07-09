// app/resume/layout.tsx
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="px-5 pt-20">
      {children}
    </div>
  );
}