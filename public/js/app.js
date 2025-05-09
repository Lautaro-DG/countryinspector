document.addEventListener('DOMContentLoaded', () => {
    const globe = document.getElementById('globe');

    globe.classList.add('hidden');

    window.addEventListener('load', () => {
        setTimeout(() => {
            globe.classList.remove('hidden');
            globe.classList.add('animate__animated', 'animate__zoomIn');
        }, 100);
    });

    // Mapbox
    const map = new mapboxgl.Map({
        container: 'globe',
        style: 'mapbox://styles/mapbox/satellite-v9',
        projection: 'globe',
        zoom: 1.2,
        minZoom: 1,
        maxZoom: 5,
        center: [0, 20],
        interactive: true,
        renderWorldCopies: false,
        maxTileCacheSize: 20,
        attributionControl: false
    });

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'map-tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);

    map.on('load', () => {
        map.addSource('countries', {
            type: 'vector',
            url: 'mapbox://mapbox.country-boundaries-v1'
        });

        map.addLayer({
            id: 'countries-fill',
            type: 'fill',
            source: 'countries',
            'source-layer': 'country_boundaries',
            paint: {
                'fill-color': 'rgba(0, 0, 0, 0.1)',
                'fill-outline-color': 'rgba(0, 0, 0, 0.2)'
            }
        });

        map.addLayer({
            id: 'country-hover',
            type: 'fill',
            source: 'countries',
            'source-layer': 'country_boundaries',
            paint: {
                'fill-color': '#00ffff',
                'fill-opacity': 0.4
            },
            filter: ['==', 'name_en', '']
        });

        map.addLayer({
            id: 'country-outline',
            type: 'line',
            source: 'countries',
            'source-layer': 'country_boundaries',
            paint: {
                'line-color': '#00ffff',
                'line-width': 1.5,
                'line-opacity': 0.6
            }
        });

        let hoverTimeout;
        let hoveredCountry = null;
        let animationFrameId = null;
        
        map.on('mousemove', 'countries-fill', (e) => {
            if (!e.features.length) return;
        
            const nombrePais = e.features[0].properties.name_en;
        
            tooltip.style.display = 'block';
            tooltip.innerText = nombrePais;
            tooltip.style.left = `${e.originalEvent.pageX}px`;
            tooltip.style.top = `${e.originalEvent.pageY - 10}px`;
        
            clearTimeout(hoverTimeout);
            
            hoverTimeout = setTimeout(() => {
                hoveredCountry = nombrePais;
        
                if (!animationFrameId) {
                    animationFrameId = requestAnimationFrame(() => {
                        map.setFilter('country-hover', ['==', 'name_en', hoveredCountry]);
                        animationFrameId = null;
                    });
                }
            }, 15); 
        
            map.getCanvas().style.cursor = 'pointer';
        });
        
        map.on('mouseleave', 'countries-fill', () => {
            clearTimeout(hoverTimeout);
            hoveredCountry = null;
            map.setFilter('country-hover', ['==', 'name_en', '']);
            tooltip.style.display = 'none';
            map.getCanvas().style.cursor = '';
        });
        
        

        map.on('click', 'countries-fill', (e) => {
            if (!e.features.length) return;

            const nombrePais = e.features[0].properties.name_en;
            const nombreFormat = nombrePais.toLowerCase().replace(/\s+/g, '-');
            window.location.href = `/country/${nombreFormat}`;
        });

        map.on('mouseenter', 'countries-fill', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'countries-fill', () => {
            map.getCanvas().style.cursor = '';
        });
    });
});
