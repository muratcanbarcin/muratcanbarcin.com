"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import type { SectionId } from "@/types";
import { portfolioData } from "@/data/portfolioData";
import { useLocale } from "@/hooks/useLocale";
import { RequestResumeButton } from "./RequestResumeButton";
import { SocialLinks } from "./SocialLinks";
import { TerminalTrigger } from "./TerminalTrigger";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  activeSection: SectionId | null;
  shortcutLabel: string;
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function MobileMenu({ id, isOpen, onClose, activeSection, shortcutLabel }: MobileMenuProps) {
  const { t } = useLocale();

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-menu"
            id={id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 top-full h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-t border-zinc-800/60 bg-zinc-950 lg:hidden"
          >
            <motion.nav
              aria-label={t("nav.primary")}
              initial={{ y: -12 }}
              animate={{ y: 0 }}
              exit={{ y: -8 }}
              transition={{ duration: 0.28, ease: EASE_OUT }}
              className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6"
            >
              <ul className="flex flex-col">
                {portfolioData.navigation.map((item, index) => {
                  const isActive = activeSection === item.id;
                  return (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * index, duration: 0.24, ease: EASE_OUT }}
                    >
                      <a
                        href={`#${item.id}`}
                        onClick={onClose}
                        aria-current={isActive ? "location" : undefined}
                        className={cn(
                          "flex h-14 items-center gap-4 border-b border-zinc-800/60 text-lg outline-none focus-visible:bg-zinc-900",
                          isActive ? "text-zinc-100" : "text-zinc-400",
                        )}
                      >
                        <span className="font-mono text-xs text-zinc-600">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {t(item.labelKey)}
                        {isActive && (
                          <span aria-hidden="true" className="ml-auto size-1.5 rounded-full bg-emerald-400" />
                        )}
                      </a>
                    </motion.li>
                  );
                })}
              </ul>

              <div className="flex flex-col gap-3">
                <TerminalTrigger shortcutLabel={shortcutLabel} onTrigger={onClose} className="w-full sm:hidden" />
                <RequestResumeButton intent="primary" size="lg" onClick={onClose} className="w-full md:hidden" />
              </div>

              <SocialLinks />
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
