<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class ProfileController extends AbstractController
{
    #[Route('/profile', name: 'app_profile', methods: Request::METHOD_GET)]
    public function profile(): Response
    {
        $user = $this->getUser();

        $profileData = [
            'username' => $user->getUserIdentifier(),
            'roles' => $user->getRoles()
        ];

        return $this->json($profileData);
    }
}