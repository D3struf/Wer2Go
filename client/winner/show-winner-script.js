import { socket, loadPage } from "../script"
let overallRankings = []

socket.on('display-location-rankings', rankings => {
    const rankingContainer = document.getElementById('ranking')
    rankingContainer.textContent = ""
    createTable(rankingContainer)

    overallRankings.push(...rankings)

    const winner = determineWinner()
    const leaderboardBody = document.getElementById('leaderboardBody')

    // Sort the winners based on score (highest to lowest)
    winner.sort((a, b) => b.score - a.score)

    // Display leaderboard
    winner.forEach(wins => {
        const row = document.createElement('tr')
        const locationCell = document.createElement('td')
        locationCell.textContent = wins.location
        const scoreCell = document.createElement('td')
        scoreCell.textContent = wins.score

        row.appendChild(locationCell)
        row.appendChild(scoreCell)
        leaderboardBody.appendChild(row)
    });
    triggerConfetti()
})

socket.emit('get-location-rankings', () => {
    loadPage('../winner/show-winner.html')
})

function determineWinner() {
    const count = overallRankings.length;
    const scoreRankings = [];

    // Initialize an object to store aggregated rankings for each location
    const aggregatedRankings = {};

    // Iterate through overall rankings for all players
    overallRankings.forEach((playerRanking, playerIndex) => {
        playerRanking.ranking.forEach((location, locationIndex) => {
            // If the location is not yet in the aggregated rankings, initialize it
            if (!aggregatedRankings[location]) {
                aggregatedRankings[location] = [];
            }

            // Add the player's rank for the current location to the aggregated rankings
            aggregatedRankings[location].push(count - locationIndex + 1);
        });
    });

    // Iterate through aggregated rankings to calculate scores
    Object.entries(aggregatedRankings).forEach(([location, ranks]) => {
        // Calculate the total score for the location
        const totalScore = ranks.reduce((sum, rank) => sum + rank, 0) - ranks.length;

        // Find the highest score
        const maxScore = Math.max(...ranks);

        // Check if there is a tie
        const isTie = ranks.filter(score => score === maxScore).length > 1;

        // Store the result for the current location
        scoreRankings.push({
            location,
            winner: isTie ? 'tie' : getKeyByValue(aggregatedRankings, maxScore),
            score: totalScore,
        });
    });

    return scoreRankings;
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

function createTable(rankingContainer) {
    // Create the table element
    const leaderboardTable = document.createElement('table')
    leaderboardTable.id = 'leaderboard'

    // Create the table header (thead) and its row (tr)
    const tableHead = document.createElement('thead')
    const tableHeadRow = document.createElement('tr')

    // Create the Location header cell
    const locationHeaderCell = document.createElement('th')
    locationHeaderCell.textContent = 'Location'
    tableHeadRow.appendChild(locationHeaderCell)

    // Create the Score header cell
    const scoreHeaderCell = document.createElement('th')
    scoreHeaderCell.textContent = 'Score'
    tableHeadRow.appendChild(scoreHeaderCell)

    // Append the header row to the table header
    tableHead.appendChild(tableHeadRow)

    // Create the table body (tbody)
    const tableBody = document.createElement('tbody')
    tableBody.id = 'leaderboardBody' // Set the ID for the tbody

    // Append the table head and body to the table
    leaderboardTable.appendChild(tableHead)
    leaderboardTable.appendChild(tableBody)

    // Append the table to the parent container
    rankingContainer.appendChild(leaderboardTable)

    const leaveBtn = document.createElement('button')
    leaveBtn.textContent = 'Leave Room'
    leaveBtn.id = 'leave-room'
    document.body.appendChild(leaveBtn)

    leaveBtn.addEventListener('click', function() {
        window.location.href = '../home.html';
    })
}

function triggerConfetti() {
    // Use canvas-confetti library to create a confetti effect
    confetti({
        particleCount: 800,
        spread: 150,
        origin: { y: 0.5 },
    });
}