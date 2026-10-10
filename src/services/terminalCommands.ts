import type {
  Dictionary,
  Locale,
  TerminalCommandName,
  TerminalCommandSpec,
  TerminalEffect,
  TerminalLine,
} from "@/types";
import { isProfessionalRole } from "@/data/experiences";
import { portfolioData } from "@/data/portfolioData";
import { monthsBetweenInclusive, roundedYearCount } from "@/lib/date";
import { interpolate, localize } from "@/lib/i18n";

export interface TerminalContext {
  dictionary: Dictionary;
  locale: Locale;
}

export const TERMINAL_COMMANDS: readonly TerminalCommandSpec[] = [
  { name: "help", aliases: [] },
  { name: "whoami", aliases: [] },
  { name: "projects", aliases: [] },
  { name: "experience", aliases: ["exp"] },
  { name: "skills", aliases: [] },
  { name: "contact", aliases: [] },
  { name: "resume", aliases: [] },
  { name: "clear", aliases: [] },
  { name: "exit", aliases: [] },
];

const COMMAND_EFFECTS: Partial<Record<TerminalCommandName, TerminalEffect>> = {
  clear: "clear",
  exit: "close",
  resume: "request-resume",
};

const COMPLETION_CANDIDATES = TERMINAL_COMMANDS.flatMap((command) => [command.name, ...command.aliases]).sort();

const BLANK_LINE: TerminalLine = { text: "" };

function formatTenure(
  experiences: typeof portfolioData.experiences,
  dictionary: Dictionary,
): string {
  const months = experiences.reduce((total, experience) => {
    if (!isProfessionalRole(experience) || experience.period.end === "Present") return total;
    return total + (monthsBetweenInclusive(experience.period.start, experience.period.end) ?? 0);
  }, 0);
  const years = roundedYearCount(months);
  const template = years === 1 ? dictionary.experience.tenureYear : dictionary.experience.tenureYears;
  return interpolate(template, { count: years });
}

export type ResolvedCommand =
  | { kind: "empty" }
  | { kind: "known"; name: TerminalCommandName }
  | { kind: "unknown"; command: string };

/** Accepts the command without its `/` prefix; the console router strips it beforehand. */
export function resolveCommand(input: string): ResolvedCommand {
  const token = input.trim().split(/\s+/, 1)[0]?.toLowerCase() ?? "";
  if (!token) return { kind: "empty" };
  const spec = TERMINAL_COMMANDS.find((command) => command.name === token || command.aliases.includes(token));
  return spec ? { kind: "known", name: spec.name } : { kind: "unknown", command: token };
}

export function getCommandEffect(input: string): TerminalEffect | undefined {
  const resolved = resolveCommand(input);
  return resolved.kind === "known" ? COMMAND_EFFECTS[resolved.name] : undefined;
}

export function completeCommand(prefix: string): string[] {
  const normalized = prefix.trim().toLowerCase();
  return COMPLETION_CANDIDATES.filter((candidate) => candidate.startsWith(normalized));
}

