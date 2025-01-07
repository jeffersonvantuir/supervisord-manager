<?php

declare(strict_types=1);

namespace App\Exception;

use Symfony\Component\HttpFoundation\Response;

class ServerNotFoundException extends \DomainException
{
    public function __construct(
        ?string $message = 'Servidor não encontrado ou Inativo.',
        \Throwable $previous = null
    ) {
        parent::__construct($message, Response::HTTP_NOT_FOUND, $previous);
    }
}
