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
        $user->assignRole('user');

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
            $user = $request->has('id') ? User::findOrFail($request->id) : Auth::user();
    
            $request->validate([
                'name' => 'nullable|string|max:255',
                'email' => 'nullable|string|email|unique:users,email,' . $user->id,
                'oldPassword' => 'nullable|string|min:8',
                'newPassword' => 'nullable|string|min:8|confirmed',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'role' => 'nullable|string|in:user,admin,super_admin',
            ]);
    
            if (!$request->has('id')) {
                if ($request->oldPassword && !Hash::check($request->oldPassword, $user->password)) {
                    return response()->json(['message' => 'كلمة المرور القديمة غير صحيحة'], 400);
                }
    
                if ($request->newPassword) {
                    $user->password = bcrypt($request->newPassword);
                }
    
                if ($request->hasFile('image')) {
                    if ($user->image && Storage::disk('public')->exists($user->image)) {
                        \Storage::disk('public')->delete($user->image);
                    }
    
                    $image = $request->file('image');
                    $imageName = time() . '_' . $image->getClientOriginalName();
                    $imagePath = $image->storeAs('profile_images', $imageName, 'public');
                    $user->image = $imagePath;
                }
    
                $user->name = $request->name ?? $user->name;
                $user->email = $request->email ?? $user->email;
            }
    
            if (auth()->user()?->hasRole('super_admin')) {
                if ($request->filled('role')) {
                    $user->syncRoles([$request->role]);
                }
            }
    
            $user->save();
    
            return response()->json([
                'message' => 'تم التحديث بنجاح',
                'user' => new UserResource($user),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'حدث خطأ أثناء التحديث.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request, $id = null)
{
    try {
        $user = $id ? User::findOrFail($id) : Auth::user();

        if (!$user) {
            return response()->json(['message' => 'المستخدم غير موجود'], 404);
        }

        // منع حذف السوبر أدمن عن طريق الخطأ
        if ($user->hasRole('super_admin') && auth()->id() !== $user->id) {
            return response()->json(['message' => 'لا يمكن حذف سوبر أدمن إلا بواسطة نفسه'], 403);
        }

        // حذف الصورة لو موجودة
        if ($user->image && Storage::disk('public')->exists($user->image)) {
            Storage::disk('public')->delete($user->image);
        }

        $user->delete();

        return response()->json(['message' => 'تم حذف المستخدم بنجاح'], 200);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'حدث خطأ أثناء الحذف.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

    

    
    

    


}
