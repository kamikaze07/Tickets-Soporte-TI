<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';

if (!isset($_SESSION['num_emp'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

if (!isset($_FILES['archivo'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No se recibió archivo']);
    exit;
}

$file = $_FILES['archivo'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Error en la subida',
        'detalle' => $file['error']
    ]);
    exit;
}

/* 🔒 Límite 10MB */
$maxSize = 10 * 1024 * 1024;

if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['error' => 'Archivo supera el límite de 10MB']);
    exit;
}

/* ✔ Validar extensión */
$permitidos = ['jpg','jpeg','png','gif','webp','pdf','doc','docx','xls','xlsx'];

$extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

if (!in_array($extension, $permitidos)) {
    http_response_code(400);
    echo json_encode(['error' => 'Tipo no permitido']);
    exit;
}

$nombreOriginal = $file['name'];
$esImagen = in_array($extension, ['jpg','jpeg','png','gif','webp']);

/* =========================================================
   📷 SI ES IMAGEN → REDIMENSIONAR CON GD
========================================================= */

if ($esImagen) {

    $imageInfo = getimagesize($file['tmp_name']);
    if (!$imageInfo) {
        http_response_code(400);
        echo json_encode(['error' => 'Imagen inválida']);
        exit;
    }

    list($width, $height) = $imageInfo;

    $maxWidth = 1920;

    if ($width > $maxWidth) {

        $ratio = $maxWidth / $width;
        $newWidth = $maxWidth;
        $newHeight = intval($height * $ratio);

        $srcImage = null;

        switch ($extension) {
            case 'jpg':
            case 'jpeg':
                $srcImage = imagecreatefromjpeg($file['tmp_name']);
                break;
            case 'png':
                $srcImage = imagecreatefrompng($file['tmp_name']);
                break;
            case 'gif':
                $srcImage = imagecreatefromgif($file['tmp_name']);
                break;
            case 'webp':
                $srcImage = imagecreatefromwebp($file['tmp_name']);
                break;
        }

        if (!$srcImage) {
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo procesar la imagen']);
            exit;
        }

        $dstImage = imagecreatetruecolor($newWidth, $newHeight);

        imagecopyresampled(
            $dstImage,
            $srcImage,
            0, 0, 0, 0,
            $newWidth,
            $newHeight,
            $width,
            $height
        );

        /* Convertimos a JPG para optimizar */
        $nombreUnico = uniqid('file_', true) . '.jpg';
        $rutaRelativa = "uploads/" . $nombreUnico;
        $rutaAbsoluta = __DIR__ . "/../../" . $rutaRelativa;

        imagejpeg($dstImage, $rutaAbsoluta, 80);

        imagedestroy($srcImage);
        imagedestroy($dstImage);

    } else {
        // Imagen pequeña → guardar tal cual
        $nombreUnico = uniqid('file_', true) . '.' . $extension;
        $rutaRelativa = "uploads/" . $nombreUnico;
        $rutaAbsoluta = __DIR__ . "/../../" . $rutaRelativa;

        if (!move_uploaded_file($file['tmp_name'], $rutaAbsoluta)) {
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo guardar el archivo']);
            exit;
        }
    }

} else {

    /* =========================================================
       📄 SI NO ES IMAGEN → GUARDAR NORMAL
    ========================================================= */

    $nombreUnico = uniqid('file_', true) . '.' . $extension;
    $rutaRelativa = "uploads/" . $nombreUnico;
    $rutaAbsoluta = __DIR__ . "/../../" . $rutaRelativa;

    if (!move_uploaded_file($file['tmp_name'], $rutaAbsoluta)) {
        http_response_code(500);
        echo json_encode(['error' => 'No se pudo guardar el archivo']);
        exit;
    }
}

/* ✔ Determinar autor */
$autor = ($_SESSION['rol'] ?? '') === 'SUPER USUARIO'
    ? 'admin'
    : 'usuario';

/* ✔ Insertar en BD */
$stmt = $pdo->prepare("
    INSERT INTO ticket_comentarios
    (ticket_id, autor, tipo, comentario, archivo, nombre_archivo, created_at)
    VALUES (?, ?, 'archivo', '', ?, ?, NOW())
");

$stmt->execute([
    $_POST['ticket_id'],
    $autor,
    $rutaRelativa,
    $nombreOriginal
]);

echo json_encode([
    'ok' => true,
    'archivo' => $rutaRelativa,
    'nombre' => $nombreOriginal,
    'autor' => $autor
]);
