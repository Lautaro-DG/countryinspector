@extends('layouts.app')

@section('title', 'Country Inspector | Reset Password')

@section('styles')
<link rel="stylesheet" href="{{ asset('css/forms.css') }}">
@endsection

@section('contenido')
    <div class="login wrap">
        <div class="h1">Reset Password</div>

        <form class="login-form" method="POST" action="{{ route('password.store') }}">
            @csrf

            <!-- Password Reset Token -->
            <input type="hidden" name="token" value="{{ $request->route('token') }}">

            <!-- Email Address -->
             <input
            id="email"
            type="text"
            name="email"
                value="{{ old('email', $request->email) }}"
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
                placeholder="New Password"
                required
                autocomplete="new-password"
            >

            <!-- Confirm Password -->
            <input
                id="password_confirmation"
                type="password"
                name="password_confirmation"
                placeholder="Confirm Password"
                required
                autocomplete="new-password"
            >

            <!-- Submit -->
            <input value="Reset Password" class="btn mt-4" type="submit">
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