<?php

namespace App\Http\Controllers\Api;

use Storage;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Hash; // إضافة Hash للتأكد من كلمة المرور القديمة

class UserController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $imagePath = $image->storeAs('profile_images', $imageName, 'public');
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'image' => $imagePath, // حفظ مسار الصورة
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

    public function update(Request $request)
    {
        try {
            $user = Auth::user();
    
            // التحقق من المدخلات
            $request->validate([
                'name' => 'string|max:255',
                'email' => 'string|email|unique:users,email,' . $user->id,
                'oldPassword' => 'nullable|string|min:8', // جعلها nullable
                'newPassword' => 'nullable|string|min:8|confirmed',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);
    
            // التحقق من كلمة المرور القديمة فقط إذا كانت موجودة
            if ($request->oldPassword && !Hash::check($request->oldPassword, $user->password)) {
                return response()->json(['message' => 'كلمة المرور القديمة غير صحيحة'], 400);
            }
    
            // تغيير كلمة المرور الجديدة إذا كانت موجودة
            if ($request->newPassword) {
                $user->password = bcrypt($request->newPassword);
            }
    
            // رفع الصورة الجديدة إن وجدت
            if ($request->hasFile('image')) {
                // حذف الصورة القديمة إن وُجدت
                if ($user->image && Storage::disk('public')->exists($user->image)) {
                    \Storage::disk('public')->delete($user->image);
                }
    
                $image = $request->file('image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $imagePath = $image->storeAs('profile_images', $imageName, 'public');
                $user->image = $imagePath;
            }
    
            // تحديث البيانات الأخرى
            $user->name = $request->name;
            $user->email = $request->email;
            $user->save();
    
            return response()->json([
                'message' => 'تم تحديث الملف الشخصي بنجاح',
                'user' => new UserResource($user),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'حدث خطأ أثناء تحديث الملف الشخصي.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    


}
