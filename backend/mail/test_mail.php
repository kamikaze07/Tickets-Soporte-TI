<?php

require_once __DIR__ . '/mailer.php';

$result = enviarCorreo(
  "sistemas2.poza@forsis.com.mx",
  "Prueba Sistema Tickets",
  "<b>Correo de prueba</b>"
);

var_dump($result);