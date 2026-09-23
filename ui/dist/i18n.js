import { en } from "./locale-en.js";
import { fr } from "./locale-fr.js";
import { de } from "./locale-de.js";
const STORAGE_KEY = "assemblash.language";
const catalogues = {
    en,
    fr,
    de,
};
function normaliseLocale(value) {
    return value === "fr" || value === "de" || value === "pseudo" ? value : "en";
}
function savedLocale() {
    try {
        return normaliseLocale(window.localStorage.getItem(STORAGE_KEY));
    }
    catch {
        return "en";
    }
}
let locale = typeof window === "undefined" ? "en" : savedLocale();
export function getLocale() {
    return locale;
}
export function setLocale(value) {
    locale = normaliseLocale(value);
    try {
        window.localStorage.setItem(STORAGE_KEY, locale);
    }
    catch {
        // The selection still applies to this page when storage is disabled.
    }
    document.documentElement.lang = locale === "pseudo" ? "en" : locale;
    bindTranslations();
    window.dispatchEvent(new Event("assemblash:localechange"));
}
function pseudo(value) {
    return `⟦${value.replace(/\{[a-zA-Z][a-zA-Z0-9]*\}|[A-Za-z]/g, (part) => part.startsWith("{") ? part : `${part}${"aeiouAEIOU".includes(part) ? part : ""}`)}⟧`;
}
export function t(key, values = {}) {
    const text = locale === "pseudo" ? en[key] : catalogues[locale][key];
    const source = text ?? en[key] ?? `[${key}]`;
    return (locale === "pseudo" ? pseudo(source) : source).replace(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g, (match, name) => Object.hasOwn(values, name) ? String(values[name]) : match);
}
export function formatNumber(value) {
    return new Intl.NumberFormat(locale === "pseudo" ? "en" : locale).format(value);
}
export function formatCount(key, count, values = {}) {
    const category = new Intl.PluralRules(locale === "pseudo" ? "en" : locale).select(count);
    const candidate = `${key}.${category}`;
    const fallback = `${key}.other`;
    const selected = Object.hasOwn(en, candidate) ? candidate : fallback;
    return t(selected, { ...values, count: formatNumber(count) });
}
const translatedAttributes = new Set(["title", "placeholder", "aria-label", "aria-description", "alt"]);
export function bindTranslations(root = document) {
    document.documentElement.lang = locale === "pseudo" ? "en" : locale;
    const elements = [];
    if (root instanceof Element)
        elements.push(root);
    elements.push(...root.querySelectorAll("[data-i18n], [data-i18n-attr], [data-i18n-count]"));
    for (const element of elements) {
        const textKey = element.getAttribute("data-i18n");
        if (textKey && Object.hasOwn(en, textKey)) {
            element.textContent = t(textKey);
        }
        const countKey = element.getAttribute("data-i18n-count");
        const count = Number(element.getAttribute("data-count"));
        if (countKey && Number.isFinite(count) && Object.hasOwn(en, `${countKey}.other`)) {
            element.textContent = formatCount(countKey, count);
        }
        const attributes = element.getAttribute("data-i18n-attr");
        if (!attributes)
            continue;
        for (const binding of attributes.split(";")) {
            const separator = binding.indexOf(":");
            if (separator < 0)
                continue;
            const attribute = binding.slice(0, separator).trim();
            const key = binding.slice(separator + 1).trim();
            if (translatedAttributes.has(attribute) && Object.hasOwn(en, key)) {
                element.setAttribute(attribute, t(key));
            }
        }
    }
}
if (typeof document !== "undefined") {
    document.documentElement.lang = locale === "pseudo" ? "en" : locale;
    const start = () => {
        bindTranslations();
        new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node instanceof Element)
                        bindTranslations(node);
                }
            }
        }).observe(document.body, { childList: true, subtree: true });
    };
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    }
    else {
        start();
    }
}
