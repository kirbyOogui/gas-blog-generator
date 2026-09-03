function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('記事自動生成')
    .addItem('記事を生成', 'generateArticles')
    .addToUi();
}
