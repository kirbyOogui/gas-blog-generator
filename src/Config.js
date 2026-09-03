/**
 * スクリプトプロパティから設定値を取得する。
 * 値はコードに書かず、Apps Scriptエディタの
 * 「プロジェクトの設定」>「スクリプト プロパティ」から設定すること。
 *
 * 必要なキー:
 *   CLAUDE_API_KEY   - Claude APIキー
 *   WP_BASE_URL      - WordPressサイトのURL（例: https://example-saas.co.jp）
 *   WP_RELAY_SECRET  - wp-relay/gas-relay.php に設定したものと同じシークレット
 */
function getScriptProperty_(key) {
  const value = PropertiesService.getScriptProperties().getProperty(key);
  if (!value) {
    throw new Error(
      `スクリプトプロパティ "${key}" が未設定です。` +
      'Apps Scriptエディタの「プロジェクトの設定」>「スクリプト プロパティ」から設定してください。'
    );
  }
  return value;
}

function getClaudeApiKey_() {
  return getScriptProperty_('CLAUDE_API_KEY');
}

function getWpBaseUrl_() {
  return getScriptProperty_('WP_BASE_URL').replace(/\/$/, '');
}

function getWpRelaySecret_() {
  return getScriptProperty_('WP_RELAY_SECRET');
}
