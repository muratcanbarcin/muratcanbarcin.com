"use client";

import { Mail } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import type { SocialPlatform } from "@/types";
import { portfolioData } from "@/data/portfolioData";
import { actionVariants } from "@/components/ui/action";
import { GitHubIcon, LinkedInIcon } from "./BrandIcons";
import { cn } from "@/lib/utils";

const SOCIAL_META: Record<SocialPlatform, { label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }> = {
  github: { label: "GitHub", Icon: GitHubIcon },
  linkedin: { label: "LinkedIn", Icon: LinkedInIcon },
  email: { label: "Email", Icon: Mail },
};

interface SocialLinksProps {
  platforms?: readonly SocialPlatform[];
  className?: string;
}

export function SocialLinks({ platforms = ["github", "linkedin"], className }: SocialLinksProps) {
  const links = portfolioData.profile.socials.filter((social) => platforms.includes(social.platform));

  return (
    <ul className={cn("flex items-center gap-2", className)}>
      {links.map(({ platform, url }) => {
        const { label, Icon } = SOCIAL_META[platform];
        const isExternal = platform !== "email";
        return (
          <li key={platform}>
            <a
              href={url}
              aria-label={label}
              title={label}
              {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}
              className={cn(actionVariants({ intent: "secondary", size: "icon" }), "text-zinc-400 hover:text-zinc-100")}
            >
              <Icon className="size-4" aria-hidden="true" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
