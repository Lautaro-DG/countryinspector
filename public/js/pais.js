document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');

    let countryName = countryNameBlade
        .replace(/-/g, ' ')
        .replace(/\s*\(.*$/, '');

    document.getElementById('pais-nombre').textContent = countryName;

   fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`)
    .then(response => response.json())
    .then(data => {
        const country = data[0];

        const flagUrl = country.flags.svg;
        const flagImg = document.getElementById('pais-flag');
        flagImg.src = flagUrl;
        flagImg.onload = () => flagImg.classList.remove('skeleton');

        const summaryHtml = `
                <p><strong>Name:</strong> ${country.name.common}</p>
                <p><strong>Flag:</strong> <img src="${flagUrl}" alt="Flag of ${country.name.common}" style="width: 60px; vertical-align: middle;"></p>
                <p><strong>Capital:</strong> ${country.capital ? country.capital.join(', ') : 'N/A'}</p>
                <p><strong>Official language(s):</strong> ${country.languages ? Object.values(country.languages).join(', ') : 'N/A'}</p>
                <p><strong>Currency:</strong> ${country.currencies ? Object.values(country.currencies).map(c => `${c.name} (${c.symbol || ''})`).join(', ') : 'N/A'}</p>
                <p><strong>Region:</strong> ${country.region || 'N/A'}</p>
            `;
        document.getElementById('summary').innerHTML = summaryHtml;

        const capital = country.capital ? country.capital[0] : '';

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                buttons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                contents.forEach(content => content.classList.remove('active'));
                const selected = document.getElementById(button.dataset.tab);
                selected.classList.add('active');

                switch (button.dataset.tab) {
                    case 'weather':
                        getWeatherData(capital);
                        break;
                    case 'news':
                        getNewsData(countryName);
                        break;
                }
            });
        });
    })
    .catch(error => {
        console.error('Error al obtener los datos del país:', error);
        document.getElementById('summary').innerHTML = '<p>Error loading summary.</p>';
    });
});