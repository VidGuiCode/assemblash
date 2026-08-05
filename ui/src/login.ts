// The one-time token hand-off.
//
// A server bound to a network address needs a token on every request. Rather
// than making a person paste it into a header by hand, this page takes it
// once, checks it against the server, and keeps it in this browser.
//
// `sessionStorage`, not `localStorage`: the token disappears when the tab
// closes, which is the right default for a credential someone typed once.

import { TOKEN_KEY } from "./token.js";

const form = document.getElementById("login-form") as HTMLFormElement;
const input = document.getElementById("token") as HTMLInputElement;
const status = document.getElementById("login-status") as HTMLParagraphElement;

function say(message: string, kind: "info" | "error"): void {
  status.textContent = message;
  status.dataset["kind"] = kind;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const token = input.value.trim();
  if (!token) return;

  say("Checking…", "info");
  // Checked before it is stored, so a typo is a message here rather than an
  // interface that loads and then fails everything it tries.
  void fetch("/api/version", { headers: { authorization: `Bearer ${token}` } })
    .then((response) => {
      if (response.ok) {
        sessionStorage.setItem(TOKEN_KEY, token);
        window.location.replace("/");
        return;
      }
      if (response.status === 401) {
        say("That token was not accepted.", "error");
        return;
      }
      say(`The server answered ${response.status}.`, "error");
    })
    .catch((error: unknown) => say(String(error), "error"));
});
