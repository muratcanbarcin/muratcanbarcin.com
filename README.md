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
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL for `chat_logs` and the Tier-2 daily counter. Missing keys skip persistence and log locally. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key for those writes. Never expose it to the browser. |
| `TELEGRAM_BOT_TOKEN` | Private bot that pings on a new MCB.ai question, resume request, or 85% quota warning. |
| `TELEGRAM_CHAT_ID` | Destination chat for those alerts. Missing token or chat id logs the alert instead of failing the request. |
| `GITHUB_TOKEN` | Optional. Raises the GitHub README rate limit and can read private repositories. Without it, a 403 or 404 uses the local project summary. |

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
The console has two modes. Input that starts with `/` resolves in the browser. Plain language goes to MCB.ai.
