<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/database.php';

if (!isset($_SESSION['num_emp'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

try {

    // 🔹 Parámetros
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $sort = $_GET['sort'] ?? 'id';
    $order = strtoupper($_GET['order'] ?? 'DESC');
    $tipo = $_GET['tipo'] ?? '';
    $estado = $_GET['estado'] ?? '';
    $search = $_GET['search'] ?? '';

    $offset = ($page - 1) * $limit;

    // 🔹 Columnas permitidas para ordenar (seguridad)
    $allowedSort = ['id','identificador','tipo','marca','modelo','estado'];
    if (!in_array($sort, $allowedSort)) {
        $sort = 'id';
    }

    if (!in_array($order, ['ASC','DESC'])) {
        $order = 'DESC';
    }

    // 🔹 Filtros dinámicos
    $where = [];
    $params = [];

    if ($tipo) {
        $where[] = "e.tipo = :tipo";
        $params[':tipo'] = $tipo;
    }

    if ($estado) {
        $where[] = "e.estado = :estado";
        $params[':estado'] = $estado;
    }

    if ($search) {
        $where[] = "(
            e.identificador LIKE :search
            OR e.tipo LIKE :search
            OR e.marca LIKE :search
            OR e.modelo LIKE :search
            OR e.estado LIKE :search
            OR CONCAT(emp.nombre,' ',emp.ap_pat,' ',emp.ap_mat) LIKE :search
        )";

        $params[':search'] = "%$search%";
    }

    $whereSQL = $where ? "WHERE " . implode(" AND ", $where) : "";

    // 🔹 Total registros
    $stmtTotal = $pdo->prepare("
        SELECT COUNT(*) 
        FROM inventario_equipos e
        LEFT JOIN inventario_asignaciones a 
            ON e.id = a.equipo_id 
            AND a.estado = 'activo'
        LEFT JOIN empleados emp
            ON emp.clave_emp = a.num_emp
        $whereSQL
    ");
    $stmtTotal->execute($params);
    $total = $stmtTotal->fetchColumn();

    // 🔹 Datos paginados
    $stmt = $pdo->prepare("
        SELECT 
            e.id,
            e.identificador,
            e.tipo,
            e.marca,
            e.modelo,
            e.estado,
            CONCAT(emp.nombre, ' ', emp.ap_pat, ' ', emp.ap_mat) AS empleado_nombre,
            e.token_publico
        FROM inventario_equipos e
        LEFT JOIN inventario_asignaciones a 
            ON e.id = a.equipo_id 
            AND a.estado = 'activo'
        LEFT JOIN empleados emp
            ON emp.clave_emp = a.num_emp
        $whereSQL
        ORDER BY e.$sort $order
        LIMIT :limit OFFSET :offset
    ");

    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }

    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

    $stmt->execute();
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "data" => $data,
        "total" => (int)$total,
        "page" => $page,
        "totalPages" => ceil($total / $limit)
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error al obtener equipos',
        'detalle' => $e->getMessage()
    ]);
}