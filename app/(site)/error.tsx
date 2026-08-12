"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <AlertTriangle className="size-8 text-accent" strokeWidth={1.25} />
      <h1 className="mt-4 text-lg font-semibold text-foreground">Bir şeyler ters gitti.</h1>
      <p className="mt-2 text-sm text-foreground-secondary">
        Sayfa yüklenirken beklenmedik bir hata oluştu. Lütfen tekrar deneyin.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="secondary" onClick={() => reset()}>
          Tekrar Dene
        </Button>
        <Button asChild>
          <Link href="/">Ana Sayfaya Dön</Link>
        </Button>
      </div>
    </div>
  );
}
