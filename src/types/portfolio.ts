import type { Certification } from "./certification";
import type { MailtoTemplate } from "./contact";
import type { Education } from "./education";
import type { Experience } from "./experience";
import type { NavItem } from "./navigation";
import type { Profile, SkillGroup } from "./profile";
import type { Project } from "./project";
import type { Publication } from "./publication";

export interface PortfolioData {
  profile: Profile;
  experiences: readonly Experience[];
  projects: readonly Project[];
  publications: readonly Publication[];
  education: readonly Education[];
  certifications: readonly Certification[];
  skills: readonly SkillGroup[];
  navigation: readonly NavItem[];
  resumeRequest: MailtoTemplate;
  sourceRepositoryUrl: string;
}
