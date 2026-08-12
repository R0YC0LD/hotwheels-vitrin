"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <AlertTriangle className="size-8 text-accent" strokeWidth={1.25} />
      <h1 className="mt-4 text-lg font-semibold text-foreground">Bir şeyler ters gitti.</h1>
      <p className="mt-2 max-w-sm text-sm text-foreground-secondary">
        İşlem sırasında beklenmedik bir hata oluştu. Tekrar deneyin, sorun devam ederse Supabase
        bağlantı ayarlarınızı kontrol edin.
      </p>
      <Button variant="secondary" className="mt-6" onClick={() => reset()}>
        Tekrar Dene
      </Button>
    </div>
  );
}
