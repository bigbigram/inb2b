<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ShippingAddressController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProfileController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware(['api'])->group(function () {
    // CSRF token route
    Route::get('/csrf-token', function () {
        return response()->json([
            'csrf_token' => csrf_token()
        ]);
    });

    // Authentication routes
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::get('/check-auth', [AuthController::class, 'checkAuth']);
    
    // Protected routes
    Route::middleware(['auth:sanctum', 'web'])->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        
        // Shipping Address Routes
        Route::get('/shipping-addresses', [ShippingAddressController::class, 'index']);
        Route::post('/shipping-addresses', [ShippingAddressController::class, 'store']);
        Route::get('/shipping-addresses/{id}', [ShippingAddressController::class, 'show']);
        Route::put('/shipping-addresses/{id}', [ShippingAddressController::class, 'update']);
        Route::delete('/shipping-addresses/{id}', [ShippingAddressController::class, 'destroy']);
        
        // Order routes
        Route::get('/orders', [OrderController::class, 'index']);
        Route::patch('/orders/{id}', [OrderController::class, 'update']);
        Route::post('/orders', [OrderController::class, 'store']);
        Route::get('/orders/{id}', [OrderController::class, 'show']);
        
        // Profile routes
        Route::get('/profile', [ProfileController::class, 'getProfile']);
        Route::put('/profile', [ProfileController::class, 'updateProfile']);
    });
    Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
});
