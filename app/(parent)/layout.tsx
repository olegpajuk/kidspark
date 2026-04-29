"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/parent/Sidebar";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnboarding = pathname === "/onboarding";

  if (isOnboarding) {
    return <div className="min-h-screen bg-[#FFF8E7]">{children}</div>;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto pt-16 md:pt-0">{children}</main>
    </div>
  );
}
