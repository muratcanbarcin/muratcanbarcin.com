"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { MakasSupportForm } from "@/components/makas/MakasSupportForm";
import { contact } from "@/data/contact";
import { makasSupportContent } from "@/data/makasSupport";
import { MAKAS_MARK_SRC } from "@/data/makasVenture";
import { useLocale } from "@/hooks/useLocale";

const copy = makasSupportContent;

export function MakasSupportView() {
  const { currentLocale, localize } = useLocale();

  return (
    <div lang={currentLocale} className="min-h-dvh bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <img src={MAKAS_MARK_SRC} alt="" width={512} height={512} className="size-11 shrink-0 object-contain" />
            <div className="min-w-0">
              <p className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">{localize(copy.eyebrow)}</p>
              <p className="truncate text-sm font-semibold tracking-tight">Makas</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              href="/"
              aria-label={localize(copy.home)}
              className="inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-2.5 text-sm text-zinc-500 transition-colors hover:text-zinc-100 lg:h-9"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              {localize(copy.home)}
            </Link>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{localize(copy.title)}</h1>
          <p className="mt-3 text-sm leading-relaxed text-pretty text-zinc-400 sm:text-base">{localize(copy.lede)}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <section id="hesap-silme" aria-labelledby="makas-deletion-title" className="scroll-mt-8 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">{copy.deletionGuideline}</p>
              <h2 id="makas-deletion-title" className="text-lg font-semibold tracking-tight">
                {localize(copy.deletionTitle)}
              </h2>
              <p className="text-sm leading-relaxed text-pretty text-zinc-400">{localize(copy.deletionIntro)}</p>
            </div>
            <ol className="flex flex-col gap-3">
              {copy.deletionSteps.map((step, index) => (
                <li key={step.en} className="flex gap-3 text-sm leading-relaxed text-zinc-300">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-zinc-700 bg-zinc-950 font-mono text-[10px] text-zinc-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="pt-0.5">{localize(step)}</span>
                </li>
              ))}
            </ol>
          </section>

          <div className="lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <MakasSupportForm />
          </div>

          <section id="sss" aria-labelledby="makas-faq-title" className="scroll-mt-8 flex flex-col gap-3">
            <h2 id="makas-faq-title" className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
              {localize(copy.faqTitle)}
            </h2>
            <div className="flex flex-col gap-2">
              {copy.faq.map((item) => (
                <details key={item.question.en} className="group rounded-xl border border-zinc-800 bg-zinc-900/40 px-4">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-medium text-zinc-100 [&::-webkit-details-marker]:hidden">
                    {localize(item.question)}
                    <span aria-hidden="true" className="font-mono text-zinc-500 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="pb-4 text-sm leading-relaxed text-pretty text-zinc-400">{localize(item.answer)}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-zinc-800">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-sm text-zinc-500 sm:px-6">
          <p>{localize(copy.footer)}</p>
          <a href={`mailto:${contact.email}`} className="w-fit py-2 text-zinc-300 underline-offset-4 hover:underline">
            {contact.email}
          </a>
        </div>
      </footer>
    </div>
  );
}
