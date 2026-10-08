import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Flex, Modal, Text, TextInput } from "@mantine/core";
import { t } from "./i18n.js";
import type { MessageKey } from "./i18n.js";
import { mountMantinePortal, useLocaleRevision } from "./mantine-root.js";

export type NameSubmit = (name: string) => void;

export interface NamePrompt {
  /** Open the prompt and call submit once after a valid submission. */
  request(
    titleKey: MessageKey,
    labelKey: MessageKey,
    confirmKey: MessageKey,
    submit: NameSubmit,
  ): void;
}

interface PromptRequest {
  titleKey: MessageKey;
  labelKey: MessageKey;
  confirmKey: MessageKey;
  submit: NameSubmit;
}

interface NamePromptController {
  open?: (request: PromptRequest) => void;
}

function NamePromptView({ controller }: { controller: NamePromptController }) {
  const [request, setRequest] = useState<PromptRequest | null>(null);
  const [opened, setOpened] = useState(false);
  const localeRevision = useLocaleRevision();
  void localeRevision;
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpened(false);
    setRequest(null);
    setValue("");
  }, []);

  const submit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = inputRef.current;
    if (!input?.reportValidity()) return;
    const name = input.value.trim();
    if (!name) return;
    const callback = request?.submit;
    close();
    callback?.(name);
  }, [close, request]);

  const open = useCallback((next: PromptRequest) => {
    setRequest(next);
    setValue("");
    setOpened(true);
  }, []);

  controller.open = open;

  return (
    <Modal
      id="name-dialog"
      data-state={opened ? "open" : "closed"}
      opened={opened}
      onClose={close}
      title={request ? t(request.titleKey) : t("dialogs.nameItem")}
      centered
      size="min(32rem, calc(100vw - 2rem))"
      padding="lg"
      trapFocus
      closeOnEscape
      closeOnClickOutside={false}
      returnFocus
      keepMounted
      keepMountedMode="display-none"
      closeButtonProps={{ "aria-label": t("common.close") }}
      onEnterTransitionEnd={() => inputRef.current?.focus()}
      ref={(element) => {
        if (!element) return;
        Object.defineProperty(element, "open", {
          configurable: true,
          get: () => opened,
        });
      }}
    >
      <Text component="p" size="xs" fw={600} mb="xs" style={{ letterSpacing: "0.08em" }}>
        {t("dialogs.documentSetup")}
      </Text>
      <form
        ref={formRef}
        onSubmit={submit}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          if (formRef.current && submitButtonRef.current) {
            formRef.current.requestSubmit(submitButtonRef.current);
          }
        }}
      >
        <TextInput
          id="name-dialog-input"
          ref={inputRef}
          label={<span id="name-dialog-label">{request ? t(request.labelKey) : t("common.name")}</span>}
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          autoComplete="off"
          maxLength={80}
          required
          autoFocus
        />
        <Flex justify="flex-end" gap="sm" mt="lg">
          <Button type="button" variant="default" onClick={close}>
            {t("common.cancel")}
          </Button>
          <Button id="name-dialog-confirm" ref={submitButtonRef} type="submit">
            {request ? t(request.confirmKey) : t("common.save")}
          </Button>
        </Flex>
      </form>
    </Modal>
  );
}

/** Mount the reusable name prompt and expose the existing request callback shape. */
export function mountNamePrompt(): NamePrompt {
  const root = window.document.createElement("div");
  root.dataset["island"] = "name-prompt";
  window.document.body.append(root);
  const controller: NamePromptController = {};
  mountMantinePortal("name-prompt", root, <NamePromptView controller={controller} />);
  const open = controller.open;
  if (!open) throw new Error("Mantine name prompt failed to mount");

  return {
    request(titleKey, labelKey, confirmKey, submit): void {
      open({ titleKey, labelKey, confirmKey, submit });
    },
  };
}
