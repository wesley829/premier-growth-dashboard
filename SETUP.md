# Setup

Nothing here needs a person any more. This file records how things are set up and why.

---

## 1. URGENT — two things only you can do  (10 minutes total)

On 15 Sept an old copy of the dashboard overwrote the team's 14 Sept numbers and
brought back three deleted weeks. The old copy is **premier-dashboard.tiiny.site**,
still live at v1.6. Every click on it pushes its stale data over everyone else's.
I restored the data from backup, but it can happen again until both steps are done.

### a) Take the tiiny.site copy down
Log in at https://tiiny.host and delete the `premier-dashboard` site. Then tell
Jon, Brittany, Courtney and Aman: the only address is
**https://wesley829.github.io/premier-growth-dashboard/** — bookmark it, and
close any old tab.

### b) Update the Sheet script so old pages cannot write
1. Open the Premier dashboard Sheet from Google Drive
   (the one with Store / Weeks / Targets / Log tabs).
2. Menu **Extensions › Apps Script**.
3. Select everything in the editor and replace it with the contents of
   `apps-script.gs` from this repo. Then put your real passcode back on line 14:
   `var PASSCODE = 'Premier123';`
4. **Ctrl/Cmd + S** to save.
5. **Deploy › Manage deployments › pencil › Version: New version › Deploy.**
   Saving alone changes nothing — the redeploy is the step.
6. Check the **Log** tab over the next day: any line saying *REFUSED, old page*
   is someone still on the old copy. Tell them to use the address above.

After (b), old pages can still read but every save from them is refused, so
this class of damage cannot recur even if someone finds an old link.

---

## Passcode — none, by design

Wesley's call: nothing to hide, so the page loads for anyone with the link.
Anyone with the link can also change the numbers. The Apps Script `PASSCODE`
must stay as it is or the page breaks.

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
| Deleted weeks stay deleted | v1.9 |
| Notes and numbers can no longer be clobbered by a stale tab | v2.0 |
| Revenue from marketing + Marketing ROI (Jon) | v2.0 |
| Old pages refused on save (needs script redeploy) | v2.1 — **job 1b above** |
| tiiny.site copy taken down | **job 1a above** |
| Site publishes itself | done — GitHub Pages |
| Weekly numbers | entered by hand on the **Enter the week** tab — by design, no platform connections |
