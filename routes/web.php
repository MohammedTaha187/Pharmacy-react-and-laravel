<?php
use Illuminate\Support\Facades\Route;

Route::get('/uploads/{path}', function ($path) {
    $file = public_path('uploads/' . $path);
    if (file_exists($file)) {
        return response()->file($file);
    }
    abort(404);
})->where('path', '.*');
