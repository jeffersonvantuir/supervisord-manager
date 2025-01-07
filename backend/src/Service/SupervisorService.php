<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Server;
use App\Exception\ServerNotFoundException;
use Doctrine\ORM\EntityManagerInterface;
use fXmlRpc\Client;
use fXmlRpc\Transport\PsrTransport;
use GuzzleHttp\Psr7\HttpFactory;
use Supervisor\Supervisor;

readonly class SupervisorService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private EncryptionService $encryptionService,
    ) {

    }

    public function startProcess(int $serverId, string $processName): void
    {
        $server = $this->getServer($serverId);
        $supervisor = $this->getSupervisor($server);

        $supervisor->startProcess($processName);
    }

    public function stopProcess(int $serverId, string $processName): void
    {
        $server = $this->getServer($serverId);
        $supervisor = $this->getSupervisor($server);

        $supervisor->stopProcess($processName);
    }

    public function restartProcess(int $serverId, string $processName): void
    {
        $server = $this->getServer($serverId);
        $supervisor = $this->getSupervisor($server);

        $supervisor->stopProcess($processName);
        $supervisor->startProcess($processName);
    }

    public function stopAllProcesses(int $serverId): void
    {
        $server = $this->getServer($serverId);
        $supervisor = $this->getSupervisor($server);

        $supervisor->stopAllProcesses();
    }

    public function restartAllProcesses(int $serverId): void
    {
        $server = $this->getServer($serverId);
        $supervisor = $this->getSupervisor($server);

        $supervisor->stopAllProcesses();
        $supervisor->startAllProcesses();
    }

    public function getServer(int $serverId): Server
    {
        $server = $this->entityManager->getRepository(Server::class)->findOneBy(
            ['id' => $serverId]
        );

        if (
            null === $server
            || false === $server->isEnabled()
            || false === $server->isSupervisorCompletedData()
        ) {
            throw new ServerNotFoundException();
        }

        return $server;
    }

    public function getSupervisor(Server $server): Supervisor
    {
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

        return new Supervisor($client);
    }
}