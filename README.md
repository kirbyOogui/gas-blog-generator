# GAS + AI ブログ記事自動生成

スプレッドシートにキーワードを入力し、メニューから実行するとClaude APIで記事を生成し、WordPressに下書き保存する。

**注記**: 当初はWordPress REST API（wp-json）に直接投稿する設計だったが、利用中のXSERVER環境でGoogle Apps ScriptからのアクセスがREST API（wp-json）に対してのみブロックされる問題が判明した（WAF設定・国外アクセス制限をオフにしても解消せず）。そのため`wp-relay/gas-relay.php`という中継スクリプトを同じサーバー上に置き、GASはそこにPOSTし、サーバー内部からWordPressへ投稿する方式に変更している。

## セットアップ

### 1. Google Apps Scriptプロジェクトの用意

既存のスプレッドシートに紐づくスクリプトを使う場合は、そのスクリプトIDを `.clasp.json` の `scriptId` に設定する。

新規に作る場合:

```
clasp login
clasp create --type sheets --title "ブログ記事自動生成" --rootDir ./src
```

作成後、生成された `scriptId` を `.clasp.json` に反映する。

### 2. コードをプッシュ

```
clasp push
```

### 3. スクリプトプロパティの設定

Apps Scriptエディタ（`clasp open` で開ける）の「プロジェクトの設定」>「スクリプト プロパティ」で以下を設定する。**値はコードに書かず、必ずここで設定すること。**

| キー | 内容 |
|---|---|
| `CLAUDE_API_KEY` | Claude APIキー |
| `WP_BASE_URL` | WordPressサイトのURL（例: `https://example-saas.co.jp`） |
| `WP_RELAY_SECRET` | `wp-relay/gas-relay.php` の `GAS_RELAY_SECRET` と同じ値 |

### 4. 中継スクリプトの設置

1. `wp-relay/relay-config.example.php` をコピーして `wp-relay/relay-config.php` を作り、`GAS_RELAY_SECRET`にランダムな文字列を設定する（`relay-config.php`は`.gitignore`対象なのでリポジトリには含まれない）。
2. `wp-relay/gas-relay.php` と `wp-relay/relay-config.php` を、WordPressのインストールルート（`wp-load.php`と同じ階層）にアップロードする（XSERVERのファイルマネージャーやFTPで配置）。
3. `relay-config.php`の`GAS_RELAY_SECRET`の値と、Script Propertiesの`WP_RELAY_SECRET`は必ず同じ文字列にすること。

### 5. スプレッドシートの準備

`記事生成` という名前のシートを用意し、1行目をヘッダーとして以下の列を作る（シートが見つからない場合はアクティブなシートを使う）。

| 列 | 内容 |
|---|---|
| A | キーワード |
| B | サブキーワード（任意。あれば本文に自然な形で含める） |
| C | ステータス（空欄 / 生成中 / 投稿済み / エラー） |
| D | タイトル（生成後に自動入力） |
| E | WordPress URL（生成後に自動入力。下書きのため編集画面URL。エラー時はエラー内容） |

### 6. 初回実行と権限承認

スプレッドシートを開き直すとメニューに「記事自動生成」が追加される。「記事を生成」を初めて実行する際、スプレッドシートへのアクセスと外部リクエスト（Claude API・中継スクリプト向け）の権限承認が求められるので許可する。

## 使い方

1. スプレッドシートのA列にキーワード、必要ならB列にサブキーワードを入力する（C列は空欄のまま）
2. メニュー「記事自動生成」>「記事を生成」を実行する
3. 未処理行（ステータス空欄）を順番に処理し、Claudeで記事生成→WordPressへ下書き保存→ステータス更新まで自動で行う
4. 投稿済みになったらD〜E列に結果が入る。E列のWordPress URLから管理画面で内容を確認し、人がリライトしてから公開する

## スコープ外・要確認事項

- **画像挿入は自動化していない**（クライアント側で手動設定する前提）
- **自動公開はしない**（下書き保存まで。公開判断は人）
- **コピペチェックは自動組み込みではない**。プロンプト内で「オリジナルの表現で書くこと」を指示しているのみで、公開前の手動確認（CopyContentDetector等）を別途推奨する運用。クライアントが自動チェックまで期待している場合は認識合わせが必要
- **メタディスクリプションはWordPressの`excerpt`に格納**している。Yoast SEOやRankMathを使っている場合は、そのプラグイン用のメタフィールドに差し替える必要がある（使用プラグインは未確認）
