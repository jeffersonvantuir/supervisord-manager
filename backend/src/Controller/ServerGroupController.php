<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\ServerGroup;
use Doctrine\Common\Collections\Order;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class ServerGroupController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager
    ) {

    }

    #[Route('/server-group', name: 'app_server_group')]
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
            ];
        }

        return $this->json($serversArray);
    }
}