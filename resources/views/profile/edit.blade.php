@extends('layouts.app')
@section('title', 'Country Inspector | Profile')

@section('styles')
<link rel="stylesheet" href="{{ asset('css/user.css') }}">
@endsection
@section('contenido')
<div class="container mx-auto p-4">
    <div class="max-w-2xl mx-auto bg-white shadow rounded-lg p-6">
        <h2 class="text-2xl font-bold mb-4">My Profile</h2>

        <div class="mb-6">
            <p><strong>Name:</strong> {{ $user->name }}</p>
            <p><strong>Email:</strong> {{ $user->email }}</p>
        </div>

        <hr class="my-6">

        <div class="mb-6">
            <h3 class="text-xl font-semibold mb-3">Recently Visited Countries</h3>
            @if($historial->isEmpty())
                <p class="text-gray-600">No visited countries yet.</p>
            @else
                <ul class="list-disc list-inside text-gray-800">
                    @foreach($historial as $item)
                        <li>
                            <a href="{{ $item->pagina_visitada }}" class="text-blue-500 hover:underline">
                                {{ \Illuminate\Support\Str::headline(last(explode('/', $item->pagina_visitada))) }}
                            </a> - <small class="text-gray-500">{{ $item->created_at->diffForHumans() }}</small>
                        </li>
                    @endforeach
                </ul>
            @endif
        </div>

        <div>
            <h3 class="text-xl font-semibold mb-3">Last 5 Reviews</h3>
            @if($reviews->isEmpty())
                <p class="text-gray-600">No reviews yet.</p>
            @else
                <ul class="divide-y divide-gray-200">
                    @foreach($reviews as $review)
                        <li class="py-2">
                            <p class="text-gray-800">{{ $review->content }}</p>
                            <small class="text-gray-500">{{ $review->created_at->diffForHumans() }}</small>
                        </li>
                    @endforeach
                </ul>
            @endif
        </div>
    </div>
</div>
@endsection
