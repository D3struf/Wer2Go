import { socket, loadPage } from '../script.js';
export var updatedLocations;

// Dynamically generate html for each voters
// function createRankingElements(voterId) {
//     let voterContainer = document.getElementById('container');

//     //Create div container
//     let container = document.createElement('div');

//     // Create h2 element
//     let h2 = document.createElement('h2');
//     h2.textContent = 'Rank (Voter ' + voterId + ')';
    
//     // Create button element
//     let button = document.createElement('button');
//     button.id = 'voter_' + voterId;
//     button.type = 'button';
//     button.textContent = 'Rank Candidates';

//     // Create p element
//     let p = document.createElement('p');
//     p.id = 'voter-' + voterId;

//     // Append elements to the body or any other container element
//     container.appendChild(h2);
//     container.appendChild(button);
//     container.appendChild(p);

//     voterContainer.appendChild(container);

//     // Add event listener to the button
//     button.addEventListener('click', function () {
        
//         voters[voterId] = rank();
//     });
// }

// function candidate_number() {
//     candidate_num = prompt("Please enter your name", "0");
//     if (candidate_num != null) {
//         document.getElementById("candidate_num_print").innerHTML =
//         "Number of Candidates: " + candidate_num;
//     }
    
//     create_voters();
// }

// // Dynamically create a new voters object
// function create_voters() {
//     for (let i = 0; i < candidate_num; i++) {
//         document.getElementById('mem').innerHTML = i;
//         createRankingElements(i);
//     }
// }

// // Get the location the users inputted
// function rank() {
//     // Submit Button on the map
//     const {coords, address, name } = submittedLocation;

//     resultObject.coords = coords;
//     resultObject.address = address;
//     resultObject.name = name;
    
//     document.getElementById('mem').innerHTML = resultObject.address;
//     return resultObject.address;
// }

// // Show the lists of addresses as candidates
// function total_votes() {
//     document.getElementById("all-votes").innerHTML =
//     "Locations: " + voters;
    
//     create_candidates();
// }

// // Create a button for users to vote on
// function create_candidates() {
//     for (let i = 0; i < candidate_num; i++) {
//         let num = i;
//         updateProgressBar(num);
//     }
// }



// In your select-location.html


// socket.on('up-loc', (locations) => {
//     // Update the UI to display the submitted locations
//     // displaySubmittedLocations(locations);
    
//     document.getElementById('demo').innerHTML = locations;
// });

// const submitButton = document.getElementById('submit');
// submitButton.addEventListener('click', () => {
//     // Retrieve selected location from the map (implement based on your map library)
//     const selectedLocation = getSelectedLocation();

//     // Emit the selected location to the server
//     socket.emit('submit-location', { location: selectedLocation });
// });

document.addEventListener('DOMContentLoaded', function () {
    const overlay = document.getElementById('overlay')
    const confirmOverlayBtn = document.getElementById('confirmOverlayBtn')

    // Close overlay
    confirmOverlayBtn.addEventListener('click', () => {
        overlay.style.display = 'none'
        // Emit the 'get-locations' event to request the updated locations
        socket.emit('get-locations')

        // Listen for the 'set-locations' event
        socket.on('set-locations', data => {
            updatedLocations = data;
            console.log('Inside the socket locations:', updatedLocations);
            
            // Process the updatedLocations as needed
            // processUpdatedLocations(updatedLocations);
            
            // Now you can redirect or perform other actions
            if (confirmOverlayBtn.textContent === 'Confirm') {
                loadPage('../voting/voting.html')
            }
        });
        })

    // Close overlay when clicking outside the content
    window.addEventListener('click', function (event) {
        if (event.target === overlay) {
            overlay.style.display = 'none'
        }
    });
});
