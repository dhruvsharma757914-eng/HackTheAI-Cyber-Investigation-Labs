"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    startTransition(() => {
      router.refresh();
      router.push("/");
    });
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={busy || pending}
      className="btn-ghost !px-3 !py-1.5"
    >
      {busy || pending ? "..." : "Sign out"}
    </button>
  );
}
