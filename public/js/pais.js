/* Función para formatear números con separadores de miles */
function formatNumber(number) {
    if (!number) return 'N/A';

    const num = typeof number === 'string' ? parseFloat(number) : number;

    if (isNaN(num)) return 'N/A';

    return num.toLocaleString('es-ES');
}
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

            let summaryHtml = `
                <div class="country-info-card">
                    <div class="country-basic-info">
                        <div class="country-flag-container">
                            <img src="${flagUrl}" alt="Flag of ${country.name.common}" class="country-flag">
                        </div>
                        <div class="country-details">
                            <h2>${country.name.common}</h2>
                            <p class="country-iso"><span>ISO:</span> ${country.cca2}</p>
                            <p class="country-capital"><span>Capital:</span> ${country.capital ? country.capital.join(', ') : 'N/A'}</p>
                            <p class="country-languages"><span>Official language(s):</span> ${country.languages ? Object.values(country.languages).join(', ') : 'N/A'}</p>
                            <p class="country-currency"><span>Currency:</span> ${country.currencies ? Object.values(country.currencies).map(c => `${c.name} (${c.symbol || ''})`).join(', ') : 'N/A'}</p>
                            <p class="country-region"><span>Region:</span> ${country.region || 'N/A'}</p>
                            <p class="country-subregion"><span>Subregion:</span> ${country.subregion || 'N/A'}</p>
                        </div>
                    </div>
                </div>`;

            summaryHtml += `
                <div class="wiki-stats-container">
                    <h3 class="wiki-stats-title">
                        <svg class="wiki-icon" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="currentColor" d="M12.09 13.119c-.936 1.932-2.217 4.548-2.853 5.728-.616 1.074-1.127.931-1.532.029-1.406-3.321-4.293-9.144-5.651-12.409-.251-.601-.441-.987-.619-1.139-.181-.15-.554-.24-1.122-.271C.103 5.033 0 4.982 0 4.898v-.455l.052-.045c.924-.005 5.401 0 5.401 0l.051.045v.434c0 .094-.074.145-.103.155-.311.12-.843.128-1.077.281-.291.189-.15.505.057 1.021L7.67 13.203l1.056-2.989 1.179-2.766-1.645-3.709c-.204-.489-.4-.701-.683-.822-.301-.129-.774-.188-1.283-.188h-.027c-.103-.016-.176-.059-.176-.14V2.89l.051-.045h5.253l.051.045c0 .084-.059.139-.102.154-.385.105-.671.197-.671.689 0 .171.061.33.183.498l3.226 6.323 2.889-6.442c.143-.314.191-.566.191-.777 0-.475-.414-.685-.805-.79-.075-.023-.15-.054-.15-.144v-.435l.06-.045h4.344l.037.045v.434c0 .102-.089.145-.134.157-1.161.138-1.239.612-1.732 1.611l-3.838 8.643-.026.058c0 .105.026.21.101.267.151.124.291.25.502.25.511 0 .984-.258 1.771-1.464.736-.995 1.149-1.674 1.654-1.674.138 0 .277.037.412.119.127.076.228.184.307.318.068.303.057.664-.089 1.039-.863 1.777-2.106 3.101-3.667 4.046-.086.047-.18.065-.266.065-.372 0-.659-.318-1.028-.763-.299-.392-.629-.903-.566-1.246.006-.039.044-.095.044-.141.006-.046-.032-.079-.076-.119-.047 0-.096.058-.138.081-.212.177-.452.051-.705-.086z"/>
                        </svg>
                        Wikipedia Statistics
                    </h3>
                    <div id="wiki-stats" class="wiki-stats loading">
                        <div class="wiki-loader">
                            <div class="spinner"></div>
                            <p>Loading additional statistics...</p>
                        </div>
                    </div>
                </div>`;

            document.getElementById('summary').innerHTML = summaryHtml;

            fetchWikipediaStats(country.name.common);

            const capital = country.capital ? country.capital[0] : '';
            const countryISO2 = country.cca2;

            fetch(`/api/country-average-rating/${countryISO2}`)
                .then(res => res.json())
                .then(avgData => {
                    const averageText = avgData.average_rating ? ` ⭐ ${avgData.average_rating} / 5` : '';
                    const nameUpper = country.name.common.toUpperCase();
                    document.getElementById('pais-nombre').textContent = nameUpper + ' | ' + averageText;
                })
                .catch(() => {
                    document.getElementById('pais-nombre').textContent = country.name.common.toUpperCase();
                });


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
                        case 'history':
                            createHistoryCarousel(countryName);
                            break;
                        case 'statistics':
                            getStatisticsData(countryISO2);
                            break;
                        case 'rating':
                            initCountryRatings(countryISO2);
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

