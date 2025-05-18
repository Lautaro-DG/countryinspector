@extends('layouts.app')

@section('title', 'Country Inspector | Login')

@section('styles')
<link rel="stylesheet" href="{{ asset('css/forms.css') }}">
@endsection

@section('contenido')
<!-- Session Status -->
@if(session('status'))
<div class="session-status">{{ session('status') }}</div>
@endif

<div class="login wrap">
    <div class="h1">Login</div>

    <form class="login-form" method="POST" action="{{ route('login') }}">
        @csrf

        <!-- Email Address -->
        <input
            id="email"
            type="text"
            name="email"
            value="{{ old('email') }}"
            placeholder="Email"
            required
            autofocus
            autocomplete="username"
            pattern="^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$">

        <!-- Password -->
        <input
            id="password"
            type="password"
            name="password"
            placeholder="Password"
            required
            autocomplete="current-password">

        <!-- Submit -->
        <input value="Login" class="btn" type="submit">
        <!-- Forgot Password -->
        <div class="forgot-password">
            @if (Route::has('register'))
            <a href="{{ route('register') }}" class="forgot-password-link">
                {{ __('Register') }}
            </a>
            @endif
            @if (Route::has('password.request'))
            <a href="{{ route('password.request') }}" class="forgot-password-link">
                {{ __('Forgot password?') }}
            </a>
            @endif
        </div>
    </form>
</div>
@endsection

@section('scripts')
<script>
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) {
        toastr.options = {
            progressBar: true,
            timeOut: 5000,
            extendedTimeOut: 2000,
            positionClass: 'toast-top-center'
        }
    } else {
        toastr.options = {
            progressBar: true,
            timeOut: 5000,
            extendedTimeOut: 2000,
            positionClass: 'toast-top-right'
        }
    }

    @if($errors -> any())
    @foreach($errors -> all() as $error)
    toastr.error("{{ $error }}", "Error", {
        closeButton: true,
        progressBar: true,
        timeOut: 5000,
    });
    @endforeach
    @endif

    @if(session('status'))
    toastr.info("{{ session('status') }}", "Info", {
        closeButton: true,
        progressBar: true,
    });
    @endif

    @if(session('success'))
    toastr.success("{{ session('success') }}", "Éxito", {
        closeButton: true,
        progressBar: true,
    });
    @endif
</script>

@endsection