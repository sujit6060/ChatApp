const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const Router = require("./routes/Router");
const cors = require("cors");
const { getUser, removeUser, getUserInRoom, addUser } = require("./users");

const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(Router);

io.on("connection", (socket) => {
  socket.on("join", ({ name, room }) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    socket.emit("message", {
      user: "admin",
      text: `${user.name}, Welcome to the Room ${user.room}`,
    });

    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has Joined` });

    socket.join(user.room);
  });

  socket.on("srndMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", { user: user.name, text: message });
  });

  socket.on("disconnect", () => {
    console.log("User had Left !!!");
  });
});

server.listen(PORT, () => {
  console.log("Server Running");
});
