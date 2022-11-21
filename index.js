const dotenv = require("dotenv").config();

const PORT = process.env.PORT || 5000;

const io = require("socket.io")(PORT, {
  cors: {
    origin: process.env.CLIENT_URL,
  },
});

let users = [];

const addUser = (userId, socketId) => {
  const exists = users.find((user) => user.userId === userId);
  if (!exists) {
    !users.some((user) => user.userId === userId) &&
      users.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  socket.on(
    "sendMessage",
    ({ sender, recieverId, text, theme, dialogueId }) => {
      const user = getUser(recieverId);

      if (user) {
        io.to(user.socketId).emit("getMessage", {
          dialogueId,
          sender,
          theme,
          text,
        });
      }
    }
  );

  socket.on("disconnect", () => {
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