/* Función para obtener estadísticas adicionales de Wikipedia */
function fetchWikipediaStats(countryName) {
    const wikiStatsContainer = document.getElementById('wiki-stats');

    const endpoint = 'https://en.wikipedia.org/w/api.php';

    const params = {
        action: 'query',
        format: 'json',
        titles: countryName,
        prop: 'extracts|pageimages|revisions',
        exintro: true,
        explaintext: true,
        rvprop: 'content',
        rvslots: 'main',
        origin: '*'
    };

    const queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');

    fetch(`${endpoint}?${queryString}`)
        .then(response => response.json())
        .then(data => {
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];

            if (pageId === '-1') {
                wikiStatsContainer.innerHTML = '<div class="wiki-error"><p>No se encontró información adicional en Wikipedia.</p></div>';
                wikiStatsContainer.classList.remove('loading');
                return;
            }

            const page = pages[pageId];

            let statsHtml = '';

            if (page.extract) {
                const maxLength = 300;
                const summary = page.extract.length > maxLength
                    ? page.extract.substring(0, maxLength) + '...'
                    : page.extract;

                statsHtml += `
                    <div class="wiki-summary">
                        <p>${summary}</p>
                    </div>
                `;
            }

            fetchWikidataStats(countryName)
                .then(wikidataStats => {
                    if (wikidataStats && Object.keys(wikidataStats).length > 0) {
                        statsHtml += '<div class="wiki-data-grid">';

                        for (const [label, value] of Object.entries(wikidataStats)) {
                            if (value) {
                                statsHtml += `
                                    <div class="wiki-stat-card">
                                        <div class="wiki-stat-value">${value}</div>
                                        <div class="wiki-stat-label">${label}</div>
                                    </div>`;
                            }
                        }

                        statsHtml += '</div>';
                    }

                    statsHtml += `
                        <div class="wiki-footer">
                            <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(countryName)}" target="_blank" rel="noopener" class="wiki-link">
                                <span>See more on Wikipedia</span>
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"/>
                                </svg>
                            </a>
                        </div>`;

                    wikiStatsContainer.innerHTML = statsHtml;
                    wikiStatsContainer.classList.remove('loading');
                })
                .catch(error => {
                    console.error('Error fetching WikiData stats:', error);
                    statsHtml += `
                        <div class="wiki-footer">
                            <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(countryName)}" target="_blank" rel="noopener" class="wiki-link">
                                <span>Ver más en Wikipedia</span>
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"/>
                                </svg>
                            </a>
                        </div>`;

                    wikiStatsContainer.innerHTML = statsHtml;
                    wikiStatsContainer.classList.remove('loading');
                });
        })
        .catch(error => {
            console.error('Error fetching Wikipedia data:', error);
            wikiStatsContainer.innerHTML = '<div class="wiki-error"><p>Error al cargar estadísticas de Wikipedia.</p></div>';
            wikiStatsContainer.classList.remove('loading');
        });
}

