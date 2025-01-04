<?php

declare(strict_types=1);

namespace App\Controller;

use App\Dto\User\CreateUserDto;
use App\Service\UserService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class UserRegistrationController extends AbstractController
{
    #[Route('/user/registration', name: 'app_user_registration', methods: Request::METHOD_POST)]
    public function new(
        Request $request,
        UserService $userService,
    ): JsonResponse {
        try {
            $requestData = $request->toArray();
            $createUserDto = new CreateUserDto(
                $requestData['name'],
                $requestData['email'],
                $requestData['password'],
                false,
            );

            $userService->create($createUserDto);

            return $this->json([], Response::HTTP_CREATED);
        } catch (\Throwable $throwable) {
            return $this->json(
                ['message' => $throwable->getMessage()],
                Response::HTTP_BAD_REQUEST
            );
        }
    }
}