# Attention to Shine — Website Task Summary (2026-07-01)

All eight tasks from the task list are implemented on branch
`claude/lucid-euler-0i9e8m`. Each task is marked in code with a
`TASK N … — DONE 2026-07-01` comment so future runs can skip completed work.

## What was changed

| # | Task | Result |
|---|------|--------|
| 1 | Booking time blocks | Each booking now reserves **5 hours** (was 3). A 10:00 AM booking blocks 10:00 AM–3:00 PM on Google Calendar, and the availability checker (server + client) uses the same 5-hour window to prevent double bookings. |
| 2 | Gallery before & after | The gallery now leads with matched **before/after pairs shown side by side** (left = before, right = after), same vehicle/angle, clearly labeled, using the owner's curated pairs. |
| 3 | Remove social icons | Facebook and Instagram icons removed from the footer entirely — not replaced. |
| 4 | Contact form email + location | Contact form already routes to **lilliechris06@gmail.com** (verified). The physical-address "Location" field was replaced with **"Stationed in Lakeland, Florida — We come to you."** on the contact page, footer, and home page. |
| 5 | Checkup Detailing Plan | Rewritten as a **maintenance package for already-clean vehicles** with a specific service checklist: exterior rinse, tire shine, window wipe down, interior vacuum, dashboard wipe. |
| 6 | Extreme dirtiness pricing | Added an **"Extreme Dirtiness — Custom Quote"** entry to the "Factors That Can Impact Your Quote" section. No set price; assessed before service; severely neglected vehicles only. |
| 7 | Add-ons in booking portal | Added a selectable **Add-Ons** step: Pet Hair Removal (+$20), Stain Treatment (+$30), 1-Year Protection Coating (+$100–$200 by vehicle), and "No Add-Ons". Selections drive the existing pricing engine — no payment-backend changes. |
| 8 | Chatbot placeholder | Reserved the bottom-right slot on every page **except /booking** for the future "Shine" chatbot, via a placeholder component + code comment. Not built, as instructed. |

## Files edited

- `lib/googleCalendar.ts` — 5-hour block window (Task 1)
- `components/BookingForm.tsx` — 5-hour client validation (Task 1) + add-ons UI (Task 7)
- `app/gallery/page.tsx` — before/after paired section (Task 2)
- `components/Footer.tsx` — removed socials (Task 3) + location text (Task 4)
- `app/contact/page.tsx` — location text (Task 4)
- `app/page.tsx` — home location text (Task 4)
- `app/services/page.tsx` — checkup copy (Task 5) + extreme-dirt pricing (Task 6)
- `app/layout.tsx` + `components/ChatbotSlot.tsx` (new) — chatbot placeholder (Task 8)

## Issues encountered

1. **The daily routine was stuck in a loop.** The biggest problem this run
   uncovered: **30+ open pull requests (#34–#63)** each re-implement the same
   tasks, and **none had been merged**. Because every daily run branches fresh
   from `main` — which only contained the early calendar work (through PR #11) —
   the "check DONE markers and skip completed tasks" mechanism never worked:
   completed work never reached `main`, so each run started from zero and
   opened yet another PR. **This PR consolidates all eight tasks into one clean,
   current branch so a single merge ends the cycle.** The 30 stale PRs should
   then be closed.
2. **Task 2 depends on real photo assets.** Only two owner-curated before/after
   pairs exist in the repo. The paired UI is built and ready; more pairs just
   need to be added to `beforeAfterPairs` in `app/gallery/page.tsx` as new
   before/after photos are supplied.
3. **`next@14.2.0` has a known security advisory.** `npm install` warns to
   upgrade to a patched version. Not addressed here (out of task scope) but
   worth doing.

## Recommended order for future website builds

To avoid the problems above (calendar permissions, syntax errors, deploy churn):

1. **Merge as you go.** The single biggest fix: merge each completed PR before
   starting the next run. An unmerged PR pipeline turns a "skip completed tasks"
   loop into an infinite re-do loop. One reviewer merging daily prevents 30
   duplicate PRs.
2. **Set up secrets/permissions first.** Configure Google Calendar service-account
   sharing, `RESEND_API_KEY`, and Stripe keys before feature work, so calendar
   writes and emails can be verified end-to-end rather than assumed.
3. **Content and copy tasks before flow/payment tasks.** Do the low-risk content
   edits (gallery, footer, pricing copy) first; save booking/payment changes for
   last and keep them additive so a mistake can't break checkout.
4. **Build + type-check before every commit.** Run `npm run build` and
   `npx tsc --noEmit` locally; the production build skips type validation, so a
   type error can otherwise reach deploy.
5. **Deploy from a single integration branch**, not a new branch per run, so
   Vercel previews track one line of history instead of dozens.
6. **Keep DONE markers *and* verify they're on `main`.** DONE markers only work
   as a skip mechanism if the marked code is actually merged — otherwise they're
   invisible to the next fresh checkout.
