const { createServer } = require("http");
const { getIO } = require("./socket");
const app = require("./app.js");
const { initSocket } = require("./socket.js");

const httpServer = createServer(app);
initSocket(httpServer);

let players = {}; 
let marcoId = null; 
let poloSpecialId = null; 

httpServer.listen(5050, () => {
    console.log("Servidor iniciado en http://localhost:5050");
});

const io = getIO();
io.on("connection", (socket) => {
    console.log(`Nuevo jugador conectado: ${socket.id}`);
    handleEvents(socket, io);
});

function handleEvents(socket, io) {
    socket.on("joinGame", (data) => {
        players[socket.id] = { 
            nickname: data.nickname, 
            score: 0, 
            isPoloSpecial: data.isPoloSpecial || false // Verifica si es polo especial
        };
        console.log(`Jugador unido: ${data.nickname} con ID: ${socket.id}`);

        
        if (!marcoId) {
            marcoId = socket.id;
        }

        // Actualiza puntuaciones iniciales
        io.emit("updateScores", { players: getSortedPlayers() });
    });

    socket.on("notifyMarco", () => {
        if (socket.id === marcoId) {
            players[marcoId].score += 50;
            console.log(`Marco (${players[marcoId].nickname}) gana 50 puntos. Nueva puntuación: ${players[marcoId].score}`);
            checkWinner(io);
        } else {
            Object.keys(players).forEach(playerId => {
                if (playerId !== marcoId) {
                    players[playerId].score += 10;
                    console.log(`${players[playerId].nickname} gana 10 puntos. Nueva puntuación: ${players[playerId].score}`);
                }
            });
            players[marcoId].score -= 10;
            console.log(`Marco (${players[marcoId].nickname}) pierde 10 puntos. Nueva puntuación: ${players[marcoId].score}`);
        }
    
        io.emit("updateScores", { players: getSortedPlayers() });
    });
    
    

    socket.on("notifyPolo", () => {
        if (players[socket.id]) {
            if (players[socket.id].isPoloSpecial) {
                // Polo especial atrapado pierde 10 puntos
                players[socket.id].score -= 10; 
                console.log(`Polo especial (${players[socket.id].nickname}) pierde 10 puntos`);
            } else {
                // Polo pierde 10 puntos
                players[socket.id].score -= 10; 
                console.log(`Polo (${players[socket.id].nickname}) pierde 5 puntos`);
            }

            checkWinner(io);
        }

        // puntuaciones actualizadas
        io.emit("updateScores", { players: getSortedPlayers() });
    });

    socket.on("disconnect", () => {
        console.log(`Jugador desconectado: ${socket.id}`);
        delete players[socket.id];

        
        if (socket.id === marcoId) {
            const remainingPlayers = Object.keys(players);
            marcoId = remainingPlayers.length > 0 ? remainingPlayers[0] : null;
        }

        // Actualiza puntuaciones después de la desconexión
        io.emit("updateScores", { players: getSortedPlayers() });
    });
}

// Función que verifica si hay un ganador
function checkWinner(io) {
    const winner = Object.values(players).find(player => player.score >= 100);
    if (winner) {
        io.emit("notifyGameOver", { 
            message: `${winner.nickname} ha ganado!`, 
            players: getSortedPlayers() 
        });
        console.log(`Ganador: ${winner.nickname}`);
    }
}

// para ordenar a los jugadores por puntuación
function getSortedPlayers() {
    return Object.values(players).sort((a, b) => b.score - a.score);
}
