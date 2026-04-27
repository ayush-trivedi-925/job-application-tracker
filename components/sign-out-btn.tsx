"use client";

import { authClient } from "@/lib/auth/auth-client"; // ← not auth.ts
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const result = await authClient.signOut();
    if (result.data) {
      router.push("/sign-in");
    } else {
      alert("Something went wrong.");
    }
  };

  return (
    <Button variant="ghost" onClick={handleSignOut}>
      Log Out
    </Button>
  );
}
