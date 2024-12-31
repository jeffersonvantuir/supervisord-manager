<?php

namespace App\Service;

use Supervisor\Supervisor;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class RpcClientService
{
    private HttpClientInterface $httpClient;

    private string $endpoint;

    private string $username;

    private string $password;

    public function __construct(HttpClientInterface $httpClient, string $endpoint, string $username, string $password)
    {
        $this->httpClient = $httpClient;
        $this->endpoint = $endpoint;
        $this->username = $username;
        $this->password = $password;
    }

    public function call(string $method, array $params): array
    {

        $supervisor = new Supervisor();

        $body = \xmlrpc_encode_request($method, $params);

        $response = $this->httpClient->request('POST', $this->endpoint, [
            'headers' => [
                'Authorization' => 'Basic ' . base64_encode("{$this->username}:{$this->password}"),
                'Content-Type' => 'text/xml',
            ],
            'body' => $body,
        ]);

        if ($response->getStatusCode() !== 200) {
            throw new \Exception('RPC call failed with status code: ' . $response->getStatusCode());
        }

        $decodedResponse = \xmlrpc_decode($response->getContent());

        if (is_array($decodedResponse) && \xmlrpc_is_fault($decodedResponse)) {
            throw new \Exception('RPC call returned an error: ' . $decodedResponse['faultString']);
        }

        return $decodedResponse;
    }
}
