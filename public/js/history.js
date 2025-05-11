document.addEventListener('DOMContentLoaded', () => {
    const countryName = typeof countryNameBlade !== 'undefined' 
        ? countryNameBlade.replace(/-/g, ' ').replace(/\s*\(.*$/, '')
        : 'Spain'; 
        
    createHistoryCarousel(countryName);
});

/* Crear el carrusel de historia */
function createHistoryCarousel(country) {
    const historyContainer = document.getElementById('history');
    if (!historyContainer) {
        console.error('Elemento con ID "history" no encontrado');
        return;
    }
        
    getCountryInfo(country)
        .then(countryData => {
            if (countryData) {
                return getHistorySections(country).then(sections => {
                    return { countryData, sections };
                });
            } else {
                throw new Error(`No se encontró información para ${country}`);
            }
        })
        .then(data => {
            if (data.countryData) {
                renderHistoryCarousel(country, data.countryData, data.sections, historyContainer);
            } else {
                historyContainer.innerHTML = `<p>No se encontró información histórica para ${country}.</p>`;
            }
        })
        .catch(error => {
            console.error('Error al crear el carrusel de historia:', error);
            historyContainer.innerHTML = `<p>Error al cargar la historia de ${country}. ${error.message}</p>`;
        });
}


/* Obtener información general del país y su historia*/
function getCountryInfo(country) {
    const formattedCountry = formatCountryName(country);
    
    const historyTitle = `History_of_${formattedCountry}`;
    
    const apiUrl = 'https://en.wikipedia.org/w/api.php';
    
    const params = {
        action: 'query',
        format: 'json',
        prop: 'extracts|pageimages',
        exintro: 1,
        explaintext: 1,
        titles: historyTitle,
        piprop: 'thumbnail',
        pithumbsize: 400,
        origin: '*', 
        redirects: 1
    };
    
    const url = new URL(apiUrl);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];
            
            if (pageId !== '-1' && pages[pageId].extract) {
                return {
                    title: pages[pageId].title,
                    extract: pages[pageId].extract,
                    image: pages[pageId].thumbnail ? pages[pageId].thumbnail.source : null
                };
            } else {
                const countryParams = { ...params, titles: formattedCountry };
                const countryUrl = new URL(apiUrl);
                Object.keys(countryParams).forEach(key => countryUrl.searchParams.append(key, countryParams[key]));
                
                return fetch(countryUrl)
                    .then(response => response.json())
                    .then(countryData => {
                        const countryPages = countryData.query.pages;
                        const countryPageId = Object.keys(countryPages)[0];
                        
                        if (countryPageId !== '-1' && countryPages[countryPageId].extract) {
                            return {
                                title: countryPages[countryPageId].title,
                                extract: countryPages[countryPageId].extract,
                                image: countryPages[countryPageId].thumbnail ? countryPages[countryPageId].thumbnail.source : null
                            };
                        } else {
                            return null;
                        }
                    });
            }
        })
        .catch(error => {
            console.error('Error al obtener información del país:', error);
            return null;
        });
}

/* Obtener las secciones de la página de historia */
function getHistorySections(country) {
    const formattedCountry = formatCountryName(country);
    
    const historyTitle = `History_of_${formattedCountry}`;
    
    const apiUrl = 'https://en.wikipedia.org/w/api.php';
    
    const params = {
        action: 'parse',
        format: 'json',
        page: historyTitle,
        prop: 'sections',
        origin: '*', 
        redirects: 1
    };
    
    const url = new URL(apiUrl);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.parse && data.parse.sections) {
                const excludeSections = ['See also', 'References', 'External links', 'Further reading', 'Notes', 'Bibliography'];
                
                return data.parse.sections
                    .filter(section => 
                        section.toclevel <= 2 && 
                        !excludeSections.includes(section.line) &&
                        !section.line.includes('References') &&
                        !section.line.includes('Bibliography')
                    )
                    .map(section => ({
                        index: section.index,
                        level: section.toclevel,
                        title: section.line,
                        anchor: section.anchor
                    }));
            } else {
                const countryParams = { ...params, page: formattedCountry };
                const countryUrl = new URL(apiUrl);
                Object.keys(countryParams).forEach(key => countryUrl.searchParams.append(key, countryParams[key]));
                
                return fetch(countryUrl)
                    .then(response => response.json())
                    .then(countryData => {
                        if (countryData.parse && countryData.parse.sections) {
                            const historySections = countryData.parse.sections
                                .filter(section => 
                                    (section.line.toLowerCase().includes('history') || 
                                     section.line.toLowerCase().includes('historia')) &&
                                    section.toclevel <= 2
                                );
                                
                            if (historySections.length > 0) {
                                return historySections.map(section => ({
                                    index: section.index,
                                    level: section.toclevel,
                                    title: section.line,
                                    anchor: section.anchor
                                }));
                            }
                            
                            const relevantSections = countryData.parse.sections
                                .filter(section => 
                                    section.toclevel <= 2 && 
                                    !excludeSections.includes(section.line) &&
                                    !section.line.includes('References') &&
                                    !section.line.includes('Bibliography')
                                )
                                .map(section => ({
                                    index: section.index,
                                    level: section.toclevel,
                                    title: section.line,
                                    anchor: section.anchor
                                }));
                                
                            return relevantSections;
                        }
                        
                        return [];
                    });
            }
        })
        .catch(error => {
            console.error('Error al obtener secciones de historia:', error);
            return [];
        });
}

