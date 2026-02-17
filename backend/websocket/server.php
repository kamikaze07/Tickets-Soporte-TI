<?php
require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/ChatServer.php';

use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use Ratchet\Server\IoServer;

$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new ChatServer()
        )
    ),
    8080
);

echo "WebSocket corriendo en puerto 8080\n";
$server->run();
