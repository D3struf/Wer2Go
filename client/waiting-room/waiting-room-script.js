import { 
    socket, 
    loadPage, 
    isHosting, 
    roomInput
} from "../script.js";

sessionStorage.setItem("roomId", roomInput.value)

document.addEventListener('DOMContentLoaded', () => {
    const startGameContainer = document.getElementById('start-game-container');

    const isHost = isHosting;
    if (isHost) {
        // const startGameMessage = document.createElement('button');
        // startGameMessage.textContent = "Start Game"
        // startGameMessage.id = "start-game"
        // startGameMessage.type = "button"

        // startGameContainer.append(startGameMessage)
                
        // Attach the click event listener
        const startGameBtn = document.getElementById('start-game');
        startGameBtn.addEventListener("click", () => {
            // displayMessage("Game started by host", "right")
            // const room = roomCode.toUpperCase();
            socket.emit("start-game", roomInput.value, message => {
                if (message.includes('Game started')) {
                    loadPage('../select-location/select-location.html')
                }
            });
            // loadPage('./select-location.html');
        });
    } else {
        // const startGameMessage = document.createElement('h2');
        // startGameMessage.textContent = "Waiting for host to start the game..."
        // startGameContainer.appendChild(startGameMessage)

        // const gameCodeContainer = document.getElementById("game-code-container")
        const h2 = document.getElementById("game-code")
        h2.innerHTML = roomInput.value
        // gameCodeContainer.appendChild(h2)
    }
    
});

// Listen for the event from the server
socket.on("game-started", () => {
    console.log("Game started event received from server")
    loadPage('../select-location/select-location.html')
});
