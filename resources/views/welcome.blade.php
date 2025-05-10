@extends('layouts.app')

@section('styles')

<link rel="stylesheet" href="{{ asset('css/welcome.css') }}">

@endsection
@section('contenido')
<div>
    <input type="text" id="search-input" class="search-input" placeholder="Search for a country...">
</div>
<div class="globe-container" id="globe"></div>
<div class="map-attribution">
    © <a href="https://github.com/Lautaro-DG" target="_blank" rel="noopener">Lautaro De Giovanni - 2025</a> |
    © <a href="https://www.mapbox.com/" target="_blank" rel="noopener">Mapbox</a> |
    © <a href="https://www.openstreetmap.org/copyright/" target="_blank" rel="noopener">OpenStreetMap</a> |
    © <a href="https://www.maxar.com/" target="_blank" rel="noopener">Maxar</a> |
    <a href="https://apps.mapbox.com/feedback/" target="_blank" rel="noopener">Improve this map</a>
</div>
@section('scripts')
<script src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"></script>
    <script>
        mapboxgl.accessToken = '{{ env("MAPBOX_TOKEN") }}';
    </script>
    <script src="{{ asset('js/app.js') }}"></script>
@endsection
@endsection