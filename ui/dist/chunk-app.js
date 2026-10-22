import { r as d, F as Vf, H as pn, t as To, v as Ft, R as sn, M as Hf, J as Wf, f as se, u as Z, w as xa, y as Uo, K as wa, j as l, B as Q, N as hl, a as Me, c as Oe, o as Pe, z as Vr, d as Gt, b as qo, O as gl, n as kt, x as Po, P as Qn, l as vl, E as Uf, Q as qf, V as Kf, W as Xf, I as Yf, C as Gf, U as eo, X as vn, g as tt, h as $e, Y as Rr, Z as Hr, _ as lo, e as yl, $ as Jf, A as Ro, L as Zf, m as We, i as _e, T as ee, S as ve, k as ue, G as Re, a0 as Qf, a1 as Sa } from "./chunk-mantine-root.js";
import { m as bl, i as xl, c as Wt, u as ze, O as Ca, a as wl, g as uo, b as Sl, S as ja, s as ep, d as tp, e as np, p as ka, f as op, h as Cl, j as rp, k as sp, l as jl, n as zi, o as ap, q as Ea, r as ip } from "./chunk-main.js";
import { a as Ye, u as $t, C as kl, I as St, b as cp, d as lp, c as yt, r as Fi, T as Bi } from "./chunk-Title.js";
import { t as b, formatNumber as ke, formatCount as At, getLocale as Ra, setLocale as up } from "./i18n.js";
function Nr(e, t) {
  return (n) => {
    if (typeof n != "string" || n.trim().length === 0) throw new Error(t);
    return `${e}-${n}`;
  };
}
function Ao(e, t) {
  let n = e;
  for (; (n = n.parentElement) && !n.matches(t); ) ;
  return n;
}
function Vi(e, t, n) {
  for (let o = e - 1; o >= 0; o -= 1) if (!t[o].disabled) return o;
  if (n) {
    for (let o = t.length - 1; o > -1; o -= 1) if (!t[o].disabled) return o;
  }
  return e;
}
function Hi(e, t, n) {
  for (let o = e + 1; o < t.length; o += 1) if (!t[o].disabled) return o;
  if (n) {
    for (let o = 0; o < t.length; o += 1) if (!t[o].disabled) return o;
  }
  return e;
}
function dp(e, t, n) {
  return Ao(e, n) === Ao(t, n);
}
function El({ parentSelector: e, siblingSelector: t, onKeyDown: n, loop: o = !0, activateOnFocus: r = !1, dir: s = "rtl", orientation: a }) {
  return (i) => {
    n?.(i);
    const c = Array.from(Ao(i.currentTarget, e)?.querySelectorAll(t) || []).filter((g) => dp(i.currentTarget, g, e)), u = c.findIndex((g) => i.currentTarget === g), f = Hi(u, c, o), p = Vi(u, c, o), m = s === "rtl" ? p : f, h = s === "rtl" ? f : p;
    switch (i.key) {
      case "ArrowRight":
        a === "horizontal" && (i.stopPropagation(), i.preventDefault(), c[m].focus(), r && c[m].click());
        break;
      case "ArrowLeft":
        a === "horizontal" && (i.stopPropagation(), i.preventDefault(), c[h].focus(), r && c[h].click());
        break;
      case "ArrowUp":
        a === "vertical" && (i.stopPropagation(), i.preventDefault(), c[p].focus(), r && c[p].click());
        break;
      case "ArrowDown":
        a === "vertical" && (i.stopPropagation(), i.preventDefault(), c[f].focus(), r && c[f].click());
        break;
      case "Home":
        i.stopPropagation(), i.preventDefault(), c[Hi(-1, c, !1)]?.focus();
        break;
      case "End":
        i.stopPropagation(), i.preventDefault(), c[Vi(c.length, c, !1)]?.focus();
    }
  };
}
const Tr = () => {
};
function fp(e, t = { active: !0 }) {
  return typeof e != "function" || !t.active ? t.onKeyDown || Tr : (n) => {
    n.key === "Escape" && (e(n), t.onTrigger?.());
  };
}
function _n(e, t) {
  return (n) => {
    e?.(n), t?.(n);
  };
}
function dn(e, t, n) {
  return t === void 0 && n === void 0 ? e : t !== void 0 && n === void 0 ? Math.max(e, t) : Math.min(t === void 0 && n !== void 0 ? e : Math.max(e, t), n);
}
function pp(e, t) {
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
function Kn(e) {
  const t = d.useRef(e);
  return d.useEffect(() => {
    t.current = e;
  }), d.useMemo(() => ((...n) => t.current?.(...n)), []);
}
function Wr(e, t) {
  const { delay: n, flushOnUnmount: o, leading: r, maxWait: s } = typeof t == "number" ? {
    delay: t,
    flushOnUnmount: !1,
    leading: !1,
    maxWait: void 0
  } : t, a = Kn(e), i = d.useRef(0), c = d.useRef(0), u = d.useRef(null), f = d.useMemo(() => {
    const p = Object.assign((...m) => {
      window.clearTimeout(i.current), u.current = m;
      const h = p._isFirstCall;
      p._isFirstCall = !1;
      function g() {
        window.clearTimeout(i.current), window.clearTimeout(c.current), i.current = 0, c.current = 0, p._isFirstCall = !0, p._hasPendingCallback = !1;
      }
      function v() {
        s !== void 0 && c.current === 0 && (c.current = window.setTimeout(() => {
          if (i.current !== 0) {
            const k = u.current;
            g(), a(...k);
          }
        }, s));
      }
      if (r && h) {
        a(...m);
        const k = () => {
          g();
        }, C = () => {
          i.current !== 0 && (g(), a(...m));
        }, j = () => {
          g();
        };
        p.flush = C, p.cancel = j, i.current = window.setTimeout(k, n), v();
        return;
      }
      if (r && !h) {
        p._hasPendingCallback = !0;
        const k = () => {
          i.current !== 0 && (g(), a(...m));
        }, C = () => {
          g();
        };
        p.flush = k, p.cancel = C;
        const j = () => {
          g();
        };
        i.current = window.setTimeout(j, n), v();
        return;
      }
      p._hasPendingCallback = !0;
      const x = () => {
        i.current !== 0 && (g(), a(...m));
      }, w = () => {
        g();
      };
      p.flush = x, p.cancel = w, i.current = window.setTimeout(x, n), v();
    }, {
      flush: () => {
      },
      cancel: () => {
      },
      isPending: () => p._hasPendingCallback,
      _isFirstCall: !0,
      _hasPendingCallback: !1
    });
    return p;
  }, [
    a,
    n,
    r,
    s
  ]);
  return d.useEffect(() => () => {
    o ? f.flush() : f.cancel();
  }, [f, o]), f;
}
const mp = ["mousedown", "touchstart"];
function Rl(e, t, n, o = !0, r = !1) {
  const s = d.useRef(null), a = t || mp, i = d.useEffectEvent((u) => {
    const { target: f } = u ?? {};
    if (!document.body.contains(f) && f?.tagName !== "HTML") return;
    const p = u.composedPath();
    Array.isArray(n) ? n.every((m) => !!m && !p.includes(m)) && e(u) : s.current && !p.includes(s.current) && e(u);
  }), c = a.join(",");
  return d.useEffect(() => {
    if (!o) return;
    const u = c.split(",");
    return u.forEach((f) => document.addEventListener(f, i, r)), () => {
      u.forEach((f) => document.removeEventListener(f, i, r));
    };
  }, [
    c,
    o,
    r
  ]), s;
}
function hp(e, t) {
  return Vf("(prefers-color-scheme: dark)", e === "dark", t) ? "dark" : "light";
}
function Nl({ opened: e, shouldReturnFocus: t = !0 }) {
  const n = d.useRef(null), o = () => {
    n.current && "focus" in n.current && typeof n.current.focus == "function" && n.current?.focus({ preventScroll: !0 });
  };
  return pn(() => {
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
const gp = /input|select|textarea|button|object/, Tl = "a, input, select, textarea, button, object, [tabindex]";
function vp(e) {
  return e.style.display === "none";
}
function yp(e) {
  if (e.getAttribute("aria-hidden") || e.getAttribute("hidden") || e.getAttribute("type") === "hidden") return !1;
  let t = e;
  for (; t && !(t === document.body || t.nodeType === 11); ) {
    if (vp(t)) return !1;
    t = t.parentNode;
  }
  return !0;
}
function Pl(e) {
  let t = e.getAttribute("tabindex");
  return t === null && (t = void 0), parseInt(t, 10);
}
function Us(e) {
  const t = e.nodeName.toLowerCase(), n = !Number.isNaN(Pl(e));
  return (gp.test(t) && !e.disabled || e instanceof HTMLAnchorElement && e.href || n) && yp(e);
}
function Al(e) {
  const t = Pl(e);
  return (Number.isNaN(t) || t >= 0) && Us(e);
}
function bp(e) {
  return Array.from(e.querySelectorAll(Tl)).filter(Al);
}
function xp(e, t) {
  const n = bp(e);
  if (!n.length) {
    t.preventDefault();
    return;
  }
  const o = n[t.shiftKey ? 0 : n.length - 1], r = e.getRootNode();
  let s = o === r.activeElement || e === r.activeElement;
  const a = r.activeElement;
  if (a.tagName === "INPUT" && a.getAttribute("type") === "radio" && (s = n.filter((c) => c.getAttribute("type") === "radio" && c.getAttribute("name") === a.getAttribute("name")).includes(o)), !s) return;
  t.preventDefault();
  const i = n[t.shiftKey ? n.length - 1 : 0];
  i && i.focus();
}
function wp(e = !0) {
  const t = d.useRef(null), n = (r) => {
    let s = r.querySelector("[data-autofocus]");
    if (!s) {
      const a = Array.from(r.querySelectorAll(Tl));
      s = a.find(Al) || a.find(Us) || null, !s && Us(r) && (s = r);
    }
    s ? s.focus({ preventScroll: !0 }) : console.warn("[@mantine/hooks/use-focus-trap] Failed to find focusable element within provided node", r);
  }, o = d.useCallback((r) => {
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
  return d.useEffect(() => {
    if (!e) return;
    t.current && setTimeout(() => {
      t.current && n(t.current);
    });
    const r = (s) => {
      s.key === "Tab" && t.current && xp(t.current, s);
    };
    return document.addEventListener("keydown", r), () => document.removeEventListener("keydown", r);
  }, [e]), o;
}
const Sp = (e) => (e + 1) % 1e6;
function Cp() {
  const [, e] = d.useReducer(Sp, 0);
  return e;
}
function jp(e, t, n) {
  const o = d.useEffectEvent(t);
  d.useEffect(() => (window.addEventListener(e, o, n), () => window.removeEventListener(e, o, n)), [e]);
}
function Ml(e) {
  return {
    x: dn(e.x, 0, 1),
    y: dn(e.y, 0, 1)
  };
}
function Il(e, t, n = "ltr") {
  const o = d.useRef(!1), r = d.useRef(!1), s = d.useRef(0), a = d.useRef(null), [i, c] = d.useState(!1);
  return d.useEffect(() => (o.current = !0, () => {
    a.current?.();
  }), []), {
    ref: d.useCallback((u) => {
      const f = ({ x: C, y: j }) => {
        cancelAnimationFrame(s.current), s.current = requestAnimationFrame(() => {
          if (o.current && u) {
            u.style.userSelect = "none";
            const N = u.getBoundingClientRect();
            if (N.width && N.height) {
              const T = dn((C - N.left) / N.width, 0, 1);
              e({
                x: n === "ltr" ? T : 1 - T,
                y: dn((j - N.top) / N.height, 0, 1)
              });
            }
          }
        });
      }, p = () => {
        document.addEventListener("mousemove", x), document.addEventListener("mouseup", g), document.addEventListener("touchmove", k, { passive: !1 }), document.addEventListener("touchend", g);
      }, m = () => {
        document.removeEventListener("mousemove", x), document.removeEventListener("mouseup", g), document.removeEventListener("touchmove", k), document.removeEventListener("touchend", g);
      }, h = () => {
        !r.current && o.current && (r.current = !0, typeof t?.onScrubStart == "function" && t.onScrubStart(), c(!0), p());
      }, g = () => {
        r.current && o.current && (r.current = !1, c(!1), m(), setTimeout(() => {
          typeof t?.onScrubEnd == "function" && t.onScrubEnd();
        }, 0));
      }, v = (C) => {
        h(), C.preventDefault(), x(C);
      }, x = (C) => f({
        x: C.clientX,
        y: C.clientY
      }), w = (C) => {
        C.cancelable && C.preventDefault(), h(), k(C);
      }, k = (C) => {
        C.cancelable && C.preventDefault(), f({
          x: C.changedTouches[0].clientX,
          y: C.changedTouches[0].clientY
        });
      };
      return u?.addEventListener("mousedown", v), u?.addEventListener("touchstart", w, { passive: !1 }), a.current = () => {
        m(), cancelAnimationFrame(s.current);
      }, () => {
        u && (u.removeEventListener("mousedown", v), u.removeEventListener("touchstart", w));
      };
    }, [n, e]),
    active: i
  };
}
function kp(e, t) {
  if (!e || !t) return !1;
  if (e === t) return !0;
  if (e.length !== t.length) return !1;
  for (let n = 0; n < e.length; n += 1) if (!pp(e[n], t[n])) return !1;
  return !0;
}
function Ep(e) {
  const t = d.useRef([]), n = d.useRef(0);
  return kp(t.current, e) || (t.current = e, n.current += 1), [n.current];
}
function Wi(e, t) {
  d.useEffect(e, Ep(t));
}
function Rp(e, t, n = { autoInvoke: !1 }) {
  const o = d.useRef(null), r = Kn(e), s = d.useCallback((...i) => {
    o.current || (o.current = window.setTimeout(() => {
      r(...i), o.current = null;
    }, t));
  }, [t]), a = d.useCallback(() => {
    o.current && (window.clearTimeout(o.current), o.current = null);
  }, []);
  return d.useEffect(() => (n.autoInvoke && s(), a), [a, s]), {
    start: s,
    clear: a
  };
}
function Np(e) {
  const t = d.useRef(void 0);
  return d.useEffect(() => {
    t.current = e;
  }, [e]), t.current;
}
function Tp() {
  const [e, t] = d.useState(!1);
  return To(() => {
    t(typeof window < "u" && !Pp() && "EyeDropper" in window);
  }, []), {
    supported: e,
    open: d.useCallback((n = {}) => e ? new window.EyeDropper().open(n) : Promise.resolve(void 0), [e])
  };
}
function Pp() {
  return navigator.userAgent.includes("OPR");
}
function Ap(e, t, n) {
  const o = d.useRef(null);
  d.useEffect(() => {
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
function Mp() {
  const [e, t] = d.useState(!1);
  return d.useEffect(() => t(!0), []), e;
}
const Ip = ["mouse", "touch"], Dp = 10;
function Op(e, t = {}) {
  const { threshold: n = 400, events: o = Ip, cancelOnMove: r = !1, onStart: s, onFinish: a, onCancel: i } = t, c = d.useRef(!1), u = d.useRef(!1), f = d.useRef(-1), p = d.useRef(null);
  d.useEffect(() => () => window.clearTimeout(f.current), []);
  const m = o.join(",");
  return d.useMemo(() => {
    if (typeof e != "function") return {};
    const h = r !== !1, g = r === !0 ? Dp : r === !1 ? 0 : r, v = (C) => {
      !qi(C) && !qs(C) || (s && s(C), p.current = Ui(C), u.current = !0, f.current = window.setTimeout(() => {
        e(C), c.current = !0;
      }, n));
    }, x = (C) => {
      !qi(C) && !qs(C) || (c.current ? a && a(C) : u.current && i && i(C), c.current = !1, u.current = !1, p.current = null, f.current !== -1 && (window.clearTimeout(f.current), f.current = -1));
    }, w = (C) => {
      if (!h || !u.current || c.current) return;
      const j = Ui(C);
      if (!j || !p.current) return;
      const N = j.x - p.current.x, T = j.y - p.current.y;
      Math.sqrt(N * N + T * T) > g && x(C);
    }, k = {};
    return o.includes("mouse") && (k.onMouseDown = v, k.onMouseUp = x, k.onMouseLeave = x, h && (k.onMouseMove = w)), o.includes("touch") && (k.onTouchStart = v, k.onTouchEnd = x, k.onTouchCancel = x, h && (k.onTouchMove = w)), k;
  }, [
    e,
    n,
    i,
    a,
    s,
    r,
    m
  ]);
}
function Ui(e) {
  if (qs(e)) {
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
function qs(e) {
  return window.TouchEvent ? e.nativeEvent instanceof TouchEvent : "touches" in e.nativeEvent;
}
function qi(e) {
  return e.nativeEvent instanceof MouseEvent;
}
function $p(e) {
  if (!e || typeof e == "string") return 0;
  const t = e / 36;
  return Math.round((4 + 15 * t ** 0.25 + t / 5) * 10);
}
function js(e) {
  return e.current ? e.current.scrollHeight : "auto";
}
function Pr(e) {
  return typeof e == "number" && e > 0;
}
function Lp({ transitionDuration: e, transitionTimingFunction: t = "ease", onTransitionEnd: n, onTransitionStart: o, expanded: r, keepMounted: s }) {
  const a = {
    height: 0,
    overflow: "hidden",
    ...s ? {} : { display: "none" }
  }, i = d.useEffectEvent(() => o?.()), c = d.useEffectEvent(() => n?.()), u = d.useRef(null), [f, p] = d.useState(r ? {} : a), [m, h] = d.useState(r ? "entered" : "exited"), g = (C) => {
    Ft.flushSync(() => p(C));
  }, v = (C) => {
    g((j) => ({
      ...j,
      ...C
    }));
  }, x = (C) => {
    const j = e ?? $p(C);
    return { transition: `height ${j}ms ${t}, opacity ${j}ms ${t}` };
  }, w = d.useRef(0);
  pn(() => {
    w.current += 1;
    const C = w.current, j = () => w.current === C;
    e !== 0 && i(), r ? window.requestAnimationFrame(() => {
      !j() || !u.current || (Ft.flushSync(() => h("entering")), v({
        willChange: "height",
        display: "block",
        overflow: "hidden"
      }), window.requestAnimationFrame(() => {
        if (!j() || !u.current) return;
        const N = js(u);
        if (!Pr(N)) {
          g({}), h("entered"), c();
          return;
        }
        v({
          ...x(N),
          height: N
        });
      }));
    }) : window.requestAnimationFrame(() => {
      if (!j() || !u.current) return;
      Ft.flushSync(() => h("exiting"));
      const N = js(u);
      if (!Pr(N)) {
        g(a), h("exited"), c();
        return;
      }
      v({
        ...x(N),
        willChange: "height",
        height: N
      }), window.requestAnimationFrame(() => {
        !j() || !u.current || v({
          height: 0,
          overflow: "hidden"
        });
      });
    });
  }, [r]);
  const k = (C) => {
    if (!(C.target !== u.current || C.propertyName !== "height"))
      if (r) {
        const j = js(u);
        j === f.height ? g({}) : v({ height: j }), h("entered"), c();
      } else f.height === 0 && (g(a), h("exited"), c());
  };
  return {
    state: m,
    getCollapseProps: (C) => ({
      "aria-hidden": !r,
      inert: !r,
      ref: bl(u, C?.ref),
      onTransitionEnd: k,
      style: {
        boxSizing: "border-box",
        ...C?.style,
        ...f
      }
    })
  };
}
function _p(e) {
  if (!e || typeof e == "string") return 0;
  const t = e / 36;
  return Math.round((4 + 15 * t ** 0.25 + t / 5) * 10);
}
function ks(e) {
  return e.current ? e.current.scrollWidth : "auto";
}
function zp({ transitionDuration: e, transitionTimingFunction: t = "ease", onTransitionEnd: n, onTransitionStart: o, expanded: r, keepMounted: s }) {
  const a = {
    width: 0,
    overflow: "hidden",
    ...s ? {} : { display: "none" }
  }, i = d.useEffectEvent(() => o?.()), c = d.useEffectEvent(() => n?.()), u = d.useRef(null), [f, p] = d.useState(r ? {} : a), [m, h] = d.useState(r ? "entered" : "exited"), g = (C) => {
    Ft.flushSync(() => p(C));
  }, v = (C) => {
    g((j) => ({
      ...j,
      ...C
    }));
  }, x = (C) => {
    const j = e ?? _p(C);
    return { transition: `width ${j}ms ${t}, opacity ${j}ms ${t}` };
  }, w = d.useRef(0);
  pn(() => {
    w.current += 1;
    const C = w.current, j = () => w.current === C;
    e !== 0 && i(), r ? window.requestAnimationFrame(() => {
      !j() || !u.current || (Ft.flushSync(() => h("entering")), v({
        willChange: "width",
        display: "block",
        overflow: "hidden"
      }), window.requestAnimationFrame(() => {
        if (!j() || !u.current) return;
        const N = ks(u);
        if (!Pr(N)) {
          g({}), h("entered"), c();
          return;
        }
        v({
          ...x(N),
          width: N
        });
      }));
    }) : window.requestAnimationFrame(() => {
      if (!j() || !u.current) return;
      Ft.flushSync(() => h("exiting"));
      const N = ks(u);
      if (!Pr(N)) {
        g(a), h("exited"), c();
        return;
      }
      v({
        ...x(N),
        willChange: "width",
        width: N
      }), window.requestAnimationFrame(() => {
        !j() || !u.current || v({
          width: 0,
          overflow: "hidden"
        });
      });
    });
  }, [r]);
  const k = (C) => {
    if (!(C.target !== u.current || C.propertyName !== "width"))
      if (r) {
        const j = ks(u);
        j === f.width ? g({}) : v({ width: j }), h("entered"), c();
      } else f.width === 0 && (g(a), h("exited"), c());
  };
  return {
    state: m,
    getCollapseProps: (C) => ({
      "aria-hidden": !r,
      inert: !r,
      ref: bl(u, C?.ref),
      onTransitionEnd: k,
      style: {
        boxSizing: "border-box",
        ...C?.style,
        ...f
      }
    })
  };
}
function Dl() {
  return typeof process < "u" && process.env, "development";
}
function Ol(e) {
  const t = /* @__PURE__ */ new Map();
  return (...n) => {
    const o = JSON.stringify(n);
    if (t.has(o)) return t.get(o);
    const r = e(...n);
    return t.set(o, r), r;
  };
}
function $l(e) {
  const t = sn.version;
  return typeof sn.version != "string" || t.startsWith("18.") ? e?.ref : e?.props?.ref;
}
function Fp(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "bigint";
}
function yr(e, t = document) {
  const n = t.querySelector(e);
  if (n) return n;
  const o = t.querySelectorAll("*");
  for (let r = 0; r < o.length; r += 1) {
    const s = o[r];
    if (s.shadowRoot) {
      const a = yr(e, s.shadowRoot);
      if (a) return a;
    }
  }
  return null;
}
function Ut(e, t = document) {
  const n = [], o = t.querySelectorAll(e);
  n.push(...Array.from(o));
  const r = t.querySelectorAll("*");
  for (let s = 0; s < r.length; s += 1) {
    const a = r[s];
    if (a.shadowRoot) {
      const i = Ut(e, a.shadowRoot);
      n.push(...i);
    }
  }
  return n;
}
function _t(e) {
  if (!e) return document;
  const t = e.getRootNode();
  return t instanceof ShadowRoot || t instanceof Document ? t : document;
}
function Ko(e) {
  const t = d.Children.toArray(e);
  return t.length !== 1 || !xl(t[0]) ? null : t[0];
}
function Xo(e, t) {
  return typeof e == "boolean" ? e : t.autoContrast;
}
function Ki(e) {
  const t = document.createElement("style");
  return t.setAttribute("data-mantine-styles", "inline"), t.innerHTML = "*, *::before, *::after {transition: none !important;}", t.setAttribute("data-mantine-disable-transition", "true"), e && t.setAttribute("nonce", e), document.head.appendChild(t), () => document.querySelectorAll("[data-mantine-disable-transition]").forEach((o) => o.remove());
}
function Bp({ keepTransitions: e } = {}) {
  const t = d.useRef(Tr), n = d.useRef(-1), o = d.use(Hf), r = Wf(), s = d.useRef(r?.());
  if (!o) throw new Error("[@mantine/core] MantineProvider was not found in tree");
  const a = (p) => {
    o.setColorScheme(p), t.current = e ? () => {
    } : Ki(s.current), window.clearTimeout(n.current), n.current = window.setTimeout(() => {
      t.current?.();
    }, 10);
  }, i = () => {
    o.clearColorScheme(), t.current = e ? () => {
    } : Ki(s.current), window.clearTimeout(n.current), n.current = window.setTimeout(() => {
      t.current?.();
    }, 10);
  }, c = hp("light", { getInitialValueInEffect: !1 }), u = o.colorScheme === "auto" ? c : o.colorScheme, f = d.useCallback(() => a(u === "light" ? "dark" : "light"), [a, u]);
  return d.useEffect(() => () => {
    t.current?.(), window.clearTimeout(n.current);
  }, []), {
    colorScheme: o.colorScheme,
    setColorScheme: a,
    clearColorScheme: i,
    toggleColorScheme: f
  };
}
function Ks(e, t) {
  return Array.isArray(e) ? [...e].reduce((n, o) => ({
    ...n,
    ...Ks(o, t)
  }), {}) : typeof e == "function" ? e(t) : e ?? {};
}
const Vp = d.createContext({
  dir: "ltr",
  toggleDirection: () => {
  },
  setDirection: () => {
  }
});
function fo() {
  return d.use(Vp);
}
const Hp = {
  transitionDuration: 200,
  transitionTimingFunction: "ease",
  animateOpacity: !0,
  orientation: "vertical",
  keepMounted: !0,
  keepMountedMode: "activity"
}, Ll = se((e) => {
  const { children: t, expanded: n, transitionDuration: o, transitionTimingFunction: r, style: s, onTransitionEnd: a, onTransitionStart: i, animateOpacity: c, keepMounted: u, keepMountedMode: f, ref: p, orientation: m, ...h } = Z("Collapse", Hp, e), g = xa(), v = Uo(), x = wa(), w = v.respectReducedMotion && x ? 0 : o, k = (m === "horizontal" ? zp : Lp)({
    expanded: n,
    transitionDuration: w,
    transitionTimingFunction: r,
    onTransitionEnd: a,
    onTransitionStart: i,
    keepMounted: !1
  });
  if (w === 0)
    return u === !0 && (f === "display-none" || g !== "test") ? f === "display-none" ? /* @__PURE__ */ l.jsx(Q, {
      ...h,
      style: {
        ...Ks(s, v),
        ...n ? {} : { display: "none" }
      },
      ref: p,
      children: t
    }) : /* @__PURE__ */ l.jsx(d.Activity, {
      mode: n ? "visible" : "hidden",
      children: /* @__PURE__ */ l.jsx(Q, {
        ...h,
        style: s,
        ref: p,
        children: t
      })
    }) : n ? /* @__PURE__ */ l.jsx(Q, {
      ...h,
      style: s,
      ref: p,
      children: t
    }) : null;
  const C = k.state === "exited";
  let j;
  return u === !1 ? j = C ? null : t : u === !0 ? j = f === "display-none" ? t : /* @__PURE__ */ l.jsx(d.Activity, {
    mode: C ? "hidden" : "visible",
    children: t
  }) : j = t, /* @__PURE__ */ l.jsx(Q, {
    ...h,
    ...k.getCollapseProps({
      style: {
        opacity: n || !c ? 1 : 0,
        transition: c ? `opacity ${w}ms ${r}` : "none",
        ...Ks(s, v),
        ...u && f === "display-none" && C ? { display: "none" } : {}
      },
      ref: p
    }),
    children: j
  });
});
Ll.displayName = "@mantine/core/Collapse";
const [Wp, Et] = Wt("ScrollArea.Root component was not found in tree");
function mn(e, t) {
  const n = d.useEffectEvent(t);
  To(() => {
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
function Up(e) {
  const { style: t, ...n } = e, o = Et(), [r, s] = d.useState(0), [a, i] = d.useState(0), c = !!(r && a);
  return mn(o.scrollbarX, () => {
    const u = o.scrollbarX?.offsetHeight || 0;
    o.onCornerHeightChange(u), i(u);
  }), mn(o.scrollbarY, () => {
    const u = o.scrollbarY?.offsetWidth || 0;
    o.onCornerWidthChange(u), s(u);
  }), c ? /* @__PURE__ */ l.jsx("div", {
    ...n,
    style: {
      ...t,
      width: r,
      height: a
    }
  }) : null;
}
function qp(e) {
  const t = Et(), n = !!(t.scrollbarX && t.scrollbarY);
  return t.type !== "scroll" && n ? /* @__PURE__ */ l.jsx(Up, { ...e }) : null;
}
const Kp = {
  scrollHideDelay: 1e3,
  type: "hover"
};
function _l(e) {
  const { type: t, scrollHideDelay: n, scrollbars: o, getStyles: r, ref: s, ...a } = Z("ScrollAreaRoot", Kp, e), [i, c] = d.useState(null), [u, f] = d.useState(null), [p, m] = d.useState(null), [h, g] = d.useState(null), [v, x] = d.useState(null), [w, k] = d.useState(0), [C, j] = d.useState(0), [N, T] = d.useState(!1), [S, y] = d.useState(!1), R = ze(s, c);
  return /* @__PURE__ */ l.jsx(Wp, {
    value: {
      type: t,
      scrollHideDelay: n,
      scrollArea: i,
      viewport: u,
      onViewportChange: f,
      content: p,
      onContentChange: m,
      scrollbarX: h,
      onScrollbarXChange: g,
      scrollbarXEnabled: N,
      onScrollbarXEnabledChange: T,
      scrollbarY: v,
      onScrollbarYChange: x,
      scrollbarYEnabled: S,
      onScrollbarYEnabledChange: y,
      onCornerWidthChange: k,
      onCornerHeightChange: j,
      getStyles: r
    },
    children: /* @__PURE__ */ l.jsx(Q, {
      ...a,
      ref: R,
      __vars: {
        "--sa-corner-width": o !== "xy" ? "0px" : `${w}px`,
        "--sa-corner-height": o !== "xy" ? "0px" : `${C}px`
      }
    })
  });
}
_l.displayName = "@mantine/core/ScrollAreaRoot";
function zl(e, t) {
  const n = e / t;
  return Number.isNaN(n) ? 0 : n;
}
function Ur(e) {
  const t = zl(e.viewport, e.content), n = e.scrollbar.paddingStart + e.scrollbar.paddingEnd, o = (e.scrollbar.size - n) * t;
  return Math.max(o, 18);
}
function Fl(e, t) {
  return (n) => {
    if (e[0] === e[1] || t[0] === t[1]) return t[0];
    const o = (t[1] - t[0]) / (e[1] - e[0]);
    return t[0] + o * (n - e[0]);
  };
}
function Xp(e, [t, n]) {
  return Math.min(n, Math.max(t, e));
}
function Xi(e, t, n = "ltr") {
  const o = Ur(t), r = t.scrollbar.paddingStart + t.scrollbar.paddingEnd, s = t.scrollbar.size - r, a = t.content - t.viewport, i = s - o, c = Xp(e, n === "ltr" ? [0, a] : [a * -1, 0]);
  return Fl([0, a], [0, i])(c);
}
function Yp(e, t, n, o = "ltr") {
  const r = Ur(n), s = r / 2, a = t || s, i = r - a, c = n.scrollbar.paddingStart + a, u = n.scrollbar.size - n.scrollbar.paddingEnd - i, f = n.content - n.viewport, p = o === "ltr" ? [0, f] : [f * -1, 0];
  return Fl([c, u], p)(e);
}
function Bl(e, t) {
  return e > 0 && e < t;
}
function cn(e) {
  return e ? parseInt(e, 10) : 0;
}
function En(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
  return (o) => {
    e?.(o), (n === !1 || !o.defaultPrevented) && t?.(o);
  };
}
const [Gp, Vl] = Wt("ScrollAreaScrollbar was not found in tree");
function Hl(e) {
  const { sizes: t, hasThumb: n, onThumbChange: o, onThumbPointerUp: r, onThumbPointerDown: s, onThumbPositionChange: a, onDragScroll: i, onWheelScroll: c, onResize: u, ref: f, ...p } = e, m = Et(), [h, g] = d.useState(null), v = ze(f, g), x = d.useRef(null), w = d.useRef(""), { viewport: k } = m, C = t.content - t.viewport, j = d.useEffectEvent(c), N = Kn(a), T = Wr(u, 10), S = (y) => {
    if (x.current) {
      const R = y.clientX - x.current.left, D = y.clientY - x.current.top;
      i({
        x: R,
        y: D
      });
    }
  };
  return d.useEffect(() => {
    const y = (R) => {
      const D = R.target;
      h?.contains(D) && j(R, C);
    };
    return document.addEventListener("wheel", y, { passive: !1 }), () => document.removeEventListener("wheel", y, { passive: !1 });
  }, [
    k,
    h,
    C
  ]), d.useEffect(N, [t, N]), mn(h, T), mn(m.content, T), /* @__PURE__ */ l.jsx(Gp, {
    value: {
      scrollbar: h,
      hasThumb: n,
      onThumbChange: Kn(o),
      onThumbPointerUp: Kn(r),
      onThumbPositionChange: N,
      onThumbPointerDown: Kn(s)
    },
    children: /* @__PURE__ */ l.jsx("div", {
      ...p,
      ref: v,
      "data-mantine-scrollbar": !0,
      style: {
        position: "absolute",
        ...p.style
      },
      onPointerDown: En(e.onPointerDown, (y) => {
        y.preventDefault(), y.button === 0 && (y.target.setPointerCapture(y.pointerId), x.current = h.getBoundingClientRect(), w.current = document.body.style.webkitUserSelect, document.body.style.webkitUserSelect = "none", S(y));
      }),
      onPointerMove: En(e.onPointerMove, S),
      onPointerUp: En(e.onPointerUp, (y) => {
        const R = y.target;
        R.hasPointerCapture(y.pointerId) && (y.preventDefault(), R.releasePointerCapture(y.pointerId));
      }),
      onLostPointerCapture: () => {
        document.body.style.webkitUserSelect = w.current, x.current = null;
      }
    })
  });
}
const Wl = (e) => {
  const { sizes: t, onSizesChange: n, style: o, ref: r, ...s } = e, a = Et(), [i, c] = d.useState(), u = d.useRef(null), f = ze(r, u, a.onScrollbarXChange);
  return d.useEffect(() => {
    u.current && c(getComputedStyle(u.current));
  }, [u]), /* @__PURE__ */ l.jsx(Hl, {
    "data-orientation": "horizontal",
    ...s,
    ref: f,
    sizes: t,
    style: {
      ...o,
      "--sa-thumb-width": `${Ur(t)}px`
    },
    onThumbPointerDown: (p) => e.onThumbPointerDown(p.x),
    onDragScroll: (p) => e.onDragScroll(p.x),
    onWheelScroll: (p, m) => {
      if (a.viewport) {
        const h = a.viewport.scrollLeft + p.deltaX;
        e.onWheelScroll(h), Bl(h, m) && p.preventDefault();
      }
    },
    onResize: () => {
      u.current && a.viewport && i && n({
        content: a.viewport.scrollWidth,
        viewport: a.viewport.offsetWidth,
        scrollbar: {
          size: u.current.clientWidth,
          paddingStart: cn(i.paddingLeft),
          paddingEnd: cn(i.paddingRight)
        }
      });
    }
  });
};
Wl.displayName = "@mantine/core/ScrollAreaScrollbarX";
function Ul(e) {
  const { sizes: t, onSizesChange: n, style: o, ref: r, ...s } = e, a = Et(), [i, c] = d.useState(), u = d.useRef(null), f = ze(r, u, a.onScrollbarYChange);
  return d.useEffect(() => {
    u.current && c(window.getComputedStyle(u.current));
  }, []), /* @__PURE__ */ l.jsx(Hl, {
    ...s,
    "data-orientation": "vertical",
    ref: f,
    sizes: t,
    style: {
      "--sa-thumb-height": `${Ur(t)}px`,
      ...o
    },
    onThumbPointerDown: (p) => e.onThumbPointerDown(p.y),
    onDragScroll: (p) => e.onDragScroll(p.y),
    onWheelScroll: (p, m) => {
      if (a.viewport) {
        const h = a.viewport.scrollTop + p.deltaY;
        e.onWheelScroll(h), Bl(h, m) && p.preventDefault();
      }
    },
    onResize: () => {
      u.current && a.viewport && i && n({
        content: a.viewport.scrollHeight,
        viewport: a.viewport.offsetHeight,
        scrollbar: {
          size: u.current.clientHeight,
          paddingStart: cn(i.paddingTop),
          paddingEnd: cn(i.paddingBottom)
        }
      });
    }
  });
}
Ul.displayName = "@mantine/core/ScrollAreaScrollbarY";
function qr(e) {
  const { orientation: t = "vertical", ...n } = e, { dir: o } = fo(), r = Et(), s = d.useRef(null), a = d.useRef(0), [i, c] = d.useState({
    content: 0,
    viewport: 0,
    scrollbar: {
      size: 0,
      paddingStart: 0,
      paddingEnd: 0
    }
  }), u = zl(i.viewport, i.content), f = {
    ...n,
    sizes: i,
    onSizesChange: c,
    hasThumb: u > 0 && u < 1,
    onThumbChange: (m) => {
      s.current = m;
    },
    onThumbPointerUp: () => {
      a.current = 0;
    },
    onThumbPointerDown: (m) => {
      a.current = m;
    }
  }, p = (m, h) => Yp(m, a.current, i, h);
  return t === "horizontal" ? /* @__PURE__ */ l.jsx(Wl, {
    ...f,
    onThumbPositionChange: () => {
      if (r.viewport && s.current) {
        const m = r.viewport.scrollLeft, h = Xi(m, i, o);
        s.current.style.transform = `translate3d(${h}px, 0, 0)`;
      }
    },
    onWheelScroll: (m) => {
      r.viewport && (r.viewport.scrollLeft = m);
    },
    onDragScroll: (m) => {
      r.viewport && (r.viewport.scrollLeft = p(m, o));
    }
  }) : t === "vertical" ? /* @__PURE__ */ l.jsx(Ul, {
    ...f,
    onThumbPositionChange: () => {
      if (r.viewport && s.current) {
        const m = r.viewport.scrollTop, h = Xi(m, i);
        i.scrollbar.size === 0 ? s.current.style.setProperty("--thumb-opacity", "0") : s.current.style.setProperty("--thumb-opacity", "1"), s.current.style.transform = `translate3d(0, ${h}px, 0)`;
      }
    },
    onWheelScroll: (m) => {
      r.viewport && (r.viewport.scrollTop = m);
    },
    onDragScroll: (m) => {
      r.viewport && (r.viewport.scrollTop = p(m));
    }
  }) : null;
}
qr.displayName = "@mantine/core/ScrollAreaScrollbarVisible";
function Na(e) {
  const t = Et(), { forceMount: n, ...o } = e, [r, s] = d.useState(!1), a = e.orientation === "horizontal", i = Wr(() => {
    if (t.viewport) {
      const c = t.viewport.offsetWidth < t.viewport.scrollWidth, u = t.viewport.offsetHeight < t.viewport.scrollHeight;
      s(a ? c : u);
    }
  }, 10);
  return mn(t.viewport, i), mn(t.content, i), n || r ? /* @__PURE__ */ l.jsx(qr, {
    "data-state": r ? "visible" : "hidden",
    ...o
  }) : null;
}
Na.displayName = "@mantine/core/ScrollAreaScrollbarAuto";
function ql(e) {
  const { forceMount: t, ...n } = e, o = Et(), [r, s] = d.useState(!1);
  return d.useEffect(() => {
    const { scrollArea: a } = o;
    let i = 0;
    if (a) {
      const c = () => {
        window.clearTimeout(i), s(!0);
      }, u = () => {
        i = window.setTimeout(() => s(!1), o.scrollHideDelay);
      };
      return a.addEventListener("pointerenter", c), a.addEventListener("pointerleave", u), () => {
        window.clearTimeout(i), a.removeEventListener("pointerenter", c), a.removeEventListener("pointerleave", u);
      };
    }
  }, [o.scrollArea, o.scrollHideDelay]), t || r ? /* @__PURE__ */ l.jsx(Na, {
    "data-state": r ? "visible" : "hidden",
    ...n
  }) : null;
}
ql.displayName = "@mantine/core/ScrollAreaScrollbarHover";
function Jp(e) {
  const { forceMount: t, ...n } = e, o = Et(), r = e.orientation === "horizontal", [s, a] = d.useState("hidden"), i = Wr(() => a("idle"), 100);
  return d.useEffect(() => {
    if (s === "idle") {
      const c = window.setTimeout(() => a("hidden"), o.scrollHideDelay);
      return () => window.clearTimeout(c);
    }
  }, [s, o.scrollHideDelay]), d.useEffect(() => {
    const { viewport: c } = o, u = r ? "scrollLeft" : "scrollTop";
    if (c) {
      let f = c[u];
      const p = () => {
        const m = c[u];
        f !== m && (a("scrolling"), i()), f = m;
      };
      return c.addEventListener("scroll", p), () => c.removeEventListener("scroll", p);
    }
  }, [
    o.viewport,
    r,
    i
  ]), t || s !== "hidden" ? /* @__PURE__ */ l.jsx(qr, {
    "data-state": s === "hidden" ? "hidden" : "visible",
    ...n,
    onPointerEnter: En(e.onPointerEnter, () => a("interacting")),
    onPointerLeave: En(e.onPointerLeave, () => a("idle"))
  }) : null;
}
function Xs(e) {
  const { forceMount: t, ...n } = e, o = Et(), { onScrollbarXEnabledChange: r, onScrollbarYEnabledChange: s } = o, a = e.orientation === "horizontal";
  return d.useEffect(() => (a ? r(!0) : s(!0), () => {
    a ? r(!1) : s(!1);
  }), [
    a,
    r,
    s
  ]), o.type === "hover" ? /* @__PURE__ */ l.jsx(ql, {
    ...n,
    forceMount: t
  }) : o.type === "scroll" ? /* @__PURE__ */ l.jsx(Jp, {
    ...n,
    forceMount: t
  }) : o.type === "auto" ? /* @__PURE__ */ l.jsx(Na, {
    ...n,
    forceMount: t
  }) : o.type === "always" ? /* @__PURE__ */ l.jsx(qr, { ...n }) : null;
}
Xs.displayName = "@mantine/core/ScrollAreaScrollbar";
function Zp(e, t = () => {
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
function Kl(e) {
  const { style: t, ref: n, ...o } = e, r = Et(), s = Vl(), { onThumbPositionChange: a } = s, i = ze(n, s.onThumbChange), c = d.useRef(void 0), u = Wr(() => {
    c.current && (c.current(), c.current = void 0);
  }, 100);
  return d.useEffect(() => {
    const { viewport: f } = r;
    if (f) {
      const p = () => {
        if (u(), !c.current) {
          const m = Zp(f, a);
          c.current = m, a();
        }
      };
      return a(), f.addEventListener("scroll", p), () => f.removeEventListener("scroll", p);
    }
  }, [
    r.viewport,
    u,
    a
  ]), /* @__PURE__ */ l.jsx("div", {
    "data-state": s.hasThumb ? "visible" : "hidden",
    ...o,
    ref: i,
    style: {
      width: "var(--sa-thumb-width)",
      height: "var(--sa-thumb-height)",
      ...t
    },
    onPointerDownCapture: En(e.onPointerDownCapture, (f) => {
      const p = f.target.getBoundingClientRect(), m = f.clientX - p.left, h = f.clientY - p.top;
      s.onThumbPointerDown({
        x: m,
        y: h
      });
    }),
    onPointerUp: En(e.onPointerUp, s.onThumbPointerUp)
  });
}
Kl.displayName = "@mantine/core/ScrollAreaThumb";
function Ys(e) {
  const { forceMount: t, ...n } = e, o = Vl();
  return t || o.hasThumb ? /* @__PURE__ */ l.jsx(Kl, { ...n }) : null;
}
Ys.displayName = "@mantine/core/ScrollAreaThumb";
function Xl({ children: e, style: t, ref: n, onWheel: o, ...r }) {
  const s = Et(), a = ze(n, s.onViewportChange), i = (c) => {
    if (o?.(c), s.scrollbarXEnabled && s.viewport && c.shiftKey) {
      const { scrollTop: u, scrollHeight: f, clientHeight: p, scrollWidth: m, clientWidth: h } = s.viewport, g = u < 1, v = u >= f - p - 1;
      m > h && (g || v) && c.stopPropagation();
    }
  };
  return /* @__PURE__ */ l.jsx(Q, {
    ...r,
    ref: a,
    onWheel: i,
    "data-scrollarea-viewport": !0,
    style: {
      overflowX: s.scrollbarXEnabled ? "scroll" : "hidden",
      overflowY: s.scrollbarYEnabled ? "scroll" : "hidden",
      ...t
    },
    children: /* @__PURE__ */ l.jsx("div", {
      ...s.getStyles("content"),
      ref: s.onContentChange,
      children: e
    })
  });
}
Xl.displayName = "@mantine/core/ScrollAreaViewport";
var Ta = {
  root: "m_d57069b5",
  content: "m_b1336c6",
  viewport: "m_c0783ff9",
  viewportInner: "m_f8f631dd",
  scrollbar: "m_c44ba933",
  thumb: "m_d8b5e363",
  corner: "m_21657268"
};
function Kr() {
  return typeof window < "u";
}
function po(e) {
  return Yl(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function pt(e) {
  var t;
  return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function Qt(e) {
  var t;
  return (t = (Yl(e) ? e.ownerDocument : e.document) || window.document) == null ? void 0 : t.documentElement;
}
function Yl(e) {
  return Kr() ? e instanceof Node || e instanceof pt(e).Node : !1;
}
function ft(e) {
  return Kr() ? e instanceof Element || e instanceof pt(e).Element : !1;
}
function yn(e) {
  return Kr() ? e instanceof HTMLElement || e instanceof pt(e).HTMLElement : !1;
}
function Yi(e) {
  return !Kr() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof pt(e).ShadowRoot;
}
function Xr(e) {
  const {
    overflow: t,
    overflowX: n,
    overflowY: o,
    display: r
  } = Bt(e);
  return /auto|scroll|overlay|hidden|clip/.test(t + o + n) && r !== "inline" && r !== "contents";
}
function Qp(e) {
  return /^(table|td|th)$/.test(po(e));
}
function Yr(e) {
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
const em = /transform|translate|scale|rotate|perspective|filter/, tm = /paint|layout|strict|content/, wn = (e) => !!e && e !== "none";
let Es;
function Pa(e) {
  const t = ft(e) ? Bt(e) : e;
  return wn(t.transform) || wn(t.translate) || wn(t.scale) || wn(t.rotate) || wn(t.perspective) || !Aa() && (wn(t.backdropFilter) || wn(t.filter)) || em.test(t.willChange || "") || tm.test(t.contain || "");
}
function nm(e) {
  let t = Nn(e);
  for (; yn(t) && !Mo(t); ) {
    if (Pa(t))
      return t;
    if (Yr(t))
      return null;
    t = Nn(t);
  }
  return null;
}
function Aa() {
  return Es == null && (Es = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), Es;
}
function Mo(e) {
  return /^(html|body|#document)$/.test(po(e));
}
function Bt(e) {
  return pt(e).getComputedStyle(e);
}
function Gr(e) {
  return ft(e) ? {
    scrollLeft: e.scrollLeft,
    scrollTop: e.scrollTop
  } : {
    scrollLeft: e.scrollX,
    scrollTop: e.scrollY
  };
}
function Nn(e) {
  if (po(e) === "html")
    return e;
  const t = (
    // Step into the shadow DOM of the parent of a slotted node.
    e.assignedSlot || // DOM Element detected.
    e.parentNode || // ShadowRoot detected.
    Yi(e) && e.host || // Fallback.
    Qt(e)
  );
  return Yi(t) ? t.host : t;
}
function Gl(e) {
  const t = Nn(e);
  return Mo(t) ? (e.ownerDocument || e).body : yn(t) && Xr(t) ? t : Gl(t);
}
function Io(e, t, n) {
  var o;
  t === void 0 && (t = []), n === void 0 && (n = !0);
  const r = Gl(e), s = r === ((o = e.ownerDocument) == null ? void 0 : o.body), a = pt(r);
  if (s) {
    const i = Gs(a);
    return t.concat(a, a.visualViewport || [], Xr(r) ? r : [], i && n ? Io(i) : []);
  } else
    return t.concat(r, Io(r, [], n));
}
function Gs(e) {
  return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
const om = ["top", "right", "bottom", "left"], Dt = Math.min, wt = Math.max, Ar = Math.round, fr = Math.floor, Xt = (e) => ({
  x: e,
  y: e
}), rm = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
function Jl(e, t, n) {
  return wt(e, Dt(t, n));
}
function Vt(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function Ht(e) {
  return e.split("-")[0];
}
function mo(e) {
  return e.split("-")[1];
}
function Ma(e) {
  return e === "x" ? "y" : "x";
}
function Ia(e) {
  return e === "y" ? "height" : "width";
}
function Mt(e) {
  const t = e[0];
  return t === "t" || t === "b" ? "y" : "x";
}
function Da(e) {
  return Ma(Mt(e));
}
function sm(e, t, n) {
  n === void 0 && (n = !1);
  const o = mo(e), r = Da(e), s = Ia(r);
  let a = r === "x" ? o === (n ? "end" : "start") ? "right" : "left" : o === "start" ? "bottom" : "top";
  return t.reference[s] > t.floating[s] && (a = Mr(a)), [a, Mr(a)];
}
function am(e) {
  const t = Mr(e);
  return [Js(e), t, Js(t)];
}
function Js(e) {
  return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
const Gi = ["left", "right"], Ji = ["right", "left"], im = ["top", "bottom"], cm = ["bottom", "top"];
function lm(e, t, n) {
  switch (e) {
    case "top":
    case "bottom":
      return n ? t ? Ji : Gi : t ? Gi : Ji;
    case "left":
    case "right":
      return t ? im : cm;
    default:
      return [];
  }
}
function um(e, t, n, o) {
  const r = mo(e);
  let s = lm(Ht(e), n === "start", o);
  return r && (s = s.map((a) => a + "-" + r), t && (s = s.concat(s.map(Js)))), s;
}
function Mr(e) {
  const t = Ht(e);
  return rm[t] + e.slice(t.length);
}
function dm(e) {
  var t, n, o, r;
  return {
    top: (t = e.top) != null ? t : 0,
    right: (n = e.right) != null ? n : 0,
    bottom: (o = e.bottom) != null ? o : 0,
    left: (r = e.left) != null ? r : 0
  };
}
function Oa(e) {
  return typeof e != "number" ? dm(e) : {
    top: e,
    right: e,
    bottom: e,
    left: e
  };
}
function fn(e) {
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
var fm = typeof document < "u", pm = function() {
}, Zs = fm ? d.useLayoutEffect : pm;
const mm = {
  ...hl
}, hm = mm.useInsertionEffect, gm = hm || ((e) => e());
function vm(e) {
  const t = d.useRef(() => {
  });
  return gm(() => {
    t.current = e;
  }), d.useCallback(function() {
    for (var n = arguments.length, o = new Array(n), r = 0; r < n; r++)
      o[r] = arguments[r];
    return t.current == null ? void 0 : t.current(...o);
  }, []);
}
function Zi(e, t, n) {
  let {
    reference: o,
    floating: r
  } = e;
  const s = Mt(t), a = Da(t), i = Ia(a), c = Ht(t), u = s === "y", f = o.x + o.width / 2 - r.width / 2, p = o.y + o.height / 2 - r.height / 2, m = o[i] / 2 - r[i] / 2;
  let h;
  switch (c) {
    case "top":
      h = {
        x: f,
        y: o.y - r.height
      };
      break;
    case "bottom":
      h = {
        x: f,
        y: o.y + o.height
      };
      break;
    case "right":
      h = {
        x: o.x + o.width,
        y: p
      };
      break;
    case "left":
      h = {
        x: o.x - r.width,
        y: p
      };
      break;
    default:
      h = {
        x: o.x,
        y: o.y
      };
  }
  const g = mo(t);
  return g && (h[a] += m * (g === "end" ? 1 : -1) * (n && u ? -1 : 1)), h;
}
async function ym(e, t) {
  var n;
  t === void 0 && (t = {});
  const {
    x: o,
    y: r,
    platform: s,
    rects: a,
    elements: i,
    strategy: c
  } = e, {
    boundary: u = "clippingAncestors",
    rootBoundary: f = "viewport",
    elementContext: p = "floating",
    altBoundary: m = !1,
    padding: h = 0
  } = Vt(t, e), g = Oa(h), x = i[m ? p === "floating" ? "reference" : "floating" : p], w = fn(await s.getClippingRect({
    element: (n = await (s.isElement == null ? void 0 : s.isElement(x))) == null || n ? x : x.contextElement || await (s.getDocumentElement == null ? void 0 : s.getDocumentElement(i.floating)),
    boundary: u,
    rootBoundary: f,
    strategy: c
  })), k = p === "floating" ? {
    x: o,
    y: r,
    width: a.floating.width,
    height: a.floating.height
  } : a.reference, C = await (s.getOffsetParent == null ? void 0 : s.getOffsetParent(i.floating)), j = await (s.isElement == null ? void 0 : s.isElement(C)) && await (s.getScale == null ? void 0 : s.getScale(C)) || {
    x: 1,
    y: 1
  }, N = fn(s.convertOffsetParentRelativeRectToViewportRelativeRect ? await s.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements: i,
    rect: k,
    offsetParent: C,
    strategy: c
  }) : k);
  return {
    top: (w.top - N.top + g.top) / j.y,
    bottom: (N.bottom - w.bottom + g.bottom) / j.y,
    left: (w.left - N.left + g.left) / j.x,
    right: (N.right - w.right + g.right) / j.x
  };
}
const bm = 50, xm = async (e, t, n) => {
  const {
    placement: o = "bottom",
    strategy: r = "absolute",
    middleware: s = [],
    platform: a
  } = n, i = a.detectOverflow ? a : {
    ...a,
    detectOverflow: ym
  }, c = await (a.isRTL == null ? void 0 : a.isRTL(t));
  let u = await a.getElementRects({
    reference: e,
    floating: t,
    strategy: r
  }), {
    x: f,
    y: p
  } = Zi(u, o, c), m = o, h = 0;
  const g = {};
  for (let v = 0; v < s.length; v++) {
    const x = s[v];
    if (!x)
      continue;
    const {
      name: w,
      fn: k
    } = x, {
      x: C,
      y: j,
      data: N,
      reset: T
    } = await k({
      x: f,
      y: p,
      initialPlacement: o,
      placement: m,
      strategy: r,
      middlewareData: g,
      rects: u,
      platform: i,
      elements: {
        reference: e,
        floating: t
      }
    });
    f = C ?? f, p = j ?? p, g[w] = {
      ...g[w],
      ...N
    }, T && h < bm && (h++, typeof T == "object" && (T.placement && (m = T.placement), T.rects && (u = T.rects === !0 ? await a.getElementRects({
      reference: e,
      floating: t,
      strategy: r
    }) : T.rects), {
      x: f,
      y: p
    } = Zi(u, m, c)), v = -1);
  }
  return {
    x: f,
    y: p,
    placement: m,
    strategy: r,
    middlewareData: g
  };
}, wm = (e) => ({
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
      middlewareData: c
    } = t, {
      element: u,
      padding: f = 0
    } = Vt(e, t) || {};
    if (u == null)
      return {};
    const p = Oa(f), m = {
      x: n,
      y: o
    }, h = Da(r), g = Ia(h), v = await a.getDimensions(u), x = h === "y", w = x ? "top" : "left", k = x ? "bottom" : "right", C = x ? "clientHeight" : "clientWidth", j = s.reference[g] + s.reference[h] - m[h] - s.floating[g], N = m[h] - s.reference[h], T = await (a.getOffsetParent == null ? void 0 : a.getOffsetParent(u));
    let S = T ? T[C] : 0;
    (!S || !await (a.isElement == null ? void 0 : a.isElement(T))) && (S = i.floating[C] || s.floating[g]);
    const y = j / 2 - N / 2, R = S / 2 - v[g] / 2 - 1, D = Dt(p[w], R), O = Dt(p[k], R), z = S - v[g] - O, _ = S / 2 - v[g] / 2 + y, F = Jl(D, _, z), $ = !c.arrow && mo(r) != null && _ !== F && s.reference[g] / 2 - (_ < D ? D : O) - v[g] / 2 < 0, I = $ ? _ < D ? _ - D : _ - z : 0;
    return {
      [h]: m[h] + I,
      data: {
        [h]: F,
        centerOffset: _ - F - I,
        ...$ && {
          alignmentOffset: I
        }
      },
      reset: $
    };
  }
}), Sm = function(e) {
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
        platform: c,
        elements: u
      } = t, {
        mainAxis: f = !0,
        crossAxis: p = !0,
        fallbackPlacements: m,
        fallbackStrategy: h = "bestFit",
        fallbackAxisSideDirection: g = "none",
        flipAlignment: v = !0,
        ...x
      } = Vt(e, t);
      if ((n = s.arrow) != null && n.alignmentOffset)
        return {};
      const w = Ht(r), k = Mt(i), C = Ht(i) === i, j = await (c.isRTL == null ? void 0 : c.isRTL(u.floating)), N = m || (C || !v ? [Mr(i)] : am(i)), T = g !== "none";
      !m && T && N.push(...um(i, v, g, j));
      const S = [i, ...N], y = await c.detectOverflow(t, x), R = [];
      let D = ((o = s.flip) == null ? void 0 : o.overflows) || [];
      if (f && R.push(y[w]), p) {
        const F = sm(r, a, j);
        R.push(y[F[0]], y[F[1]]);
      }
      if (D = [...D, {
        placement: r,
        overflows: R
      }], !R.every((F) => F <= 0)) {
        var O, z;
        const F = (((O = s.flip) == null ? void 0 : O.index) || 0) + 1, $ = S[F];
        if ($ && (!(p === "alignment" ? k !== Mt($) : !1) || // We leave the current main axis only if every placement on that axis
        // overflows the main axis.
        D.every((M) => Mt(M.placement) === k ? M.overflows[0] > 0 : !0)))
          return {
            data: {
              index: F,
              overflows: D
            },
            reset: {
              placement: $
            }
          };
        let I = (z = D.filter((L) => L.overflows[0] <= 0).sort((L, M) => L.overflows[1] - M.overflows[1])[0]) == null ? void 0 : z.placement;
        if (!I)
          switch (h) {
            case "bestFit": {
              var _;
              const L = (_ = D.filter((M) => {
                if (T) {
                  const P = Mt(M.placement);
                  return P === k || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  P === "y";
                }
                return !0;
              }).map((M) => [M.placement, M.overflows.filter((P) => P > 0).reduce((P, B) => P + B, 0)]).sort((M, P) => M[1] - P[1])[0]) == null ? void 0 : _[0];
              L && (I = L);
              break;
            }
            case "initialPlacement":
              I = i;
              break;
          }
        if (r !== I)
          return {
            reset: {
              placement: I
            }
          };
      }
      return {};
    }
  };
};
function Qi(e, t) {
  return {
    top: e.top - t.height,
    right: e.right - t.width,
    bottom: e.bottom - t.height,
    left: e.left - t.width
  };
}
function ec(e) {
  return om.some((t) => e[t] >= 0);
}
const Cm = function(e) {
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
      } = Vt(e, t);
      switch (r) {
        case "referenceHidden": {
          const a = await o.detectOverflow(t, {
            ...s,
            elementContext: "reference"
          }), i = Qi(a, n.reference);
          return {
            data: {
              referenceHiddenOffsets: i,
              referenceHidden: ec(i)
            }
          };
        }
        case "escaped": {
          const a = await o.detectOverflow(t, {
            ...s,
            altBoundary: !0
          }), i = Qi(a, n.floating);
          return {
            data: {
              escapedOffsets: i,
              escaped: ec(i)
            }
          };
        }
        default:
          return {};
      }
    }
  };
};
function Zl(e) {
  const t = Dt(...e.map((s) => s.left)), n = Dt(...e.map((s) => s.top)), o = wt(...e.map((s) => s.right)), r = wt(...e.map((s) => s.bottom));
  return {
    x: t,
    y: n,
    width: o - t,
    height: r - n
  };
}
function jm(e) {
  const t = e.slice().sort((r, s) => r.y - s.y), n = [];
  let o = null;
  for (let r = 0; r < t.length; r++) {
    const s = t[r];
    !o || s.y - o.y > o.height / 2 ? n.push([s]) : n[n.length - 1].push(s), o = s;
  }
  return n.map((r) => fn(Zl(r)));
}
const km = function(e) {
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
        x: c,
        y: u
      } = Vt(e, t), f = Array.from(await (s.getClientRects == null ? void 0 : s.getClientRects(o.reference)) || []);
      if (!f.length)
        return {};
      const p = jm(f), m = fn(Zl(f)), h = Oa(i);
      function g() {
        if (p.length === 2 && (p[0].left > p[1].right || p[1].left > p[0].right) && c != null && u != null)
          return p.find((x) => c > x.left - h.left && c < x.right + h.right && u > x.top - h.top && u < x.bottom + h.bottom) || m;
        if (p.length >= 2) {
          if (Mt(n) === "y") {
            const T = p[0], S = p[p.length - 1], y = Ht(n) === "top", R = T.top, D = S.bottom, O = y ? T.left : S.left, z = y ? T.right : S.right;
            return fn({
              x: O,
              y: R,
              width: z - O,
              height: D - R
            });
          }
          const x = Ht(n) === "left", w = wt(...p.map((T) => T.right)), k = Dt(...p.map((T) => T.left)), C = p.filter((T) => x ? T.left === k : T.right === w), j = C[0].top, N = C[C.length - 1].bottom;
          return fn({
            x: k,
            y: j,
            width: w - k,
            height: N - j
          });
        }
        return m;
      }
      const v = await s.getElementRects({
        reference: {
          getBoundingClientRect: g
        },
        floating: o.floating,
        strategy: a
      });
      return r.reference.x !== v.reference.x || r.reference.y !== v.reference.y || r.reference.width !== v.reference.width || r.reference.height !== v.reference.height ? {
        reset: {
          rects: v
        }
      } : {};
    }
  };
}, Ql = /* @__PURE__ */ new Set(["left", "top"]);
async function Em(e, t) {
  const {
    placement: n,
    platform: o,
    elements: r
  } = e, s = await (o.isRTL == null ? void 0 : o.isRTL(r.floating)), a = Ht(n), i = mo(n), c = Mt(n) === "y", u = Ql.has(a) ? -1 : 1, f = s && c ? -1 : 1, p = Vt(t, e);
  let {
    mainAxis: m,
    crossAxis: h,
    alignmentAxis: g
  } = typeof p == "number" ? {
    mainAxis: p,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: p.mainAxis || 0,
    crossAxis: p.crossAxis || 0,
    alignmentAxis: p.alignmentAxis
  };
  return i && typeof g == "number" && (h = i === "end" ? g * -1 : g), c ? {
    x: h * f,
    y: m * u
  } : {
    x: m * u,
    y: h * f
  };
}
const Rm = function(e) {
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
      } = t, c = await Em(t, e);
      return a === ((n = i.offset) == null ? void 0 : n.placement) && (o = i.arrow) != null && o.alignmentOffset ? {} : {
        x: r + c.x,
        y: s + c.y,
        data: {
          ...c,
          placement: a
        }
      };
    }
  };
}, Nm = function(e) {
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
        limiter: c = {
          fn: (k) => {
            let {
              x: C,
              y: j
            } = k;
            return {
              x: C,
              y: j
            };
          }
        },
        ...u
      } = Vt(e, t), f = {
        x: n,
        y: o
      }, p = await s.detectOverflow(t, u), m = Mt(r), h = Ma(m);
      let g = f[h], v = f[m];
      const x = (k, C) => Jl(C + p[k === "y" ? "top" : "left"], C, C - p[k === "y" ? "bottom" : "right"]);
      a && (g = x(h, g)), i && (v = x(m, v));
      const w = c.fn({
        ...t,
        [h]: g,
        [m]: v
      });
      return {
        ...w,
        data: {
          x: w.x - n,
          y: w.y - o,
          enabled: {
            [h]: a,
            [m]: i
          }
        }
      };
    }
  };
}, Tm = function(e) {
  return e === void 0 && (e = {}), {
    options: e,
    fn(t) {
      var n, o;
      const {
        x: r,
        y: s,
        placement: a,
        rects: i,
        middlewareData: c
      } = t, {
        offset: u = 0,
        mainAxis: f = !0,
        crossAxis: p = !0
      } = Vt(e, t), m = {
        x: r,
        y: s
      }, h = Mt(a), g = Ma(h);
      let v = m[g], x = m[h];
      const w = Vt(u, t), k = typeof w == "number" ? {
        mainAxis: w,
        crossAxis: 0
      } : {
        mainAxis: (n = w.mainAxis) != null ? n : 0,
        crossAxis: (o = w.crossAxis) != null ? o : 0
      };
      if (f) {
        const N = g === "y" ? "height" : "width", T = i.reference[g] - i.floating[N] + k.mainAxis, S = i.reference[g] + i.reference[N] - k.mainAxis;
        v < T ? v = T : v > S && (v = S);
      }
      if (p) {
        var C, j;
        const N = g === "y" ? "width" : "height", T = Ql.has(Ht(a)), S = i.reference[h] - i.floating[N] + (T && ((C = c.offset) == null ? void 0 : C[h]) || 0) + (T ? 0 : k.crossAxis), y = i.reference[h] + i.reference[N] + (T ? 0 : ((j = c.offset) == null ? void 0 : j[h]) || 0) - (T ? k.crossAxis : 0);
        x < S ? x = S : x > y && (x = y);
      }
      return {
        [g]: v,
        [h]: x
      };
    }
  };
}, Pm = function(e) {
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
      } = Vt(e, t), c = await r.detectOverflow(t, i), u = Ht(n), f = mo(n), p = Mt(n) === "y", {
        width: m,
        height: h
      } = o.floating;
      let g, v;
      u === "top" || u === "bottom" ? (g = u, v = f === (await (r.isRTL == null ? void 0 : r.isRTL(s.floating)) ? "start" : "end") ? "left" : "right") : (v = u, g = f === "end" ? "top" : "bottom");
      const x = h - c.top - c.bottom, w = m - c.left - c.right, k = Dt(h - c[g], x), C = Dt(m - c[v], w), j = t.middlewareData.shift, N = !j;
      let T = k, S = C;
      j != null && j.enabled.x && (S = w), j != null && j.enabled.y && (T = x), N && !f && (p ? S = m - 2 * wt(c.left, c.right) : T = h - 2 * wt(c.top, c.bottom)), await a({
        ...t,
        availableWidth: S,
        availableHeight: T
      });
      const y = await r.getDimensions(s.floating);
      return m !== y.width || h !== y.height ? {
        reset: {
          rects: !0
        }
      } : {};
    }
  };
};
function eu(e) {
  const t = Bt(e);
  let n = parseFloat(t.width) || 0, o = parseFloat(t.height) || 0;
  const r = yn(e), s = r ? e.offsetWidth : n, a = r ? e.offsetHeight : o, i = Ar(n) !== s || Ar(o) !== a;
  return i && (n = s, o = a), {
    width: n,
    height: o,
    $: i
  };
}
function $a(e) {
  return ft(e) ? e : e.contextElement;
}
function Xn(e) {
  const t = $a(e);
  if (!yn(t))
    return Xt(1);
  const n = t.getBoundingClientRect(), {
    width: o,
    height: r,
    $: s
  } = eu(t);
  let a = (s ? Ar(n.width) : n.width) / o, i = (s ? Ar(n.height) : n.height) / r;
  return (!a || !Number.isFinite(a)) && (a = 1), (!i || !Number.isFinite(i)) && (i = 1), {
    x: a,
    y: i
  };
}
const Am = /* @__PURE__ */ Xt(0);
function tu(e) {
  const t = pt(e);
  return !Aa() || !t.visualViewport ? Am : {
    x: t.visualViewport.offsetLeft,
    y: t.visualViewport.offsetTop
  };
}
function Mm(e, t, n) {
  return t === void 0 && (t = !1), !!n && t && n === pt(e);
}
function Tn(e, t, n, o) {
  t === void 0 && (t = !1), n === void 0 && (n = !1);
  const r = e.getBoundingClientRect(), s = $a(e);
  let a = Xt(1);
  t && (o ? ft(o) && (a = Xn(o)) : a = Xn(e));
  const i = Mm(s, n, o) ? tu(s) : Xt(0);
  let c = (r.left + i.x) / a.x, u = (r.top + i.y) / a.y, f = r.width / a.x, p = r.height / a.y;
  if (s && o) {
    const m = pt(s), h = ft(o) ? pt(o) : o;
    let g = m, v = Gs(g);
    for (; v && h !== g; ) {
      const x = Xn(v), w = v.getBoundingClientRect(), k = Bt(v), C = w.left + (v.clientLeft + parseFloat(k.paddingLeft)) * x.x, j = w.top + (v.clientTop + parseFloat(k.paddingTop)) * x.y;
      c *= x.x, u *= x.y, f *= x.x, p *= x.y, c += C, u += j, g = pt(v), v = Gs(g);
    }
  }
  return fn({
    width: f,
    height: p,
    x: c,
    y: u
  });
}
function Jr(e, t) {
  const n = Gr(e).scrollLeft;
  return t ? t.left + n : Tn(Qt(e)).left + n;
}
function nu(e, t) {
  const n = e.getBoundingClientRect(), o = n.left + t.scrollLeft - Jr(e, n), r = n.top + t.scrollTop;
  return {
    x: o,
    y: r
  };
}
function Im(e) {
  let {
    elements: t,
    rect: n,
    offsetParent: o,
    strategy: r
  } = e;
  const s = r === "fixed", a = Qt(o), i = t ? Yr(t.floating) : !1;
  if (o === a || i && s)
    return n;
  let c = {
    scrollLeft: 0,
    scrollTop: 0
  }, u = Xt(1);
  const f = Xt(0), p = yn(o);
  if ((p || !s) && ((po(o) !== "body" || Xr(a)) && (c = Gr(o)), p)) {
    const h = Tn(o);
    u = Xn(o), f.x = h.x + o.clientLeft, f.y = h.y + o.clientTop;
  }
  const m = a && !p && !s ? nu(a, c) : Xt(0);
  return {
    width: n.width * u.x,
    height: n.height * u.y,
    x: n.x * u.x - c.scrollLeft * u.x + f.x + m.x,
    y: n.y * u.y - c.scrollTop * u.y + f.y + m.y
  };
}
function Dm(e) {
  return e.getClientRects ? Array.from(e.getClientRects()) : [];
}
function Om(e) {
  const t = Gr(e), n = e.ownerDocument.body, o = wt(e.scrollWidth, e.clientWidth, n.scrollWidth, n.clientWidth), r = wt(e.scrollHeight, e.clientHeight, n.scrollHeight, n.clientHeight);
  let s = -t.scrollLeft + Jr(e);
  const a = -t.scrollTop;
  return Bt(n).direction === "rtl" && (s += wt(e.clientWidth, n.clientWidth) - o), {
    width: o,
    height: r,
    x: s,
    y: a
  };
}
const $m = 25;
function Lm(e, t, n) {
  n === void 0 && (n = "viewport");
  const o = n === "layoutViewport", r = pt(e), s = Qt(e), a = r.visualViewport;
  let i = s.clientWidth, c = s.clientHeight, u = 0, f = 0;
  if (a) {
    const m = !Aa() || t === "fixed";
    o ? m || (u = -a.offsetLeft, f = -a.offsetTop) : (i = a.width, c = a.height, m && (u = a.offsetLeft, f = a.offsetTop));
  }
  if (Jr(s) <= 0) {
    const m = s.ownerDocument, h = m.body, g = getComputedStyle(h), v = m.compatMode === "CSS1Compat" && parseFloat(g.marginLeft) + parseFloat(g.marginRight) || 0, x = Math.abs(s.clientWidth - h.clientWidth - v), w = getComputedStyle(s).scrollbarGutter === "stable both-edges" ? x / 2 : x;
    w <= $m && (i -= w);
  }
  return {
    width: i,
    height: c,
    x: u,
    y: f
  };
}
function _m(e, t) {
  const n = Tn(e, !0, t === "fixed"), o = n.top + e.clientTop, r = n.left + e.clientLeft, s = Xn(e), a = e.clientWidth * s.x, i = e.clientHeight * s.y, c = r * s.x, u = o * s.y;
  return {
    width: a,
    height: i,
    x: c,
    y: u
  };
}
function tc(e, t, n) {
  let o;
  if (t === "viewport" || t === "layoutViewport")
    o = Lm(e, n, t);
  else if (t === "document")
    o = Om(Qt(e));
  else if (ft(t))
    o = _m(t, n);
  else {
    const r = tu(e);
    o = {
      x: t.x - r.x,
      y: t.y - r.y,
      width: t.width,
      height: t.height
    };
  }
  return fn(o);
}
function zm(e, t) {
  const n = t.get(e);
  if (n)
    return n;
  let o = Io(e, [], !1).filter((i) => ft(i) && po(i) !== "body"), r = null;
  const s = Bt(e).position === "fixed";
  let a = s ? Nn(e) : e;
  for (; ft(a) && !Mo(a); ) {
    const i = Bt(a), c = Pa(a), u = r ? r.position : s ? "fixed" : "";
    !c && (u === "fixed" || u === "absolute" && i.position === "static") ? o = o.filter((p) => p !== a) : r = i, a = Nn(a);
  }
  return t.set(e, o), o;
}
function Fm(e) {
  let {
    element: t,
    boundary: n,
    rootBoundary: o,
    strategy: r
  } = e;
  const a = [...n === "clippingAncestors" ? Yr(t) ? [] : zm(t, this._c) : [].concat(n), o], i = tc(t, a[0], r);
  let c = i.top, u = i.right, f = i.bottom, p = i.left;
  for (let m = 1; m < a.length; m++) {
    const h = tc(t, a[m], r);
    c = wt(h.top, c), u = Dt(h.right, u), f = Dt(h.bottom, f), p = wt(h.left, p);
  }
  return {
    width: u - p,
    height: f - c,
    x: p,
    y: c
  };
}
function Bm(e) {
  const {
    width: t,
    height: n
  } = eu(e);
  return {
    width: t,
    height: n
  };
}
function Vm(e, t, n) {
  const o = yn(t), r = Qt(t), s = n === "fixed", a = Tn(e, !0, s, t);
  let i = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const c = Xt(0);
  if ((o || !s) && ((po(t) !== "body" || Xr(r)) && (i = Gr(t)), o)) {
    const m = Tn(t, !0, s, t);
    c.x = m.x + t.clientLeft, c.y = m.y + t.clientTop;
  }
  !o && r && (c.x = Jr(r));
  const u = r && !o && !s ? nu(r, i) : Xt(0), f = a.left + i.scrollLeft - c.x - u.x, p = a.top + i.scrollTop - c.y - u.y;
  return {
    x: f,
    y: p,
    width: a.width,
    height: a.height
  };
}
function Rs(e) {
  return Bt(e).position === "static";
}
function nc(e, t) {
  if (!yn(e) || Bt(e).position === "fixed")
    return null;
  if (t)
    return t(e);
  let n = e.offsetParent;
  return Qt(e) === n && (n = n.ownerDocument.body), n;
}
function ou(e, t) {
  const n = pt(e);
  if (Yr(e))
    return n;
  if (!yn(e)) {
    let r = Nn(e);
    for (; r && !Mo(r); ) {
      if (ft(r) && !Rs(r))
        return r;
      r = Nn(r);
    }
    return n;
  }
  let o = nc(e, t);
  for (; o && Qp(o) && Rs(o); )
    o = nc(o, t);
  return o && Mo(o) && Rs(o) && !Pa(o) ? n : o || nm(e) || n;
}
const Hm = async function(e) {
  const t = this.getOffsetParent || ou, n = this.getDimensions, o = await n(e.floating);
  return {
    reference: Vm(e.reference, await t(e.floating), e.strategy),
    floating: {
      x: 0,
      y: 0,
      width: o.width,
      height: o.height
    }
  };
};
function Wm(e) {
  return Bt(e).direction === "rtl";
}
const Um = {
  convertOffsetParentRelativeRectToViewportRelativeRect: Im,
  getDocumentElement: Qt,
  getClippingRect: Fm,
  getOffsetParent: ou,
  getElementRects: Hm,
  getClientRects: Dm,
  getDimensions: Bm,
  getScale: Xn,
  isElement: ft,
  isRTL: Wm
};
function ru(e, t) {
  return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function qm(e, t, n) {
  let o = null, r;
  const s = Qt(e);
  function a() {
    var f;
    clearTimeout(r), (f = o) == null || f.disconnect(), o = null;
  }
  function i(f, p) {
    f === void 0 && (f = !1), p === void 0 && (p = 1), a();
    const m = e.getBoundingClientRect(), {
      left: h,
      top: g,
      width: v,
      height: x
    } = m;
    if (f || t(), !v || !x)
      return;
    const w = fr(g), k = fr(s.clientWidth - (h + v)), C = fr(s.clientHeight - (g + x)), j = fr(h), T = {
      rootMargin: -w + "px " + -k + "px " + -C + "px " + -j + "px",
      threshold: wt(0, Dt(1, p)) || 1
    };
    let S = !0;
    function y(R) {
      const D = R[0].intersectionRatio;
      if (!ru(m, e.getBoundingClientRect()))
        return i();
      if (D !== p) {
        if (!S)
          return i();
        D ? i(!1, D) : r = setTimeout(() => {
          i(!1, 1e-7);
        }, 1e3);
      }
      S = !1;
    }
    try {
      o = new IntersectionObserver(y, {
        ...T,
        // Handle <iframe>s
        root: s.ownerDocument
      });
    } catch {
      o = new IntersectionObserver(y, T);
    }
    o.observe(e);
  }
  const c = pt(e), u = () => i(n);
  return c.addEventListener("resize", u), i(!0), () => {
    c.removeEventListener("resize", u), a();
  };
}
function oc(e, t, n, o) {
  o === void 0 && (o = {});
  const {
    ancestorScroll: r = !0,
    ancestorResize: s = !0,
    elementResize: a = typeof ResizeObserver == "function",
    layoutShift: i = typeof IntersectionObserver == "function",
    animationFrame: c = !1
  } = o, u = $a(e), f = r || s ? [...u ? Io(u) : [], ...t ? Io(t) : []] : [];
  f.forEach((w) => {
    r && w.addEventListener("scroll", n), s && w.addEventListener("resize", n);
  });
  const p = u && i ? qm(u, n, s) : null;
  let m = -1, h = null;
  a && (h = new ResizeObserver((w) => {
    let [k] = w;
    k && k.target === u && h && t && (h.unobserve(t), cancelAnimationFrame(m), m = requestAnimationFrame(() => {
      var C;
      (C = h) == null || C.observe(t);
    })), n();
  }), u && !c && h.observe(u), t && h.observe(t));
  let g, v = c ? Tn(e) : null;
  c && x();
  function x() {
    const w = Tn(e);
    v && !ru(v, w) && n(), v = w, g = requestAnimationFrame(x);
  }
  return n(), () => {
    var w;
    f.forEach((k) => {
      r && k.removeEventListener("scroll", n), s && k.removeEventListener("resize", n);
    }), p?.(), (w = h) == null || w.disconnect(), h = null, c && cancelAnimationFrame(g);
  };
}
const Km = Rm, Xm = Nm, Ym = Sm, Gm = Pm, Jm = Cm, rc = wm, Zm = km, Qm = Tm, eh = (e, t, n) => {
  const o = /* @__PURE__ */ new Map(), r = n ?? {}, s = {
    ...Um,
    ...r.platform,
    _c: o
  };
  return xm(e, t, {
    ...r,
    platform: s
  });
};
var th = typeof document < "u", nh = function() {
}, br = th ? d.useLayoutEffect : nh;
function Ir(e, t) {
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
        if (!Ir(e[o], t[o]))
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
      if (!(s === "_owner" && e.$$typeof) && !Ir(e[s], t[s]))
        return !1;
    }
    return !0;
  }
  return e !== e && t !== t;
}
function su(e) {
  return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function sc(e, t) {
  const n = su(e);
  return Math.round(t * n) / n;
}
function Ns(e) {
  const t = d.useRef(e);
  return br(() => {
    t.current = e;
  }), t;
}
function oh(e) {
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
    whileElementsMounted: c,
    open: u
  } = e, [f, p] = d.useState({
    x: 0,
    y: 0,
    strategy: n,
    placement: t,
    middlewareData: {},
    isPositioned: !1
  }), [m, h] = d.useState(o);
  Ir(m, o) || h(o);
  const [g, v] = d.useState(null), [x, w] = d.useState(null), k = d.useCallback((M) => {
    M !== T.current && (T.current = M, v(M));
  }, []), C = d.useCallback((M) => {
    M !== S.current && (S.current = M, w(M));
  }, []), j = s || g, N = a || x, T = d.useRef(null), S = d.useRef(null), y = d.useRef(f), R = c != null, D = Ns(c), O = Ns(r), z = Ns(u), _ = d.useCallback(() => {
    if (!T.current || !S.current)
      return;
    const M = {
      placement: t,
      strategy: n,
      middleware: m
    };
    O.current && (M.platform = O.current), eh(T.current, S.current, M).then((P) => {
      const B = {
        ...P,
        // The floating element's position may be recomputed while it's closed
        // but still mounted (such as when transitioning out). To ensure
        // `isPositioned` will be `false` initially on the next open, avoid
        // setting it to `true` when `open === false` (must be specified).
        isPositioned: z.current !== !1
      };
      F.current && !Ir(y.current, B) && (y.current = B, Ft.flushSync(() => {
        p(B);
      }));
    });
  }, [m, t, n, O, z]);
  br(() => {
    u === !1 && y.current.isPositioned && (y.current.isPositioned = !1, p((M) => ({
      ...M,
      isPositioned: !1
    })));
  }, [u]);
  const F = d.useRef(!1);
  br(() => (F.current = !0, () => {
    F.current = !1;
  }), []), br(() => {
    if (j && (T.current = j), N && (S.current = N), j && N) {
      if (D.current)
        return D.current(j, N, _);
      _();
    }
  }, [j, N, _, D, R]);
  const $ = d.useMemo(() => ({
    reference: T,
    floating: S,
    setReference: k,
    setFloating: C
  }), [k, C]), I = d.useMemo(() => ({
    reference: j,
    floating: N
  }), [j, N]), L = d.useMemo(() => {
    const M = {
      position: n,
      left: 0,
      top: 0
    };
    if (!I.floating)
      return M;
    const P = sc(I.floating, f.x), B = sc(I.floating, f.y);
    return i ? {
      ...M,
      transform: "translate(" + P + "px, " + B + "px)",
      ...su(I.floating) >= 1.5 && {
        willChange: "transform"
      }
    } : {
      position: n,
      left: P,
      top: B
    };
  }, [n, i, I.floating, f.x, f.y]);
  return d.useMemo(() => ({
    ...f,
    update: _,
    refs: $,
    elements: I,
    floatingStyles: L
  }), [f, _, $, I, L]);
}
const rh = (e) => {
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
      return o && t(o) ? o.current != null ? rc({
        element: o.current,
        padding: r
      }).fn(n) : {} : o ? rc({
        element: o,
        padding: r
      }).fn(n) : {};
    }
  };
}, sh = (e, t) => {
  const n = Km(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, ah = (e, t) => {
  const n = Xm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, ih = (e, t) => ({
  fn: Qm(e).fn,
  options: [e, t]
}), ch = (e, t) => {
  const n = Ym(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, lh = (e, t) => {
  const n = Gm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, uh = (e, t) => {
  const n = Jm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, ac = (e, t) => {
  const n = Zm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, dh = (e, t) => {
  const n = rh(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
};
function au(e) {
  const t = d.useRef(void 0), n = d.useCallback((o) => {
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
  return d.useMemo(() => e.every((o) => o == null) ? null : (o) => {
    t.current && (t.current(), t.current = void 0), o != null && (t.current = n(o));
  }, e);
}
const fh = {
  ...hl
};
let ic = !1, ph = 0;
const cc = () => (
  // Ensure the id is unique with multiple independent versions of Floating UI
  // on <React 18
  "floating-ui-" + Math.random().toString(36).slice(2, 6) + ph++
);
function mh() {
  const [e, t] = d.useState(() => ic ? cc() : void 0);
  return Zs(() => {
    e == null && t(cc());
  }, []), d.useEffect(() => {
    ic = !0;
  }, []), e;
}
const hh = fh.useId, gh = hh || mh;
function vh() {
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
const yh = /* @__PURE__ */ d.createContext(null), bh = /* @__PURE__ */ d.createContext(null), xh = () => {
  var e;
  return ((e = d.useContext(yh)) == null ? void 0 : e.id) || null;
}, wh = () => d.useContext(bh);
function Sh(e) {
  const {
    open: t = !1,
    onOpenChange: n,
    elements: o
  } = e, r = gh(), s = d.useRef({}), [a] = d.useState(() => vh()), i = xh() != null, [c, u] = d.useState(o.reference), f = vm((h, g, v) => {
    s.current.openEvent = h ? g : void 0, a.emit("openchange", {
      open: h,
      event: g,
      reason: v,
      nested: i
    }), n?.(h, g, v);
  }), p = d.useMemo(() => ({
    setPositionReference: u
  }), []), m = d.useMemo(() => ({
    reference: c || o.reference || null,
    floating: o.floating || null,
    domReference: o.reference
  }), [c, o.reference, o.floating]);
  return d.useMemo(() => ({
    dataRef: s,
    open: t,
    onOpenChange: f,
    elements: m,
    events: a,
    floatingId: r,
    refs: p
  }), [t, f, m, a, r, p]);
}
function Ch(e) {
  var t, n;
  let {
    elements: o,
    ...r
  } = e === void 0 ? {} : e;
  const {
    nodeId: s
  } = r, a = Sh({
    ...r,
    elements: {
      reference: (t = o?.reference) != null ? t : null,
      floating: (n = o?.floating) != null ? n : null
    }
  }), i = r.rootContext || a, c = i.elements, [u, f] = d.useState(null), [p, m] = d.useState(null), g = c?.domReference || u, v = d.useRef(null), x = wh();
  Zs(() => {
    g && (v.current = g);
  }, [g]);
  const w = oh({
    ...r,
    elements: {
      ...c,
      ...p && {
        reference: p
      }
    }
  }), k = d.useCallback((S) => {
    const y = ft(S) ? {
      getBoundingClientRect: () => S.getBoundingClientRect(),
      getClientRects: () => S.getClientRects(),
      contextElement: S
    } : S;
    m(y), w.refs.setReference(y);
  }, [w.refs]), C = d.useCallback((S) => {
    (ft(S) || S === null) && (v.current = S, f(S)), (ft(w.refs.reference.current) || w.refs.reference.current === null || // Don't allow setting virtual elements using the old technique back to
    // `null` to support `positionReference` + an unstable `reference`
    // callback ref.
    S !== null && !ft(S)) && w.refs.setReference(S);
  }, [w.refs]), j = d.useMemo(() => ({
    ...w.refs,
    setReference: C,
    setPositionReference: k,
    domReference: v
  }), [w.refs, C, k]), N = d.useMemo(() => ({
    ...w.elements,
    domReference: g
  }), [w.elements, g]), T = d.useMemo(() => ({
    ...w,
    ...i,
    refs: j,
    elements: N,
    nodeId: s
  }), [w, j, N, s, i]);
  return Zs(() => {
    i.dataRef.current.floatingContext = T;
    const S = x?.nodesRef.current.find((y) => y.id === s);
    S && (S.context = T);
  }), d.useMemo(() => ({
    ...w,
    context: T,
    refs: j,
    elements: N
  }), [w, j, N, T]);
}
const iu = {
  scrollHideDelay: 1e3,
  type: "hover",
  scrollbars: "xy"
}, cu = Oe((e, { scrollbarSize: t, overscrollBehavior: n, scrollbars: o }) => {
  let r = n;
  return n && o && (o === "x" ? r = `${n} auto` : o === "y" && (r = `auto ${n}`)), { root: {
    "--scrollarea-scrollbar-size": Pe(t),
    "--scrollarea-over-scroll-behavior": r
  } };
}), bn = se((e) => {
  const t = Z("ScrollArea", iu, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, scrollbarSize: i, vars: c, type: u, scrollHideDelay: f, viewportProps: p, viewportRef: m, onScrollPositionChange: h, children: g, offsetScrollbars: v, scrollbars: x, onBottomReached: w, onTopReached: k, onLeftReached: C, onRightReached: j, overscrollBehavior: N, startScrollPosition: T, verticalScrollbarPosition: S, attributes: y, ...R } = t, [D, O] = d.useState(!1), [z, _] = d.useState(!1), [F, $] = d.useState(!1), I = d.useRef(!0), L = d.useRef(!1), M = d.useRef(!0), P = d.useRef(!1), B = Me({
    name: "ScrollArea",
    props: t,
    classes: Ta,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: y,
    vars: c,
    varsResolver: cu
  }), W = d.useRef(null), [U, Y] = d.useState(null), ae = d.useCallback((ie) => {
    Y((te) => te === ie ? te : ie);
  }, []), fe = au([
    m,
    W,
    ae
  ]);
  return mn(v === "present" ? U : null, () => {
    const ie = W.current;
    ie && (_(ie.scrollHeight > ie.clientHeight), $(ie.scrollWidth > ie.clientWidth));
  }), To(() => {
    T && W.current && W.current.scrollTo({
      left: T.x ?? 0,
      top: T.y ?? 0
    });
  }, []), /* @__PURE__ */ l.jsxs(_l, {
    getStyles: B,
    type: u === "never" ? "always" : u,
    scrollHideDelay: f,
    scrollbars: x,
    ...B("root"),
    ...R,
    children: [
      /* @__PURE__ */ l.jsx(Xl, {
        ...p,
        ...B("viewport", { style: p?.style }),
        ref: fe,
        "data-offset-scrollbars": v === !0 ? "xy" : v || void 0,
        "data-scrollbars": x || void 0,
        "data-vertical-scrollbar-position": S || void 0,
        "data-horizontal-hidden": v === "present" && !F ? "true" : void 0,
        "data-vertical-hidden": v === "present" && !z ? "true" : void 0,
        onScroll: (ie) => {
          p?.onScroll?.(ie), h?.({
            x: ie.currentTarget.scrollLeft,
            y: ie.currentTarget.scrollTop
          });
          const { scrollTop: te, scrollHeight: me, clientHeight: q, scrollLeft: K, scrollWidth: ce, clientWidth: be } = ie.currentTarget, pe = te - (me - q) >= -0.8, Se = te === 0;
          pe && !L.current && w?.(), Se && !I.current && k?.(), L.current = pe, I.current = Se;
          const ne = K - (ce - be) >= -0.8, H = K === 0;
          ne && !P.current && j?.(), H && !M.current && C?.(), P.current = ne, M.current = H;
        },
        children: g
      }),
      (x === "xy" || x === "x") && /* @__PURE__ */ l.jsx(Xs, {
        ...B("scrollbar"),
        orientation: "horizontal",
        "data-vertical-scrollbar-position": S || void 0,
        "data-hidden": u === "never" || v === "present" && !F ? !0 : void 0,
        forceMount: !0,
        onMouseEnter: () => O(!0),
        onMouseLeave: () => O(!1),
        children: /* @__PURE__ */ l.jsx(Ys, { ...B("thumb") })
      }),
      (x === "xy" || x === "y") && /* @__PURE__ */ l.jsx(Xs, {
        ...B("scrollbar"),
        orientation: "vertical",
        "data-vertical-scrollbar-position": S || void 0,
        "data-hidden": u === "never" || v === "present" && !z ? !0 : void 0,
        forceMount: !0,
        onMouseEnter: () => O(!0),
        onMouseLeave: () => O(!1),
        children: /* @__PURE__ */ l.jsx(Ys, { ...B("thumb") })
      }),
      /* @__PURE__ */ l.jsx(qp, {
        ...B("corner"),
        "data-vertical-scrollbar-position": S || void 0,
        "data-hovered": D || void 0,
        "data-hidden": u === "never" || void 0
      })
    ]
  });
});
bn.displayName = "@mantine/core/ScrollArea";
const La = se((e) => {
  const { children: t, classNames: n, styles: o, scrollbarSize: r, scrollHideDelay: s, type: a, dir: i, offsetScrollbars: c, overscrollBehavior: u, viewportRef: f, onScrollPositionChange: p, unstyled: m, variant: h, viewportProps: g, scrollbars: v, style: x, vars: w, onBottomReached: k, onTopReached: C, startScrollPosition: j, verticalScrollbarPosition: N, onOverflowChange: T, ...S } = Z("ScrollAreaAutosize", iu, e), y = d.useRef(null), [R, D] = d.useState(null), O = d.useCallback((I) => {
    D((L) => L === I ? L : I);
  }, []), z = au([
    f,
    y,
    O
  ]), _ = d.useRef(!1), F = d.useRef(!1), $ = d.useEffectEvent(() => {
    const I = y.current;
    if (!I || !T) return;
    const L = I.scrollHeight > I.clientHeight;
    L !== _.current && (F.current ? T(L) : (F.current = !0, L && T(!0)), _.current = L);
  });
  return mn(T ? R : null, $), /* @__PURE__ */ l.jsx(Q, {
    ...S,
    variant: h,
    style: [{
      display: "flex",
      overflow: "hidden"
    }, x],
    children: /* @__PURE__ */ l.jsx(Q, {
      style: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
        ...v === "y" && { minWidth: 0 },
        ...v === "x" && { minHeight: 0 },
        ...v === "xy" && {
          minWidth: 0,
          minHeight: 0
        },
        ...v === !1 && {
          minWidth: 0,
          minHeight: 0
        }
      },
      children: /* @__PURE__ */ l.jsx(bn, {
        classNames: n,
        styles: o,
        scrollHideDelay: s,
        scrollbarSize: r,
        type: a,
        dir: i,
        offsetScrollbars: c,
        overscrollBehavior: u,
        viewportRef: z,
        onScrollPositionChange: p,
        unstyled: m,
        variant: h,
        viewportProps: g,
        vars: w,
        scrollbars: v,
        onBottomReached: k,
        onTopReached: C,
        startScrollPosition: j,
        verticalScrollbarPosition: N,
        "data-autosize": "true",
        children: t
      })
    })
  });
});
bn.classes = Ta;
bn.varsResolver = cu;
La.displayName = "@mantine/core/ScrollAreaAutosize";
La.classes = Ta;
bn.Autosize = La;
var lu = { root: "m_515a97f8" };
const _a = se((e) => {
  const t = Z("VisuallyHidden", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, attributes: c, ...u } = t, f = Me({
    name: "VisuallyHidden",
    classes: lu,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: c
  });
  return /* @__PURE__ */ l.jsx(Q, {
    component: "span",
    ...f("root"),
    ...u
  });
});
_a.classes = lu;
_a.displayName = "@mantine/core/VisuallyHidden";
function lc(e, t, n, o) {
  return e === "center" || o === "center" ? { top: t } : e === "end" ? { bottom: n } : e === "start" ? { top: n } : {};
}
function uc(e, t, n, o, r) {
  return e === "center" || o === "center" ? { left: t } : e === "end" ? { [r === "ltr" ? "right" : "left"]: n } : e === "start" ? { [r === "ltr" ? "left" : "right"]: n } : {};
}
const jh = {
  bottom: "borderTopLeftRadius",
  left: "borderTopRightRadius",
  right: "borderBottomLeftRadius",
  top: "borderBottomRightRadius"
};
function kh({ position: e, arrowSize: t, dir: n }) {
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
function Eh({ position: e, arrowSize: t, arrowOffset: n, arrowRadius: o, arrowPosition: r, arrowX: s, arrowY: a, dir: i }) {
  if (r === "merge") {
    const m = kh({
      position: e,
      arrowSize: t,
      dir: i
    });
    if (m) return m;
  }
  const [c, u = "center"] = e.split("-"), f = {
    width: t,
    height: t,
    transform: "rotate(45deg)",
    position: "absolute",
    [jh[c]]: o
  }, p = -t / 2;
  return c === "left" ? {
    ...f,
    ...lc(u, a, n, r),
    right: p,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    clipPath: "polygon(100% 0, 0 0, 100% 100%)"
  } : c === "right" ? {
    ...f,
    ...lc(u, a, n, r),
    left: p,
    borderRightColor: "transparent",
    borderTopColor: "transparent",
    clipPath: "polygon(0 100%, 0 0, 100% 100%)"
  } : c === "top" ? {
    ...f,
    ...uc(u, s, n, r, i),
    bottom: p,
    borderTopColor: "transparent",
    borderLeftColor: "transparent",
    clipPath: "polygon(0 100%, 100% 100%, 100% 0)"
  } : c === "bottom" ? {
    ...f,
    ...uc(u, s, n, r, i),
    top: p,
    borderBottomColor: "transparent",
    borderRightColor: "transparent",
    clipPath: "polygon(0 100%, 0 0, 100% 0)"
  } : {};
}
function Rh({ position: e, dir: t }) {
  const [n, o] = e.split("-");
  if (!o) return;
  const r = o === "start" && t === "ltr" || o === "end" && t === "rtl";
  if (n === "bottom") return r ? { borderTopLeftRadius: 0 } : { borderTopRightRadius: 0 };
  if (n === "top") return r ? { borderBottomLeftRadius: 0 } : { borderBottomRightRadius: 0 };
  if (n === "left") return o === "start" ? { borderTopRightRadius: 0 } : { borderBottomRightRadius: 0 };
  if (n === "right") return o === "start" ? { borderTopLeftRadius: 0 } : { borderBottomLeftRadius: 0 };
}
function uu({ position: e, arrowSize: t, arrowOffset: n, arrowRadius: o, arrowPosition: r, visible: s, arrowX: a, arrowY: i, style: c, ...u }) {
  const { dir: f } = fo();
  return s ? /* @__PURE__ */ l.jsx("div", {
    role: "presentation",
    ...u,
    style: {
      ...c,
      ...Eh({
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
uu.displayName = "@mantine/core/FloatingArrow";
function Nh(e, t) {
  if (e === "rtl" && (t.includes("right") || t.includes("left"))) {
    const [n, o] = t.split("-"), r = n === "right" ? "left" : "right";
    return o === void 0 ? r : `${r}-${o}`;
  }
  return t;
}
const [Th, za] = Wt("Popover component was not found in the tree");
function Ph({ childProps: e, disabled: t, opened: n, longPressDelay: o = 500, setReference: r, open: s }) {
  const a = d.useRef(!1), i = d.useRef(!1), c = d.useRef(null), u = d.useRef(t);
  u.current = t;
  const f = (g, v, x) => {
    r({
      getBoundingClientRect: () => ({
        x: g,
        y: v,
        width: 0,
        height: 0,
        top: v,
        left: g,
        right: g,
        bottom: v,
        toJSON: () => {
        }
      }),
      contextElement: x
    }), s();
  }, p = _n(e.onMouseDown, (g) => {
    t || g.button === 2 && g.stopPropagation();
  }), m = _n(e.onContextMenu, (g) => {
    t || g.defaultPrevented || (g.preventDefault(), !i.current && (f(g.clientX, g.clientY, g.currentTarget), a.current && (i.current = !0)));
  }), h = Op((g) => {
    if (u.current || i.current) return;
    const v = g, x = v.touches[0] ?? v.changedTouches[0];
    x && (f(x.clientX, x.clientY, c.current), i.current = !0);
  }, {
    threshold: o,
    events: ["touch"],
    cancelOnMove: !0,
    onStart: (g) => {
      a.current = !0, i.current = !1, c.current = g.currentTarget;
    },
    onFinish: (g) => {
      a.current = !1, i.current = !1, u.current || g.preventDefault();
    },
    onCancel: () => {
      a.current = !1, i.current = !1;
    }
  });
  return {
    onContextMenu: m,
    onMouseDown: p,
    onTouchStart: _n(e.onTouchStart, h.onTouchStart),
    onTouchEnd: _n(e.onTouchEnd, h.onTouchEnd),
    onTouchCancel: _n(e.onTouchCancel, h.onTouchCancel),
    onTouchMove: _n(e.onTouchMove, h.onTouchMove),
    style: t ? e.style : {
      ...e.style,
      WebkitTouchCallout: "none",
      WebkitUserSelect: "none",
      userSelect: "none"
    },
    "data-expanded": n ? !0 : void 0
  };
}
function du(e) {
  const { children: t, disabled: n, longPressDelay: o } = Z("PopoverContextMenu", null, e), r = Ko(t);
  if (!r) throw new Error("Popover.ContextMenu component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  const s = za(), a = Ph({
    childProps: r.props,
    disabled: n || s.disabled,
    opened: s.opened,
    longPressDelay: o,
    setReference: s.reference,
    open: () => {
      s.opened || s.onToggle();
    }
  });
  return d.cloneElement(r, a);
}
du.displayName = "@mantine/core/PopoverContextMenu";
function Zr({ children: e, active: t = !0, refProp: n = "ref", innerRef: o }) {
  const r = wp(t), s = ze(r, o), a = Ko(e);
  return a ? d.cloneElement(a, { [n]: s }) : e;
}
function fu(e) {
  return /* @__PURE__ */ l.jsx(_a, {
    tabIndex: -1,
    "data-autofocus": !0,
    ...e
  });
}
Zr.displayName = "@mantine/core/FocusTrap";
fu.displayName = "@mantine/core/FocusTrapInitialFocus";
Zr.InitialFocus = fu;
var pu = {
  dropdown: "m_38a85659",
  arrow: "m_a31dc6c1",
  overlay: "m_3d7bc908"
};
const Fa = se((e) => {
  const t = Z("PopoverDropdown", null, e), { className: n, style: o, vars: r, children: s, onKeyDownCapture: a, variant: i, classNames: c, styles: u, ref: f, ...p } = t, m = za(), { dir: h } = fo(), g = m.arrowPosition === "merge" && m.withArrow ? Rh({
    position: m.placement,
    dir: h
  }) : void 0, v = Nl({
    opened: m.opened,
    shouldReturnFocus: m.returnFocus
  }), x = m.withRoles ? {
    "aria-labelledby": m.getTargetId(),
    id: m.getDropdownId(),
    role: "dialog",
    tabIndex: -1
  } : {}, w = ze(f, m.floating);
  return m.disabled ? null : /* @__PURE__ */ l.jsx(Ca, {
    ...m.portalProps,
    withinPortal: m.withinPortal,
    children: /* @__PURE__ */ l.jsx(Vr, {
      mounted: m.opened,
      ...m.transitionProps,
      transition: m.transitionProps?.transition || "fade",
      duration: m.transitionProps?.duration ?? 150,
      keepMounted: m.keepMounted,
      keepMountedMode: m.keepMountedMode,
      exitDuration: typeof m.transitionProps?.exitDuration == "number" ? m.transitionProps.exitDuration : m.transitionProps?.duration,
      children: (k) => /* @__PURE__ */ l.jsx(Zr, {
        active: m.trapFocus && m.opened,
        innerRef: w,
        children: /* @__PURE__ */ l.jsxs(Q, {
          ...x,
          ...p,
          variant: i,
          onKeyDownCapture: fp(() => {
            m.onClose?.(), m.onDismiss?.();
          }, {
            active: m.closeOnEscape,
            onTrigger: v,
            onKeyDown: a
          }),
          "data-position": m.placement,
          "data-fixed": m.floatingStrategy === "fixed" || void 0,
          ...m.getStyles("dropdown", {
            className: n,
            props: t,
            classNames: c,
            styles: u,
            style: [
              {
                ...k,
                ...g,
                zIndex: m.zIndex,
                top: m.y ?? 0,
                left: m.x ?? 0,
                width: m.width === "target" ? void 0 : Pe(m.width),
                ...m.referenceHidden ? { display: "none" } : null
              },
              m.resolvedStyles?.dropdown,
              u?.dropdown,
              o
            ]
          }),
          children: [s, /* @__PURE__ */ l.jsx(uu, {
            ref: m.arrowRef,
            arrowX: m.arrowX,
            arrowY: m.arrowY,
            visible: m.withArrow,
            position: m.placement,
            arrowSize: m.arrowSize,
            arrowRadius: m.arrowRadius,
            arrowOffset: m.arrowOffset,
            arrowPosition: m.arrowPosition,
            ...m.getStyles("arrow", {
              props: t,
              classNames: c,
              styles: u
            })
          })]
        })
      })
    })
  });
});
Fa.classes = pu;
Fa.displayName = "@mantine/core/PopoverDropdown";
const Ah = {
  refProp: "ref",
  popupType: "dialog"
}, mu = se((e) => {
  const { children: t, refProp: n, popupType: o, ref: r, ...s } = Z("PopoverTarget", Ah, e), a = Ko(t);
  if (!a) throw new Error("Popover.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  const i = s, c = za(), u = ze(c.reference, $l(a), r), f = c.withRoles ? {
    "aria-haspopup": o,
    "aria-expanded": c.opened,
    "aria-controls": c.opened ? c.getDropdownId() : void 0,
    id: c.getTargetId()
  } : {}, p = a.props;
  return d.cloneElement(a, {
    ...i,
    ...f,
    ...c.targetProps,
    className: Gt(c.targetProps.className, i.className, p.className),
    [n]: u,
    ...c.controlled ? null : { onClick: (m) => {
      c.onToggle(), p.onClick?.(m);
    } }
  });
});
mu.displayName = "@mantine/core/PopoverTarget";
function Mh(e) {
  if (e === void 0) return {
    shift: !0,
    flip: !0
  };
  const t = { ...e };
  return e.shift === void 0 && (t.shift = !0), e.flip === void 0 && (t.flip = !0), t;
}
function Ih(e, t, n, o) {
  const r = Mh(e.middlewares), s = [sh(e.offset), uh()];
  if (r.flip && !n) {
    const a = typeof r.flip == "boolean" ? {} : r.flip, i = o ? {
      fallbackStrategy: "initialPlacement",
      ...a
    } : a;
    s.push(ch(i));
  }
  if (r.shift) {
    const a = typeof r.shift == "boolean" ? {} : r.shift;
    s.push(ah((i) => {
      const c = i.placement.startsWith("top") || i.placement.startsWith("bottom");
      return {
        limiter: ih(),
        padding: 5,
        ...e.width === "target" && c ? { mainAxis: !1 } : null,
        ...a
      };
    }));
  }
  return r.inline && s.push(typeof r.inline == "boolean" ? ac() : ac(r.inline)), s.push(dh({
    element: e.arrowRef,
    padding: e.arrowOffset
  })), (r.size || e.width === "target") && s.push(lh({
    ...typeof r.size == "boolean" ? {} : r.size,
    apply({ rects: a, availableWidth: i, availableHeight: c, ...u }) {
      const f = t().refs.floating.current?.style ?? {};
      r.size && (typeof r.size == "object" && r.size.apply ? r.size.apply({
        rects: a,
        availableWidth: i,
        availableHeight: c,
        ...u
      }) : Object.assign(f, {
        maxWidth: `${i}px`,
        maxHeight: `${c}px`
      })), e.width === "target" && Object.assign(f, { width: `${a.reference.width}px` });
    }
  })), s;
}
function Dh(e) {
  const [t, n] = Ye({
    value: e.opened,
    defaultValue: e.defaultOpened,
    finalValue: !1,
    onChange: e.onChange
  }), o = d.useRef(t), r = d.useRef(!1), [s, a] = d.useState(null), i = e.preventPositionChangeWhenVisible !== !1, c = d.useRef(t);
  t !== c.current && (c.current = t, t && s !== null && a(null));
  const u = d.useRef(e.position);
  e.position !== u.current && (u.current = e.position, r.current = !1, s !== null && a(null));
  const f = d.useCallback(() => a(null), []), p = () => {
    t && !e.disabled && n(!1);
  }, m = () => {
    e.disabled || n(!t);
  }, h = Ch({
    open: t,
    strategy: e.strategy,
    placement: i ? s ?? e.position : e.position,
    middleware: Ih(e, () => h, i && s !== null, i),
    whileElementsMounted: e.keepMounted ? void 0 : oc
  });
  d.useEffect(() => {
    if (!e.keepMounted) return;
    const v = h.refs.reference.current, x = h.refs.floating.current;
    if (t && v && x) return oc(v, x, h.update);
  }, [
    e.keepMounted,
    t,
    h.update,
    h.elements.reference,
    h.elements.floating
  ]), To(() => {
    if (!t) {
      r.current = !1;
      return;
    }
    if (!i || s !== null) return;
    const v = h.refs.floating.current;
    if (!(!v || v.offsetHeight === 0 || v.offsetWidth === 0)) {
      if (!r.current) {
        r.current = !0, h.update();
        return;
      }
      h.isPositioned && a(h.placement);
    }
  }, [
    i,
    t,
    h.isPositioned,
    h.placement,
    s,
    h.update
  ]);
  const g = d.useRef(h.placement);
  return To(() => {
    g.current !== h.placement && (g.current = h.placement, e.onPositionChange?.(h.placement));
  }, [h.placement]), pn(() => {
    t !== o.current && (t ? e.onOpen?.() : e.onClose?.()), o.current = t;
  }, [
    t,
    e.onClose,
    e.onOpen
  ]), {
    floating: h,
    controlled: typeof e.opened == "boolean",
    opened: t,
    onClose: p,
    onToggle: m,
    resetLockedPlacement: f
  };
}
const Oh = {
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
  zIndex: uo("popover"),
  __staticSelector: "Popover",
  width: "max-content"
}, hu = Oe((e, { radius: t, shadow: n }) => ({ dropdown: {
  "--popover-radius": t === void 0 ? void 0 : kt(t),
  "--popover-shadow": gl(n)
} }));
function Fe(e) {
  const t = Z("Popover", Oh, e), { children: n, position: o, offset: r, onPositionChange: s, opened: a, transitionProps: i, onExitTransitionEnd: c, onEnterTransitionEnd: u, width: f, middlewares: p, withArrow: m, arrowSize: h, arrowOffset: g, arrowRadius: v, arrowPosition: x, unstyled: w, classNames: k, styles: C, closeOnClickOutside: j, withinPortal: N, portalProps: T, closeOnEscape: S, clickOutsideEvents: y, trapFocus: R, onClose: D, onDismiss: O, onOpen: z, onChange: _, zIndex: F, radius: $, shadow: I, id: L, defaultOpened: M, __staticSelector: P, withRoles: B, disabled: W, returnFocus: U, variant: Y, keepMounted: ae, keepMountedMode: fe, vars: ie, floatingStrategy: te, withOverlay: me, overlayProps: q, hideDetached: K, attributes: ce, preventPositionChangeWhenVisible: be, ...pe } = t, Se = Me({
    name: P,
    props: t,
    classes: pu,
    classNames: k,
    styles: C,
    unstyled: w,
    attributes: ce,
    rootSelector: "dropdown",
    vars: ie,
    varsResolver: hu
  }), { resolvedStyles: ne } = qo({
    classNames: k,
    styles: C,
    props: t
  }), H = d.useRef(null), [V, X] = d.useState(null), [le, Ce] = d.useState(null), { dir: Ae } = fo(), he = xa(), ge = $t(L), xe = Dh({
    middlewares: p,
    width: f,
    position: Nh(Ae, o),
    offset: typeof r == "number" ? r + (m ? h / 2 : 0) : r,
    arrowRef: H,
    arrowOffset: g,
    onPositionChange: s,
    opened: a,
    defaultOpened: M,
    onChange: _,
    onOpen: z,
    onClose: D,
    onDismiss: O,
    strategy: te,
    disabled: W,
    preventPositionChangeWhenVisible: be,
    keepMounted: ae
  });
  Rl(() => {
    j && (xe.onClose(), O?.());
  }, y, [V, le]);
  const Ie = d.useCallback((ht) => {
    X(ht), xe.floating.refs.setReference(ht);
  }, [xe.floating.refs.setReference]), de = d.useCallback((ht) => {
    Ce(ht), xe.floating.refs.setFloating(ht);
  }, [xe.floating.refs.setFloating]), mt = d.useCallback(() => {
    i?.onExited?.(), c?.(), xe.resetLockedPlacement();
  }, [
    i?.onExited,
    c,
    xe.resetLockedPlacement
  ]), Ne = d.useCallback(() => {
    i?.onEntered?.(), u?.();
  }, [i?.onEntered, u]);
  return /* @__PURE__ */ l.jsxs(Th, {
    value: {
      returnFocus: U,
      disabled: W,
      controlled: xe.controlled,
      reference: Ie,
      floating: de,
      x: xe.floating.x,
      y: xe.floating.y,
      arrowX: xe.floating?.middlewareData?.arrow?.x,
      arrowY: xe.floating?.middlewareData?.arrow?.y,
      opened: xe.opened,
      arrowRef: H,
      transitionProps: {
        ...i,
        onExited: mt,
        onEntered: Ne
      },
      width: f,
      withArrow: m,
      arrowSize: h,
      arrowOffset: g,
      arrowRadius: v,
      arrowPosition: x,
      placement: xe.floating.placement,
      trapFocus: R,
      withinPortal: N,
      portalProps: T,
      zIndex: F,
      radius: $,
      shadow: I,
      closeOnEscape: S,
      onDismiss: O,
      onClose: xe.onClose,
      onToggle: xe.onToggle,
      getTargetId: () => ge,
      getDropdownId: () => `${ge}-dropdown`,
      withRoles: B,
      targetProps: pe,
      __staticSelector: P,
      classNames: k,
      styles: C,
      unstyled: w,
      variant: Y,
      keepMounted: ae,
      keepMountedMode: fe,
      getStyles: Se,
      resolvedStyles: ne,
      floatingStrategy: te,
      referenceHidden: K && he !== "test" ? xe.floating.middlewareData.hide?.referenceHidden : !1
    },
    children: [n, me && /* @__PURE__ */ l.jsx(Vr, {
      transition: "fade",
      mounted: xe.opened,
      duration: i?.duration || 250,
      exitDuration: i?.exitDuration || 250,
      children: (ht) => /* @__PURE__ */ l.jsx(Ca, {
        withinPortal: N,
        children: /* @__PURE__ */ l.jsx(wl, {
          ...q,
          ...Se("overlay", {
            className: q?.className,
            style: [ht, q?.style]
          })
        })
      })
    })]
  });
}
Fe.Target = mu;
Fe.Dropdown = Fa;
Fe.ContextMenu = du;
Fe.varsResolver = hu;
Fe.displayName = "@mantine/core/Popover";
Fe.extend = (e) => e;
Fe.withProps = (e) => {
  const t = (n) => /* @__PURE__ */ l.jsx(Fe, {
    ...e,
    ...n
  });
  return t.extend = Fe.extend, t.displayName = `WithProps(${Fe.displayName})`, t;
};
const [$h, en] = Wt("ModalBase component was not found in tree");
function Lh({ opened: e, transitionDuration: t }) {
  const [n, o] = d.useState(e), r = d.useRef(-1), s = wa() ? 0 : t;
  return d.useEffect(() => (e ? (o(!0), window.clearTimeout(r.current)) : s === 0 ? o(!1) : r.current = window.setTimeout(() => o(!1), s), () => window.clearTimeout(r.current)), [e, s]), n;
}
function _h({ id: e, transitionProps: t, opened: n, trapFocus: o, closeOnEscape: r, onClose: s, returnFocus: a, handledEscapeEvents: i }) {
  const c = $t(e), [u, f] = d.useState(!1), [p, m] = d.useState(!1), h = typeof t?.duration == "number" ? t?.duration : 200, g = Lh({
    opened: n,
    transitionDuration: h
  });
  return jp("keydown", (v) => {
    v.key === "Escape" && r && !v.isComposing && n && !i?.has(v) && v.target?.getAttribute("data-mantine-stop-propagation") !== "true" && (i?.add(v), s());
  }, { capture: !0 }), Nl({
    opened: n,
    shouldReturnFocus: o && a
  }), {
    _id: c,
    titleMounted: u,
    bodyMounted: p,
    shouldLockScroll: g,
    setTitleMounted: f,
    setBodyMounted: m
  };
}
var zt = function() {
  return zt = Object.assign || function(t) {
    for (var n, o = 1, r = arguments.length; o < r; o++) {
      n = arguments[o];
      for (var s in n) Object.prototype.hasOwnProperty.call(n, s) && (t[s] = n[s]);
    }
    return t;
  }, zt.apply(this, arguments);
};
function gu(e, t) {
  var n = {};
  for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var r = 0, o = Object.getOwnPropertySymbols(e); r < o.length; r++)
      t.indexOf(o[r]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[r]) && (n[o[r]] = e[o[r]]);
  return n;
}
function zh(e, t, n) {
  if (n || arguments.length === 2) for (var o = 0, r = t.length, s; o < r; o++)
    (s || !(o in t)) && (s || (s = Array.prototype.slice.call(t, 0, o)), s[o] = t[o]);
  return e.concat(s || Array.prototype.slice.call(t));
}
var xr = "right-scroll-bar-position", wr = "width-before-scroll-bar", Fh = "with-scroll-bars-hidden", Bh = "--removed-body-scroll-bar-size";
function Ts(e, t) {
  return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
function Vh(e, t) {
  var n = d.useState(function() {
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
var Hh = typeof window < "u" ? d.useLayoutEffect : d.useEffect, dc = /* @__PURE__ */ new WeakMap();
function Wh(e, t) {
  var n = Vh(null, function(o) {
    return e.forEach(function(r) {
      return Ts(r, o);
    });
  });
  return Hh(function() {
    var o = dc.get(n);
    if (o) {
      var r = new Set(o), s = new Set(e), a = n.current;
      r.forEach(function(i) {
        s.has(i) || Ts(i, null);
      }), s.forEach(function(i) {
        r.has(i) || Ts(i, a);
      });
    }
    dc.set(n, e);
  }, [e]), n;
}
function Uh(e) {
  return e;
}
function qh(e, t) {
  t === void 0 && (t = Uh);
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
      var c = function() {
        var f = a;
        a = [], f.forEach(s);
      }, u = function() {
        return Promise.resolve().then(c);
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
function Kh(e) {
  e === void 0 && (e = {});
  var t = qh(null);
  return t.options = zt({ async: !0, ssr: !1 }, e), t;
}
var vu = function(e) {
  var t = e.sideCar, n = gu(e, ["sideCar"]);
  if (!t)
    throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  var o = t.read();
  if (!o)
    throw new Error("Sidecar medium not found");
  return d.createElement(o, zt({}, n));
};
vu.isSideCarExport = !0;
function Xh(e, t) {
  return e.useMedium(t), vu;
}
var yu = Kh(), Ps = function() {
}, Qr = d.forwardRef(function(e, t) {
  var n = d.useRef(null), o = d.useState({
    onScrollCapture: Ps,
    onWheelCapture: Ps,
    onTouchMoveCapture: Ps
  }), r = o[0], s = o[1], a = e.forwardProps, i = e.children, c = e.className, u = e.removeScrollBar, f = e.enabled, p = e.shards, m = e.sideCar, h = e.noRelative, g = e.noIsolation, v = e.inert, x = e.allowPinchZoom, w = e.as, k = w === void 0 ? "div" : w, C = e.gapMode, j = gu(e, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]), N = m, T = Wh([n, t]), S = zt(zt({}, j), r);
  return d.createElement(
    d.Fragment,
    null,
    f && d.createElement(N, { sideCar: yu, removeScrollBar: u, shards: p, noRelative: h, noIsolation: g, inert: v, setCallbacks: s, allowPinchZoom: !!x, lockRef: n, gapMode: C }),
    a ? d.cloneElement(d.Children.only(i), zt(zt({}, S), { ref: T })) : d.createElement(k, zt({}, S, { className: c, ref: T }), i)
  );
});
Qr.defaultProps = {
  enabled: !0,
  removeScrollBar: !0,
  inert: !1
};
Qr.classNames = {
  fullWidth: wr,
  zeroRight: xr
};
var Yh = function() {
  if (typeof __webpack_nonce__ < "u")
    return __webpack_nonce__;
};
function Gh() {
  if (!document)
    return null;
  var e = document.createElement("style");
  e.type = "text/css";
  var t = Yh();
  return t && e.setAttribute("nonce", t), e;
}
function Jh(e, t) {
  e.styleSheet ? e.styleSheet.cssText = t : e.appendChild(document.createTextNode(t));
}
function Zh(e) {
  var t = document.head || document.getElementsByTagName("head")[0];
  t.appendChild(e);
}
var Qh = function() {
  var e = 0, t = null;
  return {
    add: function(n) {
      e == 0 && (t = Gh()) && (Jh(t, n), Zh(t)), e++;
    },
    remove: function() {
      e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), t = null);
    }
  };
}, eg = function() {
  var e = Qh();
  return function(t, n) {
    d.useEffect(function() {
      return e.add(t), function() {
        e.remove();
      };
    }, [t && n]);
  };
}, bu = function() {
  var e = eg(), t = function(n) {
    var o = n.styles, r = n.dynamic;
    return e(o, r), null;
  };
  return t;
}, tg = {
  left: 0,
  top: 0,
  right: 0,
  gap: 0
}, As = function(e) {
  return parseInt(e || "", 10) || 0;
}, ng = function(e) {
  var t = window.getComputedStyle(document.body), n = t[e === "padding" ? "paddingLeft" : "marginLeft"], o = t[e === "padding" ? "paddingTop" : "marginTop"], r = t[e === "padding" ? "paddingRight" : "marginRight"];
  return [As(n), As(o), As(r)];
}, og = function(e) {
  if (e === void 0 && (e = "margin"), typeof window > "u")
    return tg;
  var t = ng(e), n = document.documentElement.clientWidth, o = window.innerWidth;
  return {
    left: t[0],
    top: t[1],
    right: t[2],
    gap: Math.max(0, o - n + t[2] - t[0])
  };
}, rg = bu(), Yn = "data-scroll-locked", sg = function(e, t, n, o) {
  var r = e.left, s = e.top, a = e.right, i = e.gap;
  return n === void 0 && (n = "margin"), `
  .`.concat(Fh, ` {
   overflow: hidden `).concat(o, `;
   padding-right: `).concat(i, "px ").concat(o, `;
  }
  body[`).concat(Yn, `] {
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
  
  .`).concat(xr, ` {
    right: `).concat(i, "px ").concat(o, `;
  }
  
  .`).concat(wr, ` {
    margin-right: `).concat(i, "px ").concat(o, `;
  }
  
  .`).concat(xr, " .").concat(xr, ` {
    right: 0 `).concat(o, `;
  }
  
  .`).concat(wr, " .").concat(wr, ` {
    margin-right: 0 `).concat(o, `;
  }
  
  body[`).concat(Yn, `] {
    `).concat(Bh, ": ").concat(i, `px;
  }
`);
}, fc = function() {
  var e = parseInt(document.body.getAttribute(Yn) || "0", 10);
  return isFinite(e) ? e : 0;
}, ag = function() {
  d.useEffect(function() {
    return document.body.setAttribute(Yn, (fc() + 1).toString()), function() {
      var e = fc() - 1;
      e <= 0 ? document.body.removeAttribute(Yn) : document.body.setAttribute(Yn, e.toString());
    };
  }, []);
}, ig = function(e) {
  var t = e.noRelative, n = e.noImportant, o = e.gapMode, r = o === void 0 ? "margin" : o;
  ag();
  var s = d.useMemo(function() {
    return og(r);
  }, [r]);
  return d.createElement(rg, { styles: sg(s, !t, r, n ? "" : "!important") });
}, Qs = !1;
if (typeof window < "u")
  try {
    var pr = Object.defineProperty({}, "passive", {
      get: function() {
        return Qs = !0, !0;
      }
    });
    window.addEventListener("test", pr, pr), window.removeEventListener("test", pr, pr);
  } catch {
    Qs = !1;
  }
var zn = Qs ? { passive: !1 } : !1, cg = function(e) {
  return e.tagName === "TEXTAREA";
}, xu = function(e, t) {
  if (!(e instanceof Element))
    return !1;
  var n = window.getComputedStyle(e);
  return (
    // not-not-scrollable
    n[t] !== "hidden" && // contains scroll inside self
    !(n.overflowY === n.overflowX && !cg(e) && n[t] === "visible")
  );
}, lg = function(e) {
  return xu(e, "overflowY");
}, ug = function(e) {
  return xu(e, "overflowX");
}, pc = function(e, t) {
  var n = t.ownerDocument, o = t;
  do {
    typeof ShadowRoot < "u" && o instanceof ShadowRoot && (o = o.host);
    var r = wu(e, o);
    if (r) {
      var s = Su(e, o), a = s[1], i = s[2];
      if (a > i)
        return !0;
    }
    o = o.parentNode;
  } while (o && o !== n.body);
  return !1;
}, dg = function(e) {
  var t = e.scrollTop, n = e.scrollHeight, o = e.clientHeight;
  return [
    t,
    n,
    o
  ];
}, fg = function(e) {
  var t = e.scrollLeft, n = e.scrollWidth, o = e.clientWidth;
  return [
    t,
    n,
    o
  ];
}, wu = function(e, t) {
  return e === "v" ? lg(t) : ug(t);
}, Su = function(e, t) {
  return e === "v" ? dg(t) : fg(t);
}, pg = function(e, t) {
  return e === "h" && t === "rtl" ? -1 : 1;
}, mg = function(e, t, n, o, r) {
  var s = pg(e, window.getComputedStyle(t).direction), a = s * o, i = n.target, c = t.contains(i), u = !1, f = a > 0, p = 0, m = 0;
  do {
    if (!i)
      break;
    var h = Su(e, i), g = h[0], v = h[1], x = h[2], w = v - x - s * g;
    (g || w) && wu(e, i) && (p += w, m += g);
    var k = i.parentNode;
    i = k && k.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? k.host : k;
  } while (
    // portaled content
    !c && i !== document.body || // self content
    c && (t.contains(i) || t === i)
  );
  return (f && Math.abs(p) < 1 || !f && Math.abs(m) < 1) && (u = !0), u;
}, mr = function(e) {
  return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, mc = function(e) {
  return [e.deltaX, e.deltaY];
}, hc = function(e) {
  return e && "current" in e ? e.current : e;
}, hg = function(e, t) {
  return e[0] === t[0] && e[1] === t[1];
}, gg = function(e) {
  return `
  .block-interactivity-`.concat(e, ` {pointer-events: none;}
  .allow-interactivity-`).concat(e, ` {pointer-events: all;}
`);
}, vg = 0, Fn = [];
function yg(e) {
  var t = d.useRef([]), n = d.useRef([0, 0]), o = d.useRef(), r = d.useState(vg++)[0], s = d.useState(bu)[0], a = d.useRef(e);
  d.useEffect(function() {
    a.current = e;
  }, [e]), d.useEffect(function() {
    if (e.inert) {
      document.body.classList.add("block-interactivity-".concat(r));
      var v = zh([e.lockRef.current], (e.shards || []).map(hc), !0).filter(Boolean);
      return v.forEach(function(x) {
        return x.classList.add("allow-interactivity-".concat(r));
      }), function() {
        document.body.classList.remove("block-interactivity-".concat(r)), v.forEach(function(x) {
          return x.classList.remove("allow-interactivity-".concat(r));
        });
      };
    }
  }, [e.inert, e.lockRef.current, e.shards]);
  var i = d.useCallback(function(v, x) {
    if ("touches" in v && v.touches.length === 2 || v.type === "wheel" && v.ctrlKey)
      return !a.current.allowPinchZoom;
    var w = mr(v), k = n.current, C = "deltaX" in v ? v.deltaX : k[0] - w[0], j = "deltaY" in v ? v.deltaY : k[1] - w[1], N, T = v.target, S = Math.abs(C) > Math.abs(j) ? "h" : "v";
    if ("touches" in v && S === "h" && T.type === "range")
      return !1;
    var y = window.getSelection(), R = y && y.anchorNode, D = R ? R === T || R.contains(T) : !1;
    if (D)
      return !1;
    var O = pc(S, T);
    if (!O)
      return !0;
    if (O ? N = S : (N = S === "v" ? "h" : "v", O = pc(S, T)), !O)
      return !1;
    if (!o.current && "changedTouches" in v && (C || j) && (o.current = N), !N)
      return !0;
    var z = o.current || N;
    return mg(z, x, v, z === "h" ? C : j);
  }, []), c = d.useCallback(function(v) {
    var x = v;
    if (!(!Fn.length || Fn[Fn.length - 1] !== s)) {
      var w = "deltaY" in x ? mc(x) : mr(x), k = t.current.filter(function(N) {
        return N.name === x.type && (N.target === x.target || x.target === N.shadowParent) && hg(N.delta, w);
      })[0];
      if (k && k.should) {
        x.cancelable && x.preventDefault();
        return;
      }
      if (!k) {
        var C = (a.current.shards || []).map(hc).filter(Boolean).filter(function(N) {
          return N.contains(x.target);
        }), j = C.length > 0 ? i(x, C[0]) : !a.current.noIsolation;
        j && x.cancelable && x.preventDefault();
      }
    }
  }, []), u = d.useCallback(function(v, x, w, k) {
    var C = { name: v, delta: x, target: w, should: k, shadowParent: bg(w) };
    t.current.push(C), setTimeout(function() {
      t.current = t.current.filter(function(j) {
        return j !== C;
      });
    }, 1);
  }, []), f = d.useCallback(function(v) {
    n.current = mr(v), o.current = void 0;
  }, []), p = d.useCallback(function(v) {
    u(v.type, mc(v), v.target, i(v, e.lockRef.current));
  }, []), m = d.useCallback(function(v) {
    u(v.type, mr(v), v.target, i(v, e.lockRef.current));
  }, []);
  d.useEffect(function() {
    return Fn.push(s), e.setCallbacks({
      onScrollCapture: p,
      onWheelCapture: p,
      onTouchMoveCapture: m
    }), document.addEventListener("wheel", c, zn), document.addEventListener("touchmove", c, zn), document.addEventListener("touchstart", f, zn), function() {
      Fn = Fn.filter(function(v) {
        return v !== s;
      }), document.removeEventListener("wheel", c, zn), document.removeEventListener("touchmove", c, zn), document.removeEventListener("touchstart", f, zn);
    };
  }, []);
  var h = e.removeScrollBar, g = e.inert;
  return d.createElement(
    d.Fragment,
    null,
    g ? d.createElement(s, { styles: gg(r) }) : null,
    h ? d.createElement(ig, { noRelative: e.noRelative, gapMode: e.gapMode }) : null
  );
}
function bg(e) {
  for (var t = null; e !== null; )
    e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
  return t;
}
const xg = Xh(yu, yg);
var Cu = d.forwardRef(function(e, t) {
  return d.createElement(Qr, zt({}, e, { ref: t, sideCar: xg }));
});
Cu.classNames = Qr.classNames;
function ju({ keepMounted: e, keepMountedMode: t = "activity", opened: n, onClose: o, id: r, transitionProps: s, onExitTransitionEnd: a, onEnterTransitionEnd: i, trapFocus: c, closeOnEscape: u, returnFocus: f, closeOnClickOutside: p, withinPortal: m, portalProps: h, lockScroll: g, children: v, zIndex: x, shadow: w, padding: k, __vars: C, unstyled: j, removeScrollProps: N, __handledEscapeEvents: T, ...S }) {
  const { _id: y, titleMounted: R, bodyMounted: D, shouldLockScroll: O, setTitleMounted: z, setBodyMounted: _ } = _h({
    id: r,
    transitionProps: s,
    opened: n,
    trapFocus: c,
    closeOnEscape: u,
    onClose: o,
    returnFocus: f,
    handledEscapeEvents: T
  }), { key: F, ...$ } = N || {};
  return /* @__PURE__ */ l.jsx(Ca, {
    ...h,
    withinPortal: m,
    children: /* @__PURE__ */ l.jsx($h, {
      value: {
        opened: n,
        onClose: o,
        closeOnClickOutside: p,
        onExitTransitionEnd: a,
        onEnterTransitionEnd: i,
        transitionProps: {
          ...s,
          keepMounted: e,
          keepMountedMode: t
        },
        getTitleId: () => `${y}-title`,
        getBodyId: () => `${y}-body`,
        titleMounted: R,
        bodyMounted: D,
        setTitleMounted: z,
        setBodyMounted: _,
        trapFocus: c,
        closeOnEscape: u,
        zIndex: x,
        unstyled: j
      },
      children: /* @__PURE__ */ l.jsx(Cu, {
        enabled: O && g,
        ...$,
        children: /* @__PURE__ */ l.jsx(Q, {
          ...S,
          id: y,
          __vars: {
            ...C,
            "--mb-z-index": (x || uo("modal")).toString(),
            "--mb-shadow": gl(w),
            "--mb-padding": Po(k)
          },
          children: v
        })
      }, F)
    })
  });
}
ju.displayName = "@mantine/core/ModalBase";
function wg() {
  const e = en();
  return d.useEffect(() => (e.setBodyMounted(!0), () => e.setBodyMounted(!1)), []), e.getBodyId();
}
var to = {
  title: "m_615af6c9",
  header: "m_b5489c3c",
  inner: "m_60c222c7",
  content: "m_fd1ab0aa",
  close: "m_606cb269",
  body: "m_5df29311"
};
function ku({ className: e, ...t }) {
  const n = wg(), o = en();
  return /* @__PURE__ */ l.jsx(Q, {
    id: n,
    className: Gt({ [to.body]: !o.unstyled }, e),
    ...t
  });
}
ku.displayName = "@mantine/core/ModalBaseBody";
function Eu({ className: e, onClick: t, ...n }) {
  const o = en();
  return /* @__PURE__ */ l.jsx(kl, {
    ...n,
    onClick: (r) => {
      o.onClose(), t?.(r);
    },
    className: Gt({ [to.close]: !o.unstyled }, e),
    unstyled: o.unstyled
  });
}
Eu.displayName = "@mantine/core/ModalBaseCloseButton";
function Ru({ transitionProps: e, className: t, innerProps: n, onKeyDown: o, style: r, ref: s, ...a }) {
  const i = en();
  return /* @__PURE__ */ l.jsx(Vr, {
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
    children: (c) => /* @__PURE__ */ l.jsx("div", {
      ...n,
      className: Gt({ [to.inner]: !i.unstyled }, n.className),
      children: /* @__PURE__ */ l.jsx(Zr, {
        active: i.opened && i.trapFocus,
        innerRef: s,
        children: /* @__PURE__ */ l.jsx(Qn, {
          ...a,
          component: "section",
          role: "dialog",
          tabIndex: -1,
          "aria-modal": !0,
          "aria-describedby": i.bodyMounted ? i.getBodyId() : void 0,
          "aria-labelledby": i.titleMounted ? i.getTitleId() : void 0,
          style: [r, c],
          className: Gt({ [to.content]: !i.unstyled }, t),
          unstyled: i.unstyled,
          children: a.children
        })
      })
    })
  });
}
Ru.displayName = "@mantine/core/ModalBaseContent";
function Nu({ className: e, ...t }) {
  const n = en();
  return /* @__PURE__ */ l.jsx(Q, {
    component: "header",
    className: Gt({ [to.header]: !n.unstyled }, e),
    ...t
  });
}
Nu.displayName = "@mantine/core/ModalBaseHeader";
const Sg = {
  duration: 200,
  timingFunction: "ease",
  transition: "fade"
};
function Cg(e) {
  const t = en();
  return {
    ...Sg,
    ...t.transitionProps,
    ...e
  };
}
function Tu({ onClick: e, transitionProps: t, style: n, visible: o, ...r }) {
  const s = en(), a = Cg(t);
  return /* @__PURE__ */ l.jsx(Vr, {
    mounted: o !== void 0 ? o : s.opened,
    ...a,
    transition: "fade",
    children: (i) => /* @__PURE__ */ l.jsx(wl, {
      fixed: !0,
      style: [n, i],
      zIndex: s.zIndex,
      unstyled: s.unstyled,
      onClick: (c) => {
        e?.(c), s.closeOnClickOutside && s.onClose();
      },
      ...r
    })
  });
}
Tu.displayName = "@mantine/core/ModalBaseOverlay";
function jg() {
  const e = en();
  return d.useEffect(() => (e.setTitleMounted(!0), () => e.setTitleMounted(!1)), []), e.getTitleId();
}
function Pu({ className: e, ...t }) {
  const n = jg(), o = en();
  return /* @__PURE__ */ l.jsx(Q, {
    component: "h2",
    className: Gt({ [to.title]: !o.unstyled }, e),
    id: n,
    ...t
  });
}
Pu.displayName = "@mantine/core/ModalBaseTitle";
function kg({ children: e }) {
  return /* @__PURE__ */ l.jsx(l.Fragment, { children: e });
}
const Eg = {
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
var Au = { root: "m_8bffd616" };
const Gn = vl((e) => {
  const t = Z("Flex", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, gap: c, rowGap: u, columnGap: f, align: p, justify: m, wrap: h, direction: g, attributes: v, ...x } = t, w = Me({
    name: "Flex",
    classes: Au,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: v,
    vars: i
  }), k = Uo(), C = Uf(), j = qf({
    styleProps: {
      gap: c,
      rowGap: u,
      columnGap: f,
      align: p,
      justify: m,
      wrap: h,
      direction: g
    },
    theme: k,
    data: Eg
  }), N = Kf(), T = N && j.hasResponsiveStyles ? Xf(j.styles, j.media) : C;
  return /* @__PURE__ */ l.jsxs(l.Fragment, { children: [j.hasResponsiveStyles && /* @__PURE__ */ l.jsx(Yf, {
    selector: `.${T}`,
    styles: j.styles,
    media: j.media,
    deduplicate: N
  }), /* @__PURE__ */ l.jsx(Q, {
    ...w("root", {
      className: T,
      style: Gf(j.inlineStyles)
    }),
    ...x
  })] });
});
Gn.classes = Au;
Gn.displayName = "@mantine/core/Flex";
function Rg(e, t) {
  if (!t || !e) return !1;
  let n = t.parentNode;
  for (; n != null; ) {
    if (n === e) return !0;
    n = n.parentNode;
  }
  return !1;
}
function Ng({ target: e, parent: t, ref: n, displayAfterTransitionEnd: o, onTransitionStart: r, onTransitionEnd: s }) {
  const a = d.useRef(-1), i = d.useRef(e), [c, u] = d.useState(!1), [f, p] = d.useState(typeof o == "boolean" ? o : !1), m = () => {
    if (!e || !t || !n.current) return;
    const x = e.getBoundingClientRect(), w = t.getBoundingClientRect(), k = t.offsetWidth === 0 ? 1 : w.width / t.offsetWidth, C = t.offsetHeight === 0 ? 1 : w.height / t.offsetHeight, j = window.getComputedStyle(e), N = window.getComputedStyle(t), T = cn(j.borderTopWidth) + cn(N.borderTopWidth), S = cn(j.borderLeftWidth) + cn(N.borderLeftWidth), y = {
      top: (x.top - w.top) / C - T,
      left: (x.left - w.left) / k - S,
      width: x.width / k,
      height: x.height / C
    };
    n.current.style.transform = `translateY(${y.top}px) translateX(${y.left}px)`, n.current.style.width = `${y.width}px`, n.current.style.height = `${y.height}px`;
  }, h = () => {
    window.clearTimeout(a.current), n.current && (n.current.style.transitionDuration = "0ms"), m(), a.current = window.setTimeout(() => {
      n.current && (n.current.style.transitionDuration = "");
    }, 30);
  }, g = d.useRef(null), v = d.useRef(null);
  return d.useEffect(() => {
    if (c && i.current !== e && r && r(), i.current = e, m(), e)
      return g.current = new ResizeObserver(h), g.current.observe(e), t && (v.current = new ResizeObserver(h), v.current.observe(t)), () => {
        g.current?.disconnect(), v.current?.disconnect();
      };
  }, [t, e]), d.useEffect(() => {
    if (t) {
      const x = (w) => {
        Rg(w.target, t) && (h(), p(!1));
      };
      return t.addEventListener("transitionend", x), () => {
        t.removeEventListener("transitionend", x);
      };
    }
  }, [t]), d.useEffect(() => {
    if (n.current && s) {
      const x = (w) => {
        w.propertyName === "transform" && s();
      };
      return n.current.addEventListener("transitionend", x), () => {
        n.current?.removeEventListener("transitionend", x);
      };
    }
  }, [s]), Rp(() => {
    Dl() !== "test" && u(!0);
  }, 20, { autoInvoke: !0 }), Ap((x) => {
    x.forEach((w) => {
      w.type === "attributes" && w.attributeName === "dir" && h();
    });
  }, {
    attributes: !0,
    attributeFilter: ["dir"]
  }, () => document.documentElement), {
    initialized: c,
    hidden: f
  };
}
var Mu = { root: "m_96b553a6" };
const Iu = Oe((e, { transitionDuration: t }, { shouldReduceMotion: n }) => ({ root: { "--transition-duration": e.respectReducedMotion && n ? "0ms" : typeof t == "number" ? `${t}ms` : t || "150ms" } })), es = se((e) => {
  const t = Z("FloatingIndicator", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, target: c, parent: u, transitionDuration: f, mod: p, displayAfterTransitionEnd: m, onTransitionStart: h, onTransitionEnd: g, attributes: v, ref: x, ...w } = t, k = wa(), C = Me({
    name: "FloatingIndicator",
    classes: Mu,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: v,
    vars: i,
    varsResolver: Iu,
    stylesCtx: { shouldReduceMotion: k }
  }), j = d.useRef(null), { initialized: N, hidden: T } = Ng({
    target: c,
    parent: u,
    ref: j,
    displayAfterTransitionEnd: m,
    onTransitionStart: h,
    onTransitionEnd: g
  }), S = ze(x, j);
  return !c || !u ? null : /* @__PURE__ */ l.jsx(Q, {
    ref: S,
    mod: [{
      initialized: N,
      hidden: T
    }, p],
    ...C("root"),
    ...w
  });
});
es.displayName = "@mantine/core/FloatingIndicator";
es.classes = Mu;
es.varsResolver = Iu;
const [Tg, Ba] = Wt("Accordion component was not found in the tree");
function Va({ style: e, size: t = 16, ...n }) {
  return /* @__PURE__ */ l.jsx("svg", {
    viewBox: "0 0 15 15",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    style: {
      ...e,
      width: Pe(t),
      height: Pe(t),
      display: "block"
    },
    ...n,
    children: /* @__PURE__ */ l.jsx("path", {
      d: "M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z",
      fill: "currentColor",
      fillRule: "evenodd",
      clipRule: "evenodd"
    })
  });
}
Va.displayName = "@mantine/core/AccordionChevron";
const [Pg, Du] = Wt("Accordion.Item component was not found in the tree");
var Yo = {
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
const Ha = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, chevron: a, icon: i, onClick: c, onKeyDown: u, children: f, disabled: p, mod: m, ...h } = Z("AccordionControl", null, e), { value: g } = Du(), v = Ba(), x = v.isItemActive(g), w = typeof v.order == "number", k = `h${v.order}`, C = /* @__PURE__ */ l.jsxs(eo, {
    ...v.getStyles("control", {
      className: n,
      classNames: t,
      style: o,
      styles: r,
      variant: v.variant
    }),
    unstyled: v.unstyled,
    mod: [
      "accordion-control",
      {
        active: x,
        "chevron-position": v.chevronPosition,
        disabled: p
      },
      m
    ],
    onClick: (j) => {
      c?.(j), v.onChange(g);
    },
    type: "button",
    disabled: p,
    "aria-expanded": x,
    "aria-controls": v.getRegionId(g),
    id: v.getControlId(g),
    onKeyDown: El({
      siblingSelector: "[data-accordion-control]",
      parentSelector: "[data-accordion]",
      activateOnFocus: !1,
      loop: v.loop,
      orientation: "vertical",
      onKeyDown: u
    }),
    ...h,
    children: [
      /* @__PURE__ */ l.jsx(Q, {
        component: "span",
        mod: {
          rotate: !v.disableChevronRotation && x,
          position: v.chevronPosition
        },
        ...v.getStyles("chevron", {
          classNames: t,
          styles: r
        }),
        children: a || v.chevron
      }),
      /* @__PURE__ */ l.jsx("span", {
        ...v.getStyles("label", {
          classNames: t,
          styles: r
        }),
        children: f
      }),
      i && /* @__PURE__ */ l.jsx(Q, {
        component: "span",
        mod: { "chevron-position": v.chevronPosition },
        ...v.getStyles("icon", {
          classNames: t,
          styles: r
        }),
        children: i
      })
    ]
  });
  return w ? /* @__PURE__ */ l.jsx(k, {
    ...v.getStyles("itemTitle", {
      classNames: t,
      styles: r
    }),
    children: C
  }) : C;
});
Ha.displayName = "@mantine/core/AccordionControl";
Ha.classes = Yo;
const Wa = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, value: a, mod: i, ...c } = Z("AccordionItem", null, e), u = Ba();
  return /* @__PURE__ */ l.jsx(Pg, {
    value: { value: a },
    children: /* @__PURE__ */ l.jsx(Q, {
      mod: [{ active: u.isItemActive(a) }, i],
      ...u.getStyles("item", {
        className: n,
        classNames: t,
        styles: r,
        style: o,
        variant: u.variant
      }),
      ...c
    })
  });
});
Wa.displayName = "@mantine/core/AccordionItem";
Wa.classes = Yo;
const Ua = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, children: a, keepMounted: i, keepMountedMode: c, ...u } = Z("AccordionPanel", null, e), { value: f } = Du(), p = Ba();
  return /* @__PURE__ */ l.jsx(Ll, {
    ...p.getStyles("panel", {
      className: n,
      classNames: t,
      style: o,
      styles: r
    }),
    expanded: p.isItemActive(f),
    transitionDuration: p.transitionDuration ?? 200,
    role: "region",
    id: p.getRegionId(f),
    "aria-labelledby": p.getControlId(f),
    keepMounted: i ?? p.keepMounted,
    keepMountedMode: c ?? p.keepMountedMode,
    ...u,
    children: /* @__PURE__ */ l.jsx("div", {
      ...p.getStyles("content", {
        classNames: t,
        styles: r
      }),
      children: a
    })
  });
});
Ua.displayName = "@mantine/core/AccordionPanel";
Ua.classes = Yo;
const Ag = {
  multiple: !1,
  loop: !0,
  disableChevronRotation: !1,
  disableCollapse: !1,
  chevronPosition: "right",
  variant: "default",
  chevronSize: "auto",
  chevronIconSize: 16,
  keepMountedMode: "activity"
}, Ou = Oe((e, { transitionDuration: t, chevronSize: n, radius: o }) => ({ root: {
  "--accordion-transition-duration": t === void 0 ? void 0 : `${t}ms`,
  "--accordion-chevron-size": n === void 0 ? void 0 : Pe(n),
  "--accordion-radius": o === void 0 ? void 0 : kt(o)
} })), Te = vn((e) => {
  const t = Z("Accordion", Ag, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, children: c, multiple: u, value: f, defaultValue: p, onChange: m, id: h, loop: g, transitionDuration: v, disableChevronRotation: x, disableCollapse: w, chevronPosition: k, chevronSize: C, order: j, chevron: N, variant: T, radius: S, chevronIconSize: y, attributes: R, keepMounted: D, keepMountedMode: O, ...z } = t, _ = $t(h), [F, $] = Ye({
    value: f,
    defaultValue: p,
    finalValue: u ? [] : null,
    onChange: m
  }), I = (P) => Array.isArray(F) ? F.includes(P) : P === F, L = (P) => {
    if (!Array.isArray(F) && w && P === F) return;
    const B = Array.isArray(F) ? F.includes(P) ? F.filter((W) => W !== P) : [...F, P] : P === F ? null : P;
    $(B);
  }, M = Me({
    name: "Accordion",
    classes: Yo,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: R,
    vars: i,
    varsResolver: Ou
  });
  return /* @__PURE__ */ l.jsx(Tg, {
    value: {
      isItemActive: I,
      onChange: L,
      getControlId: Nr(`${_}-control`, "Accordion.Item component was rendered with invalid value or without value"),
      getRegionId: Nr(`${_}-panel`, "Accordion.Item component was rendered with invalid value or without value"),
      chevron: N === null ? null : N || /* @__PURE__ */ l.jsx(Va, { size: y }),
      transitionDuration: v,
      disableChevronRotation: x,
      chevronPosition: k,
      order: j,
      loop: g,
      getStyles: M,
      variant: T,
      unstyled: a,
      keepMounted: D,
      keepMountedMode: O
    },
    children: /* @__PURE__ */ l.jsx(Q, {
      ...M("root"),
      id: _,
      ...z,
      variant: T,
      "data-accordion": !0,
      children: c
    })
  });
});
Te.classes = Yo;
Te.varsResolver = Ou;
Te.displayName = "@mantine/core/Accordion";
Te.Item = Wa;
Te.Panel = Ua;
Te.Control = Ha;
Te.Chevron = Va;
function $u(e) {
  return typeof e == "string" ? {
    value: e,
    label: e
  } : typeof e == "object" && "value" in e && !("label" in e) ? {
    value: e.value,
    label: `${e.value}`,
    disabled: e.disabled
  } : typeof e == "object" && "group" in e ? {
    group: e.group,
    items: e.items.map((t) => $u(t))
  } : typeof e == "number" || typeof e == "bigint" || typeof e == "boolean" ? {
    value: e,
    label: `${e}`
  } : e;
}
function Lu(e) {
  return e ? e.map((t) => $u(t)) : [];
}
function _u(e) {
  return e.reduce((t, n) => "group" in n ? {
    ...t,
    ..._u(n.items)
  } : (t[`${n.value}`] = n, t), {});
}
var it = {
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
const Mg = { error: null }, zu = Oe((e, { size: t, color: n }) => ({ chevron: {
  "--combobox-chevron-size": $e(t, "combobox-chevron-size"),
  "--combobox-chevron-color": n ? tt(n, e) : void 0
} })), Go = se((e) => {
  const t = Z("ComboboxChevron", Mg, e), { size: n, error: o, style: r, className: s, classNames: a, styles: i, unstyled: c, vars: u, attributes: f, mod: p, ...m } = t, h = Me({
    name: "ComboboxChevron",
    classes: it,
    props: t,
    style: r,
    className: s,
    classNames: a,
    styles: i,
    unstyled: c,
    vars: u,
    varsResolver: zu,
    attributes: f,
    rootSelector: "chevron"
  });
  return /* @__PURE__ */ l.jsx(Q, {
    component: "svg",
    ...m,
    ...h("chevron"),
    size: n,
    viewBox: "0 0 15 15",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    mod: [
      "combobox-chevron",
      { error: o },
      p
    ],
    children: /* @__PURE__ */ l.jsx("path", {
      d: "M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z",
      fill: "currentColor",
      fillRule: "evenodd",
      clipRule: "evenodd"
    })
  });
});
Go.classes = it;
Go.varsResolver = zu;
Go.displayName = "@mantine/core/ComboboxChevron";
const [Ig, bt] = Wt("Combobox component was not found in tree");
function Fu({ onMouseDown: e, onClick: t, onClear: n, ...o }) {
  return /* @__PURE__ */ l.jsx(St.ClearButton, {
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
Fu.displayName = "@mantine/core/ComboboxClearButton";
const qa = se((e) => {
  const { classNames: t, styles: n, className: o, style: r, hidden: s, ...a } = Z("ComboboxDropdown", null, e), i = bt();
  return /* @__PURE__ */ l.jsx(Fe.Dropdown, {
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
qa.classes = it;
qa.displayName = "@mantine/core/ComboboxDropdown";
const Dg = { refProp: "ref" }, Bu = se((e) => {
  const { children: t, refProp: n, ref: o } = Z("ComboboxDropdownTarget", Dg, e);
  if (bt(), !xl(t)) throw new Error("Combobox.DropdownTarget component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  return /* @__PURE__ */ l.jsx(Fe.Target, {
    ref: o,
    refProp: n,
    children: t
  });
});
Bu.displayName = "@mantine/core/ComboboxDropdownTarget";
const Ka = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ComboboxEmpty", null, e), i = bt();
  return /* @__PURE__ */ l.jsx(Q, {
    ...i.getStyles("empty", {
      className: n,
      classNames: t,
      styles: r,
      style: o
    }),
    ...a
  });
});
Ka.classes = it;
Ka.displayName = "@mantine/core/ComboboxEmpty";
function Xa({ onKeyDown: e, onClick: t, withKeyboardNavigation: n, withAriaAttributes: o, withExpandedAttribute: r, targetType: s, autoComplete: a }) {
  const i = bt(), [c, u] = d.useState(null), f = (h) => {
    if (e?.(h), !i.readOnly && n) {
      if (h.nativeEvent.isComposing) return;
      if (h.nativeEvent.code === "ArrowDown" && (h.preventDefault(), i.store.dropdownOpened ? u(i.store.selectNextOption()) : (i.store.openDropdown("keyboard"), u(i.store.selectActiveOption()), i.store.updateSelectedOptionIndex("selected", { scrollIntoView: !0 }))), h.nativeEvent.code === "ArrowUp" && (h.preventDefault(), i.store.dropdownOpened ? u(i.store.selectPreviousOption()) : (i.store.openDropdown("keyboard"), u(i.store.selectActiveOption()), i.store.updateSelectedOptionIndex("selected", { scrollIntoView: !0 }))), h.nativeEvent.code === "Enter" || h.nativeEvent.code === "NumpadEnter") {
        if (h.nativeEvent.keyCode === 229) return;
        const g = i.store.getSelectedOptionIndex();
        i.store.dropdownOpened && g !== -1 ? (h.preventDefault(), i.store.clickSelectedOption()) : s === "button" && (h.preventDefault(), i.store.openDropdown("keyboard"));
      }
      h.key === "Escape" && i.store.closeDropdown("keyboard"), h.nativeEvent.code === "Space" && s === "button" && (h.preventDefault(), i.store.toggleDropdown("keyboard"));
    }
  };
  return {
    ...o ? {
      ...r ? { role: "combobox" } : {},
      "aria-haspopup": "listbox",
      "aria-expanded": r ? !!(i.store.listId && i.store.dropdownOpened) : void 0,
      "aria-controls": i.store.dropdownOpened && i.store.listId ? i.store.listId : void 0,
      "aria-activedescendant": i.store.dropdownOpened && c || void 0,
      autoComplete: a,
      "data-expanded": i.store.dropdownOpened || void 0,
      "data-mantine-stop-propagation": i.store.dropdownOpened || void 0
    } : {},
    onKeyDown: f,
    onClick: (h) => {
      s === "button" && h.currentTarget.focus(), t?.(h);
    }
  };
}
const Og = {
  refProp: "ref",
  targetType: "input",
  withKeyboardNavigation: !0,
  withAriaAttributes: !0,
  withExpandedAttribute: !1,
  autoComplete: "off"
}, Vu = se((e) => {
  const { children: t, refProp: n, withKeyboardNavigation: o, withAriaAttributes: r, withExpandedAttribute: s, targetType: a, autoComplete: i, ref: c, ...u } = Z("ComboboxEventsTarget", Og, e), f = Ko(t);
  if (!f) throw new Error("Combobox.EventsTarget component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  const p = bt(), m = Xa({
    targetType: a,
    withAriaAttributes: r,
    withKeyboardNavigation: o,
    withExpandedAttribute: s,
    onKeyDown: f.props.onKeyDown,
    onClick: f.props.onClick,
    autoComplete: i
  });
  return d.cloneElement(f, {
    ...m,
    ...u,
    [n]: ze(c, p.store.targetRef, $l(f))
  });
});
Vu.displayName = "@mantine/core/ComboboxEventsTarget";
const Ya = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ComboboxFooter", null, e), i = bt();
  return /* @__PURE__ */ l.jsx(Q, {
    ...i.getStyles("footer", {
      className: n,
      classNames: t,
      style: o,
      styles: r
    }),
    ...a,
    onMouseDown: (c) => {
      c.preventDefault();
    }
  });
});
Ya.classes = it;
Ya.displayName = "@mantine/core/ComboboxFooter";
const Ga = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, children: a, label: i, id: c, ...u } = Z("ComboboxGroup", null, e), f = bt(), p = $t(c), m = i != null && i !== !1 && i !== "";
  return /* @__PURE__ */ l.jsxs(Q, {
    role: "group",
    "aria-labelledby": m ? p : void 0,
    ...f.getStyles("group", {
      className: n,
      classNames: t,
      style: o,
      styles: r
    }),
    ...u,
    children: [m && /* @__PURE__ */ l.jsx("div", {
      id: p,
      ...f.getStyles("groupLabel", {
        classNames: t,
        styles: r
      }),
      children: i
    }), a]
  });
});
Ga.classes = it;
Ga.displayName = "@mantine/core/ComboboxGroup";
const Ja = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ComboboxHeader", null, e), i = bt();
  return /* @__PURE__ */ l.jsx(Q, {
    ...i.getStyles("header", {
      className: n,
      classNames: t,
      style: o,
      styles: r
    }),
    ...a,
    onMouseDown: (c) => {
      c.preventDefault();
    }
  });
});
Ja.classes = it;
Ja.displayName = "@mantine/core/ComboboxHeader";
function Hu({ value: e, valuesDivider: t = ",", ...n }) {
  return /* @__PURE__ */ l.jsx("input", {
    type: "hidden",
    value: Array.isArray(e) ? e.join(t) : e ? `${e}` : "",
    ...n
  });
}
Hu.displayName = "@mantine/core/ComboboxHiddenInput";
const Za = se((e) => {
  const t = Z("ComboboxOption", null, e), { classNames: n, className: o, style: r, styles: s, vars: a, onClick: i, id: c, active: u, onMouseDown: f, onMouseOver: p, disabled: m, selected: h, mod: g, ...v } = t, x = bt(), w = d.useId(), k = c || w;
  return /* @__PURE__ */ l.jsx(Q, {
    ...x.getStyles("option", {
      className: o,
      classNames: n,
      styles: s,
      style: r
    }),
    ...v,
    id: k,
    mod: [
      "combobox-option",
      {
        "combobox-active": u,
        "combobox-disabled": m,
        "combobox-selected": h
      },
      g
    ],
    role: "option",
    onClick: (C) => {
      m ? C.preventDefault() : (x.onOptionSubmit?.(t.value, t), i?.(C));
    },
    onMouseDown: (C) => {
      C.preventDefault(), f?.(C);
    },
    onMouseOver: (C) => {
      x.resetSelectionOnOptionHover && x.store.resetSelectedOption(), p?.(C);
    }
  });
});
Za.classes = it;
Za.displayName = "@mantine/core/ComboboxOption";
const Qa = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, id: s, onMouseDown: a, labelledBy: i, ...c } = Z("ComboboxOptions", null, e), u = bt(), f = $t(s);
  return d.useEffect(() => {
    u.store.setListId(f);
  }, [f]), /* @__PURE__ */ l.jsx(Q, {
    ...u.getStyles("options", {
      className: n,
      style: o,
      classNames: t,
      styles: r
    }),
    ...c,
    id: f,
    role: "listbox",
    "aria-labelledby": i,
    onMouseDown: (p) => {
      p.preventDefault(), a?.(p);
    }
  });
});
Qa.classes = it;
Qa.displayName = "@mantine/core/ComboboxOptions";
const $g = {
  withAriaAttributes: !0,
  withKeyboardNavigation: !0
}, ei = se((e) => {
  const { classNames: t, styles: n, unstyled: o, vars: r, withAriaAttributes: s, onKeyDown: a, onClick: i, withKeyboardNavigation: c, size: u, ref: f, ...p } = Z("ComboboxSearch", $g, e), m = bt(), h = m.getStyles("search"), g = Xa({
    targetType: "input",
    withAriaAttributes: s,
    withKeyboardNavigation: c,
    withExpandedAttribute: !1,
    onKeyDown: a,
    onClick: i,
    autoComplete: "off"
  });
  return /* @__PURE__ */ l.jsx(St, {
    ref: ze(f, m.store.searchRef),
    classNames: [{ input: h.className }, t],
    styles: [{ input: h.style }, n],
    size: u || m.size,
    ...g,
    ...p,
    __staticSelector: "Combobox"
  });
});
ei.classes = it;
ei.displayName = "@mantine/core/ComboboxSearch";
const Lg = {
  refProp: "ref",
  targetType: "input",
  withKeyboardNavigation: !0,
  withAriaAttributes: !0,
  withExpandedAttribute: !1,
  autoComplete: "off"
}, Wu = se((e) => {
  const { children: t, refProp: n, withKeyboardNavigation: o, withAriaAttributes: r, withExpandedAttribute: s, targetType: a, autoComplete: i, ref: c, ...u } = Z("ComboboxTarget", Lg, e), f = Ko(t);
  if (!f) throw new Error("Combobox.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  const p = bt(), m = Xa({
    targetType: a,
    withAriaAttributes: r,
    withKeyboardNavigation: o,
    withExpandedAttribute: s,
    onKeyDown: f.props.onKeyDown,
    onClick: f.props.onClick,
    autoComplete: i
  }), h = d.cloneElement(f, {
    ...m,
    ...u
  });
  return /* @__PURE__ */ l.jsx(Fe.Target, {
    refProp: n,
    ref: ze(c, p.store.targetRef),
    children: h
  });
});
Wu.displayName = "@mantine/core/ComboboxTarget";
function _g(e, t, n) {
  for (let o = e - 1; o >= 0; o -= 1) if (!t[o].hasAttribute("data-combobox-disabled")) return o;
  if (n) {
    for (let o = t.length - 1; o > -1; o -= 1) if (!t[o].hasAttribute("data-combobox-disabled")) return o;
  }
  return e;
}
function zg(e, t, n) {
  for (let o = e + 1; o < t.length; o += 1) if (!t[o].hasAttribute("data-combobox-disabled")) return o;
  if (n) {
    for (let o = 0; o < t.length; o += 1) if (!t[o].hasAttribute("data-combobox-disabled")) return o;
  }
  return e;
}
function Fg(e) {
  for (let t = 0; t < e.length; t += 1) if (!e[t].hasAttribute("data-combobox-disabled")) return t;
  return -1;
}
function ti({ defaultOpened: e, opened: t, onOpenedChange: n, onDropdownClose: o, onDropdownOpen: r, loop: s = !0, scrollBehavior: a = "instant" } = {}) {
  const [i, c] = Ye({
    value: t,
    defaultValue: e,
    finalValue: !1,
    onChange: n
  }), u = d.useRef(null), f = d.useRef(-1), p = d.useRef(null), m = d.useRef(null), h = d.useRef(-1), g = d.useRef(-1), v = d.useRef(-1), x = d.useCallback((I = "unknown") => {
    i || (c(!0), r?.(I));
  }, [
    c,
    r,
    i
  ]), w = d.useCallback((I = "unknown") => {
    i && (c(!1), o?.(I));
  }, [
    c,
    o,
    i
  ]), k = d.useCallback((I = "unknown") => {
    i ? w(I) : x(I);
  }, [
    w,
    x,
    i
  ]), C = d.useCallback(() => {
    const I = _t(m.current);
    yr(`#${u.current} [data-combobox-selected]`, I)?.removeAttribute("data-combobox-selected");
  }, []), j = d.useCallback((I) => {
    const L = _t(m.current), M = yr(`#${u.current}`, L), P = M ? Ut("[data-combobox-option]", M) : null;
    if (!P) return null;
    const B = I >= P.length ? 0 : I < 0 ? P.length - 1 : I;
    return f.current = B, P?.[B] && !P[B].hasAttribute("data-combobox-disabled") ? (C(), P[B].setAttribute("data-combobox-selected", "true"), P[B].scrollIntoView({
      block: "nearest",
      behavior: a
    }), P[B].id) : null;
  }, [a, C]), N = d.useCallback(() => {
    const I = _t(m.current), L = yr(`#${u.current} [data-combobox-active]`, I);
    if (L) {
      const M = Ut(`#${u.current} [data-combobox-option]`, I).findIndex((P) => P === L);
      return j(M);
    }
    return j(0);
  }, [j]), T = d.useCallback(() => {
    const I = _t(m.current), L = Ut(`#${u.current} [data-combobox-option]`, I);
    return j(zg(f.current, L, s));
  }, [j, s]), S = d.useCallback(() => {
    const I = _t(m.current), L = Ut(`#${u.current} [data-combobox-option]`, I);
    return j(_g(f.current, L, s));
  }, [j, s]), y = d.useCallback(() => {
    const I = _t(m.current), L = Ut(`#${u.current} [data-combobox-option]`, I);
    return j(Fg(L));
  }, [j]), R = d.useCallback((I = "selected", L) => {
    if (typeof I == "number") {
      f.current = I;
      const M = _t(m.current), P = Ut(`#${u.current} [data-combobox-option]`, M);
      L?.scrollIntoView && P[I]?.scrollIntoView({
        block: "nearest",
        behavior: a
      });
      return;
    }
    v.current = window.setTimeout(() => {
      const M = _t(m.current), P = Ut(`#${u.current} [data-combobox-option]`, M), B = P.findIndex((W) => W.hasAttribute(`data-combobox-${I}`));
      f.current = B, L?.scrollIntoView && P[B]?.scrollIntoView({
        block: "nearest",
        behavior: a
      });
    }, 0);
  }, []), D = d.useCallback(() => {
    f.current = -1, C();
  }, [C]), O = d.useCallback(() => {
    const I = _t(m.current);
    Ut(`#${u.current} [data-combobox-option]`, I)?.[f.current]?.click();
  }, []), z = d.useCallback((I) => {
    u.current = I;
  }, []), _ = d.useCallback(() => {
    h.current = window.setTimeout(() => p.current?.focus(), 0);
  }, []), F = d.useCallback(() => {
    g.current = window.setTimeout(() => m.current?.focus(), 0);
  }, []), $ = d.useCallback(() => f.current, []);
  return d.useEffect(() => () => {
    window.clearTimeout(h.current), window.clearTimeout(g.current), window.clearTimeout(v.current);
  }, []), {
    dropdownOpened: i,
    openDropdown: x,
    closeDropdown: w,
    toggleDropdown: k,
    selectedOptionIndex: f.current,
    getSelectedOptionIndex: $,
    selectOption: j,
    selectFirstOption: y,
    selectActiveOption: N,
    selectNextOption: T,
    selectPreviousOption: S,
    resetSelectedOption: D,
    updateSelectedOptionIndex: R,
    listId: u.current,
    setListId: z,
    clickSelectedOption: O,
    searchRef: p,
    focusSearchInput: _,
    targetRef: m,
    focusTarget: F
  };
}
const Bg = {
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
}, Uu = Oe((e, { size: t, dropdownPadding: n }) => ({
  options: {
    "--combobox-option-fz": Rr(t),
    "--combobox-option-padding": $e(t, "combobox-option-padding")
  },
  dropdown: {
    "--combobox-padding": n === void 0 ? void 0 : Pe(n),
    "--combobox-option-fz": Rr(t),
    "--combobox-option-padding": $e(t, "combobox-option-padding")
  }
})), we = (e) => {
  const t = Z("Combobox", Bg, e), { classNames: n, styles: o, unstyled: r, children: s, store: a, vars: i, onOptionSubmit: c, onClose: u, size: f, dropdownPadding: p, resetSelectionOnOptionHover: m, __staticSelector: h, readOnly: g, attributes: v, floatingHeight: x, middlewares: w, ...k } = t, C = x === "viewport" ? {
    ...w,
    flip: !1,
    size: {
      ...typeof w?.size == "object" ? w.size : {},
      padding: typeof w?.size == "object" && w.size.padding !== void 0 ? w.size.padding : 10,
      apply: ({ availableHeight: y, availableWidth: R, elements: D, ...O }) => {
        D.floating.style.setProperty("--combobox-floating-max-height", `${y}px`);
        const z = w?.size;
        typeof z == "object" && z.apply ? z.apply({
          availableHeight: y,
          availableWidth: R,
          elements: D,
          ...O
        }) : z && Object.assign(D.floating.style, {
          maxWidth: `${R}px`,
          maxHeight: `${y}px`
        });
      }
    }
  } : w, j = ti(), N = a || j, T = Me({
    name: h || "Combobox",
    classes: it,
    props: t,
    classNames: n,
    styles: o,
    unstyled: r,
    attributes: v,
    vars: i,
    varsResolver: Uu
  }), S = () => {
    u?.(), N.closeDropdown();
  };
  return /* @__PURE__ */ l.jsx(Ig, {
    value: {
      getStyles: T,
      store: N,
      onOptionSubmit: c,
      size: f,
      resetSelectionOnOptionHover: m,
      readOnly: g,
      floatingHeight: x
    },
    children: /* @__PURE__ */ l.jsx(Fe, {
      opened: N.dropdownOpened,
      ...k,
      middlewares: C,
      onChange: (y) => !y && S(),
      withRoles: !1,
      unstyled: r,
      children: s
    })
  });
}, Vg = (e) => e;
we.extend = Vg;
we.classes = it;
we.varsResolver = Uu;
we.displayName = "@mantine/core/Combobox";
we.Target = Wu;
we.Dropdown = qa;
we.Options = Qa;
we.Option = Za;
we.Search = ei;
we.Empty = Ka;
we.Chevron = Go;
we.Footer = Ya;
we.Header = Ja;
we.EventsTarget = Vu;
we.DropdownTarget = Bu;
we.Group = Ga;
we.ClearButton = Fu;
we.HiddenInput = Hu;
function qu({ children: e, role: t }) {
  const n = d.use(cp);
  return n ? /* @__PURE__ */ l.jsx("div", {
    role: t,
    "aria-labelledby": n.labelId,
    "aria-describedby": n.describedBy,
    children: e
  }) : /* @__PURE__ */ l.jsx(l.Fragment, { children: e });
}
const ni = d.createContext(null), Hg = { hiddenInputValuesSeparator: "," }, oi = vn(((e) => {
  const { value: t, defaultValue: n, onChange: o, size: r, wrapperProps: s, children: a, readOnly: i, name: c, hiddenInputValuesSeparator: u, hiddenInputProps: f, maxSelectedValues: p, disabled: m, ...h } = Z("CheckboxGroup", Hg, e), [g, v] = Ye({
    value: t,
    defaultValue: n,
    finalValue: [],
    onChange: o
  }), x = (C) => {
    const j = typeof C == "string" ? C : C.currentTarget.value;
    if (i) return;
    const N = g.includes(j);
    !N && p && g.length >= p || v(N ? g.filter((T) => T !== j) : [...g, j]);
  }, w = (C) => {
    if (m) return !0;
    if (!p) return !1;
    const j = g.includes(C), N = g.length >= p;
    return !j && N;
  }, k = g.join(u);
  return /* @__PURE__ */ l.jsx(ni, {
    value: {
      value: g,
      onChange: x,
      size: r,
      isDisabled: w
    },
    children: /* @__PURE__ */ l.jsxs(St.Wrapper, {
      size: r,
      ...s,
      ...h,
      labelElement: "div",
      __staticSelector: "CheckboxGroup",
      children: [/* @__PURE__ */ l.jsx(qu, {
        role: "group",
        children: a
      }), /* @__PURE__ */ l.jsx("input", {
        type: "hidden",
        name: c,
        value: k,
        ...f
      })]
    })
  });
}));
oi.classes = St.Wrapper.classes;
oi.displayName = "@mantine/core/CheckboxGroup";
var Ku = { card: "m_26775b0a" };
const Xu = d.createContext(null), Wg = { withBorder: !0 }, Yu = Oe((e, { radius: t }) => ({ card: { "--card-radius": kt(t) } })), ts = se((e) => {
  const t = Z("CheckboxCard", Wg, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, checked: c, mod: u, withBorder: f, value: p, onClick: m, defaultChecked: h, onChange: g, indeterminate: v, attributes: x, ...w } = t, k = Me({
    name: "CheckboxCard",
    classes: Ku,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: x,
    vars: i,
    varsResolver: Yu,
    rootSelector: "card"
  }), C = d.use(ni), j = typeof c == "boolean" ? c : C ? C.value.includes(p || "") : void 0, [N, T] = Ye({
    value: j,
    defaultValue: h,
    finalValue: !1,
    onChange: g
  });
  return /* @__PURE__ */ l.jsx(Xu, {
    value: {
      checked: N,
      indeterminate: v
    },
    children: /* @__PURE__ */ l.jsx(eo, {
      mod: [{
        "with-border": f,
        checked: N,
        indeterminate: v
      }, u],
      ...k("card"),
      ...w,
      role: "checkbox",
      "aria-checked": v ? "mixed" : N,
      onClick: (S) => {
        m?.(S), C?.onChange(p || ""), T(!N);
      }
    })
  });
});
ts.displayName = "@mantine/core/CheckboxCard";
ts.classes = Ku;
ts.varsResolver = Yu;
function ri({ size: e, style: t, ...n }) {
  const o = e !== void 0 ? {
    width: Pe(e),
    height: Pe(e),
    ...t
  } : t;
  return /* @__PURE__ */ l.jsx("svg", {
    viewBox: "0 0 10 7",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    style: o,
    "aria-hidden": !0,
    ...n,
    children: /* @__PURE__ */ l.jsx("path", {
      d: "M4 4.586L1.707 2.293A1 1 0 1 0 .293 3.707l3 3a.997.997 0 0 0 1.414 0l5-5A1 1 0 1 0 8.293.293L4 4.586z",
      fill: "currentColor",
      fillRule: "evenodd",
      clipRule: "evenodd"
    })
  });
}
function Gu({ indeterminate: e, ...t }) {
  return e ? /* @__PURE__ */ l.jsx("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 32 6",
    "aria-hidden": !0,
    ...t,
    children: /* @__PURE__ */ l.jsx("rect", {
      width: "32",
      height: "6",
      fill: "currentColor",
      rx: "3"
    })
  }) : /* @__PURE__ */ l.jsx(ri, { ...t });
}
var Ju = {
  indicator: "m_5e5256ee",
  icon: "m_1b1c543a",
  "indicator--outline": "m_76e20374"
};
const Ug = {
  icon: Gu,
  variant: "filled",
  radius: "sm"
}, Zu = Oe((e, { radius: t, color: n, size: o, iconColor: r, variant: s, autoContrast: a }) => {
  const i = Hr({
    color: n || e.primaryColor,
    theme: e
  }), c = i.isThemeColor && i.shade === void 0 ? `var(--mantine-color-${i.color}-outline)` : i.color;
  return { indicator: {
    "--checkbox-size": $e(o, "checkbox-size"),
    "--checkbox-radius": t === void 0 ? void 0 : kt(t),
    "--checkbox-color": s === "outline" ? c : tt(n, e),
    "--checkbox-icon-color": r ? tt(r, e) : Xo(a, e) ? lo({
      color: n,
      theme: e,
      autoContrast: a
    }) : void 0
  } };
}), ns = se((e) => {
  const t = Z("CheckboxIndicator", Ug, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, icon: c, indeterminate: u, radius: f, color: p, iconColor: m, autoContrast: h, checked: g, mod: v, variant: x, disabled: w, attributes: k, ...C } = t, j = Me({
    name: "CheckboxIndicator",
    classes: Ju,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: k,
    vars: i,
    varsResolver: Zu,
    rootSelector: "indicator"
  }), N = d.use(Xu), T = typeof u == "boolean" ? u : N?.indeterminate, S = typeof g == "boolean" || typeof u == "boolean" ? g || u : N?.checked || N?.indeterminate || !1;
  return /* @__PURE__ */ l.jsx(Q, {
    ...j("indicator", { variant: x }),
    variant: x,
    mod: [{
      checked: S,
      disabled: w
    }, v],
    ...C,
    children: /* @__PURE__ */ l.jsx(c, {
      indeterminate: T,
      ...j("icon")
    })
  });
});
ns.displayName = "@mantine/core/CheckboxIndicator";
ns.classes = Ju;
ns.varsResolver = Zu;
var Qu = {
  root: "m_5f75b09e",
  body: "m_5f6e695e",
  labelWrapper: "m_d3ea56bb",
  label: "m_8ee546b8",
  description: "m_328f68c0",
  error: "m_8e8a99cc"
};
const qg = Qu;
function si({ __staticSelector: e, __stylesApiProps: t, className: n, classNames: o, styles: r, unstyled: s, children: a, label: i, description: c, id: u, disabled: f, error: p, size: m, labelPosition: h = "left", bodyElement: g = "div", labelElement: v = "label", variant: x, style: w, vars: k, mod: C, attributes: j, ...N }) {
  const T = Me({
    name: e,
    props: t,
    className: n,
    style: w,
    classes: Qu,
    classNames: o,
    styles: r,
    unstyled: s,
    attributes: j
  }), S = c ? `${u}-description` : void 0, y = p && typeof p != "boolean" ? `${u}-error` : void 0;
  return /* @__PURE__ */ l.jsx(Q, {
    ...T("root"),
    __vars: {
      "--label-fz": Rr(m),
      "--label-lh": $e(m, "label-lh")
    },
    mod: [{ "label-position": h }, C],
    variant: x,
    size: m,
    ...N,
    children: /* @__PURE__ */ l.jsxs(Q, {
      component: g,
      htmlFor: g === "label" ? u : void 0,
      ...T("body"),
      children: [a, /* @__PURE__ */ l.jsxs("div", {
        ...T("labelWrapper"),
        "data-disabled": f || void 0,
        children: [
          i && /* @__PURE__ */ l.jsx(Q, {
            component: v,
            htmlFor: v === "label" ? u : void 0,
            ...T("label"),
            "data-disabled": f || void 0,
            children: i
          }),
          c && /* @__PURE__ */ l.jsx(St.Description, {
            id: S,
            size: m,
            __inheritStyles: !1,
            ...T("description"),
            children: c
          }),
          p && typeof p != "boolean" && /* @__PURE__ */ l.jsx(St.Error, {
            id: y,
            size: m,
            __inheritStyles: !1,
            ...T("error"),
            children: p
          })
        ]
      })]
    })
  });
}
si.displayName = "@mantine/core/InlineInput";
var ed = {
  root: "m_bf2d988c",
  inner: "m_26062bec",
  input: "m_26063560",
  icon: "m_bf295423",
  "input--outline": "m_215c4542"
};
const Kg = {
  labelPosition: "right",
  icon: Gu,
  withErrorStyles: !0,
  variant: "filled",
  radius: "sm"
}, td = Oe((e, { radius: t, color: n, size: o, iconColor: r, variant: s, autoContrast: a }) => {
  const i = Hr({
    color: n || e.primaryColor,
    theme: e
  }), c = i.isThemeColor && i.shade === void 0 ? `var(--mantine-color-${i.color}-outline)` : i.color;
  return { root: {
    "--checkbox-size": $e(o, "checkbox-size"),
    "--checkbox-radius": t === void 0 ? void 0 : kt(t),
    "--checkbox-color": s === "outline" ? c : tt(n, e),
    "--checkbox-icon-color": r ? tt(r, e) : Xo(a, e) ? lo({
      color: n,
      theme: e,
      autoContrast: a
    }) : void 0
  } };
}), Jt = se((e) => {
  const t = Z("Checkbox", Kg, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, color: c, label: u, id: f, size: p, radius: m, wrapperProps: h, checked: g, labelPosition: v, description: x, error: w, disabled: k, variant: C, indeterminate: j, icon: N, rootRef: T, iconColor: S, onChange: y, autoContrast: R, mod: D, attributes: O, readOnly: z, onClick: _, withErrorStyles: F, ref: $, ...I } = t, L = d.useRef(null), M = d.use(ni), P = p || M?.size, B = Me({
    name: "Checkbox",
    props: t,
    classes: ed,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: O,
    vars: i,
    varsResolver: td
  }), { styleProps: W, rest: U } = yl(I), Y = $t(f), ae = [
    x ? `${Y}-description` : void 0,
    w && typeof w != "boolean" ? `${Y}-error` : void 0,
    U["aria-describedby"]
  ].filter(Boolean).join(" ") || void 0, fe = {
    checked: M?.value.includes(U.value) ?? g,
    onChange: (me) => {
      z || (M?.onChange(me), y?.(me));
    }
  }, ie = M?.isDisabled?.(U.value) ?? !1, te = k || ie;
  return d.useEffect(() => {
    L.current && (L.current.indeterminate = j || !1, j ? L.current.setAttribute("data-indeterminate", "true") : L.current.removeAttribute("data-indeterminate"));
  }, [j]), /* @__PURE__ */ l.jsx(si, {
    ...B("root"),
    __staticSelector: "Checkbox",
    __stylesApiProps: t,
    id: Y,
    size: P,
    labelPosition: v,
    label: u,
    description: x,
    error: w,
    disabled: te,
    classNames: n,
    styles: s,
    unstyled: a,
    "data-checked": fe.checked || g || void 0,
    variant: C,
    ref: T,
    mod: D,
    attributes: O,
    inert: U.inert,
    ...W,
    ...h,
    children: /* @__PURE__ */ l.jsxs(Q, {
      ...B("inner"),
      mod: { labelPosition: v },
      children: [/* @__PURE__ */ l.jsx(Q, {
        component: "input",
        id: Y,
        ref: ze(L, $),
        mod: {
          error: !!w,
          "with-error-styles": F
        },
        ...B("input", {
          focusable: !0,
          variant: C
        }),
        ...U,
        ...fe,
        "aria-describedby": ae,
        disabled: te,
        inert: U.inert,
        type: "checkbox",
        onClick: (me) => {
          z && fe.checked === void 0 && me.preventDefault(), _?.(me);
        }
      }), /* @__PURE__ */ l.jsx(N, {
        indeterminate: j,
        ...B("icon")
      })]
    })
  });
});
Jt.classes = {
  ...ed,
  ...qg
};
Jt.varsResolver = td;
Jt.displayName = "@mantine/core/Checkbox";
Jt.Group = oi;
Jt.Indicator = ns;
Jt.Card = ts;
function Do(e) {
  return "group" in e;
}
function nd({ options: e, search: t, limit: n }) {
  const o = t.trim().toLowerCase(), r = [];
  for (let s = 0; s < e.length; s += 1) {
    const a = e[s];
    if (r.length === n) return r;
    Do(a) && r.push({
      group: a.group,
      items: nd({
        options: a.items,
        search: t,
        limit: n - r.length
      })
    }), Do(a) || a.label.toLowerCase().includes(o) && r.push(a);
  }
  return r;
}
function Xg(e) {
  if (e.length === 0) return !0;
  for (const t of e)
    if (!("group" in t) || t.items.length > 0) return !1;
  return !0;
}
function od(e, t = /* @__PURE__ */ new Set()) {
  if (Array.isArray(e))
    for (const n of e) if (Do(n)) od(n.items, t);
    else {
      if (typeof n.value > "u") throw new Error("[@mantine/core] Each option must have value property");
      if (t.has(n.value)) throw new Error(`[@mantine/core] Duplicate options are not supported. Option with value "${n.value}" was provided more than once`);
      t.add(n.value);
    }
}
function Yg(e, t) {
  return Array.isArray(e) ? e.includes(t) : e === t;
}
function rd({ data: e, withCheckIcon: t, withAlignedLabels: n, value: o, checkIconPosition: r, unstyled: s, renderOption: a }) {
  if (!Do(e)) {
    const c = Yg(o, e.value), u = t && (c ? /* @__PURE__ */ l.jsx(ri, { className: it.optionsDropdownCheckIcon }) : n ? /* @__PURE__ */ l.jsx("div", { className: it.optionsDropdownCheckPlaceholder }) : null), f = /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
      r === "left" && u,
      /* @__PURE__ */ l.jsx("span", { children: e.label }),
      r === "right" && u
    ] });
    return /* @__PURE__ */ l.jsx(we.Option, {
      value: e.value,
      disabled: e.disabled,
      className: Gt({ [it.optionsDropdownOption]: !s }),
      "data-reverse": r === "right" || void 0,
      "data-checked": c || void 0,
      "aria-selected": c,
      active: c,
      children: typeof a == "function" ? a({
        option: e,
        checked: c
      }) : f
    });
  }
  const i = e.items.map((c) => /* @__PURE__ */ l.jsx(rd, {
    data: c,
    value: o,
    unstyled: s,
    withCheckIcon: t,
    withAlignedLabels: n,
    checkIconPosition: r,
    renderOption: a
  }, `${c.value}`));
  return /* @__PURE__ */ l.jsx(we.Group, {
    label: e.group,
    children: i
  });
}
function Gg({ data: e, hidden: t, hiddenWhenEmpty: n, filter: o, search: r, limit: s, maxDropdownHeight: a, floatingHeight: i, withScrollArea: c = !0, filterOptions: u = !0, withCheckIcon: f = !1, withAlignedLabels: p = !1, value: m, checkIconPosition: h, nothingFoundMessage: g, unstyled: v, labelId: x, renderOption: w, scrollAreaProps: k, "aria-label": C }) {
  const j = bt();
  od(e);
  const N = typeof r == "string" ? (o || nd)({
    options: e,
    search: u ? r : "",
    limit: s ?? 1 / 0
  }) : e, T = Xg(N), S = N.map((y, R) => /* @__PURE__ */ l.jsx(rd, {
    data: y,
    withCheckIcon: f,
    withAlignedLabels: p,
    value: m,
    checkIconPosition: h,
    unstyled: v,
    renderOption: w
  }, Do(y) ? `group-${typeof y.group == "string" ? y.group : R}` : `${y.value}`));
  return /* @__PURE__ */ l.jsx(we.Dropdown, {
    hidden: t || n && T,
    "data-composed": !0,
    children: /* @__PURE__ */ l.jsxs(we.Options, {
      labelledBy: x,
      "aria-label": C,
      children: [c ? /* @__PURE__ */ l.jsx(bn.Autosize, {
        mah: (i ?? j.floatingHeight) === "viewport" ? "var(--combobox-floating-options-max-height)" : a ?? 220,
        type: "scroll",
        scrollbarSize: "var(--combobox-padding)",
        offsetScrollbars: "y",
        ...k,
        children: S
      }) : S, T && g && /* @__PURE__ */ l.jsx(we.Empty, { children: g })]
    })
  });
}
function Jg(e) {
  const t = e.currentTarget;
  return _t(t).activeElement !== t;
}
var sd = {
  root: "m_de3d2490",
  colorOverlay: "m_862f3d1b",
  shadowOverlay: "m_98ae7f22",
  alphaOverlay: "m_95709ac0",
  childrenOverlay: "m_93e74e3"
};
const gc = { withShadow: !0 }, ad = Oe((e, { radius: t, size: n }) => ({ root: {
  "--cs-radius": t === void 0 ? void 0 : kt(t),
  "--cs-size": Pe(n)
} })), ho = vl((e) => {
  const t = Z("ColorSwatch", gc, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, color: c, radius: u, withShadow: f, children: p, attributes: m, ...h } = Z("ColorSwatch", gc, t), g = Me({
    name: "ColorSwatch",
    props: t,
    classes: sd,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: m,
    vars: i,
    varsResolver: ad
  });
  return /* @__PURE__ */ l.jsxs(Q, {
    ...g("root", { focusable: !0 }),
    ...h,
    children: [
      /* @__PURE__ */ l.jsx("span", { ...g("alphaOverlay") }),
      f && /* @__PURE__ */ l.jsx("span", { ...g("shadowOverlay") }),
      /* @__PURE__ */ l.jsx("span", { ...g("colorOverlay", { style: { backgroundColor: c } }) }),
      /* @__PURE__ */ l.jsx("span", {
        ...g("childrenOverlay"),
        children: p
      })
    ]
  });
});
ho.classes = sd;
ho.varsResolver = ad;
ho.displayName = "@mantine/core/ColorSwatch";
function xt(e, t = 0, n = 10 ** t) {
  return Math.round(n * e) / n;
}
function Zg({ h: e, s: t, l: n, a: o }) {
  const r = t * ((n < 50 ? n : 100 - n) / 100);
  return {
    h: e,
    s: r > 0 ? 2 * r / (n + r) * 100 : 0,
    v: n + r,
    a: o
  };
}
const Qg = {
  grad: 360 / 400,
  turn: 360,
  rad: 360 / (Math.PI * 2)
};
function ev(e, t = "deg") {
  return Number(e) * (Qg[t] || 1);
}
const tv = /hsla?\(?\s*(-?\d*\.?\d+)(deg|rad|grad|turn)?[,\s]+(-?\d*\.?\d+)%?[,\s]+(-?\d*\.?\d+)%?,?\s*[/\s]*(-?\d*\.?\d+)?(%)?\s*\)?/i;
function vc(e) {
  const t = tv.exec(e);
  return t ? Zg({
    h: ev(t[1], t[2]),
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
function ea({ r: e, g: t, b: n, a: o }) {
  const r = Math.max(e, t, n), s = r - Math.min(e, t, n), a = s ? r === e ? (t - n) / s : r === t ? 2 + (n - e) / s : 4 + (e - t) / s : 0;
  return {
    h: xt(60 * (a < 0 ? a + 6 : a), 3),
    s: xt(r ? s / r * 100 : 0, 3),
    v: xt(r / 255 * 100, 3),
    a: o
  };
}
function ta(e) {
  const t = e[0] === "#" ? e.slice(1) : e;
  return t.length === 3 ? ea({
    r: parseInt(t[0] + t[0], 16),
    g: parseInt(t[1] + t[1], 16),
    b: parseInt(t[2] + t[2], 16),
    a: 1
  }) : ea({
    r: parseInt(t.slice(0, 2), 16),
    g: parseInt(t.slice(2, 4), 16),
    b: parseInt(t.slice(4, 6), 16),
    a: 1
  });
}
function nv(e) {
  const t = e[0] === "#" ? e.slice(1) : e, n = (s) => xt(parseInt(s, 16) / 255, 3);
  if (t.length === 4) {
    const s = t.slice(0, 3), a = n(t[3] + t[3]);
    return {
      ...ta(s),
      a
    };
  }
  const o = t.slice(0, 6), r = n(t.slice(6, 8));
  return {
    ...ta(o),
    a: r
  };
}
const ov = /rgba?\(?\s*(-?\d*\.?\d+)(%)?[,\s]+(-?\d*\.?\d+)(%)?[,\s]+(-?\d*\.?\d+)(%)?,?\s*[/\s]*(-?\d*\.?\d+)?(%)?\s*\)?/i;
function yc(e) {
  const t = ov.exec(e);
  return t ? ea({
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
const id = {
  hex: /^#?([0-9A-F]{3}){1,2}$/i,
  hexa: /^#?([0-9A-F]{4}){1,2}$/i,
  rgb: /^rgb\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/i,
  rgba: /^rgba\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/i,
  hsl: /hsl\(\s*(\d+)\s*,\s*(\d+(?:\.\d+)?%)\s*,\s*(\d+(?:\.\d+)?%)\)/i,
  hsla: /^hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*(\d*(?:\.\d+)?)\)$/i
}, rv = {
  hex: ta,
  hexa: nv,
  rgb: yc,
  rgba: yc,
  hsl: vc,
  hsla: vc
};
function Co(e) {
  for (const [, t] of Object.entries(id)) if (t.test(e)) return !0;
  return !1;
}
function jn(e) {
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
  for (const [n, o] of Object.entries(id)) if (o.test(t)) return rv[n](t);
  return {
    h: 0,
    s: 0,
    v: 0,
    a: 1
  };
}
const os = d.createContext(null);
function ai({ position: e, ...t }) {
  return /* @__PURE__ */ l.jsx(Q, {
    __vars: {
      "--thumb-y-offset": `${e.y * 100}%`,
      "--thumb-x-offset": `${e.x * 100}%`
    },
    ...t
  });
}
ai.displayName = "@mantine/core/ColorPickerThumb";
var rs = {
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
const go = se((e) => {
  const t = Z("ColorSlider", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, onChange: c, onChangeEnd: u, maxValue: f, round: p, size: m = "md", focusable: h = !0, value: g, overlays: v, thumbColor: x = "transparent", onScrubStart: w, onScrubEnd: k, __staticSelector: C = "ColorPicker", attributes: j, ref: N, ...T } = t, S = Me({
    name: C,
    classes: rs,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: j,
    rootSelector: "slider"
  }), y = d.use(os)?.getStyles || S, R = Uo(), [D, O] = d.useState({
    y: 0,
    x: g / f
  }), z = d.useRef(D), _ = (M) => p ? Math.round(M * f) : M * f, { ref: F } = Il(({ x: M, y: P }) => {
    z.current = {
      x: M,
      y: P
    }, c?.(_(M));
  }, {
    onScrubEnd: () => {
      const { x: M } = z.current;
      u?.(_(M)), k?.();
    },
    onScrubStart: w
  });
  pn(() => {
    O({
      y: 0,
      x: g / f
    });
  }, [g]);
  const $ = (M, P) => {
    M.preventDefault();
    const B = Ml(P);
    c?.(_(B.x)), u?.(_(B.x));
  }, I = (M) => {
    switch (M.key) {
      case "ArrowRight":
        $(M, {
          x: D.x + 0.05,
          y: D.y
        });
        break;
      case "ArrowLeft":
        $(M, {
          x: D.x - 0.05,
          y: D.y
        });
    }
  }, L = v.map((M, P) => /* @__PURE__ */ d.createElement("div", {
    ...y("sliderOverlay"),
    style: M,
    key: P
  }));
  return /* @__PURE__ */ l.jsxs(Q, {
    ...T,
    ref: ze(F, N),
    ...y("slider"),
    size: m,
    role: "slider",
    "aria-valuenow": g,
    "aria-valuemax": f,
    "aria-valuemin": 0,
    tabIndex: h ? 0 : -1,
    onKeyDown: I,
    "data-focus-ring": R.focusRing,
    __vars: { "--cp-thumb-size": `var(--cp-thumb-size-${m})` },
    children: [L, /* @__PURE__ */ l.jsx(ai, {
      position: D,
      ...y("thumb", { style: {
        top: Pe(1),
        background: x
      } })
    })]
  });
});
go.displayName = "@mantine/core/ColorSlider";
go.classes = rs;
const sv = { __staticSelector: "AlphaSlider" }, ii = se((e) => {
  const { value: t, onChange: n, onChangeEnd: o, color: r, ...s } = Z("AlphaSlider", sv, e);
  return /* @__PURE__ */ l.jsx(go, {
    ...s,
    value: t,
    onChange: (a) => n?.(xt(a, 2)),
    onChangeEnd: (a) => o?.(xt(a, 2)),
    maxValue: 1,
    round: !1,
    "data-alpha": !0,
    overlays: [
      {
        backgroundImage: "linear-gradient(45deg, var(--slider-checkers) 25%, transparent 25%), linear-gradient(-45deg, var(--slider-checkers) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--slider-checkers) 75%), linear-gradient(-45deg, var(--mantine-color-body) 75%, var(--slider-checkers) 75%)",
        backgroundSize: `${Pe(8)} ${Pe(8)}`,
        backgroundPosition: `0 0, 0 ${Pe(4)}, ${Pe(4)} ${Pe(-4)}, ${Pe(-4)} 0`
      },
      { backgroundImage: `linear-gradient(90deg, transparent, ${r})` },
      { boxShadow: `rgba(0, 0, 0, .1) 0 0 0 ${Pe(1)} inset, rgb(0, 0, 0, .15) 0 0 ${Pe(4)} inset` }
    ]
  });
});
ii.displayName = "@mantine/core/AlphaSlider";
ii.classes = go.classes;
function cd({ h: e, s: t, v: n, a: o }) {
  const r = e / 360 * 6, s = t / 100, a = n / 100, i = Math.floor(r), c = a * (1 - s), u = a * (1 - (r - i) * s), f = a * (1 - (1 - r + i) * s), p = i % 6;
  return {
    r: xt([
      a,
      u,
      c,
      c,
      f,
      a
    ][p] * 255),
    g: xt([
      f,
      a,
      a,
      u,
      c,
      c
    ][p] * 255),
    b: xt([
      c,
      c,
      f,
      a,
      a,
      u
    ][p] * 255),
    a: xt(o, 2)
  };
}
function bc(e, t) {
  const { r: n, g: o, b: r, a: s } = cd(e);
  return t ? `rgba(${n}, ${o}, ${r}, ${xt(s, 2)})` : `rgb(${n}, ${o}, ${r})`;
}
function xc({ h: e, s: t, v: n, a: o }, r) {
  const s = (200 - t) * n / 100, a = {
    h: Math.round(e),
    s: Math.round(s > 0 && s < 200 ? t * n / 100 / (s <= 100 ? s : 200 - s) * 100 : 0),
    l: Math.round(s / 2)
  };
  return r ? `hsla(${a.h}, ${a.s}%, ${a.l}%, ${xt(o, 2)})` : `hsl(${a.h}, ${a.s}%, ${a.l}%)`;
}
function Sr(e) {
  const t = e.toString(16);
  return t.length < 2 ? `0${t}` : t;
}
function ld(e) {
  const { r: t, g: n, b: o } = cd(e);
  return `#${Sr(t)}${Sr(n)}${Sr(o)}`;
}
function av(e) {
  const t = Math.round(e.a * 255);
  return `${ld(e)}${Sr(t)}`;
}
const Ms = {
  hex: ld,
  hexa: (e) => av(e),
  rgb: (e) => bc(e, !1),
  rgba: (e) => bc(e, !0),
  hsl: (e) => xc(e, !1),
  hsla: (e) => xc(e, !0)
};
function Tt(e, t) {
  return t ? e in Ms ? Ms[e](t) : Ms.hex(t) : "#000000";
}
const iv = { __staticSelector: "HueSlider" }, ci = se((e) => {
  const { value: t, onChange: n, onChangeEnd: o, color: r, ...s } = Z("HueSlider", iv, e);
  return /* @__PURE__ */ l.jsx(go, {
    ...s,
    value: t,
    onChange: n,
    onChangeEnd: o,
    maxValue: 360,
    thumbColor: `hsl(${t}, 100%, 50%)`,
    round: !0,
    "data-hue": !0,
    overlays: [{ backgroundImage: "linear-gradient(to right,hsl(0,100%,50%),hsl(60,100%,50%),hsl(120,100%,50%),hsl(170,100%,50%),hsl(240,100%,50%),hsl(300,100%,50%),hsl(360,100%,50%))" }, { boxShadow: `rgba(0, 0, 0, .1) 0 0 0 ${Pe(1)} inset, rgb(0, 0, 0, .15) 0 0 ${Pe(4)} inset` }]
  });
});
ci.displayName = "@mantine/core/HueSlider";
ci.classes = go.classes;
function ud({ className: e, onChange: t, onChangeEnd: n, value: o, saturationLabel: r, focusable: s = !0, size: a, color: i, onScrubStart: c, onScrubEnd: u, ...f }) {
  const { getStyles: p } = d.use(os), [m, h] = d.useState({
    x: o.s / 100,
    y: 1 - o.v / 100
  }), g = d.useRef(m), { ref: v } = Il(({ x: k, y: C }) => {
    g.current = {
      x: k,
      y: C
    }, t({
      s: Math.round(k * 100),
      v: Math.round((1 - C) * 100)
    });
  }, {
    onScrubEnd: () => {
      const { x: k, y: C } = g.current;
      n({
        s: Math.round(k * 100),
        v: Math.round((1 - C) * 100)
      }), u?.();
    },
    onScrubStart: c
  });
  d.useEffect(() => {
    h({
      x: o.s / 100,
      y: 1 - o.v / 100
    });
  }, [o.s, o.v]);
  const x = (k, C) => {
    k.preventDefault();
    const j = Ml(C);
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
          y: m.y - 0.05,
          x: m.x
        });
        break;
      case "ArrowDown":
        x(k, {
          y: m.y + 0.05,
          x: m.x
        });
        break;
      case "ArrowRight":
        x(k, {
          x: m.x + 0.05,
          y: m.y
        });
        break;
      case "ArrowLeft":
        x(k, {
          x: m.x - 0.05,
          y: m.y
        });
    }
  };
  return /* @__PURE__ */ l.jsxs(Q, {
    ...p("saturation"),
    ref: v,
    ...f,
    role: "slider",
    "aria-label": r,
    "aria-valuenow": m.x,
    "aria-valuetext": Tt("rgba", o),
    tabIndex: s ? 0 : -1,
    onKeyDown: w,
    children: [
      /* @__PURE__ */ l.jsx("div", { ...p("saturationOverlay", { style: { backgroundColor: `hsl(${o.h}, 100%, 50%)` } }) }),
      /* @__PURE__ */ l.jsx("div", { ...p("saturationOverlay", { style: { backgroundImage: "linear-gradient(90deg, #fff, transparent)" } }) }),
      /* @__PURE__ */ l.jsx("div", { ...p("saturationOverlay", { style: { backgroundImage: "linear-gradient(0deg, #000, transparent)" } }) }),
      /* @__PURE__ */ l.jsx(ai, {
        position: m,
        ...p("thumb", { style: { backgroundColor: i } })
      })
    ]
  });
}
ud.displayName = "@mantine/core/Saturation";
function dd({ className: e, datatype: t, setValue: n, onChangeEnd: o, size: r, focusable: s, data: a, swatchesPerRow: i, value: c, ...u }) {
  const f = d.use(os), p = a.map((m, h) => /* @__PURE__ */ d.createElement(ho, {
    ...f.getStyles("swatch"),
    unstyled: f.unstyled,
    component: "button",
    type: "button",
    color: m,
    key: h,
    radius: "sm",
    onClick: () => {
      n(m), o?.(m);
    },
    "aria-label": m,
    tabIndex: s ? 0 : -1,
    "data-swatch": !0
  }, c === m && /* @__PURE__ */ l.jsx(ri, {
    size: "35%",
    color: Jf(m) < 0.5 ? "white" : "black"
  })));
  return /* @__PURE__ */ l.jsx(Q, {
    ...f.getStyles("swatches"),
    ...u,
    children: p
  });
}
dd.displayName = "@mantine/core/Swatches";
const cv = {
  swatchesPerRow: 7,
  withPicker: !0,
  focusable: !0,
  size: "md",
  __staticSelector: "ColorPicker"
}, fd = Oe((e, { size: t, swatchesPerRow: n }) => ({ wrapper: {
  "--cp-preview-size": $e(t, "cp-preview-size"),
  "--cp-width": $e(t, "cp-width"),
  "--cp-body-spacing": Po(t),
  "--cp-swatch-size": `${100 / n}%`,
  "--cp-thumb-size": $e(t, "cp-thumb-size"),
  "--cp-saturation-height": $e(t, "cp-saturation-height")
} })), ss = se((e) => {
  const t = Z("ColorPicker", cv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, format: c = "hex", value: u, defaultValue: f, onChange: p, onChangeEnd: m, withPicker: h, size: g, saturationLabel: v, hueLabel: x, alphaLabel: w, focusable: k, swatches: C, swatchesPerRow: j, fullWidth: N, onColorSwatchClick: T, __staticSelector: S, mod: y, attributes: R, name: D, hiddenInputProps: O, ...z } = t, _ = Me({
    name: S,
    props: t,
    classes: rs,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: R,
    rootSelector: "wrapper",
    vars: i,
    varsResolver: fd
  }), F = d.useRef(c || "hex"), $ = d.useRef(""), I = d.useRef(-1), L = d.useRef(!1), M = c === "hexa" || c === "rgba" || c === "hsla", [P, B, W] = Ye({
    value: u,
    defaultValue: f,
    finalValue: "#FFFFFF",
    onChange: p
  }), [U, Y] = d.useState(jn(P)), ae = () => {
    window.clearTimeout(I.current), L.current = !0;
  }, fe = () => {
    window.clearTimeout(I.current), I.current = window.setTimeout(() => {
      L.current = !1;
    }, 200);
  }, ie = (te) => {
    Y((me) => {
      const q = {
        ...me,
        ...te
      };
      return $.current = Tt(F.current, q), q;
    }), B($.current);
  };
  return pn(() => {
    typeof u == "string" && Co(u) && !L.current && Y(jn(u));
  }, [u]), pn(() => {
    F.current = c || "hex", B(Tt(F.current, U));
  }, [c]), /* @__PURE__ */ l.jsx(os, {
    value: {
      getStyles: _,
      unstyled: a
    },
    children: /* @__PURE__ */ l.jsxs(Q, {
      ..._("wrapper"),
      size: g,
      mod: [{ "full-width": N }, y],
      ...z,
      children: [
        D && /* @__PURE__ */ l.jsx("input", {
          type: "hidden",
          name: D,
          value: P,
          ...O
        }),
        h && /* @__PURE__ */ l.jsxs(l.Fragment, { children: [/* @__PURE__ */ l.jsx(ud, {
          value: U,
          onChange: ie,
          onChangeEnd: ({ s: te, v: me }) => m?.(Tt(F.current, {
            ...U,
            s: te,
            v: me
          })),
          color: P,
          size: g,
          focusable: k,
          saturationLabel: v,
          onScrubStart: ae,
          onScrubEnd: fe
        }), /* @__PURE__ */ l.jsxs("div", {
          ..._("body"),
          children: [/* @__PURE__ */ l.jsxs("div", {
            ..._("sliders"),
            children: [/* @__PURE__ */ l.jsx(ci, {
              value: U.h,
              onChange: (te) => ie({ h: te }),
              onChangeEnd: (te) => m?.(Tt(F.current, {
                ...U,
                h: te
              })),
              size: g,
              focusable: k,
              "aria-label": x,
              onScrubStart: ae,
              onScrubEnd: fe
            }), M && /* @__PURE__ */ l.jsx(ii, {
              value: U.a,
              onChange: (te) => ie({ a: te }),
              onChangeEnd: (te) => {
                m?.(Tt(F.current, {
                  ...U,
                  a: te
                }));
              },
              size: g,
              color: Tt("hex", U),
              focusable: k,
              "aria-label": w,
              onScrubStart: ae,
              onScrubEnd: fe
            })]
          }), M && /* @__PURE__ */ l.jsx(ho, {
            color: P,
            radius: "sm",
            size: "var(--cp-preview-size)",
            ..._("preview")
          })]
        })] }),
        Array.isArray(C) && /* @__PURE__ */ l.jsx(dd, {
          data: C,
          swatchesPerRow: j,
          focusable: k,
          setValue: B,
          value: P,
          onChangeEnd: (te) => {
            const me = Tt(c, jn(te));
            T?.(me), m?.(me), W || Y(jn(te));
          }
        })
      ]
    })
  });
});
ss.classes = rs;
ss.varsResolver = fd;
ss.displayName = "@mantine/core/ColorPicker";
function lv({ style: e, ...t }) {
  return /* @__PURE__ */ l.jsxs("svg", {
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
      /* @__PURE__ */ l.jsx("path", {
        stroke: "none",
        d: "M0 0h24v24H0z",
        fill: "none"
      }),
      /* @__PURE__ */ l.jsx("path", { d: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" }),
      /* @__PURE__ */ l.jsx("path", { d: "M12 3l0 4" }),
      /* @__PURE__ */ l.jsx("path", { d: "M12 21l0 -3" }),
      /* @__PURE__ */ l.jsx("path", { d: "M3 12l4 0" }),
      /* @__PURE__ */ l.jsx("path", { d: "M21 12l-3 0" }),
      /* @__PURE__ */ l.jsx("path", { d: "M12 12l0 .01" })
    ]
  });
}
var wc = {
  eyeDropperIcon: "m_b077c2bc",
  eyeDropperButton: "m_66a028b5",
  colorPreview: "m_c5ccdcab",
  dropdown: "m_5ece2cd7"
};
const Sc = {
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
}, pd = Oe((e, { size: t }) => ({
  eyeDropperIcon: { "--ci-eye-dropper-icon-size": $e(t, "ci-eye-dropper-icon-size") },
  eyeDropperButton: { "--ci-button-size": $e(t, "ci-button-size") },
  colorPreview: { "--ci-preview-size": $e(t, "ci-preview-size") }
})), Jo = se((e) => {
  const t = Z([
    "Input",
    "InputWrapper",
    "ColorInput"
  ], Sc, e), { classNames: n, styles: o, unstyled: r, disallowInput: s, fixOnBlur: a, popoverProps: i, withPreview: c, withEyeDropper: u, eyeDropperIcon: f, closeOnColorSwatchClick: p, eyeDropperButtonProps: m, value: h, defaultValue: g, onChange: v, onChangeEnd: x, onClick: w, onFocus: k, onBlur: C, inputProps: j, format: N = "hex", wrapperProps: T, readOnly: S, withPicker: y, swatches: R, disabled: D, leftSection: O, rightSection: z, swatchesPerRow: _, fullWidth: F, ...$ } = lp("ColorInput", Sc, e), I = Me({
    name: "ColorInput",
    props: t,
    classes: wc,
    classNames: n,
    styles: o,
    unstyled: r,
    rootSelector: "wrapper",
    vars: t.vars,
    varsResolver: pd
  }), { resolvedClassNames: L, resolvedStyles: M } = qo({
    classNames: n,
    styles: o,
    props: t
  }), [P, B] = d.useState(!1), [W, U] = d.useState(""), [Y, ae] = Ye({
    value: h,
    defaultValue: g,
    finalValue: "",
    onChange: v
  }), { supported: fe, open: ie } = Tp(), te = /* @__PURE__ */ l.jsx(Ro, {
    ...m,
    ...I("eyeDropperButton", {
      className: m?.className,
      style: m?.style
    }),
    variant: "subtle",
    color: "gray",
    unstyled: r,
    onClick: () => ie().then((ce) => {
      if (ce?.sRGBHex) {
        const be = Tt(N, jn(ce.sRGBHex));
        ae(be), x?.(be);
      }
    }).catch(() => {
    }),
    children: f || /* @__PURE__ */ l.jsx(lv, { ...I("eyeDropperIcon") })
  }), me = (ce) => {
    k?.(ce), B(!0);
  }, q = (ce) => {
    a && ae(W), C?.(ce), B(!1);
  }, K = (ce) => {
    w?.(ce), B(!0);
  };
  return d.useEffect(() => {
    (Co(Y) || Y.trim() === "") && U(Y);
  }, [Y]), pn(() => {
    Co(Y) && ae(Tt(N, jn(Y)));
  }, [N]), /* @__PURE__ */ l.jsx(St.Wrapper, {
    ...T,
    classNames: L,
    styles: M,
    __staticSelector: "ColorInput",
    children: /* @__PURE__ */ l.jsxs(Fe, {
      __staticSelector: "ColorInput",
      position: "bottom-start",
      offset: 5,
      opened: P,
      width: F ? "target" : void 0,
      ...i,
      classNames: L,
      styles: M,
      unstyled: r,
      withRoles: !1,
      disabled: S || y === !1 && (!Array.isArray(R) || R.length === 0),
      children: [/* @__PURE__ */ l.jsx(Fe.Target, { children: /* @__PURE__ */ l.jsx(St, {
        autoComplete: "off",
        ...$,
        ...j,
        classNames: L,
        styles: M,
        disabled: D,
        __staticSelector: "ColorInput",
        onFocus: me,
        onBlur: q,
        onClick: K,
        spellCheck: !1,
        value: Y,
        onChange: (ce) => {
          const be = ce.currentTarget.value;
          ae(be), Co(be) && x?.(Tt(N, jn(be)));
        },
        leftSection: O || (c ? /* @__PURE__ */ l.jsx(ho, {
          color: Co(Y) ? Y : "#fff",
          size: "var(--ci-preview-size)",
          ...I("colorPreview")
        }) : null),
        readOnly: s || S,
        pointer: s,
        unstyled: r,
        rightSection: z || (u && !D && !S && fe ? te : null)
      }) }), /* @__PURE__ */ l.jsx(Fe.Dropdown, {
        onMouseDown: (ce) => ce.preventDefault(),
        className: wc.dropdown,
        children: /* @__PURE__ */ l.jsx(ss, {
          __staticSelector: "ColorInput",
          value: Y,
          onChange: ae,
          onChangeEnd: x,
          format: N,
          swatches: R,
          swatchesPerRow: _,
          withPicker: y,
          size: j.size,
          focusable: !1,
          unstyled: r,
          styles: M,
          classNames: L,
          onColorSwatchClick: () => p && B(!1),
          attributes: T.attributes,
          fullWidth: F
        })
      })]
    })
  });
});
Jo.classes = yt.classes;
Jo.varsResolver = pd;
Jo.displayName = "@mantine/core/ColorInput";
var md = {
  root: "m_3eebeb36",
  label: "m_9e365f20"
};
const uv = { orientation: "horizontal" }, hd = Oe((e, { color: t, variant: n, size: o }) => ({ root: {
  "--divider-color": t ? tt(t, e) : void 0,
  "--divider-border-style": n,
  "--divider-size": $e(o, "divider-size")
} })), as = se((e) => {
  const t = Z("Divider", uv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, color: c, orientation: u, label: f, labelPosition: p, mod: m, attributes: h, ...g } = t, v = Me({
    name: "Divider",
    classes: md,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: h,
    vars: i,
    varsResolver: hd
  });
  return /* @__PURE__ */ l.jsx(Q, {
    mod: [{
      orientation: u,
      withLabel: !!f
    }, m],
    role: "separator",
    ...v("root"),
    ...g,
    children: f && /* @__PURE__ */ l.jsx(Q, {
      component: "span",
      mod: { position: p },
      ...v("label"),
      children: f
    })
  });
});
as.classes = md;
as.varsResolver = hd;
as.displayName = "@mantine/core/Divider";
const gd = vn((e) => {
  const { onChange: t, children: n, multiple: o, accept: r, name: s, form: a, resetRef: i, disabled: c, capture: u, inputProps: f, ref: p, ...m } = Z("FileButton", null, e), h = d.useRef(null), g = () => {
    !c && h.current?.click();
  }, v = (w) => {
    if (w.currentTarget.files === null) return t(o ? [] : null);
    t(o ? Array.from(w.currentTarget.files) : w.currentTarget.files[0] || null);
  };
  return Sl(i, () => {
    h.current && (h.current.value = "");
  }), /* @__PURE__ */ l.jsxs(l.Fragment, { children: [/* @__PURE__ */ l.jsx("input", {
    style: { display: "none" },
    type: "file",
    accept: r,
    multiple: o,
    onChange: v,
    ref: ze(p, h),
    name: s,
    form: a,
    capture: u,
    ...f
  }), n({
    onClick: g,
    ...m
  })] });
});
gd.displayName = "@mantine/core/FileButton";
const dv = ({ value: e }) => /* @__PURE__ */ l.jsx("div", {
  style: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  children: Array.isArray(e) ? e.map((t) => t.name).join(", ") : e?.name
}), fv = {
  valueComponent: dv,
  size: "sm"
}, li = vn((e) => {
  const t = Z([
    "Input",
    "InputWrapper",
    "FileInput"
  ], fv, e), { unstyled: n, vars: o, onChange: r, value: s, defaultValue: a, multiple: i, accept: c, name: u, form: f, valueComponent: p, clearable: m, clearSectionMode: h, clearButtonProps: g, readOnly: v, capture: x, fileInputProps: w, rightSection: k, size: C, placeholder: j, component: N, resetRef: T, classNames: S, styles: y, attributes: R, ...D } = t, O = d.useRef(null), { resolvedClassNames: z, resolvedStyles: _ } = qo({
    classNames: S,
    styles: y,
    props: t
  }), [F, $] = Ye({
    value: s,
    defaultValue: a,
    onChange: r,
    finalValue: i ? [] : null
  }), I = Array.isArray(F) ? F.length !== 0 : F !== null, L = /* @__PURE__ */ l.jsx(kl, {
    ...g,
    variant: "subtle",
    onClick: () => $(i ? [] : null),
    size: C,
    unstyled: n
  }), M = m && I && !v;
  return d.useEffect(() => {
    (Array.isArray(F) && F.length === 0 || F === null) && O.current?.();
  }, [F]), /* @__PURE__ */ l.jsx(gd, {
    onChange: $,
    multiple: i,
    accept: c,
    name: u,
    form: f,
    resetRef: ze(O, T),
    disabled: v,
    capture: x,
    inputProps: w,
    children: (P) => /* @__PURE__ */ l.jsx(yt, {
      component: N || "button",
      rightSection: k,
      __clearSection: L,
      __clearable: M,
      __clearSectionMode: h,
      ...P,
      ...D,
      __staticSelector: "FileInput",
      multiline: !0,
      type: "button",
      pointer: !0,
      __stylesApiProps: t,
      unstyled: n,
      size: C,
      classNames: S,
      styles: y,
      attributes: R,
      children: I ? /* @__PURE__ */ l.jsx(p, { value: F }) : /* @__PURE__ */ l.jsx(St.Placeholder, {
        __staticSelector: "FileInput",
        classNames: z,
        styles: _,
        attributes: R,
        children: j
      })
    })
  });
});
li.classes = yt.classes;
li.displayName = "@mantine/core/FileInput";
const pv = [
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
], Cc = {
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
function jc(e) {
  Object.keys(Cc).forEach((t) => {
    e.style.setProperty(t, Cc[t], "important");
  });
}
function mv(e) {
  const t = window.getComputedStyle(e);
  if (t === null) return null;
  const n = {};
  for (const o of pv) n[o] = t[o];
  return n.boxSizing === "" ? null : {
    sizingStyle: n,
    paddingSize: parseFloat(n.paddingBottom) + parseFloat(n.paddingTop),
    borderSize: parseFloat(n.borderBottomWidth) + parseFloat(n.borderTopWidth)
  };
}
let Ke = null;
function hv(e, t, n = 1, o = 1 / 0) {
  Ke || (Ke = document.createElement("textarea"), Ke.setAttribute("tabindex", "-1"), Ke.setAttribute("aria-hidden", "true"), Ke.setAttribute("aria-label", "autosize measurement"), jc(Ke)), Ke.parentNode === null && document.body.appendChild(Ke);
  const { paddingSize: r, borderSize: s, sizingStyle: a } = e, { boxSizing: i } = a;
  Object.keys(a).forEach((m) => {
    Ke.style[m] = a[m];
  }), jc(Ke), Ke.value = t;
  let c = i === "border-box" ? Ke.scrollHeight + s : Ke.scrollHeight - r;
  Ke.value = t, c = i === "border-box" ? Ke.scrollHeight + s : Ke.scrollHeight - r, Ke.value = "x";
  const u = Ke.scrollHeight - r;
  let f = u * n;
  i === "border-box" && (f = f + r + s), c = Math.max(f, c);
  let p = u * o;
  return i === "border-box" && (p = p + r + s), c = Math.min(p, c), [c, u];
}
function gv({ maxRows: e, minRows: t, onChange: n, ref: o, ...r }) {
  const s = r.value !== void 0, a = d.useRef(null), i = ze(a, o), c = d.useRef(0), u = d.useRef(0), f = () => {
    const h = a.current;
    if (!h) return;
    const g = mv(h);
    if (!g) return;
    const [v] = hv(g, h.value || h.placeholder || "x", t, e);
    c.current !== v && (c.current = v, h.style.setProperty("height", `${v}px`, "important"));
  }, p = d.useEffectEvent(f), m = (h) => {
    s || f(), n?.(h);
  };
  return d.useLayoutEffect(f), d.useEffect(() => {
    const h = () => f();
    return window.addEventListener("resize", h), () => window.removeEventListener("resize", h);
  }, []), d.useEffect(() => {
    const h = a.current;
    if (!h || typeof ResizeObserver > "u") return;
    u.current = h.offsetWidth;
    let g = 0;
    const v = new ResizeObserver(() => {
      a.current && a.current.offsetWidth !== u.current && (u.current = a.current.offsetWidth, cancelAnimationFrame(g), g = requestAnimationFrame(p));
    });
    return v.observe(h), () => {
      cancelAnimationFrame(g), v.disconnect();
    };
  }, []), d.useEffect(() => {
    const h = () => f();
    return document.fonts.addEventListener("loadingdone", h), () => document.fonts.removeEventListener("loadingdone", h);
  }, []), d.useEffect(() => {
    const h = (g) => {
      if (a.current?.form === g.target && !s) {
        const v = a.current.value;
        requestAnimationFrame(() => {
          a.current && v !== a.current.value && f();
        });
      }
    };
    return document.body.addEventListener("reset", h), () => document.body.removeEventListener("reset", h);
  }, [s]), /* @__PURE__ */ l.jsx("textarea", {
    rows: t,
    ...r,
    onChange: m,
    ref: i
  });
}
const no = se((e) => {
  const { autosize: t, maxRows: n, minRows: o, __staticSelector: r, resize: s, bottomSection: a, bottomSectionProps: i, ...c } = Z([
    "Input",
    "InputWrapper",
    "Textarea"
  ], null, e), u = t && Dl() !== "test", f = u ? {
    maxRows: n,
    minRows: o
  } : {};
  return /* @__PURE__ */ l.jsx(yt, {
    component: u ? gv : "textarea",
    ...c,
    __staticSelector: r || "Textarea",
    __bottomSection: a,
    __bottomSectionProps: i,
    multiline: !0,
    "data-no-overflow": t && n === void 0 || void 0,
    __vars: { "--input-resize": s },
    ...f
  });
});
no.classes = yt.classes;
no.displayName = "@mantine/core/Textarea";
function vd({ size: e, style: t, ...n }) {
  return /* @__PURE__ */ l.jsx("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 5 5",
    style: {
      width: Pe(e),
      height: Pe(e),
      ...t
    },
    "aria-hidden": !0,
    ...n,
    children: /* @__PURE__ */ l.jsx("circle", {
      cx: "2.5",
      cy: "2.5",
      r: "2.5",
      fill: "currentColor"
    })
  });
}
const [vv, vo] = Wt("Modal component was not found in tree");
var tn = {
  root: "m_9df02822",
  content: "m_54c44539",
  inner: "m_1f958f16",
  header: "m_d0e2b9cd"
};
const is = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ModalBody", null, e), i = vo();
  return /* @__PURE__ */ l.jsx(ku, {
    ...i.getStyles("body", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
is.classes = tn;
is.displayName = "@mantine/core/ModalBody";
const cs = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ModalCloseButton", null, e), i = vo();
  return /* @__PURE__ */ l.jsx(Eu, {
    ...i.getStyles("close", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
cs.classes = tn;
cs.displayName = "@mantine/core/ModalCloseButton";
const ls = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, children: a, __hidden: i, ...c } = Z("ModalContent", null, e), u = vo(), f = u.scrollAreaComponent || kg;
  return /* @__PURE__ */ l.jsx(Ru, {
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
    ...c,
    children: /* @__PURE__ */ l.jsx(f, {
      style: { maxHeight: u.fullScreen ? "100dvh" : `calc(100dvh - (${Pe(u.yOffset)} * 2))` },
      children: a
    })
  });
});
ls.classes = tn;
ls.displayName = "@mantine/core/ModalContent";
const us = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ModalHeader", null, e), i = vo();
  return /* @__PURE__ */ l.jsx(Nu, {
    ...i.getStyles("header", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
us.classes = tn;
us.displayName = "@mantine/core/ModalHeader";
const ds = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ModalOverlay", null, e), i = vo();
  return /* @__PURE__ */ l.jsx(Tu, {
    ...i.getStyles("overlay", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
ds.classes = tn;
ds.displayName = "@mantine/core/ModalOverlay";
const yv = {
  __staticSelector: "Modal",
  closeOnClickOutside: !0,
  withinPortal: !0,
  lockScroll: !0,
  trapFocus: !0,
  returnFocus: !0,
  closeOnEscape: !0,
  keepMounted: !1,
  zIndex: uo("modal"),
  transitionProps: {
    duration: 200,
    transition: "fade-down"
  },
  yOffset: "5dvh"
}, yd = Oe((e, { radius: t, size: n, yOffset: o, xOffset: r }) => ({ root: {
  "--modal-radius": t === void 0 ? void 0 : kt(t),
  "--modal-size": $e(n, "modal-size"),
  "--modal-y-offset": Pe(o),
  "--modal-x-offset": Pe(r)
} })), Zo = se((e) => {
  const t = Z("ModalRoot", yv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, yOffset: c, scrollAreaComponent: u, radius: f, fullScreen: p, centered: m, xOffset: h, __staticSelector: g, attributes: v, ...x } = t, w = Me({
    name: g,
    classes: tn,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: v,
    vars: i,
    varsResolver: yd
  });
  return /* @__PURE__ */ l.jsx(vv, {
    value: {
      yOffset: c,
      scrollAreaComponent: u,
      getStyles: w,
      fullScreen: p
    },
    children: /* @__PURE__ */ l.jsx(ju, {
      ...w("root"),
      "data-full-screen": p || void 0,
      "data-centered": m || void 0,
      "data-offset-scrollbars": u === bn.Autosize || void 0,
      unstyled: a,
      ...x
    })
  });
});
Zo.classes = tn;
Zo.varsResolver = yd;
Zo.displayName = "@mantine/core/ModalRoot";
const bd = d.createContext(null);
function xd({ children: e }) {
  const [t, n] = d.useState([]), [o, r] = d.useState(uo("modal")), [s] = d.useState(() => /* @__PURE__ */ new WeakSet());
  return /* @__PURE__ */ l.jsx(bd, {
    value: {
      stack: t,
      addModal: (a, i) => {
        n((c) => [.../* @__PURE__ */ new Set([...c, a])]), r((c) => typeof i == "number" && typeof c == "number" ? Math.max(c, i) : c);
      },
      removeModal: (a) => n((i) => i.filter((c) => c !== a)),
      getZIndex: (a) => `calc(${o} + ${t.indexOf(a)} + 1)`,
      currentId: t[t.length - 1],
      maxZIndex: o,
      handledEscapeEvents: s
    },
    children: e
  });
}
xd.displayName = "@mantine/core/ModalStack";
const fs = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ModalTitle", null, e), i = vo();
  return /* @__PURE__ */ l.jsx(Pu, {
    ...i.getStyles("title", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
fs.classes = tn;
fs.displayName = "@mantine/core/ModalTitle";
const bv = {
  closeOnClickOutside: !0,
  withinPortal: !0,
  lockScroll: !0,
  trapFocus: !0,
  returnFocus: !0,
  closeOnEscape: !0,
  keepMounted: !1,
  zIndex: uo("modal"),
  transitionProps: {
    duration: 200,
    transition: "fade-down"
  },
  withOverlay: !0,
  withCloseButton: !0
}, lt = se((e) => {
  const { title: t, withOverlay: n, overlayProps: o, withCloseButton: r, closeButtonProps: s, children: a, radius: i, opened: c, stackId: u, zIndex: f, ...p } = Z("Modal", bv, e), m = d.use(bd), h = !!t || r, g = m && u ? {
    closeOnEscape: m.currentId === u,
    trapFocus: m.currentId === u,
    zIndex: m.getZIndex(u),
    __handledEscapeEvents: m.handledEscapeEvents
  } : {}, v = n === !1 ? !1 : u && m ? m.currentId === u : c;
  return d.useEffect(() => {
    m && u && (c ? m.addModal(u, f || uo("modal")) : m.removeModal(u));
  }, [
    c,
    u,
    f
  ]), /* @__PURE__ */ l.jsxs(Zo, {
    radius: i,
    opened: c,
    zIndex: m && u ? m.getZIndex(u) : f,
    ...p,
    ...g,
    children: [n && /* @__PURE__ */ l.jsx(ds, {
      visible: v,
      transitionProps: m && u ? { duration: 0 } : void 0,
      ...o
    }), /* @__PURE__ */ l.jsxs(ls, {
      radius: i,
      __hidden: m && u && c ? u !== m.currentId : !1,
      children: [h && /* @__PURE__ */ l.jsxs(us, { children: [t && /* @__PURE__ */ l.jsx(fs, { children: t }), r && /* @__PURE__ */ l.jsx(cs, { ...s })] }), /* @__PURE__ */ l.jsx(is, { children: a })]
    })]
  });
});
lt.classes = tn;
lt.displayName = "@mantine/core/Modal";
lt.Root = Zo;
lt.Overlay = ds;
lt.Content = ls;
lt.Body = is;
lt.Header = us;
lt.Title = fs;
lt.CloseButton = cs;
lt.Stack = xd;
function xv(e, t) {
  const n = t.trim().toLowerCase();
  if (n === "") return;
  const o = Object.values(e).filter((r) => !r.disabled && r.label.trim().toLowerCase() === n);
  return o.length === 1 ? o[0] : void 0;
}
function wv(e) {
  return "group" in e;
}
function ui({ data: e }) {
  if (wv(e)) {
    const r = e.items.map((s) => /* @__PURE__ */ l.jsx(ui, { data: s }, s.value));
    return /* @__PURE__ */ l.jsx("optgroup", {
      label: e.group,
      children: r
    });
  }
  const { value: t, label: n, ...o } = e;
  return /* @__PURE__ */ l.jsx("option", {
    value: e.value,
    ...o,
    children: e.label
  });
}
ui.displayName = "@mantine/core/NativeSelectOption";
const Sv = {
  size: "sm",
  rightSectionPointerEvents: "none"
}, oo = se((e) => {
  const { data: t, children: n, size: o, error: r, rightSection: s, unstyled: a, ...i } = Z([
    "Input",
    "InputWrapper",
    "NativeSelect"
  ], Sv, e), c = Lu(t).map((u, f) => /* @__PURE__ */ l.jsx(ui, { data: u }, f));
  return /* @__PURE__ */ l.jsx(yt, {
    component: "select",
    ...i,
    __staticSelector: "NativeSelect",
    size: o,
    pointer: !0,
    error: r,
    unstyled: a,
    rightSection: s || /* @__PURE__ */ l.jsx(Go, {
      size: o,
      error: r,
      unstyled: a
    }),
    children: n || c
  });
});
oo.classes = yt.classes;
oo.displayName = "@mantine/core/NativeSelect";
function wd(e, t) {
  var n = {};
  for (var o in e)
    Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var r = 0, o = Object.getOwnPropertySymbols(e); r < o.length; r++)
      t.indexOf(o[r]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[r]) && (n[o[r]] = e[o[r]]);
  return n;
}
var ro;
(function(e) {
  e.event = "event", e.props = "prop";
})(ro || (ro = {}));
function an() {
}
function Cv(e) {
  var t, n = void 0;
  return function() {
    for (var o = [], r = arguments.length; r--; ) o[r] = arguments[r];
    return t && o.length === t.length && o.every(function(s, a) {
      return s === t[a];
    }) || (t = o, n = e.apply(void 0, o)), n;
  };
}
function Oo(e) {
  return !!(e || "").match(/\d/);
}
function ln(e) {
  return e == null;
}
function jv(e) {
  return typeof e == "number" && isNaN(e);
}
function Sd(e) {
  return ln(e) || jv(e) || typeof e == "number" && !isFinite(e);
}
function Cd(e) {
  return e.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
}
function kv(e) {
  switch (e) {
    case "lakh":
      return /(\d+?)(?=(\d\d)+(\d)(?!\d))(\.\d+)?/g;
    case "wan":
      return /(\d)(?=(\d{4})+(?!\d))/g;
    default:
      return /(\d)(?=(\d{3})+(?!\d))/g;
  }
}
function Ev(e, t, n) {
  var o = kv(n), r = e.search(/[1-9]/);
  return r = r === -1 ? e.length : r, e.substring(0, r) + e.substring(r, e.length).replace(o, "$1" + t);
}
function kc(e) {
  var t = d.useRef(e);
  t.current = e;
  var n = d.useRef(function() {
    for (var o = [], r = arguments.length; r--; ) o[r] = arguments[r];
    return t.current.apply(t, o);
  });
  return n.current;
}
function di(e, t) {
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
function Rv(e) {
  if (!e)
    return e;
  var t = e[0] === "-";
  t && (e = e.substring(1, e.length));
  var n = e.split("."), o = n[0].replace(/^0+/, "") || "0", r = n[1] || "";
  return (t ? "-" : "") + o + (r ? "." + r : "");
}
function jd(e, t, n) {
  for (var o = "", r = n ? "0" : "", s = 0; s <= t - 1; s++)
    o += e[s] || r;
  return o;
}
function Ec(e, t) {
  return Array(t + 1).join(e);
}
function kd(e) {
  var t = e + "", n = t[0] === "-" ? "-" : "";
  n && (t = t.substring(1));
  var o = t.split(/[eE]/g), r = o[0], s = o[1];
  if (s = Number(s), !s)
    return n + r;
  r = r.replace(".", "");
  var a = 1 + s, i = r.length;
  return a < 0 ? r = "0." + Ec("0", Math.abs(a)) + r : a >= i ? r = r + Ec("0", a - i) : r = (r.substring(0, a) || "0") + "." + r.substring(a), n + r;
}
function Rc(e, t, n) {
  if (["", "-"].indexOf(e) !== -1)
    return e;
  var o = (e.indexOf(".") !== -1 || n) && t, r = di(e), s = r.beforeDecimal, a = r.afterDecimal, i = r.hasNegation, c = parseFloat("0." + (a || "0")), u = a.length <= t ? "0." + a : c.toFixed(t), f = u.split("."), p = s;
  s && Number(f[0]) && (p = s.split("").reverse().reduce(function(v, x, w) {
    return v.length > w ? (Number(v[0]) + Number(x)).toString() + v.substring(1, v.length) : x + v;
  }, f[0]));
  var m = jd(f[1] || "", t, n), h = i ? "-" : "", g = o ? "." : "";
  return "" + h + p + g + m;
}
function Cn(e, t) {
  if (e.value = e.value, e !== null) {
    if (e.createTextRange) {
      var n = e.createTextRange();
      return n.move("character", t), n.select(), !0;
    }
    return e.selectionStart || e.selectionStart === 0 ? (e.focus(), e.setSelectionRange(t, t), !0) : (e.focus(), !1);
  }
}
var Ed = Cv(function(e, t) {
  for (var n = 0, o = 0, r = e.length, s = t.length; e[n] === t[n] && n < r; )
    n++;
  for (; e[r - 1 - o] === t[s - 1 - o] && s - o > n && r - o > n; )
    o++;
  return {
    from: { start: n, end: r - o },
    to: { start: n, end: s - o }
  };
}), Nv = function(e, t) {
  var n = Math.min(e.selectionStart, t);
  return {
    from: { start: n, end: e.selectionEnd },
    to: { start: n, end: t }
  };
};
function Tv(e, t, n) {
  return Math.min(Math.max(e, t), n);
}
function Is(e) {
  return Math.max(e.selectionStart, e.selectionEnd);
}
function Pv() {
  return typeof navigator < "u" && !(navigator.platform && /iPhone|iPod/.test(navigator.platform));
}
function Av(e) {
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
function Mv(e) {
  var t = e.currentValue, n = e.formattedValue, o = e.currentValueIndex, r = e.formattedValueIndex;
  return t[o] === n[r];
}
function Iv(e, t, n, o, r, s, a) {
  a === void 0 && (a = Mv);
  var i = r.findIndex(function(j) {
    return j;
  }), c = e.slice(0, i);
  !t && !n.startsWith(c) && (t = c, n = c + n, o = o + c.length);
  for (var u = n.length, f = e.length, p = {}, m = new Array(u), h = 0; h < u; h++) {
    m[h] = -1;
    for (var g = 0, v = f; g < v; g++) {
      var x = a({
        currentValue: n,
        lastValue: t,
        formattedValue: e,
        currentValueIndex: h,
        formattedValueIndex: g
      });
      if (x && p[g] !== !0) {
        m[h] = g, p[g] = !0;
        break;
      }
    }
  }
  for (var w = o; w < u && (m[w] === -1 || !s(n[w])); )
    w++;
  var k = w === u || m[w] === -1 ? f : m[w];
  for (w = o - 1; w > 0 && m[w] === -1; )
    w--;
  var C = w === -1 || m[w] === -1 ? 0 : m[w] + 1;
  return C > k ? k : o - C < k - o ? C : k;
}
function Nc(e, t, n, o) {
  var r = e.length;
  if (t = Tv(t, 0, r), o === "left") {
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
function Dv(e) {
  for (var t = Array.from({ length: e.length + 1 }).map(function() {
    return !0;
  }), n = 0, o = t.length; n < o; n++)
    t[n] = !!(Oo(e[n]) || Oo(e[n - 1]));
  return t;
}
function Rd(e, t, n, o, r, s) {
  s === void 0 && (s = an);
  var a = kc(function(g, v) {
    var x, w;
    return Sd(g) ? (w = "", x = "") : typeof g == "number" || v ? (w = typeof g == "number" ? kd(g) : g, x = o(w)) : (w = r(g, void 0), x = o(w)), { formattedValue: x, numAsString: w };
  }), i = d.useState(function() {
    return a(ln(e) ? t : e, n);
  }), c = i[0], u = i[1], f = kc(function(g, v) {
    g.formattedValue !== c.formattedValue && u({
      formattedValue: g.formattedValue,
      numAsString: g.value
    }), s(g, v);
  }), p = e, m = n;
  ln(e) && (p = c.numAsString, m = !0);
  var h = a(p, m);
  return d.useMemo(function() {
    u(h);
  }, [h.formattedValue]), d.useEffect(function() {
    if (!ln(t) && ln(e) && c.formattedValue !== "") {
      var g = parseFloat(c.numAsString);
      f({
        formattedValue: c.formattedValue,
        value: c.numAsString,
        floatValue: isNaN(g) ? void 0 : g
      }, { event: void 0, source: ro.props });
    }
  }, []), [c, f];
}
function Ov(e) {
  return e.replace(/[^0-9]/g, "");
}
function $v(e) {
  return e;
}
function Lv(e) {
  var t = e.type;
  t === void 0 && (t = "text");
  var n = e.displayType;
  n === void 0 && (n = "input");
  var o = e.customInput, r = e.renderText, s = e.getInputRef, a = e.format;
  a === void 0 && (a = $v);
  var i = e.removeFormatting;
  i === void 0 && (i = Ov);
  var c = e.defaultValue, u = e.valueIsNumericString, f = e.onValueChange, p = e.isAllowed, m = e.onChange;
  m === void 0 && (m = an);
  var h = e.onKeyDown;
  h === void 0 && (h = an);
  var g = e.onMouseUp;
  g === void 0 && (g = an);
  var v = e.onFocus;
  v === void 0 && (v = an);
  var x = e.onBlur;
  x === void 0 && (x = an);
  var w = e.value, k = e.getCaretBoundary;
  k === void 0 && (k = Dv);
  var C = e.isValidInputCharacter;
  C === void 0 && (C = Oo);
  var j = e.isCharacterSame, N = wd(e, ["type", "displayType", "customInput", "renderText", "getInputRef", "format", "removeFormatting", "defaultValue", "valueIsNumericString", "onValueChange", "isAllowed", "onChange", "onKeyDown", "onMouseUp", "onFocus", "onBlur", "value", "getCaretBoundary", "isValidInputCharacter", "isCharacterSame"]), T = Rd(w, c, !!u, a, i, f), S = T[0], y = S.formattedValue, R = S.numAsString, D = T[1], O = d.useRef(), z = d.useRef({ formattedValue: y, numAsString: R }), _ = function(V, X) {
    z.current = { formattedValue: V.formattedValue, numAsString: V.value }, D(V, X);
  }, F = d.useState(!1), $ = F[0], I = F[1], L = d.useRef(null), M = d.useRef({
    setCaretTimeout: null,
    focusTimeout: null
  });
  d.useEffect(function() {
    return I(!0), function() {
      clearTimeout(M.current.setCaretTimeout), clearTimeout(M.current.focusTimeout);
    };
  }, []);
  var P = a, B = function(V, X) {
    var le = parseFloat(X);
    return {
      formattedValue: V,
      value: X,
      floatValue: isNaN(le) ? void 0 : le
    };
  }, W = function(V, X, le) {
    V.selectionStart === 0 && V.selectionEnd === V.value.length || (Cn(V, X), M.current.setCaretTimeout = setTimeout(function() {
      V.value === le && V.selectionStart !== X && Cn(V, X);
    }, 0));
  }, U = function(V, X, le) {
    return Nc(V, X, k(V), le);
  }, Y = function(V, X, le) {
    var Ce = k(X), Ae = Iv(X, y, V, le, Ce, C, j);
    return Ae = Nc(X, Ae, Ce), Ae;
  }, ae = function(V) {
    var X = V.formattedValue;
    X === void 0 && (X = "");
    var le = V.input, Ce = V.source, Ae = V.event, he = V.numAsString, ge;
    if (le) {
      var xe = V.inputValue || le.value, Ie = Is(le);
      le.value = X, ge = Y(xe, X, Ie), ge !== void 0 && W(le, ge, X);
    }
    X !== y && _(B(X, he), { event: Ae, source: Ce });
  };
  d.useEffect(function() {
    var V = z.current, X = V.formattedValue, le = V.numAsString;
    (y !== X || R !== le) && _(B(y, R), {
      event: void 0,
      source: ro.props
    });
  }, [y, R]);
  var fe = L.current ? Is(L.current) : void 0, ie = typeof window < "u" ? d.useLayoutEffect : d.useEffect;
  ie(function() {
    var V = L.current;
    if (y !== z.current.formattedValue && V) {
      var X = Y(z.current.formattedValue, y, fe);
      V.value = y, W(V, X, y);
    }
  }, [y]);
  var te = function(V, X, le) {
    var Ce = X.target, Ae = O.current ? Nv(O.current, Ce.selectionEnd) : Ed(y, V), he = Object.assign(Object.assign({}, Ae), { lastValue: y }), ge = i(V, he), xe = P(ge);
    if (ge = i(xe, void 0), p && !p(B(xe, ge))) {
      var Ie = X.target, de = Is(Ie), mt = Y(V, y, de);
      return Ie.value = y, W(Ie, mt, y), !1;
    }
    return ae({
      formattedValue: xe,
      numAsString: ge,
      inputValue: V,
      event: X,
      source: le,
      input: X.target
    }), !0;
  }, me = function(V, X) {
    X === void 0 && (X = 0);
    var le = V.selectionStart, Ce = V.selectionEnd;
    O.current = { selectionStart: le, selectionEnd: Ce + X };
  }, q = function(V) {
    var X = V.target, le = X.value, Ce = te(le, V, ro.event);
    Ce && m(V), O.current = void 0;
  }, K = function(V) {
    var X = V.target, le = V.key, Ce = X.selectionStart, Ae = X.selectionEnd, he = X.value;
    he === void 0 && (he = "");
    var ge;
    le === "ArrowLeft" || le === "Backspace" ? ge = Math.max(Ce - 1, 0) : le === "ArrowRight" ? ge = Math.min(Ce + 1, he.length) : le === "Delete" && (ge = Ce);
    var xe = 0;
    le === "Delete" && Ce === Ae && (xe = 1);
    var Ie = le === "ArrowLeft" || le === "ArrowRight";
    if (ge === void 0 || Ce !== Ae && !Ie) {
      h(V), me(X, xe);
      return;
    }
    var de = ge;
    if (Ie) {
      var mt = le === "ArrowLeft" ? "left" : "right";
      de = U(he, ge, mt), de !== ge && V.preventDefault();
    } else le === "Delete" && !C(he[ge]) ? de = U(he, ge, "right") : le === "Backspace" && !C(he[ge]) && (de = U(he, ge, "left"));
    de !== ge && W(X, de, he), h(V), me(X, xe);
  }, ce = function(V) {
    var X = V.target, le = function() {
      var Ce = X.selectionStart, Ae = X.selectionEnd, he = X.value;
      if (he === void 0 && (he = ""), Ce === Ae) {
        var ge = U(he, Ce);
        ge !== Ce && W(X, ge, he);
      }
    };
    le(), requestAnimationFrame(function() {
      le();
    }), g(V), me(X);
  }, be = function(V) {
    V.persist && V.persist();
    var X = V.target, le = V.currentTarget;
    L.current = X, M.current.focusTimeout = setTimeout(function() {
      var Ce = X.selectionStart, Ae = X.selectionEnd, he = X.value;
      he === void 0 && (he = "");
      var ge = U(he, Ce);
      ge !== Ce && !(Ce === 0 && Ae === he.length) && W(X, ge, he), v(Object.assign(Object.assign({}, V), { currentTarget: le }));
    }, 0);
  }, pe = function(V) {
    L.current = null, clearTimeout(M.current.focusTimeout), clearTimeout(M.current.setCaretTimeout), x(V);
  }, Se = $ && Pv() ? "numeric" : void 0, ne = Object.assign({ inputMode: Se }, N, {
    type: t,
    value: y,
    onChange: q,
    onKeyDown: K,
    onMouseUp: ce,
    onFocus: be,
    onBlur: pe
  });
  if (n === "text")
    return r ? sn.createElement(sn.Fragment, null, r(y, N) || null) : sn.createElement("span", Object.assign({}, N, { ref: s }), y);
  if (o) {
    var H = o;
    return sn.createElement(H, Object.assign({}, ne, { ref: s }));
  }
  return sn.createElement("input", Object.assign({}, ne, { ref: s }));
}
function Tc(e, t) {
  var n = t.decimalScale, o = t.fixedDecimalScale, r = t.prefix;
  r === void 0 && (r = "");
  var s = t.suffix;
  s === void 0 && (s = "");
  var a = t.allowNegative, i = t.thousandsGroupStyle;
  if (i === void 0 && (i = "thousand"), e === "" || e === "-")
    return e;
  var c = ps(t), u = c.thousandSeparator, f = c.decimalSeparator, p = n !== 0 && e.indexOf(".") !== -1 || n && o, m = di(e, a), h = m.beforeDecimal, g = m.afterDecimal, v = m.addNegation;
  return n !== void 0 && (g = jd(g, n, !!o)), u && (h = Ev(h, u, i)), r && (h = r + h), s && (g = g + s), v && (h = "-" + h), e = h + (p && f || "") + g, e;
}
function ps(e) {
  var t = e.decimalSeparator;
  t === void 0 && (t = ".");
  var n = e.thousandSeparator, o = e.allowedDecimalSeparators;
  return n === !0 && (n = ","), o || (o = [t, "."]), {
    decimalSeparator: t,
    thousandSeparator: n,
    allowedDecimalSeparators: o
  };
}
function _v(e, t) {
  e === void 0 && (e = "");
  var n = new RegExp("(-)"), o = new RegExp("(-)(.)*(-)"), r = n.test(e), s = o.test(e);
  return e = e.replace(/-/g, ""), r && !s && t && (e = "-" + e), e;
}
function zv(e, t) {
  return new RegExp("(^-)|[0-9]|" + Cd(e), "g");
}
function Fv(e, t, n) {
  return e === "" ? !0 : !t?.match(/\d/) && !n?.match(/\d/) && typeof e == "string" && !isNaN(Number(e));
}
function Bv(e, t, n) {
  var o;
  t === void 0 && (t = Av(e));
  var r = n.allowNegative, s = n.prefix;
  s === void 0 && (s = "");
  var a = n.suffix;
  a === void 0 && (a = "");
  var i = n.decimalScale, c = t.from, u = t.to, f = u.start, p = u.end, m = ps(n), h = m.allowedDecimalSeparators, g = m.decimalSeparator, v = e[p] === g;
  if (Oo(e) && (e === s || e === a) && t.lastValue === "")
    return e;
  if (p - f === 1 && h.indexOf(e[f]) !== -1) {
    var x = i === 0 ? "" : g;
    e = e.substring(0, f) + x + e.substring(f + 1, e.length);
  }
  var w = function(L, M, P) {
    var B = !1, W = !1;
    s.startsWith("-") ? B = !1 : L.startsWith("--") ? (B = !1, W = !0) : a.startsWith("-") && L.length === a.length ? B = !1 : L[0] === "-" && (B = !0);
    var U = B ? 1 : 0;
    return W && (U = 2), U && (L = L.substring(U), M -= U, P -= U), { value: L, start: M, end: P, hasNegation: B };
  }, k = w(e, f, p), C = k.hasNegation;
  o = k, e = o.value, f = o.start, p = o.end;
  var j = w(t.lastValue, c.start, c.end), N = j.start, T = j.end, S = j.value, y = e.substring(f, p);
  e.length && S.length && (N > S.length - a.length || T < s.length) && !(y && a.startsWith(y)) && (e = S);
  var R = 0;
  e.startsWith(s) ? R += s.length : f < s.length && (R = f), e = e.substring(R), p -= R;
  var D = e.length, O = e.length - a.length;
  e.endsWith(a) ? D = O : (p > O || p > e.length - a.length) && (D = p), e = e.substring(0, D), e = _v(C ? "-" + e : e, r), e = (e.match(zv(g)) || []).join("");
  var z = e.indexOf(g);
  e = e.replace(new RegExp(Cd(g), "g"), function(L, M) {
    return M === z ? "." : "";
  });
  var _ = di(e, r), F = _.beforeDecimal, $ = _.afterDecimal, I = _.addNegation;
  return u.end - u.start < c.end - c.start && F === "" && v && !parseFloat($) && (e = I ? "-" : ""), e;
}
function Vv(e, t) {
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
function Hv(e) {
  var t = ps(e), n = t.thousandSeparator, o = t.decimalSeparator, r = e.prefix;
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
function Wv(e) {
  e = Hv(e), e.decimalSeparator, e.allowedDecimalSeparators, e.thousandsGroupStyle;
  var t = e.suffix, n = e.allowNegative, o = e.allowLeadingZeros, r = e.onKeyDown;
  r === void 0 && (r = an);
  var s = e.onBlur;
  s === void 0 && (s = an);
  var a = e.thousandSeparator, i = e.decimalScale, c = e.fixedDecimalScale, u = e.prefix;
  u === void 0 && (u = "");
  var f = e.defaultValue, p = e.value, m = e.valueIsNumericString, h = e.onValueChange, g = wd(e, ["decimalSeparator", "allowedDecimalSeparators", "thousandsGroupStyle", "suffix", "allowNegative", "allowLeadingZeros", "onKeyDown", "onBlur", "thousandSeparator", "decimalScale", "fixedDecimalScale", "prefix", "defaultValue", "value", "valueIsNumericString", "onValueChange"]), v = ps(e), x = v.decimalSeparator, w = v.allowedDecimalSeparators, k = function(I) {
    return Tc(I, e);
  }, C = function(I, L) {
    return Bv(I, L, e);
  }, j = ln(p) ? f : p, N = m ?? Fv(j, u, t);
  ln(p) ? ln(f) || (N = N || typeof f == "number") : N = N || typeof p == "number";
  var T = function(I) {
    return Sd(I) ? I : (typeof I == "number" && (I = kd(I)), N && typeof i == "number" ? Rc(I, i, !!c) : I);
  }, S = Rd(T(p), T(f), !!N, k, C, h), y = S[0], R = y.numAsString, D = y.formattedValue, O = S[1], z = function(I) {
    var L = I.target, M = I.key, P = L.selectionStart, B = L.selectionEnd, W = L.value;
    if (W === void 0 && (W = ""), (M === "Backspace" || M === "Delete") && B < u.length && W !== "-") {
      I.preventDefault();
      return;
    }
    if (P !== B) {
      r(I);
      return;
    }
    M === "Backspace" && W[0] === "-" && P === u.length + 1 && n && Cn(L, 1), i && c && (M === "Backspace" && W[P - 1] === x ? (Cn(L, P - 1), I.preventDefault()) : M === "Delete" && W[P] === x && I.preventDefault()), w?.includes(M) && W[P] === x && Cn(L, P + 1);
    var U = a === !0 ? "," : a;
    M === "Backspace" && W[P - 1] === U && Cn(L, P - 1), M === "Delete" && W[P] === U && Cn(L, P + 1), r(I);
  }, _ = function(I) {
    var L = R;
    if (L.match(/\d/g) || (L = ""), o || (L = Rv(L)), c && i && (L = Rc(L, i, c)), L !== R) {
      var M = Tc(L, e);
      O({
        formattedValue: M,
        value: L,
        floatValue: parseFloat(L)
      }, {
        event: I,
        source: ro.event
      });
    }
    s(I);
  }, F = function(I) {
    return I === x ? !0 : Oo(I);
  }, $ = function(I) {
    var L = I.currentValue, M = I.lastValue, P = I.formattedValue, B = I.currentValueIndex, W = I.formattedValueIndex, U = L[B], Y = P[W], ae = Ed(M, L), fe = ae.to, ie = function(te) {
      return C(te).indexOf(".") + u.length;
    };
    return p === 0 && c && i && L[fe.start] === x && ie(L) < B && ie(P) > W ? !1 : B >= fe.start && B < fe.end && w && w.includes(U) && Y === x ? !0 : U === Y;
  };
  return Object.assign(Object.assign({}, g), {
    value: D,
    valueIsNumericString: !1,
    isValidInputCharacter: F,
    isCharacterSame: $,
    onValueChange: O,
    format: k,
    removeFormatting: C,
    getCaretBoundary: function(I) {
      return Vv(I, e);
    },
    onKeyDown: z,
    onBlur: _
  });
}
function Uv(e) {
  var t = Wv(e);
  return sn.createElement(Lv, Object.assign({}, t));
}
function Pc(e, t) {
  return /\d/.test(e) || e === t;
}
function qv(e, t, n, o) {
  let r = 0;
  for (let s = 0; s < t && s < e.length; s += 1) Pc(e[s], o) && (r += 1);
  if (r === 0) return Math.min(t, n.length);
  for (let s = 0; s < n.length; s += 1) if (Pc(n[s], o) && (r -= 1, r === 0))
    return s + 1;
  return n.length;
}
function Kv(e, t) {
  let n = 0;
  for (; t + n < e.length && /\d/.test(e[t + n]); ) n += 1;
  return n;
}
function Xv(e, { decimalSeparator: t, thousandSeparator: n, allowedDecimalSeparators: o, thousandsGroupStyle: r }) {
  const s = new Set([...o, t].filter((h) => h.length === 1)), a = e.split(""), i = a.reduce((h, g, v) => (s.has(g) && h.push(v), h), []);
  if (i.length === 0) return e;
  const c = i[i.length - 1], u = a[c], f = i.filter((h) => a[h] === u).length, p = r === "wan" ? 4 : 3;
  let m = -1;
  return f === 1 && (u === t ? m = c : u === n ? m = Kv(e, c + 1) === p ? -1 : c : m = c), a.map((h, g) => g === m ? t : s.has(h) && h !== n ? "" : h).join("");
}
function Ac({ direction: e, style: t, ...n }) {
  return /* @__PURE__ */ l.jsx("svg", {
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
    children: /* @__PURE__ */ l.jsx("path", {
      d: "M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z",
      fill: "currentColor",
      fillRule: "evenodd",
      clipRule: "evenodd"
    })
  });
}
var na = {
  root: "m_e2f5cd4e",
  controls: "m_95e17d22",
  control: "m_80b4b171"
};
const Yv = /^(0\.0*|-0(\.0*)?)$/, Mc = /^-?0\d+(\.\d+)?\.?$/, Gv = /\.\d*0$/, Nd = /^-?\d+\.$/;
function oa(e) {
  return typeof e == "string" && e !== "" && !Number.isNaN(Number(e));
}
function Ds(e) {
  return typeof e == "bigint";
}
function Os(e) {
  return typeof e == "number" ? e < Number.MAX_SAFE_INTEGER : e === "" || oa(e) && Number(e) < Number.MAX_SAFE_INTEGER;
}
function Td(e, t) {
  return e === "" || e === "-" || !t && e.startsWith("-") ? !1 : /^-?\d+$/.test(e);
}
function $s(e, t) {
  return typeof e == "bigint" ? !0 : e === "" || Td(e, t);
}
function jo(e) {
  if (!/^-?\d+$/.test(e)) return null;
  try {
    return BigInt(e);
  } catch {
    return null;
  }
}
function hr(e) {
  if (typeof e == "bigint") return e;
  if (typeof e == "number" && Number.isFinite(e) && Number.isInteger(e)) return BigInt(e);
}
function Cr(e, t, n) {
  return t !== void 0 && e < t ? t : n !== void 0 && e > n ? n : e;
}
function Jv(e) {
  return e.toString().replace(".", "").length;
}
function Zv(e, t) {
  return (typeof e == "number" ? e < Number.MAX_SAFE_INTEGER : !Number.isNaN(Number(e))) && !Number.isNaN(e) && Jv(t) < 14 && t !== "";
}
function Qv(e, t, n) {
  return e === void 0 ? !0 : (t === void 0 || e >= t) && (n === void 0 || e <= n);
}
const Ls = {
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
}, Pd = Oe((e, { size: t }) => ({ controls: { "--ni-chevron-size": $e(t, "ni-chevron-size") } }));
function Ic(e, t) {
  return t ? `${e}.` : e;
}
function ey(e, t) {
  const n = Nd.test(e), o = t.trim ? e.replace(/^0+(?=\d)/, "") : e, r = parseFloat(o);
  if (Number.isNaN(r)) return o;
  if (!t.clamp) return t.trim ? Ic(r, n) : e;
  const s = r > Number.MAX_SAFE_INTEGER && t.max !== void 0 ? t.max : dn(r, t.min, t.max);
  return !t.trim && s === r ? e : Ic(s, n);
}
function ty(e, t) {
  if (e === "" || e === "-") return e;
  const n = jo(e);
  return n === null ? e : t.clampBehavior === "blur" ? Cr(n, t.min, t.max) : n;
}
const $o = vn((e) => {
  const t = Z([
    "Input",
    "InputWrapper",
    "NumberInput"
  ], Ls, e), { className: n, classNames: o, styles: r, unstyled: s, vars: a, onChange: i, onValueChange: c, value: u, defaultValue: f, max: p, min: m, step: h, hideControls: g, rightSection: v, isAllowed: x, clampBehavior: w, onBlur: k, allowDecimal: C, decimalScale: j, onKeyDown: N, onKeyDownCapture: T, handlersRef: S, startValue: y, disabled: R, rightSectionPointerEvents: D, allowNegative: O, readOnly: z, size: _, rightSectionWidth: F, stepHoldInterval: $, stepHoldDelay: I, allowLeadingZeros: L, withKeyboardEvents: M, trimLeadingZeroesOnBlur: P, allowedDecimalSeparators: B, selectAllOnFocus: W, onMinReached: U, onMaxReached: Y, onFocus: ae, attributes: fe, ref: ie, ...te } = t, me = O ?? !0, q = L ?? !0, K = Me({
    name: "NumberInput",
    classes: na,
    props: t,
    classNames: o,
    styles: r,
    unstyled: s,
    attributes: fe,
    vars: a,
    varsResolver: Pd
  }), { resolvedClassNames: ce, resolvedStyles: be } = qo({
    classNames: o,
    styles: r,
    props: t
  }), pe = d.useRef(Ds(u) || Ds(f) ? "bigint" : "number");
  Ds(u) ? pe.current = "bigint" : typeof u == "number" && (pe.current = "number");
  const Se = pe.current === "bigint", [ne, H] = Ye({
    value: u,
    defaultValue: f,
    finalValue: "",
    onChange: i
  }), V = I !== void 0 && $ !== void 0, X = d.useRef(null), le = d.useRef(null), Ce = d.useRef(0), Ae = typeof m == "number" ? m : void 0, he = typeof p == "number" ? p : void 0, ge = typeof h == "number" ? h : Ls.step, xe = typeof y == "number" ? y : Ls.startValue, Ie = hr(m), de = hr(p), mt = hr(h) ?? BigInt(1), Ne = hr(y) ?? BigInt(0), ht = (G) => !Td(G, me) || q && Mc.test(G) ? G : jo(G) ?? G, Mn = (G) => {
    const re = Number(G);
    return Number.isSafeInteger(re) ? re : void 0;
  }, Rt = (G, re) => {
    re.source === "event" && H(Se ? ht(G.value) : Zv(G.floatValue, G.value) && !Yv.test(G.value) && !(q && Mc.test(G.value)) && !Gv.test(G.value) && !Nd.test(G.value) ? G.floatValue : G.value), c?.(G, re);
  }, nn = (G) => {
    const re = String(G).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    return re ? Math.max(0, (re[1] ? re[1].length : 0) - (re[2] ? +re[2] : 0)) : 0;
  }, Nt = (G) => {
    X.current && typeof G < "u" && X.current.setSelectionRange(G, G);
  }, In = d.useRef(Tr);
  In.current = () => {
    if (Se) {
      if (!$s(ne, me)) return;
      let Ue;
      const qe = ne;
      if (typeof qe == "bigint") {
        const rt = qe + mt;
        de !== void 0 && rt > de && Y?.(), Ue = de !== void 0 && rt > de ? de : rt;
      } else if (typeof qe == "string" && qe !== "") {
        const rt = jo(qe);
        if (rt === null) return;
        const rn = rt + mt;
        de !== void 0 && rn > de && Y?.(), Ue = de !== void 0 && rn > de ? de : rn;
      } else Ue = Cr(Ne, Ie, de);
      const Xe = Ue.toString();
      H(Ue), c?.({
        floatValue: Mn(Ue),
        formattedValue: Xe,
        value: Xe
      }, { source: "increment" }), setTimeout(() => Nt(X.current?.value.length), 0);
      return;
    }
    if (!Os(ne)) return;
    let G;
    const re = nn(ne), On = nn(ge), $n = Math.max(re, On), gt = 10 ** $n;
    if (!oa(ne) && (typeof ne != "number" || Number.isNaN(ne))) G = dn(xe, Ae, he);
    else if (he !== void 0) {
      const Ue = (Math.round(Number(ne) * gt) + Math.round(ge * gt)) / gt;
      Ue > he && Y?.(), G = Ue <= he ? Ue : he;
    } else G = (Math.round(Number(ne) * gt) + Math.round(ge * gt)) / gt;
    const Ze = G.toFixed($n);
    H(parseFloat(Ze)), c?.({
      floatValue: parseFloat(Ze),
      formattedValue: Ze,
      value: Ze
    }, { source: "increment" }), setTimeout(() => Nt(X.current?.value.length), 0);
  };
  const Dn = d.useRef(Tr);
  Dn.current = () => {
    if (Se) {
      if (!$s(ne, me)) return;
      let qe;
      const Xe = Ie !== void 0 ? Ie : me ? void 0 : BigInt(0), rt = ne;
      if (typeof rt == "bigint") {
        const Ln = rt - mt;
        Xe !== void 0 && Ln < Xe && U?.(), qe = Xe !== void 0 && Ln < Xe ? Xe : Ln;
      } else if (typeof rt == "string" && rt !== "") {
        const Ln = jo(rt);
        if (Ln === null) return;
        const Cs = Ln - mt;
        Xe !== void 0 && Cs < Xe && U?.(), qe = Xe !== void 0 && Cs < Xe ? Xe : Cs;
      } else qe = Cr(Ne, Xe, de);
      const rn = qe.toString();
      H(qe), c?.({
        floatValue: Mn(qe),
        formattedValue: rn,
        value: rn
      }, { source: "decrement" }), setTimeout(() => Nt(X.current?.value.length), 0);
      return;
    }
    if (!Os(ne)) return;
    let G;
    const re = Ae !== void 0 ? Ae : me ? Number.MIN_SAFE_INTEGER : 0, On = nn(ne), $n = nn(ge), gt = Math.max(On, $n), Ze = 10 ** gt;
    if (!oa(ne) && typeof ne != "number" || Number.isNaN(ne)) G = dn(xe, re, he);
    else {
      const qe = (Math.round(Number(ne) * Ze) - Math.round(ge * Ze)) / Ze;
      re !== void 0 && qe < re && U?.(), G = re !== void 0 && qe < re ? re : qe;
    }
    const Ue = G.toFixed(gt);
    H(parseFloat(Ue)), c?.({
      floatValue: parseFloat(Ue),
      formattedValue: Ue,
      value: Ue
    }, { source: "decrement" }), setTimeout(() => Nt(X.current?.value.length), 0);
  };
  const Ge = (G) => {
    const re = G.clipboardData.getData("text"), On = te.decimalSeparator || ".", $n = te.thousandSeparator === !0 ? "," : te.thousandSeparator === !1 ? void 0 : te.thousandSeparator, gt = Xv(re, {
      decimalSeparator: On,
      thousandSeparator: $n,
      allowedDecimalSeparators: B || [".", ","],
      thousandsGroupStyle: te.thousandsGroupStyle
    });
    if (gt !== re) {
      G.preventDefault();
      const Ze = X.current;
      if (Ze) {
        const Ue = Ze.selectionStart ?? 0, qe = Ze.selectionEnd ?? 0, Xe = Ze.value, rt = Xe.substring(0, Ue) + gt + Xe.substring(qe);
        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set?.call(Ze, rt), Ze.dispatchEvent(new Event("change", { bubbles: !0 }));
        const rn = Ue + gt.length;
        setTimeout(() => Nt(qv(rt, rn, Ze.value, On)), 0);
      }
    }
    te.onPaste?.(G);
  }, Lt = (G) => {
    N?.(G), !(z || !M) && (G.key === "ArrowUp" && (G.preventDefault(), In.current?.()), G.key === "ArrowDown" && (G.preventDefault(), Dn.current?.()));
  }, lr = (G) => {
    if (T?.(G), G.key === "Backspace") {
      const re = X.current;
      re && re.selectionStart === 0 && re.selectionStart === re.selectionEnd && (G.preventDefault(), window.setTimeout(() => Nt(0), 0));
    }
  }, ur = (G) => {
    W && window.setTimeout(() => X.current?.select(), 0), ae?.(G);
  }, Ss = (G) => {
    let re = ne;
    Se ? (w === "blur" && typeof re == "bigint" && (re = Cr(re, Ie, de)), P && typeof re == "string" && (re = ty(re, {
      min: Ie,
      max: de,
      clampBehavior: w
    }))) : typeof re == "number" ? w === "blur" && (re = dn(re, Ae, he)) : typeof re == "string" && (re = ey(re, {
      min: Ae,
      max: he,
      trim: !!P && nn(re) < 15,
      clamp: w === "blur"
    })), ne !== re && H(re), k?.(G);
  };
  Sl(S, {
    increment: In.current,
    decrement: Dn.current
  });
  const dr = (G) => {
    G ? In.current?.() : Dn.current?.(), Ce.current += 1;
  }, Be = (G) => {
    if (dr(G), V) {
      const re = typeof $ == "number" ? $ : $(Ce.current);
      le.current = window.setTimeout(() => Be(G), re);
    }
  }, Je = (G, re) => {
    G.preventDefault(), X.current?.focus(), dr(re), V && (le.current = window.setTimeout(() => Be(re), I));
  }, on = () => {
    le.current && window.clearTimeout(le.current), le.current = null, Ce.current = 0;
  }, Bf = /* @__PURE__ */ l.jsxs("div", {
    ...K("controls"),
    children: [/* @__PURE__ */ l.jsx(eo, {
      ...K("control"),
      tabIndex: -1,
      "aria-hidden": !0,
      disabled: R || typeof ne == "number" && he !== void 0 && ne >= he || typeof ne == "bigint" && de !== void 0 && ne >= de,
      mod: { direction: "up" },
      onMouseDown: (G) => G.preventDefault(),
      onPointerDown: (G) => {
        Je(G, !0);
      },
      onPointerUp: on,
      onPointerLeave: on,
      children: /* @__PURE__ */ l.jsx(Ac, { direction: "up" })
    }), /* @__PURE__ */ l.jsx(eo, {
      ...K("control"),
      tabIndex: -1,
      "aria-hidden": !0,
      disabled: R || typeof ne == "number" && Ae !== void 0 && ne <= Ae || typeof ne == "bigint" && Ie !== void 0 && ne <= Ie,
      mod: { direction: "down" },
      onMouseDown: (G) => G.preventDefault(),
      onPointerDown: (G) => {
        Je(G, !1);
      },
      onPointerUp: on,
      onPointerLeave: on,
      children: /* @__PURE__ */ l.jsx(Ac, { direction: "down" })
    })]
  });
  return /* @__PURE__ */ l.jsx(yt, {
    component: Uv,
    allowNegative: O,
    className: Gt(na.root, n),
    size: _,
    ...te,
    inputMode: Se ? "numeric" : "decimal",
    readOnly: z,
    disabled: R,
    value: typeof ne == "bigint" ? ne.toString() : ne,
    getInputRef: ze(ie, X),
    onValueChange: Rt,
    rightSection: g || z || !(Se ? $s(ne, me) : Os(ne)) ? v : v || Bf,
    classNames: ce,
    styles: be,
    unstyled: s,
    __staticSelector: "NumberInput",
    decimalScale: Se ? 0 : C ? j : 0,
    onPaste: Ge,
    onFocus: ur,
    onKeyDown: Lt,
    onKeyDownCapture: lr,
    rightSectionPointerEvents: D ?? (R ? "none" : void 0),
    rightSectionWidth: F ?? `var(--ni-right-section-width-${_ || "sm"})`,
    allowLeadingZeros: L,
    allowedDecimalSeparators: B,
    onBlur: Ss,
    attributes: fe,
    isAllowed: (G) => {
      if (!(!x || x(G))) return !1;
      if (w !== "strict") return !0;
      if (!Se) return Qv(G.floatValue, Ae, he);
      if (G.value === "" || G.value === "-") return !0;
      const re = jo(G.value);
      return re === null ? !0 : (Ie === void 0 || re >= Ie) && (de === void 0 || re <= de);
    }
  });
});
$o.classes = {
  ...yt.classes,
  ...na
};
$o.varsResolver = Pd;
$o.displayName = "@mantine/core/NumberInput";
const fi = d.createContext(null), pi = vn(((e) => {
  const { value: t, defaultValue: n, onChange: o, size: r, wrapperProps: s, children: a, name: i, readOnly: c, disabled: u, ...f } = Z("RadioGroup", null, e), p = $t(i), [m, h] = Ye({
    value: t,
    defaultValue: n,
    finalValue: "",
    onChange: o
  }), g = (v) => !c && h(typeof v == "string" ? v : v.currentTarget.value);
  return /* @__PURE__ */ l.jsx(fi, {
    value: {
      value: m,
      onChange: g,
      size: r,
      name: p,
      disabled: u
    },
    children: /* @__PURE__ */ l.jsx(St.Wrapper, {
      size: r,
      ...s,
      ...f,
      labelElement: "div",
      __staticSelector: "RadioGroup",
      children: /* @__PURE__ */ l.jsx(qu, {
        role: "radiogroup",
        children: a
      })
    })
  });
}));
pi.classes = St.Wrapper.classes;
pi.displayName = "@mantine/core/RadioGroup";
var Ad = { card: "m_9dc8ae12" };
const Md = d.createContext(null), ny = { withBorder: !0 }, Id = Oe((e, { radius: t }) => ({ card: { "--card-radius": kt(t) } })), ms = se((e) => {
  const t = Z("RadioCard", ny, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, checked: c, mod: u, withBorder: f, value: p, onClick: m, name: h, onKeyDown: g, attributes: v, ...x } = t, w = Me({
    name: "RadioCard",
    classes: Ad,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: v,
    vars: i,
    varsResolver: Id,
    rootSelector: "card"
  }), { dir: k } = fo(), C = d.use(fi), j = typeof c == "boolean" ? c : C?.value === p || !1, N = h || C?.name, T = (S) => {
    if (g?.(S), !!N && [
      "ArrowDown",
      "ArrowUp",
      "ArrowLeft",
      "ArrowRight"
    ].includes(S.nativeEvent.code)) {
      S.preventDefault();
      const y = Array.from(document.querySelectorAll(`[role="radio"][name="${N}"]`)), R = y.findIndex((z) => z === S.target), D = R + 1 >= y.length ? 0 : R + 1, O = R - 1 < 0 ? y.length - 1 : R - 1;
      S.nativeEvent.code === "ArrowDown" && (y[D].focus(), y[D].click()), S.nativeEvent.code === "ArrowUp" && (y[O].focus(), y[O].click()), S.nativeEvent.code === "ArrowLeft" && (y[k === "ltr" ? O : D].focus(), y[k === "ltr" ? O : D].click()), S.nativeEvent.code === "ArrowRight" && (y[k === "ltr" ? D : O].focus(), y[k === "ltr" ? D : O].click());
    }
  };
  return /* @__PURE__ */ l.jsx(Md, {
    value: { checked: j },
    children: /* @__PURE__ */ l.jsx(eo, {
      mod: [{
        "with-border": f,
        checked: j
      }, u],
      ...w("card"),
      ...x,
      role: "radio",
      "aria-checked": j,
      name: N,
      onClick: (S) => {
        m?.(S), C?.onChange(p || "");
      },
      onKeyDown: T
    })
  });
});
ms.displayName = "@mantine/core/RadioCard";
ms.classes = Ad;
ms.varsResolver = Id;
var Dd = {
  indicator: "m_717d7ff6",
  icon: "m_3e4da632",
  "indicator--outline": "m_2980836c"
};
const oy = { icon: vd }, Od = Oe((e, { radius: t, color: n, size: o, iconColor: r, variant: s, autoContrast: a }) => {
  const i = Hr({
    color: n || e.primaryColor,
    theme: e
  }), c = i.isThemeColor && i.shade === void 0 ? `var(--mantine-color-${i.color}-outline)` : i.color;
  return { indicator: {
    "--radio-size": $e(o, "radio-size"),
    "--radio-radius": t === void 0 ? void 0 : kt(t),
    "--radio-color": s === "outline" ? c : tt(n, e),
    "--radio-icon-size": typeof o == "number" ? `calc(${$e(o, "radio-size")} * 0.4)` : $e(o, "radio-icon-size"),
    "--radio-icon-color": r ? tt(r, e) : Xo(a, e) ? lo({
      color: n,
      theme: e,
      autoContrast: a
    }) : void 0
  } };
}), hs = se((e) => {
  const t = Z("RadioIndicator", oy, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, icon: c, radius: u, color: f, iconColor: p, autoContrast: m, checked: h, mod: g, variant: v, disabled: x, attributes: w, ...k } = t, C = Me({
    name: "RadioIndicator",
    classes: Dd,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: w,
    vars: i,
    varsResolver: Od,
    rootSelector: "indicator"
  }), j = d.use(Md), N = typeof h == "boolean" ? h : j?.checked || !1;
  return /* @__PURE__ */ l.jsx(Q, {
    ...C("indicator", { variant: v }),
    variant: v,
    mod: [{
      checked: N,
      disabled: x
    }, g],
    ...k,
    children: /* @__PURE__ */ l.jsx(c, { ...C("icon") })
  });
});
hs.displayName = "@mantine/core/RadioIndicator";
hs.classes = Dd;
hs.varsResolver = Od;
var $d = {
  root: "m_f3f1af94",
  inner: "m_89c4f5e4",
  icon: "m_f3ed6b2b",
  radio: "m_8a3dbb89",
  "radio--outline": "m_1bfe9d39"
};
const ry = {
  labelPosition: "right",
  withErrorStyles: !0
}, Ld = Oe((e, { size: t, radius: n, color: o, iconColor: r, variant: s, autoContrast: a }) => {
  const i = Hr({
    color: o || e.primaryColor,
    theme: e
  }), c = i.isThemeColor && i.shade === void 0 ? `var(--mantine-color-${i.color}-outline)` : i.color;
  return { root: {
    "--radio-size": $e(t, "radio-size"),
    "--radio-radius": n === void 0 ? void 0 : kt(n),
    "--radio-color": s === "outline" ? c : tt(o, e),
    "--radio-icon-color": r ? tt(r, e) : Xo(a, e) ? lo({
      color: o,
      theme: e,
      autoContrast: a
    }) : void 0,
    "--radio-icon-size": $e(t, "radio-icon-size")
  } };
}), hn = se((e) => {
  const t = Z("Radio", ry, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, id: c, size: u, label: f, labelPosition: p, description: m, error: h, radius: g, color: v, variant: x, disabled: w, wrapperProps: k, icon: C = vd, rootRef: j, iconColor: N, onChange: T, mod: S, attributes: y, withErrorStyles: R, checked: D, ...O } = t, z = Me({
    name: "Radio",
    classes: $d,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: y,
    vars: i,
    varsResolver: Ld
  }), _ = d.use(fi), F = _?.size ?? u, $ = t.size ? u : F, { styleProps: I, rest: L } = yl(O), M = $t(c), P = [
    m ? `${M}-description` : void 0,
    h && typeof h != "boolean" ? `${M}-error` : void 0,
    L["aria-describedby"]
  ].filter(Boolean).join(" ") || void 0, B = _ ? _.value === L.value : void 0, W = {
    checked: B ?? D,
    name: L.name ?? _?.name,
    onChange: (U) => {
      _?.onChange(U), T?.(U);
    },
    disabled: _?.disabled ?? w
  };
  return /* @__PURE__ */ l.jsx(si, {
    ...z("root"),
    __staticSelector: "Radio",
    __stylesApiProps: t,
    id: M,
    size: $,
    labelPosition: p,
    label: f,
    description: m,
    error: h,
    disabled: W.disabled,
    classNames: n,
    styles: s,
    unstyled: a,
    "data-checked": (B ?? D) || void 0,
    variant: x,
    ref: j,
    mod: S,
    attributes: y,
    ...I,
    ...k,
    children: /* @__PURE__ */ l.jsxs(Q, {
      ...z("inner"),
      mod: { "label-position": p },
      children: [/* @__PURE__ */ l.jsx(Q, {
        ...z("radio", {
          focusable: !0,
          variant: x
        }),
        ...L,
        ...W,
        component: "input",
        mod: {
          error: !!h,
          "with-error-styles": R
        },
        id: M,
        type: "radio",
        "aria-describedby": P
      }), /* @__PURE__ */ l.jsx(C, {
        ...z("icon"),
        "aria-hidden": !0
      })]
    })
  });
});
hn.classes = $d;
hn.varsResolver = Ld;
hn.displayName = "@mantine/core/Radio";
hn.Group = pi;
hn.Card = ms;
hn.Indicator = hs;
var _d = {
  root: "m_cf365364",
  indicator: "m_9e182ccd",
  label: "m_1738fcb2",
  input: "m_1714d588",
  control: "m_69686b9b",
  innerLabel: "m_78882f40"
};
const sy = { withItemsBorders: !0 }, zd = Oe((e, { radius: t, color: n, transitionDuration: o, size: r, transitionTimingFunction: s }) => ({ root: {
  "--sc-radius": t === void 0 ? void 0 : kt(t),
  "--sc-color": n ? tt(n, e) : void 0,
  "--sc-shadow": n ? void 0 : "var(--mantine-shadow-xs)",
  "--sc-transition-duration": o === void 0 ? void 0 : `${o}ms`,
  "--sc-transition-timing-function": s,
  "--sc-padding": $e(r, "sc-padding"),
  "--sc-font-size": Rr(r)
} })), Qo = vn((e) => {
  const t = Z("SegmentedControl", sy, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, data: c, value: u, defaultValue: f, onChange: p, size: m, name: h, disabled: g, readOnly: v, fullWidth: x, orientation: w, radius: k, color: C, transitionDuration: j, transitionTimingFunction: N, variant: T, autoContrast: S, withItemsBorders: y, mod: R, attributes: D, ref: O, ...z } = t, _ = Me({
    name: "SegmentedControl",
    props: t,
    classes: _d,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: D,
    vars: i,
    varsResolver: zd
  }), F = Uo(), $ = c.map((K) => Fp(K) ? {
    label: `${K}`,
    value: K
  } : K), I = Mp(), [L, M] = d.useState(Fi()), [P, B] = d.useState(null), [W, U] = d.useState({}), Y = (K, ce) => {
    K === null || W[ce] === K || (W[ce] = K, U({ ...W }));
  }, [ae, fe] = Ye({
    value: u,
    defaultValue: f,
    finalValue: Array.isArray(c) ? $.find((K) => !K.disabled)?.value ?? c[0]?.value ?? null : null,
    onChange: p
  }), ie = $t(h), te = $.map((K) => `${K.value}`), me = $.map((K) => /* @__PURE__ */ d.createElement(Q, {
    ..._("control"),
    mod: {
      active: ae === K.value,
      orientation: w
    },
    key: `${K.value}`
  }, /* @__PURE__ */ d.createElement("input", {
    ..._("input"),
    disabled: g || K.disabled,
    type: "radio",
    name: ie,
    value: `${K.value}`,
    id: `${ie}-${K.value}`,
    checked: ae === K.value,
    onChange: () => !v && fe(K.value),
    "data-focus-ring": F.focusRing,
    key: `${K.value}-input`
  }), /* @__PURE__ */ d.createElement(Q, {
    component: "label",
    ..._("label"),
    mod: {
      active: ae === K.value && !(g || K.disabled),
      disabled: g || K.disabled,
      "read-only": v
    },
    htmlFor: `${ie}-${K.value}`,
    ref: (ce) => Y(ce, `${K.value}`),
    __vars: { "--sc-label-color": C !== void 0 ? lo({
      color: C,
      theme: F,
      autoContrast: S
    }) : void 0 },
    key: `${K.value}-label`
  }, /* @__PURE__ */ l.jsx("span", {
    ..._("innerLabel"),
    children: K.label
  })))), q = ze(O, B);
  return Wi(() => {
    M(Fi());
  }, [c.length]), Wi(() => {
    U((K) => {
      const ce = {};
      return te.forEach((be) => {
        be in K && (ce[be] = K[be]);
      }), Object.keys(ce).length === Object.keys(K).length ? K : ce;
    });
  }, [te]), c.length === 0 ? null : /* @__PURE__ */ l.jsxs(Q, {
    ..._("root"),
    variant: T,
    size: m,
    ref: q,
    mod: [{
      "full-width": x,
      orientation: w,
      initialized: I,
      "with-items-borders": y
    }, R],
    ...z,
    role: "radiogroup",
    "data-disabled": g,
    children: [typeof ae < "u" && /* @__PURE__ */ l.jsx(es, {
      target: W[`${ae}`],
      parent: P,
      component: "span",
      transitionDuration: "var(--sc-transition-duration)",
      ..._("indicator")
    }, L), me]
  });
});
Qo.classes = _d;
Qo.varsResolver = zd;
Qo.displayName = "@mantine/core/SegmentedControl";
const ay = {
  size: "sm",
  withCheckIcon: !0,
  allowDeselect: !0,
  checkIconPosition: "left",
  openOnFocus: !0
}, Jn = vn((e) => {
  const t = Z([
    "Input",
    "InputWrapper",
    "Select"
  ], ay, e), { classNames: n, styles: o, unstyled: r, vars: s, dropdownOpened: a, defaultDropdownOpened: i, onDropdownClose: c, onDropdownOpen: u, onFocus: f, onBlur: p, onClick: m, onChange: h, data: g, value: v, defaultValue: x, selectFirstOptionOnChange: w, selectFirstOptionOnDropdownOpen: k, onOptionSubmit: C, comboboxProps: j, readOnly: N, disabled: T, filter: S, limit: y, withScrollArea: R, maxDropdownHeight: D, floatingHeight: O, size: z, searchable: _, rightSection: F, checkIconPosition: $, withCheckIcon: I, withAlignedLabels: L, nothingFoundMessage: M, name: P, form: B, searchValue: W, defaultSearchValue: U, onSearchChange: Y, allowDeselect: ae, error: fe, rightSectionPointerEvents: ie, id: te, clearable: me, clearSectionMode: q, clearButtonProps: K, hiddenInputProps: ce, renderOption: be, onClear: pe, autoComplete: Se, scrollAreaProps: ne, __defaultRightSection: H, __clearSection: V, __clearable: X, chevronColor: le, autoSelectOnBlur: Ce, openOnFocus: Ae, attributes: he, ...ge } = t, xe = d.useMemo(() => Lu(g), [g]), Ie = d.useRef({}), de = d.useMemo(() => _u(xe), [xe]), mt = $t(te), [Ne, ht, Mn] = Ye({
    value: v,
    defaultValue: x,
    finalValue: null,
    onChange: h
  }), Rt = Ne != null ? `${Ne}` in de ? de[`${Ne}`] : Ie.current[`${Ne}`] : void 0, nn = Np(Rt), [Nt, In, Dn] = Ye({
    value: W,
    defaultValue: U,
    finalValue: Rt ? Rt.label : "",
    onChange: Y
  }), Ge = ti({
    opened: a,
    defaultOpened: i,
    onDropdownOpen: () => {
      u?.(), k ? Ge.selectFirstOption() : Ge.updateSelectedOptionIndex("active", { scrollIntoView: !0 });
    },
    onDropdownClose: () => {
      c?.(), setTimeout(Ge.resetSelectedOption, 0);
    }
  }), Lt = (Be) => {
    In(Be), Ge.resetSelectedOption();
  }, { resolvedClassNames: lr, resolvedStyles: ur } = qo({
    props: t,
    styles: o,
    classNames: n
  });
  d.useEffect(() => {
    w && Ge.selectFirstOption();
  }, [w, Nt]), d.useEffect(() => {
    v === null && Lt(""), v != null && Rt && (nn?.value !== Rt.value || nn?.label !== Rt.label) && Lt(Rt.label);
  }, [v, Rt]), d.useEffect(() => {
    !Mn && !Dn && Lt(Ne != null ? `${Ne}` in de ? de[`${Ne}`]?.label : Ie.current[`${Ne}`]?.label || "" : "");
  }, [de, Ne]), d.useEffect(() => {
    Ne && `${Ne}` in de && (Ie.current[`${Ne}`] = de[`${Ne}`]);
  }, [de, Ne]);
  const Ss = /* @__PURE__ */ l.jsx(we.ClearButton, {
    ...K,
    onClear: () => {
      ht(null, null), Lt(""), pe?.();
    }
  }), dr = me && Ne != null && !T && !N;
  return /* @__PURE__ */ l.jsxs(l.Fragment, { children: [/* @__PURE__ */ l.jsxs(we, {
    store: Ge,
    __staticSelector: "Select",
    classNames: lr,
    styles: ur,
    unstyled: r,
    readOnly: N,
    size: z,
    attributes: he,
    floatingHeight: O,
    keepMounted: Ce,
    onOptionSubmit: (Be) => {
      C?.(Be);
      const Je = ae && `${de[Be].value}` == `${Ne}` ? null : de[Be], on = Je ? Je.value : null;
      on !== Ne && ht(on, Je), !Mn && Lt(on != null && Je?.label || ""), Ge.closeDropdown();
    },
    ...j,
    children: [/* @__PURE__ */ l.jsx(we.Target, {
      targetType: _ ? "input" : "button",
      autoComplete: Se,
      withExpandedAttribute: !0,
      children: /* @__PURE__ */ l.jsx(yt, {
        id: mt,
        __defaultRightSection: /* @__PURE__ */ l.jsx(we.Chevron, {
          size: z,
          error: fe,
          unstyled: r,
          color: le
        }),
        __clearSection: Ss,
        __clearable: dr,
        __clearSectionMode: q,
        rightSection: F,
        rightSectionPointerEvents: ie || "none",
        ...ge,
        size: z,
        __staticSelector: "Select",
        disabled: T,
        readOnly: N || !_,
        value: Nt,
        onChange: (Be) => {
          if (Jg(Be)) {
            if (!N) {
              const Je = xv(de, Be.currentTarget.value);
              Je && `${Je.value}` != `${Ne}` && (ht(Je.value, Je), !Mn && Lt(Je.label));
            }
            return;
          }
          Lt(Be.currentTarget.value), Ge.openDropdown(), w && Ge.selectFirstOption();
        },
        onFocus: (Be) => {
          Ae && _ && Ge.openDropdown(), f?.(Be);
        },
        onBlur: (Be) => {
          Ce && Ge.clickSelectedOption(), Ge.closeDropdown();
          const Je = Ne != null && (`${Ne}` in de ? de[`${Ne}`] : Ie.current[`${Ne}`]);
          Lt(Je && Je.label || ""), p?.(Be);
        },
        onClick: (Be) => {
          _ ? Ge.openDropdown() : Ge.toggleDropdown(), m?.(Be);
        },
        classNames: lr,
        styles: ur,
        unstyled: r,
        pointer: !_,
        error: fe,
        attributes: he
      })
    }), /* @__PURE__ */ l.jsx(Gg, {
      data: xe,
      hidden: N || T,
      filter: S,
      search: Nt,
      limit: y,
      hiddenWhenEmpty: !M,
      withScrollArea: R,
      maxDropdownHeight: D,
      filterOptions: !!_ && Rt?.label !== Nt,
      value: Ne,
      checkIconPosition: $,
      withCheckIcon: I,
      withAlignedLabels: L,
      nothingFoundMessage: M,
      unstyled: r,
      labelId: ge.label ? `${mt}-label` : void 0,
      "aria-label": ge.label ? void 0 : ge["aria-label"],
      renderOption: be,
      scrollAreaProps: ne
    })]
  }), /* @__PURE__ */ l.jsx(we.HiddenInput, {
    value: Ne,
    name: P,
    form: B,
    disabled: T,
    ...ce
  })] });
});
Jn.classes = {
  ...yt.classes,
  ...we.classes
};
Jn.displayName = "@mantine/core/Select";
const [iy, cy] = Wt("Table component was not found in the tree");
var er = {
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
function ly(e, t) {
  if (!t) return;
  const n = {};
  return t.columnBorder && e.withColumnBorders && (n["data-with-column-border"] = !0), t.rowBorder && e.withRowBorders && (n["data-with-row-border"] = !0), t.striped && e.striped && (n["data-striped"] = e.striped), t.highlightOnHover && e.highlightOnHover && (n["data-hover"] = !0), t.captionSide && e.captionSide && (n["data-side"] = e.captionSide), t.stickyHeader && e.stickyHeader && (n["data-sticky"] = !0), n;
}
function Pn(e, t) {
  const n = `Table${e.charAt(0).toUpperCase()}${e.slice(1)}`, o = se((r) => {
    const s = Z(n, {}, r), { classNames: a, className: i, style: c, styles: u, ...f } = s, p = cy();
    return /* @__PURE__ */ l.jsx(Q, {
      component: e,
      ...ly(p, t),
      ...p.getStyles(e, {
        className: i,
        classNames: a,
        style: c,
        styles: u,
        props: s
      }),
      ...f
    });
  });
  return o.displayName = `@mantine/core/${n}`, o.classes = er, o;
}
const ra = Pn("th", { columnBorder: !0 }), Fd = Pn("td", { columnBorder: !0 }), jr = Pn("tr", {
  rowBorder: !0,
  striped: !0,
  highlightOnHover: !0
}), Bd = Pn("thead", { stickyHeader: !0 }), Vd = Pn("tbody"), Hd = Pn("tfoot"), Wd = Pn("caption", { captionSide: !0 }), uy = { type: "scrollarea" }, Ud = Oe((e, { minWidth: t, maxHeight: n, type: o }) => ({ scrollContainer: {
  "--table-min-width": Pe(t),
  "--table-max-height": Pe(n),
  "--table-overflow": o === "native" ? "auto" : void 0
} })), gs = se((e) => {
  const t = Z("TableScrollContainer", uy, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, children: c, minWidth: u, maxHeight: f, type: p, scrollAreaProps: m, attributes: h, ...g } = t, v = Me({
    name: "TableScrollContainer",
    classes: er,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: h,
    vars: i,
    varsResolver: Ud,
    rootSelector: "scrollContainer"
  });
  return /* @__PURE__ */ l.jsx(Q, {
    component: p === "scrollarea" ? bn : "div",
    ...p === "scrollarea" ? f ? {
      offsetScrollbars: "xy",
      ...m
    } : {
      offsetScrollbars: "x",
      ...m
    } : {},
    ...v("scrollContainer"),
    ...g,
    children: /* @__PURE__ */ l.jsx("div", {
      ...v("scrollContainerInner"),
      children: c
    })
  });
});
gs.classes = er;
gs.varsResolver = Ud;
gs.displayName = "@mantine/core/TableScrollContainer";
function mi({ data: e }) {
  return /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
    e.caption && /* @__PURE__ */ l.jsx(Wd, { children: e.caption }),
    e.head && /* @__PURE__ */ l.jsx(Bd, { children: /* @__PURE__ */ l.jsx(jr, { children: e.head.map((t, n) => /* @__PURE__ */ l.jsx(ra, { children: t }, n)) }) }),
    e.body && /* @__PURE__ */ l.jsx(Vd, { children: e.body.map((t, n) => /* @__PURE__ */ l.jsx(jr, { children: t.map((o, r) => /* @__PURE__ */ l.jsx(Fd, { children: o }, r)) }, n)) }),
    e.foot && /* @__PURE__ */ l.jsx(Hd, { children: /* @__PURE__ */ l.jsx(jr, { children: e.foot.map((t, n) => /* @__PURE__ */ l.jsx(ra, { children: t }, n)) }) })
  ] });
}
mi.displayName = "@mantine/core/TableDataRenderer";
const dy = {
  withRowBorders: !0,
  verticalSpacing: 7
}, qd = Oe((e, { layout: t, captionSide: n, horizontalSpacing: o, verticalSpacing: r, borderColor: s, stripedColor: a, highlightOnHoverColor: i, striped: c, highlightOnHover: u, stickyHeaderOffset: f, stickyHeader: p }) => ({ table: {
  "--table-layout": t,
  "--table-caption-side": n,
  "--table-horizontal-spacing": Po(o),
  "--table-vertical-spacing": Po(r),
  "--table-border-color": s ? tt(s, e) : void 0,
  "--table-striped-color": c && a ? tt(a, e) : void 0,
  "--table-highlight-on-hover-color": u && i ? tt(i, e) : void 0,
  "--table-sticky-header-offset": p ? Pe(f) : void 0
} })), et = se((e) => {
  const t = Z("Table", dy, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, horizontalSpacing: c, verticalSpacing: u, captionSide: f, stripedColor: p, highlightOnHoverColor: m, striped: h, highlightOnHover: g, withColumnBorders: v, withRowBorders: x, withTableBorder: w, borderColor: k, layout: C, data: j, children: N, stickyHeader: T, stickyHeaderOffset: S, mod: y, tabularNums: R, attributes: D, ...O } = t, z = Me({
    name: "Table",
    props: t,
    className: o,
    style: r,
    classes: er,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: D,
    rootSelector: "table",
    vars: i,
    varsResolver: qd,
    stable: !0
  }), _ = h === !0 ? "odd" : h || void 0, F = f || "bottom", $ = d.useMemo(() => ({
    getStyles: z,
    stickyHeader: T,
    striped: _,
    highlightOnHover: g,
    withColumnBorders: v,
    withRowBorders: x,
    captionSide: F
  }), [
    z,
    T,
    _,
    g,
    v,
    x,
    F
  ]);
  return /* @__PURE__ */ l.jsx(iy, {
    value: $,
    children: /* @__PURE__ */ l.jsx(Q, {
      component: "table",
      mod: [{
        withTableBorder: w,
        tabularNums: R
      }, y],
      ...z("table"),
      ...O,
      children: N || !!j && /* @__PURE__ */ l.jsx(mi, { data: j })
    })
  });
});
et.classes = er;
et.varsResolver = qd;
et.displayName = "@mantine/core/Table";
et.Td = Fd;
et.Th = ra;
et.Tr = jr;
et.Thead = Bd;
et.Tbody = Vd;
et.Tfoot = Hd;
et.Caption = Wd;
et.ScrollContainer = gs;
et.DataRenderer = mi;
const [fy, hi] = Wt("Tabs component was not found in the tree");
var tr = {
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
const gi = se((e) => {
  const t = Z("TabsList", null, e), { children: n, className: o, grow: r, justify: s, classNames: a, styles: i, style: c, mod: u, ...f } = t, p = hi();
  return /* @__PURE__ */ l.jsx(Q, {
    ...p.getStyles("list", {
      className: o,
      style: c,
      classNames: a,
      styles: i,
      props: t,
      variant: p.variant
    }),
    role: "tablist",
    variant: p.variant,
    mod: [{
      grow: r,
      orientation: p.orientation,
      placement: p.orientation === "vertical" && p.placement,
      inverted: p.inverted
    }, u],
    "aria-orientation": p.orientation,
    __vars: { "--tabs-justify": s },
    ...f,
    children: n
  });
});
gi.classes = tr;
gi.displayName = "@mantine/core/TabsList";
const vi = se((e) => {
  const t = Z("TabsPanel", null, e), { children: n, className: o, value: r, classNames: s, styles: a, style: i, mod: c, keepMounted: u, ...f } = t, p = xa(), m = hi();
  d.useEffect(() => (m.setMountedPanel(r, !0), () => {
    m.setMountedPanel(r, !1);
  }), [r]);
  const h = m.value === r, g = m.keepMounted || u, v = m.keepMountedMode !== "display-none", x = g && v && p !== "test" ? /* @__PURE__ */ l.jsx(d.Activity, {
    mode: h ? "visible" : "hidden",
    children: n
  }) : g || h ? n : null;
  return /* @__PURE__ */ l.jsx(Q, {
    ...m.getStyles("panel", {
      className: o,
      classNames: s,
      styles: a,
      style: [i, h ? void 0 : { display: "none" }],
      props: t
    }),
    mod: [{ orientation: m.orientation }, c],
    role: "tabpanel",
    id: m.getPanelId(r),
    "aria-labelledby": m.getTabId(r),
    ...f,
    children: x
  });
});
vi.classes = tr;
vi.displayName = "@mantine/core/TabsPanel";
const yi = se((e) => {
  const t = Z("TabsTab", null, e), { className: n, children: o, rightSection: r, leftSection: s, value: a, onClick: i, onKeyDown: c, disabled: u, color: f, style: p, classNames: m, styles: h, vars: g, mod: v, tabIndex: x, ...w } = t, k = Uo(), { dir: C } = fo(), j = hi(), N = a === j.value, T = (y) => {
    j.onChange(j.allowTabDeactivation && a === j.value ? null : a), i?.(y);
  }, S = {
    classNames: m,
    styles: h,
    props: t
  };
  return /* @__PURE__ */ l.jsxs(eo, {
    ...j.getStyles("tab", {
      className: n,
      style: p,
      variant: j.variant,
      ...S
    }),
    disabled: u,
    unstyled: j.unstyled,
    variant: j.variant,
    mod: [{
      active: N,
      disabled: u,
      orientation: j.orientation,
      inverted: j.inverted,
      placement: j.orientation === "vertical" && j.placement
    }, v],
    role: "tab",
    id: j.getTabId(a),
    "aria-selected": N,
    tabIndex: x !== void 0 ? x : N || j.value === null ? 0 : -1,
    "aria-controls": j.mountedPanels.current.has(a) ? j.getPanelId(a) : void 0,
    onClick: T,
    __vars: { "--tabs-color": f ? tt(f, k) : void 0 },
    onKeyDown: El({
      siblingSelector: '[role="tab"]',
      parentSelector: '[role="tablist"]',
      activateOnFocus: j.activateTabWithKeyboard,
      loop: j.loop,
      orientation: j.orientation || "horizontal",
      dir: C,
      onKeyDown: c
    }),
    ...w,
    children: [
      s && /* @__PURE__ */ l.jsx("span", {
        ...j.getStyles("tabSection", S),
        "data-position": "left",
        children: s
      }),
      o && /* @__PURE__ */ l.jsx("span", {
        ...j.getStyles("tabLabel", S),
        children: o
      }),
      r && /* @__PURE__ */ l.jsx("span", {
        ...j.getStyles("tabSection", S),
        "data-position": "right",
        children: r
      })
    ]
  });
});
yi.classes = tr;
yi.displayName = "@mantine/core/TabsTab";
const Dc = "Tabs.Tab or Tabs.Panel component was rendered with invalid value or without value", py = {
  keepMounted: !0,
  keepMountedMode: "activity",
  orientation: "horizontal",
  loop: !0,
  activateTabWithKeyboard: !0,
  variant: "default",
  placement: "left"
}, Kd = Oe((e, { radius: t, color: n, autoContrast: o }) => ({ root: {
  "--tabs-radius": kt(t),
  "--tabs-color": tt(n, e),
  "--tabs-text-color": Xo(o, e) ? lo({
    color: n,
    theme: e,
    autoContrast: o
  }) : void 0
} })), ut = se((e) => {
  const t = Z("Tabs", py, e), { defaultValue: n, value: o, onChange: r, orientation: s, children: a, loop: i, id: c, activateTabWithKeyboard: u, allowTabDeactivation: f, variant: p, color: m, radius: h, inverted: g, placement: v, keepMounted: x, keepMountedMode: w, classNames: k, styles: C, unstyled: j, className: N, style: T, vars: S, autoContrast: y, mod: R, attributes: D, ...O } = t, z = $t(c), _ = d.useRef(/* @__PURE__ */ new Set()), F = Cp(), $ = d.useCallback((P, B) => {
    const W = _.current;
    B && !W.has(P) ? (W.add(P), F()) : !B && W.has(P) && (W.delete(P), F());
  }, []), [I, L] = Ye({
    value: o,
    defaultValue: n,
    finalValue: null,
    onChange: r
  }), M = Me({
    name: "Tabs",
    props: t,
    classes: tr,
    className: N,
    style: T,
    classNames: k,
    styles: C,
    unstyled: j,
    attributes: D,
    vars: S,
    varsResolver: Kd
  });
  return /* @__PURE__ */ l.jsx(fy, {
    value: {
      placement: v,
      value: I,
      orientation: s,
      id: z,
      loop: i,
      activateTabWithKeyboard: u,
      getTabId: Nr(`${z}-tab`, Dc),
      getPanelId: Nr(`${z}-panel`, Dc),
      onChange: L,
      allowTabDeactivation: f,
      variant: p,
      color: m,
      radius: h,
      inverted: g,
      keepMounted: x,
      keepMountedMode: w,
      unstyled: j,
      getStyles: M,
      mountedPanels: _,
      setMountedPanel: $
    },
    children: /* @__PURE__ */ l.jsx(Q, {
      id: z,
      variant: p,
      mod: [{
        orientation: s,
        inverted: s === "horizontal" && g,
        placement: s === "vertical" && v
      }, R],
      ...M("root"),
      ...O,
      children: a
    })
  });
});
ut.classes = tr;
ut.varsResolver = Kd;
ut.displayName = "@mantine/core/Tabs";
ut.Tab = yi;
ut.Panel = vi;
ut.List = gi;
const ct = se((e) => {
  const t = Z([
    "Input",
    "InputWrapper",
    "TextInput"
  ], null, e);
  return /* @__PURE__ */ l.jsx(yt, {
    component: "input",
    ...t,
    __staticSelector: "TextInput"
  });
});
ct.classes = yt.classes;
ct.displayName = "@mantine/core/TextInput";
function Lo(e, t) {
  for (const n of t) {
    if (n.value === e) return n;
    if (Array.isArray(n.children)) {
      const o = Lo(e, n.children);
      if (o) return o;
    }
  }
  return null;
}
function Dr(e, t, n = []) {
  const o = Lo(e, t);
  return o ? !Array.isArray(o.children) || o.children.length === 0 ? [o.value] : (o.children.forEach((r) => {
    Array.isArray(r.children) && r.children.length > 0 ? Dr(r.value, t, n) : n.push(r.value);
  }), n) : n;
}
function Xd(e) {
  return e.reduce((t, n) => (Array.isArray(n.children) && n.children.length > 0 ? t.push(...Xd(n.children)) : t.push(n.value), t), []);
}
function vs(e, t, n = []) {
  const o = [];
  for (const r of e) if (Array.isArray(r.children) && r.children.length > 0) {
    const s = vs(r.children, t, n);
    if (s.currentTreeChecked.length === r.children.length) {
      const a = s.currentTreeChecked.every((c) => c.checked), i = {
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
function my(e, t, n) {
  return n.length === 0 ? !1 : n.includes(e) ? !0 : vs(t, n).result.some((o) => o.value === e && o.checked);
}
const hy = Ol(my);
function gy(e, t, n) {
  return n.length === 0 ? !1 : vs(t, n).result.some((o) => o.value === e && o.indeterminate);
}
const vy = Ol(gy);
function Yd(e, t, n, o = {}) {
  return t.forEach((r) => {
    o[r.value] = r.value in e ? e[r.value] : r.value === n, Array.isArray(r.children) && Yd(e, r.children, n, o);
  }), o;
}
function yy(e, t, n) {
  if (n) return e;
  const o = [];
  return e.forEach((r) => o.push(...Dr(r, t))), Array.from(new Set(o));
}
function Gd(e) {
  const t = [];
  for (const n of e)
    t.push(n.value), Array.isArray(n.children) && n.children.length > 0 && t.push(...Gd(n.children));
  return t;
}
function Jd({ initialSelectedState: e = [], expandedState: t, initialCheckedState: n = [], checkedState: o, initialExpandedState: r = {}, selectedState: s, multiple: a = !1, onNodeCollapse: i, onNodeExpand: c, onCheckedStateChange: u, onSelectedStateChange: f, onExpandedStateChange: p, onLoadChildren: m, checkStrictly: h = !1 } = {}) {
  const [g, v] = d.useState([]), [x, w] = Ye({
    value: t,
    defaultValue: r,
    finalValue: {},
    onChange: p
  }), [k, C] = Ye({
    value: s,
    defaultValue: e,
    finalValue: [],
    onChange: f
  }), [j, N] = Ye({
    value: o,
    defaultValue: n,
    finalValue: [],
    onChange: u
  }), [T, S] = d.useState(null), y = d.useRef(/* @__PURE__ */ new Set()), R = d.useRef(/* @__PURE__ */ new Set()), [D, O] = d.useState([]), [z, _] = d.useState({}), F = d.useCallback((H) => {
    w(Yd(x, H, k)), N(yy(j, H, h)), v(H);
  }, [
    k,
    j,
    x,
    h
  ]), $ = d.useCallback(async (H) => {
    if (m && !(y.current.has(H) || R.current.has(H))) {
      y.current.add(H), O(Array.from(y.current)), _((V) => {
        if (!(H in V)) return V;
        const X = { ...V };
        return delete X[H], X;
      });
      try {
        await m(H), R.current.add(H);
      } catch (V) {
        const X = V instanceof Error ? V : new Error(String(V));
        _((le) => ({
          ...le,
          [H]: X
        }));
      } finally {
        y.current.delete(H), O(Array.from(y.current));
      }
    }
  }, [m]), I = d.useCallback((H) => {
    if (!m) return;
    const V = Lo(H, g);
    V && V.hasChildren && !Array.isArray(V.children) && $(H);
  }, [
    m,
    g,
    $
  ]), L = d.useCallback((H) => {
    const V = {
      ...x,
      [H]: !x[H]
    };
    V[H] ? c?.(H) : i?.(H), V[H] && I(H), w(V);
  }, [
    i,
    c,
    x,
    I
  ]), M = d.useCallback((H) => {
    x[H] !== !1 && i?.(H), w({
      ...x,
      [H]: !1
    });
  }, [i, x]), P = d.useCallback((H) => {
    x[H] !== !0 && c?.(H), I(H), w({
      ...x,
      [H]: !0
    });
  }, [
    c,
    x,
    I
  ]), B = d.useCallback(() => {
    const H = { ...x };
    Object.keys(H).forEach((V) => {
      H[V] = !0, I(V);
    }), w(H);
  }, [x, I]), W = d.useCallback(() => {
    const H = { ...x };
    Object.keys(H).forEach((V) => {
      H[V] = !1;
    }), w(H);
  }, [x]), U = d.useCallback((H) => {
    if (!a)
      return k.includes(H) ? (S(null), []) : (S(H), [H]);
    if (k.includes(H))
      return S(null), k.filter((V) => V !== H);
    S(H), C([...k, H]);
  }, [k]), Y = d.useCallback((H) => {
    S(H), C(a ? k.includes(H) ? k : [...k, H] : [H]);
  }, [k]), ae = d.useCallback((H) => {
    T === H && S(null), C(k.filter((V) => V !== H));
  }, [k]), fe = d.useCallback(() => {
    C([]), S(null);
  }, []), ie = d.useCallback((H) => {
    if (h)
      j.includes(H) || N([...j, H]);
    else {
      const V = Dr(H, g);
      N(Array.from(/* @__PURE__ */ new Set([...j, ...V])));
    }
  }, [
    g,
    j,
    h
  ]), te = d.useCallback((H) => {
    if (h) N(j.filter((V) => V !== H));
    else {
      const V = Dr(H, g);
      N(j.filter((X) => !V.includes(X)));
    }
  }, [
    g,
    j,
    h
  ]), me = d.useCallback(() => {
    N(h ? Gd(g) : Xd(g));
  }, [g, h]), q = d.useCallback(() => {
    N([]);
  }, []), K = d.useCallback(() => h ? j.map((H) => {
    const V = Lo(H, g);
    return {
      checked: !0,
      indeterminate: !1,
      value: H,
      hasChildren: V ? Array.isArray(V.children) && V.children.length > 0 || !!V.hasChildren : !1
    };
  }) : vs(g, j).result, [
    h,
    j,
    g
  ]), ce = d.useCallback((H) => h ? j.includes(H) : hy(H, g, j), [
    h,
    j,
    g
  ]), be = d.useCallback((H) => h ? !1 : vy(H, g, j), [
    h,
    j,
    g
  ]), pe = d.useCallback((H) => D.includes(H), [D]), Se = d.useCallback((H) => z[H] || null, [z]), ne = d.useCallback((H) => {
    R.current.delete(H), _((V) => {
      if (!(H in V)) return V;
      const X = { ...V };
      return delete X[H], X;
    });
  }, []);
  return d.useMemo(() => ({
    checkStrictly: h,
    multiple: a,
    expandedState: x,
    selectedState: k,
    checkedState: j,
    anchorNode: T,
    initialize: F,
    toggleExpanded: L,
    collapse: M,
    expand: P,
    expandAllNodes: B,
    collapseAllNodes: W,
    setExpandedState: w,
    checkNode: ie,
    uncheckNode: te,
    checkAllNodes: me,
    uncheckAllNodes: q,
    setCheckedState: N,
    toggleSelected: U,
    select: Y,
    deselect: ae,
    clearSelected: fe,
    setSelectedState: C,
    getCheckedNodes: K,
    isNodeChecked: ce,
    isNodeIndeterminate: be,
    isNodeLoading: pe,
    getNodeLoadError: Se,
    loadNode: $,
    invalidateNode: ne
  }), [
    h,
    a,
    x,
    k,
    j,
    T,
    F,
    L,
    M,
    P,
    B,
    W,
    w,
    ie,
    te,
    me,
    q,
    N,
    U,
    Y,
    ae,
    fe,
    C,
    K,
    ce,
    be,
    pe,
    Se,
    $,
    ne
  ]);
}
function by(e, t, n) {
  const o = Lo(t, e);
  if (!o || !o.children) return !1;
  function r(s) {
    for (const a of s)
      if (a.value === n || a.children && r(a.children)) return !0;
    return !1;
  }
  return r(o.children);
}
function xy(e, t, n, o) {
  const r = t.getBoundingClientRect(), s = e.clientY - r.top, a = r.height;
  return n ? o ? s < a * 0.5 ? "before" : "inside" : s < a * 0.25 ? "before" : s > a * 0.75 ? "after" : "inside" : s < a * 0.5 ? "before" : "after";
}
const wy = {
  elementProps: {},
  dragHandleProps: void 0
};
function Sy({ nodeValue: e, hasChildren: t, isExpanded: n, data: o, onDragDrop: r, dragStateRef: s, allowDrop: a, withDragHandle: i }) {
  const [c, u] = d.useState(!1);
  return d.useEffect(() => {
    if (!i || !c) return;
    const v = () => u(!1);
    return window.addEventListener("mouseup", v), () => window.removeEventListener("mouseup", v);
  }, [i, c]), r ? {
    elementProps: {
      draggable: i ? c : !0,
      onDragStart: (v) => {
        if (i && !c) return;
        v.stopPropagation(), v.dataTransfer.effectAllowed = "move", v.dataTransfer.setData("text/plain", e), s.current.draggedValue = e;
        const x = v.currentTarget, w = x.closest("[role=treeitem]");
        w && w.setAttribute("data-dragging", "true"), requestAnimationFrame(() => {
          x.setAttribute("data-dragging", "true");
        });
      },
      onDragOver: (v) => {
        const x = s.current.draggedValue;
        if (!x || x === e || by(o, x, e)) return;
        const w = v.currentTarget, k = xy(v, w, t, n);
        if (a && !a({
          draggedNode: x,
          targetNode: e,
          position: k
        })) {
          const j = s.current.currentDropTarget;
          j && j !== w && j.removeAttribute("data-drag-over"), w.removeAttribute("data-drag-over"), s.current.currentDropTarget = null;
          return;
        }
        v.preventDefault(), v.stopPropagation(), v.dataTransfer.dropEffect = "move";
        const C = s.current.currentDropTarget;
        C && C !== w && C.removeAttribute("data-drag-over"), w.setAttribute("data-drag-over", k), s.current.currentDropTarget = w;
      },
      onDragLeave: (v) => {
        const x = v.currentTarget, w = v.relatedTarget;
        w && x.contains(w) || (x.removeAttribute("data-drag-over"), s.current.currentDropTarget === x && (s.current.currentDropTarget = null));
      },
      onDrop: (v) => {
        v.preventDefault(), v.stopPropagation();
        const x = v.currentTarget, w = x.getAttribute("data-drag-over");
        x.removeAttribute("data-drag-over");
        const k = s.current.draggedValue;
        if (k && w && k !== e) {
          const C = {
            draggedNode: k,
            targetNode: e,
            position: w
          };
          (!a || a(C)) && r(C);
        }
        s.current.draggedValue = null, s.current.currentDropTarget = null;
      },
      onDragEnd: (v) => {
        const x = v.currentTarget;
        x.removeAttribute("data-dragging");
        const w = x.closest("[role=treeitem]");
        w && w.removeAttribute("data-dragging");
        const k = s.current.currentDropTarget;
        k && k.removeAttribute("data-drag-over"), s.current.draggedValue = null, s.current.currentDropTarget = null, i && u(!1);
      }
    },
    dragHandleProps: i ? { onMouseDown: () => u(!0) } : void 0
  } : wy;
}
function Oc(e, t, n) {
  if (!e || !t) return [];
  const o = n.indexOf(e), r = n.indexOf(t), s = Math.min(o, r), a = Math.max(o, r);
  return n.slice(s, a + 1);
}
function Cy(e, t) {
  for (let n = e; n && n !== t; ) {
    if (n.style.display === "none") return !1;
    n = n.parentElement;
  }
  return !0;
}
function bi({ node: e, getStyles: t, rootIndex: n, controller: o, expandOnClick: r, selectOnClick: s, isSubtree: a, level: i = 1, renderNode: c, flatValues: u, allowRangeSelection: f, expandOnSpace: p, checkOnSpace: m, keepMounted: h, onDragDrop: g, allowDrop: v, withDragHandle: x, dragStateRef: w, data: k }) {
  const C = d.useRef(null), j = Array.isArray(e.children) && e.children.length > 0, N = !!e.hasChildren && !j, T = j || N, S = o.isNodeLoading(e.value), y = o.getNodeLoadError(e.value), R = o.expandedState[e.value] || !1, D = (e.children || []).map((M) => /* @__PURE__ */ l.jsx(bi, {
    node: M,
    flatValues: u,
    getStyles: t,
    rootIndex: void 0,
    level: i + 1,
    controller: o,
    expandOnClick: r,
    isSubtree: !0,
    renderNode: c,
    selectOnClick: s,
    allowRangeSelection: f,
    expandOnSpace: p,
    checkOnSpace: m,
    keepMounted: h,
    onDragDrop: g,
    allowDrop: v,
    withDragHandle: x,
    dragStateRef: w,
    data: k
  }, M.value)), { elementProps: O, dragHandleProps: z } = Sy({
    nodeValue: e.value,
    hasChildren: T,
    isExpanded: R,
    data: k,
    onDragDrop: g,
    dragStateRef: w,
    allowDrop: v,
    withDragHandle: x
  }), _ = (M) => {
    if (M.nativeEvent.code === "ArrowRight")
      if (M.stopPropagation(), M.preventDefault(), R) {
        const P = M.currentTarget.querySelector("[role=treeitem]");
        P?.setAttribute("data-focus-ring", "true"), P?.focus();
      } else o.expand(e.value);
    if (M.nativeEvent.code === "ArrowLeft") {
      if (M.stopPropagation(), M.preventDefault(), R && T) o.collapse(e.value);
      else if (a) {
        const P = Ao(M.currentTarget, "[role=treeitem]");
        P?.setAttribute("data-focus-ring", "true"), P?.focus();
      }
    }
    if (M.nativeEvent.code === "ArrowDown" || M.nativeEvent.code === "ArrowUp") {
      const P = Ao(M.currentTarget, "[data-tree-root]");
      if (!P) return;
      M.stopPropagation(), M.preventDefault();
      const B = Array.from(P.querySelectorAll("[role=treeitem]")).filter((ae) => Cy(ae, P)), W = B.indexOf(M.currentTarget);
      if (W === -1) return;
      const U = M.nativeEvent.code === "ArrowDown" ? W + 1 : W - 1, Y = B[U];
      if (Y?.setAttribute("data-focus-ring", "true"), Y?.focus(), M.shiftKey) {
        const ae = B[U];
        ae && o.setSelectedState(Oc(o.anchorNode, ae.dataset.value, u));
      }
    }
    M.nativeEvent.code === "Space" && (p && (M.stopPropagation(), M.preventDefault(), o.toggleExpanded(e.value)), m && (M.stopPropagation(), M.preventDefault(), o.isNodeChecked(e.value) ? o.uncheckNode(e.value) : o.checkNode(e.value)));
  }, F = (M) => {
    M.stopPropagation(), f && M.shiftKey && o.anchorNode ? (o.setSelectedState(Oc(o.anchorNode, e.value, u)), C.current?.focus()) : (r && o.toggleExpanded(e.value), s && o.select(e.value), C.current?.focus());
  }, $ = o.selectedState.includes(e.value), I = {
    ...t("label"),
    onClick: F,
    "data-selected": $ || void 0,
    "data-value": e.value,
    ...O
  }, L = R && S && D.length === 0;
  return /* @__PURE__ */ l.jsxs("li", {
    ...t("node", { style: { "--label-offset": `calc(var(--level-offset) * ${i - 1})` } }),
    role: "treeitem",
    "aria-selected": $,
    "data-value": e.value,
    "data-selected": $ || void 0,
    "data-level": i,
    tabIndex: n === 0 ? 0 : -1,
    onKeyDown: _,
    onBlur: (M) => {
      M.currentTarget.contains(M.relatedTarget) || M.currentTarget.removeAttribute("data-focus-ring");
    },
    ref: C,
    children: [
      typeof c == "function" ? c({
        node: e,
        level: i,
        selected: $,
        isRoot: i === 1,
        tree: o,
        expanded: R,
        hasChildren: T,
        isLoading: S,
        loadError: y,
        elementProps: I,
        dragHandleProps: z
      }) : /* @__PURE__ */ l.jsx("div", {
        ...I,
        children: e.label
      }),
      L && /* @__PURE__ */ l.jsx(Q, {
        component: "ul",
        role: "group",
        ...t("subtree"),
        "data-level": i,
        children: /* @__PURE__ */ l.jsx("li", {
          ...t("node", { style: { "--label-offset": `calc(var(--level-offset) * ${i})` } }),
          children: /* @__PURE__ */ l.jsx("div", {
            ...t("label"),
            children: /* @__PURE__ */ l.jsx(Zf, {
              size: 16,
              style: { marginInlineStart: 4 }
            })
          })
        })
      }),
      h && D.length > 0 ? /* @__PURE__ */ l.jsx(d.Activity, {
        mode: R ? "visible" : "hidden",
        children: /* @__PURE__ */ l.jsx(Q, {
          component: "ul",
          role: "group",
          ...t("subtree"),
          "data-level": i,
          children: D
        })
      }) : R && D.length > 0 && /* @__PURE__ */ l.jsx(Q, {
        component: "ul",
        role: "group",
        ...t("subtree"),
        "data-level": i,
        children: D
      })
    ]
  });
}
bi.displayName = "@mantine/core/TreeNode";
var Zd = {
  root: "m_f698e191",
  subtree: "m_75f3ecf",
  node: "m_f6970eb1",
  label: "m_dc283425",
  flatLine: "m_c03b303c",
  flatLineClosing: "m_bf7448d9"
};
function Qd(e) {
  return e.reduce((t, n) => (t.push(n.value), n.children && t.push(...Qd(n.children)), t), []);
}
const jy = {
  expandOnClick: !0,
  allowRangeSelection: !0,
  expandOnSpace: !0
}, ef = Oe((e, { levelOffset: t }) => ({ root: { "--level-offset": Po(t) } })), ys = se((e) => {
  const t = Z("Tree", jy, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, data: c, expandOnClick: u, tree: f, renderNode: p, selectOnClick: m, clearSelectionOnOutsideClick: h, allowRangeSelection: g, expandOnSpace: v, levelOffset: x, checkOnSpace: w, keepMounted: k, onDragDrop: C, allowDrop: j, withDragHandle: N, withLines: T, attributes: S, ref: y, ...R } = t, D = Jd(), O = f || D, z = d.useRef({
    draggedValue: null,
    currentDropTarget: null
  }), _ = Me({
    name: "Tree",
    classes: Zd,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: S,
    vars: i,
    varsResolver: ef
  }), F = Rl(() => h && O.clearSelected()), $ = ze(y, F), I = d.useMemo(() => Qd(c), [c]);
  d.useEffect(() => {
    O.initialize(c);
  }, [c]);
  const L = c.map((M, P) => /* @__PURE__ */ l.jsx(bi, {
    node: M,
    getStyles: _,
    rootIndex: P,
    expandOnClick: u,
    selectOnClick: m,
    controller: O,
    renderNode: p,
    flatValues: I,
    allowRangeSelection: g,
    expandOnSpace: v,
    checkOnSpace: w,
    keepMounted: k,
    onDragDrop: C,
    allowDrop: j,
    withDragHandle: N,
    dragStateRef: z,
    data: c
  }, M.value));
  return /* @__PURE__ */ l.jsx(Q, {
    component: "ul",
    ref: $,
    ..._("root"),
    ...R,
    role: "tree",
    "aria-multiselectable": O.multiple,
    "data-tree-root": !0,
    "data-with-lines": T || void 0,
    children: L
  });
});
ys.displayName = "@mantine/core/Tree";
ys.classes = Zd;
ys.varsResolver = ef;
function xi() {
  window.location.pathname !== "/login.html" && window.location.replace("/login.html");
}
function De(e) {
  return e.layers ?? [];
}
function Ve(e) {
  return e.version ?? 0;
}
class nt extends Error {
  code;
  details;
  constructor(t, n, o) {
    super(n), this.name = "ApiError", this.code = t, this.details = o;
  }
}
async function Ee(e, t) {
  const n = await fetch(e, t);
  if (n.status === 401)
    throw xi(), new nt("unauthorized", "this server needs an access token", null);
  if (!n.ok) {
    let o = `http${n.status}`, r = n.statusText, s = null;
    try {
      const a = await n.json();
      a?.error && (o = a.error.code ?? o, r = a.error.message ?? r, s = a.error.details ?? null);
    } catch {
    }
    throw new nt(o, r, s);
  }
  if (n.status !== 204)
    return await n.json();
}
async function tf(e = "", t = 200) {
  const n = new URLSearchParams({ limit: String(t) });
  return e && n.set("query", e), (await Ee(
    `/api/projects?${n.toString()}`
  )).projects;
}
async function ky(e = 8) {
  return (await Ee(
    `/api/projects/recent?limit=${e}`
  )).projects;
}
async function Ey(e) {
  return Ee(`/api/projects/${encodeURIComponent(e)}`);
}
function Ry(e) {
  return `/api/projects/${encodeURIComponent(e)}/thumbnail.png`;
}
async function Ny(e, t, n, o, r) {
  return Ee("/api/projects", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: e, width: t, height: n, background: o, name: r })
  });
}
async function Ty(e, t) {
  return Ee(
    `/api/projects/${encodeURIComponent(e)}/rename`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: t })
    }
  );
}
async function Py(e) {
  return Ee(`/api/projects/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
async function wi(e) {
  return Ee(`/api/projects/${encodeURIComponent(e)}/document`);
}
async function Ay(e, t) {
  return (await Ee(
    `/api/projects/${encodeURIComponent(e)}/recover-lock`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ expectedPid: t })
    }
  )).unlocked;
}
async function My(e, t = 100) {
  const n = new URLSearchParams({ tail: String(t) });
  return Ee(`/api/projects/${encodeURIComponent(e)}/history?${n.toString()}`);
}
async function An(e, t, n, o = !1) {
  return Ee(
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
async function Iy(e, t, n, o) {
  return Ee(
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
async function Dy(e) {
  return Ee(`/api/projects/${encodeURIComponent(e)}/undo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ actor: { kind: "human", name: "reference UI" } })
  });
}
async function Oy(e) {
  return Ee(`/api/projects/${encodeURIComponent(e)}/redo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ actor: { kind: "human", name: "reference UI" } })
  });
}
async function $y(e, t, n) {
  return Ee(`/api/projects/${encodeURIComponent(e)}/export`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: t, scale: n })
  });
}
async function Ly() {
  await Ee("/api/shutdown", { method: "POST" });
}
async function _y() {
  return Ee("/api/version");
}
async function zy() {
  return Ee("/api/agent-access");
}
async function Fy() {
  return Ee("/api/agent-sessions");
}
async function By() {
  return Ee("/api/update-status");
}
async function Vy(e) {
  return Ee("/api/update-consent", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ updateCheck: e })
  });
}
async function Si(e, t) {
  const n = await fetch(
    `/api/projects/${encodeURIComponent(e)}/assets?filename=${encodeURIComponent(t.name)}`,
    {
      method: "POST",
      headers: { "content-type": t.type || "application/octet-stream" },
      body: t
    }
  );
  if (n.status === 401)
    throw xi(), new nt("unauthorized", "this server needs an access token", null);
  if (!n.ok) {
    let o = `http${n.status}`, r = n.statusText;
    try {
      const s = await n.json();
      o = s?.error?.code ?? o, r = s?.error?.message ?? r;
    } catch {
    }
    throw new nt(o, r, null);
  }
  return await n.json();
}
const Hy = ["fill", "contain", "cover"], $c = 8;
function nf(e) {
  if (e.type !== "shape") return null;
  const t = e.shape;
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = t.kind;
    if (typeof n == "string") return n;
  }
  return null;
}
function Wy(e) {
  if (e.type !== "shape") return 0;
  const t = e.shape;
  if (t && typeof t == "object") {
    const n = t.cornerRadius;
    if (typeof n == "number") return n;
  }
  return 0;
}
const Uy = [
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
], Lc = [
  "brightness",
  "contrast",
  "saturation",
  "blur",
  "grain",
  "dropShadow"
];
function qy(e) {
  const t = (n) => {
    const o = e[n];
    return typeof o == "number" ? [{ name: n, value: o, kind: "number" }] : [];
  };
  switch (e.type) {
    case "brightness":
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
function Ky(e) {
  switch (e) {
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
async function Xy(e) {
  return (await Ee(
    `/api/projects/${encodeURIComponent(e)}/presets`
  )).presets;
}
function Yy(e) {
  const t = {
    opacity: e.opacity ?? 1,
    blendMode: e.blendMode ?? "normal",
    effects: e.effects ?? []
  };
  return e.type === "text" && (t.fontFamily = e.fontFamily, t.fontSize = e.fontSize, t.color = e.color ?? "#000000", t.align = e.align ?? "left", t.lineHeight = e.lineHeight ?? 1.2, t.paragraphSpacing = e.paragraphSpacing ?? 0), e.type === "shape" && (e.fill && (t.fill = e.fill), e.stroke && (t.stroke = e.stroke)), t;
}
async function Gy(e) {
  return Ee(`/api/projects/${encodeURIComponent(e)}/slots`);
}
async function Jy(e, t, n = 1) {
  return Ee(
    `/api/projects/${encodeURIComponent(e)}/variants`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ variants: t, scale: n })
    }
  );
}
function of(e, t) {
  return `/api/projects/${encodeURIComponent(e)}/exports/${encodeURIComponent(t)}.png`;
}
async function Zy() {
  return (await Ee("/api/fonts")).families;
}
function sa(e, t = "Aa Bb 0123") {
  return `/api/fonts/specimen.png?${new URLSearchParams({
    family: e.family,
    weight: String(e.weight),
    style: e.style,
    hash: e.hash,
    sample: t
  }).toString()}`;
}
async function Qy() {
  return (await Ee(
    "/catalogue-specimens/manifest.json"
  )).families;
}
async function eb() {
  const e = await Ee("/api/fonts");
  return { families: e.families ?? [], faces: e.faces ?? [] };
}
async function tb(e) {
  return Ee(
    `/api/fonts?filename=${encodeURIComponent(e.name)}`,
    {
      method: "POST",
      headers: { "content-type": e.type || "application/octet-stream" },
      body: e
    }
  );
}
async function nb(e) {
  return Ee(
    `/api/fonts/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function ob() {
  return Ee("/api/fonts/catalogue");
}
async function _c(e) {
  return Ee("/api/fonts/install", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ pack: e })
  });
}
function rb(e, t) {
  return `/api/projects/${encodeURIComponent(e)}/preview.svg?v=${t}`;
}
async function _o(e) {
  return URL.createObjectURL(await bs(e));
}
async function bs(e) {
  const t = await fetch(e);
  if (t.status === 401)
    throw xi(), new nt("unauthorized", "this server needs an access token", null);
  if (!t.ok) {
    let n = `http${t.status}`, o = t.statusText, r = null;
    try {
      const s = await t.json();
      s?.error && (n = s.error.code ?? n, o = s.error.message ?? o, r = s.error.details ?? null);
    } catch {
    }
    throw new nt(n, o, r);
  }
  return await t.blob();
}
function aa(e, t, n = 1, o) {
  const r = new URLSearchParams({ scale: String(n), v: String(t) });
  return o?.only?.length && r.set("only", o.only.join(",")), o?.exclude?.length && r.set("exclude", o.exclude.join(",")), `/api/projects/${encodeURIComponent(e)}/preview.png?${r.toString()}`;
}
async function rf(e, t, n) {
  const o = new URLSearchParams({ id: t, width: String(n) });
  return Ee(
    `/api/projects/${encodeURIComponent(e)}/text-layout?${o.toString()}`
  );
}
function He(e, t = null, n = 0, o = []) {
  for (const r of e)
    o.push({ layer: r, parent: t, depth: n }), r.type === "group" && He(r.children ?? [], r.id, n + 1, o);
  return o;
}
function zo(e) {
  return !e.protected && !e.readOnly && !e.locked;
}
function Or(e) {
  return e.protected ? "protected — no tool can change this layer" : e.readOnly ? "read-only — inspectable but never mutable" : e.locked ? "locked — unlock it to make changes" : null;
}
function zc(e) {
  return !e.includes("'") && !/[\r\n]/.test(e) ? `'${e}'` : JSON.stringify(e);
}
function sb(e) {
  const t = ["mcp", "--workspace", e.workspace], n = JSON.stringify(
    { mcpServers: { assemblash: { command: e.executable, args: t } } },
    null,
    2
  ), o = [
    "[mcp_servers.assemblash]",
    `command = ${zc(e.executable)}`,
    `args = [${t.map(zc).join(", ")}]`
  ].join(`
`);
  return [
    { id: "json", title: b("agents.jsonTitle"), hint: b("agents.jsonHint"), text: n },
    { id: "codex", title: b("agents.codexTitle"), hint: b("agents.codexHint"), text: o },
    { id: "url", title: b("agents.urlTitle"), hint: b("agents.urlHint"), text: e.mcpUrl }
  ];
}
async function ab(e) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(e);
    return;
  }
  const t = document.createElement("textarea");
  t.value = e, t.setAttribute("readonly", ""), t.style.position = "fixed", t.style.opacity = "0", document.body.append(t), t.select();
  const n = document.execCommand("copy");
  if (t.remove(), !n) throw new Error(b("agents.copyRefused"));
}
const Fc = "assemblash-agent-hint-v1";
function ib({
  host: e,
  controller: t
}) {
  _e();
  const [n, o] = d.useState(null), [r, s] = d.useState(!1), a = d.useRef(e);
  a.current = e, d.useEffect(() => (t.current = (c) => {
    o(c), s(!0);
  }, () => {
    t.current = null;
  }), [t]);
  const i = n === null ? [] : sb(n);
  return /* @__PURE__ */ l.jsxs(
    lt,
    {
      id: "agents-dialog",
      "data-state": r ? "open" : "closed",
      opened: r,
      onClose: () => s(!1),
      title: b("agents.dialogTitle"),
      centered: !0,
      size: "min(720px, calc(100vw - 2rem))",
      padding: "lg",
      trapFocus: !0,
      closeOnEscape: !0,
      returnFocus: !0,
      children: [
        /* @__PURE__ */ l.jsx(Gn, { align: "center", justify: "between", gap: "3", mb: "md", children: /* @__PURE__ */ l.jsxs("div", { children: [
          /* @__PURE__ */ l.jsx(ee, { component: "p", size: "xs", fw: 600, mb: 4, style: { letterSpacing: "0.08em" }, children: b("agents.protocol") }),
          /* @__PURE__ */ l.jsx(Bi, { order: 2, size: "h2", m: 0, children: b("agents.dialogTitle") })
        ] }) }),
        /* @__PURE__ */ l.jsx(ee, { component: "p", size: "sm", c: "dimmed", mb: "sm", children: b("agents.introLocal") }),
        /* @__PURE__ */ l.jsx(ee, { component: "p", size: "sm", c: "dimmed", mb: "md", children: b("agents.introConfig") }),
        /* @__PURE__ */ l.jsxs("p", { id: "agents-token", hidden: n?.tokenRequired !== !0, children: [
          b("agents.tokenBeforeCommand"),
          " ",
          /* @__PURE__ */ l.jsx("code", { children: "assemblash token show" }),
          " ",
          b("agents.tokenBetweenCommands"),
          " ",
          /* @__PURE__ */ l.jsx("code", { children: "Authorization: Bearer <token>" }),
          b("agents.tokenAfterCommand")
        ] }),
        /* @__PURE__ */ l.jsx(ve, { id: "agents-blocks", gap: "md", children: i.map((c) => /* @__PURE__ */ l.jsxs(ve, { component: "section", className: "agent-block", "data-block": c.id, gap: "xs", children: [
          /* @__PURE__ */ l.jsxs(Gn, { align: "center", justify: "between", gap: "md", my: "sm", children: [
            /* @__PURE__ */ l.jsx(Bi, { order: 3, size: "h4", m: 0, children: c.title }),
            /* @__PURE__ */ l.jsxs(
              ue,
              {
                size: "xs",
                variant: "light",
                className: "agent-copy",
                onClick: () => {
                  ab(c.text).then(
                    () => a.current.say(b("agents.copied", { title: c.title })),
                    (u) => a.current.say(
                      b("agents.copyError", { error: String(u) }),
                      "error"
                    )
                  );
                },
                children: [
                  /* @__PURE__ */ l.jsx("i", { className: "ph ph-copy", "aria-hidden": "true" }),
                  " ",
                  b("agents.copyButton")
                ]
              }
            )
          ] }),
          /* @__PURE__ */ l.jsx(ee, { component: "p", size: "xs", c: "dimmed", mb: "xs", children: c.hint }),
          /* @__PURE__ */ l.jsx("pre", { className: "agents-config", children: /* @__PURE__ */ l.jsx("code", { children: c.text }) })
        ] }, c.id)) }),
        /* @__PURE__ */ l.jsx(Gn, { justify: "flex-end", gap: "md", mt: "lg", children: /* @__PURE__ */ l.jsx(ue, { id: "agents-done", onClick: () => s(!1), children: b("common.done") }) })
      ]
    }
  );
}
function cb(e) {
  const t = document.createElement("div");
  t.dataset.island = "agents", document.body.append(t);
  const n = { current: null };
  We("agents", t, /* @__PURE__ */ l.jsx(ib, { host: e, controller: n }));
  async function o() {
    try {
      const s = await zy();
      n.current?.(s);
    } catch (s) {
      const a = s instanceof nt ? s.message : String(s);
      e.say(b("agents.openError", { error: a }), "error");
      return;
    }
  }
  function r() {
    let s = !1;
    try {
      s = window.localStorage.getItem(Fc) !== null, window.localStorage.setItem(Fc, "shown");
    } catch {
    }
    s || o();
  }
  return { open: o, offerOnFirstRun: r };
}
const lb = [
  { id: "png", label: "PNG", detail: b("export.pngDetail"), icon: "ph-image" },
  { id: "svg", label: "SVG", detail: b("export.svgDetail"), icon: "ph-file-svg" }
];
function ub(e, t, n, o) {
  return e === "svg" ? {
    url: rb(t, Ve(n)),
    filename: `${o}.svg`
  } : { url: of(t, o), filename: `${o}.png` };
}
const Bn = [
  {
    id: "original",
    label: b("export.original"),
    detail: b("export.documentSize"),
    longEdge: null,
    icon: "ph-frame-corners"
  },
  { id: "2k", label: "2K", detail: b("export.longEdge2k"), longEdge: 2048, icon: "ph-image" },
  { id: "4k", label: "4K", detail: b("export.longEdge4k"), longEdge: 3840, icon: "ph-image-square" },
  { id: "8k", label: b("export.resolution8k"), detail: b("export.longEdge8k"), longEdge: 7680, icon: "ph-sparkle" }
];
function gr(e, t) {
  const n = e.canvas.width, o = e.canvas.height, r = t.longEdge === null ? 1 : t.longEdge / Math.max(n, o);
  return {
    width: Math.max(1, Math.round(n * r)),
    height: Math.max(1, Math.round(o * r)),
    scale: r
  };
}
function db(e) {
  const t = window.document.getElementById(e);
  if (!t) throw new Error(`missing element #${e}`);
  return t;
}
function Bc(e) {
  return e.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "assemblash-export";
}
function fb(e) {
  return e < 1024 ? b("export.bytes", { count: ke(e) }) : e < 1024 * 1024 ? `${ke(Math.round(e / 102.4) / 10)} KB` : `${ke(Math.round(e / (1024 * 1024) * 10) / 10)} MB`;
}
function pb({ host: e, controller: t }) {
  const [n, o] = d.useState("png"), [r, s] = d.useState("8k"), [a, i] = d.useState("assemblash-export"), [c, u] = d.useState(""), [f, p] = d.useState(!1), [m, h] = d.useState(!1), [g, v] = d.useState(null);
  _e();
  const x = d.useRef(null), w = e.document(), k = n === "svg", C = Bn.find((S) => S.id === r) ?? Bn[0];
  function j() {
    x.current && URL.revokeObjectURL(x.current), x.current = null, v(null);
  }
  function N(S = n, y = r) {
    const R = e.document();
    if (!R) {
      u(b("export.noProject"));
      return;
    }
    const D = S === "svg" ? { width: R.canvas.width, height: R.canvas.height } : gr(R, Bn.find((O) => O.id === y) ?? Bn[0]);
    u(`${ke(D.width)} × ${ke(D.height)} ${b(S === "svg" ? "export.svgSummary" : "export.pngSummary")}`);
  }
  d.useEffect(() => {
    const S = () => {
      const y = e.document(), R = e.project();
      if (!y || !R) {
        e.say(b("export.projectRequired"), "error");
        return;
      }
      j(), i(Bc(y.name ?? R)), o("png"), s("8k");
      const D = gr(y, Bn.find((O) => O.id === "8k"));
      u(`${ke(D.width)} × ${ke(D.height)} ${b("export.pngSummary")}`), h(!0);
    };
    return t.current = S, window.addEventListener("assemblash:export-open", S), () => {
      window.removeEventListener("assemblash:export-open", S), t.current = null, x.current && URL.revokeObjectURL(x.current);
    };
  }, [t, e]);
  async function T(S) {
    if (S.preventDefault(), !S.currentTarget.reportValidity()) return;
    const y = e.project(), R = e.document();
    if (!y || !R) return;
    const D = n, O = D === "svg" ? { width: R.canvas.width, height: R.canvas.height, scale: 1 } : gr(R, C), z = Bc(a);
    i(z);
    const _ = ub(D, y, R, z);
    await e.guard(b("export.openButton"), async () => {
      j(), p(!0), u(b("export.renderingSize", { width: ke(O.width), height: ke(O.height) }));
      try {
        const F = D === "svg" ? { width: O.width, height: O.height, bytes: 0 } : await $y(y, z, O.scale), $ = await bs(_.url);
        x.current = URL.createObjectURL($), v({ url: x.current, filename: _.filename });
        const I = D === "svg" ? $.size : F.bytes;
        u(`${ke(F.width)} × ${ke(F.height)} ${b("export.ready", { format: D.toUpperCase(), size: fb(I) })}`), e.say(b("export.exported", { width: ke(F.width), height: ke(F.height), format: D.toUpperCase() }));
      } finally {
        p(!1);
      }
    });
  }
  return /* @__PURE__ */ l.jsx(lt, { id: "export-dialog", "data-state": m ? "open" : "closed", opened: m, onClose: () => {
    h(!1), j();
  }, title: null, withCloseButton: !1, centered: !0, size: "lg", withinPortal: !1, keepMounted: !0, children: /* @__PURE__ */ l.jsx("div", { className: "export-mantine-root", children: /* @__PURE__ */ l.jsx("form", { id: "export-form", onSubmit: (S) => {
    T(S);
  }, children: /* @__PURE__ */ l.jsxs(ve, { gap: "md", children: [
    /* @__PURE__ */ l.jsxs(Re, { justify: "space-between", align: "flex-start", children: [
      /* @__PURE__ */ l.jsxs("div", { children: [
        /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: b("export.eyebrow") }),
        /* @__PURE__ */ l.jsx(ee, { component: "h2", fw: 700, size: "lg", children: b("export.title") })
      ] }),
      /* @__PURE__ */ l.jsx(ue, { type: "button", variant: "subtle", "aria-label": b("common.close"), onClick: () => {
        h(!1), j();
      }, children: "×" })
    ] }),
    /* @__PURE__ */ l.jsxs(ve, { gap: "xs", children: [
      /* @__PURE__ */ l.jsx(ee, { fw: 600, children: b("export.format") }),
      /* @__PURE__ */ l.jsx(Re, { id: "export-formats", role: "radiogroup", "aria-label": b("export.format"), grow: !0, children: lb.map((S) => /* @__PURE__ */ l.jsx(Qn, { component: "button", type: "button", "data-format": S.id, role: "radio", "aria-checked": n === S.id, withBorder: !0, p: "sm", bg: n === S.id ? "red.0" : void 0, style: { cursor: "pointer", textAlign: "left" }, onClick: () => {
        n !== S.id && (j(), o(S.id), N(S.id));
      }, children: /* @__PURE__ */ l.jsxs(ve, { gap: 4, children: [
        /* @__PURE__ */ l.jsxs(Re, { gap: "xs", children: [
          /* @__PURE__ */ l.jsx("i", { className: `ph ${S.icon}`, "aria-hidden": "true" }),
          /* @__PURE__ */ l.jsx("b", { children: S.label })
        ] }),
        /* @__PURE__ */ l.jsx(ee, { size: "sm", children: b(S.id === "png" ? "export.pngDetail" : "export.svgDetail") })
      ] }) }, S.id)) })
    ] }),
    /* @__PURE__ */ l.jsxs(ve, { id: "export-resolution-row", "aria-disabled": k, gap: "xs", children: [
      /* @__PURE__ */ l.jsx(ee, { fw: 600, children: b("export.resolution") }),
      /* @__PURE__ */ l.jsx(Re, { id: "export-options", role: "radiogroup", "aria-label": b("export.resolution"), "aria-disabled": k, grow: !0, children: Bn.map((S) => {
        const y = w ? gr(w, S) : null;
        return /* @__PURE__ */ l.jsx(Qn, { component: "button", type: "button", disabled: k, role: "radio", "aria-checked": r === S.id && !k, withBorder: !0, p: "sm", bg: r === S.id && !k ? "red.0" : void 0, style: { cursor: k ? "not-allowed" : "pointer", textAlign: "left" }, onClick: () => {
          s(S.id), j(), N(n, S.id);
        }, children: /* @__PURE__ */ l.jsxs(ve, { gap: 4, children: [
          /* @__PURE__ */ l.jsxs(Re, { gap: "xs", children: [
            /* @__PURE__ */ l.jsx("i", { className: `ph ${S.icon}`, "aria-hidden": "true" }),
            /* @__PURE__ */ l.jsx("b", { children: S.id === "original" ? b("export.original") : S.id === "8k" ? b("export.resolution8k") : S.label })
          ] }),
          /* @__PURE__ */ l.jsx(ee, { size: "sm", children: y ? `${ke(y.width)} × ${ke(y.height)}` : b(S.id === "original" ? "export.documentSize" : `export.longEdge${S.id}`) })
        ] }) }, S.id);
      }) })
    ] }),
    /* @__PURE__ */ l.jsx(ct, { id: "export-name", label: b("export.fileName"), value: a, onChange: (S) => i(S.currentTarget.value), pattern: "[A-Za-z0-9_-]+", maxLength: 60, required: !0 }),
    /* @__PURE__ */ l.jsx(ee, { id: "export-summary", "aria-live": "polite", fw: 500, children: c }),
    /* @__PURE__ */ l.jsxs(Re, { justify: "flex-end", children: [
      /* @__PURE__ */ l.jsxs(ue, { id: "export-download", component: "a", href: g?.url ?? "#", download: g?.filename, hidden: !g, variant: "default", children: [
        /* @__PURE__ */ l.jsx("i", { className: "ph ph-download-simple", "aria-hidden": "true" }),
        " ",
        b("common.download")
      ] }),
      /* @__PURE__ */ l.jsx(ue, { id: "export-cancel", type: "button", variant: "default", onClick: () => {
        h(!1), j();
      }, children: b("common.cancel") }),
      /* @__PURE__ */ l.jsxs(ue, { id: "export-confirm", type: "submit", loading: f, value: "default", children: [
        /* @__PURE__ */ l.jsx("i", { className: `ph ${f ? "ph-circle-notch" : "ph-export"}`, "aria-hidden": "true" }),
        " ",
        f ? b("export.rendering") : b("export.confirm", { format: n.toUpperCase() })
      ] })
    ] })
  ] }) }) }) });
}
function mb(e) {
  const t = db("export-dialog-mount"), n = { current: null };
  return We("export", t, /* @__PURE__ */ l.jsx(pb, { host: e, controller: n })), { open: () => {
    n.current ? n.current() : queueMicrotask(() => n.current?.());
  } };
}
function Vc(e, t, n) {
  const o = n * Math.PI / 180, r = Math.sin(o), s = Math.cos(o);
  return { x: e * s - t * r, y: e * r + t * s };
}
function ia(e) {
  const t = e.rotation * Math.PI / 180, n = Math.abs(Math.sin(t)), o = Math.abs(Math.cos(t)), r = e.width * o + e.height * n, s = e.width * n + e.height * o, a = e.x + e.width / 2, i = e.y + e.height / 2;
  return {
    x: a - r / 2,
    y: i - s / 2,
    width: r,
    height: s
  };
}
function Ci(e) {
  if (e.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  const t = e.map(ia), n = Math.min(...t.map((a) => a.x)), o = Math.min(...t.map((a) => a.y)), r = Math.max(...t.map((a) => a.x + a.width)), s = Math.max(...t.map((a) => a.y + a.height));
  return { x: n, y: o, width: r - n, height: s - o };
}
function ca(e, t, n, o) {
  let { x: r, y: s, width: a, height: i } = e;
  if (t.includes("e") && (a = Math.max(1, a + n)), t.includes("s") && (i = Math.max(1, i + o)), t.includes("w")) {
    const c = Math.max(1, a - n);
    r += a - c, a = c;
  }
  if (t.includes("n")) {
    const c = Math.max(1, i - o);
    s += i - c, i = c;
  }
  return { x: r, y: s, width: a, height: i };
}
function hb(e, t, n, o, r) {
  if (t === 0) return ca(e, n, o, r);
  const s = Vc(o, r, -t), a = ca(
    { x: 0, y: 0, width: e.width, height: e.height },
    n,
    s.x,
    s.y
  ), i = {
    x: a.x + a.width / 2 - e.width / 2,
    y: a.y + a.height / 2 - e.height / 2
  }, c = Vc(i.x, i.y, t), u = e.x + e.width / 2 + c.x, f = e.y + e.height / 2 + c.y;
  return {
    x: u - a.width / 2,
    y: f - a.height / 2,
    width: a.width,
    height: a.height
  };
}
function gb(e, t) {
  const n = e.width ?? 0, o = e.height ?? 0;
  if (!(n > 0) || !(o > 0)) return { width: 300, height: 200 };
  const r = Math.min(t.width / n, t.height / o, 1);
  return {
    width: Math.max(1, Math.round(n * r)),
    height: Math.max(1, Math.round(o * r))
  };
}
function sf(e, t, n) {
  const o = n.width / Math.max(1, t.width), r = n.height / Math.max(1, t.height), s = n.x + (e.x + e.width / 2 - t.x) * o, a = n.y + (e.y + e.height / 2 - t.y) * r, i = Math.max(1, e.width * o), c = Math.max(1, e.height * r);
  return {
    x: s - i / 2,
    y: a - c / 2,
    width: i,
    height: c
  };
}
const vb = "Aa Bb 0123", Vn = /* @__PURE__ */ new Map(), la = /* @__PURE__ */ new WeakMap(), ua = /* @__PURE__ */ new WeakSet();
function yb(e) {
  let t = Vn.get(e);
  if (!t && (t = bs(e).catch((n) => {
    throw Vn.delete(e), n;
  }), Vn.set(e, t), Vn.size > 64)) {
    const n = Vn.keys().next().value;
    n && Vn.delete(n);
  }
  return t;
}
function da(e) {
  for (const t of e.querySelectorAll("img[data-font-specimen]")) {
    const n = la.get(t);
    n && URL.revokeObjectURL(n), la.delete(t), ua.add(t), t.removeAttribute("src");
  }
}
function bb(e, t, n) {
  const o = window.document.createElement("span");
  o.className = "font-specimen";
  const r = window.document.createElement("img");
  r.className = "font-specimen-image", r.dataset.fontSpecimen = "", r.alt = "", r.setAttribute("aria-hidden", "true");
  const s = window.document.createElement("span");
  s.className = "font-specimen-status", s.hidden = !0, o.append(r, s), e.append(o), yb(t).then((a) => {
    if (!r.isConnected || ua.has(r)) return;
    const i = URL.createObjectURL(a);
    la.set(r, i), r.src = i, s.hidden = !0;
  }).catch(() => {
    !r.isConnected || ua.has(r) || (s.textContent = b(n), s.hidden = !1);
  });
}
function xb(e) {
  return e.find((t) => t.weight === 400 && t.style === "normal") ?? e.find((t) => t.style === "normal") ?? e[0] ?? null;
}
function af(e, t, n = vb) {
  bb(e, sa(t, n), "fonts.previewUnavailable");
}
function cf(e, t) {
  return t.filter((n) => n.family === e).sort((n, o) => n.weight - o.weight);
}
let wb = 0;
function Sb({ host: e, value: t, disabled: n, label: o, onCommit: r }) {
  const s = d.useMemo(() => ({ initialFamily: t, initialDisabled: n }), []);
  return d.useEffect(() => {
    s.setFamily?.(t), s.setDisabled?.(n);
  }, [s, t, n]), s.label = o, /* @__PURE__ */ l.jsx("span", { className: "font-selector", children: /* @__PURE__ */ l.jsx(lf, { host: e, actions: s, onCommit: r }) });
}
let Cb = 0;
function jb(e, t) {
  const n = e.trim().toLowerCase();
  return n ? t.families.find((o) => o.toLowerCase() === n) ?? null : null;
}
function kb({
  family: e,
  face: t,
  active: n,
  selected: o,
  id: r,
  onMouseDown: s
}) {
  const a = d.useRef(null);
  return d.useLayoutEffect(() => {
    const i = a.current;
    if (i)
      return t && af(i, t), () => da(i);
  }, [t]), /* @__PURE__ */ l.jsx("li", { ref: a, id: r, "data-family": e, className: n ? "active" : void 0, "aria-selected": o, onMouseDown: s, children: /* @__PURE__ */ l.jsxs(we.Option, { value: e, active: n, selected: o, children: [
    /* @__PURE__ */ l.jsx("span", { className: "font-selector-family", children: e }),
    /* @__PURE__ */ l.jsx(ee, { component: "span", size: "xs", c: "dimmed", className: "font-selector-faces", children: t ? `${t.style === "italic" ? b("fonts.styleItalic") : b("fonts.styleNormal")} ${ke(t.weight)}` : b("fonts.facesUnknown") }),
    !t && /* @__PURE__ */ l.jsx("span", { className: "font-specimen-status", children: b("fonts.previewUnavailable") })
  ] }) });
}
function lf({
  host: e,
  onCommit: t,
  actions: n
}) {
  _e();
  const [o, r] = d.useState(n.initialFamily), [s, a] = d.useState(!1), [i, c] = d.useState(n.initialDisabled), [u, f] = d.useState(-1), p = d.useRef(null), m = d.useRef(""), h = d.useMemo(() => `font-selector-options-${++Cb}`, []), g = ti({
    loop: !0,
    onDropdownClose: () => f(-1)
  }), v = e.store(), x = o.trim().toLowerCase(), w = x ? v.families.filter((y) => y.toLowerCase().includes(x)) : v.families, k = d.useCallback(() => {
    g.closeDropdown(), f(-1);
  }, [g]), C = d.useCallback((y) => {
    m.current = y, r(y), a(!1), k(), p.current?.blur(), t(y);
  }, [k, t]), j = d.useCallback(() => {
    k();
    const y = p.current?.value.trim() ?? "";
    if (!y || y.toLowerCase() === m.current.toLowerCase()) return;
    const R = jb(y, e.store());
    if (!R) {
      a(!0);
      return;
    }
    m.current = R, r(R), a(!1), t(R);
  }, [k, e, t]), N = d.useCallback(() => {
    r(p.current?.value ?? ""), a(!1), f(-1), g.openDropdown();
  }, [g]), T = d.useCallback((y) => {
    p.current = y, y && (y.onfocus = () => Ft.flushSync(() => N()), y.onblur = j, y.oninput = () => {
      Ft.flushSync(() => {
        r(y.value), a(!1), f(-1), g.openDropdown();
      });
    }, y.onkeydown = (R) => Ft.flushSync(() => S(R)));
  }, [n, j, N, S]);
  n.setFamily = (y) => {
    m.current = y, r(y), a(!1);
  }, n.setDisabled = (y) => {
    c(y), y && k();
  };
  function S(y) {
    if (y.key === "ArrowDown" || y.key === "ArrowUp") {
      y.preventDefault(), g.dropdownOpened || g.openDropdown(), w.length && f((R) => {
        const D = y.key === "ArrowDown" ? 1 : -1;
        return (R + D + w.length) % w.length;
      });
      return;
    }
    if (y.key === "Enter" && g.dropdownOpened && u >= 0) {
      const R = w[u];
      R && (y.preventDefault(), C(R));
      return;
    }
    y.key === "Escape" && g.dropdownOpened && (y.preventDefault(), y.stopPropagation(), k());
  }
  return d.useLayoutEffect(() => {
    u < 0 || document.getElementById(`${h}-${u}`)?.scrollIntoView({ block: "nearest" });
  }, [u, h]), /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
    /* @__PURE__ */ l.jsxs(
      we,
      {
        store: g,
        onOptionSubmit: C,
        position: "bottom-start",
        offset: 4,
        withinPortal: !1,
        floatingStrategy: "fixed",
        shadow: "md",
        onDismiss: () => k(),
        children: [
          /* @__PURE__ */ l.jsx(we.Target, { withKeyboardNavigation: !1, withAriaAttributes: !1, children: /* @__PURE__ */ l.jsx(
            ct,
            {
              ref: T,
              value: o,
              autoComplete: "off",
              disabled: i,
              role: "combobox",
              "aria-autocomplete": "list",
              "aria-label": n.label ?? b("editor.fontFamily"),
              "aria-expanded": g.dropdownOpened,
              "aria-controls": h,
              "aria-activedescendant": u >= 0 ? `${h}-${u}` : void 0,
              onChange: (y) => {
                r(y.currentTarget.value), a(!1), f(-1), g.openDropdown();
              }
            }
          ) }),
          /* @__PURE__ */ l.jsxs(
            we.Dropdown,
            {
              className: "font-selector-list",
              hidden: !g.dropdownOpened,
              "aria-labelledby": `${h}-heading`,
              children: [
                /* @__PURE__ */ l.jsx(ee, { component: "p", size: "xs", fw: 700, c: "dimmed", id: `${h}-heading`, className: "font-selector-heading", "data-i18n": "fonts.selectorHeading", children: b("fonts.selectorHeading") }),
                /* @__PURE__ */ l.jsxs(we.Options, { id: h, role: "listbox", children: [
                  w.map((y, R) => {
                    const D = cf(y, v.faces);
                    return /* @__PURE__ */ l.jsx(
                      kb,
                      {
                        id: `${h}-${R}`,
                        family: y,
                        face: xb(D),
                        active: R === u,
                        selected: R === u,
                        onMouseDown: (O) => {
                          O.preventDefault(), C(y);
                        }
                      },
                      y
                    );
                  }),
                  w.length === 0 && /* @__PURE__ */ l.jsx(we.Empty, { className: "font-selector-none", children: /* @__PURE__ */ l.jsx(ee, { component: "span", size: "xs", c: "dimmed", "data-i18n": "fonts.noFamilyMatches", children: b("fonts.noFamilyMatches") }) })
                ] })
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ l.jsx(ee, { component: "p", size: "xs", c: "dimmed", className: "font-selector-message", "data-i18n": "fonts.notInstalled", hidden: !s, children: b("fonts.notInstalled") })
  ] });
}
function Eb(e, t) {
  const n = window.document.createElement("span");
  n.className = "font-selector";
  const o = {
    initialFamily: "",
    initialDisabled: !1
  }, r = We(
    `font-selector-${++wb}`,
    n,
    /* @__PURE__ */ l.jsx(lf, { host: e, onCommit: t, actions: o })
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
const Hc = "Aa Bb 0123";
function wo(e) {
  if (e.length <= 1) return e[0] ?? "";
  const t = Ra();
  return new Intl.ListFormat(t === "pseudo" ? "en" : t, {
    style: "long",
    type: "conjunction"
  }).format(e);
}
function Wc(e) {
  const t = e / 1048576;
  return t >= 10 ? `${ke(Math.round(t))} MB` : `${ke(Math.max(0.1, Math.round(t * 10) / 10))} MB`;
}
const Hn = /* @__PURE__ */ new Map();
function Rb(e) {
  let t = Hn.get(e);
  if (!t && (t = bs(e).catch((n) => {
    throw Hn.delete(e), n;
  }), Hn.set(e, t), Hn.size > 64)) {
    const n = Hn.keys().next().value;
    n && Hn.delete(n);
  }
  return t;
}
function Uc({
  url: e,
  unavailable: t,
  generation: n
}) {
  const [o, r] = d.useState(""), [s, a] = d.useState(!1);
  return d.useEffect(() => {
    let i = !0, c = "";
    return r(""), a(!1), Rb(e).then((u) => {
      i && (c = URL.createObjectURL(u), r(c));
    }).catch(() => {
      i && a(!0);
    }), () => {
      i = !1, c && URL.revokeObjectURL(c);
    };
  }, [e, n]), /* @__PURE__ */ l.jsxs("span", { className: "font-specimen", children: [
    /* @__PURE__ */ l.jsx(
      "img",
      {
        className: "font-specimen-image",
        "data-font-specimen": "",
        src: o || void 0,
        alt: "",
        "aria-hidden": "true"
      }
    ),
    /* @__PURE__ */ l.jsx("span", { className: "font-specimen-status", hidden: !s, children: b(t) })
  ] });
}
function Nb({ host: e, controller: t }) {
  const [n, o] = d.useState([]), [r, s] = d.useState([]), [a, i] = d.useState(Hc), [c, u] = d.useState(Hc), [f, p] = d.useState([]), [m, h] = d.useState(null), [g, v] = d.useState({}), [x, w] = d.useState(!1), [k, C] = d.useState(""), [j, N] = d.useState(!1), [T, S] = d.useState(0), [y, R] = d.useState(null), D = _e(), [O, z] = d.useState(!0), _ = d.useRef(n), F = d.useRef(null), $ = d.useRef(null), I = d.useRef(void 0);
  _.current = n;
  const L = d.useCallback((q, K) => {
    _.current = q, o(q), s(K), e.fontsChanged({ families: q, faces: K });
  }, [e]), M = d.useCallback(async () => {
    z(!0);
    const q = await eb();
    L([...q.families], [...q.faces]);
  }, [L]);
  d.useLayoutEffect(() => (t.reload = M, t.focusInstall = () => F.current?.focus(), t.hasFamilies = () => _.current.length > 0, t.releaseSamples = () => {
    z(!1), S((q) => q + 1);
  }, M(), () => {
    window.clearTimeout(I.current), t.reload = async () => {
    }, t.focusInstall = () => {
    }, t.hasFamilies = () => !1, t.releaseSamples = () => {
    };
  }), [t, M]);
  const P = d.useCallback(async () => {
    if (m) return m;
    const q = await ob();
    return h(q), q;
  }, [m]);
  d.useEffect(() => {
    P().catch(() => h(null));
  }, [P]);
  const B = d.useCallback(async () => {
    try {
      const q = await P(), K = q.packs.default ?? [], ce = q.families.filter((be) => K.includes(be.family)).reduce((be, pe) => be + pe.bytes, 0);
      C(K.length ? b("fonts.defaultPackDescription", { names: wo(K), bytes: Wc(ce) }) : b("fonts.noDefaultPack")), N(!1);
    } catch (q) {
      C(q instanceof nt ? b("fonts.packDescribeErrorCode", { error: q.message, code: q.code }) : b("fonts.packDescribeError")), N(!0);
    }
  }, [P]);
  d.useEffect(() => {
    n.length || B();
  }, [n.length, B]), d.useEffect(() => {
    let q = !0;
    return Qy().then((K) => {
      q && v(K);
    }).catch(() => {
      q && v({});
    }), () => {
      q = !1;
    };
  }, []);
  const W = d.useCallback(async () => {
    e.project() && await e.refresh();
  }, [e]), U = async () => {
    await e.guard(b("fonts.installFonts"), async () => {
      w(!0), e.say(b("fonts.downloadingDefault"));
      try {
        const q = await _c("default");
        await M(), await W(), e.say(b("fonts.installedFamilies", { names: wo(q.families) }));
      } finally {
        w(!1);
      }
    });
  }, Y = (q) => {
    e.guard(b("fonts.installNamedPack", { pack: q }), async () => {
      try {
        await _c(q), await M(), await W(), e.say(b("fonts.installedNamedPack", { pack: q }));
      } finally {
        S((K) => K + 1);
      }
    });
  }, ae = (q) => {
    const K = [...q ?? []];
    $.current && ($.current.value = ""), K.length && e.guard(b("fonts.importFont"), async () => {
      p([]);
      let ce = 0;
      const be = [];
      for (const Se of K)
        try {
          const ne = await tb(Se);
          ce += 1;
          const H = [...new Set(ne.imported.map((V) => V.family))];
          be.push(H.length ? `${Se.name} → ${wo(H)}` : b("fonts.importedFile", { file: Se.name }));
        } catch (ne) {
          be.push(ne instanceof nt ? `${Se.name}: ${ne.message} (${ne.code})` : `${Se.name}: ${String(ne)}`);
        }
      p(be), await M(), ce && await W();
      const pe = K.length - ce;
      ce ? e.say(At("fonts.importResult", ce, {
        refused: pe ? At("fonts.refusedCount", pe) : ""
      })) : e.say(b("fonts.noneImported", { refused: At("fonts.refusedCount", pe) }), "error");
    });
  }, fe = (q) => {
    window.confirm(b("fonts.confirmRemove", { family: q })) && e.guard(b("fonts.removeAction", { family: q }), async () => {
      p([]);
      const K = await nb(q);
      p([At("fonts.removedFiles", K.removed, { family: q })]), await M(), await W(), e.say(b("fonts.removedFromStore", { family: q }));
    });
  }, ie = (q) => {
    u(q), window.clearTimeout(I.current), I.current = window.setTimeout(() => {
      const K = q.trim();
      !K || [...K].some((ce) => /[\u0000-\u001f\u007f]/u.test(ce)) || i(K);
    }, 180);
  }, te = m ? ["text", "display", "mono", ...Object.keys(m.packs).filter((q) => !["default", "text", "display", "mono"].includes(q)).sort()] : [], me = n.length === 0;
  return /* @__PURE__ */ l.jsxs(ve, { gap: "md", "data-testid": "font-manager", children: [
    /* @__PURE__ */ l.jsx(Q, { id: "font-empty", "data-testid": "font-empty", hidden: !me, children: /* @__PURE__ */ l.jsxs(ve, { gap: "sm", children: [
      /* @__PURE__ */ l.jsx(ee, { component: "p", size: "sm", children: b("fonts.noneInstalled") }),
      /* @__PURE__ */ l.jsx(ee, { component: "p", className: "font-install-copy", size: "sm", c: "dimmed", children: b("fonts.defaultPackCopy") }),
      /* @__PURE__ */ l.jsx(
        ue,
        {
          id: "install-default",
          "data-testid": "install-default",
          ref: F,
          disabled: x || m !== null && (m.packs.default ?? []).length === 0,
          onClick: () => {
            U();
          },
          children: /* @__PURE__ */ l.jsxs(ve, { gap: 2, children: [
            /* @__PURE__ */ l.jsx("span", { id: "install-default-label", children: x ? b("fonts.installingDefault") : b("fonts.installDefaultPack") }),
            /* @__PURE__ */ l.jsx(ee, { id: "install-default-detail", component: "span", size: "xs", c: j ? "red" : void 0, children: k })
          ] })
        }
      )
    ] }) }),
    /* @__PURE__ */ l.jsx(
      ct,
      {
        className: "font-sample-field",
        ref: (q) => {
          q && (q.oninput = () => ie(q.value));
        },
        "data-testid": "font-sample",
        label: b("fonts.customSample"),
        "aria-label": b("fonts.customSample"),
        value: c,
        maxLength: 64,
        hidden: me,
        onChange: (q) => ie(q.currentTarget.value)
      }
    ),
    /* @__PURE__ */ l.jsx("ul", { id: "font-list", "data-testid": "font-list", className: "font-list", hidden: me, children: n.map((q) => {
      const K = r.filter((pe) => pe.family === q), ce = K.map(
        (pe) => `${pe.style === "italic" ? b("fonts.styleItalic") : b("fonts.styleNormal")} ${ke(pe.weight)}`
      ).join(", "), be = K.find((pe) => pe.weight === 400 && pe.style === "normal") ?? K.find((pe) => pe.style === "normal") ?? K[0];
      return /* @__PURE__ */ l.jsxs("li", { className: "font-family", "data-family": q, children: [
        /* @__PURE__ */ l.jsxs(Re, { justify: "space-between", align: "center", wrap: "nowrap", children: [
          /* @__PURE__ */ l.jsxs("div", { className: "font-family-text", children: [
            /* @__PURE__ */ l.jsx("strong", { children: q }),
            /* @__PURE__ */ l.jsx("span", { className: "font-faces", children: At("fonts.faceCount", K.length, { described: ce }) })
          ] }),
          /* @__PURE__ */ l.jsx(
            ue,
            {
              size: "xs",
              color: "red",
              variant: "light",
              className: "small danger-action",
              "data-remove-family": q,
              "data-testid": `remove-font-${q}`,
              "aria-label": b("fonts.removeFamily", { family: q }),
              onClick: () => fe(q),
              children: b("fonts.removeButton")
            }
          )
        ] }),
        O && be ? /* @__PURE__ */ l.jsx(
          Uc,
          {
            url: sa(be, a),
            unavailable: "fonts.previewUnavailable",
            generation: T + D
          }
        ) : O ? /* @__PURE__ */ l.jsx("span", { className: "font-specimen-status", children: b("fonts.previewUnavailable") }) : null
      ] }, q);
    }) }),
    /* @__PURE__ */ l.jsx(
      Te,
      {
        id: "font-pack-section",
        "data-testid": "font-pack-section",
        className: "font-pack-section",
        hidden: te.length === 0,
        value: y,
        onChange: R,
        keepMounted: !0,
        keepMountedMode: "display-none",
        children: /* @__PURE__ */ l.jsxs(Te.Item, { value: "packs", children: [
          /* @__PURE__ */ l.jsx(Te.Control, { children: b("fonts.morePacks") }),
          /* @__PURE__ */ l.jsx(Te.Panel, { children: /* @__PURE__ */ l.jsx(ve, { id: "font-pack-options", "data-testid": "font-pack-options", className: "font-pack-options", gap: "sm", children: te.map((q) => {
            const K = m?.packs[q] ?? [], ce = K.filter((pe) => !n.includes(pe)), be = m?.families.filter((pe) => ce.includes(pe.family)).reduce((pe, Se) => pe + Se.bytes, 0) ?? 0;
            return /* @__PURE__ */ l.jsx(
              ue,
              {
                "data-pack": q,
                "data-testid": `font-pack-${q}`,
                className: "font-pack-button",
                variant: "default",
                disabled: ce.length === 0,
                onClick: () => Y(q),
                children: /* @__PURE__ */ l.jsxs(ve, { gap: "xs", align: "stretch", children: [
                  /* @__PURE__ */ l.jsx("strong", { children: b("fonts.namedPackTitle", { pack: q }) }),
                  /* @__PURE__ */ l.jsx(ee, { component: "span", size: "xs", c: "dimmed", children: ce.length ? b("fonts.namedPackDownload", { names: wo(K), bytes: Wc(be) }) : b("fonts.namedPackInstalled", { names: wo(K) }) }),
                  /* @__PURE__ */ l.jsx(Re, { gap: "xs", wrap: "wrap", className: "font-pack-samples", children: K.map((pe) => {
                    const Se = r.filter((V) => V.family === pe).find((V) => V.weight === 400 && V.style === "normal") ?? r.find((V) => V.family === pe), ne = g[pe], H = Se ? sa(Se) : ne ? `/catalogue-specimens/${ne.src.replace(/^\.\//u, "")}` : null;
                    return /* @__PURE__ */ l.jsxs("span", { className: "font-pack-family", children: [
                      /* @__PURE__ */ l.jsx(ee, { component: "span", size: "xs", fw: 700, className: "font-pack-family-name", children: pe }),
                      O && H ? /* @__PURE__ */ l.jsx(
                        Uc,
                        {
                          url: H,
                          unavailable: Se ? "fonts.previewUnavailable" : "fonts.cataloguePreviewUnavailable",
                          generation: T + D
                        }
                      ) : H ? null : /* @__PURE__ */ l.jsx("span", { className: "font-specimen-status", children: b("fonts.cataloguePreviewUnavailable") })
                    ] }, pe);
                  }) })
                ] })
              },
              q
            );
          }) }) })
        ] })
      }
    ),
    /* @__PURE__ */ l.jsx(
      ue,
      {
        id: "import-font",
        "data-testid": "import-font",
        variant: "default",
        leftSection: /* @__PURE__ */ l.jsx("i", { className: "ph ph-upload-simple", "aria-hidden": "true" }),
        onClick: () => $.current?.click(),
        children: b("fonts.importFile")
      }
    ),
    /* @__PURE__ */ l.jsx(
      "input",
      {
        id: "font-file",
        ref: $,
        type: "file",
        accept: ".ttf,.otf,.ttc,.otc,.woff,.woff2",
        multiple: !0,
        hidden: !0,
        onChange: (q) => ae(q.currentTarget.files)
      }
    ),
    /* @__PURE__ */ l.jsx("div", { id: "font-feedback", "data-testid": "font-feedback", className: "font-feedback", "aria-live": "polite", children: f.map((q, K) => /* @__PURE__ */ l.jsx("p", { children: q }, `${K}-${q}`)) })
  ] });
}
function Tb(e, t) {
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
  return We("font-manager", t, /* @__PURE__ */ l.jsx(Nb, { host: e, controller: n })), {
    reload: () => n.reload(),
    focusInstall: () => n.focusInstall(),
    hasFamilies: () => n.hasFamilies(),
    releaseSamples: () => n.releaseSamples()
  };
}
class Pb {
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
const Ab = [
  { size: "1080x1080", width: 1080, height: 1080, label: "common.square" },
  { size: "1920x1080", width: 1920, height: 1080, label: "common.landscape" },
  { size: "1080x1350", width: 1080, height: 1350, label: "common.portrait" },
  { size: "1080x1920", width: 1080, height: 1920, label: "common.story" }
];
function Mb({
  host: e,
  controller: t
}) {
  const [n, o] = d.useState(!1), [r, s] = d.useState(""), [a, i] = d.useState(1080), [c, u] = d.useState(1080), [f, p] = d.useState("#ffffff"), [m, h] = d.useState("1080x1080"), [g, v] = d.useState(!1);
  _e(), d.useEffect(() => (t.current = () => {
    s(""), i(1080), u(1080), p("#ffffff"), h("1080x1080"), o(!0);
  }, () => {
    t.current = null;
  }), [t]);
  async function x(w) {
    w.preventDefault();
    const k = r.trim(), C = Number(a), j = Number(c);
    if (!(!k || !Number.isFinite(C) || !Number.isFinite(j)) && !(C <= 0 || j <= 0 || g)) {
      v(!0);
      try {
        await e.create(k, C, j, f) && o(!1);
      } finally {
        v(!1);
      }
    }
  }
  return /* @__PURE__ */ l.jsx(
    lt,
    {
      id: "new-project-dialog",
      "data-state": n ? "open" : "closed",
      opened: n,
      onClose: () => o(!1),
      title: b("dialogs.newProjectTitle"),
      centered: !0,
      size: "lg",
      children: /* @__PURE__ */ l.jsx("form", { id: "new-project-form", onSubmit: (w) => {
        x(w);
      }, children: /* @__PURE__ */ l.jsxs(ve, { gap: "md", children: [
        /* @__PURE__ */ l.jsx(
          ct,
          {
            id: "new-project-name",
            label: b("common.name"),
            placeholder: b("dialogs.projectNamePlaceholder"),
            value: r,
            onChange: (w) => s(w.currentTarget.value),
            autoComplete: "off",
            required: !0,
            "data-autofocus": !0
          }
        ),
        /* @__PURE__ */ l.jsxs(ve, { gap: "xs", children: [
          /* @__PURE__ */ l.jsx(ee, { fw: 600, children: b("canvas.label") }),
          /* @__PURE__ */ l.jsx(ja, { id: "canvas-presets", cols: { base: 2, sm: 4 }, children: Ab.map((w) => /* @__PURE__ */ l.jsx(
            ue,
            {
              type: "button",
              "data-size": w.size,
              variant: m === w.size ? "light" : "default",
              onClick: () => {
                i(w.width), u(w.height), h(w.size);
              },
              children: b(w.label)
            },
            w.size
          )) })
        ] }),
        /* @__PURE__ */ l.jsxs(Re, { grow: !0, align: "start", children: [
          /* @__PURE__ */ l.jsx(
            $o,
            {
              id: "new-project-width",
              label: b("common.width"),
              value: a,
              onChange: (w) => {
                i(w), h("");
              },
              min: 1,
              allowDecimal: !1,
              required: !0
            }
          ),
          /* @__PURE__ */ l.jsx(
            $o,
            {
              id: "new-project-height",
              label: b("common.height"),
              value: c,
              onChange: (w) => {
                u(w), h("");
              },
              min: 1,
              allowDecimal: !1,
              required: !0
            }
          ),
          /* @__PURE__ */ l.jsx(
            Jo,
            {
              id: "new-project-background",
              label: b("common.background"),
              value: f,
              onChange: p,
              format: "hex",
              required: !0
            }
          )
        ] }),
        /* @__PURE__ */ l.jsxs(Re, { justify: "flex-end", children: [
          /* @__PURE__ */ l.jsx(ue, { id: "new-project-cancel", type: "button", variant: "default", onClick: () => o(!1), children: b("common.cancel") }),
          /* @__PURE__ */ l.jsx(ue, { id: "create-project-confirm", type: "submit", loading: g, children: b("dialogs.createProject") })
        ] })
      ] }) })
    }
  );
}
function Ib(e) {
  const t = document.getElementById("new-project-dialog-mount");
  if (!t) throw new Error("missing element #new-project-dialog-mount");
  const n = { current: null };
  return We("project-create", t, /* @__PURE__ */ l.jsx(Mb, { host: e, controller: n })), { open: () => n.current?.() };
}
function Db({ controller: e }) {
  const [t, n] = d.useState(null), [o, r] = d.useState(!1);
  _e();
  const [s, a] = d.useState(""), i = d.useRef(null), c = d.useRef(null), u = d.useRef(null), f = d.useCallback(() => {
    r(!1), n(null), a("");
  }, []), p = d.useCallback((h) => {
    h.preventDefault();
    const g = i.current;
    if (!g?.reportValidity()) return;
    const v = g.value.trim();
    if (!v) return;
    const x = t?.submit;
    f(), x?.(v);
  }, [f, t]), m = d.useCallback((h) => {
    n(h), a(""), r(!0);
  }, []);
  return e.open = m, /* @__PURE__ */ l.jsxs(
    lt,
    {
      id: "name-dialog",
      "data-state": o ? "open" : "closed",
      opened: o,
      onClose: f,
      title: t ? b(t.titleKey) : b("dialogs.nameItem"),
      centered: !0,
      size: "min(32rem, calc(100vw - 2rem))",
      padding: "lg",
      trapFocus: !0,
      closeOnEscape: !0,
      closeOnClickOutside: !1,
      returnFocus: !0,
      keepMounted: !0,
      keepMountedMode: "display-none",
      closeButtonProps: { "aria-label": b("common.close") },
      onEnterTransitionEnd: () => i.current?.focus(),
      ref: (h) => {
        h && Object.defineProperty(h, "open", {
          configurable: !0,
          get: () => o
        });
      },
      children: [
        /* @__PURE__ */ l.jsx(ee, { component: "p", size: "xs", fw: 600, mb: "xs", style: { letterSpacing: "0.08em" }, children: b("dialogs.documentSetup") }),
        /* @__PURE__ */ l.jsxs(
          "form",
          {
            ref: c,
            onSubmit: p,
            onKeyDown: (h) => {
              h.key === "Enter" && (h.preventDefault(), c.current && u.current && c.current.requestSubmit(u.current));
            },
            children: [
              /* @__PURE__ */ l.jsx(
                ct,
                {
                  id: "name-dialog-input",
                  ref: i,
                  label: /* @__PURE__ */ l.jsx("span", { id: "name-dialog-label", children: t ? b(t.labelKey) : b("common.name") }),
                  value: s,
                  onChange: (h) => a(h.currentTarget.value),
                  autoComplete: "off",
                  maxLength: 80,
                  required: !0,
                  autoFocus: !0
                }
              ),
              /* @__PURE__ */ l.jsxs(Gn, { justify: "flex-end", gap: "sm", mt: "lg", children: [
                /* @__PURE__ */ l.jsx(ue, { type: "button", variant: "default", onClick: f, children: b("common.cancel") }),
                /* @__PURE__ */ l.jsx(ue, { id: "name-dialog-confirm", ref: u, type: "submit", children: t ? b(t.confirmKey) : b("common.save") })
              ] })
            ]
          }
        )
      ]
    }
  );
}
function Ob() {
  const e = window.document.createElement("div");
  e.dataset.island = "name-prompt", window.document.body.append(e);
  const t = {};
  We("name-prompt", e, /* @__PURE__ */ l.jsx(Db, { controller: t }));
  const n = t.open;
  if (!n) throw new Error("Mantine name prompt failed to mount");
  return {
    request(o, r, s, a) {
      n({ titleKey: o, labelKey: r, confirmKey: s, submit: a });
    }
  };
}
function $b(e) {
  const t = window.document.getElementById(e);
  if (!t) throw new Error(`missing element #${e}`);
  return t;
}
function Lb({ controller: e }) {
  const { colorScheme: t, setColorScheme: n } = Bp(), [o, r] = d.useState(!1), [s, a] = d.useState("settings-agents");
  _e();
  const i = d.useRef(null), c = d.useRef(null), u = d.useRef(null);
  function f(h = "settings-agents", g) {
    a(h), g && (i.current && (i.current.checked = g.follow), c.current && (c.current.value = g.language)), r(!0);
  }
  function p() {
    r(!1);
  }
  d.useLayoutEffect(() => {
    e.current = { open: f, close: p, isOpen: () => o };
  }), d.useLayoutEffect(() => {
    const h = u.current;
    if (h)
      return Object.defineProperty(h, "open", {
        configurable: !0,
        get: () => o
      }), Object.defineProperty(h, "close", {
        configurable: !0,
        value: (g) => p()
      }), () => {
        delete h.open, delete h.close;
      };
  }, [o]), d.useEffect(() => () => {
    e.current = null;
  }, [e]);
  function m(h) {
    h.preventDefault(), h.nativeEvent.submitter?.value === "cancel" && p();
  }
  return /* @__PURE__ */ l.jsx(lt, { ref: u, id: "settings-dialog", "data-state": o ? "open" : "closed", opened: o, onClose: p, title: null, withCloseButton: !1, centered: !0, size: "xl", withinPortal: !1, keepMounted: !0, keepMountedMode: "display-none", children: /* @__PURE__ */ l.jsx("form", { id: "settings-form", onSubmit: m, children: /* @__PURE__ */ l.jsxs(ve, { gap: "md", children: [
    /* @__PURE__ */ l.jsxs(Re, { justify: "space-between", align: "flex-start", children: [
      /* @__PURE__ */ l.jsxs("div", { children: [
        /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: b("settings.preferences") }),
        /* @__PURE__ */ l.jsx(ee, { component: "h2", fw: 700, children: b("settings.openButton") })
      ] }),
      /* @__PURE__ */ l.jsx(ue, { id: "settings-close", type: "submit", value: "cancel", variant: "subtle", title: b("common.close"), "aria-label": b("common.close"), children: "×" })
    ] }),
    /* @__PURE__ */ l.jsxs(Te, { value: s, onChange: (h) => a(h), variant: "separated", keepMounted: !0, keepMountedMode: "display-none", children: [
      /* @__PURE__ */ l.jsxs(Te.Item, { id: "settings-agents", className: "settings-section", value: "settings-agents", children: [
        /* @__PURE__ */ l.jsx(Te.Control, { children: /* @__PURE__ */ l.jsxs(Re, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx("i", { className: "ph ph-robot", "aria-hidden": "true" }),
          /* @__PURE__ */ l.jsxs(ve, { gap: 0, children: [
            /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: b("settings.collaboration") }),
            /* @__PURE__ */ l.jsx(ee, { id: "settings-agents-heading", fw: 600, children: b("settings.aiAgents") })
          ] })
        ] }) }),
        /* @__PURE__ */ l.jsx(Te.Panel, { children: /* @__PURE__ */ l.jsxs(ve, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx(ue, { id: "agents", type: "button", leftSection: /* @__PURE__ */ l.jsx("i", { className: "ph ph-plugs-connected", "aria-hidden": "true" }), children: b("agents.dialogTitle") }),
          /* @__PURE__ */ l.jsx(Jt, { id: "setting-follow", ref: i, defaultChecked: !0, label: b("agents.followChanges") }),
          /* @__PURE__ */ l.jsx(ee, { size: "sm", c: "dimmed", children: b("agents.followHint") })
        ] }) })
      ] }),
      /* @__PURE__ */ l.jsxs(Te.Item, { id: "settings-document", className: "settings-section", value: "settings-document", children: [
        /* @__PURE__ */ l.jsx(Te.Control, { children: /* @__PURE__ */ l.jsxs(Re, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx("i", { className: "ph ph-file", "aria-hidden": "true" }),
          /* @__PURE__ */ l.jsxs(ve, { gap: 0, children: [
            /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: b("settings.project") }),
            /* @__PURE__ */ l.jsx(ee, { id: "settings-document-heading", fw: 600, children: b("settings.projectActions") })
          ] })
        ] }) }),
        /* @__PURE__ */ l.jsx(Te.Panel, { children: /* @__PURE__ */ l.jsxs(ve, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx(ue, { id: "rename-project", type: "button", variant: "default", disabled: !0, leftSection: /* @__PURE__ */ l.jsx("i", { className: "ph ph-pencil-simple", "aria-hidden": "true" }), children: b("projects.renameButton") }),
          /* @__PURE__ */ l.jsx(ue, { id: "reload", type: "button", variant: "default", disabled: !0, leftSection: /* @__PURE__ */ l.jsx("i", { className: "ph ph-arrows-clockwise", "aria-hidden": "true" }), children: b("projects.reloadButton") }),
          /* @__PURE__ */ l.jsx(ue, { id: "delete-project", type: "button", color: "red", variant: "light", disabled: !0, leftSection: /* @__PURE__ */ l.jsx("i", { className: "ph ph-trash", "aria-hidden": "true" }), children: b("projects.deleteButton") })
        ] }) })
      ] }),
      /* @__PURE__ */ l.jsxs(Te.Item, { id: "settings-fonts", className: "settings-section", value: "settings-fonts", children: [
        /* @__PURE__ */ l.jsx(Te.Control, { children: /* @__PURE__ */ l.jsxs(Re, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx("i", { className: "ph ph-text-aa", "aria-hidden": "true" }),
          /* @__PURE__ */ l.jsxs(ve, { gap: 0, children: [
            /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: b("settings.workspace") }),
            /* @__PURE__ */ l.jsx(ee, { id: "settings-fonts-heading", fw: 600, children: b("toolbar.fontsButton") })
          ] })
        ] }) }),
        /* @__PURE__ */ l.jsx(Te.Panel, { children: /* @__PURE__ */ l.jsxs(ve, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx(ee, { className: "hint", size: "sm", c: "dimmed", children: b("fonts.settingsHint") }),
          /* @__PURE__ */ l.jsx(ue, { id: "settings-fonts-open", type: "button", variant: "default", leftSection: /* @__PURE__ */ l.jsx("i", { className: "ph ph-arrow-square-out", "aria-hidden": "true" }), children: b("fonts.openTools") })
        ] }) })
      ] }),
      /* @__PURE__ */ l.jsxs(Te.Item, { id: "settings-application", className: "settings-section", value: "settings-application", children: [
        /* @__PURE__ */ l.jsx(Te.Control, { children: /* @__PURE__ */ l.jsxs(Re, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx("i", { className: "ph ph-gear-six", "aria-hidden": "true" }),
          /* @__PURE__ */ l.jsxs(ve, { gap: 0, children: [
            /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: b("settings.application") }),
            /* @__PURE__ */ l.jsx(ee, { id: "settings-application-heading", fw: 600, children: b("settings.updatesControl") })
          ] })
        ] }) }),
        /* @__PURE__ */ l.jsx(Te.Panel, { children: /* @__PURE__ */ l.jsxs(ve, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx(oo, { id: "setting-language", ref: c, label: /* @__PURE__ */ l.jsx("span", { "data-i18n": "settings.languageLabel", children: b("settings.languageLabel") }), defaultValue: "en", data: [
            { value: "en", label: b("settings.languageEnglish") },
            { value: "fr", label: b("settings.languageFrench") },
            { value: "de", label: b("settings.languageGerman") }
          ] }),
          /* @__PURE__ */ l.jsx(
            St.Wrapper,
            {
              id: "setting-appearance-wrapper",
              label: b("settings.appearance"),
              labelElement: "div",
              labelProps: { id: "setting-appearance-label" },
              children: /* @__PURE__ */ l.jsx(
                Qo,
                {
                  id: "setting-appearance",
                  name: "setting-appearance",
                  "aria-labelledby": "setting-appearance-label",
                  fullWidth: !0,
                  value: t === "auto" ? "system" : t,
                  onChange: (h) => {
                    h === "system" ? n("auto") : (h === "light" || h === "dark") && n(h);
                  },
                  data: [
                    { value: "system", label: b("settings.appearanceSystem") },
                    { value: "light", label: b("settings.appearanceLight") },
                    { value: "dark", label: b("settings.appearanceDark") }
                  ]
                }
              )
            }
          ),
          /* @__PURE__ */ l.jsx(Jt, { id: "setting-update-check", label: b("updates.dailyCheckSetting") }),
          /* @__PURE__ */ l.jsxs(ee, { size: "sm", c: "dimmed", children: [
            b("updates.dailyCheckBeforeCommand"),
            " ",
            /* @__PURE__ */ l.jsx("code", { children: "assemblash upgrade" }),
            b("updates.dailyCheckAfterCommand")
          ] }),
          /* @__PURE__ */ l.jsx(ee, { id: "update-note", component: "p", size: "sm", c: "dimmed", hidden: !0, "aria-live": "polite" }),
          /* @__PURE__ */ l.jsx(ue, { id: "shutdown", type: "button", color: "red", variant: "light", hidden: !0, leftSection: /* @__PURE__ */ l.jsx("i", { className: "ph ph-power", "aria-hidden": "true" }), children: b("app.stop") })
        ] }) })
      ] })
    ] })
  ] }) }) });
}
function _b() {
  const e = $b("settings-dialog-mount"), t = { current: null };
  return We("settings", e, /* @__PURE__ */ l.jsx(Lb, { controller: t })), {
    open: (n, o) => t.current?.open(n, o),
    close: () => t.current?.close(),
    isOpen: () => t.current?.isOpen() ?? !1
  };
}
const zb = {
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
function Fb({ host: e, controller: t, boundary: n }) {
  const [o, r] = d.useState({
    projects: [],
    query: "",
    currentProject: null
  }), [s, a] = d.useState(""), i = d.useRef(""), [c, u] = d.useState(b("projects.searchPlaceholder")), [f, p] = d.useState(!1), [m, h] = d.useState(-1), g = _e(), v = d.useRef(null), x = d.useRef(void 0), w = d.useRef(o);
  w.current = o, d.useEffect(() => (t.setProjects = (y) => {
    if (w.current = y, r(y), h(-1), !y.query) {
      const R = y.currentProject ? y.projects.find((D) => D.id === y.currentProject) : void 0;
      u(R?.name ?? R?.id ?? (y.projects.length ? b("projects.searchPlaceholder") : b("projects.none")));
    }
  }, t.setCurrentProject = (y) => {
    const R = w.current, D = { ...R, currentProject: y };
    w.current = D, r(D);
    const O = y ? R.projects.find((z) => z.id === y) : void 0;
    u(O?.name ?? O?.id ?? (R.projects.length ? b("projects.searchPlaceholder") : b("projects.none")));
  }, t.focus = () => v.current?.focus(), () => {
    window.clearTimeout(x.current), t.setProjects = () => {
    }, t.setCurrentProject = () => {
    }, t.focus = () => {
    };
  }), [t]), d.useEffect(() => {
    if (s) return;
    const y = o.currentProject ? o.projects.find((R) => R.id === o.currentProject) : void 0;
    u(y?.name ?? y?.id ?? (o.projects.length ? b("projects.searchPlaceholder") : b("projects.none")));
  }, [g]), d.useEffect(() => {
    const y = (R) => {
      (!(R.target instanceof Node) || !n.contains(R.target)) && (p(!1), h(-1));
    };
    return document.addEventListener("pointerdown", y), () => document.removeEventListener("pointerdown", y);
  }, [n]);
  function k(y) {
    p(y), y || h(-1);
  }
  function C(y) {
    const R = { ...w.current, currentProject: y.id };
    w.current = R, r(R), u(y.name ?? y.id), i.current = "", a(""), v.current && (v.current.value = ""), v.current?.blur(), k(!1), e.openProject(y.id);
  }
  function j(y) {
    i.current = y, a(y), window.clearTimeout(x.current), x.current = window.setTimeout(() => e.search(y.trim()), 150);
  }
  function N(y) {
    if (f || k(!0), o.projects.length === 0) return;
    const R = y > 0 ? 0 : o.projects.length - 1, D = m < 0 ? R : Math.max(0, Math.min(o.projects.length - 1, m + y));
    h(D), window.requestAnimationFrame(() => {
      document.getElementById(`project-option-${D}`)?.scrollIntoView({ block: "nearest" });
    });
  }
  const T = o.projects.length === 0 ? o.query ? b("projects.noMatching") : b("projects.none") : "", S = f && m >= 0 && o.projects[m] ? `project-option-${m}` : void 0;
  return /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
    /* @__PURE__ */ l.jsx("i", { className: "ph ph-magnifying-glass", "aria-hidden": "true" }),
    /* @__PURE__ */ l.jsx(
      ct,
      {
        id: "project-search",
        "data-current-project": o.currentProject ?? "",
        ref: v,
        type: "search",
        autoComplete: "off",
        defaultValue: "",
        placeholder: c,
        "aria-label": b("projects.searchPlaceholder"),
        "aria-controls": "project-options",
        "aria-expanded": f,
        "aria-autocomplete": "list",
        "aria-activedescendant": S,
        role: "combobox",
        onChange: (y) => j(y.currentTarget.value),
        onFocus: () => k(!0),
        onKeyDown: (y) => {
          if (y.key === "ArrowDown" || y.key === "ArrowUp") {
            y.preventDefault(), N(y.key === "ArrowDown" ? 1 : -1);
            return;
          }
          if (y.key === "Escape") {
            k(!1);
            return;
          }
          if (y.key !== "Enter") return;
          const R = v.current?.value ?? i.current;
          R !== i.current && (i.current = R, a(R));
          const D = o.projects[m], O = R.trim().toLocaleLowerCase(), _ = o.projects.find(
            (F) => F.id.toLocaleLowerCase() === O || (F.name ?? F.id).toLocaleLowerCase() === O
          ) ?? D;
          _ && (y.preventDefault(), C(_));
        }
      }
    ),
    /* @__PURE__ */ l.jsx(
      ue,
      {
        id: "project-picker-toggle",
        className: "project-picker-toggle",
        type: "button",
        variant: "subtle",
        "aria-label": b("projects.showButton"),
        "aria-controls": "project-options",
        "aria-expanded": f,
        onClick: () => {
          const y = !f;
          k(y), y && v.current?.focus();
        },
        children: /* @__PURE__ */ l.jsx("i", { className: "ph ph-caret-down", "aria-hidden": "true" })
      }
    ),
    /* @__PURE__ */ l.jsxs(
      "div",
      {
        id: "project-options",
        className: "project-options",
        role: "listbox",
        "aria-label": b("projects.optionsLabel"),
        hidden: !f,
        children: [
          o.projects.map((y, R) => /* @__PURE__ */ l.jsxs(
            ue,
            {
              id: `project-option-${R}`,
              className: `project-option${R === m ? " active" : ""}`,
              styles: zb,
              type: "button",
              variant: "subtle",
              title: y.name ?? y.id,
              "data-project-id": y.id,
              role: "option",
              "aria-selected": y.id === o.currentProject,
              onClick: () => C(y),
              children: [
                /* @__PURE__ */ l.jsx("strong", { children: y.name ?? y.id }),
                /* @__PURE__ */ l.jsx(
                  "span",
                  {
                    className: "project-option-count",
                    "data-i18n-count": "projects.layerCount",
                    "data-count": String(y.layers),
                    children: At("projects.layerCount", y.layers)
                  }
                )
              ]
            },
            y.id
          )),
          T ? /* @__PURE__ */ l.jsx("p", { className: "project-options-empty", children: T }) : null
        ]
      }
    )
  ] });
}
function Bb(e, t) {
  t.replaceChildren();
  const n = {
    setProjects: () => {
    },
    setCurrentProject: () => {
    },
    focus: () => {
    }
  }, o = We(
    "project-picker",
    t,
    /* @__PURE__ */ l.jsx(Fb, { host: e, controller: n, boundary: t })
  );
  function r(s, a, i) {
    n.setProjects({ projects: s, query: a, currentProject: i });
  }
  return {
    setProjects: r,
    setCurrentProject(s) {
      n.setCurrentProject(s);
    },
    focus: () => n.focus(),
    destroy: o
  };
}
function Vb(e) {
  const t = window.document.getElementById(e);
  if (!t) throw new Error(`missing element #${e}`);
  return t;
}
function qc(e) {
  return e.kind ?? "text";
}
function Hb({ host: e, projectController: t }) {
  const [n, o] = d.useState([]), [r, s] = d.useState(() => /* @__PURE__ */ new Map()), [a, i] = d.useState([]), [c, u] = d.useState(""), [f, p] = d.useState([]), [m, h] = d.useState(!1), [g, v] = d.useState(!1);
  _e();
  const [x, w] = d.useState(null), k = d.useRef([]), C = d.useRef(m);
  C.current = m;
  const j = d.useRef(null), N = d.useRef(null);
  function T() {
    for (const $ of k.current) URL.revokeObjectURL($);
    k.current = [];
  }
  function S() {
    const $ = {};
    for (const I of n) {
      const L = r.get(I.name);
      L && ($[I.name] = L);
    }
    return $;
  }
  function y($, I) {
    s((L) => new Map(L).set($, I));
  }
  async function R($, I) {
    T(), p([]);
    const L = [];
    for (const M of I.variants) {
      const P = await _o(of($, M.name));
      k.current.push(P), L.push({ variant: M, url: P });
    }
    p(L);
  }
  async function D($, I) {
    await e.guard($, async () => {
      const L = e.project();
      if (!L) return;
      const M = await Jy(L, I);
      await R(L, M), e.say(At("templates.renderedCount", M.variants.length, {
        what: $,
        version: ke(M.templateVersion)
      }));
    });
  }
  async function O() {
    const $ = e.project();
    if (s(/* @__PURE__ */ new Map()), i([]), u(""), T(), p([]), !$) {
      o([]), C.current = !1, h(!1);
      return;
    }
    const I = await Gy($), L = I.isTemplate ? I.slots : [];
    o(L), C.current = L.length > 0, h(L.length > 0);
    const M = /* @__PURE__ */ new Map();
    for (const P of L)
      qc(P) === "color" && M.set(P.name, "#000000");
    s(M);
  }
  d.useLayoutEffect(() => {
    t.current = {
      projectChanged: O,
      setOpen: v,
      isVisible: () => C.current
    };
  }), d.useEffect(() => () => {
    t.current = null, T();
  }, [t]);
  async function z($) {
    const I = $.currentTarget.files?.[0];
    $.currentTarget.value = "", I && await e.guard(b("templates.loadValues"), async () => {
      const L = JSON.parse(await I.text());
      if (!Array.isArray(L)) throw new Error(b("templates.expectedArray"));
      const M = [];
      for (const P of L) {
        const B = P;
        if (typeof B.name != "string") throw new Error(b("templates.missingName"));
        const W = {};
        for (const [U, Y] of Object.entries(B.values ?? {})) W[U] = String(Y);
        M.push({ name: B.name, values: W });
      }
      i(M), e.say(At("templates.loadedVariants", M.length, { file: I.name }));
    });
  }
  async function _($) {
    const I = $.currentTarget.files?.[0];
    $.currentTarget.value = "";
    const L = x;
    w(null), !(!I || !L) && await e.guard(b("templates.importImage"), async () => {
      const M = e.project();
      if (!M) return;
      const P = await Si(M, I);
      y(L, P.asset.id), await e.refresh(), s((B) => new Map(B)), e.say(b("templates.importedImage", { file: I.name, slot: L }));
    });
  }
  const F = e.document()?.assets ?? [];
  return /* @__PURE__ */ l.jsxs(ve, { component: "section", id: "templates", className: g ? "templates open" : "templates", hidden: !m, gap: "md", "aria-label": b("templates.drawerLabel"), children: [
    /* @__PURE__ */ l.jsxs(Re, { justify: "space-between", align: "flex-start", children: [
      /* @__PURE__ */ l.jsxs("div", { children: [
        /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: b("templates.workspace") }),
        /* @__PURE__ */ l.jsx(ee, { component: "h2", fw: 700, children: b("templates.buildVariants") })
      ] }),
      /* @__PURE__ */ l.jsx(ue, { id: "templates-close", type: "button", variant: "subtle", title: b("templates.close"), "aria-label": b("common.close"), children: "×" })
    ] }),
    /* @__PURE__ */ l.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 18rem), 1fr))", gap: "var(--mantine-spacing-md)" }, children: [
      /* @__PURE__ */ l.jsxs(ve, { gap: "sm", children: [
        /* @__PURE__ */ l.jsx(ee, { component: "h3", fw: 600, children: b("templates.fillSlots") }),
        /* @__PURE__ */ l.jsx(ve, { id: "slot-form", gap: "sm", children: n.map(($) => {
          const I = qc($), L = r.get($.name) ?? (I === "color" ? "#000000" : "");
          return /* @__PURE__ */ l.jsxs(ve, { gap: 4, "data-slot": $.name, children: [
            I === "image" ? /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
              /* @__PURE__ */ l.jsx(Jn, { label: `${$.name}${$.required ? " *" : ""}`, title: $.description ?? void 0, "data-slot": $.name, value: r.get($.name) ?? "", onChange: (M) => y($.name, M ?? ""), data: [{ value: "", label: b(F.length ? "templates.leaveAsIs" : "templates.noImages") }, ...F.map((M) => ({ value: M.id, label: M.path }))] }),
              /* @__PURE__ */ l.jsx(ue, { type: "button", size: "xs", variant: "default", onClick: () => {
                w($.name), j.current?.click();
              }, children: b("templates.importButton") })
            ] }) : I === "color" ? /* @__PURE__ */ l.jsx(ct, { type: "color", label: `${$.name}${$.required ? " *" : ""}`, title: $.description ?? void 0, "data-slot": $.name, value: L, onChange: (M) => y($.name, M.currentTarget.value) }) : /* @__PURE__ */ l.jsx(ct, { label: `${$.name}${$.required ? " *" : ""}`, title: $.description ?? void 0, "data-slot": $.name, value: L, onChange: (M) => y($.name, M.currentTarget.value) }),
            $.description && /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: $.description })
          ] }, $.name);
        }) }),
        /* @__PURE__ */ l.jsx("input", { ref: j, id: "slot-image-file", type: "file", accept: "image/*,.svg", hidden: !0, onChange: ($) => {
          _($);
        } }),
        /* @__PURE__ */ l.jsxs(Re, { align: "end", wrap: "wrap", children: [
          /* @__PURE__ */ l.jsx(ue, { id: "preview-variant", type: "button", onClick: () => {
            D(b("templates.preview"), [{ name: "preview", values: S() }]);
          }, children: b("templates.preview") }),
          /* @__PURE__ */ l.jsx(ct, { id: "variant-name", label: b("templates.variantName"), value: c, onChange: ($) => u($.currentTarget.value) }),
          /* @__PURE__ */ l.jsx(ue, { id: "add-variant", type: "button", variant: "default", onClick: () => {
            const $ = c.trim();
            if (!$) {
              e.say(b("templates.variantNameRequired"), "error");
              return;
            }
            i((I) => [...I, { name: $, values: S() }]), u(""), e.say(b("templates.addedToBatch", { name: $ }));
          }, children: b("templates.addToBatch") })
        ] })
      ] }),
      /* @__PURE__ */ l.jsxs(ve, { gap: "sm", children: [
        /* @__PURE__ */ l.jsx(ee, { component: "h3", fw: 600, children: b("templates.batch") }),
        /* @__PURE__ */ l.jsx(ve, { component: "ol", id: "variant-rows", gap: "xs", m: 0, p: 0, children: a.map(($, I) => /* @__PURE__ */ l.jsx(Qn, { component: "li", withBorder: !0, p: "xs", children: /* @__PURE__ */ l.jsxs(Re, { justify: "space-between", align: "flex-start", wrap: "nowrap", children: [
          /* @__PURE__ */ l.jsxs(ve, { gap: 2, style: { minWidth: 0 }, children: [
            /* @__PURE__ */ l.jsx(ee, { fw: 600, children: $.name }),
            /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: Object.entries($.values).map(([L, M]) => `${L}=${M}`).join("  ") })
          ] }),
          /* @__PURE__ */ l.jsx(ue, { type: "button", size: "xs", variant: "subtle", onClick: () => i((L) => L.filter((M, P) => P !== I)), children: b("templates.removeButton") })
        ] }) }, `${I}-${$.name}`)) }),
        /* @__PURE__ */ l.jsx("input", { ref: N, id: "values-file", type: "file", accept: "application/json,.json", hidden: !0, onChange: ($) => {
          z($);
        } }),
        /* @__PURE__ */ l.jsxs(Re, { wrap: "wrap", children: [
          /* @__PURE__ */ l.jsx(ue, { id: "load-values", type: "button", variant: "default", onClick: () => N.current?.click(), children: b("templates.loadJson") }),
          /* @__PURE__ */ l.jsx(ue, { id: "render-batch", type: "button", disabled: !a.length, onClick: () => {
            D(b("templates.renderBatch"), a);
          }, children: a.length ? At("templates.renderVariants", a.length) : b("templates.renderBatch") }),
          /* @__PURE__ */ l.jsx(ue, { id: "clear-batch", type: "button", variant: "default", disabled: !a.length, onClick: () => i([]), children: b("templates.clear") })
        ] })
      ] }),
      /* @__PURE__ */ l.jsxs(ve, { gap: "sm", children: [
        /* @__PURE__ */ l.jsx(ee, { component: "h3", fw: 600, children: b("templates.renderedVariants") }),
        /* @__PURE__ */ l.jsx("div", { id: "gallery", style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))", gap: "var(--mantine-spacing-sm)" }, children: f.map(({ variant: $, url: I }) => /* @__PURE__ */ l.jsxs(Qn, { component: "figure", withBorder: !0, p: "sm", m: 0, children: [
          /* @__PURE__ */ l.jsx("img", { src: I, alt: b("templates.variantAlt", { name: $.name }), style: { display: "block", width: "100%", height: "auto" } }),
          /* @__PURE__ */ l.jsxs(ve, { component: "figcaption", gap: 4, mt: "sm", children: [
            /* @__PURE__ */ l.jsx(ee, { component: "strong", children: $.name }),
            /* @__PURE__ */ l.jsx(ee, { size: "xs", children: b("templates.bytesSize", { width: ke($.width), height: ke($.height), bytes: ke($.bytes) }) }),
            /* @__PURE__ */ l.jsx(ee, { component: "code", size: "xs", title: $.hash, children: $.hash.replace(/^sha256:/, "").slice(0, 12) }),
            /* @__PURE__ */ l.jsx(ue, { component: "a", href: I, download: `${$.name}.png`, variant: "default", size: "xs", children: b("templates.downloadButton") })
          ] })
        ] }, `${$.name}-${$.hash}`)) })
      ] })
    ] })
  ] });
}
function Wb(e) {
  const t = Vb("templates-mantine-mount"), n = { current: null };
  return We("templates", t, /* @__PURE__ */ l.jsx(Hb, { host: e, projectController: n })), {
    projectChanged: async () => {
      await n.current?.projectChanged();
    },
    setOpen: (o) => n.current?.setOpen(o),
    isVisible: () => n.current?.isVisible() ?? !1
  };
}
const ko = (e) => /* @__PURE__ */ l.jsx("i", { className: `ph ${e}`, "aria-hidden": "true" });
function $r(e) {
  return e.name ?? (e.type === "text" ? e.text : e.type) ?? e.type;
}
function Ub(e) {
  return e.type === "shape" ? { rect: "ph-square", ellipse: "ph-circle", line: "ph-line-segment", path: "ph-bezier-curve" }[nf(e) ?? ""] ?? "ph-shapes" : { text: "ph-text-t", image: "ph-image", svg: "ph-pen-nib", group: "ph-stack" }[e.type] ?? "ph-square";
}
function qb({ layer: e, finish: t }) {
  const n = d.useRef(null), o = d.useRef(!1);
  d.useEffect(() => {
    n.current?.focus(), n.current?.select();
  }, []);
  const r = (s) => {
    o.current || (o.current = !0, t(s ? n.current?.value.trim() ?? "" : null));
  };
  return /* @__PURE__ */ l.jsx(
    ct,
    {
      ref: n,
      size: "xs",
      autoFocus: !0,
      defaultValue: $r(e),
      classNames: { input: "layer-rename" },
      "aria-label": b("layers.renameHint"),
      onClick: (s) => s.stopPropagation(),
      onBlur: () => r(!0),
      onKeyDown: (s) => {
        s.stopPropagation(), (s.key === "Enter" || s.key === "Escape") && (s.preventDefault(), r(s.key === "Enter"));
      }
    }
  );
}
function Kb({ layer: e, depth: t, parent: n, inheritedGuard: o, snapshot: r, commands: s, elementProps: a, renaming: i, startRename: c, finishRename: u, expanded: f, hasChildren: p, toggleExpanded: m }) {
  const [h, g] = d.useState(!1), [v, x] = d.useState(!1), w = d.useRef(null);
  d.useEffect(() => () => {
    w.current && clearTimeout(w.current.timer);
  }, []);
  const k = r.selectedIds.includes(e.id), C = !o && zo(e), j = o || !!Or(e), N = !o && !e.protected && !e.readOnly, T = (y, R) => {
    k || s.select(e.id, !1), s.contextMenu?.(e.id, y, R);
  }, S = () => {
    w.current && clearTimeout(w.current.timer);
  };
  return /* @__PURE__ */ l.jsx(
    Q,
    {
      ...a,
      className: `${a.className} layer${k ? " selected" : ""}${j ? " guarded" : ""}${e.visible === !1 ? " hidden-layer" : ""}${h ? " dragging" : ""}${v ? " drop-target" : ""}`,
      "data-id": e.id,
      "data-type": e.type,
      "data-parent": n ?? "",
      style: { ...a.style, "--layer-depth": t, paddingInlineStart: 8 + t * 16 },
      draggable: C,
      onClick: (y) => {
        if (w.current?.fired) {
          w.current = null;
          return;
        }
        a.onClick(y), s.select(e.id, y.shiftKey || y.ctrlKey || y.metaKey);
      },
      onContextMenu: (y) => {
        y.preventDefault(), T(y.clientX, y.clientY);
      },
      onPointerDown: (y) => {
        if (y.pointerType !== "touch" || !s.contextMenu) return;
        S();
        const R = y.clientX, D = y.clientY;
        w.current = { x: R, y: D, fired: !1, timer: setTimeout(() => {
          w.current && (w.current.fired = !0), T(R, D);
        }, 450) };
      },
      onPointerMove: (y) => {
        w.current && Math.hypot(y.clientX - w.current.x, y.clientY - w.current.y) > 8 && S();
      },
      onPointerUp: S,
      onPointerCancel: S,
      onDragStart: (y) => {
        y.dataTransfer.setData("text/plain", e.id), g(!0);
      },
      onDragEnd: () => {
        g(!1), x(!1);
      },
      onDragOver: (y) => {
        y.preventDefault(), x(!0);
      },
      onDragLeave: () => x(!1),
      onDrop: (y) => {
        y.preventDefault(), x(!1);
        const R = y.dataTransfer.getData("text/plain");
        if (!R || R === e.id || !r.document) return;
        const D = He(De(r.document)), O = n ? D.find((F) => F.layer.id === n)?.layer : null, z = O?.type === "group" ? O.children ?? [] : De(r.document), _ = Math.max(0, z.findIndex((F) => F.id === e.id) + 1);
        s.reorder(R, e.id, e.type === "group" ? { at: "in", parent: e.id } : n ? { at: "in", parent: n, index: _ } : { at: "root", index: _ });
      },
      children: /* @__PURE__ */ l.jsxs(Re, { gap: "xs", wrap: "nowrap", children: [
        p ? /* @__PURE__ */ l.jsx(
          Ro,
          {
            className: "layer-control",
            size: "sm",
            variant: "subtle",
            "data-layer-toggle": e.id,
            title: b(f ? "layers.collapseGroup" : "layers.expandGroup"),
            "aria-label": b(f ? "layers.collapseGroup" : "layers.expandGroup"),
            "aria-expanded": f,
            onClick: (y) => {
              y.stopPropagation(), m();
            },
            children: ko(f ? "ph-caret-down" : "ph-caret-right")
          }
        ) : null,
        /* @__PURE__ */ l.jsx(
          Ro,
          {
            className: "layer-control",
            size: "sm",
            variant: "subtle",
            disabled: !C,
            title: b(e.visible === !1 ? "layers.show" : "layers.hide"),
            "aria-label": b(e.visible === !1 ? "layers.show" : "layers.hide"),
            onClick: (y) => {
              y.stopPropagation(), s.toggleVisibility(e.id);
            },
            children: ko(e.visible === !1 ? "ph-eye-slash" : "ph-eye")
          }
        ),
        /* @__PURE__ */ l.jsx(Q, { className: "layer-icon", children: ko(Ub(e)) }),
        /* @__PURE__ */ l.jsx(Q, { style: { flex: 1, minWidth: 0 }, children: i ? /* @__PURE__ */ l.jsx(qb, { layer: e, finish: (y) => {
          u(), y !== null && y !== (e.name ?? "") && s.rename(e.id, y);
        } }) : /* @__PURE__ */ l.jsx(
          ee,
          {
            component: "span",
            className: "name",
            size: "sm",
            truncate: !0,
            title: Or(e) ?? b("layers.renameHint"),
            onDoubleClick: (y) => {
              y.stopPropagation(), C && c();
            },
            children: $r(e)
          }
        ) }),
        /* @__PURE__ */ l.jsx(
          Ro,
          {
            className: "layer-control",
            size: "sm",
            variant: "subtle",
            disabled: !N,
            title: b(e.locked ? "layers.unlock" : "layers.lock"),
            "aria-label": b(e.locked ? "layers.unlock" : "layers.lock"),
            onClick: (y) => {
              y.stopPropagation(), s.toggleLocked(e.id);
            },
            children: ko(e.locked ? "ph-lock" : "ph-lock-open")
          }
        )
      ] })
    }
  );
}
function Xb({ snapshot: e, commands: t }) {
  _e();
  const [n, o] = d.useState(null), [r, s] = d.useState({}), a = e.document ? De(e.document) : [], i = d.useMemo(() => {
    const p = e.query.trim().toLowerCase(), m = (g) => $r(g).toLowerCase().includes(p) || g.type === "group" && (g.children ?? []).some(m), h = (g, v, x) => [...g].reverse().filter((w) => !p || m(w)).map((w) => ({
      value: w.id,
      label: $r(w),
      layer: w,
      parent: v,
      guarded: x,
      ...w.type === "group" ? { children: h(w.children ?? [], w.id, x || !zo(w)) } : {}
    }));
    return h(e.document ? De(e.document) : [], null, !1);
  }, [e.document, e.query]), c = d.useMemo(() => {
    const p = /* @__PURE__ */ new Map(), m = (h) => {
      for (const g of h)
        p.set(g.value, g), g.children && m(g.children);
    };
    return m(i), p;
  }, [i]), u = d.useMemo(() => Object.fromEntries([...c.keys()].map((p) => [p, r[p] ?? !0])), [c, r]), f = Jd({
    multiple: !0,
    selectedState: [...e.selectedIds],
    expandedState: u,
    onExpandedStateChange: s,
    onSelectedStateChange(p) {
      if (p.length) {
        t.select(p[0], !1);
        for (const m of p.slice(1)) t.select(m, !0);
      }
    }
  });
  return i.length ? /* @__PURE__ */ l.jsx(
    ys,
    {
      id: "layers",
      "aria-label": b("layers.tab"),
      data: i,
      tree: f,
      m: 0,
      p: 0,
      expandOnClick: !1,
      expandOnSpace: !1,
      selectOnClick: !1,
      allowRangeSelection: !1,
      onKeyDown: (p) => {
        const m = p.target;
        if (m.getAttribute("role") !== "treeitem" && !m.classList.contains("layer")) return;
        const h = c.get(m.dataset.value ?? "");
        if (h && (p.key === "F2" && (p.preventDefault(), p.stopPropagation(), !h.guarded && zo(h.layer) && o(h.value)), (p.key === "Enter" || p.key === " ") && (p.preventDefault(), p.stopPropagation(), t.select(h.value, p.shiftKey || p.ctrlKey || p.metaKey)), p.key === "F10" && p.shiftKey)) {
          p.preventDefault(), p.stopPropagation(), e.selectedIds.includes(h.value) || t.select(h.value, !1);
          const g = (m.classList.contains("layer") ? m : m.querySelector(".layer")).getBoundingClientRect();
          t.contextMenu?.(h.value, g.left + 24, g.top + 24);
        }
      },
      renderNode: ({ node: p, level: m, elementProps: h, expanded: g, hasChildren: v }) => {
        const { layer: x, parent: w, guarded: k } = p;
        return /* @__PURE__ */ l.jsx(
          Kb,
          {
            layer: x,
            depth: m - 1,
            parent: w,
            inheritedGuard: k,
            snapshot: e,
            commands: t,
            elementProps: h,
            renaming: n === x.id,
            startRename: () => o(x.id),
            finishRename: () => o(null),
            expanded: g,
            hasChildren: v,
            toggleExpanded: () => f.toggleExpanded(x.id)
          }
        );
      }
    }
  ) : /* @__PURE__ */ l.jsx(Q, { component: "ul", id: "layers", role: "tree", "aria-label": b("layers.tab"), m: 0, p: 0, style: { listStyle: "none" }, children: /* @__PURE__ */ l.jsx(Q, { component: "li", className: `layers-empty${a.length ? " compact" : ""}`, p: "md", children: /* @__PURE__ */ l.jsxs(ve, { gap: "xs", align: "center", children: [
    /* @__PURE__ */ l.jsx(Q, { children: ko(a.length ? "ph-magnifying-glass" : "ph-stack-simple") }),
    /* @__PURE__ */ l.jsx(ee, { fw: 600, children: b(a.length ? "layers.noMatching" : "layers.none") }),
    /* @__PURE__ */ l.jsx(ee, { size: "sm", c: "dimmed", children: b(a.length ? "layers.trySearch" : "layers.emptyHint") })
  ] }) }) });
}
function Yb({ snapshot: e }) {
  return _e(), /* @__PURE__ */ l.jsx(Q, { component: "ol", id: "history", m: 0, p: "sm", children: [...e.history?.entries ?? []].reverse().map((t) => /* @__PURE__ */ l.jsx(
    Q,
    {
      component: "li",
      className: t.position > (e.history?.position ?? 0) ? "undone" : void 0,
      py: "xs",
      children: /* @__PURE__ */ l.jsx(ee, { size: "sm", c: t.position > (e.history?.position ?? 0) ? "dimmed" : void 0, children: `${t.position}. ${t.kind} — ${t.actor.kind}${t.actor.detail ? ` (${t.actor.detail})` : ""}` })
    },
    t.transaction
  )) });
}
function Gb({ snapshot: e, commands: t }) {
  _e();
  const [n, o] = d.useState(e.dock ?? "properties");
  d.useEffect(() => {
    e.dock && o(e.dock);
  }, [e.dock]);
  const r = e.document ? He(De(e.document)) : [], s = r.filter((c) => e.selectedIds.includes(c.layer.id)), a = s.length > 0 && s.every((c) => {
    if (!zo(c.layer)) return !1;
    let u = c.parent;
    for (; u; ) {
      const f = r.find((p) => p.layer.id === u);
      if (!f || !zo(f.layer)) return !1;
      u = f.parent;
    }
    return !0;
  }), i = (c) => {
    (c === "properties" || c === "layers" || c === "history") && (o(c), t.showDock(c));
  };
  return /* @__PURE__ */ l.jsxs(
    ut,
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
        /* @__PURE__ */ l.jsxs(ut.List, { children: [
          /* @__PURE__ */ l.jsx(ut.Tab, { id: "properties-tab", value: "properties", children: b("properties.tab") }),
          /* @__PURE__ */ l.jsx(ut.Tab, { id: "layers-tab", value: "layers", children: b("layers.tab") }),
          /* @__PURE__ */ l.jsx(ut.Tab, { id: "history-tab", value: "history", children: b("history.tab") })
        ] }),
        /* @__PURE__ */ l.jsx(ut.Panel, { value: "properties", id: "properties-panel", className: "dock-view", children: /* @__PURE__ */ l.jsx("div", { id: "advanced-inspector" }) }),
        /* @__PURE__ */ l.jsx(ut.Panel, { value: "layers", id: "layers-view", className: "dock-view", children: /* @__PURE__ */ l.jsxs(ve, { className: "layers-content", gap: "sm", p: "sm", children: [
          /* @__PURE__ */ l.jsx(
            ct,
            {
              id: "layer-search",
              value: e.query,
              disabled: Kc(e.document),
              placeholder: b(Kc(e.document) ? "layers.noSearch" : "layers.searchPlaceholder"),
              "aria-label": b("layers.searchPlaceholder"),
              onChange: (c) => t.setQuery(c.currentTarget.value)
            }
          ),
          /* @__PURE__ */ l.jsx(Xb, { snapshot: e, commands: t }),
          /* @__PURE__ */ l.jsxs(Re, { gap: "xs", children: [
            /* @__PURE__ */ l.jsx(ue, { id: "group-layers", variant: "default", size: "xs", disabled: !a || s.length < 2, onClick: t.groupSelection, children: b("layers.groupButton") }),
            /* @__PURE__ */ l.jsx(ue, { id: "delete-layer", variant: "light", color: "red", size: "xs", disabled: !a, onClick: t.deleteSelection, children: b("layers.deleteButton") })
          ] })
        ] }) }),
        /* @__PURE__ */ l.jsx(ut.Panel, { value: "history", id: "history-view", className: "dock-view", children: /* @__PURE__ */ l.jsx(Yb, { snapshot: e }) })
      ]
    }
  );
}
function Kc(e) {
  return !e || De(e).length === 0;
}
function Jb(e, t, n) {
  let o = (a) => {
  };
  function r() {
    const [a, i] = d.useState(t);
    return d.useEffect(() => (o = (c) => i({ ...c }), () => {
      o = () => {
      };
    }), []), /* @__PURE__ */ l.jsx(Gb, { snapshot: a, commands: n });
  }
  const s = We("structure", e, /* @__PURE__ */ l.jsx(r, {}));
  return { setSnapshot: (a) => o(a), destroy: s };
}
function Zb(e) {
  return typeof e == "string" ? e : JSON.stringify(e, null, 2);
}
function Lr(e) {
  return Array.isArray(e) ? `[${e.map(Lr).join(",")}]` : e && typeof e == "object" ? `{${Object.keys(e).sort().map(
    (t) => `${JSON.stringify(t)}:${Lr(e[t])}`
  ).join(",")}}` : JSON.stringify(e);
}
function Xc(e, t) {
  if (typeof e == "string" && typeof t == "string") {
    const n = (o) => {
      const r = /^#([\da-f]{6})([\da-f]{2})?$/i.exec(o);
      return r ? `${r[1].toLowerCase()}${(r[2] ?? "ff").toLowerCase()}` : o;
    };
    return n(e) === n(t);
  }
  return Lr(e) === Lr(t);
}
function uf({ id: e, label: t, value: n, className: o, compact: r = !1, disabled: s = !1, onCommit: a, clear: i }) {
  _e();
  const c = typeof n == "string" ? n : "#000000", [u, f] = d.useState(typeof n == "string" ? "solid" : "json"), [p, m] = d.useState(c), [h, g] = d.useState(Zb(n)), [v, x] = d.useState(""), [w, k] = d.useState(!1), C = d.useRef(n);
  function j(y) {
    let R = y.trim();
    /^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(R) && (typeof C.current == "string" && /^#[\da-f]{6}$/i.test(C.current) && /^#([\da-f]{6})ff$/i.test(R) && (R = R.slice(0, 7)), x(""), !Xc(C.current, R) && (C.current = R, a(R)));
  }
  function N() {
    let y;
    try {
      y = JSON.parse(h);
    } catch {
      x(b("paint.jsonSyntaxError"));
      return;
    }
    if (!y || typeof y != "object" || Array.isArray(y) || !("kind" in y)) {
      x(b("paint.jsonObjectError"));
      return;
    }
    x("");
    const R = y;
    Xc(C.current, R) || (C.current = R, a(R));
  }
  const T = /* @__PURE__ */ l.jsxs(ve, { gap: "xs", className: "paint-input", "data-paint-editor": e, children: [
    /* @__PURE__ */ l.jsx(
      Qo,
      {
        "aria-label": t,
        value: u,
        onChange: (y) => f(y),
        data: [
          { value: "solid", label: b("paint.solid") },
          { value: "json", label: b("paint.json") }
        ],
        disabled: s,
        size: "xs"
      }
    ),
    u === "solid" ? /* @__PURE__ */ l.jsxs(Re, { align: "end", wrap: "nowrap", gap: "xs", children: [
      /* @__PURE__ */ l.jsx(
        Jo,
        {
          id: `${e}-solid`,
          classNames: o ? { input: o } : void 0,
          label: t,
          value: p,
          format: "hexa",
          fixOnBlur: !1,
          disabled: s,
          onChange: (y) => m(y),
          onChangeEnd: j,
          onBlur: (y) => j(y.currentTarget.value),
          "aria-label": t,
          "data-paint-solid": e,
          style: { flex: 1 }
        }
      ),
      i ? /* @__PURE__ */ l.jsx(
        ue,
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
    ] }) : /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
      /* @__PURE__ */ l.jsx(
        no,
        {
          id: `${e}-json`,
          classNames: { input: o ? `${o} paint-json` : "paint-json" },
          label: t,
          value: h,
          onChange: (y) => g(y.currentTarget.value),
          minRows: 4,
          autosize: !0,
          disabled: s,
          error: v || void 0,
          "aria-label": t,
          "data-paint-json": e
        }
      ),
      /* @__PURE__ */ l.jsxs(Re, { justify: "space-between", align: "center", children: [
        /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: b("paint.jsonHint") }),
        /* @__PURE__ */ l.jsxs(Re, { gap: "xs", children: [
          /* @__PURE__ */ l.jsx(ue, { id: `${e}-apply-json`, type: "button", size: "xs", variant: "light", disabled: s, onClick: N, children: b("paint.applyJson") }),
          i ? /* @__PURE__ */ l.jsx(
            ue,
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
    v ? /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "red", role: "alert", children: v }) : null
  ] });
  if (!r) return T;
  const S = typeof n == "string" ? { backgroundColor: n } : { background: "linear-gradient(135deg, var(--color-accent) 0 50%, var(--color-surface-subtle) 50% 100%)" };
  return /* @__PURE__ */ l.jsxs(
    Fe,
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
        /* @__PURE__ */ l.jsx(Fe.Target, { children: /* @__PURE__ */ l.jsx(
          Ro,
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
            onClick: () => k((y) => !y),
            children: /* @__PURE__ */ l.jsx("span", { className: "paint-swatch", "aria-hidden": "true", style: S })
          }
        ) }),
        /* @__PURE__ */ l.jsx(Fe.Dropdown, { className: "paint-popover", "data-paint-popover": e, children: T })
      ]
    }
  );
}
let Qb = 0;
function ex(e, t) {
  return We(`paint-${++Qb}`, e, /* @__PURE__ */ l.jsx(uf, { ...t }));
}
let df = 0;
function ji(e) {
  return JSON.stringify([e.project, e.document, e.layer]);
}
function ff(e) {
  const t = e.runs.every(fa) && e.runs.map((n) => n.text).join("") === e.text;
  return { capture: structuredClone(e), rows: e.runs.map((n) => ({ key: ++df, raw: structuredClone(n), legacy: !t || !fa(n) })), error: "", pending: !1 };
}
function Yc(e = "") {
  return { key: ++df, raw: { text: e } };
}
function kr(e) {
  return !e.legacy && !!e.raw && typeof e.raw == "object" && !Array.isArray(e.raw) && typeof e.raw.text == "string";
}
function fa(e) {
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
  return !(n != null && !tx(n));
}
function tx(e) {
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
function nx(e, t, n) {
  const o = structuredClone(e);
  return n === void 0 ? delete o[t] : o[t] = structuredClone(n), o;
}
function qn(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function _s(e, t) {
  return Object.fromEntries(Object.entries(structuredClone(e)).filter(([n]) => !t.includes(n)));
}
function Gc(e) {
  const t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    if (!qn(o) || typeof o.offset != "number" || !Number.isFinite(o.offset)) continue;
    const r = o.offset;
    t.has(r) && n.add(r), t.set(r, o);
  }
  for (const o of n) t.delete(o);
  return t;
}
function ox(e, t) {
  if (!qn(e) || !qn(t) || e.kind !== t.kind || !["linear", "radial"].includes(String(t.kind))) return structuredClone(t);
  const n = t.kind === "radial", o = {
    ..._s(e, n ? ["kind", "center", "radius", "stops"] : ["kind", "angle", "stops"]),
    ...structuredClone(t)
  };
  if (Array.isArray(e.stops) && Array.isArray(t.stops)) {
    const r = Gc(e.stops), s = Gc(t.stops);
    o.stops = t.stops.map((a) => {
      if (!qn(a) || typeof a.offset != "number" || !s.has(a.offset)) return structuredClone(a);
      const i = r.get(a.offset);
      return { ...i ? _s(i, ["offset", "color", "alpha"]) : {}, ...structuredClone(a) };
    });
  }
  if (n && qn(e.center)) {
    const r = _s(e.center, ["x", "y"]);
    qn(t.center) ? o.center = { ...r, ...structuredClone(t.center) } : !Object.hasOwn(t, "center") && Object.keys(r).length && (o.center = { ...r, x: 0.5, y: 0.5 });
  }
  return o;
}
function pa(e) {
  return JSON.stringify(e.rows.map((t) => t.raw)) !== JSON.stringify(e.capture.runs);
}
function rx(e) {
  if (!pa(e)) return null;
  const t = e.rows.map((o) => structuredClone(o.raw)), n = { op: "update", id: e.capture.layer, runs: t };
  if (t.length && e.rows.every(kr) && t.every(fa)) {
    const o = t.map((r) => r.text).join("");
    o !== e.capture.text && Object.assign(n, { text: o });
  }
  return n;
}
function sx(e) {
  _e();
  const [, t] = d.useState(0), n = d.useRef(null), o = ji(e.capture), r = e.drafts.get(o), s = e.disabled || !!r?.pending || !!r?.reconcile, a = () => t((g) => g + 1), i = (g) => requestAnimationFrame(() => {
    (n.current ?? [...document.querySelectorAll("[data-runs-editor]")].find((x) => x.dataset.runsIdentity === o))?.querySelector(g)?.focus();
  }), c = (g) => {
    e.drafts.set(o, g), a();
  }, u = () => {
    c(ff(e.capture)), i("#runs-add");
  }, f = (g, v, x) => {
    if (!r || s) return;
    const w = r.rows[g];
    kr(w) && (w.raw = nx(w.raw, v, x), r.error = "", c(r));
  };
  async function p() {
    if (!r || s || !pa(r)) return;
    r.pending = !0, r.error = "", c(r);
    const g = await e.submit(r);
    r.pending = !1, g.status === "applied" ? e.drafts.delete(o) : (r.error = g.error, r.reconcile = g.status === "committed" || g.status === "unknown"), a(), i(g.status === "applied" ? "#runs-edit" : "#runs-error");
  }
  async function m() {
    if (!r || r.pending) return;
    r.pending = !0, c(r);
    const g = await e.reload();
    g ? (r.pending = !1, r.error = g, c(r), i("#runs-error")) : i("textarea[data-run-text], #runs-add");
  }
  function h(g, v, x, w, k) {
    const C = g[x], j = C != null, N = `run-${r.rows[v].key}-${x}`, T = `${b("runs.row", { number: v + 1 })}: ${b(w)}`;
    return /* @__PURE__ */ l.jsxs(ve, { gap: 4, style: { minWidth: 0 }, children: [
      /* @__PURE__ */ l.jsx(
        Jn,
        {
          "aria-label": `${T}: ${b("runs.mode")}`,
          label: b(w),
          size: "xs",
          value: j ? "value" : "inherit",
          data: [{ value: "inherit", label: b("runs.inherit") }, { value: "value", label: b("runs.override") }],
          disabled: s,
          onChange: (S) => f(v, x, S === "inherit" ? void 0 : k)
        }
      ),
      x === "fontFamily" ? /* @__PURE__ */ l.jsx(Sb, { host: e.fonts, label: T, value: String(j ? C : k), disabled: s || !j, onCommit: (S) => f(v, x, S) }) : x === "fontStyle" ? /* @__PURE__ */ l.jsx(
        Jn,
        {
          id: N,
          "aria-label": T,
          size: "xs",
          value: String(j ? C : k),
          disabled: s || !j,
          data: [{ value: "normal", label: b("runs.normal") }, { value: "italic", label: b("runs.italic") }],
          onChange: (S) => f(v, x, S)
        }
      ) : /* @__PURE__ */ l.jsx(
        ct,
        {
          id: N,
          "aria-label": T,
          size: "xs",
          type: "number",
          value: String(j ? C : k),
          disabled: s || !j,
          onChange: (S) => {
            const y = S.currentTarget.value;
            f(v, x, y === "" ? "" : Number(y));
          }
        }
      )
    ] }, x);
  }
  return /* @__PURE__ */ l.jsx("div", { ref: n, className: "runs-editor", "data-runs-editor": !0, "data-runs-identity": o, onKeyDown: (g) => g.stopPropagation(), children: /* @__PURE__ */ l.jsxs(ve, { gap: "xs", children: [
    /* @__PURE__ */ l.jsx(ee, { fw: 600, children: b("runs.title") }),
    /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: b("runs.help") }),
    r ? /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
      r.capture.version !== e.capture.version && /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "orange", role: "status", children: b("runs.conflict") }),
      /* @__PURE__ */ l.jsx(et, { "aria-label": b("runs.title"), style: { tableLayout: "fixed", width: "100%" }, children: /* @__PURE__ */ l.jsx(et.Tbody, { children: r.rows.map((g, v) => /* @__PURE__ */ l.jsx(et.Tr, { "data-run-row": g.key, children: /* @__PURE__ */ l.jsx(et.Td, { style: { padding: "8px 0" }, children: /* @__PURE__ */ l.jsxs(ve, { gap: "xs", children: [
        /* @__PURE__ */ l.jsxs(Re, { justify: "space-between", gap: 4, children: [
          /* @__PURE__ */ l.jsx(ee, { size: "sm", fw: 600, children: b("runs.row", { number: v + 1 }) }),
          /* @__PURE__ */ l.jsxs(Re, { gap: 4, wrap: "wrap", children: [
            [[-1, "runs.up"], [1, "runs.down"]].map(([x, w]) => /* @__PURE__ */ l.jsx(
              ue,
              {
                size: "compact-xs",
                variant: "subtle",
                "aria-label": `${b(w)}: ${v + 1}`,
                "data-run-move": x,
                disabled: s || v + x < 0 || v + x >= r.rows.length,
                onClick: () => {
                  [r.rows[v], r.rows[v + x]] = [r.rows[v + x], r.rows[v]], c(r), i(`[data-run-row="${g.key}"] textarea`);
                },
                children: b(w)
              },
              x
            )),
            /* @__PURE__ */ l.jsx(
              ue,
              {
                size: "compact-xs",
                variant: "subtle",
                color: "red",
                "aria-label": `${b("runs.delete")}: ${v + 1}`,
                "data-run-delete": !0,
                disabled: s,
                onClick: () => {
                  r.rows.splice(v, 1), c(r), i(r.rows.length ? `[data-run-row="${r.rows[Math.min(v, r.rows.length - 1)].key}"] textarea` : "#runs-add");
                },
                children: b("runs.delete")
              }
            )
          ] })
        ] }),
        kr(g) ? /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
          /* @__PURE__ */ l.jsx(
            no,
            {
              "data-run-text": !0,
              "aria-label": `${b("runs.text")}: ${v + 1}`,
              label: b("runs.text"),
              value: g.raw.text,
              autosize: !0,
              minRows: 2,
              disabled: s,
              onChange: (x) => f(v, "text", x.currentTarget.value)
            }
          ),
          /* @__PURE__ */ l.jsxs(ja, { cols: 2, spacing: "xs", children: [
            h(g.raw, v, "fontFamily", "editor.fontFamily", e.layer.fontFamily),
            h(g.raw, v, "fontSize", "properties.fontSize", e.layer.fontSize),
            h(g.raw, v, "fontWeight", "properties.weight", e.layer.fontWeight ?? 400),
            h(g.raw, v, "fontStyle", "properties.style", e.layer.fontStyle ?? "normal"),
            h(g.raw, v, "letterSpacing", "properties.letterSpacing", e.layer.letterSpacing ?? 0)
          ] }),
          /* @__PURE__ */ l.jsx(
            Jn,
            {
              size: "xs",
              label: b("properties.colour"),
              "aria-label": `${b("runs.fillMode")}: ${v + 1}`,
              "data-run-fill-mode": !0,
              value: Object.hasOwn(g.raw, "color") ? g.raw.color === null ? "none" : "value" : "inherit",
              disabled: s,
              data: [{ value: "inherit", label: b("runs.inherit") }, { value: "none", label: b("runs.noFill") }, { value: "value", label: b("runs.override") }],
              onChange: (x) => f(v, "color", x === "inherit" ? void 0 : x === "none" ? null : e.layer.color ?? "#000000")
            }
          ),
          Object.hasOwn(g.raw, "color") && g.raw.color !== null && /* @__PURE__ */ l.jsx(
            uf,
            {
              id: `run-${g.key}-paint`,
              label: `${b("properties.colour")}: ${v + 1}`,
              value: g.raw.color,
              disabled: s,
              onCommit: (x) => f(v, "color", ox(r.rows[v].raw.color, x))
            },
            `${g.key}-${typeof g.raw.color}`
          )
        ] }) : /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
          /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "orange", children: b("runs.unsupported") }),
          /* @__PURE__ */ l.jsx(no, { "aria-label": `${b("runs.raw")}: ${v + 1}`, value: JSON.stringify(g.raw, null, 2), readOnly: !0, autosize: !0, maxRows: 6 })
        ] })
      ] }) }) }, g.key)) }) }),
      /* @__PURE__ */ l.jsxs(Re, { gap: "xs", children: [
        /* @__PURE__ */ l.jsx(ue, { id: "runs-add", size: "xs", variant: "light", disabled: s, onClick: () => {
          const g = Yc(r.rows.length === 0 && r.capture.runs.length === 0 ? r.capture.text : "");
          r.rows.push(g), c(r), i(`[data-run-row="${g.key}"] textarea`);
        }, children: b("runs.add") }),
        /* @__PURE__ */ l.jsx(ue, { id: "runs-clear", size: "xs", variant: "light", disabled: s || !r.rows.length, onClick: () => {
          r.rows = [], c(r), i("#runs-add");
        }, children: b("runs.clear") }),
        r.rows.some((g) => !kr(g)) && /* @__PURE__ */ l.jsx(ue, { id: "runs-replace", size: "xs", variant: "light", disabled: s, onClick: () => {
          const g = Yc(r.capture.text);
          r.rows = [g], c(r), i(`[data-run-row="${g.key}"] textarea`);
        }, children: b("runs.replace") })
      ] }),
      r.error && /* @__PURE__ */ l.jsx(ee, { id: "runs-error", role: "alert", tabIndex: -1, size: "xs", c: "red", children: r.error }),
      (r.error || r.capture.version !== e.capture.version) && /* @__PURE__ */ l.jsx(ue, { id: "runs-reload", size: "xs", variant: "light", disabled: r.pending, onClick: () => {
        m();
      }, children: b("runs.reload") }),
      /* @__PURE__ */ l.jsxs(Re, { gap: "xs", children: [
        /* @__PURE__ */ l.jsx(ue, { id: "runs-apply", size: "xs", disabled: s || !pa(r), loading: r.pending, onClick: () => {
          p();
        }, children: b("runs.apply") }),
        /* @__PURE__ */ l.jsx(ue, { id: "runs-cancel", size: "xs", variant: "default", disabled: r.pending, onClick: () => {
          e.drafts.delete(o), a(), i("#runs-edit");
        }, children: b("runs.cancel") })
      ] })
    ] }) : /* @__PURE__ */ l.jsx(ue, { id: "runs-edit", size: "xs", variant: "light", disabled: e.disabled, onClick: u, children: b("runs.edit") })
  ] }) });
}
let ax = 0;
function ix(e, t) {
  return We(`text-runs-${++ax}`, e, /* @__PURE__ */ l.jsx(sx, { ...t }));
}
function cx({ assets: e, value: t, disabled: n = !1, onChange: o, onUpload: r }) {
  _e();
  const [s, a] = d.useState(null), [i, c] = d.useState(t);
  d.useEffect(() => c(t), [t]);
  const u = e.filter((p) => p.mediaType.startsWith("image/")), f = [
    { value: "", label: b("canvas.backgroundImageNone") },
    ...u.map((p) => ({
      value: p.id,
      label: `${p.path.split("/").at(-1) ?? p.path} (${p.mediaType})`
    }))
  ];
  return /* @__PURE__ */ l.jsxs(ve, { gap: "xs", className: "canvas-image-input", children: [
    /* @__PURE__ */ l.jsx(
      oo,
      {
        id: "canvas-background-image",
        label: b("canvas.backgroundImage"),
        value: i?.asset ?? "",
        data: f,
        disabled: n,
        onChange: (p) => {
          const m = p.currentTarget.value, h = m ? { asset: m, fit: i?.fit ?? "fill" } : null;
          c(h), o(h);
        }
      }
    ),
    /* @__PURE__ */ l.jsx(
      oo,
      {
        id: "canvas-background-image-fit",
        label: b("canvas.backgroundImageFit"),
        value: i?.fit ?? "fill",
        disabled: n || !i,
        data: [
          { value: "fill", label: b("canvas.imageFitFill") },
          { value: "contain", label: b("canvas.imageFitContain") },
          { value: "cover", label: b("canvas.imageFitCover") }
        ],
        onChange: (p) => {
          if (!i) return;
          const m = { ...i, fit: p.currentTarget.value };
          c(m), o(m);
        }
      }
    ),
    /* @__PURE__ */ l.jsxs(Re, { align: "end", gap: "xs", children: [
      /* @__PURE__ */ l.jsx(
        li,
        {
          id: "canvas-background-upload",
          label: b("canvas.backgroundImageUpload"),
          accept: "image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.svg",
          fileInputProps: { id: "canvas-background-upload-input" },
          value: s,
          onChange: (p) => {
            a(p), p && r(p);
          },
          disabled: n,
          clearable: !0,
          style: { flex: 1 }
        }
      ),
      i ? /* @__PURE__ */ l.jsx(
        ue,
        {
          id: "canvas-background-image-clear",
          type: "button",
          variant: "light",
          color: "red",
          disabled: n,
          onClick: () => {
            c(null), o(null);
          },
          children: b("canvas.removeBackgroundImage")
        }
      ) : null
    ] })
  ] });
}
let lx = 0;
function ux(e, t) {
  return We(
    `canvas-image-${++lx}`,
    e,
    /* @__PURE__ */ l.jsx(cx, { ...t })
  );
}
const dx = [
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
function fx({ value: e, disabled: t, onChange: n }) {
  return _e(), /* @__PURE__ */ l.jsx(
    hn.Group,
    {
      id: "canvas-anchor-group",
      name: "canvas-anchor",
      value: e,
      onChange: (o) => n(o),
      children: /* @__PURE__ */ l.jsx(ja, { cols: 3, className: "canvas-size-anchor-grid", children: dx.map((o) => /* @__PURE__ */ l.jsx(
        hn,
        {
          value: o.value,
          label: /* @__PURE__ */ l.jsx("span", { title: b(o.key), children: o.glyph }),
          "aria-label": b(o.key),
          disabled: t,
          className: "canvas-anchor"
        },
        o.value
      )) })
    }
  );
}
function px(e, t, n, o) {
  let r = (i, c) => {
  };
  function s() {
    const [i, c] = d.useState(t), [u, f] = d.useState(n);
    return d.useEffect(() => (r = (p, m) => {
      c(p), f(m);
    }, () => {
      r = () => {
      };
    }), []), /* @__PURE__ */ l.jsx(fx, { value: i, disabled: u, onChange: o });
  }
  const a = We("canvas-anchor-picker", e, /* @__PURE__ */ l.jsx(s, {}));
  return { setState: (i, c) => r(i, c), destroy: a };
}
const Zn = (e) => typeof e == "function" ? e() : e;
function mx(e) {
  _e();
  const t = Zn(e.label), n = e.title === void 0 ? void 0 : Zn(e.title), o = d.useRef(e.value), r = (s) => {
    s !== o.current && (o.current = s, e.onCommit(s));
  };
  return e.options ? /* @__PURE__ */ l.jsx(
    oo,
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
      data: e.options.map((s) => ({ value: s.value, label: Zn(s.label) })),
      classNames: e.className ? { input: e.className } : void 0,
      onChange: (s) => r(s.currentTarget.value)
    }
  ) : e.type === "textarea" ? /* @__PURE__ */ l.jsx(
    no,
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
  ) : /* @__PURE__ */ l.jsx(
    ct,
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
function hx(e) {
  _e();
  const t = Zn(e.label), n = e.title === void 0 ? void 0 : Zn(e.title);
  return /* @__PURE__ */ l.jsx(
    ue,
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
      leftSection: e.icon ? /* @__PURE__ */ l.jsx("i", { className: `ph ${e.icon}`, "aria-hidden": "true" }) : void 0,
      onClick: e.onClick,
      children: /* @__PURE__ */ l.jsx("span", { className: e.iconOnly ? "sr-only" : "toolbar-label", children: t })
    }
  );
}
let ki = 0;
function gx(e) {
  _e();
  const [t, n] = d.useState(e.checked);
  return d.useEffect(() => {
    n(e.checked);
  }, [e.checked]), /* @__PURE__ */ l.jsx(
    Jt,
    {
      id: e.id,
      label: Zn(e.label),
      checked: t,
      disabled: e.disabled,
      classNames: e.className ? { input: e.className } : void 0,
      onChange: (o) => {
        n(o.currentTarget.checked), e.onChange(o.currentTarget.checked);
      }
    }
  );
}
function No(e, t) {
  return We(`inspector-checkbox-${++ki}`, e, /* @__PURE__ */ l.jsx(gx, { ...t }));
}
function st(e, t) {
  return We(`inspector-field-${++ki}`, e, /* @__PURE__ */ l.jsx(mx, { ...t }));
}
function Qe(e, t) {
  return We(`inspector-button-${++ki}`, e, /* @__PURE__ */ l.jsx(hx, { ...t }));
}
function vx({ state: e, onClose: t }) {
  return _e(), d.useEffect(() => {
    e.open && document.querySelector("#context-menu button[role=menuitem]:not(:disabled)")?.focus();
  }, [e.open, e.items]), /* @__PURE__ */ l.jsx(
    Qn,
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
      children: /* @__PURE__ */ l.jsx(ve, { gap: 4, children: e.items.map((n, o) => n.kind === "separator" ? /* @__PURE__ */ l.jsx(as, { role: "separator" }, `separator-${o}`) : /* @__PURE__ */ l.jsx(
        ue,
        {
          type: "button",
          role: "menuitem",
          className: "context-menu-item",
          variant: "subtle",
          disabled: n.disabled,
          leftSection: /* @__PURE__ */ l.jsx("i", { className: `ph ${n.icon}`, "aria-hidden": "true" }),
          onClick: () => {
            t(), n.run();
          },
          children: b(n.key)
        },
        `${n.key}-${o}`
      )) })
    }
  );
}
function yx(e) {
  const t = { open: !1, items: [], x: 8, y: 8 };
  let n = t, o = (a) => {
  };
  function r() {
    const [a, i] = d.useState(t);
    return d.useEffect(() => (o = (c) => {
      n = c, i(c);
    }, () => {
      o = () => {
      };
    }), []), /* @__PURE__ */ l.jsx(vx, { state: a, onClose: () => o({ ...n, open: !1 }) });
  }
  const s = We("context-menu", e, /* @__PURE__ */ l.jsx(r, {}));
  return {
    open(a, i, c) {
      const u = { open: !0, items: a, x: Math.min(window.innerWidth - 240, Math.max(8, i)), y: Math.min(window.innerHeight - 400, Math.max(8, c)) };
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
const bx = {
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
}, xx = {
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
function wx({ title: e, initiallyOpen: t, bodyElement: n }) {
  _e();
  const [o, r] = d.useState(t ? e : null), s = bx[e], a = s ? b(s) : e;
  return /* @__PURE__ */ l.jsx(
    Te,
    {
      value: o,
      onChange: r,
      keepMounted: !0,
      keepMountedMode: "display-none",
      className: "dock-accordion",
      classNames: { item: "dock-section", control: "dock-section-control", panel: "dock-section-panel", content: "dock-section-content" },
      children: /* @__PURE__ */ l.jsxs(Te.Item, { value: e, children: [
        /* @__PURE__ */ l.jsx(Te.Control, { children: /* @__PURE__ */ l.jsxs(Re, { gap: "xs", wrap: "nowrap", children: [
          /* @__PURE__ */ l.jsx("span", { className: "dock-section-icon", children: /* @__PURE__ */ l.jsx("i", { className: `ph ${xx[e] ?? "ph-sliders-horizontal"}`, "aria-hidden": "true" }) }),
          /* @__PURE__ */ l.jsx(ee, { component: "span", className: "dock-section-heading", children: a })
        ] }) }),
        /* @__PURE__ */ l.jsx(Te.Panel, { children: /* @__PURE__ */ l.jsx("div", { ref: (i) => {
          i && n.parentElement !== i && i.append(n);
        } }) })
      ] })
    }
  );
}
let Sx = 0;
function Cx(e, t, n) {
  const o = document.createElement("div");
  o.className = "dock-section-host", e.append(o);
  const r = document.createElement("div");
  r.className = "dock-section-body";
  const s = `inspector-section-${++Sx}`, a = We(
    s,
    o,
    /* @__PURE__ */ l.jsx(wx, { title: t, initiallyOpen: n, bodyElement: r })
  );
  return {
    body: r,
    destroy() {
      a(), o.remove();
    }
  };
}
const E = {
  project: null,
  document: null,
  presets: [],
  slots: [],
  selection: [],
  drag: null,
  busy: !1,
  zoom: null,
  pan: { x: 0, y: 0 },
  editingText: null
}, xn = new Pb(), ma = /* @__PURE__ */ new Map(), Yt = [];
xn.onSettled = (e) => {
  Yt.push({
    label: e.label,
    ok: e.ok,
    superseded: e.superseded,
    at: performance.now() - e.waitedMs,
    waitedMs: e.waitedMs,
    ranMs: e.ranMs,
    previewSettledAt: null
  }), Yt.length > 50 && Yt.shift(), pf();
};
function ha(e, t) {
  op(e, t);
}
xn.onActiveChange = (e) => {
  E.busy = e, e ? (ep("info"), ha("ph-circle-notch", "save.working")) : tp() !== "error" && ha("ph-check-circle", "save.allChangesSaved");
};
function jx() {
  for (let e = Yt.length - 1; e >= 0; e--) {
    const t = Yt[e];
    if (t && t.previewSettledAt === null) {
      t.previewSettledAt = performance.now();
      break;
    }
  }
  pf();
}
const kx = new URLSearchParams(window.location.search).has("perf");
window.__assemblashPerf = Yt;
function pf() {
  if (!kx) return;
  let e = document.getElementById("assemblash-perf");
  e || (e = document.createElement("div"), e.id = "assemblash-perf", e.setAttribute(
    "style",
    "position:fixed;bottom:8px;left:8px;z-index:9999;font:11px/1.5 ui-monospace,monospace;background:rgba(0,0,0,.82);color:#eee;padding:6px 9px;border-radius:6px;pointer-events:none;white-space:pre"
  ), document.body.append(e));
  const t = Yt[Yt.length - 1], n = t && t.previewSettledAt !== null ? `${Math.round(t.previewSettledAt - t.at)}ms` : "…";
  e.textContent = t ? `${t.label}: waited ${t.waitedMs}ms, ran ${t.ranMs ?? "–"}ms, settled ${n}
queue ${xn.size}, records ${Yt.length}` : "no interactions yet";
}
const Ei = "#3366cc";
function Ex(e) {
  return typeof e == "string" ? e : null;
}
const mf = "#111111", hf = 2, Rx = ["rect", "ellipse"];
function Nx(e) {
  const t = e.clip;
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = t.shape;
    if (typeof n == "string") return n;
  }
  return null;
}
function Jc(e) {
  const t = e.clip;
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = t.cornerRadius;
    if (typeof n == "number") return n;
  }
  return 0;
}
function Tx(e) {
  if (e.type !== "image") return null;
  const t = e.crop;
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = t, o = n.x, r = n.y, s = n.width, a = n.height;
    if (typeof o == "number" && typeof r == "number" && typeof s == "number" && typeof a == "number")
      return { x: o, y: r, width: s, height: a };
  }
  return null;
}
function Px(e) {
  return e.type !== "image" && e.type !== "svg" ? null : (E.document?.assets ?? []).find((t) => t.id === e.asset) ?? null;
}
let Pt = null, Fo = [], Zt = null, _r = null;
function J(e) {
  const t = document.getElementById(e);
  if (!t) throw new Error(`missing element #${e}`);
  return t;
}
function Zc(e) {
  const t = document.createElement("span");
  return t.dataset.i18n = e, t.textContent = b(e), t;
}
const Ot = _b();
let ga = "", Ri = null, Ni = "layers";
const Ax = Jb(J("structure-panel"), {
  document: null,
  selectedIds: [],
  query: ga,
  history: Ri,
  dock: Ni
}, {
  setQuery(e) {
    ga = e, Ct();
  },
  select(e, t) {
    E.selection = t ? E.selection.includes(e) ? E.selection.filter((n) => n !== e) : [...E.selection, e] : [e], Ct(), jt(), at(), window.matchMedia("(max-width: 720px)").matches && Ai()?.type !== "text" && (A.structure.classList.remove("mobile-open"), A.dockToggle.setAttribute("aria-expanded", "false"));
  },
  toggleVisibility(e) {
    const t = E.document && He(De(E.document)).find((n) => n.layer.id === e)?.layer;
    t && oe(t.visible === !1 ? "show layer" : "hide layer", { op: "setVisible", id: e, visible: t.visible === !1 });
  },
  toggleLocked(e) {
    const t = E.document && He(De(E.document)).find((n) => n.layer.id === e)?.layer;
    t && oe(t.locked ? "unlock layer" : "lock layer", { op: "setLocked", id: e, locked: !t.locked });
  },
  rename(e, t) {
    oe("rename layer", { op: "rename", id: e, name: t || void 0 });
  },
  reorder(e, t, n) {
    const o = n.at === "root" ? { at: "root", index: n.index } : { at: "in", parent: n.parent, index: n.index };
    oe("reorder layer", { op: "reorder", id: e, to: o });
  },
  groupSelection() {
    E.selection.length < 2 || oe("group", { op: "group", ids: [...E.selection] });
  },
  deleteSelection() {
    Ho();
  },
  undo() {
    A.undo.click();
  },
  redo() {
    A.redo.click();
  },
  showDock(e) {
    xo(e);
  },
  contextMenu(e, t, n) {
    jt(), at(), Wo(t, n);
  }
}), Rn = yx(J("context-menu-root")), A = {
  newProject: J("new-project"),
  renameProject: J("rename-project"),
  deleteProject: J("delete-project"),
  reload: J("reload"),
  get search() {
    return J("project-search");
  },
  recents: J("recents-mount"),
  canvasEmpty: J("canvas-empty"),
  canvas: J("canvas"),
  canvasImage: J("canvas-image"),
  overlay: J("overlay"),
  structure: J("structure-panel"),
  layers: J("layers"),
  layerSearch: J("layer-search"),
  inspector: J("inspector"),
  advancedInspector: J("advanced-inspector"),
  propertiesPanel: J("properties-panel"),
  propertiesTab: J("properties-tab"),
  history: J("history"),
  layersTab: J("layers-tab"),
  historyTab: J("history-tab"),
  layersView: J("layers-view"),
  historyView: J("history-view"),
  historyShortcut: J("history-shortcut"),
  statusChromeRoot: J("status-chrome-root"),
  version: J("version"),
  selectTool: J("select-tool"),
  addPanel: J("add-panel"),
  addPanelTitle: J("add-panel-title"),
  addPanelClose: J("add-panel-close"),
  dockToggle: J("dock-toggle"),
  addText: J("add-text"),
  addShape: J("add-shape"),
  addImage: J("add-image"),
  uploadFeedback: J("upload-feedback"),
  openTemplates: J("open-templates"),
  deleteLayer: J("delete-layer"),
  groupLayers: J("group-layers"),
  undo: J("undo"),
  redo: J("redo"),
  exportButton: J("export"),
  shutdown: J("shutdown"),
  emptyCreate: J("empty-create"),
  agents: J("agents"),
  positionPopover: J("position-popover"),
  positionClose: J("position-close"),
  positionFields: J("position-fields"),
  contextMenu: J("context-menu"),
  stageViewport: J("stage-viewport"),
  canvasControlsRoot: J("canvas-controls-root"),
  stage: J("stage"),
  zoomOut: J("zoom-out"),
  zoomValue: J("zoom-value"),
  zoomIn: J("zoom-in"),
  zoom100: J("zoom-100"),
  get templatesPanel() {
    return J("templates");
  },
  templatesToggle: J("templates-toggle"),
  get templatesClose() {
    return J("templates-close");
  },
  settings: J("settings"),
  settingsForm: J("settings-form"),
  settingFollow: J("setting-follow"),
  settingLanguage: J("setting-language"),
  settingsFontsOpen: J("settings-fonts-open"),
  settingUpdateCheck: J("setting-update-check"),
  updateNote: J("update-note"),
  canvasHints: J("canvas-hints")
};
np(
  A.statusChromeRoot,
  (e) => {
    bf(e);
  },
  (e) => {
    window.localStorage.setItem("assemblash-update-banner-v1", e), jl(null);
  }
);
const Ti = Bb({
  openProject: (e) => Mf(e),
  search: () => {
    Le("search", () => cr());
  }
}, document.querySelector(".project-combobox")), Mx = Ob();
function xs(e, t, n, o) {
  Mx.request(e, t, n, o);
}
function je(e, t = "info") {
  sp(e, t);
}
const kn = { families: [], faces: [] }, Sn = /* @__PURE__ */ new Map();
let Qc = "";
async function Le(e, t) {
  await xn.enqueue({ label: e, coalesceKey: null, run: t, onError: (n) => gn(e, n) });
}
const Ix = {
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
function Pi(e) {
  const t = Ix[e.code];
  return t ? b(t) : `${e.message} (${e.code})`;
}
function gn(e, t) {
  ha("ph-warning-circle", "save.needsAttention"), t instanceof nt ? je(Pi(t), "error") : je(b("errors.unexpected", { message: String(t) }), "error");
}
J("add-template-section").append(J("templates-mantine-mount"));
const qt = Wb({
  project: () => E.project,
  document: () => E.document,
  say: je,
  guard: Le,
  refresh: () => ot()
}), so = Tb({
  project: () => E.project,
  document: () => E.document,
  say: je,
  guard: Le,
  refresh: () => ot(),
  fontsChanged: (e) => {
    kn.families = [...e.families], kn.faces = [...e.faces], at();
  }
}, J("fonts-mantine-mount")), Dx = mb({
  project: () => E.project,
  document: () => E.document,
  say: je,
  guard: Le
}), Ox = Ib({
  create: async (e, t, n, o) => {
    let r = !1;
    return await Le("create", async () => {
      await Ny(e, t, n, o, e), await cr(e), je(b("projects.created", { id: e })), r = !0;
    }), r;
  }
}), gf = cb({ say: je });
A.agents.addEventListener("click", () => {
  Ot.isOpen() && Ot.close();
}, { capture: !0 });
const vf = "assemblash-follow-v1";
function va() {
  return window.localStorage.getItem(vf) !== "off";
}
function $x(e = "settings-agents") {
  A.settingFollow.checked = va();
  const t = Ra(), n = t === "pseudo" ? "en" : t;
  A.settingLanguage.value = n, Ot.open(e, { follow: va(), language: n });
}
A.settings.addEventListener("click", () => $x());
A.settingLanguage.value = Ra();
A.settingLanguage.addEventListener("change", () => {
  up(A.settingLanguage.value);
});
Qf(() => {
  for (const t of document.querySelectorAll("[data-effect-action]")) {
    const n = t.dataset.effectAction, o = b(n, { effect: t.dataset.effectType ?? "" });
    t.title = o;
    const r = t.querySelector(".sr-only");
    r && (r.textContent = o);
  }
  for (const t of document.querySelectorAll("[data-paint-label-key]")) {
    const n = b(t.dataset.paintLabelKey).toLowerCase();
    t.title = t instanceof HTMLInputElement ? b("canvas.noColor", { label: n }) : b("canvas.removeColor", { label: n });
  }
  for (const t of document.querySelectorAll("[data-resize-handle]"))
    t.setAttribute("aria-label", b("canvas.resizeHandle", { handle: t.dataset.resizeHandle ?? "" }));
  for (const t of document.querySelectorAll("[data-slot-name]"))
    t.title = b("slots.editHint", { name: t.dataset.slotName ?? "" });
  const e = A.canvasImage.dataset.previewName;
  e && (A.canvasImage.alt = b("canvas.previewAlt", { name: e })), E.document && (A.version.textContent = ke(Ve(E.document)), Ea(
    `${ke(Math.round(E.document.canvas.width))} × ${ke(Math.round(E.document.canvas.height))}`
  ), or());
});
A.settingFollow.addEventListener("change", () => {
  window.localStorage.setItem(vf, A.settingFollow.checked ? "on" : "off");
});
A.settingsFontsOpen.addEventListener("click", () => {
  Ot.close(), Le("fonts", () => Li(!0));
});
const Lx = "assemblash-update-banner-v1";
async function yf() {
  let e;
  try {
    e = await By();
  } catch {
    return;
  }
  A.settingUpdateCheck.checked = e.consent === "notify", Cl(e.consent === null);
  const t = window.localStorage.getItem(Lx), n = e.newer && !!e.latest && t !== e.latest;
  jl(n && e.latest ? {
    version: e.latest,
    text: b("updates.versionAvailable", { latest: e.latest, current: e.current }),
    notesUrl: e.notesUrl ?? null
  } : null);
}
async function bf(e) {
  try {
    const t = await Vy(e);
    Cl(t.consent === null), A.settingUpdateCheck.checked = t.consent === "notify", je(t.consent === "notify" ? b("updates.checkOn") : b("updates.checkOff"));
  } catch (t) {
    gn(b("updates.saveChoiceFailed"), t), yf();
  }
}
A.settingUpdateCheck.addEventListener("change", () => {
  bf(A.settingUpdateCheck.checked ? "notify" : "off");
});
A.settingsForm.addEventListener("submit", (e) => {
  e.submitter?.value === "cancel" && Ot.close();
});
function Ai() {
  if (!E.document || E.selection.length !== 1) return null;
  const e = E.selection[0];
  return He(De(E.document)).find(({ layer: t }) => t.id === e)?.layer ?? null;
}
function It() {
  if (!E.document) return [];
  const e = new Set(E.selection);
  return He(De(E.document)).map(({ layer: t }) => t).filter((t) => e.has(t.id));
}
function ao(e, t = !1) {
  const n = Or(e);
  if (n && (!t || e.protected || e.readOnly)) return n;
  if (!E.document) return null;
  const o = He(De(E.document));
  let r = o.find((s) => s.layer.id === e.id)?.parent;
  for (; r; ) {
    const s = o.find((i) => i.layer.id === r);
    if (!s) break;
    const a = Or(s.layer);
    if (a) return a;
    r = s.parent;
  }
  return null;
}
function dt(e) {
  return ao(e) === null;
}
function _x(e, t) {
  let n = 0, o = { x: 0, y: 0 };
  const r = () => {
    window.clearTimeout(n), n = 0;
  };
  e.addEventListener("pointerdown", (s) => {
    s.pointerType !== "touch" && s.pointerType !== "pen" || (o = { x: s.clientX, y: s.clientY }, n = window.setTimeout(() => {
      Wo(o.x, o.y), navigator.vibrate?.(20);
    }, 550));
  }), e.addEventListener("pointermove", (s) => {
    Math.hypot(s.clientX - o.x, s.clientY - o.y) > 8 && r();
  }), e.addEventListener("pointerup", r), e.addEventListener("pointercancel", r);
}
let el = null, tl;
function zx() {
  !E.project || el === E.project || (el = E.project, A.canvasHints.hidden = !1, window.clearTimeout(tl), tl = window.setTimeout(() => {
    A.canvasHints.hidden = !0;
  }, 5e3));
}
let nl = 0;
async function ot() {
  if (!E.project) return;
  const e = ++nl, t = await wi(E.project);
  e !== nl || !E.project || yo(t);
}
function yo(e) {
  E.document = e, E.selection = E.selection.filter(
    (t) => He(De(e)).some(({ layer: n }) => n.id === t)
  ), A.version.textContent = ke(Ve(e)), A.canvasEmpty.hidden = !0, A.canvas.hidden = !1, A.canvasControlsRoot.hidden = !1, zx(), Ea(
    `${ke(Math.round(e.canvas.width))} × ${ke(Math.round(e.canvas.height))}`
  ), E.slots = e.slots ?? [], Zt !== null && Ve(e) !== Zt && bo(), Mi(), Ct(), jt(), at(), Fx().catch((t) => gn("presets", t)), Yx().catch((t) => gn("history", t));
}
let ol = 0;
async function Fx() {
  if (!E.project) return;
  const e = ++ol, t = await Xy(E.project);
  e === ol && (E.presets = t);
}
let zs = null, So = null, xf = null;
function Mi() {
  if (!E.project || !E.document || (xf = zr(), So = Ve(E.document), zs)) return;
  const e = E.project;
  zs = (async () => {
    try {
      for (; So !== null; ) {
        const t = So;
        So = null;
        const n = await _o(aa(e, t, zr())), o = E.document;
        if (E.project !== e || !o || Ve(o) !== t) {
          URL.revokeObjectURL(n);
          continue;
        }
        const r = A.canvasImage.src;
        A.canvasImage.src = n, r.startsWith("blob:") && URL.revokeObjectURL(r), !E.drag && (Zt === null || t >= Zt) && bo(), A.canvasImage.dataset.previewName = o.name ?? e, A.canvasImage.alt = b("canvas.previewAlt", { name: o.name ?? e }), A.canvas.style.aspectRatio = `${o.canvas.width} / ${o.canvas.height}`, or(), jx();
      }
    } catch (t) {
      gn("preview", t);
    } finally {
      zs = null, So !== null && Mi();
    }
  })();
}
function Ii() {
  !E.document || zr() === xf || Mi();
}
function Bx() {
  const e = window.getComputedStyle(A.stage), t = (n) => {
    const o = Number.parseFloat(n);
    return Number.isFinite(o) ? Math.max(0, o) : 0;
  };
  return {
    horizontal: t(e.paddingLeft) + t(e.paddingRight),
    vertical: t(e.paddingTop) + t(e.paddingBottom)
  };
}
function wf() {
  if (!E.document) return 1;
  const e = Bx(), t = Math.max(1, A.stageViewport.clientWidth - e.horizontal), n = Math.max(1, A.stageViewport.clientHeight - e.vertical);
  return Math.min(
    t / E.document.canvas.width,
    n / E.document.canvas.height,
    1
  );
}
function ws() {
  return E.zoom ?? wf();
}
function zr() {
  if (!E.document) return 1;
  const e = Math.max(1, window.devicePixelRatio || 1);
  return Math.min(1, Math.max(0.1, ws() * e));
}
function Ct() {
  Ax.setSnapshot({
    document: E.document,
    selectedIds: E.selection,
    query: ga,
    history: Ri,
    dock: Ni
  });
}
function Bo(e, t) {
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
function jt() {
  if (A.overlay.replaceChildren(), !E.document) return;
  const { width: e, height: t } = E.document.canvas, n = He(De(E.document)), o = n.flatMap(({ layer: c, parent: u }) => {
    const f = Bo(n, u);
    return f ? [{
      layer: c,
      x: c.transform.x + f.x,
      y: c.transform.y + f.y,
      width: c.transform.width,
      height: c.transform.height
    }] : [];
  });
  for (const c of o) {
    const u = document.createElement("div");
    u.className = "layer-hitbox", u.dataset.id = c.layer.id, u.style.left = `${c.x / e * 100}%`, u.style.top = `${c.y / t * 100}%`, u.style.width = `${c.width / e * 100}%`, u.style.height = `${c.height / t * 100}%`, u.style.transformOrigin = "center", u.style.transform = `rotate(${c.layer.transform.rotation ?? 0}deg)`, u.addEventListener("pointerdown", (f) => {
      f.shiftKey || f.ctrlKey || f.metaKey ? E.selection = E.selection.includes(c.layer.id) ? E.selection.filter((p) => p !== c.layer.id) : [...E.selection, c.layer.id] : E.selection.includes(c.layer.id) || (E.selection = [c.layer.id]), Ct(), at(), jt();
    }), u.addEventListener("dblclick", (f) => {
      f.stopPropagation(), c.layer.type === "text" && io(c.layer);
    }), u.addEventListener("contextmenu", (f) => {
      f.preventDefault(), E.selection.includes(c.layer.id) || (E.selection = [c.layer.id]), Ct(), at(), jt(), Wo(f.clientX, f.clientY);
    }), _x(u), A.overlay.append(u);
  }
  const r = o.filter(({ layer: c }) => E.selection.includes(c.id));
  if (r.length === 0) return;
  ew(r.map(({ layer: c }) => c.id));
  const s = r.length === 1 ? {
    x: r[0].x,
    y: r[0].y,
    width: r[0].width,
    height: r[0].height
  } : Ci(r.map((c) => ({
    x: c.x,
    y: c.y,
    width: c.width,
    height: c.height,
    rotation: c.layer.transform.rotation ?? 0
  }))), a = document.createElement("div");
  if (a.className = "handle-box", a.style.left = `${s.x / e * 100}%`, a.style.top = `${s.y / t * 100}%`, a.style.width = `${s.width / e * 100}%`, a.style.height = `${s.height / t * 100}%`, a.style.transformOrigin = "center", r.length === 1 && (a.style.transform = `rotate(${r[0]?.layer.transform.rotation ?? 0}deg)`), a.dataset.ids = E.selection.join(","), a.addEventListener("contextmenu", (c) => {
    c.preventDefault(), c.stopPropagation(), Wo(c.clientX, c.clientY);
  }), r.every(({ layer: c }) => dt(c))) {
    a.addEventListener("pointerdown", (u) => Fs(u, r, s, "move")), a.addEventListener("dblclick", (u) => {
      u.stopPropagation();
      const f = r.length === 1 && r[0]?.layer.type === "text" ? r[0].layer : null;
      f && io(f);
    });
    for (const u of ["nw", "n", "ne", "e", "se", "s", "sw", "w"]) {
      const f = document.createElement("button");
      f.type = "button", f.className = `resize-handle handle-${u}`, f.dataset.handle = u, f.dataset.resizeHandle = u, f.setAttribute("aria-label", b("canvas.resizeHandle", { handle: u })), f.addEventListener("pointerdown", (p) => {
        p.stopPropagation(), Fs(p, r, s, "resize", u);
      }), a.append(f);
    }
    const c = document.createElement("button");
    c.type = "button", c.className = "rotation-handle", c.setAttribute("aria-label", b("canvas.rotateSelection")), c.dataset.i18nAttr = "aria-label:canvas.rotateSelection", c.innerHTML = '<i class="ph ph-arrow-clockwise" aria-hidden="true"></i>', c.addEventListener("pointerdown", (u) => {
      u.stopPropagation(), Fs(u, r, s, "rotate");
    }), a.append(c);
  } else
    a.classList.add("guarded"), a.title = r.map(({ layer: c }) => ao(c)).filter(Boolean).join("; ");
  A.overlay.append(a);
}
function Vx(e) {
  if (!E.document) return;
  const t = E.document.canvas, n = document.createElement("form");
  n.id = "canvas-settings", n.className = "canvas-settings", n.setAttribute("aria-label", b("canvas.settingsLabel")), n.innerHTML = [
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
  ye.push(st(o, {
    id: "canvas-width",
    label: () => b("canvas.widthPx"),
    value: String(t.width),
    type: "number",
    min: 0,
    step: "any",
    onMount: (T) => {
      s = T, N();
    },
    onCommit: () => {
    }
  })), ye.push(st(r, {
    id: "canvas-height",
    label: () => b("canvas.heightPx"),
    value: String(t.height),
    type: "number",
    min: 0,
    step: "any",
    onMount: (T) => {
      a = T, N();
    },
    onCommit: () => {
    }
  }));
  const c = n.querySelector("#canvas-transparent-mount"), u = n.querySelector("#canvas-size-anchor-grid"), f = n.querySelector(".canvas-anchor-fieldset"), p = n.querySelector("#canvas-apply-mount");
  let m = t.background ?? "#ffffff", h = t.backgroundImage ?? null, g = t.background == null, v = "top-left";
  Er(
    n.querySelector("#canvas-background-paint"),
    "canvas-background",
    b("common.background"),
    m,
    !1,
    (T) => {
      m = T, g = !1, k(), N();
    }
  );
  const x = () => ({
    id: "canvas-transparent",
    label: () => b("canvas.transparentBackground"),
    checked: g,
    onChange(T) {
      g = T, N();
    }
  });
  let w = No(c, x());
  ye.push(() => w());
  function k() {
    Sa(() => {
      w(), w = No(c, x());
    });
  }
  const C = px(u, v, !0, (T) => {
    v = T, N();
  });
  ye.push(C.destroy), ye.push(ux(n.querySelector("#canvas-background-image-mount"), {
    assets: E.document.assets ?? [],
    value: h,
    onChange(T) {
      h = T, oe(T ? "set canvas background image" : "clear canvas background image", T ? { op: "updateCanvas", backgroundImage: T } : { op: "updateCanvas", clearBackgroundImage: !0 });
    },
    onUpload(T) {
      const S = E.project;
      S && Le("upload canvas background image", async () => {
        const y = await Si(S, T), R = {
          op: "updateCanvas",
          backgroundImage: { asset: y.asset.id, fit: h?.fit ?? "fill" }
        }, D = await An(S, R, y.version);
        je(b("status.editDone", { version: D.version })), D.document ? yo(D.document) : await ot();
      });
    }
  })), ye.push(Qe(p, {
    id: "canvas-apply",
    type: "submit",
    label: () => b("canvas.applyChanges"),
    className: "primary",
    disabled: !0,
    onMount: (T) => {
      i = T, N();
    },
    onClick: () => {
    }
  }));
  const j = () => !!(s && a && (Number(s.value) !== t.width || Number(a.value) !== t.height));
  function N() {
    if (!(!s || !a || !i)) {
      for (const T of [s, a])
        T.setCustomValidity(Number.isFinite(T.valueAsNumber) && T.valueAsNumber > 0 ? "" : b("canvas.invalidDimension"));
      f.disabled = !j(), C.setState(v, !j()), i.disabled = !j() && rl(g ? null : m, t.background ?? null);
    }
  }
  n.addEventListener("input", N), n.addEventListener("change", N), n.addEventListener("submit", (T) => {
    if (T.preventDefault(), N(), !i || i.disabled || !n.reportValidity() || !s || !a) return;
    const S = g ? null : m, y = {
      op: "updateCanvas",
      ...j() ? { width: Number(s.value), height: Number(a.value), anchor: v } : {},
      ...rl(S, t.background ?? null) ? {} : { background: S }
    };
    i.disabled = !0, oe("update canvas", y);
  }), N(), e.append(n);
}
function Vo(e, t) {
  const n = Cx(
    e,
    t,
    !["Clip and mirror", "Appearance", "Effects", "Presets", "Slots"].includes(t)
  );
  return Cf.push(n.destroy), n.body;
}
const Sf = [], ye = [], Cf = [];
let un = 0;
function Er(e, t, n, o, r, s, a, i, c = !1) {
  ye.push(ex(e, { id: t, label: n, value: o, disabled: r, onCommit: s, className: a, clear: i, compact: c }));
}
function rl(e, t) {
  return JSON.stringify(e) === JSON.stringify(t);
}
function sl(e, t) {
  const n = Eb({ store: () => kn }, (o) => {
    oe("change font", { op: "update", id: e.id, fontFamily: o });
  });
  return Sf.push(n), n.setFamily(e.fontFamily), n.setDisabled(t), n;
}
let al = "";
function Hx(e) {
  const t = e.map((n) => n.id).join(",");
  t !== al && e.length === 1 && e[0]?.type === "text" && (xo("properties"), window.matchMedia("(max-width: 720px)").matches && (A.structure.classList.add("mobile-open"), A.dockToggle.setAttribute("aria-expanded", "true"))), al = t;
}
function at() {
  Sa(Wx);
}
function Wx() {
  for (const S of Sf.splice(0)) S.destroy();
  for (const S of ye.splice(0)) S();
  for (const S of Cf.splice(0)) S();
  da(A.inspector), da(A.advancedInspector), A.inspector.replaceChildren(), A.advancedInspector.replaceChildren();
  let e = A.advancedInspector;
  const t = (S) => (e = Vo(A.advancedInspector, S), e), n = It(), o = n.length === 1 ? n[0] ?? null : null;
  Hx(n);
  const r = n.map((S) => S.id).join(",");
  if (r !== Qc && (Sn.clear(), Qc = r), A.deleteLayer.disabled = n.length === 0 || n.some((S) => !dt(S)), A.groupLayers.disabled = n.length < 2 || n.some((S) => !dt(S)), $i(n), E.document) {
    const S = document.createElement("span");
    S.style.display = "contents", ye.push(Qe(S, {
      id: "edit-canvas",
      label: () => b("editor.canvasSizeBackground"),
      icon: "ph-frame-corners",
      className: "toolbar-action",
      onClick() {
        Rn.close(), E.selection = [], Ct(), jt(), at(), xo("properties");
      }
    })), A.inspector.append(S);
  }
  if (n.length === 0) {
    const S = document.createElement("div");
    S.className = "inspector-empty", S.innerHTML = '<i class="ph ph-cursor-click" aria-hidden="true"></i><span data-i18n="editor.selectLayerHint">Select a layer to edit it</span>', A.inspector.append(S);
    const y = document.createElement("p");
    if (y.className = "empty-panel-copy", y.dataset.i18n = E.document ? "editor.setCanvasHint" : "editor.openProjectHint", y.textContent = b(E.document ? "editor.setCanvasHint" : "editor.openProjectHint"), e.append(y), E.document) {
      const R = Vo(A.advancedInspector, "Canvas");
      Vx(R);
    }
    return;
  }
  const s = n.some((S) => !dt(S));
  let a = 0;
  const i = (S, y, R, D = s, O = "toolbar-action", z, _ = !1) => {
    const F = document.createElement("span");
    return F.className = "inspector-button-host", F.style.display = "contents", ye.push(Qe(F, {
      id: `inspector-action-${++a}`,
      label: () => b(S),
      icon: y,
      className: O,
      iconOnly: _,
      disabled: D,
      onMount($) {
        $.title = b(S), z?.($);
      },
      onClick: R
    })), F;
  };
  if (o?.type === "text") {
    const S = document.createElement("label");
    S.className = "toolbar-field toolbar-font", S.append(Zc("editor.fontFamily")), S.firstElementChild?.classList.add("sr-only");
    const y = sl(o, s);
    S.append(y.root), A.inspector.append(S);
    const R = document.createElement("span");
    R.className = "toolbar-field toolbar-number", ye.push(st(R, {
      id: "toolbar-font-size",
      label: () => b("editor.fontSize"),
      value: String(o.fontSize),
      type: "number",
      size: "xs",
      min: 1,
      disabled: s,
      className: "toolbar-font-size",
      onCommit: (z) => {
        oe("change font size", {
          op: "update",
          id: o.id,
          fontSize: Number(z)
        });
      }
    })), A.inspector.append(R);
    const D = document.createElement("div");
    D.className = "toolbar-paint", Er(
      D,
      "text-color",
      b("editor.textColour"),
      o.color ?? "#000000",
      s,
      (z) => {
        oe("change colour", { op: "update", id: o.id, color: z });
      },
      "toolbar-colour",
      void 0,
      !0
    ), A.inspector.append(D);
    for (const [z, _] of [
      ["left", "ph-text-align-left"],
      ["center", "ph-text-align-center"],
      ["right", "ph-text-align-right"]
    ]) {
      const F = {
        left: "editor.alignLeft",
        center: "editor.alignCenter",
        right: "editor.alignRight"
      }[z], $ = i(F, _, () => {
        oe(`align text ${z}`, { op: "update", id: o.id, align: z });
      }, s, "icon-button toolbar-icon", (I) => {
        I.classList.toggle("selected", (o.align ?? "left") === z);
      }, !0);
      A.inspector.append($);
    }
    const O = document.createElement("span");
    O.className = "toolbar-divider", A.inspector.append(O);
  } else {
    const S = document.createElement("span");
    S.className = "selection-label", n.length === 1 ? S.textContent = o?.type ?? b("editor.layerGeneric") : (S.dataset.i18nCount = "editor.layerCount", S.dataset.count = String(n.length), S.textContent = At("editor.layerCount", n.length)), A.inspector.append(S);
  }
  const c = n.map((S) => S.id);
  if (A.inspector.append(
    i("editor.centreHorizontally", "ph-align-center-horizontal", () => {
      oe("centre horizontally", { op: "centerOnCanvas", ids: c, axis: "horizontal" });
    }),
    i("editor.centreVertically", "ph-align-center-vertical", () => {
      oe("centre vertically", { op: "centerOnCanvas", ids: c, axis: "vertical" });
    }),
    i("position.title", "ph-bounding-box", () => co(), !1, "toolbar-action position-button"),
    i("layers.groupButton", "ph-stack", () => {
      c.length > 1 && oe("group", { op: "group", ids: c });
    }, s || c.length < 2),
    i("editor.duplicate", "ph-copy", () => {
      vt("duplicate", c.map((S) => ({ op: "duplicate", id: S })));
    })
  ), !o) {
    const S = document.createElement("p");
    S.className = "empty-panel-copy";
    const y = n.filter((D) => D.type === "text"), R = y.length > 1 && new Set(y.map((D) => D.fontFamily)).size > 1;
    S.dataset.i18n = R ? "properties.mixedFonts" : "editor.selectionCountHint", S.textContent = R ? b("properties.mixedFonts") : b("editor.selectionCountHint", { count: n.length }), e.append(S);
    return;
  }
  const u = ao(o);
  if (u) {
    const S = document.createElement("p");
    S.className = "guarded-note", S.textContent = u, e.append(S);
  }
  const f = (S, y, R, D = "number", O, z, _ = !1) => {
    const F = document.createElement("div");
    F.className = "field", ye.push(st(F, {
      id: z ?? `field-${S.replaceAll(".", "-")}`,
      label: () => b(S),
      value: y,
      type: D,
      className: z,
      disabled: u !== null || _,
      list: O,
      onCommit($) {
        if ($ === y) return;
        const I = R($);
        I && oe(`change ${b(S)}`, I);
      }
    })), e.append(F);
  }, p = (S, y, R, D, O, z = !1) => {
    const _ = document.createElement("div");
    _.className = "field", ye.push(st(_, {
      id: y,
      label: () => b(S),
      value: R,
      className: y,
      disabled: u !== null || z,
      options: D,
      onCommit: O
    })), e.append(_);
  }, m = (S, y, R, D, O) => {
    const z = document.createElement("div");
    z.className = "field paint-field", Er(
      z,
      y,
      b(S),
      R,
      u !== null,
      (_) => {
        oe(`change ${b(S)}`, D(_));
      },
      y,
      O ? {
        label: b("canvas.none"),
        className: O.className,
        title: b("canvas.removeColor", { label: b(S).toLowerCase() }),
        disabled: O.disabled,
        onClear: O.onClear
      } : void 0
    ), e.append(z);
  };
  if (o.type === "text") {
    e = t("Typography");
    const S = document.createElement("span");
    S.style.display = "contents", ye.push(Qe(S, {
      id: "edit-layer-text",
      label: () => b("canvas.editText"),
      icon: "ph-pencil-simple",
      className: "wide-action edit-text-button",
      disabled: u !== null,
      onClick: () => io(o)
    })), e.append(S);
    const y = kn.families.includes(o.fontFamily), R = document.createElement("div");
    R.className = "current-font-summary";
    const D = document.createElement("strong");
    D.className = "current-font-family", D.textContent = o.fontFamily;
    const O = document.createElement("span");
    if (O.className = "current-font-face", O.textContent = `${o.fontWeight ?? 400} · ${o.fontStyle ?? "normal"} · ${o.fontSize} px`, R.append(D, O), y) {
      const P = document.createElement("span");
      P.className = "current-font-specimen";
      const B = kn.faces.find(
        (W) => W.family === o.fontFamily && W.weight === (o.fontWeight ?? 400) && W.style === (o.fontStyle ?? "normal")
      );
      if (B)
        af(P, B);
      else {
        const W = document.createElement("span");
        W.className = "font-specimen-status", W.textContent = b("fonts.previewUnavailable"), P.append(W);
      }
      R.append(P);
    } else {
      const P = document.createElement("p");
      P.className = "current-font-status", P.dataset.i18n = "properties.fontMissing", P.textContent = b("properties.fontMissing");
      const B = document.createElement("span");
      B.style.display = "contents", ye.push(Qe(B, {
        id: "install-fonts",
        label: () => b("fonts.installFonts"),
        className: "small",
        onClick: () => {
          Le("fonts", () => Li(!0));
        }
      })), R.append(P, B);
    }
    e.append(R);
    const z = document.createElement("label");
    z.className = "field", z.append(Zc("properties.font"));
    const _ = sl(o, u !== null);
    z.append(_.root), e.append(z), f("properties.fontSize", String(o.fontSize), (P) => ({ op: "update", id: o.id, fontSize: Number(P) })), f("properties.lineHeight", String(o.lineHeight ?? 1.2), (P) => ({ op: "update", id: o.id, lineHeight: Number(P) })), f("properties.paragraphSpacing", String(o.paragraphSpacing ?? 0), (P) => ({ op: "update", id: o.id, paragraphSpacing: Number(P) }));
    const F = cf(o.fontFamily, kn.faces);
    if (F.length) {
      const P = o.fontWeight ?? 400, B = o.fontStyle ?? "normal", W = [.../* @__PURE__ */ new Set([
        ...F.filter((U) => U.style === B).map((U) => U.weight),
        P
      ])].sort((U, Y) => U - Y);
      p(
        "properties.weight",
        "font-weight",
        String(P),
        W.map((U) => ({ value: String(U), label: String(U) })),
        (U) => {
          oe("change Weight", { op: "update", id: o.id, fontWeight: Number(U) });
        }
      );
    } else
      f("properties.weight", String(o.fontWeight ?? 400), (P) => ({ op: "update", id: o.id, fontWeight: Number(P) }));
    f("properties.letterSpacing", String(o.letterSpacing ?? 0), (P) => ({ op: "update", id: o.id, letterSpacing: Number(P) }));
    const $ = o.fontStyle ?? "normal", I = o.fontWeight ?? 400, L = F.filter((P) => P.weight === I).map((P) => P.style === "oblique" ? "italic" : P.style), M = F.length ? [.../* @__PURE__ */ new Set([...L, $])] : [$];
    if (p(
      "properties.style",
      "font-style",
      o.fontStyle ?? "normal",
      M.map((P) => ({ value: P, label: P })),
      (P) => {
        oe("change font style", { op: "update", id: o.id, fontStyle: P });
      }
    ), p(
      "properties.verticalAlign",
      "vertical-align",
      o.verticalAlign ?? "top",
      ["top", "middle", "bottom"].map((P) => ({ value: P, label: P })),
      (P) => {
        oe("change vertical align", { op: "update", id: o.id, verticalAlign: P });
      }
    ), m(
      "properties.colour",
      "text-fill",
      o.color ?? "#000000",
      (P) => ({ op: "update", id: o.id, color: P })
    ), m(
      "properties.strokeColour",
      "text-stroke",
      o.stroke?.color ?? "#000000",
      (P) => ({ op: "update", id: o.id, stroke: { color: P, width: o.stroke?.width ?? 1 } }),
      { className: "text-stroke-none", disabled: !o.stroke, onClear: () => {
        oe("clear text stroke", { op: "update", id: o.id, stroke: null });
      } }
    ), f("properties.strokeWidth", String(o.stroke?.width ?? 1), (P) => ({ op: "update", id: o.id, stroke: { color: o.stroke?.color ?? "#000000", width: Number(P) } })), E.project && E.document) {
      const P = ul(E.project, E.document, o), B = document.createElement("div");
      e.append(B), ye.push(ix(B, {
        capture: P,
        layer: o,
        drafts: ma,
        disabled: u !== null,
        fonts: { store: () => kn },
        submit: Jx,
        reload: async () => {
          const W = await xn.outcome("reload runs", async () => {
            if (E.project !== P.project || E.document?.id !== P.document) throw new Error(b("runs.notSent"));
            const U = await wi(P.project);
            if (E.project !== P.project || E.document?.id !== P.document) throw new Error(b("runs.notSent"));
            const Y = He(De(U)).find((ae) => ae.layer.id === P.layer)?.layer;
            if (!Y || Y.type !== "text") throw new Error(b("runs.notSent"));
            ma.set(ji(P), ff(ul(P.project, U, Y))), yo(U);
          });
          return W.status === "refused" ? String(W.error) : null;
        }
      }));
    }
  }
  t("Transform");
  const h = document.createElement("div");
  h.className = "property-grid";
  const g = (S, y, R) => {
    const D = `transform-${S.split(".").at(-1)}`, O = document.createElement("div");
    O.className = "field", ye.push(st(O, {
      id: D,
      label: () => b(S),
      value: y,
      type: "number",
      className: D,
      disabled: u !== null,
      onCommit(z) {
        const _ = R(z);
        _ && oe(`change ${b(S)}`, _);
      }
    })), h.append(O);
  }, v = o.transform;
  if (g("properties.x", String(v.x), (S) => cl(o, Number(S), v.y)), g("properties.y", String(v.y), (S) => cl(o, v.x, Number(S))), g("properties.width", String(v.width), (S) => ll(o, Number(S), v.height)), g("properties.height", String(v.height), (S) => ll(o, v.width, Number(S))), g("properties.rotation", String(v.rotation ?? 0), (S) => ({ op: "rotate", id: o.id, degrees: Number(S) })), g("properties.opacity", String(o.opacity ?? 1), (S) => ({ op: "update", id: o.id, opacity: Number(S) })), e.append(h), (o.type === "image" || o.type === "svg") && (e = t("Media"), p(
    "properties.fit",
    "layer-fit",
    o.fit ?? "fill",
    Hy.map((S) => ({ value: S, label: S })),
    (S) => {
      oe("change fit", { op: "update", id: o.id, fit: S });
    }
  ), o.type === "image")) {
    const S = Tx(o), y = Px(o), R = y?.width ?? null, D = y?.height ?? null, O = typeof R == "number" && R > 0 && typeof D == "number" && D > 0, z = document.createElement("p");
    z.className = "hint";
    const _ = O ? "canvas.cropAvailableHint" : "canvas.cropUnavailableHint";
    z.dataset.i18n = _, z.textContent = b(_), e.append(z);
    const F = S ?? { x: 0, y: 0, width: R ?? 0, height: D ?? 0 }, $ = (P, B, W, U) => {
      f(P, String(W), (Y) => U(Number(Y)), "number", void 0, B, !O);
    }, I = (P) => !Number.isFinite(P.x) || !Number.isFinite(P.y) || !(P.width > 0) || !(P.height > 0) ? null : { op: "update", id: o.id, crop: P };
    $("canvas.cropX", "crop-x", F.x, (P) => I({ ...F, x: P })), $("canvas.cropY", "crop-y", F.y, (P) => I({ ...F, y: P })), $("canvas.cropWidth", "crop-width", F.width, (P) => I({ ...F, width: P })), $("canvas.cropHeight", "crop-height", F.height, (P) => I({ ...F, height: P }));
    const L = document.createElement("div");
    L.className = "field";
    const M = document.createElement("span");
    M.style.display = "contents", ye.push(Qe(M, {
      id: "clear-image-crop",
      label: () => b("canvas.clearCrop"),
      title: () => b("canvas.wholeImage"),
      className: "small crop-clear",
      disabled: u !== null || S === null,
      onClick: () => {
        oe("clear crop", { op: "update", id: o.id, crop: null });
      }
    })), L.append(M), e.append(L);
  }
  if (o.type === "shape") {
    e = t("Shape");
    const S = nf(o), y = o.stroke?.color ?? mf, R = o.stroke?.width ?? hf, D = (P, B, W, U, Y, ae) => {
      const fe = document.createElement("div");
      fe.className = "field shape-field";
      const ie = document.createElement("span");
      ie.dataset.i18n = P, ie.textContent = b(P);
      const te = document.createElement("span");
      te.className = "shape-paint", Er(
        te,
        B,
        b(P),
        W,
        u !== null,
        (me) => {
          oe(`change ${b(P)}`, Y(me));
        },
        B,
        {
          label: b("canvas.none"),
          className: `small ${B}-none`,
          title: b("canvas.removeColor", { label: b(P).toLowerCase() }),
          disabled: !U,
          onClear: () => {
            oe(`clear ${b(P)}`, ae());
          }
        }
      ), U || (te.title = b("canvas.noColor", { label: b(P).toLowerCase() })), fe.append(ie, te), e.append(fe);
    };
    D(
      "properties.fill",
      "shape-fill",
      o.fill ?? Ei,
      !!o.fill,
      (P) => ({ op: "update", id: o.id, fill: P }),
      () => ({ op: "update", id: o.id, fill: null })
    ), D(
      "properties.stroke",
      "shape-stroke",
      y,
      !!o.stroke,
      (P) => ({ op: "update", id: o.id, stroke: { color: P, width: R } }),
      () => ({ op: "update", id: o.id, stroke: null })
    ), f(
      "properties.strokeWidth",
      String(R),
      (P) => ({
        op: "update",
        id: o.id,
        stroke: { color: y, width: Number(P) }
      }),
      "number",
      void 0,
      "shape-stroke-width"
    ), S === "rect" && f(
      "properties.cornerRadius",
      String(Wy(o)),
      (P) => ({ op: "update", id: o.id, cornerRadius: Number(P) }),
      "number",
      void 0,
      "shape-corner-radius"
    );
    const O = (P, B) => {
      const W = Sn.get(B);
      if (!W) return;
      const U = document.createElement("span");
      U.className = `control-error ${B}-note`, U.textContent = W, P.append(U);
    }, z = (P) => (B) => {
      Sn.set(
        P,
        B instanceof nt ? Pi(B) : String(B)
      ), at();
    }, _ = document.createElement("div");
    _.className = "field shape-field shape-path";
    const F = o.shape, $ = S === "path" && typeof F.d == "string" ? F.d : "";
    ye.push(st(_, {
      id: "shape-path-d",
      label: () => b("canvas.pathData"),
      type: "textarea",
      value: $,
      className: "shape-path-d",
      rows: 3,
      maxLength: 2048,
      disabled: u !== null,
      onCommit: (P) => {
        const B = P.trim();
        !B || B === $ || (Sn.delete("path-d"), oe("set path data", {
          op: "update",
          id: o.id,
          shape: { kind: "path", d: B }
        }, z("path-d")));
      }
    })), O(_, "path-d"), e.append(_);
    const I = document.createElement("div");
    I.className = "field shape-field shape-dash-row";
    const L = (o.stroke?.dashArray ?? []).join(", ");
    ye.push(st(I, {
      id: "shape-dash",
      label: () => b("canvas.dashPattern"),
      type: "text",
      value: L,
      className: "shape-dash",
      placeholder: b("canvas.dashExample"),
      disabled: u !== null,
      onCommit: (P) => {
        const B = P.trim();
        Sn.delete("dash");
        const W = B ? B.split(",").map((Y) => Number(Y.trim())) : [];
        if (W.some((Y) => !Number.isFinite(Y) || Y <= 0)) {
          Sn.set("dash", b("canvas.dashPositiveError")), at();
          return;
        }
        if (W.length > $c) {
          Sn.set("dash", b("canvas.dashMaxError", { count: $c })), at();
          return;
        }
        const U = {
          ...o.stroke ?? { color: y, width: R },
          dashArray: W.length ? W : null
        };
        oe("change dash pattern", { op: "update", id: o.id, stroke: U }, z("dash"));
      }
    })), O(I, "dash"), e.append(I);
    const M = (P, B, W, U) => {
      const Y = o.stroke?.[W], ae = typeof Y == "string" ? Y : null, fe = ae && !U.includes(ae) ? [...U, ae] : [...U];
      p(P, B, ae ?? U[0] ?? "", fe.map((ie) => ({ value: ie, label: ie })), (ie) => {
        const te = {
          ...o.stroke ?? { color: y, width: R },
          [W]: ie
        };
        oe(`change ${b(P).toLowerCase()}`, { op: "update", id: o.id, stroke: te });
      });
    };
    if (M("properties.lineCap", "shape-stroke-cap", "lineCap", ["butt", "round", "square"]), M("properties.lineJoin", "shape-stroke-join", "lineJoin", ["miter", "round", "bevel"]), S === "line") {
      const P = (B, W, U) => {
        const Y = F[U], ae = typeof Y == "string" && Y !== "none" && !["arrow", "circle"].includes(Y) ? ["none", "arrow", "circle", Y] : ["none", "arrow", "circle"];
        p(
          B,
          W,
          typeof Y == "string" ? Y : "none",
          ae.map((fe) => ({ value: fe, label: fe })),
          (fe) => {
            oe(`change ${b(B).toLowerCase()}`, {
              op: "update",
              id: o.id,
              [U]: fe
            });
          }
        );
      };
      P("properties.markerStart", "shape-marker-start", "markerStart"), P("properties.markerEnd", "shape-marker-end", "markerEnd");
    }
  }
  e = t("Clip and mirror");
  const x = Nx(o), w = [...Rx];
  x && !w.includes(x) && w.push(x), p("properties.clip", "clip-shape", x ?? "none", ["none", ...w].map((S) => ({ value: S, label: S })), (S) => {
    if (S === (x ?? "none")) return;
    const y = S === "none" ? null : S === "rect" ? { shape: "rect", cornerRadius: Jc(o) } : { shape: S };
    oe("change clip", { op: "update", id: o.id, clip: y });
  }), x === "rect" && f(
    "properties.clipRadius",
    String(Jc(o)),
    (S) => ({
      op: "update",
      id: o.id,
      clip: { shape: "rect", cornerRadius: Number(S) }
    }),
    "number",
    void 0,
    "clip-radius"
  );
  const k = document.createElement("div");
  k.className = "property-flags";
  const C = (S, y, R, D) => {
    const O = document.createElement("div");
    O.className = "field checkbox", ye.push(No(O, {
      id: y,
      label: () => b(S),
      checked: D,
      disabled: u !== null,
      className: y,
      onChange: (z) => {
        oe(b(S).toLowerCase(), { op: "update", id: o.id, [R]: z });
      }
    })), k.append(O);
  };
  C("properties.flipHorizontal", "flip-horizontal", "flipHorizontal", o.transform.flipHorizontal ?? !1), C("properties.flipVertical", "flip-vertical", "flipVertical", o.transform.flipVertical ?? !1), e.append(k), e = t("Appearance"), p(
    "properties.blendMode",
    "blend-mode",
    o.blendMode ?? "normal",
    Uy.map((S) => ({ value: S, label: S })),
    (S) => {
      oe("change blend mode", { op: "update", id: o.id, blendMode: S });
    }
  ), Ux(A.advancedInspector, o, u !== null), qx(A.advancedInspector, o, u !== null), Kx(A.advancedInspector, o);
  const j = document.createElement("div");
  j.className = "property-flags";
  const N = document.createElement("div");
  N.className = "field checkbox", ye.push(No(N, {
    id: "layer-visible",
    label: () => b("properties.visible"),
    checked: o.visible ?? !0,
    disabled: u !== null,
    onChange: (S) => {
      oe("show/hide", { op: "setVisible", id: o.id, visible: S });
    }
  }));
  const T = document.createElement("div");
  T.className = "field checkbox", ye.push(No(T, {
    id: "layer-locked",
    label: () => b("properties.locked"),
    checked: o.locked ?? !1,
    disabled: ao(o, !0) !== null,
    onChange: (S) => {
      oe(S ? "lock layer" : "unlock layer", { op: "setLocked", id: o.id, locked: S });
    }
  })), j.append(N, T), e.append(j);
}
function Ux(e, t, n) {
  const o = t.effects ?? [], r = Vo(e, "Effects"), s = (f) => {
    oe("effects", { op: "update", id: t.id, effects: f });
  };
  for (const [f, p] of o.entries()) {
    const m = document.createElement("div");
    m.className = "effect-row", m.dataset.effect = p.type;
    const h = document.createElement("span");
    h.className = "effect-name", h.textContent = p.type.replace(/([A-Z])/g, " $1").replace(/^./, (k) => k.toUpperCase()), m.append(h);
    const g = qy(p);
    g.length > 1 && m.classList.add("multi");
    const v = (k) => {
      const C = document.createElement("span");
      C.className = "effect-input-host";
      const j = `effect-${t.id}-${f}-${k.name}`;
      return ye.push(st(C, {
        id: j,
        label: `${h.textContent} ${k.name}`,
        value: String(k.value),
        type: k.kind === "color" ? "text" : "number",
        step: k.kind === "number" ? "0.05" : void 0,
        disabled: n,
        onMount: (N) => {
          N.dataset.field = k.name;
        },
        onCommit: (N) => {
          const T = k.kind === "color" ? N.trim() : Number(N);
          typeof T == "number" && !Number.isFinite(T) || T !== k.value && s(o.map((S, y) => y === f ? { ...S, [k.name]: T } : S));
        }
      })), C;
    };
    if (g.length === 1 && g[0])
      m.append(v(g[0]));
    else if (g.length > 1) {
      const k = document.createElement("span");
      k.className = "effect-fields";
      for (const C of g) {
        const j = document.createElement("label");
        j.className = "effect-field";
        const N = document.createElement("span");
        N.textContent = C.name, j.append(N, v(C)), k.append(j);
      }
      m.append(k);
    }
    const x = (k) => {
      const C = [...o], j = C[f], N = C[k];
      !j || !N || (C[f] = N, C[k] = j, s(C));
    }, w = (k, C, j, N, T) => {
      const S = document.createElement("span");
      return S.style.display = "contents", ye.push(Qe(S, {
        id: `effect-action-${t.id}-${f}-${k}`,
        className: k,
        label: C,
        title: C,
        icon: j,
        disabled: N,
        onClick: T
      })), S;
    };
    m.append(
      w("small effect-up", b("effects.moveUp", { effect: p.type }), "ph-arrow-up", n || f === 0, () => x(f - 1)),
      w("small effect-down", b("effects.moveDown", { effect: p.type }), "ph-arrow-down", n || f === o.length - 1, () => x(f + 1)),
      w("small effect-remove", b("effects.remove"), "ph-trash", n, () => s(o.filter((k, C) => C !== f)))
    ), r.append(m);
  }
  const a = document.createElement("div");
  a.className = "effect-add-row";
  let i = Lc[0] ?? "brightness";
  const c = document.createElement("span");
  ye.push(st(c, {
    id: `effect-chooser-${t.id}`,
    label: () => b("effects.choose"),
    value: i,
    className: "effect-chooser",
    disabled: n,
    options: Lc.map((f) => ({ value: f, label: f.replace(/([A-Z])/g, " $1").replace(/^./, (p) => p.toUpperCase()) })),
    onCommit: (f) => {
      i = f;
    }
  }));
  const u = document.createElement("span");
  u.style.display = "contents", ye.push(Qe(u, {
    id: `effect-add-${t.id}`,
    className: "effect-add",
    icon: "ph-plus",
    label: () => b("effects.add"),
    disabled: n,
    onClick: () => {
      const f = A.advancedInspector.querySelector(".effect-chooser");
      f && (i = f.value), s([...o, Ky(i)]);
    }
  })), a.append(c, u), r.append(a);
}
function qx(e, t, n) {
  const o = Vo(e, "Presets");
  if (E.presets.length === 0) {
    const a = document.createElement("p");
    a.className = "hint", a.dataset.i18n = "presets.none", a.textContent = b("presets.none"), o.append(a);
  }
  for (const a of E.presets) {
    const i = document.createElement("div");
    i.className = "preset-row";
    const c = document.createElement("span");
    c.className = "effect-name", c.textContent = a.name, a.description && (c.title = a.description), i.append(c);
    const u = document.createElement("span");
    u.style.display = "contents", ye.push(Qe(u, {
      id: `preset-apply-${++un}`,
      label: () => b("common.apply"),
      className: "small",
      disabled: n,
      onClick: () => {
        oe(`apply ${a.name}`, {
          op: "applyPreset",
          id: t.id,
          preset: a.name
        });
      }
    })), i.append(u);
    const f = document.createElement("span");
    f.style.display = "contents", ye.push(Qe(f, {
      id: `preset-remove-${++un}`,
      label: () => b("common.delete"),
      className: "small",
      onClick: () => {
        oe(`delete ${a.name}`, {
          op: "deletePreset",
          name: a.name
        });
      }
    })), i.append(f), o.append(i);
  }
  const r = document.createElement("div");
  r.className = "inspector-add-row";
  const s = document.createElement("span");
  s.style.display = "contents", ye.push(Qe(s, {
    id: `preset-save-${++un}`,
    label: () => b("presets.saveStyle"),
    onClick: () => {
      xs("presets.saveTitle", "presets.name", "presets.saveButton", (a) => {
        oe(`define ${a}`, {
          op: "definePreset",
          preset: { name: a, properties: Yy(t) }
        });
      });
    }
  })), r.append(s), o.append(r);
}
function Kx(e, t) {
  const n = Vo(e, "Slots");
  for (const i of E.slots) {
    const c = document.createElement("div");
    c.className = "slot-row";
    const u = document.createElement("span");
    u.className = "effect-name", u.textContent = `${i.name}${i.required ? " *" : ""}`, u.title = i.description ?? `${i.kind ?? "text"} → ${i.layer}`, i.layer === t.id && u.classList.add("slot-on-this-layer"), c.append(u);
    const f = document.createElement("span");
    f.style.display = "contents", ye.push(Qe(f, {
      id: `slot-edit-${++un}`,
      label: () => b("common.edit"),
      className: "small slot-edit",
      title: () => b("slots.editHint", { name: i.name }),
      onMount(m) {
        m.dataset.slot = i.name, m.dataset.slotName = i.name;
      },
      onClick: () => Xx(c, i)
    })), c.append(f);
    const p = document.createElement("span");
    p.style.display = "contents", ye.push(Qe(p, {
      id: `slot-remove-${++un}`,
      label: () => b("common.remove"),
      className: "small",
      onClick: () => {
        oe(`remove slot ${i.name}`, {
          op: "removeSlot",
          name: i.name
        });
      }
    })), c.append(p), n.append(c);
  }
  const o = document.createElement("div");
  o.className = "inspector-add-row";
  let r = t.type === "image" ? "image" : "text";
  const s = document.createElement("span");
  s.style.display = "contents", ye.push(st(s, {
    id: `slot-kind-${++un}`,
    label: () => b("slots.kind"),
    value: r,
    className: "slot-kind-select",
    options: ["text", "image", "color"].map((i) => ({ value: i, label: i })),
    onCommit: (i) => {
      r = i;
    }
  }));
  const a = document.createElement("span");
  a.style.display = "contents", ye.push(Qe(a, {
    id: `slot-offer-${++un}`,
    label: () => b("slots.offer"),
    onClick: () => {
      xs("slots.createTitle", "slots.name", "slots.createButton", (i) => {
        oe(`offer ${i}`, {
          op: "defineSlot",
          slot: { name: i, layer: t.id, kind: r }
        });
      });
    }
  })), o.append(s, a), n.append(o);
}
function Xx(e, t) {
  e.replaceChildren();
  const n = document.createElement("span"), o = document.createElement("span"), r = document.createElement("span"), s = document.createElement("span"), a = document.createElement("span");
  for (const u of [n, o, r, s, a]) u.style.display = "contents";
  e.append(n, o, r, s, a);
  const i = ++un;
  ye.push(st(n, {
    id: `slot-edit-name-${i}`,
    label: () => b("slots.name"),
    value: t.name,
    className: "slot-edit-name",
    onCommit: () => {
    }
  })), ye.push(st(o, {
    id: `slot-edit-kind-${i}`,
    label: () => b("slots.kind"),
    value: t.kind ?? "text",
    className: "slot-edit-kind",
    options: ["text", "image", "color"].map((u) => ({ value: u, label: u })),
    onCommit: () => {
    }
  })), ye.push(st(r, {
    id: `slot-edit-layer-${i}`,
    label: () => b("slots.layerId"),
    title: () => b("slots.layerIdHint"),
    value: t.layer,
    className: "slot-edit-layer",
    onCommit: () => {
    }
  }));
  const c = (u) => {
    if (!u) {
      at();
      return;
    }
    const f = e.querySelector(".slot-edit-name")?.value.trim() ?? "";
    f && oe(`update slot ${t.name}`, {
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
  ye.push(Qe(s, {
    id: `slot-edit-save-${i}`,
    label: () => b("common.save"),
    className: "small slot-edit-save",
    onClick: () => c(!0)
  })), ye.push(Qe(a, {
    id: `slot-edit-cancel-${i}`,
    label: () => b("common.cancel"),
    className: "small",
    onClick: () => c(!1)
  })), e.addEventListener("keydown", (u) => {
    u.key === "Enter" && (u.preventDefault(), c(!0)), u.key === "Escape" && (u.preventDefault(), u.stopPropagation(), c(!1));
  }), e.querySelector(".slot-edit-name")?.focus();
}
let il = 0;
async function Yx() {
  if (!E.project) return;
  const e = ++il, t = await My(E.project);
  e === il && (Ri = { entries: t.entries, position: t.position, head: t.head }, Ct(), A.undo.disabled = t.position === 0, A.redo.disabled = t.position >= t.head);
}
function cl(e, t, n) {
  const o = t - e.transform.x, r = n - e.transform.y;
  return o === 0 && r === 0 ? null : { op: "move", id: e.id, dx: o, dy: r };
}
function ll(e, t, n) {
  return t === e.transform.width && n === e.transform.height ? null : { op: "resize", id: e.id, width: t, height: n };
}
function Gx(e) {
  if (!("id" in e) || e.op !== "update") return null;
  const t = e.id;
  if (typeof t != "string") return null;
  const n = Object.keys(e).filter((o) => o !== "op" && o !== "id" && o !== "expectedVersion").sort();
  return n.length > 0 ? `update:${t}:${n.join(",")}` : null;
}
function jf(e) {
  if (!E.document) return !1;
  let t = !1;
  for (const n of e)
    if (n.op === "move" || n.op === "resize" || n.op === "rotate") {
      const o = He(De(E.document)).find(({ layer: r }) => r.id === n.id)?.layer;
      if (!o) continue;
      n.op === "move" ? (o.transform.x += n.dx, o.transform.y += n.dy) : n.op === "resize" ? (o.transform.width = n.width, o.transform.height = n.height) : o.transform.rotation = n.degrees, t = !0;
    }
  return t && (jt(), ka() && $i(It())), t;
}
function kf() {
  const e = E.project, t = E.document ? structuredClone(E.document) : null;
  return () => {
    if (!t || E.project !== e) return;
    const n = E.document;
    if (n && Ve(n) === Ve(t)) {
      bo(), E.document = t, Ct(), jt(), at();
      return;
    }
    Le("reload", ot);
  };
}
function ul(e, t, n) {
  return { project: e, document: t.id, layer: n.id, version: Ve(t), text: n.text, runs: n.runs ?? [] };
}
async function Jx(e) {
  const t = rx(e);
  if (!t) return { status: "applied" };
  let n = !1;
  const o = await xn.outcome("apply runs", async () => {
    const r = e.capture;
    if (E.project !== r.project || E.document?.id !== r.document || E.selection.length !== 1 || E.selection[0] !== r.layer) throw new Error(b("runs.notSent"));
    const s = He(De(E.document)).find((c) => c.layer.id === r.layer)?.layer;
    if (!s || ao(s)) throw new Error(b("runs.notSent"));
    const a = await An(r.project, t, r.version);
    n = !0;
    const i = a.document ?? await wi(r.project);
    if (E.project !== r.project || E.document?.id !== r.document) throw new Error(b("runs.notSent"));
    ma.delete(ji(r)), yo(i), je(b("status.editDone", { version: a.version }));
  });
  return o.status === "applied" ? { status: "applied" } : (gn("apply runs", o.error), { status: n ? "committed" : o.error instanceof nt ? "refused" : "unknown", error: n ? b("runs.committed") : o.error instanceof nt ? Pi(o.error) : `${b("runs.failed")} ${String(o.error)}` });
}
async function oe(e, t, n) {
  if (!E.project || !E.document) return;
  const o = E.project, r = kf();
  let s = !1;
  jf([t]), await xn.enqueue({
    label: e,
    coalesceKey: Gx(t),
    run: async () => {
      if (E.project !== o || !E.document) {
        je(b("status.editNotSent"), "error");
        return;
      }
      const a = await An(
        o,
        t,
        Ve(E.document)
      );
      s = !0, je(b("status.editDone", { version: a.version })), a.created?.length && (E.selection = a.created), a.document ? yo(a.document) : await ot();
    },
    onError: (a) => {
      s || r(), n && n(a), gn(e, a);
    },
    onSuperseded: r
  });
}
async function Zx(e, t) {
  await vt(e, t);
}
async function vt(e, t) {
  if (!E.project || !E.document || t.length === 0) return;
  const n = E.project, o = kf();
  let r = !1;
  jf(t), await xn.enqueue({
    label: e,
    coalesceKey: null,
    run: async () => {
      if (E.project !== n || !E.document) {
        je(b("status.editNotSent"), "error");
        return;
      }
      const s = await Iy(
        n,
        e,
        t,
        Ve(E.document)
      );
      r = !0, s.created?.length && (E.selection = s.created), je(b("status.editDone", { version: s.version })), s.document ? yo(s.document) : await ot();
    },
    onError: (s) => {
      r || o(), gn(e, s);
    }
  });
}
function Fs(e, t, n, o, r) {
  if (e.preventDefault(), !(!E.document || A.canvas.getBoundingClientRect().width === 0)) {
    if (E.drag = {
      ids: t.map(({ layer: s }) => s.id),
      mode: o,
      handle: r,
      startX: e.clientX,
      startY: e.clientY,
      bounds: n,
      origins: t.map(({ layer: s, x: a, y: i, width: c, height: u }) => ({
        id: s.id,
        x: s.transform.x,
        y: s.transform.y,
        absoluteX: a,
        absoluteY: i,
        width: c,
        height: u,
        rotation: s.transform.rotation ?? 0
      })),
      preserveSelectionScale: o === "resize" && t.length === 1 && t[0]?.layer.type === "text"
    }, !Qx(E.drag)) {
      Zt !== null && bo(), dl(E.drag);
      const s = Pt;
      !E.drag.previewActive && s && s.pending.then(() => {
        E.drag && Pt === s && dl(E.drag);
      });
    }
    e.target.setPointerCapture?.(e.pointerId);
  }
}
function Qx(e) {
  return e.mode !== "move" || !E.document || _r === null || Zt !== Ve(E.document) ? !1 : (e.adoptedDelta = _r, e.previewActive = !0, Oi(e, e.lastDelta?.x ?? 0, e.lastDelta?.y ?? 0), !0);
}
function Ef(e) {
  return !E.project || !E.document ? null : `${E.project}:${Ve(E.document)}:${[...e].sort().join(",")}`;
}
function Rf() {
  const e = Pt;
  Pt = null, e && (e.baseUrl && !Fo.includes(e.baseUrl) && URL.revokeObjectURL(e.baseUrl), e.selectionUrl && !Fo.includes(e.selectionUrl) && URL.revokeObjectURL(e.selectionUrl));
}
async function ew(e) {
  const t = Ef(e);
  if (!t || !E.project || !E.document) return;
  if (Pt?.key === t) return Pt.pending;
  Rf();
  const n = E.project, o = Ve(E.document), r = zr(), s = {
    key: t,
    pending: Promise.resolve()
  };
  return Pt = s, s.pending = Promise.all([
    _o(aa(n, o, r, { exclude: e })),
    _o(aa(n, o, r, { only: e }))
  ]).then(([a, i]) => {
    if (Pt !== s) {
      URL.revokeObjectURL(a), URL.revokeObjectURL(i);
      return;
    }
    s.baseUrl = a, s.selectionUrl = i;
  }).catch(() => {
    Pt === s && (Pt = null);
  }), s.pending;
}
function dl(e) {
  const t = Pt;
  if (e.previewActive || t?.key !== Ef(e.ids) || !t.baseUrl || !t.selectionUrl) return;
  const n = document.createElement("img");
  n.id = "drag-preview-base", n.className = "drag-preview-image", n.alt = "", n.src = t.baseUrl;
  const o = document.createElement("img");
  o.id = "drag-preview-selection", o.className = "drag-preview-image drag-preview-selection", o.alt = "", o.src = t.selectionUrl, A.overlay.before(n, o), A.canvasImage.classList.add("drag-preview-hidden"), Fo = [t.baseUrl, t.selectionUrl], e.previewActive = !0, Oi(e, e.lastDelta?.x ?? 0, e.lastDelta?.y ?? 0);
}
function bo() {
  document.getElementById("drag-preview-base")?.remove(), document.getElementById("drag-preview-selection")?.remove(), A.canvasImage.classList.remove("drag-preview-hidden");
  for (const e of Fo) URL.revokeObjectURL(e);
  Fo = [], Zt = null, _r = null;
}
function Di(e, t, n) {
  const o = e.origins.length === 1 ? e.origins[0] : null;
  return o ? hb(
    e.bounds,
    o.rotation,
    e.handle ?? "se",
    t,
    n
  ) : ca(e.bounds, e.handle ?? "se", t, n);
}
function Oi(e, t, n) {
  if (!E.document || !e.previewActive) return;
  const o = document.getElementById("drag-preview-selection");
  if (!o) return;
  const r = E.document.canvas;
  if (o.style.transformOrigin = "0 0", e.mode === "move") {
    const s = e.adoptedDelta?.x ?? 0, a = e.adoptedDelta?.y ?? 0;
    o.style.transform = `translate(${(s + t) / r.width * 100}%, ${(a + n) / r.height * 100}%)`;
  } else if (e.mode === "resize") {
    const s = Di(e, t, n);
    if (e.preserveSelectionScale) {
      const f = s.x + s.width / 2 - (e.bounds.x + e.bounds.width / 2), p = s.y + s.height / 2 - (e.bounds.y + e.bounds.height / 2);
      o.style.transform = `translate(${f / r.width * 100}%, ${p / r.height * 100}%)`;
      return;
    }
    const a = s.width / Math.max(1, e.bounds.width), i = s.height / Math.max(1, e.bounds.height);
    if (e.origins.length === 1) {
      const f = e.origins[0]?.rotation ?? 0, p = s.x + s.width / 2 - (e.bounds.x + e.bounds.width / 2), m = s.y + s.height / 2 - (e.bounds.y + e.bounds.height / 2);
      o.style.transformOrigin = `${(e.bounds.x + e.bounds.width / 2) / r.width * 100}% ${(e.bounds.y + e.bounds.height / 2) / r.height * 100}%`, o.style.transform = `translate(${p / r.width * 100}%, ${m / r.height * 100}%) rotate(${f}deg) scale(${a}, ${i}) rotate(${-f}deg)`;
      return;
    }
    const c = s.x - e.bounds.x * a, u = s.y - e.bounds.y * i;
    o.style.transform = `translate(${c / r.width * 100}%, ${u / r.height * 100}%) scale(${a}, ${i})`;
  } else {
    const s = A.canvas.getBoundingClientRect(), a = s.left + (e.bounds.x + e.bounds.width / 2) / r.width * s.width, i = s.top + (e.bounds.y + e.bounds.height / 2) / r.height * s.height, c = Math.atan2(e.startY - i, e.startX - a), u = Math.atan2(e.startY + n / Fr() - i, e.startX + t / Fr() - a);
    o.style.transformOrigin = `${(e.bounds.x + e.bounds.width / 2) / r.width * 100}% ${(e.bounds.y + e.bounds.height / 2) / r.height * 100}%`, o.style.transform = `rotate(${(u - c) * 180 / Math.PI}deg)`;
  }
}
function Fr() {
  const e = A.canvas.getBoundingClientRect();
  return !E.document || e.width === 0 ? 1 : E.document.canvas.width / e.width;
}
window.addEventListener("pointermove", (e) => {
  const t = E.drag;
  if (!t || !E.document) return;
  const n = Fr();
  let o = (e.clientX - t.startX) * n, r = (e.clientY - t.startY) * n;
  A.overlay.querySelectorAll(".smart-guide").forEach((c) => c.remove()), t.mode === "move" && ({ dx: o, dy: r } = tw(o, r, t.bounds, t.ids, n)), t.lastDelta = { x: o, y: r }, Oi(t, o, r);
  const s = A.overlay.querySelector(".handle-box");
  if (!s) return;
  const { width: a, height: i } = E.document.canvas;
  if (t.mode === "move")
    s.style.left = `${(t.bounds.x + o) / a * 100}%`, s.style.top = `${(t.bounds.y + r) / i * 100}%`;
  else if (t.mode === "resize") {
    const c = Di(t, o, r);
    s.style.left = `${c.x / a * 100}%`, s.style.top = `${c.y / i * 100}%`, s.style.width = `${c.width / a * 100}%`, s.style.height = `${c.height / i * 100}%`;
  } else {
    const c = A.canvas.getBoundingClientRect(), u = c.left + (t.bounds.x + t.bounds.width / 2) / E.document.canvas.width * c.width, f = c.top + (t.bounds.y + t.bounds.height / 2) / E.document.canvas.height * c.height, p = Math.atan2(t.startY - f, t.startX - u), m = Math.atan2(e.clientY - f, e.clientX - u), h = t.origins.length === 1 ? t.origins[0]?.rotation ?? 0 : 0;
    s.style.transform = `rotate(${h + (m - p) * 180 / Math.PI}deg)`;
  }
});
window.addEventListener("pointerup", async (e) => {
  const t = E.drag;
  if (E.drag = null, !t) return;
  const n = Fr(), o = Math.round(t.lastDelta?.x ?? (e.clientX - t.startX) * n), r = Math.round(t.lastDelta?.y ?? (e.clientY - t.startY) * n);
  if (o === 0 && r === 0) {
    Zt === null && bo();
    return;
  }
  if (Zt = Ve(E.document) + 1, _r = t.mode === "move" ? {
    x: (t.adoptedDelta?.x ?? 0) + o,
    y: (t.adoptedDelta?.y ?? 0) + r
  } : null, t.mode === "move") {
    vt("move selection", t.ids.map((p) => ({ op: "move", id: p, dx: o, dy: r })));
    return;
  }
  if (t.mode === "resize") {
    let p = Di(t, o, r);
    if (t.ids.length === 1 && (t.handle === "e" || t.handle === "w") && E.project && E.document) {
      const g = He(De(E.document)).find(({ layer: v }) => v.id === t.ids[0])?.layer;
      if (g?.type === "text")
        try {
          const v = await rf(E.project, g.id, p.width), x = Math.max(1, Math.ceil(v.height));
          p = {
            ...p,
            y: p.y + (p.height - x) / 2,
            height: x
          };
        } catch {
        }
    }
    const h = [];
    for (const g of t.origins) {
      const v = t.origins.length === 1 ? p : sf(
        {
          x: g.absoluteX,
          y: g.absoluteY,
          width: g.width,
          height: g.height
        },
        t.bounds,
        p
      ), x = Math.round(v.x - g.absoluteX), w = Math.round(v.y - g.absoluteY);
      (x !== 0 || w !== 0) && h.push({ op: "move", id: g.id, dx: x, dy: w }), h.push({
        op: "resize",
        id: g.id,
        width: Math.max(1, Math.round(v.width)),
        height: Math.max(1, Math.round(v.height))
      });
    }
    vt("resize selection", h);
    return;
  }
  const s = A.canvas.getBoundingClientRect(), a = s.left + (t.bounds.x + t.bounds.width / 2) / E.document.canvas.width * s.width, i = s.top + (t.bounds.y + t.bounds.height / 2) / E.document.canvas.height * s.height, c = Math.atan2(t.startY - i, t.startX - a), f = (Math.atan2(e.clientY - i, e.clientX - a) - c) * 180 / Math.PI;
  vt(
    "rotate selection",
    t.origins.map((p) => ({
      op: "rotate",
      id: p.id,
      degrees: Math.round((p.rotation + f) * 10) / 10
    }))
  );
});
function tw(e, t, n, o, r) {
  if (!E.document) return { dx: e, dy: t };
  const s = 6 * r, a = He(De(E.document));
  let i = n;
  if (o.length === 1) {
    const y = a.find(({ layer: D }) => D.id === o[0]), R = y ? Bo(a, y.parent) : null;
    y && R && (i = ia({
      x: y.layer.transform.x + R.x,
      y: y.layer.transform.y + R.y,
      width: y.layer.transform.width,
      height: y.layer.transform.height,
      rotation: y.layer.transform.rotation ?? 0
    }));
  }
  const c = [
    i.x + e,
    i.x + i.width / 2 + e,
    i.x + i.width + e
  ], u = [
    i.y + t,
    i.y + i.height / 2 + t,
    i.y + i.height + t
  ], f = [0, E.document.canvas.width / 2, E.document.canvas.width], p = [0, E.document.canvas.height / 2, E.document.canvas.height], m = [];
  for (const { layer: y, parent: R } of a) {
    if (o.includes(y.id)) continue;
    const D = Bo(a, R);
    if (!D) continue;
    const O = ia({
      x: y.transform.x + D.x,
      y: y.transform.y + D.y,
      width: y.transform.width,
      height: y.transform.height,
      rotation: y.transform.rotation ?? 0
    });
    m.push({
      left: O.x,
      right: O.x + O.width,
      top: O.y,
      bottom: O.y + O.height
    }), f.push(O.x, O.x + O.width / 2, O.x + O.width), p.push(O.y, O.y + O.height / 2, O.y + O.height);
  }
  const h = (y, R) => {
    let D = null;
    for (const O of y) for (const z of R) {
      const _ = z - O;
      Math.abs(_) <= s && (!D || Math.abs(_) < Math.abs(D.delta)) && (D = { delta: _, target: z });
    }
    return D;
  }, g = h(c, f), v = h(u, p);
  g && (e += g.delta, Wn("vertical", g.target)), v && (t += v.delta, Wn("horizontal", v.target));
  const x = i.x + e, w = x + i.width, k = m.filter((y) => y.right <= x + s).sort((y, R) => R.right - y.right)[0], C = m.filter((y) => y.left >= w - s).sort((y, R) => y.left - R.left)[0];
  if (k && C) {
    const R = k.right + (C.left - k.right - i.width) / 2 - x;
    Math.abs(R) <= s && (e += R, Wn("vertical", k.right), Wn("vertical", C.left));
  }
  const j = i.y + t, N = j + i.height, T = m.filter((y) => y.bottom <= j + s).sort((y, R) => R.bottom - y.bottom)[0], S = m.filter((y) => y.top >= N - s).sort((y, R) => y.top - R.top)[0];
  if (T && S) {
    const R = T.bottom + (S.top - T.bottom - i.height) / 2 - j;
    Math.abs(R) <= s && (t += R, Wn("horizontal", T.bottom), Wn("horizontal", S.top));
  }
  return { dx: e, dy: t };
}
function Wn(e, t) {
  if (!E.document) return;
  const n = document.createElement("div");
  n.className = `smart-guide ${e}`, e === "vertical" ? n.style.left = `${t / E.document.canvas.width * 100}%` : n.style.top = `${t / E.document.canvas.height * 100}%`, A.overlay.append(n);
}
function nr() {
  if (!E.document) return [];
  const e = He(De(E.document));
  return e.flatMap(({ layer: t, parent: n }) => {
    if (!E.selection.includes(t.id)) return [];
    const o = Bo(e, n);
    return o ? [{
      layer: t,
      x: t.transform.x + o.x,
      y: t.transform.y + o.y,
      width: t.transform.width,
      height: t.transform.height
    }] : [];
  });
}
function nw(e = nr()) {
  if (e.length === 0) return null;
  if (e.length === 1) {
    const t = e[0];
    return { x: t.x, y: t.y, width: t.width, height: t.height };
  }
  return Ci(e.map((t) => ({
    x: t.x,
    y: t.y,
    width: t.width,
    height: t.height,
    rotation: t.layer.transform.rotation ?? 0
  })));
}
function Nf(e = nr()) {
  return e.length === 0 ? null : Ci(e.map((t) => ({
    x: t.x,
    y: t.y,
    width: t.width,
    height: t.height,
    rotation: t.layer.transform.rotation ?? 0
  })));
}
function or() {
  if (!E.document) return;
  const e = wf(), t = E.zoom ?? e;
  A.canvas.style.width = `${Math.max(1, Math.round(E.document.canvas.width * t))}px`, A.canvas.style.height = `${Math.max(1, Math.round(E.document.canvas.height * t))}px`, A.zoomValue.textContent = E.zoom === null ? b("canvas.zoomFit") : `${ke(Math.round(t * 100))}%`, A.zoomValue.title = E.zoom === null ? b("canvas.zoomFitPercent", { percent: ke(Math.round(e * 100)) }) : b("canvas.zoomResetFit");
}
function ow() {
  const e = A.stageViewport.getBoundingClientRect();
  return {
    x: e.left + A.stageViewport.clientLeft + A.stageViewport.clientWidth / 2,
    y: e.top + A.stageViewport.clientTop + A.stageViewport.clientHeight / 2
  };
}
function rr(e, t = ow()) {
  const n = A.canvas.getBoundingClientRect(), o = n.width > 0 ? (t.x - n.left) / n.width : 0.5, r = n.height > 0 ? (t.y - n.top) / n.height : 0.5;
  if (E.zoom = e === null ? null : Math.min(4, Math.max(0.1, e)), or(), Ii(), E.zoom === null) {
    A.stageViewport.scrollLeft = 0, A.stageViewport.scrollTop = 0;
    return;
  }
  if (n.width <= 0 || n.height <= 0) return;
  const s = A.canvas.getBoundingClientRect();
  A.stageViewport.scrollLeft += s.left + o * s.width - t.x, A.stageViewport.scrollTop += s.top + r * s.height - t.y;
}
function io(e) {
  if (!E.document || !dt(e)) return;
  A.overlay.querySelector(".inline-text-editor")?.remove();
  const t = He(De(E.document)), n = t.find(({ layer: i }) => i.id === e.id), o = Bo(t, n?.parent ?? null);
  if (!o) return;
  const r = document.createElement("textarea");
  r.className = "inline-text-editor", r.value = e.text, r.setAttribute("aria-label", b("canvas.editText")), r.dataset.i18nAttr = "aria-label:canvas.editText", r.style.left = `${(e.transform.x + o.x) / E.document.canvas.width * 100}%`, r.style.top = `${(e.transform.y + o.y) / E.document.canvas.height * 100}%`, r.style.width = `${e.transform.width / E.document.canvas.width * 100}%`, r.style.height = `${e.transform.height / E.document.canvas.height * 100}%`, r.style.transformOrigin = "center", r.style.transform = `rotate(${e.transform.rotation ?? 0}deg)`, r.style.fontFamily = e.fontFamily, r.style.fontSize = `${Math.max(12, e.fontSize * (A.canvas.getBoundingClientRect().width / E.document.canvas.width))}px`, r.style.lineHeight = String(e.lineHeight ?? 1.2), r.style.textAlign = e.align ?? "left", r.style.color = Ex(e.color) ?? "#000000", A.overlay.append(r), E.editingText = { id: e.id, original: e.text }, r.focus(), r.select();
  let s = !1;
  const a = (i) => {
    if (s) return;
    s = !0;
    const c = r.value;
    r.remove(), E.editingText = null, i && c !== e.text ? oe("edit text", { op: "update", id: e.id, text: c }) : jt();
  };
  r.addEventListener("keydown", (i) => {
    i.key === "Escape" ? (i.preventDefault(), a(!1)) : i.key === "Enter" && (i.ctrlKey || i.metaKey) && (i.preventDefault(), a(!0));
  }), r.addEventListener("blur", () => a(!0));
}
function $i(e) {
  Sa(() => rw(e));
}
function rw(e) {
  for (const r of Bs) r();
  Bs = [];
  const t = nr(), n = nw(t);
  if (!n || e.length === 0) return;
  const o = [
    ["X", n.x, "x"],
    ["Y", n.y, "y"],
    ["W", n.width, "width"],
    ["H", n.height, "height"],
    ["°", e.length === 1 ? e[0]?.transform.rotation ?? 0 : 0, "rotation"]
  ];
  for (const [r, s, a] of o) {
    const i = st(A.positionFields, {
      id: `position-${a}`,
      label: r,
      type: "number",
      value: String(Math.round(s * 10) / 10),
      className: "position-field-input",
      disabled: e.some((c) => !dt(c)) || a === "rotation" && e.length > 1,
      onCommit: async (c) => {
        const u = Number(c);
        if (Number.isFinite(u))
          if (a === "x" || a === "y") {
            const f = a === "x" ? u - n.x : 0, p = a === "y" ? u - n.y : 0;
            vt("position selection", e.map((m) => ({ op: "move", id: m.id, dx: f, dy: p })));
          } else if (a === "rotation" && e[0])
            oe("rotate layer", { op: "rotate", id: e[0].id, degrees: u });
          else {
            if (a === "width" && e.length === 1 && e[0]?.type === "text" && E.project)
              try {
                const m = await rf(E.project, e[0].id, u);
                vt("resize text box", [{
                  op: "resize",
                  id: e[0].id,
                  width: Math.max(1, u),
                  height: Math.max(1, Math.ceil(m.height))
                }]);
                return;
              } catch {
              }
            const f = {
              ...n,
              width: a === "width" ? Math.max(1, u) : n.width,
              height: a === "height" ? Math.max(1, u) : n.height
            }, p = [];
            for (const m of t) {
              const h = t.length === 1 ? {
                x: m.x,
                y: m.y,
                width: a === "width" ? f.width : m.width,
                height: a === "height" ? f.height : m.height
              } : sf(m, n, f), g = h.x - m.x, v = h.y - m.y;
              (g || v) && p.push({ op: "move", id: m.layer.id, dx: g, dy: v }), p.push({
                op: "resize",
                id: m.layer.id,
                width: h.width,
                height: h.height
              });
            }
            vt("resize selection", p);
          }
      }
    });
    Bs.push(i);
  }
}
let Bs = [];
function co(e) {
  const t = e ?? !ka();
  if (rp(t), !t) return;
  $i(It());
  const o = A.inspector.querySelector(".position-button")?.getBoundingClientRect(), r = A.inspector.getBoundingClientRect().left + 8, s = A.structure.getBoundingClientRect().left, a = (o?.right ?? r + 320) - 320;
  A.positionPopover.style.left = `${Math.max(r, Math.min(s - 332, a))}px`, A.positionPopover.style.top = `${Math.min(window.innerHeight - 520, (o?.bottom ?? 100) + 8)}px`, A.positionPopover.querySelector("[data-canvas-anchor]")?.focus();
}
const Tf = "assemblash-layer-clipboard-v1";
function Br() {
  if (!E.project || !E.document || E.selection.length === 0) return !1;
  const e = He(De(E.document)), t = new Set(E.selection), n = e.filter(({ layer: o, parent: r }) => t.has(o.id) && (!r || !t.has(r))).map(({ layer: o }) => structuredClone(o));
  return sessionStorage.setItem(Tf, JSON.stringify({ project: E.project, layers: n })), je(At("editor.copiedLayers", n.length)), n.length > 0;
}
function Pf() {
  if (!E.project) return null;
  try {
    const e = JSON.parse(sessionStorage.getItem(Tf) ?? "null");
    return e?.project === E.project && Array.isArray(e.layers) ? e.layers : null;
  } catch {
    return null;
  }
}
function Af() {
  const e = Pf();
  if (!e || !E.project) {
    je(b("editor.nothingToPaste"), "error");
    return;
  }
  vt("paste layers", [{
    op: "insertLayerTree",
    sourceProject: E.project,
    layers: e,
    position: { at: "root" },
    offsetX: 20,
    offsetY: 20
  }]);
}
function Ho(e = "delete selection") {
  const t = It();
  t.length === 0 || t.some((n) => !dt(n)) || vt(e, t.map((n) => ({ op: "delete", id: n.id })));
}
function vr(e) {
  if (!E.document || E.selection.length !== 1) return;
  const t = E.selection[0], n = He(De(E.document)), o = n.find(({ layer: u }) => u.id === t);
  if (!o || !dt(o.layer)) return;
  const r = o.parent ? n.find(({ layer: u }) => u.id === o.parent)?.layer : null, s = r?.type === "group" ? r.children ?? [] : De(E.document), a = s.findIndex((u) => u.id === t);
  let i = a;
  if (e === "front" && (i = s.length - 1), e === "forward" && (i = Math.min(s.length - 1, a + 1)), e === "backward" && (i = Math.max(0, a - 1)), e === "back" && (i = 0), i === a) return;
  const c = o.parent ? { at: "in", parent: o.parent, index: i } : { at: "root", index: i };
  oe(`send ${e}`, { op: "reorder", id: t, to: c });
}
function Wo(e, t) {
  const n = It(), o = n.length > 0 && n.every(dt), r = n.length === 1 ? n[0] : null, s = [], a = (c, u, f, p = !1) => {
    s.push({ kind: "item", key: c, icon: u, disabled: p, run: f });
  }, i = () => {
    s.push({ kind: "separator" });
  };
  r?.type === "text" && (a("context.editText", "ph-pencil-simple", () => io(r), !o), i()), a("context.cut", "ph-scissors", () => {
    Br() && Ho("cut layers");
  }, !o), a("context.copy", "ph-copy", () => {
    Br();
  }, n.length === 0), a("context.paste", "ph-clipboard-text", Af, !Pf()), a("context.duplicate", "ph-copy-simple", () => {
    vt("duplicate", n.map((c) => ({ op: "duplicate", id: c.id })));
  }, !o), a("context.delete", "ph-trash", Ho, !o), i(), a("context.bringFront", "ph-arrow-line-up", () => vr("front"), !r || !o), a("context.bringForward", "ph-arrow-up", () => vr("forward"), !r || !o), a("context.sendBackward", "ph-arrow-down", () => vr("backward"), !r || !o), a("context.sendBack", "ph-arrow-line-down", () => vr("back"), !r || !o), i(), a("context.group", "ph-stack", () => {
    oe("group", { op: "group", ids: n.map((c) => c.id) });
  }, n.length < 2 || !o), a("context.ungroup", "ph-stack-minus", () => {
    r && oe("ungroup", { op: "ungroup", id: r.id });
  }, r?.type !== "group" || !o), a(r?.locked ? "context.unlock" : "context.lock", r?.locked ? "ph-lock-open" : "ph-lock", () => {
    r && oe(r.locked ? "unlock layer" : "lock layer", { op: "setLocked", id: r.id, locked: !r.locked });
  }, !r || ao(r, !0) !== null), a(r?.visible === !1 ? "context.show" : "context.hide", r?.visible === !1 ? "ph-eye" : "ph-eye-slash", () => {
    r && oe(r.visible === !1 ? "show layer" : "hide layer", { op: "setVisible", id: r.id, visible: r.visible === !1 });
  }, !r || !o), a("context.rename", "ph-pencil-simple", () => {
    if (!r) return;
    xo("layers");
    const c = A.layers.querySelector(`[data-id="${CSS.escape(r.id)}"]`);
    c && (c.focus(), c.dispatchEvent(new KeyboardEvent("keydown", { key: "F2", bubbles: !0 })));
  }, !r || !o), i(), a("context.alignLeft", "ph-align-left-simple", () => Un("left"), !o), a("context.alignHorizontalCenters", "ph-align-center-horizontal", () => Un("centerHorizontal"), !o), a("context.alignRight", "ph-align-right-simple", () => Un("right"), !o), a("context.alignTop", "ph-align-top-simple", () => Un("top"), !o), a("context.alignVerticalMiddles", "ph-align-center-vertical", () => Un("centerVertical"), !o), a("context.alignBottom", "ph-align-bottom-simple", () => Un("bottom"), !o), a("context.distributeHorizontally", "ph-columns", () => {
    oe("distribute horizontally", { op: "distribute", ids: n.map((c) => c.id), axis: "horizontal" });
  }, !o || n.length < 3), a("context.distributeVertically", "ph-rows", () => {
    oe("distribute vertically", { op: "distribute", ids: n.map((c) => c.id), axis: "vertical" });
  }, !o || n.length < 3), Rn.open(s, e, t);
}
function Un(e) {
  if (!E.document) return;
  const t = It(), n = t.map((a) => a.id);
  if (t.length !== 1) {
    oe("align selection", { op: "align", ids: n, edge: e });
    return;
  }
  const o = Nf(nr());
  if (!o) return;
  let r = 0, s = 0;
  e === "left" && (r = -o.x), e === "centerHorizontal" && (r = E.document.canvas.width / 2 - (o.x + o.width / 2)), e === "right" && (r = E.document.canvas.width - (o.x + o.width)), e === "top" && (s = -o.y), e === "centerVertical" && (s = E.document.canvas.height / 2 - (o.y + o.height / 2)), e === "bottom" && (s = E.document.canvas.height - (o.y + o.height)), (r !== 0 || s !== 0) && oe("align layer to canvas", { op: "move", id: t[0].id, dx: r, dy: s });
}
function Mf(e) {
  Le("open", async () => {
    E.project = e, Ti.setCurrentProject(e), E.selection = [], bo(), Rf(), await If();
  });
}
async function If() {
  try {
    await ot();
  } catch (e) {
    const t = e instanceof nt ? e.details : null, n = t && typeof t.pid == "number" ? t.pid : null;
    if (!(e instanceof nt) || e.code !== "projectLocked" || n === null || !E.project || !window.confirm(b("projects.recoverLockConfirm", { pid: n }))) throw e;
    await Ay(E.project, n), await ot(), je(b("projects.recovered"));
  }
  if (await qt.projectChanged(), A.renameProject.disabled = !E.project, A.deleteProject.disabled = !E.project, A.reload.disabled = !E.project, je(b("projects.opened", { name: E.document?.name ?? E.project ?? "" })), E.project)
    try {
      const e = await Ey(E.project);
      if (e.reclaimedLock) {
        const { pid: t, host: n } = e.reclaimedLock;
        je(
          b("projects.reclaimedLock", { pid: t, host: n })
        );
      }
    } catch (e) {
      console.error("could not check for an automatically reclaimed lock", e);
    }
}
A.reload.addEventListener("click", () => {
  Le("reload", async () => {
    await ot(), je(b("projects.refreshed"));
  });
});
A.newProject.addEventListener("click", () => Ox.open());
A.emptyCreate.addEventListener("click", () => A.newProject.click());
A.agents.addEventListener("click", () => {
  gf.open();
});
const fl = [
  ["add-text-section", "toolbar.textButton", A.addText],
  ["add-shape-section", "toolbar.elementsButton", A.addShape],
  ["add-upload-section", "toolbar.uploadsButton", A.addImage],
  ["add-template-section", "toolbar.templatesButton", A.templatesToggle],
  ["add-fonts-section", "toolbar.fontsButton", A.selectTool]
];
function Df(e) {
  for (const t of [A.selectTool, A.addText, A.addShape, A.addImage, A.templatesToggle]) {
    const n = t === e;
    t.classList.toggle("active", n), t.setAttribute("aria-pressed", String(n));
  }
}
function sr(e = "add-text-section", t = A.addText) {
  e !== "add-fonts-section" && so.releaseSamples(), A.addPanel.classList.remove("collapsed"), A.structure.classList.remove("mobile-open"), A.dockToggle.setAttribute("aria-expanded", "false"), qt.setOpen(!1);
  const n = fl.find(([r]) => r === e)?.[1] ?? "toolbar.textButton";
  A.addPanelTitle.dataset.i18n = n, A.addPanelTitle.textContent = b(n);
  for (const [r] of fl) {
    const s = document.getElementById(r);
    s && (s.hidden = r !== e);
  }
  const o = e === "add-template-section";
  qt.setOpen(o && qt.isVisible()), A.openTemplates.hidden = o && qt.isVisible(), A.addPanel.scrollTop = 0, Df(t);
}
function ar() {
  so.releaseSamples(), A.addPanel.classList.add("collapsed"), Df(A.selectTool);
}
A.addPanelClose.addEventListener("click", ar);
A.addText.addEventListener("click", () => sr("add-text-section", A.addText));
A.addShape.addEventListener("click", () => sr("add-shape-section", A.addShape));
A.addImage.addEventListener("click", () => sr("add-upload-section", A.addImage));
A.templatesToggle.addEventListener("click", () => sr("add-template-section", A.templatesToggle));
async function Li(e = !1) {
  sr("add-fonts-section", A.selectTool), await so.reload(), e && so.focusInstall();
}
async function sw(e) {
  const n = (await Zy())[0];
  if (!n) {
    je(b("fonts.noneInstalled"), "error"), await Li(!0);
    return;
  }
  if (!E.project || !E.document) return;
  const o = {
    plain: { text: "Add text", fontSize: 24, width: 460, height: 80 },
    heading: { text: "Add a heading", fontSize: 64, width: 600, height: 100 },
    subheading: { text: "Add a subheading", fontSize: 36, width: 520, height: 64 },
    body: { text: "Add body text", fontSize: 22, width: 460, height: 120 }
  }[e], r = {
    x: Math.round((E.document.canvas.width - o.width) / 2),
    y: Math.round((E.document.canvas.height - o.height) / 2),
    width: o.width,
    height: o.height
  }, a = (await An(
    E.project,
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
    Ve(E.document)
  )).created?.[0];
  a && (E.selection = [a]);
  const i = { plain: "text.plain", heading: "text.heading", subheading: "text.subheading", body: "text.body" }[e];
  je(b("editor.addedText", { preset: b(i) })), await ot();
  const c = Ai();
  c?.type === "text" && io(c);
}
async function aw(e) {
  if (!E.project || !E.document) return;
  const t = {
    rect: { width: 320, height: 240 },
    ellipse: { width: 320, height: 240 },
    line: { width: 400, height: 24 }
  }[e], n = {
    x: Math.round((E.document.canvas.width - t.width) / 2),
    y: Math.round((E.document.canvas.height - t.height) / 2),
    width: t.width,
    height: t.height
  }, o = e === "line" ? { stroke: { color: mf, width: hf } } : { fill: Ei }, r = e === "rect" ? { kind: "rect", cornerRadius: 0 } : { kind: e }, a = (await An(
    E.project,
    {
      op: "create",
      position: { at: "root" },
      transform: n,
      type: "shape",
      shape: r,
      ...o
    },
    Ve(E.document)
  )).created?.[0];
  a && (E.selection = [a]);
  const i = { rect: "shapes.rectangle", ellipse: "shapes.ellipse", line: "shapes.line" }[e];
  je(b("editor.addedShape", { kind: b(i) })), await ot();
}
async function iw(e) {
  if (!E.project || !E.document) return;
  const t = 320, n = 240, o = {
    x: Math.round((E.document.canvas.width - t) / 2),
    y: Math.round((E.document.canvas.height - n) / 2),
    width: t,
    height: n
  }, s = (await An(
    E.project,
    {
      op: "create",
      position: { at: "root" },
      transform: o,
      type: "shape",
      shape: { kind: "path", d: e },
      fill: Ei
    },
    Ve(E.document)
  )).created?.[0];
  s && (E.selection = [s]), je(b("editor.addedPath")), await ot();
}
A.addPanel.addEventListener("click", (e) => {
  const t = e.target, o = t.closest("[data-text-preset]")?.dataset.textPreset;
  o && Le(`add ${o}`, () => sw(o));
  const r = t.closest("[data-shape]")?.dataset.shape;
  (r === "rect" || r === "ellipse" || r === "line") && Le(`add ${r}`, () => aw(r)), r === "path" && xs("editor.addPathTitle", "editor.pathDataLabel", "editor.addPathButton", (s) => {
    Le("add path", () => iw(s));
  });
});
A.undo.addEventListener("click", () => {
  Le("undo", async () => {
    if (!E.project) return;
    const e = await Dy(E.project);
    je(b("status.undoDone", { version: e.version })), await ot();
  });
});
A.redo.addEventListener("click", () => {
  Le("redo", async () => {
    if (!E.project) return;
    const e = await Oy(E.project);
    je(b("status.redoDone", { version: e.version })), await ot();
  });
});
A.exportButton.addEventListener("click", () => Dx.open());
ip((e) => ya(
  e,
  e.type === "image/svg+xml" || e.name.toLowerCase().endsWith(".svg") ? "svg" : "image"
));
function ya(e, t, n) {
  e && Le(t === "svg" ? "add vector" : "add image", async () => {
    if (!(!E.project || !E.document)) {
      A.uploadFeedback.textContent = b("uploads.uploading", { name: e.name });
      try {
        const o = await Si(E.project, e), r = o.asset.mediaType === "image/svg+xml" || t === "svg", { width: s, height: a } = gb(
          o.asset,
          E.document.canvas
        ), i = Math.round(n?.x ?? (E.document.canvas.width - s) / 2), c = Math.round(n?.y ?? (E.document.canvas.height - a) / 2), u = r ? {
          op: "create",
          position: { at: "root" },
          transform: { x: i, y: c, width: s, height: a },
          type: "svg",
          asset: o.asset.id
        } : {
          op: "create",
          position: { at: "root" },
          transform: { x: i, y: c, width: s, height: a },
          type: "image",
          asset: o.asset.id,
          fit: "contain"
        }, f = await An(
          E.project,
          u,
          o.version
        );
        f.created?.length && (E.selection = f.created), je(b("uploads.addedVersion", { name: e.name, version: f.version })), A.uploadFeedback.textContent = b("uploads.added", { name: e.name }), await ot();
      } catch (o) {
        throw A.uploadFeedback.textContent = b("uploads.failed", { name: e.name }), o;
      }
    }
  });
}
for (const e of ["dragenter", "dragover"])
  A.stageViewport.addEventListener(e, (t) => t.preventDefault());
A.stageViewport.addEventListener("drop", (e) => {
  e.preventDefault();
  const t = e.dataTransfer?.files[0];
  if (!t || !E.document) return;
  const n = A.canvas.getBoundingClientRect();
  if (e.clientX < n.left || e.clientX > n.right || e.clientY < n.top || e.clientY > n.bottom) {
    ya(t, t.type === "image/svg+xml" ? "svg" : "image");
    return;
  }
  const o = {
    x: (e.clientX - n.left) / n.width * E.document.canvas.width - 150,
    y: (e.clientY - n.top) / n.height * E.document.canvas.height - 100
  };
  ya(t, t.type === "image/svg+xml" ? "svg" : "image", o);
});
function xo(e) {
  Ni = e, Ct();
}
A.historyShortcut.addEventListener("click", () => xo("history"));
A.dockToggle.addEventListener("click", () => {
  const e = A.structure.classList.toggle("mobile-open");
  A.dockToggle.setAttribute("aria-expanded", String(e)), e && (ar(), A.layersTab.focus());
});
A.selectTool.addEventListener("click", () => {
  E.document && (ar(), qt.setOpen(!1), A.structure.classList.remove("mobile-open"), A.dockToggle.setAttribute("aria-expanded", "false"), A.canvas.focus());
});
A.positionClose.addEventListener("click", () => co(!1));
A.positionPopover.addEventListener("click", (e) => {
  const t = e.target.closest(
    "[data-canvas-anchor], [data-layout]"
  ), n = t?.dataset.canvasAnchor;
  if (n && !t.disabled && E.selection.length > 0 && E.document) {
    const a = nr(), i = Nf(a);
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
    const f = [], p = u.horizontal === "left" ? 0 : u.horizontal === "right" ? E.document.canvas.width - i.width : (E.document.canvas.width - i.width) / 2, m = u.vertical === "top" ? 0 : u.vertical === "bottom" ? E.document.canvas.height - i.height : (E.document.canvas.height - i.height) / 2;
    for (const h of It())
      f.push({ op: "move", id: h.id, dx: p - i.x, dy: m - i.y });
    co(!1), Zx(`place layer ${t.title.toLowerCase()}`, f);
    return;
  }
  const o = t?.dataset.layout;
  if (!o || t.disabled || E.selection.length === 0) return;
  const r = [...E.selection];
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
  s && (co(!1), oe("arrange layers", s));
});
document.addEventListener("pointerdown", (e) => {
  const t = e.target;
  ka() && !A.positionPopover.contains(t) && !A.inspector.contains(t) && co(!1), Rn.isOpen() && !A.contextMenu.contains(t) && Rn.close();
});
A.openTemplates.addEventListener("click", () => {
  if (!qt.isVisible()) {
    je(b("editor.noSlotsHint")), ar(), xo("properties"), window.matchMedia("(max-width: 1024px)").matches && (A.structure.classList.add("mobile-open"), A.dockToggle.setAttribute("aria-expanded", "true"));
    return;
  }
  qt.setOpen(!0), A.openTemplates.hidden = !0, A.templatesPanel.scrollIntoView({ block: "nearest" });
});
A.templatesClose.addEventListener("click", () => {
  qt.setOpen(!1), A.openTemplates.hidden = !1;
});
A.zoomOut.addEventListener("click", () => rr(ws() / 1.2));
A.zoomIn.addEventListener("click", () => rr(ws() * 1.2));
A.zoomValue.addEventListener("click", () => rr(null));
A.zoom100.addEventListener("click", () => rr(1));
A.stageViewport.addEventListener("wheel", (e) => {
  if (!(e.ctrlKey || e.metaKey)) return;
  e.preventDefault();
  const t = e.deltaMode === WheelEvent.DOM_DELTA_LINE ? e.deltaY * 16 : e.deltaMode === WheelEvent.DOM_DELTA_PAGE ? e.deltaY * A.stageViewport.clientHeight : e.deltaY, n = Math.exp(-t * Math.log(1.1) / 100);
  rr(ws() * n, { x: e.clientX, y: e.clientY });
}, { passive: !1 });
function Of() {
  window.matchMedia("(max-width: 1024px)").matches ? (A.structure.classList.remove("mobile-open"), A.dockToggle.setAttribute("aria-expanded", "false"), so.releaseSamples(), A.addPanel.classList.add("collapsed")) : (A.structure.classList.remove("mobile-open"), A.dockToggle.setAttribute("aria-expanded", "true"));
}
window.addEventListener("resize", () => {
  E.zoom === null && or(), Ii(), Of();
});
const cw = new ResizeObserver(() => {
  E.zoom === null && or(), Ii();
});
cw.observe(A.stageViewport);
Of();
let ir = !1, Eo = null;
window.addEventListener("keyup", (e) => {
  e.code === "Space" && (ir = !1, A.stageViewport.classList.remove("pan-ready"));
});
window.addEventListener("blur", () => {
  ir = !1, A.stageViewport.classList.remove("pan-ready"), Eo?.();
});
A.stageViewport.addEventListener("pointerdown", (e) => {
  if (e.button !== 1 && !(ir && e.button === 0)) return;
  e.preventDefault(), e.stopPropagation(), Eo?.();
  const t = { x: e.clientX, y: e.clientY }, n = { x: A.stageViewport.scrollLeft, y: A.stageViewport.scrollTop };
  A.stageViewport.classList.add("panning");
  const o = (a) => {
    a.pointerId === e.pointerId && (A.stageViewport.scrollLeft = n.x - (a.clientX - t.x), A.stageViewport.scrollTop = n.y - (a.clientY - t.y));
  }, r = () => {
    window.removeEventListener("pointermove", o), window.removeEventListener("pointerup", s), window.removeEventListener("pointercancel", s), window.removeEventListener("blur", r), A.stageViewport.classList.remove("panning"), Eo === r && (Eo = null);
  }, s = (a) => {
    a.pointerId === e.pointerId && r();
  };
  Eo = r, window.addEventListener("pointermove", o), window.addEventListener("pointerup", s), window.addEventListener("pointercancel", s), window.addEventListener("blur", r, { once: !0 });
}, { capture: !0 });
A.overlay.addEventListener("pointerdown", (e) => {
  if (ir || e.target !== A.overlay || e.button !== 0 || !E.document) return;
  e.preventDefault();
  const t = A.canvas.getBoundingClientRect(), n = (c) => Math.min(t.right, Math.max(t.left, c)), o = (c) => Math.min(t.bottom, Math.max(t.top, c)), r = { x: n(e.clientX), y: o(e.clientY) }, s = document.createElement("div");
  s.className = "selection-marquee", A.overlay.append(s);
  const a = (c) => {
    const u = n(c.clientX), f = o(c.clientY), p = Math.min(r.x, u), m = Math.min(r.y, f), h = Math.max(r.x, u), g = Math.max(r.y, f);
    s.style.left = `${(p - t.left) / t.width * 100}%`, s.style.top = `${(m - t.top) / t.height * 100}%`, s.style.width = `${(h - p) / t.width * 100}%`, s.style.height = `${(g - m) / t.height * 100}%`;
  }, i = (c) => {
    window.removeEventListener("pointermove", a), window.removeEventListener("pointerup", i);
    const u = n(c.clientX), f = o(c.clientY), p = {
      left: Math.min(r.x, u),
      top: Math.min(r.y, f),
      right: Math.max(r.x, u),
      bottom: Math.max(r.y, f)
    }, m = [...A.overlay.querySelectorAll(".layer-hitbox")].filter((h) => {
      const g = h.getBoundingClientRect();
      return g.right >= p.left && g.left <= p.right && g.bottom >= p.top && g.top <= p.bottom;
    }).map((h) => h.dataset.id).filter((h) => !!h);
    E.selection = e.shiftKey ? [.../* @__PURE__ */ new Set([...E.selection, ...m])] : m, Ct(), at(), jt();
  };
  window.addEventListener("pointermove", a), window.addEventListener("pointerup", i);
});
function lw(e) {
  const t = e;
  return t ? t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable : !1;
}
window.addEventListener("keydown", (e) => {
  if (lw(e.target)) return;
  const t = e.ctrlKey || e.metaKey;
  if (e.code === "Space") {
    ir = !0, A.stageViewport.classList.add("pan-ready"), e.preventDefault();
    return;
  }
  if (t && e.key.toLowerCase() === "z") {
    e.preventDefault(), (e.shiftKey ? A.redo : A.undo).click();
    return;
  }
  const n = e.key.toLowerCase();
  if (t && n === "c") {
    e.preventDefault(), Br();
    return;
  }
  if (t && n === "x") {
    e.preventDefault(), It().every(dt) && Br() && Ho("cut layers");
    return;
  }
  if (t && n === "v") {
    e.preventDefault(), Af();
    return;
  }
  if (t && n === "d") {
    e.preventDefault();
    const c = It();
    c.length && c.every(dt) && vt("duplicate", c.map((u) => ({ op: "duplicate", id: u.id })));
    return;
  }
  if (t && n === "g") {
    e.preventDefault();
    const c = It();
    if (e.shiftKey) {
      const u = c.length === 1 && c[0]?.type === "group" ? c[0] : null;
      u && oe("ungroup", { op: "ungroup", id: u.id });
    } else c.length > 1 && c.every(dt) && oe("group", { op: "group", ids: c.map((u) => u.id) });
    return;
  }
  if (e.key === "F10" && e.shiftKey) {
    e.preventDefault();
    const c = A.canvas.getBoundingClientRect();
    Wo(c.left + c.width / 2, c.top + c.height / 2);
    return;
  }
  if (e.key === "Escape") {
    if (Rn.isOpen()) {
      Rn.close(), A.canvas.focus();
      return;
    }
    if (Ot.isOpen()) {
      Ot.close();
      return;
    }
    if (!A.addPanel.classList.contains("collapsed")) {
      e.preventDefault(), ar();
      return;
    }
    E.selection = [], Rn.close(), co(!1), Ct(), jt(), at();
    return;
  }
  const o = Ai(), r = It();
  if ((e.key === "Enter" || e.key === "F2") && o?.type === "text" && dt(o)) {
    e.preventDefault(), io(o);
    return;
  }
  if (r.length === 0 || r.some((c) => !dt(c))) return;
  if (e.key === "Delete" || e.key === "Backspace") {
    e.preventDefault(), Ho();
    return;
  }
  const s = e.shiftKey ? 10 : 1, i = {
    ArrowLeft: [-s, 0],
    ArrowRight: [s, 0],
    ArrowUp: [0, -s],
    ArrowDown: [0, s]
  }[e.key];
  i && (e.preventDefault(), vt("nudge selection", r.map((c) => ({
    op: "move",
    id: c.id,
    dx: i[0],
    dy: i[1]
  }))));
});
function uw() {
  E.project = null, E.document = null, E.selection = [], Ea(null), A.canvas.hidden = !0, A.canvasControlsRoot.hidden = !0, A.canvasHints.hidden = !0, A.canvasImage.removeAttribute("src"), A.canvasEmpty.hidden = !1, A.renameProject.disabled = !0, A.deleteProject.disabled = !0, A.reload.disabled = !0, Ct(), jt(), at();
}
function $f(e, t) {
  xs("projects.renameTitle", "common.name", "projects.rename", (n) => {
    Le("rename project", async () => {
      const o = await Ty(e, n);
      je(b("projects.renamed", { oldName: t ?? e, newName: n })), E.project === e && (E.project = null), await cr(o.project);
    });
  });
}
function Lf(e, t) {
  const n = t ?? e, o = b("projects.deleteConfirm", { name: n });
  window.confirm(o) && Le("delete project", async () => {
    await Py(e), E.project === e && uw(), je(b("projects.deleted", { name: n })), await cr();
  });
}
A.renameProject.addEventListener("click", () => {
  const e = E.project;
  e && (Ot.isOpen() && Ot.close(), $f(e, E.document?.name ?? null));
});
A.deleteProject.addEventListener("click", () => {
  const e = E.project;
  e && (Ot.isOpen() && Ot.close(), Lf(e, E.document?.name ?? null));
});
async function cr(e) {
  e && (A.search.value = "");
  const t = A.search.value.trim(), n = await tf(t);
  _f(n, t), e && (E.project = e, Ti.setCurrentProject(e), await If()), await Ff();
}
function _f(e, t) {
  _i = zf(e), Ti.setProjects(e, t, E.project);
}
const dw = 1500;
let _i = "";
function zf(e) {
  return e.map((t) => `${t.id}\0${t.name ?? ""}\0${t.layers}`).join(`
`);
}
let pl = !0;
async function ba() {
  if (pl)
    try {
      const { count: e } = await Fy();
      zi(e);
    } catch (e) {
      e instanceof nt && e.code.startsWith("http4") && (pl = !1, zi(null));
    }
}
let Kt = null;
function fw(e) {
  return e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement || e instanceof HTMLElement && e.isContentEditable;
}
document.addEventListener("input", (e) => {
  e.target !== A.search && fw(e.target) && (Kt = e.target);
}, !0);
document.addEventListener("change", (e) => {
  e.target === Kt && (Kt = null);
}, !0);
document.addEventListener("focusout", (e) => {
  e.target === Kt && (Kt = null);
}, !0);
function pw() {
  return Kt instanceof Node && !Kt.isConnected && (Kt = null), Kt !== null;
}
function ml() {
  return document.visibilityState === "visible" && !E.busy && !E.drag && !E.editingText && !pw() && !document.body.classList.contains("stopped");
}
let Vs = !1;
async function mw() {
  if (!(Vs || !ml())) {
    if (!va()) {
      ba();
      return;
    }
    Vs = !0;
    try {
      const e = A.search.value.trim(), t = await tf(e);
      if (!ml()) return;
      ba(), zf(t) !== _i && document.activeElement !== document.getElementById("project-search") && (_f(t, e), E.project || Ff().catch(() => {
      }));
      const n = E.project, o = t.find((s) => s.id === n), r = E.document;
      if (!n || !o || !r || o.documentId !== r.id || o.version === Ve(r)) return;
      Le("follow", async () => {
        E.project !== n || E.drag || E.editingText || await ot();
      });
    } catch {
    } finally {
      Vs = !1;
    }
  }
}
window.setInterval(() => {
  mw();
}, dw);
let Hs = [], Ws = 0;
async function Ff() {
  const e = ++Ws;
  for (const o of Hs) URL.revokeObjectURL(o);
  Hs = [];
  const t = await ky(8);
  if (e !== Ws) return;
  const n = await Promise.all(t.map(async (o) => {
    try {
      return { project: o, thumbnail: await _o(Ry(o.id)) };
    } catch {
      return { project: o, thumbnail: null };
    }
  }));
  if (e !== Ws) {
    for (const { thumbnail: o } of n) o && URL.revokeObjectURL(o);
    return;
  }
  Hs = n.flatMap(({ thumbnail: o }) => o ? [o] : []), ap(
    A.recents,
    n,
    (o) => Mf(o),
    (o, r) => $f(o, r),
    (o, r) => Lf(o, r)
  );
}
A.shutdown.addEventListener("click", () => {
  window.confirm(b("projects.stopConfirm")) && Le("stop", async () => {
    await Ly(), A.shutdown.disabled = !0, document.body.classList.add("stopped"), je(b("app.stopped"));
  });
});
Le("start", async () => {
  const e = await _y();
  A.shutdown.hidden = !e.canShutdown;
  try {
    await so.reload();
  } catch {
  }
  await cr(), ba(), yf(), je(b("status.ready", { version: e.version })), !_i && !A.search.value.trim() && gf.offerOnFirstRun();
});
