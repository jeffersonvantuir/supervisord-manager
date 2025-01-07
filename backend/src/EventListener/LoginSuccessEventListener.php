<?php

declare(strict_types=1);

namespace App\EventListener;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Security\Http\Event\LoginSuccessEvent;

readonly class LoginSuccessEventListener implements EventSubscriberInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) { }

    public static function getSubscribedEvents(): array
    {
        return [
            LoginSuccessEvent::class => 'onLoginSuccess'
        ];
    }

    public function onLoginSuccess(LoginSuccessEvent $event): void
    {
        /** @var User $user */
        $user = $event->getUser();

        if (false === method_exists($user, 'renewLastLogin')) {
            return;
        }

        $user->renewLastLogin();
        $this->entityManager->flush();
    }
}