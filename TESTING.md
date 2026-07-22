# Testing Report

Status of each item against the original acceptance tests. "Built & verified"
means the code path exists and was exercised during development (TypeScript
compiles clean, production build succeeds, logic manually traced). Full
end-to-end testing (real Supabase project, real emails, real file uploads)
requires your live credentials from DEPLOYMENT.md — do this pass once
deployed, using this list as your checklist.

| # | Test | Status | Notes |
|---|------|--------|-------|
| 1 | New user registers, verifies email | Built | Supabase email verification; `Confirm email` must be ON in your project |
| 2 | Unverified user blocked from generation | Built & verified | Enforced in `requireVerifiedUser()`, called first in every generation route |
| 3 | Verified user signs in/out securely | Built | Standard Supabase Auth flow |
| 4 | Subject field rejects >32 words | Built & verified | Live counter + submit-blocking in `PostCreator`; server also validates in `validateSubject` |
| 5 | Post never exceeds 3,000 chars | Built & verified | Grapheme-accurate counting (`Intl.Segmenter`), auto-retry, then hard trim as last resort |
| 6 | Bold stays under 20%, survives copy-paste | Built & verified | Real Unicode Mathematical Sans-Serif Bold code points, not markdown — pastes correctly into LinkedIn |
| 7 | Post editable, copyable, downloadable | Built & verified | Textarea is editable; Copy button; .txt and .docx export |
| 8 | Image checkbox → downloadable PNG w/ alt text | Built | Requires a real `GEMINI_API_KEY` to test end-to-end |
| 9 | Valid DOCX/PDF upload; invalid rejected | Built & verified | Three-layer check: extension + MIME + magic bytes |
| 10 | Job description paste works; CV/letter/both selectable | Built & verified | |
| 11 | Tailored CV introduces no unsupported claims | Built | Prompt-level anti-fabrication rules + independent AI grounding-check pass; recommend a manual spot-check with a real CV before launch |
| 12 | Cover letter draws only on CV + JD | Built | Same anti-fabrication approach |
| 13 | DOCX + PDF download with correct filenames | Built & verified | Filenames sanitized; gated behind the accuracy-confirmation checkbox |
| 14 | Contact form delivers + confirms | Built | Requires real `RESEND_API_KEY` to test end-to-end |
| 15 | Ads don't interfere; tools work with ads off | Built & verified | `AdSlot` fails silently to a quiet placeholder if no snippet or if consent isn't given |
| 16 | Responsive on mobile/tablet/laptop/desktop | Built | Tailwind mobile-first classes throughout; recommend a manual pass on a real phone before launch |
| 17 | Delete files/account | Built & verified | `/api/account/delete` removes storage files, DB rows, and the auth user |
| 18 | Documents never publicly accessible | Built & verified | Private storage bucket, RLS policies scoped to `auth.uid()`, no public URLs used |
| 19 | Core site works if ad provider/LinkedIn unavailable | Built & verified | No LinkedIn integration exists (by design, per locked decision #1); ad failures are silently absorbed |

## What to do before considering this launch-ready

1. Run through DEPLOYMENT.md completely with your real credentials.
2. Manually test items 1, 2, 3, 8, 9, 10, 11, 12, 14, 16 end-to-end on the
   live site — these depend on real external services this environment
   couldn't call.
3. Upload a real CV and manually check the tailored output against it for
   any invented fact, as a final human check on top of the automated
   grounding validator.
4. Test on an actual phone, not just a resized browser window.
5. Once Adsterra approves your live domain, verify the three banner slots
   render correctly and don't shift layout on mobile.
