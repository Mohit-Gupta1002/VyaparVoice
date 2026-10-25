import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("BrandMarquee and Theme System Verification", () => {
  it("BrandMarquee component contains all required brand messages", () => {
    const marqueePath = resolve(__dirname, "../components/BrandMarquee.tsx");
    const content = readFileSync(marqueePath, "utf-8");

    expect(content).toContain("From local ideas to actionable business plans");
    expect(content).toContain("Voice to structured business requirements");
    expect(content).toContain("Practical tools for India's everyday businesses");
    expect(content).toContain("Built for the way India does business");
    expect(content).toContain("marquee-track");
    expect(content).toContain("marquee-container");
    // Persistent fixed bottom viewport bar requirements
    expect(content).toContain("fixed");
    expect(content).toContain("bottom-0");
    expect(content).toContain("left-0");
    expect(content).toContain("right-0");
    expect(content).toContain("z-20");
    expect(content).toContain("border-t");
    expect(content).toContain("backdrop-blur-md");
    expect(content).toContain("bg-warm-100/95");
    expect(content).toContain("dark:bg-charcoal-900/95");
    expect(content).toContain("aria-label=\"Brand Philosophy Marquee\"");
    expect(content).toContain("◆");
  });

  it("page.tsx renders a single BrandMarquee instance and provides footer clearance", () => {
    const pagePath = resolve(__dirname, "../app/page.tsx");
    const content = readFileSync(pagePath, "utf-8");

    // Must have exactly one usage of <BrandMarquee />
    const matches = content.match(/<BrandMarquee\s*\/>/g);
    expect(matches).not.toBeNull();
    expect(matches?.length).toBe(1);

    // Footer must account for fixed marquee bar height with bottom padding
    expect(content).toContain("pb-20");
  });

  it("globals.css defines marquee animations, pause-on-hover, and reduced-motion", () => {
    const cssPath = resolve(__dirname, "../app/globals.css");
    const content = readFileSync(cssPath, "utf-8");

    expect(content).toContain("@keyframes marquee-scroll");
    expect(content).toContain(".marquee-track");
    expect(content).toContain("animation-play-state: paused;");
    expect(content).toContain("prefers-reduced-motion: reduce");
    expect(content).toContain(".dark");
  });

  it("Header component integrates theme toggle with Sun/Moon icons and accessible aria-label", () => {
    const headerPath = resolve(__dirname, "../components/Header.tsx");
    const content = readFileSync(headerPath, "utf-8");

    expect(content).toContain("useTheme");
    expect(content).toContain("toggleTheme");
    expect(content).toContain("Sun");
    expect(content).toContain("Moon");
    expect(content).toContain("aria-label");
  });

  it("layout.tsx includes anti-FOUC theme script and ThemeProvider wrapper", () => {
    const layoutPath = resolve(__dirname, "../app/layout.tsx");
    const content = readFileSync(layoutPath, "utf-8");

    expect(content).toContain("ThemeProvider");
    expect(content).toContain("vyaparvoice_theme");
    expect(content).toContain("prefers-color-scheme: dark");
    expect(content).toContain("suppressHydrationWarning");
  });

  it("tailwind.config.ts defines class-based darkMode and charcoal palette", () => {
    const tailwindPath = resolve(__dirname, "../../tailwind.config.ts");
    const content = readFileSync(tailwindPath, "utf-8");

    expect(content).toContain('darkMode: "class"');
    expect(content).toContain("charcoal");
  });
});
