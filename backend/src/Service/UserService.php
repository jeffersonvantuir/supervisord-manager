<?php

declare(strict_types=1);

namespace App\Service;

use App\Dto\User\CreateUserDto;
use App\Dto\User\UpdateUserDto;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserService
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {

    }

    public function create(CreateUserDto $createUserDto): void
    {
        $alreadyUserEmail = $this->entityManager->getRepository(User::class)->findOneBy(
            ['email' => $createUserDto->getEmail()]
        );

        if (null !== $alreadyUserEmail) {
            throw new \DomainException(
                sprintf('E-mail %s já em uso. Favor informe outro e-mail.', $createUserDto->getEmail())
            );
        }

        $user = (new User())
            ->setName($createUserDto->getName())
            ->setEmail($createUserDto->getEmail())
            ->setEnabled($createUserDto->isEnabled());

        $user->setPassword(
            $this->passwordHasher->hashPassword($user, $createUserDto->getPlainPassword())
        );

        $this->entityManager->persist($user);
        $this->entityManager->flush();
    }

    public function update(UpdateUserDto $updateUserDto): void
    {
        $user = $this->entityManager->getRepository(User::class)->findOneBy(
            ['id' => $updateUserDto->getId()]
        );

        if (null === $user) {
            throw new \DomainException(sprintf('Usuário não encontrado com ID %d', $updateUserDto->getId()));
        }

        $alreadyUserEmail = $this->entityManager->getRepository(User::class)->findOneBy(
            ['email' => $updateUserDto->getEmail()]
        );

        if (null !== $alreadyUserEmail && $alreadyUserEmail->getId() !== $updateUserDto->getId()) {
            throw new \DomainException(
                sprintf('E-mail %s já em uso. Favor informe outro e-mail.', $updateUserDto->getEmail())
            );
        }

        $user->setName($updateUserDto->getName())
            ->setEmail($updateUserDto->getEmail());

        $this->entityManager->flush();
    }

    public function toggleEnabled(int $userId): void
    {
        $user = $this->entityManager->getRepository(User::class)->findOneBy(
            ['id' => $userId]
        );

        if (null === $user) {
            throw new \DomainException('Usuário não encontrado.');
        }

        $user->setEnabled(!$user->isEnabled());
        $this->entityManager->flush();
    }

    public function updateLastLogin(int $userId): void
    {
        $user = $this->entityManager->getRepository(User::class)->findOneBy(
            ['id' => $userId]
        );

        if (null === $user) {
            throw new \DomainException('Usuário não encontrado.');
        }

        $user->renewLastLogin();
        $this->entityManager->flush();
    }
}