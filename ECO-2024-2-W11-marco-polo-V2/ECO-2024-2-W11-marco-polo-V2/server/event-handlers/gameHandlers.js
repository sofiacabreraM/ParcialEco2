// gameHandlers.js

const { assignRoles } = require("../utils/helpers")

// Assuming db and io are required or passed in some way to be accessible
const joinGameHandler = (socket, db, io) => {
  return (user) => {
    db.players.push({ id: socket.id, ...user })
    console.log(db.players)
    io.emit("userJoined", db) // Broadcasts the message to all connected clients including the sender
  }
}

const startGameHandler = (socket, db, io) => {
  return () => {
    db.players = assignRoles(db.players)

    db.players.forEach((element) => {
      io.to(element.id).emit("startGame", element.role)
    })
  }
}

const notifyMarcoHandler = (socket, db, io) => {
  return () => {
    const rolesToNotify = db.players.filter(
      (user) => user.role === "polo" || user.role === "polo-especial"
    )

    rolesToNotify.forEach((element) => {
      io.to(element.id).emit("notification", {
        message: "Marco!!!",
        userId: socket.id,
      })
    })
  }
}

const notifyPoloHandler = (socket, db, io) => {
  return () => {
    const rolesToNotify = db.players.filter((user) => user.role === "marco")

    rolesToNotify.forEach((element) => {
      io.to(element.id).emit("notification", {
        message: "Polo!!",
        userId: socket.id,
      })
    })
  }
}

const onSelectPoloHandler = (socket, db, io) => {
  return (userID) => {
    const myUser = db.players.find((user) => user.id === socket.id)
    const poloSelected = db.players.find((user) => user.id === userID)

    if (poloSelected.role === "polo-especial") {
      // Notify all players that the game is over
      db.players.forEach((element) => {
        io.to(element.id).emit("notifyGameOver", {
          message: `El marco ${myUser.nickname} ha ganado, ${poloSelected.nickname} ha sido capturado`,
        })
      })
    } else {
      db.players.forEach((element) => {
        io.to(element.id).emit("notifyGameOver", {
          message: `El marco ${myUser.nickname} ha perdido`,
        })
      })
    }
  }
}

module.exports = {
  joinGameHandler,
  startGameHandler,
  notifyMarcoHandler,
  notifyPoloHandler,
  onSelectPoloHandler,
}
