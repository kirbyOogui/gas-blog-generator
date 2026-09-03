function buildPrompt_(keyword, subKeyword) {
  const subKeywordSection = subKeyword
    ? `\n# サブキーワード\n${subKeyword}（本文中に自然な形で含めること）\n`
    : '';

  return `あなたはBtoB SaaS企業のオウンドメディアを担当するライターです。
以下の条件でブログ記事を作成してください。

# キーワード
${keyword}
${subKeywordSection}
# ターゲット読者
中小企業の経営者・IT担当者

# 記事構成
タイトル → 導入 → H2見出し×3 → まとめ

# 文字数
本文全体で2,000〜3,000文字程度

# トーン&マナー
カジュアルだが専門的。読者に語りかける言い回しと、具体的な数字や事例を交えた実務目線を意識する。
「〜ではないでしょうか」のような曖昧な言い回しは避け、断定と問いかけを織り交ぜる。

# 厳守事項
- 既存記事やWeb上の文章の丸写しは絶対にせず、オリジナルの表現で書くこと
- 本文はHTMLタグ（<p>, <h2> など）を使って構成すること
- 出力は下記のJSON形式のみとし、説明文やコードブロック記法（\`\`\`）は一切含めないこと

{"title": "記事タイトル", "metaDescription": "120文字程度のメタディスクリプション", "content": "<p>導入文</p><h2>見出し1</h2><p>...</p><h2>見出し2</h2><p>...</p><h2>見出し3</h2><p>...</p><h2>まとめ</h2><p>...</p>"}`;
}

function callClaude_(prompt) {
  const response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    headers: {
      'x-api-key': getClaudeApiKey_(),
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    payload: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    }),
    muteHttpExceptions: true
  });

  const statusCode = response.getResponseCode();
  const rawText = response.getContentText();
  let body;
  try {
    body = JSON.parse(rawText);
  } catch (e) {
    throw new Error(`Claude APIエラー (${statusCode}): JSON以外の応答が返ってきました。先頭200文字: ${rawText.slice(0, 200)}`);
  }
  if (statusCode !== 200) {
    throw new Error(`Claude APIエラー (${statusCode}): ${body.error ? body.error.message : rawText}`);
  }

  const textBlock = (body.content || []).find(function (block) { return block.type === 'text'; });
  if (!textBlock) {
    throw new Error('Claude APIのレスポンスにtextブロックが含まれていません: ' + response.getContentText());
  }

  return parseArticleJson_(textBlock.text);
}

function parseArticleJson_(text) {
  const cleaned = text.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
  const parsed = JSON.parse(cleaned);
  if (!parsed.title || !parsed.content) {
    throw new Error('Claudeの出力からtitle/contentを取得できませんでした。');
  }
  return parsed;
}
