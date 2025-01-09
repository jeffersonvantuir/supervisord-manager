<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\ServerGroup;
use Doctrine\Common\Collections\Order;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/server-groups', name: 'app_server_group')]
class ServerGroupController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager
    ) {

    }

    #[Route('', methods: Request::METHOD_GET)]
    public function index(): Response
    {
        $serverGroups = $this->entityManager->getRepository(ServerGroup::class)->findBy(
            [],
            ['name' => Order::Ascending->value]
        );

        $serversArray = [];
        foreach ($serverGroups as $serverGroup) {
            $serversArray[] = [
                'id' => $serverGroup->getId(),
                'name' => $serverGroup->getName(),
                'enabled' => $serverGroup->isEnabled(),
            ];
        }

        return $this->json($serversArray);
    }

    #[Route('', name: '_new', methods: Request::METHOD_POST)]
    public function new(
        Request $request,
    ): JsonResponse {
        try {
            $requestData = $request->toArray();

            $serverGroup = (new ServerGroup())
                ->setName($requestData['name'])
                ->setDescription($requestData['description'])
                ->setEnabled(isset($requestData['enabled']));

            $this->entityManager->persist($serverGroup);
            $this->entityManager->flush();

            return $this->json([], Response::HTTP_CREATED);
        } catch (\Throwable $throwable) {
            return $this->json(
                ['message' => $throwable->getMessage()],
                Response::HTTP_BAD_REQUEST
            );
        }
    }

    #[Route('/{id}', name: '_edit', methods: [Request::METHOD_GET, Request::METHOD_PUT])]
    public function edit(
        Request $request,
        ServerGroup $serverGroup,
    ): JsonResponse {
        try {
            if ($request->isMethod(Request::METHOD_GET)) {
                return $this->json(
                    [
                        'name' => $serverGroup->getName(),
                        'description' => $serverGroup->getDescription(),
                    ]
                );
            }

            $requestData = $request->toArray();

            $serverGroup->setName($requestData['name'])
                ->setDescription($requestData['description']);

            $this->entityManager->flush();

            return $this->json([], Response::HTTP_OK);
        } catch (\Throwable $throwable) {
            return $this->json(
                ['message' => $throwable->getMessage()],
                Response::HTTP_BAD_REQUEST
            );
        }
    }

    #[Route('/{id}/toggle', name: '_toggle', methods: Request::METHOD_POST)]
    public function toggleEnabled(
        ServerGroup $serverGroup,
    ): JsonResponse {
        try {
            $serverGroup->setEnabled(!$serverGroup->isEnabled());
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