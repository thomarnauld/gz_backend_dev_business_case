const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const packageRouter = require("./routes/packageRou.js");
const deliveryRouter = require("./routes/deliveryRou.js");
const errorMiddleware = require("./middleware/errorMiddleware.js");
const { handleLocationChanged, handleSubscribe, handleStatusChanged } = require("./controllers/websocketCtrl.js");

dotenv.config(); // Load environment variables from .env

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(
  cors({
    origin: ["http://localhost:4200", "http://localhost:42001", "http://localhost:42002"],
    credentials: true,
  })
);
app.use(bodyParser.json()); // Parse incoming JSON data

// API routes
app.use("/api/package", packageRouter);
app.use("/api/delivery", deliveryRouter);
app.use(errorMiddleware);

io.on("connection", (socket) => {
  console.log("Client connected");
  socket.on("status_changed", (payload) => handleStatusChanged(socket, payload));
  socket.on("location_changed", (payload) => handleLocationChanged(socket, payload));
  socket.on("subscribe", (payload) => handleSubscribe(socket, payload));
  socket.on("disconnect", () => console.log("Client disconnected"));
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => server.listen(port, () => console.log(`Server listening on port ${port}`)))
  .catch((err) => console.error("Error connecting to MongoDB:", err));
