<?php

declare(strict_types=1);

namespace App\Security;

use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\Ldap\Ldap;
use Symfony\Component\Ldap\Exception\LdapException;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

class LdapAuthenticator extends AbstractAuthenticator
{
    public function __construct(
        private readonly Ldap $ldap,
        private readonly JWTTokenManagerInterface $jwtManager,
        private readonly string $ldapBaseDn,
        private readonly string $ldapUidKey,
        private readonly string $ldapDomain,
        private readonly string $groupDn,
    ) {

    }

    public function supports(Request $request): bool
    {
        return $request->attributes->get('_route') === 'app_login'
            && $request->isMethod(Request::METHOD_POST);
    }

    public function authenticate(Request $request): Passport
    {
        $requestData = $request->toArray();
        $username = $requestData['username'] ?? null;
        $password = $requestData['password'] ?? null;

        if (empty($username) || empty($password)) {
            throw new AuthenticationException('Credenciais inválidas.');
        }

        $dn = $this->ldapDomain . $username;
        try {
            $this->ldap->bind(
                $dn,
                $password
            );

        } catch (LdapException $e) {
            throw new AuthenticationException('Falha na autenticação LDAP.');
        }

        $query = $this->ldap->query($this->groupDn, "(member=$dn)");
        $entries = $query->execute()->toArray();

//        if (count($entries) === 0) {
//            throw new AuthenticationException("Acesso negado. Você não pertence ao grupo gs_supervisor.");
//        }

        return new SelfValidatingPassport(new UserBadge($username));
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        $user = $token->getUser();
        $jwt = $this->jwtManager->create($user);

        return new JsonResponse(
            ['token' => $jwt],
            Response::HTTP_OK
        );
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return new JsonResponse(
            ['error' => $exception->getMessage()],
            Response::HTTP_FORBIDDEN
        );
    }
}
