<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CountryRating extends Model
{
    protected $table = 'country_ratings';
    protected $fillable = [
        'country_code',
        'country_name',
        'rating',
    ];
}
