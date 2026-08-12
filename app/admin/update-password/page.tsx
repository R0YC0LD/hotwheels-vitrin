"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const supabase = createClient();
    // Davet/kurtarma linkindeki token'dan geçici bir oturum kurulmasını bekle.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      else setError("Bağlantı geçersiz veya süresi dolmuş. Lütfen yeni bir bağlantı isteyin.");
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalı.");
      return;
    }
    if (password !== confirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError("Şifre güncellenemedi. Tekrar deneyin.");
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
            <KeyRound className="size-4 text-foreground-secondary" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Şifreni Belirle</h1>
          <p className="mt-1 text-sm text-foreground-secondary">
            Admin hesabın için yeni bir şifre oluştur.
          </p>
        </div>

        {!ready && !error && (
          <p className="text-center text-sm text-foreground-secondary">Doğrulanıyor...</p>
        )}

        {ready && (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="password" className="mb-1.5 block">
                Yeni Şifre
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="confirm" className="mb-1.5 block">
                Şifre Tekrar
              </Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            {error && <p className="text-xs text-accent">{error}</p>}

            <Button type="submit" size="lg" className="mt-2" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              Şifreyi Kaydet ve Giriş Yap
            </Button>
          </form>
        )}

        {!ready && error && <p className="text-center text-xs text-accent">{error}</p>}
      </div>
    </div>
  );
}
