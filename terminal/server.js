const express = require("express");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");
const pty = require("node-pty");
const path = require("path");
const {
  prepareExecutionContext,
  runCode,
  handleJavaExecution,
  handleFileInputTestCase,
  handleTextInputTestCase,
  compileJava,
} = require("./helper/Utils.js");

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
  socket.on("run_code", async (data) => {
    const { language, code } = data;

    const session = sessions.get(socket.id);
    prepareExecutionContext(session, socket);
    const fileName =
      language.toLowerCase() === "java" ? "Main.java" : "main.py";
    const filePath = path.join(userDir, fileName);

    fs.writeFileSync(filePath, code);

    if (language.toLowerCase() === "java") {
      await handleJavaExecution(filePath, socket, session, userDir);
    } else {
      await runCode("python3", filePath, socket, session, userDir);
    }
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
  socket.on("run_test_case", async (data) => {
    const session = sessions.get(socket.id);

    const { language, testCases, isFileInput, code } = data;
    prepareExecutionContext(session, socket);

    const fileName =
      language.toLowerCase() === "java" ? "Main.java" : "main.py";
    const filePath = path.join(userDir, fileName);
    const codeToWrite =
      language.toLowerCase() === "java"
        ? code
        : `import builtins

# Save the real input function
_original_input = builtins.input

# Redefine it to ignore the prompt argument and call the original with nothing
def silent_input(prompt=""):
    return _original_input()

builtins.input = silent_input
${code}`;

    fs.writeFileSync(filePath, codeToWrite);
    if (language.toLowerCase() === "java") {
      const output = await compileJava(
        filePath,
        socket,
        session,
        userDir,
      ).catch((e) => {
        socket.emit("error", e);
      });
    }

    for (const testCase of testCases) {
      if (isFileInput) {
        const inputFilePath = path.join(userDir, `input.txt`);
        try {
          fs.writeFileSync(inputFilePath, testCase.text_input);
          const output = await handleFileInputTestCase(
            testCase,
            language,
            filePath,
            userDir,
            session,
          );
          socket.emit("test_case_completed", output);
        } catch (error) {
          socket.emit("error", error);
        } finally {
          if (inputFilePath && fs.existsSync(inputFilePath))
            fs.unlinkSync(inputFilePath);
        }
      } else {
        try {
          const output = await handleTextInputTestCase(
            testCase,
            filePath,
            language,
            session,
            socket,
            userDir,
          );
          socket.emit("test_case_completed", output);
        } catch (error) {
          socket.emit("error", error);
        }
      }
    }

    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    socket.emit("test_cases_completed", {
      passedCount: session.testCasesPassed,
      errorCases: session.errorCases,
    });
    session.running = false;
    session.process = null;
    session.testCasesPassed = 0;
    session.errorCases = [];
  });

  // Cleanup: Kill the shell when the user closes the tab
  socket.on("disconnect", () => {
    const session = sessions.get(socket.id);
    if (session) {
      if (session?.process) {
        session?.process.kill();
      }

      // Delete directory + all files
      if (fs.existsSync(userDir)) {
        fs.rmSync(userDir, { recursive: true, force: true });
      }

      sessions.delete(socket.id);
    }
    console.log("User disconnected, killing shell.");
  });
});

server.listen(4000, () => {
  console.log("Terminal backend running on http://localhost:4000");
});
