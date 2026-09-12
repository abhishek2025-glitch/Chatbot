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

## 3. How to Deploy

### Option A: Deploy to GitHub Pages
1. Push `index.html` to your GitHub repository `main` branch.
2. In GitHub, navigate to **Settings** → **Pages** → **Source: Deploy from a branch** (`main` / root).
3. Your live personalized demo is accessible immediately.

### Option B: Cloudflare Worker Production Proxy
1. Navigate to `/worker` directory.
2. Run `wrangler secret put GROQ_API_KEY` and enter your Groq API Key.
3. Deploy the worker: `wrangler deploy`.
4. Point `WORKER_URL` inside `index.html` or the app configuration to your deployed worker URL.
5. Set `isDemoMode = false`.

---

## 4. Safety Guardrails (TRD §7 & §9)
- **Zero Diagnosis:** Strictly refuses medical and clinical advice; acute pain escalates to WhatsApp emergency care.
- **Price Ranges Only:** Always quotes ranges ($4,500–$9,000 for veneers; $900–$1,600 for implants) followed by explicit clinical qualification requirements.
- **Multilingual Delivery:** Responds fluently in Arabic, Russian, German, and Spanish.
- **Immediate Escalation:** Hands off to direct WhatsApp line or Calendly video consult the moment booking intent or exact price demand is detected.
- **CRM Extraction:** Collects patient name, country, procedure, budget band, and travel timeframe conversationally without forms.
