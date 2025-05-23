document.addEventListener('DOMContentLoaded', function () {
    const historyIcon = document.getElementById('history-icon');
    const historyModal = document.getElementById('history-modal');
    const closeModal = document.querySelector('.close-modal');
    const historyList = document.getElementById('history-list');
    let isModalOpen = false;

    historyIcon.addEventListener('click', function () {
        cargarHistorialUsuario();
    });

    closeModal.addEventListener('click', function () {
        historyModal.style.display = 'none';
        isModalOpen = false;
    });

    window.addEventListener('click', function (event) {
        if (event.target === historyModal) {
            historyModal.style.display = 'none';
            isModalOpen = false;
        }
    });

    function cargarHistorialUsuario() {
        historyList.innerHTML = '<p class="loading-text"><i class="fas fa-spinner fa-spin"></i> Cargando historial...</p>';

        fetch('/historial', {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            }
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401 || response.status === 403 || (response.redirected && response.url.includes('/login'))) {
                    throw new Error('unauthenticated');
                }
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // ✅ Solo aquí abrimos el modal
                historyModal.style.display = 'block';
                isModalOpen = true;

                if (!document.getElementById('clear-all-history')) {
                    const modalHeader = document.querySelector('.modal-content h2').parentNode;
                    const clearAllBtn = document.createElement('button');
                    clearAllBtn.id = 'clear-all-history';
                    clearAllBtn.className = 'clear-all-btn';
                    clearAllBtn.innerHTML = 'Clear';
                    clearAllBtn.addEventListener('click', borrarTodoHistorial);
                    modalHeader.insertBefore(clearAllBtn, document.querySelector('.modal-content h2').nextSibling);
                }

                historyList.innerHTML = '';

                if (data.historial.length === 0) {
                    historyList.innerHTML = '<p>No records in your history.</p>';
                    return;
                }

                const ul = document.createElement('ul');
                ul.className = 'history-items';

                data.historial.forEach(item => {
                    const li = document.createElement('li');
                    li.className = 'history-item';
                    let countryName = '';
                    let countryUrl = '';
                    if (item.pagina_visitada) {
                        countryUrl = item.pagina_visitada;
                        const urlParts = item.pagina_visitada.split('/');
                        if (urlParts.length >= 3) {
                            countryName = formatCountryName(urlParts[2]);
                        }
                    }

                    li.innerHTML = `
                        <div class="country-flag">
                            <img src="/api/placeholder/24/16" alt="Flag" class="flag-img skeleton">
                        </div>
                        <div class="country-name">${countryName || 'País desconocido'}</div>
                        <div class="visit-date">${formatDate(item.created_at)}</div>
                        <div class="delete-icon">
                            <i class="fas fa-times" title="Eliminar del historial"></i>
                        </div>
                    `;

                    li.dataset.historialId = item.id;

                    if (countryName) {
                        const apiCountryName = item.pagina_visitada.split('/')[2];
                        const optimizedName = optimizeCountryNameForApi(apiCountryName);

                        fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(optimizedName)}?fullText=true`)
                            .then(response => {
                                if (!response.ok) {
                                    return fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(optimizedName)}`);
                                }
                                return response;
                            })
                            .then(response => response.json())
                            .then(data => {
                                const flagImg = li.querySelector('.flag-img');
                                if (data[0]?.flags) {
                                    flagImg.src = data[0].flags.svg || data[0].flags.png;
                                    flagImg.classList.remove('skeleton');
                                    flagImg.alt = `Bandera de ${countryName}`;
                                }
                            })
                            .catch(err => console.warn(`No se pudo cargar la bandera para ${countryName}`, err));
                    }

                    li.addEventListener('click', function (e) {
                        if (!e.target.closest('.delete-icon') && countryUrl) {
                            window.location.href = countryUrl;
                        }
                    });

                    li.querySelector('.delete-icon').addEventListener('click', function (e) {
                        e.stopPropagation();
                        borrarHistorial(li.dataset.historialId, li);
                    });

                    ul.appendChild(li);
                });

                historyList.appendChild(ul);
            } else {
                historyList.innerHTML = '<p>Error al cargar el historial.</p>';
            }
        })
        .catch(error => {
            if (error.message === 'unauthenticated') {
                toastr.warning('Debes iniciar sesión para ver tu historial.', 'Acceso restringido');
            } else {
                toastr.error('Ocurrió un error al cargar el historial.', 'Error');
            }
            historyList.innerHTML = '';
        });
    }


    /* Formatear fechas */
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    /* Formatear el nombre del país */
    function formatCountryName(countryName) {
        if (!countryName) return '';

        const words = countryName.split('-');

        return words.map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }

    /* Optimiza el nombre del país para la API de RestCountries */
    function optimizeCountryNameForApi(countryName) {
        const countryMappings = {
            'usa': 'united states',
            'united-states': 'united states',
            'uk': 'united kingdom',
            'great-britain': 'united kingdom',
            'england': 'united kingdom',
            'russia': 'russian federation',
            'north-korea': 'korea (democratic people\'s republic of)',
            'south-korea': 'korea (republic of)',
            'uae': 'united arab emirates',
            'congo-brazzaville': 'congo',
            'congo-kinshasa': 'congo (democratic republic of the)',
            'drc': 'congo (democratic republic of the)',
            'ivory-coast': 'côte d\'ivoire',
            'myanmar': 'burma',
            'macedonia': 'north macedonia',
            'taiwan': 'taiwan, province of china',
            'palestine': 'palestine, state of',
            'east-timor': 'timor-leste',
            'bosnia': 'bosnia and herzegovina',
            'vatican-city': 'holy see'
        };

        const lowerCaseName = countryName.toLowerCase();

        if (countryMappings[lowerCaseName]) {
            return countryMappings[lowerCaseName];
        }

        return lowerCaseName.replace(/-/g, ' ');
    }

    /* Función para borrar un elemento del historial */
    function borrarHistorial(historialId, elementoLi) {

        elementoLi.classList.add('fading-out');

        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        fetch(`/historial/${historialId}`, {
            method: 'DELETE',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                '_token': csrfToken,
                'id': historialId
            })
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        console.error('Error en la respuesta:', text);
                        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    setTimeout(() => {
                        elementoLi.remove();

                        const historialItems = document.querySelectorAll('.history-items li');
                        if (historialItems.length === 0) {
                            document.getElementById('history-list').innerHTML = '<p>No records in your history.</p>';
                        }
                    }, 300);
                } else {
                    elementoLi.classList.remove('fading-out');
                    console.error('Error al borrar:', data.message || 'No se pudo eliminar el elemento');
                    alert('No se pudo eliminar el elemento del historial');
                }
            })
            .catch(error => {
                console.error('Error al borrar el historial:', error);
                elementoLi.classList.remove('fading-out');
                alert('Error al comunicarse con el servidor. Por favor, inténtalo de nuevo.');
            });
    }

    /* Función para borrar todo el historial */
    function borrarTodoHistorial() {

        fetch('/historial', {
            method: 'DELETE',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('history-list').innerHTML = '<p>No records in your history.</p>';
                }
            })
            .catch(error => {
                console.error('Error al borrar todo el historial:', error);
            });
    }


});