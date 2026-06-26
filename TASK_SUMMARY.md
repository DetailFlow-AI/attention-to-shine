# Website Task List — Implementation Summary

All 8 prioritized tasks are implemented on this branch and marked `DONE 2026-06-26`
in code. Build verified with `npm run build` (all 16 routes compile).

## What changed

| # | Task | Summary | Files |
|---|------|---------|-------|
| 1 | Booking time blocks | Each booking reserves a **5-hour** window from the start time (10 AM blocks 10 AM–3 PM). One `BOOKING_BLOCK_HOURS` constant drives both calendar event creation and the availability checker; the client mirror `DETAIL_HOURS` and customer copy match. | `lib/googleCalendar.ts`, `components/BookingForm.tsx` |
| 2 | Gallery before/after | New **"Before & After"** tab shows matched pairs side by side (left = Before, right = After), each labeled and titled with the vehicle. Only confirmed matched shots are paired. | `app/gallery/page.tsx` |
| 3 | Remove social icons | Instagram + Facebook icons removed from the footer entirely, not replaced. | `components/Footer.tsx` |
| 4 | Contact email + location | Contact form targets `lilliechris06@gmail.com`. Physical-address "Location" displays replaced with **"Stationed in Lakeland, Florida — We come to you."** | `app/api/contact/route.ts`, `components/Footer.tsx`, `app/contact/page.tsx`, `app/page.tsx` |
| 5 | Checkup plan description | Reframed as a **maintenance package for already-clean vehicles** with specific services: exterior rinse, tire shine, window wipe-down, interior vacuum, dashboard wipe. | `app/services/page.tsx` |
| 6 | Extreme dirtiness pricing | Added **"Extreme Dirtiness — Custom Quote"** factor (assessed before service, no set price, severely neglected vehicles only). | `app/services/page.tsx` |
| 7 | Add-ons in booking portal | Clean selectable add-ons in Step 2: Pet Hair Removal (+$20), Stain Treatment (+$30), 1-Year Protection Coating (+$100–$200), and a "No Add-Ons" option. Folds into the existing keyword-priced notes payload — **no server change, no client/server total drift.** | `components/BookingForm.tsx` |
| 8 | Chatbot placeholder | Reserved bottom-right slot for the future **"Shine"** chatbot on every page **except** `/booking`. Placeholder only — not built. | `components/ShinePlaceholder.tsx` (new), `app/layout.tsx` |

## Issues / things to confirm

- **Booking window 5h vs 3h (Task 1):** The task spec says 5h (10 AM → 10 AM–3 PM), so this ships 5h. But merged PR #11 had deliberately set it to **3h** ("the length of a detail"). If 3h is the real intent, flip the single `BOOKING_BLOCK_HOURS` constant back.
- **Contact email delivery (Task 4):** Code targets the correct address, but live delivery requires `RESEND_API_KEY` set in Vercel and `CONTACT_EMAIL` not overridden. Can't verify prod delivery from CI — please send a test submission to confirm.
- **Gallery pairs (Task 2):** Only the two before/after pairs confirmed as same-vehicle/same-angle (from the homepage) are paired. Other gallery photos are single results; auto-pairing them would mislead. Add confirmed pairs to `beforeAfterPairs` in `app/gallery/page.tsx`.
- **The daily routine was stuck in a loop.** 35+ draft PRs (#12–#46) were opened over a week, almost all redoing Task 1 only, and none were ever merged. Root cause: each run branches fresh off `main`, and because nothing lands on `main`, the `DONE` markers that let a run skip finished work never take effect — so every run redoes Task 1 and stops. **This branch breaks the loop by doing all 8 tasks at once.** Merging one PR (and closing the duplicates) makes the markers real on `main`.

## Recommended order for future builds like this

1. **Settle infrastructure/permissions first** — calendar service-account sharing, `RESEND_API_KEY`, Stripe keys, env vars in Vercel — and verify each with a smoke test before building features on top.
2. **Lock product decisions before coding** (e.g. 5h vs 3h block) so runs don't thrash on the same constant.
3. **Merge early and often.** A per-task DONE-marker workflow only works if each task's PR actually lands on `main`; otherwise every run starts from the same state and repeats Task 1. Prefer one short-lived branch merged promptly over many parallel drafts.
4. **Centralize shared constants** (the single `BOOKING_BLOCK_HOURS` driving both calendar + availability is the right pattern — copy it for any value used in more than one place).
5. **Build behind keyword/data contracts** where client and server both price (Task 7's add-ons reuse the server's keyword detection, so totals can't drift).
6. **Run `npm run build` before every push** to catch syntax/type errors locally rather than on Vercel.
