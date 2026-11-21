import { AnimatePresence, motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import { alertSuccess } from "@/lib/alerts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AvatarStudio } from "@/components/avatar/AvatarStudio";
import { Modal } from "./Modal";

const signupSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  lastName: z.string().trim().min(1, "Last name is required").max(50),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Use at least 8 characters").max(128),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,20}$/, "Enter a valid phone number"),
});

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

type Errors = Partial<Record<string, string>>;

export function AuthModal() {
  const { authOpen, authView, authReason, closeAuth, openAuth, resumePending } = useUIStore();
  const [step, setStep] = useState<"details" | "avatar">("details");

  const close = () => {
    closeAuth();
    setTimeout(() => setStep("details"), 300);
  };

  const finish = () => {
    close();
    resumePending();
  };

  return (
    <Modal
      open={authOpen}
      onClose={close}
      label={authView === "login" ? "Sign in" : "Create account"}
      className={step === "avatar" ? "sm:max-w-5xl" : ""}
    >
      <div className="p-6 sm:p-9">
        <AnimatePresence mode="wait" initial={false}>
          {authView === "login" ? (
            <motion.div key="login" {...fade}>
              <LoginForm
                reason={authReason}
                onDone={finish}
                onSwitch={() => openAuth("signup", authReason)}
              />
            </motion.div>
          ) : step === "details" ? (
            <motion.div key="signup" {...fade}>
              <SignupForm
                reason={authReason}
                onDone={() => setStep("avatar")}
                onSwitch={() => openAuth("login", authReason)}
              />
            </motion.div>
          ) : (
            <motion.div key="avatar" {...fade}>
              <AvatarStep onDone={finish} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}

const fade = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.28 },
};

function Field({
  label,
  error,
  ...props
}: { label: string; error?: string | undefined } & React.ComponentProps<"input">) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <Input className="mt-1.5" aria-invalid={!!error} {...props} />
      {error && <span className="mt-1 block text-xs font-medium text-destructive">{error}</span>}
    </label>
  );
}

function Header({
  eyebrow,
  title,
  reason,
}: {
  eyebrow: string;
  title: string;
  reason: string | null;
}) {
  return (
    <div className="pr-10">
      <p className="eyebrow text-season-deep">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold">{title}</h2>
      {reason && <p className="mt-2 text-sm text-muted-foreground">{reason}</p>}
    </div>
  );
}

function LoginForm({
  reason,
  onDone,
  onSwitch,
}: {
  reason: string | null;
  onDone: () => void;
  onSwitch: () => void;
}) {
  const login = useAuthStore((s) => s.login);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setBusy(true);
    try {
      const user = await login(parsed.data.email, parsed.data.password);
      onDone();
      void alertSuccess(
        `Welcome back, ${user.firstName}`,
        "Your bag, avatar and closet are ready.",
      );
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Could not sign in." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Header eyebrow="Members" title="Sign in" reason={reason} />
      <Field label="Email" name="email" type="email" autoComplete="email" error={errors["email"]} />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        error={errors["password"]}
      />
      {errors["form"] && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {errors["form"]}
        </p>
      )}
      <Button variant="pill" size="lg" className="w-full" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="font-semibold text-foreground underline underline-offset-4"
        >
          Create an account
        </button>
      </p>
    </form>
  );
}

function SignupForm({
  reason,
  onDone,
  onSwitch,
}: {
  reason: string | null;
  onDone: () => void;
  onSwitch: () => void;
}) {
  const register = useAuthStore((s) => s.register);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = signupSchema.safeParse(data);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const user = await register(parsed.data);
      await alertSuccess(
        `You're in, ${user.firstName}!`,
        "Your account is ready. Next, build your avatar so every order fits.",
        "Build my avatar",
      );
      onDone();
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Could not create your account." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Header eyebrow="Step 1 of 2" title="Create your account" reason={reason} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="First name"
          name="firstName"
          autoComplete="given-name"
          error={errors["firstName"]}
        />
        <Field
          label="Last name"
          name="lastName"
          autoComplete="family-name"
          error={errors["lastName"]}
        />
      </div>
      <Field label="Email" name="email" type="email" autoComplete="email" error={errors["email"]} />
      <Field
        label="Phone number"
        name="phone"
        type="tel"
        autoComplete="tel"
        placeholder="+20 100 000 0000"
        error={errors["phone"]}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        error={errors["password"]}
      />
      {errors["form"] && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {errors["form"]}
        </p>
      )}
      <Button variant="pill" size="lg" className="w-full" disabled={busy}>
        {busy ? "Creating account…" : "Continue"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already a member?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="font-semibold text-foreground underline underline-offset-4"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}

function AvatarStep({ onDone }: { onDone: () => void }) {
  const saveAvatar = useAuthStore((s) => s.saveAvatar);
  const [saving, setSaving] = useState(false);
  return (
    <div>
      <Header
        eyebrow="Step 2 of 2"
        title="Build your avatar"
        reason="Enter your measurements once — we'll use them to size every order."
      />
      <div className="mt-6">
        <AvatarStudio
          saving={saving}
          saveLabel="Save & start shopping"
          secondaryAction={{ label: "Skip for now", onClick: onDone }}
          onSave={async (measurements, look) => {
            setSaving(true);
            await saveAvatar({ measurements, look });
            setSaving(false);
            onDone();
            void alertSuccess("Avatar saved", "Find it any time in your account.");
          }}
        />
      </div>
    </div>
  );
}
