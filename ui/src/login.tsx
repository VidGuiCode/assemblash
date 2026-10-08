import { useEffect, useState, type FormEvent } from "react";
import { Button, Code, Group, Paper, PasswordInput, Stack, Text, Title } from "@mantine/core";
import { mountMantinePortal, startMantineRoot, useLocaleRevision } from "./mantine-root.js";
import { bindTranslations, t } from "./i18n.js";

function LoginView() {
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [kind, setKind] = useState<"info" | "error">("info");
  const localeVersion = useLocaleRevision();
  const [busy, setBusy] = useState(false);
  useEffect(() => { bindTranslations(); }, [localeVersion]);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const value = token.trim();
    if (!value) return;
    setBusy(true);
    setKind("info");
    setMessage(t("login.checking"));
    try {
      const response = await fetch("/api/browser-session", {
        method: "POST",
        headers: { authorization: `Bearer ${value}` },
      });
      if (response.ok) {
        window.location.replace("/");
      } else if (response.status === 401) {
        setKind("error");
        setMessage(t("login.rejected"));
      } else {
        setKind("error");
        setMessage(t("login.serverStatus", { status: response.status }));
      }
    } catch (error) {
      setKind("error");
      setMessage(String(error));
    } finally {
      setBusy(false);
    }
  }

  return <main className="login-panel" data-login-version={localeVersion}>
    <Paper withBorder shadow="sm" radius="md" p="xl" maw={500} mx="auto">
      <Stack gap="lg">
        <div><Title order={1}>Assemblash</Title>
          <Text mt="sm">{t("login.introBeforeCommand")} <Code>assemblash token show</Code> {t("login.introBetweenCommands")} <Code>config.toml</Code>.</Text>
        </div>
        <form id="login-form" onSubmit={(event) => void submit(event)}>
          <Stack gap="md">
            <PasswordInput id="token" label={t("login.accessToken")} value={token} onChange={(event) => setToken(event.currentTarget.value)} autoComplete="off" spellCheck={false} required />
            <Group justify="flex-end"><Button type="submit" loading={busy}>{t("login.continue")}</Button></Group>
          </Stack>
        </form>
        <Text id="login-status" data-kind={kind} role={kind === "error" ? "alert" : "status"} aria-live="polite">{message}</Text>
        <Text size="sm" c="dimmed">{t("login.hintBeforeAuthorization")} <Code>Authorization</Code> {t("login.hintAfterAuthorization")}</Text>
      </Stack>
    </Paper>
  </main>;
}

const root = document.getElementById("mantine-root");
const mount = document.getElementById("login-root");
if (!(root instanceof HTMLElement) || !(mount instanceof HTMLElement)) throw new Error("Missing login root");
startMantineRoot(root);
mountMantinePortal("login", mount, <LoginView />);
