# Aria — 24/7 International Patient Concierge (Dazzle Dental)
### Sales-Demo AI Chatbot & Qualification Platform for High-Ticket Medical Tourism & Studios

**Author/Owner:** Anurag Jaiswar (Nexus Web Systems / GTM Engineer)  
**PRD Version:** v1.0 — Ready to Demo & Deploy

---

## 1. Overview
Aria is a branded, embeddable AI concierge designed specifically for **Dazzle Dental**, a premier cosmetic and implant clinic treating international medical tourism patients ($3,000–$25,000+ per case).

### Funnel Problem Solved
- **3:00 AM Timezone Mismatch:** International patients research treatments late at night when the clinic front desk is offline.
- **Repetitive FAQ Backlog:** Cost, timeline, recovery, airport pickup, and hotel inquiries sit in WhatsApp/Instagram DMs for 12–48 hours.
- **Lost Revenue:** Every hour of delay on high-ticket decisions reduces close rate by over 60%.

---

## 2. Technical Architecture

```
┌─────────────────────────┐          HTTPS           ┌───────────────────────────┐         HTTPS         ┌─────────────────────────┐
│ Browser (Patient/Lead)  │ ───────────────────────▶ │ Cloudflare Worker Proxy   │ ────────────────────▶ │ Groq API                │
│ 3D Hero + Luxury Chat   │                          │ (Secret-holding proxy +   │                       │ /openai/v1/             │
│ on GitHub Pages         │ ◀─────────────────────── │ system prompt injection)  │ ◀──────────────────── │ chat/completions        │
└─────────────────────────┘      JSON Response       └───────────────────────────┘     JSON Response     └─────────────────────────┘
                                                                   │
                                                                   ▼
                                                     ┌───────────────────────────┐
                                                     │ Google Sheet / CRM Webhook│ (Lead record push)
                                                     └───────────────────────────┘
```

- **Runtime Inference:** Groq LPU with primary production model `openai/gpt-oss-120b` (low temperature 0.4, max tokens 600) with fallback `openai/gpt-oss-20b`.
- **Demo Mode:** Live temporary API key entered directly into the settings modal (held strictly in-memory during sales presentations).
- **Fallback Guardrail Engine:** Works immediately out of the box even before entering an API key, strictly enforcing the 5 safety guardrails and lead capture.
- **3D Hero Canvas:** Abstract layered geometric form with metallic gold lattice and ambient particles rendered with Three.js.

---

## 3. How to Deploy to GitHub Pages with GitHub Secrets

### Step 1: Add Your Groq API Key to GitHub Secrets
1. In your GitHub repository, click **Settings** (top tab).
2. On the left sidebar, click **Secrets and variables** → **Actions**.
3. Under *Repository secrets*, click **New repository secret**.
4. Set **Name**: `GROQ_API_KEY`
5. Set **Secret**: Paste your Groq API key (starts with `gsk_...` from [console.groq.com](https://console.groq.com/keys)).
6. Click **Add secret**.
*(Optional: you can also add `WORKER_URL` as a secret if routing through Cloudflare).*

### Step 2: Enable GitHub Pages with GitHub Actions
1. In your GitHub repository, go to **Settings** → **Pages** (under "Code and automation").
2. Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. Push any commit to `main`, or go to **Actions** → **Deploy Aria Demo to GitHub Pages** → **Run workflow**.
4. GitHub Actions will automatically:
   - Check out your repository
   - Inject your `GROQ_API_KEY` secret securely into the Vite build (`VITE_GROQ_API_KEY`)
   - Compile and deploy your site to `https://<your-username>.github.io/<repo-name>/`

### Step 3: Zero-Build Static Deployment (Alternative)
If you prefer deploying without running `npm run build`:
- You can serve `standalone.html` directly as `index.html`.
- It includes a placeholder at the top of the script:
  ```javascript
  const GROQ_API_KEY = "PASTE_YOUR_GROQ_KEY_HERE";
  ```
- Or define `window.__GROQ_API_KEY__ = "gsk_..."` inside `index.html`.

---

## 4. Cloudflare Worker Production Proxy (Recommended for Real Clinic Deployments)
1. Navigate to `/worker` directory.
2. Run `wrangler secret put GROQ_API_KEY` and enter your Groq API Key.
3. Deploy the worker: `wrangler deploy`.
4. Point `WORKER_URL` inside `index.html` or the app configuration to your deployed worker URL.
5. Set `isDemoMode = false`.

---

## 5. Safety Guardrails (TRD §7 & §9)
- **Zero Diagnosis:** Strictly refuses medical and clinical advice; acute pain escalates to WhatsApp emergency care.
- **Price Ranges Only:** Always quotes ranges ($4,500–$9,000 for veneers; $900–$1,600 for implants) followed by explicit clinical qualification requirements.
- **Multilingual Delivery:** Responds fluently in Arabic, Russian, German, and Spanish.
- **Immediate Escalation:** Hands off to direct WhatsApp line or Calendly video consult the moment booking intent or exact price demand is detected.
- **CRM Extraction:** Collects patient name, country, procedure, budget band, and travel timeframe conversationally without forms.
