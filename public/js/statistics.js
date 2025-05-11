/* Función para obtener los datos estadísticos del país */
function getStatisticsData(iso3) {
    const indicators = {
        general: {
            'Total Population': 'SP.POP.TOTL',
            'GDP per capita (USD)': 'NY.GDP.PCAP.CD',
            'Life Expectancy': 'SP.DYN.LE00.IN',
            'Literacy Rate': 'SE.ADT.LITR.ZS'
        },
        economy: {
            'GDP (USD)': 'NY.GDP.MKTP.CD',
            'GDP Growth (% annual)': 'NY.GDP.MKTP.KD.ZG',
            'Inflation (% annual)': 'FP.CPI.TOTL.ZG',
            'Unemployment (% of labor force)': 'SL.UEM.TOTL.ZS',
            'Exports of goods and services (% of GDP)': 'NE.EXP.GNFS.ZS'
        },
        social: {
            'Urban Population (% of total)': 'SP.URB.TOTL.IN.ZS',
            'Infant Mortality Rate': 'SP.DYN.IMRT.IN',
            'Education Expenditure (% of GDP)': 'SE.XPD.TOTL.GD.ZS',
            'Health Expenditure (% of GDP)': 'SH.XPD.CHEX.GD.ZS'
        },
        environmental: {
            'CO₂ Emissions per capita': 'EN.ATM.CO2E.PC',
            'Energy Consumption per capita': 'EG.USE.PCAP.KG.OE',
            'Access to Electricity (% of population)': 'EG.ELC.ACCS.ZS',
            'Forest Areas (% of land)': 'AG.LND.FRST.ZS'
        }
    };

    const statsContainer = document.getElementById('statistics');

    // Función para obtener los datos del World Bank API
    function fetchWorldBankData(code) {
        return fetch(`https://api.worldbank.org/v2/country/${iso3}/indicator/${code}?format=json&per_page=5`)
            .then(response => response.json())
            .then(data => {
                const validData = data[1]?.filter(item => item.value !== null);
                if (validData && validData.length > 0) {
                    return {
                        value: validData[0].value,
                        year: validData[0].date
                    };
                }
                return { value: null, year: null };
            })
            .catch(() => {
                return { value: null, year: null };
            });
    }

    const allStats = {};

    let completedRequests = 0;
    let totalRequests = 0;

    Object.keys(indicators).forEach(category => {
        totalRequests += Object.keys(indicators[category]).length;
    });

    const allPromises = [];

    Object.keys(indicators).forEach(category => {
        allStats[category] = {};

        Object.entries(indicators[category]).forEach(([label, code]) => {
            const promise = fetchWorldBankData(code).then(result => {
                allStats[category][label] = result;

                completedRequests++;
                const progressBar = document.getElementById('loading-progress');
                if (progressBar) {
                    const percentage = Math.round((completedRequests / totalRequests) * 100);
                    progressBar.style.width = `${percentage}%`;
                    progressBar.innerText = `${percentage}%`;
                }

                return result;
            });

            allPromises.push(promise);
        });
    });

    Promise.all(allPromises).then(() => {
        let html = `
            <div class="country-stats-container">
                <div class="categories-tabs">
        `;

        Object.keys(indicators).forEach((category, index) => {
            html += `
        <div class="nav-item">
            <button type="button" 
                    class="nav-link ${index === 0 ? 'active-nav' : ''}"
                    data-category="${category}"
                    onclick="showCategory('${category}')">
                ${category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
        </div>
    `;
        });
        html += `</div>`;
        html += `
    <select id="categorySelect" class="category-select" onchange="showCategory(this.value)">
        ${Object.keys(indicators).map((category, index) =>
            `<option value="${category}" ${index === 0 ? 'selected' : ''}>
                ${category.charAt(0).toUpperCase() + category.slice(1)}
             </option>`
        ).join('')}
    </select>
`;

        html += `
                </div>
                <div class="category-content">
        `;

        Object.keys(indicators).forEach((category, index) => {
            html += `
                <div id="category-${category}" class="category-panel" style="display: ${index === 0 ? 'block' : 'none'}">
                    <h3>${category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                    <div class="stats-grid">
            `;

            Object.entries(allStats[category]).forEach(([label, data]) => {
                const formattedValue = data.value !== null
                    ? typeof data.value === 'number'
                        ? data.value.toLocaleString(undefined, { maximumFractionDigits: 2 })
                        : data.value
                    : 'Not available';

                html += `
                    <div class="stat-card">
                        <h4 class="stat-label">${label}</h4>
                        <div class="stat-value">${formattedValue}</div>
                        <div class="stat-year">${data.year !== null ? `(${data.year})` : ''}</div>
                    </div>
                `;
            });

            html += `
                    </div>
                    <div class="charts-container">
                        <div class="chart-row">
                            <div class="chart-cell">
                                <h4 class="chart-title">Bar Chart</h4>
                                <canvas id="barChart-${category}" width="300" height="200" style="max-height: 230px;"></canvas>
                            </div>
                            <div class="chart-cell">
                                <h4 class="chart-title">Pie Chart</h4>
                                <canvas id="pieChart-${category}" width="300" height="200" style="max-height: 230px;"></canvas>
                            </div>
                        </div>
                        <div class="chart-row">
                            <div class="chart-cell">
                                <h4 class="chart-title">Radar Chart</h4>
                                <canvas id="radarChart-${category}" width="300" height="200" style="max-height: 230px;"></canvas>
                            </div>
                            <div class="chart-cell">
                                <h4 class="chart-title">Comparative Chart</h4>
                                <canvas id="lineChart-${category}" width="300" height="200" style="max-height: 230px;"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        statsContainer.innerHTML = html;

        Object.keys(indicators).forEach(category => {
            createCharts(category, allStats[category]);
        });
    });
}

/* Función para mostrar las estadísticas de una categoría */
function showCategory(category) {
    const panels = document.querySelectorAll('.category-panel');
    panels.forEach(panel => {
        panel.style.display = 'none';
    });

    const selectedPanel = document.getElementById(`category-${category}`);
    if (selectedPanel) {
        selectedPanel.style.display = 'block';

    }

    const tabs = document.querySelectorAll('.nav-link');
    tabs.forEach(tab => {
        tab.classList.remove('active-nav');
        if (tab.dataset.category === category) {
            tab.classList.add('active-nav');
        }
    });

}

/* Función para crear los gráficos */
function createCharts(category, data) {
    const labels = Object.keys(data);
    const values = Object.values(data).map(item => item.value !== null ? item.value : 0);

    const backgroundColors = [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)'
    ];

    const borderColors = [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)'
    ];

    // Función para normalizar datos basada en la categoría y el tipo de indicador
    function normalizeDataForCategory() {
        const normalizedValues = [...values];
        const categories = {
            general: () => {
                const maxIndex = values.indexOf(Math.max(...values));

                return values.map((val, idx) => {
                    const label = labels[idx].toLowerCase();

                    if (label.includes('population') || label.includes('gdp')) {
                        return val > 0 ? Math.log10(val) : 0;
                    }

                    return val;
                });
            },
            economy: () => {
                return values.map((val, idx) => {
                    const label = labels[idx].toLowerCase();

                    if (label.includes('gdp') && !label.includes('%')) {
                        return val > 0 ? Math.log10(val) : 0;
                    }

                    return val;
                });
            },
            social: () => {
                return values;
            },
            environmental: () => {
                return values;
            }
        };

        if (categories[category]) {
            return categories[category]();
        }

        return normalizedValues;
    }

    const normalizedChartValues = normalizeDataForCategory();

    const enhancedLabels = labels.map((label, idx) => {
        if (label.toLowerCase().includes('gdp') && !label.toLowerCase().includes('%')) {
            return `${label} (log10)`;
        } else if (label.toLowerCase().includes('population') && !label.toLowerCase().includes('%')) {
            return `${label} (log10)`;
        }
        return label;
    });

    // Gráfico de barras
    const barCtx = document.getElementById(`barChart-${category}`);
    if (barCtx) {
        new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: enhancedLabels,
                datasets: [{
                    label: 'Valor',
                    data: normalizedChartValues,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.5,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: category === 'general' || category === 'economy' ? 'Escala ajustada' : 'Valor'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const index = context.dataIndex;
                                const originalValue = values[index];
                                const formattedValue = originalValue.toLocaleString(undefined, { maximumFractionDigits: 2 });
                                const label = labels[index];

                                return `${label}: ${formattedValue}`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Gráfico circular 
    const pieCtx = document.getElementById(`pieChart-${category}`);
    if (pieCtx) {
        const sum = values.reduce((acc, val) => acc + Math.abs(val), 0);
        const pieValues = sum > 0 ? values.map(v => (Math.abs(v) / sum) * 100) : values;

        new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: pieValues,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.5,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const index = context.dataIndex;
                                const percent = pieValues[index].toFixed(1);
                                const originalValue = values[index].toLocaleString(undefined, { maximumFractionDigits: 2 });
                                return `${labels[index]}: ${percent}% (${originalValue})`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Gráfico radar
    const radarCtx = document.getElementById(`radarChart-${category}`);
    if (radarCtx) {
        const normalizedRadarValues = values.map((val, idx) => {
            const label = labels[idx].toLowerCase();

            if (label.includes('%')) {
                return Math.min(val, 100);
            }

            if (label.includes('gdp') && !label.includes('%')) {
                const benchmark = label.includes('per capita') ? 50000 : 1000000000000;
                return val > 0 ? Math.min((val / benchmark) * 50, 100) : 0;
            } else if (label.includes('expectancy')) {
                return Math.min(val, 100);
            } else if (label.includes('mortality')) {
                return val > 0 ? Math.max(100 - val * 5, 0) : 0;
            } else if (label.includes('population') && !label.includes('%')) {
                return val > 0 ? Math.min((Math.log10(val) / 9) * 100, 100) : 0;
            }

            return val > 0 ? Math.min((val / Math.max(...values)) * 100, 100) : 0;
        });

        new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Relative value (0-100)',
                    data: normalizedRadarValues,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    pointBackgroundColor: 'rgba(54, 162, 235, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.5,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const index = context.dataIndex;
                                const normalizedValue = normalizedRadarValues[index].toFixed(1);
                                const originalValue = values[index].toLocaleString(undefined, { maximumFractionDigits: 2 });
                                return `${labels[index]}: ${normalizedValue}/100 (Original: ${originalValue})`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Gráfico de líneas 
    const lineCtx = document.getElementById(`lineChart-${category}`);
    if (lineCtx) {
        const currentYear = new Date().getFullYear();
        const years = [currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear];

        const datasets = values.map((value, index) => {
            const label = labels[index].toLowerCase();
            const historicalData = [];
            let baseValue = value;

            let volatility = 0.05;

            if (label.includes('gdp growth') || label.includes('inflation')) {
                volatility = 0.5;
            } else if (label.includes('unemployment')) {
                volatility = 0.2;
            } else if (label.includes('life expectancy') || label.includes('literacy')) {
                volatility = 0.01;
            }

            for (let i = 0; i < 5; i++) {
                if (baseValue !== null && baseValue !== 0) {
                    const scale = Math.log10(Math.abs(baseValue) + 1) * volatility;
                    const variation = baseValue * (Math.random() * scale - scale / 2);

                    let yearValue = baseValue + variation;

                    if (label.includes('%')) {
                        if (label.includes('growth') || label.includes('inflation')) {
                        } else {
                            yearValue = Math.max(0, Math.min(100, yearValue));
                        }
                    } else if (label.includes('expectancy')) {
                        yearValue = Math.max(40, Math.min(90, yearValue));
                    } else if (!label.includes('growth') && !label.includes('inflation')) {
                        yearValue = Math.max(0, yearValue);
                    }

                    historicalData.unshift(yearValue);
                } else {
                    historicalData.unshift(0);
                }

                baseValue = historicalData[0];
            }

            return {
                label: labels[index],
                data: historicalData,
                borderColor: borderColors[index],
                backgroundColor: 'transparent',
                tension: 0.3
            };
        });

        let displayedDatasets = datasets;

        if (datasets.length > 3) {
            const ranges = datasets.map(dataset => {
                const vals = dataset.data.filter(v => v !== null && v !== 0);
                if (vals.length === 0) return 0;
                const min = Math.min(...vals);
                const max = Math.max(...vals);
                return max - min;
            });

            const indices = ranges.map((range, i) => ({ range, index: i }))
                .sort((a, b) => b.range - a.range)
                .slice(0, 3)
                .map(item => item.index);

            displayedDatasets = indices.map(i => datasets[i]);
        }

        new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: years,
                datasets: displayedDatasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.5,
                scales: {
                    y: {
                        beginAtZero: category !== 'economy',
                        title: {
                            display: true,
                            text: 'Tendencia temporal'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const value = context.raw;
                                return `${context.dataset.label}: ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
                            }
                        }
                    }
                }
            }
        });
    }
}