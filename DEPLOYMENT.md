# Post2Hire — Deployment Guide

Follow these steps in order. Everything here is free-tier. Total time:
roughly 30–45 minutes for a first-time setup.

## 1. Supabase (auth, database, file storage)

1. Go to **supabase.com** → Sign up (free) → **New project**.
   - Name it `post2hire` (or anything).
   - Choose a strong database password and save it somewhere safe.
   - Pick the region closest to your users.
2. Wait for the project to finish provisioning (~2 minutes).
3. Go to **Project Settings → API**. Copy three values — you'll need them
   in step 6:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret —
     never share it or commit it to git)
4. Go to **SQL Editor → New query**. Open `supabase/schema.sql` from this
   project, paste its entire contents, and click **Run**. This creates all
   tables, Row Level Security policies, and the private storage bucket.
5. Go to **Authentication → Providers → Email**. Confirm:
   - **Enable Email provider**: ON
   - **Confirm email**: ON (this is what enforces email verification)
6. Go to **Authentication → URL Configuration**. Set:
   - **Site URL**: your production URL (you'll get this in step 3 below —
     come back and update it after deploying, and add
     `http://localhost:3000` too for local testing)
   - **Redirect URLs**: add both
     `https://your-domain.com/auth/callback` and
     `http://localhost:3000/auth/callback`

## 2. Google AI Studio (Gemini — free tier, powers both text and image generation)

1. Go to **aistudio.google.com/apikey** → sign in with a Google account →
   **Create API key**.
2. Copy it → this is your `GEMINI_API_KEY`.

*(Optional: if you'd rather use Anthropic for text generation, get a key
from console.anthropic.com and set `AI_PROVIDER=anthropic` +
`ANTHROPIC_API_KEY` — image generation will still use your Gemini key.)*

## 3. Resend (contact form email — free tier, 100 emails/day)

1. Go to **resend.com** → sign up → **API Keys → Create API Key**.
2. Copy it → `RESEND_API_KEY`.
3. For now, leave `CONTACT_FROM_EMAIL` as the default
   `Post2Hire <onboarding@resend.dev>` — Resend's shared sending domain
   works immediately with no setup. Once you own a custom domain, verify it
   under **Domains** in Resend and switch this to
   `Post2Hire <noreply@yourdomain.com>`.
4. Set `CONTACT_TO_EMAIL=postgethired@gmail.com` (or your preferred inbox).

## 4. Cloudflare Turnstile (free CAPTCHA)

1. Go to **dash.cloudflare.com** → sign up if needed → **Turnstile** in the
   left sidebar → **Add a site**.
2. Domain: enter your production domain (you can add `localhost` as an
   additional domain for local testing).
3. Copy the **Site Key** → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
4. Copy the **Secret Key** → `TURNSTILE_SECRET_KEY`.

*(If you skip this step, the site still works — CAPTCHA just won't render
locally. Add it before going live to protect sign-up and the contact form
from bots.)*

## 5. GitHub

1. Create a new repository (e.g. `post2hire`) at github.com.
2. From this project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial Post2Hire build"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/post2hire.git
   git push -u origin main
   ```

## 6. Vercel (hosting)

1. Go to **vercel.com** → sign up with GitHub → **Add New → Project** →
   import your `post2hire` repository.
2. Before clicking Deploy, expand **Environment Variables** and add every
   variable from `.env.example` with your real values from steps 1–4:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AI_PROVIDER` = `gemini`
   - `GEMINI_API_KEY`
   - `GEMINI_TEXT_MODEL` = `gemini-2.5-flash`
   - `GEMINI_IMAGE_MODEL` = `gemini-2.5-flash-image`
   - `RESEND_API_KEY`
   - `CONTACT_TO_EMAIL`
   - `CONTACT_FROM_EMAIL`
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - `TURNSTILE_SECRET_KEY`
   - `NEXT_PUBLIC_SITE_URL` = your Vercel URL, e.g.
     `https://post2hire.vercel.app` (you can update this after your first
     deploy once you know the exact URL, then redeploy)
3. Click **Deploy**. Takes 1–3 minutes.
4. Once deployed, copy your live URL and go back to Supabase
   (**Authentication → URL Configuration**) to set the real Site URL and
   redirect URL, per step 1.6 above. Also update `NEXT_PUBLIC_SITE_URL` in
   Vercel's env vars and redeploy.

## 7. Promote yourself to admin

1. Visit your live site and sign up with your own email.
2. Verify your email (check inbox).
3. Go back to Supabase **SQL Editor** and run:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
4. Sign in and visit `/admin` on your live site.

## 8. Custom domain (optional)

1. In Vercel: **Project → Settings → Domains → Add**, enter your domain,
   follow the DNS instructions shown (usually one CNAME or A record at your
   domain registrar).
2. Once it's verified, update `NEXT_PUBLIC_SITE_URL` in Vercel env vars to
   your custom domain and redeploy.
3. Update the Supabase Site URL and redirect URL (step 1.6) to match.
4. Update your Turnstile site domain (step 4.2) to match.

## 9. Adsterra (ads)

1. Go to **adsterra.com** → sign up as a publisher → add your **live**
   domain (Adsterra requires the site to be live and reachable first).
2. Once approved, create ad units matching the sizes this build supports:
   Native Banner, 728×90, 300×250, 468×60.
3. Copy each unit's embed snippet.
4. On your live site, sign in as admin → `/admin` → paste each snippet
   into its matching field (Header / Mid-content / Footer / Native) → check
   **Ads enabled site-wide** → **Save settings**.

The site and both tools work fully with ads off — there's no rush on this
step, and nothing else depends on it.

## Troubleshooting

- **"Email not confirmed" on sign-in**: expected — the user needs to click
  the verification link Supabase emailed them.
- **Generation fails immediately**: double-check `GEMINI_API_KEY` is set
  correctly in Vercel and that you copied the full key.
- **Contact form fails**: check `RESEND_API_KEY` and that
  `CONTACT_TO_EMAIL` is set.
- **CAPTCHA not appearing**: expected if `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
  is empty — the form still works, just without bot protection.
