// Añade este código a tu archivo public/js/app.js

document.addEventListener('DOMContentLoaded', function() {
    // Obtén elementos del DOM
    const historyIcon = document.getElementById('history-icon');
    const historyModal = document.getElementById('history-modal');
    const closeModal = document.querySelector('.close-modal');
    const historyList = document.getElementById('history-list');
    
    let isModalOpen = false;

    historyIcon.addEventListener('click', function() {
        cargarHistorialUsuario();
        
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
    });

    closeModal.addEventListener('click', function() {
        historyModal.style.display = 'none';
        isModalOpen = false;
    });

    // Cerrar el modal si se hace clic fuera de él
    window.addEventListener('click', function(event) {
        if (event.target === historyModal) {
            historyModal.style.display = 'none';
            isModalOpen = false;
        }
    });

    /**
     * Función para cargar el historial del usuario mediante AJAX
     */
    function cargarHistorialUsuario() {
        // Mostrar indicador de carga
        historyList.innerHTML = '<p class="loading-text"><i class="fas fa-spinner fa-spin"></i> Cargando historial...</p>';

        // Realizar solicitud AJAX
        fetch('/historial', {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Limpiar el contenedor del historial
                historyList.innerHTML = '';

                // Comprobar si hay elementos en el historial
                if (data.historial.length === 0) {
                    historyList.innerHTML = '<p>No hay registros en tu historial.</p>';
                    return;
                }

                // Crear lista de elementos del historial
                const ul = document.createElement('ul');
                ul.className = 'history-items';

                // Añadir cada elemento del historial a la lista
                data.historial.forEach(item => {
                    const li = document.createElement('li');
                    li.className = 'history-item';
                    
                    // Extraer el nombre del país de la URL (formato: "/country/portugal")
                    let countryName = '';
                    let countryUrl = '';
                    if (item.pagina_visitada) {
                        countryUrl = item.pagina_visitada; // Guardar la URL completa
                        // Dividir la URL por '/' y obtener el último segmento
                        const urlParts = item.pagina_visitada.split('/');
                        if (urlParts.length >= 3) {
                            countryName = urlParts[2]; // El país está después de la segunda barra
                            // Formatear el nombre del país (reemplazar guiones por espacios y capitalizar)
                            countryName = formatCountryName(countryName);
                        }
                    }

                    // Crear el contenido del elemento de la lista con un marcador de posición para la bandera y botón de eliminar
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
                    
                    // Asignar el ID del historial como atributo de datos
                    li.dataset.historialId = item.id;
                    
                    // Cargar la bandera del país usando la API de RestCountries
                    if (countryName) {
                        // Obtener el nombre del país en formato original para la API
                        const apiCountryName = item.pagina_visitada.split('/')[2];
                        
                        // Optimizar nombre para la API de RestCountries
                        const optimizedName = optimizeCountryNameForApi(apiCountryName);
                        
                        fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(optimizedName)}?fullText=true`)
                            .then(response => {
                                if (!response.ok) {
                                    // Intentar de nuevo sin fullText para países con nombres complejos
                                    return fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(optimizedName)}`);
                                }
                                return response;
                            })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('País no encontrado');
                                }
                                return response.json();
                            })
                            .then(data => {
                                if (data && data[0] && data[0].flags) {
                                    const flagImg = li.querySelector('.flag-img');
                                    flagImg.src = data[0].flags.svg || data[0].flags.png;
                                    flagImg.classList.remove('skeleton');
                                    flagImg.alt = `Bandera de ${countryName}`;
                                }
                            })
                            .catch(error => {
                                console.warn(`No se pudo cargar la bandera para ${countryName}:`, error);
                                // Mantener la imagen placeholder si hay error
                            });
                    }
                    
                    // Añadir evento de clic para ir directamente a la página del país
                    li.addEventListener('click', function(e) {
                        // Evitar que el clic se propague si se hizo en el botón de eliminar
                        if (e.target.closest('.delete-icon')) {
                            return;
                        }
                        
                        if (countryUrl) {
                            window.location.href = countryUrl;
                        }
                    });
                    
                    // Añadir evento de clic para el botón de eliminar
                    const deleteBtn = li.querySelector('.delete-icon');
                    deleteBtn.addEventListener('click', function(e) {
                        e.stopPropagation(); // Evitar que se propague al li
                        const historialId = li.dataset.historialId;
                        borrarHistorial(historialId, li);
                    });
                    
                    ul.appendChild(li);
                });

                historyList.appendChild(ul);
            } else {
                historyList.innerHTML = '<p>Error al cargar el historial.</p>';
            }
        })
        .catch(error => {
            console.error('Error al cargar el historial:', error);
            historyList.innerHTML = '<p>Error al cargar el historial. Verifica tu conexión e inténtalo de nuevo.</p>';
        });
    }

    /**
     * Función auxiliar para formatear fechas
     */
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    /**
     * Función para formatear el nombre del país
     * - Reemplaza guiones por espacios
     * - Capitaliza cada palabra
     */
    function formatCountryName(countryName) {
        if (!countryName) return '';
        
        // Reemplazar guiones por espacios
        const words = countryName.split('-');
        
        // Capitalizar cada palabra
        return words.map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }
    
    /**
     * Optimiza el nombre del país para la API de RestCountries
     */
    function optimizeCountryNameForApi(countryName) {
        // Algunos países tienen nombres específicos en la API
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
        
        // Si hay un mapeo específico, úsalo
        if (countryMappings[lowerCaseName]) {
            return countryMappings[lowerCaseName];
        }
        
        // Reemplazar guiones por espacios para la API
        return lowerCaseName.replace(/-/g, ' ');
    }
    
    /**
     * Función para borrar un elemento del historial
     */
 // Modifica la función borrarHistorial para manejar correctamente la solicitud DELETE

