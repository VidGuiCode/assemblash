// The one-time token hand-off. The server sets a session cookie after it
// checks the token. The token is not stored in browser JavaScript.

import { bindTranslations, t } from "./i18n.js";
import "./token.js";

bindTranslations();

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

  say(t("login.checking"), "info");
  void fetch("/api/browser-session", {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
  })
    .then((response) => {
      if (response.ok) {
        window.location.replace("/");
        return;
      }
      if (response.status === 401) {
        say(t("login.rejected"), "error");
        return;
      }
      say(t("login.serverStatus", { status: response.status }), "error");
    })
    .catch((error: unknown) => say(String(error), "error"));
});
