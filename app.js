import Express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import { PORT } from "./constants.js";
import { v4 as uuid } from "uuid";

// initial server config
const app = Express();
const server = createServer(app);
const io = new Server(server);
app.set("view engine", "ejs");
app.use(Express.static("public"));

// trackiing active rooms
const active_rooms = [];

// home route
app.get("/", (req, res) => {
  res.render("index");
});

// route to create new rooms
app.get("/create", (req, res) => {
  const roomId = uuid();
  active_rooms.push(roomId);
  res.redirect(`/room/${roomId}`);
});

// videochat room route
app.get("/room/:id", (req, res) => {
  const roomId = req.params.id;

  // validating room id
  if (active_rooms.includes(roomId)) {
    res.render("room", { roomId: roomId });
  } else {
    res.json({ error: "no room found" });
  }
});

// web socket server config
io.on("connection", (socket) => {
  socket.on("join-room", (data) => {
    socket.join(data.roomId);
    socket.broadcast.to(data.roomId).emit("user-connected", data.userId);

    socket.on("disconnect", () => {
      socket.broadcast.to(data.roomId).emit("user-disconnected", data.userId);
    });
  });
});

// running the webserver
server.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
