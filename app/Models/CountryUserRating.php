<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CountryUserRating extends Model
{
    protected $table = 'country_user_ratings';
    protected $fillable = ['user_id', 'country_code', 'rating', 'review'];

    protected static function booted()
    {
        static::saved(function ($rating) {
            self::updateCountryRating($rating->country_code);
        });

        static::deleted(function ($rating) {
            self::updateCountryRating($rating->country_code);
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    protected static function updateCountryRating($countryCode)
    {
        $media = CountryUserRating::where('country_code', $countryCode)->avg('rating');

        CountryRating::updateOrCreate(
            ['country_code' => $countryCode],
            ['rating' => $media]
        );
    }
}
