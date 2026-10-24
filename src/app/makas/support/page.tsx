import type { Metadata } from "next";
import { MakasSupportForm } from "@/components/makas/MakasSupportForm";
import { contact } from "@/data/contact";
import { makasSupportContent } from "@/data/makasSupport";

const copy = makasSupportContent;

export const metadata: Metadata = {
  title: "Makas Destek & İletişim",
  description:
    "Makas salon randevu uygulaması için destek, sık sorulan sorular ve hesap silme. Apple App Store Guideline 5.1.1(v).",
  alternates: { canonical: "/makas/support" },
  openGraph: {
    title: "Makas Destek & İletişim",
    description:
      "Makas salon randevu uygulaması için destek, sık sorulan sorular ve hesap silme. Apple App Store Guideline 5.1.1(v).",
    url: "/makas/support",
  },
};

export default function MakasSupportPage() {
  return (
    <div lang="tr" className="scheme-dark min-h-dvh bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-2xl flex-col gap-2 px-4 py-5 sm:px-6">
          <p className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">{copy.eyebrow}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{copy.title}</h1>
        </div>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-14">
        <section aria-labelledby="makas-overview-title" className="flex flex-col gap-3">
          <h2 id="makas-overview-title" className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
            {copy.overviewTitle}
          </h2>
          <p className="text-sm leading-relaxed text-pretty text-zinc-300">{copy.overview}</p>
          <p className="text-sm leading-relaxed text-pretty text-zinc-400">{copy.overviewDetail}</p>
        </section>

        <section id="sss" aria-labelledby="makas-faq-title" className="scroll-mt-8 flex flex-col gap-3">
          <h2 id="makas-faq-title" className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
            {copy.faqTitle}
          </h2>
          <div className="flex flex-col gap-2">
            {copy.faq.map((item) => (
              <details key={item.question} className="group rounded-xl border border-zinc-800 bg-zinc-900/40 px-4">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-medium text-zinc-100 [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span aria-hidden="true" className="font-mono text-zinc-500 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="pb-4 text-sm leading-relaxed text-pretty text-zinc-400">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="hesap-silme" aria-labelledby="makas-deletion-title" className="scroll-mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">{copy.deletionGuideline}</p>
            <h2 id="makas-deletion-title" className="text-lg font-semibold tracking-tight">
              {copy.deletionTitle}
            </h2>
            <p className="text-sm leading-relaxed text-pretty text-zinc-400">{copy.deletionIntro}</p>
          </div>
          <ol className="flex flex-col gap-3">
            {copy.deletionSteps.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm leading-relaxed text-zinc-300">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-zinc-700 bg-zinc-950 font-mono text-[10px] text-zinc-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
          <aside lang="en" className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <h3 className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">{copy.deletionEnglishTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-pretty text-zinc-400">{copy.deletionEnglish}</p>
          </aside>
        </section>

        <MakasSupportForm />
      </main>

      <footer className="border-t border-zinc-800">
        <div className="mx-auto flex max-w-2xl flex-col gap-2 px-4 py-6 text-sm text-zinc-500 sm:px-6">
          <p>Makas · Salon randevu platformu</p>
          <a href={`mailto:${contact.email}`} className="w-fit py-2 text-zinc-300 underline-offset-4 hover:underline">
            {contact.email}
          </a>
        </div>
      </footer>
    </div>
  );
}
