import { Lock } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import { Button } from "@/components/ui/button";

/** Client-side guard: guests see a locked state and the auth modal opens automatically. */
export function RequireAuth({ children, reason }: { children: ReactNode; reason: string }) {
  const hydrated = useUIStore((s) => s.hydrated);
  const openAuth = useUIStore((s) => s.openAuth);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (hydrated && !user) openAuth("login", reason);
  }, [hydrated, user, openAuth, reason]);

  if (!hydrated) {
    return (
      <div className="container-page py-24">
        <div className="h-10 w-64 animate-pulse rounded-full bg-secondary" />
        <div className="mt-6 h-72 animate-pulse rounded-3xl bg-secondary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-page grid min-h-[60vh] place-items-center py-24 text-center">
        <div className="max-w-md">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-secondary">
            <Lock className="size-5" />
          </span>
          <h1 className="mt-6 text-4xl font-semibold">Members only</h1>
          <p className="mt-3 text-muted-foreground">{reason}</p>
          <div className="mt-8 flex justify-center gap-3">
            <Button variant="pill" size="lg" onClick={() => openAuth("login", reason)}>
              Sign in
            </Button>
            <Button variant="pill-outline" size="lg" onClick={() => openAuth("signup", reason)}>
              Create account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