/* Obtener el contenido de una sección específica */
function getSectionContent(pageTitle, sectionIndex) {
    const apiUrl = 'https://en.wikipedia.org/w/api.php';
    
    const params = {
        action: 'parse',
        format: 'json',
        page: pageTitle,
        section: sectionIndex,
        prop: 'text|images',
        origin: '*', 
        disabletoc: 1
    };
    
    const url = new URL(apiUrl);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            let content = 'Contenido no disponible';
            let image = null;
            
            if (data.parse && data.parse.text && data.parse.text['*']) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = data.parse.text['*'];
                
                const elementsToRemove = tempDiv.querySelectorAll('.mw-editsection, .reference, .reflist');
                elementsToRemove.forEach(el => el.remove());
                
                const paragraphs = tempDiv.querySelectorAll('p');
                content = '';
                
                for (let i = 0; i < paragraphs.length && content.length < 500; i++) {
                    if (paragraphs[i].textContent.trim().length > 20) {
                        content += paragraphs[i].textContent + ' ';
                    }
                }
                
                content = content.trim() || 'Contenido no disponible';
                
                const images = tempDiv.querySelectorAll('img');
                if (images.length > 0) {
                    for (let i = 0; i < images.length; i++) {
                        const imgSrc = images[i].getAttribute('src');
                        if (imgSrc && !imgSrc.includes('icon') && !imgSrc.includes('Symbol') && !imgSrc.includes('logo')) {
                            if (imgSrc.startsWith('/')) {
                                image = 'https:' + imgSrc;
                            } else {
                                image = imgSrc;
                            }
                            break;
                        }
                    }
                }
            }
            
            if (!image && data.parse && data.parse.images && data.parse.images.length > 0) {
                const possibleImages = data.parse.images.filter(img => 
                    !img.toLowerCase().includes('icon') && 
                    !img.toLowerCase().includes('symbol') && 
                    !img.toLowerCase().includes('logo')
                );
                
                if (possibleImages.length > 0) {
                    const imgTitle = possibleImages[0];
                    return getImageUrl(imgTitle).then(imgUrl => {
                        return { content, image: imgUrl };
                    });
                }
            }
            
            return { content, image };
        })
        .catch(error => {
            console.error('Error al obtener contenido de sección:', error);
            return { content: 'Contenido no disponible', image: null };
        });
}

/* Obtiene la URL de la imagen a partir del título */ 
function getImageUrl(imageTitle) {
    const apiUrl = 'https://en.wikipedia.org/w/api.php';
    
    const params = {
        action: 'query',
        format: 'json',
        prop: 'imageinfo',
        titles: `File:${imageTitle}`,
        iiprop: 'url',
        origin: '*' 
    };
    
    const url = new URL(apiUrl);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];
            
            if (pageId !== '-1' && pages[pageId].imageinfo && pages[pageId].imageinfo.length > 0) {
                return pages[pageId].imageinfo[0].url;
            }
            
            return null;
        })
        .catch(error => {
            console.error('Error al obtener URL de imagen:', error);
            return null;
        });
}

