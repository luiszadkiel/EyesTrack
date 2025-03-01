const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const wrtc = require("wrtc");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configuración de la carpeta pública
app.use(express.static(path.join(__dirname, "public")));

// WebRTC Signaling
let peerConnections = {};

io.on("connection", (socket) => {
    console.log("Nuevo cliente conectado:", socket.id);

    // Señales para establecer WebRTC
    socket.on("offer", (id, message) => {
        peerConnections[id] = new wrtc.RTCPeerConnection();
        peerConnections[id].setRemoteDescription(new wrtc.RTCSessionDescription(message));

        peerConnections[id]
            .createAnswer()
            .then((answer) => {
                peerConnections[id].setLocalDescription(answer);
                socket.emit("answer", id, answer);
            })
            .catch((e) => console.error(e));
    });

    socket.on("candidate", (id, message) => {
        peerConnections[id].addIceCandidate(new wrtc.RTCIceCandidate(message));
    });

    socket.on("disconnect", () => {
        console.log("Cliente desconectado:", socket.id);
        delete peerConnections[socket.id];
    });
});

server.listen(8888, () => {
    console.log("Servidor WebRTC en puerto 8888");
});
