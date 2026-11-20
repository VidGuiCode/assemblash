/**
 * Readable messages for the typed refusals of page sets and exports.
 *
 * The engine refuses with a stable code and, for some codes, structured
 * details. This module turns the codes it knows into a translated sentence
 * that names what is wrong. It knows nothing about the page: the editor and
 * the export dialog both ask it, and an unknown code gives `null`, so the
 * caller keeps its own fallback.
 */

import { t, type MessageKey } from "./i18n.js";

/** What a refusal carries: the fields of `ApiError` that this module reads. */
export interface Refusal {
  code: string;
  details: unknown;
}

/** Codes whose message needs nothing from the details. */
const PLAIN: Readonly<Record<string, MessageKey>> = {
  exportFormatNotSupported: "refusals.exportFormatNotSupported",
  exportQualityOutOfRange: "refusals.exportQualityOutOfRange",
  lossyWebpNotSupported: "refusals.lossyWebpNotSupported",
  exportQualityNotApplicable: "refusals.exportQualityNotApplicable",
  printNeedsPdf: "refusals.printNeedsPdf",
  pagesNeedPdf: "refusals.pagesNeedPdf",
  invalidPageSelection: "refusals.invalidPageSelection",
  colorSpaceNotSupported: "refusals.colorSpaceNotSupported",
  exportEncodingFailed: "refusals.exportEncodingFailed",
  invalidPageSetName: "refusals.invalidPageSetName",
  pageSetUnreadable: "refusals.pageSetUnreadable",
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function text(value: unknown, fallback = "?"): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

/** A translated message for a refusal this module knows, else `null`. */
export function refusalMessage(refusal: Refusal): string | null {
  const plain = PLAIN[refusal.code];
  if (plain) return t(plain);
  const details = record(refusal.details);
  switch (refusal.code) {
    case "pageSetNotFound":
      return t("refusals.pageSetNotFound", { set: text(details["name"]) });
    case "pageSetMalformed":
      return t("refusals.pageSetMalformed", { set: text(details["set"]) });
    case "pageSetMemberMissing": {
      const missing = Array.isArray(details["missing"]) ? details["missing"] : [];
      const names = missing.map((one) => text(record(one)["name"])).join(", ");
      return t("refusals.pageSetMemberMissing", { set: text(details["set"]), names: names || "?" });
    }
    case "pageSetLoop": {
      const chain = Array.isArray(details["chain"]) ? details["chain"].map((one) => text(one)) : [];
      return t("refusals.pageSetLoop", { set: chain[0] ?? "?", chain: chain.join(" → ") || "?" });
    }
    case "pageSetDuplicatePage": {
      const page = (value: unknown): string => typeof value === "number" ? String(value + 1) : "?";
      return t("refusals.pageSetDuplicatePage", {
        set: text(details["set"]),
        project: text(details["project"]),
        first: page(details["first"]),
        second: page(details["second"]),
      });
    }
    default:
      return null;
  }
}
