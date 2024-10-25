import { socket } from "../routes.js"; 

let players = []; 

export default function renderScreen1() {
    const app = document.getElementById("app");

    // interfaz
    app.innerHTML = `
        <h1>Resultados</h1>
        <div id="players-list"></div>
    `;

    const playersList = document.getElementById("players-list");

    // Escucha eventos de puntuación desde el servidor
    socket.on("updateScores", (data) => {
        console.log("Actualizando puntuaciones:", data); 
        players = data.players; // Actualiza la lista nueva puntuación
        renderPlayerList(players);
    });

    // Escucha el evento de fin de juego
    socket.on("notifyGameOver", (data) => {
        showWinner(data);
    });
}

// Función  lista de jugadores
function renderPlayerList(players) {
    const playersList = document.getElementById("players-list");
    playersList.innerHTML = ""; 

    if (players.length === 0) {
        playersList.innerHTML = "<p>No hay jugadores registrados.</p>"; 
        return;
    }

    // Ordena los jugadores por puntuación 
    players.sort((a, b) => b.score - a.score);

    players.forEach((player, index) => {
        const playerItem = document.createElement("div");
        playerItem.innerHTML = `${index + 1}. ${player.nickname} (${player.score} pts)`;
        playersList.appendChild(playerItem);
    });
}

// Muestra el mensaje del ganador
function showWinner(data) {
    const app = document.getElementById("app");
    app.innerHTML = `
        <h1>${data.message}</h1>
        <div id="players-list"></div>
    `;

    const playersList = document.getElementById("players-list");

    data.players.sort((a, b) => b.score - a.score); // Ordenar jugadores por puntuación

    data.players.forEach((player, index) => {
        const playerItem = document.createElement("div");
        playerItem.innerHTML = `${index + 1}. ${player.nickname} (${player.score} pts)`;
        playersList.appendChild(playerItem);
    });
}
