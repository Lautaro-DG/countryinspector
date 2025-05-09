<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CountryController extends Controller
{
    public function show($nombre)
    {
        $nombre = strtoupper($nombre);
        return view('pais', compact('nombre'));
    }
}
