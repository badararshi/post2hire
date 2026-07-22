# Admin Guide

## Becoming an admin

After signing up and verifying your email on the live site, run this once
in Supabase SQL Editor (replace with your real email):

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Then sign in and visit `/admin` — it's not linked anywhere publicly, so
bookmark it.

## What you can do from /admin

- **Daily generation limit** — how many post/CV generations each user gets
  per rolling 24 hours. Default 20.
- **File retention (days)** — how long generated items are kept before
  cleanup (default 90; automatic cleanup requires the optional pg_cron job
  documented at the bottom of `supabase/schema.sql`, or you can delete old
  rows manually/periodically).
- **Ads enabled** — one master switch. When off, all ad slots show nothing
  (not even placeholders) — useful before Adsterra approves your site.
- **Ad snippets** — paste the exact embed code Adsterra gives you for each
  slot (Header 728×90, Mid-content 300×250, Footer 468×60, Native Banner).
- **Users** — see everyone who's signed up, and disable/enable individual
  accounts. A disabled account is blocked from generating anything
  (enforced server-side, not just hidden in the UI) but can still sign in
  to see the "account disabled" message.
- **Contact messages** — a read-only copy of everything submitted through
  the public contact form, in case an email gets missed.
- **Failed generations** — a count of logged AI generation failures, for
  spotting patterns (e.g. a bad API key or a provider outage).

## What admins can never do

- See a user's password (Supabase never exposes this to anyone, including
  you).
- Browse a user's uploaded CVs or generated documents through the admin
  panel — that data is intentionally not surfaced there. If you ever need
  to access it for support or a security investigation, do so directly and
  sparingly in the Supabase dashboard, and log why.

## Admin actions are logged

Every settings change and user enable/disable is written to the
`audit_log` table with your user ID, the action, and a timestamp — visible
in Supabase's table editor if you need to review history.
