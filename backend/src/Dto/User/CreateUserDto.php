<?php

declare(strict_types=1);

namespace App\Dto\User;

class CreateUserDto
{
    private string $name;

    private string $email;

    private string $plainPassword;

    private bool $enabled = false;

    public function __construct(string $name, string $email, string $plainPassword, bool $enabled)
    {
        $this->name = $name;
        $this->email = $email;
        $this->plainPassword = $plainPassword;
        $this->enabled = $enabled;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getPlainPassword(): string
    {
        return $this->plainPassword;
    }

    public function isEnabled(): bool
    {
        return $this->enabled;
    }
}