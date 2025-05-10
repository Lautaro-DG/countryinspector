@extends('layouts.app')
@section('styles')
<link rel="stylesheet" href="{{ asset('css/pais.css') }}">
@endsection
@section('contenido')
<div class="pais-container">

    <div class="header-container">

        <div class="pais-header">
            <a href="/" class="btn-volver">&lt; VOLVER</a>
            <img id="pais-flag" class="pais-flag-placeholder skeleton" />
            <h2 id="pais-nombre"></h2>
        </div>
    </div>

    <div class="tabs-main">
        <button class="tab-button active" data-tab="summary">SUMMARY</button>
    </div>

    <div class="tabs-secondary">
        <button class="tab-button" data-tab="weather">WEATHER</button>
        <button class="tab-button" data-tab="history">HISTORY</button>
        <button class="tab-button" data-tab="news">NEWS</button>
        <button class="tab-button" data-tab="statistics">STATS</button>
    </div>

    <div class="content-panel">
        <div id="summary" class="tab-content active">
            <img src="/img/loading.gif" class="cargar" alt="Cargando..." />
        </div>
        <div id="weather" class="tab-content">
            <img src="/img/loading.gif" class="cargar" alt="Cargando..." />
        </div>
        <div id="history" class="tab-content">
            <img src="/img/loading.gif" class="cargar" alt="Cargando..." />
        </div>
        <div id="news" class="tab-content">
            <img src="/img/loading.gif" class="cargar" alt="Cargando..." />
        </div>
        <div id="statistics" class="tab-content">
            <img src="/img/loading.gif" class="cargar" alt="Cargando..." />
        </div>
    </div>

    <div class="action-bar">
        <button class="btn-comparar">COMPARAR</button>
    </div>
</div>
<!-- Modal para el clima -->
<div id="weather-modal" class="modal hidden">
    <div class="modal-content">
        <div id="modal-body" class="modal-inner-content">
        </div>
    </div>
</div>


<script>
    const countryNameBlade = "{{ $nombre }}";
</script>
<script src="{{ asset('js/pais.js') }}"></script>
<script src="{{ asset('js/weather.js') }}"></script>
<script src="{{ asset('js/news.js') }}"></script>

@endsection