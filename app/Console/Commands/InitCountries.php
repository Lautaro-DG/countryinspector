<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\CountryRating;

class InitCountries extends Command
{
    protected $signature = 'init:country-ratings';
    protected $description = 'Importa países y crea registros en country_ratings con rating vacío';

    public function handle()
    {
        $this->info('Importando países para country_ratings...');

        $response = Http::get('https://restcountries.com/v3.1/all');

        if ($response->failed()) {
            $this->error('Error al obtener países');
            return 1;
        }

        $countries = $response->json();

        $count = 0;
        foreach ($countries as $country) {
            $name = $country['name']['common'] ?? null;
            $cca2 = $country['cca2'] ?? null;

            if ($name && $cca2) {
                CountryRating::updateOrCreate(
                    ['country_code' => $cca2],
                    ['country_name' => $name, 'rating' => 0]
                );
                $count++;
            }
        }

        $this->info("Países importados: {$count}");
        return 0;
    }
}
