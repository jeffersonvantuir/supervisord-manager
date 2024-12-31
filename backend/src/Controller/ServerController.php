<?php

declare(strict_types=1);

namespace App\Controller;

use App\Enum\SupervisorActionEnum;
use Supervisor\Supervisor;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use fXmlRpc\Client;
use fXmlRpc\Transport\PsrTransport;
use GuzzleHttp\Psr7\HttpFactory;

class ServerController extends AbstractController
{
    #[Route('/', name: 'app_server')]
    public function index(): Response
    {
        $servers = [
            [
                'id' => rand(1, 10),
                'name' => 'API ServiceDesk',
                'host' => 'http://172.27.33.188:9001/RPC2',
                'username' => 'admin',
            ]
        ];

        return $this->json($servers);
    }

    #[Route('/server/new', name: 'app_server_ne', methods: Request::METHOD_POST)]
    public function new(
        Request $request
    ): Response {
        return $this->json([], Response::HTTP_CREATED);
    }
}