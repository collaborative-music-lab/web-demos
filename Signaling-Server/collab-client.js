//collab-client.js
//client for use with server.js


const ws = new WebSocket('ws://localhost:3000');

ws.onopen = function() {
    console.log("Connected to the signaling server");
};

ws.onmessage = function(msg) {
    // Handle incoming messages (signaling data)
};

ws.onerror = function(err) {
    console.error("WebSocket error observed:", err);
};
