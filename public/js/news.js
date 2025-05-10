function getNewsData(country) {
    if (!country) {
        console.error('No country provided');
        document.getElementById('news').innerHTML = '<p>No country specified for news.</p>';
        return;
    }
    fetch('/news-api-key')
        .then(res => {
            if (!res.ok) {
                throw new Error('Failed to fetch API key. Status: ' + res.status);
            }
            return res.json();
        })
        .then(config => {
            if (!config || !config.api_key) {
                throw new Error('Invalid API key configuration');
            }

            const apiKey = config.api_key;
            const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(country)}&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}&language=en`;

            return fetch(url).then(res => res.json());
        })
        .then(data => {
            if (data.articles && data.articles.length > 0) {
                const newsContainer = document.getElementById('news');
                let html = `<div class="news-grid">`;

                const topArticles = data.articles.slice(0, 8);

                topArticles.forEach(article => {
                    const title = article.title ? article.title.replace(/null/g, '') : 'Untitled';
                    const description = article.description ? article.description.substring(0, 120) + '...' : 'No description available.';
                    const url = article.url || '#';
                    const image = article.urlToImage || '/img/news-placeholder.jpg';
                    const source = article.source && article.source.name ? article.source.name : 'Unknown Source';
                    const date = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : '';

                    html += `
                        <div class="news-card">
                            <div class="news-image">
                                <img src="${image}" alt="${title}" onerror="this.src='/img/news-placeholder.png'">
                            </div>
                            <div class="news-content">
                                <div class="news-source">${source} · ${date}</div>
                                <h4>${title}</h4>
                                <p>${description}</p>
                                <a href="${url}" target="_blank" rel="noopener noreferrer">Read more</a>
                            </div>
                        </div>
                    `;
                });

                html += `</div>`;
                newsContainer.innerHTML = html;

                // Efecto hover con rotación aleatoria
                const cards = document.querySelectorAll('.news-card');

                cards.forEach(card => {
                    card.addEventListener('mouseenter', () => {
                        const randomAngle = (Math.random() * 6 - 3).toFixed(2);
                        card.style.transition = 'transform 0.3s ease';
                        card.style.transform = `translateY(-5px) rotate(${randomAngle}deg) scale(1.01)`;
                    });

                    card.addEventListener('mouseleave', () => {
                        card.style.transform = 'translateY(0) rotate(0deg) scale(1)';
                    });
                });

            } else {
                document.getElementById('news').innerHTML = '<p>No news found for this country.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching news:', error);
            document.getElementById('news').innerHTML = `<p>Error loading news: ${error.message}</p>`;
        });
}
