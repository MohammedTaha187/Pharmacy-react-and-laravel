<?php
namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    public function redirectToGoogle()
    {
        $url = Socialite::driver('google')->stateless()->redirect()->getTargetUrl();
        return response()->json(['url' => $url]);
    }

    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            if (!$googleUser || !$googleUser->getEmail()) {
                return response()->json(['error' => 'Google login failed'], 400);
            }

            $user = User::updateOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'name' => $googleUser->getName(),
                    'password' => Hash::make(uniqid()),
                    'image' => $googleUser->getAvatar(),
                    'email_verified_at' => now(),
                    'social_id' => $googleUser->getId(),
                    'social_type' => 'google',
                ]
            );

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'User logged in successfully',
                'token' => $token,
                'user' => $user,
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Something went wrong! ' . $e->getMessage()], 500);
        }
    }
}
