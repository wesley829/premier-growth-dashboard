# Setup — the two jobs that need a person

Both are one-off. Neither takes long. Nothing else in this repo needs touching.

---

## 1. Change the passcode  (5 minutes, do this first)

The old passcode was written inside the dashboard file, which has been publicly
readable for as long as the site has been up. Treat it as known and replace it.

1. Open the Premier dashboard Sheet from your Google Drive.
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

## 2. Put the site on Cloudflare Pages  (10 minutes, free, repo stays private)

Once this is done, publishing is automatic: a push to `main` updates the live
dashboard, with no upload step and no way for the live copy to drift out of date.

1. Go to https://dash.cloudflare.com and sign in.
2. Left sidebar: **Workers & Pages** › **Create** › **Pages** tab ›
   **Connect to Git**.
3. Authorise Cloudflare to read GitHub. When it asks which repositories, choose
   **Only select repositories** and pick `premier-growth-dashboard`.
   It does not need access to anything else.
4. Select the repo, then **Begin setup**.
5. Build settings — leave everything empty:

   | Field | Value |
   |---|---|
   | Framework preset | None |
   | Build command | *(leave blank)* |
   | Build output directory | `/` |

   There is no build step. The repo is served exactly as it is.
6. **Save and Deploy.** After about a minute you get a URL like
   `premier-growth-dashboard.pages.dev`.
7. Open it, enter the new passcode, confirm the numbers load.
8. Only then retire https://premier-dashboard.tiiny.site/ — and tell the team the
   new address, or point a Premier subdomain at it.

### Optional — put a real login in front

Cloudflare **Zero Trust › Access** can require a Google or email login before the
page will even open, on top of the passcode. Worth doing if the dashboard should
not be readable by anyone who happens to have the link. Ask and I will write the
steps out.

---

## Where things stand

| | Status |
|---|---|
| Passcode out of the dashboard file | done, v1.8 |
| Week dates aligned to Mondays | done |
| Repo is the single source of truth | done |
| Passcode actually changed | **needs you — job 1 above** |
| Site publishes itself | **needs you — job 2 above** |
| Real numbers flowing in | not started |
