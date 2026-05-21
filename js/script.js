/*
* Met Museum Art Explorer
* Suche Kunstwerke mit der Met Museum API
* und zeige die Bilder als Karten an.
*/

const apiBase = 'https://collectionapi.metmuseum.org/public/collection/v1';

const searchInput = document.querySelector('#searchInput');
const searchType = document.querySelector('#searchType');
const departmentSelect = document.querySelector('#departmentSelect');
const dateBeginInput = document.querySelector('#dateBeginInput');
const dateEndInput = document.querySelector('#dateEndInput');

const hasImagesCheckbox = document.querySelector('#hasImagesCheckbox');
const highlightCheckbox = document.querySelector('#highlightCheckbox');
const onViewCheckbox = document.querySelector('#onViewCheckbox');

const searchButton = document.querySelector('#searchButton');
const statusText = document.querySelector('#statusText');
const results = document.querySelector('#results');


/*
* Departments beim Start laden
*/
loadDepartments();


/*
* Departments laden
*/
async function loadDepartments() {
    try {
        const response = await fetch(apiBase + '/departments');

        if (!response.ok) {
            throw new Error('Departments konnten nicht geladen werden.');
        }

        const data = await response.json();

        for (let i = 0; i < data.departments.length; i++) {
            const department = data.departments[i];

            const option = document.createElement('option');
            option.value = department.departmentId;
            option.textContent = department.displayName;

            departmentSelect.appendChild(option);
        }
    } catch (error) {
        console.error(error);
        statusText.textContent = 'Departments konnten nicht geladen werden.';
    }
}


/*
* Suche starten, wenn man auf den Button klickt
*/
searchButton.addEventListener('click', function (e) {
    e.preventDefault();
    searchArtworks();
});


/*
* Suche auch starten, wenn man Enter drückt
*/
searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        searchArtworks();
    }
});


/*
* Kunstwerke suchen
*/
async function searchArtworks() {
    const searchText = searchInput.value.trim();

    if (searchText === '') {
        statusText.textContent = 'Bitte gib einen Suchbegriff ein.';
        results.innerHTML = '';
        return;
    }

    results.innerHTML = '';
    statusText.textContent = 'Suche läuft...';
    searchButton.disabled = true;

    try {
        const searchUrl = createSearchUrl(searchText);

        console.log('Such-URL:', searchUrl);
        console.log('Suchen in:', searchType.value);

        const response = await fetch(searchUrl);

        if (!response.ok) {
            throw new Error('Suche konnte nicht geladen werden.');
        }

        const data = await response.json();

        if (!data.objectIDs || data.objectIDs.length === 0) {
            statusText.textContent = 'Keine Ergebnisse gefunden.';
            results.innerHTML = '';
            return;
        }

        const artworks = [];

        /*
        * Nicht alle Objekte laden, sonst dauert es zu lange.
        */
        const maxObjectsToCheck = Math.min(data.objectIDs.length, 40);

        for (let i = 0; i < maxObjectsToCheck; i++) {
            const objectId = data.objectIDs[i];
            const artwork = await loadArtwork(objectId);

            if (artwork !== null) {
                if (hasImagesCheckbox.checked === true) {
                    if (artwork.primaryImageSmall !== '' || artwork.primaryImage !== '') {
                        artworks.push(artwork);
                    }
                } else {
                    artworks.push(artwork);
                }
            }

            if (artworks.length === 24) {
                break;
            }
        }

        if (artworks.length === 0) {
            statusText.textContent = 'Keine Ergebnisse gefunden.';
            results.innerHTML = '';
            return;
        }

        statusText.textContent = artworks.length + ' Kunstwerke werden angezeigt.';
        showArtworks(artworks);

    } catch (error) {
        console.error(error);
        statusText.textContent = 'Keine Ergebnisse gefunden.';
        results.innerHTML = '';
    } finally {
        searchButton.disabled = false;
    }
}


/*
* URL für die Suche zusammensetzen
*/
function createSearchUrl(searchText) {
    let url = apiBase + '/search?q=' + searchText;

    if (hasImagesCheckbox.checked === true) {
        url = url + '&hasImages=true';
    }

    if (highlightCheckbox.checked === true) {
        url = url + '&isHighlight=true';
    }

    if (onViewCheckbox.checked === true) {
        url = url + '&isOnView=true';
    }

    if (departmentSelect.value !== '') {
        url = url + '&departmentId=' + departmentSelect.value;
    }

    /*
    * Die Met API braucht beide Werte:
    * dateBegin und dateEnd.
    */
    if (dateBeginInput.value.trim() !== '' && dateEndInput.value.trim() !== '') {
        url = url + '&dateBegin=' + dateBeginInput.value.trim();
        url = url + '&dateEnd=' + dateEndInput.value.trim();
    }

    /*
    * Suchen in ...
    */
    if (searchType.value === 'title') {
        url = url + '&title=true';
    } else if (searchType.value === 'tags') {
        url = url + '&tags=true';
    } else if (searchType.value === 'artistOrCulture') {
        url = url + '&artistOrCulture=true';
    }

    return url;
}


/*
* Einzelnes Kunstwerk laden
*/
async function loadArtwork(objectId) {
    try {
        const response = await fetch(apiBase + '/objects/' + objectId);

        if (!response.ok) {
            throw new Error('Objekt konnte nicht geladen werden.');
        }

        const artwork = await response.json();

        return artwork;
    } catch (error) {
        console.log('Fehler bei Objekt:', objectId);
        return null;
    }
}


/*
* Kunstwerke anzeigen
*/
function showArtworks(artworks) {
    results.innerHTML = '';

    for (let i = 0; i < artworks.length; i++) {
        const artwork = artworks[i];

        const card = document.createElement('article');
        card.classList.add('card');

        let imageUrl = artwork.primaryImageSmall;

        if (imageUrl === '') {
            imageUrl = artwork.primaryImage;
        }

        if (imageUrl === '') {
            imageUrl = 'https://via.placeholder.com/500x400?text=Kein+Bild';
        }

        card.innerHTML = `
            <div class="card-image">
                <img src="${imageUrl}" alt="">
                ${artwork.isHighlight ? '<span class="tag tag-image">Highlight</span>' : ''}
            </div>

            <div class="card-content">
                <h2>${artwork.title || 'Ohne Titel'}</h2>

                <p class="meta">
                    <strong>Künstler:</strong>
                    ${artwork.artistDisplayName || 'Unbekannt'}
                </p>

                <p class="meta">
                    <strong>Datum:</strong>
                    ${artwork.objectDate || 'Keine Angabe'}
                </p>

                <p class="meta">
                    <strong>Medium:</strong>
                    ${artwork.medium || 'Keine Angabe'}
                </p>

                <p class="meta">
                    <strong>Department:</strong>
                    ${artwork.department || 'Keine Angabe'}
                </p>

                <a href="${artwork.objectURL}" target="_blank" rel="noopener noreferrer">
                    Im Met Museum ansehen
                </a>
            </div>
        `;

        results.appendChild(card);
    }
}