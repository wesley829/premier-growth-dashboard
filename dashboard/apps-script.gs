/**
 * Premier Growth Dashboard — storage
 *
 * Paste this into the Apps Script editor of a new Google Sheet, set the
 * PASSCODE below, then deploy it as a web app with access set to "Anyone".
 * Copy the deployment URL into the Cloud panel of the dashboard.
 *
 * Three tabs are written automatically:
 *   Store    the raw data the dashboard reads back. Do not edit by hand.
 *   Weeks    one row per week, every field in columns. This is the one to pivot.
 *   Log      who saved what and when.
 */

var PASSCODE = 'CHANGE-ME';   // must match the passcode entered in the dashboard

// Leave blank if you opened this editor from the Sheet itself
// (Extensions > Apps Script). If you created the project separately at
// script.google.com, paste the Sheet's id here. It is the long code in the
// Sheet's address between /d/ and /edit.
var SHEET_ID = '';

var STORE = 'Store', WEEKS = 'Weeks', TARGETS = 'Targets', LOG = 'Log';
var CHUNK = 40000;            // characters per cell, well under the 50k cell limit

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.pass !== PASSCODE) return out_({ ok: false, error: 'passcode' });
  return out_(load_());
}

function doPost(e) {
  var body;
  try { body = JSON.parse(e.postData.contents); }
  catch (err) { return out_({ ok: false, error: 'unreadable request' }); }

  if (body.pass !== PASSCODE) return out_({ ok: false, error: 'passcode' });
  if (body.action === 'load') return out_(load_());
  if (body.action === 'save') return out_(save_(body.data, body.who, body.rev));
  return out_({ ok: false, error: 'unknown action' });
}

/* ---------------------------------------------------------------- read */

function load_() {
  var sh = tab_(STORE);
  var rev = Number(sh.getRange('B1').getValue() || 0);
  var updated = String(sh.getRange('B2').getValue() || '');
  var n = Number(sh.getRange('B3').getValue() || 0);
  if (!n) return { ok: true, rev: rev, updated: updated, data: null };

  var parts = sh.getRange(5, 1, n, 1).getValues();
  var raw = '';
  for (var i = 0; i < parts.length; i++) raw += parts[i][0];
  try { return { ok: true, rev: rev, updated: updated, data: JSON.parse(raw) }; }
  catch (err) { return { ok: false, error: 'stored data could not be read' }; }
}

/* --------------------------------------------------------------- write */

function save_(data, who, rev) {
  if (!data || !data.weeks) return { ok: false, error: 'nothing to save' };

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return { ok: false, error: 'busy, try again' };

  try {
    var sh = tab_(STORE);
    var current = Number(sh.getRange('B1').getValue() || 0);

    // Somebody else saved since this browser last read. Send theirs back so
    // the dashboard can merge and try again, rather than overwriting them.
    if (rev !== undefined && rev !== null && Number(rev) !== current) {
      var theirs = load_();
      theirs.conflict = true;
      return theirs;
    }

    var raw = JSON.stringify(data);
    var chunks = [];
    for (var i = 0; i < raw.length; i += CHUNK) chunks.push([raw.substr(i, CHUNK)]);

    sh.clear();
    sh.getRange('A1').setValue('revision');       sh.getRange('B1').setValue(current + 1);
    sh.getRange('A2').setValue('last saved');     sh.getRange('B2').setValue(new Date().toISOString());
    sh.getRange('A3').setValue('chunks');         sh.getRange('B3').setValue(chunks.length);
    sh.getRange('A4').setValue('data below — do not edit by hand');
    if (chunks.length) sh.getRange(5, 1, chunks.length, 1).setValues(chunks);

    writeWeeks_(data);
    writeTargets_(data);
    logLine_(who, raw.length, current + 1);

    return { ok: true, rev: current + 1, updated: new Date().toISOString() };
  } finally {
    lock.releaseLock();
  }
}

/* --------------------------------------------------- readable tabs */

function writeWeeks_(data) {
  // Columns are taken from the data itself, so new fields added to the
  // dashboard appear here without this script needing to be edited again.
  var first = ['date'], last = ['note'], seen = {}, keys = [];
  var weeks0 = data.weeks || [];
  for (var a = 0; a < weeks0.length; a++) {
    for (var k in weeks0[a]) {
      if (first.indexOf(k) > -1 || last.indexOf(k) > -1 || seen[k]) continue;
      seen[k] = true; keys.push(k);
    }
  }
  keys = first.concat(keys, last);

  var rows = [keys];
  var weeks = (data.weeks || []).slice().sort(function (a, b) {
    return String(a.date).localeCompare(String(b.date));
  });
  for (var i = 0; i < weeks.length; i++) {
    var r = [];
    for (var k = 0; k < keys.length; k++) {
      var v = weeks[i][keys[k]];
      r.push(v === undefined || v === null ? '' : v);
    }
    rows.push(r);
  }

  var sh = tab_(WEEKS);
  sh.clear();
  sh.getRange(1, 1, rows.length, keys.length).setValues(rows);
  sh.getRange(1, 1, 1, keys.length).setFontWeight('bold');
  sh.setFrozenRows(1);
}

function writeTargets_(data) {
  var rows = [['measure', 'target', 'owner', 'action', 'data confidence']];
  var t = data.targets || {}, o = data.owners || {}, a = data.actions || {}, g = data.rag || {};
  var keys = Object.keys(t);
  for (var i = 0; i < keys.length; i++) {
    rows.push([keys[i], t[keys[i]], o[keys[i]] || '', a[keys[i]] || '', g[keys[i]] || '']);
  }
  var sh = tab_(TARGETS);
  sh.clear();
  sh.getRange(1, 1, rows.length, 5).setValues(rows);
  sh.getRange(1, 1, 1, 5).setFontWeight('bold');
  sh.setFrozenRows(1);
}

function logLine_(who, size, rev) {
  var sh = tab_(LOG);
  if (sh.getLastRow() === 0) {
    sh.appendRow(['saved at', 'who', 'revision', 'size']);
    sh.getRange(1, 1, 1, 4).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  sh.appendRow([new Date(), who || 'not named', rev, size]);
}

/* -------------------------------------------------------------- helpers */

function tab_(name) {
  var ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('No spreadsheet found. Either open this editor from the Sheet ' +
                           'via Extensions > Apps Script, or set SHEET_ID at the top.');
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

/**
 * Run this once from the editor to check the Sheet connection before
 * deploying. Choose "check" in the function list and press Run.
 */
function check() {
  var sh = tab_(STORE);
  Logger.log('Connected to: ' + sh.getParent().getName());
  return 'ok';
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
