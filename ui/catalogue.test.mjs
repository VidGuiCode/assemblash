import assert from "node:assert/strict";
import test from "node:test";

function placeholders(message) {
  return [...message.matchAll(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g)]
    .map((match) => match[1]).sort();
}

test("all catalogues use the English keys and parameter names", async () => {
  const [{ en }, { fr }, { de }] = await Promise.all([
    import("./dist/locale-en.js"),
    import("./dist/locale-fr.js"),
    import("./dist/locale-de.js"),
  ]);
  const keys = Object.keys(en).sort();
  assert.ok(keys.length > 0, "English catalogue is empty");
  for (const [language, catalogue] of [["fr", fr], ["de", de]]) {
    assert.deepEqual(Object.keys(catalogue).sort(), keys, `${language} keys differ`);
    for (const key of keys) {
      assert.equal(typeof catalogue[key], "string", `${language} ${key} is not text`);
      assert.ok(catalogue[key].trim(), `${language} ${key} is empty`);
      assert.deepEqual(placeholders(catalogue[key]), placeholders(en[key]),
        `${language} ${key} parameters differ`);
    }
  }

  const pluralBases = keys.filter((key) => key.endsWith(".other"))
    .map((key) => key.slice(0, -".other".length));
  assert.ok(pluralBases.length > 0, "no plural messages found");
  for (const base of pluralBases) {
    assert.ok(Object.hasOwn(en, `${base}.one`), `${base} has no singular form`);
    for (const catalogue of [en, fr, de]) {
      assert.ok(placeholders(catalogue[`${base}.one`]).includes("count"),
        `${base}.one must use count`);
      assert.ok(placeholders(catalogue[`${base}.other`]).includes("count"),
        `${base}.other must use count`);
    }
  }
});

test("locale preference survives a reload and unknown values use English", async () => {
  const stored = new Map();
  const original = { window: globalThis.window, document: globalThis.document, Element: globalThis.Element };
  const document = {
    documentElement: { lang: "en" },
    readyState: "loading",
    addEventListener() {},
    querySelectorAll() { return []; },
  };
  globalThis.document = document;
  globalThis.Element = class Element {};
  globalThis.window = {
    localStorage: {
      getItem(key) { return stored.get(key) ?? null; },
      setItem(key, value) { stored.set(key, value); },
    },
    dispatchEvent() {},
  };
  try {
    const [{ en }, first] = await Promise.all([
      import("./dist/locale-en.js"),
      import("./dist/i18n.js?first"),
    ]);
    const ordinaryKey = Object.keys(en).find((key) => !key.endsWith(".one") && !key.endsWith(".other"));
    assert.ok(ordinaryKey);
    first.setLocale("de");
    assert.equal(first.getLocale(), "de");
    assert.equal(document.documentElement.lang, "de");
    assert.equal(stored.get("assemblash.language"), "de");
    const reloaded = await import("./dist/i18n.js?reloaded");
    assert.equal(reloaded.getLocale(), "de");
    assert.equal(reloaded.t(ordinaryKey), first.t(ordinaryKey));
    reloaded.setLocale("not-a-locale");
    assert.equal(reloaded.getLocale(), "en");
    assert.equal(document.documentElement.lang, "en");
    assert.equal(reloaded.t(ordinaryKey), en[ordinaryKey]);
    stored.set("assemblash.language", "unknown");
    const badPreference = await import("./dist/i18n.js?bad-preference");
    assert.equal(badPreference.getLocale(), "en");
  } finally {
    globalThis.window = original.window;
    globalThis.document = original.document;
    globalThis.Element = original.Element;
  }
});

test("count formatting selects locale plurals and formats the number", async () => {
  const [{ en }, { fr }, { de }, runtime] = await Promise.all([
    import("./dist/locale-en.js"),
    import("./dist/locale-fr.js"),
    import("./dist/locale-de.js"),
    import("./dist/i18n.js?counts"),
  ]);
  const base = Object.keys(en).find((key) => key.endsWith(".other") && Object.hasOwn(en, key.slice(0, -6) + ".one") && placeholders(en[key]).join() === "count")?.slice(0, -6);
  assert.ok(base, "no usable plural message");
  // Node has no DOM; a page-local locale still uses the same Intl rules.
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  const originalElement = globalThis.Element;
  globalThis.Element = class Element {};
  globalThis.window = { localStorage: { setItem() {} }, dispatchEvent() {} };
  globalThis.document = { documentElement: { lang: "en" }, querySelectorAll() { return []; } };
  try {
    for (const language of ["en", "fr", "de"]) {
      runtime.setLocale(language);
      for (const count of [1, 2, 1200]) {
        const category = new Intl.PluralRules(language).select(count);
        const variant = Object.hasOwn(en, `${base}.${category}`) ? category : "other";
        const catalogue = { en, fr, de }[language];
        const formatted = new Intl.NumberFormat(language).format(count);
        const expected = catalogue[`${base}.${variant}`].replace("{count}", formatted);
        assert.equal(runtime.formatCount(base, count), expected, `${language} count ${count}`);
      }
    }
    runtime.setLocale("pseudo");
    assert.ok(runtime.t("templates.variantAlt", { name: "Project ÄΩ" }).includes("Project ÄΩ"),
      "pseudo-locale must not change document or project parameters");
  } finally {
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
    globalThis.Element = originalElement;
  }
});
