
let easyMDE = null;

function initCountryRatings(countryISO3) {
    document.body.dataset.countryIso = countryISO3;
    loadRatings(countryISO3);
}

/**
 * Carga las valoraciones existentes para un país
 * @param {string} countryISO3 - Código ISO3 del país
 */
// Variables globales para la paginación
let currentPage = 1;
let isLoading = false;
let hasMoreRatings = true;
let countryISOCode = null;

function loadRatings(countryISO3, resetList = true) {
    // Guardamos el código ISO para futuras cargas
    countryISOCode = countryISO3;
    
    const ratingsListElement = document.getElementById('ratings-list');
    
    // Si es una carga inicial, resetea la lista y la paginación
    if (resetList) {
        ratingsListElement.innerHTML = '<img src="/img/loading.gif" class="cargar" alt="Cargando..." />';
        currentPage = 1;
        hasMoreRatings = true;
    }
    
    // Si ya estamos cargando o no hay más ratings, salimos
    if (isLoading || !hasMoreRatings) {
        return;
    }
    
    // Marcamos que estamos cargando
    isLoading = true;
    
    // Si no es resetList, añadimos un indicador de carga al final
    if (!resetList) {
        const loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'loading-more';
        loadingIndicator.innerHTML = '<img src="/img/loading.gif" class="cargar" alt="Cargando más..." />';
        ratingsListElement.appendChild(loadingIndicator);
    }
    
    // Cargar las valoraciones con paginación
    fetch(`/country-ratings/${countryISO3}?page=${currentPage}`)
        .then(res => res.json())
        .then(data => {
            // Eliminar el indicador de carga si existe
            const loadingIndicator = document.getElementById('loading-more');
            if (loadingIndicator) {
                loadingIndicator.remove();
            }
            
            // Actualizar el estado de paginación
            hasMoreRatings = data.hasMore;
            
            // Generar el HTML para las nuevas reviews
            let html = '';
            
            if (data.ratings.length === 0 && resetList) {
                html = '<p>No reviews yet.</p>';
            } else {
                data.ratings.forEach(r => {
                    html += `
                    <div class="rating-entry">
                        <strong>${r.user.name}</strong> - <em>${new Date(r.created_at).toLocaleDateString()}</em><br>
                        <span>⭐ ${r.rating} / 5</span>
                        <div class="review-markdown">${marked.parse(r.review)}</div>
                    </div>`;
                });
            }
            
            // Actualizamos la sección de valoraciones existentes
            if (resetList) {
                ratingsListElement.innerHTML = html;
            } else {
                ratingsListElement.insertAdjacentHTML('beforeend', html);
            }
            
            // Incrementamos la página para la próxima carga
            currentPage++;
            
            // Marcamos que terminamos de cargar
            isLoading = false;
            
            // Si es la primera carga, verificamos si el usuario ya ha valorado
            if (resetList) {
                checkUserRating(countryISO3);
            }
        })
        .catch(err => {
            console.error('Error loading ratings:', err);
            if (resetList) {
                ratingsListElement.innerHTML = '<p>Error al cargar las valoraciones.</p>';
            } else {
                const loadingIndicator = document.getElementById('loading-more');
                if (loadingIndicator) {
                    loadingIndicator.innerHTML = '<p>Error al cargar más valoraciones.</p>';
                }
            }
            isLoading = false;
        });
}

function setupInfiniteScroll() {
    function checkScroll() {
        const ratingsContainer = document.getElementById('ratings-list');
        
        if (!ratingsContainer) return;
        
        const containerBottom = ratingsContainer.getBoundingClientRect().bottom;
        const windowHeight = window.innerHeight;
        
        if (containerBottom - windowHeight < 200 && !isLoading && hasMoreRatings && countryISOCode) {
            loadRatings(countryISOCode, false);
        }
    }
    
    window.addEventListener('scroll', checkScroll);
}

document.addEventListener('DOMContentLoaded', setupInfiniteScroll);

