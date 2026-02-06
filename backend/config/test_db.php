<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/database.php';

echo json_encode([
  "db" => "OK",
  "pdo" => isset($pdo)
]);
