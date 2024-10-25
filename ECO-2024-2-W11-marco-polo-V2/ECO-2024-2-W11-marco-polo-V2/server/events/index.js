const { gameEvents } = require("./gameEvents");

const players = {}; // Almacena las puntuaciones de los jugadores

const handleEvents = (socket, io) => {
    // Mantener la funcionalidad existente
    gameEvents(socket, io);

    // Manejar el evento de un jugador que se une al juego
    socket.on("joinGame", (data) => {
        players[socket.id] = { nickname: data.nickname, score: 0 }; // Agregar jugador
        io.emit("updateScores", { players: Object.values(players) }); // Notificar a todos los jugadores
    });

    // Manejar el evento cuando "Marco" atrapa o no atrapa un "Polo especial"
    socket.on("notifyMarco", (caughtSpecial) => {
        const player = players[socket.id];
        if (player) {
            if (caughtSpecial) {
                player.score += 50; // Sumar 50 puntos
            } else {
                player.score -= 10; // Restar 10 puntos
            }
            io.emit("updateScores", { players: Object.values(players) }); // Notificar a todos
            checkWinner(io); // Verificar si hay un ganador
        }
    });

    // Manejar el evento cuando "Polo especial" es atrapado o no
    socket.on("notifyPolo", (caught) => {
        const player = players[socket.id];
        if (player) {
            if (caught) {
                player.score -= 10; // Restar 10 puntos
            } else {
                player.score += 10; // Sumar 10 puntos
            }
            io.emit("updateScores", { players: Object.values(players) }); // Notificar a todos
            checkWinner(io); // Verificar si hay un ganador
        }
    });

    // Manejar la desconexión de un jugador
    socket.on("disconnect", () => {
        delete players[socket.id]; // Eliminar al jugador de la lista
        io.emit("updateScores", { players: Object.values(players) }); // Notificar a todos los jugadores
    });
};

// Verificar si hay un ganador
function checkWinner(io) {
    const winner = Object.values(players).find(player => player.score >= 100);
    if (winner) {
        io.emit("notifyGameOver", { 
            message: `${winner.nickname} ha ganado!`, 
            players: Object.values(players).sort((a, b) => b.score - a.score) // Ordenar jugadores por puntuación
        });
    }
}

module.exports = { handleEvents };

