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
});

searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
});