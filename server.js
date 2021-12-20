const express = require("express");
const app = express();
const path = require("path");
const ws = require("ws"); //!ability to create websocket server

const randomMessage = () => {
  const randomNumber = Math.round(Math.random() * 1000);
  return { randomNumber };
};
const numbers = [];
numbers.push(randomMessage());
numbers.push(randomMessage());
//console.log(numbers);

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.post("/", (req, res) => {
  const message = randomMessage();
  numbers.push(message);
  res.send(message);
});

const PORT = process.env.port || 3000;

const server = app.listen(PORT, () => console.log(`listen on port ${PORT}`));
//console.log(server);

const webSocketServer = new ws.Server({ server }); //your express server is gonna end up getting the request then ends up upgrading and we'll have this websocket server

let sockets = []; //keeping track of sockets

webSocketServer.on("connection", (socket) => {
  //websocketserver is an event listener. When a websocket ends up connecting to it , we'll get this connection
  //! one thing about websocket, when you refresh the page, the old websockey disappears, the new websocket you'll end up getting
  //console.log("connecting");

  sockets.push(socket);
  console.log(sockets.length);

  socket.send(JSON.stringify({ history: numbers })); //?cannot send objects so we have to JSON stringify

  socket.on("message", (data) => {
    //! socket has the ability to send me the messages thats being displayed on the browser everytime i click chat

    sockets.filter((s) => s !== socket).forEach((s) => s.send(data.toString())); //now the data you send, will also be received. (Check in network)
  });
  socket.on("close", () => {
    //!when you refresh the browser, or the socket ends up getting closed, it keeps the connection up, but socket ends up closing
    sockets = sockets.filter((s) => s !== socket); //? i only want the socket as long as it is NOT the socket that ended up closing
    // will log 1 if only one localhost/3000 is opened. If you open another tab with the same localhost itll log 2. FOR GOOD HOUSE KEEPING
  });
});
//!websocket server, if a connection is made to my websockerserver, sock is now the client, and now i have the ability from the server to send a message to my client
