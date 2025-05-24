<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CountryInfoController;

Route::get('/country/{code}', [CountryInfoController::class, 'show']);
Route::get('/country/{code}/wikipedia', [CountryInfoController::class, 'getWikipediaOnly']);
Route::get('/country/{code}/news', [CountryInfoController::class, 'getNewsOnly']);
Route::get('/country/{code}/statistics', [CountryInfoController::class, 'getStatisticsOnly']);
Route::get('/country/{code}/weather/{city?}', [CountryInfoController::class, 'getWeatherOnly']);

