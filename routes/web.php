<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CountryController;
use App\Http\Controllers\HistorialController;
use App\Http\Controllers\CountryRatingController;
use App\Models\CountryUserRating;

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/user/update', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/historial', [HistorialController::class, 'userHistory'])->name('historial.obtener');
    Route::delete('/historial/{id}', [HistorialController::class, 'deleteHistory'])->name('historial.borrar');
    Route::delete('/historial', [HistorialController::class, 'deleteAllHistory'])->name('historial.borrarTodo');
    Route::put('/country-ratings', [CountryRatingController::class, 'updateRating']);
    Route::delete('/country-ratings/{countryCode}', [CountryRatingController::class, 'deleteRating']);
    Route::post('/country-ratings', [CountryRatingController::class, 'storeRating']);
    Route::get('/check-user-rating/{countryCode}', [CountryRatingController::class, 'checkUserRating']);
});

Route::get('/', function () {
    return view('welcome');
});

Route::get('/country/{nombre}', [CountryController::class, 'show'])->name('pais.show');

Route::get('/weather-api-key', function () {
    return response()->json(['api_key' => env('VISUAL_CROSSING_API_KEY')]);
});

Route::get('/news-api-key', function () {
    return response()->json(['api_key' => config('services.news_api.key')]);
});

Route::get('/country-ratings/{countryCode}', [CountryRatingController::class, 'showRatings']);

Route::get('/api/country-average-rating/{countryCode}', function ($countryCode) {
    $average = CountryUserRating::where('country_code', $countryCode)->avg('rating');
    return response()->json(['average_rating' => round($average, 1)]);
});

Route::get('/compare', [CountryController::class, 'compare']);

require __DIR__ . '/auth.php';
