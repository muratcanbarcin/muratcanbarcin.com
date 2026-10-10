export type TerminalCommandName =
  | "help"
  | "whoami"
  | "projects"
  | "experience"
  | "skills"
  | "contact"
  | "resume"
  | "clear"
  | "exit";

export interface TerminalCommandSpec {
  name: TerminalCommandName;
  aliases: readonly string[];
}

export type TerminalTone = "default" | "muted" | "accent" | "heading" | "error" | "success";

export interface TerminalLine {
  text: string;
  /** Rendered as a fixed-width key column before `text`. */
  label?: string;
  tone?: TerminalTone;
  href?: string;
}

/** Side effects the console performs after rendering a command's output. */
export type TerminalEffect = "clear" | "close" | "request-resume";
