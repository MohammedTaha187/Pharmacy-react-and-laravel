<?php

namespace App\Http\Controllers\Api;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\CategoryResource;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $cats = Category::orderBy('id', 'desc')->get();

        return CategoryResource::collection($cats);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'name_en' => 'required|string',
            'name_ar' => 'required|string',
            'desc_en' => 'required|string',
            'desc_ar' => 'required|string',
            'image' => 'required|image',

        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->messages()], 422);
        }

        $imgPath = Storage::putFile('cats', $request->file('image'));

        Category::create([
            'name' => json_encode([
                'en' => $request->name_en,
                'ar' => $request->name_ar,
            ]),
            'desc' => json_encode([
                'en' => $request->desc_en,
                'ar' => $request->desc_ar,
            ]),
            'image' => $imgPath,
        ]);

        return response()->json(['message' => __('lang.Category created successfully')], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $cats = Category::find($id);

        if (!$cats) {
            return response()->json(['msg' => __('lang.Item not found')], 404);
        }

        return new  CategoryResource($cats);

        // return new = json_decode -> CategoryResource($cats);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {

        $validator = Validator::make($request->all(), [
            'name_en' => 'required|string',
            'name_ar' => 'required|string',
            'desc_en' => 'required|string',
            'desc_ar' => 'required|string',
            'image' => 'nullable|image',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
            ], 422);
        }

        $cat = Category::findOrFail($id);

        if ($request->hasFile('image')) {
            if (Storage::exists($cat->image)) {
                Storage::delete($cat->image);
            }
            $cat->image = Storage::putFile("cats", $request->image);
        }

        $cat->name = json_encode([
            'en' => $request->name_en,
            'ar' => $request->name_ar,
        ]);

        $cat->desc = json_encode([
            'en' => $request->desc_en,
            'ar' => $request->desc_ar,
        ]);



        $cat->save();

        return response()->json([
            'message' => __('lang.Category updated successfully'),
            'category' => new CategoryResource($cat),
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $cat = Category::find($id);
        if (!$cat) {
            return response()->json(['message' => __('lang.Category not found')], 404);
        }

        if (Storage::exists($cat->image)) {
            Storage::delete($cat->image);
        }

        $cat->delete();
        return response()->json(['message' => __('lang.Category deleted successfully')], 200);
    }
}
