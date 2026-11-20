// The project search and menu, rendered with Mantine. Project data remains in
// the editor so every search still uses the engine's project-list endpoint.

import { useEffect, useRef, useState } from "react";
import { Button, TextInput } from "@mantine/core";
import { mountMantinePortal, useLocaleRevision } from "./mantine-root.js";
import * as api from "./api.js";
import { formatCount, t } from "./i18n.js";
import { matchingPageSets } from "./page-sets.js";

export interface ProjectPickerHost {
  /** Open a selected project through the editor's serialized project queue. */
  openProject(projectId: string): void;
  /** Ask app.ts to search the engine's project list after its debounce. */
  search(query: string): void;
  /** Open every page of a page set as tabs, through the editor's queue. */
  openPageSet(name: string): void;
}

export interface ProjectPicker {
  /** Replace the rows from app.ts's latest API response. */
  setProjects(
    projects: readonly api.ProjectSummary[],
    query: string,
    currentProject: string | null,
  ): void;
  /** Update the selected id after an app-side project change. */
  setCurrentProject(projectId: string | null): void;
  /** Replace the page-set names from app.ts's latest API response. */
  setPageSets(names: readonly string[]): void;
  /** Focus the search input. */
  focus(): void;
  /** Release the React root and global listeners. */
  destroy(): void;
}

type PickerState = {
  projects: readonly api.ProjectSummary[];
  query: string;
  currentProject: string | null;
};

type Controller = {
  /** The latest page-set names, kept also while the view is not mounted. */
  pageSets: readonly string[];
  setProjects(state: PickerState): void;
  setCurrentProject(projectId: string | null): void;
  setPageSets(names: readonly string[]): void;
  focus(): void;
};

const projectOptionStyles = {
  root: { width: "100%", height: "auto", minHeight: "3rem", paddingBlock: "0.5rem" },
  inner: { width: "100%" },
  label: {
    display: "grid",
    width: "100%",
    minWidth: 0,
    gap: "0.25rem",
    textAlign: "left",
  },
} as const;

