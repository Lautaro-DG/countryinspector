@extends('layouts.app')
@section('styles')
<link rel="stylesheet" href="{{ asset('css/compare.css') }}">
<link rel="stylesheet" href="https://unpkg.com/easymde/dist/easymde.min.css">
@endsection
@section('contenido')
    <a href="#" onclick="history.back(); return false;" class="btn-volver">&lt; BACK</a>

<input type="hidden" id="country1" value="{{$country1ISO}}">
<div class="content">
    <div class="comparison-container">
        <div class="header">
            <h1>Country Comparison</h1>
            <p>Compare countries side by side with detailed statistics</p>
        </div>

        <div class="comparison-grid">
            <div class="country-panel">
                <div class="country-header">
                    <div class="flag-container">
                        <div class="flag-skeleton" id="flag1-skeleton"></div>
                        <img id="flag1" style="display: none;" alt="Country 1 Flag">
                    </div>
                    <div class="country-name" id="country1-name"></div>
                    <div class="country-iso" id="country1-iso"></div>
                </div>

                <div class="search-container">
                    <input type="text" class="search-input" id="country-search-1" placeholder="Search for a country...">
                    <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <div class="search-results" id="search-results-1"></div>
                </div>

                <div class="stats-container" id="stats1">
                    <div class="empty-state" id="empty-state-1">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                        <h3>Select a Country</h3>
                        <p>Search and select a country above to start comparing</p>
                    </div>
                </div>
            </div>

            <div class="country-panel">
                <div class="country-header">
                    <div class="flag-container">
                        <div class="flag-skeleton" id="flag2-skeleton" style="display: none;"></div>
                        <img id="flag2" style="display: none;" alt="Country 2 Flag">
                    </div>
                    <div class="country-name" id="country2-name"></div>
                    <div class="country-iso" id="country2-iso"></div>
                </div>
                <div class="search-container">
                    <input type="text" class="search-input" id="country-search-2" placeholder="Search for a country to compare...">
                    <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <div class="search-results" id="search-results-2"></div>
                </div>

                <div class="stats-container" id="stats2">
                    <div class="empty-state" id="empty-state-2">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                        <h3>Select a Country</h3>
                        <p>Search and select a country above to start comparing</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="vs-divider">VS</div>
    </div>
</div>
@section('scripts')
<script src="{{ asset('js/compare.js') }}"></script>
@endsection
@endsection