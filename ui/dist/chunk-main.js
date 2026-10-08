import { r as c, p as Ye, l as Te, u as G, a as ce, j as n, B as te, c as Be, n as vt, o as Ht, q as Ln, f as De, t as _n, v as Mn, w as $n, T as O, d as Hn, P as Gt, x as X, y as Ut, z as Gn, L as Un, C as Vt, I as Wt, D as Ke, E as Vn, b as Wn, m as ee, A as Y, k as w, i as Ne, U as qn, S as Kn, G as qt, s as Yn } from "./chunk-mantine-root.js";
import { t as f, formatCount as Kt } from "./i18n.js";
function Zn(e) {
  return Array.isArray(e) || e === null ? !1 : typeof e == "object" ? e.type !== c.Fragment : !1;
}
function Yt(e) {
  const t = c.createContext(null);
  return [t, () => {
    const r = c.use(t);
    if (r === null) throw new Error(e);
    return r;
  }];
}
const Jn = {
  app: 100,
  modal: 200,
  popover: 300,
  overlay: 400,
  max: 9999
};
function jt(e) {
  return Jn[e];
}
function Qn(e, t) {
  return e in t ? Ye(t[e]) : Ye(e);
}
function Xn(e, t) {
  const s = e.map((r) => ({
    value: r,
    px: Qn(r, t)
  }));
  return s.sort((r, a) => r.px - a.px), s;
}
function we(e) {
  return typeof e == "object" && e !== null ? "base" in e ? e.base : void 0 : e;
}
function At(e) {
  return typeof e != "string" ? "" : e.charAt(0).toUpperCase() + e.slice(1);
}
function Ze(e, t) {
  if (typeof e == "function") return e(t);
  typeof e == "object" && e !== null && "current" in e && (e.current = t);
}
function es(...e) {
  const t = /* @__PURE__ */ new Map();
  return (s) => {
    if (e.forEach((r) => {
      const a = Ze(r, s);
      a && t.set(r, a);
    }), t.size > 0) return () => {
      e.forEach((r) => {
        const a = t.get(r);
        a && typeof a == "function" ? a() : Ze(r, null);
      }), t.clear();
    };
  };
}
function Fr(...e) {
  return c.useCallback(es(...e), e);
}
function ts(e = !1, t = {}) {
  const [s, r] = c.useState(e), a = c.useCallback(() => {
    r((l) => l || (t.onOpen?.(), !0));
  }, [t.onOpen]), i = c.useCallback(() => {
    r((l) => l && (t.onClose?.(), !1));
  }, [t.onClose]);
  return [s, {
    open: a,
    close: i,
    toggle: c.useCallback(() => {
      s ? i() : a();
    }, [
      i,
      a,
      s
    ]),
    set: r
  }];
}
var Zt = { root: "m_9814e45f" };
const ns = { zIndex: jt("modal") }, Jt = Be((e, { gradient: t, color: s, backgroundOpacity: r, blur: a, radius: i, zIndex: l }) => ({ root: {
  "--overlay-bg": t || (s !== void 0 || r !== void 0) && Ln(s || "#000", r ?? 0.6) || void 0,
  "--overlay-filter": a ? `blur(${Ht(a)})` : void 0,
  "--overlay-radius": i === void 0 ? void 0 : vt(i),
  "--overlay-z-index": l?.toString()
} })), Re = Te((e) => {
  const t = G("Overlay", ns, e), { classNames: s, className: r, style: a, styles: i, unstyled: l, vars: d, fixed: h, center: y, children: b, radius: j, zIndex: u, gradient: p, blur: N, color: C, backgroundOpacity: x, mod: v, attributes: D, ...I } = t, k = ce({
    name: "Overlay",
    props: t,
    classes: Zt,
    className: r,
    style: a,
    classNames: s,
    styles: i,
    unstyled: l,
    attributes: D,
    vars: d,
    varsResolver: Jt
  });
  return /* @__PURE__ */ n.jsx(te, {
    ...k("root"),
    mod: [{
      center: y,
      fixed: h
    }, v],
    ...I,
    children: b
  });
});
Re.classes = Zt;
Re.varsResolver = Jt;
Re.displayName = "@mantine/core/Overlay";
function dt(e) {
  const t = document.createElement("div");
  return t.setAttribute("data-portal", "true"), typeof e.className == "string" && t.classList.add(...e.className.split(" ").filter(Boolean)), typeof e.style == "object" && Object.assign(t.style, e.style), typeof e.id == "string" && t.setAttribute("id", e.id), t;
}
let ve = null;
function ss({ target: e, reuseTargetNode: t, ...s }) {
  if (e)
    return typeof e == "string" ? document.querySelector(e) || dt(s) : e;
  if (t) {
    if (ve) {
      if (document.body.contains(ve)) return ve;
      ve = null;
    }
    const r = document.querySelector("[data-mantine-shared-portal-node]");
    if (r)
      return ve = r, r;
    const a = dt(s);
    return a.setAttribute("data-mantine-shared-portal-node", "true"), document.body.appendChild(a), ve = a, a;
  }
  return dt(s);
}
const rs = { reuseTargetNode: !0 }, Qt = De((e) => {
  const { children: t, target: s, reuseTargetNode: r, ref: a, ...i } = G("Portal", rs, e), [l, d] = c.useState(!1), h = c.useRef(null);
  return _n(() => (d(!0), h.current = ss({
    target: s,
    reuseTargetNode: r,
    ...i
  }), Ze(a, h.current), !s && !r && h.current && document.body.appendChild(h.current), () => {
    !s && !r && h.current && document.body.removeChild(h.current);
  }), [s]), !l || !h.current ? null : Mn.createPortal(/* @__PURE__ */ n.jsx(n.Fragment, { children: t }), h.current);
});
Qt.displayName = "@mantine/core/Portal";
const Xt = De(({ withinPortal: e = !0, children: t, ...s }) => $n() === "test" || !e ? /* @__PURE__ */ n.jsx(n.Fragment, { children: t }) : /* @__PURE__ */ n.jsx(Qt, {
  ...s,
  children: t
}));
Xt.displayName = "@mantine/core/OptionalPortal";
var en = { root: "m_849cf0da" };
const as = { underline: "hover" }, Je = Te((e) => {
  const { underline: t, className: s, unstyled: r, mod: a, ...i } = G("Anchor", as, e);
  return /* @__PURE__ */ n.jsx(O, {
    component: "a",
    className: Hn({ [en.root]: !r }, s),
    ...i,
    mod: [{ underline: t }, a],
    __staticSelector: "Anchor",
    unstyled: r
  });
});
Je.classes = en;
Je.displayName = "@mantine/core/Anchor";
const [os, is] = Yt("Card component was not found in tree");
var wt = {
  root: "m_e615b15f",
  section: "m_599a2148"
};
const tt = Te((e) => {
  const { classNames: t, className: s, style: r, styles: a, vars: i, withBorder: l, inheritPadding: d, mod: h, ...y } = G("CardSection", null, e), b = is();
  return /* @__PURE__ */ n.jsx(te, {
    mod: [{
      "with-border": l,
      "inherit-padding": d
    }, h],
    ...b.getStyles("section", {
      className: s,
      style: r,
      styles: a,
      classNames: t
    }),
    ...y
  });
});
tt.classes = wt;
tt.displayName = "@mantine/core/CardSection";
const tn = Be((e, { padding: t }) => ({ root: { "--card-padding": X(t) } })), ls = { orientation: "vertical" }, Le = Te((e) => {
  const t = G("Card", ls, e), { classNames: s, className: r, style: a, styles: i, unstyled: l, vars: d, children: h, padding: y, attributes: b, orientation: j, ...u } = t, p = ce({
    name: "Card",
    props: t,
    classes: wt,
    className: r,
    style: a,
    classNames: s,
    styles: i,
    unstyled: l,
    attributes: b,
    vars: d,
    varsResolver: tn
  }), N = c.Children.toArray(h), C = N.map((x, v) => typeof x == "object" && x && "type" in x && (x.type === tt || x.type?.displayName === "@mantine/core/CardSection") ? c.cloneElement(x, {
    "data-orientation": j,
    "data-first-section": v === 0 || void 0,
    "data-last-section": v === N.length - 1 || void 0
  }) : x);
  return /* @__PURE__ */ n.jsx(os, {
    value: { getStyles: p },
    children: /* @__PURE__ */ n.jsx(Gt, {
      unstyled: l,
      "data-orientation": j,
      ...p("root"),
      ...u,
      children: C
    })
  });
});
Le.classes = wt;
Le.varsResolver = tn;
Le.displayName = "@mantine/core/Card";
Le.Section = tt;
var nn = { root: "m_9e117634" };
const sn = Be((e, { radius: t, fit: s }) => ({ root: {
  "--image-radius": t === void 0 ? void 0 : vt(t),
  "--image-object-fit": s
} })), nt = Te((e) => {
  const t = G("Image", null, e), { classNames: s, className: r, style: a, styles: i, unstyled: l, vars: d, onError: h, src: y, radius: b, fit: j, fallbackSrc: u, mod: p, attributes: N, ...C } = t, [x, v] = c.useState(!y);
  c.useEffect(() => v(!y), [y]);
  const D = ce({
    name: "Image",
    classes: nn,
    props: t,
    className: r,
    style: a,
    classNames: s,
    styles: i,
    unstyled: l,
    attributes: N,
    vars: d,
    varsResolver: sn
  });
  return x && u ? /* @__PURE__ */ n.jsx(te, {
    component: "img",
    src: u,
    ...D("root"),
    onError: h,
    mod: ["fallback", p],
    ...C
  }) : /* @__PURE__ */ n.jsx(te, {
    component: "img",
    ...D("root"),
    src: y,
    onError: (I) => {
      h?.(I), v(!0);
    },
    mod: p,
    ...C
  });
});
nt.classes = nn;
nt.varsResolver = sn;
nt.displayName = "@mantine/core/Image";
var rn = {
  root: "m_6e45937b",
  loader: "m_e8eb006c",
  overlay: "m_df587f17"
};
const It = {
  transitionProps: {
    transition: "fade",
    duration: 0
  },
  overlayProps: { backgroundOpacity: 0.75 },
  zIndex: jt("overlay")
}, an = Be((e, { zIndex: t }) => ({ root: { "--lo-z-index": t?.toString() } })), st = De((e) => {
  const t = G("LoadingOverlay", It, e), { classNames: s, className: r, style: a, styles: i, unstyled: l, vars: d, transitionProps: h, loaderProps: y, overlayProps: b, visible: j, zIndex: u, attributes: p, onEnter: N, onEntered: C, onExit: x, onExited: v, ...D } = t, I = Ut(), k = ce({
    name: "LoadingOverlay",
    classes: rn,
    props: t,
    className: r,
    style: a,
    classNames: s,
    styles: i,
    unstyled: l,
    attributes: p,
    vars: d,
    varsResolver: an
  }), R = {
    ...It.overlayProps,
    ...b
  };
  return /* @__PURE__ */ n.jsx(Gn, {
    transition: "fade",
    ...h,
    mounted: !!j,
    onEnter: N,
    onEntered: C,
    onExit: x,
    onExited: v,
    children: (P) => /* @__PURE__ */ n.jsxs(te, {
      ...k("root", { style: P }),
      ...D,
      children: [
        /* @__PURE__ */ n.jsx(Un, {
          unstyled: l,
          ...y,
          ...k("loader", {
            className: y?.className,
            style: y?.style
          })
        }),
        /* @__PURE__ */ n.jsx(Re, {
          ...R,
          ...k("overlay", {
            className: R?.className,
            style: R?.style
          }),
          darkHidden: !0,
          unstyled: l,
          color: b?.color || I.white
        }),
        /* @__PURE__ */ n.jsx(Re, {
          ...R,
          ...k("overlay", {
            className: R?.className,
            style: R?.style
          }),
          lightHidden: !0,
          unstyled: l,
          color: b?.color || I.colors.dark[5]
        })
      ]
    })
  });
});
st.classes = rn;
st.varsResolver = an;
st.displayName = "@mantine/core/LoadingOverlay";
function on(e) {
  if (e !== void 0)
    return typeof e == "number" ? Ht(e) : e;
}
function cs({ spacing: e, verticalSpacing: t, cols: s, minColWidth: r, autoRows: a, selector: i }) {
  const l = Ut(), d = t === void 0 ? e : t, h = r !== void 0, y = Vt({
    "--sg-spacing-x": X(we(e)),
    "--sg-spacing-y": X(we(d)),
    "--sg-auto-rows": a,
    ...h ? { "--sg-min-col-width": on(r) } : { "--sg-cols": we(s)?.toString() }
  }), b = Ke(l.breakpoints).reduce((u, p) => (u[p] || (u[p] = {}), typeof e == "object" && e[p] !== void 0 && (u[p]["--sg-spacing-x"] = X(e[p])), typeof d == "object" && d[p] !== void 0 && (u[p]["--sg-spacing-y"] = X(d[p])), !h && typeof s == "object" && s[p] !== void 0 && (u[p]["--sg-cols"] = s[p]), u), {}), j = Xn(Ke(b), l.breakpoints).filter((u) => Ke(b[u.value]).length > 0).map((u) => ({
    query: `(min-width: ${l.breakpoints[u.value]})`,
    styles: b[u.value]
  }));
  return /* @__PURE__ */ n.jsx(Wt, {
    styles: y,
    media: j,
    selector: i
  });
}
function ut(e) {
  return typeof e == "object" && e !== null ? Ke(e) : [];
}
function ds(e) {
  return e.sort((t, s) => Ye(t) - Ye(s));
}
function us({ spacing: e, verticalSpacing: t, cols: s, minColWidth: r }) {
  return ds(Array.from(/* @__PURE__ */ new Set([
    ...ut(e),
    ...ut(t),
    ...r !== void 0 ? [] : ut(s)
  ])));
}
function ps({ spacing: e, verticalSpacing: t, cols: s, minColWidth: r, autoRows: a, selector: i }) {
  const l = t === void 0 ? e : t, d = r !== void 0, h = Vt({
    "--sg-spacing-x": X(we(e)),
    "--sg-spacing-y": X(we(l)),
    "--sg-auto-rows": a,
    ...d ? { "--sg-min-col-width": on(r) } : { "--sg-cols": we(s)?.toString() }
  }), y = us({
    spacing: e,
    verticalSpacing: t,
    cols: s,
    minColWidth: r
  }), b = y.reduce((u, p) => (u[p] || (u[p] = {}), typeof e == "object" && e[p] !== void 0 && (u[p]["--sg-spacing-x"] = X(e[p])), typeof l == "object" && l[p] !== void 0 && (u[p]["--sg-spacing-y"] = X(l[p])), !d && typeof s == "object" && s[p] !== void 0 && (u[p]["--sg-cols"] = s[p]), u), {}), j = y.map((u) => ({
    query: `simple-grid (min-width: ${u})`,
    styles: b[u]
  }));
  return /* @__PURE__ */ n.jsx(Wt, {
    styles: h,
    container: j,
    selector: i
  });
}
var ln = {
  container: "m_925c2d2c",
  root: "m_2415a157"
};
const fs = {
  cols: 1,
  spacing: "md",
  type: "media"
}, Et = De((e) => {
  const t = G("SimpleGrid", fs, e), { classNames: s, className: r, style: a, styles: i, unstyled: l, vars: d, cols: h, verticalSpacing: y, spacing: b, type: j, minColWidth: u, autoFlow: p, autoRows: N, attributes: C, ...x } = t, v = ce({
    name: "SimpleGrid",
    classes: ln,
    props: t,
    className: r,
    style: a,
    classNames: s,
    styles: i,
    unstyled: l,
    attributes: C,
    vars: d
  }), D = Vn(), I = u !== void 0 ? p || "auto-fill" : void 0;
  return j === "container" ? /* @__PURE__ */ n.jsxs(n.Fragment, { children: [/* @__PURE__ */ n.jsx(ps, {
    ...t,
    selector: `.${D}`
  }), /* @__PURE__ */ n.jsx("div", {
    ...v("container"),
    children: /* @__PURE__ */ n.jsx(te, {
      ...v("root", { className: D }),
      ...x,
      "data-auto-cols": I
    })
  })] }) : /* @__PURE__ */ n.jsxs(n.Fragment, { children: [/* @__PURE__ */ n.jsx(cs, {
    ...t,
    selector: `.${D}`
  }), /* @__PURE__ */ n.jsx(te, {
    ...v("root", { className: D }),
    ...x,
    "data-auto-cols": I
  })] });
});
Et.classes = ln;
Et.displayName = "@mantine/core/SimpleGrid";
const [ms, hs] = Yt("Dropzone component was not found in tree");
function Dt(e) {
  const t = (s) => {
    const { children: r, ...a } = G(`Dropzone${At(e)}`, {}, s), i = hs(), l = Zn(r) ? r : /* @__PURE__ */ n.jsx("span", { children: r });
    return i[e] ? c.cloneElement(l, a) : null;
  };
  return t.displayName = `@mantine/dropzone/${At(e)}`, t;
}
const gs = Dt("accept"), ys = Dt("reject"), bs = Dt("idle");
var ke = {
  root: "m_d46a4834",
  inner: "m_b85f7144",
  fullScreen: "m_96f6e9ad",
  dropzone: "m_7946116d"
};
const cn = /* @__PURE__ */ new Map([
  ["avif", "image/avif"],
  ["bmp", "image/bmp"],
  ["css", "text/css"],
  ["csv", "text/csv"],
  ["doc", "application/msword"],
  ["docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ["gif", "image/gif"],
  ["gz", "application/gzip"],
  ["htm", "text/html"],
  ["html", "text/html"],
  ["ico", "image/x-icon"],
  ["jpeg", "image/jpeg"],
  ["jpg", "image/jpeg"],
  ["js", "application/javascript"],
  ["json", "application/json"],
  ["md", "text/markdown"],
  ["mjs", "application/javascript"],
  ["mp3", "audio/mpeg"],
  ["mp4", "video/mp4"],
  ["ogg", "audio/ogg"],
  ["pdf", "application/pdf"],
  ["png", "image/png"],
  ["ppt", "application/powerpoint"],
  ["pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  ["svg", "image/svg+xml"],
  ["tif", "image/tiff"],
  ["tiff", "image/tiff"],
  ["txt", "text/plain"],
  ["wasm", "application/wasm"],
  ["wav", "audio/x-wav"],
  ["weba", "audio/webm"],
  ["webm", "video/webm"],
  ["webp", "image/webp"],
  ["xls", "application/vnd.ms-excel"],
  ["xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  ["xml", "application/xml"],
  ["zip", "application/zip"]
]);
var xs = class extends Error {
  constructor(e) {
    super("DataTransferItem is not a file"), this.item = e, this.name = "UnexpectedObjectError";
  }
};
function le(e, t, s) {
  const r = e, { webkitRelativePath: a } = e, i = typeof t == "string" ? t : typeof a == "string" && a.length > 0 ? a : `./${e.name}`;
  return typeof r.path != "string" && Rt(r, "path", i), s !== void 0 && Object.defineProperty(r, "handle", {
    value: s,
    writable: !1,
    configurable: !1,
    enumerable: !0
  }), Rt(r, "relativePath", i), r;
}
function vs(e, t = cn) {
  const { name: s } = e;
  if (s && s.lastIndexOf(".") !== -1 && !e.type) {
    const r = s.split(".").pop().toLowerCase(), a = t.get(r);
    a && Object.defineProperty(e, "type", {
      value: a,
      writable: !1,
      configurable: !1,
      enumerable: !0
    });
  }
  return e;
}
function Rt(e, t, s) {
  Object.defineProperty(e, t, {
    value: s,
    writable: !1,
    configurable: !1,
    enumerable: !0
  });
}
const js = [".DS_Store", "Thumbs.db"];
async function ws(e, { mimeTypes: t = cn } = {}) {
  return (await Es(e)).map((s) => s instanceof File ? vs(s, t) : s);
}
async function Es(e) {
  return ze(e) && dn(e.dataTransfer) ? Ps(e.dataTransfer, e.type) : Ds(e) ? Ss(e.clipboardData) : Ns(e) ? Cs(e) : Array.isArray(e) && e.every((t) => "getFile" in t && typeof t.getFile == "function") ? Fs(e) : [];
}
function dn(e) {
  return ze(e);
}
function Ds(e) {
  return ze(e) && dn(e.clipboardData);
}
function Ns(e) {
  return ze(e) && ze(e.target);
}
function ze(e) {
  return typeof e == "object" && e !== null;
}
function Cs(e) {
  return Qe(e.target.files).map((t) => le(t));
}
async function Fs(e) {
  return (await Promise.all(e.map((t) => t.getFile()))).map((t) => le(t));
}
async function Ps(e, t) {
  const s = Qe(e.items).filter((r) => r.kind === "file");
  return t !== "drop" ? s : un(pn(await Promise.all(s.map(As))));
}
function Ss(e) {
  const t = Qe(e.items).filter((s) => s.kind === "file").map((s) => s.getAsFile()).filter((s) => s !== null);
  return un((t.length > 0 ? t : Qe(e.files)).map((s) => le(s)));
}
function un(e) {
  return e.filter((t) => js.indexOf(t.name) === -1);
}
function Qe(e) {
  return e === null ? [] : Array.from(e);
}
async function As(e) {
  if (typeof e.webkitGetAsEntry != "function") return kt(e);
  const t = e.webkitGetAsEntry();
  if (t?.isDirectory) {
    const s = await fn(e);
    return s?.kind === "directory" ? mn(s, `/${s.name}`) : hn(t);
  }
  return kt(e, t);
}
function pn(e) {
  const t = [];
  for (const s of e) Array.isArray(s) ? t.push(...pn(s)) : t.push(s);
  return t;
}
async function kt(e, t) {
  const s = e.getAsFile(), r = await fn(e);
  if (r != null) {
    const a = s ?? await r.getFile();
    return a.handle = r, le(a);
  }
  if (!s) throw new xs(e);
  return le(s, t?.fullPath ?? void 0);
}
async function fn(e) {
  if (globalThis.isSecureContext && typeof e.getAsFileSystemHandle == "function") return e.getAsFileSystemHandle();
}
async function mn(e, t) {
  const s = [];
  for await (const r of e.values()) {
    const a = `${t}/${r.name}`;
    if (r.kind === "directory") s.push(...await mn(r, a));
    else {
      const i = await r.getFile();
      s.push(le(i, a, r));
    }
  }
  return s;
}
async function Is(e) {
  return e.isDirectory ? hn(e) : Rs(e);
}
function hn(e) {
  const t = e.createReader();
  return new Promise((s, r) => {
    const a = [];
    function i() {
      t.readEntries(async (l) => {
        if (l.length) {
          const d = Promise.all(l.map(Is));
          a.push(d), i();
        } else
          try {
            s(await Promise.all(a));
          } catch (d) {
            r(d);
          }
      }, (l) => {
        r(l);
      });
    }
    i();
  });
}
async function Rs(e) {
  return new Promise((t, s) => {
    e.file((r) => {
      t(le(r, e.fullPath));
    }, (r) => {
      s(r);
    });
  });
}
function pt(e, t) {
  if (e && t) {
    const s = Array.isArray(t) ? t : t.split(",");
    if (s.length === 0) return !0;
    const r = e.name || "", a = (e.type || "").toLowerCase(), i = a.replace(/\/.*$/, "");
    return s.some((l) => {
      const d = l.trim().toLowerCase();
      return d.charAt(0) === "." ? r.toLowerCase().endsWith(d) : d.endsWith("/*") ? i === d.replace(/\/.*$/, "") : a === d;
    });
  }
  return !0;
}
const ks = typeof pt == "function" ? pt : pt.default, zs = "file-invalid-type", Os = "file-too-large", Ts = "file-too-small", Bs = "too-many-files";
function Ls(e = "") {
  const t = e.split(","), s = t.length > 1 ? `one of ${t.join(", ")}` : t[0];
  return {
    code: zs,
    message: `File type must be ${s}`
  };
}
const zt = [
  "KB",
  "MB",
  "GB",
  "TB",
  "PB"
];
function gn(e) {
  if (e < 1024) return `${e} ${e === 1 ? "byte" : "bytes"}`;
  let t = e / 1024, s = 0;
  for (; t >= 1024 && s < zt.length - 1; )
    t /= 1024, s++;
  return `${Number(t.toFixed(2))} ${zt[s]}`;
}
function Ot(e) {
  return {
    code: Os,
    message: `File is larger than ${gn(e)}`
  };
}
function Tt(e) {
  return {
    code: Ts,
    message: `File is smaller than ${gn(e)}`
  };
}
const yn = {
  code: Bs,
  message: "Too many files"
};
function _s(e) {
  return e.type === "" && typeof e.getAsFile == "function";
}
function bn(e, t) {
  const s = e.type === "application/x-moz-file" || ks(e, t ?? "") || _s(e);
  return [s, s ? null : Ls(t)];
}
function xn(e, t, s) {
  if (M(e.size))
    if (M(t) && M(s)) {
      if (e.size > s) return [!1, Ot(s)];
      if (e.size < t) return [!1, Tt(t)];
    } else {
      if (M(t) && e.size < t) return [!1, Tt(t)];
      if (M(s) && e.size > s) return [!1, Ot(s)];
    }
  return [!0, null];
}
function M(e) {
  return e != null;
}
function Ms(e) {
  return e != null && typeof e.then == "function";
}
function $s({ files: e, accept: t, minSize: s, maxSize: r, multiple: a, maxFiles: i = 0, validator: l, getErrorMessage: d }) {
  const h = [], y = [], b = (u, p) => d && typeof File < "u" && p instanceof File ? {
    ...u,
    message: d(u, p)
  } : u;
  e.forEach((u) => {
    const [p, N] = bn(u, t), [C, x] = xn(u, s, r);
    p && C ? h.push(u) : y.push({
      file: u,
      errors: [N, x].filter((v) => v != null).map((v) => b(v, u))
    });
  });
  const j = a ? i >= 1 ? i : Number.POSITIVE_INFINITY : 1;
  return h.length > j && h.slice(j).forEach((u) => {
    y.push({
      file: u,
      errors: [b(yn, u)]
    });
  }), y.length > 0 ? {
    verdict: "reject",
    rejections: y
  } : {
    verdict: l ? "unknown" : "accept",
    rejections: y
  };
}
function Ie(e) {
  return typeof e.isPropagationStopped == "function" ? e.isPropagationStopped() : typeof e.cancelBubble < "u" ? e.cancelBubble : !1;
}
function je(e) {
  const t = e.dataTransfer ?? e.clipboardData;
  return t ? Array.prototype.some.call(t.types, (s) => s === "Files" || s === "application/x-moz-file") || Array.prototype.some.call(t.items ?? [], Hs) : !!e.target && !!e.target.files;
}
function Hs(e) {
  return typeof e == "object" && e !== null && e.kind === "file";
}
function Bt(e) {
  e.preventDefault();
}
function Gs(e) {
  return e.indexOf("MSIE") !== -1 || e.indexOf("Trident/") !== -1;
}
function Us(e) {
  return e.indexOf("Edge/") !== -1;
}
function Vs(e = window.navigator.userAgent) {
  return Gs(e) || Us(e);
}
function H(...e) {
  return (t, ...s) => e.some((r) => (!Ie(t) && r && r(t, ...s), Ie(t)));
}
function Ws() {
  return "showOpenFilePicker" in window;
}
function Oe(e) {
  return Array.isArray(e) ? e : typeof e == "string" ? [e] : [];
}
function vn(e) {
  if (M(e))
    return Array.isArray(e) ? e.filter((t) => M(t) && M(t.accept)) : [{ accept: e }];
}
function qs(e) {
  const t = [], s = Object.keys(e);
  for (const r of Object.values(e)) for (const a of Oe(r)) t.includes(a) || t.push(a);
  return t.length > 0 ? t.join(", ") : s.length > 0 ? s.join(", ") : "Files";
}
function Ks(e) {
  const t = vn(e);
  if (!M(t)) return;
  const s = {};
  for (const r of t) for (const [a, i] of Object.entries(r.accept)) {
    const l = s[a] ?? (s[a] = []);
    for (const d of Oe(i)) l.includes(d) || l.push(d);
  }
  return s;
}
function Ys(e) {
  const t = vn(e);
  if (!M(t)) return;
  const s = t.map((r) => {
    const a = Object.entries(r.accept).filter(([i, l]) => {
      let d = !0;
      return jn(i) || (console.warn(`Skipped "${i}" because it is not a valid MIME type. Check https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types for a list of valid MIME types.`), d = !1), (!(Array.isArray(l) || typeof l == "string") || !Oe(l).every(ft)) && (console.warn(`Skipped "${i}" because an invalid file extension was provided.`), d = !1), d;
    }).reduce((i, [l, d]) => (i[l] = Oe(d), i), {});
    return {
      description: M(r.description) && r.description !== "" ? r.description : qs(a),
      accept: a
    };
  }).filter((r) => Object.keys(r.accept).length > 0);
  return s.length > 0 ? s : void 0;
}
function Lt(e, { omitWildcardMimeTypesWithExtensions: t = !1 } = {}) {
  if (M(e)) return Object.entries(e).reduce((s, [r, a]) => {
    const i = Oe(a);
    return t && Xs(r) && i.some(ft) ? s.push(...i) : s.push(r, ...i), s;
  }, []).filter((s) => jn(s) || ft(s)).join(",");
}
function Zs(e) {
  return e instanceof DOMException && (e.name === "AbortError" || e.code === e.ABORT_ERR);
}
function Js(e) {
  return e instanceof DOMException && (e.name === "SecurityError" || e.code === e.SECURITY_ERR);
}
function Qs(e) {
  return e instanceof DOMException && e.name === "NotAllowedError";
}
function jn(e) {
  return e === "audio/*" || e === "video/*" || e === "image/*" || e === "text/*" || e === "application/*" || /\w+\/[-+.\w]+/g.test(e);
}
function Xs(e) {
  return e.endsWith("/*");
}
function ft(e) {
  return /^.*\.[\w]+$/.test(e);
}
const er = c.forwardRef(({ children: e, ...t }, s) => {
  const { open: r, ...a } = wn(t);
  return c.useImperativeHandle(s, () => ({ open: r }), [r]), /* @__PURE__ */ n.jsx(n.Fragment, { children: e?.({
    ...a,
    open: r
  }) });
});
er.displayName = "Dropzone";
const mt = {
  isFocused: !1,
  isFileDialogActive: !1,
  isDragActive: !1,
  isDragAccept: !1,
  isDragReject: !1,
  isDragUnknown: !1,
  isDragGlobal: !1,
  isProcessing: !1,
  acceptedFiles: [],
  fileRejections: [],
  dragFileRejections: []
};
function wn(e = {}) {
  const { accept: t, disabled: s = !1, getFilesFromEvent: r = ws, maxSize: a = Number.POSITIVE_INFINITY, minSize: i = 0, multiple: l = !0, maxFiles: d = 0, onDragEnter: h, onDragLeave: y, onDragOver: b, onDrop: j, onDropAccepted: u, onDropRejected: p, onFileDialogCancel: N, onFileDialogOpen: C, useFsAccessApi: x = !1, autoFocus: v = !1, preventDropOnDocument: D = !0, noClick: I = !1, noKeyboard: k = !1, noDrag: R = !1, noDragEventsBubbling: P = !1, noPaste: de = !1, onError: Z, validator: U, getErrorMessage: V } = e, T = c.useMemo(() => Ks(t), [t]), ue = c.useMemo(() => Lt(T), [T]), Fe = c.useMemo(() => Lt(T, { omitWildcardMimeTypesWithExtensions: !0 }), [T]), _e = c.useMemo(() => Ys(t), [t]), Pe = c.useMemo(() => typeof C == "function" ? C : _t, [C]), pe = c.useMemo(() => typeof N == "function" ? N : _t, [N]), S = c.useRef(null), B = c.useRef(null), [rt, E] = c.useReducer(tr, mt), { isFocused: at, isFileDialogActive: fe } = rt, me = c.useRef(fe);
  me.current = fe;
  const Me = c.useRef(null), se = c.useCallback(() => {
    Me.current?.abort();
    const o = new AbortController();
    return Me.current = o, E({
      type: "setProcessing",
      isProcessing: !0
    }), o.signal;
  }, []), _ = c.useCallback((o) => {
    o.aborted || E({
      type: "setProcessing",
      isProcessing: !1
    });
  }, []), oe = c.useRef(typeof window < "u" && window.isSecureContext && x && Ws()), $e = () => {
    !oe.current && fe && setTimeout(() => {
      if (B.current) {
        const { files: o } = B.current;
        o?.length || (E({ type: "closeDialog" }), pe());
      }
    }, 300);
  };
  c.useEffect(() => (window.addEventListener("focus", $e, !1), () => {
    window.removeEventListener("focus", $e, !1);
  }), [
    B,
    fe,
    pe,
    oe
  ]);
  const re = c.useRef([]), J = c.useRef([]), He = (o) => {
    S.current && o.target && S.current.contains(o.target) && o.defaultPrevented || (o.preventDefault(), re.current = []);
  };
  c.useEffect(() => (D && (document.addEventListener("dragover", Bt, !1), document.addEventListener("drop", He, !1)), () => {
    D && (document.removeEventListener("dragover", Bt), document.removeEventListener("drop", He));
  }), [S, D]), c.useEffect(() => {
    const o = (W) => {
      W.target && (J.current = [...J.current, W.target]), je(W) && E({
        isDragGlobal: !0,
        type: "setDragGlobal"
      });
    }, m = (W) => {
      J.current = J.current.filter((ae) => ae !== W.target && ae !== null), !(J.current.length > 0) && E({
        isDragGlobal: !1,
        type: "setDragGlobal"
      });
    }, g = () => {
      J.current = [], E({
        isDragGlobal: !1,
        type: "setDragGlobal"
      });
    }, $ = () => {
      J.current = [], E({
        isDragGlobal: !1,
        type: "setDragGlobal"
      });
    };
    return document.addEventListener("dragenter", o, !1), document.addEventListener("dragleave", m, !1), document.addEventListener("dragend", g, !1), document.addEventListener("drop", $, !1), () => {
      document.removeEventListener("dragenter", o), document.removeEventListener("dragleave", m), document.removeEventListener("dragend", g), document.removeEventListener("drop", $);
    };
  }, [S]), c.useEffect(() => (!s && v && S.current && S.current.focus(), () => {
  }), [
    S,
    v,
    s
  ]);
  const L = c.useCallback((o) => {
    Z ? Z(o) : console.error(o);
  }, [Z]), Ge = c.useCallback((o) => {
    o.preventDefault(), o.persist?.(), Se(o), !me.current && (re.current = [...re.current, o.target], je(o) && Promise.resolve(r(o)).then((m) => {
      if (Ie(o) && !P) return;
      const g = m.length > 0 ? $s({
        files: m,
        accept: ue,
        minSize: i,
        maxSize: a,
        multiple: l,
        maxFiles: d,
        validator: U,
        getErrorMessage: V
      }) : null;
      E({
        isDragAccept: g?.verdict === "accept",
        isDragReject: g?.verdict === "reject",
        isDragUnknown: g?.verdict === "unknown",
        isDragActive: !0,
        dragFileRejections: g?.rejections ?? [],
        type: "setDraggedFiles"
      }), h && h(o);
    }).catch((m) => L(m)));
  }, [
    r,
    h,
    L,
    P,
    ue,
    i,
    a,
    l,
    d,
    U,
    V
  ]), he = c.useCallback((o) => {
    if (o.preventDefault(), o.persist?.(), Se(o), me.current) return !1;
    const m = je(o);
    if (m && o.dataTransfer) try {
      o.dataTransfer.dropEffect = "copy";
    } catch {
    }
    return m && b && b(o), !1;
  }, [b, P]), ge = c.useCallback((o) => {
    o.preventDefault(), o.persist?.(), Se(o);
    const m = re.current.filter(($) => S.current?.contains($)), g = m.indexOf(o.target);
    g !== -1 && m.splice(g, 1), re.current = m, !(m.length > 0) && (E({
      type: "setDraggedFiles",
      isDragActive: !1,
      isDragAccept: !1,
      isDragReject: !1,
      isDragUnknown: !1,
      dragFileRejections: []
    }), je(o) && y && y(o));
  }, [
    S,
    y,
    P
  ]), Q = c.useCallback(async (o, m, g) => {
    const $ = (F, z) => V ? {
      ...F,
      message: V(F, z)
    } : F, W = (F) => {
      const z = [], q = [];
      F.forEach(({ file: K, accepted: zn, acceptError: On, sizeMatch: Tn, sizeError: Bn, customErrors: it }) => {
        if (zn && Tn && !it) z.push(K);
        else {
          let lt = [On, Bn];
          it && (lt = lt.concat(it)), q.push({
            file: K,
            errors: lt.filter((ct) => ct != null).map((ct) => $(ct, K))
          });
        }
      });
      const xe = l ? d >= 1 ? d : Number.POSITIVE_INFINITY : 1;
      z.length > xe && z.splice(xe).forEach((K) => {
        q.push({
          file: K,
          errors: [$(yn, K)]
        });
      }), E({
        acceptedFiles: z,
        fileRejections: q,
        type: "setFiles"
      }), j && j(z, q, m), q.length > 0 && p && p(q, m), z.length > 0 && u && u(z, m);
    }, ae = o.map((F) => {
      const [z, q] = bn(F, Fe), [xe, K] = xn(F, i, a);
      return {
        file: F,
        accepted: z,
        acceptError: q,
        sizeMatch: xe,
        sizeError: K,
        customErrors: U ? U(F) : null
      };
    });
    if (!ae.some(({ customErrors: F }) => Ms(F))) {
      W(ae);
      return;
    }
    let We;
    try {
      We = await Promise.all(ae.map(async ({ customErrors: F, ...z }) => ({
        ...z,
        customErrors: await F
      })));
    } catch (F) {
      g.aborted || (_(g), L(F));
      return;
    }
    g.aborted || W(We);
  }, [
    E,
    l,
    Fe,
    i,
    a,
    d,
    j,
    u,
    p,
    U,
    V,
    L,
    _
  ]), ye = c.useCallback((o) => {
    if (o.preventDefault(), o.persist?.(), Se(o), re.current = [], !(me.current && o.dataTransfer) && (E({ type: "reset" }), je(o))) {
      const m = se();
      Promise.resolve(r(o)).then((g) => {
        if (!m.aborted) {
          if (Ie(o) && !P) {
            _(m);
            return;
          }
          return Q(g, o, m);
        }
      }).catch((g) => {
        m.aborted || (_(m), L(g));
      });
    }
  }, [
    r,
    Q,
    L,
    P,
    se,
    _
  ]), Ue = c.useCallback((o) => {
    if (!je(o)) return;
    o.preventDefault(), o.persist?.(), Se(o);
    const m = se();
    Promise.resolve(r(o)).then((g) => {
      if (!m.aborted) {
        if (Ie(o) && !P) {
          _(m);
          return;
        }
        return Q(g, o, m);
      }
    }).catch((g) => {
      m.aborted || (_(m), L(g));
    });
  }, [
    r,
    Q,
    L,
    P,
    se,
    _
  ]), be = c.useCallback(() => {
    if (oe.current) {
      E({ type: "openDialog" }), Pe();
      const o = {
        multiple: l,
        types: _e
      };
      let m;
      window.showOpenFilePicker(o).then((g) => (m = se(), r(g))).then((g) => {
        if (E({ type: "closeDialog" }), !m.aborted)
          return Q(g, null, m);
      }).catch((g) => {
        m && _(m), Zs(g) ? (pe(g), E({ type: "closeDialog" })) : Js(g) || Qs(g) ? (oe.current = !1, B.current ? (B.current.value = "", B.current.click()) : L(/* @__PURE__ */ new Error("Cannot open the file picker because the https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API is not supported and no <input> was provided."))) : L(g);
      });
      return;
    }
    B.current && (E({ type: "openDialog" }), Pe(), B.current.value = "", B.current.click());
  }, [
    E,
    Pe,
    pe,
    x,
    Q,
    L,
    _e,
    l,
    se,
    _
  ]), Ct = c.useCallback((o) => {
    S.current?.isEqualNode(o.target) && (o.key === " " || o.key === "Enter" || o.keyCode === 32 || o.keyCode === 13) && (o.preventDefault(), be());
  }, [S, be]), Ft = c.useCallback(() => {
    E({ type: "focus" });
  }, []), Pt = c.useCallback(() => {
    E({ type: "blur" });
  }, []), St = c.useCallback(() => {
    I || (Vs() ? setTimeout(be, 0) : be());
  }, [I, be]), ie = (o) => s ? null : o, ot = (o) => k ? null : ie(o), Ve = (o) => R ? null : ie(o), An = (o) => de ? null : ie(o), Se = (o) => {
    P && o.stopPropagation();
  }, In = c.useMemo(() => ({ refKey: o = "ref", role: m, onKeyDown: g, onFocus: $, onBlur: W, onClick: ae, onDragEnter: We, onDragOver: F, onDragLeave: z, onDrop: q, onPaste: xe, ...K } = {}) => ({
    onKeyDown: ot(H(g, Ct)),
    onFocus: ot(H($, Ft)),
    onBlur: ot(H(W, Pt)),
    onClick: ie(H(ae, St)),
    onDragEnter: Ve(H(We, Ge)),
    onDragOver: Ve(H(F, he)),
    onDragLeave: Ve(H(z, ge)),
    onDrop: Ve(H(q, ye)),
    onPaste: An(H(xe, Ue)),
    role: typeof m == "string" && m !== "" ? m : "presentation",
    [o]: S,
    ...!s && !k ? { tabIndex: 0 } : {},
    ...s ? { "aria-disabled": !0 } : {},
    ...K
  }), [
    S,
    Ct,
    Ft,
    Pt,
    St,
    Ge,
    he,
    ge,
    ye,
    Ue,
    k,
    R,
    de,
    s
  ]), Rn = c.useCallback((o) => {
    o.stopPropagation();
  }, []), kn = c.useMemo(() => ({ refKey: o = "ref", onChange: m, onClick: g, ...$ } = {}) => ({
    accept: Fe,
    multiple: l,
    type: "file",
    "aria-label": "file upload",
    style: {
      border: 0,
      display: "block",
      height: 0,
      margin: 0,
      opacity: 0,
      overflow: "hidden",
      padding: 0,
      width: 0
    },
    onChange: ie(H(m, ye)),
    onClick: ie(H(g, Rn)),
    tabIndex: -1,
    [o]: B,
    ...$
  }), [
    B,
    t,
    l,
    ye,
    s
  ]);
  return {
    ...rt,
    isFocused: at && !s,
    getRootProps: In,
    getInputProps: kn,
    rootRef: S,
    inputRef: B,
    open: ie(be)
  };
}
function tr(e, t) {
  switch (t.type) {
    case "focus":
      return {
        ...e,
        isFocused: !0
      };
    case "blur":
      return {
        ...e,
        isFocused: !1
      };
    case "openDialog":
      return {
        ...mt,
        isFileDialogActive: !0
      };
    case "closeDialog":
      return {
        ...e,
        isFileDialogActive: !1
      };
    case "setDraggedFiles":
      return {
        ...e,
        isDragActive: t.isDragActive,
        isDragAccept: t.isDragAccept,
        isDragReject: t.isDragReject,
        isDragUnknown: t.isDragUnknown,
        dragFileRejections: t.dragFileRejections
      };
    case "setProcessing":
      return {
        ...e,
        isProcessing: t.isProcessing
      };
    case "setFiles":
      return {
        ...e,
        acceptedFiles: t.acceptedFiles,
        fileRejections: t.fileRejections,
        dragFileRejections: [],
        isProcessing: !1,
        isDragReject: !1,
        isDragUnknown: !1
      };
    case "setDragGlobal":
      return {
        ...e,
        isDragGlobal: t.isDragGlobal
      };
    case "reset":
      return { ...mt };
    default:
      return e;
  }
}
function _t() {
}
function nr(e) {
  const t = e, { webkitRelativePath: s } = e, r = typeof s == "string" && s.length > 0 ? s : `./${e.name}`;
  return typeof t.path != "string" && Object.defineProperty(e, "path", {
    value: r,
    writable: !1,
    configurable: !0
  }), typeof t.relativePath != "string" && Object.defineProperty(e, "relativePath", {
    value: r,
    writable: !1,
    configurable: !0
  }), e;
}
function sr(e) {
  return async (t) => (await e(t)).map((s) => s instanceof File ? nr(s) : s);
}
const rr = {
  multiple: !0,
  maxSize: 1 / 0,
  activateOnClick: !0,
  activateOnDrag: !0,
  dragEventsBubbling: !0,
  activateOnKeyboard: !0,
  useFsAccessApi: !1,
  variant: "light",
  rejectColor: "red"
}, En = Be((e, { radius: t, variant: s, acceptColor: r, rejectColor: a }) => {
  const i = e.variantColorResolver({
    color: r || e.primaryColor,
    theme: e,
    variant: s
  }), l = e.variantColorResolver({
    color: a || "red",
    theme: e,
    variant: s
  });
  return { root: {
    "--dropzone-radius": vt(t),
    "--dropzone-accept-color": i.color,
    "--dropzone-accept-bg": i.background,
    "--dropzone-reject-color": l.color,
    "--dropzone-reject-bg": l.background
  } };
}), ne = De((e) => {
  const t = G("Dropzone", rr, e), { classNames: s, className: r, style: a, styles: i, unstyled: l, vars: d, radius: h, disabled: y, loading: b, multiple: j, maxSize: u, accept: p, children: N, onDropAny: C, onDrop: x, onReject: v, openRef: D, name: I, maxFiles: k, autoFocus: R, activateOnClick: P, activateOnDrag: de, dragEventsBubbling: Z, activateOnKeyboard: U, onDragEnter: V, onDragLeave: T, onDragOver: ue, onFileDialogCancel: Fe, onFileDialogOpen: _e, preventDropOnDocument: Pe, useFsAccessApi: pe, getFilesFromEvent: S, validator: B, rejectColor: rt, acceptColor: E, enablePointerEvents: at, loaderProps: fe, inputProps: me, mod: Me, attributes: se, ..._ } = t, oe = ce({
    name: "Dropzone",
    classes: ke,
    props: t,
    className: r,
    style: a,
    classNames: s,
    styles: i,
    unstyled: l,
    attributes: se,
    vars: d,
    varsResolver: En
  }), { getRootProps: $e, getInputProps: re, isDragAccept: J, isDragReject: He, isDragActive: L, open: Ge } = wn({
    onDrop: C,
    onDropAccepted: x,
    onDropRejected: v,
    disabled: y || b,
    accept: Array.isArray(p) ? p.reduce((ye, Ue) => ({
      ...ye,
      [Ue]: []
    }), {}) : p,
    multiple: j,
    maxSize: u,
    maxFiles: k,
    autoFocus: R,
    noClick: !P,
    noDrag: !de,
    noDragEventsBubbling: !Z,
    noKeyboard: !U,
    onDragEnter: V,
    onDragLeave: T,
    onDragOver: ue,
    onFileDialogCancel: Fe,
    onFileDialogOpen: _e,
    preventDropOnDocument: Pe,
    useFsAccessApi: pe,
    validator: B,
    ...S ? { getFilesFromEvent: sr(S) } : null
  });
  Ze(D, Ge);
  const he = L && J, ge = L && He, Q = !he && !ge;
  return /* @__PURE__ */ n.jsx(ms, {
    value: {
      accept: he,
      reject: ge,
      idle: Q
    },
    children: /* @__PURE__ */ n.jsxs(te, {
      ...$e(),
      ...oe("root", { focusable: !0 }),
      ..._,
      mod: [{
        accept: he,
        reject: ge,
        idle: Q,
        disabled: y,
        loading: b,
        "activate-on-click": P
      }, Me],
      children: [
        /* @__PURE__ */ n.jsx(st, {
          visible: b,
          overlayProps: { radius: h },
          unstyled: l,
          loaderProps: fe
        }),
        /* @__PURE__ */ n.jsx("input", {
          ...re(me),
          name: I
        }),
        /* @__PURE__ */ n.jsx("div", {
          ...oe("inner"),
          "data-enable-pointer-events": at || void 0,
          children: N
        })
      ]
    })
  });
});
ne.classes = ke;
ne.varsResolver = En;
ne.displayName = "@mantine/dropzone/Dropzone";
ne.Accept = gs;
ne.Idle = bs;
ne.Reject = ys;
const ar = {
  maxSize: 1 / 0,
  activateOnDrag: !0,
  dragEventsBubbling: !0,
  activateOnKeyboard: !0,
  active: !0,
  zIndex: jt("max"),
  withinPortal: !0
}, Nt = De((e) => {
  const t = G("DropzoneFullScreen", ar, e), { classNames: s, className: r, style: a, styles: i, unstyled: l, vars: d, active: h, onDrop: y, onReject: b, zIndex: j, withinPortal: u, portalProps: p, attributes: N, mod: C, ...x } = t, v = ce({
    name: "DropzoneFullScreen",
    classes: ke,
    props: t,
    className: r,
    style: a,
    classNames: s,
    styles: i,
    unstyled: l,
    attributes: N,
    rootSelector: "fullScreen"
  }), { resolvedClassNames: D, resolvedStyles: I } = Wn({
    classNames: s,
    styles: i,
    props: t
  }), [k, R] = c.useState(0), [P, { open: de, close: Z }] = ts(!1), U = (T) => {
    T.dataTransfer?.types.includes("Files") && (R((ue) => ue + 1), de());
  }, V = () => {
    R((T) => T - 1);
  };
  return c.useEffect(() => {
    k === 0 && Z();
  }, [k]), c.useEffect(() => {
    if (h)
      return document.addEventListener("dragenter", U, !1), document.addEventListener("dragleave", V, !1), () => {
        document.removeEventListener("dragenter", U, !1), document.removeEventListener("dragleave", V, !1);
      };
  }, [h]), /* @__PURE__ */ n.jsx(Xt, {
    ...p,
    withinPortal: u,
    children: /* @__PURE__ */ n.jsx(te, {
      ...v("fullScreen", { style: {
        opacity: P ? 1 : 0,
        pointerEvents: P ? "all" : "none",
        zIndex: j
      } }),
      children: /* @__PURE__ */ n.jsx(ne, {
        activateOnClick: !1,
        ...x,
        classNames: D,
        styles: I,
        unstyled: l,
        className: ke.dropzone,
        onDrop: (T) => {
          y?.(T), Z(), R(0);
        },
        onReject: (T) => {
          b?.(T), Z(), R(0);
        }
      })
    })
  });
});
Nt.classes = ke;
Nt.displayName = "@mantine/dropzone/DropzoneFullScreen";
ne.FullScreen = Nt;
const or = ne;
let Dn = null;
function Pr(e) {
  Dn = e;
}
const A = (e) => /* @__PURE__ */ n.jsx("i", { className: `ph ${e}`, "aria-hidden": "true" }), Mt = {
  root: {
    width: "100%",
    height: "auto",
    minHeight: "3.25rem",
    paddingInline: 4,
    paddingBlock: 2,
    overflow: "visible"
  },
  inner: { width: "100%", height: "100%", minHeight: 0, overflow: "visible" },
  label: {
    display: "flex",
    width: "100%",
    maxWidth: "100%",
    height: "auto",
    minHeight: 0,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    overflow: "visible",
    overflowWrap: "anywhere",
    textAlign: "center",
    whiteSpace: "normal",
    lineHeight: 1
  }
}, $t = {
  root: { height: "var(--header-control-height)", minHeight: "var(--header-control-height)" },
  inner: { height: "100%" }
}, Ae = {
  inner: { justifyContent: "flex-start" },
  label: { flex: "0 1 auto" }
}, qe = {
  root: { width: "100%", minHeight: "3rem" },
  inner: { width: "100%" },
  label: {
    display: "grid",
    width: "100%",
    gridTemplateColumns: "2rem minmax(0, 1fr)",
    alignItems: "center",
    gap: "0.75rem",
    textAlign: "left"
  }
}, ir = {
  root: { width: "100%", minHeight: "7rem" },
  inner: {
    display: "grid",
    width: "100%",
    justifyItems: "center",
    alignContent: "center",
    gap: "0.5rem",
    whiteSpace: "normal",
    textAlign: "center"
  }
};
function lr() {
  return /* @__PURE__ */ n.jsxs(n.Fragment, { children: [
    /* @__PURE__ */ n.jsxs("a", { className: "brand", href: "/", "aria-label": "Assemblash home", "data-i18n-attr": "aria-label:app.homeLabel", children: [
      /* @__PURE__ */ n.jsxs("svg", { className: "brand-mark", viewBox: "0 0 64 64", fill: "none", "aria-hidden": "true", focusable: "false", children: [
        /* @__PURE__ */ n.jsx("path", { d: "M32 6 57 19 32 32 7 19 32 6Z", fill: "#ef3325", opacity: ".28" }),
        /* @__PURE__ */ n.jsx("path", { d: "M32 19 57 32 32 45 7 32l25-13Z", fill: "#ef3325", opacity: ".58" }),
        /* @__PURE__ */ n.jsx("path", { d: "M32 32 57 45 32 58 7 45l25-13Z", fill: "#ef3325" }),
        /* @__PURE__ */ n.jsx("path", { d: "m32 17 10 5.2-10 5.2-10-5.2L32 17Z", fill: "white", opacity: ".94" })
      ] }),
      /* @__PURE__ */ n.jsx("span", { children: "Assemblash" })
    ] }),
    /* @__PURE__ */ n.jsxs("div", { className: "project-control", children: [
      /* @__PURE__ */ n.jsx("div", { className: "project-combobox" }),
      /* @__PURE__ */ n.jsx(Y, { id: "new-project", className: "icon-button", type: "button", size: 40, variant: "default", title: "New project", "data-i18n-attr": "title:projects.newButton;aria-label:projects.newButton", "aria-label": "New project", children: A("ph-plus") })
    ] }),
    /* @__PURE__ */ n.jsxs("div", { className: "topbar-history", "aria-label": "Document history", "data-i18n-attr": "aria-label:history.documentLabel", children: [
      /* @__PURE__ */ n.jsx(Y, { id: "undo", className: "icon-button", type: "button", size: 40, variant: "default", disabled: !0, title: "Undo", "data-i18n-attr": "title:history.undo;aria-label:history.undo", "aria-label": "Undo", children: A("ph-arrow-counter-clockwise") }),
      /* @__PURE__ */ n.jsx(Y, { id: "redo", className: "icon-button", type: "button", size: 40, variant: "default", disabled: !0, title: "Redo", "data-i18n-attr": "title:history.redo;aria-label:history.redo", "aria-label": "Redo", children: A("ph-arrow-clockwise") }),
      /* @__PURE__ */ n.jsxs(w, { id: "history-shortcut", className: "version-pill", type: "button", variant: "default", styles: $t, title: "Show history", "data-i18n-attr": "title:history.show", children: [
        A("ph-clock-counter-clockwise"),
        /* @__PURE__ */ n.jsxs("span", { children: [
          /* @__PURE__ */ n.jsx("span", { "data-i18n": "history.version", children: "Version" }),
          " ",
          /* @__PURE__ */ n.jsx("span", { id: "version", children: "–" })
        ] })
      ] }),
      /* @__PURE__ */ n.jsx("span", { id: "save-state", className: "save-state" })
    ] }),
    /* @__PURE__ */ n.jsxs("div", { className: "topbar-actions", children: [
      /* @__PURE__ */ n.jsx(Y, { id: "settings", className: "icon-button", type: "button", size: 40, variant: "default", title: "Settings", "data-i18n-attr": "title:settings.openButton;aria-label:settings.openButton", "aria-label": "Settings", children: A("ph-gear-six") }),
      /* @__PURE__ */ n.jsxs(w, { id: "export", className: "button button-primary export-button", type: "button", styles: $t, "aria-label": "Export", "data-i18n-attr": "aria-label:export.openButton", children: [
        A("ph-export"),
        /* @__PURE__ */ n.jsx("span", { "data-i18n": "export.openButton", children: "Export" }),
        A("ph-caret-down")
      ] })
    ] })
  ] });
}
const cr = [
  { id: "select-tool", icon: "ph-cursor", aria: "toolbar.selectButton", label: "toolbar.selectButton", pressed: "false" },
  { id: "add-text", icon: "ph-text-t", aria: "toolbar.openText", label: "toolbar.textButton", pressed: "true", controls: "add-panel", active: !0 },
  { id: "add-shape", icon: "ph-shapes", aria: "toolbar.openElements", label: "toolbar.elementsButton", pressed: "false", controls: "add-panel" },
  { id: "add-image", icon: "ph-image", aria: "toolbar.openUploads", label: "toolbar.uploadsButton", pressed: "false", controls: "add-panel" },
  { id: "templates-toggle", icon: "ph-layout", aria: "toolbar.openTemplates", label: "toolbar.templatesButton", pressed: "false", controls: "add-panel" }
];
function dr() {
  return /* @__PURE__ */ n.jsxs(n.Fragment, { children: [
    cr.map((e) => /* @__PURE__ */ n.jsxs(w, { id: e.id, type: "button", variant: "subtle", className: `tool${"active" in e && e.active ? " active" : ""}`, styles: Mt, "aria-label": e.aria, title: e.label.split(".")[1], "aria-pressed": e.pressed, "aria-controls": "controls" in e ? e.controls : void 0, "data-i18n-attr": `aria-label:${e.aria};title:${e.label}`, children: [
      A(e.icon),
      /* @__PURE__ */ n.jsx("span", { className: "tool-label", "data-i18n": e.label, children: e.label.split(".")[1] })
    ] }, e.id)),
    /* @__PURE__ */ n.jsx("span", { className: "toolrail-spacer" }),
    /* @__PURE__ */ n.jsxs(w, { id: "dock-toggle", className: "tool", type: "button", variant: "subtle", styles: Mt, "aria-label": "Toggle properties and layers", title: "Panels", "aria-expanded": "true", "aria-controls": "structure-panel", "data-i18n-attr": "aria-label:toolbar.togglePanels;title:toolbar.panelsButton", children: [
      A("ph-sidebar-simple"),
      /* @__PURE__ */ n.jsx("span", { className: "tool-label", "data-i18n": "toolbar.panelsButton", children: "Panels" })
    ] })
  ] });
}
function ur() {
  return /* @__PURE__ */ n.jsxs(n.Fragment, { children: [
    /* @__PURE__ */ n.jsxs("div", { className: "panel-heading", children: [
      /* @__PURE__ */ n.jsx(O, { component: "h2", id: "add-panel-title", children: /* @__PURE__ */ n.jsx("span", { "data-i18n": "toolbar.textButton", children: "Text" }) }),
      /* @__PURE__ */ n.jsx(Y, { id: "add-panel-close", className: "icon-button", type: "button", variant: "subtle", title: "Collapse Add panel", "data-i18n-attr": "title:panels.collapseAdd;aria-label:panels.collapseAdd", "aria-label": "Collapse Add panel", children: A("ph-x") })
    ] }),
    /* @__PURE__ */ n.jsxs("section", { className: "add-section", id: "add-text-section", children: [
      /* @__PURE__ */ n.jsxs("div", { className: "section-title", children: [
        /* @__PURE__ */ n.jsx("h3", { children: /* @__PURE__ */ n.jsx("span", { "data-i18n": "toolbar.textButton", children: "Text" }) }),
        A("ph-caret-up")
      ] }),
      /* @__PURE__ */ n.jsx(w, { className: "text-preset plain", type: "button", variant: "default", styles: Ae, "data-text-preset": "plain", children: /* @__PURE__ */ n.jsx("span", { "data-i18n": "text.plain", children: "Plain text" }) }),
      /* @__PURE__ */ n.jsx(w, { className: "text-preset heading", type: "button", variant: "default", styles: Ae, "data-text-preset": "heading", children: /* @__PURE__ */ n.jsx("span", { "data-i18n": "text.heading", children: "Heading" }) }),
      /* @__PURE__ */ n.jsx(w, { className: "text-preset subheading", type: "button", variant: "default", styles: Ae, "data-text-preset": "subheading", children: /* @__PURE__ */ n.jsx("span", { "data-i18n": "text.subheading", children: "Subheading" }) }),
      /* @__PURE__ */ n.jsx(w, { className: "text-preset body", type: "button", variant: "default", styles: Ae, "data-text-preset": "body", children: /* @__PURE__ */ n.jsx("span", { "data-i18n": "text.body", children: "Body text" }) })
    ] }),
    /* @__PURE__ */ n.jsxs("section", { className: "add-section", id: "add-shape-section", hidden: !0, children: [
      /* @__PURE__ */ n.jsx("div", { className: "section-title", children: /* @__PURE__ */ n.jsx("h3", { children: /* @__PURE__ */ n.jsx("span", { "data-i18n": "toolbar.elementsButton", children: "Elements" }) }) }),
      /* @__PURE__ */ n.jsxs("div", { className: "shape-row", children: [
        /* @__PURE__ */ n.jsx(O, { className: "element-group-title", "data-i18n": "elements.shapes", children: "Shapes" }),
        /* @__PURE__ */ n.jsxs(w, { className: "shape-preset", type: "button", variant: "default", radius: 12, styles: qe, "data-shape": "rect", children: [
          /* @__PURE__ */ n.jsx("span", { className: "shape-preset-icon", children: A("ph-square") }),
          /* @__PURE__ */ n.jsx("span", { "data-i18n": "shapes.rectangle", children: "Rectangle" })
        ] }),
        /* @__PURE__ */ n.jsxs(w, { className: "shape-preset", type: "button", variant: "default", radius: 12, styles: qe, "data-shape": "ellipse", children: [
          /* @__PURE__ */ n.jsx("span", { className: "shape-preset-icon", children: A("ph-circle") }),
          /* @__PURE__ */ n.jsx("span", { "data-i18n": "shapes.ellipse", children: "Ellipse" })
        ] }),
        /* @__PURE__ */ n.jsx(O, { className: "element-group-title", "data-i18n": "elements.lines", children: "Lines" }),
        /* @__PURE__ */ n.jsxs(w, { className: "shape-preset", type: "button", variant: "default", radius: 12, styles: qe, "data-shape": "line", children: [
          /* @__PURE__ */ n.jsx("span", { className: "shape-preset-icon", children: A("ph-line-segment") }),
          /* @__PURE__ */ n.jsx("span", { "data-i18n": "shapes.line", children: "Line" })
        ] }),
        /* @__PURE__ */ n.jsx(O, { className: "element-group-title", "data-i18n": "elements.paths", children: "Paths" }),
        /* @__PURE__ */ n.jsxs(w, { className: "shape-preset", type: "button", variant: "default", radius: 12, styles: qe, "data-shape": "path", children: [
          /* @__PURE__ */ n.jsx("span", { className: "shape-preset-icon", children: A("ph-bezier-curve") }),
          /* @__PURE__ */ n.jsx("span", { "data-i18n": "shapes.path", children: "Path" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ n.jsxs("section", { className: "add-section", id: "add-upload-section", hidden: !0, children: [
      /* @__PURE__ */ n.jsx("div", { className: "section-title", children: /* @__PURE__ */ n.jsx("h3", { children: /* @__PURE__ */ n.jsx("span", { "data-i18n": "toolbar.uploadsButton", children: "Uploads" }) }) }),
      /* @__PURE__ */ n.jsxs(
        or,
        {
          id: "upload-dropzone",
          className: "upload-dropzone",
          styles: ir,
          multiple: !1,
          dragEventsBubbling: !1,
          accept: { "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"], "image/webp": [".webp"], "image/gif": [".gif"], "image/svg+xml": [".svg"] },
          inputProps: { id: "image-file" },
          onDrop: (e) => {
            e[0] && Dn?.(e[0]);
          },
          onReject: (e) => {
            const t = document.getElementById("upload-feedback");
            t && e[0] && (t.textContent = f("uploads.failed", { name: e[0].file.name }));
          },
          children: [
            A("ph-cloud-arrow-up"),
            /* @__PURE__ */ n.jsx("strong", { "data-i18n": "uploads.dropFiles", children: "Drop files here" }),
            /* @__PURE__ */ n.jsx("span", { "data-i18n": "uploads.orBrowse", children: "or browse images and SVG" })
          ]
        }
      ),
      /* @__PURE__ */ n.jsx("div", { id: "upload-feedback", className: "upload-feedback", "aria-live": "polite" })
    ] }),
    /* @__PURE__ */ n.jsxs("section", { className: "add-section", id: "add-template-section", hidden: !0, children: [
      /* @__PURE__ */ n.jsx("div", { className: "section-title", children: /* @__PURE__ */ n.jsx("h3", { children: /* @__PURE__ */ n.jsx("span", { "data-i18n": "toolbar.templatesButton", children: "Templates" }) }) }),
      /* @__PURE__ */ n.jsx("p", { className: "hint", "data-i18n": "templates.fillWorkspaceHint", children: "Fill project slots and render variants from this workspace." }),
      /* @__PURE__ */ n.jsxs(w, { id: "open-templates", className: "wide-action", type: "button", variant: "default", styles: Ae, children: [
        A("ph-layout"),
        /* @__PURE__ */ n.jsx("span", { "data-i18n": "templates.openTools", children: "Open template tools" })
      ] })
    ] }),
    /* @__PURE__ */ n.jsxs("section", { className: "add-section", id: "add-fonts-section", hidden: !0, children: [
      /* @__PURE__ */ n.jsx("div", { className: "section-title", children: /* @__PURE__ */ n.jsx("h3", { children: /* @__PURE__ */ n.jsx("span", { "data-i18n": "toolbar.fontsButton", children: "Fonts" }) }) }),
      /* @__PURE__ */ n.jsx("p", { className: "hint", "data-i18n": "fonts.rendererHint", children: "The families the renderer draws with. Imported files are copied into the workspace font store." }),
      /* @__PURE__ */ n.jsx("div", { id: "fonts-mantine-mount" })
    ] })
  ] });
}
function pr() {
  const e = document.getElementById("chrome-header-root"), t = document.getElementById("chrome-toolrail-root"), s = document.getElementById("chrome-add-root");
  if (!(e instanceof HTMLElement) || !(t instanceof HTMLElement) || !(s instanceof HTMLElement))
    throw new Error("Missing editor chrome mounts");
  ee("chrome-header", e, /* @__PURE__ */ n.jsx(lr, {})), ee("chrome-tools", t, /* @__PURE__ */ n.jsx(dr, {})), ee("chrome-add", s, /* @__PURE__ */ n.jsx(ur, {}));
}
const Xe = (e) => /* @__PURE__ */ n.jsx("i", { className: `ph ${e}`, "aria-hidden": "true" });
function fr() {
  return Ne(), /* @__PURE__ */ n.jsxs(n.Fragment, { children: [
    /* @__PURE__ */ n.jsxs("div", { id: "canvas-empty", className: "canvas-empty", children: [
      /* @__PURE__ */ n.jsx("div", { className: "empty-mark", children: Xe("ph-sparkle") }),
      /* @__PURE__ */ n.jsx("p", { className: "eyebrow", children: f("editor.structuredEyebrow") }),
      /* @__PURE__ */ n.jsxs("h1", { children: [
        f("editor.emptyTitleFirst"),
        /* @__PURE__ */ n.jsx("br", {}),
        f("editor.emptyTitleSecond")
      ] }),
      /* @__PURE__ */ n.jsx("p", { children: f("editor.emptyDescription") }),
      /* @__PURE__ */ n.jsxs(w, { id: "empty-create", className: "button button-primary", type: "button", variant: "filled", children: [
        Xe("ph-plus"),
        " ",
        f("editor.createProject")
      ] }),
      /* @__PURE__ */ n.jsx("div", { id: "recents-mount" })
    ] }),
    /* @__PURE__ */ n.jsxs("div", { id: "canvas", hidden: !0, tabIndex: 0, "aria-label": f("canvas.label"), children: [
      /* @__PURE__ */ n.jsx("img", { id: "canvas-image", alt: "" }),
      /* @__PURE__ */ n.jsx("div", { id: "overlay" })
    ] })
  ] });
}
function mr() {
  return Ne(), /* @__PURE__ */ n.jsxs(n.Fragment, { children: [
    /* @__PURE__ */ n.jsxs("div", { className: "zoom-controls", role: "group", "aria-label": f("canvas.zoomLabel"), children: [
      /* @__PURE__ */ n.jsx(Y, { id: "zoom-out", type: "button", size: 36, variant: "default", title: f("canvas.zoomOut"), "aria-label": f("canvas.zoomOut"), children: Xe("ph-minus") }),
      /* @__PURE__ */ n.jsx(w, { id: "zoom-value", type: "button", title: f("canvas.zoomCurrent"), variant: "default", children: f("canvas.zoomFit") }),
      /* @__PURE__ */ n.jsx(Y, { id: "zoom-in", type: "button", size: 36, variant: "default", title: f("canvas.zoomIn"), "aria-label": f("canvas.zoomIn"), children: Xe("ph-plus") }),
      /* @__PURE__ */ n.jsx(w, { id: "zoom-100", type: "button", title: f("canvas.zoomSet100"), variant: "default", children: "100%" })
    ] }),
    /* @__PURE__ */ n.jsx("p", { id: "canvas-hints", className: "canvas-hints", hidden: !0, children: f("canvas.panHint") })
  ] });
}
function hr(e) {
  ee("canvas-surface", e, /* @__PURE__ */ n.jsx(fr, {}));
}
function gr(e) {
  ee("canvas-controls", e, /* @__PURE__ */ n.jsx(mr, {}));
}
function yr({
  projects: e,
  onOpen: t,
  onRename: s,
  onDelete: r
}) {
  return Ne(), /* @__PURE__ */ n.jsx(
    Et,
    {
      id: "recents",
      className: "recents",
      type: "container",
      cols: { base: 1, "30rem": 2 },
      spacing: "sm",
      "aria-label": f("projects.recentLabel"),
      hidden: e.length < 2,
      children: e.map(({ project: a, thumbnail: i }) => {
        const l = a.name ?? a.id;
        return /* @__PURE__ */ n.jsxs(Le, { component: "article", className: "recent-card", withBorder: !0, radius: "md", padding: "xs", children: [
          /* @__PURE__ */ n.jsx(
            qn,
            {
              className: "recent",
              type: "button",
              title: `${l} — ${Kt("projects.layerCount", a.layers)}`,
              onClick: () => t(a.id),
              children: /* @__PURE__ */ n.jsxs(Kn, { gap: "xs", children: [
                i && /* @__PURE__ */ n.jsx(
                  nt,
                  {
                    className: "recent-thumbnail",
                    src: i,
                    alt: "",
                    h: 64,
                    fit: "contain",
                    styles: { root: { backgroundColor: "var(--color-canvas)" } }
                  }
                ),
                /* @__PURE__ */ n.jsx(O, { size: "sm", fw: 600, lineClamp: 1, children: l })
              ] })
            }
          ),
          /* @__PURE__ */ n.jsxs(qt, { className: "recent-controls", gap: "xs", grow: !0, wrap: "nowrap", children: [
            /* @__PURE__ */ n.jsx(
              w,
              {
                className: "small recent-rename",
                type: "button",
                size: "xs",
                variant: "subtle",
                title: f("projects.renameNamed", { name: l }),
                onClick: () => s(a.id, a.name ?? null),
                children: f("projects.rename")
              }
            ),
            /* @__PURE__ */ n.jsx(
              w,
              {
                className: "small recent-delete",
                type: "button",
                size: "xs",
                variant: "subtle",
                title: f("projects.deleteNamed", { name: l }),
                onClick: () => r(a.id, a.name ?? null),
                children: f("common.delete")
              }
            )
          ] })
        ] }, a.id);
      })
    }
  );
}
function Sr(e, t, s, r, a) {
  ee(
    "recent-projects",
    e,
    /* @__PURE__ */ n.jsx(yr, { projects: t, onOpen: s, onRename: r, onDelete: a })
  );
}
let Ee = {
  message: f("status.starting"),
  kind: "info",
  dimensions: null,
  agents: null,
  consentVisible: !1,
  banner: null
}, ht = "ph-check-circle", gt = "save.allChangesSaved", yt = null;
function Ce(e) {
  Ee = { ...Ee, ...e }, yt?.(Ee);
}
function br() {
  Ne();
  const [e, t] = c.useState({ icon: ht, key: gt });
  return c.useEffect(() => (bt = t, t({ icon: ht, key: gt }), () => {
    bt = null;
  }), []), /* @__PURE__ */ n.jsxs(n.Fragment, { children: [
    /* @__PURE__ */ n.jsx("i", { className: `ph ${e.icon}`, "aria-hidden": "true" }),
    /* @__PURE__ */ n.jsx("span", { children: f(e.key) })
  ] });
}
let bt = null;
function xr({ onConsent: e, onDismiss: t }) {
  Ne();
  const [s, r] = c.useState(Ee);
  c.useEffect(() => (yt = r, r(Ee), () => {
    yt = null;
  }), []);
  const a = s.agents, i = s.banner;
  return /* @__PURE__ */ n.jsxs(n.Fragment, { children: [
    /* @__PURE__ */ n.jsxs(
      "section",
      {
        id: "consent-bar",
        className: "notice-bar",
        hidden: !s.consentVisible,
        "aria-label": f("updates.consentLabel"),
        children: [
          /* @__PURE__ */ n.jsx(O, { className: "notice-text", children: f("updates.consentQuestion") }),
          /* @__PURE__ */ n.jsxs(qt, { className: "notice-actions", gap: "sm", justify: "flex-end", wrap: "wrap", children: [
            /* @__PURE__ */ n.jsx(
              w,
              {
                id: "consent-notify",
                className: "button button-primary",
                type: "button",
                variant: "filled",
                onClick: () => e("notify"),
                children: f("updates.checkButton")
              }
            ),
            /* @__PURE__ */ n.jsx(
              w,
              {
                id: "consent-off",
                className: "button button-quiet",
                type: "button",
                variant: "subtle",
                onClick: () => e("off"),
                children: f("updates.dontCheckButton")
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ n.jsxs(
      "section",
      {
        id: "update-banner",
        className: "notice-bar update",
        hidden: !i,
        "aria-label": f("updates.newVersionLabel"),
        children: [
          /* @__PURE__ */ n.jsx("i", { className: "ph ph-arrow-circle-up", "aria-hidden": "true" }),
          /* @__PURE__ */ n.jsx(O, { id: "update-banner-text", className: "notice-text", "data-version": i?.version ?? "", children: i?.text ?? "" }),
          i?.notesUrl ? /* @__PURE__ */ n.jsx(Je, { id: "update-banner-link", href: i.notesUrl, target: "_blank", rel: "noopener noreferrer", children: f("updates.releaseNotes") }) : /* @__PURE__ */ n.jsx(Je, { id: "update-banner-link", hidden: !0, target: "_blank", rel: "noopener noreferrer", children: f("updates.releaseNotes") }),
          /* @__PURE__ */ n.jsx(
            Y,
            {
              id: "update-banner-dismiss",
              className: "icon-button",
              type: "button",
              variant: "subtle",
              title: f("updates.dismiss"),
              "aria-label": f("updates.dismissShort"),
              onClick: () => i && t(i.version),
              children: /* @__PURE__ */ n.jsx("i", { className: "ph ph-x", "aria-hidden": "true" })
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ n.jsxs("footer", { className: "statusbar", children: [
      /* @__PURE__ */ n.jsx(O, { id: "status", component: "div", "data-kind": s.kind, "aria-live": "polite", children: s.message }),
      /* @__PURE__ */ n.jsx("span", { id: "agents-connected", className: "agents-connected", hidden: !a, children: a ? /* @__PURE__ */ n.jsxs(n.Fragment, { children: [
        /* @__PURE__ */ n.jsx("i", { className: "ph ph-robot", "aria-hidden": "true" }),
        /* @__PURE__ */ n.jsx("span", { children: Kt("agents.connected", a) })
      ] }) : null }),
      /* @__PURE__ */ n.jsx("span", { className: "statusbar-spacer" }),
      /* @__PURE__ */ n.jsx(O, { id: "document-dimensions", component: "span", children: s.dimensions ?? f("projects.noneOpen") })
    ] })
  ] });
}
function Ar(e, t, s) {
  ee(
    "status-chrome",
    e,
    /* @__PURE__ */ n.jsx(xr, { onConsent: t, onDismiss: s })
  );
}
function Ir(e, t = "info") {
  Ce({ message: e, kind: t });
}
function Rr(e) {
  Ce({ kind: e });
}
function kr() {
  return Ee.kind;
}
function zr(e) {
  Ce({ dimensions: e });
}
function Or(e) {
  Ce({ agents: e });
}
function Tr(e) {
  Ce({ consentVisible: e });
}
function Br(e) {
  Ce({ banner: e });
}
function Lr(e, t) {
  ht = e, gt = t, bt?.({ icon: e, key: t });
}
function vr(e) {
  ee("save-indicator", e, /* @__PURE__ */ n.jsx(br, {}));
}
const jr = [
  ["top-left", "ph-arrow-up-left", "position.topLeft"],
  ["top-center", "ph-arrow-up", "position.topCenter"],
  ["top-right", "ph-arrow-up-right", "position.topRight"],
  ["middle-left", "ph-arrow-left", "position.middleLeft"],
  ["center", "ph-crosshair-simple", "position.center"],
  ["middle-right", "ph-arrow-right", "position.middleRight"],
  ["bottom-left", "ph-arrow-down-left", "position.bottomLeft"],
  ["bottom-center", "ph-arrow-down", "position.bottomCenter"],
  ["bottom-right", "ph-arrow-down-right", "position.bottomRight"]
], wr = [
  ["align-left", "position.left"],
  ["align-center-horizontal", "position.centers"],
  ["align-right", "position.right"],
  ["align-top", "position.top"],
  ["align-center-vertical", "position.middles"],
  ["align-bottom", "position.bottom"]
];
let et = !1, xt = null;
function _r(e) {
  et = e, xt?.(e);
}
function Mr() {
  return et;
}
function Er() {
  Ne();
  const [e, t] = c.useState(et);
  return c.useEffect(() => (xt = t, t(et), () => {
    xt = null;
  }), []), /* @__PURE__ */ n.jsxs(Gt, { id: "position-popover", className: "position-popover", shadow: "md", hidden: !e, children: [
    /* @__PURE__ */ n.jsxs("div", { className: "popover-heading", children: [
      /* @__PURE__ */ n.jsx(O, { component: "strong", children: f("position.title") }),
      /* @__PURE__ */ n.jsx(Y, { id: "position-close", className: "icon-button", type: "button", variant: "subtle", title: f("position.close"), "aria-label": f("position.close"), children: /* @__PURE__ */ n.jsx("i", { className: "ph ph-x", "aria-hidden": "true" }) })
    ] }),
    /* @__PURE__ */ n.jsxs("section", { children: [
      /* @__PURE__ */ n.jsx(O, { component: "h3", children: f("position.alignCanvas") }),
      /* @__PURE__ */ n.jsx("div", { className: "anchor-grid", children: jr.map(([s, r, a]) => /* @__PURE__ */ n.jsx(
        Y,
        {
          type: "button",
          variant: "default",
          "data-canvas-anchor": s,
          title: f(a),
          "aria-label": f(a),
          children: /* @__PURE__ */ n.jsx("i", { className: `ph ${r}`, "aria-hidden": "true" })
        },
        s
      )) })
    ] }),
    /* @__PURE__ */ n.jsxs("section", { children: [
      /* @__PURE__ */ n.jsx(O, { component: "h3", children: f("position.alignSelection") }),
      /* @__PURE__ */ n.jsx("div", { className: "popover-actions", children: wr.map(([s, r]) => /* @__PURE__ */ n.jsx(w, { type: "button", variant: "default", "data-layout": s, children: f(r) }, s)) })
    ] }),
    /* @__PURE__ */ n.jsxs("section", { children: [
      /* @__PURE__ */ n.jsx(O, { component: "h3", children: f("position.distribute") }),
      /* @__PURE__ */ n.jsxs("div", { className: "popover-actions two", children: [
        /* @__PURE__ */ n.jsxs(w, { type: "button", variant: "default", "data-layout": "distribute-horizontal", children: [
          /* @__PURE__ */ n.jsx("i", { className: "ph ph-columns", "aria-hidden": "true" }),
          " ",
          f("position.horizontal")
        ] }),
        /* @__PURE__ */ n.jsxs(w, { type: "button", variant: "default", "data-layout": "distribute-vertical", children: [
          /* @__PURE__ */ n.jsx("i", { className: "ph ph-rows", "aria-hidden": "true" }),
          " ",
          f("position.vertical")
        ] })
      ] })
    ] }),
    /* @__PURE__ */ n.jsxs("section", { children: [
      /* @__PURE__ */ n.jsx(O, { component: "h3", children: f("position.size") }),
      /* @__PURE__ */ n.jsx("div", { id: "position-fields", className: "position-fields" })
    ] })
  ] });
}
function Dr(e) {
  ee("position-popover", e, /* @__PURE__ */ n.jsx(Er, {}));
}
const Nn = document.getElementById("mantine-root");
if (!(Nn instanceof HTMLElement)) throw new Error("Missing Mantine root");
const Cn = document.getElementById("canvas-surface-root");
if (!(Cn instanceof HTMLElement)) throw new Error("Missing canvas surface mount");
const Fn = document.getElementById("canvas-controls-root");
if (!(Fn instanceof HTMLElement)) throw new Error("Missing canvas controls mount");
Yn(Nn);
pr();
hr(Cn);
gr(Fn);
const Pn = document.getElementById("save-state");
if (!(Pn instanceof HTMLElement)) throw new Error("Missing save indicator mount");
vr(Pn);
const Sn = document.getElementById("position-popover-root");
if (!(Sn instanceof HTMLElement)) throw new Error("Missing position popover mount");
Dr(Sn);
import("./chunk-app.js");
export {
  Xt as O,
  Et as S,
  Re as a,
  Ze as b,
  Yt as c,
  kr as d,
  Ar as e,
  Lr as f,
  jt as g,
  Tr as h,
  Zn as i,
  _r as j,
  Ir as k,
  Br as l,
  es as m,
  Or as n,
  Sr as o,
  Mr as p,
  zr as q,
  Pr as r,
  Rr as s,
  Fr as u
};
