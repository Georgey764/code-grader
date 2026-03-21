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
    session.process = ptyProcess;

    setTimeout(() => {
      if (session.running) {
        socket.emit("error", "[Execution Timed Out]\r\n");
        reject("Timeout");
      }
    }, 5000);

    ptyProcess.onData((data) => {
      socket.emit("code_compiled_stdout", data);
    });

    ptyProcess.onExit(({ exitCode }) => {
      ptyProcess.kill();
      session.process = null;
    });
  });
}

function runCode(command, filePath, userDir, session, socket) {
  return new Promise((resolve, reject) => {
    // 1. Force clear any lingering input listeners on this socket before starting
    socket.removeAllListeners("input");

    const runArg = command === "java" ? "Main" : filePath;
    let isFinished = false;

    const ptyProcess = pty.spawn(command, [runArg], {
      name: "xterm-color",
      cols: 80,
      rows: 24,
      cwd: userDir,
      env: process.env,
    });

    session.process = ptyProcess;
    session.running = true;

    // 2. Capture the "disposable" objects from node-pty
    const dataListener = ptyProcess.onData((data) =>
      socket.emit("code_stdout", data),
    );

    const inputHandler = (data) => {
      try {
        ptyProcess.write(data);
      } catch (e) {
        /* Process might be closed */
      }
    };
    socket.on("input", inputHandler);

    // 3. Centralized Cleanup Function
    const cleanup = () => {
      if (isFinished) return;
      isFinished = true;

      // Unsubscribe from Socket
      socket.off("input", inputHandler);

      // Dispose node-pty listeners
      dataListener.dispose();
      // Note: onExit doesn't usually need disposal if the process is dead,
      // but it's good practice to keep track of it.

      // Kill the process if it's still breathing
      try {
        ptyProcess.kill();
      } catch (e) {
        // Already dead
      }

      session.running = false;
      session.process = null;

      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error("File del error:", e);
        }
      }
    };

    // 4. The Exit Listener
    const exitListener = ptyProcess.onExit(({ exitCode }) => {
      cleanup();
      exitListener.dispose(); // Clear itself

      socket.emit("code_completed", { exitCode });
      if (exitCode === 0) resolve("Success");
      else reject(`Exit Code: ${exitCode}`);
    });

    // 5. Safety Timeout (Optional but recommended)
    // If the code runs for more than 5s, kill it.
    setTimeout(() => {
      if (session.running) {
        socket.emit("error", "[Execution Timed Out]\r\n");
        ptyProcess.kill();
        session.running = false;
        session.process = null;
        reject("Timeout");
      }
    }, 5000);
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
    let ptyProcess;
    if (!isFileInput) {
      const shellCommand = `stty -echo && exec ${command} ${filePath}`;
      ptyProcess = pty.spawn("/bin/bash", ["-c", shellCommand], {
        name: "xterm-color",
        cwd: userDir,
        env: process.env,
      });
    } else {
      ptyProcess = pty.spawn(command, [filePath], {
        name: "xterm-color",
        cols: 80,
        rows: 24,
        cwd: userDir,
        env: process.env,
      });
    }

    setTimeout(() => {
      if (session.running) {
        socket.emit("error", "[Execution Timed Out]\r\n");
        ptyProcess.kill();
        session.running = false;
        session.process = null;
        reject("Timeout");
      }
    }, 5000);
    let output = "";
    let outputLine = 1;
    let unwantedInitialOutputLines = isFileInput
      ? 0
      : testCase.text_input.split("\n").length;

    session.process = ptyProcess;

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
      const result = await compileJava(
        filePath,
        socket,
        session,
        userDir,
      ).catch((e) => {
        session.running = false;
        socket.emit("error", e?.message || "Compilation failed");
        return "Failed";
      });
      if (result === "Failed") {
        return;
      }
    }
    await runCode(command, filePath, userDir, session, socket, language);
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
    session.running = true;

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
        ).catch((e) => {
          session.running = false;
          socket.emit("error", e.message);
          return;
        });
      }

      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (inputFilePath && fs.existsSync(inputFilePath))
        fs.unlinkSync(inputFilePath);
      socket.emit("test_cases_completed", session.testCasesPassed);
      session.running = false;
      session.process = null;
      session.testCasesPassed = 0;
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
