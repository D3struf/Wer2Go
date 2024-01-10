import { socket, loadPage } from '../script.js'
import { sortableList } from '../voting/drag-script.js'
import { updatedLocations } from '../select-location/map-script.js'

socket.on('return-num-players', submittedLocations => {
    const waitingContainer = document.getElementById('waiting-text')
    waitingContainer.innerHTML = ""

    submittedLocations.forEach((location, index) => {
        const list = document.createElement('li')
        list.draggable = true
        
        const div = document.createElement('div')
        div.textContent = `${index + 1}. ${location.location}`

        const nextLine = document.createElement('br')

        const { lat, lng } = location.coords
        const latAndLng = `${lat},${lng}`
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(latAndLng)}`

        const anchorTag = document.createElement('a')
        anchorTag.href = googleMapsUrl
        anchorTag.target = '_blank'
        anchorTag.textContent = 'See Location👀'

        div.appendChild(nextLine)
        div.appendChild(anchorTag)
        list.appendChild(div)

        sortableList.appendChild(list)
    })

    const submitRanking = document.createElement('button')
    submitRanking.id = 'submit-ranking'
    submitRanking.type = 'submit'
    submitRanking.textContent = 'Submit'

    document.documentElement.appendChild(submitRanking)

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
})

socket.emit('check-num-players', () => {
    loadPage('../voting/voting.html')
})