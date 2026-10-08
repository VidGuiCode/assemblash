// Measure a keyboard edit through the authoritative Rust preview and image paint.
// Use the same fixture, host, browser, viewport, and sample count for each build.
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { cpus, platform } from "node:os";
import { join, resolve } from "node:path";

const options = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, args) => {
  if (value.startsWith("--")) pairs.push([value.slice(2), args[index + 1]]);
  return pairs;
}, []));
for (const key of ["binary", "workspace", "fixture", "output"]) {
  if (!options[key]) throw new Error(`Require --${key}`);
}
const binary = resolve(options.binary);
const workspace = resolve(options.workspace);
const fixture = resolve(options.fixture);
const sampleCount = Number(options.samples ?? 20);
const profileOutput = options.profile ? resolve(options.profile) : null;
if (!Number.isInteger(sampleCount) || sampleCount < 5) throw new Error("Require at least five samples");
const browserPath = options.browser ?? process.env.ASSEMBLASH_TEST_BROWSER ?? [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome", "/usr/bin/chromium",
].find(existsSync);
if (!browserPath) throw new Error("Set --browser to Chrome or Chromium");
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const pause = (ms) => new Promise((done) => setTimeout(done, ms));
async function until(probe, description, ms = 30000) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    if (await probe()) return;
    await pause(25);
  }
  throw new Error(`Timeout: ${description}`);
}
function command(args) {
  const result = spawnSync(binary, args, { encoding: "utf8", windowsHide: true, timeout: 30000 });
  if (result.status !== 0) throw new Error(`${args[0]}: ${result.stderr ?? result.error}`);
  return result.stdout;
}
async function freePort() {
  const server = createServer();
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  const port = server.address().port;
  await new Promise((done) => server.close(done));
  return port;
}
mkdirSync(join(workspace, "projects"), { recursive: true });
const project = join(workspace, "projects", "latency");
if (existsSync(project)) throw new Error("Use a fresh benchmark workspace");
command(["new", project, "--width", "1920", "--height", "1080", "--background", "#fafafa", "--name", "Latency"]);
if (!existsSync(fixture)) {
  const document = JSON.parse(readFileSync(join(project, "document.json"), "utf8"));
  document.layers = Array.from({ length: 30 }, (_, index) => ({
    id: `layer_latency_${String(index).padStart(2, "0")}`,
    name: `Rectangle ${index}`, type: "shape", shape: { kind: "rect", cornerRadius: 12 },
    fill: ["#336699", "#993366", "#669933"][index % 3],
    transform: { x: 40 + (index % 6) * 290, y: 40 + Math.floor(index / 6) * 190, width: 220, height: 140, rotation: index % 3 * 7 },
    opacity: 0.85, visible: true, locked: false, protected: false, readOnly: false, effects: [],
  }));
  writeFileSync(fixture, JSON.stringify(document, null, 2) + "\n");
}
const fixtureBytes = readFileSync(fixture);
writeFileSync(join(project, "document.json"), fixtureBytes);
const loginCheck = options["login-check"] === "true";
const accessToken = loginCheck ? command(["token", "show", "--workspace", workspace]).trim() : null;
const port = await freePort();
const serverArgs = ["serve", "--workspace", workspace, "--port", String(port)];
if (!loginCheck) serverArgs.push("--friendly");
if (options["ui-dir"]) serverArgs.push("--ui-dir", resolve(options["ui-dir"]));
const server = spawn(binary, serverArgs, { stdio: "ignore", windowsHide: true });
const profile = mkdtempSync(join(workspace, "chrome-"));
let chrome;
let socket;
try {
  const base = `http://127.0.0.1:${port}`;
  await until(async () => {
    if (server.exitCode !== null) throw new Error(`Server exited ${server.exitCode}`);
    try {
      const response = await fetch(`${base}/api/version`);
      return loginCheck ? response.status === 401 : response.ok;
    } catch { return false; }
  }, "server startup");
  chrome = spawn(browserPath, ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
    "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore", windowsHide: true });
  await until(() => existsSync(join(profile, "DevToolsActivePort")), "Chrome startup");
  const chromePort = readFileSync(join(profile, "DevToolsActivePort"), "utf8").trim().split(/\r?\n/)[0];
  const targets = await (await fetch(`http://127.0.0.1:${chromePort}/json/list`)).json();
  socket = new WebSocket(targets.find((target) => target.type === "page").webSocketDebuggerUrl);
  await new Promise((done, fail) => { socket.addEventListener("open", done, { once: true }); socket.addEventListener("error", fail, { once: true }); });
  let id = 0;
  const pending = new Map();
  const exceptions = [];
  const externalRequests = [];
  let loginRequestValid = false;
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.method === "Runtime.exceptionThrown") {
      const details = message.params.exceptionDetails;
      exceptions.push(details.exception?.description ?? details.text);
    }
    if (message.method === "Network.requestWillBeSent") {
      const request = message.params.request;
      if (/^https?:/.test(request.url) && !request.url.startsWith(`${base}/`)) externalRequests.push(request.url);
      if (loginCheck && request.url === `${base}/api/browser-session`) {
        const authorization = Object.entries(request.headers).find(([name]) => name.toLowerCase() === "authorization")?.[1];
        loginRequestValid = request.method === "POST" && authorization === `Bearer ${accessToken}` && !request.postData;
      }
    }
    const entry = pending.get(message.id);
    if (!entry) return;
    pending.delete(message.id);
    clearTimeout(entry.timer);
    message.error ? entry.fail(new Error(message.error.message)) : entry.done(message.result);
  });
  function send(method, params = {}) {
    const request = ++id;
    return new Promise((done, fail) => {
      const timer = setTimeout(() => { pending.delete(request); fail(new Error(`Timeout: ${method}`)); }, 30000);
      pending.set(request, { done, fail, timer });
      socket.send(JSON.stringify({ id: request, method, params }));
    });
  }
  async function evaluate(expression) {
    const response = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true });
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text);
    return response.result.value;
  }
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Network.enable");
  if (profileOutput) {
    await send("Page.addScriptToEvaluateOnNewDocument", { source: `
      window.__assemblashProfile = [];
      const record = (kind, detail = {}) => window.__assemblashProfile.push({ kind, at: performance.now(), ...detail });
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const entry = { kind: "fetch", url: String(args[0]), at: performance.now() };
        window.__assemblashProfile.push(entry);
        try {
          const response = await originalFetch(...args);
          entry.headersAt = performance.now();
          for (const method of ["json", "blob"]) {
            const original = response[method].bind(response);
            response[method] = async () => {
              const value = await original();
              entry.bodyAt = performance.now();
              return value;
            };
          }
          return response;
        } catch (error) { entry.failedAt = performance.now(); throw error; }
      };
      document.addEventListener("keydown", (event) => record("keydown", { key: event.key }), true);
      document.addEventListener("load", (event) => {
        if (event.target?.id === "canvas-image") record("preview-loaded");
      }, true);
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) record("long-task", { start: entry.startTime, duration: entry.duration });
      }).observe({ type: "longtask", buffered: true });
    ` });
  }
  await send("Emulation.setDeviceMetricsOverride", { width: 1400, height: 900, deviceScaleFactor: 1, mobile: false });
  if (loginCheck) {
    await send("Page.navigate", { url: `${base}/login.html` });
    await until(() => evaluate('Boolean(document.querySelector("#login-form #token"))'), "embedded login form");
    await evaluate(`(() => {
      const input = document.querySelector("#login-form #token");
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, ${JSON.stringify(accessToken)});
      input.dispatchEvent(new Event("input", { bubbles: true }));
    })()`);
    await evaluate('document.querySelector("#login-form").requestSubmit()');
    await until(() => evaluate('Boolean(document.querySelector("#canvas"))'), "authenticated editor navigation");
    const { cookies } = await send("Network.getCookies", { urls: [base] });
    if (!loginRequestValid || !cookies.some((cookie) => cookie.httpOnly && cookie.sameSite === "Strict")) {
      throw new Error("Login must use the bearer header and an HttpOnly, SameSite=Strict session cookie");
    }
    const leakedToken = await evaluate(`document.cookie.includes(${JSON.stringify(accessToken)}) || location.href.includes(${JSON.stringify(accessToken)}) || Object.values(localStorage).includes(${JSON.stringify(accessToken)})`);
    if (leakedToken) throw new Error("Login token entered browser-visible storage");
  }
  await send("Page.navigate", { url: `${base}/?perf` });
  try {
    await until(() => evaluate('document.querySelector("#status")?.textContent.toLowerCase().includes("ready")'), "editor startup");
  } catch (error) {
    if (options.screenshot) {
      const capture = await send("Page.captureScreenshot", { format: "png" });
      writeFileSync(resolve(options.screenshot), Buffer.from(capture.data, "base64"));
    }
    const status = await evaluate('({ status: document.querySelector("#status")?.textContent, kind: document.querySelector("#status")?.dataset.kind, canvas: Boolean(document.querySelector("#canvas")) })');
    throw new Error(`${error.message}; ${JSON.stringify(status)}; ${exceptions.join("; ")}`);
  }
  const oldPicker = await evaluate(`Boolean(document.querySelector("#projects"))`);
  if (oldPicker) {
    await evaluate(`(() => { const select = document.querySelector("#projects"); select.value = "latency"; select.dispatchEvent(new Event("change", { bubbles: true })); })()`);
  } else {
    await evaluate('document.querySelector("#project-search").focus()');
    await until(() => evaluate('Boolean(document.querySelector("#project-options [data-project-id=latency]"))'), "project picker rows");
    await evaluate('document.querySelector("#project-options [data-project-id=latency]").click()');
  }
  await until(() => evaluate('Boolean(document.querySelector("#canvas-image")?.complete && document.querySelector("#canvas-image")?.naturalWidth > 0 && document.querySelector(".layer"))'), "project preview");
  const layerPoint = await evaluate('(() => { const layer = document.querySelector(".layer[data-id=layer_latency_29]"); layer.scrollIntoView({ block: "center" }); const rect = layer.getBoundingClientRect(); return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }; })()');
  await send("Input.dispatchMouseEvent", { type: "mousePressed", ...layerPoint, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", ...layerPoint, button: "left", clickCount: 1 });
  await evaluate('document.querySelector("#canvas").focus({ preventScroll: true })');
  await pause(500);
  const samples = [];
  const profileSamples = [];
  if (profileOutput) {
    await send("Profiler.enable");
    await send("Profiler.start");
  }
  for (let index = 0; index < sampleCount + 3; index++) {
    if (profileOutput) await evaluate("window.__assemblashProfile.length = 0; performance.clearResourceTimings()");
    await evaluate(`window.latencySample = new Promise((resolve, reject) => {
      const image = document.querySelector("#canvas-image");
      const before = image.src;
      const start = performance.now();
      const timeout = setTimeout(() => { image.removeEventListener("load", loaded); reject(new Error("Rust preview did not load after edit")); }, 20000);
      function loaded() {
        if (image.src === before) return;
        image.removeEventListener("load", loaded);
        clearTimeout(timeout);
        requestAnimationFrame(() => requestAnimationFrame(() => resolve(performance.now() - start)));
      }
      image.addEventListener("load", loaded);
    }); true`);
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
    const elapsed = await evaluate("window.latencySample");
    if (index >= 3) samples.push(elapsed);
    await until(() => evaluate('document.querySelector("#save-state")?.textContent.includes("All changes saved")'), "edit saved");
    if (profileOutput) profileSamples.push(await evaluate(`({ warmup: ${index < 3}, events: window.__assemblashProfile,
      resources: performance.getEntriesByType("resource").map(({ name, startTime, duration, responseStart, responseEnd }) =>
        ({ name, startTime, duration, responseStart, responseEnd })) })`));
  }
  if (profileOutput) {
    const { profile: cpuProfile } = await send("Profiler.stop");
    writeFileSync(profileOutput, JSON.stringify({ samples: profileSamples, cpuProfile }, null, 2) + "\n");
  }
  if (exceptions.length) throw new Error(`Browser exceptions: ${exceptions.join("; ")}`);
  if (externalRequests.length) throw new Error(`Interface requests external assets: ${externalRequests.join("; ")}`);
  if (options.screenshot) {
    const capture = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(resolve(options.screenshot), Buffer.from(capture.data, "base64"));
  }
  const sorted = [...samples].sort((a, b) => a - b);
  const result = {
    label: options.label ?? binary, host: platform(), cpu: cpus()[0].model,
    browser: await send("Browser.getVersion"), viewport: [1400, 900], fixtureSha256: sha256(fixtureBytes),
    binarySha256: sha256(readFileSync(binary)), binaryVersion: command(["--version"]).trim(),
    loginChecked: loginCheck, uiSource: options["ui-dir"] ? "directory" : "embedded", externalAssetRequests: externalRequests.length,
    metric: "ArrowRight input to authoritative preview load and two animation frames", warmupSamples: 3,
    samplesMs: samples, medianMs: sorted[Math.floor(sorted.length / 2)], p95Ms: sorted[Math.ceil(sorted.length * 0.95) - 1],
  };
  writeFileSync(resolve(options.output), JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify(result));
} finally {
  socket?.close();
  chrome?.kill();
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/shutdown`, {
      method: "POST", headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) }, body: "{}",
    });
    if (!response.ok) server.kill();
  } catch { server.kill(); }
}
