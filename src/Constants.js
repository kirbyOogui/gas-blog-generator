// スプレッドシートの列構成（1始まり）
const COL = {
  KEYWORD: 1,     // A: キーワード
  SUB_KEYWORD: 2, // B: サブキーワード
  STATUS: 3,      // C: ステータス
  TITLE: 4,       // D: タイトル
  WP_URL: 5       // E: WordPress URL（下書きのため編集画面URL。エラー時はエラー内容）
};

const STATUS = {
  PROCESSING: '生成中',
  POSTED: '投稿済み',
  ERROR: 'エラー'
};

const HEADER_ROW = 1;

// コストと文章品質のバランスで選定。月間本数が増える場合はHaiku系への切り替えも検討。
const CLAUDE_MODEL = 'claude-sonnet-5';
