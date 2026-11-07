"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

// Sign-in uses the anon key in the browser. @supabase/ssr writes the
// session cookie; pages still call getUser() on the server before they
// trust it. With no keys I stop and say so, instead of pretending a
// local account exists.
export function LoginForm({ next, configured }: { next: string; configured: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) {
      setError("Email accounts need Supabase keys. You can still use the guest demo.");
      return;
    }
    const form = new FormData(event.currentTarget);
    setPending(true);
    const supabase = createBrowserSupabase();
    const { error: authError } = await supabase!.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setPending(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    // refresh() rerenders the server layout against the new cookie.
    // next is the path the proxy stored. Anything that is not a path
    // falls back to /account. The callback route is the strict check:
    // it also rejects a protocol-relative "//" URL.
    router.push(next.startsWith("/") ? next : "/account");
    router.refresh();
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to see orders placed on your account.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email" name="email" type="email" />
        <Field label="Password" name="password" type="password" />
        {error ? <p className="text-sm text-warn" role="alert">{error}</p> : null}
        <button disabled={pending} className="h-12 w-full rounded-full bg-ember-deep text-sm text-white hover:bg-[#722f10] disabled:opacity-60">
          {pending ? "Signing in…" : "Log in"}
        </button>
      </form>
      <p className="mt-4 text-sm text-muted">
        New here? <Link className="underline" href="/signup">Create an account</Link>
      </p>
      <p className="mt-2 text-sm"><Link className="underline" href="/demo">Try the admin demo</Link></p>
    </AuthShell>
  );
}

// full_name is stored in user_metadata as a hint for loadProfile. The
// role is not in this payload. If email confirmation is on, signUp
// returns no session and I ask them to confirm before logging in.
export function SignupForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) {
      setError("Sign up needs a Supabase project. The shop and demo checkout still work without one.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    setPending(true);
    const supabase = createBrowserSupabase();
    const { data, error: authError } = await supabase!.auth.signUp({
      email: String(form.get("email")),
      password,
      options: {
        data: { full_name: String(form.get("name")) },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/account`,
      },
    });
    setPending(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    if (data.session) {
      router.push("/account");
      router.refresh();
      return;
    }
    setNote("Check your email to confirm the account, then come back and log in.");
  }

  return (
    <AuthShell title="Create an account" subtitle="Orders, a wishlist, and a name on the delivery note.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full name" name="name" type="text" />
        <Field label="Email" name="email" type="email" />
        <Field label="Password" name="password" type="password" />
        {error ? <p className="text-sm text-warn" role="alert">{error}</p> : null}
        {note ? <p className="text-sm text-muted" role="status">{note}</p> : null}
        <button disabled={pending} className="h-12 w-full rounded-full bg-ember-deep text-sm text-white hover:bg-[#722f10] disabled:opacity-60">
          {pending ? "Creating…" : "Sign up"}
        </button>
      </form>
      <p className="mt-4 text-sm text-muted">
        Already have an account? <Link className="underline" href="/login">Log in</Link>
      </p>
    </AuthShell>
  );
}

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-4xl">{title}</h1>
      <p className="mt-2 text-muted">{subtitle}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}

function Field({ label, name, type }: { label: string; name: string; type: string }) {
  return (
    <label className="block text-sm">
      {label}
      <input required name={name} type={type} autoComplete={name === "password" ? "current-password" : name} className="mt-1 h-12 w-full rounded-xl border border-line bg-surface px-3" />
    </label>
  );
}
