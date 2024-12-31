<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\ServerRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ServerRepository::class)]
#[ORM\Table(name: 'servers')]
class Server
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(name: 'ip_fqdn', length: 255)]
    private ?string $ipFqdn = null;

    #[ORM\Column(name: 'ssh_username', length: 255, nullable: true)]
    private ?string $sshUsername = null;

    #[ORM\Column(name: 'ssh_password', length: 255, nullable: true)]
    private ?string $sshPassword = null;

    #[ORM\Column(name: 'supervisor_username', length: 255, nullable: true)]
    private ?string $supervisorUsername = null;

    #[ORM\Column(name: 'supervisor_password', length: 255, nullable: true)]
    private ?string $supervisorPassword = null;

    #[ORM\Column(name: 'supervisor_endpoint', length: 255, nullable: true)]
    private ?string $supervisorEndpoint = null;

    #[ORM\ManyToOne(inversedBy: 'servers')]
    #[ORM\JoinColumn(name: 'server_group', referencedColumnName: 'id')]
    private ?ServerGroup $serverGroup = null;

    #[ORM\Column(type: 'boolean')]
    private ?bool $enabled = true;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getIpFqdn(): ?string
    {
        return $this->ipFqdn;
    }

    public function setIpFqdn(?string $ipFqdn): static
    {
        $this->ipFqdn = $ipFqdn;

        return $this;
    }

    public function getSshUsername(): ?string
    {
        return $this->sshUsername;
    }

    public function setSshUsername(?string $sshUsername): static
    {
        $this->sshUsername = $sshUsername;

        return $this;
    }

    public function getSshPassword(): ?string
    {
        return $this->sshPassword;
    }

    public function setSshPassword(string $sshPassword): static
    {
        $this->sshPassword = $sshPassword;

        return $this;
    }

    public function getSupervisorUsername(): ?string
    {
        return $this->supervisorUsername;
    }

    public function setSupervisorUsername(?string $supervisorUsername): static
    {
        $this->supervisorUsername = $supervisorUsername;

        return $this;
    }

    public function getSupervisorPassword(): ?string
    {
        return $this->supervisorPassword;
    }

    public function setSupervisorPassword(?string $supervisorPassword): static
    {
        $this->supervisorPassword = $supervisorPassword;

        return $this;
    }

    public function getSupervisorEndpoint(): ?string
    {
        return $this->supervisorEndpoint;
    }

    public function setSupervisorEndpoint(?string $supervisorEndpoint): static
    {
        $this->supervisorEndpoint = $supervisorEndpoint;

        return $this;
    }

    public function getServerGroup(): ?ServerGroup
    {
        return $this->serverGroup;
    }

    public function setServerGroup(?ServerGroup $serverGroup): static
    {
        $this->serverGroup = $serverGroup;

        return $this;
    }

    public function isEnabled(): ?bool
    {
        return $this->enabled;
    }

    public function setEnabled(bool $enabled): static
    {
        $this->enabled = $enabled;

        return $this;
    }

    public function isSupervisorCompletedData(): bool
    {
        return false === empty($this->getSupervisorEndpoint())
            && false === empty($this->getSupervisorUsername())
            && false === empty($this->getSupervisorPassword());
    }
}
