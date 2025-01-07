<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Server;
use App\Enum\SupervisorActionEnum;
use App\Service\SupervisorService;
use Doctrine\Common\Collections\Order;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class SupervisorController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly SupervisorService $supervisorService,
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

            $supervisor = $this->supervisorService->getSupervisor($server);
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
            $serverId = $requestData['server_id'] ?? null;
            $processName = $requestData['process'] ?? null;

            if (empty($serverId) || empty($processName)) {
                throw new \InvalidArgumentException('ID do Servidor e nome do processo devem ser informados.');
            }

            match ($requestData['action']) {
                SupervisorActionEnum::START->value => $this->supervisorService->startProcess($serverId, $processName),
                SupervisorActionEnum::STOP->value => $this->supervisorService->stopProcess($serverId, $processName),
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
            $serverId = $requestData['server_id'] ?? null;
            $processName = $requestData['process'] ?? null;

            if (empty($serverId) || empty($processName)) {
                throw new \InvalidArgumentException('ID do Servidor e nome do processo devem ser informados.');
            }

            $server = $this->supervisorService->getServer($requestData['server_id']);
            $supervisor = $this->supervisorService->getSupervisor($server);

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
        int $serverId,
    ): Response {
        try {
            $this->supervisorService->stopAllProcesses($serverId);

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
        int $serverId,
    ): Response {
        try {
            $this->supervisorService->restartAllProcesses($serverId);

            return $this->json([], Response::HTTP_NO_CONTENT);
        } catch (\Throwable $throwable) {
            return $this->json(
                ['message' => $throwable->getMessage()],
                Response::HTTP_BAD_REQUEST
            );
        }
    }
}