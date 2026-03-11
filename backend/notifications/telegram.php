<?php

function enviarTelegram($mensaje){

    $token = "8604948228:AAHhsDIv8xYrg1YZNYGveO94hC-mPmxbo2g";
    $chat_id = "8524928499";

    $url = "https://api.telegram.org/bot$token/sendMessage";

    $data = [
        'chat_id' => $chat_id,
        'text' => $mensaje
    ];

    $options = [
        'http' => [
            'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
            'method'  => 'POST',
            'content' => http_build_query($data)
        ]
    ];

    $context  = stream_context_create($options);
    file_get_contents($url, false, $context);
}