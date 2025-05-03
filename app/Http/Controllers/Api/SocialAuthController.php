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
        return Socialite::driver('google')->stateless()->redirect(); // ✅ يحول مباشرة على صفحة جوجل
    }

    public function handleGoogleCallback(Request $request)
{
    try {
        $googleUser = Socialite::driver('google')->stateless()->user();

        if (!$googleUser || !$googleUser->getEmail()) {
            return redirect()->away('http://localhost:5173/login?error=google_login_failed');
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

        // Redirect to frontend with token in URL
        return redirect()->away("http://localhost:5173/social-auth?token=$token");
    } catch (\Exception $e) {
        return redirect()->away('http://localhost:5173/login?error=something_went_wrong');
    }
}




    // 🟦 Facebook methods below

    public function redirectToFacebook()
    {
        return Socialite::driver('facebook')->stateless()->redirect(); // ✅ يحول مباشرة على صفحة فيسبوك
    }

    public function handleFacebookCallback(Request $request)
    {
        try {
            $facebookUser = Socialite::driver('facebook')->stateless()->user();

            if (!$facebookUser || !$facebookUser->getEmail()) {
                return redirect()->away('https://localhost:5173/login?error=facebook_login_failed');
            }

            $user = User::updateOrCreate(
                ['email' => $facebookUser->getEmail()],
                [
                    'name' => $facebookUser->getName(),
                    'password' => Hash::make(uniqid()),
                    'image' => $facebookUser->getAvatar(),
                    'email_verified_at' => now(),
                    'social_id' => $facebookUser->getId(),
                    'social_type' => 'facebook',
                ]
            );

            $token = $user->createToken('auth_token')->plainTextToken;

            // ✅ Redirect to frontend with token in URL
            return redirect()->away("http://localhost:5173/social-auth?token=$token");

        } catch (\Exception $e) {
            return redirect()->away('http://localhost:5173/login?error=something_went_wrong');
        }
    }

}
