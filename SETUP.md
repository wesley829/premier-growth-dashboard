# Setup

Nothing here needs a person any more. This file records how things are set up and why.

---

## 1. Passcode — none, by design

Wesley's call on 2026-09-10: there is nothing to hide, so the dashboard loads the
shared numbers for anyone who opens the link. No prompt, no passcode to hand round.

What that means in practice: **anyone with the link can change the numbers as well
as read them.** The Sheet has no other lock. If that ever becomes a problem, the
old passcode prompt is in git history (v1.8) and can be put back in ten minutes.

The Apps Script still carries a `PASSCODE` internally — the page sends it
automatically. Leave it alone; changing it would break the page until `index.html`
is updated to match.

---

## 2. Hosting — done

The site is published by GitHub Pages straight from this repo:

    https://wesley829.github.io/premier-growth-dashboard/

A push to `main` updates it within about a minute. No upload step exists any more,
so the live copy cannot drift behind the repo.

The repo had to be **public** for Pages to be free. Before that happened, the
team's numbers, the Sheet link and the old passcode were all scrubbed from the
repo and its history, so nothing in it is sensitive. Keep it that way: never
commit `config.local.json` or anything from `backups/`.

**Still to do:** tell the team the new address, then retire
https://premier-dashboard.tiiny.site/ — it serves an old file with the old
passcode inside it.

---

## Where things stand

| | Status |
|---|---|
| Passcode prompt | removed in v1.9 — open by design |
| Week dates aligned to Mondays | done |
| Repo is the single source of truth | done |
| Deleted weeks stay deleted | fixed in v1.9 — shared copy is the authority |
| Site publishes itself | done — GitHub Pages |
| Weekly numbers | entered by hand on the **Enter the week** tab — by design, no platform connections |
