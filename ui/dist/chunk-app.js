import { r as p, F as Wp, H as jn, t as Yo, v as qt, R as mn, M as qp, J as Kp, f as ae, u as Q, w as ri, y as ur, K as si, j as c, B as ee, N as su, a as Me, c as _e, o as Ae, z as cs, d as rn, b as dr, O as au, n as St, x as Xo, P as On, l as iu, E as Yp, Q as Xp, V as Gp, W as Jp, I as Zp, C as Qp, U as zn, X as Rn, g as it, h as Fe, Y as Wr, Z as ls, _ as jo, e as cu, $ as eh, A as Wo, L as th, m as Ue, i as ze, T as ne, S as me, k as le, G as Ne, a0 as nh, a1 as ai } from "./chunk-mantine-root.js";
import { m as lu, i as uu, c as Jt, u as We, O as ii, a as du, g as ko, b as fu, S as us, s as oh, d as rh, e as sh, p as ci, f as ah, h as pu, j as ih, k as ch, l as hu, n as Rc, o as lh, q as li, r as uh } from "./chunk-main.js";
import { a as et, u as Pt, C as ds, I as Nt, b as dh, d as fh, c as Ct, r as Nc, T as Tc } from "./chunk-Title.js";
import { t as y, formatNumber as je, formatCount as Lt, getLocale as ui, setLocale as ph } from "./i18n.js";
function qr(e, t) {
  return (n) => {
    if (typeof n != "string" || n.trim().length === 0) throw new Error(t);
    return `${e}-${n}`;
  };
}
function Go(e, t) {
  let n = e;
  for (; (n = n.parentElement) && !n.matches(t); ) ;
  return n;
}
function Pc(e, t, n) {
  for (let o = e - 1; o >= 0; o -= 1) if (!t[o].disabled) return o;
  if (n) {
    for (let o = t.length - 1; o > -1; o -= 1) if (!t[o].disabled) return o;
  }
  return e;
}
function Ac(e, t, n) {
  for (let o = e + 1; o < t.length; o += 1) if (!t[o].disabled) return o;
  if (n) {
    for (let o = 0; o < t.length; o += 1) if (!t[o].disabled) return o;
  }
  return e;
}
function hh(e, t, n) {
  return Go(e, n) === Go(t, n);
}
function mu({ parentSelector: e, siblingSelector: t, onKeyDown: n, loop: o = !0, activateOnFocus: r = !1, dir: s = "rtl", orientation: a }) {
  return (i) => {
    n?.(i);
    const l = Array.from(Go(i.currentTarget, e)?.querySelectorAll(t) || []).filter((g) => hh(i.currentTarget, g, e)), u = l.findIndex((g) => i.currentTarget === g), f = Ac(u, l, o), h = Pc(u, l, o), d = s === "rtl" ? h : f, m = s === "rtl" ? f : h;
    switch (i.key) {
      case "ArrowRight":
        a === "horizontal" && (i.stopPropagation(), i.preventDefault(), l[d].focus(), r && l[d].click());
        break;
      case "ArrowLeft":
        a === "horizontal" && (i.stopPropagation(), i.preventDefault(), l[m].focus(), r && l[m].click());
        break;
      case "ArrowUp":
        a === "vertical" && (i.stopPropagation(), i.preventDefault(), l[h].focus(), r && l[h].click());
        break;
      case "ArrowDown":
        a === "vertical" && (i.stopPropagation(), i.preventDefault(), l[f].focus(), r && l[f].click());
        break;
      case "Home":
        i.stopPropagation(), i.preventDefault(), l[Ac(-1, l, !1)]?.focus();
        break;
      case "End":
        i.stopPropagation(), i.preventDefault(), l[Pc(l.length, l, !1)]?.focus();
    }
  };
}
const Kr = () => {
};
function mh(e, t = { active: !0 }) {
  return typeof e != "function" || !t.active ? t.onKeyDown || Kr : (n) => {
    n.key === "Escape" && (e(n), t.onTrigger?.());
  };
}
function no(e, t) {
  return (n) => {
    e?.(n), t?.(n);
  };
}
function xn(e, t, n) {
  return t === void 0 && n === void 0 ? e : t !== void 0 && n === void 0 ? Math.max(e, t) : Math.min(t === void 0 && n !== void 0 ? e : Math.max(e, t), n);
}
function gh(e, t) {
  if (e === t || Number.isNaN(e) && Number.isNaN(t)) return !0;
  if (!(e instanceof Object) || !(t instanceof Object)) return !1;
  const n = Object.keys(e), { length: o } = n;
  if (o !== Object.keys(t).length) return !1;
  for (let r = 0; r < o; r += 1) {
    const s = n[r];
    if (!(s in t) || e[s] !== t[s] && !(Number.isNaN(e[s]) && Number.isNaN(t[s]))) return !1;
  }
  return !0;
}
function uo(e) {
  const t = p.useRef(e);
  return p.useEffect(() => {
    t.current = e;
  }), p.useMemo(() => ((...n) => t.current?.(...n)), []);
}
function fs(e, t) {
  const { delay: n, flushOnUnmount: o, leading: r, maxWait: s } = typeof t == "number" ? {
    delay: t,
    flushOnUnmount: !1,
    leading: !1,
    maxWait: void 0
  } : t, a = uo(e), i = p.useRef(0), l = p.useRef(0), u = p.useRef(null), f = p.useMemo(() => {
    const h = Object.assign((...d) => {
      window.clearTimeout(i.current), u.current = d;
      const m = h._isFirstCall;
      h._isFirstCall = !1;
      function g() {
        window.clearTimeout(i.current), window.clearTimeout(l.current), i.current = 0, l.current = 0, h._isFirstCall = !0, h._hasPendingCallback = !1;
      }
      function b() {
        s !== void 0 && l.current === 0 && (l.current = window.setTimeout(() => {
          if (i.current !== 0) {
            const k = u.current;
            g(), a(...k);
          }
        }, s));
      }
      if (r && m) {
        a(...d);
        const k = () => {
          g();
        }, S = () => {
          i.current !== 0 && (g(), a(...d));
        }, j = () => {
          g();
        };
        h.flush = S, h.cancel = j, i.current = window.setTimeout(k, n), b();
        return;
      }
      if (r && !m) {
        h._hasPendingCallback = !0;
        const k = () => {
          i.current !== 0 && (g(), a(...d));
        }, S = () => {
          g();
        };
        h.flush = k, h.cancel = S;
        const j = () => {
          g();
        };
        i.current = window.setTimeout(j, n), b();
        return;
      }
      h._hasPendingCallback = !0;
      const x = () => {
        i.current !== 0 && (g(), a(...d));
      }, w = () => {
        g();
      };
      h.flush = x, h.cancel = w, i.current = window.setTimeout(x, n), b();
    }, {
      flush: () => {
      },
      cancel: () => {
      },
      isPending: () => h._hasPendingCallback,
      _isFirstCall: !0,
      _hasPendingCallback: !1
    });
    return h;
  }, [
    a,
    n,
    r,
    s
  ]);
  return p.useEffect(() => () => {
    o ? f.flush() : f.cancel();
  }, [f, o]), f;
}
const vh = ["mousedown", "touchstart"];
function gu(e, t, n, o = !0, r = !1) {
  const s = p.useRef(null), a = t || vh, i = p.useEffectEvent((u) => {
    const { target: f } = u ?? {};
    if (!document.body.contains(f) && f?.tagName !== "HTML") return;
    const h = u.composedPath();
    Array.isArray(n) ? n.every((d) => !!d && !h.includes(d)) && e(u) : s.current && !h.includes(s.current) && e(u);
  }), l = a.join(",");
  return p.useEffect(() => {
    if (!o) return;
    const u = l.split(",");
    return u.forEach((f) => document.addEventListener(f, i, r)), () => {
      u.forEach((f) => document.removeEventListener(f, i, r));
    };
  }, [
    l,
    o,
    r
  ]), s;
}
function yh(e, t) {
  return Wp("(prefers-color-scheme: dark)", e === "dark", t) ? "dark" : "light";
}
function vu({ opened: e, shouldReturnFocus: t = !0 }) {
  const n = p.useRef(null), o = () => {
    n.current && "focus" in n.current && typeof n.current.focus == "function" && n.current?.focus({ preventScroll: !0 });
  };
  return jn(() => {
    let r = -1;
    const s = (a) => {
      a.key === "Tab" && window.clearTimeout(r);
    };
    if (document.addEventListener("keydown", s), e) n.current = document.activeElement;
    else if (t) {
      const a = document.activeElement;
      r = window.setTimeout(() => {
        const i = document.activeElement;
        (i === null || i === document.body || i === a) && o();
      }, 10);
    }
    return () => {
      window.clearTimeout(r), document.removeEventListener("keydown", s);
    };
  }, [e, t]), o;
}
const bh = /input|select|textarea|button|object/, yu = "a, input, select, textarea, button, object, [tabindex]";
function wh(e) {
  return e.style.display === "none";
}
function xh(e) {
  if (e.getAttribute("aria-hidden") || e.getAttribute("hidden") || e.getAttribute("type") === "hidden") return !1;
  let t = e;
  for (; t && !(t === document.body || t.nodeType === 11); ) {
    if (wh(t)) return !1;
    t = t.parentNode;
  }
  return !0;
}
function bu(e) {
  let t = e.getAttribute("tabindex");
  return t === null && (t = void 0), parseInt(t, 10);
}
function Ea(e) {
  const t = e.nodeName.toLowerCase(), n = !Number.isNaN(bu(e));
  return (bh.test(t) && !e.disabled || e instanceof HTMLAnchorElement && e.href || n) && xh(e);
}
function wu(e) {
  const t = bu(e);
  return (Number.isNaN(t) || t >= 0) && Ea(e);
}
function Sh(e) {
  return Array.from(e.querySelectorAll(yu)).filter(wu);
}
function Ch(e, t) {
  const n = Sh(e);
  if (!n.length) {
    t.preventDefault();
    return;
  }
  const o = n[t.shiftKey ? 0 : n.length - 1], r = e.getRootNode();
  let s = o === r.activeElement || e === r.activeElement;
  const a = r.activeElement;
  if (a.tagName === "INPUT" && a.getAttribute("type") === "radio" && (s = n.filter((l) => l.getAttribute("type") === "radio" && l.getAttribute("name") === a.getAttribute("name")).includes(o)), !s) return;
  t.preventDefault();
  const i = n[t.shiftKey ? n.length - 1 : 0];
  i && i.focus();
}
function jh(e = !0) {
  const t = p.useRef(null), n = (r) => {
    let s = r.querySelector("[data-autofocus]");
    if (!s) {
      const a = Array.from(r.querySelectorAll(yu));
      s = a.find(wu) || a.find(Ea) || null, !s && Ea(r) && (s = r);
    }
    s ? s.focus({ preventScroll: !0 }) : console.warn("[@mantine/hooks/use-focus-trap] Failed to find focusable element within provided node", r);
  }, o = p.useCallback((r) => {
    if (e) {
      if (r === null) {
        t.current = null;
        return;
      }
      t.current !== r && (setTimeout(() => {
        r.getRootNode() ? n(r) : console.warn("[@mantine/hooks/use-focus-trap] Ref node is not part of the dom", r);
      }), t.current = r);
    }
  }, [e]);
  return p.useEffect(() => {
    if (!e) return;
    t.current && setTimeout(() => {
      t.current && n(t.current);
    });
    const r = (s) => {
      s.key === "Tab" && t.current && Ch(t.current, s);
    };
    return document.addEventListener("keydown", r), () => document.removeEventListener("keydown", r);
  }, [e]), o;
}
const kh = (e) => (e + 1) % 1e6;
function Eh() {
  const [, e] = p.useReducer(kh, 0);
  return e;
}
function Rh(e, t, n) {
  const o = p.useEffectEvent(t);
  p.useEffect(() => (window.addEventListener(e, o, n), () => window.removeEventListener(e, o, n)), [e]);
}
function xu(e) {
  return {
    x: xn(e.x, 0, 1),
    y: xn(e.y, 0, 1)
  };
}
function Su(e, t, n = "ltr") {
  const o = p.useRef(!1), r = p.useRef(!1), s = p.useRef(0), a = p.useRef(null), [i, l] = p.useState(!1);
  return p.useEffect(() => (o.current = !0, () => {
    a.current?.();
  }), []), {
    ref: p.useCallback((u) => {
      const f = ({ x: S, y: j }) => {
        cancelAnimationFrame(s.current), s.current = requestAnimationFrame(() => {
          if (o.current && u) {
            u.style.userSelect = "none";
            const E = u.getBoundingClientRect();
            if (E.width && E.height) {
              const R = xn((S - E.left) / E.width, 0, 1);
              e({
                x: n === "ltr" ? R : 1 - R,
                y: xn((j - E.top) / E.height, 0, 1)
              });
            }
          }
        });
      }, h = () => {
        document.addEventListener("mousemove", x), document.addEventListener("mouseup", g), document.addEventListener("touchmove", k, { passive: !1 }), document.addEventListener("touchend", g);
      }, d = () => {
        document.removeEventListener("mousemove", x), document.removeEventListener("mouseup", g), document.removeEventListener("touchmove", k), document.removeEventListener("touchend", g);
      }, m = () => {
        !r.current && o.current && (r.current = !0, typeof t?.onScrubStart == "function" && t.onScrubStart(), l(!0), h());
      }, g = () => {
        r.current && o.current && (r.current = !1, l(!1), d(), setTimeout(() => {
          typeof t?.onScrubEnd == "function" && t.onScrubEnd();
        }, 0));
      }, b = (S) => {
        m(), S.preventDefault(), x(S);
      }, x = (S) => f({
        x: S.clientX,
        y: S.clientY
      }), w = (S) => {
        S.cancelable && S.preventDefault(), m(), k(S);
      }, k = (S) => {
        S.cancelable && S.preventDefault(), f({
          x: S.changedTouches[0].clientX,
          y: S.changedTouches[0].clientY
        });
      };
      return u?.addEventListener("mousedown", b), u?.addEventListener("touchstart", w, { passive: !1 }), a.current = () => {
        d(), cancelAnimationFrame(s.current);
      }, () => {
        u && (u.removeEventListener("mousedown", b), u.removeEventListener("touchstart", w));
      };
    }, [n, e]),
    active: i
  };
}
function Nh(e, t) {
  if (!e || !t) return !1;
  if (e === t) return !0;
  if (e.length !== t.length) return !1;
  for (let n = 0; n < e.length; n += 1) if (!gh(e[n], t[n])) return !1;
  return !0;
}
function Th(e) {
  const t = p.useRef([]), n = p.useRef(0);
  return Nh(t.current, e) || (t.current = e, n.current += 1), [n.current];
}
function Ic(e, t) {
  p.useEffect(e, Th(t));
}
function Ph(e, t, n = { autoInvoke: !1 }) {
  const o = p.useRef(null), r = uo(e), s = p.useCallback((...i) => {
    o.current || (o.current = window.setTimeout(() => {
      r(...i), o.current = null;
    }, t));
  }, [t]), a = p.useCallback(() => {
    o.current && (window.clearTimeout(o.current), o.current = null);
  }, []);
  return p.useEffect(() => (n.autoInvoke && s(), a), [a, s]), {
    start: s,
    clear: a
  };
}
function Ah(e) {
  const t = p.useRef(void 0);
  return p.useEffect(() => {
    t.current = e;
  }, [e]), t.current;
}
function Ih() {
  const [e, t] = p.useState(!1);
  return Yo(() => {
    t(typeof window < "u" && !Mh() && "EyeDropper" in window);
  }, []), {
    supported: e,
    open: p.useCallback((n = {}) => e ? new window.EyeDropper().open(n) : Promise.resolve(void 0), [e])
  };
}
function Mh() {
  return navigator.userAgent.includes("OPR");
}
function Dh(e, t, n) {
  const o = p.useRef(null);
  p.useEffect(() => {
    o.current && (o.current.disconnect(), o.current = null);
    const r = typeof n == "function" ? n() : n;
    return r && (o.current = new MutationObserver(e), o.current.observe(r, t)), () => {
      o.current && (o.current.disconnect(), o.current = null);
    };
  }, [
    e,
    t,
    n
  ]);
}
function Oh() {
  const [e, t] = p.useState(!1);
  return p.useEffect(() => t(!0), []), e;
}
const Lh = ["mouse", "touch"], $h = 10;
function _h(e, t = {}) {
  const { threshold: n = 400, events: o = Lh, cancelOnMove: r = !1, onStart: s, onFinish: a, onCancel: i } = t, l = p.useRef(!1), u = p.useRef(!1), f = p.useRef(-1), h = p.useRef(null);
  p.useEffect(() => () => window.clearTimeout(f.current), []);
  const d = o.join(",");
  return p.useMemo(() => {
    if (typeof e != "function") return {};
    const m = r !== !1, g = r === !0 ? $h : r === !1 ? 0 : r, b = (S) => {
      !Dc(S) && !Ra(S) || (s && s(S), h.current = Mc(S), u.current = !0, f.current = window.setTimeout(() => {
        e(S), l.current = !0;
      }, n));
    }, x = (S) => {
      !Dc(S) && !Ra(S) || (l.current ? a && a(S) : u.current && i && i(S), l.current = !1, u.current = !1, h.current = null, f.current !== -1 && (window.clearTimeout(f.current), f.current = -1));
    }, w = (S) => {
      if (!m || !u.current || l.current) return;
      const j = Mc(S);
      if (!j || !h.current) return;
      const E = j.x - h.current.x, R = j.y - h.current.y;
      Math.sqrt(E * E + R * R) > g && x(S);
    }, k = {};
    return o.includes("mouse") && (k.onMouseDown = b, k.onMouseUp = x, k.onMouseLeave = x, m && (k.onMouseMove = w)), o.includes("touch") && (k.onTouchStart = b, k.onTouchEnd = x, k.onTouchCancel = x, m && (k.onTouchMove = w)), k;
  }, [
    e,
    n,
    i,
    a,
    s,
    r,
    d
  ]);
}
function Mc(e) {
  if (Ra(e)) {
    const t = e.touches[0] ?? e.changedTouches[0];
    return t ? {
      x: t.clientX,
      y: t.clientY
    } : null;
  }
  return {
    x: e.clientX,
    y: e.clientY
  };
}
function Ra(e) {
  return window.TouchEvent ? e.nativeEvent instanceof TouchEvent : "touches" in e.nativeEvent;
}
function Dc(e) {
  return e.nativeEvent instanceof MouseEvent;
}
function zh(e) {
  if (!e || typeof e == "string") return 0;
  const t = e / 36;
  return Math.round((4 + 15 * t ** 0.25 + t / 5) * 10);
}
function ea(e) {
  return e.current ? e.current.scrollHeight : "auto";
}
function Yr(e) {
  return typeof e == "number" && e > 0;
}
function Fh({ transitionDuration: e, transitionTimingFunction: t = "ease", onTransitionEnd: n, onTransitionStart: o, expanded: r, keepMounted: s }) {
  const a = {
    height: 0,
    overflow: "hidden",
    ...s ? {} : { display: "none" }
  }, i = p.useEffectEvent(() => o?.()), l = p.useEffectEvent(() => n?.()), u = p.useRef(null), [f, h] = p.useState(r ? {} : a), [d, m] = p.useState(r ? "entered" : "exited"), g = (S) => {
    qt.flushSync(() => h(S));
  }, b = (S) => {
    g((j) => ({
      ...j,
      ...S
    }));
  }, x = (S) => {
    const j = e ?? zh(S);
    return { transition: `height ${j}ms ${t}, opacity ${j}ms ${t}` };
  }, w = p.useRef(0);
  jn(() => {
    w.current += 1;
    const S = w.current, j = () => w.current === S;
    e !== 0 && i(), r ? window.requestAnimationFrame(() => {
      !j() || !u.current || (qt.flushSync(() => m("entering")), b({
        willChange: "height",
        display: "block",
        overflow: "hidden"
      }), window.requestAnimationFrame(() => {
        if (!j() || !u.current) return;
        const E = ea(u);
        if (!Yr(E)) {
          g({}), m("entered"), l();
          return;
        }
        b({
          ...x(E),
          height: E
        });
      }));
    }) : window.requestAnimationFrame(() => {
      if (!j() || !u.current) return;
      qt.flushSync(() => m("exiting"));
      const E = ea(u);
      if (!Yr(E)) {
        g(a), m("exited"), l();
        return;
      }
      b({
        ...x(E),
        willChange: "height",
        height: E
      }), window.requestAnimationFrame(() => {
        !j() || !u.current || b({
          height: 0,
          overflow: "hidden"
        });
      });
    });
  }, [r]);
  const k = (S) => {
    if (!(S.target !== u.current || S.propertyName !== "height"))
      if (r) {
        const j = ea(u);
        j === f.height ? g({}) : b({ height: j }), m("entered"), l();
      } else f.height === 0 && (g(a), m("exited"), l());
  };
  return {
    state: d,
    getCollapseProps: (S) => ({
      "aria-hidden": !r,
      inert: !r,
      ref: lu(u, S?.ref),
      onTransitionEnd: k,
      style: {
        boxSizing: "border-box",
        ...S?.style,
        ...f
      }
    })
  };
}
function Bh(e) {
  if (!e || typeof e == "string") return 0;
  const t = e / 36;
  return Math.round((4 + 15 * t ** 0.25 + t / 5) * 10);
}
function ta(e) {
  return e.current ? e.current.scrollWidth : "auto";
}
function Vh({ transitionDuration: e, transitionTimingFunction: t = "ease", onTransitionEnd: n, onTransitionStart: o, expanded: r, keepMounted: s }) {
  const a = {
    width: 0,
    overflow: "hidden",
    ...s ? {} : { display: "none" }
  }, i = p.useEffectEvent(() => o?.()), l = p.useEffectEvent(() => n?.()), u = p.useRef(null), [f, h] = p.useState(r ? {} : a), [d, m] = p.useState(r ? "entered" : "exited"), g = (S) => {
    qt.flushSync(() => h(S));
  }, b = (S) => {
    g((j) => ({
      ...j,
      ...S
    }));
  }, x = (S) => {
    const j = e ?? Bh(S);
    return { transition: `width ${j}ms ${t}, opacity ${j}ms ${t}` };
  }, w = p.useRef(0);
  jn(() => {
    w.current += 1;
    const S = w.current, j = () => w.current === S;
    e !== 0 && i(), r ? window.requestAnimationFrame(() => {
      !j() || !u.current || (qt.flushSync(() => m("entering")), b({
        willChange: "width",
        display: "block",
        overflow: "hidden"
      }), window.requestAnimationFrame(() => {
        if (!j() || !u.current) return;
        const E = ta(u);
        if (!Yr(E)) {
          g({}), m("entered"), l();
          return;
        }
        b({
          ...x(E),
          width: E
        });
      }));
    }) : window.requestAnimationFrame(() => {
      if (!j() || !u.current) return;
      qt.flushSync(() => m("exiting"));
      const E = ta(u);
      if (!Yr(E)) {
        g(a), m("exited"), l();
        return;
      }
      b({
        ...x(E),
        willChange: "width",
        width: E
      }), window.requestAnimationFrame(() => {
        !j() || !u.current || b({
          width: 0,
          overflow: "hidden"
        });
      });
    });
  }, [r]);
  const k = (S) => {
    if (!(S.target !== u.current || S.propertyName !== "width"))
      if (r) {
        const j = ta(u);
        j === f.width ? g({}) : b({ width: j }), m("entered"), l();
      } else f.width === 0 && (g(a), m("exited"), l());
  };
  return {
    state: d,
    getCollapseProps: (S) => ({
      "aria-hidden": !r,
      inert: !r,
      ref: lu(u, S?.ref),
      onTransitionEnd: k,
      style: {
        boxSizing: "border-box",
        ...S?.style,
        ...f
      }
    })
  };
}
function Cu() {
  return typeof process < "u" && process.env, "development";
}
function ju(e) {
  const t = /* @__PURE__ */ new Map();
  return (...n) => {
    const o = JSON.stringify(n);
    if (t.has(o)) return t.get(o);
    const r = e(...n);
    return t.set(o, r), r;
  };
}
function ku(e) {
  const t = mn.version;
  return typeof mn.version != "string" || t.startsWith("18.") ? e?.ref : e?.props?.ref;
}
function Hh(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "bigint";
}
function Or(e, t = document) {
  const n = t.querySelector(e);
  if (n) return n;
  const o = t.querySelectorAll("*");
  for (let r = 0; r < o.length; r += 1) {
    const s = o[r];
    if (s.shadowRoot) {
      const a = Or(e, s.shadowRoot);
      if (a) return a;
    }
  }
  return null;
}
function Zt(e, t = document) {
  const n = [], o = t.querySelectorAll(e);
  n.push(...Array.from(o));
  const r = t.querySelectorAll("*");
  for (let s = 0; s < r.length; s += 1) {
    const a = r[s];
    if (a.shadowRoot) {
      const i = Zt(e, a.shadowRoot);
      n.push(...i);
    }
  }
  return n;
}
function Ut(e) {
  if (!e) return document;
  const t = e.getRootNode();
  return t instanceof ShadowRoot || t instanceof Document ? t : document;
}
function fr(e) {
  const t = p.Children.toArray(e);
  return t.length !== 1 || !uu(t[0]) ? null : t[0];
}
function pr(e, t) {
  return typeof e == "boolean" ? e : t.autoContrast;
}
function Oc(e) {
  const t = document.createElement("style");
  return t.setAttribute("data-mantine-styles", "inline"), t.innerHTML = "*, *::before, *::after {transition: none !important;}", t.setAttribute("data-mantine-disable-transition", "true"), e && t.setAttribute("nonce", e), document.head.appendChild(t), () => document.querySelectorAll("[data-mantine-disable-transition]").forEach((o) => o.remove());
}
function Uh({ keepTransitions: e } = {}) {
  const t = p.useRef(Kr), n = p.useRef(-1), o = p.use(qp), r = Kp(), s = p.useRef(r?.());
  if (!o) throw new Error("[@mantine/core] MantineProvider was not found in tree");
  const a = (h) => {
    o.setColorScheme(h), t.current = e ? () => {
    } : Oc(s.current), window.clearTimeout(n.current), n.current = window.setTimeout(() => {
      t.current?.();
    }, 10);
  }, i = () => {
    o.clearColorScheme(), t.current = e ? () => {
    } : Oc(s.current), window.clearTimeout(n.current), n.current = window.setTimeout(() => {
      t.current?.();
    }, 10);
  }, l = yh("light", { getInitialValueInEffect: !1 }), u = o.colorScheme === "auto" ? l : o.colorScheme, f = p.useCallback(() => a(u === "light" ? "dark" : "light"), [a, u]);
  return p.useEffect(() => () => {
    t.current?.(), window.clearTimeout(n.current);
  }, []), {
    colorScheme: o.colorScheme,
    setColorScheme: a,
    clearColorScheme: i,
    toggleColorScheme: f
  };
}
function Na(e, t) {
  return Array.isArray(e) ? [...e].reduce((n, o) => ({
    ...n,
    ...Na(o, t)
  }), {}) : typeof e == "function" ? e(t) : e ?? {};
}
const Wh = p.createContext({
  dir: "ltr",
  toggleDirection: () => {
  },
  setDirection: () => {
  }
});
function Eo() {
  return p.use(Wh);
}
const qh = {
  transitionDuration: 200,
  transitionTimingFunction: "ease",
  animateOpacity: !0,
  orientation: "vertical",
  keepMounted: !0,
  keepMountedMode: "activity"
}, Eu = ae((e) => {
  const { children: t, expanded: n, transitionDuration: o, transitionTimingFunction: r, style: s, onTransitionEnd: a, onTransitionStart: i, animateOpacity: l, keepMounted: u, keepMountedMode: f, ref: h, orientation: d, ...m } = Q("Collapse", qh, e), g = ri(), b = ur(), x = si(), w = b.respectReducedMotion && x ? 0 : o, k = (d === "horizontal" ? Vh : Fh)({
    expanded: n,
    transitionDuration: w,
    transitionTimingFunction: r,
    onTransitionEnd: a,
    onTransitionStart: i,
    keepMounted: !1
  });
  if (w === 0)
    return u === !0 && (f === "display-none" || g !== "test") ? f === "display-none" ? /* @__PURE__ */ c.jsx(ee, {
      ...m,
      style: {
        ...Na(s, b),
        ...n ? {} : { display: "none" }
      },
      ref: h,
      children: t
    }) : /* @__PURE__ */ c.jsx(p.Activity, {
      mode: n ? "visible" : "hidden",
      children: /* @__PURE__ */ c.jsx(ee, {
        ...m,
        style: s,
        ref: h,
        children: t
      })
    }) : n ? /* @__PURE__ */ c.jsx(ee, {
      ...m,
      style: s,
      ref: h,
      children: t
    }) : null;
  const S = k.state === "exited";
  let j;
  return u === !1 ? j = S ? null : t : u === !0 ? j = f === "display-none" ? t : /* @__PURE__ */ c.jsx(p.Activity, {
    mode: S ? "hidden" : "visible",
    children: t
  }) : j = t, /* @__PURE__ */ c.jsx(ee, {
    ...m,
    ...k.getCollapseProps({
      style: {
        opacity: n || !l ? 1 : 0,
        transition: l ? `opacity ${w}ms ${r}` : "none",
        ...Na(s, b),
        ...u && f === "display-none" && S ? { display: "none" } : {}
      },
      ref: h
    }),
    children: j
  });
});
Eu.displayName = "@mantine/core/Collapse";
const [Kh, At] = Jt("ScrollArea.Root component was not found in tree");
function kn(e, t) {
  const n = p.useEffectEvent(t);
  Yo(() => {
    let o = 0;
    if (e) {
      const r = new ResizeObserver(() => {
        cancelAnimationFrame(o), o = window.requestAnimationFrame(n);
      });
      return r.observe(e), () => {
        window.cancelAnimationFrame(o), r.unobserve(e);
      };
    }
  }, [e]);
}
function Yh(e) {
  const { style: t, ...n } = e, o = At(), [r, s] = p.useState(0), [a, i] = p.useState(0), l = !!(r && a);
  return kn(o.scrollbarX, () => {
    const u = o.scrollbarX?.offsetHeight || 0;
    o.onCornerHeightChange(u), i(u);
  }), kn(o.scrollbarY, () => {
    const u = o.scrollbarY?.offsetWidth || 0;
    o.onCornerWidthChange(u), s(u);
  }), l ? /* @__PURE__ */ c.jsx("div", {
    ...n,
    style: {
      ...t,
      width: r,
      height: a
    }
  }) : null;
}
function Xh(e) {
  const t = At(), n = !!(t.scrollbarX && t.scrollbarY);
  return t.type !== "scroll" && n ? /* @__PURE__ */ c.jsx(Yh, { ...e }) : null;
}
const Gh = {
  scrollHideDelay: 1e3,
  type: "hover"
};
function Ru(e) {
  const { type: t, scrollHideDelay: n, scrollbars: o, getStyles: r, ref: s, ...a } = Q("ScrollAreaRoot", Gh, e), [i, l] = p.useState(null), [u, f] = p.useState(null), [h, d] = p.useState(null), [m, g] = p.useState(null), [b, x] = p.useState(null), [w, k] = p.useState(0), [S, j] = p.useState(0), [E, R] = p.useState(!1), [P, v] = p.useState(!1), T = We(s, l);
  return /* @__PURE__ */ c.jsx(Kh, {
    value: {
      type: t,
      scrollHideDelay: n,
      scrollArea: i,
      viewport: u,
      onViewportChange: f,
      content: h,
      onContentChange: d,
      scrollbarX: m,
      onScrollbarXChange: g,
      scrollbarXEnabled: E,
      onScrollbarXEnabledChange: R,
      scrollbarY: b,
      onScrollbarYChange: x,
      scrollbarYEnabled: P,
      onScrollbarYEnabledChange: v,
      onCornerWidthChange: k,
      onCornerHeightChange: j,
      getStyles: r
    },
    children: /* @__PURE__ */ c.jsx(ee, {
      ...a,
      ref: T,
      __vars: {
        "--sa-corner-width": o !== "xy" ? "0px" : `${w}px`,
        "--sa-corner-height": o !== "xy" ? "0px" : `${S}px`
      }
    })
  });
}
Ru.displayName = "@mantine/core/ScrollAreaRoot";
function Nu(e, t) {
  const n = e / t;
  return Number.isNaN(n) ? 0 : n;
}
function ps(e) {
  const t = Nu(e.viewport, e.content), n = e.scrollbar.paddingStart + e.scrollbar.paddingEnd, o = (e.scrollbar.size - n) * t;
  return Math.max(o, 18);
}
function Tu(e, t) {
  return (n) => {
    if (e[0] === e[1] || t[0] === t[1]) return t[0];
    const o = (t[1] - t[0]) / (e[1] - e[0]);
    return t[0] + o * (n - e[0]);
  };
}
function Jh(e, [t, n]) {
  return Math.min(n, Math.max(t, e));
}
function Lc(e, t, n = "ltr") {
  const o = ps(t), r = t.scrollbar.paddingStart + t.scrollbar.paddingEnd, s = t.scrollbar.size - r, a = t.content - t.viewport, i = s - o, l = Jh(e, n === "ltr" ? [0, a] : [a * -1, 0]);
  return Tu([0, a], [0, i])(l);
}
function Zh(e, t, n, o = "ltr") {
  const r = ps(n), s = r / 2, a = t || s, i = r - a, l = n.scrollbar.paddingStart + a, u = n.scrollbar.size - n.scrollbar.paddingEnd - i, f = n.content - n.viewport, h = o === "ltr" ? [0, f] : [f * -1, 0];
  return Tu([l, u], h)(e);
}
function Pu(e, t) {
  return e > 0 && e < t;
}
function vn(e) {
  return e ? parseInt(e, 10) : 0;
}
function Ln(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
  return (o) => {
    e?.(o), (n === !1 || !o.defaultPrevented) && t?.(o);
  };
}
const [Qh, Au] = Jt("ScrollAreaScrollbar was not found in tree");
function Iu(e) {
  const { sizes: t, hasThumb: n, onThumbChange: o, onThumbPointerUp: r, onThumbPointerDown: s, onThumbPositionChange: a, onDragScroll: i, onWheelScroll: l, onResize: u, ref: f, ...h } = e, d = At(), [m, g] = p.useState(null), b = We(f, g), x = p.useRef(null), w = p.useRef(""), { viewport: k } = d, S = t.content - t.viewport, j = p.useEffectEvent(l), E = uo(a), R = fs(u, 10), P = (v) => {
    if (x.current) {
      const T = v.clientX - x.current.left, L = v.clientY - x.current.top;
      i({
        x: T,
        y: L
      });
    }
  };
  return p.useEffect(() => {
    const v = (T) => {
      const L = T.target;
      m?.contains(L) && j(T, S);
    };
    return document.addEventListener("wheel", v, { passive: !1 }), () => document.removeEventListener("wheel", v, { passive: !1 });
  }, [
    k,
    m,
    S
  ]), p.useEffect(E, [t, E]), kn(m, R), kn(d.content, R), /* @__PURE__ */ c.jsx(Qh, {
    value: {
      scrollbar: m,
      hasThumb: n,
      onThumbChange: uo(o),
      onThumbPointerUp: uo(r),
      onThumbPositionChange: E,
      onThumbPointerDown: uo(s)
    },
    children: /* @__PURE__ */ c.jsx("div", {
      ...h,
      ref: b,
      "data-mantine-scrollbar": !0,
      style: {
        position: "absolute",
        ...h.style
      },
      onPointerDown: Ln(e.onPointerDown, (v) => {
        v.preventDefault(), v.button === 0 && (v.target.setPointerCapture(v.pointerId), x.current = m.getBoundingClientRect(), w.current = document.body.style.webkitUserSelect, document.body.style.webkitUserSelect = "none", P(v));
      }),
      onPointerMove: Ln(e.onPointerMove, P),
      onPointerUp: Ln(e.onPointerUp, (v) => {
        const T = v.target;
        T.hasPointerCapture(v.pointerId) && (v.preventDefault(), T.releasePointerCapture(v.pointerId));
      }),
      onLostPointerCapture: () => {
        document.body.style.webkitUserSelect = w.current, x.current = null;
      }
    })
  });
}
const Mu = (e) => {
  const { sizes: t, onSizesChange: n, style: o, ref: r, ...s } = e, a = At(), [i, l] = p.useState(), u = p.useRef(null), f = We(r, u, a.onScrollbarXChange);
  return p.useEffect(() => {
    u.current && l(getComputedStyle(u.current));
  }, [u]), /* @__PURE__ */ c.jsx(Iu, {
    "data-orientation": "horizontal",
    ...s,
    ref: f,
    sizes: t,
    style: {
      ...o,
      "--sa-thumb-width": `${ps(t)}px`
    },
    onThumbPointerDown: (h) => e.onThumbPointerDown(h.x),
    onDragScroll: (h) => e.onDragScroll(h.x),
    onWheelScroll: (h, d) => {
      if (a.viewport) {
        const m = a.viewport.scrollLeft + h.deltaX;
        e.onWheelScroll(m), Pu(m, d) && h.preventDefault();
      }
    },
    onResize: () => {
      u.current && a.viewport && i && n({
        content: a.viewport.scrollWidth,
        viewport: a.viewport.offsetWidth,
        scrollbar: {
          size: u.current.clientWidth,
          paddingStart: vn(i.paddingLeft),
          paddingEnd: vn(i.paddingRight)
        }
      });
    }
  });
};
Mu.displayName = "@mantine/core/ScrollAreaScrollbarX";
function Du(e) {
  const { sizes: t, onSizesChange: n, style: o, ref: r, ...s } = e, a = At(), [i, l] = p.useState(), u = p.useRef(null), f = We(r, u, a.onScrollbarYChange);
  return p.useEffect(() => {
    u.current && l(window.getComputedStyle(u.current));
  }, []), /* @__PURE__ */ c.jsx(Iu, {
    ...s,
    "data-orientation": "vertical",
    ref: f,
    sizes: t,
    style: {
      "--sa-thumb-height": `${ps(t)}px`,
      ...o
    },
    onThumbPointerDown: (h) => e.onThumbPointerDown(h.y),
    onDragScroll: (h) => e.onDragScroll(h.y),
    onWheelScroll: (h, d) => {
      if (a.viewport) {
        const m = a.viewport.scrollTop + h.deltaY;
        e.onWheelScroll(m), Pu(m, d) && h.preventDefault();
      }
    },
    onResize: () => {
      u.current && a.viewport && i && n({
        content: a.viewport.scrollHeight,
        viewport: a.viewport.offsetHeight,
        scrollbar: {
          size: u.current.clientHeight,
          paddingStart: vn(i.paddingTop),
          paddingEnd: vn(i.paddingBottom)
        }
      });
    }
  });
}
Du.displayName = "@mantine/core/ScrollAreaScrollbarY";
function hs(e) {
  const { orientation: t = "vertical", ...n } = e, { dir: o } = Eo(), r = At(), s = p.useRef(null), a = p.useRef(0), [i, l] = p.useState({
    content: 0,
    viewport: 0,
    scrollbar: {
      size: 0,
      paddingStart: 0,
      paddingEnd: 0
    }
  }), u = Nu(i.viewport, i.content), f = {
    ...n,
    sizes: i,
    onSizesChange: l,
    hasThumb: u > 0 && u < 1,
    onThumbChange: (d) => {
      s.current = d;
    },
    onThumbPointerUp: () => {
      a.current = 0;
    },
    onThumbPointerDown: (d) => {
      a.current = d;
    }
  }, h = (d, m) => Zh(d, a.current, i, m);
  return t === "horizontal" ? /* @__PURE__ */ c.jsx(Mu, {
    ...f,
    onThumbPositionChange: () => {
      if (r.viewport && s.current) {
        const d = r.viewport.scrollLeft, m = Lc(d, i, o);
        s.current.style.transform = `translate3d(${m}px, 0, 0)`;
      }
    },
    onWheelScroll: (d) => {
      r.viewport && (r.viewport.scrollLeft = d);
    },
    onDragScroll: (d) => {
      r.viewport && (r.viewport.scrollLeft = h(d, o));
    }
  }) : t === "vertical" ? /* @__PURE__ */ c.jsx(Du, {
    ...f,
    onThumbPositionChange: () => {
      if (r.viewport && s.current) {
        const d = r.viewport.scrollTop, m = Lc(d, i);
        i.scrollbar.size === 0 ? s.current.style.setProperty("--thumb-opacity", "0") : s.current.style.setProperty("--thumb-opacity", "1"), s.current.style.transform = `translate3d(0, ${m}px, 0)`;
      }
    },
    onWheelScroll: (d) => {
      r.viewport && (r.viewport.scrollTop = d);
    },
    onDragScroll: (d) => {
      r.viewport && (r.viewport.scrollTop = h(d));
    }
  }) : null;
}
hs.displayName = "@mantine/core/ScrollAreaScrollbarVisible";
function di(e) {
  const t = At(), { forceMount: n, ...o } = e, [r, s] = p.useState(!1), a = e.orientation === "horizontal", i = fs(() => {
    if (t.viewport) {
      const l = t.viewport.offsetWidth < t.viewport.scrollWidth, u = t.viewport.offsetHeight < t.viewport.scrollHeight;
      s(a ? l : u);
    }
  }, 10);
  return kn(t.viewport, i), kn(t.content, i), n || r ? /* @__PURE__ */ c.jsx(hs, {
    "data-state": r ? "visible" : "hidden",
    ...o
  }) : null;
}
di.displayName = "@mantine/core/ScrollAreaScrollbarAuto";
function Ou(e) {
  const { forceMount: t, ...n } = e, o = At(), [r, s] = p.useState(!1);
  return p.useEffect(() => {
    const { scrollArea: a } = o;
    let i = 0;
    if (a) {
      const l = () => {
        window.clearTimeout(i), s(!0);
      }, u = () => {
        i = window.setTimeout(() => s(!1), o.scrollHideDelay);
      };
      return a.addEventListener("pointerenter", l), a.addEventListener("pointerleave", u), () => {
        window.clearTimeout(i), a.removeEventListener("pointerenter", l), a.removeEventListener("pointerleave", u);
      };
    }
  }, [o.scrollArea, o.scrollHideDelay]), t || r ? /* @__PURE__ */ c.jsx(di, {
    "data-state": r ? "visible" : "hidden",
    ...n
  }) : null;
}
Ou.displayName = "@mantine/core/ScrollAreaScrollbarHover";
function em(e) {
  const { forceMount: t, ...n } = e, o = At(), r = e.orientation === "horizontal", [s, a] = p.useState("hidden"), i = fs(() => a("idle"), 100);
  return p.useEffect(() => {
    if (s === "idle") {
      const l = window.setTimeout(() => a("hidden"), o.scrollHideDelay);
      return () => window.clearTimeout(l);
    }
  }, [s, o.scrollHideDelay]), p.useEffect(() => {
    const { viewport: l } = o, u = r ? "scrollLeft" : "scrollTop";
    if (l) {
      let f = l[u];
      const h = () => {
        const d = l[u];
        f !== d && (a("scrolling"), i()), f = d;
      };
      return l.addEventListener("scroll", h), () => l.removeEventListener("scroll", h);
    }
  }, [
    o.viewport,
    r,
    i
  ]), t || s !== "hidden" ? /* @__PURE__ */ c.jsx(hs, {
    "data-state": s === "hidden" ? "hidden" : "visible",
    ...n,
    onPointerEnter: Ln(e.onPointerEnter, () => a("interacting")),
    onPointerLeave: Ln(e.onPointerLeave, () => a("idle"))
  }) : null;
}
function Ta(e) {
  const { forceMount: t, ...n } = e, o = At(), { onScrollbarXEnabledChange: r, onScrollbarYEnabledChange: s } = o, a = e.orientation === "horizontal";
  return p.useEffect(() => (a ? r(!0) : s(!0), () => {
    a ? r(!1) : s(!1);
  }), [
    a,
    r,
    s
  ]), o.type === "hover" ? /* @__PURE__ */ c.jsx(Ou, {
    ...n,
    forceMount: t
  }) : o.type === "scroll" ? /* @__PURE__ */ c.jsx(em, {
    ...n,
    forceMount: t
  }) : o.type === "auto" ? /* @__PURE__ */ c.jsx(di, {
    ...n,
    forceMount: t
  }) : o.type === "always" ? /* @__PURE__ */ c.jsx(hs, { ...n }) : null;
}
Ta.displayName = "@mantine/core/ScrollAreaScrollbar";
function tm(e, t = () => {
}) {
  let n = {
    left: e.scrollLeft,
    top: e.scrollTop
  }, o = 0;
  return (function r() {
    const s = {
      left: e.scrollLeft,
      top: e.scrollTop
    }, a = n.left !== s.left, i = n.top !== s.top;
    (a || i) && t(), n = s, o = window.requestAnimationFrame(r);
  })(), () => window.cancelAnimationFrame(o);
}
function Lu(e) {
  const { style: t, ref: n, ...o } = e, r = At(), s = Au(), { onThumbPositionChange: a } = s, i = We(n, s.onThumbChange), l = p.useRef(void 0), u = fs(() => {
    l.current && (l.current(), l.current = void 0);
  }, 100);
  return p.useEffect(() => {
    const { viewport: f } = r;
    if (f) {
      const h = () => {
        if (u(), !l.current) {
          const d = tm(f, a);
          l.current = d, a();
        }
      };
      return a(), f.addEventListener("scroll", h), () => f.removeEventListener("scroll", h);
    }
  }, [
    r.viewport,
    u,
    a
  ]), /* @__PURE__ */ c.jsx("div", {
    "data-state": s.hasThumb ? "visible" : "hidden",
    ...o,
    ref: i,
    style: {
      width: "var(--sa-thumb-width)",
      height: "var(--sa-thumb-height)",
      ...t
    },
    onPointerDownCapture: Ln(e.onPointerDownCapture, (f) => {
      const h = f.target.getBoundingClientRect(), d = f.clientX - h.left, m = f.clientY - h.top;
      s.onThumbPointerDown({
        x: d,
        y: m
      });
    }),
    onPointerUp: Ln(e.onPointerUp, s.onThumbPointerUp)
  });
}
Lu.displayName = "@mantine/core/ScrollAreaThumb";
function Pa(e) {
  const { forceMount: t, ...n } = e, o = Au();
  return t || o.hasThumb ? /* @__PURE__ */ c.jsx(Lu, { ...n }) : null;
}
Pa.displayName = "@mantine/core/ScrollAreaThumb";
function $u({ children: e, style: t, ref: n, onWheel: o, ...r }) {
  const s = At(), a = We(n, s.onViewportChange), i = (l) => {
    if (o?.(l), s.scrollbarXEnabled && s.viewport && l.shiftKey) {
      const { scrollTop: u, scrollHeight: f, clientHeight: h, scrollWidth: d, clientWidth: m } = s.viewport, g = u < 1, b = u >= f - h - 1;
      d > m && (g || b) && l.stopPropagation();
    }
  };
  return /* @__PURE__ */ c.jsx(ee, {
    ...r,
    ref: a,
    onWheel: i,
    "data-scrollarea-viewport": !0,
    style: {
      overflowX: s.scrollbarXEnabled ? "scroll" : "hidden",
      overflowY: s.scrollbarYEnabled ? "scroll" : "hidden",
      ...t
    },
    children: /* @__PURE__ */ c.jsx("div", {
      ...s.getStyles("content"),
      ref: s.onContentChange,
      children: e
    })
  });
}
$u.displayName = "@mantine/core/ScrollAreaViewport";
var fi = {
  root: "m_d57069b5",
  content: "m_b1336c6",
  viewport: "m_c0783ff9",
  viewportInner: "m_f8f631dd",
  scrollbar: "m_c44ba933",
  thumb: "m_d8b5e363",
  corner: "m_21657268"
};
function ms() {
  return typeof window < "u";
}
function Ro(e) {
  return _u(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function gt(e) {
  var t;
  return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function an(e) {
  var t;
  return (t = (_u(e) ? e.ownerDocument : e.document) || window.document) == null ? void 0 : t.documentElement;
}
function _u(e) {
  return ms() ? e instanceof Node || e instanceof gt(e).Node : !1;
}
function mt(e) {
  return ms() ? e instanceof Element || e instanceof gt(e).Element : !1;
}
function Nn(e) {
  return ms() ? e instanceof HTMLElement || e instanceof gt(e).HTMLElement : !1;
}
function $c(e) {
  return !ms() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof gt(e).ShadowRoot;
}
function gs(e) {
  const {
    overflow: t,
    overflowX: n,
    overflowY: o,
    display: r
  } = Kt(e);
  return /auto|scroll|overlay|hidden|clip/.test(t + o + n) && r !== "inline" && r !== "contents";
}
function nm(e) {
  return /^(table|td|th)$/.test(Ro(e));
}
function vs(e) {
  try {
    if (e.matches(":popover-open"))
      return !0;
  } catch {
  }
  try {
    return e.matches(":modal");
  } catch {
    return !1;
  }
}
const om = /transform|translate|scale|rotate|perspective|filter/, rm = /paint|layout|strict|content/, Pn = (e) => !!e && e !== "none";
let na;
function pi(e) {
  const t = mt(e) ? Kt(e) : e;
  return Pn(t.transform) || Pn(t.translate) || Pn(t.scale) || Pn(t.rotate) || Pn(t.perspective) || !hi() && (Pn(t.backdropFilter) || Pn(t.filter)) || om.test(t.willChange || "") || rm.test(t.contain || "");
}
function sm(e) {
  let t = Fn(e);
  for (; Nn(t) && !Jo(t); ) {
    if (pi(t))
      return t;
    if (vs(t))
      return null;
    t = Fn(t);
  }
  return null;
}
function hi() {
  return na == null && (na = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), na;
}
function Jo(e) {
  return /^(html|body|#document)$/.test(Ro(e));
}
function Kt(e) {
  return gt(e).getComputedStyle(e);
}
function ys(e) {
  return mt(e) ? {
    scrollLeft: e.scrollLeft,
    scrollTop: e.scrollTop
  } : {
    scrollLeft: e.scrollX,
    scrollTop: e.scrollY
  };
}
function Fn(e) {
  if (Ro(e) === "html")
    return e;
  const t = (
    // Step into the shadow DOM of the parent of a slotted node.
    e.assignedSlot || // DOM Element detected.
    e.parentNode || // ShadowRoot detected.
    $c(e) && e.host || // Fallback.
    an(e)
  );
  return $c(t) ? t.host : t;
}
function zu(e) {
  const t = Fn(e);
  return Jo(t) ? (e.ownerDocument || e).body : Nn(t) && gs(t) ? t : zu(t);
}
function Zo(e, t, n) {
  var o;
  t === void 0 && (t = []), n === void 0 && (n = !0);
  const r = zu(e), s = r === ((o = e.ownerDocument) == null ? void 0 : o.body), a = gt(r);
  if (s) {
    const i = Aa(a);
    return t.concat(a, a.visualViewport || [], gs(r) ? r : [], i && n ? Zo(i) : []);
  } else
    return t.concat(r, Zo(r, [], n));
}
function Aa(e) {
  return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
const am = ["top", "right", "bottom", "left"], Bt = Math.min, Et = Math.max, Xr = Math.round, Pr = Math.floor, tn = (e) => ({
  x: e,
  y: e
}), im = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
function Fu(e, t, n) {
  return Et(e, Bt(t, n));
}
function Yt(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function Xt(e) {
  return e.split("-")[0];
}
function No(e) {
  return e.split("-")[1];
}
function mi(e) {
  return e === "x" ? "y" : "x";
}
function gi(e) {
  return e === "y" ? "height" : "width";
}
function $t(e) {
  const t = e[0];
  return t === "t" || t === "b" ? "y" : "x";
}
function vi(e) {
  return mi($t(e));
}
function cm(e, t, n) {
  n === void 0 && (n = !1);
  const o = No(e), r = vi(e), s = gi(r);
  let a = r === "x" ? o === (n ? "end" : "start") ? "right" : "left" : o === "start" ? "bottom" : "top";
  return t.reference[s] > t.floating[s] && (a = Gr(a)), [a, Gr(a)];
}
function lm(e) {
  const t = Gr(e);
  return [Ia(e), t, Ia(t)];
}
function Ia(e) {
  return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
const _c = ["left", "right"], zc = ["right", "left"], um = ["top", "bottom"], dm = ["bottom", "top"];
function fm(e, t, n) {
  switch (e) {
    case "top":
    case "bottom":
      return n ? t ? zc : _c : t ? _c : zc;
    case "left":
    case "right":
      return t ? um : dm;
    default:
      return [];
  }
}
function pm(e, t, n, o) {
  const r = No(e);
  let s = fm(Xt(e), n === "start", o);
  return r && (s = s.map((a) => a + "-" + r), t && (s = s.concat(s.map(Ia)))), s;
}
function Gr(e) {
  const t = Xt(e);
  return im[t] + e.slice(t.length);
}
function hm(e) {
  var t, n, o, r;
  return {
    top: (t = e.top) != null ? t : 0,
    right: (n = e.right) != null ? n : 0,
    bottom: (o = e.bottom) != null ? o : 0,
    left: (r = e.left) != null ? r : 0
  };
}
function yi(e) {
  return typeof e != "number" ? hm(e) : {
    top: e,
    right: e,
    bottom: e,
    left: e
  };
}
function Sn(e) {
  const {
    x: t,
    y: n,
    width: o,
    height: r
  } = e;
  return {
    width: o,
    height: r,
    top: n,
    left: t,
    right: t + o,
    bottom: n + r,
    x: t,
    y: n
  };
}
var mm = typeof document < "u", gm = function() {
}, Ma = mm ? p.useLayoutEffect : gm;
const vm = {
  ...su
}, ym = vm.useInsertionEffect, bm = ym || ((e) => e());
function wm(e) {
  const t = p.useRef(() => {
  });
  return bm(() => {
    t.current = e;
  }), p.useCallback(function() {
    for (var n = arguments.length, o = new Array(n), r = 0; r < n; r++)
      o[r] = arguments[r];
    return t.current == null ? void 0 : t.current(...o);
  }, []);
}
function Fc(e, t, n) {
  let {
    reference: o,
    floating: r
  } = e;
  const s = $t(t), a = vi(t), i = gi(a), l = Xt(t), u = s === "y", f = o.x + o.width / 2 - r.width / 2, h = o.y + o.height / 2 - r.height / 2, d = o[i] / 2 - r[i] / 2;
  let m;
  switch (l) {
    case "top":
      m = {
        x: f,
        y: o.y - r.height
      };
      break;
    case "bottom":
      m = {
        x: f,
        y: o.y + o.height
      };
      break;
    case "right":
      m = {
        x: o.x + o.width,
        y: h
      };
      break;
    case "left":
      m = {
        x: o.x - r.width,
        y: h
      };
      break;
    default:
      m = {
        x: o.x,
        y: o.y
      };
  }
  const g = No(t);
  return g && (m[a] += d * (g === "end" ? 1 : -1) * (n && u ? -1 : 1)), m;
}
async function xm(e, t) {
  var n;
  t === void 0 && (t = {});
  const {
    x: o,
    y: r,
    platform: s,
    rects: a,
    elements: i,
    strategy: l
  } = e, {
    boundary: u = "clippingAncestors",
    rootBoundary: f = "viewport",
    elementContext: h = "floating",
    altBoundary: d = !1,
    padding: m = 0
  } = Yt(t, e), g = yi(m), x = i[d ? h === "floating" ? "reference" : "floating" : h], w = Sn(await s.getClippingRect({
    element: (n = await (s.isElement == null ? void 0 : s.isElement(x))) == null || n ? x : x.contextElement || await (s.getDocumentElement == null ? void 0 : s.getDocumentElement(i.floating)),
    boundary: u,
    rootBoundary: f,
    strategy: l
  })), k = h === "floating" ? {
    x: o,
    y: r,
    width: a.floating.width,
    height: a.floating.height
  } : a.reference, S = await (s.getOffsetParent == null ? void 0 : s.getOffsetParent(i.floating)), j = await (s.isElement == null ? void 0 : s.isElement(S)) && await (s.getScale == null ? void 0 : s.getScale(S)) || {
    x: 1,
    y: 1
  }, E = Sn(s.convertOffsetParentRelativeRectToViewportRelativeRect ? await s.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements: i,
    rect: k,
    offsetParent: S,
    strategy: l
  }) : k);
  return {
    top: (w.top - E.top + g.top) / j.y,
    bottom: (E.bottom - w.bottom + g.bottom) / j.y,
    left: (w.left - E.left + g.left) / j.x,
    right: (E.right - w.right + g.right) / j.x
  };
}
const Sm = 50, Cm = async (e, t, n) => {
  const {
    placement: o = "bottom",
    strategy: r = "absolute",
    middleware: s = [],
    platform: a
  } = n, i = a.detectOverflow ? a : {
    ...a,
    detectOverflow: xm
  }, l = await (a.isRTL == null ? void 0 : a.isRTL(t));
  let u = await a.getElementRects({
    reference: e,
    floating: t,
    strategy: r
  }), {
    x: f,
    y: h
  } = Fc(u, o, l), d = o, m = 0;
  const g = {};
  for (let b = 0; b < s.length; b++) {
    const x = s[b];
    if (!x)
      continue;
    const {
      name: w,
      fn: k
    } = x, {
      x: S,
      y: j,
      data: E,
      reset: R
    } = await k({
      x: f,
      y: h,
      initialPlacement: o,
      placement: d,
      strategy: r,
      middlewareData: g,
      rects: u,
      platform: i,
      elements: {
        reference: e,
        floating: t
      }
    });
    f = S ?? f, h = j ?? h, g[w] = {
      ...g[w],
      ...E
    }, R && m < Sm && (m++, typeof R == "object" && (R.placement && (d = R.placement), R.rects && (u = R.rects === !0 ? await a.getElementRects({
      reference: e,
      floating: t,
      strategy: r
    }) : R.rects), {
      x: f,
      y: h
    } = Fc(u, d, l)), b = -1);
  }
  return {
    x: f,
    y: h,
    placement: d,
    strategy: r,
    middlewareData: g
  };
}, jm = (e) => ({
  name: "arrow",
  options: e,
  async fn(t) {
    const {
      x: n,
      y: o,
      placement: r,
      rects: s,
      platform: a,
      elements: i,
      middlewareData: l
    } = t, {
      element: u,
      padding: f = 0
    } = Yt(e, t) || {};
    if (u == null)
      return {};
    const h = yi(f), d = {
      x: n,
      y: o
    }, m = vi(r), g = gi(m), b = await a.getDimensions(u), x = m === "y", w = x ? "top" : "left", k = x ? "bottom" : "right", S = x ? "clientHeight" : "clientWidth", j = s.reference[g] + s.reference[m] - d[m] - s.floating[g], E = d[m] - s.reference[m], R = await (a.getOffsetParent == null ? void 0 : a.getOffsetParent(u));
    let P = R ? R[S] : 0;
    (!P || !await (a.isElement == null ? void 0 : a.isElement(R))) && (P = i.floating[S] || s.floating[g]);
    const v = j / 2 - E / 2, T = P / 2 - b[g] / 2 - 1, L = Bt(h[w], T), _ = Bt(h[k], T), z = P - b[g] - _, B = P / 2 - b[g] / 2 + v, M = Fu(L, B, z), A = !l.arrow && No(r) != null && B !== M && s.reference[g] / 2 - (B < L ? L : _) - b[g] / 2 < 0, O = A ? B < L ? B - L : B - z : 0;
    return {
      [m]: d[m] + O,
      data: {
        [m]: M,
        centerOffset: B - M - O,
        ...A && {
          alignmentOffset: O
        }
      },
      reset: A
    };
  }
}), km = function(e) {
  return e === void 0 && (e = {}), {
    name: "flip",
    options: e,
    async fn(t) {
      var n, o;
      const {
        placement: r,
        middlewareData: s,
        rects: a,
        initialPlacement: i,
        platform: l,
        elements: u
      } = t, {
        mainAxis: f = !0,
        crossAxis: h = !0,
        fallbackPlacements: d,
        fallbackStrategy: m = "bestFit",
        fallbackAxisSideDirection: g = "none",
        flipAlignment: b = !0,
        ...x
      } = Yt(e, t);
      if ((n = s.arrow) != null && n.alignmentOffset)
        return {};
      const w = Xt(r), k = $t(i), S = Xt(i) === i, j = await (l.isRTL == null ? void 0 : l.isRTL(u.floating)), E = d || (S || !b ? [Gr(i)] : lm(i)), R = g !== "none";
      !d && R && E.push(...pm(i, b, g, j));
      const P = [i, ...E], v = await l.detectOverflow(t, x), T = [];
      let L = ((o = s.flip) == null ? void 0 : o.overflows) || [];
      if (f && T.push(v[w]), h) {
        const M = cm(r, a, j);
        T.push(v[M[0]], v[M[1]]);
      }
      if (L = [...L, {
        placement: r,
        overflows: T
      }], !T.every((M) => M <= 0)) {
        var _, z;
        const M = (((_ = s.flip) == null ? void 0 : _.index) || 0) + 1, A = P[M];
        if (A && (!(h === "alignment" ? k !== $t(A) : !1) || // We leave the current main axis only if every placement on that axis
        // overflows the main axis.
        L.every((I) => $t(I.placement) === k ? I.overflows[0] > 0 : !0)))
          return {
            data: {
              index: M,
              overflows: L
            },
            reset: {
              placement: A
            }
          };
        let O = (z = L.filter(($) => $.overflows[0] <= 0).sort(($, I) => $.overflows[1] - I.overflows[1])[0]) == null ? void 0 : z.placement;
        if (!O)
          switch (m) {
            case "bestFit": {
              var B;
              const $ = (B = L.filter((I) => {
                if (R) {
                  const V = $t(I.placement);
                  return V === k || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  V === "y";
                }
                return !0;
              }).map((I) => [I.placement, I.overflows.filter((V) => V > 0).reduce((V, D) => V + D, 0)]).sort((I, V) => I[1] - V[1])[0]) == null ? void 0 : B[0];
              $ && (O = $);
              break;
            }
            case "initialPlacement":
              O = i;
              break;
          }
        if (r !== O)
          return {
            reset: {
              placement: O
            }
          };
      }
      return {};
    }
  };
};
function Bc(e, t) {
  return {
    top: e.top - t.height,
    right: e.right - t.width,
    bottom: e.bottom - t.height,
    left: e.left - t.width
  };
}
function Vc(e) {
  return am.some((t) => e[t] >= 0);
}
const Em = function(e) {
  return e === void 0 && (e = {}), {
    name: "hide",
    options: e,
    async fn(t) {
      const {
        rects: n,
        platform: o
      } = t, {
        strategy: r = "referenceHidden",
        ...s
      } = Yt(e, t);
      switch (r) {
        case "referenceHidden": {
          const a = await o.detectOverflow(t, {
            ...s,
            elementContext: "reference"
          }), i = Bc(a, n.reference);
          return {
            data: {
              referenceHiddenOffsets: i,
              referenceHidden: Vc(i)
            }
          };
        }
        case "escaped": {
          const a = await o.detectOverflow(t, {
            ...s,
            altBoundary: !0
          }), i = Bc(a, n.floating);
          return {
            data: {
              escapedOffsets: i,
              escaped: Vc(i)
            }
          };
        }
        default:
          return {};
      }
    }
  };
};
function Bu(e) {
  const t = Bt(...e.map((s) => s.left)), n = Bt(...e.map((s) => s.top)), o = Et(...e.map((s) => s.right)), r = Et(...e.map((s) => s.bottom));
  return {
    x: t,
    y: n,
    width: o - t,
    height: r - n
  };
}
function Rm(e) {
  const t = e.slice().sort((r, s) => r.y - s.y), n = [];
  let o = null;
  for (let r = 0; r < t.length; r++) {
    const s = t[r];
    !o || s.y - o.y > o.height / 2 ? n.push([s]) : n[n.length - 1].push(s), o = s;
  }
  return n.map((r) => Sn(Bu(r)));
}
const Nm = function(e) {
  return e === void 0 && (e = {}), {
    name: "inline",
    options: e,
    async fn(t) {
      const {
        placement: n,
        elements: o,
        rects: r,
        platform: s,
        strategy: a
      } = t, {
        padding: i = 2,
        x: l,
        y: u
      } = Yt(e, t), f = Array.from(await (s.getClientRects == null ? void 0 : s.getClientRects(o.reference)) || []);
      if (!f.length)
        return {};
      const h = Rm(f), d = Sn(Bu(f)), m = yi(i);
      function g() {
        if (h.length === 2 && (h[0].left > h[1].right || h[1].left > h[0].right) && l != null && u != null)
          return h.find((x) => l > x.left - m.left && l < x.right + m.right && u > x.top - m.top && u < x.bottom + m.bottom) || d;
        if (h.length >= 2) {
          if ($t(n) === "y") {
            const R = h[0], P = h[h.length - 1], v = Xt(n) === "top", T = R.top, L = P.bottom, _ = v ? R.left : P.left, z = v ? R.right : P.right;
            return Sn({
              x: _,
              y: T,
              width: z - _,
              height: L - T
            });
          }
          const x = Xt(n) === "left", w = Et(...h.map((R) => R.right)), k = Bt(...h.map((R) => R.left)), S = h.filter((R) => x ? R.left === k : R.right === w), j = S[0].top, E = S[S.length - 1].bottom;
          return Sn({
            x: k,
            y: j,
            width: w - k,
            height: E - j
          });
        }
        return d;
      }
      const b = await s.getElementRects({
        reference: {
          getBoundingClientRect: g
        },
        floating: o.floating,
        strategy: a
      });
      return r.reference.x !== b.reference.x || r.reference.y !== b.reference.y || r.reference.width !== b.reference.width || r.reference.height !== b.reference.height ? {
        reset: {
          rects: b
        }
      } : {};
    }
  };
}, Vu = /* @__PURE__ */ new Set(["left", "top"]);
async function Tm(e, t) {
  const {
    placement: n,
    platform: o,
    elements: r
  } = e, s = await (o.isRTL == null ? void 0 : o.isRTL(r.floating)), a = Xt(n), i = No(n), l = $t(n) === "y", u = Vu.has(a) ? -1 : 1, f = s && l ? -1 : 1, h = Yt(t, e);
  let {
    mainAxis: d,
    crossAxis: m,
    alignmentAxis: g
  } = typeof h == "number" ? {
    mainAxis: h,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: h.mainAxis || 0,
    crossAxis: h.crossAxis || 0,
    alignmentAxis: h.alignmentAxis
  };
  return i && typeof g == "number" && (m = i === "end" ? g * -1 : g), l ? {
    x: m * f,
    y: d * u
  } : {
    x: d * u,
    y: m * f
  };
}
const Pm = function(e) {
  return e === void 0 && (e = 0), {
    name: "offset",
    options: e,
    async fn(t) {
      var n, o;
      const {
        x: r,
        y: s,
        placement: a,
        middlewareData: i
      } = t, l = await Tm(t, e);
      return a === ((n = i.offset) == null ? void 0 : n.placement) && (o = i.arrow) != null && o.alignmentOffset ? {} : {
        x: r + l.x,
        y: s + l.y,
        data: {
          ...l,
          placement: a
        }
      };
    }
  };
}, Am = function(e) {
  return e === void 0 && (e = {}), {
    name: "shift",
    options: e,
    async fn(t) {
      const {
        x: n,
        y: o,
        placement: r,
        platform: s
      } = t, {
        mainAxis: a = !0,
        crossAxis: i = !1,
        limiter: l = {
          fn: (k) => {
            let {
              x: S,
              y: j
            } = k;
            return {
              x: S,
              y: j
            };
          }
        },
        ...u
      } = Yt(e, t), f = {
        x: n,
        y: o
      }, h = await s.detectOverflow(t, u), d = $t(r), m = mi(d);
      let g = f[m], b = f[d];
      const x = (k, S) => Fu(S + h[k === "y" ? "top" : "left"], S, S - h[k === "y" ? "bottom" : "right"]);
      a && (g = x(m, g)), i && (b = x(d, b));
      const w = l.fn({
        ...t,
        [m]: g,
        [d]: b
      });
      return {
        ...w,
        data: {
          x: w.x - n,
          y: w.y - o,
          enabled: {
            [m]: a,
            [d]: i
          }
        }
      };
    }
  };
}, Im = function(e) {
  return e === void 0 && (e = {}), {
    options: e,
    fn(t) {
      var n, o;
      const {
        x: r,
        y: s,
        placement: a,
        rects: i,
        middlewareData: l
      } = t, {
        offset: u = 0,
        mainAxis: f = !0,
        crossAxis: h = !0
      } = Yt(e, t), d = {
        x: r,
        y: s
      }, m = $t(a), g = mi(m);
      let b = d[g], x = d[m];
      const w = Yt(u, t), k = typeof w == "number" ? {
        mainAxis: w,
        crossAxis: 0
      } : {
        mainAxis: (n = w.mainAxis) != null ? n : 0,
        crossAxis: (o = w.crossAxis) != null ? o : 0
      };
      if (f) {
        const E = g === "y" ? "height" : "width", R = i.reference[g] - i.floating[E] + k.mainAxis, P = i.reference[g] + i.reference[E] - k.mainAxis;
        b < R ? b = R : b > P && (b = P);
      }
      if (h) {
        var S, j;
        const E = g === "y" ? "width" : "height", R = Vu.has(Xt(a)), P = i.reference[m] - i.floating[E] + (R && ((S = l.offset) == null ? void 0 : S[m]) || 0) + (R ? 0 : k.crossAxis), v = i.reference[m] + i.reference[E] + (R ? 0 : ((j = l.offset) == null ? void 0 : j[m]) || 0) - (R ? k.crossAxis : 0);
        x < P ? x = P : x > v && (x = v);
      }
      return {
        [g]: b,
        [m]: x
      };
    }
  };
}, Mm = function(e) {
  return e === void 0 && (e = {}), {
    name: "size",
    options: e,
    async fn(t) {
      const {
        placement: n,
        rects: o,
        platform: r,
        elements: s
      } = t, {
        apply: a = () => {
        },
        ...i
      } = Yt(e, t), l = await r.detectOverflow(t, i), u = Xt(n), f = No(n), h = $t(n) === "y", {
        width: d,
        height: m
      } = o.floating;
      let g, b;
      u === "top" || u === "bottom" ? (g = u, b = f === (await (r.isRTL == null ? void 0 : r.isRTL(s.floating)) ? "start" : "end") ? "left" : "right") : (b = u, g = f === "end" ? "top" : "bottom");
      const x = m - l.top - l.bottom, w = d - l.left - l.right, k = Bt(m - l[g], x), S = Bt(d - l[b], w), j = t.middlewareData.shift, E = !j;
      let R = k, P = S;
      j != null && j.enabled.x && (P = w), j != null && j.enabled.y && (R = x), E && !f && (h ? P = d - 2 * Et(l.left, l.right) : R = m - 2 * Et(l.top, l.bottom)), await a({
        ...t,
        availableWidth: P,
        availableHeight: R
      });
      const v = await r.getDimensions(s.floating);
      return d !== v.width || m !== v.height ? {
        reset: {
          rects: !0
        }
      } : {};
    }
  };
};
function Hu(e) {
  const t = Kt(e);
  let n = parseFloat(t.width) || 0, o = parseFloat(t.height) || 0;
  const r = Nn(e), s = r ? e.offsetWidth : n, a = r ? e.offsetHeight : o, i = Xr(n) !== s || Xr(o) !== a;
  return i && (n = s, o = a), {
    width: n,
    height: o,
    $: i
  };
}
function bi(e) {
  return mt(e) ? e : e.contextElement;
}
function fo(e) {
  const t = bi(e);
  if (!Nn(t))
    return tn(1);
  const n = t.getBoundingClientRect(), {
    width: o,
    height: r,
    $: s
  } = Hu(t);
  let a = (s ? Xr(n.width) : n.width) / o, i = (s ? Xr(n.height) : n.height) / r;
  return (!a || !Number.isFinite(a)) && (a = 1), (!i || !Number.isFinite(i)) && (i = 1), {
    x: a,
    y: i
  };
}
const Dm = /* @__PURE__ */ tn(0);
function Uu(e) {
  const t = gt(e);
  return !hi() || !t.visualViewport ? Dm : {
    x: t.visualViewport.offsetLeft,
    y: t.visualViewport.offsetTop
  };
}
function Om(e, t, n) {
  return t === void 0 && (t = !1), !!n && t && n === gt(e);
}
function Bn(e, t, n, o) {
  t === void 0 && (t = !1), n === void 0 && (n = !1);
  const r = e.getBoundingClientRect(), s = bi(e);
  let a = tn(1);
  t && (o ? mt(o) && (a = fo(o)) : a = fo(e));
  const i = Om(s, n, o) ? Uu(s) : tn(0);
  let l = (r.left + i.x) / a.x, u = (r.top + i.y) / a.y, f = r.width / a.x, h = r.height / a.y;
  if (s && o) {
    const d = gt(s), m = mt(o) ? gt(o) : o;
    let g = d, b = Aa(g);
    for (; b && m !== g; ) {
      const x = fo(b), w = b.getBoundingClientRect(), k = Kt(b), S = w.left + (b.clientLeft + parseFloat(k.paddingLeft)) * x.x, j = w.top + (b.clientTop + parseFloat(k.paddingTop)) * x.y;
      l *= x.x, u *= x.y, f *= x.x, h *= x.y, l += S, u += j, g = gt(b), b = Aa(g);
    }
  }
  return Sn({
    width: f,
    height: h,
    x: l,
    y: u
  });
}
function bs(e, t) {
  const n = ys(e).scrollLeft;
  return t ? t.left + n : Bn(an(e)).left + n;
}
function Wu(e, t) {
  const n = e.getBoundingClientRect(), o = n.left + t.scrollLeft - bs(e, n), r = n.top + t.scrollTop;
  return {
    x: o,
    y: r
  };
}
function Lm(e) {
  let {
    elements: t,
    rect: n,
    offsetParent: o,
    strategy: r
  } = e;
  const s = r === "fixed", a = an(o), i = t ? vs(t.floating) : !1;
  if (o === a || i && s)
    return n;
  let l = {
    scrollLeft: 0,
    scrollTop: 0
  }, u = tn(1);
  const f = tn(0), h = Nn(o);
  if ((h || !s) && ((Ro(o) !== "body" || gs(a)) && (l = ys(o)), h)) {
    const m = Bn(o);
    u = fo(o), f.x = m.x + o.clientLeft, f.y = m.y + o.clientTop;
  }
  const d = a && !h && !s ? Wu(a, l) : tn(0);
  return {
    width: n.width * u.x,
    height: n.height * u.y,
    x: n.x * u.x - l.scrollLeft * u.x + f.x + d.x,
    y: n.y * u.y - l.scrollTop * u.y + f.y + d.y
  };
}
function $m(e) {
  return e.getClientRects ? Array.from(e.getClientRects()) : [];
}
function _m(e) {
  const t = ys(e), n = e.ownerDocument.body, o = Et(e.scrollWidth, e.clientWidth, n.scrollWidth, n.clientWidth), r = Et(e.scrollHeight, e.clientHeight, n.scrollHeight, n.clientHeight);
  let s = -t.scrollLeft + bs(e);
  const a = -t.scrollTop;
  return Kt(n).direction === "rtl" && (s += Et(e.clientWidth, n.clientWidth) - o), {
    width: o,
    height: r,
    x: s,
    y: a
  };
}
const zm = 25;
function Fm(e, t, n) {
  n === void 0 && (n = "viewport");
  const o = n === "layoutViewport", r = gt(e), s = an(e), a = r.visualViewport;
  let i = s.clientWidth, l = s.clientHeight, u = 0, f = 0;
  if (a) {
    const d = !hi() || t === "fixed";
    o ? d || (u = -a.offsetLeft, f = -a.offsetTop) : (i = a.width, l = a.height, d && (u = a.offsetLeft, f = a.offsetTop));
  }
  if (bs(s) <= 0) {
    const d = s.ownerDocument, m = d.body, g = getComputedStyle(m), b = d.compatMode === "CSS1Compat" && parseFloat(g.marginLeft) + parseFloat(g.marginRight) || 0, x = Math.abs(s.clientWidth - m.clientWidth - b), w = getComputedStyle(s).scrollbarGutter === "stable both-edges" ? x / 2 : x;
    w <= zm && (i -= w);
  }
  return {
    width: i,
    height: l,
    x: u,
    y: f
  };
}
function Bm(e, t) {
  const n = Bn(e, !0, t === "fixed"), o = n.top + e.clientTop, r = n.left + e.clientLeft, s = fo(e), a = e.clientWidth * s.x, i = e.clientHeight * s.y, l = r * s.x, u = o * s.y;
  return {
    width: a,
    height: i,
    x: l,
    y: u
  };
}
function Hc(e, t, n) {
  let o;
  if (t === "viewport" || t === "layoutViewport")
    o = Fm(e, n, t);
  else if (t === "document")
    o = _m(an(e));
  else if (mt(t))
    o = Bm(t, n);
  else {
    const r = Uu(e);
    o = {
      x: t.x - r.x,
      y: t.y - r.y,
      width: t.width,
      height: t.height
    };
  }
  return Sn(o);
}
function Vm(e, t) {
  const n = t.get(e);
  if (n)
    return n;
  let o = Zo(e, [], !1).filter((i) => mt(i) && Ro(i) !== "body"), r = null;
  const s = Kt(e).position === "fixed";
  let a = s ? Fn(e) : e;
  for (; mt(a) && !Jo(a); ) {
    const i = Kt(a), l = pi(a), u = r ? r.position : s ? "fixed" : "";
    !l && (u === "fixed" || u === "absolute" && i.position === "static") ? o = o.filter((h) => h !== a) : r = i, a = Fn(a);
  }
  return t.set(e, o), o;
}
function Hm(e) {
  let {
    element: t,
    boundary: n,
    rootBoundary: o,
    strategy: r
  } = e;
  const a = [...n === "clippingAncestors" ? vs(t) ? [] : Vm(t, this._c) : [].concat(n), o], i = Hc(t, a[0], r);
  let l = i.top, u = i.right, f = i.bottom, h = i.left;
  for (let d = 1; d < a.length; d++) {
    const m = Hc(t, a[d], r);
    l = Et(m.top, l), u = Bt(m.right, u), f = Bt(m.bottom, f), h = Et(m.left, h);
  }
  return {
    width: u - h,
    height: f - l,
    x: h,
    y: l
  };
}
function Um(e) {
  const {
    width: t,
    height: n
  } = Hu(e);
  return {
    width: t,
    height: n
  };
}
function Wm(e, t, n) {
  const o = Nn(t), r = an(t), s = n === "fixed", a = Bn(e, !0, s, t);
  let i = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const l = tn(0);
  if ((o || !s) && ((Ro(t) !== "body" || gs(r)) && (i = ys(t)), o)) {
    const d = Bn(t, !0, s, t);
    l.x = d.x + t.clientLeft, l.y = d.y + t.clientTop;
  }
  !o && r && (l.x = bs(r));
  const u = r && !o && !s ? Wu(r, i) : tn(0), f = a.left + i.scrollLeft - l.x - u.x, h = a.top + i.scrollTop - l.y - u.y;
  return {
    x: f,
    y: h,
    width: a.width,
    height: a.height
  };
}
function oa(e) {
  return Kt(e).position === "static";
}
function Uc(e, t) {
  if (!Nn(e) || Kt(e).position === "fixed")
    return null;
  if (t)
    return t(e);
  let n = e.offsetParent;
  return an(e) === n && (n = n.ownerDocument.body), n;
}
function qu(e, t) {
  const n = gt(e);
  if (vs(e))
    return n;
  if (!Nn(e)) {
    let r = Fn(e);
    for (; r && !Jo(r); ) {
      if (mt(r) && !oa(r))
        return r;
      r = Fn(r);
    }
    return n;
  }
  let o = Uc(e, t);
  for (; o && nm(o) && oa(o); )
    o = Uc(o, t);
  return o && Jo(o) && oa(o) && !pi(o) ? n : o || sm(e) || n;
}
const qm = async function(e) {
  const t = this.getOffsetParent || qu, n = this.getDimensions, o = await n(e.floating);
  return {
    reference: Wm(e.reference, await t(e.floating), e.strategy),
    floating: {
      x: 0,
      y: 0,
      width: o.width,
      height: o.height
    }
  };
};
function Km(e) {
  return Kt(e).direction === "rtl";
}
const Ym = {
  convertOffsetParentRelativeRectToViewportRelativeRect: Lm,
  getDocumentElement: an,
  getClippingRect: Hm,
  getOffsetParent: qu,
  getElementRects: qm,
  getClientRects: $m,
  getDimensions: Um,
  getScale: fo,
  isElement: mt,
  isRTL: Km
};
function Ku(e, t) {
  return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function Xm(e, t, n) {
  let o = null, r;
  const s = an(e);
  function a() {
    var f;
    clearTimeout(r), (f = o) == null || f.disconnect(), o = null;
  }
  function i(f, h) {
    f === void 0 && (f = !1), h === void 0 && (h = 1), a();
    const d = e.getBoundingClientRect(), {
      left: m,
      top: g,
      width: b,
      height: x
    } = d;
    if (f || t(), !b || !x)
      return;
    const w = Pr(g), k = Pr(s.clientWidth - (m + b)), S = Pr(s.clientHeight - (g + x)), j = Pr(m), R = {
      rootMargin: -w + "px " + -k + "px " + -S + "px " + -j + "px",
      threshold: Et(0, Bt(1, h)) || 1
    };
    let P = !0;
    function v(T) {
      const L = T[0].intersectionRatio;
      if (!Ku(d, e.getBoundingClientRect()))
        return i();
      if (L !== h) {
        if (!P)
          return i();
        L ? i(!1, L) : r = setTimeout(() => {
          i(!1, 1e-7);
        }, 1e3);
      }
      P = !1;
    }
    try {
      o = new IntersectionObserver(v, {
        ...R,
        // Handle <iframe>s
        root: s.ownerDocument
      });
    } catch {
      o = new IntersectionObserver(v, R);
    }
    o.observe(e);
  }
  const l = gt(e), u = () => i(n);
  return l.addEventListener("resize", u), i(!0), () => {
    l.removeEventListener("resize", u), a();
  };
}
function Wc(e, t, n, o) {
  o === void 0 && (o = {});
  const {
    ancestorScroll: r = !0,
    ancestorResize: s = !0,
    elementResize: a = typeof ResizeObserver == "function",
    layoutShift: i = typeof IntersectionObserver == "function",
    animationFrame: l = !1
  } = o, u = bi(e), f = r || s ? [...u ? Zo(u) : [], ...t ? Zo(t) : []] : [];
  f.forEach((w) => {
    r && w.addEventListener("scroll", n), s && w.addEventListener("resize", n);
  });
  const h = u && i ? Xm(u, n, s) : null;
  let d = -1, m = null;
  a && (m = new ResizeObserver((w) => {
    let [k] = w;
    k && k.target === u && m && t && (m.unobserve(t), cancelAnimationFrame(d), d = requestAnimationFrame(() => {
      var S;
      (S = m) == null || S.observe(t);
    })), n();
  }), u && !l && m.observe(u), t && m.observe(t));
  let g, b = l ? Bn(e) : null;
  l && x();
  function x() {
    const w = Bn(e);
    b && !Ku(b, w) && n(), b = w, g = requestAnimationFrame(x);
  }
  return n(), () => {
    var w;
    f.forEach((k) => {
      r && k.removeEventListener("scroll", n), s && k.removeEventListener("resize", n);
    }), h?.(), (w = m) == null || w.disconnect(), m = null, l && cancelAnimationFrame(g);
  };
}
const Gm = Pm, Jm = Am, Zm = km, Qm = Mm, eg = Em, qc = jm, tg = Nm, ng = Im, og = (e, t, n) => {
  const o = /* @__PURE__ */ new Map(), r = n ?? {}, s = {
    ...Ym,
    ...r.platform,
    _c: o
  };
  return Cm(e, t, {
    ...r,
    platform: s
  });
};
var rg = typeof document < "u", sg = function() {
}, Lr = rg ? p.useLayoutEffect : sg;
function Jr(e, t) {
  if (e === t)
    return !0;
  if (typeof e != typeof t)
    return !1;
  if (typeof e == "function" && e.toString() === t.toString())
    return !0;
  let n, o, r;
  if (e && t && typeof e == "object") {
    if (Array.isArray(e)) {
      if (n = e.length, n !== t.length) return !1;
      for (o = n; o-- !== 0; )
        if (!Jr(e[o], t[o]))
          return !1;
      return !0;
    }
    if (r = Object.keys(e), n = r.length, n !== Object.keys(t).length)
      return !1;
    for (o = n; o-- !== 0; )
      if (!{}.hasOwnProperty.call(t, r[o]))
        return !1;
    for (o = n; o-- !== 0; ) {
      const s = r[o];
      if (!(s === "_owner" && e.$$typeof) && !Jr(e[s], t[s]))
        return !1;
    }
    return !0;
  }
  return e !== e && t !== t;
}
function Yu(e) {
  return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function Kc(e, t) {
  const n = Yu(e);
  return Math.round(t * n) / n;
}
function ra(e) {
  const t = p.useRef(e);
  return Lr(() => {
    t.current = e;
  }), t;
}
function ag(e) {
  e === void 0 && (e = {});
  const {
    placement: t = "bottom",
    strategy: n = "absolute",
    middleware: o = [],
    platform: r,
    elements: {
      reference: s,
      floating: a
    } = {},
    transform: i = !0,
    whileElementsMounted: l,
    open: u
  } = e, [f, h] = p.useState({
    x: 0,
    y: 0,
    strategy: n,
    placement: t,
    middlewareData: {},
    isPositioned: !1
  }), [d, m] = p.useState(o);
  Jr(d, o) || m(o);
  const [g, b] = p.useState(null), [x, w] = p.useState(null), k = p.useCallback((I) => {
    I !== R.current && (R.current = I, b(I));
  }, []), S = p.useCallback((I) => {
    I !== P.current && (P.current = I, w(I));
  }, []), j = s || g, E = a || x, R = p.useRef(null), P = p.useRef(null), v = p.useRef(f), T = l != null, L = ra(l), _ = ra(r), z = ra(u), B = p.useCallback(() => {
    if (!R.current || !P.current)
      return;
    const I = {
      placement: t,
      strategy: n,
      middleware: d
    };
    _.current && (I.platform = _.current), og(R.current, P.current, I).then((V) => {
      const D = {
        ...V,
        // The floating element's position may be recomputed while it's closed
        // but still mounted (such as when transitioning out). To ensure
        // `isPositioned` will be `false` initially on the next open, avoid
        // setting it to `true` when `open === false` (must be specified).
        isPositioned: z.current !== !1
      };
      M.current && !Jr(v.current, D) && (v.current = D, qt.flushSync(() => {
        h(D);
      }));
    });
  }, [d, t, n, _, z]);
  Lr(() => {
    u === !1 && v.current.isPositioned && (v.current.isPositioned = !1, h((I) => ({
      ...I,
      isPositioned: !1
    })));
  }, [u]);
  const M = p.useRef(!1);
  Lr(() => (M.current = !0, () => {
    M.current = !1;
  }), []), Lr(() => {
    if (j && (R.current = j), E && (P.current = E), j && E) {
      if (L.current)
        return L.current(j, E, B);
      B();
    }
  }, [j, E, B, L, T]);
  const A = p.useMemo(() => ({
    reference: R,
    floating: P,
    setReference: k,
    setFloating: S
  }), [k, S]), O = p.useMemo(() => ({
    reference: j,
    floating: E
  }), [j, E]), $ = p.useMemo(() => {
    const I = {
      position: n,
      left: 0,
      top: 0
    };
    if (!O.floating)
      return I;
    const V = Kc(O.floating, f.x), D = Kc(O.floating, f.y);
    return i ? {
      ...I,
      transform: "translate(" + V + "px, " + D + "px)",
      ...Yu(O.floating) >= 1.5 && {
        willChange: "transform"
      }
    } : {
      position: n,
      left: V,
      top: D
    };
  }, [n, i, O.floating, f.x, f.y]);
  return p.useMemo(() => ({
    ...f,
    update: B,
    refs: A,
    elements: O,
    floatingStyles: $
  }), [f, B, A, O, $]);
}
const ig = (e) => {
  function t(n) {
    return {}.hasOwnProperty.call(n, "current");
  }
  return {
    name: "arrow",
    options: e,
    fn(n) {
      const {
        element: o,
        padding: r
      } = typeof e == "function" ? e(n) : e;
      return o && t(o) ? o.current != null ? qc({
        element: o.current,
        padding: r
      }).fn(n) : {} : o ? qc({
        element: o,
        padding: r
      }).fn(n) : {};
    }
  };
}, cg = (e, t) => {
  const n = Gm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, lg = (e, t) => {
  const n = Jm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, ug = (e, t) => ({
  fn: ng(e).fn,
  options: [e, t]
}), dg = (e, t) => {
  const n = Zm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, fg = (e, t) => {
  const n = Qm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, pg = (e, t) => {
  const n = eg(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, Yc = (e, t) => {
  const n = tg(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, hg = (e, t) => {
  const n = ig(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
};
function Xu(e) {
  const t = p.useRef(void 0), n = p.useCallback((o) => {
    const r = e.map((s) => {
      if (s != null) {
        if (typeof s == "function") {
          const a = s, i = a(o);
          return typeof i == "function" ? i : () => {
            a(null);
          };
        }
        return s.current = o, () => {
          s.current = null;
        };
      }
    });
    return () => {
      r.forEach((s) => s?.());
    };
  }, e);
  return p.useMemo(() => e.every((o) => o == null) ? null : (o) => {
    t.current && (t.current(), t.current = void 0), o != null && (t.current = n(o));
  }, e);
}
const mg = {
  ...su
};
let Xc = !1, gg = 0;
const Gc = () => (
  // Ensure the id is unique with multiple independent versions of Floating UI
  // on <React 18
  "floating-ui-" + Math.random().toString(36).slice(2, 6) + gg++
);
function vg() {
  const [e, t] = p.useState(() => Xc ? Gc() : void 0);
  return Ma(() => {
    e == null && t(Gc());
  }, []), p.useEffect(() => {
    Xc = !0;
  }, []), e;
}
const yg = mg.useId, bg = yg || vg;
function wg() {
  const e = /* @__PURE__ */ new Map();
  return {
    emit(t, n) {
      var o;
      (o = e.get(t)) == null || o.forEach((r) => r(n));
    },
    on(t, n) {
      e.has(t) || e.set(t, /* @__PURE__ */ new Set()), e.get(t).add(n);
    },
    off(t, n) {
      var o;
      (o = e.get(t)) == null || o.delete(n);
    }
  };
}
const xg = /* @__PURE__ */ p.createContext(null), Sg = /* @__PURE__ */ p.createContext(null), Cg = () => {
  var e;
  return ((e = p.useContext(xg)) == null ? void 0 : e.id) || null;
}, jg = () => p.useContext(Sg);
function kg(e) {
  const {
    open: t = !1,
    onOpenChange: n,
    elements: o
  } = e, r = bg(), s = p.useRef({}), [a] = p.useState(() => wg()), i = Cg() != null, [l, u] = p.useState(o.reference), f = wm((m, g, b) => {
    s.current.openEvent = m ? g : void 0, a.emit("openchange", {
      open: m,
      event: g,
      reason: b,
      nested: i
    }), n?.(m, g, b);
  }), h = p.useMemo(() => ({
    setPositionReference: u
  }), []), d = p.useMemo(() => ({
    reference: l || o.reference || null,
    floating: o.floating || null,
    domReference: o.reference
  }), [l, o.reference, o.floating]);
  return p.useMemo(() => ({
    dataRef: s,
    open: t,
    onOpenChange: f,
    elements: d,
    events: a,
    floatingId: r,
    refs: h
  }), [t, f, d, a, r, h]);
}
function Eg(e) {
  var t, n;
  let {
    elements: o,
    ...r
  } = e === void 0 ? {} : e;
  const {
    nodeId: s
  } = r, a = kg({
    ...r,
    elements: {
      reference: (t = o?.reference) != null ? t : null,
      floating: (n = o?.floating) != null ? n : null
    }
  }), i = r.rootContext || a, l = i.elements, [u, f] = p.useState(null), [h, d] = p.useState(null), g = l?.domReference || u, b = p.useRef(null), x = jg();
  Ma(() => {
    g && (b.current = g);
  }, [g]);
  const w = ag({
    ...r,
    elements: {
      ...l,
      ...h && {
        reference: h
      }
    }
  }), k = p.useCallback((P) => {
    const v = mt(P) ? {
      getBoundingClientRect: () => P.getBoundingClientRect(),
      getClientRects: () => P.getClientRects(),
      contextElement: P
    } : P;
    d(v), w.refs.setReference(v);
  }, [w.refs]), S = p.useCallback((P) => {
    (mt(P) || P === null) && (b.current = P, f(P)), (mt(w.refs.reference.current) || w.refs.reference.current === null || // Don't allow setting virtual elements using the old technique back to
    // `null` to support `positionReference` + an unstable `reference`
    // callback ref.
    P !== null && !mt(P)) && w.refs.setReference(P);
  }, [w.refs]), j = p.useMemo(() => ({
    ...w.refs,
    setReference: S,
    setPositionReference: k,
    domReference: b
  }), [w.refs, S, k]), E = p.useMemo(() => ({
    ...w.elements,
    domReference: g
  }), [w.elements, g]), R = p.useMemo(() => ({
    ...w,
    ...i,
    refs: j,
    elements: E,
    nodeId: s
  }), [w, j, E, s, i]);
  return Ma(() => {
    i.dataRef.current.floatingContext = R;
    const P = x?.nodesRef.current.find((v) => v.id === s);
    P && (P.context = R);
  }), p.useMemo(() => ({
    ...w,
    context: R,
    refs: j,
    elements: E
  }), [w, j, E, R]);
}
const Gu = {
  scrollHideDelay: 1e3,
  type: "hover",
  scrollbars: "xy"
}, Ju = _e((e, { scrollbarSize: t, overscrollBehavior: n, scrollbars: o }) => {
  let r = n;
  return n && o && (o === "x" ? r = `${n} auto` : o === "y" && (r = `auto ${n}`)), { root: {
    "--scrollarea-scrollbar-size": Ae(t),
    "--scrollarea-over-scroll-behavior": r
  } };
}), Tn = ae((e) => {
  const t = Q("ScrollArea", Gu, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, scrollbarSize: i, vars: l, type: u, scrollHideDelay: f, viewportProps: h, viewportRef: d, onScrollPositionChange: m, children: g, offsetScrollbars: b, scrollbars: x, onBottomReached: w, onTopReached: k, onLeftReached: S, onRightReached: j, overscrollBehavior: E, startScrollPosition: R, verticalScrollbarPosition: P, attributes: v, ...T } = t, [L, _] = p.useState(!1), [z, B] = p.useState(!1), [M, A] = p.useState(!1), O = p.useRef(!0), $ = p.useRef(!1), I = p.useRef(!0), V = p.useRef(!1), D = Me({
    name: "ScrollArea",
    props: t,
    classes: fi,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: v,
    vars: l,
    varsResolver: Ju
  }), F = p.useRef(null), [U, q] = p.useState(null), G = p.useCallback((oe) => {
    q((te) => te === oe ? te : oe);
  }, []), fe = Xu([
    d,
    F,
    G
  ]);
  return kn(b === "present" ? U : null, () => {
    const oe = F.current;
    oe && (B(oe.scrollHeight > oe.clientHeight), A(oe.scrollWidth > oe.clientWidth));
  }), Yo(() => {
    R && F.current && F.current.scrollTo({
      left: R.x ?? 0,
      top: R.y ?? 0
    });
  }, []), /* @__PURE__ */ c.jsxs(Ru, {
    getStyles: D,
    type: u === "never" ? "always" : u,
    scrollHideDelay: f,
    scrollbars: x,
    ...D("root"),
    ...T,
    children: [
      /* @__PURE__ */ c.jsx($u, {
        ...h,
        ...D("viewport", { style: h?.style }),
        ref: fe,
        "data-offset-scrollbars": b === !0 ? "xy" : b || void 0,
        "data-scrollbars": x || void 0,
        "data-vertical-scrollbar-position": P || void 0,
        "data-horizontal-hidden": b === "present" && !M ? "true" : void 0,
        "data-vertical-hidden": b === "present" && !z ? "true" : void 0,
        onScroll: (oe) => {
          h?.onScroll?.(oe), m?.({
            x: oe.currentTarget.scrollLeft,
            y: oe.currentTarget.scrollTop
          });
          const { scrollTop: te, scrollHeight: de, clientHeight: Y, scrollLeft: K, scrollWidth: ie, clientWidth: xe } = oe.currentTarget, he = te - (de - Y) >= -0.8, Ee = te === 0;
          he && !$.current && w?.(), Ee && !O.current && k?.(), $.current = he, O.current = Ee;
          const re = K - (ie - xe) >= -0.8, W = K === 0;
          re && !V.current && j?.(), W && !I.current && S?.(), V.current = re, I.current = W;
        },
        children: g
      }),
      (x === "xy" || x === "x") && /* @__PURE__ */ c.jsx(Ta, {
        ...D("scrollbar"),
        orientation: "horizontal",
        "data-vertical-scrollbar-position": P || void 0,
        "data-hidden": u === "never" || b === "present" && !M ? !0 : void 0,
        forceMount: !0,
        onMouseEnter: () => _(!0),
        onMouseLeave: () => _(!1),
        children: /* @__PURE__ */ c.jsx(Pa, { ...D("thumb") })
      }),
      (x === "xy" || x === "y") && /* @__PURE__ */ c.jsx(Ta, {
        ...D("scrollbar"),
        orientation: "vertical",
        "data-vertical-scrollbar-position": P || void 0,
        "data-hidden": u === "never" || b === "present" && !z ? !0 : void 0,
        forceMount: !0,
        onMouseEnter: () => _(!0),
        onMouseLeave: () => _(!1),
        children: /* @__PURE__ */ c.jsx(Pa, { ...D("thumb") })
      }),
      /* @__PURE__ */ c.jsx(Xh, {
        ...D("corner"),
        "data-vertical-scrollbar-position": P || void 0,
        "data-hovered": L || void 0,
        "data-hidden": u === "never" || void 0
      })
    ]
  });
});
Tn.displayName = "@mantine/core/ScrollArea";
const wi = ae((e) => {
  const { children: t, classNames: n, styles: o, scrollbarSize: r, scrollHideDelay: s, type: a, dir: i, offsetScrollbars: l, overscrollBehavior: u, viewportRef: f, onScrollPositionChange: h, unstyled: d, variant: m, viewportProps: g, scrollbars: b, style: x, vars: w, onBottomReached: k, onTopReached: S, startScrollPosition: j, verticalScrollbarPosition: E, onOverflowChange: R, ...P } = Q("ScrollAreaAutosize", Gu, e), v = p.useRef(null), [T, L] = p.useState(null), _ = p.useCallback((O) => {
    L(($) => $ === O ? $ : O);
  }, []), z = Xu([
    f,
    v,
    _
  ]), B = p.useRef(!1), M = p.useRef(!1), A = p.useEffectEvent(() => {
    const O = v.current;
    if (!O || !R) return;
    const $ = O.scrollHeight > O.clientHeight;
    $ !== B.current && (M.current ? R($) : (M.current = !0, $ && R(!0)), B.current = $);
  });
  return kn(R ? T : null, A), /* @__PURE__ */ c.jsx(ee, {
    ...P,
    variant: m,
    style: [{
      display: "flex",
      overflow: "hidden"
    }, x],
    children: /* @__PURE__ */ c.jsx(ee, {
      style: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
        ...b === "y" && { minWidth: 0 },
        ...b === "x" && { minHeight: 0 },
        ...b === "xy" && {
          minWidth: 0,
          minHeight: 0
        },
        ...b === !1 && {
          minWidth: 0,
          minHeight: 0
        }
      },
      children: /* @__PURE__ */ c.jsx(Tn, {
        classNames: n,
        styles: o,
        scrollHideDelay: s,
        scrollbarSize: r,
        type: a,
        dir: i,
        offsetScrollbars: l,
        overscrollBehavior: u,
        viewportRef: z,
        onScrollPositionChange: h,
        unstyled: d,
        variant: m,
        viewportProps: g,
        vars: w,
        scrollbars: b,
        onBottomReached: k,
        onTopReached: S,
        startScrollPosition: j,
        verticalScrollbarPosition: E,
        "data-autosize": "true",
        children: t
      })
    })
  });
});
Tn.classes = fi;
Tn.varsResolver = Ju;
wi.displayName = "@mantine/core/ScrollAreaAutosize";
wi.classes = fi;
Tn.Autosize = wi;
var Zu = { root: "m_515a97f8" };
const xi = ae((e) => {
  const t = Q("VisuallyHidden", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, attributes: l, ...u } = t, f = Me({
    name: "VisuallyHidden",
    classes: Zu,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: l
  });
  return /* @__PURE__ */ c.jsx(ee, {
    component: "span",
    ...f("root"),
    ...u
  });
});
xi.classes = Zu;
xi.displayName = "@mantine/core/VisuallyHidden";
function Jc(e, t, n, o) {
  return e === "center" || o === "center" ? { top: t } : e === "end" ? { bottom: n } : e === "start" ? { top: n } : {};
}
function Zc(e, t, n, o, r) {
  return e === "center" || o === "center" ? { left: t } : e === "end" ? { [r === "ltr" ? "right" : "left"]: n } : e === "start" ? { [r === "ltr" ? "left" : "right"]: n } : {};
}
const Rg = {
  bottom: "borderTopLeftRadius",
  left: "borderTopRightRadius",
  right: "borderBottomLeftRadius",
  top: "borderBottomRightRadius"
};
function Ng({ position: e, arrowSize: t, dir: n }) {
  const [o, r] = e.split("-");
  if (!r) return;
  const s = {
    width: t,
    height: t,
    position: "absolute"
  };
  if (o === "bottom") {
    const a = r === "start", i = a ? n === "ltr" ? "left" : "right" : n === "ltr" ? "right" : "left";
    return {
      ...s,
      top: -t,
      [i]: 0,
      clipPath: a !== (n === "rtl") ? "polygon(0% 0%, 0% 100%, 100% 100%)" : "polygon(100% 0%, 0% 100%, 100% 100%)"
    };
  }
  if (o === "top") {
    const a = r === "start", i = a ? n === "ltr" ? "left" : "right" : n === "ltr" ? "right" : "left";
    return {
      ...s,
      bottom: -t,
      [i]: 0,
      clipPath: a !== (n === "rtl") ? "polygon(0% 0%, 100% 0%, 0% 100%)" : "polygon(0% 0%, 100% 0%, 100% 100%)"
    };
  }
  if (o === "left") return {
    ...s,
    right: -t,
    [r === "start" ? "top" : "bottom"]: 0,
    clipPath: r === "start" ? "polygon(0% 0%, 100% 0%, 0% 100%)" : "polygon(0% 0%, 0% 100%, 100% 100%)"
  };
  if (o === "right") return {
    ...s,
    left: -t,
    [r === "start" ? "top" : "bottom"]: 0,
    clipPath: r === "start" ? "polygon(0% 0%, 100% 0%, 100% 100%)" : "polygon(100% 0%, 0% 100%, 100% 100%)"
  };
}
function Tg({ position: e, arrowSize: t, arrowOffset: n, arrowRadius: o, arrowPosition: r, arrowX: s, arrowY: a, dir: i }) {
  if (r === "merge") {
    const d = Ng({
      position: e,
      arrowSize: t,
      dir: i
    });
    if (d) return d;
  }
  const [l, u = "center"] = e.split("-"), f = {
    width: t,
    height: t,
    transform: "rotate(45deg)",
    position: "absolute",
    [Rg[l]]: o
  }, h = -t / 2;
  return l === "left" ? {
    ...f,
    ...Jc(u, a, n, r),
    right: h,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    clipPath: "polygon(100% 0, 0 0, 100% 100%)"
  } : l === "right" ? {
    ...f,
    ...Jc(u, a, n, r),
    left: h,
    borderRightColor: "transparent",
    borderTopColor: "transparent",
    clipPath: "polygon(0 100%, 0 0, 100% 100%)"
  } : l === "top" ? {
    ...f,
    ...Zc(u, s, n, r, i),
    bottom: h,
    borderTopColor: "transparent",
    borderLeftColor: "transparent",
    clipPath: "polygon(0 100%, 100% 100%, 100% 0)"
  } : l === "bottom" ? {
    ...f,
    ...Zc(u, s, n, r, i),
    top: h,
    borderBottomColor: "transparent",
    borderRightColor: "transparent",
    clipPath: "polygon(0 100%, 0 0, 100% 0)"
  } : {};
}
function Pg({ position: e, dir: t }) {
  const [n, o] = e.split("-");
  if (!o) return;
  const r = o === "start" && t === "ltr" || o === "end" && t === "rtl";
  if (n === "bottom") return r ? { borderTopLeftRadius: 0 } : { borderTopRightRadius: 0 };
  if (n === "top") return r ? { borderBottomLeftRadius: 0 } : { borderBottomRightRadius: 0 };
  if (n === "left") return o === "start" ? { borderTopRightRadius: 0 } : { borderBottomRightRadius: 0 };
  if (n === "right") return o === "start" ? { borderTopLeftRadius: 0 } : { borderBottomLeftRadius: 0 };
}
function Qu({ position: e, arrowSize: t, arrowOffset: n, arrowRadius: o, arrowPosition: r, visible: s, arrowX: a, arrowY: i, style: l, ...u }) {
  const { dir: f } = Eo();
  return s ? /* @__PURE__ */ c.jsx("div", {
    role: "presentation",
    ...u,
    style: {
      ...l,
      ...Tg({
        position: e,
        arrowSize: t,
        arrowOffset: n,
        arrowRadius: o,
        arrowPosition: r,
        dir: f,
        arrowX: a,
        arrowY: i
      })
    }
  }) : null;
}
Qu.displayName = "@mantine/core/FloatingArrow";
function Ag(e, t) {
  if (e === "rtl" && (t.includes("right") || t.includes("left"))) {
    const [n, o] = t.split("-"), r = n === "right" ? "left" : "right";
    return o === void 0 ? r : `${r}-${o}`;
  }
  return t;
}
const [Ig, Si] = Jt("Popover component was not found in the tree");
function Mg({ childProps: e, disabled: t, opened: n, longPressDelay: o = 500, setReference: r, open: s }) {
  const a = p.useRef(!1), i = p.useRef(!1), l = p.useRef(null), u = p.useRef(t);
  u.current = t;
  const f = (g, b, x) => {
    r({
      getBoundingClientRect: () => ({
        x: g,
        y: b,
        width: 0,
        height: 0,
        top: b,
        left: g,
        right: g,
        bottom: b,
        toJSON: () => {
        }
      }),
      contextElement: x
    }), s();
  }, h = no(e.onMouseDown, (g) => {
    t || g.button === 2 && g.stopPropagation();
  }), d = no(e.onContextMenu, (g) => {
    t || g.defaultPrevented || (g.preventDefault(), !i.current && (f(g.clientX, g.clientY, g.currentTarget), a.current && (i.current = !0)));
  }), m = _h((g) => {
    if (u.current || i.current) return;
    const b = g, x = b.touches[0] ?? b.changedTouches[0];
    x && (f(x.clientX, x.clientY, l.current), i.current = !0);
  }, {
    threshold: o,
    events: ["touch"],
    cancelOnMove: !0,
    onStart: (g) => {
      a.current = !0, i.current = !1, l.current = g.currentTarget;
    },
    onFinish: (g) => {
      a.current = !1, i.current = !1, u.current || g.preventDefault();
    },
    onCancel: () => {
      a.current = !1, i.current = !1;
    }
  });
  return {
    onContextMenu: d,
    onMouseDown: h,
    onTouchStart: no(e.onTouchStart, m.onTouchStart),
    onTouchEnd: no(e.onTouchEnd, m.onTouchEnd),
    onTouchCancel: no(e.onTouchCancel, m.onTouchCancel),
    onTouchMove: no(e.onTouchMove, m.onTouchMove),
    style: t ? e.style : {
      ...e.style,
      WebkitTouchCallout: "none",
      WebkitUserSelect: "none",
      userSelect: "none"
    },
    "data-expanded": n ? !0 : void 0
  };
}
function ed(e) {
  const { children: t, disabled: n, longPressDelay: o } = Q("PopoverContextMenu", null, e), r = fr(t);
  if (!r) throw new Error("Popover.ContextMenu component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  const s = Si(), a = Mg({
    childProps: r.props,
    disabled: n || s.disabled,
    opened: s.opened,
    longPressDelay: o,
    setReference: s.reference,
    open: () => {
      s.opened || s.onToggle();
    }
  });
  return p.cloneElement(r, a);
}
ed.displayName = "@mantine/core/PopoverContextMenu";
function ws({ children: e, active: t = !0, refProp: n = "ref", innerRef: o }) {
  const r = jh(t), s = We(r, o), a = fr(e);
  return a ? p.cloneElement(a, { [n]: s }) : e;
}
function td(e) {
  return /* @__PURE__ */ c.jsx(xi, {
    tabIndex: -1,
    "data-autofocus": !0,
    ...e
  });
}
ws.displayName = "@mantine/core/FocusTrap";
td.displayName = "@mantine/core/FocusTrapInitialFocus";
ws.InitialFocus = td;
var nd = {
  dropdown: "m_38a85659",
  arrow: "m_a31dc6c1",
  overlay: "m_3d7bc908"
};
const Ci = ae((e) => {
  const t = Q("PopoverDropdown", null, e), { className: n, style: o, vars: r, children: s, onKeyDownCapture: a, variant: i, classNames: l, styles: u, ref: f, ...h } = t, d = Si(), { dir: m } = Eo(), g = d.arrowPosition === "merge" && d.withArrow ? Pg({
    position: d.placement,
    dir: m
  }) : void 0, b = vu({
    opened: d.opened,
    shouldReturnFocus: d.returnFocus
  }), x = d.withRoles ? {
    "aria-labelledby": d.getTargetId(),
    id: d.getDropdownId(),
    role: "dialog",
    tabIndex: -1
  } : {}, w = We(f, d.floating);
  return d.disabled ? null : /* @__PURE__ */ c.jsx(ii, {
    ...d.portalProps,
    withinPortal: d.withinPortal,
    children: /* @__PURE__ */ c.jsx(cs, {
      mounted: d.opened,
      ...d.transitionProps,
      transition: d.transitionProps?.transition || "fade",
      duration: d.transitionProps?.duration ?? 150,
      keepMounted: d.keepMounted,
      keepMountedMode: d.keepMountedMode,
      exitDuration: typeof d.transitionProps?.exitDuration == "number" ? d.transitionProps.exitDuration : d.transitionProps?.duration,
      children: (k) => /* @__PURE__ */ c.jsx(ws, {
        active: d.trapFocus && d.opened,
        innerRef: w,
        children: /* @__PURE__ */ c.jsxs(ee, {
          ...x,
          ...h,
          variant: i,
          onKeyDownCapture: mh(() => {
            d.onClose?.(), d.onDismiss?.();
          }, {
            active: d.closeOnEscape,
            onTrigger: b,
            onKeyDown: a
          }),
          "data-position": d.placement,
          "data-fixed": d.floatingStrategy === "fixed" || void 0,
          ...d.getStyles("dropdown", {
            className: n,
            props: t,
            classNames: l,
            styles: u,
            style: [
              {
                ...k,
                ...g,
                zIndex: d.zIndex,
                top: d.y ?? 0,
                left: d.x ?? 0,
                width: d.width === "target" ? void 0 : Ae(d.width),
                ...d.referenceHidden ? { display: "none" } : null
              },
              d.resolvedStyles?.dropdown,
              u?.dropdown,
              o
            ]
          }),
          children: [s, /* @__PURE__ */ c.jsx(Qu, {
            ref: d.arrowRef,
            arrowX: d.arrowX,
            arrowY: d.arrowY,
            visible: d.withArrow,
            position: d.placement,
            arrowSize: d.arrowSize,
            arrowRadius: d.arrowRadius,
            arrowOffset: d.arrowOffset,
            arrowPosition: d.arrowPosition,
            ...d.getStyles("arrow", {
              props: t,
              classNames: l,
              styles: u
            })
          })]
        })
      })
    })
  });
});
Ci.classes = nd;
Ci.displayName = "@mantine/core/PopoverDropdown";
const Dg = {
  refProp: "ref",
  popupType: "dialog"
}, od = ae((e) => {
  const { children: t, refProp: n, popupType: o, ref: r, ...s } = Q("PopoverTarget", Dg, e), a = fr(t);
  if (!a) throw new Error("Popover.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  const i = s, l = Si(), u = We(l.reference, ku(a), r), f = l.withRoles ? {
    "aria-haspopup": o,
    "aria-expanded": l.opened,
    "aria-controls": l.opened ? l.getDropdownId() : void 0,
    id: l.getTargetId()
  } : {}, h = a.props;
  return p.cloneElement(a, {
    ...i,
    ...f,
    ...l.targetProps,
    className: rn(l.targetProps.className, i.className, h.className),
    [n]: u,
    ...l.controlled ? null : { onClick: (d) => {
      l.onToggle(), h.onClick?.(d);
    } }
  });
});
od.displayName = "@mantine/core/PopoverTarget";
function Og(e) {
  if (e === void 0) return {
    shift: !0,
    flip: !0
  };
  const t = { ...e };
  return e.shift === void 0 && (t.shift = !0), e.flip === void 0 && (t.flip = !0), t;
}
function Lg(e, t, n, o) {
  const r = Og(e.middlewares), s = [cg(e.offset), pg()];
  if (r.flip && !n) {
    const a = typeof r.flip == "boolean" ? {} : r.flip, i = o ? {
      fallbackStrategy: "initialPlacement",
      ...a
    } : a;
    s.push(dg(i));
  }
  if (r.shift) {
    const a = typeof r.shift == "boolean" ? {} : r.shift;
    s.push(lg((i) => {
      const l = i.placement.startsWith("top") || i.placement.startsWith("bottom");
      return {
        limiter: ug(),
        padding: 5,
        ...e.width === "target" && l ? { mainAxis: !1 } : null,
        ...a
      };
    }));
  }
  return r.inline && s.push(typeof r.inline == "boolean" ? Yc() : Yc(r.inline)), s.push(hg({
    element: e.arrowRef,
    padding: e.arrowOffset
  })), (r.size || e.width === "target") && s.push(fg({
    ...typeof r.size == "boolean" ? {} : r.size,
    apply({ rects: a, availableWidth: i, availableHeight: l, ...u }) {
      const f = t().refs.floating.current?.style ?? {};
      r.size && (typeof r.size == "object" && r.size.apply ? r.size.apply({
        rects: a,
        availableWidth: i,
        availableHeight: l,
        ...u
      }) : Object.assign(f, {
        maxWidth: `${i}px`,
        maxHeight: `${l}px`
      })), e.width === "target" && Object.assign(f, { width: `${a.reference.width}px` });
    }
  })), s;
}
function $g(e) {
  const [t, n] = et({
    value: e.opened,
    defaultValue: e.defaultOpened,
    finalValue: !1,
    onChange: e.onChange
  }), o = p.useRef(t), r = p.useRef(!1), [s, a] = p.useState(null), i = e.preventPositionChangeWhenVisible !== !1, l = p.useRef(t);
  t !== l.current && (l.current = t, t && s !== null && a(null));
  const u = p.useRef(e.position);
  e.position !== u.current && (u.current = e.position, r.current = !1, s !== null && a(null));
  const f = p.useCallback(() => a(null), []), h = () => {
    t && !e.disabled && n(!1);
  }, d = () => {
    e.disabled || n(!t);
  }, m = Eg({
    open: t,
    strategy: e.strategy,
    placement: i ? s ?? e.position : e.position,
    middleware: Lg(e, () => m, i && s !== null, i),
    whileElementsMounted: e.keepMounted ? void 0 : Wc
  });
  p.useEffect(() => {
    if (!e.keepMounted) return;
    const b = m.refs.reference.current, x = m.refs.floating.current;
    if (t && b && x) return Wc(b, x, m.update);
  }, [
    e.keepMounted,
    t,
    m.update,
    m.elements.reference,
    m.elements.floating
  ]), Yo(() => {
    if (!t) {
      r.current = !1;
      return;
    }
    if (!i || s !== null) return;
    const b = m.refs.floating.current;
    if (!(!b || b.offsetHeight === 0 || b.offsetWidth === 0)) {
      if (!r.current) {
        r.current = !0, m.update();
        return;
      }
      m.isPositioned && a(m.placement);
    }
  }, [
    i,
    t,
    m.isPositioned,
    m.placement,
    s,
    m.update
  ]);
  const g = p.useRef(m.placement);
  return Yo(() => {
    g.current !== m.placement && (g.current = m.placement, e.onPositionChange?.(m.placement));
  }, [m.placement]), jn(() => {
    t !== o.current && (t ? e.onOpen?.() : e.onClose?.()), o.current = t;
  }, [
    t,
    e.onClose,
    e.onOpen
  ]), {
    floating: m,
    controlled: typeof e.opened == "boolean",
    opened: t,
    onClose: h,
    onToggle: d,
    resetLockedPlacement: f
  };
}
const _g = {
  position: "bottom",
  offset: 8,
  transitionProps: {
    transition: "fade",
    duration: 150
  },
  middlewares: {
    flip: !0,
    shift: !0,
    inline: !1
  },
  arrowSize: 7,
  arrowOffset: 5,
  arrowRadius: 0,
  arrowPosition: "side",
  closeOnClickOutside: !0,
  withinPortal: !0,
  closeOnEscape: !0,
  trapFocus: !1,
  withRoles: !0,
  returnFocus: !1,
  withOverlay: !1,
  hideDetached: !0,
  preventPositionChangeWhenVisible: !0,
  clickOutsideEvents: ["mousedown", "touchstart"],
  zIndex: ko("popover"),
  __staticSelector: "Popover",
  width: "max-content"
}, rd = _e((e, { radius: t, shadow: n }) => ({ dropdown: {
  "--popover-radius": t === void 0 ? void 0 : St(t),
  "--popover-shadow": au(n)
} }));
function qe(e) {
  const t = Q("Popover", _g, e), { children: n, position: o, offset: r, onPositionChange: s, opened: a, transitionProps: i, onExitTransitionEnd: l, onEnterTransitionEnd: u, width: f, middlewares: h, withArrow: d, arrowSize: m, arrowOffset: g, arrowRadius: b, arrowPosition: x, unstyled: w, classNames: k, styles: S, closeOnClickOutside: j, withinPortal: E, portalProps: R, closeOnEscape: P, clickOutsideEvents: v, trapFocus: T, onClose: L, onDismiss: _, onOpen: z, onChange: B, zIndex: M, radius: A, shadow: O, id: $, defaultOpened: I, __staticSelector: V, withRoles: D, disabled: F, returnFocus: U, variant: q, keepMounted: G, keepMountedMode: fe, vars: oe, floatingStrategy: te, withOverlay: de, overlayProps: Y, hideDetached: K, attributes: ie, preventPositionChangeWhenVisible: xe, ...he } = t, Ee = Me({
    name: V,
    props: t,
    classes: nd,
    classNames: k,
    styles: S,
    unstyled: w,
    attributes: ie,
    rootSelector: "dropdown",
    vars: oe,
    varsResolver: rd
  }), { resolvedStyles: re } = dr({
    classNames: k,
    styles: S,
    props: t
  }), W = p.useRef(null), [H, X] = p.useState(null), [ue, Re] = p.useState(null), { dir: De } = Eo(), ve = ri(), ye = Pt($), Se = $g({
    middlewares: h,
    width: f,
    position: Ag(De, o),
    offset: typeof r == "number" ? r + (d ? m / 2 : 0) : r,
    arrowRef: W,
    arrowOffset: g,
    onPositionChange: s,
    opened: a,
    defaultOpened: I,
    onChange: B,
    onOpen: z,
    onClose: L,
    onDismiss: _,
    strategy: te,
    disabled: F,
    preventPositionChangeWhenVisible: xe,
    keepMounted: G
  });
  gu(() => {
    j && (Se.onClose(), _?.());
  }, v, [H, ue]);
  const Le = p.useCallback((yt) => {
    X(yt), Se.floating.refs.setReference(yt);
  }, [Se.floating.refs.setReference]), pe = p.useCallback((yt) => {
    Re(yt), Se.floating.refs.setFloating(yt);
  }, [Se.floating.refs.setFloating]), vt = p.useCallback(() => {
    i?.onExited?.(), l?.(), Se.resetLockedPlacement();
  }, [
    i?.onExited,
    l,
    Se.resetLockedPlacement
  ]), Te = p.useCallback(() => {
    i?.onEntered?.(), u?.();
  }, [i?.onEntered, u]);
  return /* @__PURE__ */ c.jsxs(Ig, {
    value: {
      returnFocus: U,
      disabled: F,
      controlled: Se.controlled,
      reference: Le,
      floating: pe,
      x: Se.floating.x,
      y: Se.floating.y,
      arrowX: Se.floating?.middlewareData?.arrow?.x,
      arrowY: Se.floating?.middlewareData?.arrow?.y,
      opened: Se.opened,
      arrowRef: W,
      transitionProps: {
        ...i,
        onExited: vt,
        onEntered: Te
      },
      width: f,
      withArrow: d,
      arrowSize: m,
      arrowOffset: g,
      arrowRadius: b,
      arrowPosition: x,
      placement: Se.floating.placement,
      trapFocus: T,
      withinPortal: E,
      portalProps: R,
      zIndex: M,
      radius: A,
      shadow: O,
      closeOnEscape: P,
      onDismiss: _,
      onClose: Se.onClose,
      onToggle: Se.onToggle,
      getTargetId: () => ye,
      getDropdownId: () => `${ye}-dropdown`,
      withRoles: D,
      targetProps: he,
      __staticSelector: V,
      classNames: k,
      styles: S,
      unstyled: w,
      variant: q,
      keepMounted: G,
      keepMountedMode: fe,
      getStyles: Ee,
      resolvedStyles: re,
      floatingStrategy: te,
      referenceHidden: K && ve !== "test" ? Se.floating.middlewareData.hide?.referenceHidden : !1
    },
    children: [n, de && /* @__PURE__ */ c.jsx(cs, {
      transition: "fade",
      mounted: Se.opened,
      duration: i?.duration || 250,
      exitDuration: i?.exitDuration || 250,
      children: (yt) => /* @__PURE__ */ c.jsx(ii, {
        withinPortal: E,
        children: /* @__PURE__ */ c.jsx(du, {
          ...Y,
          ...Ee("overlay", {
            className: Y?.className,
            style: [yt, Y?.style]
          })
        })
      })
    })]
  });
}
qe.Target = od;
qe.Dropdown = Ci;
qe.ContextMenu = ed;
qe.varsResolver = rd;
qe.displayName = "@mantine/core/Popover";
qe.extend = (e) => e;
qe.withProps = (e) => {
  const t = (n) => /* @__PURE__ */ c.jsx(qe, {
    ...e,
    ...n
  });
  return t.extend = qe.extend, t.displayName = `WithProps(${qe.displayName})`, t;
};
const [zg, cn] = Jt("ModalBase component was not found in tree");
function Fg({ opened: e, transitionDuration: t }) {
  const [n, o] = p.useState(e), r = p.useRef(-1), s = si() ? 0 : t;
  return p.useEffect(() => (e ? (o(!0), window.clearTimeout(r.current)) : s === 0 ? o(!1) : r.current = window.setTimeout(() => o(!1), s), () => window.clearTimeout(r.current)), [e, s]), n;
}
function Bg({ id: e, transitionProps: t, opened: n, trapFocus: o, closeOnEscape: r, onClose: s, returnFocus: a, handledEscapeEvents: i }) {
  const l = Pt(e), [u, f] = p.useState(!1), [h, d] = p.useState(!1), m = typeof t?.duration == "number" ? t?.duration : 200, g = Fg({
    opened: n,
    transitionDuration: m
  });
  return Rh("keydown", (b) => {
    b.key === "Escape" && r && !b.isComposing && n && !i?.has(b) && b.target?.getAttribute("data-mantine-stop-propagation") !== "true" && (i?.add(b), s());
  }, { capture: !0 }), vu({
    opened: n,
    shouldReturnFocus: o && a
  }), {
    _id: l,
    titleMounted: u,
    bodyMounted: h,
    shouldLockScroll: g,
    setTitleMounted: f,
    setBodyMounted: d
  };
}
var Wt = function() {
  return Wt = Object.assign || function(t) {
    for (var n, o = 1, r = arguments.length; o < r; o++) {
      n = arguments[o];
      for (var s in n) Object.prototype.hasOwnProperty.call(n, s) && (t[s] = n[s]);
    }
    return t;
  }, Wt.apply(this, arguments);
};
function sd(e, t) {
  var n = {};
  for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var r = 0, o = Object.getOwnPropertySymbols(e); r < o.length; r++)
      t.indexOf(o[r]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[r]) && (n[o[r]] = e[o[r]]);
  return n;
}
function Vg(e, t, n) {
  if (n || arguments.length === 2) for (var o = 0, r = t.length, s; o < r; o++)
    (s || !(o in t)) && (s || (s = Array.prototype.slice.call(t, 0, o)), s[o] = t[o]);
  return e.concat(s || Array.prototype.slice.call(t));
}
var $r = "right-scroll-bar-position", _r = "width-before-scroll-bar", Hg = "with-scroll-bars-hidden", Ug = "--removed-body-scroll-bar-size";
function sa(e, t) {
  return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
function Wg(e, t) {
  var n = p.useState(function() {
    return {
      // value
      value: e,
      // last callback
      callback: t,
      // "memoized" public interface
      facade: {
        get current() {
          return n.value;
        },
        set current(o) {
          var r = n.value;
          r !== o && (n.value = o, n.callback(o, r));
        }
      }
    };
  })[0];
  return n.callback = t, n.facade;
}
var qg = typeof window < "u" ? p.useLayoutEffect : p.useEffect, Qc = /* @__PURE__ */ new WeakMap();
function Kg(e, t) {
  var n = Wg(null, function(o) {
    return e.forEach(function(r) {
      return sa(r, o);
    });
  });
  return qg(function() {
    var o = Qc.get(n);
    if (o) {
      var r = new Set(o), s = new Set(e), a = n.current;
      r.forEach(function(i) {
        s.has(i) || sa(i, null);
      }), s.forEach(function(i) {
        r.has(i) || sa(i, a);
      });
    }
    Qc.set(n, e);
  }, [e]), n;
}
function Yg(e) {
  return e;
}
function Xg(e, t) {
  t === void 0 && (t = Yg);
  var n = [], o = !1, r = {
    read: function() {
      if (o)
        throw new Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");
      return n.length ? n[n.length - 1] : e;
    },
    useMedium: function(s) {
      var a = t(s, o);
      return n.push(a), function() {
        n = n.filter(function(i) {
          return i !== a;
        });
      };
    },
    assignSyncMedium: function(s) {
      for (o = !0; n.length; ) {
        var a = n;
        n = [], a.forEach(s);
      }
      n = {
        push: function(i) {
          return s(i);
        },
        filter: function() {
          return n;
        }
      };
    },
    assignMedium: function(s) {
      o = !0;
      var a = [];
      if (n.length) {
        var i = n;
        n = [], i.forEach(s), a = n;
      }
      var l = function() {
        var f = a;
        a = [], f.forEach(s);
      }, u = function() {
        return Promise.resolve().then(l);
      };
      u(), n = {
        push: function(f) {
          a.push(f), u();
        },
        filter: function(f) {
          return a = a.filter(f), n;
        }
      };
    }
  };
  return r;
}
function Gg(e) {
  e === void 0 && (e = {});
  var t = Xg(null);
  return t.options = Wt({ async: !0, ssr: !1 }, e), t;
}
var ad = function(e) {
  var t = e.sideCar, n = sd(e, ["sideCar"]);
  if (!t)
    throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  var o = t.read();
  if (!o)
    throw new Error("Sidecar medium not found");
  return p.createElement(o, Wt({}, n));
};
ad.isSideCarExport = !0;
function Jg(e, t) {
  return e.useMedium(t), ad;
}
var id = Gg(), aa = function() {
}, xs = p.forwardRef(function(e, t) {
  var n = p.useRef(null), o = p.useState({
    onScrollCapture: aa,
    onWheelCapture: aa,
    onTouchMoveCapture: aa
  }), r = o[0], s = o[1], a = e.forwardProps, i = e.children, l = e.className, u = e.removeScrollBar, f = e.enabled, h = e.shards, d = e.sideCar, m = e.noRelative, g = e.noIsolation, b = e.inert, x = e.allowPinchZoom, w = e.as, k = w === void 0 ? "div" : w, S = e.gapMode, j = sd(e, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]), E = d, R = Kg([n, t]), P = Wt(Wt({}, j), r);
  return p.createElement(
    p.Fragment,
    null,
    f && p.createElement(E, { sideCar: id, removeScrollBar: u, shards: h, noRelative: m, noIsolation: g, inert: b, setCallbacks: s, allowPinchZoom: !!x, lockRef: n, gapMode: S }),
    a ? p.cloneElement(p.Children.only(i), Wt(Wt({}, P), { ref: R })) : p.createElement(k, Wt({}, P, { className: l, ref: R }), i)
  );
});
xs.defaultProps = {
  enabled: !0,
  removeScrollBar: !0,
  inert: !1
};
xs.classNames = {
  fullWidth: _r,
  zeroRight: $r
};
var Zg = function() {
  if (typeof __webpack_nonce__ < "u")
    return __webpack_nonce__;
};
function Qg() {
  if (!document)
    return null;
  var e = document.createElement("style");
  e.type = "text/css";
  var t = Zg();
  return t && e.setAttribute("nonce", t), e;
}
function ev(e, t) {
  e.styleSheet ? e.styleSheet.cssText = t : e.appendChild(document.createTextNode(t));
}
function tv(e) {
  var t = document.head || document.getElementsByTagName("head")[0];
  t.appendChild(e);
}
var nv = function() {
  var e = 0, t = null;
  return {
    add: function(n) {
      e == 0 && (t = Qg()) && (ev(t, n), tv(t)), e++;
    },
    remove: function() {
      e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), t = null);
    }
  };
}, ov = function() {
  var e = nv();
  return function(t, n) {
    p.useEffect(function() {
      return e.add(t), function() {
        e.remove();
      };
    }, [t && n]);
  };
}, cd = function() {
  var e = ov(), t = function(n) {
    var o = n.styles, r = n.dynamic;
    return e(o, r), null;
  };
  return t;
}, rv = {
  left: 0,
  top: 0,
  right: 0,
  gap: 0
}, ia = function(e) {
  return parseInt(e || "", 10) || 0;
}, sv = function(e) {
  var t = window.getComputedStyle(document.body), n = t[e === "padding" ? "paddingLeft" : "marginLeft"], o = t[e === "padding" ? "paddingTop" : "marginTop"], r = t[e === "padding" ? "paddingRight" : "marginRight"];
  return [ia(n), ia(o), ia(r)];
}, av = function(e) {
  if (e === void 0 && (e = "margin"), typeof window > "u")
    return rv;
  var t = sv(e), n = document.documentElement.clientWidth, o = window.innerWidth;
  return {
    left: t[0],
    top: t[1],
    right: t[2],
    gap: Math.max(0, o - n + t[2] - t[0])
  };
}, iv = cd(), po = "data-scroll-locked", cv = function(e, t, n, o) {
  var r = e.left, s = e.top, a = e.right, i = e.gap;
  return n === void 0 && (n = "margin"), `
  .`.concat(Hg, ` {
   overflow: hidden `).concat(o, `;
   padding-right: `).concat(i, "px ").concat(o, `;
  }
  body[`).concat(po, `] {
    overflow: hidden `).concat(o, `;
    overscroll-behavior: contain;
    `).concat([
    t && "position: relative ".concat(o, ";"),
    n === "margin" && `
    padding-left: `.concat(r, `px;
    padding-top: `).concat(s, `px;
    padding-right: `).concat(a, `px;
    margin-left:0;
    margin-top:0;
    margin-right: `).concat(i, "px ").concat(o, `;
    `),
    n === "padding" && "padding-right: ".concat(i, "px ").concat(o, ";")
  ].filter(Boolean).join(""), `
  }
  
  .`).concat($r, ` {
    right: `).concat(i, "px ").concat(o, `;
  }
  
  .`).concat(_r, ` {
    margin-right: `).concat(i, "px ").concat(o, `;
  }
  
  .`).concat($r, " .").concat($r, ` {
    right: 0 `).concat(o, `;
  }
  
  .`).concat(_r, " .").concat(_r, ` {
    margin-right: 0 `).concat(o, `;
  }
  
  body[`).concat(po, `] {
    `).concat(Ug, ": ").concat(i, `px;
  }
`);
}, el = function() {
  var e = parseInt(document.body.getAttribute(po) || "0", 10);
  return isFinite(e) ? e : 0;
}, lv = function() {
  p.useEffect(function() {
    return document.body.setAttribute(po, (el() + 1).toString()), function() {
      var e = el() - 1;
      e <= 0 ? document.body.removeAttribute(po) : document.body.setAttribute(po, e.toString());
    };
  }, []);
}, uv = function(e) {
  var t = e.noRelative, n = e.noImportant, o = e.gapMode, r = o === void 0 ? "margin" : o;
  lv();
  var s = p.useMemo(function() {
    return av(r);
  }, [r]);
  return p.createElement(iv, { styles: cv(s, !t, r, n ? "" : "!important") });
}, Da = !1;
if (typeof window < "u")
  try {
    var Ar = Object.defineProperty({}, "passive", {
      get: function() {
        return Da = !0, !0;
      }
    });
    window.addEventListener("test", Ar, Ar), window.removeEventListener("test", Ar, Ar);
  } catch {
    Da = !1;
  }
var oo = Da ? { passive: !1 } : !1, dv = function(e) {
  return e.tagName === "TEXTAREA";
}, ld = function(e, t) {
  if (!(e instanceof Element))
    return !1;
  var n = window.getComputedStyle(e);
  return (
    // not-not-scrollable
    n[t] !== "hidden" && // contains scroll inside self
    !(n.overflowY === n.overflowX && !dv(e) && n[t] === "visible")
  );
}, fv = function(e) {
  return ld(e, "overflowY");
}, pv = function(e) {
  return ld(e, "overflowX");
}, tl = function(e, t) {
  var n = t.ownerDocument, o = t;
  do {
    typeof ShadowRoot < "u" && o instanceof ShadowRoot && (o = o.host);
    var r = ud(e, o);
    if (r) {
      var s = dd(e, o), a = s[1], i = s[2];
      if (a > i)
        return !0;
    }
    o = o.parentNode;
  } while (o && o !== n.body);
  return !1;
}, hv = function(e) {
  var t = e.scrollTop, n = e.scrollHeight, o = e.clientHeight;
  return [
    t,
    n,
    o
  ];
}, mv = function(e) {
  var t = e.scrollLeft, n = e.scrollWidth, o = e.clientWidth;
  return [
    t,
    n,
    o
  ];
}, ud = function(e, t) {
  return e === "v" ? fv(t) : pv(t);
}, dd = function(e, t) {
  return e === "v" ? hv(t) : mv(t);
}, gv = function(e, t) {
  return e === "h" && t === "rtl" ? -1 : 1;
}, vv = function(e, t, n, o, r) {
  var s = gv(e, window.getComputedStyle(t).direction), a = s * o, i = n.target, l = t.contains(i), u = !1, f = a > 0, h = 0, d = 0;
  do {
    if (!i)
      break;
    var m = dd(e, i), g = m[0], b = m[1], x = m[2], w = b - x - s * g;
    (g || w) && ud(e, i) && (h += w, d += g);
    var k = i.parentNode;
    i = k && k.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? k.host : k;
  } while (
    // portaled content
    !l && i !== document.body || // self content
    l && (t.contains(i) || t === i)
  );
  return (f && Math.abs(h) < 1 || !f && Math.abs(d) < 1) && (u = !0), u;
}, Ir = function(e) {
  return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, nl = function(e) {
  return [e.deltaX, e.deltaY];
}, ol = function(e) {
  return e && "current" in e ? e.current : e;
}, yv = function(e, t) {
  return e[0] === t[0] && e[1] === t[1];
}, bv = function(e) {
  return `
  .block-interactivity-`.concat(e, ` {pointer-events: none;}
  .allow-interactivity-`).concat(e, ` {pointer-events: all;}
`);
}, wv = 0, ro = [];
function xv(e) {
  var t = p.useRef([]), n = p.useRef([0, 0]), o = p.useRef(), r = p.useState(wv++)[0], s = p.useState(cd)[0], a = p.useRef(e);
  p.useEffect(function() {
    a.current = e;
  }, [e]), p.useEffect(function() {
    if (e.inert) {
      document.body.classList.add("block-interactivity-".concat(r));
      var b = Vg([e.lockRef.current], (e.shards || []).map(ol), !0).filter(Boolean);
      return b.forEach(function(x) {
        return x.classList.add("allow-interactivity-".concat(r));
      }), function() {
        document.body.classList.remove("block-interactivity-".concat(r)), b.forEach(function(x) {
          return x.classList.remove("allow-interactivity-".concat(r));
        });
      };
    }
  }, [e.inert, e.lockRef.current, e.shards]);
  var i = p.useCallback(function(b, x) {
    if ("touches" in b && b.touches.length === 2 || b.type === "wheel" && b.ctrlKey)
      return !a.current.allowPinchZoom;
    var w = Ir(b), k = n.current, S = "deltaX" in b ? b.deltaX : k[0] - w[0], j = "deltaY" in b ? b.deltaY : k[1] - w[1], E, R = b.target, P = Math.abs(S) > Math.abs(j) ? "h" : "v";
    if ("touches" in b && P === "h" && R.type === "range")
      return !1;
    var v = window.getSelection(), T = v && v.anchorNode, L = T ? T === R || T.contains(R) : !1;
    if (L)
      return !1;
    var _ = tl(P, R);
    if (!_)
      return !0;
    if (_ ? E = P : (E = P === "v" ? "h" : "v", _ = tl(P, R)), !_)
      return !1;
    if (!o.current && "changedTouches" in b && (S || j) && (o.current = E), !E)
      return !0;
    var z = o.current || E;
    return vv(z, x, b, z === "h" ? S : j);
  }, []), l = p.useCallback(function(b) {
    var x = b;
    if (!(!ro.length || ro[ro.length - 1] !== s)) {
      var w = "deltaY" in x ? nl(x) : Ir(x), k = t.current.filter(function(E) {
        return E.name === x.type && (E.target === x.target || x.target === E.shadowParent) && yv(E.delta, w);
      })[0];
      if (k && k.should) {
        x.cancelable && x.preventDefault();
        return;
      }
      if (!k) {
        var S = (a.current.shards || []).map(ol).filter(Boolean).filter(function(E) {
          return E.contains(x.target);
        }), j = S.length > 0 ? i(x, S[0]) : !a.current.noIsolation;
        j && x.cancelable && x.preventDefault();
      }
    }
  }, []), u = p.useCallback(function(b, x, w, k) {
    var S = { name: b, delta: x, target: w, should: k, shadowParent: Sv(w) };
    t.current.push(S), setTimeout(function() {
      t.current = t.current.filter(function(j) {
        return j !== S;
      });
    }, 1);
  }, []), f = p.useCallback(function(b) {
    n.current = Ir(b), o.current = void 0;
  }, []), h = p.useCallback(function(b) {
    u(b.type, nl(b), b.target, i(b, e.lockRef.current));
  }, []), d = p.useCallback(function(b) {
    u(b.type, Ir(b), b.target, i(b, e.lockRef.current));
  }, []);
  p.useEffect(function() {
    return ro.push(s), e.setCallbacks({
      onScrollCapture: h,
      onWheelCapture: h,
      onTouchMoveCapture: d
    }), document.addEventListener("wheel", l, oo), document.addEventListener("touchmove", l, oo), document.addEventListener("touchstart", f, oo), function() {
      ro = ro.filter(function(b) {
        return b !== s;
      }), document.removeEventListener("wheel", l, oo), document.removeEventListener("touchmove", l, oo), document.removeEventListener("touchstart", f, oo);
    };
  }, []);
  var m = e.removeScrollBar, g = e.inert;
  return p.createElement(
    p.Fragment,
    null,
    g ? p.createElement(s, { styles: bv(r) }) : null,
    m ? p.createElement(uv, { noRelative: e.noRelative, gapMode: e.gapMode }) : null
  );
}
function Sv(e) {
  for (var t = null; e !== null; )
    e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
  return t;
}
const Cv = Jg(id, xv);
var fd = p.forwardRef(function(e, t) {
  return p.createElement(xs, Wt({}, e, { ref: t, sideCar: Cv }));
});
fd.classNames = xs.classNames;
function pd({ keepMounted: e, keepMountedMode: t = "activity", opened: n, onClose: o, id: r, transitionProps: s, onExitTransitionEnd: a, onEnterTransitionEnd: i, trapFocus: l, closeOnEscape: u, returnFocus: f, closeOnClickOutside: h, withinPortal: d, portalProps: m, lockScroll: g, children: b, zIndex: x, shadow: w, padding: k, __vars: S, unstyled: j, removeScrollProps: E, __handledEscapeEvents: R, ...P }) {
  const { _id: v, titleMounted: T, bodyMounted: L, shouldLockScroll: _, setTitleMounted: z, setBodyMounted: B } = Bg({
    id: r,
    transitionProps: s,
    opened: n,
    trapFocus: l,
    closeOnEscape: u,
    onClose: o,
    returnFocus: f,
    handledEscapeEvents: R
  }), { key: M, ...A } = E || {};
  return /* @__PURE__ */ c.jsx(ii, {
    ...m,
    withinPortal: d,
    children: /* @__PURE__ */ c.jsx(zg, {
      value: {
        opened: n,
        onClose: o,
        closeOnClickOutside: h,
        onExitTransitionEnd: a,
        onEnterTransitionEnd: i,
        transitionProps: {
          ...s,
          keepMounted: e,
          keepMountedMode: t
        },
        getTitleId: () => `${v}-title`,
        getBodyId: () => `${v}-body`,
        titleMounted: T,
        bodyMounted: L,
        setTitleMounted: z,
        setBodyMounted: B,
        trapFocus: l,
        closeOnEscape: u,
        zIndex: x,
        unstyled: j
      },
      children: /* @__PURE__ */ c.jsx(fd, {
        enabled: _ && g,
        ...A,
        children: /* @__PURE__ */ c.jsx(ee, {
          ...P,
          id: v,
          __vars: {
            ...S,
            "--mb-z-index": (x || ko("modal")).toString(),
            "--mb-shadow": au(w),
            "--mb-padding": Xo(k)
          },
          children: b
        })
      }, M)
    })
  });
}
pd.displayName = "@mantine/core/ModalBase";
function jv() {
  const e = cn();
  return p.useEffect(() => (e.setBodyMounted(!0), () => e.setBodyMounted(!1)), []), e.getBodyId();
}
var vo = {
  title: "m_615af6c9",
  header: "m_b5489c3c",
  inner: "m_60c222c7",
  content: "m_fd1ab0aa",
  close: "m_606cb269",
  body: "m_5df29311"
};
function hd({ className: e, ...t }) {
  const n = jv(), o = cn();
  return /* @__PURE__ */ c.jsx(ee, {
    id: n,
    className: rn({ [vo.body]: !o.unstyled }, e),
    ...t
  });
}
hd.displayName = "@mantine/core/ModalBaseBody";
function md({ className: e, onClick: t, ...n }) {
  const o = cn();
  return /* @__PURE__ */ c.jsx(ds, {
    ...n,
    onClick: (r) => {
      o.onClose(), t?.(r);
    },
    className: rn({ [vo.close]: !o.unstyled }, e),
    unstyled: o.unstyled
  });
}
md.displayName = "@mantine/core/ModalBaseCloseButton";
function gd({ transitionProps: e, className: t, innerProps: n, onKeyDown: o, style: r, ref: s, ...a }) {
  const i = cn();
  return /* @__PURE__ */ c.jsx(cs, {
    mounted: i.opened,
    transition: "pop",
    ...i.transitionProps,
    onExited: () => {
      i.onExitTransitionEnd?.(), i.transitionProps?.onExited?.();
    },
    onEntered: () => {
      i.onEnterTransitionEnd?.(), i.transitionProps?.onEntered?.();
    },
    ...e,
    children: (l) => /* @__PURE__ */ c.jsx("div", {
      ...n,
      className: rn({ [vo.inner]: !i.unstyled }, n.className),
      children: /* @__PURE__ */ c.jsx(ws, {
        active: i.opened && i.trapFocus,
        innerRef: s,
        children: /* @__PURE__ */ c.jsx(On, {
          ...a,
          component: "section",
          role: "dialog",
          tabIndex: -1,
          "aria-modal": !0,
          "aria-describedby": i.bodyMounted ? i.getBodyId() : void 0,
          "aria-labelledby": i.titleMounted ? i.getTitleId() : void 0,
          style: [r, l],
          className: rn({ [vo.content]: !i.unstyled }, t),
          unstyled: i.unstyled,
          children: a.children
        })
      })
    })
  });
}
gd.displayName = "@mantine/core/ModalBaseContent";
function vd({ className: e, ...t }) {
  const n = cn();
  return /* @__PURE__ */ c.jsx(ee, {
    component: "header",
    className: rn({ [vo.header]: !n.unstyled }, e),
    ...t
  });
}
vd.displayName = "@mantine/core/ModalBaseHeader";
const kv = {
  duration: 200,
  timingFunction: "ease",
  transition: "fade"
};
function Ev(e) {
  const t = cn();
  return {
    ...kv,
    ...t.transitionProps,
    ...e
  };
}
function yd({ onClick: e, transitionProps: t, style: n, visible: o, ...r }) {
  const s = cn(), a = Ev(t);
  return /* @__PURE__ */ c.jsx(cs, {
    mounted: o !== void 0 ? o : s.opened,
    ...a,
    transition: "fade",
    children: (i) => /* @__PURE__ */ c.jsx(du, {
      fixed: !0,
      style: [n, i],
      zIndex: s.zIndex,
      unstyled: s.unstyled,
      onClick: (l) => {
        e?.(l), s.closeOnClickOutside && s.onClose();
      },
      ...r
    })
  });
}
yd.displayName = "@mantine/core/ModalBaseOverlay";
function Rv() {
  const e = cn();
  return p.useEffect(() => (e.setTitleMounted(!0), () => e.setTitleMounted(!1)), []), e.getTitleId();
}
function bd({ className: e, ...t }) {
  const n = Rv(), o = cn();
  return /* @__PURE__ */ c.jsx(ee, {
    component: "h2",
    className: rn({ [vo.title]: !o.unstyled }, e),
    id: n,
    ...t
  });
}
bd.displayName = "@mantine/core/ModalBaseTitle";
function Nv({ children: e }) {
  return /* @__PURE__ */ c.jsx(c.Fragment, { children: e });
}
const Tv = {
  gap: {
    type: "spacing",
    property: "gap"
  },
  rowGap: {
    type: "spacing",
    property: "rowGap"
  },
  columnGap: {
    type: "spacing",
    property: "columnGap"
  },
  align: {
    type: "identity",
    property: "alignItems"
  },
  justify: {
    type: "identity",
    property: "justifyContent"
  },
  wrap: {
    type: "identity",
    property: "flexWrap"
  },
  direction: {
    type: "identity",
    property: "flexDirection"
  }
};
var wd = { root: "m_8bffd616" };
const $n = iu((e) => {
  const t = Q("Flex", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, gap: l, rowGap: u, columnGap: f, align: h, justify: d, wrap: m, direction: g, attributes: b, ...x } = t, w = Me({
    name: "Flex",
    classes: wd,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: b,
    vars: i
  }), k = ur(), S = Yp(), j = Xp({
    styleProps: {
      gap: l,
      rowGap: u,
      columnGap: f,
      align: h,
      justify: d,
      wrap: m,
      direction: g
    },
    theme: k,
    data: Tv
  }), E = Gp(), R = E && j.hasResponsiveStyles ? Jp(j.styles, j.media) : S;
  return /* @__PURE__ */ c.jsxs(c.Fragment, { children: [j.hasResponsiveStyles && /* @__PURE__ */ c.jsx(Zp, {
    selector: `.${R}`,
    styles: j.styles,
    media: j.media,
    deduplicate: E
  }), /* @__PURE__ */ c.jsx(ee, {
    ...w("root", {
      className: R,
      style: Qp(j.inlineStyles)
    }),
    ...x
  })] });
});
$n.classes = wd;
$n.displayName = "@mantine/core/Flex";
function Pv(e, t) {
  if (!t || !e) return !1;
  let n = t.parentNode;
  for (; n != null; ) {
    if (n === e) return !0;
    n = n.parentNode;
  }
  return !1;
}
function Av({ target: e, parent: t, ref: n, displayAfterTransitionEnd: o, onTransitionStart: r, onTransitionEnd: s }) {
  const a = p.useRef(-1), i = p.useRef(e), [l, u] = p.useState(!1), [f, h] = p.useState(typeof o == "boolean" ? o : !1), d = () => {
    if (!e || !t || !n.current) return;
    const x = e.getBoundingClientRect(), w = t.getBoundingClientRect(), k = t.offsetWidth === 0 ? 1 : w.width / t.offsetWidth, S = t.offsetHeight === 0 ? 1 : w.height / t.offsetHeight, j = window.getComputedStyle(e), E = window.getComputedStyle(t), R = vn(j.borderTopWidth) + vn(E.borderTopWidth), P = vn(j.borderLeftWidth) + vn(E.borderLeftWidth), v = {
      top: (x.top - w.top) / S - R,
      left: (x.left - w.left) / k - P,
      width: x.width / k,
      height: x.height / S
    };
    n.current.style.transform = `translateY(${v.top}px) translateX(${v.left}px)`, n.current.style.width = `${v.width}px`, n.current.style.height = `${v.height}px`;
  }, m = () => {
    window.clearTimeout(a.current), n.current && (n.current.style.transitionDuration = "0ms"), d(), a.current = window.setTimeout(() => {
      n.current && (n.current.style.transitionDuration = "");
    }, 30);
  }, g = p.useRef(null), b = p.useRef(null);
  return p.useEffect(() => {
    if (l && i.current !== e && r && r(), i.current = e, d(), e)
      return g.current = new ResizeObserver(m), g.current.observe(e), t && (b.current = new ResizeObserver(m), b.current.observe(t)), () => {
        g.current?.disconnect(), b.current?.disconnect();
      };
  }, [t, e]), p.useEffect(() => {
    if (t) {
      const x = (w) => {
        Pv(w.target, t) && (m(), h(!1));
      };
      return t.addEventListener("transitionend", x), () => {
        t.removeEventListener("transitionend", x);
      };
    }
  }, [t]), p.useEffect(() => {
    if (n.current && s) {
      const x = (w) => {
        w.propertyName === "transform" && s();
      };
      return n.current.addEventListener("transitionend", x), () => {
        n.current?.removeEventListener("transitionend", x);
      };
    }
  }, [s]), Ph(() => {
    Cu() !== "test" && u(!0);
  }, 20, { autoInvoke: !0 }), Dh((x) => {
    x.forEach((w) => {
      w.type === "attributes" && w.attributeName === "dir" && m();
    });
  }, {
    attributes: !0,
    attributeFilter: ["dir"]
  }, () => document.documentElement), {
    initialized: l,
    hidden: f
  };
}
var xd = { root: "m_96b553a6" };
const Sd = _e((e, { transitionDuration: t }, { shouldReduceMotion: n }) => ({ root: { "--transition-duration": e.respectReducedMotion && n ? "0ms" : typeof t == "number" ? `${t}ms` : t || "150ms" } })), Ss = ae((e) => {
  const t = Q("FloatingIndicator", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, target: l, parent: u, transitionDuration: f, mod: h, displayAfterTransitionEnd: d, onTransitionStart: m, onTransitionEnd: g, attributes: b, ref: x, ...w } = t, k = si(), S = Me({
    name: "FloatingIndicator",
    classes: xd,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: b,
    vars: i,
    varsResolver: Sd,
    stylesCtx: { shouldReduceMotion: k }
  }), j = p.useRef(null), { initialized: E, hidden: R } = Av({
    target: l,
    parent: u,
    ref: j,
    displayAfterTransitionEnd: d,
    onTransitionStart: m,
    onTransitionEnd: g
  }), P = We(x, j);
  return !l || !u ? null : /* @__PURE__ */ c.jsx(ee, {
    ref: P,
    mod: [{
      initialized: E,
      hidden: R
    }, h],
    ...S("root"),
    ...w
  });
});
Ss.displayName = "@mantine/core/FloatingIndicator";
Ss.classes = xd;
Ss.varsResolver = Sd;
const [Iv, ji] = Jt("Accordion component was not found in the tree");
function ki({ style: e, size: t = 16, ...n }) {
  return /* @__PURE__ */ c.jsx("svg", {
    viewBox: "0 0 15 15",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    style: {
      ...e,
      width: Ae(t),
      height: Ae(t),
      display: "block"
    },
    ...n,
    children: /* @__PURE__ */ c.jsx("path", {
      d: "M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z",
      fill: "currentColor",
      fillRule: "evenodd",
      clipRule: "evenodd"
    })
  });
}
ki.displayName = "@mantine/core/AccordionChevron";
const [Mv, Cd] = Jt("Accordion.Item component was not found in the tree");
var hr = {
  root: "m_9bdbb667",
  panel: "m_df78851f",
  content: "m_4ba554d4",
  itemTitle: "m_8fa820a0",
  control: "m_4ba585b8",
  "control--default": "m_6939a5e9",
  "control--contained": "m_4271d21b",
  label: "m_df3ffa0f",
  chevron: "m_3f35ae96",
  icon: "m_9bd771fe",
  item: "m_9bd7b098",
  "item--default": "m_fe19b709",
  "item--contained": "m_1f921b3b",
  "item--filled": "m_2cdf939a",
  "item--separated": "m_9f59b069"
};
const Ei = ae((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, chevron: a, icon: i, onClick: l, onKeyDown: u, children: f, disabled: h, mod: d, ...m } = Q("AccordionControl", null, e), { value: g } = Cd(), b = ji(), x = b.isItemActive(g), w = typeof b.order == "number", k = `h${b.order}`, S = /* @__PURE__ */ c.jsxs(zn, {
    ...b.getStyles("control", {
      className: n,
      classNames: t,
      style: o,
      styles: r,
      variant: b.variant
    }),
    unstyled: b.unstyled,
    mod: [
      "accordion-control",
      {
        active: x,
        "chevron-position": b.chevronPosition,
        disabled: h
      },
      d
    ],
    onClick: (j) => {
      l?.(j), b.onChange(g);
    },
    type: "button",
    disabled: h,
    "aria-expanded": x,
    "aria-controls": b.getRegionId(g),
    id: b.getControlId(g),
    onKeyDown: mu({
      siblingSelector: "[data-accordion-control]",
      parentSelector: "[data-accordion]",
      activateOnFocus: !1,
      loop: b.loop,
      orientation: "vertical",
      onKeyDown: u
    }),
    ...m,
    children: [
      /* @__PURE__ */ c.jsx(ee, {
        component: "span",
        mod: {
          rotate: !b.disableChevronRotation && x,
          position: b.chevronPosition
        },
        ...b.getStyles("chevron", {
          classNames: t,
          styles: r
        }),
        children: a || b.chevron
      }),
      /* @__PURE__ */ c.jsx("span", {
        ...b.getStyles("label", {
          classNames: t,
          styles: r
        }),
        children: f
      }),
      i && /* @__PURE__ */ c.jsx(ee, {
        component: "span",
        mod: { "chevron-position": b.chevronPosition },
        ...b.getStyles("icon", {
          classNames: t,
          styles: r
        }),
        children: i
      })
    ]
  });
  return w ? /* @__PURE__ */ c.jsx(k, {
    ...b.getStyles("itemTitle", {
      classNames: t,
      styles: r
    }),
    children: S
  }) : S;
});
Ei.displayName = "@mantine/core/AccordionControl";
Ei.classes = hr;
const Ri = ae((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, value: a, mod: i, ...l } = Q("AccordionItem", null, e), u = ji();
  return /* @__PURE__ */ c.jsx(Mv, {
    value: { value: a },
    children: /* @__PURE__ */ c.jsx(ee, {
      mod: [{ active: u.isItemActive(a) }, i],
      ...u.getStyles("item", {
        className: n,
        classNames: t,
        styles: r,
        style: o,
        variant: u.variant
      }),
      ...l
    })
  });
});
Ri.displayName = "@mantine/core/AccordionItem";
Ri.classes = hr;
const Ni = ae((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, children: a, keepMounted: i, keepMountedMode: l, ...u } = Q("AccordionPanel", null, e), { value: f } = Cd(), h = ji();
  return /* @__PURE__ */ c.jsx(Eu, {
    ...h.getStyles("panel", {
      className: n,
      classNames: t,
      style: o,
      styles: r
    }),
    expanded: h.isItemActive(f),
    transitionDuration: h.transitionDuration ?? 200,
    role: "region",
    id: h.getRegionId(f),
    "aria-labelledby": h.getControlId(f),
    keepMounted: i ?? h.keepMounted,
    keepMountedMode: l ?? h.keepMountedMode,
    ...u,
    children: /* @__PURE__ */ c.jsx("div", {
      ...h.getStyles("content", {
        classNames: t,
        styles: r
      }),
      children: a
    })
  });
});
Ni.displayName = "@mantine/core/AccordionPanel";
Ni.classes = hr;
const Dv = {
  multiple: !1,
  loop: !0,
  disableChevronRotation: !1,
  disableCollapse: !1,
  chevronPosition: "right",
  variant: "default",
  chevronSize: "auto",
  chevronIconSize: 16,
  keepMountedMode: "activity"
}, jd = _e((e, { transitionDuration: t, chevronSize: n, radius: o }) => ({ root: {
  "--accordion-transition-duration": t === void 0 ? void 0 : `${t}ms`,
  "--accordion-chevron-size": n === void 0 ? void 0 : Ae(n),
  "--accordion-radius": o === void 0 ? void 0 : St(o)
} })), Pe = Rn((e) => {
  const t = Q("Accordion", Dv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, children: l, multiple: u, value: f, defaultValue: h, onChange: d, id: m, loop: g, transitionDuration: b, disableChevronRotation: x, disableCollapse: w, chevronPosition: k, chevronSize: S, order: j, chevron: E, variant: R, radius: P, chevronIconSize: v, attributes: T, keepMounted: L, keepMountedMode: _, ...z } = t, B = Pt(m), [M, A] = et({
    value: f,
    defaultValue: h,
    finalValue: u ? [] : null,
    onChange: d
  }), O = (V) => Array.isArray(M) ? M.includes(V) : V === M, $ = (V) => {
    if (!Array.isArray(M) && w && V === M) return;
    const D = Array.isArray(M) ? M.includes(V) ? M.filter((F) => F !== V) : [...M, V] : V === M ? null : V;
    A(D);
  }, I = Me({
    name: "Accordion",
    classes: hr,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: T,
    vars: i,
    varsResolver: jd
  });
  return /* @__PURE__ */ c.jsx(Iv, {
    value: {
      isItemActive: O,
      onChange: $,
      getControlId: qr(`${B}-control`, "Accordion.Item component was rendered with invalid value or without value"),
      getRegionId: qr(`${B}-panel`, "Accordion.Item component was rendered with invalid value or without value"),
      chevron: E === null ? null : E || /* @__PURE__ */ c.jsx(ki, { size: v }),
      transitionDuration: b,
      disableChevronRotation: x,
      chevronPosition: k,
      order: j,
      loop: g,
      getStyles: I,
      variant: R,
      unstyled: a,
      keepMounted: L,
      keepMountedMode: _
    },
    children: /* @__PURE__ */ c.jsx(ee, {
      ...I("root"),
      id: B,
      ...z,
      variant: R,
      "data-accordion": !0,
      children: l
    })
  });
});
Pe.classes = hr;
Pe.varsResolver = jd;
Pe.displayName = "@mantine/core/Accordion";
Pe.Item = Ri;
Pe.Panel = Ni;
Pe.Control = Ei;
Pe.Chevron = ki;
var kd = {
  root: "m_66836ed3",
  wrapper: "m_a5d60502",
  body: "m_667c2793",
  title: "m_6a03f287",
  label: "m_698f4f23",
  icon: "m_667f2a6a",
  message: "m_7fa78076",
  closeButton: "m_87f54839"
};
const Ed = _e((e, { radius: t, color: n, variant: o, autoContrast: r }) => {
  const s = e.variantColorResolver({
    color: n || e.primaryColor,
    theme: e,
    variant: o || "light",
    autoContrast: r
  });
  return { root: {
    "--alert-radius": t === void 0 ? void 0 : St(t),
    "--alert-bg": n || o ? s.background : void 0,
    "--alert-color": s.color,
    "--alert-bd": n || o ? s.border : void 0
  } };
}), Cs = ae((e) => {
  const t = Q("Alert", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, radius: l, color: u, title: f, children: h, id: d, icon: m, withCloseButton: g, onClose: b, closeButtonLabel: x, variant: w, autoContrast: k, role: S, attributes: j, ...E } = t, R = Me({
    name: "Alert",
    classes: kd,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: j,
    vars: i,
    varsResolver: Ed
  }), P = Pt(d), v = f && `${P}-title` || void 0, T = `${P}-body`;
  return /* @__PURE__ */ c.jsx(ee, {
    id: P,
    ...R("root", { variant: w }),
    variant: w,
    ...E,
    role: S || "alert",
    "aria-describedby": h ? T : void 0,
    "aria-labelledby": f ? v : void 0,
    children: /* @__PURE__ */ c.jsxs("div", {
      ...R("wrapper"),
      children: [
        m && /* @__PURE__ */ c.jsx("div", {
          ...R("icon"),
          children: m
        }),
        /* @__PURE__ */ c.jsxs("div", {
          ...R("body"),
          children: [f && /* @__PURE__ */ c.jsx("div", {
            ...R("title"),
            "data-with-close-button": g || void 0,
            children: /* @__PURE__ */ c.jsx("span", {
              id: v,
              ...R("label"),
              children: f
            })
          }), h && /* @__PURE__ */ c.jsx("div", {
            id: T,
            ...R("message"),
            "data-variant": w,
            children: h
          })]
        }),
        g && /* @__PURE__ */ c.jsx(ds, {
          ...R("closeButton"),
          onClick: b,
          variant: "transparent",
          size: 16,
          iconSize: 16,
          "aria-label": x,
          unstyled: a
        })
      ]
    })
  });
});
Cs.classes = kd;
Cs.varsResolver = Ed;
Cs.displayName = "@mantine/core/Alert";
function Rd(e) {
  return typeof e == "string" ? {
    value: e,
    label: e
  } : typeof e == "object" && "value" in e && !("label" in e) ? {
    value: e.value,
    label: `${e.value}`,
    disabled: e.disabled
  } : typeof e == "object" && "group" in e ? {
    group: e.group,
    items: e.items.map((t) => Rd(t))
  } : typeof e == "number" || typeof e == "bigint" || typeof e == "boolean" ? {
    value: e,
    label: `${e}`
  } : e;
}
function Nd(e) {
  return e ? e.map((t) => Rd(t)) : [];
}
function Td(e) {
  return e.reduce((t, n) => "group" in n ? {
    ...t,
    ...Td(n.items)
  } : (t[`${n.value}`] = n, t), {});
}
var ft = {
  dropdown: "m_88b62a41",
  search: "m_985517d8",
  options: "m_b2821a6e",
  option: "m_92253aa5",
  empty: "m_2530cd1d",
  header: "m_858f94bd",
  footer: "m_82b967cb",
  group: "m_254f3e4f",
  groupLabel: "m_2bb2e9e5",
  chevron: "m_2943220b",
  optionsDropdownOption: "m_390b5f4",
  optionsDropdownCheckIcon: "m_8ee53fc2",
  optionsDropdownCheckPlaceholder: "m_a530ee0a"
};
const Ov = { error: null }, Pd = _e((e, { size: t, color: n }) => ({ chevron: {
  "--combobox-chevron-size": Fe(t, "combobox-chevron-size"),
  "--combobox-chevron-color": n ? it(n, e) : void 0
} })), mr = ae((e) => {
  const t = Q("ComboboxChevron", Ov, e), { size: n, error: o, style: r, className: s, classNames: a, styles: i, unstyled: l, vars: u, attributes: f, mod: h, ...d } = t, m = Me({
    name: "ComboboxChevron",
    classes: ft,
    props: t,
    style: r,
    className: s,
    classNames: a,
    styles: i,
    unstyled: l,
    vars: u,
    varsResolver: Pd,
    attributes: f,
    rootSelector: "chevron"
  });
  return /* @__PURE__ */ c.jsx(ee, {
    component: "svg",
    ...d,
    ...m("chevron"),
    size: n,
    viewBox: "0 0 15 15",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    mod: [
      "combobox-chevron",
      { error: o },
      h
    ],
    children: /* @__PURE__ */ c.jsx("path", {
      d: "M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z",
      fill: "currentColor",
      fillRule: "evenodd",
      clipRule: "evenodd"
    })
  });
});
mr.classes = ft;
mr.varsResolver = Pd;
mr.displayName = "@mantine/core/ComboboxChevron";
const [Lv, jt] = Jt("Combobox component was not found in tree");
function Ad({ onMouseDown: e, onClick: t, onClear: n, ...o }) {
  return /* @__PURE__ */ c.jsx(Nt.ClearButton, {
    tabIndex: -1,
    "aria-hidden": !0,
    ...o,
    onMouseDown: (r) => {
      r.preventDefault(), e?.(r);
    },
    onClick: (r) => {
      n(), t?.(r);
    }
  });
}
Ad.displayName = "@mantine/core/ComboboxClearButton";
const Ti = ae((e) => {
  const { classNames: t, styles: n, className: o, style: r, hidden: s, ...a } = Q("ComboboxDropdown", null, e), i = jt();
  return /* @__PURE__ */ c.jsx(qe.Dropdown, {
    ...a,
    role: "presentation",
    "data-hidden": s || void 0,
    "data-floating-height": i.floatingHeight || void 0,
    ...i.getStyles("dropdown", {
      className: o,
      style: r,
      classNames: t,
      styles: n
    })
  });
});
Ti.classes = ft;
Ti.displayName = "@mantine/core/ComboboxDropdown";
const $v = { refProp: "ref" }, Id = ae((e) => {
  const { children: t, refProp: n, ref: o } = Q("ComboboxDropdownTarget", $v, e);
  if (jt(), !uu(t)) throw new Error("Combobox.DropdownTarget component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  return /* @__PURE__ */ c.jsx(qe.Target, {
    ref: o,
    refProp: n,
    children: t
  });
});
Id.displayName = "@mantine/core/ComboboxDropdownTarget";
const Pi = ae((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Q("ComboboxEmpty", null, e), i = jt();
  return /* @__PURE__ */ c.jsx(ee, {
    ...i.getStyles("empty", {
      className: n,
      classNames: t,
      styles: r,
      style: o
    }),
    ...a
  });
});
Pi.classes = ft;
Pi.displayName = "@mantine/core/ComboboxEmpty";
function Ai({ onKeyDown: e, onClick: t, withKeyboardNavigation: n, withAriaAttributes: o, withExpandedAttribute: r, targetType: s, autoComplete: a }) {
  const i = jt(), [l, u] = p.useState(null), f = (m) => {
    if (e?.(m), !i.readOnly && n) {
      if (m.nativeEvent.isComposing) return;
      if (m.nativeEvent.code === "ArrowDown" && (m.preventDefault(), i.store.dropdownOpened ? u(i.store.selectNextOption()) : (i.store.openDropdown("keyboard"), u(i.store.selectActiveOption()), i.store.updateSelectedOptionIndex("selected", { scrollIntoView: !0 }))), m.nativeEvent.code === "ArrowUp" && (m.preventDefault(), i.store.dropdownOpened ? u(i.store.selectPreviousOption()) : (i.store.openDropdown("keyboard"), u(i.store.selectActiveOption()), i.store.updateSelectedOptionIndex("selected", { scrollIntoView: !0 }))), m.nativeEvent.code === "Enter" || m.nativeEvent.code === "NumpadEnter") {
        if (m.nativeEvent.keyCode === 229) return;
        const g = i.store.getSelectedOptionIndex();
        i.store.dropdownOpened && g !== -1 ? (m.preventDefault(), i.store.clickSelectedOption()) : s === "button" && (m.preventDefault(), i.store.openDropdown("keyboard"));
      }
      m.key === "Escape" && i.store.closeDropdown("keyboard"), m.nativeEvent.code === "Space" && s === "button" && (m.preventDefault(), i.store.toggleDropdown("keyboard"));
    }
  };
  return {
    ...o ? {
      ...r ? { role: "combobox" } : {},
      "aria-haspopup": "listbox",
      "aria-expanded": r ? !!(i.store.listId && i.store.dropdownOpened) : void 0,
      "aria-controls": i.store.dropdownOpened && i.store.listId ? i.store.listId : void 0,
      "aria-activedescendant": i.store.dropdownOpened && l || void 0,
      autoComplete: a,
      "data-expanded": i.store.dropdownOpened || void 0,
      "data-mantine-stop-propagation": i.store.dropdownOpened || void 0
    } : {},
    onKeyDown: f,
    onClick: (m) => {
      s === "button" && m.currentTarget.focus(), t?.(m);
    }
  };
}
const _v = {
  refProp: "ref",
  targetType: "input",
  withKeyboardNavigation: !0,
  withAriaAttributes: !0,
  withExpandedAttribute: !1,
  autoComplete: "off"
}, Md = ae((e) => {
  const { children: t, refProp: n, withKeyboardNavigation: o, withAriaAttributes: r, withExpandedAttribute: s, targetType: a, autoComplete: i, ref: l, ...u } = Q("ComboboxEventsTarget", _v, e), f = fr(t);
  if (!f) throw new Error("Combobox.EventsTarget component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  const h = jt(), d = Ai({
    targetType: a,
    withAriaAttributes: r,
    withKeyboardNavigation: o,
    withExpandedAttribute: s,
    onKeyDown: f.props.onKeyDown,
    onClick: f.props.onClick,
    autoComplete: i
  });
  return p.cloneElement(f, {
    ...d,
    ...u,
    [n]: We(l, h.store.targetRef, ku(f))
  });
});
Md.displayName = "@mantine/core/ComboboxEventsTarget";
const Ii = ae((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Q("ComboboxFooter", null, e), i = jt();
  return /* @__PURE__ */ c.jsx(ee, {
    ...i.getStyles("footer", {
      className: n,
      classNames: t,
      style: o,
      styles: r
    }),
    ...a,
    onMouseDown: (l) => {
      l.preventDefault();
    }
  });
});
Ii.classes = ft;
Ii.displayName = "@mantine/core/ComboboxFooter";
const Mi = ae((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, children: a, label: i, id: l, ...u } = Q("ComboboxGroup", null, e), f = jt(), h = Pt(l), d = i != null && i !== !1 && i !== "";
  return /* @__PURE__ */ c.jsxs(ee, {
    role: "group",
    "aria-labelledby": d ? h : void 0,
    ...f.getStyles("group", {
      className: n,
      classNames: t,
      style: o,
      styles: r
    }),
    ...u,
    children: [d && /* @__PURE__ */ c.jsx("div", {
      id: h,
      ...f.getStyles("groupLabel", {
        classNames: t,
        styles: r
      }),
      children: i
    }), a]
  });
});
Mi.classes = ft;
Mi.displayName = "@mantine/core/ComboboxGroup";
const Di = ae((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Q("ComboboxHeader", null, e), i = jt();
  return /* @__PURE__ */ c.jsx(ee, {
    ...i.getStyles("header", {
      className: n,
      classNames: t,
      style: o,
      styles: r
    }),
    ...a,
    onMouseDown: (l) => {
      l.preventDefault();
    }
  });
});
Di.classes = ft;
Di.displayName = "@mantine/core/ComboboxHeader";
function Dd({ value: e, valuesDivider: t = ",", ...n }) {
  return /* @__PURE__ */ c.jsx("input", {
    type: "hidden",
    value: Array.isArray(e) ? e.join(t) : e ? `${e}` : "",
    ...n
  });
}
Dd.displayName = "@mantine/core/ComboboxHiddenInput";
const Oi = ae((e) => {
  const t = Q("ComboboxOption", null, e), { classNames: n, className: o, style: r, styles: s, vars: a, onClick: i, id: l, active: u, onMouseDown: f, onMouseOver: h, disabled: d, selected: m, mod: g, ...b } = t, x = jt(), w = p.useId(), k = l || w;
  return /* @__PURE__ */ c.jsx(ee, {
    ...x.getStyles("option", {
      className: o,
      classNames: n,
      styles: s,
      style: r
    }),
    ...b,
    id: k,
    mod: [
      "combobox-option",
      {
        "combobox-active": u,
        "combobox-disabled": d,
        "combobox-selected": m
      },
      g
    ],
    role: "option",
    onClick: (S) => {
      d ? S.preventDefault() : (x.onOptionSubmit?.(t.value, t), i?.(S));
    },
    onMouseDown: (S) => {
      S.preventDefault(), f?.(S);
    },
    onMouseOver: (S) => {
      x.resetSelectionOnOptionHover && x.store.resetSelectedOption(), h?.(S);
    }
  });
});
Oi.classes = ft;
Oi.displayName = "@mantine/core/ComboboxOption";
const Li = ae((e) => {
  const { classNames: t, className: n, style: o, styles: r, id: s, onMouseDown: a, labelledBy: i, ...l } = Q("ComboboxOptions", null, e), u = jt(), f = Pt(s);
  return p.useEffect(() => {
    u.store.setListId(f);
  }, [f]), /* @__PURE__ */ c.jsx(ee, {
    ...u.getStyles("options", {
      className: n,
      style: o,
      classNames: t,
      styles: r
    }),
    ...l,
    id: f,
    role: "listbox",
    "aria-labelledby": i,
    onMouseDown: (h) => {
      h.preventDefault(), a?.(h);
    }
  });
});
Li.classes = ft;
Li.displayName = "@mantine/core/ComboboxOptions";
const zv = {
  withAriaAttributes: !0,
  withKeyboardNavigation: !0
}, $i = ae((e) => {
  const { classNames: t, styles: n, unstyled: o, vars: r, withAriaAttributes: s, onKeyDown: a, onClick: i, withKeyboardNavigation: l, size: u, ref: f, ...h } = Q("ComboboxSearch", zv, e), d = jt(), m = d.getStyles("search"), g = Ai({
    targetType: "input",
    withAriaAttributes: s,
    withKeyboardNavigation: l,
    withExpandedAttribute: !1,
    onKeyDown: a,
    onClick: i,
    autoComplete: "off"
  });
  return /* @__PURE__ */ c.jsx(Nt, {
    ref: We(f, d.store.searchRef),
    classNames: [{ input: m.className }, t],
    styles: [{ input: m.style }, n],
    size: u || d.size,
    ...g,
    ...h,
    __staticSelector: "Combobox"
  });
});
$i.classes = ft;
$i.displayName = "@mantine/core/ComboboxSearch";
const Fv = {
  refProp: "ref",
  targetType: "input",
  withKeyboardNavigation: !0,
  withAriaAttributes: !0,
  withExpandedAttribute: !1,
  autoComplete: "off"
}, Od = ae((e) => {
  const { children: t, refProp: n, withKeyboardNavigation: o, withAriaAttributes: r, withExpandedAttribute: s, targetType: a, autoComplete: i, ref: l, ...u } = Q("ComboboxTarget", Fv, e), f = fr(t);
  if (!f) throw new Error("Combobox.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  const h = jt(), d = Ai({
    targetType: a,
    withAriaAttributes: r,
    withKeyboardNavigation: o,
    withExpandedAttribute: s,
    onKeyDown: f.props.onKeyDown,
    onClick: f.props.onClick,
    autoComplete: i
  }), m = p.cloneElement(f, {
    ...d,
    ...u
  });
  return /* @__PURE__ */ c.jsx(qe.Target, {
    refProp: n,
    ref: We(l, h.store.targetRef),
    children: m
  });
});
Od.displayName = "@mantine/core/ComboboxTarget";
function Bv(e, t, n) {
  for (let o = e - 1; o >= 0; o -= 1) if (!t[o].hasAttribute("data-combobox-disabled")) return o;
  if (n) {
    for (let o = t.length - 1; o > -1; o -= 1) if (!t[o].hasAttribute("data-combobox-disabled")) return o;
  }
  return e;
}
function Vv(e, t, n) {
  for (let o = e + 1; o < t.length; o += 1) if (!t[o].hasAttribute("data-combobox-disabled")) return o;
  if (n) {
    for (let o = 0; o < t.length; o += 1) if (!t[o].hasAttribute("data-combobox-disabled")) return o;
  }
  return e;
}
function Hv(e) {
  for (let t = 0; t < e.length; t += 1) if (!e[t].hasAttribute("data-combobox-disabled")) return t;
  return -1;
}
function _i({ defaultOpened: e, opened: t, onOpenedChange: n, onDropdownClose: o, onDropdownOpen: r, loop: s = !0, scrollBehavior: a = "instant" } = {}) {
  const [i, l] = et({
    value: t,
    defaultValue: e,
    finalValue: !1,
    onChange: n
  }), u = p.useRef(null), f = p.useRef(-1), h = p.useRef(null), d = p.useRef(null), m = p.useRef(-1), g = p.useRef(-1), b = p.useRef(-1), x = p.useCallback((O = "unknown") => {
    i || (l(!0), r?.(O));
  }, [
    l,
    r,
    i
  ]), w = p.useCallback((O = "unknown") => {
    i && (l(!1), o?.(O));
  }, [
    l,
    o,
    i
  ]), k = p.useCallback((O = "unknown") => {
    i ? w(O) : x(O);
  }, [
    w,
    x,
    i
  ]), S = p.useCallback(() => {
    const O = Ut(d.current);
    Or(`#${u.current} [data-combobox-selected]`, O)?.removeAttribute("data-combobox-selected");
  }, []), j = p.useCallback((O) => {
    const $ = Ut(d.current), I = Or(`#${u.current}`, $), V = I ? Zt("[data-combobox-option]", I) : null;
    if (!V) return null;
    const D = O >= V.length ? 0 : O < 0 ? V.length - 1 : O;
    return f.current = D, V?.[D] && !V[D].hasAttribute("data-combobox-disabled") ? (S(), V[D].setAttribute("data-combobox-selected", "true"), V[D].scrollIntoView({
      block: "nearest",
      behavior: a
    }), V[D].id) : null;
  }, [a, S]), E = p.useCallback(() => {
    const O = Ut(d.current), $ = Or(`#${u.current} [data-combobox-active]`, O);
    if ($) {
      const I = Zt(`#${u.current} [data-combobox-option]`, O).findIndex((V) => V === $);
      return j(I);
    }
    return j(0);
  }, [j]), R = p.useCallback(() => {
    const O = Ut(d.current), $ = Zt(`#${u.current} [data-combobox-option]`, O);
    return j(Vv(f.current, $, s));
  }, [j, s]), P = p.useCallback(() => {
    const O = Ut(d.current), $ = Zt(`#${u.current} [data-combobox-option]`, O);
    return j(Bv(f.current, $, s));
  }, [j, s]), v = p.useCallback(() => {
    const O = Ut(d.current), $ = Zt(`#${u.current} [data-combobox-option]`, O);
    return j(Hv($));
  }, [j]), T = p.useCallback((O = "selected", $) => {
    if (typeof O == "number") {
      f.current = O;
      const I = Ut(d.current), V = Zt(`#${u.current} [data-combobox-option]`, I);
      $?.scrollIntoView && V[O]?.scrollIntoView({
        block: "nearest",
        behavior: a
      });
      return;
    }
    b.current = window.setTimeout(() => {
      const I = Ut(d.current), V = Zt(`#${u.current} [data-combobox-option]`, I), D = V.findIndex((F) => F.hasAttribute(`data-combobox-${O}`));
      f.current = D, $?.scrollIntoView && V[D]?.scrollIntoView({
        block: "nearest",
        behavior: a
      });
    }, 0);
  }, []), L = p.useCallback(() => {
    f.current = -1, S();
  }, [S]), _ = p.useCallback(() => {
    const O = Ut(d.current);
    Zt(`#${u.current} [data-combobox-option]`, O)?.[f.current]?.click();
  }, []), z = p.useCallback((O) => {
    u.current = O;
  }, []), B = p.useCallback(() => {
    m.current = window.setTimeout(() => h.current?.focus(), 0);
  }, []), M = p.useCallback(() => {
    g.current = window.setTimeout(() => d.current?.focus(), 0);
  }, []), A = p.useCallback(() => f.current, []);
  return p.useEffect(() => () => {
    window.clearTimeout(m.current), window.clearTimeout(g.current), window.clearTimeout(b.current);
  }, []), {
    dropdownOpened: i,
    openDropdown: x,
    closeDropdown: w,
    toggleDropdown: k,
    selectedOptionIndex: f.current,
    getSelectedOptionIndex: A,
    selectOption: j,
    selectFirstOption: v,
    selectActiveOption: E,
    selectNextOption: R,
    selectPreviousOption: P,
    resetSelectedOption: L,
    updateSelectedOptionIndex: T,
    listId: u.current,
    setListId: z,
    clickSelectedOption: _,
    searchRef: h,
    focusSearchInput: B,
    targetRef: d,
    focusTarget: M
  };
}
const Uv = {
  keepMounted: !0,
  keepMountedMode: "display-none",
  withinPortal: !0,
  resetSelectionOnOptionHover: !1,
  width: "target",
  transitionProps: {
    transition: "fade",
    duration: 0
  },
  size: "sm"
}, Ld = _e((e, { size: t, dropdownPadding: n }) => ({
  options: {
    "--combobox-option-fz": Wr(t),
    "--combobox-option-padding": Fe(t, "combobox-option-padding")
  },
  dropdown: {
    "--combobox-padding": n === void 0 ? void 0 : Ae(n),
    "--combobox-option-fz": Wr(t),
    "--combobox-option-padding": Fe(t, "combobox-option-padding")
  }
})), Ce = (e) => {
  const t = Q("Combobox", Uv, e), { classNames: n, styles: o, unstyled: r, children: s, store: a, vars: i, onOptionSubmit: l, onClose: u, size: f, dropdownPadding: h, resetSelectionOnOptionHover: d, __staticSelector: m, readOnly: g, attributes: b, floatingHeight: x, middlewares: w, ...k } = t, S = x === "viewport" ? {
    ...w,
    flip: !1,
    size: {
      ...typeof w?.size == "object" ? w.size : {},
      padding: typeof w?.size == "object" && w.size.padding !== void 0 ? w.size.padding : 10,
      apply: ({ availableHeight: v, availableWidth: T, elements: L, ..._ }) => {
        L.floating.style.setProperty("--combobox-floating-max-height", `${v}px`);
        const z = w?.size;
        typeof z == "object" && z.apply ? z.apply({
          availableHeight: v,
          availableWidth: T,
          elements: L,
          ..._
        }) : z && Object.assign(L.floating.style, {
          maxWidth: `${T}px`,
          maxHeight: `${v}px`
        });
      }
    }
  } : w, j = _i(), E = a || j, R = Me({
    name: m || "Combobox",
    classes: ft,
    props: t,
    classNames: n,
    styles: o,
    unstyled: r,
    attributes: b,
    vars: i,
    varsResolver: Ld
  }), P = () => {
    u?.(), E.closeDropdown();
  };
  return /* @__PURE__ */ c.jsx(Lv, {
    value: {
      getStyles: R,
      store: E,
      onOptionSubmit: l,
      size: f,
      resetSelectionOnOptionHover: d,
      readOnly: g,
      floatingHeight: x
    },
    children: /* @__PURE__ */ c.jsx(qe, {
      opened: E.dropdownOpened,
      ...k,
      middlewares: S,
      onChange: (v) => !v && P(),
      withRoles: !1,
      unstyled: r,
      children: s
    })
  });
}, Wv = (e) => e;
Ce.extend = Wv;
Ce.classes = ft;
Ce.varsResolver = Ld;
Ce.displayName = "@mantine/core/Combobox";
Ce.Target = Od;
Ce.Dropdown = Ti;
Ce.Options = Li;
Ce.Option = Oi;
Ce.Search = $i;
Ce.Empty = Pi;
Ce.Chevron = mr;
Ce.Footer = Ii;
Ce.Header = Di;
Ce.EventsTarget = Md;
Ce.DropdownTarget = Id;
Ce.Group = Mi;
Ce.ClearButton = Ad;
Ce.HiddenInput = Dd;
function $d({ children: e, role: t }) {
  const n = p.use(dh);
  return n ? /* @__PURE__ */ c.jsx("div", {
    role: t,
    "aria-labelledby": n.labelId,
    "aria-describedby": n.describedBy,
    children: e
  }) : /* @__PURE__ */ c.jsx(c.Fragment, { children: e });
}
const zi = p.createContext(null), qv = { hiddenInputValuesSeparator: "," }, Fi = Rn(((e) => {
  const { value: t, defaultValue: n, onChange: o, size: r, wrapperProps: s, children: a, readOnly: i, name: l, hiddenInputValuesSeparator: u, hiddenInputProps: f, maxSelectedValues: h, disabled: d, ...m } = Q("CheckboxGroup", qv, e), [g, b] = et({
    value: t,
    defaultValue: n,
    finalValue: [],
    onChange: o
  }), x = (S) => {
    const j = typeof S == "string" ? S : S.currentTarget.value;
    if (i) return;
    const E = g.includes(j);
    !E && h && g.length >= h || b(E ? g.filter((R) => R !== j) : [...g, j]);
  }, w = (S) => {
    if (d) return !0;
    if (!h) return !1;
    const j = g.includes(S), E = g.length >= h;
    return !j && E;
  }, k = g.join(u);
  return /* @__PURE__ */ c.jsx(zi, {
    value: {
      value: g,
      onChange: x,
      size: r,
      isDisabled: w
    },
    children: /* @__PURE__ */ c.jsxs(Nt.Wrapper, {
      size: r,
      ...s,
      ...m,
      labelElement: "div",
      __staticSelector: "CheckboxGroup",
      children: [/* @__PURE__ */ c.jsx($d, {
        role: "group",
        children: a
      }), /* @__PURE__ */ c.jsx("input", {
        type: "hidden",
        name: l,
        value: k,
        ...f
      })]
    })
  });
}));
Fi.classes = Nt.Wrapper.classes;
Fi.displayName = "@mantine/core/CheckboxGroup";
var _d = { card: "m_26775b0a" };
const zd = p.createContext(null), Kv = { withBorder: !0 }, Fd = _e((e, { radius: t }) => ({ card: { "--card-radius": St(t) } })), js = ae((e) => {
  const t = Q("CheckboxCard", Kv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, checked: l, mod: u, withBorder: f, value: h, onClick: d, defaultChecked: m, onChange: g, indeterminate: b, attributes: x, ...w } = t, k = Me({
    name: "CheckboxCard",
    classes: _d,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: x,
    vars: i,
    varsResolver: Fd,
    rootSelector: "card"
  }), S = p.use(zi), j = typeof l == "boolean" ? l : S ? S.value.includes(h || "") : void 0, [E, R] = et({
    value: j,
    defaultValue: m,
    finalValue: !1,
    onChange: g
  });
  return /* @__PURE__ */ c.jsx(zd, {
    value: {
      checked: E,
      indeterminate: b
    },
    children: /* @__PURE__ */ c.jsx(zn, {
      mod: [{
        "with-border": f,
        checked: E,
        indeterminate: b
      }, u],
      ...k("card"),
      ...w,
      role: "checkbox",
      "aria-checked": b ? "mixed" : E,
      onClick: (P) => {
        d?.(P), S?.onChange(h || ""), R(!E);
      }
    })
  });
});
js.displayName = "@mantine/core/CheckboxCard";
js.classes = _d;
js.varsResolver = Fd;
function Bi({ size: e, style: t, ...n }) {
  const o = e !== void 0 ? {
    width: Ae(e),
    height: Ae(e),
    ...t
  } : t;
  return /* @__PURE__ */ c.jsx("svg", {
    viewBox: "0 0 10 7",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    style: o,
    "aria-hidden": !0,
    ...n,
    children: /* @__PURE__ */ c.jsx("path", {
      d: "M4 4.586L1.707 2.293A1 1 0 1 0 .293 3.707l3 3a.997.997 0 0 0 1.414 0l5-5A1 1 0 1 0 8.293.293L4 4.586z",
      fill: "currentColor",
      fillRule: "evenodd",
      clipRule: "evenodd"
    })
  });
}
function Bd({ indeterminate: e, ...t }) {
  return e ? /* @__PURE__ */ c.jsx("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 32 6",
    "aria-hidden": !0,
    ...t,
    children: /* @__PURE__ */ c.jsx("rect", {
      width: "32",
      height: "6",
      fill: "currentColor",
      rx: "3"
    })
  }) : /* @__PURE__ */ c.jsx(Bi, { ...t });
}
var Vd = {
  indicator: "m_5e5256ee",
  icon: "m_1b1c543a",
  "indicator--outline": "m_76e20374"
};
const Yv = {
  icon: Bd,
  variant: "filled",
  radius: "sm"
}, Hd = _e((e, { radius: t, color: n, size: o, iconColor: r, variant: s, autoContrast: a }) => {
  const i = ls({
    color: n || e.primaryColor,
    theme: e
  }), l = i.isThemeColor && i.shade === void 0 ? `var(--mantine-color-${i.color}-outline)` : i.color;
  return { indicator: {
    "--checkbox-size": Fe(o, "checkbox-size"),
    "--checkbox-radius": t === void 0 ? void 0 : St(t),
    "--checkbox-color": s === "outline" ? l : it(n, e),
    "--checkbox-icon-color": r ? it(r, e) : pr(a, e) ? jo({
      color: n,
      theme: e,
      autoContrast: a
    }) : void 0
  } };
}), ks = ae((e) => {
  const t = Q("CheckboxIndicator", Yv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, icon: l, indeterminate: u, radius: f, color: h, iconColor: d, autoContrast: m, checked: g, mod: b, variant: x, disabled: w, attributes: k, ...S } = t, j = Me({
    name: "CheckboxIndicator",
    classes: Vd,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: k,
    vars: i,
    varsResolver: Hd,
    rootSelector: "indicator"
  }), E = p.use(zd), R = typeof u == "boolean" ? u : E?.indeterminate, P = typeof g == "boolean" || typeof u == "boolean" ? g || u : E?.checked || E?.indeterminate || !1;
  return /* @__PURE__ */ c.jsx(ee, {
    ...j("indicator", { variant: x }),
    variant: x,
    mod: [{
      checked: P,
      disabled: w
    }, b],
    ...S,
    children: /* @__PURE__ */ c.jsx(l, {
      indeterminate: R,
      ...j("icon")
    })
  });
});
ks.displayName = "@mantine/core/CheckboxIndicator";
ks.classes = Vd;
ks.varsResolver = Hd;
var Ud = {
  root: "m_5f75b09e",
  body: "m_5f6e695e",
  labelWrapper: "m_d3ea56bb",
  label: "m_8ee546b8",
  description: "m_328f68c0",
  error: "m_8e8a99cc"
};
const Xv = Ud;
function Vi({ __staticSelector: e, __stylesApiProps: t, className: n, classNames: o, styles: r, unstyled: s, children: a, label: i, description: l, id: u, disabled: f, error: h, size: d, labelPosition: m = "left", bodyElement: g = "div", labelElement: b = "label", variant: x, style: w, vars: k, mod: S, attributes: j, ...E }) {
  const R = Me({
    name: e,
    props: t,
    className: n,
    style: w,
    classes: Ud,
    classNames: o,
    styles: r,
    unstyled: s,
    attributes: j
  }), P = l ? `${u}-description` : void 0, v = h && typeof h != "boolean" ? `${u}-error` : void 0;
  return /* @__PURE__ */ c.jsx(ee, {
    ...R("root"),
    __vars: {
      "--label-fz": Wr(d),
      "--label-lh": Fe(d, "label-lh")
    },
    mod: [{ "label-position": m }, S],
    variant: x,
    size: d,
    ...E,
    children: /* @__PURE__ */ c.jsxs(ee, {
      component: g,
      htmlFor: g === "label" ? u : void 0,
      ...R("body"),
      children: [a, /* @__PURE__ */ c.jsxs("div", {
        ...R("labelWrapper"),
        "data-disabled": f || void 0,
        children: [
          i && /* @__PURE__ */ c.jsx(ee, {
            component: b,
            htmlFor: b === "label" ? u : void 0,
            ...R("label"),
            "data-disabled": f || void 0,
            children: i
          }),
          l && /* @__PURE__ */ c.jsx(Nt.Description, {
            id: P,
            size: d,
            __inheritStyles: !1,
            ...R("description"),
            children: l
          }),
          h && typeof h != "boolean" && /* @__PURE__ */ c.jsx(Nt.Error, {
            id: v,
            size: d,
            __inheritStyles: !1,
            ...R("error"),
            children: h
          })
        ]
      })]
    })
  });
}
Vi.displayName = "@mantine/core/InlineInput";
var Wd = {
  root: "m_bf2d988c",
  inner: "m_26062bec",
  input: "m_26063560",
  icon: "m_bf295423",
  "input--outline": "m_215c4542"
};
const Gv = {
  labelPosition: "right",
  icon: Bd,
  withErrorStyles: !0,
  variant: "filled",
  radius: "sm"
}, qd = _e((e, { radius: t, color: n, size: o, iconColor: r, variant: s, autoContrast: a }) => {
  const i = ls({
    color: n || e.primaryColor,
    theme: e
  }), l = i.isThemeColor && i.shade === void 0 ? `var(--mantine-color-${i.color}-outline)` : i.color;
  return { root: {
    "--checkbox-size": Fe(o, "checkbox-size"),
    "--checkbox-radius": t === void 0 ? void 0 : St(t),
    "--checkbox-color": s === "outline" ? l : it(n, e),
    "--checkbox-icon-color": r ? it(r, e) : pr(a, e) ? jo({
      color: n,
      theme: e,
      autoContrast: a
    }) : void 0
  } };
}), Gt = ae((e) => {
  const t = Q("Checkbox", Gv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, color: l, label: u, id: f, size: h, radius: d, wrapperProps: m, checked: g, labelPosition: b, description: x, error: w, disabled: k, variant: S, indeterminate: j, icon: E, rootRef: R, iconColor: P, onChange: v, autoContrast: T, mod: L, attributes: _, readOnly: z, onClick: B, withErrorStyles: M, ref: A, ...O } = t, $ = p.useRef(null), I = p.use(zi), V = h || I?.size, D = Me({
    name: "Checkbox",
    props: t,
    classes: Wd,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: _,
    vars: i,
    varsResolver: qd
  }), { styleProps: F, rest: U } = cu(O), q = Pt(f), G = [
    x ? `${q}-description` : void 0,
    w && typeof w != "boolean" ? `${q}-error` : void 0,
    U["aria-describedby"]
  ].filter(Boolean).join(" ") || void 0, fe = {
    checked: I?.value.includes(U.value) ?? g,
    onChange: (de) => {
      z || (I?.onChange(de), v?.(de));
    }
  }, oe = I?.isDisabled?.(U.value) ?? !1, te = k || oe;
  return p.useEffect(() => {
    $.current && ($.current.indeterminate = j || !1, j ? $.current.setAttribute("data-indeterminate", "true") : $.current.removeAttribute("data-indeterminate"));
  }, [j]), /* @__PURE__ */ c.jsx(Vi, {
    ...D("root"),
    __staticSelector: "Checkbox",
    __stylesApiProps: t,
    id: q,
    size: V,
    labelPosition: b,
    label: u,
    description: x,
    error: w,
    disabled: te,
    classNames: n,
    styles: s,
    unstyled: a,
    "data-checked": fe.checked || g || void 0,
    variant: S,
    ref: R,
    mod: L,
    attributes: _,
    inert: U.inert,
    ...F,
    ...m,
    children: /* @__PURE__ */ c.jsxs(ee, {
      ...D("inner"),
      mod: { labelPosition: b },
      children: [/* @__PURE__ */ c.jsx(ee, {
        component: "input",
        id: q,
        ref: We($, A),
        mod: {
          error: !!w,
          "with-error-styles": M
        },
        ...D("input", {
          focusable: !0,
          variant: S
        }),
        ...U,
        ...fe,
        "aria-describedby": G,
        disabled: te,
        inert: U.inert,
        type: "checkbox",
        onClick: (de) => {
          z && fe.checked === void 0 && de.preventDefault(), B?.(de);
        }
      }), /* @__PURE__ */ c.jsx(E, {
        indeterminate: j,
        ...D("icon")
      })]
    })
  });
});
Gt.classes = {
  ...Wd,
  ...Xv
};
Gt.varsResolver = qd;
Gt.displayName = "@mantine/core/Checkbox";
Gt.Group = Fi;
Gt.Indicator = ks;
Gt.Card = js;
function Qo(e) {
  return "group" in e;
}
function Kd({ options: e, search: t, limit: n }) {
  const o = t.trim().toLowerCase(), r = [];
  for (let s = 0; s < e.length; s += 1) {
    const a = e[s];
    if (r.length === n) return r;
    Qo(a) && r.push({
      group: a.group,
      items: Kd({
        options: a.items,
        search: t,
        limit: n - r.length
      })
    }), Qo(a) || a.label.toLowerCase().includes(o) && r.push(a);
  }
  return r;
}
function Jv(e) {
  if (e.length === 0) return !0;
  for (const t of e)
    if (!("group" in t) || t.items.length > 0) return !1;
  return !0;
}
function Yd(e, t = /* @__PURE__ */ new Set()) {
  if (Array.isArray(e))
    for (const n of e) if (Qo(n)) Yd(n.items, t);
    else {
      if (typeof n.value > "u") throw new Error("[@mantine/core] Each option must have value property");
      if (t.has(n.value)) throw new Error(`[@mantine/core] Duplicate options are not supported. Option with value "${n.value}" was provided more than once`);
      t.add(n.value);
    }
}
function Zv(e, t) {
  return Array.isArray(e) ? e.includes(t) : e === t;
}
function Xd({ data: e, withCheckIcon: t, withAlignedLabels: n, value: o, checkIconPosition: r, unstyled: s, renderOption: a }) {
  if (!Qo(e)) {
    const l = Zv(o, e.value), u = t && (l ? /* @__PURE__ */ c.jsx(Bi, { className: ft.optionsDropdownCheckIcon }) : n ? /* @__PURE__ */ c.jsx("div", { className: ft.optionsDropdownCheckPlaceholder }) : null), f = /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
      r === "left" && u,
      /* @__PURE__ */ c.jsx("span", { children: e.label }),
      r === "right" && u
    ] });
    return /* @__PURE__ */ c.jsx(Ce.Option, {
      value: e.value,
      disabled: e.disabled,
      className: rn({ [ft.optionsDropdownOption]: !s }),
      "data-reverse": r === "right" || void 0,
      "data-checked": l || void 0,
      "aria-selected": l,
      active: l,
      children: typeof a == "function" ? a({
        option: e,
        checked: l
      }) : f
    });
  }
  const i = e.items.map((l) => /* @__PURE__ */ c.jsx(Xd, {
    data: l,
    value: o,
    unstyled: s,
    withCheckIcon: t,
    withAlignedLabels: n,
    checkIconPosition: r,
    renderOption: a
  }, `${l.value}`));
  return /* @__PURE__ */ c.jsx(Ce.Group, {
    label: e.group,
    children: i
  });
}
function Qv({ data: e, hidden: t, hiddenWhenEmpty: n, filter: o, search: r, limit: s, maxDropdownHeight: a, floatingHeight: i, withScrollArea: l = !0, filterOptions: u = !0, withCheckIcon: f = !1, withAlignedLabels: h = !1, value: d, checkIconPosition: m, nothingFoundMessage: g, unstyled: b, labelId: x, renderOption: w, scrollAreaProps: k, "aria-label": S }) {
  const j = jt();
  Yd(e);
  const E = typeof r == "string" ? (o || Kd)({
    options: e,
    search: u ? r : "",
    limit: s ?? 1 / 0
  }) : e, R = Jv(E), P = E.map((v, T) => /* @__PURE__ */ c.jsx(Xd, {
    data: v,
    withCheckIcon: f,
    withAlignedLabels: h,
    value: d,
    checkIconPosition: m,
    unstyled: b,
    renderOption: w
  }, Qo(v) ? `group-${typeof v.group == "string" ? v.group : T}` : `${v.value}`));
  return /* @__PURE__ */ c.jsx(Ce.Dropdown, {
    hidden: t || n && R,
    "data-composed": !0,
    children: /* @__PURE__ */ c.jsxs(Ce.Options, {
      labelledBy: x,
      "aria-label": S,
      children: [l ? /* @__PURE__ */ c.jsx(Tn.Autosize, {
        mah: (i ?? j.floatingHeight) === "viewport" ? "var(--combobox-floating-options-max-height)" : a ?? 220,
        type: "scroll",
        scrollbarSize: "var(--combobox-padding)",
        offsetScrollbars: "y",
        ...k,
        children: P
      }) : P, R && g && /* @__PURE__ */ c.jsx(Ce.Empty, { children: g })]
    })
  });
}
function ey(e) {
  const t = e.currentTarget;
  return Ut(t).activeElement !== t;
}
var Gd = {
  root: "m_de3d2490",
  colorOverlay: "m_862f3d1b",
  shadowOverlay: "m_98ae7f22",
  alphaOverlay: "m_95709ac0",
  childrenOverlay: "m_93e74e3"
};
const rl = { withShadow: !0 }, Jd = _e((e, { radius: t, size: n }) => ({ root: {
  "--cs-radius": t === void 0 ? void 0 : St(t),
  "--cs-size": Ae(n)
} })), To = iu((e) => {
  const t = Q("ColorSwatch", rl, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, color: l, radius: u, withShadow: f, children: h, attributes: d, ...m } = Q("ColorSwatch", rl, t), g = Me({
    name: "ColorSwatch",
    props: t,
    classes: Gd,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: d,
    vars: i,
    varsResolver: Jd
  });
  return /* @__PURE__ */ c.jsxs(ee, {
    ...g("root", { focusable: !0 }),
    ...m,
    children: [
      /* @__PURE__ */ c.jsx("span", { ...g("alphaOverlay") }),
      f && /* @__PURE__ */ c.jsx("span", { ...g("shadowOverlay") }),
      /* @__PURE__ */ c.jsx("span", { ...g("colorOverlay", { style: { backgroundColor: l } }) }),
      /* @__PURE__ */ c.jsx("span", {
        ...g("childrenOverlay"),
        children: h
      })
    ]
  });
});
To.classes = Gd;
To.varsResolver = Jd;
To.displayName = "@mantine/core/ColorSwatch";
function kt(e, t = 0, n = 10 ** t) {
  return Math.round(n * e) / n;
}
function ty({ h: e, s: t, l: n, a: o }) {
  const r = t * ((n < 50 ? n : 100 - n) / 100);
  return {
    h: e,
    s: r > 0 ? 2 * r / (n + r) * 100 : 0,
    v: n + r,
    a: o
  };
}
const ny = {
  grad: 360 / 400,
  turn: 360,
  rad: 360 / (Math.PI * 2)
};
function oy(e, t = "deg") {
  return Number(e) * (ny[t] || 1);
}
const ry = /hsla?\(?\s*(-?\d*\.?\d+)(deg|rad|grad|turn)?[,\s]+(-?\d*\.?\d+)%?[,\s]+(-?\d*\.?\d+)%?,?\s*[/\s]*(-?\d*\.?\d+)?(%)?\s*\)?/i;
function sl(e) {
  const t = ry.exec(e);
  return t ? ty({
    h: oy(t[1], t[2]),
    s: Number(t[3]),
    l: Number(t[4]),
    a: t[5] === void 0 ? 1 : Number(t[5]) / (t[6] ? 100 : 1)
  }) : {
    h: 0,
    s: 0,
    v: 0,
    a: 1
  };
}
function Oa({ r: e, g: t, b: n, a: o }) {
  const r = Math.max(e, t, n), s = r - Math.min(e, t, n), a = s ? r === e ? (t - n) / s : r === t ? 2 + (n - e) / s : 4 + (e - t) / s : 0;
  return {
    h: kt(60 * (a < 0 ? a + 6 : a), 3),
    s: kt(r ? s / r * 100 : 0, 3),
    v: kt(r / 255 * 100, 3),
    a: o
  };
}
function La(e) {
  const t = e[0] === "#" ? e.slice(1) : e;
  return t.length === 3 ? Oa({
    r: parseInt(t[0] + t[0], 16),
    g: parseInt(t[1] + t[1], 16),
    b: parseInt(t[2] + t[2], 16),
    a: 1
  }) : Oa({
    r: parseInt(t.slice(0, 2), 16),
    g: parseInt(t.slice(2, 4), 16),
    b: parseInt(t.slice(4, 6), 16),
    a: 1
  });
}
function sy(e) {
  const t = e[0] === "#" ? e.slice(1) : e, n = (s) => kt(parseInt(s, 16) / 255, 3);
  if (t.length === 4) {
    const s = t.slice(0, 3), a = n(t[3] + t[3]);
    return {
      ...La(s),
      a
    };
  }
  const o = t.slice(0, 6), r = n(t.slice(6, 8));
  return {
    ...La(o),
    a: r
  };
}
const ay = /rgba?\(?\s*(-?\d*\.?\d+)(%)?[,\s]+(-?\d*\.?\d+)(%)?[,\s]+(-?\d*\.?\d+)(%)?,?\s*[/\s]*(-?\d*\.?\d+)?(%)?\s*\)?/i;
function al(e) {
  const t = ay.exec(e);
  return t ? Oa({
    r: Number(t[1]) / (t[2] ? 100 / 255 : 1),
    g: Number(t[3]) / (t[4] ? 100 / 255 : 1),
    b: Number(t[5]) / (t[6] ? 100 / 255 : 1),
    a: t[7] === void 0 ? 1 : Number(t[7]) / (t[8] ? 100 : 1)
  }) : {
    h: 0,
    s: 0,
    v: 0,
    a: 1
  };
}
const Zd = {
  hex: /^#?([0-9A-F]{3}){1,2}$/i,
  hexa: /^#?([0-9A-F]{4}){1,2}$/i,
  rgb: /^rgb\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/i,
  rgba: /^rgba\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/i,
  hsl: /hsl\(\s*(\d+)\s*,\s*(\d+(?:\.\d+)?%)\s*,\s*(\d+(?:\.\d+)?%)\)/i,
  hsla: /^hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*(\d*(?:\.\d+)?)\)$/i
}, iy = {
  hex: La,
  hexa: sy,
  rgb: al,
  rgba: al,
  hsl: sl,
  hsla: sl
};
function Fo(e) {
  for (const [, t] of Object.entries(Zd)) if (t.test(e)) return !0;
  return !1;
}
function Mn(e) {
  if (typeof e != "string") return {
    h: 0,
    s: 0,
    v: 0,
    a: 1
  };
  if (e === "transparent") return {
    h: 0,
    s: 0,
    v: 0,
    a: 0
  };
  const t = e.trim();
  for (const [n, o] of Object.entries(Zd)) if (o.test(t)) return iy[n](t);
  return {
    h: 0,
    s: 0,
    v: 0,
    a: 1
  };
}
const Es = p.createContext(null);
function Hi({ position: e, ...t }) {
  return /* @__PURE__ */ c.jsx(ee, {
    __vars: {
      "--thumb-y-offset": `${e.y * 100}%`,
      "--thumb-x-offset": `${e.x * 100}%`
    },
    ...t
  });
}
Hi.displayName = "@mantine/core/ColorPickerThumb";
var Rs = {
  wrapper: "m_fee9c77",
  preview: "m_9dddfbac",
  body: "m_bffecc3e",
  sliders: "m_3283bb96",
  thumb: "m_40d572ba",
  swatch: "m_d8ee6fd8",
  swatches: "m_5711e686",
  saturation: "m_202a296e",
  saturationOverlay: "m_11b3db02",
  slider: "m_d856d47d",
  sliderOverlay: "m_8f327113"
};
const Po = ae((e) => {
  const t = Q("ColorSlider", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, onChange: l, onChangeEnd: u, maxValue: f, round: h, size: d = "md", focusable: m = !0, value: g, overlays: b, thumbColor: x = "transparent", onScrubStart: w, onScrubEnd: k, __staticSelector: S = "ColorPicker", attributes: j, ref: E, ...R } = t, P = Me({
    name: S,
    classes: Rs,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: j,
    rootSelector: "slider"
  }), v = p.use(Es)?.getStyles || P, T = ur(), [L, _] = p.useState({
    y: 0,
    x: g / f
  }), z = p.useRef(L), B = (I) => h ? Math.round(I * f) : I * f, { ref: M } = Su(({ x: I, y: V }) => {
    z.current = {
      x: I,
      y: V
    }, l?.(B(I));
  }, {
    onScrubEnd: () => {
      const { x: I } = z.current;
      u?.(B(I)), k?.();
    },
    onScrubStart: w
  });
  jn(() => {
    _({
      y: 0,
      x: g / f
    });
  }, [g]);
  const A = (I, V) => {
    I.preventDefault();
    const D = xu(V);
    l?.(B(D.x)), u?.(B(D.x));
  }, O = (I) => {
    switch (I.key) {
      case "ArrowRight":
        A(I, {
          x: L.x + 0.05,
          y: L.y
        });
        break;
      case "ArrowLeft":
        A(I, {
          x: L.x - 0.05,
          y: L.y
        });
    }
  }, $ = b.map((I, V) => /* @__PURE__ */ p.createElement("div", {
    ...v("sliderOverlay"),
    style: I,
    key: V
  }));
  return /* @__PURE__ */ c.jsxs(ee, {
    ...R,
    ref: We(M, E),
    ...v("slider"),
    size: d,
    role: "slider",
    "aria-valuenow": g,
    "aria-valuemax": f,
    "aria-valuemin": 0,
    tabIndex: m ? 0 : -1,
    onKeyDown: O,
    "data-focus-ring": T.focusRing,
    __vars: { "--cp-thumb-size": `var(--cp-thumb-size-${d})` },
    children: [$, /* @__PURE__ */ c.jsx(Hi, {
      position: L,
      ...v("thumb", { style: {
        top: Ae(1),
        background: x
      } })
    })]
  });
});
Po.displayName = "@mantine/core/ColorSlider";
Po.classes = Rs;
const cy = { __staticSelector: "AlphaSlider" }, Ui = ae((e) => {
  const { value: t, onChange: n, onChangeEnd: o, color: r, ...s } = Q("AlphaSlider", cy, e);
  return /* @__PURE__ */ c.jsx(Po, {
    ...s,
    value: t,
    onChange: (a) => n?.(kt(a, 2)),
    onChangeEnd: (a) => o?.(kt(a, 2)),
    maxValue: 1,
    round: !1,
    "data-alpha": !0,
    overlays: [
      {
        backgroundImage: "linear-gradient(45deg, var(--slider-checkers) 25%, transparent 25%), linear-gradient(-45deg, var(--slider-checkers) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--slider-checkers) 75%), linear-gradient(-45deg, var(--mantine-color-body) 75%, var(--slider-checkers) 75%)",
        backgroundSize: `${Ae(8)} ${Ae(8)}`,
        backgroundPosition: `0 0, 0 ${Ae(4)}, ${Ae(4)} ${Ae(-4)}, ${Ae(-4)} 0`
      },
      { backgroundImage: `linear-gradient(90deg, transparent, ${r})` },
      { boxShadow: `rgba(0, 0, 0, .1) 0 0 0 ${Ae(1)} inset, rgb(0, 0, 0, .15) 0 0 ${Ae(4)} inset` }
    ]
  });
});
Ui.displayName = "@mantine/core/AlphaSlider";
Ui.classes = Po.classes;
function Qd({ h: e, s: t, v: n, a: o }) {
  const r = e / 360 * 6, s = t / 100, a = n / 100, i = Math.floor(r), l = a * (1 - s), u = a * (1 - (r - i) * s), f = a * (1 - (1 - r + i) * s), h = i % 6;
  return {
    r: kt([
      a,
      u,
      l,
      l,
      f,
      a
    ][h] * 255),
    g: kt([
      f,
      a,
      a,
      u,
      l,
      l
    ][h] * 255),
    b: kt([
      l,
      l,
      f,
      a,
      a,
      u
    ][h] * 255),
    a: kt(o, 2)
  };
}
function il(e, t) {
  const { r: n, g: o, b: r, a: s } = Qd(e);
  return t ? `rgba(${n}, ${o}, ${r}, ${kt(s, 2)})` : `rgb(${n}, ${o}, ${r})`;
}
function cl({ h: e, s: t, v: n, a: o }, r) {
  const s = (200 - t) * n / 100, a = {
    h: Math.round(e),
    s: Math.round(s > 0 && s < 200 ? t * n / 100 / (s <= 100 ? s : 200 - s) * 100 : 0),
    l: Math.round(s / 2)
  };
  return r ? `hsla(${a.h}, ${a.s}%, ${a.l}%, ${kt(o, 2)})` : `hsl(${a.h}, ${a.s}%, ${a.l}%)`;
}
function zr(e) {
  const t = e.toString(16);
  return t.length < 2 ? `0${t}` : t;
}
function ef(e) {
  const { r: t, g: n, b: o } = Qd(e);
  return `#${zr(t)}${zr(n)}${zr(o)}`;
}
function ly(e) {
  const t = Math.round(e.a * 255);
  return `${ef(e)}${zr(t)}`;
}
const ca = {
  hex: ef,
  hexa: (e) => ly(e),
  rgb: (e) => il(e, !1),
  rgba: (e) => il(e, !0),
  hsl: (e) => cl(e, !1),
  hsla: (e) => cl(e, !0)
};
function Ot(e, t) {
  return t ? e in ca ? ca[e](t) : ca.hex(t) : "#000000";
}
const uy = { __staticSelector: "HueSlider" }, Wi = ae((e) => {
  const { value: t, onChange: n, onChangeEnd: o, color: r, ...s } = Q("HueSlider", uy, e);
  return /* @__PURE__ */ c.jsx(Po, {
    ...s,
    value: t,
    onChange: n,
    onChangeEnd: o,
    maxValue: 360,
    thumbColor: `hsl(${t}, 100%, 50%)`,
    round: !0,
    "data-hue": !0,
    overlays: [{ backgroundImage: "linear-gradient(to right,hsl(0,100%,50%),hsl(60,100%,50%),hsl(120,100%,50%),hsl(170,100%,50%),hsl(240,100%,50%),hsl(300,100%,50%),hsl(360,100%,50%))" }, { boxShadow: `rgba(0, 0, 0, .1) 0 0 0 ${Ae(1)} inset, rgb(0, 0, 0, .15) 0 0 ${Ae(4)} inset` }]
  });
});
Wi.displayName = "@mantine/core/HueSlider";
Wi.classes = Po.classes;
function tf({ className: e, onChange: t, onChangeEnd: n, value: o, saturationLabel: r, focusable: s = !0, size: a, color: i, onScrubStart: l, onScrubEnd: u, ...f }) {
  const { getStyles: h } = p.use(Es), [d, m] = p.useState({
    x: o.s / 100,
    y: 1 - o.v / 100
  }), g = p.useRef(d), { ref: b } = Su(({ x: k, y: S }) => {
    g.current = {
      x: k,
      y: S
    }, t({
      s: Math.round(k * 100),
      v: Math.round((1 - S) * 100)
    });
  }, {
    onScrubEnd: () => {
      const { x: k, y: S } = g.current;
      n({
        s: Math.round(k * 100),
        v: Math.round((1 - S) * 100)
      }), u?.();
    },
    onScrubStart: l
  });
  p.useEffect(() => {
    m({
      x: o.s / 100,
      y: 1 - o.v / 100
    });
  }, [o.s, o.v]);
  const x = (k, S) => {
    k.preventDefault();
    const j = xu(S);
    t({
      s: Math.round(j.x * 100),
      v: Math.round((1 - j.y) * 100)
    }), n({
      s: Math.round(j.x * 100),
      v: Math.round((1 - j.y) * 100)
    });
  }, w = (k) => {
    switch (k.key) {
      case "ArrowUp":
        x(k, {
          y: d.y - 0.05,
          x: d.x
        });
        break;
      case "ArrowDown":
        x(k, {
          y: d.y + 0.05,
          x: d.x
        });
        break;
      case "ArrowRight":
        x(k, {
          x: d.x + 0.05,
          y: d.y
        });
        break;
      case "ArrowLeft":
        x(k, {
          x: d.x - 0.05,
          y: d.y
        });
    }
  };
  return /* @__PURE__ */ c.jsxs(ee, {
    ...h("saturation"),
    ref: b,
    ...f,
    role: "slider",
    "aria-label": r,
    "aria-valuenow": d.x,
    "aria-valuetext": Ot("rgba", o),
    tabIndex: s ? 0 : -1,
    onKeyDown: w,
    children: [
      /* @__PURE__ */ c.jsx("div", { ...h("saturationOverlay", { style: { backgroundColor: `hsl(${o.h}, 100%, 50%)` } }) }),
      /* @__PURE__ */ c.jsx("div", { ...h("saturationOverlay", { style: { backgroundImage: "linear-gradient(90deg, #fff, transparent)" } }) }),
      /* @__PURE__ */ c.jsx("div", { ...h("saturationOverlay", { style: { backgroundImage: "linear-gradient(0deg, #000, transparent)" } }) }),
      /* @__PURE__ */ c.jsx(Hi, {
        position: d,
        ...h("thumb", { style: { backgroundColor: i } })
      })
    ]
  });
}
tf.displayName = "@mantine/core/Saturation";
function nf({ className: e, datatype: t, setValue: n, onChangeEnd: o, size: r, focusable: s, data: a, swatchesPerRow: i, value: l, ...u }) {
  const f = p.use(Es), h = a.map((d, m) => /* @__PURE__ */ p.createElement(To, {
    ...f.getStyles("swatch"),
    unstyled: f.unstyled,
    component: "button",
    type: "button",
    color: d,
    key: m,
    radius: "sm",
    onClick: () => {
      n(d), o?.(d);
    },
    "aria-label": d,
    tabIndex: s ? 0 : -1,
    "data-swatch": !0
  }, l === d && /* @__PURE__ */ c.jsx(Bi, {
    size: "35%",
    color: eh(d) < 0.5 ? "white" : "black"
  })));
  return /* @__PURE__ */ c.jsx(ee, {
    ...f.getStyles("swatches"),
    ...u,
    children: h
  });
}
nf.displayName = "@mantine/core/Swatches";
const dy = {
  swatchesPerRow: 7,
  withPicker: !0,
  focusable: !0,
  size: "md",
  __staticSelector: "ColorPicker"
}, of = _e((e, { size: t, swatchesPerRow: n }) => ({ wrapper: {
  "--cp-preview-size": Fe(t, "cp-preview-size"),
  "--cp-width": Fe(t, "cp-width"),
  "--cp-body-spacing": Xo(t),
  "--cp-swatch-size": `${100 / n}%`,
  "--cp-thumb-size": Fe(t, "cp-thumb-size"),
  "--cp-saturation-height": Fe(t, "cp-saturation-height")
} })), Ns = ae((e) => {
  const t = Q("ColorPicker", dy, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, format: l = "hex", value: u, defaultValue: f, onChange: h, onChangeEnd: d, withPicker: m, size: g, saturationLabel: b, hueLabel: x, alphaLabel: w, focusable: k, swatches: S, swatchesPerRow: j, fullWidth: E, onColorSwatchClick: R, __staticSelector: P, mod: v, attributes: T, name: L, hiddenInputProps: _, ...z } = t, B = Me({
    name: P,
    props: t,
    classes: Rs,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: T,
    rootSelector: "wrapper",
    vars: i,
    varsResolver: of
  }), M = p.useRef(l || "hex"), A = p.useRef(""), O = p.useRef(-1), $ = p.useRef(!1), I = l === "hexa" || l === "rgba" || l === "hsla", [V, D, F] = et({
    value: u,
    defaultValue: f,
    finalValue: "#FFFFFF",
    onChange: h
  }), [U, q] = p.useState(Mn(V)), G = () => {
    window.clearTimeout(O.current), $.current = !0;
  }, fe = () => {
    window.clearTimeout(O.current), O.current = window.setTimeout(() => {
      $.current = !1;
    }, 200);
  }, oe = (te) => {
    q((de) => {
      const Y = {
        ...de,
        ...te
      };
      return A.current = Ot(M.current, Y), Y;
    }), D(A.current);
  };
  return jn(() => {
    typeof u == "string" && Fo(u) && !$.current && q(Mn(u));
  }, [u]), jn(() => {
    M.current = l || "hex", D(Ot(M.current, U));
  }, [l]), /* @__PURE__ */ c.jsx(Es, {
    value: {
      getStyles: B,
      unstyled: a
    },
    children: /* @__PURE__ */ c.jsxs(ee, {
      ...B("wrapper"),
      size: g,
      mod: [{ "full-width": E }, v],
      ...z,
      children: [
        L && /* @__PURE__ */ c.jsx("input", {
          type: "hidden",
          name: L,
          value: V,
          ..._
        }),
        m && /* @__PURE__ */ c.jsxs(c.Fragment, { children: [/* @__PURE__ */ c.jsx(tf, {
          value: U,
          onChange: oe,
          onChangeEnd: ({ s: te, v: de }) => d?.(Ot(M.current, {
            ...U,
            s: te,
            v: de
          })),
          color: V,
          size: g,
          focusable: k,
          saturationLabel: b,
          onScrubStart: G,
          onScrubEnd: fe
        }), /* @__PURE__ */ c.jsxs("div", {
          ...B("body"),
          children: [/* @__PURE__ */ c.jsxs("div", {
            ...B("sliders"),
            children: [/* @__PURE__ */ c.jsx(Wi, {
              value: U.h,
              onChange: (te) => oe({ h: te }),
              onChangeEnd: (te) => d?.(Ot(M.current, {
                ...U,
                h: te
              })),
              size: g,
              focusable: k,
              "aria-label": x,
              onScrubStart: G,
              onScrubEnd: fe
            }), I && /* @__PURE__ */ c.jsx(Ui, {
              value: U.a,
              onChange: (te) => oe({ a: te }),
              onChangeEnd: (te) => {
                d?.(Ot(M.current, {
                  ...U,
                  a: te
                }));
              },
              size: g,
              color: Ot("hex", U),
              focusable: k,
              "aria-label": w,
              onScrubStart: G,
              onScrubEnd: fe
            })]
          }), I && /* @__PURE__ */ c.jsx(To, {
            color: V,
            radius: "sm",
            size: "var(--cp-preview-size)",
            ...B("preview")
          })]
        })] }),
        Array.isArray(S) && /* @__PURE__ */ c.jsx(nf, {
          data: S,
          swatchesPerRow: j,
          focusable: k,
          setValue: D,
          value: V,
          onChangeEnd: (te) => {
            const de = Ot(l, Mn(te));
            R?.(de), d?.(de), F || q(Mn(te));
          }
        })
      ]
    })
  });
});
Ns.classes = Rs;
Ns.varsResolver = of;
Ns.displayName = "@mantine/core/ColorPicker";
function fy({ style: e, ...t }) {
  return /* @__PURE__ */ c.jsxs("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    style: {
      width: "var(--ci-eye-dropper-icon-size)",
      height: "var(--ci-eye-dropper-icon-size)",
      ...e
    },
    viewBox: "0 0 24 24",
    strokeWidth: "1.5",
    stroke: "currentColor",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...t,
    children: [
      /* @__PURE__ */ c.jsx("path", {
        stroke: "none",
        d: "M0 0h24v24H0z",
        fill: "none"
      }),
      /* @__PURE__ */ c.jsx("path", { d: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" }),
      /* @__PURE__ */ c.jsx("path", { d: "M12 3l0 4" }),
      /* @__PURE__ */ c.jsx("path", { d: "M12 21l0 -3" }),
      /* @__PURE__ */ c.jsx("path", { d: "M3 12l4 0" }),
      /* @__PURE__ */ c.jsx("path", { d: "M21 12l-3 0" }),
      /* @__PURE__ */ c.jsx("path", { d: "M12 12l0 .01" })
    ]
  });
}
var ll = {
  eyeDropperIcon: "m_b077c2bc",
  eyeDropperButton: "m_66a028b5",
  colorPreview: "m_c5ccdcab",
  dropdown: "m_5ece2cd7"
};
const ul = {
  format: "hex",
  fixOnBlur: !0,
  withPreview: !0,
  swatchesPerRow: 7,
  withPicker: !0,
  popoverProps: { transitionProps: {
    transition: "fade",
    duration: 0
  } },
  withEyeDropper: !0,
  size: "sm",
  leftSectionPointerEvents: "none"
}, rf = _e((e, { size: t }) => ({
  eyeDropperIcon: { "--ci-eye-dropper-icon-size": Fe(t, "ci-eye-dropper-icon-size") },
  eyeDropperButton: { "--ci-button-size": Fe(t, "ci-button-size") },
  colorPreview: { "--ci-preview-size": Fe(t, "ci-preview-size") }
})), gr = ae((e) => {
  const t = Q([
    "Input",
    "InputWrapper",
    "ColorInput"
  ], ul, e), { classNames: n, styles: o, unstyled: r, disallowInput: s, fixOnBlur: a, popoverProps: i, withPreview: l, withEyeDropper: u, eyeDropperIcon: f, closeOnColorSwatchClick: h, eyeDropperButtonProps: d, value: m, defaultValue: g, onChange: b, onChangeEnd: x, onClick: w, onFocus: k, onBlur: S, inputProps: j, format: E = "hex", wrapperProps: R, readOnly: P, withPicker: v, swatches: T, disabled: L, leftSection: _, rightSection: z, swatchesPerRow: B, fullWidth: M, ...A } = fh("ColorInput", ul, e), O = Me({
    name: "ColorInput",
    props: t,
    classes: ll,
    classNames: n,
    styles: o,
    unstyled: r,
    rootSelector: "wrapper",
    vars: t.vars,
    varsResolver: rf
  }), { resolvedClassNames: $, resolvedStyles: I } = dr({
    classNames: n,
    styles: o,
    props: t
  }), [V, D] = p.useState(!1), [F, U] = p.useState(""), [q, G] = et({
    value: m,
    defaultValue: g,
    finalValue: "",
    onChange: b
  }), { supported: fe, open: oe } = Ih(), te = /* @__PURE__ */ c.jsx(Wo, {
    ...d,
    ...O("eyeDropperButton", {
      className: d?.className,
      style: d?.style
    }),
    variant: "subtle",
    color: "gray",
    unstyled: r,
    onClick: () => oe().then((ie) => {
      if (ie?.sRGBHex) {
        const xe = Ot(E, Mn(ie.sRGBHex));
        G(xe), x?.(xe);
      }
    }).catch(() => {
    }),
    children: f || /* @__PURE__ */ c.jsx(fy, { ...O("eyeDropperIcon") })
  }), de = (ie) => {
    k?.(ie), D(!0);
  }, Y = (ie) => {
    a && G(F), S?.(ie), D(!1);
  }, K = (ie) => {
    w?.(ie), D(!0);
  };
  return p.useEffect(() => {
    (Fo(q) || q.trim() === "") && U(q);
  }, [q]), jn(() => {
    Fo(q) && G(Ot(E, Mn(q)));
  }, [E]), /* @__PURE__ */ c.jsx(Nt.Wrapper, {
    ...R,
    classNames: $,
    styles: I,
    __staticSelector: "ColorInput",
    children: /* @__PURE__ */ c.jsxs(qe, {
      __staticSelector: "ColorInput",
      position: "bottom-start",
      offset: 5,
      opened: V,
      width: M ? "target" : void 0,
      ...i,
      classNames: $,
      styles: I,
      unstyled: r,
      withRoles: !1,
      disabled: P || v === !1 && (!Array.isArray(T) || T.length === 0),
      children: [/* @__PURE__ */ c.jsx(qe.Target, { children: /* @__PURE__ */ c.jsx(Nt, {
        autoComplete: "off",
        ...A,
        ...j,
        classNames: $,
        styles: I,
        disabled: L,
        __staticSelector: "ColorInput",
        onFocus: de,
        onBlur: Y,
        onClick: K,
        spellCheck: !1,
        value: q,
        onChange: (ie) => {
          const xe = ie.currentTarget.value;
          G(xe), Fo(xe) && x?.(Ot(E, Mn(xe)));
        },
        leftSection: _ || (l ? /* @__PURE__ */ c.jsx(To, {
          color: Fo(q) ? q : "#fff",
          size: "var(--ci-preview-size)",
          ...O("colorPreview")
        }) : null),
        readOnly: s || P,
        pointer: s,
        unstyled: r,
        rightSection: z || (u && !L && !P && fe ? te : null)
      }) }), /* @__PURE__ */ c.jsx(qe.Dropdown, {
        onMouseDown: (ie) => ie.preventDefault(),
        className: ll.dropdown,
        children: /* @__PURE__ */ c.jsx(Ns, {
          __staticSelector: "ColorInput",
          value: q,
          onChange: G,
          onChangeEnd: x,
          format: E,
          swatches: T,
          swatchesPerRow: B,
          withPicker: v,
          size: j.size,
          focusable: !1,
          unstyled: r,
          styles: I,
          classNames: $,
          onColorSwatchClick: () => h && D(!1),
          attributes: R.attributes,
          fullWidth: M
        })
      })]
    })
  });
});
gr.classes = Ct.classes;
gr.varsResolver = rf;
gr.displayName = "@mantine/core/ColorInput";
var sf = {
  root: "m_3eebeb36",
  label: "m_9e365f20"
};
const py = { orientation: "horizontal" }, af = _e((e, { color: t, variant: n, size: o }) => ({ root: {
  "--divider-color": t ? it(t, e) : void 0,
  "--divider-border-style": n,
  "--divider-size": Fe(o, "divider-size")
} })), Ts = ae((e) => {
  const t = Q("Divider", py, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, color: l, orientation: u, label: f, labelPosition: h, mod: d, attributes: m, ...g } = t, b = Me({
    name: "Divider",
    classes: sf,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: m,
    vars: i,
    varsResolver: af
  });
  return /* @__PURE__ */ c.jsx(ee, {
    mod: [{
      orientation: u,
      withLabel: !!f
    }, d],
    role: "separator",
    ...b("root"),
    ...g,
    children: f && /* @__PURE__ */ c.jsx(ee, {
      component: "span",
      mod: { position: h },
      ...b("label"),
      children: f
    })
  });
});
Ts.classes = sf;
Ts.varsResolver = af;
Ts.displayName = "@mantine/core/Divider";
const cf = Rn((e) => {
  const { onChange: t, children: n, multiple: o, accept: r, name: s, form: a, resetRef: i, disabled: l, capture: u, inputProps: f, ref: h, ...d } = Q("FileButton", null, e), m = p.useRef(null), g = () => {
    !l && m.current?.click();
  }, b = (w) => {
    if (w.currentTarget.files === null) return t(o ? [] : null);
    t(o ? Array.from(w.currentTarget.files) : w.currentTarget.files[0] || null);
  };
  return fu(i, () => {
    m.current && (m.current.value = "");
  }), /* @__PURE__ */ c.jsxs(c.Fragment, { children: [/* @__PURE__ */ c.jsx("input", {
    style: { display: "none" },
    type: "file",
    accept: r,
    multiple: o,
    onChange: b,
    ref: We(h, m),
    name: s,
    form: a,
    capture: u,
    ...f
  }), n({
    onClick: g,
    ...d
  })] });
});
cf.displayName = "@mantine/core/FileButton";
const hy = ({ value: e }) => /* @__PURE__ */ c.jsx("div", {
  style: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  children: Array.isArray(e) ? e.map((t) => t.name).join(", ") : e?.name
}), my = {
  valueComponent: hy,
  size: "sm"
}, Ps = Rn((e) => {
  const t = Q([
    "Input",
    "InputWrapper",
    "FileInput"
  ], my, e), { unstyled: n, vars: o, onChange: r, value: s, defaultValue: a, multiple: i, accept: l, name: u, form: f, valueComponent: h, clearable: d, clearSectionMode: m, clearButtonProps: g, readOnly: b, capture: x, fileInputProps: w, rightSection: k, size: S, placeholder: j, component: E, resetRef: R, classNames: P, styles: v, attributes: T, ...L } = t, _ = p.useRef(null), { resolvedClassNames: z, resolvedStyles: B } = dr({
    classNames: P,
    styles: v,
    props: t
  }), [M, A] = et({
    value: s,
    defaultValue: a,
    onChange: r,
    finalValue: i ? [] : null
  }), O = Array.isArray(M) ? M.length !== 0 : M !== null, $ = /* @__PURE__ */ c.jsx(ds, {
    ...g,
    variant: "subtle",
    onClick: () => A(i ? [] : null),
    size: S,
    unstyled: n
  }), I = d && O && !b;
  return p.useEffect(() => {
    (Array.isArray(M) && M.length === 0 || M === null) && _.current?.();
  }, [M]), /* @__PURE__ */ c.jsx(cf, {
    onChange: A,
    multiple: i,
    accept: l,
    name: u,
    form: f,
    resetRef: We(_, R),
    disabled: b,
    capture: x,
    inputProps: w,
    children: (V) => /* @__PURE__ */ c.jsx(Ct, {
      component: E || "button",
      rightSection: k,
      __clearSection: $,
      __clearable: I,
      __clearSectionMode: m,
      ...V,
      ...L,
      __staticSelector: "FileInput",
      multiline: !0,
      type: "button",
      pointer: !0,
      __stylesApiProps: t,
      unstyled: n,
      size: S,
      classNames: P,
      styles: v,
      attributes: T,
      children: O ? /* @__PURE__ */ c.jsx(h, { value: M }) : /* @__PURE__ */ c.jsx(Nt.Placeholder, {
        __staticSelector: "FileInput",
        classNames: z,
        styles: B,
        attributes: T,
        children: j
      })
    })
  });
});
Ps.classes = Ct.classes;
Ps.displayName = "@mantine/core/FileInput";
const gy = [
  "borderBottomWidth",
  "borderLeftWidth",
  "borderRightWidth",
  "borderTopWidth",
  "boxSizing",
  "fontFamily",
  "fontSize",
  "fontStyle",
  "fontWeight",
  "letterSpacing",
  "lineHeight",
  "paddingBottom",
  "paddingLeft",
  "paddingRight",
  "paddingTop",
  "tabSize",
  "textIndent",
  "textRendering",
  "textTransform",
  "width",
  "wordBreak",
  "wordSpacing",
  "scrollbarGutter"
], dl = {
  "min-height": "0",
  "max-height": "none",
  height: "0",
  visibility: "hidden",
  overflow: "hidden",
  position: "absolute",
  "z-index": "-1000",
  top: "0",
  right: "0",
  display: "block"
};
function fl(e) {
  Object.keys(dl).forEach((t) => {
    e.style.setProperty(t, dl[t], "important");
  });
}
function vy(e) {
  const t = window.getComputedStyle(e);
  if (t === null) return null;
  const n = {};
  for (const o of gy) n[o] = t[o];
  return n.boxSizing === "" ? null : {
    sizingStyle: n,
    paddingSize: parseFloat(n.paddingBottom) + parseFloat(n.paddingTop),
    borderSize: parseFloat(n.borderBottomWidth) + parseFloat(n.borderTopWidth)
  };
}
let Ge = null;
function yy(e, t, n = 1, o = 1 / 0) {
  Ge || (Ge = document.createElement("textarea"), Ge.setAttribute("tabindex", "-1"), Ge.setAttribute("aria-hidden", "true"), Ge.setAttribute("aria-label", "autosize measurement"), fl(Ge)), Ge.parentNode === null && document.body.appendChild(Ge);
  const { paddingSize: r, borderSize: s, sizingStyle: a } = e, { boxSizing: i } = a;
  Object.keys(a).forEach((d) => {
    Ge.style[d] = a[d];
  }), fl(Ge), Ge.value = t;
  let l = i === "border-box" ? Ge.scrollHeight + s : Ge.scrollHeight - r;
  Ge.value = t, l = i === "border-box" ? Ge.scrollHeight + s : Ge.scrollHeight - r, Ge.value = "x";
  const u = Ge.scrollHeight - r;
  let f = u * n;
  i === "border-box" && (f = f + r + s), l = Math.max(f, l);
  let h = u * o;
  return i === "border-box" && (h = h + r + s), l = Math.min(h, l), [l, u];
}
function by({ maxRows: e, minRows: t, onChange: n, ref: o, ...r }) {
  const s = r.value !== void 0, a = p.useRef(null), i = We(a, o), l = p.useRef(0), u = p.useRef(0), f = () => {
    const m = a.current;
    if (!m) return;
    const g = vy(m);
    if (!g) return;
    const [b] = yy(g, m.value || m.placeholder || "x", t, e);
    l.current !== b && (l.current = b, m.style.setProperty("height", `${b}px`, "important"));
  }, h = p.useEffectEvent(f), d = (m) => {
    s || f(), n?.(m);
  };
  return p.useLayoutEffect(f), p.useEffect(() => {
    const m = () => f();
    return window.addEventListener("resize", m), () => window.removeEventListener("resize", m);
  }, []), p.useEffect(() => {
    const m = a.current;
    if (!m || typeof ResizeObserver > "u") return;
    u.current = m.offsetWidth;
    let g = 0;
    const b = new ResizeObserver(() => {
      a.current && a.current.offsetWidth !== u.current && (u.current = a.current.offsetWidth, cancelAnimationFrame(g), g = requestAnimationFrame(h));
    });
    return b.observe(m), () => {
      cancelAnimationFrame(g), b.disconnect();
    };
  }, []), p.useEffect(() => {
    const m = () => f();
    return document.fonts.addEventListener("loadingdone", m), () => document.fonts.removeEventListener("loadingdone", m);
  }, []), p.useEffect(() => {
    const m = (g) => {
      if (a.current?.form === g.target && !s) {
        const b = a.current.value;
        requestAnimationFrame(() => {
          a.current && b !== a.current.value && f();
        });
      }
    };
    return document.body.addEventListener("reset", m), () => document.body.removeEventListener("reset", m);
  }, [s]), /* @__PURE__ */ c.jsx("textarea", {
    rows: t,
    ...r,
    onChange: d,
    ref: i
  });
}
const Vn = ae((e) => {
  const { autosize: t, maxRows: n, minRows: o, __staticSelector: r, resize: s, bottomSection: a, bottomSectionProps: i, ...l } = Q([
    "Input",
    "InputWrapper",
    "Textarea"
  ], null, e), u = t && Cu() !== "test", f = u ? {
    maxRows: n,
    minRows: o
  } : {};
  return /* @__PURE__ */ c.jsx(Ct, {
    component: u ? by : "textarea",
    ...l,
    __staticSelector: r || "Textarea",
    __bottomSection: a,
    __bottomSectionProps: i,
    multiline: !0,
    "data-no-overflow": t && n === void 0 || void 0,
    __vars: { "--input-resize": s },
    ...f
  });
});
Vn.classes = Ct.classes;
Vn.displayName = "@mantine/core/Textarea";
function lf({ size: e, style: t, ...n }) {
  return /* @__PURE__ */ c.jsx("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 5 5",
    style: {
      width: Ae(e),
      height: Ae(e),
      ...t
    },
    "aria-hidden": !0,
    ...n,
    children: /* @__PURE__ */ c.jsx("circle", {
      cx: "2.5",
      cy: "2.5",
      r: "2.5",
      fill: "currentColor"
    })
  });
}
const [wy, Ao] = Jt("Modal component was not found in tree");
var ln = {
  root: "m_9df02822",
  content: "m_54c44539",
  inner: "m_1f958f16",
  header: "m_d0e2b9cd"
};
const As = ae((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Q("ModalBody", null, e), i = Ao();
  return /* @__PURE__ */ c.jsx(hd, {
    ...i.getStyles("body", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
As.classes = ln;
As.displayName = "@mantine/core/ModalBody";
const Is = ae((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Q("ModalCloseButton", null, e), i = Ao();
  return /* @__PURE__ */ c.jsx(md, {
    ...i.getStyles("close", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
Is.classes = ln;
Is.displayName = "@mantine/core/ModalCloseButton";
const Ms = ae((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, children: a, __hidden: i, ...l } = Q("ModalContent", null, e), u = Ao(), f = u.scrollAreaComponent || Nv;
  return /* @__PURE__ */ c.jsx(gd, {
    ...u.getStyles("content", {
      className: n,
      style: o,
      styles: r,
      classNames: t
    }),
    innerProps: u.getStyles("inner", {
      className: n,
      style: o,
      styles: r,
      classNames: t
    }),
    "data-full-screen": u.fullScreen || void 0,
    "data-modal-content": !0,
    "data-hidden": i || void 0,
    ...l,
    children: /* @__PURE__ */ c.jsx(f, {
      style: { maxHeight: u.fullScreen ? "100dvh" : `calc(100dvh - (${Ae(u.yOffset)} * 2))` },
      children: a
    })
  });
});
Ms.classes = ln;
Ms.displayName = "@mantine/core/ModalContent";
const Ds = ae((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Q("ModalHeader", null, e), i = Ao();
  return /* @__PURE__ */ c.jsx(vd, {
    ...i.getStyles("header", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
Ds.classes = ln;
Ds.displayName = "@mantine/core/ModalHeader";
const Os = ae((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Q("ModalOverlay", null, e), i = Ao();
  return /* @__PURE__ */ c.jsx(yd, {
    ...i.getStyles("overlay", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
Os.classes = ln;
Os.displayName = "@mantine/core/ModalOverlay";
const xy = {
  __staticSelector: "Modal",
  closeOnClickOutside: !0,
  withinPortal: !0,
  lockScroll: !0,
  trapFocus: !0,
  returnFocus: !0,
  closeOnEscape: !0,
  keepMounted: !1,
  zIndex: ko("modal"),
  transitionProps: {
    duration: 200,
    transition: "fade-down"
  },
  yOffset: "5dvh"
}, uf = _e((e, { radius: t, size: n, yOffset: o, xOffset: r }) => ({ root: {
  "--modal-radius": t === void 0 ? void 0 : St(t),
  "--modal-size": Fe(n, "modal-size"),
  "--modal-y-offset": Ae(o),
  "--modal-x-offset": Ae(r)
} })), vr = ae((e) => {
  const t = Q("ModalRoot", xy, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, yOffset: l, scrollAreaComponent: u, radius: f, fullScreen: h, centered: d, xOffset: m, __staticSelector: g, attributes: b, ...x } = t, w = Me({
    name: g,
    classes: ln,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: b,
    vars: i,
    varsResolver: uf
  });
  return /* @__PURE__ */ c.jsx(wy, {
    value: {
      yOffset: l,
      scrollAreaComponent: u,
      getStyles: w,
      fullScreen: h
    },
    children: /* @__PURE__ */ c.jsx(pd, {
      ...w("root"),
      "data-full-screen": h || void 0,
      "data-centered": d || void 0,
      "data-offset-scrollbars": u === Tn.Autosize || void 0,
      unstyled: a,
      ...x
    })
  });
});
vr.classes = ln;
vr.varsResolver = uf;
vr.displayName = "@mantine/core/ModalRoot";
const df = p.createContext(null);
function ff({ children: e }) {
  const [t, n] = p.useState([]), [o, r] = p.useState(ko("modal")), [s] = p.useState(() => /* @__PURE__ */ new WeakSet());
  return /* @__PURE__ */ c.jsx(df, {
    value: {
      stack: t,
      addModal: (a, i) => {
        n((l) => [.../* @__PURE__ */ new Set([...l, a])]), r((l) => typeof i == "number" && typeof l == "number" ? Math.max(l, i) : l);
      },
      removeModal: (a) => n((i) => i.filter((l) => l !== a)),
      getZIndex: (a) => `calc(${o} + ${t.indexOf(a)} + 1)`,
      currentId: t[t.length - 1],
      maxZIndex: o,
      handledEscapeEvents: s
    },
    children: e
  });
}
ff.displayName = "@mantine/core/ModalStack";
const Ls = ae((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Q("ModalTitle", null, e), i = Ao();
  return /* @__PURE__ */ c.jsx(bd, {
    ...i.getStyles("title", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
Ls.classes = ln;
Ls.displayName = "@mantine/core/ModalTitle";
const Sy = {
  closeOnClickOutside: !0,
  withinPortal: !0,
  lockScroll: !0,
  trapFocus: !0,
  returnFocus: !0,
  closeOnEscape: !0,
  keepMounted: !1,
  zIndex: ko("modal"),
  transitionProps: {
    duration: 200,
    transition: "fade-down"
  },
  withOverlay: !0,
  withCloseButton: !0
}, ct = ae((e) => {
  const { title: t, withOverlay: n, overlayProps: o, withCloseButton: r, closeButtonProps: s, children: a, radius: i, opened: l, stackId: u, zIndex: f, ...h } = Q("Modal", Sy, e), d = p.use(df), m = !!t || r, g = d && u ? {
    closeOnEscape: d.currentId === u,
    trapFocus: d.currentId === u,
    zIndex: d.getZIndex(u),
    __handledEscapeEvents: d.handledEscapeEvents
  } : {}, b = n === !1 ? !1 : u && d ? d.currentId === u : l;
  return p.useEffect(() => {
    d && u && (l ? d.addModal(u, f || ko("modal")) : d.removeModal(u));
  }, [
    l,
    u,
    f
  ]), /* @__PURE__ */ c.jsxs(vr, {
    radius: i,
    opened: l,
    zIndex: d && u ? d.getZIndex(u) : f,
    ...h,
    ...g,
    children: [n && /* @__PURE__ */ c.jsx(Os, {
      visible: b,
      transitionProps: d && u ? { duration: 0 } : void 0,
      ...o
    }), /* @__PURE__ */ c.jsxs(Ms, {
      radius: i,
      __hidden: d && u && l ? u !== d.currentId : !1,
      children: [m && /* @__PURE__ */ c.jsxs(Ds, { children: [t && /* @__PURE__ */ c.jsx(Ls, { children: t }), r && /* @__PURE__ */ c.jsx(Is, { ...s })] }), /* @__PURE__ */ c.jsx(As, { children: a })]
    })]
  });
});
ct.classes = ln;
ct.displayName = "@mantine/core/Modal";
ct.Root = vr;
ct.Overlay = Os;
ct.Content = Ms;
ct.Body = As;
ct.Header = Ds;
ct.Title = Ls;
ct.CloseButton = Is;
ct.Stack = ff;
function Cy(e, t) {
  const n = t.trim().toLowerCase();
  if (n === "") return;
  const o = Object.values(e).filter((r) => !r.disabled && r.label.trim().toLowerCase() === n);
  return o.length === 1 ? o[0] : void 0;
}
function jy(e) {
  return "group" in e;
}
function qi({ data: e }) {
  if (jy(e)) {
    const r = e.items.map((s) => /* @__PURE__ */ c.jsx(qi, { data: s }, s.value));
    return /* @__PURE__ */ c.jsx("optgroup", {
      label: e.group,
      children: r
    });
  }
  const { value: t, label: n, ...o } = e;
  return /* @__PURE__ */ c.jsx("option", {
    value: e.value,
    ...o,
    children: e.label
  });
}
qi.displayName = "@mantine/core/NativeSelectOption";
const ky = {
  size: "sm",
  rightSectionPointerEvents: "none"
}, Hn = ae((e) => {
  const { data: t, children: n, size: o, error: r, rightSection: s, unstyled: a, ...i } = Q([
    "Input",
    "InputWrapper",
    "NativeSelect"
  ], ky, e), l = Nd(t).map((u, f) => /* @__PURE__ */ c.jsx(qi, { data: u }, f));
  return /* @__PURE__ */ c.jsx(Ct, {
    component: "select",
    ...i,
    __staticSelector: "NativeSelect",
    size: o,
    pointer: !0,
    error: r,
    unstyled: a,
    rightSection: s || /* @__PURE__ */ c.jsx(mr, {
      size: o,
      error: r,
      unstyled: a
    }),
    children: n || l
  });
});
Hn.classes = Ct.classes;
Hn.displayName = "@mantine/core/NativeSelect";
function pf(e, t) {
  var n = {};
  for (var o in e)
    Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var r = 0, o = Object.getOwnPropertySymbols(e); r < o.length; r++)
      t.indexOf(o[r]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[r]) && (n[o[r]] = e[o[r]]);
  return n;
}
var yo;
(function(e) {
  e.event = "event", e.props = "prop";
})(yo || (yo = {}));
function gn() {
}
function Ey(e) {
  var t, n = void 0;
  return function() {
    for (var o = [], r = arguments.length; r--; ) o[r] = arguments[r];
    return t && o.length === t.length && o.every(function(s, a) {
      return s === t[a];
    }) || (t = o, n = e.apply(void 0, o)), n;
  };
}
function er(e) {
  return !!(e || "").match(/\d/);
}
function yn(e) {
  return e == null;
}
function Ry(e) {
  return typeof e == "number" && isNaN(e);
}
function hf(e) {
  return yn(e) || Ry(e) || typeof e == "number" && !isFinite(e);
}
function mf(e) {
  return e.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
}
function Ny(e) {
  switch (e) {
    case "lakh":
      return /(\d+?)(?=(\d\d)+(\d)(?!\d))(\.\d+)?/g;
    case "wan":
      return /(\d)(?=(\d{4})+(?!\d))/g;
    default:
      return /(\d)(?=(\d{3})+(?!\d))/g;
  }
}
function Ty(e, t, n) {
  var o = Ny(n), r = e.search(/[1-9]/);
  return r = r === -1 ? e.length : r, e.substring(0, r) + e.substring(r, e.length).replace(o, "$1" + t);
}
function pl(e) {
  var t = p.useRef(e);
  t.current = e;
  var n = p.useRef(function() {
    for (var o = [], r = arguments.length; r--; ) o[r] = arguments[r];
    return t.current.apply(t, o);
  });
  return n.current;
}
function Ki(e, t) {
  t === void 0 && (t = !0);
  var n = e[0] === "-", o = n && t;
  e = e.replace("-", "");
  var r = e.split("."), s = r[0], a = r[1] || "";
  return {
    beforeDecimal: s,
    afterDecimal: a,
    hasNegation: n,
    addNegation: o
  };
}
function Py(e) {
  if (!e)
    return e;
  var t = e[0] === "-";
  t && (e = e.substring(1, e.length));
  var n = e.split("."), o = n[0].replace(/^0+/, "") || "0", r = n[1] || "";
  return (t ? "-" : "") + o + (r ? "." + r : "");
}
function gf(e, t, n) {
  for (var o = "", r = n ? "0" : "", s = 0; s <= t - 1; s++)
    o += e[s] || r;
  return o;
}
function hl(e, t) {
  return Array(t + 1).join(e);
}
function vf(e) {
  var t = e + "", n = t[0] === "-" ? "-" : "";
  n && (t = t.substring(1));
  var o = t.split(/[eE]/g), r = o[0], s = o[1];
  if (s = Number(s), !s)
    return n + r;
  r = r.replace(".", "");
  var a = 1 + s, i = r.length;
  return a < 0 ? r = "0." + hl("0", Math.abs(a)) + r : a >= i ? r = r + hl("0", a - i) : r = (r.substring(0, a) || "0") + "." + r.substring(a), n + r;
}
function ml(e, t, n) {
  if (["", "-"].indexOf(e) !== -1)
    return e;
  var o = (e.indexOf(".") !== -1 || n) && t, r = Ki(e), s = r.beforeDecimal, a = r.afterDecimal, i = r.hasNegation, l = parseFloat("0." + (a || "0")), u = a.length <= t ? "0." + a : l.toFixed(t), f = u.split("."), h = s;
  s && Number(f[0]) && (h = s.split("").reverse().reduce(function(b, x, w) {
    return b.length > w ? (Number(b[0]) + Number(x)).toString() + b.substring(1, b.length) : x + b;
  }, f[0]));
  var d = gf(f[1] || "", t, n), m = i ? "-" : "", g = o ? "." : "";
  return "" + m + h + g + d;
}
function In(e, t) {
  if (e.value = e.value, e !== null) {
    if (e.createTextRange) {
      var n = e.createTextRange();
      return n.move("character", t), n.select(), !0;
    }
    return e.selectionStart || e.selectionStart === 0 ? (e.focus(), e.setSelectionRange(t, t), !0) : (e.focus(), !1);
  }
}
var yf = Ey(function(e, t) {
  for (var n = 0, o = 0, r = e.length, s = t.length; e[n] === t[n] && n < r; )
    n++;
  for (; e[r - 1 - o] === t[s - 1 - o] && s - o > n && r - o > n; )
    o++;
  return {
    from: { start: n, end: r - o },
    to: { start: n, end: s - o }
  };
}), Ay = function(e, t) {
  var n = Math.min(e.selectionStart, t);
  return {
    from: { start: n, end: e.selectionEnd },
    to: { start: n, end: t }
  };
};
function Iy(e, t, n) {
  return Math.min(Math.max(e, t), n);
}
function la(e) {
  return Math.max(e.selectionStart, e.selectionEnd);
}
function My() {
  return typeof navigator < "u" && !(navigator.platform && /iPhone|iPod/.test(navigator.platform));
}
function Dy(e) {
  return {
    from: {
      start: 0,
      end: 0
    },
    to: {
      start: 0,
      end: e.length
    },
    lastValue: ""
  };
}
function Oy(e) {
  var t = e.currentValue, n = e.formattedValue, o = e.currentValueIndex, r = e.formattedValueIndex;
  return t[o] === n[r];
}
function Ly(e, t, n, o, r, s, a) {
  a === void 0 && (a = Oy);
  var i = r.findIndex(function(j) {
    return j;
  }), l = e.slice(0, i);
  !t && !n.startsWith(l) && (t = l, n = l + n, o = o + l.length);
  for (var u = n.length, f = e.length, h = {}, d = new Array(u), m = 0; m < u; m++) {
    d[m] = -1;
    for (var g = 0, b = f; g < b; g++) {
      var x = a({
        currentValue: n,
        lastValue: t,
        formattedValue: e,
        currentValueIndex: m,
        formattedValueIndex: g
      });
      if (x && h[g] !== !0) {
        d[m] = g, h[g] = !0;
        break;
      }
    }
  }
  for (var w = o; w < u && (d[w] === -1 || !s(n[w])); )
    w++;
  var k = w === u || d[w] === -1 ? f : d[w];
  for (w = o - 1; w > 0 && d[w] === -1; )
    w--;
  var S = w === -1 || d[w] === -1 ? 0 : d[w] + 1;
  return S > k ? k : o - S < k - o ? S : k;
}
function gl(e, t, n, o) {
  var r = e.length;
  if (t = Iy(t, 0, r), o === "left") {
    for (; t >= 0 && !n[t]; )
      t--;
    t === -1 && (t = n.indexOf(!0));
  } else {
    for (; t <= r && !n[t]; )
      t++;
    t > r && (t = n.lastIndexOf(!0));
  }
  return t === -1 && (t = r), t;
}
function $y(e) {
  for (var t = Array.from({ length: e.length + 1 }).map(function() {
    return !0;
  }), n = 0, o = t.length; n < o; n++)
    t[n] = !!(er(e[n]) || er(e[n - 1]));
  return t;
}
function bf(e, t, n, o, r, s) {
  s === void 0 && (s = gn);
  var a = pl(function(g, b) {
    var x, w;
    return hf(g) ? (w = "", x = "") : typeof g == "number" || b ? (w = typeof g == "number" ? vf(g) : g, x = o(w)) : (w = r(g, void 0), x = o(w)), { formattedValue: x, numAsString: w };
  }), i = p.useState(function() {
    return a(yn(e) ? t : e, n);
  }), l = i[0], u = i[1], f = pl(function(g, b) {
    g.formattedValue !== l.formattedValue && u({
      formattedValue: g.formattedValue,
      numAsString: g.value
    }), s(g, b);
  }), h = e, d = n;
  yn(e) && (h = l.numAsString, d = !0);
  var m = a(h, d);
  return p.useMemo(function() {
    u(m);
  }, [m.formattedValue]), p.useEffect(function() {
    if (!yn(t) && yn(e) && l.formattedValue !== "") {
      var g = parseFloat(l.numAsString);
      f({
        formattedValue: l.formattedValue,
        value: l.numAsString,
        floatValue: isNaN(g) ? void 0 : g
      }, { event: void 0, source: yo.props });
    }
  }, []), [l, f];
}
function _y(e) {
  return e.replace(/[^0-9]/g, "");
}
function zy(e) {
  return e;
}
function Fy(e) {
  var t = e.type;
  t === void 0 && (t = "text");
  var n = e.displayType;
  n === void 0 && (n = "input");
  var o = e.customInput, r = e.renderText, s = e.getInputRef, a = e.format;
  a === void 0 && (a = zy);
  var i = e.removeFormatting;
  i === void 0 && (i = _y);
  var l = e.defaultValue, u = e.valueIsNumericString, f = e.onValueChange, h = e.isAllowed, d = e.onChange;
  d === void 0 && (d = gn);
  var m = e.onKeyDown;
  m === void 0 && (m = gn);
  var g = e.onMouseUp;
  g === void 0 && (g = gn);
  var b = e.onFocus;
  b === void 0 && (b = gn);
  var x = e.onBlur;
  x === void 0 && (x = gn);
  var w = e.value, k = e.getCaretBoundary;
  k === void 0 && (k = $y);
  var S = e.isValidInputCharacter;
  S === void 0 && (S = er);
  var j = e.isCharacterSame, E = pf(e, ["type", "displayType", "customInput", "renderText", "getInputRef", "format", "removeFormatting", "defaultValue", "valueIsNumericString", "onValueChange", "isAllowed", "onChange", "onKeyDown", "onMouseUp", "onFocus", "onBlur", "value", "getCaretBoundary", "isValidInputCharacter", "isCharacterSame"]), R = bf(w, l, !!u, a, i, f), P = R[0], v = P.formattedValue, T = P.numAsString, L = R[1], _ = p.useRef(), z = p.useRef({ formattedValue: v, numAsString: T }), B = function(H, X) {
    z.current = { formattedValue: H.formattedValue, numAsString: H.value }, L(H, X);
  }, M = p.useState(!1), A = M[0], O = M[1], $ = p.useRef(null), I = p.useRef({
    setCaretTimeout: null,
    focusTimeout: null
  });
  p.useEffect(function() {
    return O(!0), function() {
      clearTimeout(I.current.setCaretTimeout), clearTimeout(I.current.focusTimeout);
    };
  }, []);
  var V = a, D = function(H, X) {
    var ue = parseFloat(X);
    return {
      formattedValue: H,
      value: X,
      floatValue: isNaN(ue) ? void 0 : ue
    };
  }, F = function(H, X, ue) {
    H.selectionStart === 0 && H.selectionEnd === H.value.length || (In(H, X), I.current.setCaretTimeout = setTimeout(function() {
      H.value === ue && H.selectionStart !== X && In(H, X);
    }, 0));
  }, U = function(H, X, ue) {
    return gl(H, X, k(H), ue);
  }, q = function(H, X, ue) {
    var Re = k(X), De = Ly(X, v, H, ue, Re, S, j);
    return De = gl(X, De, Re), De;
  }, G = function(H) {
    var X = H.formattedValue;
    X === void 0 && (X = "");
    var ue = H.input, Re = H.source, De = H.event, ve = H.numAsString, ye;
    if (ue) {
      var Se = H.inputValue || ue.value, Le = la(ue);
      ue.value = X, ye = q(Se, X, Le), ye !== void 0 && F(ue, ye, X);
    }
    X !== v && B(D(X, ve), { event: De, source: Re });
  };
  p.useEffect(function() {
    var H = z.current, X = H.formattedValue, ue = H.numAsString;
    (v !== X || T !== ue) && B(D(v, T), {
      event: void 0,
      source: yo.props
    });
  }, [v, T]);
  var fe = $.current ? la($.current) : void 0, oe = typeof window < "u" ? p.useLayoutEffect : p.useEffect;
  oe(function() {
    var H = $.current;
    if (v !== z.current.formattedValue && H) {
      var X = q(z.current.formattedValue, v, fe);
      H.value = v, F(H, X, v);
    }
  }, [v]);
  var te = function(H, X, ue) {
    var Re = X.target, De = _.current ? Ay(_.current, Re.selectionEnd) : yf(v, H), ve = Object.assign(Object.assign({}, De), { lastValue: v }), ye = i(H, ve), Se = V(ye);
    if (ye = i(Se, void 0), h && !h(D(Se, ye))) {
      var Le = X.target, pe = la(Le), vt = q(H, v, pe);
      return Le.value = v, F(Le, vt, v), !1;
    }
    return G({
      formattedValue: Se,
      numAsString: ye,
      inputValue: H,
      event: X,
      source: ue,
      input: X.target
    }), !0;
  }, de = function(H, X) {
    X === void 0 && (X = 0);
    var ue = H.selectionStart, Re = H.selectionEnd;
    _.current = { selectionStart: ue, selectionEnd: Re + X };
  }, Y = function(H) {
    var X = H.target, ue = X.value, Re = te(ue, H, yo.event);
    Re && d(H), _.current = void 0;
  }, K = function(H) {
    var X = H.target, ue = H.key, Re = X.selectionStart, De = X.selectionEnd, ve = X.value;
    ve === void 0 && (ve = "");
    var ye;
    ue === "ArrowLeft" || ue === "Backspace" ? ye = Math.max(Re - 1, 0) : ue === "ArrowRight" ? ye = Math.min(Re + 1, ve.length) : ue === "Delete" && (ye = Re);
    var Se = 0;
    ue === "Delete" && Re === De && (Se = 1);
    var Le = ue === "ArrowLeft" || ue === "ArrowRight";
    if (ye === void 0 || Re !== De && !Le) {
      m(H), de(X, Se);
      return;
    }
    var pe = ye;
    if (Le) {
      var vt = ue === "ArrowLeft" ? "left" : "right";
      pe = U(ve, ye, vt), pe !== ye && H.preventDefault();
    } else ue === "Delete" && !S(ve[ye]) ? pe = U(ve, ye, "right") : ue === "Backspace" && !S(ve[ye]) && (pe = U(ve, ye, "left"));
    pe !== ye && F(X, pe, ve), m(H), de(X, Se);
  }, ie = function(H) {
    var X = H.target, ue = function() {
      var Re = X.selectionStart, De = X.selectionEnd, ve = X.value;
      if (ve === void 0 && (ve = ""), Re === De) {
        var ye = U(ve, Re);
        ye !== Re && F(X, ye, ve);
      }
    };
    ue(), requestAnimationFrame(function() {
      ue();
    }), g(H), de(X);
  }, xe = function(H) {
    H.persist && H.persist();
    var X = H.target, ue = H.currentTarget;
    $.current = X, I.current.focusTimeout = setTimeout(function() {
      var Re = X.selectionStart, De = X.selectionEnd, ve = X.value;
      ve === void 0 && (ve = "");
      var ye = U(ve, Re);
      ye !== Re && !(Re === 0 && De === ve.length) && F(X, ye, ve), b(Object.assign(Object.assign({}, H), { currentTarget: ue }));
    }, 0);
  }, he = function(H) {
    $.current = null, clearTimeout(I.current.focusTimeout), clearTimeout(I.current.setCaretTimeout), x(H);
  }, Ee = A && My() ? "numeric" : void 0, re = Object.assign({ inputMode: Ee }, E, {
    type: t,
    value: v,
    onChange: Y,
    onKeyDown: K,
    onMouseUp: ie,
    onFocus: xe,
    onBlur: he
  });
  if (n === "text")
    return r ? mn.createElement(mn.Fragment, null, r(v, E) || null) : mn.createElement("span", Object.assign({}, E, { ref: s }), v);
  if (o) {
    var W = o;
    return mn.createElement(W, Object.assign({}, re, { ref: s }));
  }
  return mn.createElement("input", Object.assign({}, re, { ref: s }));
}
function vl(e, t) {
  var n = t.decimalScale, o = t.fixedDecimalScale, r = t.prefix;
  r === void 0 && (r = "");
  var s = t.suffix;
  s === void 0 && (s = "");
  var a = t.allowNegative, i = t.thousandsGroupStyle;
  if (i === void 0 && (i = "thousand"), e === "" || e === "-")
    return e;
  var l = $s(t), u = l.thousandSeparator, f = l.decimalSeparator, h = n !== 0 && e.indexOf(".") !== -1 || n && o, d = Ki(e, a), m = d.beforeDecimal, g = d.afterDecimal, b = d.addNegation;
  return n !== void 0 && (g = gf(g, n, !!o)), u && (m = Ty(m, u, i)), r && (m = r + m), s && (g = g + s), b && (m = "-" + m), e = m + (h && f || "") + g, e;
}
function $s(e) {
  var t = e.decimalSeparator;
  t === void 0 && (t = ".");
  var n = e.thousandSeparator, o = e.allowedDecimalSeparators;
  return n === !0 && (n = ","), o || (o = [t, "."]), {
    decimalSeparator: t,
    thousandSeparator: n,
    allowedDecimalSeparators: o
  };
}
function By(e, t) {
  e === void 0 && (e = "");
  var n = new RegExp("(-)"), o = new RegExp("(-)(.)*(-)"), r = n.test(e), s = o.test(e);
  return e = e.replace(/-/g, ""), r && !s && t && (e = "-" + e), e;
}
function Vy(e, t) {
  return new RegExp("(^-)|[0-9]|" + mf(e), "g");
}
function Hy(e, t, n) {
  return e === "" ? !0 : !t?.match(/\d/) && !n?.match(/\d/) && typeof e == "string" && !isNaN(Number(e));
}
function Uy(e, t, n) {
  var o;
  t === void 0 && (t = Dy(e));
  var r = n.allowNegative, s = n.prefix;
  s === void 0 && (s = "");
  var a = n.suffix;
  a === void 0 && (a = "");
  var i = n.decimalScale, l = t.from, u = t.to, f = u.start, h = u.end, d = $s(n), m = d.allowedDecimalSeparators, g = d.decimalSeparator, b = e[h] === g;
  if (er(e) && (e === s || e === a) && t.lastValue === "")
    return e;
  if (h - f === 1 && m.indexOf(e[f]) !== -1) {
    var x = i === 0 ? "" : g;
    e = e.substring(0, f) + x + e.substring(f + 1, e.length);
  }
  var w = function($, I, V) {
    var D = !1, F = !1;
    s.startsWith("-") ? D = !1 : $.startsWith("--") ? (D = !1, F = !0) : a.startsWith("-") && $.length === a.length ? D = !1 : $[0] === "-" && (D = !0);
    var U = D ? 1 : 0;
    return F && (U = 2), U && ($ = $.substring(U), I -= U, V -= U), { value: $, start: I, end: V, hasNegation: D };
  }, k = w(e, f, h), S = k.hasNegation;
  o = k, e = o.value, f = o.start, h = o.end;
  var j = w(t.lastValue, l.start, l.end), E = j.start, R = j.end, P = j.value, v = e.substring(f, h);
  e.length && P.length && (E > P.length - a.length || R < s.length) && !(v && a.startsWith(v)) && (e = P);
  var T = 0;
  e.startsWith(s) ? T += s.length : f < s.length && (T = f), e = e.substring(T), h -= T;
  var L = e.length, _ = e.length - a.length;
  e.endsWith(a) ? L = _ : (h > _ || h > e.length - a.length) && (L = h), e = e.substring(0, L), e = By(S ? "-" + e : e, r), e = (e.match(Vy(g)) || []).join("");
  var z = e.indexOf(g);
  e = e.replace(new RegExp(mf(g), "g"), function($, I) {
    return I === z ? "." : "";
  });
  var B = Ki(e, r), M = B.beforeDecimal, A = B.afterDecimal, O = B.addNegation;
  return u.end - u.start < l.end - l.start && M === "" && b && !parseFloat(A) && (e = O ? "-" : ""), e;
}
function Wy(e, t) {
  var n = t.prefix;
  n === void 0 && (n = "");
  var o = t.suffix;
  o === void 0 && (o = "");
  var r = Array.from({ length: e.length + 1 }).map(function() {
    return !0;
  }), s = e[0] === "-";
  r.fill(!1, 0, Math.min(n.length + (s ? 1 : 0), e.length));
  var a = e.length;
  return r.fill(!1, a - o.length + 1, a + 1), r;
}
function qy(e) {
  var t = $s(e), n = t.thousandSeparator, o = t.decimalSeparator, r = e.prefix;
  r === void 0 && (r = "");
  var s = e.allowNegative;
  if (s === void 0 && (s = !0), n === o)
    throw new Error(`
        Decimal separator can't be same as thousand separator.
        thousandSeparator: ` + n + ` (thousandSeparator = {true} is same as thousandSeparator = ",")
        decimalSeparator: ` + o + ` (default value for decimalSeparator is .)
     `);
  return r.startsWith("-") && s && (console.error(`
      Prefix can't start with '-' when allowNegative is true.
      prefix: ` + r + `
      allowNegative: ` + s + `
    `), s = !1), Object.assign(Object.assign({}, e), { allowNegative: s });
}
function Ky(e) {
  e = qy(e), e.decimalSeparator, e.allowedDecimalSeparators, e.thousandsGroupStyle;
  var t = e.suffix, n = e.allowNegative, o = e.allowLeadingZeros, r = e.onKeyDown;
  r === void 0 && (r = gn);
  var s = e.onBlur;
  s === void 0 && (s = gn);
  var a = e.thousandSeparator, i = e.decimalScale, l = e.fixedDecimalScale, u = e.prefix;
  u === void 0 && (u = "");
  var f = e.defaultValue, h = e.value, d = e.valueIsNumericString, m = e.onValueChange, g = pf(e, ["decimalSeparator", "allowedDecimalSeparators", "thousandsGroupStyle", "suffix", "allowNegative", "allowLeadingZeros", "onKeyDown", "onBlur", "thousandSeparator", "decimalScale", "fixedDecimalScale", "prefix", "defaultValue", "value", "valueIsNumericString", "onValueChange"]), b = $s(e), x = b.decimalSeparator, w = b.allowedDecimalSeparators, k = function(O) {
    return vl(O, e);
  }, S = function(O, $) {
    return Uy(O, $, e);
  }, j = yn(h) ? f : h, E = d ?? Hy(j, u, t);
  yn(h) ? yn(f) || (E = E || typeof f == "number") : E = E || typeof h == "number";
  var R = function(O) {
    return hf(O) ? O : (typeof O == "number" && (O = vf(O)), E && typeof i == "number" ? ml(O, i, !!l) : O);
  }, P = bf(R(h), R(f), !!E, k, S, m), v = P[0], T = v.numAsString, L = v.formattedValue, _ = P[1], z = function(O) {
    var $ = O.target, I = O.key, V = $.selectionStart, D = $.selectionEnd, F = $.value;
    if (F === void 0 && (F = ""), (I === "Backspace" || I === "Delete") && D < u.length && F !== "-") {
      O.preventDefault();
      return;
    }
    if (V !== D) {
      r(O);
      return;
    }
    I === "Backspace" && F[0] === "-" && V === u.length + 1 && n && In($, 1), i && l && (I === "Backspace" && F[V - 1] === x ? (In($, V - 1), O.preventDefault()) : I === "Delete" && F[V] === x && O.preventDefault()), w?.includes(I) && F[V] === x && In($, V + 1);
    var U = a === !0 ? "," : a;
    I === "Backspace" && F[V - 1] === U && In($, V - 1), I === "Delete" && F[V] === U && In($, V + 1), r(O);
  }, B = function(O) {
    var $ = T;
    if ($.match(/\d/g) || ($ = ""), o || ($ = Py($)), l && i && ($ = ml($, i, l)), $ !== T) {
      var I = vl($, e);
      _({
        formattedValue: I,
        value: $,
        floatValue: parseFloat($)
      }, {
        event: O,
        source: yo.event
      });
    }
    s(O);
  }, M = function(O) {
    return O === x ? !0 : er(O);
  }, A = function(O) {
    var $ = O.currentValue, I = O.lastValue, V = O.formattedValue, D = O.currentValueIndex, F = O.formattedValueIndex, U = $[D], q = V[F], G = yf(I, $), fe = G.to, oe = function(te) {
      return S(te).indexOf(".") + u.length;
    };
    return h === 0 && l && i && $[fe.start] === x && oe($) < D && oe(V) > F ? !1 : D >= fe.start && D < fe.end && w && w.includes(U) && q === x ? !0 : U === q;
  };
  return Object.assign(Object.assign({}, g), {
    value: L,
    valueIsNumericString: !1,
    isValidInputCharacter: M,
    isCharacterSame: A,
    onValueChange: _,
    format: k,
    removeFormatting: S,
    getCaretBoundary: function(O) {
      return Wy(O, e);
    },
    onKeyDown: z,
    onBlur: B
  });
}
function Yy(e) {
  var t = Ky(e);
  return mn.createElement(Fy, Object.assign({}, t));
}
function yl(e, t) {
  return /\d/.test(e) || e === t;
}
function Xy(e, t, n, o) {
  let r = 0;
  for (let s = 0; s < t && s < e.length; s += 1) yl(e[s], o) && (r += 1);
  if (r === 0) return Math.min(t, n.length);
  for (let s = 0; s < n.length; s += 1) if (yl(n[s], o) && (r -= 1, r === 0))
    return s + 1;
  return n.length;
}
function Gy(e, t) {
  let n = 0;
  for (; t + n < e.length && /\d/.test(e[t + n]); ) n += 1;
  return n;
}
function Jy(e, { decimalSeparator: t, thousandSeparator: n, allowedDecimalSeparators: o, thousandsGroupStyle: r }) {
  const s = new Set([...o, t].filter((m) => m.length === 1)), a = e.split(""), i = a.reduce((m, g, b) => (s.has(g) && m.push(b), m), []);
  if (i.length === 0) return e;
  const l = i[i.length - 1], u = a[l], f = i.filter((m) => a[m] === u).length, h = r === "wan" ? 4 : 3;
  let d = -1;
  return f === 1 && (u === t ? d = l : u === n ? d = Gy(e, l + 1) === h ? -1 : l : d = l), a.map((m, g) => g === d ? t : s.has(m) && m !== n ? "" : m).join("");
}
function bl({ direction: e, style: t, ...n }) {
  return /* @__PURE__ */ c.jsx("svg", {
    style: {
      width: "var(--ni-chevron-size)",
      height: "var(--ni-chevron-size)",
      transform: e === "up" ? "rotate(180deg)" : void 0,
      ...t
    },
    viewBox: "0 0 15 15",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    ...n,
    children: /* @__PURE__ */ c.jsx("path", {
      d: "M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z",
      fill: "currentColor",
      fillRule: "evenodd",
      clipRule: "evenodd"
    })
  });
}
var $a = {
  root: "m_e2f5cd4e",
  controls: "m_95e17d22",
  control: "m_80b4b171"
};
const Zy = /^(0\.0*|-0(\.0*)?)$/, wl = /^-?0\d+(\.\d+)?\.?$/, Qy = /\.\d*0$/, wf = /^-?\d+\.$/;
function _a(e) {
  return typeof e == "string" && e !== "" && !Number.isNaN(Number(e));
}
function ua(e) {
  return typeof e == "bigint";
}
function da(e) {
  return typeof e == "number" ? e < Number.MAX_SAFE_INTEGER : e === "" || _a(e) && Number(e) < Number.MAX_SAFE_INTEGER;
}
function xf(e, t) {
  return e === "" || e === "-" || !t && e.startsWith("-") ? !1 : /^-?\d+$/.test(e);
}
function fa(e, t) {
  return typeof e == "bigint" ? !0 : e === "" || xf(e, t);
}
function Bo(e) {
  if (!/^-?\d+$/.test(e)) return null;
  try {
    return BigInt(e);
  } catch {
    return null;
  }
}
function Mr(e) {
  if (typeof e == "bigint") return e;
  if (typeof e == "number" && Number.isFinite(e) && Number.isInteger(e)) return BigInt(e);
}
function Fr(e, t, n) {
  return t !== void 0 && e < t ? t : n !== void 0 && e > n ? n : e;
}
function eb(e) {
  return e.toString().replace(".", "").length;
}
function tb(e, t) {
  return (typeof e == "number" ? e < Number.MAX_SAFE_INTEGER : !Number.isNaN(Number(e))) && !Number.isNaN(e) && eb(t) < 14 && t !== "";
}
function nb(e, t, n) {
  return e === void 0 ? !0 : (t === void 0 || e >= t) && (n === void 0 || e <= n);
}
const pa = {
  size: "sm",
  step: 1,
  clampBehavior: "blur",
  allowDecimal: !0,
  allowNegative: !0,
  withKeyboardEvents: !0,
  allowLeadingZeros: !0,
  trimLeadingZeroesOnBlur: !0,
  startValue: 0,
  allowedDecimalSeparators: [".", ","]
}, Sf = _e((e, { size: t }) => ({ controls: { "--ni-chevron-size": Fe(t, "ni-chevron-size") } }));
function xl(e, t) {
  return t ? `${e}.` : e;
}
function ob(e, t) {
  const n = wf.test(e), o = t.trim ? e.replace(/^0+(?=\d)/, "") : e, r = parseFloat(o);
  if (Number.isNaN(r)) return o;
  if (!t.clamp) return t.trim ? xl(r, n) : e;
  const s = r > Number.MAX_SAFE_INTEGER && t.max !== void 0 ? t.max : xn(r, t.min, t.max);
  return !t.trim && s === r ? e : xl(s, n);
}
function rb(e, t) {
  if (e === "" || e === "-") return e;
  const n = Bo(e);
  return n === null ? e : t.clampBehavior === "blur" ? Fr(n, t.min, t.max) : n;
}
const bo = Rn((e) => {
  const t = Q([
    "Input",
    "InputWrapper",
    "NumberInput"
  ], pa, e), { className: n, classNames: o, styles: r, unstyled: s, vars: a, onChange: i, onValueChange: l, value: u, defaultValue: f, max: h, min: d, step: m, hideControls: g, rightSection: b, isAllowed: x, clampBehavior: w, onBlur: k, allowDecimal: S, decimalScale: j, onKeyDown: E, onKeyDownCapture: R, handlersRef: P, startValue: v, disabled: T, rightSectionPointerEvents: L, allowNegative: _, readOnly: z, size: B, rightSectionWidth: M, stepHoldInterval: A, stepHoldDelay: O, allowLeadingZeros: $, withKeyboardEvents: I, trimLeadingZeroesOnBlur: V, allowedDecimalSeparators: D, selectAllOnFocus: F, onMinReached: U, onMaxReached: q, onFocus: G, attributes: fe, ref: oe, ...te } = t, de = _ ?? !0, Y = $ ?? !0, K = Me({
    name: "NumberInput",
    classes: $a,
    props: t,
    classNames: o,
    styles: r,
    unstyled: s,
    attributes: fe,
    vars: a,
    varsResolver: Sf
  }), { resolvedClassNames: ie, resolvedStyles: xe } = dr({
    classNames: o,
    styles: r,
    props: t
  }), he = p.useRef(ua(u) || ua(f) ? "bigint" : "number");
  ua(u) ? he.current = "bigint" : typeof u == "number" && (he.current = "number");
  const Ee = he.current === "bigint", [re, W] = et({
    value: u,
    defaultValue: f,
    finalValue: "",
    onChange: i
  }), H = O !== void 0 && A !== void 0, X = p.useRef(null), ue = p.useRef(null), Re = p.useRef(0), De = typeof d == "number" ? d : void 0, ve = typeof h == "number" ? h : void 0, ye = typeof m == "number" ? m : pa.step, Se = typeof v == "number" ? v : pa.startValue, Le = Mr(d), pe = Mr(h), vt = Mr(m) ?? BigInt(1), Te = Mr(v) ?? BigInt(0), yt = (J) => !xf(J, de) || Y && wl.test(J) ? J : Bo(J) ?? J, Gn = (J) => {
    const ce = Number(J);
    return Number.isSafeInteger(ce) ? ce : void 0;
  }, Mt = (J, ce) => {
    ce.source === "event" && W(Ee ? yt(J.value) : tb(J.floatValue, J.value) && !Zy.test(J.value) && !(Y && wl.test(J.value)) && !Qy.test(J.value) && !wf.test(J.value) ? J.floatValue : J.value), l?.(J, ce);
  }, dn = (J) => {
    const ce = String(J).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    return ce ? Math.max(0, (ce[1] ? ce[1].length : 0) - (ce[2] ? +ce[2] : 0)) : 0;
  }, Dt = (J) => {
    X.current && typeof J < "u" && X.current.setSelectionRange(J, J);
  }, Jn = p.useRef(Kr);
  Jn.current = () => {
    if (Ee) {
      if (!fa(re, de)) return;
      let Ye;
      const Xe = re;
      if (typeof Xe == "bigint") {
        const lt = Xe + vt;
        pe !== void 0 && lt > pe && q?.(), Ye = pe !== void 0 && lt > pe ? pe : lt;
      } else if (typeof Xe == "string" && Xe !== "") {
        const lt = Bo(Xe);
        if (lt === null) return;
        const pn = lt + vt;
        pe !== void 0 && pn > pe && q?.(), Ye = pe !== void 0 && pn > pe ? pe : pn;
      } else Ye = Fr(Te, Le, pe);
      const Ze = Ye.toString();
      W(Ye), l?.({
        floatValue: Gn(Ye),
        formattedValue: Ze,
        value: Ze
      }, { source: "increment" }), setTimeout(() => Dt(X.current?.value.length), 0);
      return;
    }
    if (!da(re)) return;
    let J;
    const ce = dn(re), Qn = dn(ye), eo = Math.max(ce, Qn), bt = 10 ** eo;
    if (!_a(re) && (typeof re != "number" || Number.isNaN(re))) J = xn(Se, De, ve);
    else if (ve !== void 0) {
      const Ye = (Math.round(Number(re) * bt) + Math.round(ye * bt)) / bt;
      Ye > ve && q?.(), J = Ye <= ve ? Ye : ve;
    } else J = (Math.round(Number(re) * bt) + Math.round(ye * bt)) / bt;
    const rt = J.toFixed(eo);
    W(parseFloat(rt)), l?.({
      floatValue: parseFloat(rt),
      formattedValue: rt,
      value: rt
    }, { source: "increment" }), setTimeout(() => Dt(X.current?.value.length), 0);
  };
  const Zn = p.useRef(Kr);
  Zn.current = () => {
    if (Ee) {
      if (!fa(re, de)) return;
      let Xe;
      const Ze = Le !== void 0 ? Le : de ? void 0 : BigInt(0), lt = re;
      if (typeof lt == "bigint") {
        const to = lt - vt;
        Ze !== void 0 && to < Ze && U?.(), Xe = Ze !== void 0 && to < Ze ? Ze : to;
      } else if (typeof lt == "string" && lt !== "") {
        const to = Bo(lt);
        if (to === null) return;
        const Qs = to - vt;
        Ze !== void 0 && Qs < Ze && U?.(), Xe = Ze !== void 0 && Qs < Ze ? Ze : Qs;
      } else Xe = Fr(Te, Ze, pe);
      const pn = Xe.toString();
      W(Xe), l?.({
        floatValue: Gn(Xe),
        formattedValue: pn,
        value: pn
      }, { source: "decrement" }), setTimeout(() => Dt(X.current?.value.length), 0);
      return;
    }
    if (!da(re)) return;
    let J;
    const ce = De !== void 0 ? De : de ? Number.MIN_SAFE_INTEGER : 0, Qn = dn(re), eo = dn(ye), bt = Math.max(Qn, eo), rt = 10 ** bt;
    if (!_a(re) && typeof re != "number" || Number.isNaN(re)) J = xn(Se, ce, ve);
    else {
      const Xe = (Math.round(Number(re) * rt) - Math.round(ye * rt)) / rt;
      ce !== void 0 && Xe < ce && U?.(), J = ce !== void 0 && Xe < ce ? ce : Xe;
    }
    const Ye = J.toFixed(bt);
    W(parseFloat(Ye)), l?.({
      floatValue: parseFloat(Ye),
      formattedValue: Ye,
      value: Ye
    }, { source: "decrement" }), setTimeout(() => Dt(X.current?.value.length), 0);
  };
  const nt = (J) => {
    const ce = J.clipboardData.getData("text"), Qn = te.decimalSeparator || ".", eo = te.thousandSeparator === !0 ? "," : te.thousandSeparator === !1 ? void 0 : te.thousandSeparator, bt = Jy(ce, {
      decimalSeparator: Qn,
      thousandSeparator: eo,
      allowedDecimalSeparators: D || [".", ","],
      thousandsGroupStyle: te.thousandsGroupStyle
    });
    if (bt !== ce) {
      J.preventDefault();
      const rt = X.current;
      if (rt) {
        const Ye = rt.selectionStart ?? 0, Xe = rt.selectionEnd ?? 0, Ze = rt.value, lt = Ze.substring(0, Ye) + bt + Ze.substring(Xe);
        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set?.call(rt, lt), rt.dispatchEvent(new Event("change", { bubbles: !0 }));
        const pn = Ye + bt.length;
        setTimeout(() => Dt(Xy(lt, pn, rt.value, Qn)), 0);
      }
    }
    te.onPaste?.(J);
  }, Ht = (J) => {
    E?.(J), !(z || !I) && (J.key === "ArrowUp" && (J.preventDefault(), Jn.current?.()), J.key === "ArrowDown" && (J.preventDefault(), Zn.current?.()));
  }, Rr = (J) => {
    if (R?.(J), J.key === "Backspace") {
      const ce = X.current;
      ce && ce.selectionStart === 0 && ce.selectionStart === ce.selectionEnd && (J.preventDefault(), window.setTimeout(() => Dt(0), 0));
    }
  }, Nr = (J) => {
    F && window.setTimeout(() => X.current?.select(), 0), G?.(J);
  }, Zs = (J) => {
    let ce = re;
    Ee ? (w === "blur" && typeof ce == "bigint" && (ce = Fr(ce, Le, pe)), V && typeof ce == "string" && (ce = rb(ce, {
      min: Le,
      max: pe,
      clampBehavior: w
    }))) : typeof ce == "number" ? w === "blur" && (ce = xn(ce, De, ve)) : typeof ce == "string" && (ce = ob(ce, {
      min: De,
      max: ve,
      trim: !!V && dn(ce) < 15,
      clamp: w === "blur"
    })), re !== ce && W(ce), k?.(J);
  };
  fu(P, {
    increment: Jn.current,
    decrement: Zn.current
  });
  const Tr = (J) => {
    J ? Jn.current?.() : Zn.current?.(), Re.current += 1;
  }, Ke = (J) => {
    if (Tr(J), H) {
      const ce = typeof A == "number" ? A : A(Re.current);
      ue.current = window.setTimeout(() => Ke(J), ce);
    }
  }, ot = (J, ce) => {
    J.preventDefault(), X.current?.focus(), Tr(ce), H && (ue.current = window.setTimeout(() => Ke(ce), O));
  }, fn = () => {
    ue.current && window.clearTimeout(ue.current), ue.current = null, Re.current = 0;
  }, Up = /* @__PURE__ */ c.jsxs("div", {
    ...K("controls"),
    children: [/* @__PURE__ */ c.jsx(zn, {
      ...K("control"),
      tabIndex: -1,
      "aria-hidden": !0,
      disabled: T || typeof re == "number" && ve !== void 0 && re >= ve || typeof re == "bigint" && pe !== void 0 && re >= pe,
      mod: { direction: "up" },
      onMouseDown: (J) => J.preventDefault(),
      onPointerDown: (J) => {
        ot(J, !0);
      },
      onPointerUp: fn,
      onPointerLeave: fn,
      children: /* @__PURE__ */ c.jsx(bl, { direction: "up" })
    }), /* @__PURE__ */ c.jsx(zn, {
      ...K("control"),
      tabIndex: -1,
      "aria-hidden": !0,
      disabled: T || typeof re == "number" && De !== void 0 && re <= De || typeof re == "bigint" && Le !== void 0 && re <= Le,
      mod: { direction: "down" },
      onMouseDown: (J) => J.preventDefault(),
      onPointerDown: (J) => {
        ot(J, !1);
      },
      onPointerUp: fn,
      onPointerLeave: fn,
      children: /* @__PURE__ */ c.jsx(bl, { direction: "down" })
    })]
  });
  return /* @__PURE__ */ c.jsx(Ct, {
    component: Yy,
    allowNegative: _,
    className: rn($a.root, n),
    size: B,
    ...te,
    inputMode: Ee ? "numeric" : "decimal",
    readOnly: z,
    disabled: T,
    value: typeof re == "bigint" ? re.toString() : re,
    getInputRef: We(oe, X),
    onValueChange: Mt,
    rightSection: g || z || !(Ee ? fa(re, de) : da(re)) ? b : b || Up,
    classNames: ie,
    styles: xe,
    unstyled: s,
    __staticSelector: "NumberInput",
    decimalScale: Ee ? 0 : S ? j : 0,
    onPaste: nt,
    onFocus: Nr,
    onKeyDown: Ht,
    onKeyDownCapture: Rr,
    rightSectionPointerEvents: L ?? (T ? "none" : void 0),
    rightSectionWidth: M ?? `var(--ni-right-section-width-${B || "sm"})`,
    allowLeadingZeros: $,
    allowedDecimalSeparators: D,
    onBlur: Zs,
    attributes: fe,
    isAllowed: (J) => {
      if (!(!x || x(J))) return !1;
      if (w !== "strict") return !0;
      if (!Ee) return nb(J.floatValue, De, ve);
      if (J.value === "" || J.value === "-") return !0;
      const ce = Bo(J.value);
      return ce === null ? !0 : (Le === void 0 || ce >= Le) && (pe === void 0 || ce <= pe);
    }
  });
});
bo.classes = {
  ...Ct.classes,
  ...$a
};
bo.varsResolver = Sf;
bo.displayName = "@mantine/core/NumberInput";
const Yi = p.createContext(null), Xi = Rn(((e) => {
  const { value: t, defaultValue: n, onChange: o, size: r, wrapperProps: s, children: a, name: i, readOnly: l, disabled: u, ...f } = Q("RadioGroup", null, e), h = Pt(i), [d, m] = et({
    value: t,
    defaultValue: n,
    finalValue: "",
    onChange: o
  }), g = (b) => !l && m(typeof b == "string" ? b : b.currentTarget.value);
  return /* @__PURE__ */ c.jsx(Yi, {
    value: {
      value: d,
      onChange: g,
      size: r,
      name: h,
      disabled: u
    },
    children: /* @__PURE__ */ c.jsx(Nt.Wrapper, {
      size: r,
      ...s,
      ...f,
      labelElement: "div",
      __staticSelector: "RadioGroup",
      children: /* @__PURE__ */ c.jsx($d, {
        role: "radiogroup",
        children: a
      })
    })
  });
}));
Xi.classes = Nt.Wrapper.classes;
Xi.displayName = "@mantine/core/RadioGroup";
var Cf = { card: "m_9dc8ae12" };
const jf = p.createContext(null), sb = { withBorder: !0 }, kf = _e((e, { radius: t }) => ({ card: { "--card-radius": St(t) } })), _s = ae((e) => {
  const t = Q("RadioCard", sb, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, checked: l, mod: u, withBorder: f, value: h, onClick: d, name: m, onKeyDown: g, attributes: b, ...x } = t, w = Me({
    name: "RadioCard",
    classes: Cf,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: b,
    vars: i,
    varsResolver: kf,
    rootSelector: "card"
  }), { dir: k } = Eo(), S = p.use(Yi), j = typeof l == "boolean" ? l : S?.value === h || !1, E = m || S?.name, R = (P) => {
    if (g?.(P), !!E && [
      "ArrowDown",
      "ArrowUp",
      "ArrowLeft",
      "ArrowRight"
    ].includes(P.nativeEvent.code)) {
      P.preventDefault();
      const v = Array.from(document.querySelectorAll(`[role="radio"][name="${E}"]`)), T = v.findIndex((z) => z === P.target), L = T + 1 >= v.length ? 0 : T + 1, _ = T - 1 < 0 ? v.length - 1 : T - 1;
      P.nativeEvent.code === "ArrowDown" && (v[L].focus(), v[L].click()), P.nativeEvent.code === "ArrowUp" && (v[_].focus(), v[_].click()), P.nativeEvent.code === "ArrowLeft" && (v[k === "ltr" ? _ : L].focus(), v[k === "ltr" ? _ : L].click()), P.nativeEvent.code === "ArrowRight" && (v[k === "ltr" ? L : _].focus(), v[k === "ltr" ? L : _].click());
    }
  };
  return /* @__PURE__ */ c.jsx(jf, {
    value: { checked: j },
    children: /* @__PURE__ */ c.jsx(zn, {
      mod: [{
        "with-border": f,
        checked: j
      }, u],
      ...w("card"),
      ...x,
      role: "radio",
      "aria-checked": j,
      name: E,
      onClick: (P) => {
        d?.(P), S?.onChange(h || "");
      },
      onKeyDown: R
    })
  });
});
_s.displayName = "@mantine/core/RadioCard";
_s.classes = Cf;
_s.varsResolver = kf;
var Ef = {
  indicator: "m_717d7ff6",
  icon: "m_3e4da632",
  "indicator--outline": "m_2980836c"
};
const ab = { icon: lf }, Rf = _e((e, { radius: t, color: n, size: o, iconColor: r, variant: s, autoContrast: a }) => {
  const i = ls({
    color: n || e.primaryColor,
    theme: e
  }), l = i.isThemeColor && i.shade === void 0 ? `var(--mantine-color-${i.color}-outline)` : i.color;
  return { indicator: {
    "--radio-size": Fe(o, "radio-size"),
    "--radio-radius": t === void 0 ? void 0 : St(t),
    "--radio-color": s === "outline" ? l : it(n, e),
    "--radio-icon-size": typeof o == "number" ? `calc(${Fe(o, "radio-size")} * 0.4)` : Fe(o, "radio-icon-size"),
    "--radio-icon-color": r ? it(r, e) : pr(a, e) ? jo({
      color: n,
      theme: e,
      autoContrast: a
    }) : void 0
  } };
}), zs = ae((e) => {
  const t = Q("RadioIndicator", ab, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, icon: l, radius: u, color: f, iconColor: h, autoContrast: d, checked: m, mod: g, variant: b, disabled: x, attributes: w, ...k } = t, S = Me({
    name: "RadioIndicator",
    classes: Ef,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: w,
    vars: i,
    varsResolver: Rf,
    rootSelector: "indicator"
  }), j = p.use(jf), E = typeof m == "boolean" ? m : j?.checked || !1;
  return /* @__PURE__ */ c.jsx(ee, {
    ...S("indicator", { variant: b }),
    variant: b,
    mod: [{
      checked: E,
      disabled: x
    }, g],
    ...k,
    children: /* @__PURE__ */ c.jsx(l, { ...S("icon") })
  });
});
zs.displayName = "@mantine/core/RadioIndicator";
zs.classes = Ef;
zs.varsResolver = Rf;
var Nf = {
  root: "m_f3f1af94",
  inner: "m_89c4f5e4",
  icon: "m_f3ed6b2b",
  radio: "m_8a3dbb89",
  "radio--outline": "m_1bfe9d39"
};
const ib = {
  labelPosition: "right",
  withErrorStyles: !0
}, Tf = _e((e, { size: t, radius: n, color: o, iconColor: r, variant: s, autoContrast: a }) => {
  const i = ls({
    color: o || e.primaryColor,
    theme: e
  }), l = i.isThemeColor && i.shade === void 0 ? `var(--mantine-color-${i.color}-outline)` : i.color;
  return { root: {
    "--radio-size": Fe(t, "radio-size"),
    "--radio-radius": n === void 0 ? void 0 : St(n),
    "--radio-color": s === "outline" ? l : it(o, e),
    "--radio-icon-color": r ? it(r, e) : pr(a, e) ? jo({
      color: o,
      theme: e,
      autoContrast: a
    }) : void 0,
    "--radio-icon-size": Fe(t, "radio-icon-size")
  } };
}), En = ae((e) => {
  const t = Q("Radio", ib, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, id: l, size: u, label: f, labelPosition: h, description: d, error: m, radius: g, color: b, variant: x, disabled: w, wrapperProps: k, icon: S = lf, rootRef: j, iconColor: E, onChange: R, mod: P, attributes: v, withErrorStyles: T, checked: L, ..._ } = t, z = Me({
    name: "Radio",
    classes: Nf,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: v,
    vars: i,
    varsResolver: Tf
  }), B = p.use(Yi), M = B?.size ?? u, A = t.size ? u : M, { styleProps: O, rest: $ } = cu(_), I = Pt(l), V = [
    d ? `${I}-description` : void 0,
    m && typeof m != "boolean" ? `${I}-error` : void 0,
    $["aria-describedby"]
  ].filter(Boolean).join(" ") || void 0, D = B ? B.value === $.value : void 0, F = {
    checked: D ?? L,
    name: $.name ?? B?.name,
    onChange: (U) => {
      B?.onChange(U), R?.(U);
    },
    disabled: B?.disabled ?? w
  };
  return /* @__PURE__ */ c.jsx(Vi, {
    ...z("root"),
    __staticSelector: "Radio",
    __stylesApiProps: t,
    id: I,
    size: A,
    labelPosition: h,
    label: f,
    description: d,
    error: m,
    disabled: F.disabled,
    classNames: n,
    styles: s,
    unstyled: a,
    "data-checked": (D ?? L) || void 0,
    variant: x,
    ref: j,
    mod: P,
    attributes: v,
    ...O,
    ...k,
    children: /* @__PURE__ */ c.jsxs(ee, {
      ...z("inner"),
      mod: { "label-position": h },
      children: [/* @__PURE__ */ c.jsx(ee, {
        ...z("radio", {
          focusable: !0,
          variant: x
        }),
        ...$,
        ...F,
        component: "input",
        mod: {
          error: !!m,
          "with-error-styles": T
        },
        id: I,
        type: "radio",
        "aria-describedby": V
      }), /* @__PURE__ */ c.jsx(S, {
        ...z("icon"),
        "aria-hidden": !0
      })]
    })
  });
});
En.classes = Nf;
En.varsResolver = Tf;
En.displayName = "@mantine/core/Radio";
En.Group = Xi;
En.Card = _s;
En.Indicator = zs;
var Pf = {
  root: "m_cf365364",
  indicator: "m_9e182ccd",
  label: "m_1738fcb2",
  input: "m_1714d588",
  control: "m_69686b9b",
  innerLabel: "m_78882f40"
};
const cb = { withItemsBorders: !0 }, Af = _e((e, { radius: t, color: n, transitionDuration: o, size: r, transitionTimingFunction: s }) => ({ root: {
  "--sc-radius": t === void 0 ? void 0 : St(t),
  "--sc-color": n ? it(n, e) : void 0,
  "--sc-shadow": n ? void 0 : "var(--mantine-shadow-xs)",
  "--sc-transition-duration": o === void 0 ? void 0 : `${o}ms`,
  "--sc-transition-timing-function": s,
  "--sc-padding": Fe(r, "sc-padding"),
  "--sc-font-size": Wr(r)
} })), Un = Rn((e) => {
  const t = Q("SegmentedControl", cb, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, data: l, value: u, defaultValue: f, onChange: h, size: d, name: m, disabled: g, readOnly: b, fullWidth: x, orientation: w, radius: k, color: S, transitionDuration: j, transitionTimingFunction: E, variant: R, autoContrast: P, withItemsBorders: v, mod: T, attributes: L, ref: _, ...z } = t, B = Me({
    name: "SegmentedControl",
    props: t,
    classes: Pf,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: L,
    vars: i,
    varsResolver: Af
  }), M = ur(), A = l.map((K) => Hh(K) ? {
    label: `${K}`,
    value: K
  } : K), O = Oh(), [$, I] = p.useState(Nc()), [V, D] = p.useState(null), [F, U] = p.useState({}), q = (K, ie) => {
    K === null || F[ie] === K || (F[ie] = K, U({ ...F }));
  }, [G, fe] = et({
    value: u,
    defaultValue: f,
    finalValue: Array.isArray(l) ? A.find((K) => !K.disabled)?.value ?? l[0]?.value ?? null : null,
    onChange: h
  }), oe = Pt(m), te = A.map((K) => `${K.value}`), de = A.map((K) => /* @__PURE__ */ p.createElement(ee, {
    ...B("control"),
    mod: {
      active: G === K.value,
      orientation: w
    },
    key: `${K.value}`
  }, /* @__PURE__ */ p.createElement("input", {
    ...B("input"),
    disabled: g || K.disabled,
    type: "radio",
    name: oe,
    value: `${K.value}`,
    id: `${oe}-${K.value}`,
    checked: G === K.value,
    onChange: () => !b && fe(K.value),
    "data-focus-ring": M.focusRing,
    key: `${K.value}-input`
  }), /* @__PURE__ */ p.createElement(ee, {
    component: "label",
    ...B("label"),
    mod: {
      active: G === K.value && !(g || K.disabled),
      disabled: g || K.disabled,
      "read-only": b
    },
    htmlFor: `${oe}-${K.value}`,
    ref: (ie) => q(ie, `${K.value}`),
    __vars: { "--sc-label-color": S !== void 0 ? jo({
      color: S,
      theme: M,
      autoContrast: P
    }) : void 0 },
    key: `${K.value}-label`
  }, /* @__PURE__ */ c.jsx("span", {
    ...B("innerLabel"),
    children: K.label
  })))), Y = We(_, D);
  return Ic(() => {
    I(Nc());
  }, [l.length]), Ic(() => {
    U((K) => {
      const ie = {};
      return te.forEach((xe) => {
        xe in K && (ie[xe] = K[xe]);
      }), Object.keys(ie).length === Object.keys(K).length ? K : ie;
    });
  }, [te]), l.length === 0 ? null : /* @__PURE__ */ c.jsxs(ee, {
    ...B("root"),
    variant: R,
    size: d,
    ref: Y,
    mod: [{
      "full-width": x,
      orientation: w,
      initialized: O,
      "with-items-borders": v
    }, T],
    ...z,
    role: "radiogroup",
    "data-disabled": g,
    children: [typeof G < "u" && /* @__PURE__ */ c.jsx(Ss, {
      target: F[`${G}`],
      parent: V,
      component: "span",
      transitionDuration: "var(--sc-transition-duration)",
      ...B("indicator")
    }, $), de]
  });
});
Un.classes = Pf;
Un.varsResolver = Af;
Un.displayName = "@mantine/core/SegmentedControl";
const lb = {
  size: "sm",
  withCheckIcon: !0,
  allowDeselect: !0,
  checkIconPosition: "left",
  openOnFocus: !0
}, ho = Rn((e) => {
  const t = Q([
    "Input",
    "InputWrapper",
    "Select"
  ], lb, e), { classNames: n, styles: o, unstyled: r, vars: s, dropdownOpened: a, defaultDropdownOpened: i, onDropdownClose: l, onDropdownOpen: u, onFocus: f, onBlur: h, onClick: d, onChange: m, data: g, value: b, defaultValue: x, selectFirstOptionOnChange: w, selectFirstOptionOnDropdownOpen: k, onOptionSubmit: S, comboboxProps: j, readOnly: E, disabled: R, filter: P, limit: v, withScrollArea: T, maxDropdownHeight: L, floatingHeight: _, size: z, searchable: B, rightSection: M, checkIconPosition: A, withCheckIcon: O, withAlignedLabels: $, nothingFoundMessage: I, name: V, form: D, searchValue: F, defaultSearchValue: U, onSearchChange: q, allowDeselect: G, error: fe, rightSectionPointerEvents: oe, id: te, clearable: de, clearSectionMode: Y, clearButtonProps: K, hiddenInputProps: ie, renderOption: xe, onClear: he, autoComplete: Ee, scrollAreaProps: re, __defaultRightSection: W, __clearSection: H, __clearable: X, chevronColor: ue, autoSelectOnBlur: Re, openOnFocus: De, attributes: ve, ...ye } = t, Se = p.useMemo(() => Nd(g), [g]), Le = p.useRef({}), pe = p.useMemo(() => Td(Se), [Se]), vt = Pt(te), [Te, yt, Gn] = et({
    value: b,
    defaultValue: x,
    finalValue: null,
    onChange: m
  }), Mt = Te != null ? `${Te}` in pe ? pe[`${Te}`] : Le.current[`${Te}`] : void 0, dn = Ah(Mt), [Dt, Jn, Zn] = et({
    value: F,
    defaultValue: U,
    finalValue: Mt ? Mt.label : "",
    onChange: q
  }), nt = _i({
    opened: a,
    defaultOpened: i,
    onDropdownOpen: () => {
      u?.(), k ? nt.selectFirstOption() : nt.updateSelectedOptionIndex("active", { scrollIntoView: !0 });
    },
    onDropdownClose: () => {
      l?.(), setTimeout(nt.resetSelectedOption, 0);
    }
  }), Ht = (Ke) => {
    Jn(Ke), nt.resetSelectedOption();
  }, { resolvedClassNames: Rr, resolvedStyles: Nr } = dr({
    props: t,
    styles: o,
    classNames: n
  });
  p.useEffect(() => {
    w && nt.selectFirstOption();
  }, [w, Dt]), p.useEffect(() => {
    b === null && Ht(""), b != null && Mt && (dn?.value !== Mt.value || dn?.label !== Mt.label) && Ht(Mt.label);
  }, [b, Mt]), p.useEffect(() => {
    !Gn && !Zn && Ht(Te != null ? `${Te}` in pe ? pe[`${Te}`]?.label : Le.current[`${Te}`]?.label || "" : "");
  }, [pe, Te]), p.useEffect(() => {
    Te && `${Te}` in pe && (Le.current[`${Te}`] = pe[`${Te}`]);
  }, [pe, Te]);
  const Zs = /* @__PURE__ */ c.jsx(Ce.ClearButton, {
    ...K,
    onClear: () => {
      yt(null, null), Ht(""), he?.();
    }
  }), Tr = de && Te != null && !R && !E;
  return /* @__PURE__ */ c.jsxs(c.Fragment, { children: [/* @__PURE__ */ c.jsxs(Ce, {
    store: nt,
    __staticSelector: "Select",
    classNames: Rr,
    styles: Nr,
    unstyled: r,
    readOnly: E,
    size: z,
    attributes: ve,
    floatingHeight: _,
    keepMounted: Re,
    onOptionSubmit: (Ke) => {
      S?.(Ke);
      const ot = G && `${pe[Ke].value}` == `${Te}` ? null : pe[Ke], fn = ot ? ot.value : null;
      fn !== Te && yt(fn, ot), !Gn && Ht(fn != null && ot?.label || ""), nt.closeDropdown();
    },
    ...j,
    children: [/* @__PURE__ */ c.jsx(Ce.Target, {
      targetType: B ? "input" : "button",
      autoComplete: Ee,
      withExpandedAttribute: !0,
      children: /* @__PURE__ */ c.jsx(Ct, {
        id: vt,
        __defaultRightSection: /* @__PURE__ */ c.jsx(Ce.Chevron, {
          size: z,
          error: fe,
          unstyled: r,
          color: ue
        }),
        __clearSection: Zs,
        __clearable: Tr,
        __clearSectionMode: Y,
        rightSection: M,
        rightSectionPointerEvents: oe || "none",
        ...ye,
        size: z,
        __staticSelector: "Select",
        disabled: R,
        readOnly: E || !B,
        value: Dt,
        onChange: (Ke) => {
          if (ey(Ke)) {
            if (!E) {
              const ot = Cy(pe, Ke.currentTarget.value);
              ot && `${ot.value}` != `${Te}` && (yt(ot.value, ot), !Gn && Ht(ot.label));
            }
            return;
          }
          Ht(Ke.currentTarget.value), nt.openDropdown(), w && nt.selectFirstOption();
        },
        onFocus: (Ke) => {
          De && B && nt.openDropdown(), f?.(Ke);
        },
        onBlur: (Ke) => {
          Re && nt.clickSelectedOption(), nt.closeDropdown();
          const ot = Te != null && (`${Te}` in pe ? pe[`${Te}`] : Le.current[`${Te}`]);
          Ht(ot && ot.label || ""), h?.(Ke);
        },
        onClick: (Ke) => {
          B ? nt.openDropdown() : nt.toggleDropdown(), d?.(Ke);
        },
        classNames: Rr,
        styles: Nr,
        unstyled: r,
        pointer: !B,
        error: fe,
        attributes: ve
      })
    }), /* @__PURE__ */ c.jsx(Qv, {
      data: Se,
      hidden: E || R,
      filter: P,
      search: Dt,
      limit: v,
      hiddenWhenEmpty: !I,
      withScrollArea: T,
      maxDropdownHeight: L,
      filterOptions: !!B && Mt?.label !== Dt,
      value: Te,
      checkIconPosition: A,
      withCheckIcon: O,
      withAlignedLabels: $,
      nothingFoundMessage: I,
      unstyled: r,
      labelId: ye.label ? `${vt}-label` : void 0,
      "aria-label": ye.label ? void 0 : ye["aria-label"],
      renderOption: xe,
      scrollAreaProps: re
    })]
  }), /* @__PURE__ */ c.jsx(Ce.HiddenInput, {
    value: Te,
    name: V,
    form: D,
    disabled: R,
    ...ie
  })] });
});
ho.classes = {
  ...Ct.classes,
  ...Ce.classes
};
ho.displayName = "@mantine/core/Select";
const [ub, db] = Jt("Table component was not found in the tree");
var yr = {
  table: "m_b23fa0ef",
  th: "m_4e7aa4f3",
  tr: "m_4e7aa4fd",
  td: "m_4e7aa4ef",
  tbody: "m_b2404537",
  thead: "m_b242d975",
  caption: "m_9e5a3ac7",
  scrollContainer: "m_a100c15",
  scrollContainerInner: "m_62259741"
};
function fb(e, t) {
  if (!t) return;
  const n = {};
  return t.columnBorder && e.withColumnBorders && (n["data-with-column-border"] = !0), t.rowBorder && e.withRowBorders && (n["data-with-row-border"] = !0), t.striped && e.striped && (n["data-striped"] = e.striped), t.highlightOnHover && e.highlightOnHover && (n["data-hover"] = !0), t.captionSide && e.captionSide && (n["data-side"] = e.captionSide), t.stickyHeader && e.stickyHeader && (n["data-sticky"] = !0), n;
}
function Kn(e, t) {
  const n = `Table${e.charAt(0).toUpperCase()}${e.slice(1)}`, o = ae((r) => {
    const s = Q(n, {}, r), { classNames: a, className: i, style: l, styles: u, ...f } = s, h = db();
    return /* @__PURE__ */ c.jsx(ee, {
      component: e,
      ...fb(h, t),
      ...h.getStyles(e, {
        className: i,
        classNames: a,
        style: l,
        styles: u,
        props: s
      }),
      ...f
    });
  });
  return o.displayName = `@mantine/core/${n}`, o.classes = yr, o;
}
const za = Kn("th", { columnBorder: !0 }), If = Kn("td", { columnBorder: !0 }), Br = Kn("tr", {
  rowBorder: !0,
  striped: !0,
  highlightOnHover: !0
}), Mf = Kn("thead", { stickyHeader: !0 }), Df = Kn("tbody"), Of = Kn("tfoot"), Lf = Kn("caption", { captionSide: !0 }), pb = { type: "scrollarea" }, $f = _e((e, { minWidth: t, maxHeight: n, type: o }) => ({ scrollContainer: {
  "--table-min-width": Ae(t),
  "--table-max-height": Ae(n),
  "--table-overflow": o === "native" ? "auto" : void 0
} })), Fs = ae((e) => {
  const t = Q("TableScrollContainer", pb, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, children: l, minWidth: u, maxHeight: f, type: h, scrollAreaProps: d, attributes: m, ...g } = t, b = Me({
    name: "TableScrollContainer",
    classes: yr,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: m,
    vars: i,
    varsResolver: $f,
    rootSelector: "scrollContainer"
  });
  return /* @__PURE__ */ c.jsx(ee, {
    component: h === "scrollarea" ? Tn : "div",
    ...h === "scrollarea" ? f ? {
      offsetScrollbars: "xy",
      ...d
    } : {
      offsetScrollbars: "x",
      ...d
    } : {},
    ...b("scrollContainer"),
    ...g,
    children: /* @__PURE__ */ c.jsx("div", {
      ...b("scrollContainerInner"),
      children: l
    })
  });
});
Fs.classes = yr;
Fs.varsResolver = $f;
Fs.displayName = "@mantine/core/TableScrollContainer";
function Gi({ data: e }) {
  return /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
    e.caption && /* @__PURE__ */ c.jsx(Lf, { children: e.caption }),
    e.head && /* @__PURE__ */ c.jsx(Mf, { children: /* @__PURE__ */ c.jsx(Br, { children: e.head.map((t, n) => /* @__PURE__ */ c.jsx(za, { children: t }, n)) }) }),
    e.body && /* @__PURE__ */ c.jsx(Df, { children: e.body.map((t, n) => /* @__PURE__ */ c.jsx(Br, { children: t.map((o, r) => /* @__PURE__ */ c.jsx(If, { children: o }, r)) }, n)) }),
    e.foot && /* @__PURE__ */ c.jsx(Of, { children: /* @__PURE__ */ c.jsx(Br, { children: e.foot.map((t, n) => /* @__PURE__ */ c.jsx(za, { children: t }, n)) }) })
  ] });
}
Gi.displayName = "@mantine/core/TableDataRenderer";
const hb = {
  withRowBorders: !0,
  verticalSpacing: 7
}, _f = _e((e, { layout: t, captionSide: n, horizontalSpacing: o, verticalSpacing: r, borderColor: s, stripedColor: a, highlightOnHoverColor: i, striped: l, highlightOnHover: u, stickyHeaderOffset: f, stickyHeader: h }) => ({ table: {
  "--table-layout": t,
  "--table-caption-side": n,
  "--table-horizontal-spacing": Xo(o),
  "--table-vertical-spacing": Xo(r),
  "--table-border-color": s ? it(s, e) : void 0,
  "--table-striped-color": l && a ? it(a, e) : void 0,
  "--table-highlight-on-hover-color": u && i ? it(i, e) : void 0,
  "--table-sticky-header-offset": h ? Ae(f) : void 0
} })), at = ae((e) => {
  const t = Q("Table", hb, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, horizontalSpacing: l, verticalSpacing: u, captionSide: f, stripedColor: h, highlightOnHoverColor: d, striped: m, highlightOnHover: g, withColumnBorders: b, withRowBorders: x, withTableBorder: w, borderColor: k, layout: S, data: j, children: E, stickyHeader: R, stickyHeaderOffset: P, mod: v, tabularNums: T, attributes: L, ..._ } = t, z = Me({
    name: "Table",
    props: t,
    className: o,
    style: r,
    classes: yr,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: L,
    rootSelector: "table",
    vars: i,
    varsResolver: _f,
    stable: !0
  }), B = m === !0 ? "odd" : m || void 0, M = f || "bottom", A = p.useMemo(() => ({
    getStyles: z,
    stickyHeader: R,
    striped: B,
    highlightOnHover: g,
    withColumnBorders: b,
    withRowBorders: x,
    captionSide: M
  }), [
    z,
    R,
    B,
    g,
    b,
    x,
    M
  ]);
  return /* @__PURE__ */ c.jsx(ub, {
    value: A,
    children: /* @__PURE__ */ c.jsx(ee, {
      component: "table",
      mod: [{
        withTableBorder: w,
        tabularNums: T
      }, v],
      ...z("table"),
      ..._,
      children: E || !!j && /* @__PURE__ */ c.jsx(Gi, { data: j })
    })
  });
});
at.classes = yr;
at.varsResolver = _f;
at.displayName = "@mantine/core/Table";
at.Td = If;
at.Th = za;
at.Tr = Br;
at.Thead = Mf;
at.Tbody = Df;
at.Tfoot = Of;
at.Caption = Lf;
at.ScrollContainer = Fs;
at.DataRenderer = Gi;
const [mb, Ji] = Jt("Tabs component was not found in the tree");
var br = {
  root: "m_89d60db1",
  "list--default": "m_576c9d4",
  list: "m_89d33d6d",
  tab: "m_4ec4dce6",
  panel: "m_b0c91715",
  tabSection: "m_fc420b1f",
  tabLabel: "m_42bbd1ae",
  "tab--default": "m_539e827b",
  "list--outline": "m_6772fbd5",
  "tab--outline": "m_b59ab47c",
  "tab--pills": "m_c3381914"
};
const Zi = ae((e) => {
  const t = Q("TabsList", null, e), { children: n, className: o, grow: r, justify: s, classNames: a, styles: i, style: l, mod: u, ...f } = t, h = Ji();
  return /* @__PURE__ */ c.jsx(ee, {
    ...h.getStyles("list", {
      className: o,
      style: l,
      classNames: a,
      styles: i,
      props: t,
      variant: h.variant
    }),
    role: "tablist",
    variant: h.variant,
    mod: [{
      grow: r,
      orientation: h.orientation,
      placement: h.orientation === "vertical" && h.placement,
      inverted: h.inverted
    }, u],
    "aria-orientation": h.orientation,
    __vars: { "--tabs-justify": s },
    ...f,
    children: n
  });
});
Zi.classes = br;
Zi.displayName = "@mantine/core/TabsList";
const Qi = ae((e) => {
  const t = Q("TabsPanel", null, e), { children: n, className: o, value: r, classNames: s, styles: a, style: i, mod: l, keepMounted: u, ...f } = t, h = ri(), d = Ji();
  p.useEffect(() => (d.setMountedPanel(r, !0), () => {
    d.setMountedPanel(r, !1);
  }), [r]);
  const m = d.value === r, g = d.keepMounted || u, b = d.keepMountedMode !== "display-none", x = g && b && h !== "test" ? /* @__PURE__ */ c.jsx(p.Activity, {
    mode: m ? "visible" : "hidden",
    children: n
  }) : g || m ? n : null;
  return /* @__PURE__ */ c.jsx(ee, {
    ...d.getStyles("panel", {
      className: o,
      classNames: s,
      styles: a,
      style: [i, m ? void 0 : { display: "none" }],
      props: t
    }),
    mod: [{ orientation: d.orientation }, l],
    role: "tabpanel",
    id: d.getPanelId(r),
    "aria-labelledby": d.getTabId(r),
    ...f,
    children: x
  });
});
Qi.classes = br;
Qi.displayName = "@mantine/core/TabsPanel";
const ec = ae((e) => {
  const t = Q("TabsTab", null, e), { className: n, children: o, rightSection: r, leftSection: s, value: a, onClick: i, onKeyDown: l, disabled: u, color: f, style: h, classNames: d, styles: m, vars: g, mod: b, tabIndex: x, ...w } = t, k = ur(), { dir: S } = Eo(), j = Ji(), E = a === j.value, R = (v) => {
    j.onChange(j.allowTabDeactivation && a === j.value ? null : a), i?.(v);
  }, P = {
    classNames: d,
    styles: m,
    props: t
  };
  return /* @__PURE__ */ c.jsxs(zn, {
    ...j.getStyles("tab", {
      className: n,
      style: h,
      variant: j.variant,
      ...P
    }),
    disabled: u,
    unstyled: j.unstyled,
    variant: j.variant,
    mod: [{
      active: E,
      disabled: u,
      orientation: j.orientation,
      inverted: j.inverted,
      placement: j.orientation === "vertical" && j.placement
    }, b],
    role: "tab",
    id: j.getTabId(a),
    "aria-selected": E,
    tabIndex: x !== void 0 ? x : E || j.value === null ? 0 : -1,
    "aria-controls": j.mountedPanels.current.has(a) ? j.getPanelId(a) : void 0,
    onClick: R,
    __vars: { "--tabs-color": f ? it(f, k) : void 0 },
    onKeyDown: mu({
      siblingSelector: '[role="tab"]',
      parentSelector: '[role="tablist"]',
      activateOnFocus: j.activateTabWithKeyboard,
      loop: j.loop,
      orientation: j.orientation || "horizontal",
      dir: S,
      onKeyDown: l
    }),
    ...w,
    children: [
      s && /* @__PURE__ */ c.jsx("span", {
        ...j.getStyles("tabSection", P),
        "data-position": "left",
        children: s
      }),
      o && /* @__PURE__ */ c.jsx("span", {
        ...j.getStyles("tabLabel", P),
        children: o
      }),
      r && /* @__PURE__ */ c.jsx("span", {
        ...j.getStyles("tabSection", P),
        "data-position": "right",
        children: r
      })
    ]
  });
});
ec.classes = br;
ec.displayName = "@mantine/core/TabsTab";
const Sl = "Tabs.Tab or Tabs.Panel component was rendered with invalid value or without value", gb = {
  keepMounted: !0,
  keepMountedMode: "activity",
  orientation: "horizontal",
  loop: !0,
  activateTabWithKeyboard: !0,
  variant: "default",
  placement: "left"
}, zf = _e((e, { radius: t, color: n, autoContrast: o }) => ({ root: {
  "--tabs-radius": St(t),
  "--tabs-color": it(n, e),
  "--tabs-text-color": pr(o, e) ? jo({
    color: n,
    theme: e,
    autoContrast: o
  }) : void 0
} })), ht = ae((e) => {
  const t = Q("Tabs", gb, e), { defaultValue: n, value: o, onChange: r, orientation: s, children: a, loop: i, id: l, activateTabWithKeyboard: u, allowTabDeactivation: f, variant: h, color: d, radius: m, inverted: g, placement: b, keepMounted: x, keepMountedMode: w, classNames: k, styles: S, unstyled: j, className: E, style: R, vars: P, autoContrast: v, mod: T, attributes: L, ..._ } = t, z = Pt(l), B = p.useRef(/* @__PURE__ */ new Set()), M = Eh(), A = p.useCallback((V, D) => {
    const F = B.current;
    D && !F.has(V) ? (F.add(V), M()) : !D && F.has(V) && (F.delete(V), M());
  }, []), [O, $] = et({
    value: o,
    defaultValue: n,
    finalValue: null,
    onChange: r
  }), I = Me({
    name: "Tabs",
    props: t,
    classes: br,
    className: E,
    style: R,
    classNames: k,
    styles: S,
    unstyled: j,
    attributes: L,
    vars: P,
    varsResolver: zf
  });
  return /* @__PURE__ */ c.jsx(mb, {
    value: {
      placement: b,
      value: O,
      orientation: s,
      id: z,
      loop: i,
      activateTabWithKeyboard: u,
      getTabId: qr(`${z}-tab`, Sl),
      getPanelId: qr(`${z}-panel`, Sl),
      onChange: $,
      allowTabDeactivation: f,
      variant: h,
      color: d,
      radius: m,
      inverted: g,
      keepMounted: x,
      keepMountedMode: w,
      unstyled: j,
      getStyles: I,
      mountedPanels: B,
      setMountedPanel: A
    },
    children: /* @__PURE__ */ c.jsx(ee, {
      id: z,
      variant: h,
      mod: [{
        orientation: s,
        inverted: s === "horizontal" && g,
        placement: s === "vertical" && b
      }, T],
      ...I("root"),
      ..._,
      children: a
    })
  });
});
ht.classes = br;
ht.varsResolver = zf;
ht.displayName = "@mantine/core/Tabs";
ht.Tab = ec;
ht.Panel = Qi;
ht.List = Zi;
const tt = ae((e) => {
  const t = Q([
    "Input",
    "InputWrapper",
    "TextInput"
  ], null, e);
  return /* @__PURE__ */ c.jsx(Ct, {
    component: "input",
    ...t,
    __staticSelector: "TextInput"
  });
});
tt.classes = Ct.classes;
tt.displayName = "@mantine/core/TextInput";
function tr(e, t) {
  for (const n of t) {
    if (n.value === e) return n;
    if (Array.isArray(n.children)) {
      const o = tr(e, n.children);
      if (o) return o;
    }
  }
  return null;
}
function Zr(e, t, n = []) {
  const o = tr(e, t);
  return o ? !Array.isArray(o.children) || o.children.length === 0 ? [o.value] : (o.children.forEach((r) => {
    Array.isArray(r.children) && r.children.length > 0 ? Zr(r.value, t, n) : n.push(r.value);
  }), n) : n;
}
function Ff(e) {
  return e.reduce((t, n) => (Array.isArray(n.children) && n.children.length > 0 ? t.push(...Ff(n.children)) : t.push(n.value), t), []);
}
function Bs(e, t, n = []) {
  const o = [];
  for (const r of e) if (Array.isArray(r.children) && r.children.length > 0) {
    const s = Bs(r.children, t, n);
    if (s.currentTreeChecked.length === r.children.length) {
      const a = s.currentTreeChecked.every((l) => l.checked), i = {
        checked: a,
        indeterminate: !a,
        value: r.value,
        hasChildren: !0
      };
      o.push(i), n.push(i);
    } else if (s.currentTreeChecked.length > 0) {
      const a = {
        checked: !1,
        indeterminate: !0,
        value: r.value,
        hasChildren: !0
      };
      o.push(a), n.push(a);
    }
  } else if (t.includes(r.value)) {
    const s = {
      checked: !0,
      indeterminate: !1,
      value: r.value,
      hasChildren: !1
    };
    o.push(s), n.push(s);
  }
  return {
    result: n,
    currentTreeChecked: o
  };
}
function vb(e, t, n) {
  return n.length === 0 ? !1 : n.includes(e) ? !0 : Bs(t, n).result.some((o) => o.value === e && o.checked);
}
const yb = ju(vb);
function bb(e, t, n) {
  return n.length === 0 ? !1 : Bs(t, n).result.some((o) => o.value === e && o.indeterminate);
}
const wb = ju(bb);
function Bf(e, t, n, o = {}) {
  return t.forEach((r) => {
    o[r.value] = r.value in e ? e[r.value] : r.value === n, Array.isArray(r.children) && Bf(e, r.children, n, o);
  }), o;
}
function xb(e, t, n) {
  if (n) return e;
  const o = [];
  return e.forEach((r) => o.push(...Zr(r, t))), Array.from(new Set(o));
}
function Vf(e) {
  const t = [];
  for (const n of e)
    t.push(n.value), Array.isArray(n.children) && n.children.length > 0 && t.push(...Vf(n.children));
  return t;
}
function Hf({ initialSelectedState: e = [], expandedState: t, initialCheckedState: n = [], checkedState: o, initialExpandedState: r = {}, selectedState: s, multiple: a = !1, onNodeCollapse: i, onNodeExpand: l, onCheckedStateChange: u, onSelectedStateChange: f, onExpandedStateChange: h, onLoadChildren: d, checkStrictly: m = !1 } = {}) {
  const [g, b] = p.useState([]), [x, w] = et({
    value: t,
    defaultValue: r,
    finalValue: {},
    onChange: h
  }), [k, S] = et({
    value: s,
    defaultValue: e,
    finalValue: [],
    onChange: f
  }), [j, E] = et({
    value: o,
    defaultValue: n,
    finalValue: [],
    onChange: u
  }), [R, P] = p.useState(null), v = p.useRef(/* @__PURE__ */ new Set()), T = p.useRef(/* @__PURE__ */ new Set()), [L, _] = p.useState([]), [z, B] = p.useState({}), M = p.useCallback((W) => {
    w(Bf(x, W, k)), E(xb(j, W, m)), b(W);
  }, [
    k,
    j,
    x,
    m
  ]), A = p.useCallback(async (W) => {
    if (d && !(v.current.has(W) || T.current.has(W))) {
      v.current.add(W), _(Array.from(v.current)), B((H) => {
        if (!(W in H)) return H;
        const X = { ...H };
        return delete X[W], X;
      });
      try {
        await d(W), T.current.add(W);
      } catch (H) {
        const X = H instanceof Error ? H : new Error(String(H));
        B((ue) => ({
          ...ue,
          [W]: X
        }));
      } finally {
        v.current.delete(W), _(Array.from(v.current));
      }
    }
  }, [d]), O = p.useCallback((W) => {
    if (!d) return;
    const H = tr(W, g);
    H && H.hasChildren && !Array.isArray(H.children) && A(W);
  }, [
    d,
    g,
    A
  ]), $ = p.useCallback((W) => {
    const H = {
      ...x,
      [W]: !x[W]
    };
    H[W] ? l?.(W) : i?.(W), H[W] && O(W), w(H);
  }, [
    i,
    l,
    x,
    O
  ]), I = p.useCallback((W) => {
    x[W] !== !1 && i?.(W), w({
      ...x,
      [W]: !1
    });
  }, [i, x]), V = p.useCallback((W) => {
    x[W] !== !0 && l?.(W), O(W), w({
      ...x,
      [W]: !0
    });
  }, [
    l,
    x,
    O
  ]), D = p.useCallback(() => {
    const W = { ...x };
    Object.keys(W).forEach((H) => {
      W[H] = !0, O(H);
    }), w(W);
  }, [x, O]), F = p.useCallback(() => {
    const W = { ...x };
    Object.keys(W).forEach((H) => {
      W[H] = !1;
    }), w(W);
  }, [x]), U = p.useCallback((W) => {
    if (!a)
      return k.includes(W) ? (P(null), []) : (P(W), [W]);
    if (k.includes(W))
      return P(null), k.filter((H) => H !== W);
    P(W), S([...k, W]);
  }, [k]), q = p.useCallback((W) => {
    P(W), S(a ? k.includes(W) ? k : [...k, W] : [W]);
  }, [k]), G = p.useCallback((W) => {
    R === W && P(null), S(k.filter((H) => H !== W));
  }, [k]), fe = p.useCallback(() => {
    S([]), P(null);
  }, []), oe = p.useCallback((W) => {
    if (m)
      j.includes(W) || E([...j, W]);
    else {
      const H = Zr(W, g);
      E(Array.from(/* @__PURE__ */ new Set([...j, ...H])));
    }
  }, [
    g,
    j,
    m
  ]), te = p.useCallback((W) => {
    if (m) E(j.filter((H) => H !== W));
    else {
      const H = Zr(W, g);
      E(j.filter((X) => !H.includes(X)));
    }
  }, [
    g,
    j,
    m
  ]), de = p.useCallback(() => {
    E(m ? Vf(g) : Ff(g));
  }, [g, m]), Y = p.useCallback(() => {
    E([]);
  }, []), K = p.useCallback(() => m ? j.map((W) => {
    const H = tr(W, g);
    return {
      checked: !0,
      indeterminate: !1,
      value: W,
      hasChildren: H ? Array.isArray(H.children) && H.children.length > 0 || !!H.hasChildren : !1
    };
  }) : Bs(g, j).result, [
    m,
    j,
    g
  ]), ie = p.useCallback((W) => m ? j.includes(W) : yb(W, g, j), [
    m,
    j,
    g
  ]), xe = p.useCallback((W) => m ? !1 : wb(W, g, j), [
    m,
    j,
    g
  ]), he = p.useCallback((W) => L.includes(W), [L]), Ee = p.useCallback((W) => z[W] || null, [z]), re = p.useCallback((W) => {
    T.current.delete(W), B((H) => {
      if (!(W in H)) return H;
      const X = { ...H };
      return delete X[W], X;
    });
  }, []);
  return p.useMemo(() => ({
    checkStrictly: m,
    multiple: a,
    expandedState: x,
    selectedState: k,
    checkedState: j,
    anchorNode: R,
    initialize: M,
    toggleExpanded: $,
    collapse: I,
    expand: V,
    expandAllNodes: D,
    collapseAllNodes: F,
    setExpandedState: w,
    checkNode: oe,
    uncheckNode: te,
    checkAllNodes: de,
    uncheckAllNodes: Y,
    setCheckedState: E,
    toggleSelected: U,
    select: q,
    deselect: G,
    clearSelected: fe,
    setSelectedState: S,
    getCheckedNodes: K,
    isNodeChecked: ie,
    isNodeIndeterminate: xe,
    isNodeLoading: he,
    getNodeLoadError: Ee,
    loadNode: A,
    invalidateNode: re
  }), [
    m,
    a,
    x,
    k,
    j,
    R,
    M,
    $,
    I,
    V,
    D,
    F,
    w,
    oe,
    te,
    de,
    Y,
    E,
    U,
    q,
    G,
    fe,
    S,
    K,
    ie,
    xe,
    he,
    Ee,
    A,
    re
  ]);
}
function Sb(e, t, n) {
  const o = tr(t, e);
  if (!o || !o.children) return !1;
  function r(s) {
    for (const a of s)
      if (a.value === n || a.children && r(a.children)) return !0;
    return !1;
  }
  return r(o.children);
}
function Cb(e, t, n, o) {
  const r = t.getBoundingClientRect(), s = e.clientY - r.top, a = r.height;
  return n ? o ? s < a * 0.5 ? "before" : "inside" : s < a * 0.25 ? "before" : s > a * 0.75 ? "after" : "inside" : s < a * 0.5 ? "before" : "after";
}
const jb = {
  elementProps: {},
  dragHandleProps: void 0
};
function kb({ nodeValue: e, hasChildren: t, isExpanded: n, data: o, onDragDrop: r, dragStateRef: s, allowDrop: a, withDragHandle: i }) {
  const [l, u] = p.useState(!1);
  return p.useEffect(() => {
    if (!i || !l) return;
    const b = () => u(!1);
    return window.addEventListener("mouseup", b), () => window.removeEventListener("mouseup", b);
  }, [i, l]), r ? {
    elementProps: {
      draggable: i ? l : !0,
      onDragStart: (b) => {
        if (i && !l) return;
        b.stopPropagation(), b.dataTransfer.effectAllowed = "move", b.dataTransfer.setData("text/plain", e), s.current.draggedValue = e;
        const x = b.currentTarget, w = x.closest("[role=treeitem]");
        w && w.setAttribute("data-dragging", "true"), requestAnimationFrame(() => {
          x.setAttribute("data-dragging", "true");
        });
      },
      onDragOver: (b) => {
        const x = s.current.draggedValue;
        if (!x || x === e || Sb(o, x, e)) return;
        const w = b.currentTarget, k = Cb(b, w, t, n);
        if (a && !a({
          draggedNode: x,
          targetNode: e,
          position: k
        })) {
          const j = s.current.currentDropTarget;
          j && j !== w && j.removeAttribute("data-drag-over"), w.removeAttribute("data-drag-over"), s.current.currentDropTarget = null;
          return;
        }
        b.preventDefault(), b.stopPropagation(), b.dataTransfer.dropEffect = "move";
        const S = s.current.currentDropTarget;
        S && S !== w && S.removeAttribute("data-drag-over"), w.setAttribute("data-drag-over", k), s.current.currentDropTarget = w;
      },
      onDragLeave: (b) => {
        const x = b.currentTarget, w = b.relatedTarget;
        w && x.contains(w) || (x.removeAttribute("data-drag-over"), s.current.currentDropTarget === x && (s.current.currentDropTarget = null));
      },
      onDrop: (b) => {
        b.preventDefault(), b.stopPropagation();
        const x = b.currentTarget, w = x.getAttribute("data-drag-over");
        x.removeAttribute("data-drag-over");
        const k = s.current.draggedValue;
        if (k && w && k !== e) {
          const S = {
            draggedNode: k,
            targetNode: e,
            position: w
          };
          (!a || a(S)) && r(S);
        }
        s.current.draggedValue = null, s.current.currentDropTarget = null;
      },
      onDragEnd: (b) => {
        const x = b.currentTarget;
        x.removeAttribute("data-dragging");
        const w = x.closest("[role=treeitem]");
        w && w.removeAttribute("data-dragging");
        const k = s.current.currentDropTarget;
        k && k.removeAttribute("data-drag-over"), s.current.draggedValue = null, s.current.currentDropTarget = null, i && u(!1);
      }
    },
    dragHandleProps: i ? { onMouseDown: () => u(!0) } : void 0
  } : jb;
}
function Cl(e, t, n) {
  if (!e || !t) return [];
  const o = n.indexOf(e), r = n.indexOf(t), s = Math.min(o, r), a = Math.max(o, r);
  return n.slice(s, a + 1);
}
function Eb(e, t) {
  for (let n = e; n && n !== t; ) {
    if (n.style.display === "none") return !1;
    n = n.parentElement;
  }
  return !0;
}
function tc({ node: e, getStyles: t, rootIndex: n, controller: o, expandOnClick: r, selectOnClick: s, isSubtree: a, level: i = 1, renderNode: l, flatValues: u, allowRangeSelection: f, expandOnSpace: h, checkOnSpace: d, keepMounted: m, onDragDrop: g, allowDrop: b, withDragHandle: x, dragStateRef: w, data: k }) {
  const S = p.useRef(null), j = Array.isArray(e.children) && e.children.length > 0, E = !!e.hasChildren && !j, R = j || E, P = o.isNodeLoading(e.value), v = o.getNodeLoadError(e.value), T = o.expandedState[e.value] || !1, L = (e.children || []).map((I) => /* @__PURE__ */ c.jsx(tc, {
    node: I,
    flatValues: u,
    getStyles: t,
    rootIndex: void 0,
    level: i + 1,
    controller: o,
    expandOnClick: r,
    isSubtree: !0,
    renderNode: l,
    selectOnClick: s,
    allowRangeSelection: f,
    expandOnSpace: h,
    checkOnSpace: d,
    keepMounted: m,
    onDragDrop: g,
    allowDrop: b,
    withDragHandle: x,
    dragStateRef: w,
    data: k
  }, I.value)), { elementProps: _, dragHandleProps: z } = kb({
    nodeValue: e.value,
    hasChildren: R,
    isExpanded: T,
    data: k,
    onDragDrop: g,
    dragStateRef: w,
    allowDrop: b,
    withDragHandle: x
  }), B = (I) => {
    if (I.nativeEvent.code === "ArrowRight")
      if (I.stopPropagation(), I.preventDefault(), T) {
        const V = I.currentTarget.querySelector("[role=treeitem]");
        V?.setAttribute("data-focus-ring", "true"), V?.focus();
      } else o.expand(e.value);
    if (I.nativeEvent.code === "ArrowLeft") {
      if (I.stopPropagation(), I.preventDefault(), T && R) o.collapse(e.value);
      else if (a) {
        const V = Go(I.currentTarget, "[role=treeitem]");
        V?.setAttribute("data-focus-ring", "true"), V?.focus();
      }
    }
    if (I.nativeEvent.code === "ArrowDown" || I.nativeEvent.code === "ArrowUp") {
      const V = Go(I.currentTarget, "[data-tree-root]");
      if (!V) return;
      I.stopPropagation(), I.preventDefault();
      const D = Array.from(V.querySelectorAll("[role=treeitem]")).filter((G) => Eb(G, V)), F = D.indexOf(I.currentTarget);
      if (F === -1) return;
      const U = I.nativeEvent.code === "ArrowDown" ? F + 1 : F - 1, q = D[U];
      if (q?.setAttribute("data-focus-ring", "true"), q?.focus(), I.shiftKey) {
        const G = D[U];
        G && o.setSelectedState(Cl(o.anchorNode, G.dataset.value, u));
      }
    }
    I.nativeEvent.code === "Space" && (h && (I.stopPropagation(), I.preventDefault(), o.toggleExpanded(e.value)), d && (I.stopPropagation(), I.preventDefault(), o.isNodeChecked(e.value) ? o.uncheckNode(e.value) : o.checkNode(e.value)));
  }, M = (I) => {
    I.stopPropagation(), f && I.shiftKey && o.anchorNode ? (o.setSelectedState(Cl(o.anchorNode, e.value, u)), S.current?.focus()) : (r && o.toggleExpanded(e.value), s && o.select(e.value), S.current?.focus());
  }, A = o.selectedState.includes(e.value), O = {
    ...t("label"),
    onClick: M,
    "data-selected": A || void 0,
    "data-value": e.value,
    ..._
  }, $ = T && P && L.length === 0;
  return /* @__PURE__ */ c.jsxs("li", {
    ...t("node", { style: { "--label-offset": `calc(var(--level-offset) * ${i - 1})` } }),
    role: "treeitem",
    "aria-selected": A,
    "data-value": e.value,
    "data-selected": A || void 0,
    "data-level": i,
    tabIndex: n === 0 ? 0 : -1,
    onKeyDown: B,
    onBlur: (I) => {
      I.currentTarget.contains(I.relatedTarget) || I.currentTarget.removeAttribute("data-focus-ring");
    },
    ref: S,
    children: [
      typeof l == "function" ? l({
        node: e,
        level: i,
        selected: A,
        isRoot: i === 1,
        tree: o,
        expanded: T,
        hasChildren: R,
        isLoading: P,
        loadError: v,
        elementProps: O,
        dragHandleProps: z
      }) : /* @__PURE__ */ c.jsx("div", {
        ...O,
        children: e.label
      }),
      $ && /* @__PURE__ */ c.jsx(ee, {
        component: "ul",
        role: "group",
        ...t("subtree"),
        "data-level": i,
        children: /* @__PURE__ */ c.jsx("li", {
          ...t("node", { style: { "--label-offset": `calc(var(--level-offset) * ${i})` } }),
          children: /* @__PURE__ */ c.jsx("div", {
            ...t("label"),
            children: /* @__PURE__ */ c.jsx(th, {
              size: 16,
              style: { marginInlineStart: 4 }
            })
          })
        })
      }),
      m && L.length > 0 ? /* @__PURE__ */ c.jsx(p.Activity, {
        mode: T ? "visible" : "hidden",
        children: /* @__PURE__ */ c.jsx(ee, {
          component: "ul",
          role: "group",
          ...t("subtree"),
          "data-level": i,
          children: L
        })
      }) : T && L.length > 0 && /* @__PURE__ */ c.jsx(ee, {
        component: "ul",
        role: "group",
        ...t("subtree"),
        "data-level": i,
        children: L
      })
    ]
  });
}
tc.displayName = "@mantine/core/TreeNode";
var Uf = {
  root: "m_f698e191",
  subtree: "m_75f3ecf",
  node: "m_f6970eb1",
  label: "m_dc283425",
  flatLine: "m_c03b303c",
  flatLineClosing: "m_bf7448d9"
};
function Wf(e) {
  return e.reduce((t, n) => (t.push(n.value), n.children && t.push(...Wf(n.children)), t), []);
}
const Rb = {
  expandOnClick: !0,
  allowRangeSelection: !0,
  expandOnSpace: !0
}, qf = _e((e, { levelOffset: t }) => ({ root: { "--level-offset": Xo(t) } })), Vs = ae((e) => {
  const t = Q("Tree", Rb, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, data: l, expandOnClick: u, tree: f, renderNode: h, selectOnClick: d, clearSelectionOnOutsideClick: m, allowRangeSelection: g, expandOnSpace: b, levelOffset: x, checkOnSpace: w, keepMounted: k, onDragDrop: S, allowDrop: j, withDragHandle: E, withLines: R, attributes: P, ref: v, ...T } = t, L = Hf(), _ = f || L, z = p.useRef({
    draggedValue: null,
    currentDropTarget: null
  }), B = Me({
    name: "Tree",
    classes: Uf,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: P,
    vars: i,
    varsResolver: qf
  }), M = gu(() => m && _.clearSelected()), A = We(v, M), O = p.useMemo(() => Wf(l), [l]);
  p.useEffect(() => {
    _.initialize(l);
  }, [l]);
  const $ = l.map((I, V) => /* @__PURE__ */ c.jsx(tc, {
    node: I,
    getStyles: B,
    rootIndex: V,
    expandOnClick: u,
    selectOnClick: d,
    controller: _,
    renderNode: h,
    flatValues: O,
    allowRangeSelection: g,
    expandOnSpace: b,
    checkOnSpace: w,
    keepMounted: k,
    onDragDrop: S,
    allowDrop: j,
    withDragHandle: E,
    dragStateRef: z,
    data: l
  }, I.value));
  return /* @__PURE__ */ c.jsx(ee, {
    component: "ul",
    ref: A,
    ...B("root"),
    ...T,
    role: "tree",
    "aria-multiselectable": _.multiple,
    "data-tree-root": !0,
    "data-with-lines": R || void 0,
    children: $
  });
});
Vs.displayName = "@mantine/core/Tree";
Vs.classes = Uf;
Vs.varsResolver = qf;
function Hs() {
  window.location.pathname !== "/login.html" && window.location.replace("/login.html");
}
function $e(e) {
  return e.layers ?? [];
}
function Oe(e) {
  return e.version ?? 0;
}
class Be extends Error {
  code;
  details;
  constructor(t, n, o) {
    super(n), this.name = "ApiError", this.code = t, this.details = o;
  }
}
async function ke(e, t) {
  const n = await fetch(e, t);
  if (n.status === 401)
    throw Hs(), new Be("unauthorized", "this server needs an access token", null);
  if (!n.ok) {
    let o = `http${n.status}`, r = n.statusText, s = null;
    try {
      const a = await n.json();
      a?.error && (o = a.error.code ?? o, r = a.error.message ?? r, s = a.error.details ?? null);
    } catch {
    }
    throw new Be(o, r, s);
  }
  if (n.status !== 204)
    return await n.json();
}
async function Kf(e = "", t = 200) {
  const n = new URLSearchParams({ limit: String(t) });
  return e && n.set("query", e), (await ke(
    `/api/projects?${n.toString()}`
  )).projects;
}
async function Nb(e = 8) {
  return (await ke(
    `/api/projects/recent?limit=${e}`
  )).projects;
}
async function Tb(e) {
  return ke(`/api/projects/${encodeURIComponent(e)}`);
}
function Yf(e) {
  return `/api/projects/${encodeURIComponent(e)}/thumbnail.png`;
}
async function Pb(e, t, n, o, r) {
  return ke("/api/projects", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: e, width: t, height: n, background: o, name: r })
  });
}
async function Ab(e, t) {
  return ke(
    `/api/projects/${encodeURIComponent(e)}/rename`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: t })
    }
  );
}
async function Ib(e) {
  return ke(`/api/projects/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
async function Io(e) {
  return ke(`/api/projects/${encodeURIComponent(e)}/document`);
}
async function Mb(e, t) {
  return (await ke(
    `/api/projects/${encodeURIComponent(e)}/recover-lock`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ expectedPid: t })
    }
  )).unlocked;
}
async function Us(e, t, n) {
  const o = await fetch(e, { ...t, method: t?.method ?? "GET" });
  if (o.status === 404 || o.status === 405) return n;
  if (o.status === 401)
    throw Hs(), new Be("unauthorized", "this server needs an access token", null);
  if (!o.ok) {
    let r = `http${o.status}`, s = o.statusText, a = null;
    try {
      const i = await o.json();
      r = i?.error?.code ?? r, s = i?.error?.message ?? s, a = i?.error?.details ?? null;
    } catch {
    }
    throw new Be(r, s, a);
  }
  return await o.json();
}
async function Db() {
  return Us("/api/open-tabs", void 0, { projects: [], active: null });
}
async function Ob(e) {
  await Us("/api/open-tabs", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(e)
  }, null);
}
async function Xf(e) {
  return (await Us(
    `/api/projects/${encodeURIComponent(e)}/close`,
    { method: "POST", headers: { "content-type": "application/json" }, body: "{}" },
    { closed: !1 }
  )).closed;
}
async function Lb(e, t = 100) {
  const n = new URLSearchParams({ tail: String(t) });
  return ke(`/api/projects/${encodeURIComponent(e)}/history?${n.toString()}`);
}
async function Yn(e, t, n, o = !1) {
  return ke(
    `/api/projects/${encodeURIComponent(e)}/operations?includeDocument=true`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        operation: t,
        expectedVersion: n,
        dryRun: o,
        actor: { kind: "human", name: "reference UI" }
      })
    }
  );
}
async function $b(e, t, n, o) {
  return ke(
    `/api/projects/${encodeURIComponent(e)}/operation-batches?includeDocument=true`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        expectedVersion: o,
        label: t,
        commands: n,
        actor: { kind: "human", name: "reference UI" }
      })
    }
  );
}
const Gf = ["bar", "column", "line", "area", "pie", "donut", "scatter"], _b = ["chart", "table", "qr"], zb = {
  chart: "assemblash.chart",
  table: "assemblash.table",
  qr: "assemblash.qr"
};
async function Fb(e, t, n) {
  return ke(
    `/api/projects/${encodeURIComponent(e)}/generated-layers`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...t,
        centered: !0,
        expectedVersion: n,
        actor: { kind: "human", name: "reference UI" }
      })
    }
  );
}
async function jl(e, t, n, o) {
  return ke(
    `/api/projects/${encodeURIComponent(e)}/generated-layers/${encodeURIComponent(t)}`,
    {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...n,
        expectedVersion: o,
        actor: { kind: "human", name: "reference UI" }
      })
    }
  );
}
function Bb(e) {
  if (e.type !== "svg") return null;
  const t = e;
  for (const n of _b) {
    const o = t[zb[n]];
    if (o && typeof o == "object" && !Array.isArray(o)) {
      const r = o.spec;
      if (r && typeof r == "object" && !Array.isArray(r))
        return { kind: n, spec: r };
    }
  }
  return null;
}
async function Vb(e) {
  return ke(`/api/projects/${encodeURIComponent(e)}/undo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ actor: { kind: "human", name: "reference UI" } })
  });
}
async function Hb(e) {
  return ke(`/api/projects/${encodeURIComponent(e)}/redo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ actor: { kind: "human", name: "reference UI" } })
  });
}
async function Ub(e, t, n, o = {}) {
  const r = { name: t, scale: n };
  for (const s of ["format", "quality", "pages", "print"])
    o[s] !== void 0 && (r[s] = o[s]);
  return ke(`/api/projects/${encodeURIComponent(e)}/export`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(r)
  });
}
async function Wb() {
  const e = await Us("/api/page-sets", void 0, { pageSets: [] });
  return Array.isArray(e.pageSets) ? e.pageSets.filter((t) => typeof t == "string") : [];
}
async function qb(e) {
  return ke(`/api/page-sets/${encodeURIComponent(e)}`);
}
async function Kb() {
  await ke("/api/shutdown", { method: "POST" });
}
async function Yb() {
  return ke("/api/version");
}
async function Xb() {
  return ke("/api/agent-access");
}
async function Gb() {
  return ke("/api/agent-sessions");
}
async function Jb() {
  return ke("/api/update-status");
}
async function Zb(e) {
  return ke("/api/update-consent", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ updateCheck: e })
  });
}
async function nc(e, t) {
  const n = await fetch(
    `/api/projects/${encodeURIComponent(e)}/assets?filename=${encodeURIComponent(t.name)}`,
    {
      method: "POST",
      headers: { "content-type": t.type || "application/octet-stream" },
      body: t
    }
  );
  if (n.status === 401)
    throw Hs(), new Be("unauthorized", "this server needs an access token", null);
  if (!n.ok) {
    let o = `http${n.status}`, r = n.statusText;
    try {
      const s = await n.json();
      o = s?.error?.code ?? o, r = s?.error?.message ?? r;
    } catch {
    }
    throw new Be(o, r, null);
  }
  return await n.json();
}
const Qb = ["fill", "contain", "cover"], kl = 8;
function Jf(e) {
  if (e.type !== "shape") return null;
  const t = e.shape;
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = t.kind;
    if (typeof n == "string") return n;
  }
  return null;
}
function ew(e) {
  if (e.type !== "shape") return 0;
  const t = e.shape;
  if (t && typeof t == "object") {
    const n = t.cornerRadius;
    if (typeof n == "number") return n;
  }
  return 0;
}
const tw = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity"
], El = [
  "brightness",
  "contrast",
  "saturation",
  "blur",
  "grain",
  "dropShadow",
  "hueRotate",
  "invert"
];
function nw(e) {
  const t = (n) => {
    const o = e[n];
    return typeof o == "number" ? [{ name: n, value: o, kind: "number" }] : [];
  };
  switch (e.type) {
    case "hueRotate":
      return t("degrees");
    case "brightness":
    case "invert":
    case "contrast":
    case "saturation":
    case "grain":
      return t("amount");
    case "blur":
      return t("radius");
    case "dropShadow": {
      const n = e.color;
      return [
        ...t("dx"),
        ...t("dy"),
        ...t("blur"),
        // A colour input cannot hold the alpha this effect's default carries
        // (`#00000080`), and silently dropping it would change the picture
        // on the first edit, so the colour is typed as text.
        ...typeof n == "string" ? [{ name: "color", value: n, kind: "color" }] : []
      ];
    }
    default:
      return [];
  }
}
function ow(e) {
  switch (e) {
    case "invert":
      return { type: "invert", amount: 0 };
    case "hueRotate":
      return { type: "hueRotate", degrees: 0 };
    case "blur":
      return { type: "blur", radius: 0 };
    case "grain":
      return { type: "grain", amount: 0, seed: 1, scale: 1 };
    case "dropShadow":
      return { type: "dropShadow", dx: 4, dy: 4, blur: 6, color: "#00000080" };
    default:
      return { type: e, amount: 1 };
  }
}
async function rw(e) {
  return (await ke(
    `/api/projects/${encodeURIComponent(e)}/presets`
  )).presets;
}
function sw(e) {
  const t = {
    opacity: e.opacity ?? 1,
    blendMode: e.blendMode ?? "normal",
    effects: e.effects ?? []
  };
  return e.type === "text" && (t.fontFamily = e.fontFamily, t.fontSize = e.fontSize, t.color = e.color ?? "#000000", t.align = e.align ?? "left", t.lineHeight = e.lineHeight ?? 1.2, t.paragraphSpacing = e.paragraphSpacing ?? 0), e.type === "shape" && (e.fill && (t.fill = e.fill), e.stroke && (t.stroke = e.stroke)), t;
}
async function aw(e) {
  return ke(`/api/projects/${encodeURIComponent(e)}/slots`);
}
async function iw(e, t, n = 1) {
  return ke(
    `/api/projects/${encodeURIComponent(e)}/variants`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ variants: t, scale: n })
    }
  );
}
function Zf(e, t, n = "png") {
  return `/api/projects/${encodeURIComponent(e)}/exports/${encodeURIComponent(t)}.${n}`;
}
async function cw() {
  return (await ke("/api/fonts")).families;
}
function Fa(e, t = "Aa Bb 0123") {
  return `/api/fonts/specimen.png?${new URLSearchParams({
    family: e.family,
    weight: String(e.weight),
    style: e.style,
    hash: e.hash,
    sample: t
  }).toString()}`;
}
async function lw() {
  return (await ke(
    "/catalogue-specimens/manifest.json"
  )).families;
}
async function uw() {
  const e = await ke("/api/fonts");
  return { families: e.families ?? [], faces: e.faces ?? [] };
}
async function dw(e) {
  return ke(
    `/api/fonts?filename=${encodeURIComponent(e.name)}`,
    {
      method: "POST",
      headers: { "content-type": e.type || "application/octet-stream" },
      body: e
    }
  );
}
async function fw(e) {
  return ke(
    `/api/fonts/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function pw() {
  return ke("/api/fonts/catalogue");
}
async function Rl(e) {
  return ke("/api/fonts/install", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ pack: e })
  });
}
function hw(e, t) {
  return `/api/projects/${encodeURIComponent(e)}/preview.svg?v=${t}`;
}
async function Wn(e) {
  return URL.createObjectURL(await Ws(e));
}
async function Ws(e) {
  const t = await fetch(e);
  if (t.status === 401)
    throw Hs(), new Be("unauthorized", "this server needs an access token", null);
  if (!t.ok) {
    let n = `http${t.status}`, o = t.statusText, r = null;
    try {
      const s = await t.json();
      s?.error && (n = s.error.code ?? n, o = s.error.message ?? o, r = s.error.details ?? null);
    } catch {
    }
    throw new Be(n, o, r);
  }
  return await t.blob();
}
function Qr(e, t, n = 1, o) {
  const r = new URLSearchParams({ scale: String(n), v: String(t) });
  return o?.only?.length && r.set("only", o.only.join(",")), o?.exclude?.length && r.set("exclude", o.exclude.join(",")), `/api/projects/${encodeURIComponent(e)}/preview.png?${r.toString()}`;
}
async function Qf(e, t, n) {
  const o = new URLSearchParams({ id: t, width: String(n) });
  return ke(
    `/api/projects/${encodeURIComponent(e)}/text-layout?${o.toString()}`
  );
}
function Ve(e, t = null, n = 0, o = []) {
  for (const r of e)
    o.push({ layer: r, parent: t, depth: n }), r.type === "group" && Ve(r.children ?? [], r.id, n + 1, o);
  return o;
}
function nr(e) {
  return !e.protected && !e.readOnly && !e.locked;
}
function es(e) {
  return e.protected ? "protected — no tool can change this layer" : e.readOnly ? "read-only — inspectable but never mutable" : e.locked ? "locked — unlock it to make changes" : null;
}
function Nl(e) {
  return !e.includes("'") && !/[\r\n]/.test(e) ? `'${e}'` : JSON.stringify(e);
}
function mw(e) {
  const t = ["mcp", "--workspace", e.workspace], n = JSON.stringify(
    { mcpServers: { assemblash: { command: e.executable, args: t } } },
    null,
    2
  ), o = [
    "[mcp_servers.assemblash]",
    `command = ${Nl(e.executable)}`,
    `args = [${t.map(Nl).join(", ")}]`
  ].join(`
`);
  return [
    { id: "json", title: y("agents.jsonTitle"), hint: y("agents.jsonHint"), text: n },
    { id: "codex", title: y("agents.codexTitle"), hint: y("agents.codexHint"), text: o },
    { id: "url", title: y("agents.urlTitle"), hint: y("agents.urlHint"), text: e.mcpUrl }
  ];
}
async function gw(e) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(e);
    return;
  }
  const t = document.createElement("textarea");
  t.value = e, t.setAttribute("readonly", ""), t.style.position = "fixed", t.style.opacity = "0", document.body.append(t), t.select();
  const n = document.execCommand("copy");
  if (t.remove(), !n) throw new Error(y("agents.copyRefused"));
}
const Tl = "assemblash-agent-hint-v1";
function vw({
  host: e,
  controller: t
}) {
  ze();
  const [n, o] = p.useState(null), [r, s] = p.useState(!1), a = p.useRef(e);
  a.current = e, p.useEffect(() => (t.current = (l) => {
    o(l), s(!0);
  }, () => {
    t.current = null;
  }), [t]);
  const i = n === null ? [] : mw(n);
  return /* @__PURE__ */ c.jsxs(
    ct,
    {
      id: "agents-dialog",
      "data-state": r ? "open" : "closed",
      opened: r,
      onClose: () => s(!1),
      title: y("agents.dialogTitle"),
      centered: !0,
      size: "min(720px, calc(100vw - 2rem))",
      padding: "lg",
      trapFocus: !0,
      closeOnEscape: !0,
      returnFocus: !0,
      children: [
        /* @__PURE__ */ c.jsx($n, { align: "center", justify: "between", gap: "3", mb: "md", children: /* @__PURE__ */ c.jsxs("div", { children: [
          /* @__PURE__ */ c.jsx(ne, { component: "p", size: "xs", fw: 600, mb: 4, style: { letterSpacing: "0.08em" }, children: y("agents.protocol") }),
          /* @__PURE__ */ c.jsx(Tc, { order: 2, size: "h2", m: 0, children: y("agents.dialogTitle") })
        ] }) }),
        /* @__PURE__ */ c.jsx(ne, { component: "p", size: "sm", c: "dimmed", mb: "sm", children: y("agents.introLocal") }),
        /* @__PURE__ */ c.jsx(ne, { component: "p", size: "sm", c: "dimmed", mb: "md", children: y("agents.introConfig") }),
        /* @__PURE__ */ c.jsxs("p", { id: "agents-token", hidden: n?.tokenRequired !== !0, children: [
          y("agents.tokenBeforeCommand"),
          " ",
          /* @__PURE__ */ c.jsx("code", { children: "assemblash token show" }),
          " ",
          y("agents.tokenBetweenCommands"),
          " ",
          /* @__PURE__ */ c.jsx("code", { children: "Authorization: Bearer <token>" }),
          y("agents.tokenAfterCommand")
        ] }),
        /* @__PURE__ */ c.jsx(me, { id: "agents-blocks", gap: "md", children: i.map((l) => /* @__PURE__ */ c.jsxs(me, { component: "section", className: "agent-block", "data-block": l.id, gap: "xs", children: [
          /* @__PURE__ */ c.jsxs($n, { align: "center", justify: "between", gap: "md", my: "sm", children: [
            /* @__PURE__ */ c.jsx(Tc, { order: 3, size: "h4", m: 0, children: l.title }),
            /* @__PURE__ */ c.jsxs(
              le,
              {
                size: "xs",
                variant: "light",
                className: "agent-copy",
                onClick: () => {
                  gw(l.text).then(
                    () => a.current.say(y("agents.copied", { title: l.title })),
                    (u) => a.current.say(
                      y("agents.copyError", { error: String(u) }),
                      "error"
                    )
                  );
                },
                children: [
                  /* @__PURE__ */ c.jsx("i", { className: "ph ph-copy", "aria-hidden": "true" }),
                  " ",
                  y("agents.copyButton")
                ]
              }
            )
          ] }),
          /* @__PURE__ */ c.jsx(ne, { component: "p", size: "xs", c: "dimmed", mb: "xs", children: l.hint }),
          /* @__PURE__ */ c.jsx("pre", { className: "agents-config", children: /* @__PURE__ */ c.jsx("code", { children: l.text }) })
        ] }, l.id)) }),
        /* @__PURE__ */ c.jsx($n, { justify: "flex-end", gap: "md", mt: "lg", children: /* @__PURE__ */ c.jsx(le, { id: "agents-done", onClick: () => s(!1), children: y("common.done") }) })
      ]
    }
  );
}
function yw(e) {
  const t = document.createElement("div");
  t.dataset.island = "agents", document.body.append(t);
  const n = { current: null };
  Ue("agents", t, /* @__PURE__ */ c.jsx(vw, { host: e, controller: n }));
  async function o() {
    try {
      const s = await Xb();
      n.current?.(s);
    } catch (s) {
      const a = s instanceof Be ? s.message : String(s);
      e.say(y("agents.openError", { error: a }), "error");
      return;
    }
  }
  function r() {
    let s = !1;
    try {
      s = window.localStorage.getItem(Tl) !== null, window.localStorage.setItem(Tl, "shown");
    } catch {
    }
    s || o();
  }
  return { open: o, offerOnFirstRun: r };
}
const ep = [
  { id: "png", label: "PNG", detail: "export.pngDetail", icon: "ph-image" },
  { id: "svg", label: "SVG", detail: "export.svgDetail", icon: "ph-file-svg" },
  { id: "pdf", label: "PDF", detail: "export.pdfDetail", icon: "ph-file-pdf" },
  { id: "jpeg", label: "JPEG", detail: "export.jpegDetail", icon: "ph-file-jpg" },
  { id: "webp", label: "WebP", detail: "export.webpDetail", icon: "ph-file-image" }
];
function bw(e) {
  return e === "jpeg" ? "jpg" : e;
}
const ha = 90;
function tp(e) {
  const t = e.canvas.bleed;
  return t ? [t.top, t.right, t.bottom, t.left].some((n) => typeof n == "number" && n > 0) : !1;
}
function ww(e, t) {
  switch (e.format) {
    case "png":
    case "svg":
      return {};
    case "jpeg":
      return { format: "jpeg", quality: Math.round(e.quality) };
    case "webp":
      return { format: "webp" };
    case "pdf": {
      const n = { format: "pdf" };
      return e.pageSet && (n.pages = e.pageSet), e.print && tp(t) && (n.print = !0), n;
    }
  }
}
function xw(e, t, n, o) {
  if (e === "svg")
    return {
      url: hw(t, Oe(n)),
      filename: `${o}.svg`
    };
  const r = bw(e);
  return { url: Zf(t, o, r), filename: `${o}.${r}` };
}
const ma = [
  {
    id: "original",
    label: y("export.original"),
    detail: y("export.documentSize"),
    longEdge: null,
    icon: "ph-frame-corners"
  },
  { id: "2k", label: "2K", detail: y("export.longEdge2k"), longEdge: 2048, icon: "ph-image" },
  { id: "4k", label: "4K", detail: y("export.longEdge4k"), longEdge: 3840, icon: "ph-image-square" },
  { id: "8k", label: y("export.resolution8k"), detail: y("export.longEdge8k"), longEdge: 7680, icon: "ph-sparkle" }
];
function $o(e, t) {
  const n = e.canvas.width, o = e.canvas.height, r = t.longEdge === null ? 1 : t.longEdge / Math.max(n, o);
  return {
    width: Math.max(1, Math.round(n * r)),
    height: Math.max(1, Math.round(o * r)),
    scale: r
  };
}
const Sw = {
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
  pageSetUnreadable: "refusals.pageSetUnreadable"
};
function Pl(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function An(e, t = "?") {
  return typeof e == "string" && e.length > 0 ? e : t;
}
function np(e) {
  const t = Sw[e.code];
  if (t) return y(t);
  const n = Pl(e.details);
  switch (e.code) {
    case "pageSetNotFound":
      return y("refusals.pageSetNotFound", { set: An(n.name) });
    case "pageSetMalformed":
      return y("refusals.pageSetMalformed", { set: An(n.set) });
    case "pageSetMemberMissing": {
      const r = (Array.isArray(n.missing) ? n.missing : []).map((s) => An(Pl(s).name)).join(", ");
      return y("refusals.pageSetMemberMissing", { set: An(n.set), names: r || "?" });
    }
    case "pageSetLoop": {
      const o = Array.isArray(n.chain) ? n.chain.map((r) => An(r)) : [];
      return y("refusals.pageSetLoop", { set: o[0] ?? "?", chain: o.join(" → ") || "?" });
    }
    case "pageSetDuplicatePage": {
      const o = (r) => typeof r == "number" ? String(r + 1) : "?";
      return y("refusals.pageSetDuplicatePage", {
        set: An(n.set),
        project: An(n.project),
        first: o(n.first),
        second: o(n.second)
      });
    }
    default:
      return null;
  }
}
function Cw(e) {
  const t = window.document.getElementById(e);
  if (!t) throw new Error(`missing element #${e}`);
  return t;
}
function Al(e) {
  return e.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "assemblash-export";
}
function Il(e) {
  return e < 1024 ? y("export.bytes", { count: je(e) }) : e < 1024 * 1024 ? `${je(Math.round(e / 102.4) / 10)} KB` : `${je(Math.round(e / (1024 * 1024) * 10) / 10)} MB`;
}
function ga(e) {
  return ep.find((t) => t.id === e)?.label ?? e.toUpperCase();
}
function jw(e) {
  return e instanceof Be ? np(e) ?? `${e.message} (${e.code})` : y("errors.unexpected", { message: String(e) });
}
function kw({ host: e, controller: t }) {
  const [n, o] = p.useState("png"), [r, s] = p.useState("8k"), [a, i] = p.useState(ha), [l, u] = p.useState(!1), [f, h] = p.useState(!1), [d, m] = p.useState("assemblash-export"), [g, b] = p.useState(null), [x, w] = p.useState(null), [k, S] = p.useState(!1), [j, E] = p.useState(!1), [R, P] = p.useState(null);
  ze();
  const v = p.useRef(null), T = e.document(), L = e.pageSet(), _ = n === "svg", z = T ? tp(T) : !1, B = n === "pdf" && f && L !== null, M = ma.find((F) => F.id === r) ?? ma[0];
  function A() {
    v.current && URL.revokeObjectURL(v.current), v.current = null, P(null), w(null), b(null);
  }
  function O() {
    const F = e.document();
    if (!F) return y("export.noProject");
    if (B && L) return y("export.pageSetSummary", { count: je(L.count), set: L.set });
    const U = _ ? { width: F.canvas.width, height: F.canvas.height } : $o(F, M), q = `${je(U.width)} × ${je(U.height)}`;
    return n === "svg" ? `${q} ${y("export.svgSummary")}` : n === "png" ? `${q} ${y("export.pngSummary")}` : `${q} ${y("export.rasterSummary", { format: ga(n) })}`;
  }
  p.useEffect(() => {
    const F = () => {
      const U = e.document(), q = e.project();
      if (!U || !q) {
        e.say(y("export.projectRequired"), "error");
        return;
      }
      A(), m(Al(U.name ?? q)), o("png"), s("8k"), i(ha), u(!1), h(!1), E(!0);
    };
    return t.current = F, window.addEventListener("assemblash:export-open", F), () => {
      window.removeEventListener("assemblash:export-open", F), t.current = null, v.current && URL.revokeObjectURL(v.current);
    };
  }, [t, e]);
  function $(F) {
    F !== n && (A(), o(F), F === "pdf" && s("original"));
  }
  async function I(F) {
    if (F.preventDefault(), !F.currentTarget.reportValidity()) return;
    const U = e.project(), q = e.document();
    if (!U || !q) return;
    const G = n, fe = G === "svg" ? { width: q.canvas.width, height: q.canvas.height, scale: 1 } : $o(q, M), oe = Al(d);
    m(oe);
    const te = xw(G, U, q, oe), de = ww({
      format: G,
      quality: a,
      print: l,
      pageSet: B && L ? L.set : null
    }, q), Y = ga(G);
    await e.guard(y("export.openButton"), async () => {
      A(), S(!0);
      try {
        const K = G === "svg" ? { width: fe.width, height: fe.height, bytes: 0, pages: void 0 } : await Ub(U, oe, fe.scale, de), ie = await Ws(te.url);
        v.current = URL.createObjectURL(ie), P({ url: v.current, filename: te.filename });
        const xe = G === "svg" ? ie.size : K.bytes;
        K.pages !== void 0 ? (w(y("export.readyPages", { format: Y, pages: je(K.pages), size: Il(xe) })), e.say(y("export.exportedPages", { pages: je(K.pages), format: Y }))) : (w(`${je(K.width)} × ${je(K.height)} ${y("export.ready", { format: Y, size: Il(xe) })}`), e.say(y("export.exported", { width: je(K.width), height: je(K.height), format: Y })));
      } catch (K) {
        throw b({ code: K instanceof Be ? K.code : "unexpected", text: jw(K) }), K;
      } finally {
        S(!1);
      }
    });
  }
  const V = k ? B && L ? y("export.pageSetSummary", { count: je(L.count), set: L.set }) : y("export.renderingSize", {
    width: je(_ || !T ? T?.canvas.width ?? 0 : $o(T, M).width),
    height: je(_ || !T ? T?.canvas.height ?? 0 : $o(T, M).height)
  }) : x ?? (g ? "" : O()), D = () => {
    E(!1), A();
  };
  return /* @__PURE__ */ c.jsx(ct, { id: "export-dialog", "data-state": j ? "open" : "closed", opened: j, onClose: D, title: null, withCloseButton: !1, centered: !0, size: "lg", withinPortal: !1, keepMounted: !0, children: /* @__PURE__ */ c.jsx("div", { className: "export-mantine-root", children: /* @__PURE__ */ c.jsx("form", { id: "export-form", onSubmit: (F) => {
    I(F);
  }, children: /* @__PURE__ */ c.jsxs(me, { gap: "md", children: [
    /* @__PURE__ */ c.jsxs(Ne, { justify: "space-between", align: "flex-start", children: [
      /* @__PURE__ */ c.jsxs("div", { children: [
        /* @__PURE__ */ c.jsx(ne, { size: "xs", c: "dimmed", children: y("export.eyebrow") }),
        /* @__PURE__ */ c.jsx(ne, { component: "h2", fw: 700, size: "lg", children: y("export.title") })
      ] }),
      /* @__PURE__ */ c.jsx(le, { type: "button", variant: "subtle", "aria-label": y("common.close"), onClick: D, children: "×" })
    ] }),
    /* @__PURE__ */ c.jsxs(me, { gap: "xs", children: [
      /* @__PURE__ */ c.jsx(ne, { fw: 600, children: y("export.format") }),
      /* @__PURE__ */ c.jsx(us, { id: "export-formats", role: "radiogroup", "aria-label": y("export.format"), cols: { base: 2, xs: 3 }, spacing: "xs", children: ep.map((F) => /* @__PURE__ */ c.jsx(On, { component: "button", type: "button", "data-format": F.id, role: "radio", "aria-checked": n === F.id, withBorder: !0, p: "sm", bg: n === F.id ? "red.0" : void 0, style: { cursor: "pointer", textAlign: "left" }, onClick: () => $(F.id), children: /* @__PURE__ */ c.jsxs(me, { gap: 4, children: [
        /* @__PURE__ */ c.jsxs(Ne, { gap: "xs", children: [
          /* @__PURE__ */ c.jsx("i", { className: `ph ${F.icon}`, "aria-hidden": "true" }),
          /* @__PURE__ */ c.jsx("b", { children: F.label })
        ] }),
        /* @__PURE__ */ c.jsx(ne, { size: "sm", children: y(F.detail) })
      ] }) }, F.id)) })
    ] }),
    n === "pdf" && L ? /* @__PURE__ */ c.jsxs(me, { gap: "xs", children: [
      /* @__PURE__ */ c.jsx(ne, { fw: 600, children: y("export.pages") }),
      /* @__PURE__ */ c.jsx(Ne, { id: "export-pages", role: "radiogroup", "aria-label": y("export.pages"), grow: !0, children: [["this", y("export.pagesThis")], ["set", y("export.pagesSet", { count: je(L.count), set: L.set })]].map(([F, U]) => {
        const q = F === "set" === f;
        return /* @__PURE__ */ c.jsx(On, { component: "button", type: "button", "data-pages": F, role: "radio", "aria-checked": q, withBorder: !0, p: "sm", bg: q ? "red.0" : void 0, style: { cursor: "pointer", textAlign: "left" }, onClick: () => {
          A(), h(F === "set");
        }, children: /* @__PURE__ */ c.jsxs(Ne, { gap: "xs", children: [
          /* @__PURE__ */ c.jsx("i", { className: `ph ${F === "set" ? "ph-files" : "ph-file"}`, "aria-hidden": "true" }),
          /* @__PURE__ */ c.jsx("b", { children: U })
        ] }) }, F);
      }) })
    ] }) : null,
    /* @__PURE__ */ c.jsxs(me, { id: "export-resolution-row", "aria-disabled": _, gap: "xs", children: [
      /* @__PURE__ */ c.jsx(ne, { fw: 600, children: y("export.resolution") }),
      /* @__PURE__ */ c.jsx(Ne, { id: "export-options", role: "radiogroup", "aria-label": y("export.resolution"), "aria-disabled": _, grow: !0, children: ma.map((F) => {
        const U = T ? $o(T, F) : null;
        return /* @__PURE__ */ c.jsx(On, { component: "button", type: "button", "data-resolution": F.id, disabled: _, role: "radio", "aria-checked": r === F.id && !_, withBorder: !0, p: "sm", bg: r === F.id && !_ ? "red.0" : void 0, style: { cursor: _ ? "not-allowed" : "pointer", textAlign: "left" }, onClick: () => {
          s(F.id), A();
        }, children: /* @__PURE__ */ c.jsxs(me, { gap: 4, children: [
          /* @__PURE__ */ c.jsxs(Ne, { gap: "xs", children: [
            /* @__PURE__ */ c.jsx("i", { className: `ph ${F.icon}`, "aria-hidden": "true" }),
            /* @__PURE__ */ c.jsx("b", { children: F.id === "original" ? y("export.original") : F.id === "8k" ? y("export.resolution8k") : F.label })
          ] }),
          /* @__PURE__ */ c.jsx(ne, { size: "sm", children: U ? `${je(U.width)} × ${je(U.height)}` : y(F.id === "original" ? "export.documentSize" : `export.longEdge${F.id}`) })
        ] }) }, F.id);
      }) })
    ] }),
    n === "jpeg" ? /* @__PURE__ */ c.jsx(bo, { id: "export-quality", label: y("export.quality"), description: y("export.qualityHint"), value: a, min: 1, max: 100, step: 1, clampBehavior: "strict", allowDecimal: !1, required: !0, onChange: (F) => {
      A(), i(typeof F == "number" ? F : Number(F) || ha);
    } }) : null,
    n === "pdf" && z ? /* @__PURE__ */ c.jsx(Gt, { id: "export-print", label: y("export.print"), description: y("export.printHint"), checked: l, onChange: (F) => {
      A(), u(F.currentTarget.checked);
    } }) : null,
    /* @__PURE__ */ c.jsx(tt, { id: "export-name", label: y("export.fileName"), value: d, onChange: (F) => m(F.currentTarget.value), pattern: "[A-Za-z0-9_-]+", maxLength: 60, required: !0 }),
    /* @__PURE__ */ c.jsx(ne, { id: "export-summary", "aria-live": "polite", fw: 500, children: V }),
    g ? /* @__PURE__ */ c.jsx(ne, { id: "export-error", role: "alert", c: "red", fw: 500, "data-error-code": g.code, children: g.text }) : null,
    /* @__PURE__ */ c.jsxs(Ne, { justify: "flex-end", children: [
      /* @__PURE__ */ c.jsxs(le, { id: "export-download", component: "a", href: R?.url ?? "#", download: R?.filename, hidden: !R, variant: "default", children: [
        /* @__PURE__ */ c.jsx("i", { className: "ph ph-download-simple", "aria-hidden": "true" }),
        " ",
        y("common.download")
      ] }),
      /* @__PURE__ */ c.jsx(le, { id: "export-cancel", type: "button", variant: "default", onClick: D, children: y("common.cancel") }),
      /* @__PURE__ */ c.jsxs(le, { id: "export-confirm", type: "submit", loading: k, value: "default", children: [
        /* @__PURE__ */ c.jsx("i", { className: `ph ${k ? "ph-circle-notch" : "ph-export"}`, "aria-hidden": "true" }),
        " ",
        k ? y("export.rendering") : y("export.confirm", { format: ga(n) })
      ] })
    ] })
  ] }) }) }) });
}
function Ew(e) {
  const t = Cw("export-dialog-mount"), n = { current: null };
  return Ue("export", t, /* @__PURE__ */ c.jsx(kw, { host: e, controller: n })), { open: () => {
    n.current ? n.current() : queueMicrotask(() => n.current?.());
  } };
}
function Ml(e, t, n) {
  const o = n * Math.PI / 180, r = Math.sin(o), s = Math.cos(o);
  return { x: e * s - t * r, y: e * r + t * s };
}
function ts(e) {
  const t = e.rotation * Math.PI / 180, n = Math.abs(Math.sin(t)), o = Math.abs(Math.cos(t)), r = e.width * o + e.height * n, s = e.width * n + e.height * o, a = e.x + e.width / 2, i = e.y + e.height / 2;
  return {
    x: a - r / 2,
    y: i - s / 2,
    width: r,
    height: s
  };
}
function oc(e) {
  if (e.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  const t = e.map(ts), n = Math.min(...t.map((a) => a.x)), o = Math.min(...t.map((a) => a.y)), r = Math.max(...t.map((a) => a.x + a.width)), s = Math.max(...t.map((a) => a.y + a.height));
  return { x: n, y: o, width: r - n, height: s - o };
}
function Rw(e, t) {
  const n = e.width ?? 0, o = e.height ?? 0;
  if (!(n > 0) || !(o > 0)) return { width: 300, height: 200 };
  const r = Math.min(t.width / n, t.height / o, 1);
  return {
    width: Math.max(1, Math.round(n * r)),
    height: Math.max(1, Math.round(o * r))
  };
}
function op(e, t, n, o = !1) {
  const r = n.width / (o ? t.width : Math.max(1, t.width)), s = n.height / (o ? t.height : Math.max(1, t.height)), a = n.x + (e.x + e.width / 2 - t.x) * r, i = n.y + (e.y + e.height / 2 - t.y) * s, l = o ? e.width * r : Math.max(1, e.width * r), u = o ? e.height * s : Math.max(1, e.height * s);
  return {
    x: a - l / 2,
    y: i - u / 2,
    width: l,
    height: u
  };
}
function va(e) {
  const t = new DataView(new ArrayBuffer(8));
  return t.setFloat64(0, e), t.setBigUint64(0, t.getBigUint64(0) + 1n), t.getFloat64(0);
}
function Nw(e, t, n, o, r, s, a = [e]) {
  if (![e.x, e.y, e.width, e.height, t, o, r].every(Number.isFinite)) return null;
  const i = n.includes("e") ? 1 : n.includes("w") ? -1 : 0, l = n.includes("s") ? 1 : n.includes("n") ? -1 : 0, u = Ml(o, r, -t), f = i * u.x * (s.centre ? 2 : 1), h = l * u.y * (s.centre ? 2 : 1);
  if (f === 0 && h === 0) return { ...e };
  if (!(e.width > 0 && e.height > 0) || a.length === 0 || a.some((v) => !Number.isFinite(v.width) || !Number.isFinite(v.height) || v.width <= 0 || v.height <= 0)) return null;
  const d = 1 + f / e.width, m = 1 + h / e.height;
  if (![d, m].every(Number.isFinite)) return null;
  const g = Math.max(...a.map((v) => Math.min(1, v.width) / v.width)), b = Math.max(...a.map((v) => Math.min(1, v.height) / v.height));
  let x, w;
  if (s.ratio) {
    const v = i && l ? Math.abs(d - 1) >= Math.abs(m - 1) ? d : m : i ? d : m;
    x = w = Math.max(v, g, b);
  } else
    x = i ? Math.max(d, g) : 1, w = l ? Math.max(m, b) : 1;
  for (let v = 0; v < 4; v += 1) {
    const T = a.some((_) => _.width * x < Math.min(1, _.width)), L = a.some((_) => _.height * w < Math.min(1, _.height));
    if (!T && !L) break;
    s.ratio ? x = w = va(x) : (T && (x = va(x)), L && (w = va(w)));
  }
  if (x === 1 && w === 1) return { ...e };
  const k = e.width * x, S = e.height * w, j = Ml(
    s.centre ? 0 : i * (k - e.width) / 2,
    s.centre ? 0 : l * (S - e.height) / 2,
    t
  ), E = {
    x: e.x + e.width / 2 + j.x - k / 2,
    y: e.y + e.height / 2 + j.y - S / 2,
    width: k,
    height: S
  };
  if (t === 0 && (E.x = s.centre || i === 0 ? e.x + (e.width - k) / 2 : i > 0 ? e.x : e.x + e.width - k, E.y = s.centre || l === 0 ? e.y + (e.height - S) / 2 : l > 0 ? e.y : e.y + e.height - S), !Object.values(E).every(Number.isFinite) || k <= 0 || S <= 0) return null;
  const R = E.width / e.width, P = E.height / e.height;
  return a.some((v) => {
    const T = v.width * R, L = v.height * P;
    return !Number.isFinite(T) || !Number.isFinite(L) || T < Math.min(1, v.width) || L < Math.min(1, v.height);
  }) ? null : E;
}
function Tw(e, t) {
  const n = new Set(t), o = (e.layers ?? []).filter((a) => a.visible !== !1), r = o.findIndex((a) => n.has(a.id));
  if (r < 0 || o.slice(r).some((a) => !n.has(a.id))) return null;
  const s = o.slice(r);
  if (s.length !== n.size || s.some((a) => a.clip || (a.effects?.length ?? 0) > 0 || a.blendMode !== void 0 && a.blendMode !== "normal")) return null;
  for (const a of s) {
    if (a.type === "text")
      return null;
    if (a.type === "image") {
      if (a.fit !== "fill") return null;
    } else if (a.type === "shape") {
      const i = a.shape;
      if (a.stroke || typeof a.fill != "string" || typeof i != "object" || i === null || !("kind" in i) || i.kind !== "rect" || "cornerRadius" in i && i.cornerRadius !== 0) return null;
    } else return null;
  }
  return s;
}
function Pw(e, t, n) {
  const o = (e.transform.rotation ?? 0) * Math.PI / 180, r = Math.cos(o), s = Math.sin(o), a = e.transform.flipHorizontal ? -1 : 1, i = e.transform.flipVertical ? -1 : 1, l = (n.width - t.width) / 2, u = (n.height - t.height) / 2, f = n.x - t.x, h = n.y - t.y;
  if (e.type === "text" || e.type === "group") {
    const j = r * a * l - s * i * u, E = s * a * l + r * i * u, R = e.type === "group" && (a < 0 || i < 0), P = [1, 0, 0, 1, f + (R ? 0 : l) - j, h + (R ? 0 : u) - E];
    return P.every(Number.isFinite) ? P : null;
  }
  const d = n.width / t.width, m = n.height / t.height, g = r * r * d + s * s * m, b = r * s * (d - m), x = s * s * d + r * r * m, w = t.x + t.width / 2, k = t.y + t.height / 2, S = [g, b, b, x, n.x + n.width / 2 - g * w - b * k, n.y + n.height / 2 - b * w - x * k];
  return S.every(Number.isFinite) ? S : null;
}
const Aw = "Aa Bb 0123", so = /* @__PURE__ */ new Map(), Ba = /* @__PURE__ */ new WeakMap(), Va = /* @__PURE__ */ new WeakSet();
function Iw(e) {
  let t = so.get(e);
  if (!t && (t = Ws(e).catch((n) => {
    throw so.delete(e), n;
  }), so.set(e, t), so.size > 64)) {
    const n = so.keys().next().value;
    n && so.delete(n);
  }
  return t;
}
function Ha(e) {
  for (const t of e.querySelectorAll("img[data-font-specimen]")) {
    const n = Ba.get(t);
    n && URL.revokeObjectURL(n), Ba.delete(t), Va.add(t), t.removeAttribute("src");
  }
}
function Mw(e, t, n) {
  const o = window.document.createElement("span");
  o.className = "font-specimen";
  const r = window.document.createElement("img");
  r.className = "font-specimen-image", r.dataset.fontSpecimen = "", r.alt = "", r.setAttribute("aria-hidden", "true");
  const s = window.document.createElement("span");
  s.className = "font-specimen-status", s.hidden = !0, o.append(r, s), e.append(o), Iw(t).then((a) => {
    if (!r.isConnected || Va.has(r)) return;
    const i = URL.createObjectURL(a);
    Ba.set(r, i), r.src = i, s.hidden = !0;
  }).catch(() => {
    !r.isConnected || Va.has(r) || (s.textContent = y(n), s.hidden = !1);
  });
}
function Dw(e) {
  return e.find((t) => t.weight === 400 && t.style === "normal") ?? e.find((t) => t.style === "normal") ?? e[0] ?? null;
}
function rp(e, t, n = Aw) {
  Mw(e, Fa(t, n), "fonts.previewUnavailable");
}
function sp(e, t) {
  return t.filter((n) => n.family === e).sort((n, o) => n.weight - o.weight);
}
let Ow = 0;
function Lw({ host: e, value: t, disabled: n, label: o, onCommit: r }) {
  const s = p.useMemo(() => ({ initialFamily: t, initialDisabled: n }), []);
  return p.useEffect(() => {
    s.setFamily?.(t), s.setDisabled?.(n);
  }, [s, t, n]), s.label = o, /* @__PURE__ */ c.jsx("span", { className: "font-selector", children: /* @__PURE__ */ c.jsx(ap, { host: e, actions: s, onCommit: r }) });
}
let $w = 0;
function _w(e, t) {
  const n = e.trim().toLowerCase();
  return n ? t.families.find((o) => o.toLowerCase() === n) ?? null : null;
}
function zw({
  family: e,
  face: t,
  active: n,
  selected: o,
  id: r,
  onMouseDown: s
}) {
  const a = p.useRef(null);
  return p.useLayoutEffect(() => {
    const i = a.current;
    if (i)
      return t && rp(i, t), () => Ha(i);
  }, [t]), /* @__PURE__ */ c.jsx("li", { ref: a, id: r, "data-family": e, className: n ? "active" : void 0, "aria-selected": o, onMouseDown: s, children: /* @__PURE__ */ c.jsxs(Ce.Option, { value: e, active: n, selected: o, children: [
    /* @__PURE__ */ c.jsx("span", { className: "font-selector-family", children: e }),
    /* @__PURE__ */ c.jsx(ne, { component: "span", size: "xs", c: "dimmed", className: "font-selector-faces", children: t ? `${t.style === "italic" ? y("fonts.styleItalic") : y("fonts.styleNormal")} ${je(t.weight)}` : y("fonts.facesUnknown") }),
    !t && /* @__PURE__ */ c.jsx("span", { className: "font-specimen-status", children: y("fonts.previewUnavailable") })
  ] }) });
}
function ap({
  host: e,
  onCommit: t,
  actions: n
}) {
  ze();
  const [o, r] = p.useState(n.initialFamily), [s, a] = p.useState(!1), [i, l] = p.useState(n.initialDisabled), [u, f] = p.useState(-1), h = p.useRef(null), d = p.useRef(""), m = p.useMemo(() => `font-selector-options-${++$w}`, []), g = _i({
    loop: !0,
    onDropdownClose: () => f(-1)
  }), b = e.store(), x = o.trim().toLowerCase(), w = x ? b.families.filter((v) => v.toLowerCase().includes(x)) : b.families, k = p.useCallback(() => {
    g.closeDropdown(), f(-1);
  }, [g]), S = p.useCallback((v) => {
    d.current = v, r(v), a(!1), k(), h.current?.blur(), t(v);
  }, [k, t]), j = p.useCallback(() => {
    k();
    const v = h.current?.value.trim() ?? "";
    if (!v || v.toLowerCase() === d.current.toLowerCase()) return;
    const T = _w(v, e.store());
    if (!T) {
      a(!0);
      return;
    }
    d.current = T, r(T), a(!1), t(T);
  }, [k, e, t]), E = p.useCallback(() => {
    r(h.current?.value ?? ""), a(!1), f(-1), g.openDropdown();
  }, [g]), R = p.useCallback((v) => {
    h.current = v, v && (v.onfocus = () => qt.flushSync(() => E()), v.onblur = j, v.oninput = () => {
      qt.flushSync(() => {
        r(v.value), a(!1), f(-1), g.openDropdown();
      });
    }, v.onkeydown = (T) => qt.flushSync(() => P(T)));
  }, [n, j, E, P]);
  n.setFamily = (v) => {
    d.current = v, r(v), a(!1);
  }, n.setDisabled = (v) => {
    l(v), v && k();
  };
  function P(v) {
    if (v.key === "ArrowDown" || v.key === "ArrowUp") {
      v.preventDefault(), g.dropdownOpened || g.openDropdown(), w.length && f((T) => {
        const L = v.key === "ArrowDown" ? 1 : -1;
        return (T + L + w.length) % w.length;
      });
      return;
    }
    if (v.key === "Enter" && g.dropdownOpened && u >= 0) {
      const T = w[u];
      T && (v.preventDefault(), S(T));
      return;
    }
    v.key === "Escape" && g.dropdownOpened && (v.preventDefault(), v.stopPropagation(), k());
  }
  return p.useLayoutEffect(() => {
    u < 0 || document.getElementById(`${m}-${u}`)?.scrollIntoView({ block: "nearest" });
  }, [u, m]), /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
    /* @__PURE__ */ c.jsxs(
      Ce,
      {
        store: g,
        onOptionSubmit: S,
        position: "bottom-start",
        offset: 4,
        withinPortal: !1,
        floatingStrategy: "fixed",
        shadow: "md",
        onDismiss: () => k(),
        children: [
          /* @__PURE__ */ c.jsx(Ce.Target, { withKeyboardNavigation: !1, withAriaAttributes: !1, children: /* @__PURE__ */ c.jsx(
            tt,
            {
              ref: R,
              value: o,
              autoComplete: "off",
              disabled: i,
              role: "combobox",
              "aria-autocomplete": "list",
              "aria-label": n.label ?? y("editor.fontFamily"),
              "aria-expanded": g.dropdownOpened,
              "aria-controls": m,
              "aria-activedescendant": u >= 0 ? `${m}-${u}` : void 0,
              onChange: (v) => {
                r(v.currentTarget.value), a(!1), f(-1), g.openDropdown();
              }
            }
          ) }),
          /* @__PURE__ */ c.jsxs(
            Ce.Dropdown,
            {
              className: "font-selector-list",
              hidden: !g.dropdownOpened,
              "aria-labelledby": `${m}-heading`,
              children: [
                /* @__PURE__ */ c.jsx(ne, { component: "p", size: "xs", fw: 700, c: "dimmed", id: `${m}-heading`, className: "font-selector-heading", "data-i18n": "fonts.selectorHeading", children: y("fonts.selectorHeading") }),
                /* @__PURE__ */ c.jsxs(Ce.Options, { id: m, role: "listbox", children: [
                  w.map((v, T) => {
                    const L = sp(v, b.faces);
                    return /* @__PURE__ */ c.jsx(
                      zw,
                      {
                        id: `${m}-${T}`,
                        family: v,
                        face: Dw(L),
                        active: T === u,
                        selected: T === u,
                        onMouseDown: (_) => {
                          _.preventDefault(), S(v);
                        }
                      },
                      v
                    );
                  }),
                  w.length === 0 && /* @__PURE__ */ c.jsx(Ce.Empty, { className: "font-selector-none", children: /* @__PURE__ */ c.jsx(ne, { component: "span", size: "xs", c: "dimmed", "data-i18n": "fonts.noFamilyMatches", children: y("fonts.noFamilyMatches") }) })
                ] })
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ c.jsx(ne, { component: "p", size: "xs", c: "dimmed", className: "font-selector-message", "data-i18n": "fonts.notInstalled", hidden: !s, children: y("fonts.notInstalled") })
  ] });
}
function Fw(e, t) {
  const n = window.document.createElement("span");
  n.className = "font-selector";
  const o = {
    initialFamily: "",
    initialDisabled: !1
  }, r = Ue(
    `font-selector-${++Ow}`,
    n,
    /* @__PURE__ */ c.jsx(ap, { host: e, onCommit: t, actions: o })
  );
  return {
    root: n,
    setFamily: (s) => {
      o.initialFamily = s, o.setFamily?.(s);
    },
    setDisabled: (s) => {
      o.initialDisabled = s, o.setDisabled?.(s);
    },
    destroy: r
  };
}
const Dl = "Aa Bb 0123";
function _o(e) {
  if (e.length <= 1) return e[0] ?? "";
  const t = ui();
  return new Intl.ListFormat(t === "pseudo" ? "en" : t, {
    style: "long",
    type: "conjunction"
  }).format(e);
}
function Ol(e) {
  const t = e / 1048576;
  return t >= 10 ? `${je(Math.round(t))} MB` : `${je(Math.max(0.1, Math.round(t * 10) / 10))} MB`;
}
const ao = /* @__PURE__ */ new Map();
function Bw(e) {
  let t = ao.get(e);
  if (!t && (t = Ws(e).catch((n) => {
    throw ao.delete(e), n;
  }), ao.set(e, t), ao.size > 64)) {
    const n = ao.keys().next().value;
    n && ao.delete(n);
  }
  return t;
}
function Ll({
  url: e,
  unavailable: t,
  generation: n
}) {
  const [o, r] = p.useState(""), [s, a] = p.useState(!1);
  return p.useEffect(() => {
    let i = !0, l = "";
    return r(""), a(!1), Bw(e).then((u) => {
      i && (l = URL.createObjectURL(u), r(l));
    }).catch(() => {
      i && a(!0);
    }), () => {
      i = !1, l && URL.revokeObjectURL(l);
    };
  }, [e, n]), /* @__PURE__ */ c.jsxs("span", { className: "font-specimen", children: [
    /* @__PURE__ */ c.jsx(
      "img",
      {
        className: "font-specimen-image",
        "data-font-specimen": "",
        src: o || void 0,
        alt: "",
        "aria-hidden": "true"
      }
    ),
    /* @__PURE__ */ c.jsx("span", { className: "font-specimen-status", hidden: !s, children: y(t) })
  ] });
}
function Vw({ host: e, controller: t }) {
  const [n, o] = p.useState([]), [r, s] = p.useState([]), [a, i] = p.useState(Dl), [l, u] = p.useState(Dl), [f, h] = p.useState([]), [d, m] = p.useState(null), [g, b] = p.useState({}), [x, w] = p.useState(!1), [k, S] = p.useState(""), [j, E] = p.useState(!1), [R, P] = p.useState(0), [v, T] = p.useState(null), L = ze(), [_, z] = p.useState(!0), B = p.useRef(n), M = p.useRef(null), A = p.useRef(null), O = p.useRef(void 0);
  B.current = n;
  const $ = p.useCallback((Y, K) => {
    B.current = Y, o(Y), s(K), e.fontsChanged({ families: Y, faces: K });
  }, [e]), I = p.useCallback(async () => {
    z(!0);
    const Y = await uw();
    $([...Y.families], [...Y.faces]);
  }, [$]);
  p.useLayoutEffect(() => (t.reload = I, t.focusInstall = () => M.current?.focus(), t.hasFamilies = () => B.current.length > 0, t.releaseSamples = () => {
    z(!1), P((Y) => Y + 1);
  }, I(), () => {
    window.clearTimeout(O.current), t.reload = async () => {
    }, t.focusInstall = () => {
    }, t.hasFamilies = () => !1, t.releaseSamples = () => {
    };
  }), [t, I]);
  const V = p.useCallback(async () => {
    if (d) return d;
    const Y = await pw();
    return m(Y), Y;
  }, [d]);
  p.useEffect(() => {
    V().catch(() => m(null));
  }, [V]);
  const D = p.useCallback(async () => {
    try {
      const Y = await V(), K = Y.packs.default ?? [], ie = Y.families.filter((xe) => K.includes(xe.family)).reduce((xe, he) => xe + he.bytes, 0);
      S(K.length ? y("fonts.defaultPackDescription", { names: _o(K), bytes: Ol(ie) }) : y("fonts.noDefaultPack")), E(!1);
    } catch (Y) {
      S(Y instanceof Be ? y("fonts.packDescribeErrorCode", { error: Y.message, code: Y.code }) : y("fonts.packDescribeError")), E(!0);
    }
  }, [V]);
  p.useEffect(() => {
    n.length || D();
  }, [n.length, D]), p.useEffect(() => {
    let Y = !0;
    return lw().then((K) => {
      Y && b(K);
    }).catch(() => {
      Y && b({});
    }), () => {
      Y = !1;
    };
  }, []);
  const F = p.useCallback(async () => {
    e.project() && await e.refresh();
  }, [e]), U = async () => {
    await e.guard(y("fonts.installFonts"), async () => {
      w(!0), e.say(y("fonts.downloadingDefault"));
      try {
        const Y = await Rl("default");
        await I(), await F(), e.say(y("fonts.installedFamilies", { names: _o(Y.families) }));
      } finally {
        w(!1);
      }
    });
  }, q = (Y) => {
    e.guard(y("fonts.installNamedPack", { pack: Y }), async () => {
      try {
        await Rl(Y), await I(), await F(), e.say(y("fonts.installedNamedPack", { pack: Y }));
      } finally {
        P((K) => K + 1);
      }
    });
  }, G = (Y) => {
    const K = [...Y ?? []];
    A.current && (A.current.value = ""), K.length && e.guard(y("fonts.importFont"), async () => {
      h([]);
      let ie = 0;
      const xe = [];
      for (const Ee of K)
        try {
          const re = await dw(Ee);
          ie += 1;
          const W = [...new Set(re.imported.map((H) => H.family))];
          xe.push(W.length ? `${Ee.name} → ${_o(W)}` : y("fonts.importedFile", { file: Ee.name }));
        } catch (re) {
          xe.push(re instanceof Be ? `${Ee.name}: ${re.message} (${re.code})` : `${Ee.name}: ${String(re)}`);
        }
      h(xe), await I(), ie && await F();
      const he = K.length - ie;
      ie ? e.say(Lt("fonts.importResult", ie, {
        refused: he ? Lt("fonts.refusedCount", he) : ""
      })) : e.say(y("fonts.noneImported", { refused: Lt("fonts.refusedCount", he) }), "error");
    });
  }, fe = (Y) => {
    window.confirm(y("fonts.confirmRemove", { family: Y })) && e.guard(y("fonts.removeAction", { family: Y }), async () => {
      h([]);
      const K = await fw(Y);
      h([Lt("fonts.removedFiles", K.removed, { family: Y })]), await I(), await F(), e.say(y("fonts.removedFromStore", { family: Y }));
    });
  }, oe = (Y) => {
    u(Y), window.clearTimeout(O.current), O.current = window.setTimeout(() => {
      const K = Y.trim();
      !K || [...K].some((ie) => /[\u0000-\u001f\u007f]/u.test(ie)) || i(K);
    }, 180);
  }, te = d ? ["text", "display", "mono", ...Object.keys(d.packs).filter((Y) => !["default", "text", "display", "mono"].includes(Y)).sort()] : [], de = n.length === 0;
  return /* @__PURE__ */ c.jsxs(me, { gap: "md", "data-testid": "font-manager", children: [
    /* @__PURE__ */ c.jsx(ee, { id: "font-empty", "data-testid": "font-empty", hidden: !de, children: /* @__PURE__ */ c.jsxs(me, { gap: "sm", children: [
      /* @__PURE__ */ c.jsx(ne, { component: "p", size: "sm", children: y("fonts.noneInstalled") }),
      /* @__PURE__ */ c.jsx(ne, { component: "p", className: "font-install-copy", size: "sm", c: "dimmed", children: y("fonts.defaultPackCopy") }),
      /* @__PURE__ */ c.jsx(
        le,
        {
          id: "install-default",
          "data-testid": "install-default",
          ref: M,
          disabled: x || d !== null && (d.packs.default ?? []).length === 0,
          onClick: () => {
            U();
          },
          children: /* @__PURE__ */ c.jsxs(me, { gap: 2, children: [
            /* @__PURE__ */ c.jsx("span", { id: "install-default-label", children: x ? y("fonts.installingDefault") : y("fonts.installDefaultPack") }),
            /* @__PURE__ */ c.jsx(ne, { id: "install-default-detail", component: "span", size: "xs", c: j ? "red" : void 0, children: k })
          ] })
        }
      )
    ] }) }),
    /* @__PURE__ */ c.jsx(
      tt,
      {
        className: "font-sample-field",
        ref: (Y) => {
          Y && (Y.oninput = () => oe(Y.value));
        },
        "data-testid": "font-sample",
        label: y("fonts.customSample"),
        "aria-label": y("fonts.customSample"),
        value: l,
        maxLength: 64,
        hidden: de,
        onChange: (Y) => oe(Y.currentTarget.value)
      }
    ),
    /* @__PURE__ */ c.jsx("ul", { id: "font-list", "data-testid": "font-list", className: "font-list", hidden: de, children: n.map((Y) => {
      const K = r.filter((he) => he.family === Y), ie = K.map(
        (he) => `${he.style === "italic" ? y("fonts.styleItalic") : y("fonts.styleNormal")} ${je(he.weight)}`
      ).join(", "), xe = K.find((he) => he.weight === 400 && he.style === "normal") ?? K.find((he) => he.style === "normal") ?? K[0];
      return /* @__PURE__ */ c.jsxs("li", { className: "font-family", "data-family": Y, children: [
        /* @__PURE__ */ c.jsxs(Ne, { justify: "space-between", align: "center", wrap: "nowrap", children: [
          /* @__PURE__ */ c.jsxs("div", { className: "font-family-text", children: [
            /* @__PURE__ */ c.jsx("strong", { children: Y }),
            /* @__PURE__ */ c.jsx("span", { className: "font-faces", children: Lt("fonts.faceCount", K.length, { described: ie }) })
          ] }),
          /* @__PURE__ */ c.jsx(
            le,
            {
              size: "xs",
              color: "red",
              variant: "light",
              className: "small danger-action",
              "data-remove-family": Y,
              "data-testid": `remove-font-${Y}`,
              "aria-label": y("fonts.removeFamily", { family: Y }),
              onClick: () => fe(Y),
              children: y("fonts.removeButton")
            }
          )
        ] }),
        _ && xe ? /* @__PURE__ */ c.jsx(
          Ll,
          {
            url: Fa(xe, a),
            unavailable: "fonts.previewUnavailable",
            generation: R + L
          }
        ) : _ ? /* @__PURE__ */ c.jsx("span", { className: "font-specimen-status", children: y("fonts.previewUnavailable") }) : null
      ] }, Y);
    }) }),
    /* @__PURE__ */ c.jsx(
      Pe,
      {
        id: "font-pack-section",
        "data-testid": "font-pack-section",
        className: "font-pack-section",
        hidden: te.length === 0,
        value: v,
        onChange: T,
        keepMounted: !0,
        keepMountedMode: "display-none",
        children: /* @__PURE__ */ c.jsxs(Pe.Item, { value: "packs", children: [
          /* @__PURE__ */ c.jsx(Pe.Control, { children: y("fonts.morePacks") }),
          /* @__PURE__ */ c.jsx(Pe.Panel, { children: /* @__PURE__ */ c.jsx(me, { id: "font-pack-options", "data-testid": "font-pack-options", className: "font-pack-options", gap: "sm", children: te.map((Y) => {
            const K = d?.packs[Y] ?? [], ie = K.filter((he) => !n.includes(he)), xe = d?.families.filter((he) => ie.includes(he.family)).reduce((he, Ee) => he + Ee.bytes, 0) ?? 0;
            return /* @__PURE__ */ c.jsx(
              le,
              {
                "data-pack": Y,
                "data-testid": `font-pack-${Y}`,
                className: "font-pack-button",
                variant: "default",
                disabled: ie.length === 0,
                onClick: () => q(Y),
                children: /* @__PURE__ */ c.jsxs(me, { gap: "xs", align: "stretch", children: [
                  /* @__PURE__ */ c.jsx("strong", { children: y("fonts.namedPackTitle", { pack: Y }) }),
                  /* @__PURE__ */ c.jsx(ne, { component: "span", size: "xs", c: "dimmed", children: ie.length ? y("fonts.namedPackDownload", { names: _o(K), bytes: Ol(xe) }) : y("fonts.namedPackInstalled", { names: _o(K) }) }),
                  /* @__PURE__ */ c.jsx(Ne, { gap: "xs", wrap: "wrap", className: "font-pack-samples", children: K.map((he) => {
                    const Ee = r.filter((H) => H.family === he).find((H) => H.weight === 400 && H.style === "normal") ?? r.find((H) => H.family === he), re = g[he], W = Ee ? Fa(Ee) : re ? `/catalogue-specimens/${re.src.replace(/^\.\//u, "")}` : null;
                    return /* @__PURE__ */ c.jsxs("span", { className: "font-pack-family", children: [
                      /* @__PURE__ */ c.jsx(ne, { component: "span", size: "xs", fw: 700, className: "font-pack-family-name", children: he }),
                      _ && W ? /* @__PURE__ */ c.jsx(
                        Ll,
                        {
                          url: W,
                          unavailable: Ee ? "fonts.previewUnavailable" : "fonts.cataloguePreviewUnavailable",
                          generation: R + L
                        }
                      ) : W ? null : /* @__PURE__ */ c.jsx("span", { className: "font-specimen-status", children: y("fonts.cataloguePreviewUnavailable") })
                    ] }, he);
                  }) })
                ] })
              },
              Y
            );
          }) }) })
        ] })
      }
    ),
    /* @__PURE__ */ c.jsx(
      le,
      {
        id: "import-font",
        "data-testid": "import-font",
        variant: "default",
        leftSection: /* @__PURE__ */ c.jsx("i", { className: "ph ph-upload-simple", "aria-hidden": "true" }),
        onClick: () => A.current?.click(),
        children: y("fonts.importFile")
      }
    ),
    /* @__PURE__ */ c.jsx(
      "input",
      {
        id: "font-file",
        ref: A,
        type: "file",
        accept: ".ttf,.otf,.ttc,.otc,.woff,.woff2",
        multiple: !0,
        hidden: !0,
        onChange: (Y) => G(Y.currentTarget.files)
      }
    ),
    /* @__PURE__ */ c.jsx("div", { id: "font-feedback", "data-testid": "font-feedback", className: "font-feedback", "aria-live": "polite", children: f.map((Y, K) => /* @__PURE__ */ c.jsx("p", { children: Y }, `${K}-${Y}`)) })
  ] });
}
function Hw(e, t) {
  t.replaceChildren();
  const n = {
    reload: async () => {
    },
    focusInstall: () => {
    },
    hasFamilies: () => !1,
    releaseSamples: () => {
    }
  };
  return Ue("font-manager", t, /* @__PURE__ */ c.jsx(Vw, { host: e, controller: n })), {
    reload: () => n.reload(),
    focusInstall: () => n.focusInstall(),
    hasFamilies: () => n.hasFamilies(),
    releaseSamples: () => n.releaseSamples()
  };
}
class Uw {
  pending = [];
  running = !1;
  /**
   * Observers for page chrome: busy indicators, instrumentation. Called on
   * every state change and every settlement; must not throw.
   */
  onActiveChange = null;
  onSettled = null;
  /** Whether an action is running or waiting, i.e. work is outstanding. */
  get active() {
    return this.running || this.pending.length > 0;
  }
  /** How many actions are waiting. Exposed for diagnostics, not decisions. */
  get size() {
    return this.pending.length;
  }
  /** Use the same queue without coalescing or treating refusal as success. */
  async outcome(t, n) {
    let o;
    return await this.enqueue({
      label: t,
      coalesceKey: null,
      run: async () => {
        o = { status: "applied", value: await n() };
      },
      onError: (r) => {
        o = { status: "refused", error: r };
      }
    }), o;
  }
  /**
   * Queues an action. The returned promise settles when the action has run
   * (or failed), or when a newer same-key action superseded it. It never
   * rejects: failures are the caller's `onError` business, so that callers
   * chaining `.finally(...)` — tearing down a drag preview, say — are never
   * handed an unhandled rejection.
   */
  enqueue(t) {
    return new Promise((n) => {
      const o = { resolve: n };
      if (t.coalesceKey !== null) {
        const r = this.pending.length - 1, s = this.pending[r];
        if (s && s.action.coalesceKey === t.coalesceKey) {
          this.pending.splice(r, 1);
          try {
            s.action.onSuperseded?.();
          } catch {
          }
          s.settled.resolve(), this.emitSettled(s.action.label, !1, !0, s.queuedAt, null);
        }
      }
      this.pending.push({
        action: t,
        settled: o,
        queuedAt: performance.now()
      }), this.running ? this.emitActive() : this.pump();
    });
  }
  async pump() {
    this.running = !0, this.emitActive();
    try {
      for (; ; ) {
        const t = this.pending.shift();
        if (!t) break;
        const n = performance.now();
        try {
          await t.action.run(), t.settled.resolve(), this.emitSettled(t.action.label, !0, !1, t.queuedAt, n);
        } catch (o) {
          try {
            t.action.onError?.(o);
          } catch {
          }
          t.settled.resolve(), this.emitSettled(t.action.label, !1, !1, t.queuedAt, n);
        }
      }
    } finally {
      this.running = !1, this.emitActive();
    }
  }
  emitActive() {
    try {
      this.onActiveChange?.(this.active);
    } catch {
    }
  }
  emitSettled(t, n, o, r, s) {
    try {
      this.onSettled?.({
        label: t,
        ok: n,
        superseded: o,
        waitedMs: Math.round(performance.now() - r),
        ranMs: s === null ? null : Math.round(performance.now() - s)
      });
    } catch {
    }
  }
}
const Ww = [
  { size: "1080x1080", width: 1080, height: 1080, label: "common.square" },
  { size: "1920x1080", width: 1920, height: 1080, label: "common.landscape" },
  { size: "1080x1350", width: 1080, height: 1350, label: "common.portrait" },
  { size: "1080x1920", width: 1080, height: 1920, label: "common.story" }
];
function qw({
  host: e,
  controller: t
}) {
  const [n, o] = p.useState(!1), [r, s] = p.useState(""), [a, i] = p.useState(1080), [l, u] = p.useState(1080), [f, h] = p.useState("#ffffff"), [d, m] = p.useState("1080x1080"), [g, b] = p.useState(!1);
  ze(), p.useEffect(() => (t.current = () => {
    s(""), i(1080), u(1080), h("#ffffff"), m("1080x1080"), o(!0);
  }, () => {
    t.current = null;
  }), [t]);
  async function x(w) {
    w.preventDefault();
    const k = r.trim(), S = Number(a), j = Number(l);
    if (!(!k || !Number.isFinite(S) || !Number.isFinite(j)) && !(S <= 0 || j <= 0 || g)) {
      b(!0);
      try {
        await e.create(k, S, j, f) && o(!1);
      } finally {
        b(!1);
      }
    }
  }
  return /* @__PURE__ */ c.jsx(
    ct,
    {
      id: "new-project-dialog",
      "data-state": n ? "open" : "closed",
      opened: n,
      onClose: () => o(!1),
      title: y("dialogs.newProjectTitle"),
      centered: !0,
      size: "lg",
      children: /* @__PURE__ */ c.jsx("form", { id: "new-project-form", onSubmit: (w) => {
        x(w);
      }, children: /* @__PURE__ */ c.jsxs(me, { gap: "md", children: [
        /* @__PURE__ */ c.jsx(
          tt,
          {
            id: "new-project-name",
            label: y("common.name"),
            placeholder: y("dialogs.projectNamePlaceholder"),
            value: r,
            onChange: (w) => s(w.currentTarget.value),
            autoComplete: "off",
            required: !0,
            "data-autofocus": !0
          }
        ),
        /* @__PURE__ */ c.jsxs(me, { gap: "xs", children: [
          /* @__PURE__ */ c.jsx(ne, { fw: 600, children: y("canvas.label") }),
          /* @__PURE__ */ c.jsx(us, { id: "canvas-presets", cols: { base: 2, sm: 4 }, children: Ww.map((w) => /* @__PURE__ */ c.jsx(
            le,
            {
              type: "button",
              "data-size": w.size,
              variant: d === w.size ? "light" : "default",
              onClick: () => {
                i(w.width), u(w.height), m(w.size);
              },
              children: y(w.label)
            },
            w.size
          )) })
        ] }),
        /* @__PURE__ */ c.jsxs(Ne, { grow: !0, align: "start", children: [
          /* @__PURE__ */ c.jsx(
            bo,
            {
              id: "new-project-width",
              label: y("common.width"),
              value: a,
              onChange: (w) => {
                i(w), m("");
              },
              min: 1,
              allowDecimal: !1,
              required: !0
            }
          ),
          /* @__PURE__ */ c.jsx(
            bo,
            {
              id: "new-project-height",
              label: y("common.height"),
              value: l,
              onChange: (w) => {
                u(w), m("");
              },
              min: 1,
              allowDecimal: !1,
              required: !0
            }
          ),
          /* @__PURE__ */ c.jsx(
            gr,
            {
              id: "new-project-background",
              label: y("common.background"),
              value: f,
              onChange: h,
              format: "hex",
              required: !0
            }
          )
        ] }),
        /* @__PURE__ */ c.jsxs(Ne, { justify: "flex-end", children: [
          /* @__PURE__ */ c.jsx(le, { id: "new-project-cancel", type: "button", variant: "default", onClick: () => o(!1), children: y("common.cancel") }),
          /* @__PURE__ */ c.jsx(le, { id: "create-project-confirm", type: "submit", loading: g, children: y("dialogs.createProject") })
        ] })
      ] }) })
    }
  );
}
function Kw(e) {
  const t = document.getElementById("new-project-dialog-mount");
  if (!t) throw new Error("missing element #new-project-dialog-mount");
  const n = { current: null };
  return Ue("project-create", t, /* @__PURE__ */ c.jsx(qw, { host: e, controller: n })), { open: () => n.current?.() };
}
function Yw({ controller: e }) {
  const [t, n] = p.useState(null), [o, r] = p.useState(!1);
  ze();
  const [s, a] = p.useState(""), i = p.useRef(null), l = p.useRef(null), u = p.useRef(null), f = p.useCallback(() => {
    r(!1), n(null), a("");
  }, []), h = p.useCallback((m) => {
    m.preventDefault();
    const g = i.current;
    if (!g?.reportValidity()) return;
    const b = g.value.trim();
    if (!b) return;
    const x = t?.submit;
    f(), x?.(b);
  }, [f, t]), d = p.useCallback((m) => {
    n(m), a(""), r(!0);
  }, []);
  return e.open = d, /* @__PURE__ */ c.jsxs(
    ct,
    {
      id: "name-dialog",
      "data-state": o ? "open" : "closed",
      opened: o,
      onClose: f,
      title: t ? y(t.titleKey) : y("dialogs.nameItem"),
      centered: !0,
      size: "min(32rem, calc(100vw - 2rem))",
      padding: "lg",
      trapFocus: !0,
      closeOnEscape: !0,
      closeOnClickOutside: !1,
      returnFocus: !0,
      keepMounted: !0,
      keepMountedMode: "display-none",
      closeButtonProps: { "aria-label": y("common.close") },
      onEnterTransitionEnd: () => i.current?.focus(),
      ref: (m) => {
        m && Object.defineProperty(m, "open", {
          configurable: !0,
          get: () => o
        });
      },
      children: [
        /* @__PURE__ */ c.jsx(ne, { component: "p", size: "xs", fw: 600, mb: "xs", style: { letterSpacing: "0.08em" }, children: y("dialogs.documentSetup") }),
        /* @__PURE__ */ c.jsxs(
          "form",
          {
            ref: l,
            onSubmit: h,
            onKeyDown: (m) => {
              m.key === "Enter" && (m.preventDefault(), l.current && u.current && l.current.requestSubmit(u.current));
            },
            children: [
              /* @__PURE__ */ c.jsx(
                tt,
                {
                  id: "name-dialog-input",
                  ref: i,
                  label: /* @__PURE__ */ c.jsx("span", { id: "name-dialog-label", children: t ? y(t.labelKey) : y("common.name") }),
                  value: s,
                  onChange: (m) => a(m.currentTarget.value),
                  autoComplete: "off",
                  maxLength: 80,
                  required: !0,
                  autoFocus: !0
                }
              ),
              /* @__PURE__ */ c.jsxs($n, { justify: "flex-end", gap: "sm", mt: "lg", children: [
                /* @__PURE__ */ c.jsx(le, { type: "button", variant: "default", onClick: f, children: y("common.cancel") }),
                /* @__PURE__ */ c.jsx(le, { id: "name-dialog-confirm", ref: u, type: "submit", children: t ? y(t.confirmKey) : y("common.save") })
              ] })
            ]
          }
        )
      ]
    }
  );
}
function Xw() {
  const e = window.document.createElement("div");
  e.dataset.island = "name-prompt", window.document.body.append(e);
  const t = {};
  Ue("name-prompt", e, /* @__PURE__ */ c.jsx(Yw, { controller: t }));
  const n = t.open;
  if (!n) throw new Error("Mantine name prompt failed to mount");
  return {
    request(o, r, s, a) {
      n({ titleKey: o, labelKey: r, confirmKey: s, submit: a });
    }
  };
}
const Gw = {
  chart: "generated.kindChart",
  table: "generated.kindTable",
  qr: "generated.kindQr"
}, ip = {
  bar: "generated.typeBar",
  column: "generated.typeColumn",
  line: "generated.typeLine",
  area: "generated.typeArea",
  pie: "generated.typePie",
  donut: "generated.typeDonut",
  scatter: "generated.typeScatter"
};
function $l(e) {
  return e === "qr" ? "data" : "csv";
}
function Jw({ controller: e }) {
  ze();
  const [t, n] = p.useState(null), [o, r] = p.useState(!1), [s, a] = p.useState("chart"), [i, l] = p.useState("csv"), [u, f] = p.useState("bar"), [h, d] = p.useState(""), [m, g] = p.useState(null), [b, x] = p.useState(""), [w, k] = p.useState(""), [S, j] = p.useState(null), [E, R] = p.useState(!1), P = p.useCallback(() => {
    r(!1), n(null), j(null), R(!1);
  }, []);
  e.open = (z) => {
    n(z), a(z.kind), l(z.mode === "replace" ? "json" : $l(z.kind)), f("bar"), d(""), g(null), x(z.spec), k(""), j(null), R(!1), r(!0);
  };
  const v = async () => {
    if (i === "json") {
      let B;
      try {
        B = JSON.parse(b);
      } catch {
        throw new Error(y("generated.invalidJson"));
      }
      if (!B || typeof B != "object" || Array.isArray(B))
        throw new Error(y("generated.invalidJson"));
      return { spec: { ...B, kind: s } };
    }
    if (i === "data") {
      if (!w) throw new Error(y("generated.dataRequired"));
      return { spec: { kind: "qr", data: w } };
    }
    if (!m) throw new Error(y("generated.fileRequired"));
    const z = await m.text();
    return s === "chart" ? { csv: { kind: "chart", chartType: u, text: z, ...h.trim() ? { title: h.trim() } : {} } } : { csv: { kind: "table", text: z } };
  }, T = async (z) => {
    if (z.preventDefault(), !t || E) return;
    j(null);
    let B;
    try {
      B = await v();
    } catch (M) {
      j(M instanceof Error ? M.message : String(M));
      return;
    }
    R(!0);
    try {
      await t.submit(B), P();
    } catch (M) {
      R(!1), j(M instanceof Error ? M.message : String(M));
    }
  }, L = t?.mode === "replace", _ = s === "qr" ? [{ value: "data", label: y("generated.sourceData") }, { value: "json", label: y("generated.sourceJson") }] : [{ value: "csv", label: y("generated.sourceCsv") }, { value: "json", label: y("generated.sourceJson") }];
  return /* @__PURE__ */ c.jsx(
    ct,
    {
      id: "generated-dialog",
      "data-state": o ? "open" : "closed",
      opened: o,
      onClose: P,
      title: y(L ? "generated.replaceTitle" : "generated.insertTitle"),
      centered: !0,
      size: "min(36rem, calc(100vw - 2rem))",
      padding: "lg",
      trapFocus: !0,
      closeOnEscape: !0,
      closeOnClickOutside: !1,
      returnFocus: !0,
      keepMounted: !0,
      keepMountedMode: "display-none",
      closeButtonProps: { "aria-label": y("common.close") },
      children: /* @__PURE__ */ c.jsx("form", { onSubmit: (z) => {
        T(z);
      }, children: /* @__PURE__ */ c.jsxs(me, { gap: "sm", children: [
        L ? null : /* @__PURE__ */ c.jsx(
          Un,
          {
            id: "generated-kind",
            fullWidth: !0,
            value: s,
            onChange: (z) => {
              const B = z;
              a(B), l($l(B)), j(null);
            },
            data: ["chart", "table", "qr"].map((z) => ({ value: z, label: y(Gw[z]) }))
          }
        ),
        L ? null : /* @__PURE__ */ c.jsx(
          Un,
          {
            id: "generated-source",
            fullWidth: !0,
            size: "xs",
            value: i,
            onChange: (z) => {
              l(z), j(null);
            },
            data: _
          }
        ),
        i === "csv" ? /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
          /* @__PURE__ */ c.jsx(
            Ps,
            {
              id: "generated-csv",
              label: y("generated.csvFile"),
              description: y(s === "chart" ? "generated.csvChartHint" : "generated.csvTableHint"),
              accept: ".csv,text/csv",
              value: m,
              onChange: g,
              clearable: !0
            }
          ),
          s === "chart" ? /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
            /* @__PURE__ */ c.jsx(
              Hn,
              {
                id: "generated-chart-type",
                label: y("generated.chartType"),
                value: u,
                onChange: (z) => f(z.currentTarget.value),
                data: Gf.map((z) => ({ value: z, label: y(ip[z]) }))
              }
            ),
            /* @__PURE__ */ c.jsx(
              tt,
              {
                id: "generated-title",
                label: y("generated.chartTitle"),
                value: h,
                onChange: (z) => d(z.currentTarget.value),
                maxLength: 200
              }
            )
          ] }) : null
        ] }) : null,
        i === "data" ? /* @__PURE__ */ c.jsx(
          tt,
          {
            id: "generated-qr-data",
            label: y("generated.qrData"),
            description: y("generated.qrDataHint"),
            value: w,
            onChange: (z) => k(z.currentTarget.value),
            autoComplete: "off"
          }
        ) : null,
        i === "json" ? /* @__PURE__ */ c.jsx(
          Vn,
          {
            id: "generated-spec",
            label: y("generated.specJson"),
            description: y("generated.specJsonHint"),
            value: b,
            onChange: (z) => x(z.currentTarget.value),
            autosize: !0,
            minRows: 8,
            maxRows: 18,
            styles: { input: { fontFamily: "var(--mantine-font-family-monospace)", fontSize: "0.8rem" } }
          }
        ) : null,
        S ? /* @__PURE__ */ c.jsx(Cs, { id: "generated-error", color: "red", variant: "light", children: S }) : null,
        /* @__PURE__ */ c.jsxs($n, { justify: "flex-end", gap: "sm", mt: "sm", children: [
          /* @__PURE__ */ c.jsx(le, { type: "button", variant: "default", onClick: P, children: y("common.cancel") }),
          /* @__PURE__ */ c.jsx(le, { id: "generated-confirm", type: "submit", loading: E, children: y(L ? "generated.replaceConfirm" : "generated.insertConfirm") })
        ] })
      ] }) })
    }
  );
}
function Zw() {
  const e = window.document.createElement("div");
  e.dataset.island = "generated-dialog", window.document.body.append(e);
  const t = {};
  Ue("generated-dialog", e, /* @__PURE__ */ c.jsx(Jw, { controller: t }));
  const n = (o) => {
    if (!t.open) throw new Error("Mantine generated-layer dialog failed to mount");
    t.open(o);
  };
  return {
    insert(o) {
      n({ mode: "insert", kind: "chart", spec: "", submit: o });
    },
    replace(o, r, s) {
      n({ mode: "replace", kind: o, spec: JSON.stringify(r, null, 2), submit: s });
    }
  };
}
function Qw(e) {
  const t = window.document.getElementById(e);
  if (!t) throw new Error(`missing element #${e}`);
  return t;
}
function ex({ controller: e }) {
  const { colorScheme: t, setColorScheme: n } = Uh(), [o, r] = p.useState(!1), [s, a] = p.useState("settings-agents");
  ze();
  const i = p.useRef(null), l = p.useRef(null), u = p.useRef(null);
  function f(m = "settings-agents", g) {
    a(m), g && (i.current && (i.current.checked = g.follow), l.current && (l.current.value = g.language)), r(!0);
  }
  function h() {
    r(!1);
  }
  p.useLayoutEffect(() => {
    e.current = { open: f, close: h, isOpen: () => o };
  }), p.useLayoutEffect(() => {
    const m = u.current;
    if (m)
      return Object.defineProperty(m, "open", {
        configurable: !0,
        get: () => o
      }), Object.defineProperty(m, "close", {
        configurable: !0,
        value: (g) => h()
      }), () => {
        delete m.open, delete m.close;
      };
  }, [o]), p.useEffect(() => () => {
    e.current = null;
  }, [e]);
  function d(m) {
    m.preventDefault(), m.nativeEvent.submitter?.value === "cancel" && h();
  }
  return /* @__PURE__ */ c.jsx(ct, { ref: u, id: "settings-dialog", "data-state": o ? "open" : "closed", opened: o, onClose: h, title: null, withCloseButton: !1, centered: !0, size: "xl", withinPortal: !1, keepMounted: !0, keepMountedMode: "display-none", children: /* @__PURE__ */ c.jsx("form", { id: "settings-form", onSubmit: d, children: /* @__PURE__ */ c.jsxs(me, { gap: "md", children: [
    /* @__PURE__ */ c.jsxs(Ne, { justify: "space-between", align: "flex-start", children: [
      /* @__PURE__ */ c.jsxs("div", { children: [
        /* @__PURE__ */ c.jsx(ne, { size: "xs", c: "dimmed", children: y("settings.preferences") }),
        /* @__PURE__ */ c.jsx(ne, { component: "h2", fw: 700, children: y("settings.openButton") })
      ] }),
      /* @__PURE__ */ c.jsx(le, { id: "settings-close", type: "submit", value: "cancel", variant: "subtle", title: y("common.close"), "aria-label": y("common.close"), children: "×" })
    ] }),
    /* @__PURE__ */ c.jsxs(Pe, { value: s, onChange: (m) => a(m), variant: "separated", keepMounted: !0, keepMountedMode: "display-none", children: [
      /* @__PURE__ */ c.jsxs(Pe.Item, { id: "settings-agents", className: "settings-section", value: "settings-agents", children: [
        /* @__PURE__ */ c.jsx(Pe.Control, { children: /* @__PURE__ */ c.jsxs(Ne, { gap: "sm", children: [
          /* @__PURE__ */ c.jsx("i", { className: "ph ph-robot", "aria-hidden": "true" }),
          /* @__PURE__ */ c.jsxs(me, { gap: 0, children: [
            /* @__PURE__ */ c.jsx(ne, { size: "xs", c: "dimmed", children: y("settings.collaboration") }),
            /* @__PURE__ */ c.jsx(ne, { id: "settings-agents-heading", fw: 600, children: y("settings.aiAgents") })
          ] })
        ] }) }),
        /* @__PURE__ */ c.jsx(Pe.Panel, { children: /* @__PURE__ */ c.jsxs(me, { gap: "sm", children: [
          /* @__PURE__ */ c.jsx(le, { id: "agents", type: "button", leftSection: /* @__PURE__ */ c.jsx("i", { className: "ph ph-plugs-connected", "aria-hidden": "true" }), children: y("agents.dialogTitle") }),
          /* @__PURE__ */ c.jsx(Gt, { id: "setting-follow", ref: i, defaultChecked: !0, label: y("agents.followChanges") }),
          /* @__PURE__ */ c.jsx(ne, { size: "sm", c: "dimmed", children: y("agents.followHint") })
        ] }) })
      ] }),
      /* @__PURE__ */ c.jsxs(Pe.Item, { id: "settings-document", className: "settings-section", value: "settings-document", children: [
        /* @__PURE__ */ c.jsx(Pe.Control, { children: /* @__PURE__ */ c.jsxs(Ne, { gap: "sm", children: [
          /* @__PURE__ */ c.jsx("i", { className: "ph ph-file", "aria-hidden": "true" }),
          /* @__PURE__ */ c.jsxs(me, { gap: 0, children: [
            /* @__PURE__ */ c.jsx(ne, { size: "xs", c: "dimmed", children: y("settings.project") }),
            /* @__PURE__ */ c.jsx(ne, { id: "settings-document-heading", fw: 600, children: y("settings.projectActions") })
          ] })
        ] }) }),
        /* @__PURE__ */ c.jsx(Pe.Panel, { children: /* @__PURE__ */ c.jsxs(me, { gap: "sm", children: [
          /* @__PURE__ */ c.jsx(le, { id: "rename-project", type: "button", variant: "default", disabled: !0, leftSection: /* @__PURE__ */ c.jsx("i", { className: "ph ph-pencil-simple", "aria-hidden": "true" }), children: y("projects.renameButton") }),
          /* @__PURE__ */ c.jsx(le, { id: "reload", type: "button", variant: "default", disabled: !0, leftSection: /* @__PURE__ */ c.jsx("i", { className: "ph ph-arrows-clockwise", "aria-hidden": "true" }), children: y("projects.reloadButton") }),
          /* @__PURE__ */ c.jsx(le, { id: "delete-project", type: "button", color: "red", variant: "light", disabled: !0, leftSection: /* @__PURE__ */ c.jsx("i", { className: "ph ph-trash", "aria-hidden": "true" }), children: y("projects.deleteButton") })
        ] }) })
      ] }),
      /* @__PURE__ */ c.jsxs(Pe.Item, { id: "settings-fonts", className: "settings-section", value: "settings-fonts", children: [
        /* @__PURE__ */ c.jsx(Pe.Control, { children: /* @__PURE__ */ c.jsxs(Ne, { gap: "sm", children: [
          /* @__PURE__ */ c.jsx("i", { className: "ph ph-text-aa", "aria-hidden": "true" }),
          /* @__PURE__ */ c.jsxs(me, { gap: 0, children: [
            /* @__PURE__ */ c.jsx(ne, { size: "xs", c: "dimmed", children: y("settings.workspace") }),
            /* @__PURE__ */ c.jsx(ne, { id: "settings-fonts-heading", fw: 600, children: y("toolbar.fontsButton") })
          ] })
        ] }) }),
        /* @__PURE__ */ c.jsx(Pe.Panel, { children: /* @__PURE__ */ c.jsxs(me, { gap: "sm", children: [
          /* @__PURE__ */ c.jsx(ne, { className: "hint", size: "sm", c: "dimmed", children: y("fonts.settingsHint") }),
          /* @__PURE__ */ c.jsx(le, { id: "settings-fonts-open", type: "button", variant: "default", leftSection: /* @__PURE__ */ c.jsx("i", { className: "ph ph-arrow-square-out", "aria-hidden": "true" }), children: y("fonts.openTools") })
        ] }) })
      ] }),
      /* @__PURE__ */ c.jsxs(Pe.Item, { id: "settings-application", className: "settings-section", value: "settings-application", children: [
        /* @__PURE__ */ c.jsx(Pe.Control, { children: /* @__PURE__ */ c.jsxs(Ne, { gap: "sm", children: [
          /* @__PURE__ */ c.jsx("i", { className: "ph ph-gear-six", "aria-hidden": "true" }),
          /* @__PURE__ */ c.jsxs(me, { gap: 0, children: [
            /* @__PURE__ */ c.jsx(ne, { size: "xs", c: "dimmed", children: y("settings.application") }),
            /* @__PURE__ */ c.jsx(ne, { id: "settings-application-heading", fw: 600, children: y("settings.updatesControl") })
          ] })
        ] }) }),
        /* @__PURE__ */ c.jsx(Pe.Panel, { children: /* @__PURE__ */ c.jsxs(me, { gap: "sm", children: [
          /* @__PURE__ */ c.jsx(Hn, { id: "setting-language", ref: l, label: /* @__PURE__ */ c.jsx("span", { "data-i18n": "settings.languageLabel", children: y("settings.languageLabel") }), defaultValue: "en", data: [
            { value: "en", label: y("settings.languageEnglish") },
            { value: "fr", label: y("settings.languageFrench") },
            { value: "de", label: y("settings.languageGerman") }
          ] }),
          /* @__PURE__ */ c.jsx(
            Nt.Wrapper,
            {
              id: "setting-appearance-wrapper",
              label: y("settings.appearance"),
              labelElement: "div",
              labelProps: { id: "setting-appearance-label" },
              children: /* @__PURE__ */ c.jsx(
                Un,
                {
                  id: "setting-appearance",
                  name: "setting-appearance",
                  "aria-labelledby": "setting-appearance-label",
                  fullWidth: !0,
                  value: t === "auto" ? "system" : t,
                  onChange: (m) => {
                    m === "system" ? n("auto") : (m === "light" || m === "dark") && n(m);
                  },
                  data: [
                    { value: "system", label: y("settings.appearanceSystem") },
                    { value: "light", label: y("settings.appearanceLight") },
                    { value: "dark", label: y("settings.appearanceDark") }
                  ]
                }
              )
            }
          ),
          /* @__PURE__ */ c.jsx(Gt, { id: "setting-update-check", label: y("updates.dailyCheckSetting") }),
          /* @__PURE__ */ c.jsxs(ne, { size: "sm", c: "dimmed", children: [
            y("updates.dailyCheckBeforeCommand"),
            " ",
            /* @__PURE__ */ c.jsx("code", { children: "assemblash upgrade" }),
            y("updates.dailyCheckAfterCommand")
          ] }),
          /* @__PURE__ */ c.jsx(ne, { id: "update-note", component: "p", size: "sm", c: "dimmed", hidden: !0, "aria-live": "polite" }),
          /* @__PURE__ */ c.jsx(le, { id: "shutdown", type: "button", color: "red", variant: "light", hidden: !0, leftSection: /* @__PURE__ */ c.jsx("i", { className: "ph ph-power", "aria-hidden": "true" }), children: y("app.stop") })
        ] }) })
      ] })
    ] })
  ] }) }) });
}
function tx() {
  const e = Qw("settings-dialog-mount"), t = { current: null };
  return Ue("settings", e, /* @__PURE__ */ c.jsx(ex, { controller: t })), {
    open: (n, o) => t.current?.open(n, o),
    close: () => t.current?.close(),
    isOpen: () => t.current?.isOpen() ?? !1
  };
}
function nx(e, t) {
  const n = new Set(t), o = e.filter((a) => !n.has(a)), r = e.findIndex((a) => n.has(a)), s = r < 0 ? o.length : e.slice(0, r).filter((a) => !n.has(a)).length;
  return [...o.slice(0, s), ...t, ...o.slice(s)];
}
const ns = 64;
class ox {
  entries = [];
  activeId = null;
  /** Tabs in strip order. */
  get all() {
    return this.entries;
  }
  get size() {
    return this.entries.length;
  }
  get active() {
    return this.find(this.activeId);
  }
  find(t) {
    return t === null ? null : this.entries.find((n) => n.id === t) ?? null;
  }
  has(t) {
    return this.find(t) !== null;
  }
  /**
   * Adds a tab at the end of the strip, or returns the tab that already shows
   * this project. A second open never adds a second tab.
   */
  open(t, n) {
    const o = this.find(t);
    if (o) return { entry: o, added: !1 };
    if (this.entries.length >= ns) throw new RangeError(`at most ${ns} tabs`);
    const r = { id: t, record: n(), changed: !1, group: null };
    return this.entries.push(r), { entry: r, added: !0 };
  }
  /** Makes a tab the visible one. Viewing a tab clears its change marker. */
  activate(t) {
    const n = this.find(t);
    return this.activeId = n ? n.id : null, n && (n.changed = !1), n;
  }
  /**
   * Removes a tab. Returns the tab that becomes visible when the removed one
   * was visible: the right neighbour, else the left one, else none.
   */
  close(t) {
    const n = this.entries.findIndex((s) => s.id === t);
    if (n < 0) return { removed: null, next: this.active };
    const [o] = this.entries.splice(n, 1);
    if (this.activeId !== t) return { removed: o ?? null, next: this.active };
    const r = this.entries[n] ?? this.entries[n - 1] ?? null;
    return this.activeId = null, { removed: o ?? null, next: r };
  }
  /** Moves a tab to a new index in the strip. Out-of-range indexes clamp. */
  move(t, n) {
    const o = this.entries.findIndex((a) => a.id === t);
    if (o < 0) return !1;
    const r = Math.max(0, Math.min(this.entries.length - 1, Math.trunc(n)));
    if (r === o) return !1;
    const [s] = this.entries.splice(o, 1);
    return this.entries.splice(r, 0, s), !0;
  }
  /**
   * Puts the tabs in this order. Ids that are not open are ignored. Open tabs
   * that the order leaves out stay after the others, in their old order.
   */
  arrange(t) {
    const n = t.map((r) => this.find(r)).filter((r, s, a) => r !== null && a.indexOf(r) === s), o = this.entries.filter((r) => !n.includes(r));
    this.entries = [...n, ...o];
  }
  /**
   * Marks the tabs of a page set with their page numbers, in manifest order.
   * Tabs that had this set before and are not in `pages` lose the mark. A tab
   * is in one set at most: the set opened last marks it.
   */
  setGroup(t, n) {
    for (const o of this.entries)
      o.group?.set === t && (o.group = null);
    n.forEach((o, r) => {
      const s = this.find(o);
      s && (s.group = { set: t, page: r + 1, count: n.length });
    });
  }
  /** Gives a tab a new project id, for a project renamed while open. */
  rename(t, n) {
    const o = this.find(t);
    return !o || t !== n && this.has(n) ? null : (this.activeId === t && (this.activeId = n), o.id = n, o);
  }
  /** Sets the change marker of a hidden tab. The visible tab never gets one. */
  markChanged(t) {
    const n = this.find(t);
    return !n || n.id === this.activeId || n.changed ? !1 : (n.changed = !0, !0);
  }
  views() {
    return this.entries.map((t) => ({
      id: t.id,
      changed: t.changed,
      active: t.id === this.activeId,
      group: t.group
    }));
  }
  serialize() {
    return { projects: this.entries.map((t) => t.id), active: this.activeId };
  }
}
function rx(e) {
  const t = { projects: [], active: null };
  if (!e || typeof e != "object" || Array.isArray(e)) return t;
  const n = e.projects;
  if (!Array.isArray(n)) return t;
  const o = [];
  for (const s of n)
    if (!(typeof s != "string" || s.length === 0 || o.includes(s)) && (o.push(s), o.length === ns))
      break;
  const r = e.active;
  return {
    projects: o,
    active: typeof r == "string" && o.includes(r) ? r : o[0] ?? null
  };
}
function sx(e, t) {
  const n = t.trim().toLocaleLowerCase();
  return e.filter((o) => !n || o.toLocaleLowerCase().includes(n));
}
function ax(e, t, n = ns) {
  if (e.length === 0) return { kind: "empty" };
  const o = e.filter((r) => !t.includes(r));
  return t.length + o.length > n ? { kind: "tooMany", count: e.length, max: n } : { kind: "open", pages: [...e], toOpen: o, order: nx(t, e) };
}
const _l = {
  root: { width: "100%", height: "auto", minHeight: "3rem", paddingBlock: "0.5rem" },
  inner: { width: "100%" },
  label: {
    display: "grid",
    width: "100%",
    minWidth: 0,
    gap: "0.25rem",
    textAlign: "left"
  }
};
function ix({ host: e, controller: t, boundary: n }) {
  const [o, r] = p.useState({
    projects: [],
    query: "",
    currentProject: null
  }), [s, a] = p.useState(""), i = p.useRef(""), [l, u] = p.useState(y("projects.searchPlaceholder")), [f, h] = p.useState(!1), [d, m] = p.useState(-1), [g, b] = p.useState(t.pageSets), x = ze(), w = p.useRef(null), k = p.useRef(void 0), S = p.useRef(o);
  S.current = o, p.useEffect(() => (t.setProjects = (M) => {
    if (S.current = M, r(M), m(-1), !M.query) {
      const A = M.currentProject ? M.projects.find((O) => O.id === M.currentProject) : void 0;
      u(A?.name ?? A?.id ?? (M.projects.length ? y("projects.searchPlaceholder") : y("projects.none")));
    }
  }, t.setCurrentProject = (M) => {
    const A = S.current, O = { ...A, currentProject: M };
    S.current = O, r(O);
    const $ = M ? A.projects.find((I) => I.id === M) : void 0;
    u($?.name ?? $?.id ?? (A.projects.length ? y("projects.searchPlaceholder") : y("projects.none")));
  }, t.setPageSets = (M) => b(M), b(t.pageSets), t.focus = () => w.current?.focus(), () => {
    window.clearTimeout(k.current), t.setProjects = () => {
    }, t.setCurrentProject = () => {
    }, t.setPageSets = () => {
    }, t.focus = () => {
    };
  }), [t]), p.useEffect(() => {
    if (s) return;
    const M = o.currentProject ? o.projects.find((A) => A.id === o.currentProject) : void 0;
    u(M?.name ?? M?.id ?? (o.projects.length ? y("projects.searchPlaceholder") : y("projects.none")));
  }, [x]), p.useEffect(() => {
    const M = (A) => {
      (!(A.target instanceof Node) || !n.contains(A.target)) && (h(!1), m(-1));
    };
    return document.addEventListener("pointerdown", M), () => document.removeEventListener("pointerdown", M);
  }, [n]);
  function j(M) {
    h(M), M || m(-1);
  }
  function E(M) {
    const A = { ...S.current, currentProject: M.id };
    S.current = A, r(A), u(M.name ?? M.id), i.current = "", a(""), w.current && (w.current.value = ""), w.current?.blur(), j(!1), e.openProject(M.id);
  }
  function R(M) {
    i.current = M, a(M), window.clearTimeout(k.current), k.current = window.setTimeout(() => e.search(M.trim()), 150);
  }
  function P(M) {
    i.current = "", a(""), w.current && (w.current.value = ""), w.current?.blur(), j(!1), e.openPageSet(M);
  }
  const v = sx(g, s), T = o.projects.length + v.length, L = (M) => M < o.projects.length ? `project-option-${M}` : `page-set-option-${M - o.projects.length}`;
  function _(M) {
    if (f || j(!0), T === 0) return;
    const A = M > 0 ? 0 : T - 1, O = d < 0 ? A : Math.max(0, Math.min(T - 1, d + M));
    m(O), window.requestAnimationFrame(() => {
      document.getElementById(L(O))?.scrollIntoView({ block: "nearest" });
    });
  }
  const z = o.projects.length === 0 && v.length === 0 ? o.query ? y("projects.noMatching") : y("projects.none") : "", B = f && d >= 0 && d < T ? L(d) : void 0;
  return /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
    /* @__PURE__ */ c.jsx("i", { className: "ph ph-magnifying-glass", "aria-hidden": "true" }),
    /* @__PURE__ */ c.jsx(
      tt,
      {
        id: "project-search",
        "data-current-project": o.currentProject ?? "",
        ref: w,
        type: "search",
        autoComplete: "off",
        defaultValue: "",
        placeholder: l,
        "aria-label": y("projects.searchPlaceholder"),
        "aria-controls": "project-options",
        "aria-expanded": f,
        "aria-autocomplete": "list",
        "aria-activedescendant": B,
        role: "combobox",
        onChange: (M) => R(M.currentTarget.value),
        onFocus: () => j(!0),
        onKeyDown: (M) => {
          if (M.key === "ArrowDown" || M.key === "ArrowUp") {
            M.preventDefault(), _(M.key === "ArrowDown" ? 1 : -1);
            return;
          }
          if (M.key === "Escape") {
            j(!1);
            return;
          }
          if (M.key !== "Enter") return;
          const A = w.current?.value ?? i.current;
          A !== i.current && (i.current = A, a(A));
          const O = d >= o.projects.length ? v[d - o.projects.length] : void 0;
          if (O) {
            M.preventDefault(), P(O);
            return;
          }
          const $ = o.projects[d], I = A.trim().toLocaleLowerCase(), D = o.projects.find(
            (F) => F.id.toLocaleLowerCase() === I || (F.name ?? F.id).toLocaleLowerCase() === I
          ) ?? $;
          D && (M.preventDefault(), E(D));
        }
      }
    ),
    /* @__PURE__ */ c.jsx(
      le,
      {
        id: "project-picker-toggle",
        className: "project-picker-toggle",
        type: "button",
        variant: "subtle",
        "aria-label": y("projects.showButton"),
        "aria-controls": "project-options",
        "aria-expanded": f,
        onClick: () => {
          const M = !f;
          j(M), M && w.current?.focus();
        },
        children: /* @__PURE__ */ c.jsx("i", { className: "ph ph-caret-down", "aria-hidden": "true" })
      }
    ),
    /* @__PURE__ */ c.jsxs(
      "div",
      {
        id: "project-options",
        className: "project-options",
        role: "listbox",
        "aria-label": y("projects.optionsLabel"),
        hidden: !f,
        children: [
          o.projects.map((M, A) => /* @__PURE__ */ c.jsxs(
            le,
            {
              id: `project-option-${A}`,
              className: `project-option${A === d ? " active" : ""}`,
              styles: _l,
              type: "button",
              variant: "subtle",
              title: M.name ?? M.id,
              "data-project-id": M.id,
              role: "option",
              "aria-selected": M.id === o.currentProject,
              onClick: () => E(M),
              children: [
                /* @__PURE__ */ c.jsx("strong", { children: M.name ?? M.id }),
                /* @__PURE__ */ c.jsx(
                  "span",
                  {
                    className: "project-option-count",
                    "data-i18n-count": "projects.layerCount",
                    "data-count": String(M.layers),
                    children: Lt("projects.layerCount", M.layers)
                  }
                )
              ]
            },
            M.id
          )),
          v.length > 0 ? /* @__PURE__ */ c.jsx("p", { className: "project-options-heading", role: "presentation", children: y("pageSets.heading") }) : null,
          v.map((M, A) => /* @__PURE__ */ c.jsxs(
            le,
            {
              id: `page-set-option-${A}`,
              className: `project-option page-set-option${o.projects.length + A === d ? " active" : ""}`,
              styles: _l,
              type: "button",
              variant: "subtle",
              title: y("pageSets.openLabel", { set: M }),
              "data-page-set": M,
              role: "option",
              "aria-selected": !1,
              onClick: () => P(M),
              children: [
                /* @__PURE__ */ c.jsxs("strong", { children: [
                  /* @__PURE__ */ c.jsx("i", { className: "ph ph-files", "aria-hidden": "true" }),
                  " ",
                  M
                ] }),
                /* @__PURE__ */ c.jsx("span", { className: "project-option-count", children: y("pageSets.option") })
              ]
            },
            `set:${M}`
          )),
          z ? /* @__PURE__ */ c.jsx("p", { className: "project-options-empty", children: z }) : null
        ]
      }
    )
  ] });
}
function cx(e, t) {
  t.replaceChildren();
  const n = {
    pageSets: [],
    setProjects: () => {
    },
    setCurrentProject: () => {
    },
    setPageSets: () => {
    },
    focus: () => {
    }
  }, o = Ue(
    "project-picker",
    t,
    /* @__PURE__ */ c.jsx(ix, { host: e, controller: n, boundary: t })
  );
  function r(s, a, i) {
    n.setProjects({ projects: s, query: a, currentProject: i });
  }
  return {
    setProjects: r,
    setCurrentProject(s) {
      n.setCurrentProject(s);
    },
    setPageSets(s) {
      n.pageSets = s, n.setPageSets(s);
    },
    focus: () => n.focus(),
    destroy: o
  };
}
function lx(e) {
  const t = window.document.getElementById(e);
  if (!t) throw new Error(`missing element #${e}`);
  return t;
}
function zl(e) {
  return e.kind ?? "text";
}
function ux({ host: e, projectController: t }) {
  const [n, o] = p.useState([]), [r, s] = p.useState(() => /* @__PURE__ */ new Map()), [a, i] = p.useState([]), [l, u] = p.useState(""), [f, h] = p.useState([]), [d, m] = p.useState(!1), [g, b] = p.useState(!1);
  ze();
  const [x, w] = p.useState(null), k = p.useRef([]), S = p.useRef(d);
  S.current = d;
  const j = p.useRef(null), E = p.useRef(null);
  function R() {
    for (const A of k.current) URL.revokeObjectURL(A);
    k.current = [];
  }
  function P() {
    const A = {};
    for (const O of n) {
      const $ = r.get(O.name);
      $ && (A[O.name] = $);
    }
    return A;
  }
  function v(A, O) {
    s(($) => new Map($).set(A, O));
  }
  async function T(A, O) {
    R(), h([]);
    const $ = [];
    for (const I of O.variants) {
      const V = await Wn(Zf(A, I.name));
      k.current.push(V), $.push({ variant: I, url: V });
    }
    h($);
  }
  async function L(A, O) {
    await e.guard(A, async () => {
      const $ = e.project();
      if (!$) return;
      const I = await iw($, O);
      await T($, I), e.say(Lt("templates.renderedCount", I.variants.length, {
        what: A,
        version: je(I.templateVersion)
      }));
    });
  }
  async function _(A = null) {
    const O = e.project();
    if (s(/* @__PURE__ */ new Map()), i([]), u(""), R(), h([]), !O) {
      o([]), S.current = !1, m(!1);
      return;
    }
    const $ = await aw(O), I = $.isTemplate ? $.slots : [];
    o(I), S.current = I.length > 0, m(I.length > 0);
    const V = /* @__PURE__ */ new Map();
    for (const D of I)
      zl(D) === "color" && V.set(D.name, "#000000");
    if (A) {
      for (const [D, F] of A.values)
        I.some((U) => U.name === D) && V.set(D, F);
      i([...A.batch]), u(A.variantName);
    }
    s(V);
  }
  p.useLayoutEffect(() => {
    t.current = {
      projectChanged: _,
      draft: () => ({ values: new Map(r), batch: [...a], variantName: l }),
      setOpen: b,
      isVisible: () => S.current
    };
  }), p.useEffect(() => () => {
    t.current = null, R();
  }, [t]);
  async function z(A) {
    const O = A.currentTarget.files?.[0];
    A.currentTarget.value = "", O && await e.guard(y("templates.loadValues"), async () => {
      const $ = JSON.parse(await O.text());
      if (!Array.isArray($)) throw new Error(y("templates.expectedArray"));
      const I = [];
      for (const V of $) {
        const D = V;
        if (typeof D.name != "string") throw new Error(y("templates.missingName"));
        const F = {};
        for (const [U, q] of Object.entries(D.values ?? {})) F[U] = String(q);
        I.push({ name: D.name, values: F });
      }
      i(I), e.say(Lt("templates.loadedVariants", I.length, { file: O.name }));
    });
  }
  async function B(A) {
    const O = A.currentTarget.files?.[0];
    A.currentTarget.value = "";
    const $ = x;
    w(null), !(!O || !$) && await e.guard(y("templates.importImage"), async () => {
      const I = e.project();
      if (!I) return;
      const V = await nc(I, O);
      v($, V.asset.id), await e.refresh(), s((D) => new Map(D)), e.say(y("templates.importedImage", { file: O.name, slot: $ }));
    });
  }
  const M = e.document()?.assets ?? [];
  return /* @__PURE__ */ c.jsxs(me, { component: "section", id: "templates", className: g ? "templates open" : "templates", hidden: !d, gap: "md", "aria-label": y("templates.drawerLabel"), children: [
    /* @__PURE__ */ c.jsxs(Ne, { justify: "space-between", align: "flex-start", children: [
      /* @__PURE__ */ c.jsxs("div", { children: [
        /* @__PURE__ */ c.jsx(ne, { size: "xs", c: "dimmed", children: y("templates.workspace") }),
        /* @__PURE__ */ c.jsx(ne, { component: "h2", fw: 700, children: y("templates.buildVariants") })
      ] }),
      /* @__PURE__ */ c.jsx(le, { id: "templates-close", type: "button", variant: "subtle", title: y("templates.close"), "aria-label": y("common.close"), children: "×" })
    ] }),
    /* @__PURE__ */ c.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 18rem), 1fr))", gap: "var(--mantine-spacing-md)" }, children: [
      /* @__PURE__ */ c.jsxs(me, { gap: "sm", children: [
        /* @__PURE__ */ c.jsx(ne, { component: "h3", fw: 600, children: y("templates.fillSlots") }),
        /* @__PURE__ */ c.jsx(me, { id: "slot-form", gap: "sm", children: n.map((A) => {
          const O = zl(A), $ = r.get(A.name) ?? (O === "color" ? "#000000" : "");
          return /* @__PURE__ */ c.jsxs(me, { gap: 4, "data-slot": A.name, children: [
            O === "image" ? /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
              /* @__PURE__ */ c.jsx(ho, { label: `${A.name}${A.required ? " *" : ""}`, title: A.description ?? void 0, "data-slot": A.name, value: r.get(A.name) ?? "", onChange: (I) => v(A.name, I ?? ""), data: [{ value: "", label: y(M.length ? "templates.leaveAsIs" : "templates.noImages") }, ...M.map((I) => ({ value: I.id, label: I.path }))] }),
              /* @__PURE__ */ c.jsx(le, { type: "button", size: "xs", variant: "default", onClick: () => {
                w(A.name), j.current?.click();
              }, children: y("templates.importButton") })
            ] }) : O === "color" ? /* @__PURE__ */ c.jsx(tt, { type: "color", label: `${A.name}${A.required ? " *" : ""}`, title: A.description ?? void 0, "data-slot": A.name, value: $, onChange: (I) => v(A.name, I.currentTarget.value) }) : /* @__PURE__ */ c.jsx(tt, { label: `${A.name}${A.required ? " *" : ""}`, title: A.description ?? void 0, "data-slot": A.name, value: $, onChange: (I) => v(A.name, I.currentTarget.value) }),
            A.description && /* @__PURE__ */ c.jsx(ne, { size: "xs", c: "dimmed", children: A.description })
          ] }, A.name);
        }) }),
        /* @__PURE__ */ c.jsx("input", { ref: j, id: "slot-image-file", type: "file", accept: "image/*,.svg", hidden: !0, onChange: (A) => {
          B(A);
        } }),
        /* @__PURE__ */ c.jsxs(Ne, { align: "end", wrap: "wrap", children: [
          /* @__PURE__ */ c.jsx(le, { id: "preview-variant", type: "button", onClick: () => {
            L(y("templates.preview"), [{ name: "preview", values: P() }]);
          }, children: y("templates.preview") }),
          /* @__PURE__ */ c.jsx(tt, { id: "variant-name", label: y("templates.variantName"), value: l, onChange: (A) => u(A.currentTarget.value) }),
          /* @__PURE__ */ c.jsx(le, { id: "add-variant", type: "button", variant: "default", onClick: () => {
            const A = l.trim();
            if (!A) {
              e.say(y("templates.variantNameRequired"), "error");
              return;
            }
            i((O) => [...O, { name: A, values: P() }]), u(""), e.say(y("templates.addedToBatch", { name: A }));
          }, children: y("templates.addToBatch") })
        ] })
      ] }),
      /* @__PURE__ */ c.jsxs(me, { gap: "sm", children: [
        /* @__PURE__ */ c.jsx(ne, { component: "h3", fw: 600, children: y("templates.batch") }),
        /* @__PURE__ */ c.jsx(me, { component: "ol", id: "variant-rows", gap: "xs", m: 0, p: 0, children: a.map((A, O) => /* @__PURE__ */ c.jsx(On, { component: "li", withBorder: !0, p: "xs", children: /* @__PURE__ */ c.jsxs(Ne, { justify: "space-between", align: "flex-start", wrap: "nowrap", children: [
          /* @__PURE__ */ c.jsxs(me, { gap: 2, style: { minWidth: 0 }, children: [
            /* @__PURE__ */ c.jsx(ne, { fw: 600, children: A.name }),
            /* @__PURE__ */ c.jsx(ne, { size: "xs", c: "dimmed", children: Object.entries(A.values).map(([$, I]) => `${$}=${I}`).join("  ") })
          ] }),
          /* @__PURE__ */ c.jsx(le, { type: "button", size: "xs", variant: "subtle", onClick: () => i(($) => $.filter((I, V) => V !== O)), children: y("templates.removeButton") })
        ] }) }, `${O}-${A.name}`)) }),
        /* @__PURE__ */ c.jsx("input", { ref: E, id: "values-file", type: "file", accept: "application/json,.json", hidden: !0, onChange: (A) => {
          z(A);
        } }),
        /* @__PURE__ */ c.jsxs(Ne, { wrap: "wrap", children: [
          /* @__PURE__ */ c.jsx(le, { id: "load-values", type: "button", variant: "default", onClick: () => E.current?.click(), children: y("templates.loadJson") }),
          /* @__PURE__ */ c.jsx(le, { id: "render-batch", type: "button", disabled: !a.length, onClick: () => {
            L(y("templates.renderBatch"), a);
          }, children: a.length ? Lt("templates.renderVariants", a.length) : y("templates.renderBatch") }),
          /* @__PURE__ */ c.jsx(le, { id: "clear-batch", type: "button", variant: "default", disabled: !a.length, onClick: () => i([]), children: y("templates.clear") })
        ] })
      ] }),
      /* @__PURE__ */ c.jsxs(me, { gap: "sm", children: [
        /* @__PURE__ */ c.jsx(ne, { component: "h3", fw: 600, children: y("templates.renderedVariants") }),
        /* @__PURE__ */ c.jsx("div", { id: "gallery", style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))", gap: "var(--mantine-spacing-sm)" }, children: f.map(({ variant: A, url: O }) => /* @__PURE__ */ c.jsxs(On, { component: "figure", withBorder: !0, p: "sm", m: 0, children: [
          /* @__PURE__ */ c.jsx("img", { src: O, alt: y("templates.variantAlt", { name: A.name }), style: { display: "block", width: "100%", height: "auto" } }),
          /* @__PURE__ */ c.jsxs(me, { component: "figcaption", gap: 4, mt: "sm", children: [
            /* @__PURE__ */ c.jsx(ne, { component: "strong", children: A.name }),
            /* @__PURE__ */ c.jsx(ne, { size: "xs", children: y("templates.bytesSize", { width: je(A.width), height: je(A.height), bytes: je(A.bytes) }) }),
            /* @__PURE__ */ c.jsx(ne, { component: "code", size: "xs", title: A.hash, children: A.hash.replace(/^sha256:/, "").slice(0, 12) }),
            /* @__PURE__ */ c.jsx(le, { component: "a", href: O, download: `${A.name}.png`, variant: "default", size: "xs", children: y("templates.downloadButton") })
          ] })
        ] }, `${A.name}-${A.hash}`)) })
      ] })
    ] })
  ] });
}
function dx(e) {
  const t = lx("templates-mantine-mount"), n = { current: null };
  return Ue("templates", t, /* @__PURE__ */ c.jsx(ux, { host: e, projectController: n })), {
    projectChanged: async (o) => {
      await n.current?.projectChanged(o);
    },
    draft: () => n.current?.draft() ?? { values: /* @__PURE__ */ new Map(), batch: [], variantName: "" },
    setOpen: (o) => n.current?.setOpen(o),
    isVisible: () => n.current?.isVisible() ?? !1
  };
}
function Fl(e, t) {
  return !!(e?.group && t?.group && e.group.set === t.group.set);
}
const ya = "application/x-assemblash-tab";
function fx({ host: e, bind: t }) {
  ze();
  const [n, o] = p.useState([]), [r, s] = p.useState(null), a = p.useRef(null), i = p.useRef(null);
  if (p.useEffect(() => {
    t(o);
  }, [t]), p.useEffect(() => {
    const d = a.current;
    d && (a.current = null, i.current?.querySelector(`[data-tab-id="${CSS.escape(d)}"]`)?.focus());
  }, [n]), n.length === 0) return null;
  const l = (d) => {
    const m = n[(d + n.length) % n.length];
    m && i.current?.querySelector(`[data-tab-id="${CSS.escape(m.id)}"]`)?.focus();
  }, u = (d, m, g) => {
    const b = d.key === "ArrowLeft" ? -1 : d.key === "ArrowRight" ? 1 : 0;
    if ((b !== 0 || ["Home", "End", "Delete"].includes(d.key)) && d.stopPropagation(), b !== 0 && d.altKey && d.shiftKey) {
      d.preventDefault(), a.current = g.id, e.move(g.id, m + b);
      return;
    }
    b !== 0 ? (d.preventDefault(), l(m + b)) : d.key === "Home" || d.key === "End" ? (d.preventDefault(), l(d.key === "Home" ? 0 : n.length - 1)) : d.key === "Delete" && (d.preventDefault(), e.close(g.id));
  }, f = (d, m) => {
    d.button === 1 && (d.preventDefault(), e.close(m));
  }, h = (d, m) => {
    const g = d.currentTarget.getBoundingClientRect();
    return d.clientX > g.left + g.width / 2 ? m + 1 : m;
  };
  return /* @__PURE__ */ c.jsx(
    "div",
    {
      ref: i,
      className: "project-tabs",
      role: "tablist",
      "aria-label": y("tabs.label"),
      title: y("tabs.reorderHint"),
      onDragLeave: (d) => {
        d.currentTarget.contains(d.relatedTarget) || s(null);
      },
      children: n.map((d, m) => {
        const g = d.group, b = !!g && !Fl(n[m - 1], d), x = !!g && !Fl(d, n[m + 1]), w = g ? y("tabs.page", { page: g.page, count: g.count, set: g.set }) : "", k = [d.name, w, d.changed ? y("tabs.changed") : ""].filter(Boolean).join(" — ");
        return /* @__PURE__ */ c.jsxs(
          "div",
          {
            className: "project-tab",
            "data-active": d.active || void 0,
            "data-changed": d.changed || void 0,
            "data-page-set": g?.set,
            "data-page-number": g?.page,
            "data-group-start": b || void 0,
            "data-group-end": x || void 0,
            "data-drop": r === m ? "before" : r === m + 1 && m === n.length - 1 ? "after" : void 0,
            draggable: !0,
            onDragStart: (S) => {
              S.dataTransfer.setData(ya, d.id), S.dataTransfer.effectAllowed = "move";
            },
            onDragOver: (S) => {
              S.dataTransfer.types.includes(ya) && (S.preventDefault(), S.dataTransfer.dropEffect = "move", s(h(S, m)));
            },
            onDrop: (S) => {
              const j = S.dataTransfer.getData(ya);
              if (s(null), !j) return;
              S.preventDefault();
              const E = n.findIndex((P) => P.id === j);
              let R = h(S, m);
              E >= 0 && E < R && (R -= 1), e.move(j, R);
            },
            onDragEnd: () => s(null),
            children: [
              b && g ? /* @__PURE__ */ c.jsxs("span", { className: "project-tab-group-label", "data-group-label": g.set, title: y("tabs.groupLabel", { set: g.set }), children: [
                /* @__PURE__ */ c.jsx("i", { className: "ph ph-files", "aria-hidden": "true" }),
                g.set
              ] }) : null,
              /* @__PURE__ */ c.jsxs(
                zn,
                {
                  className: "project-tab-button",
                  role: "tab",
                  id: `project-tab-${d.id}`,
                  "data-tab-id": d.id,
                  "aria-selected": d.active,
                  tabIndex: d.active ? 0 : -1,
                  title: k,
                  onClick: () => e.activate(d.id),
                  onAuxClick: (S) => f(S, d.id),
                  onMouseDown: (S) => {
                    S.button === 1 && S.preventDefault();
                  },
                  onKeyDown: (S) => u(S, m, d),
                  children: [
                    g ? /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
                      /* @__PURE__ */ c.jsx("span", { className: "project-tab-page", "data-tab-page": g.page, "aria-hidden": "true", children: g.page }),
                      /* @__PURE__ */ c.jsx("span", { className: "project-tab-thumb", "aria-hidden": "true", children: d.thumbnail ? /* @__PURE__ */ c.jsx("img", { src: d.thumbnail, alt: "", "data-tab-thumbnail": d.id, draggable: !1 }) : null })
                    ] }) : null,
                    /* @__PURE__ */ c.jsx("span", { className: "project-tab-name", children: d.name }),
                    w ? /* @__PURE__ */ c.jsx("span", { className: "sr-only", children: `, ${w}` }) : null,
                    d.changed ? /* @__PURE__ */ c.jsx("span", { className: "project-tab-marker", "data-tab-marker": d.id, role: "img", "aria-label": y("tabs.changed") }) : null
                  ]
                }
              ),
              /* @__PURE__ */ c.jsx(
                ds,
                {
                  size: "sm",
                  className: "project-tab-close",
                  "data-tab-close": d.id,
                  tabIndex: -1,
                  "aria-label": y("tabs.close", { name: d.name }),
                  title: y("tabs.close", { name: d.name }),
                  onClick: () => e.close(d.id)
                }
              )
            ]
          },
          d.id
        );
      })
    }
  );
}
function px(e, t) {
  let n = [], o = null;
  const r = (s) => {
    o = s, s(n);
  };
  return Ue("project-tabs", t, /* @__PURE__ */ c.jsx(fx, { host: e, bind: r })), {
    setTabs(s) {
      n = s, o?.(s);
    }
  };
}
const Vo = (e) => /* @__PURE__ */ c.jsx("i", { className: `ph ${e}`, "aria-hidden": "true" });
function os(e) {
  return e.name ?? (e.type === "text" ? e.text : e.type) ?? e.type;
}
function hx(e) {
  return e.type === "shape" ? { rect: "ph-square", ellipse: "ph-circle", line: "ph-line-segment", path: "ph-bezier-curve" }[Jf(e) ?? ""] ?? "ph-shapes" : { text: "ph-text-t", image: "ph-image", svg: "ph-pen-nib", group: "ph-stack" }[e.type] ?? "ph-square";
}
function mx({ layer: e, finish: t }) {
  const n = p.useRef(null), o = p.useRef(!1);
  p.useEffect(() => {
    n.current?.focus(), n.current?.select();
  }, []);
  const r = (s) => {
    o.current || (o.current = !0, t(s ? n.current?.value.trim() ?? "" : null));
  };
  return /* @__PURE__ */ c.jsx(
    tt,
    {
      ref: n,
      size: "xs",
      autoFocus: !0,
      defaultValue: os(e),
      classNames: { input: "layer-rename" },
      "aria-label": y("layers.renameHint"),
      onClick: (s) => s.stopPropagation(),
      onBlur: () => r(!0),
      onKeyDown: (s) => {
        s.stopPropagation(), (s.key === "Enter" || s.key === "Escape") && (s.preventDefault(), r(s.key === "Enter"));
      }
    }
  );
}
function gx({ layer: e, depth: t, parent: n, inheritedGuard: o, snapshot: r, commands: s, elementProps: a, renaming: i, startRename: l, finishRename: u, expanded: f, hasChildren: h, toggleExpanded: d }) {
  const [m, g] = p.useState(!1), [b, x] = p.useState(!1), w = p.useRef(null);
  p.useEffect(() => () => {
    w.current && clearTimeout(w.current.timer);
  }, []);
  const k = r.selectedIds.includes(e.id), S = !o && nr(e), j = o || !!es(e), E = !o && !e.protected && !e.readOnly, R = (v, T) => {
    k || s.select(e.id, !1), s.contextMenu?.(e.id, v, T);
  }, P = () => {
    w.current && clearTimeout(w.current.timer);
  };
  return /* @__PURE__ */ c.jsx(
    ee,
    {
      ...a,
      className: `${a.className} layer${k ? " selected" : ""}${j ? " guarded" : ""}${e.visible === !1 ? " hidden-layer" : ""}${m ? " dragging" : ""}${b ? " drop-target" : ""}`,
      "data-id": e.id,
      "data-type": e.type,
      "data-parent": n ?? "",
      style: { ...a.style, "--layer-depth": t, paddingInlineStart: 8 + t * 16 },
      draggable: S,
      onClick: (v) => {
        if (w.current?.fired) {
          w.current = null;
          return;
        }
        a.onClick(v), s.select(e.id, v.shiftKey || v.ctrlKey || v.metaKey);
      },
      onContextMenu: (v) => {
        v.preventDefault(), R(v.clientX, v.clientY);
      },
      onPointerDown: (v) => {
        if (v.pointerType !== "touch" || !s.contextMenu) return;
        P();
        const T = v.clientX, L = v.clientY;
        w.current = { x: T, y: L, fired: !1, timer: setTimeout(() => {
          w.current && (w.current.fired = !0), R(T, L);
        }, 450) };
      },
      onPointerMove: (v) => {
        w.current && Math.hypot(v.clientX - w.current.x, v.clientY - w.current.y) > 8 && P();
      },
      onPointerUp: P,
      onPointerCancel: P,
      onDragStart: (v) => {
        v.dataTransfer.setData("text/plain", e.id), g(!0);
      },
      onDragEnd: () => {
        g(!1), x(!1);
      },
      onDragOver: (v) => {
        v.preventDefault(), x(!0);
      },
      onDragLeave: () => x(!1),
      onDrop: (v) => {
        v.preventDefault(), x(!1);
        const T = v.dataTransfer.getData("text/plain");
        if (!T || T === e.id || !r.document) return;
        const L = Ve($e(r.document)), _ = n ? L.find((M) => M.layer.id === n)?.layer : null, z = _?.type === "group" ? _.children ?? [] : $e(r.document), B = Math.max(0, z.findIndex((M) => M.id === e.id) + 1);
        s.reorder(T, e.id, e.type === "group" ? { at: "in", parent: e.id } : n ? { at: "in", parent: n, index: B } : { at: "root", index: B });
      },
      children: /* @__PURE__ */ c.jsxs(Ne, { gap: "xs", wrap: "nowrap", children: [
        h ? /* @__PURE__ */ c.jsx(
          Wo,
          {
            className: "layer-control",
            size: "sm",
            variant: "subtle",
            "data-layer-toggle": e.id,
            title: y(f ? "layers.collapseGroup" : "layers.expandGroup"),
            "aria-label": y(f ? "layers.collapseGroup" : "layers.expandGroup"),
            "aria-expanded": f,
            onClick: (v) => {
              v.stopPropagation(), d();
            },
            children: Vo(f ? "ph-caret-down" : "ph-caret-right")
          }
        ) : null,
        /* @__PURE__ */ c.jsx(
          Wo,
          {
            className: "layer-control",
            size: "sm",
            variant: "subtle",
            disabled: !S,
            title: y(e.visible === !1 ? "layers.show" : "layers.hide"),
            "aria-label": y(e.visible === !1 ? "layers.show" : "layers.hide"),
            onClick: (v) => {
              v.stopPropagation(), s.toggleVisibility(e.id);
            },
            children: Vo(e.visible === !1 ? "ph-eye-slash" : "ph-eye")
          }
        ),
        /* @__PURE__ */ c.jsx(ee, { className: "layer-icon", children: Vo(hx(e)) }),
        /* @__PURE__ */ c.jsx(ee, { style: { flex: 1, minWidth: 0 }, children: i ? /* @__PURE__ */ c.jsx(mx, { layer: e, finish: (v) => {
          u(), v !== null && v !== (e.name ?? "") && s.rename(e.id, v);
        } }) : /* @__PURE__ */ c.jsx(
          ne,
          {
            component: "span",
            className: "name",
            size: "sm",
            truncate: !0,
            title: es(e) ?? y("layers.renameHint"),
            onDoubleClick: (v) => {
              v.stopPropagation(), S && l();
            },
            children: os(e)
          }
        ) }),
        /* @__PURE__ */ c.jsx(
          Wo,
          {
            className: "layer-control",
            size: "sm",
            variant: "subtle",
            disabled: !E,
            title: y(e.locked ? "layers.unlock" : "layers.lock"),
            "aria-label": y(e.locked ? "layers.unlock" : "layers.lock"),
            onClick: (v) => {
              v.stopPropagation(), s.toggleLocked(e.id);
            },
            children: Vo(e.locked ? "ph-lock" : "ph-lock-open")
          }
        )
      ] })
    }
  );
}
function vx({ snapshot: e, commands: t }) {
  ze();
  const [n, o] = p.useState(null), [r, s] = p.useState({}), a = e.document ? $e(e.document) : [], i = p.useMemo(() => {
    const h = e.query.trim().toLowerCase(), d = (g) => os(g).toLowerCase().includes(h) || g.type === "group" && (g.children ?? []).some(d), m = (g, b, x) => [...g].reverse().filter((w) => !h || d(w)).map((w) => ({
      value: w.id,
      label: os(w),
      layer: w,
      parent: b,
      guarded: x,
      ...w.type === "group" ? { children: m(w.children ?? [], w.id, x || !nr(w)) } : {}
    }));
    return m(e.document ? $e(e.document) : [], null, !1);
  }, [e.document, e.query]), l = p.useMemo(() => {
    const h = /* @__PURE__ */ new Map(), d = (m) => {
      for (const g of m)
        h.set(g.value, g), g.children && d(g.children);
    };
    return d(i), h;
  }, [i]), u = p.useMemo(() => Object.fromEntries([...l.keys()].map((h) => [h, r[h] ?? !0])), [l, r]), f = Hf({
    multiple: !0,
    selectedState: [...e.selectedIds],
    expandedState: u,
    onExpandedStateChange: s,
    onSelectedStateChange(h) {
      if (h.length) {
        t.select(h[0], !1);
        for (const d of h.slice(1)) t.select(d, !0);
      }
    }
  });
  return i.length ? /* @__PURE__ */ c.jsx(
    Vs,
    {
      id: "layers",
      "aria-label": y("layers.tab"),
      data: i,
      tree: f,
      m: 0,
      p: 0,
      expandOnClick: !1,
      expandOnSpace: !1,
      selectOnClick: !1,
      allowRangeSelection: !1,
      onKeyDown: (h) => {
        const d = h.target;
        if (d.getAttribute("role") !== "treeitem" && !d.classList.contains("layer")) return;
        const m = l.get(d.dataset.value ?? "");
        if (m && (h.key === "F2" && (h.preventDefault(), h.stopPropagation(), !m.guarded && nr(m.layer) && o(m.value)), (h.key === "Enter" || h.key === " ") && (h.preventDefault(), h.stopPropagation(), t.select(m.value, h.shiftKey || h.ctrlKey || h.metaKey)), h.key === "F10" && h.shiftKey)) {
          h.preventDefault(), h.stopPropagation(), e.selectedIds.includes(m.value) || t.select(m.value, !1);
          const g = (d.classList.contains("layer") ? d : d.querySelector(".layer")).getBoundingClientRect();
          t.contextMenu?.(m.value, g.left + 24, g.top + 24);
        }
      },
      renderNode: ({ node: h, level: d, elementProps: m, expanded: g, hasChildren: b }) => {
        const { layer: x, parent: w, guarded: k } = h;
        return /* @__PURE__ */ c.jsx(
          gx,
          {
            layer: x,
            depth: d - 1,
            parent: w,
            inheritedGuard: k,
            snapshot: e,
            commands: t,
            elementProps: m,
            renaming: n === x.id,
            startRename: () => o(x.id),
            finishRename: () => o(null),
            expanded: g,
            hasChildren: b,
            toggleExpanded: () => f.toggleExpanded(x.id)
          }
        );
      }
    }
  ) : /* @__PURE__ */ c.jsx(ee, { component: "ul", id: "layers", role: "tree", "aria-label": y("layers.tab"), m: 0, p: 0, style: { listStyle: "none" }, children: /* @__PURE__ */ c.jsx(ee, { component: "li", className: `layers-empty${a.length ? " compact" : ""}`, p: "md", children: /* @__PURE__ */ c.jsxs(me, { gap: "xs", align: "center", children: [
    /* @__PURE__ */ c.jsx(ee, { children: Vo(a.length ? "ph-magnifying-glass" : "ph-stack-simple") }),
    /* @__PURE__ */ c.jsx(ne, { fw: 600, children: y(a.length ? "layers.noMatching" : "layers.none") }),
    /* @__PURE__ */ c.jsx(ne, { size: "sm", c: "dimmed", children: y(a.length ? "layers.trySearch" : "layers.emptyHint") })
  ] }) }) });
}
function yx({ snapshot: e }) {
  return ze(), /* @__PURE__ */ c.jsx(ee, { component: "ol", id: "history", m: 0, p: "sm", children: [...e.history?.entries ?? []].reverse().map((t) => /* @__PURE__ */ c.jsx(
    ee,
    {
      component: "li",
      className: t.position > (e.history?.position ?? 0) ? "undone" : void 0,
      py: "xs",
      children: /* @__PURE__ */ c.jsx(ne, { size: "sm", c: t.position > (e.history?.position ?? 0) ? "dimmed" : void 0, children: `${t.position}. ${t.kind} — ${t.actor.kind}${t.actor.detail ? ` (${t.actor.detail})` : ""}` })
    },
    t.transaction
  )) });
}
function bx({ snapshot: e, commands: t }) {
  ze();
  const [n, o] = p.useState(e.dock ?? "properties");
  p.useEffect(() => {
    e.dock && o(e.dock);
  }, [e.dock]);
  const r = e.document ? Ve($e(e.document)) : [], s = r.filter((l) => e.selectedIds.includes(l.layer.id)), a = s.length > 0 && s.every((l) => {
    if (!nr(l.layer)) return !1;
    let u = l.parent;
    for (; u; ) {
      const f = r.find((h) => h.layer.id === u);
      if (!f || !nr(f.layer)) return !1;
      u = f.parent;
    }
    return !0;
  }), i = (l) => {
    (l === "properties" || l === "layers" || l === "history") && (o(l), t.showDock(l));
  };
  return /* @__PURE__ */ c.jsxs(
    ht,
    {
      value: n,
      onChange: i,
      keepMounted: !0,
      keepMountedMode: "display-none",
      className: "structure-tabs",
      styles: {
        root: { display: "flex", width: "100%", height: "100%", minHeight: 0, flexDirection: "column" },
        list: {
          display: "flex",
          width: "100%",
          flex: "0 0 auto",
          borderBottom: "1px solid var(--color-line-strong)",
          backgroundColor: "var(--color-surface-subtle)"
        },
        tab: {
          minWidth: 0,
          minHeight: "var(--inspector-height)",
          flex: "1 1 0",
          paddingInline: "var(--space-2)",
          whiteSpace: "nowrap"
        },
        panel: { width: "100%", minHeight: 0, flex: "1 1 auto", overflow: "auto" }
      },
      children: [
        /* @__PURE__ */ c.jsxs(ht.List, { children: [
          /* @__PURE__ */ c.jsx(ht.Tab, { id: "properties-tab", value: "properties", children: y("properties.tab") }),
          /* @__PURE__ */ c.jsx(ht.Tab, { id: "layers-tab", value: "layers", children: y("layers.tab") }),
          /* @__PURE__ */ c.jsx(ht.Tab, { id: "history-tab", value: "history", children: y("history.tab") })
        ] }),
        /* @__PURE__ */ c.jsx(ht.Panel, { value: "properties", id: "properties-panel", className: "dock-view", children: /* @__PURE__ */ c.jsx("div", { id: "advanced-inspector" }) }),
        /* @__PURE__ */ c.jsx(ht.Panel, { value: "layers", id: "layers-view", className: "dock-view", children: /* @__PURE__ */ c.jsxs(me, { className: "layers-content", gap: "sm", p: "sm", children: [
          /* @__PURE__ */ c.jsx(
            tt,
            {
              id: "layer-search",
              value: e.query,
              disabled: Bl(e.document),
              placeholder: y(Bl(e.document) ? "layers.noSearch" : "layers.searchPlaceholder"),
              "aria-label": y("layers.searchPlaceholder"),
              onChange: (l) => t.setQuery(l.currentTarget.value)
            }
          ),
          /* @__PURE__ */ c.jsx(vx, { snapshot: e, commands: t }),
          /* @__PURE__ */ c.jsxs(Ne, { gap: "xs", children: [
            /* @__PURE__ */ c.jsx(le, { id: "group-layers", variant: "default", size: "xs", disabled: !a || s.length < 2, onClick: t.groupSelection, children: y("layers.groupButton") }),
            /* @__PURE__ */ c.jsx(le, { id: "delete-layer", variant: "light", color: "red", size: "xs", disabled: !a, onClick: t.deleteSelection, children: y("layers.deleteButton") })
          ] })
        ] }) }),
        /* @__PURE__ */ c.jsx(ht.Panel, { value: "history", id: "history-view", className: "dock-view", children: /* @__PURE__ */ c.jsx(yx, { snapshot: e }) })
      ]
    }
  );
}
function Bl(e) {
  return !e || $e(e).length === 0;
}
function wx(e, t, n) {
  let o = (a) => {
  };
  function r() {
    const [a, i] = p.useState(t);
    return p.useEffect(() => (o = (l) => i({ ...l }), () => {
      o = () => {
      };
    }), []), /* @__PURE__ */ c.jsx(bx, { snapshot: a, commands: n });
  }
  const s = Ue("structure", e, /* @__PURE__ */ c.jsx(r, {}));
  return { setSnapshot: (a) => o(a), destroy: s };
}
function xx(e) {
  return typeof e == "string" ? e : JSON.stringify(e, null, 2);
}
function rs(e) {
  return Array.isArray(e) ? `[${e.map(rs).join(",")}]` : e && typeof e == "object" ? `{${Object.keys(e).sort().map(
    (t) => `${JSON.stringify(t)}:${rs(e[t])}`
  ).join(",")}}` : JSON.stringify(e);
}
function Vl(e, t) {
  if (typeof e == "string" && typeof t == "string") {
    const n = (o) => {
      const r = /^#([\da-f]{6})([\da-f]{2})?$/i.exec(o);
      return r ? `${r[1].toLowerCase()}${(r[2] ?? "ff").toLowerCase()}` : o;
    };
    return n(e) === n(t);
  }
  return rs(e) === rs(t);
}
function cp({ id: e, label: t, value: n, className: o, compact: r = !1, disabled: s = !1, onCommit: a, clear: i }) {
  ze();
  const l = typeof n == "string" ? n : "#000000", [u, f] = p.useState(typeof n == "string" ? "solid" : "json"), [h, d] = p.useState(l), [m, g] = p.useState(xx(n)), [b, x] = p.useState(""), [w, k] = p.useState(!1), S = p.useRef(n);
  function j(v) {
    let T = v.trim();
    /^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(T) && (typeof S.current == "string" && /^#[\da-f]{6}$/i.test(S.current) && /^#([\da-f]{6})ff$/i.test(T) && (T = T.slice(0, 7)), x(""), !Vl(S.current, T) && (S.current = T, a(T)));
  }
  function E() {
    let v;
    try {
      v = JSON.parse(m);
    } catch {
      x(y("paint.jsonSyntaxError"));
      return;
    }
    if (!v || typeof v != "object" || Array.isArray(v) || !("kind" in v)) {
      x(y("paint.jsonObjectError"));
      return;
    }
    x("");
    const T = v;
    Vl(S.current, T) || (S.current = T, a(T));
  }
  const R = /* @__PURE__ */ c.jsxs(me, { gap: "xs", className: "paint-input", "data-paint-editor": e, children: [
    /* @__PURE__ */ c.jsx(
      Un,
      {
        "aria-label": t,
        value: u,
        onChange: (v) => f(v),
        data: [
          { value: "solid", label: y("paint.solid") },
          { value: "json", label: y("paint.json") }
        ],
        disabled: s,
        size: "xs"
      }
    ),
    u === "solid" ? /* @__PURE__ */ c.jsxs(Ne, { align: "end", wrap: "nowrap", gap: "xs", children: [
      /* @__PURE__ */ c.jsx(
        gr,
        {
          id: `${e}-solid`,
          classNames: o ? { input: o } : void 0,
          label: t,
          value: h,
          format: "hexa",
          fixOnBlur: !1,
          disabled: s,
          onChange: (v) => d(v),
          onChangeEnd: j,
          onBlur: (v) => j(v.currentTarget.value),
          "aria-label": t,
          "data-paint-solid": e,
          style: { flex: 1 }
        }
      ),
      i ? /* @__PURE__ */ c.jsx(
        le,
        {
          type: "button",
          size: "sm",
          variant: "light",
          className: i.className,
          title: i.title,
          disabled: s || i.disabled,
          onClick: i.onClear,
          children: i.label
        }
      ) : null
    ] }) : /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
      /* @__PURE__ */ c.jsx(
        Vn,
        {
          id: `${e}-json`,
          classNames: { input: o ? `${o} paint-json` : "paint-json" },
          label: t,
          value: m,
          onChange: (v) => g(v.currentTarget.value),
          minRows: 4,
          autosize: !0,
          disabled: s,
          error: b || void 0,
          "aria-label": t,
          "data-paint-json": e
        }
      ),
      /* @__PURE__ */ c.jsxs(Ne, { justify: "space-between", align: "center", children: [
        /* @__PURE__ */ c.jsx(ne, { size: "xs", c: "dimmed", children: y("paint.jsonHint") }),
        /* @__PURE__ */ c.jsxs(Ne, { gap: "xs", children: [
          /* @__PURE__ */ c.jsx(le, { id: `${e}-apply-json`, type: "button", size: "xs", variant: "light", disabled: s, onClick: E, children: y("paint.applyJson") }),
          i ? /* @__PURE__ */ c.jsx(
            le,
            {
              type: "button",
              size: "xs",
              variant: "light",
              className: i.className,
              title: i.title,
              disabled: s || i.disabled,
              onClick: i.onClear,
              children: i.label
            }
          ) : null
        ] })
      ] })
    ] }),
    b ? /* @__PURE__ */ c.jsx(ne, { size: "xs", c: "red", role: "alert", children: b }) : null
  ] });
  if (!r) return R;
  const P = typeof n == "string" ? { backgroundColor: n } : { background: "linear-gradient(135deg, var(--color-accent) 0 50%, var(--color-surface-subtle) 50% 100%)" };
  return /* @__PURE__ */ c.jsxs(
    qe,
    {
      id: e,
      opened: w,
      onChange: k,
      position: "bottom-start",
      offset: 6,
      width: "min(20rem, calc(100vw - 1rem))",
      withinPortal: !0,
      trapFocus: !0,
      returnFocus: !0,
      zIndex: 400,
      shadow: "md",
      children: [
        /* @__PURE__ */ c.jsx(qe.Target, { children: /* @__PURE__ */ c.jsx(
          Wo,
          {
            className: "paint-swatch-trigger",
            type: "button",
            variant: "default",
            "aria-label": t,
            title: t,
            "aria-haspopup": "dialog",
            "aria-expanded": w,
            "data-paint-trigger": e,
            disabled: s,
            onClick: () => k((v) => !v),
            children: /* @__PURE__ */ c.jsx("span", { className: "paint-swatch", "aria-hidden": "true", style: P })
          }
        ) }),
        /* @__PURE__ */ c.jsx(qe.Dropdown, { className: "paint-popover", "data-paint-popover": e, children: R })
      ]
    }
  );
}
let Sx = 0;
function Cx(e, t) {
  return Ue(`paint-${++Sx}`, e, /* @__PURE__ */ c.jsx(cp, { ...t }));
}
let lp = 0;
function rc(e) {
  return JSON.stringify([e.project, e.document, e.layer]);
}
function up(e) {
  const t = e.runs.every(Ua) && e.runs.map((n) => n.text).join("") === e.text;
  return { capture: structuredClone(e), rows: e.runs.map((n) => ({ key: ++lp, raw: structuredClone(n), legacy: !t || !Ua(n) })), error: "", pending: !1 };
}
function Hl(e = "") {
  return { key: ++lp, raw: { text: e } };
}
function Vr(e) {
  return !e.legacy && !!e.raw && typeof e.raw == "object" && !Array.isArray(e.raw) && typeof e.raw.text == "string";
}
function Ua(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return !1;
  const t = e;
  if (typeof t.text != "string") return !1;
  for (const o of ["fontFamily", "fontStyle"])
    if (t[o] != null && typeof t[o] != "string") return !1;
  if (t.fontStyle != null && !["normal", "italic"].includes(String(t.fontStyle))) return !1;
  for (const o of ["fontSize", "fontWeight", "letterSpacing"]) {
    const r = t[o];
    if (r != null && (typeof r != "number" || !Number.isFinite(r))) return !1;
  }
  if (typeof t.fontSize == "number" && t.fontSize <= 0 || typeof t.fontWeight == "number" && (!Number.isInteger(t.fontWeight) || t.fontWeight < 100 || t.fontWeight > 900)) return !1;
  const n = t.color;
  return !(n != null && !jx(n));
}
function jx(e) {
  if (typeof e == "string") return /^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(e);
  if (!e || typeof e != "object" || Array.isArray(e)) return !1;
  const t = e, n = (s) => typeof s == "number" && Number.isFinite(s);
  if (t.kind === "linear") {
    if (Object.hasOwn(t, "angle") && !n(t.angle)) return !1;
  } else if (t.kind === "radial") {
    if (Object.hasOwn(t, "radius") && (!n(t.radius) || t.radius <= 0)) return !1;
    if (Object.hasOwn(t, "center")) {
      const s = t.center;
      if (!s || typeof s != "object" || Array.isArray(s) || !n(s.x) || !n(s.y)) return !1;
    }
  } else return !1;
  const o = t.stops;
  if (!Array.isArray(o) || o.length === 0 || o.length > 16) return !1;
  let r = -1;
  return o.every((s) => !s || typeof s != "object" || Array.isArray(s) || !n(s.offset) || s.offset < 0 || s.offset > 1 || s.offset <= r || typeof s.color != "string" || !/^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(s.color) || Object.hasOwn(s, "alpha") && (!n(s.alpha) || s.alpha < 0 || s.alpha > 1) ? !1 : (r = s.offset, !0));
}
function kx(e, t, n) {
  const o = structuredClone(e);
  return n === void 0 ? delete o[t] : o[t] = structuredClone(n), o;
}
function lo(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function ba(e, t) {
  return Object.fromEntries(Object.entries(structuredClone(e)).filter(([n]) => !t.includes(n)));
}
function Ul(e) {
  const t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    if (!lo(o) || typeof o.offset != "number" || !Number.isFinite(o.offset)) continue;
    const r = o.offset;
    t.has(r) && n.add(r), t.set(r, o);
  }
  for (const o of n) t.delete(o);
  return t;
}
function Ex(e, t) {
  if (!lo(e) || !lo(t) || e.kind !== t.kind || !["linear", "radial"].includes(String(t.kind))) return structuredClone(t);
  const n = t.kind === "radial", o = {
    ...ba(e, n ? ["kind", "center", "radius", "stops"] : ["kind", "angle", "stops"]),
    ...structuredClone(t)
  };
  if (Array.isArray(e.stops) && Array.isArray(t.stops)) {
    const r = Ul(e.stops), s = Ul(t.stops);
    o.stops = t.stops.map((a) => {
      if (!lo(a) || typeof a.offset != "number" || !s.has(a.offset)) return structuredClone(a);
      const i = r.get(a.offset);
      return { ...i ? ba(i, ["offset", "color", "alpha"]) : {}, ...structuredClone(a) };
    });
  }
  if (n && lo(e.center)) {
    const r = ba(e.center, ["x", "y"]);
    lo(t.center) ? o.center = { ...r, ...structuredClone(t.center) } : !Object.hasOwn(t, "center") && Object.keys(r).length && (o.center = { ...r, x: 0.5, y: 0.5 });
  }
  return o;
}
function Wa(e) {
  return JSON.stringify(e.rows.map((t) => t.raw)) !== JSON.stringify(e.capture.runs);
}
function Rx(e) {
  if (!Wa(e)) return null;
  const t = e.rows.map((o) => structuredClone(o.raw)), n = { op: "update", id: e.capture.layer, runs: t };
  if (t.length && e.rows.every(Vr) && t.every(Ua)) {
    const o = t.map((r) => r.text).join("");
    o !== e.capture.text && Object.assign(n, { text: o });
  }
  return n;
}
function Nx(e) {
  ze();
  const [, t] = p.useState(0), n = p.useRef(null), o = rc(e.capture), r = e.drafts.get(o), s = e.disabled || !!r?.pending || !!r?.reconcile, a = () => t((g) => g + 1), i = (g) => requestAnimationFrame(() => {
    (n.current ?? [...document.querySelectorAll("[data-runs-editor]")].find((x) => x.dataset.runsIdentity === o))?.querySelector(g)?.focus();
  }), l = (g) => {
    e.drafts.set(o, g), a();
  }, u = () => {
    l(up(e.capture)), i("#runs-add");
  }, f = (g, b, x) => {
    if (!r || s) return;
    const w = r.rows[g];
    Vr(w) && (w.raw = kx(w.raw, b, x), r.error = "", l(r));
  };
  async function h() {
    if (!r || s || !Wa(r)) return;
    r.pending = !0, r.error = "", l(r);
    const g = await e.submit(r);
    r.pending = !1, g.status === "applied" ? e.drafts.delete(o) : (r.error = g.error, r.reconcile = g.status === "committed" || g.status === "unknown"), a(), i(g.status === "applied" ? "#runs-edit" : "#runs-error");
  }
  async function d() {
    if (!r || r.pending) return;
    r.pending = !0, l(r);
    const g = await e.reload();
    g ? (r.pending = !1, r.error = g, l(r), i("#runs-error")) : i("textarea[data-run-text], #runs-add");
  }
  function m(g, b, x, w, k) {
    const S = g[x], j = S != null, E = `run-${r.rows[b].key}-${x}`, R = `${y("runs.row", { number: b + 1 })}: ${y(w)}`;
    return /* @__PURE__ */ c.jsxs(me, { gap: 4, style: { minWidth: 0 }, children: [
      /* @__PURE__ */ c.jsx(
        ho,
        {
          "aria-label": `${R}: ${y("runs.mode")}`,
          label: y(w),
          size: "xs",
          value: j ? "value" : "inherit",
          data: [{ value: "inherit", label: y("runs.inherit") }, { value: "value", label: y("runs.override") }],
          disabled: s,
          onChange: (P) => f(b, x, P === "inherit" ? void 0 : k)
        }
      ),
      x === "fontFamily" ? /* @__PURE__ */ c.jsx(Lw, { host: e.fonts, label: R, value: String(j ? S : k), disabled: s || !j, onCommit: (P) => f(b, x, P) }) : x === "fontStyle" ? /* @__PURE__ */ c.jsx(
        ho,
        {
          id: E,
          "aria-label": R,
          size: "xs",
          value: String(j ? S : k),
          disabled: s || !j,
          data: [{ value: "normal", label: y("runs.normal") }, { value: "italic", label: y("runs.italic") }],
          onChange: (P) => f(b, x, P)
        }
      ) : /* @__PURE__ */ c.jsx(
        tt,
        {
          id: E,
          "aria-label": R,
          size: "xs",
          type: "number",
          value: String(j ? S : k),
          disabled: s || !j,
          onChange: (P) => {
            const v = P.currentTarget.value;
            f(b, x, v === "" ? "" : Number(v));
          }
        }
      )
    ] }, x);
  }
  return /* @__PURE__ */ c.jsx("div", { ref: n, className: "runs-editor", "data-runs-editor": !0, "data-runs-identity": o, onKeyDown: (g) => g.stopPropagation(), children: /* @__PURE__ */ c.jsxs(me, { gap: "xs", children: [
    /* @__PURE__ */ c.jsx(ne, { fw: 600, children: y("runs.title") }),
    /* @__PURE__ */ c.jsx(ne, { size: "xs", c: "dimmed", children: y("runs.help") }),
    r ? /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
      r.capture.version !== e.capture.version && /* @__PURE__ */ c.jsx(ne, { size: "xs", c: "orange", role: "status", children: y("runs.conflict") }),
      /* @__PURE__ */ c.jsx(at, { "aria-label": y("runs.title"), style: { tableLayout: "fixed", width: "100%" }, children: /* @__PURE__ */ c.jsx(at.Tbody, { children: r.rows.map((g, b) => /* @__PURE__ */ c.jsx(at.Tr, { "data-run-row": g.key, children: /* @__PURE__ */ c.jsx(at.Td, { style: { padding: "8px 0" }, children: /* @__PURE__ */ c.jsxs(me, { gap: "xs", children: [
        /* @__PURE__ */ c.jsxs(Ne, { justify: "space-between", gap: 4, children: [
          /* @__PURE__ */ c.jsx(ne, { size: "sm", fw: 600, children: y("runs.row", { number: b + 1 }) }),
          /* @__PURE__ */ c.jsxs(Ne, { gap: 4, wrap: "wrap", children: [
            [[-1, "runs.up"], [1, "runs.down"]].map(([x, w]) => /* @__PURE__ */ c.jsx(
              le,
              {
                size: "compact-xs",
                variant: "subtle",
                "aria-label": `${y(w)}: ${b + 1}`,
                "data-run-move": x,
                disabled: s || b + x < 0 || b + x >= r.rows.length,
                onClick: () => {
                  [r.rows[b], r.rows[b + x]] = [r.rows[b + x], r.rows[b]], l(r), i(`[data-run-row="${g.key}"] textarea`);
                },
                children: y(w)
              },
              x
            )),
            /* @__PURE__ */ c.jsx(
              le,
              {
                size: "compact-xs",
                variant: "subtle",
                color: "red",
                "aria-label": `${y("runs.delete")}: ${b + 1}`,
                "data-run-delete": !0,
                disabled: s,
                onClick: () => {
                  r.rows.splice(b, 1), l(r), i(r.rows.length ? `[data-run-row="${r.rows[Math.min(b, r.rows.length - 1)].key}"] textarea` : "#runs-add");
                },
                children: y("runs.delete")
              }
            )
          ] })
        ] }),
        Vr(g) ? /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
          /* @__PURE__ */ c.jsx(
            Vn,
            {
              "data-run-text": !0,
              "aria-label": `${y("runs.text")}: ${b + 1}`,
              label: y("runs.text"),
              value: g.raw.text,
              autosize: !0,
              minRows: 2,
              disabled: s,
              onChange: (x) => f(b, "text", x.currentTarget.value)
            }
          ),
          /* @__PURE__ */ c.jsxs(us, { cols: 2, spacing: "xs", children: [
            m(g.raw, b, "fontFamily", "editor.fontFamily", e.layer.fontFamily),
            m(g.raw, b, "fontSize", "properties.fontSize", e.layer.fontSize),
            m(g.raw, b, "fontWeight", "properties.weight", e.layer.fontWeight ?? 400),
            m(g.raw, b, "fontStyle", "properties.style", e.layer.fontStyle ?? "normal"),
            m(g.raw, b, "letterSpacing", "properties.letterSpacing", e.layer.letterSpacing ?? 0)
          ] }),
          /* @__PURE__ */ c.jsx(
            ho,
            {
              size: "xs",
              label: y("properties.colour"),
              "aria-label": `${y("runs.fillMode")}: ${b + 1}`,
              "data-run-fill-mode": !0,
              value: Object.hasOwn(g.raw, "color") ? g.raw.color === null ? "none" : "value" : "inherit",
              disabled: s,
              data: [{ value: "inherit", label: y("runs.inherit") }, { value: "none", label: y("runs.noFill") }, { value: "value", label: y("runs.override") }],
              onChange: (x) => f(b, "color", x === "inherit" ? void 0 : x === "none" ? null : e.layer.color ?? "#000000")
            }
          ),
          Object.hasOwn(g.raw, "color") && g.raw.color !== null && /* @__PURE__ */ c.jsx(
            cp,
            {
              id: `run-${g.key}-paint`,
              label: `${y("properties.colour")}: ${b + 1}`,
              value: g.raw.color,
              disabled: s,
              onCommit: (x) => f(b, "color", Ex(r.rows[b].raw.color, x))
            },
            `${g.key}-${typeof g.raw.color}`
          )
        ] }) : /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
          /* @__PURE__ */ c.jsx(ne, { size: "xs", c: "orange", children: y("runs.unsupported") }),
          /* @__PURE__ */ c.jsx(Vn, { "aria-label": `${y("runs.raw")}: ${b + 1}`, value: JSON.stringify(g.raw, null, 2), readOnly: !0, autosize: !0, maxRows: 6 })
        ] })
      ] }) }) }, g.key)) }) }),
      /* @__PURE__ */ c.jsxs(Ne, { gap: "xs", children: [
        /* @__PURE__ */ c.jsx(le, { id: "runs-add", size: "xs", variant: "light", disabled: s, onClick: () => {
          const g = Hl(r.rows.length === 0 && r.capture.runs.length === 0 ? r.capture.text : "");
          r.rows.push(g), l(r), i(`[data-run-row="${g.key}"] textarea`);
        }, children: y("runs.add") }),
        /* @__PURE__ */ c.jsx(le, { id: "runs-clear", size: "xs", variant: "light", disabled: s || !r.rows.length, onClick: () => {
          r.rows = [], l(r), i("#runs-add");
        }, children: y("runs.clear") }),
        r.rows.some((g) => !Vr(g)) && /* @__PURE__ */ c.jsx(le, { id: "runs-replace", size: "xs", variant: "light", disabled: s, onClick: () => {
          const g = Hl(r.capture.text);
          r.rows = [g], l(r), i(`[data-run-row="${g.key}"] textarea`);
        }, children: y("runs.replace") })
      ] }),
      r.error && /* @__PURE__ */ c.jsx(ne, { id: "runs-error", role: "alert", tabIndex: -1, size: "xs", c: "red", children: r.error }),
      (r.error || r.capture.version !== e.capture.version) && /* @__PURE__ */ c.jsx(le, { id: "runs-reload", size: "xs", variant: "light", disabled: r.pending, onClick: () => {
        d();
      }, children: y("runs.reload") }),
      /* @__PURE__ */ c.jsxs(Ne, { gap: "xs", children: [
        /* @__PURE__ */ c.jsx(le, { id: "runs-apply", size: "xs", disabled: s || !Wa(r), loading: r.pending, onClick: () => {
          h();
        }, children: y("runs.apply") }),
        /* @__PURE__ */ c.jsx(le, { id: "runs-cancel", size: "xs", variant: "default", disabled: r.pending, onClick: () => {
          e.drafts.delete(o), a(), i("#runs-edit");
        }, children: y("runs.cancel") })
      ] })
    ] }) : /* @__PURE__ */ c.jsx(le, { id: "runs-edit", size: "xs", variant: "light", disabled: e.disabled, onClick: u, children: y("runs.edit") })
  ] }) });
}
let Tx = 0;
function Px(e, t) {
  return Ue(`text-runs-${++Tx}`, e, /* @__PURE__ */ c.jsx(Nx, { ...t }));
}
function Ax({ assets: e, value: t, disabled: n = !1, onChange: o, onUpload: r }) {
  ze();
  const [s, a] = p.useState(null), [i, l] = p.useState(t);
  p.useEffect(() => l(t), [t]);
  const u = e.filter((h) => h.mediaType.startsWith("image/")), f = [
    { value: "", label: y("canvas.backgroundImageNone") },
    ...u.map((h) => ({
      value: h.id,
      label: `${h.path.split("/").at(-1) ?? h.path} (${h.mediaType})`
    }))
  ];
  return /* @__PURE__ */ c.jsxs(me, { gap: "xs", className: "canvas-image-input", children: [
    /* @__PURE__ */ c.jsx(
      Hn,
      {
        id: "canvas-background-image",
        label: y("canvas.backgroundImage"),
        value: i?.asset ?? "",
        data: f,
        disabled: n,
        onChange: (h) => {
          const d = h.currentTarget.value, m = d ? { asset: d, fit: i?.fit ?? "fill" } : null;
          l(m), o(m);
        }
      }
    ),
    /* @__PURE__ */ c.jsx(
      Hn,
      {
        id: "canvas-background-image-fit",
        label: y("canvas.backgroundImageFit"),
        value: i?.fit ?? "fill",
        disabled: n || !i,
        data: [
          { value: "fill", label: y("canvas.imageFitFill") },
          { value: "contain", label: y("canvas.imageFitContain") },
          { value: "cover", label: y("canvas.imageFitCover") }
        ],
        onChange: (h) => {
          if (!i) return;
          const d = { ...i, fit: h.currentTarget.value };
          l(d), o(d);
        }
      }
    ),
    /* @__PURE__ */ c.jsxs(Ne, { align: "end", gap: "xs", children: [
      /* @__PURE__ */ c.jsx(
        Ps,
        {
          id: "canvas-background-upload",
          label: y("canvas.backgroundImageUpload"),
          accept: "image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.svg",
          fileInputProps: { id: "canvas-background-upload-input" },
          value: s,
          onChange: (h) => {
            a(h), h && r(h);
          },
          disabled: n,
          clearable: !0,
          style: { flex: 1 }
        }
      ),
      i ? /* @__PURE__ */ c.jsx(
        le,
        {
          id: "canvas-background-image-clear",
          type: "button",
          variant: "light",
          color: "red",
          disabled: n,
          onClick: () => {
            l(null), o(null);
          },
          children: y("canvas.removeBackgroundImage")
        }
      ) : null
    ] })
  ] });
}
let Ix = 0;
function Mx(e, t) {
  return Ue(
    `canvas-image-${++Ix}`,
    e,
    /* @__PURE__ */ c.jsx(Ax, { ...t })
  );
}
const Dx = [
  { value: "top-left", glyph: "↖", key: "position.topLeft" },
  { value: "top", glyph: "↑", key: "position.top" },
  { value: "top-right", glyph: "↗", key: "position.topRight" },
  { value: "left", glyph: "←", key: "position.left" },
  { value: "center", glyph: "•", key: "canvas.anchorCenter" },
  { value: "right", glyph: "→", key: "position.right" },
  { value: "bottom-left", glyph: "↙", key: "position.bottomLeft" },
  { value: "bottom", glyph: "↓", key: "position.bottom" },
  { value: "bottom-right", glyph: "↘", key: "position.bottomRight" }
];
function Ox({ value: e, disabled: t, onChange: n }) {
  return ze(), /* @__PURE__ */ c.jsx(
    En.Group,
    {
      id: "canvas-anchor-group",
      name: "canvas-anchor",
      value: e,
      onChange: (o) => n(o),
      children: /* @__PURE__ */ c.jsx(us, { cols: 3, className: "canvas-size-anchor-grid", children: Dx.map((o) => /* @__PURE__ */ c.jsx(
        En,
        {
          value: o.value,
          label: /* @__PURE__ */ c.jsx("span", { title: y(o.key), children: o.glyph }),
          "aria-label": y(o.key),
          disabled: t,
          className: "canvas-anchor"
        },
        o.value
      )) })
    }
  );
}
function Lx(e, t, n, o) {
  let r = (i, l) => {
  };
  function s() {
    const [i, l] = p.useState(t), [u, f] = p.useState(n);
    return p.useEffect(() => (r = (h, d) => {
      l(h), f(d);
    }, () => {
      r = () => {
      };
    }), []), /* @__PURE__ */ c.jsx(Ox, { value: i, disabled: u, onChange: o });
  }
  const a = Ue("canvas-anchor-picker", e, /* @__PURE__ */ c.jsx(s, {}));
  return { setState: (i, l) => r(i, l), destroy: a };
}
const mo = (e) => typeof e == "function" ? e() : e;
function $x(e) {
  ze();
  const t = mo(e.label), n = e.title === void 0 ? void 0 : mo(e.title), o = p.useRef(e.value), r = (s) => {
    s !== o.current && (o.current = s, e.onCommit(s));
  };
  return e.options ? /* @__PURE__ */ c.jsx(
    Hn,
    {
      ref: (s) => {
        s && e.onMount?.(s);
      },
      id: e.id,
      label: t,
      "aria-label": t,
      title: n,
      size: e.size,
      defaultValue: e.value,
      disabled: e.disabled,
      data: e.options.map((s) => ({ value: s.value, label: mo(s.label) })),
      classNames: e.className ? { input: e.className } : void 0,
      onChange: (s) => r(s.currentTarget.value)
    }
  ) : e.type === "textarea" ? /* @__PURE__ */ c.jsx(
    Vn,
    {
      ref: (s) => {
        s && e.onMount?.(s);
      },
      id: e.id,
      label: t,
      "aria-label": t,
      title: n,
      size: e.size,
      defaultValue: e.value,
      disabled: e.disabled,
      rows: e.rows,
      maxLength: e.maxLength,
      placeholder: e.placeholder,
      classNames: e.className ? { input: e.className } : void 0,
      onChange: (s) => {
        s.nativeEvent.type === "change" && r(s.currentTarget.value);
      },
      onBlur: (s) => r(s.currentTarget.value),
      onKeyDown: (s) => {
        s.key !== "Enter" || !(s.ctrlKey || s.metaKey) || (s.preventDefault(), r(s.currentTarget.value));
      }
    }
  ) : /* @__PURE__ */ c.jsx(
    tt,
    {
      ref: (s) => {
        s && e.onMount?.(s);
      },
      id: e.id,
      label: t,
      "aria-label": t,
      title: n,
      size: e.size,
      type: e.type ?? "text",
      defaultValue: e.value,
      disabled: e.disabled,
      min: e.min,
      max: e.max,
      step: e.step,
      list: e.list,
      classNames: e.className ? { input: e.className } : void 0,
      onChange: (s) => {
        s.nativeEvent.type === "change" && r(s.currentTarget.value);
      },
      onBlur: (s) => r(s.currentTarget.value),
      onKeyDown: (s) => {
        s.key === "Enter" && (s.preventDefault(), r(s.currentTarget.value));
      }
    }
  );
}
function _x(e) {
  ze();
  const t = mo(e.label), n = e.title === void 0 ? void 0 : mo(e.title);
  return /* @__PURE__ */ c.jsx(
    le,
    {
      ref: (o) => {
        o && e.onMount?.(o);
      },
      id: e.id,
      type: e.type ?? "button",
      className: e.className,
      variant: e.variant ?? "default",
      color: e.color,
      disabled: e.disabled,
      title: n,
      "aria-label": t,
      leftSection: e.icon ? /* @__PURE__ */ c.jsx("i", { className: `ph ${e.icon}`, "aria-hidden": "true" }) : void 0,
      onClick: e.onClick,
      children: /* @__PURE__ */ c.jsx("span", { className: e.iconOnly ? "sr-only" : "toolbar-label", children: t })
    }
  );
}
let sc = 0;
function zx(e) {
  ze();
  const [t, n] = p.useState(e.checked);
  return p.useEffect(() => {
    n(e.checked);
  }, [e.checked]), /* @__PURE__ */ c.jsx(
    Gt,
    {
      id: e.id,
      label: mo(e.label),
      checked: t,
      disabled: e.disabled,
      classNames: e.className ? { input: e.className } : void 0,
      onChange: (o) => {
        n(o.currentTarget.checked), e.onChange(o.currentTarget.checked);
      }
    }
  );
}
function qo(e, t) {
  return Ue(`inspector-checkbox-${++sc}`, e, /* @__PURE__ */ c.jsx(zx, { ...t }));
}
function ut(e, t) {
  return Ue(`inspector-field-${++sc}`, e, /* @__PURE__ */ c.jsx($x, { ...t }));
}
function Qe(e, t) {
  return Ue(`inspector-button-${++sc}`, e, /* @__PURE__ */ c.jsx(_x, { ...t }));
}
function Fx({ state: e, onClose: t }) {
  return ze(), p.useEffect(() => {
    e.open && document.querySelector("#context-menu button[role=menuitem]:not(:disabled)")?.focus();
  }, [e.open, e.items]), /* @__PURE__ */ c.jsx(
    On,
    {
      id: "context-menu",
      className: "context-menu",
      role: "menu",
      tabIndex: -1,
      hidden: !e.open,
      shadow: "md",
      p: "xs",
      style: { position: "fixed", left: e.x, top: e.y, zIndex: 500 },
      onKeyDown: (n) => {
        const o = [...n.currentTarget.querySelectorAll('button[role="menuitem"]:not(:disabled)')];
        if (!o.length) return;
        const r = o.indexOf(document.activeElement);
        let s = r;
        if (n.key === "ArrowDown") s = (r + 1 + o.length) % o.length;
        else if (n.key === "ArrowUp") s = (r - 1 + o.length) % o.length;
        else if (n.key === "Home") s = 0;
        else if (n.key === "End") s = o.length - 1;
        else if (n.key === "Escape") {
          n.preventDefault(), n.stopPropagation(), t();
          return;
        } else return;
        n.preventDefault(), o[s]?.focus();
      },
      children: /* @__PURE__ */ c.jsx(me, { gap: 4, children: e.items.map((n, o) => n.kind === "separator" ? /* @__PURE__ */ c.jsx(Ts, { role: "separator" }, `separator-${o}`) : /* @__PURE__ */ c.jsx(
        le,
        {
          type: "button",
          role: "menuitem",
          className: "context-menu-item",
          variant: "subtle",
          disabled: n.disabled,
          leftSection: /* @__PURE__ */ c.jsx("i", { className: `ph ${n.icon}`, "aria-hidden": "true" }),
          onClick: () => {
            t(), n.run();
          },
          children: y(n.key)
        },
        `${n.key}-${o}`
      )) })
    }
  );
}
function Bx(e) {
  const t = { open: !1, items: [], x: 8, y: 8 };
  let n = t, o = (a) => {
  };
  function r() {
    const [a, i] = p.useState(t);
    return p.useEffect(() => (o = (l) => {
      n = l, i(l);
    }, () => {
      o = () => {
      };
    }), []), /* @__PURE__ */ c.jsx(Fx, { state: a, onClose: () => o({ ...n, open: !1 }) });
  }
  const s = Ue("context-menu", e, /* @__PURE__ */ c.jsx(r, {}));
  return {
    open(a, i, l) {
      const u = { open: !0, items: a, x: Math.min(window.innerWidth - 240, Math.max(8, i)), y: Math.min(window.innerHeight - 400, Math.max(8, l)) };
      n = u, o(u);
    },
    close() {
      o({ ...n, open: !1 });
    },
    isOpen() {
      return n.open;
    },
    destroy: s
  };
}
const Vx = {
  Canvas: "canvas.section",
  Transform: "properties.transform",
  Typography: "properties.typography",
  Image: "properties.image",
  Media: "properties.media",
  Shape: "properties.shape",
  "Clip and mirror": "properties.clipMirror",
  Appearance: "properties.appearance",
  Effects: "properties.effects",
  Presets: "properties.presets",
  Slots: "properties.slots"
}, Hx = {
  Canvas: "ph-frame-corners",
  Transform: "ph-arrows-out-cardinal",
  Typography: "ph-text-aa",
  Image: "ph-image",
  Media: "ph-image",
  Shape: "ph-shapes",
  "Clip and mirror": "ph-crop",
  Appearance: "ph-palette",
  Effects: "ph-magic-wand",
  Presets: "ph-swatches",
  Slots: "ph-brackets-curly"
};
function Ux({ title: e, initiallyOpen: t, bodyElement: n }) {
  ze();
  const [o, r] = p.useState(t ? e : null), s = Vx[e], a = s ? y(s) : e;
  return /* @__PURE__ */ c.jsx(
    Pe,
    {
      value: o,
      onChange: r,
      keepMounted: !0,
      keepMountedMode: "display-none",
      className: "dock-accordion",
      classNames: { item: "dock-section", control: "dock-section-control", panel: "dock-section-panel", content: "dock-section-content" },
      children: /* @__PURE__ */ c.jsxs(Pe.Item, { value: e, children: [
        /* @__PURE__ */ c.jsx(Pe.Control, { children: /* @__PURE__ */ c.jsxs(Ne, { gap: "xs", wrap: "nowrap", children: [
          /* @__PURE__ */ c.jsx("span", { className: "dock-section-icon", children: /* @__PURE__ */ c.jsx("i", { className: `ph ${Hx[e] ?? "ph-sliders-horizontal"}`, "aria-hidden": "true" }) }),
          /* @__PURE__ */ c.jsx(ne, { component: "span", className: "dock-section-heading", children: a })
        ] }) }),
        /* @__PURE__ */ c.jsx(Pe.Panel, { children: /* @__PURE__ */ c.jsx("div", { ref: (i) => {
          i && n.parentElement !== i && i.append(n);
        } }) })
      ] })
    }
  );
}
let Wx = 0;
function qx(e, t, n) {
  const o = document.createElement("div");
  o.className = "dock-section-host", e.append(o);
  const r = document.createElement("div");
  r.className = "dock-section-body";
  const s = `inspector-section-${++Wx}`, a = Ue(
    s,
    o,
    /* @__PURE__ */ c.jsx(Ux, { title: t, initiallyOpen: n, bodyElement: r })
  );
  return {
    body: r,
    destroy() {
      a(), o.remove();
    }
  };
}
function ac(e) {
  return {
    project: e,
    document: null,
    presets: [],
    slots: [],
    selection: [],
    drag: null,
    zoom: null,
    pan: { x: 0, y: 0 },
    editingText: null
  };
}
let C = ac(null);
function ic(e) {
  return {
    state: ac(e),
    scroll: { left: 0, top: 0 },
    layerQuery: "",
    historySnapshot: null,
    activeDock: "layers",
    templateDraft: null,
    thumbnail: null
  };
}
const ge = new ox(), un = new Uw(), qa = /* @__PURE__ */ new Map(), nn = [];
un.onSettled = (e) => {
  nn.push({
    label: e.label,
    ok: e.ok,
    superseded: e.superseded,
    at: performance.now() - e.waitedMs,
    waitedMs: e.waitedMs,
    ranMs: e.ranMs,
    previewSettledAt: null
  }), nn.length > 50 && nn.shift(), fp();
};
function Ka(e, t) {
  ah(e, t);
}
let dp = !1;
un.onActiveChange = (e) => {
  dp = e, e ? (oh("info"), Ka("ph-circle-notch", "save.working")) : rh() !== "error" && Ka("ph-check-circle", "save.allChangesSaved");
};
function Kx() {
  for (let e = nn.length - 1; e >= 0; e--) {
    const t = nn[e];
    if (t && t.previewSettledAt === null) {
      t.previewSettledAt = performance.now();
      break;
    }
  }
  fp();
}
const Yx = new URLSearchParams(window.location.search).has("perf");
window.__assemblashPerf = nn;
function fp() {
  if (!Yx) return;
  let e = document.getElementById("assemblash-perf");
  e || (e = document.createElement("div"), e.id = "assemblash-perf", e.setAttribute(
    "style",
    "position:fixed;bottom:8px;left:8px;z-index:9999;font:11px/1.5 ui-monospace,monospace;background:rgba(0,0,0,.82);color:#eee;padding:6px 9px;border-radius:6px;pointer-events:none;white-space:pre"
  ), document.body.append(e));
  const t = nn[nn.length - 1], n = t && t.previewSettledAt !== null ? `${Math.round(t.previewSettledAt - t.at)}ms` : "…";
  e.textContent = t ? `${t.label}: waited ${t.waitedMs}ms, ran ${t.ranMs ?? "–"}ms, settled ${n}
queue ${un.size}, records ${nn.length}` : "no interactions yet";
}
const cc = "#3366cc";
function Xx(e) {
  return typeof e == "string" ? e : null;
}
const pp = "#111111", hp = 2, Gx = ["rect", "ellipse"];
function Jx(e) {
  const t = e.clip;
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = t.shape;
    if (typeof n == "string") return n;
  }
  return null;
}
function Wl(e) {
  const t = e.clip;
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = t.cornerRadius;
    if (typeof n == "number") return n;
  }
  return 0;
}
function Zx(e) {
  if (e.type !== "image") return null;
  const t = e.crop;
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = t, o = n.x, r = n.y, s = n.width, a = n.height;
    if (typeof o == "number" && typeof r == "number" && typeof s == "number" && typeof a == "number")
      return { x: o, y: r, width: s, height: a };
  }
  return null;
}
function Qx(e) {
  return e.type !== "image" && e.type !== "svg" ? null : (C.document?.assets ?? []).find((t) => t.id === e.asset) ?? null;
}
let wt = null, lc = 0, bn = null, _n = [], Ft = null, or = null;
function Z(e) {
  const t = document.getElementById(e);
  if (!t) throw new Error(`missing element #${e}`);
  return t;
}
function ql(e) {
  const t = document.createElement("span");
  return t.dataset.i18n = e, t.textContent = y(e), t;
}
const Vt = tx();
let rr = "", wr = null, xr = "layers";
const e0 = wx(Z("structure-panel"), {
  document: null,
  selectedIds: [],
  query: rr,
  history: wr,
  dock: xr
}, {
  setQuery(e) {
    rr = e, Tt();
  },
  select(e, t) {
    C.selection = t ? C.selection.includes(e) ? C.selection.filter((n) => n !== e) : [...C.selection, e] : [e], Tt(), pt(), dt(), window.matchMedia("(max-width: 720px)").matches && uc()?.type !== "text" && (N.structure.classList.remove("mobile-open"), N.dockToggle.setAttribute("aria-expanded", "false"));
  },
  toggleVisibility(e) {
    const t = C.document && Ve($e(C.document)).find((n) => n.layer.id === e)?.layer;
    t && se(t.visible === !1 ? "show layer" : "hide layer", { op: "setVisible", id: e, visible: t.visible === !1 });
  },
  toggleLocked(e) {
    const t = C.document && Ve($e(C.document)).find((n) => n.layer.id === e)?.layer;
    t && se(t.locked ? "unlock layer" : "lock layer", { op: "setLocked", id: e, locked: !t.locked });
  },
  rename(e, t) {
    se("rename layer", { op: "rename", id: e, name: t || void 0 });
  },
  reorder(e, t, n) {
    const o = n.at === "root" ? { at: "root", index: n.index } : { at: "in", parent: n.parent, index: n.index };
    se("reorder layer", { op: "reorder", id: e, to: o });
  },
  groupSelection() {
    C.selection.length < 2 || se("group", { op: "group", ids: [...C.selection] });
  },
  deleteSelection() {
    cr();
  },
  undo() {
    N.undo.click();
  },
  redo() {
    N.redo.click();
  },
  showDock(e) {
    Lo(e);
  },
  contextMenu(e, t, n) {
    pt(), dt(), lr(t, n);
  }
}), Cn = Bx(Z("context-menu-root")), N = {
  newProject: Z("new-project"),
  renameProject: Z("rename-project"),
  deleteProject: Z("delete-project"),
  reload: Z("reload"),
  get search() {
    return Z("project-search");
  },
  recents: Z("recents-mount"),
  canvasEmpty: Z("canvas-empty"),
  canvas: Z("canvas"),
  canvasImage: Z("canvas-image"),
  overlay: Z("overlay"),
  structure: Z("structure-panel"),
  layers: Z("layers"),
  layerSearch: Z("layer-search"),
  inspector: Z("inspector"),
  advancedInspector: Z("advanced-inspector"),
  propertiesPanel: Z("properties-panel"),
  propertiesTab: Z("properties-tab"),
  history: Z("history"),
  layersTab: Z("layers-tab"),
  historyTab: Z("history-tab"),
  layersView: Z("layers-view"),
  historyView: Z("history-view"),
  historyShortcut: Z("history-shortcut"),
  statusChromeRoot: Z("status-chrome-root"),
  version: Z("version"),
  selectTool: Z("select-tool"),
  addPanel: Z("add-panel"),
  addPanelTitle: Z("add-panel-title"),
  addPanelClose: Z("add-panel-close"),
  dockToggle: Z("dock-toggle"),
  addText: Z("add-text"),
  addShape: Z("add-shape"),
  addImage: Z("add-image"),
  uploadFeedback: Z("upload-feedback"),
  openTemplates: Z("open-templates"),
  deleteLayer: Z("delete-layer"),
  groupLayers: Z("group-layers"),
  undo: Z("undo"),
  redo: Z("redo"),
  exportButton: Z("export"),
  shutdown: Z("shutdown"),
  emptyCreate: Z("empty-create"),
  agents: Z("agents"),
  positionPopover: Z("position-popover"),
  positionClose: Z("position-close"),
  positionFields: Z("position-fields"),
  contextMenu: Z("context-menu"),
  stageViewport: Z("stage-viewport"),
  canvasControlsRoot: Z("canvas-controls-root"),
  stage: Z("stage"),
  zoomOut: Z("zoom-out"),
  zoomValue: Z("zoom-value"),
  zoomIn: Z("zoom-in"),
  zoom100: Z("zoom-100"),
  get templatesPanel() {
    return Z("templates");
  },
  templatesToggle: Z("templates-toggle"),
  get templatesClose() {
    return Z("templates-close");
  },
  settings: Z("settings"),
  settingsForm: Z("settings-form"),
  settingFollow: Z("setting-follow"),
  settingLanguage: Z("setting-language"),
  settingsFontsOpen: Z("settings-fonts-open"),
  settingUpdateCheck: Z("setting-update-check"),
  updateNote: Z("update-note"),
  canvasHints: Z("canvas-hints")
};
sh(
  N.statusChromeRoot,
  (e) => {
    bp(e);
  },
  (e) => {
    window.localStorage.setItem("assemblash-update-banner-v1", e), hu(null);
  }
);
const qs = cx({
  openProject: (e) => Dp(e),
  search: () => {
    Ie("search", async () => {
      await Er();
    });
  },
  openPageSet: (e) => {
    Je(), Ie("open page set", () => T0(e));
  }
}, document.querySelector(".project-combobox")), t0 = Xw(), mp = Zw();
function Ks(e, t, n, o) {
  t0.request(e, t, n, o);
}
function be(e, t = "info") {
  ih(e, t);
}
const Dn = { families: [], faces: [] }, hn = /* @__PURE__ */ new Map();
let Kl = "";
async function Ie(e, t) {
  await un.enqueue({ label: e, coalesceKey: null, run: t, onError: (n) => sn(e, n) });
}
const n0 = {
  unauthorized: "errors.unauthorized",
  noSuchProject: "errors.noSuchProject",
  projectExists: "errors.projectExists",
  versionConflict: "errors.versionConflict",
  projectLocked: "errors.projectLocked",
  invalidProjectId: "errors.invalidProjectId",
  malformedRequest: "errors.malformedRequest",
  payloadTooLarge: "errors.payloadTooLarge",
  invalidFilename: "errors.invalidFilename",
  unsupportedFontFormat: "errors.unsupportedFontFormat",
  unknownFontFamily: "errors.unknownFontFamily",
  layerNotFound: "errors.layerNotFound",
  invalidExportName: "errors.invalidExportName"
};
function Ys(e) {
  const t = np(e);
  if (t) return t;
  const n = n0[e.code];
  return n ? y(n) : `${e.message} (${e.code})`;
}
function sn(e, t) {
  Ka("ph-warning-circle", "save.needsAttention"), t instanceof Be ? be(Ys(t), "error") : be(y("errors.unexpected", { message: String(t) }), "error");
}
Z("add-template-section").append(Z("templates-mantine-mount"));
const _t = dx({
  project: () => C.project,
  document: () => C.document,
  say: be,
  guard: Ie,
  refresh: () => He()
}), wo = Hw({
  project: () => C.project,
  document: () => C.document,
  say: be,
  guard: Ie,
  refresh: () => He(),
  fontsChanged: (e) => {
    Dn.families = [...e.families], Dn.faces = [...e.faces], dt();
  }
}, Z("fonts-mantine-mount")), o0 = Ew({
  project: () => C.project,
  document: () => C.document,
  pageSet: () => {
    const e = ge.active?.group;
    return e ? { set: e.set, count: e.count } : null;
  },
  say: be,
  guard: Ie
}), r0 = Kw({
  create: async (e, t, n, o) => {
    let r = !1;
    return await Ie("create", async () => {
      await Pb(e, t, n, o, e), await Er(e), be(y("projects.created", { id: e })), r = !0;
    }), r;
  }
}), gp = yw({ say: be });
N.agents.addEventListener("click", () => {
  Vt.isOpen() && Vt.close();
}, { capture: !0 });
const vp = "assemblash-follow-v1";
function Ya() {
  return window.localStorage.getItem(vp) !== "off";
}
function s0(e = "settings-agents") {
  N.settingFollow.checked = Ya();
  const t = ui(), n = t === "pseudo" ? "en" : t;
  N.settingLanguage.value = n, Vt.open(e, { follow: Ya(), language: n });
}
N.settings.addEventListener("click", () => s0());
N.settingLanguage.value = ui();
N.settingLanguage.addEventListener("change", () => {
  ph(N.settingLanguage.value);
});
nh(() => {
  for (const t of document.querySelectorAll("[data-effect-action]")) {
    const n = t.dataset.effectAction, o = y(n, { effect: t.dataset.effectType ?? "" });
    t.title = o;
    const r = t.querySelector(".sr-only");
    r && (r.textContent = o);
  }
  for (const t of document.querySelectorAll("[data-paint-label-key]")) {
    const n = y(t.dataset.paintLabelKey).toLowerCase();
    t.title = t instanceof HTMLInputElement ? y("canvas.noColor", { label: n }) : y("canvas.removeColor", { label: n });
  }
  for (const t of document.querySelectorAll("[data-resize-handle]"))
    t.setAttribute("aria-label", y("canvas.resizeHandle", { handle: t.dataset.resizeHandle ?? "" }));
  for (const t of document.querySelectorAll("[data-slot-name]"))
    t.title = y("slots.editHint", { name: t.dataset.slotName ?? "" });
  const e = N.canvasImage.dataset.previewName;
  e && (N.canvasImage.alt = y("canvas.previewAlt", { name: e })), C.document && (N.version.textContent = je(Oe(C.document)), li(
    `${je(Math.round(C.document.canvas.width))} × ${je(Math.round(C.document.canvas.height))}`
  ), Mo());
});
N.settingFollow.addEventListener("change", () => {
  window.localStorage.setItem(vp, N.settingFollow.checked ? "on" : "off");
});
N.settingsFontsOpen.addEventListener("click", () => {
  Vt.close(), Ie("fonts", () => kc(!0));
});
const a0 = "assemblash-update-banner-v1";
async function yp() {
  let e;
  try {
    e = await Jb();
  } catch {
    return;
  }
  N.settingUpdateCheck.checked = e.consent === "notify", pu(e.consent === null);
  const t = window.localStorage.getItem(a0), n = e.newer && !!e.latest && t !== e.latest;
  hu(n && e.latest ? {
    version: e.latest,
    text: y("updates.versionAvailable", { latest: e.latest, current: e.current }),
    notesUrl: e.notesUrl ?? null
  } : null);
}
async function bp(e) {
  try {
    const t = await Zb(e);
    pu(t.consent === null), N.settingUpdateCheck.checked = t.consent === "notify", be(t.consent === "notify" ? y("updates.checkOn") : y("updates.checkOff"));
  } catch (t) {
    sn(y("updates.saveChoiceFailed"), t), yp();
  }
}
N.settingUpdateCheck.addEventListener("change", () => {
  bp(N.settingUpdateCheck.checked ? "notify" : "off");
});
N.settingsForm.addEventListener("submit", (e) => {
  e.submitter?.value === "cancel" && Vt.close();
});
function uc() {
  if (!C.document || C.selection.length !== 1) return null;
  const e = C.selection[0];
  return Ve($e(C.document)).find(({ layer: t }) => t.id === e)?.layer ?? null;
}
function zt() {
  if (!C.document) return [];
  const e = new Set(C.selection);
  return Ve($e(C.document)).map(({ layer: t }) => t).filter((t) => e.has(t.id));
}
function xo(e, t = !1) {
  const n = es(e);
  if (n && (!t || e.protected || e.readOnly)) return n;
  if (!C.document) return null;
  const o = Ve($e(C.document));
  let r = o.find((s) => s.layer.id === e.id)?.parent;
  for (; r; ) {
    const s = o.find((i) => i.layer.id === r);
    if (!s) break;
    const a = es(s.layer);
    if (a) return a;
    r = s.parent;
  }
  return null;
}
function st(e) {
  return xo(e) === null;
}
function Xa() {
  if (!C.document || C.selection.length === 0) return !1;
  const e = Ve($e(C.document)), t = new Set(C.selection);
  return C.selection.every((n) => {
    const o = e.find((s) => s.layer.id === n);
    if (!o || !st(o.layer) || !hc(e, o.parent) || o.layer.transform.width <= 0 || o.layer.transform.height <= 0) return !1;
    let r = o.parent;
    for (; r; ) {
      if (t.has(r)) return !1;
      r = e.find((s) => s.layer.id === r)?.parent ?? null;
    }
    return !0;
  });
}
function i0(e, t) {
  let n = 0, o = { x: 0, y: 0 };
  const r = () => {
    window.clearTimeout(n), n = 0;
  };
  e.addEventListener("pointerdown", (s) => {
    s.pointerType !== "touch" && s.pointerType !== "pen" || (o = { x: s.clientX, y: s.clientY }, n = window.setTimeout(() => {
      lr(o.x, o.y), navigator.vibrate?.(20);
    }, 550));
  }), e.addEventListener("pointermove", (s) => {
    Math.hypot(s.clientX - o.x, s.clientY - o.y) > 8 && r();
  }), e.addEventListener("pointerup", r), e.addEventListener("pointercancel", r);
}
let Yl = null, Xl;
function c0() {
  !C.project || Yl === C.project || (Yl = C.project, N.canvasHints.hidden = !1, window.clearTimeout(Xl), Xl = window.setTimeout(() => {
    N.canvasHints.hidden = !0;
  }, 5e3));
}
let Ga = 0;
async function He() {
  if (Je(), !C.project) return;
  const e = ++Ga, t = await Io(C.project);
  e !== Ga || !C.project || Xn(t);
}
function Xn(e) {
  const t = C.drag?.mode === "resize" ? C.drag : bn;
  t && (e.id !== C.document?.id || Oe(e) !== t.version) && Je(), C.document = e, C.selection = C.selection.filter(
    (n) => Ve($e(e)).some(({ layer: o }) => o.id === n)
  ), N.version.textContent = je(Oe(e)), N.canvasEmpty.hidden = !0, N.canvas.hidden = !1, N.canvasControlsRoot.hidden = !1, c0(), li(
    `${je(Math.round(e.canvas.width))} × ${je(Math.round(e.canvas.height))}`
  ), C.slots = e.slots ?? [], Ft !== null && Oe(e) !== Ft && Rt(), fc(), Tt(), pt(), dt(), l0().catch((n) => sn("presets", n)), y0().catch((n) => sn("history", n));
}
let Ja = 0;
async function l0() {
  if (!C.project) return;
  const e = ++Ja, t = await rw(C.project);
  e === Ja && (C.presets = t);
}
let Hr = null, zo = null, dc = null;
function fc() {
  if (!C.project || !C.document || (dc = sr(), zo = Oe(C.document), Hr)) return;
  const e = C.project;
  Hr = (async () => {
    try {
      for (; zo !== null; ) {
        const t = zo;
        zo = null;
        const n = await Wn(Qr(e, t, sr())), o = C.document;
        if (C.project !== e || !o || Oe(o) !== t) {
          URL.revokeObjectURL(n);
          continue;
        }
        const r = N.canvasImage.src;
        N.canvasImage.src = n, r.startsWith("blob:") && URL.revokeObjectURL(r), !C.drag && (Ft === null || t >= Ft) && Rt(), N.canvasImage.dataset.previewName = o.name ?? e, N.canvasImage.alt = y("canvas.previewAlt", { name: o.name ?? e }), N.canvas.style.aspectRatio = `${o.canvas.width} / ${o.canvas.height}`, Mo(), Kx();
      }
    } catch (t) {
      sn("preview", t);
    } finally {
      Hr = null, zo !== null && fc();
    }
  })();
}
function pc() {
  !C.document || sr() === dc || fc();
}
function u0() {
  const e = window.getComputedStyle(N.stage), t = (n) => {
    const o = Number.parseFloat(n);
    return Number.isFinite(o) ? Math.max(0, o) : 0;
  };
  return {
    horizontal: t(e.paddingLeft) + t(e.paddingRight),
    vertical: t(e.paddingTop) + t(e.paddingBottom)
  };
}
function wp() {
  if (!C.document) return 1;
  const e = u0(), t = Math.max(1, N.stageViewport.clientWidth - e.horizontal), n = Math.max(1, N.stageViewport.clientHeight - e.vertical);
  return Math.min(
    t / C.document.canvas.width,
    n / C.document.canvas.height,
    1
  );
}
function Xs() {
  return C.zoom ?? wp();
}
function sr() {
  if (!C.document) return 1;
  const e = Math.max(1, window.devicePixelRatio || 1);
  return Math.min(1, Math.max(0.1, Xs() * e));
}
function Tt() {
  e0.setSnapshot({
    document: C.document,
    selectedIds: C.selection,
    query: rr,
    history: wr,
    dock: xr
  });
}
function ar(e, t) {
  let n = { x: 0, y: 0 }, o = t;
  for (; o !== null; ) {
    const r = e.find(({ layer: s }) => s.id === o);
    if (!r || (r.layer.transform.rotation ?? 0) !== 0) return null;
    n = {
      x: n.x + r.layer.transform.x,
      y: n.y + r.layer.transform.y
    }, o = r.parent;
  }
  return n;
}
function hc(e, t) {
  let n = t;
  for (; n; ) {
    const o = e.find((r) => r.layer.id === n);
    if (!o || o.layer.transform.flipHorizontal || o.layer.transform.flipVertical) return null;
    n = o.parent;
  }
  return ar(e, t);
}
function pt() {
  if (N.overlay.replaceChildren(), !C.document) return;
  const { width: e, height: t } = C.document.canvas, n = Ve($e(C.document)), o = n.flatMap(({ layer: l, parent: u }) => {
    const f = hc(n, u);
    return f ? [{
      layer: l,
      x: l.transform.x + f.x,
      y: l.transform.y + f.y,
      width: l.transform.width,
      height: l.transform.height
    }] : [];
  });
  for (const l of o) {
    const u = document.createElement("div");
    u.className = "layer-hitbox", u.dataset.id = l.layer.id, u.style.left = `${l.x / e * 100}%`, u.style.top = `${l.y / t * 100}%`, u.style.width = `${l.width / e * 100}%`, u.style.height = `${l.height / t * 100}%`, u.style.transformOrigin = "center", u.style.transform = `rotate(${l.layer.transform.rotation ?? 0}deg)`, u.addEventListener("pointerdown", (f) => {
      f.shiftKey || f.ctrlKey || f.metaKey ? C.selection = C.selection.includes(l.layer.id) ? C.selection.filter((h) => h !== l.layer.id) : [...C.selection, l.layer.id] : C.selection.includes(l.layer.id) || (C.selection = [l.layer.id]), Tt(), dt(), pt();
    }), u.addEventListener("dblclick", (f) => {
      f.stopPropagation(), l.layer.type === "text" && So(l.layer);
    }), u.addEventListener("contextmenu", (f) => {
      f.preventDefault(), C.selection.includes(l.layer.id) || (C.selection = [l.layer.id]), Tt(), dt(), pt(), lr(f.clientX, f.clientY);
    }), i0(u), N.overlay.append(u);
  }
  const r = o.filter(({ layer: l }) => C.selection.includes(l.id));
  if (r.length === 0) return;
  Ep(r.map(({ layer: l }) => l.id));
  const s = r.length === 1 ? {
    x: r[0].x,
    y: r[0].y,
    width: r[0].width,
    height: r[0].height
  } : oc(r.map((l) => ({
    x: l.x,
    y: l.y,
    width: l.width,
    height: l.height,
    rotation: l.layer.transform.rotation ?? 0
  }))), a = document.createElement("div");
  if (a.className = "handle-box", a.style.left = `${s.x / e * 100}%`, a.style.top = `${s.y / t * 100}%`, a.style.width = `${s.width / e * 100}%`, a.style.height = `${s.height / t * 100}%`, a.style.transformOrigin = "center", r.length === 1 && (a.style.transform = `rotate(${r[0]?.layer.transform.rotation ?? 0}deg)`), a.dataset.ids = C.selection.join(","), a.addEventListener("contextmenu", (l) => {
    l.preventDefault(), l.stopPropagation(), lr(l.clientX, l.clientY);
  }), r.every(({ layer: l }) => st(l))) {
    a.addEventListener("pointerdown", (u) => xa(u, r, s, "move")), a.addEventListener("dblclick", (u) => {
      u.stopPropagation();
      const f = r.length === 1 && r[0]?.layer.type === "text" ? r[0].layer : null;
      f && So(f);
    }), Xa() || (a.title = y("canvas.resizeUnavailable"));
    for (const u of Xa() ? ["nw", "n", "ne", "e", "se", "s", "sw", "w"] : []) {
      const f = document.createElement("button");
      f.type = "button", f.className = `resize-handle handle-${u}`, f.dataset.handle = u, f.dataset.resizeHandle = u, f.setAttribute("aria-label", y("canvas.resizeHandle", { handle: u })), f.title = y("canvas.resizeHelp"), f.setAttribute("aria-description", f.title), f.dataset.i18nAttr = "title:canvas.resizeHelp;aria-description:canvas.resizeHelp", f.addEventListener("pointerdown", (h) => {
        h.stopPropagation(), xa(h, r, s, "resize", u);
      }), a.append(f);
    }
    const l = document.createElement("button");
    l.type = "button", l.className = "rotation-handle", l.setAttribute("aria-label", y("canvas.rotateSelection")), l.dataset.i18nAttr = "aria-label:canvas.rotateSelection", l.innerHTML = '<i class="ph ph-arrow-clockwise" aria-hidden="true"></i>', l.addEventListener("pointerdown", (u) => {
      u.stopPropagation(), xa(u, r, s, "rotate");
    }), a.append(l);
  } else
    a.classList.add("guarded"), a.title = r.map(({ layer: l }) => xo(l)).filter(Boolean).join("; ");
  N.overlay.append(a);
}
function d0(e) {
  if (!C.document) return;
  const t = C.document.canvas, n = document.createElement("form");
  n.id = "canvas-settings", n.className = "canvas-settings", n.setAttribute("aria-label", y("canvas.settingsLabel")), n.innerHTML = [
    '<h2 data-i18n="common.canvas">Canvas</h2>',
    '<div class="property-grid"><div class="field" id="canvas-width-mount"></div><div class="field" id="canvas-height-mount"></div></div>',
    '<div class="canvas-background-field"><span data-i18n="common.background">Background</span><div id="canvas-background-paint"></div></div>',
    '<div id="canvas-background-image-mount"></div>',
    '<div class="canvas-transparent" id="canvas-transparent-mount"></div>',
    '<fieldset class="canvas-anchor-fieldset" aria-describedby="canvas-anchor-hint">',
    '<legend data-i18n="canvas.anchor">Anchor</legend><div class="canvas-size-anchor-grid" id="canvas-size-anchor-grid"></div>',
    '<p id="canvas-anchor-hint" class="hint" data-i18n="canvas.anchorHint">Keep this point fixed when resizing. Layers keep their size.</p></fieldset>',
    '<div id="canvas-apply-mount"></div>'
  ].join("");
  const o = n.querySelector("#canvas-width-mount"), r = n.querySelector("#canvas-height-mount");
  let s = null, a = null, i = null;
  we.push(ut(o, {
    id: "canvas-width",
    label: () => y("canvas.widthPx"),
    value: String(t.width),
    type: "number",
    min: 0,
    step: "any",
    onMount: (R) => {
      s = R, E();
    },
    onCommit: () => {
    }
  })), we.push(ut(r, {
    id: "canvas-height",
    label: () => y("canvas.heightPx"),
    value: String(t.height),
    type: "number",
    min: 0,
    step: "any",
    onMount: (R) => {
      a = R, E();
    },
    onCommit: () => {
    }
  }));
  const l = n.querySelector("#canvas-transparent-mount"), u = n.querySelector("#canvas-size-anchor-grid"), f = n.querySelector(".canvas-anchor-fieldset"), h = n.querySelector("#canvas-apply-mount");
  let d = t.background ?? "#ffffff", m = t.backgroundImage ?? null, g = t.background == null, b = "top-left";
  Ur(
    n.querySelector("#canvas-background-paint"),
    "canvas-background",
    y("common.background"),
    d,
    !1,
    (R) => {
      d = R, g = !1, k(), E();
    }
  );
  const x = () => ({
    id: "canvas-transparent",
    label: () => y("canvas.transparentBackground"),
    checked: g,
    onChange(R) {
      g = R, E();
    }
  });
  let w = qo(l, x());
  we.push(() => w());
  function k() {
    ai(() => {
      w(), w = qo(l, x());
    });
  }
  const S = Lx(u, b, !0, (R) => {
    b = R, E();
  });
  we.push(S.destroy), we.push(Mx(n.querySelector("#canvas-background-image-mount"), {
    assets: C.document.assets ?? [],
    value: m,
    onChange(R) {
      m = R, se(R ? "set canvas background image" : "clear canvas background image", R ? { op: "updateCanvas", backgroundImage: R } : { op: "updateCanvas", clearBackgroundImage: !0 });
    },
    onUpload(R) {
      const P = C.project;
      P && Ie("upload canvas background image", async () => {
        const v = await nc(P, R), T = {
          op: "updateCanvas",
          backgroundImage: { asset: v.asset.id, fit: m?.fit ?? "fill" }
        }, L = await Yn(P, T, v.version);
        be(y("status.editDone", { version: L.version })), L.document ? Xn(L.document) : await He();
      });
    }
  })), we.push(Qe(h, {
    id: "canvas-apply",
    type: "submit",
    label: () => y("canvas.applyChanges"),
    className: "primary",
    disabled: !0,
    onMount: (R) => {
      i = R, E();
    },
    onClick: () => {
    }
  }));
  const j = () => !!(s && a && (Number(s.value) !== t.width || Number(a.value) !== t.height));
  function E() {
    if (!(!s || !a || !i)) {
      for (const R of [s, a])
        R.setCustomValidity(Number.isFinite(R.valueAsNumber) && R.valueAsNumber > 0 ? "" : y("canvas.invalidDimension"));
      f.disabled = !j(), S.setState(b, !j()), i.disabled = !j() && Gl(g ? null : d, t.background ?? null);
    }
  }
  n.addEventListener("input", E), n.addEventListener("change", E), n.addEventListener("submit", (R) => {
    if (R.preventDefault(), E(), !i || i.disabled || !n.reportValidity() || !s || !a) return;
    const P = g ? null : d, v = {
      op: "updateCanvas",
      ...j() ? { width: Number(s.value), height: Number(a.value), anchor: b } : {},
      ...Gl(P, t.background ?? null) ? {} : { background: P }
    };
    i.disabled = !0, se("update canvas", v);
  }), E(), e.append(n);
}
function ir(e, t) {
  const n = qx(
    e,
    t,
    !["Clip and mirror", "Appearance", "Effects", "Presets", "Slots"].includes(t)
  );
  return Sp.push(n.destroy), n.body;
}
const xp = [], we = [], Sp = [];
let wn = 0;
function Ur(e, t, n, o, r, s, a, i, l = !1) {
  we.push(Cx(e, { id: t, label: n, value: o, disabled: r, onCommit: s, className: a, clear: i, compact: l }));
}
function Gl(e, t) {
  return JSON.stringify(e) === JSON.stringify(t);
}
function Jl(e, t) {
  const n = Fw({ store: () => Dn }, (o) => {
    se("change font", { op: "update", id: e.id, fontFamily: o });
  });
  return xp.push(n), n.setFamily(e.fontFamily), n.setDisabled(t), n;
}
let Zl = "";
function f0(e) {
  const t = e.map((n) => n.id).join(",");
  t !== Zl && e.length === 1 && e[0]?.type === "text" && (Lo("properties"), window.matchMedia("(max-width: 720px)").matches && (N.structure.classList.add("mobile-open"), N.dockToggle.setAttribute("aria-expanded", "true"))), Zl = t;
}
function dt() {
  ai(p0);
}
function p0() {
  for (const v of xp.splice(0)) v.destroy();
  for (const v of we.splice(0)) v();
  for (const v of Sp.splice(0)) v();
  Ha(N.inspector), Ha(N.advancedInspector), N.inspector.replaceChildren(), N.advancedInspector.replaceChildren();
  let e = N.advancedInspector;
  const t = (v) => (e = ir(N.advancedInspector, v), e), n = zt(), o = n.length === 1 ? n[0] ?? null : null;
  f0(n);
  const r = n.map((v) => v.id).join(",");
  if (r !== Kl && (hn.clear(), Kl = r), N.deleteLayer.disabled = n.length === 0 || n.some((v) => !st(v)), N.groupLayers.disabled = n.length < 2 || n.some((v) => !st(v)), vc(n), C.document) {
    const v = document.createElement("span");
    v.style.display = "contents", we.push(Qe(v, {
      id: "edit-canvas",
      label: () => y("editor.canvasSizeBackground"),
      icon: "ph-frame-corners",
      className: "toolbar-action",
      onClick() {
        Cn.close(), C.selection = [], Tt(), pt(), dt(), Lo("properties");
      }
    })), N.inspector.append(v);
  }
  if (n.length === 0) {
    const v = document.createElement("div");
    v.className = "inspector-empty", v.innerHTML = '<i class="ph ph-cursor-click" aria-hidden="true"></i><span data-i18n="editor.selectLayerHint">Select a layer to edit it</span>', N.inspector.append(v);
    const T = document.createElement("p");
    if (T.className = "empty-panel-copy", T.dataset.i18n = C.document ? "editor.setCanvasHint" : "editor.openProjectHint", T.textContent = y(C.document ? "editor.setCanvasHint" : "editor.openProjectHint"), e.append(T), C.document) {
      const L = ir(N.advancedInspector, "Canvas");
      d0(L);
    }
    return;
  }
  const s = n.some((v) => !st(v));
  let a = 0;
  const i = (v, T, L, _ = s, z = "toolbar-action", B, M = !1) => {
    const A = document.createElement("span");
    return A.className = "inspector-button-host", A.style.display = "contents", we.push(Qe(A, {
      id: `inspector-action-${++a}`,
      label: () => y(v),
      icon: T,
      className: z,
      iconOnly: M,
      disabled: _,
      onMount(O) {
        O.title = y(v), B?.(O);
      },
      onClick: L
    })), A;
  };
  if (o?.type === "text") {
    const v = document.createElement("label");
    v.className = "toolbar-field toolbar-font", v.append(ql("editor.fontFamily")), v.firstElementChild?.classList.add("sr-only");
    const T = Jl(o, s);
    v.append(T.root), N.inspector.append(v);
    const L = document.createElement("span");
    L.className = "toolbar-field toolbar-number", we.push(ut(L, {
      id: "toolbar-font-size",
      label: () => y("editor.fontSize"),
      value: String(o.fontSize),
      type: "number",
      size: "xs",
      min: 1,
      disabled: s,
      className: "toolbar-font-size",
      onCommit: (B) => {
        se("change font size", {
          op: "update",
          id: o.id,
          fontSize: Number(B)
        });
      }
    })), N.inspector.append(L);
    const _ = document.createElement("div");
    _.className = "toolbar-paint", Ur(
      _,
      "text-color",
      y("editor.textColour"),
      o.color ?? "#000000",
      s,
      (B) => {
        se("change colour", { op: "update", id: o.id, color: B });
      },
      "toolbar-colour",
      void 0,
      !0
    ), N.inspector.append(_);
    for (const [B, M] of [
      ["left", "ph-text-align-left"],
      ["center", "ph-text-align-center"],
      ["right", "ph-text-align-right"],
      ["justify", "ph-text-align-justify"]
    ]) {
      const A = {
        left: "editor.alignLeft",
        center: "editor.alignCenter",
        right: "editor.alignRight",
        justify: "editor.alignJustify"
      }[B], O = i(A, M, () => {
        se(`align text ${B}`, { op: "update", id: o.id, align: B });
      }, s, "icon-button toolbar-icon", ($) => {
        const I = (o.align ?? "left") === B;
        $.dataset.textAlign = B, $.classList.toggle("selected", I), $.setAttribute("aria-pressed", String(I));
      }, !0);
      N.inspector.append(O);
    }
    const z = document.createElement("span");
    z.className = "toolbar-divider", N.inspector.append(z);
  } else {
    const v = document.createElement("span");
    v.className = "selection-label", n.length === 1 ? v.textContent = o?.type ?? y("editor.layerGeneric") : (v.dataset.i18nCount = "editor.layerCount", v.dataset.count = String(n.length), v.textContent = Lt("editor.layerCount", n.length)), N.inspector.append(v);
  }
  const l = n.map((v) => v.id);
  if (N.inspector.append(
    i("editor.centreHorizontally", "ph-align-center-horizontal", () => {
      se("centre horizontally", { op: "centerOnCanvas", ids: l, axis: "horizontal" });
    }),
    i("editor.centreVertically", "ph-align-center-vertical", () => {
      se("centre vertically", { op: "centerOnCanvas", ids: l, axis: "vertical" });
    }),
    i("position.title", "ph-bounding-box", () => qn(), !1, "toolbar-action position-button"),
    i("layers.groupButton", "ph-stack", () => {
      l.length > 1 && se("group", { op: "group", ids: l });
    }, s || l.length < 2),
    i("editor.duplicate", "ph-copy", () => {
      xt("duplicate", l.map((v) => ({ op: "duplicate", id: v })));
    })
  ), !o) {
    const v = document.createElement("p");
    v.className = "empty-panel-copy";
    const T = n.filter((_) => _.type === "text"), L = T.length > 1 && new Set(T.map((_) => _.fontFamily)).size > 1;
    v.dataset.i18n = L ? "properties.mixedFonts" : "editor.selectionCountHint", v.textContent = L ? y("properties.mixedFonts") : y("editor.selectionCountHint", { count: n.length }), e.append(v);
    return;
  }
  const u = xo(o);
  if (u) {
    const v = document.createElement("p");
    v.className = "guarded-note", v.textContent = u, e.append(v);
  }
  const f = (v, T, L, _ = "number", z, B, M = !1) => {
    const A = document.createElement("div");
    A.className = "field", we.push(ut(A, {
      id: B ?? `field-${v.replaceAll(".", "-")}`,
      label: () => y(v),
      value: T,
      type: _,
      className: B,
      disabled: u !== null || M,
      list: z,
      onCommit(O) {
        if (O === T) return;
        const $ = L(O);
        $ && se(`change ${y(v)}`, $);
      }
    })), e.append(A);
  }, h = (v, T, L, _, z, B = !1) => {
    const M = document.createElement("div");
    M.className = "field", we.push(ut(M, {
      id: T,
      label: () => y(v),
      value: L,
      className: T,
      disabled: u !== null || B,
      options: _,
      onCommit: z
    })), e.append(M);
  }, d = (v, T, L, _, z) => {
    const B = document.createElement("div");
    B.className = "field paint-field", Ur(
      B,
      T,
      y(v),
      L,
      u !== null,
      (M) => {
        se(`change ${y(v)}`, _(M));
      },
      T,
      z ? {
        label: y("canvas.none"),
        className: z.className,
        title: y("canvas.removeColor", { label: y(v).toLowerCase() }),
        disabled: z.disabled,
        onClear: z.onClear
      } : void 0
    ), e.append(B);
  };
  if (o.type === "text") {
    e = t("Typography");
    const v = document.createElement("span");
    v.style.display = "contents", we.push(Qe(v, {
      id: "edit-layer-text",
      label: () => y("canvas.editText"),
      icon: "ph-pencil-simple",
      className: "wide-action edit-text-button",
      disabled: u !== null,
      onClick: () => So(o)
    })), e.append(v);
    const T = Dn.families.includes(o.fontFamily), L = document.createElement("div");
    L.className = "current-font-summary";
    const _ = document.createElement("strong");
    _.className = "current-font-family", _.textContent = o.fontFamily;
    const z = document.createElement("span");
    if (z.className = "current-font-face", z.textContent = `${o.fontWeight ?? 400} · ${o.fontStyle ?? "normal"} · ${o.fontSize} px`, L.append(_, z), T) {
      const D = document.createElement("span");
      D.className = "current-font-specimen";
      const F = Dn.faces.find(
        (U) => U.family === o.fontFamily && U.weight === (o.fontWeight ?? 400) && U.style === (o.fontStyle ?? "normal")
      );
      if (F)
        rp(D, F);
      else {
        const U = document.createElement("span");
        U.className = "font-specimen-status", U.textContent = y("fonts.previewUnavailable"), D.append(U);
      }
      L.append(D);
    } else {
      const D = document.createElement("p");
      D.className = "current-font-status", D.dataset.i18n = "properties.fontMissing", D.textContent = y("properties.fontMissing");
      const F = document.createElement("span");
      F.style.display = "contents", we.push(Qe(F, {
        id: "install-fonts",
        label: () => y("fonts.installFonts"),
        className: "small",
        onClick: () => {
          Ie("fonts", () => kc(!0));
        }
      })), L.append(D, F);
    }
    e.append(L);
    const B = document.createElement("label");
    B.className = "field", B.append(ql("properties.font"));
    const M = Jl(o, u !== null);
    B.append(M.root), e.append(B), f("properties.fontSize", String(o.fontSize), (D) => ({ op: "update", id: o.id, fontSize: Number(D) })), f("properties.lineHeight", String(o.lineHeight ?? 1.2), (D) => ({ op: "update", id: o.id, lineHeight: Number(D) })), f("properties.paragraphSpacing", String(o.paragraphSpacing ?? 0), (D) => ({ op: "update", id: o.id, paragraphSpacing: Number(D) }));
    const A = sp(o.fontFamily, Dn.faces);
    if (A.length) {
      const D = o.fontWeight ?? 400, F = o.fontStyle ?? "normal", U = [.../* @__PURE__ */ new Set([
        ...A.filter((q) => q.style === F).map((q) => q.weight),
        D
      ])].sort((q, G) => q - G);
      h(
        "properties.weight",
        "font-weight",
        String(D),
        U.map((q) => ({ value: String(q), label: String(q) })),
        (q) => {
          se("change Weight", { op: "update", id: o.id, fontWeight: Number(q) });
        }
      );
    } else
      f("properties.weight", String(o.fontWeight ?? 400), (D) => ({ op: "update", id: o.id, fontWeight: Number(D) }));
    f("properties.letterSpacing", String(o.letterSpacing ?? 0), (D) => ({ op: "update", id: o.id, letterSpacing: Number(D) }));
    const O = o.fontStyle ?? "normal", $ = o.fontWeight ?? 400, I = A.filter((D) => D.weight === $).map((D) => D.style === "oblique" ? "italic" : D.style), V = A.length ? [.../* @__PURE__ */ new Set([...I, O])] : [O];
    if (h(
      "properties.style",
      "font-style",
      o.fontStyle ?? "normal",
      V.map((D) => ({ value: D, label: D })),
      (D) => {
        se("change font style", { op: "update", id: o.id, fontStyle: D });
      }
    ), h(
      "properties.verticalAlign",
      "vertical-align",
      o.verticalAlign ?? "top",
      ["top", "middle", "bottom"].map((D) => ({ value: D, label: D })),
      (D) => {
        se("change vertical align", { op: "update", id: o.id, verticalAlign: D });
      }
    ), d(
      "properties.colour",
      "text-fill",
      o.color ?? "#000000",
      (D) => ({ op: "update", id: o.id, color: D })
    ), d(
      "properties.strokeColour",
      "text-stroke",
      o.stroke?.color ?? "#000000",
      (D) => ({ op: "update", id: o.id, stroke: { color: D, width: o.stroke?.width ?? 1 } }),
      { className: "text-stroke-none", disabled: !o.stroke, onClear: () => {
        se("clear text stroke", { op: "update", id: o.id, stroke: null });
      } }
    ), f("properties.strokeWidth", String(o.stroke?.width ?? 1), (D) => ({ op: "update", id: o.id, stroke: { color: o.stroke?.color ?? "#000000", width: Number(D) } })), C.project && C.document) {
      const D = tu(C.project, C.document, o), F = document.createElement("div");
      e.append(F), we.push(Px(F, {
        capture: D,
        layer: o,
        drafts: qa,
        disabled: u !== null,
        fonts: { store: () => Dn },
        submit: w0,
        reload: async () => {
          const U = await un.outcome("reload runs", async () => {
            if (C.project !== D.project || C.document?.id !== D.document) throw new Error(y("runs.notSent"));
            const q = await Io(D.project);
            if (C.project !== D.project || C.document?.id !== D.document) throw new Error(y("runs.notSent"));
            const G = Ve($e(q)).find((fe) => fe.layer.id === D.layer)?.layer;
            if (!G || G.type !== "text") throw new Error(y("runs.notSent"));
            qa.set(rc(D), up(tu(D.project, q, G))), Xn(q);
          });
          return U.status === "refused" ? String(U.error) : null;
        }
      }));
    }
  }
  t("Transform");
  const m = document.createElement("div");
  m.className = "property-grid";
  const g = (v, T, L) => {
    const _ = `transform-${v.split(".").at(-1)}`, z = document.createElement("div");
    z.className = "field", we.push(ut(z, {
      id: _,
      label: () => y(v),
      value: T,
      type: "number",
      className: _,
      disabled: u !== null,
      onCommit(B) {
        const M = L(B);
        M && se(`change ${y(v)}`, M);
      }
    })), m.append(z);
  }, b = o.transform;
  if (g("properties.x", String(b.x), (v) => Ql(o, Number(v), b.y)), g("properties.y", String(b.y), (v) => Ql(o, b.x, Number(v))), g("properties.width", String(b.width), (v) => eu(o, Number(v), b.height)), g("properties.height", String(b.height), (v) => eu(o, b.width, Number(v))), g("properties.rotation", String(b.rotation ?? 0), (v) => ({ op: "rotate", id: o.id, degrees: Number(v) })), g("properties.opacity", String(o.opacity ?? 1), (v) => ({ op: "update", id: o.id, opacity: Number(v) })), e.append(m), (o.type === "image" || o.type === "svg") && (e = t("Media"), h(
    "properties.fit",
    "layer-fit",
    o.fit ?? "fill",
    Qb.map((v) => ({ value: v, label: v })),
    (v) => {
      se("change fit", { op: "update", id: o.id, fit: v });
    }
  ), o.type === "image")) {
    const v = Zx(o), T = Qx(o), L = T?.width ?? null, _ = T?.height ?? null, z = typeof L == "number" && L > 0 && typeof _ == "number" && _ > 0, B = document.createElement("p");
    B.className = "hint";
    const M = z ? "canvas.cropAvailableHint" : "canvas.cropUnavailableHint";
    B.dataset.i18n = M, B.textContent = y(M), e.append(B);
    const A = v ?? { x: 0, y: 0, width: L ?? 0, height: _ ?? 0 }, O = (D, F, U, q) => {
      f(D, String(U), (G) => q(Number(G)), "number", void 0, F, !z);
    }, $ = (D) => !Number.isFinite(D.x) || !Number.isFinite(D.y) || !(D.width > 0) || !(D.height > 0) ? null : { op: "update", id: o.id, crop: D };
    O("canvas.cropX", "crop-x", A.x, (D) => $({ ...A, x: D })), O("canvas.cropY", "crop-y", A.y, (D) => $({ ...A, y: D })), O("canvas.cropWidth", "crop-width", A.width, (D) => $({ ...A, width: D })), O("canvas.cropHeight", "crop-height", A.height, (D) => $({ ...A, height: D }));
    const I = document.createElement("div");
    I.className = "field";
    const V = document.createElement("span");
    V.style.display = "contents", we.push(Qe(V, {
      id: "clear-image-crop",
      label: () => y("canvas.clearCrop"),
      title: () => y("canvas.wholeImage"),
      className: "small crop-clear",
      disabled: u !== null || v === null,
      onClick: () => {
        se("clear crop", { op: "update", id: o.id, crop: null });
      }
    })), I.append(V), e.append(I);
  }
  const x = Bb(o);
  if (x) {
    e = t("Generated");
    const v = document.createElement("p");
    if (v.className = "hint", v.dataset.i18n = "generated.inspectorHint", v.textContent = y("generated.inspectorHint"), e.append(v), x.kind === "chart") {
      const _ = typeof x.spec.type == "string" ? x.spec.type : "bar";
      h(
        "generated.chartType",
        "generated-layer-chart-type",
        _,
        Gf.map((z) => ({ value: z, label: y(ip[z]) })),
        (z) => {
          z !== _ && Ie("change chart type", async () => {
            if (!C.project || !C.document) return;
            const B = await jl(
              C.project,
              o.id,
              { chartType: z },
              Oe(C.document)
            );
            be(y("generated.regeneratedVersion", { version: B.version })), await He();
          });
        }
      );
    }
    const T = document.createElement("div");
    T.className = "field";
    const L = document.createElement("span");
    L.style.display = "contents", we.push(Qe(L, {
      id: "generated-layer-replace-spec",
      label: () => y("generated.replaceSpec"),
      title: () => y("generated.replaceSpecTitle"),
      className: "small",
      disabled: u !== null,
      onClick: () => mp.replace(x.kind, x.spec, (_) => $p("replace generated spec", async () => {
        if (!C.project || !C.document || !("spec" in _)) return;
        const z = await jl(
          C.project,
          o.id,
          { spec: _.spec },
          Oe(C.document)
        );
        be(y("generated.regeneratedVersion", { version: z.version })), await He();
      }))
    })), T.append(L), e.append(T);
  }
  if (o.type === "shape") {
    e = t("Shape");
    const v = Jf(o), T = o.stroke?.color ?? pp, L = o.stroke?.width ?? hp, _ = (D, F, U, q, G, fe) => {
      const oe = document.createElement("div");
      oe.className = "field shape-field";
      const te = document.createElement("span");
      te.dataset.i18n = D, te.textContent = y(D);
      const de = document.createElement("span");
      de.className = "shape-paint", Ur(
        de,
        F,
        y(D),
        U,
        u !== null,
        (Y) => {
          se(`change ${y(D)}`, G(Y));
        },
        F,
        {
          label: y("canvas.none"),
          className: `small ${F}-none`,
          title: y("canvas.removeColor", { label: y(D).toLowerCase() }),
          disabled: !q,
          onClear: () => {
            se(`clear ${y(D)}`, fe());
          }
        }
      ), q || (de.title = y("canvas.noColor", { label: y(D).toLowerCase() })), oe.append(te, de), e.append(oe);
    };
    _(
      "properties.fill",
      "shape-fill",
      o.fill ?? cc,
      !!o.fill,
      (D) => ({ op: "update", id: o.id, fill: D }),
      () => ({ op: "update", id: o.id, fill: null })
    ), _(
      "properties.stroke",
      "shape-stroke",
      T,
      !!o.stroke,
      (D) => ({ op: "update", id: o.id, stroke: { color: D, width: L } }),
      () => ({ op: "update", id: o.id, stroke: null })
    ), f(
      "properties.strokeWidth",
      String(L),
      (D) => ({
        op: "update",
        id: o.id,
        stroke: { color: T, width: Number(D) }
      }),
      "number",
      void 0,
      "shape-stroke-width"
    ), v === "rect" && f(
      "properties.cornerRadius",
      String(ew(o)),
      (D) => ({ op: "update", id: o.id, cornerRadius: Number(D) }),
      "number",
      void 0,
      "shape-corner-radius"
    );
    const z = (D, F) => {
      const U = hn.get(F);
      if (!U) return;
      const q = document.createElement("span");
      q.className = `control-error ${F}-note`, q.textContent = U, D.append(q);
    }, B = (D) => (F) => {
      hn.set(
        D,
        F instanceof Be ? Ys(F) : String(F)
      ), dt();
    }, M = document.createElement("div");
    M.className = "field shape-field shape-path";
    const A = o.shape, O = v === "path" && typeof A.d == "string" ? A.d : "";
    we.push(ut(M, {
      id: "shape-path-d",
      label: () => y("canvas.pathData"),
      type: "textarea",
      value: O,
      className: "shape-path-d",
      rows: 3,
      maxLength: 2048,
      disabled: u !== null,
      onCommit: (D) => {
        const F = D.trim();
        !F || F === O || (hn.delete("path-d"), se("set path data", {
          op: "update",
          id: o.id,
          shape: { kind: "path", d: F }
        }, B("path-d")));
      }
    })), z(M, "path-d"), e.append(M);
    const $ = document.createElement("div");
    $.className = "field shape-field shape-dash-row";
    const I = (o.stroke?.dashArray ?? []).join(", ");
    we.push(ut($, {
      id: "shape-dash",
      label: () => y("canvas.dashPattern"),
      type: "text",
      value: I,
      className: "shape-dash",
      placeholder: y("canvas.dashExample"),
      disabled: u !== null,
      onCommit: (D) => {
        const F = D.trim();
        hn.delete("dash");
        const U = F ? F.split(",").map((G) => Number(G.trim())) : [];
        if (U.some((G) => !Number.isFinite(G) || G <= 0)) {
          hn.set("dash", y("canvas.dashPositiveError")), dt();
          return;
        }
        if (U.length > kl) {
          hn.set("dash", y("canvas.dashMaxError", { count: kl })), dt();
          return;
        }
        const q = {
          ...o.stroke ?? { color: T, width: L },
          dashArray: U.length ? U : null
        };
        se("change dash pattern", { op: "update", id: o.id, stroke: q }, B("dash"));
      }
    })), z($, "dash"), e.append($);
    const V = (D, F, U, q) => {
      const G = o.stroke?.[U], fe = typeof G == "string" ? G : null, oe = fe && !q.includes(fe) ? [...q, fe] : [...q];
      h(D, F, fe ?? q[0] ?? "", oe.map((te) => ({ value: te, label: te })), (te) => {
        const de = {
          ...o.stroke ?? { color: T, width: L },
          [U]: te
        };
        se(`change ${y(D).toLowerCase()}`, { op: "update", id: o.id, stroke: de });
      });
    };
    if (V("properties.lineCap", "shape-stroke-cap", "lineCap", ["butt", "round", "square"]), V("properties.lineJoin", "shape-stroke-join", "lineJoin", ["miter", "round", "bevel"]), v === "line") {
      const D = (F, U, q) => {
        const G = A[q], fe = typeof G == "string" && G !== "none" && !["arrow", "circle"].includes(G) ? ["none", "arrow", "circle", G] : ["none", "arrow", "circle"];
        h(
          F,
          U,
          typeof G == "string" ? G : "none",
          fe.map((oe) => ({ value: oe, label: oe })),
          (oe) => {
            se(`change ${y(F).toLowerCase()}`, {
              op: "update",
              id: o.id,
              [q]: oe
            });
          }
        );
      };
      D("properties.markerStart", "shape-marker-start", "markerStart"), D("properties.markerEnd", "shape-marker-end", "markerEnd");
    }
  }
  e = t("Clip and mirror");
  const w = Jx(o), k = [...Gx];
  w && !k.includes(w) && k.push(w), h("properties.clip", "clip-shape", w ?? "none", ["none", ...k].map((v) => ({ value: v, label: v })), (v) => {
    if (v === (w ?? "none")) return;
    const T = v === "none" ? null : v === "rect" ? { shape: "rect", cornerRadius: Wl(o) } : { shape: v };
    se("change clip", { op: "update", id: o.id, clip: T });
  }), w === "rect" && f(
    "properties.clipRadius",
    String(Wl(o)),
    (v) => ({
      op: "update",
      id: o.id,
      clip: { shape: "rect", cornerRadius: Number(v) }
    }),
    "number",
    void 0,
    "clip-radius"
  );
  const S = document.createElement("div");
  S.className = "property-flags";
  const j = (v, T, L, _) => {
    const z = document.createElement("div");
    z.className = "field checkbox", we.push(qo(z, {
      id: T,
      label: () => y(v),
      checked: _,
      disabled: u !== null,
      className: T,
      onChange: (B) => {
        se(y(v).toLowerCase(), { op: "update", id: o.id, [L]: B });
      }
    })), S.append(z);
  };
  j("properties.flipHorizontal", "flip-horizontal", "flipHorizontal", o.transform.flipHorizontal ?? !1), j("properties.flipVertical", "flip-vertical", "flipVertical", o.transform.flipVertical ?? !1), e.append(S), e = t("Appearance"), h(
    "properties.blendMode",
    "blend-mode",
    o.blendMode ?? "normal",
    tw.map((v) => ({ value: v, label: v })),
    (v) => {
      se("change blend mode", { op: "update", id: o.id, blendMode: v });
    }
  ), h0(N.advancedInspector, o, u !== null), m0(N.advancedInspector, o, u !== null), g0(N.advancedInspector, o);
  const E = document.createElement("div");
  E.className = "property-flags";
  const R = document.createElement("div");
  R.className = "field checkbox", we.push(qo(R, {
    id: "layer-visible",
    label: () => y("properties.visible"),
    checked: o.visible ?? !0,
    disabled: u !== null,
    onChange: (v) => {
      se("show/hide", { op: "setVisible", id: o.id, visible: v });
    }
  }));
  const P = document.createElement("div");
  P.className = "field checkbox", we.push(qo(P, {
    id: "layer-locked",
    label: () => y("properties.locked"),
    checked: o.locked ?? !1,
    disabled: xo(o, !0) !== null,
    onChange: (v) => {
      se(v ? "lock layer" : "unlock layer", { op: "setLocked", id: o.id, locked: v });
    }
  })), E.append(R, P), e.append(E);
}
function wa(e) {
  return e === "hueRotate" ? y("effects.hueRotate") : e === "invert" ? y("effects.invert") : e.replace(/([A-Z])/g, " $1").replace(/^./, (t) => t.toUpperCase());
}
function h0(e, t, n) {
  const o = t.effects ?? [], r = ir(e, "Effects"), s = (f) => {
    se("effects", { op: "update", id: t.id, effects: f });
  };
  for (const [f, h] of o.entries()) {
    const d = document.createElement("div");
    d.className = "effect-row", d.dataset.effect = h.type;
    const m = document.createElement("span");
    m.className = "effect-name", m.textContent = wa(h.type), (h.type === "hueRotate" || h.type === "invert") && (m.dataset.i18n = `effects.${h.type}`), d.append(m);
    const g = nw(h);
    g.length > 1 && d.classList.add("multi");
    const b = (k) => {
      const S = document.createElement("span");
      S.className = "effect-input-host";
      const j = `effect-${t.id}-${f}-${k.name}`;
      return we.push(ut(S, {
        id: j,
        label: () => `${wa(h.type)} ${k.name === "degrees" ? y("effects.degrees") : h.type === "invert" && k.name === "amount" ? y("effects.amount") : k.name}`,
        value: String(k.value),
        type: k.kind === "color" ? "text" : "number",
        step: k.kind === "number" ? k.name === "degrees" ? "1" : "0.05" : void 0,
        disabled: n,
        onMount: (E) => {
          E.dataset.field = k.name;
        },
        onCommit: (E) => {
          const R = k.kind === "color" ? E.trim() : Number(E);
          typeof R == "number" && !Number.isFinite(R) || R !== k.value && s(o.map((P, v) => v === f ? { ...P, [k.name]: R } : P));
        }
      })), S;
    };
    if (g.length === 1 && g[0])
      d.append(b(g[0]));
    else if (g.length > 1) {
      const k = document.createElement("span");
      k.className = "effect-fields";
      for (const S of g) {
        const j = document.createElement("label");
        j.className = "effect-field";
        const E = document.createElement("span");
        E.textContent = S.name, j.append(E, b(S)), k.append(j);
      }
      d.append(k);
    }
    const x = (k) => {
      const S = [...o], j = S[f], E = S[k];
      !j || !E || (S[f] = E, S[k] = j, s(S));
    }, w = (k, S, j, E, R) => {
      const P = document.createElement("span");
      return P.style.display = "contents", we.push(Qe(P, {
        id: `effect-action-${t.id}-${f}-${k}`,
        className: k,
        label: S,
        title: S,
        icon: j,
        disabled: E,
        onClick: R
      })), P;
    };
    d.append(
      w("small effect-up", y("effects.moveUp", { effect: h.type }), "ph-arrow-up", n || f === 0, () => x(f - 1)),
      w("small effect-down", y("effects.moveDown", { effect: h.type }), "ph-arrow-down", n || f === o.length - 1, () => x(f + 1)),
      w("small effect-remove", y("effects.remove"), "ph-trash", n, () => s(o.filter((k, S) => S !== f)))
    ), r.append(d);
  }
  const a = document.createElement("div");
  a.className = "effect-add-row";
  let i = El[0] ?? "brightness";
  const l = document.createElement("span");
  we.push(ut(l, {
    id: `effect-chooser-${t.id}`,
    label: () => y("effects.choose"),
    value: i,
    className: "effect-chooser",
    disabled: n,
    options: El.map((f) => ({ value: f, label: () => wa(f) })),
    onCommit: (f) => {
      i = f;
    }
  }));
  const u = document.createElement("span");
  u.style.display = "contents", we.push(Qe(u, {
    id: `effect-add-${t.id}`,
    className: "effect-add",
    icon: "ph-plus",
    label: () => y("effects.add"),
    disabled: n,
    onClick: () => {
      const f = N.advancedInspector.querySelector(".effect-chooser");
      f && (i = f.value), s([...o, ow(i)]);
    }
  })), a.append(l, u), r.append(a);
}
function m0(e, t, n) {
  const o = ir(e, "Presets");
  if (C.presets.length === 0) {
    const a = document.createElement("p");
    a.className = "hint", a.dataset.i18n = "presets.none", a.textContent = y("presets.none"), o.append(a);
  }
  for (const a of C.presets) {
    const i = document.createElement("div");
    i.className = "preset-row";
    const l = document.createElement("span");
    l.className = "effect-name", l.textContent = a.name, a.description && (l.title = a.description), i.append(l);
    const u = document.createElement("span");
    u.style.display = "contents", we.push(Qe(u, {
      id: `preset-apply-${++wn}`,
      label: () => y("common.apply"),
      className: "small",
      disabled: n,
      onClick: () => {
        se(`apply ${a.name}`, {
          op: "applyPreset",
          id: t.id,
          preset: a.name
        });
      }
    })), i.append(u);
    const f = document.createElement("span");
    f.style.display = "contents", we.push(Qe(f, {
      id: `preset-remove-${++wn}`,
      label: () => y("common.delete"),
      className: "small",
      onClick: () => {
        se(`delete ${a.name}`, {
          op: "deletePreset",
          name: a.name
        });
      }
    })), i.append(f), o.append(i);
  }
  const r = document.createElement("div");
  r.className = "inspector-add-row";
  const s = document.createElement("span");
  s.style.display = "contents", we.push(Qe(s, {
    id: `preset-save-${++wn}`,
    label: () => y("presets.saveStyle"),
    onClick: () => {
      Ks("presets.saveTitle", "presets.name", "presets.saveButton", (a) => {
        se(`define ${a}`, {
          op: "definePreset",
          preset: { name: a, properties: sw(t) }
        });
      });
    }
  })), r.append(s), o.append(r);
}
function g0(e, t) {
  const n = ir(e, "Slots");
  for (const i of C.slots) {
    const l = document.createElement("div");
    l.className = "slot-row";
    const u = document.createElement("span");
    u.className = "effect-name", u.textContent = `${i.name}${i.required ? " *" : ""}`, u.title = i.description ?? `${i.kind ?? "text"} → ${i.layer}`, i.layer === t.id && u.classList.add("slot-on-this-layer"), l.append(u);
    const f = document.createElement("span");
    f.style.display = "contents", we.push(Qe(f, {
      id: `slot-edit-${++wn}`,
      label: () => y("common.edit"),
      className: "small slot-edit",
      title: () => y("slots.editHint", { name: i.name }),
      onMount(d) {
        d.dataset.slot = i.name, d.dataset.slotName = i.name;
      },
      onClick: () => v0(l, i)
    })), l.append(f);
    const h = document.createElement("span");
    h.style.display = "contents", we.push(Qe(h, {
      id: `slot-remove-${++wn}`,
      label: () => y("common.remove"),
      className: "small",
      onClick: () => {
        se(`remove slot ${i.name}`, {
          op: "removeSlot",
          name: i.name
        });
      }
    })), l.append(h), n.append(l);
  }
  const o = document.createElement("div");
  o.className = "inspector-add-row";
  let r = t.type === "image" ? "image" : "text";
  const s = document.createElement("span");
  s.style.display = "contents", we.push(ut(s, {
    id: `slot-kind-${++wn}`,
    label: () => y("slots.kind"),
    value: r,
    className: "slot-kind-select",
    options: ["text", "image", "color"].map((i) => ({ value: i, label: i })),
    onCommit: (i) => {
      r = i;
    }
  }));
  const a = document.createElement("span");
  a.style.display = "contents", we.push(Qe(a, {
    id: `slot-offer-${++wn}`,
    label: () => y("slots.offer"),
    onClick: () => {
      Ks("slots.createTitle", "slots.name", "slots.createButton", (i) => {
        se(`offer ${i}`, {
          op: "defineSlot",
          slot: { name: i, layer: t.id, kind: r }
        });
      });
    }
  })), o.append(s, a), n.append(o);
}
function v0(e, t) {
  e.replaceChildren();
  const n = document.createElement("span"), o = document.createElement("span"), r = document.createElement("span"), s = document.createElement("span"), a = document.createElement("span");
  for (const u of [n, o, r, s, a]) u.style.display = "contents";
  e.append(n, o, r, s, a);
  const i = ++wn;
  we.push(ut(n, {
    id: `slot-edit-name-${i}`,
    label: () => y("slots.name"),
    value: t.name,
    className: "slot-edit-name",
    onCommit: () => {
    }
  })), we.push(ut(o, {
    id: `slot-edit-kind-${i}`,
    label: () => y("slots.kind"),
    value: t.kind ?? "text",
    className: "slot-edit-kind",
    options: ["text", "image", "color"].map((u) => ({ value: u, label: u })),
    onCommit: () => {
    }
  })), we.push(ut(r, {
    id: `slot-edit-layer-${i}`,
    label: () => y("slots.layerId"),
    title: () => y("slots.layerIdHint"),
    value: t.layer,
    className: "slot-edit-layer",
    onCommit: () => {
    }
  }));
  const l = (u) => {
    if (!u) {
      dt();
      return;
    }
    const f = e.querySelector(".slot-edit-name")?.value.trim() ?? "";
    f && se(`update slot ${t.name}`, {
      op: "updateSlot",
      name: t.name,
      slot: {
        name: f,
        layer: e.querySelector(".slot-edit-layer")?.value.trim() || t.layer,
        kind: e.querySelector(".slot-edit-kind")?.value ?? t.kind ?? "text",
        description: t.description,
        required: t.required ?? !1
      }
    });
  };
  we.push(Qe(s, {
    id: `slot-edit-save-${i}`,
    label: () => y("common.save"),
    className: "small slot-edit-save",
    onClick: () => l(!0)
  })), we.push(Qe(a, {
    id: `slot-edit-cancel-${i}`,
    label: () => y("common.cancel"),
    className: "small",
    onClick: () => l(!1)
  })), e.addEventListener("keydown", (u) => {
    u.key === "Enter" && (u.preventDefault(), l(!0)), u.key === "Escape" && (u.preventDefault(), u.stopPropagation(), l(!1));
  }), e.querySelector(".slot-edit-name")?.focus();
}
let Za = 0;
async function y0() {
  if (!C.project) return;
  const e = ++Za, t = await Lb(C.project);
  e === Za && (wr = { entries: t.entries, position: t.position, head: t.head }, Tt(), N.undo.disabled = t.position === 0, N.redo.disabled = t.position >= t.head);
}
function Ql(e, t, n) {
  const o = t - e.transform.x, r = n - e.transform.y;
  return o === 0 && r === 0 ? null : { op: "move", id: e.id, dx: o, dy: r };
}
function eu(e, t, n) {
  return t === e.transform.width && n === e.transform.height ? null : { op: "resize", id: e.id, width: t, height: n };
}
function b0(e) {
  if (!("id" in e) || e.op !== "update") return null;
  const t = e.id;
  if (typeof t != "string") return null;
  const n = Object.keys(e).filter((o) => o !== "op" && o !== "id" && o !== "expectedVersion").sort();
  return n.length > 0 ? `update:${t}:${n.join(",")}` : null;
}
function Cp(e) {
  if (!C.document) return !1;
  let t = !1;
  for (const n of e)
    if (n.op === "move" || n.op === "resize" || n.op === "rotate") {
      const o = Ve($e(C.document)).find(({ layer: r }) => r.id === n.id)?.layer;
      if (!o) continue;
      n.op === "move" ? (o.transform.x += n.dx, o.transform.y += n.dy) : n.op === "resize" ? (o.transform.width = n.width, o.transform.height = n.height) : o.transform.rotation = n.degrees, t = !0;
    }
  return t && (pt(), ci() && vc(zt())), t;
}
function jp() {
  const e = C.project, t = C.document ? structuredClone(C.document) : null;
  return () => {
    if (!t || C.project !== e) return;
    const n = C.document;
    if (n && Oe(n) === Oe(t)) {
      Rt(), C.document = t, Tt(), pt(), dt();
      return;
    }
    Ie("reload", He);
  };
}
function tu(e, t, n) {
  return { project: e, document: t.id, layer: n.id, version: Oe(t), text: n.text, runs: n.runs ?? [] };
}
async function w0(e) {
  const t = Rx(e);
  if (!t) return { status: "applied" };
  let n = !1;
  const o = await un.outcome("apply runs", async () => {
    const r = e.capture;
    if (C.project !== r.project || C.document?.id !== r.document || C.selection.length !== 1 || C.selection[0] !== r.layer) throw new Error(y("runs.notSent"));
    const s = Ve($e(C.document)).find((l) => l.layer.id === r.layer)?.layer;
    if (!s || xo(s)) throw new Error(y("runs.notSent"));
    const a = await Yn(r.project, t, r.version);
    n = !0;
    const i = a.document ?? await Io(r.project);
    if (C.project !== r.project || C.document?.id !== r.document) throw new Error(y("runs.notSent"));
    qa.delete(rc(r)), Xn(i), be(y("status.editDone", { version: a.version }));
  });
  return o.status === "applied" ? { status: "applied" } : (sn("apply runs", o.error), { status: n ? "committed" : o.error instanceof Be ? "refused" : "unknown", error: n ? y("runs.committed") : o.error instanceof Be ? Ys(o.error) : `${y("runs.failed")} ${String(o.error)}` });
}
async function se(e, t, n) {
  if (!C.project || !C.document) return;
  const o = C.project, r = jp();
  let s = !1;
  Cp([t]), await un.enqueue({
    label: e,
    coalesceKey: b0(t),
    run: async () => {
      if (C.project !== o || !C.document) {
        be(y("status.editNotSent"), "error");
        return;
      }
      const a = await Yn(
        o,
        t,
        Oe(C.document)
      );
      s = !0, be(y("status.editDone", { version: a.version })), a.created?.length && (C.selection = a.created), a.document ? Xn(a.document) : await He();
    },
    onError: (a) => {
      s || r(), n && n(a), sn(e, a);
    },
    onSuperseded: r
  });
}
async function x0(e, t) {
  await xt(e, t);
}
async function xt(e, t, n) {
  if (!C.project || !C.document || t.length === 0) return;
  const o = C.project, r = jp();
  let s = !1;
  Cp(t), await un.enqueue({
    label: e,
    coalesceKey: null,
    run: async () => {
      if (C.project !== o || !C.document || n && !Sr(n)) {
        r(), Rt(), be(y("status.editNotSent"), "error");
        return;
      }
      const a = await $b(
        o,
        e,
        t,
        n?.version ?? Oe(C.document)
      );
      s = !0, a.created?.length && (C.selection = a.created), be(y("status.editDone", { version: a.version })), a.document ? Xn(a.document) : await He();
    },
    onError: (a) => {
      s || r(), sn(e, a);
    }
  });
}
function xa(e, t, n, o, r) {
  if (e.preventDefault(), !C.document || N.canvas.getBoundingClientRect().width === 0 || C.drag && C.drag.pointerId !== e.pointerId || o === "resize" && !Xa()) return;
  Je();
  const s = N.canvas;
  if (C.drag = {
    ids: t.map(({ layer: a }) => a.id),
    mode: o,
    handle: r,
    startX: e.clientX,
    startY: e.clientY,
    pointerId: e.pointerId,
    capture: s,
    project: C.project,
    version: Oe(C.document),
    generation: ++lc,
    shift: e.shiftKey,
    alt: e.altKey,
    epoch: 0,
    bounds: n,
    origins: t.map(({ layer: a, x: i, y: l, width: u, height: f }) => ({
      id: a.id,
      x: a.transform.x,
      y: a.transform.y,
      absoluteX: i,
      absoluteY: l,
      width: u,
      height: f,
      rotation: a.transform.rotation ?? 0,
      layer: structuredClone(a)
    })),
    preserveSelectionScale: o === "resize" && t.length === 1 && t[0]?.layer.type === "text"
  }, !S0(C.drag)) {
    Ft !== null && Rt(), nu(C.drag);
    const a = wt;
    !C.drag.previewActive && a && a.pending.then(() => {
      C.drag && wt === a && nu(C.drag);
    });
  }
  try {
    s.setPointerCapture?.(e.pointerId);
  } catch {
    e.isTrusted && Je();
  }
}
function S0(e) {
  return e.mode !== "move" || !C.document || or === null || Ft !== Oe(C.document) ? !1 : (e.adoptedDelta = or, e.previewActive = !0, gc(e, e.lastDelta?.x ?? 0, e.lastDelta?.y ?? 0), !0);
}
function mc(e) {
  return !C.project || !C.document ? null : `${C.project}:${Oe(C.document)}:${[...e].sort().join(",")}`;
}
function kp() {
  const e = wt;
  if (wt = null, !!e) {
    e.baseUrl && !_n.includes(e.baseUrl) && URL.revokeObjectURL(e.baseUrl), e.selectionUrl && !_n.includes(e.selectionUrl) && URL.revokeObjectURL(e.selectionUrl);
    for (const t of e.items ?? []) _n.includes(t.url) || URL.revokeObjectURL(t.url);
  }
}
async function Ep(e) {
  const t = mc(e);
  if (!t || !C.project || !C.document) return;
  if (wt?.key === t) return wt.pending;
  kp();
  const n = C.project, o = Oe(C.document), r = sr(), s = {
    key: t,
    pending: Promise.resolve()
  };
  return wt = s, s.pending = Promise.all([
    Wn(Qr(n, o, r, { exclude: e })),
    Wn(Qr(n, o, r, { only: e }))
  ]).then(([a, i]) => {
    if (wt !== s) {
      URL.revokeObjectURL(a), URL.revokeObjectURL(i);
      return;
    }
    s.baseUrl = a, s.selectionUrl = i;
  }).catch(() => {
    wt === s && (wt = null);
  }), s.pending;
}
function nu(e) {
  if (e.mode === "resize") {
    as(e);
    return;
  }
  const t = wt;
  if (e.previewActive || t?.key !== mc(e.ids) || !t.baseUrl || !t.selectionUrl) return;
  const n = document.createElement("img");
  n.id = "drag-preview-base", n.className = "drag-preview-image", n.alt = "", n.src = t.baseUrl;
  const o = document.createElement("img");
  o.id = "drag-preview-selection", o.className = "drag-preview-image drag-preview-selection", o.alt = "", o.src = t.selectionUrl, N.overlay.before(n, o), N.canvasImage.classList.add("drag-preview-hidden"), _n = [t.baseUrl, t.selectionUrl], e.previewActive = !0, gc(e, e.lastDelta?.x ?? 0, e.lastDelta?.y ?? 0);
}
function Rt() {
  document.getElementById("drag-preview-base")?.remove(), document.getElementById("drag-preview-selection")?.remove(), document.querySelectorAll("[data-resize-preview-item]").forEach((e) => e.remove()), N.canvasImage.classList.remove("drag-preview-hidden");
  for (const e of _n) URL.revokeObjectURL(e);
  _n = [], Ft = null, or = null, kp();
}
function ss(e) {
  return e.handle?.length === 2 && e.origins.length === 1 && e.origins[0]?.layer.type === "image" ? !e.shift : e.shift;
}
function Sr(e) {
  if (e.cancelled || e.generation !== lc || C.project !== e.project || !C.document || Oe(C.document) !== e.version) return !1;
  const t = Ve($e(C.document));
  return e.ids.every((n) => {
    const o = t.find((r) => r.layer.id === n);
    return o && st(o.layer) && hc(t, o.parent) !== null;
  });
}
function Qa(e) {
  e.capture.hasPointerCapture?.(e.pointerId) && e.capture.releasePointerCapture(e.pointerId);
}
function Je() {
  const e = C.drag?.mode === "resize" ? C.drag : bn;
  e && (e.cancelled = !0, lc += 1, C.drag === e && (C.drag = null), bn = null, Qa(e), Rt(), delete N.canvas.dataset.resizePreview, pt());
}
function Rp(e, t, n) {
  const o = Nw(
    e.bounds,
    e.origins.length === 1 ? e.origins[0].rotation : 0,
    e.handle ?? "se",
    t,
    n,
    { ratio: ss(e), centre: e.alt },
    e.origins
  ), r = e.measurement;
  return o && r?.height !== void 0 && r.width === o.width && r.epoch === e.epoch && !ss(e) && (o.y += (o.height - r.height) / 2, o.height = r.height), o && Object.values(o).every(Number.isFinite) ? o : null;
}
function Np(e, t) {
  return e.origins.map((n) => ({ origin: n, next: e.origins.length === 1 ? t : op(
    { x: n.absoluteX, y: n.absoluteY, width: n.width, height: n.height },
    e.bounds,
    t,
    !0
  ) }));
}
function C0(e, t) {
  const n = e.origins[0];
  if (e.origins.length !== 1 || n?.layer.type !== "text" || ss(e) || e.handle !== "e" && e.handle !== "w" || t.width === e.bounds.width || e.measurement?.width === t.width && e.measurement.epoch === e.epoch) return;
  const o = { width: t.width, epoch: e.epoch, pending: Promise.resolve(), height: void 0 };
  e.measurement = o, o.pending = Qf(e.project, n.id, t.width).then((r) => {
    if (!Sr(e) || e.measurement !== o || e.epoch !== o.epoch || ss(e)) return;
    const s = Math.max(1, Math.ceil(r.height));
    Number.isFinite(s) && (o.height = s, C.drag === e && Gs(e));
  }).catch(() => {
  });
}
function Ho(e) {
  (e.previewActive || Ft !== null || document.querySelector(".drag-preview-image")) && Rt(), e.previewActive = !1, N.canvas.dataset.resizePreview = "handles-only";
}
function as(e) {
  if (!C.document || e.cancelled || !Sr(e)) return;
  const t = e.next, n = Tw(C.document, e.ids), o = t ? Np(e, t) : [], r = o.some(({ origin: u, next: f }) => [
    { x: u.absoluteX, y: u.absoluteY, width: u.width, height: u.height },
    f
  ].some((h) => {
    const d = ts({ ...h, rotation: u.rotation });
    return d.x < 0 || d.y < 0 || d.x + d.width > C.document.canvas.width || d.y + d.height > C.document.canvas.height;
  })), s = N.canvasImage.getBoundingClientRect(), a = s.width === C.document.canvas.width && s.height === C.document.canvas.height;
  if (!t || !n || r || !a) {
    Ho(e);
    return;
  }
  const i = wt;
  if (!i || i.key !== mc(e.ids) || !i.baseUrl) {
    Ho(e), Ep(e.ids).then(() => {
      C.drag === e && as(e);
    });
    return;
  }
  if (!i.items) {
    Ho(e), i.itemsPending ??= (async () => {
      const u = [];
      try {
        for (const f of n) u.push({ id: f.id, url: await Wn(Qr(e.project, e.version, sr(), { only: [f.id] })) });
        if (wt !== i) {
          for (const f of u) URL.revokeObjectURL(f.url);
          return;
        }
        i.items = u, C.drag === e && as(e);
      } catch {
        for (const f of u) URL.revokeObjectURL(f.url);
      }
    })();
    return;
  }
  const l = i.items.map((u) => {
    const f = o.find(({ origin: h }) => h.id === u.id);
    return Pw(
      f.origin.layer,
      { x: f.origin.absoluteX, y: f.origin.absoluteY, width: f.origin.width, height: f.origin.height },
      f.next
    );
  });
  if (l.some((u) => !u)) {
    Ho(e);
    return;
  }
  if (!e.previewActive) {
    const u = document.createElement("img");
    u.id = "drag-preview-base", u.className = "drag-preview-image", u.alt = "", u.src = i.baseUrl, u.style.objectFit = "contain", N.overlay.before(u);
    for (const f of i.items) {
      const h = document.createElement("img");
      h.className = "drag-preview-image drag-preview-selection", h.dataset.resizePreviewItem = f.id, h.alt = "", h.src = f.url, h.style.objectFit = "contain", N.overlay.before(h);
    }
    N.canvasImage.classList.add("drag-preview-hidden"), _n = [i.baseUrl, ...i.items.map((f) => f.url)], e.previewActive = !0;
  }
  for (let u = 0; u < i.items.length; u += 1) {
    const f = document.querySelector(`[data-resize-preview-item="${CSS.escape(i.items[u].id)}"]`), h = l[u];
    f.style.transformOrigin = "0 0", f.style.transform = `matrix(${h[0]},${h[1]},${h[2]},${h[3]},${h[4] * s.width / C.document.canvas.width},${h[5] * s.height / C.document.canvas.height})`;
  }
  N.canvas.dataset.resizePreview = "items";
}
function Gs(e) {
  if (!Sr(e)) {
    Je();
    return;
  }
  const t = Rp(e, e.lastDelta?.x ?? 0, e.lastDelta?.y ?? 0);
  if (e.invalid = t === null, e.next = t ?? void 0, !t) {
    Ho(e);
    return;
  }
  C0(e, t);
  const n = N.overlay.querySelector(".handle-box");
  n && C.document && (n.style.left = `${t.x / C.document.canvas.width * 100}%`, n.style.top = `${t.y / C.document.canvas.height * 100}%`, n.style.width = `${t.width / C.document.canvas.width * 100}%`, n.style.height = `${t.height / C.document.canvas.height * 100}%`), as(e);
}
function gc(e, t, n) {
  if (e.mode === "resize") {
    Gs(e);
    return;
  }
  if (!C.document || !e.previewActive) return;
  const o = document.getElementById("drag-preview-selection");
  if (!o) return;
  const r = C.document.canvas;
  if (o.style.transformOrigin = "0 0", e.mode === "move")
    o.style.transform = `translate(${((e.adoptedDelta?.x ?? 0) + t) / r.width * 100}%, ${((e.adoptedDelta?.y ?? 0) + n) / r.height * 100}%)`;
  else {
    const s = N.canvas.getBoundingClientRect(), a = s.left + (e.bounds.x + e.bounds.width / 2) / r.width * s.width, i = s.top + (e.bounds.y + e.bounds.height / 2) / r.height * s.height, l = Math.atan2(e.startY - i, e.startX - a), u = Math.atan2(e.startY + n / Qt() - i, e.startX + t / Qt() - a);
    o.style.transformOrigin = `${(e.bounds.x + e.bounds.width / 2) / r.width * 100}% ${(e.bounds.y + e.bounds.height / 2) / r.height * 100}%`, o.style.transform = `rotate(${(u - l) * 180 / Math.PI}deg)`;
  }
}
function Qt() {
  const e = N.canvas.getBoundingClientRect();
  return C.document && e.width !== 0 ? C.document.canvas.width / e.width : 1;
}
function Tp(e) {
  const t = C.drag;
  if (t?.mode !== "resize") return !1;
  if (e.key === "Escape")
    return e.preventDefault(), Je(), !0;
  if (e.key !== "Shift" && e.key !== "Alt") return !1;
  const n = e.key === "Shift" ? e.type === "keydown" : e.shiftKey, o = e.key === "Alt" ? e.type === "keydown" : e.altKey;
  return (n !== t.shift || o !== t.alt) && (t.shift = n, t.alt = o, t.epoch += 1, t.measurement = void 0, Gs(t)), !0;
}
window.addEventListener("pointermove", (e) => {
  const t = C.drag;
  if (!t || !C.document || e.pointerId !== t.pointerId) return;
  let n = (e.clientX - t.startX) * Qt(), o = (e.clientY - t.startY) * Qt();
  N.overlay.querySelectorAll(".smart-guide").forEach((s) => s.remove()), t.mode === "move" && ({ dx: n, dy: o } = j0(n, o, t.bounds, t.ids, Qt())), t.mode === "resize" && (t.shift !== e.shiftKey || t.alt !== e.altKey) && (t.shift = e.shiftKey, t.alt = e.altKey, t.epoch += 1, t.measurement = void 0), t.lastDelta = { x: n, y: o }, gc(t, n, o);
  const r = N.overlay.querySelector(".handle-box");
  if (r) {
    if (t.mode === "move")
      r.style.left = `${(t.bounds.x + n) / C.document.canvas.width * 100}%`, r.style.top = `${(t.bounds.y + o) / C.document.canvas.height * 100}%`;
    else if (t.mode === "rotate") {
      const s = N.canvas.getBoundingClientRect(), a = s.left + (t.bounds.x + t.bounds.width / 2) / C.document.canvas.width * s.width, i = s.top + (t.bounds.y + t.bounds.height / 2) / C.document.canvas.height * s.height, l = (Math.atan2(e.clientY - i, e.clientX - a) - Math.atan2(t.startY - i, t.startX - a)) * 180 / Math.PI;
      r.style.transform = `rotate(${(t.origins.length === 1 ? t.origins[0].rotation : 0) + l}deg)`;
    }
  }
});
window.addEventListener("pointerup", async (e) => {
  const t = C.drag;
  if (!t || e.pointerId !== t.pointerId) return;
  if (t.mode === "resize") {
    if ((t.shift !== e.shiftKey || t.alt !== e.altKey) && (t.shift = e.shiftKey, t.alt = e.altKey, t.epoch += 1, t.measurement = void 0), t.lastDelta = { x: (e.clientX - t.startX) * Qt(), y: (e.clientY - t.startY) * Qt() }, Gs(t), C.drag = null, bn = t, Qa(t), await t.measurement?.pending, !Sr(t) || t.invalid) {
      bn === t && Je();
      return;
    }
    const r = Rp(t, t.lastDelta.x, t.lastDelta.y);
    if (!r) {
      Je();
      return;
    }
    if (r.x === t.bounds.x && r.y === t.bounds.y && r.width === t.bounds.width && r.height === t.bounds.height) {
      bn = null, Rt(), pt();
      return;
    }
    const s = [];
    for (const { origin: a, next: i } of Np(t, r)) {
      const l = i.x - a.absoluteX, u = i.y - a.absoluteY;
      (l !== 0 || u !== 0) && s.push({ op: "move", id: a.id, dx: l, dy: u }), (i.width !== a.width || i.height !== a.height) && s.push({ op: "resize", id: a.id, width: i.width, height: i.height });
    }
    if (bn = null, !s.length) {
      Rt(), pt();
      return;
    }
    Ft = t.previewActive ? t.version + 1 : null, or = null, await xt("resize selection", s, t), delete N.canvas.dataset.resizePreview;
    return;
  }
  C.drag = null, Qa(t);
  const n = Math.round(t.lastDelta?.x ?? (e.clientX - t.startX) * Qt()), o = Math.round(t.lastDelta?.y ?? (e.clientY - t.startY) * Qt());
  if (n === 0 && o === 0) {
    Ft === null && Rt();
    return;
  }
  if (Ft = Oe(C.document) + 1, or = t.mode === "move" ? { x: (t.adoptedDelta?.x ?? 0) + n, y: (t.adoptedDelta?.y ?? 0) + o } : null, t.mode === "move")
    xt("move selection", t.ids.map((r) => ({ op: "move", id: r, dx: n, dy: o })));
  else {
    const r = N.canvas.getBoundingClientRect(), s = r.left + (t.bounds.x + t.bounds.width / 2) / C.document.canvas.width * r.width, a = r.top + (t.bounds.y + t.bounds.height / 2) / C.document.canvas.height * r.height, i = (Math.atan2(e.clientY - a, e.clientX - s) - Math.atan2(t.startY - a, t.startX - s)) * 180 / Math.PI;
    xt("rotate selection", t.origins.map((l) => ({ op: "rotate", id: l.id, degrees: Math.round((l.rotation + i) * 10) / 10 })));
  }
});
window.addEventListener("pointercancel", (e) => {
  C.drag?.pointerId === e.pointerId && Je();
});
window.addEventListener("lostpointercapture", (e) => {
  C.drag?.pointerId === e.pointerId && Je();
}, !0);
window.addEventListener("blur", Je);
function j0(e, t, n, o, r) {
  if (!C.document) return { dx: e, dy: t };
  const s = 6 * r, a = Ve($e(C.document));
  let i = n;
  if (o.length === 1) {
    const v = a.find(({ layer: L }) => L.id === o[0]), T = v ? ar(a, v.parent) : null;
    v && T && (i = ts({
      x: v.layer.transform.x + T.x,
      y: v.layer.transform.y + T.y,
      width: v.layer.transform.width,
      height: v.layer.transform.height,
      rotation: v.layer.transform.rotation ?? 0
    }));
  }
  const l = [
    i.x + e,
    i.x + i.width / 2 + e,
    i.x + i.width + e
  ], u = [
    i.y + t,
    i.y + i.height / 2 + t,
    i.y + i.height + t
  ], f = [0, C.document.canvas.width / 2, C.document.canvas.width], h = [0, C.document.canvas.height / 2, C.document.canvas.height], d = [];
  for (const { layer: v, parent: T } of a) {
    if (o.includes(v.id)) continue;
    const L = ar(a, T);
    if (!L) continue;
    const _ = ts({
      x: v.transform.x + L.x,
      y: v.transform.y + L.y,
      width: v.transform.width,
      height: v.transform.height,
      rotation: v.transform.rotation ?? 0
    });
    d.push({
      left: _.x,
      right: _.x + _.width,
      top: _.y,
      bottom: _.y + _.height
    }), f.push(_.x, _.x + _.width / 2, _.x + _.width), h.push(_.y, _.y + _.height / 2, _.y + _.height);
  }
  const m = (v, T) => {
    let L = null;
    for (const _ of v) for (const z of T) {
      const B = z - _;
      Math.abs(B) <= s && (!L || Math.abs(B) < Math.abs(L.delta)) && (L = { delta: B, target: z });
    }
    return L;
  }, g = m(l, f), b = m(u, h);
  g && (e += g.delta, io("vertical", g.target)), b && (t += b.delta, io("horizontal", b.target));
  const x = i.x + e, w = x + i.width, k = d.filter((v) => v.right <= x + s).sort((v, T) => T.right - v.right)[0], S = d.filter((v) => v.left >= w - s).sort((v, T) => v.left - T.left)[0];
  if (k && S) {
    const T = k.right + (S.left - k.right - i.width) / 2 - x;
    Math.abs(T) <= s && (e += T, io("vertical", k.right), io("vertical", S.left));
  }
  const j = i.y + t, E = j + i.height, R = d.filter((v) => v.bottom <= j + s).sort((v, T) => T.bottom - v.bottom)[0], P = d.filter((v) => v.top >= E - s).sort((v, T) => v.top - T.top)[0];
  if (R && P) {
    const T = R.bottom + (P.top - R.bottom - i.height) / 2 - j;
    Math.abs(T) <= s && (t += T, io("horizontal", R.bottom), io("horizontal", P.top));
  }
  return { dx: e, dy: t };
}
function io(e, t) {
  if (!C.document) return;
  const n = document.createElement("div");
  n.className = `smart-guide ${e}`, e === "vertical" ? n.style.left = `${t / C.document.canvas.width * 100}%` : n.style.top = `${t / C.document.canvas.height * 100}%`, N.overlay.append(n);
}
function Cr() {
  if (!C.document) return [];
  const e = Ve($e(C.document));
  return e.flatMap(({ layer: t, parent: n }) => {
    if (!C.selection.includes(t.id)) return [];
    const o = ar(e, n);
    return o ? [{
      layer: t,
      x: t.transform.x + o.x,
      y: t.transform.y + o.y,
      width: t.transform.width,
      height: t.transform.height
    }] : [];
  });
}
function k0(e = Cr()) {
  if (e.length === 0) return null;
  if (e.length === 1) {
    const t = e[0];
    return { x: t.x, y: t.y, width: t.width, height: t.height };
  }
  return oc(e.map((t) => ({
    x: t.x,
    y: t.y,
    width: t.width,
    height: t.height,
    rotation: t.layer.transform.rotation ?? 0
  })));
}
function Pp(e = Cr()) {
  return e.length === 0 ? null : oc(e.map((t) => ({
    x: t.x,
    y: t.y,
    width: t.width,
    height: t.height,
    rotation: t.layer.transform.rotation ?? 0
  })));
}
function Mo() {
  if (!C.document) return;
  const e = wp(), t = C.zoom ?? e;
  N.canvas.style.width = `${Math.max(1, Math.round(C.document.canvas.width * t))}px`, N.canvas.style.height = `${Math.max(1, Math.round(C.document.canvas.height * t))}px`, N.zoomValue.textContent = C.zoom === null ? y("canvas.zoomFit") : `${je(Math.round(t * 100))}%`, N.zoomValue.title = C.zoom === null ? y("canvas.zoomFitPercent", { percent: je(Math.round(e * 100)) }) : y("canvas.zoomResetFit");
}
function E0() {
  const e = N.stageViewport.getBoundingClientRect();
  return {
    x: e.left + N.stageViewport.clientLeft + N.stageViewport.clientWidth / 2,
    y: e.top + N.stageViewport.clientTop + N.stageViewport.clientHeight / 2
  };
}
function jr(e, t = E0()) {
  const n = N.canvas.getBoundingClientRect(), o = n.width > 0 ? (t.x - n.left) / n.width : 0.5, r = n.height > 0 ? (t.y - n.top) / n.height : 0.5;
  if (C.zoom = e === null ? null : Math.min(4, Math.max(0.1, e)), Mo(), pc(), C.zoom === null) {
    N.stageViewport.scrollLeft = 0, N.stageViewport.scrollTop = 0;
    return;
  }
  if (n.width <= 0 || n.height <= 0) return;
  const s = N.canvas.getBoundingClientRect();
  N.stageViewport.scrollLeft += s.left + o * s.width - t.x, N.stageViewport.scrollTop += s.top + r * s.height - t.y;
}
function So(e) {
  if (!C.document || !st(e)) return;
  N.overlay.querySelector(".inline-text-editor")?.remove();
  const t = Ve($e(C.document)), n = t.find(({ layer: i }) => i.id === e.id), o = ar(t, n?.parent ?? null);
  if (!o) return;
  const r = document.createElement("textarea");
  r.className = "inline-text-editor", r.value = e.text, r.setAttribute("aria-label", y("canvas.editText")), r.dataset.i18nAttr = "aria-label:canvas.editText", r.style.left = `${(e.transform.x + o.x) / C.document.canvas.width * 100}%`, r.style.top = `${(e.transform.y + o.y) / C.document.canvas.height * 100}%`, r.style.width = `${e.transform.width / C.document.canvas.width * 100}%`, r.style.height = `${e.transform.height / C.document.canvas.height * 100}%`, r.style.transformOrigin = "center", r.style.transform = `rotate(${e.transform.rotation ?? 0}deg)`, r.style.fontFamily = e.fontFamily, r.style.fontSize = `${Math.max(12, e.fontSize * (N.canvas.getBoundingClientRect().width / C.document.canvas.width))}px`, r.style.lineHeight = String(e.lineHeight ?? 1.2), r.style.textAlign = e.align ?? "left", r.style.color = Xx(e.color) ?? "#000000", N.overlay.append(r), C.editingText = { id: e.id, original: e.text }, r.focus(), r.select();
  let s = !1;
  const a = (i) => {
    if (s) return;
    s = !0;
    const l = r.value;
    r.remove(), C.editingText = null, i && l !== e.text ? se("edit text", { op: "update", id: e.id, text: l }) : pt();
  };
  r.addEventListener("keydown", (i) => {
    i.key === "Escape" ? (i.preventDefault(), a(!1)) : i.key === "Enter" && (i.ctrlKey || i.metaKey) && (i.preventDefault(), a(!0));
  }), r.addEventListener("blur", () => a(!0));
}
function vc(e) {
  ai(() => R0(e));
}
function R0(e) {
  for (const r of Sa) r();
  Sa = [];
  const t = Cr(), n = k0(t);
  if (!n || e.length === 0) return;
  const o = [
    ["X", n.x, "x"],
    ["Y", n.y, "y"],
    ["W", n.width, "width"],
    ["H", n.height, "height"],
    ["°", e.length === 1 ? e[0]?.transform.rotation ?? 0 : 0, "rotation"]
  ];
  for (const [r, s, a] of o) {
    const i = ut(N.positionFields, {
      id: `position-${a}`,
      label: r,
      type: "number",
      value: String(Math.round(s * 10) / 10),
      className: "position-field-input",
      disabled: e.some((l) => !st(l)) || a === "rotation" && e.length > 1,
      onCommit: async (l) => {
        const u = Number(l);
        if (Number.isFinite(u))
          if (a === "x" || a === "y") {
            const f = a === "x" ? u - n.x : 0, h = a === "y" ? u - n.y : 0;
            xt("position selection", e.map((d) => ({ op: "move", id: d.id, dx: f, dy: h })));
          } else if (a === "rotation" && e[0])
            se("rotate layer", { op: "rotate", id: e[0].id, degrees: u });
          else {
            if (a === "width" && e.length === 1 && e[0]?.type === "text" && C.project)
              try {
                const d = await Qf(C.project, e[0].id, u);
                xt("resize text box", [{
                  op: "resize",
                  id: e[0].id,
                  width: Math.max(1, u),
                  height: Math.max(1, Math.ceil(d.height))
                }]);
                return;
              } catch {
              }
            const f = {
              ...n,
              width: a === "width" ? Math.max(1, u) : n.width,
              height: a === "height" ? Math.max(1, u) : n.height
            }, h = [];
            for (const d of t) {
              const m = t.length === 1 ? {
                x: d.x,
                y: d.y,
                width: a === "width" ? f.width : d.width,
                height: a === "height" ? f.height : d.height
              } : op(d, n, f), g = m.x - d.x, b = m.y - d.y;
              (g || b) && h.push({ op: "move", id: d.layer.id, dx: g, dy: b }), h.push({
                op: "resize",
                id: d.layer.id,
                width: m.width,
                height: m.height
              });
            }
            xt("resize selection", h);
          }
      }
    });
    Sa.push(i);
  }
}
let Sa = [];
function qn(e) {
  const t = e ?? !ci();
  if (ch(t), !t) return;
  vc(zt());
  const o = N.inspector.querySelector(".position-button")?.getBoundingClientRect(), r = N.inspector.getBoundingClientRect().left + 8, s = N.structure.getBoundingClientRect().left, a = (o?.right ?? r + 320) - 320;
  N.positionPopover.style.left = `${Math.max(r, Math.min(s - 332, a))}px`, N.positionPopover.style.top = `${Math.min(window.innerHeight - 520, (o?.bottom ?? 100) + 8)}px`, N.positionPopover.querySelector("[data-canvas-anchor]")?.focus();
}
const Ap = "assemblash-layer-clipboard-v1";
function is() {
  if (!C.project || !C.document || C.selection.length === 0) return !1;
  const e = Ve($e(C.document)), t = new Set(C.selection), n = e.filter(({ layer: o, parent: r }) => t.has(o.id) && (!r || !t.has(r))).map(({ layer: o }) => structuredClone(o));
  return sessionStorage.setItem(Ap, JSON.stringify({ project: C.project, layers: n })), be(Lt("editor.copiedLayers", n.length)), n.length > 0;
}
function Ip() {
  if (!C.project) return null;
  try {
    const e = JSON.parse(sessionStorage.getItem(Ap) ?? "null");
    return e?.project === C.project && Array.isArray(e.layers) ? e.layers : null;
  } catch {
    return null;
  }
}
function Mp() {
  const e = Ip();
  if (!e || !C.project) {
    be(y("editor.nothingToPaste"), "error");
    return;
  }
  xt("paste layers", [{
    op: "insertLayerTree",
    sourceProject: C.project,
    layers: e,
    position: { at: "root" },
    offsetX: 20,
    offsetY: 20
  }]);
}
function cr(e = "delete selection") {
  const t = zt();
  t.length === 0 || t.some((n) => !st(n)) || xt(e, t.map((n) => ({ op: "delete", id: n.id })));
}
function Dr(e) {
  if (!C.document || C.selection.length !== 1) return;
  const t = C.selection[0], n = Ve($e(C.document)), o = n.find(({ layer: u }) => u.id === t);
  if (!o || !st(o.layer)) return;
  const r = o.parent ? n.find(({ layer: u }) => u.id === o.parent)?.layer : null, s = r?.type === "group" ? r.children ?? [] : $e(C.document), a = s.findIndex((u) => u.id === t);
  let i = a;
  if (e === "front" && (i = s.length - 1), e === "forward" && (i = Math.min(s.length - 1, a + 1)), e === "backward" && (i = Math.max(0, a - 1)), e === "back" && (i = 0), i === a) return;
  const l = o.parent ? { at: "in", parent: o.parent, index: i } : { at: "root", index: i };
  se(`send ${e}`, { op: "reorder", id: t, to: l });
}
function lr(e, t) {
  const n = zt(), o = n.length > 0 && n.every(st), r = n.length === 1 ? n[0] : null, s = [], a = (l, u, f, h = !1) => {
    s.push({ kind: "item", key: l, icon: u, disabled: h, run: f });
  }, i = () => {
    s.push({ kind: "separator" });
  };
  r?.type === "text" && (a("context.editText", "ph-pencil-simple", () => So(r), !o), i()), a("context.cut", "ph-scissors", () => {
    is() && cr("cut layers");
  }, !o), a("context.copy", "ph-copy", () => {
    is();
  }, n.length === 0), a("context.paste", "ph-clipboard-text", Mp, !Ip()), a("context.duplicate", "ph-copy-simple", () => {
    xt("duplicate", n.map((l) => ({ op: "duplicate", id: l.id })));
  }, !o), a("context.delete", "ph-trash", cr, !o), i(), a("context.bringFront", "ph-arrow-line-up", () => Dr("front"), !r || !o), a("context.bringForward", "ph-arrow-up", () => Dr("forward"), !r || !o), a("context.sendBackward", "ph-arrow-down", () => Dr("backward"), !r || !o), a("context.sendBack", "ph-arrow-line-down", () => Dr("back"), !r || !o), i(), a("context.group", "ph-stack", () => {
    se("group", { op: "group", ids: n.map((l) => l.id) });
  }, n.length < 2 || !o), a("context.ungroup", "ph-stack-minus", () => {
    r && se("ungroup", { op: "ungroup", id: r.id });
  }, r?.type !== "group" || !o), a(r?.locked ? "context.unlock" : "context.lock", r?.locked ? "ph-lock-open" : "ph-lock", () => {
    r && se(r.locked ? "unlock layer" : "lock layer", { op: "setLocked", id: r.id, locked: !r.locked });
  }, !r || xo(r, !0) !== null), a(r?.visible === !1 ? "context.show" : "context.hide", r?.visible === !1 ? "ph-eye" : "ph-eye-slash", () => {
    r && se(r.visible === !1 ? "show layer" : "hide layer", { op: "setVisible", id: r.id, visible: r.visible === !1 });
  }, !r || !o), a("context.rename", "ph-pencil-simple", () => {
    if (!r) return;
    Lo("layers");
    const l = N.layers.querySelector(`[data-id="${CSS.escape(r.id)}"]`);
    l && (l.focus(), l.dispatchEvent(new KeyboardEvent("keydown", { key: "F2", bubbles: !0 })));
  }, !r || !o), i(), a("context.alignLeft", "ph-align-left-simple", () => co("left"), !o), a("context.alignHorizontalCenters", "ph-align-center-horizontal", () => co("centerHorizontal"), !o), a("context.alignRight", "ph-align-right-simple", () => co("right"), !o), a("context.alignTop", "ph-align-top-simple", () => co("top"), !o), a("context.alignVerticalMiddles", "ph-align-center-vertical", () => co("centerVertical"), !o), a("context.alignBottom", "ph-align-bottom-simple", () => co("bottom"), !o), a("context.distributeHorizontally", "ph-columns", () => {
    se("distribute horizontally", { op: "distribute", ids: n.map((l) => l.id), axis: "horizontal" });
  }, !o || n.length < 3), a("context.distributeVertically", "ph-rows", () => {
    se("distribute vertically", { op: "distribute", ids: n.map((l) => l.id), axis: "vertical" });
  }, !o || n.length < 3), Cn.open(s, e, t);
}
function co(e) {
  if (!C.document) return;
  const t = zt(), n = t.map((a) => a.id);
  if (t.length !== 1) {
    se("align selection", { op: "align", ids: n, edge: e });
    return;
  }
  const o = Pp(Cr());
  if (!o) return;
  let r = 0, s = 0;
  e === "left" && (r = -o.x), e === "centerHorizontal" && (r = C.document.canvas.width / 2 - (o.x + o.width / 2)), e === "right" && (r = C.document.canvas.width - (o.x + o.width)), e === "top" && (s = -o.y), e === "centerVertical" && (s = C.document.canvas.height / 2 - (o.y + o.height / 2)), e === "bottom" && (s = C.document.canvas.height - (o.y + o.height)), (r !== 0 || s !== 0) && se("align layer to canvas", { op: "move", id: t[0].id, dx: r, dy: s });
}
function Dp(e) {
  Je(), Ie("open", () => Sc(e));
}
const yc = /* @__PURE__ */ new Map();
function bc(e) {
  return e.record.state.document?.name ?? yc.get(e.id) ?? e.id;
}
const N0 = px({
  activate: (e) => {
    ge.active?.id !== e && (Je(), Ie("switch tab", () => Sc(e)));
  },
  close: (e) => {
    Je(), Ie("close tab", () => P0(e));
  },
  move: (e, t) => {
    ge.move(e, t) && (It(), on());
  }
}, Z("project-tabs-root"));
function It() {
  N0.setTabs(ge.all.map((e) => ({
    id: e.id,
    name: bc(e),
    active: e === ge.active,
    changed: e.changed,
    group: e.group,
    thumbnail: e.group ? e.record.thumbnail : null
  })));
}
function wc(e) {
  e.record.thumbnail && URL.revokeObjectURL(e.record.thumbnail), e.record.thumbnail = null;
}
function xc(e) {
  e.group && Ie("tab thumbnail", async () => {
    if (!(!e.group || !ge.all.includes(e)))
      try {
        const t = await Wn(Yf(e.id));
        if (!e.group || !ge.all.includes(e)) {
          URL.revokeObjectURL(t);
          return;
        }
        wc(e), e.record.thumbnail = t, It();
      } catch (t) {
        console.error(`could not read the thumbnail of ${e.id}`, t);
      }
  });
}
async function T0(e) {
  const n = (await qb(e)).pages.map((s) => s.project), o = ax(n, ge.all.map((s) => s.id));
  if (o.kind === "empty") {
    be(y("pageSets.empty", { set: e }), "error");
    return;
  }
  if (o.kind === "tooMany") {
    be(y("pageSets.tooMany", { set: e, count: o.count, max: o.max }), "error");
    return;
  }
  const r = [];
  try {
    for (const s of o.toOpen) r.push([s, await Io(s)]);
  } catch (s) {
    for (const [a] of r) await Xf(a).catch(() => !1);
    throw s;
  }
  Js();
  for (const [s, a] of r) {
    const { entry: i } = ge.open(s, () => ic(s));
    i.record.state.document = a;
  }
  ge.arrange(o.order), ge.setGroup(e, o.pages), It(), on(), await Co(ge.find(o.pages[0]));
  for (const s of o.pages) {
    const a = ge.find(s);
    a && xc(a);
  }
  be(y("pageSets.opened", { set: e, count: o.pages.length }));
}
function on() {
  Ob(ge.serialize()).catch((e) => {
    console.error("could not save the open tabs", e);
  });
}
function Js() {
  const e = ge.active;
  if (!e) return;
  const t = e.record;
  Je(), t.scroll = { left: N.stageViewport.scrollLeft, top: N.stageViewport.scrollTop }, t.layerQuery = rr, t.historySnapshot = wr, t.activeDock = xr, t.addSection = N.addPanel.classList.contains("collapsed") ? null : jc, t.templateDraft = _t.draft(), C.drag = null, Cn.close(), qn(!1), Rt(), Op(), Ga++, Ja++, Za++, hn.clear(), e.group && xc(e);
}
function Op() {
  const e = N.canvasImage.src;
  N.canvasImage.removeAttribute("src"), delete N.canvasImage.dataset.previewName, e.startsWith("blob:") && URL.revokeObjectURL(e), dc = null;
}
function go(e) {
  ge.activate(e?.id ?? null);
  const t = e?.record;
  if (C = t?.state ?? ac(null), rr = t?.layerQuery ?? "", wr = t?.historySnapshot ?? null, xr = t?.activeDock ?? "layers", qs.setCurrentProject(e?.id ?? null), t && t.addSection !== void 0) {
    if (t.addSection === null) Oo();
    else if (t.addSection !== jc || N.addPanel.classList.contains("collapsed")) {
      const n = ti.find(([o]) => o === t.addSection);
      n && Do(n[0], n[2]);
    }
  }
  It();
}
async function Sc(e) {
  const t = ge.active;
  if (t && t.id === e) {
    C.selection = [], Rt(), await ei();
    return;
  }
  if (Js(), e === null) {
    go(null), Ko(), on();
    return;
  }
  const n = ge.find(e);
  if (n) {
    await Co(n), on();
    return;
  }
  const { entry: o } = ge.open(e, () => ic(e));
  try {
    go(o), await ei();
  } catch (r) {
    throw ge.close(o.id), go(null), t && ge.has(t.id) ? await Co(t).catch(() => Ko()) : Ko(), r;
  }
  It(), on();
}
async function Co(e) {
  go(e);
  const t = e.record;
  if (!C.document) {
    await ei(t.templateDraft);
    return;
  }
  try {
    await He();
  } catch (n) {
    throw Xn(C.document), n;
  }
  Mo(), N.stageViewport.scrollLeft = t.scroll.left, N.stageViewport.scrollTop = t.scroll.top, await _t.projectChanged(t.templateDraft), Cc(), It(), be(y("projects.opened", { name: bc(e) }));
}
async function P0(e) {
  const t = ge.find(e);
  if (!t) return;
  const n = bc(t), o = ge.active === t;
  o && Js();
  const { next: r } = ge.close(e);
  wc(t), It(), on(), o && await Hr?.catch(() => {
  }), await Xf(e), o && (r ? await Co(r) : (go(null), Ko())), be(y("tabs.closed", { name: n }));
}
async function A0(e) {
  const t = ge.find(e);
  if (!t) return;
  const n = ge.active === t;
  n && Js();
  const { next: o } = ge.close(e);
  wc(t), n && (o ? await Co(o) : (go(null), Ko())), It(), on();
}
async function I0(e) {
  let t;
  try {
    t = rx(await Db());
  } catch (o) {
    console.error("could not read the open tabs", o);
    return;
  }
  for (const o of t.projects)
    if (!(!e.has(o) || ge.has(o)))
      try {
        const r = await Io(o), { entry: s } = ge.open(o, () => ic(o));
        s.record.state.document = r;
      } catch (r) {
        console.error(`could not restore the tab of ${o}`, r);
      }
  if (ge.size === 0) return;
  const n = ge.find(t.active) ?? ge.all[0];
  try {
    await Co(n);
  } catch (o) {
    sn("open", o);
  }
  It(), on();
}
function Cc() {
  N.renameProject.disabled = !C.project, N.deleteProject.disabled = !C.project, N.reload.disabled = !C.project;
}
async function ei(e = null) {
  try {
    await He();
  } catch (t) {
    const n = t instanceof Be ? t.details : null, o = n && typeof n.pid == "number" ? n.pid : null;
    if (!(t instanceof Be) || t.code !== "projectLocked" || o === null || !C.project)
      throw t;
    const r = yc.get(C.project) ?? C.project;
    if (!window.confirm(y("projects.recoverLockConfirm", { pid: o, tab: r }))) throw t;
    await Mb(C.project, o), await He(), be(y("projects.recovered"));
  }
  if (await _t.projectChanged(e), Cc(), It(), be(y("projects.opened", { name: C.document?.name ?? C.project ?? "" })), C.project)
    try {
      const t = await Tb(C.project);
      if (t.reclaimedLock) {
        const { pid: n, host: o } = t.reclaimedLock;
        be(
          y("projects.reclaimedLock", { pid: n, host: o })
        );
      }
    } catch (t) {
      console.error("could not check for an automatically reclaimed lock", t);
    }
}
N.reload.addEventListener("click", () => {
  Ie("reload", async () => {
    await He(), be(y("projects.refreshed"));
  });
});
N.newProject.addEventListener("click", () => r0.open());
N.emptyCreate.addEventListener("click", () => N.newProject.click());
N.agents.addEventListener("click", () => {
  gp.open();
});
const ti = [
  ["add-text-section", "toolbar.textButton", N.addText],
  ["add-shape-section", "toolbar.elementsButton", N.addShape],
  ["add-upload-section", "toolbar.uploadsButton", N.addImage],
  ["add-template-section", "toolbar.templatesButton", N.templatesToggle],
  ["add-fonts-section", "toolbar.fontsButton", N.selectTool]
];
function Lp(e) {
  for (const t of [N.selectTool, N.addText, N.addShape, N.addImage, N.templatesToggle]) {
    const n = t === e;
    t.classList.toggle("active", n), t.setAttribute("aria-pressed", String(n));
  }
}
let jc = null;
function Do(e = "add-text-section", t = N.addText) {
  jc = e, e !== "add-fonts-section" && wo.releaseSamples(), N.addPanel.classList.remove("collapsed"), N.structure.classList.remove("mobile-open"), N.dockToggle.setAttribute("aria-expanded", "false"), _t.setOpen(!1);
  const n = ti.find(([r]) => r === e)?.[1] ?? "toolbar.textButton";
  N.addPanelTitle.dataset.i18n = n, N.addPanelTitle.textContent = y(n);
  for (const [r] of ti) {
    const s = document.getElementById(r);
    s && (s.hidden = r !== e);
  }
  const o = e === "add-template-section";
  _t.setOpen(o && _t.isVisible()), N.openTemplates.hidden = o && _t.isVisible(), N.addPanel.scrollTop = 0, Lp(t);
}
function Oo() {
  wo.releaseSamples(), N.addPanel.classList.add("collapsed"), Lp(N.selectTool);
}
N.addPanelClose.addEventListener("click", Oo);
N.addText.addEventListener("click", () => Do("add-text-section", N.addText));
N.addShape.addEventListener("click", () => Do("add-shape-section", N.addShape));
N.addImage.addEventListener("click", () => Do("add-upload-section", N.addImage));
N.templatesToggle.addEventListener("click", () => Do("add-template-section", N.templatesToggle));
async function kc(e = !1) {
  Do("add-fonts-section", N.selectTool), await wo.reload(), e && wo.focusInstall();
}
async function M0(e) {
  const n = (await cw())[0];
  if (!n) {
    be(y("fonts.noneInstalled"), "error"), await kc(!0);
    return;
  }
  if (!C.project || !C.document) return;
  const o = {
    plain: { text: "Add text", fontSize: 24, width: 460, height: 80 },
    heading: { text: "Add a heading", fontSize: 64, width: 600, height: 100 },
    subheading: { text: "Add a subheading", fontSize: 36, width: 520, height: 64 },
    body: { text: "Add body text", fontSize: 22, width: 460, height: 120 }
  }[e], r = {
    x: Math.round((C.document.canvas.width - o.width) / 2),
    y: Math.round((C.document.canvas.height - o.height) / 2),
    width: o.width,
    height: o.height
  }, a = (await Yn(
    C.project,
    {
      op: "create",
      position: { at: "root" },
      transform: r,
      type: "text",
      text: o.text,
      fontFamily: n,
      fontSize: o.fontSize,
      lineHeight: 1.15,
      color: "#101820"
    },
    Oe(C.document)
  )).created?.[0];
  a && (C.selection = [a]);
  const i = { plain: "text.plain", heading: "text.heading", subheading: "text.subheading", body: "text.body" }[e];
  be(y("editor.addedText", { preset: y(i) })), await He();
  const l = uc();
  l?.type === "text" && So(l);
}
async function D0(e) {
  if (!C.project || !C.document) return;
  const t = {
    rect: { width: 320, height: 240 },
    ellipse: { width: 320, height: 240 },
    line: { width: 400, height: 24 }
  }[e], n = {
    x: Math.round((C.document.canvas.width - t.width) / 2),
    y: Math.round((C.document.canvas.height - t.height) / 2),
    width: t.width,
    height: t.height
  }, o = e === "line" ? { stroke: { color: pp, width: hp } } : { fill: cc }, r = e === "rect" ? { kind: "rect", cornerRadius: 0 } : { kind: e }, a = (await Yn(
    C.project,
    {
      op: "create",
      position: { at: "root" },
      transform: n,
      type: "shape",
      shape: r,
      ...o
    },
    Oe(C.document)
  )).created?.[0];
  a && (C.selection = [a]);
  const i = { rect: "shapes.rectangle", ellipse: "shapes.ellipse", line: "shapes.line" }[e];
  be(y("editor.addedShape", { kind: y(i) })), await He();
}
async function O0(e) {
  if (!C.project || !C.document) return;
  const t = 320, n = 240, o = {
    x: Math.round((C.document.canvas.width - t) / 2),
    y: Math.round((C.document.canvas.height - n) / 2),
    width: t,
    height: n
  }, s = (await Yn(
    C.project,
    {
      op: "create",
      position: { at: "root" },
      transform: o,
      type: "shape",
      shape: { kind: "path", d: e },
      fill: cc
    },
    Oe(C.document)
  )).created?.[0];
  s && (C.selection = [s]), be(y("editor.addedPath")), await He();
}
N.addPanel.addEventListener("click", (e) => {
  const t = e.target, o = t.closest("[data-text-preset]")?.dataset.textPreset;
  o && Ie(`add ${o}`, () => M0(o));
  const r = t.closest("[data-shape]")?.dataset.shape;
  (r === "rect" || r === "ellipse" || r === "line") && Ie(`add ${r}`, () => D0(r)), r === "path" && Ks("editor.addPathTitle", "editor.pathDataLabel", "editor.addPathButton", (s) => {
    Ie("add path", () => O0(s));
  });
});
N.undo.addEventListener("click", () => {
  Ie("undo", async () => {
    if (!C.project) return;
    const e = await Vb(C.project);
    be(y("status.undoDone", { version: e.version })), await He();
  });
});
N.redo.addEventListener("click", () => {
  Ie("redo", async () => {
    if (!C.project) return;
    const e = await Hb(C.project);
    be(y("status.redoDone", { version: e.version })), await He();
  });
});
N.exportButton.addEventListener("click", () => o0.open());
uh((e) => ni(
  e,
  e.type === "image/svg+xml" || e.name.toLowerCase().endsWith(".svg") ? "svg" : "image"
));
function $p(e, t) {
  return new Promise((n, o) => {
    un.enqueue({
      label: e,
      coalesceKey: null,
      run: async () => {
        try {
          await t(), n();
        } catch (r) {
          const s = r instanceof Be ? r.code === "malformedRequest" ? r.message : Ys(r) : String(r);
          o(new Error(s));
        }
      },
      onError: (r) => o(r instanceof Error ? r : new Error(String(r)))
    });
  });
}
Z("open-generated").addEventListener("click", () => {
  if (!C.project) {
    be(y("generated.needsProject"), "error");
    return;
  }
  mp.insert((e) => $p("insert generated layer", async () => {
    if (!C.project || !C.document) return;
    const t = await Fb(C.project, e, Oe(C.document));
    C.selection = [t.layer], be(y("generated.addedVersion", { version: t.version })), await He();
  }));
});
function ni(e, t, n) {
  e && Ie(t === "svg" ? "add vector" : "add image", async () => {
    if (!(!C.project || !C.document)) {
      N.uploadFeedback.textContent = y("uploads.uploading", { name: e.name });
      try {
        const o = await nc(C.project, e), r = o.asset.mediaType === "image/svg+xml" || t === "svg", { width: s, height: a } = Rw(
          o.asset,
          C.document.canvas
        ), i = Math.round(n?.x ?? (C.document.canvas.width - s) / 2), l = Math.round(n?.y ?? (C.document.canvas.height - a) / 2), u = r ? {
          op: "create",
          position: { at: "root" },
          transform: { x: i, y: l, width: s, height: a },
          type: "svg",
          asset: o.asset.id
        } : {
          op: "create",
          position: { at: "root" },
          transform: { x: i, y: l, width: s, height: a },
          type: "image",
          asset: o.asset.id,
          fit: "contain"
        }, f = await Yn(
          C.project,
          u,
          o.version
        );
        f.created?.length && (C.selection = f.created), be(y("uploads.addedVersion", { name: e.name, version: f.version })), N.uploadFeedback.textContent = y("uploads.added", { name: e.name }), await He();
      } catch (o) {
        throw N.uploadFeedback.textContent = y("uploads.failed", { name: e.name }), o;
      }
    }
  });
}
for (const e of ["dragenter", "dragover"])
  N.stageViewport.addEventListener(e, (t) => t.preventDefault());
N.stageViewport.addEventListener("drop", (e) => {
  e.preventDefault();
  const t = e.dataTransfer?.files[0];
  if (!t || !C.document) return;
  const n = N.canvas.getBoundingClientRect();
  if (e.clientX < n.left || e.clientX > n.right || e.clientY < n.top || e.clientY > n.bottom) {
    ni(t, t.type === "image/svg+xml" ? "svg" : "image");
    return;
  }
  const o = {
    x: (e.clientX - n.left) / n.width * C.document.canvas.width - 150,
    y: (e.clientY - n.top) / n.height * C.document.canvas.height - 100
  };
  ni(t, t.type === "image/svg+xml" ? "svg" : "image", o);
});
function Lo(e) {
  xr = e, Tt();
}
N.historyShortcut.addEventListener("click", () => Lo("history"));
N.dockToggle.addEventListener("click", () => {
  const e = N.structure.classList.toggle("mobile-open");
  N.dockToggle.setAttribute("aria-expanded", String(e)), e && (Oo(), N.layersTab.focus());
});
N.selectTool.addEventListener("click", () => {
  C.document && (Oo(), _t.setOpen(!1), N.structure.classList.remove("mobile-open"), N.dockToggle.setAttribute("aria-expanded", "false"), N.canvas.focus());
});
N.positionClose.addEventListener("click", () => qn(!1));
N.positionPopover.addEventListener("click", (e) => {
  const t = e.target.closest(
    "[data-canvas-anchor], [data-layout]"
  ), n = t?.dataset.canvasAnchor;
  if (n && !t.disabled && C.selection.length > 0 && C.document) {
    const a = Cr(), i = Pp(a);
    if (!i) return;
    const u = {
      "top-left": { horizontal: "left", vertical: "top" },
      "top-center": { horizontal: "center", vertical: "top" },
      "top-right": { horizontal: "right", vertical: "top" },
      "middle-left": { horizontal: "left", vertical: "middle" },
      center: { horizontal: "center", vertical: "middle" },
      "middle-right": { horizontal: "right", vertical: "middle" },
      "bottom-left": { horizontal: "left", vertical: "bottom" },
      "bottom-center": { horizontal: "center", vertical: "bottom" },
      "bottom-right": { horizontal: "right", vertical: "bottom" }
    }[n];
    if (!u) return;
    const f = [], h = u.horizontal === "left" ? 0 : u.horizontal === "right" ? C.document.canvas.width - i.width : (C.document.canvas.width - i.width) / 2, d = u.vertical === "top" ? 0 : u.vertical === "bottom" ? C.document.canvas.height - i.height : (C.document.canvas.height - i.height) / 2;
    for (const m of zt())
      f.push({ op: "move", id: m.id, dx: h - i.x, dy: d - i.y });
    qn(!1), x0(`place layer ${t.title.toLowerCase()}`, f);
    return;
  }
  const o = t?.dataset.layout;
  if (!o || t.disabled || C.selection.length === 0) return;
  const r = [...C.selection];
  let s = null;
  switch (o) {
    case "center-horizontal":
      s = { op: "centerOnCanvas", ids: r, axis: "horizontal" };
      break;
    case "center-vertical":
      s = { op: "centerOnCanvas", ids: r, axis: "vertical" };
      break;
    case "align-left":
      s = { op: "align", ids: r, edge: "left" };
      break;
    case "align-center-horizontal":
      s = { op: "align", ids: r, edge: "centerHorizontal" };
      break;
    case "align-right":
      s = { op: "align", ids: r, edge: "right" };
      break;
    case "align-top":
      s = { op: "align", ids: r, edge: "top" };
      break;
    case "align-center-vertical":
      s = { op: "align", ids: r, edge: "centerVertical" };
      break;
    case "align-bottom":
      s = { op: "align", ids: r, edge: "bottom" };
      break;
    case "distribute-horizontal":
      s = { op: "distribute", ids: r, axis: "horizontal" };
      break;
    case "distribute-vertical":
      s = { op: "distribute", ids: r, axis: "vertical" };
      break;
  }
  s && (qn(!1), se("arrange layers", s));
});
document.addEventListener("pointerdown", (e) => {
  const t = e.target;
  ci() && !N.positionPopover.contains(t) && !N.inspector.contains(t) && qn(!1), Cn.isOpen() && !N.contextMenu.contains(t) && Cn.close();
});
N.openTemplates.addEventListener("click", () => {
  if (!_t.isVisible()) {
    be(y("editor.noSlotsHint")), Oo(), Lo("properties"), window.matchMedia("(max-width: 1024px)").matches && (N.structure.classList.add("mobile-open"), N.dockToggle.setAttribute("aria-expanded", "true"));
    return;
  }
  _t.setOpen(!0), N.openTemplates.hidden = !0, N.templatesPanel.scrollIntoView({ block: "nearest" });
});
N.templatesClose.addEventListener("click", () => {
  _t.setOpen(!1), N.openTemplates.hidden = !1;
});
N.zoomOut.addEventListener("click", () => jr(Xs() / 1.2));
N.zoomIn.addEventListener("click", () => jr(Xs() * 1.2));
N.zoomValue.addEventListener("click", () => jr(null));
N.zoom100.addEventListener("click", () => jr(1));
N.stageViewport.addEventListener("wheel", (e) => {
  if (!(e.ctrlKey || e.metaKey)) return;
  e.preventDefault();
  const t = e.deltaMode === WheelEvent.DOM_DELTA_LINE ? e.deltaY * 16 : e.deltaMode === WheelEvent.DOM_DELTA_PAGE ? e.deltaY * N.stageViewport.clientHeight : e.deltaY, n = Math.exp(-t * Math.log(1.1) / 100);
  jr(Xs() * n, { x: e.clientX, y: e.clientY });
}, { passive: !1 });
function _p() {
  window.matchMedia("(max-width: 1024px)").matches ? (N.structure.classList.remove("mobile-open"), N.dockToggle.setAttribute("aria-expanded", "false"), wo.releaseSamples(), N.addPanel.classList.add("collapsed")) : (N.structure.classList.remove("mobile-open"), N.dockToggle.setAttribute("aria-expanded", "true"));
}
window.addEventListener("resize", () => {
  C.zoom === null && Mo(), pc(), _p();
});
const L0 = new ResizeObserver(() => {
  C.zoom === null && Mo(), pc();
});
L0.observe(N.stageViewport);
_p();
let kr = !1, Uo = null;
window.addEventListener("keyup", (e) => {
  Tp(e) || e.code === "Space" && (kr = !1, N.stageViewport.classList.remove("pan-ready"));
});
window.addEventListener("blur", () => {
  kr = !1, N.stageViewport.classList.remove("pan-ready"), Uo?.();
});
N.stageViewport.addEventListener("pointerdown", (e) => {
  if (e.button !== 1 && !(kr && e.button === 0)) return;
  e.preventDefault(), e.stopPropagation(), Uo?.();
  const t = { x: e.clientX, y: e.clientY }, n = { x: N.stageViewport.scrollLeft, y: N.stageViewport.scrollTop };
  N.stageViewport.classList.add("panning");
  const o = (a) => {
    a.pointerId === e.pointerId && (N.stageViewport.scrollLeft = n.x - (a.clientX - t.x), N.stageViewport.scrollTop = n.y - (a.clientY - t.y));
  }, r = () => {
    window.removeEventListener("pointermove", o), window.removeEventListener("pointerup", s), window.removeEventListener("pointercancel", s), window.removeEventListener("blur", r), N.stageViewport.classList.remove("panning"), Uo === r && (Uo = null);
  }, s = (a) => {
    a.pointerId === e.pointerId && r();
  };
  Uo = r, window.addEventListener("pointermove", o), window.addEventListener("pointerup", s), window.addEventListener("pointercancel", s), window.addEventListener("blur", r, { once: !0 });
}, { capture: !0 });
N.overlay.addEventListener("pointerdown", (e) => {
  if (kr || e.target !== N.overlay || e.button !== 0 || !C.document) return;
  e.preventDefault();
  const t = N.canvas.getBoundingClientRect(), n = (l) => Math.min(t.right, Math.max(t.left, l)), o = (l) => Math.min(t.bottom, Math.max(t.top, l)), r = { x: n(e.clientX), y: o(e.clientY) }, s = document.createElement("div");
  s.className = "selection-marquee", N.overlay.append(s);
  const a = (l) => {
    const u = n(l.clientX), f = o(l.clientY), h = Math.min(r.x, u), d = Math.min(r.y, f), m = Math.max(r.x, u), g = Math.max(r.y, f);
    s.style.left = `${(h - t.left) / t.width * 100}%`, s.style.top = `${(d - t.top) / t.height * 100}%`, s.style.width = `${(m - h) / t.width * 100}%`, s.style.height = `${(g - d) / t.height * 100}%`;
  }, i = (l) => {
    window.removeEventListener("pointermove", a), window.removeEventListener("pointerup", i);
    const u = n(l.clientX), f = o(l.clientY), h = {
      left: Math.min(r.x, u),
      top: Math.min(r.y, f),
      right: Math.max(r.x, u),
      bottom: Math.max(r.y, f)
    }, d = [...N.overlay.querySelectorAll(".layer-hitbox")].filter((m) => {
      const g = m.getBoundingClientRect();
      return g.right >= h.left && g.left <= h.right && g.bottom >= h.top && g.top <= h.bottom;
    }).map((m) => m.dataset.id).filter((m) => !!m);
    C.selection = e.shiftKey ? [.../* @__PURE__ */ new Set([...C.selection, ...d])] : d, Tt(), dt(), pt();
  };
  window.addEventListener("pointermove", a), window.addEventListener("pointerup", i);
});
function $0(e) {
  const t = e;
  return t ? t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable : !1;
}
window.addEventListener("keydown", (e) => {
  if (Tp(e)) return;
  if (e.key === "Escape" && bn) {
    e.preventDefault(), Je();
    return;
  }
  if ($0(e.target) || e.target instanceof Element && e.target.closest("button[data-text-align]") && (e.key === "Enter" || e.code === "Space")) return;
  const t = e.ctrlKey || e.metaKey;
  if (e.code === "Space") {
    kr = !0, N.stageViewport.classList.add("pan-ready"), e.preventDefault();
    return;
  }
  if (t && e.key.toLowerCase() === "z") {
    e.preventDefault(), (e.shiftKey ? N.redo : N.undo).click();
    return;
  }
  const n = e.key.toLowerCase();
  if (t && n === "c") {
    e.preventDefault(), is();
    return;
  }
  if (t && n === "x") {
    e.preventDefault(), zt().every(st) && is() && cr("cut layers");
    return;
  }
  if (t && n === "v") {
    e.preventDefault(), Mp();
    return;
  }
  if (t && n === "d") {
    e.preventDefault();
    const l = zt();
    l.length && l.every(st) && xt("duplicate", l.map((u) => ({ op: "duplicate", id: u.id })));
    return;
  }
  if (t && n === "g") {
    e.preventDefault();
    const l = zt();
    if (e.shiftKey) {
      const u = l.length === 1 && l[0]?.type === "group" ? l[0] : null;
      u && se("ungroup", { op: "ungroup", id: u.id });
    } else l.length > 1 && l.every(st) && se("group", { op: "group", ids: l.map((u) => u.id) });
    return;
  }
  if (e.key === "F10" && e.shiftKey) {
    e.preventDefault();
    const l = N.canvas.getBoundingClientRect();
    lr(l.left + l.width / 2, l.top + l.height / 2);
    return;
  }
  if (e.key === "Escape") {
    if (Cn.isOpen()) {
      Cn.close(), N.canvas.focus();
      return;
    }
    if (Vt.isOpen()) {
      Vt.close();
      return;
    }
    if (!N.addPanel.classList.contains("collapsed")) {
      e.preventDefault(), Oo();
      return;
    }
    C.selection = [], Cn.close(), qn(!1), Tt(), pt(), dt();
    return;
  }
  const o = uc(), r = zt();
  if ((e.key === "Enter" || e.key === "F2") && o?.type === "text" && st(o)) {
    e.preventDefault(), So(o);
    return;
  }
  if (r.length === 0 || r.some((l) => !st(l))) return;
  if (e.key === "Delete" || e.key === "Backspace") {
    e.preventDefault(), cr();
    return;
  }
  const s = e.shiftKey ? 10 : 1, i = {
    ArrowLeft: [-s, 0],
    ArrowRight: [s, 0],
    ArrowUp: [0, -s],
    ArrowDown: [0, s]
  }[e.key];
  i && (e.preventDefault(), xt("nudge selection", r.map((l) => ({
    op: "move",
    id: l.id,
    dx: i[0],
    dy: i[1]
  }))));
});
function Ko() {
  Je(), li(null), N.canvas.hidden = !0, N.canvasControlsRoot.hidden = !0, N.canvasHints.hidden = !0, Op(), N.canvasEmpty.hidden = !1, Cc(), N.undo.disabled = !0, N.redo.disabled = !0, N.version.textContent = "–", Tt(), pt(), dt();
}
function zp(e, t) {
  Ks("projects.renameTitle", "common.name", "projects.rename", (n) => {
    Ie("rename project", async () => {
      const o = await Ab(e, n);
      be(y("projects.renamed", { oldName: t ?? e, newName: n }));
      const r = ge.find(e);
      r && ge.rename(e, o.project) && (r.record.state.project = o.project, on()), await Er(), r && ge.active === r && (qs.setCurrentProject(o.project), await He()), It();
    });
  });
}
function Fp(e, t) {
  const n = t ?? e, o = y("projects.deleteConfirm", { name: n });
  window.confirm(o) && Ie("delete project", async () => {
    await Ib(e), await A0(e), be(y("projects.deleted", { name: n })), await Er();
  });
}
N.renameProject.addEventListener("click", () => {
  const e = C.project;
  e && (Vt.isOpen() && Vt.close(), zp(e, C.document?.name ?? null));
});
N.deleteProject.addEventListener("click", () => {
  const e = C.project;
  e && (Vt.isOpen() && Vt.close(), Fp(e, C.document?.name ?? null));
});
async function Er(e) {
  e && (N.search.value = "");
  const t = N.search.value.trim(), n = await Kf(t);
  Bp(n, t);
  try {
    qs.setPageSets(await Wb());
  } catch (o) {
    console.error("could not read the page sets", o);
  }
  return e && await Sc(e), await Hp(), n;
}
function Bp(e, t) {
  Ec = Vp(e);
  for (const n of e) n.name && yc.set(n.id, n.name);
  qs.setProjects(e, t, C.project);
}
const _0 = 1500;
let Ec = "";
function Vp(e) {
  return e.map((t) => `${t.id}\0${t.name ?? ""}\0${t.layers}`).join(`
`);
}
let ou = !0;
async function oi() {
  if (ou)
    try {
      const { count: e } = await Gb();
      Rc(e);
    } catch (e) {
      e instanceof Be && e.code.startsWith("http4") && (ou = !1, Rc(null));
    }
}
let en = null;
function z0(e) {
  return e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement || e instanceof HTMLElement && e.isContentEditable;
}
document.addEventListener("input", (e) => {
  e.target !== N.search && z0(e.target) && (en = e.target);
}, !0);
document.addEventListener("change", (e) => {
  e.target === en && (en = null);
}, !0);
document.addEventListener("focusout", (e) => {
  e.target === en && (en = null);
}, !0);
function F0() {
  return en instanceof Node && !en.isConnected && (en = null), en !== null;
}
function ru() {
  return document.visibilityState === "visible" && !dp && !C.drag && !C.editingText && !F0() && !document.body.classList.contains("stopped");
}
let Ca = !1;
async function B0() {
  if (!(Ca || !ru())) {
    if (!Ya()) {
      oi();
      return;
    }
    Ca = !0;
    try {
      const e = N.search.value.trim(), t = await Kf(e);
      if (!ru()) return;
      oi(), Vp(t) !== Ec && document.activeElement !== document.getElementById("project-search") && (Bp(t, e), C.project || Hp().catch(() => {
      })), V0(t);
      const n = C.project, o = t.find((s) => s.id === n), r = C.document;
      if (!n || !o || !r || o.documentId !== r.id || o.version === Oe(r)) return;
      Ie("follow", async () => {
        C.project !== n || C.drag || C.editingText || await He();
      });
    } catch {
    } finally {
      Ca = !1;
    }
  }
}
function V0(e) {
  for (const t of ge.all) {
    if (t === ge.active) continue;
    const n = t.record.state.document, o = e.find((r) => r.id === t.id);
    !n || !o || o.documentId !== n.id || o.version === Oe(n) || Ie("follow tab", async () => {
      if (ge.active === t || !ge.all.includes(t)) return;
      const r = await Io(t.id);
      if (ge.active === t || !ge.all.includes(t)) return;
      const s = t.record;
      s.state.document = r, s.state.selection = s.state.selection.filter(
        (a) => Ve($e(r)).some(({ layer: i }) => i.id === a)
      ), s.historySnapshot = null, ge.markChanged(t.id), It(), xc(t);
    });
  }
}
window.setInterval(() => {
  B0();
}, _0);
let ja = [], ka = 0;
async function Hp() {
  const e = ++ka;
  for (const o of ja) URL.revokeObjectURL(o);
  ja = [];
  const t = await Nb(8);
  if (e !== ka) return;
  const n = await Promise.all(t.map(async (o) => {
    try {
      return { project: o, thumbnail: await Wn(Yf(o.id)) };
    } catch {
      return { project: o, thumbnail: null };
    }
  }));
  if (e !== ka) {
    for (const { thumbnail: o } of n) o && URL.revokeObjectURL(o);
    return;
  }
  ja = n.flatMap(({ thumbnail: o }) => o ? [o] : []), lh(
    N.recents,
    n,
    (o) => Dp(o),
    (o, r) => zp(o, r),
    (o, r) => Fp(o, r)
  );
}
N.shutdown.addEventListener("click", () => {
  window.confirm(y("projects.stopConfirm")) && Ie("stop", async () => {
    await Kb(), N.shutdown.disabled = !0, document.body.classList.add("stopped"), be(y("app.stopped"));
  });
});
Ie("start", async () => {
  const e = await Yb();
  N.shutdown.hidden = !e.canShutdown;
  try {
    await wo.reload();
  } catch {
  }
  const t = await Er();
  await I0(new Set(t.map((n) => n.id))), oi(), yp(), be(y("status.ready", { version: e.version })), !Ec && !N.search.value.trim() && gp.offerOnFirstRun();
});