/* Verifica si el usuario actual ya ha valorado este país */
function checkUserRating(countryISO3) {
    fetch(`/check-user-rating/${countryISO3}`, {
        credentials: 'same-origin'
    })
        .then(response => response.json())
        .then(data => {
            const section = document.getElementById('user-review-section');

            const defaultForm = document.getElementById('rating-form');
            if (defaultForm) {
                defaultForm.style.display = 'none';
            }

            if (data.hasRated) {
                // El usuario ya ha valorado este país, mostrar la valoración existente
                const rating = data.rating;
                section.innerHTML = `
                <div id="user-review-readonly" class="p-3 border rounded bg-light">
                    <h3>Your review:</h3>
                    <div class="star-rating">
                        ${'★'.repeat(rating.rating)}${'☆'.repeat(5 - rating.rating)}
                    </div>
                    <div class="review-markdown">${marked.parse(rating.review)}</div>
                    <button id="edit-rating"><i class="fa-solid fa-pen"></i> <span class="tab-text">Update</span></button>
                    <button id="delete-rating"><i class="fa-solid fa-trash"></i> <span class="tab-text">Delete</span></button>
                </div>
            `;

                // Configurar botones de acción
                document.getElementById('edit-rating').addEventListener('click', () => showRatingForm(rating));
                document.getElementById('delete-rating').addEventListener('click', () => deleteUserRating(countryISO3));
            } else {
                // El usuario no ha valorado este país, mostrar formulario
                showRatingForm();
            }
        })
        .catch(error => {
            const section = document.getElementById('user-review-section');
            section.innerHTML = `
            <div class="alert alert-warning">
               To rate this country, you need to <a href="/login">login</a> or <a href="/register">register</a> first.
            </div>
        `;
        });
}

/**
 * Muestra el formulario para valorar o editar una valoración
 * @param {Object} data - Datos de la valoración existente (opcional)
 */
function showRatingForm(data = null) {
    const section = document.getElementById('user-review-section');
    section.innerHTML = `
        <form id="rating-form" class="p-3 border rounded bg-light">
            <h3>${data ? 'Update review' : 'Review country'}</h3>
            <div id="star-container" class="mb-2 star-rating" style="font-size: 1.5rem; cursor: pointer; user-select: none;">
                ${[1, 2, 3, 4, 5].map(i => `<span data-value="${i}" class="star">☆</span>`).join('')}
            </div>
            <input type="hidden" id="rating-value" value="${data?.rating || 0}">
            <div class="form-group mt-3">
                <textarea id="review-editor" class="form-control">${data?.review || ''}</textarea>
            </div>
            <button type="submit" id="save-rating"><i class="fa-solid fa-floppy-disk"></i> <span class="tab-text">Save</span></button>
            ${data ? '<button type="button" id="cancel-edit"><i class="fa-solid fa-xmark"></i> <span class="tab-text">Cancel</span></button>' : ''}
        </form>
    `;

    setupStarRating();
    setupMDE();
    setupFormSubmission(data !== null);

    // Si hay un botón de cancelar, configurar su evento
    const cancelButton = document.getElementById('cancel-edit');
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            const countryISO3 = document.body.dataset.countryIso;
            checkUserRating(countryISO3);
        });
    }
}

/**
 * Configura el sistema de valoración por estrellas
 */
function setupStarRating() {
    const stars = document.querySelectorAll('.star');
    const ratingInput = document.getElementById('rating-value');

    stars.forEach(star => {
        // Evento click
        star.addEventListener('click', () => {
            const value = parseInt(star.dataset.value);
            ratingInput.value = value;
            updateStars(value);
        });

        // Evento hover
        star.addEventListener('mouseover', () => {
            const value = parseInt(star.dataset.value);
            highlightStars(value);
        });

        // Restablecer al quitar hover
        star.addEventListener('mouseout', () => {
            const currentRating = parseInt(ratingInput.value, 10);
            updateStars(currentRating);
        });
    });

    // Rellenar según valor actual
    const currentRating = parseInt(ratingInput.value);
    updateStars(currentRating);
}

/**
 * Actualiza las estrellas según el valor seleccionado
 * @param {number} value - Valor de la valoración (1-5)
 */
