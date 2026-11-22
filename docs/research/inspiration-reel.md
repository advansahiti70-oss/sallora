# Inspiration: the reel that started this

- **Source:** an Instagram reel by @trysauce.ai: https://www.instagram.com/reel/Df-QYG9jiwV/
- **Watched:** 22 Nov 2026, the full 42 seconds, frame by frame. At the time it had about 5.3K likes and 100 comments.
- **Format:** a 3D cartoon of a restaurant, shown through security-camera footage ("REC · CAM 2").

## What it shows (our summary, in our own words)

1. A restaurant connects AI to the security cameras it already has.
2. Every table gets an outline: **green = free**, **red = guests seated**, and a timer starts when guests sit down.
3. If guests have waited about **5 minutes** and no waiter has come, an alert pops up on the staff computer and a waiter goes to the table.
4. When guests have finished and the table hasn't been cleared, it is **flagged as dirty**, and a waiter comes to clear it.
5. The owner can see **which table will free up first**, so people waiting outside can sit sooner.
6. At the **end of the day** the owner gets a report: busiest hours (bar chart), average guests per table, and how long guests stay.
7. The punchline: no special technology, just **Claude on the regular cameras they already had**.
8. It ends by asking viewers to comment for more "AI for business" ideas.

## What the comments said

The two top visible comments pushed back on **privacy**. One person said they wouldn't want to go into a shop that uses this; another just wrote "gross ai".
**Lesson:** privacy is the first objection, so it is our first design rule (BR-01 to BR-06 in [rules-and-flows.md](../rules-and-flows.md)).

## What we keep, and what we change

| Keep from the reel | Change for Sallora |
|---|---|
| Use the cameras the venue already has; no new hardware for guests | Video is processed **on a box inside the venue** and never sent out |
| Table states (free, seated, dirty) with timers | **No faces, no recordings, no per-waiter scores** |
| An alert after ~5 minutes without a visit | Alerts on **waiters' phones**, not just one computer, plus escalation to the manager |
| "Which table frees up next" | Built for Balkan café culture (table service even in cafés) in **SQ, MK and EN** |
| An end-of-day report | Written by Claude in the owner's language, plus "ask your numbers" |
