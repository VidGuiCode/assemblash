import { r as u, F as pf, H as fn, t as So, v as zt, R as rn, M as mf, J as hf, f as ce, u as J, w as aa, y as _o, K as ia, j as l, B as Q, N as Yc, a as Me, c as $e, o as Ie, z as Ir, d as Xt, b as zo, O as Gc, n as jt, x as ca, P as Kn, l as Zc, E as gf, Q as vf, V as yf, W as bf, I as xf, C as wf, U as Xn, X as hn, g as gt, h as De, Y as vr, Z as Mr, _ as to, e as Jc, $ as Sf, A as xo, L as Cf, m as qe, i as Fe, T as oe, S as ye, k as ge, G as Te, a0 as jf, a1 as la } from "./chunk-mantine-root.js";
import { m as Qc, i as el, c as Zt, u as _e, O as da, a as tl, g as no, b as nl, S as ol, s as kf, d as Ef, e as Rf, p as ua, f as Nf, h as rl, j as Pf, k as Tf, l as sl, n as Si, o as Af, q as fa, r as If } from "./chunk-main.js";
import { a as Xe, u as Lt, C as al, I as wt, b as Mf, d as Df, c as vt, r as Ci, T as ji } from "./chunk-Title.js";
import { t as x, formatNumber as je, formatCount as Tt, getLocale as pa, setLocale as Lf } from "./i18n.js";
function yr(e, t) {
  return (n) => {
    if (typeof n != "string" || n.trim().length === 0) throw new Error(t);
    return `${e}-${n}`;
  };
}
function Co(e, t) {
  let n = e;
  for (; (n = n.parentElement) && !n.matches(t); ) ;
  return n;
}
function ki(e, t, n) {
  for (let o = e - 1; o >= 0; o -= 1) if (!t[o].disabled) return o;
  if (n) {
    for (let o = t.length - 1; o > -1; o -= 1) if (!t[o].disabled) return o;
  }
  return e;
}
function Ei(e, t, n) {
  for (let o = e + 1; o < t.length; o += 1) if (!t[o].disabled) return o;
  if (n) {
    for (let o = 0; o < t.length; o += 1) if (!t[o].disabled) return o;
  }
  return e;
}
function Of(e, t, n) {
  return Co(e, n) === Co(t, n);
}
function il({ parentSelector: e, siblingSelector: t, onKeyDown: n, loop: o = !0, activateOnFocus: r = !1, dir: s = "rtl", orientation: a }) {
  return (i) => {
    n?.(i);
    const c = Array.from(Co(i.currentTarget, e)?.querySelectorAll(t) || []).filter((g) => Of(i.currentTarget, g, e)), d = c.findIndex((g) => i.currentTarget === g), f = Ei(d, c, o), p = ki(d, c, o), m = s === "rtl" ? p : f, h = s === "rtl" ? f : p;
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
        i.stopPropagation(), i.preventDefault(), c[Ei(-1, c, !1)]?.focus();
        break;
      case "End":
        i.stopPropagation(), i.preventDefault(), c[ki(c.length, c, !1)]?.focus();
    }
  };
}
const br = () => {
};
function $f(e, t = { active: !0 }) {
  return typeof e != "function" || !t.active ? t.onKeyDown || br : (n) => {
    n.key === "Escape" && (e(n), t.onTrigger?.());
  };
}
function Mn(e, t) {
  return (n) => {
    e?.(n), t?.(n);
  };
}
function dn(e, t, n) {
  return t === void 0 && n === void 0 ? e : t !== void 0 && n === void 0 ? Math.max(e, t) : Math.min(t === void 0 && n !== void 0 ? e : Math.max(e, t), n);
}
function _f(e, t) {
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
function Bn(e) {
  const t = u.useRef(e);
  return u.useEffect(() => {
    t.current = e;
  }), u.useMemo(() => ((...n) => t.current?.(...n)), []);
}
function Dr(e, t) {
  const { delay: n, flushOnUnmount: o, leading: r, maxWait: s } = typeof t == "number" ? {
    delay: t,
    flushOnUnmount: !1,
    leading: !1,
    maxWait: void 0
  } : t, a = Bn(e), i = u.useRef(0), c = u.useRef(0), d = u.useRef(null), f = u.useMemo(() => {
    const p = Object.assign((...m) => {
      window.clearTimeout(i.current), d.current = m;
      const h = p._isFirstCall;
      p._isFirstCall = !1;
      function g() {
        window.clearTimeout(i.current), window.clearTimeout(c.current), i.current = 0, c.current = 0, p._isFirstCall = !0, p._hasPendingCallback = !1;
      }
      function y() {
        s !== void 0 && c.current === 0 && (c.current = window.setTimeout(() => {
          if (i.current !== 0) {
            const k = d.current;
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
        p.flush = C, p.cancel = j, i.current = window.setTimeout(k, n), y();
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
        i.current = window.setTimeout(j, n), y();
        return;
      }
      p._hasPendingCallback = !0;
      const w = () => {
        i.current !== 0 && (g(), a(...m));
      }, b = () => {
        g();
      };
      p.flush = w, p.cancel = b, i.current = window.setTimeout(w, n), y();
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
  return u.useEffect(() => () => {
    o ? f.flush() : f.cancel();
  }, [f, o]), f;
}
const zf = ["mousedown", "touchstart"];
function cl(e, t, n, o = !0, r = !1) {
  const s = u.useRef(null), a = t || zf, i = u.useEffectEvent((d) => {
    const { target: f } = d ?? {};
    if (!document.body.contains(f) && f?.tagName !== "HTML") return;
    const p = d.composedPath();
    Array.isArray(n) ? n.every((m) => !!m && !p.includes(m)) && e(d) : s.current && !p.includes(s.current) && e(d);
  }), c = a.join(",");
  return u.useEffect(() => {
    if (!o) return;
    const d = c.split(",");
    return d.forEach((f) => document.addEventListener(f, i, r)), () => {
      d.forEach((f) => document.removeEventListener(f, i, r));
    };
  }, [
    c,
    o,
    r
  ]), s;
}
function Ff(e, t) {
  return pf("(prefers-color-scheme: dark)", e === "dark", t) ? "dark" : "light";
}
function ll({ opened: e, shouldReturnFocus: t = !0 }) {
  const n = u.useRef(null), o = () => {
    n.current && "focus" in n.current && typeof n.current.focus == "function" && n.current?.focus({ preventScroll: !0 });
  };
  return fn(() => {
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
const Bf = /input|select|textarea|button|object/, dl = "a, input, select, textarea, button, object, [tabindex]";
function Vf(e) {
  return e.style.display === "none";
}
function Hf(e) {
  if (e.getAttribute("aria-hidden") || e.getAttribute("hidden") || e.getAttribute("type") === "hidden") return !1;
  let t = e;
  for (; t && !(t === document.body || t.nodeType === 11); ) {
    if (Vf(t)) return !1;
    t = t.parentNode;
  }
  return !0;
}
function ul(e) {
  let t = e.getAttribute("tabindex");
  return t === null && (t = void 0), parseInt(t, 10);
}
function Ls(e) {
  const t = e.nodeName.toLowerCase(), n = !Number.isNaN(ul(e));
  return (Bf.test(t) && !e.disabled || e instanceof HTMLAnchorElement && e.href || n) && Hf(e);
}
function fl(e) {
  const t = ul(e);
  return (Number.isNaN(t) || t >= 0) && Ls(e);
}
function Wf(e) {
  return Array.from(e.querySelectorAll(dl)).filter(fl);
}
function Uf(e, t) {
  const n = Wf(e);
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
function qf(e = !0) {
  const t = u.useRef(null), n = (r) => {
    let s = r.querySelector("[data-autofocus]");
    if (!s) {
      const a = Array.from(r.querySelectorAll(dl));
      s = a.find(fl) || a.find(Ls) || null, !s && Ls(r) && (s = r);
    }
    s ? s.focus({ preventScroll: !0 }) : console.warn("[@mantine/hooks/use-focus-trap] Failed to find focusable element within provided node", r);
  }, o = u.useCallback((r) => {
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
  return u.useEffect(() => {
    if (!e) return;
    t.current && setTimeout(() => {
      t.current && n(t.current);
    });
    const r = (s) => {
      s.key === "Tab" && t.current && Uf(t.current, s);
    };
    return document.addEventListener("keydown", r), () => document.removeEventListener("keydown", r);
  }, [e]), o;
}
const Kf = (e) => (e + 1) % 1e6;
function Xf() {
  const [, e] = u.useReducer(Kf, 0);
  return e;
}
function Yf(e, t, n) {
  const o = u.useEffectEvent(t);
  u.useEffect(() => (window.addEventListener(e, o, n), () => window.removeEventListener(e, o, n)), [e]);
}
function pl(e) {
  return {
    x: dn(e.x, 0, 1),
    y: dn(e.y, 0, 1)
  };
}
function ml(e, t, n = "ltr") {
  const o = u.useRef(!1), r = u.useRef(!1), s = u.useRef(0), a = u.useRef(null), [i, c] = u.useState(!1);
  return u.useEffect(() => (o.current = !0, () => {
    a.current?.();
  }), []), {
    ref: u.useCallback((d) => {
      const f = ({ x: C, y: j }) => {
        cancelAnimationFrame(s.current), s.current = requestAnimationFrame(() => {
          if (o.current && d) {
            d.style.userSelect = "none";
            const N = d.getBoundingClientRect();
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
        document.addEventListener("mousemove", w), document.addEventListener("mouseup", g), document.addEventListener("touchmove", k, { passive: !1 }), document.addEventListener("touchend", g);
      }, m = () => {
        document.removeEventListener("mousemove", w), document.removeEventListener("mouseup", g), document.removeEventListener("touchmove", k), document.removeEventListener("touchend", g);
      }, h = () => {
        !r.current && o.current && (r.current = !0, typeof t?.onScrubStart == "function" && t.onScrubStart(), c(!0), p());
      }, g = () => {
        r.current && o.current && (r.current = !1, c(!1), m(), setTimeout(() => {
          typeof t?.onScrubEnd == "function" && t.onScrubEnd();
        }, 0));
      }, y = (C) => {
        h(), C.preventDefault(), w(C);
      }, w = (C) => f({
        x: C.clientX,
        y: C.clientY
      }), b = (C) => {
        C.cancelable && C.preventDefault(), h(), k(C);
      }, k = (C) => {
        C.cancelable && C.preventDefault(), f({
          x: C.changedTouches[0].clientX,
          y: C.changedTouches[0].clientY
        });
      };
      return d?.addEventListener("mousedown", y), d?.addEventListener("touchstart", b, { passive: !1 }), a.current = () => {
        m(), cancelAnimationFrame(s.current);
      }, () => {
        d && (d.removeEventListener("mousedown", y), d.removeEventListener("touchstart", b));
      };
    }, [n, e]),
    active: i
  };
}
function Gf(e, t) {
  if (!e || !t) return !1;
  if (e === t) return !0;
  if (e.length !== t.length) return !1;
  for (let n = 0; n < e.length; n += 1) if (!_f(e[n], t[n])) return !1;
  return !0;
}
function Zf(e) {
  const t = u.useRef([]), n = u.useRef(0);
  return Gf(t.current, e) || (t.current = e, n.current += 1), [n.current];
}
function Ri(e, t) {
  u.useEffect(e, Zf(t));
}
function Jf(e, t, n = { autoInvoke: !1 }) {
  const o = u.useRef(null), r = Bn(e), s = u.useCallback((...i) => {
    o.current || (o.current = window.setTimeout(() => {
      r(...i), o.current = null;
    }, t));
  }, [t]), a = u.useCallback(() => {
    o.current && (window.clearTimeout(o.current), o.current = null);
  }, []);
  return u.useEffect(() => (n.autoInvoke && s(), a), [a, s]), {
    start: s,
    clear: a
  };
}
function Qf(e) {
  const t = u.useRef(void 0);
  return u.useEffect(() => {
    t.current = e;
  }, [e]), t.current;
}
function ep() {
  const [e, t] = u.useState(!1);
  return So(() => {
    t(typeof window < "u" && !tp() && "EyeDropper" in window);
  }, []), {
    supported: e,
    open: u.useCallback((n = {}) => e ? new window.EyeDropper().open(n) : Promise.resolve(void 0), [e])
  };
}
function tp() {
  return navigator.userAgent.includes("OPR");
}
function np(e, t, n) {
  const o = u.useRef(null);
  u.useEffect(() => {
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
function op() {
  const [e, t] = u.useState(!1);
  return u.useEffect(() => t(!0), []), e;
}
const rp = ["mouse", "touch"], sp = 10;
function ap(e, t = {}) {
  const { threshold: n = 400, events: o = rp, cancelOnMove: r = !1, onStart: s, onFinish: a, onCancel: i } = t, c = u.useRef(!1), d = u.useRef(!1), f = u.useRef(-1), p = u.useRef(null);
  u.useEffect(() => () => window.clearTimeout(f.current), []);
  const m = o.join(",");
  return u.useMemo(() => {
    if (typeof e != "function") return {};
    const h = r !== !1, g = r === !0 ? sp : r === !1 ? 0 : r, y = (C) => {
      !Pi(C) && !Os(C) || (s && s(C), p.current = Ni(C), d.current = !0, f.current = window.setTimeout(() => {
        e(C), c.current = !0;
      }, n));
    }, w = (C) => {
      !Pi(C) && !Os(C) || (c.current ? a && a(C) : d.current && i && i(C), c.current = !1, d.current = !1, p.current = null, f.current !== -1 && (window.clearTimeout(f.current), f.current = -1));
    }, b = (C) => {
      if (!h || !d.current || c.current) return;
      const j = Ni(C);
      if (!j || !p.current) return;
      const N = j.x - p.current.x, T = j.y - p.current.y;
      Math.sqrt(N * N + T * T) > g && w(C);
    }, k = {};
    return o.includes("mouse") && (k.onMouseDown = y, k.onMouseUp = w, k.onMouseLeave = w, h && (k.onMouseMove = b)), o.includes("touch") && (k.onTouchStart = y, k.onTouchEnd = w, k.onTouchCancel = w, h && (k.onTouchMove = b)), k;
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
function Ni(e) {
  if (Os(e)) {
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
function Os(e) {
  return window.TouchEvent ? e.nativeEvent instanceof TouchEvent : "touches" in e.nativeEvent;
}
function Pi(e) {
  return e.nativeEvent instanceof MouseEvent;
}
function ip(e) {
  if (!e || typeof e == "string") return 0;
  const t = e / 36;
  return Math.round((4 + 15 * t ** 0.25 + t / 5) * 10);
}
function hs(e) {
  return e.current ? e.current.scrollHeight : "auto";
}
function xr(e) {
  return typeof e == "number" && e > 0;
}
function cp({ transitionDuration: e, transitionTimingFunction: t = "ease", onTransitionEnd: n, onTransitionStart: o, expanded: r, keepMounted: s }) {
  const a = {
    height: 0,
    overflow: "hidden",
    ...s ? {} : { display: "none" }
  }, i = u.useEffectEvent(() => o?.()), c = u.useEffectEvent(() => n?.()), d = u.useRef(null), [f, p] = u.useState(r ? {} : a), [m, h] = u.useState(r ? "entered" : "exited"), g = (C) => {
    zt.flushSync(() => p(C));
  }, y = (C) => {
    g((j) => ({
      ...j,
      ...C
    }));
  }, w = (C) => {
    const j = e ?? ip(C);
    return { transition: `height ${j}ms ${t}, opacity ${j}ms ${t}` };
  }, b = u.useRef(0);
  fn(() => {
    b.current += 1;
    const C = b.current, j = () => b.current === C;
    e !== 0 && i(), r ? window.requestAnimationFrame(() => {
      !j() || !d.current || (zt.flushSync(() => h("entering")), y({
        willChange: "height",
        display: "block",
        overflow: "hidden"
      }), window.requestAnimationFrame(() => {
        if (!j() || !d.current) return;
        const N = hs(d);
        if (!xr(N)) {
          g({}), h("entered"), c();
          return;
        }
        y({
          ...w(N),
          height: N
        });
      }));
    }) : window.requestAnimationFrame(() => {
      if (!j() || !d.current) return;
      zt.flushSync(() => h("exiting"));
      const N = hs(d);
      if (!xr(N)) {
        g(a), h("exited"), c();
        return;
      }
      y({
        ...w(N),
        willChange: "height",
        height: N
      }), window.requestAnimationFrame(() => {
        !j() || !d.current || y({
          height: 0,
          overflow: "hidden"
        });
      });
    });
  }, [r]);
  const k = (C) => {
    if (!(C.target !== d.current || C.propertyName !== "height"))
      if (r) {
        const j = hs(d);
        j === f.height ? g({}) : y({ height: j }), h("entered"), c();
      } else f.height === 0 && (g(a), h("exited"), c());
  };
  return {
    state: m,
    getCollapseProps: (C) => ({
      "aria-hidden": !r,
      inert: !r,
      ref: Qc(d, C?.ref),
      onTransitionEnd: k,
      style: {
        boxSizing: "border-box",
        ...C?.style,
        ...f
      }
    })
  };
}
function lp(e) {
  if (!e || typeof e == "string") return 0;
  const t = e / 36;
  return Math.round((4 + 15 * t ** 0.25 + t / 5) * 10);
}
function gs(e) {
  return e.current ? e.current.scrollWidth : "auto";
}
function dp({ transitionDuration: e, transitionTimingFunction: t = "ease", onTransitionEnd: n, onTransitionStart: o, expanded: r, keepMounted: s }) {
  const a = {
    width: 0,
    overflow: "hidden",
    ...s ? {} : { display: "none" }
  }, i = u.useEffectEvent(() => o?.()), c = u.useEffectEvent(() => n?.()), d = u.useRef(null), [f, p] = u.useState(r ? {} : a), [m, h] = u.useState(r ? "entered" : "exited"), g = (C) => {
    zt.flushSync(() => p(C));
  }, y = (C) => {
    g((j) => ({
      ...j,
      ...C
    }));
  }, w = (C) => {
    const j = e ?? lp(C);
    return { transition: `width ${j}ms ${t}, opacity ${j}ms ${t}` };
  }, b = u.useRef(0);
  fn(() => {
    b.current += 1;
    const C = b.current, j = () => b.current === C;
    e !== 0 && i(), r ? window.requestAnimationFrame(() => {
      !j() || !d.current || (zt.flushSync(() => h("entering")), y({
        willChange: "width",
        display: "block",
        overflow: "hidden"
      }), window.requestAnimationFrame(() => {
        if (!j() || !d.current) return;
        const N = gs(d);
        if (!xr(N)) {
          g({}), h("entered"), c();
          return;
        }
        y({
          ...w(N),
          width: N
        });
      }));
    }) : window.requestAnimationFrame(() => {
      if (!j() || !d.current) return;
      zt.flushSync(() => h("exiting"));
      const N = gs(d);
      if (!xr(N)) {
        g(a), h("exited"), c();
        return;
      }
      y({
        ...w(N),
        willChange: "width",
        width: N
      }), window.requestAnimationFrame(() => {
        !j() || !d.current || y({
          width: 0,
          overflow: "hidden"
        });
      });
    });
  }, [r]);
  const k = (C) => {
    if (!(C.target !== d.current || C.propertyName !== "width"))
      if (r) {
        const j = gs(d);
        j === f.width ? g({}) : y({ width: j }), h("entered"), c();
      } else f.width === 0 && (g(a), h("exited"), c());
  };
  return {
    state: m,
    getCollapseProps: (C) => ({
      "aria-hidden": !r,
      inert: !r,
      ref: Qc(d, C?.ref),
      onTransitionEnd: k,
      style: {
        boxSizing: "border-box",
        ...C?.style,
        ...f
      }
    })
  };
}
function hl() {
  return typeof process < "u" && process.env, "development";
}
function gl(e) {
  const t = /* @__PURE__ */ new Map();
  return (...n) => {
    const o = JSON.stringify(n);
    if (t.has(o)) return t.get(o);
    const r = e(...n);
    return t.set(o, r), r;
  };
}
function vl(e) {
  const t = rn.version;
  return typeof rn.version != "string" || t.startsWith("18.") ? e?.ref : e?.props?.ref;
}
function up(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "bigint";
}
function dr(e, t = document) {
  const n = t.querySelector(e);
  if (n) return n;
  const o = t.querySelectorAll("*");
  for (let r = 0; r < o.length; r += 1) {
    const s = o[r];
    if (s.shadowRoot) {
      const a = dr(e, s.shadowRoot);
      if (a) return a;
    }
  }
  return null;
}
function Ht(e, t = document) {
  const n = [], o = t.querySelectorAll(e);
  n.push(...Array.from(o));
  const r = t.querySelectorAll("*");
  for (let s = 0; s < r.length; s += 1) {
    const a = r[s];
    if (a.shadowRoot) {
      const i = Ht(e, a.shadowRoot);
      n.push(...i);
    }
  }
  return n;
}
function $t(e) {
  if (!e) return document;
  const t = e.getRootNode();
  return t instanceof ShadowRoot || t instanceof Document ? t : document;
}
function Fo(e) {
  const t = u.Children.toArray(e);
  return t.length !== 1 || !el(t[0]) ? null : t[0];
}
function Bo(e, t) {
  return typeof e == "boolean" ? e : t.autoContrast;
}
function Ti(e) {
  const t = document.createElement("style");
  return t.setAttribute("data-mantine-styles", "inline"), t.innerHTML = "*, *::before, *::after {transition: none !important;}", t.setAttribute("data-mantine-disable-transition", "true"), e && t.setAttribute("nonce", e), document.head.appendChild(t), () => document.querySelectorAll("[data-mantine-disable-transition]").forEach((o) => o.remove());
}
function fp({ keepTransitions: e } = {}) {
  const t = u.useRef(br), n = u.useRef(-1), o = u.use(mf), r = hf(), s = u.useRef(r?.());
  if (!o) throw new Error("[@mantine/core] MantineProvider was not found in tree");
  const a = (p) => {
    o.setColorScheme(p), t.current = e ? () => {
    } : Ti(s.current), window.clearTimeout(n.current), n.current = window.setTimeout(() => {
      t.current?.();
    }, 10);
  }, i = () => {
    o.clearColorScheme(), t.current = e ? () => {
    } : Ti(s.current), window.clearTimeout(n.current), n.current = window.setTimeout(() => {
      t.current?.();
    }, 10);
  }, c = Ff("light", { getInitialValueInEffect: !1 }), d = o.colorScheme === "auto" ? c : o.colorScheme, f = u.useCallback(() => a(d === "light" ? "dark" : "light"), [a, d]);
  return u.useEffect(() => () => {
    t.current?.(), window.clearTimeout(n.current);
  }, []), {
    colorScheme: o.colorScheme,
    setColorScheme: a,
    clearColorScheme: i,
    toggleColorScheme: f
  };
}
function $s(e, t) {
  return Array.isArray(e) ? [...e].reduce((n, o) => ({
    ...n,
    ...$s(o, t)
  }), {}) : typeof e == "function" ? e(t) : e ?? {};
}
const pp = u.createContext({
  dir: "ltr",
  toggleDirection: () => {
  },
  setDirection: () => {
  }
});
function oo() {
  return u.use(pp);
}
const mp = {
  transitionDuration: 200,
  transitionTimingFunction: "ease",
  animateOpacity: !0,
  orientation: "vertical",
  keepMounted: !0,
  keepMountedMode: "activity"
}, yl = ce((e) => {
  const { children: t, expanded: n, transitionDuration: o, transitionTimingFunction: r, style: s, onTransitionEnd: a, onTransitionStart: i, animateOpacity: c, keepMounted: d, keepMountedMode: f, ref: p, orientation: m, ...h } = J("Collapse", mp, e), g = aa(), y = _o(), w = ia(), b = y.respectReducedMotion && w ? 0 : o, k = (m === "horizontal" ? dp : cp)({
    expanded: n,
    transitionDuration: b,
    transitionTimingFunction: r,
    onTransitionEnd: a,
    onTransitionStart: i,
    keepMounted: !1
  });
  if (b === 0)
    return d === !0 && (f === "display-none" || g !== "test") ? f === "display-none" ? /* @__PURE__ */ l.jsx(Q, {
      ...h,
      style: {
        ...$s(s, y),
        ...n ? {} : { display: "none" }
      },
      ref: p,
      children: t
    }) : /* @__PURE__ */ l.jsx(u.Activity, {
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
  return d === !1 ? j = C ? null : t : d === !0 ? j = f === "display-none" ? t : /* @__PURE__ */ l.jsx(u.Activity, {
    mode: C ? "hidden" : "visible",
    children: t
  }) : j = t, /* @__PURE__ */ l.jsx(Q, {
    ...h,
    ...k.getCollapseProps({
      style: {
        opacity: n || !c ? 1 : 0,
        transition: c ? `opacity ${b}ms ${r}` : "none",
        ...$s(s, y),
        ...d && f === "display-none" && C ? { display: "none" } : {}
      },
      ref: p
    }),
    children: j
  });
});
yl.displayName = "@mantine/core/Collapse";
const [hp, kt] = Zt("ScrollArea.Root component was not found in tree");
function pn(e, t) {
  const n = u.useEffectEvent(t);
  So(() => {
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
function gp(e) {
  const { style: t, ...n } = e, o = kt(), [r, s] = u.useState(0), [a, i] = u.useState(0), c = !!(r && a);
  return pn(o.scrollbarX, () => {
    const d = o.scrollbarX?.offsetHeight || 0;
    o.onCornerHeightChange(d), i(d);
  }), pn(o.scrollbarY, () => {
    const d = o.scrollbarY?.offsetWidth || 0;
    o.onCornerWidthChange(d), s(d);
  }), c ? /* @__PURE__ */ l.jsx("div", {
    ...n,
    style: {
      ...t,
      width: r,
      height: a
    }
  }) : null;
}
function vp(e) {
  const t = kt(), n = !!(t.scrollbarX && t.scrollbarY);
  return t.type !== "scroll" && n ? /* @__PURE__ */ l.jsx(gp, { ...e }) : null;
}
const yp = {
  scrollHideDelay: 1e3,
  type: "hover"
};
function bl(e) {
  const { type: t, scrollHideDelay: n, scrollbars: o, getStyles: r, ref: s, ...a } = J("ScrollAreaRoot", yp, e), [i, c] = u.useState(null), [d, f] = u.useState(null), [p, m] = u.useState(null), [h, g] = u.useState(null), [y, w] = u.useState(null), [b, k] = u.useState(0), [C, j] = u.useState(0), [N, T] = u.useState(!1), [S, v] = u.useState(!1), R = _e(s, c);
  return /* @__PURE__ */ l.jsx(hp, {
    value: {
      type: t,
      scrollHideDelay: n,
      scrollArea: i,
      viewport: d,
      onViewportChange: f,
      content: p,
      onContentChange: m,
      scrollbarX: h,
      onScrollbarXChange: g,
      scrollbarXEnabled: N,
      onScrollbarXEnabledChange: T,
      scrollbarY: y,
      onScrollbarYChange: w,
      scrollbarYEnabled: S,
      onScrollbarYEnabledChange: v,
      onCornerWidthChange: k,
      onCornerHeightChange: j,
      getStyles: r
    },
    children: /* @__PURE__ */ l.jsx(Q, {
      ...a,
      ref: R,
      __vars: {
        "--sa-corner-width": o !== "xy" ? "0px" : `${b}px`,
        "--sa-corner-height": o !== "xy" ? "0px" : `${C}px`
      }
    })
  });
}
bl.displayName = "@mantine/core/ScrollAreaRoot";
function xl(e, t) {
  const n = e / t;
  return Number.isNaN(n) ? 0 : n;
}
function Lr(e) {
  const t = xl(e.viewport, e.content), n = e.scrollbar.paddingStart + e.scrollbar.paddingEnd, o = (e.scrollbar.size - n) * t;
  return Math.max(o, 18);
}
function wl(e, t) {
  return (n) => {
    if (e[0] === e[1] || t[0] === t[1]) return t[0];
    const o = (t[1] - t[0]) / (e[1] - e[0]);
    return t[0] + o * (n - e[0]);
  };
}
function bp(e, [t, n]) {
  return Math.min(n, Math.max(t, e));
}
function Ai(e, t, n = "ltr") {
  const o = Lr(t), r = t.scrollbar.paddingStart + t.scrollbar.paddingEnd, s = t.scrollbar.size - r, a = t.content - t.viewport, i = s - o, c = bp(e, n === "ltr" ? [0, a] : [a * -1, 0]);
  return wl([0, a], [0, i])(c);
}
function xp(e, t, n, o = "ltr") {
  const r = Lr(n), s = r / 2, a = t || s, i = r - a, c = n.scrollbar.paddingStart + a, d = n.scrollbar.size - n.scrollbar.paddingEnd - i, f = n.content - n.viewport, p = o === "ltr" ? [0, f] : [f * -1, 0];
  return wl([c, d], p)(e);
}
function Sl(e, t) {
  return e > 0 && e < t;
}
function an(e) {
  return e ? parseInt(e, 10) : 0;
}
function wn(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
  return (o) => {
    e?.(o), (n === !1 || !o.defaultPrevented) && t?.(o);
  };
}
const [wp, Cl] = Zt("ScrollAreaScrollbar was not found in tree");
function jl(e) {
  const { sizes: t, hasThumb: n, onThumbChange: o, onThumbPointerUp: r, onThumbPointerDown: s, onThumbPositionChange: a, onDragScroll: i, onWheelScroll: c, onResize: d, ref: f, ...p } = e, m = kt(), [h, g] = u.useState(null), y = _e(f, g), w = u.useRef(null), b = u.useRef(""), { viewport: k } = m, C = t.content - t.viewport, j = u.useEffectEvent(c), N = Bn(a), T = Dr(d, 10), S = (v) => {
    if (w.current) {
      const R = v.clientX - w.current.left, D = v.clientY - w.current.top;
      i({
        x: R,
        y: D
      });
    }
  };
  return u.useEffect(() => {
    const v = (R) => {
      const D = R.target;
      h?.contains(D) && j(R, C);
    };
    return document.addEventListener("wheel", v, { passive: !1 }), () => document.removeEventListener("wheel", v, { passive: !1 });
  }, [
    k,
    h,
    C
  ]), u.useEffect(N, [t, N]), pn(h, T), pn(m.content, T), /* @__PURE__ */ l.jsx(wp, {
    value: {
      scrollbar: h,
      hasThumb: n,
      onThumbChange: Bn(o),
      onThumbPointerUp: Bn(r),
      onThumbPositionChange: N,
      onThumbPointerDown: Bn(s)
    },
    children: /* @__PURE__ */ l.jsx("div", {
      ...p,
      ref: y,
      "data-mantine-scrollbar": !0,
      style: {
        position: "absolute",
        ...p.style
      },
      onPointerDown: wn(e.onPointerDown, (v) => {
        v.preventDefault(), v.button === 0 && (v.target.setPointerCapture(v.pointerId), w.current = h.getBoundingClientRect(), b.current = document.body.style.webkitUserSelect, document.body.style.webkitUserSelect = "none", S(v));
      }),
      onPointerMove: wn(e.onPointerMove, S),
      onPointerUp: wn(e.onPointerUp, (v) => {
        const R = v.target;
        R.hasPointerCapture(v.pointerId) && (v.preventDefault(), R.releasePointerCapture(v.pointerId));
      }),
      onLostPointerCapture: () => {
        document.body.style.webkitUserSelect = b.current, w.current = null;
      }
    })
  });
}
const kl = (e) => {
  const { sizes: t, onSizesChange: n, style: o, ref: r, ...s } = e, a = kt(), [i, c] = u.useState(), d = u.useRef(null), f = _e(r, d, a.onScrollbarXChange);
  return u.useEffect(() => {
    d.current && c(getComputedStyle(d.current));
  }, [d]), /* @__PURE__ */ l.jsx(jl, {
    "data-orientation": "horizontal",
    ...s,
    ref: f,
    sizes: t,
    style: {
      ...o,
      "--sa-thumb-width": `${Lr(t)}px`
    },
    onThumbPointerDown: (p) => e.onThumbPointerDown(p.x),
    onDragScroll: (p) => e.onDragScroll(p.x),
    onWheelScroll: (p, m) => {
      if (a.viewport) {
        const h = a.viewport.scrollLeft + p.deltaX;
        e.onWheelScroll(h), Sl(h, m) && p.preventDefault();
      }
    },
    onResize: () => {
      d.current && a.viewport && i && n({
        content: a.viewport.scrollWidth,
        viewport: a.viewport.offsetWidth,
        scrollbar: {
          size: d.current.clientWidth,
          paddingStart: an(i.paddingLeft),
          paddingEnd: an(i.paddingRight)
        }
      });
    }
  });
};
kl.displayName = "@mantine/core/ScrollAreaScrollbarX";
function El(e) {
  const { sizes: t, onSizesChange: n, style: o, ref: r, ...s } = e, a = kt(), [i, c] = u.useState(), d = u.useRef(null), f = _e(r, d, a.onScrollbarYChange);
  return u.useEffect(() => {
    d.current && c(window.getComputedStyle(d.current));
  }, []), /* @__PURE__ */ l.jsx(jl, {
    ...s,
    "data-orientation": "vertical",
    ref: f,
    sizes: t,
    style: {
      "--sa-thumb-height": `${Lr(t)}px`,
      ...o
    },
    onThumbPointerDown: (p) => e.onThumbPointerDown(p.y),
    onDragScroll: (p) => e.onDragScroll(p.y),
    onWheelScroll: (p, m) => {
      if (a.viewport) {
        const h = a.viewport.scrollTop + p.deltaY;
        e.onWheelScroll(h), Sl(h, m) && p.preventDefault();
      }
    },
    onResize: () => {
      d.current && a.viewport && i && n({
        content: a.viewport.scrollHeight,
        viewport: a.viewport.offsetHeight,
        scrollbar: {
          size: d.current.clientHeight,
          paddingStart: an(i.paddingTop),
          paddingEnd: an(i.paddingBottom)
        }
      });
    }
  });
}
El.displayName = "@mantine/core/ScrollAreaScrollbarY";
function Or(e) {
  const { orientation: t = "vertical", ...n } = e, { dir: o } = oo(), r = kt(), s = u.useRef(null), a = u.useRef(0), [i, c] = u.useState({
    content: 0,
    viewport: 0,
    scrollbar: {
      size: 0,
      paddingStart: 0,
      paddingEnd: 0
    }
  }), d = xl(i.viewport, i.content), f = {
    ...n,
    sizes: i,
    onSizesChange: c,
    hasThumb: d > 0 && d < 1,
    onThumbChange: (m) => {
      s.current = m;
    },
    onThumbPointerUp: () => {
      a.current = 0;
    },
    onThumbPointerDown: (m) => {
      a.current = m;
    }
  }, p = (m, h) => xp(m, a.current, i, h);
  return t === "horizontal" ? /* @__PURE__ */ l.jsx(kl, {
    ...f,
    onThumbPositionChange: () => {
      if (r.viewport && s.current) {
        const m = r.viewport.scrollLeft, h = Ai(m, i, o);
        s.current.style.transform = `translate3d(${h}px, 0, 0)`;
      }
    },
    onWheelScroll: (m) => {
      r.viewport && (r.viewport.scrollLeft = m);
    },
    onDragScroll: (m) => {
      r.viewport && (r.viewport.scrollLeft = p(m, o));
    }
  }) : t === "vertical" ? /* @__PURE__ */ l.jsx(El, {
    ...f,
    onThumbPositionChange: () => {
      if (r.viewport && s.current) {
        const m = r.viewport.scrollTop, h = Ai(m, i);
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
Or.displayName = "@mantine/core/ScrollAreaScrollbarVisible";
function ma(e) {
  const t = kt(), { forceMount: n, ...o } = e, [r, s] = u.useState(!1), a = e.orientation === "horizontal", i = Dr(() => {
    if (t.viewport) {
      const c = t.viewport.offsetWidth < t.viewport.scrollWidth, d = t.viewport.offsetHeight < t.viewport.scrollHeight;
      s(a ? c : d);
    }
  }, 10);
  return pn(t.viewport, i), pn(t.content, i), n || r ? /* @__PURE__ */ l.jsx(Or, {
    "data-state": r ? "visible" : "hidden",
    ...o
  }) : null;
}
ma.displayName = "@mantine/core/ScrollAreaScrollbarAuto";
function Rl(e) {
  const { forceMount: t, ...n } = e, o = kt(), [r, s] = u.useState(!1);
  return u.useEffect(() => {
    const { scrollArea: a } = o;
    let i = 0;
    if (a) {
      const c = () => {
        window.clearTimeout(i), s(!0);
      }, d = () => {
        i = window.setTimeout(() => s(!1), o.scrollHideDelay);
      };
      return a.addEventListener("pointerenter", c), a.addEventListener("pointerleave", d), () => {
        window.clearTimeout(i), a.removeEventListener("pointerenter", c), a.removeEventListener("pointerleave", d);
      };
    }
  }, [o.scrollArea, o.scrollHideDelay]), t || r ? /* @__PURE__ */ l.jsx(ma, {
    "data-state": r ? "visible" : "hidden",
    ...n
  }) : null;
}
Rl.displayName = "@mantine/core/ScrollAreaScrollbarHover";
function Sp(e) {
  const { forceMount: t, ...n } = e, o = kt(), r = e.orientation === "horizontal", [s, a] = u.useState("hidden"), i = Dr(() => a("idle"), 100);
  return u.useEffect(() => {
    if (s === "idle") {
      const c = window.setTimeout(() => a("hidden"), o.scrollHideDelay);
      return () => window.clearTimeout(c);
    }
  }, [s, o.scrollHideDelay]), u.useEffect(() => {
    const { viewport: c } = o, d = r ? "scrollLeft" : "scrollTop";
    if (c) {
      let f = c[d];
      const p = () => {
        const m = c[d];
        f !== m && (a("scrolling"), i()), f = m;
      };
      return c.addEventListener("scroll", p), () => c.removeEventListener("scroll", p);
    }
  }, [
    o.viewport,
    r,
    i
  ]), t || s !== "hidden" ? /* @__PURE__ */ l.jsx(Or, {
    "data-state": s === "hidden" ? "hidden" : "visible",
    ...n,
    onPointerEnter: wn(e.onPointerEnter, () => a("interacting")),
    onPointerLeave: wn(e.onPointerLeave, () => a("idle"))
  }) : null;
}
function _s(e) {
  const { forceMount: t, ...n } = e, o = kt(), { onScrollbarXEnabledChange: r, onScrollbarYEnabledChange: s } = o, a = e.orientation === "horizontal";
  return u.useEffect(() => (a ? r(!0) : s(!0), () => {
    a ? r(!1) : s(!1);
  }), [
    a,
    r,
    s
  ]), o.type === "hover" ? /* @__PURE__ */ l.jsx(Rl, {
    ...n,
    forceMount: t
  }) : o.type === "scroll" ? /* @__PURE__ */ l.jsx(Sp, {
    ...n,
    forceMount: t
  }) : o.type === "auto" ? /* @__PURE__ */ l.jsx(ma, {
    ...n,
    forceMount: t
  }) : o.type === "always" ? /* @__PURE__ */ l.jsx(Or, { ...n }) : null;
}
_s.displayName = "@mantine/core/ScrollAreaScrollbar";
function Cp(e, t = () => {
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
function Nl(e) {
  const { style: t, ref: n, ...o } = e, r = kt(), s = Cl(), { onThumbPositionChange: a } = s, i = _e(n, s.onThumbChange), c = u.useRef(void 0), d = Dr(() => {
    c.current && (c.current(), c.current = void 0);
  }, 100);
  return u.useEffect(() => {
    const { viewport: f } = r;
    if (f) {
      const p = () => {
        if (d(), !c.current) {
          const m = Cp(f, a);
          c.current = m, a();
        }
      };
      return a(), f.addEventListener("scroll", p), () => f.removeEventListener("scroll", p);
    }
  }, [
    r.viewport,
    d,
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
    onPointerDownCapture: wn(e.onPointerDownCapture, (f) => {
      const p = f.target.getBoundingClientRect(), m = f.clientX - p.left, h = f.clientY - p.top;
      s.onThumbPointerDown({
        x: m,
        y: h
      });
    }),
    onPointerUp: wn(e.onPointerUp, s.onThumbPointerUp)
  });
}
Nl.displayName = "@mantine/core/ScrollAreaThumb";
function zs(e) {
  const { forceMount: t, ...n } = e, o = Cl();
  return t || o.hasThumb ? /* @__PURE__ */ l.jsx(Nl, { ...n }) : null;
}
zs.displayName = "@mantine/core/ScrollAreaThumb";
function Pl({ children: e, style: t, ref: n, onWheel: o, ...r }) {
  const s = kt(), a = _e(n, s.onViewportChange), i = (c) => {
    if (o?.(c), s.scrollbarXEnabled && s.viewport && c.shiftKey) {
      const { scrollTop: d, scrollHeight: f, clientHeight: p, scrollWidth: m, clientWidth: h } = s.viewport, g = d < 1, y = d >= f - p - 1;
      m > h && (g || y) && c.stopPropagation();
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
Pl.displayName = "@mantine/core/ScrollAreaViewport";
var ha = {
  root: "m_d57069b5",
  content: "m_b1336c6",
  viewport: "m_c0783ff9",
  viewportInner: "m_f8f631dd",
  scrollbar: "m_c44ba933",
  thumb: "m_d8b5e363",
  corner: "m_21657268"
};
function $r() {
  return typeof window < "u";
}
function ro(e) {
  return Tl(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function lt(e) {
  var t;
  return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function Jt(e) {
  var t;
  return (t = (Tl(e) ? e.ownerDocument : e.document) || window.document) == null ? void 0 : t.documentElement;
}
function Tl(e) {
  return $r() ? e instanceof Node || e instanceof lt(e).Node : !1;
}
function ct(e) {
  return $r() ? e instanceof Element || e instanceof lt(e).Element : !1;
}
function gn(e) {
  return $r() ? e instanceof HTMLElement || e instanceof lt(e).HTMLElement : !1;
}
function Ii(e) {
  return !$r() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof lt(e).ShadowRoot;
}
function _r(e) {
  const {
    overflow: t,
    overflowX: n,
    overflowY: o,
    display: r
  } = Ft(e);
  return /auto|scroll|overlay|hidden|clip/.test(t + o + n) && r !== "inline" && r !== "contents";
}
function jp(e) {
  return /^(table|td|th)$/.test(ro(e));
}
function zr(e) {
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
const kp = /transform|translate|scale|rotate|perspective|filter/, Ep = /paint|layout|strict|content/, vn = (e) => !!e && e !== "none";
let vs;
function ga(e) {
  const t = ct(e) ? Ft(e) : e;
  return vn(t.transform) || vn(t.translate) || vn(t.scale) || vn(t.rotate) || vn(t.perspective) || !va() && (vn(t.backdropFilter) || vn(t.filter)) || kp.test(t.willChange || "") || Ep.test(t.contain || "");
}
function Rp(e) {
  let t = Cn(e);
  for (; gn(t) && !jo(t); ) {
    if (ga(t))
      return t;
    if (zr(t))
      return null;
    t = Cn(t);
  }
  return null;
}
function va() {
  return vs == null && (vs = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), vs;
}
function jo(e) {
  return /^(html|body|#document)$/.test(ro(e));
}
function Ft(e) {
  return lt(e).getComputedStyle(e);
}
function Fr(e) {
  return ct(e) ? {
    scrollLeft: e.scrollLeft,
    scrollTop: e.scrollTop
  } : {
    scrollLeft: e.scrollX,
    scrollTop: e.scrollY
  };
}
function Cn(e) {
  if (ro(e) === "html")
    return e;
  const t = (
    // Step into the shadow DOM of the parent of a slotted node.
    e.assignedSlot || // DOM Element detected.
    e.parentNode || // ShadowRoot detected.
    Ii(e) && e.host || // Fallback.
    Jt(e)
  );
  return Ii(t) ? t.host : t;
}
function Al(e) {
  const t = Cn(e);
  return jo(t) ? (e.ownerDocument || e).body : gn(t) && _r(t) ? t : Al(t);
}
function ko(e, t, n) {
  var o;
  t === void 0 && (t = []), n === void 0 && (n = !0);
  const r = Al(e), s = r === ((o = e.ownerDocument) == null ? void 0 : o.body), a = lt(r);
  if (s) {
    const i = Fs(a);
    return t.concat(a, a.visualViewport || [], _r(r) ? r : [], i && n ? ko(i) : []);
  } else
    return t.concat(r, ko(r, [], n));
}
function Fs(e) {
  return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
const Np = ["top", "right", "bottom", "left"], Mt = Math.min, xt = Math.max, wr = Math.round, rr = Math.floor, qt = (e) => ({
  x: e,
  y: e
}), Pp = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
function Il(e, t, n) {
  return xt(e, Mt(t, n));
}
function Bt(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function Vt(e) {
  return e.split("-")[0];
}
function so(e) {
  return e.split("-")[1];
}
function ya(e) {
  return e === "x" ? "y" : "x";
}
function ba(e) {
  return e === "y" ? "height" : "width";
}
function At(e) {
  const t = e[0];
  return t === "t" || t === "b" ? "y" : "x";
}
function xa(e) {
  return ya(At(e));
}
function Tp(e, t, n) {
  n === void 0 && (n = !1);
  const o = so(e), r = xa(e), s = ba(r);
  let a = r === "x" ? o === (n ? "end" : "start") ? "right" : "left" : o === "start" ? "bottom" : "top";
  return t.reference[s] > t.floating[s] && (a = Sr(a)), [a, Sr(a)];
}
function Ap(e) {
  const t = Sr(e);
  return [Bs(e), t, Bs(t)];
}
function Bs(e) {
  return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
const Mi = ["left", "right"], Di = ["right", "left"], Ip = ["top", "bottom"], Mp = ["bottom", "top"];
function Dp(e, t, n) {
  switch (e) {
    case "top":
    case "bottom":
      return n ? t ? Di : Mi : t ? Mi : Di;
    case "left":
    case "right":
      return t ? Ip : Mp;
    default:
      return [];
  }
}
function Lp(e, t, n, o) {
  const r = so(e);
  let s = Dp(Vt(e), n === "start", o);
  return r && (s = s.map((a) => a + "-" + r), t && (s = s.concat(s.map(Bs)))), s;
}
function Sr(e) {
  const t = Vt(e);
  return Pp[t] + e.slice(t.length);
}
function Op(e) {
  var t, n, o, r;
  return {
    top: (t = e.top) != null ? t : 0,
    right: (n = e.right) != null ? n : 0,
    bottom: (o = e.bottom) != null ? o : 0,
    left: (r = e.left) != null ? r : 0
  };
}
function wa(e) {
  return typeof e != "number" ? Op(e) : {
    top: e,
    right: e,
    bottom: e,
    left: e
  };
}
function un(e) {
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
var $p = typeof document < "u", _p = function() {
}, Vs = $p ? u.useLayoutEffect : _p;
const zp = {
  ...Yc
}, Fp = zp.useInsertionEffect, Bp = Fp || ((e) => e());
function Vp(e) {
  const t = u.useRef(() => {
  });
  return Bp(() => {
    t.current = e;
  }), u.useCallback(function() {
    for (var n = arguments.length, o = new Array(n), r = 0; r < n; r++)
      o[r] = arguments[r];
    return t.current == null ? void 0 : t.current(...o);
  }, []);
}
function Li(e, t, n) {
  let {
    reference: o,
    floating: r
  } = e;
  const s = At(t), a = xa(t), i = ba(a), c = Vt(t), d = s === "y", f = o.x + o.width / 2 - r.width / 2, p = o.y + o.height / 2 - r.height / 2, m = o[i] / 2 - r[i] / 2;
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
  const g = so(t);
  return g && (h[a] += m * (g === "end" ? 1 : -1) * (n && d ? -1 : 1)), h;
}
async function Hp(e, t) {
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
    boundary: d = "clippingAncestors",
    rootBoundary: f = "viewport",
    elementContext: p = "floating",
    altBoundary: m = !1,
    padding: h = 0
  } = Bt(t, e), g = wa(h), w = i[m ? p === "floating" ? "reference" : "floating" : p], b = un(await s.getClippingRect({
    element: (n = await (s.isElement == null ? void 0 : s.isElement(w))) == null || n ? w : w.contextElement || await (s.getDocumentElement == null ? void 0 : s.getDocumentElement(i.floating)),
    boundary: d,
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
  }, N = un(s.convertOffsetParentRelativeRectToViewportRelativeRect ? await s.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements: i,
    rect: k,
    offsetParent: C,
    strategy: c
  }) : k);
  return {
    top: (b.top - N.top + g.top) / j.y,
    bottom: (N.bottom - b.bottom + g.bottom) / j.y,
    left: (b.left - N.left + g.left) / j.x,
    right: (N.right - b.right + g.right) / j.x
  };
}
const Wp = 50, Up = async (e, t, n) => {
  const {
    placement: o = "bottom",
    strategy: r = "absolute",
    middleware: s = [],
    platform: a
  } = n, i = a.detectOverflow ? a : {
    ...a,
    detectOverflow: Hp
  }, c = await (a.isRTL == null ? void 0 : a.isRTL(t));
  let d = await a.getElementRects({
    reference: e,
    floating: t,
    strategy: r
  }), {
    x: f,
    y: p
  } = Li(d, o, c), m = o, h = 0;
  const g = {};
  for (let y = 0; y < s.length; y++) {
    const w = s[y];
    if (!w)
      continue;
    const {
      name: b,
      fn: k
    } = w, {
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
      rects: d,
      platform: i,
      elements: {
        reference: e,
        floating: t
      }
    });
    f = C ?? f, p = j ?? p, g[b] = {
      ...g[b],
      ...N
    }, T && h < Wp && (h++, typeof T == "object" && (T.placement && (m = T.placement), T.rects && (d = T.rects === !0 ? await a.getElementRects({
      reference: e,
      floating: t,
      strategy: r
    }) : T.rects), {
      x: f,
      y: p
    } = Li(d, m, c)), y = -1);
  }
  return {
    x: f,
    y: p,
    placement: m,
    strategy: r,
    middlewareData: g
  };
}, qp = (e) => ({
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
      element: d,
      padding: f = 0
    } = Bt(e, t) || {};
    if (d == null)
      return {};
    const p = wa(f), m = {
      x: n,
      y: o
    }, h = xa(r), g = ba(h), y = await a.getDimensions(d), w = h === "y", b = w ? "top" : "left", k = w ? "bottom" : "right", C = w ? "clientHeight" : "clientWidth", j = s.reference[g] + s.reference[h] - m[h] - s.floating[g], N = m[h] - s.reference[h], T = await (a.getOffsetParent == null ? void 0 : a.getOffsetParent(d));
    let S = T ? T[C] : 0;
    (!S || !await (a.isElement == null ? void 0 : a.isElement(T))) && (S = i.floating[C] || s.floating[g]);
    const v = j / 2 - N / 2, R = S / 2 - y[g] / 2 - 1, D = Mt(p[b], R), L = Mt(p[k], R), F = S - y[g] - L, _ = S / 2 - y[g] / 2 + v, z = Il(D, _, F), O = !c.arrow && so(r) != null && _ !== z && s.reference[g] / 2 - (_ < D ? D : L) - y[g] / 2 < 0, M = O ? _ < D ? _ - D : _ - F : 0;
    return {
      [h]: m[h] + M,
      data: {
        [h]: z,
        centerOffset: _ - z - M,
        ...O && {
          alignmentOffset: M
        }
      },
      reset: O
    };
  }
}), Kp = function(e) {
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
        elements: d
      } = t, {
        mainAxis: f = !0,
        crossAxis: p = !0,
        fallbackPlacements: m,
        fallbackStrategy: h = "bestFit",
        fallbackAxisSideDirection: g = "none",
        flipAlignment: y = !0,
        ...w
      } = Bt(e, t);
      if ((n = s.arrow) != null && n.alignmentOffset)
        return {};
      const b = Vt(r), k = At(i), C = Vt(i) === i, j = await (c.isRTL == null ? void 0 : c.isRTL(d.floating)), N = m || (C || !y ? [Sr(i)] : Ap(i)), T = g !== "none";
      !m && T && N.push(...Lp(i, y, g, j));
      const S = [i, ...N], v = await c.detectOverflow(t, w), R = [];
      let D = ((o = s.flip) == null ? void 0 : o.overflows) || [];
      if (f && R.push(v[b]), p) {
        const z = Tp(r, a, j);
        R.push(v[z[0]], v[z[1]]);
      }
      if (D = [...D, {
        placement: r,
        overflows: R
      }], !R.every((z) => z <= 0)) {
        var L, F;
        const z = (((L = s.flip) == null ? void 0 : L.index) || 0) + 1, O = S[z];
        if (O && (!(p === "alignment" ? k !== At(O) : !1) || // We leave the current main axis only if every placement on that axis
        // overflows the main axis.
        D.every((I) => At(I.placement) === k ? I.overflows[0] > 0 : !0)))
          return {
            data: {
              index: z,
              overflows: D
            },
            reset: {
              placement: O
            }
          };
        let M = (F = D.filter(($) => $.overflows[0] <= 0).sort(($, I) => $.overflows[1] - I.overflows[1])[0]) == null ? void 0 : F.placement;
        if (!M)
          switch (h) {
            case "bestFit": {
              var _;
              const $ = (_ = D.filter((I) => {
                if (T) {
                  const A = At(I.placement);
                  return A === k || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  A === "y";
                }
                return !0;
              }).map((I) => [I.placement, I.overflows.filter((A) => A > 0).reduce((A, B) => A + B, 0)]).sort((I, A) => I[1] - A[1])[0]) == null ? void 0 : _[0];
              $ && (M = $);
              break;
            }
            case "initialPlacement":
              M = i;
              break;
          }
        if (r !== M)
          return {
            reset: {
              placement: M
            }
          };
      }
      return {};
    }
  };
};
function Oi(e, t) {
  return {
    top: e.top - t.height,
    right: e.right - t.width,
    bottom: e.bottom - t.height,
    left: e.left - t.width
  };
}
function $i(e) {
  return Np.some((t) => e[t] >= 0);
}
const Xp = function(e) {
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
      } = Bt(e, t);
      switch (r) {
        case "referenceHidden": {
          const a = await o.detectOverflow(t, {
            ...s,
            elementContext: "reference"
          }), i = Oi(a, n.reference);
          return {
            data: {
              referenceHiddenOffsets: i,
              referenceHidden: $i(i)
            }
          };
        }
        case "escaped": {
          const a = await o.detectOverflow(t, {
            ...s,
            altBoundary: !0
          }), i = Oi(a, n.floating);
          return {
            data: {
              escapedOffsets: i,
              escaped: $i(i)
            }
          };
        }
        default:
          return {};
      }
    }
  };
};
function Ml(e) {
  const t = Mt(...e.map((s) => s.left)), n = Mt(...e.map((s) => s.top)), o = xt(...e.map((s) => s.right)), r = xt(...e.map((s) => s.bottom));
  return {
    x: t,
    y: n,
    width: o - t,
    height: r - n
  };
}
function Yp(e) {
  const t = e.slice().sort((r, s) => r.y - s.y), n = [];
  let o = null;
  for (let r = 0; r < t.length; r++) {
    const s = t[r];
    !o || s.y - o.y > o.height / 2 ? n.push([s]) : n[n.length - 1].push(s), o = s;
  }
  return n.map((r) => un(Ml(r)));
}
const Gp = function(e) {
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
        y: d
      } = Bt(e, t), f = Array.from(await (s.getClientRects == null ? void 0 : s.getClientRects(o.reference)) || []);
      if (!f.length)
        return {};
      const p = Yp(f), m = un(Ml(f)), h = wa(i);
      function g() {
        if (p.length === 2 && (p[0].left > p[1].right || p[1].left > p[0].right) && c != null && d != null)
          return p.find((w) => c > w.left - h.left && c < w.right + h.right && d > w.top - h.top && d < w.bottom + h.bottom) || m;
        if (p.length >= 2) {
          if (At(n) === "y") {
            const T = p[0], S = p[p.length - 1], v = Vt(n) === "top", R = T.top, D = S.bottom, L = v ? T.left : S.left, F = v ? T.right : S.right;
            return un({
              x: L,
              y: R,
              width: F - L,
              height: D - R
            });
          }
          const w = Vt(n) === "left", b = xt(...p.map((T) => T.right)), k = Mt(...p.map((T) => T.left)), C = p.filter((T) => w ? T.left === k : T.right === b), j = C[0].top, N = C[C.length - 1].bottom;
          return un({
            x: k,
            y: j,
            width: b - k,
            height: N - j
          });
        }
        return m;
      }
      const y = await s.getElementRects({
        reference: {
          getBoundingClientRect: g
        },
        floating: o.floating,
        strategy: a
      });
      return r.reference.x !== y.reference.x || r.reference.y !== y.reference.y || r.reference.width !== y.reference.width || r.reference.height !== y.reference.height ? {
        reset: {
          rects: y
        }
      } : {};
    }
  };
}, Dl = /* @__PURE__ */ new Set(["left", "top"]);
async function Zp(e, t) {
  const {
    placement: n,
    platform: o,
    elements: r
  } = e, s = await (o.isRTL == null ? void 0 : o.isRTL(r.floating)), a = Vt(n), i = so(n), c = At(n) === "y", d = Dl.has(a) ? -1 : 1, f = s && c ? -1 : 1, p = Bt(t, e);
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
    y: m * d
  } : {
    x: m * d,
    y: h * f
  };
}
const Jp = function(e) {
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
      } = t, c = await Zp(t, e);
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
}, Qp = function(e) {
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
        ...d
      } = Bt(e, t), f = {
        x: n,
        y: o
      }, p = await s.detectOverflow(t, d), m = At(r), h = ya(m);
      let g = f[h], y = f[m];
      const w = (k, C) => Il(C + p[k === "y" ? "top" : "left"], C, C - p[k === "y" ? "bottom" : "right"]);
      a && (g = w(h, g)), i && (y = w(m, y));
      const b = c.fn({
        ...t,
        [h]: g,
        [m]: y
      });
      return {
        ...b,
        data: {
          x: b.x - n,
          y: b.y - o,
          enabled: {
            [h]: a,
            [m]: i
          }
        }
      };
    }
  };
}, em = function(e) {
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
        offset: d = 0,
        mainAxis: f = !0,
        crossAxis: p = !0
      } = Bt(e, t), m = {
        x: r,
        y: s
      }, h = At(a), g = ya(h);
      let y = m[g], w = m[h];
      const b = Bt(d, t), k = typeof b == "number" ? {
        mainAxis: b,
        crossAxis: 0
      } : {
        mainAxis: (n = b.mainAxis) != null ? n : 0,
        crossAxis: (o = b.crossAxis) != null ? o : 0
      };
      if (f) {
        const N = g === "y" ? "height" : "width", T = i.reference[g] - i.floating[N] + k.mainAxis, S = i.reference[g] + i.reference[N] - k.mainAxis;
        y < T ? y = T : y > S && (y = S);
      }
      if (p) {
        var C, j;
        const N = g === "y" ? "width" : "height", T = Dl.has(Vt(a)), S = i.reference[h] - i.floating[N] + (T && ((C = c.offset) == null ? void 0 : C[h]) || 0) + (T ? 0 : k.crossAxis), v = i.reference[h] + i.reference[N] + (T ? 0 : ((j = c.offset) == null ? void 0 : j[h]) || 0) - (T ? k.crossAxis : 0);
        w < S ? w = S : w > v && (w = v);
      }
      return {
        [g]: y,
        [h]: w
      };
    }
  };
}, tm = function(e) {
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
      } = Bt(e, t), c = await r.detectOverflow(t, i), d = Vt(n), f = so(n), p = At(n) === "y", {
        width: m,
        height: h
      } = o.floating;
      let g, y;
      d === "top" || d === "bottom" ? (g = d, y = f === (await (r.isRTL == null ? void 0 : r.isRTL(s.floating)) ? "start" : "end") ? "left" : "right") : (y = d, g = f === "end" ? "top" : "bottom");
      const w = h - c.top - c.bottom, b = m - c.left - c.right, k = Mt(h - c[g], w), C = Mt(m - c[y], b), j = t.middlewareData.shift, N = !j;
      let T = k, S = C;
      j != null && j.enabled.x && (S = b), j != null && j.enabled.y && (T = w), N && !f && (p ? S = m - 2 * xt(c.left, c.right) : T = h - 2 * xt(c.top, c.bottom)), await a({
        ...t,
        availableWidth: S,
        availableHeight: T
      });
      const v = await r.getDimensions(s.floating);
      return m !== v.width || h !== v.height ? {
        reset: {
          rects: !0
        }
      } : {};
    }
  };
};
function Ll(e) {
  const t = Ft(e);
  let n = parseFloat(t.width) || 0, o = parseFloat(t.height) || 0;
  const r = gn(e), s = r ? e.offsetWidth : n, a = r ? e.offsetHeight : o, i = wr(n) !== s || wr(o) !== a;
  return i && (n = s, o = a), {
    width: n,
    height: o,
    $: i
  };
}
function Sa(e) {
  return ct(e) ? e : e.contextElement;
}
function Vn(e) {
  const t = Sa(e);
  if (!gn(t))
    return qt(1);
  const n = t.getBoundingClientRect(), {
    width: o,
    height: r,
    $: s
  } = Ll(t);
  let a = (s ? wr(n.width) : n.width) / o, i = (s ? wr(n.height) : n.height) / r;
  return (!a || !Number.isFinite(a)) && (a = 1), (!i || !Number.isFinite(i)) && (i = 1), {
    x: a,
    y: i
  };
}
const nm = /* @__PURE__ */ qt(0);
function Ol(e) {
  const t = lt(e);
  return !va() || !t.visualViewport ? nm : {
    x: t.visualViewport.offsetLeft,
    y: t.visualViewport.offsetTop
  };
}
function om(e, t, n) {
  return t === void 0 && (t = !1), !!n && t && n === lt(e);
}
function jn(e, t, n, o) {
  t === void 0 && (t = !1), n === void 0 && (n = !1);
  const r = e.getBoundingClientRect(), s = Sa(e);
  let a = qt(1);
  t && (o ? ct(o) && (a = Vn(o)) : a = Vn(e));
  const i = om(s, n, o) ? Ol(s) : qt(0);
  let c = (r.left + i.x) / a.x, d = (r.top + i.y) / a.y, f = r.width / a.x, p = r.height / a.y;
  if (s && o) {
    const m = lt(s), h = ct(o) ? lt(o) : o;
    let g = m, y = Fs(g);
    for (; y && h !== g; ) {
      const w = Vn(y), b = y.getBoundingClientRect(), k = Ft(y), C = b.left + (y.clientLeft + parseFloat(k.paddingLeft)) * w.x, j = b.top + (y.clientTop + parseFloat(k.paddingTop)) * w.y;
      c *= w.x, d *= w.y, f *= w.x, p *= w.y, c += C, d += j, g = lt(y), y = Fs(g);
    }
  }
  return un({
    width: f,
    height: p,
    x: c,
    y: d
  });
}
function Br(e, t) {
  const n = Fr(e).scrollLeft;
  return t ? t.left + n : jn(Jt(e)).left + n;
}
function $l(e, t) {
  const n = e.getBoundingClientRect(), o = n.left + t.scrollLeft - Br(e, n), r = n.top + t.scrollTop;
  return {
    x: o,
    y: r
  };
}
function rm(e) {
  let {
    elements: t,
    rect: n,
    offsetParent: o,
    strategy: r
  } = e;
  const s = r === "fixed", a = Jt(o), i = t ? zr(t.floating) : !1;
  if (o === a || i && s)
    return n;
  let c = {
    scrollLeft: 0,
    scrollTop: 0
  }, d = qt(1);
  const f = qt(0), p = gn(o);
  if ((p || !s) && ((ro(o) !== "body" || _r(a)) && (c = Fr(o)), p)) {
    const h = jn(o);
    d = Vn(o), f.x = h.x + o.clientLeft, f.y = h.y + o.clientTop;
  }
  const m = a && !p && !s ? $l(a, c) : qt(0);
  return {
    width: n.width * d.x,
    height: n.height * d.y,
    x: n.x * d.x - c.scrollLeft * d.x + f.x + m.x,
    y: n.y * d.y - c.scrollTop * d.y + f.y + m.y
  };
}
function sm(e) {
  return e.getClientRects ? Array.from(e.getClientRects()) : [];
}
function am(e) {
  const t = Fr(e), n = e.ownerDocument.body, o = xt(e.scrollWidth, e.clientWidth, n.scrollWidth, n.clientWidth), r = xt(e.scrollHeight, e.clientHeight, n.scrollHeight, n.clientHeight);
  let s = -t.scrollLeft + Br(e);
  const a = -t.scrollTop;
  return Ft(n).direction === "rtl" && (s += xt(e.clientWidth, n.clientWidth) - o), {
    width: o,
    height: r,
    x: s,
    y: a
  };
}
const im = 25;
function cm(e, t, n) {
  n === void 0 && (n = "viewport");
  const o = n === "layoutViewport", r = lt(e), s = Jt(e), a = r.visualViewport;
  let i = s.clientWidth, c = s.clientHeight, d = 0, f = 0;
  if (a) {
    const m = !va() || t === "fixed";
    o ? m || (d = -a.offsetLeft, f = -a.offsetTop) : (i = a.width, c = a.height, m && (d = a.offsetLeft, f = a.offsetTop));
  }
  if (Br(s) <= 0) {
    const m = s.ownerDocument, h = m.body, g = getComputedStyle(h), y = m.compatMode === "CSS1Compat" && parseFloat(g.marginLeft) + parseFloat(g.marginRight) || 0, w = Math.abs(s.clientWidth - h.clientWidth - y), b = getComputedStyle(s).scrollbarGutter === "stable both-edges" ? w / 2 : w;
    b <= im && (i -= b);
  }
  return {
    width: i,
    height: c,
    x: d,
    y: f
  };
}
function lm(e, t) {
  const n = jn(e, !0, t === "fixed"), o = n.top + e.clientTop, r = n.left + e.clientLeft, s = Vn(e), a = e.clientWidth * s.x, i = e.clientHeight * s.y, c = r * s.x, d = o * s.y;
  return {
    width: a,
    height: i,
    x: c,
    y: d
  };
}
function _i(e, t, n) {
  let o;
  if (t === "viewport" || t === "layoutViewport")
    o = cm(e, n, t);
  else if (t === "document")
    o = am(Jt(e));
  else if (ct(t))
    o = lm(t, n);
  else {
    const r = Ol(e);
    o = {
      x: t.x - r.x,
      y: t.y - r.y,
      width: t.width,
      height: t.height
    };
  }
  return un(o);
}
function dm(e, t) {
  const n = t.get(e);
  if (n)
    return n;
  let o = ko(e, [], !1).filter((i) => ct(i) && ro(i) !== "body"), r = null;
  const s = Ft(e).position === "fixed";
  let a = s ? Cn(e) : e;
  for (; ct(a) && !jo(a); ) {
    const i = Ft(a), c = ga(a), d = r ? r.position : s ? "fixed" : "";
    !c && (d === "fixed" || d === "absolute" && i.position === "static") ? o = o.filter((p) => p !== a) : r = i, a = Cn(a);
  }
  return t.set(e, o), o;
}
function um(e) {
  let {
    element: t,
    boundary: n,
    rootBoundary: o,
    strategy: r
  } = e;
  const a = [...n === "clippingAncestors" ? zr(t) ? [] : dm(t, this._c) : [].concat(n), o], i = _i(t, a[0], r);
  let c = i.top, d = i.right, f = i.bottom, p = i.left;
  for (let m = 1; m < a.length; m++) {
    const h = _i(t, a[m], r);
    c = xt(h.top, c), d = Mt(h.right, d), f = Mt(h.bottom, f), p = xt(h.left, p);
  }
  return {
    width: d - p,
    height: f - c,
    x: p,
    y: c
  };
}
function fm(e) {
  const {
    width: t,
    height: n
  } = Ll(e);
  return {
    width: t,
    height: n
  };
}
function pm(e, t, n) {
  const o = gn(t), r = Jt(t), s = n === "fixed", a = jn(e, !0, s, t);
  let i = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const c = qt(0);
  if ((o || !s) && ((ro(t) !== "body" || _r(r)) && (i = Fr(t)), o)) {
    const m = jn(t, !0, s, t);
    c.x = m.x + t.clientLeft, c.y = m.y + t.clientTop;
  }
  !o && r && (c.x = Br(r));
  const d = r && !o && !s ? $l(r, i) : qt(0), f = a.left + i.scrollLeft - c.x - d.x, p = a.top + i.scrollTop - c.y - d.y;
  return {
    x: f,
    y: p,
    width: a.width,
    height: a.height
  };
}
function ys(e) {
  return Ft(e).position === "static";
}
function zi(e, t) {
  if (!gn(e) || Ft(e).position === "fixed")
    return null;
  if (t)
    return t(e);
  let n = e.offsetParent;
  return Jt(e) === n && (n = n.ownerDocument.body), n;
}
function _l(e, t) {
  const n = lt(e);
  if (zr(e))
    return n;
  if (!gn(e)) {
    let r = Cn(e);
    for (; r && !jo(r); ) {
      if (ct(r) && !ys(r))
        return r;
      r = Cn(r);
    }
    return n;
  }
  let o = zi(e, t);
  for (; o && jp(o) && ys(o); )
    o = zi(o, t);
  return o && jo(o) && ys(o) && !ga(o) ? n : o || Rp(e) || n;
}
const mm = async function(e) {
  const t = this.getOffsetParent || _l, n = this.getDimensions, o = await n(e.floating);
  return {
    reference: pm(e.reference, await t(e.floating), e.strategy),
    floating: {
      x: 0,
      y: 0,
      width: o.width,
      height: o.height
    }
  };
};
function hm(e) {
  return Ft(e).direction === "rtl";
}
const gm = {
  convertOffsetParentRelativeRectToViewportRelativeRect: rm,
  getDocumentElement: Jt,
  getClippingRect: um,
  getOffsetParent: _l,
  getElementRects: mm,
  getClientRects: sm,
  getDimensions: fm,
  getScale: Vn,
  isElement: ct,
  isRTL: hm
};
function zl(e, t) {
  return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function vm(e, t, n) {
  let o = null, r;
  const s = Jt(e);
  function a() {
    var f;
    clearTimeout(r), (f = o) == null || f.disconnect(), o = null;
  }
  function i(f, p) {
    f === void 0 && (f = !1), p === void 0 && (p = 1), a();
    const m = e.getBoundingClientRect(), {
      left: h,
      top: g,
      width: y,
      height: w
    } = m;
    if (f || t(), !y || !w)
      return;
    const b = rr(g), k = rr(s.clientWidth - (h + y)), C = rr(s.clientHeight - (g + w)), j = rr(h), T = {
      rootMargin: -b + "px " + -k + "px " + -C + "px " + -j + "px",
      threshold: xt(0, Mt(1, p)) || 1
    };
    let S = !0;
    function v(R) {
      const D = R[0].intersectionRatio;
      if (!zl(m, e.getBoundingClientRect()))
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
      o = new IntersectionObserver(v, {
        ...T,
        // Handle <iframe>s
        root: s.ownerDocument
      });
    } catch {
      o = new IntersectionObserver(v, T);
    }
    o.observe(e);
  }
  const c = lt(e), d = () => i(n);
  return c.addEventListener("resize", d), i(!0), () => {
    c.removeEventListener("resize", d), a();
  };
}
function Fi(e, t, n, o) {
  o === void 0 && (o = {});
  const {
    ancestorScroll: r = !0,
    ancestorResize: s = !0,
    elementResize: a = typeof ResizeObserver == "function",
    layoutShift: i = typeof IntersectionObserver == "function",
    animationFrame: c = !1
  } = o, d = Sa(e), f = r || s ? [...d ? ko(d) : [], ...t ? ko(t) : []] : [];
  f.forEach((b) => {
    r && b.addEventListener("scroll", n), s && b.addEventListener("resize", n);
  });
  const p = d && i ? vm(d, n, s) : null;
  let m = -1, h = null;
  a && (h = new ResizeObserver((b) => {
    let [k] = b;
    k && k.target === d && h && t && (h.unobserve(t), cancelAnimationFrame(m), m = requestAnimationFrame(() => {
      var C;
      (C = h) == null || C.observe(t);
    })), n();
  }), d && !c && h.observe(d), t && h.observe(t));
  let g, y = c ? jn(e) : null;
  c && w();
  function w() {
    const b = jn(e);
    y && !zl(y, b) && n(), y = b, g = requestAnimationFrame(w);
  }
  return n(), () => {
    var b;
    f.forEach((k) => {
      r && k.removeEventListener("scroll", n), s && k.removeEventListener("resize", n);
    }), p?.(), (b = h) == null || b.disconnect(), h = null, c && cancelAnimationFrame(g);
  };
}
const ym = Jp, bm = Qp, xm = Kp, wm = tm, Sm = Xp, Bi = qp, Cm = Gp, jm = em, km = (e, t, n) => {
  const o = /* @__PURE__ */ new Map(), r = n ?? {}, s = {
    ...gm,
    ...r.platform,
    _c: o
  };
  return Up(e, t, {
    ...r,
    platform: s
  });
};
var Em = typeof document < "u", Rm = function() {
}, ur = Em ? u.useLayoutEffect : Rm;
function Cr(e, t) {
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
        if (!Cr(e[o], t[o]))
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
      if (!(s === "_owner" && e.$$typeof) && !Cr(e[s], t[s]))
        return !1;
    }
    return !0;
  }
  return e !== e && t !== t;
}
function Fl(e) {
  return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function Vi(e, t) {
  const n = Fl(e);
  return Math.round(t * n) / n;
}
function bs(e) {
  const t = u.useRef(e);
  return ur(() => {
    t.current = e;
  }), t;
}
function Nm(e) {
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
    open: d
  } = e, [f, p] = u.useState({
    x: 0,
    y: 0,
    strategy: n,
    placement: t,
    middlewareData: {},
    isPositioned: !1
  }), [m, h] = u.useState(o);
  Cr(m, o) || h(o);
  const [g, y] = u.useState(null), [w, b] = u.useState(null), k = u.useCallback((I) => {
    I !== T.current && (T.current = I, y(I));
  }, []), C = u.useCallback((I) => {
    I !== S.current && (S.current = I, b(I));
  }, []), j = s || g, N = a || w, T = u.useRef(null), S = u.useRef(null), v = u.useRef(f), R = c != null, D = bs(c), L = bs(r), F = bs(d), _ = u.useCallback(() => {
    if (!T.current || !S.current)
      return;
    const I = {
      placement: t,
      strategy: n,
      middleware: m
    };
    L.current && (I.platform = L.current), km(T.current, S.current, I).then((A) => {
      const B = {
        ...A,
        // The floating element's position may be recomputed while it's closed
        // but still mounted (such as when transitioning out). To ensure
        // `isPositioned` will be `false` initially on the next open, avoid
        // setting it to `true` when `open === false` (must be specified).
        isPositioned: F.current !== !1
      };
      z.current && !Cr(v.current, B) && (v.current = B, zt.flushSync(() => {
        p(B);
      }));
    });
  }, [m, t, n, L, F]);
  ur(() => {
    d === !1 && v.current.isPositioned && (v.current.isPositioned = !1, p((I) => ({
      ...I,
      isPositioned: !1
    })));
  }, [d]);
  const z = u.useRef(!1);
  ur(() => (z.current = !0, () => {
    z.current = !1;
  }), []), ur(() => {
    if (j && (T.current = j), N && (S.current = N), j && N) {
      if (D.current)
        return D.current(j, N, _);
      _();
    }
  }, [j, N, _, D, R]);
  const O = u.useMemo(() => ({
    reference: T,
    floating: S,
    setReference: k,
    setFloating: C
  }), [k, C]), M = u.useMemo(() => ({
    reference: j,
    floating: N
  }), [j, N]), $ = u.useMemo(() => {
    const I = {
      position: n,
      left: 0,
      top: 0
    };
    if (!M.floating)
      return I;
    const A = Vi(M.floating, f.x), B = Vi(M.floating, f.y);
    return i ? {
      ...I,
      transform: "translate(" + A + "px, " + B + "px)",
      ...Fl(M.floating) >= 1.5 && {
        willChange: "transform"
      }
    } : {
      position: n,
      left: A,
      top: B
    };
  }, [n, i, M.floating, f.x, f.y]);
  return u.useMemo(() => ({
    ...f,
    update: _,
    refs: O,
    elements: M,
    floatingStyles: $
  }), [f, _, O, M, $]);
}
const Pm = (e) => {
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
      return o && t(o) ? o.current != null ? Bi({
        element: o.current,
        padding: r
      }).fn(n) : {} : o ? Bi({
        element: o,
        padding: r
      }).fn(n) : {};
    }
  };
}, Tm = (e, t) => {
  const n = ym(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, Am = (e, t) => {
  const n = bm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, Im = (e, t) => ({
  fn: jm(e).fn,
  options: [e, t]
}), Mm = (e, t) => {
  const n = xm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, Dm = (e, t) => {
  const n = wm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, Lm = (e, t) => {
  const n = Sm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, Hi = (e, t) => {
  const n = Cm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, Om = (e, t) => {
  const n = Pm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
};
function Bl(e) {
  const t = u.useRef(void 0), n = u.useCallback((o) => {
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
  return u.useMemo(() => e.every((o) => o == null) ? null : (o) => {
    t.current && (t.current(), t.current = void 0), o != null && (t.current = n(o));
  }, e);
}
const $m = {
  ...Yc
};
let Wi = !1, _m = 0;
const Ui = () => (
  // Ensure the id is unique with multiple independent versions of Floating UI
  // on <React 18
  "floating-ui-" + Math.random().toString(36).slice(2, 6) + _m++
);
function zm() {
  const [e, t] = u.useState(() => Wi ? Ui() : void 0);
  return Vs(() => {
    e == null && t(Ui());
  }, []), u.useEffect(() => {
    Wi = !0;
  }, []), e;
}
const Fm = $m.useId, Bm = Fm || zm;
function Vm() {
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
const Hm = /* @__PURE__ */ u.createContext(null), Wm = /* @__PURE__ */ u.createContext(null), Um = () => {
  var e;
  return ((e = u.useContext(Hm)) == null ? void 0 : e.id) || null;
}, qm = () => u.useContext(Wm);
function Km(e) {
  const {
    open: t = !1,
    onOpenChange: n,
    elements: o
  } = e, r = Bm(), s = u.useRef({}), [a] = u.useState(() => Vm()), i = Um() != null, [c, d] = u.useState(o.reference), f = Vp((h, g, y) => {
    s.current.openEvent = h ? g : void 0, a.emit("openchange", {
      open: h,
      event: g,
      reason: y,
      nested: i
    }), n?.(h, g, y);
  }), p = u.useMemo(() => ({
    setPositionReference: d
  }), []), m = u.useMemo(() => ({
    reference: c || o.reference || null,
    floating: o.floating || null,
    domReference: o.reference
  }), [c, o.reference, o.floating]);
  return u.useMemo(() => ({
    dataRef: s,
    open: t,
    onOpenChange: f,
    elements: m,
    events: a,
    floatingId: r,
    refs: p
  }), [t, f, m, a, r, p]);
}
function Xm(e) {
  var t, n;
  let {
    elements: o,
    ...r
  } = e === void 0 ? {} : e;
  const {
    nodeId: s
  } = r, a = Km({
    ...r,
    elements: {
      reference: (t = o?.reference) != null ? t : null,
      floating: (n = o?.floating) != null ? n : null
    }
  }), i = r.rootContext || a, c = i.elements, [d, f] = u.useState(null), [p, m] = u.useState(null), g = c?.domReference || d, y = u.useRef(null), w = qm();
  Vs(() => {
    g && (y.current = g);
  }, [g]);
  const b = Nm({
    ...r,
    elements: {
      ...c,
      ...p && {
        reference: p
      }
    }
  }), k = u.useCallback((S) => {
    const v = ct(S) ? {
      getBoundingClientRect: () => S.getBoundingClientRect(),
      getClientRects: () => S.getClientRects(),
      contextElement: S
    } : S;
    m(v), b.refs.setReference(v);
  }, [b.refs]), C = u.useCallback((S) => {
    (ct(S) || S === null) && (y.current = S, f(S)), (ct(b.refs.reference.current) || b.refs.reference.current === null || // Don't allow setting virtual elements using the old technique back to
    // `null` to support `positionReference` + an unstable `reference`
    // callback ref.
    S !== null && !ct(S)) && b.refs.setReference(S);
  }, [b.refs]), j = u.useMemo(() => ({
    ...b.refs,
    setReference: C,
    setPositionReference: k,
    domReference: y
  }), [b.refs, C, k]), N = u.useMemo(() => ({
    ...b.elements,
    domReference: g
  }), [b.elements, g]), T = u.useMemo(() => ({
    ...b,
    ...i,
    refs: j,
    elements: N,
    nodeId: s
  }), [b, j, N, s, i]);
  return Vs(() => {
    i.dataRef.current.floatingContext = T;
    const S = w?.nodesRef.current.find((v) => v.id === s);
    S && (S.context = T);
  }), u.useMemo(() => ({
    ...b,
    context: T,
    refs: j,
    elements: N
  }), [b, j, N, T]);
}
const Vl = {
  scrollHideDelay: 1e3,
  type: "hover",
  scrollbars: "xy"
}, Hl = $e((e, { scrollbarSize: t, overscrollBehavior: n, scrollbars: o }) => {
  let r = n;
  return n && o && (o === "x" ? r = `${n} auto` : o === "y" && (r = `auto ${n}`)), { root: {
    "--scrollarea-scrollbar-size": Ie(t),
    "--scrollarea-over-scroll-behavior": r
  } };
}), En = ce((e) => {
  const t = J("ScrollArea", Vl, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, scrollbarSize: i, vars: c, type: d, scrollHideDelay: f, viewportProps: p, viewportRef: m, onScrollPositionChange: h, children: g, offsetScrollbars: y, scrollbars: w, onBottomReached: b, onTopReached: k, onLeftReached: C, onRightReached: j, overscrollBehavior: N, startScrollPosition: T, verticalScrollbarPosition: S, attributes: v, ...R } = t, [D, L] = u.useState(!1), [F, _] = u.useState(!1), [z, O] = u.useState(!1), M = u.useRef(!0), $ = u.useRef(!1), I = u.useRef(!0), A = u.useRef(!1), B = Me({
    name: "ScrollArea",
    props: t,
    classes: ha,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: v,
    vars: c,
    varsResolver: Hl
  }), W = u.useRef(null), [U, Z] = u.useState(null), le = u.useCallback((se) => {
    Z((ee) => ee === se ? ee : se);
  }, []), ue = Bl([
    m,
    W,
    le
  ]);
  return pn(y === "present" ? U : null, () => {
    const se = W.current;
    se && (_(se.scrollHeight > se.clientHeight), O(se.scrollWidth > se.clientWidth));
  }), So(() => {
    T && W.current && W.current.scrollTo({
      left: T.x ?? 0,
      top: T.y ?? 0
    });
  }, []), /* @__PURE__ */ l.jsxs(bl, {
    getStyles: B,
    type: d === "never" ? "always" : d,
    scrollHideDelay: f,
    scrollbars: w,
    ...B("root"),
    ...R,
    children: [
      /* @__PURE__ */ l.jsx(Pl, {
        ...p,
        ...B("viewport", { style: p?.style }),
        ref: ue,
        "data-offset-scrollbars": y === !0 ? "xy" : y || void 0,
        "data-scrollbars": w || void 0,
        "data-vertical-scrollbar-position": S || void 0,
        "data-horizontal-hidden": y === "present" && !z ? "true" : void 0,
        "data-vertical-hidden": y === "present" && !F ? "true" : void 0,
        onScroll: (se) => {
          p?.onScroll?.(se), h?.({
            x: se.currentTarget.scrollLeft,
            y: se.currentTarget.scrollTop
          });
          const { scrollTop: ee, scrollHeight: pe, clientHeight: q, scrollLeft: K, scrollWidth: ae, clientWidth: be } = se.currentTarget, fe = ee - (pe - q) >= -0.8, Se = ee === 0;
          fe && !$.current && b?.(), Se && !M.current && k?.(), $.current = fe, M.current = Se;
          const te = K - (ae - be) >= -0.8, H = K === 0;
          te && !A.current && j?.(), H && !I.current && C?.(), A.current = te, I.current = H;
        },
        children: g
      }),
      (w === "xy" || w === "x") && /* @__PURE__ */ l.jsx(_s, {
        ...B("scrollbar"),
        orientation: "horizontal",
        "data-vertical-scrollbar-position": S || void 0,
        "data-hidden": d === "never" || y === "present" && !z ? !0 : void 0,
        forceMount: !0,
        onMouseEnter: () => L(!0),
        onMouseLeave: () => L(!1),
        children: /* @__PURE__ */ l.jsx(zs, { ...B("thumb") })
      }),
      (w === "xy" || w === "y") && /* @__PURE__ */ l.jsx(_s, {
        ...B("scrollbar"),
        orientation: "vertical",
        "data-vertical-scrollbar-position": S || void 0,
        "data-hidden": d === "never" || y === "present" && !F ? !0 : void 0,
        forceMount: !0,
        onMouseEnter: () => L(!0),
        onMouseLeave: () => L(!1),
        children: /* @__PURE__ */ l.jsx(zs, { ...B("thumb") })
      }),
      /* @__PURE__ */ l.jsx(vp, {
        ...B("corner"),
        "data-vertical-scrollbar-position": S || void 0,
        "data-hovered": D || void 0,
        "data-hidden": d === "never" || void 0
      })
    ]
  });
});
En.displayName = "@mantine/core/ScrollArea";
const Ca = ce((e) => {
  const { children: t, classNames: n, styles: o, scrollbarSize: r, scrollHideDelay: s, type: a, dir: i, offsetScrollbars: c, overscrollBehavior: d, viewportRef: f, onScrollPositionChange: p, unstyled: m, variant: h, viewportProps: g, scrollbars: y, style: w, vars: b, onBottomReached: k, onTopReached: C, startScrollPosition: j, verticalScrollbarPosition: N, onOverflowChange: T, ...S } = J("ScrollAreaAutosize", Vl, e), v = u.useRef(null), [R, D] = u.useState(null), L = u.useCallback((M) => {
    D(($) => $ === M ? $ : M);
  }, []), F = Bl([
    f,
    v,
    L
  ]), _ = u.useRef(!1), z = u.useRef(!1), O = u.useEffectEvent(() => {
    const M = v.current;
    if (!M || !T) return;
    const $ = M.scrollHeight > M.clientHeight;
    $ !== _.current && (z.current ? T($) : (z.current = !0, $ && T(!0)), _.current = $);
  });
  return pn(T ? R : null, O), /* @__PURE__ */ l.jsx(Q, {
    ...S,
    variant: h,
    style: [{
      display: "flex",
      overflow: "hidden"
    }, w],
    children: /* @__PURE__ */ l.jsx(Q, {
      style: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
        ...y === "y" && { minWidth: 0 },
        ...y === "x" && { minHeight: 0 },
        ...y === "xy" && {
          minWidth: 0,
          minHeight: 0
        },
        ...y === !1 && {
          minWidth: 0,
          minHeight: 0
        }
      },
      children: /* @__PURE__ */ l.jsx(En, {
        classNames: n,
        styles: o,
        scrollHideDelay: s,
        scrollbarSize: r,
        type: a,
        dir: i,
        offsetScrollbars: c,
        overscrollBehavior: d,
        viewportRef: F,
        onScrollPositionChange: p,
        unstyled: m,
        variant: h,
        viewportProps: g,
        vars: b,
        scrollbars: y,
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
En.classes = ha;
En.varsResolver = Hl;
Ca.displayName = "@mantine/core/ScrollAreaAutosize";
Ca.classes = ha;
En.Autosize = Ca;
var Wl = { root: "m_515a97f8" };
const ja = ce((e) => {
  const t = J("VisuallyHidden", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, attributes: c, ...d } = t, f = Me({
    name: "VisuallyHidden",
    classes: Wl,
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
    ...d
  });
});
ja.classes = Wl;
ja.displayName = "@mantine/core/VisuallyHidden";
function qi(e, t, n, o) {
  return e === "center" || o === "center" ? { top: t } : e === "end" ? { bottom: n } : e === "start" ? { top: n } : {};
}
function Ki(e, t, n, o, r) {
  return e === "center" || o === "center" ? { left: t } : e === "end" ? { [r === "ltr" ? "right" : "left"]: n } : e === "start" ? { [r === "ltr" ? "left" : "right"]: n } : {};
}
const Ym = {
  bottom: "borderTopLeftRadius",
  left: "borderTopRightRadius",
  right: "borderBottomLeftRadius",
  top: "borderBottomRightRadius"
};
function Gm({ position: e, arrowSize: t, dir: n }) {
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
function Zm({ position: e, arrowSize: t, arrowOffset: n, arrowRadius: o, arrowPosition: r, arrowX: s, arrowY: a, dir: i }) {
  if (r === "merge") {
    const m = Gm({
      position: e,
      arrowSize: t,
      dir: i
    });
    if (m) return m;
  }
  const [c, d = "center"] = e.split("-"), f = {
    width: t,
    height: t,
    transform: "rotate(45deg)",
    position: "absolute",
    [Ym[c]]: o
  }, p = -t / 2;
  return c === "left" ? {
    ...f,
    ...qi(d, a, n, r),
    right: p,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    clipPath: "polygon(100% 0, 0 0, 100% 100%)"
  } : c === "right" ? {
    ...f,
    ...qi(d, a, n, r),
    left: p,
    borderRightColor: "transparent",
    borderTopColor: "transparent",
    clipPath: "polygon(0 100%, 0 0, 100% 100%)"
  } : c === "top" ? {
    ...f,
    ...Ki(d, s, n, r, i),
    bottom: p,
    borderTopColor: "transparent",
    borderLeftColor: "transparent",
    clipPath: "polygon(0 100%, 100% 100%, 100% 0)"
  } : c === "bottom" ? {
    ...f,
    ...Ki(d, s, n, r, i),
    top: p,
    borderBottomColor: "transparent",
    borderRightColor: "transparent",
    clipPath: "polygon(0 100%, 0 0, 100% 0)"
  } : {};
}
function Jm({ position: e, dir: t }) {
  const [n, o] = e.split("-");
  if (!o) return;
  const r = o === "start" && t === "ltr" || o === "end" && t === "rtl";
  if (n === "bottom") return r ? { borderTopLeftRadius: 0 } : { borderTopRightRadius: 0 };
  if (n === "top") return r ? { borderBottomLeftRadius: 0 } : { borderBottomRightRadius: 0 };
  if (n === "left") return o === "start" ? { borderTopRightRadius: 0 } : { borderBottomRightRadius: 0 };
  if (n === "right") return o === "start" ? { borderTopLeftRadius: 0 } : { borderBottomLeftRadius: 0 };
}
function Ul({ position: e, arrowSize: t, arrowOffset: n, arrowRadius: o, arrowPosition: r, visible: s, arrowX: a, arrowY: i, style: c, ...d }) {
  const { dir: f } = oo();
  return s ? /* @__PURE__ */ l.jsx("div", {
    role: "presentation",
    ...d,
    style: {
      ...c,
      ...Zm({
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
Ul.displayName = "@mantine/core/FloatingArrow";
function Qm(e, t) {
  if (e === "rtl" && (t.includes("right") || t.includes("left"))) {
    const [n, o] = t.split("-"), r = n === "right" ? "left" : "right";
    return o === void 0 ? r : `${r}-${o}`;
  }
  return t;
}
const [eh, ka] = Zt("Popover component was not found in the tree");
function th({ childProps: e, disabled: t, opened: n, longPressDelay: o = 500, setReference: r, open: s }) {
  const a = u.useRef(!1), i = u.useRef(!1), c = u.useRef(null), d = u.useRef(t);
  d.current = t;
  const f = (g, y, w) => {
    r({
      getBoundingClientRect: () => ({
        x: g,
        y,
        width: 0,
        height: 0,
        top: y,
        left: g,
        right: g,
        bottom: y,
        toJSON: () => {
        }
      }),
      contextElement: w
    }), s();
  }, p = Mn(e.onMouseDown, (g) => {
    t || g.button === 2 && g.stopPropagation();
  }), m = Mn(e.onContextMenu, (g) => {
    t || g.defaultPrevented || (g.preventDefault(), !i.current && (f(g.clientX, g.clientY, g.currentTarget), a.current && (i.current = !0)));
  }), h = ap((g) => {
    if (d.current || i.current) return;
    const y = g, w = y.touches[0] ?? y.changedTouches[0];
    w && (f(w.clientX, w.clientY, c.current), i.current = !0);
  }, {
    threshold: o,
    events: ["touch"],
    cancelOnMove: !0,
    onStart: (g) => {
      a.current = !0, i.current = !1, c.current = g.currentTarget;
    },
    onFinish: (g) => {
      a.current = !1, i.current = !1, d.current || g.preventDefault();
    },
    onCancel: () => {
      a.current = !1, i.current = !1;
    }
  });
  return {
    onContextMenu: m,
    onMouseDown: p,
    onTouchStart: Mn(e.onTouchStart, h.onTouchStart),
    onTouchEnd: Mn(e.onTouchEnd, h.onTouchEnd),
    onTouchCancel: Mn(e.onTouchCancel, h.onTouchCancel),
    onTouchMove: Mn(e.onTouchMove, h.onTouchMove),
    style: t ? e.style : {
      ...e.style,
      WebkitTouchCallout: "none",
      WebkitUserSelect: "none",
      userSelect: "none"
    },
    "data-expanded": n ? !0 : void 0
  };
}
function ql(e) {
  const { children: t, disabled: n, longPressDelay: o } = J("PopoverContextMenu", null, e), r = Fo(t);
  if (!r) throw new Error("Popover.ContextMenu component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  const s = ka(), a = th({
    childProps: r.props,
    disabled: n || s.disabled,
    opened: s.opened,
    longPressDelay: o,
    setReference: s.reference,
    open: () => {
      s.opened || s.onToggle();
    }
  });
  return u.cloneElement(r, a);
}
ql.displayName = "@mantine/core/PopoverContextMenu";
function Vr({ children: e, active: t = !0, refProp: n = "ref", innerRef: o }) {
  const r = qf(t), s = _e(r, o), a = Fo(e);
  return a ? u.cloneElement(a, { [n]: s }) : e;
}
function Kl(e) {
  return /* @__PURE__ */ l.jsx(ja, {
    tabIndex: -1,
    "data-autofocus": !0,
    ...e
  });
}
Vr.displayName = "@mantine/core/FocusTrap";
Kl.displayName = "@mantine/core/FocusTrapInitialFocus";
Vr.InitialFocus = Kl;
var Xl = {
  dropdown: "m_38a85659",
  arrow: "m_a31dc6c1",
  overlay: "m_3d7bc908"
};
const Ea = ce((e) => {
  const t = J("PopoverDropdown", null, e), { className: n, style: o, vars: r, children: s, onKeyDownCapture: a, variant: i, classNames: c, styles: d, ref: f, ...p } = t, m = ka(), { dir: h } = oo(), g = m.arrowPosition === "merge" && m.withArrow ? Jm({
    position: m.placement,
    dir: h
  }) : void 0, y = ll({
    opened: m.opened,
    shouldReturnFocus: m.returnFocus
  }), w = m.withRoles ? {
    "aria-labelledby": m.getTargetId(),
    id: m.getDropdownId(),
    role: "dialog",
    tabIndex: -1
  } : {}, b = _e(f, m.floating);
  return m.disabled ? null : /* @__PURE__ */ l.jsx(da, {
    ...m.portalProps,
    withinPortal: m.withinPortal,
    children: /* @__PURE__ */ l.jsx(Ir, {
      mounted: m.opened,
      ...m.transitionProps,
      transition: m.transitionProps?.transition || "fade",
      duration: m.transitionProps?.duration ?? 150,
      keepMounted: m.keepMounted,
      keepMountedMode: m.keepMountedMode,
      exitDuration: typeof m.transitionProps?.exitDuration == "number" ? m.transitionProps.exitDuration : m.transitionProps?.duration,
      children: (k) => /* @__PURE__ */ l.jsx(Vr, {
        active: m.trapFocus && m.opened,
        innerRef: b,
        children: /* @__PURE__ */ l.jsxs(Q, {
          ...w,
          ...p,
          variant: i,
          onKeyDownCapture: $f(() => {
            m.onClose?.(), m.onDismiss?.();
          }, {
            active: m.closeOnEscape,
            onTrigger: y,
            onKeyDown: a
          }),
          "data-position": m.placement,
          "data-fixed": m.floatingStrategy === "fixed" || void 0,
          ...m.getStyles("dropdown", {
            className: n,
            props: t,
            classNames: c,
            styles: d,
            style: [
              {
                ...k,
                ...g,
                zIndex: m.zIndex,
                top: m.y ?? 0,
                left: m.x ?? 0,
                width: m.width === "target" ? void 0 : Ie(m.width),
                ...m.referenceHidden ? { display: "none" } : null
              },
              m.resolvedStyles?.dropdown,
              d?.dropdown,
              o
            ]
          }),
          children: [s, /* @__PURE__ */ l.jsx(Ul, {
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
              styles: d
            })
          })]
        })
      })
    })
  });
});
Ea.classes = Xl;
Ea.displayName = "@mantine/core/PopoverDropdown";
const nh = {
  refProp: "ref",
  popupType: "dialog"
}, Yl = ce((e) => {
  const { children: t, refProp: n, popupType: o, ref: r, ...s } = J("PopoverTarget", nh, e), a = Fo(t);
  if (!a) throw new Error("Popover.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  const i = s, c = ka(), d = _e(c.reference, vl(a), r), f = c.withRoles ? {
    "aria-haspopup": o,
    "aria-expanded": c.opened,
    "aria-controls": c.opened ? c.getDropdownId() : void 0,
    id: c.getTargetId()
  } : {}, p = a.props;
  return u.cloneElement(a, {
    ...i,
    ...f,
    ...c.targetProps,
    className: Xt(c.targetProps.className, i.className, p.className),
    [n]: d,
    ...c.controlled ? null : { onClick: (m) => {
      c.onToggle(), p.onClick?.(m);
    } }
  });
});
Yl.displayName = "@mantine/core/PopoverTarget";
function oh(e) {
  if (e === void 0) return {
    shift: !0,
    flip: !0
  };
  const t = { ...e };
  return e.shift === void 0 && (t.shift = !0), e.flip === void 0 && (t.flip = !0), t;
}
function rh(e, t, n, o) {
  const r = oh(e.middlewares), s = [Tm(e.offset), Lm()];
  if (r.flip && !n) {
    const a = typeof r.flip == "boolean" ? {} : r.flip, i = o ? {
      fallbackStrategy: "initialPlacement",
      ...a
    } : a;
    s.push(Mm(i));
  }
  if (r.shift) {
    const a = typeof r.shift == "boolean" ? {} : r.shift;
    s.push(Am((i) => {
      const c = i.placement.startsWith("top") || i.placement.startsWith("bottom");
      return {
        limiter: Im(),
        padding: 5,
        ...e.width === "target" && c ? { mainAxis: !1 } : null,
        ...a
      };
    }));
  }
  return r.inline && s.push(typeof r.inline == "boolean" ? Hi() : Hi(r.inline)), s.push(Om({
    element: e.arrowRef,
    padding: e.arrowOffset
  })), (r.size || e.width === "target") && s.push(Dm({
    ...typeof r.size == "boolean" ? {} : r.size,
    apply({ rects: a, availableWidth: i, availableHeight: c, ...d }) {
      const f = t().refs.floating.current?.style ?? {};
      r.size && (typeof r.size == "object" && r.size.apply ? r.size.apply({
        rects: a,
        availableWidth: i,
        availableHeight: c,
        ...d
      }) : Object.assign(f, {
        maxWidth: `${i}px`,
        maxHeight: `${c}px`
      })), e.width === "target" && Object.assign(f, { width: `${a.reference.width}px` });
    }
  })), s;
}
function sh(e) {
  const [t, n] = Xe({
    value: e.opened,
    defaultValue: e.defaultOpened,
    finalValue: !1,
    onChange: e.onChange
  }), o = u.useRef(t), r = u.useRef(!1), [s, a] = u.useState(null), i = e.preventPositionChangeWhenVisible !== !1, c = u.useRef(t);
  t !== c.current && (c.current = t, t && s !== null && a(null));
  const d = u.useRef(e.position);
  e.position !== d.current && (d.current = e.position, r.current = !1, s !== null && a(null));
  const f = u.useCallback(() => a(null), []), p = () => {
    t && !e.disabled && n(!1);
  }, m = () => {
    e.disabled || n(!t);
  }, h = Xm({
    open: t,
    strategy: e.strategy,
    placement: i ? s ?? e.position : e.position,
    middleware: rh(e, () => h, i && s !== null, i),
    whileElementsMounted: e.keepMounted ? void 0 : Fi
  });
  u.useEffect(() => {
    if (!e.keepMounted) return;
    const y = h.refs.reference.current, w = h.refs.floating.current;
    if (t && y && w) return Fi(y, w, h.update);
  }, [
    e.keepMounted,
    t,
    h.update,
    h.elements.reference,
    h.elements.floating
  ]), So(() => {
    if (!t) {
      r.current = !1;
      return;
    }
    if (!i || s !== null) return;
    const y = h.refs.floating.current;
    if (!(!y || y.offsetHeight === 0 || y.offsetWidth === 0)) {
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
  const g = u.useRef(h.placement);
  return So(() => {
    g.current !== h.placement && (g.current = h.placement, e.onPositionChange?.(h.placement));
  }, [h.placement]), fn(() => {
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
const ah = {
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
  zIndex: no("popover"),
  __staticSelector: "Popover",
  width: "max-content"
}, Gl = $e((e, { radius: t, shadow: n }) => ({ dropdown: {
  "--popover-radius": t === void 0 ? void 0 : jt(t),
  "--popover-shadow": Gc(n)
} }));
function ze(e) {
  const t = J("Popover", ah, e), { children: n, position: o, offset: r, onPositionChange: s, opened: a, transitionProps: i, onExitTransitionEnd: c, onEnterTransitionEnd: d, width: f, middlewares: p, withArrow: m, arrowSize: h, arrowOffset: g, arrowRadius: y, arrowPosition: w, unstyled: b, classNames: k, styles: C, closeOnClickOutside: j, withinPortal: N, portalProps: T, closeOnEscape: S, clickOutsideEvents: v, trapFocus: R, onClose: D, onDismiss: L, onOpen: F, onChange: _, zIndex: z, radius: O, shadow: M, id: $, defaultOpened: I, __staticSelector: A, withRoles: B, disabled: W, returnFocus: U, variant: Z, keepMounted: le, keepMountedMode: ue, vars: se, floatingStrategy: ee, withOverlay: pe, overlayProps: q, hideDetached: K, attributes: ae, preventPositionChangeWhenVisible: be, ...fe } = t, Se = Me({
    name: A,
    props: t,
    classes: Xl,
    classNames: k,
    styles: C,
    unstyled: b,
    attributes: ae,
    rootSelector: "dropdown",
    vars: se,
    varsResolver: Gl
  }), { resolvedStyles: te } = zo({
    classNames: k,
    styles: C,
    props: t
  }), H = u.useRef(null), [V, X] = u.useState(null), [ie, Ce] = u.useState(null), { dir: Pe } = oo(), me = aa(), he = Lt($), xe = sh({
    middlewares: p,
    width: f,
    position: Qm(Pe, o),
    offset: typeof r == "number" ? r + (m ? h / 2 : 0) : r,
    arrowRef: H,
    arrowOffset: g,
    onPositionChange: s,
    opened: a,
    defaultOpened: I,
    onChange: _,
    onOpen: F,
    onClose: D,
    onDismiss: L,
    strategy: ee,
    disabled: W,
    preventPositionChangeWhenVisible: be,
    keepMounted: le
  });
  cl(() => {
    j && (xe.onClose(), L?.());
  }, v, [V, ie]);
  const Ae = u.useCallback((pt) => {
    X(pt), xe.floating.refs.setReference(pt);
  }, [xe.floating.refs.setReference]), de = u.useCallback((pt) => {
    Ce(pt), xe.floating.refs.setFloating(pt);
  }, [xe.floating.refs.setFloating]), ft = u.useCallback(() => {
    i?.onExited?.(), c?.(), xe.resetLockedPlacement();
  }, [
    i?.onExited,
    c,
    xe.resetLockedPlacement
  ]), Re = u.useCallback(() => {
    i?.onEntered?.(), d?.();
  }, [i?.onEntered, d]);
  return /* @__PURE__ */ l.jsxs(eh, {
    value: {
      returnFocus: U,
      disabled: W,
      controlled: xe.controlled,
      reference: Ae,
      floating: de,
      x: xe.floating.x,
      y: xe.floating.y,
      arrowX: xe.floating?.middlewareData?.arrow?.x,
      arrowY: xe.floating?.middlewareData?.arrow?.y,
      opened: xe.opened,
      arrowRef: H,
      transitionProps: {
        ...i,
        onExited: ft,
        onEntered: Re
      },
      width: f,
      withArrow: m,
      arrowSize: h,
      arrowOffset: g,
      arrowRadius: y,
      arrowPosition: w,
      placement: xe.floating.placement,
      trapFocus: R,
      withinPortal: N,
      portalProps: T,
      zIndex: z,
      radius: O,
      shadow: M,
      closeOnEscape: S,
      onDismiss: L,
      onClose: xe.onClose,
      onToggle: xe.onToggle,
      getTargetId: () => he,
      getDropdownId: () => `${he}-dropdown`,
      withRoles: B,
      targetProps: fe,
      __staticSelector: A,
      classNames: k,
      styles: C,
      unstyled: b,
      variant: Z,
      keepMounted: le,
      keepMountedMode: ue,
      getStyles: Se,
      resolvedStyles: te,
      floatingStrategy: ee,
      referenceHidden: K && me !== "test" ? xe.floating.middlewareData.hide?.referenceHidden : !1
    },
    children: [n, pe && /* @__PURE__ */ l.jsx(Ir, {
      transition: "fade",
      mounted: xe.opened,
      duration: i?.duration || 250,
      exitDuration: i?.exitDuration || 250,
      children: (pt) => /* @__PURE__ */ l.jsx(da, {
        withinPortal: N,
        children: /* @__PURE__ */ l.jsx(tl, {
          ...q,
          ...Se("overlay", {
            className: q?.className,
            style: [pt, q?.style]
          })
        })
      })
    })]
  });
}
ze.Target = Yl;
ze.Dropdown = Ea;
ze.ContextMenu = ql;
ze.varsResolver = Gl;
ze.displayName = "@mantine/core/Popover";
ze.extend = (e) => e;
ze.withProps = (e) => {
  const t = (n) => /* @__PURE__ */ l.jsx(ze, {
    ...e,
    ...n
  });
  return t.extend = ze.extend, t.displayName = `WithProps(${ze.displayName})`, t;
};
const [ih, Qt] = Zt("ModalBase component was not found in tree");
function ch({ opened: e, transitionDuration: t }) {
  const [n, o] = u.useState(e), r = u.useRef(-1), s = ia() ? 0 : t;
  return u.useEffect(() => (e ? (o(!0), window.clearTimeout(r.current)) : s === 0 ? o(!1) : r.current = window.setTimeout(() => o(!1), s), () => window.clearTimeout(r.current)), [e, s]), n;
}
function lh({ id: e, transitionProps: t, opened: n, trapFocus: o, closeOnEscape: r, onClose: s, returnFocus: a, handledEscapeEvents: i }) {
  const c = Lt(e), [d, f] = u.useState(!1), [p, m] = u.useState(!1), h = typeof t?.duration == "number" ? t?.duration : 200, g = ch({
    opened: n,
    transitionDuration: h
  });
  return Yf("keydown", (y) => {
    y.key === "Escape" && r && !y.isComposing && n && !i?.has(y) && y.target?.getAttribute("data-mantine-stop-propagation") !== "true" && (i?.add(y), s());
  }, { capture: !0 }), ll({
    opened: n,
    shouldReturnFocus: o && a
  }), {
    _id: c,
    titleMounted: d,
    bodyMounted: p,
    shouldLockScroll: g,
    setTitleMounted: f,
    setBodyMounted: m
  };
}
var _t = function() {
  return _t = Object.assign || function(t) {
    for (var n, o = 1, r = arguments.length; o < r; o++) {
      n = arguments[o];
      for (var s in n) Object.prototype.hasOwnProperty.call(n, s) && (t[s] = n[s]);
    }
    return t;
  }, _t.apply(this, arguments);
};
function Zl(e, t) {
  var n = {};
  for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var r = 0, o = Object.getOwnPropertySymbols(e); r < o.length; r++)
      t.indexOf(o[r]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[r]) && (n[o[r]] = e[o[r]]);
  return n;
}
function dh(e, t, n) {
  if (n || arguments.length === 2) for (var o = 0, r = t.length, s; o < r; o++)
    (s || !(o in t)) && (s || (s = Array.prototype.slice.call(t, 0, o)), s[o] = t[o]);
  return e.concat(s || Array.prototype.slice.call(t));
}
var fr = "right-scroll-bar-position", pr = "width-before-scroll-bar", uh = "with-scroll-bars-hidden", fh = "--removed-body-scroll-bar-size";
function xs(e, t) {
  return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
function ph(e, t) {
  var n = u.useState(function() {
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
var mh = typeof window < "u" ? u.useLayoutEffect : u.useEffect, Xi = /* @__PURE__ */ new WeakMap();
function hh(e, t) {
  var n = ph(null, function(o) {
    return e.forEach(function(r) {
      return xs(r, o);
    });
  });
  return mh(function() {
    var o = Xi.get(n);
    if (o) {
      var r = new Set(o), s = new Set(e), a = n.current;
      r.forEach(function(i) {
        s.has(i) || xs(i, null);
      }), s.forEach(function(i) {
        r.has(i) || xs(i, a);
      });
    }
    Xi.set(n, e);
  }, [e]), n;
}
function gh(e) {
  return e;
}
function vh(e, t) {
  t === void 0 && (t = gh);
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
      }, d = function() {
        return Promise.resolve().then(c);
      };
      d(), n = {
        push: function(f) {
          a.push(f), d();
        },
        filter: function(f) {
          return a = a.filter(f), n;
        }
      };
    }
  };
  return r;
}
function yh(e) {
  e === void 0 && (e = {});
  var t = vh(null);
  return t.options = _t({ async: !0, ssr: !1 }, e), t;
}
var Jl = function(e) {
  var t = e.sideCar, n = Zl(e, ["sideCar"]);
  if (!t)
    throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  var o = t.read();
  if (!o)
    throw new Error("Sidecar medium not found");
  return u.createElement(o, _t({}, n));
};
Jl.isSideCarExport = !0;
function bh(e, t) {
  return e.useMedium(t), Jl;
}
var Ql = yh(), ws = function() {
}, Hr = u.forwardRef(function(e, t) {
  var n = u.useRef(null), o = u.useState({
    onScrollCapture: ws,
    onWheelCapture: ws,
    onTouchMoveCapture: ws
  }), r = o[0], s = o[1], a = e.forwardProps, i = e.children, c = e.className, d = e.removeScrollBar, f = e.enabled, p = e.shards, m = e.sideCar, h = e.noRelative, g = e.noIsolation, y = e.inert, w = e.allowPinchZoom, b = e.as, k = b === void 0 ? "div" : b, C = e.gapMode, j = Zl(e, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]), N = m, T = hh([n, t]), S = _t(_t({}, j), r);
  return u.createElement(
    u.Fragment,
    null,
    f && u.createElement(N, { sideCar: Ql, removeScrollBar: d, shards: p, noRelative: h, noIsolation: g, inert: y, setCallbacks: s, allowPinchZoom: !!w, lockRef: n, gapMode: C }),
    a ? u.cloneElement(u.Children.only(i), _t(_t({}, S), { ref: T })) : u.createElement(k, _t({}, S, { className: c, ref: T }), i)
  );
});
Hr.defaultProps = {
  enabled: !0,
  removeScrollBar: !0,
  inert: !1
};
Hr.classNames = {
  fullWidth: pr,
  zeroRight: fr
};
var xh = function() {
  if (typeof __webpack_nonce__ < "u")
    return __webpack_nonce__;
};
function wh() {
  if (!document)
    return null;
  var e = document.createElement("style");
  e.type = "text/css";
  var t = xh();
  return t && e.setAttribute("nonce", t), e;
}
function Sh(e, t) {
  e.styleSheet ? e.styleSheet.cssText = t : e.appendChild(document.createTextNode(t));
}
function Ch(e) {
  var t = document.head || document.getElementsByTagName("head")[0];
  t.appendChild(e);
}
var jh = function() {
  var e = 0, t = null;
  return {
    add: function(n) {
      e == 0 && (t = wh()) && (Sh(t, n), Ch(t)), e++;
    },
    remove: function() {
      e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), t = null);
    }
  };
}, kh = function() {
  var e = jh();
  return function(t, n) {
    u.useEffect(function() {
      return e.add(t), function() {
        e.remove();
      };
    }, [t && n]);
  };
}, ed = function() {
  var e = kh(), t = function(n) {
    var o = n.styles, r = n.dynamic;
    return e(o, r), null;
  };
  return t;
}, Eh = {
  left: 0,
  top: 0,
  right: 0,
  gap: 0
}, Ss = function(e) {
  return parseInt(e || "", 10) || 0;
}, Rh = function(e) {
  var t = window.getComputedStyle(document.body), n = t[e === "padding" ? "paddingLeft" : "marginLeft"], o = t[e === "padding" ? "paddingTop" : "marginTop"], r = t[e === "padding" ? "paddingRight" : "marginRight"];
  return [Ss(n), Ss(o), Ss(r)];
}, Nh = function(e) {
  if (e === void 0 && (e = "margin"), typeof window > "u")
    return Eh;
  var t = Rh(e), n = document.documentElement.clientWidth, o = window.innerWidth;
  return {
    left: t[0],
    top: t[1],
    right: t[2],
    gap: Math.max(0, o - n + t[2] - t[0])
  };
}, Ph = ed(), Hn = "data-scroll-locked", Th = function(e, t, n, o) {
  var r = e.left, s = e.top, a = e.right, i = e.gap;
  return n === void 0 && (n = "margin"), `
  .`.concat(uh, ` {
   overflow: hidden `).concat(o, `;
   padding-right: `).concat(i, "px ").concat(o, `;
  }
  body[`).concat(Hn, `] {
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
  
  .`).concat(fr, ` {
    right: `).concat(i, "px ").concat(o, `;
  }
  
  .`).concat(pr, ` {
    margin-right: `).concat(i, "px ").concat(o, `;
  }
  
  .`).concat(fr, " .").concat(fr, ` {
    right: 0 `).concat(o, `;
  }
  
  .`).concat(pr, " .").concat(pr, ` {
    margin-right: 0 `).concat(o, `;
  }
  
  body[`).concat(Hn, `] {
    `).concat(fh, ": ").concat(i, `px;
  }
`);
}, Yi = function() {
  var e = parseInt(document.body.getAttribute(Hn) || "0", 10);
  return isFinite(e) ? e : 0;
}, Ah = function() {
  u.useEffect(function() {
    return document.body.setAttribute(Hn, (Yi() + 1).toString()), function() {
      var e = Yi() - 1;
      e <= 0 ? document.body.removeAttribute(Hn) : document.body.setAttribute(Hn, e.toString());
    };
  }, []);
}, Ih = function(e) {
  var t = e.noRelative, n = e.noImportant, o = e.gapMode, r = o === void 0 ? "margin" : o;
  Ah();
  var s = u.useMemo(function() {
    return Nh(r);
  }, [r]);
  return u.createElement(Ph, { styles: Th(s, !t, r, n ? "" : "!important") });
}, Hs = !1;
if (typeof window < "u")
  try {
    var sr = Object.defineProperty({}, "passive", {
      get: function() {
        return Hs = !0, !0;
      }
    });
    window.addEventListener("test", sr, sr), window.removeEventListener("test", sr, sr);
  } catch {
    Hs = !1;
  }
var Dn = Hs ? { passive: !1 } : !1, Mh = function(e) {
  return e.tagName === "TEXTAREA";
}, td = function(e, t) {
  if (!(e instanceof Element))
    return !1;
  var n = window.getComputedStyle(e);
  return (
    // not-not-scrollable
    n[t] !== "hidden" && // contains scroll inside self
    !(n.overflowY === n.overflowX && !Mh(e) && n[t] === "visible")
  );
}, Dh = function(e) {
  return td(e, "overflowY");
}, Lh = function(e) {
  return td(e, "overflowX");
}, Gi = function(e, t) {
  var n = t.ownerDocument, o = t;
  do {
    typeof ShadowRoot < "u" && o instanceof ShadowRoot && (o = o.host);
    var r = nd(e, o);
    if (r) {
      var s = od(e, o), a = s[1], i = s[2];
      if (a > i)
        return !0;
    }
    o = o.parentNode;
  } while (o && o !== n.body);
  return !1;
}, Oh = function(e) {
  var t = e.scrollTop, n = e.scrollHeight, o = e.clientHeight;
  return [
    t,
    n,
    o
  ];
}, $h = function(e) {
  var t = e.scrollLeft, n = e.scrollWidth, o = e.clientWidth;
  return [
    t,
    n,
    o
  ];
}, nd = function(e, t) {
  return e === "v" ? Dh(t) : Lh(t);
}, od = function(e, t) {
  return e === "v" ? Oh(t) : $h(t);
}, _h = function(e, t) {
  return e === "h" && t === "rtl" ? -1 : 1;
}, zh = function(e, t, n, o, r) {
  var s = _h(e, window.getComputedStyle(t).direction), a = s * o, i = n.target, c = t.contains(i), d = !1, f = a > 0, p = 0, m = 0;
  do {
    if (!i)
      break;
    var h = od(e, i), g = h[0], y = h[1], w = h[2], b = y - w - s * g;
    (g || b) && nd(e, i) && (p += b, m += g);
    var k = i.parentNode;
    i = k && k.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? k.host : k;
  } while (
    // portaled content
    !c && i !== document.body || // self content
    c && (t.contains(i) || t === i)
  );
  return (f && Math.abs(p) < 1 || !f && Math.abs(m) < 1) && (d = !0), d;
}, ar = function(e) {
  return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, Zi = function(e) {
  return [e.deltaX, e.deltaY];
}, Ji = function(e) {
  return e && "current" in e ? e.current : e;
}, Fh = function(e, t) {
  return e[0] === t[0] && e[1] === t[1];
}, Bh = function(e) {
  return `
  .block-interactivity-`.concat(e, ` {pointer-events: none;}
  .allow-interactivity-`).concat(e, ` {pointer-events: all;}
`);
}, Vh = 0, Ln = [];
function Hh(e) {
  var t = u.useRef([]), n = u.useRef([0, 0]), o = u.useRef(), r = u.useState(Vh++)[0], s = u.useState(ed)[0], a = u.useRef(e);
  u.useEffect(function() {
    a.current = e;
  }, [e]), u.useEffect(function() {
    if (e.inert) {
      document.body.classList.add("block-interactivity-".concat(r));
      var y = dh([e.lockRef.current], (e.shards || []).map(Ji), !0).filter(Boolean);
      return y.forEach(function(w) {
        return w.classList.add("allow-interactivity-".concat(r));
      }), function() {
        document.body.classList.remove("block-interactivity-".concat(r)), y.forEach(function(w) {
          return w.classList.remove("allow-interactivity-".concat(r));
        });
      };
    }
  }, [e.inert, e.lockRef.current, e.shards]);
  var i = u.useCallback(function(y, w) {
    if ("touches" in y && y.touches.length === 2 || y.type === "wheel" && y.ctrlKey)
      return !a.current.allowPinchZoom;
    var b = ar(y), k = n.current, C = "deltaX" in y ? y.deltaX : k[0] - b[0], j = "deltaY" in y ? y.deltaY : k[1] - b[1], N, T = y.target, S = Math.abs(C) > Math.abs(j) ? "h" : "v";
    if ("touches" in y && S === "h" && T.type === "range")
      return !1;
    var v = window.getSelection(), R = v && v.anchorNode, D = R ? R === T || R.contains(T) : !1;
    if (D)
      return !1;
    var L = Gi(S, T);
    if (!L)
      return !0;
    if (L ? N = S : (N = S === "v" ? "h" : "v", L = Gi(S, T)), !L)
      return !1;
    if (!o.current && "changedTouches" in y && (C || j) && (o.current = N), !N)
      return !0;
    var F = o.current || N;
    return zh(F, w, y, F === "h" ? C : j);
  }, []), c = u.useCallback(function(y) {
    var w = y;
    if (!(!Ln.length || Ln[Ln.length - 1] !== s)) {
      var b = "deltaY" in w ? Zi(w) : ar(w), k = t.current.filter(function(N) {
        return N.name === w.type && (N.target === w.target || w.target === N.shadowParent) && Fh(N.delta, b);
      })[0];
      if (k && k.should) {
        w.cancelable && w.preventDefault();
        return;
      }
      if (!k) {
        var C = (a.current.shards || []).map(Ji).filter(Boolean).filter(function(N) {
          return N.contains(w.target);
        }), j = C.length > 0 ? i(w, C[0]) : !a.current.noIsolation;
        j && w.cancelable && w.preventDefault();
      }
    }
  }, []), d = u.useCallback(function(y, w, b, k) {
    var C = { name: y, delta: w, target: b, should: k, shadowParent: Wh(b) };
    t.current.push(C), setTimeout(function() {
      t.current = t.current.filter(function(j) {
        return j !== C;
      });
    }, 1);
  }, []), f = u.useCallback(function(y) {
    n.current = ar(y), o.current = void 0;
  }, []), p = u.useCallback(function(y) {
    d(y.type, Zi(y), y.target, i(y, e.lockRef.current));
  }, []), m = u.useCallback(function(y) {
    d(y.type, ar(y), y.target, i(y, e.lockRef.current));
  }, []);
  u.useEffect(function() {
    return Ln.push(s), e.setCallbacks({
      onScrollCapture: p,
      onWheelCapture: p,
      onTouchMoveCapture: m
    }), document.addEventListener("wheel", c, Dn), document.addEventListener("touchmove", c, Dn), document.addEventListener("touchstart", f, Dn), function() {
      Ln = Ln.filter(function(y) {
        return y !== s;
      }), document.removeEventListener("wheel", c, Dn), document.removeEventListener("touchmove", c, Dn), document.removeEventListener("touchstart", f, Dn);
    };
  }, []);
  var h = e.removeScrollBar, g = e.inert;
  return u.createElement(
    u.Fragment,
    null,
    g ? u.createElement(s, { styles: Bh(r) }) : null,
    h ? u.createElement(Ih, { noRelative: e.noRelative, gapMode: e.gapMode }) : null
  );
}
function Wh(e) {
  for (var t = null; e !== null; )
    e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
  return t;
}
const Uh = bh(Ql, Hh);
var rd = u.forwardRef(function(e, t) {
  return u.createElement(Hr, _t({}, e, { ref: t, sideCar: Uh }));
});
rd.classNames = Hr.classNames;
function sd({ keepMounted: e, keepMountedMode: t = "activity", opened: n, onClose: o, id: r, transitionProps: s, onExitTransitionEnd: a, onEnterTransitionEnd: i, trapFocus: c, closeOnEscape: d, returnFocus: f, closeOnClickOutside: p, withinPortal: m, portalProps: h, lockScroll: g, children: y, zIndex: w, shadow: b, padding: k, __vars: C, unstyled: j, removeScrollProps: N, __handledEscapeEvents: T, ...S }) {
  const { _id: v, titleMounted: R, bodyMounted: D, shouldLockScroll: L, setTitleMounted: F, setBodyMounted: _ } = lh({
    id: r,
    transitionProps: s,
    opened: n,
    trapFocus: c,
    closeOnEscape: d,
    onClose: o,
    returnFocus: f,
    handledEscapeEvents: T
  }), { key: z, ...O } = N || {};
  return /* @__PURE__ */ l.jsx(da, {
    ...h,
    withinPortal: m,
    children: /* @__PURE__ */ l.jsx(ih, {
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
        getTitleId: () => `${v}-title`,
        getBodyId: () => `${v}-body`,
        titleMounted: R,
        bodyMounted: D,
        setTitleMounted: F,
        setBodyMounted: _,
        trapFocus: c,
        closeOnEscape: d,
        zIndex: w,
        unstyled: j
      },
      children: /* @__PURE__ */ l.jsx(rd, {
        enabled: L && g,
        ...O,
        children: /* @__PURE__ */ l.jsx(Q, {
          ...S,
          id: v,
          __vars: {
            ...C,
            "--mb-z-index": (w || no("modal")).toString(),
            "--mb-shadow": Gc(b),
            "--mb-padding": ca(k)
          },
          children: y
        })
      }, z)
    })
  });
}
sd.displayName = "@mantine/core/ModalBase";
function qh() {
  const e = Qt();
  return u.useEffect(() => (e.setBodyMounted(!0), () => e.setBodyMounted(!1)), []), e.getBodyId();
}
var Yn = {
  title: "m_615af6c9",
  header: "m_b5489c3c",
  inner: "m_60c222c7",
  content: "m_fd1ab0aa",
  close: "m_606cb269",
  body: "m_5df29311"
};
function ad({ className: e, ...t }) {
  const n = qh(), o = Qt();
  return /* @__PURE__ */ l.jsx(Q, {
    id: n,
    className: Xt({ [Yn.body]: !o.unstyled }, e),
    ...t
  });
}
ad.displayName = "@mantine/core/ModalBaseBody";
function id({ className: e, onClick: t, ...n }) {
  const o = Qt();
  return /* @__PURE__ */ l.jsx(al, {
    ...n,
    onClick: (r) => {
      o.onClose(), t?.(r);
    },
    className: Xt({ [Yn.close]: !o.unstyled }, e),
    unstyled: o.unstyled
  });
}
id.displayName = "@mantine/core/ModalBaseCloseButton";
function cd({ transitionProps: e, className: t, innerProps: n, onKeyDown: o, style: r, ref: s, ...a }) {
  const i = Qt();
  return /* @__PURE__ */ l.jsx(Ir, {
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
      className: Xt({ [Yn.inner]: !i.unstyled }, n.className),
      children: /* @__PURE__ */ l.jsx(Vr, {
        active: i.opened && i.trapFocus,
        innerRef: s,
        children: /* @__PURE__ */ l.jsx(Kn, {
          ...a,
          component: "section",
          role: "dialog",
          tabIndex: -1,
          "aria-modal": !0,
          "aria-describedby": i.bodyMounted ? i.getBodyId() : void 0,
          "aria-labelledby": i.titleMounted ? i.getTitleId() : void 0,
          style: [r, c],
          className: Xt({ [Yn.content]: !i.unstyled }, t),
          unstyled: i.unstyled,
          children: a.children
        })
      })
    })
  });
}
cd.displayName = "@mantine/core/ModalBaseContent";
function ld({ className: e, ...t }) {
  const n = Qt();
  return /* @__PURE__ */ l.jsx(Q, {
    component: "header",
    className: Xt({ [Yn.header]: !n.unstyled }, e),
    ...t
  });
}
ld.displayName = "@mantine/core/ModalBaseHeader";
const Kh = {
  duration: 200,
  timingFunction: "ease",
  transition: "fade"
};
function Xh(e) {
  const t = Qt();
  return {
    ...Kh,
    ...t.transitionProps,
    ...e
  };
}
function dd({ onClick: e, transitionProps: t, style: n, visible: o, ...r }) {
  const s = Qt(), a = Xh(t);
  return /* @__PURE__ */ l.jsx(Ir, {
    mounted: o !== void 0 ? o : s.opened,
    ...a,
    transition: "fade",
    children: (i) => /* @__PURE__ */ l.jsx(tl, {
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
dd.displayName = "@mantine/core/ModalBaseOverlay";
function Yh() {
  const e = Qt();
  return u.useEffect(() => (e.setTitleMounted(!0), () => e.setTitleMounted(!1)), []), e.getTitleId();
}
function ud({ className: e, ...t }) {
  const n = Yh(), o = Qt();
  return /* @__PURE__ */ l.jsx(Q, {
    component: "h2",
    className: Xt({ [Yn.title]: !o.unstyled }, e),
    id: n,
    ...t
  });
}
ud.displayName = "@mantine/core/ModalBaseTitle";
function Gh({ children: e }) {
  return /* @__PURE__ */ l.jsx(l.Fragment, { children: e });
}
const Zh = {
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
var fd = { root: "m_8bffd616" };
const Wn = Zc((e) => {
  const t = J("Flex", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, gap: c, rowGap: d, columnGap: f, align: p, justify: m, wrap: h, direction: g, attributes: y, ...w } = t, b = Me({
    name: "Flex",
    classes: fd,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: y,
    vars: i
  }), k = _o(), C = gf(), j = vf({
    styleProps: {
      gap: c,
      rowGap: d,
      columnGap: f,
      align: p,
      justify: m,
      wrap: h,
      direction: g
    },
    theme: k,
    data: Zh
  }), N = yf(), T = N && j.hasResponsiveStyles ? bf(j.styles, j.media) : C;
  return /* @__PURE__ */ l.jsxs(l.Fragment, { children: [j.hasResponsiveStyles && /* @__PURE__ */ l.jsx(xf, {
    selector: `.${T}`,
    styles: j.styles,
    media: j.media,
    deduplicate: N
  }), /* @__PURE__ */ l.jsx(Q, {
    ...b("root", {
      className: T,
      style: wf(j.inlineStyles)
    }),
    ...w
  })] });
});
Wn.classes = fd;
Wn.displayName = "@mantine/core/Flex";
function Jh(e, t) {
  if (!t || !e) return !1;
  let n = t.parentNode;
  for (; n != null; ) {
    if (n === e) return !0;
    n = n.parentNode;
  }
  return !1;
}
function Qh({ target: e, parent: t, ref: n, displayAfterTransitionEnd: o, onTransitionStart: r, onTransitionEnd: s }) {
  const a = u.useRef(-1), i = u.useRef(e), [c, d] = u.useState(!1), [f, p] = u.useState(typeof o == "boolean" ? o : !1), m = () => {
    if (!e || !t || !n.current) return;
    const w = e.getBoundingClientRect(), b = t.getBoundingClientRect(), k = t.offsetWidth === 0 ? 1 : b.width / t.offsetWidth, C = t.offsetHeight === 0 ? 1 : b.height / t.offsetHeight, j = window.getComputedStyle(e), N = window.getComputedStyle(t), T = an(j.borderTopWidth) + an(N.borderTopWidth), S = an(j.borderLeftWidth) + an(N.borderLeftWidth), v = {
      top: (w.top - b.top) / C - T,
      left: (w.left - b.left) / k - S,
      width: w.width / k,
      height: w.height / C
    };
    n.current.style.transform = `translateY(${v.top}px) translateX(${v.left}px)`, n.current.style.width = `${v.width}px`, n.current.style.height = `${v.height}px`;
  }, h = () => {
    window.clearTimeout(a.current), n.current && (n.current.style.transitionDuration = "0ms"), m(), a.current = window.setTimeout(() => {
      n.current && (n.current.style.transitionDuration = "");
    }, 30);
  }, g = u.useRef(null), y = u.useRef(null);
  return u.useEffect(() => {
    if (c && i.current !== e && r && r(), i.current = e, m(), e)
      return g.current = new ResizeObserver(h), g.current.observe(e), t && (y.current = new ResizeObserver(h), y.current.observe(t)), () => {
        g.current?.disconnect(), y.current?.disconnect();
      };
  }, [t, e]), u.useEffect(() => {
    if (t) {
      const w = (b) => {
        Jh(b.target, t) && (h(), p(!1));
      };
      return t.addEventListener("transitionend", w), () => {
        t.removeEventListener("transitionend", w);
      };
    }
  }, [t]), u.useEffect(() => {
    if (n.current && s) {
      const w = (b) => {
        b.propertyName === "transform" && s();
      };
      return n.current.addEventListener("transitionend", w), () => {
        n.current?.removeEventListener("transitionend", w);
      };
    }
  }, [s]), Jf(() => {
    hl() !== "test" && d(!0);
  }, 20, { autoInvoke: !0 }), np((w) => {
    w.forEach((b) => {
      b.type === "attributes" && b.attributeName === "dir" && h();
    });
  }, {
    attributes: !0,
    attributeFilter: ["dir"]
  }, () => document.documentElement), {
    initialized: c,
    hidden: f
  };
}
var pd = { root: "m_96b553a6" };
const md = $e((e, { transitionDuration: t }, { shouldReduceMotion: n }) => ({ root: { "--transition-duration": e.respectReducedMotion && n ? "0ms" : typeof t == "number" ? `${t}ms` : t || "150ms" } })), Wr = ce((e) => {
  const t = J("FloatingIndicator", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, target: c, parent: d, transitionDuration: f, mod: p, displayAfterTransitionEnd: m, onTransitionStart: h, onTransitionEnd: g, attributes: y, ref: w, ...b } = t, k = ia(), C = Me({
    name: "FloatingIndicator",
    classes: pd,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: y,
    vars: i,
    varsResolver: md,
    stylesCtx: { shouldReduceMotion: k }
  }), j = u.useRef(null), { initialized: N, hidden: T } = Qh({
    target: c,
    parent: d,
    ref: j,
    displayAfterTransitionEnd: m,
    onTransitionStart: h,
    onTransitionEnd: g
  }), S = _e(w, j);
  return !c || !d ? null : /* @__PURE__ */ l.jsx(Q, {
    ref: S,
    mod: [{
      initialized: N,
      hidden: T
    }, p],
    ...C("root"),
    ...b
  });
});
Wr.displayName = "@mantine/core/FloatingIndicator";
Wr.classes = pd;
Wr.varsResolver = md;
const [eg, Ra] = Zt("Accordion component was not found in the tree");
function Na({ style: e, size: t = 16, ...n }) {
  return /* @__PURE__ */ l.jsx("svg", {
    viewBox: "0 0 15 15",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    style: {
      ...e,
      width: Ie(t),
      height: Ie(t),
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
Na.displayName = "@mantine/core/AccordionChevron";
const [tg, hd] = Zt("Accordion.Item component was not found in the tree");
var Vo = {
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
const Pa = ce((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, chevron: a, icon: i, onClick: c, onKeyDown: d, children: f, disabled: p, mod: m, ...h } = J("AccordionControl", null, e), { value: g } = hd(), y = Ra(), w = y.isItemActive(g), b = typeof y.order == "number", k = `h${y.order}`, C = /* @__PURE__ */ l.jsxs(Xn, {
    ...y.getStyles("control", {
      className: n,
      classNames: t,
      style: o,
      styles: r,
      variant: y.variant
    }),
    unstyled: y.unstyled,
    mod: [
      "accordion-control",
      {
        active: w,
        "chevron-position": y.chevronPosition,
        disabled: p
      },
      m
    ],
    onClick: (j) => {
      c?.(j), y.onChange(g);
    },
    type: "button",
    disabled: p,
    "aria-expanded": w,
    "aria-controls": y.getRegionId(g),
    id: y.getControlId(g),
    onKeyDown: il({
      siblingSelector: "[data-accordion-control]",
      parentSelector: "[data-accordion]",
      activateOnFocus: !1,
      loop: y.loop,
      orientation: "vertical",
      onKeyDown: d
    }),
    ...h,
    children: [
      /* @__PURE__ */ l.jsx(Q, {
        component: "span",
        mod: {
          rotate: !y.disableChevronRotation && w,
          position: y.chevronPosition
        },
        ...y.getStyles("chevron", {
          classNames: t,
          styles: r
        }),
        children: a || y.chevron
      }),
      /* @__PURE__ */ l.jsx("span", {
        ...y.getStyles("label", {
          classNames: t,
          styles: r
        }),
        children: f
      }),
      i && /* @__PURE__ */ l.jsx(Q, {
        component: "span",
        mod: { "chevron-position": y.chevronPosition },
        ...y.getStyles("icon", {
          classNames: t,
          styles: r
        }),
        children: i
      })
    ]
  });
  return b ? /* @__PURE__ */ l.jsx(k, {
    ...y.getStyles("itemTitle", {
      classNames: t,
      styles: r
    }),
    children: C
  }) : C;
});
Pa.displayName = "@mantine/core/AccordionControl";
Pa.classes = Vo;
const Ta = ce((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, value: a, mod: i, ...c } = J("AccordionItem", null, e), d = Ra();
  return /* @__PURE__ */ l.jsx(tg, {
    value: { value: a },
    children: /* @__PURE__ */ l.jsx(Q, {
      mod: [{ active: d.isItemActive(a) }, i],
      ...d.getStyles("item", {
        className: n,
        classNames: t,
        styles: r,
        style: o,
        variant: d.variant
      }),
      ...c
    })
  });
});
Ta.displayName = "@mantine/core/AccordionItem";
Ta.classes = Vo;
const Aa = ce((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, children: a, keepMounted: i, keepMountedMode: c, ...d } = J("AccordionPanel", null, e), { value: f } = hd(), p = Ra();
  return /* @__PURE__ */ l.jsx(yl, {
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
    ...d,
    children: /* @__PURE__ */ l.jsx("div", {
      ...p.getStyles("content", {
        classNames: t,
        styles: r
      }),
      children: a
    })
  });
});
Aa.displayName = "@mantine/core/AccordionPanel";
Aa.classes = Vo;
const ng = {
  multiple: !1,
  loop: !0,
  disableChevronRotation: !1,
  disableCollapse: !1,
  chevronPosition: "right",
  variant: "default",
  chevronSize: "auto",
  chevronIconSize: 16,
  keepMountedMode: "activity"
}, gd = $e((e, { transitionDuration: t, chevronSize: n, radius: o }) => ({ root: {
  "--accordion-transition-duration": t === void 0 ? void 0 : `${t}ms`,
  "--accordion-chevron-size": n === void 0 ? void 0 : Ie(n),
  "--accordion-radius": o === void 0 ? void 0 : jt(o)
} })), Ne = hn((e) => {
  const t = J("Accordion", ng, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, children: c, multiple: d, value: f, defaultValue: p, onChange: m, id: h, loop: g, transitionDuration: y, disableChevronRotation: w, disableCollapse: b, chevronPosition: k, chevronSize: C, order: j, chevron: N, variant: T, radius: S, chevronIconSize: v, attributes: R, keepMounted: D, keepMountedMode: L, ...F } = t, _ = Lt(h), [z, O] = Xe({
    value: f,
    defaultValue: p,
    finalValue: d ? [] : null,
    onChange: m
  }), M = (A) => Array.isArray(z) ? z.includes(A) : A === z, $ = (A) => {
    if (!Array.isArray(z) && b && A === z) return;
    const B = Array.isArray(z) ? z.includes(A) ? z.filter((W) => W !== A) : [...z, A] : A === z ? null : A;
    O(B);
  }, I = Me({
    name: "Accordion",
    classes: Vo,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: R,
    vars: i,
    varsResolver: gd
  });
  return /* @__PURE__ */ l.jsx(eg, {
    value: {
      isItemActive: M,
      onChange: $,
      getControlId: yr(`${_}-control`, "Accordion.Item component was rendered with invalid value or without value"),
      getRegionId: yr(`${_}-panel`, "Accordion.Item component was rendered with invalid value or without value"),
      chevron: N === null ? null : N || /* @__PURE__ */ l.jsx(Na, { size: v }),
      transitionDuration: y,
      disableChevronRotation: w,
      chevronPosition: k,
      order: j,
      loop: g,
      getStyles: I,
      variant: T,
      unstyled: a,
      keepMounted: D,
      keepMountedMode: L
    },
    children: /* @__PURE__ */ l.jsx(Q, {
      ...I("root"),
      id: _,
      ...F,
      variant: T,
      "data-accordion": !0,
      children: c
    })
  });
});
Ne.classes = Vo;
Ne.varsResolver = gd;
Ne.displayName = "@mantine/core/Accordion";
Ne.Item = Ta;
Ne.Panel = Aa;
Ne.Control = Pa;
Ne.Chevron = Na;
function vd(e) {
  return typeof e == "string" ? {
    value: e,
    label: e
  } : typeof e == "object" && "value" in e && !("label" in e) ? {
    value: e.value,
    label: `${e.value}`,
    disabled: e.disabled
  } : typeof e == "object" && "group" in e ? {
    group: e.group,
    items: e.items.map((t) => vd(t))
  } : typeof e == "number" || typeof e == "bigint" || typeof e == "boolean" ? {
    value: e,
    label: `${e}`
  } : e;
}
function yd(e) {
  return e ? e.map((t) => vd(t)) : [];
}
function bd(e) {
  return e.reduce((t, n) => "group" in n ? {
    ...t,
    ...bd(n.items)
  } : (t[`${n.value}`] = n, t), {});
}
var rt = {
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
const og = { error: null }, xd = $e((e, { size: t, color: n }) => ({ chevron: {
  "--combobox-chevron-size": De(t, "combobox-chevron-size"),
  "--combobox-chevron-color": n ? gt(n, e) : void 0
} })), Ho = ce((e) => {
  const t = J("ComboboxChevron", og, e), { size: n, error: o, style: r, className: s, classNames: a, styles: i, unstyled: c, vars: d, attributes: f, mod: p, ...m } = t, h = Me({
    name: "ComboboxChevron",
    classes: rt,
    props: t,
    style: r,
    className: s,
    classNames: a,
    styles: i,
    unstyled: c,
    vars: d,
    varsResolver: xd,
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
Ho.classes = rt;
Ho.varsResolver = xd;
Ho.displayName = "@mantine/core/ComboboxChevron";
const [rg, yt] = Zt("Combobox component was not found in tree");
function wd({ onMouseDown: e, onClick: t, onClear: n, ...o }) {
  return /* @__PURE__ */ l.jsx(wt.ClearButton, {
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
wd.displayName = "@mantine/core/ComboboxClearButton";
const Ia = ce((e) => {
  const { classNames: t, styles: n, className: o, style: r, hidden: s, ...a } = J("ComboboxDropdown", null, e), i = yt();
  return /* @__PURE__ */ l.jsx(ze.Dropdown, {
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
Ia.classes = rt;
Ia.displayName = "@mantine/core/ComboboxDropdown";
const sg = { refProp: "ref" }, Sd = ce((e) => {
  const { children: t, refProp: n, ref: o } = J("ComboboxDropdownTarget", sg, e);
  if (yt(), !el(t)) throw new Error("Combobox.DropdownTarget component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  return /* @__PURE__ */ l.jsx(ze.Target, {
    ref: o,
    refProp: n,
    children: t
  });
});
Sd.displayName = "@mantine/core/ComboboxDropdownTarget";
const Ma = ce((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = J("ComboboxEmpty", null, e), i = yt();
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
Ma.classes = rt;
Ma.displayName = "@mantine/core/ComboboxEmpty";
function Da({ onKeyDown: e, onClick: t, withKeyboardNavigation: n, withAriaAttributes: o, withExpandedAttribute: r, targetType: s, autoComplete: a }) {
  const i = yt(), [c, d] = u.useState(null), f = (h) => {
    if (e?.(h), !i.readOnly && n) {
      if (h.nativeEvent.isComposing) return;
      if (h.nativeEvent.code === "ArrowDown" && (h.preventDefault(), i.store.dropdownOpened ? d(i.store.selectNextOption()) : (i.store.openDropdown("keyboard"), d(i.store.selectActiveOption()), i.store.updateSelectedOptionIndex("selected", { scrollIntoView: !0 }))), h.nativeEvent.code === "ArrowUp" && (h.preventDefault(), i.store.dropdownOpened ? d(i.store.selectPreviousOption()) : (i.store.openDropdown("keyboard"), d(i.store.selectActiveOption()), i.store.updateSelectedOptionIndex("selected", { scrollIntoView: !0 }))), h.nativeEvent.code === "Enter" || h.nativeEvent.code === "NumpadEnter") {
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
const ag = {
  refProp: "ref",
  targetType: "input",
  withKeyboardNavigation: !0,
  withAriaAttributes: !0,
  withExpandedAttribute: !1,
  autoComplete: "off"
}, Cd = ce((e) => {
  const { children: t, refProp: n, withKeyboardNavigation: o, withAriaAttributes: r, withExpandedAttribute: s, targetType: a, autoComplete: i, ref: c, ...d } = J("ComboboxEventsTarget", ag, e), f = Fo(t);
  if (!f) throw new Error("Combobox.EventsTarget component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  const p = yt(), m = Da({
    targetType: a,
    withAriaAttributes: r,
    withKeyboardNavigation: o,
    withExpandedAttribute: s,
    onKeyDown: f.props.onKeyDown,
    onClick: f.props.onClick,
    autoComplete: i
  });
  return u.cloneElement(f, {
    ...m,
    ...d,
    [n]: _e(c, p.store.targetRef, vl(f))
  });
});
Cd.displayName = "@mantine/core/ComboboxEventsTarget";
const La = ce((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = J("ComboboxFooter", null, e), i = yt();
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
La.classes = rt;
La.displayName = "@mantine/core/ComboboxFooter";
const Oa = ce((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, children: a, label: i, id: c, ...d } = J("ComboboxGroup", null, e), f = yt(), p = Lt(c), m = i != null && i !== !1 && i !== "";
  return /* @__PURE__ */ l.jsxs(Q, {
    role: "group",
    "aria-labelledby": m ? p : void 0,
    ...f.getStyles("group", {
      className: n,
      classNames: t,
      style: o,
      styles: r
    }),
    ...d,
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
Oa.classes = rt;
Oa.displayName = "@mantine/core/ComboboxGroup";
const $a = ce((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = J("ComboboxHeader", null, e), i = yt();
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
$a.classes = rt;
$a.displayName = "@mantine/core/ComboboxHeader";
function jd({ value: e, valuesDivider: t = ",", ...n }) {
  return /* @__PURE__ */ l.jsx("input", {
    type: "hidden",
    value: Array.isArray(e) ? e.join(t) : e ? `${e}` : "",
    ...n
  });
}
jd.displayName = "@mantine/core/ComboboxHiddenInput";
const _a = ce((e) => {
  const t = J("ComboboxOption", null, e), { classNames: n, className: o, style: r, styles: s, vars: a, onClick: i, id: c, active: d, onMouseDown: f, onMouseOver: p, disabled: m, selected: h, mod: g, ...y } = t, w = yt(), b = u.useId(), k = c || b;
  return /* @__PURE__ */ l.jsx(Q, {
    ...w.getStyles("option", {
      className: o,
      classNames: n,
      styles: s,
      style: r
    }),
    ...y,
    id: k,
    mod: [
      "combobox-option",
      {
        "combobox-active": d,
        "combobox-disabled": m,
        "combobox-selected": h
      },
      g
    ],
    role: "option",
    onClick: (C) => {
      m ? C.preventDefault() : (w.onOptionSubmit?.(t.value, t), i?.(C));
    },
    onMouseDown: (C) => {
      C.preventDefault(), f?.(C);
    },
    onMouseOver: (C) => {
      w.resetSelectionOnOptionHover && w.store.resetSelectedOption(), p?.(C);
    }
  });
});
_a.classes = rt;
_a.displayName = "@mantine/core/ComboboxOption";
const za = ce((e) => {
  const { classNames: t, className: n, style: o, styles: r, id: s, onMouseDown: a, labelledBy: i, ...c } = J("ComboboxOptions", null, e), d = yt(), f = Lt(s);
  return u.useEffect(() => {
    d.store.setListId(f);
  }, [f]), /* @__PURE__ */ l.jsx(Q, {
    ...d.getStyles("options", {
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
za.classes = rt;
za.displayName = "@mantine/core/ComboboxOptions";
const ig = {
  withAriaAttributes: !0,
  withKeyboardNavigation: !0
}, Fa = ce((e) => {
  const { classNames: t, styles: n, unstyled: o, vars: r, withAriaAttributes: s, onKeyDown: a, onClick: i, withKeyboardNavigation: c, size: d, ref: f, ...p } = J("ComboboxSearch", ig, e), m = yt(), h = m.getStyles("search"), g = Da({
    targetType: "input",
    withAriaAttributes: s,
    withKeyboardNavigation: c,
    withExpandedAttribute: !1,
    onKeyDown: a,
    onClick: i,
    autoComplete: "off"
  });
  return /* @__PURE__ */ l.jsx(wt, {
    ref: _e(f, m.store.searchRef),
    classNames: [{ input: h.className }, t],
    styles: [{ input: h.style }, n],
    size: d || m.size,
    ...g,
    ...p,
    __staticSelector: "Combobox"
  });
});
Fa.classes = rt;
Fa.displayName = "@mantine/core/ComboboxSearch";
const cg = {
  refProp: "ref",
  targetType: "input",
  withKeyboardNavigation: !0,
  withAriaAttributes: !0,
  withExpandedAttribute: !1,
  autoComplete: "off"
}, kd = ce((e) => {
  const { children: t, refProp: n, withKeyboardNavigation: o, withAriaAttributes: r, withExpandedAttribute: s, targetType: a, autoComplete: i, ref: c, ...d } = J("ComboboxTarget", cg, e), f = Fo(t);
  if (!f) throw new Error("Combobox.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  const p = yt(), m = Da({
    targetType: a,
    withAriaAttributes: r,
    withKeyboardNavigation: o,
    withExpandedAttribute: s,
    onKeyDown: f.props.onKeyDown,
    onClick: f.props.onClick,
    autoComplete: i
  }), h = u.cloneElement(f, {
    ...m,
    ...d
  });
  return /* @__PURE__ */ l.jsx(ze.Target, {
    refProp: n,
    ref: _e(c, p.store.targetRef),
    children: h
  });
});
kd.displayName = "@mantine/core/ComboboxTarget";
function lg(e, t, n) {
  for (let o = e - 1; o >= 0; o -= 1) if (!t[o].hasAttribute("data-combobox-disabled")) return o;
  if (n) {
    for (let o = t.length - 1; o > -1; o -= 1) if (!t[o].hasAttribute("data-combobox-disabled")) return o;
  }
  return e;
}
function dg(e, t, n) {
  for (let o = e + 1; o < t.length; o += 1) if (!t[o].hasAttribute("data-combobox-disabled")) return o;
  if (n) {
    for (let o = 0; o < t.length; o += 1) if (!t[o].hasAttribute("data-combobox-disabled")) return o;
  }
  return e;
}
function ug(e) {
  for (let t = 0; t < e.length; t += 1) if (!e[t].hasAttribute("data-combobox-disabled")) return t;
  return -1;
}
function Ba({ defaultOpened: e, opened: t, onOpenedChange: n, onDropdownClose: o, onDropdownOpen: r, loop: s = !0, scrollBehavior: a = "instant" } = {}) {
  const [i, c] = Xe({
    value: t,
    defaultValue: e,
    finalValue: !1,
    onChange: n
  }), d = u.useRef(null), f = u.useRef(-1), p = u.useRef(null), m = u.useRef(null), h = u.useRef(-1), g = u.useRef(-1), y = u.useRef(-1), w = u.useCallback((M = "unknown") => {
    i || (c(!0), r?.(M));
  }, [
    c,
    r,
    i
  ]), b = u.useCallback((M = "unknown") => {
    i && (c(!1), o?.(M));
  }, [
    c,
    o,
    i
  ]), k = u.useCallback((M = "unknown") => {
    i ? b(M) : w(M);
  }, [
    b,
    w,
    i
  ]), C = u.useCallback(() => {
    const M = $t(m.current);
    dr(`#${d.current} [data-combobox-selected]`, M)?.removeAttribute("data-combobox-selected");
  }, []), j = u.useCallback((M) => {
    const $ = $t(m.current), I = dr(`#${d.current}`, $), A = I ? Ht("[data-combobox-option]", I) : null;
    if (!A) return null;
    const B = M >= A.length ? 0 : M < 0 ? A.length - 1 : M;
    return f.current = B, A?.[B] && !A[B].hasAttribute("data-combobox-disabled") ? (C(), A[B].setAttribute("data-combobox-selected", "true"), A[B].scrollIntoView({
      block: "nearest",
      behavior: a
    }), A[B].id) : null;
  }, [a, C]), N = u.useCallback(() => {
    const M = $t(m.current), $ = dr(`#${d.current} [data-combobox-active]`, M);
    if ($) {
      const I = Ht(`#${d.current} [data-combobox-option]`, M).findIndex((A) => A === $);
      return j(I);
    }
    return j(0);
  }, [j]), T = u.useCallback(() => {
    const M = $t(m.current), $ = Ht(`#${d.current} [data-combobox-option]`, M);
    return j(dg(f.current, $, s));
  }, [j, s]), S = u.useCallback(() => {
    const M = $t(m.current), $ = Ht(`#${d.current} [data-combobox-option]`, M);
    return j(lg(f.current, $, s));
  }, [j, s]), v = u.useCallback(() => {
    const M = $t(m.current), $ = Ht(`#${d.current} [data-combobox-option]`, M);
    return j(ug($));
  }, [j]), R = u.useCallback((M = "selected", $) => {
    if (typeof M == "number") {
      f.current = M;
      const I = $t(m.current), A = Ht(`#${d.current} [data-combobox-option]`, I);
      $?.scrollIntoView && A[M]?.scrollIntoView({
        block: "nearest",
        behavior: a
      });
      return;
    }
    y.current = window.setTimeout(() => {
      const I = $t(m.current), A = Ht(`#${d.current} [data-combobox-option]`, I), B = A.findIndex((W) => W.hasAttribute(`data-combobox-${M}`));
      f.current = B, $?.scrollIntoView && A[B]?.scrollIntoView({
        block: "nearest",
        behavior: a
      });
    }, 0);
  }, []), D = u.useCallback(() => {
    f.current = -1, C();
  }, [C]), L = u.useCallback(() => {
    const M = $t(m.current);
    Ht(`#${d.current} [data-combobox-option]`, M)?.[f.current]?.click();
  }, []), F = u.useCallback((M) => {
    d.current = M;
  }, []), _ = u.useCallback(() => {
    h.current = window.setTimeout(() => p.current?.focus(), 0);
  }, []), z = u.useCallback(() => {
    g.current = window.setTimeout(() => m.current?.focus(), 0);
  }, []), O = u.useCallback(() => f.current, []);
  return u.useEffect(() => () => {
    window.clearTimeout(h.current), window.clearTimeout(g.current), window.clearTimeout(y.current);
  }, []), {
    dropdownOpened: i,
    openDropdown: w,
    closeDropdown: b,
    toggleDropdown: k,
    selectedOptionIndex: f.current,
    getSelectedOptionIndex: O,
    selectOption: j,
    selectFirstOption: v,
    selectActiveOption: N,
    selectNextOption: T,
    selectPreviousOption: S,
    resetSelectedOption: D,
    updateSelectedOptionIndex: R,
    listId: d.current,
    setListId: F,
    clickSelectedOption: L,
    searchRef: p,
    focusSearchInput: _,
    targetRef: m,
    focusTarget: z
  };
}
const fg = {
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
}, Ed = $e((e, { size: t, dropdownPadding: n }) => ({
  options: {
    "--combobox-option-fz": vr(t),
    "--combobox-option-padding": De(t, "combobox-option-padding")
  },
  dropdown: {
    "--combobox-padding": n === void 0 ? void 0 : Ie(n),
    "--combobox-option-fz": vr(t),
    "--combobox-option-padding": De(t, "combobox-option-padding")
  }
})), we = (e) => {
  const t = J("Combobox", fg, e), { classNames: n, styles: o, unstyled: r, children: s, store: a, vars: i, onOptionSubmit: c, onClose: d, size: f, dropdownPadding: p, resetSelectionOnOptionHover: m, __staticSelector: h, readOnly: g, attributes: y, floatingHeight: w, middlewares: b, ...k } = t, C = w === "viewport" ? {
    ...b,
    flip: !1,
    size: {
      ...typeof b?.size == "object" ? b.size : {},
      padding: typeof b?.size == "object" && b.size.padding !== void 0 ? b.size.padding : 10,
      apply: ({ availableHeight: v, availableWidth: R, elements: D, ...L }) => {
        D.floating.style.setProperty("--combobox-floating-max-height", `${v}px`);
        const F = b?.size;
        typeof F == "object" && F.apply ? F.apply({
          availableHeight: v,
          availableWidth: R,
          elements: D,
          ...L
        }) : F && Object.assign(D.floating.style, {
          maxWidth: `${R}px`,
          maxHeight: `${v}px`
        });
      }
    }
  } : b, j = Ba(), N = a || j, T = Me({
    name: h || "Combobox",
    classes: rt,
    props: t,
    classNames: n,
    styles: o,
    unstyled: r,
    attributes: y,
    vars: i,
    varsResolver: Ed
  }), S = () => {
    d?.(), N.closeDropdown();
  };
  return /* @__PURE__ */ l.jsx(rg, {
    value: {
      getStyles: T,
      store: N,
      onOptionSubmit: c,
      size: f,
      resetSelectionOnOptionHover: m,
      readOnly: g,
      floatingHeight: w
    },
    children: /* @__PURE__ */ l.jsx(ze, {
      opened: N.dropdownOpened,
      ...k,
      middlewares: C,
      onChange: (v) => !v && S(),
      withRoles: !1,
      unstyled: r,
      children: s
    })
  });
}, pg = (e) => e;
we.extend = pg;
we.classes = rt;
we.varsResolver = Ed;
we.displayName = "@mantine/core/Combobox";
we.Target = kd;
we.Dropdown = Ia;
we.Options = za;
we.Option = _a;
we.Search = Fa;
we.Empty = Ma;
we.Chevron = Ho;
we.Footer = La;
we.Header = $a;
we.EventsTarget = Cd;
we.DropdownTarget = Sd;
we.Group = Oa;
we.ClearButton = wd;
we.HiddenInput = jd;
function Rd({ children: e, role: t }) {
  const n = u.use(Mf);
  return n ? /* @__PURE__ */ l.jsx("div", {
    role: t,
    "aria-labelledby": n.labelId,
    "aria-describedby": n.describedBy,
    children: e
  }) : /* @__PURE__ */ l.jsx(l.Fragment, { children: e });
}
const Va = u.createContext(null), mg = { hiddenInputValuesSeparator: "," }, Ha = hn(((e) => {
  const { value: t, defaultValue: n, onChange: o, size: r, wrapperProps: s, children: a, readOnly: i, name: c, hiddenInputValuesSeparator: d, hiddenInputProps: f, maxSelectedValues: p, disabled: m, ...h } = J("CheckboxGroup", mg, e), [g, y] = Xe({
    value: t,
    defaultValue: n,
    finalValue: [],
    onChange: o
  }), w = (C) => {
    const j = typeof C == "string" ? C : C.currentTarget.value;
    if (i) return;
    const N = g.includes(j);
    !N && p && g.length >= p || y(N ? g.filter((T) => T !== j) : [...g, j]);
  }, b = (C) => {
    if (m) return !0;
    if (!p) return !1;
    const j = g.includes(C), N = g.length >= p;
    return !j && N;
  }, k = g.join(d);
  return /* @__PURE__ */ l.jsx(Va, {
    value: {
      value: g,
      onChange: w,
      size: r,
      isDisabled: b
    },
    children: /* @__PURE__ */ l.jsxs(wt.Wrapper, {
      size: r,
      ...s,
      ...h,
      labelElement: "div",
      __staticSelector: "CheckboxGroup",
      children: [/* @__PURE__ */ l.jsx(Rd, {
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
Ha.classes = wt.Wrapper.classes;
Ha.displayName = "@mantine/core/CheckboxGroup";
var Nd = { card: "m_26775b0a" };
const Pd = u.createContext(null), hg = { withBorder: !0 }, Td = $e((e, { radius: t }) => ({ card: { "--card-radius": jt(t) } })), Ur = ce((e) => {
  const t = J("CheckboxCard", hg, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, checked: c, mod: d, withBorder: f, value: p, onClick: m, defaultChecked: h, onChange: g, indeterminate: y, attributes: w, ...b } = t, k = Me({
    name: "CheckboxCard",
    classes: Nd,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: w,
    vars: i,
    varsResolver: Td,
    rootSelector: "card"
  }), C = u.use(Va), j = typeof c == "boolean" ? c : C ? C.value.includes(p || "") : void 0, [N, T] = Xe({
    value: j,
    defaultValue: h,
    finalValue: !1,
    onChange: g
  });
  return /* @__PURE__ */ l.jsx(Pd, {
    value: {
      checked: N,
      indeterminate: y
    },
    children: /* @__PURE__ */ l.jsx(Xn, {
      mod: [{
        "with-border": f,
        checked: N,
        indeterminate: y
      }, d],
      ...k("card"),
      ...b,
      role: "checkbox",
      "aria-checked": y ? "mixed" : N,
      onClick: (S) => {
        m?.(S), C?.onChange(p || ""), T(!N);
      }
    })
  });
});
Ur.displayName = "@mantine/core/CheckboxCard";
Ur.classes = Nd;
Ur.varsResolver = Td;
function Wa({ size: e, style: t, ...n }) {
  const o = e !== void 0 ? {
    width: Ie(e),
    height: Ie(e),
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
function Ad({ indeterminate: e, ...t }) {
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
  }) : /* @__PURE__ */ l.jsx(Wa, { ...t });
}
var Id = {
  indicator: "m_5e5256ee",
  icon: "m_1b1c543a",
  "indicator--outline": "m_76e20374"
};
const gg = {
  icon: Ad,
  variant: "filled",
  radius: "sm"
}, Md = $e((e, { radius: t, color: n, size: o, iconColor: r, variant: s, autoContrast: a }) => {
  const i = Mr({
    color: n || e.primaryColor,
    theme: e
  }), c = i.isThemeColor && i.shade === void 0 ? `var(--mantine-color-${i.color}-outline)` : i.color;
  return { indicator: {
    "--checkbox-size": De(o, "checkbox-size"),
    "--checkbox-radius": t === void 0 ? void 0 : jt(t),
    "--checkbox-color": s === "outline" ? c : gt(n, e),
    "--checkbox-icon-color": r ? gt(r, e) : Bo(a, e) ? to({
      color: n,
      theme: e,
      autoContrast: a
    }) : void 0
  } };
}), qr = ce((e) => {
  const t = J("CheckboxIndicator", gg, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, icon: c, indeterminate: d, radius: f, color: p, iconColor: m, autoContrast: h, checked: g, mod: y, variant: w, disabled: b, attributes: k, ...C } = t, j = Me({
    name: "CheckboxIndicator",
    classes: Id,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: k,
    vars: i,
    varsResolver: Md,
    rootSelector: "indicator"
  }), N = u.use(Pd), T = typeof d == "boolean" ? d : N?.indeterminate, S = typeof g == "boolean" || typeof d == "boolean" ? g || d : N?.checked || N?.indeterminate || !1;
  return /* @__PURE__ */ l.jsx(Q, {
    ...j("indicator", { variant: w }),
    variant: w,
    mod: [{
      checked: S,
      disabled: b
    }, y],
    ...C,
    children: /* @__PURE__ */ l.jsx(c, {
      indeterminate: T,
      ...j("icon")
    })
  });
});
qr.displayName = "@mantine/core/CheckboxIndicator";
qr.classes = Id;
qr.varsResolver = Md;
var Dd = {
  root: "m_5f75b09e",
  body: "m_5f6e695e",
  labelWrapper: "m_d3ea56bb",
  label: "m_8ee546b8",
  description: "m_328f68c0",
  error: "m_8e8a99cc"
};
const vg = Dd;
function Ua({ __staticSelector: e, __stylesApiProps: t, className: n, classNames: o, styles: r, unstyled: s, children: a, label: i, description: c, id: d, disabled: f, error: p, size: m, labelPosition: h = "left", bodyElement: g = "div", labelElement: y = "label", variant: w, style: b, vars: k, mod: C, attributes: j, ...N }) {
  const T = Me({
    name: e,
    props: t,
    className: n,
    style: b,
    classes: Dd,
    classNames: o,
    styles: r,
    unstyled: s,
    attributes: j
  }), S = c ? `${d}-description` : void 0, v = p && typeof p != "boolean" ? `${d}-error` : void 0;
  return /* @__PURE__ */ l.jsx(Q, {
    ...T("root"),
    __vars: {
      "--label-fz": vr(m),
      "--label-lh": De(m, "label-lh")
    },
    mod: [{ "label-position": h }, C],
    variant: w,
    size: m,
    ...N,
    children: /* @__PURE__ */ l.jsxs(Q, {
      component: g,
      htmlFor: g === "label" ? d : void 0,
      ...T("body"),
      children: [a, /* @__PURE__ */ l.jsxs("div", {
        ...T("labelWrapper"),
        "data-disabled": f || void 0,
        children: [
          i && /* @__PURE__ */ l.jsx(Q, {
            component: y,
            htmlFor: y === "label" ? d : void 0,
            ...T("label"),
            "data-disabled": f || void 0,
            children: i
          }),
          c && /* @__PURE__ */ l.jsx(wt.Description, {
            id: S,
            size: m,
            __inheritStyles: !1,
            ...T("description"),
            children: c
          }),
          p && typeof p != "boolean" && /* @__PURE__ */ l.jsx(wt.Error, {
            id: v,
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
Ua.displayName = "@mantine/core/InlineInput";
var Ld = {
  root: "m_bf2d988c",
  inner: "m_26062bec",
  input: "m_26063560",
  icon: "m_bf295423",
  "input--outline": "m_215c4542"
};
const yg = {
  labelPosition: "right",
  icon: Ad,
  withErrorStyles: !0,
  variant: "filled",
  radius: "sm"
}, Od = $e((e, { radius: t, color: n, size: o, iconColor: r, variant: s, autoContrast: a }) => {
  const i = Mr({
    color: n || e.primaryColor,
    theme: e
  }), c = i.isThemeColor && i.shade === void 0 ? `var(--mantine-color-${i.color}-outline)` : i.color;
  return { root: {
    "--checkbox-size": De(o, "checkbox-size"),
    "--checkbox-radius": t === void 0 ? void 0 : jt(t),
    "--checkbox-color": s === "outline" ? c : gt(n, e),
    "--checkbox-icon-color": r ? gt(r, e) : Bo(a, e) ? to({
      color: n,
      theme: e,
      autoContrast: a
    }) : void 0
  } };
}), Yt = ce((e) => {
  const t = J("Checkbox", yg, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, color: c, label: d, id: f, size: p, radius: m, wrapperProps: h, checked: g, labelPosition: y, description: w, error: b, disabled: k, variant: C, indeterminate: j, icon: N, rootRef: T, iconColor: S, onChange: v, autoContrast: R, mod: D, attributes: L, readOnly: F, onClick: _, withErrorStyles: z, ref: O, ...M } = t, $ = u.useRef(null), I = u.use(Va), A = p || I?.size, B = Me({
    name: "Checkbox",
    props: t,
    classes: Ld,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: L,
    vars: i,
    varsResolver: Od
  }), { styleProps: W, rest: U } = Jc(M), Z = Lt(f), le = [
    w ? `${Z}-description` : void 0,
    b && typeof b != "boolean" ? `${Z}-error` : void 0,
    U["aria-describedby"]
  ].filter(Boolean).join(" ") || void 0, ue = {
    checked: I?.value.includes(U.value) ?? g,
    onChange: (pe) => {
      F || (I?.onChange(pe), v?.(pe));
    }
  }, se = I?.isDisabled?.(U.value) ?? !1, ee = k || se;
  return u.useEffect(() => {
    $.current && ($.current.indeterminate = j || !1, j ? $.current.setAttribute("data-indeterminate", "true") : $.current.removeAttribute("data-indeterminate"));
  }, [j]), /* @__PURE__ */ l.jsx(Ua, {
    ...B("root"),
    __staticSelector: "Checkbox",
    __stylesApiProps: t,
    id: Z,
    size: A,
    labelPosition: y,
    label: d,
    description: w,
    error: b,
    disabled: ee,
    classNames: n,
    styles: s,
    unstyled: a,
    "data-checked": ue.checked || g || void 0,
    variant: C,
    ref: T,
    mod: D,
    attributes: L,
    inert: U.inert,
    ...W,
    ...h,
    children: /* @__PURE__ */ l.jsxs(Q, {
      ...B("inner"),
      mod: { labelPosition: y },
      children: [/* @__PURE__ */ l.jsx(Q, {
        component: "input",
        id: Z,
        ref: _e($, O),
        mod: {
          error: !!b,
          "with-error-styles": z
        },
        ...B("input", {
          focusable: !0,
          variant: C
        }),
        ...U,
        ...ue,
        "aria-describedby": le,
        disabled: ee,
        inert: U.inert,
        type: "checkbox",
        onClick: (pe) => {
          F && ue.checked === void 0 && pe.preventDefault(), _?.(pe);
        }
      }), /* @__PURE__ */ l.jsx(N, {
        indeterminate: j,
        ...B("icon")
      })]
    })
  });
});
Yt.classes = {
  ...Ld,
  ...vg
};
Yt.varsResolver = Od;
Yt.displayName = "@mantine/core/Checkbox";
Yt.Group = Ha;
Yt.Indicator = qr;
Yt.Card = Ur;
function Eo(e) {
  return "group" in e;
}
function $d({ options: e, search: t, limit: n }) {
  const o = t.trim().toLowerCase(), r = [];
  for (let s = 0; s < e.length; s += 1) {
    const a = e[s];
    if (r.length === n) return r;
    Eo(a) && r.push({
      group: a.group,
      items: $d({
        options: a.items,
        search: t,
        limit: n - r.length
      })
    }), Eo(a) || a.label.toLowerCase().includes(o) && r.push(a);
  }
  return r;
}
function bg(e) {
  if (e.length === 0) return !0;
  for (const t of e)
    if (!("group" in t) || t.items.length > 0) return !1;
  return !0;
}
function _d(e, t = /* @__PURE__ */ new Set()) {
  if (Array.isArray(e))
    for (const n of e) if (Eo(n)) _d(n.items, t);
    else {
      if (typeof n.value > "u") throw new Error("[@mantine/core] Each option must have value property");
      if (t.has(n.value)) throw new Error(`[@mantine/core] Duplicate options are not supported. Option with value "${n.value}" was provided more than once`);
      t.add(n.value);
    }
}
function xg(e, t) {
  return Array.isArray(e) ? e.includes(t) : e === t;
}
function zd({ data: e, withCheckIcon: t, withAlignedLabels: n, value: o, checkIconPosition: r, unstyled: s, renderOption: a }) {
  if (!Eo(e)) {
    const c = xg(o, e.value), d = t && (c ? /* @__PURE__ */ l.jsx(Wa, { className: rt.optionsDropdownCheckIcon }) : n ? /* @__PURE__ */ l.jsx("div", { className: rt.optionsDropdownCheckPlaceholder }) : null), f = /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
      r === "left" && d,
      /* @__PURE__ */ l.jsx("span", { children: e.label }),
      r === "right" && d
    ] });
    return /* @__PURE__ */ l.jsx(we.Option, {
      value: e.value,
      disabled: e.disabled,
      className: Xt({ [rt.optionsDropdownOption]: !s }),
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
  const i = e.items.map((c) => /* @__PURE__ */ l.jsx(zd, {
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
function wg({ data: e, hidden: t, hiddenWhenEmpty: n, filter: o, search: r, limit: s, maxDropdownHeight: a, floatingHeight: i, withScrollArea: c = !0, filterOptions: d = !0, withCheckIcon: f = !1, withAlignedLabels: p = !1, value: m, checkIconPosition: h, nothingFoundMessage: g, unstyled: y, labelId: w, renderOption: b, scrollAreaProps: k, "aria-label": C }) {
  const j = yt();
  _d(e);
  const N = typeof r == "string" ? (o || $d)({
    options: e,
    search: d ? r : "",
    limit: s ?? 1 / 0
  }) : e, T = bg(N), S = N.map((v, R) => /* @__PURE__ */ l.jsx(zd, {
    data: v,
    withCheckIcon: f,
    withAlignedLabels: p,
    value: m,
    checkIconPosition: h,
    unstyled: y,
    renderOption: b
  }, Eo(v) ? `group-${typeof v.group == "string" ? v.group : R}` : `${v.value}`));
  return /* @__PURE__ */ l.jsx(we.Dropdown, {
    hidden: t || n && T,
    "data-composed": !0,
    children: /* @__PURE__ */ l.jsxs(we.Options, {
      labelledBy: w,
      "aria-label": C,
      children: [c ? /* @__PURE__ */ l.jsx(En.Autosize, {
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
function Sg(e) {
  const t = e.currentTarget;
  return $t(t).activeElement !== t;
}
var Fd = {
  root: "m_de3d2490",
  colorOverlay: "m_862f3d1b",
  shadowOverlay: "m_98ae7f22",
  alphaOverlay: "m_95709ac0",
  childrenOverlay: "m_93e74e3"
};
const Qi = { withShadow: !0 }, Bd = $e((e, { radius: t, size: n }) => ({ root: {
  "--cs-radius": t === void 0 ? void 0 : jt(t),
  "--cs-size": Ie(n)
} })), ao = Zc((e) => {
  const t = J("ColorSwatch", Qi, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, color: c, radius: d, withShadow: f, children: p, attributes: m, ...h } = J("ColorSwatch", Qi, t), g = Me({
    name: "ColorSwatch",
    props: t,
    classes: Fd,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: m,
    vars: i,
    varsResolver: Bd
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
ao.classes = Fd;
ao.varsResolver = Bd;
ao.displayName = "@mantine/core/ColorSwatch";
function bt(e, t = 0, n = 10 ** t) {
  return Math.round(n * e) / n;
}
function Cg({ h: e, s: t, l: n, a: o }) {
  const r = t * ((n < 50 ? n : 100 - n) / 100);
  return {
    h: e,
    s: r > 0 ? 2 * r / (n + r) * 100 : 0,
    v: n + r,
    a: o
  };
}
const jg = {
  grad: 360 / 400,
  turn: 360,
  rad: 360 / (Math.PI * 2)
};
function kg(e, t = "deg") {
  return Number(e) * (jg[t] || 1);
}
const Eg = /hsla?\(?\s*(-?\d*\.?\d+)(deg|rad|grad|turn)?[,\s]+(-?\d*\.?\d+)%?[,\s]+(-?\d*\.?\d+)%?,?\s*[/\s]*(-?\d*\.?\d+)?(%)?\s*\)?/i;
function ec(e) {
  const t = Eg.exec(e);
  return t ? Cg({
    h: kg(t[1], t[2]),
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
function Ws({ r: e, g: t, b: n, a: o }) {
  const r = Math.max(e, t, n), s = r - Math.min(e, t, n), a = s ? r === e ? (t - n) / s : r === t ? 2 + (n - e) / s : 4 + (e - t) / s : 0;
  return {
    h: bt(60 * (a < 0 ? a + 6 : a), 3),
    s: bt(r ? s / r * 100 : 0, 3),
    v: bt(r / 255 * 100, 3),
    a: o
  };
}
function Us(e) {
  const t = e[0] === "#" ? e.slice(1) : e;
  return t.length === 3 ? Ws({
    r: parseInt(t[0] + t[0], 16),
    g: parseInt(t[1] + t[1], 16),
    b: parseInt(t[2] + t[2], 16),
    a: 1
  }) : Ws({
    r: parseInt(t.slice(0, 2), 16),
    g: parseInt(t.slice(2, 4), 16),
    b: parseInt(t.slice(4, 6), 16),
    a: 1
  });
}
function Rg(e) {
  const t = e[0] === "#" ? e.slice(1) : e, n = (s) => bt(parseInt(s, 16) / 255, 3);
  if (t.length === 4) {
    const s = t.slice(0, 3), a = n(t[3] + t[3]);
    return {
      ...Us(s),
      a
    };
  }
  const o = t.slice(0, 6), r = n(t.slice(6, 8));
  return {
    ...Us(o),
    a: r
  };
}
const Ng = /rgba?\(?\s*(-?\d*\.?\d+)(%)?[,\s]+(-?\d*\.?\d+)(%)?[,\s]+(-?\d*\.?\d+)(%)?,?\s*[/\s]*(-?\d*\.?\d+)?(%)?\s*\)?/i;
function tc(e) {
  const t = Ng.exec(e);
  return t ? Ws({
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
const Vd = {
  hex: /^#?([0-9A-F]{3}){1,2}$/i,
  hexa: /^#?([0-9A-F]{4}){1,2}$/i,
  rgb: /^rgb\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/i,
  rgba: /^rgba\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/i,
  hsl: /hsl\(\s*(\d+)\s*,\s*(\d+(?:\.\d+)?%)\s*,\s*(\d+(?:\.\d+)?%)\)/i,
  hsla: /^hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*(\d*(?:\.\d+)?)\)$/i
}, Pg = {
  hex: Us,
  hexa: Rg,
  rgb: tc,
  rgba: tc,
  hsl: ec,
  hsla: ec
};
function go(e) {
  for (const [, t] of Object.entries(Vd)) if (t.test(e)) return !0;
  return !1;
}
function xn(e) {
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
  for (const [n, o] of Object.entries(Vd)) if (o.test(t)) return Pg[n](t);
  return {
    h: 0,
    s: 0,
    v: 0,
    a: 1
  };
}
const Kr = u.createContext(null);
function qa({ position: e, ...t }) {
  return /* @__PURE__ */ l.jsx(Q, {
    __vars: {
      "--thumb-y-offset": `${e.y * 100}%`,
      "--thumb-x-offset": `${e.x * 100}%`
    },
    ...t
  });
}
qa.displayName = "@mantine/core/ColorPickerThumb";
var Xr = {
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
const io = ce((e) => {
  const t = J("ColorSlider", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, onChange: c, onChangeEnd: d, maxValue: f, round: p, size: m = "md", focusable: h = !0, value: g, overlays: y, thumbColor: w = "transparent", onScrubStart: b, onScrubEnd: k, __staticSelector: C = "ColorPicker", attributes: j, ref: N, ...T } = t, S = Me({
    name: C,
    classes: Xr,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: j,
    rootSelector: "slider"
  }), v = u.use(Kr)?.getStyles || S, R = _o(), [D, L] = u.useState({
    y: 0,
    x: g / f
  }), F = u.useRef(D), _ = (I) => p ? Math.round(I * f) : I * f, { ref: z } = ml(({ x: I, y: A }) => {
    F.current = {
      x: I,
      y: A
    }, c?.(_(I));
  }, {
    onScrubEnd: () => {
      const { x: I } = F.current;
      d?.(_(I)), k?.();
    },
    onScrubStart: b
  });
  fn(() => {
    L({
      y: 0,
      x: g / f
    });
  }, [g]);
  const O = (I, A) => {
    I.preventDefault();
    const B = pl(A);
    c?.(_(B.x)), d?.(_(B.x));
  }, M = (I) => {
    switch (I.key) {
      case "ArrowRight":
        O(I, {
          x: D.x + 0.05,
          y: D.y
        });
        break;
      case "ArrowLeft":
        O(I, {
          x: D.x - 0.05,
          y: D.y
        });
    }
  }, $ = y.map((I, A) => /* @__PURE__ */ u.createElement("div", {
    ...v("sliderOverlay"),
    style: I,
    key: A
  }));
  return /* @__PURE__ */ l.jsxs(Q, {
    ...T,
    ref: _e(z, N),
    ...v("slider"),
    size: m,
    role: "slider",
    "aria-valuenow": g,
    "aria-valuemax": f,
    "aria-valuemin": 0,
    tabIndex: h ? 0 : -1,
    onKeyDown: M,
    "data-focus-ring": R.focusRing,
    __vars: { "--cp-thumb-size": `var(--cp-thumb-size-${m})` },
    children: [$, /* @__PURE__ */ l.jsx(qa, {
      position: D,
      ...v("thumb", { style: {
        top: Ie(1),
        background: w
      } })
    })]
  });
});
io.displayName = "@mantine/core/ColorSlider";
io.classes = Xr;
const Tg = { __staticSelector: "AlphaSlider" }, Ka = ce((e) => {
  const { value: t, onChange: n, onChangeEnd: o, color: r, ...s } = J("AlphaSlider", Tg, e);
  return /* @__PURE__ */ l.jsx(io, {
    ...s,
    value: t,
    onChange: (a) => n?.(bt(a, 2)),
    onChangeEnd: (a) => o?.(bt(a, 2)),
    maxValue: 1,
    round: !1,
    "data-alpha": !0,
    overlays: [
      {
        backgroundImage: "linear-gradient(45deg, var(--slider-checkers) 25%, transparent 25%), linear-gradient(-45deg, var(--slider-checkers) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--slider-checkers) 75%), linear-gradient(-45deg, var(--mantine-color-body) 75%, var(--slider-checkers) 75%)",
        backgroundSize: `${Ie(8)} ${Ie(8)}`,
        backgroundPosition: `0 0, 0 ${Ie(4)}, ${Ie(4)} ${Ie(-4)}, ${Ie(-4)} 0`
      },
      { backgroundImage: `linear-gradient(90deg, transparent, ${r})` },
      { boxShadow: `rgba(0, 0, 0, .1) 0 0 0 ${Ie(1)} inset, rgb(0, 0, 0, .15) 0 0 ${Ie(4)} inset` }
    ]
  });
});
Ka.displayName = "@mantine/core/AlphaSlider";
Ka.classes = io.classes;
function Hd({ h: e, s: t, v: n, a: o }) {
  const r = e / 360 * 6, s = t / 100, a = n / 100, i = Math.floor(r), c = a * (1 - s), d = a * (1 - (r - i) * s), f = a * (1 - (1 - r + i) * s), p = i % 6;
  return {
    r: bt([
      a,
      d,
      c,
      c,
      f,
      a
    ][p] * 255),
    g: bt([
      f,
      a,
      a,
      d,
      c,
      c
    ][p] * 255),
    b: bt([
      c,
      c,
      f,
      a,
      a,
      d
    ][p] * 255),
    a: bt(o, 2)
  };
}
function nc(e, t) {
  const { r: n, g: o, b: r, a: s } = Hd(e);
  return t ? `rgba(${n}, ${o}, ${r}, ${bt(s, 2)})` : `rgb(${n}, ${o}, ${r})`;
}
function oc({ h: e, s: t, v: n, a: o }, r) {
  const s = (200 - t) * n / 100, a = {
    h: Math.round(e),
    s: Math.round(s > 0 && s < 200 ? t * n / 100 / (s <= 100 ? s : 200 - s) * 100 : 0),
    l: Math.round(s / 2)
  };
  return r ? `hsla(${a.h}, ${a.s}%, ${a.l}%, ${bt(o, 2)})` : `hsl(${a.h}, ${a.s}%, ${a.l}%)`;
}
function mr(e) {
  const t = e.toString(16);
  return t.length < 2 ? `0${t}` : t;
}
function Wd(e) {
  const { r: t, g: n, b: o } = Hd(e);
  return `#${mr(t)}${mr(n)}${mr(o)}`;
}
function Ag(e) {
  const t = Math.round(e.a * 255);
  return `${Wd(e)}${mr(t)}`;
}
const Cs = {
  hex: Wd,
  hexa: (e) => Ag(e),
  rgb: (e) => nc(e, !1),
  rgba: (e) => nc(e, !0),
  hsl: (e) => oc(e, !1),
  hsla: (e) => oc(e, !0)
};
function Nt(e, t) {
  return t ? e in Cs ? Cs[e](t) : Cs.hex(t) : "#000000";
}
const Ig = { __staticSelector: "HueSlider" }, Xa = ce((e) => {
  const { value: t, onChange: n, onChangeEnd: o, color: r, ...s } = J("HueSlider", Ig, e);
  return /* @__PURE__ */ l.jsx(io, {
    ...s,
    value: t,
    onChange: n,
    onChangeEnd: o,
    maxValue: 360,
    thumbColor: `hsl(${t}, 100%, 50%)`,
    round: !0,
    "data-hue": !0,
    overlays: [{ backgroundImage: "linear-gradient(to right,hsl(0,100%,50%),hsl(60,100%,50%),hsl(120,100%,50%),hsl(170,100%,50%),hsl(240,100%,50%),hsl(300,100%,50%),hsl(360,100%,50%))" }, { boxShadow: `rgba(0, 0, 0, .1) 0 0 0 ${Ie(1)} inset, rgb(0, 0, 0, .15) 0 0 ${Ie(4)} inset` }]
  });
});
Xa.displayName = "@mantine/core/HueSlider";
Xa.classes = io.classes;
function Ud({ className: e, onChange: t, onChangeEnd: n, value: o, saturationLabel: r, focusable: s = !0, size: a, color: i, onScrubStart: c, onScrubEnd: d, ...f }) {
  const { getStyles: p } = u.use(Kr), [m, h] = u.useState({
    x: o.s / 100,
    y: 1 - o.v / 100
  }), g = u.useRef(m), { ref: y } = ml(({ x: k, y: C }) => {
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
      }), d?.();
    },
    onScrubStart: c
  });
  u.useEffect(() => {
    h({
      x: o.s / 100,
      y: 1 - o.v / 100
    });
  }, [o.s, o.v]);
  const w = (k, C) => {
    k.preventDefault();
    const j = pl(C);
    t({
      s: Math.round(j.x * 100),
      v: Math.round((1 - j.y) * 100)
    }), n({
      s: Math.round(j.x * 100),
      v: Math.round((1 - j.y) * 100)
    });
  }, b = (k) => {
    switch (k.key) {
      case "ArrowUp":
        w(k, {
          y: m.y - 0.05,
          x: m.x
        });
        break;
      case "ArrowDown":
        w(k, {
          y: m.y + 0.05,
          x: m.x
        });
        break;
      case "ArrowRight":
        w(k, {
          x: m.x + 0.05,
          y: m.y
        });
        break;
      case "ArrowLeft":
        w(k, {
          x: m.x - 0.05,
          y: m.y
        });
    }
  };
  return /* @__PURE__ */ l.jsxs(Q, {
    ...p("saturation"),
    ref: y,
    ...f,
    role: "slider",
    "aria-label": r,
    "aria-valuenow": m.x,
    "aria-valuetext": Nt("rgba", o),
    tabIndex: s ? 0 : -1,
    onKeyDown: b,
    children: [
      /* @__PURE__ */ l.jsx("div", { ...p("saturationOverlay", { style: { backgroundColor: `hsl(${o.h}, 100%, 50%)` } }) }),
      /* @__PURE__ */ l.jsx("div", { ...p("saturationOverlay", { style: { backgroundImage: "linear-gradient(90deg, #fff, transparent)" } }) }),
      /* @__PURE__ */ l.jsx("div", { ...p("saturationOverlay", { style: { backgroundImage: "linear-gradient(0deg, #000, transparent)" } }) }),
      /* @__PURE__ */ l.jsx(qa, {
        position: m,
        ...p("thumb", { style: { backgroundColor: i } })
      })
    ]
  });
}
Ud.displayName = "@mantine/core/Saturation";
function qd({ className: e, datatype: t, setValue: n, onChangeEnd: o, size: r, focusable: s, data: a, swatchesPerRow: i, value: c, ...d }) {
  const f = u.use(Kr), p = a.map((m, h) => /* @__PURE__ */ u.createElement(ao, {
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
  }, c === m && /* @__PURE__ */ l.jsx(Wa, {
    size: "35%",
    color: Sf(m) < 0.5 ? "white" : "black"
  })));
  return /* @__PURE__ */ l.jsx(Q, {
    ...f.getStyles("swatches"),
    ...d,
    children: p
  });
}
qd.displayName = "@mantine/core/Swatches";
const Mg = {
  swatchesPerRow: 7,
  withPicker: !0,
  focusable: !0,
  size: "md",
  __staticSelector: "ColorPicker"
}, Kd = $e((e, { size: t, swatchesPerRow: n }) => ({ wrapper: {
  "--cp-preview-size": De(t, "cp-preview-size"),
  "--cp-width": De(t, "cp-width"),
  "--cp-body-spacing": ca(t),
  "--cp-swatch-size": `${100 / n}%`,
  "--cp-thumb-size": De(t, "cp-thumb-size"),
  "--cp-saturation-height": De(t, "cp-saturation-height")
} })), Yr = ce((e) => {
  const t = J("ColorPicker", Mg, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, format: c = "hex", value: d, defaultValue: f, onChange: p, onChangeEnd: m, withPicker: h, size: g, saturationLabel: y, hueLabel: w, alphaLabel: b, focusable: k, swatches: C, swatchesPerRow: j, fullWidth: N, onColorSwatchClick: T, __staticSelector: S, mod: v, attributes: R, name: D, hiddenInputProps: L, ...F } = t, _ = Me({
    name: S,
    props: t,
    classes: Xr,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: R,
    rootSelector: "wrapper",
    vars: i,
    varsResolver: Kd
  }), z = u.useRef(c || "hex"), O = u.useRef(""), M = u.useRef(-1), $ = u.useRef(!1), I = c === "hexa" || c === "rgba" || c === "hsla", [A, B, W] = Xe({
    value: d,
    defaultValue: f,
    finalValue: "#FFFFFF",
    onChange: p
  }), [U, Z] = u.useState(xn(A)), le = () => {
    window.clearTimeout(M.current), $.current = !0;
  }, ue = () => {
    window.clearTimeout(M.current), M.current = window.setTimeout(() => {
      $.current = !1;
    }, 200);
  }, se = (ee) => {
    Z((pe) => {
      const q = {
        ...pe,
        ...ee
      };
      return O.current = Nt(z.current, q), q;
    }), B(O.current);
  };
  return fn(() => {
    typeof d == "string" && go(d) && !$.current && Z(xn(d));
  }, [d]), fn(() => {
    z.current = c || "hex", B(Nt(z.current, U));
  }, [c]), /* @__PURE__ */ l.jsx(Kr, {
    value: {
      getStyles: _,
      unstyled: a
    },
    children: /* @__PURE__ */ l.jsxs(Q, {
      ..._("wrapper"),
      size: g,
      mod: [{ "full-width": N }, v],
      ...F,
      children: [
        D && /* @__PURE__ */ l.jsx("input", {
          type: "hidden",
          name: D,
          value: A,
          ...L
        }),
        h && /* @__PURE__ */ l.jsxs(l.Fragment, { children: [/* @__PURE__ */ l.jsx(Ud, {
          value: U,
          onChange: se,
          onChangeEnd: ({ s: ee, v: pe }) => m?.(Nt(z.current, {
            ...U,
            s: ee,
            v: pe
          })),
          color: A,
          size: g,
          focusable: k,
          saturationLabel: y,
          onScrubStart: le,
          onScrubEnd: ue
        }), /* @__PURE__ */ l.jsxs("div", {
          ..._("body"),
          children: [/* @__PURE__ */ l.jsxs("div", {
            ..._("sliders"),
            children: [/* @__PURE__ */ l.jsx(Xa, {
              value: U.h,
              onChange: (ee) => se({ h: ee }),
              onChangeEnd: (ee) => m?.(Nt(z.current, {
                ...U,
                h: ee
              })),
              size: g,
              focusable: k,
              "aria-label": w,
              onScrubStart: le,
              onScrubEnd: ue
            }), I && /* @__PURE__ */ l.jsx(Ka, {
              value: U.a,
              onChange: (ee) => se({ a: ee }),
              onChangeEnd: (ee) => {
                m?.(Nt(z.current, {
                  ...U,
                  a: ee
                }));
              },
              size: g,
              color: Nt("hex", U),
              focusable: k,
              "aria-label": b,
              onScrubStart: le,
              onScrubEnd: ue
            })]
          }), I && /* @__PURE__ */ l.jsx(ao, {
            color: A,
            radius: "sm",
            size: "var(--cp-preview-size)",
            ..._("preview")
          })]
        })] }),
        Array.isArray(C) && /* @__PURE__ */ l.jsx(qd, {
          data: C,
          swatchesPerRow: j,
          focusable: k,
          setValue: B,
          value: A,
          onChangeEnd: (ee) => {
            const pe = Nt(c, xn(ee));
            T?.(pe), m?.(pe), W || Z(xn(ee));
          }
        })
      ]
    })
  });
});
Yr.classes = Xr;
Yr.varsResolver = Kd;
Yr.displayName = "@mantine/core/ColorPicker";
function Dg({ style: e, ...t }) {
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
var rc = {
  eyeDropperIcon: "m_b077c2bc",
  eyeDropperButton: "m_66a028b5",
  colorPreview: "m_c5ccdcab",
  dropdown: "m_5ece2cd7"
};
const sc = {
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
}, Xd = $e((e, { size: t }) => ({
  eyeDropperIcon: { "--ci-eye-dropper-icon-size": De(t, "ci-eye-dropper-icon-size") },
  eyeDropperButton: { "--ci-button-size": De(t, "ci-button-size") },
  colorPreview: { "--ci-preview-size": De(t, "ci-preview-size") }
})), Wo = ce((e) => {
  const t = J([
    "Input",
    "InputWrapper",
    "ColorInput"
  ], sc, e), { classNames: n, styles: o, unstyled: r, disallowInput: s, fixOnBlur: a, popoverProps: i, withPreview: c, withEyeDropper: d, eyeDropperIcon: f, closeOnColorSwatchClick: p, eyeDropperButtonProps: m, value: h, defaultValue: g, onChange: y, onChangeEnd: w, onClick: b, onFocus: k, onBlur: C, inputProps: j, format: N = "hex", wrapperProps: T, readOnly: S, withPicker: v, swatches: R, disabled: D, leftSection: L, rightSection: F, swatchesPerRow: _, fullWidth: z, ...O } = Df("ColorInput", sc, e), M = Me({
    name: "ColorInput",
    props: t,
    classes: rc,
    classNames: n,
    styles: o,
    unstyled: r,
    rootSelector: "wrapper",
    vars: t.vars,
    varsResolver: Xd
  }), { resolvedClassNames: $, resolvedStyles: I } = zo({
    classNames: n,
    styles: o,
    props: t
  }), [A, B] = u.useState(!1), [W, U] = u.useState(""), [Z, le] = Xe({
    value: h,
    defaultValue: g,
    finalValue: "",
    onChange: y
  }), { supported: ue, open: se } = ep(), ee = /* @__PURE__ */ l.jsx(xo, {
    ...m,
    ...M("eyeDropperButton", {
      className: m?.className,
      style: m?.style
    }),
    variant: "subtle",
    color: "gray",
    unstyled: r,
    onClick: () => se().then((ae) => {
      if (ae?.sRGBHex) {
        const be = Nt(N, xn(ae.sRGBHex));
        le(be), w?.(be);
      }
    }).catch(() => {
    }),
    children: f || /* @__PURE__ */ l.jsx(Dg, { ...M("eyeDropperIcon") })
  }), pe = (ae) => {
    k?.(ae), B(!0);
  }, q = (ae) => {
    a && le(W), C?.(ae), B(!1);
  }, K = (ae) => {
    b?.(ae), B(!0);
  };
  return u.useEffect(() => {
    (go(Z) || Z.trim() === "") && U(Z);
  }, [Z]), fn(() => {
    go(Z) && le(Nt(N, xn(Z)));
  }, [N]), /* @__PURE__ */ l.jsx(wt.Wrapper, {
    ...T,
    classNames: $,
    styles: I,
    __staticSelector: "ColorInput",
    children: /* @__PURE__ */ l.jsxs(ze, {
      __staticSelector: "ColorInput",
      position: "bottom-start",
      offset: 5,
      opened: A,
      width: z ? "target" : void 0,
      ...i,
      classNames: $,
      styles: I,
      unstyled: r,
      withRoles: !1,
      disabled: S || v === !1 && (!Array.isArray(R) || R.length === 0),
      children: [/* @__PURE__ */ l.jsx(ze.Target, { children: /* @__PURE__ */ l.jsx(wt, {
        autoComplete: "off",
        ...O,
        ...j,
        classNames: $,
        styles: I,
        disabled: D,
        __staticSelector: "ColorInput",
        onFocus: pe,
        onBlur: q,
        onClick: K,
        spellCheck: !1,
        value: Z,
        onChange: (ae) => {
          const be = ae.currentTarget.value;
          le(be), go(be) && w?.(Nt(N, xn(be)));
        },
        leftSection: L || (c ? /* @__PURE__ */ l.jsx(ao, {
          color: go(Z) ? Z : "#fff",
          size: "var(--ci-preview-size)",
          ...M("colorPreview")
        }) : null),
        readOnly: s || S,
        pointer: s,
        unstyled: r,
        rightSection: F || (d && !D && !S && ue ? ee : null)
      }) }), /* @__PURE__ */ l.jsx(ze.Dropdown, {
        onMouseDown: (ae) => ae.preventDefault(),
        className: rc.dropdown,
        children: /* @__PURE__ */ l.jsx(Yr, {
          __staticSelector: "ColorInput",
          value: Z,
          onChange: le,
          onChangeEnd: w,
          format: N,
          swatches: R,
          swatchesPerRow: _,
          withPicker: v,
          size: j.size,
          focusable: !1,
          unstyled: r,
          styles: I,
          classNames: $,
          onColorSwatchClick: () => p && B(!1),
          attributes: T.attributes,
          fullWidth: z
        })
      })]
    })
  });
});
Wo.classes = vt.classes;
Wo.varsResolver = Xd;
Wo.displayName = "@mantine/core/ColorInput";
var Yd = {
  root: "m_3eebeb36",
  label: "m_9e365f20"
};
const Lg = { orientation: "horizontal" }, Gd = $e((e, { color: t, variant: n, size: o }) => ({ root: {
  "--divider-color": t ? gt(t, e) : void 0,
  "--divider-border-style": n,
  "--divider-size": De(o, "divider-size")
} })), Gr = ce((e) => {
  const t = J("Divider", Lg, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, color: c, orientation: d, label: f, labelPosition: p, mod: m, attributes: h, ...g } = t, y = Me({
    name: "Divider",
    classes: Yd,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: h,
    vars: i,
    varsResolver: Gd
  });
  return /* @__PURE__ */ l.jsx(Q, {
    mod: [{
      orientation: d,
      withLabel: !!f
    }, m],
    role: "separator",
    ...y("root"),
    ...g,
    children: f && /* @__PURE__ */ l.jsx(Q, {
      component: "span",
      mod: { position: p },
      ...y("label"),
      children: f
    })
  });
});
Gr.classes = Yd;
Gr.varsResolver = Gd;
Gr.displayName = "@mantine/core/Divider";
const Zd = hn((e) => {
  const { onChange: t, children: n, multiple: o, accept: r, name: s, form: a, resetRef: i, disabled: c, capture: d, inputProps: f, ref: p, ...m } = J("FileButton", null, e), h = u.useRef(null), g = () => {
    !c && h.current?.click();
  }, y = (b) => {
    if (b.currentTarget.files === null) return t(o ? [] : null);
    t(o ? Array.from(b.currentTarget.files) : b.currentTarget.files[0] || null);
  };
  return nl(i, () => {
    h.current && (h.current.value = "");
  }), /* @__PURE__ */ l.jsxs(l.Fragment, { children: [/* @__PURE__ */ l.jsx("input", {
    style: { display: "none" },
    type: "file",
    accept: r,
    multiple: o,
    onChange: y,
    ref: _e(p, h),
    name: s,
    form: a,
    capture: d,
    ...f
  }), n({
    onClick: g,
    ...m
  })] });
});
Zd.displayName = "@mantine/core/FileButton";
const Og = ({ value: e }) => /* @__PURE__ */ l.jsx("div", {
  style: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  children: Array.isArray(e) ? e.map((t) => t.name).join(", ") : e?.name
}), $g = {
  valueComponent: Og,
  size: "sm"
}, Ya = hn((e) => {
  const t = J([
    "Input",
    "InputWrapper",
    "FileInput"
  ], $g, e), { unstyled: n, vars: o, onChange: r, value: s, defaultValue: a, multiple: i, accept: c, name: d, form: f, valueComponent: p, clearable: m, clearSectionMode: h, clearButtonProps: g, readOnly: y, capture: w, fileInputProps: b, rightSection: k, size: C, placeholder: j, component: N, resetRef: T, classNames: S, styles: v, attributes: R, ...D } = t, L = u.useRef(null), { resolvedClassNames: F, resolvedStyles: _ } = zo({
    classNames: S,
    styles: v,
    props: t
  }), [z, O] = Xe({
    value: s,
    defaultValue: a,
    onChange: r,
    finalValue: i ? [] : null
  }), M = Array.isArray(z) ? z.length !== 0 : z !== null, $ = /* @__PURE__ */ l.jsx(al, {
    ...g,
    variant: "subtle",
    onClick: () => O(i ? [] : null),
    size: C,
    unstyled: n
  }), I = m && M && !y;
  return u.useEffect(() => {
    (Array.isArray(z) && z.length === 0 || z === null) && L.current?.();
  }, [z]), /* @__PURE__ */ l.jsx(Zd, {
    onChange: O,
    multiple: i,
    accept: c,
    name: d,
    form: f,
    resetRef: _e(L, T),
    disabled: y,
    capture: w,
    inputProps: b,
    children: (A) => /* @__PURE__ */ l.jsx(vt, {
      component: N || "button",
      rightSection: k,
      __clearSection: $,
      __clearable: I,
      __clearSectionMode: h,
      ...A,
      ...D,
      __staticSelector: "FileInput",
      multiline: !0,
      type: "button",
      pointer: !0,
      __stylesApiProps: t,
      unstyled: n,
      size: C,
      classNames: S,
      styles: v,
      attributes: R,
      children: M ? /* @__PURE__ */ l.jsx(p, { value: z }) : /* @__PURE__ */ l.jsx(wt.Placeholder, {
        __staticSelector: "FileInput",
        classNames: F,
        styles: _,
        attributes: R,
        children: j
      })
    })
  });
});
Ya.classes = vt.classes;
Ya.displayName = "@mantine/core/FileInput";
const _g = [
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
], ac = {
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
function ic(e) {
  Object.keys(ac).forEach((t) => {
    e.style.setProperty(t, ac[t], "important");
  });
}
function zg(e) {
  const t = window.getComputedStyle(e);
  if (t === null) return null;
  const n = {};
  for (const o of _g) n[o] = t[o];
  return n.boxSizing === "" ? null : {
    sizingStyle: n,
    paddingSize: parseFloat(n.paddingBottom) + parseFloat(n.paddingTop),
    borderSize: parseFloat(n.borderBottomWidth) + parseFloat(n.borderTopWidth)
  };
}
let We = null;
function Fg(e, t, n = 1, o = 1 / 0) {
  We || (We = document.createElement("textarea"), We.setAttribute("tabindex", "-1"), We.setAttribute("aria-hidden", "true"), We.setAttribute("aria-label", "autosize measurement"), ic(We)), We.parentNode === null && document.body.appendChild(We);
  const { paddingSize: r, borderSize: s, sizingStyle: a } = e, { boxSizing: i } = a;
  Object.keys(a).forEach((m) => {
    We.style[m] = a[m];
  }), ic(We), We.value = t;
  let c = i === "border-box" ? We.scrollHeight + s : We.scrollHeight - r;
  We.value = t, c = i === "border-box" ? We.scrollHeight + s : We.scrollHeight - r, We.value = "x";
  const d = We.scrollHeight - r;
  let f = d * n;
  i === "border-box" && (f = f + r + s), c = Math.max(f, c);
  let p = d * o;
  return i === "border-box" && (p = p + r + s), c = Math.min(p, c), [c, d];
}
function Bg({ maxRows: e, minRows: t, onChange: n, ref: o, ...r }) {
  const s = r.value !== void 0, a = u.useRef(null), i = _e(a, o), c = u.useRef(0), d = u.useRef(0), f = () => {
    const h = a.current;
    if (!h) return;
    const g = zg(h);
    if (!g) return;
    const [y] = Fg(g, h.value || h.placeholder || "x", t, e);
    c.current !== y && (c.current = y, h.style.setProperty("height", `${y}px`, "important"));
  }, p = u.useEffectEvent(f), m = (h) => {
    s || f(), n?.(h);
  };
  return u.useLayoutEffect(f), u.useEffect(() => {
    const h = () => f();
    return window.addEventListener("resize", h), () => window.removeEventListener("resize", h);
  }, []), u.useEffect(() => {
    const h = a.current;
    if (!h || typeof ResizeObserver > "u") return;
    d.current = h.offsetWidth;
    let g = 0;
    const y = new ResizeObserver(() => {
      a.current && a.current.offsetWidth !== d.current && (d.current = a.current.offsetWidth, cancelAnimationFrame(g), g = requestAnimationFrame(p));
    });
    return y.observe(h), () => {
      cancelAnimationFrame(g), y.disconnect();
    };
  }, []), u.useEffect(() => {
    const h = () => f();
    return document.fonts.addEventListener("loadingdone", h), () => document.fonts.removeEventListener("loadingdone", h);
  }, []), u.useEffect(() => {
    const h = (g) => {
      if (a.current?.form === g.target && !s) {
        const y = a.current.value;
        requestAnimationFrame(() => {
          a.current && y !== a.current.value && f();
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
const Zr = ce((e) => {
  const { autosize: t, maxRows: n, minRows: o, __staticSelector: r, resize: s, bottomSection: a, bottomSectionProps: i, ...c } = J([
    "Input",
    "InputWrapper",
    "Textarea"
  ], null, e), d = t && hl() !== "test", f = d ? {
    maxRows: n,
    minRows: o
  } : {};
  return /* @__PURE__ */ l.jsx(vt, {
    component: d ? Bg : "textarea",
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
Zr.classes = vt.classes;
Zr.displayName = "@mantine/core/Textarea";
function Jd({ size: e, style: t, ...n }) {
  return /* @__PURE__ */ l.jsx("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 5 5",
    style: {
      width: Ie(e),
      height: Ie(e),
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
const [Vg, co] = Zt("Modal component was not found in tree");
var en = {
  root: "m_9df02822",
  content: "m_54c44539",
  inner: "m_1f958f16",
  header: "m_d0e2b9cd"
};
const Jr = ce((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = J("ModalBody", null, e), i = co();
  return /* @__PURE__ */ l.jsx(ad, {
    ...i.getStyles("body", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
Jr.classes = en;
Jr.displayName = "@mantine/core/ModalBody";
const Qr = ce((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = J("ModalCloseButton", null, e), i = co();
  return /* @__PURE__ */ l.jsx(id, {
    ...i.getStyles("close", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
Qr.classes = en;
Qr.displayName = "@mantine/core/ModalCloseButton";
const es = ce((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, children: a, __hidden: i, ...c } = J("ModalContent", null, e), d = co(), f = d.scrollAreaComponent || Gh;
  return /* @__PURE__ */ l.jsx(cd, {
    ...d.getStyles("content", {
      className: n,
      style: o,
      styles: r,
      classNames: t
    }),
    innerProps: d.getStyles("inner", {
      className: n,
      style: o,
      styles: r,
      classNames: t
    }),
    "data-full-screen": d.fullScreen || void 0,
    "data-modal-content": !0,
    "data-hidden": i || void 0,
    ...c,
    children: /* @__PURE__ */ l.jsx(f, {
      style: { maxHeight: d.fullScreen ? "100dvh" : `calc(100dvh - (${Ie(d.yOffset)} * 2))` },
      children: a
    })
  });
});
es.classes = en;
es.displayName = "@mantine/core/ModalContent";
const ts = ce((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = J("ModalHeader", null, e), i = co();
  return /* @__PURE__ */ l.jsx(ld, {
    ...i.getStyles("header", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
ts.classes = en;
ts.displayName = "@mantine/core/ModalHeader";
const ns = ce((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = J("ModalOverlay", null, e), i = co();
  return /* @__PURE__ */ l.jsx(dd, {
    ...i.getStyles("overlay", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
ns.classes = en;
ns.displayName = "@mantine/core/ModalOverlay";
const Hg = {
  __staticSelector: "Modal",
  closeOnClickOutside: !0,
  withinPortal: !0,
  lockScroll: !0,
  trapFocus: !0,
  returnFocus: !0,
  closeOnEscape: !0,
  keepMounted: !1,
  zIndex: no("modal"),
  transitionProps: {
    duration: 200,
    transition: "fade-down"
  },
  yOffset: "5dvh"
}, Qd = $e((e, { radius: t, size: n, yOffset: o, xOffset: r }) => ({ root: {
  "--modal-radius": t === void 0 ? void 0 : jt(t),
  "--modal-size": De(n, "modal-size"),
  "--modal-y-offset": Ie(o),
  "--modal-x-offset": Ie(r)
} })), Uo = ce((e) => {
  const t = J("ModalRoot", Hg, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, yOffset: c, scrollAreaComponent: d, radius: f, fullScreen: p, centered: m, xOffset: h, __staticSelector: g, attributes: y, ...w } = t, b = Me({
    name: g,
    classes: en,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: y,
    vars: i,
    varsResolver: Qd
  });
  return /* @__PURE__ */ l.jsx(Vg, {
    value: {
      yOffset: c,
      scrollAreaComponent: d,
      getStyles: b,
      fullScreen: p
    },
    children: /* @__PURE__ */ l.jsx(sd, {
      ...b("root"),
      "data-full-screen": p || void 0,
      "data-centered": m || void 0,
      "data-offset-scrollbars": d === En.Autosize || void 0,
      unstyled: a,
      ...w
    })
  });
});
Uo.classes = en;
Uo.varsResolver = Qd;
Uo.displayName = "@mantine/core/ModalRoot";
const eu = u.createContext(null);
function tu({ children: e }) {
  const [t, n] = u.useState([]), [o, r] = u.useState(no("modal")), [s] = u.useState(() => /* @__PURE__ */ new WeakSet());
  return /* @__PURE__ */ l.jsx(eu, {
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
tu.displayName = "@mantine/core/ModalStack";
const os = ce((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = J("ModalTitle", null, e), i = co();
  return /* @__PURE__ */ l.jsx(ud, {
    ...i.getStyles("title", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
os.classes = en;
os.displayName = "@mantine/core/ModalTitle";
const Wg = {
  closeOnClickOutside: !0,
  withinPortal: !0,
  lockScroll: !0,
  trapFocus: !0,
  returnFocus: !0,
  closeOnEscape: !0,
  keepMounted: !1,
  zIndex: no("modal"),
  transitionProps: {
    duration: 200,
    transition: "fade-down"
  },
  withOverlay: !0,
  withCloseButton: !0
}, st = ce((e) => {
  const { title: t, withOverlay: n, overlayProps: o, withCloseButton: r, closeButtonProps: s, children: a, radius: i, opened: c, stackId: d, zIndex: f, ...p } = J("Modal", Wg, e), m = u.use(eu), h = !!t || r, g = m && d ? {
    closeOnEscape: m.currentId === d,
    trapFocus: m.currentId === d,
    zIndex: m.getZIndex(d),
    __handledEscapeEvents: m.handledEscapeEvents
  } : {}, y = n === !1 ? !1 : d && m ? m.currentId === d : c;
  return u.useEffect(() => {
    m && d && (c ? m.addModal(d, f || no("modal")) : m.removeModal(d));
  }, [
    c,
    d,
    f
  ]), /* @__PURE__ */ l.jsxs(Uo, {
    radius: i,
    opened: c,
    zIndex: m && d ? m.getZIndex(d) : f,
    ...p,
    ...g,
    children: [n && /* @__PURE__ */ l.jsx(ns, {
      visible: y,
      transitionProps: m && d ? { duration: 0 } : void 0,
      ...o
    }), /* @__PURE__ */ l.jsxs(es, {
      radius: i,
      __hidden: m && d && c ? d !== m.currentId : !1,
      children: [h && /* @__PURE__ */ l.jsxs(ts, { children: [t && /* @__PURE__ */ l.jsx(os, { children: t }), r && /* @__PURE__ */ l.jsx(Qr, { ...s })] }), /* @__PURE__ */ l.jsx(Jr, { children: a })]
    })]
  });
});
st.classes = en;
st.displayName = "@mantine/core/Modal";
st.Root = Uo;
st.Overlay = ns;
st.Content = es;
st.Body = Jr;
st.Header = ts;
st.Title = os;
st.CloseButton = Qr;
st.Stack = tu;
function Ug(e, t) {
  const n = t.trim().toLowerCase();
  if (n === "") return;
  const o = Object.values(e).filter((r) => !r.disabled && r.label.trim().toLowerCase() === n);
  return o.length === 1 ? o[0] : void 0;
}
function qg(e) {
  return "group" in e;
}
function Ga({ data: e }) {
  if (qg(e)) {
    const r = e.items.map((s) => /* @__PURE__ */ l.jsx(Ga, { data: s }, s.value));
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
Ga.displayName = "@mantine/core/NativeSelectOption";
const Kg = {
  size: "sm",
  rightSectionPointerEvents: "none"
}, Gn = ce((e) => {
  const { data: t, children: n, size: o, error: r, rightSection: s, unstyled: a, ...i } = J([
    "Input",
    "InputWrapper",
    "NativeSelect"
  ], Kg, e), c = yd(t).map((d, f) => /* @__PURE__ */ l.jsx(Ga, { data: d }, f));
  return /* @__PURE__ */ l.jsx(vt, {
    component: "select",
    ...i,
    __staticSelector: "NativeSelect",
    size: o,
    pointer: !0,
    error: r,
    unstyled: a,
    rightSection: s || /* @__PURE__ */ l.jsx(Ho, {
      size: o,
      error: r,
      unstyled: a
    }),
    children: n || c
  });
});
Gn.classes = vt.classes;
Gn.displayName = "@mantine/core/NativeSelect";
function nu(e, t) {
  var n = {};
  for (var o in e)
    Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var r = 0, o = Object.getOwnPropertySymbols(e); r < o.length; r++)
      t.indexOf(o[r]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[r]) && (n[o[r]] = e[o[r]]);
  return n;
}
var Zn;
(function(e) {
  e.event = "event", e.props = "prop";
})(Zn || (Zn = {}));
function sn() {
}
function Xg(e) {
  var t, n = void 0;
  return function() {
    for (var o = [], r = arguments.length; r--; ) o[r] = arguments[r];
    return t && o.length === t.length && o.every(function(s, a) {
      return s === t[a];
    }) || (t = o, n = e.apply(void 0, o)), n;
  };
}
function Ro(e) {
  return !!(e || "").match(/\d/);
}
function cn(e) {
  return e == null;
}
function Yg(e) {
  return typeof e == "number" && isNaN(e);
}
function ou(e) {
  return cn(e) || Yg(e) || typeof e == "number" && !isFinite(e);
}
function ru(e) {
  return e.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
}
function Gg(e) {
  switch (e) {
    case "lakh":
      return /(\d+?)(?=(\d\d)+(\d)(?!\d))(\.\d+)?/g;
    case "wan":
      return /(\d)(?=(\d{4})+(?!\d))/g;
    default:
      return /(\d)(?=(\d{3})+(?!\d))/g;
  }
}
function Zg(e, t, n) {
  var o = Gg(n), r = e.search(/[1-9]/);
  return r = r === -1 ? e.length : r, e.substring(0, r) + e.substring(r, e.length).replace(o, "$1" + t);
}
function cc(e) {
  var t = u.useRef(e);
  t.current = e;
  var n = u.useRef(function() {
    for (var o = [], r = arguments.length; r--; ) o[r] = arguments[r];
    return t.current.apply(t, o);
  });
  return n.current;
}
function Za(e, t) {
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
function Jg(e) {
  if (!e)
    return e;
  var t = e[0] === "-";
  t && (e = e.substring(1, e.length));
  var n = e.split("."), o = n[0].replace(/^0+/, "") || "0", r = n[1] || "";
  return (t ? "-" : "") + o + (r ? "." + r : "");
}
function su(e, t, n) {
  for (var o = "", r = n ? "0" : "", s = 0; s <= t - 1; s++)
    o += e[s] || r;
  return o;
}
function lc(e, t) {
  return Array(t + 1).join(e);
}
function au(e) {
  var t = e + "", n = t[0] === "-" ? "-" : "";
  n && (t = t.substring(1));
  var o = t.split(/[eE]/g), r = o[0], s = o[1];
  if (s = Number(s), !s)
    return n + r;
  r = r.replace(".", "");
  var a = 1 + s, i = r.length;
  return a < 0 ? r = "0." + lc("0", Math.abs(a)) + r : a >= i ? r = r + lc("0", a - i) : r = (r.substring(0, a) || "0") + "." + r.substring(a), n + r;
}
function dc(e, t, n) {
  if (["", "-"].indexOf(e) !== -1)
    return e;
  var o = (e.indexOf(".") !== -1 || n) && t, r = Za(e), s = r.beforeDecimal, a = r.afterDecimal, i = r.hasNegation, c = parseFloat("0." + (a || "0")), d = a.length <= t ? "0." + a : c.toFixed(t), f = d.split("."), p = s;
  s && Number(f[0]) && (p = s.split("").reverse().reduce(function(y, w, b) {
    return y.length > b ? (Number(y[0]) + Number(w)).toString() + y.substring(1, y.length) : w + y;
  }, f[0]));
  var m = su(f[1] || "", t, n), h = i ? "-" : "", g = o ? "." : "";
  return "" + h + p + g + m;
}
function bn(e, t) {
  if (e.value = e.value, e !== null) {
    if (e.createTextRange) {
      var n = e.createTextRange();
      return n.move("character", t), n.select(), !0;
    }
    return e.selectionStart || e.selectionStart === 0 ? (e.focus(), e.setSelectionRange(t, t), !0) : (e.focus(), !1);
  }
}
var iu = Xg(function(e, t) {
  for (var n = 0, o = 0, r = e.length, s = t.length; e[n] === t[n] && n < r; )
    n++;
  for (; e[r - 1 - o] === t[s - 1 - o] && s - o > n && r - o > n; )
    o++;
  return {
    from: { start: n, end: r - o },
    to: { start: n, end: s - o }
  };
}), Qg = function(e, t) {
  var n = Math.min(e.selectionStart, t);
  return {
    from: { start: n, end: e.selectionEnd },
    to: { start: n, end: t }
  };
};
function ev(e, t, n) {
  return Math.min(Math.max(e, t), n);
}
function js(e) {
  return Math.max(e.selectionStart, e.selectionEnd);
}
function tv() {
  return typeof navigator < "u" && !(navigator.platform && /iPhone|iPod/.test(navigator.platform));
}
function nv(e) {
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
function ov(e) {
  var t = e.currentValue, n = e.formattedValue, o = e.currentValueIndex, r = e.formattedValueIndex;
  return t[o] === n[r];
}
function rv(e, t, n, o, r, s, a) {
  a === void 0 && (a = ov);
  var i = r.findIndex(function(j) {
    return j;
  }), c = e.slice(0, i);
  !t && !n.startsWith(c) && (t = c, n = c + n, o = o + c.length);
  for (var d = n.length, f = e.length, p = {}, m = new Array(d), h = 0; h < d; h++) {
    m[h] = -1;
    for (var g = 0, y = f; g < y; g++) {
      var w = a({
        currentValue: n,
        lastValue: t,
        formattedValue: e,
        currentValueIndex: h,
        formattedValueIndex: g
      });
      if (w && p[g] !== !0) {
        m[h] = g, p[g] = !0;
        break;
      }
    }
  }
  for (var b = o; b < d && (m[b] === -1 || !s(n[b])); )
    b++;
  var k = b === d || m[b] === -1 ? f : m[b];
  for (b = o - 1; b > 0 && m[b] === -1; )
    b--;
  var C = b === -1 || m[b] === -1 ? 0 : m[b] + 1;
  return C > k ? k : o - C < k - o ? C : k;
}
function uc(e, t, n, o) {
  var r = e.length;
  if (t = ev(t, 0, r), o === "left") {
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
function sv(e) {
  for (var t = Array.from({ length: e.length + 1 }).map(function() {
    return !0;
  }), n = 0, o = t.length; n < o; n++)
    t[n] = !!(Ro(e[n]) || Ro(e[n - 1]));
  return t;
}
function cu(e, t, n, o, r, s) {
  s === void 0 && (s = sn);
  var a = cc(function(g, y) {
    var w, b;
    return ou(g) ? (b = "", w = "") : typeof g == "number" || y ? (b = typeof g == "number" ? au(g) : g, w = o(b)) : (b = r(g, void 0), w = o(b)), { formattedValue: w, numAsString: b };
  }), i = u.useState(function() {
    return a(cn(e) ? t : e, n);
  }), c = i[0], d = i[1], f = cc(function(g, y) {
    g.formattedValue !== c.formattedValue && d({
      formattedValue: g.formattedValue,
      numAsString: g.value
    }), s(g, y);
  }), p = e, m = n;
  cn(e) && (p = c.numAsString, m = !0);
  var h = a(p, m);
  return u.useMemo(function() {
    d(h);
  }, [h.formattedValue]), u.useEffect(function() {
    if (!cn(t) && cn(e) && c.formattedValue !== "") {
      var g = parseFloat(c.numAsString);
      f({
        formattedValue: c.formattedValue,
        value: c.numAsString,
        floatValue: isNaN(g) ? void 0 : g
      }, { event: void 0, source: Zn.props });
    }
  }, []), [c, f];
}
function av(e) {
  return e.replace(/[^0-9]/g, "");
}
function iv(e) {
  return e;
}
function cv(e) {
  var t = e.type;
  t === void 0 && (t = "text");
  var n = e.displayType;
  n === void 0 && (n = "input");
  var o = e.customInput, r = e.renderText, s = e.getInputRef, a = e.format;
  a === void 0 && (a = iv);
  var i = e.removeFormatting;
  i === void 0 && (i = av);
  var c = e.defaultValue, d = e.valueIsNumericString, f = e.onValueChange, p = e.isAllowed, m = e.onChange;
  m === void 0 && (m = sn);
  var h = e.onKeyDown;
  h === void 0 && (h = sn);
  var g = e.onMouseUp;
  g === void 0 && (g = sn);
  var y = e.onFocus;
  y === void 0 && (y = sn);
  var w = e.onBlur;
  w === void 0 && (w = sn);
  var b = e.value, k = e.getCaretBoundary;
  k === void 0 && (k = sv);
  var C = e.isValidInputCharacter;
  C === void 0 && (C = Ro);
  var j = e.isCharacterSame, N = nu(e, ["type", "displayType", "customInput", "renderText", "getInputRef", "format", "removeFormatting", "defaultValue", "valueIsNumericString", "onValueChange", "isAllowed", "onChange", "onKeyDown", "onMouseUp", "onFocus", "onBlur", "value", "getCaretBoundary", "isValidInputCharacter", "isCharacterSame"]), T = cu(b, c, !!d, a, i, f), S = T[0], v = S.formattedValue, R = S.numAsString, D = T[1], L = u.useRef(), F = u.useRef({ formattedValue: v, numAsString: R }), _ = function(V, X) {
    F.current = { formattedValue: V.formattedValue, numAsString: V.value }, D(V, X);
  }, z = u.useState(!1), O = z[0], M = z[1], $ = u.useRef(null), I = u.useRef({
    setCaretTimeout: null,
    focusTimeout: null
  });
  u.useEffect(function() {
    return M(!0), function() {
      clearTimeout(I.current.setCaretTimeout), clearTimeout(I.current.focusTimeout);
    };
  }, []);
  var A = a, B = function(V, X) {
    var ie = parseFloat(X);
    return {
      formattedValue: V,
      value: X,
      floatValue: isNaN(ie) ? void 0 : ie
    };
  }, W = function(V, X, ie) {
    V.selectionStart === 0 && V.selectionEnd === V.value.length || (bn(V, X), I.current.setCaretTimeout = setTimeout(function() {
      V.value === ie && V.selectionStart !== X && bn(V, X);
    }, 0));
  }, U = function(V, X, ie) {
    return uc(V, X, k(V), ie);
  }, Z = function(V, X, ie) {
    var Ce = k(X), Pe = rv(X, v, V, ie, Ce, C, j);
    return Pe = uc(X, Pe, Ce), Pe;
  }, le = function(V) {
    var X = V.formattedValue;
    X === void 0 && (X = "");
    var ie = V.input, Ce = V.source, Pe = V.event, me = V.numAsString, he;
    if (ie) {
      var xe = V.inputValue || ie.value, Ae = js(ie);
      ie.value = X, he = Z(xe, X, Ae), he !== void 0 && W(ie, he, X);
    }
    X !== v && _(B(X, me), { event: Pe, source: Ce });
  };
  u.useEffect(function() {
    var V = F.current, X = V.formattedValue, ie = V.numAsString;
    (v !== X || R !== ie) && _(B(v, R), {
      event: void 0,
      source: Zn.props
    });
  }, [v, R]);
  var ue = $.current ? js($.current) : void 0, se = typeof window < "u" ? u.useLayoutEffect : u.useEffect;
  se(function() {
    var V = $.current;
    if (v !== F.current.formattedValue && V) {
      var X = Z(F.current.formattedValue, v, ue);
      V.value = v, W(V, X, v);
    }
  }, [v]);
  var ee = function(V, X, ie) {
    var Ce = X.target, Pe = L.current ? Qg(L.current, Ce.selectionEnd) : iu(v, V), me = Object.assign(Object.assign({}, Pe), { lastValue: v }), he = i(V, me), xe = A(he);
    if (he = i(xe, void 0), p && !p(B(xe, he))) {
      var Ae = X.target, de = js(Ae), ft = Z(V, v, de);
      return Ae.value = v, W(Ae, ft, v), !1;
    }
    return le({
      formattedValue: xe,
      numAsString: he,
      inputValue: V,
      event: X,
      source: ie,
      input: X.target
    }), !0;
  }, pe = function(V, X) {
    X === void 0 && (X = 0);
    var ie = V.selectionStart, Ce = V.selectionEnd;
    L.current = { selectionStart: ie, selectionEnd: Ce + X };
  }, q = function(V) {
    var X = V.target, ie = X.value, Ce = ee(ie, V, Zn.event);
    Ce && m(V), L.current = void 0;
  }, K = function(V) {
    var X = V.target, ie = V.key, Ce = X.selectionStart, Pe = X.selectionEnd, me = X.value;
    me === void 0 && (me = "");
    var he;
    ie === "ArrowLeft" || ie === "Backspace" ? he = Math.max(Ce - 1, 0) : ie === "ArrowRight" ? he = Math.min(Ce + 1, me.length) : ie === "Delete" && (he = Ce);
    var xe = 0;
    ie === "Delete" && Ce === Pe && (xe = 1);
    var Ae = ie === "ArrowLeft" || ie === "ArrowRight";
    if (he === void 0 || Ce !== Pe && !Ae) {
      h(V), pe(X, xe);
      return;
    }
    var de = he;
    if (Ae) {
      var ft = ie === "ArrowLeft" ? "left" : "right";
      de = U(me, he, ft), de !== he && V.preventDefault();
    } else ie === "Delete" && !C(me[he]) ? de = U(me, he, "right") : ie === "Backspace" && !C(me[he]) && (de = U(me, he, "left"));
    de !== he && W(X, de, me), h(V), pe(X, xe);
  }, ae = function(V) {
    var X = V.target, ie = function() {
      var Ce = X.selectionStart, Pe = X.selectionEnd, me = X.value;
      if (me === void 0 && (me = ""), Ce === Pe) {
        var he = U(me, Ce);
        he !== Ce && W(X, he, me);
      }
    };
    ie(), requestAnimationFrame(function() {
      ie();
    }), g(V), pe(X);
  }, be = function(V) {
    V.persist && V.persist();
    var X = V.target, ie = V.currentTarget;
    $.current = X, I.current.focusTimeout = setTimeout(function() {
      var Ce = X.selectionStart, Pe = X.selectionEnd, me = X.value;
      me === void 0 && (me = "");
      var he = U(me, Ce);
      he !== Ce && !(Ce === 0 && Pe === me.length) && W(X, he, me), y(Object.assign(Object.assign({}, V), { currentTarget: ie }));
    }, 0);
  }, fe = function(V) {
    $.current = null, clearTimeout(I.current.focusTimeout), clearTimeout(I.current.setCaretTimeout), w(V);
  }, Se = O && tv() ? "numeric" : void 0, te = Object.assign({ inputMode: Se }, N, {
    type: t,
    value: v,
    onChange: q,
    onKeyDown: K,
    onMouseUp: ae,
    onFocus: be,
    onBlur: fe
  });
  if (n === "text")
    return r ? rn.createElement(rn.Fragment, null, r(v, N) || null) : rn.createElement("span", Object.assign({}, N, { ref: s }), v);
  if (o) {
    var H = o;
    return rn.createElement(H, Object.assign({}, te, { ref: s }));
  }
  return rn.createElement("input", Object.assign({}, te, { ref: s }));
}
function fc(e, t) {
  var n = t.decimalScale, o = t.fixedDecimalScale, r = t.prefix;
  r === void 0 && (r = "");
  var s = t.suffix;
  s === void 0 && (s = "");
  var a = t.allowNegative, i = t.thousandsGroupStyle;
  if (i === void 0 && (i = "thousand"), e === "" || e === "-")
    return e;
  var c = rs(t), d = c.thousandSeparator, f = c.decimalSeparator, p = n !== 0 && e.indexOf(".") !== -1 || n && o, m = Za(e, a), h = m.beforeDecimal, g = m.afterDecimal, y = m.addNegation;
  return n !== void 0 && (g = su(g, n, !!o)), d && (h = Zg(h, d, i)), r && (h = r + h), s && (g = g + s), y && (h = "-" + h), e = h + (p && f || "") + g, e;
}
function rs(e) {
  var t = e.decimalSeparator;
  t === void 0 && (t = ".");
  var n = e.thousandSeparator, o = e.allowedDecimalSeparators;
  return n === !0 && (n = ","), o || (o = [t, "."]), {
    decimalSeparator: t,
    thousandSeparator: n,
    allowedDecimalSeparators: o
  };
}
function lv(e, t) {
  e === void 0 && (e = "");
  var n = new RegExp("(-)"), o = new RegExp("(-)(.)*(-)"), r = n.test(e), s = o.test(e);
  return e = e.replace(/-/g, ""), r && !s && t && (e = "-" + e), e;
}
function dv(e, t) {
  return new RegExp("(^-)|[0-9]|" + ru(e), "g");
}
function uv(e, t, n) {
  return e === "" ? !0 : !t?.match(/\d/) && !n?.match(/\d/) && typeof e == "string" && !isNaN(Number(e));
}
function fv(e, t, n) {
  var o;
  t === void 0 && (t = nv(e));
  var r = n.allowNegative, s = n.prefix;
  s === void 0 && (s = "");
  var a = n.suffix;
  a === void 0 && (a = "");
  var i = n.decimalScale, c = t.from, d = t.to, f = d.start, p = d.end, m = rs(n), h = m.allowedDecimalSeparators, g = m.decimalSeparator, y = e[p] === g;
  if (Ro(e) && (e === s || e === a) && t.lastValue === "")
    return e;
  if (p - f === 1 && h.indexOf(e[f]) !== -1) {
    var w = i === 0 ? "" : g;
    e = e.substring(0, f) + w + e.substring(f + 1, e.length);
  }
  var b = function($, I, A) {
    var B = !1, W = !1;
    s.startsWith("-") ? B = !1 : $.startsWith("--") ? (B = !1, W = !0) : a.startsWith("-") && $.length === a.length ? B = !1 : $[0] === "-" && (B = !0);
    var U = B ? 1 : 0;
    return W && (U = 2), U && ($ = $.substring(U), I -= U, A -= U), { value: $, start: I, end: A, hasNegation: B };
  }, k = b(e, f, p), C = k.hasNegation;
  o = k, e = o.value, f = o.start, p = o.end;
  var j = b(t.lastValue, c.start, c.end), N = j.start, T = j.end, S = j.value, v = e.substring(f, p);
  e.length && S.length && (N > S.length - a.length || T < s.length) && !(v && a.startsWith(v)) && (e = S);
  var R = 0;
  e.startsWith(s) ? R += s.length : f < s.length && (R = f), e = e.substring(R), p -= R;
  var D = e.length, L = e.length - a.length;
  e.endsWith(a) ? D = L : (p > L || p > e.length - a.length) && (D = p), e = e.substring(0, D), e = lv(C ? "-" + e : e, r), e = (e.match(dv(g)) || []).join("");
  var F = e.indexOf(g);
  e = e.replace(new RegExp(ru(g), "g"), function($, I) {
    return I === F ? "." : "";
  });
  var _ = Za(e, r), z = _.beforeDecimal, O = _.afterDecimal, M = _.addNegation;
  return d.end - d.start < c.end - c.start && z === "" && y && !parseFloat(O) && (e = M ? "-" : ""), e;
}
function pv(e, t) {
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
function mv(e) {
  var t = rs(e), n = t.thousandSeparator, o = t.decimalSeparator, r = e.prefix;
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
function hv(e) {
  e = mv(e), e.decimalSeparator, e.allowedDecimalSeparators, e.thousandsGroupStyle;
  var t = e.suffix, n = e.allowNegative, o = e.allowLeadingZeros, r = e.onKeyDown;
  r === void 0 && (r = sn);
  var s = e.onBlur;
  s === void 0 && (s = sn);
  var a = e.thousandSeparator, i = e.decimalScale, c = e.fixedDecimalScale, d = e.prefix;
  d === void 0 && (d = "");
  var f = e.defaultValue, p = e.value, m = e.valueIsNumericString, h = e.onValueChange, g = nu(e, ["decimalSeparator", "allowedDecimalSeparators", "thousandsGroupStyle", "suffix", "allowNegative", "allowLeadingZeros", "onKeyDown", "onBlur", "thousandSeparator", "decimalScale", "fixedDecimalScale", "prefix", "defaultValue", "value", "valueIsNumericString", "onValueChange"]), y = rs(e), w = y.decimalSeparator, b = y.allowedDecimalSeparators, k = function(M) {
    return fc(M, e);
  }, C = function(M, $) {
    return fv(M, $, e);
  }, j = cn(p) ? f : p, N = m ?? uv(j, d, t);
  cn(p) ? cn(f) || (N = N || typeof f == "number") : N = N || typeof p == "number";
  var T = function(M) {
    return ou(M) ? M : (typeof M == "number" && (M = au(M)), N && typeof i == "number" ? dc(M, i, !!c) : M);
  }, S = cu(T(p), T(f), !!N, k, C, h), v = S[0], R = v.numAsString, D = v.formattedValue, L = S[1], F = function(M) {
    var $ = M.target, I = M.key, A = $.selectionStart, B = $.selectionEnd, W = $.value;
    if (W === void 0 && (W = ""), (I === "Backspace" || I === "Delete") && B < d.length && W !== "-") {
      M.preventDefault();
      return;
    }
    if (A !== B) {
      r(M);
      return;
    }
    I === "Backspace" && W[0] === "-" && A === d.length + 1 && n && bn($, 1), i && c && (I === "Backspace" && W[A - 1] === w ? (bn($, A - 1), M.preventDefault()) : I === "Delete" && W[A] === w && M.preventDefault()), b?.includes(I) && W[A] === w && bn($, A + 1);
    var U = a === !0 ? "," : a;
    I === "Backspace" && W[A - 1] === U && bn($, A - 1), I === "Delete" && W[A] === U && bn($, A + 1), r(M);
  }, _ = function(M) {
    var $ = R;
    if ($.match(/\d/g) || ($ = ""), o || ($ = Jg($)), c && i && ($ = dc($, i, c)), $ !== R) {
      var I = fc($, e);
      L({
        formattedValue: I,
        value: $,
        floatValue: parseFloat($)
      }, {
        event: M,
        source: Zn.event
      });
    }
    s(M);
  }, z = function(M) {
    return M === w ? !0 : Ro(M);
  }, O = function(M) {
    var $ = M.currentValue, I = M.lastValue, A = M.formattedValue, B = M.currentValueIndex, W = M.formattedValueIndex, U = $[B], Z = A[W], le = iu(I, $), ue = le.to, se = function(ee) {
      return C(ee).indexOf(".") + d.length;
    };
    return p === 0 && c && i && $[ue.start] === w && se($) < B && se(A) > W ? !1 : B >= ue.start && B < ue.end && b && b.includes(U) && Z === w ? !0 : U === Z;
  };
  return Object.assign(Object.assign({}, g), {
    value: D,
    valueIsNumericString: !1,
    isValidInputCharacter: z,
    isCharacterSame: O,
    onValueChange: L,
    format: k,
    removeFormatting: C,
    getCaretBoundary: function(M) {
      return pv(M, e);
    },
    onKeyDown: F,
    onBlur: _
  });
}
function gv(e) {
  var t = hv(e);
  return rn.createElement(cv, Object.assign({}, t));
}
function pc(e, t) {
  return /\d/.test(e) || e === t;
}
function vv(e, t, n, o) {
  let r = 0;
  for (let s = 0; s < t && s < e.length; s += 1) pc(e[s], o) && (r += 1);
  if (r === 0) return Math.min(t, n.length);
  for (let s = 0; s < n.length; s += 1) if (pc(n[s], o) && (r -= 1, r === 0))
    return s + 1;
  return n.length;
}
function yv(e, t) {
  let n = 0;
  for (; t + n < e.length && /\d/.test(e[t + n]); ) n += 1;
  return n;
}
function bv(e, { decimalSeparator: t, thousandSeparator: n, allowedDecimalSeparators: o, thousandsGroupStyle: r }) {
  const s = new Set([...o, t].filter((h) => h.length === 1)), a = e.split(""), i = a.reduce((h, g, y) => (s.has(g) && h.push(y), h), []);
  if (i.length === 0) return e;
  const c = i[i.length - 1], d = a[c], f = i.filter((h) => a[h] === d).length, p = r === "wan" ? 4 : 3;
  let m = -1;
  return f === 1 && (d === t ? m = c : d === n ? m = yv(e, c + 1) === p ? -1 : c : m = c), a.map((h, g) => g === m ? t : s.has(h) && h !== n ? "" : h).join("");
}
function mc({ direction: e, style: t, ...n }) {
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
var qs = {
  root: "m_e2f5cd4e",
  controls: "m_95e17d22",
  control: "m_80b4b171"
};
const xv = /^(0\.0*|-0(\.0*)?)$/, hc = /^-?0\d+(\.\d+)?\.?$/, wv = /\.\d*0$/, lu = /^-?\d+\.$/;
function Ks(e) {
  return typeof e == "string" && e !== "" && !Number.isNaN(Number(e));
}
function ks(e) {
  return typeof e == "bigint";
}
function Es(e) {
  return typeof e == "number" ? e < Number.MAX_SAFE_INTEGER : e === "" || Ks(e) && Number(e) < Number.MAX_SAFE_INTEGER;
}
function du(e, t) {
  return e === "" || e === "-" || !t && e.startsWith("-") ? !1 : /^-?\d+$/.test(e);
}
function Rs(e, t) {
  return typeof e == "bigint" ? !0 : e === "" || du(e, t);
}
function vo(e) {
  if (!/^-?\d+$/.test(e)) return null;
  try {
    return BigInt(e);
  } catch {
    return null;
  }
}
function ir(e) {
  if (typeof e == "bigint") return e;
  if (typeof e == "number" && Number.isFinite(e) && Number.isInteger(e)) return BigInt(e);
}
function hr(e, t, n) {
  return t !== void 0 && e < t ? t : n !== void 0 && e > n ? n : e;
}
function Sv(e) {
  return e.toString().replace(".", "").length;
}
function Cv(e, t) {
  return (typeof e == "number" ? e < Number.MAX_SAFE_INTEGER : !Number.isNaN(Number(e))) && !Number.isNaN(e) && Sv(t) < 14 && t !== "";
}
function jv(e, t, n) {
  return e === void 0 ? !0 : (t === void 0 || e >= t) && (n === void 0 || e <= n);
}
const Ns = {
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
}, uu = $e((e, { size: t }) => ({ controls: { "--ni-chevron-size": De(t, "ni-chevron-size") } }));
function gc(e, t) {
  return t ? `${e}.` : e;
}
function kv(e, t) {
  const n = lu.test(e), o = t.trim ? e.replace(/^0+(?=\d)/, "") : e, r = parseFloat(o);
  if (Number.isNaN(r)) return o;
  if (!t.clamp) return t.trim ? gc(r, n) : e;
  const s = r > Number.MAX_SAFE_INTEGER && t.max !== void 0 ? t.max : dn(r, t.min, t.max);
  return !t.trim && s === r ? e : gc(s, n);
}
function Ev(e, t) {
  if (e === "" || e === "-") return e;
  const n = vo(e);
  return n === null ? e : t.clampBehavior === "blur" ? hr(n, t.min, t.max) : n;
}
const No = hn((e) => {
  const t = J([
    "Input",
    "InputWrapper",
    "NumberInput"
  ], Ns, e), { className: n, classNames: o, styles: r, unstyled: s, vars: a, onChange: i, onValueChange: c, value: d, defaultValue: f, max: p, min: m, step: h, hideControls: g, rightSection: y, isAllowed: w, clampBehavior: b, onBlur: k, allowDecimal: C, decimalScale: j, onKeyDown: N, onKeyDownCapture: T, handlersRef: S, startValue: v, disabled: R, rightSectionPointerEvents: D, allowNegative: L, readOnly: F, size: _, rightSectionWidth: z, stepHoldInterval: O, stepHoldDelay: M, allowLeadingZeros: $, withKeyboardEvents: I, trimLeadingZeroesOnBlur: A, allowedDecimalSeparators: B, selectAllOnFocus: W, onMinReached: U, onMaxReached: Z, onFocus: le, attributes: ue, ref: se, ...ee } = t, pe = L ?? !0, q = $ ?? !0, K = Me({
    name: "NumberInput",
    classes: qs,
    props: t,
    classNames: o,
    styles: r,
    unstyled: s,
    attributes: ue,
    vars: a,
    varsResolver: uu
  }), { resolvedClassNames: ae, resolvedStyles: be } = zo({
    classNames: o,
    styles: r,
    props: t
  }), fe = u.useRef(ks(d) || ks(f) ? "bigint" : "number");
  ks(d) ? fe.current = "bigint" : typeof d == "number" && (fe.current = "number");
  const Se = fe.current === "bigint", [te, H] = Xe({
    value: d,
    defaultValue: f,
    finalValue: "",
    onChange: i
  }), V = M !== void 0 && O !== void 0, X = u.useRef(null), ie = u.useRef(null), Ce = u.useRef(0), Pe = typeof m == "number" ? m : void 0, me = typeof p == "number" ? p : void 0, he = typeof h == "number" ? h : Ns.step, xe = typeof v == "number" ? v : Ns.startValue, Ae = ir(m), de = ir(p), ft = ir(h) ?? BigInt(1), Re = ir(v) ?? BigInt(0), pt = (Y) => !du(Y, pe) || q && hc.test(Y) ? Y : vo(Y) ?? Y, Rn = (Y) => {
    const re = Number(Y);
    return Number.isSafeInteger(re) ? re : void 0;
  }, Et = (Y, re) => {
    re.source === "event" && H(Se ? pt(Y.value) : Cv(Y.floatValue, Y.value) && !xv.test(Y.value) && !(q && hc.test(Y.value)) && !wv.test(Y.value) && !lu.test(Y.value) ? Y.floatValue : Y.value), c?.(Y, re);
  }, tn = (Y) => {
    const re = String(Y).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    return re ? Math.max(0, (re[1] ? re[1].length : 0) - (re[2] ? +re[2] : 0)) : 0;
  }, Rt = (Y) => {
    X.current && typeof Y < "u" && X.current.setSelectionRange(Y, Y);
  }, Nn = u.useRef(br);
  Nn.current = () => {
    if (Se) {
      if (!Rs(te, pe)) return;
      let Ve;
      const He = te;
      if (typeof He == "bigint") {
        const tt = He + ft;
        de !== void 0 && tt > de && Z?.(), Ve = de !== void 0 && tt > de ? de : tt;
      } else if (typeof He == "string" && He !== "") {
        const tt = vo(He);
        if (tt === null) return;
        const on = tt + ft;
        de !== void 0 && on > de && Z?.(), Ve = de !== void 0 && on > de ? de : on;
      } else Ve = hr(Re, Ae, de);
      const Ke = Ve.toString();
      H(Ve), c?.({
        floatValue: Rn(Ve),
        formattedValue: Ke,
        value: Ke
      }, { source: "increment" }), setTimeout(() => Rt(X.current?.value.length), 0);
      return;
    }
    if (!Es(te)) return;
    let Y;
    const re = tn(te), Tn = tn(he), An = Math.max(re, Tn), mt = 10 ** An;
    if (!Ks(te) && (typeof te != "number" || Number.isNaN(te))) Y = dn(xe, Pe, me);
    else if (me !== void 0) {
      const Ve = (Math.round(Number(te) * mt) + Math.round(he * mt)) / mt;
      Ve > me && Z?.(), Y = Ve <= me ? Ve : me;
    } else Y = (Math.round(Number(te) * mt) + Math.round(he * mt)) / mt;
    const Je = Y.toFixed(An);
    H(parseFloat(Je)), c?.({
      floatValue: parseFloat(Je),
      formattedValue: Je,
      value: Je
    }, { source: "increment" }), setTimeout(() => Rt(X.current?.value.length), 0);
  };
  const Pn = u.useRef(br);
  Pn.current = () => {
    if (Se) {
      if (!Rs(te, pe)) return;
      let He;
      const Ke = Ae !== void 0 ? Ae : pe ? void 0 : BigInt(0), tt = te;
      if (typeof tt == "bigint") {
        const In = tt - ft;
        Ke !== void 0 && In < Ke && U?.(), He = Ke !== void 0 && In < Ke ? Ke : In;
      } else if (typeof tt == "string" && tt !== "") {
        const In = vo(tt);
        if (In === null) return;
        const ms = In - ft;
        Ke !== void 0 && ms < Ke && U?.(), He = Ke !== void 0 && ms < Ke ? Ke : ms;
      } else He = hr(Re, Ke, de);
      const on = He.toString();
      H(He), c?.({
        floatValue: Rn(He),
        formattedValue: on,
        value: on
      }, { source: "decrement" }), setTimeout(() => Rt(X.current?.value.length), 0);
      return;
    }
    if (!Es(te)) return;
    let Y;
    const re = Pe !== void 0 ? Pe : pe ? Number.MIN_SAFE_INTEGER : 0, Tn = tn(te), An = tn(he), mt = Math.max(Tn, An), Je = 10 ** mt;
    if (!Ks(te) && typeof te != "number" || Number.isNaN(te)) Y = dn(xe, re, me);
    else {
      const He = (Math.round(Number(te) * Je) - Math.round(he * Je)) / Je;
      re !== void 0 && He < re && U?.(), Y = re !== void 0 && He < re ? re : He;
    }
    const Ve = Y.toFixed(mt);
    H(parseFloat(Ve)), c?.({
      floatValue: parseFloat(Ve),
      formattedValue: Ve,
      value: Ve
    }, { source: "decrement" }), setTimeout(() => Rt(X.current?.value.length), 0);
  };
  const Ge = (Y) => {
    const re = Y.clipboardData.getData("text"), Tn = ee.decimalSeparator || ".", An = ee.thousandSeparator === !0 ? "," : ee.thousandSeparator === !1 ? void 0 : ee.thousandSeparator, mt = bv(re, {
      decimalSeparator: Tn,
      thousandSeparator: An,
      allowedDecimalSeparators: B || [".", ","],
      thousandsGroupStyle: ee.thousandsGroupStyle
    });
    if (mt !== re) {
      Y.preventDefault();
      const Je = X.current;
      if (Je) {
        const Ve = Je.selectionStart ?? 0, He = Je.selectionEnd ?? 0, Ke = Je.value, tt = Ke.substring(0, Ve) + mt + Ke.substring(He);
        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set?.call(Je, tt), Je.dispatchEvent(new Event("change", { bubbles: !0 }));
        const on = Ve + mt.length;
        setTimeout(() => Rt(vv(tt, on, Je.value, Tn)), 0);
      }
    }
    ee.onPaste?.(Y);
  }, Ot = (Y) => {
    N?.(Y), !(F || !I) && (Y.key === "ArrowUp" && (Y.preventDefault(), Nn.current?.()), Y.key === "ArrowDown" && (Y.preventDefault(), Pn.current?.()));
  }, tr = (Y) => {
    if (T?.(Y), Y.key === "Backspace") {
      const re = X.current;
      re && re.selectionStart === 0 && re.selectionStart === re.selectionEnd && (Y.preventDefault(), window.setTimeout(() => Rt(0), 0));
    }
  }, nr = (Y) => {
    W && window.setTimeout(() => X.current?.select(), 0), le?.(Y);
  }, ps = (Y) => {
    let re = te;
    Se ? (b === "blur" && typeof re == "bigint" && (re = hr(re, Ae, de)), A && typeof re == "string" && (re = Ev(re, {
      min: Ae,
      max: de,
      clampBehavior: b
    }))) : typeof re == "number" ? b === "blur" && (re = dn(re, Pe, me)) : typeof re == "string" && (re = kv(re, {
      min: Pe,
      max: me,
      trim: !!A && tn(re) < 15,
      clamp: b === "blur"
    })), te !== re && H(re), k?.(Y);
  };
  nl(S, {
    increment: Nn.current,
    decrement: Pn.current
  });
  const or = (Y) => {
    Y ? Nn.current?.() : Pn.current?.(), Ce.current += 1;
  }, Be = (Y) => {
    if (or(Y), V) {
      const re = typeof O == "number" ? O : O(Ce.current);
      ie.current = window.setTimeout(() => Be(Y), re);
    }
  }, Ze = (Y, re) => {
    Y.preventDefault(), X.current?.focus(), or(re), V && (ie.current = window.setTimeout(() => Be(re), M));
  }, nn = () => {
    ie.current && window.clearTimeout(ie.current), ie.current = null, Ce.current = 0;
  }, ff = /* @__PURE__ */ l.jsxs("div", {
    ...K("controls"),
    children: [/* @__PURE__ */ l.jsx(Xn, {
      ...K("control"),
      tabIndex: -1,
      "aria-hidden": !0,
      disabled: R || typeof te == "number" && me !== void 0 && te >= me || typeof te == "bigint" && de !== void 0 && te >= de,
      mod: { direction: "up" },
      onMouseDown: (Y) => Y.preventDefault(),
      onPointerDown: (Y) => {
        Ze(Y, !0);
      },
      onPointerUp: nn,
      onPointerLeave: nn,
      children: /* @__PURE__ */ l.jsx(mc, { direction: "up" })
    }), /* @__PURE__ */ l.jsx(Xn, {
      ...K("control"),
      tabIndex: -1,
      "aria-hidden": !0,
      disabled: R || typeof te == "number" && Pe !== void 0 && te <= Pe || typeof te == "bigint" && Ae !== void 0 && te <= Ae,
      mod: { direction: "down" },
      onMouseDown: (Y) => Y.preventDefault(),
      onPointerDown: (Y) => {
        Ze(Y, !1);
      },
      onPointerUp: nn,
      onPointerLeave: nn,
      children: /* @__PURE__ */ l.jsx(mc, { direction: "down" })
    })]
  });
  return /* @__PURE__ */ l.jsx(vt, {
    component: gv,
    allowNegative: L,
    className: Xt(qs.root, n),
    size: _,
    ...ee,
    inputMode: Se ? "numeric" : "decimal",
    readOnly: F,
    disabled: R,
    value: typeof te == "bigint" ? te.toString() : te,
    getInputRef: _e(se, X),
    onValueChange: Et,
    rightSection: g || F || !(Se ? Rs(te, pe) : Es(te)) ? y : y || ff,
    classNames: ae,
    styles: be,
    unstyled: s,
    __staticSelector: "NumberInput",
    decimalScale: Se ? 0 : C ? j : 0,
    onPaste: Ge,
    onFocus: nr,
    onKeyDown: Ot,
    onKeyDownCapture: tr,
    rightSectionPointerEvents: D ?? (R ? "none" : void 0),
    rightSectionWidth: z ?? `var(--ni-right-section-width-${_ || "sm"})`,
    allowLeadingZeros: $,
    allowedDecimalSeparators: B,
    onBlur: ps,
    attributes: ue,
    isAllowed: (Y) => {
      if (!(!w || w(Y))) return !1;
      if (b !== "strict") return !0;
      if (!Se) return jv(Y.floatValue, Pe, me);
      if (Y.value === "" || Y.value === "-") return !0;
      const re = vo(Y.value);
      return re === null ? !0 : (Ae === void 0 || re >= Ae) && (de === void 0 || re <= de);
    }
  });
});
No.classes = {
  ...vt.classes,
  ...qs
};
No.varsResolver = uu;
No.displayName = "@mantine/core/NumberInput";
const Ja = u.createContext(null), Qa = hn(((e) => {
  const { value: t, defaultValue: n, onChange: o, size: r, wrapperProps: s, children: a, name: i, readOnly: c, disabled: d, ...f } = J("RadioGroup", null, e), p = Lt(i), [m, h] = Xe({
    value: t,
    defaultValue: n,
    finalValue: "",
    onChange: o
  }), g = (y) => !c && h(typeof y == "string" ? y : y.currentTarget.value);
  return /* @__PURE__ */ l.jsx(Ja, {
    value: {
      value: m,
      onChange: g,
      size: r,
      name: p,
      disabled: d
    },
    children: /* @__PURE__ */ l.jsx(wt.Wrapper, {
      size: r,
      ...s,
      ...f,
      labelElement: "div",
      __staticSelector: "RadioGroup",
      children: /* @__PURE__ */ l.jsx(Rd, {
        role: "radiogroup",
        children: a
      })
    })
  });
}));
Qa.classes = wt.Wrapper.classes;
Qa.displayName = "@mantine/core/RadioGroup";
var fu = { card: "m_9dc8ae12" };
const pu = u.createContext(null), Rv = { withBorder: !0 }, mu = $e((e, { radius: t }) => ({ card: { "--card-radius": jt(t) } })), ss = ce((e) => {
  const t = J("RadioCard", Rv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, checked: c, mod: d, withBorder: f, value: p, onClick: m, name: h, onKeyDown: g, attributes: y, ...w } = t, b = Me({
    name: "RadioCard",
    classes: fu,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: y,
    vars: i,
    varsResolver: mu,
    rootSelector: "card"
  }), { dir: k } = oo(), C = u.use(Ja), j = typeof c == "boolean" ? c : C?.value === p || !1, N = h || C?.name, T = (S) => {
    if (g?.(S), !!N && [
      "ArrowDown",
      "ArrowUp",
      "ArrowLeft",
      "ArrowRight"
    ].includes(S.nativeEvent.code)) {
      S.preventDefault();
      const v = Array.from(document.querySelectorAll(`[role="radio"][name="${N}"]`)), R = v.findIndex((F) => F === S.target), D = R + 1 >= v.length ? 0 : R + 1, L = R - 1 < 0 ? v.length - 1 : R - 1;
      S.nativeEvent.code === "ArrowDown" && (v[D].focus(), v[D].click()), S.nativeEvent.code === "ArrowUp" && (v[L].focus(), v[L].click()), S.nativeEvent.code === "ArrowLeft" && (v[k === "ltr" ? L : D].focus(), v[k === "ltr" ? L : D].click()), S.nativeEvent.code === "ArrowRight" && (v[k === "ltr" ? D : L].focus(), v[k === "ltr" ? D : L].click());
    }
  };
  return /* @__PURE__ */ l.jsx(pu, {
    value: { checked: j },
    children: /* @__PURE__ */ l.jsx(Xn, {
      mod: [{
        "with-border": f,
        checked: j
      }, d],
      ...b("card"),
      ...w,
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
ss.displayName = "@mantine/core/RadioCard";
ss.classes = fu;
ss.varsResolver = mu;
var hu = {
  indicator: "m_717d7ff6",
  icon: "m_3e4da632",
  "indicator--outline": "m_2980836c"
};
const Nv = { icon: Jd }, gu = $e((e, { radius: t, color: n, size: o, iconColor: r, variant: s, autoContrast: a }) => {
  const i = Mr({
    color: n || e.primaryColor,
    theme: e
  }), c = i.isThemeColor && i.shade === void 0 ? `var(--mantine-color-${i.color}-outline)` : i.color;
  return { indicator: {
    "--radio-size": De(o, "radio-size"),
    "--radio-radius": t === void 0 ? void 0 : jt(t),
    "--radio-color": s === "outline" ? c : gt(n, e),
    "--radio-icon-size": typeof o == "number" ? `calc(${De(o, "radio-size")} * 0.4)` : De(o, "radio-icon-size"),
    "--radio-icon-color": r ? gt(r, e) : Bo(a, e) ? to({
      color: n,
      theme: e,
      autoContrast: a
    }) : void 0
  } };
}), as = ce((e) => {
  const t = J("RadioIndicator", Nv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, icon: c, radius: d, color: f, iconColor: p, autoContrast: m, checked: h, mod: g, variant: y, disabled: w, attributes: b, ...k } = t, C = Me({
    name: "RadioIndicator",
    classes: hu,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: b,
    vars: i,
    varsResolver: gu,
    rootSelector: "indicator"
  }), j = u.use(pu), N = typeof h == "boolean" ? h : j?.checked || !1;
  return /* @__PURE__ */ l.jsx(Q, {
    ...C("indicator", { variant: y }),
    variant: y,
    mod: [{
      checked: N,
      disabled: w
    }, g],
    ...k,
    children: /* @__PURE__ */ l.jsx(c, { ...C("icon") })
  });
});
as.displayName = "@mantine/core/RadioIndicator";
as.classes = hu;
as.varsResolver = gu;
var vu = {
  root: "m_f3f1af94",
  inner: "m_89c4f5e4",
  icon: "m_f3ed6b2b",
  radio: "m_8a3dbb89",
  "radio--outline": "m_1bfe9d39"
};
const Pv = {
  labelPosition: "right",
  withErrorStyles: !0
}, yu = $e((e, { size: t, radius: n, color: o, iconColor: r, variant: s, autoContrast: a }) => {
  const i = Mr({
    color: o || e.primaryColor,
    theme: e
  }), c = i.isThemeColor && i.shade === void 0 ? `var(--mantine-color-${i.color}-outline)` : i.color;
  return { root: {
    "--radio-size": De(t, "radio-size"),
    "--radio-radius": n === void 0 ? void 0 : jt(n),
    "--radio-color": s === "outline" ? c : gt(o, e),
    "--radio-icon-color": r ? gt(r, e) : Bo(a, e) ? to({
      color: o,
      theme: e,
      autoContrast: a
    }) : void 0,
    "--radio-icon-size": De(t, "radio-icon-size")
  } };
}), mn = ce((e) => {
  const t = J("Radio", Pv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, id: c, size: d, label: f, labelPosition: p, description: m, error: h, radius: g, color: y, variant: w, disabled: b, wrapperProps: k, icon: C = Jd, rootRef: j, iconColor: N, onChange: T, mod: S, attributes: v, withErrorStyles: R, checked: D, ...L } = t, F = Me({
    name: "Radio",
    classes: vu,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: v,
    vars: i,
    varsResolver: yu
  }), _ = u.use(Ja), z = _?.size ?? d, O = t.size ? d : z, { styleProps: M, rest: $ } = Jc(L), I = Lt(c), A = [
    m ? `${I}-description` : void 0,
    h && typeof h != "boolean" ? `${I}-error` : void 0,
    $["aria-describedby"]
  ].filter(Boolean).join(" ") || void 0, B = _ ? _.value === $.value : void 0, W = {
    checked: B ?? D,
    name: $.name ?? _?.name,
    onChange: (U) => {
      _?.onChange(U), T?.(U);
    },
    disabled: _?.disabled ?? b
  };
  return /* @__PURE__ */ l.jsx(Ua, {
    ...F("root"),
    __staticSelector: "Radio",
    __stylesApiProps: t,
    id: I,
    size: O,
    labelPosition: p,
    label: f,
    description: m,
    error: h,
    disabled: W.disabled,
    classNames: n,
    styles: s,
    unstyled: a,
    "data-checked": (B ?? D) || void 0,
    variant: w,
    ref: j,
    mod: S,
    attributes: v,
    ...M,
    ...k,
    children: /* @__PURE__ */ l.jsxs(Q, {
      ...F("inner"),
      mod: { "label-position": p },
      children: [/* @__PURE__ */ l.jsx(Q, {
        ...F("radio", {
          focusable: !0,
          variant: w
        }),
        ...$,
        ...W,
        component: "input",
        mod: {
          error: !!h,
          "with-error-styles": R
        },
        id: I,
        type: "radio",
        "aria-describedby": A
      }), /* @__PURE__ */ l.jsx(C, {
        ...F("icon"),
        "aria-hidden": !0
      })]
    })
  });
});
mn.classes = vu;
mn.varsResolver = yu;
mn.displayName = "@mantine/core/Radio";
mn.Group = Qa;
mn.Card = ss;
mn.Indicator = as;
var bu = {
  root: "m_cf365364",
  indicator: "m_9e182ccd",
  label: "m_1738fcb2",
  input: "m_1714d588",
  control: "m_69686b9b",
  innerLabel: "m_78882f40"
};
const Tv = { withItemsBorders: !0 }, xu = $e((e, { radius: t, color: n, transitionDuration: o, size: r, transitionTimingFunction: s }) => ({ root: {
  "--sc-radius": t === void 0 ? void 0 : jt(t),
  "--sc-color": n ? gt(n, e) : void 0,
  "--sc-shadow": n ? void 0 : "var(--mantine-shadow-xs)",
  "--sc-transition-duration": o === void 0 ? void 0 : `${o}ms`,
  "--sc-transition-timing-function": s,
  "--sc-padding": De(r, "sc-padding"),
  "--sc-font-size": vr(r)
} })), qo = hn((e) => {
  const t = J("SegmentedControl", Tv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, data: c, value: d, defaultValue: f, onChange: p, size: m, name: h, disabled: g, readOnly: y, fullWidth: w, orientation: b, radius: k, color: C, transitionDuration: j, transitionTimingFunction: N, variant: T, autoContrast: S, withItemsBorders: v, mod: R, attributes: D, ref: L, ...F } = t, _ = Me({
    name: "SegmentedControl",
    props: t,
    classes: bu,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: D,
    vars: i,
    varsResolver: xu
  }), z = _o(), O = c.map((K) => up(K) ? {
    label: `${K}`,
    value: K
  } : K), M = op(), [$, I] = u.useState(Ci()), [A, B] = u.useState(null), [W, U] = u.useState({}), Z = (K, ae) => {
    K === null || W[ae] === K || (W[ae] = K, U({ ...W }));
  }, [le, ue] = Xe({
    value: d,
    defaultValue: f,
    finalValue: Array.isArray(c) ? O.find((K) => !K.disabled)?.value ?? c[0]?.value ?? null : null,
    onChange: p
  }), se = Lt(h), ee = O.map((K) => `${K.value}`), pe = O.map((K) => /* @__PURE__ */ u.createElement(Q, {
    ..._("control"),
    mod: {
      active: le === K.value,
      orientation: b
    },
    key: `${K.value}`
  }, /* @__PURE__ */ u.createElement("input", {
    ..._("input"),
    disabled: g || K.disabled,
    type: "radio",
    name: se,
    value: `${K.value}`,
    id: `${se}-${K.value}`,
    checked: le === K.value,
    onChange: () => !y && ue(K.value),
    "data-focus-ring": z.focusRing,
    key: `${K.value}-input`
  }), /* @__PURE__ */ u.createElement(Q, {
    component: "label",
    ..._("label"),
    mod: {
      active: le === K.value && !(g || K.disabled),
      disabled: g || K.disabled,
      "read-only": y
    },
    htmlFor: `${se}-${K.value}`,
    ref: (ae) => Z(ae, `${K.value}`),
    __vars: { "--sc-label-color": C !== void 0 ? to({
      color: C,
      theme: z,
      autoContrast: S
    }) : void 0 },
    key: `${K.value}-label`
  }, /* @__PURE__ */ l.jsx("span", {
    ..._("innerLabel"),
    children: K.label
  })))), q = _e(L, B);
  return Ri(() => {
    I(Ci());
  }, [c.length]), Ri(() => {
    U((K) => {
      const ae = {};
      return ee.forEach((be) => {
        be in K && (ae[be] = K[be]);
      }), Object.keys(ae).length === Object.keys(K).length ? K : ae;
    });
  }, [ee]), c.length === 0 ? null : /* @__PURE__ */ l.jsxs(Q, {
    ..._("root"),
    variant: T,
    size: m,
    ref: q,
    mod: [{
      "full-width": w,
      orientation: b,
      initialized: M,
      "with-items-borders": v
    }, R],
    ...F,
    role: "radiogroup",
    "data-disabled": g,
    children: [typeof le < "u" && /* @__PURE__ */ l.jsx(Wr, {
      target: W[`${le}`],
      parent: A,
      component: "span",
      transitionDuration: "var(--sc-transition-duration)",
      ..._("indicator")
    }, $), pe]
  });
});
qo.classes = bu;
qo.varsResolver = xu;
qo.displayName = "@mantine/core/SegmentedControl";
const Av = {
  size: "sm",
  withCheckIcon: !0,
  allowDeselect: !0,
  checkIconPosition: "left",
  openOnFocus: !0
}, ei = hn((e) => {
  const t = J([
    "Input",
    "InputWrapper",
    "Select"
  ], Av, e), { classNames: n, styles: o, unstyled: r, vars: s, dropdownOpened: a, defaultDropdownOpened: i, onDropdownClose: c, onDropdownOpen: d, onFocus: f, onBlur: p, onClick: m, onChange: h, data: g, value: y, defaultValue: w, selectFirstOptionOnChange: b, selectFirstOptionOnDropdownOpen: k, onOptionSubmit: C, comboboxProps: j, readOnly: N, disabled: T, filter: S, limit: v, withScrollArea: R, maxDropdownHeight: D, floatingHeight: L, size: F, searchable: _, rightSection: z, checkIconPosition: O, withCheckIcon: M, withAlignedLabels: $, nothingFoundMessage: I, name: A, form: B, searchValue: W, defaultSearchValue: U, onSearchChange: Z, allowDeselect: le, error: ue, rightSectionPointerEvents: se, id: ee, clearable: pe, clearSectionMode: q, clearButtonProps: K, hiddenInputProps: ae, renderOption: be, onClear: fe, autoComplete: Se, scrollAreaProps: te, __defaultRightSection: H, __clearSection: V, __clearable: X, chevronColor: ie, autoSelectOnBlur: Ce, openOnFocus: Pe, attributes: me, ...he } = t, xe = u.useMemo(() => yd(g), [g]), Ae = u.useRef({}), de = u.useMemo(() => bd(xe), [xe]), ft = Lt(ee), [Re, pt, Rn] = Xe({
    value: y,
    defaultValue: w,
    finalValue: null,
    onChange: h
  }), Et = Re != null ? `${Re}` in de ? de[`${Re}`] : Ae.current[`${Re}`] : void 0, tn = Qf(Et), [Rt, Nn, Pn] = Xe({
    value: W,
    defaultValue: U,
    finalValue: Et ? Et.label : "",
    onChange: Z
  }), Ge = Ba({
    opened: a,
    defaultOpened: i,
    onDropdownOpen: () => {
      d?.(), k ? Ge.selectFirstOption() : Ge.updateSelectedOptionIndex("active", { scrollIntoView: !0 });
    },
    onDropdownClose: () => {
      c?.(), setTimeout(Ge.resetSelectedOption, 0);
    }
  }), Ot = (Be) => {
    Nn(Be), Ge.resetSelectedOption();
  }, { resolvedClassNames: tr, resolvedStyles: nr } = zo({
    props: t,
    styles: o,
    classNames: n
  });
  u.useEffect(() => {
    b && Ge.selectFirstOption();
  }, [b, Rt]), u.useEffect(() => {
    y === null && Ot(""), y != null && Et && (tn?.value !== Et.value || tn?.label !== Et.label) && Ot(Et.label);
  }, [y, Et]), u.useEffect(() => {
    !Rn && !Pn && Ot(Re != null ? `${Re}` in de ? de[`${Re}`]?.label : Ae.current[`${Re}`]?.label || "" : "");
  }, [de, Re]), u.useEffect(() => {
    Re && `${Re}` in de && (Ae.current[`${Re}`] = de[`${Re}`]);
  }, [de, Re]);
  const ps = /* @__PURE__ */ l.jsx(we.ClearButton, {
    ...K,
    onClear: () => {
      pt(null, null), Ot(""), fe?.();
    }
  }), or = pe && Re != null && !T && !N;
  return /* @__PURE__ */ l.jsxs(l.Fragment, { children: [/* @__PURE__ */ l.jsxs(we, {
    store: Ge,
    __staticSelector: "Select",
    classNames: tr,
    styles: nr,
    unstyled: r,
    readOnly: N,
    size: F,
    attributes: me,
    floatingHeight: L,
    keepMounted: Ce,
    onOptionSubmit: (Be) => {
      C?.(Be);
      const Ze = le && `${de[Be].value}` == `${Re}` ? null : de[Be], nn = Ze ? Ze.value : null;
      nn !== Re && pt(nn, Ze), !Rn && Ot(nn != null && Ze?.label || ""), Ge.closeDropdown();
    },
    ...j,
    children: [/* @__PURE__ */ l.jsx(we.Target, {
      targetType: _ ? "input" : "button",
      autoComplete: Se,
      withExpandedAttribute: !0,
      children: /* @__PURE__ */ l.jsx(vt, {
        id: ft,
        __defaultRightSection: /* @__PURE__ */ l.jsx(we.Chevron, {
          size: F,
          error: ue,
          unstyled: r,
          color: ie
        }),
        __clearSection: ps,
        __clearable: or,
        __clearSectionMode: q,
        rightSection: z,
        rightSectionPointerEvents: se || "none",
        ...he,
        size: F,
        __staticSelector: "Select",
        disabled: T,
        readOnly: N || !_,
        value: Rt,
        onChange: (Be) => {
          if (Sg(Be)) {
            if (!N) {
              const Ze = Ug(de, Be.currentTarget.value);
              Ze && `${Ze.value}` != `${Re}` && (pt(Ze.value, Ze), !Rn && Ot(Ze.label));
            }
            return;
          }
          Ot(Be.currentTarget.value), Ge.openDropdown(), b && Ge.selectFirstOption();
        },
        onFocus: (Be) => {
          Pe && _ && Ge.openDropdown(), f?.(Be);
        },
        onBlur: (Be) => {
          Ce && Ge.clickSelectedOption(), Ge.closeDropdown();
          const Ze = Re != null && (`${Re}` in de ? de[`${Re}`] : Ae.current[`${Re}`]);
          Ot(Ze && Ze.label || ""), p?.(Be);
        },
        onClick: (Be) => {
          _ ? Ge.openDropdown() : Ge.toggleDropdown(), m?.(Be);
        },
        classNames: tr,
        styles: nr,
        unstyled: r,
        pointer: !_,
        error: ue,
        attributes: me
      })
    }), /* @__PURE__ */ l.jsx(wg, {
      data: xe,
      hidden: N || T,
      filter: S,
      search: Rt,
      limit: v,
      hiddenWhenEmpty: !I,
      withScrollArea: R,
      maxDropdownHeight: D,
      filterOptions: !!_ && Et?.label !== Rt,
      value: Re,
      checkIconPosition: O,
      withCheckIcon: M,
      withAlignedLabels: $,
      nothingFoundMessage: I,
      unstyled: r,
      labelId: he.label ? `${ft}-label` : void 0,
      "aria-label": he.label ? void 0 : he["aria-label"],
      renderOption: be,
      scrollAreaProps: te
    })]
  }), /* @__PURE__ */ l.jsx(we.HiddenInput, {
    value: Re,
    name: A,
    form: B,
    disabled: T,
    ...ae
  })] });
});
ei.classes = {
  ...vt.classes,
  ...we.classes
};
ei.displayName = "@mantine/core/Select";
const [Iv, ti] = Zt("Tabs component was not found in the tree");
var Ko = {
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
const ni = ce((e) => {
  const t = J("TabsList", null, e), { children: n, className: o, grow: r, justify: s, classNames: a, styles: i, style: c, mod: d, ...f } = t, p = ti();
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
    }, d],
    "aria-orientation": p.orientation,
    __vars: { "--tabs-justify": s },
    ...f,
    children: n
  });
});
ni.classes = Ko;
ni.displayName = "@mantine/core/TabsList";
const oi = ce((e) => {
  const t = J("TabsPanel", null, e), { children: n, className: o, value: r, classNames: s, styles: a, style: i, mod: c, keepMounted: d, ...f } = t, p = aa(), m = ti();
  u.useEffect(() => (m.setMountedPanel(r, !0), () => {
    m.setMountedPanel(r, !1);
  }), [r]);
  const h = m.value === r, g = m.keepMounted || d, y = m.keepMountedMode !== "display-none", w = g && y && p !== "test" ? /* @__PURE__ */ l.jsx(u.Activity, {
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
    children: w
  });
});
oi.classes = Ko;
oi.displayName = "@mantine/core/TabsPanel";
const ri = ce((e) => {
  const t = J("TabsTab", null, e), { className: n, children: o, rightSection: r, leftSection: s, value: a, onClick: i, onKeyDown: c, disabled: d, color: f, style: p, classNames: m, styles: h, vars: g, mod: y, tabIndex: w, ...b } = t, k = _o(), { dir: C } = oo(), j = ti(), N = a === j.value, T = (v) => {
    j.onChange(j.allowTabDeactivation && a === j.value ? null : a), i?.(v);
  }, S = {
    classNames: m,
    styles: h,
    props: t
  };
  return /* @__PURE__ */ l.jsxs(Xn, {
    ...j.getStyles("tab", {
      className: n,
      style: p,
      variant: j.variant,
      ...S
    }),
    disabled: d,
    unstyled: j.unstyled,
    variant: j.variant,
    mod: [{
      active: N,
      disabled: d,
      orientation: j.orientation,
      inverted: j.inverted,
      placement: j.orientation === "vertical" && j.placement
    }, y],
    role: "tab",
    id: j.getTabId(a),
    "aria-selected": N,
    tabIndex: w !== void 0 ? w : N || j.value === null ? 0 : -1,
    "aria-controls": j.mountedPanels.current.has(a) ? j.getPanelId(a) : void 0,
    onClick: T,
    __vars: { "--tabs-color": f ? gt(f, k) : void 0 },
    onKeyDown: il({
      siblingSelector: '[role="tab"]',
      parentSelector: '[role="tablist"]',
      activateOnFocus: j.activateTabWithKeyboard,
      loop: j.loop,
      orientation: j.orientation || "horizontal",
      dir: C,
      onKeyDown: c
    }),
    ...b,
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
ri.classes = Ko;
ri.displayName = "@mantine/core/TabsTab";
const vc = "Tabs.Tab or Tabs.Panel component was rendered with invalid value or without value", Mv = {
  keepMounted: !0,
  keepMountedMode: "activity",
  orientation: "horizontal",
  loop: !0,
  activateTabWithKeyboard: !0,
  variant: "default",
  placement: "left"
}, wu = $e((e, { radius: t, color: n, autoContrast: o }) => ({ root: {
  "--tabs-radius": jt(t),
  "--tabs-color": gt(n, e),
  "--tabs-text-color": Bo(o, e) ? to({
    color: n,
    theme: e,
    autoContrast: o
  }) : void 0
} })), at = ce((e) => {
  const t = J("Tabs", Mv, e), { defaultValue: n, value: o, onChange: r, orientation: s, children: a, loop: i, id: c, activateTabWithKeyboard: d, allowTabDeactivation: f, variant: p, color: m, radius: h, inverted: g, placement: y, keepMounted: w, keepMountedMode: b, classNames: k, styles: C, unstyled: j, className: N, style: T, vars: S, autoContrast: v, mod: R, attributes: D, ...L } = t, F = Lt(c), _ = u.useRef(/* @__PURE__ */ new Set()), z = Xf(), O = u.useCallback((A, B) => {
    const W = _.current;
    B && !W.has(A) ? (W.add(A), z()) : !B && W.has(A) && (W.delete(A), z());
  }, []), [M, $] = Xe({
    value: o,
    defaultValue: n,
    finalValue: null,
    onChange: r
  }), I = Me({
    name: "Tabs",
    props: t,
    classes: Ko,
    className: N,
    style: T,
    classNames: k,
    styles: C,
    unstyled: j,
    attributes: D,
    vars: S,
    varsResolver: wu
  });
  return /* @__PURE__ */ l.jsx(Iv, {
    value: {
      placement: y,
      value: M,
      orientation: s,
      id: F,
      loop: i,
      activateTabWithKeyboard: d,
      getTabId: yr(`${F}-tab`, vc),
      getPanelId: yr(`${F}-panel`, vc),
      onChange: $,
      allowTabDeactivation: f,
      variant: p,
      color: m,
      radius: h,
      inverted: g,
      keepMounted: w,
      keepMountedMode: b,
      unstyled: j,
      getStyles: I,
      mountedPanels: _,
      setMountedPanel: O
    },
    children: /* @__PURE__ */ l.jsx(Q, {
      id: F,
      variant: p,
      mod: [{
        orientation: s,
        inverted: s === "horizontal" && g,
        placement: s === "vertical" && y
      }, R],
      ...I("root"),
      ...L,
      children: a
    })
  });
});
at.classes = Ko;
at.varsResolver = wu;
at.displayName = "@mantine/core/Tabs";
at.Tab = ri;
at.Panel = oi;
at.List = ni;
const dt = ce((e) => {
  const t = J([
    "Input",
    "InputWrapper",
    "TextInput"
  ], null, e);
  return /* @__PURE__ */ l.jsx(vt, {
    component: "input",
    ...t,
    __staticSelector: "TextInput"
  });
});
dt.classes = vt.classes;
dt.displayName = "@mantine/core/TextInput";
function Po(e, t) {
  for (const n of t) {
    if (n.value === e) return n;
    if (Array.isArray(n.children)) {
      const o = Po(e, n.children);
      if (o) return o;
    }
  }
  return null;
}
function jr(e, t, n = []) {
  const o = Po(e, t);
  return o ? !Array.isArray(o.children) || o.children.length === 0 ? [o.value] : (o.children.forEach((r) => {
    Array.isArray(r.children) && r.children.length > 0 ? jr(r.value, t, n) : n.push(r.value);
  }), n) : n;
}
function Su(e) {
  return e.reduce((t, n) => (Array.isArray(n.children) && n.children.length > 0 ? t.push(...Su(n.children)) : t.push(n.value), t), []);
}
function is(e, t, n = []) {
  const o = [];
  for (const r of e) if (Array.isArray(r.children) && r.children.length > 0) {
    const s = is(r.children, t, n);
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
function Dv(e, t, n) {
  return n.length === 0 ? !1 : n.includes(e) ? !0 : is(t, n).result.some((o) => o.value === e && o.checked);
}
const Lv = gl(Dv);
function Ov(e, t, n) {
  return n.length === 0 ? !1 : is(t, n).result.some((o) => o.value === e && o.indeterminate);
}
const $v = gl(Ov);
function Cu(e, t, n, o = {}) {
  return t.forEach((r) => {
    o[r.value] = r.value in e ? e[r.value] : r.value === n, Array.isArray(r.children) && Cu(e, r.children, n, o);
  }), o;
}
function _v(e, t, n) {
  if (n) return e;
  const o = [];
  return e.forEach((r) => o.push(...jr(r, t))), Array.from(new Set(o));
}
function ju(e) {
  const t = [];
  for (const n of e)
    t.push(n.value), Array.isArray(n.children) && n.children.length > 0 && t.push(...ju(n.children));
  return t;
}
function ku({ initialSelectedState: e = [], expandedState: t, initialCheckedState: n = [], checkedState: o, initialExpandedState: r = {}, selectedState: s, multiple: a = !1, onNodeCollapse: i, onNodeExpand: c, onCheckedStateChange: d, onSelectedStateChange: f, onExpandedStateChange: p, onLoadChildren: m, checkStrictly: h = !1 } = {}) {
  const [g, y] = u.useState([]), [w, b] = Xe({
    value: t,
    defaultValue: r,
    finalValue: {},
    onChange: p
  }), [k, C] = Xe({
    value: s,
    defaultValue: e,
    finalValue: [],
    onChange: f
  }), [j, N] = Xe({
    value: o,
    defaultValue: n,
    finalValue: [],
    onChange: d
  }), [T, S] = u.useState(null), v = u.useRef(/* @__PURE__ */ new Set()), R = u.useRef(/* @__PURE__ */ new Set()), [D, L] = u.useState([]), [F, _] = u.useState({}), z = u.useCallback((H) => {
    b(Cu(w, H, k)), N(_v(j, H, h)), y(H);
  }, [
    k,
    j,
    w,
    h
  ]), O = u.useCallback(async (H) => {
    if (m && !(v.current.has(H) || R.current.has(H))) {
      v.current.add(H), L(Array.from(v.current)), _((V) => {
        if (!(H in V)) return V;
        const X = { ...V };
        return delete X[H], X;
      });
      try {
        await m(H), R.current.add(H);
      } catch (V) {
        const X = V instanceof Error ? V : new Error(String(V));
        _((ie) => ({
          ...ie,
          [H]: X
        }));
      } finally {
        v.current.delete(H), L(Array.from(v.current));
      }
    }
  }, [m]), M = u.useCallback((H) => {
    if (!m) return;
    const V = Po(H, g);
    V && V.hasChildren && !Array.isArray(V.children) && O(H);
  }, [
    m,
    g,
    O
  ]), $ = u.useCallback((H) => {
    const V = {
      ...w,
      [H]: !w[H]
    };
    V[H] ? c?.(H) : i?.(H), V[H] && M(H), b(V);
  }, [
    i,
    c,
    w,
    M
  ]), I = u.useCallback((H) => {
    w[H] !== !1 && i?.(H), b({
      ...w,
      [H]: !1
    });
  }, [i, w]), A = u.useCallback((H) => {
    w[H] !== !0 && c?.(H), M(H), b({
      ...w,
      [H]: !0
    });
  }, [
    c,
    w,
    M
  ]), B = u.useCallback(() => {
    const H = { ...w };
    Object.keys(H).forEach((V) => {
      H[V] = !0, M(V);
    }), b(H);
  }, [w, M]), W = u.useCallback(() => {
    const H = { ...w };
    Object.keys(H).forEach((V) => {
      H[V] = !1;
    }), b(H);
  }, [w]), U = u.useCallback((H) => {
    if (!a)
      return k.includes(H) ? (S(null), []) : (S(H), [H]);
    if (k.includes(H))
      return S(null), k.filter((V) => V !== H);
    S(H), C([...k, H]);
  }, [k]), Z = u.useCallback((H) => {
    S(H), C(a ? k.includes(H) ? k : [...k, H] : [H]);
  }, [k]), le = u.useCallback((H) => {
    T === H && S(null), C(k.filter((V) => V !== H));
  }, [k]), ue = u.useCallback(() => {
    C([]), S(null);
  }, []), se = u.useCallback((H) => {
    if (h)
      j.includes(H) || N([...j, H]);
    else {
      const V = jr(H, g);
      N(Array.from(/* @__PURE__ */ new Set([...j, ...V])));
    }
  }, [
    g,
    j,
    h
  ]), ee = u.useCallback((H) => {
    if (h) N(j.filter((V) => V !== H));
    else {
      const V = jr(H, g);
      N(j.filter((X) => !V.includes(X)));
    }
  }, [
    g,
    j,
    h
  ]), pe = u.useCallback(() => {
    N(h ? ju(g) : Su(g));
  }, [g, h]), q = u.useCallback(() => {
    N([]);
  }, []), K = u.useCallback(() => h ? j.map((H) => {
    const V = Po(H, g);
    return {
      checked: !0,
      indeterminate: !1,
      value: H,
      hasChildren: V ? Array.isArray(V.children) && V.children.length > 0 || !!V.hasChildren : !1
    };
  }) : is(g, j).result, [
    h,
    j,
    g
  ]), ae = u.useCallback((H) => h ? j.includes(H) : Lv(H, g, j), [
    h,
    j,
    g
  ]), be = u.useCallback((H) => h ? !1 : $v(H, g, j), [
    h,
    j,
    g
  ]), fe = u.useCallback((H) => D.includes(H), [D]), Se = u.useCallback((H) => F[H] || null, [F]), te = u.useCallback((H) => {
    R.current.delete(H), _((V) => {
      if (!(H in V)) return V;
      const X = { ...V };
      return delete X[H], X;
    });
  }, []);
  return u.useMemo(() => ({
    checkStrictly: h,
    multiple: a,
    expandedState: w,
    selectedState: k,
    checkedState: j,
    anchorNode: T,
    initialize: z,
    toggleExpanded: $,
    collapse: I,
    expand: A,
    expandAllNodes: B,
    collapseAllNodes: W,
    setExpandedState: b,
    checkNode: se,
    uncheckNode: ee,
    checkAllNodes: pe,
    uncheckAllNodes: q,
    setCheckedState: N,
    toggleSelected: U,
    select: Z,
    deselect: le,
    clearSelected: ue,
    setSelectedState: C,
    getCheckedNodes: K,
    isNodeChecked: ae,
    isNodeIndeterminate: be,
    isNodeLoading: fe,
    getNodeLoadError: Se,
    loadNode: O,
    invalidateNode: te
  }), [
    h,
    a,
    w,
    k,
    j,
    T,
    z,
    $,
    I,
    A,
    B,
    W,
    b,
    se,
    ee,
    pe,
    q,
    N,
    U,
    Z,
    le,
    ue,
    C,
    K,
    ae,
    be,
    fe,
    Se,
    O,
    te
  ]);
}
function zv(e, t, n) {
  const o = Po(t, e);
  if (!o || !o.children) return !1;
  function r(s) {
    for (const a of s)
      if (a.value === n || a.children && r(a.children)) return !0;
    return !1;
  }
  return r(o.children);
}
function Fv(e, t, n, o) {
  const r = t.getBoundingClientRect(), s = e.clientY - r.top, a = r.height;
  return n ? o ? s < a * 0.5 ? "before" : "inside" : s < a * 0.25 ? "before" : s > a * 0.75 ? "after" : "inside" : s < a * 0.5 ? "before" : "after";
}
const Bv = {
  elementProps: {},
  dragHandleProps: void 0
};
function Vv({ nodeValue: e, hasChildren: t, isExpanded: n, data: o, onDragDrop: r, dragStateRef: s, allowDrop: a, withDragHandle: i }) {
  const [c, d] = u.useState(!1);
  return u.useEffect(() => {
    if (!i || !c) return;
    const y = () => d(!1);
    return window.addEventListener("mouseup", y), () => window.removeEventListener("mouseup", y);
  }, [i, c]), r ? {
    elementProps: {
      draggable: i ? c : !0,
      onDragStart: (y) => {
        if (i && !c) return;
        y.stopPropagation(), y.dataTransfer.effectAllowed = "move", y.dataTransfer.setData("text/plain", e), s.current.draggedValue = e;
        const w = y.currentTarget, b = w.closest("[role=treeitem]");
        b && b.setAttribute("data-dragging", "true"), requestAnimationFrame(() => {
          w.setAttribute("data-dragging", "true");
        });
      },
      onDragOver: (y) => {
        const w = s.current.draggedValue;
        if (!w || w === e || zv(o, w, e)) return;
        const b = y.currentTarget, k = Fv(y, b, t, n);
        if (a && !a({
          draggedNode: w,
          targetNode: e,
          position: k
        })) {
          const j = s.current.currentDropTarget;
          j && j !== b && j.removeAttribute("data-drag-over"), b.removeAttribute("data-drag-over"), s.current.currentDropTarget = null;
          return;
        }
        y.preventDefault(), y.stopPropagation(), y.dataTransfer.dropEffect = "move";
        const C = s.current.currentDropTarget;
        C && C !== b && C.removeAttribute("data-drag-over"), b.setAttribute("data-drag-over", k), s.current.currentDropTarget = b;
      },
      onDragLeave: (y) => {
        const w = y.currentTarget, b = y.relatedTarget;
        b && w.contains(b) || (w.removeAttribute("data-drag-over"), s.current.currentDropTarget === w && (s.current.currentDropTarget = null));
      },
      onDrop: (y) => {
        y.preventDefault(), y.stopPropagation();
        const w = y.currentTarget, b = w.getAttribute("data-drag-over");
        w.removeAttribute("data-drag-over");
        const k = s.current.draggedValue;
        if (k && b && k !== e) {
          const C = {
            draggedNode: k,
            targetNode: e,
            position: b
          };
          (!a || a(C)) && r(C);
        }
        s.current.draggedValue = null, s.current.currentDropTarget = null;
      },
      onDragEnd: (y) => {
        const w = y.currentTarget;
        w.removeAttribute("data-dragging");
        const b = w.closest("[role=treeitem]");
        b && b.removeAttribute("data-dragging");
        const k = s.current.currentDropTarget;
        k && k.removeAttribute("data-drag-over"), s.current.draggedValue = null, s.current.currentDropTarget = null, i && d(!1);
      }
    },
    dragHandleProps: i ? { onMouseDown: () => d(!0) } : void 0
  } : Bv;
}
function yc(e, t, n) {
  if (!e || !t) return [];
  const o = n.indexOf(e), r = n.indexOf(t), s = Math.min(o, r), a = Math.max(o, r);
  return n.slice(s, a + 1);
}
function Hv(e, t) {
  for (let n = e; n && n !== t; ) {
    if (n.style.display === "none") return !1;
    n = n.parentElement;
  }
  return !0;
}
function si({ node: e, getStyles: t, rootIndex: n, controller: o, expandOnClick: r, selectOnClick: s, isSubtree: a, level: i = 1, renderNode: c, flatValues: d, allowRangeSelection: f, expandOnSpace: p, checkOnSpace: m, keepMounted: h, onDragDrop: g, allowDrop: y, withDragHandle: w, dragStateRef: b, data: k }) {
  const C = u.useRef(null), j = Array.isArray(e.children) && e.children.length > 0, N = !!e.hasChildren && !j, T = j || N, S = o.isNodeLoading(e.value), v = o.getNodeLoadError(e.value), R = o.expandedState[e.value] || !1, D = (e.children || []).map((I) => /* @__PURE__ */ l.jsx(si, {
    node: I,
    flatValues: d,
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
    allowDrop: y,
    withDragHandle: w,
    dragStateRef: b,
    data: k
  }, I.value)), { elementProps: L, dragHandleProps: F } = Vv({
    nodeValue: e.value,
    hasChildren: T,
    isExpanded: R,
    data: k,
    onDragDrop: g,
    dragStateRef: b,
    allowDrop: y,
    withDragHandle: w
  }), _ = (I) => {
    if (I.nativeEvent.code === "ArrowRight")
      if (I.stopPropagation(), I.preventDefault(), R) {
        const A = I.currentTarget.querySelector("[role=treeitem]");
        A?.setAttribute("data-focus-ring", "true"), A?.focus();
      } else o.expand(e.value);
    if (I.nativeEvent.code === "ArrowLeft") {
      if (I.stopPropagation(), I.preventDefault(), R && T) o.collapse(e.value);
      else if (a) {
        const A = Co(I.currentTarget, "[role=treeitem]");
        A?.setAttribute("data-focus-ring", "true"), A?.focus();
      }
    }
    if (I.nativeEvent.code === "ArrowDown" || I.nativeEvent.code === "ArrowUp") {
      const A = Co(I.currentTarget, "[data-tree-root]");
      if (!A) return;
      I.stopPropagation(), I.preventDefault();
      const B = Array.from(A.querySelectorAll("[role=treeitem]")).filter((le) => Hv(le, A)), W = B.indexOf(I.currentTarget);
      if (W === -1) return;
      const U = I.nativeEvent.code === "ArrowDown" ? W + 1 : W - 1, Z = B[U];
      if (Z?.setAttribute("data-focus-ring", "true"), Z?.focus(), I.shiftKey) {
        const le = B[U];
        le && o.setSelectedState(yc(o.anchorNode, le.dataset.value, d));
      }
    }
    I.nativeEvent.code === "Space" && (p && (I.stopPropagation(), I.preventDefault(), o.toggleExpanded(e.value)), m && (I.stopPropagation(), I.preventDefault(), o.isNodeChecked(e.value) ? o.uncheckNode(e.value) : o.checkNode(e.value)));
  }, z = (I) => {
    I.stopPropagation(), f && I.shiftKey && o.anchorNode ? (o.setSelectedState(yc(o.anchorNode, e.value, d)), C.current?.focus()) : (r && o.toggleExpanded(e.value), s && o.select(e.value), C.current?.focus());
  }, O = o.selectedState.includes(e.value), M = {
    ...t("label"),
    onClick: z,
    "data-selected": O || void 0,
    "data-value": e.value,
    ...L
  }, $ = R && S && D.length === 0;
  return /* @__PURE__ */ l.jsxs("li", {
    ...t("node", { style: { "--label-offset": `calc(var(--level-offset) * ${i - 1})` } }),
    role: "treeitem",
    "aria-selected": O,
    "data-value": e.value,
    "data-selected": O || void 0,
    "data-level": i,
    tabIndex: n === 0 ? 0 : -1,
    onKeyDown: _,
    onBlur: (I) => {
      I.currentTarget.contains(I.relatedTarget) || I.currentTarget.removeAttribute("data-focus-ring");
    },
    ref: C,
    children: [
      typeof c == "function" ? c({
        node: e,
        level: i,
        selected: O,
        isRoot: i === 1,
        tree: o,
        expanded: R,
        hasChildren: T,
        isLoading: S,
        loadError: v,
        elementProps: M,
        dragHandleProps: F
      }) : /* @__PURE__ */ l.jsx("div", {
        ...M,
        children: e.label
      }),
      $ && /* @__PURE__ */ l.jsx(Q, {
        component: "ul",
        role: "group",
        ...t("subtree"),
        "data-level": i,
        children: /* @__PURE__ */ l.jsx("li", {
          ...t("node", { style: { "--label-offset": `calc(var(--level-offset) * ${i})` } }),
          children: /* @__PURE__ */ l.jsx("div", {
            ...t("label"),
            children: /* @__PURE__ */ l.jsx(Cf, {
              size: 16,
              style: { marginInlineStart: 4 }
            })
          })
        })
      }),
      h && D.length > 0 ? /* @__PURE__ */ l.jsx(u.Activity, {
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
si.displayName = "@mantine/core/TreeNode";
var Eu = {
  root: "m_f698e191",
  subtree: "m_75f3ecf",
  node: "m_f6970eb1",
  label: "m_dc283425",
  flatLine: "m_c03b303c",
  flatLineClosing: "m_bf7448d9"
};
function Ru(e) {
  return e.reduce((t, n) => (t.push(n.value), n.children && t.push(...Ru(n.children)), t), []);
}
const Wv = {
  expandOnClick: !0,
  allowRangeSelection: !0,
  expandOnSpace: !0
}, Nu = $e((e, { levelOffset: t }) => ({ root: { "--level-offset": ca(t) } })), cs = ce((e) => {
  const t = J("Tree", Wv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, data: c, expandOnClick: d, tree: f, renderNode: p, selectOnClick: m, clearSelectionOnOutsideClick: h, allowRangeSelection: g, expandOnSpace: y, levelOffset: w, checkOnSpace: b, keepMounted: k, onDragDrop: C, allowDrop: j, withDragHandle: N, withLines: T, attributes: S, ref: v, ...R } = t, D = ku(), L = f || D, F = u.useRef({
    draggedValue: null,
    currentDropTarget: null
  }), _ = Me({
    name: "Tree",
    classes: Eu,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: S,
    vars: i,
    varsResolver: Nu
  }), z = cl(() => h && L.clearSelected()), O = _e(v, z), M = u.useMemo(() => Ru(c), [c]);
  u.useEffect(() => {
    L.initialize(c);
  }, [c]);
  const $ = c.map((I, A) => /* @__PURE__ */ l.jsx(si, {
    node: I,
    getStyles: _,
    rootIndex: A,
    expandOnClick: d,
    selectOnClick: m,
    controller: L,
    renderNode: p,
    flatValues: M,
    allowRangeSelection: g,
    expandOnSpace: y,
    checkOnSpace: b,
    keepMounted: k,
    onDragDrop: C,
    allowDrop: j,
    withDragHandle: N,
    dragStateRef: F,
    data: c
  }, I.value));
  return /* @__PURE__ */ l.jsx(Q, {
    component: "ul",
    ref: O,
    ..._("root"),
    ...R,
    role: "tree",
    "aria-multiselectable": L.multiple,
    "data-tree-root": !0,
    "data-with-lines": T || void 0,
    children: $
  });
});
cs.displayName = "@mantine/core/Tree";
cs.classes = Eu;
cs.varsResolver = Nu;
function ai() {
  window.location.pathname !== "/login.html" && window.location.replace("/login.html");
}
function Oe(e) {
  return e.layers ?? [];
}
function Ue(e) {
  return e.version ?? 0;
}
class ut extends Error {
  code;
  details;
  constructor(t, n, o) {
    super(n), this.name = "ApiError", this.code = t, this.details = o;
  }
}
async function Ee(e, t) {
  const n = await fetch(e, t);
  if (n.status === 401)
    throw ai(), new ut("unauthorized", "this server needs an access token", null);
  if (!n.ok) {
    let o = `http${n.status}`, r = n.statusText, s = null;
    try {
      const a = await n.json();
      a?.error && (o = a.error.code ?? o, r = a.error.message ?? r, s = a.error.details ?? null);
    } catch {
    }
    throw new ut(o, r, s);
  }
  if (n.status !== 204)
    return await n.json();
}
async function Pu(e = "", t = 200) {
  const n = new URLSearchParams({ limit: String(t) });
  return e && n.set("query", e), (await Ee(
    `/api/projects?${n.toString()}`
  )).projects;
}
async function Uv(e = 8) {
  return (await Ee(
    `/api/projects/recent?limit=${e}`
  )).projects;
}
async function qv(e) {
  return Ee(`/api/projects/${encodeURIComponent(e)}`);
}
function Kv(e) {
  return `/api/projects/${encodeURIComponent(e)}/thumbnail.png`;
}
async function Xv(e, t, n, o, r) {
  return Ee("/api/projects", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: e, width: t, height: n, background: o, name: r })
  });
}
async function Yv(e, t) {
  return Ee(
    `/api/projects/${encodeURIComponent(e)}/rename`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: t })
    }
  );
}
async function Gv(e) {
  return Ee(`/api/projects/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
async function Zv(e) {
  return Ee(`/api/projects/${encodeURIComponent(e)}/document`);
}
async function Jv(e, t) {
  return (await Ee(
    `/api/projects/${encodeURIComponent(e)}/recover-lock`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ expectedPid: t })
    }
  )).unlocked;
}
async function Qv(e, t = 100) {
  const n = new URLSearchParams({ tail: String(t) });
  return Ee(`/api/projects/${encodeURIComponent(e)}/history?${n.toString()}`);
}
async function lo(e, t, n, o = !1) {
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
async function ey(e, t, n, o) {
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
async function ty(e) {
  return Ee(`/api/projects/${encodeURIComponent(e)}/undo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ actor: { kind: "human", name: "reference UI" } })
  });
}
async function ny(e) {
  return Ee(`/api/projects/${encodeURIComponent(e)}/redo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ actor: { kind: "human", name: "reference UI" } })
  });
}
async function oy(e, t, n) {
  return Ee(`/api/projects/${encodeURIComponent(e)}/export`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: t, scale: n })
  });
}
async function ry() {
  await Ee("/api/shutdown", { method: "POST" });
}
async function sy() {
  return Ee("/api/version");
}
async function ay() {
  return Ee("/api/agent-access");
}
async function iy() {
  return Ee("/api/agent-sessions");
}
async function cy() {
  return Ee("/api/update-status");
}
async function ly(e) {
  return Ee("/api/update-consent", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ updateCheck: e })
  });
}
async function ii(e, t) {
  const n = await fetch(
    `/api/projects/${encodeURIComponent(e)}/assets?filename=${encodeURIComponent(t.name)}`,
    {
      method: "POST",
      headers: { "content-type": t.type || "application/octet-stream" },
      body: t
    }
  );
  if (n.status === 401)
    throw ai(), new ut("unauthorized", "this server needs an access token", null);
  if (!n.ok) {
    let o = `http${n.status}`, r = n.statusText;
    try {
      const s = await n.json();
      o = s?.error?.code ?? o, r = s?.error?.message ?? r;
    } catch {
    }
    throw new ut(o, r, null);
  }
  return await n.json();
}
const dy = ["fill", "contain", "cover"], bc = 8;
function Tu(e) {
  if (e.type !== "shape") return null;
  const t = e.shape;
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = t.kind;
    if (typeof n == "string") return n;
  }
  return null;
}
function uy(e) {
  if (e.type !== "shape") return 0;
  const t = e.shape;
  if (t && typeof t == "object") {
    const n = t.cornerRadius;
    if (typeof n == "number") return n;
  }
  return 0;
}
const fy = [
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
], xc = [
  "brightness",
  "contrast",
  "saturation",
  "blur",
  "grain",
  "dropShadow"
];
function py(e) {
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
function my(e) {
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
async function hy(e) {
  return (await Ee(
    `/api/projects/${encodeURIComponent(e)}/presets`
  )).presets;
}
function gy(e) {
  const t = {
    opacity: e.opacity ?? 1,
    blendMode: e.blendMode ?? "normal",
    effects: e.effects ?? []
  };
  return e.type === "text" && (t.fontFamily = e.fontFamily, t.fontSize = e.fontSize, t.color = e.color ?? "#000000", t.align = e.align ?? "left", t.lineHeight = e.lineHeight ?? 1.2), e.type === "shape" && (e.fill && (t.fill = e.fill), e.stroke && (t.stroke = e.stroke)), t;
}
async function vy(e) {
  return Ee(`/api/projects/${encodeURIComponent(e)}/slots`);
}
async function yy(e, t, n = 1) {
  return Ee(
    `/api/projects/${encodeURIComponent(e)}/variants`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ variants: t, scale: n })
    }
  );
}
function Au(e, t) {
  return `/api/projects/${encodeURIComponent(e)}/exports/${encodeURIComponent(t)}.png`;
}
async function by() {
  return (await Ee("/api/fonts")).families;
}
function Xs(e, t = "Aa Bb 0123") {
  return `/api/fonts/specimen.png?${new URLSearchParams({
    family: e.family,
    weight: String(e.weight),
    style: e.style,
    hash: e.hash,
    sample: t
  }).toString()}`;
}
async function xy() {
  return (await Ee(
    "/catalogue-specimens/manifest.json"
  )).families;
}
async function wy() {
  const e = await Ee("/api/fonts");
  return { families: e.families ?? [], faces: e.faces ?? [] };
}
async function Sy(e) {
  return Ee(
    `/api/fonts?filename=${encodeURIComponent(e.name)}`,
    {
      method: "POST",
      headers: { "content-type": e.type || "application/octet-stream" },
      body: e
    }
  );
}
async function Cy(e) {
  return Ee(
    `/api/fonts/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function jy() {
  return Ee("/api/fonts/catalogue");
}
async function wc(e) {
  return Ee("/api/fonts/install", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ pack: e })
  });
}
function ky(e, t) {
  return `/api/projects/${encodeURIComponent(e)}/preview.svg?v=${t}`;
}
async function To(e) {
  return URL.createObjectURL(await ls(e));
}
async function ls(e) {
  const t = await fetch(e);
  if (t.status === 401)
    throw ai(), new ut("unauthorized", "this server needs an access token", null);
  if (!t.ok) {
    let n = `http${t.status}`, o = t.statusText, r = null;
    try {
      const s = await t.json();
      s?.error && (n = s.error.code ?? n, o = s.error.message ?? o, r = s.error.details ?? null);
    } catch {
    }
    throw new ut(n, o, r);
  }
  return await t.blob();
}
function Ys(e, t, n = 1, o) {
  const r = new URLSearchParams({ scale: String(n), v: String(t) });
  return o?.only?.length && r.set("only", o.only.join(",")), o?.exclude?.length && r.set("exclude", o.exclude.join(",")), `/api/projects/${encodeURIComponent(e)}/preview.png?${r.toString()}`;
}
async function Iu(e, t, n) {
  const o = new URLSearchParams({ id: t, width: String(n) });
  return Ee(
    `/api/projects/${encodeURIComponent(e)}/text-layout?${o.toString()}`
  );
}
function Ye(e, t = null, n = 0, o = []) {
  for (const r of e)
    o.push({ layer: r, parent: t, depth: n }), r.type === "group" && Ye(r.children ?? [], r.id, n + 1, o);
  return o;
}
function Ao(e) {
  return !e.protected && !e.readOnly && !e.locked;
}
function kr(e) {
  return e.protected ? "protected — no tool can change this layer" : e.readOnly ? "read-only — inspectable but never mutable" : e.locked ? "locked — unlock it to make changes" : null;
}
function Sc(e) {
  return !e.includes("'") && !/[\r\n]/.test(e) ? `'${e}'` : JSON.stringify(e);
}
function Ey(e) {
  const t = ["mcp", "--workspace", e.workspace], n = JSON.stringify(
    { mcpServers: { assemblash: { command: e.executable, args: t } } },
    null,
    2
  ), o = [
    "[mcp_servers.assemblash]",
    `command = ${Sc(e.executable)}`,
    `args = [${t.map(Sc).join(", ")}]`
  ].join(`
`);
  return [
    { id: "json", title: x("agents.jsonTitle"), hint: x("agents.jsonHint"), text: n },
    { id: "codex", title: x("agents.codexTitle"), hint: x("agents.codexHint"), text: o },
    { id: "url", title: x("agents.urlTitle"), hint: x("agents.urlHint"), text: e.mcpUrl }
  ];
}
async function Ry(e) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(e);
    return;
  }
  const t = document.createElement("textarea");
  t.value = e, t.setAttribute("readonly", ""), t.style.position = "fixed", t.style.opacity = "0", document.body.append(t), t.select();
  const n = document.execCommand("copy");
  if (t.remove(), !n) throw new Error(x("agents.copyRefused"));
}
const Cc = "assemblash-agent-hint-v1";
function Ny({
  host: e,
  controller: t
}) {
  Fe();
  const [n, o] = u.useState(null), [r, s] = u.useState(!1), a = u.useRef(e);
  a.current = e, u.useEffect(() => (t.current = (c) => {
    o(c), s(!0);
  }, () => {
    t.current = null;
  }), [t]);
  const i = n === null ? [] : Ey(n);
  return /* @__PURE__ */ l.jsxs(
    st,
    {
      id: "agents-dialog",
      "data-state": r ? "open" : "closed",
      opened: r,
      onClose: () => s(!1),
      title: x("agents.dialogTitle"),
      centered: !0,
      size: "min(720px, calc(100vw - 2rem))",
      padding: "lg",
      trapFocus: !0,
      closeOnEscape: !0,
      returnFocus: !0,
      children: [
        /* @__PURE__ */ l.jsx(Wn, { align: "center", justify: "between", gap: "3", mb: "md", children: /* @__PURE__ */ l.jsxs("div", { children: [
          /* @__PURE__ */ l.jsx(oe, { component: "p", size: "xs", fw: 600, mb: 4, style: { letterSpacing: "0.08em" }, children: x("agents.protocol") }),
          /* @__PURE__ */ l.jsx(ji, { order: 2, size: "h2", m: 0, children: x("agents.dialogTitle") })
        ] }) }),
        /* @__PURE__ */ l.jsx(oe, { component: "p", size: "sm", c: "dimmed", mb: "sm", children: x("agents.introLocal") }),
        /* @__PURE__ */ l.jsx(oe, { component: "p", size: "sm", c: "dimmed", mb: "md", children: x("agents.introConfig") }),
        /* @__PURE__ */ l.jsxs("p", { id: "agents-token", hidden: n?.tokenRequired !== !0, children: [
          x("agents.tokenBeforeCommand"),
          " ",
          /* @__PURE__ */ l.jsx("code", { children: "assemblash token show" }),
          " ",
          x("agents.tokenBetweenCommands"),
          " ",
          /* @__PURE__ */ l.jsx("code", { children: "Authorization: Bearer <token>" }),
          x("agents.tokenAfterCommand")
        ] }),
        /* @__PURE__ */ l.jsx(ye, { id: "agents-blocks", gap: "md", children: i.map((c) => /* @__PURE__ */ l.jsxs(ye, { component: "section", className: "agent-block", "data-block": c.id, gap: "xs", children: [
          /* @__PURE__ */ l.jsxs(Wn, { align: "center", justify: "between", gap: "md", my: "sm", children: [
            /* @__PURE__ */ l.jsx(ji, { order: 3, size: "h4", m: 0, children: c.title }),
            /* @__PURE__ */ l.jsxs(
              ge,
              {
                size: "xs",
                variant: "light",
                className: "agent-copy",
                onClick: () => {
                  Ry(c.text).then(
                    () => a.current.say(x("agents.copied", { title: c.title })),
                    (d) => a.current.say(
                      x("agents.copyError", { error: String(d) }),
                      "error"
                    )
                  );
                },
                children: [
                  /* @__PURE__ */ l.jsx("i", { className: "ph ph-copy", "aria-hidden": "true" }),
                  " ",
                  x("agents.copyButton")
                ]
              }
            )
          ] }),
          /* @__PURE__ */ l.jsx(oe, { component: "p", size: "xs", c: "dimmed", mb: "xs", children: c.hint }),
          /* @__PURE__ */ l.jsx("pre", { className: "agents-config", children: /* @__PURE__ */ l.jsx("code", { children: c.text }) })
        ] }, c.id)) }),
        /* @__PURE__ */ l.jsx(Wn, { justify: "flex-end", gap: "md", mt: "lg", children: /* @__PURE__ */ l.jsx(ge, { id: "agents-done", onClick: () => s(!1), children: x("common.done") }) })
      ]
    }
  );
}
function Py(e) {
  const t = document.createElement("div");
  t.dataset.island = "agents", document.body.append(t);
  const n = { current: null };
  qe("agents", t, /* @__PURE__ */ l.jsx(Ny, { host: e, controller: n }));
  async function o() {
    try {
      const s = await ay();
      n.current?.(s);
    } catch (s) {
      const a = s instanceof ut ? s.message : String(s);
      e.say(x("agents.openError", { error: a }), "error");
      return;
    }
  }
  function r() {
    let s = !1;
    try {
      s = window.localStorage.getItem(Cc) !== null, window.localStorage.setItem(Cc, "shown");
    } catch {
    }
    s || o();
  }
  return { open: o, offerOnFirstRun: r };
}
const Ty = [
  { id: "png", label: "PNG", detail: x("export.pngDetail"), icon: "ph-image" },
  { id: "svg", label: "SVG", detail: x("export.svgDetail"), icon: "ph-file-svg" }
];
function Ay(e, t, n, o) {
  return e === "svg" ? {
    url: ky(t, Ue(n)),
    filename: `${o}.svg`
  } : { url: Au(t, o), filename: `${o}.png` };
}
const On = [
  {
    id: "original",
    label: x("export.original"),
    detail: x("export.documentSize"),
    longEdge: null,
    icon: "ph-frame-corners"
  },
  { id: "2k", label: "2K", detail: x("export.longEdge2k"), longEdge: 2048, icon: "ph-image" },
  { id: "4k", label: "4K", detail: x("export.longEdge4k"), longEdge: 3840, icon: "ph-image-square" },
  { id: "8k", label: x("export.resolution8k"), detail: x("export.longEdge8k"), longEdge: 7680, icon: "ph-sparkle" }
];
function cr(e, t) {
  const n = e.canvas.width, o = e.canvas.height, r = t.longEdge === null ? 1 : t.longEdge / Math.max(n, o);
  return {
    width: Math.max(1, Math.round(n * r)),
    height: Math.max(1, Math.round(o * r)),
    scale: r
  };
}
function Iy(e) {
  const t = window.document.getElementById(e);
  if (!t) throw new Error(`missing element #${e}`);
  return t;
}
function jc(e) {
  return e.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "assemblash-export";
}
function My(e) {
  return e < 1024 ? x("export.bytes", { count: je(e) }) : e < 1024 * 1024 ? `${je(Math.round(e / 102.4) / 10)} KB` : `${je(Math.round(e / (1024 * 1024) * 10) / 10)} MB`;
}
function Dy({ host: e, controller: t }) {
  const [n, o] = u.useState("png"), [r, s] = u.useState("8k"), [a, i] = u.useState("assemblash-export"), [c, d] = u.useState(""), [f, p] = u.useState(!1), [m, h] = u.useState(!1), [g, y] = u.useState(null);
  Fe();
  const w = u.useRef(null), b = e.document(), k = n === "svg", C = On.find((S) => S.id === r) ?? On[0];
  function j() {
    w.current && URL.revokeObjectURL(w.current), w.current = null, y(null);
  }
  function N(S = n, v = r) {
    const R = e.document();
    if (!R) {
      d(x("export.noProject"));
      return;
    }
    const D = S === "svg" ? { width: R.canvas.width, height: R.canvas.height } : cr(R, On.find((L) => L.id === v) ?? On[0]);
    d(`${je(D.width)} × ${je(D.height)} ${x(S === "svg" ? "export.svgSummary" : "export.pngSummary")}`);
  }
  u.useEffect(() => {
    const S = () => {
      const v = e.document(), R = e.project();
      if (!v || !R) {
        e.say(x("export.projectRequired"), "error");
        return;
      }
      j(), i(jc(v.name ?? R)), o("png"), s("8k");
      const D = cr(v, On.find((L) => L.id === "8k"));
      d(`${je(D.width)} × ${je(D.height)} ${x("export.pngSummary")}`), h(!0);
    };
    return t.current = S, window.addEventListener("assemblash:export-open", S), () => {
      window.removeEventListener("assemblash:export-open", S), t.current = null, w.current && URL.revokeObjectURL(w.current);
    };
  }, [t, e]);
  async function T(S) {
    if (S.preventDefault(), !S.currentTarget.reportValidity()) return;
    const v = e.project(), R = e.document();
    if (!v || !R) return;
    const D = n, L = D === "svg" ? { width: R.canvas.width, height: R.canvas.height, scale: 1 } : cr(R, C), F = jc(a);
    i(F);
    const _ = Ay(D, v, R, F);
    await e.guard(x("export.openButton"), async () => {
      j(), p(!0), d(x("export.renderingSize", { width: je(L.width), height: je(L.height) }));
      try {
        const z = D === "svg" ? { width: L.width, height: L.height, bytes: 0 } : await oy(v, F, L.scale), O = await ls(_.url);
        w.current = URL.createObjectURL(O), y({ url: w.current, filename: _.filename });
        const M = D === "svg" ? O.size : z.bytes;
        d(`${je(z.width)} × ${je(z.height)} ${x("export.ready", { format: D.toUpperCase(), size: My(M) })}`), e.say(x("export.exported", { width: je(z.width), height: je(z.height), format: D.toUpperCase() }));
      } finally {
        p(!1);
      }
    });
  }
  return /* @__PURE__ */ l.jsx(st, { id: "export-dialog", "data-state": m ? "open" : "closed", opened: m, onClose: () => {
    h(!1), j();
  }, title: null, withCloseButton: !1, centered: !0, size: "lg", withinPortal: !1, keepMounted: !0, children: /* @__PURE__ */ l.jsx("div", { className: "export-mantine-root", children: /* @__PURE__ */ l.jsx("form", { id: "export-form", onSubmit: (S) => {
    T(S);
  }, children: /* @__PURE__ */ l.jsxs(ye, { gap: "md", children: [
    /* @__PURE__ */ l.jsxs(Te, { justify: "space-between", align: "flex-start", children: [
      /* @__PURE__ */ l.jsxs("div", { children: [
        /* @__PURE__ */ l.jsx(oe, { size: "xs", c: "dimmed", children: x("export.eyebrow") }),
        /* @__PURE__ */ l.jsx(oe, { component: "h2", fw: 700, size: "lg", children: x("export.title") })
      ] }),
      /* @__PURE__ */ l.jsx(ge, { type: "button", variant: "subtle", "aria-label": x("common.close"), onClick: () => {
        h(!1), j();
      }, children: "×" })
    ] }),
    /* @__PURE__ */ l.jsxs(ye, { gap: "xs", children: [
      /* @__PURE__ */ l.jsx(oe, { fw: 600, children: x("export.format") }),
      /* @__PURE__ */ l.jsx(Te, { id: "export-formats", role: "radiogroup", "aria-label": x("export.format"), grow: !0, children: Ty.map((S) => /* @__PURE__ */ l.jsx(Kn, { component: "button", type: "button", "data-format": S.id, role: "radio", "aria-checked": n === S.id, withBorder: !0, p: "sm", bg: n === S.id ? "red.0" : void 0, style: { cursor: "pointer", textAlign: "left" }, onClick: () => {
        n !== S.id && (j(), o(S.id), N(S.id));
      }, children: /* @__PURE__ */ l.jsxs(ye, { gap: 4, children: [
        /* @__PURE__ */ l.jsxs(Te, { gap: "xs", children: [
          /* @__PURE__ */ l.jsx("i", { className: `ph ${S.icon}`, "aria-hidden": "true" }),
          /* @__PURE__ */ l.jsx("b", { children: S.label })
        ] }),
        /* @__PURE__ */ l.jsx(oe, { size: "sm", children: x(S.id === "png" ? "export.pngDetail" : "export.svgDetail") })
      ] }) }, S.id)) })
    ] }),
    /* @__PURE__ */ l.jsxs(ye, { id: "export-resolution-row", "aria-disabled": k, gap: "xs", children: [
      /* @__PURE__ */ l.jsx(oe, { fw: 600, children: x("export.resolution") }),
      /* @__PURE__ */ l.jsx(Te, { id: "export-options", role: "radiogroup", "aria-label": x("export.resolution"), "aria-disabled": k, grow: !0, children: On.map((S) => {
        const v = b ? cr(b, S) : null;
        return /* @__PURE__ */ l.jsx(Kn, { component: "button", type: "button", disabled: k, role: "radio", "aria-checked": r === S.id && !k, withBorder: !0, p: "sm", bg: r === S.id && !k ? "red.0" : void 0, style: { cursor: k ? "not-allowed" : "pointer", textAlign: "left" }, onClick: () => {
          s(S.id), j(), N(n, S.id);
        }, children: /* @__PURE__ */ l.jsxs(ye, { gap: 4, children: [
          /* @__PURE__ */ l.jsxs(Te, { gap: "xs", children: [
            /* @__PURE__ */ l.jsx("i", { className: `ph ${S.icon}`, "aria-hidden": "true" }),
            /* @__PURE__ */ l.jsx("b", { children: S.id === "original" ? x("export.original") : S.id === "8k" ? x("export.resolution8k") : S.label })
          ] }),
          /* @__PURE__ */ l.jsx(oe, { size: "sm", children: v ? `${je(v.width)} × ${je(v.height)}` : x(S.id === "original" ? "export.documentSize" : `export.longEdge${S.id}`) })
        ] }) }, S.id);
      }) })
    ] }),
    /* @__PURE__ */ l.jsx(dt, { id: "export-name", label: x("export.fileName"), value: a, onChange: (S) => i(S.currentTarget.value), pattern: "[A-Za-z0-9_-]+", maxLength: 60, required: !0 }),
    /* @__PURE__ */ l.jsx(oe, { id: "export-summary", "aria-live": "polite", fw: 500, children: c }),
    /* @__PURE__ */ l.jsxs(Te, { justify: "flex-end", children: [
      /* @__PURE__ */ l.jsxs(ge, { id: "export-download", component: "a", href: g?.url ?? "#", download: g?.filename, hidden: !g, variant: "default", children: [
        /* @__PURE__ */ l.jsx("i", { className: "ph ph-download-simple", "aria-hidden": "true" }),
        " ",
        x("common.download")
      ] }),
      /* @__PURE__ */ l.jsx(ge, { id: "export-cancel", type: "button", variant: "default", onClick: () => {
        h(!1), j();
      }, children: x("common.cancel") }),
      /* @__PURE__ */ l.jsxs(ge, { id: "export-confirm", type: "submit", loading: f, value: "default", children: [
        /* @__PURE__ */ l.jsx("i", { className: `ph ${f ? "ph-circle-notch" : "ph-export"}`, "aria-hidden": "true" }),
        " ",
        f ? x("export.rendering") : x("export.confirm", { format: n.toUpperCase() })
      ] })
    ] })
  ] }) }) }) });
}
function Ly(e) {
  const t = Iy("export-dialog-mount"), n = { current: null };
  return qe("export", t, /* @__PURE__ */ l.jsx(Dy, { host: e, controller: n })), { open: () => {
    n.current ? n.current() : queueMicrotask(() => n.current?.());
  } };
}
function kc(e, t, n) {
  const o = n * Math.PI / 180, r = Math.sin(o), s = Math.cos(o);
  return { x: e * s - t * r, y: e * r + t * s };
}
function Gs(e) {
  const t = e.rotation * Math.PI / 180, n = Math.abs(Math.sin(t)), o = Math.abs(Math.cos(t)), r = e.width * o + e.height * n, s = e.width * n + e.height * o, a = e.x + e.width / 2, i = e.y + e.height / 2;
  return {
    x: a - r / 2,
    y: i - s / 2,
    width: r,
    height: s
  };
}
function ci(e) {
  if (e.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  const t = e.map(Gs), n = Math.min(...t.map((a) => a.x)), o = Math.min(...t.map((a) => a.y)), r = Math.max(...t.map((a) => a.x + a.width)), s = Math.max(...t.map((a) => a.y + a.height));
  return { x: n, y: o, width: r - n, height: s - o };
}
function Zs(e, t, n, o) {
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
function Oy(e, t, n, o, r) {
  if (t === 0) return Zs(e, n, o, r);
  const s = kc(o, r, -t), a = Zs(
    { x: 0, y: 0, width: e.width, height: e.height },
    n,
    s.x,
    s.y
  ), i = {
    x: a.x + a.width / 2 - e.width / 2,
    y: a.y + a.height / 2 - e.height / 2
  }, c = kc(i.x, i.y, t), d = e.x + e.width / 2 + c.x, f = e.y + e.height / 2 + c.y;
  return {
    x: d - a.width / 2,
    y: f - a.height / 2,
    width: a.width,
    height: a.height
  };
}
function $y(e, t) {
  const n = e.width ?? 0, o = e.height ?? 0;
  if (!(n > 0) || !(o > 0)) return { width: 300, height: 200 };
  const r = Math.min(t.width / n, t.height / o, 1);
  return {
    width: Math.max(1, Math.round(n * r)),
    height: Math.max(1, Math.round(o * r))
  };
}
function Mu(e, t, n) {
  const o = n.width / Math.max(1, t.width), r = n.height / Math.max(1, t.height), s = n.x + (e.x + e.width / 2 - t.x) * o, a = n.y + (e.y + e.height / 2 - t.y) * r, i = Math.max(1, e.width * o), c = Math.max(1, e.height * r);
  return {
    x: s - i / 2,
    y: a - c / 2,
    width: i,
    height: c
  };
}
const _y = "Aa Bb 0123", $n = /* @__PURE__ */ new Map(), Js = /* @__PURE__ */ new WeakMap(), Qs = /* @__PURE__ */ new WeakSet();
function zy(e) {
  let t = $n.get(e);
  if (!t && (t = ls(e).catch((n) => {
    throw $n.delete(e), n;
  }), $n.set(e, t), $n.size > 64)) {
    const n = $n.keys().next().value;
    n && $n.delete(n);
  }
  return t;
}
function ea(e) {
  for (const t of e.querySelectorAll("img[data-font-specimen]")) {
    const n = Js.get(t);
    n && URL.revokeObjectURL(n), Js.delete(t), Qs.add(t), t.removeAttribute("src");
  }
}
function Fy(e, t, n) {
  const o = window.document.createElement("span");
  o.className = "font-specimen";
  const r = window.document.createElement("img");
  r.className = "font-specimen-image", r.dataset.fontSpecimen = "", r.alt = "", r.setAttribute("aria-hidden", "true");
  const s = window.document.createElement("span");
  s.className = "font-specimen-status", s.hidden = !0, o.append(r, s), e.append(o), zy(t).then((a) => {
    if (!r.isConnected || Qs.has(r)) return;
    const i = URL.createObjectURL(a);
    Js.set(r, i), r.src = i, s.hidden = !0;
  }).catch(() => {
    !r.isConnected || Qs.has(r) || (s.textContent = x(n), s.hidden = !1);
  });
}
function By(e) {
  return e.find((t) => t.weight === 400 && t.style === "normal") ?? e.find((t) => t.style === "normal") ?? e[0] ?? null;
}
function Du(e, t, n = _y) {
  Fy(e, Xs(t, n), "fonts.previewUnavailable");
}
function Lu(e, t) {
  return t.filter((n) => n.family === e).sort((n, o) => n.weight - o.weight);
}
let Vy = 0, Hy = 0;
function Wy(e, t) {
  const n = e.trim().toLowerCase();
  return n ? t.families.find((o) => o.toLowerCase() === n) ?? null : null;
}
function Uy({
  family: e,
  face: t,
  active: n,
  selected: o,
  id: r,
  onMouseDown: s
}) {
  const a = u.useRef(null);
  return u.useLayoutEffect(() => {
    const i = a.current;
    if (i)
      return t && Du(i, t), () => ea(i);
  }, [t]), /* @__PURE__ */ l.jsx("li", { ref: a, id: r, "data-family": e, className: n ? "active" : void 0, "aria-selected": o, onMouseDown: s, children: /* @__PURE__ */ l.jsxs(we.Option, { value: e, active: n, selected: o, children: [
    /* @__PURE__ */ l.jsx("span", { className: "font-selector-family", children: e }),
    /* @__PURE__ */ l.jsx(oe, { component: "span", size: "xs", c: "dimmed", className: "font-selector-faces", children: t ? `${t.style === "italic" ? x("fonts.styleItalic") : x("fonts.styleNormal")} ${je(t.weight)}` : x("fonts.facesUnknown") }),
    !t && /* @__PURE__ */ l.jsx("span", { className: "font-specimen-status", children: x("fonts.previewUnavailable") })
  ] }) });
}
function qy({
  host: e,
  onCommit: t,
  actions: n
}) {
  Fe();
  const [o, r] = u.useState(n.initialFamily), [s, a] = u.useState(!1), [i, c] = u.useState(n.initialDisabled), [d, f] = u.useState(-1), p = u.useRef(null), m = u.useRef(""), h = u.useMemo(() => `font-selector-options-${++Hy}`, []), g = Ba({
    loop: !0,
    onDropdownClose: () => f(-1)
  }), y = e.store(), w = o.trim().toLowerCase(), b = w ? y.families.filter((v) => v.toLowerCase().includes(w)) : y.families, k = u.useCallback(() => {
    g.closeDropdown(), f(-1);
  }, [g]), C = u.useCallback((v) => {
    m.current = v, r(v), a(!1), k(), p.current?.blur(), t(v);
  }, [k, t]), j = u.useCallback(() => {
    k();
    const v = p.current?.value.trim() ?? "";
    if (!v || v.toLowerCase() === m.current.toLowerCase()) return;
    const R = Wy(v, e.store());
    if (!R) {
      a(!0);
      return;
    }
    m.current = R, r(R), a(!1), t(R);
  }, [k, e, t]), N = u.useCallback(() => {
    r(p.current?.value ?? ""), a(!1), f(-1), g.openDropdown();
  }, [g]), T = u.useCallback((v) => {
    p.current = v, v && (v.onfocus = () => zt.flushSync(() => N()), v.onblur = j, v.oninput = () => {
      zt.flushSync(() => {
        r(v.value), a(!1), f(-1), g.openDropdown();
      });
    }, v.onkeydown = (R) => zt.flushSync(() => S(R)));
  }, [n, j, N, S]);
  n.setFamily = (v) => {
    m.current = v, r(v), a(!1);
  }, n.setDisabled = (v) => {
    c(v), v && k();
  };
  function S(v) {
    if (v.key === "ArrowDown" || v.key === "ArrowUp") {
      v.preventDefault(), g.dropdownOpened || g.openDropdown(), b.length && f((R) => {
        const D = v.key === "ArrowDown" ? 1 : -1;
        return (R + D + b.length) % b.length;
      });
      return;
    }
    if (v.key === "Enter" && g.dropdownOpened && d >= 0) {
      const R = b[d];
      R && (v.preventDefault(), C(R));
      return;
    }
    v.key === "Escape" && g.dropdownOpened && (v.preventDefault(), v.stopPropagation(), k());
  }
  return u.useLayoutEffect(() => {
    d < 0 || document.getElementById(`${h}-${d}`)?.scrollIntoView({ block: "nearest" });
  }, [d, h]), /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
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
            dt,
            {
              ref: T,
              value: o,
              autoComplete: "off",
              disabled: i,
              role: "combobox",
              "aria-autocomplete": "list",
              "aria-label": x("editor.fontFamily"),
              "aria-expanded": g.dropdownOpened,
              "aria-controls": h,
              "aria-activedescendant": d >= 0 ? `${h}-${d}` : void 0,
              onChange: (v) => {
                r(v.currentTarget.value), a(!1), f(-1), g.openDropdown();
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
                /* @__PURE__ */ l.jsx(oe, { component: "p", size: "xs", fw: 700, c: "dimmed", id: `${h}-heading`, className: "font-selector-heading", "data-i18n": "fonts.selectorHeading", children: x("fonts.selectorHeading") }),
                /* @__PURE__ */ l.jsxs(we.Options, { id: h, role: "listbox", children: [
                  b.map((v, R) => {
                    const D = Lu(v, y.faces);
                    return /* @__PURE__ */ l.jsx(
                      Uy,
                      {
                        id: `${h}-${R}`,
                        family: v,
                        face: By(D),
                        active: R === d,
                        selected: R === d,
                        onMouseDown: (L) => {
                          L.preventDefault(), C(v);
                        }
                      },
                      v
                    );
                  }),
                  b.length === 0 && /* @__PURE__ */ l.jsx(we.Empty, { className: "font-selector-none", children: /* @__PURE__ */ l.jsx(oe, { component: "span", size: "xs", c: "dimmed", "data-i18n": "fonts.noFamilyMatches", children: x("fonts.noFamilyMatches") }) })
                ] })
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ l.jsx(oe, { component: "p", size: "xs", c: "dimmed", className: "font-selector-message", "data-i18n": "fonts.notInstalled", hidden: !s, children: x("fonts.notInstalled") })
  ] });
}
function Ky(e, t) {
  const n = window.document.createElement("span");
  n.className = "font-selector";
  const o = {
    initialFamily: "",
    initialDisabled: !1
  }, r = qe(
    `font-selector-${++Vy}`,
    n,
    /* @__PURE__ */ l.jsx(qy, { host: e, onCommit: t, actions: o })
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
const Ec = "Aa Bb 0123";
function mo(e) {
  if (e.length <= 1) return e[0] ?? "";
  const t = pa();
  return new Intl.ListFormat(t === "pseudo" ? "en" : t, {
    style: "long",
    type: "conjunction"
  }).format(e);
}
function Rc(e) {
  const t = e / 1048576;
  return t >= 10 ? `${je(Math.round(t))} MB` : `${je(Math.max(0.1, Math.round(t * 10) / 10))} MB`;
}
const _n = /* @__PURE__ */ new Map();
function Xy(e) {
  let t = _n.get(e);
  if (!t && (t = ls(e).catch((n) => {
    throw _n.delete(e), n;
  }), _n.set(e, t), _n.size > 64)) {
    const n = _n.keys().next().value;
    n && _n.delete(n);
  }
  return t;
}
function Nc({
  url: e,
  unavailable: t,
  generation: n
}) {
  const [o, r] = u.useState(""), [s, a] = u.useState(!1);
  return u.useEffect(() => {
    let i = !0, c = "";
    return r(""), a(!1), Xy(e).then((d) => {
      i && (c = URL.createObjectURL(d), r(c));
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
    /* @__PURE__ */ l.jsx("span", { className: "font-specimen-status", hidden: !s, children: x(t) })
  ] });
}
function Yy({ host: e, controller: t }) {
  const [n, o] = u.useState([]), [r, s] = u.useState([]), [a, i] = u.useState(Ec), [c, d] = u.useState(Ec), [f, p] = u.useState([]), [m, h] = u.useState(null), [g, y] = u.useState({}), [w, b] = u.useState(!1), [k, C] = u.useState(""), [j, N] = u.useState(!1), [T, S] = u.useState(0), [v, R] = u.useState(null), D = Fe(), [L, F] = u.useState(!0), _ = u.useRef(n), z = u.useRef(null), O = u.useRef(null), M = u.useRef(void 0);
  _.current = n;
  const $ = u.useCallback((q, K) => {
    _.current = q, o(q), s(K), e.fontsChanged({ families: q, faces: K });
  }, [e]), I = u.useCallback(async () => {
    F(!0);
    const q = await wy();
    $([...q.families], [...q.faces]);
  }, [$]);
  u.useLayoutEffect(() => (t.reload = I, t.focusInstall = () => z.current?.focus(), t.hasFamilies = () => _.current.length > 0, t.releaseSamples = () => {
    F(!1), S((q) => q + 1);
  }, I(), () => {
    window.clearTimeout(M.current), t.reload = async () => {
    }, t.focusInstall = () => {
    }, t.hasFamilies = () => !1, t.releaseSamples = () => {
    };
  }), [t, I]);
  const A = u.useCallback(async () => {
    if (m) return m;
    const q = await jy();
    return h(q), q;
  }, [m]);
  u.useEffect(() => {
    A().catch(() => h(null));
  }, [A]);
  const B = u.useCallback(async () => {
    try {
      const q = await A(), K = q.packs.default ?? [], ae = q.families.filter((be) => K.includes(be.family)).reduce((be, fe) => be + fe.bytes, 0);
      C(K.length ? x("fonts.defaultPackDescription", { names: mo(K), bytes: Rc(ae) }) : x("fonts.noDefaultPack")), N(!1);
    } catch (q) {
      C(q instanceof ut ? x("fonts.packDescribeErrorCode", { error: q.message, code: q.code }) : x("fonts.packDescribeError")), N(!0);
    }
  }, [A]);
  u.useEffect(() => {
    n.length || B();
  }, [n.length, B]), u.useEffect(() => {
    let q = !0;
    return xy().then((K) => {
      q && y(K);
    }).catch(() => {
      q && y({});
    }), () => {
      q = !1;
    };
  }, []);
  const W = u.useCallback(async () => {
    e.project() && await e.refresh();
  }, [e]), U = async () => {
    await e.guard(x("fonts.installFonts"), async () => {
      b(!0), e.say(x("fonts.downloadingDefault"));
      try {
        const q = await wc("default");
        await I(), await W(), e.say(x("fonts.installedFamilies", { names: mo(q.families) }));
      } finally {
        b(!1);
      }
    });
  }, Z = (q) => {
    e.guard(x("fonts.installNamedPack", { pack: q }), async () => {
      try {
        await wc(q), await I(), await W(), e.say(x("fonts.installedNamedPack", { pack: q }));
      } finally {
        S((K) => K + 1);
      }
    });
  }, le = (q) => {
    const K = [...q ?? []];
    O.current && (O.current.value = ""), K.length && e.guard(x("fonts.importFont"), async () => {
      p([]);
      let ae = 0;
      const be = [];
      for (const Se of K)
        try {
          const te = await Sy(Se);
          ae += 1;
          const H = [...new Set(te.imported.map((V) => V.family))];
          be.push(H.length ? `${Se.name} → ${mo(H)}` : x("fonts.importedFile", { file: Se.name }));
        } catch (te) {
          be.push(te instanceof ut ? `${Se.name}: ${te.message} (${te.code})` : `${Se.name}: ${String(te)}`);
        }
      p(be), await I(), ae && await W();
      const fe = K.length - ae;
      ae ? e.say(Tt("fonts.importResult", ae, {
        refused: fe ? Tt("fonts.refusedCount", fe) : ""
      })) : e.say(x("fonts.noneImported", { refused: Tt("fonts.refusedCount", fe) }), "error");
    });
  }, ue = (q) => {
    window.confirm(x("fonts.confirmRemove", { family: q })) && e.guard(x("fonts.removeAction", { family: q }), async () => {
      p([]);
      const K = await Cy(q);
      p([Tt("fonts.removedFiles", K.removed, { family: q })]), await I(), await W(), e.say(x("fonts.removedFromStore", { family: q }));
    });
  }, se = (q) => {
    d(q), window.clearTimeout(M.current), M.current = window.setTimeout(() => {
      const K = q.trim();
      !K || [...K].some((ae) => /[\u0000-\u001f\u007f]/u.test(ae)) || i(K);
    }, 180);
  }, ee = m ? ["text", "display", "mono", ...Object.keys(m.packs).filter((q) => !["default", "text", "display", "mono"].includes(q)).sort()] : [], pe = n.length === 0;
  return /* @__PURE__ */ l.jsxs(ye, { gap: "md", "data-testid": "font-manager", children: [
    /* @__PURE__ */ l.jsx(Q, { id: "font-empty", "data-testid": "font-empty", hidden: !pe, children: /* @__PURE__ */ l.jsxs(ye, { gap: "sm", children: [
      /* @__PURE__ */ l.jsx(oe, { component: "p", size: "sm", children: x("fonts.noneInstalled") }),
      /* @__PURE__ */ l.jsx(oe, { component: "p", className: "font-install-copy", size: "sm", c: "dimmed", children: x("fonts.defaultPackCopy") }),
      /* @__PURE__ */ l.jsx(
        ge,
        {
          id: "install-default",
          "data-testid": "install-default",
          ref: z,
          disabled: w || m !== null && (m.packs.default ?? []).length === 0,
          onClick: () => {
            U();
          },
          children: /* @__PURE__ */ l.jsxs(ye, { gap: 2, children: [
            /* @__PURE__ */ l.jsx("span", { id: "install-default-label", children: w ? x("fonts.installingDefault") : x("fonts.installDefaultPack") }),
            /* @__PURE__ */ l.jsx(oe, { id: "install-default-detail", component: "span", size: "xs", c: j ? "red" : void 0, children: k })
          ] })
        }
      )
    ] }) }),
    /* @__PURE__ */ l.jsx(
      dt,
      {
        className: "font-sample-field",
        ref: (q) => {
          q && (q.oninput = () => se(q.value));
        },
        "data-testid": "font-sample",
        label: x("fonts.customSample"),
        "aria-label": x("fonts.customSample"),
        value: c,
        maxLength: 64,
        hidden: pe,
        onChange: (q) => se(q.currentTarget.value)
      }
    ),
    /* @__PURE__ */ l.jsx("ul", { id: "font-list", "data-testid": "font-list", className: "font-list", hidden: pe, children: n.map((q) => {
      const K = r.filter((fe) => fe.family === q), ae = K.map(
        (fe) => `${fe.style === "italic" ? x("fonts.styleItalic") : x("fonts.styleNormal")} ${je(fe.weight)}`
      ).join(", "), be = K.find((fe) => fe.weight === 400 && fe.style === "normal") ?? K.find((fe) => fe.style === "normal") ?? K[0];
      return /* @__PURE__ */ l.jsxs("li", { className: "font-family", "data-family": q, children: [
        /* @__PURE__ */ l.jsxs(Te, { justify: "space-between", align: "center", wrap: "nowrap", children: [
          /* @__PURE__ */ l.jsxs("div", { className: "font-family-text", children: [
            /* @__PURE__ */ l.jsx("strong", { children: q }),
            /* @__PURE__ */ l.jsx("span", { className: "font-faces", children: Tt("fonts.faceCount", K.length, { described: ae }) })
          ] }),
          /* @__PURE__ */ l.jsx(
            ge,
            {
              size: "xs",
              color: "red",
              variant: "light",
              className: "small danger-action",
              "data-remove-family": q,
              "data-testid": `remove-font-${q}`,
              "aria-label": x("fonts.removeFamily", { family: q }),
              onClick: () => ue(q),
              children: x("fonts.removeButton")
            }
          )
        ] }),
        L && be ? /* @__PURE__ */ l.jsx(
          Nc,
          {
            url: Xs(be, a),
            unavailable: "fonts.previewUnavailable",
            generation: T + D
          }
        ) : L ? /* @__PURE__ */ l.jsx("span", { className: "font-specimen-status", children: x("fonts.previewUnavailable") }) : null
      ] }, q);
    }) }),
    /* @__PURE__ */ l.jsx(
      Ne,
      {
        id: "font-pack-section",
        "data-testid": "font-pack-section",
        className: "font-pack-section",
        hidden: ee.length === 0,
        value: v,
        onChange: R,
        keepMounted: !0,
        keepMountedMode: "display-none",
        children: /* @__PURE__ */ l.jsxs(Ne.Item, { value: "packs", children: [
          /* @__PURE__ */ l.jsx(Ne.Control, { children: x("fonts.morePacks") }),
          /* @__PURE__ */ l.jsx(Ne.Panel, { children: /* @__PURE__ */ l.jsx(ye, { id: "font-pack-options", "data-testid": "font-pack-options", className: "font-pack-options", gap: "sm", children: ee.map((q) => {
            const K = m?.packs[q] ?? [], ae = K.filter((fe) => !n.includes(fe)), be = m?.families.filter((fe) => ae.includes(fe.family)).reduce((fe, Se) => fe + Se.bytes, 0) ?? 0;
            return /* @__PURE__ */ l.jsx(
              ge,
              {
                "data-pack": q,
                "data-testid": `font-pack-${q}`,
                className: "font-pack-button",
                variant: "default",
                disabled: ae.length === 0,
                onClick: () => Z(q),
                children: /* @__PURE__ */ l.jsxs(ye, { gap: "xs", align: "stretch", children: [
                  /* @__PURE__ */ l.jsx("strong", { children: x("fonts.namedPackTitle", { pack: q }) }),
                  /* @__PURE__ */ l.jsx(oe, { component: "span", size: "xs", c: "dimmed", children: ae.length ? x("fonts.namedPackDownload", { names: mo(K), bytes: Rc(be) }) : x("fonts.namedPackInstalled", { names: mo(K) }) }),
                  /* @__PURE__ */ l.jsx(Te, { gap: "xs", wrap: "wrap", className: "font-pack-samples", children: K.map((fe) => {
                    const Se = r.filter((V) => V.family === fe).find((V) => V.weight === 400 && V.style === "normal") ?? r.find((V) => V.family === fe), te = g[fe], H = Se ? Xs(Se) : te ? `/catalogue-specimens/${te.src.replace(/^\.\//u, "")}` : null;
                    return /* @__PURE__ */ l.jsxs("span", { className: "font-pack-family", children: [
                      /* @__PURE__ */ l.jsx(oe, { component: "span", size: "xs", fw: 700, className: "font-pack-family-name", children: fe }),
                      L && H ? /* @__PURE__ */ l.jsx(
                        Nc,
                        {
                          url: H,
                          unavailable: Se ? "fonts.previewUnavailable" : "fonts.cataloguePreviewUnavailable",
                          generation: T + D
                        }
                      ) : H ? null : /* @__PURE__ */ l.jsx("span", { className: "font-specimen-status", children: x("fonts.cataloguePreviewUnavailable") })
                    ] }, fe);
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
      ge,
      {
        id: "import-font",
        "data-testid": "import-font",
        variant: "default",
        leftSection: /* @__PURE__ */ l.jsx("i", { className: "ph ph-upload-simple", "aria-hidden": "true" }),
        onClick: () => O.current?.click(),
        children: x("fonts.importFile")
      }
    ),
    /* @__PURE__ */ l.jsx(
      "input",
      {
        id: "font-file",
        ref: O,
        type: "file",
        accept: ".ttf,.otf,.ttc,.otc,.woff,.woff2",
        multiple: !0,
        hidden: !0,
        onChange: (q) => le(q.currentTarget.files)
      }
    ),
    /* @__PURE__ */ l.jsx("div", { id: "font-feedback", "data-testid": "font-feedback", className: "font-feedback", "aria-live": "polite", children: f.map((q, K) => /* @__PURE__ */ l.jsx("p", { children: q }, `${K}-${q}`)) })
  ] });
}
function Gy(e, t) {
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
  return qe("font-manager", t, /* @__PURE__ */ l.jsx(Yy, { host: e, controller: n })), {
    reload: () => n.reload(),
    focusInstall: () => n.focusInstall(),
    hasFamilies: () => n.hasFamilies(),
    releaseSamples: () => n.releaseSamples()
  };
}
class Zy {
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
const Jy = [
  { size: "1080x1080", width: 1080, height: 1080, label: "common.square" },
  { size: "1920x1080", width: 1920, height: 1080, label: "common.landscape" },
  { size: "1080x1350", width: 1080, height: 1350, label: "common.portrait" },
  { size: "1080x1920", width: 1080, height: 1920, label: "common.story" }
];
function Qy({
  host: e,
  controller: t
}) {
  const [n, o] = u.useState(!1), [r, s] = u.useState(""), [a, i] = u.useState(1080), [c, d] = u.useState(1080), [f, p] = u.useState("#ffffff"), [m, h] = u.useState("1080x1080"), [g, y] = u.useState(!1);
  Fe(), u.useEffect(() => (t.current = () => {
    s(""), i(1080), d(1080), p("#ffffff"), h("1080x1080"), o(!0);
  }, () => {
    t.current = null;
  }), [t]);
  async function w(b) {
    b.preventDefault();
    const k = r.trim(), C = Number(a), j = Number(c);
    if (!(!k || !Number.isFinite(C) || !Number.isFinite(j)) && !(C <= 0 || j <= 0 || g)) {
      y(!0);
      try {
        await e.create(k, C, j, f) && o(!1);
      } finally {
        y(!1);
      }
    }
  }
  return /* @__PURE__ */ l.jsx(
    st,
    {
      id: "new-project-dialog",
      "data-state": n ? "open" : "closed",
      opened: n,
      onClose: () => o(!1),
      title: x("dialogs.newProjectTitle"),
      centered: !0,
      size: "lg",
      children: /* @__PURE__ */ l.jsx("form", { id: "new-project-form", onSubmit: (b) => {
        w(b);
      }, children: /* @__PURE__ */ l.jsxs(ye, { gap: "md", children: [
        /* @__PURE__ */ l.jsx(
          dt,
          {
            id: "new-project-name",
            label: x("common.name"),
            placeholder: x("dialogs.projectNamePlaceholder"),
            value: r,
            onChange: (b) => s(b.currentTarget.value),
            autoComplete: "off",
            required: !0,
            "data-autofocus": !0
          }
        ),
        /* @__PURE__ */ l.jsxs(ye, { gap: "xs", children: [
          /* @__PURE__ */ l.jsx(oe, { fw: 600, children: x("canvas.label") }),
          /* @__PURE__ */ l.jsx(ol, { id: "canvas-presets", cols: { base: 2, sm: 4 }, children: Jy.map((b) => /* @__PURE__ */ l.jsx(
            ge,
            {
              type: "button",
              "data-size": b.size,
              variant: m === b.size ? "light" : "default",
              onClick: () => {
                i(b.width), d(b.height), h(b.size);
              },
              children: x(b.label)
            },
            b.size
          )) })
        ] }),
        /* @__PURE__ */ l.jsxs(Te, { grow: !0, align: "start", children: [
          /* @__PURE__ */ l.jsx(
            No,
            {
              id: "new-project-width",
              label: x("common.width"),
              value: a,
              onChange: (b) => {
                i(b), h("");
              },
              min: 1,
              allowDecimal: !1,
              required: !0
            }
          ),
          /* @__PURE__ */ l.jsx(
            No,
            {
              id: "new-project-height",
              label: x("common.height"),
              value: c,
              onChange: (b) => {
                d(b), h("");
              },
              min: 1,
              allowDecimal: !1,
              required: !0
            }
          ),
          /* @__PURE__ */ l.jsx(
            Wo,
            {
              id: "new-project-background",
              label: x("common.background"),
              value: f,
              onChange: p,
              format: "hex",
              required: !0
            }
          )
        ] }),
        /* @__PURE__ */ l.jsxs(Te, { justify: "flex-end", children: [
          /* @__PURE__ */ l.jsx(ge, { id: "new-project-cancel", type: "button", variant: "default", onClick: () => o(!1), children: x("common.cancel") }),
          /* @__PURE__ */ l.jsx(ge, { id: "create-project-confirm", type: "submit", loading: g, children: x("dialogs.createProject") })
        ] })
      ] }) })
    }
  );
}
function eb(e) {
  const t = document.getElementById("new-project-dialog-mount");
  if (!t) throw new Error("missing element #new-project-dialog-mount");
  const n = { current: null };
  return qe("project-create", t, /* @__PURE__ */ l.jsx(Qy, { host: e, controller: n })), { open: () => n.current?.() };
}
function tb({ controller: e }) {
  const [t, n] = u.useState(null), [o, r] = u.useState(!1);
  Fe();
  const [s, a] = u.useState(""), i = u.useRef(null), c = u.useRef(null), d = u.useRef(null), f = u.useCallback(() => {
    r(!1), n(null), a("");
  }, []), p = u.useCallback((h) => {
    h.preventDefault();
    const g = i.current;
    if (!g?.reportValidity()) return;
    const y = g.value.trim();
    if (!y) return;
    const w = t?.submit;
    f(), w?.(y);
  }, [f, t]), m = u.useCallback((h) => {
    n(h), a(""), r(!0);
  }, []);
  return e.open = m, /* @__PURE__ */ l.jsxs(
    st,
    {
      id: "name-dialog",
      "data-state": o ? "open" : "closed",
      opened: o,
      onClose: f,
      title: t ? x(t.titleKey) : x("dialogs.nameItem"),
      centered: !0,
      size: "min(32rem, calc(100vw - 2rem))",
      padding: "lg",
      trapFocus: !0,
      closeOnEscape: !0,
      closeOnClickOutside: !1,
      returnFocus: !0,
      keepMounted: !0,
      keepMountedMode: "display-none",
      closeButtonProps: { "aria-label": x("common.close") },
      onEnterTransitionEnd: () => i.current?.focus(),
      ref: (h) => {
        h && Object.defineProperty(h, "open", {
          configurable: !0,
          get: () => o
        });
      },
      children: [
        /* @__PURE__ */ l.jsx(oe, { component: "p", size: "xs", fw: 600, mb: "xs", style: { letterSpacing: "0.08em" }, children: x("dialogs.documentSetup") }),
        /* @__PURE__ */ l.jsxs(
          "form",
          {
            ref: c,
            onSubmit: p,
            onKeyDown: (h) => {
              h.key === "Enter" && (h.preventDefault(), c.current && d.current && c.current.requestSubmit(d.current));
            },
            children: [
              /* @__PURE__ */ l.jsx(
                dt,
                {
                  id: "name-dialog-input",
                  ref: i,
                  label: /* @__PURE__ */ l.jsx("span", { id: "name-dialog-label", children: t ? x(t.labelKey) : x("common.name") }),
                  value: s,
                  onChange: (h) => a(h.currentTarget.value),
                  autoComplete: "off",
                  maxLength: 80,
                  required: !0,
                  autoFocus: !0
                }
              ),
              /* @__PURE__ */ l.jsxs(Wn, { justify: "flex-end", gap: "sm", mt: "lg", children: [
                /* @__PURE__ */ l.jsx(ge, { type: "button", variant: "default", onClick: f, children: x("common.cancel") }),
                /* @__PURE__ */ l.jsx(ge, { id: "name-dialog-confirm", ref: d, type: "submit", children: t ? x(t.confirmKey) : x("common.save") })
              ] })
            ]
          }
        )
      ]
    }
  );
}
function nb() {
  const e = window.document.createElement("div");
  e.dataset.island = "name-prompt", window.document.body.append(e);
  const t = {};
  qe("name-prompt", e, /* @__PURE__ */ l.jsx(tb, { controller: t }));
  const n = t.open;
  if (!n) throw new Error("Mantine name prompt failed to mount");
  return {
    request(o, r, s, a) {
      n({ titleKey: o, labelKey: r, confirmKey: s, submit: a });
    }
  };
}
function ob(e) {
  const t = window.document.getElementById(e);
  if (!t) throw new Error(`missing element #${e}`);
  return t;
}
function rb({ controller: e }) {
  const { colorScheme: t, setColorScheme: n } = fp(), [o, r] = u.useState(!1), [s, a] = u.useState("settings-agents");
  Fe();
  const i = u.useRef(null), c = u.useRef(null), d = u.useRef(null);
  function f(h = "settings-agents", g) {
    a(h), g && (i.current && (i.current.checked = g.follow), c.current && (c.current.value = g.language)), r(!0);
  }
  function p() {
    r(!1);
  }
  u.useLayoutEffect(() => {
    e.current = { open: f, close: p, isOpen: () => o };
  }), u.useLayoutEffect(() => {
    const h = d.current;
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
  }, [o]), u.useEffect(() => () => {
    e.current = null;
  }, [e]);
  function m(h) {
    h.preventDefault(), h.nativeEvent.submitter?.value === "cancel" && p();
  }
  return /* @__PURE__ */ l.jsx(st, { ref: d, id: "settings-dialog", "data-state": o ? "open" : "closed", opened: o, onClose: p, title: null, withCloseButton: !1, centered: !0, size: "xl", withinPortal: !1, keepMounted: !0, keepMountedMode: "display-none", children: /* @__PURE__ */ l.jsx("form", { id: "settings-form", onSubmit: m, children: /* @__PURE__ */ l.jsxs(ye, { gap: "md", children: [
    /* @__PURE__ */ l.jsxs(Te, { justify: "space-between", align: "flex-start", children: [
      /* @__PURE__ */ l.jsxs("div", { children: [
        /* @__PURE__ */ l.jsx(oe, { size: "xs", c: "dimmed", children: x("settings.preferences") }),
        /* @__PURE__ */ l.jsx(oe, { component: "h2", fw: 700, children: x("settings.openButton") })
      ] }),
      /* @__PURE__ */ l.jsx(ge, { id: "settings-close", type: "submit", value: "cancel", variant: "subtle", title: x("common.close"), "aria-label": x("common.close"), children: "×" })
    ] }),
    /* @__PURE__ */ l.jsxs(Ne, { value: s, onChange: (h) => a(h), variant: "separated", keepMounted: !0, keepMountedMode: "display-none", children: [
      /* @__PURE__ */ l.jsxs(Ne.Item, { id: "settings-agents", className: "settings-section", value: "settings-agents", children: [
        /* @__PURE__ */ l.jsx(Ne.Control, { children: /* @__PURE__ */ l.jsxs(Te, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx("i", { className: "ph ph-robot", "aria-hidden": "true" }),
          /* @__PURE__ */ l.jsxs(ye, { gap: 0, children: [
            /* @__PURE__ */ l.jsx(oe, { size: "xs", c: "dimmed", children: x("settings.collaboration") }),
            /* @__PURE__ */ l.jsx(oe, { id: "settings-agents-heading", fw: 600, children: x("settings.aiAgents") })
          ] })
        ] }) }),
        /* @__PURE__ */ l.jsx(Ne.Panel, { children: /* @__PURE__ */ l.jsxs(ye, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx(ge, { id: "agents", type: "button", leftSection: /* @__PURE__ */ l.jsx("i", { className: "ph ph-plugs-connected", "aria-hidden": "true" }), children: x("agents.dialogTitle") }),
          /* @__PURE__ */ l.jsx(Yt, { id: "setting-follow", ref: i, defaultChecked: !0, label: x("agents.followChanges") }),
          /* @__PURE__ */ l.jsx(oe, { size: "sm", c: "dimmed", children: x("agents.followHint") })
        ] }) })
      ] }),
      /* @__PURE__ */ l.jsxs(Ne.Item, { id: "settings-document", className: "settings-section", value: "settings-document", children: [
        /* @__PURE__ */ l.jsx(Ne.Control, { children: /* @__PURE__ */ l.jsxs(Te, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx("i", { className: "ph ph-file", "aria-hidden": "true" }),
          /* @__PURE__ */ l.jsxs(ye, { gap: 0, children: [
            /* @__PURE__ */ l.jsx(oe, { size: "xs", c: "dimmed", children: x("settings.project") }),
            /* @__PURE__ */ l.jsx(oe, { id: "settings-document-heading", fw: 600, children: x("settings.projectActions") })
          ] })
        ] }) }),
        /* @__PURE__ */ l.jsx(Ne.Panel, { children: /* @__PURE__ */ l.jsxs(ye, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx(ge, { id: "rename-project", type: "button", variant: "default", disabled: !0, leftSection: /* @__PURE__ */ l.jsx("i", { className: "ph ph-pencil-simple", "aria-hidden": "true" }), children: x("projects.renameButton") }),
          /* @__PURE__ */ l.jsx(ge, { id: "reload", type: "button", variant: "default", disabled: !0, leftSection: /* @__PURE__ */ l.jsx("i", { className: "ph ph-arrows-clockwise", "aria-hidden": "true" }), children: x("projects.reloadButton") }),
          /* @__PURE__ */ l.jsx(ge, { id: "delete-project", type: "button", color: "red", variant: "light", disabled: !0, leftSection: /* @__PURE__ */ l.jsx("i", { className: "ph ph-trash", "aria-hidden": "true" }), children: x("projects.deleteButton") })
        ] }) })
      ] }),
      /* @__PURE__ */ l.jsxs(Ne.Item, { id: "settings-fonts", className: "settings-section", value: "settings-fonts", children: [
        /* @__PURE__ */ l.jsx(Ne.Control, { children: /* @__PURE__ */ l.jsxs(Te, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx("i", { className: "ph ph-text-aa", "aria-hidden": "true" }),
          /* @__PURE__ */ l.jsxs(ye, { gap: 0, children: [
            /* @__PURE__ */ l.jsx(oe, { size: "xs", c: "dimmed", children: x("settings.workspace") }),
            /* @__PURE__ */ l.jsx(oe, { id: "settings-fonts-heading", fw: 600, children: x("toolbar.fontsButton") })
          ] })
        ] }) }),
        /* @__PURE__ */ l.jsx(Ne.Panel, { children: /* @__PURE__ */ l.jsxs(ye, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx(oe, { className: "hint", size: "sm", c: "dimmed", children: x("fonts.settingsHint") }),
          /* @__PURE__ */ l.jsx(ge, { id: "settings-fonts-open", type: "button", variant: "default", leftSection: /* @__PURE__ */ l.jsx("i", { className: "ph ph-arrow-square-out", "aria-hidden": "true" }), children: x("fonts.openTools") })
        ] }) })
      ] }),
      /* @__PURE__ */ l.jsxs(Ne.Item, { id: "settings-application", className: "settings-section", value: "settings-application", children: [
        /* @__PURE__ */ l.jsx(Ne.Control, { children: /* @__PURE__ */ l.jsxs(Te, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx("i", { className: "ph ph-gear-six", "aria-hidden": "true" }),
          /* @__PURE__ */ l.jsxs(ye, { gap: 0, children: [
            /* @__PURE__ */ l.jsx(oe, { size: "xs", c: "dimmed", children: x("settings.application") }),
            /* @__PURE__ */ l.jsx(oe, { id: "settings-application-heading", fw: 600, children: x("settings.updatesControl") })
          ] })
        ] }) }),
        /* @__PURE__ */ l.jsx(Ne.Panel, { children: /* @__PURE__ */ l.jsxs(ye, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx(Gn, { id: "setting-language", ref: c, label: /* @__PURE__ */ l.jsx("span", { "data-i18n": "settings.languageLabel", children: x("settings.languageLabel") }), defaultValue: "en", data: [
            { value: "en", label: x("settings.languageEnglish") },
            { value: "fr", label: x("settings.languageFrench") },
            { value: "de", label: x("settings.languageGerman") }
          ] }),
          /* @__PURE__ */ l.jsx(
            wt.Wrapper,
            {
              id: "setting-appearance-wrapper",
              label: x("settings.appearance"),
              labelElement: "div",
              labelProps: { id: "setting-appearance-label" },
              children: /* @__PURE__ */ l.jsx(
                qo,
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
                    { value: "system", label: x("settings.appearanceSystem") },
                    { value: "light", label: x("settings.appearanceLight") },
                    { value: "dark", label: x("settings.appearanceDark") }
                  ]
                }
              )
            }
          ),
          /* @__PURE__ */ l.jsx(Yt, { id: "setting-update-check", label: x("updates.dailyCheckSetting") }),
          /* @__PURE__ */ l.jsxs(oe, { size: "sm", c: "dimmed", children: [
            x("updates.dailyCheckBeforeCommand"),
            " ",
            /* @__PURE__ */ l.jsx("code", { children: "assemblash upgrade" }),
            x("updates.dailyCheckAfterCommand")
          ] }),
          /* @__PURE__ */ l.jsx(oe, { id: "update-note", component: "p", size: "sm", c: "dimmed", hidden: !0, "aria-live": "polite" }),
          /* @__PURE__ */ l.jsx(ge, { id: "shutdown", type: "button", color: "red", variant: "light", hidden: !0, leftSection: /* @__PURE__ */ l.jsx("i", { className: "ph ph-power", "aria-hidden": "true" }), children: x("app.stop") })
        ] }) })
      ] })
    ] })
  ] }) }) });
}
function sb() {
  const e = ob("settings-dialog-mount"), t = { current: null };
  return qe("settings", e, /* @__PURE__ */ l.jsx(rb, { controller: t })), {
    open: (n, o) => t.current?.open(n, o),
    close: () => t.current?.close(),
    isOpen: () => t.current?.isOpen() ?? !1
  };
}
const ab = {
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
function ib({ host: e, controller: t, boundary: n }) {
  const [o, r] = u.useState({
    projects: [],
    query: "",
    currentProject: null
  }), [s, a] = u.useState(""), i = u.useRef(""), [c, d] = u.useState(x("projects.searchPlaceholder")), [f, p] = u.useState(!1), [m, h] = u.useState(-1), g = Fe(), y = u.useRef(null), w = u.useRef(void 0), b = u.useRef(o);
  b.current = o, u.useEffect(() => (t.setProjects = (v) => {
    if (b.current = v, r(v), h(-1), !v.query) {
      const R = v.currentProject ? v.projects.find((D) => D.id === v.currentProject) : void 0;
      d(R?.name ?? R?.id ?? (v.projects.length ? x("projects.searchPlaceholder") : x("projects.none")));
    }
  }, t.setCurrentProject = (v) => {
    const R = b.current, D = { ...R, currentProject: v };
    b.current = D, r(D);
    const L = v ? R.projects.find((F) => F.id === v) : void 0;
    d(L?.name ?? L?.id ?? (R.projects.length ? x("projects.searchPlaceholder") : x("projects.none")));
  }, t.focus = () => y.current?.focus(), () => {
    window.clearTimeout(w.current), t.setProjects = () => {
    }, t.setCurrentProject = () => {
    }, t.focus = () => {
    };
  }), [t]), u.useEffect(() => {
    if (s) return;
    const v = o.currentProject ? o.projects.find((R) => R.id === o.currentProject) : void 0;
    d(v?.name ?? v?.id ?? (o.projects.length ? x("projects.searchPlaceholder") : x("projects.none")));
  }, [g]), u.useEffect(() => {
    const v = (R) => {
      (!(R.target instanceof Node) || !n.contains(R.target)) && (p(!1), h(-1));
    };
    return document.addEventListener("pointerdown", v), () => document.removeEventListener("pointerdown", v);
  }, [n]);
  function k(v) {
    p(v), v || h(-1);
  }
  function C(v) {
    const R = { ...b.current, currentProject: v.id };
    b.current = R, r(R), d(v.name ?? v.id), i.current = "", a(""), y.current && (y.current.value = ""), y.current?.blur(), k(!1), e.openProject(v.id);
  }
  function j(v) {
    i.current = v, a(v), window.clearTimeout(w.current), w.current = window.setTimeout(() => e.search(v.trim()), 150);
  }
  function N(v) {
    if (f || k(!0), o.projects.length === 0) return;
    const R = v > 0 ? 0 : o.projects.length - 1, D = m < 0 ? R : Math.max(0, Math.min(o.projects.length - 1, m + v));
    h(D), window.requestAnimationFrame(() => {
      document.getElementById(`project-option-${D}`)?.scrollIntoView({ block: "nearest" });
    });
  }
  const T = o.projects.length === 0 ? o.query ? x("projects.noMatching") : x("projects.none") : "", S = f && m >= 0 && o.projects[m] ? `project-option-${m}` : void 0;
  return /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
    /* @__PURE__ */ l.jsx("i", { className: "ph ph-magnifying-glass", "aria-hidden": "true" }),
    /* @__PURE__ */ l.jsx(
      dt,
      {
        id: "project-search",
        "data-current-project": o.currentProject ?? "",
        ref: y,
        type: "search",
        autoComplete: "off",
        defaultValue: "",
        placeholder: c,
        "aria-label": x("projects.searchPlaceholder"),
        "aria-controls": "project-options",
        "aria-expanded": f,
        "aria-autocomplete": "list",
        "aria-activedescendant": S,
        role: "combobox",
        onChange: (v) => j(v.currentTarget.value),
        onFocus: () => k(!0),
        onKeyDown: (v) => {
          if (v.key === "ArrowDown" || v.key === "ArrowUp") {
            v.preventDefault(), N(v.key === "ArrowDown" ? 1 : -1);
            return;
          }
          if (v.key === "Escape") {
            k(!1);
            return;
          }
          if (v.key !== "Enter") return;
          const R = y.current?.value ?? i.current;
          R !== i.current && (i.current = R, a(R));
          const D = o.projects[m], L = R.trim().toLocaleLowerCase(), _ = o.projects.find(
            (z) => z.id.toLocaleLowerCase() === L || (z.name ?? z.id).toLocaleLowerCase() === L
          ) ?? D;
          _ && (v.preventDefault(), C(_));
        }
      }
    ),
    /* @__PURE__ */ l.jsx(
      ge,
      {
        id: "project-picker-toggle",
        className: "project-picker-toggle",
        type: "button",
        variant: "subtle",
        "aria-label": x("projects.showButton"),
        "aria-controls": "project-options",
        "aria-expanded": f,
        onClick: () => {
          const v = !f;
          k(v), v && y.current?.focus();
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
        "aria-label": x("projects.optionsLabel"),
        hidden: !f,
        children: [
          o.projects.map((v, R) => /* @__PURE__ */ l.jsxs(
            ge,
            {
              id: `project-option-${R}`,
              className: `project-option${R === m ? " active" : ""}`,
              styles: ab,
              type: "button",
              variant: "subtle",
              title: v.name ?? v.id,
              "data-project-id": v.id,
              role: "option",
              "aria-selected": v.id === o.currentProject,
              onClick: () => C(v),
              children: [
                /* @__PURE__ */ l.jsx("strong", { children: v.name ?? v.id }),
                /* @__PURE__ */ l.jsx(
                  "span",
                  {
                    className: "project-option-count",
                    "data-i18n-count": "projects.layerCount",
                    "data-count": String(v.layers),
                    children: Tt("projects.layerCount", v.layers)
                  }
                )
              ]
            },
            v.id
          )),
          T ? /* @__PURE__ */ l.jsx("p", { className: "project-options-empty", children: T }) : null
        ]
      }
    )
  ] });
}
function cb(e, t) {
  t.replaceChildren();
  const n = {
    setProjects: () => {
    },
    setCurrentProject: () => {
    },
    focus: () => {
    }
  }, o = qe(
    "project-picker",
    t,
    /* @__PURE__ */ l.jsx(ib, { host: e, controller: n, boundary: t })
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
function lb(e) {
  const t = window.document.getElementById(e);
  if (!t) throw new Error(`missing element #${e}`);
  return t;
}
function Pc(e) {
  return e.kind ?? "text";
}
function db({ host: e, projectController: t }) {
  const [n, o] = u.useState([]), [r, s] = u.useState(() => /* @__PURE__ */ new Map()), [a, i] = u.useState([]), [c, d] = u.useState(""), [f, p] = u.useState([]), [m, h] = u.useState(!1), [g, y] = u.useState(!1);
  Fe();
  const [w, b] = u.useState(null), k = u.useRef([]), C = u.useRef(m);
  C.current = m;
  const j = u.useRef(null), N = u.useRef(null);
  function T() {
    for (const O of k.current) URL.revokeObjectURL(O);
    k.current = [];
  }
  function S() {
    const O = {};
    for (const M of n) {
      const $ = r.get(M.name);
      $ && (O[M.name] = $);
    }
    return O;
  }
  function v(O, M) {
    s(($) => new Map($).set(O, M));
  }
  async function R(O, M) {
    T(), p([]);
    const $ = [];
    for (const I of M.variants) {
      const A = await To(Au(O, I.name));
      k.current.push(A), $.push({ variant: I, url: A });
    }
    p($);
  }
  async function D(O, M) {
    await e.guard(O, async () => {
      const $ = e.project();
      if (!$) return;
      const I = await yy($, M);
      await R($, I), e.say(Tt("templates.renderedCount", I.variants.length, {
        what: O,
        version: je(I.templateVersion)
      }));
    });
  }
  async function L() {
    const O = e.project();
    if (s(/* @__PURE__ */ new Map()), i([]), d(""), T(), p([]), !O) {
      o([]), C.current = !1, h(!1);
      return;
    }
    const M = await vy(O), $ = M.isTemplate ? M.slots : [];
    o($), C.current = $.length > 0, h($.length > 0);
    const I = /* @__PURE__ */ new Map();
    for (const A of $)
      Pc(A) === "color" && I.set(A.name, "#000000");
    s(I);
  }
  u.useLayoutEffect(() => {
    t.current = {
      projectChanged: L,
      setOpen: y,
      isVisible: () => C.current
    };
  }), u.useEffect(() => () => {
    t.current = null, T();
  }, [t]);
  async function F(O) {
    const M = O.currentTarget.files?.[0];
    O.currentTarget.value = "", M && await e.guard(x("templates.loadValues"), async () => {
      const $ = JSON.parse(await M.text());
      if (!Array.isArray($)) throw new Error(x("templates.expectedArray"));
      const I = [];
      for (const A of $) {
        const B = A;
        if (typeof B.name != "string") throw new Error(x("templates.missingName"));
        const W = {};
        for (const [U, Z] of Object.entries(B.values ?? {})) W[U] = String(Z);
        I.push({ name: B.name, values: W });
      }
      i(I), e.say(Tt("templates.loadedVariants", I.length, { file: M.name }));
    });
  }
  async function _(O) {
    const M = O.currentTarget.files?.[0];
    O.currentTarget.value = "";
    const $ = w;
    b(null), !(!M || !$) && await e.guard(x("templates.importImage"), async () => {
      const I = e.project();
      if (!I) return;
      const A = await ii(I, M);
      v($, A.asset.id), await e.refresh(), s((B) => new Map(B)), e.say(x("templates.importedImage", { file: M.name, slot: $ }));
    });
  }
  const z = e.document()?.assets ?? [];
  return /* @__PURE__ */ l.jsxs(ye, { component: "section", id: "templates", className: g ? "templates open" : "templates", hidden: !m, gap: "md", "aria-label": x("templates.drawerLabel"), children: [
    /* @__PURE__ */ l.jsxs(Te, { justify: "space-between", align: "flex-start", children: [
      /* @__PURE__ */ l.jsxs("div", { children: [
        /* @__PURE__ */ l.jsx(oe, { size: "xs", c: "dimmed", children: x("templates.workspace") }),
        /* @__PURE__ */ l.jsx(oe, { component: "h2", fw: 700, children: x("templates.buildVariants") })
      ] }),
      /* @__PURE__ */ l.jsx(ge, { id: "templates-close", type: "button", variant: "subtle", title: x("templates.close"), "aria-label": x("common.close"), children: "×" })
    ] }),
    /* @__PURE__ */ l.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 18rem), 1fr))", gap: "var(--mantine-spacing-md)" }, children: [
      /* @__PURE__ */ l.jsxs(ye, { gap: "sm", children: [
        /* @__PURE__ */ l.jsx(oe, { component: "h3", fw: 600, children: x("templates.fillSlots") }),
        /* @__PURE__ */ l.jsx(ye, { id: "slot-form", gap: "sm", children: n.map((O) => {
          const M = Pc(O), $ = r.get(O.name) ?? (M === "color" ? "#000000" : "");
          return /* @__PURE__ */ l.jsxs(ye, { gap: 4, "data-slot": O.name, children: [
            M === "image" ? /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
              /* @__PURE__ */ l.jsx(ei, { label: `${O.name}${O.required ? " *" : ""}`, title: O.description ?? void 0, "data-slot": O.name, value: r.get(O.name) ?? "", onChange: (I) => v(O.name, I ?? ""), data: [{ value: "", label: x(z.length ? "templates.leaveAsIs" : "templates.noImages") }, ...z.map((I) => ({ value: I.id, label: I.path }))] }),
              /* @__PURE__ */ l.jsx(ge, { type: "button", size: "xs", variant: "default", onClick: () => {
                b(O.name), j.current?.click();
              }, children: x("templates.importButton") })
            ] }) : M === "color" ? /* @__PURE__ */ l.jsx(dt, { type: "color", label: `${O.name}${O.required ? " *" : ""}`, title: O.description ?? void 0, "data-slot": O.name, value: $, onChange: (I) => v(O.name, I.currentTarget.value) }) : /* @__PURE__ */ l.jsx(dt, { label: `${O.name}${O.required ? " *" : ""}`, title: O.description ?? void 0, "data-slot": O.name, value: $, onChange: (I) => v(O.name, I.currentTarget.value) }),
            O.description && /* @__PURE__ */ l.jsx(oe, { size: "xs", c: "dimmed", children: O.description })
          ] }, O.name);
        }) }),
        /* @__PURE__ */ l.jsx("input", { ref: j, id: "slot-image-file", type: "file", accept: "image/*,.svg", hidden: !0, onChange: (O) => {
          _(O);
        } }),
        /* @__PURE__ */ l.jsxs(Te, { align: "end", wrap: "wrap", children: [
          /* @__PURE__ */ l.jsx(ge, { id: "preview-variant", type: "button", onClick: () => {
            D(x("templates.preview"), [{ name: "preview", values: S() }]);
          }, children: x("templates.preview") }),
          /* @__PURE__ */ l.jsx(dt, { id: "variant-name", label: x("templates.variantName"), value: c, onChange: (O) => d(O.currentTarget.value) }),
          /* @__PURE__ */ l.jsx(ge, { id: "add-variant", type: "button", variant: "default", onClick: () => {
            const O = c.trim();
            if (!O) {
              e.say(x("templates.variantNameRequired"), "error");
              return;
            }
            i((M) => [...M, { name: O, values: S() }]), d(""), e.say(x("templates.addedToBatch", { name: O }));
          }, children: x("templates.addToBatch") })
        ] })
      ] }),
      /* @__PURE__ */ l.jsxs(ye, { gap: "sm", children: [
        /* @__PURE__ */ l.jsx(oe, { component: "h3", fw: 600, children: x("templates.batch") }),
        /* @__PURE__ */ l.jsx(ye, { component: "ol", id: "variant-rows", gap: "xs", m: 0, p: 0, children: a.map((O, M) => /* @__PURE__ */ l.jsx(Kn, { component: "li", withBorder: !0, p: "xs", children: /* @__PURE__ */ l.jsxs(Te, { justify: "space-between", align: "flex-start", wrap: "nowrap", children: [
          /* @__PURE__ */ l.jsxs(ye, { gap: 2, style: { minWidth: 0 }, children: [
            /* @__PURE__ */ l.jsx(oe, { fw: 600, children: O.name }),
            /* @__PURE__ */ l.jsx(oe, { size: "xs", c: "dimmed", children: Object.entries(O.values).map(([$, I]) => `${$}=${I}`).join("  ") })
          ] }),
          /* @__PURE__ */ l.jsx(ge, { type: "button", size: "xs", variant: "subtle", onClick: () => i(($) => $.filter((I, A) => A !== M)), children: x("templates.removeButton") })
        ] }) }, `${M}-${O.name}`)) }),
        /* @__PURE__ */ l.jsx("input", { ref: N, id: "values-file", type: "file", accept: "application/json,.json", hidden: !0, onChange: (O) => {
          F(O);
        } }),
        /* @__PURE__ */ l.jsxs(Te, { wrap: "wrap", children: [
          /* @__PURE__ */ l.jsx(ge, { id: "load-values", type: "button", variant: "default", onClick: () => N.current?.click(), children: x("templates.loadJson") }),
          /* @__PURE__ */ l.jsx(ge, { id: "render-batch", type: "button", disabled: !a.length, onClick: () => {
            D(x("templates.renderBatch"), a);
          }, children: a.length ? Tt("templates.renderVariants", a.length) : x("templates.renderBatch") }),
          /* @__PURE__ */ l.jsx(ge, { id: "clear-batch", type: "button", variant: "default", disabled: !a.length, onClick: () => i([]), children: x("templates.clear") })
        ] })
      ] }),
      /* @__PURE__ */ l.jsxs(ye, { gap: "sm", children: [
        /* @__PURE__ */ l.jsx(oe, { component: "h3", fw: 600, children: x("templates.renderedVariants") }),
        /* @__PURE__ */ l.jsx("div", { id: "gallery", style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))", gap: "var(--mantine-spacing-sm)" }, children: f.map(({ variant: O, url: M }) => /* @__PURE__ */ l.jsxs(Kn, { component: "figure", withBorder: !0, p: "sm", m: 0, children: [
          /* @__PURE__ */ l.jsx("img", { src: M, alt: x("templates.variantAlt", { name: O.name }), style: { display: "block", width: "100%", height: "auto" } }),
          /* @__PURE__ */ l.jsxs(ye, { component: "figcaption", gap: 4, mt: "sm", children: [
            /* @__PURE__ */ l.jsx(oe, { component: "strong", children: O.name }),
            /* @__PURE__ */ l.jsx(oe, { size: "xs", children: x("templates.bytesSize", { width: je(O.width), height: je(O.height), bytes: je(O.bytes) }) }),
            /* @__PURE__ */ l.jsx(oe, { component: "code", size: "xs", title: O.hash, children: O.hash.replace(/^sha256:/, "").slice(0, 12) }),
            /* @__PURE__ */ l.jsx(ge, { component: "a", href: M, download: `${O.name}.png`, variant: "default", size: "xs", children: x("templates.downloadButton") })
          ] })
        ] }, `${O.name}-${O.hash}`)) })
      ] })
    ] })
  ] });
}
function ub(e) {
  const t = lb("templates-mantine-mount"), n = { current: null };
  return qe("templates", t, /* @__PURE__ */ l.jsx(db, { host: e, projectController: n })), {
    projectChanged: async () => {
      await n.current?.projectChanged();
    },
    setOpen: (o) => n.current?.setOpen(o),
    isVisible: () => n.current?.isVisible() ?? !1
  };
}
const yo = (e) => /* @__PURE__ */ l.jsx("i", { className: `ph ${e}`, "aria-hidden": "true" });
function Er(e) {
  return e.name ?? (e.type === "text" ? e.text : e.type) ?? e.type;
}
function fb(e) {
  return e.type === "shape" ? { rect: "ph-square", ellipse: "ph-circle", line: "ph-line-segment", path: "ph-bezier-curve" }[Tu(e) ?? ""] ?? "ph-shapes" : { text: "ph-text-t", image: "ph-image", svg: "ph-pen-nib", group: "ph-stack" }[e.type] ?? "ph-square";
}
function pb({ layer: e, finish: t }) {
  const n = u.useRef(null), o = u.useRef(!1);
  u.useEffect(() => {
    n.current?.focus(), n.current?.select();
  }, []);
  const r = (s) => {
    o.current || (o.current = !0, t(s ? n.current?.value.trim() ?? "" : null));
  };
  return /* @__PURE__ */ l.jsx(
    dt,
    {
      ref: n,
      size: "xs",
      autoFocus: !0,
      defaultValue: Er(e),
      classNames: { input: "layer-rename" },
      "aria-label": x("layers.renameHint"),
      onClick: (s) => s.stopPropagation(),
      onBlur: () => r(!0),
      onKeyDown: (s) => {
        s.stopPropagation(), (s.key === "Enter" || s.key === "Escape") && (s.preventDefault(), r(s.key === "Enter"));
      }
    }
  );
}
function mb({ layer: e, depth: t, parent: n, inheritedGuard: o, snapshot: r, commands: s, elementProps: a, renaming: i, startRename: c, finishRename: d, expanded: f, hasChildren: p, toggleExpanded: m }) {
  const [h, g] = u.useState(!1), [y, w] = u.useState(!1), b = u.useRef(null);
  u.useEffect(() => () => {
    b.current && clearTimeout(b.current.timer);
  }, []);
  const k = r.selectedIds.includes(e.id), C = !o && Ao(e), j = o || !!kr(e), N = !o && !e.protected && !e.readOnly, T = (v, R) => {
    k || s.select(e.id, !1), s.contextMenu?.(e.id, v, R);
  }, S = () => {
    b.current && clearTimeout(b.current.timer);
  };
  return /* @__PURE__ */ l.jsx(
    Q,
    {
      ...a,
      className: `${a.className} layer${k ? " selected" : ""}${j ? " guarded" : ""}${e.visible === !1 ? " hidden-layer" : ""}${h ? " dragging" : ""}${y ? " drop-target" : ""}`,
      "data-id": e.id,
      "data-type": e.type,
      "data-parent": n ?? "",
      style: { ...a.style, "--layer-depth": t, paddingInlineStart: 8 + t * 16 },
      draggable: C,
      onClick: (v) => {
        if (b.current?.fired) {
          b.current = null;
          return;
        }
        a.onClick(v), s.select(e.id, v.shiftKey || v.ctrlKey || v.metaKey);
      },
      onContextMenu: (v) => {
        v.preventDefault(), T(v.clientX, v.clientY);
      },
      onPointerDown: (v) => {
        if (v.pointerType !== "touch" || !s.contextMenu) return;
        S();
        const R = v.clientX, D = v.clientY;
        b.current = { x: R, y: D, fired: !1, timer: setTimeout(() => {
          b.current && (b.current.fired = !0), T(R, D);
        }, 450) };
      },
      onPointerMove: (v) => {
        b.current && Math.hypot(v.clientX - b.current.x, v.clientY - b.current.y) > 8 && S();
      },
      onPointerUp: S,
      onPointerCancel: S,
      onDragStart: (v) => {
        v.dataTransfer.setData("text/plain", e.id), g(!0);
      },
      onDragEnd: () => {
        g(!1), w(!1);
      },
      onDragOver: (v) => {
        v.preventDefault(), w(!0);
      },
      onDragLeave: () => w(!1),
      onDrop: (v) => {
        v.preventDefault(), w(!1);
        const R = v.dataTransfer.getData("text/plain");
        if (!R || R === e.id || !r.document) return;
        const D = Ye(Oe(r.document)), L = n ? D.find((z) => z.layer.id === n)?.layer : null, F = L?.type === "group" ? L.children ?? [] : Oe(r.document), _ = Math.max(0, F.findIndex((z) => z.id === e.id) + 1);
        s.reorder(R, e.id, e.type === "group" ? { at: "in", parent: e.id } : n ? { at: "in", parent: n, index: _ } : { at: "root", index: _ });
      },
      children: /* @__PURE__ */ l.jsxs(Te, { gap: "xs", wrap: "nowrap", children: [
        p ? /* @__PURE__ */ l.jsx(
          xo,
          {
            className: "layer-control",
            size: "sm",
            variant: "subtle",
            "data-layer-toggle": e.id,
            title: x(f ? "layers.collapseGroup" : "layers.expandGroup"),
            "aria-label": x(f ? "layers.collapseGroup" : "layers.expandGroup"),
            "aria-expanded": f,
            onClick: (v) => {
              v.stopPropagation(), m();
            },
            children: yo(f ? "ph-caret-down" : "ph-caret-right")
          }
        ) : null,
        /* @__PURE__ */ l.jsx(
          xo,
          {
            className: "layer-control",
            size: "sm",
            variant: "subtle",
            disabled: !C,
            title: x(e.visible === !1 ? "layers.show" : "layers.hide"),
            "aria-label": x(e.visible === !1 ? "layers.show" : "layers.hide"),
            onClick: (v) => {
              v.stopPropagation(), s.toggleVisibility(e.id);
            },
            children: yo(e.visible === !1 ? "ph-eye-slash" : "ph-eye")
          }
        ),
        /* @__PURE__ */ l.jsx(Q, { className: "layer-icon", children: yo(fb(e)) }),
        /* @__PURE__ */ l.jsx(Q, { style: { flex: 1, minWidth: 0 }, children: i ? /* @__PURE__ */ l.jsx(pb, { layer: e, finish: (v) => {
          d(), v !== null && v !== (e.name ?? "") && s.rename(e.id, v);
        } }) : /* @__PURE__ */ l.jsx(
          oe,
          {
            component: "span",
            className: "name",
            size: "sm",
            truncate: !0,
            title: kr(e) ?? x("layers.renameHint"),
            onDoubleClick: (v) => {
              v.stopPropagation(), C && c();
            },
            children: Er(e)
          }
        ) }),
        /* @__PURE__ */ l.jsx(
          xo,
          {
            className: "layer-control",
            size: "sm",
            variant: "subtle",
            disabled: !N,
            title: x(e.locked ? "layers.unlock" : "layers.lock"),
            "aria-label": x(e.locked ? "layers.unlock" : "layers.lock"),
            onClick: (v) => {
              v.stopPropagation(), s.toggleLocked(e.id);
            },
            children: yo(e.locked ? "ph-lock" : "ph-lock-open")
          }
        )
      ] })
    }
  );
}
function hb({ snapshot: e, commands: t }) {
  Fe();
  const [n, o] = u.useState(null), [r, s] = u.useState({}), a = e.document ? Oe(e.document) : [], i = u.useMemo(() => {
    const p = e.query.trim().toLowerCase(), m = (g) => Er(g).toLowerCase().includes(p) || g.type === "group" && (g.children ?? []).some(m), h = (g, y, w) => [...g].reverse().filter((b) => !p || m(b)).map((b) => ({
      value: b.id,
      label: Er(b),
      layer: b,
      parent: y,
      guarded: w,
      ...b.type === "group" ? { children: h(b.children ?? [], b.id, w || !Ao(b)) } : {}
    }));
    return h(e.document ? Oe(e.document) : [], null, !1);
  }, [e.document, e.query]), c = u.useMemo(() => {
    const p = /* @__PURE__ */ new Map(), m = (h) => {
      for (const g of h)
        p.set(g.value, g), g.children && m(g.children);
    };
    return m(i), p;
  }, [i]), d = u.useMemo(() => Object.fromEntries([...c.keys()].map((p) => [p, r[p] ?? !0])), [c, r]), f = ku({
    multiple: !0,
    selectedState: [...e.selectedIds],
    expandedState: d,
    onExpandedStateChange: s,
    onSelectedStateChange(p) {
      if (p.length) {
        t.select(p[0], !1);
        for (const m of p.slice(1)) t.select(m, !0);
      }
    }
  });
  return i.length ? /* @__PURE__ */ l.jsx(
    cs,
    {
      id: "layers",
      "aria-label": x("layers.tab"),
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
        if (h && (p.key === "F2" && (p.preventDefault(), p.stopPropagation(), !h.guarded && Ao(h.layer) && o(h.value)), (p.key === "Enter" || p.key === " ") && (p.preventDefault(), p.stopPropagation(), t.select(h.value, p.shiftKey || p.ctrlKey || p.metaKey)), p.key === "F10" && p.shiftKey)) {
          p.preventDefault(), p.stopPropagation(), e.selectedIds.includes(h.value) || t.select(h.value, !1);
          const g = (m.classList.contains("layer") ? m : m.querySelector(".layer")).getBoundingClientRect();
          t.contextMenu?.(h.value, g.left + 24, g.top + 24);
        }
      },
      renderNode: ({ node: p, level: m, elementProps: h, expanded: g, hasChildren: y }) => {
        const { layer: w, parent: b, guarded: k } = p;
        return /* @__PURE__ */ l.jsx(
          mb,
          {
            layer: w,
            depth: m - 1,
            parent: b,
            inheritedGuard: k,
            snapshot: e,
            commands: t,
            elementProps: h,
            renaming: n === w.id,
            startRename: () => o(w.id),
            finishRename: () => o(null),
            expanded: g,
            hasChildren: y,
            toggleExpanded: () => f.toggleExpanded(w.id)
          }
        );
      }
    }
  ) : /* @__PURE__ */ l.jsx(Q, { component: "ul", id: "layers", role: "tree", "aria-label": x("layers.tab"), m: 0, p: 0, style: { listStyle: "none" }, children: /* @__PURE__ */ l.jsx(Q, { component: "li", className: `layers-empty${a.length ? " compact" : ""}`, p: "md", children: /* @__PURE__ */ l.jsxs(ye, { gap: "xs", align: "center", children: [
    /* @__PURE__ */ l.jsx(Q, { children: yo(a.length ? "ph-magnifying-glass" : "ph-stack-simple") }),
    /* @__PURE__ */ l.jsx(oe, { fw: 600, children: x(a.length ? "layers.noMatching" : "layers.none") }),
    /* @__PURE__ */ l.jsx(oe, { size: "sm", c: "dimmed", children: x(a.length ? "layers.trySearch" : "layers.emptyHint") })
  ] }) }) });
}
function gb({ snapshot: e }) {
  return Fe(), /* @__PURE__ */ l.jsx(Q, { component: "ol", id: "history", m: 0, p: "sm", children: [...e.history?.entries ?? []].reverse().map((t) => /* @__PURE__ */ l.jsx(
    Q,
    {
      component: "li",
      className: t.position > (e.history?.position ?? 0) ? "undone" : void 0,
      py: "xs",
      children: /* @__PURE__ */ l.jsx(oe, { size: "sm", c: t.position > (e.history?.position ?? 0) ? "dimmed" : void 0, children: `${t.position}. ${t.kind} — ${t.actor.kind}${t.actor.detail ? ` (${t.actor.detail})` : ""}` })
    },
    t.transaction
  )) });
}
function vb({ snapshot: e, commands: t }) {
  Fe();
  const [n, o] = u.useState(e.dock ?? "properties");
  u.useEffect(() => {
    e.dock && o(e.dock);
  }, [e.dock]);
  const r = e.document ? Ye(Oe(e.document)) : [], s = r.filter((c) => e.selectedIds.includes(c.layer.id)), a = s.length > 0 && s.every((c) => {
    if (!Ao(c.layer)) return !1;
    let d = c.parent;
    for (; d; ) {
      const f = r.find((p) => p.layer.id === d);
      if (!f || !Ao(f.layer)) return !1;
      d = f.parent;
    }
    return !0;
  }), i = (c) => {
    (c === "properties" || c === "layers" || c === "history") && (o(c), t.showDock(c));
  };
  return /* @__PURE__ */ l.jsxs(
    at,
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
        /* @__PURE__ */ l.jsxs(at.List, { children: [
          /* @__PURE__ */ l.jsx(at.Tab, { id: "properties-tab", value: "properties", children: x("properties.tab") }),
          /* @__PURE__ */ l.jsx(at.Tab, { id: "layers-tab", value: "layers", children: x("layers.tab") }),
          /* @__PURE__ */ l.jsx(at.Tab, { id: "history-tab", value: "history", children: x("history.tab") })
        ] }),
        /* @__PURE__ */ l.jsx(at.Panel, { value: "properties", id: "properties-panel", className: "dock-view", children: /* @__PURE__ */ l.jsx("div", { id: "advanced-inspector" }) }),
        /* @__PURE__ */ l.jsx(at.Panel, { value: "layers", id: "layers-view", className: "dock-view", children: /* @__PURE__ */ l.jsxs(ye, { className: "layers-content", gap: "sm", p: "sm", children: [
          /* @__PURE__ */ l.jsx(
            dt,
            {
              id: "layer-search",
              value: e.query,
              disabled: Tc(e.document),
              placeholder: x(Tc(e.document) ? "layers.noSearch" : "layers.searchPlaceholder"),
              "aria-label": x("layers.searchPlaceholder"),
              onChange: (c) => t.setQuery(c.currentTarget.value)
            }
          ),
          /* @__PURE__ */ l.jsx(hb, { snapshot: e, commands: t }),
          /* @__PURE__ */ l.jsxs(Te, { gap: "xs", children: [
            /* @__PURE__ */ l.jsx(ge, { id: "group-layers", variant: "default", size: "xs", disabled: !a || s.length < 2, onClick: t.groupSelection, children: x("layers.groupButton") }),
            /* @__PURE__ */ l.jsx(ge, { id: "delete-layer", variant: "light", color: "red", size: "xs", disabled: !a, onClick: t.deleteSelection, children: x("layers.deleteButton") })
          ] })
        ] }) }),
        /* @__PURE__ */ l.jsx(at.Panel, { value: "history", id: "history-view", className: "dock-view", children: /* @__PURE__ */ l.jsx(gb, { snapshot: e }) })
      ]
    }
  );
}
function Tc(e) {
  return !e || Oe(e).length === 0;
}
function yb(e, t, n) {
  let o = (a) => {
  };
  function r() {
    const [a, i] = u.useState(t);
    return u.useEffect(() => (o = (c) => i({ ...c }), () => {
      o = () => {
      };
    }), []), /* @__PURE__ */ l.jsx(vb, { snapshot: a, commands: n });
  }
  const s = qe("structure", e, /* @__PURE__ */ l.jsx(r, {}));
  return { setSnapshot: (a) => o(a), destroy: s };
}
function bb(e) {
  return typeof e == "string" ? e : JSON.stringify(e, null, 2);
}
function Rr(e) {
  return Array.isArray(e) ? `[${e.map(Rr).join(",")}]` : e && typeof e == "object" ? `{${Object.keys(e).sort().map(
    (t) => `${JSON.stringify(t)}:${Rr(e[t])}`
  ).join(",")}}` : JSON.stringify(e);
}
function Ac(e, t) {
  if (typeof e == "string" && typeof t == "string") {
    const n = (o) => {
      const r = /^#([\da-f]{6})([\da-f]{2})?$/i.exec(o);
      return r ? `${r[1].toLowerCase()}${(r[2] ?? "ff").toLowerCase()}` : o;
    };
    return n(e) === n(t);
  }
  return Rr(e) === Rr(t);
}
function xb({ id: e, label: t, value: n, className: o, compact: r = !1, disabled: s = !1, onCommit: a, clear: i }) {
  Fe();
  const c = typeof n == "string" ? n : "#000000", [d, f] = u.useState(typeof n == "string" ? "solid" : "json"), [p, m] = u.useState(c), [h, g] = u.useState(bb(n)), [y, w] = u.useState(""), [b, k] = u.useState(!1), C = u.useRef(n);
  function j(v) {
    let R = v.trim();
    /^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(R) && (typeof C.current == "string" && /^#[\da-f]{6}$/i.test(C.current) && /^#([\da-f]{6})ff$/i.test(R) && (R = R.slice(0, 7)), w(""), !Ac(C.current, R) && (C.current = R, a(R)));
  }
  function N() {
    let v;
    try {
      v = JSON.parse(h);
    } catch {
      w(x("paint.jsonSyntaxError"));
      return;
    }
    if (!v || typeof v != "object" || Array.isArray(v) || !("kind" in v)) {
      w(x("paint.jsonObjectError"));
      return;
    }
    w("");
    const R = v;
    Ac(C.current, R) || (C.current = R, a(R));
  }
  const T = /* @__PURE__ */ l.jsxs(ye, { gap: "xs", className: "paint-input", "data-paint-editor": e, children: [
    /* @__PURE__ */ l.jsx(
      qo,
      {
        "aria-label": t,
        value: d,
        onChange: (v) => f(v),
        data: [
          { value: "solid", label: x("paint.solid") },
          { value: "json", label: x("paint.json") }
        ],
        disabled: s,
        size: "xs"
      }
    ),
    d === "solid" ? /* @__PURE__ */ l.jsxs(Te, { align: "end", wrap: "nowrap", gap: "xs", children: [
      /* @__PURE__ */ l.jsx(
        Wo,
        {
          id: `${e}-solid`,
          classNames: o ? { input: o } : void 0,
          label: t,
          value: p,
          format: "hexa",
          fixOnBlur: !1,
          disabled: s,
          onChange: (v) => m(v),
          onChangeEnd: j,
          onBlur: (v) => j(v.currentTarget.value),
          "aria-label": t,
          "data-paint-solid": e,
          style: { flex: 1 }
        }
      ),
      i ? /* @__PURE__ */ l.jsx(
        ge,
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
        Zr,
        {
          id: `${e}-json`,
          classNames: { input: o ? `${o} paint-json` : "paint-json" },
          label: t,
          value: h,
          onChange: (v) => g(v.currentTarget.value),
          minRows: 4,
          autosize: !0,
          disabled: s,
          error: y || void 0,
          "aria-label": t,
          "data-paint-json": e
        }
      ),
      /* @__PURE__ */ l.jsxs(Te, { justify: "space-between", align: "center", children: [
        /* @__PURE__ */ l.jsx(oe, { size: "xs", c: "dimmed", children: x("paint.jsonHint") }),
        /* @__PURE__ */ l.jsxs(Te, { gap: "xs", children: [
          /* @__PURE__ */ l.jsx(ge, { id: `${e}-apply-json`, type: "button", size: "xs", variant: "light", disabled: s, onClick: N, children: x("paint.applyJson") }),
          i ? /* @__PURE__ */ l.jsx(
            ge,
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
    y ? /* @__PURE__ */ l.jsx(oe, { size: "xs", c: "red", role: "alert", children: y }) : null
  ] });
  if (!r) return T;
  const S = typeof n == "string" ? { backgroundColor: n } : { background: "linear-gradient(135deg, var(--color-accent) 0 50%, var(--color-surface-subtle) 50% 100%)" };
  return /* @__PURE__ */ l.jsxs(
    ze,
    {
      id: e,
      opened: b,
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
        /* @__PURE__ */ l.jsx(ze.Target, { children: /* @__PURE__ */ l.jsx(
          xo,
          {
            className: "paint-swatch-trigger",
            type: "button",
            variant: "default",
            "aria-label": t,
            title: t,
            "aria-haspopup": "dialog",
            "aria-expanded": b,
            "data-paint-trigger": e,
            disabled: s,
            onClick: () => k((v) => !v),
            children: /* @__PURE__ */ l.jsx("span", { className: "paint-swatch", "aria-hidden": "true", style: S })
          }
        ) }),
        /* @__PURE__ */ l.jsx(ze.Dropdown, { className: "paint-popover", "data-paint-popover": e, children: T })
      ]
    }
  );
}
let wb = 0;
function Sb(e, t) {
  return qe(`paint-${++wb}`, e, /* @__PURE__ */ l.jsx(xb, { ...t }));
}
function Cb({ assets: e, value: t, disabled: n = !1, onChange: o, onUpload: r }) {
  Fe();
  const [s, a] = u.useState(null), [i, c] = u.useState(t);
  u.useEffect(() => c(t), [t]);
  const d = e.filter((p) => p.mediaType.startsWith("image/")), f = [
    { value: "", label: x("canvas.backgroundImageNone") },
    ...d.map((p) => ({
      value: p.id,
      label: `${p.path.split("/").at(-1) ?? p.path} (${p.mediaType})`
    }))
  ];
  return /* @__PURE__ */ l.jsxs(ye, { gap: "xs", className: "canvas-image-input", children: [
    /* @__PURE__ */ l.jsx(
      Gn,
      {
        id: "canvas-background-image",
        label: x("canvas.backgroundImage"),
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
      Gn,
      {
        id: "canvas-background-image-fit",
        label: x("canvas.backgroundImageFit"),
        value: i?.fit ?? "fill",
        disabled: n || !i,
        data: [
          { value: "fill", label: x("canvas.imageFitFill") },
          { value: "contain", label: x("canvas.imageFitContain") },
          { value: "cover", label: x("canvas.imageFitCover") }
        ],
        onChange: (p) => {
          if (!i) return;
          const m = { ...i, fit: p.currentTarget.value };
          c(m), o(m);
        }
      }
    ),
    /* @__PURE__ */ l.jsxs(Te, { align: "end", gap: "xs", children: [
      /* @__PURE__ */ l.jsx(
        Ya,
        {
          id: "canvas-background-upload",
          label: x("canvas.backgroundImageUpload"),
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
        ge,
        {
          id: "canvas-background-image-clear",
          type: "button",
          variant: "light",
          color: "red",
          disabled: n,
          onClick: () => {
            c(null), o(null);
          },
          children: x("canvas.removeBackgroundImage")
        }
      ) : null
    ] })
  ] });
}
let jb = 0;
function kb(e, t) {
  return qe(
    `canvas-image-${++jb}`,
    e,
    /* @__PURE__ */ l.jsx(Cb, { ...t })
  );
}
const Eb = [
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
function Rb({ value: e, disabled: t, onChange: n }) {
  return Fe(), /* @__PURE__ */ l.jsx(
    mn.Group,
    {
      id: "canvas-anchor-group",
      name: "canvas-anchor",
      value: e,
      onChange: (o) => n(o),
      children: /* @__PURE__ */ l.jsx(ol, { cols: 3, className: "canvas-size-anchor-grid", children: Eb.map((o) => /* @__PURE__ */ l.jsx(
        mn,
        {
          value: o.value,
          label: /* @__PURE__ */ l.jsx("span", { title: x(o.key), children: o.glyph }),
          "aria-label": x(o.key),
          disabled: t,
          className: "canvas-anchor"
        },
        o.value
      )) })
    }
  );
}
function Nb(e, t, n, o) {
  let r = (i, c) => {
  };
  function s() {
    const [i, c] = u.useState(t), [d, f] = u.useState(n);
    return u.useEffect(() => (r = (p, m) => {
      c(p), f(m);
    }, () => {
      r = () => {
      };
    }), []), /* @__PURE__ */ l.jsx(Rb, { value: i, disabled: d, onChange: o });
  }
  const a = qe("canvas-anchor-picker", e, /* @__PURE__ */ l.jsx(s, {}));
  return { setState: (i, c) => r(i, c), destroy: a };
}
const Un = (e) => typeof e == "function" ? e() : e;
function Pb(e) {
  Fe();
  const t = Un(e.label), n = e.title === void 0 ? void 0 : Un(e.title), o = u.useRef(e.value), r = (s) => {
    s !== o.current && (o.current = s, e.onCommit(s));
  };
  return e.options ? /* @__PURE__ */ l.jsx(
    Gn,
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
      data: e.options.map((s) => ({ value: s.value, label: Un(s.label) })),
      classNames: e.className ? { input: e.className } : void 0,
      onChange: (s) => r(s.currentTarget.value)
    }
  ) : e.type === "textarea" ? /* @__PURE__ */ l.jsx(
    Zr,
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
    dt,
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
function Tb(e) {
  Fe();
  const t = Un(e.label), n = e.title === void 0 ? void 0 : Un(e.title);
  return /* @__PURE__ */ l.jsx(
    ge,
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
let li = 0;
function Ab(e) {
  Fe();
  const [t, n] = u.useState(e.checked);
  return u.useEffect(() => {
    n(e.checked);
  }, [e.checked]), /* @__PURE__ */ l.jsx(
    Yt,
    {
      id: e.id,
      label: Un(e.label),
      checked: t,
      disabled: e.disabled,
      classNames: e.className ? { input: e.className } : void 0,
      onChange: (o) => {
        n(o.currentTarget.checked), e.onChange(o.currentTarget.checked);
      }
    }
  );
}
function wo(e, t) {
  return qe(`inspector-checkbox-${++li}`, e, /* @__PURE__ */ l.jsx(Ab, { ...t }));
}
function nt(e, t) {
  return qe(`inspector-field-${++li}`, e, /* @__PURE__ */ l.jsx(Pb, { ...t }));
}
function Qe(e, t) {
  return qe(`inspector-button-${++li}`, e, /* @__PURE__ */ l.jsx(Tb, { ...t }));
}
function Ib({ state: e, onClose: t }) {
  return Fe(), u.useEffect(() => {
    e.open && document.querySelector("#context-menu button[role=menuitem]:not(:disabled)")?.focus();
  }, [e.open, e.items]), /* @__PURE__ */ l.jsx(
    Kn,
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
      children: /* @__PURE__ */ l.jsx(ye, { gap: 4, children: e.items.map((n, o) => n.kind === "separator" ? /* @__PURE__ */ l.jsx(Gr, { role: "separator" }, `separator-${o}`) : /* @__PURE__ */ l.jsx(
        ge,
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
          children: x(n.key)
        },
        `${n.key}-${o}`
      )) })
    }
  );
}
function Mb(e) {
  const t = { open: !1, items: [], x: 8, y: 8 };
  let n = t, o = (a) => {
  };
  function r() {
    const [a, i] = u.useState(t);
    return u.useEffect(() => (o = (c) => {
      n = c, i(c);
    }, () => {
      o = () => {
      };
    }), []), /* @__PURE__ */ l.jsx(Ib, { state: a, onClose: () => o({ ...n, open: !1 }) });
  }
  const s = qe("context-menu", e, /* @__PURE__ */ l.jsx(r, {}));
  return {
    open(a, i, c) {
      const d = { open: !0, items: a, x: Math.min(window.innerWidth - 240, Math.max(8, i)), y: Math.min(window.innerHeight - 400, Math.max(8, c)) };
      n = d, o(d);
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
const Db = {
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
}, Lb = {
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
function Ob({ title: e, initiallyOpen: t, bodyElement: n }) {
  Fe();
  const [o, r] = u.useState(t ? e : null), s = Db[e], a = s ? x(s) : e;
  return /* @__PURE__ */ l.jsx(
    Ne,
    {
      value: o,
      onChange: r,
      keepMounted: !0,
      keepMountedMode: "display-none",
      className: "dock-accordion",
      classNames: { item: "dock-section", control: "dock-section-control", panel: "dock-section-panel", content: "dock-section-content" },
      children: /* @__PURE__ */ l.jsxs(Ne.Item, { value: e, children: [
        /* @__PURE__ */ l.jsx(Ne.Control, { children: /* @__PURE__ */ l.jsxs(Te, { gap: "xs", wrap: "nowrap", children: [
          /* @__PURE__ */ l.jsx("span", { className: "dock-section-icon", children: /* @__PURE__ */ l.jsx("i", { className: `ph ${Lb[e] ?? "ph-sliders-horizontal"}`, "aria-hidden": "true" }) }),
          /* @__PURE__ */ l.jsx(oe, { component: "span", className: "dock-section-heading", children: a })
        ] }) }),
        /* @__PURE__ */ l.jsx(Ne.Panel, { children: /* @__PURE__ */ l.jsx("div", { ref: (i) => {
          i && n.parentElement !== i && i.append(n);
        } }) })
      ] })
    }
  );
}
let $b = 0;
function _b(e, t, n) {
  const o = document.createElement("div");
  o.className = "dock-section-host", e.append(o);
  const r = document.createElement("div");
  r.className = "dock-section-body";
  const s = `inspector-section-${++$b}`, a = qe(
    s,
    o,
    /* @__PURE__ */ l.jsx(Ob, { title: t, initiallyOpen: n, bodyElement: r })
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
}, uo = new Zy(), Kt = [];
uo.onSettled = (e) => {
  Kt.push({
    label: e.label,
    ok: e.ok,
    superseded: e.superseded,
    at: performance.now() - e.waitedMs,
    waitedMs: e.waitedMs,
    ranMs: e.ranMs,
    previewSettledAt: null
  }), Kt.length > 50 && Kt.shift(), Ou();
};
function ta(e, t) {
  Nf(e, t);
}
uo.onActiveChange = (e) => {
  E.busy = e, e ? (kf("info"), ta("ph-circle-notch", "save.working")) : Ef() !== "error" && ta("ph-check-circle", "save.allChangesSaved");
};
function zb() {
  for (let e = Kt.length - 1; e >= 0; e--) {
    const t = Kt[e];
    if (t && t.previewSettledAt === null) {
      t.previewSettledAt = performance.now();
      break;
    }
  }
  Ou();
}
const Fb = new URLSearchParams(window.location.search).has("perf");
window.__assemblashPerf = Kt;
function Ou() {
  if (!Fb) return;
  let e = document.getElementById("assemblash-perf");
  e || (e = document.createElement("div"), e.id = "assemblash-perf", e.setAttribute(
    "style",
    "position:fixed;bottom:8px;left:8px;z-index:9999;font:11px/1.5 ui-monospace,monospace;background:rgba(0,0,0,.82);color:#eee;padding:6px 9px;border-radius:6px;pointer-events:none;white-space:pre"
  ), document.body.append(e));
  const t = Kt[Kt.length - 1], n = t && t.previewSettledAt !== null ? `${Math.round(t.previewSettledAt - t.at)}ms` : "…";
  e.textContent = t ? `${t.label}: waited ${t.waitedMs}ms, ran ${t.ranMs ?? "–"}ms, settled ${n}
queue ${uo.size}, records ${Kt.length}` : "no interactions yet";
}
const di = "#3366cc";
function Bb(e) {
  return typeof e == "string" ? e : null;
}
const $u = "#111111", _u = 2, Vb = ["rect", "ellipse"];
function Hb(e) {
  const t = e.clip;
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = t.shape;
    if (typeof n == "string") return n;
  }
  return null;
}
function Ic(e) {
  const t = e.clip;
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = t.cornerRadius;
    if (typeof n == "number") return n;
  }
  return 0;
}
function Wb(e) {
  if (e.type !== "image") return null;
  const t = e.crop;
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = t, o = n.x, r = n.y, s = n.width, a = n.height;
    if (typeof o == "number" && typeof r == "number" && typeof s == "number" && typeof a == "number")
      return { x: o, y: r, width: s, height: a };
  }
  return null;
}
function Ub(e) {
  return e.type !== "image" && e.type !== "svg" ? null : (E.document?.assets ?? []).find((t) => t.id === e.asset) ?? null;
}
let Pt = null, Io = [], Gt = null, Nr = null;
function G(e) {
  const t = document.getElementById(e);
  if (!t) throw new Error(`missing element #${e}`);
  return t;
}
function Mc(e) {
  const t = document.createElement("span");
  return t.dataset.i18n = e, t.textContent = x(e), t;
}
const Dt = sb();
let na = "", ui = null, fi = "layers";
const qb = yb(G("structure-panel"), {
  document: null,
  selectedIds: [],
  query: na,
  history: ui,
  dock: fi
}, {
  setQuery(e) {
    na = e, St();
  },
  select(e, t) {
    E.selection = t ? E.selection.includes(e) ? E.selection.filter((n) => n !== e) : [...E.selection, e] : [e], St(), Ct(), ot(), window.matchMedia("(max-width: 720px)").matches && mi()?.type !== "text" && (P.structure.classList.remove("mobile-open"), P.dockToggle.setAttribute("aria-expanded", "false"));
  },
  toggleVisibility(e) {
    const t = E.document && Ye(Oe(E.document)).find((n) => n.layer.id === e)?.layer;
    t && ne(t.visible === !1 ? "show layer" : "hide layer", { op: "setVisible", id: e, visible: t.visible === !1 });
  },
  toggleLocked(e) {
    const t = E.document && Ye(Oe(E.document)).find((n) => n.layer.id === e)?.layer;
    t && ne(t.locked ? "unlock layer" : "lock layer", { op: "setLocked", id: e, locked: !t.locked });
  },
  rename(e, t) {
    ne("rename layer", { op: "rename", id: e, name: t || void 0 });
  },
  reorder(e, t, n) {
    const o = n.at === "root" ? { at: "root", index: n.index } : { at: "in", parent: n.parent, index: n.index };
    ne("reorder layer", { op: "reorder", id: e, to: o });
  },
  groupSelection() {
    E.selection.length < 2 || ne("group", { op: "group", ids: [...E.selection] });
  },
  deleteSelection() {
    Oo();
  },
  undo() {
    P.undo.click();
  },
  redo() {
    P.redo.click();
  },
  showDock(e) {
    po(e);
  },
  contextMenu(e, t, n) {
    Ct(), ot(), $o(t, n);
  }
}), Sn = Mb(G("context-menu-root")), P = {
  newProject: G("new-project"),
  renameProject: G("rename-project"),
  deleteProject: G("delete-project"),
  reload: G("reload"),
  get search() {
    return G("project-search");
  },
  recents: G("recents-mount"),
  canvasEmpty: G("canvas-empty"),
  canvas: G("canvas"),
  canvasImage: G("canvas-image"),
  overlay: G("overlay"),
  structure: G("structure-panel"),
  layers: G("layers"),
  layerSearch: G("layer-search"),
  inspector: G("inspector"),
  advancedInspector: G("advanced-inspector"),
  propertiesPanel: G("properties-panel"),
  propertiesTab: G("properties-tab"),
  history: G("history"),
  layersTab: G("layers-tab"),
  historyTab: G("history-tab"),
  layersView: G("layers-view"),
  historyView: G("history-view"),
  historyShortcut: G("history-shortcut"),
  statusChromeRoot: G("status-chrome-root"),
  version: G("version"),
  selectTool: G("select-tool"),
  addPanel: G("add-panel"),
  addPanelTitle: G("add-panel-title"),
  addPanelClose: G("add-panel-close"),
  dockToggle: G("dock-toggle"),
  addText: G("add-text"),
  addShape: G("add-shape"),
  addImage: G("add-image"),
  uploadFeedback: G("upload-feedback"),
  openTemplates: G("open-templates"),
  deleteLayer: G("delete-layer"),
  groupLayers: G("group-layers"),
  undo: G("undo"),
  redo: G("redo"),
  exportButton: G("export"),
  shutdown: G("shutdown"),
  emptyCreate: G("empty-create"),
  agents: G("agents"),
  positionPopover: G("position-popover"),
  positionClose: G("position-close"),
  positionFields: G("position-fields"),
  contextMenu: G("context-menu"),
  stageViewport: G("stage-viewport"),
  canvasControlsRoot: G("canvas-controls-root"),
  stage: G("stage"),
  zoomOut: G("zoom-out"),
  zoomValue: G("zoom-value"),
  zoomIn: G("zoom-in"),
  zoom100: G("zoom-100"),
  get templatesPanel() {
    return G("templates");
  },
  templatesToggle: G("templates-toggle"),
  get templatesClose() {
    return G("templates-close");
  },
  settings: G("settings"),
  settingsForm: G("settings-form"),
  settingFollow: G("setting-follow"),
  settingLanguage: G("setting-language"),
  settingsFontsOpen: G("settings-fonts-open"),
  settingUpdateCheck: G("setting-update-check"),
  updateNote: G("update-note"),
  canvasHints: G("canvas-hints")
};
Rf(
  P.statusChromeRoot,
  (e) => {
    Hu(e);
  },
  (e) => {
    window.localStorage.setItem("assemblash-update-banner-v1", e), sl(null);
  }
);
const pi = cb({
  openProject: (e) => nf(e),
  search: () => {
    Le("search", () => er());
  }
}, document.querySelector(".project-combobox")), Kb = nb();
function ds(e, t, n, o) {
  Kb.request(e, t, n, o);
}
function ke(e, t = "info") {
  Tf(e, t);
}
const qn = { families: [], faces: [] }, yn = /* @__PURE__ */ new Map();
let Dc = "";
async function Le(e, t) {
  await uo.enqueue({ label: e, coalesceKey: null, run: t, onError: (n) => kn(e, n) });
}
const Xb = {
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
function zu(e) {
  const t = Xb[e.code];
  return t ? x(t) : `${e.message} (${e.code})`;
}
function kn(e, t) {
  ta("ph-warning-circle", "save.needsAttention"), t instanceof ut ? ke(zu(t), "error") : ke(x("errors.unexpected", { message: String(t) }), "error");
}
G("add-template-section").append(G("templates-mantine-mount"));
const Wt = ub({
  project: () => E.project,
  document: () => E.document,
  say: ke,
  guard: Le,
  refresh: () => et()
}), Jn = Gy({
  project: () => E.project,
  document: () => E.document,
  say: ke,
  guard: Le,
  refresh: () => et(),
  fontsChanged: (e) => {
    qn.families = [...e.families], qn.faces = [...e.faces], ot();
  }
}, G("fonts-mantine-mount")), Yb = Ly({
  project: () => E.project,
  document: () => E.document,
  say: ke,
  guard: Le
}), Gb = eb({
  create: async (e, t, n, o) => {
    let r = !1;
    return await Le("create", async () => {
      await Xv(e, t, n, o, e), await er(e), ke(x("projects.created", { id: e })), r = !0;
    }), r;
  }
}), Fu = Py({ say: ke });
P.agents.addEventListener("click", () => {
  Dt.isOpen() && Dt.close();
}, { capture: !0 });
const Bu = "assemblash-follow-v1";
function oa() {
  return window.localStorage.getItem(Bu) !== "off";
}
function Zb(e = "settings-agents") {
  P.settingFollow.checked = oa();
  const t = pa(), n = t === "pseudo" ? "en" : t;
  P.settingLanguage.value = n, Dt.open(e, { follow: oa(), language: n });
}
P.settings.addEventListener("click", () => Zb());
P.settingLanguage.value = pa();
P.settingLanguage.addEventListener("change", () => {
  Lf(P.settingLanguage.value);
});
jf(() => {
  for (const t of document.querySelectorAll("[data-effect-action]")) {
    const n = t.dataset.effectAction, o = x(n, { effect: t.dataset.effectType ?? "" });
    t.title = o;
    const r = t.querySelector(".sr-only");
    r && (r.textContent = o);
  }
  for (const t of document.querySelectorAll("[data-paint-label-key]")) {
    const n = x(t.dataset.paintLabelKey).toLowerCase();
    t.title = t instanceof HTMLInputElement ? x("canvas.noColor", { label: n }) : x("canvas.removeColor", { label: n });
  }
  for (const t of document.querySelectorAll("[data-resize-handle]"))
    t.setAttribute("aria-label", x("canvas.resizeHandle", { handle: t.dataset.resizeHandle ?? "" }));
  for (const t of document.querySelectorAll("[data-slot-name]"))
    t.title = x("slots.editHint", { name: t.dataset.slotName ?? "" });
  const e = P.canvasImage.dataset.previewName;
  e && (P.canvasImage.alt = x("canvas.previewAlt", { name: e })), E.document && (P.version.textContent = je(Ue(E.document)), fa(
    `${je(Math.round(E.document.canvas.width))} × ${je(Math.round(E.document.canvas.height))}`
  ), Yo());
});
P.settingFollow.addEventListener("change", () => {
  window.localStorage.setItem(Bu, P.settingFollow.checked ? "on" : "off");
});
P.settingsFontsOpen.addEventListener("click", () => {
  Dt.close(), Le("fonts", () => xi(!0));
});
const Jb = "assemblash-update-banner-v1";
async function Vu() {
  let e;
  try {
    e = await cy();
  } catch {
    return;
  }
  P.settingUpdateCheck.checked = e.consent === "notify", rl(e.consent === null);
  const t = window.localStorage.getItem(Jb), n = e.newer && !!e.latest && t !== e.latest;
  sl(n && e.latest ? {
    version: e.latest,
    text: x("updates.versionAvailable", { latest: e.latest, current: e.current }),
    notesUrl: e.notesUrl ?? null
  } : null);
}
async function Hu(e) {
  try {
    const t = await ly(e);
    rl(t.consent === null), P.settingUpdateCheck.checked = t.consent === "notify", ke(t.consent === "notify" ? x("updates.checkOn") : x("updates.checkOff"));
  } catch (t) {
    kn(x("updates.saveChoiceFailed"), t), Vu();
  }
}
P.settingUpdateCheck.addEventListener("change", () => {
  Hu(P.settingUpdateCheck.checked ? "notify" : "off");
});
P.settingsForm.addEventListener("submit", (e) => {
  e.submitter?.value === "cancel" && Dt.close();
});
function mi() {
  if (!E.document || E.selection.length !== 1) return null;
  const e = E.selection[0];
  return Ye(Oe(E.document)).find(({ layer: t }) => t.id === e)?.layer ?? null;
}
function It() {
  if (!E.document) return [];
  const e = new Set(E.selection);
  return Ye(Oe(E.document)).map(({ layer: t }) => t).filter((t) => e.has(t.id));
}
function Mo(e, t = !1) {
  const n = kr(e);
  if (n && (!t || e.protected || e.readOnly)) return n;
  if (!E.document) return null;
  const o = Ye(Oe(E.document));
  let r = o.find((s) => s.layer.id === e.id)?.parent;
  for (; r; ) {
    const s = o.find((i) => i.layer.id === r);
    if (!s) break;
    const a = kr(s.layer);
    if (a) return a;
    r = s.parent;
  }
  return null;
}
function it(e) {
  return Mo(e) === null;
}
function Qb(e, t) {
  let n = 0, o = { x: 0, y: 0 };
  const r = () => {
    window.clearTimeout(n), n = 0;
  };
  e.addEventListener("pointerdown", (s) => {
    s.pointerType !== "touch" && s.pointerType !== "pen" || (o = { x: s.clientX, y: s.clientY }, n = window.setTimeout(() => {
      $o(o.x, o.y), navigator.vibrate?.(20);
    }, 550));
  }), e.addEventListener("pointermove", (s) => {
    Math.hypot(s.clientX - o.x, s.clientY - o.y) > 8 && r();
  }), e.addEventListener("pointerup", r), e.addEventListener("pointercancel", r);
}
let Lc = null, Oc;
function ex() {
  !E.project || Lc === E.project || (Lc = E.project, P.canvasHints.hidden = !1, window.clearTimeout(Oc), Oc = window.setTimeout(() => {
    P.canvasHints.hidden = !0;
  }, 5e3));
}
let $c = 0;
async function et() {
  if (!E.project) return;
  const e = ++$c, t = await Zv(E.project);
  e !== $c || !E.project || us(t);
}
function us(e) {
  E.document = e, E.selection = E.selection.filter(
    (t) => Ye(Oe(e)).some(({ layer: n }) => n.id === t)
  ), P.version.textContent = je(Ue(e)), P.canvasEmpty.hidden = !0, P.canvas.hidden = !1, P.canvasControlsRoot.hidden = !1, ex(), fa(
    `${je(Math.round(e.canvas.width))} × ${je(Math.round(e.canvas.height))}`
  ), E.slots = e.slots ?? [], Gt !== null && Ue(e) !== Gt && fo(), hi(), St(), Ct(), ot(), tx().catch((t) => kn("presets", t)), dx().catch((t) => kn("history", t));
}
let _c = 0;
async function tx() {
  if (!E.project) return;
  const e = ++_c, t = await hy(E.project);
  e === _c && (E.presets = t);
}
let Ps = null, ho = null, Wu = null;
function hi() {
  if (!E.project || !E.document || (Wu = Pr(), ho = Ue(E.document), Ps)) return;
  const e = E.project;
  Ps = (async () => {
    try {
      for (; ho !== null; ) {
        const t = ho;
        ho = null;
        const n = await To(Ys(e, t, Pr())), o = E.document;
        if (E.project !== e || !o || Ue(o) !== t) {
          URL.revokeObjectURL(n);
          continue;
        }
        const r = P.canvasImage.src;
        P.canvasImage.src = n, r.startsWith("blob:") && URL.revokeObjectURL(r), !E.drag && (Gt === null || t >= Gt) && fo(), P.canvasImage.dataset.previewName = o.name ?? e, P.canvasImage.alt = x("canvas.previewAlt", { name: o.name ?? e }), P.canvas.style.aspectRatio = `${o.canvas.width} / ${o.canvas.height}`, Yo(), zb();
      }
    } catch (t) {
      kn("preview", t);
    } finally {
      Ps = null, ho !== null && hi();
    }
  })();
}
function gi() {
  !E.document || Pr() === Wu || hi();
}
function nx() {
  const e = window.getComputedStyle(P.stage), t = (n) => {
    const o = Number.parseFloat(n);
    return Number.isFinite(o) ? Math.max(0, o) : 0;
  };
  return {
    horizontal: t(e.paddingLeft) + t(e.paddingRight),
    vertical: t(e.paddingTop) + t(e.paddingBottom)
  };
}
function Uu() {
  if (!E.document) return 1;
  const e = nx(), t = Math.max(1, P.stageViewport.clientWidth - e.horizontal), n = Math.max(1, P.stageViewport.clientHeight - e.vertical);
  return Math.min(
    t / E.document.canvas.width,
    n / E.document.canvas.height,
    1
  );
}
function fs() {
  return E.zoom ?? Uu();
}
function Pr() {
  if (!E.document) return 1;
  const e = Math.max(1, window.devicePixelRatio || 1);
  return Math.min(1, Math.max(0.1, fs() * e));
}
function St() {
  qb.setSnapshot({
    document: E.document,
    selectedIds: E.selection,
    query: na,
    history: ui,
    dock: fi
  });
}
function Do(e, t) {
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
function Ct() {
  if (P.overlay.replaceChildren(), !E.document) return;
  const { width: e, height: t } = E.document.canvas, n = Ye(Oe(E.document)), o = n.flatMap(({ layer: c, parent: d }) => {
    const f = Do(n, d);
    return f ? [{
      layer: c,
      x: c.transform.x + f.x,
      y: c.transform.y + f.y,
      width: c.transform.width,
      height: c.transform.height
    }] : [];
  });
  for (const c of o) {
    const d = document.createElement("div");
    d.className = "layer-hitbox", d.dataset.id = c.layer.id, d.style.left = `${c.x / e * 100}%`, d.style.top = `${c.y / t * 100}%`, d.style.width = `${c.width / e * 100}%`, d.style.height = `${c.height / t * 100}%`, d.style.transformOrigin = "center", d.style.transform = `rotate(${c.layer.transform.rotation ?? 0}deg)`, d.addEventListener("pointerdown", (f) => {
      f.shiftKey || f.ctrlKey || f.metaKey ? E.selection = E.selection.includes(c.layer.id) ? E.selection.filter((p) => p !== c.layer.id) : [...E.selection, c.layer.id] : E.selection.includes(c.layer.id) || (E.selection = [c.layer.id]), St(), ot(), Ct();
    }), d.addEventListener("dblclick", (f) => {
      f.stopPropagation(), c.layer.type === "text" && Qn(c.layer);
    }), d.addEventListener("contextmenu", (f) => {
      f.preventDefault(), E.selection.includes(c.layer.id) || (E.selection = [c.layer.id]), St(), ot(), Ct(), $o(f.clientX, f.clientY);
    }), Qb(d), P.overlay.append(d);
  }
  const r = o.filter(({ layer: c }) => E.selection.includes(c.id));
  if (r.length === 0) return;
  mx(r.map(({ layer: c }) => c.id));
  const s = r.length === 1 ? {
    x: r[0].x,
    y: r[0].y,
    width: r[0].width,
    height: r[0].height
  } : ci(r.map((c) => ({
    x: c.x,
    y: c.y,
    width: c.width,
    height: c.height,
    rotation: c.layer.transform.rotation ?? 0
  }))), a = document.createElement("div");
  if (a.className = "handle-box", a.style.left = `${s.x / e * 100}%`, a.style.top = `${s.y / t * 100}%`, a.style.width = `${s.width / e * 100}%`, a.style.height = `${s.height / t * 100}%`, a.style.transformOrigin = "center", r.length === 1 && (a.style.transform = `rotate(${r[0]?.layer.transform.rotation ?? 0}deg)`), a.dataset.ids = E.selection.join(","), a.addEventListener("contextmenu", (c) => {
    c.preventDefault(), c.stopPropagation(), $o(c.clientX, c.clientY);
  }), r.every(({ layer: c }) => it(c))) {
    a.addEventListener("pointerdown", (d) => Ts(d, r, s, "move")), a.addEventListener("dblclick", (d) => {
      d.stopPropagation();
      const f = r.length === 1 && r[0]?.layer.type === "text" ? r[0].layer : null;
      f && Qn(f);
    });
    for (const d of ["nw", "n", "ne", "e", "se", "s", "sw", "w"]) {
      const f = document.createElement("button");
      f.type = "button", f.className = `resize-handle handle-${d}`, f.dataset.handle = d, f.dataset.resizeHandle = d, f.setAttribute("aria-label", x("canvas.resizeHandle", { handle: d })), f.addEventListener("pointerdown", (p) => {
        p.stopPropagation(), Ts(p, r, s, "resize", d);
      }), a.append(f);
    }
    const c = document.createElement("button");
    c.type = "button", c.className = "rotation-handle", c.setAttribute("aria-label", x("canvas.rotateSelection")), c.dataset.i18nAttr = "aria-label:canvas.rotateSelection", c.innerHTML = '<i class="ph ph-arrow-clockwise" aria-hidden="true"></i>', c.addEventListener("pointerdown", (d) => {
      d.stopPropagation(), Ts(d, r, s, "rotate");
    }), a.append(c);
  } else
    a.classList.add("guarded"), a.title = r.map(({ layer: c }) => Mo(c)).filter(Boolean).join("; ");
  P.overlay.append(a);
}
function ox(e) {
  if (!E.document) return;
  const t = E.document.canvas, n = document.createElement("form");
  n.id = "canvas-settings", n.className = "canvas-settings", n.setAttribute("aria-label", x("canvas.settingsLabel")), n.innerHTML = [
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
  ve.push(nt(o, {
    id: "canvas-width",
    label: () => x("canvas.widthPx"),
    value: String(t.width),
    type: "number",
    min: 0,
    step: "any",
    onMount: (T) => {
      s = T, N();
    },
    onCommit: () => {
    }
  })), ve.push(nt(r, {
    id: "canvas-height",
    label: () => x("canvas.heightPx"),
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
  const c = n.querySelector("#canvas-transparent-mount"), d = n.querySelector("#canvas-size-anchor-grid"), f = n.querySelector(".canvas-anchor-fieldset"), p = n.querySelector("#canvas-apply-mount");
  let m = t.background ?? "#ffffff", h = t.backgroundImage ?? null, g = t.background == null, y = "top-left";
  gr(
    n.querySelector("#canvas-background-paint"),
    "canvas-background",
    x("common.background"),
    m,
    !1,
    (T) => {
      m = T, g = !1, k(), N();
    }
  );
  const w = () => ({
    id: "canvas-transparent",
    label: () => x("canvas.transparentBackground"),
    checked: g,
    onChange(T) {
      g = T, N();
    }
  });
  let b = wo(c, w());
  ve.push(() => b());
  function k() {
    la(() => {
      b(), b = wo(c, w());
    });
  }
  const C = Nb(d, y, !0, (T) => {
    y = T, N();
  });
  ve.push(C.destroy), ve.push(kb(n.querySelector("#canvas-background-image-mount"), {
    assets: E.document.assets ?? [],
    value: h,
    onChange(T) {
      h = T, ne(T ? "set canvas background image" : "clear canvas background image", T ? { op: "updateCanvas", backgroundImage: T } : { op: "updateCanvas", clearBackgroundImage: !0 });
    },
    onUpload(T) {
      const S = E.project;
      S && Le("upload canvas background image", async () => {
        const v = await ii(S, T), R = {
          op: "updateCanvas",
          backgroundImage: { asset: v.asset.id, fit: h?.fit ?? "fill" }
        }, D = await lo(S, R, v.version);
        ke(x("status.editDone", { version: D.version })), D.document ? us(D.document) : await et();
      });
    }
  })), ve.push(Qe(p, {
    id: "canvas-apply",
    type: "submit",
    label: () => x("canvas.applyChanges"),
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
        T.setCustomValidity(Number.isFinite(T.valueAsNumber) && T.valueAsNumber > 0 ? "" : x("canvas.invalidDimension"));
      f.disabled = !j(), C.setState(y, !j()), i.disabled = !j() && zc(g ? null : m, t.background ?? null);
    }
  }
  n.addEventListener("input", N), n.addEventListener("change", N), n.addEventListener("submit", (T) => {
    if (T.preventDefault(), N(), !i || i.disabled || !n.reportValidity() || !s || !a) return;
    const S = g ? null : m, v = {
      op: "updateCanvas",
      ...j() ? { width: Number(s.value), height: Number(a.value), anchor: y } : {},
      ...zc(S, t.background ?? null) ? {} : { background: S }
    };
    i.disabled = !0, ne("update canvas", v);
  }), N(), e.append(n);
}
function Lo(e, t) {
  const n = _b(
    e,
    t,
    !["Clip and mirror", "Appearance", "Effects", "Presets", "Slots"].includes(t)
  );
  return Ku.push(n.destroy), n.body;
}
const qu = [], ve = [], Ku = [];
let ln = 0;
function gr(e, t, n, o, r, s, a, i, c = !1) {
  ve.push(Sb(e, { id: t, label: n, value: o, disabled: r, onCommit: s, className: a, clear: i, compact: c }));
}
function zc(e, t) {
  return JSON.stringify(e) === JSON.stringify(t);
}
function Fc(e, t) {
  const n = Ky({ store: () => qn }, (o) => {
    ne("change font", { op: "update", id: e.id, fontFamily: o });
  });
  return qu.push(n), n.setFamily(e.fontFamily), n.setDisabled(t), n;
}
let Bc = "";
function rx(e) {
  const t = e.map((n) => n.id).join(",");
  t !== Bc && e.length === 1 && e[0]?.type === "text" && (po("properties"), window.matchMedia("(max-width: 720px)").matches && (P.structure.classList.add("mobile-open"), P.dockToggle.setAttribute("aria-expanded", "true"))), Bc = t;
}
function ot() {
  la(sx);
}
function sx() {
  for (const S of qu.splice(0)) S.destroy();
  for (const S of ve.splice(0)) S();
  for (const S of Ku.splice(0)) S();
  ea(P.inspector), ea(P.advancedInspector), P.inspector.replaceChildren(), P.advancedInspector.replaceChildren();
  let e = P.advancedInspector;
  const t = (S) => (e = Lo(P.advancedInspector, S), e), n = It(), o = n.length === 1 ? n[0] ?? null : null;
  rx(n);
  const r = n.map((S) => S.id).join(",");
  if (r !== Dc && (yn.clear(), Dc = r), P.deleteLayer.disabled = n.length === 0 || n.some((S) => !it(S)), P.groupLayers.disabled = n.length < 2 || n.some((S) => !it(S)), bi(n), E.document) {
    const S = document.createElement("span");
    S.style.display = "contents", ve.push(Qe(S, {
      id: "edit-canvas",
      label: () => x("editor.canvasSizeBackground"),
      icon: "ph-frame-corners",
      className: "toolbar-action",
      onClick() {
        Sn.close(), E.selection = [], St(), Ct(), ot(), po("properties");
      }
    })), P.inspector.append(S);
  }
  if (n.length === 0) {
    const S = document.createElement("div");
    S.className = "inspector-empty", S.innerHTML = '<i class="ph ph-cursor-click" aria-hidden="true"></i><span data-i18n="editor.selectLayerHint">Select a layer to edit it</span>', P.inspector.append(S);
    const v = document.createElement("p");
    if (v.className = "empty-panel-copy", v.dataset.i18n = E.document ? "editor.setCanvasHint" : "editor.openProjectHint", v.textContent = x(E.document ? "editor.setCanvasHint" : "editor.openProjectHint"), e.append(v), E.document) {
      const R = Lo(P.advancedInspector, "Canvas");
      ox(R);
    }
    return;
  }
  const s = n.some((S) => !it(S));
  let a = 0;
  const i = (S, v, R, D = s, L = "toolbar-action", F, _ = !1) => {
    const z = document.createElement("span");
    return z.className = "inspector-button-host", z.style.display = "contents", ve.push(Qe(z, {
      id: `inspector-action-${++a}`,
      label: () => x(S),
      icon: v,
      className: L,
      iconOnly: _,
      disabled: D,
      onMount(O) {
        O.title = x(S), F?.(O);
      },
      onClick: R
    })), z;
  };
  if (o?.type === "text") {
    const S = document.createElement("label");
    S.className = "toolbar-field toolbar-font", S.append(Mc("editor.fontFamily")), S.firstElementChild?.classList.add("sr-only");
    const v = Fc(o, s);
    S.append(v.root), P.inspector.append(S);
    const R = document.createElement("span");
    R.className = "toolbar-field toolbar-number", ve.push(nt(R, {
      id: "toolbar-font-size",
      label: () => x("editor.fontSize"),
      value: String(o.fontSize),
      type: "number",
      size: "xs",
      min: 1,
      disabled: s,
      className: "toolbar-font-size",
      onCommit: (F) => {
        ne("change font size", {
          op: "update",
          id: o.id,
          fontSize: Number(F)
        });
      }
    })), P.inspector.append(R);
    const D = document.createElement("div");
    D.className = "toolbar-paint", gr(
      D,
      "text-color",
      x("editor.textColour"),
      o.color ?? "#000000",
      s,
      (F) => {
        ne("change colour", { op: "update", id: o.id, color: F });
      },
      "toolbar-colour",
      void 0,
      !0
    ), P.inspector.append(D);
    for (const [F, _] of [
      ["left", "ph-text-align-left"],
      ["center", "ph-text-align-center"],
      ["right", "ph-text-align-right"]
    ]) {
      const z = {
        left: "editor.alignLeft",
        center: "editor.alignCenter",
        right: "editor.alignRight"
      }[F], O = i(z, _, () => {
        ne(`align text ${F}`, { op: "update", id: o.id, align: F });
      }, s, "icon-button toolbar-icon", (M) => {
        M.classList.toggle("selected", (o.align ?? "left") === F);
      }, !0);
      P.inspector.append(O);
    }
    const L = document.createElement("span");
    L.className = "toolbar-divider", P.inspector.append(L);
  } else {
    const S = document.createElement("span");
    S.className = "selection-label", n.length === 1 ? S.textContent = o?.type ?? x("editor.layerGeneric") : (S.dataset.i18nCount = "editor.layerCount", S.dataset.count = String(n.length), S.textContent = Tt("editor.layerCount", n.length)), P.inspector.append(S);
  }
  const c = n.map((S) => S.id);
  if (P.inspector.append(
    i("editor.centreHorizontally", "ph-align-center-horizontal", () => {
      ne("centre horizontally", { op: "centerOnCanvas", ids: c, axis: "horizontal" });
    }),
    i("editor.centreVertically", "ph-align-center-vertical", () => {
      ne("centre vertically", { op: "centerOnCanvas", ids: c, axis: "vertical" });
    }),
    i("position.title", "ph-bounding-box", () => eo(), !1, "toolbar-action position-button"),
    i("layers.groupButton", "ph-stack", () => {
      c.length > 1 && ne("group", { op: "group", ids: c });
    }, s || c.length < 2),
    i("editor.duplicate", "ph-copy", () => {
      ht("duplicate", c.map((S) => ({ op: "duplicate", id: S })));
    })
  ), !o) {
    const S = document.createElement("p");
    S.className = "empty-panel-copy";
    const v = n.filter((D) => D.type === "text"), R = v.length > 1 && new Set(v.map((D) => D.fontFamily)).size > 1;
    S.dataset.i18n = R ? "properties.mixedFonts" : "editor.selectionCountHint", S.textContent = R ? x("properties.mixedFonts") : x("editor.selectionCountHint", { count: n.length }), e.append(S);
    return;
  }
  const d = Mo(o);
  if (d) {
    const S = document.createElement("p");
    S.className = "guarded-note", S.textContent = d, e.append(S);
  }
  const f = (S, v, R, D = "number", L, F, _ = !1) => {
    const z = document.createElement("div");
    z.className = "field", ve.push(nt(z, {
      id: F ?? `field-${S.replaceAll(".", "-")}`,
      label: () => x(S),
      value: v,
      type: D,
      className: F,
      disabled: d !== null || _,
      list: L,
      onCommit(O) {
        if (O === v) return;
        const M = R(O);
        M && ne(`change ${x(S)}`, M);
      }
    })), e.append(z);
  }, p = (S, v, R, D, L, F = !1) => {
    const _ = document.createElement("div");
    _.className = "field", ve.push(nt(_, {
      id: v,
      label: () => x(S),
      value: R,
      className: v,
      disabled: d !== null || F,
      options: D,
      onCommit: L
    })), e.append(_);
  }, m = (S, v, R, D, L) => {
    const F = document.createElement("div");
    F.className = "field paint-field", gr(
      F,
      v,
      x(S),
      R,
      d !== null,
      (_) => {
        ne(`change ${x(S)}`, D(_));
      },
      v,
      L ? {
        label: x("canvas.none"),
        className: L.className,
        title: x("canvas.removeColor", { label: x(S).toLowerCase() }),
        disabled: L.disabled,
        onClear: L.onClear
      } : void 0
    ), e.append(F);
  };
  if (o.type === "text") {
    e = t("Typography");
    const S = document.createElement("span");
    S.style.display = "contents", ve.push(Qe(S, {
      id: "edit-layer-text",
      label: () => x("canvas.editText"),
      icon: "ph-pencil-simple",
      className: "wide-action edit-text-button",
      disabled: d !== null,
      onClick: () => Qn(o)
    })), e.append(S);
    const v = qn.families.includes(o.fontFamily), R = document.createElement("div");
    R.className = "current-font-summary";
    const D = document.createElement("strong");
    D.className = "current-font-family", D.textContent = o.fontFamily;
    const L = document.createElement("span");
    if (L.className = "current-font-face", L.textContent = `${o.fontWeight ?? 400} · ${o.fontStyle ?? "normal"} · ${o.fontSize} px`, R.append(D, L), v) {
      const A = document.createElement("span");
      A.className = "current-font-specimen";
      const B = qn.faces.find(
        (W) => W.family === o.fontFamily && W.weight === (o.fontWeight ?? 400) && W.style === (o.fontStyle ?? "normal")
      );
      if (B)
        Du(A, B);
      else {
        const W = document.createElement("span");
        W.className = "font-specimen-status", W.textContent = x("fonts.previewUnavailable"), A.append(W);
      }
      R.append(A);
    } else {
      const A = document.createElement("p");
      A.className = "current-font-status", A.dataset.i18n = "properties.fontMissing", A.textContent = x("properties.fontMissing");
      const B = document.createElement("span");
      B.style.display = "contents", ve.push(Qe(B, {
        id: "install-fonts",
        label: () => x("fonts.installFonts"),
        className: "small",
        onClick: () => {
          Le("fonts", () => xi(!0));
        }
      })), R.append(A, B);
    }
    e.append(R);
    const F = document.createElement("label");
    F.className = "field", F.append(Mc("properties.font"));
    const _ = Fc(o, d !== null);
    F.append(_.root), e.append(F), f("properties.fontSize", String(o.fontSize), (A) => ({ op: "update", id: o.id, fontSize: Number(A) })), f("properties.lineHeight", String(o.lineHeight ?? 1.2), (A) => ({ op: "update", id: o.id, lineHeight: Number(A) }));
    const z = Lu(o.fontFamily, qn.faces);
    if (z.length) {
      const A = o.fontWeight ?? 400, B = o.fontStyle ?? "normal", W = [.../* @__PURE__ */ new Set([
        ...z.filter((U) => U.style === B).map((U) => U.weight),
        A
      ])].sort((U, Z) => U - Z);
      p(
        "properties.weight",
        "font-weight",
        String(A),
        W.map((U) => ({ value: String(U), label: String(U) })),
        (U) => {
          ne("change Weight", { op: "update", id: o.id, fontWeight: Number(U) });
        }
      );
    } else
      f("properties.weight", String(o.fontWeight ?? 400), (A) => ({ op: "update", id: o.id, fontWeight: Number(A) }));
    f("properties.letterSpacing", String(o.letterSpacing ?? 0), (A) => ({ op: "update", id: o.id, letterSpacing: Number(A) }));
    const O = o.fontStyle ?? "normal", M = o.fontWeight ?? 400, $ = z.filter((A) => A.weight === M).map((A) => A.style === "oblique" ? "italic" : A.style), I = z.length ? [.../* @__PURE__ */ new Set([...$, O])] : [O];
    p(
      "properties.style",
      "font-style",
      o.fontStyle ?? "normal",
      I.map((A) => ({ value: A, label: A })),
      (A) => {
        ne("change font style", { op: "update", id: o.id, fontStyle: A });
      }
    ), p(
      "properties.verticalAlign",
      "vertical-align",
      o.verticalAlign ?? "top",
      ["top", "middle", "bottom"].map((A) => ({ value: A, label: A })),
      (A) => {
        ne("change vertical align", { op: "update", id: o.id, verticalAlign: A });
      }
    ), m(
      "properties.colour",
      "text-fill",
      o.color ?? "#000000",
      (A) => ({ op: "update", id: o.id, color: A })
    ), m(
      "properties.strokeColour",
      "text-stroke",
      o.stroke?.color ?? "#000000",
      (A) => ({ op: "update", id: o.id, stroke: { color: A, width: o.stroke?.width ?? 1 } }),
      { className: "text-stroke-none", disabled: !o.stroke, onClear: () => {
        ne("clear text stroke", { op: "update", id: o.id, stroke: null });
      } }
    ), f("properties.strokeWidth", String(o.stroke?.width ?? 1), (A) => ({ op: "update", id: o.id, stroke: { color: o.stroke?.color ?? "#000000", width: Number(A) } }));
  }
  t("Transform");
  const h = document.createElement("div");
  h.className = "property-grid";
  const g = (S, v, R) => {
    const D = `transform-${S.split(".").at(-1)}`, L = document.createElement("div");
    L.className = "field", ve.push(nt(L, {
      id: D,
      label: () => x(S),
      value: v,
      type: "number",
      className: D,
      disabled: d !== null,
      onCommit(F) {
        const _ = R(F);
        _ && ne(`change ${x(S)}`, _);
      }
    })), h.append(L);
  }, y = o.transform;
  if (g("properties.x", String(y.x), (S) => Hc(o, Number(S), y.y)), g("properties.y", String(y.y), (S) => Hc(o, y.x, Number(S))), g("properties.width", String(y.width), (S) => Wc(o, Number(S), y.height)), g("properties.height", String(y.height), (S) => Wc(o, y.width, Number(S))), g("properties.rotation", String(y.rotation ?? 0), (S) => ({ op: "rotate", id: o.id, degrees: Number(S) })), g("properties.opacity", String(o.opacity ?? 1), (S) => ({ op: "update", id: o.id, opacity: Number(S) })), e.append(h), (o.type === "image" || o.type === "svg") && (e = t("Media"), p(
    "properties.fit",
    "layer-fit",
    o.fit ?? "fill",
    dy.map((S) => ({ value: S, label: S })),
    (S) => {
      ne("change fit", { op: "update", id: o.id, fit: S });
    }
  ), o.type === "image")) {
    const S = Wb(o), v = Ub(o), R = v?.width ?? null, D = v?.height ?? null, L = typeof R == "number" && R > 0 && typeof D == "number" && D > 0, F = document.createElement("p");
    F.className = "hint";
    const _ = L ? "canvas.cropAvailableHint" : "canvas.cropUnavailableHint";
    F.dataset.i18n = _, F.textContent = x(_), e.append(F);
    const z = S ?? { x: 0, y: 0, width: R ?? 0, height: D ?? 0 }, O = (A, B, W, U) => {
      f(A, String(W), (Z) => U(Number(Z)), "number", void 0, B, !L);
    }, M = (A) => !Number.isFinite(A.x) || !Number.isFinite(A.y) || !(A.width > 0) || !(A.height > 0) ? null : { op: "update", id: o.id, crop: A };
    O("canvas.cropX", "crop-x", z.x, (A) => M({ ...z, x: A })), O("canvas.cropY", "crop-y", z.y, (A) => M({ ...z, y: A })), O("canvas.cropWidth", "crop-width", z.width, (A) => M({ ...z, width: A })), O("canvas.cropHeight", "crop-height", z.height, (A) => M({ ...z, height: A }));
    const $ = document.createElement("div");
    $.className = "field";
    const I = document.createElement("span");
    I.style.display = "contents", ve.push(Qe(I, {
      id: "clear-image-crop",
      label: () => x("canvas.clearCrop"),
      title: () => x("canvas.wholeImage"),
      className: "small crop-clear",
      disabled: d !== null || S === null,
      onClick: () => {
        ne("clear crop", { op: "update", id: o.id, crop: null });
      }
    })), $.append(I), e.append($);
  }
  if (o.type === "shape") {
    e = t("Shape");
    const S = Tu(o), v = o.stroke?.color ?? $u, R = o.stroke?.width ?? _u, D = (A, B, W, U, Z, le) => {
      const ue = document.createElement("div");
      ue.className = "field shape-field";
      const se = document.createElement("span");
      se.dataset.i18n = A, se.textContent = x(A);
      const ee = document.createElement("span");
      ee.className = "shape-paint", gr(
        ee,
        B,
        x(A),
        W,
        d !== null,
        (pe) => {
          ne(`change ${x(A)}`, Z(pe));
        },
        B,
        {
          label: x("canvas.none"),
          className: `small ${B}-none`,
          title: x("canvas.removeColor", { label: x(A).toLowerCase() }),
          disabled: !U,
          onClear: () => {
            ne(`clear ${x(A)}`, le());
          }
        }
      ), U || (ee.title = x("canvas.noColor", { label: x(A).toLowerCase() })), ue.append(se, ee), e.append(ue);
    };
    D(
      "properties.fill",
      "shape-fill",
      o.fill ?? di,
      !!o.fill,
      (A) => ({ op: "update", id: o.id, fill: A }),
      () => ({ op: "update", id: o.id, fill: null })
    ), D(
      "properties.stroke",
      "shape-stroke",
      v,
      !!o.stroke,
      (A) => ({ op: "update", id: o.id, stroke: { color: A, width: R } }),
      () => ({ op: "update", id: o.id, stroke: null })
    ), f(
      "properties.strokeWidth",
      String(R),
      (A) => ({
        op: "update",
        id: o.id,
        stroke: { color: v, width: Number(A) }
      }),
      "number",
      void 0,
      "shape-stroke-width"
    ), S === "rect" && f(
      "properties.cornerRadius",
      String(uy(o)),
      (A) => ({ op: "update", id: o.id, cornerRadius: Number(A) }),
      "number",
      void 0,
      "shape-corner-radius"
    );
    const L = (A, B) => {
      const W = yn.get(B);
      if (!W) return;
      const U = document.createElement("span");
      U.className = `control-error ${B}-note`, U.textContent = W, A.append(U);
    }, F = (A) => (B) => {
      yn.set(
        A,
        B instanceof ut ? zu(B) : String(B)
      ), ot();
    }, _ = document.createElement("div");
    _.className = "field shape-field shape-path";
    const z = o.shape, O = S === "path" && typeof z.d == "string" ? z.d : "";
    ve.push(nt(_, {
      id: "shape-path-d",
      label: () => x("canvas.pathData"),
      type: "textarea",
      value: O,
      className: "shape-path-d",
      rows: 3,
      maxLength: 2048,
      disabled: d !== null,
      onCommit: (A) => {
        const B = A.trim();
        !B || B === O || (yn.delete("path-d"), ne("set path data", {
          op: "update",
          id: o.id,
          shape: { kind: "path", d: B }
        }, F("path-d")));
      }
    })), L(_, "path-d"), e.append(_);
    const M = document.createElement("div");
    M.className = "field shape-field shape-dash-row";
    const $ = (o.stroke?.dashArray ?? []).join(", ");
    ve.push(nt(M, {
      id: "shape-dash",
      label: () => x("canvas.dashPattern"),
      type: "text",
      value: $,
      className: "shape-dash",
      placeholder: x("canvas.dashExample"),
      disabled: d !== null,
      onCommit: (A) => {
        const B = A.trim();
        yn.delete("dash");
        const W = B ? B.split(",").map((Z) => Number(Z.trim())) : [];
        if (W.some((Z) => !Number.isFinite(Z) || Z <= 0)) {
          yn.set("dash", x("canvas.dashPositiveError")), ot();
          return;
        }
        if (W.length > bc) {
          yn.set("dash", x("canvas.dashMaxError", { count: bc })), ot();
          return;
        }
        const U = {
          ...o.stroke ?? { color: v, width: R },
          dashArray: W.length ? W : null
        };
        ne("change dash pattern", { op: "update", id: o.id, stroke: U }, F("dash"));
      }
    })), L(M, "dash"), e.append(M);
    const I = (A, B, W, U) => {
      const Z = o.stroke?.[W], le = typeof Z == "string" ? Z : null, ue = le && !U.includes(le) ? [...U, le] : [...U];
      p(A, B, le ?? U[0] ?? "", ue.map((se) => ({ value: se, label: se })), (se) => {
        const ee = {
          ...o.stroke ?? { color: v, width: R },
          [W]: se
        };
        ne(`change ${x(A).toLowerCase()}`, { op: "update", id: o.id, stroke: ee });
      });
    };
    if (I("properties.lineCap", "shape-stroke-cap", "lineCap", ["butt", "round", "square"]), I("properties.lineJoin", "shape-stroke-join", "lineJoin", ["miter", "round", "bevel"]), S === "line") {
      const A = (B, W, U) => {
        const Z = z[U], le = typeof Z == "string" && Z !== "none" && !["arrow", "circle"].includes(Z) ? ["none", "arrow", "circle", Z] : ["none", "arrow", "circle"];
        p(
          B,
          W,
          typeof Z == "string" ? Z : "none",
          le.map((ue) => ({ value: ue, label: ue })),
          (ue) => {
            ne(`change ${x(B).toLowerCase()}`, {
              op: "update",
              id: o.id,
              [U]: ue
            });
          }
        );
      };
      A("properties.markerStart", "shape-marker-start", "markerStart"), A("properties.markerEnd", "shape-marker-end", "markerEnd");
    }
  }
  e = t("Clip and mirror");
  const w = Hb(o), b = [...Vb];
  w && !b.includes(w) && b.push(w), p("properties.clip", "clip-shape", w ?? "none", ["none", ...b].map((S) => ({ value: S, label: S })), (S) => {
    if (S === (w ?? "none")) return;
    const v = S === "none" ? null : S === "rect" ? { shape: "rect", cornerRadius: Ic(o) } : { shape: S };
    ne("change clip", { op: "update", id: o.id, clip: v });
  }), w === "rect" && f(
    "properties.clipRadius",
    String(Ic(o)),
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
  const C = (S, v, R, D) => {
    const L = document.createElement("div");
    L.className = "field checkbox", ve.push(wo(L, {
      id: v,
      label: () => x(S),
      checked: D,
      disabled: d !== null,
      className: v,
      onChange: (F) => {
        ne(x(S).toLowerCase(), { op: "update", id: o.id, [R]: F });
      }
    })), k.append(L);
  };
  C("properties.flipHorizontal", "flip-horizontal", "flipHorizontal", o.transform.flipHorizontal ?? !1), C("properties.flipVertical", "flip-vertical", "flipVertical", o.transform.flipVertical ?? !1), e.append(k), e = t("Appearance"), p(
    "properties.blendMode",
    "blend-mode",
    o.blendMode ?? "normal",
    fy.map((S) => ({ value: S, label: S })),
    (S) => {
      ne("change blend mode", { op: "update", id: o.id, blendMode: S });
    }
  ), ax(P.advancedInspector, o, d !== null), ix(P.advancedInspector, o, d !== null), cx(P.advancedInspector, o);
  const j = document.createElement("div");
  j.className = "property-flags";
  const N = document.createElement("div");
  N.className = "field checkbox", ve.push(wo(N, {
    id: "layer-visible",
    label: () => x("properties.visible"),
    checked: o.visible ?? !0,
    disabled: d !== null,
    onChange: (S) => {
      ne("show/hide", { op: "setVisible", id: o.id, visible: S });
    }
  }));
  const T = document.createElement("div");
  T.className = "field checkbox", ve.push(wo(T, {
    id: "layer-locked",
    label: () => x("properties.locked"),
    checked: o.locked ?? !1,
    disabled: Mo(o, !0) !== null,
    onChange: (S) => {
      ne(S ? "lock layer" : "unlock layer", { op: "setLocked", id: o.id, locked: S });
    }
  })), j.append(N, T), e.append(j);
}
function ax(e, t, n) {
  const o = t.effects ?? [], r = Lo(e, "Effects"), s = (f) => {
    ne("effects", { op: "update", id: t.id, effects: f });
  };
  for (const [f, p] of o.entries()) {
    const m = document.createElement("div");
    m.className = "effect-row", m.dataset.effect = p.type;
    const h = document.createElement("span");
    h.className = "effect-name", h.textContent = p.type.replace(/([A-Z])/g, " $1").replace(/^./, (k) => k.toUpperCase()), m.append(h);
    const g = py(p);
    g.length > 1 && m.classList.add("multi");
    const y = (k) => {
      const C = document.createElement("span");
      C.className = "effect-input-host";
      const j = `effect-${t.id}-${f}-${k.name}`;
      return ve.push(nt(C, {
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
          typeof T == "number" && !Number.isFinite(T) || T !== k.value && s(o.map((S, v) => v === f ? { ...S, [k.name]: T } : S));
        }
      })), C;
    };
    if (g.length === 1 && g[0])
      m.append(y(g[0]));
    else if (g.length > 1) {
      const k = document.createElement("span");
      k.className = "effect-fields";
      for (const C of g) {
        const j = document.createElement("label");
        j.className = "effect-field";
        const N = document.createElement("span");
        N.textContent = C.name, j.append(N, y(C)), k.append(j);
      }
      m.append(k);
    }
    const w = (k) => {
      const C = [...o], j = C[f], N = C[k];
      !j || !N || (C[f] = N, C[k] = j, s(C));
    }, b = (k, C, j, N, T) => {
      const S = document.createElement("span");
      return S.style.display = "contents", ve.push(Qe(S, {
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
      b("small effect-up", x("effects.moveUp", { effect: p.type }), "ph-arrow-up", n || f === 0, () => w(f - 1)),
      b("small effect-down", x("effects.moveDown", { effect: p.type }), "ph-arrow-down", n || f === o.length - 1, () => w(f + 1)),
      b("small effect-remove", x("effects.remove"), "ph-trash", n, () => s(o.filter((k, C) => C !== f)))
    ), r.append(m);
  }
  const a = document.createElement("div");
  a.className = "effect-add-row";
  let i = xc[0] ?? "brightness";
  const c = document.createElement("span");
  ve.push(nt(c, {
    id: `effect-chooser-${t.id}`,
    label: () => x("effects.choose"),
    value: i,
    className: "effect-chooser",
    disabled: n,
    options: xc.map((f) => ({ value: f, label: f.replace(/([A-Z])/g, " $1").replace(/^./, (p) => p.toUpperCase()) })),
    onCommit: (f) => {
      i = f;
    }
  }));
  const d = document.createElement("span");
  d.style.display = "contents", ve.push(Qe(d, {
    id: `effect-add-${t.id}`,
    className: "effect-add",
    icon: "ph-plus",
    label: () => x("effects.add"),
    disabled: n,
    onClick: () => {
      const f = P.advancedInspector.querySelector(".effect-chooser");
      f && (i = f.value), s([...o, my(i)]);
    }
  })), a.append(c, d), r.append(a);
}
function ix(e, t, n) {
  const o = Lo(e, "Presets");
  if (E.presets.length === 0) {
    const a = document.createElement("p");
    a.className = "hint", a.dataset.i18n = "presets.none", a.textContent = x("presets.none"), o.append(a);
  }
  for (const a of E.presets) {
    const i = document.createElement("div");
    i.className = "preset-row";
    const c = document.createElement("span");
    c.className = "effect-name", c.textContent = a.name, a.description && (c.title = a.description), i.append(c);
    const d = document.createElement("span");
    d.style.display = "contents", ve.push(Qe(d, {
      id: `preset-apply-${++ln}`,
      label: () => x("common.apply"),
      className: "small",
      disabled: n,
      onClick: () => {
        ne(`apply ${a.name}`, {
          op: "applyPreset",
          id: t.id,
          preset: a.name
        });
      }
    })), i.append(d);
    const f = document.createElement("span");
    f.style.display = "contents", ve.push(Qe(f, {
      id: `preset-remove-${++ln}`,
      label: () => x("common.delete"),
      className: "small",
      onClick: () => {
        ne(`delete ${a.name}`, {
          op: "deletePreset",
          name: a.name
        });
      }
    })), i.append(f), o.append(i);
  }
  const r = document.createElement("div");
  r.className = "inspector-add-row";
  const s = document.createElement("span");
  s.style.display = "contents", ve.push(Qe(s, {
    id: `preset-save-${++ln}`,
    label: () => x("presets.saveStyle"),
    onClick: () => {
      ds("presets.saveTitle", "presets.name", "presets.saveButton", (a) => {
        ne(`define ${a}`, {
          op: "definePreset",
          preset: { name: a, properties: gy(t) }
        });
      });
    }
  })), r.append(s), o.append(r);
}
function cx(e, t) {
  const n = Lo(e, "Slots");
  for (const i of E.slots) {
    const c = document.createElement("div");
    c.className = "slot-row";
    const d = document.createElement("span");
    d.className = "effect-name", d.textContent = `${i.name}${i.required ? " *" : ""}`, d.title = i.description ?? `${i.kind ?? "text"} → ${i.layer}`, i.layer === t.id && d.classList.add("slot-on-this-layer"), c.append(d);
    const f = document.createElement("span");
    f.style.display = "contents", ve.push(Qe(f, {
      id: `slot-edit-${++ln}`,
      label: () => x("common.edit"),
      className: "small slot-edit",
      title: () => x("slots.editHint", { name: i.name }),
      onMount(m) {
        m.dataset.slot = i.name, m.dataset.slotName = i.name;
      },
      onClick: () => lx(c, i)
    })), c.append(f);
    const p = document.createElement("span");
    p.style.display = "contents", ve.push(Qe(p, {
      id: `slot-remove-${++ln}`,
      label: () => x("common.remove"),
      className: "small",
      onClick: () => {
        ne(`remove slot ${i.name}`, {
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
  s.style.display = "contents", ve.push(nt(s, {
    id: `slot-kind-${++ln}`,
    label: () => x("slots.kind"),
    value: r,
    className: "slot-kind-select",
    options: ["text", "image", "color"].map((i) => ({ value: i, label: i })),
    onCommit: (i) => {
      r = i;
    }
  }));
  const a = document.createElement("span");
  a.style.display = "contents", ve.push(Qe(a, {
    id: `slot-offer-${++ln}`,
    label: () => x("slots.offer"),
    onClick: () => {
      ds("slots.createTitle", "slots.name", "slots.createButton", (i) => {
        ne(`offer ${i}`, {
          op: "defineSlot",
          slot: { name: i, layer: t.id, kind: r }
        });
      });
    }
  })), o.append(s, a), n.append(o);
}
function lx(e, t) {
  e.replaceChildren();
  const n = document.createElement("span"), o = document.createElement("span"), r = document.createElement("span"), s = document.createElement("span"), a = document.createElement("span");
  for (const d of [n, o, r, s, a]) d.style.display = "contents";
  e.append(n, o, r, s, a);
  const i = ++ln;
  ve.push(nt(n, {
    id: `slot-edit-name-${i}`,
    label: () => x("slots.name"),
    value: t.name,
    className: "slot-edit-name",
    onCommit: () => {
    }
  })), ve.push(nt(o, {
    id: `slot-edit-kind-${i}`,
    label: () => x("slots.kind"),
    value: t.kind ?? "text",
    className: "slot-edit-kind",
    options: ["text", "image", "color"].map((d) => ({ value: d, label: d })),
    onCommit: () => {
    }
  })), ve.push(nt(r, {
    id: `slot-edit-layer-${i}`,
    label: () => x("slots.layerId"),
    title: () => x("slots.layerIdHint"),
    value: t.layer,
    className: "slot-edit-layer",
    onCommit: () => {
    }
  }));
  const c = (d) => {
    if (!d) {
      ot();
      return;
    }
    const f = e.querySelector(".slot-edit-name")?.value.trim() ?? "";
    f && ne(`update slot ${t.name}`, {
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
  ve.push(Qe(s, {
    id: `slot-edit-save-${i}`,
    label: () => x("common.save"),
    className: "small slot-edit-save",
    onClick: () => c(!0)
  })), ve.push(Qe(a, {
    id: `slot-edit-cancel-${i}`,
    label: () => x("common.cancel"),
    className: "small",
    onClick: () => c(!1)
  })), e.addEventListener("keydown", (d) => {
    d.key === "Enter" && (d.preventDefault(), c(!0)), d.key === "Escape" && (d.preventDefault(), d.stopPropagation(), c(!1));
  }), e.querySelector(".slot-edit-name")?.focus();
}
let Vc = 0;
async function dx() {
  if (!E.project) return;
  const e = ++Vc, t = await Qv(E.project);
  e === Vc && (ui = { entries: t.entries, position: t.position, head: t.head }, St(), P.undo.disabled = t.position === 0, P.redo.disabled = t.position >= t.head);
}
function Hc(e, t, n) {
  const o = t - e.transform.x, r = n - e.transform.y;
  return o === 0 && r === 0 ? null : { op: "move", id: e.id, dx: o, dy: r };
}
function Wc(e, t, n) {
  return t === e.transform.width && n === e.transform.height ? null : { op: "resize", id: e.id, width: t, height: n };
}
function ux(e) {
  if (!("id" in e) || e.op !== "update") return null;
  const t = e.id;
  if (typeof t != "string") return null;
  const n = Object.keys(e).filter((o) => o !== "op" && o !== "id" && o !== "expectedVersion").sort();
  return n.length > 0 ? `update:${t}:${n.join(",")}` : null;
}
function Xu(e) {
  if (!E.document) return !1;
  let t = !1;
  for (const n of e)
    if (n.op === "move" || n.op === "resize" || n.op === "rotate") {
      const o = Ye(Oe(E.document)).find(({ layer: r }) => r.id === n.id)?.layer;
      if (!o) continue;
      n.op === "move" ? (o.transform.x += n.dx, o.transform.y += n.dy) : n.op === "resize" ? (o.transform.width = n.width, o.transform.height = n.height) : o.transform.rotation = n.degrees, t = !0;
    }
  return t && (Ct(), ua() && bi(It())), t;
}
function Yu() {
  const e = E.project, t = E.document ? structuredClone(E.document) : null;
  return () => {
    if (!t || E.project !== e) return;
    const n = E.document;
    if (n && Ue(n) === Ue(t)) {
      fo(), E.document = t, St(), Ct(), ot();
      return;
    }
    Le("reload", et);
  };
}
async function ne(e, t, n) {
  if (!E.project || !E.document) return;
  const o = E.project, r = Yu();
  let s = !1;
  Xu([t]), await uo.enqueue({
    label: e,
    coalesceKey: ux(t),
    run: async () => {
      if (E.project !== o || !E.document) {
        ke(x("status.editNotSent"), "error");
        return;
      }
      const a = await lo(
        o,
        t,
        Ue(E.document)
      );
      s = !0, ke(x("status.editDone", { version: a.version })), a.created?.length && (E.selection = a.created), a.document ? us(a.document) : await et();
    },
    onError: (a) => {
      s || r(), n && n(a), kn(e, a);
    },
    onSuperseded: r
  });
}
async function fx(e, t) {
  await ht(e, t);
}
async function ht(e, t) {
  if (!E.project || !E.document || t.length === 0) return;
  const n = E.project, o = Yu();
  let r = !1;
  Xu(t), await uo.enqueue({
    label: e,
    coalesceKey: null,
    run: async () => {
      if (E.project !== n || !E.document) {
        ke(x("status.editNotSent"), "error");
        return;
      }
      const s = await ey(
        n,
        e,
        t,
        Ue(E.document)
      );
      r = !0, s.created?.length && (E.selection = s.created), ke(x("status.editDone", { version: s.version })), s.document ? us(s.document) : await et();
    },
    onError: (s) => {
      r || o(), kn(e, s);
    }
  });
}
function Ts(e, t, n, o, r) {
  if (e.preventDefault(), !(!E.document || P.canvas.getBoundingClientRect().width === 0)) {
    if (E.drag = {
      ids: t.map(({ layer: s }) => s.id),
      mode: o,
      handle: r,
      startX: e.clientX,
      startY: e.clientY,
      bounds: n,
      origins: t.map(({ layer: s, x: a, y: i, width: c, height: d }) => ({
        id: s.id,
        x: s.transform.x,
        y: s.transform.y,
        absoluteX: a,
        absoluteY: i,
        width: c,
        height: d,
        rotation: s.transform.rotation ?? 0
      })),
      preserveSelectionScale: o === "resize" && t.length === 1 && t[0]?.layer.type === "text"
    }, !px(E.drag)) {
      Gt !== null && fo(), Uc(E.drag);
      const s = Pt;
      !E.drag.previewActive && s && s.pending.then(() => {
        E.drag && Pt === s && Uc(E.drag);
      });
    }
    e.target.setPointerCapture?.(e.pointerId);
  }
}
function px(e) {
  return e.mode !== "move" || !E.document || Nr === null || Gt !== Ue(E.document) ? !1 : (e.adoptedDelta = Nr, e.previewActive = !0, yi(e, e.lastDelta?.x ?? 0, e.lastDelta?.y ?? 0), !0);
}
function Gu(e) {
  return !E.project || !E.document ? null : `${E.project}:${Ue(E.document)}:${[...e].sort().join(",")}`;
}
function Zu() {
  const e = Pt;
  Pt = null, e && (e.baseUrl && !Io.includes(e.baseUrl) && URL.revokeObjectURL(e.baseUrl), e.selectionUrl && !Io.includes(e.selectionUrl) && URL.revokeObjectURL(e.selectionUrl));
}
async function mx(e) {
  const t = Gu(e);
  if (!t || !E.project || !E.document) return;
  if (Pt?.key === t) return Pt.pending;
  Zu();
  const n = E.project, o = Ue(E.document), r = Pr(), s = {
    key: t,
    pending: Promise.resolve()
  };
  return Pt = s, s.pending = Promise.all([
    To(Ys(n, o, r, { exclude: e })),
    To(Ys(n, o, r, { only: e }))
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
function Uc(e) {
  const t = Pt;
  if (e.previewActive || t?.key !== Gu(e.ids) || !t.baseUrl || !t.selectionUrl) return;
  const n = document.createElement("img");
  n.id = "drag-preview-base", n.className = "drag-preview-image", n.alt = "", n.src = t.baseUrl;
  const o = document.createElement("img");
  o.id = "drag-preview-selection", o.className = "drag-preview-image drag-preview-selection", o.alt = "", o.src = t.selectionUrl, P.overlay.before(n, o), P.canvasImage.classList.add("drag-preview-hidden"), Io = [t.baseUrl, t.selectionUrl], e.previewActive = !0, yi(e, e.lastDelta?.x ?? 0, e.lastDelta?.y ?? 0);
}
function fo() {
  document.getElementById("drag-preview-base")?.remove(), document.getElementById("drag-preview-selection")?.remove(), P.canvasImage.classList.remove("drag-preview-hidden");
  for (const e of Io) URL.revokeObjectURL(e);
  Io = [], Gt = null, Nr = null;
}
function vi(e, t, n) {
  const o = e.origins.length === 1 ? e.origins[0] : null;
  return o ? Oy(
    e.bounds,
    o.rotation,
    e.handle ?? "se",
    t,
    n
  ) : Zs(e.bounds, e.handle ?? "se", t, n);
}
function yi(e, t, n) {
  if (!E.document || !e.previewActive) return;
  const o = document.getElementById("drag-preview-selection");
  if (!o) return;
  const r = E.document.canvas;
  if (o.style.transformOrigin = "0 0", e.mode === "move") {
    const s = e.adoptedDelta?.x ?? 0, a = e.adoptedDelta?.y ?? 0;
    o.style.transform = `translate(${(s + t) / r.width * 100}%, ${(a + n) / r.height * 100}%)`;
  } else if (e.mode === "resize") {
    const s = vi(e, t, n);
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
    const c = s.x - e.bounds.x * a, d = s.y - e.bounds.y * i;
    o.style.transform = `translate(${c / r.width * 100}%, ${d / r.height * 100}%) scale(${a}, ${i})`;
  } else {
    const s = P.canvas.getBoundingClientRect(), a = s.left + (e.bounds.x + e.bounds.width / 2) / r.width * s.width, i = s.top + (e.bounds.y + e.bounds.height / 2) / r.height * s.height, c = Math.atan2(e.startY - i, e.startX - a), d = Math.atan2(e.startY + n / Tr() - i, e.startX + t / Tr() - a);
    o.style.transformOrigin = `${(e.bounds.x + e.bounds.width / 2) / r.width * 100}% ${(e.bounds.y + e.bounds.height / 2) / r.height * 100}%`, o.style.transform = `rotate(${(d - c) * 180 / Math.PI}deg)`;
  }
}
function Tr() {
  const e = P.canvas.getBoundingClientRect();
  return !E.document || e.width === 0 ? 1 : E.document.canvas.width / e.width;
}
window.addEventListener("pointermove", (e) => {
  const t = E.drag;
  if (!t || !E.document) return;
  const n = Tr();
  let o = (e.clientX - t.startX) * n, r = (e.clientY - t.startY) * n;
  P.overlay.querySelectorAll(".smart-guide").forEach((c) => c.remove()), t.mode === "move" && ({ dx: o, dy: r } = hx(o, r, t.bounds, t.ids, n)), t.lastDelta = { x: o, y: r }, yi(t, o, r);
  const s = P.overlay.querySelector(".handle-box");
  if (!s) return;
  const { width: a, height: i } = E.document.canvas;
  if (t.mode === "move")
    s.style.left = `${(t.bounds.x + o) / a * 100}%`, s.style.top = `${(t.bounds.y + r) / i * 100}%`;
  else if (t.mode === "resize") {
    const c = vi(t, o, r);
    s.style.left = `${c.x / a * 100}%`, s.style.top = `${c.y / i * 100}%`, s.style.width = `${c.width / a * 100}%`, s.style.height = `${c.height / i * 100}%`;
  } else {
    const c = P.canvas.getBoundingClientRect(), d = c.left + (t.bounds.x + t.bounds.width / 2) / E.document.canvas.width * c.width, f = c.top + (t.bounds.y + t.bounds.height / 2) / E.document.canvas.height * c.height, p = Math.atan2(t.startY - f, t.startX - d), m = Math.atan2(e.clientY - f, e.clientX - d), h = t.origins.length === 1 ? t.origins[0]?.rotation ?? 0 : 0;
    s.style.transform = `rotate(${h + (m - p) * 180 / Math.PI}deg)`;
  }
});
window.addEventListener("pointerup", async (e) => {
  const t = E.drag;
  if (E.drag = null, !t) return;
  const n = Tr(), o = Math.round(t.lastDelta?.x ?? (e.clientX - t.startX) * n), r = Math.round(t.lastDelta?.y ?? (e.clientY - t.startY) * n);
  if (o === 0 && r === 0) {
    Gt === null && fo();
    return;
  }
  if (Gt = Ue(E.document) + 1, Nr = t.mode === "move" ? {
    x: (t.adoptedDelta?.x ?? 0) + o,
    y: (t.adoptedDelta?.y ?? 0) + r
  } : null, t.mode === "move") {
    ht("move selection", t.ids.map((p) => ({ op: "move", id: p, dx: o, dy: r })));
    return;
  }
  if (t.mode === "resize") {
    let p = vi(t, o, r);
    if (t.ids.length === 1 && (t.handle === "e" || t.handle === "w") && E.project && E.document) {
      const g = Ye(Oe(E.document)).find(({ layer: y }) => y.id === t.ids[0])?.layer;
      if (g?.type === "text")
        try {
          const y = await Iu(E.project, g.id, p.width), w = Math.max(1, Math.ceil(y.height));
          p = {
            ...p,
            y: p.y + (p.height - w) / 2,
            height: w
          };
        } catch {
        }
    }
    const h = [];
    for (const g of t.origins) {
      const y = t.origins.length === 1 ? p : Mu(
        {
          x: g.absoluteX,
          y: g.absoluteY,
          width: g.width,
          height: g.height
        },
        t.bounds,
        p
      ), w = Math.round(y.x - g.absoluteX), b = Math.round(y.y - g.absoluteY);
      (w !== 0 || b !== 0) && h.push({ op: "move", id: g.id, dx: w, dy: b }), h.push({
        op: "resize",
        id: g.id,
        width: Math.max(1, Math.round(y.width)),
        height: Math.max(1, Math.round(y.height))
      });
    }
    ht("resize selection", h);
    return;
  }
  const s = P.canvas.getBoundingClientRect(), a = s.left + (t.bounds.x + t.bounds.width / 2) / E.document.canvas.width * s.width, i = s.top + (t.bounds.y + t.bounds.height / 2) / E.document.canvas.height * s.height, c = Math.atan2(t.startY - i, t.startX - a), f = (Math.atan2(e.clientY - i, e.clientX - a) - c) * 180 / Math.PI;
  ht(
    "rotate selection",
    t.origins.map((p) => ({
      op: "rotate",
      id: p.id,
      degrees: Math.round((p.rotation + f) * 10) / 10
    }))
  );
});
function hx(e, t, n, o, r) {
  if (!E.document) return { dx: e, dy: t };
  const s = 6 * r, a = Ye(Oe(E.document));
  let i = n;
  if (o.length === 1) {
    const v = a.find(({ layer: D }) => D.id === o[0]), R = v ? Do(a, v.parent) : null;
    v && R && (i = Gs({
      x: v.layer.transform.x + R.x,
      y: v.layer.transform.y + R.y,
      width: v.layer.transform.width,
      height: v.layer.transform.height,
      rotation: v.layer.transform.rotation ?? 0
    }));
  }
  const c = [
    i.x + e,
    i.x + i.width / 2 + e,
    i.x + i.width + e
  ], d = [
    i.y + t,
    i.y + i.height / 2 + t,
    i.y + i.height + t
  ], f = [0, E.document.canvas.width / 2, E.document.canvas.width], p = [0, E.document.canvas.height / 2, E.document.canvas.height], m = [];
  for (const { layer: v, parent: R } of a) {
    if (o.includes(v.id)) continue;
    const D = Do(a, R);
    if (!D) continue;
    const L = Gs({
      x: v.transform.x + D.x,
      y: v.transform.y + D.y,
      width: v.transform.width,
      height: v.transform.height,
      rotation: v.transform.rotation ?? 0
    });
    m.push({
      left: L.x,
      right: L.x + L.width,
      top: L.y,
      bottom: L.y + L.height
    }), f.push(L.x, L.x + L.width / 2, L.x + L.width), p.push(L.y, L.y + L.height / 2, L.y + L.height);
  }
  const h = (v, R) => {
    let D = null;
    for (const L of v) for (const F of R) {
      const _ = F - L;
      Math.abs(_) <= s && (!D || Math.abs(_) < Math.abs(D.delta)) && (D = { delta: _, target: F });
    }
    return D;
  }, g = h(c, f), y = h(d, p);
  g && (e += g.delta, zn("vertical", g.target)), y && (t += y.delta, zn("horizontal", y.target));
  const w = i.x + e, b = w + i.width, k = m.filter((v) => v.right <= w + s).sort((v, R) => R.right - v.right)[0], C = m.filter((v) => v.left >= b - s).sort((v, R) => v.left - R.left)[0];
  if (k && C) {
    const R = k.right + (C.left - k.right - i.width) / 2 - w;
    Math.abs(R) <= s && (e += R, zn("vertical", k.right), zn("vertical", C.left));
  }
  const j = i.y + t, N = j + i.height, T = m.filter((v) => v.bottom <= j + s).sort((v, R) => R.bottom - v.bottom)[0], S = m.filter((v) => v.top >= N - s).sort((v, R) => v.top - R.top)[0];
  if (T && S) {
    const R = T.bottom + (S.top - T.bottom - i.height) / 2 - j;
    Math.abs(R) <= s && (t += R, zn("horizontal", T.bottom), zn("horizontal", S.top));
  }
  return { dx: e, dy: t };
}
function zn(e, t) {
  if (!E.document) return;
  const n = document.createElement("div");
  n.className = `smart-guide ${e}`, e === "vertical" ? n.style.left = `${t / E.document.canvas.width * 100}%` : n.style.top = `${t / E.document.canvas.height * 100}%`, P.overlay.append(n);
}
function Xo() {
  if (!E.document) return [];
  const e = Ye(Oe(E.document));
  return e.flatMap(({ layer: t, parent: n }) => {
    if (!E.selection.includes(t.id)) return [];
    const o = Do(e, n);
    return o ? [{
      layer: t,
      x: t.transform.x + o.x,
      y: t.transform.y + o.y,
      width: t.transform.width,
      height: t.transform.height
    }] : [];
  });
}
function gx(e = Xo()) {
  if (e.length === 0) return null;
  if (e.length === 1) {
    const t = e[0];
    return { x: t.x, y: t.y, width: t.width, height: t.height };
  }
  return ci(e.map((t) => ({
    x: t.x,
    y: t.y,
    width: t.width,
    height: t.height,
    rotation: t.layer.transform.rotation ?? 0
  })));
}
function Ju(e = Xo()) {
  return e.length === 0 ? null : ci(e.map((t) => ({
    x: t.x,
    y: t.y,
    width: t.width,
    height: t.height,
    rotation: t.layer.transform.rotation ?? 0
  })));
}
function Yo() {
  if (!E.document) return;
  const e = Uu(), t = E.zoom ?? e;
  P.canvas.style.width = `${Math.max(1, Math.round(E.document.canvas.width * t))}px`, P.canvas.style.height = `${Math.max(1, Math.round(E.document.canvas.height * t))}px`, P.zoomValue.textContent = E.zoom === null ? x("canvas.zoomFit") : `${je(Math.round(t * 100))}%`, P.zoomValue.title = E.zoom === null ? x("canvas.zoomFitPercent", { percent: je(Math.round(e * 100)) }) : x("canvas.zoomResetFit");
}
function vx() {
  const e = P.stageViewport.getBoundingClientRect();
  return {
    x: e.left + P.stageViewport.clientLeft + P.stageViewport.clientWidth / 2,
    y: e.top + P.stageViewport.clientTop + P.stageViewport.clientHeight / 2
  };
}
function Go(e, t = vx()) {
  const n = P.canvas.getBoundingClientRect(), o = n.width > 0 ? (t.x - n.left) / n.width : 0.5, r = n.height > 0 ? (t.y - n.top) / n.height : 0.5;
  if (E.zoom = e === null ? null : Math.min(4, Math.max(0.1, e)), Yo(), gi(), E.zoom === null) {
    P.stageViewport.scrollLeft = 0, P.stageViewport.scrollTop = 0;
    return;
  }
  if (n.width <= 0 || n.height <= 0) return;
  const s = P.canvas.getBoundingClientRect();
  P.stageViewport.scrollLeft += s.left + o * s.width - t.x, P.stageViewport.scrollTop += s.top + r * s.height - t.y;
}
function Qn(e) {
  if (!E.document || !it(e)) return;
  P.overlay.querySelector(".inline-text-editor")?.remove();
  const t = Ye(Oe(E.document)), n = t.find(({ layer: i }) => i.id === e.id), o = Do(t, n?.parent ?? null);
  if (!o) return;
  const r = document.createElement("textarea");
  r.className = "inline-text-editor", r.value = e.text, r.setAttribute("aria-label", x("canvas.editText")), r.dataset.i18nAttr = "aria-label:canvas.editText", r.style.left = `${(e.transform.x + o.x) / E.document.canvas.width * 100}%`, r.style.top = `${(e.transform.y + o.y) / E.document.canvas.height * 100}%`, r.style.width = `${e.transform.width / E.document.canvas.width * 100}%`, r.style.height = `${e.transform.height / E.document.canvas.height * 100}%`, r.style.transformOrigin = "center", r.style.transform = `rotate(${e.transform.rotation ?? 0}deg)`, r.style.fontFamily = e.fontFamily, r.style.fontSize = `${Math.max(12, e.fontSize * (P.canvas.getBoundingClientRect().width / E.document.canvas.width))}px`, r.style.lineHeight = String(e.lineHeight ?? 1.2), r.style.textAlign = e.align ?? "left", r.style.color = Bb(e.color) ?? "#000000", P.overlay.append(r), E.editingText = { id: e.id, original: e.text }, r.focus(), r.select();
  let s = !1;
  const a = (i) => {
    if (s) return;
    s = !0;
    const c = r.value;
    r.remove(), E.editingText = null, i && c !== e.text ? ne("edit text", { op: "update", id: e.id, text: c }) : Ct();
  };
  r.addEventListener("keydown", (i) => {
    i.key === "Escape" ? (i.preventDefault(), a(!1)) : i.key === "Enter" && (i.ctrlKey || i.metaKey) && (i.preventDefault(), a(!0));
  }), r.addEventListener("blur", () => a(!0));
}
function bi(e) {
  la(() => yx(e));
}
function yx(e) {
  for (const r of As) r();
  As = [];
  const t = Xo(), n = gx(t);
  if (!n || e.length === 0) return;
  const o = [
    ["X", n.x, "x"],
    ["Y", n.y, "y"],
    ["W", n.width, "width"],
    ["H", n.height, "height"],
    ["°", e.length === 1 ? e[0]?.transform.rotation ?? 0 : 0, "rotation"]
  ];
  for (const [r, s, a] of o) {
    const i = nt(P.positionFields, {
      id: `position-${a}`,
      label: r,
      type: "number",
      value: String(Math.round(s * 10) / 10),
      className: "position-field-input",
      disabled: e.some((c) => !it(c)) || a === "rotation" && e.length > 1,
      onCommit: async (c) => {
        const d = Number(c);
        if (Number.isFinite(d))
          if (a === "x" || a === "y") {
            const f = a === "x" ? d - n.x : 0, p = a === "y" ? d - n.y : 0;
            ht("position selection", e.map((m) => ({ op: "move", id: m.id, dx: f, dy: p })));
          } else if (a === "rotation" && e[0])
            ne("rotate layer", { op: "rotate", id: e[0].id, degrees: d });
          else {
            if (a === "width" && e.length === 1 && e[0]?.type === "text" && E.project)
              try {
                const m = await Iu(E.project, e[0].id, d);
                ht("resize text box", [{
                  op: "resize",
                  id: e[0].id,
                  width: Math.max(1, d),
                  height: Math.max(1, Math.ceil(m.height))
                }]);
                return;
              } catch {
              }
            const f = {
              ...n,
              width: a === "width" ? Math.max(1, d) : n.width,
              height: a === "height" ? Math.max(1, d) : n.height
            }, p = [];
            for (const m of t) {
              const h = t.length === 1 ? {
                x: m.x,
                y: m.y,
                width: a === "width" ? f.width : m.width,
                height: a === "height" ? f.height : m.height
              } : Mu(m, n, f), g = h.x - m.x, y = h.y - m.y;
              (g || y) && p.push({ op: "move", id: m.layer.id, dx: g, dy: y }), p.push({
                op: "resize",
                id: m.layer.id,
                width: h.width,
                height: h.height
              });
            }
            ht("resize selection", p);
          }
      }
    });
    As.push(i);
  }
}
let As = [];
function eo(e) {
  const t = e ?? !ua();
  if (Pf(t), !t) return;
  bi(It());
  const o = P.inspector.querySelector(".position-button")?.getBoundingClientRect(), r = P.inspector.getBoundingClientRect().left + 8, s = P.structure.getBoundingClientRect().left, a = (o?.right ?? r + 320) - 320;
  P.positionPopover.style.left = `${Math.max(r, Math.min(s - 332, a))}px`, P.positionPopover.style.top = `${Math.min(window.innerHeight - 520, (o?.bottom ?? 100) + 8)}px`, P.positionPopover.querySelector("[data-canvas-anchor]")?.focus();
}
const Qu = "assemblash-layer-clipboard-v1";
function Ar() {
  if (!E.project || !E.document || E.selection.length === 0) return !1;
  const e = Ye(Oe(E.document)), t = new Set(E.selection), n = e.filter(({ layer: o, parent: r }) => t.has(o.id) && (!r || !t.has(r))).map(({ layer: o }) => structuredClone(o));
  return sessionStorage.setItem(Qu, JSON.stringify({ project: E.project, layers: n })), ke(Tt("editor.copiedLayers", n.length)), n.length > 0;
}
function ef() {
  if (!E.project) return null;
  try {
    const e = JSON.parse(sessionStorage.getItem(Qu) ?? "null");
    return e?.project === E.project && Array.isArray(e.layers) ? e.layers : null;
  } catch {
    return null;
  }
}
function tf() {
  const e = ef();
  if (!e || !E.project) {
    ke(x("editor.nothingToPaste"), "error");
    return;
  }
  ht("paste layers", [{
    op: "insertLayerTree",
    sourceProject: E.project,
    layers: e,
    position: { at: "root" },
    offsetX: 20,
    offsetY: 20
  }]);
}
function Oo(e = "delete selection") {
  const t = It();
  t.length === 0 || t.some((n) => !it(n)) || ht(e, t.map((n) => ({ op: "delete", id: n.id })));
}
function lr(e) {
  if (!E.document || E.selection.length !== 1) return;
  const t = E.selection[0], n = Ye(Oe(E.document)), o = n.find(({ layer: d }) => d.id === t);
  if (!o || !it(o.layer)) return;
  const r = o.parent ? n.find(({ layer: d }) => d.id === o.parent)?.layer : null, s = r?.type === "group" ? r.children ?? [] : Oe(E.document), a = s.findIndex((d) => d.id === t);
  let i = a;
  if (e === "front" && (i = s.length - 1), e === "forward" && (i = Math.min(s.length - 1, a + 1)), e === "backward" && (i = Math.max(0, a - 1)), e === "back" && (i = 0), i === a) return;
  const c = o.parent ? { at: "in", parent: o.parent, index: i } : { at: "root", index: i };
  ne(`send ${e}`, { op: "reorder", id: t, to: c });
}
function $o(e, t) {
  const n = It(), o = n.length > 0 && n.every(it), r = n.length === 1 ? n[0] : null, s = [], a = (c, d, f, p = !1) => {
    s.push({ kind: "item", key: c, icon: d, disabled: p, run: f });
  }, i = () => {
    s.push({ kind: "separator" });
  };
  r?.type === "text" && (a("context.editText", "ph-pencil-simple", () => Qn(r), !o), i()), a("context.cut", "ph-scissors", () => {
    Ar() && Oo("cut layers");
  }, !o), a("context.copy", "ph-copy", () => {
    Ar();
  }, n.length === 0), a("context.paste", "ph-clipboard-text", tf, !ef()), a("context.duplicate", "ph-copy-simple", () => {
    ht("duplicate", n.map((c) => ({ op: "duplicate", id: c.id })));
  }, !o), a("context.delete", "ph-trash", Oo, !o), i(), a("context.bringFront", "ph-arrow-line-up", () => lr("front"), !r || !o), a("context.bringForward", "ph-arrow-up", () => lr("forward"), !r || !o), a("context.sendBackward", "ph-arrow-down", () => lr("backward"), !r || !o), a("context.sendBack", "ph-arrow-line-down", () => lr("back"), !r || !o), i(), a("context.group", "ph-stack", () => {
    ne("group", { op: "group", ids: n.map((c) => c.id) });
  }, n.length < 2 || !o), a("context.ungroup", "ph-stack-minus", () => {
    r && ne("ungroup", { op: "ungroup", id: r.id });
  }, r?.type !== "group" || !o), a(r?.locked ? "context.unlock" : "context.lock", r?.locked ? "ph-lock-open" : "ph-lock", () => {
    r && ne(r.locked ? "unlock layer" : "lock layer", { op: "setLocked", id: r.id, locked: !r.locked });
  }, !r || Mo(r, !0) !== null), a(r?.visible === !1 ? "context.show" : "context.hide", r?.visible === !1 ? "ph-eye" : "ph-eye-slash", () => {
    r && ne(r.visible === !1 ? "show layer" : "hide layer", { op: "setVisible", id: r.id, visible: r.visible === !1 });
  }, !r || !o), a("context.rename", "ph-pencil-simple", () => {
    if (!r) return;
    po("layers");
    const c = P.layers.querySelector(`[data-id="${CSS.escape(r.id)}"]`);
    c && (c.focus(), c.dispatchEvent(new KeyboardEvent("keydown", { key: "F2", bubbles: !0 })));
  }, !r || !o), i(), a("context.alignLeft", "ph-align-left-simple", () => Fn("left"), !o), a("context.alignHorizontalCenters", "ph-align-center-horizontal", () => Fn("centerHorizontal"), !o), a("context.alignRight", "ph-align-right-simple", () => Fn("right"), !o), a("context.alignTop", "ph-align-top-simple", () => Fn("top"), !o), a("context.alignVerticalMiddles", "ph-align-center-vertical", () => Fn("centerVertical"), !o), a("context.alignBottom", "ph-align-bottom-simple", () => Fn("bottom"), !o), a("context.distributeHorizontally", "ph-columns", () => {
    ne("distribute horizontally", { op: "distribute", ids: n.map((c) => c.id), axis: "horizontal" });
  }, !o || n.length < 3), a("context.distributeVertically", "ph-rows", () => {
    ne("distribute vertically", { op: "distribute", ids: n.map((c) => c.id), axis: "vertical" });
  }, !o || n.length < 3), Sn.open(s, e, t);
}
function Fn(e) {
  if (!E.document) return;
  const t = It(), n = t.map((a) => a.id);
  if (t.length !== 1) {
    ne("align selection", { op: "align", ids: n, edge: e });
    return;
  }
  const o = Ju(Xo());
  if (!o) return;
  let r = 0, s = 0;
  e === "left" && (r = -o.x), e === "centerHorizontal" && (r = E.document.canvas.width / 2 - (o.x + o.width / 2)), e === "right" && (r = E.document.canvas.width - (o.x + o.width)), e === "top" && (s = -o.y), e === "centerVertical" && (s = E.document.canvas.height / 2 - (o.y + o.height / 2)), e === "bottom" && (s = E.document.canvas.height - (o.y + o.height)), (r !== 0 || s !== 0) && ne("align layer to canvas", { op: "move", id: t[0].id, dx: r, dy: s });
}
function nf(e) {
  Le("open", async () => {
    E.project = e, pi.setCurrentProject(e), E.selection = [], fo(), Zu(), await of();
  });
}
async function of() {
  try {
    await et();
  } catch (e) {
    const t = e instanceof ut ? e.details : null, n = t && typeof t.pid == "number" ? t.pid : null;
    if (!(e instanceof ut) || e.code !== "projectLocked" || n === null || !E.project || !window.confirm(x("projects.recoverLockConfirm", { pid: n }))) throw e;
    await Jv(E.project, n), await et(), ke(x("projects.recovered"));
  }
  if (await Wt.projectChanged(), P.renameProject.disabled = !E.project, P.deleteProject.disabled = !E.project, P.reload.disabled = !E.project, ke(x("projects.opened", { name: E.document?.name ?? E.project ?? "" })), E.project)
    try {
      const e = await qv(E.project);
      if (e.reclaimedLock) {
        const { pid: t, host: n } = e.reclaimedLock;
        ke(
          x("projects.reclaimedLock", { pid: t, host: n })
        );
      }
    } catch (e) {
      console.error("could not check for an automatically reclaimed lock", e);
    }
}
P.reload.addEventListener("click", () => {
  Le("reload", async () => {
    await et(), ke(x("projects.refreshed"));
  });
});
P.newProject.addEventListener("click", () => Gb.open());
P.emptyCreate.addEventListener("click", () => P.newProject.click());
P.agents.addEventListener("click", () => {
  Fu.open();
});
const qc = [
  ["add-text-section", "toolbar.textButton", P.addText],
  ["add-shape-section", "toolbar.elementsButton", P.addShape],
  ["add-upload-section", "toolbar.uploadsButton", P.addImage],
  ["add-template-section", "toolbar.templatesButton", P.templatesToggle],
  ["add-fonts-section", "toolbar.fontsButton", P.selectTool]
];
function rf(e) {
  for (const t of [P.selectTool, P.addText, P.addShape, P.addImage, P.templatesToggle]) {
    const n = t === e;
    t.classList.toggle("active", n), t.setAttribute("aria-pressed", String(n));
  }
}
function Zo(e = "add-text-section", t = P.addText) {
  e !== "add-fonts-section" && Jn.releaseSamples(), P.addPanel.classList.remove("collapsed"), P.structure.classList.remove("mobile-open"), P.dockToggle.setAttribute("aria-expanded", "false"), Wt.setOpen(!1);
  const n = qc.find(([r]) => r === e)?.[1] ?? "toolbar.textButton";
  P.addPanelTitle.dataset.i18n = n, P.addPanelTitle.textContent = x(n);
  for (const [r] of qc) {
    const s = document.getElementById(r);
    s && (s.hidden = r !== e);
  }
  const o = e === "add-template-section";
  Wt.setOpen(o && Wt.isVisible()), P.openTemplates.hidden = o && Wt.isVisible(), P.addPanel.scrollTop = 0, rf(t);
}
function Jo() {
  Jn.releaseSamples(), P.addPanel.classList.add("collapsed"), rf(P.selectTool);
}
P.addPanelClose.addEventListener("click", Jo);
P.addText.addEventListener("click", () => Zo("add-text-section", P.addText));
P.addShape.addEventListener("click", () => Zo("add-shape-section", P.addShape));
P.addImage.addEventListener("click", () => Zo("add-upload-section", P.addImage));
P.templatesToggle.addEventListener("click", () => Zo("add-template-section", P.templatesToggle));
async function xi(e = !1) {
  Zo("add-fonts-section", P.selectTool), await Jn.reload(), e && Jn.focusInstall();
}
async function bx(e) {
  const n = (await by())[0];
  if (!n) {
    ke(x("fonts.noneInstalled"), "error"), await xi(!0);
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
  }, a = (await lo(
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
    Ue(E.document)
  )).created?.[0];
  a && (E.selection = [a]);
  const i = { plain: "text.plain", heading: "text.heading", subheading: "text.subheading", body: "text.body" }[e];
  ke(x("editor.addedText", { preset: x(i) })), await et();
  const c = mi();
  c?.type === "text" && Qn(c);
}
async function xx(e) {
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
  }, o = e === "line" ? { stroke: { color: $u, width: _u } } : { fill: di }, r = e === "rect" ? { kind: "rect", cornerRadius: 0 } : { kind: e }, a = (await lo(
    E.project,
    {
      op: "create",
      position: { at: "root" },
      transform: n,
      type: "shape",
      shape: r,
      ...o
    },
    Ue(E.document)
  )).created?.[0];
  a && (E.selection = [a]);
  const i = { rect: "shapes.rectangle", ellipse: "shapes.ellipse", line: "shapes.line" }[e];
  ke(x("editor.addedShape", { kind: x(i) })), await et();
}
async function wx(e) {
  if (!E.project || !E.document) return;
  const t = 320, n = 240, o = {
    x: Math.round((E.document.canvas.width - t) / 2),
    y: Math.round((E.document.canvas.height - n) / 2),
    width: t,
    height: n
  }, s = (await lo(
    E.project,
    {
      op: "create",
      position: { at: "root" },
      transform: o,
      type: "shape",
      shape: { kind: "path", d: e },
      fill: di
    },
    Ue(E.document)
  )).created?.[0];
  s && (E.selection = [s]), ke(x("editor.addedPath")), await et();
}
P.addPanel.addEventListener("click", (e) => {
  const t = e.target, o = t.closest("[data-text-preset]")?.dataset.textPreset;
  o && Le(`add ${o}`, () => bx(o));
  const r = t.closest("[data-shape]")?.dataset.shape;
  (r === "rect" || r === "ellipse" || r === "line") && Le(`add ${r}`, () => xx(r)), r === "path" && ds("editor.addPathTitle", "editor.pathDataLabel", "editor.addPathButton", (s) => {
    Le("add path", () => wx(s));
  });
});
P.undo.addEventListener("click", () => {
  Le("undo", async () => {
    if (!E.project) return;
    const e = await ty(E.project);
    ke(x("status.undoDone", { version: e.version })), await et();
  });
});
P.redo.addEventListener("click", () => {
  Le("redo", async () => {
    if (!E.project) return;
    const e = await ny(E.project);
    ke(x("status.redoDone", { version: e.version })), await et();
  });
});
P.exportButton.addEventListener("click", () => Yb.open());
If((e) => ra(
  e,
  e.type === "image/svg+xml" || e.name.toLowerCase().endsWith(".svg") ? "svg" : "image"
));
function ra(e, t, n) {
  e && Le(t === "svg" ? "add vector" : "add image", async () => {
    if (!(!E.project || !E.document)) {
      P.uploadFeedback.textContent = x("uploads.uploading", { name: e.name });
      try {
        const o = await ii(E.project, e), r = o.asset.mediaType === "image/svg+xml" || t === "svg", { width: s, height: a } = $y(
          o.asset,
          E.document.canvas
        ), i = Math.round(n?.x ?? (E.document.canvas.width - s) / 2), c = Math.round(n?.y ?? (E.document.canvas.height - a) / 2), d = r ? {
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
        }, f = await lo(
          E.project,
          d,
          o.version
        );
        f.created?.length && (E.selection = f.created), ke(x("uploads.addedVersion", { name: e.name, version: f.version })), P.uploadFeedback.textContent = x("uploads.added", { name: e.name }), await et();
      } catch (o) {
        throw P.uploadFeedback.textContent = x("uploads.failed", { name: e.name }), o;
      }
    }
  });
}
for (const e of ["dragenter", "dragover"])
  P.stageViewport.addEventListener(e, (t) => t.preventDefault());
P.stageViewport.addEventListener("drop", (e) => {
  e.preventDefault();
  const t = e.dataTransfer?.files[0];
  if (!t || !E.document) return;
  const n = P.canvas.getBoundingClientRect();
  if (e.clientX < n.left || e.clientX > n.right || e.clientY < n.top || e.clientY > n.bottom) {
    ra(t, t.type === "image/svg+xml" ? "svg" : "image");
    return;
  }
  const o = {
    x: (e.clientX - n.left) / n.width * E.document.canvas.width - 150,
    y: (e.clientY - n.top) / n.height * E.document.canvas.height - 100
  };
  ra(t, t.type === "image/svg+xml" ? "svg" : "image", o);
});
function po(e) {
  fi = e, St();
}
P.historyShortcut.addEventListener("click", () => po("history"));
P.dockToggle.addEventListener("click", () => {
  const e = P.structure.classList.toggle("mobile-open");
  P.dockToggle.setAttribute("aria-expanded", String(e)), e && (Jo(), P.layersTab.focus());
});
P.selectTool.addEventListener("click", () => {
  E.document && (Jo(), Wt.setOpen(!1), P.structure.classList.remove("mobile-open"), P.dockToggle.setAttribute("aria-expanded", "false"), P.canvas.focus());
});
P.positionClose.addEventListener("click", () => eo(!1));
P.positionPopover.addEventListener("click", (e) => {
  const t = e.target.closest(
    "[data-canvas-anchor], [data-layout]"
  ), n = t?.dataset.canvasAnchor;
  if (n && !t.disabled && E.selection.length > 0 && E.document) {
    const a = Xo(), i = Ju(a);
    if (!i) return;
    const d = {
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
    if (!d) return;
    const f = [], p = d.horizontal === "left" ? 0 : d.horizontal === "right" ? E.document.canvas.width - i.width : (E.document.canvas.width - i.width) / 2, m = d.vertical === "top" ? 0 : d.vertical === "bottom" ? E.document.canvas.height - i.height : (E.document.canvas.height - i.height) / 2;
    for (const h of It())
      f.push({ op: "move", id: h.id, dx: p - i.x, dy: m - i.y });
    eo(!1), fx(`place layer ${t.title.toLowerCase()}`, f);
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
  s && (eo(!1), ne("arrange layers", s));
});
document.addEventListener("pointerdown", (e) => {
  const t = e.target;
  ua() && !P.positionPopover.contains(t) && !P.inspector.contains(t) && eo(!1), Sn.isOpen() && !P.contextMenu.contains(t) && Sn.close();
});
P.openTemplates.addEventListener("click", () => {
  if (!Wt.isVisible()) {
    ke(x("editor.noSlotsHint")), Jo(), po("properties"), window.matchMedia("(max-width: 1024px)").matches && (P.structure.classList.add("mobile-open"), P.dockToggle.setAttribute("aria-expanded", "true"));
    return;
  }
  Wt.setOpen(!0), P.openTemplates.hidden = !0, P.templatesPanel.scrollIntoView({ block: "nearest" });
});
P.templatesClose.addEventListener("click", () => {
  Wt.setOpen(!1), P.openTemplates.hidden = !1;
});
P.zoomOut.addEventListener("click", () => Go(fs() / 1.2));
P.zoomIn.addEventListener("click", () => Go(fs() * 1.2));
P.zoomValue.addEventListener("click", () => Go(null));
P.zoom100.addEventListener("click", () => Go(1));
P.stageViewport.addEventListener("wheel", (e) => {
  if (!(e.ctrlKey || e.metaKey)) return;
  e.preventDefault();
  const t = e.deltaMode === WheelEvent.DOM_DELTA_LINE ? e.deltaY * 16 : e.deltaMode === WheelEvent.DOM_DELTA_PAGE ? e.deltaY * P.stageViewport.clientHeight : e.deltaY, n = Math.exp(-t * Math.log(1.1) / 100);
  Go(fs() * n, { x: e.clientX, y: e.clientY });
}, { passive: !1 });
function sf() {
  window.matchMedia("(max-width: 1024px)").matches ? (P.structure.classList.remove("mobile-open"), P.dockToggle.setAttribute("aria-expanded", "false"), Jn.releaseSamples(), P.addPanel.classList.add("collapsed")) : (P.structure.classList.remove("mobile-open"), P.dockToggle.setAttribute("aria-expanded", "true"));
}
window.addEventListener("resize", () => {
  E.zoom === null && Yo(), gi(), sf();
});
const Sx = new ResizeObserver(() => {
  E.zoom === null && Yo(), gi();
});
Sx.observe(P.stageViewport);
sf();
let Qo = !1, bo = null;
window.addEventListener("keyup", (e) => {
  e.code === "Space" && (Qo = !1, P.stageViewport.classList.remove("pan-ready"));
});
window.addEventListener("blur", () => {
  Qo = !1, P.stageViewport.classList.remove("pan-ready"), bo?.();
});
P.stageViewport.addEventListener("pointerdown", (e) => {
  if (e.button !== 1 && !(Qo && e.button === 0)) return;
  e.preventDefault(), e.stopPropagation(), bo?.();
  const t = { x: e.clientX, y: e.clientY }, n = { x: P.stageViewport.scrollLeft, y: P.stageViewport.scrollTop };
  P.stageViewport.classList.add("panning");
  const o = (a) => {
    a.pointerId === e.pointerId && (P.stageViewport.scrollLeft = n.x - (a.clientX - t.x), P.stageViewport.scrollTop = n.y - (a.clientY - t.y));
  }, r = () => {
    window.removeEventListener("pointermove", o), window.removeEventListener("pointerup", s), window.removeEventListener("pointercancel", s), window.removeEventListener("blur", r), P.stageViewport.classList.remove("panning"), bo === r && (bo = null);
  }, s = (a) => {
    a.pointerId === e.pointerId && r();
  };
  bo = r, window.addEventListener("pointermove", o), window.addEventListener("pointerup", s), window.addEventListener("pointercancel", s), window.addEventListener("blur", r, { once: !0 });
}, { capture: !0 });
P.overlay.addEventListener("pointerdown", (e) => {
  if (Qo || e.target !== P.overlay || e.button !== 0 || !E.document) return;
  e.preventDefault();
  const t = P.canvas.getBoundingClientRect(), n = (c) => Math.min(t.right, Math.max(t.left, c)), o = (c) => Math.min(t.bottom, Math.max(t.top, c)), r = { x: n(e.clientX), y: o(e.clientY) }, s = document.createElement("div");
  s.className = "selection-marquee", P.overlay.append(s);
  const a = (c) => {
    const d = n(c.clientX), f = o(c.clientY), p = Math.min(r.x, d), m = Math.min(r.y, f), h = Math.max(r.x, d), g = Math.max(r.y, f);
    s.style.left = `${(p - t.left) / t.width * 100}%`, s.style.top = `${(m - t.top) / t.height * 100}%`, s.style.width = `${(h - p) / t.width * 100}%`, s.style.height = `${(g - m) / t.height * 100}%`;
  }, i = (c) => {
    window.removeEventListener("pointermove", a), window.removeEventListener("pointerup", i);
    const d = n(c.clientX), f = o(c.clientY), p = {
      left: Math.min(r.x, d),
      top: Math.min(r.y, f),
      right: Math.max(r.x, d),
      bottom: Math.max(r.y, f)
    }, m = [...P.overlay.querySelectorAll(".layer-hitbox")].filter((h) => {
      const g = h.getBoundingClientRect();
      return g.right >= p.left && g.left <= p.right && g.bottom >= p.top && g.top <= p.bottom;
    }).map((h) => h.dataset.id).filter((h) => !!h);
    E.selection = e.shiftKey ? [.../* @__PURE__ */ new Set([...E.selection, ...m])] : m, St(), ot(), Ct();
  };
  window.addEventListener("pointermove", a), window.addEventListener("pointerup", i);
});
function Cx(e) {
  const t = e;
  return t ? t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable : !1;
}
window.addEventListener("keydown", (e) => {
  if (Cx(e.target)) return;
  const t = e.ctrlKey || e.metaKey;
  if (e.code === "Space") {
    Qo = !0, P.stageViewport.classList.add("pan-ready"), e.preventDefault();
    return;
  }
  if (t && e.key.toLowerCase() === "z") {
    e.preventDefault(), (e.shiftKey ? P.redo : P.undo).click();
    return;
  }
  const n = e.key.toLowerCase();
  if (t && n === "c") {
    e.preventDefault(), Ar();
    return;
  }
  if (t && n === "x") {
    e.preventDefault(), It().every(it) && Ar() && Oo("cut layers");
    return;
  }
  if (t && n === "v") {
    e.preventDefault(), tf();
    return;
  }
  if (t && n === "d") {
    e.preventDefault();
    const c = It();
    c.length && c.every(it) && ht("duplicate", c.map((d) => ({ op: "duplicate", id: d.id })));
    return;
  }
  if (t && n === "g") {
    e.preventDefault();
    const c = It();
    if (e.shiftKey) {
      const d = c.length === 1 && c[0]?.type === "group" ? c[0] : null;
      d && ne("ungroup", { op: "ungroup", id: d.id });
    } else c.length > 1 && c.every(it) && ne("group", { op: "group", ids: c.map((d) => d.id) });
    return;
  }
  if (e.key === "F10" && e.shiftKey) {
    e.preventDefault();
    const c = P.canvas.getBoundingClientRect();
    $o(c.left + c.width / 2, c.top + c.height / 2);
    return;
  }
  if (e.key === "Escape") {
    if (Sn.isOpen()) {
      Sn.close(), P.canvas.focus();
      return;
    }
    if (Dt.isOpen()) {
      Dt.close();
      return;
    }
    if (!P.addPanel.classList.contains("collapsed")) {
      e.preventDefault(), Jo();
      return;
    }
    E.selection = [], Sn.close(), eo(!1), St(), Ct(), ot();
    return;
  }
  const o = mi(), r = It();
  if ((e.key === "Enter" || e.key === "F2") && o?.type === "text" && it(o)) {
    e.preventDefault(), Qn(o);
    return;
  }
  if (r.length === 0 || r.some((c) => !it(c))) return;
  if (e.key === "Delete" || e.key === "Backspace") {
    e.preventDefault(), Oo();
    return;
  }
  const s = e.shiftKey ? 10 : 1, i = {
    ArrowLeft: [-s, 0],
    ArrowRight: [s, 0],
    ArrowUp: [0, -s],
    ArrowDown: [0, s]
  }[e.key];
  i && (e.preventDefault(), ht("nudge selection", r.map((c) => ({
    op: "move",
    id: c.id,
    dx: i[0],
    dy: i[1]
  }))));
});
function jx() {
  E.project = null, E.document = null, E.selection = [], fa(null), P.canvas.hidden = !0, P.canvasControlsRoot.hidden = !0, P.canvasHints.hidden = !0, P.canvasImage.removeAttribute("src"), P.canvasEmpty.hidden = !1, P.renameProject.disabled = !0, P.deleteProject.disabled = !0, P.reload.disabled = !0, St(), Ct(), ot();
}
function af(e, t) {
  ds("projects.renameTitle", "common.name", "projects.rename", (n) => {
    Le("rename project", async () => {
      const o = await Yv(e, n);
      ke(x("projects.renamed", { oldName: t ?? e, newName: n })), E.project === e && (E.project = null), await er(o.project);
    });
  });
}
function cf(e, t) {
  const n = t ?? e, o = x("projects.deleteConfirm", { name: n });
  window.confirm(o) && Le("delete project", async () => {
    await Gv(e), E.project === e && jx(), ke(x("projects.deleted", { name: n })), await er();
  });
}
P.renameProject.addEventListener("click", () => {
  const e = E.project;
  e && (Dt.isOpen() && Dt.close(), af(e, E.document?.name ?? null));
});
P.deleteProject.addEventListener("click", () => {
  const e = E.project;
  e && (Dt.isOpen() && Dt.close(), cf(e, E.document?.name ?? null));
});
async function er(e) {
  e && (P.search.value = "");
  const t = P.search.value.trim(), n = await Pu(t);
  lf(n, t), e && (E.project = e, pi.setCurrentProject(e), await of()), await uf();
}
function lf(e, t) {
  wi = df(e), pi.setProjects(e, t, E.project);
}
const kx = 1500;
let wi = "";
function df(e) {
  return e.map((t) => `${t.id}\0${t.name ?? ""}\0${t.layers}`).join(`
`);
}
let Kc = !0;
async function sa() {
  if (Kc)
    try {
      const { count: e } = await iy();
      Si(e);
    } catch (e) {
      e instanceof ut && e.code.startsWith("http4") && (Kc = !1, Si(null));
    }
}
let Ut = null;
function Ex(e) {
  return e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement || e instanceof HTMLElement && e.isContentEditable;
}
document.addEventListener("input", (e) => {
  e.target !== P.search && Ex(e.target) && (Ut = e.target);
}, !0);
document.addEventListener("change", (e) => {
  e.target === Ut && (Ut = null);
}, !0);
document.addEventListener("focusout", (e) => {
  e.target === Ut && (Ut = null);
}, !0);
function Rx() {
  return Ut instanceof Node && !Ut.isConnected && (Ut = null), Ut !== null;
}
function Xc() {
  return document.visibilityState === "visible" && !E.busy && !E.drag && !E.editingText && !Rx() && !document.body.classList.contains("stopped");
}
let Is = !1;
async function Nx() {
  if (!(Is || !Xc())) {
    if (!oa()) {
      sa();
      return;
    }
    Is = !0;
    try {
      const e = P.search.value.trim(), t = await Pu(e);
      if (!Xc()) return;
      sa(), df(t) !== wi && document.activeElement !== document.getElementById("project-search") && (lf(t, e), E.project || uf().catch(() => {
      }));
      const n = E.project, o = t.find((s) => s.id === n), r = E.document;
      if (!n || !o || !r || o.documentId !== r.id || o.version === Ue(r)) return;
      Le("follow", async () => {
        E.project !== n || E.drag || E.editingText || await et();
      });
    } catch {
    } finally {
      Is = !1;
    }
  }
}
window.setInterval(() => {
  Nx();
}, kx);
let Ms = [], Ds = 0;
async function uf() {
  const e = ++Ds;
  for (const o of Ms) URL.revokeObjectURL(o);
  Ms = [];
  const t = await Uv(8);
  if (e !== Ds) return;
  const n = await Promise.all(t.map(async (o) => {
    try {
      return { project: o, thumbnail: await To(Kv(o.id)) };
    } catch {
      return { project: o, thumbnail: null };
    }
  }));
  if (e !== Ds) {
    for (const { thumbnail: o } of n) o && URL.revokeObjectURL(o);
    return;
  }
  Ms = n.flatMap(({ thumbnail: o }) => o ? [o] : []), Af(
    P.recents,
    n,
    (o) => nf(o),
    (o, r) => af(o, r),
    (o, r) => cf(o, r)
  );
}
P.shutdown.addEventListener("click", () => {
  window.confirm(x("projects.stopConfirm")) && Le("stop", async () => {
    await ry(), P.shutdown.disabled = !0, document.body.classList.add("stopped"), ke(x("app.stopped"));
  });
});
Le("start", async () => {
  const e = await sy();
  P.shutdown.hidden = !e.canShutdown;
  try {
    await Jn.reload();
  } catch {
  }
  await er(), sa(), Vu(), ke(x("status.ready", { version: e.version })), !wi && !P.search.value.trim() && Fu.offerOnFirstRun();
});
