<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $addHttpCookie = true;

    protected $except = [
        'api/sanctum/csrf-cookie',
        'api/csrf-token',
        'api/login',
        'api/register'
    ];

    /**
     * Determine if the request has a valid CSRF token.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return bool
     */
    protected function tokensMatch($request)
    {
        // Get the token from multiple sources
        $token = $request->input('_token') 
                ?? $request->header('X-CSRF-TOKEN') 
                ?? $request->header('X-XSRF-TOKEN') 
                ?? $request->cookie('XSRF-TOKEN');

        if (!$token) {
            \Log::warning('No CSRF token found in request', [
                'method' => $request->method(),
                'path' => $request->path(),
                'headers' => $request->headers->all(),
                'cookies' => $request->cookies->all()
            ]);
            return false;
        }

        // Get session token
        $sessionToken = $this->getTokenFromSession($request);

        // Compare tokens
        $tokensMatch = hash_equals($sessionToken, $token);

        if (!$tokensMatch) {
            \Log::warning('CSRF Token Mismatch', [
                'session_token' => $sessionToken,
                'request_token' => $token,
                'method' => $request->method(),
                'path' => $request->path()
            ]);
        }

        return $tokensMatch;
    }

    /**
     * Determine if the request has a valid CSRF token.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return bool
     */
    protected function shouldProcess($request)
    {
        // Add more flexible CSRF token validation
        $csrfTokenMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
        
        // Skip CSRF check for safe HTTP methods
        if (!in_array($request->method(), $csrfTokenMethods)) {
            return false;
        }

        return true;
    }

    // Ensure consistent token generation
    protected function getTokenFromSession($request)
    {
        // If no token exists, generate a new one
        if (!$request->session()->has('_token')) {
            $request->session()->regenerateToken();
        }
        
        return $request->session()->token();
    }
}
