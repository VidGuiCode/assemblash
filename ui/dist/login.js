import { f as F, u as $, a as H, j as e, B as Se, c as K, g as Ie, b as Te, e as Ce, A as _e, d as ze, h as V, r as f, s as Be, m as Me, i as Ee, P as Ae, S as W, T, G as Le, k as Ne } from "./chunk-mantine-root.js";
import { u as Re, a as Ve, I as D, b as We, c as De, T as Fe } from "./chunk-Title.js";
import { bindTranslations as $e, t as l } from "./i18n.js";
var q = { root: "m_b183c0a2" };
const G = K((t, { color: s }) => ({ root: { "--code-bg": s ? Ie(s, t) : void 0 } })), v = F((t) => {
  const s = $("Code", null, t), { classNames: p, className: c, style: m, styles: n, unstyled: a, vars: y, color: h, block: d, mod: i, attributes: u, ...o } = s, w = H({
    name: "Code",
    props: s,
    classes: q,
    className: c,
    style: m,
    classNames: p,
    styles: n,
    unstyled: a,
    attributes: u,
    vars: y,
    varsResolver: G
  });
  return /* @__PURE__ */ e.jsx(Se, {
    component: d ? "pre" : "code",
    mod: [{ block: d }, i],
    ...w("root"),
    ...o,
    dir: "ltr"
  });
});
v.classes = q;
v.varsResolver = G;
v.displayName = "@mantine/core/Code";
function He({ reveal: t }) {
  return /* @__PURE__ */ e.jsx("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 256 256",
    style: {
      width: "var(--psi-icon-size)",
      height: "var(--psi-icon-size)"
    },
    children: t ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
      /* @__PURE__ */ e.jsx("path", {
        fill: "none",
        d: "M0 0h256v256H0z"
      }),
      /* @__PURE__ */ e.jsx("path", {
        fill: "none",
        stroke: "currentColor",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: "16",
        d: "M48 40l160 176M154.91 157.6a40 40 0 01-53.82-59.2M135.53 88.71a40 40 0 0132.3 35.53"
      }),
      /* @__PURE__ */ e.jsx("path", {
        fill: "none",
        stroke: "currentColor",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: "16",
        d: "M208.61 169.1C230.41 149.58 240 128 240 128s-32-72-112-72a126 126 0 00-20.68 1.68M74 68.6C33.23 89.24 16 128 16 128s32 72 112 72a118.05 118.05 0 0054-12.6"
      })
    ] }) : /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
      /* @__PURE__ */ e.jsx("path", {
        fill: "none",
        d: "M0 0h256v256H0z"
      }),
      /* @__PURE__ */ e.jsx("path", {
        fill: "none",
        stroke: "currentColor",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: "16",
        d: "M128 56c-80 0-112 72-112 72s32 72 112 72 112-72 112-72-32-72-112-72z"
      }),
      /* @__PURE__ */ e.jsx("circle", {
        cx: "128",
        cy: "128",
        r: "40",
        fill: "none",
        stroke: "currentColor",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: "16"
      })
    ] })
  });
}
var C = {
  root: "m_f61ca620",
  input: "m_ccf8da4c",
  innerInput: "m_f2d85dd2",
  visibilityToggle: "m_b1072d44"
};
const Ke = {
  visibilityToggleIcon: He,
  visibilityToggleFocusable: !1,
  size: "sm"
}, O = K((t, { size: s }) => ({ root: {
  "--psi-icon-size": V(s, "psi-icon-size"),
  "--psi-button-size": V(s, "psi-button-size")
} }));
function qe(t) {
  const s = f.use(We);
  return /* @__PURE__ */ e.jsx("input", {
    ...t,
    "aria-describedby": s?.describedBy
  });
}
const j = F((t) => {
  const s = $([
    "Input",
    "InputWrapper",
    "PasswordInput"
  ], Ke, t), { classNames: p, className: c, style: m, styles: n, unstyled: a, vars: y, required: h, error: d, success: i, leftSection: u, disabled: o, id: w, variant: _, inputContainer: Q, description: X, label: Y, size: z, errorProps: B, successProps: M, descriptionProps: E, labelProps: Z, withAsterisk: ee, inputWrapperOrder: se, wrapperProps: te, radius: A, rightSection: oe, rightSectionWidth: ie, rightSectionPointerEvents: re, leftSectionWidth: ne, visible: ae, defaultVisible: le, onVisibilityChange: ce, visibilityToggleIcon: de, visibilityToggleButtonProps: x, visibilityToggleFocusable: ue, rightSectionProps: pe, leftSectionProps: me, leftSectionPointerEvents: he, withErrorStyles: ge, withSuccessStyles: fe, mod: ve, attributes: P, dir: L, ...ye } = s, g = Re(w), [b, xe] = Ve({
    value: ae,
    defaultValue: le,
    finalValue: !1,
    onChange: ce
  }), k = () => xe(!b), S = H({
    name: "PasswordInput",
    classes: C,
    props: s,
    className: c,
    style: m,
    classNames: p,
    styles: n,
    unstyled: a,
    attributes: P,
    vars: y,
    varsResolver: O
  }), { resolvedClassNames: I, resolvedStyles: N } = Te({
    classNames: p,
    styles: n,
    props: s
  }), { styleProps: be, rest: R } = Ce(ye), je = B?.id || `${g}-error`, we = M?.id || `${g}-success`, Pe = E?.id || `${g}-description`, ke = /* @__PURE__ */ e.jsx(_e, {
    ...S("visibilityToggle"),
    disabled: o,
    radius: A,
    "aria-pressed": b,
    tabIndex: ue ? 0 : -1,
    "aria-label": "Toggle password visibility",
    ...x,
    variant: x?.variant ?? "subtle",
    color: "gray",
    unstyled: a,
    onTouchEnd: (r) => {
      r.preventDefault(), x?.onTouchEnd?.(r), k();
    },
    onMouseDown: (r) => {
      r.preventDefault(), x?.onMouseDown?.(r), k();
    },
    onKeyDown: (r) => {
      x?.onKeyDown?.(r), (r.key === " " || r.key === "Enter") && (r.preventDefault(), k());
    },
    children: /* @__PURE__ */ e.jsx(de, { reveal: b })
  });
  return /* @__PURE__ */ e.jsx(D.Wrapper, {
    required: h,
    id: g,
    label: Y,
    error: d,
    success: i,
    description: X,
    size: z,
    classNames: I,
    styles: N,
    __staticSelector: "PasswordInput",
    __stylesApiProps: s,
    unstyled: a,
    withAsterisk: ee,
    inputWrapperOrder: se,
    inputContainer: Q,
    variant: _,
    labelProps: {
      ...Z,
      htmlFor: g
    },
    descriptionProps: {
      ...E,
      id: Pe
    },
    errorProps: {
      ...B,
      id: je
    },
    successProps: {
      ...M,
      id: we
    },
    mod: ve,
    attributes: P,
    ...S("root"),
    ...be,
    ...te,
    children: /* @__PURE__ */ e.jsx(D, {
      component: "div",
      dir: L,
      error: d,
      success: i,
      leftSection: u,
      size: z,
      classNames: {
        ...I,
        input: ze(C.input, I?.input)
      },
      styles: N,
      radius: A,
      disabled: o,
      __staticSelector: "PasswordInput",
      __stylesApiProps: s,
      rightSectionWidth: ie,
      rightSection: oe ?? ke,
      variant: _,
      unstyled: a,
      leftSectionWidth: ne,
      rightSectionPointerEvents: re || "all",
      rightSectionProps: pe,
      leftSectionProps: me,
      leftSectionPointerEvents: he,
      withAria: !1,
      withErrorStyles: ge,
      withSuccessStyles: fe,
      attributes: P,
      children: /* @__PURE__ */ e.jsx(qe, {
        required: h,
        "data-invalid": !!d || void 0,
        "data-with-left-section": !!u || void 0,
        ...S("innerInput"),
        disabled: o,
        id: g,
        dir: L,
        ...R,
        autoComplete: R.autoComplete || "off",
        type: b ? "text" : "password"
      })
    })
  });
});
j.classes = {
  ...De.classes,
  ...C
};
j.varsResolver = O;
j.displayName = "@mantine/core/PasswordInput";
function Ge() {
  const [t, s] = f.useState(""), [p, c] = f.useState(""), [m, n] = f.useState("info"), a = Ee(), [y, h] = f.useState(!1);
  f.useEffect(() => {
    $e();
  }, [a]);
  async function d(i) {
    i.preventDefault();
    const u = t.trim();
    if (u) {
      h(!0), n("info"), c(l("login.checking"));
      try {
        const o = await fetch("/api/browser-session", {
          method: "POST",
          headers: { authorization: `Bearer ${u}` }
        });
        o.ok ? window.location.replace("/") : o.status === 401 ? (n("error"), c(l("login.rejected"))) : (n("error"), c(l("login.serverStatus", { status: o.status })));
      } catch (o) {
        n("error"), c(String(o));
      } finally {
        h(!1);
      }
    }
  }
  return /* @__PURE__ */ e.jsx("main", { className: "login-panel", "data-login-version": a, children: /* @__PURE__ */ e.jsx(Ae, { withBorder: !0, shadow: "sm", radius: "md", p: "xl", maw: 500, mx: "auto", children: /* @__PURE__ */ e.jsxs(W, { gap: "lg", children: [
    /* @__PURE__ */ e.jsxs("div", { children: [
      /* @__PURE__ */ e.jsx(Fe, { order: 1, children: "Assemblash" }),
      /* @__PURE__ */ e.jsxs(T, { mt: "sm", children: [
        l("login.introBeforeCommand"),
        " ",
        /* @__PURE__ */ e.jsx(v, { children: "assemblash token show" }),
        " ",
        l("login.introBetweenCommands"),
        " ",
        /* @__PURE__ */ e.jsx(v, { children: "config.toml" }),
        "."
      ] })
    ] }),
    /* @__PURE__ */ e.jsx("form", { id: "login-form", onSubmit: (i) => {
      d(i);
    }, children: /* @__PURE__ */ e.jsxs(W, { gap: "md", children: [
      /* @__PURE__ */ e.jsx(j, { id: "token", label: l("login.accessToken"), value: t, onChange: (i) => s(i.currentTarget.value), autoComplete: "off", spellCheck: !1, required: !0 }),
      /* @__PURE__ */ e.jsx(Le, { justify: "flex-end", children: /* @__PURE__ */ e.jsx(Ne, { type: "submit", loading: y, children: l("login.continue") }) })
    ] }) }),
    /* @__PURE__ */ e.jsx(T, { id: "login-status", "data-kind": m, role: m === "error" ? "alert" : "status", "aria-live": "polite", children: p }),
    /* @__PURE__ */ e.jsxs(T, { size: "sm", c: "dimmed", children: [
      l("login.hintBeforeAuthorization"),
      " ",
      /* @__PURE__ */ e.jsx(v, { children: "Authorization" }),
      " ",
      l("login.hintAfterAuthorization")
    ] })
  ] }) }) });
}
const U = document.getElementById("mantine-root"), J = document.getElementById("login-root");
if (!(U instanceof HTMLElement) || !(J instanceof HTMLElement)) throw new Error("Missing login root");
Be(U);
Me("login", J, /* @__PURE__ */ e.jsx(Ge, {}));
