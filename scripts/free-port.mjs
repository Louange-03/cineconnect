import { execSync } from "node:child_process"

function run(command) {
  return execSync(command, { stdio: ["ignore", "pipe", "ignore"], encoding: "utf8" })
}

function freePortWindows(port) {
  const output = run(`netstat -ano | findstr :${port}`)
  const pids = new Set(
    output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.split(/\s+/).at(-1))
      .filter((v) => v && /^\d+$/.test(v))
  )

  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" })
      console.log(`[predev] Freed port ${port} (killed PID ${pid})`)
    } catch {
      // ignore
    }
  }
}

function freePortUnix(port) {
  const output = run(`lsof -ti tcp:${port}`)
  const pids = new Set(
    output
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
  )
  for (const pid of pids) {
    try {
      execSync(`kill -9 ${pid}`, { stdio: "ignore" })
      console.log(`[predev] Freed port ${port} (killed PID ${pid})`)
    } catch {
      // ignore
    }
  }
}

const port = Number(process.argv[2] || 3001)

try {
  if (process.platform === "win32") {
    freePortWindows(port)
  } else {
    freePortUnix(port)
  }
} catch {
  console.log(`[predev] Port ${port} is already free`)
}
