const express = require("express");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const {
  prepareExecutionContext,
  runCode,
  handleFileInputTestCase,
  handleTextInputTestCase,
  compileJava,
  compileJavaInDir,
} = require("./helper/Utils.js");

const app = express();
const server = http.createServer(app);

const allowedOrigin = process.env.ALLOWED_ORIGIN_TERMINAL;

const baseDir = path.join(__dirname, "sessions");
fs.mkdirSync(baseDir, { recursive: true });

const PYTHON_STDIN_WRAPPER = `import builtins

# Save the real input function
_original_input = builtins.input

# Redefine it to ignore the prompt argument and call the original with nothing
def silent_input(prompt=""):
    return _original_input()

builtins.input = silent_input
`;

function resolvePythonEntry(files, entry) {
  const keys = Object.keys(files || {});
  const pys = keys.filter((k) => k.toLowerCase().endsWith(".py"));
  const e = entry ? path.basename(entry) : null;
  if (e && files[e]) return e;
  if (pys.length === 1) return pys[0];
  const mainPy = pys.find((n) => n.toLowerCase() === "main.py");
  if (mainPy) return mainPy;
  if (pys.length)
    return [...pys].sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase()),
    )[0];
  return "main.py";
}

function javaMainClassFromSource(content) {
  const stripped = String(content || "").replace(
    /^\s*package\s+[\w.]+\s*;\s*/gim,
    "",
  );
  let m = stripped.match(/public\s+class\s+(\w+)/);
  if (!m) m = stripped.match(/class\s+(\w+)/);
  return m ? m[1] : "Main";
}

function resolveJavaEntry(files, entry) {
  const javas = Object.keys(files || {}).filter((k) =>
    k.toLowerCase().endsWith(".java"),
  );
  const trimmed = entry ? String(entry).trim() : "";
  if (trimmed && /^[A-Za-z_][A-Za-z0-9_]*$/.test(trimmed)) return trimmed;
  if (javas.length === 1)
    return javaMainClassFromSource(files[javas[0]] || "");
  const mainJava = javas.find((n) => n.toLowerCase() === "main.java");
  if (mainJava) return javaMainClassFromSource(files[mainJava] || "");
  for (const name of javas) {
    if (/public\s+static\s+void\s+main\s*\(/.test(files[name] || ""))
      return javaMainClassFromSource(files[name] || "");
  }
  const first = [...javas].sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase()),
  )[0];
  return javaMainClassFromSource(files[first] || "");
}

/**
 * @returns {{ filePath: string, javaMainClass: string | null }}
 */
function writeProjectFiles(userDir, language, code, files, entry) {
  const isJava = language.toLowerCase() === "java";

  if (files && typeof files === "object" && Object.keys(files).length) {
    let entryPy = "main.py";
    let javaMainClass = "Main";
    if (isJava) {
      javaMainClass = resolveJavaEntry(files, entry);
    } else {
      entryPy = resolvePythonEntry(files, entry);
    }
    for (const [name, content] of Object.entries(files)) {
      const safe = path.basename(name);
      let body = content;
      if (!isJava && safe === entryPy) {
        body = PYTHON_STDIN_WRAPPER + content;
      }
      fs.writeFileSync(path.join(userDir, safe), body);
    }
    const filePath = isJava
      ? path.join(userDir, `${javaMainClass}.java`)
      : path.join(userDir, entryPy);
    return { filePath, javaMainClass: isJava ? javaMainClass : null };
  }

  const entryName = isJava ? "Main.java" : "main.py";
  const filePath = path.join(userDir, entryName);
  const codeToWrite = isJava ? code : PYTHON_STDIN_WRAPPER + code;
  fs.writeFileSync(filePath, codeToWrite);
  return { filePath, javaMainClass: isJava ? "Main" : null };
}

function cleanupProjectSources(userDir) {
  if (!fs.existsSync(userDir)) return;
  for (const f of fs.readdirSync(userDir)) {
    if (/\.(py|java|class)$/i.test(f)) {
      try {
        fs.unlinkSync(path.join(userDir, f));
      } catch (_) {
        /* ignore */
      }
    }
  }
}

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
    const { language, code, files, entry } = data;

    const session = sessions.get(socket.id);
    prepareExecutionContext(session, socket);
    cleanupProjectSources(userDir);
    const { filePath, javaMainClass } = writeProjectFiles(
      userDir,
      language,
      code,
      files,
      entry,
    );

    if (language.toLowerCase() === "java") {
      try {
        if (files && typeof files === "object" && Object.keys(files).length) {
          await compileJavaInDir(userDir, socket, session);
        } else {
          await compileJava(filePath, socket, session, userDir);
        }
        const result = await runCode(
          "java",
          filePath,
          socket,
          session,
          userDir,
          javaMainClass || "Main",
        );
        socket.emit("code_completed", result);
      } catch (err) {
        socket.emit("error", err);
      }
    } else {
      try {
        const result = await runCode(
          "python3",
          filePath,
          socket,
          session,
          userDir,
        );
        socket.emit("code_completed", result);
      } catch (err) {
        socket.emit("error", err.toString().trim());
      }
    }
    cleanupProjectSources(userDir);
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

    const { language, testCases, isFileInput, code, files, entry } = data;
    prepareExecutionContext(session, socket);
    cleanupProjectSources(userDir);

    const { filePath, javaMainClass } = writeProjectFiles(
      userDir,
      language,
      code,
      files,
      entry,
    );
    const jmc = javaMainClass || "Main";

    if (language.toLowerCase() === "java") {
      try {
        if (files && typeof files === "object" && Object.keys(files).length) {
          await compileJavaInDir(userDir, socket, session);
        } else {
          await compileJava(filePath, socket, session, userDir);
        }
      } catch (e) {
        socket.emit("error", e);
      }
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
            jmc,
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
            jmc,
          );
          socket.emit("test_case_completed", output);
        } catch (error) {
          socket.emit("error", error);
        }
      }
    }

    cleanupProjectSources(userDir);
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
