// for admin ui
const { instrument } = require("@socket.io/admin-ui")

const io = require('socket.io')(3000, {
    cors: {
        origin: ["http://localhost:8080", "https://admin.socket.io", "http://169.254.68.28:8080", "http://192.168.100.128:8080"],
        credentials: true
    },
})

const activeRooms = [];
const submittedLocations = [];

// Default namespace for localHost
io.on("connection", socket => {
    socket.on("disconnect", () => {
        // Remove the disconnected socket from activeRooms
        for (let i = 0; i < activeRooms.length; i++) {
            const index = activeRooms[i].players.indexOf(socket.id);
            if (index !== -1) {
                activeRooms[i].players.splice(index, 1);
                if (activeRooms[i].players.length === 0) {
                    // Remove the entire room if no players are left
                    activeRooms.splice(i, 1);
                }
                break;  // Stop searching after finding the room
            }
        }

        console.log(`Player ${socket.id} disconnected`);
        console.log(activeRooms);
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
        const existingRoom = activeRooms.find(room => room.id === roomToSearch);
        if (existingRoom) {
            socket.join(room);
            existingRoom.players.push(socket.id);
            cb(`Joined ${room}`);
            console.log(`Player ${socket.id} joined Room ${room}`)
            console.log(activeRooms)
        } else {
            cb("ROOM NOT FOUND");
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
        console.log(`Host Room created with ID: ${room}`);
        console.log(activeRooms)

    })

    socket.on("start-game", (room, cb) => {
        io.to(room).emit("game-started");
        cb(`Game started in room ${room}`);
    });

    socket.on('submit-location', ({ location }) => {
        // Store the submitted location along with the socket ID
        submittedLocations.push({ socketId: socket.id, location });
        console.log(submittedLocations)
        // Broadcast the updated list of submitted locations to all clients
        io.emit('update-locations', location);
    });
})

instrument(io, {
    auth: false
})