// for admin ui
const { instrument } = require("@socket.io/admin-ui")

const io = require('socket.io')(3000, {
    cors: {
        origin: ["http://localhost:8080", "https://admin.socket.io", "http://169.254.68.28:8080", "http://192.168.100.128:8080"],
        credentials: true
    },
})

let activeRooms = []
let submittedLocations = []
let playerLocationRankings = []
let playersCount = []
let submitCount = []

// Default namespace for localHost
io.on("connection", socket => {
    socket.on("disconnect", () => {
        // Remove the disconnected socket from activeRooms
        for (let i = 0; i < activeRooms.length; i++) {
            const index = activeRooms[i].players.indexOf(socket.id)
            if (index !== -1) {
                activeRooms[i].players.splice(index, 1)
                if (activeRooms[i].players.length === 0) {
                    // Remove the entire room if no players are left
                    activeRooms = []
                    submittedLocations = []
                    playerLocationRankings = []
                }
                break  // Stop searching after finding the room
            }
        }

        console.log(`Player ${socket.id} disconnected`)
        console.log(activeRooms)
    });

    console.log("Socket ID: " + socket.id)
    socket.on ("send-message", (message, room) => {
        if (room === "") {
            socket.emit("receive-message", message)
        }
        else {
            socket.to(room).emit("receive-message", message)
        }
    })

    socket.on("join-room", (room, cb) => {
        const roomToSearch = room
        const existingRoom = activeRooms.find(room => room.id === roomToSearch)
        if (existingRoom) {
            socket.join(room)
            existingRoom.players.push(socket.id);
            cb(`Joined ${room}`)
            console.log(`Player ${socket.id} joined Room ${room}`)
            console.log(activeRooms)
        } else {
            cb("ROOM NOT FOUND")
        }
    })

    socket.on("host-room", (room, cb) => {
        socket.join(room)
        const newRoom = {
            id: room,
            players: [socket.id]
        }
        activeRooms.push(newRoom)
        cb(`Joined ${room}`)
        console.log(`Host Room created with ID: ${room}`)
        console.log(activeRooms)
    })

    socket.on("start-game", (room, cb) => {
        io.to(room).emit("game-started")
        cb(`Game started in room ${room}`)
    })

    socket.on('submit-location', ({ location, coords, roomId }) => {
        // Check if the room ID exists in the submittedLocationsByRoom object
        if (!submittedLocations[roomId]) {
            // If the room ID doesn't exist, create an array for it
            submittedLocations[roomId] = []
        }

        // Find the player's index in the room's submitted locations
        const existingPlayerIndex = submittedLocations[roomId].findIndex(player => player.socketId === socket.id)

        if (existingPlayerIndex !== -1) {
            // Update the existing player's location and coordinates
            submittedLocations[roomId][existingPlayerIndex].location = location
            submittedLocations[roomId][existingPlayerIndex].coords = coords
        } else {
            // If the player doesn't exist in the room, add them
            submittedLocations[roomId].push({ socketId: socket.id, location, coords })
        }

        console.log(submittedLocations)

        // Broadcast the updated list of submitted locations to all clients in the same room
        io.to(roomId).emit('update-locations', submittedLocations[roomId])
    })

    socket.on('get-locations', () => {
        socket.emit('set-locations', submittedLocations)
    })

    socket.on('location-rankings', (ranks, roomId) => {
        if (!playerLocationRankings[roomId]) {
            // If the room ID doesn't exist, create an array for it
            playerLocationRankings[roomId] = []
        }

        const existingPlayerIndex = playerLocationRankings[roomId].findIndex(player => player.socketId === socket.id)

        if (existingPlayerIndex !== -1) {
            playerLocationRankings[roomId][existingPlayerIndex].ranks = ranks
        }
        else {
            playerLocationRankings[roomId].push({ socketId: socket.id, ranking: ranks })
        }
        console.log(playerLocationRankings[roomId])
    })

    socket.on('check-num-players', roomId => {
        let totalPlayers = 0
        if (!submitCount[roomId]) {
            submitCount[roomId] = 0;
        }

        submitCount[roomId]++
        const room = activeRooms.find((room) => room.id === roomId)
        if (room) {totalPlayers = room.players.length}

        console.log('SubmitCount Total', totalPlayers)
        if (submitCount[roomId] === totalPlayers) {
            submitCount[roomId] = 0
            io.to(roomId).emit('return-num-players', submittedLocations[roomId])
        }
    })

    socket.on('get-location-rankings', roomId => {
        let totalPlayers = 0
        if (!playersCount[roomId]) {
            playersCount[roomId] = 0;
        }
        playersCount[roomId]++
        const room = activeRooms.find((room) => room.id === roomId)
        if (room) {totalPlayers = room.players.length}

        console.log('PlayerCount Total', totalPlayers)
        // Check if all players have submitted their rankings
        if (playersCount[roomId] === totalPlayers) {
            // If all players have submitted, emit the rankings to all clients
            io.to(roomId).emit('display-location-rankings', playerLocationRankings[roomId])
            // Reset the counters for the next round
            playersCount[roomId] = 0
        }
    })
})

instrument(io, {
    auth: false
})

