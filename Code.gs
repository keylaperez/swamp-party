/**
 * Swamp party backend — paste this into Google Apps Script (Extensions → Apps Script)
 * from inside the Google Sheet that will hold your RSVPs.
 *
 * The real address lives ONLY in the Apps Script editor, never in your GitHub repo.
 * Keep the placeholder below in the copy you commit, and type the real address
 * only in the Apps Script editor.
 */

const PARTY_ADDRESS = "PASTE THE ADDRESS IN THE APPS SCRIPT EDITOR ONLY";

const RSVP_SHEET = "RSVPs";
const COSTUME_SHEET = "Costumes";

function getSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function clean_(v, max) {
  return String(v == null ? "" : v).replace(/[\r\n\t]+/g, " ").trim().slice(0, max || 100);
}

// Stops spreadsheet formula injection (values starting with = + - @)
function safe_(v) {
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

/** GET ?action=costumes → { costumes: [{name, costume}] } */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "";
  if (action === "costumes") {
    const sh = getSheet_(COSTUME_SHEET, ["Updated", "Name", "Costume", "NameKey"]);
    const rows = sh.getLastRow() > 1
      ? sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues()
      : [];
    const costumes = rows
      .filter(r => r[2])
      .map(r => ({ name: String(r[1]), costume: String(r[2]) }));
    return json_({ costumes: costumes });
  }
  return json_({ ok: true });
}

/** POST { type: "rsvp" | "costume", ... } */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents || "{}");

    if (data.type === "costume") {
      const name = clean_(data.name, 60);
      const costume = clean_(data.costume, 60);
      if (!name || !costume) return json_({ ok: false, error: "missing fields" });

      const sh = getSheet_(COSTUME_SHEET, ["Updated", "Name", "Costume", "NameKey"]);
      const key = name.toLowerCase();
      const last = sh.getLastRow();
      if (last > 1) {
        // Same name submitting again → update their costume instead of adding a new one
        const keys = sh.getRange(2, 4, last - 1, 1).getValues();
        for (let i = 0; i < keys.length; i++) {
          if (String(keys[i][0]) === key) {
            sh.getRange(i + 2, 1, 1, 4).setValues([[new Date(), safe_(name), safe_(costume), key]]);
            return json_({ ok: true, updated: true });
          }
        }
      }
      sh.appendRow([new Date(), safe_(name), safe_(costume), key]);
      return json_({ ok: true });
    }

    if (data.type === "rsvp") {
      const names = (Array.isArray(data.names) ? data.names : [])
        .map(n => clean_(n, 60)).filter(Boolean).slice(0, 15);
      if (!names.length) return json_({ ok: false, error: "no names" });
      const attending = data.attending === "yes" ? "yes" : "no";

      const sh = getSheet_(RSVP_SHEET,
        ["Submitted", "Attending", "Headcount", "Names", "Potion", "Note"]);
      sh.appendRow([
        new Date(),
        attending,
        attending === "yes" ? names.length : 0,
        safe_(names.join(", ")),
        safe_(clean_(data.potion, 80)),
        safe_(clean_(data.note, 300))
      ]);
      return json_({ ok: true, address: attending === "yes" ? PARTY_ADDRESS : null });
    }

    return json_({ ok: false, error: "unknown type" });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}
