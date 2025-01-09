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

    #[Route('', methods: Request::METHOD_GET)]
    public function index(): Response
    {
        $servers = $this->entityManager->getRepository(Server::class)->findBy([]);

        $serversArray = [];
        foreach ($servers as $server) {
            $serversArray[] = [
                'id' => $server->getId(),
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
                ->setSshUsername($requestData['ssh_username'] ?? null)
                ->setSshPassword(
                    false === empty($requestData['ssh_password'])
                        ? $encryptionService->encrypt($requestData['ssh_password'])
                        : null
                )
                ->setSupervisorEndpoint($requestData['supervisor_endpoint'] ?? null)
                ->setSupervisorUsername($requestData['supervisor_username'] ?? null)
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

    #[Route('/{id}', name: 'app_server_edit', methods: [Request::METHOD_PUT, Request::METHOD_GET])]
    public function edit(
        Request $request,
        int $id,
        EncryptionService $encryptionService,
    ): JsonResponse {
        try {
            /** @var Server $server */
            $server = $this->entityManager->getRepository(Server::class)->findOneBy(
                ['id' => $id]
            );

            if (null === $server) {
                throw new \DomainException('Servidor não encontrado.');
            }

            if ($request->isMethod(Request::METHOD_GET)) {
                return $this->json(
                    [
                        'name' => $server->getName(),
                        'description' => $server->getDescription(),
                        'fqdn' => $server->getIpFqdn(),
                        'group_id' => $server->getServerGroup()?->getId(),
                        'enabled' => $server->isEnabled(),
                        'ssh' => [
                            'username' => $server->getSshUsername(),
                        ],
                        'supervisor' => [
                            'username' => $server->getSupervisorUsername(),
                            'endpoint' => $server->getSupervisorEndpoint(),
                        ],
                    ]
                );
            }

            if ($request->isMethod(Request::METHOD_PUT)) {
                $requestData = $request->toArray();

                $server->setServerGroup(
                    false === empty($requestData['group_id'])
                        ? $this->entityManager->getReference(ServerGroup::class, $requestData['group_id'])
                        : null
                )
                    ->setName($requestData['name'])
                    ->setDescription($requestData['description'])
                    ->setEnabled(isset($requestData['enabled']))
                    ->setIpFqdn($requestData['fqdn'])
                    ->setSshUsername($requestData['ssh_username'])
                    ->setSupervisorEndpoint($requestData['supervisor_endpoint'])
                    ->setSupervisorUsername($requestData['supervisor_username']);

                if (false === empty($requestData['ssh_password'])) {
                    $server->setSshPassword($encryptionService->encrypt($requestData['ssh_password']));
                }

                if (false === empty($requestData['supervisor_password'])) {
                    $server->setSupervisorPassword($encryptionService->encrypt($requestData['supervisor_password']));
                }

                $this->entityManager->flush();
            }

            return $this->json([]);
        } catch (\Throwable $throwable) {
            return $this->json(
                ['message' => $throwable->getMessage()],
                Response::HTTP_BAD_REQUEST
            );
        }
    }

    #[Route('/{id}/toggle', name: 'app_server_toggle', methods: Request::METHOD_POST)]
    public function toggleEnabled(
        Request $request,
        int $id,
    ): JsonResponse {
        try {
            /** @var Server $server */
            $server = $this->entityManager->getRepository(Server::class)->findOneBy(
                ['id' => $id]
            );

            if (null === $server) {
                throw new \DomainException('Servidor não encontrado.');
            }

            $server->setEnabled(!$server->isEnabled());
            $this->entityManager->flush();

            return $this->json([]);
        } catch (\Throwable $throwable) {
            return $this->json(
                ['message' => $throwable->getMessage()],
                Response::HTTP_BAD_REQUEST
            );
        }
    }
}