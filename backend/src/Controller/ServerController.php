<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Server;
use App\Entity\ServerGroup;
use App\Service\EncryptionService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/server', name: 'app_server')]
class ServerController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager
    ) {

    }

    #[Route('')]
    public function index(EncryptionService $encryptionService): Response
    {
        $servers = $this->entityManager->getRepository(Server::class)->findBy([]);

        $serversArray = [];
        foreach ($servers as $server) {
            $serversArray[] = [
                'group' => $server->getServerGroup()?->getName(),
                'name' => $server->getName(),
                'fqdn' => $server->getIpFqdn(),
                'enabled' => $server->isEnabled(),
            ];
        }

        return $this->json($serversArray);
    }

    #[Route('/new', name: 'app_server_new', methods: Request::METHOD_POST)]
    public function new(
        Request $request,
        EncryptionService $encryptionService,
    ): JsonResponse {
        try {
            $requestData = $request->toArray();

            $server = (new Server())
                ->setServerGroup(
                    false === empty($requestData['group_id'])
                        ? $this->entityManager->getReference(ServerGroup::class, $requestData['group_id'])
                        : null
                )
                ->setName($requestData['name'])
                ->setDescription($requestData['description'])
                ->setEnabled(isset($requestData['enabled']))
                ->setIpFqdn($requestData['fqdn'])
                ->setSshUsername($requestData['ssh_username'])
                ->setSshPassword(
                    false === empty($requestData['ssh_password'])
                        ? $encryptionService->encrypt($requestData['ssh_password'])
                        : null
                )
                ->setSupervisorEndpoint($requestData['supervisor_endpoint'])
                ->setSupervisorUsername($requestData['supervisor_username'])
                ->setSupervisorPassword(
                    false === empty($requestData['supervisor_password'])
                        ? $encryptionService->encrypt($requestData['supervisor_password'])
                        : null
                );

            $this->entityManager->persist($server);
            $this->entityManager->flush();

            return $this->json([], Response::HTTP_CREATED);
        } catch (\Throwable $throwable) {
            return $this->json(
                ['message' => $throwable->getMessage()],
                Response::HTTP_BAD_REQUEST
            );
        }
    }
}