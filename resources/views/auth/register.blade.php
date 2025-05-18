@extends('layouts.app')

@section('title', 'Country Inspector | Register')

@section('styles')
<link rel="stylesheet" href="{{ asset('css/forms.css') }}">
@endsection

@section('contenido')
<div class="register wrap">
    <div class="h1">Register</div>

    <form class="login-form" method="POST" action="{{ route('register') }}">
        @csrf

        <!-- Name -->
        <input
            id="name"
            type="text"
            name="name"
            placeholder="Name"
            value="{{ old('name') }}"
            required
            autofocus
            autocomplete="name">
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
            autocomplete="new-password">

        <!-- Confirm Password -->
        <input
            id="password_confirmation"
            type="password"
            name="password_confirmation"
            placeholder="Confirm Password"
            required
            autocomplete="new-password">

        <!-- Submit -->
        <input value="Register" class="btn" type="submit">

        <!-- Already registered -->
        <a href="{{ route('login') }}" class="forgot-password-link">
            {{ __('Already registered?') }}
        </a>
    </form>
</div>
@endsection

@section('scripts')
<script>
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if(isMobile) {
        toastr.options = {
            progressBar: true,
            timeOut: 5000,
            extendedTimeOut: 2000,
            positionClass: 'toast-top-center'
        }
    } else{
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