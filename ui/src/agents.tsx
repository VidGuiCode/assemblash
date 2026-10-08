// "Connect an AI agent": a Mantine island on the page.
//
// The dialog leaves the hand-rolled DOM of the old agents.ts and renders from
// Mantine, on Vite. Everything the journeys and unit tests pin stays a
// stable hook: `#agents-dialog` (opened state read from `data-state`),
// `#agents-blocks` with `.agent-block[data-block]` and a `code` child,
// `#agents-token`, and the `#agents-done` button. The pure configuration
// logic keeps its exports; agents.test.mjs imports them from the built
// bundle, exactly as it did when tsc emitted this file.

import { useEffect, useRef, useState } from "react";
import { Button, Flex, Modal, Stack, Text, Title } from "@mantine/core";
import "./agents-theme.css";
import { mountMantinePortal } from "./mantine-root.js";
import { useLocaleRevision } from "./mantine-root.js";

import * as api from "./api.js";
import { agentConfigBlocks } from "./agent-config.js";
export { agentConfigBlocks, tomlString } from "./agent-config.js";
export type { AgentConfigBlock } from "./agent-config.js";
import { t } from "./i18n.js";
import type { AgentAccess } from "./api.js";

interface AgentsHost {
  say(message: string, kind?: "info" | "error"): void;
}

/** Copies text, with a fallback for pages that are not a secure context. */
async function copyText(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.append(area);
  area.select();
  const copied = document.execCommand("copy");
  area.remove();
  if (!copied) throw new Error(t("agents.copyRefused"));
}

/** Where the first-run hint remembers that it was shown. */
const HINT_KEY = "assemblash-agent-hint-v1";

type OpenController = { current: ((access: AgentAccess) => void) | null };

function AgentsDialog({
  host,
  controller,
}: {
  host: AgentsHost;
  controller: OpenController;
}) {
  const localeRevision = useLocaleRevision();
  void localeRevision;
  const [access, setAccess] = useState<AgentAccess | null>(null);
  const [open, setOpen] = useState(false);
  const hostRef = useRef(host);
  hostRef.current = host;

  useEffect(() => {
    controller.current = (next: AgentAccess) => {
      setAccess(next);
      setOpen(true);
    };
    return () => {
      controller.current = null;
    };
  }, [controller]);

  const blocks = access === null ? [] : agentConfigBlocks(access);

  return (
    <Modal
      id="agents-dialog"
      data-state={open ? "open" : "closed"}
      opened={open}
      onClose={() => setOpen(false)}
      title={t("agents.dialogTitle")}
      centered
      size="min(720px, calc(100vw - 2rem))"
      padding="lg"
      trapFocus
      closeOnEscape
      returnFocus
    >
        <Flex align="center" justify="between" gap="3" mb="md">
          <div>
            <Text component="p" size="xs" fw={600} mb={4} style={{ letterSpacing: "0.08em" }}>
              {t("agents.protocol")}
            </Text>
            <Title order={2} size="h2" m={0}>{t("agents.dialogTitle")}</Title>
          </div>
        </Flex>
        <Text component="p" size="sm" c="dimmed" mb="sm">
          {t("agents.introLocal")}
        </Text>
        <Text component="p" size="sm" c="dimmed" mb="md">
          {t("agents.introConfig")}
        </Text>
        <p id="agents-token" hidden={access?.tokenRequired !== true}>
          {t("agents.tokenBeforeCommand")} <code>assemblash token show</code>{" "}
          {t("agents.tokenBetweenCommands")} <code>Authorization: Bearer &lt;token&gt;</code>
          {t("agents.tokenAfterCommand")}
        </p>
        <Stack id="agents-blocks" gap="md">
          {blocks.map((block) => (
            <Stack component="section" key={block.id} className="agent-block" data-block={block.id} gap="xs">
              <Flex align="center" justify="between" gap="md" my="sm">
                <Title order={3} size="h4" m={0}>{block.title}</Title>
                <Button
                  size="xs"
                  variant="light"
                  className="agent-copy"
                  onClick={() => {
                    copyText(block.text).then(
                      () => hostRef.current.say(t("agents.copied", { title: block.title })),
                      (error: unknown) =>
                        hostRef.current.say(
                          t("agents.copyError", { error: String(error) }),
                          "error",
                        ),
                    );
                  }}
                >
                  <i className="ph ph-copy" aria-hidden="true" /> {t("agents.copyButton")}
                </Button>
              </Flex>
              <Text component="p" size="xs" c="dimmed" mb="xs">
                {block.hint}
              </Text>
              {/* Text content only: nothing from the server is read as markup. */}
              <pre className="agents-config">
                <code>{block.text}</code>
              </pre>
            </Stack>
          ))}
        </Stack>
        <Flex justify="flex-end" gap="md" mt="lg">
          <Button id="agents-done" onClick={() => setOpen(false)}>
            {t("common.done")}
          </Button>
        </Flex>
    </Modal>
  );
}

export function mountAgents(host: AgentsHost): {
  open: () => Promise<void>;
  offerOnFirstRun: () => void;
} {
  const container = document.createElement("div");
  container.dataset["island"] = "agents";
  document.body.append(container);

  const controller: OpenController = { current: null };
  mountMantinePortal("agents", container, <AgentsDialog host={host} controller={controller} />);

  async function open(): Promise<void> {
    try {
      const next = await api.agentAccess();
      controller.current?.(next);
    } catch (error) {
      const message = error instanceof api.ApiError ? error.message : String(error);
      host.say(t("agents.openError", { error: message }), "error");
      return;
    }
  }

  /** Opens the dialog once, on the first run of an empty workspace. */
  function offerOnFirstRun(): void {
    let shown = false;
    try {
      shown = window.localStorage.getItem(HINT_KEY) !== null;
      window.localStorage.setItem(HINT_KEY, "shown");
    } catch {
      // No storage: offer it, and accept that it may be offered again.
    }
    if (!shown) void open();
  }

  return { open, offerOnFirstRun };
}
