import pty from "node-pty";
import fs, { existsSync } from "fs";
import process from "process";
import path from "path";
import { spawn } from "child_process";

export function prepareExecutionContext(session, socket) {
  if (session && !session?.running) {
    session.running = true;
    session.errorCases = [];
    session.testCasesPassed = 0;
    session.process = null;
  } else {
    socket.emit("error", "Code is already running");
    return null;
  }
}

export function compileJava(filePath, socket, session, userDir) {
  return new Promise((resolve, reject) => {
    const ptyProcess = pty.spawn("javac", [filePath], {
      name: "xterm-color",
      cols: 80,
      rows: 24,
      cwd: userDir,
      env: process.env,
    });
    session.process = ptyProcess;

    ptyProcess.onData((data) => {
      socket.emit("code_compiled_stdout", data);
    });

    const cleanup = () => {
      ptyProcess.kill();
      session.process = null;
    };

    ptyProcess.onExit(({ exitCode }) => {
      cleanup();
      clearTimeout(timeoutId);
      if (exitCode !== 0) {
        socket.emit("error", `[Compilation Failed with exit code ${exitCode}]`);
        reject(`Failed`);
      } else {
        resolve("Success");
      }
    });

    const duration = 5000;
    let timeoutId = setTimeout(() => {
      if (session.running) {
        socket.emit("error", "[Execution Timed Out]\r\n");
        cleanup();
        reject("Timeout");
      }
    }, duration);
  });
}

export function runCode(command, filePath, socket, session, userDir) {
  return new Promise((resolve, reject) => {
    // 1. Setup State
    const runArg = command === "java" ? "Main" : filePath;

    const ptyProcess = pty.spawn(command, [runArg], {
      name: "xterm-color",
      cols: 80,
      rows: 24,
      cwd: userDir,
      env: process.env,
    });

    session.process = ptyProcess;
    session.running = true;

    // 2. Define Cleanup First
    // We use a timer variable to clear it later
    let timeoutId;

    const cleanup = async () => {
      if (!session.running) return;
      session.running = false;

      // Clear the safety timeout immediately
      clearTimeout(timeoutId);

      // Unsubscribe from Socket input
      socket.off("input", inputHandler);

      // Dispose node-pty listeners
      dataListener.dispose();
      exitListener.dispose();

      // Kill the process group
      try {
        ptyProcess.kill();
      } catch (e) {
        /* Already dead */
        console.error("Process already dead:", e);
      }

      session.running = false;
      session.process = null;

      // Async file deletion (non-blocking)
      if (filePath && fs.existsSync(path.join(userDir, "Main.class")))
        fs.unlinkSync(path.join(userDir, "Main.class"));
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    };

    // 3. Listeners
    const dataListener = ptyProcess.onData((data) => {
      socket.emit("code_stdout", data);
    });

    const inputHandler = (data) => {
      ptyProcess.write(data);
    };
    socket.on("input", inputHandler);

    const exitListener = ptyProcess.onExit(({ exitCode }) => {
      if (!session.running) return;

      socket.emit("code_completed", { exitCode });

      if (exitCode === 0) resolve("Success");
      else reject(new Error(`Exit Code: ${exitCode}`));

      cleanup();
    });

    // 4. Safety Timeout
    const timeoutDuration = command === "java" ? 15000 : 5000;
    timeoutId = setTimeout(() => {
      if (!session.running) return;
      socket.emit("error", "[Execution Timed Out]\r\n");
      cleanup();
      reject(new Error("Timeout"));
    }, timeoutDuration);
  });
}

export async function handleJavaExecution(filePath, socket, session, userDir) {
  try {
    await compileJava(filePath, socket, session, userDir);
    await runCode("java", filePath, socket, session, userDir);
  } catch (err) {
    console.error("Execution Pipeline Error:", err.message);
  }
}

