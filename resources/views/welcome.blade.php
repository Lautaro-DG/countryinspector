@extends('layouts.app') 

@section('styles') 
<meta name="csrf-token" content="{{ csrf_token() }}">
<link rel="stylesheet" href="{{ asset('css/welcome.css') }}">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
@endsection 

@section('contenido') 
<div class="search-container">
    <input type="text" id="search-input" class="search-input" placeholder="Search for a country..." autocomplete="off">
    <i class="fas fa-history history-icon" id="history-icon"></i>
</div>

<div class="globe-container" id="globe"></div>

<div class="map-attribution">
    © <a href="https://github.com/Lautaro-DG" target="_blank" rel="noopener">Lautaro De Giovanni - 2025</a> | 
    © <a href="https://www.mapbox.com/" target="_blank" rel="noopener">Mapbox</a> | 
    © <a href="https://www.openstreetmap.org/copyright/" target="_blank" rel="noopener">OpenStreetMap</a> | 
    © <a href="https://www.maxar.com/" target="_blank" rel="noopener">Maxar</a> | 
    <a href="https://apps.mapbox.com/feedback/" target="_blank" rel="noopener">Improve this map</a>
</div>

<div id="history-modal" class="history-modal">
    <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h2>Visited Countries</h2>
        <div id="history-list">
        </div>
    </div>
</div>

@section('scripts') 
<script src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"></script> 
<script> 
    mapboxgl.accessToken = '{{ env("MAPBOX_TOKEN") }}'; 
</script> 
<script src="{{ asset('js/app.js') }}"></script>
<script src="{{ asset('js/user_history.js') }}"></script>
@endsection 
@endsection