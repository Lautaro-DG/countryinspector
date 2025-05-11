document.addEventListener('DOMContentLoaded', function() {
    const historyIcon = document.getElementById('history-icon');
    const historyModal = document.getElementById('history-modal');
    const closeModal = document.querySelector('.close-modal');
    const historyList = document.getElementById('history-list');
    
    // Función para mostrar el historial en el modal
    function displayHistory() {
        fetch('/get-visited-countries')
            .then(response => response.json())
            .then(data => {
                historyList.innerHTML = '';
                
                if (!data.length) {
                    historyList.innerHTML = '<div class="history-item">No visited countries found</div>';
                    return;
                }
                
                data.forEach(country => {
                    const historyItem = document.createElement('div');
                    historyItem.className = 'history-item';
                    
                    const itemText = document.createElement('span');
                    itemText.className = 'history-item-text';
                    itemText.textContent = country.name;
                    
                    const deleteBtn = document.createElement('i');
                    deleteBtn.className = 'fas fa-times delete-history-item';
                    
                    historyItem.appendChild(itemText);
                    historyItem.appendChild(deleteBtn);
                    historyList.appendChild(historyItem);
                    
                    itemText.addEventListener('click', function() {
                        window.location.href = `/country/${country.slug}`;
                    });
                    
                    deleteBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        removeCountryFromHistory(country.slug);
                    });
                });
            })
            .catch(error => {
                console.error('Error fetching country history:', error);
                historyList.innerHTML = '<div class="history-item">Error loading history</div>';
            });
    }
    
    // Función para eliminar un país del historial
    function removeCountryFromHistory(countrySlug) {
        fetch(`/remove-country-from-history/${countrySlug}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayHistory(); 
            }
        })
        .catch(error => {
            console.error('Error removing country from history:', error);
        });
    }
    
    historyIcon.addEventListener('click', function() {
        displayHistory();
        historyModal.style.display = 'block';
    });
    
    closeModal.addEventListener('click', function() {
        historyModal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === historyModal) {
            historyModal.style.display = 'none';
        }
    });
});