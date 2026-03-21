"use client";
import React, { useRef, useEffect } from "react";
import { io } from "socket.io-client";
import "xterm/css/xterm.css";
import { useMetadata } from "@/context";

const terminalUrl = process.env.NEXT_PUBLIC_TERMINAL_URL;

const XTerminal = ({
  code,
  runCount,
  setIsRunningCode,
  isRunningTestCases,
  setIsRunningTestCases,
  inputFile,
  language,
  isFileInput,
  testCases,
}) => {
  const terminalRef = useRef(null);
  const socketRef = useRef(null);
  const isInitialized = useRef(false);
  const countHolder = useRef(0);
  const oldInputFile = useRef(null);
  const termObjectRef = useRef(null);
  const { user } = useMetadata();
  const visibleTestCases = testCases?.filter((t) =>
    user.role.toLowerCase() == "st" ? !t?.is_hidden : true,
  );

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const initTerminal = async () => {
      const { Terminal } = await import("xterm");
      const { FitAddon } = await import("xterm-addon-fit");
      let handleResize = null;

      // 1. Connect to our backend server
      const socket = io(terminalUrl);
      socketRef.current = socket;

      const term = new Terminal({
        cursorBlink: true,
        theme: {
          background: "#282a36", // Dracula Theme Background
          foreground: "#f8f8f2", // Text color
          cursor: "#ff79c6", // Pink cursor
          selectionBackground: "#44475a",
          black: "#000000",
          red: "#ff5555",
        },
        fontFamily: '"Fira Code", monospace',
        fontSize: 14,
        letterSpacing: 1.1,
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      if (terminalRef.current && runCount == 0) {
        term.open(terminalRef.current);
        fitAddon.fit();

        term.write(
          `Warhawk Terminal v1.0.0\r\n` +
            `Copyright (c) 2026 ULM CSCI 4060\r\n` +
            `Note: Input is only accepted if the code requests it during execution.\r\n` +
            `----------------------------------------\r\n` +
            `user@code-grader % `,
        );

        // 2. Receive data from Server
        socket.on("output", (data) => {
          term.write(data);
        });

        // 3. Send data to Server (Keystrokes)
        term.onData((data) => {
          socket.emit("input", data);
        });

        socket.on("code_stdout", (data) => {
          term.write(data);
        });

        socket.on("code_completed", () => {
          setIsRunningCode(false);
          term.write(`\r\nuser@code-grader % `);
        });

        socket.on("code_compiled_stdout", (data) => {
          if (data.toString().trim() !== "") {
            term.write(data);
          }
        });

        socket.on("error", (data) => {
          setIsRunningCode(false);
          setIsRunningTestCases(false);
          term.write(`Error: ${data}\r\n`);
          term.write(`\r\nuser@code-grader % `);
        });

        socket.on("test_case_completed", (output) => {
          setIsRunningTestCases(false);
          term.write(output);
        });

        socket.on("test_cases_completed", (passedCount) => {
          setIsRunningTestCases(false);
          term.write(
            `Passed ${passedCount} out of ${visibleTestCases.length} test cases\r\n----------------------------------------\r\n`,
          );
          term.write(`\r\nuser@code-grader % `);
        });

        // 4. Handle Window Resize
        handleResize = () => {
          fitAddon.fit();
          // socket.emit("resize", { cols: term.cols, rows: term.rows });
        };
        window.addEventListener("resize", handleResize);
      }

      termObjectRef.current = term;

      return () => {
        socket.disconnect();
        if (handleResize) {
          window.removeEventListener("resize", handleResize);
        }
      };
    };

    initTerminal();
  }, []);

  // Run the test cases when the isRunningTestCases is true
  useEffect(() => {
    if (isRunningTestCases && socketRef.current) {
      termObjectRef.current.write(
        `Running Test Cases... \r\n\n----------------------------------------\r\n`,
      );
      socketRef.current.emit("run_test_case", {
        code: code,
        language: language,
        testCases: visibleTestCases,
        isFileInput: isFileInput,
      });
    }
  }, [isRunningTestCases]);

  // Run the code when the run count is greater than 0
  useEffect(() => {
    const runCode = async () => {
      countHolder.current = runCount;
      socketRef.current.emit("run_code", {
        language: language,
        code: code,
      });
    };

    if (runCount > 0 && runCount > countHolder.current && socketRef.current) {
      runCode();
    }
  }, [runCount, code, language]);

  // Clear the terminal when the run count is 0
  useEffect(() => {
    if (runCount == 0 && termObjectRef.current && isInitialized.current) {
      countHolder.current = runCount;
      termObjectRef.current.clear();
    }
  }, [runCount]);

  // Handle the input file change
  useEffect(() => {
    async function handleInputFileChange(inputFile) {
      // Removing the input file
      if (inputFile == null && oldInputFile.current != null) {
        // Skip delete when file is input.txt and test cases are running — run_test_case
        // creates/overwrites input.txt; deleting here would race and remove the test input
        const isTestInput = oldInputFile.current.name === "input.txt";
        if (!(isTestInput && isRunningTestCases)) {
          socketRef.current.emit("delete_input_file", {
            inputFileDetails: {
              name: oldInputFile.current.name,
            },
          });
        }
        oldInputFile.current = null;
      }
      // Adding the input file when it is not already present
      else if (inputFile != null && oldInputFile.current == null) {
        socketRef.current.emit("upload_input_file", {
          inputFileDetails: {
            name: inputFile.name,
            file: await inputFile.text(),
          },
        });
        oldInputFile.current = inputFile;
      }
      // No change in the input file
      else if (inputFile == null && oldInputFile.current == null) {
        return;
      }
      // Updating the input file
      else if (inputFile != null && oldInputFile.current != null) {
        socketRef.current.emit("upload_input_file", {
          inputFileDetails: {
            name: inputFile.name,
            file: await inputFile.text(),
          },
        });
        oldInputFile.current = inputFile;
      }
    }
    handleInputFileChange(inputFile);
  }, [inputFile, isRunningTestCases]);

  return <div ref={terminalRef} style={{ height: "200px", width: "100%" }} />;
};

export default XTerminal;
