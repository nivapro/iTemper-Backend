let socket = new WebSocket("ws://localhost:3000/ws");

socket.onopen = function(e) {
    alert("[open] Connection established, send -> server");
    socket.send("My name is John");
};

socket.onmessage = function(event) {
    alert(`[message] Data received: ${event.data} <- server`);
};

socket.onclose = function(event) {
    if (event.wasClean) {
        alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
        // e.g. server process killed or network down
        // event.code is usually 1006 in this case
        alert('[close] Connection died');
    }
};

socket.onerror = function(error) {
    alert(`[error] ${error.message}`);
};