# muratcanbarcin.com

Personal portfolio of Murat Can Barçin. A dark industrial interface with work experience, projects, and publications, plus the MCB.ai chat and a local shell (`/help`, `/projects`, `/whoami`).

The site is bilingual (Turkish / English). Copy is not hardcoded in JSX; it comes from the data files under `src/data`.

## Stack

- Next.js 16 (App Router) and React 19
- TypeScript, Tailwind CSS 4
- Google Generative AI (`ai` SDK) for MCB.ai
- Resend for the contact form and resume requests
- Zod for request validation

## Commands

```bash
npm install
npm run dev    # http://localhost:3000
npm run build
npm run start
npm run lint
```

## Environment

Put keys in `.env.local`. The page still builds without them; the related feature stays quiet or returns 503.

| Variable | Role |
| --- | --- |
| `GOOGLE_GENERATIVE_AI_API_KEY` | MCB.ai chat. Without it, `/api/chat` returns 503. `/` commands still run in the browser. |
| `RESEND_API_KEY` | Delivers contact-form and resume-request email. Without it, the request is logged and no mail is sent. |
| `RESEND_FROM_EMAIL` | Sender address. Falls back to Resend's onboarding address when empty. |
| `GITHUB_TOKEN` | Raises the rate limit for the latest-commit line in the hero. Without it, the public GitHub API is used. |

## Where content lives

| What | File |
| --- | --- |
| Identity, headline, social links | `src/data/profile.ts` |
| Employment, community roles, and role metrics | `src/data/experiences.ts` |
| Projects | `src/data/projects.ts` |
| Publications and academic co-authors | `src/data/publications.ts` |
| Education and certifications | `src/data/education.ts`, `src/data/certifications.ts` |
| Skill groups | `skills` in `src/data/profile.ts` |
| Interface copy | `src/locales/tr.ts`, `src/locales/en.ts` |

Add a role, project, or publication by extending the matching array. The tenure summary is computed from the role dates and rounds partial years up.

## How the page is built

`src/app/page.tsx` sets the section order: hero and console, experience, education, projects, publications, skills, contact.

Server routes:

- `POST /api/chat` — MCB.ai
- `POST /api/contact` — contact form
- `POST /api/resume-request` — resume request
- `GET /api/github-activity` — latest public push

The console has two modes. Input that starts with `/` resolves in the browser. Plain language goes to MCB.ai.
