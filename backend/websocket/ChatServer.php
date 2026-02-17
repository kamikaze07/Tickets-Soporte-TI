<?php
error_reporting(0);
ini_set('display_errors', 0);

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class ChatServer implements MessageComponentInterface
{
    protected $clients = [];

    public function onOpen(ConnectionInterface $conn)
    {
        $this->clients[$conn->resourceId] = [
            'conn' => $conn,
            'ticket_id' => null
        ];
    }

    public function onMessage(ConnectionInterface $from, $msg)
    {
        $data = json_decode($msg, true);
        if (!$data || !isset($data['type'])) return;

        /* =========================
           JOIN
        ========================= */
        if ($data['type'] === 'join') {
            $this->clients[$from->resourceId]['ticket_id'] = $data['ticket_id'];
            return;
        }

        /* =========================
           MESSAGE  ✅ SIMPLE Y CORRECTO
        ========================= */
        if ($data['type'] === 'message') {

            foreach ($this->clients as $client) {

                if ((string)$client['ticket_id'] !== (string)$data['ticket_id']) {
                    continue;
                }

                $client['conn']->send(json_encode([
                    'type'       => 'message',
                    'ticket_id'  => $data['ticket_id'],   // 👈 MUY IMPORTANTE
                    'autor'      => $data['autor'],
                    'mensaje'    => $data['mensaje'],
                    'created_at' => date('Y-m-d H:i:s')
                ]));
            }
        }

        if ($data['type'] === 'file') {

            foreach ($this->clients as $client) {

                if ((string)$client['ticket_id'] !== (string)$data['ticket_id']) {
                    continue;
                }

                $client['conn']->send(json_encode([
                    'type' => 'file',
                    'ticket_id' => $data['ticket_id'],
                    'autor' => $data['autor'],
                    'archivo' => $data['archivo'],
                    'nombre_archivo' => $data['nombre_archivo'],
                    'created_at' => date('Y-m-d H:i:s')
                ]));
            }
        }


    }

    public function onClose(ConnectionInterface $conn)
    {
        unset($this->clients[$conn->resourceId]);
    }

    public function onError(ConnectionInterface $conn, \Exception $e)
    {
        $conn->close();
    }
}
