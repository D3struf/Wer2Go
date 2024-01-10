import { socket, loadPage } from '../script.js'
import { sortableList } from '../voting/drag-script.js'
import { updatedLocations } from '../select-location/map-script.js'

document.addEventListener('DOMContentLoaded', function () {
    updatedLocations.forEach((location, index) => {
        const list = document.createElement('li')
        list.draggable = true
        list.textContent = `${index + 1}. ${location.location}`

        const nextLine = document.createElement('br')
        
        const { lat, lng } = location.coords
        const latAndLng = `${lat},${lng}`
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(latAndLng)}`

        const anchorTag = document.createElement('a')
        anchorTag.href = googleMapsUrl
        anchorTag.target = '_blank'
        anchorTag.textContent = 'See Location👀'
        
        list.appendChild(nextLine)
        list.appendChild(anchorTag)

        sortableList.appendChild(list)
    })
})

document.getElementById('submit-ranking').addEventListener('click', function () {
    // Assuming sortableList is a UL element
    const liElements = sortableList.querySelectorAll('li')

    // Convert NodeList to an array and get the text contents
    const textContents = Array.from(liElements).map((li) => li.textContent.replace(/See Location👀/g, ''))

    // Now, textContents is an array containing the text contents of all li elements
    console.log(textContents)
    socket.emit('location-rankings', textContents)
    loadPage('../winner/show-winner.html')
})