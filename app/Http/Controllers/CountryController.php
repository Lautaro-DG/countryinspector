<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Historial;

class CountryController extends Controller
{
    public function show($nombre)
    {
        $this->registrarVisitaPais($nombre);

        $nombre = strtoupper($nombre);

        return view('pais', compact('nombre'));
    }
    public function registrarVisitaPais($pais)
    {
        if (auth()->check()) {
            $paginaVisitada = "/country/{$pais}";

            $historialExistente = auth()->user()->historial()->where('pagina_visitada', $paginaVisitada)->first();

            if ($historialExistente) {
                $historialExistente->delete();
            }

            if (auth()->user()->historial()->count() >= 10) {
                auth()->user()->historial()->oldest('created_at')->first()->delete();
            }

            Historial::create([
                'user_id' => auth()->id(),
                'pagina_visitada' => $paginaVisitada,
            ]);
        }
    }
    public function compare(Request $request)
    {
        $country1ISO = $request->input('country1');
        return view('compare', compact('country1ISO'));
    }
}
