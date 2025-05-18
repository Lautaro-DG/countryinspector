<?php

namespace Database\Seeders;

use App\Models\CountryUserRating;
use Illuminate\Database\Seeder;

class UserReviewsSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        for ($i = 1; $i <= 50; $i++) {
            CountryUserRating::create([
                'user_id' => $i,
                'country_code' => 'ES',
                'rating' => rand(1, 5),
                'review' => "### Opinión sobre España\nEspaña es un país lleno de cultura, buena comida y clima agradable. ¡Muy recomendable!",
            ]);
        }
    }
}
