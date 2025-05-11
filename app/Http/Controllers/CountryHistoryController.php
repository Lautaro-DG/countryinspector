<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Http\JsonResponse;

class CountryHistoryController extends Controller
{
     /* Obtener la lista de países visitados */
    public function getVisitedCountries(): JsonResponse
    {
        $history = Session::get('visited_countries', []);
        return response()->json($history);
    }

    /* Eliminar un país del historial */
    public function removeCountryFromHistory(string $slug): JsonResponse
    {
        $history = Session::get('visited_countries', []);
        
        $filteredHistory = array_filter($history, function($country) use ($slug) {
            return $country['slug'] !== $slug;
        });
        
        $filteredHistory = array_values($filteredHistory);
        
        Session::put('visited_countries', $filteredHistory);
        
        return response()->json(['success' => true]);
    }
}
