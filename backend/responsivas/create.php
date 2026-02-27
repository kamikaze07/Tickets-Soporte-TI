<?php
header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/../config/database.php';

if (!isset($_SESSION['num_emp'])) {
    http_response_code(401);
    echo json_encode(["ok" => false, "msg" => "No autorizado"]);
    exit;
}

$equipo_id = $_POST['equipo_id'];
$num_emp = $_POST['num_emp'];
$firma_usuario = $_POST['firma_usuario'];
$firma_admin = $_POST['firma_admin'];

/* =========================
   GENERAR FOLIO
========================= */
$year = date("Y");
$stmt = $pdo->prepare("
    SELECT MAX(folio) as ultimo
    FROM responsivas
    WHERE folio LIKE ?
");
$stmt->execute(["RESP-$year-%"]);
$ultimo = $stmt->fetchColumn();

if ($ultimo) {
    $numero = intval(substr($ultimo, -5)) + 1;
} else {
    $numero = 1;
}

$folio = "RESP-$year-" . str_pad($numero, 5, "0", STR_PAD_LEFT);

/* =========================
   OBTENER EQUIPO
========================= */
$stmt = $pdo->prepare("SELECT * FROM inventario_equipos WHERE id=?");
$stmt->execute([$equipo_id]);
$equipo = $stmt->fetch(PDO::FETCH_ASSOC);

$specs = json_decode($equipo['especificaciones_json'], true);

$snapshot_equipo = [
    "identificador" => $equipo['identificador'],
    "tipo" => $equipo['tipo'],
    "marca" => $equipo['marca'],
    "modelo" => $equipo['modelo'],
    "numero_serie" => $equipo['numero_serie'],
    "sistema_operativo" => $specs['sistema_operativo'] ?? '',
    "procesador" => $specs['procesador'] ?? '',
    "ram" => $specs['ram'] ?? '',
    "almacenamiento" => $specs['almacenamiento'] ?? ''
];

/* =========================
   OBTENER EMPLEADO
========================= */
$stmt = $pdo->prepare("
SELECT e.*, d.nombre as departamento
FROM empleados e
LEFT JOIN departamentos d ON e.clave_depa = d.clave_depa
WHERE e.clave_emp=?
");
$stmt->execute([$num_emp]);
$empleado = $stmt->fetch(PDO::FETCH_ASSOC);

$snapshot_empleado = [
    "nombre" => $empleado['nombre']." ".$empleado['ap_pat']." ".$empleado['ap_mat'],
    "num_emp" => $empleado['clave_emp'],
    "departamento" => $empleado['departamento']
];

/* =========================
   GUARDAR FIRMAS
========================= */
function guardarFirma($base64) {
    $data = explode(',', $base64);
    $image = base64_decode($data[1]);
    $name = uniqid() . ".png";
    $path = __DIR__ . "/../../uploads/responsivas/" . $name;
    file_put_contents($path, $image);
    return $name;
}

$firmaUsuarioFile = guardarFirma($firma_usuario);
$firmaAdminFile = guardarFirma($firma_admin);

/* =========================
   TOKEN PUBLICO
========================= */
$token = bin2hex(random_bytes(32));

/* =========================
   INSERTAR RESPONSIVA
========================= */
$stmt = $pdo->prepare("
INSERT INTO responsivas
(folio,equipo_id,num_emp,firma_usuario,firma_admin,
snapshot_equipo,snapshot_empleado,
fecha_entrega,fecha_firma,admin_id,token_publico)
VALUES (?,?,?,?,?,?,?,?,?,?,?)
");

$stmt->execute([
    $folio,
    $equipo_id,
    $num_emp,
    $firmaUsuarioFile,
    $firmaAdminFile,
    json_encode($snapshot_equipo),
    json_encode($snapshot_empleado),
    date("Y-m-d"),
    date("Y-m-d H:i:s"),
    $_SESSION['num_emp'],
    $token
]);

echo json_encode([
    "ok" => true,
    "folio" => $folio,
    "token_publico" => $token
]);