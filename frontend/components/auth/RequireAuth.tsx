"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAccessToken, getRefreshToken, isExpired, refreshSession } from "@/lib/auth";

// Task 5.2.3 - wrap a page's content to require a logged-in user.
// Logged-out visitors are sent to /login?next=<this page>.
//
//   export default function MyBookingsPage() {
//     return <RequireAuth>...</RequireAuth>;
//   }
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const access = getAccessToken();
      const ok =
        !!getRefreshToken() && (access && !isExpired(access) ? true : await refreshSession());
      if (cancelled) return;
      if (ok) setReady(true);
      else router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [router, pathname]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-stone-500">
        Checking your session…
      </div>
    );
  }
  return <>{children}</>;
}
