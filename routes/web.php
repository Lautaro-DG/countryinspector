<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CountryController;
use App\Http\Controllers\HistorialController;
use App\Http\Controllers\CountryRatingController;

Route::middleware('auth')->group(function () {

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/historial', [HistorialController::class, 'obtenerHistorial'])->name('historial.obtener');
    Route::delete('/historial/{id}', [HistorialController::class, 'borrarHistorial'])->name('historial.borrar');
    Route::delete('/historial', [HistorialController::class, 'borrarTodoHistorial'])->name('historial.borrarTodo');
});

Route::get('/', function () {
    return view('welcome');
});

Route::get('/country/{nombre}', [CountryController::class, 'show'])->name('pais.show');


Route::get('/weather-api-key', function () {
    return response()->json(['api_key' => env('VISUAL_CROSSING_API_KEY')]);
});

Route::get('/news-api-key', function () {
    return response()->json(['api_key' => env('NEWS_API_KEY')]);
});
Route::get('/country-ratings/{countryCode}', [CountryRatingController::class, 'showRatings']);
Route::post('/country-ratings', [CountryRatingController::class, 'storeRating'])->middleware('auth');
Route::get('/check-user-rating/{countryCode}', [CountryRatingController::class, 'checkUserRating'])->middleware('auth');
Route::put('/country-ratings', [CountryRatingController::class, 'updateRating']);
Route::delete('/country-ratings/{countryCode}', [CountryRatingController::class, 'deleteRating']);

require __DIR__ . '/auth.php';
