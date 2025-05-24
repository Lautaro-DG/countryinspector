<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Country;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class CountryInfoController extends Controller
{
    public function show($code)
    {
        try {
            $countryInfo = $this->getBasicCountryInfo($code);
            
            if (!$countryInfo) {
                return response()->json(['error' => 'Country not found'], 404);
            }

            $countryName = $countryInfo['name']['common'];
            $capital = $countryInfo['capital'][0] ?? $countryName;

            $data = [
                'country' => $countryInfo,
                'wikipedia' => $this->getWikipediaInfo($countryName),
                'statistics' => $this->getWorldBankStats($code),
                'news' => $this->getCountryNews($countryName),
                'weather' => $this->getCountryWeather($capital),
                'timestamp' => now()->toISOString()
            ];

            return response()->json($data);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch country information',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getWikipediaOnly($code)
    {
        try {
            $countryInfo = $this->getBasicCountryInfo($code);
            if (!$countryInfo) {
                return response()->json(['error' => 'Country not found'], 404);
            }

            $wikipedia = $this->getWikipediaInfo($countryInfo['name']['common']);
            return response()->json([
                'country' => $countryInfo['name']['common'],
                'wikipedia' => $wikipedia,
                'timestamp' => now()->toISOString()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch Wikipedia information',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getNewsOnly($code)
    {
        try {
            $countryInfo = $this->getBasicCountryInfo($code);
            if (!$countryInfo) {
                return response()->json(['error' => 'Country not found'], 404);
            }

            $news = $this->getCountryNews($countryInfo['name']['common']);
            return response()->json([
                'country' => $countryInfo['name']['common'],
                'news' => $news,
                'timestamp' => now()->toISOString()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch news',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getStatisticsOnly($code)
    {
        try {
            $countryInfo = $this->getBasicCountryInfo($code);
            if (!$countryInfo) {
                return response()->json(['error' => 'Country not found'], 404);
            }

            $statistics = $this->getWorldBankStats($code);
            return response()->json([
                'country' => $countryInfo['name']['common'],
                'statistics' => $statistics,
                'timestamp' => now()->toISOString()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch statistics',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getWeatherOnly($code, $city = null)
    {
        try {
            $countryInfo = $this->getBasicCountryInfo($code);
            if (!$countryInfo) {
                return response()->json(['error' => 'Country not found'], 404);
            }

            $cityName = $city ?? ($countryInfo['capital'][0] ?? $countryInfo['name']['common']);
            
            $weather = $this->getCountryWeather($cityName);
            return response()->json([
                'country' => $countryInfo['name']['common'],
                'city' => $cityName,
                'weather' => $weather,
                'timestamp' => now()->toISOString()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch weather',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function getBasicCountryInfo($code)
    {
        $cacheKey = "country_info_{$code}";
        
        return Cache::remember($cacheKey, 3600, function() use ($code) {
            $response = Http::get("https://restcountries.com/v3.1/alpha/{$code}");
            
            if ($response->successful()) {
                $countries = $response->json();
                return $countries[0] ?? null;
            }
            
            return null;
        });
    }

    private function getWikipediaInfo($countryName)
    {
        $cacheKey = "wikipedia_{$countryName}";
        
        return Cache::remember($cacheKey, 7200, function() use ($countryName) {
            try {
                $formattedCountry = $this->formatCountryName($countryName);
                $historyTitle = "History_of_{$formattedCountry}";
                
                $response = Http::get('https://en.wikipedia.org/w/api.php', [
                    'action' => 'query',
                    'format' => 'json',
                    'prop' => 'extracts|pageimages',
                    'exintro' => 1,
                    'explaintext' => 1,
                    'titles' => $historyTitle,
                    'piprop' => 'thumbnail',
                    'pithumbsize' => 400,
                    'redirects' => 1
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    $pages = $data['query']['pages'] ?? [];
                    
                    foreach ($pages as $page) {
                        if (isset($page['extract']) && !empty($page['extract'])) {
                            return [
                                'title' => $page['title'] ?? $historyTitle,
                                'extract' => $page['extract'],
                                'thumbnail' => $page['thumbnail']['source'] ?? null
                            ];
                        }
                    }
                }
                
                return $this->getGeneralWikipediaInfo($countryName);
                
            } catch (\Exception $e) {
                return [
                    'error' => 'Failed to fetch Wikipedia information',
                    'message' => $e->getMessage()
                ];
            }
        });
    }

    private function getGeneralWikipediaInfo($countryName)
    {
        $response = Http::get('https://en.wikipedia.org/w/api.php', [
            'action' => 'query',
            'format' => 'json',
            'prop' => 'extracts|pageimages',
            'exintro' => 1,
            'explaintext' => 1,
            'titles' => $countryName,
            'piprop' => 'thumbnail',
            'pithumbsize' => 400,
            'redirects' => 1
        ]);

        if ($response->successful()) {
            $data = $response->json();
            $pages = $data['query']['pages'] ?? [];
            
            foreach ($pages as $page) {
                if (isset($page['extract']) && !empty($page['extract'])) {
                    return [
                        'title' => $page['title'] ?? $countryName,
                        'extract' => $page['extract'],
                        'thumbnail' => $page['thumbnail']['source'] ?? null
                    ];
                }
            }
        }

        return [
            'title' => $countryName,
            'extract' => 'No information available',
            'thumbnail' => null
        ];
    }

    private function getWorldBankStats($countryCode)
    {
        $cacheKey = "worldbank_{$countryCode}";
        
        return Cache::remember($cacheKey, 3600, function() use ($countryCode) {
            try {
                $iso3Code = $this->convertToISO3($countryCode);
                
                $indicators = [
                    'population' => 'SP.POP.TOTL',
                    'gdp' => 'NY.GDP.MKTP.CD',
                    'gdp_per_capita' => 'NY.GDP.PCAP.CD',
                    'life_expectancy' => 'SP.DYN.LE00.IN',
                    'unemployment' => 'SL.UEM.TOTL.ZS'
                ];

                $stats = [];
                
                foreach ($indicators as $key => $indicator) {
                    $response = Http::get("https://api.worldbank.org/v2/country/{$iso3Code}/indicator/{$indicator}", [
                        'format' => 'json',
                        'per_page' => 5,
                        'date' => '2018:2023'
                    ]);

                    if ($response->successful()) {
                        $data = $response->json();
                        if (isset($data[1]) && is_array($data[1])) {
                            foreach ($data[1] as $entry) {
                                if ($entry['value'] !== null) {
                                    $stats[$key] = [
                                        'value' => $entry['value'],
                                        'year' => $entry['date']
                                    ];
                                    break;
                                }
                            }
                        }
                    }
                }

                return $stats;
                
            } catch (\Exception $e) {
                return [
                    'error' => 'Failed to fetch World Bank statistics',
                    'message' => $e->getMessage()
                ];
            }
        });
    }

    private function formatCountryName($country)
    {
        return str_replace(' ', '_', $country);
    }

    private function convertToISO3($code)
    {
        if (strlen($code) === 3) {
            return strtoupper($code);
        }

        $iso2ToIso3 = [
            'US' => 'USA', 'GB' => 'GBR', 'FR' => 'FRA', 'DE' => 'DEU',
            'IT' => 'ITA', 'ES' => 'ESP', 'CA' => 'CAN', 'AU' => 'AUS',
            'JP' => 'JPN', 'CN' => 'CHN', 'IN' => 'IND', 'BR' => 'BRA',
            'MX' => 'MEX', 'AR' => 'ARG', 'CL' => 'CHL', 'CO' => 'COL',
            'PE' => 'PER', 'VE' => 'VEN', 'RU' => 'RUS', 'ZA' => 'ZAF',
            'EG' => 'EGY', 'NG' => 'NGA', 'KE' => 'KEN', 'GH' => 'GHA'
        ];

        return $iso2ToIso3[strtoupper($code)] ?? strtoupper($code);
    }
        private function getCountryNews($countryName)
    {
        $cacheKey = "news_{$countryName}";
        
        return Cache::remember($cacheKey, 1800, function() use ($countryName) { 
            try {
                $apiKey = config('services.news_api.key');
                if (!$apiKey) {
                    return ['error' => 'News API key not configured'];
                }

                $response = Http::get('https://newsapi.org/v2/everything', [
                    'q' => $countryName,
                    'sortBy' => 'publishedAt',
                    'pageSize' => 10,
                    'apiKey' => $apiKey,
                    'language' => 'en'
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    return [
                        'status' => $data['status'],
                        'totalResults' => $data['totalResults'],
                        'articles' => $data['articles']
                    ];
                }

                return [
                    'error' => 'Failed to fetch news',
                    'status' => $response->status()
                ];
                
            } catch (\Exception $e) {
                return [
                    'error' => 'Failed to fetch news',
                    'message' => $e->getMessage()
                ];
            }
        });
    }

    private function getCountryWeather($cityName)
    {
        $cacheKey = "weather_{$cityName}";
        
        return Cache::remember($cacheKey, 1800, function() use ($cityName) { 
            try {
                $apiKey = config('services.weather.key');
                if (!$apiKey) {
                    return ['error' => 'Weather API key not configured'];
                }

                $startDate = now()->subDay()->format('Y-m-d');
                $endDate = now()->addDays(6)->format('Y-m-d');

                $response = Http::get("https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/{$cityName}/{$startDate}/{$endDate}", [
                    'key' => $apiKey,
                    'unitGroup' => 'metric',
                    'include' => 'days'
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    return [
                        'location' => $data['resolvedAddress'] ?? $cityName,
                        'timezone' => $data['timezone'] ?? null,
                        'days' => $data['days'] ?? []
                    ];
                }

                return [
                    'error' => 'Failed to fetch weather data',
                    'status' => $response->status()
                ];
                
            } catch (\Exception $e) {
                return [
                    'error' => 'Failed to fetch weather',
                    'message' => $e->getMessage()
                ];
            }
        });
    }

}
