# Attention to Shine — Setup Guide

## Quick Start

```bash
cd attention-to-shine
npm install
npm run dev
```

Open http://localhost:3000

---

## Before Going Live

### 1. Set up Stripe (for the booking form)

1. Create a free account at https://stripe.com
2. Go to Developers → API Keys
3. Copy your **Publishable key** and **Secret key**
4. Create a file called `.env.local` in this folder:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE pk_test_51TdrnbAj997MemJ3qAIqZ4IKSrJy37vU1b3bsKCANoA33a8MfIUwh6bH18vwZ9BKtxZFKQtXCu9LbbbZaIVv0PfN00LBjeHXmt 
STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE sk_test_51TdrnbAj997MemJ3nVGjWR3m61bkMeiXoxNfUeKMAvowtWsPbAsnfQZjCJZbI8vcBRdwetOkmjqxCDDmSPvMXzdL00FR9WwcSr 
```

> Use `pk_test_...` and `sk_test_...` during development, then switch to live keys when deploying.

### 2. Add your gallery photos

Drop your photos into:
- `public/images/exterior/` — name them `ext-01.jpg`, `ext-02.jpg`, etc.
- `public/images/interior/` — name them `int-01.jpg`, `int-02.jpg`, etc.

Then open `app/gallery/page.tsx` and update the `src` field in each `galleryItems` entry to match your filenames. The `PlaceholderImage` components will automatically be replaced once real `<Image>` tags are added.

### 3. Add your social media links

In `components/Footer.tsx`, find the Instagram and Facebook `<a>` tags and replace `href="#"` with your actual profile URLs.

### 4. Wire up the contact form

The contact form in `app/contact/page.tsx` currently simulates a send (for demo). To make it actually send emails, sign up for a free email service:

- **[Resend](https://resend.com)** — easiest, free tier available
- **[Formspree](https://formspree.io)** — no code needed for simple forms
- **[SendGrid](https://sendgrid.com)** — powerful, free tier

### 5. Connect your Google Calendar (live availability)

The booking form checks your Google Calendar and greys out time slots where
you already have an event, so customers can't book (or pay) for a time you
aren't available.

1. Go to https://console.cloud.google.com → create a project (free)
2. APIs & Services → Library → enable the **Google Calendar API**
3. APIs & Services → Credentials → **Create credentials → API key** — copy it
4. In Google Calendar (calendar.google.com): Settings → your calendar →
   **Access permissions** → check **"Make available to public"** and set it to
   **"See only free/busy (hide details)"** — this exposes only busy times,
   never event names or details
5. In the same settings page, copy your **Calendar ID** (usually your Gmail
   address)
6. Add both to `.env.local` (and to Vercel's environment variables):

```
GOOGLE_CALENDAR_ID=lilliechris06@gmail.com
GOOGLE_CALENDAR_API_KEY=YOUR_API_KEY_HERE
```

If these aren't set, the form simply shows every slot as available — nothing
breaks.

### 6. Auto-create calendar events for new bookings

When a customer books (online payment or pay-in-person), the site can
automatically add the appointment to your Google Calendar with their name,
service, vehicle, address, and payment status. This needs a **service
account** (the read-only API key above can't create events):

1. Go to https://console.cloud.google.com → same project as before →
   **IAM & Admin → Service Accounts → Create service account**. Name it
   anything (e.g. `website-bookings`), skip the optional role steps.
2. Open the new service account → **Keys → Add key → Create new key → JSON**
   — a JSON file downloads.
3. From that file, copy the `client_email` and `private_key` values.
4. In Google Calendar (calendar.google.com): Settings → your calendar →
   **Share with specific people or groups** → add the `client_email` address
   with permission **"Make changes to events"**.
5. Add to `.env.local` and Vercel's environment variables:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=website-bookings@your-project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> Paste the private key exactly as it appears in the JSON file (with the
> `\n` sequences). Keep the quotes in `.env.local`.

If these aren't set, bookings still work — the calendar event is simply
skipped (and logged).

---

## Deploy to Vercel

1. Push this folder to a GitHub repository
2. Go to https://vercel.com → New Project → Import your repo
3. Add your environment variables in Vercel's dashboard (Settings → Environment Variables):
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
4. Deploy — Vercel auto-detects Next.js

Your site will be live at a `.vercel.app` URL, and you can connect your custom domain `attentiontoshinedetailing.com` from the Vercel dashboard.

---

## Suggestions for After Launch

These are ideas to grow the site and business — none are required:

1. **Google Reviews widget** — Embed your Google review stars on the homepage. Builds trust instantly.
2. **Before & after slider** — A drag-to-reveal comparison tool for the gallery. Very satisfying on mobile.
3. **Text/SMS confirmation** — Use Twilio to automatically text customers when their booking is confirmed and again 30 minutes before arrival.
4. **Google Calendar sync** — Connect bookings to your calendar so you never double-book.
5. **Loyalty program** — A simple punch-card system (every 5th detail free) shown in a customer portal.
6. **Service area map** — An interactive map showing all the cities you cover.
7. **Instagram feed on homepage** — Auto-pull your latest detail photos directly from Instagram.
8. **Gift cards** — Stripe supports gift cards; great for holidays.
9. **Blog / tips section** — "How to maintain your detail between visits" posts boost your Google ranking.
10. **Live chat widget** — A simple chat button (e.g. Tidio) lets potential customers ask quick questions without calling.
