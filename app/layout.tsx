import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { Suspense } from "react";
import { ShopProvider } from "@/components/shop-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Oak & Ember",
    template: "%s · Oak & Ember",
  },
  description:
    "Oak & Ember is a furniture shop for oak, linen, and warm light. Browse the collection, save pieces, and check out.",
};

const themeScript = `try{var t=localStorage.getItem('oak-ember-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <ShopProvider>
          <Suspense fallback={<div className="h-16 border-b border-line bg-background sm:h-[4.5rem]" />}>
            <SiteHeader />
          </Suspense>
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </ShopProvider>
      </body>
    </html>
  );
}
