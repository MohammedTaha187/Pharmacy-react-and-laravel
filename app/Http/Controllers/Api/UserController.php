<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class UserController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // دعم رفع الصورة
        ]);


        $imagePath = null;
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $image->move(public_path('uploads/profile_images'), $imageName);
            $imagePath = 'uploads/profile_images/' . $imageName;
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'image' => $imagePath,
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'token' => $user->createToken('auth_token')->plainTextToken,
            'user' => new UserResource($user),
        ], 201);
    }


    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string|min:8',
        ]);

        if (!Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            return response()->json([
                'message' => __('lang.Invalid credentials'),
            ], 401);
        }

        $user = Auth::user();

        return response()->json([
            'message' => __('lang.User logged in successfully'),
            'token' => $user->createToken('auth_token')->plainTextToken,
            'user' => new UserResource($user),
        ], 200);
    }

    public function user(Request $request)
    {
        return new UserResource($request->user());
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json([
            'message' => __('lang.User logged out successfully'),
        ], 200);
    }

    public function allUsers()
    {
        $users = User::all();
        return UserResource::collection($users);
    }
}