/* Función para obtener estadísticas WikiData */
function fetchWikidataStats(countryName) {
    // SPARQL query to get country statistics
    const sparqlQuery = `
    SELECT ?countryLabel ?population ?area ?gdp ?lifeExpectancy ?hdi ?gini ?literacy ?unemployment ?internetUsers ?phoneUsers ?co2Emissions ?roadLength ?ratingFromWikipedia
    WHERE {
      ?country wdt:P31 wd:Q6256;  # instance of country
              rdfs:label "${countryName}"@en.
      
      OPTIONAL { ?country wdt:P1082 ?population. }         # población
      OPTIONAL { ?country wdt:P2046 ?area. }               # área
      OPTIONAL { ?country wdt:P2131 ?gdp. }                # PIB nominal
      OPTIONAL { ?country wdt:P2250 ?lifeExpectancy. }     # esperanza de vida
      OPTIONAL { ?country wdt:P1081 ?hdi. }                # IDH
      OPTIONAL { ?country wdt:P1125 ?gini. }               # Coeficiente de GINI
      OPTIONAL { ?country wdt:P2180 ?literacy. }           # tasa de alfabetización
      OPTIONAL { ?country wdt:P1198 ?unemployment. }       # tasa de desempleo
      OPTIONAL { ?country wdt:P1120 ?internetUsers. }      # usuarios de internet
      OPTIONAL { ?country wdt:P1539 ?phoneUsers. }         # usuarios de teléfono
      OPTIONAL { ?country wdt:P2456 ?co2Emissions. }       # emisiones de CO2
      OPTIONAL { ?country wdt:P2177 ?roadLength. }         # longitud de carreteras
      OPTIONAL { ?country wdt:P3351 ?ratingFromWikipedia. } # calificación de Wikipedia
      
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    LIMIT 1
    `;

    const encodedQuery = encodeURIComponent(sparqlQuery);
    const endpoint = 'https://query.wikidata.org/sparql';
    const url = `${endpoint}?query=${encodedQuery}&format=json`;

    return fetch(url, {
        headers: {
            'Accept': 'application/sparql-results+json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (!data.results || !data.results.bindings || data.results.bindings.length === 0) {
                return {};
            }

            const result = data.results.bindings[0];
            const stats = {};

            if (result.population && result.population.value) {
                stats['Population'] = formatNumber(result.population.value) + ' people';
            }

            if (result.area && result.area.value) {
                stats['Area'] = formatNumber(result.area.value) + ' km²';
            }

            if (result.gdp && result.gdp.value) {
                stats['GDP'] = '$' + formatNumber(result.gdp.value) + ' USD';
            }

            if (result.lifeExpectancy && result.lifeExpectancy.value) {
                stats['Life Expectancy'] = result.lifeExpectancy.value + ' years';
            }

            if (result.hdi && result.hdi.value) {
                stats['Human Development Index'] = result.hdi.value;
            }

            if (result.gini && result.gini.value) {
                stats['GINI Index'] = result.gini.value;
            }

            if (result.literacy && result.literacy.value) {
                stats['Literacy Rate'] = result.literacy.value + '%';
            }

            if (result.unemployment && result.unemployment.value) {
                stats['Unemployment Rate'] = result.unemployment.value + '%';
            }

            if (result.internetUsers && result.internetUsers.value) {
                stats['Internet Users'] = formatNumber(result.internetUsers.value) + ' users';
            }

            if (result.phoneUsers && result.phoneUsers.value) {
                stats['Phone Users'] = formatNumber(result.phoneUsers.value) + ' users';
            }

            if (result.co2Emissions && result.co2Emissions.value) {
                stats['CO2 Emissions'] = formatNumber(result.co2Emissions.value) + ' kt';
            }

            if (result.roadLength && result.roadLength.value) {
                stats['Road Network Length'] = formatNumber(result.roadLength.value) + ' km';
            }

            return stats;
        })
        .catch(error => {
            console.error('Error fetching WikiData statistics:', error);
            return {};
        });
}