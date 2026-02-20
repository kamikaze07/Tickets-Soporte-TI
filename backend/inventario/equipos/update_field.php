<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/database.php';

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? null;
$campo = $data['campo'] ?? null;
$valor = $data['valor'] ?? null;

$permitidos = ['marca', 'modelo'];

if (!$id || !in_array($campo, $permitidos)) {
    echo json_encode(['error'=>'Campo inválido']);
    exit;
}

$stmt = $pdo->prepare("UPDATE inventario_equipos SET $campo = :valor WHERE id = :id");
$stmt->execute([':valor'=>$valor, ':id'=>$id]);

echo json_encode(['success'=>true]);
