<?php
// backend/auth/login.php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
header("Content-Type: application/json; charset=UTF-8");

// Solo POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Método no permitido"
    ]);
    exit;
}

// Leer JSON
$input = json_decode(file_get_contents("php://input"), true);

$usuario  = trim($input["usuario"] ?? "");
$password = trim($input["password"] ?? "");

// Validación básica
if ($usuario === "" || $password === "") {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Usuario y contraseña son obligatorios"
    ]);
    exit;
}

// Conexión DB
require_once __DIR__ . "/../config/database.php";

try {
    $stmt = $pdo->prepare("
        SELECT
            nombre_usu,
            contrasena,
            priv,
            correo,
            num_emp
        FROM usuarios
        WHERE nombre_usu = :usuario
        LIMIT 1
    ");

    $stmt->execute([
        ":usuario" => $usuario
    ]);

    $user = $stmt->fetch();

    // Usuario no existe
    if (!$user) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Credenciales inválidas"
        ]);
        exit;
    }

    // Usuario sin contraseña asignada
    if ($user["contrasena"] === "") {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "Usuario sin acceso al sistema"
        ]);
        exit;
    }

    // Validar contraseña (MD5)
    if (md5($password) !== $user["contrasena"]) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Credenciales inválidas"
        ]);
        exit;
    }

    // =========================
    // SESIÓN
    // =========================
    $_SESSION["logged"]   = true;
    $_SESSION["usuario"]  = $user["nombre_usu"];
    $_SESSION["rol"]      = $user["priv"];
    $_SESSION["correo"]   = $user["correo"];
    $_SESSION["num_emp"]  = $user["num_emp"];

    echo json_encode([
        "success" => true,
        "message" => "Login correcto",
        "rol"     => $user["priv"]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error interno del servidor"
    ]);
}
