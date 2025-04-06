"use client";

import { UserButton } from "@clerk/nextjs";
import { Shield } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { redirect } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the current auth state
  const { isLoaded, userId } = useAuth();
  
  // Use client-side redirect when auth is loaded
  useEffect(() => {
    if (isLoaded && !userId) {
      redirect("/sign-in");
    }
  }, [isLoaded, userId]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center gap-2 border-b bg-background px-4 md:px-6">
        <div className="flex flex-1 items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">Disaster Management</span>
          </Link>
        </div>
        <nav className="hidden gap-5 md:flex">
          <Link 
            href="/dashboard" 
            className="text-sm font-medium tracking-wide hover:text-primary"
          >
            Dashboard
          </Link>
          <Link 
            href="/inventory" 
            className="text-sm font-medium tracking-wide hover:text-primary"
          >
            Inventory
          </Link>
          <Link 
            href="/ai-analysis" 
            className="text-sm font-medium tracking-wide hover:text-primary"
          >
            AI Analysis
          </Link>
          <Link 
            href="/weather" 
            className="text-sm font-medium tracking-wide hover:text-primary"
          >
            Weather
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>
      {/* Content */}
      <main className="flex-1 p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
