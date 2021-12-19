const express = require("express");
const socket = require("socket.io");

// App setup
const PORT = process.env.PORT || 8900;
const app = express();
const server = app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
})

const io = socket(server, {
  cors: {
    origin: "http://localhost:3000"
  }
})

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({
      userId,
      socketId
    });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  //when ceonnect
  console.log("a user connected.");

  //take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  //send and get message
  socket.on("sendMessage", ({
    senderId,
    receiverId,
    text
  }) => {
    const user = getUser(receiverId);
    try {
      io.to(user.socketId).emit("getMessage", {
        senderId,
        text,
      });
    } catch (error) {
      console.log(error);
    }
  });

  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});