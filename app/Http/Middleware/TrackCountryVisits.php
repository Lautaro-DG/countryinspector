<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Session;

class TrackCountryVisits
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        $path = $request->path();
        if (preg_match('/^country\/([a-zA-Z0-9-]+)$/', $path, $matches)) {
            $countrySlug = $matches[1];
            
            $countryName = ucfirst(str_replace('-', ' ', $countrySlug));
            
            $history = Session::get('visited_countries', []);
            
            $existingIndex = array_search($countrySlug, array_column($history, 'slug'));
            
            if ($existingIndex !== false) {
                array_splice($history, $existingIndex, 1);
            }
            
            array_unshift($history, [
                'slug' => $countrySlug,
                'name' => $countryName,
                'timestamp' => now()->toIso8601String()
            ]);
            
            if (count($history) > 20) {
                $history = array_slice($history, 0, 20);
            }
            
            Session::put('visited_countries', $history);
        }
        
        return $next($request);
    }
}
