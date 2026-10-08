import { r as S, t as qe, j as u, l as _e, u as P, a as B, U as ke, c as W, o as $, n as xe, h as be, f as L, b as Fe, B as j, Y as C, e as Pe, L as Ue } from "./chunk-mantine-root.js";
function He(t = "mantine-") {
  return `${t}${Math.random().toString(36).slice(2, 11)}`;
}
function Me(t) {
  const e = S.useId(), [s, r] = S.useState(`mantine-${e.replace(/:/g, "")}`), n = S.useRef(!1);
  return qe(() => {
    n.current || (n.current = !0, r(He()));
  }, []), typeof t == "string" ? t : s;
}
function ot({ value: t, defaultValue: e, finalValue: s, onChange: r = () => {
} }) {
  const [n, o] = S.useState(e !== void 0 ? e : s), l = (a, ...d) => {
    o(a), r?.(a, ...d);
  };
  return t !== void 0 ? [
    t,
    r,
    !0
  ] : [
    n,
    l,
    !1
  ];
}
function ze({ size: t = "var(--cb-icon-size, 70%)", style: e, ...s }) {
  return /* @__PURE__ */ u.jsx("svg", {
    viewBox: "0 0 15 15",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    style: {
      ...e,
      width: t,
      height: t
    },
    ...s,
    children: /* @__PURE__ */ u.jsx("path", {
      d: "M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z",
      fill: "currentColor",
      fillRule: "evenodd",
      clipRule: "evenodd"
    })
  });
}
ze.displayName = "@mantine/core/CloseIcon";
var $e = {
  root: "m_86a44da5",
  "root--subtle": "m_220c80f2"
};
const Oe = { variant: "subtle" }, Ne = W((t, { size: e, radius: s, iconSize: r }) => ({ root: {
  "--cb-size": be(e, "cb-size"),
  "--cb-radius": s === void 0 ? void 0 : xe(s),
  "--cb-icon-size": $(r)
} })), de = _e((t) => {
  const e = P("CloseButton", Oe, t), { iconSize: s, children: r, vars: n, radius: o, className: l, classNames: a, style: d, styles: p, unstyled: c, "data-disabled": h, disabled: i, variant: m, icon: v, mod: b, attributes: f, __staticSelector: N, ...I } = e, y = B({
    name: N || "CloseButton",
    props: e,
    className: l,
    style: d,
    classes: $e,
    classNames: a,
    styles: p,
    unstyled: c,
    attributes: f,
    vars: n,
    varsResolver: Ne
  });
  return /* @__PURE__ */ u.jsxs(ke, {
    ...I,
    unstyled: c,
    variant: m,
    disabled: i,
    mod: [{ disabled: i || h }, b],
    ...y("root", {
      variant: m,
      active: !i && !h
    }),
    children: [v || /* @__PURE__ */ u.jsx(ze, {}), r]
  });
});
de.classes = $e;
de.varsResolver = Ne;
de.displayName = "@mantine/core/CloseButton";
const we = S.createContext({ size: "sm" }), Re = L((t) => {
  const e = P("InputClearButton", null, t), { size: s, variant: r, vars: n, classNames: o, styles: l, ...a } = e, d = S.use(we), { resolvedClassNames: p, resolvedStyles: c } = Fe({
    classNames: o,
    styles: l,
    props: e
  });
  return /* @__PURE__ */ u.jsx(de, {
    variant: r || "transparent",
    size: s || d?.size || "sm",
    classNames: p,
    styles: c,
    __staticSelector: "InputClearButton",
    style: {
      pointerEvents: "all",
      background: "var(--input-bg)",
      ...a.style
    },
    ...a
  });
});
Re.displayName = "@mantine/core/InputClearButton";
const Ve = {
  xs: 7,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 15
};
function Ye({ __clearable: t, __clearSection: e, rightSection: s, __defaultRightSection: r, size: n = "sm", __clearSectionMode: o = "both" }) {
  const l = t && e;
  return o === "rightSection" ? s === null ? null : s || r : o === "clear" ? s === null ? null : l || r : l && (s || r) ? /* @__PURE__ */ u.jsxs("div", {
    "data-combined-clear-section": !0,
    style: {
      display: "flex",
      gap: 2,
      alignItems: "center",
      paddingInlineEnd: Ve[n]
    },
    children: [l, s || r]
  }) : s === null ? null : s || l || r;
}
const O = S.createContext({
  offsetBottom: !1,
  offsetTop: !1,
  describedBy: void 0,
  getStyles: null,
  inputId: void 0,
  labelId: void 0
});
var g = {
  wrapper: "m_6c018570",
  input: "m_8fb7ebe7",
  bottomSection: "m_93f4ed57",
  section: "m_82577fc2",
  placeholder: "m_88bacfd0",
  root: "m_46b77525",
  label: "m_8fdc1311",
  required: "m_78a94662",
  error: "m_8f816625",
  success: "m_9d9d40e0",
  description: "m_fe47ce59"
};
const Ce = W((t, { size: e }) => ({ description: { "--input-description-size": e === void 0 ? void 0 : `calc(${C(e)} - ${$(2)})` } })), X = L((t) => {
  const e = P("InputDescription", null, t), { classNames: s, className: r, style: n, styles: o, unstyled: l, vars: a, __staticSelector: d, __inheritStyles: p = !0, attributes: c, ...h } = P("InputDescription", null, e), i = S.use(O), m = B({
    name: ["InputWrapper", d],
    props: e,
    classes: g,
    className: r,
    style: n,
    classNames: s,
    styles: o,
    unstyled: l,
    attributes: c,
    rootSelector: "description",
    vars: a,
    varsResolver: Ce
  }), v = p && i?.getStyles || m;
  return /* @__PURE__ */ u.jsx(j, {
    component: "p",
    ...v("description", i?.getStyles ? {
      className: r,
      style: n
    } : void 0),
    ...h
  });
});
X.classes = g;
X.varsResolver = Ce;
X.displayName = "@mantine/core/InputDescription";
const je = W((t, { size: e }) => ({ error: { "--input-error-size": e === void 0 ? void 0 : `calc(${C(e)} - ${$(2)})` } })), ee = L((t) => {
  const e = P("InputError", null, t), { classNames: s, className: r, style: n, styles: o, unstyled: l, vars: a, attributes: d, __staticSelector: p, __inheritStyles: c = !0, ...h } = e, i = B({
    name: ["InputWrapper", p],
    props: e,
    classes: g,
    className: r,
    style: n,
    classNames: s,
    styles: o,
    unstyled: l,
    attributes: d,
    rootSelector: "error",
    vars: a,
    varsResolver: je
  }), m = S.use(O), v = c && m?.getStyles || i;
  return /* @__PURE__ */ u.jsx(j, {
    component: "p",
    ...v("error", m?.getStyles ? {
      className: r,
      style: n
    } : void 0),
    ...h
  });
});
ee.classes = g;
ee.varsResolver = je;
ee.displayName = "@mantine/core/InputError";
const Ze = { labelElement: "label" }, Be = W((t, { size: e }) => ({ label: {
  "--input-label-size": C(e),
  "--input-asterisk-color": void 0
} })), te = L((t) => {
  const e = P("InputLabel", Ze, t), { classNames: s, className: r, style: n, styles: o, unstyled: l, vars: a, labelElement: d, required: p, htmlFor: c, onMouseDown: h, children: i, __staticSelector: m, mod: v, attributes: b, ...f } = e, N = B({
    name: ["InputWrapper", m],
    props: e,
    classes: g,
    className: r,
    style: n,
    classNames: s,
    styles: o,
    unstyled: l,
    attributes: b,
    rootSelector: "label",
    vars: a,
    varsResolver: Be
  }), I = S.use(O), y = I?.getStyles || N, z = f.component || d, E = typeof z != "string" || z === "label";
  return /* @__PURE__ */ u.jsxs(j, {
    ...y("label", I?.getStyles ? {
      className: r,
      style: n
    } : void 0),
    component: d,
    htmlFor: E ? c : void 0,
    mod: [{ required: p }, v],
    onMouseDown: (w) => {
      h?.(w), !w.defaultPrevented && w.detail > 1 && w.preventDefault();
    },
    ...f,
    children: [i, p && /* @__PURE__ */ u.jsx("span", {
      ...y("required"),
      "aria-hidden": !0,
      children: " *"
    })]
  });
});
te.classes = g;
te.varsResolver = Be;
te.displayName = "@mantine/core/InputLabel";
const ge = L((t) => {
  const e = P("InputPlaceholder", null, t), { classNames: s, className: r, style: n, styles: o, unstyled: l, vars: a, __staticSelector: d, error: p, mod: c, attributes: h, ...i } = e, m = B({
    name: ["InputPlaceholder", d],
    props: e,
    classes: g,
    className: r,
    style: n,
    classNames: s,
    styles: o,
    unstyled: l,
    attributes: h,
    rootSelector: "placeholder"
  });
  return /* @__PURE__ */ u.jsx(j, {
    ...m("placeholder"),
    mod: [{ error: !!p }, c],
    component: "span",
    ...i
  });
});
ge.classes = g;
ge.displayName = "@mantine/core/InputPlaceholder";
const Ee = W((t, { size: e }) => ({ success: { "--input-success-size": e === void 0 ? void 0 : `calc(${C(e)} - ${$(2)})` } })), se = L((t) => {
  const e = P("InputSuccess", null, t), { classNames: s, className: r, style: n, styles: o, unstyled: l, vars: a, attributes: d, __staticSelector: p, __inheritStyles: c = !0, ...h } = e, i = B({
    name: ["InputWrapper", p],
    props: e,
    classes: g,
    className: r,
    style: n,
    classNames: s,
    styles: o,
    unstyled: l,
    attributes: d,
    rootSelector: "success",
    vars: a,
    varsResolver: Ee
  }), m = S.use(O), v = c && m?.getStyles || i;
  return /* @__PURE__ */ u.jsx(j, {
    component: "p",
    ...v("success", m?.getStyles ? {
      className: r,
      style: n
    } : void 0),
    ...h
  });
});
se.classes = g;
se.varsResolver = Ee;
se.displayName = "@mantine/core/InputSuccess";
function Ge(t, { hasDescription: e, hasError: s }) {
  const r = t.findIndex((a) => a === "input"), n = t.slice(0, r), o = t.slice(r + 1), l = e && n.includes("description") || s && n.includes("error");
  return {
    offsetBottom: e && o.includes("description") || s && o.includes("error"),
    offsetTop: l
  };
}
const Je = {
  labelElement: "label",
  inputContainer: (t) => t,
  inputWrapperOrder: [
    "label",
    "description",
    "input",
    "error"
  ]
}, We = W((t, { size: e }) => ({
  label: {
    "--input-label-size": C(e),
    "--input-asterisk-color": void 0
  },
  error: { "--input-error-size": e === void 0 ? void 0 : `calc(${C(e)} - ${$(2)})` },
  success: { "--input-success-size": e === void 0 ? void 0 : `calc(${C(e)} - ${$(2)})` },
  description: { "--input-description-size": e === void 0 ? void 0 : `calc(${C(e)} - ${$(2)})` }
})), pe = L((t) => {
  const e = P("InputWrapper", Je, t), { classNames: s, className: r, style: n, styles: o, unstyled: l, vars: a, size: d, variant: p, __staticSelector: c, inputContainer: h, inputWrapperOrder: i, label: m, error: v, success: b, description: f, labelProps: N, descriptionProps: I, errorProps: y, successProps: z, labelElement: E, children: w, withAsterisk: A, id: F, required: V, __stylesApiProps: U, mod: me, attributes: Y, ...H } = e, T = B({
    name: ["InputWrapper", c],
    props: U || e,
    classes: g,
    className: r,
    style: n,
    classNames: s,
    styles: o,
    unstyled: l,
    attributes: Y,
    vars: a,
    varsResolver: We
  }), x = {
    size: d,
    variant: p,
    __staticSelector: c
  }, R = Me(F), Z = typeof A == "boolean" ? A : V, re = y?.id || `${R}-error`, ne = z?.id || `${R}-success`, oe = I?.id || `${R}-description`, ie = R, G = !!v && typeof v != "boolean", D = !!b && typeof b != "boolean" && !v, q = !!f, J = G && i.includes("error"), K = D && i.includes("error"), ve = q && i.includes("description"), le = `${J ? re : ""} ${K ? ne : ""} ${ve ? oe : ""}`, he = le.trim().length > 0 ? le.trim() : void 0, ae = N?.id || `${R}-label`, ce = m && /* @__PURE__ */ u.jsx(te, {
    labelElement: E,
    id: ae,
    htmlFor: ie,
    required: Z,
    ...x,
    ...N,
    children: m
  }, "label"), M = q && /* @__PURE__ */ u.jsx(X, {
    ...I,
    ...x,
    size: I?.size || x.size,
    id: I?.id || oe,
    children: f
  }, "description"), fe = /* @__PURE__ */ u.jsx(S.Fragment, { children: h(w) }, "input"), k = G && /* @__PURE__ */ S.createElement(ee, {
    ...y,
    ...x,
    size: y?.size || x.size,
    key: "error",
    id: y?.id || re
  }, v), ye = D && /* @__PURE__ */ S.createElement(se, {
    ...z,
    ...x,
    size: z?.size || x.size,
    key: "success",
    id: z?.id || ne
  }, b), ue = i.map((Q) => {
    switch (Q) {
      case "label":
        return ce;
      case "input":
        return fe;
      case "description":
        return M;
      case "error":
        return k || ye;
      default:
        return null;
    }
  });
  return /* @__PURE__ */ u.jsx(O, {
    value: {
      getStyles: T,
      describedBy: he,
      inputId: ie,
      labelId: ce && i.includes("label") ? ae : void 0,
      ...Ge(i, {
        hasDescription: q,
        hasError: G || D
      })
    },
    children: /* @__PURE__ */ u.jsx(j, {
      variant: p,
      size: d,
      mod: [{
        error: !!v,
        success: !!b && !v
      }, me],
      id: E === "label" ? void 0 : F,
      ...T("root"),
      ...H,
      children: ue
    })
  });
});
pe.classes = g;
pe.varsResolver = We;
pe.displayName = "@mantine/core/InputWrapper";
const Ke = {
  variant: "default",
  leftSectionPointerEvents: "none",
  rightSectionPointerEvents: "none",
  withAria: !0,
  withErrorStyles: !0,
  withSuccessStyles: !0,
  size: "sm",
  loading: !1,
  loadingPosition: "right"
}, Le = W((t, e, s) => ({ wrapper: {
  "--input-margin-top": s.offsetTop ? "calc(var(--mantine-spacing-xs) / 2)" : void 0,
  "--input-margin-bottom": s.offsetBottom ? "calc(var(--mantine-spacing-xs) / 2)" : void 0,
  "--input-height": be(e.size, "input-height"),
  "--input-fz": C(e.size),
  "--input-radius": e.radius === void 0 ? void 0 : xe(e.radius),
  "--input-left-section-width": e.leftSectionWidth !== void 0 ? $(e.leftSectionWidth) : void 0,
  "--input-right-section-width": e.rightSectionWidth !== void 0 ? $(e.rightSectionWidth) : void 0,
  "--input-padding-y": e.multiline ? be(e.size, "input-padding-y") : void 0,
  "--input-left-section-pointer-events": e.leftSectionPointerEvents,
  "--input-right-section-pointer-events": e.rightSectionPointerEvents
} })), _ = _e((t) => {
  const e = P("Input", Ke, t), { classNames: s, className: r, style: n, styles: o, unstyled: l, required: a, __staticSelector: d, __stylesApiProps: p, size: c, wrapperProps: h, error: i, success: m, disabled: v, leftSection: b, leftSectionProps: f, leftSectionWidth: N, rightSection: I, rightSectionProps: y, rightSectionWidth: z, rightSectionPointerEvents: E, leftSectionPointerEvents: w, variant: A, vars: F, pointer: V, multiline: U, radius: me, id: Y, withAria: H, withErrorStyles: T, withSuccessStyles: x, mod: R, inputSize: Z, attributes: re, __clearSection: ne, __clearable: oe, __clearSectionMode: ie, __defaultRightSection: G, loading: D, loadingPosition: q, __bottomSection: J, __bottomSectionProps: K, rootRef: ve, dir: le, ...he } = e, { styleProps: ae, rest: ce } = Pe(he), M = S.use(O), fe = {
    offsetBottom: M?.offsetBottom,
    offsetTop: M?.offsetTop
  }, k = B({
    name: ["Input", d],
    props: p || e,
    classes: g,
    className: r,
    style: n,
    classNames: s,
    styles: o,
    unstyled: l,
    attributes: re,
    stylesCtx: fe,
    rootSelector: "wrapper",
    vars: F,
    varsResolver: Le
  }), ye = H ? {
    required: a,
    disabled: v,
    "aria-invalid": i ? !0 : void 0,
    "aria-describedby": M?.describedBy,
    id: M?.inputId || Y
  } : {}, ue = D ? /* @__PURE__ */ u.jsx(Ue, { size: q === "left" ? "calc(var(--input-left-section-size) / 2)" : "calc(var(--input-right-section-size) / 2)" }) : null, Q = D && q === "left" ? ue : b, Se = Ye({
    __clearable: oe,
    __clearSection: ne,
    rightSection: D && q === "right" ? ue : I,
    __defaultRightSection: G,
    size: c,
    __clearSectionMode: ie
  });
  return /* @__PURE__ */ u.jsx(we, {
    value: { size: c || "sm" },
    children: /* @__PURE__ */ u.jsxs(j, {
      ref: ve,
      dir: le,
      ...k("wrapper"),
      ...ae,
      ...h,
      mod: [{
        error: !!i && T,
        success: !!m && !i && x,
        pointer: V,
        disabled: v,
        multiline: U,
        withRightSection: !!Se,
        withLeftSection: !!Q,
        withBottomSection: !!J
      }, R],
      variant: A,
      size: c,
      children: [
        Q && /* @__PURE__ */ u.jsx("div", {
          ...f,
          "data-position": "left",
          ...k("section", {
            className: f?.className,
            style: f?.style
          }),
          children: Q
        }),
        /* @__PURE__ */ u.jsx(j, {
          component: "input",
          ...ce,
          ...ye,
          required: a,
          mod: {
            disabled: v,
            error: !!i && T,
            success: !!m && !i && x
          },
          variant: A,
          __size: Z,
          ...k("input")
        }),
        J && /* @__PURE__ */ u.jsx("div", {
          ...K,
          ...k("bottomSection", {
            className: K?.className,
            style: K?.style
          }),
          children: J
        }),
        Se && /* @__PURE__ */ u.jsx("div", {
          ...y,
          "data-position": "right",
          ...k("section", {
            className: y?.className,
            style: y?.style
          }),
          children: Se
        })
      ]
    })
  });
});
_.classes = g;
_.varsResolver = Le;
_.Wrapper = pe;
_.Label = te;
_.Error = ee;
_.Success = se;
_.Description = X;
_.Placeholder = ge;
_.ClearButton = Re;
_.displayName = "@mantine/core/Input";
function Qe(t, e, s) {
  const r = P([
    "Input",
    "InputWrapper",
    t
  ], e, s), { label: n, description: o, error: l, success: a, required: d, classNames: p, styles: c, className: h, unstyled: i, __staticSelector: m, __stylesApiProps: v, errorProps: b, successProps: f, labelProps: N, descriptionProps: I, wrapperProps: y, id: z, size: E, style: w, inputContainer: A, inputWrapperOrder: F, withAsterisk: V, variant: U, vars: me, mod: Y, attributes: H, ...T } = r, { styleProps: x, rest: R } = Pe(T), Z = {
    label: n,
    description: o,
    error: l,
    success: a,
    required: d,
    classNames: p,
    className: h,
    __staticSelector: m,
    __stylesApiProps: v || r,
    errorProps: b,
    successProps: f,
    labelProps: N,
    descriptionProps: I,
    unstyled: i,
    styles: c,
    size: E,
    style: w,
    inputContainer: A,
    inputWrapperOrder: F,
    withAsterisk: V,
    variant: U,
    id: z,
    mod: Y,
    attributes: H,
    ...y
  };
  return {
    ...R,
    classNames: p,
    styles: c,
    unstyled: i,
    wrapperProps: {
      ...Z,
      ...x
    },
    inputProps: {
      required: d,
      classNames: p,
      styles: c,
      unstyled: i,
      size: E,
      __staticSelector: m,
      __stylesApiProps: v || r,
      error: l,
      success: a,
      variant: U,
      id: z,
      attributes: H
    }
  };
}
const Xe = {
  __staticSelector: "InputBase",
  withAria: !0,
  size: "sm"
}, Ae = _e((t) => {
  const { inputProps: e, wrapperProps: s, ...r } = Qe("InputBase", Xe, t);
  return /* @__PURE__ */ u.jsx(_.Wrapper, {
    ...s,
    children: /* @__PURE__ */ u.jsx(_, {
      ...e,
      ...r
    })
  });
});
Ae.classes = {
  ..._.classes,
  ..._.Wrapper.classes
};
Ae.displayName = "@mantine/core/InputBase";
const et = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6"
], tt = [
  "xs",
  "sm",
  "md",
  "lg",
  "xl"
];
function st(t, e) {
  const s = e !== void 0 ? e : `h${t}`;
  return et.includes(s) ? {
    fontSize: `var(--mantine-${s}-font-size)`,
    fontWeight: `var(--mantine-${s}-font-weight)`,
    lineHeight: `var(--mantine-${s}-line-height)`
  } : tt.includes(s) ? {
    fontSize: `var(--mantine-font-size-${s})`,
    fontWeight: `var(--mantine-h${t}-font-weight)`,
    lineHeight: `var(--mantine-h${t}-line-height)`
  } : {
    fontSize: $(s),
    fontWeight: `var(--mantine-h${t}-font-weight)`,
    lineHeight: `var(--mantine-h${t}-line-height)`
  };
}
var Te = { root: "m_8a5d1357" };
const rt = { order: 1 }, De = W((t, { order: e, size: s, lineClamp: r, textWrap: n }) => {
  const o = st(e || 1, s);
  return { root: {
    "--title-fw": o.fontWeight,
    "--title-lh": o.lineHeight,
    "--title-fz": o.fontSize,
    "--title-line-clamp": typeof r == "number" ? r.toString() : void 0,
    "--title-text-wrap": n
  } };
}), Ie = L((t) => {
  const e = P("Title", rt, t), { classNames: s, className: r, style: n, styles: o, unstyled: l, order: a, vars: d, size: p, variant: c, lineClamp: h, textWrap: i, mod: m, attributes: v, ...b } = e, f = B({
    name: "Title",
    props: e,
    classes: Te,
    className: r,
    style: n,
    classNames: s,
    styles: o,
    unstyled: l,
    attributes: v,
    vars: d,
    varsResolver: De
  });
  return [
    1,
    2,
    3,
    4,
    5,
    6
  ].includes(a) ? /* @__PURE__ */ u.jsx(j, {
    ...f("root"),
    component: `h${a}`,
    variant: c,
    mod: [{
      order: a,
      lineClamp: typeof h == "number"
    }, m],
    size: p,
    ...b
  }) : null;
});
Ie.classes = Te;
Ie.varsResolver = De;
Ie.displayName = "@mantine/core/Title";
export {
  de as C,
  _ as I,
  Ie as T,
  ot as a,
  O as b,
  Ae as c,
  Qe as d,
  He as r,
  Me as u
};
