/**
 * collector.gs — Google Apps Script web app that receives
 *   (1) survey answers from survey_bilingual.html  (type = survey_student | survey_lecturer)
 *   (2) anonymous usage logs from the demos         (type = log_summary)
 * and appends them to sheets of the spreadsheet this script is bound to.
 *
 * Deploy: Extensions ▸ Apps Script ▸ paste this file ▸ Deploy ▸ New deployment ▸ type "Web app"
 *         Execute as: Me · Who has access: Anyone ▸ copy the Web-App URL
 *         and paste it into ENDPOINT (survey) and LOG_ENDPOINT (demos).
 * No personal data is received: payloads contain only random IDs, answers and interaction counts.
 */
const ALLOWED = ['survey_student', 'survey_lecturer', 'log_summary'];
const MAX_BYTES = 200000;
const CLOSED = false;   // set true (and redeploy) once data collection has ended

function doPost(e) {
  try {
    if (CLOSED) return out_('rejected: collection closed');
    const raw = e && e.postData ? e.postData.contents : '';
    if (!raw || raw.length > MAX_BYTES) return out_('rejected: size');
    const msg = JSON.parse(raw);
    if (ALLOWED.indexOf(msg.type) < 0 || typeof msg.data !== 'object') return out_('rejected: type');
    const row = flatten_(msg.data);
    if (msg.type !== 'log_summary' && row.response_id && isDuplicate_(msg.type, row.response_id)) return out_('rejected: duplicate');
    append_(msg.type, row);
    return out_('ok');
  } catch (err) {
    return out_('error: ' + err);
  }
}

/** true if a row with this response_id already exists in the sheet */
function isDuplicate_(sheetName, id) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sh || sh.getLastRow() < 2) return false;
  const header = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0], col = header.indexOf('response_id');
  if (col < 0) return false;
  return sh.getRange(2, col + 1, sh.getLastRow() - 1, 1).getValues().some(r => String(r[0]) === String(id));
}

function doGet() { return out_('collector is running'); }

function append_(sheetName, row) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
    let header = sh.getLastRow() > 0 ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] : [];
    const keys = Object.keys(row);
    const missing = keys.filter(k => header.indexOf(k) < 0);
    if (header.length === 0) { header = ['received_at'].concat(keys); sh.appendRow(header); }
    else if (missing.length) { header = header.concat(missing); sh.getRange(1, 1, 1, header.length).setValues([header]); }
    row.received_at = new Date().toISOString();
    sh.appendRow(header.map(h => row[h] === undefined ? '' : row[h]));
  } finally { lock.releaseLock(); }
}

function flatten_(obj, prefix, res) {
  res = res || {}; prefix = prefix || '';
  Object.keys(obj).forEach(k => {
    const v = obj[k], key = prefix ? prefix + '.' + k : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) flatten_(v, key, res);
    else res[key] = Array.isArray(v) ? JSON.stringify(v) : v;
  });
  return res;
}

function out_(s) { return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.TEXT); }
