import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "VyaparVoice — Your Business Idea Deserves a Clear Plan | BhashaBRD",
  description:
    "Built for the way India does business. Describe the problem in your own words. Turn local business insight into structured requirements, practical next steps, and a plan your team can act on.",
  keywords: [
    "VyaparVoice",
    "BhashaBRD",
    "Business Requirements Document",
    "Indic Voice to BRD",
    "Sarvam AI",
    "Indian Entrepreneur Product Studio",
    "Software Requirement Specifications",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('vyaparvoice_theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-warm-50 text-ink-900 dark:bg-charcoal-900 dark:text-ink-100 antialiased selection:bg-forest-100 selection:text-forest-900 dark:selection:bg-forest-900/60 dark:selection:text-forest-200 transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
