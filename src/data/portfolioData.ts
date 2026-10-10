import type { PortfolioData } from "@/types";
import { certifications } from "./certifications";
import { resumeRequest, sourceRepositoryUrl } from "./contact";
import { education } from "./education";
import { experiences } from "./experiences";
import { navigation } from "./navigation";
import { profile, skills } from "./profile";
import { projects } from "./projects";
import { publications } from "./publications";

export const portfolioData: PortfolioData = {
  profile,
  experiences,
  projects,
  publications,
  education,
  certifications,
  skills,
  navigation,
  resumeRequest,
  sourceRepositoryUrl,
};
