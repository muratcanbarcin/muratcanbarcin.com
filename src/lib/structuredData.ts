import { education } from "@/data/education";
import { experiences } from "@/data/experiences";
import { profile } from "@/data/profile";
import { publications } from "@/data/publications";
import { siteConfig } from "@/data/site";
import type { EmploymentType, Experience, Publication } from "@/types";

export type JsonLdValue = string | number | boolean | JsonLdNode | readonly JsonLdValue[];

export interface JsonLdNode {
  "@type": string;
  "@id"?: string;
  [property: string]: JsonLdValue | undefined;
}

export interface JsonLdGraph {
  "@context": "https://schema.org";
  "@graph": JsonLdNode[];
}

/** Instructor and leadership roles are listed on the page but are not corporate employment. */
const EMPLOYMENT_TYPES: ReadonlySet<EmploymentType> = new Set(["Full-time", "Part-time", "Internship"]);

const nodeId = (fragment: string): string => `${siteConfig.url}/#${fragment}`;

const PERSON_ID = nodeId("person");
const WEBSITE_ID = nodeId("website");

const ownerSurname = profile.name.split(" ").at(-1) ?? profile.name;

function toEmployeeRole(experience: Experience): JsonLdNode {
  return {
    "@type": "EmployeeRole",
    roleName: experience.role.en,
    startDate: experience.period.start,
    endDate: experience.period.end === "Present" ? undefined : experience.period.end,
    worksFor: {
      "@type": "Organization",
      name: experience.company,
      url: experience.companyUrl,
    },
  };
}

function toAuthor(author: string): JsonLdNode {
  return author.endsWith(ownerSurname)
    ? { "@type": "Person", "@id": PERSON_ID, name: profile.name }
    : { "@type": "Person", name: author };
}

function toScholarlyArticle(publication: Publication): JsonLdNode {
  return {
    "@type": "ScholarlyArticle",
    "@id": nodeId(`publication-${publication.id}`),
    headline: publication.title,
    name: publication.title,
    author: publication.authors.map(toAuthor),
    isPartOf: { "@type": "Periodical", name: publication.journal },
    description: publication.abstract.en,
    abstract: publication.abstract.en,
    keywords: publication.keyTech.join(", "),
    dateCreated: publication.submissionDate,
    creativeWorkStatus: publication.status.en,
    inLanguage: "en",
    url: publication.paperUrl ?? nodeId("research"),
    sameAs: publication.doi ? `https://doi.org/${publication.doi}` : undefined,
  };
}

function buildPerson(): JsonLdNode {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: profile.name,
    jobTitle: profile.headline.en,
    description: profile.valueProposition.en,
    url: siteConfig.url,
    homeLocation: { "@type": "Place", name: profile.location },
    alumniOf: education.map(({ institution }) => ({
      "@type": "CollegeOrUniversity",
      name: institution,
    })),
    worksFor: experiences
      .filter((experience) => EMPLOYMENT_TYPES.has(experience.type))
      .map(toEmployeeRole),
    knowsAbout: siteConfig.knowsAbout,
    sameAs: profile.socials
      .filter((social) => social.platform !== "email")
      .map((social) => social.url),
  };
}

function buildWebSite(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: siteConfig.websiteName,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: ["en", "tr"],
    author: { "@id": PERSON_ID, "@type": "Person" },
  };
}

/** Pure, build-time graph linking the site owner, their research and the website via `@id`. */
export function buildStructuredData(): JsonLdGraph {
  return {
    "@context": "https://schema.org",
    "@graph": [buildPerson(), ...publications.map(toScholarlyArticle), buildWebSite()],
  };
}

/** `JSON.stringify` does not escape `<`, so a `</script>` inside any string would break out of the tag. */
export function serializeJsonLd(graph: JsonLdGraph): string {
  return JSON.stringify(graph).replace(/</g, "\\u003c");
}
