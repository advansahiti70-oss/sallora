# Sallora: instructions for Claude Code

Sallora turns a café or restaurant's existing CCTV cameras into a live table board for waiters and a nightly report for the owner. Market: Kosovo and North Macedonia.

## Read before writing or changing code

1. `docs/rules-and-flows.md`: roles, flows and business rules (BR-01…BR-23). **This is the source of truth for product logic.** Cite rule IDs in code comments and tests (e.g. `// BR-07: seated after 60 s in zone`).
2. `docs/brand-book.md`: colours, fonts, tone of voice. Use its CSS tokens; never hard-code other colours.
3. `docs/business.md`: who the customer is, pricing (€39 per venue per month), costs.

## Non-negotiable

- **Privacy rules BR-01 to BR-06:** video never leaves the venue; no faces, no identification, no audio; no recordings; no per-waiter scores. If a feature request conflicts with these, stop and ask.
- Do not build anything on the "What version one will NOT do" list in `docs/rules-and-flows.md`.
- Every user-facing string exists in **Albanian (sq), Macedonian (mk) and English (en)**. Tone: calm, direct, warm.
- The Claude API is used only for setup (proposing table zones from one snapshot), the nightly and weekly reports, and owner questions. Never on live video. Default model: `claude-opus-5-5`.
- Never commit secrets. Keys go in `.env`, which is git-ignored.
