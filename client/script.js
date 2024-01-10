import { io } from "socket.io-client"

export var isHosting = false
export var getGameCode

const joinRoomButton = document.getElementById("room-button");
const hostRoomButton = document.getElementById("host-button");
// const messageInput = document.getElementById("message-input");
export const roomInput = document.getElementById("room-input");
// const form = document.getElementById("form");
export const roomCode = generateRandomString();

export const socket = io("http://localhost:3000")
// socket.on ("connect", () => {
//     displayMessage(`You are connected with id: ${socket.id} `)
// })

// socket.on ("receive-message", message => {
//     displayMessage(message, "left")
// })

// form.addEventListener("submit", e => {
//     e.preventDefault()
//     const message = messageInput.value
//     const room = roomInput.value

//     if (message === "") return
//     displayMessage(message, "right")
//     socket.emit("send-message", message, room)

//     messageInput.value = ""
// })

joinRoomButton.addEventListener("click", () => {
    const room = roomInput.value
    socket.emit("join-room", room, message => {
        // displayMessage(message)
        isHosting = false
        if (message.includes('Joined')) {
            loadPage('./waiting-room/room.html')
        }
    })
})

function generateRandomString() {
    var length = 6; // 10 characters long string
    var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var randomString = "";
    for (var i = 0; i < length; i++) {
        randomString += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return randomString;
}

hostRoomButton.addEventListener("click", () => {
    const room = roomCode.toUpperCase()
    isHosting = true
    console.log("Host: " + isHosting)
    socket.emit("host-room", room, message => {
        roomInput.value = room
        getGameCode = room
        // Store the room code in local storage
        localStorage.setItem('gameCode', room);

        // Redirect to waiting-room.html only after the room is successfully created
        if (message.includes('Joined')) {
            loadPage('./waiting-room/host.html');
        }
    })
})

// export function displayMessage(message, leftOrRight) {
//     const div = document.createElement("div")
//     div.textContent = message

//     if (leftOrRight === "left") {
//         div.style.textAlign = "left"
//     } else {
//         div.style.textAlign = "right"
//     }

//     document.getElementById("message-container").append(div)
// }

export function loadPage(page) {
    // Fetch the new page content
    fetch(page)
        .then(response => response.text())
        .then(html => {
            // Replace the current document with the new page content
            document.open()
            localStorage.setItem('gameCode', getGameCode)
            document.write(html)
            document.close()
        })
        .catch(error => console.error('Error loading page:', error))
}