export function runTestCase(
  command,
  filePath,
  userDir,
  session,
  socket,
  testCase,
  isFileInput,
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

export async function handleTextInputTestCase(
  testCase,
  filePath,
  language,
  session,
  socket,
  userDir,
) {
  return new Promise((resolve, reject) => {
    // 1. Determine arguments based on language
    // Java needs the class name, Python needs the file path;
    const command = language.toLowerCase() === "java" ? "java" : "python3";
    const args =
      language.toLowerCase() === "java" ? ["-cp", userDir, "Main"] : [filePath];

    const child = spawn(command, args, {
      cwd: userDir,
      env: process.env,
    });

    const start = Date.now();

    session.process = child;
    let output = "";
    let errorOutput = "";

    // 2. Setup Timeout
    const timeoutId = setTimeout(() => {
      if (session.process) {
        child.kill();
        socket.emit("error", "[Execution Timed Out]\r\n");
        session.running = false;
        session.process = null;
        reject("Timeout");
      }
    }, 5000);

    // 3. Handle Input
    // If NOT file input, we pipe the testCase.text_input directly to stdin

    testCase.text_input.split("\n").forEach((line) => {
      child.stdin.write(line + "\r\n");
    });

    // 4. Capture Output (Cleanly!)
    child.stdout.on("data", (data) => {
      output += data.toString();
    });

    child.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    const cleanup = () => {
      clearTimeout(timeoutId);
      session.running = false;
      session.process = null;
      child.kill();
    };

    // 5. Completion Logic
    child.on("close", (exitCode) => {
      cleanup();
      const end = Date.now();
      const duration = end - start;
      const expectedOutput = testCase.expected_output.trim();
      const actualOutput = output.trim();

      // If there's a runtime error in stderr, we include it in the actual output
      const finalActual = errorOutput
        ? `${errorOutput}\n${actualOutput}`
        : actualOutput;

      const isPassed = expectedOutput === actualOutput && exitCode === 0;
      const statusText = isPassed ? "Passed" : "Failed";

      if (!session.testCasesPassed) session.testCasesPassed = 0;
      if (isPassed) session.testCasesPassed++;
      if (!isPassed) {
        session.errorCases.push(testCase);
      }

      const outputResult = `Duration: ${duration}ms\r\nExpected Output: ${expectedOutput}\r\nActual Output: ${finalActual.trim()}\r\nStatus: ${statusText}\r\n----------------------------------------\r\n`;

      socket.emit("test_case_completed", outputResult);

      session.process = null;
      // We don't set session.running = false here because
      // the loop in the calling function handles multiple test cases.

      if (exitCode === 0) {
        resolve(outputResult);
      } else {
        // We resolve even on "Failure" because the test finished its job;
        // the loop should continue to the next case.
        reject(errorOutput);
      }
    });

    child.on("error", (err) => {
      cleanup();
      socket.emit("error", `Process Error: ${err.message}`);
      reject(err);
    });
  });
}

export async function handleFileInputTestCase(
  testCase,
  language,
  filePath,
  userDir,
  session,
) {
  return new Promise(async (resolve, reject) => {
    const runArg = language.toLowerCase() === "java" ? "Main" : filePath;
    const command = language.toLowerCase() === "java" ? "java" : "python3";

    const start = Date.now();
    const ptyProcess = pty.spawn(command, [runArg], {
      name: "xterm-color",
      cols: 80,
      rows: 24,
      cwd: userDir,
      env: process.env,
    });

    session.process = ptyProcess;
    session.running = true;

    let output = "";

    ptyProcess.onData((data) => {
      output += data.toString();
    });

    const duration = language.toLowerCase() === "java" ? 10000 : 5000;
    const timeout = setTimeout(() => {
      ptyProcess.kill();
      session.running = false;
      session.process = null;
      reject("Time Limit Exceeded");
    }, duration);

    ptyProcess.onExit(({ exitCode }) => {
      const end = Date.now();
      const duration = end - start;
      clearTimeout(timeout);
      const isPassed = testCase.expected_output.trim() === output.trim();
      if (!session.testCasesPassed) {
        session.testCasesPassed = 0;
      }
      if (isPassed) {
        session.testCasesPassed++;
      } else {
        session.errorCases.push(testCase);
      }

      const finalResult =
        `Duration: ${duration}ms\r\n` +
        `Input: ${JSON.stringify(testCase.text_input)}\r\n` +
        `Expected: ${testCase.expected_output.trim()}\r\n` +
        `Actual:   ${output.trim()}\r\n` +
        `Status:   ${isPassed ? "Passed" : "Failed"}\r\n----------------------------------------\r\n`;

      if (exitCode === 0) {
        resolve(finalResult);
      } else {
        reject(output);
      }
    });
  });
}
