<?php

namespace App\Http\Controllers;

use App\Models\ShippingAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ShippingAddressController extends Controller
{
    public function index()
    {
        try {
            $addresses = ShippingAddress::where('user_id', Auth::id())->get();
            return response()->json($addresses);
        } catch (\Exception $e) {
            Log::error('Failed to fetch shipping addresses: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch shipping addresses',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            $validatedData = $request->validate([
                'full_name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'required|string|max:20',
                'address_line1' => 'required|string|max:255',
                'address_line2' => 'nullable|string|max:255',
                'city' => 'required|string|max:100',
                'state' => 'required|string|max:100',
                'postal_code' => 'nullable|string|max:20',
                'country' => 'required|string|max:100',
                'is_default' => 'boolean'
            ]);

            // Add user_id to the validated data
            $validatedData['user_id'] = Auth::id();

            // If this is the first address or is_default is true, set all other addresses to non-default
            if ((!ShippingAddress::where('user_id', Auth::id())->exists()) || 
                ($request->input('is_default', false))) {
                ShippingAddress::where('user_id', Auth::id())
                    ->update(['is_default' => false]);
            }

            $address = ShippingAddress::create($validatedData);

            DB::commit();

            return response()->json($address, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::warning('Validation failed for shipping address:', [
                'errors' => $e->errors(),
                'data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create shipping address: ' . $e->getMessage(), [
                'exception' => $e,
                'data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Failed to create shipping address',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $address = ShippingAddress::where('user_id', Auth::id())
                ->findOrFail($id);
            return response()->json($address);
        } catch (\Exception $e) {
            Log::error('Failed to fetch shipping address: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch shipping address',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $address = ShippingAddress::where('user_id', Auth::id())
                ->findOrFail($id);

            $validatedData = $request->validate([
                'full_name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'required|string|max:20',
                'address_line1' => 'required|string|max:255',
                'address_line2' => 'nullable|string|max:255',
                'city' => 'required|string|max:100',
                'state' => 'required|string|max:100',
                'postal_code' => 'nullable|string|max:20',
                'country' => 'required|string|max:100',
                'is_default' => 'boolean'
            ]);

            // If setting as default, update other addresses
            if ($request->input('is_default', false)) {
                ShippingAddress::where('user_id', Auth::id())
                    ->where('id', '!=', $id)
                    ->update(['is_default' => false]);
            }

            $address->update($validatedData);

            DB::commit();

            return response()->json($address);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update shipping address: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update shipping address',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $address = ShippingAddress::where('user_id', Auth::id())
                ->findOrFail($id);

            // If this is the default address and there are other addresses,
            // make another address the default
            if ($address->is_default) {
                $otherAddress = ShippingAddress::where('user_id', Auth::id())
                    ->where('id', '!=', $id)
                    ->first();
                
                if ($otherAddress) {
                    $otherAddress->update(['is_default' => true]);
                }
            }

            $address->delete();

            DB::commit();

            return response()->json(null, 204);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete shipping address: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete shipping address',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
