# Pappa's Legacy Interview
### A WinterHaven.AI Product — v1.0

A guided AI interview app that helps seniors capture their life story, faith, and wisdom for their families.

---

## Deploy to Vercel in 20 Minutes

### What You Need
- A GitHub account (free)
- A Vercel account (free) — vercel.com
- Your Anthropic API key (from console.anthropic.com)

---

### Step 1 — Push to GitHub

1. Create a new repository on GitHub called `pappa-legacy`
2. Upload all these files into it (drag and drop works)
3. Make sure the folder structure looks like this:

```
pappa-legacy/
├── api/
│   ├── chat.js
│   └── collect.js
├── src/
│   ├── App.jsx
│   └── main.jsx
├── public/
│   └── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

---

### Step 2 — Connect to Vercel

1. Go to vercel.com → Log in → "Add New Project"
2. Select your `pappa-legacy` GitHub repository
3. Vercel will auto-detect it as a Vite project
4. Click **Deploy** — it will build automatically

---

### Step 3 — Add Your API Key (CRITICAL)

Your Anthropic API key must never be in the code — it lives in Vercel's environment.

1. In Vercel → your project → **Settings** → **Environment Variables**
2. Add this variable:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your key from console.anthropic.com (starts with `sk-ant-...`)
3. Click Save
4. Go to **Deployments** → click the three dots → **Redeploy**

---

### Step 4 — Set a Custom Domain (Optional but Recommended)

1. In Vercel → Settings → Domains
2. Add: `legacy.winterhaven.ai` or `pappa.winterhaven.ai`
3. Follow Vercel's instructions to add a DNS record in your domain registrar
4. Takes 5-10 minutes to go live

Without a custom domain, Vercel gives you a free URL like:
`pappa-legacy-xyz.vercel.app`

---

### Step 5 — Send Pappa the Link

Text him: "Dad — here is your birthday gift. Open this on your phone and follow the steps. I love you."

`https://pappa.winterhaven.ai` (or your Vercel URL)

That's it. No app download. No login. No password. Just the link.

---

## Data Collection Setup (Optional — For Product Development)

The app already captures **anonymous engagement data** (answer lengths, which questions get the most responses) when users check the consent box on the welcome screen.

To store this data persistently:

1. In Vercel → your project → **Storage** → **Create KV Database**
2. Give it any name (e.g. `legacy-responses`)
3. Vercel will automatically add `KV_REST_API_URL` and `KV_REST_API_TOKEN` to your environment
4. In `api/collect.js`, uncomment the Vercel KV lines (instructions are in the file)
5. Redeploy

Without KV setup, data is logged to Vercel's built-in function logs (visible in your dashboard under Functions → Logs). Still useful for early product development.

---

## Privacy Architecture

| Data | What Happens |
|------|-------------|
| Answers | Sent to Anthropic API for AI response. Never stored by this app. |
| Names | Never collected. Pappa is preset. |
| Anonymous engagement (with consent) | Chapter ID, question index, answer length only. Never the answer text. |
| Estate / financial info | Not in this app. Handled separately with governance. |

---

## Making It Work for Other Seniors

To use this for a different senior:

1. In `src/App.jsx`, find the `SYSTEM_PROMPT` constant
2. Update the name, background, and family details
3. Redeploy

Future version: a simple admin panel where you can configure a new senior's profile before sending them a link. That's the product.

---

## WinterHaven.AI

This app is the foundation of the Senior Legacy product line.
Built with love for Phillip L. Bowers — March 2026.
