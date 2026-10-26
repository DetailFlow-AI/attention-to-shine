#!/usr/bin/env node
// One-time setup for live Google reviews (lib/googleReviews.ts).
//
// Signs you in to Google once, then prints the five values Vercel needs to
// read your Business Profile reviews:
//   GBP_CLIENT_ID, GBP_CLIENT_SECRET, GBP_REFRESH_TOKEN,
//   GBP_ACCOUNT_ID, GBP_LOCATION_ID   (+ GOOGLE_PLACE_ID for the "See more" link)
//
// Run it on your own computer (Node 18 or newer, no installs needed):
//
//   node scripts/gbp-setup.mjs YOUR_CLIENT_ID YOUR_CLIENT_SECRET
//
// Sign in with the Google account that OWNS or MANAGES the business profile.
// Full steps: SETUP.md → "Live Google reviews".
//
// The printed values are secrets. Paste them into Vercel → Settings →
// Environment Variables; never commit them or send them to anyone.

import http from "node:http";

const [clientId, clientSecret] = process.argv.slice(2);
if (!clientId || !clientSecret) {
  console.error(
    "Usage: node scripts/gbp-setup.mjs YOUR_CLIENT_ID YOUR_CLIENT_SECRET"
  );
  process.exit(1);
}

const PORT = 53682;
const REDIRECT = `http://127.0.0.1:${PORT}`;
const SCOPE = "https://www.googleapis.com/auth/business.manage";

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline", // gives us a refresh token
    prompt: "consent", // always hand back a refresh token, even on re-runs
  });

async function getJson(url, token) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `${res.status} from ${new URL(url).hostname}: ${JSON.stringify(body).slice(0, 300)}`
    );
  }
  return body;
}

async function finish(code) {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: REDIRECT,
      grant_type: "authorization_code",
    }),
  });
  const tokens = await tokenRes.json();
  if (!tokenRes.ok || !tokens.refresh_token) {
    throw new Error(`Token exchange failed: ${JSON.stringify(tokens)}`);
  }

  const { accounts = [] } = await getJson(
    "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
    tokens.access_token
  );
  if (accounts.length === 0) {
    throw new Error(
      "This Google account doesn't manage any Business Profiles. Sign in with the one that does."
    );
  }

  const found = [];
  for (const account of accounts) {
    const { locations = [] } = await getJson(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,metadata&pageSize=100`,
      tokens.access_token
    );
    for (const loc of locations) found.push({ account, loc });
  }
  if (found.length === 0) {
    throw new Error("No business locations found on this Google account.");
  }

  console.log("\n✅ Signed in. Add these in Vercel → Settings → Environment Variables");
  console.log("   (Production and Preview), then redeploy:\n");
  console.log(`GBP_CLIENT_ID=${clientId}`);
  console.log(`GBP_CLIENT_SECRET=${clientSecret}`);
  console.log(`GBP_REFRESH_TOKEN=${tokens.refresh_token}`);

  found.forEach(({ account, loc }, i) => {
    if (found.length > 1) console.log(`\n# Option ${i + 1}: ${loc.title}`);
    console.log(`GBP_ACCOUNT_ID=${account.name.replace("accounts/", "")}`);
    console.log(`GBP_LOCATION_ID=${loc.name.replace("locations/", "")}`);
    if (loc.metadata?.placeId) {
      console.log(`GOOGLE_PLACE_ID=${loc.metadata.placeId}`);
    }
  });
  if (found.length > 1) {
    console.log("\nMore than one business found — use the lines for Attention to Shine.");
  }
  console.log("\nKeep these private. Don't commit them or paste them anywhere public.\n");
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  if (!code && !error) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { "Content-Type": "text/html" });
  try {
    if (error) throw new Error(`Google sign-in was cancelled or failed: ${error}`);
    await finish(code);
    res.end("<h2>Done — go back to your terminal for the values.</h2>");
  } catch (err) {
    console.error(`\n❌ ${err.message}\n`);
    res.end("<h2>Something went wrong — check your terminal.</h2>");
  }
  server.close();
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("\nOpen this link in your browser and sign in with the Google");
  console.log("account that manages your Business Profile:\n");
  console.log(authUrl + "\n");
});
