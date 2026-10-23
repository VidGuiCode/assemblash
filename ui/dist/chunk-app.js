import { r as f, F as op, H as vn, t as Oo, v as Ht, R as ln, M as rp, J as sp, f as se, u as Z, w as Ta, y as Jo, K as Aa, j as l, B as Q, N as Nl, a as Ie, c as Oe, o as Te, z as Gr, d as en, b as Zo, O as Pl, n as Rt, x as $o, P as ro, l as Tl, E as ap, Q as ip, V as cp, W as lp, I as up, C as dp, U as so, X as xn, g as nt, h as $e, Y as Dr, Z as Jr, _ as go, e as Al, $ as fp, A as Mo, L as pp, m as Ue, i as _e, T as ee, S as ve, k as ue, G as Re, a0 as mp, a1 as Ia } from "./chunk-mantine-root.js";
import { m as Il, i as Ml, c as Kt, u as Fe, O as Ma, a as Dl, g as vo, b as Ol, S as Da, s as hp, d as gp, e as vp, p as Oa, f as yp, h as $l, j as bp, k as wp, l as Ll, n as Zi, o as xp, q as $a, r as Sp } from "./chunk-main.js";
import { a as Ye, u as _t, C as zl, I as kt, b as Cp, d as jp, c as xt, r as Qi, T as ec } from "./chunk-Title.js";
import { t as b, formatNumber as ke, formatCount as It, getLocale as La, setLocale as kp } from "./i18n.js";
function Or(e, t) {
  return (n) => {
    if (typeof n != "string" || n.trim().length === 0) throw new Error(t);
    return `${e}-${n}`;
  };
}
function Lo(e, t) {
  let n = e;
  for (; (n = n.parentElement) && !n.matches(t); ) ;
  return n;
}
function tc(e, t, n) {
  for (let o = e - 1; o >= 0; o -= 1) if (!t[o].disabled) return o;
  if (n) {
    for (let o = t.length - 1; o > -1; o -= 1) if (!t[o].disabled) return o;
  }
  return e;
}
function nc(e, t, n) {
  for (let o = e + 1; o < t.length; o += 1) if (!t[o].disabled) return o;
  if (n) {
    for (let o = 0; o < t.length; o += 1) if (!t[o].disabled) return o;
  }
  return e;
}
function Ep(e, t, n) {
  return Lo(e, n) === Lo(t, n);
}
function _l({ parentSelector: e, siblingSelector: t, onKeyDown: n, loop: o = !0, activateOnFocus: r = !1, dir: s = "rtl", orientation: a }) {
  return (i) => {
    n?.(i);
    const c = Array.from(Lo(i.currentTarget, e)?.querySelectorAll(t) || []).filter((g) => Ep(i.currentTarget, g, e)), u = c.findIndex((g) => i.currentTarget === g), d = nc(u, c, o), p = tc(u, c, o), m = s === "rtl" ? p : d, h = s === "rtl" ? d : p;
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
        a === "vertical" && (i.stopPropagation(), i.preventDefault(), c[d].focus(), r && c[d].click());
        break;
      case "Home":
        i.stopPropagation(), i.preventDefault(), c[nc(-1, c, !1)]?.focus();
        break;
      case "End":
        i.stopPropagation(), i.preventDefault(), c[tc(c.length, c, !1)]?.focus();
    }
  };
}
const $r = () => {
};
function Rp(e, t = { active: !0 }) {
  return typeof e != "function" || !t.active ? t.onKeyDown || $r : (n) => {
    n.key === "Escape" && (e(n), t.onTrigger?.());
  };
}
function Hn(e, t) {
  return (n) => {
    e?.(n), t?.(n);
  };
}
function hn(e, t, n) {
  return t === void 0 && n === void 0 ? e : t !== void 0 && n === void 0 ? Math.max(e, t) : Math.min(t === void 0 && n !== void 0 ? e : Math.max(e, t), n);
}
function Np(e, t) {
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
function Zn(e) {
  const t = f.useRef(e);
  return f.useEffect(() => {
    t.current = e;
  }), f.useMemo(() => ((...n) => t.current?.(...n)), []);
}
function Zr(e, t) {
  const { delay: n, flushOnUnmount: o, leading: r, maxWait: s } = typeof t == "number" ? {
    delay: t,
    flushOnUnmount: !1,
    leading: !1,
    maxWait: void 0
  } : t, a = Zn(e), i = f.useRef(0), c = f.useRef(0), u = f.useRef(null), d = f.useMemo(() => {
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
            const E = u.current;
            g(), a(...E);
          }
        }, s));
      }
      if (r && h) {
        a(...m);
        const E = () => {
          g();
        }, j = () => {
          i.current !== 0 && (g(), a(...m));
        }, k = () => {
          g();
        };
        p.flush = j, p.cancel = k, i.current = window.setTimeout(E, n), v();
        return;
      }
      if (r && !h) {
        p._hasPendingCallback = !0;
        const E = () => {
          i.current !== 0 && (g(), a(...m));
        }, j = () => {
          g();
        };
        p.flush = E, p.cancel = j;
        const k = () => {
          g();
        };
        i.current = window.setTimeout(k, n), v();
        return;
      }
      p._hasPendingCallback = !0;
      const w = () => {
        i.current !== 0 && (g(), a(...m));
      }, x = () => {
        g();
      };
      p.flush = w, p.cancel = x, i.current = window.setTimeout(w, n), v();
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
  return f.useEffect(() => () => {
    o ? d.flush() : d.cancel();
  }, [d, o]), d;
}
const Pp = ["mousedown", "touchstart"];
function Fl(e, t, n, o = !0, r = !1) {
  const s = f.useRef(null), a = t || Pp, i = f.useEffectEvent((u) => {
    const { target: d } = u ?? {};
    if (!document.body.contains(d) && d?.tagName !== "HTML") return;
    const p = u.composedPath();
    Array.isArray(n) ? n.every((m) => !!m && !p.includes(m)) && e(u) : s.current && !p.includes(s.current) && e(u);
  }), c = a.join(",");
  return f.useEffect(() => {
    if (!o) return;
    const u = c.split(",");
    return u.forEach((d) => document.addEventListener(d, i, r)), () => {
      u.forEach((d) => document.removeEventListener(d, i, r));
    };
  }, [
    c,
    o,
    r
  ]), s;
}
function Tp(e, t) {
  return op("(prefers-color-scheme: dark)", e === "dark", t) ? "dark" : "light";
}
function Bl({ opened: e, shouldReturnFocus: t = !0 }) {
  const n = f.useRef(null), o = () => {
    n.current && "focus" in n.current && typeof n.current.focus == "function" && n.current?.focus({ preventScroll: !0 });
  };
  return vn(() => {
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
const Ap = /input|select|textarea|button|object/, Vl = "a, input, select, textarea, button, object, [tabindex]";
function Ip(e) {
  return e.style.display === "none";
}
function Mp(e) {
  if (e.getAttribute("aria-hidden") || e.getAttribute("hidden") || e.getAttribute("type") === "hidden") return !1;
  let t = e;
  for (; t && !(t === document.body || t.nodeType === 11); ) {
    if (Ip(t)) return !1;
    t = t.parentNode;
  }
  return !0;
}
function Hl(e) {
  let t = e.getAttribute("tabindex");
  return t === null && (t = void 0), parseInt(t, 10);
}
function na(e) {
  const t = e.nodeName.toLowerCase(), n = !Number.isNaN(Hl(e));
  return (Ap.test(t) && !e.disabled || e instanceof HTMLAnchorElement && e.href || n) && Mp(e);
}
function Ul(e) {
  const t = Hl(e);
  return (Number.isNaN(t) || t >= 0) && na(e);
}
function Dp(e) {
  return Array.from(e.querySelectorAll(Vl)).filter(Ul);
}
function Op(e, t) {
  const n = Dp(e);
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
function $p(e = !0) {
  const t = f.useRef(null), n = (r) => {
    let s = r.querySelector("[data-autofocus]");
    if (!s) {
      const a = Array.from(r.querySelectorAll(Vl));
      s = a.find(Ul) || a.find(na) || null, !s && na(r) && (s = r);
    }
    s ? s.focus({ preventScroll: !0 }) : console.warn("[@mantine/hooks/use-focus-trap] Failed to find focusable element within provided node", r);
  }, o = f.useCallback((r) => {
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
  return f.useEffect(() => {
    if (!e) return;
    t.current && setTimeout(() => {
      t.current && n(t.current);
    });
    const r = (s) => {
      s.key === "Tab" && t.current && Op(t.current, s);
    };
    return document.addEventListener("keydown", r), () => document.removeEventListener("keydown", r);
  }, [e]), o;
}
const Lp = (e) => (e + 1) % 1e6;
function zp() {
  const [, e] = f.useReducer(Lp, 0);
  return e;
}
function _p(e, t, n) {
  const o = f.useEffectEvent(t);
  f.useEffect(() => (window.addEventListener(e, o, n), () => window.removeEventListener(e, o, n)), [e]);
}
function Wl(e) {
  return {
    x: hn(e.x, 0, 1),
    y: hn(e.y, 0, 1)
  };
}
function ql(e, t, n = "ltr") {
  const o = f.useRef(!1), r = f.useRef(!1), s = f.useRef(0), a = f.useRef(null), [i, c] = f.useState(!1);
  return f.useEffect(() => (o.current = !0, () => {
    a.current?.();
  }), []), {
    ref: f.useCallback((u) => {
      const d = ({ x: j, y: k }) => {
        cancelAnimationFrame(s.current), s.current = requestAnimationFrame(() => {
          if (o.current && u) {
            u.style.userSelect = "none";
            const R = u.getBoundingClientRect();
            if (R.width && R.height) {
              const P = hn((j - R.left) / R.width, 0, 1);
              e({
                x: n === "ltr" ? P : 1 - P,
                y: hn((k - R.top) / R.height, 0, 1)
              });
            }
          }
        });
      }, p = () => {
        document.addEventListener("mousemove", w), document.addEventListener("mouseup", g), document.addEventListener("touchmove", E, { passive: !1 }), document.addEventListener("touchend", g);
      }, m = () => {
        document.removeEventListener("mousemove", w), document.removeEventListener("mouseup", g), document.removeEventListener("touchmove", E), document.removeEventListener("touchend", g);
      }, h = () => {
        !r.current && o.current && (r.current = !0, typeof t?.onScrubStart == "function" && t.onScrubStart(), c(!0), p());
      }, g = () => {
        r.current && o.current && (r.current = !1, c(!1), m(), setTimeout(() => {
          typeof t?.onScrubEnd == "function" && t.onScrubEnd();
        }, 0));
      }, v = (j) => {
        h(), j.preventDefault(), w(j);
      }, w = (j) => d({
        x: j.clientX,
        y: j.clientY
      }), x = (j) => {
        j.cancelable && j.preventDefault(), h(), E(j);
      }, E = (j) => {
        j.cancelable && j.preventDefault(), d({
          x: j.changedTouches[0].clientX,
          y: j.changedTouches[0].clientY
        });
      };
      return u?.addEventListener("mousedown", v), u?.addEventListener("touchstart", x, { passive: !1 }), a.current = () => {
        m(), cancelAnimationFrame(s.current);
      }, () => {
        u && (u.removeEventListener("mousedown", v), u.removeEventListener("touchstart", x));
      };
    }, [n, e]),
    active: i
  };
}
function Fp(e, t) {
  if (!e || !t) return !1;
  if (e === t) return !0;
  if (e.length !== t.length) return !1;
  for (let n = 0; n < e.length; n += 1) if (!Np(e[n], t[n])) return !1;
  return !0;
}
function Bp(e) {
  const t = f.useRef([]), n = f.useRef(0);
  return Fp(t.current, e) || (t.current = e, n.current += 1), [n.current];
}
function oc(e, t) {
  f.useEffect(e, Bp(t));
}
function Vp(e, t, n = { autoInvoke: !1 }) {
  const o = f.useRef(null), r = Zn(e), s = f.useCallback((...i) => {
    o.current || (o.current = window.setTimeout(() => {
      r(...i), o.current = null;
    }, t));
  }, [t]), a = f.useCallback(() => {
    o.current && (window.clearTimeout(o.current), o.current = null);
  }, []);
  return f.useEffect(() => (n.autoInvoke && s(), a), [a, s]), {
    start: s,
    clear: a
  };
}
function Hp(e) {
  const t = f.useRef(void 0);
  return f.useEffect(() => {
    t.current = e;
  }, [e]), t.current;
}
function Up() {
  const [e, t] = f.useState(!1);
  return Oo(() => {
    t(typeof window < "u" && !Wp() && "EyeDropper" in window);
  }, []), {
    supported: e,
    open: f.useCallback((n = {}) => e ? new window.EyeDropper().open(n) : Promise.resolve(void 0), [e])
  };
}
function Wp() {
  return navigator.userAgent.includes("OPR");
}
function qp(e, t, n) {
  const o = f.useRef(null);
  f.useEffect(() => {
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
function Kp() {
  const [e, t] = f.useState(!1);
  return f.useEffect(() => t(!0), []), e;
}
const Xp = ["mouse", "touch"], Yp = 10;
function Gp(e, t = {}) {
  const { threshold: n = 400, events: o = Xp, cancelOnMove: r = !1, onStart: s, onFinish: a, onCancel: i } = t, c = f.useRef(!1), u = f.useRef(!1), d = f.useRef(-1), p = f.useRef(null);
  f.useEffect(() => () => window.clearTimeout(d.current), []);
  const m = o.join(",");
  return f.useMemo(() => {
    if (typeof e != "function") return {};
    const h = r !== !1, g = r === !0 ? Yp : r === !1 ? 0 : r, v = (j) => {
      !sc(j) && !oa(j) || (s && s(j), p.current = rc(j), u.current = !0, d.current = window.setTimeout(() => {
        e(j), c.current = !0;
      }, n));
    }, w = (j) => {
      !sc(j) && !oa(j) || (c.current ? a && a(j) : u.current && i && i(j), c.current = !1, u.current = !1, p.current = null, d.current !== -1 && (window.clearTimeout(d.current), d.current = -1));
    }, x = (j) => {
      if (!h || !u.current || c.current) return;
      const k = rc(j);
      if (!k || !p.current) return;
      const R = k.x - p.current.x, P = k.y - p.current.y;
      Math.sqrt(R * R + P * P) > g && w(j);
    }, E = {};
    return o.includes("mouse") && (E.onMouseDown = v, E.onMouseUp = w, E.onMouseLeave = w, h && (E.onMouseMove = x)), o.includes("touch") && (E.onTouchStart = v, E.onTouchEnd = w, E.onTouchCancel = w, h && (E.onTouchMove = x)), E;
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
function rc(e) {
  if (oa(e)) {
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
function oa(e) {
  return window.TouchEvent ? e.nativeEvent instanceof TouchEvent : "touches" in e.nativeEvent;
}
function sc(e) {
  return e.nativeEvent instanceof MouseEvent;
}
function Jp(e) {
  if (!e || typeof e == "string") return 0;
  const t = e / 36;
  return Math.round((4 + 15 * t ** 0.25 + t / 5) * 10);
}
function Ms(e) {
  return e.current ? e.current.scrollHeight : "auto";
}
function Lr(e) {
  return typeof e == "number" && e > 0;
}
function Zp({ transitionDuration: e, transitionTimingFunction: t = "ease", onTransitionEnd: n, onTransitionStart: o, expanded: r, keepMounted: s }) {
  const a = {
    height: 0,
    overflow: "hidden",
    ...s ? {} : { display: "none" }
  }, i = f.useEffectEvent(() => o?.()), c = f.useEffectEvent(() => n?.()), u = f.useRef(null), [d, p] = f.useState(r ? {} : a), [m, h] = f.useState(r ? "entered" : "exited"), g = (j) => {
    Ht.flushSync(() => p(j));
  }, v = (j) => {
    g((k) => ({
      ...k,
      ...j
    }));
  }, w = (j) => {
    const k = e ?? Jp(j);
    return { transition: `height ${k}ms ${t}, opacity ${k}ms ${t}` };
  }, x = f.useRef(0);
  vn(() => {
    x.current += 1;
    const j = x.current, k = () => x.current === j;
    e !== 0 && i(), r ? window.requestAnimationFrame(() => {
      !k() || !u.current || (Ht.flushSync(() => h("entering")), v({
        willChange: "height",
        display: "block",
        overflow: "hidden"
      }), window.requestAnimationFrame(() => {
        if (!k() || !u.current) return;
        const R = Ms(u);
        if (!Lr(R)) {
          g({}), h("entered"), c();
          return;
        }
        v({
          ...w(R),
          height: R
        });
      }));
    }) : window.requestAnimationFrame(() => {
      if (!k() || !u.current) return;
      Ht.flushSync(() => h("exiting"));
      const R = Ms(u);
      if (!Lr(R)) {
        g(a), h("exited"), c();
        return;
      }
      v({
        ...w(R),
        willChange: "height",
        height: R
      }), window.requestAnimationFrame(() => {
        !k() || !u.current || v({
          height: 0,
          overflow: "hidden"
        });
      });
    });
  }, [r]);
  const E = (j) => {
    if (!(j.target !== u.current || j.propertyName !== "height"))
      if (r) {
        const k = Ms(u);
        k === d.height ? g({}) : v({ height: k }), h("entered"), c();
      } else d.height === 0 && (g(a), h("exited"), c());
  };
  return {
    state: m,
    getCollapseProps: (j) => ({
      "aria-hidden": !r,
      inert: !r,
      ref: Il(u, j?.ref),
      onTransitionEnd: E,
      style: {
        boxSizing: "border-box",
        ...j?.style,
        ...d
      }
    })
  };
}
function Qp(e) {
  if (!e || typeof e == "string") return 0;
  const t = e / 36;
  return Math.round((4 + 15 * t ** 0.25 + t / 5) * 10);
}
function Ds(e) {
  return e.current ? e.current.scrollWidth : "auto";
}
function em({ transitionDuration: e, transitionTimingFunction: t = "ease", onTransitionEnd: n, onTransitionStart: o, expanded: r, keepMounted: s }) {
  const a = {
    width: 0,
    overflow: "hidden",
    ...s ? {} : { display: "none" }
  }, i = f.useEffectEvent(() => o?.()), c = f.useEffectEvent(() => n?.()), u = f.useRef(null), [d, p] = f.useState(r ? {} : a), [m, h] = f.useState(r ? "entered" : "exited"), g = (j) => {
    Ht.flushSync(() => p(j));
  }, v = (j) => {
    g((k) => ({
      ...k,
      ...j
    }));
  }, w = (j) => {
    const k = e ?? Qp(j);
    return { transition: `width ${k}ms ${t}, opacity ${k}ms ${t}` };
  }, x = f.useRef(0);
  vn(() => {
    x.current += 1;
    const j = x.current, k = () => x.current === j;
    e !== 0 && i(), r ? window.requestAnimationFrame(() => {
      !k() || !u.current || (Ht.flushSync(() => h("entering")), v({
        willChange: "width",
        display: "block",
        overflow: "hidden"
      }), window.requestAnimationFrame(() => {
        if (!k() || !u.current) return;
        const R = Ds(u);
        if (!Lr(R)) {
          g({}), h("entered"), c();
          return;
        }
        v({
          ...w(R),
          width: R
        });
      }));
    }) : window.requestAnimationFrame(() => {
      if (!k() || !u.current) return;
      Ht.flushSync(() => h("exiting"));
      const R = Ds(u);
      if (!Lr(R)) {
        g(a), h("exited"), c();
        return;
      }
      v({
        ...w(R),
        willChange: "width",
        width: R
      }), window.requestAnimationFrame(() => {
        !k() || !u.current || v({
          width: 0,
          overflow: "hidden"
        });
      });
    });
  }, [r]);
  const E = (j) => {
    if (!(j.target !== u.current || j.propertyName !== "width"))
      if (r) {
        const k = Ds(u);
        k === d.width ? g({}) : v({ width: k }), h("entered"), c();
      } else d.width === 0 && (g(a), h("exited"), c());
  };
  return {
    state: m,
    getCollapseProps: (j) => ({
      "aria-hidden": !r,
      inert: !r,
      ref: Il(u, j?.ref),
      onTransitionEnd: E,
      style: {
        boxSizing: "border-box",
        ...j?.style,
        ...d
      }
    })
  };
}
function Kl() {
  return typeof process < "u" && process.env, "development";
}
function Xl(e) {
  const t = /* @__PURE__ */ new Map();
  return (...n) => {
    const o = JSON.stringify(n);
    if (t.has(o)) return t.get(o);
    const r = e(...n);
    return t.set(o, r), r;
  };
}
function Yl(e) {
  const t = ln.version;
  return typeof ln.version != "string" || t.startsWith("18.") ? e?.ref : e?.props?.ref;
}
function tm(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "bigint";
}
function kr(e, t = document) {
  const n = t.querySelector(e);
  if (n) return n;
  const o = t.querySelectorAll("*");
  for (let r = 0; r < o.length; r += 1) {
    const s = o[r];
    if (s.shadowRoot) {
      const a = kr(e, s.shadowRoot);
      if (a) return a;
    }
  }
  return null;
}
function Xt(e, t = document) {
  const n = [], o = t.querySelectorAll(e);
  n.push(...Array.from(o));
  const r = t.querySelectorAll("*");
  for (let s = 0; s < r.length; s += 1) {
    const a = r[s];
    if (a.shadowRoot) {
      const i = Xt(e, a.shadowRoot);
      n.push(...i);
    }
  }
  return n;
}
function Bt(e) {
  if (!e) return document;
  const t = e.getRootNode();
  return t instanceof ShadowRoot || t instanceof Document ? t : document;
}
function Qo(e) {
  const t = f.Children.toArray(e);
  return t.length !== 1 || !Ml(t[0]) ? null : t[0];
}
function er(e, t) {
  return typeof e == "boolean" ? e : t.autoContrast;
}
function ac(e) {
  const t = document.createElement("style");
  return t.setAttribute("data-mantine-styles", "inline"), t.innerHTML = "*, *::before, *::after {transition: none !important;}", t.setAttribute("data-mantine-disable-transition", "true"), e && t.setAttribute("nonce", e), document.head.appendChild(t), () => document.querySelectorAll("[data-mantine-disable-transition]").forEach((o) => o.remove());
}
function nm({ keepTransitions: e } = {}) {
  const t = f.useRef($r), n = f.useRef(-1), o = f.use(rp), r = sp(), s = f.useRef(r?.());
  if (!o) throw new Error("[@mantine/core] MantineProvider was not found in tree");
  const a = (p) => {
    o.setColorScheme(p), t.current = e ? () => {
    } : ac(s.current), window.clearTimeout(n.current), n.current = window.setTimeout(() => {
      t.current?.();
    }, 10);
  }, i = () => {
    o.clearColorScheme(), t.current = e ? () => {
    } : ac(s.current), window.clearTimeout(n.current), n.current = window.setTimeout(() => {
      t.current?.();
    }, 10);
  }, c = Tp("light", { getInitialValueInEffect: !1 }), u = o.colorScheme === "auto" ? c : o.colorScheme, d = f.useCallback(() => a(u === "light" ? "dark" : "light"), [a, u]);
  return f.useEffect(() => () => {
    t.current?.(), window.clearTimeout(n.current);
  }, []), {
    colorScheme: o.colorScheme,
    setColorScheme: a,
    clearColorScheme: i,
    toggleColorScheme: d
  };
}
function ra(e, t) {
  return Array.isArray(e) ? [...e].reduce((n, o) => ({
    ...n,
    ...ra(o, t)
  }), {}) : typeof e == "function" ? e(t) : e ?? {};
}
const om = f.createContext({
  dir: "ltr",
  toggleDirection: () => {
  },
  setDirection: () => {
  }
});
function yo() {
  return f.use(om);
}
const rm = {
  transitionDuration: 200,
  transitionTimingFunction: "ease",
  animateOpacity: !0,
  orientation: "vertical",
  keepMounted: !0,
  keepMountedMode: "activity"
}, Gl = se((e) => {
  const { children: t, expanded: n, transitionDuration: o, transitionTimingFunction: r, style: s, onTransitionEnd: a, onTransitionStart: i, animateOpacity: c, keepMounted: u, keepMountedMode: d, ref: p, orientation: m, ...h } = Z("Collapse", rm, e), g = Ta(), v = Jo(), w = Aa(), x = v.respectReducedMotion && w ? 0 : o, E = (m === "horizontal" ? em : Zp)({
    expanded: n,
    transitionDuration: x,
    transitionTimingFunction: r,
    onTransitionEnd: a,
    onTransitionStart: i,
    keepMounted: !1
  });
  if (x === 0)
    return u === !0 && (d === "display-none" || g !== "test") ? d === "display-none" ? /* @__PURE__ */ l.jsx(Q, {
      ...h,
      style: {
        ...ra(s, v),
        ...n ? {} : { display: "none" }
      },
      ref: p,
      children: t
    }) : /* @__PURE__ */ l.jsx(f.Activity, {
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
  const j = E.state === "exited";
  let k;
  return u === !1 ? k = j ? null : t : u === !0 ? k = d === "display-none" ? t : /* @__PURE__ */ l.jsx(f.Activity, {
    mode: j ? "hidden" : "visible",
    children: t
  }) : k = t, /* @__PURE__ */ l.jsx(Q, {
    ...h,
    ...E.getCollapseProps({
      style: {
        opacity: n || !c ? 1 : 0,
        transition: c ? `opacity ${x}ms ${r}` : "none",
        ...ra(s, v),
        ...u && d === "display-none" && j ? { display: "none" } : {}
      },
      ref: p
    }),
    children: k
  });
});
Gl.displayName = "@mantine/core/Collapse";
const [sm, Nt] = Kt("ScrollArea.Root component was not found in tree");
function yn(e, t) {
  const n = f.useEffectEvent(t);
  Oo(() => {
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
function am(e) {
  const { style: t, ...n } = e, o = Nt(), [r, s] = f.useState(0), [a, i] = f.useState(0), c = !!(r && a);
  return yn(o.scrollbarX, () => {
    const u = o.scrollbarX?.offsetHeight || 0;
    o.onCornerHeightChange(u), i(u);
  }), yn(o.scrollbarY, () => {
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
function im(e) {
  const t = Nt(), n = !!(t.scrollbarX && t.scrollbarY);
  return t.type !== "scroll" && n ? /* @__PURE__ */ l.jsx(am, { ...e }) : null;
}
const cm = {
  scrollHideDelay: 1e3,
  type: "hover"
};
function Jl(e) {
  const { type: t, scrollHideDelay: n, scrollbars: o, getStyles: r, ref: s, ...a } = Z("ScrollAreaRoot", cm, e), [i, c] = f.useState(null), [u, d] = f.useState(null), [p, m] = f.useState(null), [h, g] = f.useState(null), [v, w] = f.useState(null), [x, E] = f.useState(0), [j, k] = f.useState(0), [R, P] = f.useState(!1), [S, y] = f.useState(!1), N = Fe(s, c);
  return /* @__PURE__ */ l.jsx(sm, {
    value: {
      type: t,
      scrollHideDelay: n,
      scrollArea: i,
      viewport: u,
      onViewportChange: d,
      content: p,
      onContentChange: m,
      scrollbarX: h,
      onScrollbarXChange: g,
      scrollbarXEnabled: R,
      onScrollbarXEnabledChange: P,
      scrollbarY: v,
      onScrollbarYChange: w,
      scrollbarYEnabled: S,
      onScrollbarYEnabledChange: y,
      onCornerWidthChange: E,
      onCornerHeightChange: k,
      getStyles: r
    },
    children: /* @__PURE__ */ l.jsx(Q, {
      ...a,
      ref: N,
      __vars: {
        "--sa-corner-width": o !== "xy" ? "0px" : `${x}px`,
        "--sa-corner-height": o !== "xy" ? "0px" : `${j}px`
      }
    })
  });
}
Jl.displayName = "@mantine/core/ScrollAreaRoot";
function Zl(e, t) {
  const n = e / t;
  return Number.isNaN(n) ? 0 : n;
}
function Qr(e) {
  const t = Zl(e.viewport, e.content), n = e.scrollbar.paddingStart + e.scrollbar.paddingEnd, o = (e.scrollbar.size - n) * t;
  return Math.max(o, 18);
}
function Ql(e, t) {
  return (n) => {
    if (e[0] === e[1] || t[0] === t[1]) return t[0];
    const o = (t[1] - t[0]) / (e[1] - e[0]);
    return t[0] + o * (n - e[0]);
  };
}
function lm(e, [t, n]) {
  return Math.min(n, Math.max(t, e));
}
function ic(e, t, n = "ltr") {
  const o = Qr(t), r = t.scrollbar.paddingStart + t.scrollbar.paddingEnd, s = t.scrollbar.size - r, a = t.content - t.viewport, i = s - o, c = lm(e, n === "ltr" ? [0, a] : [a * -1, 0]);
  return Ql([0, a], [0, i])(c);
}
function um(e, t, n, o = "ltr") {
  const r = Qr(n), s = r / 2, a = t || s, i = r - a, c = n.scrollbar.paddingStart + a, u = n.scrollbar.size - n.scrollbar.paddingEnd - i, d = n.content - n.viewport, p = o === "ltr" ? [0, d] : [d * -1, 0];
  return Ql([c, u], p)(e);
}
function eu(e, t) {
  return e > 0 && e < t;
}
function dn(e) {
  return e ? parseInt(e, 10) : 0;
}
function Tn(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
  return (o) => {
    e?.(o), (n === !1 || !o.defaultPrevented) && t?.(o);
  };
}
const [dm, tu] = Kt("ScrollAreaScrollbar was not found in tree");
function nu(e) {
  const { sizes: t, hasThumb: n, onThumbChange: o, onThumbPointerUp: r, onThumbPointerDown: s, onThumbPositionChange: a, onDragScroll: i, onWheelScroll: c, onResize: u, ref: d, ...p } = e, m = Nt(), [h, g] = f.useState(null), v = Fe(d, g), w = f.useRef(null), x = f.useRef(""), { viewport: E } = m, j = t.content - t.viewport, k = f.useEffectEvent(c), R = Zn(a), P = Zr(u, 10), S = (y) => {
    if (w.current) {
      const N = y.clientX - w.current.left, D = y.clientY - w.current.top;
      i({
        x: N,
        y: D
      });
    }
  };
  return f.useEffect(() => {
    const y = (N) => {
      const D = N.target;
      h?.contains(D) && k(N, j);
    };
    return document.addEventListener("wheel", y, { passive: !1 }), () => document.removeEventListener("wheel", y, { passive: !1 });
  }, [
    E,
    h,
    j
  ]), f.useEffect(R, [t, R]), yn(h, P), yn(m.content, P), /* @__PURE__ */ l.jsx(dm, {
    value: {
      scrollbar: h,
      hasThumb: n,
      onThumbChange: Zn(o),
      onThumbPointerUp: Zn(r),
      onThumbPositionChange: R,
      onThumbPointerDown: Zn(s)
    },
    children: /* @__PURE__ */ l.jsx("div", {
      ...p,
      ref: v,
      "data-mantine-scrollbar": !0,
      style: {
        position: "absolute",
        ...p.style
      },
      onPointerDown: Tn(e.onPointerDown, (y) => {
        y.preventDefault(), y.button === 0 && (y.target.setPointerCapture(y.pointerId), w.current = h.getBoundingClientRect(), x.current = document.body.style.webkitUserSelect, document.body.style.webkitUserSelect = "none", S(y));
      }),
      onPointerMove: Tn(e.onPointerMove, S),
      onPointerUp: Tn(e.onPointerUp, (y) => {
        const N = y.target;
        N.hasPointerCapture(y.pointerId) && (y.preventDefault(), N.releasePointerCapture(y.pointerId));
      }),
      onLostPointerCapture: () => {
        document.body.style.webkitUserSelect = x.current, w.current = null;
      }
    })
  });
}
const ou = (e) => {
  const { sizes: t, onSizesChange: n, style: o, ref: r, ...s } = e, a = Nt(), [i, c] = f.useState(), u = f.useRef(null), d = Fe(r, u, a.onScrollbarXChange);
  return f.useEffect(() => {
    u.current && c(getComputedStyle(u.current));
  }, [u]), /* @__PURE__ */ l.jsx(nu, {
    "data-orientation": "horizontal",
    ...s,
    ref: d,
    sizes: t,
    style: {
      ...o,
      "--sa-thumb-width": `${Qr(t)}px`
    },
    onThumbPointerDown: (p) => e.onThumbPointerDown(p.x),
    onDragScroll: (p) => e.onDragScroll(p.x),
    onWheelScroll: (p, m) => {
      if (a.viewport) {
        const h = a.viewport.scrollLeft + p.deltaX;
        e.onWheelScroll(h), eu(h, m) && p.preventDefault();
      }
    },
    onResize: () => {
      u.current && a.viewport && i && n({
        content: a.viewport.scrollWidth,
        viewport: a.viewport.offsetWidth,
        scrollbar: {
          size: u.current.clientWidth,
          paddingStart: dn(i.paddingLeft),
          paddingEnd: dn(i.paddingRight)
        }
      });
    }
  });
};
ou.displayName = "@mantine/core/ScrollAreaScrollbarX";
function ru(e) {
  const { sizes: t, onSizesChange: n, style: o, ref: r, ...s } = e, a = Nt(), [i, c] = f.useState(), u = f.useRef(null), d = Fe(r, u, a.onScrollbarYChange);
  return f.useEffect(() => {
    u.current && c(window.getComputedStyle(u.current));
  }, []), /* @__PURE__ */ l.jsx(nu, {
    ...s,
    "data-orientation": "vertical",
    ref: d,
    sizes: t,
    style: {
      "--sa-thumb-height": `${Qr(t)}px`,
      ...o
    },
    onThumbPointerDown: (p) => e.onThumbPointerDown(p.y),
    onDragScroll: (p) => e.onDragScroll(p.y),
    onWheelScroll: (p, m) => {
      if (a.viewport) {
        const h = a.viewport.scrollTop + p.deltaY;
        e.onWheelScroll(h), eu(h, m) && p.preventDefault();
      }
    },
    onResize: () => {
      u.current && a.viewport && i && n({
        content: a.viewport.scrollHeight,
        viewport: a.viewport.offsetHeight,
        scrollbar: {
          size: u.current.clientHeight,
          paddingStart: dn(i.paddingTop),
          paddingEnd: dn(i.paddingBottom)
        }
      });
    }
  });
}
ru.displayName = "@mantine/core/ScrollAreaScrollbarY";
function es(e) {
  const { orientation: t = "vertical", ...n } = e, { dir: o } = yo(), r = Nt(), s = f.useRef(null), a = f.useRef(0), [i, c] = f.useState({
    content: 0,
    viewport: 0,
    scrollbar: {
      size: 0,
      paddingStart: 0,
      paddingEnd: 0
    }
  }), u = Zl(i.viewport, i.content), d = {
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
  }, p = (m, h) => um(m, a.current, i, h);
  return t === "horizontal" ? /* @__PURE__ */ l.jsx(ou, {
    ...d,
    onThumbPositionChange: () => {
      if (r.viewport && s.current) {
        const m = r.viewport.scrollLeft, h = ic(m, i, o);
        s.current.style.transform = `translate3d(${h}px, 0, 0)`;
      }
    },
    onWheelScroll: (m) => {
      r.viewport && (r.viewport.scrollLeft = m);
    },
    onDragScroll: (m) => {
      r.viewport && (r.viewport.scrollLeft = p(m, o));
    }
  }) : t === "vertical" ? /* @__PURE__ */ l.jsx(ru, {
    ...d,
    onThumbPositionChange: () => {
      if (r.viewport && s.current) {
        const m = r.viewport.scrollTop, h = ic(m, i);
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
es.displayName = "@mantine/core/ScrollAreaScrollbarVisible";
function za(e) {
  const t = Nt(), { forceMount: n, ...o } = e, [r, s] = f.useState(!1), a = e.orientation === "horizontal", i = Zr(() => {
    if (t.viewport) {
      const c = t.viewport.offsetWidth < t.viewport.scrollWidth, u = t.viewport.offsetHeight < t.viewport.scrollHeight;
      s(a ? c : u);
    }
  }, 10);
  return yn(t.viewport, i), yn(t.content, i), n || r ? /* @__PURE__ */ l.jsx(es, {
    "data-state": r ? "visible" : "hidden",
    ...o
  }) : null;
}
za.displayName = "@mantine/core/ScrollAreaScrollbarAuto";
function su(e) {
  const { forceMount: t, ...n } = e, o = Nt(), [r, s] = f.useState(!1);
  return f.useEffect(() => {
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
  }, [o.scrollArea, o.scrollHideDelay]), t || r ? /* @__PURE__ */ l.jsx(za, {
    "data-state": r ? "visible" : "hidden",
    ...n
  }) : null;
}
su.displayName = "@mantine/core/ScrollAreaScrollbarHover";
function fm(e) {
  const { forceMount: t, ...n } = e, o = Nt(), r = e.orientation === "horizontal", [s, a] = f.useState("hidden"), i = Zr(() => a("idle"), 100);
  return f.useEffect(() => {
    if (s === "idle") {
      const c = window.setTimeout(() => a("hidden"), o.scrollHideDelay);
      return () => window.clearTimeout(c);
    }
  }, [s, o.scrollHideDelay]), f.useEffect(() => {
    const { viewport: c } = o, u = r ? "scrollLeft" : "scrollTop";
    if (c) {
      let d = c[u];
      const p = () => {
        const m = c[u];
        d !== m && (a("scrolling"), i()), d = m;
      };
      return c.addEventListener("scroll", p), () => c.removeEventListener("scroll", p);
    }
  }, [
    o.viewport,
    r,
    i
  ]), t || s !== "hidden" ? /* @__PURE__ */ l.jsx(es, {
    "data-state": s === "hidden" ? "hidden" : "visible",
    ...n,
    onPointerEnter: Tn(e.onPointerEnter, () => a("interacting")),
    onPointerLeave: Tn(e.onPointerLeave, () => a("idle"))
  }) : null;
}
function sa(e) {
  const { forceMount: t, ...n } = e, o = Nt(), { onScrollbarXEnabledChange: r, onScrollbarYEnabledChange: s } = o, a = e.orientation === "horizontal";
  return f.useEffect(() => (a ? r(!0) : s(!0), () => {
    a ? r(!1) : s(!1);
  }), [
    a,
    r,
    s
  ]), o.type === "hover" ? /* @__PURE__ */ l.jsx(su, {
    ...n,
    forceMount: t
  }) : o.type === "scroll" ? /* @__PURE__ */ l.jsx(fm, {
    ...n,
    forceMount: t
  }) : o.type === "auto" ? /* @__PURE__ */ l.jsx(za, {
    ...n,
    forceMount: t
  }) : o.type === "always" ? /* @__PURE__ */ l.jsx(es, { ...n }) : null;
}
sa.displayName = "@mantine/core/ScrollAreaScrollbar";
function pm(e, t = () => {
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
function au(e) {
  const { style: t, ref: n, ...o } = e, r = Nt(), s = tu(), { onThumbPositionChange: a } = s, i = Fe(n, s.onThumbChange), c = f.useRef(void 0), u = Zr(() => {
    c.current && (c.current(), c.current = void 0);
  }, 100);
  return f.useEffect(() => {
    const { viewport: d } = r;
    if (d) {
      const p = () => {
        if (u(), !c.current) {
          const m = pm(d, a);
          c.current = m, a();
        }
      };
      return a(), d.addEventListener("scroll", p), () => d.removeEventListener("scroll", p);
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
    onPointerDownCapture: Tn(e.onPointerDownCapture, (d) => {
      const p = d.target.getBoundingClientRect(), m = d.clientX - p.left, h = d.clientY - p.top;
      s.onThumbPointerDown({
        x: m,
        y: h
      });
    }),
    onPointerUp: Tn(e.onPointerUp, s.onThumbPointerUp)
  });
}
au.displayName = "@mantine/core/ScrollAreaThumb";
function aa(e) {
  const { forceMount: t, ...n } = e, o = tu();
  return t || o.hasThumb ? /* @__PURE__ */ l.jsx(au, { ...n }) : null;
}
aa.displayName = "@mantine/core/ScrollAreaThumb";
function iu({ children: e, style: t, ref: n, onWheel: o, ...r }) {
  const s = Nt(), a = Fe(n, s.onViewportChange), i = (c) => {
    if (o?.(c), s.scrollbarXEnabled && s.viewport && c.shiftKey) {
      const { scrollTop: u, scrollHeight: d, clientHeight: p, scrollWidth: m, clientWidth: h } = s.viewport, g = u < 1, v = u >= d - p - 1;
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
iu.displayName = "@mantine/core/ScrollAreaViewport";
var _a = {
  root: "m_d57069b5",
  content: "m_b1336c6",
  viewport: "m_c0783ff9",
  viewportInner: "m_f8f631dd",
  scrollbar: "m_c44ba933",
  thumb: "m_d8b5e363",
  corner: "m_21657268"
};
function ts() {
  return typeof window < "u";
}
function bo(e) {
  return cu(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function mt(e) {
  var t;
  return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function nn(e) {
  var t;
  return (t = (cu(e) ? e.ownerDocument : e.document) || window.document) == null ? void 0 : t.documentElement;
}
function cu(e) {
  return ts() ? e instanceof Node || e instanceof mt(e).Node : !1;
}
function pt(e) {
  return ts() ? e instanceof Element || e instanceof mt(e).Element : !1;
}
function Sn(e) {
  return ts() ? e instanceof HTMLElement || e instanceof mt(e).HTMLElement : !1;
}
function cc(e) {
  return !ts() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof mt(e).ShadowRoot;
}
function ns(e) {
  const {
    overflow: t,
    overflowX: n,
    overflowY: o,
    display: r
  } = Ut(e);
  return /auto|scroll|overlay|hidden|clip/.test(t + o + n) && r !== "inline" && r !== "contents";
}
function mm(e) {
  return /^(table|td|th)$/.test(bo(e));
}
function os(e) {
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
const hm = /transform|translate|scale|rotate|perspective|filter/, gm = /paint|layout|strict|content/, kn = (e) => !!e && e !== "none";
let Os;
function Fa(e) {
  const t = pt(e) ? Ut(e) : e;
  return kn(t.transform) || kn(t.translate) || kn(t.scale) || kn(t.rotate) || kn(t.perspective) || !Ba() && (kn(t.backdropFilter) || kn(t.filter)) || hm.test(t.willChange || "") || gm.test(t.contain || "");
}
function vm(e) {
  let t = Mn(e);
  for (; Sn(t) && !zo(t); ) {
    if (Fa(t))
      return t;
    if (os(t))
      return null;
    t = Mn(t);
  }
  return null;
}
function Ba() {
  return Os == null && (Os = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), Os;
}
function zo(e) {
  return /^(html|body|#document)$/.test(bo(e));
}
function Ut(e) {
  return mt(e).getComputedStyle(e);
}
function rs(e) {
  return pt(e) ? {
    scrollLeft: e.scrollLeft,
    scrollTop: e.scrollTop
  } : {
    scrollLeft: e.scrollX,
    scrollTop: e.scrollY
  };
}
function Mn(e) {
  if (bo(e) === "html")
    return e;
  const t = (
    // Step into the shadow DOM of the parent of a slotted node.
    e.assignedSlot || // DOM Element detected.
    e.parentNode || // ShadowRoot detected.
    cc(e) && e.host || // Fallback.
    nn(e)
  );
  return cc(t) ? t.host : t;
}
function lu(e) {
  const t = Mn(e);
  return zo(t) ? (e.ownerDocument || e).body : Sn(t) && ns(t) ? t : lu(t);
}
function _o(e, t, n) {
  var o;
  t === void 0 && (t = []), n === void 0 && (n = !0);
  const r = lu(e), s = r === ((o = e.ownerDocument) == null ? void 0 : o.body), a = mt(r);
  if (s) {
    const i = ia(a);
    return t.concat(a, a.visualViewport || [], ns(r) ? r : [], i && n ? _o(i) : []);
  } else
    return t.concat(r, _o(r, [], n));
}
function ia(e) {
  return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
const ym = ["top", "right", "bottom", "left"], Lt = Math.min, jt = Math.max, zr = Math.round, br = Math.floor, Zt = (e) => ({
  x: e,
  y: e
}), bm = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
function uu(e, t, n) {
  return jt(e, Lt(t, n));
}
function Wt(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function qt(e) {
  return e.split("-")[0];
}
function wo(e) {
  return e.split("-")[1];
}
function Va(e) {
  return e === "x" ? "y" : "x";
}
function Ha(e) {
  return e === "y" ? "height" : "width";
}
function Mt(e) {
  const t = e[0];
  return t === "t" || t === "b" ? "y" : "x";
}
function Ua(e) {
  return Va(Mt(e));
}
function wm(e, t, n) {
  n === void 0 && (n = !1);
  const o = wo(e), r = Ua(e), s = Ha(r);
  let a = r === "x" ? o === (n ? "end" : "start") ? "right" : "left" : o === "start" ? "bottom" : "top";
  return t.reference[s] > t.floating[s] && (a = _r(a)), [a, _r(a)];
}
function xm(e) {
  const t = _r(e);
  return [ca(e), t, ca(t)];
}
function ca(e) {
  return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
const lc = ["left", "right"], uc = ["right", "left"], Sm = ["top", "bottom"], Cm = ["bottom", "top"];
function jm(e, t, n) {
  switch (e) {
    case "top":
    case "bottom":
      return n ? t ? uc : lc : t ? lc : uc;
    case "left":
    case "right":
      return t ? Sm : Cm;
    default:
      return [];
  }
}
function km(e, t, n, o) {
  const r = wo(e);
  let s = jm(qt(e), n === "start", o);
  return r && (s = s.map((a) => a + "-" + r), t && (s = s.concat(s.map(ca)))), s;
}
function _r(e) {
  const t = qt(e);
  return bm[t] + e.slice(t.length);
}
function Em(e) {
  var t, n, o, r;
  return {
    top: (t = e.top) != null ? t : 0,
    right: (n = e.right) != null ? n : 0,
    bottom: (o = e.bottom) != null ? o : 0,
    left: (r = e.left) != null ? r : 0
  };
}
function Wa(e) {
  return typeof e != "number" ? Em(e) : {
    top: e,
    right: e,
    bottom: e,
    left: e
  };
}
function gn(e) {
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
var Rm = typeof document < "u", Nm = function() {
}, la = Rm ? f.useLayoutEffect : Nm;
const Pm = {
  ...Nl
}, Tm = Pm.useInsertionEffect, Am = Tm || ((e) => e());
function Im(e) {
  const t = f.useRef(() => {
  });
  return Am(() => {
    t.current = e;
  }), f.useCallback(function() {
    for (var n = arguments.length, o = new Array(n), r = 0; r < n; r++)
      o[r] = arguments[r];
    return t.current == null ? void 0 : t.current(...o);
  }, []);
}
function dc(e, t, n) {
  let {
    reference: o,
    floating: r
  } = e;
  const s = Mt(t), a = Ua(t), i = Ha(a), c = qt(t), u = s === "y", d = o.x + o.width / 2 - r.width / 2, p = o.y + o.height / 2 - r.height / 2, m = o[i] / 2 - r[i] / 2;
  let h;
  switch (c) {
    case "top":
      h = {
        x: d,
        y: o.y - r.height
      };
      break;
    case "bottom":
      h = {
        x: d,
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
  const g = wo(t);
  return g && (h[a] += m * (g === "end" ? 1 : -1) * (n && u ? -1 : 1)), h;
}
async function Mm(e, t) {
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
    rootBoundary: d = "viewport",
    elementContext: p = "floating",
    altBoundary: m = !1,
    padding: h = 0
  } = Wt(t, e), g = Wa(h), w = i[m ? p === "floating" ? "reference" : "floating" : p], x = gn(await s.getClippingRect({
    element: (n = await (s.isElement == null ? void 0 : s.isElement(w))) == null || n ? w : w.contextElement || await (s.getDocumentElement == null ? void 0 : s.getDocumentElement(i.floating)),
    boundary: u,
    rootBoundary: d,
    strategy: c
  })), E = p === "floating" ? {
    x: o,
    y: r,
    width: a.floating.width,
    height: a.floating.height
  } : a.reference, j = await (s.getOffsetParent == null ? void 0 : s.getOffsetParent(i.floating)), k = await (s.isElement == null ? void 0 : s.isElement(j)) && await (s.getScale == null ? void 0 : s.getScale(j)) || {
    x: 1,
    y: 1
  }, R = gn(s.convertOffsetParentRelativeRectToViewportRelativeRect ? await s.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements: i,
    rect: E,
    offsetParent: j,
    strategy: c
  }) : E);
  return {
    top: (x.top - R.top + g.top) / k.y,
    bottom: (R.bottom - x.bottom + g.bottom) / k.y,
    left: (x.left - R.left + g.left) / k.x,
    right: (R.right - x.right + g.right) / k.x
  };
}
const Dm = 50, Om = async (e, t, n) => {
  const {
    placement: o = "bottom",
    strategy: r = "absolute",
    middleware: s = [],
    platform: a
  } = n, i = a.detectOverflow ? a : {
    ...a,
    detectOverflow: Mm
  }, c = await (a.isRTL == null ? void 0 : a.isRTL(t));
  let u = await a.getElementRects({
    reference: e,
    floating: t,
    strategy: r
  }), {
    x: d,
    y: p
  } = dc(u, o, c), m = o, h = 0;
  const g = {};
  for (let v = 0; v < s.length; v++) {
    const w = s[v];
    if (!w)
      continue;
    const {
      name: x,
      fn: E
    } = w, {
      x: j,
      y: k,
      data: R,
      reset: P
    } = await E({
      x: d,
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
    d = j ?? d, p = k ?? p, g[x] = {
      ...g[x],
      ...R
    }, P && h < Dm && (h++, typeof P == "object" && (P.placement && (m = P.placement), P.rects && (u = P.rects === !0 ? await a.getElementRects({
      reference: e,
      floating: t,
      strategy: r
    }) : P.rects), {
      x: d,
      y: p
    } = dc(u, m, c)), v = -1);
  }
  return {
    x: d,
    y: p,
    placement: m,
    strategy: r,
    middlewareData: g
  };
}, $m = (e) => ({
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
      padding: d = 0
    } = Wt(e, t) || {};
    if (u == null)
      return {};
    const p = Wa(d), m = {
      x: n,
      y: o
    }, h = Ua(r), g = Ha(h), v = await a.getDimensions(u), w = h === "y", x = w ? "top" : "left", E = w ? "bottom" : "right", j = w ? "clientHeight" : "clientWidth", k = s.reference[g] + s.reference[h] - m[h] - s.floating[g], R = m[h] - s.reference[h], P = await (a.getOffsetParent == null ? void 0 : a.getOffsetParent(u));
    let S = P ? P[j] : 0;
    (!S || !await (a.isElement == null ? void 0 : a.isElement(P))) && (S = i.floating[j] || s.floating[g]);
    const y = k / 2 - R / 2, N = S / 2 - v[g] / 2 - 1, D = Lt(p[x], N), O = Lt(p[E], N), z = S - v[g] - O, _ = S / 2 - v[g] / 2 + y, F = uu(D, _, z), $ = !c.arrow && wo(r) != null && _ !== F && s.reference[g] / 2 - (_ < D ? D : O) - v[g] / 2 < 0, M = $ ? _ < D ? _ - D : _ - z : 0;
    return {
      [h]: m[h] + M,
      data: {
        [h]: F,
        centerOffset: _ - F - M,
        ...$ && {
          alignmentOffset: M
        }
      },
      reset: $
    };
  }
}), Lm = function(e) {
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
        mainAxis: d = !0,
        crossAxis: p = !0,
        fallbackPlacements: m,
        fallbackStrategy: h = "bestFit",
        fallbackAxisSideDirection: g = "none",
        flipAlignment: v = !0,
        ...w
      } = Wt(e, t);
      if ((n = s.arrow) != null && n.alignmentOffset)
        return {};
      const x = qt(r), E = Mt(i), j = qt(i) === i, k = await (c.isRTL == null ? void 0 : c.isRTL(u.floating)), R = m || (j || !v ? [_r(i)] : xm(i)), P = g !== "none";
      !m && P && R.push(...km(i, v, g, k));
      const S = [i, ...R], y = await c.detectOverflow(t, w), N = [];
      let D = ((o = s.flip) == null ? void 0 : o.overflows) || [];
      if (d && N.push(y[x]), p) {
        const F = wm(r, a, k);
        N.push(y[F[0]], y[F[1]]);
      }
      if (D = [...D, {
        placement: r,
        overflows: N
      }], !N.every((F) => F <= 0)) {
        var O, z;
        const F = (((O = s.flip) == null ? void 0 : O.index) || 0) + 1, $ = S[F];
        if ($ && (!(p === "alignment" ? E !== Mt($) : !1) || // We leave the current main axis only if every placement on that axis
        // overflows the main axis.
        D.every((I) => Mt(I.placement) === E ? I.overflows[0] > 0 : !0)))
          return {
            data: {
              index: F,
              overflows: D
            },
            reset: {
              placement: $
            }
          };
        let M = (z = D.filter((L) => L.overflows[0] <= 0).sort((L, I) => L.overflows[1] - I.overflows[1])[0]) == null ? void 0 : z.placement;
        if (!M)
          switch (h) {
            case "bestFit": {
              var _;
              const L = (_ = D.filter((I) => {
                if (P) {
                  const A = Mt(I.placement);
                  return A === E || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  A === "y";
                }
                return !0;
              }).map((I) => [I.placement, I.overflows.filter((A) => A > 0).reduce((A, B) => A + B, 0)]).sort((I, A) => I[1] - A[1])[0]) == null ? void 0 : _[0];
              L && (M = L);
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
function fc(e, t) {
  return {
    top: e.top - t.height,
    right: e.right - t.width,
    bottom: e.bottom - t.height,
    left: e.left - t.width
  };
}
function pc(e) {
  return ym.some((t) => e[t] >= 0);
}
const zm = function(e) {
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
      } = Wt(e, t);
      switch (r) {
        case "referenceHidden": {
          const a = await o.detectOverflow(t, {
            ...s,
            elementContext: "reference"
          }), i = fc(a, n.reference);
          return {
            data: {
              referenceHiddenOffsets: i,
              referenceHidden: pc(i)
            }
          };
        }
        case "escaped": {
          const a = await o.detectOverflow(t, {
            ...s,
            altBoundary: !0
          }), i = fc(a, n.floating);
          return {
            data: {
              escapedOffsets: i,
              escaped: pc(i)
            }
          };
        }
        default:
          return {};
      }
    }
  };
};
function du(e) {
  const t = Lt(...e.map((s) => s.left)), n = Lt(...e.map((s) => s.top)), o = jt(...e.map((s) => s.right)), r = jt(...e.map((s) => s.bottom));
  return {
    x: t,
    y: n,
    width: o - t,
    height: r - n
  };
}
function _m(e) {
  const t = e.slice().sort((r, s) => r.y - s.y), n = [];
  let o = null;
  for (let r = 0; r < t.length; r++) {
    const s = t[r];
    !o || s.y - o.y > o.height / 2 ? n.push([s]) : n[n.length - 1].push(s), o = s;
  }
  return n.map((r) => gn(du(r)));
}
const Fm = function(e) {
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
      } = Wt(e, t), d = Array.from(await (s.getClientRects == null ? void 0 : s.getClientRects(o.reference)) || []);
      if (!d.length)
        return {};
      const p = _m(d), m = gn(du(d)), h = Wa(i);
      function g() {
        if (p.length === 2 && (p[0].left > p[1].right || p[1].left > p[0].right) && c != null && u != null)
          return p.find((w) => c > w.left - h.left && c < w.right + h.right && u > w.top - h.top && u < w.bottom + h.bottom) || m;
        if (p.length >= 2) {
          if (Mt(n) === "y") {
            const P = p[0], S = p[p.length - 1], y = qt(n) === "top", N = P.top, D = S.bottom, O = y ? P.left : S.left, z = y ? P.right : S.right;
            return gn({
              x: O,
              y: N,
              width: z - O,
              height: D - N
            });
          }
          const w = qt(n) === "left", x = jt(...p.map((P) => P.right)), E = Lt(...p.map((P) => P.left)), j = p.filter((P) => w ? P.left === E : P.right === x), k = j[0].top, R = j[j.length - 1].bottom;
          return gn({
            x: E,
            y: k,
            width: x - E,
            height: R - k
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
}, fu = /* @__PURE__ */ new Set(["left", "top"]);
async function Bm(e, t) {
  const {
    placement: n,
    platform: o,
    elements: r
  } = e, s = await (o.isRTL == null ? void 0 : o.isRTL(r.floating)), a = qt(n), i = wo(n), c = Mt(n) === "y", u = fu.has(a) ? -1 : 1, d = s && c ? -1 : 1, p = Wt(t, e);
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
    x: h * d,
    y: m * u
  } : {
    x: m * u,
    y: h * d
  };
}
const Vm = function(e) {
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
      } = t, c = await Bm(t, e);
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
}, Hm = function(e) {
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
          fn: (E) => {
            let {
              x: j,
              y: k
            } = E;
            return {
              x: j,
              y: k
            };
          }
        },
        ...u
      } = Wt(e, t), d = {
        x: n,
        y: o
      }, p = await s.detectOverflow(t, u), m = Mt(r), h = Va(m);
      let g = d[h], v = d[m];
      const w = (E, j) => uu(j + p[E === "y" ? "top" : "left"], j, j - p[E === "y" ? "bottom" : "right"]);
      a && (g = w(h, g)), i && (v = w(m, v));
      const x = c.fn({
        ...t,
        [h]: g,
        [m]: v
      });
      return {
        ...x,
        data: {
          x: x.x - n,
          y: x.y - o,
          enabled: {
            [h]: a,
            [m]: i
          }
        }
      };
    }
  };
}, Um = function(e) {
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
        mainAxis: d = !0,
        crossAxis: p = !0
      } = Wt(e, t), m = {
        x: r,
        y: s
      }, h = Mt(a), g = Va(h);
      let v = m[g], w = m[h];
      const x = Wt(u, t), E = typeof x == "number" ? {
        mainAxis: x,
        crossAxis: 0
      } : {
        mainAxis: (n = x.mainAxis) != null ? n : 0,
        crossAxis: (o = x.crossAxis) != null ? o : 0
      };
      if (d) {
        const R = g === "y" ? "height" : "width", P = i.reference[g] - i.floating[R] + E.mainAxis, S = i.reference[g] + i.reference[R] - E.mainAxis;
        v < P ? v = P : v > S && (v = S);
      }
      if (p) {
        var j, k;
        const R = g === "y" ? "width" : "height", P = fu.has(qt(a)), S = i.reference[h] - i.floating[R] + (P && ((j = c.offset) == null ? void 0 : j[h]) || 0) + (P ? 0 : E.crossAxis), y = i.reference[h] + i.reference[R] + (P ? 0 : ((k = c.offset) == null ? void 0 : k[h]) || 0) - (P ? E.crossAxis : 0);
        w < S ? w = S : w > y && (w = y);
      }
      return {
        [g]: v,
        [h]: w
      };
    }
  };
}, Wm = function(e) {
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
      } = Wt(e, t), c = await r.detectOverflow(t, i), u = qt(n), d = wo(n), p = Mt(n) === "y", {
        width: m,
        height: h
      } = o.floating;
      let g, v;
      u === "top" || u === "bottom" ? (g = u, v = d === (await (r.isRTL == null ? void 0 : r.isRTL(s.floating)) ? "start" : "end") ? "left" : "right") : (v = u, g = d === "end" ? "top" : "bottom");
      const w = h - c.top - c.bottom, x = m - c.left - c.right, E = Lt(h - c[g], w), j = Lt(m - c[v], x), k = t.middlewareData.shift, R = !k;
      let P = E, S = j;
      k != null && k.enabled.x && (S = x), k != null && k.enabled.y && (P = w), R && !d && (p ? S = m - 2 * jt(c.left, c.right) : P = h - 2 * jt(c.top, c.bottom)), await a({
        ...t,
        availableWidth: S,
        availableHeight: P
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
function pu(e) {
  const t = Ut(e);
  let n = parseFloat(t.width) || 0, o = parseFloat(t.height) || 0;
  const r = Sn(e), s = r ? e.offsetWidth : n, a = r ? e.offsetHeight : o, i = zr(n) !== s || zr(o) !== a;
  return i && (n = s, o = a), {
    width: n,
    height: o,
    $: i
  };
}
function qa(e) {
  return pt(e) ? e : e.contextElement;
}
function Qn(e) {
  const t = qa(e);
  if (!Sn(t))
    return Zt(1);
  const n = t.getBoundingClientRect(), {
    width: o,
    height: r,
    $: s
  } = pu(t);
  let a = (s ? zr(n.width) : n.width) / o, i = (s ? zr(n.height) : n.height) / r;
  return (!a || !Number.isFinite(a)) && (a = 1), (!i || !Number.isFinite(i)) && (i = 1), {
    x: a,
    y: i
  };
}
const qm = /* @__PURE__ */ Zt(0);
function mu(e) {
  const t = mt(e);
  return !Ba() || !t.visualViewport ? qm : {
    x: t.visualViewport.offsetLeft,
    y: t.visualViewport.offsetTop
  };
}
function Km(e, t, n) {
  return t === void 0 && (t = !1), !!n && t && n === mt(e);
}
function Dn(e, t, n, o) {
  t === void 0 && (t = !1), n === void 0 && (n = !1);
  const r = e.getBoundingClientRect(), s = qa(e);
  let a = Zt(1);
  t && (o ? pt(o) && (a = Qn(o)) : a = Qn(e));
  const i = Km(s, n, o) ? mu(s) : Zt(0);
  let c = (r.left + i.x) / a.x, u = (r.top + i.y) / a.y, d = r.width / a.x, p = r.height / a.y;
  if (s && o) {
    const m = mt(s), h = pt(o) ? mt(o) : o;
    let g = m, v = ia(g);
    for (; v && h !== g; ) {
      const w = Qn(v), x = v.getBoundingClientRect(), E = Ut(v), j = x.left + (v.clientLeft + parseFloat(E.paddingLeft)) * w.x, k = x.top + (v.clientTop + parseFloat(E.paddingTop)) * w.y;
      c *= w.x, u *= w.y, d *= w.x, p *= w.y, c += j, u += k, g = mt(v), v = ia(g);
    }
  }
  return gn({
    width: d,
    height: p,
    x: c,
    y: u
  });
}
function ss(e, t) {
  const n = rs(e).scrollLeft;
  return t ? t.left + n : Dn(nn(e)).left + n;
}
function hu(e, t) {
  const n = e.getBoundingClientRect(), o = n.left + t.scrollLeft - ss(e, n), r = n.top + t.scrollTop;
  return {
    x: o,
    y: r
  };
}
function Xm(e) {
  let {
    elements: t,
    rect: n,
    offsetParent: o,
    strategy: r
  } = e;
  const s = r === "fixed", a = nn(o), i = t ? os(t.floating) : !1;
  if (o === a || i && s)
    return n;
  let c = {
    scrollLeft: 0,
    scrollTop: 0
  }, u = Zt(1);
  const d = Zt(0), p = Sn(o);
  if ((p || !s) && ((bo(o) !== "body" || ns(a)) && (c = rs(o)), p)) {
    const h = Dn(o);
    u = Qn(o), d.x = h.x + o.clientLeft, d.y = h.y + o.clientTop;
  }
  const m = a && !p && !s ? hu(a, c) : Zt(0);
  return {
    width: n.width * u.x,
    height: n.height * u.y,
    x: n.x * u.x - c.scrollLeft * u.x + d.x + m.x,
    y: n.y * u.y - c.scrollTop * u.y + d.y + m.y
  };
}
function Ym(e) {
  return e.getClientRects ? Array.from(e.getClientRects()) : [];
}
function Gm(e) {
  const t = rs(e), n = e.ownerDocument.body, o = jt(e.scrollWidth, e.clientWidth, n.scrollWidth, n.clientWidth), r = jt(e.scrollHeight, e.clientHeight, n.scrollHeight, n.clientHeight);
  let s = -t.scrollLeft + ss(e);
  const a = -t.scrollTop;
  return Ut(n).direction === "rtl" && (s += jt(e.clientWidth, n.clientWidth) - o), {
    width: o,
    height: r,
    x: s,
    y: a
  };
}
const Jm = 25;
function Zm(e, t, n) {
  n === void 0 && (n = "viewport");
  const o = n === "layoutViewport", r = mt(e), s = nn(e), a = r.visualViewport;
  let i = s.clientWidth, c = s.clientHeight, u = 0, d = 0;
  if (a) {
    const m = !Ba() || t === "fixed";
    o ? m || (u = -a.offsetLeft, d = -a.offsetTop) : (i = a.width, c = a.height, m && (u = a.offsetLeft, d = a.offsetTop));
  }
  if (ss(s) <= 0) {
    const m = s.ownerDocument, h = m.body, g = getComputedStyle(h), v = m.compatMode === "CSS1Compat" && parseFloat(g.marginLeft) + parseFloat(g.marginRight) || 0, w = Math.abs(s.clientWidth - h.clientWidth - v), x = getComputedStyle(s).scrollbarGutter === "stable both-edges" ? w / 2 : w;
    x <= Jm && (i -= x);
  }
  return {
    width: i,
    height: c,
    x: u,
    y: d
  };
}
function Qm(e, t) {
  const n = Dn(e, !0, t === "fixed"), o = n.top + e.clientTop, r = n.left + e.clientLeft, s = Qn(e), a = e.clientWidth * s.x, i = e.clientHeight * s.y, c = r * s.x, u = o * s.y;
  return {
    width: a,
    height: i,
    x: c,
    y: u
  };
}
function mc(e, t, n) {
  let o;
  if (t === "viewport" || t === "layoutViewport")
    o = Zm(e, n, t);
  else if (t === "document")
    o = Gm(nn(e));
  else if (pt(t))
    o = Qm(t, n);
  else {
    const r = mu(e);
    o = {
      x: t.x - r.x,
      y: t.y - r.y,
      width: t.width,
      height: t.height
    };
  }
  return gn(o);
}
function eh(e, t) {
  const n = t.get(e);
  if (n)
    return n;
  let o = _o(e, [], !1).filter((i) => pt(i) && bo(i) !== "body"), r = null;
  const s = Ut(e).position === "fixed";
  let a = s ? Mn(e) : e;
  for (; pt(a) && !zo(a); ) {
    const i = Ut(a), c = Fa(a), u = r ? r.position : s ? "fixed" : "";
    !c && (u === "fixed" || u === "absolute" && i.position === "static") ? o = o.filter((p) => p !== a) : r = i, a = Mn(a);
  }
  return t.set(e, o), o;
}
function th(e) {
  let {
    element: t,
    boundary: n,
    rootBoundary: o,
    strategy: r
  } = e;
  const a = [...n === "clippingAncestors" ? os(t) ? [] : eh(t, this._c) : [].concat(n), o], i = mc(t, a[0], r);
  let c = i.top, u = i.right, d = i.bottom, p = i.left;
  for (let m = 1; m < a.length; m++) {
    const h = mc(t, a[m], r);
    c = jt(h.top, c), u = Lt(h.right, u), d = Lt(h.bottom, d), p = jt(h.left, p);
  }
  return {
    width: u - p,
    height: d - c,
    x: p,
    y: c
  };
}
function nh(e) {
  const {
    width: t,
    height: n
  } = pu(e);
  return {
    width: t,
    height: n
  };
}
function oh(e, t, n) {
  const o = Sn(t), r = nn(t), s = n === "fixed", a = Dn(e, !0, s, t);
  let i = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const c = Zt(0);
  if ((o || !s) && ((bo(t) !== "body" || ns(r)) && (i = rs(t)), o)) {
    const m = Dn(t, !0, s, t);
    c.x = m.x + t.clientLeft, c.y = m.y + t.clientTop;
  }
  !o && r && (c.x = ss(r));
  const u = r && !o && !s ? hu(r, i) : Zt(0), d = a.left + i.scrollLeft - c.x - u.x, p = a.top + i.scrollTop - c.y - u.y;
  return {
    x: d,
    y: p,
    width: a.width,
    height: a.height
  };
}
function $s(e) {
  return Ut(e).position === "static";
}
function hc(e, t) {
  if (!Sn(e) || Ut(e).position === "fixed")
    return null;
  if (t)
    return t(e);
  let n = e.offsetParent;
  return nn(e) === n && (n = n.ownerDocument.body), n;
}
function gu(e, t) {
  const n = mt(e);
  if (os(e))
    return n;
  if (!Sn(e)) {
    let r = Mn(e);
    for (; r && !zo(r); ) {
      if (pt(r) && !$s(r))
        return r;
      r = Mn(r);
    }
    return n;
  }
  let o = hc(e, t);
  for (; o && mm(o) && $s(o); )
    o = hc(o, t);
  return o && zo(o) && $s(o) && !Fa(o) ? n : o || vm(e) || n;
}
const rh = async function(e) {
  const t = this.getOffsetParent || gu, n = this.getDimensions, o = await n(e.floating);
  return {
    reference: oh(e.reference, await t(e.floating), e.strategy),
    floating: {
      x: 0,
      y: 0,
      width: o.width,
      height: o.height
    }
  };
};
function sh(e) {
  return Ut(e).direction === "rtl";
}
const ah = {
  convertOffsetParentRelativeRectToViewportRelativeRect: Xm,
  getDocumentElement: nn,
  getClippingRect: th,
  getOffsetParent: gu,
  getElementRects: rh,
  getClientRects: Ym,
  getDimensions: nh,
  getScale: Qn,
  isElement: pt,
  isRTL: sh
};
function vu(e, t) {
  return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function ih(e, t, n) {
  let o = null, r;
  const s = nn(e);
  function a() {
    var d;
    clearTimeout(r), (d = o) == null || d.disconnect(), o = null;
  }
  function i(d, p) {
    d === void 0 && (d = !1), p === void 0 && (p = 1), a();
    const m = e.getBoundingClientRect(), {
      left: h,
      top: g,
      width: v,
      height: w
    } = m;
    if (d || t(), !v || !w)
      return;
    const x = br(g), E = br(s.clientWidth - (h + v)), j = br(s.clientHeight - (g + w)), k = br(h), P = {
      rootMargin: -x + "px " + -E + "px " + -j + "px " + -k + "px",
      threshold: jt(0, Lt(1, p)) || 1
    };
    let S = !0;
    function y(N) {
      const D = N[0].intersectionRatio;
      if (!vu(m, e.getBoundingClientRect()))
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
        ...P,
        // Handle <iframe>s
        root: s.ownerDocument
      });
    } catch {
      o = new IntersectionObserver(y, P);
    }
    o.observe(e);
  }
  const c = mt(e), u = () => i(n);
  return c.addEventListener("resize", u), i(!0), () => {
    c.removeEventListener("resize", u), a();
  };
}
function gc(e, t, n, o) {
  o === void 0 && (o = {});
  const {
    ancestorScroll: r = !0,
    ancestorResize: s = !0,
    elementResize: a = typeof ResizeObserver == "function",
    layoutShift: i = typeof IntersectionObserver == "function",
    animationFrame: c = !1
  } = o, u = qa(e), d = r || s ? [...u ? _o(u) : [], ...t ? _o(t) : []] : [];
  d.forEach((x) => {
    r && x.addEventListener("scroll", n), s && x.addEventListener("resize", n);
  });
  const p = u && i ? ih(u, n, s) : null;
  let m = -1, h = null;
  a && (h = new ResizeObserver((x) => {
    let [E] = x;
    E && E.target === u && h && t && (h.unobserve(t), cancelAnimationFrame(m), m = requestAnimationFrame(() => {
      var j;
      (j = h) == null || j.observe(t);
    })), n();
  }), u && !c && h.observe(u), t && h.observe(t));
  let g, v = c ? Dn(e) : null;
  c && w();
  function w() {
    const x = Dn(e);
    v && !vu(v, x) && n(), v = x, g = requestAnimationFrame(w);
  }
  return n(), () => {
    var x;
    d.forEach((E) => {
      r && E.removeEventListener("scroll", n), s && E.removeEventListener("resize", n);
    }), p?.(), (x = h) == null || x.disconnect(), h = null, c && cancelAnimationFrame(g);
  };
}
const ch = Vm, lh = Hm, uh = Lm, dh = Wm, fh = zm, vc = $m, ph = Fm, mh = Um, hh = (e, t, n) => {
  const o = /* @__PURE__ */ new Map(), r = n ?? {}, s = {
    ...ah,
    ...r.platform,
    _c: o
  };
  return Om(e, t, {
    ...r,
    platform: s
  });
};
var gh = typeof document < "u", vh = function() {
}, Er = gh ? f.useLayoutEffect : vh;
function Fr(e, t) {
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
        if (!Fr(e[o], t[o]))
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
      if (!(s === "_owner" && e.$$typeof) && !Fr(e[s], t[s]))
        return !1;
    }
    return !0;
  }
  return e !== e && t !== t;
}
function yu(e) {
  return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function yc(e, t) {
  const n = yu(e);
  return Math.round(t * n) / n;
}
function Ls(e) {
  const t = f.useRef(e);
  return Er(() => {
    t.current = e;
  }), t;
}
function yh(e) {
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
  } = e, [d, p] = f.useState({
    x: 0,
    y: 0,
    strategy: n,
    placement: t,
    middlewareData: {},
    isPositioned: !1
  }), [m, h] = f.useState(o);
  Fr(m, o) || h(o);
  const [g, v] = f.useState(null), [w, x] = f.useState(null), E = f.useCallback((I) => {
    I !== P.current && (P.current = I, v(I));
  }, []), j = f.useCallback((I) => {
    I !== S.current && (S.current = I, x(I));
  }, []), k = s || g, R = a || w, P = f.useRef(null), S = f.useRef(null), y = f.useRef(d), N = c != null, D = Ls(c), O = Ls(r), z = Ls(u), _ = f.useCallback(() => {
    if (!P.current || !S.current)
      return;
    const I = {
      placement: t,
      strategy: n,
      middleware: m
    };
    O.current && (I.platform = O.current), hh(P.current, S.current, I).then((A) => {
      const B = {
        ...A,
        // The floating element's position may be recomputed while it's closed
        // but still mounted (such as when transitioning out). To ensure
        // `isPositioned` will be `false` initially on the next open, avoid
        // setting it to `true` when `open === false` (must be specified).
        isPositioned: z.current !== !1
      };
      F.current && !Fr(y.current, B) && (y.current = B, Ht.flushSync(() => {
        p(B);
      }));
    });
  }, [m, t, n, O, z]);
  Er(() => {
    u === !1 && y.current.isPositioned && (y.current.isPositioned = !1, p((I) => ({
      ...I,
      isPositioned: !1
    })));
  }, [u]);
  const F = f.useRef(!1);
  Er(() => (F.current = !0, () => {
    F.current = !1;
  }), []), Er(() => {
    if (k && (P.current = k), R && (S.current = R), k && R) {
      if (D.current)
        return D.current(k, R, _);
      _();
    }
  }, [k, R, _, D, N]);
  const $ = f.useMemo(() => ({
    reference: P,
    floating: S,
    setReference: E,
    setFloating: j
  }), [E, j]), M = f.useMemo(() => ({
    reference: k,
    floating: R
  }), [k, R]), L = f.useMemo(() => {
    const I = {
      position: n,
      left: 0,
      top: 0
    };
    if (!M.floating)
      return I;
    const A = yc(M.floating, d.x), B = yc(M.floating, d.y);
    return i ? {
      ...I,
      transform: "translate(" + A + "px, " + B + "px)",
      ...yu(M.floating) >= 1.5 && {
        willChange: "transform"
      }
    } : {
      position: n,
      left: A,
      top: B
    };
  }, [n, i, M.floating, d.x, d.y]);
  return f.useMemo(() => ({
    ...d,
    update: _,
    refs: $,
    elements: M,
    floatingStyles: L
  }), [d, _, $, M, L]);
}
const bh = (e) => {
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
      return o && t(o) ? o.current != null ? vc({
        element: o.current,
        padding: r
      }).fn(n) : {} : o ? vc({
        element: o,
        padding: r
      }).fn(n) : {};
    }
  };
}, wh = (e, t) => {
  const n = ch(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, xh = (e, t) => {
  const n = lh(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, Sh = (e, t) => ({
  fn: mh(e).fn,
  options: [e, t]
}), Ch = (e, t) => {
  const n = uh(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, jh = (e, t) => {
  const n = dh(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, kh = (e, t) => {
  const n = fh(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, bc = (e, t) => {
  const n = ph(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, Eh = (e, t) => {
  const n = bh(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
};
function bu(e) {
  const t = f.useRef(void 0), n = f.useCallback((o) => {
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
  return f.useMemo(() => e.every((o) => o == null) ? null : (o) => {
    t.current && (t.current(), t.current = void 0), o != null && (t.current = n(o));
  }, e);
}
const Rh = {
  ...Nl
};
let wc = !1, Nh = 0;
const xc = () => (
  // Ensure the id is unique with multiple independent versions of Floating UI
  // on <React 18
  "floating-ui-" + Math.random().toString(36).slice(2, 6) + Nh++
);
function Ph() {
  const [e, t] = f.useState(() => wc ? xc() : void 0);
  return la(() => {
    e == null && t(xc());
  }, []), f.useEffect(() => {
    wc = !0;
  }, []), e;
}
const Th = Rh.useId, Ah = Th || Ph;
function Ih() {
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
const Mh = /* @__PURE__ */ f.createContext(null), Dh = /* @__PURE__ */ f.createContext(null), Oh = () => {
  var e;
  return ((e = f.useContext(Mh)) == null ? void 0 : e.id) || null;
}, $h = () => f.useContext(Dh);
function Lh(e) {
  const {
    open: t = !1,
    onOpenChange: n,
    elements: o
  } = e, r = Ah(), s = f.useRef({}), [a] = f.useState(() => Ih()), i = Oh() != null, [c, u] = f.useState(o.reference), d = Im((h, g, v) => {
    s.current.openEvent = h ? g : void 0, a.emit("openchange", {
      open: h,
      event: g,
      reason: v,
      nested: i
    }), n?.(h, g, v);
  }), p = f.useMemo(() => ({
    setPositionReference: u
  }), []), m = f.useMemo(() => ({
    reference: c || o.reference || null,
    floating: o.floating || null,
    domReference: o.reference
  }), [c, o.reference, o.floating]);
  return f.useMemo(() => ({
    dataRef: s,
    open: t,
    onOpenChange: d,
    elements: m,
    events: a,
    floatingId: r,
    refs: p
  }), [t, d, m, a, r, p]);
}
function zh(e) {
  var t, n;
  let {
    elements: o,
    ...r
  } = e === void 0 ? {} : e;
  const {
    nodeId: s
  } = r, a = Lh({
    ...r,
    elements: {
      reference: (t = o?.reference) != null ? t : null,
      floating: (n = o?.floating) != null ? n : null
    }
  }), i = r.rootContext || a, c = i.elements, [u, d] = f.useState(null), [p, m] = f.useState(null), g = c?.domReference || u, v = f.useRef(null), w = $h();
  la(() => {
    g && (v.current = g);
  }, [g]);
  const x = yh({
    ...r,
    elements: {
      ...c,
      ...p && {
        reference: p
      }
    }
  }), E = f.useCallback((S) => {
    const y = pt(S) ? {
      getBoundingClientRect: () => S.getBoundingClientRect(),
      getClientRects: () => S.getClientRects(),
      contextElement: S
    } : S;
    m(y), x.refs.setReference(y);
  }, [x.refs]), j = f.useCallback((S) => {
    (pt(S) || S === null) && (v.current = S, d(S)), (pt(x.refs.reference.current) || x.refs.reference.current === null || // Don't allow setting virtual elements using the old technique back to
    // `null` to support `positionReference` + an unstable `reference`
    // callback ref.
    S !== null && !pt(S)) && x.refs.setReference(S);
  }, [x.refs]), k = f.useMemo(() => ({
    ...x.refs,
    setReference: j,
    setPositionReference: E,
    domReference: v
  }), [x.refs, j, E]), R = f.useMemo(() => ({
    ...x.elements,
    domReference: g
  }), [x.elements, g]), P = f.useMemo(() => ({
    ...x,
    ...i,
    refs: k,
    elements: R,
    nodeId: s
  }), [x, k, R, s, i]);
  return la(() => {
    i.dataRef.current.floatingContext = P;
    const S = w?.nodesRef.current.find((y) => y.id === s);
    S && (S.context = P);
  }), f.useMemo(() => ({
    ...x,
    context: P,
    refs: k,
    elements: R
  }), [x, k, R, P]);
}
const wu = {
  scrollHideDelay: 1e3,
  type: "hover",
  scrollbars: "xy"
}, xu = Oe((e, { scrollbarSize: t, overscrollBehavior: n, scrollbars: o }) => {
  let r = n;
  return n && o && (o === "x" ? r = `${n} auto` : o === "y" && (r = `auto ${n}`)), { root: {
    "--scrollarea-scrollbar-size": Te(t),
    "--scrollarea-over-scroll-behavior": r
  } };
}), Cn = se((e) => {
  const t = Z("ScrollArea", wu, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, scrollbarSize: i, vars: c, type: u, scrollHideDelay: d, viewportProps: p, viewportRef: m, onScrollPositionChange: h, children: g, offsetScrollbars: v, scrollbars: w, onBottomReached: x, onTopReached: E, onLeftReached: j, onRightReached: k, overscrollBehavior: R, startScrollPosition: P, verticalScrollbarPosition: S, attributes: y, ...N } = t, [D, O] = f.useState(!1), [z, _] = f.useState(!1), [F, $] = f.useState(!1), M = f.useRef(!0), L = f.useRef(!1), I = f.useRef(!0), A = f.useRef(!1), B = Ie({
    name: "ScrollArea",
    props: t,
    classes: _a,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: y,
    vars: c,
    varsResolver: xu
  }), U = f.useRef(null), [W, Y] = f.useState(null), ae = f.useCallback((ie) => {
    Y((te) => te === ie ? te : ie);
  }, []), fe = bu([
    m,
    U,
    ae
  ]);
  return yn(v === "present" ? W : null, () => {
    const ie = U.current;
    ie && (_(ie.scrollHeight > ie.clientHeight), $(ie.scrollWidth > ie.clientWidth));
  }), Oo(() => {
    P && U.current && U.current.scrollTo({
      left: P.x ?? 0,
      top: P.y ?? 0
    });
  }, []), /* @__PURE__ */ l.jsxs(Jl, {
    getStyles: B,
    type: u === "never" ? "always" : u,
    scrollHideDelay: d,
    scrollbars: w,
    ...B("root"),
    ...N,
    children: [
      /* @__PURE__ */ l.jsx(iu, {
        ...p,
        ...B("viewport", { style: p?.style }),
        ref: fe,
        "data-offset-scrollbars": v === !0 ? "xy" : v || void 0,
        "data-scrollbars": w || void 0,
        "data-vertical-scrollbar-position": S || void 0,
        "data-horizontal-hidden": v === "present" && !F ? "true" : void 0,
        "data-vertical-hidden": v === "present" && !z ? "true" : void 0,
        onScroll: (ie) => {
          p?.onScroll?.(ie), h?.({
            x: ie.currentTarget.scrollLeft,
            y: ie.currentTarget.scrollTop
          });
          const { scrollTop: te, scrollHeight: me, clientHeight: q, scrollLeft: K, scrollWidth: ce, clientWidth: be } = ie.currentTarget, pe = te - (me - q) >= -0.8, Se = te === 0;
          pe && !L.current && x?.(), Se && !M.current && E?.(), L.current = pe, M.current = Se;
          const ne = K - (ce - be) >= -0.8, H = K === 0;
          ne && !A.current && k?.(), H && !I.current && j?.(), A.current = ne, I.current = H;
        },
        children: g
      }),
      (w === "xy" || w === "x") && /* @__PURE__ */ l.jsx(sa, {
        ...B("scrollbar"),
        orientation: "horizontal",
        "data-vertical-scrollbar-position": S || void 0,
        "data-hidden": u === "never" || v === "present" && !F ? !0 : void 0,
        forceMount: !0,
        onMouseEnter: () => O(!0),
        onMouseLeave: () => O(!1),
        children: /* @__PURE__ */ l.jsx(aa, { ...B("thumb") })
      }),
      (w === "xy" || w === "y") && /* @__PURE__ */ l.jsx(sa, {
        ...B("scrollbar"),
        orientation: "vertical",
        "data-vertical-scrollbar-position": S || void 0,
        "data-hidden": u === "never" || v === "present" && !z ? !0 : void 0,
        forceMount: !0,
        onMouseEnter: () => O(!0),
        onMouseLeave: () => O(!1),
        children: /* @__PURE__ */ l.jsx(aa, { ...B("thumb") })
      }),
      /* @__PURE__ */ l.jsx(im, {
        ...B("corner"),
        "data-vertical-scrollbar-position": S || void 0,
        "data-hovered": D || void 0,
        "data-hidden": u === "never" || void 0
      })
    ]
  });
});
Cn.displayName = "@mantine/core/ScrollArea";
const Ka = se((e) => {
  const { children: t, classNames: n, styles: o, scrollbarSize: r, scrollHideDelay: s, type: a, dir: i, offsetScrollbars: c, overscrollBehavior: u, viewportRef: d, onScrollPositionChange: p, unstyled: m, variant: h, viewportProps: g, scrollbars: v, style: w, vars: x, onBottomReached: E, onTopReached: j, startScrollPosition: k, verticalScrollbarPosition: R, onOverflowChange: P, ...S } = Z("ScrollAreaAutosize", wu, e), y = f.useRef(null), [N, D] = f.useState(null), O = f.useCallback((M) => {
    D((L) => L === M ? L : M);
  }, []), z = bu([
    d,
    y,
    O
  ]), _ = f.useRef(!1), F = f.useRef(!1), $ = f.useEffectEvent(() => {
    const M = y.current;
    if (!M || !P) return;
    const L = M.scrollHeight > M.clientHeight;
    L !== _.current && (F.current ? P(L) : (F.current = !0, L && P(!0)), _.current = L);
  });
  return yn(P ? N : null, $), /* @__PURE__ */ l.jsx(Q, {
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
      children: /* @__PURE__ */ l.jsx(Cn, {
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
        vars: x,
        scrollbars: v,
        onBottomReached: E,
        onTopReached: j,
        startScrollPosition: k,
        verticalScrollbarPosition: R,
        "data-autosize": "true",
        children: t
      })
    })
  });
});
Cn.classes = _a;
Cn.varsResolver = xu;
Ka.displayName = "@mantine/core/ScrollAreaAutosize";
Ka.classes = _a;
Cn.Autosize = Ka;
var Su = { root: "m_515a97f8" };
const Xa = se((e) => {
  const t = Z("VisuallyHidden", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, attributes: c, ...u } = t, d = Ie({
    name: "VisuallyHidden",
    classes: Su,
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
    ...d("root"),
    ...u
  });
});
Xa.classes = Su;
Xa.displayName = "@mantine/core/VisuallyHidden";
function Sc(e, t, n, o) {
  return e === "center" || o === "center" ? { top: t } : e === "end" ? { bottom: n } : e === "start" ? { top: n } : {};
}
function Cc(e, t, n, o, r) {
  return e === "center" || o === "center" ? { left: t } : e === "end" ? { [r === "ltr" ? "right" : "left"]: n } : e === "start" ? { [r === "ltr" ? "left" : "right"]: n } : {};
}
const _h = {
  bottom: "borderTopLeftRadius",
  left: "borderTopRightRadius",
  right: "borderBottomLeftRadius",
  top: "borderBottomRightRadius"
};
function Fh({ position: e, arrowSize: t, dir: n }) {
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
function Bh({ position: e, arrowSize: t, arrowOffset: n, arrowRadius: o, arrowPosition: r, arrowX: s, arrowY: a, dir: i }) {
  if (r === "merge") {
    const m = Fh({
      position: e,
      arrowSize: t,
      dir: i
    });
    if (m) return m;
  }
  const [c, u = "center"] = e.split("-"), d = {
    width: t,
    height: t,
    transform: "rotate(45deg)",
    position: "absolute",
    [_h[c]]: o
  }, p = -t / 2;
  return c === "left" ? {
    ...d,
    ...Sc(u, a, n, r),
    right: p,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    clipPath: "polygon(100% 0, 0 0, 100% 100%)"
  } : c === "right" ? {
    ...d,
    ...Sc(u, a, n, r),
    left: p,
    borderRightColor: "transparent",
    borderTopColor: "transparent",
    clipPath: "polygon(0 100%, 0 0, 100% 100%)"
  } : c === "top" ? {
    ...d,
    ...Cc(u, s, n, r, i),
    bottom: p,
    borderTopColor: "transparent",
    borderLeftColor: "transparent",
    clipPath: "polygon(0 100%, 100% 100%, 100% 0)"
  } : c === "bottom" ? {
    ...d,
    ...Cc(u, s, n, r, i),
    top: p,
    borderBottomColor: "transparent",
    borderRightColor: "transparent",
    clipPath: "polygon(0 100%, 0 0, 100% 0)"
  } : {};
}
function Vh({ position: e, dir: t }) {
  const [n, o] = e.split("-");
  if (!o) return;
  const r = o === "start" && t === "ltr" || o === "end" && t === "rtl";
  if (n === "bottom") return r ? { borderTopLeftRadius: 0 } : { borderTopRightRadius: 0 };
  if (n === "top") return r ? { borderBottomLeftRadius: 0 } : { borderBottomRightRadius: 0 };
  if (n === "left") return o === "start" ? { borderTopRightRadius: 0 } : { borderBottomRightRadius: 0 };
  if (n === "right") return o === "start" ? { borderTopLeftRadius: 0 } : { borderBottomLeftRadius: 0 };
}
function Cu({ position: e, arrowSize: t, arrowOffset: n, arrowRadius: o, arrowPosition: r, visible: s, arrowX: a, arrowY: i, style: c, ...u }) {
  const { dir: d } = yo();
  return s ? /* @__PURE__ */ l.jsx("div", {
    role: "presentation",
    ...u,
    style: {
      ...c,
      ...Bh({
        position: e,
        arrowSize: t,
        arrowOffset: n,
        arrowRadius: o,
        arrowPosition: r,
        dir: d,
        arrowX: a,
        arrowY: i
      })
    }
  }) : null;
}
Cu.displayName = "@mantine/core/FloatingArrow";
function Hh(e, t) {
  if (e === "rtl" && (t.includes("right") || t.includes("left"))) {
    const [n, o] = t.split("-"), r = n === "right" ? "left" : "right";
    return o === void 0 ? r : `${r}-${o}`;
  }
  return t;
}
const [Uh, Ya] = Kt("Popover component was not found in the tree");
function Wh({ childProps: e, disabled: t, opened: n, longPressDelay: o = 500, setReference: r, open: s }) {
  const a = f.useRef(!1), i = f.useRef(!1), c = f.useRef(null), u = f.useRef(t);
  u.current = t;
  const d = (g, v, w) => {
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
      contextElement: w
    }), s();
  }, p = Hn(e.onMouseDown, (g) => {
    t || g.button === 2 && g.stopPropagation();
  }), m = Hn(e.onContextMenu, (g) => {
    t || g.defaultPrevented || (g.preventDefault(), !i.current && (d(g.clientX, g.clientY, g.currentTarget), a.current && (i.current = !0)));
  }), h = Gp((g) => {
    if (u.current || i.current) return;
    const v = g, w = v.touches[0] ?? v.changedTouches[0];
    w && (d(w.clientX, w.clientY, c.current), i.current = !0);
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
    onTouchStart: Hn(e.onTouchStart, h.onTouchStart),
    onTouchEnd: Hn(e.onTouchEnd, h.onTouchEnd),
    onTouchCancel: Hn(e.onTouchCancel, h.onTouchCancel),
    onTouchMove: Hn(e.onTouchMove, h.onTouchMove),
    style: t ? e.style : {
      ...e.style,
      WebkitTouchCallout: "none",
      WebkitUserSelect: "none",
      userSelect: "none"
    },
    "data-expanded": n ? !0 : void 0
  };
}
function ju(e) {
  const { children: t, disabled: n, longPressDelay: o } = Z("PopoverContextMenu", null, e), r = Qo(t);
  if (!r) throw new Error("Popover.ContextMenu component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  const s = Ya(), a = Wh({
    childProps: r.props,
    disabled: n || s.disabled,
    opened: s.opened,
    longPressDelay: o,
    setReference: s.reference,
    open: () => {
      s.opened || s.onToggle();
    }
  });
  return f.cloneElement(r, a);
}
ju.displayName = "@mantine/core/PopoverContextMenu";
function as({ children: e, active: t = !0, refProp: n = "ref", innerRef: o }) {
  const r = $p(t), s = Fe(r, o), a = Qo(e);
  return a ? f.cloneElement(a, { [n]: s }) : e;
}
function ku(e) {
  return /* @__PURE__ */ l.jsx(Xa, {
    tabIndex: -1,
    "data-autofocus": !0,
    ...e
  });
}
as.displayName = "@mantine/core/FocusTrap";
ku.displayName = "@mantine/core/FocusTrapInitialFocus";
as.InitialFocus = ku;
var Eu = {
  dropdown: "m_38a85659",
  arrow: "m_a31dc6c1",
  overlay: "m_3d7bc908"
};
const Ga = se((e) => {
  const t = Z("PopoverDropdown", null, e), { className: n, style: o, vars: r, children: s, onKeyDownCapture: a, variant: i, classNames: c, styles: u, ref: d, ...p } = t, m = Ya(), { dir: h } = yo(), g = m.arrowPosition === "merge" && m.withArrow ? Vh({
    position: m.placement,
    dir: h
  }) : void 0, v = Bl({
    opened: m.opened,
    shouldReturnFocus: m.returnFocus
  }), w = m.withRoles ? {
    "aria-labelledby": m.getTargetId(),
    id: m.getDropdownId(),
    role: "dialog",
    tabIndex: -1
  } : {}, x = Fe(d, m.floating);
  return m.disabled ? null : /* @__PURE__ */ l.jsx(Ma, {
    ...m.portalProps,
    withinPortal: m.withinPortal,
    children: /* @__PURE__ */ l.jsx(Gr, {
      mounted: m.opened,
      ...m.transitionProps,
      transition: m.transitionProps?.transition || "fade",
      duration: m.transitionProps?.duration ?? 150,
      keepMounted: m.keepMounted,
      keepMountedMode: m.keepMountedMode,
      exitDuration: typeof m.transitionProps?.exitDuration == "number" ? m.transitionProps.exitDuration : m.transitionProps?.duration,
      children: (E) => /* @__PURE__ */ l.jsx(as, {
        active: m.trapFocus && m.opened,
        innerRef: x,
        children: /* @__PURE__ */ l.jsxs(Q, {
          ...w,
          ...p,
          variant: i,
          onKeyDownCapture: Rp(() => {
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
                ...E,
                ...g,
                zIndex: m.zIndex,
                top: m.y ?? 0,
                left: m.x ?? 0,
                width: m.width === "target" ? void 0 : Te(m.width),
                ...m.referenceHidden ? { display: "none" } : null
              },
              m.resolvedStyles?.dropdown,
              u?.dropdown,
              o
            ]
          }),
          children: [s, /* @__PURE__ */ l.jsx(Cu, {
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
Ga.classes = Eu;
Ga.displayName = "@mantine/core/PopoverDropdown";
const qh = {
  refProp: "ref",
  popupType: "dialog"
}, Ru = se((e) => {
  const { children: t, refProp: n, popupType: o, ref: r, ...s } = Z("PopoverTarget", qh, e), a = Qo(t);
  if (!a) throw new Error("Popover.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  const i = s, c = Ya(), u = Fe(c.reference, Yl(a), r), d = c.withRoles ? {
    "aria-haspopup": o,
    "aria-expanded": c.opened,
    "aria-controls": c.opened ? c.getDropdownId() : void 0,
    id: c.getTargetId()
  } : {}, p = a.props;
  return f.cloneElement(a, {
    ...i,
    ...d,
    ...c.targetProps,
    className: en(c.targetProps.className, i.className, p.className),
    [n]: u,
    ...c.controlled ? null : { onClick: (m) => {
      c.onToggle(), p.onClick?.(m);
    } }
  });
});
Ru.displayName = "@mantine/core/PopoverTarget";
function Kh(e) {
  if (e === void 0) return {
    shift: !0,
    flip: !0
  };
  const t = { ...e };
  return e.shift === void 0 && (t.shift = !0), e.flip === void 0 && (t.flip = !0), t;
}
function Xh(e, t, n, o) {
  const r = Kh(e.middlewares), s = [wh(e.offset), kh()];
  if (r.flip && !n) {
    const a = typeof r.flip == "boolean" ? {} : r.flip, i = o ? {
      fallbackStrategy: "initialPlacement",
      ...a
    } : a;
    s.push(Ch(i));
  }
  if (r.shift) {
    const a = typeof r.shift == "boolean" ? {} : r.shift;
    s.push(xh((i) => {
      const c = i.placement.startsWith("top") || i.placement.startsWith("bottom");
      return {
        limiter: Sh(),
        padding: 5,
        ...e.width === "target" && c ? { mainAxis: !1 } : null,
        ...a
      };
    }));
  }
  return r.inline && s.push(typeof r.inline == "boolean" ? bc() : bc(r.inline)), s.push(Eh({
    element: e.arrowRef,
    padding: e.arrowOffset
  })), (r.size || e.width === "target") && s.push(jh({
    ...typeof r.size == "boolean" ? {} : r.size,
    apply({ rects: a, availableWidth: i, availableHeight: c, ...u }) {
      const d = t().refs.floating.current?.style ?? {};
      r.size && (typeof r.size == "object" && r.size.apply ? r.size.apply({
        rects: a,
        availableWidth: i,
        availableHeight: c,
        ...u
      }) : Object.assign(d, {
        maxWidth: `${i}px`,
        maxHeight: `${c}px`
      })), e.width === "target" && Object.assign(d, { width: `${a.reference.width}px` });
    }
  })), s;
}
function Yh(e) {
  const [t, n] = Ye({
    value: e.opened,
    defaultValue: e.defaultOpened,
    finalValue: !1,
    onChange: e.onChange
  }), o = f.useRef(t), r = f.useRef(!1), [s, a] = f.useState(null), i = e.preventPositionChangeWhenVisible !== !1, c = f.useRef(t);
  t !== c.current && (c.current = t, t && s !== null && a(null));
  const u = f.useRef(e.position);
  e.position !== u.current && (u.current = e.position, r.current = !1, s !== null && a(null));
  const d = f.useCallback(() => a(null), []), p = () => {
    t && !e.disabled && n(!1);
  }, m = () => {
    e.disabled || n(!t);
  }, h = zh({
    open: t,
    strategy: e.strategy,
    placement: i ? s ?? e.position : e.position,
    middleware: Xh(e, () => h, i && s !== null, i),
    whileElementsMounted: e.keepMounted ? void 0 : gc
  });
  f.useEffect(() => {
    if (!e.keepMounted) return;
    const v = h.refs.reference.current, w = h.refs.floating.current;
    if (t && v && w) return gc(v, w, h.update);
  }, [
    e.keepMounted,
    t,
    h.update,
    h.elements.reference,
    h.elements.floating
  ]), Oo(() => {
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
  const g = f.useRef(h.placement);
  return Oo(() => {
    g.current !== h.placement && (g.current = h.placement, e.onPositionChange?.(h.placement));
  }, [h.placement]), vn(() => {
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
    resetLockedPlacement: d
  };
}
const Gh = {
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
  zIndex: vo("popover"),
  __staticSelector: "Popover",
  width: "max-content"
}, Nu = Oe((e, { radius: t, shadow: n }) => ({ dropdown: {
  "--popover-radius": t === void 0 ? void 0 : Rt(t),
  "--popover-shadow": Pl(n)
} }));
function Be(e) {
  const t = Z("Popover", Gh, e), { children: n, position: o, offset: r, onPositionChange: s, opened: a, transitionProps: i, onExitTransitionEnd: c, onEnterTransitionEnd: u, width: d, middlewares: p, withArrow: m, arrowSize: h, arrowOffset: g, arrowRadius: v, arrowPosition: w, unstyled: x, classNames: E, styles: j, closeOnClickOutside: k, withinPortal: R, portalProps: P, closeOnEscape: S, clickOutsideEvents: y, trapFocus: N, onClose: D, onDismiss: O, onOpen: z, onChange: _, zIndex: F, radius: $, shadow: M, id: L, defaultOpened: I, __staticSelector: A, withRoles: B, disabled: U, returnFocus: W, variant: Y, keepMounted: ae, keepMountedMode: fe, vars: ie, floatingStrategy: te, withOverlay: me, overlayProps: q, hideDetached: K, attributes: ce, preventPositionChangeWhenVisible: be, ...pe } = t, Se = Ie({
    name: A,
    props: t,
    classes: Eu,
    classNames: E,
    styles: j,
    unstyled: x,
    attributes: ce,
    rootSelector: "dropdown",
    vars: ie,
    varsResolver: Nu
  }), { resolvedStyles: ne } = Zo({
    classNames: E,
    styles: j,
    props: t
  }), H = f.useRef(null), [V, X] = f.useState(null), [le, Ce] = f.useState(null), { dir: Ae } = yo(), he = Ta(), ge = _t(L), we = Yh({
    middlewares: p,
    width: d,
    position: Hh(Ae, o),
    offset: typeof r == "number" ? r + (m ? h / 2 : 0) : r,
    arrowRef: H,
    arrowOffset: g,
    onPositionChange: s,
    opened: a,
    defaultOpened: I,
    onChange: _,
    onOpen: z,
    onClose: D,
    onDismiss: O,
    strategy: te,
    disabled: U,
    preventPositionChangeWhenVisible: be,
    keepMounted: ae
  });
  Fl(() => {
    k && (we.onClose(), O?.());
  }, y, [V, le]);
  const Me = f.useCallback((vt) => {
    X(vt), we.floating.refs.setReference(vt);
  }, [we.floating.refs.setReference]), de = f.useCallback((vt) => {
    Ce(vt), we.floating.refs.setFloating(vt);
  }, [we.floating.refs.setFloating]), gt = f.useCallback(() => {
    i?.onExited?.(), c?.(), we.resetLockedPlacement();
  }, [
    i?.onExited,
    c,
    we.resetLockedPlacement
  ]), Ne = f.useCallback(() => {
    i?.onEntered?.(), u?.();
  }, [i?.onEntered, u]);
  return /* @__PURE__ */ l.jsxs(Uh, {
    value: {
      returnFocus: W,
      disabled: U,
      controlled: we.controlled,
      reference: Me,
      floating: de,
      x: we.floating.x,
      y: we.floating.y,
      arrowX: we.floating?.middlewareData?.arrow?.x,
      arrowY: we.floating?.middlewareData?.arrow?.y,
      opened: we.opened,
      arrowRef: H,
      transitionProps: {
        ...i,
        onExited: gt,
        onEntered: Ne
      },
      width: d,
      withArrow: m,
      arrowSize: h,
      arrowOffset: g,
      arrowRadius: v,
      arrowPosition: w,
      placement: we.floating.placement,
      trapFocus: N,
      withinPortal: R,
      portalProps: P,
      zIndex: F,
      radius: $,
      shadow: M,
      closeOnEscape: S,
      onDismiss: O,
      onClose: we.onClose,
      onToggle: we.onToggle,
      getTargetId: () => ge,
      getDropdownId: () => `${ge}-dropdown`,
      withRoles: B,
      targetProps: pe,
      __staticSelector: A,
      classNames: E,
      styles: j,
      unstyled: x,
      variant: Y,
      keepMounted: ae,
      keepMountedMode: fe,
      getStyles: Se,
      resolvedStyles: ne,
      floatingStrategy: te,
      referenceHidden: K && he !== "test" ? we.floating.middlewareData.hide?.referenceHidden : !1
    },
    children: [n, me && /* @__PURE__ */ l.jsx(Gr, {
      transition: "fade",
      mounted: we.opened,
      duration: i?.duration || 250,
      exitDuration: i?.exitDuration || 250,
      children: (vt) => /* @__PURE__ */ l.jsx(Ma, {
        withinPortal: R,
        children: /* @__PURE__ */ l.jsx(Dl, {
          ...q,
          ...Se("overlay", {
            className: q?.className,
            style: [vt, q?.style]
          })
        })
      })
    })]
  });
}
Be.Target = Ru;
Be.Dropdown = Ga;
Be.ContextMenu = ju;
Be.varsResolver = Nu;
Be.displayName = "@mantine/core/Popover";
Be.extend = (e) => e;
Be.withProps = (e) => {
  const t = (n) => /* @__PURE__ */ l.jsx(Be, {
    ...e,
    ...n
  });
  return t.extend = Be.extend, t.displayName = `WithProps(${Be.displayName})`, t;
};
const [Jh, on] = Kt("ModalBase component was not found in tree");
function Zh({ opened: e, transitionDuration: t }) {
  const [n, o] = f.useState(e), r = f.useRef(-1), s = Aa() ? 0 : t;
  return f.useEffect(() => (e ? (o(!0), window.clearTimeout(r.current)) : s === 0 ? o(!1) : r.current = window.setTimeout(() => o(!1), s), () => window.clearTimeout(r.current)), [e, s]), n;
}
function Qh({ id: e, transitionProps: t, opened: n, trapFocus: o, closeOnEscape: r, onClose: s, returnFocus: a, handledEscapeEvents: i }) {
  const c = _t(e), [u, d] = f.useState(!1), [p, m] = f.useState(!1), h = typeof t?.duration == "number" ? t?.duration : 200, g = Zh({
    opened: n,
    transitionDuration: h
  });
  return _p("keydown", (v) => {
    v.key === "Escape" && r && !v.isComposing && n && !i?.has(v) && v.target?.getAttribute("data-mantine-stop-propagation") !== "true" && (i?.add(v), s());
  }, { capture: !0 }), Bl({
    opened: n,
    shouldReturnFocus: o && a
  }), {
    _id: c,
    titleMounted: u,
    bodyMounted: p,
    shouldLockScroll: g,
    setTitleMounted: d,
    setBodyMounted: m
  };
}
var Vt = function() {
  return Vt = Object.assign || function(t) {
    for (var n, o = 1, r = arguments.length; o < r; o++) {
      n = arguments[o];
      for (var s in n) Object.prototype.hasOwnProperty.call(n, s) && (t[s] = n[s]);
    }
    return t;
  }, Vt.apply(this, arguments);
};
function Pu(e, t) {
  var n = {};
  for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var r = 0, o = Object.getOwnPropertySymbols(e); r < o.length; r++)
      t.indexOf(o[r]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[r]) && (n[o[r]] = e[o[r]]);
  return n;
}
function eg(e, t, n) {
  if (n || arguments.length === 2) for (var o = 0, r = t.length, s; o < r; o++)
    (s || !(o in t)) && (s || (s = Array.prototype.slice.call(t, 0, o)), s[o] = t[o]);
  return e.concat(s || Array.prototype.slice.call(t));
}
var Rr = "right-scroll-bar-position", Nr = "width-before-scroll-bar", tg = "with-scroll-bars-hidden", ng = "--removed-body-scroll-bar-size";
function zs(e, t) {
  return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
function og(e, t) {
  var n = f.useState(function() {
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
var rg = typeof window < "u" ? f.useLayoutEffect : f.useEffect, jc = /* @__PURE__ */ new WeakMap();
function sg(e, t) {
  var n = og(null, function(o) {
    return e.forEach(function(r) {
      return zs(r, o);
    });
  });
  return rg(function() {
    var o = jc.get(n);
    if (o) {
      var r = new Set(o), s = new Set(e), a = n.current;
      r.forEach(function(i) {
        s.has(i) || zs(i, null);
      }), s.forEach(function(i) {
        r.has(i) || zs(i, a);
      });
    }
    jc.set(n, e);
  }, [e]), n;
}
function ag(e) {
  return e;
}
function ig(e, t) {
  t === void 0 && (t = ag);
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
        var d = a;
        a = [], d.forEach(s);
      }, u = function() {
        return Promise.resolve().then(c);
      };
      u(), n = {
        push: function(d) {
          a.push(d), u();
        },
        filter: function(d) {
          return a = a.filter(d), n;
        }
      };
    }
  };
  return r;
}
function cg(e) {
  e === void 0 && (e = {});
  var t = ig(null);
  return t.options = Vt({ async: !0, ssr: !1 }, e), t;
}
var Tu = function(e) {
  var t = e.sideCar, n = Pu(e, ["sideCar"]);
  if (!t)
    throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  var o = t.read();
  if (!o)
    throw new Error("Sidecar medium not found");
  return f.createElement(o, Vt({}, n));
};
Tu.isSideCarExport = !0;
function lg(e, t) {
  return e.useMedium(t), Tu;
}
var Au = cg(), _s = function() {
}, is = f.forwardRef(function(e, t) {
  var n = f.useRef(null), o = f.useState({
    onScrollCapture: _s,
    onWheelCapture: _s,
    onTouchMoveCapture: _s
  }), r = o[0], s = o[1], a = e.forwardProps, i = e.children, c = e.className, u = e.removeScrollBar, d = e.enabled, p = e.shards, m = e.sideCar, h = e.noRelative, g = e.noIsolation, v = e.inert, w = e.allowPinchZoom, x = e.as, E = x === void 0 ? "div" : x, j = e.gapMode, k = Pu(e, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]), R = m, P = sg([n, t]), S = Vt(Vt({}, k), r);
  return f.createElement(
    f.Fragment,
    null,
    d && f.createElement(R, { sideCar: Au, removeScrollBar: u, shards: p, noRelative: h, noIsolation: g, inert: v, setCallbacks: s, allowPinchZoom: !!w, lockRef: n, gapMode: j }),
    a ? f.cloneElement(f.Children.only(i), Vt(Vt({}, S), { ref: P })) : f.createElement(E, Vt({}, S, { className: c, ref: P }), i)
  );
});
is.defaultProps = {
  enabled: !0,
  removeScrollBar: !0,
  inert: !1
};
is.classNames = {
  fullWidth: Nr,
  zeroRight: Rr
};
var ug = function() {
  if (typeof __webpack_nonce__ < "u")
    return __webpack_nonce__;
};
function dg() {
  if (!document)
    return null;
  var e = document.createElement("style");
  e.type = "text/css";
  var t = ug();
  return t && e.setAttribute("nonce", t), e;
}
function fg(e, t) {
  e.styleSheet ? e.styleSheet.cssText = t : e.appendChild(document.createTextNode(t));
}
function pg(e) {
  var t = document.head || document.getElementsByTagName("head")[0];
  t.appendChild(e);
}
var mg = function() {
  var e = 0, t = null;
  return {
    add: function(n) {
      e == 0 && (t = dg()) && (fg(t, n), pg(t)), e++;
    },
    remove: function() {
      e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), t = null);
    }
  };
}, hg = function() {
  var e = mg();
  return function(t, n) {
    f.useEffect(function() {
      return e.add(t), function() {
        e.remove();
      };
    }, [t && n]);
  };
}, Iu = function() {
  var e = hg(), t = function(n) {
    var o = n.styles, r = n.dynamic;
    return e(o, r), null;
  };
  return t;
}, gg = {
  left: 0,
  top: 0,
  right: 0,
  gap: 0
}, Fs = function(e) {
  return parseInt(e || "", 10) || 0;
}, vg = function(e) {
  var t = window.getComputedStyle(document.body), n = t[e === "padding" ? "paddingLeft" : "marginLeft"], o = t[e === "padding" ? "paddingTop" : "marginTop"], r = t[e === "padding" ? "paddingRight" : "marginRight"];
  return [Fs(n), Fs(o), Fs(r)];
}, yg = function(e) {
  if (e === void 0 && (e = "margin"), typeof window > "u")
    return gg;
  var t = vg(e), n = document.documentElement.clientWidth, o = window.innerWidth;
  return {
    left: t[0],
    top: t[1],
    right: t[2],
    gap: Math.max(0, o - n + t[2] - t[0])
  };
}, bg = Iu(), eo = "data-scroll-locked", wg = function(e, t, n, o) {
  var r = e.left, s = e.top, a = e.right, i = e.gap;
  return n === void 0 && (n = "margin"), `
  .`.concat(tg, ` {
   overflow: hidden `).concat(o, `;
   padding-right: `).concat(i, "px ").concat(o, `;
  }
  body[`).concat(eo, `] {
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
  
  .`).concat(Rr, ` {
    right: `).concat(i, "px ").concat(o, `;
  }
  
  .`).concat(Nr, ` {
    margin-right: `).concat(i, "px ").concat(o, `;
  }
  
  .`).concat(Rr, " .").concat(Rr, ` {
    right: 0 `).concat(o, `;
  }
  
  .`).concat(Nr, " .").concat(Nr, ` {
    margin-right: 0 `).concat(o, `;
  }
  
  body[`).concat(eo, `] {
    `).concat(ng, ": ").concat(i, `px;
  }
`);
}, kc = function() {
  var e = parseInt(document.body.getAttribute(eo) || "0", 10);
  return isFinite(e) ? e : 0;
}, xg = function() {
  f.useEffect(function() {
    return document.body.setAttribute(eo, (kc() + 1).toString()), function() {
      var e = kc() - 1;
      e <= 0 ? document.body.removeAttribute(eo) : document.body.setAttribute(eo, e.toString());
    };
  }, []);
}, Sg = function(e) {
  var t = e.noRelative, n = e.noImportant, o = e.gapMode, r = o === void 0 ? "margin" : o;
  xg();
  var s = f.useMemo(function() {
    return yg(r);
  }, [r]);
  return f.createElement(bg, { styles: wg(s, !t, r, n ? "" : "!important") });
}, ua = !1;
if (typeof window < "u")
  try {
    var wr = Object.defineProperty({}, "passive", {
      get: function() {
        return ua = !0, !0;
      }
    });
    window.addEventListener("test", wr, wr), window.removeEventListener("test", wr, wr);
  } catch {
    ua = !1;
  }
var Un = ua ? { passive: !1 } : !1, Cg = function(e) {
  return e.tagName === "TEXTAREA";
}, Mu = function(e, t) {
  if (!(e instanceof Element))
    return !1;
  var n = window.getComputedStyle(e);
  return (
    // not-not-scrollable
    n[t] !== "hidden" && // contains scroll inside self
    !(n.overflowY === n.overflowX && !Cg(e) && n[t] === "visible")
  );
}, jg = function(e) {
  return Mu(e, "overflowY");
}, kg = function(e) {
  return Mu(e, "overflowX");
}, Ec = function(e, t) {
  var n = t.ownerDocument, o = t;
  do {
    typeof ShadowRoot < "u" && o instanceof ShadowRoot && (o = o.host);
    var r = Du(e, o);
    if (r) {
      var s = Ou(e, o), a = s[1], i = s[2];
      if (a > i)
        return !0;
    }
    o = o.parentNode;
  } while (o && o !== n.body);
  return !1;
}, Eg = function(e) {
  var t = e.scrollTop, n = e.scrollHeight, o = e.clientHeight;
  return [
    t,
    n,
    o
  ];
}, Rg = function(e) {
  var t = e.scrollLeft, n = e.scrollWidth, o = e.clientWidth;
  return [
    t,
    n,
    o
  ];
}, Du = function(e, t) {
  return e === "v" ? jg(t) : kg(t);
}, Ou = function(e, t) {
  return e === "v" ? Eg(t) : Rg(t);
}, Ng = function(e, t) {
  return e === "h" && t === "rtl" ? -1 : 1;
}, Pg = function(e, t, n, o, r) {
  var s = Ng(e, window.getComputedStyle(t).direction), a = s * o, i = n.target, c = t.contains(i), u = !1, d = a > 0, p = 0, m = 0;
  do {
    if (!i)
      break;
    var h = Ou(e, i), g = h[0], v = h[1], w = h[2], x = v - w - s * g;
    (g || x) && Du(e, i) && (p += x, m += g);
    var E = i.parentNode;
    i = E && E.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? E.host : E;
  } while (
    // portaled content
    !c && i !== document.body || // self content
    c && (t.contains(i) || t === i)
  );
  return (d && Math.abs(p) < 1 || !d && Math.abs(m) < 1) && (u = !0), u;
}, xr = function(e) {
  return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, Rc = function(e) {
  return [e.deltaX, e.deltaY];
}, Nc = function(e) {
  return e && "current" in e ? e.current : e;
}, Tg = function(e, t) {
  return e[0] === t[0] && e[1] === t[1];
}, Ag = function(e) {
  return `
  .block-interactivity-`.concat(e, ` {pointer-events: none;}
  .allow-interactivity-`).concat(e, ` {pointer-events: all;}
`);
}, Ig = 0, Wn = [];
function Mg(e) {
  var t = f.useRef([]), n = f.useRef([0, 0]), o = f.useRef(), r = f.useState(Ig++)[0], s = f.useState(Iu)[0], a = f.useRef(e);
  f.useEffect(function() {
    a.current = e;
  }, [e]), f.useEffect(function() {
    if (e.inert) {
      document.body.classList.add("block-interactivity-".concat(r));
      var v = eg([e.lockRef.current], (e.shards || []).map(Nc), !0).filter(Boolean);
      return v.forEach(function(w) {
        return w.classList.add("allow-interactivity-".concat(r));
      }), function() {
        document.body.classList.remove("block-interactivity-".concat(r)), v.forEach(function(w) {
          return w.classList.remove("allow-interactivity-".concat(r));
        });
      };
    }
  }, [e.inert, e.lockRef.current, e.shards]);
  var i = f.useCallback(function(v, w) {
    if ("touches" in v && v.touches.length === 2 || v.type === "wheel" && v.ctrlKey)
      return !a.current.allowPinchZoom;
    var x = xr(v), E = n.current, j = "deltaX" in v ? v.deltaX : E[0] - x[0], k = "deltaY" in v ? v.deltaY : E[1] - x[1], R, P = v.target, S = Math.abs(j) > Math.abs(k) ? "h" : "v";
    if ("touches" in v && S === "h" && P.type === "range")
      return !1;
    var y = window.getSelection(), N = y && y.anchorNode, D = N ? N === P || N.contains(P) : !1;
    if (D)
      return !1;
    var O = Ec(S, P);
    if (!O)
      return !0;
    if (O ? R = S : (R = S === "v" ? "h" : "v", O = Ec(S, P)), !O)
      return !1;
    if (!o.current && "changedTouches" in v && (j || k) && (o.current = R), !R)
      return !0;
    var z = o.current || R;
    return Pg(z, w, v, z === "h" ? j : k);
  }, []), c = f.useCallback(function(v) {
    var w = v;
    if (!(!Wn.length || Wn[Wn.length - 1] !== s)) {
      var x = "deltaY" in w ? Rc(w) : xr(w), E = t.current.filter(function(R) {
        return R.name === w.type && (R.target === w.target || w.target === R.shadowParent) && Tg(R.delta, x);
      })[0];
      if (E && E.should) {
        w.cancelable && w.preventDefault();
        return;
      }
      if (!E) {
        var j = (a.current.shards || []).map(Nc).filter(Boolean).filter(function(R) {
          return R.contains(w.target);
        }), k = j.length > 0 ? i(w, j[0]) : !a.current.noIsolation;
        k && w.cancelable && w.preventDefault();
      }
    }
  }, []), u = f.useCallback(function(v, w, x, E) {
    var j = { name: v, delta: w, target: x, should: E, shadowParent: Dg(x) };
    t.current.push(j), setTimeout(function() {
      t.current = t.current.filter(function(k) {
        return k !== j;
      });
    }, 1);
  }, []), d = f.useCallback(function(v) {
    n.current = xr(v), o.current = void 0;
  }, []), p = f.useCallback(function(v) {
    u(v.type, Rc(v), v.target, i(v, e.lockRef.current));
  }, []), m = f.useCallback(function(v) {
    u(v.type, xr(v), v.target, i(v, e.lockRef.current));
  }, []);
  f.useEffect(function() {
    return Wn.push(s), e.setCallbacks({
      onScrollCapture: p,
      onWheelCapture: p,
      onTouchMoveCapture: m
    }), document.addEventListener("wheel", c, Un), document.addEventListener("touchmove", c, Un), document.addEventListener("touchstart", d, Un), function() {
      Wn = Wn.filter(function(v) {
        return v !== s;
      }), document.removeEventListener("wheel", c, Un), document.removeEventListener("touchmove", c, Un), document.removeEventListener("touchstart", d, Un);
    };
  }, []);
  var h = e.removeScrollBar, g = e.inert;
  return f.createElement(
    f.Fragment,
    null,
    g ? f.createElement(s, { styles: Ag(r) }) : null,
    h ? f.createElement(Sg, { noRelative: e.noRelative, gapMode: e.gapMode }) : null
  );
}
function Dg(e) {
  for (var t = null; e !== null; )
    e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
  return t;
}
const Og = lg(Au, Mg);
var $u = f.forwardRef(function(e, t) {
  return f.createElement(is, Vt({}, e, { ref: t, sideCar: Og }));
});
$u.classNames = is.classNames;
function Lu({ keepMounted: e, keepMountedMode: t = "activity", opened: n, onClose: o, id: r, transitionProps: s, onExitTransitionEnd: a, onEnterTransitionEnd: i, trapFocus: c, closeOnEscape: u, returnFocus: d, closeOnClickOutside: p, withinPortal: m, portalProps: h, lockScroll: g, children: v, zIndex: w, shadow: x, padding: E, __vars: j, unstyled: k, removeScrollProps: R, __handledEscapeEvents: P, ...S }) {
  const { _id: y, titleMounted: N, bodyMounted: D, shouldLockScroll: O, setTitleMounted: z, setBodyMounted: _ } = Qh({
    id: r,
    transitionProps: s,
    opened: n,
    trapFocus: c,
    closeOnEscape: u,
    onClose: o,
    returnFocus: d,
    handledEscapeEvents: P
  }), { key: F, ...$ } = R || {};
  return /* @__PURE__ */ l.jsx(Ma, {
    ...h,
    withinPortal: m,
    children: /* @__PURE__ */ l.jsx(Jh, {
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
        titleMounted: N,
        bodyMounted: D,
        setTitleMounted: z,
        setBodyMounted: _,
        trapFocus: c,
        closeOnEscape: u,
        zIndex: w,
        unstyled: k
      },
      children: /* @__PURE__ */ l.jsx($u, {
        enabled: O && g,
        ...$,
        children: /* @__PURE__ */ l.jsx(Q, {
          ...S,
          id: y,
          __vars: {
            ...j,
            "--mb-z-index": (w || vo("modal")).toString(),
            "--mb-shadow": Pl(x),
            "--mb-padding": $o(E)
          },
          children: v
        })
      }, F)
    })
  });
}
Lu.displayName = "@mantine/core/ModalBase";
function $g() {
  const e = on();
  return f.useEffect(() => (e.setBodyMounted(!0), () => e.setBodyMounted(!1)), []), e.getBodyId();
}
var ao = {
  title: "m_615af6c9",
  header: "m_b5489c3c",
  inner: "m_60c222c7",
  content: "m_fd1ab0aa",
  close: "m_606cb269",
  body: "m_5df29311"
};
function zu({ className: e, ...t }) {
  const n = $g(), o = on();
  return /* @__PURE__ */ l.jsx(Q, {
    id: n,
    className: en({ [ao.body]: !o.unstyled }, e),
    ...t
  });
}
zu.displayName = "@mantine/core/ModalBaseBody";
function _u({ className: e, onClick: t, ...n }) {
  const o = on();
  return /* @__PURE__ */ l.jsx(zl, {
    ...n,
    onClick: (r) => {
      o.onClose(), t?.(r);
    },
    className: en({ [ao.close]: !o.unstyled }, e),
    unstyled: o.unstyled
  });
}
_u.displayName = "@mantine/core/ModalBaseCloseButton";
function Fu({ transitionProps: e, className: t, innerProps: n, onKeyDown: o, style: r, ref: s, ...a }) {
  const i = on();
  return /* @__PURE__ */ l.jsx(Gr, {
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
      className: en({ [ao.inner]: !i.unstyled }, n.className),
      children: /* @__PURE__ */ l.jsx(as, {
        active: i.opened && i.trapFocus,
        innerRef: s,
        children: /* @__PURE__ */ l.jsx(ro, {
          ...a,
          component: "section",
          role: "dialog",
          tabIndex: -1,
          "aria-modal": !0,
          "aria-describedby": i.bodyMounted ? i.getBodyId() : void 0,
          "aria-labelledby": i.titleMounted ? i.getTitleId() : void 0,
          style: [r, c],
          className: en({ [ao.content]: !i.unstyled }, t),
          unstyled: i.unstyled,
          children: a.children
        })
      })
    })
  });
}
Fu.displayName = "@mantine/core/ModalBaseContent";
function Bu({ className: e, ...t }) {
  const n = on();
  return /* @__PURE__ */ l.jsx(Q, {
    component: "header",
    className: en({ [ao.header]: !n.unstyled }, e),
    ...t
  });
}
Bu.displayName = "@mantine/core/ModalBaseHeader";
const Lg = {
  duration: 200,
  timingFunction: "ease",
  transition: "fade"
};
function zg(e) {
  const t = on();
  return {
    ...Lg,
    ...t.transitionProps,
    ...e
  };
}
function Vu({ onClick: e, transitionProps: t, style: n, visible: o, ...r }) {
  const s = on(), a = zg(t);
  return /* @__PURE__ */ l.jsx(Gr, {
    mounted: o !== void 0 ? o : s.opened,
    ...a,
    transition: "fade",
    children: (i) => /* @__PURE__ */ l.jsx(Dl, {
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
Vu.displayName = "@mantine/core/ModalBaseOverlay";
function _g() {
  const e = on();
  return f.useEffect(() => (e.setTitleMounted(!0), () => e.setTitleMounted(!1)), []), e.getTitleId();
}
function Hu({ className: e, ...t }) {
  const n = _g(), o = on();
  return /* @__PURE__ */ l.jsx(Q, {
    component: "h2",
    className: en({ [ao.title]: !o.unstyled }, e),
    id: n,
    ...t
  });
}
Hu.displayName = "@mantine/core/ModalBaseTitle";
function Fg({ children: e }) {
  return /* @__PURE__ */ l.jsx(l.Fragment, { children: e });
}
const Bg = {
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
var Uu = { root: "m_8bffd616" };
const to = Tl((e) => {
  const t = Z("Flex", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, gap: c, rowGap: u, columnGap: d, align: p, justify: m, wrap: h, direction: g, attributes: v, ...w } = t, x = Ie({
    name: "Flex",
    classes: Uu,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: v,
    vars: i
  }), E = Jo(), j = ap(), k = ip({
    styleProps: {
      gap: c,
      rowGap: u,
      columnGap: d,
      align: p,
      justify: m,
      wrap: h,
      direction: g
    },
    theme: E,
    data: Bg
  }), R = cp(), P = R && k.hasResponsiveStyles ? lp(k.styles, k.media) : j;
  return /* @__PURE__ */ l.jsxs(l.Fragment, { children: [k.hasResponsiveStyles && /* @__PURE__ */ l.jsx(up, {
    selector: `.${P}`,
    styles: k.styles,
    media: k.media,
    deduplicate: R
  }), /* @__PURE__ */ l.jsx(Q, {
    ...x("root", {
      className: P,
      style: dp(k.inlineStyles)
    }),
    ...w
  })] });
});
to.classes = Uu;
to.displayName = "@mantine/core/Flex";
function Vg(e, t) {
  if (!t || !e) return !1;
  let n = t.parentNode;
  for (; n != null; ) {
    if (n === e) return !0;
    n = n.parentNode;
  }
  return !1;
}
function Hg({ target: e, parent: t, ref: n, displayAfterTransitionEnd: o, onTransitionStart: r, onTransitionEnd: s }) {
  const a = f.useRef(-1), i = f.useRef(e), [c, u] = f.useState(!1), [d, p] = f.useState(typeof o == "boolean" ? o : !1), m = () => {
    if (!e || !t || !n.current) return;
    const w = e.getBoundingClientRect(), x = t.getBoundingClientRect(), E = t.offsetWidth === 0 ? 1 : x.width / t.offsetWidth, j = t.offsetHeight === 0 ? 1 : x.height / t.offsetHeight, k = window.getComputedStyle(e), R = window.getComputedStyle(t), P = dn(k.borderTopWidth) + dn(R.borderTopWidth), S = dn(k.borderLeftWidth) + dn(R.borderLeftWidth), y = {
      top: (w.top - x.top) / j - P,
      left: (w.left - x.left) / E - S,
      width: w.width / E,
      height: w.height / j
    };
    n.current.style.transform = `translateY(${y.top}px) translateX(${y.left}px)`, n.current.style.width = `${y.width}px`, n.current.style.height = `${y.height}px`;
  }, h = () => {
    window.clearTimeout(a.current), n.current && (n.current.style.transitionDuration = "0ms"), m(), a.current = window.setTimeout(() => {
      n.current && (n.current.style.transitionDuration = "");
    }, 30);
  }, g = f.useRef(null), v = f.useRef(null);
  return f.useEffect(() => {
    if (c && i.current !== e && r && r(), i.current = e, m(), e)
      return g.current = new ResizeObserver(h), g.current.observe(e), t && (v.current = new ResizeObserver(h), v.current.observe(t)), () => {
        g.current?.disconnect(), v.current?.disconnect();
      };
  }, [t, e]), f.useEffect(() => {
    if (t) {
      const w = (x) => {
        Vg(x.target, t) && (h(), p(!1));
      };
      return t.addEventListener("transitionend", w), () => {
        t.removeEventListener("transitionend", w);
      };
    }
  }, [t]), f.useEffect(() => {
    if (n.current && s) {
      const w = (x) => {
        x.propertyName === "transform" && s();
      };
      return n.current.addEventListener("transitionend", w), () => {
        n.current?.removeEventListener("transitionend", w);
      };
    }
  }, [s]), Vp(() => {
    Kl() !== "test" && u(!0);
  }, 20, { autoInvoke: !0 }), qp((w) => {
    w.forEach((x) => {
      x.type === "attributes" && x.attributeName === "dir" && h();
    });
  }, {
    attributes: !0,
    attributeFilter: ["dir"]
  }, () => document.documentElement), {
    initialized: c,
    hidden: d
  };
}
var Wu = { root: "m_96b553a6" };
const qu = Oe((e, { transitionDuration: t }, { shouldReduceMotion: n }) => ({ root: { "--transition-duration": e.respectReducedMotion && n ? "0ms" : typeof t == "number" ? `${t}ms` : t || "150ms" } })), cs = se((e) => {
  const t = Z("FloatingIndicator", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, target: c, parent: u, transitionDuration: d, mod: p, displayAfterTransitionEnd: m, onTransitionStart: h, onTransitionEnd: g, attributes: v, ref: w, ...x } = t, E = Aa(), j = Ie({
    name: "FloatingIndicator",
    classes: Wu,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: v,
    vars: i,
    varsResolver: qu,
    stylesCtx: { shouldReduceMotion: E }
  }), k = f.useRef(null), { initialized: R, hidden: P } = Hg({
    target: c,
    parent: u,
    ref: k,
    displayAfterTransitionEnd: m,
    onTransitionStart: h,
    onTransitionEnd: g
  }), S = Fe(w, k);
  return !c || !u ? null : /* @__PURE__ */ l.jsx(Q, {
    ref: S,
    mod: [{
      initialized: R,
      hidden: P
    }, p],
    ...j("root"),
    ...x
  });
});
cs.displayName = "@mantine/core/FloatingIndicator";
cs.classes = Wu;
cs.varsResolver = qu;
const [Ug, Ja] = Kt("Accordion component was not found in the tree");
function Za({ style: e, size: t = 16, ...n }) {
  return /* @__PURE__ */ l.jsx("svg", {
    viewBox: "0 0 15 15",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    style: {
      ...e,
      width: Te(t),
      height: Te(t),
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
Za.displayName = "@mantine/core/AccordionChevron";
const [Wg, Ku] = Kt("Accordion.Item component was not found in the tree");
var tr = {
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
const Qa = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, chevron: a, icon: i, onClick: c, onKeyDown: u, children: d, disabled: p, mod: m, ...h } = Z("AccordionControl", null, e), { value: g } = Ku(), v = Ja(), w = v.isItemActive(g), x = typeof v.order == "number", E = `h${v.order}`, j = /* @__PURE__ */ l.jsxs(so, {
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
        active: w,
        "chevron-position": v.chevronPosition,
        disabled: p
      },
      m
    ],
    onClick: (k) => {
      c?.(k), v.onChange(g);
    },
    type: "button",
    disabled: p,
    "aria-expanded": w,
    "aria-controls": v.getRegionId(g),
    id: v.getControlId(g),
    onKeyDown: _l({
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
          rotate: !v.disableChevronRotation && w,
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
        children: d
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
  return x ? /* @__PURE__ */ l.jsx(E, {
    ...v.getStyles("itemTitle", {
      classNames: t,
      styles: r
    }),
    children: j
  }) : j;
});
Qa.displayName = "@mantine/core/AccordionControl";
Qa.classes = tr;
const ei = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, value: a, mod: i, ...c } = Z("AccordionItem", null, e), u = Ja();
  return /* @__PURE__ */ l.jsx(Wg, {
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
ei.displayName = "@mantine/core/AccordionItem";
ei.classes = tr;
const ti = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, children: a, keepMounted: i, keepMountedMode: c, ...u } = Z("AccordionPanel", null, e), { value: d } = Ku(), p = Ja();
  return /* @__PURE__ */ l.jsx(Gl, {
    ...p.getStyles("panel", {
      className: n,
      classNames: t,
      style: o,
      styles: r
    }),
    expanded: p.isItemActive(d),
    transitionDuration: p.transitionDuration ?? 200,
    role: "region",
    id: p.getRegionId(d),
    "aria-labelledby": p.getControlId(d),
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
ti.displayName = "@mantine/core/AccordionPanel";
ti.classes = tr;
const qg = {
  multiple: !1,
  loop: !0,
  disableChevronRotation: !1,
  disableCollapse: !1,
  chevronPosition: "right",
  variant: "default",
  chevronSize: "auto",
  chevronIconSize: 16,
  keepMountedMode: "activity"
}, Xu = Oe((e, { transitionDuration: t, chevronSize: n, radius: o }) => ({ root: {
  "--accordion-transition-duration": t === void 0 ? void 0 : `${t}ms`,
  "--accordion-chevron-size": n === void 0 ? void 0 : Te(n),
  "--accordion-radius": o === void 0 ? void 0 : Rt(o)
} })), Pe = xn((e) => {
  const t = Z("Accordion", qg, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, children: c, multiple: u, value: d, defaultValue: p, onChange: m, id: h, loop: g, transitionDuration: v, disableChevronRotation: w, disableCollapse: x, chevronPosition: E, chevronSize: j, order: k, chevron: R, variant: P, radius: S, chevronIconSize: y, attributes: N, keepMounted: D, keepMountedMode: O, ...z } = t, _ = _t(h), [F, $] = Ye({
    value: d,
    defaultValue: p,
    finalValue: u ? [] : null,
    onChange: m
  }), M = (A) => Array.isArray(F) ? F.includes(A) : A === F, L = (A) => {
    if (!Array.isArray(F) && x && A === F) return;
    const B = Array.isArray(F) ? F.includes(A) ? F.filter((U) => U !== A) : [...F, A] : A === F ? null : A;
    $(B);
  }, I = Ie({
    name: "Accordion",
    classes: tr,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: N,
    vars: i,
    varsResolver: Xu
  });
  return /* @__PURE__ */ l.jsx(Ug, {
    value: {
      isItemActive: M,
      onChange: L,
      getControlId: Or(`${_}-control`, "Accordion.Item component was rendered with invalid value or without value"),
      getRegionId: Or(`${_}-panel`, "Accordion.Item component was rendered with invalid value or without value"),
      chevron: R === null ? null : R || /* @__PURE__ */ l.jsx(Za, { size: y }),
      transitionDuration: v,
      disableChevronRotation: w,
      chevronPosition: E,
      order: k,
      loop: g,
      getStyles: I,
      variant: P,
      unstyled: a,
      keepMounted: D,
      keepMountedMode: O
    },
    children: /* @__PURE__ */ l.jsx(Q, {
      ...I("root"),
      id: _,
      ...z,
      variant: P,
      "data-accordion": !0,
      children: c
    })
  });
});
Pe.classes = tr;
Pe.varsResolver = Xu;
Pe.displayName = "@mantine/core/Accordion";
Pe.Item = ei;
Pe.Panel = ti;
Pe.Control = Qa;
Pe.Chevron = Za;
function Yu(e) {
  return typeof e == "string" ? {
    value: e,
    label: e
  } : typeof e == "object" && "value" in e && !("label" in e) ? {
    value: e.value,
    label: `${e.value}`,
    disabled: e.disabled
  } : typeof e == "object" && "group" in e ? {
    group: e.group,
    items: e.items.map((t) => Yu(t))
  } : typeof e == "number" || typeof e == "bigint" || typeof e == "boolean" ? {
    value: e,
    label: `${e}`
  } : e;
}
function Gu(e) {
  return e ? e.map((t) => Yu(t)) : [];
}
function Ju(e) {
  return e.reduce((t, n) => "group" in n ? {
    ...t,
    ...Ju(n.items)
  } : (t[`${n.value}`] = n, t), {});
}
var ct = {
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
const Kg = { error: null }, Zu = Oe((e, { size: t, color: n }) => ({ chevron: {
  "--combobox-chevron-size": $e(t, "combobox-chevron-size"),
  "--combobox-chevron-color": n ? nt(n, e) : void 0
} })), nr = se((e) => {
  const t = Z("ComboboxChevron", Kg, e), { size: n, error: o, style: r, className: s, classNames: a, styles: i, unstyled: c, vars: u, attributes: d, mod: p, ...m } = t, h = Ie({
    name: "ComboboxChevron",
    classes: ct,
    props: t,
    style: r,
    className: s,
    classNames: a,
    styles: i,
    unstyled: c,
    vars: u,
    varsResolver: Zu,
    attributes: d,
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
nr.classes = ct;
nr.varsResolver = Zu;
nr.displayName = "@mantine/core/ComboboxChevron";
const [Xg, St] = Kt("Combobox component was not found in tree");
function Qu({ onMouseDown: e, onClick: t, onClear: n, ...o }) {
  return /* @__PURE__ */ l.jsx(kt.ClearButton, {
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
Qu.displayName = "@mantine/core/ComboboxClearButton";
const ni = se((e) => {
  const { classNames: t, styles: n, className: o, style: r, hidden: s, ...a } = Z("ComboboxDropdown", null, e), i = St();
  return /* @__PURE__ */ l.jsx(Be.Dropdown, {
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
ni.classes = ct;
ni.displayName = "@mantine/core/ComboboxDropdown";
const Yg = { refProp: "ref" }, ed = se((e) => {
  const { children: t, refProp: n, ref: o } = Z("ComboboxDropdownTarget", Yg, e);
  if (St(), !Ml(t)) throw new Error("Combobox.DropdownTarget component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  return /* @__PURE__ */ l.jsx(Be.Target, {
    ref: o,
    refProp: n,
    children: t
  });
});
ed.displayName = "@mantine/core/ComboboxDropdownTarget";
const oi = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ComboboxEmpty", null, e), i = St();
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
oi.classes = ct;
oi.displayName = "@mantine/core/ComboboxEmpty";
function ri({ onKeyDown: e, onClick: t, withKeyboardNavigation: n, withAriaAttributes: o, withExpandedAttribute: r, targetType: s, autoComplete: a }) {
  const i = St(), [c, u] = f.useState(null), d = (h) => {
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
    onKeyDown: d,
    onClick: (h) => {
      s === "button" && h.currentTarget.focus(), t?.(h);
    }
  };
}
const Gg = {
  refProp: "ref",
  targetType: "input",
  withKeyboardNavigation: !0,
  withAriaAttributes: !0,
  withExpandedAttribute: !1,
  autoComplete: "off"
}, td = se((e) => {
  const { children: t, refProp: n, withKeyboardNavigation: o, withAriaAttributes: r, withExpandedAttribute: s, targetType: a, autoComplete: i, ref: c, ...u } = Z("ComboboxEventsTarget", Gg, e), d = Qo(t);
  if (!d) throw new Error("Combobox.EventsTarget component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  const p = St(), m = ri({
    targetType: a,
    withAriaAttributes: r,
    withKeyboardNavigation: o,
    withExpandedAttribute: s,
    onKeyDown: d.props.onKeyDown,
    onClick: d.props.onClick,
    autoComplete: i
  });
  return f.cloneElement(d, {
    ...m,
    ...u,
    [n]: Fe(c, p.store.targetRef, Yl(d))
  });
});
td.displayName = "@mantine/core/ComboboxEventsTarget";
const si = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ComboboxFooter", null, e), i = St();
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
si.classes = ct;
si.displayName = "@mantine/core/ComboboxFooter";
const ai = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, children: a, label: i, id: c, ...u } = Z("ComboboxGroup", null, e), d = St(), p = _t(c), m = i != null && i !== !1 && i !== "";
  return /* @__PURE__ */ l.jsxs(Q, {
    role: "group",
    "aria-labelledby": m ? p : void 0,
    ...d.getStyles("group", {
      className: n,
      classNames: t,
      style: o,
      styles: r
    }),
    ...u,
    children: [m && /* @__PURE__ */ l.jsx("div", {
      id: p,
      ...d.getStyles("groupLabel", {
        classNames: t,
        styles: r
      }),
      children: i
    }), a]
  });
});
ai.classes = ct;
ai.displayName = "@mantine/core/ComboboxGroup";
const ii = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ComboboxHeader", null, e), i = St();
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
ii.classes = ct;
ii.displayName = "@mantine/core/ComboboxHeader";
function nd({ value: e, valuesDivider: t = ",", ...n }) {
  return /* @__PURE__ */ l.jsx("input", {
    type: "hidden",
    value: Array.isArray(e) ? e.join(t) : e ? `${e}` : "",
    ...n
  });
}
nd.displayName = "@mantine/core/ComboboxHiddenInput";
const ci = se((e) => {
  const t = Z("ComboboxOption", null, e), { classNames: n, className: o, style: r, styles: s, vars: a, onClick: i, id: c, active: u, onMouseDown: d, onMouseOver: p, disabled: m, selected: h, mod: g, ...v } = t, w = St(), x = f.useId(), E = c || x;
  return /* @__PURE__ */ l.jsx(Q, {
    ...w.getStyles("option", {
      className: o,
      classNames: n,
      styles: s,
      style: r
    }),
    ...v,
    id: E,
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
    onClick: (j) => {
      m ? j.preventDefault() : (w.onOptionSubmit?.(t.value, t), i?.(j));
    },
    onMouseDown: (j) => {
      j.preventDefault(), d?.(j);
    },
    onMouseOver: (j) => {
      w.resetSelectionOnOptionHover && w.store.resetSelectedOption(), p?.(j);
    }
  });
});
ci.classes = ct;
ci.displayName = "@mantine/core/ComboboxOption";
const li = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, id: s, onMouseDown: a, labelledBy: i, ...c } = Z("ComboboxOptions", null, e), u = St(), d = _t(s);
  return f.useEffect(() => {
    u.store.setListId(d);
  }, [d]), /* @__PURE__ */ l.jsx(Q, {
    ...u.getStyles("options", {
      className: n,
      style: o,
      classNames: t,
      styles: r
    }),
    ...c,
    id: d,
    role: "listbox",
    "aria-labelledby": i,
    onMouseDown: (p) => {
      p.preventDefault(), a?.(p);
    }
  });
});
li.classes = ct;
li.displayName = "@mantine/core/ComboboxOptions";
const Jg = {
  withAriaAttributes: !0,
  withKeyboardNavigation: !0
}, ui = se((e) => {
  const { classNames: t, styles: n, unstyled: o, vars: r, withAriaAttributes: s, onKeyDown: a, onClick: i, withKeyboardNavigation: c, size: u, ref: d, ...p } = Z("ComboboxSearch", Jg, e), m = St(), h = m.getStyles("search"), g = ri({
    targetType: "input",
    withAriaAttributes: s,
    withKeyboardNavigation: c,
    withExpandedAttribute: !1,
    onKeyDown: a,
    onClick: i,
    autoComplete: "off"
  });
  return /* @__PURE__ */ l.jsx(kt, {
    ref: Fe(d, m.store.searchRef),
    classNames: [{ input: h.className }, t],
    styles: [{ input: h.style }, n],
    size: u || m.size,
    ...g,
    ...p,
    __staticSelector: "Combobox"
  });
});
ui.classes = ct;
ui.displayName = "@mantine/core/ComboboxSearch";
const Zg = {
  refProp: "ref",
  targetType: "input",
  withKeyboardNavigation: !0,
  withAriaAttributes: !0,
  withExpandedAttribute: !1,
  autoComplete: "off"
}, od = se((e) => {
  const { children: t, refProp: n, withKeyboardNavigation: o, withAriaAttributes: r, withExpandedAttribute: s, targetType: a, autoComplete: i, ref: c, ...u } = Z("ComboboxTarget", Zg, e), d = Qo(t);
  if (!d) throw new Error("Combobox.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  const p = St(), m = ri({
    targetType: a,
    withAriaAttributes: r,
    withKeyboardNavigation: o,
    withExpandedAttribute: s,
    onKeyDown: d.props.onKeyDown,
    onClick: d.props.onClick,
    autoComplete: i
  }), h = f.cloneElement(d, {
    ...m,
    ...u
  });
  return /* @__PURE__ */ l.jsx(Be.Target, {
    refProp: n,
    ref: Fe(c, p.store.targetRef),
    children: h
  });
});
od.displayName = "@mantine/core/ComboboxTarget";
function Qg(e, t, n) {
  for (let o = e - 1; o >= 0; o -= 1) if (!t[o].hasAttribute("data-combobox-disabled")) return o;
  if (n) {
    for (let o = t.length - 1; o > -1; o -= 1) if (!t[o].hasAttribute("data-combobox-disabled")) return o;
  }
  return e;
}
function ev(e, t, n) {
  for (let o = e + 1; o < t.length; o += 1) if (!t[o].hasAttribute("data-combobox-disabled")) return o;
  if (n) {
    for (let o = 0; o < t.length; o += 1) if (!t[o].hasAttribute("data-combobox-disabled")) return o;
  }
  return e;
}
function tv(e) {
  for (let t = 0; t < e.length; t += 1) if (!e[t].hasAttribute("data-combobox-disabled")) return t;
  return -1;
}
function di({ defaultOpened: e, opened: t, onOpenedChange: n, onDropdownClose: o, onDropdownOpen: r, loop: s = !0, scrollBehavior: a = "instant" } = {}) {
  const [i, c] = Ye({
    value: t,
    defaultValue: e,
    finalValue: !1,
    onChange: n
  }), u = f.useRef(null), d = f.useRef(-1), p = f.useRef(null), m = f.useRef(null), h = f.useRef(-1), g = f.useRef(-1), v = f.useRef(-1), w = f.useCallback((M = "unknown") => {
    i || (c(!0), r?.(M));
  }, [
    c,
    r,
    i
  ]), x = f.useCallback((M = "unknown") => {
    i && (c(!1), o?.(M));
  }, [
    c,
    o,
    i
  ]), E = f.useCallback((M = "unknown") => {
    i ? x(M) : w(M);
  }, [
    x,
    w,
    i
  ]), j = f.useCallback(() => {
    const M = Bt(m.current);
    kr(`#${u.current} [data-combobox-selected]`, M)?.removeAttribute("data-combobox-selected");
  }, []), k = f.useCallback((M) => {
    const L = Bt(m.current), I = kr(`#${u.current}`, L), A = I ? Xt("[data-combobox-option]", I) : null;
    if (!A) return null;
    const B = M >= A.length ? 0 : M < 0 ? A.length - 1 : M;
    return d.current = B, A?.[B] && !A[B].hasAttribute("data-combobox-disabled") ? (j(), A[B].setAttribute("data-combobox-selected", "true"), A[B].scrollIntoView({
      block: "nearest",
      behavior: a
    }), A[B].id) : null;
  }, [a, j]), R = f.useCallback(() => {
    const M = Bt(m.current), L = kr(`#${u.current} [data-combobox-active]`, M);
    if (L) {
      const I = Xt(`#${u.current} [data-combobox-option]`, M).findIndex((A) => A === L);
      return k(I);
    }
    return k(0);
  }, [k]), P = f.useCallback(() => {
    const M = Bt(m.current), L = Xt(`#${u.current} [data-combobox-option]`, M);
    return k(ev(d.current, L, s));
  }, [k, s]), S = f.useCallback(() => {
    const M = Bt(m.current), L = Xt(`#${u.current} [data-combobox-option]`, M);
    return k(Qg(d.current, L, s));
  }, [k, s]), y = f.useCallback(() => {
    const M = Bt(m.current), L = Xt(`#${u.current} [data-combobox-option]`, M);
    return k(tv(L));
  }, [k]), N = f.useCallback((M = "selected", L) => {
    if (typeof M == "number") {
      d.current = M;
      const I = Bt(m.current), A = Xt(`#${u.current} [data-combobox-option]`, I);
      L?.scrollIntoView && A[M]?.scrollIntoView({
        block: "nearest",
        behavior: a
      });
      return;
    }
    v.current = window.setTimeout(() => {
      const I = Bt(m.current), A = Xt(`#${u.current} [data-combobox-option]`, I), B = A.findIndex((U) => U.hasAttribute(`data-combobox-${M}`));
      d.current = B, L?.scrollIntoView && A[B]?.scrollIntoView({
        block: "nearest",
        behavior: a
      });
    }, 0);
  }, []), D = f.useCallback(() => {
    d.current = -1, j();
  }, [j]), O = f.useCallback(() => {
    const M = Bt(m.current);
    Xt(`#${u.current} [data-combobox-option]`, M)?.[d.current]?.click();
  }, []), z = f.useCallback((M) => {
    u.current = M;
  }, []), _ = f.useCallback(() => {
    h.current = window.setTimeout(() => p.current?.focus(), 0);
  }, []), F = f.useCallback(() => {
    g.current = window.setTimeout(() => m.current?.focus(), 0);
  }, []), $ = f.useCallback(() => d.current, []);
  return f.useEffect(() => () => {
    window.clearTimeout(h.current), window.clearTimeout(g.current), window.clearTimeout(v.current);
  }, []), {
    dropdownOpened: i,
    openDropdown: w,
    closeDropdown: x,
    toggleDropdown: E,
    selectedOptionIndex: d.current,
    getSelectedOptionIndex: $,
    selectOption: k,
    selectFirstOption: y,
    selectActiveOption: R,
    selectNextOption: P,
    selectPreviousOption: S,
    resetSelectedOption: D,
    updateSelectedOptionIndex: N,
    listId: u.current,
    setListId: z,
    clickSelectedOption: O,
    searchRef: p,
    focusSearchInput: _,
    targetRef: m,
    focusTarget: F
  };
}
const nv = {
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
}, rd = Oe((e, { size: t, dropdownPadding: n }) => ({
  options: {
    "--combobox-option-fz": Dr(t),
    "--combobox-option-padding": $e(t, "combobox-option-padding")
  },
  dropdown: {
    "--combobox-padding": n === void 0 ? void 0 : Te(n),
    "--combobox-option-fz": Dr(t),
    "--combobox-option-padding": $e(t, "combobox-option-padding")
  }
})), xe = (e) => {
  const t = Z("Combobox", nv, e), { classNames: n, styles: o, unstyled: r, children: s, store: a, vars: i, onOptionSubmit: c, onClose: u, size: d, dropdownPadding: p, resetSelectionOnOptionHover: m, __staticSelector: h, readOnly: g, attributes: v, floatingHeight: w, middlewares: x, ...E } = t, j = w === "viewport" ? {
    ...x,
    flip: !1,
    size: {
      ...typeof x?.size == "object" ? x.size : {},
      padding: typeof x?.size == "object" && x.size.padding !== void 0 ? x.size.padding : 10,
      apply: ({ availableHeight: y, availableWidth: N, elements: D, ...O }) => {
        D.floating.style.setProperty("--combobox-floating-max-height", `${y}px`);
        const z = x?.size;
        typeof z == "object" && z.apply ? z.apply({
          availableHeight: y,
          availableWidth: N,
          elements: D,
          ...O
        }) : z && Object.assign(D.floating.style, {
          maxWidth: `${N}px`,
          maxHeight: `${y}px`
        });
      }
    }
  } : x, k = di(), R = a || k, P = Ie({
    name: h || "Combobox",
    classes: ct,
    props: t,
    classNames: n,
    styles: o,
    unstyled: r,
    attributes: v,
    vars: i,
    varsResolver: rd
  }), S = () => {
    u?.(), R.closeDropdown();
  };
  return /* @__PURE__ */ l.jsx(Xg, {
    value: {
      getStyles: P,
      store: R,
      onOptionSubmit: c,
      size: d,
      resetSelectionOnOptionHover: m,
      readOnly: g,
      floatingHeight: w
    },
    children: /* @__PURE__ */ l.jsx(Be, {
      opened: R.dropdownOpened,
      ...E,
      middlewares: j,
      onChange: (y) => !y && S(),
      withRoles: !1,
      unstyled: r,
      children: s
    })
  });
}, ov = (e) => e;
xe.extend = ov;
xe.classes = ct;
xe.varsResolver = rd;
xe.displayName = "@mantine/core/Combobox";
xe.Target = od;
xe.Dropdown = ni;
xe.Options = li;
xe.Option = ci;
xe.Search = ui;
xe.Empty = oi;
xe.Chevron = nr;
xe.Footer = si;
xe.Header = ii;
xe.EventsTarget = td;
xe.DropdownTarget = ed;
xe.Group = ai;
xe.ClearButton = Qu;
xe.HiddenInput = nd;
function sd({ children: e, role: t }) {
  const n = f.use(Cp);
  return n ? /* @__PURE__ */ l.jsx("div", {
    role: t,
    "aria-labelledby": n.labelId,
    "aria-describedby": n.describedBy,
    children: e
  }) : /* @__PURE__ */ l.jsx(l.Fragment, { children: e });
}
const fi = f.createContext(null), rv = { hiddenInputValuesSeparator: "," }, pi = xn(((e) => {
  const { value: t, defaultValue: n, onChange: o, size: r, wrapperProps: s, children: a, readOnly: i, name: c, hiddenInputValuesSeparator: u, hiddenInputProps: d, maxSelectedValues: p, disabled: m, ...h } = Z("CheckboxGroup", rv, e), [g, v] = Ye({
    value: t,
    defaultValue: n,
    finalValue: [],
    onChange: o
  }), w = (j) => {
    const k = typeof j == "string" ? j : j.currentTarget.value;
    if (i) return;
    const R = g.includes(k);
    !R && p && g.length >= p || v(R ? g.filter((P) => P !== k) : [...g, k]);
  }, x = (j) => {
    if (m) return !0;
    if (!p) return !1;
    const k = g.includes(j), R = g.length >= p;
    return !k && R;
  }, E = g.join(u);
  return /* @__PURE__ */ l.jsx(fi, {
    value: {
      value: g,
      onChange: w,
      size: r,
      isDisabled: x
    },
    children: /* @__PURE__ */ l.jsxs(kt.Wrapper, {
      size: r,
      ...s,
      ...h,
      labelElement: "div",
      __staticSelector: "CheckboxGroup",
      children: [/* @__PURE__ */ l.jsx(sd, {
        role: "group",
        children: a
      }), /* @__PURE__ */ l.jsx("input", {
        type: "hidden",
        name: c,
        value: E,
        ...d
      })]
    })
  });
}));
pi.classes = kt.Wrapper.classes;
pi.displayName = "@mantine/core/CheckboxGroup";
var ad = { card: "m_26775b0a" };
const id = f.createContext(null), sv = { withBorder: !0 }, cd = Oe((e, { radius: t }) => ({ card: { "--card-radius": Rt(t) } })), ls = se((e) => {
  const t = Z("CheckboxCard", sv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, checked: c, mod: u, withBorder: d, value: p, onClick: m, defaultChecked: h, onChange: g, indeterminate: v, attributes: w, ...x } = t, E = Ie({
    name: "CheckboxCard",
    classes: ad,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: w,
    vars: i,
    varsResolver: cd,
    rootSelector: "card"
  }), j = f.use(fi), k = typeof c == "boolean" ? c : j ? j.value.includes(p || "") : void 0, [R, P] = Ye({
    value: k,
    defaultValue: h,
    finalValue: !1,
    onChange: g
  });
  return /* @__PURE__ */ l.jsx(id, {
    value: {
      checked: R,
      indeterminate: v
    },
    children: /* @__PURE__ */ l.jsx(so, {
      mod: [{
        "with-border": d,
        checked: R,
        indeterminate: v
      }, u],
      ...E("card"),
      ...x,
      role: "checkbox",
      "aria-checked": v ? "mixed" : R,
      onClick: (S) => {
        m?.(S), j?.onChange(p || ""), P(!R);
      }
    })
  });
});
ls.displayName = "@mantine/core/CheckboxCard";
ls.classes = ad;
ls.varsResolver = cd;
function mi({ size: e, style: t, ...n }) {
  const o = e !== void 0 ? {
    width: Te(e),
    height: Te(e),
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
function ld({ indeterminate: e, ...t }) {
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
  }) : /* @__PURE__ */ l.jsx(mi, { ...t });
}
var ud = {
  indicator: "m_5e5256ee",
  icon: "m_1b1c543a",
  "indicator--outline": "m_76e20374"
};
const av = {
  icon: ld,
  variant: "filled",
  radius: "sm"
}, dd = Oe((e, { radius: t, color: n, size: o, iconColor: r, variant: s, autoContrast: a }) => {
  const i = Jr({
    color: n || e.primaryColor,
    theme: e
  }), c = i.isThemeColor && i.shade === void 0 ? `var(--mantine-color-${i.color}-outline)` : i.color;
  return { indicator: {
    "--checkbox-size": $e(o, "checkbox-size"),
    "--checkbox-radius": t === void 0 ? void 0 : Rt(t),
    "--checkbox-color": s === "outline" ? c : nt(n, e),
    "--checkbox-icon-color": r ? nt(r, e) : er(a, e) ? go({
      color: n,
      theme: e,
      autoContrast: a
    }) : void 0
  } };
}), us = se((e) => {
  const t = Z("CheckboxIndicator", av, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, icon: c, indeterminate: u, radius: d, color: p, iconColor: m, autoContrast: h, checked: g, mod: v, variant: w, disabled: x, attributes: E, ...j } = t, k = Ie({
    name: "CheckboxIndicator",
    classes: ud,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: E,
    vars: i,
    varsResolver: dd,
    rootSelector: "indicator"
  }), R = f.use(id), P = typeof u == "boolean" ? u : R?.indeterminate, S = typeof g == "boolean" || typeof u == "boolean" ? g || u : R?.checked || R?.indeterminate || !1;
  return /* @__PURE__ */ l.jsx(Q, {
    ...k("indicator", { variant: w }),
    variant: w,
    mod: [{
      checked: S,
      disabled: x
    }, v],
    ...j,
    children: /* @__PURE__ */ l.jsx(c, {
      indeterminate: P,
      ...k("icon")
    })
  });
});
us.displayName = "@mantine/core/CheckboxIndicator";
us.classes = ud;
us.varsResolver = dd;
var fd = {
  root: "m_5f75b09e",
  body: "m_5f6e695e",
  labelWrapper: "m_d3ea56bb",
  label: "m_8ee546b8",
  description: "m_328f68c0",
  error: "m_8e8a99cc"
};
const iv = fd;
function hi({ __staticSelector: e, __stylesApiProps: t, className: n, classNames: o, styles: r, unstyled: s, children: a, label: i, description: c, id: u, disabled: d, error: p, size: m, labelPosition: h = "left", bodyElement: g = "div", labelElement: v = "label", variant: w, style: x, vars: E, mod: j, attributes: k, ...R }) {
  const P = Ie({
    name: e,
    props: t,
    className: n,
    style: x,
    classes: fd,
    classNames: o,
    styles: r,
    unstyled: s,
    attributes: k
  }), S = c ? `${u}-description` : void 0, y = p && typeof p != "boolean" ? `${u}-error` : void 0;
  return /* @__PURE__ */ l.jsx(Q, {
    ...P("root"),
    __vars: {
      "--label-fz": Dr(m),
      "--label-lh": $e(m, "label-lh")
    },
    mod: [{ "label-position": h }, j],
    variant: w,
    size: m,
    ...R,
    children: /* @__PURE__ */ l.jsxs(Q, {
      component: g,
      htmlFor: g === "label" ? u : void 0,
      ...P("body"),
      children: [a, /* @__PURE__ */ l.jsxs("div", {
        ...P("labelWrapper"),
        "data-disabled": d || void 0,
        children: [
          i && /* @__PURE__ */ l.jsx(Q, {
            component: v,
            htmlFor: v === "label" ? u : void 0,
            ...P("label"),
            "data-disabled": d || void 0,
            children: i
          }),
          c && /* @__PURE__ */ l.jsx(kt.Description, {
            id: S,
            size: m,
            __inheritStyles: !1,
            ...P("description"),
            children: c
          }),
          p && typeof p != "boolean" && /* @__PURE__ */ l.jsx(kt.Error, {
            id: y,
            size: m,
            __inheritStyles: !1,
            ...P("error"),
            children: p
          })
        ]
      })]
    })
  });
}
hi.displayName = "@mantine/core/InlineInput";
var pd = {
  root: "m_bf2d988c",
  inner: "m_26062bec",
  input: "m_26063560",
  icon: "m_bf295423",
  "input--outline": "m_215c4542"
};
const cv = {
  labelPosition: "right",
  icon: ld,
  withErrorStyles: !0,
  variant: "filled",
  radius: "sm"
}, md = Oe((e, { radius: t, color: n, size: o, iconColor: r, variant: s, autoContrast: a }) => {
  const i = Jr({
    color: n || e.primaryColor,
    theme: e
  }), c = i.isThemeColor && i.shade === void 0 ? `var(--mantine-color-${i.color}-outline)` : i.color;
  return { root: {
    "--checkbox-size": $e(o, "checkbox-size"),
    "--checkbox-radius": t === void 0 ? void 0 : Rt(t),
    "--checkbox-color": s === "outline" ? c : nt(n, e),
    "--checkbox-icon-color": r ? nt(r, e) : er(a, e) ? go({
      color: n,
      theme: e,
      autoContrast: a
    }) : void 0
  } };
}), tn = se((e) => {
  const t = Z("Checkbox", cv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, color: c, label: u, id: d, size: p, radius: m, wrapperProps: h, checked: g, labelPosition: v, description: w, error: x, disabled: E, variant: j, indeterminate: k, icon: R, rootRef: P, iconColor: S, onChange: y, autoContrast: N, mod: D, attributes: O, readOnly: z, onClick: _, withErrorStyles: F, ref: $, ...M } = t, L = f.useRef(null), I = f.use(fi), A = p || I?.size, B = Ie({
    name: "Checkbox",
    props: t,
    classes: pd,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: O,
    vars: i,
    varsResolver: md
  }), { styleProps: U, rest: W } = Al(M), Y = _t(d), ae = [
    w ? `${Y}-description` : void 0,
    x && typeof x != "boolean" ? `${Y}-error` : void 0,
    W["aria-describedby"]
  ].filter(Boolean).join(" ") || void 0, fe = {
    checked: I?.value.includes(W.value) ?? g,
    onChange: (me) => {
      z || (I?.onChange(me), y?.(me));
    }
  }, ie = I?.isDisabled?.(W.value) ?? !1, te = E || ie;
  return f.useEffect(() => {
    L.current && (L.current.indeterminate = k || !1, k ? L.current.setAttribute("data-indeterminate", "true") : L.current.removeAttribute("data-indeterminate"));
  }, [k]), /* @__PURE__ */ l.jsx(hi, {
    ...B("root"),
    __staticSelector: "Checkbox",
    __stylesApiProps: t,
    id: Y,
    size: A,
    labelPosition: v,
    label: u,
    description: w,
    error: x,
    disabled: te,
    classNames: n,
    styles: s,
    unstyled: a,
    "data-checked": fe.checked || g || void 0,
    variant: j,
    ref: P,
    mod: D,
    attributes: O,
    inert: W.inert,
    ...U,
    ...h,
    children: /* @__PURE__ */ l.jsxs(Q, {
      ...B("inner"),
      mod: { labelPosition: v },
      children: [/* @__PURE__ */ l.jsx(Q, {
        component: "input",
        id: Y,
        ref: Fe(L, $),
        mod: {
          error: !!x,
          "with-error-styles": F
        },
        ...B("input", {
          focusable: !0,
          variant: j
        }),
        ...W,
        ...fe,
        "aria-describedby": ae,
        disabled: te,
        inert: W.inert,
        type: "checkbox",
        onClick: (me) => {
          z && fe.checked === void 0 && me.preventDefault(), _?.(me);
        }
      }), /* @__PURE__ */ l.jsx(R, {
        indeterminate: k,
        ...B("icon")
      })]
    })
  });
});
tn.classes = {
  ...pd,
  ...iv
};
tn.varsResolver = md;
tn.displayName = "@mantine/core/Checkbox";
tn.Group = pi;
tn.Indicator = us;
tn.Card = ls;
function Fo(e) {
  return "group" in e;
}
function hd({ options: e, search: t, limit: n }) {
  const o = t.trim().toLowerCase(), r = [];
  for (let s = 0; s < e.length; s += 1) {
    const a = e[s];
    if (r.length === n) return r;
    Fo(a) && r.push({
      group: a.group,
      items: hd({
        options: a.items,
        search: t,
        limit: n - r.length
      })
    }), Fo(a) || a.label.toLowerCase().includes(o) && r.push(a);
  }
  return r;
}
function lv(e) {
  if (e.length === 0) return !0;
  for (const t of e)
    if (!("group" in t) || t.items.length > 0) return !1;
  return !0;
}
function gd(e, t = /* @__PURE__ */ new Set()) {
  if (Array.isArray(e))
    for (const n of e) if (Fo(n)) gd(n.items, t);
    else {
      if (typeof n.value > "u") throw new Error("[@mantine/core] Each option must have value property");
      if (t.has(n.value)) throw new Error(`[@mantine/core] Duplicate options are not supported. Option with value "${n.value}" was provided more than once`);
      t.add(n.value);
    }
}
function uv(e, t) {
  return Array.isArray(e) ? e.includes(t) : e === t;
}
function vd({ data: e, withCheckIcon: t, withAlignedLabels: n, value: o, checkIconPosition: r, unstyled: s, renderOption: a }) {
  if (!Fo(e)) {
    const c = uv(o, e.value), u = t && (c ? /* @__PURE__ */ l.jsx(mi, { className: ct.optionsDropdownCheckIcon }) : n ? /* @__PURE__ */ l.jsx("div", { className: ct.optionsDropdownCheckPlaceholder }) : null), d = /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
      r === "left" && u,
      /* @__PURE__ */ l.jsx("span", { children: e.label }),
      r === "right" && u
    ] });
    return /* @__PURE__ */ l.jsx(xe.Option, {
      value: e.value,
      disabled: e.disabled,
      className: en({ [ct.optionsDropdownOption]: !s }),
      "data-reverse": r === "right" || void 0,
      "data-checked": c || void 0,
      "aria-selected": c,
      active: c,
      children: typeof a == "function" ? a({
        option: e,
        checked: c
      }) : d
    });
  }
  const i = e.items.map((c) => /* @__PURE__ */ l.jsx(vd, {
    data: c,
    value: o,
    unstyled: s,
    withCheckIcon: t,
    withAlignedLabels: n,
    checkIconPosition: r,
    renderOption: a
  }, `${c.value}`));
  return /* @__PURE__ */ l.jsx(xe.Group, {
    label: e.group,
    children: i
  });
}
function dv({ data: e, hidden: t, hiddenWhenEmpty: n, filter: o, search: r, limit: s, maxDropdownHeight: a, floatingHeight: i, withScrollArea: c = !0, filterOptions: u = !0, withCheckIcon: d = !1, withAlignedLabels: p = !1, value: m, checkIconPosition: h, nothingFoundMessage: g, unstyled: v, labelId: w, renderOption: x, scrollAreaProps: E, "aria-label": j }) {
  const k = St();
  gd(e);
  const R = typeof r == "string" ? (o || hd)({
    options: e,
    search: u ? r : "",
    limit: s ?? 1 / 0
  }) : e, P = lv(R), S = R.map((y, N) => /* @__PURE__ */ l.jsx(vd, {
    data: y,
    withCheckIcon: d,
    withAlignedLabels: p,
    value: m,
    checkIconPosition: h,
    unstyled: v,
    renderOption: x
  }, Fo(y) ? `group-${typeof y.group == "string" ? y.group : N}` : `${y.value}`));
  return /* @__PURE__ */ l.jsx(xe.Dropdown, {
    hidden: t || n && P,
    "data-composed": !0,
    children: /* @__PURE__ */ l.jsxs(xe.Options, {
      labelledBy: w,
      "aria-label": j,
      children: [c ? /* @__PURE__ */ l.jsx(Cn.Autosize, {
        mah: (i ?? k.floatingHeight) === "viewport" ? "var(--combobox-floating-options-max-height)" : a ?? 220,
        type: "scroll",
        scrollbarSize: "var(--combobox-padding)",
        offsetScrollbars: "y",
        ...E,
        children: S
      }) : S, P && g && /* @__PURE__ */ l.jsx(xe.Empty, { children: g })]
    })
  });
}
function fv(e) {
  const t = e.currentTarget;
  return Bt(t).activeElement !== t;
}
var yd = {
  root: "m_de3d2490",
  colorOverlay: "m_862f3d1b",
  shadowOverlay: "m_98ae7f22",
  alphaOverlay: "m_95709ac0",
  childrenOverlay: "m_93e74e3"
};
const Pc = { withShadow: !0 }, bd = Oe((e, { radius: t, size: n }) => ({ root: {
  "--cs-radius": t === void 0 ? void 0 : Rt(t),
  "--cs-size": Te(n)
} })), xo = Tl((e) => {
  const t = Z("ColorSwatch", Pc, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, color: c, radius: u, withShadow: d, children: p, attributes: m, ...h } = Z("ColorSwatch", Pc, t), g = Ie({
    name: "ColorSwatch",
    props: t,
    classes: yd,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: m,
    vars: i,
    varsResolver: bd
  });
  return /* @__PURE__ */ l.jsxs(Q, {
    ...g("root", { focusable: !0 }),
    ...h,
    children: [
      /* @__PURE__ */ l.jsx("span", { ...g("alphaOverlay") }),
      d && /* @__PURE__ */ l.jsx("span", { ...g("shadowOverlay") }),
      /* @__PURE__ */ l.jsx("span", { ...g("colorOverlay", { style: { backgroundColor: c } }) }),
      /* @__PURE__ */ l.jsx("span", {
        ...g("childrenOverlay"),
        children: p
      })
    ]
  });
});
xo.classes = yd;
xo.varsResolver = bd;
xo.displayName = "@mantine/core/ColorSwatch";
function Ct(e, t = 0, n = 10 ** t) {
  return Math.round(n * e) / n;
}
function pv({ h: e, s: t, l: n, a: o }) {
  const r = t * ((n < 50 ? n : 100 - n) / 100);
  return {
    h: e,
    s: r > 0 ? 2 * r / (n + r) * 100 : 0,
    v: n + r,
    a: o
  };
}
const mv = {
  grad: 360 / 400,
  turn: 360,
  rad: 360 / (Math.PI * 2)
};
function hv(e, t = "deg") {
  return Number(e) * (mv[t] || 1);
}
const gv = /hsla?\(?\s*(-?\d*\.?\d+)(deg|rad|grad|turn)?[,\s]+(-?\d*\.?\d+)%?[,\s]+(-?\d*\.?\d+)%?,?\s*[/\s]*(-?\d*\.?\d+)?(%)?\s*\)?/i;
function Tc(e) {
  const t = gv.exec(e);
  return t ? pv({
    h: hv(t[1], t[2]),
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
function da({ r: e, g: t, b: n, a: o }) {
  const r = Math.max(e, t, n), s = r - Math.min(e, t, n), a = s ? r === e ? (t - n) / s : r === t ? 2 + (n - e) / s : 4 + (e - t) / s : 0;
  return {
    h: Ct(60 * (a < 0 ? a + 6 : a), 3),
    s: Ct(r ? s / r * 100 : 0, 3),
    v: Ct(r / 255 * 100, 3),
    a: o
  };
}
function fa(e) {
  const t = e[0] === "#" ? e.slice(1) : e;
  return t.length === 3 ? da({
    r: parseInt(t[0] + t[0], 16),
    g: parseInt(t[1] + t[1], 16),
    b: parseInt(t[2] + t[2], 16),
    a: 1
  }) : da({
    r: parseInt(t.slice(0, 2), 16),
    g: parseInt(t.slice(2, 4), 16),
    b: parseInt(t.slice(4, 6), 16),
    a: 1
  });
}
function vv(e) {
  const t = e[0] === "#" ? e.slice(1) : e, n = (s) => Ct(parseInt(s, 16) / 255, 3);
  if (t.length === 4) {
    const s = t.slice(0, 3), a = n(t[3] + t[3]);
    return {
      ...fa(s),
      a
    };
  }
  const o = t.slice(0, 6), r = n(t.slice(6, 8));
  return {
    ...fa(o),
    a: r
  };
}
const yv = /rgba?\(?\s*(-?\d*\.?\d+)(%)?[,\s]+(-?\d*\.?\d+)(%)?[,\s]+(-?\d*\.?\d+)(%)?,?\s*[/\s]*(-?\d*\.?\d+)?(%)?\s*\)?/i;
function Ac(e) {
  const t = yv.exec(e);
  return t ? da({
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
const wd = {
  hex: /^#?([0-9A-F]{3}){1,2}$/i,
  hexa: /^#?([0-9A-F]{4}){1,2}$/i,
  rgb: /^rgb\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/i,
  rgba: /^rgba\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/i,
  hsl: /hsl\(\s*(\d+)\s*,\s*(\d+(?:\.\d+)?%)\s*,\s*(\d+(?:\.\d+)?%)\)/i,
  hsla: /^hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*(\d*(?:\.\d+)?)\)$/i
}, bv = {
  hex: fa,
  hexa: vv,
  rgb: Ac,
  rgba: Ac,
  hsl: Tc,
  hsla: Tc
};
function No(e) {
  for (const [, t] of Object.entries(wd)) if (t.test(e)) return !0;
  return !1;
}
function Nn(e) {
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
  for (const [n, o] of Object.entries(wd)) if (o.test(t)) return bv[n](t);
  return {
    h: 0,
    s: 0,
    v: 0,
    a: 1
  };
}
const ds = f.createContext(null);
function gi({ position: e, ...t }) {
  return /* @__PURE__ */ l.jsx(Q, {
    __vars: {
      "--thumb-y-offset": `${e.y * 100}%`,
      "--thumb-x-offset": `${e.x * 100}%`
    },
    ...t
  });
}
gi.displayName = "@mantine/core/ColorPickerThumb";
var fs = {
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
const So = se((e) => {
  const t = Z("ColorSlider", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, onChange: c, onChangeEnd: u, maxValue: d, round: p, size: m = "md", focusable: h = !0, value: g, overlays: v, thumbColor: w = "transparent", onScrubStart: x, onScrubEnd: E, __staticSelector: j = "ColorPicker", attributes: k, ref: R, ...P } = t, S = Ie({
    name: j,
    classes: fs,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: k,
    rootSelector: "slider"
  }), y = f.use(ds)?.getStyles || S, N = Jo(), [D, O] = f.useState({
    y: 0,
    x: g / d
  }), z = f.useRef(D), _ = (I) => p ? Math.round(I * d) : I * d, { ref: F } = ql(({ x: I, y: A }) => {
    z.current = {
      x: I,
      y: A
    }, c?.(_(I));
  }, {
    onScrubEnd: () => {
      const { x: I } = z.current;
      u?.(_(I)), E?.();
    },
    onScrubStart: x
  });
  vn(() => {
    O({
      y: 0,
      x: g / d
    });
  }, [g]);
  const $ = (I, A) => {
    I.preventDefault();
    const B = Wl(A);
    c?.(_(B.x)), u?.(_(B.x));
  }, M = (I) => {
    switch (I.key) {
      case "ArrowRight":
        $(I, {
          x: D.x + 0.05,
          y: D.y
        });
        break;
      case "ArrowLeft":
        $(I, {
          x: D.x - 0.05,
          y: D.y
        });
    }
  }, L = v.map((I, A) => /* @__PURE__ */ f.createElement("div", {
    ...y("sliderOverlay"),
    style: I,
    key: A
  }));
  return /* @__PURE__ */ l.jsxs(Q, {
    ...P,
    ref: Fe(F, R),
    ...y("slider"),
    size: m,
    role: "slider",
    "aria-valuenow": g,
    "aria-valuemax": d,
    "aria-valuemin": 0,
    tabIndex: h ? 0 : -1,
    onKeyDown: M,
    "data-focus-ring": N.focusRing,
    __vars: { "--cp-thumb-size": `var(--cp-thumb-size-${m})` },
    children: [L, /* @__PURE__ */ l.jsx(gi, {
      position: D,
      ...y("thumb", { style: {
        top: Te(1),
        background: w
      } })
    })]
  });
});
So.displayName = "@mantine/core/ColorSlider";
So.classes = fs;
const wv = { __staticSelector: "AlphaSlider" }, vi = se((e) => {
  const { value: t, onChange: n, onChangeEnd: o, color: r, ...s } = Z("AlphaSlider", wv, e);
  return /* @__PURE__ */ l.jsx(So, {
    ...s,
    value: t,
    onChange: (a) => n?.(Ct(a, 2)),
    onChangeEnd: (a) => o?.(Ct(a, 2)),
    maxValue: 1,
    round: !1,
    "data-alpha": !0,
    overlays: [
      {
        backgroundImage: "linear-gradient(45deg, var(--slider-checkers) 25%, transparent 25%), linear-gradient(-45deg, var(--slider-checkers) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--slider-checkers) 75%), linear-gradient(-45deg, var(--mantine-color-body) 75%, var(--slider-checkers) 75%)",
        backgroundSize: `${Te(8)} ${Te(8)}`,
        backgroundPosition: `0 0, 0 ${Te(4)}, ${Te(4)} ${Te(-4)}, ${Te(-4)} 0`
      },
      { backgroundImage: `linear-gradient(90deg, transparent, ${r})` },
      { boxShadow: `rgba(0, 0, 0, .1) 0 0 0 ${Te(1)} inset, rgb(0, 0, 0, .15) 0 0 ${Te(4)} inset` }
    ]
  });
});
vi.displayName = "@mantine/core/AlphaSlider";
vi.classes = So.classes;
function xd({ h: e, s: t, v: n, a: o }) {
  const r = e / 360 * 6, s = t / 100, a = n / 100, i = Math.floor(r), c = a * (1 - s), u = a * (1 - (r - i) * s), d = a * (1 - (1 - r + i) * s), p = i % 6;
  return {
    r: Ct([
      a,
      u,
      c,
      c,
      d,
      a
    ][p] * 255),
    g: Ct([
      d,
      a,
      a,
      u,
      c,
      c
    ][p] * 255),
    b: Ct([
      c,
      c,
      d,
      a,
      a,
      u
    ][p] * 255),
    a: Ct(o, 2)
  };
}
function Ic(e, t) {
  const { r: n, g: o, b: r, a: s } = xd(e);
  return t ? `rgba(${n}, ${o}, ${r}, ${Ct(s, 2)})` : `rgb(${n}, ${o}, ${r})`;
}
function Mc({ h: e, s: t, v: n, a: o }, r) {
  const s = (200 - t) * n / 100, a = {
    h: Math.round(e),
    s: Math.round(s > 0 && s < 200 ? t * n / 100 / (s <= 100 ? s : 200 - s) * 100 : 0),
    l: Math.round(s / 2)
  };
  return r ? `hsla(${a.h}, ${a.s}%, ${a.l}%, ${Ct(o, 2)})` : `hsl(${a.h}, ${a.s}%, ${a.l}%)`;
}
function Pr(e) {
  const t = e.toString(16);
  return t.length < 2 ? `0${t}` : t;
}
function Sd(e) {
  const { r: t, g: n, b: o } = xd(e);
  return `#${Pr(t)}${Pr(n)}${Pr(o)}`;
}
function xv(e) {
  const t = Math.round(e.a * 255);
  return `${Sd(e)}${Pr(t)}`;
}
const Bs = {
  hex: Sd,
  hexa: (e) => xv(e),
  rgb: (e) => Ic(e, !1),
  rgba: (e) => Ic(e, !0),
  hsl: (e) => Mc(e, !1),
  hsla: (e) => Mc(e, !0)
};
function At(e, t) {
  return t ? e in Bs ? Bs[e](t) : Bs.hex(t) : "#000000";
}
const Sv = { __staticSelector: "HueSlider" }, yi = se((e) => {
  const { value: t, onChange: n, onChangeEnd: o, color: r, ...s } = Z("HueSlider", Sv, e);
  return /* @__PURE__ */ l.jsx(So, {
    ...s,
    value: t,
    onChange: n,
    onChangeEnd: o,
    maxValue: 360,
    thumbColor: `hsl(${t}, 100%, 50%)`,
    round: !0,
    "data-hue": !0,
    overlays: [{ backgroundImage: "linear-gradient(to right,hsl(0,100%,50%),hsl(60,100%,50%),hsl(120,100%,50%),hsl(170,100%,50%),hsl(240,100%,50%),hsl(300,100%,50%),hsl(360,100%,50%))" }, { boxShadow: `rgba(0, 0, 0, .1) 0 0 0 ${Te(1)} inset, rgb(0, 0, 0, .15) 0 0 ${Te(4)} inset` }]
  });
});
yi.displayName = "@mantine/core/HueSlider";
yi.classes = So.classes;
function Cd({ className: e, onChange: t, onChangeEnd: n, value: o, saturationLabel: r, focusable: s = !0, size: a, color: i, onScrubStart: c, onScrubEnd: u, ...d }) {
  const { getStyles: p } = f.use(ds), [m, h] = f.useState({
    x: o.s / 100,
    y: 1 - o.v / 100
  }), g = f.useRef(m), { ref: v } = ql(({ x: E, y: j }) => {
    g.current = {
      x: E,
      y: j
    }, t({
      s: Math.round(E * 100),
      v: Math.round((1 - j) * 100)
    });
  }, {
    onScrubEnd: () => {
      const { x: E, y: j } = g.current;
      n({
        s: Math.round(E * 100),
        v: Math.round((1 - j) * 100)
      }), u?.();
    },
    onScrubStart: c
  });
  f.useEffect(() => {
    h({
      x: o.s / 100,
      y: 1 - o.v / 100
    });
  }, [o.s, o.v]);
  const w = (E, j) => {
    E.preventDefault();
    const k = Wl(j);
    t({
      s: Math.round(k.x * 100),
      v: Math.round((1 - k.y) * 100)
    }), n({
      s: Math.round(k.x * 100),
      v: Math.round((1 - k.y) * 100)
    });
  }, x = (E) => {
    switch (E.key) {
      case "ArrowUp":
        w(E, {
          y: m.y - 0.05,
          x: m.x
        });
        break;
      case "ArrowDown":
        w(E, {
          y: m.y + 0.05,
          x: m.x
        });
        break;
      case "ArrowRight":
        w(E, {
          x: m.x + 0.05,
          y: m.y
        });
        break;
      case "ArrowLeft":
        w(E, {
          x: m.x - 0.05,
          y: m.y
        });
    }
  };
  return /* @__PURE__ */ l.jsxs(Q, {
    ...p("saturation"),
    ref: v,
    ...d,
    role: "slider",
    "aria-label": r,
    "aria-valuenow": m.x,
    "aria-valuetext": At("rgba", o),
    tabIndex: s ? 0 : -1,
    onKeyDown: x,
    children: [
      /* @__PURE__ */ l.jsx("div", { ...p("saturationOverlay", { style: { backgroundColor: `hsl(${o.h}, 100%, 50%)` } }) }),
      /* @__PURE__ */ l.jsx("div", { ...p("saturationOverlay", { style: { backgroundImage: "linear-gradient(90deg, #fff, transparent)" } }) }),
      /* @__PURE__ */ l.jsx("div", { ...p("saturationOverlay", { style: { backgroundImage: "linear-gradient(0deg, #000, transparent)" } }) }),
      /* @__PURE__ */ l.jsx(gi, {
        position: m,
        ...p("thumb", { style: { backgroundColor: i } })
      })
    ]
  });
}
Cd.displayName = "@mantine/core/Saturation";
function jd({ className: e, datatype: t, setValue: n, onChangeEnd: o, size: r, focusable: s, data: a, swatchesPerRow: i, value: c, ...u }) {
  const d = f.use(ds), p = a.map((m, h) => /* @__PURE__ */ f.createElement(xo, {
    ...d.getStyles("swatch"),
    unstyled: d.unstyled,
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
  }, c === m && /* @__PURE__ */ l.jsx(mi, {
    size: "35%",
    color: fp(m) < 0.5 ? "white" : "black"
  })));
  return /* @__PURE__ */ l.jsx(Q, {
    ...d.getStyles("swatches"),
    ...u,
    children: p
  });
}
jd.displayName = "@mantine/core/Swatches";
const Cv = {
  swatchesPerRow: 7,
  withPicker: !0,
  focusable: !0,
  size: "md",
  __staticSelector: "ColorPicker"
}, kd = Oe((e, { size: t, swatchesPerRow: n }) => ({ wrapper: {
  "--cp-preview-size": $e(t, "cp-preview-size"),
  "--cp-width": $e(t, "cp-width"),
  "--cp-body-spacing": $o(t),
  "--cp-swatch-size": `${100 / n}%`,
  "--cp-thumb-size": $e(t, "cp-thumb-size"),
  "--cp-saturation-height": $e(t, "cp-saturation-height")
} })), ps = se((e) => {
  const t = Z("ColorPicker", Cv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, format: c = "hex", value: u, defaultValue: d, onChange: p, onChangeEnd: m, withPicker: h, size: g, saturationLabel: v, hueLabel: w, alphaLabel: x, focusable: E, swatches: j, swatchesPerRow: k, fullWidth: R, onColorSwatchClick: P, __staticSelector: S, mod: y, attributes: N, name: D, hiddenInputProps: O, ...z } = t, _ = Ie({
    name: S,
    props: t,
    classes: fs,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: N,
    rootSelector: "wrapper",
    vars: i,
    varsResolver: kd
  }), F = f.useRef(c || "hex"), $ = f.useRef(""), M = f.useRef(-1), L = f.useRef(!1), I = c === "hexa" || c === "rgba" || c === "hsla", [A, B, U] = Ye({
    value: u,
    defaultValue: d,
    finalValue: "#FFFFFF",
    onChange: p
  }), [W, Y] = f.useState(Nn(A)), ae = () => {
    window.clearTimeout(M.current), L.current = !0;
  }, fe = () => {
    window.clearTimeout(M.current), M.current = window.setTimeout(() => {
      L.current = !1;
    }, 200);
  }, ie = (te) => {
    Y((me) => {
      const q = {
        ...me,
        ...te
      };
      return $.current = At(F.current, q), q;
    }), B($.current);
  };
  return vn(() => {
    typeof u == "string" && No(u) && !L.current && Y(Nn(u));
  }, [u]), vn(() => {
    F.current = c || "hex", B(At(F.current, W));
  }, [c]), /* @__PURE__ */ l.jsx(ds, {
    value: {
      getStyles: _,
      unstyled: a
    },
    children: /* @__PURE__ */ l.jsxs(Q, {
      ..._("wrapper"),
      size: g,
      mod: [{ "full-width": R }, y],
      ...z,
      children: [
        D && /* @__PURE__ */ l.jsx("input", {
          type: "hidden",
          name: D,
          value: A,
          ...O
        }),
        h && /* @__PURE__ */ l.jsxs(l.Fragment, { children: [/* @__PURE__ */ l.jsx(Cd, {
          value: W,
          onChange: ie,
          onChangeEnd: ({ s: te, v: me }) => m?.(At(F.current, {
            ...W,
            s: te,
            v: me
          })),
          color: A,
          size: g,
          focusable: E,
          saturationLabel: v,
          onScrubStart: ae,
          onScrubEnd: fe
        }), /* @__PURE__ */ l.jsxs("div", {
          ..._("body"),
          children: [/* @__PURE__ */ l.jsxs("div", {
            ..._("sliders"),
            children: [/* @__PURE__ */ l.jsx(yi, {
              value: W.h,
              onChange: (te) => ie({ h: te }),
              onChangeEnd: (te) => m?.(At(F.current, {
                ...W,
                h: te
              })),
              size: g,
              focusable: E,
              "aria-label": w,
              onScrubStart: ae,
              onScrubEnd: fe
            }), I && /* @__PURE__ */ l.jsx(vi, {
              value: W.a,
              onChange: (te) => ie({ a: te }),
              onChangeEnd: (te) => {
                m?.(At(F.current, {
                  ...W,
                  a: te
                }));
              },
              size: g,
              color: At("hex", W),
              focusable: E,
              "aria-label": x,
              onScrubStart: ae,
              onScrubEnd: fe
            })]
          }), I && /* @__PURE__ */ l.jsx(xo, {
            color: A,
            radius: "sm",
            size: "var(--cp-preview-size)",
            ..._("preview")
          })]
        })] }),
        Array.isArray(j) && /* @__PURE__ */ l.jsx(jd, {
          data: j,
          swatchesPerRow: k,
          focusable: E,
          setValue: B,
          value: A,
          onChangeEnd: (te) => {
            const me = At(c, Nn(te));
            P?.(me), m?.(me), U || Y(Nn(te));
          }
        })
      ]
    })
  });
});
ps.classes = fs;
ps.varsResolver = kd;
ps.displayName = "@mantine/core/ColorPicker";
function jv({ style: e, ...t }) {
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
var Dc = {
  eyeDropperIcon: "m_b077c2bc",
  eyeDropperButton: "m_66a028b5",
  colorPreview: "m_c5ccdcab",
  dropdown: "m_5ece2cd7"
};
const Oc = {
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
}, Ed = Oe((e, { size: t }) => ({
  eyeDropperIcon: { "--ci-eye-dropper-icon-size": $e(t, "ci-eye-dropper-icon-size") },
  eyeDropperButton: { "--ci-button-size": $e(t, "ci-button-size") },
  colorPreview: { "--ci-preview-size": $e(t, "ci-preview-size") }
})), or = se((e) => {
  const t = Z([
    "Input",
    "InputWrapper",
    "ColorInput"
  ], Oc, e), { classNames: n, styles: o, unstyled: r, disallowInput: s, fixOnBlur: a, popoverProps: i, withPreview: c, withEyeDropper: u, eyeDropperIcon: d, closeOnColorSwatchClick: p, eyeDropperButtonProps: m, value: h, defaultValue: g, onChange: v, onChangeEnd: w, onClick: x, onFocus: E, onBlur: j, inputProps: k, format: R = "hex", wrapperProps: P, readOnly: S, withPicker: y, swatches: N, disabled: D, leftSection: O, rightSection: z, swatchesPerRow: _, fullWidth: F, ...$ } = jp("ColorInput", Oc, e), M = Ie({
    name: "ColorInput",
    props: t,
    classes: Dc,
    classNames: n,
    styles: o,
    unstyled: r,
    rootSelector: "wrapper",
    vars: t.vars,
    varsResolver: Ed
  }), { resolvedClassNames: L, resolvedStyles: I } = Zo({
    classNames: n,
    styles: o,
    props: t
  }), [A, B] = f.useState(!1), [U, W] = f.useState(""), [Y, ae] = Ye({
    value: h,
    defaultValue: g,
    finalValue: "",
    onChange: v
  }), { supported: fe, open: ie } = Up(), te = /* @__PURE__ */ l.jsx(Mo, {
    ...m,
    ...M("eyeDropperButton", {
      className: m?.className,
      style: m?.style
    }),
    variant: "subtle",
    color: "gray",
    unstyled: r,
    onClick: () => ie().then((ce) => {
      if (ce?.sRGBHex) {
        const be = At(R, Nn(ce.sRGBHex));
        ae(be), w?.(be);
      }
    }).catch(() => {
    }),
    children: d || /* @__PURE__ */ l.jsx(jv, { ...M("eyeDropperIcon") })
  }), me = (ce) => {
    E?.(ce), B(!0);
  }, q = (ce) => {
    a && ae(U), j?.(ce), B(!1);
  }, K = (ce) => {
    x?.(ce), B(!0);
  };
  return f.useEffect(() => {
    (No(Y) || Y.trim() === "") && W(Y);
  }, [Y]), vn(() => {
    No(Y) && ae(At(R, Nn(Y)));
  }, [R]), /* @__PURE__ */ l.jsx(kt.Wrapper, {
    ...P,
    classNames: L,
    styles: I,
    __staticSelector: "ColorInput",
    children: /* @__PURE__ */ l.jsxs(Be, {
      __staticSelector: "ColorInput",
      position: "bottom-start",
      offset: 5,
      opened: A,
      width: F ? "target" : void 0,
      ...i,
      classNames: L,
      styles: I,
      unstyled: r,
      withRoles: !1,
      disabled: S || y === !1 && (!Array.isArray(N) || N.length === 0),
      children: [/* @__PURE__ */ l.jsx(Be.Target, { children: /* @__PURE__ */ l.jsx(kt, {
        autoComplete: "off",
        ...$,
        ...k,
        classNames: L,
        styles: I,
        disabled: D,
        __staticSelector: "ColorInput",
        onFocus: me,
        onBlur: q,
        onClick: K,
        spellCheck: !1,
        value: Y,
        onChange: (ce) => {
          const be = ce.currentTarget.value;
          ae(be), No(be) && w?.(At(R, Nn(be)));
        },
        leftSection: O || (c ? /* @__PURE__ */ l.jsx(xo, {
          color: No(Y) ? Y : "#fff",
          size: "var(--ci-preview-size)",
          ...M("colorPreview")
        }) : null),
        readOnly: s || S,
        pointer: s,
        unstyled: r,
        rightSection: z || (u && !D && !S && fe ? te : null)
      }) }), /* @__PURE__ */ l.jsx(Be.Dropdown, {
        onMouseDown: (ce) => ce.preventDefault(),
        className: Dc.dropdown,
        children: /* @__PURE__ */ l.jsx(ps, {
          __staticSelector: "ColorInput",
          value: Y,
          onChange: ae,
          onChangeEnd: w,
          format: R,
          swatches: N,
          swatchesPerRow: _,
          withPicker: y,
          size: k.size,
          focusable: !1,
          unstyled: r,
          styles: I,
          classNames: L,
          onColorSwatchClick: () => p && B(!1),
          attributes: P.attributes,
          fullWidth: F
        })
      })]
    })
  });
});
or.classes = xt.classes;
or.varsResolver = Ed;
or.displayName = "@mantine/core/ColorInput";
var Rd = {
  root: "m_3eebeb36",
  label: "m_9e365f20"
};
const kv = { orientation: "horizontal" }, Nd = Oe((e, { color: t, variant: n, size: o }) => ({ root: {
  "--divider-color": t ? nt(t, e) : void 0,
  "--divider-border-style": n,
  "--divider-size": $e(o, "divider-size")
} })), ms = se((e) => {
  const t = Z("Divider", kv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, color: c, orientation: u, label: d, labelPosition: p, mod: m, attributes: h, ...g } = t, v = Ie({
    name: "Divider",
    classes: Rd,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: h,
    vars: i,
    varsResolver: Nd
  });
  return /* @__PURE__ */ l.jsx(Q, {
    mod: [{
      orientation: u,
      withLabel: !!d
    }, m],
    role: "separator",
    ...v("root"),
    ...g,
    children: d && /* @__PURE__ */ l.jsx(Q, {
      component: "span",
      mod: { position: p },
      ...v("label"),
      children: d
    })
  });
});
ms.classes = Rd;
ms.varsResolver = Nd;
ms.displayName = "@mantine/core/Divider";
const Pd = xn((e) => {
  const { onChange: t, children: n, multiple: o, accept: r, name: s, form: a, resetRef: i, disabled: c, capture: u, inputProps: d, ref: p, ...m } = Z("FileButton", null, e), h = f.useRef(null), g = () => {
    !c && h.current?.click();
  }, v = (x) => {
    if (x.currentTarget.files === null) return t(o ? [] : null);
    t(o ? Array.from(x.currentTarget.files) : x.currentTarget.files[0] || null);
  };
  return Ol(i, () => {
    h.current && (h.current.value = "");
  }), /* @__PURE__ */ l.jsxs(l.Fragment, { children: [/* @__PURE__ */ l.jsx("input", {
    style: { display: "none" },
    type: "file",
    accept: r,
    multiple: o,
    onChange: v,
    ref: Fe(p, h),
    name: s,
    form: a,
    capture: u,
    ...d
  }), n({
    onClick: g,
    ...m
  })] });
});
Pd.displayName = "@mantine/core/FileButton";
const Ev = ({ value: e }) => /* @__PURE__ */ l.jsx("div", {
  style: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  children: Array.isArray(e) ? e.map((t) => t.name).join(", ") : e?.name
}), Rv = {
  valueComponent: Ev,
  size: "sm"
}, bi = xn((e) => {
  const t = Z([
    "Input",
    "InputWrapper",
    "FileInput"
  ], Rv, e), { unstyled: n, vars: o, onChange: r, value: s, defaultValue: a, multiple: i, accept: c, name: u, form: d, valueComponent: p, clearable: m, clearSectionMode: h, clearButtonProps: g, readOnly: v, capture: w, fileInputProps: x, rightSection: E, size: j, placeholder: k, component: R, resetRef: P, classNames: S, styles: y, attributes: N, ...D } = t, O = f.useRef(null), { resolvedClassNames: z, resolvedStyles: _ } = Zo({
    classNames: S,
    styles: y,
    props: t
  }), [F, $] = Ye({
    value: s,
    defaultValue: a,
    onChange: r,
    finalValue: i ? [] : null
  }), M = Array.isArray(F) ? F.length !== 0 : F !== null, L = /* @__PURE__ */ l.jsx(zl, {
    ...g,
    variant: "subtle",
    onClick: () => $(i ? [] : null),
    size: j,
    unstyled: n
  }), I = m && M && !v;
  return f.useEffect(() => {
    (Array.isArray(F) && F.length === 0 || F === null) && O.current?.();
  }, [F]), /* @__PURE__ */ l.jsx(Pd, {
    onChange: $,
    multiple: i,
    accept: c,
    name: u,
    form: d,
    resetRef: Fe(O, P),
    disabled: v,
    capture: w,
    inputProps: x,
    children: (A) => /* @__PURE__ */ l.jsx(xt, {
      component: R || "button",
      rightSection: E,
      __clearSection: L,
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
      size: j,
      classNames: S,
      styles: y,
      attributes: N,
      children: M ? /* @__PURE__ */ l.jsx(p, { value: F }) : /* @__PURE__ */ l.jsx(kt.Placeholder, {
        __staticSelector: "FileInput",
        classNames: z,
        styles: _,
        attributes: N,
        children: k
      })
    })
  });
});
bi.classes = xt.classes;
bi.displayName = "@mantine/core/FileInput";
const Nv = [
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
], $c = {
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
function Lc(e) {
  Object.keys($c).forEach((t) => {
    e.style.setProperty(t, $c[t], "important");
  });
}
function Pv(e) {
  const t = window.getComputedStyle(e);
  if (t === null) return null;
  const n = {};
  for (const o of Nv) n[o] = t[o];
  return n.boxSizing === "" ? null : {
    sizingStyle: n,
    paddingSize: parseFloat(n.paddingBottom) + parseFloat(n.paddingTop),
    borderSize: parseFloat(n.borderBottomWidth) + parseFloat(n.borderTopWidth)
  };
}
let Ke = null;
function Tv(e, t, n = 1, o = 1 / 0) {
  Ke || (Ke = document.createElement("textarea"), Ke.setAttribute("tabindex", "-1"), Ke.setAttribute("aria-hidden", "true"), Ke.setAttribute("aria-label", "autosize measurement"), Lc(Ke)), Ke.parentNode === null && document.body.appendChild(Ke);
  const { paddingSize: r, borderSize: s, sizingStyle: a } = e, { boxSizing: i } = a;
  Object.keys(a).forEach((m) => {
    Ke.style[m] = a[m];
  }), Lc(Ke), Ke.value = t;
  let c = i === "border-box" ? Ke.scrollHeight + s : Ke.scrollHeight - r;
  Ke.value = t, c = i === "border-box" ? Ke.scrollHeight + s : Ke.scrollHeight - r, Ke.value = "x";
  const u = Ke.scrollHeight - r;
  let d = u * n;
  i === "border-box" && (d = d + r + s), c = Math.max(d, c);
  let p = u * o;
  return i === "border-box" && (p = p + r + s), c = Math.min(p, c), [c, u];
}
function Av({ maxRows: e, minRows: t, onChange: n, ref: o, ...r }) {
  const s = r.value !== void 0, a = f.useRef(null), i = Fe(a, o), c = f.useRef(0), u = f.useRef(0), d = () => {
    const h = a.current;
    if (!h) return;
    const g = Pv(h);
    if (!g) return;
    const [v] = Tv(g, h.value || h.placeholder || "x", t, e);
    c.current !== v && (c.current = v, h.style.setProperty("height", `${v}px`, "important"));
  }, p = f.useEffectEvent(d), m = (h) => {
    s || d(), n?.(h);
  };
  return f.useLayoutEffect(d), f.useEffect(() => {
    const h = () => d();
    return window.addEventListener("resize", h), () => window.removeEventListener("resize", h);
  }, []), f.useEffect(() => {
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
  }, []), f.useEffect(() => {
    const h = () => d();
    return document.fonts.addEventListener("loadingdone", h), () => document.fonts.removeEventListener("loadingdone", h);
  }, []), f.useEffect(() => {
    const h = (g) => {
      if (a.current?.form === g.target && !s) {
        const v = a.current.value;
        requestAnimationFrame(() => {
          a.current && v !== a.current.value && d();
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
const io = se((e) => {
  const { autosize: t, maxRows: n, minRows: o, __staticSelector: r, resize: s, bottomSection: a, bottomSectionProps: i, ...c } = Z([
    "Input",
    "InputWrapper",
    "Textarea"
  ], null, e), u = t && Kl() !== "test", d = u ? {
    maxRows: n,
    minRows: o
  } : {};
  return /* @__PURE__ */ l.jsx(xt, {
    component: u ? Av : "textarea",
    ...c,
    __staticSelector: r || "Textarea",
    __bottomSection: a,
    __bottomSectionProps: i,
    multiline: !0,
    "data-no-overflow": t && n === void 0 || void 0,
    __vars: { "--input-resize": s },
    ...d
  });
});
io.classes = xt.classes;
io.displayName = "@mantine/core/Textarea";
function Td({ size: e, style: t, ...n }) {
  return /* @__PURE__ */ l.jsx("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 5 5",
    style: {
      width: Te(e),
      height: Te(e),
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
const [Iv, Co] = Kt("Modal component was not found in tree");
var rn = {
  root: "m_9df02822",
  content: "m_54c44539",
  inner: "m_1f958f16",
  header: "m_d0e2b9cd"
};
const hs = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ModalBody", null, e), i = Co();
  return /* @__PURE__ */ l.jsx(zu, {
    ...i.getStyles("body", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
hs.classes = rn;
hs.displayName = "@mantine/core/ModalBody";
const gs = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ModalCloseButton", null, e), i = Co();
  return /* @__PURE__ */ l.jsx(_u, {
    ...i.getStyles("close", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
gs.classes = rn;
gs.displayName = "@mantine/core/ModalCloseButton";
const vs = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, children: a, __hidden: i, ...c } = Z("ModalContent", null, e), u = Co(), d = u.scrollAreaComponent || Fg;
  return /* @__PURE__ */ l.jsx(Fu, {
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
    children: /* @__PURE__ */ l.jsx(d, {
      style: { maxHeight: u.fullScreen ? "100dvh" : `calc(100dvh - (${Te(u.yOffset)} * 2))` },
      children: a
    })
  });
});
vs.classes = rn;
vs.displayName = "@mantine/core/ModalContent";
const ys = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ModalHeader", null, e), i = Co();
  return /* @__PURE__ */ l.jsx(Bu, {
    ...i.getStyles("header", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
ys.classes = rn;
ys.displayName = "@mantine/core/ModalHeader";
const bs = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ModalOverlay", null, e), i = Co();
  return /* @__PURE__ */ l.jsx(Vu, {
    ...i.getStyles("overlay", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
bs.classes = rn;
bs.displayName = "@mantine/core/ModalOverlay";
const Mv = {
  __staticSelector: "Modal",
  closeOnClickOutside: !0,
  withinPortal: !0,
  lockScroll: !0,
  trapFocus: !0,
  returnFocus: !0,
  closeOnEscape: !0,
  keepMounted: !1,
  zIndex: vo("modal"),
  transitionProps: {
    duration: 200,
    transition: "fade-down"
  },
  yOffset: "5dvh"
}, Ad = Oe((e, { radius: t, size: n, yOffset: o, xOffset: r }) => ({ root: {
  "--modal-radius": t === void 0 ? void 0 : Rt(t),
  "--modal-size": $e(n, "modal-size"),
  "--modal-y-offset": Te(o),
  "--modal-x-offset": Te(r)
} })), rr = se((e) => {
  const t = Z("ModalRoot", Mv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, yOffset: c, scrollAreaComponent: u, radius: d, fullScreen: p, centered: m, xOffset: h, __staticSelector: g, attributes: v, ...w } = t, x = Ie({
    name: g,
    classes: rn,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: v,
    vars: i,
    varsResolver: Ad
  });
  return /* @__PURE__ */ l.jsx(Iv, {
    value: {
      yOffset: c,
      scrollAreaComponent: u,
      getStyles: x,
      fullScreen: p
    },
    children: /* @__PURE__ */ l.jsx(Lu, {
      ...x("root"),
      "data-full-screen": p || void 0,
      "data-centered": m || void 0,
      "data-offset-scrollbars": u === Cn.Autosize || void 0,
      unstyled: a,
      ...w
    })
  });
});
rr.classes = rn;
rr.varsResolver = Ad;
rr.displayName = "@mantine/core/ModalRoot";
const Id = f.createContext(null);
function Md({ children: e }) {
  const [t, n] = f.useState([]), [o, r] = f.useState(vo("modal")), [s] = f.useState(() => /* @__PURE__ */ new WeakSet());
  return /* @__PURE__ */ l.jsx(Id, {
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
Md.displayName = "@mantine/core/ModalStack";
const ws = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ModalTitle", null, e), i = Co();
  return /* @__PURE__ */ l.jsx(Hu, {
    ...i.getStyles("title", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
ws.classes = rn;
ws.displayName = "@mantine/core/ModalTitle";
const Dv = {
  closeOnClickOutside: !0,
  withinPortal: !0,
  lockScroll: !0,
  trapFocus: !0,
  returnFocus: !0,
  closeOnEscape: !0,
  keepMounted: !1,
  zIndex: vo("modal"),
  transitionProps: {
    duration: 200,
    transition: "fade-down"
  },
  withOverlay: !0,
  withCloseButton: !0
}, dt = se((e) => {
  const { title: t, withOverlay: n, overlayProps: o, withCloseButton: r, closeButtonProps: s, children: a, radius: i, opened: c, stackId: u, zIndex: d, ...p } = Z("Modal", Dv, e), m = f.use(Id), h = !!t || r, g = m && u ? {
    closeOnEscape: m.currentId === u,
    trapFocus: m.currentId === u,
    zIndex: m.getZIndex(u),
    __handledEscapeEvents: m.handledEscapeEvents
  } : {}, v = n === !1 ? !1 : u && m ? m.currentId === u : c;
  return f.useEffect(() => {
    m && u && (c ? m.addModal(u, d || vo("modal")) : m.removeModal(u));
  }, [
    c,
    u,
    d
  ]), /* @__PURE__ */ l.jsxs(rr, {
    radius: i,
    opened: c,
    zIndex: m && u ? m.getZIndex(u) : d,
    ...p,
    ...g,
    children: [n && /* @__PURE__ */ l.jsx(bs, {
      visible: v,
      transitionProps: m && u ? { duration: 0 } : void 0,
      ...o
    }), /* @__PURE__ */ l.jsxs(vs, {
      radius: i,
      __hidden: m && u && c ? u !== m.currentId : !1,
      children: [h && /* @__PURE__ */ l.jsxs(ys, { children: [t && /* @__PURE__ */ l.jsx(ws, { children: t }), r && /* @__PURE__ */ l.jsx(gs, { ...s })] }), /* @__PURE__ */ l.jsx(hs, { children: a })]
    })]
  });
});
dt.classes = rn;
dt.displayName = "@mantine/core/Modal";
dt.Root = rr;
dt.Overlay = bs;
dt.Content = vs;
dt.Body = hs;
dt.Header = ys;
dt.Title = ws;
dt.CloseButton = gs;
dt.Stack = Md;
function Ov(e, t) {
  const n = t.trim().toLowerCase();
  if (n === "") return;
  const o = Object.values(e).filter((r) => !r.disabled && r.label.trim().toLowerCase() === n);
  return o.length === 1 ? o[0] : void 0;
}
function $v(e) {
  return "group" in e;
}
function wi({ data: e }) {
  if ($v(e)) {
    const r = e.items.map((s) => /* @__PURE__ */ l.jsx(wi, { data: s }, s.value));
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
wi.displayName = "@mantine/core/NativeSelectOption";
const Lv = {
  size: "sm",
  rightSectionPointerEvents: "none"
}, co = se((e) => {
  const { data: t, children: n, size: o, error: r, rightSection: s, unstyled: a, ...i } = Z([
    "Input",
    "InputWrapper",
    "NativeSelect"
  ], Lv, e), c = Gu(t).map((u, d) => /* @__PURE__ */ l.jsx(wi, { data: u }, d));
  return /* @__PURE__ */ l.jsx(xt, {
    component: "select",
    ...i,
    __staticSelector: "NativeSelect",
    size: o,
    pointer: !0,
    error: r,
    unstyled: a,
    rightSection: s || /* @__PURE__ */ l.jsx(nr, {
      size: o,
      error: r,
      unstyled: a
    }),
    children: n || c
  });
});
co.classes = xt.classes;
co.displayName = "@mantine/core/NativeSelect";
function Dd(e, t) {
  var n = {};
  for (var o in e)
    Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var r = 0, o = Object.getOwnPropertySymbols(e); r < o.length; r++)
      t.indexOf(o[r]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[r]) && (n[o[r]] = e[o[r]]);
  return n;
}
var lo;
(function(e) {
  e.event = "event", e.props = "prop";
})(lo || (lo = {}));
function un() {
}
function zv(e) {
  var t, n = void 0;
  return function() {
    for (var o = [], r = arguments.length; r--; ) o[r] = arguments[r];
    return t && o.length === t.length && o.every(function(s, a) {
      return s === t[a];
    }) || (t = o, n = e.apply(void 0, o)), n;
  };
}
function Bo(e) {
  return !!(e || "").match(/\d/);
}
function fn(e) {
  return e == null;
}
function _v(e) {
  return typeof e == "number" && isNaN(e);
}
function Od(e) {
  return fn(e) || _v(e) || typeof e == "number" && !isFinite(e);
}
function $d(e) {
  return e.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
}
function Fv(e) {
  switch (e) {
    case "lakh":
      return /(\d+?)(?=(\d\d)+(\d)(?!\d))(\.\d+)?/g;
    case "wan":
      return /(\d)(?=(\d{4})+(?!\d))/g;
    default:
      return /(\d)(?=(\d{3})+(?!\d))/g;
  }
}
function Bv(e, t, n) {
  var o = Fv(n), r = e.search(/[1-9]/);
  return r = r === -1 ? e.length : r, e.substring(0, r) + e.substring(r, e.length).replace(o, "$1" + t);
}
function zc(e) {
  var t = f.useRef(e);
  t.current = e;
  var n = f.useRef(function() {
    for (var o = [], r = arguments.length; r--; ) o[r] = arguments[r];
    return t.current.apply(t, o);
  });
  return n.current;
}
function xi(e, t) {
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
function Vv(e) {
  if (!e)
    return e;
  var t = e[0] === "-";
  t && (e = e.substring(1, e.length));
  var n = e.split("."), o = n[0].replace(/^0+/, "") || "0", r = n[1] || "";
  return (t ? "-" : "") + o + (r ? "." + r : "");
}
function Ld(e, t, n) {
  for (var o = "", r = n ? "0" : "", s = 0; s <= t - 1; s++)
    o += e[s] || r;
  return o;
}
function _c(e, t) {
  return Array(t + 1).join(e);
}
function zd(e) {
  var t = e + "", n = t[0] === "-" ? "-" : "";
  n && (t = t.substring(1));
  var o = t.split(/[eE]/g), r = o[0], s = o[1];
  if (s = Number(s), !s)
    return n + r;
  r = r.replace(".", "");
  var a = 1 + s, i = r.length;
  return a < 0 ? r = "0." + _c("0", Math.abs(a)) + r : a >= i ? r = r + _c("0", a - i) : r = (r.substring(0, a) || "0") + "." + r.substring(a), n + r;
}
function Fc(e, t, n) {
  if (["", "-"].indexOf(e) !== -1)
    return e;
  var o = (e.indexOf(".") !== -1 || n) && t, r = xi(e), s = r.beforeDecimal, a = r.afterDecimal, i = r.hasNegation, c = parseFloat("0." + (a || "0")), u = a.length <= t ? "0." + a : c.toFixed(t), d = u.split("."), p = s;
  s && Number(d[0]) && (p = s.split("").reverse().reduce(function(v, w, x) {
    return v.length > x ? (Number(v[0]) + Number(w)).toString() + v.substring(1, v.length) : w + v;
  }, d[0]));
  var m = Ld(d[1] || "", t, n), h = i ? "-" : "", g = o ? "." : "";
  return "" + h + p + g + m;
}
function Rn(e, t) {
  if (e.value = e.value, e !== null) {
    if (e.createTextRange) {
      var n = e.createTextRange();
      return n.move("character", t), n.select(), !0;
    }
    return e.selectionStart || e.selectionStart === 0 ? (e.focus(), e.setSelectionRange(t, t), !0) : (e.focus(), !1);
  }
}
var _d = zv(function(e, t) {
  for (var n = 0, o = 0, r = e.length, s = t.length; e[n] === t[n] && n < r; )
    n++;
  for (; e[r - 1 - o] === t[s - 1 - o] && s - o > n && r - o > n; )
    o++;
  return {
    from: { start: n, end: r - o },
    to: { start: n, end: s - o }
  };
}), Hv = function(e, t) {
  var n = Math.min(e.selectionStart, t);
  return {
    from: { start: n, end: e.selectionEnd },
    to: { start: n, end: t }
  };
};
function Uv(e, t, n) {
  return Math.min(Math.max(e, t), n);
}
function Vs(e) {
  return Math.max(e.selectionStart, e.selectionEnd);
}
function Wv() {
  return typeof navigator < "u" && !(navigator.platform && /iPhone|iPod/.test(navigator.platform));
}
function qv(e) {
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
function Kv(e) {
  var t = e.currentValue, n = e.formattedValue, o = e.currentValueIndex, r = e.formattedValueIndex;
  return t[o] === n[r];
}
function Xv(e, t, n, o, r, s, a) {
  a === void 0 && (a = Kv);
  var i = r.findIndex(function(k) {
    return k;
  }), c = e.slice(0, i);
  !t && !n.startsWith(c) && (t = c, n = c + n, o = o + c.length);
  for (var u = n.length, d = e.length, p = {}, m = new Array(u), h = 0; h < u; h++) {
    m[h] = -1;
    for (var g = 0, v = d; g < v; g++) {
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
  for (var x = o; x < u && (m[x] === -1 || !s(n[x])); )
    x++;
  var E = x === u || m[x] === -1 ? d : m[x];
  for (x = o - 1; x > 0 && m[x] === -1; )
    x--;
  var j = x === -1 || m[x] === -1 ? 0 : m[x] + 1;
  return j > E ? E : o - j < E - o ? j : E;
}
function Bc(e, t, n, o) {
  var r = e.length;
  if (t = Uv(t, 0, r), o === "left") {
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
function Yv(e) {
  for (var t = Array.from({ length: e.length + 1 }).map(function() {
    return !0;
  }), n = 0, o = t.length; n < o; n++)
    t[n] = !!(Bo(e[n]) || Bo(e[n - 1]));
  return t;
}
function Fd(e, t, n, o, r, s) {
  s === void 0 && (s = un);
  var a = zc(function(g, v) {
    var w, x;
    return Od(g) ? (x = "", w = "") : typeof g == "number" || v ? (x = typeof g == "number" ? zd(g) : g, w = o(x)) : (x = r(g, void 0), w = o(x)), { formattedValue: w, numAsString: x };
  }), i = f.useState(function() {
    return a(fn(e) ? t : e, n);
  }), c = i[0], u = i[1], d = zc(function(g, v) {
    g.formattedValue !== c.formattedValue && u({
      formattedValue: g.formattedValue,
      numAsString: g.value
    }), s(g, v);
  }), p = e, m = n;
  fn(e) && (p = c.numAsString, m = !0);
  var h = a(p, m);
  return f.useMemo(function() {
    u(h);
  }, [h.formattedValue]), f.useEffect(function() {
    if (!fn(t) && fn(e) && c.formattedValue !== "") {
      var g = parseFloat(c.numAsString);
      d({
        formattedValue: c.formattedValue,
        value: c.numAsString,
        floatValue: isNaN(g) ? void 0 : g
      }, { event: void 0, source: lo.props });
    }
  }, []), [c, d];
}
function Gv(e) {
  return e.replace(/[^0-9]/g, "");
}
function Jv(e) {
  return e;
}
function Zv(e) {
  var t = e.type;
  t === void 0 && (t = "text");
  var n = e.displayType;
  n === void 0 && (n = "input");
  var o = e.customInput, r = e.renderText, s = e.getInputRef, a = e.format;
  a === void 0 && (a = Jv);
  var i = e.removeFormatting;
  i === void 0 && (i = Gv);
  var c = e.defaultValue, u = e.valueIsNumericString, d = e.onValueChange, p = e.isAllowed, m = e.onChange;
  m === void 0 && (m = un);
  var h = e.onKeyDown;
  h === void 0 && (h = un);
  var g = e.onMouseUp;
  g === void 0 && (g = un);
  var v = e.onFocus;
  v === void 0 && (v = un);
  var w = e.onBlur;
  w === void 0 && (w = un);
  var x = e.value, E = e.getCaretBoundary;
  E === void 0 && (E = Yv);
  var j = e.isValidInputCharacter;
  j === void 0 && (j = Bo);
  var k = e.isCharacterSame, R = Dd(e, ["type", "displayType", "customInput", "renderText", "getInputRef", "format", "removeFormatting", "defaultValue", "valueIsNumericString", "onValueChange", "isAllowed", "onChange", "onKeyDown", "onMouseUp", "onFocus", "onBlur", "value", "getCaretBoundary", "isValidInputCharacter", "isCharacterSame"]), P = Fd(x, c, !!u, a, i, d), S = P[0], y = S.formattedValue, N = S.numAsString, D = P[1], O = f.useRef(), z = f.useRef({ formattedValue: y, numAsString: N }), _ = function(V, X) {
    z.current = { formattedValue: V.formattedValue, numAsString: V.value }, D(V, X);
  }, F = f.useState(!1), $ = F[0], M = F[1], L = f.useRef(null), I = f.useRef({
    setCaretTimeout: null,
    focusTimeout: null
  });
  f.useEffect(function() {
    return M(!0), function() {
      clearTimeout(I.current.setCaretTimeout), clearTimeout(I.current.focusTimeout);
    };
  }, []);
  var A = a, B = function(V, X) {
    var le = parseFloat(X);
    return {
      formattedValue: V,
      value: X,
      floatValue: isNaN(le) ? void 0 : le
    };
  }, U = function(V, X, le) {
    V.selectionStart === 0 && V.selectionEnd === V.value.length || (Rn(V, X), I.current.setCaretTimeout = setTimeout(function() {
      V.value === le && V.selectionStart !== X && Rn(V, X);
    }, 0));
  }, W = function(V, X, le) {
    return Bc(V, X, E(V), le);
  }, Y = function(V, X, le) {
    var Ce = E(X), Ae = Xv(X, y, V, le, Ce, j, k);
    return Ae = Bc(X, Ae, Ce), Ae;
  }, ae = function(V) {
    var X = V.formattedValue;
    X === void 0 && (X = "");
    var le = V.input, Ce = V.source, Ae = V.event, he = V.numAsString, ge;
    if (le) {
      var we = V.inputValue || le.value, Me = Vs(le);
      le.value = X, ge = Y(we, X, Me), ge !== void 0 && U(le, ge, X);
    }
    X !== y && _(B(X, he), { event: Ae, source: Ce });
  };
  f.useEffect(function() {
    var V = z.current, X = V.formattedValue, le = V.numAsString;
    (y !== X || N !== le) && _(B(y, N), {
      event: void 0,
      source: lo.props
    });
  }, [y, N]);
  var fe = L.current ? Vs(L.current) : void 0, ie = typeof window < "u" ? f.useLayoutEffect : f.useEffect;
  ie(function() {
    var V = L.current;
    if (y !== z.current.formattedValue && V) {
      var X = Y(z.current.formattedValue, y, fe);
      V.value = y, U(V, X, y);
    }
  }, [y]);
  var te = function(V, X, le) {
    var Ce = X.target, Ae = O.current ? Hv(O.current, Ce.selectionEnd) : _d(y, V), he = Object.assign(Object.assign({}, Ae), { lastValue: y }), ge = i(V, he), we = A(ge);
    if (ge = i(we, void 0), p && !p(B(we, ge))) {
      var Me = X.target, de = Vs(Me), gt = Y(V, y, de);
      return Me.value = y, U(Me, gt, y), !1;
    }
    return ae({
      formattedValue: we,
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
    var X = V.target, le = X.value, Ce = te(le, V, lo.event);
    Ce && m(V), O.current = void 0;
  }, K = function(V) {
    var X = V.target, le = V.key, Ce = X.selectionStart, Ae = X.selectionEnd, he = X.value;
    he === void 0 && (he = "");
    var ge;
    le === "ArrowLeft" || le === "Backspace" ? ge = Math.max(Ce - 1, 0) : le === "ArrowRight" ? ge = Math.min(Ce + 1, he.length) : le === "Delete" && (ge = Ce);
    var we = 0;
    le === "Delete" && Ce === Ae && (we = 1);
    var Me = le === "ArrowLeft" || le === "ArrowRight";
    if (ge === void 0 || Ce !== Ae && !Me) {
      h(V), me(X, we);
      return;
    }
    var de = ge;
    if (Me) {
      var gt = le === "ArrowLeft" ? "left" : "right";
      de = W(he, ge, gt), de !== ge && V.preventDefault();
    } else le === "Delete" && !j(he[ge]) ? de = W(he, ge, "right") : le === "Backspace" && !j(he[ge]) && (de = W(he, ge, "left"));
    de !== ge && U(X, de, he), h(V), me(X, we);
  }, ce = function(V) {
    var X = V.target, le = function() {
      var Ce = X.selectionStart, Ae = X.selectionEnd, he = X.value;
      if (he === void 0 && (he = ""), Ce === Ae) {
        var ge = W(he, Ce);
        ge !== Ce && U(X, ge, he);
      }
    };
    le(), requestAnimationFrame(function() {
      le();
    }), g(V), me(X);
  }, be = function(V) {
    V.persist && V.persist();
    var X = V.target, le = V.currentTarget;
    L.current = X, I.current.focusTimeout = setTimeout(function() {
      var Ce = X.selectionStart, Ae = X.selectionEnd, he = X.value;
      he === void 0 && (he = "");
      var ge = W(he, Ce);
      ge !== Ce && !(Ce === 0 && Ae === he.length) && U(X, ge, he), v(Object.assign(Object.assign({}, V), { currentTarget: le }));
    }, 0);
  }, pe = function(V) {
    L.current = null, clearTimeout(I.current.focusTimeout), clearTimeout(I.current.setCaretTimeout), w(V);
  }, Se = $ && Wv() ? "numeric" : void 0, ne = Object.assign({ inputMode: Se }, R, {
    type: t,
    value: y,
    onChange: q,
    onKeyDown: K,
    onMouseUp: ce,
    onFocus: be,
    onBlur: pe
  });
  if (n === "text")
    return r ? ln.createElement(ln.Fragment, null, r(y, R) || null) : ln.createElement("span", Object.assign({}, R, { ref: s }), y);
  if (o) {
    var H = o;
    return ln.createElement(H, Object.assign({}, ne, { ref: s }));
  }
  return ln.createElement("input", Object.assign({}, ne, { ref: s }));
}
function Vc(e, t) {
  var n = t.decimalScale, o = t.fixedDecimalScale, r = t.prefix;
  r === void 0 && (r = "");
  var s = t.suffix;
  s === void 0 && (s = "");
  var a = t.allowNegative, i = t.thousandsGroupStyle;
  if (i === void 0 && (i = "thousand"), e === "" || e === "-")
    return e;
  var c = xs(t), u = c.thousandSeparator, d = c.decimalSeparator, p = n !== 0 && e.indexOf(".") !== -1 || n && o, m = xi(e, a), h = m.beforeDecimal, g = m.afterDecimal, v = m.addNegation;
  return n !== void 0 && (g = Ld(g, n, !!o)), u && (h = Bv(h, u, i)), r && (h = r + h), s && (g = g + s), v && (h = "-" + h), e = h + (p && d || "") + g, e;
}
function xs(e) {
  var t = e.decimalSeparator;
  t === void 0 && (t = ".");
  var n = e.thousandSeparator, o = e.allowedDecimalSeparators;
  return n === !0 && (n = ","), o || (o = [t, "."]), {
    decimalSeparator: t,
    thousandSeparator: n,
    allowedDecimalSeparators: o
  };
}
function Qv(e, t) {
  e === void 0 && (e = "");
  var n = new RegExp("(-)"), o = new RegExp("(-)(.)*(-)"), r = n.test(e), s = o.test(e);
  return e = e.replace(/-/g, ""), r && !s && t && (e = "-" + e), e;
}
function ey(e, t) {
  return new RegExp("(^-)|[0-9]|" + $d(e), "g");
}
function ty(e, t, n) {
  return e === "" ? !0 : !t?.match(/\d/) && !n?.match(/\d/) && typeof e == "string" && !isNaN(Number(e));
}
function ny(e, t, n) {
  var o;
  t === void 0 && (t = qv(e));
  var r = n.allowNegative, s = n.prefix;
  s === void 0 && (s = "");
  var a = n.suffix;
  a === void 0 && (a = "");
  var i = n.decimalScale, c = t.from, u = t.to, d = u.start, p = u.end, m = xs(n), h = m.allowedDecimalSeparators, g = m.decimalSeparator, v = e[p] === g;
  if (Bo(e) && (e === s || e === a) && t.lastValue === "")
    return e;
  if (p - d === 1 && h.indexOf(e[d]) !== -1) {
    var w = i === 0 ? "" : g;
    e = e.substring(0, d) + w + e.substring(d + 1, e.length);
  }
  var x = function(L, I, A) {
    var B = !1, U = !1;
    s.startsWith("-") ? B = !1 : L.startsWith("--") ? (B = !1, U = !0) : a.startsWith("-") && L.length === a.length ? B = !1 : L[0] === "-" && (B = !0);
    var W = B ? 1 : 0;
    return U && (W = 2), W && (L = L.substring(W), I -= W, A -= W), { value: L, start: I, end: A, hasNegation: B };
  }, E = x(e, d, p), j = E.hasNegation;
  o = E, e = o.value, d = o.start, p = o.end;
  var k = x(t.lastValue, c.start, c.end), R = k.start, P = k.end, S = k.value, y = e.substring(d, p);
  e.length && S.length && (R > S.length - a.length || P < s.length) && !(y && a.startsWith(y)) && (e = S);
  var N = 0;
  e.startsWith(s) ? N += s.length : d < s.length && (N = d), e = e.substring(N), p -= N;
  var D = e.length, O = e.length - a.length;
  e.endsWith(a) ? D = O : (p > O || p > e.length - a.length) && (D = p), e = e.substring(0, D), e = Qv(j ? "-" + e : e, r), e = (e.match(ey(g)) || []).join("");
  var z = e.indexOf(g);
  e = e.replace(new RegExp($d(g), "g"), function(L, I) {
    return I === z ? "." : "";
  });
  var _ = xi(e, r), F = _.beforeDecimal, $ = _.afterDecimal, M = _.addNegation;
  return u.end - u.start < c.end - c.start && F === "" && v && !parseFloat($) && (e = M ? "-" : ""), e;
}
function oy(e, t) {
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
function ry(e) {
  var t = xs(e), n = t.thousandSeparator, o = t.decimalSeparator, r = e.prefix;
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
function sy(e) {
  e = ry(e), e.decimalSeparator, e.allowedDecimalSeparators, e.thousandsGroupStyle;
  var t = e.suffix, n = e.allowNegative, o = e.allowLeadingZeros, r = e.onKeyDown;
  r === void 0 && (r = un);
  var s = e.onBlur;
  s === void 0 && (s = un);
  var a = e.thousandSeparator, i = e.decimalScale, c = e.fixedDecimalScale, u = e.prefix;
  u === void 0 && (u = "");
  var d = e.defaultValue, p = e.value, m = e.valueIsNumericString, h = e.onValueChange, g = Dd(e, ["decimalSeparator", "allowedDecimalSeparators", "thousandsGroupStyle", "suffix", "allowNegative", "allowLeadingZeros", "onKeyDown", "onBlur", "thousandSeparator", "decimalScale", "fixedDecimalScale", "prefix", "defaultValue", "value", "valueIsNumericString", "onValueChange"]), v = xs(e), w = v.decimalSeparator, x = v.allowedDecimalSeparators, E = function(M) {
    return Vc(M, e);
  }, j = function(M, L) {
    return ny(M, L, e);
  }, k = fn(p) ? d : p, R = m ?? ty(k, u, t);
  fn(p) ? fn(d) || (R = R || typeof d == "number") : R = R || typeof p == "number";
  var P = function(M) {
    return Od(M) ? M : (typeof M == "number" && (M = zd(M)), R && typeof i == "number" ? Fc(M, i, !!c) : M);
  }, S = Fd(P(p), P(d), !!R, E, j, h), y = S[0], N = y.numAsString, D = y.formattedValue, O = S[1], z = function(M) {
    var L = M.target, I = M.key, A = L.selectionStart, B = L.selectionEnd, U = L.value;
    if (U === void 0 && (U = ""), (I === "Backspace" || I === "Delete") && B < u.length && U !== "-") {
      M.preventDefault();
      return;
    }
    if (A !== B) {
      r(M);
      return;
    }
    I === "Backspace" && U[0] === "-" && A === u.length + 1 && n && Rn(L, 1), i && c && (I === "Backspace" && U[A - 1] === w ? (Rn(L, A - 1), M.preventDefault()) : I === "Delete" && U[A] === w && M.preventDefault()), x?.includes(I) && U[A] === w && Rn(L, A + 1);
    var W = a === !0 ? "," : a;
    I === "Backspace" && U[A - 1] === W && Rn(L, A - 1), I === "Delete" && U[A] === W && Rn(L, A + 1), r(M);
  }, _ = function(M) {
    var L = N;
    if (L.match(/\d/g) || (L = ""), o || (L = Vv(L)), c && i && (L = Fc(L, i, c)), L !== N) {
      var I = Vc(L, e);
      O({
        formattedValue: I,
        value: L,
        floatValue: parseFloat(L)
      }, {
        event: M,
        source: lo.event
      });
    }
    s(M);
  }, F = function(M) {
    return M === w ? !0 : Bo(M);
  }, $ = function(M) {
    var L = M.currentValue, I = M.lastValue, A = M.formattedValue, B = M.currentValueIndex, U = M.formattedValueIndex, W = L[B], Y = A[U], ae = _d(I, L), fe = ae.to, ie = function(te) {
      return j(te).indexOf(".") + u.length;
    };
    return p === 0 && c && i && L[fe.start] === w && ie(L) < B && ie(A) > U ? !1 : B >= fe.start && B < fe.end && x && x.includes(W) && Y === w ? !0 : W === Y;
  };
  return Object.assign(Object.assign({}, g), {
    value: D,
    valueIsNumericString: !1,
    isValidInputCharacter: F,
    isCharacterSame: $,
    onValueChange: O,
    format: E,
    removeFormatting: j,
    getCaretBoundary: function(M) {
      return oy(M, e);
    },
    onKeyDown: z,
    onBlur: _
  });
}
function ay(e) {
  var t = sy(e);
  return ln.createElement(Zv, Object.assign({}, t));
}
function Hc(e, t) {
  return /\d/.test(e) || e === t;
}
function iy(e, t, n, o) {
  let r = 0;
  for (let s = 0; s < t && s < e.length; s += 1) Hc(e[s], o) && (r += 1);
  if (r === 0) return Math.min(t, n.length);
  for (let s = 0; s < n.length; s += 1) if (Hc(n[s], o) && (r -= 1, r === 0))
    return s + 1;
  return n.length;
}
function cy(e, t) {
  let n = 0;
  for (; t + n < e.length && /\d/.test(e[t + n]); ) n += 1;
  return n;
}
function ly(e, { decimalSeparator: t, thousandSeparator: n, allowedDecimalSeparators: o, thousandsGroupStyle: r }) {
  const s = new Set([...o, t].filter((h) => h.length === 1)), a = e.split(""), i = a.reduce((h, g, v) => (s.has(g) && h.push(v), h), []);
  if (i.length === 0) return e;
  const c = i[i.length - 1], u = a[c], d = i.filter((h) => a[h] === u).length, p = r === "wan" ? 4 : 3;
  let m = -1;
  return d === 1 && (u === t ? m = c : u === n ? m = cy(e, c + 1) === p ? -1 : c : m = c), a.map((h, g) => g === m ? t : s.has(h) && h !== n ? "" : h).join("");
}
function Uc({ direction: e, style: t, ...n }) {
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
var pa = {
  root: "m_e2f5cd4e",
  controls: "m_95e17d22",
  control: "m_80b4b171"
};
const uy = /^(0\.0*|-0(\.0*)?)$/, Wc = /^-?0\d+(\.\d+)?\.?$/, dy = /\.\d*0$/, Bd = /^-?\d+\.$/;
function ma(e) {
  return typeof e == "string" && e !== "" && !Number.isNaN(Number(e));
}
function Hs(e) {
  return typeof e == "bigint";
}
function Us(e) {
  return typeof e == "number" ? e < Number.MAX_SAFE_INTEGER : e === "" || ma(e) && Number(e) < Number.MAX_SAFE_INTEGER;
}
function Vd(e, t) {
  return e === "" || e === "-" || !t && e.startsWith("-") ? !1 : /^-?\d+$/.test(e);
}
function Ws(e, t) {
  return typeof e == "bigint" ? !0 : e === "" || Vd(e, t);
}
function Po(e) {
  if (!/^-?\d+$/.test(e)) return null;
  try {
    return BigInt(e);
  } catch {
    return null;
  }
}
function Sr(e) {
  if (typeof e == "bigint") return e;
  if (typeof e == "number" && Number.isFinite(e) && Number.isInteger(e)) return BigInt(e);
}
function Tr(e, t, n) {
  return t !== void 0 && e < t ? t : n !== void 0 && e > n ? n : e;
}
function fy(e) {
  return e.toString().replace(".", "").length;
}
function py(e, t) {
  return (typeof e == "number" ? e < Number.MAX_SAFE_INTEGER : !Number.isNaN(Number(e))) && !Number.isNaN(e) && fy(t) < 14 && t !== "";
}
function my(e, t, n) {
  return e === void 0 ? !0 : (t === void 0 || e >= t) && (n === void 0 || e <= n);
}
const qs = {
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
}, Hd = Oe((e, { size: t }) => ({ controls: { "--ni-chevron-size": $e(t, "ni-chevron-size") } }));
function qc(e, t) {
  return t ? `${e}.` : e;
}
function hy(e, t) {
  const n = Bd.test(e), o = t.trim ? e.replace(/^0+(?=\d)/, "") : e, r = parseFloat(o);
  if (Number.isNaN(r)) return o;
  if (!t.clamp) return t.trim ? qc(r, n) : e;
  const s = r > Number.MAX_SAFE_INTEGER && t.max !== void 0 ? t.max : hn(r, t.min, t.max);
  return !t.trim && s === r ? e : qc(s, n);
}
function gy(e, t) {
  if (e === "" || e === "-") return e;
  const n = Po(e);
  return n === null ? e : t.clampBehavior === "blur" ? Tr(n, t.min, t.max) : n;
}
const Vo = xn((e) => {
  const t = Z([
    "Input",
    "InputWrapper",
    "NumberInput"
  ], qs, e), { className: n, classNames: o, styles: r, unstyled: s, vars: a, onChange: i, onValueChange: c, value: u, defaultValue: d, max: p, min: m, step: h, hideControls: g, rightSection: v, isAllowed: w, clampBehavior: x, onBlur: E, allowDecimal: j, decimalScale: k, onKeyDown: R, onKeyDownCapture: P, handlersRef: S, startValue: y, disabled: N, rightSectionPointerEvents: D, allowNegative: O, readOnly: z, size: _, rightSectionWidth: F, stepHoldInterval: $, stepHoldDelay: M, allowLeadingZeros: L, withKeyboardEvents: I, trimLeadingZeroesOnBlur: A, allowedDecimalSeparators: B, selectAllOnFocus: U, onMinReached: W, onMaxReached: Y, onFocus: ae, attributes: fe, ref: ie, ...te } = t, me = O ?? !0, q = L ?? !0, K = Ie({
    name: "NumberInput",
    classes: pa,
    props: t,
    classNames: o,
    styles: r,
    unstyled: s,
    attributes: fe,
    vars: a,
    varsResolver: Hd
  }), { resolvedClassNames: ce, resolvedStyles: be } = Zo({
    classNames: o,
    styles: r,
    props: t
  }), pe = f.useRef(Hs(u) || Hs(d) ? "bigint" : "number");
  Hs(u) ? pe.current = "bigint" : typeof u == "number" && (pe.current = "number");
  const Se = pe.current === "bigint", [ne, H] = Ye({
    value: u,
    defaultValue: d,
    finalValue: "",
    onChange: i
  }), V = M !== void 0 && $ !== void 0, X = f.useRef(null), le = f.useRef(null), Ce = f.useRef(0), Ae = typeof m == "number" ? m : void 0, he = typeof p == "number" ? p : void 0, ge = typeof h == "number" ? h : qs.step, we = typeof y == "number" ? y : qs.startValue, Me = Sr(m), de = Sr(p), gt = Sr(h) ?? BigInt(1), Ne = Sr(y) ?? BigInt(0), vt = (G) => !Vd(G, me) || q && Wc.test(G) ? G : Po(G) ?? G, Ln = (G) => {
    const re = Number(G);
    return Number.isSafeInteger(re) ? re : void 0;
  }, Pt = (G, re) => {
    re.source === "event" && H(Se ? vt(G.value) : py(G.floatValue, G.value) && !uy.test(G.value) && !(q && Wc.test(G.value)) && !dy.test(G.value) && !Bd.test(G.value) ? G.floatValue : G.value), c?.(G, re);
  }, sn = (G) => {
    const re = String(G).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    return re ? Math.max(0, (re[1] ? re[1].length : 0) - (re[2] ? +re[2] : 0)) : 0;
  }, Tt = (G) => {
    X.current && typeof G < "u" && X.current.setSelectionRange(G, G);
  }, zn = f.useRef($r);
  zn.current = () => {
    if (Se) {
      if (!Ws(ne, me)) return;
      let We;
      const qe = ne;
      if (typeof qe == "bigint") {
        const st = qe + gt;
        de !== void 0 && st > de && Y?.(), We = de !== void 0 && st > de ? de : st;
      } else if (typeof qe == "string" && qe !== "") {
        const st = Po(qe);
        if (st === null) return;
        const cn = st + gt;
        de !== void 0 && cn > de && Y?.(), We = de !== void 0 && cn > de ? de : cn;
      } else We = Tr(Ne, Me, de);
      const Xe = We.toString();
      H(We), c?.({
        floatValue: Ln(We),
        formattedValue: Xe,
        value: Xe
      }, { source: "increment" }), setTimeout(() => Tt(X.current?.value.length), 0);
      return;
    }
    if (!Us(ne)) return;
    let G;
    const re = sn(ne), Fn = sn(ge), Bn = Math.max(re, Fn), yt = 10 ** Bn;
    if (!ma(ne) && (typeof ne != "number" || Number.isNaN(ne))) G = hn(we, Ae, he);
    else if (he !== void 0) {
      const We = (Math.round(Number(ne) * yt) + Math.round(ge * yt)) / yt;
      We > he && Y?.(), G = We <= he ? We : he;
    } else G = (Math.round(Number(ne) * yt) + Math.round(ge * yt)) / yt;
    const Ze = G.toFixed(Bn);
    H(parseFloat(Ze)), c?.({
      floatValue: parseFloat(Ze),
      formattedValue: Ze,
      value: Ze
    }, { source: "increment" }), setTimeout(() => Tt(X.current?.value.length), 0);
  };
  const _n = f.useRef($r);
  _n.current = () => {
    if (Se) {
      if (!Ws(ne, me)) return;
      let qe;
      const Xe = Me !== void 0 ? Me : me ? void 0 : BigInt(0), st = ne;
      if (typeof st == "bigint") {
        const Vn = st - gt;
        Xe !== void 0 && Vn < Xe && W?.(), qe = Xe !== void 0 && Vn < Xe ? Xe : Vn;
      } else if (typeof st == "string" && st !== "") {
        const Vn = Po(st);
        if (Vn === null) return;
        const Is = Vn - gt;
        Xe !== void 0 && Is < Xe && W?.(), qe = Xe !== void 0 && Is < Xe ? Xe : Is;
      } else qe = Tr(Ne, Xe, de);
      const cn = qe.toString();
      H(qe), c?.({
        floatValue: Ln(qe),
        formattedValue: cn,
        value: cn
      }, { source: "decrement" }), setTimeout(() => Tt(X.current?.value.length), 0);
      return;
    }
    if (!Us(ne)) return;
    let G;
    const re = Ae !== void 0 ? Ae : me ? Number.MIN_SAFE_INTEGER : 0, Fn = sn(ne), Bn = sn(ge), yt = Math.max(Fn, Bn), Ze = 10 ** yt;
    if (!ma(ne) && typeof ne != "number" || Number.isNaN(ne)) G = hn(we, re, he);
    else {
      const qe = (Math.round(Number(ne) * Ze) - Math.round(ge * Ze)) / Ze;
      re !== void 0 && qe < re && W?.(), G = re !== void 0 && qe < re ? re : qe;
    }
    const We = G.toFixed(yt);
    H(parseFloat(We)), c?.({
      floatValue: parseFloat(We),
      formattedValue: We,
      value: We
    }, { source: "decrement" }), setTimeout(() => Tt(X.current?.value.length), 0);
  };
  const Ge = (G) => {
    const re = G.clipboardData.getData("text"), Fn = te.decimalSeparator || ".", Bn = te.thousandSeparator === !0 ? "," : te.thousandSeparator === !1 ? void 0 : te.thousandSeparator, yt = ly(re, {
      decimalSeparator: Fn,
      thousandSeparator: Bn,
      allowedDecimalSeparators: B || [".", ","],
      thousandsGroupStyle: te.thousandsGroupStyle
    });
    if (yt !== re) {
      G.preventDefault();
      const Ze = X.current;
      if (Ze) {
        const We = Ze.selectionStart ?? 0, qe = Ze.selectionEnd ?? 0, Xe = Ze.value, st = Xe.substring(0, We) + yt + Xe.substring(qe);
        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set?.call(Ze, st), Ze.dispatchEvent(new Event("change", { bubbles: !0 }));
        const cn = We + yt.length;
        setTimeout(() => Tt(iy(st, cn, Ze.value, Fn)), 0);
      }
    }
    te.onPaste?.(G);
  }, Ft = (G) => {
    R?.(G), !(z || !I) && (G.key === "ArrowUp" && (G.preventDefault(), zn.current?.()), G.key === "ArrowDown" && (G.preventDefault(), _n.current?.()));
  }, gr = (G) => {
    if (P?.(G), G.key === "Backspace") {
      const re = X.current;
      re && re.selectionStart === 0 && re.selectionStart === re.selectionEnd && (G.preventDefault(), window.setTimeout(() => Tt(0), 0));
    }
  }, vr = (G) => {
    U && window.setTimeout(() => X.current?.select(), 0), ae?.(G);
  }, As = (G) => {
    let re = ne;
    Se ? (x === "blur" && typeof re == "bigint" && (re = Tr(re, Me, de)), A && typeof re == "string" && (re = gy(re, {
      min: Me,
      max: de,
      clampBehavior: x
    }))) : typeof re == "number" ? x === "blur" && (re = hn(re, Ae, he)) : typeof re == "string" && (re = hy(re, {
      min: Ae,
      max: he,
      trim: !!A && sn(re) < 15,
      clamp: x === "blur"
    })), ne !== re && H(re), E?.(G);
  };
  Ol(S, {
    increment: zn.current,
    decrement: _n.current
  });
  const yr = (G) => {
    G ? zn.current?.() : _n.current?.(), Ce.current += 1;
  }, He = (G) => {
    if (yr(G), V) {
      const re = typeof $ == "number" ? $ : $(Ce.current);
      le.current = window.setTimeout(() => He(G), re);
    }
  }, Je = (G, re) => {
    G.preventDefault(), X.current?.focus(), yr(re), V && (le.current = window.setTimeout(() => He(re), M));
  }, an = () => {
    le.current && window.clearTimeout(le.current), le.current = null, Ce.current = 0;
  }, np = /* @__PURE__ */ l.jsxs("div", {
    ...K("controls"),
    children: [/* @__PURE__ */ l.jsx(so, {
      ...K("control"),
      tabIndex: -1,
      "aria-hidden": !0,
      disabled: N || typeof ne == "number" && he !== void 0 && ne >= he || typeof ne == "bigint" && de !== void 0 && ne >= de,
      mod: { direction: "up" },
      onMouseDown: (G) => G.preventDefault(),
      onPointerDown: (G) => {
        Je(G, !0);
      },
      onPointerUp: an,
      onPointerLeave: an,
      children: /* @__PURE__ */ l.jsx(Uc, { direction: "up" })
    }), /* @__PURE__ */ l.jsx(so, {
      ...K("control"),
      tabIndex: -1,
      "aria-hidden": !0,
      disabled: N || typeof ne == "number" && Ae !== void 0 && ne <= Ae || typeof ne == "bigint" && Me !== void 0 && ne <= Me,
      mod: { direction: "down" },
      onMouseDown: (G) => G.preventDefault(),
      onPointerDown: (G) => {
        Je(G, !1);
      },
      onPointerUp: an,
      onPointerLeave: an,
      children: /* @__PURE__ */ l.jsx(Uc, { direction: "down" })
    })]
  });
  return /* @__PURE__ */ l.jsx(xt, {
    component: ay,
    allowNegative: O,
    className: en(pa.root, n),
    size: _,
    ...te,
    inputMode: Se ? "numeric" : "decimal",
    readOnly: z,
    disabled: N,
    value: typeof ne == "bigint" ? ne.toString() : ne,
    getInputRef: Fe(ie, X),
    onValueChange: Pt,
    rightSection: g || z || !(Se ? Ws(ne, me) : Us(ne)) ? v : v || np,
    classNames: ce,
    styles: be,
    unstyled: s,
    __staticSelector: "NumberInput",
    decimalScale: Se ? 0 : j ? k : 0,
    onPaste: Ge,
    onFocus: vr,
    onKeyDown: Ft,
    onKeyDownCapture: gr,
    rightSectionPointerEvents: D ?? (N ? "none" : void 0),
    rightSectionWidth: F ?? `var(--ni-right-section-width-${_ || "sm"})`,
    allowLeadingZeros: L,
    allowedDecimalSeparators: B,
    onBlur: As,
    attributes: fe,
    isAllowed: (G) => {
      if (!(!w || w(G))) return !1;
      if (x !== "strict") return !0;
      if (!Se) return my(G.floatValue, Ae, he);
      if (G.value === "" || G.value === "-") return !0;
      const re = Po(G.value);
      return re === null ? !0 : (Me === void 0 || re >= Me) && (de === void 0 || re <= de);
    }
  });
});
Vo.classes = {
  ...xt.classes,
  ...pa
};
Vo.varsResolver = Hd;
Vo.displayName = "@mantine/core/NumberInput";
const Si = f.createContext(null), Ci = xn(((e) => {
  const { value: t, defaultValue: n, onChange: o, size: r, wrapperProps: s, children: a, name: i, readOnly: c, disabled: u, ...d } = Z("RadioGroup", null, e), p = _t(i), [m, h] = Ye({
    value: t,
    defaultValue: n,
    finalValue: "",
    onChange: o
  }), g = (v) => !c && h(typeof v == "string" ? v : v.currentTarget.value);
  return /* @__PURE__ */ l.jsx(Si, {
    value: {
      value: m,
      onChange: g,
      size: r,
      name: p,
      disabled: u
    },
    children: /* @__PURE__ */ l.jsx(kt.Wrapper, {
      size: r,
      ...s,
      ...d,
      labelElement: "div",
      __staticSelector: "RadioGroup",
      children: /* @__PURE__ */ l.jsx(sd, {
        role: "radiogroup",
        children: a
      })
    })
  });
}));
Ci.classes = kt.Wrapper.classes;
Ci.displayName = "@mantine/core/RadioGroup";
var Ud = { card: "m_9dc8ae12" };
const Wd = f.createContext(null), vy = { withBorder: !0 }, qd = Oe((e, { radius: t }) => ({ card: { "--card-radius": Rt(t) } })), Ss = se((e) => {
  const t = Z("RadioCard", vy, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, checked: c, mod: u, withBorder: d, value: p, onClick: m, name: h, onKeyDown: g, attributes: v, ...w } = t, x = Ie({
    name: "RadioCard",
    classes: Ud,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: v,
    vars: i,
    varsResolver: qd,
    rootSelector: "card"
  }), { dir: E } = yo(), j = f.use(Si), k = typeof c == "boolean" ? c : j?.value === p || !1, R = h || j?.name, P = (S) => {
    if (g?.(S), !!R && [
      "ArrowDown",
      "ArrowUp",
      "ArrowLeft",
      "ArrowRight"
    ].includes(S.nativeEvent.code)) {
      S.preventDefault();
      const y = Array.from(document.querySelectorAll(`[role="radio"][name="${R}"]`)), N = y.findIndex((z) => z === S.target), D = N + 1 >= y.length ? 0 : N + 1, O = N - 1 < 0 ? y.length - 1 : N - 1;
      S.nativeEvent.code === "ArrowDown" && (y[D].focus(), y[D].click()), S.nativeEvent.code === "ArrowUp" && (y[O].focus(), y[O].click()), S.nativeEvent.code === "ArrowLeft" && (y[E === "ltr" ? O : D].focus(), y[E === "ltr" ? O : D].click()), S.nativeEvent.code === "ArrowRight" && (y[E === "ltr" ? D : O].focus(), y[E === "ltr" ? D : O].click());
    }
  };
  return /* @__PURE__ */ l.jsx(Wd, {
    value: { checked: k },
    children: /* @__PURE__ */ l.jsx(so, {
      mod: [{
        "with-border": d,
        checked: k
      }, u],
      ...x("card"),
      ...w,
      role: "radio",
      "aria-checked": k,
      name: R,
      onClick: (S) => {
        m?.(S), j?.onChange(p || "");
      },
      onKeyDown: P
    })
  });
});
Ss.displayName = "@mantine/core/RadioCard";
Ss.classes = Ud;
Ss.varsResolver = qd;
var Kd = {
  indicator: "m_717d7ff6",
  icon: "m_3e4da632",
  "indicator--outline": "m_2980836c"
};
const yy = { icon: Td }, Xd = Oe((e, { radius: t, color: n, size: o, iconColor: r, variant: s, autoContrast: a }) => {
  const i = Jr({
    color: n || e.primaryColor,
    theme: e
  }), c = i.isThemeColor && i.shade === void 0 ? `var(--mantine-color-${i.color}-outline)` : i.color;
  return { indicator: {
    "--radio-size": $e(o, "radio-size"),
    "--radio-radius": t === void 0 ? void 0 : Rt(t),
    "--radio-color": s === "outline" ? c : nt(n, e),
    "--radio-icon-size": typeof o == "number" ? `calc(${$e(o, "radio-size")} * 0.4)` : $e(o, "radio-icon-size"),
    "--radio-icon-color": r ? nt(r, e) : er(a, e) ? go({
      color: n,
      theme: e,
      autoContrast: a
    }) : void 0
  } };
}), Cs = se((e) => {
  const t = Z("RadioIndicator", yy, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, icon: c, radius: u, color: d, iconColor: p, autoContrast: m, checked: h, mod: g, variant: v, disabled: w, attributes: x, ...E } = t, j = Ie({
    name: "RadioIndicator",
    classes: Kd,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: x,
    vars: i,
    varsResolver: Xd,
    rootSelector: "indicator"
  }), k = f.use(Wd), R = typeof h == "boolean" ? h : k?.checked || !1;
  return /* @__PURE__ */ l.jsx(Q, {
    ...j("indicator", { variant: v }),
    variant: v,
    mod: [{
      checked: R,
      disabled: w
    }, g],
    ...E,
    children: /* @__PURE__ */ l.jsx(c, { ...j("icon") })
  });
});
Cs.displayName = "@mantine/core/RadioIndicator";
Cs.classes = Kd;
Cs.varsResolver = Xd;
var Yd = {
  root: "m_f3f1af94",
  inner: "m_89c4f5e4",
  icon: "m_f3ed6b2b",
  radio: "m_8a3dbb89",
  "radio--outline": "m_1bfe9d39"
};
const by = {
  labelPosition: "right",
  withErrorStyles: !0
}, Gd = Oe((e, { size: t, radius: n, color: o, iconColor: r, variant: s, autoContrast: a }) => {
  const i = Jr({
    color: o || e.primaryColor,
    theme: e
  }), c = i.isThemeColor && i.shade === void 0 ? `var(--mantine-color-${i.color}-outline)` : i.color;
  return { root: {
    "--radio-size": $e(t, "radio-size"),
    "--radio-radius": n === void 0 ? void 0 : Rt(n),
    "--radio-color": s === "outline" ? c : nt(o, e),
    "--radio-icon-color": r ? nt(r, e) : er(a, e) ? go({
      color: o,
      theme: e,
      autoContrast: a
    }) : void 0,
    "--radio-icon-size": $e(t, "radio-icon-size")
  } };
}), bn = se((e) => {
  const t = Z("Radio", by, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, id: c, size: u, label: d, labelPosition: p, description: m, error: h, radius: g, color: v, variant: w, disabled: x, wrapperProps: E, icon: j = Td, rootRef: k, iconColor: R, onChange: P, mod: S, attributes: y, withErrorStyles: N, checked: D, ...O } = t, z = Ie({
    name: "Radio",
    classes: Yd,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: y,
    vars: i,
    varsResolver: Gd
  }), _ = f.use(Si), F = _?.size ?? u, $ = t.size ? u : F, { styleProps: M, rest: L } = Al(O), I = _t(c), A = [
    m ? `${I}-description` : void 0,
    h && typeof h != "boolean" ? `${I}-error` : void 0,
    L["aria-describedby"]
  ].filter(Boolean).join(" ") || void 0, B = _ ? _.value === L.value : void 0, U = {
    checked: B ?? D,
    name: L.name ?? _?.name,
    onChange: (W) => {
      _?.onChange(W), P?.(W);
    },
    disabled: _?.disabled ?? x
  };
  return /* @__PURE__ */ l.jsx(hi, {
    ...z("root"),
    __staticSelector: "Radio",
    __stylesApiProps: t,
    id: I,
    size: $,
    labelPosition: p,
    label: d,
    description: m,
    error: h,
    disabled: U.disabled,
    classNames: n,
    styles: s,
    unstyled: a,
    "data-checked": (B ?? D) || void 0,
    variant: w,
    ref: k,
    mod: S,
    attributes: y,
    ...M,
    ...E,
    children: /* @__PURE__ */ l.jsxs(Q, {
      ...z("inner"),
      mod: { "label-position": p },
      children: [/* @__PURE__ */ l.jsx(Q, {
        ...z("radio", {
          focusable: !0,
          variant: w
        }),
        ...L,
        ...U,
        component: "input",
        mod: {
          error: !!h,
          "with-error-styles": N
        },
        id: I,
        type: "radio",
        "aria-describedby": A
      }), /* @__PURE__ */ l.jsx(j, {
        ...z("icon"),
        "aria-hidden": !0
      })]
    })
  });
});
bn.classes = Yd;
bn.varsResolver = Gd;
bn.displayName = "@mantine/core/Radio";
bn.Group = Ci;
bn.Card = Ss;
bn.Indicator = Cs;
var Jd = {
  root: "m_cf365364",
  indicator: "m_9e182ccd",
  label: "m_1738fcb2",
  input: "m_1714d588",
  control: "m_69686b9b",
  innerLabel: "m_78882f40"
};
const wy = { withItemsBorders: !0 }, Zd = Oe((e, { radius: t, color: n, transitionDuration: o, size: r, transitionTimingFunction: s }) => ({ root: {
  "--sc-radius": t === void 0 ? void 0 : Rt(t),
  "--sc-color": n ? nt(n, e) : void 0,
  "--sc-shadow": n ? void 0 : "var(--mantine-shadow-xs)",
  "--sc-transition-duration": o === void 0 ? void 0 : `${o}ms`,
  "--sc-transition-timing-function": s,
  "--sc-padding": $e(r, "sc-padding"),
  "--sc-font-size": Dr(r)
} })), sr = xn((e) => {
  const t = Z("SegmentedControl", wy, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, data: c, value: u, defaultValue: d, onChange: p, size: m, name: h, disabled: g, readOnly: v, fullWidth: w, orientation: x, radius: E, color: j, transitionDuration: k, transitionTimingFunction: R, variant: P, autoContrast: S, withItemsBorders: y, mod: N, attributes: D, ref: O, ...z } = t, _ = Ie({
    name: "SegmentedControl",
    props: t,
    classes: Jd,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: D,
    vars: i,
    varsResolver: Zd
  }), F = Jo(), $ = c.map((K) => tm(K) ? {
    label: `${K}`,
    value: K
  } : K), M = Kp(), [L, I] = f.useState(Qi()), [A, B] = f.useState(null), [U, W] = f.useState({}), Y = (K, ce) => {
    K === null || U[ce] === K || (U[ce] = K, W({ ...U }));
  }, [ae, fe] = Ye({
    value: u,
    defaultValue: d,
    finalValue: Array.isArray(c) ? $.find((K) => !K.disabled)?.value ?? c[0]?.value ?? null : null,
    onChange: p
  }), ie = _t(h), te = $.map((K) => `${K.value}`), me = $.map((K) => /* @__PURE__ */ f.createElement(Q, {
    ..._("control"),
    mod: {
      active: ae === K.value,
      orientation: x
    },
    key: `${K.value}`
  }, /* @__PURE__ */ f.createElement("input", {
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
  }), /* @__PURE__ */ f.createElement(Q, {
    component: "label",
    ..._("label"),
    mod: {
      active: ae === K.value && !(g || K.disabled),
      disabled: g || K.disabled,
      "read-only": v
    },
    htmlFor: `${ie}-${K.value}`,
    ref: (ce) => Y(ce, `${K.value}`),
    __vars: { "--sc-label-color": j !== void 0 ? go({
      color: j,
      theme: F,
      autoContrast: S
    }) : void 0 },
    key: `${K.value}-label`
  }, /* @__PURE__ */ l.jsx("span", {
    ..._("innerLabel"),
    children: K.label
  })))), q = Fe(O, B);
  return oc(() => {
    I(Qi());
  }, [c.length]), oc(() => {
    W((K) => {
      const ce = {};
      return te.forEach((be) => {
        be in K && (ce[be] = K[be]);
      }), Object.keys(ce).length === Object.keys(K).length ? K : ce;
    });
  }, [te]), c.length === 0 ? null : /* @__PURE__ */ l.jsxs(Q, {
    ..._("root"),
    variant: P,
    size: m,
    ref: q,
    mod: [{
      "full-width": w,
      orientation: x,
      initialized: M,
      "with-items-borders": y
    }, N],
    ...z,
    role: "radiogroup",
    "data-disabled": g,
    children: [typeof ae < "u" && /* @__PURE__ */ l.jsx(cs, {
      target: U[`${ae}`],
      parent: A,
      component: "span",
      transitionDuration: "var(--sc-transition-duration)",
      ..._("indicator")
    }, L), me]
  });
});
sr.classes = Jd;
sr.varsResolver = Zd;
sr.displayName = "@mantine/core/SegmentedControl";
const xy = {
  size: "sm",
  withCheckIcon: !0,
  allowDeselect: !0,
  checkIconPosition: "left",
  openOnFocus: !0
}, no = xn((e) => {
  const t = Z([
    "Input",
    "InputWrapper",
    "Select"
  ], xy, e), { classNames: n, styles: o, unstyled: r, vars: s, dropdownOpened: a, defaultDropdownOpened: i, onDropdownClose: c, onDropdownOpen: u, onFocus: d, onBlur: p, onClick: m, onChange: h, data: g, value: v, defaultValue: w, selectFirstOptionOnChange: x, selectFirstOptionOnDropdownOpen: E, onOptionSubmit: j, comboboxProps: k, readOnly: R, disabled: P, filter: S, limit: y, withScrollArea: N, maxDropdownHeight: D, floatingHeight: O, size: z, searchable: _, rightSection: F, checkIconPosition: $, withCheckIcon: M, withAlignedLabels: L, nothingFoundMessage: I, name: A, form: B, searchValue: U, defaultSearchValue: W, onSearchChange: Y, allowDeselect: ae, error: fe, rightSectionPointerEvents: ie, id: te, clearable: me, clearSectionMode: q, clearButtonProps: K, hiddenInputProps: ce, renderOption: be, onClear: pe, autoComplete: Se, scrollAreaProps: ne, __defaultRightSection: H, __clearSection: V, __clearable: X, chevronColor: le, autoSelectOnBlur: Ce, openOnFocus: Ae, attributes: he, ...ge } = t, we = f.useMemo(() => Gu(g), [g]), Me = f.useRef({}), de = f.useMemo(() => Ju(we), [we]), gt = _t(te), [Ne, vt, Ln] = Ye({
    value: v,
    defaultValue: w,
    finalValue: null,
    onChange: h
  }), Pt = Ne != null ? `${Ne}` in de ? de[`${Ne}`] : Me.current[`${Ne}`] : void 0, sn = Hp(Pt), [Tt, zn, _n] = Ye({
    value: U,
    defaultValue: W,
    finalValue: Pt ? Pt.label : "",
    onChange: Y
  }), Ge = di({
    opened: a,
    defaultOpened: i,
    onDropdownOpen: () => {
      u?.(), E ? Ge.selectFirstOption() : Ge.updateSelectedOptionIndex("active", { scrollIntoView: !0 });
    },
    onDropdownClose: () => {
      c?.(), setTimeout(Ge.resetSelectedOption, 0);
    }
  }), Ft = (He) => {
    zn(He), Ge.resetSelectedOption();
  }, { resolvedClassNames: gr, resolvedStyles: vr } = Zo({
    props: t,
    styles: o,
    classNames: n
  });
  f.useEffect(() => {
    x && Ge.selectFirstOption();
  }, [x, Tt]), f.useEffect(() => {
    v === null && Ft(""), v != null && Pt && (sn?.value !== Pt.value || sn?.label !== Pt.label) && Ft(Pt.label);
  }, [v, Pt]), f.useEffect(() => {
    !Ln && !_n && Ft(Ne != null ? `${Ne}` in de ? de[`${Ne}`]?.label : Me.current[`${Ne}`]?.label || "" : "");
  }, [de, Ne]), f.useEffect(() => {
    Ne && `${Ne}` in de && (Me.current[`${Ne}`] = de[`${Ne}`]);
  }, [de, Ne]);
  const As = /* @__PURE__ */ l.jsx(xe.ClearButton, {
    ...K,
    onClear: () => {
      vt(null, null), Ft(""), pe?.();
    }
  }), yr = me && Ne != null && !P && !R;
  return /* @__PURE__ */ l.jsxs(l.Fragment, { children: [/* @__PURE__ */ l.jsxs(xe, {
    store: Ge,
    __staticSelector: "Select",
    classNames: gr,
    styles: vr,
    unstyled: r,
    readOnly: R,
    size: z,
    attributes: he,
    floatingHeight: O,
    keepMounted: Ce,
    onOptionSubmit: (He) => {
      j?.(He);
      const Je = ae && `${de[He].value}` == `${Ne}` ? null : de[He], an = Je ? Je.value : null;
      an !== Ne && vt(an, Je), !Ln && Ft(an != null && Je?.label || ""), Ge.closeDropdown();
    },
    ...k,
    children: [/* @__PURE__ */ l.jsx(xe.Target, {
      targetType: _ ? "input" : "button",
      autoComplete: Se,
      withExpandedAttribute: !0,
      children: /* @__PURE__ */ l.jsx(xt, {
        id: gt,
        __defaultRightSection: /* @__PURE__ */ l.jsx(xe.Chevron, {
          size: z,
          error: fe,
          unstyled: r,
          color: le
        }),
        __clearSection: As,
        __clearable: yr,
        __clearSectionMode: q,
        rightSection: F,
        rightSectionPointerEvents: ie || "none",
        ...ge,
        size: z,
        __staticSelector: "Select",
        disabled: P,
        readOnly: R || !_,
        value: Tt,
        onChange: (He) => {
          if (fv(He)) {
            if (!R) {
              const Je = Ov(de, He.currentTarget.value);
              Je && `${Je.value}` != `${Ne}` && (vt(Je.value, Je), !Ln && Ft(Je.label));
            }
            return;
          }
          Ft(He.currentTarget.value), Ge.openDropdown(), x && Ge.selectFirstOption();
        },
        onFocus: (He) => {
          Ae && _ && Ge.openDropdown(), d?.(He);
        },
        onBlur: (He) => {
          Ce && Ge.clickSelectedOption(), Ge.closeDropdown();
          const Je = Ne != null && (`${Ne}` in de ? de[`${Ne}`] : Me.current[`${Ne}`]);
          Ft(Je && Je.label || ""), p?.(He);
        },
        onClick: (He) => {
          _ ? Ge.openDropdown() : Ge.toggleDropdown(), m?.(He);
        },
        classNames: gr,
        styles: vr,
        unstyled: r,
        pointer: !_,
        error: fe,
        attributes: he
      })
    }), /* @__PURE__ */ l.jsx(dv, {
      data: we,
      hidden: R || P,
      filter: S,
      search: Tt,
      limit: y,
      hiddenWhenEmpty: !I,
      withScrollArea: N,
      maxDropdownHeight: D,
      filterOptions: !!_ && Pt?.label !== Tt,
      value: Ne,
      checkIconPosition: $,
      withCheckIcon: M,
      withAlignedLabels: L,
      nothingFoundMessage: I,
      unstyled: r,
      labelId: ge.label ? `${gt}-label` : void 0,
      "aria-label": ge.label ? void 0 : ge["aria-label"],
      renderOption: be,
      scrollAreaProps: ne
    })]
  }), /* @__PURE__ */ l.jsx(xe.HiddenInput, {
    value: Ne,
    name: A,
    form: B,
    disabled: P,
    ...ce
  })] });
});
no.classes = {
  ...xt.classes,
  ...xe.classes
};
no.displayName = "@mantine/core/Select";
const [Sy, Cy] = Kt("Table component was not found in the tree");
var ar = {
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
function jy(e, t) {
  if (!t) return;
  const n = {};
  return t.columnBorder && e.withColumnBorders && (n["data-with-column-border"] = !0), t.rowBorder && e.withRowBorders && (n["data-with-row-border"] = !0), t.striped && e.striped && (n["data-striped"] = e.striped), t.highlightOnHover && e.highlightOnHover && (n["data-hover"] = !0), t.captionSide && e.captionSide && (n["data-side"] = e.captionSide), t.stickyHeader && e.stickyHeader && (n["data-sticky"] = !0), n;
}
function On(e, t) {
  const n = `Table${e.charAt(0).toUpperCase()}${e.slice(1)}`, o = se((r) => {
    const s = Z(n, {}, r), { classNames: a, className: i, style: c, styles: u, ...d } = s, p = Cy();
    return /* @__PURE__ */ l.jsx(Q, {
      component: e,
      ...jy(p, t),
      ...p.getStyles(e, {
        className: i,
        classNames: a,
        style: c,
        styles: u,
        props: s
      }),
      ...d
    });
  });
  return o.displayName = `@mantine/core/${n}`, o.classes = ar, o;
}
const ha = On("th", { columnBorder: !0 }), Qd = On("td", { columnBorder: !0 }), Ar = On("tr", {
  rowBorder: !0,
  striped: !0,
  highlightOnHover: !0
}), ef = On("thead", { stickyHeader: !0 }), tf = On("tbody"), nf = On("tfoot"), of = On("caption", { captionSide: !0 }), ky = { type: "scrollarea" }, rf = Oe((e, { minWidth: t, maxHeight: n, type: o }) => ({ scrollContainer: {
  "--table-min-width": Te(t),
  "--table-max-height": Te(n),
  "--table-overflow": o === "native" ? "auto" : void 0
} })), js = se((e) => {
  const t = Z("TableScrollContainer", ky, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, children: c, minWidth: u, maxHeight: d, type: p, scrollAreaProps: m, attributes: h, ...g } = t, v = Ie({
    name: "TableScrollContainer",
    classes: ar,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: h,
    vars: i,
    varsResolver: rf,
    rootSelector: "scrollContainer"
  });
  return /* @__PURE__ */ l.jsx(Q, {
    component: p === "scrollarea" ? Cn : "div",
    ...p === "scrollarea" ? d ? {
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
js.classes = ar;
js.varsResolver = rf;
js.displayName = "@mantine/core/TableScrollContainer";
function ji({ data: e }) {
  return /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
    e.caption && /* @__PURE__ */ l.jsx(of, { children: e.caption }),
    e.head && /* @__PURE__ */ l.jsx(ef, { children: /* @__PURE__ */ l.jsx(Ar, { children: e.head.map((t, n) => /* @__PURE__ */ l.jsx(ha, { children: t }, n)) }) }),
    e.body && /* @__PURE__ */ l.jsx(tf, { children: e.body.map((t, n) => /* @__PURE__ */ l.jsx(Ar, { children: t.map((o, r) => /* @__PURE__ */ l.jsx(Qd, { children: o }, r)) }, n)) }),
    e.foot && /* @__PURE__ */ l.jsx(nf, { children: /* @__PURE__ */ l.jsx(Ar, { children: e.foot.map((t, n) => /* @__PURE__ */ l.jsx(ha, { children: t }, n)) }) })
  ] });
}
ji.displayName = "@mantine/core/TableDataRenderer";
const Ey = {
  withRowBorders: !0,
  verticalSpacing: 7
}, sf = Oe((e, { layout: t, captionSide: n, horizontalSpacing: o, verticalSpacing: r, borderColor: s, stripedColor: a, highlightOnHoverColor: i, striped: c, highlightOnHover: u, stickyHeaderOffset: d, stickyHeader: p }) => ({ table: {
  "--table-layout": t,
  "--table-caption-side": n,
  "--table-horizontal-spacing": $o(o),
  "--table-vertical-spacing": $o(r),
  "--table-border-color": s ? nt(s, e) : void 0,
  "--table-striped-color": c && a ? nt(a, e) : void 0,
  "--table-highlight-on-hover-color": u && i ? nt(i, e) : void 0,
  "--table-sticky-header-offset": p ? Te(d) : void 0
} })), tt = se((e) => {
  const t = Z("Table", Ey, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, horizontalSpacing: c, verticalSpacing: u, captionSide: d, stripedColor: p, highlightOnHoverColor: m, striped: h, highlightOnHover: g, withColumnBorders: v, withRowBorders: w, withTableBorder: x, borderColor: E, layout: j, data: k, children: R, stickyHeader: P, stickyHeaderOffset: S, mod: y, tabularNums: N, attributes: D, ...O } = t, z = Ie({
    name: "Table",
    props: t,
    className: o,
    style: r,
    classes: ar,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: D,
    rootSelector: "table",
    vars: i,
    varsResolver: sf,
    stable: !0
  }), _ = h === !0 ? "odd" : h || void 0, F = d || "bottom", $ = f.useMemo(() => ({
    getStyles: z,
    stickyHeader: P,
    striped: _,
    highlightOnHover: g,
    withColumnBorders: v,
    withRowBorders: w,
    captionSide: F
  }), [
    z,
    P,
    _,
    g,
    v,
    w,
    F
  ]);
  return /* @__PURE__ */ l.jsx(Sy, {
    value: $,
    children: /* @__PURE__ */ l.jsx(Q, {
      component: "table",
      mod: [{
        withTableBorder: x,
        tabularNums: N
      }, y],
      ...z("table"),
      ...O,
      children: R || !!k && /* @__PURE__ */ l.jsx(ji, { data: k })
    })
  });
});
tt.classes = ar;
tt.varsResolver = sf;
tt.displayName = "@mantine/core/Table";
tt.Td = Qd;
tt.Th = ha;
tt.Tr = Ar;
tt.Thead = ef;
tt.Tbody = tf;
tt.Tfoot = nf;
tt.Caption = of;
tt.ScrollContainer = js;
tt.DataRenderer = ji;
const [Ry, ki] = Kt("Tabs component was not found in the tree");
var ir = {
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
const Ei = se((e) => {
  const t = Z("TabsList", null, e), { children: n, className: o, grow: r, justify: s, classNames: a, styles: i, style: c, mod: u, ...d } = t, p = ki();
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
    ...d,
    children: n
  });
});
Ei.classes = ir;
Ei.displayName = "@mantine/core/TabsList";
const Ri = se((e) => {
  const t = Z("TabsPanel", null, e), { children: n, className: o, value: r, classNames: s, styles: a, style: i, mod: c, keepMounted: u, ...d } = t, p = Ta(), m = ki();
  f.useEffect(() => (m.setMountedPanel(r, !0), () => {
    m.setMountedPanel(r, !1);
  }), [r]);
  const h = m.value === r, g = m.keepMounted || u, v = m.keepMountedMode !== "display-none", w = g && v && p !== "test" ? /* @__PURE__ */ l.jsx(f.Activity, {
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
    ...d,
    children: w
  });
});
Ri.classes = ir;
Ri.displayName = "@mantine/core/TabsPanel";
const Ni = se((e) => {
  const t = Z("TabsTab", null, e), { className: n, children: o, rightSection: r, leftSection: s, value: a, onClick: i, onKeyDown: c, disabled: u, color: d, style: p, classNames: m, styles: h, vars: g, mod: v, tabIndex: w, ...x } = t, E = Jo(), { dir: j } = yo(), k = ki(), R = a === k.value, P = (y) => {
    k.onChange(k.allowTabDeactivation && a === k.value ? null : a), i?.(y);
  }, S = {
    classNames: m,
    styles: h,
    props: t
  };
  return /* @__PURE__ */ l.jsxs(so, {
    ...k.getStyles("tab", {
      className: n,
      style: p,
      variant: k.variant,
      ...S
    }),
    disabled: u,
    unstyled: k.unstyled,
    variant: k.variant,
    mod: [{
      active: R,
      disabled: u,
      orientation: k.orientation,
      inverted: k.inverted,
      placement: k.orientation === "vertical" && k.placement
    }, v],
    role: "tab",
    id: k.getTabId(a),
    "aria-selected": R,
    tabIndex: w !== void 0 ? w : R || k.value === null ? 0 : -1,
    "aria-controls": k.mountedPanels.current.has(a) ? k.getPanelId(a) : void 0,
    onClick: P,
    __vars: { "--tabs-color": d ? nt(d, E) : void 0 },
    onKeyDown: _l({
      siblingSelector: '[role="tab"]',
      parentSelector: '[role="tablist"]',
      activateOnFocus: k.activateTabWithKeyboard,
      loop: k.loop,
      orientation: k.orientation || "horizontal",
      dir: j,
      onKeyDown: c
    }),
    ...x,
    children: [
      s && /* @__PURE__ */ l.jsx("span", {
        ...k.getStyles("tabSection", S),
        "data-position": "left",
        children: s
      }),
      o && /* @__PURE__ */ l.jsx("span", {
        ...k.getStyles("tabLabel", S),
        children: o
      }),
      r && /* @__PURE__ */ l.jsx("span", {
        ...k.getStyles("tabSection", S),
        "data-position": "right",
        children: r
      })
    ]
  });
});
Ni.classes = ir;
Ni.displayName = "@mantine/core/TabsTab";
const Kc = "Tabs.Tab or Tabs.Panel component was rendered with invalid value or without value", Ny = {
  keepMounted: !0,
  keepMountedMode: "activity",
  orientation: "horizontal",
  loop: !0,
  activateTabWithKeyboard: !0,
  variant: "default",
  placement: "left"
}, af = Oe((e, { radius: t, color: n, autoContrast: o }) => ({ root: {
  "--tabs-radius": Rt(t),
  "--tabs-color": nt(n, e),
  "--tabs-text-color": er(o, e) ? go({
    color: n,
    theme: e,
    autoContrast: o
  }) : void 0
} })), ft = se((e) => {
  const t = Z("Tabs", Ny, e), { defaultValue: n, value: o, onChange: r, orientation: s, children: a, loop: i, id: c, activateTabWithKeyboard: u, allowTabDeactivation: d, variant: p, color: m, radius: h, inverted: g, placement: v, keepMounted: w, keepMountedMode: x, classNames: E, styles: j, unstyled: k, className: R, style: P, vars: S, autoContrast: y, mod: N, attributes: D, ...O } = t, z = _t(c), _ = f.useRef(/* @__PURE__ */ new Set()), F = zp(), $ = f.useCallback((A, B) => {
    const U = _.current;
    B && !U.has(A) ? (U.add(A), F()) : !B && U.has(A) && (U.delete(A), F());
  }, []), [M, L] = Ye({
    value: o,
    defaultValue: n,
    finalValue: null,
    onChange: r
  }), I = Ie({
    name: "Tabs",
    props: t,
    classes: ir,
    className: R,
    style: P,
    classNames: E,
    styles: j,
    unstyled: k,
    attributes: D,
    vars: S,
    varsResolver: af
  });
  return /* @__PURE__ */ l.jsx(Ry, {
    value: {
      placement: v,
      value: M,
      orientation: s,
      id: z,
      loop: i,
      activateTabWithKeyboard: u,
      getTabId: Or(`${z}-tab`, Kc),
      getPanelId: Or(`${z}-panel`, Kc),
      onChange: L,
      allowTabDeactivation: d,
      variant: p,
      color: m,
      radius: h,
      inverted: g,
      keepMounted: w,
      keepMountedMode: x,
      unstyled: k,
      getStyles: I,
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
      }, N],
      ...I("root"),
      ...O,
      children: a
    })
  });
});
ft.classes = ir;
ft.varsResolver = af;
ft.displayName = "@mantine/core/Tabs";
ft.Tab = Ni;
ft.Panel = Ri;
ft.List = Ei;
const lt = se((e) => {
  const t = Z([
    "Input",
    "InputWrapper",
    "TextInput"
  ], null, e);
  return /* @__PURE__ */ l.jsx(xt, {
    component: "input",
    ...t,
    __staticSelector: "TextInput"
  });
});
lt.classes = xt.classes;
lt.displayName = "@mantine/core/TextInput";
function Ho(e, t) {
  for (const n of t) {
    if (n.value === e) return n;
    if (Array.isArray(n.children)) {
      const o = Ho(e, n.children);
      if (o) return o;
    }
  }
  return null;
}
function Br(e, t, n = []) {
  const o = Ho(e, t);
  return o ? !Array.isArray(o.children) || o.children.length === 0 ? [o.value] : (o.children.forEach((r) => {
    Array.isArray(r.children) && r.children.length > 0 ? Br(r.value, t, n) : n.push(r.value);
  }), n) : n;
}
function cf(e) {
  return e.reduce((t, n) => (Array.isArray(n.children) && n.children.length > 0 ? t.push(...cf(n.children)) : t.push(n.value), t), []);
}
function ks(e, t, n = []) {
  const o = [];
  for (const r of e) if (Array.isArray(r.children) && r.children.length > 0) {
    const s = ks(r.children, t, n);
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
function Py(e, t, n) {
  return n.length === 0 ? !1 : n.includes(e) ? !0 : ks(t, n).result.some((o) => o.value === e && o.checked);
}
const Ty = Xl(Py);
function Ay(e, t, n) {
  return n.length === 0 ? !1 : ks(t, n).result.some((o) => o.value === e && o.indeterminate);
}
const Iy = Xl(Ay);
function lf(e, t, n, o = {}) {
  return t.forEach((r) => {
    o[r.value] = r.value in e ? e[r.value] : r.value === n, Array.isArray(r.children) && lf(e, r.children, n, o);
  }), o;
}
function My(e, t, n) {
  if (n) return e;
  const o = [];
  return e.forEach((r) => o.push(...Br(r, t))), Array.from(new Set(o));
}
function uf(e) {
  const t = [];
  for (const n of e)
    t.push(n.value), Array.isArray(n.children) && n.children.length > 0 && t.push(...uf(n.children));
  return t;
}
function df({ initialSelectedState: e = [], expandedState: t, initialCheckedState: n = [], checkedState: o, initialExpandedState: r = {}, selectedState: s, multiple: a = !1, onNodeCollapse: i, onNodeExpand: c, onCheckedStateChange: u, onSelectedStateChange: d, onExpandedStateChange: p, onLoadChildren: m, checkStrictly: h = !1 } = {}) {
  const [g, v] = f.useState([]), [w, x] = Ye({
    value: t,
    defaultValue: r,
    finalValue: {},
    onChange: p
  }), [E, j] = Ye({
    value: s,
    defaultValue: e,
    finalValue: [],
    onChange: d
  }), [k, R] = Ye({
    value: o,
    defaultValue: n,
    finalValue: [],
    onChange: u
  }), [P, S] = f.useState(null), y = f.useRef(/* @__PURE__ */ new Set()), N = f.useRef(/* @__PURE__ */ new Set()), [D, O] = f.useState([]), [z, _] = f.useState({}), F = f.useCallback((H) => {
    x(lf(w, H, E)), R(My(k, H, h)), v(H);
  }, [
    E,
    k,
    w,
    h
  ]), $ = f.useCallback(async (H) => {
    if (m && !(y.current.has(H) || N.current.has(H))) {
      y.current.add(H), O(Array.from(y.current)), _((V) => {
        if (!(H in V)) return V;
        const X = { ...V };
        return delete X[H], X;
      });
      try {
        await m(H), N.current.add(H);
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
  }, [m]), M = f.useCallback((H) => {
    if (!m) return;
    const V = Ho(H, g);
    V && V.hasChildren && !Array.isArray(V.children) && $(H);
  }, [
    m,
    g,
    $
  ]), L = f.useCallback((H) => {
    const V = {
      ...w,
      [H]: !w[H]
    };
    V[H] ? c?.(H) : i?.(H), V[H] && M(H), x(V);
  }, [
    i,
    c,
    w,
    M
  ]), I = f.useCallback((H) => {
    w[H] !== !1 && i?.(H), x({
      ...w,
      [H]: !1
    });
  }, [i, w]), A = f.useCallback((H) => {
    w[H] !== !0 && c?.(H), M(H), x({
      ...w,
      [H]: !0
    });
  }, [
    c,
    w,
    M
  ]), B = f.useCallback(() => {
    const H = { ...w };
    Object.keys(H).forEach((V) => {
      H[V] = !0, M(V);
    }), x(H);
  }, [w, M]), U = f.useCallback(() => {
    const H = { ...w };
    Object.keys(H).forEach((V) => {
      H[V] = !1;
    }), x(H);
  }, [w]), W = f.useCallback((H) => {
    if (!a)
      return E.includes(H) ? (S(null), []) : (S(H), [H]);
    if (E.includes(H))
      return S(null), E.filter((V) => V !== H);
    S(H), j([...E, H]);
  }, [E]), Y = f.useCallback((H) => {
    S(H), j(a ? E.includes(H) ? E : [...E, H] : [H]);
  }, [E]), ae = f.useCallback((H) => {
    P === H && S(null), j(E.filter((V) => V !== H));
  }, [E]), fe = f.useCallback(() => {
    j([]), S(null);
  }, []), ie = f.useCallback((H) => {
    if (h)
      k.includes(H) || R([...k, H]);
    else {
      const V = Br(H, g);
      R(Array.from(/* @__PURE__ */ new Set([...k, ...V])));
    }
  }, [
    g,
    k,
    h
  ]), te = f.useCallback((H) => {
    if (h) R(k.filter((V) => V !== H));
    else {
      const V = Br(H, g);
      R(k.filter((X) => !V.includes(X)));
    }
  }, [
    g,
    k,
    h
  ]), me = f.useCallback(() => {
    R(h ? uf(g) : cf(g));
  }, [g, h]), q = f.useCallback(() => {
    R([]);
  }, []), K = f.useCallback(() => h ? k.map((H) => {
    const V = Ho(H, g);
    return {
      checked: !0,
      indeterminate: !1,
      value: H,
      hasChildren: V ? Array.isArray(V.children) && V.children.length > 0 || !!V.hasChildren : !1
    };
  }) : ks(g, k).result, [
    h,
    k,
    g
  ]), ce = f.useCallback((H) => h ? k.includes(H) : Ty(H, g, k), [
    h,
    k,
    g
  ]), be = f.useCallback((H) => h ? !1 : Iy(H, g, k), [
    h,
    k,
    g
  ]), pe = f.useCallback((H) => D.includes(H), [D]), Se = f.useCallback((H) => z[H] || null, [z]), ne = f.useCallback((H) => {
    N.current.delete(H), _((V) => {
      if (!(H in V)) return V;
      const X = { ...V };
      return delete X[H], X;
    });
  }, []);
  return f.useMemo(() => ({
    checkStrictly: h,
    multiple: a,
    expandedState: w,
    selectedState: E,
    checkedState: k,
    anchorNode: P,
    initialize: F,
    toggleExpanded: L,
    collapse: I,
    expand: A,
    expandAllNodes: B,
    collapseAllNodes: U,
    setExpandedState: x,
    checkNode: ie,
    uncheckNode: te,
    checkAllNodes: me,
    uncheckAllNodes: q,
    setCheckedState: R,
    toggleSelected: W,
    select: Y,
    deselect: ae,
    clearSelected: fe,
    setSelectedState: j,
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
    w,
    E,
    k,
    P,
    F,
    L,
    I,
    A,
    B,
    U,
    x,
    ie,
    te,
    me,
    q,
    R,
    W,
    Y,
    ae,
    fe,
    j,
    K,
    ce,
    be,
    pe,
    Se,
    $,
    ne
  ]);
}
function Dy(e, t, n) {
  const o = Ho(t, e);
  if (!o || !o.children) return !1;
  function r(s) {
    for (const a of s)
      if (a.value === n || a.children && r(a.children)) return !0;
    return !1;
  }
  return r(o.children);
}
function Oy(e, t, n, o) {
  const r = t.getBoundingClientRect(), s = e.clientY - r.top, a = r.height;
  return n ? o ? s < a * 0.5 ? "before" : "inside" : s < a * 0.25 ? "before" : s > a * 0.75 ? "after" : "inside" : s < a * 0.5 ? "before" : "after";
}
const $y = {
  elementProps: {},
  dragHandleProps: void 0
};
function Ly({ nodeValue: e, hasChildren: t, isExpanded: n, data: o, onDragDrop: r, dragStateRef: s, allowDrop: a, withDragHandle: i }) {
  const [c, u] = f.useState(!1);
  return f.useEffect(() => {
    if (!i || !c) return;
    const v = () => u(!1);
    return window.addEventListener("mouseup", v), () => window.removeEventListener("mouseup", v);
  }, [i, c]), r ? {
    elementProps: {
      draggable: i ? c : !0,
      onDragStart: (v) => {
        if (i && !c) return;
        v.stopPropagation(), v.dataTransfer.effectAllowed = "move", v.dataTransfer.setData("text/plain", e), s.current.draggedValue = e;
        const w = v.currentTarget, x = w.closest("[role=treeitem]");
        x && x.setAttribute("data-dragging", "true"), requestAnimationFrame(() => {
          w.setAttribute("data-dragging", "true");
        });
      },
      onDragOver: (v) => {
        const w = s.current.draggedValue;
        if (!w || w === e || Dy(o, w, e)) return;
        const x = v.currentTarget, E = Oy(v, x, t, n);
        if (a && !a({
          draggedNode: w,
          targetNode: e,
          position: E
        })) {
          const k = s.current.currentDropTarget;
          k && k !== x && k.removeAttribute("data-drag-over"), x.removeAttribute("data-drag-over"), s.current.currentDropTarget = null;
          return;
        }
        v.preventDefault(), v.stopPropagation(), v.dataTransfer.dropEffect = "move";
        const j = s.current.currentDropTarget;
        j && j !== x && j.removeAttribute("data-drag-over"), x.setAttribute("data-drag-over", E), s.current.currentDropTarget = x;
      },
      onDragLeave: (v) => {
        const w = v.currentTarget, x = v.relatedTarget;
        x && w.contains(x) || (w.removeAttribute("data-drag-over"), s.current.currentDropTarget === w && (s.current.currentDropTarget = null));
      },
      onDrop: (v) => {
        v.preventDefault(), v.stopPropagation();
        const w = v.currentTarget, x = w.getAttribute("data-drag-over");
        w.removeAttribute("data-drag-over");
        const E = s.current.draggedValue;
        if (E && x && E !== e) {
          const j = {
            draggedNode: E,
            targetNode: e,
            position: x
          };
          (!a || a(j)) && r(j);
        }
        s.current.draggedValue = null, s.current.currentDropTarget = null;
      },
      onDragEnd: (v) => {
        const w = v.currentTarget;
        w.removeAttribute("data-dragging");
        const x = w.closest("[role=treeitem]");
        x && x.removeAttribute("data-dragging");
        const E = s.current.currentDropTarget;
        E && E.removeAttribute("data-drag-over"), s.current.draggedValue = null, s.current.currentDropTarget = null, i && u(!1);
      }
    },
    dragHandleProps: i ? { onMouseDown: () => u(!0) } : void 0
  } : $y;
}
function Xc(e, t, n) {
  if (!e || !t) return [];
  const o = n.indexOf(e), r = n.indexOf(t), s = Math.min(o, r), a = Math.max(o, r);
  return n.slice(s, a + 1);
}
function zy(e, t) {
  for (let n = e; n && n !== t; ) {
    if (n.style.display === "none") return !1;
    n = n.parentElement;
  }
  return !0;
}
function Pi({ node: e, getStyles: t, rootIndex: n, controller: o, expandOnClick: r, selectOnClick: s, isSubtree: a, level: i = 1, renderNode: c, flatValues: u, allowRangeSelection: d, expandOnSpace: p, checkOnSpace: m, keepMounted: h, onDragDrop: g, allowDrop: v, withDragHandle: w, dragStateRef: x, data: E }) {
  const j = f.useRef(null), k = Array.isArray(e.children) && e.children.length > 0, R = !!e.hasChildren && !k, P = k || R, S = o.isNodeLoading(e.value), y = o.getNodeLoadError(e.value), N = o.expandedState[e.value] || !1, D = (e.children || []).map((I) => /* @__PURE__ */ l.jsx(Pi, {
    node: I,
    flatValues: u,
    getStyles: t,
    rootIndex: void 0,
    level: i + 1,
    controller: o,
    expandOnClick: r,
    isSubtree: !0,
    renderNode: c,
    selectOnClick: s,
    allowRangeSelection: d,
    expandOnSpace: p,
    checkOnSpace: m,
    keepMounted: h,
    onDragDrop: g,
    allowDrop: v,
    withDragHandle: w,
    dragStateRef: x,
    data: E
  }, I.value)), { elementProps: O, dragHandleProps: z } = Ly({
    nodeValue: e.value,
    hasChildren: P,
    isExpanded: N,
    data: E,
    onDragDrop: g,
    dragStateRef: x,
    allowDrop: v,
    withDragHandle: w
  }), _ = (I) => {
    if (I.nativeEvent.code === "ArrowRight")
      if (I.stopPropagation(), I.preventDefault(), N) {
        const A = I.currentTarget.querySelector("[role=treeitem]");
        A?.setAttribute("data-focus-ring", "true"), A?.focus();
      } else o.expand(e.value);
    if (I.nativeEvent.code === "ArrowLeft") {
      if (I.stopPropagation(), I.preventDefault(), N && P) o.collapse(e.value);
      else if (a) {
        const A = Lo(I.currentTarget, "[role=treeitem]");
        A?.setAttribute("data-focus-ring", "true"), A?.focus();
      }
    }
    if (I.nativeEvent.code === "ArrowDown" || I.nativeEvent.code === "ArrowUp") {
      const A = Lo(I.currentTarget, "[data-tree-root]");
      if (!A) return;
      I.stopPropagation(), I.preventDefault();
      const B = Array.from(A.querySelectorAll("[role=treeitem]")).filter((ae) => zy(ae, A)), U = B.indexOf(I.currentTarget);
      if (U === -1) return;
      const W = I.nativeEvent.code === "ArrowDown" ? U + 1 : U - 1, Y = B[W];
      if (Y?.setAttribute("data-focus-ring", "true"), Y?.focus(), I.shiftKey) {
        const ae = B[W];
        ae && o.setSelectedState(Xc(o.anchorNode, ae.dataset.value, u));
      }
    }
    I.nativeEvent.code === "Space" && (p && (I.stopPropagation(), I.preventDefault(), o.toggleExpanded(e.value)), m && (I.stopPropagation(), I.preventDefault(), o.isNodeChecked(e.value) ? o.uncheckNode(e.value) : o.checkNode(e.value)));
  }, F = (I) => {
    I.stopPropagation(), d && I.shiftKey && o.anchorNode ? (o.setSelectedState(Xc(o.anchorNode, e.value, u)), j.current?.focus()) : (r && o.toggleExpanded(e.value), s && o.select(e.value), j.current?.focus());
  }, $ = o.selectedState.includes(e.value), M = {
    ...t("label"),
    onClick: F,
    "data-selected": $ || void 0,
    "data-value": e.value,
    ...O
  }, L = N && S && D.length === 0;
  return /* @__PURE__ */ l.jsxs("li", {
    ...t("node", { style: { "--label-offset": `calc(var(--level-offset) * ${i - 1})` } }),
    role: "treeitem",
    "aria-selected": $,
    "data-value": e.value,
    "data-selected": $ || void 0,
    "data-level": i,
    tabIndex: n === 0 ? 0 : -1,
    onKeyDown: _,
    onBlur: (I) => {
      I.currentTarget.contains(I.relatedTarget) || I.currentTarget.removeAttribute("data-focus-ring");
    },
    ref: j,
    children: [
      typeof c == "function" ? c({
        node: e,
        level: i,
        selected: $,
        isRoot: i === 1,
        tree: o,
        expanded: N,
        hasChildren: P,
        isLoading: S,
        loadError: y,
        elementProps: M,
        dragHandleProps: z
      }) : /* @__PURE__ */ l.jsx("div", {
        ...M,
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
            children: /* @__PURE__ */ l.jsx(pp, {
              size: 16,
              style: { marginInlineStart: 4 }
            })
          })
        })
      }),
      h && D.length > 0 ? /* @__PURE__ */ l.jsx(f.Activity, {
        mode: N ? "visible" : "hidden",
        children: /* @__PURE__ */ l.jsx(Q, {
          component: "ul",
          role: "group",
          ...t("subtree"),
          "data-level": i,
          children: D
        })
      }) : N && D.length > 0 && /* @__PURE__ */ l.jsx(Q, {
        component: "ul",
        role: "group",
        ...t("subtree"),
        "data-level": i,
        children: D
      })
    ]
  });
}
Pi.displayName = "@mantine/core/TreeNode";
var ff = {
  root: "m_f698e191",
  subtree: "m_75f3ecf",
  node: "m_f6970eb1",
  label: "m_dc283425",
  flatLine: "m_c03b303c",
  flatLineClosing: "m_bf7448d9"
};
function pf(e) {
  return e.reduce((t, n) => (t.push(n.value), n.children && t.push(...pf(n.children)), t), []);
}
const _y = {
  expandOnClick: !0,
  allowRangeSelection: !0,
  expandOnSpace: !0
}, mf = Oe((e, { levelOffset: t }) => ({ root: { "--level-offset": $o(t) } })), Es = se((e) => {
  const t = Z("Tree", _y, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, data: c, expandOnClick: u, tree: d, renderNode: p, selectOnClick: m, clearSelectionOnOutsideClick: h, allowRangeSelection: g, expandOnSpace: v, levelOffset: w, checkOnSpace: x, keepMounted: E, onDragDrop: j, allowDrop: k, withDragHandle: R, withLines: P, attributes: S, ref: y, ...N } = t, D = df(), O = d || D, z = f.useRef({
    draggedValue: null,
    currentDropTarget: null
  }), _ = Ie({
    name: "Tree",
    classes: ff,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: S,
    vars: i,
    varsResolver: mf
  }), F = Fl(() => h && O.clearSelected()), $ = Fe(y, F), M = f.useMemo(() => pf(c), [c]);
  f.useEffect(() => {
    O.initialize(c);
  }, [c]);
  const L = c.map((I, A) => /* @__PURE__ */ l.jsx(Pi, {
    node: I,
    getStyles: _,
    rootIndex: A,
    expandOnClick: u,
    selectOnClick: m,
    controller: O,
    renderNode: p,
    flatValues: M,
    allowRangeSelection: g,
    expandOnSpace: v,
    checkOnSpace: x,
    keepMounted: E,
    onDragDrop: j,
    allowDrop: k,
    withDragHandle: R,
    dragStateRef: z,
    data: c
  }, I.value));
  return /* @__PURE__ */ l.jsx(Q, {
    component: "ul",
    ref: $,
    ..._("root"),
    ...N,
    role: "tree",
    "aria-multiselectable": O.multiple,
    "data-tree-root": !0,
    "data-with-lines": P || void 0,
    children: L
  });
});
Es.displayName = "@mantine/core/Tree";
Es.classes = ff;
Es.varsResolver = mf;
function Ti() {
  window.location.pathname !== "/login.html" && window.location.replace("/login.html");
}
function De(e) {
  return e.layers ?? [];
}
function Le(e) {
  return e.version ?? 0;
}
class ot extends Error {
  code;
  details;
  constructor(t, n, o) {
    super(n), this.name = "ApiError", this.code = t, this.details = o;
  }
}
async function Ee(e, t) {
  const n = await fetch(e, t);
  if (n.status === 401)
    throw Ti(), new ot("unauthorized", "this server needs an access token", null);
  if (!n.ok) {
    let o = `http${n.status}`, r = n.statusText, s = null;
    try {
      const a = await n.json();
      a?.error && (o = a.error.code ?? o, r = a.error.message ?? r, s = a.error.details ?? null);
    } catch {
    }
    throw new ot(o, r, s);
  }
  if (n.status !== 204)
    return await n.json();
}
async function hf(e = "", t = 200) {
  const n = new URLSearchParams({ limit: String(t) });
  return e && n.set("query", e), (await Ee(
    `/api/projects?${n.toString()}`
  )).projects;
}
async function Fy(e = 8) {
  return (await Ee(
    `/api/projects/recent?limit=${e}`
  )).projects;
}
async function By(e) {
  return Ee(`/api/projects/${encodeURIComponent(e)}`);
}
function Vy(e) {
  return `/api/projects/${encodeURIComponent(e)}/thumbnail.png`;
}
async function Hy(e, t, n, o, r) {
  return Ee("/api/projects", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: e, width: t, height: n, background: o, name: r })
  });
}
async function Uy(e, t) {
  return Ee(
    `/api/projects/${encodeURIComponent(e)}/rename`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: t })
    }
  );
}
async function Wy(e) {
  return Ee(`/api/projects/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
async function Ai(e) {
  return Ee(`/api/projects/${encodeURIComponent(e)}/document`);
}
async function qy(e, t) {
  return (await Ee(
    `/api/projects/${encodeURIComponent(e)}/recover-lock`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ expectedPid: t })
    }
  )).unlocked;
}
async function Ky(e, t = 100) {
  const n = new URLSearchParams({ tail: String(t) });
  return Ee(`/api/projects/${encodeURIComponent(e)}/history?${n.toString()}`);
}
async function $n(e, t, n, o = !1) {
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
async function Xy(e, t, n, o) {
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
async function Yy(e) {
  return Ee(`/api/projects/${encodeURIComponent(e)}/undo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ actor: { kind: "human", name: "reference UI" } })
  });
}
async function Gy(e) {
  return Ee(`/api/projects/${encodeURIComponent(e)}/redo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ actor: { kind: "human", name: "reference UI" } })
  });
}
async function Jy(e, t, n) {
  return Ee(`/api/projects/${encodeURIComponent(e)}/export`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: t, scale: n })
  });
}
async function Zy() {
  await Ee("/api/shutdown", { method: "POST" });
}
async function Qy() {
  return Ee("/api/version");
}
async function eb() {
  return Ee("/api/agent-access");
}
async function tb() {
  return Ee("/api/agent-sessions");
}
async function nb() {
  return Ee("/api/update-status");
}
async function ob(e) {
  return Ee("/api/update-consent", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ updateCheck: e })
  });
}
async function Ii(e, t) {
  const n = await fetch(
    `/api/projects/${encodeURIComponent(e)}/assets?filename=${encodeURIComponent(t.name)}`,
    {
      method: "POST",
      headers: { "content-type": t.type || "application/octet-stream" },
      body: t
    }
  );
  if (n.status === 401)
    throw Ti(), new ot("unauthorized", "this server needs an access token", null);
  if (!n.ok) {
    let o = `http${n.status}`, r = n.statusText;
    try {
      const s = await n.json();
      o = s?.error?.code ?? o, r = s?.error?.message ?? r;
    } catch {
    }
    throw new ot(o, r, null);
  }
  return await n.json();
}
const rb = ["fill", "contain", "cover"], Yc = 8;
function gf(e) {
  if (e.type !== "shape") return null;
  const t = e.shape;
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = t.kind;
    if (typeof n == "string") return n;
  }
  return null;
}
function sb(e) {
  if (e.type !== "shape") return 0;
  const t = e.shape;
  if (t && typeof t == "object") {
    const n = t.cornerRadius;
    if (typeof n == "number") return n;
  }
  return 0;
}
const ab = [
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
], Gc = [
  "brightness",
  "contrast",
  "saturation",
  "blur",
  "grain",
  "dropShadow",
  "hueRotate",
  "invert"
];
function ib(e) {
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
function cb(e) {
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
async function lb(e) {
  return (await Ee(
    `/api/projects/${encodeURIComponent(e)}/presets`
  )).presets;
}
function ub(e) {
  const t = {
    opacity: e.opacity ?? 1,
    blendMode: e.blendMode ?? "normal",
    effects: e.effects ?? []
  };
  return e.type === "text" && (t.fontFamily = e.fontFamily, t.fontSize = e.fontSize, t.color = e.color ?? "#000000", t.align = e.align ?? "left", t.lineHeight = e.lineHeight ?? 1.2, t.paragraphSpacing = e.paragraphSpacing ?? 0), e.type === "shape" && (e.fill && (t.fill = e.fill), e.stroke && (t.stroke = e.stroke)), t;
}
async function db(e) {
  return Ee(`/api/projects/${encodeURIComponent(e)}/slots`);
}
async function fb(e, t, n = 1) {
  return Ee(
    `/api/projects/${encodeURIComponent(e)}/variants`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ variants: t, scale: n })
    }
  );
}
function vf(e, t) {
  return `/api/projects/${encodeURIComponent(e)}/exports/${encodeURIComponent(t)}.png`;
}
async function pb() {
  return (await Ee("/api/fonts")).families;
}
function ga(e, t = "Aa Bb 0123") {
  return `/api/fonts/specimen.png?${new URLSearchParams({
    family: e.family,
    weight: String(e.weight),
    style: e.style,
    hash: e.hash,
    sample: t
  }).toString()}`;
}
async function mb() {
  return (await Ee(
    "/catalogue-specimens/manifest.json"
  )).families;
}
async function hb() {
  const e = await Ee("/api/fonts");
  return { families: e.families ?? [], faces: e.faces ?? [] };
}
async function gb(e) {
  return Ee(
    `/api/fonts?filename=${encodeURIComponent(e.name)}`,
    {
      method: "POST",
      headers: { "content-type": e.type || "application/octet-stream" },
      body: e
    }
  );
}
async function vb(e) {
  return Ee(
    `/api/fonts/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function yb() {
  return Ee("/api/fonts/catalogue");
}
async function Jc(e) {
  return Ee("/api/fonts/install", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ pack: e })
  });
}
function bb(e, t) {
  return `/api/projects/${encodeURIComponent(e)}/preview.svg?v=${t}`;
}
async function uo(e) {
  return URL.createObjectURL(await Rs(e));
}
async function Rs(e) {
  const t = await fetch(e);
  if (t.status === 401)
    throw Ti(), new ot("unauthorized", "this server needs an access token", null);
  if (!t.ok) {
    let n = `http${t.status}`, o = t.statusText, r = null;
    try {
      const s = await t.json();
      s?.error && (n = s.error.code ?? n, o = s.error.message ?? o, r = s.error.details ?? null);
    } catch {
    }
    throw new ot(n, o, r);
  }
  return await t.blob();
}
function Vr(e, t, n = 1, o) {
  const r = new URLSearchParams({ scale: String(n), v: String(t) });
  return o?.only?.length && r.set("only", o.only.join(",")), o?.exclude?.length && r.set("exclude", o.exclude.join(",")), `/api/projects/${encodeURIComponent(e)}/preview.png?${r.toString()}`;
}
async function yf(e, t, n) {
  const o = new URLSearchParams({ id: t, width: String(n) });
  return Ee(
    `/api/projects/${encodeURIComponent(e)}/text-layout?${o.toString()}`
  );
}
function Ve(e, t = null, n = 0, o = []) {
  for (const r of e)
    o.push({ layer: r, parent: t, depth: n }), r.type === "group" && Ve(r.children ?? [], r.id, n + 1, o);
  return o;
}
function Uo(e) {
  return !e.protected && !e.readOnly && !e.locked;
}
function Hr(e) {
  return e.protected ? "protected — no tool can change this layer" : e.readOnly ? "read-only — inspectable but never mutable" : e.locked ? "locked — unlock it to make changes" : null;
}
function Zc(e) {
  return !e.includes("'") && !/[\r\n]/.test(e) ? `'${e}'` : JSON.stringify(e);
}
function wb(e) {
  const t = ["mcp", "--workspace", e.workspace], n = JSON.stringify(
    { mcpServers: { assemblash: { command: e.executable, args: t } } },
    null,
    2
  ), o = [
    "[mcp_servers.assemblash]",
    `command = ${Zc(e.executable)}`,
    `args = [${t.map(Zc).join(", ")}]`
  ].join(`
`);
  return [
    { id: "json", title: b("agents.jsonTitle"), hint: b("agents.jsonHint"), text: n },
    { id: "codex", title: b("agents.codexTitle"), hint: b("agents.codexHint"), text: o },
    { id: "url", title: b("agents.urlTitle"), hint: b("agents.urlHint"), text: e.mcpUrl }
  ];
}
async function xb(e) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(e);
    return;
  }
  const t = document.createElement("textarea");
  t.value = e, t.setAttribute("readonly", ""), t.style.position = "fixed", t.style.opacity = "0", document.body.append(t), t.select();
  const n = document.execCommand("copy");
  if (t.remove(), !n) throw new Error(b("agents.copyRefused"));
}
const Qc = "assemblash-agent-hint-v1";
function Sb({
  host: e,
  controller: t
}) {
  _e();
  const [n, o] = f.useState(null), [r, s] = f.useState(!1), a = f.useRef(e);
  a.current = e, f.useEffect(() => (t.current = (c) => {
    o(c), s(!0);
  }, () => {
    t.current = null;
  }), [t]);
  const i = n === null ? [] : wb(n);
  return /* @__PURE__ */ l.jsxs(
    dt,
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
        /* @__PURE__ */ l.jsx(to, { align: "center", justify: "between", gap: "3", mb: "md", children: /* @__PURE__ */ l.jsxs("div", { children: [
          /* @__PURE__ */ l.jsx(ee, { component: "p", size: "xs", fw: 600, mb: 4, style: { letterSpacing: "0.08em" }, children: b("agents.protocol") }),
          /* @__PURE__ */ l.jsx(ec, { order: 2, size: "h2", m: 0, children: b("agents.dialogTitle") })
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
          /* @__PURE__ */ l.jsxs(to, { align: "center", justify: "between", gap: "md", my: "sm", children: [
            /* @__PURE__ */ l.jsx(ec, { order: 3, size: "h4", m: 0, children: c.title }),
            /* @__PURE__ */ l.jsxs(
              ue,
              {
                size: "xs",
                variant: "light",
                className: "agent-copy",
                onClick: () => {
                  xb(c.text).then(
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
        /* @__PURE__ */ l.jsx(to, { justify: "flex-end", gap: "md", mt: "lg", children: /* @__PURE__ */ l.jsx(ue, { id: "agents-done", onClick: () => s(!1), children: b("common.done") }) })
      ]
    }
  );
}
function Cb(e) {
  const t = document.createElement("div");
  t.dataset.island = "agents", document.body.append(t);
  const n = { current: null };
  Ue("agents", t, /* @__PURE__ */ l.jsx(Sb, { host: e, controller: n }));
  async function o() {
    try {
      const s = await eb();
      n.current?.(s);
    } catch (s) {
      const a = s instanceof ot ? s.message : String(s);
      e.say(b("agents.openError", { error: a }), "error");
      return;
    }
  }
  function r() {
    let s = !1;
    try {
      s = window.localStorage.getItem(Qc) !== null, window.localStorage.setItem(Qc, "shown");
    } catch {
    }
    s || o();
  }
  return { open: o, offerOnFirstRun: r };
}
const jb = [
  { id: "png", label: "PNG", detail: b("export.pngDetail"), icon: "ph-image" },
  { id: "svg", label: "SVG", detail: b("export.svgDetail"), icon: "ph-file-svg" }
];
function kb(e, t, n, o) {
  return e === "svg" ? {
    url: bb(t, Le(n)),
    filename: `${o}.svg`
  } : { url: vf(t, o), filename: `${o}.png` };
}
const qn = [
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
function Cr(e, t) {
  const n = e.canvas.width, o = e.canvas.height, r = t.longEdge === null ? 1 : t.longEdge / Math.max(n, o);
  return {
    width: Math.max(1, Math.round(n * r)),
    height: Math.max(1, Math.round(o * r)),
    scale: r
  };
}
function Eb(e) {
  const t = window.document.getElementById(e);
  if (!t) throw new Error(`missing element #${e}`);
  return t;
}
function el(e) {
  return e.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "assemblash-export";
}
function Rb(e) {
  return e < 1024 ? b("export.bytes", { count: ke(e) }) : e < 1024 * 1024 ? `${ke(Math.round(e / 102.4) / 10)} KB` : `${ke(Math.round(e / (1024 * 1024) * 10) / 10)} MB`;
}
function Nb({ host: e, controller: t }) {
  const [n, o] = f.useState("png"), [r, s] = f.useState("8k"), [a, i] = f.useState("assemblash-export"), [c, u] = f.useState(""), [d, p] = f.useState(!1), [m, h] = f.useState(!1), [g, v] = f.useState(null);
  _e();
  const w = f.useRef(null), x = e.document(), E = n === "svg", j = qn.find((S) => S.id === r) ?? qn[0];
  function k() {
    w.current && URL.revokeObjectURL(w.current), w.current = null, v(null);
  }
  function R(S = n, y = r) {
    const N = e.document();
    if (!N) {
      u(b("export.noProject"));
      return;
    }
    const D = S === "svg" ? { width: N.canvas.width, height: N.canvas.height } : Cr(N, qn.find((O) => O.id === y) ?? qn[0]);
    u(`${ke(D.width)} × ${ke(D.height)} ${b(S === "svg" ? "export.svgSummary" : "export.pngSummary")}`);
  }
  f.useEffect(() => {
    const S = () => {
      const y = e.document(), N = e.project();
      if (!y || !N) {
        e.say(b("export.projectRequired"), "error");
        return;
      }
      k(), i(el(y.name ?? N)), o("png"), s("8k");
      const D = Cr(y, qn.find((O) => O.id === "8k"));
      u(`${ke(D.width)} × ${ke(D.height)} ${b("export.pngSummary")}`), h(!0);
    };
    return t.current = S, window.addEventListener("assemblash:export-open", S), () => {
      window.removeEventListener("assemblash:export-open", S), t.current = null, w.current && URL.revokeObjectURL(w.current);
    };
  }, [t, e]);
  async function P(S) {
    if (S.preventDefault(), !S.currentTarget.reportValidity()) return;
    const y = e.project(), N = e.document();
    if (!y || !N) return;
    const D = n, O = D === "svg" ? { width: N.canvas.width, height: N.canvas.height, scale: 1 } : Cr(N, j), z = el(a);
    i(z);
    const _ = kb(D, y, N, z);
    await e.guard(b("export.openButton"), async () => {
      k(), p(!0), u(b("export.renderingSize", { width: ke(O.width), height: ke(O.height) }));
      try {
        const F = D === "svg" ? { width: O.width, height: O.height, bytes: 0 } : await Jy(y, z, O.scale), $ = await Rs(_.url);
        w.current = URL.createObjectURL($), v({ url: w.current, filename: _.filename });
        const M = D === "svg" ? $.size : F.bytes;
        u(`${ke(F.width)} × ${ke(F.height)} ${b("export.ready", { format: D.toUpperCase(), size: Rb(M) })}`), e.say(b("export.exported", { width: ke(F.width), height: ke(F.height), format: D.toUpperCase() }));
      } finally {
        p(!1);
      }
    });
  }
  return /* @__PURE__ */ l.jsx(dt, { id: "export-dialog", "data-state": m ? "open" : "closed", opened: m, onClose: () => {
    h(!1), k();
  }, title: null, withCloseButton: !1, centered: !0, size: "lg", withinPortal: !1, keepMounted: !0, children: /* @__PURE__ */ l.jsx("div", { className: "export-mantine-root", children: /* @__PURE__ */ l.jsx("form", { id: "export-form", onSubmit: (S) => {
    P(S);
  }, children: /* @__PURE__ */ l.jsxs(ve, { gap: "md", children: [
    /* @__PURE__ */ l.jsxs(Re, { justify: "space-between", align: "flex-start", children: [
      /* @__PURE__ */ l.jsxs("div", { children: [
        /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: b("export.eyebrow") }),
        /* @__PURE__ */ l.jsx(ee, { component: "h2", fw: 700, size: "lg", children: b("export.title") })
      ] }),
      /* @__PURE__ */ l.jsx(ue, { type: "button", variant: "subtle", "aria-label": b("common.close"), onClick: () => {
        h(!1), k();
      }, children: "×" })
    ] }),
    /* @__PURE__ */ l.jsxs(ve, { gap: "xs", children: [
      /* @__PURE__ */ l.jsx(ee, { fw: 600, children: b("export.format") }),
      /* @__PURE__ */ l.jsx(Re, { id: "export-formats", role: "radiogroup", "aria-label": b("export.format"), grow: !0, children: jb.map((S) => /* @__PURE__ */ l.jsx(ro, { component: "button", type: "button", "data-format": S.id, role: "radio", "aria-checked": n === S.id, withBorder: !0, p: "sm", bg: n === S.id ? "red.0" : void 0, style: { cursor: "pointer", textAlign: "left" }, onClick: () => {
        n !== S.id && (k(), o(S.id), R(S.id));
      }, children: /* @__PURE__ */ l.jsxs(ve, { gap: 4, children: [
        /* @__PURE__ */ l.jsxs(Re, { gap: "xs", children: [
          /* @__PURE__ */ l.jsx("i", { className: `ph ${S.icon}`, "aria-hidden": "true" }),
          /* @__PURE__ */ l.jsx("b", { children: S.label })
        ] }),
        /* @__PURE__ */ l.jsx(ee, { size: "sm", children: b(S.id === "png" ? "export.pngDetail" : "export.svgDetail") })
      ] }) }, S.id)) })
    ] }),
    /* @__PURE__ */ l.jsxs(ve, { id: "export-resolution-row", "aria-disabled": E, gap: "xs", children: [
      /* @__PURE__ */ l.jsx(ee, { fw: 600, children: b("export.resolution") }),
      /* @__PURE__ */ l.jsx(Re, { id: "export-options", role: "radiogroup", "aria-label": b("export.resolution"), "aria-disabled": E, grow: !0, children: qn.map((S) => {
        const y = x ? Cr(x, S) : null;
        return /* @__PURE__ */ l.jsx(ro, { component: "button", type: "button", disabled: E, role: "radio", "aria-checked": r === S.id && !E, withBorder: !0, p: "sm", bg: r === S.id && !E ? "red.0" : void 0, style: { cursor: E ? "not-allowed" : "pointer", textAlign: "left" }, onClick: () => {
          s(S.id), k(), R(n, S.id);
        }, children: /* @__PURE__ */ l.jsxs(ve, { gap: 4, children: [
          /* @__PURE__ */ l.jsxs(Re, { gap: "xs", children: [
            /* @__PURE__ */ l.jsx("i", { className: `ph ${S.icon}`, "aria-hidden": "true" }),
            /* @__PURE__ */ l.jsx("b", { children: S.id === "original" ? b("export.original") : S.id === "8k" ? b("export.resolution8k") : S.label })
          ] }),
          /* @__PURE__ */ l.jsx(ee, { size: "sm", children: y ? `${ke(y.width)} × ${ke(y.height)}` : b(S.id === "original" ? "export.documentSize" : `export.longEdge${S.id}`) })
        ] }) }, S.id);
      }) })
    ] }),
    /* @__PURE__ */ l.jsx(lt, { id: "export-name", label: b("export.fileName"), value: a, onChange: (S) => i(S.currentTarget.value), pattern: "[A-Za-z0-9_-]+", maxLength: 60, required: !0 }),
    /* @__PURE__ */ l.jsx(ee, { id: "export-summary", "aria-live": "polite", fw: 500, children: c }),
    /* @__PURE__ */ l.jsxs(Re, { justify: "flex-end", children: [
      /* @__PURE__ */ l.jsxs(ue, { id: "export-download", component: "a", href: g?.url ?? "#", download: g?.filename, hidden: !g, variant: "default", children: [
        /* @__PURE__ */ l.jsx("i", { className: "ph ph-download-simple", "aria-hidden": "true" }),
        " ",
        b("common.download")
      ] }),
      /* @__PURE__ */ l.jsx(ue, { id: "export-cancel", type: "button", variant: "default", onClick: () => {
        h(!1), k();
      }, children: b("common.cancel") }),
      /* @__PURE__ */ l.jsxs(ue, { id: "export-confirm", type: "submit", loading: d, value: "default", children: [
        /* @__PURE__ */ l.jsx("i", { className: `ph ${d ? "ph-circle-notch" : "ph-export"}`, "aria-hidden": "true" }),
        " ",
        d ? b("export.rendering") : b("export.confirm", { format: n.toUpperCase() })
      ] })
    ] })
  ] }) }) }) });
}
function Pb(e) {
  const t = Eb("export-dialog-mount"), n = { current: null };
  return Ue("export", t, /* @__PURE__ */ l.jsx(Nb, { host: e, controller: n })), { open: () => {
    n.current ? n.current() : queueMicrotask(() => n.current?.());
  } };
}
function tl(e, t, n) {
  const o = n * Math.PI / 180, r = Math.sin(o), s = Math.cos(o);
  return { x: e * s - t * r, y: e * r + t * s };
}
function Ur(e) {
  const t = e.rotation * Math.PI / 180, n = Math.abs(Math.sin(t)), o = Math.abs(Math.cos(t)), r = e.width * o + e.height * n, s = e.width * n + e.height * o, a = e.x + e.width / 2, i = e.y + e.height / 2;
  return {
    x: a - r / 2,
    y: i - s / 2,
    width: r,
    height: s
  };
}
function Mi(e) {
  if (e.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  const t = e.map(Ur), n = Math.min(...t.map((a) => a.x)), o = Math.min(...t.map((a) => a.y)), r = Math.max(...t.map((a) => a.x + a.width)), s = Math.max(...t.map((a) => a.y + a.height));
  return { x: n, y: o, width: r - n, height: s - o };
}
function Tb(e, t) {
  const n = e.width ?? 0, o = e.height ?? 0;
  if (!(n > 0) || !(o > 0)) return { width: 300, height: 200 };
  const r = Math.min(t.width / n, t.height / o, 1);
  return {
    width: Math.max(1, Math.round(n * r)),
    height: Math.max(1, Math.round(o * r))
  };
}
function bf(e, t, n, o = !1) {
  const r = n.width / (o ? t.width : Math.max(1, t.width)), s = n.height / (o ? t.height : Math.max(1, t.height)), a = n.x + (e.x + e.width / 2 - t.x) * r, i = n.y + (e.y + e.height / 2 - t.y) * s, c = o ? e.width * r : Math.max(1, e.width * r), u = o ? e.height * s : Math.max(1, e.height * s);
  return {
    x: a - c / 2,
    y: i - u / 2,
    width: c,
    height: u
  };
}
function Ks(e) {
  const t = new DataView(new ArrayBuffer(8));
  return t.setFloat64(0, e), t.setBigUint64(0, t.getBigUint64(0) + 1n), t.getFloat64(0);
}
function Ab(e, t, n, o, r, s, a = [e]) {
  if (![e.x, e.y, e.width, e.height, t, o, r].every(Number.isFinite)) return null;
  const i = n.includes("e") ? 1 : n.includes("w") ? -1 : 0, c = n.includes("s") ? 1 : n.includes("n") ? -1 : 0, u = tl(o, r, -t), d = i * u.x * (s.centre ? 2 : 1), p = c * u.y * (s.centre ? 2 : 1);
  if (d === 0 && p === 0) return { ...e };
  if (!(e.width > 0 && e.height > 0) || a.length === 0 || a.some((y) => !Number.isFinite(y.width) || !Number.isFinite(y.height) || y.width <= 0 || y.height <= 0)) return null;
  const m = 1 + d / e.width, h = 1 + p / e.height;
  if (![m, h].every(Number.isFinite)) return null;
  const g = Math.max(...a.map((y) => Math.min(1, y.width) / y.width)), v = Math.max(...a.map((y) => Math.min(1, y.height) / y.height));
  let w, x;
  if (s.ratio) {
    const y = i && c ? Math.abs(m - 1) >= Math.abs(h - 1) ? m : h : i ? m : h;
    w = x = Math.max(y, g, v);
  } else
    w = i ? Math.max(m, g) : 1, x = c ? Math.max(h, v) : 1;
  for (let y = 0; y < 4; y += 1) {
    const N = a.some((O) => O.width * w < Math.min(1, O.width)), D = a.some((O) => O.height * x < Math.min(1, O.height));
    if (!N && !D) break;
    s.ratio ? w = x = Ks(w) : (N && (w = Ks(w)), D && (x = Ks(x)));
  }
  if (w === 1 && x === 1) return { ...e };
  const E = e.width * w, j = e.height * x, k = tl(
    s.centre ? 0 : i * (E - e.width) / 2,
    s.centre ? 0 : c * (j - e.height) / 2,
    t
  ), R = {
    x: e.x + e.width / 2 + k.x - E / 2,
    y: e.y + e.height / 2 + k.y - j / 2,
    width: E,
    height: j
  };
  if (t === 0 && (R.x = s.centre || i === 0 ? e.x + (e.width - E) / 2 : i > 0 ? e.x : e.x + e.width - E, R.y = s.centre || c === 0 ? e.y + (e.height - j) / 2 : c > 0 ? e.y : e.y + e.height - j), !Object.values(R).every(Number.isFinite) || E <= 0 || j <= 0) return null;
  const P = R.width / e.width, S = R.height / e.height;
  return a.some((y) => {
    const N = y.width * P, D = y.height * S;
    return !Number.isFinite(N) || !Number.isFinite(D) || N < Math.min(1, y.width) || D < Math.min(1, y.height);
  }) ? null : R;
}
function Ib(e, t) {
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
function Mb(e, t, n) {
  const o = (e.transform.rotation ?? 0) * Math.PI / 180, r = Math.cos(o), s = Math.sin(o), a = e.transform.flipHorizontal ? -1 : 1, i = e.transform.flipVertical ? -1 : 1, c = (n.width - t.width) / 2, u = (n.height - t.height) / 2, d = n.x - t.x, p = n.y - t.y;
  if (e.type === "text" || e.type === "group") {
    const k = r * a * c - s * i * u, R = s * a * c + r * i * u, P = e.type === "group" && (a < 0 || i < 0), S = [1, 0, 0, 1, d + (P ? 0 : c) - k, p + (P ? 0 : u) - R];
    return S.every(Number.isFinite) ? S : null;
  }
  const m = n.width / t.width, h = n.height / t.height, g = r * r * m + s * s * h, v = r * s * (m - h), w = s * s * m + r * r * h, x = t.x + t.width / 2, E = t.y + t.height / 2, j = [g, v, v, w, n.x + n.width / 2 - g * x - v * E, n.y + n.height / 2 - v * x - w * E];
  return j.every(Number.isFinite) ? j : null;
}
const Db = "Aa Bb 0123", Kn = /* @__PURE__ */ new Map(), va = /* @__PURE__ */ new WeakMap(), ya = /* @__PURE__ */ new WeakSet();
function Ob(e) {
  let t = Kn.get(e);
  if (!t && (t = Rs(e).catch((n) => {
    throw Kn.delete(e), n;
  }), Kn.set(e, t), Kn.size > 64)) {
    const n = Kn.keys().next().value;
    n && Kn.delete(n);
  }
  return t;
}
function ba(e) {
  for (const t of e.querySelectorAll("img[data-font-specimen]")) {
    const n = va.get(t);
    n && URL.revokeObjectURL(n), va.delete(t), ya.add(t), t.removeAttribute("src");
  }
}
function $b(e, t, n) {
  const o = window.document.createElement("span");
  o.className = "font-specimen";
  const r = window.document.createElement("img");
  r.className = "font-specimen-image", r.dataset.fontSpecimen = "", r.alt = "", r.setAttribute("aria-hidden", "true");
  const s = window.document.createElement("span");
  s.className = "font-specimen-status", s.hidden = !0, o.append(r, s), e.append(o), Ob(t).then((a) => {
    if (!r.isConnected || ya.has(r)) return;
    const i = URL.createObjectURL(a);
    va.set(r, i), r.src = i, s.hidden = !0;
  }).catch(() => {
    !r.isConnected || ya.has(r) || (s.textContent = b(n), s.hidden = !1);
  });
}
function Lb(e) {
  return e.find((t) => t.weight === 400 && t.style === "normal") ?? e.find((t) => t.style === "normal") ?? e[0] ?? null;
}
function wf(e, t, n = Db) {
  $b(e, ga(t, n), "fonts.previewUnavailable");
}
function xf(e, t) {
  return t.filter((n) => n.family === e).sort((n, o) => n.weight - o.weight);
}
let zb = 0;
function _b({ host: e, value: t, disabled: n, label: o, onCommit: r }) {
  const s = f.useMemo(() => ({ initialFamily: t, initialDisabled: n }), []);
  return f.useEffect(() => {
    s.setFamily?.(t), s.setDisabled?.(n);
  }, [s, t, n]), s.label = o, /* @__PURE__ */ l.jsx("span", { className: "font-selector", children: /* @__PURE__ */ l.jsx(Sf, { host: e, actions: s, onCommit: r }) });
}
let Fb = 0;
function Bb(e, t) {
  const n = e.trim().toLowerCase();
  return n ? t.families.find((o) => o.toLowerCase() === n) ?? null : null;
}
function Vb({
  family: e,
  face: t,
  active: n,
  selected: o,
  id: r,
  onMouseDown: s
}) {
  const a = f.useRef(null);
  return f.useLayoutEffect(() => {
    const i = a.current;
    if (i)
      return t && wf(i, t), () => ba(i);
  }, [t]), /* @__PURE__ */ l.jsx("li", { ref: a, id: r, "data-family": e, className: n ? "active" : void 0, "aria-selected": o, onMouseDown: s, children: /* @__PURE__ */ l.jsxs(xe.Option, { value: e, active: n, selected: o, children: [
    /* @__PURE__ */ l.jsx("span", { className: "font-selector-family", children: e }),
    /* @__PURE__ */ l.jsx(ee, { component: "span", size: "xs", c: "dimmed", className: "font-selector-faces", children: t ? `${t.style === "italic" ? b("fonts.styleItalic") : b("fonts.styleNormal")} ${ke(t.weight)}` : b("fonts.facesUnknown") }),
    !t && /* @__PURE__ */ l.jsx("span", { className: "font-specimen-status", children: b("fonts.previewUnavailable") })
  ] }) });
}
function Sf({
  host: e,
  onCommit: t,
  actions: n
}) {
  _e();
  const [o, r] = f.useState(n.initialFamily), [s, a] = f.useState(!1), [i, c] = f.useState(n.initialDisabled), [u, d] = f.useState(-1), p = f.useRef(null), m = f.useRef(""), h = f.useMemo(() => `font-selector-options-${++Fb}`, []), g = di({
    loop: !0,
    onDropdownClose: () => d(-1)
  }), v = e.store(), w = o.trim().toLowerCase(), x = w ? v.families.filter((y) => y.toLowerCase().includes(w)) : v.families, E = f.useCallback(() => {
    g.closeDropdown(), d(-1);
  }, [g]), j = f.useCallback((y) => {
    m.current = y, r(y), a(!1), E(), p.current?.blur(), t(y);
  }, [E, t]), k = f.useCallback(() => {
    E();
    const y = p.current?.value.trim() ?? "";
    if (!y || y.toLowerCase() === m.current.toLowerCase()) return;
    const N = Bb(y, e.store());
    if (!N) {
      a(!0);
      return;
    }
    m.current = N, r(N), a(!1), t(N);
  }, [E, e, t]), R = f.useCallback(() => {
    r(p.current?.value ?? ""), a(!1), d(-1), g.openDropdown();
  }, [g]), P = f.useCallback((y) => {
    p.current = y, y && (y.onfocus = () => Ht.flushSync(() => R()), y.onblur = k, y.oninput = () => {
      Ht.flushSync(() => {
        r(y.value), a(!1), d(-1), g.openDropdown();
      });
    }, y.onkeydown = (N) => Ht.flushSync(() => S(N)));
  }, [n, k, R, S]);
  n.setFamily = (y) => {
    m.current = y, r(y), a(!1);
  }, n.setDisabled = (y) => {
    c(y), y && E();
  };
  function S(y) {
    if (y.key === "ArrowDown" || y.key === "ArrowUp") {
      y.preventDefault(), g.dropdownOpened || g.openDropdown(), x.length && d((N) => {
        const D = y.key === "ArrowDown" ? 1 : -1;
        return (N + D + x.length) % x.length;
      });
      return;
    }
    if (y.key === "Enter" && g.dropdownOpened && u >= 0) {
      const N = x[u];
      N && (y.preventDefault(), j(N));
      return;
    }
    y.key === "Escape" && g.dropdownOpened && (y.preventDefault(), y.stopPropagation(), E());
  }
  return f.useLayoutEffect(() => {
    u < 0 || document.getElementById(`${h}-${u}`)?.scrollIntoView({ block: "nearest" });
  }, [u, h]), /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
    /* @__PURE__ */ l.jsxs(
      xe,
      {
        store: g,
        onOptionSubmit: j,
        position: "bottom-start",
        offset: 4,
        withinPortal: !1,
        floatingStrategy: "fixed",
        shadow: "md",
        onDismiss: () => E(),
        children: [
          /* @__PURE__ */ l.jsx(xe.Target, { withKeyboardNavigation: !1, withAriaAttributes: !1, children: /* @__PURE__ */ l.jsx(
            lt,
            {
              ref: P,
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
                r(y.currentTarget.value), a(!1), d(-1), g.openDropdown();
              }
            }
          ) }),
          /* @__PURE__ */ l.jsxs(
            xe.Dropdown,
            {
              className: "font-selector-list",
              hidden: !g.dropdownOpened,
              "aria-labelledby": `${h}-heading`,
              children: [
                /* @__PURE__ */ l.jsx(ee, { component: "p", size: "xs", fw: 700, c: "dimmed", id: `${h}-heading`, className: "font-selector-heading", "data-i18n": "fonts.selectorHeading", children: b("fonts.selectorHeading") }),
                /* @__PURE__ */ l.jsxs(xe.Options, { id: h, role: "listbox", children: [
                  x.map((y, N) => {
                    const D = xf(y, v.faces);
                    return /* @__PURE__ */ l.jsx(
                      Vb,
                      {
                        id: `${h}-${N}`,
                        family: y,
                        face: Lb(D),
                        active: N === u,
                        selected: N === u,
                        onMouseDown: (O) => {
                          O.preventDefault(), j(y);
                        }
                      },
                      y
                    );
                  }),
                  x.length === 0 && /* @__PURE__ */ l.jsx(xe.Empty, { className: "font-selector-none", children: /* @__PURE__ */ l.jsx(ee, { component: "span", size: "xs", c: "dimmed", "data-i18n": "fonts.noFamilyMatches", children: b("fonts.noFamilyMatches") }) })
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
function Hb(e, t) {
  const n = window.document.createElement("span");
  n.className = "font-selector";
  const o = {
    initialFamily: "",
    initialDisabled: !1
  }, r = Ue(
    `font-selector-${++zb}`,
    n,
    /* @__PURE__ */ l.jsx(Sf, { host: e, onCommit: t, actions: o })
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
const nl = "Aa Bb 0123";
function Eo(e) {
  if (e.length <= 1) return e[0] ?? "";
  const t = La();
  return new Intl.ListFormat(t === "pseudo" ? "en" : t, {
    style: "long",
    type: "conjunction"
  }).format(e);
}
function ol(e) {
  const t = e / 1048576;
  return t >= 10 ? `${ke(Math.round(t))} MB` : `${ke(Math.max(0.1, Math.round(t * 10) / 10))} MB`;
}
const Xn = /* @__PURE__ */ new Map();
function Ub(e) {
  let t = Xn.get(e);
  if (!t && (t = Rs(e).catch((n) => {
    throw Xn.delete(e), n;
  }), Xn.set(e, t), Xn.size > 64)) {
    const n = Xn.keys().next().value;
    n && Xn.delete(n);
  }
  return t;
}
function rl({
  url: e,
  unavailable: t,
  generation: n
}) {
  const [o, r] = f.useState(""), [s, a] = f.useState(!1);
  return f.useEffect(() => {
    let i = !0, c = "";
    return r(""), a(!1), Ub(e).then((u) => {
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
function Wb({ host: e, controller: t }) {
  const [n, o] = f.useState([]), [r, s] = f.useState([]), [a, i] = f.useState(nl), [c, u] = f.useState(nl), [d, p] = f.useState([]), [m, h] = f.useState(null), [g, v] = f.useState({}), [w, x] = f.useState(!1), [E, j] = f.useState(""), [k, R] = f.useState(!1), [P, S] = f.useState(0), [y, N] = f.useState(null), D = _e(), [O, z] = f.useState(!0), _ = f.useRef(n), F = f.useRef(null), $ = f.useRef(null), M = f.useRef(void 0);
  _.current = n;
  const L = f.useCallback((q, K) => {
    _.current = q, o(q), s(K), e.fontsChanged({ families: q, faces: K });
  }, [e]), I = f.useCallback(async () => {
    z(!0);
    const q = await hb();
    L([...q.families], [...q.faces]);
  }, [L]);
  f.useLayoutEffect(() => (t.reload = I, t.focusInstall = () => F.current?.focus(), t.hasFamilies = () => _.current.length > 0, t.releaseSamples = () => {
    z(!1), S((q) => q + 1);
  }, I(), () => {
    window.clearTimeout(M.current), t.reload = async () => {
    }, t.focusInstall = () => {
    }, t.hasFamilies = () => !1, t.releaseSamples = () => {
    };
  }), [t, I]);
  const A = f.useCallback(async () => {
    if (m) return m;
    const q = await yb();
    return h(q), q;
  }, [m]);
  f.useEffect(() => {
    A().catch(() => h(null));
  }, [A]);
  const B = f.useCallback(async () => {
    try {
      const q = await A(), K = q.packs.default ?? [], ce = q.families.filter((be) => K.includes(be.family)).reduce((be, pe) => be + pe.bytes, 0);
      j(K.length ? b("fonts.defaultPackDescription", { names: Eo(K), bytes: ol(ce) }) : b("fonts.noDefaultPack")), R(!1);
    } catch (q) {
      j(q instanceof ot ? b("fonts.packDescribeErrorCode", { error: q.message, code: q.code }) : b("fonts.packDescribeError")), R(!0);
    }
  }, [A]);
  f.useEffect(() => {
    n.length || B();
  }, [n.length, B]), f.useEffect(() => {
    let q = !0;
    return mb().then((K) => {
      q && v(K);
    }).catch(() => {
      q && v({});
    }), () => {
      q = !1;
    };
  }, []);
  const U = f.useCallback(async () => {
    e.project() && await e.refresh();
  }, [e]), W = async () => {
    await e.guard(b("fonts.installFonts"), async () => {
      x(!0), e.say(b("fonts.downloadingDefault"));
      try {
        const q = await Jc("default");
        await I(), await U(), e.say(b("fonts.installedFamilies", { names: Eo(q.families) }));
      } finally {
        x(!1);
      }
    });
  }, Y = (q) => {
    e.guard(b("fonts.installNamedPack", { pack: q }), async () => {
      try {
        await Jc(q), await I(), await U(), e.say(b("fonts.installedNamedPack", { pack: q }));
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
          const ne = await gb(Se);
          ce += 1;
          const H = [...new Set(ne.imported.map((V) => V.family))];
          be.push(H.length ? `${Se.name} → ${Eo(H)}` : b("fonts.importedFile", { file: Se.name }));
        } catch (ne) {
          be.push(ne instanceof ot ? `${Se.name}: ${ne.message} (${ne.code})` : `${Se.name}: ${String(ne)}`);
        }
      p(be), await I(), ce && await U();
      const pe = K.length - ce;
      ce ? e.say(It("fonts.importResult", ce, {
        refused: pe ? It("fonts.refusedCount", pe) : ""
      })) : e.say(b("fonts.noneImported", { refused: It("fonts.refusedCount", pe) }), "error");
    });
  }, fe = (q) => {
    window.confirm(b("fonts.confirmRemove", { family: q })) && e.guard(b("fonts.removeAction", { family: q }), async () => {
      p([]);
      const K = await vb(q);
      p([It("fonts.removedFiles", K.removed, { family: q })]), await I(), await U(), e.say(b("fonts.removedFromStore", { family: q }));
    });
  }, ie = (q) => {
    u(q), window.clearTimeout(M.current), M.current = window.setTimeout(() => {
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
          disabled: w || m !== null && (m.packs.default ?? []).length === 0,
          onClick: () => {
            W();
          },
          children: /* @__PURE__ */ l.jsxs(ve, { gap: 2, children: [
            /* @__PURE__ */ l.jsx("span", { id: "install-default-label", children: w ? b("fonts.installingDefault") : b("fonts.installDefaultPack") }),
            /* @__PURE__ */ l.jsx(ee, { id: "install-default-detail", component: "span", size: "xs", c: k ? "red" : void 0, children: E })
          ] })
        }
      )
    ] }) }),
    /* @__PURE__ */ l.jsx(
      lt,
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
            /* @__PURE__ */ l.jsx("span", { className: "font-faces", children: It("fonts.faceCount", K.length, { described: ce }) })
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
          rl,
          {
            url: ga(be, a),
            unavailable: "fonts.previewUnavailable",
            generation: P + D
          }
        ) : O ? /* @__PURE__ */ l.jsx("span", { className: "font-specimen-status", children: b("fonts.previewUnavailable") }) : null
      ] }, q);
    }) }),
    /* @__PURE__ */ l.jsx(
      Pe,
      {
        id: "font-pack-section",
        "data-testid": "font-pack-section",
        className: "font-pack-section",
        hidden: te.length === 0,
        value: y,
        onChange: N,
        keepMounted: !0,
        keepMountedMode: "display-none",
        children: /* @__PURE__ */ l.jsxs(Pe.Item, { value: "packs", children: [
          /* @__PURE__ */ l.jsx(Pe.Control, { children: b("fonts.morePacks") }),
          /* @__PURE__ */ l.jsx(Pe.Panel, { children: /* @__PURE__ */ l.jsx(ve, { id: "font-pack-options", "data-testid": "font-pack-options", className: "font-pack-options", gap: "sm", children: te.map((q) => {
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
                  /* @__PURE__ */ l.jsx(ee, { component: "span", size: "xs", c: "dimmed", children: ce.length ? b("fonts.namedPackDownload", { names: Eo(K), bytes: ol(be) }) : b("fonts.namedPackInstalled", { names: Eo(K) }) }),
                  /* @__PURE__ */ l.jsx(Re, { gap: "xs", wrap: "wrap", className: "font-pack-samples", children: K.map((pe) => {
                    const Se = r.filter((V) => V.family === pe).find((V) => V.weight === 400 && V.style === "normal") ?? r.find((V) => V.family === pe), ne = g[pe], H = Se ? ga(Se) : ne ? `/catalogue-specimens/${ne.src.replace(/^\.\//u, "")}` : null;
                    return /* @__PURE__ */ l.jsxs("span", { className: "font-pack-family", children: [
                      /* @__PURE__ */ l.jsx(ee, { component: "span", size: "xs", fw: 700, className: "font-pack-family-name", children: pe }),
                      O && H ? /* @__PURE__ */ l.jsx(
                        rl,
                        {
                          url: H,
                          unavailable: Se ? "fonts.previewUnavailable" : "fonts.cataloguePreviewUnavailable",
                          generation: P + D
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
    /* @__PURE__ */ l.jsx("div", { id: "font-feedback", "data-testid": "font-feedback", className: "font-feedback", "aria-live": "polite", children: d.map((q, K) => /* @__PURE__ */ l.jsx("p", { children: q }, `${K}-${q}`)) })
  ] });
}
function qb(e, t) {
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
  return Ue("font-manager", t, /* @__PURE__ */ l.jsx(Wb, { host: e, controller: n })), {
    reload: () => n.reload(),
    focusInstall: () => n.focusInstall(),
    hasFamilies: () => n.hasFamilies(),
    releaseSamples: () => n.releaseSamples()
  };
}
class Kb {
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
const Xb = [
  { size: "1080x1080", width: 1080, height: 1080, label: "common.square" },
  { size: "1920x1080", width: 1920, height: 1080, label: "common.landscape" },
  { size: "1080x1350", width: 1080, height: 1350, label: "common.portrait" },
  { size: "1080x1920", width: 1080, height: 1920, label: "common.story" }
];
function Yb({
  host: e,
  controller: t
}) {
  const [n, o] = f.useState(!1), [r, s] = f.useState(""), [a, i] = f.useState(1080), [c, u] = f.useState(1080), [d, p] = f.useState("#ffffff"), [m, h] = f.useState("1080x1080"), [g, v] = f.useState(!1);
  _e(), f.useEffect(() => (t.current = () => {
    s(""), i(1080), u(1080), p("#ffffff"), h("1080x1080"), o(!0);
  }, () => {
    t.current = null;
  }), [t]);
  async function w(x) {
    x.preventDefault();
    const E = r.trim(), j = Number(a), k = Number(c);
    if (!(!E || !Number.isFinite(j) || !Number.isFinite(k)) && !(j <= 0 || k <= 0 || g)) {
      v(!0);
      try {
        await e.create(E, j, k, d) && o(!1);
      } finally {
        v(!1);
      }
    }
  }
  return /* @__PURE__ */ l.jsx(
    dt,
    {
      id: "new-project-dialog",
      "data-state": n ? "open" : "closed",
      opened: n,
      onClose: () => o(!1),
      title: b("dialogs.newProjectTitle"),
      centered: !0,
      size: "lg",
      children: /* @__PURE__ */ l.jsx("form", { id: "new-project-form", onSubmit: (x) => {
        w(x);
      }, children: /* @__PURE__ */ l.jsxs(ve, { gap: "md", children: [
        /* @__PURE__ */ l.jsx(
          lt,
          {
            id: "new-project-name",
            label: b("common.name"),
            placeholder: b("dialogs.projectNamePlaceholder"),
            value: r,
            onChange: (x) => s(x.currentTarget.value),
            autoComplete: "off",
            required: !0,
            "data-autofocus": !0
          }
        ),
        /* @__PURE__ */ l.jsxs(ve, { gap: "xs", children: [
          /* @__PURE__ */ l.jsx(ee, { fw: 600, children: b("canvas.label") }),
          /* @__PURE__ */ l.jsx(Da, { id: "canvas-presets", cols: { base: 2, sm: 4 }, children: Xb.map((x) => /* @__PURE__ */ l.jsx(
            ue,
            {
              type: "button",
              "data-size": x.size,
              variant: m === x.size ? "light" : "default",
              onClick: () => {
                i(x.width), u(x.height), h(x.size);
              },
              children: b(x.label)
            },
            x.size
          )) })
        ] }),
        /* @__PURE__ */ l.jsxs(Re, { grow: !0, align: "start", children: [
          /* @__PURE__ */ l.jsx(
            Vo,
            {
              id: "new-project-width",
              label: b("common.width"),
              value: a,
              onChange: (x) => {
                i(x), h("");
              },
              min: 1,
              allowDecimal: !1,
              required: !0
            }
          ),
          /* @__PURE__ */ l.jsx(
            Vo,
            {
              id: "new-project-height",
              label: b("common.height"),
              value: c,
              onChange: (x) => {
                u(x), h("");
              },
              min: 1,
              allowDecimal: !1,
              required: !0
            }
          ),
          /* @__PURE__ */ l.jsx(
            or,
            {
              id: "new-project-background",
              label: b("common.background"),
              value: d,
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
function Gb(e) {
  const t = document.getElementById("new-project-dialog-mount");
  if (!t) throw new Error("missing element #new-project-dialog-mount");
  const n = { current: null };
  return Ue("project-create", t, /* @__PURE__ */ l.jsx(Yb, { host: e, controller: n })), { open: () => n.current?.() };
}
function Jb({ controller: e }) {
  const [t, n] = f.useState(null), [o, r] = f.useState(!1);
  _e();
  const [s, a] = f.useState(""), i = f.useRef(null), c = f.useRef(null), u = f.useRef(null), d = f.useCallback(() => {
    r(!1), n(null), a("");
  }, []), p = f.useCallback((h) => {
    h.preventDefault();
    const g = i.current;
    if (!g?.reportValidity()) return;
    const v = g.value.trim();
    if (!v) return;
    const w = t?.submit;
    d(), w?.(v);
  }, [d, t]), m = f.useCallback((h) => {
    n(h), a(""), r(!0);
  }, []);
  return e.open = m, /* @__PURE__ */ l.jsxs(
    dt,
    {
      id: "name-dialog",
      "data-state": o ? "open" : "closed",
      opened: o,
      onClose: d,
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
                lt,
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
              /* @__PURE__ */ l.jsxs(to, { justify: "flex-end", gap: "sm", mt: "lg", children: [
                /* @__PURE__ */ l.jsx(ue, { type: "button", variant: "default", onClick: d, children: b("common.cancel") }),
                /* @__PURE__ */ l.jsx(ue, { id: "name-dialog-confirm", ref: u, type: "submit", children: t ? b(t.confirmKey) : b("common.save") })
              ] })
            ]
          }
        )
      ]
    }
  );
}
function Zb() {
  const e = window.document.createElement("div");
  e.dataset.island = "name-prompt", window.document.body.append(e);
  const t = {};
  Ue("name-prompt", e, /* @__PURE__ */ l.jsx(Jb, { controller: t }));
  const n = t.open;
  if (!n) throw new Error("Mantine name prompt failed to mount");
  return {
    request(o, r, s, a) {
      n({ titleKey: o, labelKey: r, confirmKey: s, submit: a });
    }
  };
}
function Qb(e) {
  const t = window.document.getElementById(e);
  if (!t) throw new Error(`missing element #${e}`);
  return t;
}
function ew({ controller: e }) {
  const { colorScheme: t, setColorScheme: n } = nm(), [o, r] = f.useState(!1), [s, a] = f.useState("settings-agents");
  _e();
  const i = f.useRef(null), c = f.useRef(null), u = f.useRef(null);
  function d(h = "settings-agents", g) {
    a(h), g && (i.current && (i.current.checked = g.follow), c.current && (c.current.value = g.language)), r(!0);
  }
  function p() {
    r(!1);
  }
  f.useLayoutEffect(() => {
    e.current = { open: d, close: p, isOpen: () => o };
  }), f.useLayoutEffect(() => {
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
  }, [o]), f.useEffect(() => () => {
    e.current = null;
  }, [e]);
  function m(h) {
    h.preventDefault(), h.nativeEvent.submitter?.value === "cancel" && p();
  }
  return /* @__PURE__ */ l.jsx(dt, { ref: u, id: "settings-dialog", "data-state": o ? "open" : "closed", opened: o, onClose: p, title: null, withCloseButton: !1, centered: !0, size: "xl", withinPortal: !1, keepMounted: !0, keepMountedMode: "display-none", children: /* @__PURE__ */ l.jsx("form", { id: "settings-form", onSubmit: m, children: /* @__PURE__ */ l.jsxs(ve, { gap: "md", children: [
    /* @__PURE__ */ l.jsxs(Re, { justify: "space-between", align: "flex-start", children: [
      /* @__PURE__ */ l.jsxs("div", { children: [
        /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: b("settings.preferences") }),
        /* @__PURE__ */ l.jsx(ee, { component: "h2", fw: 700, children: b("settings.openButton") })
      ] }),
      /* @__PURE__ */ l.jsx(ue, { id: "settings-close", type: "submit", value: "cancel", variant: "subtle", title: b("common.close"), "aria-label": b("common.close"), children: "×" })
    ] }),
    /* @__PURE__ */ l.jsxs(Pe, { value: s, onChange: (h) => a(h), variant: "separated", keepMounted: !0, keepMountedMode: "display-none", children: [
      /* @__PURE__ */ l.jsxs(Pe.Item, { id: "settings-agents", className: "settings-section", value: "settings-agents", children: [
        /* @__PURE__ */ l.jsx(Pe.Control, { children: /* @__PURE__ */ l.jsxs(Re, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx("i", { className: "ph ph-robot", "aria-hidden": "true" }),
          /* @__PURE__ */ l.jsxs(ve, { gap: 0, children: [
            /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: b("settings.collaboration") }),
            /* @__PURE__ */ l.jsx(ee, { id: "settings-agents-heading", fw: 600, children: b("settings.aiAgents") })
          ] })
        ] }) }),
        /* @__PURE__ */ l.jsx(Pe.Panel, { children: /* @__PURE__ */ l.jsxs(ve, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx(ue, { id: "agents", type: "button", leftSection: /* @__PURE__ */ l.jsx("i", { className: "ph ph-plugs-connected", "aria-hidden": "true" }), children: b("agents.dialogTitle") }),
          /* @__PURE__ */ l.jsx(tn, { id: "setting-follow", ref: i, defaultChecked: !0, label: b("agents.followChanges") }),
          /* @__PURE__ */ l.jsx(ee, { size: "sm", c: "dimmed", children: b("agents.followHint") })
        ] }) })
      ] }),
      /* @__PURE__ */ l.jsxs(Pe.Item, { id: "settings-document", className: "settings-section", value: "settings-document", children: [
        /* @__PURE__ */ l.jsx(Pe.Control, { children: /* @__PURE__ */ l.jsxs(Re, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx("i", { className: "ph ph-file", "aria-hidden": "true" }),
          /* @__PURE__ */ l.jsxs(ve, { gap: 0, children: [
            /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: b("settings.project") }),
            /* @__PURE__ */ l.jsx(ee, { id: "settings-document-heading", fw: 600, children: b("settings.projectActions") })
          ] })
        ] }) }),
        /* @__PURE__ */ l.jsx(Pe.Panel, { children: /* @__PURE__ */ l.jsxs(ve, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx(ue, { id: "rename-project", type: "button", variant: "default", disabled: !0, leftSection: /* @__PURE__ */ l.jsx("i", { className: "ph ph-pencil-simple", "aria-hidden": "true" }), children: b("projects.renameButton") }),
          /* @__PURE__ */ l.jsx(ue, { id: "reload", type: "button", variant: "default", disabled: !0, leftSection: /* @__PURE__ */ l.jsx("i", { className: "ph ph-arrows-clockwise", "aria-hidden": "true" }), children: b("projects.reloadButton") }),
          /* @__PURE__ */ l.jsx(ue, { id: "delete-project", type: "button", color: "red", variant: "light", disabled: !0, leftSection: /* @__PURE__ */ l.jsx("i", { className: "ph ph-trash", "aria-hidden": "true" }), children: b("projects.deleteButton") })
        ] }) })
      ] }),
      /* @__PURE__ */ l.jsxs(Pe.Item, { id: "settings-fonts", className: "settings-section", value: "settings-fonts", children: [
        /* @__PURE__ */ l.jsx(Pe.Control, { children: /* @__PURE__ */ l.jsxs(Re, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx("i", { className: "ph ph-text-aa", "aria-hidden": "true" }),
          /* @__PURE__ */ l.jsxs(ve, { gap: 0, children: [
            /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: b("settings.workspace") }),
            /* @__PURE__ */ l.jsx(ee, { id: "settings-fonts-heading", fw: 600, children: b("toolbar.fontsButton") })
          ] })
        ] }) }),
        /* @__PURE__ */ l.jsx(Pe.Panel, { children: /* @__PURE__ */ l.jsxs(ve, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx(ee, { className: "hint", size: "sm", c: "dimmed", children: b("fonts.settingsHint") }),
          /* @__PURE__ */ l.jsx(ue, { id: "settings-fonts-open", type: "button", variant: "default", leftSection: /* @__PURE__ */ l.jsx("i", { className: "ph ph-arrow-square-out", "aria-hidden": "true" }), children: b("fonts.openTools") })
        ] }) })
      ] }),
      /* @__PURE__ */ l.jsxs(Pe.Item, { id: "settings-application", className: "settings-section", value: "settings-application", children: [
        /* @__PURE__ */ l.jsx(Pe.Control, { children: /* @__PURE__ */ l.jsxs(Re, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx("i", { className: "ph ph-gear-six", "aria-hidden": "true" }),
          /* @__PURE__ */ l.jsxs(ve, { gap: 0, children: [
            /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: b("settings.application") }),
            /* @__PURE__ */ l.jsx(ee, { id: "settings-application-heading", fw: 600, children: b("settings.updatesControl") })
          ] })
        ] }) }),
        /* @__PURE__ */ l.jsx(Pe.Panel, { children: /* @__PURE__ */ l.jsxs(ve, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx(co, { id: "setting-language", ref: c, label: /* @__PURE__ */ l.jsx("span", { "data-i18n": "settings.languageLabel", children: b("settings.languageLabel") }), defaultValue: "en", data: [
            { value: "en", label: b("settings.languageEnglish") },
            { value: "fr", label: b("settings.languageFrench") },
            { value: "de", label: b("settings.languageGerman") }
          ] }),
          /* @__PURE__ */ l.jsx(
            kt.Wrapper,
            {
              id: "setting-appearance-wrapper",
              label: b("settings.appearance"),
              labelElement: "div",
              labelProps: { id: "setting-appearance-label" },
              children: /* @__PURE__ */ l.jsx(
                sr,
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
          /* @__PURE__ */ l.jsx(tn, { id: "setting-update-check", label: b("updates.dailyCheckSetting") }),
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
function tw() {
  const e = Qb("settings-dialog-mount"), t = { current: null };
  return Ue("settings", e, /* @__PURE__ */ l.jsx(ew, { controller: t })), {
    open: (n, o) => t.current?.open(n, o),
    close: () => t.current?.close(),
    isOpen: () => t.current?.isOpen() ?? !1
  };
}
const nw = {
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
function ow({ host: e, controller: t, boundary: n }) {
  const [o, r] = f.useState({
    projects: [],
    query: "",
    currentProject: null
  }), [s, a] = f.useState(""), i = f.useRef(""), [c, u] = f.useState(b("projects.searchPlaceholder")), [d, p] = f.useState(!1), [m, h] = f.useState(-1), g = _e(), v = f.useRef(null), w = f.useRef(void 0), x = f.useRef(o);
  x.current = o, f.useEffect(() => (t.setProjects = (y) => {
    if (x.current = y, r(y), h(-1), !y.query) {
      const N = y.currentProject ? y.projects.find((D) => D.id === y.currentProject) : void 0;
      u(N?.name ?? N?.id ?? (y.projects.length ? b("projects.searchPlaceholder") : b("projects.none")));
    }
  }, t.setCurrentProject = (y) => {
    const N = x.current, D = { ...N, currentProject: y };
    x.current = D, r(D);
    const O = y ? N.projects.find((z) => z.id === y) : void 0;
    u(O?.name ?? O?.id ?? (N.projects.length ? b("projects.searchPlaceholder") : b("projects.none")));
  }, t.focus = () => v.current?.focus(), () => {
    window.clearTimeout(w.current), t.setProjects = () => {
    }, t.setCurrentProject = () => {
    }, t.focus = () => {
    };
  }), [t]), f.useEffect(() => {
    if (s) return;
    const y = o.currentProject ? o.projects.find((N) => N.id === o.currentProject) : void 0;
    u(y?.name ?? y?.id ?? (o.projects.length ? b("projects.searchPlaceholder") : b("projects.none")));
  }, [g]), f.useEffect(() => {
    const y = (N) => {
      (!(N.target instanceof Node) || !n.contains(N.target)) && (p(!1), h(-1));
    };
    return document.addEventListener("pointerdown", y), () => document.removeEventListener("pointerdown", y);
  }, [n]);
  function E(y) {
    p(y), y || h(-1);
  }
  function j(y) {
    const N = { ...x.current, currentProject: y.id };
    x.current = N, r(N), u(y.name ?? y.id), i.current = "", a(""), v.current && (v.current.value = ""), v.current?.blur(), E(!1), e.openProject(y.id);
  }
  function k(y) {
    i.current = y, a(y), window.clearTimeout(w.current), w.current = window.setTimeout(() => e.search(y.trim()), 150);
  }
  function R(y) {
    if (d || E(!0), o.projects.length === 0) return;
    const N = y > 0 ? 0 : o.projects.length - 1, D = m < 0 ? N : Math.max(0, Math.min(o.projects.length - 1, m + y));
    h(D), window.requestAnimationFrame(() => {
      document.getElementById(`project-option-${D}`)?.scrollIntoView({ block: "nearest" });
    });
  }
  const P = o.projects.length === 0 ? o.query ? b("projects.noMatching") : b("projects.none") : "", S = d && m >= 0 && o.projects[m] ? `project-option-${m}` : void 0;
  return /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
    /* @__PURE__ */ l.jsx("i", { className: "ph ph-magnifying-glass", "aria-hidden": "true" }),
    /* @__PURE__ */ l.jsx(
      lt,
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
        "aria-expanded": d,
        "aria-autocomplete": "list",
        "aria-activedescendant": S,
        role: "combobox",
        onChange: (y) => k(y.currentTarget.value),
        onFocus: () => E(!0),
        onKeyDown: (y) => {
          if (y.key === "ArrowDown" || y.key === "ArrowUp") {
            y.preventDefault(), R(y.key === "ArrowDown" ? 1 : -1);
            return;
          }
          if (y.key === "Escape") {
            E(!1);
            return;
          }
          if (y.key !== "Enter") return;
          const N = v.current?.value ?? i.current;
          N !== i.current && (i.current = N, a(N));
          const D = o.projects[m], O = N.trim().toLocaleLowerCase(), _ = o.projects.find(
            (F) => F.id.toLocaleLowerCase() === O || (F.name ?? F.id).toLocaleLowerCase() === O
          ) ?? D;
          _ && (y.preventDefault(), j(_));
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
        "aria-expanded": d,
        onClick: () => {
          const y = !d;
          E(y), y && v.current?.focus();
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
        hidden: !d,
        children: [
          o.projects.map((y, N) => /* @__PURE__ */ l.jsxs(
            ue,
            {
              id: `project-option-${N}`,
              className: `project-option${N === m ? " active" : ""}`,
              styles: nw,
              type: "button",
              variant: "subtle",
              title: y.name ?? y.id,
              "data-project-id": y.id,
              role: "option",
              "aria-selected": y.id === o.currentProject,
              onClick: () => j(y),
              children: [
                /* @__PURE__ */ l.jsx("strong", { children: y.name ?? y.id }),
                /* @__PURE__ */ l.jsx(
                  "span",
                  {
                    className: "project-option-count",
                    "data-i18n-count": "projects.layerCount",
                    "data-count": String(y.layers),
                    children: It("projects.layerCount", y.layers)
                  }
                )
              ]
            },
            y.id
          )),
          P ? /* @__PURE__ */ l.jsx("p", { className: "project-options-empty", children: P }) : null
        ]
      }
    )
  ] });
}
function rw(e, t) {
  t.replaceChildren();
  const n = {
    setProjects: () => {
    },
    setCurrentProject: () => {
    },
    focus: () => {
    }
  }, o = Ue(
    "project-picker",
    t,
    /* @__PURE__ */ l.jsx(ow, { host: e, controller: n, boundary: t })
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
function sw(e) {
  const t = window.document.getElementById(e);
  if (!t) throw new Error(`missing element #${e}`);
  return t;
}
function sl(e) {
  return e.kind ?? "text";
}
function aw({ host: e, projectController: t }) {
  const [n, o] = f.useState([]), [r, s] = f.useState(() => /* @__PURE__ */ new Map()), [a, i] = f.useState([]), [c, u] = f.useState(""), [d, p] = f.useState([]), [m, h] = f.useState(!1), [g, v] = f.useState(!1);
  _e();
  const [w, x] = f.useState(null), E = f.useRef([]), j = f.useRef(m);
  j.current = m;
  const k = f.useRef(null), R = f.useRef(null);
  function P() {
    for (const $ of E.current) URL.revokeObjectURL($);
    E.current = [];
  }
  function S() {
    const $ = {};
    for (const M of n) {
      const L = r.get(M.name);
      L && ($[M.name] = L);
    }
    return $;
  }
  function y($, M) {
    s((L) => new Map(L).set($, M));
  }
  async function N($, M) {
    P(), p([]);
    const L = [];
    for (const I of M.variants) {
      const A = await uo(vf($, I.name));
      E.current.push(A), L.push({ variant: I, url: A });
    }
    p(L);
  }
  async function D($, M) {
    await e.guard($, async () => {
      const L = e.project();
      if (!L) return;
      const I = await fb(L, M);
      await N(L, I), e.say(It("templates.renderedCount", I.variants.length, {
        what: $,
        version: ke(I.templateVersion)
      }));
    });
  }
  async function O() {
    const $ = e.project();
    if (s(/* @__PURE__ */ new Map()), i([]), u(""), P(), p([]), !$) {
      o([]), j.current = !1, h(!1);
      return;
    }
    const M = await db($), L = M.isTemplate ? M.slots : [];
    o(L), j.current = L.length > 0, h(L.length > 0);
    const I = /* @__PURE__ */ new Map();
    for (const A of L)
      sl(A) === "color" && I.set(A.name, "#000000");
    s(I);
  }
  f.useLayoutEffect(() => {
    t.current = {
      projectChanged: O,
      setOpen: v,
      isVisible: () => j.current
    };
  }), f.useEffect(() => () => {
    t.current = null, P();
  }, [t]);
  async function z($) {
    const M = $.currentTarget.files?.[0];
    $.currentTarget.value = "", M && await e.guard(b("templates.loadValues"), async () => {
      const L = JSON.parse(await M.text());
      if (!Array.isArray(L)) throw new Error(b("templates.expectedArray"));
      const I = [];
      for (const A of L) {
        const B = A;
        if (typeof B.name != "string") throw new Error(b("templates.missingName"));
        const U = {};
        for (const [W, Y] of Object.entries(B.values ?? {})) U[W] = String(Y);
        I.push({ name: B.name, values: U });
      }
      i(I), e.say(It("templates.loadedVariants", I.length, { file: M.name }));
    });
  }
  async function _($) {
    const M = $.currentTarget.files?.[0];
    $.currentTarget.value = "";
    const L = w;
    x(null), !(!M || !L) && await e.guard(b("templates.importImage"), async () => {
      const I = e.project();
      if (!I) return;
      const A = await Ii(I, M);
      y(L, A.asset.id), await e.refresh(), s((B) => new Map(B)), e.say(b("templates.importedImage", { file: M.name, slot: L }));
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
          const M = sl($), L = r.get($.name) ?? (M === "color" ? "#000000" : "");
          return /* @__PURE__ */ l.jsxs(ve, { gap: 4, "data-slot": $.name, children: [
            M === "image" ? /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
              /* @__PURE__ */ l.jsx(no, { label: `${$.name}${$.required ? " *" : ""}`, title: $.description ?? void 0, "data-slot": $.name, value: r.get($.name) ?? "", onChange: (I) => y($.name, I ?? ""), data: [{ value: "", label: b(F.length ? "templates.leaveAsIs" : "templates.noImages") }, ...F.map((I) => ({ value: I.id, label: I.path }))] }),
              /* @__PURE__ */ l.jsx(ue, { type: "button", size: "xs", variant: "default", onClick: () => {
                x($.name), k.current?.click();
              }, children: b("templates.importButton") })
            ] }) : M === "color" ? /* @__PURE__ */ l.jsx(lt, { type: "color", label: `${$.name}${$.required ? " *" : ""}`, title: $.description ?? void 0, "data-slot": $.name, value: L, onChange: (I) => y($.name, I.currentTarget.value) }) : /* @__PURE__ */ l.jsx(lt, { label: `${$.name}${$.required ? " *" : ""}`, title: $.description ?? void 0, "data-slot": $.name, value: L, onChange: (I) => y($.name, I.currentTarget.value) }),
            $.description && /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: $.description })
          ] }, $.name);
        }) }),
        /* @__PURE__ */ l.jsx("input", { ref: k, id: "slot-image-file", type: "file", accept: "image/*,.svg", hidden: !0, onChange: ($) => {
          _($);
        } }),
        /* @__PURE__ */ l.jsxs(Re, { align: "end", wrap: "wrap", children: [
          /* @__PURE__ */ l.jsx(ue, { id: "preview-variant", type: "button", onClick: () => {
            D(b("templates.preview"), [{ name: "preview", values: S() }]);
          }, children: b("templates.preview") }),
          /* @__PURE__ */ l.jsx(lt, { id: "variant-name", label: b("templates.variantName"), value: c, onChange: ($) => u($.currentTarget.value) }),
          /* @__PURE__ */ l.jsx(ue, { id: "add-variant", type: "button", variant: "default", onClick: () => {
            const $ = c.trim();
            if (!$) {
              e.say(b("templates.variantNameRequired"), "error");
              return;
            }
            i((M) => [...M, { name: $, values: S() }]), u(""), e.say(b("templates.addedToBatch", { name: $ }));
          }, children: b("templates.addToBatch") })
        ] })
      ] }),
      /* @__PURE__ */ l.jsxs(ve, { gap: "sm", children: [
        /* @__PURE__ */ l.jsx(ee, { component: "h3", fw: 600, children: b("templates.batch") }),
        /* @__PURE__ */ l.jsx(ve, { component: "ol", id: "variant-rows", gap: "xs", m: 0, p: 0, children: a.map(($, M) => /* @__PURE__ */ l.jsx(ro, { component: "li", withBorder: !0, p: "xs", children: /* @__PURE__ */ l.jsxs(Re, { justify: "space-between", align: "flex-start", wrap: "nowrap", children: [
          /* @__PURE__ */ l.jsxs(ve, { gap: 2, style: { minWidth: 0 }, children: [
            /* @__PURE__ */ l.jsx(ee, { fw: 600, children: $.name }),
            /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: Object.entries($.values).map(([L, I]) => `${L}=${I}`).join("  ") })
          ] }),
          /* @__PURE__ */ l.jsx(ue, { type: "button", size: "xs", variant: "subtle", onClick: () => i((L) => L.filter((I, A) => A !== M)), children: b("templates.removeButton") })
        ] }) }, `${M}-${$.name}`)) }),
        /* @__PURE__ */ l.jsx("input", { ref: R, id: "values-file", type: "file", accept: "application/json,.json", hidden: !0, onChange: ($) => {
          z($);
        } }),
        /* @__PURE__ */ l.jsxs(Re, { wrap: "wrap", children: [
          /* @__PURE__ */ l.jsx(ue, { id: "load-values", type: "button", variant: "default", onClick: () => R.current?.click(), children: b("templates.loadJson") }),
          /* @__PURE__ */ l.jsx(ue, { id: "render-batch", type: "button", disabled: !a.length, onClick: () => {
            D(b("templates.renderBatch"), a);
          }, children: a.length ? It("templates.renderVariants", a.length) : b("templates.renderBatch") }),
          /* @__PURE__ */ l.jsx(ue, { id: "clear-batch", type: "button", variant: "default", disabled: !a.length, onClick: () => i([]), children: b("templates.clear") })
        ] })
      ] }),
      /* @__PURE__ */ l.jsxs(ve, { gap: "sm", children: [
        /* @__PURE__ */ l.jsx(ee, { component: "h3", fw: 600, children: b("templates.renderedVariants") }),
        /* @__PURE__ */ l.jsx("div", { id: "gallery", style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))", gap: "var(--mantine-spacing-sm)" }, children: d.map(({ variant: $, url: M }) => /* @__PURE__ */ l.jsxs(ro, { component: "figure", withBorder: !0, p: "sm", m: 0, children: [
          /* @__PURE__ */ l.jsx("img", { src: M, alt: b("templates.variantAlt", { name: $.name }), style: { display: "block", width: "100%", height: "auto" } }),
          /* @__PURE__ */ l.jsxs(ve, { component: "figcaption", gap: 4, mt: "sm", children: [
            /* @__PURE__ */ l.jsx(ee, { component: "strong", children: $.name }),
            /* @__PURE__ */ l.jsx(ee, { size: "xs", children: b("templates.bytesSize", { width: ke($.width), height: ke($.height), bytes: ke($.bytes) }) }),
            /* @__PURE__ */ l.jsx(ee, { component: "code", size: "xs", title: $.hash, children: $.hash.replace(/^sha256:/, "").slice(0, 12) }),
            /* @__PURE__ */ l.jsx(ue, { component: "a", href: M, download: `${$.name}.png`, variant: "default", size: "xs", children: b("templates.downloadButton") })
          ] })
        ] }, `${$.name}-${$.hash}`)) })
      ] })
    ] })
  ] });
}
function iw(e) {
  const t = sw("templates-mantine-mount"), n = { current: null };
  return Ue("templates", t, /* @__PURE__ */ l.jsx(aw, { host: e, projectController: n })), {
    projectChanged: async () => {
      await n.current?.projectChanged();
    },
    setOpen: (o) => n.current?.setOpen(o),
    isVisible: () => n.current?.isVisible() ?? !1
  };
}
const To = (e) => /* @__PURE__ */ l.jsx("i", { className: `ph ${e}`, "aria-hidden": "true" });
function Wr(e) {
  return e.name ?? (e.type === "text" ? e.text : e.type) ?? e.type;
}
function cw(e) {
  return e.type === "shape" ? { rect: "ph-square", ellipse: "ph-circle", line: "ph-line-segment", path: "ph-bezier-curve" }[gf(e) ?? ""] ?? "ph-shapes" : { text: "ph-text-t", image: "ph-image", svg: "ph-pen-nib", group: "ph-stack" }[e.type] ?? "ph-square";
}
function lw({ layer: e, finish: t }) {
  const n = f.useRef(null), o = f.useRef(!1);
  f.useEffect(() => {
    n.current?.focus(), n.current?.select();
  }, []);
  const r = (s) => {
    o.current || (o.current = !0, t(s ? n.current?.value.trim() ?? "" : null));
  };
  return /* @__PURE__ */ l.jsx(
    lt,
    {
      ref: n,
      size: "xs",
      autoFocus: !0,
      defaultValue: Wr(e),
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
function uw({ layer: e, depth: t, parent: n, inheritedGuard: o, snapshot: r, commands: s, elementProps: a, renaming: i, startRename: c, finishRename: u, expanded: d, hasChildren: p, toggleExpanded: m }) {
  const [h, g] = f.useState(!1), [v, w] = f.useState(!1), x = f.useRef(null);
  f.useEffect(() => () => {
    x.current && clearTimeout(x.current.timer);
  }, []);
  const E = r.selectedIds.includes(e.id), j = !o && Uo(e), k = o || !!Hr(e), R = !o && !e.protected && !e.readOnly, P = (y, N) => {
    E || s.select(e.id, !1), s.contextMenu?.(e.id, y, N);
  }, S = () => {
    x.current && clearTimeout(x.current.timer);
  };
  return /* @__PURE__ */ l.jsx(
    Q,
    {
      ...a,
      className: `${a.className} layer${E ? " selected" : ""}${k ? " guarded" : ""}${e.visible === !1 ? " hidden-layer" : ""}${h ? " dragging" : ""}${v ? " drop-target" : ""}`,
      "data-id": e.id,
      "data-type": e.type,
      "data-parent": n ?? "",
      style: { ...a.style, "--layer-depth": t, paddingInlineStart: 8 + t * 16 },
      draggable: j,
      onClick: (y) => {
        if (x.current?.fired) {
          x.current = null;
          return;
        }
        a.onClick(y), s.select(e.id, y.shiftKey || y.ctrlKey || y.metaKey);
      },
      onContextMenu: (y) => {
        y.preventDefault(), P(y.clientX, y.clientY);
      },
      onPointerDown: (y) => {
        if (y.pointerType !== "touch" || !s.contextMenu) return;
        S();
        const N = y.clientX, D = y.clientY;
        x.current = { x: N, y: D, fired: !1, timer: setTimeout(() => {
          x.current && (x.current.fired = !0), P(N, D);
        }, 450) };
      },
      onPointerMove: (y) => {
        x.current && Math.hypot(y.clientX - x.current.x, y.clientY - x.current.y) > 8 && S();
      },
      onPointerUp: S,
      onPointerCancel: S,
      onDragStart: (y) => {
        y.dataTransfer.setData("text/plain", e.id), g(!0);
      },
      onDragEnd: () => {
        g(!1), w(!1);
      },
      onDragOver: (y) => {
        y.preventDefault(), w(!0);
      },
      onDragLeave: () => w(!1),
      onDrop: (y) => {
        y.preventDefault(), w(!1);
        const N = y.dataTransfer.getData("text/plain");
        if (!N || N === e.id || !r.document) return;
        const D = Ve(De(r.document)), O = n ? D.find((F) => F.layer.id === n)?.layer : null, z = O?.type === "group" ? O.children ?? [] : De(r.document), _ = Math.max(0, z.findIndex((F) => F.id === e.id) + 1);
        s.reorder(N, e.id, e.type === "group" ? { at: "in", parent: e.id } : n ? { at: "in", parent: n, index: _ } : { at: "root", index: _ });
      },
      children: /* @__PURE__ */ l.jsxs(Re, { gap: "xs", wrap: "nowrap", children: [
        p ? /* @__PURE__ */ l.jsx(
          Mo,
          {
            className: "layer-control",
            size: "sm",
            variant: "subtle",
            "data-layer-toggle": e.id,
            title: b(d ? "layers.collapseGroup" : "layers.expandGroup"),
            "aria-label": b(d ? "layers.collapseGroup" : "layers.expandGroup"),
            "aria-expanded": d,
            onClick: (y) => {
              y.stopPropagation(), m();
            },
            children: To(d ? "ph-caret-down" : "ph-caret-right")
          }
        ) : null,
        /* @__PURE__ */ l.jsx(
          Mo,
          {
            className: "layer-control",
            size: "sm",
            variant: "subtle",
            disabled: !j,
            title: b(e.visible === !1 ? "layers.show" : "layers.hide"),
            "aria-label": b(e.visible === !1 ? "layers.show" : "layers.hide"),
            onClick: (y) => {
              y.stopPropagation(), s.toggleVisibility(e.id);
            },
            children: To(e.visible === !1 ? "ph-eye-slash" : "ph-eye")
          }
        ),
        /* @__PURE__ */ l.jsx(Q, { className: "layer-icon", children: To(cw(e)) }),
        /* @__PURE__ */ l.jsx(Q, { style: { flex: 1, minWidth: 0 }, children: i ? /* @__PURE__ */ l.jsx(lw, { layer: e, finish: (y) => {
          u(), y !== null && y !== (e.name ?? "") && s.rename(e.id, y);
        } }) : /* @__PURE__ */ l.jsx(
          ee,
          {
            component: "span",
            className: "name",
            size: "sm",
            truncate: !0,
            title: Hr(e) ?? b("layers.renameHint"),
            onDoubleClick: (y) => {
              y.stopPropagation(), j && c();
            },
            children: Wr(e)
          }
        ) }),
        /* @__PURE__ */ l.jsx(
          Mo,
          {
            className: "layer-control",
            size: "sm",
            variant: "subtle",
            disabled: !R,
            title: b(e.locked ? "layers.unlock" : "layers.lock"),
            "aria-label": b(e.locked ? "layers.unlock" : "layers.lock"),
            onClick: (y) => {
              y.stopPropagation(), s.toggleLocked(e.id);
            },
            children: To(e.locked ? "ph-lock" : "ph-lock-open")
          }
        )
      ] })
    }
  );
}
function dw({ snapshot: e, commands: t }) {
  _e();
  const [n, o] = f.useState(null), [r, s] = f.useState({}), a = e.document ? De(e.document) : [], i = f.useMemo(() => {
    const p = e.query.trim().toLowerCase(), m = (g) => Wr(g).toLowerCase().includes(p) || g.type === "group" && (g.children ?? []).some(m), h = (g, v, w) => [...g].reverse().filter((x) => !p || m(x)).map((x) => ({
      value: x.id,
      label: Wr(x),
      layer: x,
      parent: v,
      guarded: w,
      ...x.type === "group" ? { children: h(x.children ?? [], x.id, w || !Uo(x)) } : {}
    }));
    return h(e.document ? De(e.document) : [], null, !1);
  }, [e.document, e.query]), c = f.useMemo(() => {
    const p = /* @__PURE__ */ new Map(), m = (h) => {
      for (const g of h)
        p.set(g.value, g), g.children && m(g.children);
    };
    return m(i), p;
  }, [i]), u = f.useMemo(() => Object.fromEntries([...c.keys()].map((p) => [p, r[p] ?? !0])), [c, r]), d = df({
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
    Es,
    {
      id: "layers",
      "aria-label": b("layers.tab"),
      data: i,
      tree: d,
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
        if (h && (p.key === "F2" && (p.preventDefault(), p.stopPropagation(), !h.guarded && Uo(h.layer) && o(h.value)), (p.key === "Enter" || p.key === " ") && (p.preventDefault(), p.stopPropagation(), t.select(h.value, p.shiftKey || p.ctrlKey || p.metaKey)), p.key === "F10" && p.shiftKey)) {
          p.preventDefault(), p.stopPropagation(), e.selectedIds.includes(h.value) || t.select(h.value, !1);
          const g = (m.classList.contains("layer") ? m : m.querySelector(".layer")).getBoundingClientRect();
          t.contextMenu?.(h.value, g.left + 24, g.top + 24);
        }
      },
      renderNode: ({ node: p, level: m, elementProps: h, expanded: g, hasChildren: v }) => {
        const { layer: w, parent: x, guarded: E } = p;
        return /* @__PURE__ */ l.jsx(
          uw,
          {
            layer: w,
            depth: m - 1,
            parent: x,
            inheritedGuard: E,
            snapshot: e,
            commands: t,
            elementProps: h,
            renaming: n === w.id,
            startRename: () => o(w.id),
            finishRename: () => o(null),
            expanded: g,
            hasChildren: v,
            toggleExpanded: () => d.toggleExpanded(w.id)
          }
        );
      }
    }
  ) : /* @__PURE__ */ l.jsx(Q, { component: "ul", id: "layers", role: "tree", "aria-label": b("layers.tab"), m: 0, p: 0, style: { listStyle: "none" }, children: /* @__PURE__ */ l.jsx(Q, { component: "li", className: `layers-empty${a.length ? " compact" : ""}`, p: "md", children: /* @__PURE__ */ l.jsxs(ve, { gap: "xs", align: "center", children: [
    /* @__PURE__ */ l.jsx(Q, { children: To(a.length ? "ph-magnifying-glass" : "ph-stack-simple") }),
    /* @__PURE__ */ l.jsx(ee, { fw: 600, children: b(a.length ? "layers.noMatching" : "layers.none") }),
    /* @__PURE__ */ l.jsx(ee, { size: "sm", c: "dimmed", children: b(a.length ? "layers.trySearch" : "layers.emptyHint") })
  ] }) }) });
}
function fw({ snapshot: e }) {
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
function pw({ snapshot: e, commands: t }) {
  _e();
  const [n, o] = f.useState(e.dock ?? "properties");
  f.useEffect(() => {
    e.dock && o(e.dock);
  }, [e.dock]);
  const r = e.document ? Ve(De(e.document)) : [], s = r.filter((c) => e.selectedIds.includes(c.layer.id)), a = s.length > 0 && s.every((c) => {
    if (!Uo(c.layer)) return !1;
    let u = c.parent;
    for (; u; ) {
      const d = r.find((p) => p.layer.id === u);
      if (!d || !Uo(d.layer)) return !1;
      u = d.parent;
    }
    return !0;
  }), i = (c) => {
    (c === "properties" || c === "layers" || c === "history") && (o(c), t.showDock(c));
  };
  return /* @__PURE__ */ l.jsxs(
    ft,
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
        /* @__PURE__ */ l.jsxs(ft.List, { children: [
          /* @__PURE__ */ l.jsx(ft.Tab, { id: "properties-tab", value: "properties", children: b("properties.tab") }),
          /* @__PURE__ */ l.jsx(ft.Tab, { id: "layers-tab", value: "layers", children: b("layers.tab") }),
          /* @__PURE__ */ l.jsx(ft.Tab, { id: "history-tab", value: "history", children: b("history.tab") })
        ] }),
        /* @__PURE__ */ l.jsx(ft.Panel, { value: "properties", id: "properties-panel", className: "dock-view", children: /* @__PURE__ */ l.jsx("div", { id: "advanced-inspector" }) }),
        /* @__PURE__ */ l.jsx(ft.Panel, { value: "layers", id: "layers-view", className: "dock-view", children: /* @__PURE__ */ l.jsxs(ve, { className: "layers-content", gap: "sm", p: "sm", children: [
          /* @__PURE__ */ l.jsx(
            lt,
            {
              id: "layer-search",
              value: e.query,
              disabled: al(e.document),
              placeholder: b(al(e.document) ? "layers.noSearch" : "layers.searchPlaceholder"),
              "aria-label": b("layers.searchPlaceholder"),
              onChange: (c) => t.setQuery(c.currentTarget.value)
            }
          ),
          /* @__PURE__ */ l.jsx(dw, { snapshot: e, commands: t }),
          /* @__PURE__ */ l.jsxs(Re, { gap: "xs", children: [
            /* @__PURE__ */ l.jsx(ue, { id: "group-layers", variant: "default", size: "xs", disabled: !a || s.length < 2, onClick: t.groupSelection, children: b("layers.groupButton") }),
            /* @__PURE__ */ l.jsx(ue, { id: "delete-layer", variant: "light", color: "red", size: "xs", disabled: !a, onClick: t.deleteSelection, children: b("layers.deleteButton") })
          ] })
        ] }) }),
        /* @__PURE__ */ l.jsx(ft.Panel, { value: "history", id: "history-view", className: "dock-view", children: /* @__PURE__ */ l.jsx(fw, { snapshot: e }) })
      ]
    }
  );
}
function al(e) {
  return !e || De(e).length === 0;
}
function mw(e, t, n) {
  let o = (a) => {
  };
  function r() {
    const [a, i] = f.useState(t);
    return f.useEffect(() => (o = (c) => i({ ...c }), () => {
      o = () => {
      };
    }), []), /* @__PURE__ */ l.jsx(pw, { snapshot: a, commands: n });
  }
  const s = Ue("structure", e, /* @__PURE__ */ l.jsx(r, {}));
  return { setSnapshot: (a) => o(a), destroy: s };
}
function hw(e) {
  return typeof e == "string" ? e : JSON.stringify(e, null, 2);
}
function qr(e) {
  return Array.isArray(e) ? `[${e.map(qr).join(",")}]` : e && typeof e == "object" ? `{${Object.keys(e).sort().map(
    (t) => `${JSON.stringify(t)}:${qr(e[t])}`
  ).join(",")}}` : JSON.stringify(e);
}
function il(e, t) {
  if (typeof e == "string" && typeof t == "string") {
    const n = (o) => {
      const r = /^#([\da-f]{6})([\da-f]{2})?$/i.exec(o);
      return r ? `${r[1].toLowerCase()}${(r[2] ?? "ff").toLowerCase()}` : o;
    };
    return n(e) === n(t);
  }
  return qr(e) === qr(t);
}
function Cf({ id: e, label: t, value: n, className: o, compact: r = !1, disabled: s = !1, onCommit: a, clear: i }) {
  _e();
  const c = typeof n == "string" ? n : "#000000", [u, d] = f.useState(typeof n == "string" ? "solid" : "json"), [p, m] = f.useState(c), [h, g] = f.useState(hw(n)), [v, w] = f.useState(""), [x, E] = f.useState(!1), j = f.useRef(n);
  function k(y) {
    let N = y.trim();
    /^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(N) && (typeof j.current == "string" && /^#[\da-f]{6}$/i.test(j.current) && /^#([\da-f]{6})ff$/i.test(N) && (N = N.slice(0, 7)), w(""), !il(j.current, N) && (j.current = N, a(N)));
  }
  function R() {
    let y;
    try {
      y = JSON.parse(h);
    } catch {
      w(b("paint.jsonSyntaxError"));
      return;
    }
    if (!y || typeof y != "object" || Array.isArray(y) || !("kind" in y)) {
      w(b("paint.jsonObjectError"));
      return;
    }
    w("");
    const N = y;
    il(j.current, N) || (j.current = N, a(N));
  }
  const P = /* @__PURE__ */ l.jsxs(ve, { gap: "xs", className: "paint-input", "data-paint-editor": e, children: [
    /* @__PURE__ */ l.jsx(
      sr,
      {
        "aria-label": t,
        value: u,
        onChange: (y) => d(y),
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
        or,
        {
          id: `${e}-solid`,
          classNames: o ? { input: o } : void 0,
          label: t,
          value: p,
          format: "hexa",
          fixOnBlur: !1,
          disabled: s,
          onChange: (y) => m(y),
          onChangeEnd: k,
          onBlur: (y) => k(y.currentTarget.value),
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
        io,
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
          /* @__PURE__ */ l.jsx(ue, { id: `${e}-apply-json`, type: "button", size: "xs", variant: "light", disabled: s, onClick: R, children: b("paint.applyJson") }),
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
  if (!r) return P;
  const S = typeof n == "string" ? { backgroundColor: n } : { background: "linear-gradient(135deg, var(--color-accent) 0 50%, var(--color-surface-subtle) 50% 100%)" };
  return /* @__PURE__ */ l.jsxs(
    Be,
    {
      id: e,
      opened: x,
      onChange: E,
      position: "bottom-start",
      offset: 6,
      width: "min(20rem, calc(100vw - 1rem))",
      withinPortal: !0,
      trapFocus: !0,
      returnFocus: !0,
      zIndex: 400,
      shadow: "md",
      children: [
        /* @__PURE__ */ l.jsx(Be.Target, { children: /* @__PURE__ */ l.jsx(
          Mo,
          {
            className: "paint-swatch-trigger",
            type: "button",
            variant: "default",
            "aria-label": t,
            title: t,
            "aria-haspopup": "dialog",
            "aria-expanded": x,
            "data-paint-trigger": e,
            disabled: s,
            onClick: () => E((y) => !y),
            children: /* @__PURE__ */ l.jsx("span", { className: "paint-swatch", "aria-hidden": "true", style: S })
          }
        ) }),
        /* @__PURE__ */ l.jsx(Be.Dropdown, { className: "paint-popover", "data-paint-popover": e, children: P })
      ]
    }
  );
}
let gw = 0;
function vw(e, t) {
  return Ue(`paint-${++gw}`, e, /* @__PURE__ */ l.jsx(Cf, { ...t }));
}
let jf = 0;
function Di(e) {
  return JSON.stringify([e.project, e.document, e.layer]);
}
function kf(e) {
  const t = e.runs.every(wa) && e.runs.map((n) => n.text).join("") === e.text;
  return { capture: structuredClone(e), rows: e.runs.map((n) => ({ key: ++jf, raw: structuredClone(n), legacy: !t || !wa(n) })), error: "", pending: !1 };
}
function cl(e = "") {
  return { key: ++jf, raw: { text: e } };
}
function Ir(e) {
  return !e.legacy && !!e.raw && typeof e.raw == "object" && !Array.isArray(e.raw) && typeof e.raw.text == "string";
}
function wa(e) {
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
  return !(n != null && !yw(n));
}
function yw(e) {
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
function bw(e, t, n) {
  const o = structuredClone(e);
  return n === void 0 ? delete o[t] : o[t] = structuredClone(n), o;
}
function Jn(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function Xs(e, t) {
  return Object.fromEntries(Object.entries(structuredClone(e)).filter(([n]) => !t.includes(n)));
}
function ll(e) {
  const t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    if (!Jn(o) || typeof o.offset != "number" || !Number.isFinite(o.offset)) continue;
    const r = o.offset;
    t.has(r) && n.add(r), t.set(r, o);
  }
  for (const o of n) t.delete(o);
  return t;
}
function ww(e, t) {
  if (!Jn(e) || !Jn(t) || e.kind !== t.kind || !["linear", "radial"].includes(String(t.kind))) return structuredClone(t);
  const n = t.kind === "radial", o = {
    ...Xs(e, n ? ["kind", "center", "radius", "stops"] : ["kind", "angle", "stops"]),
    ...structuredClone(t)
  };
  if (Array.isArray(e.stops) && Array.isArray(t.stops)) {
    const r = ll(e.stops), s = ll(t.stops);
    o.stops = t.stops.map((a) => {
      if (!Jn(a) || typeof a.offset != "number" || !s.has(a.offset)) return structuredClone(a);
      const i = r.get(a.offset);
      return { ...i ? Xs(i, ["offset", "color", "alpha"]) : {}, ...structuredClone(a) };
    });
  }
  if (n && Jn(e.center)) {
    const r = Xs(e.center, ["x", "y"]);
    Jn(t.center) ? o.center = { ...r, ...structuredClone(t.center) } : !Object.hasOwn(t, "center") && Object.keys(r).length && (o.center = { ...r, x: 0.5, y: 0.5 });
  }
  return o;
}
function xa(e) {
  return JSON.stringify(e.rows.map((t) => t.raw)) !== JSON.stringify(e.capture.runs);
}
function xw(e) {
  if (!xa(e)) return null;
  const t = e.rows.map((o) => structuredClone(o.raw)), n = { op: "update", id: e.capture.layer, runs: t };
  if (t.length && e.rows.every(Ir) && t.every(wa)) {
    const o = t.map((r) => r.text).join("");
    o !== e.capture.text && Object.assign(n, { text: o });
  }
  return n;
}
function Sw(e) {
  _e();
  const [, t] = f.useState(0), n = f.useRef(null), o = Di(e.capture), r = e.drafts.get(o), s = e.disabled || !!r?.pending || !!r?.reconcile, a = () => t((g) => g + 1), i = (g) => requestAnimationFrame(() => {
    (n.current ?? [...document.querySelectorAll("[data-runs-editor]")].find((w) => w.dataset.runsIdentity === o))?.querySelector(g)?.focus();
  }), c = (g) => {
    e.drafts.set(o, g), a();
  }, u = () => {
    c(kf(e.capture)), i("#runs-add");
  }, d = (g, v, w) => {
    if (!r || s) return;
    const x = r.rows[g];
    Ir(x) && (x.raw = bw(x.raw, v, w), r.error = "", c(r));
  };
  async function p() {
    if (!r || s || !xa(r)) return;
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
  function h(g, v, w, x, E) {
    const j = g[w], k = j != null, R = `run-${r.rows[v].key}-${w}`, P = `${b("runs.row", { number: v + 1 })}: ${b(x)}`;
    return /* @__PURE__ */ l.jsxs(ve, { gap: 4, style: { minWidth: 0 }, children: [
      /* @__PURE__ */ l.jsx(
        no,
        {
          "aria-label": `${P}: ${b("runs.mode")}`,
          label: b(x),
          size: "xs",
          value: k ? "value" : "inherit",
          data: [{ value: "inherit", label: b("runs.inherit") }, { value: "value", label: b("runs.override") }],
          disabled: s,
          onChange: (S) => d(v, w, S === "inherit" ? void 0 : E)
        }
      ),
      w === "fontFamily" ? /* @__PURE__ */ l.jsx(_b, { host: e.fonts, label: P, value: String(k ? j : E), disabled: s || !k, onCommit: (S) => d(v, w, S) }) : w === "fontStyle" ? /* @__PURE__ */ l.jsx(
        no,
        {
          id: R,
          "aria-label": P,
          size: "xs",
          value: String(k ? j : E),
          disabled: s || !k,
          data: [{ value: "normal", label: b("runs.normal") }, { value: "italic", label: b("runs.italic") }],
          onChange: (S) => d(v, w, S)
        }
      ) : /* @__PURE__ */ l.jsx(
        lt,
        {
          id: R,
          "aria-label": P,
          size: "xs",
          type: "number",
          value: String(k ? j : E),
          disabled: s || !k,
          onChange: (S) => {
            const y = S.currentTarget.value;
            d(v, w, y === "" ? "" : Number(y));
          }
        }
      )
    ] }, w);
  }
  return /* @__PURE__ */ l.jsx("div", { ref: n, className: "runs-editor", "data-runs-editor": !0, "data-runs-identity": o, onKeyDown: (g) => g.stopPropagation(), children: /* @__PURE__ */ l.jsxs(ve, { gap: "xs", children: [
    /* @__PURE__ */ l.jsx(ee, { fw: 600, children: b("runs.title") }),
    /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: b("runs.help") }),
    r ? /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
      r.capture.version !== e.capture.version && /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "orange", role: "status", children: b("runs.conflict") }),
      /* @__PURE__ */ l.jsx(tt, { "aria-label": b("runs.title"), style: { tableLayout: "fixed", width: "100%" }, children: /* @__PURE__ */ l.jsx(tt.Tbody, { children: r.rows.map((g, v) => /* @__PURE__ */ l.jsx(tt.Tr, { "data-run-row": g.key, children: /* @__PURE__ */ l.jsx(tt.Td, { style: { padding: "8px 0" }, children: /* @__PURE__ */ l.jsxs(ve, { gap: "xs", children: [
        /* @__PURE__ */ l.jsxs(Re, { justify: "space-between", gap: 4, children: [
          /* @__PURE__ */ l.jsx(ee, { size: "sm", fw: 600, children: b("runs.row", { number: v + 1 }) }),
          /* @__PURE__ */ l.jsxs(Re, { gap: 4, wrap: "wrap", children: [
            [[-1, "runs.up"], [1, "runs.down"]].map(([w, x]) => /* @__PURE__ */ l.jsx(
              ue,
              {
                size: "compact-xs",
                variant: "subtle",
                "aria-label": `${b(x)}: ${v + 1}`,
                "data-run-move": w,
                disabled: s || v + w < 0 || v + w >= r.rows.length,
                onClick: () => {
                  [r.rows[v], r.rows[v + w]] = [r.rows[v + w], r.rows[v]], c(r), i(`[data-run-row="${g.key}"] textarea`);
                },
                children: b(x)
              },
              w
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
        Ir(g) ? /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
          /* @__PURE__ */ l.jsx(
            io,
            {
              "data-run-text": !0,
              "aria-label": `${b("runs.text")}: ${v + 1}`,
              label: b("runs.text"),
              value: g.raw.text,
              autosize: !0,
              minRows: 2,
              disabled: s,
              onChange: (w) => d(v, "text", w.currentTarget.value)
            }
          ),
          /* @__PURE__ */ l.jsxs(Da, { cols: 2, spacing: "xs", children: [
            h(g.raw, v, "fontFamily", "editor.fontFamily", e.layer.fontFamily),
            h(g.raw, v, "fontSize", "properties.fontSize", e.layer.fontSize),
            h(g.raw, v, "fontWeight", "properties.weight", e.layer.fontWeight ?? 400),
            h(g.raw, v, "fontStyle", "properties.style", e.layer.fontStyle ?? "normal"),
            h(g.raw, v, "letterSpacing", "properties.letterSpacing", e.layer.letterSpacing ?? 0)
          ] }),
          /* @__PURE__ */ l.jsx(
            no,
            {
              size: "xs",
              label: b("properties.colour"),
              "aria-label": `${b("runs.fillMode")}: ${v + 1}`,
              "data-run-fill-mode": !0,
              value: Object.hasOwn(g.raw, "color") ? g.raw.color === null ? "none" : "value" : "inherit",
              disabled: s,
              data: [{ value: "inherit", label: b("runs.inherit") }, { value: "none", label: b("runs.noFill") }, { value: "value", label: b("runs.override") }],
              onChange: (w) => d(v, "color", w === "inherit" ? void 0 : w === "none" ? null : e.layer.color ?? "#000000")
            }
          ),
          Object.hasOwn(g.raw, "color") && g.raw.color !== null && /* @__PURE__ */ l.jsx(
            Cf,
            {
              id: `run-${g.key}-paint`,
              label: `${b("properties.colour")}: ${v + 1}`,
              value: g.raw.color,
              disabled: s,
              onCommit: (w) => d(v, "color", ww(r.rows[v].raw.color, w))
            },
            `${g.key}-${typeof g.raw.color}`
          )
        ] }) : /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
          /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "orange", children: b("runs.unsupported") }),
          /* @__PURE__ */ l.jsx(io, { "aria-label": `${b("runs.raw")}: ${v + 1}`, value: JSON.stringify(g.raw, null, 2), readOnly: !0, autosize: !0, maxRows: 6 })
        ] })
      ] }) }) }, g.key)) }) }),
      /* @__PURE__ */ l.jsxs(Re, { gap: "xs", children: [
        /* @__PURE__ */ l.jsx(ue, { id: "runs-add", size: "xs", variant: "light", disabled: s, onClick: () => {
          const g = cl(r.rows.length === 0 && r.capture.runs.length === 0 ? r.capture.text : "");
          r.rows.push(g), c(r), i(`[data-run-row="${g.key}"] textarea`);
        }, children: b("runs.add") }),
        /* @__PURE__ */ l.jsx(ue, { id: "runs-clear", size: "xs", variant: "light", disabled: s || !r.rows.length, onClick: () => {
          r.rows = [], c(r), i("#runs-add");
        }, children: b("runs.clear") }),
        r.rows.some((g) => !Ir(g)) && /* @__PURE__ */ l.jsx(ue, { id: "runs-replace", size: "xs", variant: "light", disabled: s, onClick: () => {
          const g = cl(r.capture.text);
          r.rows = [g], c(r), i(`[data-run-row="${g.key}"] textarea`);
        }, children: b("runs.replace") })
      ] }),
      r.error && /* @__PURE__ */ l.jsx(ee, { id: "runs-error", role: "alert", tabIndex: -1, size: "xs", c: "red", children: r.error }),
      (r.error || r.capture.version !== e.capture.version) && /* @__PURE__ */ l.jsx(ue, { id: "runs-reload", size: "xs", variant: "light", disabled: r.pending, onClick: () => {
        m();
      }, children: b("runs.reload") }),
      /* @__PURE__ */ l.jsxs(Re, { gap: "xs", children: [
        /* @__PURE__ */ l.jsx(ue, { id: "runs-apply", size: "xs", disabled: s || !xa(r), loading: r.pending, onClick: () => {
          p();
        }, children: b("runs.apply") }),
        /* @__PURE__ */ l.jsx(ue, { id: "runs-cancel", size: "xs", variant: "default", disabled: r.pending, onClick: () => {
          e.drafts.delete(o), a(), i("#runs-edit");
        }, children: b("runs.cancel") })
      ] })
    ] }) : /* @__PURE__ */ l.jsx(ue, { id: "runs-edit", size: "xs", variant: "light", disabled: e.disabled, onClick: u, children: b("runs.edit") })
  ] }) });
}
let Cw = 0;
function jw(e, t) {
  return Ue(`text-runs-${++Cw}`, e, /* @__PURE__ */ l.jsx(Sw, { ...t }));
}
function kw({ assets: e, value: t, disabled: n = !1, onChange: o, onUpload: r }) {
  _e();
  const [s, a] = f.useState(null), [i, c] = f.useState(t);
  f.useEffect(() => c(t), [t]);
  const u = e.filter((p) => p.mediaType.startsWith("image/")), d = [
    { value: "", label: b("canvas.backgroundImageNone") },
    ...u.map((p) => ({
      value: p.id,
      label: `${p.path.split("/").at(-1) ?? p.path} (${p.mediaType})`
    }))
  ];
  return /* @__PURE__ */ l.jsxs(ve, { gap: "xs", className: "canvas-image-input", children: [
    /* @__PURE__ */ l.jsx(
      co,
      {
        id: "canvas-background-image",
        label: b("canvas.backgroundImage"),
        value: i?.asset ?? "",
        data: d,
        disabled: n,
        onChange: (p) => {
          const m = p.currentTarget.value, h = m ? { asset: m, fit: i?.fit ?? "fill" } : null;
          c(h), o(h);
        }
      }
    ),
    /* @__PURE__ */ l.jsx(
      co,
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
        bi,
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
let Ew = 0;
function Rw(e, t) {
  return Ue(
    `canvas-image-${++Ew}`,
    e,
    /* @__PURE__ */ l.jsx(kw, { ...t })
  );
}
const Nw = [
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
function Pw({ value: e, disabled: t, onChange: n }) {
  return _e(), /* @__PURE__ */ l.jsx(
    bn.Group,
    {
      id: "canvas-anchor-group",
      name: "canvas-anchor",
      value: e,
      onChange: (o) => n(o),
      children: /* @__PURE__ */ l.jsx(Da, { cols: 3, className: "canvas-size-anchor-grid", children: Nw.map((o) => /* @__PURE__ */ l.jsx(
        bn,
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
function Tw(e, t, n, o) {
  let r = (i, c) => {
  };
  function s() {
    const [i, c] = f.useState(t), [u, d] = f.useState(n);
    return f.useEffect(() => (r = (p, m) => {
      c(p), d(m);
    }, () => {
      r = () => {
      };
    }), []), /* @__PURE__ */ l.jsx(Pw, { value: i, disabled: u, onChange: o });
  }
  const a = Ue("canvas-anchor-picker", e, /* @__PURE__ */ l.jsx(s, {}));
  return { setState: (i, c) => r(i, c), destroy: a };
}
const oo = (e) => typeof e == "function" ? e() : e;
function Aw(e) {
  _e();
  const t = oo(e.label), n = e.title === void 0 ? void 0 : oo(e.title), o = f.useRef(e.value), r = (s) => {
    s !== o.current && (o.current = s, e.onCommit(s));
  };
  return e.options ? /* @__PURE__ */ l.jsx(
    co,
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
      data: e.options.map((s) => ({ value: s.value, label: oo(s.label) })),
      classNames: e.className ? { input: e.className } : void 0,
      onChange: (s) => r(s.currentTarget.value)
    }
  ) : e.type === "textarea" ? /* @__PURE__ */ l.jsx(
    io,
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
    lt,
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
function Iw(e) {
  _e();
  const t = oo(e.label), n = e.title === void 0 ? void 0 : oo(e.title);
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
let Oi = 0;
function Mw(e) {
  _e();
  const [t, n] = f.useState(e.checked);
  return f.useEffect(() => {
    n(e.checked);
  }, [e.checked]), /* @__PURE__ */ l.jsx(
    tn,
    {
      id: e.id,
      label: oo(e.label),
      checked: t,
      disabled: e.disabled,
      classNames: e.className ? { input: e.className } : void 0,
      onChange: (o) => {
        n(o.currentTarget.checked), e.onChange(o.currentTarget.checked);
      }
    }
  );
}
function Do(e, t) {
  return Ue(`inspector-checkbox-${++Oi}`, e, /* @__PURE__ */ l.jsx(Mw, { ...t }));
}
function at(e, t) {
  return Ue(`inspector-field-${++Oi}`, e, /* @__PURE__ */ l.jsx(Aw, { ...t }));
}
function Qe(e, t) {
  return Ue(`inspector-button-${++Oi}`, e, /* @__PURE__ */ l.jsx(Iw, { ...t }));
}
function Dw({ state: e, onClose: t }) {
  return _e(), f.useEffect(() => {
    e.open && document.querySelector("#context-menu button[role=menuitem]:not(:disabled)")?.focus();
  }, [e.open, e.items]), /* @__PURE__ */ l.jsx(
    ro,
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
      children: /* @__PURE__ */ l.jsx(ve, { gap: 4, children: e.items.map((n, o) => n.kind === "separator" ? /* @__PURE__ */ l.jsx(ms, { role: "separator" }, `separator-${o}`) : /* @__PURE__ */ l.jsx(
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
function Ow(e) {
  const t = { open: !1, items: [], x: 8, y: 8 };
  let n = t, o = (a) => {
  };
  function r() {
    const [a, i] = f.useState(t);
    return f.useEffect(() => (o = (c) => {
      n = c, i(c);
    }, () => {
      o = () => {
      };
    }), []), /* @__PURE__ */ l.jsx(Dw, { state: a, onClose: () => o({ ...n, open: !1 }) });
  }
  const s = Ue("context-menu", e, /* @__PURE__ */ l.jsx(r, {}));
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
const $w = {
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
}, Lw = {
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
function zw({ title: e, initiallyOpen: t, bodyElement: n }) {
  _e();
  const [o, r] = f.useState(t ? e : null), s = $w[e], a = s ? b(s) : e;
  return /* @__PURE__ */ l.jsx(
    Pe,
    {
      value: o,
      onChange: r,
      keepMounted: !0,
      keepMountedMode: "display-none",
      className: "dock-accordion",
      classNames: { item: "dock-section", control: "dock-section-control", panel: "dock-section-panel", content: "dock-section-content" },
      children: /* @__PURE__ */ l.jsxs(Pe.Item, { value: e, children: [
        /* @__PURE__ */ l.jsx(Pe.Control, { children: /* @__PURE__ */ l.jsxs(Re, { gap: "xs", wrap: "nowrap", children: [
          /* @__PURE__ */ l.jsx("span", { className: "dock-section-icon", children: /* @__PURE__ */ l.jsx("i", { className: `ph ${Lw[e] ?? "ph-sliders-horizontal"}`, "aria-hidden": "true" }) }),
          /* @__PURE__ */ l.jsx(ee, { component: "span", className: "dock-section-heading", children: a })
        ] }) }),
        /* @__PURE__ */ l.jsx(Pe.Panel, { children: /* @__PURE__ */ l.jsx("div", { ref: (i) => {
          i && n.parentElement !== i && i.append(n);
        } }) })
      ] })
    }
  );
}
let _w = 0;
function Fw(e, t, n) {
  const o = document.createElement("div");
  o.className = "dock-section-host", e.append(o);
  const r = document.createElement("div");
  r.className = "dock-section-body";
  const s = `inspector-section-${++_w}`, a = Ue(
    s,
    o,
    /* @__PURE__ */ l.jsx(zw, { title: t, initiallyOpen: n, bodyElement: r })
  );
  return {
    body: r,
    destroy() {
      a(), o.remove();
    }
  };
}
const C = {
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
}, jn = new Kb(), Sa = /* @__PURE__ */ new Map(), Qt = [];
jn.onSettled = (e) => {
  Qt.push({
    label: e.label,
    ok: e.ok,
    superseded: e.superseded,
    at: performance.now() - e.waitedMs,
    waitedMs: e.waitedMs,
    ranMs: e.ranMs,
    previewSettledAt: null
  }), Qt.length > 50 && Qt.shift(), Ef();
};
function Ca(e, t) {
  yp(e, t);
}
jn.onActiveChange = (e) => {
  C.busy = e, e ? (hp("info"), Ca("ph-circle-notch", "save.working")) : gp() !== "error" && Ca("ph-check-circle", "save.allChangesSaved");
};
function Bw() {
  for (let e = Qt.length - 1; e >= 0; e--) {
    const t = Qt[e];
    if (t && t.previewSettledAt === null) {
      t.previewSettledAt = performance.now();
      break;
    }
  }
  Ef();
}
const Vw = new URLSearchParams(window.location.search).has("perf");
window.__assemblashPerf = Qt;
function Ef() {
  if (!Vw) return;
  let e = document.getElementById("assemblash-perf");
  e || (e = document.createElement("div"), e.id = "assemblash-perf", e.setAttribute(
    "style",
    "position:fixed;bottom:8px;left:8px;z-index:9999;font:11px/1.5 ui-monospace,monospace;background:rgba(0,0,0,.82);color:#eee;padding:6px 9px;border-radius:6px;pointer-events:none;white-space:pre"
  ), document.body.append(e));
  const t = Qt[Qt.length - 1], n = t && t.previewSettledAt !== null ? `${Math.round(t.previewSettledAt - t.at)}ms` : "…";
  e.textContent = t ? `${t.label}: waited ${t.waitedMs}ms, ran ${t.ranMs ?? "–"}ms, settled ${n}
queue ${jn.size}, records ${Qt.length}` : "no interactions yet";
}
const $i = "#3366cc";
function Hw(e) {
  return typeof e == "string" ? e : null;
}
const Rf = "#111111", Nf = 2, Uw = ["rect", "ellipse"];
function Ww(e) {
  const t = e.clip;
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = t.shape;
    if (typeof n == "string") return n;
  }
  return null;
}
function ul(e) {
  const t = e.clip;
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = t.cornerRadius;
    if (typeof n == "number") return n;
  }
  return 0;
}
function qw(e) {
  if (e.type !== "image") return null;
  const t = e.crop;
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = t, o = n.x, r = n.y, s = n.width, a = n.height;
    if (typeof o == "number" && typeof r == "number" && typeof s == "number" && typeof a == "number")
      return { x: o, y: r, width: s, height: a };
  }
  return null;
}
function Kw(e) {
  return e.type !== "image" && e.type !== "svg" ? null : (C.document?.assets ?? []).find((t) => t.id === e.asset) ?? null;
}
let bt = null, Li = 0, pn = null, An = [], Ot = null, Wo = null;
function J(e) {
  const t = document.getElementById(e);
  if (!t) throw new Error(`missing element #${e}`);
  return t;
}
function dl(e) {
  const t = document.createElement("span");
  return t.dataset.i18n = e, t.textContent = b(e), t;
}
const zt = tw();
let ja = "", zi = null, _i = "layers";
const Xw = mw(J("structure-panel"), {
  document: null,
  selectedIds: [],
  query: ja,
  history: zi,
  dock: _i
}, {
  setQuery(e) {
    ja = e, Et();
  },
  select(e, t) {
    C.selection = t ? C.selection.includes(e) ? C.selection.filter((n) => n !== e) : [...C.selection, e] : [e], Et(), ut(), it(), window.matchMedia("(max-width: 720px)").matches && Vi()?.type !== "text" && (T.structure.classList.remove("mobile-open"), T.dockToggle.setAttribute("aria-expanded", "false"));
  },
  toggleVisibility(e) {
    const t = C.document && Ve(De(C.document)).find((n) => n.layer.id === e)?.layer;
    t && oe(t.visible === !1 ? "show layer" : "hide layer", { op: "setVisible", id: e, visible: t.visible === !1 });
  },
  toggleLocked(e) {
    const t = C.document && Ve(De(C.document)).find((n) => n.layer.id === e)?.layer;
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
    C.selection.length < 2 || oe("group", { op: "group", ids: [...C.selection] });
  },
  deleteSelection() {
    Yo();
  },
  undo() {
    T.undo.click();
  },
  redo() {
    T.redo.click();
  },
  showDock(e) {
    ko(e);
  },
  contextMenu(e, t, n) {
    ut(), it(), Go(t, n);
  }
}), In = Ow(J("context-menu-root")), T = {
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
vp(
  T.statusChromeRoot,
  (e) => {
    If(e);
  },
  (e) => {
    window.localStorage.setItem("assemblash-update-banner-v1", e), Ll(null);
  }
);
const Fi = rw({
  openProject: (e) => Kf(e),
  search: () => {
    ze("search", () => hr());
  }
}, document.querySelector(".project-combobox")), Yw = Zb();
function Ns(e, t, n, o) {
  Yw.request(e, t, n, o);
}
function je(e, t = "info") {
  wp(e, t);
}
const Pn = { families: [], faces: [] }, En = /* @__PURE__ */ new Map();
let fl = "";
async function ze(e, t) {
  await jn.enqueue({ label: e, coalesceKey: null, run: t, onError: (n) => wn(e, n) });
}
const Gw = {
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
function Bi(e) {
  const t = Gw[e.code];
  return t ? b(t) : `${e.message} (${e.code})`;
}
function wn(e, t) {
  Ca("ph-warning-circle", "save.needsAttention"), t instanceof ot ? je(Bi(t), "error") : je(b("errors.unexpected", { message: String(t) }), "error");
}
J("add-template-section").append(J("templates-mantine-mount"));
const Yt = iw({
  project: () => C.project,
  document: () => C.document,
  say: je,
  guard: ze,
  refresh: () => rt()
}), fo = qb({
  project: () => C.project,
  document: () => C.document,
  say: je,
  guard: ze,
  refresh: () => rt(),
  fontsChanged: (e) => {
    Pn.families = [...e.families], Pn.faces = [...e.faces], it();
  }
}, J("fonts-mantine-mount")), Jw = Pb({
  project: () => C.project,
  document: () => C.document,
  say: je,
  guard: ze
}), Zw = Gb({
  create: async (e, t, n, o) => {
    let r = !1;
    return await ze("create", async () => {
      await Hy(e, t, n, o, e), await hr(e), je(b("projects.created", { id: e })), r = !0;
    }), r;
  }
}), Pf = Cb({ say: je });
T.agents.addEventListener("click", () => {
  zt.isOpen() && zt.close();
}, { capture: !0 });
const Tf = "assemblash-follow-v1";
function ka() {
  return window.localStorage.getItem(Tf) !== "off";
}
function Qw(e = "settings-agents") {
  T.settingFollow.checked = ka();
  const t = La(), n = t === "pseudo" ? "en" : t;
  T.settingLanguage.value = n, zt.open(e, { follow: ka(), language: n });
}
T.settings.addEventListener("click", () => Qw());
T.settingLanguage.value = La();
T.settingLanguage.addEventListener("change", () => {
  kp(T.settingLanguage.value);
});
mp(() => {
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
  const e = T.canvasImage.dataset.previewName;
  e && (T.canvasImage.alt = b("canvas.previewAlt", { name: e })), C.document && (T.version.textContent = ke(Le(C.document)), $a(
    `${ke(Math.round(C.document.canvas.width))} × ${ke(Math.round(C.document.canvas.height))}`
  ), ur());
});
T.settingFollow.addEventListener("change", () => {
  window.localStorage.setItem(Tf, T.settingFollow.checked ? "on" : "off");
});
T.settingsFontsOpen.addEventListener("click", () => {
  zt.close(), ze("fonts", () => Gi(!0));
});
const ex = "assemblash-update-banner-v1";
async function Af() {
  let e;
  try {
    e = await nb();
  } catch {
    return;
  }
  T.settingUpdateCheck.checked = e.consent === "notify", $l(e.consent === null);
  const t = window.localStorage.getItem(ex), n = e.newer && !!e.latest && t !== e.latest;
  Ll(n && e.latest ? {
    version: e.latest,
    text: b("updates.versionAvailable", { latest: e.latest, current: e.current }),
    notesUrl: e.notesUrl ?? null
  } : null);
}
async function If(e) {
  try {
    const t = await ob(e);
    $l(t.consent === null), T.settingUpdateCheck.checked = t.consent === "notify", je(t.consent === "notify" ? b("updates.checkOn") : b("updates.checkOff"));
  } catch (t) {
    wn(b("updates.saveChoiceFailed"), t), Af();
  }
}
T.settingUpdateCheck.addEventListener("change", () => {
  If(T.settingUpdateCheck.checked ? "notify" : "off");
});
T.settingsForm.addEventListener("submit", (e) => {
  e.submitter?.value === "cancel" && zt.close();
});
function Vi() {
  if (!C.document || C.selection.length !== 1) return null;
  const e = C.selection[0];
  return Ve(De(C.document)).find(({ layer: t }) => t.id === e)?.layer ?? null;
}
function Dt() {
  if (!C.document) return [];
  const e = new Set(C.selection);
  return Ve(De(C.document)).map(({ layer: t }) => t).filter((t) => e.has(t.id));
}
function po(e, t = !1) {
  const n = Hr(e);
  if (n && (!t || e.protected || e.readOnly)) return n;
  if (!C.document) return null;
  const o = Ve(De(C.document));
  let r = o.find((s) => s.layer.id === e.id)?.parent;
  for (; r; ) {
    const s = o.find((i) => i.layer.id === r);
    if (!s) break;
    const a = Hr(s.layer);
    if (a) return a;
    r = s.parent;
  }
  return null;
}
function et(e) {
  return po(e) === null;
}
function Ea() {
  if (!C.document || C.selection.length === 0) return !1;
  const e = Ve(De(C.document)), t = new Set(C.selection);
  return C.selection.every((n) => {
    const o = e.find((s) => s.layer.id === n);
    if (!o || !et(o.layer) || !Wi(e, o.parent) || o.layer.transform.width <= 0 || o.layer.transform.height <= 0) return !1;
    let r = o.parent;
    for (; r; ) {
      if (t.has(r)) return !1;
      r = e.find((s) => s.layer.id === r)?.parent ?? null;
    }
    return !0;
  });
}
function tx(e, t) {
  let n = 0, o = { x: 0, y: 0 };
  const r = () => {
    window.clearTimeout(n), n = 0;
  };
  e.addEventListener("pointerdown", (s) => {
    s.pointerType !== "touch" && s.pointerType !== "pen" || (o = { x: s.clientX, y: s.clientY }, n = window.setTimeout(() => {
      Go(o.x, o.y), navigator.vibrate?.(20);
    }, 550));
  }), e.addEventListener("pointermove", (s) => {
    Math.hypot(s.clientX - o.x, s.clientY - o.y) > 8 && r();
  }), e.addEventListener("pointerup", r), e.addEventListener("pointercancel", r);
}
let pl = null, ml;
function nx() {
  !C.project || pl === C.project || (pl = C.project, T.canvasHints.hidden = !1, window.clearTimeout(ml), ml = window.setTimeout(() => {
    T.canvasHints.hidden = !0;
  }, 5e3));
}
let hl = 0;
async function rt() {
  if (ht(), !C.project) return;
  const e = ++hl, t = await Ai(C.project);
  e !== hl || !C.project || jo(t);
}
function jo(e) {
  const t = C.drag?.mode === "resize" ? C.drag : pn;
  t && (e.id !== C.document?.id || Le(e) !== t.version) && ht(), C.document = e, C.selection = C.selection.filter(
    (n) => Ve(De(e)).some(({ layer: o }) => o.id === n)
  ), T.version.textContent = ke(Le(e)), T.canvasEmpty.hidden = !0, T.canvas.hidden = !1, T.canvasControlsRoot.hidden = !1, nx(), $a(
    `${ke(Math.round(e.canvas.width))} × ${ke(Math.round(e.canvas.height))}`
  ), C.slots = e.slots ?? [], Ot !== null && Le(e) !== Ot && $t(), Hi(), Et(), ut(), it(), ox().catch((n) => wn("presets", n)), fx().catch((n) => wn("history", n));
}
let gl = 0;
async function ox() {
  if (!C.project) return;
  const e = ++gl, t = await lb(C.project);
  e === gl && (C.presets = t);
}
let Ys = null, Ro = null, Mf = null;
function Hi() {
  if (!C.project || !C.document || (Mf = qo(), Ro = Le(C.document), Ys)) return;
  const e = C.project;
  Ys = (async () => {
    try {
      for (; Ro !== null; ) {
        const t = Ro;
        Ro = null;
        const n = await uo(Vr(e, t, qo())), o = C.document;
        if (C.project !== e || !o || Le(o) !== t) {
          URL.revokeObjectURL(n);
          continue;
        }
        const r = T.canvasImage.src;
        T.canvasImage.src = n, r.startsWith("blob:") && URL.revokeObjectURL(r), !C.drag && (Ot === null || t >= Ot) && $t(), T.canvasImage.dataset.previewName = o.name ?? e, T.canvasImage.alt = b("canvas.previewAlt", { name: o.name ?? e }), T.canvas.style.aspectRatio = `${o.canvas.width} / ${o.canvas.height}`, ur(), Bw();
      }
    } catch (t) {
      wn("preview", t);
    } finally {
      Ys = null, Ro !== null && Hi();
    }
  })();
}
function Ui() {
  !C.document || qo() === Mf || Hi();
}
function rx() {
  const e = window.getComputedStyle(T.stage), t = (n) => {
    const o = Number.parseFloat(n);
    return Number.isFinite(o) ? Math.max(0, o) : 0;
  };
  return {
    horizontal: t(e.paddingLeft) + t(e.paddingRight),
    vertical: t(e.paddingTop) + t(e.paddingBottom)
  };
}
function Df() {
  if (!C.document) return 1;
  const e = rx(), t = Math.max(1, T.stageViewport.clientWidth - e.horizontal), n = Math.max(1, T.stageViewport.clientHeight - e.vertical);
  return Math.min(
    t / C.document.canvas.width,
    n / C.document.canvas.height,
    1
  );
}
function Ps() {
  return C.zoom ?? Df();
}
function qo() {
  if (!C.document) return 1;
  const e = Math.max(1, window.devicePixelRatio || 1);
  return Math.min(1, Math.max(0.1, Ps() * e));
}
function Et() {
  Xw.setSnapshot({
    document: C.document,
    selectedIds: C.selection,
    query: ja,
    history: zi,
    dock: _i
  });
}
function Ko(e, t) {
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
function Wi(e, t) {
  let n = t;
  for (; n; ) {
    const o = e.find((r) => r.layer.id === n);
    if (!o || o.layer.transform.flipHorizontal || o.layer.transform.flipVertical) return null;
    n = o.parent;
  }
  return Ko(e, t);
}
function ut() {
  if (T.overlay.replaceChildren(), !C.document) return;
  const { width: e, height: t } = C.document.canvas, n = Ve(De(C.document)), o = n.flatMap(({ layer: c, parent: u }) => {
    const d = Wi(n, u);
    return d ? [{
      layer: c,
      x: c.transform.x + d.x,
      y: c.transform.y + d.y,
      width: c.transform.width,
      height: c.transform.height
    }] : [];
  });
  for (const c of o) {
    const u = document.createElement("div");
    u.className = "layer-hitbox", u.dataset.id = c.layer.id, u.style.left = `${c.x / e * 100}%`, u.style.top = `${c.y / t * 100}%`, u.style.width = `${c.width / e * 100}%`, u.style.height = `${c.height / t * 100}%`, u.style.transformOrigin = "center", u.style.transform = `rotate(${c.layer.transform.rotation ?? 0}deg)`, u.addEventListener("pointerdown", (d) => {
      d.shiftKey || d.ctrlKey || d.metaKey ? C.selection = C.selection.includes(c.layer.id) ? C.selection.filter((p) => p !== c.layer.id) : [...C.selection, c.layer.id] : C.selection.includes(c.layer.id) || (C.selection = [c.layer.id]), Et(), it(), ut();
    }), u.addEventListener("dblclick", (d) => {
      d.stopPropagation(), c.layer.type === "text" && mo(c.layer);
    }), u.addEventListener("contextmenu", (d) => {
      d.preventDefault(), C.selection.includes(c.layer.id) || (C.selection = [c.layer.id]), Et(), it(), ut(), Go(d.clientX, d.clientY);
    }), tx(u), T.overlay.append(u);
  }
  const r = o.filter(({ layer: c }) => C.selection.includes(c.id));
  if (r.length === 0) return;
  _f(r.map(({ layer: c }) => c.id));
  const s = r.length === 1 ? {
    x: r[0].x,
    y: r[0].y,
    width: r[0].width,
    height: r[0].height
  } : Mi(r.map((c) => ({
    x: c.x,
    y: c.y,
    width: c.width,
    height: c.height,
    rotation: c.layer.transform.rotation ?? 0
  }))), a = document.createElement("div");
  if (a.className = "handle-box", a.style.left = `${s.x / e * 100}%`, a.style.top = `${s.y / t * 100}%`, a.style.width = `${s.width / e * 100}%`, a.style.height = `${s.height / t * 100}%`, a.style.transformOrigin = "center", r.length === 1 && (a.style.transform = `rotate(${r[0]?.layer.transform.rotation ?? 0}deg)`), a.dataset.ids = C.selection.join(","), a.addEventListener("contextmenu", (c) => {
    c.preventDefault(), c.stopPropagation(), Go(c.clientX, c.clientY);
  }), r.every(({ layer: c }) => et(c))) {
    a.addEventListener("pointerdown", (u) => Js(u, r, s, "move")), a.addEventListener("dblclick", (u) => {
      u.stopPropagation();
      const d = r.length === 1 && r[0]?.layer.type === "text" ? r[0].layer : null;
      d && mo(d);
    }), Ea() || (a.title = b("canvas.resizeUnavailable"));
    for (const u of Ea() ? ["nw", "n", "ne", "e", "se", "s", "sw", "w"] : []) {
      const d = document.createElement("button");
      d.type = "button", d.className = `resize-handle handle-${u}`, d.dataset.handle = u, d.dataset.resizeHandle = u, d.setAttribute("aria-label", b("canvas.resizeHandle", { handle: u })), d.title = b("canvas.resizeHelp"), d.setAttribute("aria-description", d.title), d.dataset.i18nAttr = "title:canvas.resizeHelp;aria-description:canvas.resizeHelp", d.addEventListener("pointerdown", (p) => {
        p.stopPropagation(), Js(p, r, s, "resize", u);
      }), a.append(d);
    }
    const c = document.createElement("button");
    c.type = "button", c.className = "rotation-handle", c.setAttribute("aria-label", b("canvas.rotateSelection")), c.dataset.i18nAttr = "aria-label:canvas.rotateSelection", c.innerHTML = '<i class="ph ph-arrow-clockwise" aria-hidden="true"></i>', c.addEventListener("pointerdown", (u) => {
      u.stopPropagation(), Js(u, r, s, "rotate");
    }), a.append(c);
  } else
    a.classList.add("guarded"), a.title = r.map(({ layer: c }) => po(c)).filter(Boolean).join("; ");
  T.overlay.append(a);
}
function sx(e) {
  if (!C.document) return;
  const t = C.document.canvas, n = document.createElement("form");
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
  ye.push(at(o, {
    id: "canvas-width",
    label: () => b("canvas.widthPx"),
    value: String(t.width),
    type: "number",
    min: 0,
    step: "any",
    onMount: (P) => {
      s = P, R();
    },
    onCommit: () => {
    }
  })), ye.push(at(r, {
    id: "canvas-height",
    label: () => b("canvas.heightPx"),
    value: String(t.height),
    type: "number",
    min: 0,
    step: "any",
    onMount: (P) => {
      a = P, R();
    },
    onCommit: () => {
    }
  }));
  const c = n.querySelector("#canvas-transparent-mount"), u = n.querySelector("#canvas-size-anchor-grid"), d = n.querySelector(".canvas-anchor-fieldset"), p = n.querySelector("#canvas-apply-mount");
  let m = t.background ?? "#ffffff", h = t.backgroundImage ?? null, g = t.background == null, v = "top-left";
  Mr(
    n.querySelector("#canvas-background-paint"),
    "canvas-background",
    b("common.background"),
    m,
    !1,
    (P) => {
      m = P, g = !1, E(), R();
    }
  );
  const w = () => ({
    id: "canvas-transparent",
    label: () => b("canvas.transparentBackground"),
    checked: g,
    onChange(P) {
      g = P, R();
    }
  });
  let x = Do(c, w());
  ye.push(() => x());
  function E() {
    Ia(() => {
      x(), x = Do(c, w());
    });
  }
  const j = Tw(u, v, !0, (P) => {
    v = P, R();
  });
  ye.push(j.destroy), ye.push(Rw(n.querySelector("#canvas-background-image-mount"), {
    assets: C.document.assets ?? [],
    value: h,
    onChange(P) {
      h = P, oe(P ? "set canvas background image" : "clear canvas background image", P ? { op: "updateCanvas", backgroundImage: P } : { op: "updateCanvas", clearBackgroundImage: !0 });
    },
    onUpload(P) {
      const S = C.project;
      S && ze("upload canvas background image", async () => {
        const y = await Ii(S, P), N = {
          op: "updateCanvas",
          backgroundImage: { asset: y.asset.id, fit: h?.fit ?? "fill" }
        }, D = await $n(S, N, y.version);
        je(b("status.editDone", { version: D.version })), D.document ? jo(D.document) : await rt();
      });
    }
  })), ye.push(Qe(p, {
    id: "canvas-apply",
    type: "submit",
    label: () => b("canvas.applyChanges"),
    className: "primary",
    disabled: !0,
    onMount: (P) => {
      i = P, R();
    },
    onClick: () => {
    }
  }));
  const k = () => !!(s && a && (Number(s.value) !== t.width || Number(a.value) !== t.height));
  function R() {
    if (!(!s || !a || !i)) {
      for (const P of [s, a])
        P.setCustomValidity(Number.isFinite(P.valueAsNumber) && P.valueAsNumber > 0 ? "" : b("canvas.invalidDimension"));
      d.disabled = !k(), j.setState(v, !k()), i.disabled = !k() && vl(g ? null : m, t.background ?? null);
    }
  }
  n.addEventListener("input", R), n.addEventListener("change", R), n.addEventListener("submit", (P) => {
    if (P.preventDefault(), R(), !i || i.disabled || !n.reportValidity() || !s || !a) return;
    const S = g ? null : m, y = {
      op: "updateCanvas",
      ...k() ? { width: Number(s.value), height: Number(a.value), anchor: v } : {},
      ...vl(S, t.background ?? null) ? {} : { background: S }
    };
    i.disabled = !0, oe("update canvas", y);
  }), R(), e.append(n);
}
function Xo(e, t) {
  const n = Fw(
    e,
    t,
    !["Clip and mirror", "Appearance", "Effects", "Presets", "Slots"].includes(t)
  );
  return $f.push(n.destroy), n.body;
}
const Of = [], ye = [], $f = [];
let mn = 0;
function Mr(e, t, n, o, r, s, a, i, c = !1) {
  ye.push(vw(e, { id: t, label: n, value: o, disabled: r, onCommit: s, className: a, clear: i, compact: c }));
}
function vl(e, t) {
  return JSON.stringify(e) === JSON.stringify(t);
}
function yl(e, t) {
  const n = Hb({ store: () => Pn }, (o) => {
    oe("change font", { op: "update", id: e.id, fontFamily: o });
  });
  return Of.push(n), n.setFamily(e.fontFamily), n.setDisabled(t), n;
}
let bl = "";
function ax(e) {
  const t = e.map((n) => n.id).join(",");
  t !== bl && e.length === 1 && e[0]?.type === "text" && (ko("properties"), window.matchMedia("(max-width: 720px)").matches && (T.structure.classList.add("mobile-open"), T.dockToggle.setAttribute("aria-expanded", "true"))), bl = t;
}
function it() {
  Ia(ix);
}
function ix() {
  for (const S of Of.splice(0)) S.destroy();
  for (const S of ye.splice(0)) S();
  for (const S of $f.splice(0)) S();
  ba(T.inspector), ba(T.advancedInspector), T.inspector.replaceChildren(), T.advancedInspector.replaceChildren();
  let e = T.advancedInspector;
  const t = (S) => (e = Xo(T.advancedInspector, S), e), n = Dt(), o = n.length === 1 ? n[0] ?? null : null;
  ax(n);
  const r = n.map((S) => S.id).join(",");
  if (r !== fl && (En.clear(), fl = r), T.deleteLayer.disabled = n.length === 0 || n.some((S) => !et(S)), T.groupLayers.disabled = n.length < 2 || n.some((S) => !et(S)), Yi(n), C.document) {
    const S = document.createElement("span");
    S.style.display = "contents", ye.push(Qe(S, {
      id: "edit-canvas",
      label: () => b("editor.canvasSizeBackground"),
      icon: "ph-frame-corners",
      className: "toolbar-action",
      onClick() {
        In.close(), C.selection = [], Et(), ut(), it(), ko("properties");
      }
    })), T.inspector.append(S);
  }
  if (n.length === 0) {
    const S = document.createElement("div");
    S.className = "inspector-empty", S.innerHTML = '<i class="ph ph-cursor-click" aria-hidden="true"></i><span data-i18n="editor.selectLayerHint">Select a layer to edit it</span>', T.inspector.append(S);
    const y = document.createElement("p");
    if (y.className = "empty-panel-copy", y.dataset.i18n = C.document ? "editor.setCanvasHint" : "editor.openProjectHint", y.textContent = b(C.document ? "editor.setCanvasHint" : "editor.openProjectHint"), e.append(y), C.document) {
      const N = Xo(T.advancedInspector, "Canvas");
      sx(N);
    }
    return;
  }
  const s = n.some((S) => !et(S));
  let a = 0;
  const i = (S, y, N, D = s, O = "toolbar-action", z, _ = !1) => {
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
      onClick: N
    })), F;
  };
  if (o?.type === "text") {
    const S = document.createElement("label");
    S.className = "toolbar-field toolbar-font", S.append(dl("editor.fontFamily")), S.firstElementChild?.classList.add("sr-only");
    const y = yl(o, s);
    S.append(y.root), T.inspector.append(S);
    const N = document.createElement("span");
    N.className = "toolbar-field toolbar-number", ye.push(at(N, {
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
    })), T.inspector.append(N);
    const D = document.createElement("div");
    D.className = "toolbar-paint", Mr(
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
    ), T.inspector.append(D);
    for (const [z, _] of [
      ["left", "ph-text-align-left"],
      ["center", "ph-text-align-center"],
      ["right", "ph-text-align-right"],
      ["justify", "ph-text-align-justify"]
    ]) {
      const F = {
        left: "editor.alignLeft",
        center: "editor.alignCenter",
        right: "editor.alignRight",
        justify: "editor.alignJustify"
      }[z], $ = i(F, _, () => {
        oe(`align text ${z}`, { op: "update", id: o.id, align: z });
      }, s, "icon-button toolbar-icon", (M) => {
        const L = (o.align ?? "left") === z;
        M.dataset.textAlign = z, M.classList.toggle("selected", L), M.setAttribute("aria-pressed", String(L));
      }, !0);
      T.inspector.append($);
    }
    const O = document.createElement("span");
    O.className = "toolbar-divider", T.inspector.append(O);
  } else {
    const S = document.createElement("span");
    S.className = "selection-label", n.length === 1 ? S.textContent = o?.type ?? b("editor.layerGeneric") : (S.dataset.i18nCount = "editor.layerCount", S.dataset.count = String(n.length), S.textContent = It("editor.layerCount", n.length)), T.inspector.append(S);
  }
  const c = n.map((S) => S.id);
  if (T.inspector.append(
    i("editor.centreHorizontally", "ph-align-center-horizontal", () => {
      oe("centre horizontally", { op: "centerOnCanvas", ids: c, axis: "horizontal" });
    }),
    i("editor.centreVertically", "ph-align-center-vertical", () => {
      oe("centre vertically", { op: "centerOnCanvas", ids: c, axis: "vertical" });
    }),
    i("position.title", "ph-bounding-box", () => ho(), !1, "toolbar-action position-button"),
    i("layers.groupButton", "ph-stack", () => {
      c.length > 1 && oe("group", { op: "group", ids: c });
    }, s || c.length < 2),
    i("editor.duplicate", "ph-copy", () => {
      wt("duplicate", c.map((S) => ({ op: "duplicate", id: S })));
    })
  ), !o) {
    const S = document.createElement("p");
    S.className = "empty-panel-copy";
    const y = n.filter((D) => D.type === "text"), N = y.length > 1 && new Set(y.map((D) => D.fontFamily)).size > 1;
    S.dataset.i18n = N ? "properties.mixedFonts" : "editor.selectionCountHint", S.textContent = N ? b("properties.mixedFonts") : b("editor.selectionCountHint", { count: n.length }), e.append(S);
    return;
  }
  const u = po(o);
  if (u) {
    const S = document.createElement("p");
    S.className = "guarded-note", S.textContent = u, e.append(S);
  }
  const d = (S, y, N, D = "number", O, z, _ = !1) => {
    const F = document.createElement("div");
    F.className = "field", ye.push(at(F, {
      id: z ?? `field-${S.replaceAll(".", "-")}`,
      label: () => b(S),
      value: y,
      type: D,
      className: z,
      disabled: u !== null || _,
      list: O,
      onCommit($) {
        if ($ === y) return;
        const M = N($);
        M && oe(`change ${b(S)}`, M);
      }
    })), e.append(F);
  }, p = (S, y, N, D, O, z = !1) => {
    const _ = document.createElement("div");
    _.className = "field", ye.push(at(_, {
      id: y,
      label: () => b(S),
      value: N,
      className: y,
      disabled: u !== null || z,
      options: D,
      onCommit: O
    })), e.append(_);
  }, m = (S, y, N, D, O) => {
    const z = document.createElement("div");
    z.className = "field paint-field", Mr(
      z,
      y,
      b(S),
      N,
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
      onClick: () => mo(o)
    })), e.append(S);
    const y = Pn.families.includes(o.fontFamily), N = document.createElement("div");
    N.className = "current-font-summary";
    const D = document.createElement("strong");
    D.className = "current-font-family", D.textContent = o.fontFamily;
    const O = document.createElement("span");
    if (O.className = "current-font-face", O.textContent = `${o.fontWeight ?? 400} · ${o.fontStyle ?? "normal"} · ${o.fontSize} px`, N.append(D, O), y) {
      const A = document.createElement("span");
      A.className = "current-font-specimen";
      const B = Pn.faces.find(
        (U) => U.family === o.fontFamily && U.weight === (o.fontWeight ?? 400) && U.style === (o.fontStyle ?? "normal")
      );
      if (B)
        wf(A, B);
      else {
        const U = document.createElement("span");
        U.className = "font-specimen-status", U.textContent = b("fonts.previewUnavailable"), A.append(U);
      }
      N.append(A);
    } else {
      const A = document.createElement("p");
      A.className = "current-font-status", A.dataset.i18n = "properties.fontMissing", A.textContent = b("properties.fontMissing");
      const B = document.createElement("span");
      B.style.display = "contents", ye.push(Qe(B, {
        id: "install-fonts",
        label: () => b("fonts.installFonts"),
        className: "small",
        onClick: () => {
          ze("fonts", () => Gi(!0));
        }
      })), N.append(A, B);
    }
    e.append(N);
    const z = document.createElement("label");
    z.className = "field", z.append(dl("properties.font"));
    const _ = yl(o, u !== null);
    z.append(_.root), e.append(z), d("properties.fontSize", String(o.fontSize), (A) => ({ op: "update", id: o.id, fontSize: Number(A) })), d("properties.lineHeight", String(o.lineHeight ?? 1.2), (A) => ({ op: "update", id: o.id, lineHeight: Number(A) })), d("properties.paragraphSpacing", String(o.paragraphSpacing ?? 0), (A) => ({ op: "update", id: o.id, paragraphSpacing: Number(A) }));
    const F = xf(o.fontFamily, Pn.faces);
    if (F.length) {
      const A = o.fontWeight ?? 400, B = o.fontStyle ?? "normal", U = [.../* @__PURE__ */ new Set([
        ...F.filter((W) => W.style === B).map((W) => W.weight),
        A
      ])].sort((W, Y) => W - Y);
      p(
        "properties.weight",
        "font-weight",
        String(A),
        U.map((W) => ({ value: String(W), label: String(W) })),
        (W) => {
          oe("change Weight", { op: "update", id: o.id, fontWeight: Number(W) });
        }
      );
    } else
      d("properties.weight", String(o.fontWeight ?? 400), (A) => ({ op: "update", id: o.id, fontWeight: Number(A) }));
    d("properties.letterSpacing", String(o.letterSpacing ?? 0), (A) => ({ op: "update", id: o.id, letterSpacing: Number(A) }));
    const $ = o.fontStyle ?? "normal", M = o.fontWeight ?? 400, L = F.filter((A) => A.weight === M).map((A) => A.style === "oblique" ? "italic" : A.style), I = F.length ? [.../* @__PURE__ */ new Set([...L, $])] : [$];
    if (p(
      "properties.style",
      "font-style",
      o.fontStyle ?? "normal",
      I.map((A) => ({ value: A, label: A })),
      (A) => {
        oe("change font style", { op: "update", id: o.id, fontStyle: A });
      }
    ), p(
      "properties.verticalAlign",
      "vertical-align",
      o.verticalAlign ?? "top",
      ["top", "middle", "bottom"].map((A) => ({ value: A, label: A })),
      (A) => {
        oe("change vertical align", { op: "update", id: o.id, verticalAlign: A });
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
        oe("clear text stroke", { op: "update", id: o.id, stroke: null });
      } }
    ), d("properties.strokeWidth", String(o.stroke?.width ?? 1), (A) => ({ op: "update", id: o.id, stroke: { color: o.stroke?.color ?? "#000000", width: Number(A) } })), C.project && C.document) {
      const A = Cl(C.project, C.document, o), B = document.createElement("div");
      e.append(B), ye.push(jw(B, {
        capture: A,
        layer: o,
        drafts: Sa,
        disabled: u !== null,
        fonts: { store: () => Pn },
        submit: mx,
        reload: async () => {
          const U = await jn.outcome("reload runs", async () => {
            if (C.project !== A.project || C.document?.id !== A.document) throw new Error(b("runs.notSent"));
            const W = await Ai(A.project);
            if (C.project !== A.project || C.document?.id !== A.document) throw new Error(b("runs.notSent"));
            const Y = Ve(De(W)).find((ae) => ae.layer.id === A.layer)?.layer;
            if (!Y || Y.type !== "text") throw new Error(b("runs.notSent"));
            Sa.set(Di(A), kf(Cl(A.project, W, Y))), jo(W);
          });
          return U.status === "refused" ? String(U.error) : null;
        }
      }));
    }
  }
  t("Transform");
  const h = document.createElement("div");
  h.className = "property-grid";
  const g = (S, y, N) => {
    const D = `transform-${S.split(".").at(-1)}`, O = document.createElement("div");
    O.className = "field", ye.push(at(O, {
      id: D,
      label: () => b(S),
      value: y,
      type: "number",
      className: D,
      disabled: u !== null,
      onCommit(z) {
        const _ = N(z);
        _ && oe(`change ${b(S)}`, _);
      }
    })), h.append(O);
  }, v = o.transform;
  if (g("properties.x", String(v.x), (S) => xl(o, Number(S), v.y)), g("properties.y", String(v.y), (S) => xl(o, v.x, Number(S))), g("properties.width", String(v.width), (S) => Sl(o, Number(S), v.height)), g("properties.height", String(v.height), (S) => Sl(o, v.width, Number(S))), g("properties.rotation", String(v.rotation ?? 0), (S) => ({ op: "rotate", id: o.id, degrees: Number(S) })), g("properties.opacity", String(o.opacity ?? 1), (S) => ({ op: "update", id: o.id, opacity: Number(S) })), e.append(h), (o.type === "image" || o.type === "svg") && (e = t("Media"), p(
    "properties.fit",
    "layer-fit",
    o.fit ?? "fill",
    rb.map((S) => ({ value: S, label: S })),
    (S) => {
      oe("change fit", { op: "update", id: o.id, fit: S });
    }
  ), o.type === "image")) {
    const S = qw(o), y = Kw(o), N = y?.width ?? null, D = y?.height ?? null, O = typeof N == "number" && N > 0 && typeof D == "number" && D > 0, z = document.createElement("p");
    z.className = "hint";
    const _ = O ? "canvas.cropAvailableHint" : "canvas.cropUnavailableHint";
    z.dataset.i18n = _, z.textContent = b(_), e.append(z);
    const F = S ?? { x: 0, y: 0, width: N ?? 0, height: D ?? 0 }, $ = (A, B, U, W) => {
      d(A, String(U), (Y) => W(Number(Y)), "number", void 0, B, !O);
    }, M = (A) => !Number.isFinite(A.x) || !Number.isFinite(A.y) || !(A.width > 0) || !(A.height > 0) ? null : { op: "update", id: o.id, crop: A };
    $("canvas.cropX", "crop-x", F.x, (A) => M({ ...F, x: A })), $("canvas.cropY", "crop-y", F.y, (A) => M({ ...F, y: A })), $("canvas.cropWidth", "crop-width", F.width, (A) => M({ ...F, width: A })), $("canvas.cropHeight", "crop-height", F.height, (A) => M({ ...F, height: A }));
    const L = document.createElement("div");
    L.className = "field";
    const I = document.createElement("span");
    I.style.display = "contents", ye.push(Qe(I, {
      id: "clear-image-crop",
      label: () => b("canvas.clearCrop"),
      title: () => b("canvas.wholeImage"),
      className: "small crop-clear",
      disabled: u !== null || S === null,
      onClick: () => {
        oe("clear crop", { op: "update", id: o.id, crop: null });
      }
    })), L.append(I), e.append(L);
  }
  if (o.type === "shape") {
    e = t("Shape");
    const S = gf(o), y = o.stroke?.color ?? Rf, N = o.stroke?.width ?? Nf, D = (A, B, U, W, Y, ae) => {
      const fe = document.createElement("div");
      fe.className = "field shape-field";
      const ie = document.createElement("span");
      ie.dataset.i18n = A, ie.textContent = b(A);
      const te = document.createElement("span");
      te.className = "shape-paint", Mr(
        te,
        B,
        b(A),
        U,
        u !== null,
        (me) => {
          oe(`change ${b(A)}`, Y(me));
        },
        B,
        {
          label: b("canvas.none"),
          className: `small ${B}-none`,
          title: b("canvas.removeColor", { label: b(A).toLowerCase() }),
          disabled: !W,
          onClear: () => {
            oe(`clear ${b(A)}`, ae());
          }
        }
      ), W || (te.title = b("canvas.noColor", { label: b(A).toLowerCase() })), fe.append(ie, te), e.append(fe);
    };
    D(
      "properties.fill",
      "shape-fill",
      o.fill ?? $i,
      !!o.fill,
      (A) => ({ op: "update", id: o.id, fill: A }),
      () => ({ op: "update", id: o.id, fill: null })
    ), D(
      "properties.stroke",
      "shape-stroke",
      y,
      !!o.stroke,
      (A) => ({ op: "update", id: o.id, stroke: { color: A, width: N } }),
      () => ({ op: "update", id: o.id, stroke: null })
    ), d(
      "properties.strokeWidth",
      String(N),
      (A) => ({
        op: "update",
        id: o.id,
        stroke: { color: y, width: Number(A) }
      }),
      "number",
      void 0,
      "shape-stroke-width"
    ), S === "rect" && d(
      "properties.cornerRadius",
      String(sb(o)),
      (A) => ({ op: "update", id: o.id, cornerRadius: Number(A) }),
      "number",
      void 0,
      "shape-corner-radius"
    );
    const O = (A, B) => {
      const U = En.get(B);
      if (!U) return;
      const W = document.createElement("span");
      W.className = `control-error ${B}-note`, W.textContent = U, A.append(W);
    }, z = (A) => (B) => {
      En.set(
        A,
        B instanceof ot ? Bi(B) : String(B)
      ), it();
    }, _ = document.createElement("div");
    _.className = "field shape-field shape-path";
    const F = o.shape, $ = S === "path" && typeof F.d == "string" ? F.d : "";
    ye.push(at(_, {
      id: "shape-path-d",
      label: () => b("canvas.pathData"),
      type: "textarea",
      value: $,
      className: "shape-path-d",
      rows: 3,
      maxLength: 2048,
      disabled: u !== null,
      onCommit: (A) => {
        const B = A.trim();
        !B || B === $ || (En.delete("path-d"), oe("set path data", {
          op: "update",
          id: o.id,
          shape: { kind: "path", d: B }
        }, z("path-d")));
      }
    })), O(_, "path-d"), e.append(_);
    const M = document.createElement("div");
    M.className = "field shape-field shape-dash-row";
    const L = (o.stroke?.dashArray ?? []).join(", ");
    ye.push(at(M, {
      id: "shape-dash",
      label: () => b("canvas.dashPattern"),
      type: "text",
      value: L,
      className: "shape-dash",
      placeholder: b("canvas.dashExample"),
      disabled: u !== null,
      onCommit: (A) => {
        const B = A.trim();
        En.delete("dash");
        const U = B ? B.split(",").map((Y) => Number(Y.trim())) : [];
        if (U.some((Y) => !Number.isFinite(Y) || Y <= 0)) {
          En.set("dash", b("canvas.dashPositiveError")), it();
          return;
        }
        if (U.length > Yc) {
          En.set("dash", b("canvas.dashMaxError", { count: Yc })), it();
          return;
        }
        const W = {
          ...o.stroke ?? { color: y, width: N },
          dashArray: U.length ? U : null
        };
        oe("change dash pattern", { op: "update", id: o.id, stroke: W }, z("dash"));
      }
    })), O(M, "dash"), e.append(M);
    const I = (A, B, U, W) => {
      const Y = o.stroke?.[U], ae = typeof Y == "string" ? Y : null, fe = ae && !W.includes(ae) ? [...W, ae] : [...W];
      p(A, B, ae ?? W[0] ?? "", fe.map((ie) => ({ value: ie, label: ie })), (ie) => {
        const te = {
          ...o.stroke ?? { color: y, width: N },
          [U]: ie
        };
        oe(`change ${b(A).toLowerCase()}`, { op: "update", id: o.id, stroke: te });
      });
    };
    if (I("properties.lineCap", "shape-stroke-cap", "lineCap", ["butt", "round", "square"]), I("properties.lineJoin", "shape-stroke-join", "lineJoin", ["miter", "round", "bevel"]), S === "line") {
      const A = (B, U, W) => {
        const Y = F[W], ae = typeof Y == "string" && Y !== "none" && !["arrow", "circle"].includes(Y) ? ["none", "arrow", "circle", Y] : ["none", "arrow", "circle"];
        p(
          B,
          U,
          typeof Y == "string" ? Y : "none",
          ae.map((fe) => ({ value: fe, label: fe })),
          (fe) => {
            oe(`change ${b(B).toLowerCase()}`, {
              op: "update",
              id: o.id,
              [W]: fe
            });
          }
        );
      };
      A("properties.markerStart", "shape-marker-start", "markerStart"), A("properties.markerEnd", "shape-marker-end", "markerEnd");
    }
  }
  e = t("Clip and mirror");
  const w = Ww(o), x = [...Uw];
  w && !x.includes(w) && x.push(w), p("properties.clip", "clip-shape", w ?? "none", ["none", ...x].map((S) => ({ value: S, label: S })), (S) => {
    if (S === (w ?? "none")) return;
    const y = S === "none" ? null : S === "rect" ? { shape: "rect", cornerRadius: ul(o) } : { shape: S };
    oe("change clip", { op: "update", id: o.id, clip: y });
  }), w === "rect" && d(
    "properties.clipRadius",
    String(ul(o)),
    (S) => ({
      op: "update",
      id: o.id,
      clip: { shape: "rect", cornerRadius: Number(S) }
    }),
    "number",
    void 0,
    "clip-radius"
  );
  const E = document.createElement("div");
  E.className = "property-flags";
  const j = (S, y, N, D) => {
    const O = document.createElement("div");
    O.className = "field checkbox", ye.push(Do(O, {
      id: y,
      label: () => b(S),
      checked: D,
      disabled: u !== null,
      className: y,
      onChange: (z) => {
        oe(b(S).toLowerCase(), { op: "update", id: o.id, [N]: z });
      }
    })), E.append(O);
  };
  j("properties.flipHorizontal", "flip-horizontal", "flipHorizontal", o.transform.flipHorizontal ?? !1), j("properties.flipVertical", "flip-vertical", "flipVertical", o.transform.flipVertical ?? !1), e.append(E), e = t("Appearance"), p(
    "properties.blendMode",
    "blend-mode",
    o.blendMode ?? "normal",
    ab.map((S) => ({ value: S, label: S })),
    (S) => {
      oe("change blend mode", { op: "update", id: o.id, blendMode: S });
    }
  ), cx(T.advancedInspector, o, u !== null), lx(T.advancedInspector, o, u !== null), ux(T.advancedInspector, o);
  const k = document.createElement("div");
  k.className = "property-flags";
  const R = document.createElement("div");
  R.className = "field checkbox", ye.push(Do(R, {
    id: "layer-visible",
    label: () => b("properties.visible"),
    checked: o.visible ?? !0,
    disabled: u !== null,
    onChange: (S) => {
      oe("show/hide", { op: "setVisible", id: o.id, visible: S });
    }
  }));
  const P = document.createElement("div");
  P.className = "field checkbox", ye.push(Do(P, {
    id: "layer-locked",
    label: () => b("properties.locked"),
    checked: o.locked ?? !1,
    disabled: po(o, !0) !== null,
    onChange: (S) => {
      oe(S ? "lock layer" : "unlock layer", { op: "setLocked", id: o.id, locked: S });
    }
  })), k.append(R, P), e.append(k);
}
function Gs(e) {
  return e === "hueRotate" ? b("effects.hueRotate") : e === "invert" ? b("effects.invert") : e.replace(/([A-Z])/g, " $1").replace(/^./, (t) => t.toUpperCase());
}
function cx(e, t, n) {
  const o = t.effects ?? [], r = Xo(e, "Effects"), s = (d) => {
    oe("effects", { op: "update", id: t.id, effects: d });
  };
  for (const [d, p] of o.entries()) {
    const m = document.createElement("div");
    m.className = "effect-row", m.dataset.effect = p.type;
    const h = document.createElement("span");
    h.className = "effect-name", h.textContent = Gs(p.type), (p.type === "hueRotate" || p.type === "invert") && (h.dataset.i18n = `effects.${p.type}`), m.append(h);
    const g = ib(p);
    g.length > 1 && m.classList.add("multi");
    const v = (E) => {
      const j = document.createElement("span");
      j.className = "effect-input-host";
      const k = `effect-${t.id}-${d}-${E.name}`;
      return ye.push(at(j, {
        id: k,
        label: () => `${Gs(p.type)} ${E.name === "degrees" ? b("effects.degrees") : p.type === "invert" && E.name === "amount" ? b("effects.amount") : E.name}`,
        value: String(E.value),
        type: E.kind === "color" ? "text" : "number",
        step: E.kind === "number" ? E.name === "degrees" ? "1" : "0.05" : void 0,
        disabled: n,
        onMount: (R) => {
          R.dataset.field = E.name;
        },
        onCommit: (R) => {
          const P = E.kind === "color" ? R.trim() : Number(R);
          typeof P == "number" && !Number.isFinite(P) || P !== E.value && s(o.map((S, y) => y === d ? { ...S, [E.name]: P } : S));
        }
      })), j;
    };
    if (g.length === 1 && g[0])
      m.append(v(g[0]));
    else if (g.length > 1) {
      const E = document.createElement("span");
      E.className = "effect-fields";
      for (const j of g) {
        const k = document.createElement("label");
        k.className = "effect-field";
        const R = document.createElement("span");
        R.textContent = j.name, k.append(R, v(j)), E.append(k);
      }
      m.append(E);
    }
    const w = (E) => {
      const j = [...o], k = j[d], R = j[E];
      !k || !R || (j[d] = R, j[E] = k, s(j));
    }, x = (E, j, k, R, P) => {
      const S = document.createElement("span");
      return S.style.display = "contents", ye.push(Qe(S, {
        id: `effect-action-${t.id}-${d}-${E}`,
        className: E,
        label: j,
        title: j,
        icon: k,
        disabled: R,
        onClick: P
      })), S;
    };
    m.append(
      x("small effect-up", b("effects.moveUp", { effect: p.type }), "ph-arrow-up", n || d === 0, () => w(d - 1)),
      x("small effect-down", b("effects.moveDown", { effect: p.type }), "ph-arrow-down", n || d === o.length - 1, () => w(d + 1)),
      x("small effect-remove", b("effects.remove"), "ph-trash", n, () => s(o.filter((E, j) => j !== d)))
    ), r.append(m);
  }
  const a = document.createElement("div");
  a.className = "effect-add-row";
  let i = Gc[0] ?? "brightness";
  const c = document.createElement("span");
  ye.push(at(c, {
    id: `effect-chooser-${t.id}`,
    label: () => b("effects.choose"),
    value: i,
    className: "effect-chooser",
    disabled: n,
    options: Gc.map((d) => ({ value: d, label: () => Gs(d) })),
    onCommit: (d) => {
      i = d;
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
      const d = T.advancedInspector.querySelector(".effect-chooser");
      d && (i = d.value), s([...o, cb(i)]);
    }
  })), a.append(c, u), r.append(a);
}
function lx(e, t, n) {
  const o = Xo(e, "Presets");
  if (C.presets.length === 0) {
    const a = document.createElement("p");
    a.className = "hint", a.dataset.i18n = "presets.none", a.textContent = b("presets.none"), o.append(a);
  }
  for (const a of C.presets) {
    const i = document.createElement("div");
    i.className = "preset-row";
    const c = document.createElement("span");
    c.className = "effect-name", c.textContent = a.name, a.description && (c.title = a.description), i.append(c);
    const u = document.createElement("span");
    u.style.display = "contents", ye.push(Qe(u, {
      id: `preset-apply-${++mn}`,
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
    const d = document.createElement("span");
    d.style.display = "contents", ye.push(Qe(d, {
      id: `preset-remove-${++mn}`,
      label: () => b("common.delete"),
      className: "small",
      onClick: () => {
        oe(`delete ${a.name}`, {
          op: "deletePreset",
          name: a.name
        });
      }
    })), i.append(d), o.append(i);
  }
  const r = document.createElement("div");
  r.className = "inspector-add-row";
  const s = document.createElement("span");
  s.style.display = "contents", ye.push(Qe(s, {
    id: `preset-save-${++mn}`,
    label: () => b("presets.saveStyle"),
    onClick: () => {
      Ns("presets.saveTitle", "presets.name", "presets.saveButton", (a) => {
        oe(`define ${a}`, {
          op: "definePreset",
          preset: { name: a, properties: ub(t) }
        });
      });
    }
  })), r.append(s), o.append(r);
}
function ux(e, t) {
  const n = Xo(e, "Slots");
  for (const i of C.slots) {
    const c = document.createElement("div");
    c.className = "slot-row";
    const u = document.createElement("span");
    u.className = "effect-name", u.textContent = `${i.name}${i.required ? " *" : ""}`, u.title = i.description ?? `${i.kind ?? "text"} → ${i.layer}`, i.layer === t.id && u.classList.add("slot-on-this-layer"), c.append(u);
    const d = document.createElement("span");
    d.style.display = "contents", ye.push(Qe(d, {
      id: `slot-edit-${++mn}`,
      label: () => b("common.edit"),
      className: "small slot-edit",
      title: () => b("slots.editHint", { name: i.name }),
      onMount(m) {
        m.dataset.slot = i.name, m.dataset.slotName = i.name;
      },
      onClick: () => dx(c, i)
    })), c.append(d);
    const p = document.createElement("span");
    p.style.display = "contents", ye.push(Qe(p, {
      id: `slot-remove-${++mn}`,
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
  s.style.display = "contents", ye.push(at(s, {
    id: `slot-kind-${++mn}`,
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
    id: `slot-offer-${++mn}`,
    label: () => b("slots.offer"),
    onClick: () => {
      Ns("slots.createTitle", "slots.name", "slots.createButton", (i) => {
        oe(`offer ${i}`, {
          op: "defineSlot",
          slot: { name: i, layer: t.id, kind: r }
        });
      });
    }
  })), o.append(s, a), n.append(o);
}
function dx(e, t) {
  e.replaceChildren();
  const n = document.createElement("span"), o = document.createElement("span"), r = document.createElement("span"), s = document.createElement("span"), a = document.createElement("span");
  for (const u of [n, o, r, s, a]) u.style.display = "contents";
  e.append(n, o, r, s, a);
  const i = ++mn;
  ye.push(at(n, {
    id: `slot-edit-name-${i}`,
    label: () => b("slots.name"),
    value: t.name,
    className: "slot-edit-name",
    onCommit: () => {
    }
  })), ye.push(at(o, {
    id: `slot-edit-kind-${i}`,
    label: () => b("slots.kind"),
    value: t.kind ?? "text",
    className: "slot-edit-kind",
    options: ["text", "image", "color"].map((u) => ({ value: u, label: u })),
    onCommit: () => {
    }
  })), ye.push(at(r, {
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
      it();
      return;
    }
    const d = e.querySelector(".slot-edit-name")?.value.trim() ?? "";
    d && oe(`update slot ${t.name}`, {
      op: "updateSlot",
      name: t.name,
      slot: {
        name: d,
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
let wl = 0;
async function fx() {
  if (!C.project) return;
  const e = ++wl, t = await Ky(C.project);
  e === wl && (zi = { entries: t.entries, position: t.position, head: t.head }, Et(), T.undo.disabled = t.position === 0, T.redo.disabled = t.position >= t.head);
}
function xl(e, t, n) {
  const o = t - e.transform.x, r = n - e.transform.y;
  return o === 0 && r === 0 ? null : { op: "move", id: e.id, dx: o, dy: r };
}
function Sl(e, t, n) {
  return t === e.transform.width && n === e.transform.height ? null : { op: "resize", id: e.id, width: t, height: n };
}
function px(e) {
  if (!("id" in e) || e.op !== "update") return null;
  const t = e.id;
  if (typeof t != "string") return null;
  const n = Object.keys(e).filter((o) => o !== "op" && o !== "id" && o !== "expectedVersion").sort();
  return n.length > 0 ? `update:${t}:${n.join(",")}` : null;
}
function Lf(e) {
  if (!C.document) return !1;
  let t = !1;
  for (const n of e)
    if (n.op === "move" || n.op === "resize" || n.op === "rotate") {
      const o = Ve(De(C.document)).find(({ layer: r }) => r.id === n.id)?.layer;
      if (!o) continue;
      n.op === "move" ? (o.transform.x += n.dx, o.transform.y += n.dy) : n.op === "resize" ? (o.transform.width = n.width, o.transform.height = n.height) : o.transform.rotation = n.degrees, t = !0;
    }
  return t && (ut(), Oa() && Yi(Dt())), t;
}
function zf() {
  const e = C.project, t = C.document ? structuredClone(C.document) : null;
  return () => {
    if (!t || C.project !== e) return;
    const n = C.document;
    if (n && Le(n) === Le(t)) {
      $t(), C.document = t, Et(), ut(), it();
      return;
    }
    ze("reload", rt);
  };
}
function Cl(e, t, n) {
  return { project: e, document: t.id, layer: n.id, version: Le(t), text: n.text, runs: n.runs ?? [] };
}
async function mx(e) {
  const t = xw(e);
  if (!t) return { status: "applied" };
  let n = !1;
  const o = await jn.outcome("apply runs", async () => {
    const r = e.capture;
    if (C.project !== r.project || C.document?.id !== r.document || C.selection.length !== 1 || C.selection[0] !== r.layer) throw new Error(b("runs.notSent"));
    const s = Ve(De(C.document)).find((c) => c.layer.id === r.layer)?.layer;
    if (!s || po(s)) throw new Error(b("runs.notSent"));
    const a = await $n(r.project, t, r.version);
    n = !0;
    const i = a.document ?? await Ai(r.project);
    if (C.project !== r.project || C.document?.id !== r.document) throw new Error(b("runs.notSent"));
    Sa.delete(Di(r)), jo(i), je(b("status.editDone", { version: a.version }));
  });
  return o.status === "applied" ? { status: "applied" } : (wn("apply runs", o.error), { status: n ? "committed" : o.error instanceof ot ? "refused" : "unknown", error: n ? b("runs.committed") : o.error instanceof ot ? Bi(o.error) : `${b("runs.failed")} ${String(o.error)}` });
}
async function oe(e, t, n) {
  if (!C.project || !C.document) return;
  const o = C.project, r = zf();
  let s = !1;
  Lf([t]), await jn.enqueue({
    label: e,
    coalesceKey: px(t),
    run: async () => {
      if (C.project !== o || !C.document) {
        je(b("status.editNotSent"), "error");
        return;
      }
      const a = await $n(
        o,
        t,
        Le(C.document)
      );
      s = !0, je(b("status.editDone", { version: a.version })), a.created?.length && (C.selection = a.created), a.document ? jo(a.document) : await rt();
    },
    onError: (a) => {
      s || r(), n && n(a), wn(e, a);
    },
    onSuperseded: r
  });
}
async function hx(e, t) {
  await wt(e, t);
}
async function wt(e, t, n) {
  if (!C.project || !C.document || t.length === 0) return;
  const o = C.project, r = zf();
  let s = !1;
  Lf(t), await jn.enqueue({
    label: e,
    coalesceKey: null,
    run: async () => {
      if (C.project !== o || !C.document || n && !cr(n)) {
        r(), $t(), je(b("status.editNotSent"), "error");
        return;
      }
      const a = await Xy(
        o,
        e,
        t,
        n?.version ?? Le(C.document)
      );
      s = !0, a.created?.length && (C.selection = a.created), je(b("status.editDone", { version: a.version })), a.document ? jo(a.document) : await rt();
    },
    onError: (a) => {
      s || r(), wn(e, a);
    }
  });
}
function Js(e, t, n, o, r) {
  if (e.preventDefault(), !C.document || T.canvas.getBoundingClientRect().width === 0 || C.drag && C.drag.pointerId !== e.pointerId || o === "resize" && !Ea()) return;
  ht();
  const s = T.canvas;
  if (C.drag = {
    ids: t.map(({ layer: a }) => a.id),
    mode: o,
    handle: r,
    startX: e.clientX,
    startY: e.clientY,
    pointerId: e.pointerId,
    capture: s,
    project: C.project,
    version: Le(C.document),
    generation: ++Li,
    shift: e.shiftKey,
    alt: e.altKey,
    epoch: 0,
    bounds: n,
    origins: t.map(({ layer: a, x: i, y: c, width: u, height: d }) => ({
      id: a.id,
      x: a.transform.x,
      y: a.transform.y,
      absoluteX: i,
      absoluteY: c,
      width: u,
      height: d,
      rotation: a.transform.rotation ?? 0,
      layer: structuredClone(a)
    })),
    preserveSelectionScale: o === "resize" && t.length === 1 && t[0]?.layer.type === "text"
  }, !gx(C.drag)) {
    Ot !== null && $t(), jl(C.drag);
    const a = bt;
    !C.drag.previewActive && a && a.pending.then(() => {
      C.drag && bt === a && jl(C.drag);
    });
  }
  try {
    s.setPointerCapture?.(e.pointerId);
  } catch {
    e.isTrusted && ht();
  }
}
function gx(e) {
  return e.mode !== "move" || !C.document || Wo === null || Ot !== Le(C.document) ? !1 : (e.adoptedDelta = Wo, e.previewActive = !0, Xi(e, e.lastDelta?.x ?? 0, e.lastDelta?.y ?? 0), !0);
}
function qi(e) {
  return !C.project || !C.document ? null : `${C.project}:${Le(C.document)}:${[...e].sort().join(",")}`;
}
function Ki() {
  const e = bt;
  if (bt = null, !!e) {
    e.baseUrl && !An.includes(e.baseUrl) && URL.revokeObjectURL(e.baseUrl), e.selectionUrl && !An.includes(e.selectionUrl) && URL.revokeObjectURL(e.selectionUrl);
    for (const t of e.items ?? []) An.includes(t.url) || URL.revokeObjectURL(t.url);
  }
}
async function _f(e) {
  const t = qi(e);
  if (!t || !C.project || !C.document) return;
  if (bt?.key === t) return bt.pending;
  Ki();
  const n = C.project, o = Le(C.document), r = qo(), s = {
    key: t,
    pending: Promise.resolve()
  };
  return bt = s, s.pending = Promise.all([
    uo(Vr(n, o, r, { exclude: e })),
    uo(Vr(n, o, r, { only: e }))
  ]).then(([a, i]) => {
    if (bt !== s) {
      URL.revokeObjectURL(a), URL.revokeObjectURL(i);
      return;
    }
    s.baseUrl = a, s.selectionUrl = i;
  }).catch(() => {
    bt === s && (bt = null);
  }), s.pending;
}
function jl(e) {
  if (e.mode === "resize") {
    Xr(e);
    return;
  }
  const t = bt;
  if (e.previewActive || t?.key !== qi(e.ids) || !t.baseUrl || !t.selectionUrl) return;
  const n = document.createElement("img");
  n.id = "drag-preview-base", n.className = "drag-preview-image", n.alt = "", n.src = t.baseUrl;
  const o = document.createElement("img");
  o.id = "drag-preview-selection", o.className = "drag-preview-image drag-preview-selection", o.alt = "", o.src = t.selectionUrl, T.overlay.before(n, o), T.canvasImage.classList.add("drag-preview-hidden"), An = [t.baseUrl, t.selectionUrl], e.previewActive = !0, Xi(e, e.lastDelta?.x ?? 0, e.lastDelta?.y ?? 0);
}
function $t() {
  document.getElementById("drag-preview-base")?.remove(), document.getElementById("drag-preview-selection")?.remove(), document.querySelectorAll("[data-resize-preview-item]").forEach((e) => e.remove()), T.canvasImage.classList.remove("drag-preview-hidden");
  for (const e of An) URL.revokeObjectURL(e);
  An = [], Ot = null, Wo = null, Ki();
}
function Kr(e) {
  return e.handle?.length === 2 && e.origins.length === 1 && e.origins[0]?.layer.type === "image" ? !e.shift : e.shift;
}
function cr(e) {
  if (e.cancelled || e.generation !== Li || C.project !== e.project || !C.document || Le(C.document) !== e.version) return !1;
  const t = Ve(De(C.document));
  return e.ids.every((n) => {
    const o = t.find((r) => r.layer.id === n);
    return o && et(o.layer) && Wi(t, o.parent) !== null;
  });
}
function Ra(e) {
  e.capture.hasPointerCapture?.(e.pointerId) && e.capture.releasePointerCapture(e.pointerId);
}
function ht() {
  const e = C.drag?.mode === "resize" ? C.drag : pn;
  e && (e.cancelled = !0, Li += 1, C.drag === e && (C.drag = null), pn = null, Ra(e), $t(), delete T.canvas.dataset.resizePreview, ut());
}
function Ff(e, t, n) {
  const o = Ab(
    e.bounds,
    e.origins.length === 1 ? e.origins[0].rotation : 0,
    e.handle ?? "se",
    t,
    n,
    { ratio: Kr(e), centre: e.alt },
    e.origins
  ), r = e.measurement;
  return o && r?.height !== void 0 && r.width === o.width && r.epoch === e.epoch && !Kr(e) && (o.y += (o.height - r.height) / 2, o.height = r.height), o && Object.values(o).every(Number.isFinite) ? o : null;
}
function Bf(e, t) {
  return e.origins.map((n) => ({ origin: n, next: e.origins.length === 1 ? t : bf(
    { x: n.absoluteX, y: n.absoluteY, width: n.width, height: n.height },
    e.bounds,
    t,
    !0
  ) }));
}
function vx(e, t) {
  const n = e.origins[0];
  if (e.origins.length !== 1 || n?.layer.type !== "text" || Kr(e) || e.handle !== "e" && e.handle !== "w" || t.width === e.bounds.width || e.measurement?.width === t.width && e.measurement.epoch === e.epoch) return;
  const o = { width: t.width, epoch: e.epoch, pending: Promise.resolve(), height: void 0 };
  e.measurement = o, o.pending = yf(e.project, n.id, t.width).then((r) => {
    if (!cr(e) || e.measurement !== o || e.epoch !== o.epoch || Kr(e)) return;
    const s = Math.max(1, Math.ceil(r.height));
    Number.isFinite(s) && (o.height = s, C.drag === e && Ts(e));
  }).catch(() => {
  });
}
function Ao(e) {
  (e.previewActive || Ot !== null || document.querySelector(".drag-preview-image")) && $t(), e.previewActive = !1, T.canvas.dataset.resizePreview = "handles-only";
}
function Xr(e) {
  if (!C.document || e.cancelled || !cr(e)) return;
  const t = e.next, n = Ib(C.document, e.ids), o = t ? Bf(e, t) : [], r = o.some(({ origin: u, next: d }) => [
    { x: u.absoluteX, y: u.absoluteY, width: u.width, height: u.height },
    d
  ].some((p) => {
    const m = Ur({ ...p, rotation: u.rotation });
    return m.x < 0 || m.y < 0 || m.x + m.width > C.document.canvas.width || m.y + m.height > C.document.canvas.height;
  })), s = T.canvasImage.getBoundingClientRect(), a = s.width === C.document.canvas.width && s.height === C.document.canvas.height;
  if (!t || !n || r || !a) {
    Ao(e);
    return;
  }
  const i = bt;
  if (!i || i.key !== qi(e.ids) || !i.baseUrl) {
    Ao(e), _f(e.ids).then(() => {
      C.drag === e && Xr(e);
    });
    return;
  }
  if (!i.items) {
    Ao(e), i.itemsPending ??= (async () => {
      const u = [];
      try {
        for (const d of n) u.push({ id: d.id, url: await uo(Vr(e.project, e.version, qo(), { only: [d.id] })) });
        if (bt !== i) {
          for (const d of u) URL.revokeObjectURL(d.url);
          return;
        }
        i.items = u, C.drag === e && Xr(e);
      } catch {
        for (const d of u) URL.revokeObjectURL(d.url);
      }
    })();
    return;
  }
  const c = i.items.map((u) => {
    const d = o.find(({ origin: p }) => p.id === u.id);
    return Mb(
      d.origin.layer,
      { x: d.origin.absoluteX, y: d.origin.absoluteY, width: d.origin.width, height: d.origin.height },
      d.next
    );
  });
  if (c.some((u) => !u)) {
    Ao(e);
    return;
  }
  if (!e.previewActive) {
    const u = document.createElement("img");
    u.id = "drag-preview-base", u.className = "drag-preview-image", u.alt = "", u.src = i.baseUrl, u.style.objectFit = "contain", T.overlay.before(u);
    for (const d of i.items) {
      const p = document.createElement("img");
      p.className = "drag-preview-image drag-preview-selection", p.dataset.resizePreviewItem = d.id, p.alt = "", p.src = d.url, p.style.objectFit = "contain", T.overlay.before(p);
    }
    T.canvasImage.classList.add("drag-preview-hidden"), An = [i.baseUrl, ...i.items.map((d) => d.url)], e.previewActive = !0;
  }
  for (let u = 0; u < i.items.length; u += 1) {
    const d = document.querySelector(`[data-resize-preview-item="${CSS.escape(i.items[u].id)}"]`), p = c[u];
    d.style.transformOrigin = "0 0", d.style.transform = `matrix(${p[0]},${p[1]},${p[2]},${p[3]},${p[4] * s.width / C.document.canvas.width},${p[5] * s.height / C.document.canvas.height})`;
  }
  T.canvas.dataset.resizePreview = "items";
}
function Ts(e) {
  if (!cr(e)) {
    ht();
    return;
  }
  const t = Ff(e, e.lastDelta?.x ?? 0, e.lastDelta?.y ?? 0);
  if (e.invalid = t === null, e.next = t ?? void 0, !t) {
    Ao(e);
    return;
  }
  vx(e, t);
  const n = T.overlay.querySelector(".handle-box");
  n && C.document && (n.style.left = `${t.x / C.document.canvas.width * 100}%`, n.style.top = `${t.y / C.document.canvas.height * 100}%`, n.style.width = `${t.width / C.document.canvas.width * 100}%`, n.style.height = `${t.height / C.document.canvas.height * 100}%`), Xr(e);
}
function Xi(e, t, n) {
  if (e.mode === "resize") {
    Ts(e);
    return;
  }
  if (!C.document || !e.previewActive) return;
  const o = document.getElementById("drag-preview-selection");
  if (!o) return;
  const r = C.document.canvas;
  if (o.style.transformOrigin = "0 0", e.mode === "move")
    o.style.transform = `translate(${((e.adoptedDelta?.x ?? 0) + t) / r.width * 100}%, ${((e.adoptedDelta?.y ?? 0) + n) / r.height * 100}%)`;
  else {
    const s = T.canvas.getBoundingClientRect(), a = s.left + (e.bounds.x + e.bounds.width / 2) / r.width * s.width, i = s.top + (e.bounds.y + e.bounds.height / 2) / r.height * s.height, c = Math.atan2(e.startY - i, e.startX - a), u = Math.atan2(e.startY + n / Gt() - i, e.startX + t / Gt() - a);
    o.style.transformOrigin = `${(e.bounds.x + e.bounds.width / 2) / r.width * 100}% ${(e.bounds.y + e.bounds.height / 2) / r.height * 100}%`, o.style.transform = `rotate(${(u - c) * 180 / Math.PI}deg)`;
  }
}
function Gt() {
  const e = T.canvas.getBoundingClientRect();
  return C.document && e.width !== 0 ? C.document.canvas.width / e.width : 1;
}
function Vf(e) {
  const t = C.drag;
  if (t?.mode !== "resize") return !1;
  if (e.key === "Escape")
    return e.preventDefault(), ht(), !0;
  if (e.key !== "Shift" && e.key !== "Alt") return !1;
  const n = e.key === "Shift" ? e.type === "keydown" : e.shiftKey, o = e.key === "Alt" ? e.type === "keydown" : e.altKey;
  return (n !== t.shift || o !== t.alt) && (t.shift = n, t.alt = o, t.epoch += 1, t.measurement = void 0, Ts(t)), !0;
}
window.addEventListener("pointermove", (e) => {
  const t = C.drag;
  if (!t || !C.document || e.pointerId !== t.pointerId) return;
  let n = (e.clientX - t.startX) * Gt(), o = (e.clientY - t.startY) * Gt();
  T.overlay.querySelectorAll(".smart-guide").forEach((s) => s.remove()), t.mode === "move" && ({ dx: n, dy: o } = yx(n, o, t.bounds, t.ids, Gt())), t.mode === "resize" && (t.shift !== e.shiftKey || t.alt !== e.altKey) && (t.shift = e.shiftKey, t.alt = e.altKey, t.epoch += 1, t.measurement = void 0), t.lastDelta = { x: n, y: o }, Xi(t, n, o);
  const r = T.overlay.querySelector(".handle-box");
  if (r) {
    if (t.mode === "move")
      r.style.left = `${(t.bounds.x + n) / C.document.canvas.width * 100}%`, r.style.top = `${(t.bounds.y + o) / C.document.canvas.height * 100}%`;
    else if (t.mode === "rotate") {
      const s = T.canvas.getBoundingClientRect(), a = s.left + (t.bounds.x + t.bounds.width / 2) / C.document.canvas.width * s.width, i = s.top + (t.bounds.y + t.bounds.height / 2) / C.document.canvas.height * s.height, c = (Math.atan2(e.clientY - i, e.clientX - a) - Math.atan2(t.startY - i, t.startX - a)) * 180 / Math.PI;
      r.style.transform = `rotate(${(t.origins.length === 1 ? t.origins[0].rotation : 0) + c}deg)`;
    }
  }
});
window.addEventListener("pointerup", async (e) => {
  const t = C.drag;
  if (!t || e.pointerId !== t.pointerId) return;
  if (t.mode === "resize") {
    if ((t.shift !== e.shiftKey || t.alt !== e.altKey) && (t.shift = e.shiftKey, t.alt = e.altKey, t.epoch += 1, t.measurement = void 0), t.lastDelta = { x: (e.clientX - t.startX) * Gt(), y: (e.clientY - t.startY) * Gt() }, Ts(t), C.drag = null, pn = t, Ra(t), await t.measurement?.pending, !cr(t) || t.invalid) {
      pn === t && ht();
      return;
    }
    const r = Ff(t, t.lastDelta.x, t.lastDelta.y);
    if (!r) {
      ht();
      return;
    }
    if (r.x === t.bounds.x && r.y === t.bounds.y && r.width === t.bounds.width && r.height === t.bounds.height) {
      pn = null, $t(), ut();
      return;
    }
    const s = [];
    for (const { origin: a, next: i } of Bf(t, r)) {
      const c = i.x - a.absoluteX, u = i.y - a.absoluteY;
      (c !== 0 || u !== 0) && s.push({ op: "move", id: a.id, dx: c, dy: u }), (i.width !== a.width || i.height !== a.height) && s.push({ op: "resize", id: a.id, width: i.width, height: i.height });
    }
    if (pn = null, !s.length) {
      $t(), ut();
      return;
    }
    Ot = t.previewActive ? t.version + 1 : null, Wo = null, await wt("resize selection", s, t), delete T.canvas.dataset.resizePreview;
    return;
  }
  C.drag = null, Ra(t);
  const n = Math.round(t.lastDelta?.x ?? (e.clientX - t.startX) * Gt()), o = Math.round(t.lastDelta?.y ?? (e.clientY - t.startY) * Gt());
  if (n === 0 && o === 0) {
    Ot === null && $t();
    return;
  }
  if (Ot = Le(C.document) + 1, Wo = t.mode === "move" ? { x: (t.adoptedDelta?.x ?? 0) + n, y: (t.adoptedDelta?.y ?? 0) + o } : null, t.mode === "move")
    wt("move selection", t.ids.map((r) => ({ op: "move", id: r, dx: n, dy: o })));
  else {
    const r = T.canvas.getBoundingClientRect(), s = r.left + (t.bounds.x + t.bounds.width / 2) / C.document.canvas.width * r.width, a = r.top + (t.bounds.y + t.bounds.height / 2) / C.document.canvas.height * r.height, i = (Math.atan2(e.clientY - a, e.clientX - s) - Math.atan2(t.startY - a, t.startX - s)) * 180 / Math.PI;
    wt("rotate selection", t.origins.map((c) => ({ op: "rotate", id: c.id, degrees: Math.round((c.rotation + i) * 10) / 10 })));
  }
});
window.addEventListener("pointercancel", (e) => {
  C.drag?.pointerId === e.pointerId && ht();
});
window.addEventListener("lostpointercapture", (e) => {
  C.drag?.pointerId === e.pointerId && ht();
}, !0);
window.addEventListener("blur", ht);
function yx(e, t, n, o, r) {
  if (!C.document) return { dx: e, dy: t };
  const s = 6 * r, a = Ve(De(C.document));
  let i = n;
  if (o.length === 1) {
    const y = a.find(({ layer: D }) => D.id === o[0]), N = y ? Ko(a, y.parent) : null;
    y && N && (i = Ur({
      x: y.layer.transform.x + N.x,
      y: y.layer.transform.y + N.y,
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
  ], d = [0, C.document.canvas.width / 2, C.document.canvas.width], p = [0, C.document.canvas.height / 2, C.document.canvas.height], m = [];
  for (const { layer: y, parent: N } of a) {
    if (o.includes(y.id)) continue;
    const D = Ko(a, N);
    if (!D) continue;
    const O = Ur({
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
    }), d.push(O.x, O.x + O.width / 2, O.x + O.width), p.push(O.y, O.y + O.height / 2, O.y + O.height);
  }
  const h = (y, N) => {
    let D = null;
    for (const O of y) for (const z of N) {
      const _ = z - O;
      Math.abs(_) <= s && (!D || Math.abs(_) < Math.abs(D.delta)) && (D = { delta: _, target: z });
    }
    return D;
  }, g = h(c, d), v = h(u, p);
  g && (e += g.delta, Yn("vertical", g.target)), v && (t += v.delta, Yn("horizontal", v.target));
  const w = i.x + e, x = w + i.width, E = m.filter((y) => y.right <= w + s).sort((y, N) => N.right - y.right)[0], j = m.filter((y) => y.left >= x - s).sort((y, N) => y.left - N.left)[0];
  if (E && j) {
    const N = E.right + (j.left - E.right - i.width) / 2 - w;
    Math.abs(N) <= s && (e += N, Yn("vertical", E.right), Yn("vertical", j.left));
  }
  const k = i.y + t, R = k + i.height, P = m.filter((y) => y.bottom <= k + s).sort((y, N) => N.bottom - y.bottom)[0], S = m.filter((y) => y.top >= R - s).sort((y, N) => y.top - N.top)[0];
  if (P && S) {
    const N = P.bottom + (S.top - P.bottom - i.height) / 2 - k;
    Math.abs(N) <= s && (t += N, Yn("horizontal", P.bottom), Yn("horizontal", S.top));
  }
  return { dx: e, dy: t };
}
function Yn(e, t) {
  if (!C.document) return;
  const n = document.createElement("div");
  n.className = `smart-guide ${e}`, e === "vertical" ? n.style.left = `${t / C.document.canvas.width * 100}%` : n.style.top = `${t / C.document.canvas.height * 100}%`, T.overlay.append(n);
}
function lr() {
  if (!C.document) return [];
  const e = Ve(De(C.document));
  return e.flatMap(({ layer: t, parent: n }) => {
    if (!C.selection.includes(t.id)) return [];
    const o = Ko(e, n);
    return o ? [{
      layer: t,
      x: t.transform.x + o.x,
      y: t.transform.y + o.y,
      width: t.transform.width,
      height: t.transform.height
    }] : [];
  });
}
function bx(e = lr()) {
  if (e.length === 0) return null;
  if (e.length === 1) {
    const t = e[0];
    return { x: t.x, y: t.y, width: t.width, height: t.height };
  }
  return Mi(e.map((t) => ({
    x: t.x,
    y: t.y,
    width: t.width,
    height: t.height,
    rotation: t.layer.transform.rotation ?? 0
  })));
}
function Hf(e = lr()) {
  return e.length === 0 ? null : Mi(e.map((t) => ({
    x: t.x,
    y: t.y,
    width: t.width,
    height: t.height,
    rotation: t.layer.transform.rotation ?? 0
  })));
}
function ur() {
  if (!C.document) return;
  const e = Df(), t = C.zoom ?? e;
  T.canvas.style.width = `${Math.max(1, Math.round(C.document.canvas.width * t))}px`, T.canvas.style.height = `${Math.max(1, Math.round(C.document.canvas.height * t))}px`, T.zoomValue.textContent = C.zoom === null ? b("canvas.zoomFit") : `${ke(Math.round(t * 100))}%`, T.zoomValue.title = C.zoom === null ? b("canvas.zoomFitPercent", { percent: ke(Math.round(e * 100)) }) : b("canvas.zoomResetFit");
}
function wx() {
  const e = T.stageViewport.getBoundingClientRect();
  return {
    x: e.left + T.stageViewport.clientLeft + T.stageViewport.clientWidth / 2,
    y: e.top + T.stageViewport.clientTop + T.stageViewport.clientHeight / 2
  };
}
function dr(e, t = wx()) {
  const n = T.canvas.getBoundingClientRect(), o = n.width > 0 ? (t.x - n.left) / n.width : 0.5, r = n.height > 0 ? (t.y - n.top) / n.height : 0.5;
  if (C.zoom = e === null ? null : Math.min(4, Math.max(0.1, e)), ur(), Ui(), C.zoom === null) {
    T.stageViewport.scrollLeft = 0, T.stageViewport.scrollTop = 0;
    return;
  }
  if (n.width <= 0 || n.height <= 0) return;
  const s = T.canvas.getBoundingClientRect();
  T.stageViewport.scrollLeft += s.left + o * s.width - t.x, T.stageViewport.scrollTop += s.top + r * s.height - t.y;
}
function mo(e) {
  if (!C.document || !et(e)) return;
  T.overlay.querySelector(".inline-text-editor")?.remove();
  const t = Ve(De(C.document)), n = t.find(({ layer: i }) => i.id === e.id), o = Ko(t, n?.parent ?? null);
  if (!o) return;
  const r = document.createElement("textarea");
  r.className = "inline-text-editor", r.value = e.text, r.setAttribute("aria-label", b("canvas.editText")), r.dataset.i18nAttr = "aria-label:canvas.editText", r.style.left = `${(e.transform.x + o.x) / C.document.canvas.width * 100}%`, r.style.top = `${(e.transform.y + o.y) / C.document.canvas.height * 100}%`, r.style.width = `${e.transform.width / C.document.canvas.width * 100}%`, r.style.height = `${e.transform.height / C.document.canvas.height * 100}%`, r.style.transformOrigin = "center", r.style.transform = `rotate(${e.transform.rotation ?? 0}deg)`, r.style.fontFamily = e.fontFamily, r.style.fontSize = `${Math.max(12, e.fontSize * (T.canvas.getBoundingClientRect().width / C.document.canvas.width))}px`, r.style.lineHeight = String(e.lineHeight ?? 1.2), r.style.textAlign = e.align ?? "left", r.style.color = Hw(e.color) ?? "#000000", T.overlay.append(r), C.editingText = { id: e.id, original: e.text }, r.focus(), r.select();
  let s = !1;
  const a = (i) => {
    if (s) return;
    s = !0;
    const c = r.value;
    r.remove(), C.editingText = null, i && c !== e.text ? oe("edit text", { op: "update", id: e.id, text: c }) : ut();
  };
  r.addEventListener("keydown", (i) => {
    i.key === "Escape" ? (i.preventDefault(), a(!1)) : i.key === "Enter" && (i.ctrlKey || i.metaKey) && (i.preventDefault(), a(!0));
  }), r.addEventListener("blur", () => a(!0));
}
function Yi(e) {
  Ia(() => xx(e));
}
function xx(e) {
  for (const r of Zs) r();
  Zs = [];
  const t = lr(), n = bx(t);
  if (!n || e.length === 0) return;
  const o = [
    ["X", n.x, "x"],
    ["Y", n.y, "y"],
    ["W", n.width, "width"],
    ["H", n.height, "height"],
    ["°", e.length === 1 ? e[0]?.transform.rotation ?? 0 : 0, "rotation"]
  ];
  for (const [r, s, a] of o) {
    const i = at(T.positionFields, {
      id: `position-${a}`,
      label: r,
      type: "number",
      value: String(Math.round(s * 10) / 10),
      className: "position-field-input",
      disabled: e.some((c) => !et(c)) || a === "rotation" && e.length > 1,
      onCommit: async (c) => {
        const u = Number(c);
        if (Number.isFinite(u))
          if (a === "x" || a === "y") {
            const d = a === "x" ? u - n.x : 0, p = a === "y" ? u - n.y : 0;
            wt("position selection", e.map((m) => ({ op: "move", id: m.id, dx: d, dy: p })));
          } else if (a === "rotation" && e[0])
            oe("rotate layer", { op: "rotate", id: e[0].id, degrees: u });
          else {
            if (a === "width" && e.length === 1 && e[0]?.type === "text" && C.project)
              try {
                const m = await yf(C.project, e[0].id, u);
                wt("resize text box", [{
                  op: "resize",
                  id: e[0].id,
                  width: Math.max(1, u),
                  height: Math.max(1, Math.ceil(m.height))
                }]);
                return;
              } catch {
              }
            const d = {
              ...n,
              width: a === "width" ? Math.max(1, u) : n.width,
              height: a === "height" ? Math.max(1, u) : n.height
            }, p = [];
            for (const m of t) {
              const h = t.length === 1 ? {
                x: m.x,
                y: m.y,
                width: a === "width" ? d.width : m.width,
                height: a === "height" ? d.height : m.height
              } : bf(m, n, d), g = h.x - m.x, v = h.y - m.y;
              (g || v) && p.push({ op: "move", id: m.layer.id, dx: g, dy: v }), p.push({
                op: "resize",
                id: m.layer.id,
                width: h.width,
                height: h.height
              });
            }
            wt("resize selection", p);
          }
      }
    });
    Zs.push(i);
  }
}
let Zs = [];
function ho(e) {
  const t = e ?? !Oa();
  if (bp(t), !t) return;
  Yi(Dt());
  const o = T.inspector.querySelector(".position-button")?.getBoundingClientRect(), r = T.inspector.getBoundingClientRect().left + 8, s = T.structure.getBoundingClientRect().left, a = (o?.right ?? r + 320) - 320;
  T.positionPopover.style.left = `${Math.max(r, Math.min(s - 332, a))}px`, T.positionPopover.style.top = `${Math.min(window.innerHeight - 520, (o?.bottom ?? 100) + 8)}px`, T.positionPopover.querySelector("[data-canvas-anchor]")?.focus();
}
const Uf = "assemblash-layer-clipboard-v1";
function Yr() {
  if (!C.project || !C.document || C.selection.length === 0) return !1;
  const e = Ve(De(C.document)), t = new Set(C.selection), n = e.filter(({ layer: o, parent: r }) => t.has(o.id) && (!r || !t.has(r))).map(({ layer: o }) => structuredClone(o));
  return sessionStorage.setItem(Uf, JSON.stringify({ project: C.project, layers: n })), je(It("editor.copiedLayers", n.length)), n.length > 0;
}
function Wf() {
  if (!C.project) return null;
  try {
    const e = JSON.parse(sessionStorage.getItem(Uf) ?? "null");
    return e?.project === C.project && Array.isArray(e.layers) ? e.layers : null;
  } catch {
    return null;
  }
}
function qf() {
  const e = Wf();
  if (!e || !C.project) {
    je(b("editor.nothingToPaste"), "error");
    return;
  }
  wt("paste layers", [{
    op: "insertLayerTree",
    sourceProject: C.project,
    layers: e,
    position: { at: "root" },
    offsetX: 20,
    offsetY: 20
  }]);
}
function Yo(e = "delete selection") {
  const t = Dt();
  t.length === 0 || t.some((n) => !et(n)) || wt(e, t.map((n) => ({ op: "delete", id: n.id })));
}
function jr(e) {
  if (!C.document || C.selection.length !== 1) return;
  const t = C.selection[0], n = Ve(De(C.document)), o = n.find(({ layer: u }) => u.id === t);
  if (!o || !et(o.layer)) return;
  const r = o.parent ? n.find(({ layer: u }) => u.id === o.parent)?.layer : null, s = r?.type === "group" ? r.children ?? [] : De(C.document), a = s.findIndex((u) => u.id === t);
  let i = a;
  if (e === "front" && (i = s.length - 1), e === "forward" && (i = Math.min(s.length - 1, a + 1)), e === "backward" && (i = Math.max(0, a - 1)), e === "back" && (i = 0), i === a) return;
  const c = o.parent ? { at: "in", parent: o.parent, index: i } : { at: "root", index: i };
  oe(`send ${e}`, { op: "reorder", id: t, to: c });
}
function Go(e, t) {
  const n = Dt(), o = n.length > 0 && n.every(et), r = n.length === 1 ? n[0] : null, s = [], a = (c, u, d, p = !1) => {
    s.push({ kind: "item", key: c, icon: u, disabled: p, run: d });
  }, i = () => {
    s.push({ kind: "separator" });
  };
  r?.type === "text" && (a("context.editText", "ph-pencil-simple", () => mo(r), !o), i()), a("context.cut", "ph-scissors", () => {
    Yr() && Yo("cut layers");
  }, !o), a("context.copy", "ph-copy", () => {
    Yr();
  }, n.length === 0), a("context.paste", "ph-clipboard-text", qf, !Wf()), a("context.duplicate", "ph-copy-simple", () => {
    wt("duplicate", n.map((c) => ({ op: "duplicate", id: c.id })));
  }, !o), a("context.delete", "ph-trash", Yo, !o), i(), a("context.bringFront", "ph-arrow-line-up", () => jr("front"), !r || !o), a("context.bringForward", "ph-arrow-up", () => jr("forward"), !r || !o), a("context.sendBackward", "ph-arrow-down", () => jr("backward"), !r || !o), a("context.sendBack", "ph-arrow-line-down", () => jr("back"), !r || !o), i(), a("context.group", "ph-stack", () => {
    oe("group", { op: "group", ids: n.map((c) => c.id) });
  }, n.length < 2 || !o), a("context.ungroup", "ph-stack-minus", () => {
    r && oe("ungroup", { op: "ungroup", id: r.id });
  }, r?.type !== "group" || !o), a(r?.locked ? "context.unlock" : "context.lock", r?.locked ? "ph-lock-open" : "ph-lock", () => {
    r && oe(r.locked ? "unlock layer" : "lock layer", { op: "setLocked", id: r.id, locked: !r.locked });
  }, !r || po(r, !0) !== null), a(r?.visible === !1 ? "context.show" : "context.hide", r?.visible === !1 ? "ph-eye" : "ph-eye-slash", () => {
    r && oe(r.visible === !1 ? "show layer" : "hide layer", { op: "setVisible", id: r.id, visible: r.visible === !1 });
  }, !r || !o), a("context.rename", "ph-pencil-simple", () => {
    if (!r) return;
    ko("layers");
    const c = T.layers.querySelector(`[data-id="${CSS.escape(r.id)}"]`);
    c && (c.focus(), c.dispatchEvent(new KeyboardEvent("keydown", { key: "F2", bubbles: !0 })));
  }, !r || !o), i(), a("context.alignLeft", "ph-align-left-simple", () => Gn("left"), !o), a("context.alignHorizontalCenters", "ph-align-center-horizontal", () => Gn("centerHorizontal"), !o), a("context.alignRight", "ph-align-right-simple", () => Gn("right"), !o), a("context.alignTop", "ph-align-top-simple", () => Gn("top"), !o), a("context.alignVerticalMiddles", "ph-align-center-vertical", () => Gn("centerVertical"), !o), a("context.alignBottom", "ph-align-bottom-simple", () => Gn("bottom"), !o), a("context.distributeHorizontally", "ph-columns", () => {
    oe("distribute horizontally", { op: "distribute", ids: n.map((c) => c.id), axis: "horizontal" });
  }, !o || n.length < 3), a("context.distributeVertically", "ph-rows", () => {
    oe("distribute vertically", { op: "distribute", ids: n.map((c) => c.id), axis: "vertical" });
  }, !o || n.length < 3), In.open(s, e, t);
}
function Gn(e) {
  if (!C.document) return;
  const t = Dt(), n = t.map((a) => a.id);
  if (t.length !== 1) {
    oe("align selection", { op: "align", ids: n, edge: e });
    return;
  }
  const o = Hf(lr());
  if (!o) return;
  let r = 0, s = 0;
  e === "left" && (r = -o.x), e === "centerHorizontal" && (r = C.document.canvas.width / 2 - (o.x + o.width / 2)), e === "right" && (r = C.document.canvas.width - (o.x + o.width)), e === "top" && (s = -o.y), e === "centerVertical" && (s = C.document.canvas.height / 2 - (o.y + o.height / 2)), e === "bottom" && (s = C.document.canvas.height - (o.y + o.height)), (r !== 0 || s !== 0) && oe("align layer to canvas", { op: "move", id: t[0].id, dx: r, dy: s });
}
function Kf(e) {
  ht(), ze("open", async () => {
    C.project = e, Fi.setCurrentProject(e), C.selection = [], $t(), Ki(), await Xf();
  });
}
async function Xf() {
  try {
    await rt();
  } catch (e) {
    const t = e instanceof ot ? e.details : null, n = t && typeof t.pid == "number" ? t.pid : null;
    if (!(e instanceof ot) || e.code !== "projectLocked" || n === null || !C.project || !window.confirm(b("projects.recoverLockConfirm", { pid: n }))) throw e;
    await qy(C.project, n), await rt(), je(b("projects.recovered"));
  }
  if (await Yt.projectChanged(), T.renameProject.disabled = !C.project, T.deleteProject.disabled = !C.project, T.reload.disabled = !C.project, je(b("projects.opened", { name: C.document?.name ?? C.project ?? "" })), C.project)
    try {
      const e = await By(C.project);
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
T.reload.addEventListener("click", () => {
  ze("reload", async () => {
    await rt(), je(b("projects.refreshed"));
  });
});
T.newProject.addEventListener("click", () => Zw.open());
T.emptyCreate.addEventListener("click", () => T.newProject.click());
T.agents.addEventListener("click", () => {
  Pf.open();
});
const kl = [
  ["add-text-section", "toolbar.textButton", T.addText],
  ["add-shape-section", "toolbar.elementsButton", T.addShape],
  ["add-upload-section", "toolbar.uploadsButton", T.addImage],
  ["add-template-section", "toolbar.templatesButton", T.templatesToggle],
  ["add-fonts-section", "toolbar.fontsButton", T.selectTool]
];
function Yf(e) {
  for (const t of [T.selectTool, T.addText, T.addShape, T.addImage, T.templatesToggle]) {
    const n = t === e;
    t.classList.toggle("active", n), t.setAttribute("aria-pressed", String(n));
  }
}
function fr(e = "add-text-section", t = T.addText) {
  e !== "add-fonts-section" && fo.releaseSamples(), T.addPanel.classList.remove("collapsed"), T.structure.classList.remove("mobile-open"), T.dockToggle.setAttribute("aria-expanded", "false"), Yt.setOpen(!1);
  const n = kl.find(([r]) => r === e)?.[1] ?? "toolbar.textButton";
  T.addPanelTitle.dataset.i18n = n, T.addPanelTitle.textContent = b(n);
  for (const [r] of kl) {
    const s = document.getElementById(r);
    s && (s.hidden = r !== e);
  }
  const o = e === "add-template-section";
  Yt.setOpen(o && Yt.isVisible()), T.openTemplates.hidden = o && Yt.isVisible(), T.addPanel.scrollTop = 0, Yf(t);
}
function pr() {
  fo.releaseSamples(), T.addPanel.classList.add("collapsed"), Yf(T.selectTool);
}
T.addPanelClose.addEventListener("click", pr);
T.addText.addEventListener("click", () => fr("add-text-section", T.addText));
T.addShape.addEventListener("click", () => fr("add-shape-section", T.addShape));
T.addImage.addEventListener("click", () => fr("add-upload-section", T.addImage));
T.templatesToggle.addEventListener("click", () => fr("add-template-section", T.templatesToggle));
async function Gi(e = !1) {
  fr("add-fonts-section", T.selectTool), await fo.reload(), e && fo.focusInstall();
}
async function Sx(e) {
  const n = (await pb())[0];
  if (!n) {
    je(b("fonts.noneInstalled"), "error"), await Gi(!0);
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
  }, a = (await $n(
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
    Le(C.document)
  )).created?.[0];
  a && (C.selection = [a]);
  const i = { plain: "text.plain", heading: "text.heading", subheading: "text.subheading", body: "text.body" }[e];
  je(b("editor.addedText", { preset: b(i) })), await rt();
  const c = Vi();
  c?.type === "text" && mo(c);
}
async function Cx(e) {
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
  }, o = e === "line" ? { stroke: { color: Rf, width: Nf } } : { fill: $i }, r = e === "rect" ? { kind: "rect", cornerRadius: 0 } : { kind: e }, a = (await $n(
    C.project,
    {
      op: "create",
      position: { at: "root" },
      transform: n,
      type: "shape",
      shape: r,
      ...o
    },
    Le(C.document)
  )).created?.[0];
  a && (C.selection = [a]);
  const i = { rect: "shapes.rectangle", ellipse: "shapes.ellipse", line: "shapes.line" }[e];
  je(b("editor.addedShape", { kind: b(i) })), await rt();
}
async function jx(e) {
  if (!C.project || !C.document) return;
  const t = 320, n = 240, o = {
    x: Math.round((C.document.canvas.width - t) / 2),
    y: Math.round((C.document.canvas.height - n) / 2),
    width: t,
    height: n
  }, s = (await $n(
    C.project,
    {
      op: "create",
      position: { at: "root" },
      transform: o,
      type: "shape",
      shape: { kind: "path", d: e },
      fill: $i
    },
    Le(C.document)
  )).created?.[0];
  s && (C.selection = [s]), je(b("editor.addedPath")), await rt();
}
T.addPanel.addEventListener("click", (e) => {
  const t = e.target, o = t.closest("[data-text-preset]")?.dataset.textPreset;
  o && ze(`add ${o}`, () => Sx(o));
  const r = t.closest("[data-shape]")?.dataset.shape;
  (r === "rect" || r === "ellipse" || r === "line") && ze(`add ${r}`, () => Cx(r)), r === "path" && Ns("editor.addPathTitle", "editor.pathDataLabel", "editor.addPathButton", (s) => {
    ze("add path", () => jx(s));
  });
});
T.undo.addEventListener("click", () => {
  ze("undo", async () => {
    if (!C.project) return;
    const e = await Yy(C.project);
    je(b("status.undoDone", { version: e.version })), await rt();
  });
});
T.redo.addEventListener("click", () => {
  ze("redo", async () => {
    if (!C.project) return;
    const e = await Gy(C.project);
    je(b("status.redoDone", { version: e.version })), await rt();
  });
});
T.exportButton.addEventListener("click", () => Jw.open());
Sp((e) => Na(
  e,
  e.type === "image/svg+xml" || e.name.toLowerCase().endsWith(".svg") ? "svg" : "image"
));
function Na(e, t, n) {
  e && ze(t === "svg" ? "add vector" : "add image", async () => {
    if (!(!C.project || !C.document)) {
      T.uploadFeedback.textContent = b("uploads.uploading", { name: e.name });
      try {
        const o = await Ii(C.project, e), r = o.asset.mediaType === "image/svg+xml" || t === "svg", { width: s, height: a } = Tb(
          o.asset,
          C.document.canvas
        ), i = Math.round(n?.x ?? (C.document.canvas.width - s) / 2), c = Math.round(n?.y ?? (C.document.canvas.height - a) / 2), u = r ? {
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
        }, d = await $n(
          C.project,
          u,
          o.version
        );
        d.created?.length && (C.selection = d.created), je(b("uploads.addedVersion", { name: e.name, version: d.version })), T.uploadFeedback.textContent = b("uploads.added", { name: e.name }), await rt();
      } catch (o) {
        throw T.uploadFeedback.textContent = b("uploads.failed", { name: e.name }), o;
      }
    }
  });
}
for (const e of ["dragenter", "dragover"])
  T.stageViewport.addEventListener(e, (t) => t.preventDefault());
T.stageViewport.addEventListener("drop", (e) => {
  e.preventDefault();
  const t = e.dataTransfer?.files[0];
  if (!t || !C.document) return;
  const n = T.canvas.getBoundingClientRect();
  if (e.clientX < n.left || e.clientX > n.right || e.clientY < n.top || e.clientY > n.bottom) {
    Na(t, t.type === "image/svg+xml" ? "svg" : "image");
    return;
  }
  const o = {
    x: (e.clientX - n.left) / n.width * C.document.canvas.width - 150,
    y: (e.clientY - n.top) / n.height * C.document.canvas.height - 100
  };
  Na(t, t.type === "image/svg+xml" ? "svg" : "image", o);
});
function ko(e) {
  _i = e, Et();
}
T.historyShortcut.addEventListener("click", () => ko("history"));
T.dockToggle.addEventListener("click", () => {
  const e = T.structure.classList.toggle("mobile-open");
  T.dockToggle.setAttribute("aria-expanded", String(e)), e && (pr(), T.layersTab.focus());
});
T.selectTool.addEventListener("click", () => {
  C.document && (pr(), Yt.setOpen(!1), T.structure.classList.remove("mobile-open"), T.dockToggle.setAttribute("aria-expanded", "false"), T.canvas.focus());
});
T.positionClose.addEventListener("click", () => ho(!1));
T.positionPopover.addEventListener("click", (e) => {
  const t = e.target.closest(
    "[data-canvas-anchor], [data-layout]"
  ), n = t?.dataset.canvasAnchor;
  if (n && !t.disabled && C.selection.length > 0 && C.document) {
    const a = lr(), i = Hf(a);
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
    const d = [], p = u.horizontal === "left" ? 0 : u.horizontal === "right" ? C.document.canvas.width - i.width : (C.document.canvas.width - i.width) / 2, m = u.vertical === "top" ? 0 : u.vertical === "bottom" ? C.document.canvas.height - i.height : (C.document.canvas.height - i.height) / 2;
    for (const h of Dt())
      d.push({ op: "move", id: h.id, dx: p - i.x, dy: m - i.y });
    ho(!1), hx(`place layer ${t.title.toLowerCase()}`, d);
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
  s && (ho(!1), oe("arrange layers", s));
});
document.addEventListener("pointerdown", (e) => {
  const t = e.target;
  Oa() && !T.positionPopover.contains(t) && !T.inspector.contains(t) && ho(!1), In.isOpen() && !T.contextMenu.contains(t) && In.close();
});
T.openTemplates.addEventListener("click", () => {
  if (!Yt.isVisible()) {
    je(b("editor.noSlotsHint")), pr(), ko("properties"), window.matchMedia("(max-width: 1024px)").matches && (T.structure.classList.add("mobile-open"), T.dockToggle.setAttribute("aria-expanded", "true"));
    return;
  }
  Yt.setOpen(!0), T.openTemplates.hidden = !0, T.templatesPanel.scrollIntoView({ block: "nearest" });
});
T.templatesClose.addEventListener("click", () => {
  Yt.setOpen(!1), T.openTemplates.hidden = !1;
});
T.zoomOut.addEventListener("click", () => dr(Ps() / 1.2));
T.zoomIn.addEventListener("click", () => dr(Ps() * 1.2));
T.zoomValue.addEventListener("click", () => dr(null));
T.zoom100.addEventListener("click", () => dr(1));
T.stageViewport.addEventListener("wheel", (e) => {
  if (!(e.ctrlKey || e.metaKey)) return;
  e.preventDefault();
  const t = e.deltaMode === WheelEvent.DOM_DELTA_LINE ? e.deltaY * 16 : e.deltaMode === WheelEvent.DOM_DELTA_PAGE ? e.deltaY * T.stageViewport.clientHeight : e.deltaY, n = Math.exp(-t * Math.log(1.1) / 100);
  dr(Ps() * n, { x: e.clientX, y: e.clientY });
}, { passive: !1 });
function Gf() {
  window.matchMedia("(max-width: 1024px)").matches ? (T.structure.classList.remove("mobile-open"), T.dockToggle.setAttribute("aria-expanded", "false"), fo.releaseSamples(), T.addPanel.classList.add("collapsed")) : (T.structure.classList.remove("mobile-open"), T.dockToggle.setAttribute("aria-expanded", "true"));
}
window.addEventListener("resize", () => {
  C.zoom === null && ur(), Ui(), Gf();
});
const kx = new ResizeObserver(() => {
  C.zoom === null && ur(), Ui();
});
kx.observe(T.stageViewport);
Gf();
let mr = !1, Io = null;
window.addEventListener("keyup", (e) => {
  Vf(e) || e.code === "Space" && (mr = !1, T.stageViewport.classList.remove("pan-ready"));
});
window.addEventListener("blur", () => {
  mr = !1, T.stageViewport.classList.remove("pan-ready"), Io?.();
});
T.stageViewport.addEventListener("pointerdown", (e) => {
  if (e.button !== 1 && !(mr && e.button === 0)) return;
  e.preventDefault(), e.stopPropagation(), Io?.();
  const t = { x: e.clientX, y: e.clientY }, n = { x: T.stageViewport.scrollLeft, y: T.stageViewport.scrollTop };
  T.stageViewport.classList.add("panning");
  const o = (a) => {
    a.pointerId === e.pointerId && (T.stageViewport.scrollLeft = n.x - (a.clientX - t.x), T.stageViewport.scrollTop = n.y - (a.clientY - t.y));
  }, r = () => {
    window.removeEventListener("pointermove", o), window.removeEventListener("pointerup", s), window.removeEventListener("pointercancel", s), window.removeEventListener("blur", r), T.stageViewport.classList.remove("panning"), Io === r && (Io = null);
  }, s = (a) => {
    a.pointerId === e.pointerId && r();
  };
  Io = r, window.addEventListener("pointermove", o), window.addEventListener("pointerup", s), window.addEventListener("pointercancel", s), window.addEventListener("blur", r, { once: !0 });
}, { capture: !0 });
T.overlay.addEventListener("pointerdown", (e) => {
  if (mr || e.target !== T.overlay || e.button !== 0 || !C.document) return;
  e.preventDefault();
  const t = T.canvas.getBoundingClientRect(), n = (c) => Math.min(t.right, Math.max(t.left, c)), o = (c) => Math.min(t.bottom, Math.max(t.top, c)), r = { x: n(e.clientX), y: o(e.clientY) }, s = document.createElement("div");
  s.className = "selection-marquee", T.overlay.append(s);
  const a = (c) => {
    const u = n(c.clientX), d = o(c.clientY), p = Math.min(r.x, u), m = Math.min(r.y, d), h = Math.max(r.x, u), g = Math.max(r.y, d);
    s.style.left = `${(p - t.left) / t.width * 100}%`, s.style.top = `${(m - t.top) / t.height * 100}%`, s.style.width = `${(h - p) / t.width * 100}%`, s.style.height = `${(g - m) / t.height * 100}%`;
  }, i = (c) => {
    window.removeEventListener("pointermove", a), window.removeEventListener("pointerup", i);
    const u = n(c.clientX), d = o(c.clientY), p = {
      left: Math.min(r.x, u),
      top: Math.min(r.y, d),
      right: Math.max(r.x, u),
      bottom: Math.max(r.y, d)
    }, m = [...T.overlay.querySelectorAll(".layer-hitbox")].filter((h) => {
      const g = h.getBoundingClientRect();
      return g.right >= p.left && g.left <= p.right && g.bottom >= p.top && g.top <= p.bottom;
    }).map((h) => h.dataset.id).filter((h) => !!h);
    C.selection = e.shiftKey ? [.../* @__PURE__ */ new Set([...C.selection, ...m])] : m, Et(), it(), ut();
  };
  window.addEventListener("pointermove", a), window.addEventListener("pointerup", i);
});
function Ex(e) {
  const t = e;
  return t ? t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable : !1;
}
window.addEventListener("keydown", (e) => {
  if (Vf(e)) return;
  if (e.key === "Escape" && pn) {
    e.preventDefault(), ht();
    return;
  }
  if (Ex(e.target) || e.target instanceof Element && e.target.closest("button[data-text-align]") && (e.key === "Enter" || e.code === "Space")) return;
  const t = e.ctrlKey || e.metaKey;
  if (e.code === "Space") {
    mr = !0, T.stageViewport.classList.add("pan-ready"), e.preventDefault();
    return;
  }
  if (t && e.key.toLowerCase() === "z") {
    e.preventDefault(), (e.shiftKey ? T.redo : T.undo).click();
    return;
  }
  const n = e.key.toLowerCase();
  if (t && n === "c") {
    e.preventDefault(), Yr();
    return;
  }
  if (t && n === "x") {
    e.preventDefault(), Dt().every(et) && Yr() && Yo("cut layers");
    return;
  }
  if (t && n === "v") {
    e.preventDefault(), qf();
    return;
  }
  if (t && n === "d") {
    e.preventDefault();
    const c = Dt();
    c.length && c.every(et) && wt("duplicate", c.map((u) => ({ op: "duplicate", id: u.id })));
    return;
  }
  if (t && n === "g") {
    e.preventDefault();
    const c = Dt();
    if (e.shiftKey) {
      const u = c.length === 1 && c[0]?.type === "group" ? c[0] : null;
      u && oe("ungroup", { op: "ungroup", id: u.id });
    } else c.length > 1 && c.every(et) && oe("group", { op: "group", ids: c.map((u) => u.id) });
    return;
  }
  if (e.key === "F10" && e.shiftKey) {
    e.preventDefault();
    const c = T.canvas.getBoundingClientRect();
    Go(c.left + c.width / 2, c.top + c.height / 2);
    return;
  }
  if (e.key === "Escape") {
    if (In.isOpen()) {
      In.close(), T.canvas.focus();
      return;
    }
    if (zt.isOpen()) {
      zt.close();
      return;
    }
    if (!T.addPanel.classList.contains("collapsed")) {
      e.preventDefault(), pr();
      return;
    }
    C.selection = [], In.close(), ho(!1), Et(), ut(), it();
    return;
  }
  const o = Vi(), r = Dt();
  if ((e.key === "Enter" || e.key === "F2") && o?.type === "text" && et(o)) {
    e.preventDefault(), mo(o);
    return;
  }
  if (r.length === 0 || r.some((c) => !et(c))) return;
  if (e.key === "Delete" || e.key === "Backspace") {
    e.preventDefault(), Yo();
    return;
  }
  const s = e.shiftKey ? 10 : 1, i = {
    ArrowLeft: [-s, 0],
    ArrowRight: [s, 0],
    ArrowUp: [0, -s],
    ArrowDown: [0, s]
  }[e.key];
  i && (e.preventDefault(), wt("nudge selection", r.map((c) => ({
    op: "move",
    id: c.id,
    dx: i[0],
    dy: i[1]
  }))));
});
function Rx() {
  ht(), C.project = null, C.document = null, C.selection = [], $a(null), T.canvas.hidden = !0, T.canvasControlsRoot.hidden = !0, T.canvasHints.hidden = !0, T.canvasImage.removeAttribute("src"), T.canvasEmpty.hidden = !1, T.renameProject.disabled = !0, T.deleteProject.disabled = !0, T.reload.disabled = !0, Et(), ut(), it();
}
function Jf(e, t) {
  Ns("projects.renameTitle", "common.name", "projects.rename", (n) => {
    ze("rename project", async () => {
      const o = await Uy(e, n);
      je(b("projects.renamed", { oldName: t ?? e, newName: n })), C.project === e && (C.project = null), await hr(o.project);
    });
  });
}
function Zf(e, t) {
  const n = t ?? e, o = b("projects.deleteConfirm", { name: n });
  window.confirm(o) && ze("delete project", async () => {
    await Wy(e), C.project === e && Rx(), je(b("projects.deleted", { name: n })), await hr();
  });
}
T.renameProject.addEventListener("click", () => {
  const e = C.project;
  e && (zt.isOpen() && zt.close(), Jf(e, C.document?.name ?? null));
});
T.deleteProject.addEventListener("click", () => {
  const e = C.project;
  e && (zt.isOpen() && zt.close(), Zf(e, C.document?.name ?? null));
});
async function hr(e) {
  e && (T.search.value = "");
  const t = T.search.value.trim(), n = await hf(t);
  Qf(n, t), e && (C.project = e, Fi.setCurrentProject(e), await Xf()), await tp();
}
function Qf(e, t) {
  Ji = ep(e), Fi.setProjects(e, t, C.project);
}
const Nx = 1500;
let Ji = "";
function ep(e) {
  return e.map((t) => `${t.id}\0${t.name ?? ""}\0${t.layers}`).join(`
`);
}
let El = !0;
async function Pa() {
  if (El)
    try {
      const { count: e } = await tb();
      Zi(e);
    } catch (e) {
      e instanceof ot && e.code.startsWith("http4") && (El = !1, Zi(null));
    }
}
let Jt = null;
function Px(e) {
  return e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement || e instanceof HTMLElement && e.isContentEditable;
}
document.addEventListener("input", (e) => {
  e.target !== T.search && Px(e.target) && (Jt = e.target);
}, !0);
document.addEventListener("change", (e) => {
  e.target === Jt && (Jt = null);
}, !0);
document.addEventListener("focusout", (e) => {
  e.target === Jt && (Jt = null);
}, !0);
function Tx() {
  return Jt instanceof Node && !Jt.isConnected && (Jt = null), Jt !== null;
}
function Rl() {
  return document.visibilityState === "visible" && !C.busy && !C.drag && !C.editingText && !Tx() && !document.body.classList.contains("stopped");
}
let Qs = !1;
async function Ax() {
  if (!(Qs || !Rl())) {
    if (!ka()) {
      Pa();
      return;
    }
    Qs = !0;
    try {
      const e = T.search.value.trim(), t = await hf(e);
      if (!Rl()) return;
      Pa(), ep(t) !== Ji && document.activeElement !== document.getElementById("project-search") && (Qf(t, e), C.project || tp().catch(() => {
      }));
      const n = C.project, o = t.find((s) => s.id === n), r = C.document;
      if (!n || !o || !r || o.documentId !== r.id || o.version === Le(r)) return;
      ze("follow", async () => {
        C.project !== n || C.drag || C.editingText || await rt();
      });
    } catch {
    } finally {
      Qs = !1;
    }
  }
}
window.setInterval(() => {
  Ax();
}, Nx);
let ea = [], ta = 0;
async function tp() {
  const e = ++ta;
  for (const o of ea) URL.revokeObjectURL(o);
  ea = [];
  const t = await Fy(8);
  if (e !== ta) return;
  const n = await Promise.all(t.map(async (o) => {
    try {
      return { project: o, thumbnail: await uo(Vy(o.id)) };
    } catch {
      return { project: o, thumbnail: null };
    }
  }));
  if (e !== ta) {
    for (const { thumbnail: o } of n) o && URL.revokeObjectURL(o);
    return;
  }
  ea = n.flatMap(({ thumbnail: o }) => o ? [o] : []), xp(
    T.recents,
    n,
    (o) => Kf(o),
    (o, r) => Jf(o, r),
    (o, r) => Zf(o, r)
  );
}
T.shutdown.addEventListener("click", () => {
  window.confirm(b("projects.stopConfirm")) && ze("stop", async () => {
    await Zy(), T.shutdown.disabled = !0, document.body.classList.add("stopped"), je(b("app.stopped"));
  });
});
ze("start", async () => {
  const e = await Qy();
  T.shutdown.hidden = !e.canShutdown;
  try {
    await fo.reload();
  } catch {
  }
  await hr(), Pa(), Af(), je(b("status.ready", { version: e.version })), !Ji && !T.search.value.trim() && Pf.offerOnFirstRun();
});
