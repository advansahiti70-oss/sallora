# Sallora: the business (Weekend 1, parts 1–4)

> **Status:** v1 draft, 22 Nov 2026. Lines marked 🧪 are hypotheses. The interviews in part 1 confirm them or kill them.
> **Inspiration:** a reel showing AI on a restaurant's existing cameras ([what it showed](research/inspiration-reel.md)).

**Sallora** turns the security cameras a café or restaurant already has into a live table board. It tells waiters which table has waited too long or needs clearing, and every night it sends the owner a short report.

---

## 1. The problem

**In one sentence:**
During the evening and weekend rush, owners and waiters of busy sit-down cafés and restaurants in Kosovo and North Macedonia can't see which tables have been waiting. Guests sit 5–10 minutes before anyone comes, and finished tables stay uncleared while new guests leave from the door. The venue loses table turns, tips and reviews (🧪 an estimated €300–€1,800 a month for a 20-table venue), and the owner can't step away from the floor.

| | |
|---|---|
| **Who has it** | The **owner or manager**, who pays the cost, and the **waiters**, who feel the stress, in venues with 10–60 tables and table service. In Kosovo and North Macedonia that includes most cafés, not only restaurants: people sit down and the waiter comes to them. |
| **When it hurts** | Friday–Sunday evenings, weekday lunch (12:00–14:00), after work (17:00–20:00), summer terraces, football nights and events. |
| **Time** | The owner or manager spends the rush standing at the bar or watching the CCTV monitor instead of running the business, and can't leave the venue. |
| **Money** 🧪 | Example: 20 tables and an average table bill of €14. Two walk-outs per rush plus one lost turn on 3 tables comes to about €70 a day, or **≈ €1,800 a month** that never comes in. Even at a fifth of that it is **≈ €360 a month**. |
| **Stress** | Waiters run blind and get blamed, and guests wave and complain. Experienced staff are leaving: the ILO reports a growing labour crisis in Kosovo's hospitality sector, driven by emigration and visa-free EU travel (since 1 Jan 2024), with high turnover for waiting staff. |

