"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingCart,
  FolderTree,
  Tags,
  Image as ImageIcon,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Ürünler", icon: Package },
  { href: "/admin/products/new", label: "Yeni Ürün", icon: PlusCircle },
  { href: "/admin/orders", label: "Siparişler", icon: ShoppingCart },
  { href: "/admin/categories", label: "Kategoriler", icon: FolderTree },
  { href: "/admin/tags", label: "Etiketler", icon: Tags },
  { href: "/admin/media", label: "Medya", icon: ImageIcon },
  { href: "/admin/settings", label: "Site Ayarları", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <nav className="flex flex-1 flex-col gap-0.5">
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm transition-colors",
              active
                ? "bg-accent-soft text-accent"
                : "text-foreground-secondary hover:bg-background-secondary hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {link.label}
          </Link>
        );
      })}

      <button
        onClick={logout}
        className="mt-auto flex items-center gap-2.5 rounded-sm px-3 py-2 text-left text-sm text-foreground-secondary transition-colors hover:bg-background-secondary hover:text-foreground"
      >
        <LogOut className="size-4" />
        Çıkış
      </button>
    </nav>
  );
}

export function AdminSidebar({ adminEmail }: { adminEmail: string }) {
  return (
    <>
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border p-4 md:flex">
        <div className="mb-6 px-1">
          <p className="text-sm font-semibold text-foreground">Admin Paneli</p>
          <p className="mt-0.5 truncate text-xs text-foreground-muted">{adminEmail}</p>
        </div>
        <NavLinks />
      </aside>

      <div className="flex items-center justify-between border-b border-border p-4 md:hidden">
        <div>
          <p className="text-sm font-semibold text-foreground">Admin Paneli</p>
          <p className="text-xs text-foreground-muted">{adminEmail}</p>
        </div>
        <Sheet>
          <SheetTrigger className="text-foreground-secondary hover:text-foreground">
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <SheetTitle>Admin Paneli</SheetTitle>
            <div className="mt-4 flex flex-1 flex-col">
              <NavLinks />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