function ProjectPickerView({ host, controller, boundary }: {
  host: ProjectPickerHost;
  controller: Controller;
  boundary: HTMLElement;
}) {
  const [state, setState] = useState<PickerState>({
    projects: [],
    query: "",
    currentProject: null,
  });
  const [query, setQuery] = useState("");
  const queryRef = useRef("");
  const [placeholder, setPlaceholder] = useState(t("projects.searchPlaceholder"));
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [pageSets, setPageSets] = useState<readonly string[]>(controller.pageSets);
  const localeVersion = useLocaleRevision();
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<number | undefined>(undefined);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    controller.setProjects = (next) => {
      stateRef.current = next;
      setState(next);
      setActiveIndex(-1);
      if (!next.query) {
        const current = next.currentProject
          ? next.projects.find((project) => project.id === next.currentProject)
          : undefined;
        setPlaceholder(current?.name ?? current?.id ?? (
          next.projects.length ? t("projects.searchPlaceholder") : t("projects.none")
        ));
      }
    };
    controller.setCurrentProject = (projectId) => {
      const previous = stateRef.current;
      const next = { ...previous, currentProject: projectId };
      stateRef.current = next;
      setState(next);
      const current = projectId
        ? previous.projects.find((project) => project.id === projectId)
        : undefined;
      setPlaceholder(current?.name ?? current?.id ?? (
        previous.projects.length ? t("projects.searchPlaceholder") : t("projects.none")
      ));
    };
    controller.setPageSets = (names) => setPageSets(names);
    setPageSets(controller.pageSets);
    controller.focus = () => inputRef.current?.focus();
    return () => {
      window.clearTimeout(searchTimer.current);
      controller.setProjects = () => {};
      controller.setCurrentProject = () => {};
      controller.setPageSets = () => {};
      controller.focus = () => {};
    };
  }, [controller]);

  useEffect(() => {
    if (query) return;
    const current = state.currentProject
      ? state.projects.find((project) => project.id === state.currentProject)
      : undefined;
    setPlaceholder(current?.name ?? current?.id ?? (
      state.projects.length ? t("projects.searchPlaceholder") : t("projects.none")
    ));
  }, [localeVersion]);

  useEffect(() => {
    const outside = (event: PointerEvent): void => {
      if (!(event.target instanceof Node) || !boundary.contains(event.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [boundary]);

  function setMenuOpen(next: boolean): void {
    setOpen(next);
    if (!next) setActiveIndex(-1);
  }

  function choose(project: api.ProjectSummary): void {
    const next = { ...stateRef.current, currentProject: project.id };
    stateRef.current = next;
    setState(next);
    setPlaceholder(project.name ?? project.id);
    queryRef.current = "";
    setQuery("");
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.blur();
    setMenuOpen(false);
    host.openProject(project.id);
  }

  function searchChanged(value: string): void {
    queryRef.current = value;
    setQuery(value);
    window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => host.search(value.trim()), 150);
  }

  function choosePageSet(name: string): void {
    queryRef.current = "";
    setQuery("");
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.blur();
    setMenuOpen(false);
    host.openPageSet(name);
  }

  // The options in keyboard order: the projects, then the page sets.
  const sets = matchingPageSets(pageSets, query);
  const optionCount = state.projects.length + sets.length;
  const optionId = (index: number): string => index < state.projects.length
    ? `project-option-${index}`
    : `page-set-option-${index - state.projects.length}`;

  function moveActive(direction: -1 | 1): void {
    if (!open) setMenuOpen(true);
    if (optionCount === 0) return;
    const first = direction > 0 ? 0 : optionCount - 1;
    const next = activeIndex < 0
      ? first
      : Math.max(0, Math.min(optionCount - 1, activeIndex + direction));
    setActiveIndex(next);
    window.requestAnimationFrame(() => {
      document.getElementById(optionId(next))?.scrollIntoView({ block: "nearest" });
    });
  }

  const matched = state.projects.length === 0 && sets.length === 0
    ? state.query ? t("projects.noMatching") : t("projects.none")
    : "";
  const activeDescendant = open && activeIndex >= 0 && activeIndex < optionCount
    ? optionId(activeIndex)
    : undefined;

  return (
    <>
      <i className="ph ph-magnifying-glass" aria-hidden="true" />
      <TextInput
        id="project-search"
        data-current-project={state.currentProject ?? ""}
        ref={inputRef}
        type="search"
        autoComplete="off"
        defaultValue=""
        placeholder={placeholder}
        aria-label={t("projects.searchPlaceholder")}
        aria-controls="project-options"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-activedescendant={activeDescendant}
        role="combobox"
        onChange={(event) => searchChanged(event.currentTarget.value)}
        onFocus={() => setMenuOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            moveActive(event.key === "ArrowDown" ? 1 : -1);
            return;
          }
          if (event.key === "Escape") {
            setMenuOpen(false);
            return;
          }
          if (event.key !== "Enter") return;
          const inputValue = inputRef.current?.value ?? queryRef.current;
          if (inputValue !== queryRef.current) {
            queryRef.current = inputValue;
            setQuery(inputValue);
          }
          const highlightedSet = activeIndex >= state.projects.length ? sets[activeIndex - state.projects.length] : undefined;
          if (highlightedSet) {
            event.preventDefault();
            choosePageSet(highlightedSet);
            return;
          }
          const highlighted = state.projects[activeIndex];
          const value = inputValue.trim().toLocaleLowerCase();
          const exact = state.projects.find((project) =>
            project.id.toLocaleLowerCase() === value
            || (project.name ?? project.id).toLocaleLowerCase() === value,
          );
          const choice = exact ?? highlighted;
          if (!choice) return;
          event.preventDefault();
          choose(choice);
        }}
      />
      <Button
        id="project-picker-toggle"
        className="project-picker-toggle"
        type="button"
        variant="subtle"
        aria-label={t("projects.showButton")}
        aria-controls="project-options"
        aria-expanded={open}
        onClick={() => {
          const next = !open;
          setMenuOpen(next);
          if (next) inputRef.current?.focus();
        }}
      >
        <i className="ph ph-caret-down" aria-hidden="true" />
      </Button>
      <div
        id="project-options"
        className="project-options"
        role="listbox"
        aria-label={t("projects.optionsLabel")}
        hidden={!open}
      >
        {state.projects.map((project, index) => (
          <Button
            key={project.id}
            id={`project-option-${index}`}
            className={`project-option${index === activeIndex ? " active" : ""}`}
            styles={projectOptionStyles}
            type="button"
            variant="subtle"
            title={project.name ?? project.id}
            data-project-id={project.id}
            role="option"
            aria-selected={project.id === state.currentProject}
            onClick={() => choose(project)}
          >
            <strong>{project.name ?? project.id}</strong>
            <span className="project-option-count"
              data-i18n-count="projects.layerCount"
              data-count={String(project.layers)}
            >
              {formatCount("projects.layerCount", project.layers)}
            </span>
          </Button>
        ))}
        {sets.length > 0
          ? <p className="project-options-heading" role="presentation">{t("pageSets.heading")}</p>
          : null}
        {sets.map((name, index) => (
          <Button
            key={`set:${name}`}
            id={`page-set-option-${index}`}
            className={`project-option page-set-option${state.projects.length + index === activeIndex ? " active" : ""}`}
            styles={projectOptionStyles}
            type="button"
            variant="subtle"
            title={t("pageSets.openLabel", { set: name })}
            data-page-set={name}
            role="option"
            aria-selected={false}
            onClick={() => choosePageSet(name)}
          >
            <strong><i className="ph ph-files" aria-hidden="true" /> {name}</strong>
            <span className="project-option-count">{t("pageSets.option")}</span>
          </Button>
        ))}
        {matched ? <p className="project-options-empty">{matched}</p> : null}
      </div>
    </>
  );
}

/** Mount the Mantine picker. Project changes use the editor's typed host callback. */
export function mountProjectPicker(
  host: ProjectPickerHost,
  target: HTMLElement,
): ProjectPicker {
  target.replaceChildren();
  const controller: Controller = {
    pageSets: [],
    setProjects: () => {},
    setCurrentProject: () => {},
    setPageSets: () => {},
    focus: () => {},
  };
  const unmount = mountMantinePortal("project-picker", target,
    <ProjectPickerView host={host} controller={controller} boundary={target} />);

  function setProjects(
    projects: readonly api.ProjectSummary[],
    query: string,
    currentProject: string | null,
  ): void {
    controller.setProjects({ projects, query, currentProject });
  }

  return {
    setProjects,
    setCurrentProject(projectId): void {
      controller.setCurrentProject(projectId);
    },
    setPageSets(names): void {
      controller.pageSets = names;
      controller.setPageSets(names);
    },
    focus: () => controller.focus(),
    destroy: unmount,
  };
}
