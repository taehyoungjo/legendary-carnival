import express from "express";
import http from "http";
import { Server } from "socket.io";
import os from "os";
import cors from "cors";

const app = express();

app.get("/", (_, res) => {
  res.send("Hello World!");
});

const CORS_OPTIONS = {
  origin: ["http://localhost:3000"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(CORS_OPTIONS));

const server = http.createServer(app);

server.listen(8000);

const io = new Server(server, {
  cors: {
    ...CORS_OPTIONS,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  },
});

io.sockets.on("connection", (socket) => {
  console.log("connected");

  socket.on("message", (message, room) => {
    console.log("message", message, room);
    socket.in(room).emit("message", message, room);
  });

  socket.on("create or join", (room: string) => {
    console.log("Attempted to create or join room", room);
    const clientsInRoom = io.sockets.adapter.rooms.get(room);
    const numClients = clientsInRoom ? clientsInRoom.size : 0;
    console.log(clientsInRoom, numClients);

    // Create room if it doesn't exist
    if (numClients === 0) {
      socket.join(room);
      socket.emit("created", room, socket.id);
    } else if (numClients === 1) {
      io.sockets.in(room).emit("join", room);
      socket.join(room);
      socket.emit("joined", room, socket.id);
      io.sockets.in(room).emit("ready");
    } else {
      socket.emit("full", room);
    }
  });

  socket.on("ipaddr", function () {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev]?.forEach(function (details) {
        if (details.family === "IPv4" && details.address !== "127.0.0.1") {
          socket.emit("ipaddr", details.address);
        }
      });
    }
  });

  //Event for notifying other clients when a client leaves the room
  socket.on("bye", function () {
    console.log("received bye");
  });
});
