"use client";
import React, { useRef, useEffect } from "react";
import { io } from "socket.io-client";
import "xterm/css/xterm.css";

const XTerminal = ({ code, runCount, setIsRunningCode }) => {
  const terminalRef = useRef(null);
  const socketRef = useRef(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (runCount > 0 && socketRef.current) {
      socketRef.current.emit("run_code", { code: code, runCount: runCount });
    }
    if (isInitialized.current) return;
    isInitialized.current = true;

    const initTerminal = async () => {
      const { Terminal } = await import("xterm");
      const { FitAddon } = await import("xterm-addon-fit");
      let handleResize = null;

      // 1. Connect to our backend server
      const socket = io("http://localhost:4000");
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

      if (terminalRef.current) {
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
          setIsRunningCode(false);
        });

        socket.on("code_completed", () => {
          term.write(`\r\nuser@code-grader % `);
        });

        // 4. Handle Window Resize
        handleResize = () => {
          fitAddon.fit();
          socket.emit("resize", { cols: term.cols, rows: term.rows });
        };
        window.addEventListener("resize", handleResize);
      }

      return () => {
        socket.disconnect();
        if (handleResize) {
          window.removeEventListener("resize", handleResize);
        }
      };
    };

    initTerminal();
  }, [runCount, code]);

  return <div ref={terminalRef} style={{ height: "200px", width: "100%" }} />;
};

export default XTerminal;
