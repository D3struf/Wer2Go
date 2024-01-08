import { socket } from './script.js';

// Define sortableList
const sortableList = document.getElementById("sortable");

// Event listener for when a container is dropped
socket.on('get-locations', (updatedLocations) => {
    console.log('Updated locations:', updatedLocations);
    displayUpdatedLocations(updatedLocations);
});

function displayUpdatedLocations(updatedLocations) {
    // Clear previous content
    sortableList.innerHTML = '';

    for (const key in updatedLocations) {
        const list = document.createElement('li');
        list.draggable = true;
        list.textContent = updatedLocations[key].location;
        sortableList.appendChild(list);
    }
}
