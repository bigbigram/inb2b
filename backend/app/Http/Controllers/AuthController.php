<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'in:customer,admin,vendor',
            'email' => 'nullable|email|unique:users'
        ]);

        try {
            $user = User::create([
                'name' => $validatedData['name'],
                'phone' => $validatedData['phone'],
                'email' => $validatedData['email'] ?? null,
                'password' => Hash::make($validatedData['password']),
                'role' => $validatedData['role'] ?? 'customer',
                'is_active' => true
            ]);

            // Create a personal access token
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'user' => $user,
                'token' => $token,
                'message' => 'Registration successful'
            ], 201);
        } catch (\Exception $e) {
            Log::error('Registration Error: ' . $e->getMessage());
            Log::error('Registration Trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Registration failed: ' . $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    public function login(Request $request)
    {
        // Comprehensive request data extraction
        \Log::emergency('LOGIN_REQUEST_COMPREHENSIVE', [
            'request_content_type' => $request->header('Content-Type'),
            'request_method' => $request->method(),
            'request_all' => $request->all(),
            'request_input' => $request->input(),
            'request_json_all' => $request->json() ? $request->json()->all() : 'NO_JSON',
            'request_content' => $request->getContent(),
            'parsed_content' => json_decode($request->getContent(), true)
        ]);

        // Multiple data extraction methods
        $requestData = [];
        
        // Try JSON first
        if ($request->isJson()) {
            $requestData = $request->json()->all();
        }
        
        // Fallback to input
        if (empty($requestData)) {
            $requestData = $request->input();
        }
        
        // Final fallback to all
        if (empty($requestData)) {
            $requestData = $request->all();
        }

        // Fallback to parsed content if still empty
        if (empty($requestData)) {
            $requestData = json_decode($request->getContent(), true) ?? [];
        }

        // Detailed logging of extracted data
        \Log::emergency('LOGIN_EXTRACTED_DATA', [
            'extracted_data' => $requestData,
            'data_type' => gettype($requestData),
            'data_keys' => array_keys($requestData),
            'phone_details' => [
                'exists' => isset($requestData['phone']),
                'value' => $requestData['phone'] ?? 'NOT_PROVIDED',
                'type' => gettype($requestData['phone'] ?? null)
            ],
            'password_details' => [
                'exists' => isset($requestData['password']),
                'type' => gettype($requestData['password'] ?? null)
            ]
        ]);

        // Normalize and sanitize input
        $requestData = is_array($requestData) ? 
            array_map(function($value) {
                return is_string($value) ? trim($value) : $value;
            }, $requestData) : 
            [];

        // Comprehensive validation
        $validator = Validator::make($requestData, [
            'phone' => [
                'required', 
                'string', 
                function ($attribute, $value, $fail) {
                    $trimmedValue = trim($value);
                    
                    // Detailed phone validation logging
                    \Log::emergency('PHONE_VALIDATION_DETAILS', [
                        'original_value' => $value,
                        'trimmed_value' => $trimmedValue,
                        'length' => strlen($trimmedValue),
                        'starts_with' => substr($trimmedValue, 0, 2),
                        'is_digit' => ctype_digit($trimmedValue)
                    ]);

                    // Validation rules
                    $validPrefixes = ['17', '18', '19'];
                    $isValid = 
                        strlen($trimmedValue) === 8 && 
                        in_array(substr($trimmedValue, 0, 2), $validPrefixes) && 
                        ctype_digit($trimmedValue);

                    if (!$isValid) {
                        $fail('Invalid phone number. Must be an 8-digit number starting with 17, 18, or 19.');
                    }
                }
            ],
            'password' => [
                'required', 
                'string', 
                'min:6',
                function ($attribute, $value, $fail) {
                    // Detailed password validation logging
                    \Log::emergency('PASSWORD_VALIDATION_DETAILS', [
                        'length' => strlen($value),
                        'contains_uppercase' => preg_match('/[A-Z]/', $value),
                        'contains_lowercase' => preg_match('/[a-z]/', $value),
                        'contains_number' => preg_match('/[0-9]/', $value)
                    ]);

                    // More flexible password validation
                    $isValid = 
                        strlen($value) >= 6 && (
                            // Complex password
                            (preg_match('/[A-Z]/', $value) && 
                             preg_match('/[a-z]/', $value) && 
                             preg_match('/[0-9]/', $value)) ||
                            // Simple numeric password
                            ctype_digit($value) ||
                            // Numeric with uppercase
                            (preg_match('/[A-Z]/', $value) && ctype_digit(preg_replace('/[A-Z]/', '', $value)))
                        );

                    if (!$isValid) {
                        $fail('Password must be at least 6 characters. Include uppercase, lowercase, and numbers for complexity.');
                    }
                }
            ]
        ]);

        // Handle validation failures
        if ($validator->fails()) {
            \Log::emergency('VALIDATION_FAILURE', [
                'errors' => $validator->errors()->all(),
                'input_data' => $requestData
            ]);

            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
                'input_data' => $requestData
            ], 422);
        }

        // Validated data
        $fields = $validator->validated();

        // User lookup
        $user = User::where('phone', $fields['phone'])->first();
        
        // Log user lookup details
        \Log::emergency('USER_LOOKUP', [
            'phone' => $fields['phone'],
            'user_found' => $user ? true : false
        ]);

        // User not found
        if (!$user) {
            return response()->json([
                'message' => 'User not found',
                'phone' => $fields['phone']
            ], 404);
        }

        // Password verification
        if (!Hash::check($fields['password'], $user->password)) {
            \Log::emergency('PASSWORD_VERIFICATION_FAILED', [
                'phone' => $fields['phone']
            ]);

            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Create token
        $token = $user->createToken('login_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ], 200);
    }

    public function loginForm(Request $request)
    {
        $credentials = $request->validate([
            'phone' => 'required|string',
            'password' => 'required|string'
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            
            // Check if user is active
            if (!$user->is_active) {
                Auth::logout();
                return back()->withErrors([
                    'phone' => 'Your account is not active.'
                ])->withInput($request->only('phone'));
            }

            return redirect()->intended('dashboard');
        }

        return back()->withErrors([
            'phone' => 'The provided credentials do not match our records.',
        ])->withInput($request->only('phone'));
    }

    public function registerForm(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'in:customer,admin,vendor',
            'email' => 'nullable|email|unique:users'
        ]);

        $user = User::create([
            'name' => $validatedData['name'],
            'phone' => $validatedData['phone'],
            'email' => $validatedData['email'] ?? null,
            'password' => Hash::make($validatedData['password']),
            'role' => $validatedData['role'] ?? 'customer',
            'is_active' => true
        ]);

        // Automatically log in the user after registration
        Auth::loginUsingId($user->id);

        return redirect()->intended('dashboard');
    }

    public function logout(Request $request)
    {
        try {
            // Revoke the token that was used to authenticate the current request
            $request->user()->currentAccessToken()->delete();

            // Log the logout event
            \Log::info('User Logout', [
                'user_id' => $request->user()->id,
                'phone' => $request->user()->phone,
                'logout_time' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Successfully logged out'
            ]);
        } catch (\Exception $e) {
            // Log the error
            \Log::error('Logout Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function logoutForm(Request $request)
    {
        Auth::logout();

        return redirect('/');
    }

    public function checkAuth(Request $request)
    {
        if (!$request->user()) {
            return response()->json([
                'authenticated' => false,
                'message' => 'Not authenticated'
            ], 200);
        }

        return response()->json([
            'authenticated' => true,
            'user' => $request->user()
        ]);
    }
}
