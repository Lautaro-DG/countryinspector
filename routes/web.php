<?php
use App\Http\Controllers\CountryController;
use Illuminate\Support\Facades\Route;

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