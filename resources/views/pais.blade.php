@extends('layouts.app')
@section('styles')
<link rel="stylesheet" href="{{ asset('css/pais.css') }}">
<link rel="stylesheet" href="https://unpkg.com/easymde/dist/easymde.min.css">
@endsection
@section('contenido')
<div class="pais-container">

    <div class="header-container">

        <div class="pais-header">
            <a href="/" class="btn-volver">&lt; BACK</a>
            <img id="pais-flag" class="pais-flag-placeholder skeleton" />
            <h2 id="pais-nombre"></h2>
        </div>
    </div>

    <div class="tabs-main">
        <button class="tab-button active" data-tab="summary">SUMMARY</button>
    </div>

    <div class="tabs-secondary">
        <button class="tab-button" data-tab="weather">
            <i class="fas fa-cloud-sun"></i> <span class="tab-text">WEATHER</span>
        </button>
        <button class="tab-button" data-tab="history">
            <i class="fas fa-landmark"></i> <span class="tab-text">HISTORY</span>
        </button>
        <button class="tab-button" data-tab="news">
            <i class="fas fa-newspaper"></i> <span class="tab-text">NEWS</span>
        </button>
        <button class="tab-button" data-tab="statistics">
            <i class="fas fa-chart-bar"></i> <span class="tab-text">STATS</span>
        </button>
        <button class="tab-button" data-tab="rating">
            <i class="fa-regular fa-star"></i> <span class="tab-text">RATING</span>
        </button>
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
        <div id="rating" class="tab-content">
            <div id="user-review-section">
            </div>
            <div id="ratings-list">
                <img src="/img/loading.gif" class="cargar" alt="Cargando..." />
            </div>
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

@section('scripts')
<script>
    const countryNameBlade = "{{ $nombre }}";
    document.title = `Country Inspector | ${countryNameBlade}`;
</script>
<script src="{{ asset('js/pais.js') }}"></script>
<script src="{{ asset('js/weather.js') }}"></script>
<script src="{{ asset('js/news.js') }}"></script>
<script src="{{ asset('js/history.js') }}"></script>
<script src="{{ asset('js/statistics.js') }}"></script>
<script src="{{ asset('js/ratings.js') }}"></script>
<script src="https://cdn.jsdelivr.net/npm/easymde/dist/easymde.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>


@endsection
@endsection