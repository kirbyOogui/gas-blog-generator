<?php
/**
 * relay-config.php のテンプレート。
 * このファイルをコピーして relay-config.php を作り、値を設定すること。
 * relay-config.php は .gitignore 対象なのでリポジトリには含まれない。
 *
 * GAS側の Script Properties の WP_RELAY_SECRET と、必ず同じ値にすること。
 * ランダムな文字列は例えば以下で生成できる：
 *   php -r "echo bin2hex(random_bytes(32));"
 */

define('GAS_RELAY_SECRET', 'ここに十分に長いランダムな文字列を設定する');
