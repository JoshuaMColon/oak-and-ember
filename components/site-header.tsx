"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { categories } from "@/lib/data/catalog";
import { cn } from "@/lib/cn";
import { useShop } from "@/components/shop-provider";

export function SiteHeader() {
  const pathname = usePathname();
  const home = pathname === "/";
  const { count } = useShop();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  function setOpen(next: boolean) {
    setOpenPath(next ? pathname : null);
  }

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenPath(null);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, [open]);

  const light = home && !open;

  return (
    <header
      className={cn(
        "z-40 border-b",
        home
          ? "absolute inset-x-0 top-0 border-transparent bg-gradient-to-b from-black/50 to-transparent text-[#f7f1e8]"
          : "sticky top-0 border-line bg-background/90 text-ink backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:h-[4.5rem] sm:px-6">
        <Link
          href="/"
          className="shrink-0 rounded-full font-serif text-xl tracking-tight transition hover:opacity-80"
        >
          Oak <span className="italic">&amp; Ember</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-6 lg:flex" aria-label="Primary">
          <Link className={navLink(light)} href="/catalog">
            Shop
          </Link>
          <details className="relative">
            <summary className={cn(navLink(light), "cursor-pointer list-none [&::-webkit-details-marker]:hidden")}>
              Collections
            </summary>
            <div className="absolute left-0 top-full z-20 mt-3 w-64 rounded-2xl border border-line bg-surface p-2 text-ink shadow-lg">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/catalog/${category.slug}`}
                  className="block rounded-xl px-3 py-2 text-sm hover:bg-background"
                >
                  <span className="font-medium">{category.name}</span>
                  <span className="mt-0.5 block text-xs text-muted">{category.description}</span>
                </Link>
              ))}
            </div>
          </details>
          <Link className={navLink(light)} href="/about">
            Our story
          </Link>
        </nav>

        <form action="/catalog" role="search" className="ml-auto hidden xl:block">
          <label htmlFor="header-search" className="sr-only">
            Search the catalog
          </label>
          <input
            id="header-search"
            name="q"
            placeholder="Search pieces"
            className={cn(
              "h-10 w-44 rounded-full border px-4 text-sm transition placeholder:text-muted focus:w-56",
              light
                ? "border-white/30 bg-white/10 text-[#f7f1e8] placeholder:text-white/70"
                : "border-line bg-surface text-ink",
            )}
          />
        </form>

        <div className={cn("flex items-center gap-1", "ml-auto xl:ml-2")}>
          <ThemeToggle light={light} />
          <IconLink href="/account/wishlist" label="Wishlist" light={light}>
            <HeartIcon />
          </IconLink>
          <IconLink href="/account" label="Account" light={light}>
            <UserIcon />
          </IconLink>
          <IconLink href="/cart" label={`Cart, ${count} items`} light={light}>
            <BagIcon />
            {count > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ember-deep px-1 text-[10px] font-semibold text-white">
                {count}
              </span>
            ) : null}
          </IconLink>
          <button
            type="button"
            className={cn(
              "grid h-10 w-10 place-items-center rounded-full transition hover:bg-white/15 active:scale-95 lg:hidden",
              !light && "hover:bg-ink/5",
            )}
            aria-expanded={open}
            aria-controls={menuId}
            title={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <MenuIcon />
          </button>
        </div>
      </div>

      {open ? (
        <div
          id={menuId}
          className="fixed inset-0 z-50 flex flex-col bg-background text-ink lg:hidden"
        >
          <div className="flex h-16 items-center justify-between px-4">
            <p className="font-serif text-xl">Oak &amp; Ember</p>
            <button
              ref={closeRef}
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5 active:scale-95"
              onClick={() => setOpen(false)}
              title="Close menu"
            >
              <span className="sr-only">Close menu</span>
              <CloseIcon />
            </button>
          </div>
          <form action="/catalog" role="search" className="px-4">
            <label htmlFor="mobile-search" className="sr-only">
              Search the catalog
            </label>
            <input
              id="mobile-search"
              name="q"
              placeholder="Search pieces"
              className="h-12 w-full rounded-full border border-line bg-surface px-4"
            />
          </form>
          <nav className="mt-6 flex flex-col gap-1 px-4" aria-label="Mobile">
            <Link href="/catalog" className="rounded-xl px-2 py-3 font-serif text-3xl hover:bg-surface">
              Shop
            </Link>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/catalog/${category.slug}`}
                className="rounded-xl px-2 py-2 text-lg hover:bg-surface"
              >
                {category.name}
              </Link>
            ))}
            <Link href="/about" className="rounded-xl px-2 py-3 font-serif text-3xl hover:bg-surface">
              Our story
            </Link>
            <Link href="/demo" className="mt-4 rounded-full bg-ember-deep px-4 py-3 text-center text-white hover:bg-[#722f10]">
              Try the demo
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function navLink(light: boolean) {
  return cn(
    "rounded-full text-sm tracking-wide transition hover:opacity-70",
    light ? "text-[#f7f1e8]" : "text-ink",
  );
}

function IconLink({
  href,
  label,
  light,
  children,
}: {
  href: string;
  label: string;
  light: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={cn(
        "relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-white/15 active:scale-95",
        !light && "hover:bg-ink/5",
      )}
    >
      {children}
    </Link>
  );
}

function ThemeToggle({ light }: { light: boolean }) {
  const dark = useSyncExternalStore(
    (onChange) => {
      const observer = new MutationObserver(onChange);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      return () => observer.disconnect();
    },
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("oak-ember-theme", next ? "dark" : "light");
  }

  const label = dark ? "Switch to light mode" : "Switch to dark mode";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        "grid h-10 w-10 place-items-center rounded-full transition hover:bg-white/15 active:scale-95",
        !light && "hover:bg-ink/5",
      )}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9Z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 19.2c1.4-3 3.8-4.2 7-4.2s5.6 1.2 7 4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 8h12l-1 12H7L6 8Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16 3.5A8.5 8.5 0 1 0 20.5 14 7 7 0 0 1 16 3.5Z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
