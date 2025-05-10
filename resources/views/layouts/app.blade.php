<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Country Inspector</title>
    @yield('styles')
    <link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Geologica:wght@900&display=swap" rel="stylesheet">

</head>
<style>
    .background-video {
        position: fixed;
        top: 50%;
        left: 50%;
        min-width: 100%;
        min-height: 100%;
        transform: translate(-50%, -50%);
        object-fit: cover;
        z-index: -1;
        filter: saturate(70%);
    }
</style>

<body>
    <!-- Video loop de fondo -->
    <video autoplay muted loop class="background-video" id="video">
        <source src="{{ asset('videos/fondo-espacio.webm') }}" type="video/webm">
    </video>

    <div class="content">
        <div class="countryinspectorsombra">
            <a href="/"><img src="{{ asset('img/countryinspectorlogo.png') }}" alt="Country Inspector Logo" class="countryinspectorlogo"></img></a>
        </div>
        @yield('contenido')
    </div>

    @yield('scripts')

    <script>
        const video = document.getElementById('video');
        video.playbackRate = 0.70;
    </script>
</body>

</html>