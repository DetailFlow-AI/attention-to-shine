# Website Task Batch — Summary (2026-06-25)

All 8 prioritized tasks were completed in a single branch and verified with
`next build` + `tsc --noEmit`. Each change is marked in code with a
`TASK N — … DONE 2026-06-25` comment so future runs can detect and skip
finished work **once this branch is merged to `main`**.

> ⚠️ **Important context:** the daily 2 AM routine has opened 20+ draft PRs
> (#12–#40) over the past week, **none of which were ever merged**. Because the
> `DONE` markers only take effect once they're on `main`, every prior run
> branched fresh off `main`, saw the unmarked 3-hour code, redid Task 1, and
> stopped — never reaching Tasks 2–8. This branch breaks that loop by completing
> **all 8 tasks at once**. Merging it (and closing the duplicate drafts) is what
> finally makes the skip-logic work.

## What was changed

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | **Booking time blocks** — 5-hour window per booking | ✅ | `BOOKING_BLOCK_HOURS` 3 → 5 drives both the calendar event and availability checker. A 10 AM booking blocks 10 AM–3 PM. |
| 2 | **Gallery before & after** — matched pairs side by side | ✅ | New "Before & After" tab; left = Before, right = After, each labeled. Only confirmed matched shots are paired (see issues). |
| 3 | **Remove social icons** — Instagram + Facebook | ✅ | Removed from the footer entirely (the only place they appeared). Not replaced. |
| 4 | **Contact email + location** | ✅ | Form sends to `lilliechris06@gmail.com`; physical address replaced with "Stationed in Lakeland, Florida — We come to you." (footer + contact page). |
| 5 | **Checkup plan description** | ✅ | Reframed as a maintenance package for already-clean vehicles, with specific services: exterior rinse, tire shine, window wipe down, interior vacuum, dashboard wipe. |
| 6 | **Extreme dirtiness pricing** | ✅ | Added an "Extreme Dirtiness" factor labeled **Custom Quote** (assessed before service, no set price). |
| 7 | **Add-ons in booking portal** | ✅ | New selectable add-ons section: Pet Hair (+$20), Stain Treatment (+$30), 1-Year Coating (+$100–$200), and a "No Add-Ons" option. Replaces typing into notes. |
| 8 | **Chatbot placeholder ("Shine")** | ✅ | Reserved bottom-right slot on every page except `/booking`. Placeholder only — not built. |

## Files edited

- `lib/googleCalendar.ts` — Task 1 (`BOOKING_BLOCK_HOURS` 3 → 5; default duration + comments).
- `components/BookingForm.tsx` — Task 1 (`DETAIL_HOURS` 3 → 5, copy) + Task 7 (add-ons selector, effective-notes plumbing).
- `app/gallery/page.tsx` — Task 2 (Before & After matched-pairs view).
- `components/Footer.tsx` — Task 3 (social icons removed) + Task 4 (location text).
- `app/contact/page.tsx` — Task 4 (location/service-area text).
- `app/api/contact/route.ts` — Task 4 (DONE marker; recipient defaults to lilliechris06@gmail.com).
- `app/services/page.tsx` — Task 5 (Checkup description) + Task 6 (Extreme Dirtiness factor).
- `components/ShinePlaceholder.tsx` (new) + `app/layout.tsx` — Task 8 (chatbot slot).
- `TASK_SUMMARY.md` (this file).

## Issues encountered

1. **The merge loop (root cause of the repeated Task 1 work).** No PR has ever
   been merged, so `DONE` markers never reached `main`. This is the single
   biggest issue and requires a human to merge one complete PR and close the
   duplicates (#12–#40).
2. **5h vs 3h ambiguity.** The task spec says 5 hours, but the most recently
   *merged* commit on `main` (#11) deliberately set it to **3 hours**, calling
   3h "the length of a detail." This branch ships **5h per the task spec.** If
   3h was an intentional later business decision, flip the single
   `BOOKING_BLOCK_HOURS` constant back.
3. **Gallery pairing (Task 2).** Only two before/after pairs are confirmed as
   the same vehicle/same angle (the ones already on the homepage). The other
   gallery photos are single completed results — auto-pairing them would
   misrepresent the work. The data structure makes adding more confirmed pairs
   trivial: drop them into `beforeAfterPairs` in `app/gallery/page.tsx`.
4. **Contact email delivery (Task 4) is config-dependent.** The route targets
   the correct address, but actual delivery needs `RESEND_API_KEY` set in
   Vercel, and `CONTACT_EMAIL` must not be overridden to another address. This
   can't be verified from the build environment — please confirm a test
   submission arrives.
5. **Add-ons pricing (Task 7).** The server prices upcharges from notes
   keywords (boolean, applied once each), so the selector folds selections into
   the notes payload using those exact keywords. This keeps client/server
   totals in sync and avoids double-counting even if a customer also types a
   keyword. No server change was required.

## Recommended order for future builds like this

To avoid the problems above:

1. **Merge cadence first.** A "complete one task per day, skip via DONE markers"
   loop only works if each day's PR is merged before the next run. Either
   auto-merge the daily PR after CI passes, or have the routine commit to a
   single long-lived branch instead of branching fresh off `main` each run.
2. **Resolve business-logic ambiguities up front** (e.g. 5h vs 3h booking
   block) so runs don't oscillate. Put the decision in `CLAUDE.md` or a config
   constant with a comment citing the decision.
3. **Wire up integrations and secrets before feature work** — Google Calendar
   service-account sharing/permissions, `RESEND_API_KEY`, `CONTACT_EMAIL`,
   Stripe keys. Many tasks silently no-op without them; verify each in a staging
   deploy.
4. **Centralize shared constants** (booking window, prices, add-on keywords) in
   one module so client and server can't drift — this codebase already does
   this well with `BOOKING_BLOCK_HOURS`.
5. **Build + type-check on every change** (`next build` skips type validation —
   run `tsc --noEmit` too) and deploy a preview before merging to production.
6. **Do content/asset-dependent tasks last** (e.g. before/after gallery pairs),
   since they need real matched media that code alone can't supply.
