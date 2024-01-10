// for admin ui
const { instrument } = require("@socket.io/admin-ui")

const io = require('socket.io')(3000, {
    cors: {
        origin: ["http://localhost:8080", "https://admin.socket.io", "http://169.254.68.28:8080", "http://192.168.100.128:8080"],
        credentials: true
    },
})

const activeRooms = []
const submittedLocations = []
const playerLocationRankings = []
let playersCount = 0
let submitCount = 0

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
                    activeRooms.splice(i, 1)
                    submittedLocations.splice(0, submittedLocations.length)
                    playerLocationRankings.splice(0, playerLocationRankings.length)
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
    });

    socket.on('submit-location', ({ location, coords }) => {
        // submitCount++

        // if (submitCount === submittedLocations.length) {
            // Store the submitted location along with the socket ID and
            // Handle players submitted Locations
            const existingPlayerIndex = submittedLocations.findIndex(player => player.socketId === socket.id)

            if (existingPlayerIndex !== -1) {
                submittedLocations[existingPlayerIndex].location = location
                submittedLocations[existingPlayerIndex].coords = coords
            }
            else {
                submittedLocations.push({ socketId: socket.id, location, coords })
            }
            console.log(submittedLocations)
            // Reset the counter
            submitCount = 0

            // Broadcast the updated list of submitted locations to all clients
            io.emit('update-locations', submittedLocations)
        // }
    })

    socket.on('get-locations', () => {
        socket.emit('set-locations', submittedLocations)
    })

    socket.on('location-rankings', ranks => {
        const existingPlayerIndex = playerLocationRankings.findIndex(player => player.socketId === socket.id)

        if (existingPlayerIndex !== -1) {
            playerLocationRankings[existingPlayerIndex].ranks = ranks
        }
        else {
            playerLocationRankings.push({ socketId: socket.id, ranking: ranks })
        }
        console.log(playerLocationRankings)
    })

    socket.on('get-location-rankings', () => {
        playersCount++

        // Check if all players have submitted their rankings
        if (playersCount === submittedLocations.length) {
            // If all players have submitted, emit the rankings to all clients
            io.emit('display-location-rankings', playerLocationRankings)
            // Reset the counters for the next round
            playersCount = 0
        }
    })
})

instrument(io, {
    auth: false
})