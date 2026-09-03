function getTargetSheet_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('記事生成')
    || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
}

function updateRowStatus_(sheet, rowIndex, status, extra) {
  sheet.getRange(rowIndex, COL.STATUS).setValue(status);
  if (extra) {
    if (extra.title) sheet.getRange(rowIndex, COL.TITLE).setValue(extra.title);
    if (extra.wpUrl) sheet.getRange(rowIndex, COL.WP_URL).setValue(extra.wpUrl);
  }
  SpreadsheetApp.flush();
}
