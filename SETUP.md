# Setup

One job still needs a person. Nothing else in this repo needs touching.

---

## 1. Change the passcode  (5 minutes, do this first)

The old passcode was written inside the dashboard file, which has been publicly
readable for as long as the site has been up. Treat it as known and replace it.

1. Open the Premier dashboard Sheet from your Google Drive (the one with the
   Store / Weeks / Targets / Log tabs).
2. Menu: **Extensions › Apps Script**. The storage script opens in a new tab.
3. Line 14 reads `var PASSCODE = '...';` — replace what is between the quotes
   with the new passcode. Keep the quotes and the semicolon.
4. **Ctrl/Cmd + S** to save.
5. Top right: **Deploy › Manage deployments**. Click the **pencil** on the existing
   deployment, set **Version** to **New version**, then **Deploy**.

   This step matters. Saving alone does not change the live web app — the old
   passcode keeps working until you redeploy.

6. Check the web app URL has not changed. If it has, it needs updating in
   `index.html` (search for `CLOUD_URL_DEFAULT`) and in `config.local.json`.
7. Send the new passcode to Courtney, Brittany, Jon and Aman. Each person enters
   it once, on each browser they use, and is not asked again.

Everyone still on the old passcode will see "Passcode not accepted" and be
prompted for the new one. Nobody loses any data — it all lives in the Sheet.

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
| Passcode out of the dashboard file | done, v1.8 |
| Week dates aligned to Mondays | done |
| Repo is the single source of truth | done |
| Passcode actually changed | **needs you — job 1 above** |
| Site publishes itself | done — GitHub Pages |
| Weekly numbers | entered by hand on the **Enter the week** tab — by design, no platform connections |
