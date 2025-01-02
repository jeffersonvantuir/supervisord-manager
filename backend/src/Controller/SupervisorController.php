<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Server;
use App\Enum\SupervisorActionEnum;
use App\Service\EncryptionService;
use Doctrine\Common\Collections\Order;
use Doctrine\ORM\EntityManagerInterface;
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
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly EncryptionService $encryptionService,
    ) {

    }

    #[Route('/supervisor', name: 'app_supervisor')]
    public function index(): Response
    {
        $servers = $this->entityManager->getRepository(Server::class)->findBy(
            ['enabled' => true],
            ['serverGroup' => Order::Ascending->value]
        );

        $responseJson = [];

        foreach ($servers as $server) {
            if (false === $server->isSupervisorCompletedData()) {
                continue;
            }

            $guzzleClient = new \GuzzleHttp\Client(
                [
                    'auth' => [
                        $server->getSupervisorUsername(),
                        $this->encryptionService->decrypt($server->getSupervisorPassword()),
                    ]
                ]
            );

            // Pass the url and the guzzle client to the fXmlRpc Client
            $client = new Client(
                $server->getSupervisorEndpoint(),
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
                    'serverId' => $server->getId(),
                    'processId' => $processName,
                    'group' => $payload['group'],
                    'logfile' => $payload['logfile'],
                    'name' => $process->getName(),
                    'description' => $payload['description'],
                    'state' => $process->getState(),
                    'stateName' => ucwords(strtolower($payload['statename'])),
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
                'id' => $server->getId(),
                'server' => $server->getName(),
                'group' => $server->getServerGroup()?->getName(),
                'processes' => $processesArray
            ];
        }

        return $this->json($responseJson);
    }

    #[Route('/supervisor/process/handler', name: 'app_supervisor_process_handler', methods: Request::METHOD_POST)]
    public function handler(
        Request $request
    ): Response {
        try {
            $requestData = $request->toArray();

            $server = $this->entityManager->getRepository(Server::class)->findOneBy(
                ['id' => $requestData['server_id'] ?? null]
            );

            if (null === $server || false === $server->isSupervisorCompletedData()) {
                throw new \DomainException('Servidor não encontrado');
            }

            $guzzleClient = new \GuzzleHttp\Client(
                [
                    'auth' => [
                        $server->getSupervisorUsername(),
                        $this->encryptionService->decrypt($server->getSupervisorPassword()),
                    ]
                ]
            );

            $client = new Client(
                $server->getSupervisorEndpoint(),
                new PsrTransport(
                    new HttpFactory(),
                    $guzzleClient
                )
            );

            $supervisor = new Supervisor($client);
            $processName = $requestData['process'];

            match ($requestData['action']) {
                SupervisorActionEnum::START->value => $supervisor->startProcess($processName),
                SupervisorActionEnum::STOP->value => $supervisor->stopProcess($processName),
            };

            return $this->json([], Response::HTTP_NO_CONTENT);
        } catch (\Throwable $throwable) {
            return $this->json(
                ['message' => $throwable->getMessage()],
                Response::HTTP_BAD_REQUEST
            );
        }
    }

    #[Route('/supervisor/process/realtime-logs', name: 'app_supervisor_process_realtime_logs', methods: Request::METHOD_GET)]
    public function realtimeLogs(
        Request $request
    ): Response {
        try {
            $requestData = $request->query->all();
            $offset = $request->query->getInt('offset', 0);

            $server = $this->entityManager->getRepository(Server::class)->findOneBy(
                ['id' => $requestData['server_id'] ?? null]
            );

            if (null === $server || false === $server->isSupervisorCompletedData()) {
                throw new \DomainException('Servidor não encontrado');
            }

            $guzzleClient = new \GuzzleHttp\Client(
                [
                    'auth' => [
                        $server->getSupervisorUsername(),
                        $this->encryptionService->decrypt($server->getSupervisorPassword()),
                    ]
                ]
            );

            $client = new Client(
                $server->getSupervisorEndpoint(),
                new PsrTransport(
                    new HttpFactory(),
                    $guzzleClient
                )
            );

            $supervisor = new Supervisor($client);
            $processName = $requestData['process'];

            [$log, $offset, $overflow] = $supervisor->tailProcessStdoutLog($processName, $offset, 4096);

            return $this->json(
                [
                    'log' => $log,
                    'offset' => $offset,
                    'overflow' => $overflow
                ]
            );
        } catch (\Throwable $throwable) {
            return $this->json(
                ['message' => $throwable->getMessage()],
                Response::HTTP_BAD_REQUEST
            );
        }
    }

    #[Route('/supervisor/stop-all/{serverId}', name: 'app_supervisor_stop_all', methods: Request::METHOD_POST)]
    public function stopAll(
        Request $request,
        int $serverId,
    ): Response {
        try {
            $server = $this->entityManager->getRepository(Server::class)->findOneBy(
                ['id' => $serverId]
            );

            if (null === $server || false === $server->isSupervisorCompletedData() || false === $server->isEnabled()) {
                throw new \DomainException('Servidor não encontrado');
            }

            $guzzleClient = new \GuzzleHttp\Client(
                [
                    'auth' => [
                        $server->getSupervisorUsername(),
                        $this->encryptionService->decrypt($server->getSupervisorPassword()),
                    ]
                ]
            );

            $client = new Client(
                $server->getSupervisorEndpoint(),
                new PsrTransport(
                    new HttpFactory(),
                    $guzzleClient
                )
            );

            $supervisor = new Supervisor($client);
            $supervisor->stopAllProcesses();

            return $this->json([], Response::HTTP_NO_CONTENT);
        } catch (\Throwable $throwable) {
            return $this->json(
                ['message' => $throwable->getMessage()],
                Response::HTTP_BAD_REQUEST
            );
        }
    }

    #[Route('/supervisor/restart-all/{serverId}', name: 'app_supervisor_restart_all', methods: Request::METHOD_POST)]
    public function restartAll(
        Request $request,
        int $serverId,
    ): Response {
        try {
            $server = $this->entityManager->getRepository(Server::class)->findOneBy(
                ['id' => $serverId]
            );

            if (null === $server || false === $server->isSupervisorCompletedData() || false === $server->isEnabled()) {
                throw new \DomainException('Servidor não encontrado');
            }

            $guzzleClient = new \GuzzleHttp\Client(
                [
                    'auth' => [
                        $server->getSupervisorUsername(),
                        $this->encryptionService->decrypt($server->getSupervisorPassword()),
                    ]
                ]
            );

            $client = new Client(
                $server->getSupervisorEndpoint(),
                new PsrTransport(
                    new HttpFactory(),
                    $guzzleClient
                )
            );

            $supervisor = new Supervisor($client);
            $supervisor->stopAllProcesses();
            $supervisor->startAllProcesses();

            return $this->json([], Response::HTTP_NO_CONTENT);
        } catch (\Throwable $throwable) {
            return $this->json(
                ['message' => $throwable->getMessage()],
                Response::HTTP_BAD_REQUEST
            );
        }
    }
}