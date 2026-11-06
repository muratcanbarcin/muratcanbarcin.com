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
| `GEMINI_API_KEY` | Server-only alternative Gemini credential. Never use a `NEXT_PUBLIC_` alias for either AI key. |
| `RESEND_API_KEY` | Delivers contact-form and resume-request email. Without it, the request is logged and no mail is sent. |
| `RESEND_FROM_EMAIL` | Sender address. Falls back to Resend's onboarding address when empty. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL for `chat_logs` and the Tier-2 daily counter. Missing keys skip persistence and log locally. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key for those writes. Never expose it to the browser. |
| `TELEGRAM_BOT_TOKEN` | Private bot that pings on a new MCB.ai question, resume request, or 85% quota warning. |
| `TELEGRAM_CHAT_ID` | Destination chat for those alerts. Missing token or chat id logs the alert instead of failing the request. |
| `GITHUB_TOKEN` | Optional. Raises the GitHub README rate limit and can read private repositories. Without it, a 403 or 404 uses the local project summary. |
| `DIAGNOSTIC_SECRET` | Protects diagnostic writes outside local development. Production diagnostics remain read-only. |

## Supabase keep-alive

`.github/workflows/supabase-keepalive.yml` schedules an authenticated read of at most one
`system_logs.id` at 12:17 UTC on days 1, 5, 9, 13, 17, 21, 25 and 29, and supports manual
dispatch. It uses GitHub Actions secrets named `NEXT_PUBLIC_SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY`. Vercel environment variables are **not** automatically
available to Actions; ensure the same values exist as repository Actions secrets.
Secret availability cannot be checked from the local checkout.

The workflow has no repository permissions, checkout or dependencies. It permits only
HTTPS Supabase project hosts, refuses redirects, times out after ten seconds, discards
the response body, and silently ignores missing configuration, network errors and HTTP
failures. It never imports the app or writes logs, counters, or notifications. GitHub
retains normal workflow-run metadata; Supabase may retain normal request telemetry.

It takes effect only after the reviewed workflow reaches the default branch and Actions
is enabled. GitHub can delay scheduled jobs and disables schedules in inactive public
repositories after 60 days. This is a best-effort activity query, not an uptime guarantee
or a way to resume an already paused project. Supabase evaluates low database activity
over seven days; this cadence is not an official exemption from pausing.
See [GitHub schedule behavior](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)
and [Supabase project pausing](https://supabase.com/docs/guides/platform/free-project-pausing).

## Content and security review

The November 2026 CV sync updates both languages and the static MCB.ai context. Public
README drawers use explicit repository/branch bindings; project descriptions distinguish
prototypes, future work, test results and estimated capacity. Private CV files stay in
the ignored `cv/` directory; resume delivery remains behind the request form.

Run `node --test tests/security.test.cjs` to check request guards and the isolated keep-alive workflow.

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

Add a role, project, or publication by extending the matching array. The tenure summary
rounds the inclusive month total for completed professional roles up to whole years (16 months → 2 years).

## How the page is built

`src/app/page.tsx` sets the section order: hero and console, experience, education, projects, publications, skills, contact.

Server routes:

- `POST /api/chat` — MCB.ai
- `POST /api/contact` — contact form
- `POST /api/resume-request` — resume request
The console has two modes. Input that starts with `/` resolves in the browser. Plain language goes to MCB.ai.
