const express = require("express");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");
const pty = require("node-pty");
const os = require("os");
const path = require("path");

const app = express();
const server = http.createServer(app);

const allowedOrigin = process.env.ALLOWED_ORIGIN_TERMINAL;

// 1. Setup Socket.io with CORS (allowing your React app to connect)
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"],
  },
});

const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("run_code", (data) => {
    const filePath = path.join(__dirname, "main.py");
    fs.writeFileSync(filePath, data.code);

    const ptyProcess = pty.spawn("python3", [filePath], {
      name: "xterm-color",
      cols: 80,
      rows: 24,
      cwd: __dirname,
      env: process.env,
    });

    socket.on("input", (data) => {
      ptyProcess.write(data);
    });

    ptyProcess.onData((data) => {
      socket.emit("code_stdout", data);
    });

    socket.on("resize", (size) => {
      ptyProcess.resize(size.cols, size.rows);
    });

    ptyProcess.onExit(() => {
      socket.emit("code_completed");
      ptyProcess.kill();
    });
  });

  // 6. Cleanup: Kill the shell when the user closes the tab
  socket.on("disconnect", () => {
    console.log("User disconnected, killing shell.");
  });
});

server.listen(4000, () => {
  console.log("Terminal backend running on http://localhost:4000");
});
