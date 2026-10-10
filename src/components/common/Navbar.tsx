"use client";

import { Menu, X } from "lucide-react";
import { portfolioData } from "@/data/portfolioData";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useLocale } from "@/hooks/useLocale";
import { useMobileMenu } from "@/hooks/useMobileMenu";
import { useTerminalShortcut } from "@/hooks/useTerminalShortcut";
import { actionVariants } from "@/components/ui/action";
import { LanguageToggle } from "./LanguageToggle";
import { MobileMenu } from "./MobileMenu";
import { Monogram } from "./Monogram";
import { RequestResumeLink } from "./RequestResumeLink";
import { TerminalTrigger } from "./TerminalTrigger";
import { cn } from "@/lib/utils";

const MOBILE_MENU_ID = "mobile-menu";
const { navigation, profile } = portfolioData;
const NAV_SECTION_IDS = navigation.map((item) => item.id);

export function Navbar() {
  const { t } = useLocale();
  const menu = useMobileMenu();
  const activeSection = useActiveSection(NAV_SECTION_IDS);
  const shortcutLabel = useTerminalShortcut();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Monogram label={profile.name} onClick={menu.close} />

        <nav aria-label={t("nav.primary")} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={isActive ? "location" : undefined}
                    className={cn(
                      "relative inline-flex h-9 items-center rounded-md px-3 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60",
                      isActive ? "text-zinc-100" : "text-zinc-400 hover:text-zinc-100",
                    )}
                  >
                    {t(item.labelKey)}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-x-3 -bottom-[13px] h-px bg-emerald-400/80 transition-opacity",
                        isActive ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <LanguageToggle />
          <TerminalTrigger shortcutLabel={shortcutLabel} className="hidden sm:inline-flex" />
          <RequestResumeLink intent="primary" className="hidden md:inline-flex" />
          <button
            type="button"
            onClick={menu.toggle}
            aria-expanded={menu.isOpen}
            aria-controls={MOBILE_MENU_ID}
            aria-label={t(menu.isOpen ? "nav.closeMenu" : "nav.openMenu")}
            className={cn(actionVariants({ intent: "ghost", size: "icon" }), "text-zinc-200 lg:hidden")}
          >
            {menu.isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>

      <MobileMenu
        id={MOBILE_MENU_ID}
        isOpen={menu.isOpen}
        onClose={menu.close}
        activeSection={activeSection}
        shortcutLabel={shortcutLabel}
      />
    </header>
  );
}
