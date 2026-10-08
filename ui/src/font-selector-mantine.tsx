import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  Combobox,
  Text,
  TextInput,
  useCombobox,
} from "@mantine/core";
import { mountMantinePortal, useLocaleRevision } from "./mantine-root.js";
import { appendInstalledFontSpecimen, facesOf, preferredFace, releaseFontSpecimens } from "./fonts.js";
import type { FontSelector, FontSelectorHost } from "./fonts.js";
import { formatNumber, t } from "./i18n.js";
import type { FontRecord, FontStoreListing } from "./api.js";

interface FontSelectorActions {
  initialFamily: string;
  initialDisabled: boolean;
  setFamily?: (family: string) => void;
  setDisabled?: (disabled: boolean) => void;
}

let nextSelectorId = 0;

let fontSelectorSerial = 0;

function installedFamily(value: string, listing: FontStoreListing): string | null {
  const wanted = value.trim().toLowerCase();
  if (!wanted) return null;
  return listing.families.find((family) => family.toLowerCase() === wanted) ?? null;
}

function FamilyOption({
  family,
  face,
  active,
  selected,
  id,
  onMouseDown,
}: {
  family: string;
  face: FontRecord | null;
  active: boolean;
  selected: boolean;
  id: string;
  onMouseDown: (event: React.MouseEvent<HTMLLIElement>) => void;
}) {
  const optionRef = useRef<HTMLLIElement>(null);
  useLayoutEffect(() => {
    const option = optionRef.current;
    if (!option) return;
    if (face) appendInstalledFontSpecimen(option, face);
    return () => releaseFontSpecimens(option);
  }, [face]);

  return (
    <li ref={optionRef} id={id} data-family={family} className={active ? "active" : undefined} aria-selected={selected} onMouseDown={onMouseDown}>
    <Combobox.Option value={family} active={active} selected={selected}>
      <span className="font-selector-family">{family}</span>
      <Text component="span" size="xs" c="dimmed" className="font-selector-faces">
        {face
          ? `${face.style === "italic" ? t("fonts.styleItalic") : t("fonts.styleNormal")} ${formatNumber(face.weight)}`
          : t("fonts.facesUnknown")}
      </Text>
      {!face && <span className="font-specimen-status">{t("fonts.previewUnavailable")}</span>}
    </Combobox.Option>
    </li>
  );
}

