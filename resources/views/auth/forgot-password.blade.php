@extends('layouts.app')

@section('title', 'Country Inspector | Forgot Password')

@section('styles')
<link rel="stylesheet" href="{{ asset('css/forms.css') }}">
@endsection

@section('contenido')
<div class="register wrap">
    <div class="h1">Forgot Password</div>

    <p class="text-sm mb-4 text-gray-300 text-center">
        {{ __('Forgot your password? No problem. Just let us know your email address and we will email you a password reset link that will allow you to choose a new one.') }}
    </p>

    <form class="login-form" method="POST" action="{{ route('password.email') }}">
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

        <!-- Submit -->
        <input value="Send Reset Link" class="btn mt-4" type="submit">
        <div class="forgot-password">
            @if (Route::has('register'))
            <a href="{{ route('register') }}" class="forgot-password-link">
                {{ __('Register') }}
            </a>
            @endif
            <a href="{{ route('login') }}" class="forgot-password-link">
                {{ __('Already registered?') }}
            </a>
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