# Post2Hire

**Create. Tailor. Get Hired.**

Two AI tools for job seekers and LinkedIn writers:

1. **LinkedIn Post Creator** — turn a subject into a polished, ready-to-post
   LinkedIn article with proper Unicode bold formatting, under a strict
   character/emoji/bold-percentage budget, with an optional AI-generated image.
2. **CV & Cover Letter Generator** — upload a CV, paste a job description,
   get back a tailored, ATS-safe CV and/or a factual cover letter, exportable
   as Word or PDF.

Built with Next.js 14 (App Router) + TypeScript + Tailwind CSS, Supabase
(auth, database, private file storage), and a swappable AI layer
(Google Gemini by default, or Anthropic).

## Quick start (local development)

```bash
npm install
cp .env.example .env.local   # then fill in your real keys
npm run dev
```

Visit http://localhost:3000.

## Full setup and deployment

See **DEPLOYMENT.md** for the complete click-by-click walkthrough: creating
your Supabase project, running the database schema, getting a free Gemini
key, setting up Resend for the contact form, Cloudflare Turnstile for
CAPTCHA, and deploying to Vercel.

## Admin panel

See **ADMIN_GUIDE.md**. After your first sign-up on the live site, you
promote your own account to admin with one SQL statement (documented there
and at the bottom of `supabase/schema.sql`).

## Project structure

```
src/app/            Pages and API routes (Next.js App Router)
src/components/      React components, grouped by feature
src/lib/             Supabase clients, AI provider abstraction, validation,
                      text utilities, CV extraction, DOCX/PDF export
supabase/schema.sql  Full database schema, RLS policies, storage policies
public/              Logo assets, favicons, OG image
```

## Locked product decisions (vs. the original brief)

These were explicitly agreed during scoping — see TESTING.md for how each
is verified:

1. No LinkedIn OAuth/publishing — posting is manual (Copy + Download only).
2. No job-description URL scraping — paste-only text box.
3. Adsterra Native Banner + standard banners only (no Popunder/Social Bar).
4. No antivirus scanning service — replaced with strict extension + MIME +
   magic-byte file validation.
5. Site name stays **Post2Hire**.
