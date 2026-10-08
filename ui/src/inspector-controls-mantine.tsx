import { useEffect, useRef, useState } from "react";
import { Button, Checkbox, NativeSelect, Textarea, TextInput } from "@mantine/core";
import { mountMantinePortal, useLocaleRevision } from "./mantine-root.js";

export type InspectorLabel = string | (() => string);
const labelText = (label: InspectorLabel): string => typeof label === "function" ? label() : label;

export interface InspectorFieldProps {
  id: string;
  label: InspectorLabel;
  title?: InspectorLabel;
  value: string;
  type?: "text" | "number" | "textarea";
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number | string;
  list?: string;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
  options?: readonly { value: string; label: InspectorLabel }[];
  onMount?(element: HTMLElement): void;
  onCommit(value: string): void;
}

function InspectorField(props: InspectorFieldProps) {
  useLocaleRevision();
  const label = labelText(props.label);
  const title = props.title === undefined ? undefined : labelText(props.title);
  const committed = useRef(props.value);
  const commit = (value: string) => {
    if (value === committed.current) return;
    committed.current = value;
    props.onCommit(value);
  };
  if (props.options) {
    return <NativeSelect ref={(element) => { if (element) props.onMount?.(element); }} id={props.id} label={label} aria-label={label} title={title} size={props.size}
      defaultValue={props.value} disabled={props.disabled} data={props.options.map((option) => ({ value: option.value, label: labelText(option.label) }))}
      classNames={props.className ? { input: props.className } : undefined}
      onChange={(event) => commit(event.currentTarget.value)} />;
  }
  if (props.type === "textarea") {
    return <Textarea ref={(element) => { if (element) props.onMount?.(element); }} id={props.id} label={label} aria-label={label} title={title} size={props.size}
      defaultValue={props.value} disabled={props.disabled} rows={props.rows} maxLength={props.maxLength}
      placeholder={props.placeholder}
      classNames={props.className ? { input: props.className } : undefined}
      onChange={(event) => { if (event.nativeEvent.type === "change") commit(event.currentTarget.value); }}
      onBlur={(event) => commit(event.currentTarget.value)}
      onKeyDown={(event) => {
        if (event.key !== "Enter" || !(event.ctrlKey || event.metaKey)) return;
        event.preventDefault();
        commit(event.currentTarget.value);
      }} />;
  }
  return <TextInput ref={(element) => { if (element) props.onMount?.(element); }} id={props.id} label={label} aria-label={label} title={title} size={props.size}
    type={props.type ?? "text"} defaultValue={props.value} disabled={props.disabled}
    min={props.min} max={props.max} step={props.step} list={props.list}
    classNames={props.className ? { input: props.className } : undefined}
    onChange={(event) => { if (event.nativeEvent.type === "change") commit(event.currentTarget.value); }}
    onBlur={(event) => commit(event.currentTarget.value)}
    onKeyDown={(event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      commit(event.currentTarget.value);
    }} />;
}

export interface InspectorButtonProps {
  id: string;
  label: InspectorLabel;
  title?: InspectorLabel;
  type?: "button" | "submit";
  icon?: string;
  iconOnly?: boolean;
  className?: string;
  variant?: "default" | "filled" | "light" | "subtle" | "outline";
  color?: string;
  disabled?: boolean;
  onMount?(button: HTMLButtonElement): void;
  onClick(): void;
}

function InspectorButton(props: InspectorButtonProps) {
  useLocaleRevision();
  const label = labelText(props.label);
  const title = props.title === undefined ? undefined : labelText(props.title);
  return <Button ref={(button) => { if (button) props.onMount?.(button); }} id={props.id} type={props.type ?? "button"} className={props.className}
    variant={props.variant ?? "default"} color={props.color} disabled={props.disabled}
    title={title} aria-label={label} leftSection={props.icon ? <i className={`ph ${props.icon}`} aria-hidden="true" /> : undefined}
    onClick={props.onClick}><span className={props.iconOnly ? "sr-only" : "toolbar-label"}>{label}</span></Button>;
}

let controlId = 0;

export interface InspectorCheckboxProps {
  id: string;
  label: InspectorLabel;
  checked: boolean;
  disabled?: boolean;
  className?: string;
  onChange(checked: boolean): void;
}

function InspectorCheckbox(props: InspectorCheckboxProps) {
  useLocaleRevision();
  const [checked, setChecked] = useState(props.checked);
  useEffect(() => { setChecked(props.checked); }, [props.checked]);
  return <Checkbox id={props.id} label={labelText(props.label)} checked={checked}
    disabled={props.disabled} classNames={props.className ? { input: props.className } : undefined}
    onChange={(event) => { setChecked(event.currentTarget.checked); props.onChange(event.currentTarget.checked); }} />;
}

/** Mount a checkbox through the shared root. The controller owns its operation. */
export function mountInspectorCheckbox(target: HTMLElement, props: InspectorCheckboxProps): () => void {
  return mountMantinePortal(`inspector-checkbox-${++controlId}`, target, <InspectorCheckbox {...props} />);
}

/** Mount a field through the shared root. The controller handles each committed value. */
export function mountInspectorField(target: HTMLElement, props: InspectorFieldProps): () => void {
  return mountMantinePortal(`inspector-field-${++controlId}`, target, <InspectorField {...props} />);
}

/** Mount an action through the shared root. The controller owns its operation. */
export function mountInspectorButton(target: HTMLElement, props: InspectorButtonProps): () => void {
  return mountMantinePortal(`inspector-button-${++controlId}`, target, <InspectorButton {...props} />);
}
