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
  return new Promise((resolve, reject) => {
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
        resolve("Success");
      } else {
        socket.emit("code_compiled_completed", "Failed");
        reject("Failed");
      }
      ptyProcess.kill();
      session.process = null;
    });
  });
}

function runCode(command, filePath, userDir, session, socket, language) {
  return new Promise((resolve, reject) => {
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

    ptyProcess.onExit(({ exitCode }) => {
      if (exitCode === 0) {
        resolve("Success");
      } else {
        reject("Failed");
      }
      socket.emit("code_completed");
      session.running = false;
      session.process = null;
      ptyProcess.kill();
      if (filePath) fs.unlinkSync(filePath);
    });
  });
}

function runTestCase(
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
  return new Promise((resolve, reject) => {
    const ptyProcess = pty.spawn(command, [filePath], {
      name: "xterm-color",
      cols: 80,
      rows: 24,
      cwd: userDir,
      env: process.env,
    });

    let output = "";
    let outputLine = 1;
    const unwantedInitialOutputLines = isFileInput
      ? 0
      : testCase.text_input.split("\n").length;

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
      if (outputLine > unwantedInitialOutputLines) {
        output += data;
      }
      outputLine++;
    });

    ptyProcess.onExit(({ exitCode }) => {
      const expectedOutput = testCase.expected_output.trim();
      const actualOutput = output.toString().trim();
      const isPassed = expectedOutput === actualOutput;
      const statusText = isPassed ? "Passed" : "Failed";

      if (!session.testCasesPassed) {
        session.testCasesPassed = 0;
      }
      if (isPassed) {
        session.testCasesPassed++;
      }

      const outputInIt = `Expected Output: ${expectedOutput}\r\nActual Output: ${actualOutput}\r\nStatus: ${statusText}\r\n----------------------------------------\r\n`;

      if (exitCode === 0) {
        resolve(outputInIt);
      } else {
        reject(outputInIt);
      }
      socket.emit("test_case_completed", outputInIt);
      session.running = false;
      session.process = null;
      ptyProcess.kill();
    });
  });
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
  socket.on("run_code", async (data) => {
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
      const result = await compileJava(filePath, socket, session, userDir);
      if (result === "Failed") {
        socket.emit("error", "Compilation failed");
        return;
      }
    }
    const result = await runCode(
      command,
      filePath,
      userDir,
      session,
      socket,
      language,
    );
    if (result === "Failed") {
      socket.emit("error", "Execution failed");
      return;
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
    if (session && session.running) {
      socket.emit("error", "Code is already running");
      return;
    }

    const { language, testCases, isFileInput, code } = data;

    const command = language.toLowerCase() === "java" ? "java" : "python3";
    const fileName =
      language.toLowerCase() === "java" ? "Main.java" : "main.py";
    const filePath = path.join(userDir, fileName);
    const inputFilePath = path.join(userDir, `input.txt`);

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

    const runTestCases = async (testCase) => {
      for (const testCase of testCases) {
        if (isFileInput) {
          fs.writeFileSync(inputFilePath, testCase.text_input);
        }
        await runTestCase(
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
      }
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (inputFilePath && fs.existsSync(inputFilePath))
        fs.unlinkSync(inputFilePath);
      socket.emit("test_cases_completed", session.testCasesPassed);
    };
    await runTestCases();

    if (testCases.length === 0) {
      socket.emit("error", "No test cases found");
      return;
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
