<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Historial;
class HistorialController extends Controller
{

    public function userHistory()
    {
        $historial = auth()->user()->historial()->latest()->take(10)->get();
        return response()->json([
            'success' => true,
            'historial' => $historial,
        ]);
    }
 public function deleteHistory(Request $request)
    {
        $request->validate([
            'id' => 'required|integer|exists:historial,id'
        ]);

        $historial = Historial::where('id', $request->id)
            ->where('user_id', auth()->id())
            ->first();

        if (!$historial) {
            return response()->json([
                'success' => false,
                'message' => 'No se encontró el registro o no tienes permiso para borrarlo'
            ], 403);
        }

        $historial->delete();

        return response()->json([
            'success' => true,
            'message' => 'Registro borrado correctamente'
        ]);
    }

    public function deleteAllHistory()
    {
        $count = auth()->user()->historial()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Se han borrado ' . $count . ' registros del historial',
            'count' => $count
        ]);
    }
}