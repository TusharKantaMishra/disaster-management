import { UserButton as ClerkUserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function UserButton() {
  return (
    <>
      <SignedIn>
        <ClerkUserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              userButtonAvatarBox: "w-10 h-10",
            },
          }}
        />
      </SignedIn>
      <SignedOut>
        <div className="flex gap-2">
          <Button
            variant="outline"
            asChild
            className="hidden sm:flex"
          >
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button
            asChild
            className="hidden sm:flex"
          >
            <Link href="/sign-up">Sign up</Link>
          </Button>
          <Button
            asChild
            className="sm:hidden"
          >
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      </SignedOut>
    </>
  );
}
