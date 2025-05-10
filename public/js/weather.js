function getFormattedDate(offset = 0) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
}

function getWeatherData(cityName) {
    if (!cityName) return;

    fetch('/weather-api-key')
        .then(response => response.json())
        .then(data => {
            const apiKey = data.api_key;
            const startDate = getFormattedDate(-1);
            const endDate = getFormattedDate(6);

            const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(cityName)}/${startDate}/${endDate}?key=${apiKey}&unitGroup=metric&include=days`;

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data && data.days) {
                        let html = `<h3 id="weather-title">${cityName} Weather Forecast</h3>
                            <div class="weather-grid">`;
                        let weatherDays = [];

                        data.days.forEach((day, index) => {
                            const condicion = day.conditions.split(',')[0];
                            weatherDays.push(day);
                            const dayDate = new Date(day.datetime);
                            const today = new Date();
                            const tomorrow = new Date(today);
                            tomorrow.setDate(today.getDate() + 1);

                            let title = day.datetime;
                            if (dayDate.toDateString() === today.toDateString()) {
                                title = 'Today';
                            } else if (dayDate.toDateString() === tomorrow.toDateString()) {
                                title = 'Tomorrow';
                            } else if (dayDate.toDateString() === new Date(today.setDate(today.getDate() - 1)).toDateString()) {
                                title = 'Yesterday';
                            }

                            const iconUrl = `https://raw.githubusercontent.com/visualcrossing/WeatherIcons/main/PNG/2nd%20Set%20-%20Color/${day.icon}.png`;
                            html += `
                                <div class="weather-card">
                                    <img src="${iconUrl}" alt="${day.conditions}">
                                    <div class="weather-content">
                                        <strong>${title}</strong>
                                        <p>${condicion}</p>
                                        <p>${day.temp}°C</p>
                                    </div>
                                </div>
                            `;
                        });

                        html += `</div>`;
                        document.getElementById('weather').innerHTML = html;
                        document.querySelectorAll('.weather-card').forEach((card, index) => {
                            card.addEventListener('click', () => {
                                const dayData = weatherDays[index];
                                document.querySelectorAll('.weather-card').forEach(c => c.classList.remove('card-active'));
                                card.classList.add('card-active');
                                const modalBody = document.getElementById('modal-body');
                                modalBody.innerHTML = `
                                <h3>Climate for ${dayData.datetime}</h3>
                                <p><strong>Conditions:</strong> ${dayData.conditions}</p>
                                <p><strong>Máx Temp.:</strong> ${dayData.tempmax}°C</p>
                                <p><strong>Mín Temp.:</strong> ${dayData.tempmin}°C</p>
                                <p><strong>Humidity:</strong> ${dayData.humidity}%</p>
                                <p><strong>Rain chance:</strong> ${dayData.precipprob}%</p>
                                <p><strong>Wind:</strong> ${dayData.windspeed} km/h</p>
                                <p><strong>Sunrise:</strong> ${dayData.sunrise}</p>
                                <p><strong>Sunset:</strong> ${dayData.sunset}</p>
                                <p><strong>Moon phase:</strong> ${dayData.moonphase}</p>
                                `;

                                openModal(); 

                            });
                        });

                        document.getElementById('weather-modal').addEventListener('click', function (event) {
                            const modalContent = document.querySelector('.modal-content');
                            if (!modalContent.contains(event.target)) {
                                this.classList.add('hidden');
                                document.querySelectorAll('.weather-card').forEach(c => c.classList.remove('card-active'))
                            }
                        });

                    }
                })
                .catch(error => {
                    console.error('Error al obtener el clima:', error);
                    document.getElementById('weather').innerHTML = '<p>Error al cargar los datos del clima.</p>';
                });
        })
        .catch(error => {
            console.error('Error al obtener la clave API:', error);
        });
}
function openModal() {
  const modal = document.getElementById('weather-modal');
  const content = modal.querySelector('.modal-content');

  content.style.animation = 'none';
  content.offsetHeight; 
  content.style.animation = 'transform-popup 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';

  modal.classList.remove('hidden'); 
  
  setTimeout(() => {
    modal.classList.add('open');
  }, 600); 
}