**What we already know from desk research (not a substitute for interviews):**
- The [ILO market systems analysis of Kosovo's HoReCa sector](https://www.ilo.org/sites/default/files/2026-02/HoReCa-ENG-12-12-2025.pdf) (2025) reports labour shortages and high turnover in low-skilled jobs such as waiting staff. It also finds that smaller businesses lag in technology and that owners often see software "as a cost rather than as an investment". The first two are our *why now*. The last one is our biggest sales risk.
- The reel that inspired this idea drew privacy pushback in its top visible comments ("gross ai"). Privacy has to be designed in from day one.

### Interviews: real people, their words (⚠️ TODO before hand-in)

The brief asks for at least two real conversations, and quotes can't be invented. Use the [interview guide](research/interview-guide.md) (questions in Albanian, Macedonian and English) and write down **exactly** what they say.

| | Interview 1 | Interview 2 |
|---|---|---|
| Who (role, venue type, city, number of tables) | _e.g. owner, café-restaurant, Prishtina, ~25 tables_ | _e.g. waiter, restaurant, Skopje_ |
| Date | | |
| The last time a guest waited too long, in their words | | |
| What it cost them (time, money, stress), in their words | | |
| What they do today (the workaround) | | |
| Do they have cameras? Who looks at them? | | |
| Free 14-day pilot: yes or no? €39/month: yes, no, or "depends on…"? | | |
| What surprised us / what we got wrong | | |

After the interviews, rewrite the problem sentence in their words and mark each 🧪 as ✅ confirmed or ❌ killed.

---

## 2. The big picture

**The product in one sentence a stranger understands:**
> Sallora is a small box that connects to the security cameras a café already has, tells the waiters' phones which table needs them, and sends the owner a simple report every night.

| | |
|---|---|
| **Who uses it** | **Waiters and the floor manager** use the live board and get alerts on a phone, tablet or watch. **The owner** reads the nightly report and asks questions ("How was Friday compared to last Friday?"). |
| **Who pays** | **The owner** (or a chain's operations manager). The users are not the payer, so the product must help waiters and never spy on them. That is why v1 has no per-waiter scores. |
| **Why now** | **1. Vision AI got cheap.** An open-source person detector runs live on a ~€250 mini PC, and Claude can read a camera snapshot and write a clear report in Albanian or Macedonian for a few cents.<br>**2. Staff shortage.** There are fewer and less experienced waiters (emigration, visa-free EU travel since 2024), so each waiter covers more tables and needs help seeing them.<br>**3. The cameras are already there.** CCTV is standard in venues, but it is only watched after something goes wrong.<br>**4. Service is now public.** Guests rate venues on Google Maps and Instagram, and slow service shows. |

### Other ways to solve the same problem (thinking outside the box)

| Way | How it would work | Why we did not choose it (for now) |
|---|---|---|
| **1. A service: "floor coach"** | A hospitality consultant reviews CCTV recordings every week, finds the slow moments and trains staff. | Not real-time, it costs hours of human time per venue every week, and it does not scale. |
| **2. A physical product: table call buttons** | A button on every table makes the waiter's watch vibrate (≈ $200–$350 for 20 buttons and a watch). | It only works if guests press, it gives no data or report, buttons get lost, and it does nothing for dirty tables or people waiting at the door. |
| **3. A WhatsApp/Viber bot** | Waiters text "T4 seated", "T4 served", "T4 left" to a bot that tracks times and sends stats. | It needs typing in the middle of the rush, so nobody does it and the data is wrong. |
| **4. A marketplace: peak-hour waiters** | On-demand extra waiters for Friday nights. | It treats the symptom (people), not the visibility problem, and a two-sided market is hard in a small country. |
| ✅ **Chosen: AI on the existing cameras** | A small box detects table states, alerts staff and reports to the owner. | **Zero extra work during the rush**, it uses the cameras the venue already owns, it creates data automatically (the nightly report), and it is a subscription that scales venue by venue. |

---

## 3. The market

### Competitors and alternatives (checked 22 Nov 2026)

| Option | Price | What it does well | Where it fails | Link |
|---|---|---|---|---|
| **Wobot.ai** (US/India) | Was $9.99 per camera/month, or from $40 per location/month for up to 4 cameras. **The pricing page is offline now**, so sales go through a demo. | AI on **existing CCTV**: speed of service, food safety and checklist insights for chains | Built for chains and QSR compliance; English only; insights more than live floor alerts; no presence in the Balkans | [wobot.ai/industry/dine-in](https://wobot.ai/industry/dine-in) |
| **Solink** (Canada) | From ≈ $175 per location/month (third-party listings, no public price list) | Video plus POS transaction search, loss prevention, cloud video | Expensive; focused on theft, not table service; needs a supported POS; video stored in the cloud | [solink.com](https://solink.com) · [pricing source](https://www.g2.com/products/solink/pricing) |
| **Shire Intelligence** (US; listed as Y Combinator Fall 2026) | Not public | "AI floor manager" on existing CCTV for full-service restaurants: table states (clean, occupied, dirty), server sections, seating suggestions. **Closest to our idea.** | Very early; US-only; English-only; price and privacy model unknown | [dealroom profile](https://app.dealroom.co/companies/shire_intelligence) |
| **Waitwhile** (waitlist software) | Free plan; paid from ≈ $31/month | Simple digital waitlist, "your table is ready" SMS, wait-time stats | Can't see the floor, so staff update tables by hand; SMS costs; English-first | [waitwhile.com/pricing](https://waitwhile.com/pricing/) |
| **Waiter call buttons** (e.g. Retekess kits) | ≈ $200–$350 one-off for 20 buttons and a watch | Cheap, no subscription, no privacy questions | Guests must press; no data or report; nothing for dirty tables or the door | [retekess.com](https://www.retekess.com/products/wireless-calling-pager-system-td110-watch-t114-call-button) |
| **Do nothing**: the owner's eyes, the CCTV monitor by the bar, a notebook or Excel | €0 plus the owner's time | Free, familiar, human | Breaks in the rush; ties the owner to the venue; no numbers; depends on experienced staff, who are leaving | – |

**The research pass also found these (missed in our first draft):** [EasyVision](https://f4.fund/startups/easyvision) (AI on existing restaurant cameras), [TableWatch by DifiNative](https://embeddedcomputing.com/technology/iot/edge-computing/transforming-restaurant-operations-with-ai-tablewatch-from-difinative-powered-by-intel-edge-processing) (table occupancy and readiness at the edge), [Safari AI](https://www.axis.com/fr-ca/partner-finder/safari-ai) (on-premises analytics for Axis cameras), [TRASSIR](https://www.trassir.com/news/how_ai_video_analytics_can_improve_restaurant_customer_flow/) (video analytics plus POS), [FootfallCam](https://www.footfallcam.com/Industries/QSRTechnology) (people counting that reuses CCTV), [Hikvision smart cameras](https://www.hikvision.com/us-en/solution/solutions-by-function/people-counting) (people counting and queues; means replacing cameras, sold by local installers) and open-source DIY prototypes (YOLO + ByteTrack). **Local players:** Cacttus (HoReCa ERP, focuses on large clients) and LobbyBoy (hotel systems), both named in the ILO report. They are partners, not competitors.

**What this tells us:** the idea is validated abroad (Y Combinator backed Shire, Wobot sells to chains). Nobody serves Kosovo and North Macedonia in Albanian and Macedonian, at a local price, with setup on site and video that never leaves the venue.

### How many possible customers? (Kosovo + North Macedonia)

| Step | Kosovo 🇽🇰 | North Macedonia 🇲🇰 | Source / assumption |
|---|---:|---:|---|
| All enterprises | 48,317 (2023) | 73,310 active business entities (2024) | KS: Kosovo Agency of Statistics, cited by the ILO report · MK: State Statistical Office, *North Macedonia in Figures 2026*, p. 62 |
| Hotels, restaurants and cafés (NACE section I) | 9% → **≈ 4,350** | **5,066** (6.9%) | Same sources |
| Food and drink only, no accommodation: × 85% 🧪 | ≈ 3,700 | ≈ 4,300 | Our assumption; check against NACE 56 data |
| **= TAM: every food and drink business** | **≈ 3,700** | **≈ 4,300** | **≈ 8,000 venues** |
| Table service and 10+ tables: × 50% 🧪 | ≈ 1,850 | ≈ 2,150 | Most cafés here have table service; excludes kiosks, fast food, bakeries |
| Already have CCTV: × 70% 🧪 | ≈ 1,300 | ≈ 1,500 | Our assumption: Kosovo's privacy agency inspects camera use across businesses, so CCTV is common |
| **= SAM: fits version 1** | **≈ 1,300** | **≈ 1,500** | **≈ 2,800 venues** |
| **SOM: 5% of SAM in 24 months** | ≈ 65 | ≈ 75 | **≈ 140 venues** |

**In money** (at €39/month, so €468/year per venue): TAM ≈ **€3.7M/yr**, SAM ≈ **€1.3M/yr**, SOM ≈ **€65k/yr** of recurring revenue.
**Caveats:** an enterprise is not a venue (chains have several venues; some registered firms are inactive), and the three 🧪 percentages are the weakest numbers. Ask about them in every interview.
**This is a beachhead.** Albania speaks the same language as Kosovo and has ≈ 17,850 accommodation and food service enterprises ([INSTAT, Structural Survey of Enterprises 2023](https://www.instat.gov.al/media/sccpist0/results-of-structural-survey-of-economic-enterprises-2023.pdf); figure found through search, re-check), so it is the natural next market.

### Why a customer would choose us

> **Because Sallora works on the cameras they already have, speaks Albanian and Macedonian, never sends video out of the venue, is set up in one afternoon by a local team, and costs about one macchiato a day.**

---

## 4. Business model and price

### Lean Canvas (one page)

| **Problem** | **Solution** | **Unique value proposition** | **Unfair advantage** | **Customer segments** |
|---|---|---|---|---|
| 1. During the rush, staff can't see which table has waited too long.<br>2. Finished tables stay dirty, so the venue looks full and people leave from the door.<br>3. The owner has no numbers (peak hours, party size, length of stay) and staffs by gut feeling. | 1. Live **table board** on staff phones: free, seated, waiting, needs clearing.<br>2. **Alert** to the section's waiter after N minutes without a visit, escalated to the manager.<br>3. **Nightly report** and "ask your numbers" in SQ, MK and EN (Claude). | **Your cameras already see every table. Sallora tells your staff which one needs them before the guest has to wave.** | Local language and on-site setup; privacy-first design (video never leaves the venue) built for KS and MK data-protection law; a network of CCTV installers as resellers; no local competitor found (Nov 2026). | Owners and managers of **sit-down cafés, café-bars and restaurants with 10–60 tables** in Kosovo and North Macedonia **that already have CCTV**. |
| **Existing alternatives:** the owner watching the floor or the CCTV monitor, waiters' memory, call buttons, waitlist apps (manual), a notebook or Excel. | **Key metrics:** minutes to first visit · waiting alerts per evening and response time · table turns per peak hour · pilot → paid conversion · venues active each week · churn. | **High-level concept:** "A head waiter's eyes on every table, using the cameras you already have." | **Channels:** warm network · walk-in demos · CCTV installers · Instagram and TikTok reels · hospitality groups and associations · POS dealers and accountants. | **Early adopters:** young owners of busy café-restaurants in Prishtina and Skopje (one big venue or 2–3 venues), already on a POS and Instagram. |

| **Cost structure** | **Revenue streams** |
|---|---|
| Sallora Box hardware (≈ €250 per venue, one-time) · cloud hosting (€6–€20/mo) · Claude API (≈ €3 per venue/mo) · domain (≈ €6/mo) · email and SMS (€0–€25/mo) · installer commission (20%) · founder time for sales, setup and support | **€39/month per venue** subscription (+ €9 per extra camera) · €149 setup fee · €390/year plan · later: multi-venue plans, POS integration, a waitlist screen for the door |

### The price, and why

| Plan | Price | What you get |
|---|---|---|
| **Pilot** | €0 for 14 days | We install the box, map the tables and train the staff. On day 14 you get a before/after report. |
| **Sallora** | **€39/month per venue** (≈ 2,400 MKD) | Up to 4 cameras and 40 tables, unlimited staff, live board, alerts, nightly report, questions in SQ, MK and EN |
| Extra camera | €9/month | For big halls and terraces |
| Yearly | €390/year | 2 months free |
| Setup (one-time) | €149 | Installation, table mapping, staff training. The Sallora Box is on loan: it stays ours and comes back if you cancel. |
| **Founding venues (first 10 only)** | **€29/month, locked for 12 months, free setup** | In return: weekly feedback and a testimonial or case study |

**Why monthly:** owners already think in monthly costs (rent, POS, internet). It is a low first step compared with a €1,000+ camera system. Our own costs (AI, hosting) are monthly too, and recurring revenue is what makes the business worth building.
**Why €39:** it is about €1.30 a day, roughly one macchiato. **It pays for itself if it saves one €14 table every ten days.** It is far below Solink (≈ $175) and in line with Wobot's old $40+ per location, but with local language and setup.
**Rejected:** *per use*, because owners hate bills that grow on their busiest nights; *one-off*, because we pay for AI and hosting every month.

### Monthly costs

| Item | Choice | Per month (10 venues) | Note / source |
|---|---|---:|---|
| Hosting | Hetzner Cloud VPS (API, database, dashboard) | €6–€20 | CX23 ≈ €5.49 + €0.50 IPv4 (June 2026), when available; otherwise CPX22 €19.99 ([review](https://betterstack.com/community/guides/web-servers/hetzner-cloud-review/), [prices](https://www.bitdoze.com/hetzner-cloud-cost-optimized-plans/)) |
| Domain | **sallora.ai** (2-year minimum) | ≈ €6 | ≈ $80/year at Cloudflare or Porkbun ([Porkbun .ai cost](https://porkbun.com/about/domain-cost-calculator/ai.txt)) |
| AI | **Claude API: Claude Opus 5.5** ($4 input / $20 output per million tokens) for nightly reports, table-map setup and owner questions | ≈ €30 (≈ €3/venue) | Calculation below; Anthropic list price, Nov 2026 |
| Email | Resend (reports, invites) | €0–€20 | Free tier of 3,000/month where still offered; Pro $20 ([pricing roundup](https://www.usecarly.com/blog/resend-pricing/)) |
| SMS | Only "box offline" alerts to owners. **Staff alerts use free web push.** | ≈ €5 | Twilio to North Macedonia $0.2012/SMS ([Twilio MK](https://www.twilio.com/en-us/sms/pricing/mk)); no published Twilio rate for Kosovo, so we avoid SMS |
| Push and chat alerts | Web push from the app (PWA), optional Telegram bot | €0 | |
| Repo, CI, uptime | GitHub, free monitoring tiers | €0 | |
| **Total running costs** | | **≈ €50–€85** | Revenue at 10 founding venues: €290/month (€390 at full price) |
| One-time hardware | Sallora Box: Intel N100 mini PC with 16 GB | ≈ €250/venue | Retail listings €236–€359 (Nov 2026). For 10 venues that is ≈ €2,500 up front, our biggest early cost. |

**AI cost per venue:** nightly report ≈ 12k tokens in + 1.2k out = $0.072 × 30 = $2.16 · owner questions 15 × (8k in + 0.4k out) = $0.60 · weekly summary 4 × (20k in + 1.5k out) = $0.44 → **≈ $3.20/month**. Live table detection runs **on the box** with an open-source model, so it costs $0 in API calls. *Option to test (your call): Claude Haiku 5.5 at $0.10/$0.50 for the nightly report, only if the quality holds.*

**Break-even:** 3 paying venues cover the running costs. Each box is paid back by the setup fee plus about 3 months of margin. For the founding 10, where setup is free, look at the [Innovation Centre Kosovo](https://ickosovo.com) and North Macedonia's Fund for Innovation and Technology Development for early grants.

### How the first 10 customers will find us

| # | Channel | What exactly we do | Goal |
|---|---|---|---|
| 1 | **Warm network** | List 20 venues where you, family or friends know the owner (Prishtina, Skopje, Tetovo, Prizren) and ask each for a 15-minute coffee. | 5 pilots |
| 2 | **Walk-in demos at quiet hours** | 10:00–12:00 on the café strips: a tablet with a 30-second demo video and a sample before/after report, offering the free pilot. | 3 pilots |
| 3 | **CCTV installers as resellers** | Partner with 2–3 local security installers who already service hundreds of venues: 20% recurring commission and we handle support. | 2 pilots, then a long-term channel |
| 4 | **Instagram and TikTok (@sallora.ai)** | Reels in Albanian and Macedonian filmed in a real pilot venue ("Table 4 waited 5 minutes…"), with the call to action "Comment DEMO". | Inbound leads |
| 5 | **Hospitality community** | Facebook groups for café and restaurant owners, hospitality associations, events of the ILO HoReCa Kosovo project, POS dealers and accountants who serve restaurants (referral fee). | Inbound leads and credibility |

**Target:** about 17 pilots at a 60% pilot-to-paid rate gives **10 paying venues**.

---

## Appendix: Claude's attack, and what we fixed

We wrote the plan first, asked Claude to attack it, then changed the plan.

| Attack | Fix in this plan |
|---|---|
| "Owners here won't pay for software; the ILO says they see it as a cost." | A free 14-day pilot ending in a **before/after report in euros**, a price framed as "one macchiato a day", and sales through the CCTV installers owners already trust. |
| "Guests will hate being watched. Look at the comments: 'gross ai'." | **Privacy by design:** no faces, no recordings, video never leaves the venue, signs at the door in SQ, MK and EN. Message: *"It watches tables, not people."* |
| "Waiters will feel spied on and sabotage it." | **No per-waiter scores in v1.** Alerts are framed as help ("Table 4 needs you"), and waiters benefit through fewer angry guests and better tips. |
| "The cameras point at the till and the door, not the tables." | A setup check from one snapshot. If coverage is bad, the installer partner adds one camera (+ €9/month). v1 needs a camera that sees at least 4 tables. |
| "Vision AI on every frame is expensive and slow." | Live detection runs **on the box** with an open-source model. Claude is used only for setup, the nightly report and owner questions, ≈ $3/venue/month. |
| "Wobot or Shire will come and crush you." | They sell to US and Indian chains in English. We win the Balkans first with language, setup on site and a local price, then Albania (same language). |
| "The market is tiny (≈ 2,800 venues)." | True: it's a beachhead. €65k ARR at 5% is a real small business. Albania (≈ 17,850 hospitality enterprises), wedding halls and hotel restaurants come next. |
| "Data-protection law will kill it." | Built to fit Kosovo's Law No. 06/L-082 and North Macedonia's Law on Personal Data Protection (2020): sign at the entrance, written notice to employees (as Kosovo's Information and Privacy Agency asks), no biometrics, and a data-protection checklist in setup. **Get a lawyer's review before the first paid venue.** |

---

## Sources

- ILO (2025): *A market systems analysis of the hotel, restaurant and café/catering (HoReCa) sector*, Kosovo: https://www.ilo.org/sites/default/files/2026-02/HoReCa-ENG-12-12-2025.pdf
- State Statistical Office of North Macedonia: *North Macedonia in Figures 2026* (active business entities by sector, 2024): https://www.stat.mk/media/dlojorye/makedonija-vo-brojki-2026-mk-web.pdf
- Kosovo Information and Privacy Agency: businesses that install cameras must comply with the Law on Personal Data Protection: https://aip.rks-gov.net/en/the-information-and-privacy-agency-requires-businesses-that-install-cameras-to-comply-with-the-criteria-of-the-personal-data-protection-law/
- Kosovo Law No. 06/L-082 on Protection of Personal Data: https://www.dataguidance.com/sites/default/files/law_no._06_l_-082_on_protection_of_personal_data_0.pdf
- North Macedonia Law on Personal Data Protection (2020): https://rm.coe.int/lpdp-republic-of-north-macedonia-2020/1680a9ac8a
- Competitors: links in the table above. Claude API prices: Anthropic list prices as of Nov 2026.
