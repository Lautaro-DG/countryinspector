let allCountries = [];
let searchTimeouts = {};
const country1ISO = document.getElementById('country1').value ?? "";

function formatNumber(number) {
    if (!number) return 'N/A';
    const num = typeof number === 'string' ? parseFloat(number) : number;
    if (isNaN(num)) return 'N/A';
    return num.toLocaleString('en-US');
}

async function loadAllCountries() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flags');
        allCountries = await response.json();
        allCountries.sort((a, b) => a.name.common.localeCompare(b.name.common));
    } catch (error) {
        console.error('Error loading countries:', error);
    }
}

function showLoadingState(panelNumber, countryName = 'country') {
    document.getElementById(`stats${panelNumber}`).innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Loading ${countryName} data...</p>
                </div>
            `;

    document.getElementById(`flag${panelNumber}-skeleton`).style.display = 'block';
    document.getElementById(`flag${panelNumber}`).style.display = 'none';

    document.getElementById(`country${panelNumber}-name`).textContent = 'Loading...';
    document.getElementById(`country${panelNumber}-iso`).textContent = '';
}

function showEmptyState(panelNumber) {
    const emptyState = document.getElementById(`empty-state-${panelNumber}`);
    if (emptyState) {
        document.getElementById(`stats${panelNumber}`).innerHTML = emptyState.outerHTML;
    }

    document.getElementById(`flag${panelNumber}-skeleton`).style.display = 'none';
    document.getElementById(`flag${panelNumber}`).style.display = 'none';
    document.getElementById(`country${panelNumber}-name`).textContent = '';
    document.getElementById(`country${panelNumber}-iso`).textContent = '';
}

async function loadCountryData(countryISO, panelNumber) {
    if (!countryISO) {
        showEmptyState(panelNumber);
        return;
    }

    try {
        const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryISO}`);
        if (!response.ok) throw new Error('Country not found');

        const data = await response.json();
        const country = data[0];

        const flagImg = document.getElementById(`flag${panelNumber}`);
        const flagSkeleton = document.getElementById(`flag${panelNumber}-skeleton`);

        flagImg.src = country.flags.svg;
        flagImg.onload = () => {
            flagSkeleton.style.display = 'none';
            flagImg.style.display = 'block';
        };

        document.getElementById(`country${panelNumber}-name`).textContent = country.name.common;
        document.getElementById(`country${panelNumber}-iso`).textContent = country.cca2;

        const basicStats = {
            'Capital': country.capital ? country.capital.join(', ') : 'N/A',
            'Region': country.region || 'N/A',
            'Subregion': country.subregion || 'N/A',
            'Population': formatNumber(country.population) + ' people',
            'Area': formatNumber(country.area) + ' km²',
            'Languages': country.languages ? Object.values(country.languages).join(', ') : 'N/A',
            'Currency': country.currencies ? Object.values(country.currencies).map(c => `${c.name} (${c.symbol || ''})`).join(', ') : 'N/A'
        };

        displayStats(basicStats, panelNumber);

        const wikiStats = await fetchWikidataStats(country.name.common);
        const allStats = {
            ...basicStats,
            ...wikiStats
        };
        displayStats(allStats, panelNumber);

        const searchInput = document.getElementById(`country-search-${panelNumber}`);
        if (searchInput) {
            searchInput.value = country.name.common;
        }

    } catch (error) {
        console.error('Error loading country data:', error);
        document.getElementById(`stats${panelNumber}`).innerHTML =
            '<div class="loading-state"><p>Error loading country data</p></div>';
    }
}

function displayStats(stats, panelNumber) {
    const statsContainer = document.getElementById(`stats${panelNumber}`);
    let html = '';

    for (const [label, value] of Object.entries(stats)) {
        if (value && value !== 'N/A') {
            html += `
                        <div class="stat-card">
                            <div class="stat-label">${label}</div>
                            <div class="stat-value">${value}</div>
                        </div>
                    `;
        }
    }

    statsContainer.innerHTML = html;
}

async function fetchWikidataStats(countryName) {
    const sparqlQuery = `
            SELECT ?countryLabel ?population ?area ?gdp ?lifeExpectancy ?hdi ?gini ?literacy ?unemployment
            WHERE {
              ?country wdt:P31 wd:Q6256;
                      rdfs:label "${countryName}"@en.
              
              OPTIONAL { ?country wdt:P1082 ?population. }
              OPTIONAL { ?country wdt:P2046 ?area. }
              OPTIONAL { ?country wdt:P2131 ?gdp. }
              OPTIONAL { ?country wdt:P2250 ?lifeExpectancy. }
              OPTIONAL { ?country wdt:P1081 ?hdi. }
              OPTIONAL { ?country wdt:P1125 ?gini. }
              OPTIONAL { ?country wdt:P2180 ?literacy. }
              OPTIONAL { ?country wdt:P1198 ?unemployment. }
              
              SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
            }
            LIMIT 1
            `;

    try {
        const encodedQuery = encodeURIComponent(sparqlQuery);
        const endpoint = 'https://query.wikidata.org/sparql';
        const url = `${endpoint}?query=${encodedQuery}&format=json`;

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/sparql-results+json'
            }
        });

        const data = await response.json();

        if (!data.results || !data.results.bindings || data.results.bindings.length === 0) {
            return {};
        }

        const result = data.results.bindings[0];
        const stats = {};

        if (result.gdp && result.gdp.value) {
            stats['GDP'] = result.gdp.value + ' USD';
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

        return stats;
    } catch (error) {
        console.error('Error fetching WikiData statistics:', error);
        return {};
    }
}

function setupSearchForPanel(panelNumber) {
    const searchInput = document.getElementById(`country-search-${panelNumber}`);
    const searchResults = document.getElementById(`search-results-${panelNumber}`);

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeouts[panelNumber]);
        const query = e.target.value.trim();

        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        searchTimeouts[panelNumber] = setTimeout(() => {
            const filtered = allCountries.filter(country =>
                country.name.common.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 8);

            displaySearchResults(filtered, panelNumber);
        }, 300);
    });

    searchInput.addEventListener('input', (e) => {
        if (e.target.value.trim() === '') {
            showEmptyState(panelNumber);
        }
    });
}

function displaySearchResults(countries, panelNumber) {
    const searchResults = document.getElementById(`search-results-${panelNumber}`);

    if (countries.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No countries found</div>';
        searchResults.style.display = 'block';
        return;
    }

    let html = '';
    countries.forEach(country => {
        html += `
                    <div class="search-result-item" onclick="selectCountry('${country.cca2}', '${country.name.common}', ${panelNumber})">
                        <img src="${country.flags.svg}" alt="${country.name.common} flag" class="search-result-flag">
                        <span>${country.name.common}</span>
                    </div>
                `;
    });

    searchResults.innerHTML = html;
    searchResults.style.display = 'block';
}

function selectCountry(iso, name, panelNumber) {
    document.getElementById(`search-results-${panelNumber}`).style.display = 'none';
    document.getElementById(`country-search-${panelNumber}`).value = name;

    showLoadingState(panelNumber, name);
    loadCountryData(iso, panelNumber);
}

function setupGlobalClickHandler() {
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            document.querySelectorAll('.search-results').forEach(results => {
                results.style.display = 'none';
            });
        }
    });
}

async function init() {
    await loadAllCountries();

    setupSearchForPanel(1);
    setupSearchForPanel(2);
    setupGlobalClickHandler();

    if (country1ISO && country1ISO !== '') {
        showLoadingState(1, 'initial country');
        loadCountryData(country1ISO, 1);
    } else {
        showEmptyState(1);
    }

    showEmptyState(2);
}

init();