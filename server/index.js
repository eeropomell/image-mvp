const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
// const axios = require('axios');
const { v4: uuidv4 } = require("uuid");

const { getStorage, ref, getDownloadURL } = require("firebase/storage");
const { getDocs, collection } = require("firebase/firestore");
const { db } = require("./firebase");
const { storage } = require("./firebase");



const OpenAI = require("openai");

const client = new OpenAI();
console.log(client.images.generate);

console.log(client.images.get);


/*(async () => {
    try {
      console.log("ABOUT TO EDIT")
      const res = await client.images.edit({
        image: fs.ReadStream("./girl.png"),
        prompt: "minimalist and delicate gouache, pencil, and ink sketch of a beautiful kenyan face reminiscent of the 1920s style, with large eyes and red lips, set against a backdrop of lavender, slate, and blue gouache wash with calligraphic lines.",
        n: 4,
        size: "1024x1024",
        response_format: "url"
      });
      console.log("DONE")
      console.log(res);
    } catch (error) {
      console.log("DONE2")
      console.error(error);
    }
})(); */

app.use(cors());

const server = http.createServer(app);

var path_root = '/etc/letsencrypt/live/cotdamn.com/';

var options = {
  cert: fs.readFileSync(`${path_root}cert.pem`),
  key: fs.readFileSync(`${path_root}privkey.pem`),
};

let https = require("https").createServer(options, app);
https.listen(3000, () => {
  console.log("listening on *:3000", process.env.OPENAI_API_KEY);
})

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const io = new Server(https, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let players = [];
let readyPlayers = [];
let results = [];
let rooms = {};
for (let i = 1; i <= 1000; i++) {
  rooms[i] = { players: [], dir: "" };
}

io.on("connection", (socket) => {
  console.log(socket.id)
  socket.on("join_game", (nickname) => {
    players.push({ nickname });
    io.emit(
      "players",
      players.map((player) => player.nickname)
    );
  });

  socket.on("room_exists", (room, callback) => {
    if (rooms[room]) {
      callback({ status: "success", message: "Room exists." });
    } else {
      callback({ status: "error", message: "Room does not exist." });
    }
  });

  socket.on("create_room", (room, callback) => {
    if (rooms[room]) {
      callback({ status: "error", message: "Room already exists." });
    } else {
      socket.join(room);
      rooms[room].dir = "";
      rooms[room].players = []; // initialize the room with an empty array of nicknames
      callback({ status: "success", message: "Room created successfully." });
    }
  });

  socket.on("join_room", ({ room, nickname }, callback) => {
    if (rooms[room] && rooms[room].players.includes(nickname)) {
      callback({
        status: "error",
        message: "Nickname already exists in the room.",
      });
    } else if (rooms[room]) {
      console.log("r", rooms[room]);
      rooms[room].players.push({
        nickname: nickname,
        ready: false,
        img: "",
        text: "",
        disconnected: false,
      }); // add the nickname to the room
      socket.join(room);
      io.to(room).emit("room_res", rooms[room]);
      callback({ status: "success", message: "joined" });
    }
  });

  socket.on("ready", async ({ room, nickname }) => {
    if (!rooms[room]) {
      return;
    }
    let player = rooms[room].players.find(
      (player) => player.nickname === nickname
    );
    if (player) {
      player.ready = true;
    }

    // Check if all players in the room are ready
    let allReady = rooms[room].players.every((player) => player.ready);
    if (allReady) {
      // If all players are ready, emit 'game_starts' event to the room AND select random dir

      console.log("db", db)
      const imageCollection = collection(db, "images");
      const imageSnapshot = await getDocs(imageCollection);
      const images = imageSnapshot.docs.map((doc) => doc.data());
      const randomImage = images[Math.floor(Math.random() * images.length)];
      const imageRef = ref(storage, randomImage.path);
      const url = await getDownloadURL(imageRef);

      console.log("ra", randomImage);
      rooms[room].dir = {url: url, text: randomImage.text};
      io.to(room).emit("game_starts");
    } else {
      // If not all players are ready, just update the players' ready status
      io.to(room).emit("room_res", rooms[room]);
    }
  });

  socket.on("image_req", async ({ room }) => {
    if (!rooms[room]) {
      return;
    }
    socket.emit("image_res", { imageUrl: rooms[room].dir.url, text: rooms[room].dir.text });
  });

  socket.on("generation_send", async ({ text, nickname, room }) => {
    if (!rooms[room]) {
      return;
    }
  
    let imageUrl;
    try {
      const apiResponse = await client.images.generate({
        model: "dall-e-3",
        prompt: text,
        n: 1,
        size: "1024x1024",
        response_format: "url"
      });
      imageUrl = apiResponse.data[0].url;
    } catch (error) {
      console.error("API request failed:", error);
      imageUrl = rooms[room].dir.url;
    }
  
    socket.emit("generation_recv", imageUrl);
    console.log(room);
    console.log(JSON.stringify(rooms[room]));
    const player = rooms[room].players.find(
      (player) => player.nickname === nickname
    );
    player.img = imageUrl;
    player.text = text;
    console.log(JSON.stringify(rooms[room]));
    if (rooms[room].players.every((player) => player.img !== "")) {
      io.emit("done");
    }
  });

  socket.on("room_req", ({ room }) => {
    if (!rooms[room]) {
      return;
    } else {
      socket.emit("room_res", rooms[room]);
    }
  });

  socket.on("disconnect_", ({ room, nickname }) => {
    if (!rooms[room]) {
      return;
    }
    let player = rooms[room].players.find(
      (player) => player.nickname === nickname
    );
    if (player) {
      player.disconnected = true;
    }
    console.log(rooms[room]);
    console.log(rooms[room].players);
    // Check if all players in the room are disconnected
    let allDisconnected = rooms[room].players.every(
      (player) => player.disconnected
    );
    console.log(allDisconnected);
    if (allDisconnected) {
      // If all players are disconnected, discard the room by setting it to null
      rooms[room] = { players: [], dir: "" };
    }
  });
});