/* Formatear el nombre del país */
function formatCountryName(country) {
    return country
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('_')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

/* Renderizar carrusel de historia */
function renderHistoryCarousel(country, countryData, sections, container) {
    const pageTitle = countryData.title || formatCountryName(country);
    
    let html = `
        <div class="custom-carousel">
            <div class="carousel-slides">
                <div class="carousel-slide active" data-index="0">
                    <div class="carousel-content">
                        <div class="carousel-text">
                            <h4>Summary</h4>
                            <p>${countryData.extract}</p>
                        </div>
                        <div class="carousel-image">
                            ${countryData.image ? 
                              `<img src="${countryData.image}" alt="Imagen de ${country}">` : 
                              `<div class="no-image"></div>`
                            }
                        </div>
                    </div>
                </div>
            </div>
            
            <button class="carousel-prev" aria-label="Anterior">&#10094;</button>
            <button class="carousel-next" aria-label="Siguiente">&#10095;</button>
            
            <div class="carousel-nav">
                <span class="carousel-dot active" data-index="0"></span>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    const carousel = container.querySelector('.custom-carousel');
    const slidesContainer = carousel.querySelector('.carousel-slides');
    const prevButton = carousel.querySelector('.carousel-prev');
    const nextButton = carousel.querySelector('.carousel-next');
    const dotsContainer = carousel.querySelector('.carousel-nav');
    
    let currentSlide = 0;
    let totalSlides = 1; 
    
    if (sections && sections.length > 0) {
        const sectionPromises = sections.map(section => {
            return getSectionContent(pageTitle, section.index).then(sectionData => {
                return {
                    title: section.title,
                    content: sectionData.content,
                    image: sectionData.image,
                    index: section.index
                };
            });
        });
        
        // Promesa para anadir las secciones al carrusel una vez tengamos su contenido
        Promise.all(sectionPromises)
            .then(sectionContents => {
                const validSections = sectionContents.filter(section => 
                    section.content && section.content !== 'Contenido no disponible'
                );
                
                totalSlides = 1 + validSections.length;
                
                validSections.forEach((section, index) => {
                    const slide = document.createElement('div');
                    slide.className = 'carousel-slide';
                    slide.setAttribute('data-index', index + 1);
                    
                    slide.innerHTML = `
                        <div class="carousel-content">
                            <div class="carousel-text">
                                <h4>${section.title}</h4>
                                <p>${section.content}</p>
                            </div>
                            <div class="carousel-image">
                                ${section.image ? 
                                  `<img src="${section.image}" alt="Imagen de ${section.title}">` : 
                                  `<div class="no-image"></div>`
                                }
                            </div>
                        </div>
                    `;
                    
                    slidesContainer.appendChild(slide);
                    
                    const dot = document.createElement('span');
                    dot.className = 'carousel-dot';
                    dot.setAttribute('data-index', index + 1);
                    dotsContainer.appendChild(dot);
                    
                    dot.addEventListener('click', () => {
                        goToSlide(index + 1);
                    });
                });
                
                setupCarouselNavigation();
            })
            .catch(error => {
                console.error('Error al renderizar secciones:', error);
                container.innerHTML += `<p>Error al cargar las secciones de historia: ${error.message}</p>`;
            });
    } else {
        setupCarouselNavigation();
    }
    
    /* Navegación del carrusel */
    function setupCarouselNavigation() {
        prevButton.addEventListener('click', () => {
            goToSlide(currentSlide - 1);
        });
        
        nextButton.addEventListener('click', () => {
            goToSlide(currentSlide + 1);
        });
        
        const firstDot = dotsContainer.querySelector('.carousel-dot');
        if (firstDot) {
            firstDot.addEventListener('click', () => {
                goToSlide(0);
            });
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                goToSlide(currentSlide - 1);
            } else if (e.key === 'ArrowRight') {
                goToSlide(currentSlide + 1);
            }
        });
        
        updateNavButtons();
    }
    
    /* Navegar a un slide específico */
    function goToSlide(index) {
        if (index < 0) {
            index = 0;
        } else if (index >= totalSlides) {
            index = totalSlides - 1;
        }
        
        currentSlide = index;
        
        const slides = slidesContainer.querySelectorAll('.carousel-slide');
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        const activeSlide = slidesContainer.querySelector(`.carousel-slide[data-index="${currentSlide}"]`);
        if (activeSlide) {
            activeSlide.classList.add('active');
        }
        
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        const activeDot = dotsContainer.querySelector(`.carousel-dot[data-index="${currentSlide}"]`);
        if (activeDot) {
            activeDot.classList.add('active');
        }
        
        updateNavButtons();
    }
    
    /* Visibilidad de los botones de navegación */
    function updateNavButtons() {
        if (totalSlides <= 1) {
            prevButton.style.display = 'none';
            nextButton.style.display = 'none';
            return;
        }
        
        prevButton.style.display = currentSlide === 0 ? 'none' : 'flex';
        nextButton.style.display = currentSlide === totalSlides - 1 ? 'none' : 'flex';
    }
}