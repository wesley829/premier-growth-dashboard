#!/usr/bin/env python3
"""Premier Growth Dashboard — read/write the shared Apps Script store.

  ./premier.py pull                       print the whole store as JSON
  ./premier.py weeks                      one line per week, filled fields only
  ./premier.py backup                     save a timestamped copy to backups/
  ./premier.py set WEEK k=v [k=v ...]     stage a change to one week
  ./premier.py set-target k=v [...]       stage a change to targets
  ./premier.py delete WEEK                 stage removal of a whole week
  ./premier.py push                       send staged changes (asks first)

WEEK is a Monday in YYYY-MM-DD, or "current" for this week's Monday.
Staged changes live in .staged.json until pushed, so nothing reaches the
team's copy until push runs.
"""
import json, os, subprocess, sys, datetime

HERE = os.path.dirname(os.path.abspath(__file__))

def _cfg():
    """Credentials come from config.local.json (gitignored) or the
    PREMIER_URL / PREMIER_PASS / PREMIER_WHO environment variables.
    Nothing secret is stored in this file."""
    c = {}
    path = os.path.join(HERE, "config.local.json")
    if os.path.exists(path):
        c = json.load(open(path))
    url  = os.environ.get("PREMIER_URL",  c.get("url", ""))
    pw   = os.environ.get("PREMIER_PASS", c.get("pass", ""))
    who  = os.environ.get("PREMIER_WHO",  c.get("who", "not named"))
    if not url or not pw:
        sys.exit("No credentials. Copy config.example.json to config.local.json "
                 "and fill it in, or set PREMIER_URL and PREMIER_PASS.")
    return url, pw, who

URL, PASS, WHO = _cfg()
STAGE = os.path.join(HERE, ".staged.json")

SKEYS = ["leads","qualifiedLeads","marketingSpend","contacted","booked","cancelled","noShow",
 "attended","purchased","newPatients","returningPatients","reactivatedPatients","slotsAvailable",
 "slotsUsed","rebooked","revWeight","revHRT","revAes","revWellness","cogs","providerCost","opex",
 "actionsAgreed","actionsCompleted","experimentsRun","programmePatients","programmeStarts",
 "draftStarts","programmeCancelled","draftScheduled","draftCollected","draftFailed"]

def call(body):
    # curl must NOT force -X POST: Apps Script 302s to a GET-only result URL.
    r = subprocess.run(["curl","-sL",URL,"-H","Content-Type: text/plain",
                        "-d",json.dumps(dict(body, **{"pass":PASS}))],
                       capture_output=True, text=True, timeout=90)
    try: return json.loads(r.stdout)
    except Exception: sys.exit("Unreadable reply:\n" + r.stdout[:400])

def pull():
    j = call({"action":"load"})
    if not j.get("ok"): sys.exit("Load failed: " + str(j.get("error")))
    return j

def monday(s):
    if s in ("current","today","this"):
        d = datetime.date.today()
        return (d - datetime.timedelta(days=d.weekday())).isoformat()
    return s

def staged():
    if os.path.exists(STAGE):
        return json.load(open(STAGE))
    j = pull()
    st = {"rev": j["rev"], "data": j["data"], "changes": []}
    json.dump(st, open(STAGE,"w"), indent=1)
    return st

def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else "pull"
    args = sys.argv[2:]

    if cmd == "pull":
        print(json.dumps(pull(), indent=1))

    elif cmd == "weeks":
        j = pull(); print(f"rev {j['rev']}  updated {j['updated']}")
        for w in sorted(j["data"].get("weeks",[]), key=lambda x: str(x.get("date"))):
            f = {k:v for k,v in w.items() if v not in ("",None) and k != "date"}
            print(f"  {w.get('date')}  {len(f):2d} fields  {json.dumps(f)}")

    elif cmd == "backup":
        j = pull()
        d = os.path.join(os.path.dirname(HERE), "premier-dashboard-backups")  # outside the repo
        os.makedirs(d, exist_ok=True)
        p = os.path.join(d, f"store-rev{j['rev']}-{datetime.date.today().isoformat()}.json")
        json.dump(j, open(p,"w"), indent=1); print("saved", p)

    elif cmd in ("set","set-target"):
        st = staged()
        if cmd == "set":
            if not args: sys.exit("usage: set WEEK k=v ...")
            date = monday(args[0]); pairs = args[1:]
            weeks = st["data"].setdefault("weeks",[])
            w = next((x for x in weeks if x.get("date")==date), None)
            if w is None:
                w = {"date":date}; w.update({k:"" for k in SKEYS}); weeks.append(w)
                weeks.sort(key=lambda x: str(x.get("date")))
                print(f"new week {date}")
            for p in pairs:
                k,_,v = p.partition("=")
                if k not in SKEYS and k != "note": sys.exit(f"unknown field: {k}")
                w[k] = v; st["changes"].append(f"{date} {k}={v}")
                print(f"  staged {date} {k} = {v}")
        else:
            t = st["data"].setdefault("targets",{})
            for p in args:
                k,_,v = p.partition("="); t[k]=v
                st["changes"].append(f"target {k}={v}"); print(f"  staged target {k} = {v}")
        json.dump(st, open(STAGE,"w"), indent=1)
        print(f"\n{len(st['changes'])} change(s) staged. Run: ./premier.py push")

    elif cmd == "push":
        if not os.path.exists(STAGE): sys.exit("nothing staged")
        st = json.load(open(STAGE))
        print("About to write to the team's shared copy:")
        for c in st["changes"]: print("  •", c)
        j = call({"action":"save","data":st["data"],"who":WHO,"rev":st["rev"]})
        if j.get("conflict"):
            os.remove(STAGE)
            sys.exit("Somebody else saved first (rev moved). Staging cleared — re-stage on fresh data.")
        if not j.get("ok"): sys.exit("Save failed: " + str(j.get("error")))
        os.remove(STAGE)
        print(f"Saved. rev {st['rev']} -> {j['rev']} at {j['updated']}")

    elif cmd == "delete":
        if not args: sys.exit("usage: delete WEEK")
        st = staged(); date = monday(args[0])
        weeks = st["data"].setdefault("weeks",[])
        w = next((x for x in weeks if x.get("date")==date), None)
        if w is None: sys.exit(f"no week {date}")
        weeks.remove(w); st["changes"].append(f"delete week {date}")
        json.dump(st, open(STAGE,"w"), indent=1)
        print(f"  staged: remove {date}\n\nRun: ./premier.py push")

    elif cmd == "unstage":
        if os.path.exists(STAGE): os.remove(STAGE); print("staging cleared")

    else:
        print(__doc__)

main()
