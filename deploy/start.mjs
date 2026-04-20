import { spawn } from "node:child_process";

const apiPort = process.env.PORT || "10000";
const nextPort = process.env.NEXT_PORT || "3000";
const nextInternalUrl = process.env.NEXT_INTERNAL_URL || `http://127.0.0.1:${nextPort}`;
const sharedEnv = {
  ...process.env,
  NODE_ENV: "production"
};

const processes = new Map();
let shuttingDown = false;
let exitCode = 0;

function stopChild(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) {
    return;
  }

  child.kill("SIGTERM");
  setTimeout(() => {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill("SIGKILL");
    }
  }, 10000).unref();
}

function shutdown() {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of processes.values()) {
    stopChild(child);
  }
}

function trackProcess(name, child) {
  processes.set(name, child);

  child.on("exit", (code, signal) => {
    processes.delete(name);

    if (!shuttingDown) {
      exitCode = code ?? (signal ? 1 : 0);
      shutdown();
    }

    if (processes.size === 0) {
      process.exit(exitCode);
    }
  });

  child.on("error", (error) => {
    console.error(`${name} process failed to start`, error);
    exitCode = 1;
    shutdown();
  });
}

trackProcess(
  "web",
  spawn("node", ["/app/web/server.js"], {
    env: {
      ...sharedEnv,
      PORT: nextPort,
      HOSTNAME: "127.0.0.1"
    },
    stdio: "inherit"
  })
);

trackProcess(
  "api",
  spawn("node", ["/app/server/index.js"], {
    env: {
      ...sharedEnv,
      PORT: apiPort,
      NEXT_INTERNAL_URL: nextInternalUrl
    },
    stdio: "inherit"
  })
);

process.on("SIGINT", () => {
  exitCode = 0;
  shutdown();
});

process.on("SIGTERM", () => {
  exitCode = 0;
  shutdown();
});