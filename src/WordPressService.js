/**
 * WordPressに下書き投稿を作成する。
 * wp-json（REST API）へのGoogle Apps ScriptからのアクセスがXSERVER側でブロックされているため、
 * 直接REST APIを叩くのではなく、同じサーバー上に置いた中継スクリプト（wp-relay/gas-relay.php）経由で投稿する。
 * メタディスクリプションはexcerptに格納している。
 * Yoast SEO / RankMath 等のSEOプラグインを使う場合は、
 * 各プラグインが公開しているフィールド（例: meta._yoast_wpseo_metadesc）に
 * 差し替えること（プラグインの有無・種類は要確認）。
 */
function createDraftPost_(article) {
  const response = UrlFetchApp.fetch(`${getWpBaseUrl_()}/gas-relay.php`, {
    method: 'post',
    headers: {
      'X-Relay-Secret': getWpRelaySecret_(),
      'content-type': 'application/json'
    },
    payload: JSON.stringify({
      title: article.title,
      content: article.content,
      excerpt: article.metaDescription
    }),
    muteHttpExceptions: true
  });

  const statusCode = response.getResponseCode();
  const rawText = response.getContentText();
  let body;
  try {
    body = JSON.parse(rawText);
  } catch (e) {
    throw new Error(`WordPress中継エラー (${statusCode}): JSON以外の応答が返ってきました。先頭200文字: ${rawText.slice(0, 200)}`);
  }
  if (statusCode !== 200) {
    throw new Error(`WordPress中継エラー (${statusCode}): ${body.error || rawText}`);
  }

  return {
    postId: body.id,
    editLink: body.editLink
  };
}
