// Shared installed-browser protocol for fixture and embedded-server journeys.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const WAIT_MS = 5000;
const COMMAND_MS = 15000;
const STARTUP_MS = 30000;
function withTimeout(promise, what, timeoutMs = WAIT_MS) {
  let timer;
  return Promise.race([
    Promise.resolve(promise),
    new Promise((_resolve, reject) => {
      timer = setTimeout(
        () => reject(new Error(`timed out after ${timeoutMs} ms waiting for ${what}`)),
        timeoutMs,
      );
    }),
  ]).finally(() => clearTimeout(timer));
}

// The condition itself is bounded by whatever is left of the budget, so a
// probe that never answers fails the same way a probe that keeps answering
// `false` does.
async function waitFor(condition, what, timeoutMs = WAIT_MS) {
  const deadline = Date.now() + timeoutMs;
  for (let remaining = timeoutMs; remaining > 0; remaining = deadline - Date.now()) {
    const value = await withTimeout(condition(), what, remaining);
    if (value) return value;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error(`timed out after ${timeoutMs} ms waiting for ${what}`);
}

function browserExecutable() {
  const configured = process.env.ASSEMBLASH_TEST_BROWSER;
  const candidates = process.platform === "win32"
    ? [
        configured,
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
      ]
    : process.platform === "darwin"
      ? [configured, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
      : [configured, "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"];
  return candidates.find((candidate) => candidate && existsSync(candidate)) ?? null;
}

class CdpPage {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id) {
        if (message.method === "Runtime.exceptionThrown") {
          this.events.push(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text);
        }
        if (message.method === "Runtime.consoleAPICalled") {
          this.events.push(message.params.args.map((arg) => arg.value ?? arg.description).join(" "));
        }
        return;
      }
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
    });
  }

  // A command whose answer never arrives — a browser that died, a socket that
  // closed under us, an `awaitPromise` on a promise the page never settles —
  // used to leave an entry in `pending` that nothing would ever resolve.
  send(method, params = {}) {
    const id = this.nextId++;
    const answer = new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
    return withTimeout(answer, `the browser to answer ${method}`, COMMAND_MS)
      .catch((error) => {
        this.pending.delete(id);
        throw error;
      });
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    }
    return result.result.value;
  }

  async waitFor(expression, description, timeoutMs = WAIT_MS) {
    try {
      await waitFor(() => this.evaluate(`Boolean(${expression})`), description, timeoutMs);
    } catch (error) {
      const page = await this.evaluate(`({
        url: location.href,
        ready: document.readyState,
        status: document.querySelector("#status")?.textContent,
        save: document.querySelector("#save-state")?.textContent
      })`).catch((reason) => ({ unreachable: reason.message }));
      throw new Error(`${error.message}: ${JSON.stringify(page)} ${this.events.join(" | ")}`);
    }
  }

  click(selector) {
    return this.evaluate(`(() => { const node = document.querySelector(${JSON.stringify(selector)}); if (!node) throw new Error(${JSON.stringify(`missing ${selector}`)}); node.click(); return true; })()`);
  }



  key(key, options = {}) {
    return this.evaluate(`(() => {
      const target = document.activeElement instanceof Element ? document.activeElement : document.body;
      target.dispatchEvent(new KeyboardEvent("keydown", ${JSON.stringify({ key, code: options.code ?? key, bubbles: true, ...options })}));
      return true;
    })()`);
  }
}

export async function startBrowser(url, width = 1400, height = 900) {
  const executable = browserExecutable();
  if (!executable) return null;
  const profile = mkdtempSync(join(tmpdir(), "assemblash-ui-test-"));
  const child = spawn(executable, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    "about:blank",
  ], { stdio: "ignore", windowsHide: true });
  let childError;
  child.on("error", (error) => { childError = error; });
  let socket;
  let stopped = false;
  const stop = async () => {
    if (stopped) return;
    stopped = true;
    try {
      socket?.close();
    } catch (error) {
      console.warn(`could not close the DevTools socket: ${error.message}`);
    }
    if (child.exitCode === null && child.signalCode === null && !childError) {
      const exited = new Promise((resolve) => child.once("exit", resolve));
      child.kill();
      try {
        await withTimeout(exited, "the browser to exit", STARTUP_MS);
      } catch {
        child.kill("SIGKILL");
        try {
          await withTimeout(exited, "the browser to exit after forced termination", WAIT_MS);
        } catch (error) {
          // A referenced ChildProcess can keep Node alive even after the test
          // has finished. The job timeout remains the final bound if the OS
          // refuses both termination requests.
          child.unref();
          console.warn(error.message);
        }
      }
    }
    try {
      rmSync(profile, { recursive: true, force: true, maxRetries: 20, retryDelay: 50 });
    } catch (error) {
      console.warn(`could not remove the browser profile ${profile}: ${error.message}`);
    }
  };

  try {
    const portFile = join(profile, "DevToolsActivePort");
    await waitFor(async () => {
      if (childError) throw new Error(`browser failed to start: ${childError.message}`);
      if (child.exitCode !== null || child.signalCode !== null) {
        throw new Error(`browser exited with ${child.exitCode ?? child.signalCode}`);
      }
      return existsSync(portFile);
    }, "the browser to write its DevTools port file", STARTUP_MS);
    const [port] = readFileSync(portFile, "utf8").trim().split(/\r?\n/);
    const targetController = new AbortController();
    let targets;
    try {
      targets = await withTimeout(
        fetch(`http://127.0.0.1:${port}/json/list`, {
          signal: targetController.signal,
        }).then((response) => response.json()),
        "the browser target list to be fetched and read",
        STARTUP_MS,
      );
    } catch (error) {
      targetController.abort();
      throw error;
    }
    const target = targets.find((one) => one.type === "page");
    assert.ok(target?.webSocketDebuggerUrl, "headless browser did not create a page target");
    socket = new WebSocket(target.webSocketDebuggerUrl);
    await withTimeout(
      new Promise((resolve, reject) => {
        socket.addEventListener("open", resolve, { once: true });
        socket.addEventListener("error", reject, { once: true });
      }),
      "the DevTools socket to open",
      STARTUP_MS,
    );
    const page = new CdpPage(socket);
    await page.send("Runtime.enable");
    await page.send("Page.enable");
    await page.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
    await page.send("Page.navigate", { url });
    await page.waitFor(`document.readyState === "complete" && document.querySelector("#status")?.textContent?.toLowerCase().includes("ready")`, "editor startup", STARTUP_MS);
    return { page, child, profile, close: stop };
  } catch (error) {
    await stop();
    throw error;
  }
}
