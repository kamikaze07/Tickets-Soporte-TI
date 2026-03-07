<?php

require_once __DIR__ . '/phpmailer/PHPMailer.php';
require_once __DIR__ . '/phpmailer/SMTP.php';
require_once __DIR__ . '/phpmailer/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function enviarCorreo($destino, $asunto, $contenido)
{
    $mail = new PHPMailer(true);

    try {

        $mail->isSMTP();
        $mail->Host = 'mail.forsis.com.mx';

        $mail->SMTPAuth = true;

        $mail->Username = 'sistemas2.poza@forsis.com.mx';
        $mail->Password = '926!sisT08';

        $mail->Port = 26;

        $mail->CharSet = 'UTF-8';

        $mail->setFrom(
            'sistemas2.poza@forsis.com.mx',
            'Sistema de Soporte TI'
        );

        $mail->addAddress($destino);

        $mail->isHTML(true);

        $mail->Subject = $asunto;
        $mail->Body = $contenido;

        $mail->send();

        return true;

    } catch (Exception $e) {

        error_log("Error enviando correo: " . $mail->ErrorInfo);

        return false;
    }
}