export function longestCommonPrefix(values: readonly string[]): string {
  const [first, ...rest] = values;
  if (first === undefined) return "";
  let prefix = first;
  for (const value of rest) {
    while (!value.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

const stripProtocol = (url: string) => url.replace(/^(https?:\/\/|mailto:)(www\.)?/, "");

const RENDERERS: Record<TerminalCommandName, (context: TerminalContext) => TerminalLine[]> = {
  help: ({ dictionary }) => [
    { text: dictionary.terminal.helpTitle, tone: "heading" },
    ...TERMINAL_COMMANDS.map((command) => ({
      label: [command.name, ...command.aliases].map((name) => `/${name}`).join(", "),
      text: dictionary.terminal.commands[command.name],
    })),
    BLANK_LINE,
    { text: dictionary.terminal.helpFooter, tone: "muted" },
  ],

  whoami: ({ dictionary, locale }) => {
    const { profile, contact, education, experiences, skills } = portfolioData;
    const { labels } = dictionary.terminal;
    const degree = education[0];
    const work = experiences.filter(isProfessionalRole);
    const leadership = experiences.filter((experience) => !isProfessionalRole(experience));
    const organizations = [...new Set(work.map((experience) => experience.company))].join(" · ");
    const backend = skills.find((group) => group.id === "backend-systems");
    const spoken = profile.languages
      .map((language) => `${localize(language.name, locale)} ${localize(language.level, locale)}`)
      .join(", ");
    const email = profile.socials.find((social) => social.platform === "email");

    return [
      { text: profile.name, tone: "heading" },
      { label: labels.role, text: localize(profile.headline, locale) },
      { label: labels.location, text: profile.location },
      { label: labels.status, text: localize(contact.availability, locale), tone: "success" },
      degree
        ? {
            label: labels.education,
            text: `${localize(degree.degree, locale)} · ${degree.institution} · GPA ${degree.gpa}/${degree.maxGpa}${degree.honors ? ` · ${localize(degree.honors, locale)}` : ""}`,
          }
        : BLANK_LINE,
      {
        label: labels.experience,
        text: `${formatTenure(work, dictionary)} · ${organizations}`,
      },
      ...(leadership.length > 0
        ? [
            {
              label: labels.leadership,
              text: leadership.map((experience) => experience.company).join(" · "),
            },
          ]
        : []),
      {
        label: labels.stack,
        text: (backend?.skills ?? []).slice(0, 6).join(", "),
      },
      { label: labels.languages, text: spoken },
      email
        ? { label: labels.email, text: email.handle, href: email.url }
        : BLANK_LINE,
      BLANK_LINE,
      { text: localize(profile.valueProposition, locale), tone: "muted" },
    ];
  },

  projects: ({ dictionary, locale }) => {
    const ordered = [
      ...portfolioData.projects.filter((project) => project.featured),
      ...portfolioData.projects.filter((project) => !project.featured),
    ];
    return [
      { text: dictionary.sections.projects, tone: "heading" },
      ...ordered.flatMap((project, index): TerminalLine[] => [
        {
          label: String(index + 1).padStart(2, "0"),
          text: project.featured ? `${project.title}  ★` : project.title,
          tone: project.featured ? "accent" : "default",
        },
        { label: "", text: localize(project.subtitle, locale), tone: "muted" },
        { label: "", text: project.keyMetrics.map((metric) => localize(metric, locale)).join(" · "), tone: "muted" },
      ]),
    ];
  },

  experience: ({ dictionary, locale }) => [
    { text: dictionary.sections.experience, tone: "heading" },
    ...portfolioData.experiences.map(({ period, role, company }) => ({
      label: `${period.start} → ${period.end === "Present" ? dictionary.common.present : period.end}`,
      text: `${localize(role, locale)} @ ${company}`,
    })),
  ],

  skills: ({ dictionary, locale }) => [
    { text: dictionary.sections.skills, tone: "heading" },
    ...portfolioData.skills.flatMap((group): TerminalLine[] => [
      { text: localize(group.label, locale), tone: "accent" },
      { text: group.skills.join(", "), tone: "muted" },
    ]),
  ],

  contact: ({ dictionary }) =>
    portfolioData.profile.socials.map((social) => ({
      label: social.platform === "email" ? dictionary.terminal.labels.email : social.platform,
      text: stripProtocol(social.url),
      href: social.url,
    })),

  resume: ({ dictionary }) => [{ text: dictionary.terminal.resumeOpening, tone: "success" }],

  clear: () => [],
  exit: () => [],
};

/** Pure: output is derived at render time, so past entries re-localize when the locale changes. */
export function renderCommandOutput(input: string, context: TerminalContext): TerminalLine[] {
  const resolved = resolveCommand(input);
  if (resolved.kind === "empty") return [];
  if (resolved.kind === "known") return RENDERERS[resolved.name](context);
  return [
    { text: interpolate(context.dictionary.terminal.notFound, { command: resolved.command }), tone: "error" },
    { text: context.dictionary.terminal.notFoundHint, tone: "muted" },
  ];
}
