import { SignIn } from "@clerk/nextjs";
import { Metadata } from "next";
import Link from "next/link";
import { Brain } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In | Disaster Management",
  description: "Sign in to your disaster management account",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 md:p-8">
      <div className="mb-6 flex items-center justify-center">
        <Link href="/" className="flex items-center space-x-2">
          <Brain className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">Disaster Management</span>
        </Link>
      </div>
      <div className="w-full max-w-md rounded-lg border border-border bg-card shadow-sm">
        <div className="p-6">
          <h1 className="mb-4 text-center text-2xl font-semibold text-foreground">Sign In</h1>
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                footerActionLink: "text-primary hover:text-primary/90",
              },
            }}
            redirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}
