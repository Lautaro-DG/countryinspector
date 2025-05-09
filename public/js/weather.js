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

                        data.days.forEach((day, index) => {
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
                                        <p>${day.conditions}</p>
                                        <p>${day.temp}°C</p>
                                    </div>
                                </div>
                            `;
                        });

                        html += `</div>`;
                        document.getElementById('weather').innerHTML = html;
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
