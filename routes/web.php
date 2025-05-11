<?php
use App\Http\Controllers\CountryController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CountryHistoryController;

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

Route::get('/get-visited-countries', [CountryHistoryController::class, 'getVisitedCountries']);
Route::post('/remove-country-from-history/{slug}', [CountryHistoryController::class, 'removeCountryFromHistory']);