"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("E-posta veya şifre hatalı.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-sm border border-border bg-card p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex size-10 items-center justify-center rounded-full border border-border">
            <Lock className="size-4 text-foreground-secondary" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Admin Girişi</h1>
          <p className="mt-1 text-sm text-foreground-secondary">
            Devam etmek için giriş yapın.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="email" className="mb-1.5 block">
              E-posta
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password" className="mb-1.5 block">
              Şifre
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-xs text-accent">{error}</p>}

          <Button type="submit" size="lg" className="mt-2" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            Giriş Yap
          </Button>
        </form>
      </div>
    </div>
  );
}
