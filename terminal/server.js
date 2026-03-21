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

const baseDir = path.join(__dirname, "sessions");
fs.mkdirSync(baseDir, { recursive: true });

// 1. Setup Socket.io with CORS (allowing your React app to connect)
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"],
  },
});

const sessions = new Map();

const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

function compileJava(filePath, socket, session, userDir) {
  const ptyProcess = pty.spawn("javac", [filePath], {
    name: "xterm-color",
    cols: 80,
    rows: 24,
    cwd: userDir,
    env: process.env,
  });
  session.process = {
    process: ptyProcess,
    language: "java",
    command: "javac",
  };

  ptyProcess.onData((data) => {
    socket.emit("code_compiled_stdout", data);
  });

  ptyProcess.onExit(({ exitCode }) => {
    if (exitCode === 0) {
      socket.emit("code_compiled_completed", "Success");
    } else {
      socket.emit("code_compiled_completed", "Failed");
    }
    ptyProcess.kill();
    session.process = null;
  });
}

function runCode(command, filePath, userDir, session, socket, language) {
  const ptyProcess = pty.spawn(command, [filePath], {
    name: "xterm-color",
    cols: 80,
    rows: 24,
    cwd: userDir,
    env: process.env,
  });

  session.process = {
    process: ptyProcess,
    language: language,
    command: command,
  };

  socket.on("input", (data) => {
    ptyProcess.write(data);
  });

  ptyProcess.onData((data) => {
    socket.emit("code_stdout", data);
  });

  ptyProcess.onExit(() => {
    socket.emit("code_completed");
    session.running = false;
    session.process = null;
    ptyProcess.kill();
    fs.unlinkSync(filePath);
  });
}

function runTestCases(
  command,
  filePath,
  userDir,
  session,
  socket,
  language,
  testCase,
  isFileInput,
  inputFilePath,
) {
  const ptyProcess = pty.spawn(command, [filePath], {
    name: "xterm-color",
    cols: 80,
    rows: 24,
    cwd: userDir,
    env: process.env,
  });

  session.process = {
    process: ptyProcess,
    language: language,
    command: command,
  };

  if (!isFileInput) {
    const testCaseInput = testCase.text_input.split("\n");
    testCaseInput.forEach((cur) => {
      ptyProcess.write(cur + "\r");
    });
  }

  ptyProcess.onData((data) => {
    const expectedOutput = testCase.expected_output.trim();
    const actualOutput = data.toString().trim();
    const isPassed = expectedOutput === actualOutput;
    const statusText = isPassed ? "Passed" : "Failed";

    if (!session.testCasesPassed) {
      session.testCasesPassed = 0;
    }
    if (isPassed) {
      session.testCasesPassed++;
    }

    const output = `Expected Output: ${expectedOutput}\r\nActual Output: ${actualOutput}\r\nStatus: ${statusText}\r\n----------------------------------------\r\n`;
    socket.emit("test_cases_stdout", output);
  });

  ptyProcess.onExit(() => {
    socket.emit("test_cases_completed", session.testCasesPassed);
    session.running = false;
    session.process = null;
    ptyProcess.kill();
    fs.unlinkSync(inputFilePath);
    fs.unlinkSync(filePath);
  });

  return ptyProcess;
}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  const userDir = path.join(baseDir, socket.id);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }

  sessions.set(socket.id, {
    process: null,
    running: false,
    userDir: userDir,
  });

  // Run the code
  socket.on("run_code", (data) => {
    const { language, code } = data;

    const session = sessions.get(socket.id);
    if (session && !session?.running) {
      session.running = true;
    } else {
      socket.emit("error", "Code is already running");
      return;
    }

    const command = language.toLowerCase() === "java" ? "java" : "python3";
    const fileName =
      language.toLowerCase() === "java" ? "Main.java" : "main.py";
    const filePath = path.join(userDir, fileName);

    fs.writeFileSync(filePath, code);
    if (data.language.toLowerCase() === "java") {
      compileJava(filePath, socket, session, userDir);
    }
    runCode(command, filePath, userDir, session, socket, language);
  });

  // Upload the input file
  socket.on("upload_input_file", (data) => {
    fs.writeFileSync(
      path.join(userDir, data.inputFileDetails.name),
      data.inputFileDetails.file,
    );
  });

  // Delete the input file
  socket.on("delete_input_file", (data) => {
    if (fs.existsSync(path.join(userDir, data.inputFileDetails.name))) {
      fs.unlinkSync(path.join(userDir, data.inputFileDetails.name));
    }
  });

  // Run the test cases
  socket.on("run_test_cases", (data) => {
    const session = sessions.get(socket.id);
    if (session && session.running) {
      socket.emit("error", "Code is already running");
      return;
    }

    const { language, testCases, isFileInput } = data;

    const command = language.toLowerCase() === "java" ? "java" : "python3";
    const fileName =
      language.toLowerCase() === "java" ? "Main.java" : "main.py";
    const filePath = path.join(userDir, fileName);

    if (isFileInput) {
      testCases.forEach((testCase) => {
        const inputFilePath = path.join(userDir, `input.txt`);
        fs.writeFileSync(filePath, data.code);
        fs.writeFileSync(inputFilePath, testCase.text_input);
        runTestCases(
          command,
          filePath,
          userDir,
          session,
          socket,
          language,
          testCase,
          isFileInput,
          inputFilePath,
        );
      });
    } else {
      fs.writeFileSync(filePath, data.code);
      testCases.forEach((testCase) => {
        runTestCases(
          command,
          filePath,
          userDir,
          session,
          socket,
          language,
          testCase,
          isFileInput,
          null,
        );
      });
    }
  });

  // Cleanup: Kill the shell when the user closes the tab
  socket.on("disconnect", () => {
    const session = sessions.get(socket.id);
    if (session) {
      if (session.process?.process) {
        session.process.process.kill();
      }

      // Delete directory + all files
      if (fs.existsSync(session.dir)) {
        fs.rmSync(session.dir, { recursive: true, force: true });
      }

      sessions.delete(socket.id);
    }
    console.log("User disconnected, killing shell.");
  });
});

server.listen(4000, () => {
  console.log("Terminal backend running on http://localhost:4000");
});
