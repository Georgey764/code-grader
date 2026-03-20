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

function compileJava(filePath, socket) {
  const ptyProcess = pty.spawn("javac", [filePath], {
    name: "xterm-color",
    cols: 80,
    rows: 24,
    cwd: __dirname,
    env: process.env,
  });

  ptyProcess.onData((data) => {
    socket.emit("code_compiled_stdout", data);
  });

  ptyProcess.onExit(() => {
    socket.emit("code_compiled_completed");
    ptyProcess.kill();
  });
}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Run the code
  socket.on("run_code", (language) => {
    const command = language.toLowerCase() === "java" ? "java" : "python3";
    const fileName =
      language.toLowerCase() === "java" ? "Main.java" : "main.py";
    const filePath = path.join(__dirname, fileName);

    const ptyProcess = pty.spawn(command, [filePath], {
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

    ptyProcess.onExit(() => {
      socket.emit("code_completed");
      ptyProcess.kill();
    });
  });

  // Upload the submission file
  socket.on("upload_submission_file", (data) => {
    const fileName =
      data.language.toLowerCase() === "java" ? "Main.java" : "main.py";
    const filePath = path.join(__dirname, fileName);
    fs.writeFileSync(filePath, data.code);

    if (data.language.toLowerCase() === "java") {
      compileJava(filePath, socket);
    }
  });

  // Upload the input file
  socket.on("upload_input_file", (data) => {
    if (data.inputFileDetails.file) {
      fs.writeFileSync(
        path.join(__dirname, data.inputFileDetails.name),
        data.inputFileDetails.file,
      );
    }
  });

  // Delete the input file
  socket.on("delete_input_file", (data) => {
    if (data.inputFileDetails.name) {
      fs.unlinkSync(path.join(__dirname, data.inputFileDetails.name));
    }
  });

  // Cleanup: Kill the shell when the user closes the tab
  socket.on("disconnect", () => {
    console.log("User disconnected, killing shell.");
  });
});

server.listen(4000, () => {
  console.log("Terminal backend running on http://localhost:4000");
});
