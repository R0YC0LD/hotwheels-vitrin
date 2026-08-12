"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/site/cart-provider";

const NAV_LINKS = [
  { href: "/collection", label: "Koleksiyon" },
  { href: "/collection?sort=newest", label: "Yeni Gelenler" },
  { href: "/collection?rare=true", label: "Nadir Parçalar" },
  { href: "/sold", label: "Satılanlar" },
  { href: "/about", label: "Hakkında" },
];

export function Header({ siteName }: { siteName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Sheet>
            <SheetTrigger className="md:hidden text-foreground-secondary hover:text-foreground">
              <Menu className="size-5" />
              <span className="sr-only">Menü</span>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetTitle className="text-lg tracking-tight">{siteName}</SheetTitle>
              <nav className="mt-6 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="rounded-sm px-2 py-2.5 text-sm text-foreground-secondary hover:bg-background-secondary hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
            {siteName}
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "rounded-sm px-3 py-2 text-sm text-foreground-secondary transition-colors hover:text-foreground",
                  pathname === link.href.split("?")[0] && "text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          {searchOpen ? (
            <form onSubmit={submitSearch} className="flex items-center gap-1">
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Model, marka, SKU ara..."
                className="h-9 w-40 sm:w-64"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-2 text-foreground-secondary hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-foreground-secondary hover:text-foreground"
              aria-label="Ara"
            >
              <Search className="size-[18px]" />
            </button>
          )}

          <Link
            href="/cart"
            className="relative p-2 text-foreground-secondary hover:text-foreground"
            aria-label="Sepet"
          >
            <ShoppingBag className="size-[18px]" />
            {count > 0 && (
              <span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
