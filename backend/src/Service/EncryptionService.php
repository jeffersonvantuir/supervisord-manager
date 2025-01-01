<?php

declare(strict_types=1);

namespace App\Service;

use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class EncryptionService
{
    private string $key;

    public function __construct(ParameterBagInterface $params)
    {
        $this->key = $params->get('app.encryption_master_key');
    }

    public function encrypt(string $data): string
    {
        $iv = \random_bytes(16); // Vetor de inicialização (IV) para segurança
        $encrypted = \openssl_encrypt($data, 'aes-256-cbc', $this->key, 0, $iv);

        // Retorna os dados criptografados concatenados com o IV, separados por "::"
        return base64_encode($encrypted . '::' . $iv);
    }

    public function decrypt(string $encryptedData): string
    {
        // Decodifica e separa os dados criptografados e o IV
        [$encrypted, $iv] = explode('::', base64_decode($encryptedData), 2);

        $return = \openssl_decrypt($encrypted, 'aes-256-cbc', $this->key, 0, $iv);
        if (false === $return) {
            throw new \DomainException('Hash inválido');
        }

        return $return;
    }
}