<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Laravel\Sanctum\Http\Controllers\CsrfCookieController;
use Illuminate\Http\Request;

// Root route
Route::get('/', function () {
    return view('vue-app');
})->name('home');

// Catch-all route for Vue SPA
Route::get('/{any}', function () {
    return view('vue-app');
})->where('any', '^(?!api).*')->name('vue-app');

// API routes
Route::prefix('api')->group(function () {
    // CSRF Token route with explicit token generation
    Route::get('/csrf-token', function (Request $request) {
        // Ensure a consistent token is generated/retrieved
        $token = $request->session()->token();
        
        // Regenerate if token is empty
        if (empty($token)) {
            $request->session()->regenerateToken();
            $token = $request->session()->token();
        }

        return response()->json([
            'csrf_token' => $token
        ])->header('X-CSRF-TOKEN', $token)
          ->header('Set-Cookie', 'XSRF-TOKEN=' . $token . '; Path=/; HttpOnly; SameSite=Lax');
    })->middleware('web');

    // CSRF Cookie route
    Route::get('/sanctum/csrf-cookie', function (Request $request) {
        // Ensure session token exists
        if (!$request->session()->has('_token')) {
            $request->session()->regenerateToken();
        }

        return response()->json([
            'message' => 'CSRF cookie set',
            'token' => $request->session()->token()
        ]);
    })->middleware('web');

    // Authentication routes
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/register', [AuthController::class, 'register'])->name('register');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});
