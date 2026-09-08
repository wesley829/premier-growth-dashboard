# Premier Solutions — Growth Dashboard

Weekly growth dashboard for Premier Solutions. One self-contained HTML file,
no build step. Data lives in a Google Sheet behind an Apps Script web app;
the page reads and writes it every few seconds.

```
index.html        the dashboard — this file IS the site, and is the master copy
apps-script.gs    the Sheet-side storage script
premier.py        read/write the store from the terminal
backups/          timestamped snapshots of the store
```

Pushing to `main` republishes the site. There is no build step and no upload:
whatever `index.html` contains is what the team sees on their next refresh.

## How the pieces fit

    dashboard (static HTML)  ──POST load|save──▶  Apps Script /exec  ──▶  Google Sheet
                                                                          Store  raw JSON
                                                                          Weeks  one row per week
                                                                          Targets
                                                                          Log    who saved what

Saves are optimistic-locked on a revision number. If someone else saved since you
last read, the script hands their version back instead of overwriting them, and the
dashboard merges and retries.

## The data model

Weeks are keyed by the Monday of that week. Thirty-two raw inputs are typed in
(`SKEYS` in the HTML); everything else — margins, conversion rates, cost per lead,
EBITDA — is derived in `D(w)` and never stored. Add a field to `SKEYS` and it flows
through to the Sheet automatically; the Apps Script takes its columns from the data.

Six systems, each with an owner:

| | System | Owner |
|---|---|---|
| 01 | Lead generation | Jon |
| 02 | Conversion | Brittany |
| 03 | Delivery | Courtney |
| 04 | Retention & reactivation | Courtney / Brittany |
| 05 | Financial performance | Aman |
| 06 | Management & improvement | Courtney + Glow |

## Working with the data

Credentials are not in this repo. Copy `config.example.json` to `config.local.json`
and fill it in, or set `PREMIER_URL` / `PREMIER_PASS`.

```bash
./premier.py weeks                       # what is in the shared copy now
./premier.py backup                      # snapshot it to backups/
./premier.py set current leads=34 revWeight=8200
./premier.py push                        # send it, rev-locked
```

Changes stage locally in `.staged.json` and reach the team's copy only on `push`.

## Deploying

Served by GitHub Pages straight from `main`. Push and it is live.

The passcode is **not** in this repo or in `index.html`. Each person enters it once
on their own browser and it is remembered there. If it ever needs changing, edit
`PASSCODE` in `apps-script.gs`, redeploy the Apps Script, and tell the team the new one.

The old hand-uploaded copy at https://premier-dashboard.tiiny.site/ can be retired
once the Pages URL is confirmed working.