function FontSelectorView({
  host,
  onCommit,
  actions,
}: {
  host: FontSelectorHost;
  onCommit: (family: string) => void;
  actions: FontSelectorActions;
}) {
  const localeRevision = useLocaleRevision();
  void localeRevision;
  const [query, setQuery] = useState(actions.initialFamily);
  const [message, setMessage] = useState(false);
  const [disabled, setDisabled] = useState(actions.initialDisabled);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const currentRef = useRef("");
  const optionsId = useMemo(() => `font-selector-options-${++fontSelectorSerial}`, []);
  const combobox = useCombobox({
    loop: true,
    onDropdownClose: () => setActiveIndex(-1),
  });

  const listing = host.store();
  const wanted = query.trim().toLowerCase();
  const families = wanted
    ? listing.families.filter((family) => family.toLowerCase().includes(wanted))
    : listing.families;

  const close = useCallback(() => {
    combobox.closeDropdown();
    setActiveIndex(-1);
  }, [combobox]);

  const chooseFamily = useCallback((family: string) => {
    currentRef.current = family;
    setQuery(family);
    setMessage(false);
    close();
    inputRef.current?.blur();
    onCommit(family);
  }, [close, onCommit]);

  const handleBlur = useCallback(() => {
    close();
    const value = inputRef.current?.value.trim() ?? "";
    if (!value || value.toLowerCase() === currentRef.current.toLowerCase()) return;
    const family = installedFamily(value, host.store());
    if (!family) {
      setMessage(true);
      return;
    }
    currentRef.current = family;
    setQuery(family);
    setMessage(false);
    onCommit(family);
  }, [close, host, onCommit]);

  const handleFocus = useCallback(() => {
    setQuery(inputRef.current?.value ?? "");
    setMessage(false);
    setActiveIndex(-1);
    combobox.openDropdown();
  }, [combobox]);

  const setInput = useCallback((input: HTMLInputElement | null) => {
    inputRef.current = input;
    if (input) {
      // Native listeners retain the selector's focus/blur contract, including
      // callers that dispatch those events while driving browser journeys.
      input.onfocus = () => flushSync(() => handleFocus());
      input.onblur = handleBlur;
      input.oninput = () => {
        flushSync(() => {
          setQuery(input.value);
          setMessage(false);
          setActiveIndex(-1);
          combobox.openDropdown();
        });
      };
      input.onkeydown = (event) => flushSync(() => handleKeyDown(event));
    }
  }, [actions, handleBlur, handleFocus, handleKeyDown]);

  actions.setFamily = (family) => {
    currentRef.current = family;
    setQuery(family);
    setMessage(false);
  };
  actions.setDisabled = (nextDisabled) => {
    setDisabled(nextDisabled);
    if (nextDisabled) close();
  };

  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!combobox.dropdownOpened) combobox.openDropdown();
      if (families.length) {
        setActiveIndex((index) => {
          const delta = event.key === "ArrowDown" ? 1 : -1;
          return (index + delta + families.length) % families.length;
        });
      }
      return;
    }
    if (event.key === "Enter" && combobox.dropdownOpened && activeIndex >= 0) {
      const family = families[activeIndex];
      if (family) {
        event.preventDefault();
        chooseFamily(family);
      }
      return;
    }
    if (event.key === "Escape" && combobox.dropdownOpened) {
      event.preventDefault();
      event.stopPropagation();
      close();
    }
  }

  useLayoutEffect(() => {
    if (activeIndex < 0) return;
    document.getElementById(`${optionsId}-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, optionsId]);

  return (
    <>
      <Combobox
        store={combobox}
        onOptionSubmit={chooseFamily}
        position="bottom-start"
        offset={4}
        withinPortal={false}
        floatingStrategy="fixed"
        shadow="md"
        onDismiss={() => close()}
      >
        <Combobox.Target withKeyboardNavigation={false} withAriaAttributes={false}>
          <TextInput
            ref={setInput}
            value={query}
            autoComplete="off"
            disabled={disabled}
            role="combobox"
            aria-autocomplete="list"
            aria-label={t("editor.fontFamily")}
            aria-expanded={combobox.dropdownOpened}
            aria-controls={optionsId}
            aria-activedescendant={activeIndex >= 0 ? `${optionsId}-${activeIndex}` : undefined}
            onChange={(event) => {
              setQuery(event.currentTarget.value);
              setMessage(false);
              setActiveIndex(-1);
              combobox.openDropdown();
            }}
          />
        </Combobox.Target>
        <Combobox.Dropdown
          className="font-selector-list"
          hidden={!combobox.dropdownOpened}
          aria-labelledby={`${optionsId}-heading`}
        >
          <Text component="p" size="xs" fw={700} c="dimmed" id={`${optionsId}-heading`} className="font-selector-heading" data-i18n="fonts.selectorHeading">
            {t("fonts.selectorHeading")}
          </Text>
          <Combobox.Options id={optionsId} role="listbox">
            {families.map((family, index) => {
              const faces = facesOf(family, listing.faces);
              return (
                <FamilyOption
                  key={family}
                  id={`${optionsId}-${index}`}
                  family={family}
                  face={preferredFace(faces)}
                  active={index === activeIndex}
                  selected={index === activeIndex}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    chooseFamily(family);
                  }}
                />
              );
            })}
            {families.length === 0 && (
              <Combobox.Empty className="font-selector-none">
                <Text component="span" size="xs" c="dimmed" data-i18n="fonts.noFamilyMatches">
                  {t("fonts.noFamilyMatches")}
                </Text>
              </Combobox.Empty>
            )}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
      <Text component="p" size="xs" c="dimmed" className="font-selector-message" data-i18n="fonts.notInstalled" hidden={!message}>
        {t("fonts.notInstalled")}
      </Text>
    </>
  );
}

/** Mount the Mantine selector with the same imperative contract as fonts.ts. */
export function mountFontSelectorMantine(
  host: FontSelectorHost,
  onCommit: (family: string) => void,
): FontSelector {
  const root = window.document.createElement("span");
  root.className = "font-selector";
  const actions: FontSelectorActions = {
    initialFamily: "",
    initialDisabled: false,
  };
  const unmount = mountMantinePortal(`font-selector-${++nextSelectorId}`, root,
    <FontSelectorView host={host} onCommit={onCommit} actions={actions} />);
  return {
    root,
    setFamily: (family) => {
      actions.initialFamily = family;
      actions.setFamily?.(family);
    },
    setDisabled: (disabled) => {
      actions.initialDisabled = disabled;
      actions.setDisabled?.(disabled);
    },
    destroy: unmount,
  };
}
