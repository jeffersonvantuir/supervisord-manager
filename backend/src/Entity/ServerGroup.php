<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\ServerGroupRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ServerGroupRepository::class)]
#[ORM\Table(name: 'server_groups')]
class ServerGroup
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $description = null;

    /**
     * @var Collection<int, Server>
     */
    #[ORM\OneToMany(targetEntity: Server::class, mappedBy: 'serverGroup')]
    private Collection $servers;

    public function __construct()
    {
        $this->servers = new ArrayCollection();
    }

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

    public function setDescription(string $description): static
    {
        $this->description = $description;

        return $this;
    }

    /**
     * @return Collection<int, Server>
     */
    public function getServers(): Collection
    {
        return $this->servers;
    }

    public function addServer(Server $server): static
    {
        if (!$this->servers->contains($server)) {
            $this->servers->add($server);
            $server->setServerGroup($this);
        }

        return $this;
    }

    public function removeServer(Server $server): static
    {
        if ($this->servers->removeElement($server)) {
            // set the owning side to null (unless already changed)
            if ($server->getServerGroup() === $this) {
                $server->setServerGroup(null);
            }
        }

        return $this;
    }
}
