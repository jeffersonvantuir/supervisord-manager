<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

class AuthController extends AbstractController
{
    #[Route('/login', name: 'app_login', methods: [Request::METHOD_POST])]
    public function login(AuthenticationUtils $authenticationUtils, Request $request): JsonResponse
    {
        $error = $authenticationUtils->getLastAuthenticationError();
        $lastUsername = $authenticationUtils->getLastUsername();

        if ($error) {
            return $this->json(
                ['message' => 'Usuário ou senha inválidos'],
                Response::HTTP_UNAUTHORIZED
            );
        }

        return $this->json(
            [
                'message' => 'Autenticação realizada com sucesso',
                'user' => $lastUsername
            ],
        );
    }
}