function updateStars(value) {
    const stars = document.querySelectorAll('.star');

    stars.forEach((star, index) => {
        if (index + 1 <= value) {
            // Estrella llena: ★
            star.textContent = '★';
        } else {
            // Estrella vacía: ☆
            star.textContent = '☆';
        }
    });
}

/**
 * Resalta estrellas al hacer hover
 * @param {number} value - Valor sobre el que se está haciendo hover
 */
function highlightStars(value) {
    const stars = document.querySelectorAll('.star');

    stars.forEach((star, index) => {
        if (index + 1 <= value) {
            star.textContent = '★';
        } else {
            star.textContent = '☆';
        }
    });
}

/**
 * Configura el editor Markdown
 */
function setupMDE() {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    if (easyMDE) {
        easyMDE.toTextArea();
        easyMDE = null;
    }

    const config = {
        element: document.getElementById('review-editor'),
        spellChecker: false,
        minHeight: '150px',
        placeholder: "Write your review...",
        hideIcons: ['side-by-side', 'fullscreen', 'guide', 'image', 'quote']
    };

    if (isMobile) {
        config.toolbar = false;
        toastr.options = {
            progressBar: true,
            timeOut: 5000,
            extendedTimeOut: 2000,
            positionClass: 'toast-top-center'
        }
    } else {
        config.toolbar = [
            "bold", "italic", "heading", "|",
            "unordered-list", "ordered-list", "|",
            "link", "|",
            "preview", "|",
            "undo", "redo"
        ];
        toastr.options = {
            progressBar: true,
            timeOut: 5000,
            extendedTimeOut: 2000,
            positionClass: 'toast-top-right'
        }
    }
    easyMDE = new EasyMDE(config);
}

/**
 * Configura la lógica de envío del formulario
 * @param {boolean} isEdit - Indica si es una edición
 */
function setupFormSubmission(isEdit) {
    const form = document.getElementById('rating-form');
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const rating = document.getElementById('rating-value').value;
        const review = easyMDE.value();
        const countryISO3 = document.body.dataset.countryIso;

        // Validaciones
        if (parseInt(rating) < 1) {
            alert('Please, select a rating');
            return;
        }

        if (!review.trim()) {
            alert('Please, write a review');
            return;
        }

        // Configurar el método y la URL según sea una creación o edición
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? '/country-ratings' : '/country-ratings';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'Accept': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                country_code: countryISO3,
                rating: rating,
                review: review
            })
        })
            .then(res => {
                // Verificar si la respuesta es un redirect (probablemente a login)
                if (res.redirected) {
                    alert('You need to be logged in to rate a country.');
                    window.location.href = res.url; // Redirigir al login
                    return Promise.reject('Redirect to login');
                }

                return res.json();
            })
            .then(data => {
                if (data.success) {
                    toastr.success(data.message);
                    checkUserRating(countryISO3);
                    loadRatings(countryISO3);
                } else {
                   toastr.error(data.message || 'Error saving review.');
                }
            })
            .catch(err => {
                // No mostrar error si fue por redirección (ya manejado arriba)
                if (err === 'Redirect to login') return;

                console.error('Error saving rating:', err);
                alert('Error saving review.');
            });
    });
}

/**
 * Elimina la valoración del usuario
 * @param {string} countryISO3 - Código ISO3 del país
 */
function deleteUserRating(countryISO3) {
    const modal = document.getElementById('confirmModal');
    const btnYes = document.getElementById('confirmYes');
    const btnNo = document.getElementById('confirmNo');

    modal.style.display = 'flex';

    btnNo.onclick = () => {
        modal.style.display = 'none';
    };

    btnYes.onclick = () => {
        modal.style.display = 'none';

        fetch(`/country-ratings/${countryISO3}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'Accept': 'application/json'
            },
            credentials: 'same-origin'
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                toastr.success(data.message);
                loadRatings(countryISO3);
                showRatingForm();
            } else {
                alert(data.message || 'Error deleting review.');
            }
        })
        .catch(err => {
            console.error('Error deleting rating:', err);
            alert('Error deleting review.');
        });
    };
}


// Exportar las funciones públicas
window.initCountryRatings = initCountryRatings;