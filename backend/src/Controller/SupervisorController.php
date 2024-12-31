<?php

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

class SupervisorController extends AbstractController
{
    #[Route('/supervisor', name: 'app_supervisor')]
    public function index(): Response
    {
        $servers = [
            [
                'id' => rand(1, 10),
                'name' => 'API ServiceDesk',
                'host' => 'http://172.27.33.188:9001/RPC2',
                'username' => 'admin',
                'password' => 'admin'
            ]
        ];

        $responseJson = [];

        foreach ($servers as $server) {
            $guzzleClient = new \GuzzleHttp\Client(
                [
                    'auth' => [
                        $server['username'],
                        $server['password'],
                    ]
                ]
            );

            // Pass the url and the guzzle client to the fXmlRpc Client
            $client = new Client(
                $server['host'],
                new PsrTransport(
                    new HttpFactory(),
                    $guzzleClient
                )
            );

            // Pass the client to the Supervisor library.
            $supervisor = new Supervisor($client);
            // returns Process object
            $processes = $supervisor->getAllProcesses();

            $processesArray = [];

            foreach ($processes as $process) {
                $payload = $process->getPayload();
                $processName = sprintf('%s:%s', $payload['group'], $process->getName());

                $processesArray[] = [
                    'processId' => $processName,
                    'group' => $payload['group'],
                    'logfile' => $payload['logfile'],
                    'name' => $process->getName(),
                    'description' => $payload['description'],
                    'state' => $process->getState(),
                    'isRunning' => $process->isRunning(),
                    'actions' => [
                        [
                            'id' => $process->isRunning() ? SupervisorActionEnum::STOP->value : SupervisorActionEnum::START->value,
                            'title' => $process->isRunning() ? 'Stop' : 'Start',
                            'url' => $this->generateUrl('app_supervisor_process_handler')
                        ],
                        [
                            'id' => SupervisorActionEnum::LOG->value,
                            'title' => 'Logs',
                            'url' => $this->generateUrl('app_supervisor_process_handler')
                        ]
                    ]
                ];
            }

            $responseJson[] = [
                'server' => $server['name'],
                'processes' => $processesArray
            ];
        }

        return $this->json($responseJson);
    }

    #[Route('/supervisor/process/handler', name: 'app_supervisor_process_handler', methods: Request::METHOD_POST)]
    public function handler(
        Request $request
    ): Response {
        $guzzleClient = new \GuzzleHttp\Client(
            [
                'auth' => [
                    'admin',
                    'admin',
                ]
            ]
        );

        // Pass the url and the guzzle client to the fXmlRpc Client
        $client = new Client(
            'http://172.27.33.188:9001/RPC2',
            new PsrTransport(
                new HttpFactory(),
                $guzzleClient
            )
        );

        // Pass the client to the Supervisor library.
        $supervisor = new Supervisor($client);
        $requestData = $request->toArray();
        $processName = $requestData['process'];

        try {
            if ($requestData['action'] === 'stop') {
                $supervisor->stopProcess($processName);
            } else {
                $supervisor->startProcess($processName);
            }
        } catch (\Exception $e) {
            return $this->json(
                [
                    'message' => $e->getMessage(),
                    'action' => $request->request->get('action'),
                    'process' => $request->request->get('process'),
                ],
                Response::HTTP_BAD_REQUEST
            );
        }

        return $this->json([], Response::HTTP_NO_CONTENT);
    }
}