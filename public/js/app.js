document.addEventListener('DOMContentLoaded', () => {
    const globe = document.getElementById('globe');
    const searchInput = document.getElementById('search-input');
    let countryList = [];
    let hoverDisabled = false;

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

    // Lista de sugerencias para la búsqueda
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'suggestions-container';
    suggestionsContainer.style.display = 'none';
    const inputContainer = searchInput.parentNode;
    inputContainer.style.position = 'relative';
    inputContainer.appendChild(suggestionsContainer);

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

        map.querySourceFeatures('countries', { sourceLayer: 'country_boundaries' }).forEach(feature => {
            if (feature.properties.name_en && !countryList.includes(feature.properties.name_en)) {
                countryList.push(feature.properties.name_en);
            }
        });

        if (countryList.length === 0) {
            fetchCountriesFromMap();
        }

        let hoverTimeout;
        let hoveredCountry = null;
        let animationFrameId = null;

        map.on('mousemove', 'countries-fill', (e) => {
            if (!e.features.length || hoverDisabled) return;

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
            if (hoverDisabled) return;

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
            if (!hoverDisabled) {
                map.getCanvas().style.cursor = 'pointer';
            }
        });

        map.on('mouseleave', 'countries-fill', () => {
            if (!hoverDisabled) {
                map.getCanvas().style.cursor = '';
            }
        });
    });

    // Obtener países después de que el mapa se cargue por completo
    function fetchCountriesFromMap() {
        const checkForCountries = setInterval(() => {
            const features = map.querySourceFeatures('countries', { sourceLayer: 'country_boundaries' });

            features.forEach(feature => {
                if (feature.properties.name_en && !countryList.includes(feature.properties.name_en)) {
                    countryList.push(feature.properties.name_en);
                }
            });

            if (countryList.length > 0) {
                clearInterval(checkForCountries);
                countryList.sort();
            }
        }, 1000);
    }

    // Función para deshabilitar temporalmente el hover
    function disableHoverTemporarily(duration) {
        hoverDisabled = true;
        setTimeout(() => {
            hoverDisabled = false;
        }, duration);
    }

    // Funcionalidad de búsqueda
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        suggestionsContainer.innerHTML = '';

        if (searchTerm.length < 2) {
            suggestionsContainer.style.display = 'none';
            if (!hoverDisabled) {
                map.setFilter('country-hover', ['==', 'name_en', '']);
            }
            return;
        }

        // Actualizar posición de las sugerencias
        const inputRect = searchInput.getBoundingClientRect();
        suggestionsContainer.style.top = inputRect.height + 'px';
        suggestionsContainer.style.width = inputRect.width + 'px';

        const filteredCountries = countryList.filter(country =>
            country.toLowerCase().includes(searchTerm)
        ).slice(0, 5);

        if (filteredCountries.length > 0) {
            suggestionsContainer.style.display = 'block';
            suggestionsContainer.style.color = '#333';

            filteredCountries.forEach(country => {
                const suggestionItem = document.createElement('div');
                suggestionItem.className = 'suggestion-item';
                suggestionItem.innerText = country;

                suggestionItem.addEventListener('click', () => {
                    searchInput.value = country;
                    suggestionsContainer.style.display = 'none';

                    // Resaltar el país seleccionado
                    map.setFilter('country-hover', ['==', 'name_en', country]);

                    // Deshabilitar el hover por 3 segundos
                    disableHoverTemporarily(1500);

                    const features = map.querySourceFeatures('countries', {
                        sourceLayer: 'country_boundaries',
                        filter: ['==', 'name_en', country]
                    });

                    if (features.length > 0) {
                        const bounds = new mapboxgl.LngLatBounds();

                        features.forEach(feature => {
                            if (feature.geometry && feature.geometry.coordinates) {
                                if (feature.geometry.type === 'Polygon') {
                                    feature.geometry.coordinates[0].forEach(coord => {
                                        bounds.extend(coord);
                                    });
                                } else if (feature.geometry.type === 'MultiPolygon') {
                                    feature.geometry.coordinates.forEach(polygon => {
                                        polygon[0].forEach(coord => {
                                            bounds.extend(coord);
                                        });
                                    });
                                }
                            }
                        });

                        if (!bounds.isEmpty()) {
                            map.fitBounds(bounds, {
                                padding: 50,
                                maxZoom: 3,
                                duration: 1000,
                                essential: true
                            });
                        }
                    }
                });

                suggestionsContainer.appendChild(suggestionItem);
            });
        } else {
            suggestionsContainer.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target !== searchInput && e.target !== suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }
    });

    searchInput.addEventListener('keydown', (e) => {
        const suggestions = suggestionsContainer.querySelectorAll('.suggestion-item');

        if (suggestions.length === 0) return;

        const current = suggestionsContainer.querySelector('.suggestion-item.active');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!current) {
                suggestions[0].classList.add('active');
            } else {
                const next = current.nextElementSibling;
                if (next) {
                    current.classList.remove('active');
                    next.classList.add('active');
                }
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (current) {
                const prev = current.previousElementSibling;
                if (prev) {
                    current.classList.remove('active');
                    prev.classList.add('active');
                }
            } else {
                suggestions[suggestions.length - 1].classList.add('active');
            }
        } else if (e.key === 'Enter') {
            if (current) {
                e.preventDefault();

                const countryName = current.innerText;
                map.setFilter('country-hover', ['==', 'name_en', countryName]);
                disableHoverTemporarily(3000);

                current.click();
            }
        } else if (e.key === 'Escape') {
            suggestionsContainer.style.display = 'none';
        }
    });
});