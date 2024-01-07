const socket = io();

document.addEventListener('DOMContentLoaded', () => {
// Button click to create a room
    const createRoomButton = document.getElementById('create-room-button');
    createRoomButton.addEventListener('click', () => {
    // Generate a unique room name (can be replaced with user input)
    const roomName = Math.random().toString(36).substring(2, 15);

    // Tell the server to create a new room with the chosen name
    socket.emit('create-room', roomName);
    });
});

// Receive confirmation and potentially other information about the room
socket.on('room-created', (data) => {
    if (data.success) {
        console.log(`Room created with ID: ${data.roomId}`);
        // Redirect the user to the created room
        window.location.href = `/room/${data.roomId}`;
    } else {
        console.error('Failed to create room');
    }
});



