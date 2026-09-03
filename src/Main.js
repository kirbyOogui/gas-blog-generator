/**
 * スプレッドシートのメニューから実行するメイン処理。
 * 未処理行（ステータス空欄）のキーワードを順に処理し、
 * Claudeで記事を生成 → WordPressに下書き保存 → ステータス更新、まで行う。
 */
function generateArticles() {
  const sheet = getTargetSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow <= HEADER_ROW) return;

  const range = sheet.getRange(HEADER_ROW + 1, 1, lastRow - HEADER_ROW, Object.keys(COL).length);
  const values = range.getValues();

  values.forEach((row, i) => {
    const rowIndex = HEADER_ROW + 1 + i;
    const keyword = row[COL.KEYWORD - 1];
    const subKeyword = row[COL.SUB_KEYWORD - 1];
    const status = row[COL.STATUS - 1];

    if (!keyword || status === STATUS.POSTED || status === STATUS.PROCESSING) return;

    updateRowStatus_(sheet, rowIndex, STATUS.PROCESSING);

    try {
      const article = callClaude_(buildPrompt_(keyword, subKeyword));
      const posted = createDraftPost_(article);
      updateRowStatus_(sheet, rowIndex, STATUS.POSTED, {
        title: article.title,
        wpUrl: posted.editLink
      });
    } catch (e) {
      updateRowStatus_(sheet, rowIndex, STATUS.ERROR, { wpUrl: e.message });
    }
  });
}
