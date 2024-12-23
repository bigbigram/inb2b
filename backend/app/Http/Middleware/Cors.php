<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Cors
{
    public function handle(Request $request, Closure $next): Response
    {
        // Comprehensive CORS configuration
        $allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173', 
            'http://localhost:5174',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:5174'
        ];

        // Check if the request origin is allowed
        $origin = $request->header('Origin');
        $originAllowed = in_array($origin, $allowedOrigins);

        // Detailed logging of CORS request
        \Log::channel('daily')->emergency('CORS_REQUEST_DETAILS', [
            'origin' => $origin,
            'origin_allowed' => $originAllowed,
            'request_method' => $request->method(),
            'allowed_origins' => $allowedOrigins,
            'headers' => $request->headers->all()
        ]);

        // If the origin is not allowed, return a 403 Forbidden response
        if (!$originAllowed) {
            \Log::channel('daily')->emergency('CORS_ORIGIN_REJECTED', [
                'rejected_origin' => $origin
            ]);

            return response()->json([
                'message' => 'Origin not allowed',
                'origin' => $origin
            ], 403);
        }

        // Handle preflight OPTIONS requests
        if ($request->isMethod('OPTIONS')) {
            return response()->json('OK', 200, [
                'Access-Control-Allow-Origin' => $origin,
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, X-Requested-With, X-CSRF-TOKEN, X-XSRF-TOKEN, Authorization',
                'Access-Control-Allow-Credentials' => 'true'
            ]);
        }

        // Add CORS headers to the response
        $response = $next($request);
        
        $response->headers->set('Access-Control-Allow-Origin', $origin);
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-CSRF-TOKEN, X-XSRF-TOKEN, Authorization');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');

        return $response;
    }
}
