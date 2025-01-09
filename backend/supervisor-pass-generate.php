<?php

// Verificar se a senha foi passada como argumento
if ($argc < 2) {
    echo "Uso: php gerar_senha_supervisord.php <senha>" . PHP_EOL;
    exit(1);
}

// Pegar a senha do primeiro argumento
$password = $argv[1];

// Gerar o hash SHA-1
$hash = sha1($password, true);

// Codificar o hash em Base64
$hashBase64 = base64_encode($hash);

// Formatar no padrão {SHA} para o supervisord
$senhaSupervisor = "{SHA}" . $hashBase64;

// Exibir o resultado
echo "Senha para o Supervisor: " . $senhaSupervisor . PHP_EOL;