function borrarHistorial(historialId, elementoLi) {
    if (!confirm('¿Estás seguro de que deseas eliminar este elemento del historial?')) {
        return;
    }
    
    // Agregar clase de animación de desvanecimiento
    elementoLi.classList.add('fading-out');
    
    // Obtener el token CSRF
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    
    // Realizar solicitud AJAX para borrar el historial
    fetch(`/historial/${historialId}`, {
        method: 'DELETE',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json'  // Añadimos esta cabecera para asegurarnos de que esperamos una respuesta JSON
        },
        // El cuerpo de la solicitud con el token CSRF y el ID requerido
        body: JSON.stringify({
            '_token': csrfToken,
            'id': historialId  // Añadimos el ID explícitamente en el cuerpo de la solicitud
        })
    })
    .then(response => {
        // Verificar si la respuesta es exitosa
        if (!response.ok) {
            // Puede ser útil revisar el texto de la respuesta para el debug
            return response.text().then(text => {
                console.error('Error en la respuesta:', text);
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Eliminar el elemento de la lista después de la animación
            setTimeout(() => {
                elementoLi.remove();
                
                // Si el historial está vacío, mostrar mensaje
                const historialItems = document.querySelectorAll('.history-items li');
                if (historialItems.length === 0) {
                    document.getElementById('history-list').innerHTML = '<p>No hay registros en tu historial.</p>';
                }
            }, 300);
        } else {
            // Quitar la clase de animación si hay error
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
    
    /**
     * Función para borrar todo el historial
     */
    function borrarTodoHistorial() {
        if (!confirm('¿Estás seguro de que deseas borrar todo tu historial? Esta acción no se puede deshacer.')) {
            return;
        }
        
        // Realizar solicitud AJAX para borrar todo el historial
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
                document.getElementById('history-list').innerHTML = '<p>No hay registros en tu historial.</p>';
            }
        })
        .catch(error => {
            console.error('Error al borrar todo el historial:', error);
        });
    }
    

});