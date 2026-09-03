<?php
/**
 * Google Apps Scriptからの記事下書き登録を中継するスクリプト。
 * wp-json（REST API）へのGoogle Apps ScriptからのアクセスがXSERVER側でブロックされているため、
 * サーバー内部でWordPressに直接投稿する迂回路として設置している。
 * このファイルは wp-load.php と同じ階層（WordPressのインストールルート）に置くこと。
 */

// シークレットは relay-config.php（gitignore対象）に定義する。
// 初回セットアップ時は relay-config.example.php をコピーして relay-config.php を作り、値を設定すること。
require_once __DIR__ . '/relay-config.php';

require_once __DIR__ . '/wp-load.php';

header('Content-Type: application/json; charset=utf-8');

$providedSecret = $_SERVER['HTTP_X_RELAY_SECRET'] ?? '';
if (!hash_equals(GAS_RELAY_SECRET, $providedSecret)) {
    http_response_code(401);
    echo json_encode(['error' => 'unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || empty($data['title']) || empty($data['content'])) {
    http_response_code(400);
    echo json_encode(['error' => 'invalid payload']);
    exit;
}

$postId = wp_insert_post([
    'post_title'   => $data['title'],
    'post_content' => $data['content'],
    'post_excerpt' => $data['excerpt'] ?? '',
    'post_status'  => 'draft',
    'post_type'    => 'post',
], true);

if (is_wp_error($postId)) {
    http_response_code(500);
    echo json_encode(['error' => $postId->get_error_message()]);
    exit;
}

echo json_encode([
    'id' => $postId,
    'editLink' => admin_url('post.php?post=' . $postId . '&action=edit'),
]);
