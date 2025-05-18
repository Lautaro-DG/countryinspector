<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CountryUserRating;
use Illuminate\Support\Facades\Auth;
use App\Models\CountryRating;

class CountryRatingController extends Controller
{
    public function showRatings($countryCode)
    {
        $ratings = CountryUserRating::where('country_code', $countryCode)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($ratings);
    }


    public function checkUserRating(Request $request, $countryCode)
    {
        if (!Auth::check()) {
            return response()->json(['hasRated' => false, 'message' => 'Usuario no autenticado']);
        }

        $rating = CountryUserRating::where('country_code', $countryCode)
            ->where('user_id', Auth::id())
            ->with('user')
            ->first();

        if ($rating) {
            return response()->json([
                'hasRated' => true,
                'message' => 'Ya has valorado este país',
                'rating' => $rating
            ]);
        }

        return response()->json([
            'hasRated' => false,
            'message' => 'Puedes valorar este país'
        ]);
    }


    public function storeRating(Request $request)
    {
        $request->validate([
            'country_code' => 'required|string|max:3',
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'required|string|max:2000',
        ]);

        $existingRating = CountryUserRating::where('country_code', $request->country_code)
            ->where('user_id', Auth::id())
            ->first();

        if ($existingRating) {
            return response()->json([
                'success' => false,
                'message' => 'Ya has valorado este país anteriormente'
            ], 400);
        }

        $rating = CountryUserRating::create([
            'country_code' => $request->country_code,
            'user_id' => Auth::id(),
            'rating' => $request->rating,
            'review' => $request->review,
        ]);

        return response()->json(['success' => true, 'message' => 'Valoración guardada']);
    }
    public function updateRating(Request $request)
    {
        $request->validate([
            'country_code' => 'required|string|max:3',
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'required|string|max:2000',
        ]);

        $rating = CountryUserRating::where('country_code', $request->country_code)
            ->where('user_id', Auth::id())
            ->first();

        if (!$rating) {
            return response()->json(['success' => false, 'message' => 'No se encontró la valoración'], 404);
        }

        $rating->update([
            'rating' => $request->rating,
            'review' => $request->review,
        ]);

        return response()->json(['success' => true, 'message' => 'Valoración actualizada']);
    }
    public function deleteRating(Request $request, $countryCode)
    {
        $rating = CountryUserRating::where('country_code', $countryCode)
            ->where('user_id', Auth::id())
            ->first();

        if (!$rating) {
            return response()->json(['success' => false, 'message' => 'No se encontró la valoración'], 404);
        }

        $rating->delete();
        return response()->json([
            'success' => true,
            'message' => 'Valoración eliminada',
            'flash' => 'Review deleted successfully.',
        ]);
    }
}
