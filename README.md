# Premier Solutions — Growth Dashboard

Weekly growth dashboard for Premier Solutions. One self-contained HTML file,
no build step. Data lives in a Google Sheet behind an Apps Script web app;
the page reads and writes it every few seconds.

```
index.html        the dashboard — this file IS the site, and is the master copy
apps-script.gs    the Sheet-side storage script
premier.py        read/write the store from the terminal
../premier-dashboard-backups/   timestamped store snapshots, kept outside the repo
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

Weeks are keyed by the Monday of that week. Thirty-three raw inputs are typed in
(`SKEYS` in the HTML); everything else — margins, conversion rates, cost per lead,
marketing ROI, EBITDA — is derived in `D(w)` and never stored. Add a field to `SKEYS` and it flows
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

Served by GitHub Pages straight from `main` at
https://wesley829.github.io/premier-growth-dashboard/ — push and it is live.

There is no passcode prompt: the page loads the shared numbers for anyone with the
link, by decision. See `SETUP.md` for what that implies.

## How sync works (v2.0)

The shared copy is the authority. A browser may overwrite only the exact fields it
has edited since its last successful push — tracked per field, remembered across
reloads — and adopts everything else from the team, including fields this version
of the page has never heard of. Opening the page writes nothing. Deleting a week
propagates. **Reload from team** resets one browser and cannot touch the Sheet.

This replaces an additive merge that concatenated notes on every pull and let a
stale tab push old numbers over someone's correction.

Remove a week from the terminal with `./premier.py delete 2026-09-28 && ./premier.py push`.

## Owner colours

The Enter the week tab colours each block by who fills it in — Jon blue, Brittany
sage, Courtney plum, Aman ochre (`OWN` in the HTML). A shared block gets a split
bar. Give a new group an `o:[...]` list and it picks up its colour automatically.

## Adding a field

Add the key to `SKEYS`, a label in `FIELDS`, a definition in `DEFS`, and if it is
a measure, a row in `M` and a line in `D(w)`. Nothing else: the Sheet takes its
columns from the data, and older copies of the page carry unknown fields through
untouched. Never test two copies of the page on the same origin — they share
browser storage, and an edit made on one will be pushed by the other.

The old hand-uploaded copy at https://premier-dashboard.tiiny.site/ can be retired
once the Pages URL is confirmed working.
