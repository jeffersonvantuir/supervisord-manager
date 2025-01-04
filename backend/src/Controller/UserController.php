<?php

declare(strict_types=1);

namespace App\Controller;

use App\Dto\User\UpdateUserDto;
use App\Entity\User;
use App\Service\UserService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class UserController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserService $userService,
    ) {

    }

    #[Route('/users', name: 'app_users', methods: Request::METHOD_GET)]
    public function index(): Response
    {
        $users = $this->entityManager->getRepository(User::class)->findBy([]);

        $usersArray = [];
        foreach ($users as $user) {
            $usersArray[] = [
                'id' => $user->getId(),
                'name' => $user->getName(),
                'email' => $user->getEmail(),
                'enabled' => $user->isEnabled(),
                'last_login' => $user->getLastLogin()?->format('Y-m-d H:i:s'),
            ];
        }

        return $this->json($usersArray);
    }



    #[Route('/users/{id}', name: 'app_users_edit', methods: [Request::METHOD_GET, Request::METHOD_PUT])]
    public function edit(
        Request $request,
        int $id,
    ): Response
    {
        try {
            $user = $this->entityManager->getRepository(User::class)->findOneBy(
                ['id' => $id]
            );

            if (null === $user) {
                throw new \DomainException('Usuário não encontrado.');
            }

            if ($request->isMethod(Request::METHOD_GET)) {
                return $this->json(
                    [
                        'name' => $user->getName(),
                        'email' => $user->getEmail(),
                    ]
                );
            }

            if ($request->isMethod(Request::METHOD_PUT)) {
                $requestData = $request->toArray();

                $updateDto = new UpdateUserDto(
                    $id,
                    $requestData['name'],
                    $requestData['email'],
                );

                $this->userService->update($updateDto);
            }

            return $this->json([]);
        } catch (\Throwable $throwable) {
            return $this->json(
                ['message' => $throwable->getMessage()],
                Response::HTTP_BAD_REQUEST
            );
        }
    }

    #[Route('users/{id}/toggle', name: 'app_user_toggle', methods: Request::METHOD_POST)]
    public function toggleEnabled(
        int $id,
    ): JsonResponse {
        try {
            $this->userService->toggleEnabled($id);

            return $this->json([]);
        } catch (\Throwable $throwable) {
            return $this->json(
                ['message' => $throwable->getMessage()],
                Response::HTTP_BAD_REQUEST
            );
        }
    }
}