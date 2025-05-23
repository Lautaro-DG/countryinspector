<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
           Schema::create('country_ratings', function (Blueprint $table) {
            $table->id();
            $table->string('country_code', 2)->unique(); 
            $table->string('country_name');
            $table->float('rating')->default(0)->nullable();; 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('country_ratings');
    }
};
