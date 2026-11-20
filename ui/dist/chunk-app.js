import { r as p, F as Sp, H as Cn, t as Ho, v as Wt, R as pn, M as Cp, J as jp, f as se, u as Z, w as Ka, y as ir, K as Xa, j as l, B as Q, N as ql, a as Me, c as ze, o as Ae, z as is, d as nn, b as cr, O as Kl, n as Tt, x as Uo, P as fo, l as Xl, E as kp, Q as Ep, V as Rp, W as Np, I as Tp, C as Pp, U as $n, X as En, g as at, h as _e, Y as Wr, Z as cs, _ as xo, e as Yl, $ as Ap, A as Fo, L as Ip, m as Ue, i as Fe, T as ee, S as ve, k as ue, G as Ne, a0 as Mp, a1 as Ya } from "./chunk-mantine-root.js";
import { m as Gl, i as Jl, c as Yt, u as Ve, O as Ga, a as Zl, g as So, b as Ql, S as Ja, s as Dp, d as Op, e as $p, p as Za, f as Lp, h as eu, j as zp, k as _p, l as tu, n as wc, o as Fp, q as Qa, r as Bp } from "./chunk-main.js";
import { a as Ze, u as Bt, C as ei, I as Rt, b as Vp, d as Hp, c as St, r as xc, T as Sc } from "./chunk-Title.js";
import { t as b, formatNumber as Ee, formatCount as Dt, getLocale as ti, setLocale as Up } from "./i18n.js";
function qr(e, t) {
  return (n) => {
    if (typeof n != "string" || n.trim().length === 0) throw new Error(t);
    return `${e}-${n}`;
  };
}
function Wo(e, t) {
  let n = e;
  for (; (n = n.parentElement) && !n.matches(t); ) ;
  return n;
}
function Cc(e, t, n) {
  for (let o = e - 1; o >= 0; o -= 1) if (!t[o].disabled) return o;
  if (n) {
    for (let o = t.length - 1; o > -1; o -= 1) if (!t[o].disabled) return o;
  }
  return e;
}
function jc(e, t, n) {
  for (let o = e + 1; o < t.length; o += 1) if (!t[o].disabled) return o;
  if (n) {
    for (let o = 0; o < t.length; o += 1) if (!t[o].disabled) return o;
  }
  return e;
}
function Wp(e, t, n) {
  return Wo(e, n) === Wo(t, n);
}
function nu({ parentSelector: e, siblingSelector: t, onKeyDown: n, loop: o = !0, activateOnFocus: r = !1, dir: s = "rtl", orientation: a }) {
  return (i) => {
    n?.(i);
    const c = Array.from(Wo(i.currentTarget, e)?.querySelectorAll(t) || []).filter((g) => Wp(i.currentTarget, g, e)), u = c.findIndex((g) => i.currentTarget === g), f = jc(u, c, o), h = Cc(u, c, o), d = s === "rtl" ? h : f, m = s === "rtl" ? f : h;
    switch (i.key) {
      case "ArrowRight":
        a === "horizontal" && (i.stopPropagation(), i.preventDefault(), c[d].focus(), r && c[d].click());
        break;
      case "ArrowLeft":
        a === "horizontal" && (i.stopPropagation(), i.preventDefault(), c[m].focus(), r && c[m].click());
        break;
      case "ArrowUp":
        a === "vertical" && (i.stopPropagation(), i.preventDefault(), c[h].focus(), r && c[h].click());
        break;
      case "ArrowDown":
        a === "vertical" && (i.stopPropagation(), i.preventDefault(), c[f].focus(), r && c[f].click());
        break;
      case "Home":
        i.stopPropagation(), i.preventDefault(), c[jc(-1, c, !1)]?.focus();
        break;
      case "End":
        i.stopPropagation(), i.preventDefault(), c[Cc(c.length, c, !1)]?.focus();
    }
  };
}
const Kr = () => {
};
function qp(e, t = { active: !0 }) {
  return typeof e != "function" || !t.active ? t.onKeyDown || Kr : (n) => {
    n.key === "Escape" && (e(n), t.onTrigger?.());
  };
}
function Yn(e, t) {
  return (n) => {
    e?.(n), t?.(n);
  };
}
function bn(e, t, n) {
  return t === void 0 && n === void 0 ? e : t !== void 0 && n === void 0 ? Math.max(e, t) : Math.min(t === void 0 && n !== void 0 ? e : Math.max(e, t), n);
}
function Kp(e, t) {
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
function ro(e) {
  const t = p.useRef(e);
  return p.useEffect(() => {
    t.current = e;
  }), p.useMemo(() => ((...n) => t.current?.(...n)), []);
}
function ls(e, t) {
  const { delay: n, flushOnUnmount: o, leading: r, maxWait: s } = typeof t == "number" ? {
    delay: t,
    flushOnUnmount: !1,
    leading: !1,
    maxWait: void 0
  } : t, a = ro(e), i = p.useRef(0), c = p.useRef(0), u = p.useRef(null), f = p.useMemo(() => {
    const h = Object.assign((...d) => {
      window.clearTimeout(i.current), u.current = d;
      const m = h._isFirstCall;
      h._isFirstCall = !1;
      function g() {
        window.clearTimeout(i.current), window.clearTimeout(c.current), i.current = 0, c.current = 0, h._isFirstCall = !0, h._hasPendingCallback = !1;
      }
      function v() {
        s !== void 0 && c.current === 0 && (c.current = window.setTimeout(() => {
          if (i.current !== 0) {
            const E = u.current;
            g(), a(...E);
          }
        }, s));
      }
      if (r && m) {
        a(...d);
        const E = () => {
          g();
        }, C = () => {
          i.current !== 0 && (g(), a(...d));
        }, k = () => {
          g();
        };
        h.flush = C, h.cancel = k, i.current = window.setTimeout(E, n), v();
        return;
      }
      if (r && !m) {
        h._hasPendingCallback = !0;
        const E = () => {
          i.current !== 0 && (g(), a(...d));
        }, C = () => {
          g();
        };
        h.flush = E, h.cancel = C;
        const k = () => {
          g();
        };
        i.current = window.setTimeout(k, n), v();
        return;
      }
      h._hasPendingCallback = !0;
      const w = () => {
        i.current !== 0 && (g(), a(...d));
      }, x = () => {
        g();
      };
      h.flush = w, h.cancel = x, i.current = window.setTimeout(w, n), v();
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
const Xp = ["mousedown", "touchstart"];
function ou(e, t, n, o = !0, r = !1) {
  const s = p.useRef(null), a = t || Xp, i = p.useEffectEvent((u) => {
    const { target: f } = u ?? {};
    if (!document.body.contains(f) && f?.tagName !== "HTML") return;
    const h = u.composedPath();
    Array.isArray(n) ? n.every((d) => !!d && !h.includes(d)) && e(u) : s.current && !h.includes(s.current) && e(u);
  }), c = a.join(",");
  return p.useEffect(() => {
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
function Yp(e, t) {
  return Sp("(prefers-color-scheme: dark)", e === "dark", t) ? "dark" : "light";
}
function ru({ opened: e, shouldReturnFocus: t = !0 }) {
  const n = p.useRef(null), o = () => {
    n.current && "focus" in n.current && typeof n.current.focus == "function" && n.current?.focus({ preventScroll: !0 });
  };
  return Cn(() => {
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
const Gp = /input|select|textarea|button|object/, su = "a, input, select, textarea, button, object, [tabindex]";
function Jp(e) {
  return e.style.display === "none";
}
function Zp(e) {
  if (e.getAttribute("aria-hidden") || e.getAttribute("hidden") || e.getAttribute("type") === "hidden") return !1;
  let t = e;
  for (; t && !(t === document.body || t.nodeType === 11); ) {
    if (Jp(t)) return !1;
    t = t.parentNode;
  }
  return !0;
}
function au(e) {
  let t = e.getAttribute("tabindex");
  return t === null && (t = void 0), parseInt(t, 10);
}
function ha(e) {
  const t = e.nodeName.toLowerCase(), n = !Number.isNaN(au(e));
  return (Gp.test(t) && !e.disabled || e instanceof HTMLAnchorElement && e.href || n) && Zp(e);
}
function iu(e) {
  const t = au(e);
  return (Number.isNaN(t) || t >= 0) && ha(e);
}
function Qp(e) {
  return Array.from(e.querySelectorAll(su)).filter(iu);
}
function eh(e, t) {
  const n = Qp(e);
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
function th(e = !0) {
  const t = p.useRef(null), n = (r) => {
    let s = r.querySelector("[data-autofocus]");
    if (!s) {
      const a = Array.from(r.querySelectorAll(su));
      s = a.find(iu) || a.find(ha) || null, !s && ha(r) && (s = r);
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
      s.key === "Tab" && t.current && eh(t.current, s);
    };
    return document.addEventListener("keydown", r), () => document.removeEventListener("keydown", r);
  }, [e]), o;
}
const nh = (e) => (e + 1) % 1e6;
function oh() {
  const [, e] = p.useReducer(nh, 0);
  return e;
}
function rh(e, t, n) {
  const o = p.useEffectEvent(t);
  p.useEffect(() => (window.addEventListener(e, o, n), () => window.removeEventListener(e, o, n)), [e]);
}
function cu(e) {
  return {
    x: bn(e.x, 0, 1),
    y: bn(e.y, 0, 1)
  };
}
function lu(e, t, n = "ltr") {
  const o = p.useRef(!1), r = p.useRef(!1), s = p.useRef(0), a = p.useRef(null), [i, c] = p.useState(!1);
  return p.useEffect(() => (o.current = !0, () => {
    a.current?.();
  }), []), {
    ref: p.useCallback((u) => {
      const f = ({ x: C, y: k }) => {
        cancelAnimationFrame(s.current), s.current = requestAnimationFrame(() => {
          if (o.current && u) {
            u.style.userSelect = "none";
            const R = u.getBoundingClientRect();
            if (R.width && R.height) {
              const P = bn((C - R.left) / R.width, 0, 1);
              e({
                x: n === "ltr" ? P : 1 - P,
                y: bn((k - R.top) / R.height, 0, 1)
              });
            }
          }
        });
      }, h = () => {
        document.addEventListener("mousemove", w), document.addEventListener("mouseup", g), document.addEventListener("touchmove", E, { passive: !1 }), document.addEventListener("touchend", g);
      }, d = () => {
        document.removeEventListener("mousemove", w), document.removeEventListener("mouseup", g), document.removeEventListener("touchmove", E), document.removeEventListener("touchend", g);
      }, m = () => {
        !r.current && o.current && (r.current = !0, typeof t?.onScrubStart == "function" && t.onScrubStart(), c(!0), h());
      }, g = () => {
        r.current && o.current && (r.current = !1, c(!1), d(), setTimeout(() => {
          typeof t?.onScrubEnd == "function" && t.onScrubEnd();
        }, 0));
      }, v = (C) => {
        m(), C.preventDefault(), w(C);
      }, w = (C) => f({
        x: C.clientX,
        y: C.clientY
      }), x = (C) => {
        C.cancelable && C.preventDefault(), m(), E(C);
      }, E = (C) => {
        C.cancelable && C.preventDefault(), f({
          x: C.changedTouches[0].clientX,
          y: C.changedTouches[0].clientY
        });
      };
      return u?.addEventListener("mousedown", v), u?.addEventListener("touchstart", x, { passive: !1 }), a.current = () => {
        d(), cancelAnimationFrame(s.current);
      }, () => {
        u && (u.removeEventListener("mousedown", v), u.removeEventListener("touchstart", x));
      };
    }, [n, e]),
    active: i
  };
}
function sh(e, t) {
  if (!e || !t) return !1;
  if (e === t) return !0;
  if (e.length !== t.length) return !1;
  for (let n = 0; n < e.length; n += 1) if (!Kp(e[n], t[n])) return !1;
  return !0;
}
function ah(e) {
  const t = p.useRef([]), n = p.useRef(0);
  return sh(t.current, e) || (t.current = e, n.current += 1), [n.current];
}
function kc(e, t) {
  p.useEffect(e, ah(t));
}
function ih(e, t, n = { autoInvoke: !1 }) {
  const o = p.useRef(null), r = ro(e), s = p.useCallback((...i) => {
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
function ch(e) {
  const t = p.useRef(void 0);
  return p.useEffect(() => {
    t.current = e;
  }, [e]), t.current;
}
function lh() {
  const [e, t] = p.useState(!1);
  return Ho(() => {
    t(typeof window < "u" && !uh() && "EyeDropper" in window);
  }, []), {
    supported: e,
    open: p.useCallback((n = {}) => e ? new window.EyeDropper().open(n) : Promise.resolve(void 0), [e])
  };
}
function uh() {
  return navigator.userAgent.includes("OPR");
}
function dh(e, t, n) {
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
function fh() {
  const [e, t] = p.useState(!1);
  return p.useEffect(() => t(!0), []), e;
}
const ph = ["mouse", "touch"], hh = 10;
function mh(e, t = {}) {
  const { threshold: n = 400, events: o = ph, cancelOnMove: r = !1, onStart: s, onFinish: a, onCancel: i } = t, c = p.useRef(!1), u = p.useRef(!1), f = p.useRef(-1), h = p.useRef(null);
  p.useEffect(() => () => window.clearTimeout(f.current), []);
  const d = o.join(",");
  return p.useMemo(() => {
    if (typeof e != "function") return {};
    const m = r !== !1, g = r === !0 ? hh : r === !1 ? 0 : r, v = (C) => {
      !Rc(C) && !ma(C) || (s && s(C), h.current = Ec(C), u.current = !0, f.current = window.setTimeout(() => {
        e(C), c.current = !0;
      }, n));
    }, w = (C) => {
      !Rc(C) && !ma(C) || (c.current ? a && a(C) : u.current && i && i(C), c.current = !1, u.current = !1, h.current = null, f.current !== -1 && (window.clearTimeout(f.current), f.current = -1));
    }, x = (C) => {
      if (!m || !u.current || c.current) return;
      const k = Ec(C);
      if (!k || !h.current) return;
      const R = k.x - h.current.x, P = k.y - h.current.y;
      Math.sqrt(R * R + P * P) > g && w(C);
    }, E = {};
    return o.includes("mouse") && (E.onMouseDown = v, E.onMouseUp = w, E.onMouseLeave = w, m && (E.onMouseMove = x)), o.includes("touch") && (E.onTouchStart = v, E.onTouchEnd = w, E.onTouchCancel = w, m && (E.onTouchMove = x)), E;
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
function Ec(e) {
  if (ma(e)) {
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
function ma(e) {
  return window.TouchEvent ? e.nativeEvent instanceof TouchEvent : "touches" in e.nativeEvent;
}
function Rc(e) {
  return e.nativeEvent instanceof MouseEvent;
}
function gh(e) {
  if (!e || typeof e == "string") return 0;
  const t = e / 36;
  return Math.round((4 + 15 * t ** 0.25 + t / 5) * 10);
}
function Ws(e) {
  return e.current ? e.current.scrollHeight : "auto";
}
function Xr(e) {
  return typeof e == "number" && e > 0;
}
function vh({ transitionDuration: e, transitionTimingFunction: t = "ease", onTransitionEnd: n, onTransitionStart: o, expanded: r, keepMounted: s }) {
  const a = {
    height: 0,
    overflow: "hidden",
    ...s ? {} : { display: "none" }
  }, i = p.useEffectEvent(() => o?.()), c = p.useEffectEvent(() => n?.()), u = p.useRef(null), [f, h] = p.useState(r ? {} : a), [d, m] = p.useState(r ? "entered" : "exited"), g = (C) => {
    Wt.flushSync(() => h(C));
  }, v = (C) => {
    g((k) => ({
      ...k,
      ...C
    }));
  }, w = (C) => {
    const k = e ?? gh(C);
    return { transition: `height ${k}ms ${t}, opacity ${k}ms ${t}` };
  }, x = p.useRef(0);
  Cn(() => {
    x.current += 1;
    const C = x.current, k = () => x.current === C;
    e !== 0 && i(), r ? window.requestAnimationFrame(() => {
      !k() || !u.current || (Wt.flushSync(() => m("entering")), v({
        willChange: "height",
        display: "block",
        overflow: "hidden"
      }), window.requestAnimationFrame(() => {
        if (!k() || !u.current) return;
        const R = Ws(u);
        if (!Xr(R)) {
          g({}), m("entered"), c();
          return;
        }
        v({
          ...w(R),
          height: R
        });
      }));
    }) : window.requestAnimationFrame(() => {
      if (!k() || !u.current) return;
      Wt.flushSync(() => m("exiting"));
      const R = Ws(u);
      if (!Xr(R)) {
        g(a), m("exited"), c();
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
  const E = (C) => {
    if (!(C.target !== u.current || C.propertyName !== "height"))
      if (r) {
        const k = Ws(u);
        k === f.height ? g({}) : v({ height: k }), m("entered"), c();
      } else f.height === 0 && (g(a), m("exited"), c());
  };
  return {
    state: d,
    getCollapseProps: (C) => ({
      "aria-hidden": !r,
      inert: !r,
      ref: Gl(u, C?.ref),
      onTransitionEnd: E,
      style: {
        boxSizing: "border-box",
        ...C?.style,
        ...f
      }
    })
  };
}
function yh(e) {
  if (!e || typeof e == "string") return 0;
  const t = e / 36;
  return Math.round((4 + 15 * t ** 0.25 + t / 5) * 10);
}
function qs(e) {
  return e.current ? e.current.scrollWidth : "auto";
}
function bh({ transitionDuration: e, transitionTimingFunction: t = "ease", onTransitionEnd: n, onTransitionStart: o, expanded: r, keepMounted: s }) {
  const a = {
    width: 0,
    overflow: "hidden",
    ...s ? {} : { display: "none" }
  }, i = p.useEffectEvent(() => o?.()), c = p.useEffectEvent(() => n?.()), u = p.useRef(null), [f, h] = p.useState(r ? {} : a), [d, m] = p.useState(r ? "entered" : "exited"), g = (C) => {
    Wt.flushSync(() => h(C));
  }, v = (C) => {
    g((k) => ({
      ...k,
      ...C
    }));
  }, w = (C) => {
    const k = e ?? yh(C);
    return { transition: `width ${k}ms ${t}, opacity ${k}ms ${t}` };
  }, x = p.useRef(0);
  Cn(() => {
    x.current += 1;
    const C = x.current, k = () => x.current === C;
    e !== 0 && i(), r ? window.requestAnimationFrame(() => {
      !k() || !u.current || (Wt.flushSync(() => m("entering")), v({
        willChange: "width",
        display: "block",
        overflow: "hidden"
      }), window.requestAnimationFrame(() => {
        if (!k() || !u.current) return;
        const R = qs(u);
        if (!Xr(R)) {
          g({}), m("entered"), c();
          return;
        }
        v({
          ...w(R),
          width: R
        });
      }));
    }) : window.requestAnimationFrame(() => {
      if (!k() || !u.current) return;
      Wt.flushSync(() => m("exiting"));
      const R = qs(u);
      if (!Xr(R)) {
        g(a), m("exited"), c();
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
  const E = (C) => {
    if (!(C.target !== u.current || C.propertyName !== "width"))
      if (r) {
        const k = qs(u);
        k === f.width ? g({}) : v({ width: k }), m("entered"), c();
      } else f.width === 0 && (g(a), m("exited"), c());
  };
  return {
    state: d,
    getCollapseProps: (C) => ({
      "aria-hidden": !r,
      inert: !r,
      ref: Gl(u, C?.ref),
      onTransitionEnd: E,
      style: {
        boxSizing: "border-box",
        ...C?.style,
        ...f
      }
    })
  };
}
function uu() {
  return typeof process < "u" && process.env, "development";
}
function du(e) {
  const t = /* @__PURE__ */ new Map();
  return (...n) => {
    const o = JSON.stringify(n);
    if (t.has(o)) return t.get(o);
    const r = e(...n);
    return t.set(o, r), r;
  };
}
function fu(e) {
  const t = pn.version;
  return typeof pn.version != "string" || t.startsWith("18.") ? e?.ref : e?.props?.ref;
}
function wh(e) {
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
function Jt(e, t = document) {
  const n = [], o = t.querySelectorAll(e);
  n.push(...Array.from(o));
  const r = t.querySelectorAll("*");
  for (let s = 0; s < r.length; s += 1) {
    const a = r[s];
    if (a.shadowRoot) {
      const i = Jt(e, a.shadowRoot);
      n.push(...i);
    }
  }
  return n;
}
function Ht(e) {
  if (!e) return document;
  const t = e.getRootNode();
  return t instanceof ShadowRoot || t instanceof Document ? t : document;
}
function lr(e) {
  const t = p.Children.toArray(e);
  return t.length !== 1 || !Jl(t[0]) ? null : t[0];
}
function ur(e, t) {
  return typeof e == "boolean" ? e : t.autoContrast;
}
function Nc(e) {
  const t = document.createElement("style");
  return t.setAttribute("data-mantine-styles", "inline"), t.innerHTML = "*, *::before, *::after {transition: none !important;}", t.setAttribute("data-mantine-disable-transition", "true"), e && t.setAttribute("nonce", e), document.head.appendChild(t), () => document.querySelectorAll("[data-mantine-disable-transition]").forEach((o) => o.remove());
}
function xh({ keepTransitions: e } = {}) {
  const t = p.useRef(Kr), n = p.useRef(-1), o = p.use(Cp), r = jp(), s = p.useRef(r?.());
  if (!o) throw new Error("[@mantine/core] MantineProvider was not found in tree");
  const a = (h) => {
    o.setColorScheme(h), t.current = e ? () => {
    } : Nc(s.current), window.clearTimeout(n.current), n.current = window.setTimeout(() => {
      t.current?.();
    }, 10);
  }, i = () => {
    o.clearColorScheme(), t.current = e ? () => {
    } : Nc(s.current), window.clearTimeout(n.current), n.current = window.setTimeout(() => {
      t.current?.();
    }, 10);
  }, c = Yp("light", { getInitialValueInEffect: !1 }), u = o.colorScheme === "auto" ? c : o.colorScheme, f = p.useCallback(() => a(u === "light" ? "dark" : "light"), [a, u]);
  return p.useEffect(() => () => {
    t.current?.(), window.clearTimeout(n.current);
  }, []), {
    colorScheme: o.colorScheme,
    setColorScheme: a,
    clearColorScheme: i,
    toggleColorScheme: f
  };
}
function ga(e, t) {
  return Array.isArray(e) ? [...e].reduce((n, o) => ({
    ...n,
    ...ga(o, t)
  }), {}) : typeof e == "function" ? e(t) : e ?? {};
}
const Sh = p.createContext({
  dir: "ltr",
  toggleDirection: () => {
  },
  setDirection: () => {
  }
});
function Co() {
  return p.use(Sh);
}
const Ch = {
  transitionDuration: 200,
  transitionTimingFunction: "ease",
  animateOpacity: !0,
  orientation: "vertical",
  keepMounted: !0,
  keepMountedMode: "activity"
}, pu = se((e) => {
  const { children: t, expanded: n, transitionDuration: o, transitionTimingFunction: r, style: s, onTransitionEnd: a, onTransitionStart: i, animateOpacity: c, keepMounted: u, keepMountedMode: f, ref: h, orientation: d, ...m } = Z("Collapse", Ch, e), g = Ka(), v = ir(), w = Xa(), x = v.respectReducedMotion && w ? 0 : o, E = (d === "horizontal" ? bh : vh)({
    expanded: n,
    transitionDuration: x,
    transitionTimingFunction: r,
    onTransitionEnd: a,
    onTransitionStart: i,
    keepMounted: !1
  });
  if (x === 0)
    return u === !0 && (f === "display-none" || g !== "test") ? f === "display-none" ? /* @__PURE__ */ l.jsx(Q, {
      ...m,
      style: {
        ...ga(s, v),
        ...n ? {} : { display: "none" }
      },
      ref: h,
      children: t
    }) : /* @__PURE__ */ l.jsx(p.Activity, {
      mode: n ? "visible" : "hidden",
      children: /* @__PURE__ */ l.jsx(Q, {
        ...m,
        style: s,
        ref: h,
        children: t
      })
    }) : n ? /* @__PURE__ */ l.jsx(Q, {
      ...m,
      style: s,
      ref: h,
      children: t
    }) : null;
  const C = E.state === "exited";
  let k;
  return u === !1 ? k = C ? null : t : u === !0 ? k = f === "display-none" ? t : /* @__PURE__ */ l.jsx(p.Activity, {
    mode: C ? "hidden" : "visible",
    children: t
  }) : k = t, /* @__PURE__ */ l.jsx(Q, {
    ...m,
    ...E.getCollapseProps({
      style: {
        opacity: n || !c ? 1 : 0,
        transition: c ? `opacity ${x}ms ${r}` : "none",
        ...ga(s, v),
        ...u && f === "display-none" && C ? { display: "none" } : {}
      },
      ref: h
    }),
    children: k
  });
});
pu.displayName = "@mantine/core/Collapse";
const [jh, Pt] = Yt("ScrollArea.Root component was not found in tree");
function jn(e, t) {
  const n = p.useEffectEvent(t);
  Ho(() => {
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
function kh(e) {
  const { style: t, ...n } = e, o = Pt(), [r, s] = p.useState(0), [a, i] = p.useState(0), c = !!(r && a);
  return jn(o.scrollbarX, () => {
    const u = o.scrollbarX?.offsetHeight || 0;
    o.onCornerHeightChange(u), i(u);
  }), jn(o.scrollbarY, () => {
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
function Eh(e) {
  const t = Pt(), n = !!(t.scrollbarX && t.scrollbarY);
  return t.type !== "scroll" && n ? /* @__PURE__ */ l.jsx(kh, { ...e }) : null;
}
const Rh = {
  scrollHideDelay: 1e3,
  type: "hover"
};
function hu(e) {
  const { type: t, scrollHideDelay: n, scrollbars: o, getStyles: r, ref: s, ...a } = Z("ScrollAreaRoot", Rh, e), [i, c] = p.useState(null), [u, f] = p.useState(null), [h, d] = p.useState(null), [m, g] = p.useState(null), [v, w] = p.useState(null), [x, E] = p.useState(0), [C, k] = p.useState(0), [R, P] = p.useState(!1), [S, y] = p.useState(!1), N = Ve(s, c);
  return /* @__PURE__ */ l.jsx(jh, {
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
        "--sa-corner-height": o !== "xy" ? "0px" : `${C}px`
      }
    })
  });
}
hu.displayName = "@mantine/core/ScrollAreaRoot";
function mu(e, t) {
  const n = e / t;
  return Number.isNaN(n) ? 0 : n;
}
function us(e) {
  const t = mu(e.viewport, e.content), n = e.scrollbar.paddingStart + e.scrollbar.paddingEnd, o = (e.scrollbar.size - n) * t;
  return Math.max(o, 18);
}
function gu(e, t) {
  return (n) => {
    if (e[0] === e[1] || t[0] === t[1]) return t[0];
    const o = (t[1] - t[0]) / (e[1] - e[0]);
    return t[0] + o * (n - e[0]);
  };
}
function Nh(e, [t, n]) {
  return Math.min(n, Math.max(t, e));
}
function Tc(e, t, n = "ltr") {
  const o = us(t), r = t.scrollbar.paddingStart + t.scrollbar.paddingEnd, s = t.scrollbar.size - r, a = t.content - t.viewport, i = s - o, c = Nh(e, n === "ltr" ? [0, a] : [a * -1, 0]);
  return gu([0, a], [0, i])(c);
}
function Th(e, t, n, o = "ltr") {
  const r = us(n), s = r / 2, a = t || s, i = r - a, c = n.scrollbar.paddingStart + a, u = n.scrollbar.size - n.scrollbar.paddingEnd - i, f = n.content - n.viewport, h = o === "ltr" ? [0, f] : [f * -1, 0];
  return gu([c, u], h)(e);
}
function vu(e, t) {
  return e > 0 && e < t;
}
function mn(e) {
  return e ? parseInt(e, 10) : 0;
}
function Dn(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
  return (o) => {
    e?.(o), (n === !1 || !o.defaultPrevented) && t?.(o);
  };
}
const [Ph, yu] = Yt("ScrollAreaScrollbar was not found in tree");
function bu(e) {
  const { sizes: t, hasThumb: n, onThumbChange: o, onThumbPointerUp: r, onThumbPointerDown: s, onThumbPositionChange: a, onDragScroll: i, onWheelScroll: c, onResize: u, ref: f, ...h } = e, d = Pt(), [m, g] = p.useState(null), v = Ve(f, g), w = p.useRef(null), x = p.useRef(""), { viewport: E } = d, C = t.content - t.viewport, k = p.useEffectEvent(c), R = ro(a), P = ls(u, 10), S = (y) => {
    if (w.current) {
      const N = y.clientX - w.current.left, D = y.clientY - w.current.top;
      i({
        x: N,
        y: D
      });
    }
  };
  return p.useEffect(() => {
    const y = (N) => {
      const D = N.target;
      m?.contains(D) && k(N, C);
    };
    return document.addEventListener("wheel", y, { passive: !1 }), () => document.removeEventListener("wheel", y, { passive: !1 });
  }, [
    E,
    m,
    C
  ]), p.useEffect(R, [t, R]), jn(m, P), jn(d.content, P), /* @__PURE__ */ l.jsx(Ph, {
    value: {
      scrollbar: m,
      hasThumb: n,
      onThumbChange: ro(o),
      onThumbPointerUp: ro(r),
      onThumbPositionChange: R,
      onThumbPointerDown: ro(s)
    },
    children: /* @__PURE__ */ l.jsx("div", {
      ...h,
      ref: v,
      "data-mantine-scrollbar": !0,
      style: {
        position: "absolute",
        ...h.style
      },
      onPointerDown: Dn(e.onPointerDown, (y) => {
        y.preventDefault(), y.button === 0 && (y.target.setPointerCapture(y.pointerId), w.current = m.getBoundingClientRect(), x.current = document.body.style.webkitUserSelect, document.body.style.webkitUserSelect = "none", S(y));
      }),
      onPointerMove: Dn(e.onPointerMove, S),
      onPointerUp: Dn(e.onPointerUp, (y) => {
        const N = y.target;
        N.hasPointerCapture(y.pointerId) && (y.preventDefault(), N.releasePointerCapture(y.pointerId));
      }),
      onLostPointerCapture: () => {
        document.body.style.webkitUserSelect = x.current, w.current = null;
      }
    })
  });
}
const wu = (e) => {
  const { sizes: t, onSizesChange: n, style: o, ref: r, ...s } = e, a = Pt(), [i, c] = p.useState(), u = p.useRef(null), f = Ve(r, u, a.onScrollbarXChange);
  return p.useEffect(() => {
    u.current && c(getComputedStyle(u.current));
  }, [u]), /* @__PURE__ */ l.jsx(bu, {
    "data-orientation": "horizontal",
    ...s,
    ref: f,
    sizes: t,
    style: {
      ...o,
      "--sa-thumb-width": `${us(t)}px`
    },
    onThumbPointerDown: (h) => e.onThumbPointerDown(h.x),
    onDragScroll: (h) => e.onDragScroll(h.x),
    onWheelScroll: (h, d) => {
      if (a.viewport) {
        const m = a.viewport.scrollLeft + h.deltaX;
        e.onWheelScroll(m), vu(m, d) && h.preventDefault();
      }
    },
    onResize: () => {
      u.current && a.viewport && i && n({
        content: a.viewport.scrollWidth,
        viewport: a.viewport.offsetWidth,
        scrollbar: {
          size: u.current.clientWidth,
          paddingStart: mn(i.paddingLeft),
          paddingEnd: mn(i.paddingRight)
        }
      });
    }
  });
};
wu.displayName = "@mantine/core/ScrollAreaScrollbarX";
function xu(e) {
  const { sizes: t, onSizesChange: n, style: o, ref: r, ...s } = e, a = Pt(), [i, c] = p.useState(), u = p.useRef(null), f = Ve(r, u, a.onScrollbarYChange);
  return p.useEffect(() => {
    u.current && c(window.getComputedStyle(u.current));
  }, []), /* @__PURE__ */ l.jsx(bu, {
    ...s,
    "data-orientation": "vertical",
    ref: f,
    sizes: t,
    style: {
      "--sa-thumb-height": `${us(t)}px`,
      ...o
    },
    onThumbPointerDown: (h) => e.onThumbPointerDown(h.y),
    onDragScroll: (h) => e.onDragScroll(h.y),
    onWheelScroll: (h, d) => {
      if (a.viewport) {
        const m = a.viewport.scrollTop + h.deltaY;
        e.onWheelScroll(m), vu(m, d) && h.preventDefault();
      }
    },
    onResize: () => {
      u.current && a.viewport && i && n({
        content: a.viewport.scrollHeight,
        viewport: a.viewport.offsetHeight,
        scrollbar: {
          size: u.current.clientHeight,
          paddingStart: mn(i.paddingTop),
          paddingEnd: mn(i.paddingBottom)
        }
      });
    }
  });
}
xu.displayName = "@mantine/core/ScrollAreaScrollbarY";
function ds(e) {
  const { orientation: t = "vertical", ...n } = e, { dir: o } = Co(), r = Pt(), s = p.useRef(null), a = p.useRef(0), [i, c] = p.useState({
    content: 0,
    viewport: 0,
    scrollbar: {
      size: 0,
      paddingStart: 0,
      paddingEnd: 0
    }
  }), u = mu(i.viewport, i.content), f = {
    ...n,
    sizes: i,
    onSizesChange: c,
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
  }, h = (d, m) => Th(d, a.current, i, m);
  return t === "horizontal" ? /* @__PURE__ */ l.jsx(wu, {
    ...f,
    onThumbPositionChange: () => {
      if (r.viewport && s.current) {
        const d = r.viewport.scrollLeft, m = Tc(d, i, o);
        s.current.style.transform = `translate3d(${m}px, 0, 0)`;
      }
    },
    onWheelScroll: (d) => {
      r.viewport && (r.viewport.scrollLeft = d);
    },
    onDragScroll: (d) => {
      r.viewport && (r.viewport.scrollLeft = h(d, o));
    }
  }) : t === "vertical" ? /* @__PURE__ */ l.jsx(xu, {
    ...f,
    onThumbPositionChange: () => {
      if (r.viewport && s.current) {
        const d = r.viewport.scrollTop, m = Tc(d, i);
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
ds.displayName = "@mantine/core/ScrollAreaScrollbarVisible";
function ni(e) {
  const t = Pt(), { forceMount: n, ...o } = e, [r, s] = p.useState(!1), a = e.orientation === "horizontal", i = ls(() => {
    if (t.viewport) {
      const c = t.viewport.offsetWidth < t.viewport.scrollWidth, u = t.viewport.offsetHeight < t.viewport.scrollHeight;
      s(a ? c : u);
    }
  }, 10);
  return jn(t.viewport, i), jn(t.content, i), n || r ? /* @__PURE__ */ l.jsx(ds, {
    "data-state": r ? "visible" : "hidden",
    ...o
  }) : null;
}
ni.displayName = "@mantine/core/ScrollAreaScrollbarAuto";
function Su(e) {
  const { forceMount: t, ...n } = e, o = Pt(), [r, s] = p.useState(!1);
  return p.useEffect(() => {
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
  }, [o.scrollArea, o.scrollHideDelay]), t || r ? /* @__PURE__ */ l.jsx(ni, {
    "data-state": r ? "visible" : "hidden",
    ...n
  }) : null;
}
Su.displayName = "@mantine/core/ScrollAreaScrollbarHover";
function Ah(e) {
  const { forceMount: t, ...n } = e, o = Pt(), r = e.orientation === "horizontal", [s, a] = p.useState("hidden"), i = ls(() => a("idle"), 100);
  return p.useEffect(() => {
    if (s === "idle") {
      const c = window.setTimeout(() => a("hidden"), o.scrollHideDelay);
      return () => window.clearTimeout(c);
    }
  }, [s, o.scrollHideDelay]), p.useEffect(() => {
    const { viewport: c } = o, u = r ? "scrollLeft" : "scrollTop";
    if (c) {
      let f = c[u];
      const h = () => {
        const d = c[u];
        f !== d && (a("scrolling"), i()), f = d;
      };
      return c.addEventListener("scroll", h), () => c.removeEventListener("scroll", h);
    }
  }, [
    o.viewport,
    r,
    i
  ]), t || s !== "hidden" ? /* @__PURE__ */ l.jsx(ds, {
    "data-state": s === "hidden" ? "hidden" : "visible",
    ...n,
    onPointerEnter: Dn(e.onPointerEnter, () => a("interacting")),
    onPointerLeave: Dn(e.onPointerLeave, () => a("idle"))
  }) : null;
}
function va(e) {
  const { forceMount: t, ...n } = e, o = Pt(), { onScrollbarXEnabledChange: r, onScrollbarYEnabledChange: s } = o, a = e.orientation === "horizontal";
  return p.useEffect(() => (a ? r(!0) : s(!0), () => {
    a ? r(!1) : s(!1);
  }), [
    a,
    r,
    s
  ]), o.type === "hover" ? /* @__PURE__ */ l.jsx(Su, {
    ...n,
    forceMount: t
  }) : o.type === "scroll" ? /* @__PURE__ */ l.jsx(Ah, {
    ...n,
    forceMount: t
  }) : o.type === "auto" ? /* @__PURE__ */ l.jsx(ni, {
    ...n,
    forceMount: t
  }) : o.type === "always" ? /* @__PURE__ */ l.jsx(ds, { ...n }) : null;
}
va.displayName = "@mantine/core/ScrollAreaScrollbar";
function Ih(e, t = () => {
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
function Cu(e) {
  const { style: t, ref: n, ...o } = e, r = Pt(), s = yu(), { onThumbPositionChange: a } = s, i = Ve(n, s.onThumbChange), c = p.useRef(void 0), u = ls(() => {
    c.current && (c.current(), c.current = void 0);
  }, 100);
  return p.useEffect(() => {
    const { viewport: f } = r;
    if (f) {
      const h = () => {
        if (u(), !c.current) {
          const d = Ih(f, a);
          c.current = d, a();
        }
      };
      return a(), f.addEventListener("scroll", h), () => f.removeEventListener("scroll", h);
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
    onPointerDownCapture: Dn(e.onPointerDownCapture, (f) => {
      const h = f.target.getBoundingClientRect(), d = f.clientX - h.left, m = f.clientY - h.top;
      s.onThumbPointerDown({
        x: d,
        y: m
      });
    }),
    onPointerUp: Dn(e.onPointerUp, s.onThumbPointerUp)
  });
}
Cu.displayName = "@mantine/core/ScrollAreaThumb";
function ya(e) {
  const { forceMount: t, ...n } = e, o = yu();
  return t || o.hasThumb ? /* @__PURE__ */ l.jsx(Cu, { ...n }) : null;
}
ya.displayName = "@mantine/core/ScrollAreaThumb";
function ju({ children: e, style: t, ref: n, onWheel: o, ...r }) {
  const s = Pt(), a = Ve(n, s.onViewportChange), i = (c) => {
    if (o?.(c), s.scrollbarXEnabled && s.viewport && c.shiftKey) {
      const { scrollTop: u, scrollHeight: f, clientHeight: h, scrollWidth: d, clientWidth: m } = s.viewport, g = u < 1, v = u >= f - h - 1;
      d > m && (g || v) && c.stopPropagation();
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
ju.displayName = "@mantine/core/ScrollAreaViewport";
var oi = {
  root: "m_d57069b5",
  content: "m_b1336c6",
  viewport: "m_c0783ff9",
  viewportInner: "m_f8f631dd",
  scrollbar: "m_c44ba933",
  thumb: "m_d8b5e363",
  corner: "m_21657268"
};
function fs() {
  return typeof window < "u";
}
function jo(e) {
  return ku(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function gt(e) {
  var t;
  return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function sn(e) {
  var t;
  return (t = (ku(e) ? e.ownerDocument : e.document) || window.document) == null ? void 0 : t.documentElement;
}
function ku(e) {
  return fs() ? e instanceof Node || e instanceof gt(e).Node : !1;
}
function mt(e) {
  return fs() ? e instanceof Element || e instanceof gt(e).Element : !1;
}
function Rn(e) {
  return fs() ? e instanceof HTMLElement || e instanceof gt(e).HTMLElement : !1;
}
function Pc(e) {
  return !fs() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof gt(e).ShadowRoot;
}
function ps(e) {
  const {
    overflow: t,
    overflowX: n,
    overflowY: o,
    display: r
  } = qt(e);
  return /auto|scroll|overlay|hidden|clip/.test(t + o + n) && r !== "inline" && r !== "contents";
}
function Mh(e) {
  return /^(table|td|th)$/.test(jo(e));
}
function hs(e) {
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
const Dh = /transform|translate|scale|rotate|perspective|filter/, Oh = /paint|layout|strict|content/, Pn = (e) => !!e && e !== "none";
let Ks;
function ri(e) {
  const t = mt(e) ? qt(e) : e;
  return Pn(t.transform) || Pn(t.translate) || Pn(t.scale) || Pn(t.rotate) || Pn(t.perspective) || !si() && (Pn(t.backdropFilter) || Pn(t.filter)) || Dh.test(t.willChange || "") || Oh.test(t.contain || "");
}
function $h(e) {
  let t = Ln(e);
  for (; Rn(t) && !qo(t); ) {
    if (ri(t))
      return t;
    if (hs(t))
      return null;
    t = Ln(t);
  }
  return null;
}
function si() {
  return Ks == null && (Ks = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), Ks;
}
function qo(e) {
  return /^(html|body|#document)$/.test(jo(e));
}
function qt(e) {
  return gt(e).getComputedStyle(e);
}
function ms(e) {
  return mt(e) ? {
    scrollLeft: e.scrollLeft,
    scrollTop: e.scrollTop
  } : {
    scrollLeft: e.scrollX,
    scrollTop: e.scrollY
  };
}
function Ln(e) {
  if (jo(e) === "html")
    return e;
  const t = (
    // Step into the shadow DOM of the parent of a slotted node.
    e.assignedSlot || // DOM Element detected.
    e.parentNode || // ShadowRoot detected.
    Pc(e) && e.host || // Fallback.
    sn(e)
  );
  return Pc(t) ? t.host : t;
}
function Eu(e) {
  const t = Ln(e);
  return qo(t) ? (e.ownerDocument || e).body : Rn(t) && ps(t) ? t : Eu(t);
}
function Ko(e, t, n) {
  var o;
  t === void 0 && (t = []), n === void 0 && (n = !0);
  const r = Eu(e), s = r === ((o = e.ownerDocument) == null ? void 0 : o.body), a = gt(r);
  if (s) {
    const i = ba(a);
    return t.concat(a, a.visualViewport || [], ps(r) ? r : [], i && n ? Ko(i) : []);
  } else
    return t.concat(r, Ko(r, [], n));
}
function ba(e) {
  return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
const Lh = ["top", "right", "bottom", "left"], _t = Math.min, kt = Math.max, Yr = Math.round, Tr = Math.floor, en = (e) => ({
  x: e,
  y: e
}), zh = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
function Ru(e, t, n) {
  return kt(e, _t(t, n));
}
function Kt(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function Xt(e) {
  return e.split("-")[0];
}
function ko(e) {
  return e.split("-")[1];
}
function ai(e) {
  return e === "x" ? "y" : "x";
}
function ii(e) {
  return e === "y" ? "height" : "width";
}
function Ot(e) {
  const t = e[0];
  return t === "t" || t === "b" ? "y" : "x";
}
function ci(e) {
  return ai(Ot(e));
}
function _h(e, t, n) {
  n === void 0 && (n = !1);
  const o = ko(e), r = ci(e), s = ii(r);
  let a = r === "x" ? o === (n ? "end" : "start") ? "right" : "left" : o === "start" ? "bottom" : "top";
  return t.reference[s] > t.floating[s] && (a = Gr(a)), [a, Gr(a)];
}
function Fh(e) {
  const t = Gr(e);
  return [wa(e), t, wa(t)];
}
function wa(e) {
  return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
const Ac = ["left", "right"], Ic = ["right", "left"], Bh = ["top", "bottom"], Vh = ["bottom", "top"];
function Hh(e, t, n) {
  switch (e) {
    case "top":
    case "bottom":
      return n ? t ? Ic : Ac : t ? Ac : Ic;
    case "left":
    case "right":
      return t ? Bh : Vh;
    default:
      return [];
  }
}
function Uh(e, t, n, o) {
  const r = ko(e);
  let s = Hh(Xt(e), n === "start", o);
  return r && (s = s.map((a) => a + "-" + r), t && (s = s.concat(s.map(wa)))), s;
}
function Gr(e) {
  const t = Xt(e);
  return zh[t] + e.slice(t.length);
}
function Wh(e) {
  var t, n, o, r;
  return {
    top: (t = e.top) != null ? t : 0,
    right: (n = e.right) != null ? n : 0,
    bottom: (o = e.bottom) != null ? o : 0,
    left: (r = e.left) != null ? r : 0
  };
}
function li(e) {
  return typeof e != "number" ? Wh(e) : {
    top: e,
    right: e,
    bottom: e,
    left: e
  };
}
function wn(e) {
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
var qh = typeof document < "u", Kh = function() {
}, xa = qh ? p.useLayoutEffect : Kh;
const Xh = {
  ...ql
}, Yh = Xh.useInsertionEffect, Gh = Yh || ((e) => e());
function Jh(e) {
  const t = p.useRef(() => {
  });
  return Gh(() => {
    t.current = e;
  }), p.useCallback(function() {
    for (var n = arguments.length, o = new Array(n), r = 0; r < n; r++)
      o[r] = arguments[r];
    return t.current == null ? void 0 : t.current(...o);
  }, []);
}
function Mc(e, t, n) {
  let {
    reference: o,
    floating: r
  } = e;
  const s = Ot(t), a = ci(t), i = ii(a), c = Xt(t), u = s === "y", f = o.x + o.width / 2 - r.width / 2, h = o.y + o.height / 2 - r.height / 2, d = o[i] / 2 - r[i] / 2;
  let m;
  switch (c) {
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
  const g = ko(t);
  return g && (m[a] += d * (g === "end" ? 1 : -1) * (n && u ? -1 : 1)), m;
}
async function Zh(e, t) {
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
    elementContext: h = "floating",
    altBoundary: d = !1,
    padding: m = 0
  } = Kt(t, e), g = li(m), w = i[d ? h === "floating" ? "reference" : "floating" : h], x = wn(await s.getClippingRect({
    element: (n = await (s.isElement == null ? void 0 : s.isElement(w))) == null || n ? w : w.contextElement || await (s.getDocumentElement == null ? void 0 : s.getDocumentElement(i.floating)),
    boundary: u,
    rootBoundary: f,
    strategy: c
  })), E = h === "floating" ? {
    x: o,
    y: r,
    width: a.floating.width,
    height: a.floating.height
  } : a.reference, C = await (s.getOffsetParent == null ? void 0 : s.getOffsetParent(i.floating)), k = await (s.isElement == null ? void 0 : s.isElement(C)) && await (s.getScale == null ? void 0 : s.getScale(C)) || {
    x: 1,
    y: 1
  }, R = wn(s.convertOffsetParentRelativeRectToViewportRelativeRect ? await s.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements: i,
    rect: E,
    offsetParent: C,
    strategy: c
  }) : E);
  return {
    top: (x.top - R.top + g.top) / k.y,
    bottom: (R.bottom - x.bottom + g.bottom) / k.y,
    left: (x.left - R.left + g.left) / k.x,
    right: (R.right - x.right + g.right) / k.x
  };
}
const Qh = 50, em = async (e, t, n) => {
  const {
    placement: o = "bottom",
    strategy: r = "absolute",
    middleware: s = [],
    platform: a
  } = n, i = a.detectOverflow ? a : {
    ...a,
    detectOverflow: Zh
  }, c = await (a.isRTL == null ? void 0 : a.isRTL(t));
  let u = await a.getElementRects({
    reference: e,
    floating: t,
    strategy: r
  }), {
    x: f,
    y: h
  } = Mc(u, o, c), d = o, m = 0;
  const g = {};
  for (let v = 0; v < s.length; v++) {
    const w = s[v];
    if (!w)
      continue;
    const {
      name: x,
      fn: E
    } = w, {
      x: C,
      y: k,
      data: R,
      reset: P
    } = await E({
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
    f = C ?? f, h = k ?? h, g[x] = {
      ...g[x],
      ...R
    }, P && m < Qh && (m++, typeof P == "object" && (P.placement && (d = P.placement), P.rects && (u = P.rects === !0 ? await a.getElementRects({
      reference: e,
      floating: t,
      strategy: r
    }) : P.rects), {
      x: f,
      y: h
    } = Mc(u, d, c)), v = -1);
  }
  return {
    x: f,
    y: h,
    placement: d,
    strategy: r,
    middlewareData: g
  };
}, tm = (e) => ({
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
    } = Kt(e, t) || {};
    if (u == null)
      return {};
    const h = li(f), d = {
      x: n,
      y: o
    }, m = ci(r), g = ii(m), v = await a.getDimensions(u), w = m === "y", x = w ? "top" : "left", E = w ? "bottom" : "right", C = w ? "clientHeight" : "clientWidth", k = s.reference[g] + s.reference[m] - d[m] - s.floating[g], R = d[m] - s.reference[m], P = await (a.getOffsetParent == null ? void 0 : a.getOffsetParent(u));
    let S = P ? P[C] : 0;
    (!S || !await (a.isElement == null ? void 0 : a.isElement(P))) && (S = i.floating[C] || s.floating[g]);
    const y = k / 2 - R / 2, N = S / 2 - v[g] / 2 - 1, D = _t(h[x], N), O = _t(h[E], N), z = S - v[g] - O, _ = S / 2 - v[g] / 2 + y, F = Ru(D, _, z), $ = !c.arrow && ko(r) != null && _ !== F && s.reference[g] / 2 - (_ < D ? D : O) - v[g] / 2 < 0, M = $ ? _ < D ? _ - D : _ - z : 0;
    return {
      [m]: d[m] + M,
      data: {
        [m]: F,
        centerOffset: _ - F - M,
        ...$ && {
          alignmentOffset: M
        }
      },
      reset: $
    };
  }
}), nm = function(e) {
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
        crossAxis: h = !0,
        fallbackPlacements: d,
        fallbackStrategy: m = "bestFit",
        fallbackAxisSideDirection: g = "none",
        flipAlignment: v = !0,
        ...w
      } = Kt(e, t);
      if ((n = s.arrow) != null && n.alignmentOffset)
        return {};
      const x = Xt(r), E = Ot(i), C = Xt(i) === i, k = await (c.isRTL == null ? void 0 : c.isRTL(u.floating)), R = d || (C || !v ? [Gr(i)] : Fh(i)), P = g !== "none";
      !d && P && R.push(...Uh(i, v, g, k));
      const S = [i, ...R], y = await c.detectOverflow(t, w), N = [];
      let D = ((o = s.flip) == null ? void 0 : o.overflows) || [];
      if (f && N.push(y[x]), h) {
        const F = _h(r, a, k);
        N.push(y[F[0]], y[F[1]]);
      }
      if (D = [...D, {
        placement: r,
        overflows: N
      }], !N.every((F) => F <= 0)) {
        var O, z;
        const F = (((O = s.flip) == null ? void 0 : O.index) || 0) + 1, $ = S[F];
        if ($ && (!(h === "alignment" ? E !== Ot($) : !1) || // We leave the current main axis only if every placement on that axis
        // overflows the main axis.
        D.every((I) => Ot(I.placement) === E ? I.overflows[0] > 0 : !0)))
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
          switch (m) {
            case "bestFit": {
              var _;
              const L = (_ = D.filter((I) => {
                if (P) {
                  const A = Ot(I.placement);
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
function Dc(e, t) {
  return {
    top: e.top - t.height,
    right: e.right - t.width,
    bottom: e.bottom - t.height,
    left: e.left - t.width
  };
}
function Oc(e) {
  return Lh.some((t) => e[t] >= 0);
}
const om = function(e) {
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
      } = Kt(e, t);
      switch (r) {
        case "referenceHidden": {
          const a = await o.detectOverflow(t, {
            ...s,
            elementContext: "reference"
          }), i = Dc(a, n.reference);
          return {
            data: {
              referenceHiddenOffsets: i,
              referenceHidden: Oc(i)
            }
          };
        }
        case "escaped": {
          const a = await o.detectOverflow(t, {
            ...s,
            altBoundary: !0
          }), i = Dc(a, n.floating);
          return {
            data: {
              escapedOffsets: i,
              escaped: Oc(i)
            }
          };
        }
        default:
          return {};
      }
    }
  };
};
function Nu(e) {
  const t = _t(...e.map((s) => s.left)), n = _t(...e.map((s) => s.top)), o = kt(...e.map((s) => s.right)), r = kt(...e.map((s) => s.bottom));
  return {
    x: t,
    y: n,
    width: o - t,
    height: r - n
  };
}
function rm(e) {
  const t = e.slice().sort((r, s) => r.y - s.y), n = [];
  let o = null;
  for (let r = 0; r < t.length; r++) {
    const s = t[r];
    !o || s.y - o.y > o.height / 2 ? n.push([s]) : n[n.length - 1].push(s), o = s;
  }
  return n.map((r) => wn(Nu(r)));
}
const sm = function(e) {
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
      } = Kt(e, t), f = Array.from(await (s.getClientRects == null ? void 0 : s.getClientRects(o.reference)) || []);
      if (!f.length)
        return {};
      const h = rm(f), d = wn(Nu(f)), m = li(i);
      function g() {
        if (h.length === 2 && (h[0].left > h[1].right || h[1].left > h[0].right) && c != null && u != null)
          return h.find((w) => c > w.left - m.left && c < w.right + m.right && u > w.top - m.top && u < w.bottom + m.bottom) || d;
        if (h.length >= 2) {
          if (Ot(n) === "y") {
            const P = h[0], S = h[h.length - 1], y = Xt(n) === "top", N = P.top, D = S.bottom, O = y ? P.left : S.left, z = y ? P.right : S.right;
            return wn({
              x: O,
              y: N,
              width: z - O,
              height: D - N
            });
          }
          const w = Xt(n) === "left", x = kt(...h.map((P) => P.right)), E = _t(...h.map((P) => P.left)), C = h.filter((P) => w ? P.left === E : P.right === x), k = C[0].top, R = C[C.length - 1].bottom;
          return wn({
            x: E,
            y: k,
            width: x - E,
            height: R - k
          });
        }
        return d;
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
}, Tu = /* @__PURE__ */ new Set(["left", "top"]);
async function am(e, t) {
  const {
    placement: n,
    platform: o,
    elements: r
  } = e, s = await (o.isRTL == null ? void 0 : o.isRTL(r.floating)), a = Xt(n), i = ko(n), c = Ot(n) === "y", u = Tu.has(a) ? -1 : 1, f = s && c ? -1 : 1, h = Kt(t, e);
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
  return i && typeof g == "number" && (m = i === "end" ? g * -1 : g), c ? {
    x: m * f,
    y: d * u
  } : {
    x: d * u,
    y: m * f
  };
}
const im = function(e) {
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
      } = t, c = await am(t, e);
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
}, cm = function(e) {
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
              x: C,
              y: k
            } = E;
            return {
              x: C,
              y: k
            };
          }
        },
        ...u
      } = Kt(e, t), f = {
        x: n,
        y: o
      }, h = await s.detectOverflow(t, u), d = Ot(r), m = ai(d);
      let g = f[m], v = f[d];
      const w = (E, C) => Ru(C + h[E === "y" ? "top" : "left"], C, C - h[E === "y" ? "bottom" : "right"]);
      a && (g = w(m, g)), i && (v = w(d, v));
      const x = c.fn({
        ...t,
        [m]: g,
        [d]: v
      });
      return {
        ...x,
        data: {
          x: x.x - n,
          y: x.y - o,
          enabled: {
            [m]: a,
            [d]: i
          }
        }
      };
    }
  };
}, lm = function(e) {
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
        crossAxis: h = !0
      } = Kt(e, t), d = {
        x: r,
        y: s
      }, m = Ot(a), g = ai(m);
      let v = d[g], w = d[m];
      const x = Kt(u, t), E = typeof x == "number" ? {
        mainAxis: x,
        crossAxis: 0
      } : {
        mainAxis: (n = x.mainAxis) != null ? n : 0,
        crossAxis: (o = x.crossAxis) != null ? o : 0
      };
      if (f) {
        const R = g === "y" ? "height" : "width", P = i.reference[g] - i.floating[R] + E.mainAxis, S = i.reference[g] + i.reference[R] - E.mainAxis;
        v < P ? v = P : v > S && (v = S);
      }
      if (h) {
        var C, k;
        const R = g === "y" ? "width" : "height", P = Tu.has(Xt(a)), S = i.reference[m] - i.floating[R] + (P && ((C = c.offset) == null ? void 0 : C[m]) || 0) + (P ? 0 : E.crossAxis), y = i.reference[m] + i.reference[R] + (P ? 0 : ((k = c.offset) == null ? void 0 : k[m]) || 0) - (P ? E.crossAxis : 0);
        w < S ? w = S : w > y && (w = y);
      }
      return {
        [g]: v,
        [m]: w
      };
    }
  };
}, um = function(e) {
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
      } = Kt(e, t), c = await r.detectOverflow(t, i), u = Xt(n), f = ko(n), h = Ot(n) === "y", {
        width: d,
        height: m
      } = o.floating;
      let g, v;
      u === "top" || u === "bottom" ? (g = u, v = f === (await (r.isRTL == null ? void 0 : r.isRTL(s.floating)) ? "start" : "end") ? "left" : "right") : (v = u, g = f === "end" ? "top" : "bottom");
      const w = m - c.top - c.bottom, x = d - c.left - c.right, E = _t(m - c[g], w), C = _t(d - c[v], x), k = t.middlewareData.shift, R = !k;
      let P = E, S = C;
      k != null && k.enabled.x && (S = x), k != null && k.enabled.y && (P = w), R && !f && (h ? S = d - 2 * kt(c.left, c.right) : P = m - 2 * kt(c.top, c.bottom)), await a({
        ...t,
        availableWidth: S,
        availableHeight: P
      });
      const y = await r.getDimensions(s.floating);
      return d !== y.width || m !== y.height ? {
        reset: {
          rects: !0
        }
      } : {};
    }
  };
};
function Pu(e) {
  const t = qt(e);
  let n = parseFloat(t.width) || 0, o = parseFloat(t.height) || 0;
  const r = Rn(e), s = r ? e.offsetWidth : n, a = r ? e.offsetHeight : o, i = Yr(n) !== s || Yr(o) !== a;
  return i && (n = s, o = a), {
    width: n,
    height: o,
    $: i
  };
}
function ui(e) {
  return mt(e) ? e : e.contextElement;
}
function so(e) {
  const t = ui(e);
  if (!Rn(t))
    return en(1);
  const n = t.getBoundingClientRect(), {
    width: o,
    height: r,
    $: s
  } = Pu(t);
  let a = (s ? Yr(n.width) : n.width) / o, i = (s ? Yr(n.height) : n.height) / r;
  return (!a || !Number.isFinite(a)) && (a = 1), (!i || !Number.isFinite(i)) && (i = 1), {
    x: a,
    y: i
  };
}
const dm = /* @__PURE__ */ en(0);
function Au(e) {
  const t = gt(e);
  return !si() || !t.visualViewport ? dm : {
    x: t.visualViewport.offsetLeft,
    y: t.visualViewport.offsetTop
  };
}
function fm(e, t, n) {
  return t === void 0 && (t = !1), !!n && t && n === gt(e);
}
function zn(e, t, n, o) {
  t === void 0 && (t = !1), n === void 0 && (n = !1);
  const r = e.getBoundingClientRect(), s = ui(e);
  let a = en(1);
  t && (o ? mt(o) && (a = so(o)) : a = so(e));
  const i = fm(s, n, o) ? Au(s) : en(0);
  let c = (r.left + i.x) / a.x, u = (r.top + i.y) / a.y, f = r.width / a.x, h = r.height / a.y;
  if (s && o) {
    const d = gt(s), m = mt(o) ? gt(o) : o;
    let g = d, v = ba(g);
    for (; v && m !== g; ) {
      const w = so(v), x = v.getBoundingClientRect(), E = qt(v), C = x.left + (v.clientLeft + parseFloat(E.paddingLeft)) * w.x, k = x.top + (v.clientTop + parseFloat(E.paddingTop)) * w.y;
      c *= w.x, u *= w.y, f *= w.x, h *= w.y, c += C, u += k, g = gt(v), v = ba(g);
    }
  }
  return wn({
    width: f,
    height: h,
    x: c,
    y: u
  });
}
function gs(e, t) {
  const n = ms(e).scrollLeft;
  return t ? t.left + n : zn(sn(e)).left + n;
}
function Iu(e, t) {
  const n = e.getBoundingClientRect(), o = n.left + t.scrollLeft - gs(e, n), r = n.top + t.scrollTop;
  return {
    x: o,
    y: r
  };
}
function pm(e) {
  let {
    elements: t,
    rect: n,
    offsetParent: o,
    strategy: r
  } = e;
  const s = r === "fixed", a = sn(o), i = t ? hs(t.floating) : !1;
  if (o === a || i && s)
    return n;
  let c = {
    scrollLeft: 0,
    scrollTop: 0
  }, u = en(1);
  const f = en(0), h = Rn(o);
  if ((h || !s) && ((jo(o) !== "body" || ps(a)) && (c = ms(o)), h)) {
    const m = zn(o);
    u = so(o), f.x = m.x + o.clientLeft, f.y = m.y + o.clientTop;
  }
  const d = a && !h && !s ? Iu(a, c) : en(0);
  return {
    width: n.width * u.x,
    height: n.height * u.y,
    x: n.x * u.x - c.scrollLeft * u.x + f.x + d.x,
    y: n.y * u.y - c.scrollTop * u.y + f.y + d.y
  };
}
function hm(e) {
  return e.getClientRects ? Array.from(e.getClientRects()) : [];
}
function mm(e) {
  const t = ms(e), n = e.ownerDocument.body, o = kt(e.scrollWidth, e.clientWidth, n.scrollWidth, n.clientWidth), r = kt(e.scrollHeight, e.clientHeight, n.scrollHeight, n.clientHeight);
  let s = -t.scrollLeft + gs(e);
  const a = -t.scrollTop;
  return qt(n).direction === "rtl" && (s += kt(e.clientWidth, n.clientWidth) - o), {
    width: o,
    height: r,
    x: s,
    y: a
  };
}
const gm = 25;
function vm(e, t, n) {
  n === void 0 && (n = "viewport");
  const o = n === "layoutViewport", r = gt(e), s = sn(e), a = r.visualViewport;
  let i = s.clientWidth, c = s.clientHeight, u = 0, f = 0;
  if (a) {
    const d = !si() || t === "fixed";
    o ? d || (u = -a.offsetLeft, f = -a.offsetTop) : (i = a.width, c = a.height, d && (u = a.offsetLeft, f = a.offsetTop));
  }
  if (gs(s) <= 0) {
    const d = s.ownerDocument, m = d.body, g = getComputedStyle(m), v = d.compatMode === "CSS1Compat" && parseFloat(g.marginLeft) + parseFloat(g.marginRight) || 0, w = Math.abs(s.clientWidth - m.clientWidth - v), x = getComputedStyle(s).scrollbarGutter === "stable both-edges" ? w / 2 : w;
    x <= gm && (i -= x);
  }
  return {
    width: i,
    height: c,
    x: u,
    y: f
  };
}
function ym(e, t) {
  const n = zn(e, !0, t === "fixed"), o = n.top + e.clientTop, r = n.left + e.clientLeft, s = so(e), a = e.clientWidth * s.x, i = e.clientHeight * s.y, c = r * s.x, u = o * s.y;
  return {
    width: a,
    height: i,
    x: c,
    y: u
  };
}
function $c(e, t, n) {
  let o;
  if (t === "viewport" || t === "layoutViewport")
    o = vm(e, n, t);
  else if (t === "document")
    o = mm(sn(e));
  else if (mt(t))
    o = ym(t, n);
  else {
    const r = Au(e);
    o = {
      x: t.x - r.x,
      y: t.y - r.y,
      width: t.width,
      height: t.height
    };
  }
  return wn(o);
}
function bm(e, t) {
  const n = t.get(e);
  if (n)
    return n;
  let o = Ko(e, [], !1).filter((i) => mt(i) && jo(i) !== "body"), r = null;
  const s = qt(e).position === "fixed";
  let a = s ? Ln(e) : e;
  for (; mt(a) && !qo(a); ) {
    const i = qt(a), c = ri(a), u = r ? r.position : s ? "fixed" : "";
    !c && (u === "fixed" || u === "absolute" && i.position === "static") ? o = o.filter((h) => h !== a) : r = i, a = Ln(a);
  }
  return t.set(e, o), o;
}
function wm(e) {
  let {
    element: t,
    boundary: n,
    rootBoundary: o,
    strategy: r
  } = e;
  const a = [...n === "clippingAncestors" ? hs(t) ? [] : bm(t, this._c) : [].concat(n), o], i = $c(t, a[0], r);
  let c = i.top, u = i.right, f = i.bottom, h = i.left;
  for (let d = 1; d < a.length; d++) {
    const m = $c(t, a[d], r);
    c = kt(m.top, c), u = _t(m.right, u), f = _t(m.bottom, f), h = kt(m.left, h);
  }
  return {
    width: u - h,
    height: f - c,
    x: h,
    y: c
  };
}
function xm(e) {
  const {
    width: t,
    height: n
  } = Pu(e);
  return {
    width: t,
    height: n
  };
}
function Sm(e, t, n) {
  const o = Rn(t), r = sn(t), s = n === "fixed", a = zn(e, !0, s, t);
  let i = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const c = en(0);
  if ((o || !s) && ((jo(t) !== "body" || ps(r)) && (i = ms(t)), o)) {
    const d = zn(t, !0, s, t);
    c.x = d.x + t.clientLeft, c.y = d.y + t.clientTop;
  }
  !o && r && (c.x = gs(r));
  const u = r && !o && !s ? Iu(r, i) : en(0), f = a.left + i.scrollLeft - c.x - u.x, h = a.top + i.scrollTop - c.y - u.y;
  return {
    x: f,
    y: h,
    width: a.width,
    height: a.height
  };
}
function Xs(e) {
  return qt(e).position === "static";
}
function Lc(e, t) {
  if (!Rn(e) || qt(e).position === "fixed")
    return null;
  if (t)
    return t(e);
  let n = e.offsetParent;
  return sn(e) === n && (n = n.ownerDocument.body), n;
}
function Mu(e, t) {
  const n = gt(e);
  if (hs(e))
    return n;
  if (!Rn(e)) {
    let r = Ln(e);
    for (; r && !qo(r); ) {
      if (mt(r) && !Xs(r))
        return r;
      r = Ln(r);
    }
    return n;
  }
  let o = Lc(e, t);
  for (; o && Mh(o) && Xs(o); )
    o = Lc(o, t);
  return o && qo(o) && Xs(o) && !ri(o) ? n : o || $h(e) || n;
}
const Cm = async function(e) {
  const t = this.getOffsetParent || Mu, n = this.getDimensions, o = await n(e.floating);
  return {
    reference: Sm(e.reference, await t(e.floating), e.strategy),
    floating: {
      x: 0,
      y: 0,
      width: o.width,
      height: o.height
    }
  };
};
function jm(e) {
  return qt(e).direction === "rtl";
}
const km = {
  convertOffsetParentRelativeRectToViewportRelativeRect: pm,
  getDocumentElement: sn,
  getClippingRect: wm,
  getOffsetParent: Mu,
  getElementRects: Cm,
  getClientRects: hm,
  getDimensions: xm,
  getScale: so,
  isElement: mt,
  isRTL: jm
};
function Du(e, t) {
  return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function Em(e, t, n) {
  let o = null, r;
  const s = sn(e);
  function a() {
    var f;
    clearTimeout(r), (f = o) == null || f.disconnect(), o = null;
  }
  function i(f, h) {
    f === void 0 && (f = !1), h === void 0 && (h = 1), a();
    const d = e.getBoundingClientRect(), {
      left: m,
      top: g,
      width: v,
      height: w
    } = d;
    if (f || t(), !v || !w)
      return;
    const x = Tr(g), E = Tr(s.clientWidth - (m + v)), C = Tr(s.clientHeight - (g + w)), k = Tr(m), P = {
      rootMargin: -x + "px " + -E + "px " + -C + "px " + -k + "px",
      threshold: kt(0, _t(1, h)) || 1
    };
    let S = !0;
    function y(N) {
      const D = N[0].intersectionRatio;
      if (!Du(d, e.getBoundingClientRect()))
        return i();
      if (D !== h) {
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
  const c = gt(e), u = () => i(n);
  return c.addEventListener("resize", u), i(!0), () => {
    c.removeEventListener("resize", u), a();
  };
}
function zc(e, t, n, o) {
  o === void 0 && (o = {});
  const {
    ancestorScroll: r = !0,
    ancestorResize: s = !0,
    elementResize: a = typeof ResizeObserver == "function",
    layoutShift: i = typeof IntersectionObserver == "function",
    animationFrame: c = !1
  } = o, u = ui(e), f = r || s ? [...u ? Ko(u) : [], ...t ? Ko(t) : []] : [];
  f.forEach((x) => {
    r && x.addEventListener("scroll", n), s && x.addEventListener("resize", n);
  });
  const h = u && i ? Em(u, n, s) : null;
  let d = -1, m = null;
  a && (m = new ResizeObserver((x) => {
    let [E] = x;
    E && E.target === u && m && t && (m.unobserve(t), cancelAnimationFrame(d), d = requestAnimationFrame(() => {
      var C;
      (C = m) == null || C.observe(t);
    })), n();
  }), u && !c && m.observe(u), t && m.observe(t));
  let g, v = c ? zn(e) : null;
  c && w();
  function w() {
    const x = zn(e);
    v && !Du(v, x) && n(), v = x, g = requestAnimationFrame(w);
  }
  return n(), () => {
    var x;
    f.forEach((E) => {
      r && E.removeEventListener("scroll", n), s && E.removeEventListener("resize", n);
    }), h?.(), (x = m) == null || x.disconnect(), m = null, c && cancelAnimationFrame(g);
  };
}
const Rm = im, Nm = cm, Tm = nm, Pm = um, Am = om, _c = tm, Im = sm, Mm = lm, Dm = (e, t, n) => {
  const o = /* @__PURE__ */ new Map(), r = n ?? {}, s = {
    ...km,
    ...r.platform,
    _c: o
  };
  return em(e, t, {
    ...r,
    platform: s
  });
};
var Om = typeof document < "u", $m = function() {
}, $r = Om ? p.useLayoutEffect : $m;
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
function Ou(e) {
  return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function Fc(e, t) {
  const n = Ou(e);
  return Math.round(t * n) / n;
}
function Ys(e) {
  const t = p.useRef(e);
  return $r(() => {
    t.current = e;
  }), t;
}
function Lm(e) {
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
  } = e, [f, h] = p.useState({
    x: 0,
    y: 0,
    strategy: n,
    placement: t,
    middlewareData: {},
    isPositioned: !1
  }), [d, m] = p.useState(o);
  Jr(d, o) || m(o);
  const [g, v] = p.useState(null), [w, x] = p.useState(null), E = p.useCallback((I) => {
    I !== P.current && (P.current = I, v(I));
  }, []), C = p.useCallback((I) => {
    I !== S.current && (S.current = I, x(I));
  }, []), k = s || g, R = a || w, P = p.useRef(null), S = p.useRef(null), y = p.useRef(f), N = c != null, D = Ys(c), O = Ys(r), z = Ys(u), _ = p.useCallback(() => {
    if (!P.current || !S.current)
      return;
    const I = {
      placement: t,
      strategy: n,
      middleware: d
    };
    O.current && (I.platform = O.current), Dm(P.current, S.current, I).then((A) => {
      const B = {
        ...A,
        // The floating element's position may be recomputed while it's closed
        // but still mounted (such as when transitioning out). To ensure
        // `isPositioned` will be `false` initially on the next open, avoid
        // setting it to `true` when `open === false` (must be specified).
        isPositioned: z.current !== !1
      };
      F.current && !Jr(y.current, B) && (y.current = B, Wt.flushSync(() => {
        h(B);
      }));
    });
  }, [d, t, n, O, z]);
  $r(() => {
    u === !1 && y.current.isPositioned && (y.current.isPositioned = !1, h((I) => ({
      ...I,
      isPositioned: !1
    })));
  }, [u]);
  const F = p.useRef(!1);
  $r(() => (F.current = !0, () => {
    F.current = !1;
  }), []), $r(() => {
    if (k && (P.current = k), R && (S.current = R), k && R) {
      if (D.current)
        return D.current(k, R, _);
      _();
    }
  }, [k, R, _, D, N]);
  const $ = p.useMemo(() => ({
    reference: P,
    floating: S,
    setReference: E,
    setFloating: C
  }), [E, C]), M = p.useMemo(() => ({
    reference: k,
    floating: R
  }), [k, R]), L = p.useMemo(() => {
    const I = {
      position: n,
      left: 0,
      top: 0
    };
    if (!M.floating)
      return I;
    const A = Fc(M.floating, f.x), B = Fc(M.floating, f.y);
    return i ? {
      ...I,
      transform: "translate(" + A + "px, " + B + "px)",
      ...Ou(M.floating) >= 1.5 && {
        willChange: "transform"
      }
    } : {
      position: n,
      left: A,
      top: B
    };
  }, [n, i, M.floating, f.x, f.y]);
  return p.useMemo(() => ({
    ...f,
    update: _,
    refs: $,
    elements: M,
    floatingStyles: L
  }), [f, _, $, M, L]);
}
const zm = (e) => {
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
      return o && t(o) ? o.current != null ? _c({
        element: o.current,
        padding: r
      }).fn(n) : {} : o ? _c({
        element: o,
        padding: r
      }).fn(n) : {};
    }
  };
}, _m = (e, t) => {
  const n = Rm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, Fm = (e, t) => {
  const n = Nm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, Bm = (e, t) => ({
  fn: Mm(e).fn,
  options: [e, t]
}), Vm = (e, t) => {
  const n = Tm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, Hm = (e, t) => {
  const n = Pm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, Um = (e, t) => {
  const n = Am(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, Bc = (e, t) => {
  const n = Im(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, Wm = (e, t) => {
  const n = zm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
};
function $u(e) {
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
const qm = {
  ...ql
};
let Vc = !1, Km = 0;
const Hc = () => (
  // Ensure the id is unique with multiple independent versions of Floating UI
  // on <React 18
  "floating-ui-" + Math.random().toString(36).slice(2, 6) + Km++
);
function Xm() {
  const [e, t] = p.useState(() => Vc ? Hc() : void 0);
  return xa(() => {
    e == null && t(Hc());
  }, []), p.useEffect(() => {
    Vc = !0;
  }, []), e;
}
const Ym = qm.useId, Gm = Ym || Xm;
function Jm() {
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
const Zm = /* @__PURE__ */ p.createContext(null), Qm = /* @__PURE__ */ p.createContext(null), eg = () => {
  var e;
  return ((e = p.useContext(Zm)) == null ? void 0 : e.id) || null;
}, tg = () => p.useContext(Qm);
function ng(e) {
  const {
    open: t = !1,
    onOpenChange: n,
    elements: o
  } = e, r = Gm(), s = p.useRef({}), [a] = p.useState(() => Jm()), i = eg() != null, [c, u] = p.useState(o.reference), f = Jh((m, g, v) => {
    s.current.openEvent = m ? g : void 0, a.emit("openchange", {
      open: m,
      event: g,
      reason: v,
      nested: i
    }), n?.(m, g, v);
  }), h = p.useMemo(() => ({
    setPositionReference: u
  }), []), d = p.useMemo(() => ({
    reference: c || o.reference || null,
    floating: o.floating || null,
    domReference: o.reference
  }), [c, o.reference, o.floating]);
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
function og(e) {
  var t, n;
  let {
    elements: o,
    ...r
  } = e === void 0 ? {} : e;
  const {
    nodeId: s
  } = r, a = ng({
    ...r,
    elements: {
      reference: (t = o?.reference) != null ? t : null,
      floating: (n = o?.floating) != null ? n : null
    }
  }), i = r.rootContext || a, c = i.elements, [u, f] = p.useState(null), [h, d] = p.useState(null), g = c?.domReference || u, v = p.useRef(null), w = tg();
  xa(() => {
    g && (v.current = g);
  }, [g]);
  const x = Lm({
    ...r,
    elements: {
      ...c,
      ...h && {
        reference: h
      }
    }
  }), E = p.useCallback((S) => {
    const y = mt(S) ? {
      getBoundingClientRect: () => S.getBoundingClientRect(),
      getClientRects: () => S.getClientRects(),
      contextElement: S
    } : S;
    d(y), x.refs.setReference(y);
  }, [x.refs]), C = p.useCallback((S) => {
    (mt(S) || S === null) && (v.current = S, f(S)), (mt(x.refs.reference.current) || x.refs.reference.current === null || // Don't allow setting virtual elements using the old technique back to
    // `null` to support `positionReference` + an unstable `reference`
    // callback ref.
    S !== null && !mt(S)) && x.refs.setReference(S);
  }, [x.refs]), k = p.useMemo(() => ({
    ...x.refs,
    setReference: C,
    setPositionReference: E,
    domReference: v
  }), [x.refs, C, E]), R = p.useMemo(() => ({
    ...x.elements,
    domReference: g
  }), [x.elements, g]), P = p.useMemo(() => ({
    ...x,
    ...i,
    refs: k,
    elements: R,
    nodeId: s
  }), [x, k, R, s, i]);
  return xa(() => {
    i.dataRef.current.floatingContext = P;
    const S = w?.nodesRef.current.find((y) => y.id === s);
    S && (S.context = P);
  }), p.useMemo(() => ({
    ...x,
    context: P,
    refs: k,
    elements: R
  }), [x, k, R, P]);
}
const Lu = {
  scrollHideDelay: 1e3,
  type: "hover",
  scrollbars: "xy"
}, zu = ze((e, { scrollbarSize: t, overscrollBehavior: n, scrollbars: o }) => {
  let r = n;
  return n && o && (o === "x" ? r = `${n} auto` : o === "y" && (r = `auto ${n}`)), { root: {
    "--scrollarea-scrollbar-size": Ae(t),
    "--scrollarea-over-scroll-behavior": r
  } };
}), Nn = se((e) => {
  const t = Z("ScrollArea", Lu, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, scrollbarSize: i, vars: c, type: u, scrollHideDelay: f, viewportProps: h, viewportRef: d, onScrollPositionChange: m, children: g, offsetScrollbars: v, scrollbars: w, onBottomReached: x, onTopReached: E, onLeftReached: C, onRightReached: k, overscrollBehavior: R, startScrollPosition: P, verticalScrollbarPosition: S, attributes: y, ...N } = t, [D, O] = p.useState(!1), [z, _] = p.useState(!1), [F, $] = p.useState(!1), M = p.useRef(!0), L = p.useRef(!1), I = p.useRef(!0), A = p.useRef(!1), B = Me({
    name: "ScrollArea",
    props: t,
    classes: oi,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: y,
    vars: c,
    varsResolver: zu
  }), H = p.useRef(null), [W, Y] = p.useState(null), ae = p.useCallback((ie) => {
    Y((te) => te === ie ? te : ie);
  }, []), fe = $u([
    d,
    H,
    ae
  ]);
  return jn(v === "present" ? W : null, () => {
    const ie = H.current;
    ie && (_(ie.scrollHeight > ie.clientHeight), $(ie.scrollWidth > ie.clientWidth));
  }), Ho(() => {
    P && H.current && H.current.scrollTo({
      left: P.x ?? 0,
      top: P.y ?? 0
    });
  }, []), /* @__PURE__ */ l.jsxs(hu, {
    getStyles: B,
    type: u === "never" ? "always" : u,
    scrollHideDelay: f,
    scrollbars: w,
    ...B("root"),
    ...N,
    children: [
      /* @__PURE__ */ l.jsx(ju, {
        ...h,
        ...B("viewport", { style: h?.style }),
        ref: fe,
        "data-offset-scrollbars": v === !0 ? "xy" : v || void 0,
        "data-scrollbars": w || void 0,
        "data-vertical-scrollbar-position": S || void 0,
        "data-horizontal-hidden": v === "present" && !F ? "true" : void 0,
        "data-vertical-hidden": v === "present" && !z ? "true" : void 0,
        onScroll: (ie) => {
          h?.onScroll?.(ie), m?.({
            x: ie.currentTarget.scrollLeft,
            y: ie.currentTarget.scrollTop
          });
          const { scrollTop: te, scrollHeight: he, clientHeight: q, scrollLeft: K, scrollWidth: ce, clientWidth: be } = ie.currentTarget, pe = te - (he - q) >= -0.8, Ce = te === 0;
          pe && !L.current && x?.(), Ce && !M.current && E?.(), L.current = pe, M.current = Ce;
          const ne = K - (ce - be) >= -0.8, U = K === 0;
          ne && !A.current && k?.(), U && !I.current && C?.(), A.current = ne, I.current = U;
        },
        children: g
      }),
      (w === "xy" || w === "x") && /* @__PURE__ */ l.jsx(va, {
        ...B("scrollbar"),
        orientation: "horizontal",
        "data-vertical-scrollbar-position": S || void 0,
        "data-hidden": u === "never" || v === "present" && !F ? !0 : void 0,
        forceMount: !0,
        onMouseEnter: () => O(!0),
        onMouseLeave: () => O(!1),
        children: /* @__PURE__ */ l.jsx(ya, { ...B("thumb") })
      }),
      (w === "xy" || w === "y") && /* @__PURE__ */ l.jsx(va, {
        ...B("scrollbar"),
        orientation: "vertical",
        "data-vertical-scrollbar-position": S || void 0,
        "data-hidden": u === "never" || v === "present" && !z ? !0 : void 0,
        forceMount: !0,
        onMouseEnter: () => O(!0),
        onMouseLeave: () => O(!1),
        children: /* @__PURE__ */ l.jsx(ya, { ...B("thumb") })
      }),
      /* @__PURE__ */ l.jsx(Eh, {
        ...B("corner"),
        "data-vertical-scrollbar-position": S || void 0,
        "data-hovered": D || void 0,
        "data-hidden": u === "never" || void 0
      })
    ]
  });
});
Nn.displayName = "@mantine/core/ScrollArea";
const di = se((e) => {
  const { children: t, classNames: n, styles: o, scrollbarSize: r, scrollHideDelay: s, type: a, dir: i, offsetScrollbars: c, overscrollBehavior: u, viewportRef: f, onScrollPositionChange: h, unstyled: d, variant: m, viewportProps: g, scrollbars: v, style: w, vars: x, onBottomReached: E, onTopReached: C, startScrollPosition: k, verticalScrollbarPosition: R, onOverflowChange: P, ...S } = Z("ScrollAreaAutosize", Lu, e), y = p.useRef(null), [N, D] = p.useState(null), O = p.useCallback((M) => {
    D((L) => L === M ? L : M);
  }, []), z = $u([
    f,
    y,
    O
  ]), _ = p.useRef(!1), F = p.useRef(!1), $ = p.useEffectEvent(() => {
    const M = y.current;
    if (!M || !P) return;
    const L = M.scrollHeight > M.clientHeight;
    L !== _.current && (F.current ? P(L) : (F.current = !0, L && P(!0)), _.current = L);
  });
  return jn(P ? N : null, $), /* @__PURE__ */ l.jsx(Q, {
    ...S,
    variant: m,
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
      children: /* @__PURE__ */ l.jsx(Nn, {
        classNames: n,
        styles: o,
        scrollHideDelay: s,
        scrollbarSize: r,
        type: a,
        dir: i,
        offsetScrollbars: c,
        overscrollBehavior: u,
        viewportRef: z,
        onScrollPositionChange: h,
        unstyled: d,
        variant: m,
        viewportProps: g,
        vars: x,
        scrollbars: v,
        onBottomReached: E,
        onTopReached: C,
        startScrollPosition: k,
        verticalScrollbarPosition: R,
        "data-autosize": "true",
        children: t
      })
    })
  });
});
Nn.classes = oi;
Nn.varsResolver = zu;
di.displayName = "@mantine/core/ScrollAreaAutosize";
di.classes = oi;
Nn.Autosize = di;
var _u = { root: "m_515a97f8" };
const fi = se((e) => {
  const t = Z("VisuallyHidden", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, attributes: c, ...u } = t, f = Me({
    name: "VisuallyHidden",
    classes: _u,
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
fi.classes = _u;
fi.displayName = "@mantine/core/VisuallyHidden";
function Uc(e, t, n, o) {
  return e === "center" || o === "center" ? { top: t } : e === "end" ? { bottom: n } : e === "start" ? { top: n } : {};
}
function Wc(e, t, n, o, r) {
  return e === "center" || o === "center" ? { left: t } : e === "end" ? { [r === "ltr" ? "right" : "left"]: n } : e === "start" ? { [r === "ltr" ? "left" : "right"]: n } : {};
}
const rg = {
  bottom: "borderTopLeftRadius",
  left: "borderTopRightRadius",
  right: "borderBottomLeftRadius",
  top: "borderBottomRightRadius"
};
function sg({ position: e, arrowSize: t, dir: n }) {
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
function ag({ position: e, arrowSize: t, arrowOffset: n, arrowRadius: o, arrowPosition: r, arrowX: s, arrowY: a, dir: i }) {
  if (r === "merge") {
    const d = sg({
      position: e,
      arrowSize: t,
      dir: i
    });
    if (d) return d;
  }
  const [c, u = "center"] = e.split("-"), f = {
    width: t,
    height: t,
    transform: "rotate(45deg)",
    position: "absolute",
    [rg[c]]: o
  }, h = -t / 2;
  return c === "left" ? {
    ...f,
    ...Uc(u, a, n, r),
    right: h,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    clipPath: "polygon(100% 0, 0 0, 100% 100%)"
  } : c === "right" ? {
    ...f,
    ...Uc(u, a, n, r),
    left: h,
    borderRightColor: "transparent",
    borderTopColor: "transparent",
    clipPath: "polygon(0 100%, 0 0, 100% 100%)"
  } : c === "top" ? {
    ...f,
    ...Wc(u, s, n, r, i),
    bottom: h,
    borderTopColor: "transparent",
    borderLeftColor: "transparent",
    clipPath: "polygon(0 100%, 100% 100%, 100% 0)"
  } : c === "bottom" ? {
    ...f,
    ...Wc(u, s, n, r, i),
    top: h,
    borderBottomColor: "transparent",
    borderRightColor: "transparent",
    clipPath: "polygon(0 100%, 0 0, 100% 0)"
  } : {};
}
function ig({ position: e, dir: t }) {
  const [n, o] = e.split("-");
  if (!o) return;
  const r = o === "start" && t === "ltr" || o === "end" && t === "rtl";
  if (n === "bottom") return r ? { borderTopLeftRadius: 0 } : { borderTopRightRadius: 0 };
  if (n === "top") return r ? { borderBottomLeftRadius: 0 } : { borderBottomRightRadius: 0 };
  if (n === "left") return o === "start" ? { borderTopRightRadius: 0 } : { borderBottomRightRadius: 0 };
  if (n === "right") return o === "start" ? { borderTopLeftRadius: 0 } : { borderBottomLeftRadius: 0 };
}
function Fu({ position: e, arrowSize: t, arrowOffset: n, arrowRadius: o, arrowPosition: r, visible: s, arrowX: a, arrowY: i, style: c, ...u }) {
  const { dir: f } = Co();
  return s ? /* @__PURE__ */ l.jsx("div", {
    role: "presentation",
    ...u,
    style: {
      ...c,
      ...ag({
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
Fu.displayName = "@mantine/core/FloatingArrow";
function cg(e, t) {
  if (e === "rtl" && (t.includes("right") || t.includes("left"))) {
    const [n, o] = t.split("-"), r = n === "right" ? "left" : "right";
    return o === void 0 ? r : `${r}-${o}`;
  }
  return t;
}
const [lg, pi] = Yt("Popover component was not found in the tree");
function ug({ childProps: e, disabled: t, opened: n, longPressDelay: o = 500, setReference: r, open: s }) {
  const a = p.useRef(!1), i = p.useRef(!1), c = p.useRef(null), u = p.useRef(t);
  u.current = t;
  const f = (g, v, w) => {
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
  }, h = Yn(e.onMouseDown, (g) => {
    t || g.button === 2 && g.stopPropagation();
  }), d = Yn(e.onContextMenu, (g) => {
    t || g.defaultPrevented || (g.preventDefault(), !i.current && (f(g.clientX, g.clientY, g.currentTarget), a.current && (i.current = !0)));
  }), m = mh((g) => {
    if (u.current || i.current) return;
    const v = g, w = v.touches[0] ?? v.changedTouches[0];
    w && (f(w.clientX, w.clientY, c.current), i.current = !0);
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
    onContextMenu: d,
    onMouseDown: h,
    onTouchStart: Yn(e.onTouchStart, m.onTouchStart),
    onTouchEnd: Yn(e.onTouchEnd, m.onTouchEnd),
    onTouchCancel: Yn(e.onTouchCancel, m.onTouchCancel),
    onTouchMove: Yn(e.onTouchMove, m.onTouchMove),
    style: t ? e.style : {
      ...e.style,
      WebkitTouchCallout: "none",
      WebkitUserSelect: "none",
      userSelect: "none"
    },
    "data-expanded": n ? !0 : void 0
  };
}
function Bu(e) {
  const { children: t, disabled: n, longPressDelay: o } = Z("PopoverContextMenu", null, e), r = lr(t);
  if (!r) throw new Error("Popover.ContextMenu component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  const s = pi(), a = ug({
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
Bu.displayName = "@mantine/core/PopoverContextMenu";
function vs({ children: e, active: t = !0, refProp: n = "ref", innerRef: o }) {
  const r = th(t), s = Ve(r, o), a = lr(e);
  return a ? p.cloneElement(a, { [n]: s }) : e;
}
function Vu(e) {
  return /* @__PURE__ */ l.jsx(fi, {
    tabIndex: -1,
    "data-autofocus": !0,
    ...e
  });
}
vs.displayName = "@mantine/core/FocusTrap";
Vu.displayName = "@mantine/core/FocusTrapInitialFocus";
vs.InitialFocus = Vu;
var Hu = {
  dropdown: "m_38a85659",
  arrow: "m_a31dc6c1",
  overlay: "m_3d7bc908"
};
const hi = se((e) => {
  const t = Z("PopoverDropdown", null, e), { className: n, style: o, vars: r, children: s, onKeyDownCapture: a, variant: i, classNames: c, styles: u, ref: f, ...h } = t, d = pi(), { dir: m } = Co(), g = d.arrowPosition === "merge" && d.withArrow ? ig({
    position: d.placement,
    dir: m
  }) : void 0, v = ru({
    opened: d.opened,
    shouldReturnFocus: d.returnFocus
  }), w = d.withRoles ? {
    "aria-labelledby": d.getTargetId(),
    id: d.getDropdownId(),
    role: "dialog",
    tabIndex: -1
  } : {}, x = Ve(f, d.floating);
  return d.disabled ? null : /* @__PURE__ */ l.jsx(Ga, {
    ...d.portalProps,
    withinPortal: d.withinPortal,
    children: /* @__PURE__ */ l.jsx(is, {
      mounted: d.opened,
      ...d.transitionProps,
      transition: d.transitionProps?.transition || "fade",
      duration: d.transitionProps?.duration ?? 150,
      keepMounted: d.keepMounted,
      keepMountedMode: d.keepMountedMode,
      exitDuration: typeof d.transitionProps?.exitDuration == "number" ? d.transitionProps.exitDuration : d.transitionProps?.duration,
      children: (E) => /* @__PURE__ */ l.jsx(vs, {
        active: d.trapFocus && d.opened,
        innerRef: x,
        children: /* @__PURE__ */ l.jsxs(Q, {
          ...w,
          ...h,
          variant: i,
          onKeyDownCapture: qp(() => {
            d.onClose?.(), d.onDismiss?.();
          }, {
            active: d.closeOnEscape,
            onTrigger: v,
            onKeyDown: a
          }),
          "data-position": d.placement,
          "data-fixed": d.floatingStrategy === "fixed" || void 0,
          ...d.getStyles("dropdown", {
            className: n,
            props: t,
            classNames: c,
            styles: u,
            style: [
              {
                ...E,
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
          children: [s, /* @__PURE__ */ l.jsx(Fu, {
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
              classNames: c,
              styles: u
            })
          })]
        })
      })
    })
  });
});
hi.classes = Hu;
hi.displayName = "@mantine/core/PopoverDropdown";
const dg = {
  refProp: "ref",
  popupType: "dialog"
}, Uu = se((e) => {
  const { children: t, refProp: n, popupType: o, ref: r, ...s } = Z("PopoverTarget", dg, e), a = lr(t);
  if (!a) throw new Error("Popover.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  const i = s, c = pi(), u = Ve(c.reference, fu(a), r), f = c.withRoles ? {
    "aria-haspopup": o,
    "aria-expanded": c.opened,
    "aria-controls": c.opened ? c.getDropdownId() : void 0,
    id: c.getTargetId()
  } : {}, h = a.props;
  return p.cloneElement(a, {
    ...i,
    ...f,
    ...c.targetProps,
    className: nn(c.targetProps.className, i.className, h.className),
    [n]: u,
    ...c.controlled ? null : { onClick: (d) => {
      c.onToggle(), h.onClick?.(d);
    } }
  });
});
Uu.displayName = "@mantine/core/PopoverTarget";
function fg(e) {
  if (e === void 0) return {
    shift: !0,
    flip: !0
  };
  const t = { ...e };
  return e.shift === void 0 && (t.shift = !0), e.flip === void 0 && (t.flip = !0), t;
}
function pg(e, t, n, o) {
  const r = fg(e.middlewares), s = [_m(e.offset), Um()];
  if (r.flip && !n) {
    const a = typeof r.flip == "boolean" ? {} : r.flip, i = o ? {
      fallbackStrategy: "initialPlacement",
      ...a
    } : a;
    s.push(Vm(i));
  }
  if (r.shift) {
    const a = typeof r.shift == "boolean" ? {} : r.shift;
    s.push(Fm((i) => {
      const c = i.placement.startsWith("top") || i.placement.startsWith("bottom");
      return {
        limiter: Bm(),
        padding: 5,
        ...e.width === "target" && c ? { mainAxis: !1 } : null,
        ...a
      };
    }));
  }
  return r.inline && s.push(typeof r.inline == "boolean" ? Bc() : Bc(r.inline)), s.push(Wm({
    element: e.arrowRef,
    padding: e.arrowOffset
  })), (r.size || e.width === "target") && s.push(Hm({
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
function hg(e) {
  const [t, n] = Ze({
    value: e.opened,
    defaultValue: e.defaultOpened,
    finalValue: !1,
    onChange: e.onChange
  }), o = p.useRef(t), r = p.useRef(!1), [s, a] = p.useState(null), i = e.preventPositionChangeWhenVisible !== !1, c = p.useRef(t);
  t !== c.current && (c.current = t, t && s !== null && a(null));
  const u = p.useRef(e.position);
  e.position !== u.current && (u.current = e.position, r.current = !1, s !== null && a(null));
  const f = p.useCallback(() => a(null), []), h = () => {
    t && !e.disabled && n(!1);
  }, d = () => {
    e.disabled || n(!t);
  }, m = og({
    open: t,
    strategy: e.strategy,
    placement: i ? s ?? e.position : e.position,
    middleware: pg(e, () => m, i && s !== null, i),
    whileElementsMounted: e.keepMounted ? void 0 : zc
  });
  p.useEffect(() => {
    if (!e.keepMounted) return;
    const v = m.refs.reference.current, w = m.refs.floating.current;
    if (t && v && w) return zc(v, w, m.update);
  }, [
    e.keepMounted,
    t,
    m.update,
    m.elements.reference,
    m.elements.floating
  ]), Ho(() => {
    if (!t) {
      r.current = !1;
      return;
    }
    if (!i || s !== null) return;
    const v = m.refs.floating.current;
    if (!(!v || v.offsetHeight === 0 || v.offsetWidth === 0)) {
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
  return Ho(() => {
    g.current !== m.placement && (g.current = m.placement, e.onPositionChange?.(m.placement));
  }, [m.placement]), Cn(() => {
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
const mg = {
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
  zIndex: So("popover"),
  __staticSelector: "Popover",
  width: "max-content"
}, Wu = ze((e, { radius: t, shadow: n }) => ({ dropdown: {
  "--popover-radius": t === void 0 ? void 0 : Tt(t),
  "--popover-shadow": Kl(n)
} }));
function He(e) {
  const t = Z("Popover", mg, e), { children: n, position: o, offset: r, onPositionChange: s, opened: a, transitionProps: i, onExitTransitionEnd: c, onEnterTransitionEnd: u, width: f, middlewares: h, withArrow: d, arrowSize: m, arrowOffset: g, arrowRadius: v, arrowPosition: w, unstyled: x, classNames: E, styles: C, closeOnClickOutside: k, withinPortal: R, portalProps: P, closeOnEscape: S, clickOutsideEvents: y, trapFocus: N, onClose: D, onDismiss: O, onOpen: z, onChange: _, zIndex: F, radius: $, shadow: M, id: L, defaultOpened: I, __staticSelector: A, withRoles: B, disabled: H, returnFocus: W, variant: Y, keepMounted: ae, keepMountedMode: fe, vars: ie, floatingStrategy: te, withOverlay: he, overlayProps: q, hideDetached: K, attributes: ce, preventPositionChangeWhenVisible: be, ...pe } = t, Ce = Me({
    name: A,
    props: t,
    classes: Hu,
    classNames: E,
    styles: C,
    unstyled: x,
    attributes: ce,
    rootSelector: "dropdown",
    vars: ie,
    varsResolver: Wu
  }), { resolvedStyles: ne } = cr({
    classNames: E,
    styles: C,
    props: t
  }), U = p.useRef(null), [V, X] = p.useState(null), [le, je] = p.useState(null), { dir: Ie } = Co(), me = Ka(), ge = Bt(L), we = hg({
    middlewares: h,
    width: f,
    position: cg(Ie, o),
    offset: typeof r == "number" ? r + (d ? m / 2 : 0) : r,
    arrowRef: U,
    arrowOffset: g,
    onPositionChange: s,
    opened: a,
    defaultOpened: I,
    onChange: _,
    onOpen: z,
    onClose: D,
    onDismiss: O,
    strategy: te,
    disabled: H,
    preventPositionChangeWhenVisible: be,
    keepMounted: ae
  });
  ou(() => {
    k && (we.onClose(), O?.());
  }, y, [V, le]);
  const De = p.useCallback((yt) => {
    X(yt), we.floating.refs.setReference(yt);
  }, [we.floating.refs.setReference]), de = p.useCallback((yt) => {
    je(yt), we.floating.refs.setFloating(yt);
  }, [we.floating.refs.setFloating]), vt = p.useCallback(() => {
    i?.onExited?.(), c?.(), we.resetLockedPlacement();
  }, [
    i?.onExited,
    c,
    we.resetLockedPlacement
  ]), Te = p.useCallback(() => {
    i?.onEntered?.(), u?.();
  }, [i?.onEntered, u]);
  return /* @__PURE__ */ l.jsxs(lg, {
    value: {
      returnFocus: W,
      disabled: H,
      controlled: we.controlled,
      reference: De,
      floating: de,
      x: we.floating.x,
      y: we.floating.y,
      arrowX: we.floating?.middlewareData?.arrow?.x,
      arrowY: we.floating?.middlewareData?.arrow?.y,
      opened: we.opened,
      arrowRef: U,
      transitionProps: {
        ...i,
        onExited: vt,
        onEntered: Te
      },
      width: f,
      withArrow: d,
      arrowSize: m,
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
      styles: C,
      unstyled: x,
      variant: Y,
      keepMounted: ae,
      keepMountedMode: fe,
      getStyles: Ce,
      resolvedStyles: ne,
      floatingStrategy: te,
      referenceHidden: K && me !== "test" ? we.floating.middlewareData.hide?.referenceHidden : !1
    },
    children: [n, he && /* @__PURE__ */ l.jsx(is, {
      transition: "fade",
      mounted: we.opened,
      duration: i?.duration || 250,
      exitDuration: i?.exitDuration || 250,
      children: (yt) => /* @__PURE__ */ l.jsx(Ga, {
        withinPortal: R,
        children: /* @__PURE__ */ l.jsx(Zl, {
          ...q,
          ...Ce("overlay", {
            className: q?.className,
            style: [yt, q?.style]
          })
        })
      })
    })]
  });
}
He.Target = Uu;
He.Dropdown = hi;
He.ContextMenu = Bu;
He.varsResolver = Wu;
He.displayName = "@mantine/core/Popover";
He.extend = (e) => e;
He.withProps = (e) => {
  const t = (n) => /* @__PURE__ */ l.jsx(He, {
    ...e,
    ...n
  });
  return t.extend = He.extend, t.displayName = `WithProps(${He.displayName})`, t;
};
const [gg, an] = Yt("ModalBase component was not found in tree");
function vg({ opened: e, transitionDuration: t }) {
  const [n, o] = p.useState(e), r = p.useRef(-1), s = Xa() ? 0 : t;
  return p.useEffect(() => (e ? (o(!0), window.clearTimeout(r.current)) : s === 0 ? o(!1) : r.current = window.setTimeout(() => o(!1), s), () => window.clearTimeout(r.current)), [e, s]), n;
}
function yg({ id: e, transitionProps: t, opened: n, trapFocus: o, closeOnEscape: r, onClose: s, returnFocus: a, handledEscapeEvents: i }) {
  const c = Bt(e), [u, f] = p.useState(!1), [h, d] = p.useState(!1), m = typeof t?.duration == "number" ? t?.duration : 200, g = vg({
    opened: n,
    transitionDuration: m
  });
  return rh("keydown", (v) => {
    v.key === "Escape" && r && !v.isComposing && n && !i?.has(v) && v.target?.getAttribute("data-mantine-stop-propagation") !== "true" && (i?.add(v), s());
  }, { capture: !0 }), ru({
    opened: n,
    shouldReturnFocus: o && a
  }), {
    _id: c,
    titleMounted: u,
    bodyMounted: h,
    shouldLockScroll: g,
    setTitleMounted: f,
    setBodyMounted: d
  };
}
var Ut = function() {
  return Ut = Object.assign || function(t) {
    for (var n, o = 1, r = arguments.length; o < r; o++) {
      n = arguments[o];
      for (var s in n) Object.prototype.hasOwnProperty.call(n, s) && (t[s] = n[s]);
    }
    return t;
  }, Ut.apply(this, arguments);
};
function qu(e, t) {
  var n = {};
  for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var r = 0, o = Object.getOwnPropertySymbols(e); r < o.length; r++)
      t.indexOf(o[r]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[r]) && (n[o[r]] = e[o[r]]);
  return n;
}
function bg(e, t, n) {
  if (n || arguments.length === 2) for (var o = 0, r = t.length, s; o < r; o++)
    (s || !(o in t)) && (s || (s = Array.prototype.slice.call(t, 0, o)), s[o] = t[o]);
  return e.concat(s || Array.prototype.slice.call(t));
}
var Lr = "right-scroll-bar-position", zr = "width-before-scroll-bar", wg = "with-scroll-bars-hidden", xg = "--removed-body-scroll-bar-size";
function Gs(e, t) {
  return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
function Sg(e, t) {
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
var Cg = typeof window < "u" ? p.useLayoutEffect : p.useEffect, qc = /* @__PURE__ */ new WeakMap();
function jg(e, t) {
  var n = Sg(null, function(o) {
    return e.forEach(function(r) {
      return Gs(r, o);
    });
  });
  return Cg(function() {
    var o = qc.get(n);
    if (o) {
      var r = new Set(o), s = new Set(e), a = n.current;
      r.forEach(function(i) {
        s.has(i) || Gs(i, null);
      }), s.forEach(function(i) {
        r.has(i) || Gs(i, a);
      });
    }
    qc.set(n, e);
  }, [e]), n;
}
function kg(e) {
  return e;
}
function Eg(e, t) {
  t === void 0 && (t = kg);
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
function Rg(e) {
  e === void 0 && (e = {});
  var t = Eg(null);
  return t.options = Ut({ async: !0, ssr: !1 }, e), t;
}
var Ku = function(e) {
  var t = e.sideCar, n = qu(e, ["sideCar"]);
  if (!t)
    throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  var o = t.read();
  if (!o)
    throw new Error("Sidecar medium not found");
  return p.createElement(o, Ut({}, n));
};
Ku.isSideCarExport = !0;
function Ng(e, t) {
  return e.useMedium(t), Ku;
}
var Xu = Rg(), Js = function() {
}, ys = p.forwardRef(function(e, t) {
  var n = p.useRef(null), o = p.useState({
    onScrollCapture: Js,
    onWheelCapture: Js,
    onTouchMoveCapture: Js
  }), r = o[0], s = o[1], a = e.forwardProps, i = e.children, c = e.className, u = e.removeScrollBar, f = e.enabled, h = e.shards, d = e.sideCar, m = e.noRelative, g = e.noIsolation, v = e.inert, w = e.allowPinchZoom, x = e.as, E = x === void 0 ? "div" : x, C = e.gapMode, k = qu(e, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]), R = d, P = jg([n, t]), S = Ut(Ut({}, k), r);
  return p.createElement(
    p.Fragment,
    null,
    f && p.createElement(R, { sideCar: Xu, removeScrollBar: u, shards: h, noRelative: m, noIsolation: g, inert: v, setCallbacks: s, allowPinchZoom: !!w, lockRef: n, gapMode: C }),
    a ? p.cloneElement(p.Children.only(i), Ut(Ut({}, S), { ref: P })) : p.createElement(E, Ut({}, S, { className: c, ref: P }), i)
  );
});
ys.defaultProps = {
  enabled: !0,
  removeScrollBar: !0,
  inert: !1
};
ys.classNames = {
  fullWidth: zr,
  zeroRight: Lr
};
var Tg = function() {
  if (typeof __webpack_nonce__ < "u")
    return __webpack_nonce__;
};
function Pg() {
  if (!document)
    return null;
  var e = document.createElement("style");
  e.type = "text/css";
  var t = Tg();
  return t && e.setAttribute("nonce", t), e;
}
function Ag(e, t) {
  e.styleSheet ? e.styleSheet.cssText = t : e.appendChild(document.createTextNode(t));
}
function Ig(e) {
  var t = document.head || document.getElementsByTagName("head")[0];
  t.appendChild(e);
}
var Mg = function() {
  var e = 0, t = null;
  return {
    add: function(n) {
      e == 0 && (t = Pg()) && (Ag(t, n), Ig(t)), e++;
    },
    remove: function() {
      e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), t = null);
    }
  };
}, Dg = function() {
  var e = Mg();
  return function(t, n) {
    p.useEffect(function() {
      return e.add(t), function() {
        e.remove();
      };
    }, [t && n]);
  };
}, Yu = function() {
  var e = Dg(), t = function(n) {
    var o = n.styles, r = n.dynamic;
    return e(o, r), null;
  };
  return t;
}, Og = {
  left: 0,
  top: 0,
  right: 0,
  gap: 0
}, Zs = function(e) {
  return parseInt(e || "", 10) || 0;
}, $g = function(e) {
  var t = window.getComputedStyle(document.body), n = t[e === "padding" ? "paddingLeft" : "marginLeft"], o = t[e === "padding" ? "paddingTop" : "marginTop"], r = t[e === "padding" ? "paddingRight" : "marginRight"];
  return [Zs(n), Zs(o), Zs(r)];
}, Lg = function(e) {
  if (e === void 0 && (e = "margin"), typeof window > "u")
    return Og;
  var t = $g(e), n = document.documentElement.clientWidth, o = window.innerWidth;
  return {
    left: t[0],
    top: t[1],
    right: t[2],
    gap: Math.max(0, o - n + t[2] - t[0])
  };
}, zg = Yu(), ao = "data-scroll-locked", _g = function(e, t, n, o) {
  var r = e.left, s = e.top, a = e.right, i = e.gap;
  return n === void 0 && (n = "margin"), `
  .`.concat(wg, ` {
   overflow: hidden `).concat(o, `;
   padding-right: `).concat(i, "px ").concat(o, `;
  }
  body[`).concat(ao, `] {
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
  
  .`).concat(Lr, ` {
    right: `).concat(i, "px ").concat(o, `;
  }
  
  .`).concat(zr, ` {
    margin-right: `).concat(i, "px ").concat(o, `;
  }
  
  .`).concat(Lr, " .").concat(Lr, ` {
    right: 0 `).concat(o, `;
  }
  
  .`).concat(zr, " .").concat(zr, ` {
    margin-right: 0 `).concat(o, `;
  }
  
  body[`).concat(ao, `] {
    `).concat(xg, ": ").concat(i, `px;
  }
`);
}, Kc = function() {
  var e = parseInt(document.body.getAttribute(ao) || "0", 10);
  return isFinite(e) ? e : 0;
}, Fg = function() {
  p.useEffect(function() {
    return document.body.setAttribute(ao, (Kc() + 1).toString()), function() {
      var e = Kc() - 1;
      e <= 0 ? document.body.removeAttribute(ao) : document.body.setAttribute(ao, e.toString());
    };
  }, []);
}, Bg = function(e) {
  var t = e.noRelative, n = e.noImportant, o = e.gapMode, r = o === void 0 ? "margin" : o;
  Fg();
  var s = p.useMemo(function() {
    return Lg(r);
  }, [r]);
  return p.createElement(zg, { styles: _g(s, !t, r, n ? "" : "!important") });
}, Sa = !1;
if (typeof window < "u")
  try {
    var Pr = Object.defineProperty({}, "passive", {
      get: function() {
        return Sa = !0, !0;
      }
    });
    window.addEventListener("test", Pr, Pr), window.removeEventListener("test", Pr, Pr);
  } catch {
    Sa = !1;
  }
var Gn = Sa ? { passive: !1 } : !1, Vg = function(e) {
  return e.tagName === "TEXTAREA";
}, Gu = function(e, t) {
  if (!(e instanceof Element))
    return !1;
  var n = window.getComputedStyle(e);
  return (
    // not-not-scrollable
    n[t] !== "hidden" && // contains scroll inside self
    !(n.overflowY === n.overflowX && !Vg(e) && n[t] === "visible")
  );
}, Hg = function(e) {
  return Gu(e, "overflowY");
}, Ug = function(e) {
  return Gu(e, "overflowX");
}, Xc = function(e, t) {
  var n = t.ownerDocument, o = t;
  do {
    typeof ShadowRoot < "u" && o instanceof ShadowRoot && (o = o.host);
    var r = Ju(e, o);
    if (r) {
      var s = Zu(e, o), a = s[1], i = s[2];
      if (a > i)
        return !0;
    }
    o = o.parentNode;
  } while (o && o !== n.body);
  return !1;
}, Wg = function(e) {
  var t = e.scrollTop, n = e.scrollHeight, o = e.clientHeight;
  return [
    t,
    n,
    o
  ];
}, qg = function(e) {
  var t = e.scrollLeft, n = e.scrollWidth, o = e.clientWidth;
  return [
    t,
    n,
    o
  ];
}, Ju = function(e, t) {
  return e === "v" ? Hg(t) : Ug(t);
}, Zu = function(e, t) {
  return e === "v" ? Wg(t) : qg(t);
}, Kg = function(e, t) {
  return e === "h" && t === "rtl" ? -1 : 1;
}, Xg = function(e, t, n, o, r) {
  var s = Kg(e, window.getComputedStyle(t).direction), a = s * o, i = n.target, c = t.contains(i), u = !1, f = a > 0, h = 0, d = 0;
  do {
    if (!i)
      break;
    var m = Zu(e, i), g = m[0], v = m[1], w = m[2], x = v - w - s * g;
    (g || x) && Ju(e, i) && (h += x, d += g);
    var E = i.parentNode;
    i = E && E.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? E.host : E;
  } while (
    // portaled content
    !c && i !== document.body || // self content
    c && (t.contains(i) || t === i)
  );
  return (f && Math.abs(h) < 1 || !f && Math.abs(d) < 1) && (u = !0), u;
}, Ar = function(e) {
  return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, Yc = function(e) {
  return [e.deltaX, e.deltaY];
}, Gc = function(e) {
  return e && "current" in e ? e.current : e;
}, Yg = function(e, t) {
  return e[0] === t[0] && e[1] === t[1];
}, Gg = function(e) {
  return `
  .block-interactivity-`.concat(e, ` {pointer-events: none;}
  .allow-interactivity-`).concat(e, ` {pointer-events: all;}
`);
}, Jg = 0, Jn = [];
function Zg(e) {
  var t = p.useRef([]), n = p.useRef([0, 0]), o = p.useRef(), r = p.useState(Jg++)[0], s = p.useState(Yu)[0], a = p.useRef(e);
  p.useEffect(function() {
    a.current = e;
  }, [e]), p.useEffect(function() {
    if (e.inert) {
      document.body.classList.add("block-interactivity-".concat(r));
      var v = bg([e.lockRef.current], (e.shards || []).map(Gc), !0).filter(Boolean);
      return v.forEach(function(w) {
        return w.classList.add("allow-interactivity-".concat(r));
      }), function() {
        document.body.classList.remove("block-interactivity-".concat(r)), v.forEach(function(w) {
          return w.classList.remove("allow-interactivity-".concat(r));
        });
      };
    }
  }, [e.inert, e.lockRef.current, e.shards]);
  var i = p.useCallback(function(v, w) {
    if ("touches" in v && v.touches.length === 2 || v.type === "wheel" && v.ctrlKey)
      return !a.current.allowPinchZoom;
    var x = Ar(v), E = n.current, C = "deltaX" in v ? v.deltaX : E[0] - x[0], k = "deltaY" in v ? v.deltaY : E[1] - x[1], R, P = v.target, S = Math.abs(C) > Math.abs(k) ? "h" : "v";
    if ("touches" in v && S === "h" && P.type === "range")
      return !1;
    var y = window.getSelection(), N = y && y.anchorNode, D = N ? N === P || N.contains(P) : !1;
    if (D)
      return !1;
    var O = Xc(S, P);
    if (!O)
      return !0;
    if (O ? R = S : (R = S === "v" ? "h" : "v", O = Xc(S, P)), !O)
      return !1;
    if (!o.current && "changedTouches" in v && (C || k) && (o.current = R), !R)
      return !0;
    var z = o.current || R;
    return Xg(z, w, v, z === "h" ? C : k);
  }, []), c = p.useCallback(function(v) {
    var w = v;
    if (!(!Jn.length || Jn[Jn.length - 1] !== s)) {
      var x = "deltaY" in w ? Yc(w) : Ar(w), E = t.current.filter(function(R) {
        return R.name === w.type && (R.target === w.target || w.target === R.shadowParent) && Yg(R.delta, x);
      })[0];
      if (E && E.should) {
        w.cancelable && w.preventDefault();
        return;
      }
      if (!E) {
        var C = (a.current.shards || []).map(Gc).filter(Boolean).filter(function(R) {
          return R.contains(w.target);
        }), k = C.length > 0 ? i(w, C[0]) : !a.current.noIsolation;
        k && w.cancelable && w.preventDefault();
      }
    }
  }, []), u = p.useCallback(function(v, w, x, E) {
    var C = { name: v, delta: w, target: x, should: E, shadowParent: Qg(x) };
    t.current.push(C), setTimeout(function() {
      t.current = t.current.filter(function(k) {
        return k !== C;
      });
    }, 1);
  }, []), f = p.useCallback(function(v) {
    n.current = Ar(v), o.current = void 0;
  }, []), h = p.useCallback(function(v) {
    u(v.type, Yc(v), v.target, i(v, e.lockRef.current));
  }, []), d = p.useCallback(function(v) {
    u(v.type, Ar(v), v.target, i(v, e.lockRef.current));
  }, []);
  p.useEffect(function() {
    return Jn.push(s), e.setCallbacks({
      onScrollCapture: h,
      onWheelCapture: h,
      onTouchMoveCapture: d
    }), document.addEventListener("wheel", c, Gn), document.addEventListener("touchmove", c, Gn), document.addEventListener("touchstart", f, Gn), function() {
      Jn = Jn.filter(function(v) {
        return v !== s;
      }), document.removeEventListener("wheel", c, Gn), document.removeEventListener("touchmove", c, Gn), document.removeEventListener("touchstart", f, Gn);
    };
  }, []);
  var m = e.removeScrollBar, g = e.inert;
  return p.createElement(
    p.Fragment,
    null,
    g ? p.createElement(s, { styles: Gg(r) }) : null,
    m ? p.createElement(Bg, { noRelative: e.noRelative, gapMode: e.gapMode }) : null
  );
}
function Qg(e) {
  for (var t = null; e !== null; )
    e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
  return t;
}
const ev = Ng(Xu, Zg);
var Qu = p.forwardRef(function(e, t) {
  return p.createElement(ys, Ut({}, e, { ref: t, sideCar: ev }));
});
Qu.classNames = ys.classNames;
function ed({ keepMounted: e, keepMountedMode: t = "activity", opened: n, onClose: o, id: r, transitionProps: s, onExitTransitionEnd: a, onEnterTransitionEnd: i, trapFocus: c, closeOnEscape: u, returnFocus: f, closeOnClickOutside: h, withinPortal: d, portalProps: m, lockScroll: g, children: v, zIndex: w, shadow: x, padding: E, __vars: C, unstyled: k, removeScrollProps: R, __handledEscapeEvents: P, ...S }) {
  const { _id: y, titleMounted: N, bodyMounted: D, shouldLockScroll: O, setTitleMounted: z, setBodyMounted: _ } = yg({
    id: r,
    transitionProps: s,
    opened: n,
    trapFocus: c,
    closeOnEscape: u,
    onClose: o,
    returnFocus: f,
    handledEscapeEvents: P
  }), { key: F, ...$ } = R || {};
  return /* @__PURE__ */ l.jsx(Ga, {
    ...m,
    withinPortal: d,
    children: /* @__PURE__ */ l.jsx(gg, {
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
      children: /* @__PURE__ */ l.jsx(Qu, {
        enabled: O && g,
        ...$,
        children: /* @__PURE__ */ l.jsx(Q, {
          ...S,
          id: y,
          __vars: {
            ...C,
            "--mb-z-index": (w || So("modal")).toString(),
            "--mb-shadow": Kl(x),
            "--mb-padding": Uo(E)
          },
          children: v
        })
      }, F)
    })
  });
}
ed.displayName = "@mantine/core/ModalBase";
function tv() {
  const e = an();
  return p.useEffect(() => (e.setBodyMounted(!0), () => e.setBodyMounted(!1)), []), e.getBodyId();
}
var po = {
  title: "m_615af6c9",
  header: "m_b5489c3c",
  inner: "m_60c222c7",
  content: "m_fd1ab0aa",
  close: "m_606cb269",
  body: "m_5df29311"
};
function td({ className: e, ...t }) {
  const n = tv(), o = an();
  return /* @__PURE__ */ l.jsx(Q, {
    id: n,
    className: nn({ [po.body]: !o.unstyled }, e),
    ...t
  });
}
td.displayName = "@mantine/core/ModalBaseBody";
function nd({ className: e, onClick: t, ...n }) {
  const o = an();
  return /* @__PURE__ */ l.jsx(ei, {
    ...n,
    onClick: (r) => {
      o.onClose(), t?.(r);
    },
    className: nn({ [po.close]: !o.unstyled }, e),
    unstyled: o.unstyled
  });
}
nd.displayName = "@mantine/core/ModalBaseCloseButton";
function od({ transitionProps: e, className: t, innerProps: n, onKeyDown: o, style: r, ref: s, ...a }) {
  const i = an();
  return /* @__PURE__ */ l.jsx(is, {
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
      className: nn({ [po.inner]: !i.unstyled }, n.className),
      children: /* @__PURE__ */ l.jsx(vs, {
        active: i.opened && i.trapFocus,
        innerRef: s,
        children: /* @__PURE__ */ l.jsx(fo, {
          ...a,
          component: "section",
          role: "dialog",
          tabIndex: -1,
          "aria-modal": !0,
          "aria-describedby": i.bodyMounted ? i.getBodyId() : void 0,
          "aria-labelledby": i.titleMounted ? i.getTitleId() : void 0,
          style: [r, c],
          className: nn({ [po.content]: !i.unstyled }, t),
          unstyled: i.unstyled,
          children: a.children
        })
      })
    })
  });
}
od.displayName = "@mantine/core/ModalBaseContent";
function rd({ className: e, ...t }) {
  const n = an();
  return /* @__PURE__ */ l.jsx(Q, {
    component: "header",
    className: nn({ [po.header]: !n.unstyled }, e),
    ...t
  });
}
rd.displayName = "@mantine/core/ModalBaseHeader";
const nv = {
  duration: 200,
  timingFunction: "ease",
  transition: "fade"
};
function ov(e) {
  const t = an();
  return {
    ...nv,
    ...t.transitionProps,
    ...e
  };
}
function sd({ onClick: e, transitionProps: t, style: n, visible: o, ...r }) {
  const s = an(), a = ov(t);
  return /* @__PURE__ */ l.jsx(is, {
    mounted: o !== void 0 ? o : s.opened,
    ...a,
    transition: "fade",
    children: (i) => /* @__PURE__ */ l.jsx(Zl, {
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
sd.displayName = "@mantine/core/ModalBaseOverlay";
function rv() {
  const e = an();
  return p.useEffect(() => (e.setTitleMounted(!0), () => e.setTitleMounted(!1)), []), e.getTitleId();
}
function ad({ className: e, ...t }) {
  const n = rv(), o = an();
  return /* @__PURE__ */ l.jsx(Q, {
    component: "h2",
    className: nn({ [po.title]: !o.unstyled }, e),
    id: n,
    ...t
  });
}
ad.displayName = "@mantine/core/ModalBaseTitle";
function sv({ children: e }) {
  return /* @__PURE__ */ l.jsx(l.Fragment, { children: e });
}
const av = {
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
var id = { root: "m_8bffd616" };
const io = Xl((e) => {
  const t = Z("Flex", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, gap: c, rowGap: u, columnGap: f, align: h, justify: d, wrap: m, direction: g, attributes: v, ...w } = t, x = Me({
    name: "Flex",
    classes: id,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: v,
    vars: i
  }), E = ir(), C = kp(), k = Ep({
    styleProps: {
      gap: c,
      rowGap: u,
      columnGap: f,
      align: h,
      justify: d,
      wrap: m,
      direction: g
    },
    theme: E,
    data: av
  }), R = Rp(), P = R && k.hasResponsiveStyles ? Np(k.styles, k.media) : C;
  return /* @__PURE__ */ l.jsxs(l.Fragment, { children: [k.hasResponsiveStyles && /* @__PURE__ */ l.jsx(Tp, {
    selector: `.${P}`,
    styles: k.styles,
    media: k.media,
    deduplicate: R
  }), /* @__PURE__ */ l.jsx(Q, {
    ...x("root", {
      className: P,
      style: Pp(k.inlineStyles)
    }),
    ...w
  })] });
});
io.classes = id;
io.displayName = "@mantine/core/Flex";
function iv(e, t) {
  if (!t || !e) return !1;
  let n = t.parentNode;
  for (; n != null; ) {
    if (n === e) return !0;
    n = n.parentNode;
  }
  return !1;
}
function cv({ target: e, parent: t, ref: n, displayAfterTransitionEnd: o, onTransitionStart: r, onTransitionEnd: s }) {
  const a = p.useRef(-1), i = p.useRef(e), [c, u] = p.useState(!1), [f, h] = p.useState(typeof o == "boolean" ? o : !1), d = () => {
    if (!e || !t || !n.current) return;
    const w = e.getBoundingClientRect(), x = t.getBoundingClientRect(), E = t.offsetWidth === 0 ? 1 : x.width / t.offsetWidth, C = t.offsetHeight === 0 ? 1 : x.height / t.offsetHeight, k = window.getComputedStyle(e), R = window.getComputedStyle(t), P = mn(k.borderTopWidth) + mn(R.borderTopWidth), S = mn(k.borderLeftWidth) + mn(R.borderLeftWidth), y = {
      top: (w.top - x.top) / C - P,
      left: (w.left - x.left) / E - S,
      width: w.width / E,
      height: w.height / C
    };
    n.current.style.transform = `translateY(${y.top}px) translateX(${y.left}px)`, n.current.style.width = `${y.width}px`, n.current.style.height = `${y.height}px`;
  }, m = () => {
    window.clearTimeout(a.current), n.current && (n.current.style.transitionDuration = "0ms"), d(), a.current = window.setTimeout(() => {
      n.current && (n.current.style.transitionDuration = "");
    }, 30);
  }, g = p.useRef(null), v = p.useRef(null);
  return p.useEffect(() => {
    if (c && i.current !== e && r && r(), i.current = e, d(), e)
      return g.current = new ResizeObserver(m), g.current.observe(e), t && (v.current = new ResizeObserver(m), v.current.observe(t)), () => {
        g.current?.disconnect(), v.current?.disconnect();
      };
  }, [t, e]), p.useEffect(() => {
    if (t) {
      const w = (x) => {
        iv(x.target, t) && (m(), h(!1));
      };
      return t.addEventListener("transitionend", w), () => {
        t.removeEventListener("transitionend", w);
      };
    }
  }, [t]), p.useEffect(() => {
    if (n.current && s) {
      const w = (x) => {
        x.propertyName === "transform" && s();
      };
      return n.current.addEventListener("transitionend", w), () => {
        n.current?.removeEventListener("transitionend", w);
      };
    }
  }, [s]), ih(() => {
    uu() !== "test" && u(!0);
  }, 20, { autoInvoke: !0 }), dh((w) => {
    w.forEach((x) => {
      x.type === "attributes" && x.attributeName === "dir" && m();
    });
  }, {
    attributes: !0,
    attributeFilter: ["dir"]
  }, () => document.documentElement), {
    initialized: c,
    hidden: f
  };
}
var cd = { root: "m_96b553a6" };
const ld = ze((e, { transitionDuration: t }, { shouldReduceMotion: n }) => ({ root: { "--transition-duration": e.respectReducedMotion && n ? "0ms" : typeof t == "number" ? `${t}ms` : t || "150ms" } })), bs = se((e) => {
  const t = Z("FloatingIndicator", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, target: c, parent: u, transitionDuration: f, mod: h, displayAfterTransitionEnd: d, onTransitionStart: m, onTransitionEnd: g, attributes: v, ref: w, ...x } = t, E = Xa(), C = Me({
    name: "FloatingIndicator",
    classes: cd,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: v,
    vars: i,
    varsResolver: ld,
    stylesCtx: { shouldReduceMotion: E }
  }), k = p.useRef(null), { initialized: R, hidden: P } = cv({
    target: c,
    parent: u,
    ref: k,
    displayAfterTransitionEnd: d,
    onTransitionStart: m,
    onTransitionEnd: g
  }), S = Ve(w, k);
  return !c || !u ? null : /* @__PURE__ */ l.jsx(Q, {
    ref: S,
    mod: [{
      initialized: R,
      hidden: P
    }, h],
    ...C("root"),
    ...x
  });
});
bs.displayName = "@mantine/core/FloatingIndicator";
bs.classes = cd;
bs.varsResolver = ld;
const [lv, mi] = Yt("Accordion component was not found in the tree");
function gi({ style: e, size: t = 16, ...n }) {
  return /* @__PURE__ */ l.jsx("svg", {
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
    children: /* @__PURE__ */ l.jsx("path", {
      d: "M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z",
      fill: "currentColor",
      fillRule: "evenodd",
      clipRule: "evenodd"
    })
  });
}
gi.displayName = "@mantine/core/AccordionChevron";
const [uv, ud] = Yt("Accordion.Item component was not found in the tree");
var dr = {
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
const vi = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, chevron: a, icon: i, onClick: c, onKeyDown: u, children: f, disabled: h, mod: d, ...m } = Z("AccordionControl", null, e), { value: g } = ud(), v = mi(), w = v.isItemActive(g), x = typeof v.order == "number", E = `h${v.order}`, C = /* @__PURE__ */ l.jsxs($n, {
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
        disabled: h
      },
      d
    ],
    onClick: (k) => {
      c?.(k), v.onChange(g);
    },
    type: "button",
    disabled: h,
    "aria-expanded": w,
    "aria-controls": v.getRegionId(g),
    id: v.getControlId(g),
    onKeyDown: nu({
      siblingSelector: "[data-accordion-control]",
      parentSelector: "[data-accordion]",
      activateOnFocus: !1,
      loop: v.loop,
      orientation: "vertical",
      onKeyDown: u
    }),
    ...m,
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
  return x ? /* @__PURE__ */ l.jsx(E, {
    ...v.getStyles("itemTitle", {
      classNames: t,
      styles: r
    }),
    children: C
  }) : C;
});
vi.displayName = "@mantine/core/AccordionControl";
vi.classes = dr;
const yi = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, value: a, mod: i, ...c } = Z("AccordionItem", null, e), u = mi();
  return /* @__PURE__ */ l.jsx(uv, {
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
yi.displayName = "@mantine/core/AccordionItem";
yi.classes = dr;
const bi = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, children: a, keepMounted: i, keepMountedMode: c, ...u } = Z("AccordionPanel", null, e), { value: f } = ud(), h = mi();
  return /* @__PURE__ */ l.jsx(pu, {
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
    keepMountedMode: c ?? h.keepMountedMode,
    ...u,
    children: /* @__PURE__ */ l.jsx("div", {
      ...h.getStyles("content", {
        classNames: t,
        styles: r
      }),
      children: a
    })
  });
});
bi.displayName = "@mantine/core/AccordionPanel";
bi.classes = dr;
const dv = {
  multiple: !1,
  loop: !0,
  disableChevronRotation: !1,
  disableCollapse: !1,
  chevronPosition: "right",
  variant: "default",
  chevronSize: "auto",
  chevronIconSize: 16,
  keepMountedMode: "activity"
}, dd = ze((e, { transitionDuration: t, chevronSize: n, radius: o }) => ({ root: {
  "--accordion-transition-duration": t === void 0 ? void 0 : `${t}ms`,
  "--accordion-chevron-size": n === void 0 ? void 0 : Ae(n),
  "--accordion-radius": o === void 0 ? void 0 : Tt(o)
} })), Pe = En((e) => {
  const t = Z("Accordion", dv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, children: c, multiple: u, value: f, defaultValue: h, onChange: d, id: m, loop: g, transitionDuration: v, disableChevronRotation: w, disableCollapse: x, chevronPosition: E, chevronSize: C, order: k, chevron: R, variant: P, radius: S, chevronIconSize: y, attributes: N, keepMounted: D, keepMountedMode: O, ...z } = t, _ = Bt(m), [F, $] = Ze({
    value: f,
    defaultValue: h,
    finalValue: u ? [] : null,
    onChange: d
  }), M = (A) => Array.isArray(F) ? F.includes(A) : A === F, L = (A) => {
    if (!Array.isArray(F) && x && A === F) return;
    const B = Array.isArray(F) ? F.includes(A) ? F.filter((H) => H !== A) : [...F, A] : A === F ? null : A;
    $(B);
  }, I = Me({
    name: "Accordion",
    classes: dr,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: N,
    vars: i,
    varsResolver: dd
  });
  return /* @__PURE__ */ l.jsx(lv, {
    value: {
      isItemActive: M,
      onChange: L,
      getControlId: qr(`${_}-control`, "Accordion.Item component was rendered with invalid value or without value"),
      getRegionId: qr(`${_}-panel`, "Accordion.Item component was rendered with invalid value or without value"),
      chevron: R === null ? null : R || /* @__PURE__ */ l.jsx(gi, { size: y }),
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
Pe.classes = dr;
Pe.varsResolver = dd;
Pe.displayName = "@mantine/core/Accordion";
Pe.Item = yi;
Pe.Panel = bi;
Pe.Control = vi;
Pe.Chevron = gi;
function fd(e) {
  return typeof e == "string" ? {
    value: e,
    label: e
  } : typeof e == "object" && "value" in e && !("label" in e) ? {
    value: e.value,
    label: `${e.value}`,
    disabled: e.disabled
  } : typeof e == "object" && "group" in e ? {
    group: e.group,
    items: e.items.map((t) => fd(t))
  } : typeof e == "number" || typeof e == "bigint" || typeof e == "boolean" ? {
    value: e,
    label: `${e}`
  } : e;
}
function pd(e) {
  return e ? e.map((t) => fd(t)) : [];
}
function hd(e) {
  return e.reduce((t, n) => "group" in n ? {
    ...t,
    ...hd(n.items)
  } : (t[`${n.value}`] = n, t), {});
}
var ut = {
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
const fv = { error: null }, md = ze((e, { size: t, color: n }) => ({ chevron: {
  "--combobox-chevron-size": _e(t, "combobox-chevron-size"),
  "--combobox-chevron-color": n ? at(n, e) : void 0
} })), fr = se((e) => {
  const t = Z("ComboboxChevron", fv, e), { size: n, error: o, style: r, className: s, classNames: a, styles: i, unstyled: c, vars: u, attributes: f, mod: h, ...d } = t, m = Me({
    name: "ComboboxChevron",
    classes: ut,
    props: t,
    style: r,
    className: s,
    classNames: a,
    styles: i,
    unstyled: c,
    vars: u,
    varsResolver: md,
    attributes: f,
    rootSelector: "chevron"
  });
  return /* @__PURE__ */ l.jsx(Q, {
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
    children: /* @__PURE__ */ l.jsx("path", {
      d: "M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z",
      fill: "currentColor",
      fillRule: "evenodd",
      clipRule: "evenodd"
    })
  });
});
fr.classes = ut;
fr.varsResolver = md;
fr.displayName = "@mantine/core/ComboboxChevron";
const [pv, Ct] = Yt("Combobox component was not found in tree");
function gd({ onMouseDown: e, onClick: t, onClear: n, ...o }) {
  return /* @__PURE__ */ l.jsx(Rt.ClearButton, {
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
gd.displayName = "@mantine/core/ComboboxClearButton";
const wi = se((e) => {
  const { classNames: t, styles: n, className: o, style: r, hidden: s, ...a } = Z("ComboboxDropdown", null, e), i = Ct();
  return /* @__PURE__ */ l.jsx(He.Dropdown, {
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
wi.classes = ut;
wi.displayName = "@mantine/core/ComboboxDropdown";
const hv = { refProp: "ref" }, vd = se((e) => {
  const { children: t, refProp: n, ref: o } = Z("ComboboxDropdownTarget", hv, e);
  if (Ct(), !Jl(t)) throw new Error("Combobox.DropdownTarget component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  return /* @__PURE__ */ l.jsx(He.Target, {
    ref: o,
    refProp: n,
    children: t
  });
});
vd.displayName = "@mantine/core/ComboboxDropdownTarget";
const xi = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ComboboxEmpty", null, e), i = Ct();
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
xi.classes = ut;
xi.displayName = "@mantine/core/ComboboxEmpty";
function Si({ onKeyDown: e, onClick: t, withKeyboardNavigation: n, withAriaAttributes: o, withExpandedAttribute: r, targetType: s, autoComplete: a }) {
  const i = Ct(), [c, u] = p.useState(null), f = (m) => {
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
      "aria-activedescendant": i.store.dropdownOpened && c || void 0,
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
const mv = {
  refProp: "ref",
  targetType: "input",
  withKeyboardNavigation: !0,
  withAriaAttributes: !0,
  withExpandedAttribute: !1,
  autoComplete: "off"
}, yd = se((e) => {
  const { children: t, refProp: n, withKeyboardNavigation: o, withAriaAttributes: r, withExpandedAttribute: s, targetType: a, autoComplete: i, ref: c, ...u } = Z("ComboboxEventsTarget", mv, e), f = lr(t);
  if (!f) throw new Error("Combobox.EventsTarget component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  const h = Ct(), d = Si({
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
    [n]: Ve(c, h.store.targetRef, fu(f))
  });
});
yd.displayName = "@mantine/core/ComboboxEventsTarget";
const Ci = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ComboboxFooter", null, e), i = Ct();
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
Ci.classes = ut;
Ci.displayName = "@mantine/core/ComboboxFooter";
const ji = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, children: a, label: i, id: c, ...u } = Z("ComboboxGroup", null, e), f = Ct(), h = Bt(c), d = i != null && i !== !1 && i !== "";
  return /* @__PURE__ */ l.jsxs(Q, {
    role: "group",
    "aria-labelledby": d ? h : void 0,
    ...f.getStyles("group", {
      className: n,
      classNames: t,
      style: o,
      styles: r
    }),
    ...u,
    children: [d && /* @__PURE__ */ l.jsx("div", {
      id: h,
      ...f.getStyles("groupLabel", {
        classNames: t,
        styles: r
      }),
      children: i
    }), a]
  });
});
ji.classes = ut;
ji.displayName = "@mantine/core/ComboboxGroup";
const ki = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ComboboxHeader", null, e), i = Ct();
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
ki.classes = ut;
ki.displayName = "@mantine/core/ComboboxHeader";
function bd({ value: e, valuesDivider: t = ",", ...n }) {
  return /* @__PURE__ */ l.jsx("input", {
    type: "hidden",
    value: Array.isArray(e) ? e.join(t) : e ? `${e}` : "",
    ...n
  });
}
bd.displayName = "@mantine/core/ComboboxHiddenInput";
const Ei = se((e) => {
  const t = Z("ComboboxOption", null, e), { classNames: n, className: o, style: r, styles: s, vars: a, onClick: i, id: c, active: u, onMouseDown: f, onMouseOver: h, disabled: d, selected: m, mod: g, ...v } = t, w = Ct(), x = p.useId(), E = c || x;
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
        "combobox-disabled": d,
        "combobox-selected": m
      },
      g
    ],
    role: "option",
    onClick: (C) => {
      d ? C.preventDefault() : (w.onOptionSubmit?.(t.value, t), i?.(C));
    },
    onMouseDown: (C) => {
      C.preventDefault(), f?.(C);
    },
    onMouseOver: (C) => {
      w.resetSelectionOnOptionHover && w.store.resetSelectedOption(), h?.(C);
    }
  });
});
Ei.classes = ut;
Ei.displayName = "@mantine/core/ComboboxOption";
const Ri = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, id: s, onMouseDown: a, labelledBy: i, ...c } = Z("ComboboxOptions", null, e), u = Ct(), f = Bt(s);
  return p.useEffect(() => {
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
    onMouseDown: (h) => {
      h.preventDefault(), a?.(h);
    }
  });
});
Ri.classes = ut;
Ri.displayName = "@mantine/core/ComboboxOptions";
const gv = {
  withAriaAttributes: !0,
  withKeyboardNavigation: !0
}, Ni = se((e) => {
  const { classNames: t, styles: n, unstyled: o, vars: r, withAriaAttributes: s, onKeyDown: a, onClick: i, withKeyboardNavigation: c, size: u, ref: f, ...h } = Z("ComboboxSearch", gv, e), d = Ct(), m = d.getStyles("search"), g = Si({
    targetType: "input",
    withAriaAttributes: s,
    withKeyboardNavigation: c,
    withExpandedAttribute: !1,
    onKeyDown: a,
    onClick: i,
    autoComplete: "off"
  });
  return /* @__PURE__ */ l.jsx(Rt, {
    ref: Ve(f, d.store.searchRef),
    classNames: [{ input: m.className }, t],
    styles: [{ input: m.style }, n],
    size: u || d.size,
    ...g,
    ...h,
    __staticSelector: "Combobox"
  });
});
Ni.classes = ut;
Ni.displayName = "@mantine/core/ComboboxSearch";
const vv = {
  refProp: "ref",
  targetType: "input",
  withKeyboardNavigation: !0,
  withAriaAttributes: !0,
  withExpandedAttribute: !1,
  autoComplete: "off"
}, wd = se((e) => {
  const { children: t, refProp: n, withKeyboardNavigation: o, withAriaAttributes: r, withExpandedAttribute: s, targetType: a, autoComplete: i, ref: c, ...u } = Z("ComboboxTarget", vv, e), f = lr(t);
  if (!f) throw new Error("Combobox.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  const h = Ct(), d = Si({
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
  return /* @__PURE__ */ l.jsx(He.Target, {
    refProp: n,
    ref: Ve(c, h.store.targetRef),
    children: m
  });
});
wd.displayName = "@mantine/core/ComboboxTarget";
function yv(e, t, n) {
  for (let o = e - 1; o >= 0; o -= 1) if (!t[o].hasAttribute("data-combobox-disabled")) return o;
  if (n) {
    for (let o = t.length - 1; o > -1; o -= 1) if (!t[o].hasAttribute("data-combobox-disabled")) return o;
  }
  return e;
}
function bv(e, t, n) {
  for (let o = e + 1; o < t.length; o += 1) if (!t[o].hasAttribute("data-combobox-disabled")) return o;
  if (n) {
    for (let o = 0; o < t.length; o += 1) if (!t[o].hasAttribute("data-combobox-disabled")) return o;
  }
  return e;
}
function wv(e) {
  for (let t = 0; t < e.length; t += 1) if (!e[t].hasAttribute("data-combobox-disabled")) return t;
  return -1;
}
function Ti({ defaultOpened: e, opened: t, onOpenedChange: n, onDropdownClose: o, onDropdownOpen: r, loop: s = !0, scrollBehavior: a = "instant" } = {}) {
  const [i, c] = Ze({
    value: t,
    defaultValue: e,
    finalValue: !1,
    onChange: n
  }), u = p.useRef(null), f = p.useRef(-1), h = p.useRef(null), d = p.useRef(null), m = p.useRef(-1), g = p.useRef(-1), v = p.useRef(-1), w = p.useCallback((M = "unknown") => {
    i || (c(!0), r?.(M));
  }, [
    c,
    r,
    i
  ]), x = p.useCallback((M = "unknown") => {
    i && (c(!1), o?.(M));
  }, [
    c,
    o,
    i
  ]), E = p.useCallback((M = "unknown") => {
    i ? x(M) : w(M);
  }, [
    x,
    w,
    i
  ]), C = p.useCallback(() => {
    const M = Ht(d.current);
    Or(`#${u.current} [data-combobox-selected]`, M)?.removeAttribute("data-combobox-selected");
  }, []), k = p.useCallback((M) => {
    const L = Ht(d.current), I = Or(`#${u.current}`, L), A = I ? Jt("[data-combobox-option]", I) : null;
    if (!A) return null;
    const B = M >= A.length ? 0 : M < 0 ? A.length - 1 : M;
    return f.current = B, A?.[B] && !A[B].hasAttribute("data-combobox-disabled") ? (C(), A[B].setAttribute("data-combobox-selected", "true"), A[B].scrollIntoView({
      block: "nearest",
      behavior: a
    }), A[B].id) : null;
  }, [a, C]), R = p.useCallback(() => {
    const M = Ht(d.current), L = Or(`#${u.current} [data-combobox-active]`, M);
    if (L) {
      const I = Jt(`#${u.current} [data-combobox-option]`, M).findIndex((A) => A === L);
      return k(I);
    }
    return k(0);
  }, [k]), P = p.useCallback(() => {
    const M = Ht(d.current), L = Jt(`#${u.current} [data-combobox-option]`, M);
    return k(bv(f.current, L, s));
  }, [k, s]), S = p.useCallback(() => {
    const M = Ht(d.current), L = Jt(`#${u.current} [data-combobox-option]`, M);
    return k(yv(f.current, L, s));
  }, [k, s]), y = p.useCallback(() => {
    const M = Ht(d.current), L = Jt(`#${u.current} [data-combobox-option]`, M);
    return k(wv(L));
  }, [k]), N = p.useCallback((M = "selected", L) => {
    if (typeof M == "number") {
      f.current = M;
      const I = Ht(d.current), A = Jt(`#${u.current} [data-combobox-option]`, I);
      L?.scrollIntoView && A[M]?.scrollIntoView({
        block: "nearest",
        behavior: a
      });
      return;
    }
    v.current = window.setTimeout(() => {
      const I = Ht(d.current), A = Jt(`#${u.current} [data-combobox-option]`, I), B = A.findIndex((H) => H.hasAttribute(`data-combobox-${M}`));
      f.current = B, L?.scrollIntoView && A[B]?.scrollIntoView({
        block: "nearest",
        behavior: a
      });
    }, 0);
  }, []), D = p.useCallback(() => {
    f.current = -1, C();
  }, [C]), O = p.useCallback(() => {
    const M = Ht(d.current);
    Jt(`#${u.current} [data-combobox-option]`, M)?.[f.current]?.click();
  }, []), z = p.useCallback((M) => {
    u.current = M;
  }, []), _ = p.useCallback(() => {
    m.current = window.setTimeout(() => h.current?.focus(), 0);
  }, []), F = p.useCallback(() => {
    g.current = window.setTimeout(() => d.current?.focus(), 0);
  }, []), $ = p.useCallback(() => f.current, []);
  return p.useEffect(() => () => {
    window.clearTimeout(m.current), window.clearTimeout(g.current), window.clearTimeout(v.current);
  }, []), {
    dropdownOpened: i,
    openDropdown: w,
    closeDropdown: x,
    toggleDropdown: E,
    selectedOptionIndex: f.current,
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
    searchRef: h,
    focusSearchInput: _,
    targetRef: d,
    focusTarget: F
  };
}
const xv = {
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
}, xd = ze((e, { size: t, dropdownPadding: n }) => ({
  options: {
    "--combobox-option-fz": Wr(t),
    "--combobox-option-padding": _e(t, "combobox-option-padding")
  },
  dropdown: {
    "--combobox-padding": n === void 0 ? void 0 : Ae(n),
    "--combobox-option-fz": Wr(t),
    "--combobox-option-padding": _e(t, "combobox-option-padding")
  }
})), xe = (e) => {
  const t = Z("Combobox", xv, e), { classNames: n, styles: o, unstyled: r, children: s, store: a, vars: i, onOptionSubmit: c, onClose: u, size: f, dropdownPadding: h, resetSelectionOnOptionHover: d, __staticSelector: m, readOnly: g, attributes: v, floatingHeight: w, middlewares: x, ...E } = t, C = w === "viewport" ? {
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
  } : x, k = Ti(), R = a || k, P = Me({
    name: m || "Combobox",
    classes: ut,
    props: t,
    classNames: n,
    styles: o,
    unstyled: r,
    attributes: v,
    vars: i,
    varsResolver: xd
  }), S = () => {
    u?.(), R.closeDropdown();
  };
  return /* @__PURE__ */ l.jsx(pv, {
    value: {
      getStyles: P,
      store: R,
      onOptionSubmit: c,
      size: f,
      resetSelectionOnOptionHover: d,
      readOnly: g,
      floatingHeight: w
    },
    children: /* @__PURE__ */ l.jsx(He, {
      opened: R.dropdownOpened,
      ...E,
      middlewares: C,
      onChange: (y) => !y && S(),
      withRoles: !1,
      unstyled: r,
      children: s
    })
  });
}, Sv = (e) => e;
xe.extend = Sv;
xe.classes = ut;
xe.varsResolver = xd;
xe.displayName = "@mantine/core/Combobox";
xe.Target = wd;
xe.Dropdown = wi;
xe.Options = Ri;
xe.Option = Ei;
xe.Search = Ni;
xe.Empty = xi;
xe.Chevron = fr;
xe.Footer = Ci;
xe.Header = ki;
xe.EventsTarget = yd;
xe.DropdownTarget = vd;
xe.Group = ji;
xe.ClearButton = gd;
xe.HiddenInput = bd;
function Sd({ children: e, role: t }) {
  const n = p.use(Vp);
  return n ? /* @__PURE__ */ l.jsx("div", {
    role: t,
    "aria-labelledby": n.labelId,
    "aria-describedby": n.describedBy,
    children: e
  }) : /* @__PURE__ */ l.jsx(l.Fragment, { children: e });
}
const Pi = p.createContext(null), Cv = { hiddenInputValuesSeparator: "," }, Ai = En(((e) => {
  const { value: t, defaultValue: n, onChange: o, size: r, wrapperProps: s, children: a, readOnly: i, name: c, hiddenInputValuesSeparator: u, hiddenInputProps: f, maxSelectedValues: h, disabled: d, ...m } = Z("CheckboxGroup", Cv, e), [g, v] = Ze({
    value: t,
    defaultValue: n,
    finalValue: [],
    onChange: o
  }), w = (C) => {
    const k = typeof C == "string" ? C : C.currentTarget.value;
    if (i) return;
    const R = g.includes(k);
    !R && h && g.length >= h || v(R ? g.filter((P) => P !== k) : [...g, k]);
  }, x = (C) => {
    if (d) return !0;
    if (!h) return !1;
    const k = g.includes(C), R = g.length >= h;
    return !k && R;
  }, E = g.join(u);
  return /* @__PURE__ */ l.jsx(Pi, {
    value: {
      value: g,
      onChange: w,
      size: r,
      isDisabled: x
    },
    children: /* @__PURE__ */ l.jsxs(Rt.Wrapper, {
      size: r,
      ...s,
      ...m,
      labelElement: "div",
      __staticSelector: "CheckboxGroup",
      children: [/* @__PURE__ */ l.jsx(Sd, {
        role: "group",
        children: a
      }), /* @__PURE__ */ l.jsx("input", {
        type: "hidden",
        name: c,
        value: E,
        ...f
      })]
    })
  });
}));
Ai.classes = Rt.Wrapper.classes;
Ai.displayName = "@mantine/core/CheckboxGroup";
var Cd = { card: "m_26775b0a" };
const jd = p.createContext(null), jv = { withBorder: !0 }, kd = ze((e, { radius: t }) => ({ card: { "--card-radius": Tt(t) } })), ws = se((e) => {
  const t = Z("CheckboxCard", jv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, checked: c, mod: u, withBorder: f, value: h, onClick: d, defaultChecked: m, onChange: g, indeterminate: v, attributes: w, ...x } = t, E = Me({
    name: "CheckboxCard",
    classes: Cd,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: w,
    vars: i,
    varsResolver: kd,
    rootSelector: "card"
  }), C = p.use(Pi), k = typeof c == "boolean" ? c : C ? C.value.includes(h || "") : void 0, [R, P] = Ze({
    value: k,
    defaultValue: m,
    finalValue: !1,
    onChange: g
  });
  return /* @__PURE__ */ l.jsx(jd, {
    value: {
      checked: R,
      indeterminate: v
    },
    children: /* @__PURE__ */ l.jsx($n, {
      mod: [{
        "with-border": f,
        checked: R,
        indeterminate: v
      }, u],
      ...E("card"),
      ...x,
      role: "checkbox",
      "aria-checked": v ? "mixed" : R,
      onClick: (S) => {
        d?.(S), C?.onChange(h || ""), P(!R);
      }
    })
  });
});
ws.displayName = "@mantine/core/CheckboxCard";
ws.classes = Cd;
ws.varsResolver = kd;
function Ii({ size: e, style: t, ...n }) {
  const o = e !== void 0 ? {
    width: Ae(e),
    height: Ae(e),
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
function Ed({ indeterminate: e, ...t }) {
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
  }) : /* @__PURE__ */ l.jsx(Ii, { ...t });
}
var Rd = {
  indicator: "m_5e5256ee",
  icon: "m_1b1c543a",
  "indicator--outline": "m_76e20374"
};
const kv = {
  icon: Ed,
  variant: "filled",
  radius: "sm"
}, Nd = ze((e, { radius: t, color: n, size: o, iconColor: r, variant: s, autoContrast: a }) => {
  const i = cs({
    color: n || e.primaryColor,
    theme: e
  }), c = i.isThemeColor && i.shade === void 0 ? `var(--mantine-color-${i.color}-outline)` : i.color;
  return { indicator: {
    "--checkbox-size": _e(o, "checkbox-size"),
    "--checkbox-radius": t === void 0 ? void 0 : Tt(t),
    "--checkbox-color": s === "outline" ? c : at(n, e),
    "--checkbox-icon-color": r ? at(r, e) : ur(a, e) ? xo({
      color: n,
      theme: e,
      autoContrast: a
    }) : void 0
  } };
}), xs = se((e) => {
  const t = Z("CheckboxIndicator", kv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, icon: c, indeterminate: u, radius: f, color: h, iconColor: d, autoContrast: m, checked: g, mod: v, variant: w, disabled: x, attributes: E, ...C } = t, k = Me({
    name: "CheckboxIndicator",
    classes: Rd,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: E,
    vars: i,
    varsResolver: Nd,
    rootSelector: "indicator"
  }), R = p.use(jd), P = typeof u == "boolean" ? u : R?.indeterminate, S = typeof g == "boolean" || typeof u == "boolean" ? g || u : R?.checked || R?.indeterminate || !1;
  return /* @__PURE__ */ l.jsx(Q, {
    ...k("indicator", { variant: w }),
    variant: w,
    mod: [{
      checked: S,
      disabled: x
    }, v],
    ...C,
    children: /* @__PURE__ */ l.jsx(c, {
      indeterminate: P,
      ...k("icon")
    })
  });
});
xs.displayName = "@mantine/core/CheckboxIndicator";
xs.classes = Rd;
xs.varsResolver = Nd;
var Td = {
  root: "m_5f75b09e",
  body: "m_5f6e695e",
  labelWrapper: "m_d3ea56bb",
  label: "m_8ee546b8",
  description: "m_328f68c0",
  error: "m_8e8a99cc"
};
const Ev = Td;
function Mi({ __staticSelector: e, __stylesApiProps: t, className: n, classNames: o, styles: r, unstyled: s, children: a, label: i, description: c, id: u, disabled: f, error: h, size: d, labelPosition: m = "left", bodyElement: g = "div", labelElement: v = "label", variant: w, style: x, vars: E, mod: C, attributes: k, ...R }) {
  const P = Me({
    name: e,
    props: t,
    className: n,
    style: x,
    classes: Td,
    classNames: o,
    styles: r,
    unstyled: s,
    attributes: k
  }), S = c ? `${u}-description` : void 0, y = h && typeof h != "boolean" ? `${u}-error` : void 0;
  return /* @__PURE__ */ l.jsx(Q, {
    ...P("root"),
    __vars: {
      "--label-fz": Wr(d),
      "--label-lh": _e(d, "label-lh")
    },
    mod: [{ "label-position": m }, C],
    variant: w,
    size: d,
    ...R,
    children: /* @__PURE__ */ l.jsxs(Q, {
      component: g,
      htmlFor: g === "label" ? u : void 0,
      ...P("body"),
      children: [a, /* @__PURE__ */ l.jsxs("div", {
        ...P("labelWrapper"),
        "data-disabled": f || void 0,
        children: [
          i && /* @__PURE__ */ l.jsx(Q, {
            component: v,
            htmlFor: v === "label" ? u : void 0,
            ...P("label"),
            "data-disabled": f || void 0,
            children: i
          }),
          c && /* @__PURE__ */ l.jsx(Rt.Description, {
            id: S,
            size: d,
            __inheritStyles: !1,
            ...P("description"),
            children: c
          }),
          h && typeof h != "boolean" && /* @__PURE__ */ l.jsx(Rt.Error, {
            id: y,
            size: d,
            __inheritStyles: !1,
            ...P("error"),
            children: h
          })
        ]
      })]
    })
  });
}
Mi.displayName = "@mantine/core/InlineInput";
var Pd = {
  root: "m_bf2d988c",
  inner: "m_26062bec",
  input: "m_26063560",
  icon: "m_bf295423",
  "input--outline": "m_215c4542"
};
const Rv = {
  labelPosition: "right",
  icon: Ed,
  withErrorStyles: !0,
  variant: "filled",
  radius: "sm"
}, Ad = ze((e, { radius: t, color: n, size: o, iconColor: r, variant: s, autoContrast: a }) => {
  const i = cs({
    color: n || e.primaryColor,
    theme: e
  }), c = i.isThemeColor && i.shade === void 0 ? `var(--mantine-color-${i.color}-outline)` : i.color;
  return { root: {
    "--checkbox-size": _e(o, "checkbox-size"),
    "--checkbox-radius": t === void 0 ? void 0 : Tt(t),
    "--checkbox-color": s === "outline" ? c : at(n, e),
    "--checkbox-icon-color": r ? at(r, e) : ur(a, e) ? xo({
      color: n,
      theme: e,
      autoContrast: a
    }) : void 0
  } };
}), on = se((e) => {
  const t = Z("Checkbox", Rv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, color: c, label: u, id: f, size: h, radius: d, wrapperProps: m, checked: g, labelPosition: v, description: w, error: x, disabled: E, variant: C, indeterminate: k, icon: R, rootRef: P, iconColor: S, onChange: y, autoContrast: N, mod: D, attributes: O, readOnly: z, onClick: _, withErrorStyles: F, ref: $, ...M } = t, L = p.useRef(null), I = p.use(Pi), A = h || I?.size, B = Me({
    name: "Checkbox",
    props: t,
    classes: Pd,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: O,
    vars: i,
    varsResolver: Ad
  }), { styleProps: H, rest: W } = Yl(M), Y = Bt(f), ae = [
    w ? `${Y}-description` : void 0,
    x && typeof x != "boolean" ? `${Y}-error` : void 0,
    W["aria-describedby"]
  ].filter(Boolean).join(" ") || void 0, fe = {
    checked: I?.value.includes(W.value) ?? g,
    onChange: (he) => {
      z || (I?.onChange(he), y?.(he));
    }
  }, ie = I?.isDisabled?.(W.value) ?? !1, te = E || ie;
  return p.useEffect(() => {
    L.current && (L.current.indeterminate = k || !1, k ? L.current.setAttribute("data-indeterminate", "true") : L.current.removeAttribute("data-indeterminate"));
  }, [k]), /* @__PURE__ */ l.jsx(Mi, {
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
    variant: C,
    ref: P,
    mod: D,
    attributes: O,
    inert: W.inert,
    ...H,
    ...m,
    children: /* @__PURE__ */ l.jsxs(Q, {
      ...B("inner"),
      mod: { labelPosition: v },
      children: [/* @__PURE__ */ l.jsx(Q, {
        component: "input",
        id: Y,
        ref: Ve(L, $),
        mod: {
          error: !!x,
          "with-error-styles": F
        },
        ...B("input", {
          focusable: !0,
          variant: C
        }),
        ...W,
        ...fe,
        "aria-describedby": ae,
        disabled: te,
        inert: W.inert,
        type: "checkbox",
        onClick: (he) => {
          z && fe.checked === void 0 && he.preventDefault(), _?.(he);
        }
      }), /* @__PURE__ */ l.jsx(R, {
        indeterminate: k,
        ...B("icon")
      })]
    })
  });
});
on.classes = {
  ...Pd,
  ...Ev
};
on.varsResolver = Ad;
on.displayName = "@mantine/core/Checkbox";
on.Group = Ai;
on.Indicator = xs;
on.Card = ws;
function Xo(e) {
  return "group" in e;
}
function Id({ options: e, search: t, limit: n }) {
  const o = t.trim().toLowerCase(), r = [];
  for (let s = 0; s < e.length; s += 1) {
    const a = e[s];
    if (r.length === n) return r;
    Xo(a) && r.push({
      group: a.group,
      items: Id({
        options: a.items,
        search: t,
        limit: n - r.length
      })
    }), Xo(a) || a.label.toLowerCase().includes(o) && r.push(a);
  }
  return r;
}
function Nv(e) {
  if (e.length === 0) return !0;
  for (const t of e)
    if (!("group" in t) || t.items.length > 0) return !1;
  return !0;
}
function Md(e, t = /* @__PURE__ */ new Set()) {
  if (Array.isArray(e))
    for (const n of e) if (Xo(n)) Md(n.items, t);
    else {
      if (typeof n.value > "u") throw new Error("[@mantine/core] Each option must have value property");
      if (t.has(n.value)) throw new Error(`[@mantine/core] Duplicate options are not supported. Option with value "${n.value}" was provided more than once`);
      t.add(n.value);
    }
}
function Tv(e, t) {
  return Array.isArray(e) ? e.includes(t) : e === t;
}
function Dd({ data: e, withCheckIcon: t, withAlignedLabels: n, value: o, checkIconPosition: r, unstyled: s, renderOption: a }) {
  if (!Xo(e)) {
    const c = Tv(o, e.value), u = t && (c ? /* @__PURE__ */ l.jsx(Ii, { className: ut.optionsDropdownCheckIcon }) : n ? /* @__PURE__ */ l.jsx("div", { className: ut.optionsDropdownCheckPlaceholder }) : null), f = /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
      r === "left" && u,
      /* @__PURE__ */ l.jsx("span", { children: e.label }),
      r === "right" && u
    ] });
    return /* @__PURE__ */ l.jsx(xe.Option, {
      value: e.value,
      disabled: e.disabled,
      className: nn({ [ut.optionsDropdownOption]: !s }),
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
  const i = e.items.map((c) => /* @__PURE__ */ l.jsx(Dd, {
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
function Pv({ data: e, hidden: t, hiddenWhenEmpty: n, filter: o, search: r, limit: s, maxDropdownHeight: a, floatingHeight: i, withScrollArea: c = !0, filterOptions: u = !0, withCheckIcon: f = !1, withAlignedLabels: h = !1, value: d, checkIconPosition: m, nothingFoundMessage: g, unstyled: v, labelId: w, renderOption: x, scrollAreaProps: E, "aria-label": C }) {
  const k = Ct();
  Md(e);
  const R = typeof r == "string" ? (o || Id)({
    options: e,
    search: u ? r : "",
    limit: s ?? 1 / 0
  }) : e, P = Nv(R), S = R.map((y, N) => /* @__PURE__ */ l.jsx(Dd, {
    data: y,
    withCheckIcon: f,
    withAlignedLabels: h,
    value: d,
    checkIconPosition: m,
    unstyled: v,
    renderOption: x
  }, Xo(y) ? `group-${typeof y.group == "string" ? y.group : N}` : `${y.value}`));
  return /* @__PURE__ */ l.jsx(xe.Dropdown, {
    hidden: t || n && P,
    "data-composed": !0,
    children: /* @__PURE__ */ l.jsxs(xe.Options, {
      labelledBy: w,
      "aria-label": C,
      children: [c ? /* @__PURE__ */ l.jsx(Nn.Autosize, {
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
function Av(e) {
  const t = e.currentTarget;
  return Ht(t).activeElement !== t;
}
var Od = {
  root: "m_de3d2490",
  colorOverlay: "m_862f3d1b",
  shadowOverlay: "m_98ae7f22",
  alphaOverlay: "m_95709ac0",
  childrenOverlay: "m_93e74e3"
};
const Jc = { withShadow: !0 }, $d = ze((e, { radius: t, size: n }) => ({ root: {
  "--cs-radius": t === void 0 ? void 0 : Tt(t),
  "--cs-size": Ae(n)
} })), Eo = Xl((e) => {
  const t = Z("ColorSwatch", Jc, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, color: c, radius: u, withShadow: f, children: h, attributes: d, ...m } = Z("ColorSwatch", Jc, t), g = Me({
    name: "ColorSwatch",
    props: t,
    classes: Od,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: d,
    vars: i,
    varsResolver: $d
  });
  return /* @__PURE__ */ l.jsxs(Q, {
    ...g("root", { focusable: !0 }),
    ...m,
    children: [
      /* @__PURE__ */ l.jsx("span", { ...g("alphaOverlay") }),
      f && /* @__PURE__ */ l.jsx("span", { ...g("shadowOverlay") }),
      /* @__PURE__ */ l.jsx("span", { ...g("colorOverlay", { style: { backgroundColor: c } }) }),
      /* @__PURE__ */ l.jsx("span", {
        ...g("childrenOverlay"),
        children: h
      })
    ]
  });
});
Eo.classes = Od;
Eo.varsResolver = $d;
Eo.displayName = "@mantine/core/ColorSwatch";
function jt(e, t = 0, n = 10 ** t) {
  return Math.round(n * e) / n;
}
function Iv({ h: e, s: t, l: n, a: o }) {
  const r = t * ((n < 50 ? n : 100 - n) / 100);
  return {
    h: e,
    s: r > 0 ? 2 * r / (n + r) * 100 : 0,
    v: n + r,
    a: o
  };
}
const Mv = {
  grad: 360 / 400,
  turn: 360,
  rad: 360 / (Math.PI * 2)
};
function Dv(e, t = "deg") {
  return Number(e) * (Mv[t] || 1);
}
const Ov = /hsla?\(?\s*(-?\d*\.?\d+)(deg|rad|grad|turn)?[,\s]+(-?\d*\.?\d+)%?[,\s]+(-?\d*\.?\d+)%?,?\s*[/\s]*(-?\d*\.?\d+)?(%)?\s*\)?/i;
function Zc(e) {
  const t = Ov.exec(e);
  return t ? Iv({
    h: Dv(t[1], t[2]),
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
function Ca({ r: e, g: t, b: n, a: o }) {
  const r = Math.max(e, t, n), s = r - Math.min(e, t, n), a = s ? r === e ? (t - n) / s : r === t ? 2 + (n - e) / s : 4 + (e - t) / s : 0;
  return {
    h: jt(60 * (a < 0 ? a + 6 : a), 3),
    s: jt(r ? s / r * 100 : 0, 3),
    v: jt(r / 255 * 100, 3),
    a: o
  };
}
function ja(e) {
  const t = e[0] === "#" ? e.slice(1) : e;
  return t.length === 3 ? Ca({
    r: parseInt(t[0] + t[0], 16),
    g: parseInt(t[1] + t[1], 16),
    b: parseInt(t[2] + t[2], 16),
    a: 1
  }) : Ca({
    r: parseInt(t.slice(0, 2), 16),
    g: parseInt(t.slice(2, 4), 16),
    b: parseInt(t.slice(4, 6), 16),
    a: 1
  });
}
function $v(e) {
  const t = e[0] === "#" ? e.slice(1) : e, n = (s) => jt(parseInt(s, 16) / 255, 3);
  if (t.length === 4) {
    const s = t.slice(0, 3), a = n(t[3] + t[3]);
    return {
      ...ja(s),
      a
    };
  }
  const o = t.slice(0, 6), r = n(t.slice(6, 8));
  return {
    ...ja(o),
    a: r
  };
}
const Lv = /rgba?\(?\s*(-?\d*\.?\d+)(%)?[,\s]+(-?\d*\.?\d+)(%)?[,\s]+(-?\d*\.?\d+)(%)?,?\s*[/\s]*(-?\d*\.?\d+)?(%)?\s*\)?/i;
function Qc(e) {
  const t = Lv.exec(e);
  return t ? Ca({
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
const Ld = {
  hex: /^#?([0-9A-F]{3}){1,2}$/i,
  hexa: /^#?([0-9A-F]{4}){1,2}$/i,
  rgb: /^rgb\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/i,
  rgba: /^rgba\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/i,
  hsl: /hsl\(\s*(\d+)\s*,\s*(\d+(?:\.\d+)?%)\s*,\s*(\d+(?:\.\d+)?%)\)/i,
  hsla: /^hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*(\d*(?:\.\d+)?)\)$/i
}, zv = {
  hex: ja,
  hexa: $v,
  rgb: Qc,
  rgba: Qc,
  hsl: Zc,
  hsla: Zc
};
function Oo(e) {
  for (const [, t] of Object.entries(Ld)) if (t.test(e)) return !0;
  return !1;
}
function In(e) {
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
  for (const [n, o] of Object.entries(Ld)) if (o.test(t)) return zv[n](t);
  return {
    h: 0,
    s: 0,
    v: 0,
    a: 1
  };
}
const Ss = p.createContext(null);
function Di({ position: e, ...t }) {
  return /* @__PURE__ */ l.jsx(Q, {
    __vars: {
      "--thumb-y-offset": `${e.y * 100}%`,
      "--thumb-x-offset": `${e.x * 100}%`
    },
    ...t
  });
}
Di.displayName = "@mantine/core/ColorPickerThumb";
var Cs = {
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
const Ro = se((e) => {
  const t = Z("ColorSlider", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, onChange: c, onChangeEnd: u, maxValue: f, round: h, size: d = "md", focusable: m = !0, value: g, overlays: v, thumbColor: w = "transparent", onScrubStart: x, onScrubEnd: E, __staticSelector: C = "ColorPicker", attributes: k, ref: R, ...P } = t, S = Me({
    name: C,
    classes: Cs,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: k,
    rootSelector: "slider"
  }), y = p.use(Ss)?.getStyles || S, N = ir(), [D, O] = p.useState({
    y: 0,
    x: g / f
  }), z = p.useRef(D), _ = (I) => h ? Math.round(I * f) : I * f, { ref: F } = lu(({ x: I, y: A }) => {
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
  Cn(() => {
    O({
      y: 0,
      x: g / f
    });
  }, [g]);
  const $ = (I, A) => {
    I.preventDefault();
    const B = cu(A);
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
  }, L = v.map((I, A) => /* @__PURE__ */ p.createElement("div", {
    ...y("sliderOverlay"),
    style: I,
    key: A
  }));
  return /* @__PURE__ */ l.jsxs(Q, {
    ...P,
    ref: Ve(F, R),
    ...y("slider"),
    size: d,
    role: "slider",
    "aria-valuenow": g,
    "aria-valuemax": f,
    "aria-valuemin": 0,
    tabIndex: m ? 0 : -1,
    onKeyDown: M,
    "data-focus-ring": N.focusRing,
    __vars: { "--cp-thumb-size": `var(--cp-thumb-size-${d})` },
    children: [L, /* @__PURE__ */ l.jsx(Di, {
      position: D,
      ...y("thumb", { style: {
        top: Ae(1),
        background: w
      } })
    })]
  });
});
Ro.displayName = "@mantine/core/ColorSlider";
Ro.classes = Cs;
const _v = { __staticSelector: "AlphaSlider" }, Oi = se((e) => {
  const { value: t, onChange: n, onChangeEnd: o, color: r, ...s } = Z("AlphaSlider", _v, e);
  return /* @__PURE__ */ l.jsx(Ro, {
    ...s,
    value: t,
    onChange: (a) => n?.(jt(a, 2)),
    onChangeEnd: (a) => o?.(jt(a, 2)),
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
Oi.displayName = "@mantine/core/AlphaSlider";
Oi.classes = Ro.classes;
function zd({ h: e, s: t, v: n, a: o }) {
  const r = e / 360 * 6, s = t / 100, a = n / 100, i = Math.floor(r), c = a * (1 - s), u = a * (1 - (r - i) * s), f = a * (1 - (1 - r + i) * s), h = i % 6;
  return {
    r: jt([
      a,
      u,
      c,
      c,
      f,
      a
    ][h] * 255),
    g: jt([
      f,
      a,
      a,
      u,
      c,
      c
    ][h] * 255),
    b: jt([
      c,
      c,
      f,
      a,
      a,
      u
    ][h] * 255),
    a: jt(o, 2)
  };
}
function el(e, t) {
  const { r: n, g: o, b: r, a: s } = zd(e);
  return t ? `rgba(${n}, ${o}, ${r}, ${jt(s, 2)})` : `rgb(${n}, ${o}, ${r})`;
}
function tl({ h: e, s: t, v: n, a: o }, r) {
  const s = (200 - t) * n / 100, a = {
    h: Math.round(e),
    s: Math.round(s > 0 && s < 200 ? t * n / 100 / (s <= 100 ? s : 200 - s) * 100 : 0),
    l: Math.round(s / 2)
  };
  return r ? `hsla(${a.h}, ${a.s}%, ${a.l}%, ${jt(o, 2)})` : `hsl(${a.h}, ${a.s}%, ${a.l}%)`;
}
function _r(e) {
  const t = e.toString(16);
  return t.length < 2 ? `0${t}` : t;
}
function _d(e) {
  const { r: t, g: n, b: o } = zd(e);
  return `#${_r(t)}${_r(n)}${_r(o)}`;
}
function Fv(e) {
  const t = Math.round(e.a * 255);
  return `${_d(e)}${_r(t)}`;
}
const Qs = {
  hex: _d,
  hexa: (e) => Fv(e),
  rgb: (e) => el(e, !1),
  rgba: (e) => el(e, !0),
  hsl: (e) => tl(e, !1),
  hsla: (e) => tl(e, !0)
};
function Mt(e, t) {
  return t ? e in Qs ? Qs[e](t) : Qs.hex(t) : "#000000";
}
const Bv = { __staticSelector: "HueSlider" }, $i = se((e) => {
  const { value: t, onChange: n, onChangeEnd: o, color: r, ...s } = Z("HueSlider", Bv, e);
  return /* @__PURE__ */ l.jsx(Ro, {
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
$i.displayName = "@mantine/core/HueSlider";
$i.classes = Ro.classes;
function Fd({ className: e, onChange: t, onChangeEnd: n, value: o, saturationLabel: r, focusable: s = !0, size: a, color: i, onScrubStart: c, onScrubEnd: u, ...f }) {
  const { getStyles: h } = p.use(Ss), [d, m] = p.useState({
    x: o.s / 100,
    y: 1 - o.v / 100
  }), g = p.useRef(d), { ref: v } = lu(({ x: E, y: C }) => {
    g.current = {
      x: E,
      y: C
    }, t({
      s: Math.round(E * 100),
      v: Math.round((1 - C) * 100)
    });
  }, {
    onScrubEnd: () => {
      const { x: E, y: C } = g.current;
      n({
        s: Math.round(E * 100),
        v: Math.round((1 - C) * 100)
      }), u?.();
    },
    onScrubStart: c
  });
  p.useEffect(() => {
    m({
      x: o.s / 100,
      y: 1 - o.v / 100
    });
  }, [o.s, o.v]);
  const w = (E, C) => {
    E.preventDefault();
    const k = cu(C);
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
          y: d.y - 0.05,
          x: d.x
        });
        break;
      case "ArrowDown":
        w(E, {
          y: d.y + 0.05,
          x: d.x
        });
        break;
      case "ArrowRight":
        w(E, {
          x: d.x + 0.05,
          y: d.y
        });
        break;
      case "ArrowLeft":
        w(E, {
          x: d.x - 0.05,
          y: d.y
        });
    }
  };
  return /* @__PURE__ */ l.jsxs(Q, {
    ...h("saturation"),
    ref: v,
    ...f,
    role: "slider",
    "aria-label": r,
    "aria-valuenow": d.x,
    "aria-valuetext": Mt("rgba", o),
    tabIndex: s ? 0 : -1,
    onKeyDown: x,
    children: [
      /* @__PURE__ */ l.jsx("div", { ...h("saturationOverlay", { style: { backgroundColor: `hsl(${o.h}, 100%, 50%)` } }) }),
      /* @__PURE__ */ l.jsx("div", { ...h("saturationOverlay", { style: { backgroundImage: "linear-gradient(90deg, #fff, transparent)" } }) }),
      /* @__PURE__ */ l.jsx("div", { ...h("saturationOverlay", { style: { backgroundImage: "linear-gradient(0deg, #000, transparent)" } }) }),
      /* @__PURE__ */ l.jsx(Di, {
        position: d,
        ...h("thumb", { style: { backgroundColor: i } })
      })
    ]
  });
}
Fd.displayName = "@mantine/core/Saturation";
function Bd({ className: e, datatype: t, setValue: n, onChangeEnd: o, size: r, focusable: s, data: a, swatchesPerRow: i, value: c, ...u }) {
  const f = p.use(Ss), h = a.map((d, m) => /* @__PURE__ */ p.createElement(Eo, {
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
  }, c === d && /* @__PURE__ */ l.jsx(Ii, {
    size: "35%",
    color: Ap(d) < 0.5 ? "white" : "black"
  })));
  return /* @__PURE__ */ l.jsx(Q, {
    ...f.getStyles("swatches"),
    ...u,
    children: h
  });
}
Bd.displayName = "@mantine/core/Swatches";
const Vv = {
  swatchesPerRow: 7,
  withPicker: !0,
  focusable: !0,
  size: "md",
  __staticSelector: "ColorPicker"
}, Vd = ze((e, { size: t, swatchesPerRow: n }) => ({ wrapper: {
  "--cp-preview-size": _e(t, "cp-preview-size"),
  "--cp-width": _e(t, "cp-width"),
  "--cp-body-spacing": Uo(t),
  "--cp-swatch-size": `${100 / n}%`,
  "--cp-thumb-size": _e(t, "cp-thumb-size"),
  "--cp-saturation-height": _e(t, "cp-saturation-height")
} })), js = se((e) => {
  const t = Z("ColorPicker", Vv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, format: c = "hex", value: u, defaultValue: f, onChange: h, onChangeEnd: d, withPicker: m, size: g, saturationLabel: v, hueLabel: w, alphaLabel: x, focusable: E, swatches: C, swatchesPerRow: k, fullWidth: R, onColorSwatchClick: P, __staticSelector: S, mod: y, attributes: N, name: D, hiddenInputProps: O, ...z } = t, _ = Me({
    name: S,
    props: t,
    classes: Cs,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: N,
    rootSelector: "wrapper",
    vars: i,
    varsResolver: Vd
  }), F = p.useRef(c || "hex"), $ = p.useRef(""), M = p.useRef(-1), L = p.useRef(!1), I = c === "hexa" || c === "rgba" || c === "hsla", [A, B, H] = Ze({
    value: u,
    defaultValue: f,
    finalValue: "#FFFFFF",
    onChange: h
  }), [W, Y] = p.useState(In(A)), ae = () => {
    window.clearTimeout(M.current), L.current = !0;
  }, fe = () => {
    window.clearTimeout(M.current), M.current = window.setTimeout(() => {
      L.current = !1;
    }, 200);
  }, ie = (te) => {
    Y((he) => {
      const q = {
        ...he,
        ...te
      };
      return $.current = Mt(F.current, q), q;
    }), B($.current);
  };
  return Cn(() => {
    typeof u == "string" && Oo(u) && !L.current && Y(In(u));
  }, [u]), Cn(() => {
    F.current = c || "hex", B(Mt(F.current, W));
  }, [c]), /* @__PURE__ */ l.jsx(Ss, {
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
        m && /* @__PURE__ */ l.jsxs(l.Fragment, { children: [/* @__PURE__ */ l.jsx(Fd, {
          value: W,
          onChange: ie,
          onChangeEnd: ({ s: te, v: he }) => d?.(Mt(F.current, {
            ...W,
            s: te,
            v: he
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
            children: [/* @__PURE__ */ l.jsx($i, {
              value: W.h,
              onChange: (te) => ie({ h: te }),
              onChangeEnd: (te) => d?.(Mt(F.current, {
                ...W,
                h: te
              })),
              size: g,
              focusable: E,
              "aria-label": w,
              onScrubStart: ae,
              onScrubEnd: fe
            }), I && /* @__PURE__ */ l.jsx(Oi, {
              value: W.a,
              onChange: (te) => ie({ a: te }),
              onChangeEnd: (te) => {
                d?.(Mt(F.current, {
                  ...W,
                  a: te
                }));
              },
              size: g,
              color: Mt("hex", W),
              focusable: E,
              "aria-label": x,
              onScrubStart: ae,
              onScrubEnd: fe
            })]
          }), I && /* @__PURE__ */ l.jsx(Eo, {
            color: A,
            radius: "sm",
            size: "var(--cp-preview-size)",
            ..._("preview")
          })]
        })] }),
        Array.isArray(C) && /* @__PURE__ */ l.jsx(Bd, {
          data: C,
          swatchesPerRow: k,
          focusable: E,
          setValue: B,
          value: A,
          onChangeEnd: (te) => {
            const he = Mt(c, In(te));
            P?.(he), d?.(he), H || Y(In(te));
          }
        })
      ]
    })
  });
});
js.classes = Cs;
js.varsResolver = Vd;
js.displayName = "@mantine/core/ColorPicker";
function Hv({ style: e, ...t }) {
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
var nl = {
  eyeDropperIcon: "m_b077c2bc",
  eyeDropperButton: "m_66a028b5",
  colorPreview: "m_c5ccdcab",
  dropdown: "m_5ece2cd7"
};
const ol = {
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
}, Hd = ze((e, { size: t }) => ({
  eyeDropperIcon: { "--ci-eye-dropper-icon-size": _e(t, "ci-eye-dropper-icon-size") },
  eyeDropperButton: { "--ci-button-size": _e(t, "ci-button-size") },
  colorPreview: { "--ci-preview-size": _e(t, "ci-preview-size") }
})), pr = se((e) => {
  const t = Z([
    "Input",
    "InputWrapper",
    "ColorInput"
  ], ol, e), { classNames: n, styles: o, unstyled: r, disallowInput: s, fixOnBlur: a, popoverProps: i, withPreview: c, withEyeDropper: u, eyeDropperIcon: f, closeOnColorSwatchClick: h, eyeDropperButtonProps: d, value: m, defaultValue: g, onChange: v, onChangeEnd: w, onClick: x, onFocus: E, onBlur: C, inputProps: k, format: R = "hex", wrapperProps: P, readOnly: S, withPicker: y, swatches: N, disabled: D, leftSection: O, rightSection: z, swatchesPerRow: _, fullWidth: F, ...$ } = Hp("ColorInput", ol, e), M = Me({
    name: "ColorInput",
    props: t,
    classes: nl,
    classNames: n,
    styles: o,
    unstyled: r,
    rootSelector: "wrapper",
    vars: t.vars,
    varsResolver: Hd
  }), { resolvedClassNames: L, resolvedStyles: I } = cr({
    classNames: n,
    styles: o,
    props: t
  }), [A, B] = p.useState(!1), [H, W] = p.useState(""), [Y, ae] = Ze({
    value: m,
    defaultValue: g,
    finalValue: "",
    onChange: v
  }), { supported: fe, open: ie } = lh(), te = /* @__PURE__ */ l.jsx(Fo, {
    ...d,
    ...M("eyeDropperButton", {
      className: d?.className,
      style: d?.style
    }),
    variant: "subtle",
    color: "gray",
    unstyled: r,
    onClick: () => ie().then((ce) => {
      if (ce?.sRGBHex) {
        const be = Mt(R, In(ce.sRGBHex));
        ae(be), w?.(be);
      }
    }).catch(() => {
    }),
    children: f || /* @__PURE__ */ l.jsx(Hv, { ...M("eyeDropperIcon") })
  }), he = (ce) => {
    E?.(ce), B(!0);
  }, q = (ce) => {
    a && ae(H), C?.(ce), B(!1);
  }, K = (ce) => {
    x?.(ce), B(!0);
  };
  return p.useEffect(() => {
    (Oo(Y) || Y.trim() === "") && W(Y);
  }, [Y]), Cn(() => {
    Oo(Y) && ae(Mt(R, In(Y)));
  }, [R]), /* @__PURE__ */ l.jsx(Rt.Wrapper, {
    ...P,
    classNames: L,
    styles: I,
    __staticSelector: "ColorInput",
    children: /* @__PURE__ */ l.jsxs(He, {
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
      children: [/* @__PURE__ */ l.jsx(He.Target, { children: /* @__PURE__ */ l.jsx(Rt, {
        autoComplete: "off",
        ...$,
        ...k,
        classNames: L,
        styles: I,
        disabled: D,
        __staticSelector: "ColorInput",
        onFocus: he,
        onBlur: q,
        onClick: K,
        spellCheck: !1,
        value: Y,
        onChange: (ce) => {
          const be = ce.currentTarget.value;
          ae(be), Oo(be) && w?.(Mt(R, In(be)));
        },
        leftSection: O || (c ? /* @__PURE__ */ l.jsx(Eo, {
          color: Oo(Y) ? Y : "#fff",
          size: "var(--ci-preview-size)",
          ...M("colorPreview")
        }) : null),
        readOnly: s || S,
        pointer: s,
        unstyled: r,
        rightSection: z || (u && !D && !S && fe ? te : null)
      }) }), /* @__PURE__ */ l.jsx(He.Dropdown, {
        onMouseDown: (ce) => ce.preventDefault(),
        className: nl.dropdown,
        children: /* @__PURE__ */ l.jsx(js, {
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
          onColorSwatchClick: () => h && B(!1),
          attributes: P.attributes,
          fullWidth: F
        })
      })]
    })
  });
});
pr.classes = St.classes;
pr.varsResolver = Hd;
pr.displayName = "@mantine/core/ColorInput";
var Ud = {
  root: "m_3eebeb36",
  label: "m_9e365f20"
};
const Uv = { orientation: "horizontal" }, Wd = ze((e, { color: t, variant: n, size: o }) => ({ root: {
  "--divider-color": t ? at(t, e) : void 0,
  "--divider-border-style": n,
  "--divider-size": _e(o, "divider-size")
} })), ks = se((e) => {
  const t = Z("Divider", Uv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, color: c, orientation: u, label: f, labelPosition: h, mod: d, attributes: m, ...g } = t, v = Me({
    name: "Divider",
    classes: Ud,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: m,
    vars: i,
    varsResolver: Wd
  });
  return /* @__PURE__ */ l.jsx(Q, {
    mod: [{
      orientation: u,
      withLabel: !!f
    }, d],
    role: "separator",
    ...v("root"),
    ...g,
    children: f && /* @__PURE__ */ l.jsx(Q, {
      component: "span",
      mod: { position: h },
      ...v("label"),
      children: f
    })
  });
});
ks.classes = Ud;
ks.varsResolver = Wd;
ks.displayName = "@mantine/core/Divider";
const qd = En((e) => {
  const { onChange: t, children: n, multiple: o, accept: r, name: s, form: a, resetRef: i, disabled: c, capture: u, inputProps: f, ref: h, ...d } = Z("FileButton", null, e), m = p.useRef(null), g = () => {
    !c && m.current?.click();
  }, v = (x) => {
    if (x.currentTarget.files === null) return t(o ? [] : null);
    t(o ? Array.from(x.currentTarget.files) : x.currentTarget.files[0] || null);
  };
  return Ql(i, () => {
    m.current && (m.current.value = "");
  }), /* @__PURE__ */ l.jsxs(l.Fragment, { children: [/* @__PURE__ */ l.jsx("input", {
    style: { display: "none" },
    type: "file",
    accept: r,
    multiple: o,
    onChange: v,
    ref: Ve(h, m),
    name: s,
    form: a,
    capture: u,
    ...f
  }), n({
    onClick: g,
    ...d
  })] });
});
qd.displayName = "@mantine/core/FileButton";
const Wv = ({ value: e }) => /* @__PURE__ */ l.jsx("div", {
  style: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  children: Array.isArray(e) ? e.map((t) => t.name).join(", ") : e?.name
}), qv = {
  valueComponent: Wv,
  size: "sm"
}, Li = En((e) => {
  const t = Z([
    "Input",
    "InputWrapper",
    "FileInput"
  ], qv, e), { unstyled: n, vars: o, onChange: r, value: s, defaultValue: a, multiple: i, accept: c, name: u, form: f, valueComponent: h, clearable: d, clearSectionMode: m, clearButtonProps: g, readOnly: v, capture: w, fileInputProps: x, rightSection: E, size: C, placeholder: k, component: R, resetRef: P, classNames: S, styles: y, attributes: N, ...D } = t, O = p.useRef(null), { resolvedClassNames: z, resolvedStyles: _ } = cr({
    classNames: S,
    styles: y,
    props: t
  }), [F, $] = Ze({
    value: s,
    defaultValue: a,
    onChange: r,
    finalValue: i ? [] : null
  }), M = Array.isArray(F) ? F.length !== 0 : F !== null, L = /* @__PURE__ */ l.jsx(ei, {
    ...g,
    variant: "subtle",
    onClick: () => $(i ? [] : null),
    size: C,
    unstyled: n
  }), I = d && M && !v;
  return p.useEffect(() => {
    (Array.isArray(F) && F.length === 0 || F === null) && O.current?.();
  }, [F]), /* @__PURE__ */ l.jsx(qd, {
    onChange: $,
    multiple: i,
    accept: c,
    name: u,
    form: f,
    resetRef: Ve(O, P),
    disabled: v,
    capture: w,
    inputProps: x,
    children: (A) => /* @__PURE__ */ l.jsx(St, {
      component: R || "button",
      rightSection: E,
      __clearSection: L,
      __clearable: I,
      __clearSectionMode: m,
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
      styles: y,
      attributes: N,
      children: M ? /* @__PURE__ */ l.jsx(h, { value: F }) : /* @__PURE__ */ l.jsx(Rt.Placeholder, {
        __staticSelector: "FileInput",
        classNames: z,
        styles: _,
        attributes: N,
        children: k
      })
    })
  });
});
Li.classes = St.classes;
Li.displayName = "@mantine/core/FileInput";
const Kv = [
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
], rl = {
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
function sl(e) {
  Object.keys(rl).forEach((t) => {
    e.style.setProperty(t, rl[t], "important");
  });
}
function Xv(e) {
  const t = window.getComputedStyle(e);
  if (t === null) return null;
  const n = {};
  for (const o of Kv) n[o] = t[o];
  return n.boxSizing === "" ? null : {
    sizingStyle: n,
    paddingSize: parseFloat(n.paddingBottom) + parseFloat(n.paddingTop),
    borderSize: parseFloat(n.borderBottomWidth) + parseFloat(n.borderTopWidth)
  };
}
let Xe = null;
function Yv(e, t, n = 1, o = 1 / 0) {
  Xe || (Xe = document.createElement("textarea"), Xe.setAttribute("tabindex", "-1"), Xe.setAttribute("aria-hidden", "true"), Xe.setAttribute("aria-label", "autosize measurement"), sl(Xe)), Xe.parentNode === null && document.body.appendChild(Xe);
  const { paddingSize: r, borderSize: s, sizingStyle: a } = e, { boxSizing: i } = a;
  Object.keys(a).forEach((d) => {
    Xe.style[d] = a[d];
  }), sl(Xe), Xe.value = t;
  let c = i === "border-box" ? Xe.scrollHeight + s : Xe.scrollHeight - r;
  Xe.value = t, c = i === "border-box" ? Xe.scrollHeight + s : Xe.scrollHeight - r, Xe.value = "x";
  const u = Xe.scrollHeight - r;
  let f = u * n;
  i === "border-box" && (f = f + r + s), c = Math.max(f, c);
  let h = u * o;
  return i === "border-box" && (h = h + r + s), c = Math.min(h, c), [c, u];
}
function Gv({ maxRows: e, minRows: t, onChange: n, ref: o, ...r }) {
  const s = r.value !== void 0, a = p.useRef(null), i = Ve(a, o), c = p.useRef(0), u = p.useRef(0), f = () => {
    const m = a.current;
    if (!m) return;
    const g = Xv(m);
    if (!g) return;
    const [v] = Yv(g, m.value || m.placeholder || "x", t, e);
    c.current !== v && (c.current = v, m.style.setProperty("height", `${v}px`, "important"));
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
    const v = new ResizeObserver(() => {
      a.current && a.current.offsetWidth !== u.current && (u.current = a.current.offsetWidth, cancelAnimationFrame(g), g = requestAnimationFrame(h));
    });
    return v.observe(m), () => {
      cancelAnimationFrame(g), v.disconnect();
    };
  }, []), p.useEffect(() => {
    const m = () => f();
    return document.fonts.addEventListener("loadingdone", m), () => document.fonts.removeEventListener("loadingdone", m);
  }, []), p.useEffect(() => {
    const m = (g) => {
      if (a.current?.form === g.target && !s) {
        const v = a.current.value;
        requestAnimationFrame(() => {
          a.current && v !== a.current.value && f();
        });
      }
    };
    return document.body.addEventListener("reset", m), () => document.body.removeEventListener("reset", m);
  }, [s]), /* @__PURE__ */ l.jsx("textarea", {
    rows: t,
    ...r,
    onChange: d,
    ref: i
  });
}
const ho = se((e) => {
  const { autosize: t, maxRows: n, minRows: o, __staticSelector: r, resize: s, bottomSection: a, bottomSectionProps: i, ...c } = Z([
    "Input",
    "InputWrapper",
    "Textarea"
  ], null, e), u = t && uu() !== "test", f = u ? {
    maxRows: n,
    minRows: o
  } : {};
  return /* @__PURE__ */ l.jsx(St, {
    component: u ? Gv : "textarea",
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
ho.classes = St.classes;
ho.displayName = "@mantine/core/Textarea";
function Kd({ size: e, style: t, ...n }) {
  return /* @__PURE__ */ l.jsx("svg", {
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
    children: /* @__PURE__ */ l.jsx("circle", {
      cx: "2.5",
      cy: "2.5",
      r: "2.5",
      fill: "currentColor"
    })
  });
}
const [Jv, No] = Yt("Modal component was not found in tree");
var cn = {
  root: "m_9df02822",
  content: "m_54c44539",
  inner: "m_1f958f16",
  header: "m_d0e2b9cd"
};
const Es = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ModalBody", null, e), i = No();
  return /* @__PURE__ */ l.jsx(td, {
    ...i.getStyles("body", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
Es.classes = cn;
Es.displayName = "@mantine/core/ModalBody";
const Rs = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ModalCloseButton", null, e), i = No();
  return /* @__PURE__ */ l.jsx(nd, {
    ...i.getStyles("close", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
Rs.classes = cn;
Rs.displayName = "@mantine/core/ModalCloseButton";
const Ns = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, children: a, __hidden: i, ...c } = Z("ModalContent", null, e), u = No(), f = u.scrollAreaComponent || sv;
  return /* @__PURE__ */ l.jsx(od, {
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
      style: { maxHeight: u.fullScreen ? "100dvh" : `calc(100dvh - (${Ae(u.yOffset)} * 2))` },
      children: a
    })
  });
});
Ns.classes = cn;
Ns.displayName = "@mantine/core/ModalContent";
const Ts = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ModalHeader", null, e), i = No();
  return /* @__PURE__ */ l.jsx(rd, {
    ...i.getStyles("header", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
Ts.classes = cn;
Ts.displayName = "@mantine/core/ModalHeader";
const Ps = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ModalOverlay", null, e), i = No();
  return /* @__PURE__ */ l.jsx(sd, {
    ...i.getStyles("overlay", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
Ps.classes = cn;
Ps.displayName = "@mantine/core/ModalOverlay";
const Zv = {
  __staticSelector: "Modal",
  closeOnClickOutside: !0,
  withinPortal: !0,
  lockScroll: !0,
  trapFocus: !0,
  returnFocus: !0,
  closeOnEscape: !0,
  keepMounted: !1,
  zIndex: So("modal"),
  transitionProps: {
    duration: 200,
    transition: "fade-down"
  },
  yOffset: "5dvh"
}, Xd = ze((e, { radius: t, size: n, yOffset: o, xOffset: r }) => ({ root: {
  "--modal-radius": t === void 0 ? void 0 : Tt(t),
  "--modal-size": _e(n, "modal-size"),
  "--modal-y-offset": Ae(o),
  "--modal-x-offset": Ae(r)
} })), hr = se((e) => {
  const t = Z("ModalRoot", Zv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, yOffset: c, scrollAreaComponent: u, radius: f, fullScreen: h, centered: d, xOffset: m, __staticSelector: g, attributes: v, ...w } = t, x = Me({
    name: g,
    classes: cn,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: v,
    vars: i,
    varsResolver: Xd
  });
  return /* @__PURE__ */ l.jsx(Jv, {
    value: {
      yOffset: c,
      scrollAreaComponent: u,
      getStyles: x,
      fullScreen: h
    },
    children: /* @__PURE__ */ l.jsx(ed, {
      ...x("root"),
      "data-full-screen": h || void 0,
      "data-centered": d || void 0,
      "data-offset-scrollbars": u === Nn.Autosize || void 0,
      unstyled: a,
      ...w
    })
  });
});
hr.classes = cn;
hr.varsResolver = Xd;
hr.displayName = "@mantine/core/ModalRoot";
const Yd = p.createContext(null);
function Gd({ children: e }) {
  const [t, n] = p.useState([]), [o, r] = p.useState(So("modal")), [s] = p.useState(() => /* @__PURE__ */ new WeakSet());
  return /* @__PURE__ */ l.jsx(Yd, {
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
Gd.displayName = "@mantine/core/ModalStack";
const As = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ModalTitle", null, e), i = No();
  return /* @__PURE__ */ l.jsx(ad, {
    ...i.getStyles("title", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
As.classes = cn;
As.displayName = "@mantine/core/ModalTitle";
const Qv = {
  closeOnClickOutside: !0,
  withinPortal: !0,
  lockScroll: !0,
  trapFocus: !0,
  returnFocus: !0,
  closeOnEscape: !0,
  keepMounted: !1,
  zIndex: So("modal"),
  transitionProps: {
    duration: 200,
    transition: "fade-down"
  },
  withOverlay: !0,
  withCloseButton: !0
}, pt = se((e) => {
  const { title: t, withOverlay: n, overlayProps: o, withCloseButton: r, closeButtonProps: s, children: a, radius: i, opened: c, stackId: u, zIndex: f, ...h } = Z("Modal", Qv, e), d = p.use(Yd), m = !!t || r, g = d && u ? {
    closeOnEscape: d.currentId === u,
    trapFocus: d.currentId === u,
    zIndex: d.getZIndex(u),
    __handledEscapeEvents: d.handledEscapeEvents
  } : {}, v = n === !1 ? !1 : u && d ? d.currentId === u : c;
  return p.useEffect(() => {
    d && u && (c ? d.addModal(u, f || So("modal")) : d.removeModal(u));
  }, [
    c,
    u,
    f
  ]), /* @__PURE__ */ l.jsxs(hr, {
    radius: i,
    opened: c,
    zIndex: d && u ? d.getZIndex(u) : f,
    ...h,
    ...g,
    children: [n && /* @__PURE__ */ l.jsx(Ps, {
      visible: v,
      transitionProps: d && u ? { duration: 0 } : void 0,
      ...o
    }), /* @__PURE__ */ l.jsxs(Ns, {
      radius: i,
      __hidden: d && u && c ? u !== d.currentId : !1,
      children: [m && /* @__PURE__ */ l.jsxs(Ts, { children: [t && /* @__PURE__ */ l.jsx(As, { children: t }), r && /* @__PURE__ */ l.jsx(Rs, { ...s })] }), /* @__PURE__ */ l.jsx(Es, { children: a })]
    })]
  });
});
pt.classes = cn;
pt.displayName = "@mantine/core/Modal";
pt.Root = hr;
pt.Overlay = Ps;
pt.Content = Ns;
pt.Body = Es;
pt.Header = Ts;
pt.Title = As;
pt.CloseButton = Rs;
pt.Stack = Gd;
function ey(e, t) {
  const n = t.trim().toLowerCase();
  if (n === "") return;
  const o = Object.values(e).filter((r) => !r.disabled && r.label.trim().toLowerCase() === n);
  return o.length === 1 ? o[0] : void 0;
}
function ty(e) {
  return "group" in e;
}
function zi({ data: e }) {
  if (ty(e)) {
    const r = e.items.map((s) => /* @__PURE__ */ l.jsx(zi, { data: s }, s.value));
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
zi.displayName = "@mantine/core/NativeSelectOption";
const ny = {
  size: "sm",
  rightSectionPointerEvents: "none"
}, mo = se((e) => {
  const { data: t, children: n, size: o, error: r, rightSection: s, unstyled: a, ...i } = Z([
    "Input",
    "InputWrapper",
    "NativeSelect"
  ], ny, e), c = pd(t).map((u, f) => /* @__PURE__ */ l.jsx(zi, { data: u }, f));
  return /* @__PURE__ */ l.jsx(St, {
    component: "select",
    ...i,
    __staticSelector: "NativeSelect",
    size: o,
    pointer: !0,
    error: r,
    unstyled: a,
    rightSection: s || /* @__PURE__ */ l.jsx(fr, {
      size: o,
      error: r,
      unstyled: a
    }),
    children: n || c
  });
});
mo.classes = St.classes;
mo.displayName = "@mantine/core/NativeSelect";
function Jd(e, t) {
  var n = {};
  for (var o in e)
    Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var r = 0, o = Object.getOwnPropertySymbols(e); r < o.length; r++)
      t.indexOf(o[r]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[r]) && (n[o[r]] = e[o[r]]);
  return n;
}
var go;
(function(e) {
  e.event = "event", e.props = "prop";
})(go || (go = {}));
function hn() {
}
function oy(e) {
  var t, n = void 0;
  return function() {
    for (var o = [], r = arguments.length; r--; ) o[r] = arguments[r];
    return t && o.length === t.length && o.every(function(s, a) {
      return s === t[a];
    }) || (t = o, n = e.apply(void 0, o)), n;
  };
}
function Yo(e) {
  return !!(e || "").match(/\d/);
}
function gn(e) {
  return e == null;
}
function ry(e) {
  return typeof e == "number" && isNaN(e);
}
function Zd(e) {
  return gn(e) || ry(e) || typeof e == "number" && !isFinite(e);
}
function Qd(e) {
  return e.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
}
function sy(e) {
  switch (e) {
    case "lakh":
      return /(\d+?)(?=(\d\d)+(\d)(?!\d))(\.\d+)?/g;
    case "wan":
      return /(\d)(?=(\d{4})+(?!\d))/g;
    default:
      return /(\d)(?=(\d{3})+(?!\d))/g;
  }
}
function ay(e, t, n) {
  var o = sy(n), r = e.search(/[1-9]/);
  return r = r === -1 ? e.length : r, e.substring(0, r) + e.substring(r, e.length).replace(o, "$1" + t);
}
function al(e) {
  var t = p.useRef(e);
  t.current = e;
  var n = p.useRef(function() {
    for (var o = [], r = arguments.length; r--; ) o[r] = arguments[r];
    return t.current.apply(t, o);
  });
  return n.current;
}
function _i(e, t) {
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
function iy(e) {
  if (!e)
    return e;
  var t = e[0] === "-";
  t && (e = e.substring(1, e.length));
  var n = e.split("."), o = n[0].replace(/^0+/, "") || "0", r = n[1] || "";
  return (t ? "-" : "") + o + (r ? "." + r : "");
}
function ef(e, t, n) {
  for (var o = "", r = n ? "0" : "", s = 0; s <= t - 1; s++)
    o += e[s] || r;
  return o;
}
function il(e, t) {
  return Array(t + 1).join(e);
}
function tf(e) {
  var t = e + "", n = t[0] === "-" ? "-" : "";
  n && (t = t.substring(1));
  var o = t.split(/[eE]/g), r = o[0], s = o[1];
  if (s = Number(s), !s)
    return n + r;
  r = r.replace(".", "");
  var a = 1 + s, i = r.length;
  return a < 0 ? r = "0." + il("0", Math.abs(a)) + r : a >= i ? r = r + il("0", a - i) : r = (r.substring(0, a) || "0") + "." + r.substring(a), n + r;
}
function cl(e, t, n) {
  if (["", "-"].indexOf(e) !== -1)
    return e;
  var o = (e.indexOf(".") !== -1 || n) && t, r = _i(e), s = r.beforeDecimal, a = r.afterDecimal, i = r.hasNegation, c = parseFloat("0." + (a || "0")), u = a.length <= t ? "0." + a : c.toFixed(t), f = u.split("."), h = s;
  s && Number(f[0]) && (h = s.split("").reverse().reduce(function(v, w, x) {
    return v.length > x ? (Number(v[0]) + Number(w)).toString() + v.substring(1, v.length) : w + v;
  }, f[0]));
  var d = ef(f[1] || "", t, n), m = i ? "-" : "", g = o ? "." : "";
  return "" + m + h + g + d;
}
function An(e, t) {
  if (e.value = e.value, e !== null) {
    if (e.createTextRange) {
      var n = e.createTextRange();
      return n.move("character", t), n.select(), !0;
    }
    return e.selectionStart || e.selectionStart === 0 ? (e.focus(), e.setSelectionRange(t, t), !0) : (e.focus(), !1);
  }
}
var nf = oy(function(e, t) {
  for (var n = 0, o = 0, r = e.length, s = t.length; e[n] === t[n] && n < r; )
    n++;
  for (; e[r - 1 - o] === t[s - 1 - o] && s - o > n && r - o > n; )
    o++;
  return {
    from: { start: n, end: r - o },
    to: { start: n, end: s - o }
  };
}), cy = function(e, t) {
  var n = Math.min(e.selectionStart, t);
  return {
    from: { start: n, end: e.selectionEnd },
    to: { start: n, end: t }
  };
};
function ly(e, t, n) {
  return Math.min(Math.max(e, t), n);
}
function ea(e) {
  return Math.max(e.selectionStart, e.selectionEnd);
}
function uy() {
  return typeof navigator < "u" && !(navigator.platform && /iPhone|iPod/.test(navigator.platform));
}
function dy(e) {
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
function fy(e) {
  var t = e.currentValue, n = e.formattedValue, o = e.currentValueIndex, r = e.formattedValueIndex;
  return t[o] === n[r];
}
function py(e, t, n, o, r, s, a) {
  a === void 0 && (a = fy);
  var i = r.findIndex(function(k) {
    return k;
  }), c = e.slice(0, i);
  !t && !n.startsWith(c) && (t = c, n = c + n, o = o + c.length);
  for (var u = n.length, f = e.length, h = {}, d = new Array(u), m = 0; m < u; m++) {
    d[m] = -1;
    for (var g = 0, v = f; g < v; g++) {
      var w = a({
        currentValue: n,
        lastValue: t,
        formattedValue: e,
        currentValueIndex: m,
        formattedValueIndex: g
      });
      if (w && h[g] !== !0) {
        d[m] = g, h[g] = !0;
        break;
      }
    }
  }
  for (var x = o; x < u && (d[x] === -1 || !s(n[x])); )
    x++;
  var E = x === u || d[x] === -1 ? f : d[x];
  for (x = o - 1; x > 0 && d[x] === -1; )
    x--;
  var C = x === -1 || d[x] === -1 ? 0 : d[x] + 1;
  return C > E ? E : o - C < E - o ? C : E;
}
function ll(e, t, n, o) {
  var r = e.length;
  if (t = ly(t, 0, r), o === "left") {
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
function hy(e) {
  for (var t = Array.from({ length: e.length + 1 }).map(function() {
    return !0;
  }), n = 0, o = t.length; n < o; n++)
    t[n] = !!(Yo(e[n]) || Yo(e[n - 1]));
  return t;
}
function of(e, t, n, o, r, s) {
  s === void 0 && (s = hn);
  var a = al(function(g, v) {
    var w, x;
    return Zd(g) ? (x = "", w = "") : typeof g == "number" || v ? (x = typeof g == "number" ? tf(g) : g, w = o(x)) : (x = r(g, void 0), w = o(x)), { formattedValue: w, numAsString: x };
  }), i = p.useState(function() {
    return a(gn(e) ? t : e, n);
  }), c = i[0], u = i[1], f = al(function(g, v) {
    g.formattedValue !== c.formattedValue && u({
      formattedValue: g.formattedValue,
      numAsString: g.value
    }), s(g, v);
  }), h = e, d = n;
  gn(e) && (h = c.numAsString, d = !0);
  var m = a(h, d);
  return p.useMemo(function() {
    u(m);
  }, [m.formattedValue]), p.useEffect(function() {
    if (!gn(t) && gn(e) && c.formattedValue !== "") {
      var g = parseFloat(c.numAsString);
      f({
        formattedValue: c.formattedValue,
        value: c.numAsString,
        floatValue: isNaN(g) ? void 0 : g
      }, { event: void 0, source: go.props });
    }
  }, []), [c, f];
}
function my(e) {
  return e.replace(/[^0-9]/g, "");
}
function gy(e) {
  return e;
}
function vy(e) {
  var t = e.type;
  t === void 0 && (t = "text");
  var n = e.displayType;
  n === void 0 && (n = "input");
  var o = e.customInput, r = e.renderText, s = e.getInputRef, a = e.format;
  a === void 0 && (a = gy);
  var i = e.removeFormatting;
  i === void 0 && (i = my);
  var c = e.defaultValue, u = e.valueIsNumericString, f = e.onValueChange, h = e.isAllowed, d = e.onChange;
  d === void 0 && (d = hn);
  var m = e.onKeyDown;
  m === void 0 && (m = hn);
  var g = e.onMouseUp;
  g === void 0 && (g = hn);
  var v = e.onFocus;
  v === void 0 && (v = hn);
  var w = e.onBlur;
  w === void 0 && (w = hn);
  var x = e.value, E = e.getCaretBoundary;
  E === void 0 && (E = hy);
  var C = e.isValidInputCharacter;
  C === void 0 && (C = Yo);
  var k = e.isCharacterSame, R = Jd(e, ["type", "displayType", "customInput", "renderText", "getInputRef", "format", "removeFormatting", "defaultValue", "valueIsNumericString", "onValueChange", "isAllowed", "onChange", "onKeyDown", "onMouseUp", "onFocus", "onBlur", "value", "getCaretBoundary", "isValidInputCharacter", "isCharacterSame"]), P = of(x, c, !!u, a, i, f), S = P[0], y = S.formattedValue, N = S.numAsString, D = P[1], O = p.useRef(), z = p.useRef({ formattedValue: y, numAsString: N }), _ = function(V, X) {
    z.current = { formattedValue: V.formattedValue, numAsString: V.value }, D(V, X);
  }, F = p.useState(!1), $ = F[0], M = F[1], L = p.useRef(null), I = p.useRef({
    setCaretTimeout: null,
    focusTimeout: null
  });
  p.useEffect(function() {
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
  }, H = function(V, X, le) {
    V.selectionStart === 0 && V.selectionEnd === V.value.length || (An(V, X), I.current.setCaretTimeout = setTimeout(function() {
      V.value === le && V.selectionStart !== X && An(V, X);
    }, 0));
  }, W = function(V, X, le) {
    return ll(V, X, E(V), le);
  }, Y = function(V, X, le) {
    var je = E(X), Ie = py(X, y, V, le, je, C, k);
    return Ie = ll(X, Ie, je), Ie;
  }, ae = function(V) {
    var X = V.formattedValue;
    X === void 0 && (X = "");
    var le = V.input, je = V.source, Ie = V.event, me = V.numAsString, ge;
    if (le) {
      var we = V.inputValue || le.value, De = ea(le);
      le.value = X, ge = Y(we, X, De), ge !== void 0 && H(le, ge, X);
    }
    X !== y && _(B(X, me), { event: Ie, source: je });
  };
  p.useEffect(function() {
    var V = z.current, X = V.formattedValue, le = V.numAsString;
    (y !== X || N !== le) && _(B(y, N), {
      event: void 0,
      source: go.props
    });
  }, [y, N]);
  var fe = L.current ? ea(L.current) : void 0, ie = typeof window < "u" ? p.useLayoutEffect : p.useEffect;
  ie(function() {
    var V = L.current;
    if (y !== z.current.formattedValue && V) {
      var X = Y(z.current.formattedValue, y, fe);
      V.value = y, H(V, X, y);
    }
  }, [y]);
  var te = function(V, X, le) {
    var je = X.target, Ie = O.current ? cy(O.current, je.selectionEnd) : nf(y, V), me = Object.assign(Object.assign({}, Ie), { lastValue: y }), ge = i(V, me), we = A(ge);
    if (ge = i(we, void 0), h && !h(B(we, ge))) {
      var De = X.target, de = ea(De), vt = Y(V, y, de);
      return De.value = y, H(De, vt, y), !1;
    }
    return ae({
      formattedValue: we,
      numAsString: ge,
      inputValue: V,
      event: X,
      source: le,
      input: X.target
    }), !0;
  }, he = function(V, X) {
    X === void 0 && (X = 0);
    var le = V.selectionStart, je = V.selectionEnd;
    O.current = { selectionStart: le, selectionEnd: je + X };
  }, q = function(V) {
    var X = V.target, le = X.value, je = te(le, V, go.event);
    je && d(V), O.current = void 0;
  }, K = function(V) {
    var X = V.target, le = V.key, je = X.selectionStart, Ie = X.selectionEnd, me = X.value;
    me === void 0 && (me = "");
    var ge;
    le === "ArrowLeft" || le === "Backspace" ? ge = Math.max(je - 1, 0) : le === "ArrowRight" ? ge = Math.min(je + 1, me.length) : le === "Delete" && (ge = je);
    var we = 0;
    le === "Delete" && je === Ie && (we = 1);
    var De = le === "ArrowLeft" || le === "ArrowRight";
    if (ge === void 0 || je !== Ie && !De) {
      m(V), he(X, we);
      return;
    }
    var de = ge;
    if (De) {
      var vt = le === "ArrowLeft" ? "left" : "right";
      de = W(me, ge, vt), de !== ge && V.preventDefault();
    } else le === "Delete" && !C(me[ge]) ? de = W(me, ge, "right") : le === "Backspace" && !C(me[ge]) && (de = W(me, ge, "left"));
    de !== ge && H(X, de, me), m(V), he(X, we);
  }, ce = function(V) {
    var X = V.target, le = function() {
      var je = X.selectionStart, Ie = X.selectionEnd, me = X.value;
      if (me === void 0 && (me = ""), je === Ie) {
        var ge = W(me, je);
        ge !== je && H(X, ge, me);
      }
    };
    le(), requestAnimationFrame(function() {
      le();
    }), g(V), he(X);
  }, be = function(V) {
    V.persist && V.persist();
    var X = V.target, le = V.currentTarget;
    L.current = X, I.current.focusTimeout = setTimeout(function() {
      var je = X.selectionStart, Ie = X.selectionEnd, me = X.value;
      me === void 0 && (me = "");
      var ge = W(me, je);
      ge !== je && !(je === 0 && Ie === me.length) && H(X, ge, me), v(Object.assign(Object.assign({}, V), { currentTarget: le }));
    }, 0);
  }, pe = function(V) {
    L.current = null, clearTimeout(I.current.focusTimeout), clearTimeout(I.current.setCaretTimeout), w(V);
  }, Ce = $ && uy() ? "numeric" : void 0, ne = Object.assign({ inputMode: Ce }, R, {
    type: t,
    value: y,
    onChange: q,
    onKeyDown: K,
    onMouseUp: ce,
    onFocus: be,
    onBlur: pe
  });
  if (n === "text")
    return r ? pn.createElement(pn.Fragment, null, r(y, R) || null) : pn.createElement("span", Object.assign({}, R, { ref: s }), y);
  if (o) {
    var U = o;
    return pn.createElement(U, Object.assign({}, ne, { ref: s }));
  }
  return pn.createElement("input", Object.assign({}, ne, { ref: s }));
}
function ul(e, t) {
  var n = t.decimalScale, o = t.fixedDecimalScale, r = t.prefix;
  r === void 0 && (r = "");
  var s = t.suffix;
  s === void 0 && (s = "");
  var a = t.allowNegative, i = t.thousandsGroupStyle;
  if (i === void 0 && (i = "thousand"), e === "" || e === "-")
    return e;
  var c = Is(t), u = c.thousandSeparator, f = c.decimalSeparator, h = n !== 0 && e.indexOf(".") !== -1 || n && o, d = _i(e, a), m = d.beforeDecimal, g = d.afterDecimal, v = d.addNegation;
  return n !== void 0 && (g = ef(g, n, !!o)), u && (m = ay(m, u, i)), r && (m = r + m), s && (g = g + s), v && (m = "-" + m), e = m + (h && f || "") + g, e;
}
function Is(e) {
  var t = e.decimalSeparator;
  t === void 0 && (t = ".");
  var n = e.thousandSeparator, o = e.allowedDecimalSeparators;
  return n === !0 && (n = ","), o || (o = [t, "."]), {
    decimalSeparator: t,
    thousandSeparator: n,
    allowedDecimalSeparators: o
  };
}
function yy(e, t) {
  e === void 0 && (e = "");
  var n = new RegExp("(-)"), o = new RegExp("(-)(.)*(-)"), r = n.test(e), s = o.test(e);
  return e = e.replace(/-/g, ""), r && !s && t && (e = "-" + e), e;
}
function by(e, t) {
  return new RegExp("(^-)|[0-9]|" + Qd(e), "g");
}
function wy(e, t, n) {
  return e === "" ? !0 : !t?.match(/\d/) && !n?.match(/\d/) && typeof e == "string" && !isNaN(Number(e));
}
function xy(e, t, n) {
  var o;
  t === void 0 && (t = dy(e));
  var r = n.allowNegative, s = n.prefix;
  s === void 0 && (s = "");
  var a = n.suffix;
  a === void 0 && (a = "");
  var i = n.decimalScale, c = t.from, u = t.to, f = u.start, h = u.end, d = Is(n), m = d.allowedDecimalSeparators, g = d.decimalSeparator, v = e[h] === g;
  if (Yo(e) && (e === s || e === a) && t.lastValue === "")
    return e;
  if (h - f === 1 && m.indexOf(e[f]) !== -1) {
    var w = i === 0 ? "" : g;
    e = e.substring(0, f) + w + e.substring(f + 1, e.length);
  }
  var x = function(L, I, A) {
    var B = !1, H = !1;
    s.startsWith("-") ? B = !1 : L.startsWith("--") ? (B = !1, H = !0) : a.startsWith("-") && L.length === a.length ? B = !1 : L[0] === "-" && (B = !0);
    var W = B ? 1 : 0;
    return H && (W = 2), W && (L = L.substring(W), I -= W, A -= W), { value: L, start: I, end: A, hasNegation: B };
  }, E = x(e, f, h), C = E.hasNegation;
  o = E, e = o.value, f = o.start, h = o.end;
  var k = x(t.lastValue, c.start, c.end), R = k.start, P = k.end, S = k.value, y = e.substring(f, h);
  e.length && S.length && (R > S.length - a.length || P < s.length) && !(y && a.startsWith(y)) && (e = S);
  var N = 0;
  e.startsWith(s) ? N += s.length : f < s.length && (N = f), e = e.substring(N), h -= N;
  var D = e.length, O = e.length - a.length;
  e.endsWith(a) ? D = O : (h > O || h > e.length - a.length) && (D = h), e = e.substring(0, D), e = yy(C ? "-" + e : e, r), e = (e.match(by(g)) || []).join("");
  var z = e.indexOf(g);
  e = e.replace(new RegExp(Qd(g), "g"), function(L, I) {
    return I === z ? "." : "";
  });
  var _ = _i(e, r), F = _.beforeDecimal, $ = _.afterDecimal, M = _.addNegation;
  return u.end - u.start < c.end - c.start && F === "" && v && !parseFloat($) && (e = M ? "-" : ""), e;
}
function Sy(e, t) {
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
function Cy(e) {
  var t = Is(e), n = t.thousandSeparator, o = t.decimalSeparator, r = e.prefix;
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
function jy(e) {
  e = Cy(e), e.decimalSeparator, e.allowedDecimalSeparators, e.thousandsGroupStyle;
  var t = e.suffix, n = e.allowNegative, o = e.allowLeadingZeros, r = e.onKeyDown;
  r === void 0 && (r = hn);
  var s = e.onBlur;
  s === void 0 && (s = hn);
  var a = e.thousandSeparator, i = e.decimalScale, c = e.fixedDecimalScale, u = e.prefix;
  u === void 0 && (u = "");
  var f = e.defaultValue, h = e.value, d = e.valueIsNumericString, m = e.onValueChange, g = Jd(e, ["decimalSeparator", "allowedDecimalSeparators", "thousandsGroupStyle", "suffix", "allowNegative", "allowLeadingZeros", "onKeyDown", "onBlur", "thousandSeparator", "decimalScale", "fixedDecimalScale", "prefix", "defaultValue", "value", "valueIsNumericString", "onValueChange"]), v = Is(e), w = v.decimalSeparator, x = v.allowedDecimalSeparators, E = function(M) {
    return ul(M, e);
  }, C = function(M, L) {
    return xy(M, L, e);
  }, k = gn(h) ? f : h, R = d ?? wy(k, u, t);
  gn(h) ? gn(f) || (R = R || typeof f == "number") : R = R || typeof h == "number";
  var P = function(M) {
    return Zd(M) ? M : (typeof M == "number" && (M = tf(M)), R && typeof i == "number" ? cl(M, i, !!c) : M);
  }, S = of(P(h), P(f), !!R, E, C, m), y = S[0], N = y.numAsString, D = y.formattedValue, O = S[1], z = function(M) {
    var L = M.target, I = M.key, A = L.selectionStart, B = L.selectionEnd, H = L.value;
    if (H === void 0 && (H = ""), (I === "Backspace" || I === "Delete") && B < u.length && H !== "-") {
      M.preventDefault();
      return;
    }
    if (A !== B) {
      r(M);
      return;
    }
    I === "Backspace" && H[0] === "-" && A === u.length + 1 && n && An(L, 1), i && c && (I === "Backspace" && H[A - 1] === w ? (An(L, A - 1), M.preventDefault()) : I === "Delete" && H[A] === w && M.preventDefault()), x?.includes(I) && H[A] === w && An(L, A + 1);
    var W = a === !0 ? "," : a;
    I === "Backspace" && H[A - 1] === W && An(L, A - 1), I === "Delete" && H[A] === W && An(L, A + 1), r(M);
  }, _ = function(M) {
    var L = N;
    if (L.match(/\d/g) || (L = ""), o || (L = iy(L)), c && i && (L = cl(L, i, c)), L !== N) {
      var I = ul(L, e);
      O({
        formattedValue: I,
        value: L,
        floatValue: parseFloat(L)
      }, {
        event: M,
        source: go.event
      });
    }
    s(M);
  }, F = function(M) {
    return M === w ? !0 : Yo(M);
  }, $ = function(M) {
    var L = M.currentValue, I = M.lastValue, A = M.formattedValue, B = M.currentValueIndex, H = M.formattedValueIndex, W = L[B], Y = A[H], ae = nf(I, L), fe = ae.to, ie = function(te) {
      return C(te).indexOf(".") + u.length;
    };
    return h === 0 && c && i && L[fe.start] === w && ie(L) < B && ie(A) > H ? !1 : B >= fe.start && B < fe.end && x && x.includes(W) && Y === w ? !0 : W === Y;
  };
  return Object.assign(Object.assign({}, g), {
    value: D,
    valueIsNumericString: !1,
    isValidInputCharacter: F,
    isCharacterSame: $,
    onValueChange: O,
    format: E,
    removeFormatting: C,
    getCaretBoundary: function(M) {
      return Sy(M, e);
    },
    onKeyDown: z,
    onBlur: _
  });
}
function ky(e) {
  var t = jy(e);
  return pn.createElement(vy, Object.assign({}, t));
}
function dl(e, t) {
  return /\d/.test(e) || e === t;
}
function Ey(e, t, n, o) {
  let r = 0;
  for (let s = 0; s < t && s < e.length; s += 1) dl(e[s], o) && (r += 1);
  if (r === 0) return Math.min(t, n.length);
  for (let s = 0; s < n.length; s += 1) if (dl(n[s], o) && (r -= 1, r === 0))
    return s + 1;
  return n.length;
}
function Ry(e, t) {
  let n = 0;
  for (; t + n < e.length && /\d/.test(e[t + n]); ) n += 1;
  return n;
}
function Ny(e, { decimalSeparator: t, thousandSeparator: n, allowedDecimalSeparators: o, thousandsGroupStyle: r }) {
  const s = new Set([...o, t].filter((m) => m.length === 1)), a = e.split(""), i = a.reduce((m, g, v) => (s.has(g) && m.push(v), m), []);
  if (i.length === 0) return e;
  const c = i[i.length - 1], u = a[c], f = i.filter((m) => a[m] === u).length, h = r === "wan" ? 4 : 3;
  let d = -1;
  return f === 1 && (u === t ? d = c : u === n ? d = Ry(e, c + 1) === h ? -1 : c : d = c), a.map((m, g) => g === d ? t : s.has(m) && m !== n ? "" : m).join("");
}
function fl({ direction: e, style: t, ...n }) {
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
var ka = {
  root: "m_e2f5cd4e",
  controls: "m_95e17d22",
  control: "m_80b4b171"
};
const Ty = /^(0\.0*|-0(\.0*)?)$/, pl = /^-?0\d+(\.\d+)?\.?$/, Py = /\.\d*0$/, rf = /^-?\d+\.$/;
function Ea(e) {
  return typeof e == "string" && e !== "" && !Number.isNaN(Number(e));
}
function ta(e) {
  return typeof e == "bigint";
}
function na(e) {
  return typeof e == "number" ? e < Number.MAX_SAFE_INTEGER : e === "" || Ea(e) && Number(e) < Number.MAX_SAFE_INTEGER;
}
function sf(e, t) {
  return e === "" || e === "-" || !t && e.startsWith("-") ? !1 : /^-?\d+$/.test(e);
}
function oa(e, t) {
  return typeof e == "bigint" ? !0 : e === "" || sf(e, t);
}
function $o(e) {
  if (!/^-?\d+$/.test(e)) return null;
  try {
    return BigInt(e);
  } catch {
    return null;
  }
}
function Ir(e) {
  if (typeof e == "bigint") return e;
  if (typeof e == "number" && Number.isFinite(e) && Number.isInteger(e)) return BigInt(e);
}
function Fr(e, t, n) {
  return t !== void 0 && e < t ? t : n !== void 0 && e > n ? n : e;
}
function Ay(e) {
  return e.toString().replace(".", "").length;
}
function Iy(e, t) {
  return (typeof e == "number" ? e < Number.MAX_SAFE_INTEGER : !Number.isNaN(Number(e))) && !Number.isNaN(e) && Ay(t) < 14 && t !== "";
}
function My(e, t, n) {
  return e === void 0 ? !0 : (t === void 0 || e >= t) && (n === void 0 || e <= n);
}
const ra = {
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
}, af = ze((e, { size: t }) => ({ controls: { "--ni-chevron-size": _e(t, "ni-chevron-size") } }));
function hl(e, t) {
  return t ? `${e}.` : e;
}
function Dy(e, t) {
  const n = rf.test(e), o = t.trim ? e.replace(/^0+(?=\d)/, "") : e, r = parseFloat(o);
  if (Number.isNaN(r)) return o;
  if (!t.clamp) return t.trim ? hl(r, n) : e;
  const s = r > Number.MAX_SAFE_INTEGER && t.max !== void 0 ? t.max : bn(r, t.min, t.max);
  return !t.trim && s === r ? e : hl(s, n);
}
function Oy(e, t) {
  if (e === "" || e === "-") return e;
  const n = $o(e);
  return n === null ? e : t.clampBehavior === "blur" ? Fr(n, t.min, t.max) : n;
}
const Go = En((e) => {
  const t = Z([
    "Input",
    "InputWrapper",
    "NumberInput"
  ], ra, e), { className: n, classNames: o, styles: r, unstyled: s, vars: a, onChange: i, onValueChange: c, value: u, defaultValue: f, max: h, min: d, step: m, hideControls: g, rightSection: v, isAllowed: w, clampBehavior: x, onBlur: E, allowDecimal: C, decimalScale: k, onKeyDown: R, onKeyDownCapture: P, handlersRef: S, startValue: y, disabled: N, rightSectionPointerEvents: D, allowNegative: O, readOnly: z, size: _, rightSectionWidth: F, stepHoldInterval: $, stepHoldDelay: M, allowLeadingZeros: L, withKeyboardEvents: I, trimLeadingZeroesOnBlur: A, allowedDecimalSeparators: B, selectAllOnFocus: H, onMinReached: W, onMaxReached: Y, onFocus: ae, attributes: fe, ref: ie, ...te } = t, he = O ?? !0, q = L ?? !0, K = Me({
    name: "NumberInput",
    classes: ka,
    props: t,
    classNames: o,
    styles: r,
    unstyled: s,
    attributes: fe,
    vars: a,
    varsResolver: af
  }), { resolvedClassNames: ce, resolvedStyles: be } = cr({
    classNames: o,
    styles: r,
    props: t
  }), pe = p.useRef(ta(u) || ta(f) ? "bigint" : "number");
  ta(u) ? pe.current = "bigint" : typeof u == "number" && (pe.current = "number");
  const Ce = pe.current === "bigint", [ne, U] = Ze({
    value: u,
    defaultValue: f,
    finalValue: "",
    onChange: i
  }), V = M !== void 0 && $ !== void 0, X = p.useRef(null), le = p.useRef(null), je = p.useRef(0), Ie = typeof d == "number" ? d : void 0, me = typeof h == "number" ? h : void 0, ge = typeof m == "number" ? m : ra.step, we = typeof y == "number" ? y : ra.startValue, De = Ir(d), de = Ir(h), vt = Ir(m) ?? BigInt(1), Te = Ir(y) ?? BigInt(0), yt = (G) => !sf(G, he) || q && pl.test(G) ? G : $o(G) ?? G, Hn = (G) => {
    const re = Number(G);
    return Number.isSafeInteger(re) ? re : void 0;
  }, At = (G, re) => {
    re.source === "event" && U(Ce ? yt(G.value) : Iy(G.floatValue, G.value) && !Ty.test(G.value) && !(q && pl.test(G.value)) && !Py.test(G.value) && !rf.test(G.value) ? G.floatValue : G.value), c?.(G, re);
  }, ln = (G) => {
    const re = String(G).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    return re ? Math.max(0, (re[1] ? re[1].length : 0) - (re[2] ? +re[2] : 0)) : 0;
  }, It = (G) => {
    X.current && typeof G < "u" && X.current.setSelectionRange(G, G);
  }, Un = p.useRef(Kr);
  Un.current = () => {
    if (Ce) {
      if (!oa(ne, he)) return;
      let qe;
      const Ke = ne;
      if (typeof Ke == "bigint") {
        const it = Ke + vt;
        de !== void 0 && it > de && Y?.(), qe = de !== void 0 && it > de ? de : it;
      } else if (typeof Ke == "string" && Ke !== "") {
        const it = $o(Ke);
        if (it === null) return;
        const dn = it + vt;
        de !== void 0 && dn > de && Y?.(), qe = de !== void 0 && dn > de ? de : dn;
      } else qe = Fr(Te, De, de);
      const Je = qe.toString();
      U(qe), c?.({
        floatValue: Hn(qe),
        formattedValue: Je,
        value: Je
      }, { source: "increment" }), setTimeout(() => It(X.current?.value.length), 0);
      return;
    }
    if (!na(ne)) return;
    let G;
    const re = ln(ne), qn = ln(ge), Kn = Math.max(re, qn), bt = 10 ** Kn;
    if (!Ea(ne) && (typeof ne != "number" || Number.isNaN(ne))) G = bn(we, Ie, me);
    else if (me !== void 0) {
      const qe = (Math.round(Number(ne) * bt) + Math.round(ge * bt)) / bt;
      qe > me && Y?.(), G = qe <= me ? qe : me;
    } else G = (Math.round(Number(ne) * bt) + Math.round(ge * bt)) / bt;
    const nt = G.toFixed(Kn);
    U(parseFloat(nt)), c?.({
      floatValue: parseFloat(nt),
      formattedValue: nt,
      value: nt
    }, { source: "increment" }), setTimeout(() => It(X.current?.value.length), 0);
  };
  const Wn = p.useRef(Kr);
  Wn.current = () => {
    if (Ce) {
      if (!oa(ne, he)) return;
      let Ke;
      const Je = De !== void 0 ? De : he ? void 0 : BigInt(0), it = ne;
      if (typeof it == "bigint") {
        const Xn = it - vt;
        Je !== void 0 && Xn < Je && W?.(), Ke = Je !== void 0 && Xn < Je ? Je : Xn;
      } else if (typeof it == "string" && it !== "") {
        const Xn = $o(it);
        if (Xn === null) return;
        const Us = Xn - vt;
        Je !== void 0 && Us < Je && W?.(), Ke = Je !== void 0 && Us < Je ? Je : Us;
      } else Ke = Fr(Te, Je, de);
      const dn = Ke.toString();
      U(Ke), c?.({
        floatValue: Hn(Ke),
        formattedValue: dn,
        value: dn
      }, { source: "decrement" }), setTimeout(() => It(X.current?.value.length), 0);
      return;
    }
    if (!na(ne)) return;
    let G;
    const re = Ie !== void 0 ? Ie : he ? Number.MIN_SAFE_INTEGER : 0, qn = ln(ne), Kn = ln(ge), bt = Math.max(qn, Kn), nt = 10 ** bt;
    if (!Ea(ne) && typeof ne != "number" || Number.isNaN(ne)) G = bn(we, re, me);
    else {
      const Ke = (Math.round(Number(ne) * nt) - Math.round(ge * nt)) / nt;
      re !== void 0 && Ke < re && W?.(), G = re !== void 0 && Ke < re ? re : Ke;
    }
    const qe = G.toFixed(bt);
    U(parseFloat(qe)), c?.({
      floatValue: parseFloat(qe),
      formattedValue: qe,
      value: qe
    }, { source: "decrement" }), setTimeout(() => It(X.current?.value.length), 0);
  };
  const et = (G) => {
    const re = G.clipboardData.getData("text"), qn = te.decimalSeparator || ".", Kn = te.thousandSeparator === !0 ? "," : te.thousandSeparator === !1 ? void 0 : te.thousandSeparator, bt = Ny(re, {
      decimalSeparator: qn,
      thousandSeparator: Kn,
      allowedDecimalSeparators: B || [".", ","],
      thousandsGroupStyle: te.thousandsGroupStyle
    });
    if (bt !== re) {
      G.preventDefault();
      const nt = X.current;
      if (nt) {
        const qe = nt.selectionStart ?? 0, Ke = nt.selectionEnd ?? 0, Je = nt.value, it = Je.substring(0, qe) + bt + Je.substring(Ke);
        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set?.call(nt, it), nt.dispatchEvent(new Event("change", { bubbles: !0 }));
        const dn = qe + bt.length;
        setTimeout(() => It(Ey(it, dn, nt.value, qn)), 0);
      }
    }
    te.onPaste?.(G);
  }, Vt = (G) => {
    R?.(G), !(z || !I) && (G.key === "ArrowUp" && (G.preventDefault(), Un.current?.()), G.key === "ArrowDown" && (G.preventDefault(), Wn.current?.()));
  }, Er = (G) => {
    if (P?.(G), G.key === "Backspace") {
      const re = X.current;
      re && re.selectionStart === 0 && re.selectionStart === re.selectionEnd && (G.preventDefault(), window.setTimeout(() => It(0), 0));
    }
  }, Rr = (G) => {
    H && window.setTimeout(() => X.current?.select(), 0), ae?.(G);
  }, Hs = (G) => {
    let re = ne;
    Ce ? (x === "blur" && typeof re == "bigint" && (re = Fr(re, De, de)), A && typeof re == "string" && (re = Oy(re, {
      min: De,
      max: de,
      clampBehavior: x
    }))) : typeof re == "number" ? x === "blur" && (re = bn(re, Ie, me)) : typeof re == "string" && (re = Dy(re, {
      min: Ie,
      max: me,
      trim: !!A && ln(re) < 15,
      clamp: x === "blur"
    })), ne !== re && U(re), E?.(G);
  };
  Ql(S, {
    increment: Un.current,
    decrement: Wn.current
  });
  const Nr = (G) => {
    G ? Un.current?.() : Wn.current?.(), je.current += 1;
  }, We = (G) => {
    if (Nr(G), V) {
      const re = typeof $ == "number" ? $ : $(je.current);
      le.current = window.setTimeout(() => We(G), re);
    }
  }, tt = (G, re) => {
    G.preventDefault(), X.current?.focus(), Nr(re), V && (le.current = window.setTimeout(() => We(re), M));
  }, un = () => {
    le.current && window.clearTimeout(le.current), le.current = null, je.current = 0;
  }, xp = /* @__PURE__ */ l.jsxs("div", {
    ...K("controls"),
    children: [/* @__PURE__ */ l.jsx($n, {
      ...K("control"),
      tabIndex: -1,
      "aria-hidden": !0,
      disabled: N || typeof ne == "number" && me !== void 0 && ne >= me || typeof ne == "bigint" && de !== void 0 && ne >= de,
      mod: { direction: "up" },
      onMouseDown: (G) => G.preventDefault(),
      onPointerDown: (G) => {
        tt(G, !0);
      },
      onPointerUp: un,
      onPointerLeave: un,
      children: /* @__PURE__ */ l.jsx(fl, { direction: "up" })
    }), /* @__PURE__ */ l.jsx($n, {
      ...K("control"),
      tabIndex: -1,
      "aria-hidden": !0,
      disabled: N || typeof ne == "number" && Ie !== void 0 && ne <= Ie || typeof ne == "bigint" && De !== void 0 && ne <= De,
      mod: { direction: "down" },
      onMouseDown: (G) => G.preventDefault(),
      onPointerDown: (G) => {
        tt(G, !1);
      },
      onPointerUp: un,
      onPointerLeave: un,
      children: /* @__PURE__ */ l.jsx(fl, { direction: "down" })
    })]
  });
  return /* @__PURE__ */ l.jsx(St, {
    component: ky,
    allowNegative: O,
    className: nn(ka.root, n),
    size: _,
    ...te,
    inputMode: Ce ? "numeric" : "decimal",
    readOnly: z,
    disabled: N,
    value: typeof ne == "bigint" ? ne.toString() : ne,
    getInputRef: Ve(ie, X),
    onValueChange: At,
    rightSection: g || z || !(Ce ? oa(ne, he) : na(ne)) ? v : v || xp,
    classNames: ce,
    styles: be,
    unstyled: s,
    __staticSelector: "NumberInput",
    decimalScale: Ce ? 0 : C ? k : 0,
    onPaste: et,
    onFocus: Rr,
    onKeyDown: Vt,
    onKeyDownCapture: Er,
    rightSectionPointerEvents: D ?? (N ? "none" : void 0),
    rightSectionWidth: F ?? `var(--ni-right-section-width-${_ || "sm"})`,
    allowLeadingZeros: L,
    allowedDecimalSeparators: B,
    onBlur: Hs,
    attributes: fe,
    isAllowed: (G) => {
      if (!(!w || w(G))) return !1;
      if (x !== "strict") return !0;
      if (!Ce) return My(G.floatValue, Ie, me);
      if (G.value === "" || G.value === "-") return !0;
      const re = $o(G.value);
      return re === null ? !0 : (De === void 0 || re >= De) && (de === void 0 || re <= de);
    }
  });
});
Go.classes = {
  ...St.classes,
  ...ka
};
Go.varsResolver = af;
Go.displayName = "@mantine/core/NumberInput";
const Fi = p.createContext(null), Bi = En(((e) => {
  const { value: t, defaultValue: n, onChange: o, size: r, wrapperProps: s, children: a, name: i, readOnly: c, disabled: u, ...f } = Z("RadioGroup", null, e), h = Bt(i), [d, m] = Ze({
    value: t,
    defaultValue: n,
    finalValue: "",
    onChange: o
  }), g = (v) => !c && m(typeof v == "string" ? v : v.currentTarget.value);
  return /* @__PURE__ */ l.jsx(Fi, {
    value: {
      value: d,
      onChange: g,
      size: r,
      name: h,
      disabled: u
    },
    children: /* @__PURE__ */ l.jsx(Rt.Wrapper, {
      size: r,
      ...s,
      ...f,
      labelElement: "div",
      __staticSelector: "RadioGroup",
      children: /* @__PURE__ */ l.jsx(Sd, {
        role: "radiogroup",
        children: a
      })
    })
  });
}));
Bi.classes = Rt.Wrapper.classes;
Bi.displayName = "@mantine/core/RadioGroup";
var cf = { card: "m_9dc8ae12" };
const lf = p.createContext(null), $y = { withBorder: !0 }, uf = ze((e, { radius: t }) => ({ card: { "--card-radius": Tt(t) } })), Ms = se((e) => {
  const t = Z("RadioCard", $y, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, checked: c, mod: u, withBorder: f, value: h, onClick: d, name: m, onKeyDown: g, attributes: v, ...w } = t, x = Me({
    name: "RadioCard",
    classes: cf,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: v,
    vars: i,
    varsResolver: uf,
    rootSelector: "card"
  }), { dir: E } = Co(), C = p.use(Fi), k = typeof c == "boolean" ? c : C?.value === h || !1, R = m || C?.name, P = (S) => {
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
  return /* @__PURE__ */ l.jsx(lf, {
    value: { checked: k },
    children: /* @__PURE__ */ l.jsx($n, {
      mod: [{
        "with-border": f,
        checked: k
      }, u],
      ...x("card"),
      ...w,
      role: "radio",
      "aria-checked": k,
      name: R,
      onClick: (S) => {
        d?.(S), C?.onChange(h || "");
      },
      onKeyDown: P
    })
  });
});
Ms.displayName = "@mantine/core/RadioCard";
Ms.classes = cf;
Ms.varsResolver = uf;
var df = {
  indicator: "m_717d7ff6",
  icon: "m_3e4da632",
  "indicator--outline": "m_2980836c"
};
const Ly = { icon: Kd }, ff = ze((e, { radius: t, color: n, size: o, iconColor: r, variant: s, autoContrast: a }) => {
  const i = cs({
    color: n || e.primaryColor,
    theme: e
  }), c = i.isThemeColor && i.shade === void 0 ? `var(--mantine-color-${i.color}-outline)` : i.color;
  return { indicator: {
    "--radio-size": _e(o, "radio-size"),
    "--radio-radius": t === void 0 ? void 0 : Tt(t),
    "--radio-color": s === "outline" ? c : at(n, e),
    "--radio-icon-size": typeof o == "number" ? `calc(${_e(o, "radio-size")} * 0.4)` : _e(o, "radio-icon-size"),
    "--radio-icon-color": r ? at(r, e) : ur(a, e) ? xo({
      color: n,
      theme: e,
      autoContrast: a
    }) : void 0
  } };
}), Ds = se((e) => {
  const t = Z("RadioIndicator", Ly, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, icon: c, radius: u, color: f, iconColor: h, autoContrast: d, checked: m, mod: g, variant: v, disabled: w, attributes: x, ...E } = t, C = Me({
    name: "RadioIndicator",
    classes: df,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: x,
    vars: i,
    varsResolver: ff,
    rootSelector: "indicator"
  }), k = p.use(lf), R = typeof m == "boolean" ? m : k?.checked || !1;
  return /* @__PURE__ */ l.jsx(Q, {
    ...C("indicator", { variant: v }),
    variant: v,
    mod: [{
      checked: R,
      disabled: w
    }, g],
    ...E,
    children: /* @__PURE__ */ l.jsx(c, { ...C("icon") })
  });
});
Ds.displayName = "@mantine/core/RadioIndicator";
Ds.classes = df;
Ds.varsResolver = ff;
var pf = {
  root: "m_f3f1af94",
  inner: "m_89c4f5e4",
  icon: "m_f3ed6b2b",
  radio: "m_8a3dbb89",
  "radio--outline": "m_1bfe9d39"
};
const zy = {
  labelPosition: "right",
  withErrorStyles: !0
}, hf = ze((e, { size: t, radius: n, color: o, iconColor: r, variant: s, autoContrast: a }) => {
  const i = cs({
    color: o || e.primaryColor,
    theme: e
  }), c = i.isThemeColor && i.shade === void 0 ? `var(--mantine-color-${i.color}-outline)` : i.color;
  return { root: {
    "--radio-size": _e(t, "radio-size"),
    "--radio-radius": n === void 0 ? void 0 : Tt(n),
    "--radio-color": s === "outline" ? c : at(o, e),
    "--radio-icon-color": r ? at(r, e) : ur(a, e) ? xo({
      color: o,
      theme: e,
      autoContrast: a
    }) : void 0,
    "--radio-icon-size": _e(t, "radio-icon-size")
  } };
}), kn = se((e) => {
  const t = Z("Radio", zy, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, id: c, size: u, label: f, labelPosition: h, description: d, error: m, radius: g, color: v, variant: w, disabled: x, wrapperProps: E, icon: C = Kd, rootRef: k, iconColor: R, onChange: P, mod: S, attributes: y, withErrorStyles: N, checked: D, ...O } = t, z = Me({
    name: "Radio",
    classes: pf,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: y,
    vars: i,
    varsResolver: hf
  }), _ = p.use(Fi), F = _?.size ?? u, $ = t.size ? u : F, { styleProps: M, rest: L } = Yl(O), I = Bt(c), A = [
    d ? `${I}-description` : void 0,
    m && typeof m != "boolean" ? `${I}-error` : void 0,
    L["aria-describedby"]
  ].filter(Boolean).join(" ") || void 0, B = _ ? _.value === L.value : void 0, H = {
    checked: B ?? D,
    name: L.name ?? _?.name,
    onChange: (W) => {
      _?.onChange(W), P?.(W);
    },
    disabled: _?.disabled ?? x
  };
  return /* @__PURE__ */ l.jsx(Mi, {
    ...z("root"),
    __staticSelector: "Radio",
    __stylesApiProps: t,
    id: I,
    size: $,
    labelPosition: h,
    label: f,
    description: d,
    error: m,
    disabled: H.disabled,
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
      mod: { "label-position": h },
      children: [/* @__PURE__ */ l.jsx(Q, {
        ...z("radio", {
          focusable: !0,
          variant: w
        }),
        ...L,
        ...H,
        component: "input",
        mod: {
          error: !!m,
          "with-error-styles": N
        },
        id: I,
        type: "radio",
        "aria-describedby": A
      }), /* @__PURE__ */ l.jsx(C, {
        ...z("icon"),
        "aria-hidden": !0
      })]
    })
  });
});
kn.classes = pf;
kn.varsResolver = hf;
kn.displayName = "@mantine/core/Radio";
kn.Group = Bi;
kn.Card = Ms;
kn.Indicator = Ds;
var mf = {
  root: "m_cf365364",
  indicator: "m_9e182ccd",
  label: "m_1738fcb2",
  input: "m_1714d588",
  control: "m_69686b9b",
  innerLabel: "m_78882f40"
};
const _y = { withItemsBorders: !0 }, gf = ze((e, { radius: t, color: n, transitionDuration: o, size: r, transitionTimingFunction: s }) => ({ root: {
  "--sc-radius": t === void 0 ? void 0 : Tt(t),
  "--sc-color": n ? at(n, e) : void 0,
  "--sc-shadow": n ? void 0 : "var(--mantine-shadow-xs)",
  "--sc-transition-duration": o === void 0 ? void 0 : `${o}ms`,
  "--sc-transition-timing-function": s,
  "--sc-padding": _e(r, "sc-padding"),
  "--sc-font-size": Wr(r)
} })), mr = En((e) => {
  const t = Z("SegmentedControl", _y, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, data: c, value: u, defaultValue: f, onChange: h, size: d, name: m, disabled: g, readOnly: v, fullWidth: w, orientation: x, radius: E, color: C, transitionDuration: k, transitionTimingFunction: R, variant: P, autoContrast: S, withItemsBorders: y, mod: N, attributes: D, ref: O, ...z } = t, _ = Me({
    name: "SegmentedControl",
    props: t,
    classes: mf,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: D,
    vars: i,
    varsResolver: gf
  }), F = ir(), $ = c.map((K) => wh(K) ? {
    label: `${K}`,
    value: K
  } : K), M = fh(), [L, I] = p.useState(xc()), [A, B] = p.useState(null), [H, W] = p.useState({}), Y = (K, ce) => {
    K === null || H[ce] === K || (H[ce] = K, W({ ...H }));
  }, [ae, fe] = Ze({
    value: u,
    defaultValue: f,
    finalValue: Array.isArray(c) ? $.find((K) => !K.disabled)?.value ?? c[0]?.value ?? null : null,
    onChange: h
  }), ie = Bt(m), te = $.map((K) => `${K.value}`), he = $.map((K) => /* @__PURE__ */ p.createElement(Q, {
    ..._("control"),
    mod: {
      active: ae === K.value,
      orientation: x
    },
    key: `${K.value}`
  }, /* @__PURE__ */ p.createElement("input", {
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
  }), /* @__PURE__ */ p.createElement(Q, {
    component: "label",
    ..._("label"),
    mod: {
      active: ae === K.value && !(g || K.disabled),
      disabled: g || K.disabled,
      "read-only": v
    },
    htmlFor: `${ie}-${K.value}`,
    ref: (ce) => Y(ce, `${K.value}`),
    __vars: { "--sc-label-color": C !== void 0 ? xo({
      color: C,
      theme: F,
      autoContrast: S
    }) : void 0 },
    key: `${K.value}-label`
  }, /* @__PURE__ */ l.jsx("span", {
    ..._("innerLabel"),
    children: K.label
  })))), q = Ve(O, B);
  return kc(() => {
    I(xc());
  }, [c.length]), kc(() => {
    W((K) => {
      const ce = {};
      return te.forEach((be) => {
        be in K && (ce[be] = K[be]);
      }), Object.keys(ce).length === Object.keys(K).length ? K : ce;
    });
  }, [te]), c.length === 0 ? null : /* @__PURE__ */ l.jsxs(Q, {
    ..._("root"),
    variant: P,
    size: d,
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
    children: [typeof ae < "u" && /* @__PURE__ */ l.jsx(bs, {
      target: H[`${ae}`],
      parent: A,
      component: "span",
      transitionDuration: "var(--sc-transition-duration)",
      ..._("indicator")
    }, L), he]
  });
});
mr.classes = mf;
mr.varsResolver = gf;
mr.displayName = "@mantine/core/SegmentedControl";
const Fy = {
  size: "sm",
  withCheckIcon: !0,
  allowDeselect: !0,
  checkIconPosition: "left",
  openOnFocus: !0
}, co = En((e) => {
  const t = Z([
    "Input",
    "InputWrapper",
    "Select"
  ], Fy, e), { classNames: n, styles: o, unstyled: r, vars: s, dropdownOpened: a, defaultDropdownOpened: i, onDropdownClose: c, onDropdownOpen: u, onFocus: f, onBlur: h, onClick: d, onChange: m, data: g, value: v, defaultValue: w, selectFirstOptionOnChange: x, selectFirstOptionOnDropdownOpen: E, onOptionSubmit: C, comboboxProps: k, readOnly: R, disabled: P, filter: S, limit: y, withScrollArea: N, maxDropdownHeight: D, floatingHeight: O, size: z, searchable: _, rightSection: F, checkIconPosition: $, withCheckIcon: M, withAlignedLabels: L, nothingFoundMessage: I, name: A, form: B, searchValue: H, defaultSearchValue: W, onSearchChange: Y, allowDeselect: ae, error: fe, rightSectionPointerEvents: ie, id: te, clearable: he, clearSectionMode: q, clearButtonProps: K, hiddenInputProps: ce, renderOption: be, onClear: pe, autoComplete: Ce, scrollAreaProps: ne, __defaultRightSection: U, __clearSection: V, __clearable: X, chevronColor: le, autoSelectOnBlur: je, openOnFocus: Ie, attributes: me, ...ge } = t, we = p.useMemo(() => pd(g), [g]), De = p.useRef({}), de = p.useMemo(() => hd(we), [we]), vt = Bt(te), [Te, yt, Hn] = Ze({
    value: v,
    defaultValue: w,
    finalValue: null,
    onChange: m
  }), At = Te != null ? `${Te}` in de ? de[`${Te}`] : De.current[`${Te}`] : void 0, ln = ch(At), [It, Un, Wn] = Ze({
    value: H,
    defaultValue: W,
    finalValue: At ? At.label : "",
    onChange: Y
  }), et = Ti({
    opened: a,
    defaultOpened: i,
    onDropdownOpen: () => {
      u?.(), E ? et.selectFirstOption() : et.updateSelectedOptionIndex("active", { scrollIntoView: !0 });
    },
    onDropdownClose: () => {
      c?.(), setTimeout(et.resetSelectedOption, 0);
    }
  }), Vt = (We) => {
    Un(We), et.resetSelectedOption();
  }, { resolvedClassNames: Er, resolvedStyles: Rr } = cr({
    props: t,
    styles: o,
    classNames: n
  });
  p.useEffect(() => {
    x && et.selectFirstOption();
  }, [x, It]), p.useEffect(() => {
    v === null && Vt(""), v != null && At && (ln?.value !== At.value || ln?.label !== At.label) && Vt(At.label);
  }, [v, At]), p.useEffect(() => {
    !Hn && !Wn && Vt(Te != null ? `${Te}` in de ? de[`${Te}`]?.label : De.current[`${Te}`]?.label || "" : "");
  }, [de, Te]), p.useEffect(() => {
    Te && `${Te}` in de && (De.current[`${Te}`] = de[`${Te}`]);
  }, [de, Te]);
  const Hs = /* @__PURE__ */ l.jsx(xe.ClearButton, {
    ...K,
    onClear: () => {
      yt(null, null), Vt(""), pe?.();
    }
  }), Nr = he && Te != null && !P && !R;
  return /* @__PURE__ */ l.jsxs(l.Fragment, { children: [/* @__PURE__ */ l.jsxs(xe, {
    store: et,
    __staticSelector: "Select",
    classNames: Er,
    styles: Rr,
    unstyled: r,
    readOnly: R,
    size: z,
    attributes: me,
    floatingHeight: O,
    keepMounted: je,
    onOptionSubmit: (We) => {
      C?.(We);
      const tt = ae && `${de[We].value}` == `${Te}` ? null : de[We], un = tt ? tt.value : null;
      un !== Te && yt(un, tt), !Hn && Vt(un != null && tt?.label || ""), et.closeDropdown();
    },
    ...k,
    children: [/* @__PURE__ */ l.jsx(xe.Target, {
      targetType: _ ? "input" : "button",
      autoComplete: Ce,
      withExpandedAttribute: !0,
      children: /* @__PURE__ */ l.jsx(St, {
        id: vt,
        __defaultRightSection: /* @__PURE__ */ l.jsx(xe.Chevron, {
          size: z,
          error: fe,
          unstyled: r,
          color: le
        }),
        __clearSection: Hs,
        __clearable: Nr,
        __clearSectionMode: q,
        rightSection: F,
        rightSectionPointerEvents: ie || "none",
        ...ge,
        size: z,
        __staticSelector: "Select",
        disabled: P,
        readOnly: R || !_,
        value: It,
        onChange: (We) => {
          if (Av(We)) {
            if (!R) {
              const tt = ey(de, We.currentTarget.value);
              tt && `${tt.value}` != `${Te}` && (yt(tt.value, tt), !Hn && Vt(tt.label));
            }
            return;
          }
          Vt(We.currentTarget.value), et.openDropdown(), x && et.selectFirstOption();
        },
        onFocus: (We) => {
          Ie && _ && et.openDropdown(), f?.(We);
        },
        onBlur: (We) => {
          je && et.clickSelectedOption(), et.closeDropdown();
          const tt = Te != null && (`${Te}` in de ? de[`${Te}`] : De.current[`${Te}`]);
          Vt(tt && tt.label || ""), h?.(We);
        },
        onClick: (We) => {
          _ ? et.openDropdown() : et.toggleDropdown(), d?.(We);
        },
        classNames: Er,
        styles: Rr,
        unstyled: r,
        pointer: !_,
        error: fe,
        attributes: me
      })
    }), /* @__PURE__ */ l.jsx(Pv, {
      data: we,
      hidden: R || P,
      filter: S,
      search: It,
      limit: y,
      hiddenWhenEmpty: !I,
      withScrollArea: N,
      maxDropdownHeight: D,
      filterOptions: !!_ && At?.label !== It,
      value: Te,
      checkIconPosition: $,
      withCheckIcon: M,
      withAlignedLabels: L,
      nothingFoundMessage: I,
      unstyled: r,
      labelId: ge.label ? `${vt}-label` : void 0,
      "aria-label": ge.label ? void 0 : ge["aria-label"],
      renderOption: be,
      scrollAreaProps: ne
    })]
  }), /* @__PURE__ */ l.jsx(xe.HiddenInput, {
    value: Te,
    name: A,
    form: B,
    disabled: P,
    ...ce
  })] });
});
co.classes = {
  ...St.classes,
  ...xe.classes
};
co.displayName = "@mantine/core/Select";
const [By, Vy] = Yt("Table component was not found in the tree");
var gr = {
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
function Hy(e, t) {
  if (!t) return;
  const n = {};
  return t.columnBorder && e.withColumnBorders && (n["data-with-column-border"] = !0), t.rowBorder && e.withRowBorders && (n["data-with-row-border"] = !0), t.striped && e.striped && (n["data-striped"] = e.striped), t.highlightOnHover && e.highlightOnHover && (n["data-hover"] = !0), t.captionSide && e.captionSide && (n["data-side"] = e.captionSide), t.stickyHeader && e.stickyHeader && (n["data-sticky"] = !0), n;
}
function Fn(e, t) {
  const n = `Table${e.charAt(0).toUpperCase()}${e.slice(1)}`, o = se((r) => {
    const s = Z(n, {}, r), { classNames: a, className: i, style: c, styles: u, ...f } = s, h = Vy();
    return /* @__PURE__ */ l.jsx(Q, {
      component: e,
      ...Hy(h, t),
      ...h.getStyles(e, {
        className: i,
        classNames: a,
        style: c,
        styles: u,
        props: s
      }),
      ...f
    });
  });
  return o.displayName = `@mantine/core/${n}`, o.classes = gr, o;
}
const Ra = Fn("th", { columnBorder: !0 }), vf = Fn("td", { columnBorder: !0 }), Br = Fn("tr", {
  rowBorder: !0,
  striped: !0,
  highlightOnHover: !0
}), yf = Fn("thead", { stickyHeader: !0 }), bf = Fn("tbody"), wf = Fn("tfoot"), xf = Fn("caption", { captionSide: !0 }), Uy = { type: "scrollarea" }, Sf = ze((e, { minWidth: t, maxHeight: n, type: o }) => ({ scrollContainer: {
  "--table-min-width": Ae(t),
  "--table-max-height": Ae(n),
  "--table-overflow": o === "native" ? "auto" : void 0
} })), Os = se((e) => {
  const t = Z("TableScrollContainer", Uy, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, children: c, minWidth: u, maxHeight: f, type: h, scrollAreaProps: d, attributes: m, ...g } = t, v = Me({
    name: "TableScrollContainer",
    classes: gr,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: m,
    vars: i,
    varsResolver: Sf,
    rootSelector: "scrollContainer"
  });
  return /* @__PURE__ */ l.jsx(Q, {
    component: h === "scrollarea" ? Nn : "div",
    ...h === "scrollarea" ? f ? {
      offsetScrollbars: "xy",
      ...d
    } : {
      offsetScrollbars: "x",
      ...d
    } : {},
    ...v("scrollContainer"),
    ...g,
    children: /* @__PURE__ */ l.jsx("div", {
      ...v("scrollContainerInner"),
      children: c
    })
  });
});
Os.classes = gr;
Os.varsResolver = Sf;
Os.displayName = "@mantine/core/TableScrollContainer";
function Vi({ data: e }) {
  return /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
    e.caption && /* @__PURE__ */ l.jsx(xf, { children: e.caption }),
    e.head && /* @__PURE__ */ l.jsx(yf, { children: /* @__PURE__ */ l.jsx(Br, { children: e.head.map((t, n) => /* @__PURE__ */ l.jsx(Ra, { children: t }, n)) }) }),
    e.body && /* @__PURE__ */ l.jsx(bf, { children: e.body.map((t, n) => /* @__PURE__ */ l.jsx(Br, { children: t.map((o, r) => /* @__PURE__ */ l.jsx(vf, { children: o }, r)) }, n)) }),
    e.foot && /* @__PURE__ */ l.jsx(wf, { children: /* @__PURE__ */ l.jsx(Br, { children: e.foot.map((t, n) => /* @__PURE__ */ l.jsx(Ra, { children: t }, n)) }) })
  ] });
}
Vi.displayName = "@mantine/core/TableDataRenderer";
const Wy = {
  withRowBorders: !0,
  verticalSpacing: 7
}, Cf = ze((e, { layout: t, captionSide: n, horizontalSpacing: o, verticalSpacing: r, borderColor: s, stripedColor: a, highlightOnHoverColor: i, striped: c, highlightOnHover: u, stickyHeaderOffset: f, stickyHeader: h }) => ({ table: {
  "--table-layout": t,
  "--table-caption-side": n,
  "--table-horizontal-spacing": Uo(o),
  "--table-vertical-spacing": Uo(r),
  "--table-border-color": s ? at(s, e) : void 0,
  "--table-striped-color": c && a ? at(a, e) : void 0,
  "--table-highlight-on-hover-color": u && i ? at(i, e) : void 0,
  "--table-sticky-header-offset": h ? Ae(f) : void 0
} })), st = se((e) => {
  const t = Z("Table", Wy, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, horizontalSpacing: c, verticalSpacing: u, captionSide: f, stripedColor: h, highlightOnHoverColor: d, striped: m, highlightOnHover: g, withColumnBorders: v, withRowBorders: w, withTableBorder: x, borderColor: E, layout: C, data: k, children: R, stickyHeader: P, stickyHeaderOffset: S, mod: y, tabularNums: N, attributes: D, ...O } = t, z = Me({
    name: "Table",
    props: t,
    className: o,
    style: r,
    classes: gr,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: D,
    rootSelector: "table",
    vars: i,
    varsResolver: Cf,
    stable: !0
  }), _ = m === !0 ? "odd" : m || void 0, F = f || "bottom", $ = p.useMemo(() => ({
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
  return /* @__PURE__ */ l.jsx(By, {
    value: $,
    children: /* @__PURE__ */ l.jsx(Q, {
      component: "table",
      mod: [{
        withTableBorder: x,
        tabularNums: N
      }, y],
      ...z("table"),
      ...O,
      children: R || !!k && /* @__PURE__ */ l.jsx(Vi, { data: k })
    })
  });
});
st.classes = gr;
st.varsResolver = Cf;
st.displayName = "@mantine/core/Table";
st.Td = vf;
st.Th = Ra;
st.Tr = Br;
st.Thead = yf;
st.Tbody = bf;
st.Tfoot = wf;
st.Caption = xf;
st.ScrollContainer = Os;
st.DataRenderer = Vi;
const [qy, Hi] = Yt("Tabs component was not found in the tree");
var vr = {
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
const Ui = se((e) => {
  const t = Z("TabsList", null, e), { children: n, className: o, grow: r, justify: s, classNames: a, styles: i, style: c, mod: u, ...f } = t, h = Hi();
  return /* @__PURE__ */ l.jsx(Q, {
    ...h.getStyles("list", {
      className: o,
      style: c,
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
Ui.classes = vr;
Ui.displayName = "@mantine/core/TabsList";
const Wi = se((e) => {
  const t = Z("TabsPanel", null, e), { children: n, className: o, value: r, classNames: s, styles: a, style: i, mod: c, keepMounted: u, ...f } = t, h = Ka(), d = Hi();
  p.useEffect(() => (d.setMountedPanel(r, !0), () => {
    d.setMountedPanel(r, !1);
  }), [r]);
  const m = d.value === r, g = d.keepMounted || u, v = d.keepMountedMode !== "display-none", w = g && v && h !== "test" ? /* @__PURE__ */ l.jsx(p.Activity, {
    mode: m ? "visible" : "hidden",
    children: n
  }) : g || m ? n : null;
  return /* @__PURE__ */ l.jsx(Q, {
    ...d.getStyles("panel", {
      className: o,
      classNames: s,
      styles: a,
      style: [i, m ? void 0 : { display: "none" }],
      props: t
    }),
    mod: [{ orientation: d.orientation }, c],
    role: "tabpanel",
    id: d.getPanelId(r),
    "aria-labelledby": d.getTabId(r),
    ...f,
    children: w
  });
});
Wi.classes = vr;
Wi.displayName = "@mantine/core/TabsPanel";
const qi = se((e) => {
  const t = Z("TabsTab", null, e), { className: n, children: o, rightSection: r, leftSection: s, value: a, onClick: i, onKeyDown: c, disabled: u, color: f, style: h, classNames: d, styles: m, vars: g, mod: v, tabIndex: w, ...x } = t, E = ir(), { dir: C } = Co(), k = Hi(), R = a === k.value, P = (y) => {
    k.onChange(k.allowTabDeactivation && a === k.value ? null : a), i?.(y);
  }, S = {
    classNames: d,
    styles: m,
    props: t
  };
  return /* @__PURE__ */ l.jsxs($n, {
    ...k.getStyles("tab", {
      className: n,
      style: h,
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
    __vars: { "--tabs-color": f ? at(f, E) : void 0 },
    onKeyDown: nu({
      siblingSelector: '[role="tab"]',
      parentSelector: '[role="tablist"]',
      activateOnFocus: k.activateTabWithKeyboard,
      loop: k.loop,
      orientation: k.orientation || "horizontal",
      dir: C,
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
qi.classes = vr;
qi.displayName = "@mantine/core/TabsTab";
const ml = "Tabs.Tab or Tabs.Panel component was rendered with invalid value or without value", Ky = {
  keepMounted: !0,
  keepMountedMode: "activity",
  orientation: "horizontal",
  loop: !0,
  activateTabWithKeyboard: !0,
  variant: "default",
  placement: "left"
}, jf = ze((e, { radius: t, color: n, autoContrast: o }) => ({ root: {
  "--tabs-radius": Tt(t),
  "--tabs-color": at(n, e),
  "--tabs-text-color": ur(o, e) ? xo({
    color: n,
    theme: e,
    autoContrast: o
  }) : void 0
} })), ht = se((e) => {
  const t = Z("Tabs", Ky, e), { defaultValue: n, value: o, onChange: r, orientation: s, children: a, loop: i, id: c, activateTabWithKeyboard: u, allowTabDeactivation: f, variant: h, color: d, radius: m, inverted: g, placement: v, keepMounted: w, keepMountedMode: x, classNames: E, styles: C, unstyled: k, className: R, style: P, vars: S, autoContrast: y, mod: N, attributes: D, ...O } = t, z = Bt(c), _ = p.useRef(/* @__PURE__ */ new Set()), F = oh(), $ = p.useCallback((A, B) => {
    const H = _.current;
    B && !H.has(A) ? (H.add(A), F()) : !B && H.has(A) && (H.delete(A), F());
  }, []), [M, L] = Ze({
    value: o,
    defaultValue: n,
    finalValue: null,
    onChange: r
  }), I = Me({
    name: "Tabs",
    props: t,
    classes: vr,
    className: R,
    style: P,
    classNames: E,
    styles: C,
    unstyled: k,
    attributes: D,
    vars: S,
    varsResolver: jf
  });
  return /* @__PURE__ */ l.jsx(qy, {
    value: {
      placement: v,
      value: M,
      orientation: s,
      id: z,
      loop: i,
      activateTabWithKeyboard: u,
      getTabId: qr(`${z}-tab`, ml),
      getPanelId: qr(`${z}-panel`, ml),
      onChange: L,
      allowTabDeactivation: f,
      variant: h,
      color: d,
      radius: m,
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
      variant: h,
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
ht.classes = vr;
ht.varsResolver = jf;
ht.displayName = "@mantine/core/Tabs";
ht.Tab = qi;
ht.Panel = Wi;
ht.List = Ui;
const dt = se((e) => {
  const t = Z([
    "Input",
    "InputWrapper",
    "TextInput"
  ], null, e);
  return /* @__PURE__ */ l.jsx(St, {
    component: "input",
    ...t,
    __staticSelector: "TextInput"
  });
});
dt.classes = St.classes;
dt.displayName = "@mantine/core/TextInput";
function Jo(e, t) {
  for (const n of t) {
    if (n.value === e) return n;
    if (Array.isArray(n.children)) {
      const o = Jo(e, n.children);
      if (o) return o;
    }
  }
  return null;
}
function Zr(e, t, n = []) {
  const o = Jo(e, t);
  return o ? !Array.isArray(o.children) || o.children.length === 0 ? [o.value] : (o.children.forEach((r) => {
    Array.isArray(r.children) && r.children.length > 0 ? Zr(r.value, t, n) : n.push(r.value);
  }), n) : n;
}
function kf(e) {
  return e.reduce((t, n) => (Array.isArray(n.children) && n.children.length > 0 ? t.push(...kf(n.children)) : t.push(n.value), t), []);
}
function $s(e, t, n = []) {
  const o = [];
  for (const r of e) if (Array.isArray(r.children) && r.children.length > 0) {
    const s = $s(r.children, t, n);
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
function Xy(e, t, n) {
  return n.length === 0 ? !1 : n.includes(e) ? !0 : $s(t, n).result.some((o) => o.value === e && o.checked);
}
const Yy = du(Xy);
function Gy(e, t, n) {
  return n.length === 0 ? !1 : $s(t, n).result.some((o) => o.value === e && o.indeterminate);
}
const Jy = du(Gy);
function Ef(e, t, n, o = {}) {
  return t.forEach((r) => {
    o[r.value] = r.value in e ? e[r.value] : r.value === n, Array.isArray(r.children) && Ef(e, r.children, n, o);
  }), o;
}
function Zy(e, t, n) {
  if (n) return e;
  const o = [];
  return e.forEach((r) => o.push(...Zr(r, t))), Array.from(new Set(o));
}
function Rf(e) {
  const t = [];
  for (const n of e)
    t.push(n.value), Array.isArray(n.children) && n.children.length > 0 && t.push(...Rf(n.children));
  return t;
}
function Nf({ initialSelectedState: e = [], expandedState: t, initialCheckedState: n = [], checkedState: o, initialExpandedState: r = {}, selectedState: s, multiple: a = !1, onNodeCollapse: i, onNodeExpand: c, onCheckedStateChange: u, onSelectedStateChange: f, onExpandedStateChange: h, onLoadChildren: d, checkStrictly: m = !1 } = {}) {
  const [g, v] = p.useState([]), [w, x] = Ze({
    value: t,
    defaultValue: r,
    finalValue: {},
    onChange: h
  }), [E, C] = Ze({
    value: s,
    defaultValue: e,
    finalValue: [],
    onChange: f
  }), [k, R] = Ze({
    value: o,
    defaultValue: n,
    finalValue: [],
    onChange: u
  }), [P, S] = p.useState(null), y = p.useRef(/* @__PURE__ */ new Set()), N = p.useRef(/* @__PURE__ */ new Set()), [D, O] = p.useState([]), [z, _] = p.useState({}), F = p.useCallback((U) => {
    x(Ef(w, U, E)), R(Zy(k, U, m)), v(U);
  }, [
    E,
    k,
    w,
    m
  ]), $ = p.useCallback(async (U) => {
    if (d && !(y.current.has(U) || N.current.has(U))) {
      y.current.add(U), O(Array.from(y.current)), _((V) => {
        if (!(U in V)) return V;
        const X = { ...V };
        return delete X[U], X;
      });
      try {
        await d(U), N.current.add(U);
      } catch (V) {
        const X = V instanceof Error ? V : new Error(String(V));
        _((le) => ({
          ...le,
          [U]: X
        }));
      } finally {
        y.current.delete(U), O(Array.from(y.current));
      }
    }
  }, [d]), M = p.useCallback((U) => {
    if (!d) return;
    const V = Jo(U, g);
    V && V.hasChildren && !Array.isArray(V.children) && $(U);
  }, [
    d,
    g,
    $
  ]), L = p.useCallback((U) => {
    const V = {
      ...w,
      [U]: !w[U]
    };
    V[U] ? c?.(U) : i?.(U), V[U] && M(U), x(V);
  }, [
    i,
    c,
    w,
    M
  ]), I = p.useCallback((U) => {
    w[U] !== !1 && i?.(U), x({
      ...w,
      [U]: !1
    });
  }, [i, w]), A = p.useCallback((U) => {
    w[U] !== !0 && c?.(U), M(U), x({
      ...w,
      [U]: !0
    });
  }, [
    c,
    w,
    M
  ]), B = p.useCallback(() => {
    const U = { ...w };
    Object.keys(U).forEach((V) => {
      U[V] = !0, M(V);
    }), x(U);
  }, [w, M]), H = p.useCallback(() => {
    const U = { ...w };
    Object.keys(U).forEach((V) => {
      U[V] = !1;
    }), x(U);
  }, [w]), W = p.useCallback((U) => {
    if (!a)
      return E.includes(U) ? (S(null), []) : (S(U), [U]);
    if (E.includes(U))
      return S(null), E.filter((V) => V !== U);
    S(U), C([...E, U]);
  }, [E]), Y = p.useCallback((U) => {
    S(U), C(a ? E.includes(U) ? E : [...E, U] : [U]);
  }, [E]), ae = p.useCallback((U) => {
    P === U && S(null), C(E.filter((V) => V !== U));
  }, [E]), fe = p.useCallback(() => {
    C([]), S(null);
  }, []), ie = p.useCallback((U) => {
    if (m)
      k.includes(U) || R([...k, U]);
    else {
      const V = Zr(U, g);
      R(Array.from(/* @__PURE__ */ new Set([...k, ...V])));
    }
  }, [
    g,
    k,
    m
  ]), te = p.useCallback((U) => {
    if (m) R(k.filter((V) => V !== U));
    else {
      const V = Zr(U, g);
      R(k.filter((X) => !V.includes(X)));
    }
  }, [
    g,
    k,
    m
  ]), he = p.useCallback(() => {
    R(m ? Rf(g) : kf(g));
  }, [g, m]), q = p.useCallback(() => {
    R([]);
  }, []), K = p.useCallback(() => m ? k.map((U) => {
    const V = Jo(U, g);
    return {
      checked: !0,
      indeterminate: !1,
      value: U,
      hasChildren: V ? Array.isArray(V.children) && V.children.length > 0 || !!V.hasChildren : !1
    };
  }) : $s(g, k).result, [
    m,
    k,
    g
  ]), ce = p.useCallback((U) => m ? k.includes(U) : Yy(U, g, k), [
    m,
    k,
    g
  ]), be = p.useCallback((U) => m ? !1 : Jy(U, g, k), [
    m,
    k,
    g
  ]), pe = p.useCallback((U) => D.includes(U), [D]), Ce = p.useCallback((U) => z[U] || null, [z]), ne = p.useCallback((U) => {
    N.current.delete(U), _((V) => {
      if (!(U in V)) return V;
      const X = { ...V };
      return delete X[U], X;
    });
  }, []);
  return p.useMemo(() => ({
    checkStrictly: m,
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
    collapseAllNodes: H,
    setExpandedState: x,
    checkNode: ie,
    uncheckNode: te,
    checkAllNodes: he,
    uncheckAllNodes: q,
    setCheckedState: R,
    toggleSelected: W,
    select: Y,
    deselect: ae,
    clearSelected: fe,
    setSelectedState: C,
    getCheckedNodes: K,
    isNodeChecked: ce,
    isNodeIndeterminate: be,
    isNodeLoading: pe,
    getNodeLoadError: Ce,
    loadNode: $,
    invalidateNode: ne
  }), [
    m,
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
    H,
    x,
    ie,
    te,
    he,
    q,
    R,
    W,
    Y,
    ae,
    fe,
    C,
    K,
    ce,
    be,
    pe,
    Ce,
    $,
    ne
  ]);
}
function Qy(e, t, n) {
  const o = Jo(t, e);
  if (!o || !o.children) return !1;
  function r(s) {
    for (const a of s)
      if (a.value === n || a.children && r(a.children)) return !0;
    return !1;
  }
  return r(o.children);
}
function eb(e, t, n, o) {
  const r = t.getBoundingClientRect(), s = e.clientY - r.top, a = r.height;
  return n ? o ? s < a * 0.5 ? "before" : "inside" : s < a * 0.25 ? "before" : s > a * 0.75 ? "after" : "inside" : s < a * 0.5 ? "before" : "after";
}
const tb = {
  elementProps: {},
  dragHandleProps: void 0
};
function nb({ nodeValue: e, hasChildren: t, isExpanded: n, data: o, onDragDrop: r, dragStateRef: s, allowDrop: a, withDragHandle: i }) {
  const [c, u] = p.useState(!1);
  return p.useEffect(() => {
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
        if (!w || w === e || Qy(o, w, e)) return;
        const x = v.currentTarget, E = eb(v, x, t, n);
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
        const C = s.current.currentDropTarget;
        C && C !== x && C.removeAttribute("data-drag-over"), x.setAttribute("data-drag-over", E), s.current.currentDropTarget = x;
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
          const C = {
            draggedNode: E,
            targetNode: e,
            position: x
          };
          (!a || a(C)) && r(C);
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
  } : tb;
}
function gl(e, t, n) {
  if (!e || !t) return [];
  const o = n.indexOf(e), r = n.indexOf(t), s = Math.min(o, r), a = Math.max(o, r);
  return n.slice(s, a + 1);
}
function ob(e, t) {
  for (let n = e; n && n !== t; ) {
    if (n.style.display === "none") return !1;
    n = n.parentElement;
  }
  return !0;
}
function Ki({ node: e, getStyles: t, rootIndex: n, controller: o, expandOnClick: r, selectOnClick: s, isSubtree: a, level: i = 1, renderNode: c, flatValues: u, allowRangeSelection: f, expandOnSpace: h, checkOnSpace: d, keepMounted: m, onDragDrop: g, allowDrop: v, withDragHandle: w, dragStateRef: x, data: E }) {
  const C = p.useRef(null), k = Array.isArray(e.children) && e.children.length > 0, R = !!e.hasChildren && !k, P = k || R, S = o.isNodeLoading(e.value), y = o.getNodeLoadError(e.value), N = o.expandedState[e.value] || !1, D = (e.children || []).map((I) => /* @__PURE__ */ l.jsx(Ki, {
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
    allowRangeSelection: f,
    expandOnSpace: h,
    checkOnSpace: d,
    keepMounted: m,
    onDragDrop: g,
    allowDrop: v,
    withDragHandle: w,
    dragStateRef: x,
    data: E
  }, I.value)), { elementProps: O, dragHandleProps: z } = nb({
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
        const A = Wo(I.currentTarget, "[role=treeitem]");
        A?.setAttribute("data-focus-ring", "true"), A?.focus();
      }
    }
    if (I.nativeEvent.code === "ArrowDown" || I.nativeEvent.code === "ArrowUp") {
      const A = Wo(I.currentTarget, "[data-tree-root]");
      if (!A) return;
      I.stopPropagation(), I.preventDefault();
      const B = Array.from(A.querySelectorAll("[role=treeitem]")).filter((ae) => ob(ae, A)), H = B.indexOf(I.currentTarget);
      if (H === -1) return;
      const W = I.nativeEvent.code === "ArrowDown" ? H + 1 : H - 1, Y = B[W];
      if (Y?.setAttribute("data-focus-ring", "true"), Y?.focus(), I.shiftKey) {
        const ae = B[W];
        ae && o.setSelectedState(gl(o.anchorNode, ae.dataset.value, u));
      }
    }
    I.nativeEvent.code === "Space" && (h && (I.stopPropagation(), I.preventDefault(), o.toggleExpanded(e.value)), d && (I.stopPropagation(), I.preventDefault(), o.isNodeChecked(e.value) ? o.uncheckNode(e.value) : o.checkNode(e.value)));
  }, F = (I) => {
    I.stopPropagation(), f && I.shiftKey && o.anchorNode ? (o.setSelectedState(gl(o.anchorNode, e.value, u)), C.current?.focus()) : (r && o.toggleExpanded(e.value), s && o.select(e.value), C.current?.focus());
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
    ref: C,
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
            children: /* @__PURE__ */ l.jsx(Ip, {
              size: 16,
              style: { marginInlineStart: 4 }
            })
          })
        })
      }),
      m && D.length > 0 ? /* @__PURE__ */ l.jsx(p.Activity, {
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
Ki.displayName = "@mantine/core/TreeNode";
var Tf = {
  root: "m_f698e191",
  subtree: "m_75f3ecf",
  node: "m_f6970eb1",
  label: "m_dc283425",
  flatLine: "m_c03b303c",
  flatLineClosing: "m_bf7448d9"
};
function Pf(e) {
  return e.reduce((t, n) => (t.push(n.value), n.children && t.push(...Pf(n.children)), t), []);
}
const rb = {
  expandOnClick: !0,
  allowRangeSelection: !0,
  expandOnSpace: !0
}, Af = ze((e, { levelOffset: t }) => ({ root: { "--level-offset": Uo(t) } })), Ls = se((e) => {
  const t = Z("Tree", rb, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, data: c, expandOnClick: u, tree: f, renderNode: h, selectOnClick: d, clearSelectionOnOutsideClick: m, allowRangeSelection: g, expandOnSpace: v, levelOffset: w, checkOnSpace: x, keepMounted: E, onDragDrop: C, allowDrop: k, withDragHandle: R, withLines: P, attributes: S, ref: y, ...N } = t, D = Nf(), O = f || D, z = p.useRef({
    draggedValue: null,
    currentDropTarget: null
  }), _ = Me({
    name: "Tree",
    classes: Tf,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: S,
    vars: i,
    varsResolver: Af
  }), F = ou(() => m && O.clearSelected()), $ = Ve(y, F), M = p.useMemo(() => Pf(c), [c]);
  p.useEffect(() => {
    O.initialize(c);
  }, [c]);
  const L = c.map((I, A) => /* @__PURE__ */ l.jsx(Ki, {
    node: I,
    getStyles: _,
    rootIndex: A,
    expandOnClick: u,
    selectOnClick: d,
    controller: O,
    renderNode: h,
    flatValues: M,
    allowRangeSelection: g,
    expandOnSpace: v,
    checkOnSpace: x,
    keepMounted: E,
    onDragDrop: C,
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
Ls.displayName = "@mantine/core/Tree";
Ls.classes = Tf;
Ls.varsResolver = Af;
function zs() {
  window.location.pathname !== "/login.html" && window.location.replace("/login.html");
}
function $e(e) {
  return e.layers ?? [];
}
function Le(e) {
  return e.version ?? 0;
}
class Ye extends Error {
  code;
  details;
  constructor(t, n, o) {
    super(n), this.name = "ApiError", this.code = t, this.details = o;
  }
}
async function Re(e, t) {
  const n = await fetch(e, t);
  if (n.status === 401)
    throw zs(), new Ye("unauthorized", "this server needs an access token", null);
  if (!n.ok) {
    let o = `http${n.status}`, r = n.statusText, s = null;
    try {
      const a = await n.json();
      a?.error && (o = a.error.code ?? o, r = a.error.message ?? r, s = a.error.details ?? null);
    } catch {
    }
    throw new Ye(o, r, s);
  }
  if (n.status !== 204)
    return await n.json();
}
async function If(e = "", t = 200) {
  const n = new URLSearchParams({ limit: String(t) });
  return e && n.set("query", e), (await Re(
    `/api/projects?${n.toString()}`
  )).projects;
}
async function sb(e = 8) {
  return (await Re(
    `/api/projects/recent?limit=${e}`
  )).projects;
}
async function ab(e) {
  return Re(`/api/projects/${encodeURIComponent(e)}`);
}
function ib(e) {
  return `/api/projects/${encodeURIComponent(e)}/thumbnail.png`;
}
async function cb(e, t, n, o, r) {
  return Re("/api/projects", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: e, width: t, height: n, background: o, name: r })
  });
}
async function lb(e, t) {
  return Re(
    `/api/projects/${encodeURIComponent(e)}/rename`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: t })
    }
  );
}
async function ub(e) {
  return Re(`/api/projects/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
async function yr(e) {
  return Re(`/api/projects/${encodeURIComponent(e)}/document`);
}
async function db(e, t) {
  return (await Re(
    `/api/projects/${encodeURIComponent(e)}/recover-lock`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ expectedPid: t })
    }
  )).unlocked;
}
async function Xi(e, t, n) {
  const o = await fetch(e, { ...t, method: t?.method ?? "GET" });
  if (o.status === 404 || o.status === 405) return n;
  if (o.status === 401)
    throw zs(), new Ye("unauthorized", "this server needs an access token", null);
  if (!o.ok) {
    let r = `http${o.status}`, s = o.statusText, a = null;
    try {
      const i = await o.json();
      r = i?.error?.code ?? r, s = i?.error?.message ?? s, a = i?.error?.details ?? null;
    } catch {
    }
    throw new Ye(r, s, a);
  }
  return await o.json();
}
async function fb() {
  return Xi("/api/open-tabs", void 0, { projects: [], active: null });
}
async function pb(e) {
  await Xi("/api/open-tabs", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(e)
  }, null);
}
async function hb(e) {
  return (await Xi(
    `/api/projects/${encodeURIComponent(e)}/close`,
    { method: "POST", headers: { "content-type": "application/json" }, body: "{}" },
    { closed: !1 }
  )).closed;
}
async function mb(e, t = 100) {
  const n = new URLSearchParams({ tail: String(t) });
  return Re(`/api/projects/${encodeURIComponent(e)}/history?${n.toString()}`);
}
async function Bn(e, t, n, o = !1) {
  return Re(
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
async function gb(e, t, n, o) {
  return Re(
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
async function vb(e) {
  return Re(`/api/projects/${encodeURIComponent(e)}/undo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ actor: { kind: "human", name: "reference UI" } })
  });
}
async function yb(e) {
  return Re(`/api/projects/${encodeURIComponent(e)}/redo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ actor: { kind: "human", name: "reference UI" } })
  });
}
async function bb(e, t, n) {
  return Re(`/api/projects/${encodeURIComponent(e)}/export`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: t, scale: n })
  });
}
async function wb() {
  await Re("/api/shutdown", { method: "POST" });
}
async function xb() {
  return Re("/api/version");
}
async function Sb() {
  return Re("/api/agent-access");
}
async function Cb() {
  return Re("/api/agent-sessions");
}
async function jb() {
  return Re("/api/update-status");
}
async function kb(e) {
  return Re("/api/update-consent", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ updateCheck: e })
  });
}
async function Yi(e, t) {
  const n = await fetch(
    `/api/projects/${encodeURIComponent(e)}/assets?filename=${encodeURIComponent(t.name)}`,
    {
      method: "POST",
      headers: { "content-type": t.type || "application/octet-stream" },
      body: t
    }
  );
  if (n.status === 401)
    throw zs(), new Ye("unauthorized", "this server needs an access token", null);
  if (!n.ok) {
    let o = `http${n.status}`, r = n.statusText;
    try {
      const s = await n.json();
      o = s?.error?.code ?? o, r = s?.error?.message ?? r;
    } catch {
    }
    throw new Ye(o, r, null);
  }
  return await n.json();
}
const Eb = ["fill", "contain", "cover"], vl = 8;
function Mf(e) {
  if (e.type !== "shape") return null;
  const t = e.shape;
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = t.kind;
    if (typeof n == "string") return n;
  }
  return null;
}
function Rb(e) {
  if (e.type !== "shape") return 0;
  const t = e.shape;
  if (t && typeof t == "object") {
    const n = t.cornerRadius;
    if (typeof n == "number") return n;
  }
  return 0;
}
const Nb = [
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
], yl = [
  "brightness",
  "contrast",
  "saturation",
  "blur",
  "grain",
  "dropShadow",
  "hueRotate",
  "invert"
];
function Tb(e) {
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
function Pb(e) {
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
async function Ab(e) {
  return (await Re(
    `/api/projects/${encodeURIComponent(e)}/presets`
  )).presets;
}
function Ib(e) {
  const t = {
    opacity: e.opacity ?? 1,
    blendMode: e.blendMode ?? "normal",
    effects: e.effects ?? []
  };
  return e.type === "text" && (t.fontFamily = e.fontFamily, t.fontSize = e.fontSize, t.color = e.color ?? "#000000", t.align = e.align ?? "left", t.lineHeight = e.lineHeight ?? 1.2, t.paragraphSpacing = e.paragraphSpacing ?? 0), e.type === "shape" && (e.fill && (t.fill = e.fill), e.stroke && (t.stroke = e.stroke)), t;
}
async function Mb(e) {
  return Re(`/api/projects/${encodeURIComponent(e)}/slots`);
}
async function Db(e, t, n = 1) {
  return Re(
    `/api/projects/${encodeURIComponent(e)}/variants`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ variants: t, scale: n })
    }
  );
}
function Df(e, t) {
  return `/api/projects/${encodeURIComponent(e)}/exports/${encodeURIComponent(t)}.png`;
}
async function Ob() {
  return (await Re("/api/fonts")).families;
}
function Na(e, t = "Aa Bb 0123") {
  return `/api/fonts/specimen.png?${new URLSearchParams({
    family: e.family,
    weight: String(e.weight),
    style: e.style,
    hash: e.hash,
    sample: t
  }).toString()}`;
}
async function $b() {
  return (await Re(
    "/catalogue-specimens/manifest.json"
  )).families;
}
async function Lb() {
  const e = await Re("/api/fonts");
  return { families: e.families ?? [], faces: e.faces ?? [] };
}
async function zb(e) {
  return Re(
    `/api/fonts?filename=${encodeURIComponent(e.name)}`,
    {
      method: "POST",
      headers: { "content-type": e.type || "application/octet-stream" },
      body: e
    }
  );
}
async function _b(e) {
  return Re(
    `/api/fonts/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function Fb() {
  return Re("/api/fonts/catalogue");
}
async function bl(e) {
  return Re("/api/fonts/install", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ pack: e })
  });
}
function Bb(e, t) {
  return `/api/projects/${encodeURIComponent(e)}/preview.svg?v=${t}`;
}
async function vo(e) {
  return URL.createObjectURL(await _s(e));
}
async function _s(e) {
  const t = await fetch(e);
  if (t.status === 401)
    throw zs(), new Ye("unauthorized", "this server needs an access token", null);
  if (!t.ok) {
    let n = `http${t.status}`, o = t.statusText, r = null;
    try {
      const s = await t.json();
      s?.error && (n = s.error.code ?? n, o = s.error.message ?? o, r = s.error.details ?? null);
    } catch {
    }
    throw new Ye(n, o, r);
  }
  return await t.blob();
}
function Qr(e, t, n = 1, o) {
  const r = new URLSearchParams({ scale: String(n), v: String(t) });
  return o?.only?.length && r.set("only", o.only.join(",")), o?.exclude?.length && r.set("exclude", o.exclude.join(",")), `/api/projects/${encodeURIComponent(e)}/preview.png?${r.toString()}`;
}
async function Of(e, t, n) {
  const o = new URLSearchParams({ id: t, width: String(n) });
  return Re(
    `/api/projects/${encodeURIComponent(e)}/text-layout?${o.toString()}`
  );
}
function Be(e, t = null, n = 0, o = []) {
  for (const r of e)
    o.push({ layer: r, parent: t, depth: n }), r.type === "group" && Be(r.children ?? [], r.id, n + 1, o);
  return o;
}
function Zo(e) {
  return !e.protected && !e.readOnly && !e.locked;
}
function es(e) {
  return e.protected ? "protected — no tool can change this layer" : e.readOnly ? "read-only — inspectable but never mutable" : e.locked ? "locked — unlock it to make changes" : null;
}
function wl(e) {
  return !e.includes("'") && !/[\r\n]/.test(e) ? `'${e}'` : JSON.stringify(e);
}
function Vb(e) {
  const t = ["mcp", "--workspace", e.workspace], n = JSON.stringify(
    { mcpServers: { assemblash: { command: e.executable, args: t } } },
    null,
    2
  ), o = [
    "[mcp_servers.assemblash]",
    `command = ${wl(e.executable)}`,
    `args = [${t.map(wl).join(", ")}]`
  ].join(`
`);
  return [
    { id: "json", title: b("agents.jsonTitle"), hint: b("agents.jsonHint"), text: n },
    { id: "codex", title: b("agents.codexTitle"), hint: b("agents.codexHint"), text: o },
    { id: "url", title: b("agents.urlTitle"), hint: b("agents.urlHint"), text: e.mcpUrl }
  ];
}
async function Hb(e) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(e);
    return;
  }
  const t = document.createElement("textarea");
  t.value = e, t.setAttribute("readonly", ""), t.style.position = "fixed", t.style.opacity = "0", document.body.append(t), t.select();
  const n = document.execCommand("copy");
  if (t.remove(), !n) throw new Error(b("agents.copyRefused"));
}
const xl = "assemblash-agent-hint-v1";
function Ub({
  host: e,
  controller: t
}) {
  Fe();
  const [n, o] = p.useState(null), [r, s] = p.useState(!1), a = p.useRef(e);
  a.current = e, p.useEffect(() => (t.current = (c) => {
    o(c), s(!0);
  }, () => {
    t.current = null;
  }), [t]);
  const i = n === null ? [] : Vb(n);
  return /* @__PURE__ */ l.jsxs(
    pt,
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
        /* @__PURE__ */ l.jsx(io, { align: "center", justify: "between", gap: "3", mb: "md", children: /* @__PURE__ */ l.jsxs("div", { children: [
          /* @__PURE__ */ l.jsx(ee, { component: "p", size: "xs", fw: 600, mb: 4, style: { letterSpacing: "0.08em" }, children: b("agents.protocol") }),
          /* @__PURE__ */ l.jsx(Sc, { order: 2, size: "h2", m: 0, children: b("agents.dialogTitle") })
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
          /* @__PURE__ */ l.jsxs(io, { align: "center", justify: "between", gap: "md", my: "sm", children: [
            /* @__PURE__ */ l.jsx(Sc, { order: 3, size: "h4", m: 0, children: c.title }),
            /* @__PURE__ */ l.jsxs(
              ue,
              {
                size: "xs",
                variant: "light",
                className: "agent-copy",
                onClick: () => {
                  Hb(c.text).then(
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
        /* @__PURE__ */ l.jsx(io, { justify: "flex-end", gap: "md", mt: "lg", children: /* @__PURE__ */ l.jsx(ue, { id: "agents-done", onClick: () => s(!1), children: b("common.done") }) })
      ]
    }
  );
}
function Wb(e) {
  const t = document.createElement("div");
  t.dataset.island = "agents", document.body.append(t);
  const n = { current: null };
  Ue("agents", t, /* @__PURE__ */ l.jsx(Ub, { host: e, controller: n }));
  async function o() {
    try {
      const s = await Sb();
      n.current?.(s);
    } catch (s) {
      const a = s instanceof Ye ? s.message : String(s);
      e.say(b("agents.openError", { error: a }), "error");
      return;
    }
  }
  function r() {
    let s = !1;
    try {
      s = window.localStorage.getItem(xl) !== null, window.localStorage.setItem(xl, "shown");
    } catch {
    }
    s || o();
  }
  return { open: o, offerOnFirstRun: r };
}
const qb = [
  { id: "png", label: "PNG", detail: b("export.pngDetail"), icon: "ph-image" },
  { id: "svg", label: "SVG", detail: b("export.svgDetail"), icon: "ph-file-svg" }
];
function Kb(e, t, n, o) {
  return e === "svg" ? {
    url: Bb(t, Le(n)),
    filename: `${o}.svg`
  } : { url: Df(t, o), filename: `${o}.png` };
}
const Zn = [
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
function Mr(e, t) {
  const n = e.canvas.width, o = e.canvas.height, r = t.longEdge === null ? 1 : t.longEdge / Math.max(n, o);
  return {
    width: Math.max(1, Math.round(n * r)),
    height: Math.max(1, Math.round(o * r)),
    scale: r
  };
}
function Xb(e) {
  const t = window.document.getElementById(e);
  if (!t) throw new Error(`missing element #${e}`);
  return t;
}
function Sl(e) {
  return e.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "assemblash-export";
}
function Yb(e) {
  return e < 1024 ? b("export.bytes", { count: Ee(e) }) : e < 1024 * 1024 ? `${Ee(Math.round(e / 102.4) / 10)} KB` : `${Ee(Math.round(e / (1024 * 1024) * 10) / 10)} MB`;
}
function Gb({ host: e, controller: t }) {
  const [n, o] = p.useState("png"), [r, s] = p.useState("8k"), [a, i] = p.useState("assemblash-export"), [c, u] = p.useState(""), [f, h] = p.useState(!1), [d, m] = p.useState(!1), [g, v] = p.useState(null);
  Fe();
  const w = p.useRef(null), x = e.document(), E = n === "svg", C = Zn.find((S) => S.id === r) ?? Zn[0];
  function k() {
    w.current && URL.revokeObjectURL(w.current), w.current = null, v(null);
  }
  function R(S = n, y = r) {
    const N = e.document();
    if (!N) {
      u(b("export.noProject"));
      return;
    }
    const D = S === "svg" ? { width: N.canvas.width, height: N.canvas.height } : Mr(N, Zn.find((O) => O.id === y) ?? Zn[0]);
    u(`${Ee(D.width)} × ${Ee(D.height)} ${b(S === "svg" ? "export.svgSummary" : "export.pngSummary")}`);
  }
  p.useEffect(() => {
    const S = () => {
      const y = e.document(), N = e.project();
      if (!y || !N) {
        e.say(b("export.projectRequired"), "error");
        return;
      }
      k(), i(Sl(y.name ?? N)), o("png"), s("8k");
      const D = Mr(y, Zn.find((O) => O.id === "8k"));
      u(`${Ee(D.width)} × ${Ee(D.height)} ${b("export.pngSummary")}`), m(!0);
    };
    return t.current = S, window.addEventListener("assemblash:export-open", S), () => {
      window.removeEventListener("assemblash:export-open", S), t.current = null, w.current && URL.revokeObjectURL(w.current);
    };
  }, [t, e]);
  async function P(S) {
    if (S.preventDefault(), !S.currentTarget.reportValidity()) return;
    const y = e.project(), N = e.document();
    if (!y || !N) return;
    const D = n, O = D === "svg" ? { width: N.canvas.width, height: N.canvas.height, scale: 1 } : Mr(N, C), z = Sl(a);
    i(z);
    const _ = Kb(D, y, N, z);
    await e.guard(b("export.openButton"), async () => {
      k(), h(!0), u(b("export.renderingSize", { width: Ee(O.width), height: Ee(O.height) }));
      try {
        const F = D === "svg" ? { width: O.width, height: O.height, bytes: 0 } : await bb(y, z, O.scale), $ = await _s(_.url);
        w.current = URL.createObjectURL($), v({ url: w.current, filename: _.filename });
        const M = D === "svg" ? $.size : F.bytes;
        u(`${Ee(F.width)} × ${Ee(F.height)} ${b("export.ready", { format: D.toUpperCase(), size: Yb(M) })}`), e.say(b("export.exported", { width: Ee(F.width), height: Ee(F.height), format: D.toUpperCase() }));
      } finally {
        h(!1);
      }
    });
  }
  return /* @__PURE__ */ l.jsx(pt, { id: "export-dialog", "data-state": d ? "open" : "closed", opened: d, onClose: () => {
    m(!1), k();
  }, title: null, withCloseButton: !1, centered: !0, size: "lg", withinPortal: !1, keepMounted: !0, children: /* @__PURE__ */ l.jsx("div", { className: "export-mantine-root", children: /* @__PURE__ */ l.jsx("form", { id: "export-form", onSubmit: (S) => {
    P(S);
  }, children: /* @__PURE__ */ l.jsxs(ve, { gap: "md", children: [
    /* @__PURE__ */ l.jsxs(Ne, { justify: "space-between", align: "flex-start", children: [
      /* @__PURE__ */ l.jsxs("div", { children: [
        /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: b("export.eyebrow") }),
        /* @__PURE__ */ l.jsx(ee, { component: "h2", fw: 700, size: "lg", children: b("export.title") })
      ] }),
      /* @__PURE__ */ l.jsx(ue, { type: "button", variant: "subtle", "aria-label": b("common.close"), onClick: () => {
        m(!1), k();
      }, children: "×" })
    ] }),
    /* @__PURE__ */ l.jsxs(ve, { gap: "xs", children: [
      /* @__PURE__ */ l.jsx(ee, { fw: 600, children: b("export.format") }),
      /* @__PURE__ */ l.jsx(Ne, { id: "export-formats", role: "radiogroup", "aria-label": b("export.format"), grow: !0, children: qb.map((S) => /* @__PURE__ */ l.jsx(fo, { component: "button", type: "button", "data-format": S.id, role: "radio", "aria-checked": n === S.id, withBorder: !0, p: "sm", bg: n === S.id ? "red.0" : void 0, style: { cursor: "pointer", textAlign: "left" }, onClick: () => {
        n !== S.id && (k(), o(S.id), R(S.id));
      }, children: /* @__PURE__ */ l.jsxs(ve, { gap: 4, children: [
        /* @__PURE__ */ l.jsxs(Ne, { gap: "xs", children: [
          /* @__PURE__ */ l.jsx("i", { className: `ph ${S.icon}`, "aria-hidden": "true" }),
          /* @__PURE__ */ l.jsx("b", { children: S.label })
        ] }),
        /* @__PURE__ */ l.jsx(ee, { size: "sm", children: b(S.id === "png" ? "export.pngDetail" : "export.svgDetail") })
      ] }) }, S.id)) })
    ] }),
    /* @__PURE__ */ l.jsxs(ve, { id: "export-resolution-row", "aria-disabled": E, gap: "xs", children: [
      /* @__PURE__ */ l.jsx(ee, { fw: 600, children: b("export.resolution") }),
      /* @__PURE__ */ l.jsx(Ne, { id: "export-options", role: "radiogroup", "aria-label": b("export.resolution"), "aria-disabled": E, grow: !0, children: Zn.map((S) => {
        const y = x ? Mr(x, S) : null;
        return /* @__PURE__ */ l.jsx(fo, { component: "button", type: "button", disabled: E, role: "radio", "aria-checked": r === S.id && !E, withBorder: !0, p: "sm", bg: r === S.id && !E ? "red.0" : void 0, style: { cursor: E ? "not-allowed" : "pointer", textAlign: "left" }, onClick: () => {
          s(S.id), k(), R(n, S.id);
        }, children: /* @__PURE__ */ l.jsxs(ve, { gap: 4, children: [
          /* @__PURE__ */ l.jsxs(Ne, { gap: "xs", children: [
            /* @__PURE__ */ l.jsx("i", { className: `ph ${S.icon}`, "aria-hidden": "true" }),
            /* @__PURE__ */ l.jsx("b", { children: S.id === "original" ? b("export.original") : S.id === "8k" ? b("export.resolution8k") : S.label })
          ] }),
          /* @__PURE__ */ l.jsx(ee, { size: "sm", children: y ? `${Ee(y.width)} × ${Ee(y.height)}` : b(S.id === "original" ? "export.documentSize" : `export.longEdge${S.id}`) })
        ] }) }, S.id);
      }) })
    ] }),
    /* @__PURE__ */ l.jsx(dt, { id: "export-name", label: b("export.fileName"), value: a, onChange: (S) => i(S.currentTarget.value), pattern: "[A-Za-z0-9_-]+", maxLength: 60, required: !0 }),
    /* @__PURE__ */ l.jsx(ee, { id: "export-summary", "aria-live": "polite", fw: 500, children: c }),
    /* @__PURE__ */ l.jsxs(Ne, { justify: "flex-end", children: [
      /* @__PURE__ */ l.jsxs(ue, { id: "export-download", component: "a", href: g?.url ?? "#", download: g?.filename, hidden: !g, variant: "default", children: [
        /* @__PURE__ */ l.jsx("i", { className: "ph ph-download-simple", "aria-hidden": "true" }),
        " ",
        b("common.download")
      ] }),
      /* @__PURE__ */ l.jsx(ue, { id: "export-cancel", type: "button", variant: "default", onClick: () => {
        m(!1), k();
      }, children: b("common.cancel") }),
      /* @__PURE__ */ l.jsxs(ue, { id: "export-confirm", type: "submit", loading: f, value: "default", children: [
        /* @__PURE__ */ l.jsx("i", { className: `ph ${f ? "ph-circle-notch" : "ph-export"}`, "aria-hidden": "true" }),
        " ",
        f ? b("export.rendering") : b("export.confirm", { format: n.toUpperCase() })
      ] })
    ] })
  ] }) }) }) });
}
function Jb(e) {
  const t = Xb("export-dialog-mount"), n = { current: null };
  return Ue("export", t, /* @__PURE__ */ l.jsx(Gb, { host: e, controller: n })), { open: () => {
    n.current ? n.current() : queueMicrotask(() => n.current?.());
  } };
}
function Cl(e, t, n) {
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
function Gi(e) {
  if (e.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  const t = e.map(ts), n = Math.min(...t.map((a) => a.x)), o = Math.min(...t.map((a) => a.y)), r = Math.max(...t.map((a) => a.x + a.width)), s = Math.max(...t.map((a) => a.y + a.height));
  return { x: n, y: o, width: r - n, height: s - o };
}
function Zb(e, t) {
  const n = e.width ?? 0, o = e.height ?? 0;
  if (!(n > 0) || !(o > 0)) return { width: 300, height: 200 };
  const r = Math.min(t.width / n, t.height / o, 1);
  return {
    width: Math.max(1, Math.round(n * r)),
    height: Math.max(1, Math.round(o * r))
  };
}
function $f(e, t, n, o = !1) {
  const r = n.width / (o ? t.width : Math.max(1, t.width)), s = n.height / (o ? t.height : Math.max(1, t.height)), a = n.x + (e.x + e.width / 2 - t.x) * r, i = n.y + (e.y + e.height / 2 - t.y) * s, c = o ? e.width * r : Math.max(1, e.width * r), u = o ? e.height * s : Math.max(1, e.height * s);
  return {
    x: a - c / 2,
    y: i - u / 2,
    width: c,
    height: u
  };
}
function sa(e) {
  const t = new DataView(new ArrayBuffer(8));
  return t.setFloat64(0, e), t.setBigUint64(0, t.getBigUint64(0) + 1n), t.getFloat64(0);
}
function Qb(e, t, n, o, r, s, a = [e]) {
  if (![e.x, e.y, e.width, e.height, t, o, r].every(Number.isFinite)) return null;
  const i = n.includes("e") ? 1 : n.includes("w") ? -1 : 0, c = n.includes("s") ? 1 : n.includes("n") ? -1 : 0, u = Cl(o, r, -t), f = i * u.x * (s.centre ? 2 : 1), h = c * u.y * (s.centre ? 2 : 1);
  if (f === 0 && h === 0) return { ...e };
  if (!(e.width > 0 && e.height > 0) || a.length === 0 || a.some((y) => !Number.isFinite(y.width) || !Number.isFinite(y.height) || y.width <= 0 || y.height <= 0)) return null;
  const d = 1 + f / e.width, m = 1 + h / e.height;
  if (![d, m].every(Number.isFinite)) return null;
  const g = Math.max(...a.map((y) => Math.min(1, y.width) / y.width)), v = Math.max(...a.map((y) => Math.min(1, y.height) / y.height));
  let w, x;
  if (s.ratio) {
    const y = i && c ? Math.abs(d - 1) >= Math.abs(m - 1) ? d : m : i ? d : m;
    w = x = Math.max(y, g, v);
  } else
    w = i ? Math.max(d, g) : 1, x = c ? Math.max(m, v) : 1;
  for (let y = 0; y < 4; y += 1) {
    const N = a.some((O) => O.width * w < Math.min(1, O.width)), D = a.some((O) => O.height * x < Math.min(1, O.height));
    if (!N && !D) break;
    s.ratio ? w = x = sa(w) : (N && (w = sa(w)), D && (x = sa(x)));
  }
  if (w === 1 && x === 1) return { ...e };
  const E = e.width * w, C = e.height * x, k = Cl(
    s.centre ? 0 : i * (E - e.width) / 2,
    s.centre ? 0 : c * (C - e.height) / 2,
    t
  ), R = {
    x: e.x + e.width / 2 + k.x - E / 2,
    y: e.y + e.height / 2 + k.y - C / 2,
    width: E,
    height: C
  };
  if (t === 0 && (R.x = s.centre || i === 0 ? e.x + (e.width - E) / 2 : i > 0 ? e.x : e.x + e.width - E, R.y = s.centre || c === 0 ? e.y + (e.height - C) / 2 : c > 0 ? e.y : e.y + e.height - C), !Object.values(R).every(Number.isFinite) || E <= 0 || C <= 0) return null;
  const P = R.width / e.width, S = R.height / e.height;
  return a.some((y) => {
    const N = y.width * P, D = y.height * S;
    return !Number.isFinite(N) || !Number.isFinite(D) || N < Math.min(1, y.width) || D < Math.min(1, y.height);
  }) ? null : R;
}
function ew(e, t) {
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
function tw(e, t, n) {
  const o = (e.transform.rotation ?? 0) * Math.PI / 180, r = Math.cos(o), s = Math.sin(o), a = e.transform.flipHorizontal ? -1 : 1, i = e.transform.flipVertical ? -1 : 1, c = (n.width - t.width) / 2, u = (n.height - t.height) / 2, f = n.x - t.x, h = n.y - t.y;
  if (e.type === "text" || e.type === "group") {
    const k = r * a * c - s * i * u, R = s * a * c + r * i * u, P = e.type === "group" && (a < 0 || i < 0), S = [1, 0, 0, 1, f + (P ? 0 : c) - k, h + (P ? 0 : u) - R];
    return S.every(Number.isFinite) ? S : null;
  }
  const d = n.width / t.width, m = n.height / t.height, g = r * r * d + s * s * m, v = r * s * (d - m), w = s * s * d + r * r * m, x = t.x + t.width / 2, E = t.y + t.height / 2, C = [g, v, v, w, n.x + n.width / 2 - g * x - v * E, n.y + n.height / 2 - v * x - w * E];
  return C.every(Number.isFinite) ? C : null;
}
const nw = "Aa Bb 0123", Qn = /* @__PURE__ */ new Map(), Ta = /* @__PURE__ */ new WeakMap(), Pa = /* @__PURE__ */ new WeakSet();
function ow(e) {
  let t = Qn.get(e);
  if (!t && (t = _s(e).catch((n) => {
    throw Qn.delete(e), n;
  }), Qn.set(e, t), Qn.size > 64)) {
    const n = Qn.keys().next().value;
    n && Qn.delete(n);
  }
  return t;
}
function Aa(e) {
  for (const t of e.querySelectorAll("img[data-font-specimen]")) {
    const n = Ta.get(t);
    n && URL.revokeObjectURL(n), Ta.delete(t), Pa.add(t), t.removeAttribute("src");
  }
}
function rw(e, t, n) {
  const o = window.document.createElement("span");
  o.className = "font-specimen";
  const r = window.document.createElement("img");
  r.className = "font-specimen-image", r.dataset.fontSpecimen = "", r.alt = "", r.setAttribute("aria-hidden", "true");
  const s = window.document.createElement("span");
  s.className = "font-specimen-status", s.hidden = !0, o.append(r, s), e.append(o), ow(t).then((a) => {
    if (!r.isConnected || Pa.has(r)) return;
    const i = URL.createObjectURL(a);
    Ta.set(r, i), r.src = i, s.hidden = !0;
  }).catch(() => {
    !r.isConnected || Pa.has(r) || (s.textContent = b(n), s.hidden = !1);
  });
}
function sw(e) {
  return e.find((t) => t.weight === 400 && t.style === "normal") ?? e.find((t) => t.style === "normal") ?? e[0] ?? null;
}
function Lf(e, t, n = nw) {
  rw(e, Na(t, n), "fonts.previewUnavailable");
}
function zf(e, t) {
  return t.filter((n) => n.family === e).sort((n, o) => n.weight - o.weight);
}
let aw = 0;
function iw({ host: e, value: t, disabled: n, label: o, onCommit: r }) {
  const s = p.useMemo(() => ({ initialFamily: t, initialDisabled: n }), []);
  return p.useEffect(() => {
    s.setFamily?.(t), s.setDisabled?.(n);
  }, [s, t, n]), s.label = o, /* @__PURE__ */ l.jsx("span", { className: "font-selector", children: /* @__PURE__ */ l.jsx(_f, { host: e, actions: s, onCommit: r }) });
}
let cw = 0;
function lw(e, t) {
  const n = e.trim().toLowerCase();
  return n ? t.families.find((o) => o.toLowerCase() === n) ?? null : null;
}
function uw({
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
      return t && Lf(i, t), () => Aa(i);
  }, [t]), /* @__PURE__ */ l.jsx("li", { ref: a, id: r, "data-family": e, className: n ? "active" : void 0, "aria-selected": o, onMouseDown: s, children: /* @__PURE__ */ l.jsxs(xe.Option, { value: e, active: n, selected: o, children: [
    /* @__PURE__ */ l.jsx("span", { className: "font-selector-family", children: e }),
    /* @__PURE__ */ l.jsx(ee, { component: "span", size: "xs", c: "dimmed", className: "font-selector-faces", children: t ? `${t.style === "italic" ? b("fonts.styleItalic") : b("fonts.styleNormal")} ${Ee(t.weight)}` : b("fonts.facesUnknown") }),
    !t && /* @__PURE__ */ l.jsx("span", { className: "font-specimen-status", children: b("fonts.previewUnavailable") })
  ] }) });
}
function _f({
  host: e,
  onCommit: t,
  actions: n
}) {
  Fe();
  const [o, r] = p.useState(n.initialFamily), [s, a] = p.useState(!1), [i, c] = p.useState(n.initialDisabled), [u, f] = p.useState(-1), h = p.useRef(null), d = p.useRef(""), m = p.useMemo(() => `font-selector-options-${++cw}`, []), g = Ti({
    loop: !0,
    onDropdownClose: () => f(-1)
  }), v = e.store(), w = o.trim().toLowerCase(), x = w ? v.families.filter((y) => y.toLowerCase().includes(w)) : v.families, E = p.useCallback(() => {
    g.closeDropdown(), f(-1);
  }, [g]), C = p.useCallback((y) => {
    d.current = y, r(y), a(!1), E(), h.current?.blur(), t(y);
  }, [E, t]), k = p.useCallback(() => {
    E();
    const y = h.current?.value.trim() ?? "";
    if (!y || y.toLowerCase() === d.current.toLowerCase()) return;
    const N = lw(y, e.store());
    if (!N) {
      a(!0);
      return;
    }
    d.current = N, r(N), a(!1), t(N);
  }, [E, e, t]), R = p.useCallback(() => {
    r(h.current?.value ?? ""), a(!1), f(-1), g.openDropdown();
  }, [g]), P = p.useCallback((y) => {
    h.current = y, y && (y.onfocus = () => Wt.flushSync(() => R()), y.onblur = k, y.oninput = () => {
      Wt.flushSync(() => {
        r(y.value), a(!1), f(-1), g.openDropdown();
      });
    }, y.onkeydown = (N) => Wt.flushSync(() => S(N)));
  }, [n, k, R, S]);
  n.setFamily = (y) => {
    d.current = y, r(y), a(!1);
  }, n.setDisabled = (y) => {
    c(y), y && E();
  };
  function S(y) {
    if (y.key === "ArrowDown" || y.key === "ArrowUp") {
      y.preventDefault(), g.dropdownOpened || g.openDropdown(), x.length && f((N) => {
        const D = y.key === "ArrowDown" ? 1 : -1;
        return (N + D + x.length) % x.length;
      });
      return;
    }
    if (y.key === "Enter" && g.dropdownOpened && u >= 0) {
      const N = x[u];
      N && (y.preventDefault(), C(N));
      return;
    }
    y.key === "Escape" && g.dropdownOpened && (y.preventDefault(), y.stopPropagation(), E());
  }
  return p.useLayoutEffect(() => {
    u < 0 || document.getElementById(`${m}-${u}`)?.scrollIntoView({ block: "nearest" });
  }, [u, m]), /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
    /* @__PURE__ */ l.jsxs(
      xe,
      {
        store: g,
        onOptionSubmit: C,
        position: "bottom-start",
        offset: 4,
        withinPortal: !1,
        floatingStrategy: "fixed",
        shadow: "md",
        onDismiss: () => E(),
        children: [
          /* @__PURE__ */ l.jsx(xe.Target, { withKeyboardNavigation: !1, withAriaAttributes: !1, children: /* @__PURE__ */ l.jsx(
            dt,
            {
              ref: P,
              value: o,
              autoComplete: "off",
              disabled: i,
              role: "combobox",
              "aria-autocomplete": "list",
              "aria-label": n.label ?? b("editor.fontFamily"),
              "aria-expanded": g.dropdownOpened,
              "aria-controls": m,
              "aria-activedescendant": u >= 0 ? `${m}-${u}` : void 0,
              onChange: (y) => {
                r(y.currentTarget.value), a(!1), f(-1), g.openDropdown();
              }
            }
          ) }),
          /* @__PURE__ */ l.jsxs(
            xe.Dropdown,
            {
              className: "font-selector-list",
              hidden: !g.dropdownOpened,
              "aria-labelledby": `${m}-heading`,
              children: [
                /* @__PURE__ */ l.jsx(ee, { component: "p", size: "xs", fw: 700, c: "dimmed", id: `${m}-heading`, className: "font-selector-heading", "data-i18n": "fonts.selectorHeading", children: b("fonts.selectorHeading") }),
                /* @__PURE__ */ l.jsxs(xe.Options, { id: m, role: "listbox", children: [
                  x.map((y, N) => {
                    const D = zf(y, v.faces);
                    return /* @__PURE__ */ l.jsx(
                      uw,
                      {
                        id: `${m}-${N}`,
                        family: y,
                        face: sw(D),
                        active: N === u,
                        selected: N === u,
                        onMouseDown: (O) => {
                          O.preventDefault(), C(y);
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
function dw(e, t) {
  const n = window.document.createElement("span");
  n.className = "font-selector";
  const o = {
    initialFamily: "",
    initialDisabled: !1
  }, r = Ue(
    `font-selector-${++aw}`,
    n,
    /* @__PURE__ */ l.jsx(_f, { host: e, onCommit: t, actions: o })
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
const jl = "Aa Bb 0123";
function Mo(e) {
  if (e.length <= 1) return e[0] ?? "";
  const t = ti();
  return new Intl.ListFormat(t === "pseudo" ? "en" : t, {
    style: "long",
    type: "conjunction"
  }).format(e);
}
function kl(e) {
  const t = e / 1048576;
  return t >= 10 ? `${Ee(Math.round(t))} MB` : `${Ee(Math.max(0.1, Math.round(t * 10) / 10))} MB`;
}
const eo = /* @__PURE__ */ new Map();
function fw(e) {
  let t = eo.get(e);
  if (!t && (t = _s(e).catch((n) => {
    throw eo.delete(e), n;
  }), eo.set(e, t), eo.size > 64)) {
    const n = eo.keys().next().value;
    n && eo.delete(n);
  }
  return t;
}
function El({
  url: e,
  unavailable: t,
  generation: n
}) {
  const [o, r] = p.useState(""), [s, a] = p.useState(!1);
  return p.useEffect(() => {
    let i = !0, c = "";
    return r(""), a(!1), fw(e).then((u) => {
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
function pw({ host: e, controller: t }) {
  const [n, o] = p.useState([]), [r, s] = p.useState([]), [a, i] = p.useState(jl), [c, u] = p.useState(jl), [f, h] = p.useState([]), [d, m] = p.useState(null), [g, v] = p.useState({}), [w, x] = p.useState(!1), [E, C] = p.useState(""), [k, R] = p.useState(!1), [P, S] = p.useState(0), [y, N] = p.useState(null), D = Fe(), [O, z] = p.useState(!0), _ = p.useRef(n), F = p.useRef(null), $ = p.useRef(null), M = p.useRef(void 0);
  _.current = n;
  const L = p.useCallback((q, K) => {
    _.current = q, o(q), s(K), e.fontsChanged({ families: q, faces: K });
  }, [e]), I = p.useCallback(async () => {
    z(!0);
    const q = await Lb();
    L([...q.families], [...q.faces]);
  }, [L]);
  p.useLayoutEffect(() => (t.reload = I, t.focusInstall = () => F.current?.focus(), t.hasFamilies = () => _.current.length > 0, t.releaseSamples = () => {
    z(!1), S((q) => q + 1);
  }, I(), () => {
    window.clearTimeout(M.current), t.reload = async () => {
    }, t.focusInstall = () => {
    }, t.hasFamilies = () => !1, t.releaseSamples = () => {
    };
  }), [t, I]);
  const A = p.useCallback(async () => {
    if (d) return d;
    const q = await Fb();
    return m(q), q;
  }, [d]);
  p.useEffect(() => {
    A().catch(() => m(null));
  }, [A]);
  const B = p.useCallback(async () => {
    try {
      const q = await A(), K = q.packs.default ?? [], ce = q.families.filter((be) => K.includes(be.family)).reduce((be, pe) => be + pe.bytes, 0);
      C(K.length ? b("fonts.defaultPackDescription", { names: Mo(K), bytes: kl(ce) }) : b("fonts.noDefaultPack")), R(!1);
    } catch (q) {
      C(q instanceof Ye ? b("fonts.packDescribeErrorCode", { error: q.message, code: q.code }) : b("fonts.packDescribeError")), R(!0);
    }
  }, [A]);
  p.useEffect(() => {
    n.length || B();
  }, [n.length, B]), p.useEffect(() => {
    let q = !0;
    return $b().then((K) => {
      q && v(K);
    }).catch(() => {
      q && v({});
    }), () => {
      q = !1;
    };
  }, []);
  const H = p.useCallback(async () => {
    e.project() && await e.refresh();
  }, [e]), W = async () => {
    await e.guard(b("fonts.installFonts"), async () => {
      x(!0), e.say(b("fonts.downloadingDefault"));
      try {
        const q = await bl("default");
        await I(), await H(), e.say(b("fonts.installedFamilies", { names: Mo(q.families) }));
      } finally {
        x(!1);
      }
    });
  }, Y = (q) => {
    e.guard(b("fonts.installNamedPack", { pack: q }), async () => {
      try {
        await bl(q), await I(), await H(), e.say(b("fonts.installedNamedPack", { pack: q }));
      } finally {
        S((K) => K + 1);
      }
    });
  }, ae = (q) => {
    const K = [...q ?? []];
    $.current && ($.current.value = ""), K.length && e.guard(b("fonts.importFont"), async () => {
      h([]);
      let ce = 0;
      const be = [];
      for (const Ce of K)
        try {
          const ne = await zb(Ce);
          ce += 1;
          const U = [...new Set(ne.imported.map((V) => V.family))];
          be.push(U.length ? `${Ce.name} → ${Mo(U)}` : b("fonts.importedFile", { file: Ce.name }));
        } catch (ne) {
          be.push(ne instanceof Ye ? `${Ce.name}: ${ne.message} (${ne.code})` : `${Ce.name}: ${String(ne)}`);
        }
      h(be), await I(), ce && await H();
      const pe = K.length - ce;
      ce ? e.say(Dt("fonts.importResult", ce, {
        refused: pe ? Dt("fonts.refusedCount", pe) : ""
      })) : e.say(b("fonts.noneImported", { refused: Dt("fonts.refusedCount", pe) }), "error");
    });
  }, fe = (q) => {
    window.confirm(b("fonts.confirmRemove", { family: q })) && e.guard(b("fonts.removeAction", { family: q }), async () => {
      h([]);
      const K = await _b(q);
      h([Dt("fonts.removedFiles", K.removed, { family: q })]), await I(), await H(), e.say(b("fonts.removedFromStore", { family: q }));
    });
  }, ie = (q) => {
    u(q), window.clearTimeout(M.current), M.current = window.setTimeout(() => {
      const K = q.trim();
      !K || [...K].some((ce) => /[\u0000-\u001f\u007f]/u.test(ce)) || i(K);
    }, 180);
  }, te = d ? ["text", "display", "mono", ...Object.keys(d.packs).filter((q) => !["default", "text", "display", "mono"].includes(q)).sort()] : [], he = n.length === 0;
  return /* @__PURE__ */ l.jsxs(ve, { gap: "md", "data-testid": "font-manager", children: [
    /* @__PURE__ */ l.jsx(Q, { id: "font-empty", "data-testid": "font-empty", hidden: !he, children: /* @__PURE__ */ l.jsxs(ve, { gap: "sm", children: [
      /* @__PURE__ */ l.jsx(ee, { component: "p", size: "sm", children: b("fonts.noneInstalled") }),
      /* @__PURE__ */ l.jsx(ee, { component: "p", className: "font-install-copy", size: "sm", c: "dimmed", children: b("fonts.defaultPackCopy") }),
      /* @__PURE__ */ l.jsx(
        ue,
        {
          id: "install-default",
          "data-testid": "install-default",
          ref: F,
          disabled: w || d !== null && (d.packs.default ?? []).length === 0,
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
      dt,
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
        hidden: he,
        onChange: (q) => ie(q.currentTarget.value)
      }
    ),
    /* @__PURE__ */ l.jsx("ul", { id: "font-list", "data-testid": "font-list", className: "font-list", hidden: he, children: n.map((q) => {
      const K = r.filter((pe) => pe.family === q), ce = K.map(
        (pe) => `${pe.style === "italic" ? b("fonts.styleItalic") : b("fonts.styleNormal")} ${Ee(pe.weight)}`
      ).join(", "), be = K.find((pe) => pe.weight === 400 && pe.style === "normal") ?? K.find((pe) => pe.style === "normal") ?? K[0];
      return /* @__PURE__ */ l.jsxs("li", { className: "font-family", "data-family": q, children: [
        /* @__PURE__ */ l.jsxs(Ne, { justify: "space-between", align: "center", wrap: "nowrap", children: [
          /* @__PURE__ */ l.jsxs("div", { className: "font-family-text", children: [
            /* @__PURE__ */ l.jsx("strong", { children: q }),
            /* @__PURE__ */ l.jsx("span", { className: "font-faces", children: Dt("fonts.faceCount", K.length, { described: ce }) })
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
          El,
          {
            url: Na(be, a),
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
            const K = d?.packs[q] ?? [], ce = K.filter((pe) => !n.includes(pe)), be = d?.families.filter((pe) => ce.includes(pe.family)).reduce((pe, Ce) => pe + Ce.bytes, 0) ?? 0;
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
                  /* @__PURE__ */ l.jsx(ee, { component: "span", size: "xs", c: "dimmed", children: ce.length ? b("fonts.namedPackDownload", { names: Mo(K), bytes: kl(be) }) : b("fonts.namedPackInstalled", { names: Mo(K) }) }),
                  /* @__PURE__ */ l.jsx(Ne, { gap: "xs", wrap: "wrap", className: "font-pack-samples", children: K.map((pe) => {
                    const Ce = r.filter((V) => V.family === pe).find((V) => V.weight === 400 && V.style === "normal") ?? r.find((V) => V.family === pe), ne = g[pe], U = Ce ? Na(Ce) : ne ? `/catalogue-specimens/${ne.src.replace(/^\.\//u, "")}` : null;
                    return /* @__PURE__ */ l.jsxs("span", { className: "font-pack-family", children: [
                      /* @__PURE__ */ l.jsx(ee, { component: "span", size: "xs", fw: 700, className: "font-pack-family-name", children: pe }),
                      O && U ? /* @__PURE__ */ l.jsx(
                        El,
                        {
                          url: U,
                          unavailable: Ce ? "fonts.previewUnavailable" : "fonts.cataloguePreviewUnavailable",
                          generation: P + D
                        }
                      ) : U ? null : /* @__PURE__ */ l.jsx("span", { className: "font-specimen-status", children: b("fonts.cataloguePreviewUnavailable") })
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
function hw(e, t) {
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
  return Ue("font-manager", t, /* @__PURE__ */ l.jsx(pw, { host: e, controller: n })), {
    reload: () => n.reload(),
    focusInstall: () => n.focusInstall(),
    hasFamilies: () => n.hasFamilies(),
    releaseSamples: () => n.releaseSamples()
  };
}
class mw {
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
const gw = [
  { size: "1080x1080", width: 1080, height: 1080, label: "common.square" },
  { size: "1920x1080", width: 1920, height: 1080, label: "common.landscape" },
  { size: "1080x1350", width: 1080, height: 1350, label: "common.portrait" },
  { size: "1080x1920", width: 1080, height: 1920, label: "common.story" }
];
function vw({
  host: e,
  controller: t
}) {
  const [n, o] = p.useState(!1), [r, s] = p.useState(""), [a, i] = p.useState(1080), [c, u] = p.useState(1080), [f, h] = p.useState("#ffffff"), [d, m] = p.useState("1080x1080"), [g, v] = p.useState(!1);
  Fe(), p.useEffect(() => (t.current = () => {
    s(""), i(1080), u(1080), h("#ffffff"), m("1080x1080"), o(!0);
  }, () => {
    t.current = null;
  }), [t]);
  async function w(x) {
    x.preventDefault();
    const E = r.trim(), C = Number(a), k = Number(c);
    if (!(!E || !Number.isFinite(C) || !Number.isFinite(k)) && !(C <= 0 || k <= 0 || g)) {
      v(!0);
      try {
        await e.create(E, C, k, f) && o(!1);
      } finally {
        v(!1);
      }
    }
  }
  return /* @__PURE__ */ l.jsx(
    pt,
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
          dt,
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
          /* @__PURE__ */ l.jsx(Ja, { id: "canvas-presets", cols: { base: 2, sm: 4 }, children: gw.map((x) => /* @__PURE__ */ l.jsx(
            ue,
            {
              type: "button",
              "data-size": x.size,
              variant: d === x.size ? "light" : "default",
              onClick: () => {
                i(x.width), u(x.height), m(x.size);
              },
              children: b(x.label)
            },
            x.size
          )) })
        ] }),
        /* @__PURE__ */ l.jsxs(Ne, { grow: !0, align: "start", children: [
          /* @__PURE__ */ l.jsx(
            Go,
            {
              id: "new-project-width",
              label: b("common.width"),
              value: a,
              onChange: (x) => {
                i(x), m("");
              },
              min: 1,
              allowDecimal: !1,
              required: !0
            }
          ),
          /* @__PURE__ */ l.jsx(
            Go,
            {
              id: "new-project-height",
              label: b("common.height"),
              value: c,
              onChange: (x) => {
                u(x), m("");
              },
              min: 1,
              allowDecimal: !1,
              required: !0
            }
          ),
          /* @__PURE__ */ l.jsx(
            pr,
            {
              id: "new-project-background",
              label: b("common.background"),
              value: f,
              onChange: h,
              format: "hex",
              required: !0
            }
          )
        ] }),
        /* @__PURE__ */ l.jsxs(Ne, { justify: "flex-end", children: [
          /* @__PURE__ */ l.jsx(ue, { id: "new-project-cancel", type: "button", variant: "default", onClick: () => o(!1), children: b("common.cancel") }),
          /* @__PURE__ */ l.jsx(ue, { id: "create-project-confirm", type: "submit", loading: g, children: b("dialogs.createProject") })
        ] })
      ] }) })
    }
  );
}
function yw(e) {
  const t = document.getElementById("new-project-dialog-mount");
  if (!t) throw new Error("missing element #new-project-dialog-mount");
  const n = { current: null };
  return Ue("project-create", t, /* @__PURE__ */ l.jsx(vw, { host: e, controller: n })), { open: () => n.current?.() };
}
function bw({ controller: e }) {
  const [t, n] = p.useState(null), [o, r] = p.useState(!1);
  Fe();
  const [s, a] = p.useState(""), i = p.useRef(null), c = p.useRef(null), u = p.useRef(null), f = p.useCallback(() => {
    r(!1), n(null), a("");
  }, []), h = p.useCallback((m) => {
    m.preventDefault();
    const g = i.current;
    if (!g?.reportValidity()) return;
    const v = g.value.trim();
    if (!v) return;
    const w = t?.submit;
    f(), w?.(v);
  }, [f, t]), d = p.useCallback((m) => {
    n(m), a(""), r(!0);
  }, []);
  return e.open = d, /* @__PURE__ */ l.jsxs(
    pt,
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
      ref: (m) => {
        m && Object.defineProperty(m, "open", {
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
            onSubmit: h,
            onKeyDown: (m) => {
              m.key === "Enter" && (m.preventDefault(), c.current && u.current && c.current.requestSubmit(u.current));
            },
            children: [
              /* @__PURE__ */ l.jsx(
                dt,
                {
                  id: "name-dialog-input",
                  ref: i,
                  label: /* @__PURE__ */ l.jsx("span", { id: "name-dialog-label", children: t ? b(t.labelKey) : b("common.name") }),
                  value: s,
                  onChange: (m) => a(m.currentTarget.value),
                  autoComplete: "off",
                  maxLength: 80,
                  required: !0,
                  autoFocus: !0
                }
              ),
              /* @__PURE__ */ l.jsxs(io, { justify: "flex-end", gap: "sm", mt: "lg", children: [
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
function ww() {
  const e = window.document.createElement("div");
  e.dataset.island = "name-prompt", window.document.body.append(e);
  const t = {};
  Ue("name-prompt", e, /* @__PURE__ */ l.jsx(bw, { controller: t }));
  const n = t.open;
  if (!n) throw new Error("Mantine name prompt failed to mount");
  return {
    request(o, r, s, a) {
      n({ titleKey: o, labelKey: r, confirmKey: s, submit: a });
    }
  };
}
function xw(e) {
  const t = window.document.getElementById(e);
  if (!t) throw new Error(`missing element #${e}`);
  return t;
}
function Sw({ controller: e }) {
  const { colorScheme: t, setColorScheme: n } = xh(), [o, r] = p.useState(!1), [s, a] = p.useState("settings-agents");
  Fe();
  const i = p.useRef(null), c = p.useRef(null), u = p.useRef(null);
  function f(m = "settings-agents", g) {
    a(m), g && (i.current && (i.current.checked = g.follow), c.current && (c.current.value = g.language)), r(!0);
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
  return /* @__PURE__ */ l.jsx(pt, { ref: u, id: "settings-dialog", "data-state": o ? "open" : "closed", opened: o, onClose: h, title: null, withCloseButton: !1, centered: !0, size: "xl", withinPortal: !1, keepMounted: !0, keepMountedMode: "display-none", children: /* @__PURE__ */ l.jsx("form", { id: "settings-form", onSubmit: d, children: /* @__PURE__ */ l.jsxs(ve, { gap: "md", children: [
    /* @__PURE__ */ l.jsxs(Ne, { justify: "space-between", align: "flex-start", children: [
      /* @__PURE__ */ l.jsxs("div", { children: [
        /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: b("settings.preferences") }),
        /* @__PURE__ */ l.jsx(ee, { component: "h2", fw: 700, children: b("settings.openButton") })
      ] }),
      /* @__PURE__ */ l.jsx(ue, { id: "settings-close", type: "submit", value: "cancel", variant: "subtle", title: b("common.close"), "aria-label": b("common.close"), children: "×" })
    ] }),
    /* @__PURE__ */ l.jsxs(Pe, { value: s, onChange: (m) => a(m), variant: "separated", keepMounted: !0, keepMountedMode: "display-none", children: [
      /* @__PURE__ */ l.jsxs(Pe.Item, { id: "settings-agents", className: "settings-section", value: "settings-agents", children: [
        /* @__PURE__ */ l.jsx(Pe.Control, { children: /* @__PURE__ */ l.jsxs(Ne, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx("i", { className: "ph ph-robot", "aria-hidden": "true" }),
          /* @__PURE__ */ l.jsxs(ve, { gap: 0, children: [
            /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: b("settings.collaboration") }),
            /* @__PURE__ */ l.jsx(ee, { id: "settings-agents-heading", fw: 600, children: b("settings.aiAgents") })
          ] })
        ] }) }),
        /* @__PURE__ */ l.jsx(Pe.Panel, { children: /* @__PURE__ */ l.jsxs(ve, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx(ue, { id: "agents", type: "button", leftSection: /* @__PURE__ */ l.jsx("i", { className: "ph ph-plugs-connected", "aria-hidden": "true" }), children: b("agents.dialogTitle") }),
          /* @__PURE__ */ l.jsx(on, { id: "setting-follow", ref: i, defaultChecked: !0, label: b("agents.followChanges") }),
          /* @__PURE__ */ l.jsx(ee, { size: "sm", c: "dimmed", children: b("agents.followHint") })
        ] }) })
      ] }),
      /* @__PURE__ */ l.jsxs(Pe.Item, { id: "settings-document", className: "settings-section", value: "settings-document", children: [
        /* @__PURE__ */ l.jsx(Pe.Control, { children: /* @__PURE__ */ l.jsxs(Ne, { gap: "sm", children: [
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
        /* @__PURE__ */ l.jsx(Pe.Control, { children: /* @__PURE__ */ l.jsxs(Ne, { gap: "sm", children: [
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
        /* @__PURE__ */ l.jsx(Pe.Control, { children: /* @__PURE__ */ l.jsxs(Ne, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx("i", { className: "ph ph-gear-six", "aria-hidden": "true" }),
          /* @__PURE__ */ l.jsxs(ve, { gap: 0, children: [
            /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: b("settings.application") }),
            /* @__PURE__ */ l.jsx(ee, { id: "settings-application-heading", fw: 600, children: b("settings.updatesControl") })
          ] })
        ] }) }),
        /* @__PURE__ */ l.jsx(Pe.Panel, { children: /* @__PURE__ */ l.jsxs(ve, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx(mo, { id: "setting-language", ref: c, label: /* @__PURE__ */ l.jsx("span", { "data-i18n": "settings.languageLabel", children: b("settings.languageLabel") }), defaultValue: "en", data: [
            { value: "en", label: b("settings.languageEnglish") },
            { value: "fr", label: b("settings.languageFrench") },
            { value: "de", label: b("settings.languageGerman") }
          ] }),
          /* @__PURE__ */ l.jsx(
            Rt.Wrapper,
            {
              id: "setting-appearance-wrapper",
              label: b("settings.appearance"),
              labelElement: "div",
              labelProps: { id: "setting-appearance-label" },
              children: /* @__PURE__ */ l.jsx(
                mr,
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
                    { value: "system", label: b("settings.appearanceSystem") },
                    { value: "light", label: b("settings.appearanceLight") },
                    { value: "dark", label: b("settings.appearanceDark") }
                  ]
                }
              )
            }
          ),
          /* @__PURE__ */ l.jsx(on, { id: "setting-update-check", label: b("updates.dailyCheckSetting") }),
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
function Cw() {
  const e = xw("settings-dialog-mount"), t = { current: null };
  return Ue("settings", e, /* @__PURE__ */ l.jsx(Sw, { controller: t })), {
    open: (n, o) => t.current?.open(n, o),
    close: () => t.current?.close(),
    isOpen: () => t.current?.isOpen() ?? !1
  };
}
const jw = {
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
function kw({ host: e, controller: t, boundary: n }) {
  const [o, r] = p.useState({
    projects: [],
    query: "",
    currentProject: null
  }), [s, a] = p.useState(""), i = p.useRef(""), [c, u] = p.useState(b("projects.searchPlaceholder")), [f, h] = p.useState(!1), [d, m] = p.useState(-1), g = Fe(), v = p.useRef(null), w = p.useRef(void 0), x = p.useRef(o);
  x.current = o, p.useEffect(() => (t.setProjects = (y) => {
    if (x.current = y, r(y), m(-1), !y.query) {
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
  }), [t]), p.useEffect(() => {
    if (s) return;
    const y = o.currentProject ? o.projects.find((N) => N.id === o.currentProject) : void 0;
    u(y?.name ?? y?.id ?? (o.projects.length ? b("projects.searchPlaceholder") : b("projects.none")));
  }, [g]), p.useEffect(() => {
    const y = (N) => {
      (!(N.target instanceof Node) || !n.contains(N.target)) && (h(!1), m(-1));
    };
    return document.addEventListener("pointerdown", y), () => document.removeEventListener("pointerdown", y);
  }, [n]);
  function E(y) {
    h(y), y || m(-1);
  }
  function C(y) {
    const N = { ...x.current, currentProject: y.id };
    x.current = N, r(N), u(y.name ?? y.id), i.current = "", a(""), v.current && (v.current.value = ""), v.current?.blur(), E(!1), e.openProject(y.id);
  }
  function k(y) {
    i.current = y, a(y), window.clearTimeout(w.current), w.current = window.setTimeout(() => e.search(y.trim()), 150);
  }
  function R(y) {
    if (f || E(!0), o.projects.length === 0) return;
    const N = y > 0 ? 0 : o.projects.length - 1, D = d < 0 ? N : Math.max(0, Math.min(o.projects.length - 1, d + y));
    m(D), window.requestAnimationFrame(() => {
      document.getElementById(`project-option-${D}`)?.scrollIntoView({ block: "nearest" });
    });
  }
  const P = o.projects.length === 0 ? o.query ? b("projects.noMatching") : b("projects.none") : "", S = f && d >= 0 && o.projects[d] ? `project-option-${d}` : void 0;
  return /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
    /* @__PURE__ */ l.jsx("i", { className: "ph ph-magnifying-glass", "aria-hidden": "true" }),
    /* @__PURE__ */ l.jsx(
      dt,
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
          const D = o.projects[d], O = N.trim().toLocaleLowerCase(), _ = o.projects.find(
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
        hidden: !f,
        children: [
          o.projects.map((y, N) => /* @__PURE__ */ l.jsxs(
            ue,
            {
              id: `project-option-${N}`,
              className: `project-option${N === d ? " active" : ""}`,
              styles: jw,
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
                    children: Dt("projects.layerCount", y.layers)
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
function Ew(e, t) {
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
    /* @__PURE__ */ l.jsx(kw, { host: e, controller: n, boundary: t })
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
function Rw(e) {
  const t = window.document.getElementById(e);
  if (!t) throw new Error(`missing element #${e}`);
  return t;
}
function Rl(e) {
  return e.kind ?? "text";
}
function Nw({ host: e, projectController: t }) {
  const [n, o] = p.useState([]), [r, s] = p.useState(() => /* @__PURE__ */ new Map()), [a, i] = p.useState([]), [c, u] = p.useState(""), [f, h] = p.useState([]), [d, m] = p.useState(!1), [g, v] = p.useState(!1);
  Fe();
  const [w, x] = p.useState(null), E = p.useRef([]), C = p.useRef(d);
  C.current = d;
  const k = p.useRef(null), R = p.useRef(null);
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
    P(), h([]);
    const L = [];
    for (const I of M.variants) {
      const A = await vo(Df($, I.name));
      E.current.push(A), L.push({ variant: I, url: A });
    }
    h(L);
  }
  async function D($, M) {
    await e.guard($, async () => {
      const L = e.project();
      if (!L) return;
      const I = await Db(L, M);
      await N(L, I), e.say(Dt("templates.renderedCount", I.variants.length, {
        what: $,
        version: Ee(I.templateVersion)
      }));
    });
  }
  async function O($ = null) {
    const M = e.project();
    if (s(/* @__PURE__ */ new Map()), i([]), u(""), P(), h([]), !M) {
      o([]), C.current = !1, m(!1);
      return;
    }
    const L = await Mb(M), I = L.isTemplate ? L.slots : [];
    o(I), C.current = I.length > 0, m(I.length > 0);
    const A = /* @__PURE__ */ new Map();
    for (const B of I)
      Rl(B) === "color" && A.set(B.name, "#000000");
    if ($) {
      for (const [B, H] of $.values)
        I.some((W) => W.name === B) && A.set(B, H);
      i([...$.batch]), u($.variantName);
    }
    s(A);
  }
  p.useLayoutEffect(() => {
    t.current = {
      projectChanged: O,
      draft: () => ({ values: new Map(r), batch: [...a], variantName: c }),
      setOpen: v,
      isVisible: () => C.current
    };
  }), p.useEffect(() => () => {
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
        const H = {};
        for (const [W, Y] of Object.entries(B.values ?? {})) H[W] = String(Y);
        I.push({ name: B.name, values: H });
      }
      i(I), e.say(Dt("templates.loadedVariants", I.length, { file: M.name }));
    });
  }
  async function _($) {
    const M = $.currentTarget.files?.[0];
    $.currentTarget.value = "";
    const L = w;
    x(null), !(!M || !L) && await e.guard(b("templates.importImage"), async () => {
      const I = e.project();
      if (!I) return;
      const A = await Yi(I, M);
      y(L, A.asset.id), await e.refresh(), s((B) => new Map(B)), e.say(b("templates.importedImage", { file: M.name, slot: L }));
    });
  }
  const F = e.document()?.assets ?? [];
  return /* @__PURE__ */ l.jsxs(ve, { component: "section", id: "templates", className: g ? "templates open" : "templates", hidden: !d, gap: "md", "aria-label": b("templates.drawerLabel"), children: [
    /* @__PURE__ */ l.jsxs(Ne, { justify: "space-between", align: "flex-start", children: [
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
          const M = Rl($), L = r.get($.name) ?? (M === "color" ? "#000000" : "");
          return /* @__PURE__ */ l.jsxs(ve, { gap: 4, "data-slot": $.name, children: [
            M === "image" ? /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
              /* @__PURE__ */ l.jsx(co, { label: `${$.name}${$.required ? " *" : ""}`, title: $.description ?? void 0, "data-slot": $.name, value: r.get($.name) ?? "", onChange: (I) => y($.name, I ?? ""), data: [{ value: "", label: b(F.length ? "templates.leaveAsIs" : "templates.noImages") }, ...F.map((I) => ({ value: I.id, label: I.path }))] }),
              /* @__PURE__ */ l.jsx(ue, { type: "button", size: "xs", variant: "default", onClick: () => {
                x($.name), k.current?.click();
              }, children: b("templates.importButton") })
            ] }) : M === "color" ? /* @__PURE__ */ l.jsx(dt, { type: "color", label: `${$.name}${$.required ? " *" : ""}`, title: $.description ?? void 0, "data-slot": $.name, value: L, onChange: (I) => y($.name, I.currentTarget.value) }) : /* @__PURE__ */ l.jsx(dt, { label: `${$.name}${$.required ? " *" : ""}`, title: $.description ?? void 0, "data-slot": $.name, value: L, onChange: (I) => y($.name, I.currentTarget.value) }),
            $.description && /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: $.description })
          ] }, $.name);
        }) }),
        /* @__PURE__ */ l.jsx("input", { ref: k, id: "slot-image-file", type: "file", accept: "image/*,.svg", hidden: !0, onChange: ($) => {
          _($);
        } }),
        /* @__PURE__ */ l.jsxs(Ne, { align: "end", wrap: "wrap", children: [
          /* @__PURE__ */ l.jsx(ue, { id: "preview-variant", type: "button", onClick: () => {
            D(b("templates.preview"), [{ name: "preview", values: S() }]);
          }, children: b("templates.preview") }),
          /* @__PURE__ */ l.jsx(dt, { id: "variant-name", label: b("templates.variantName"), value: c, onChange: ($) => u($.currentTarget.value) }),
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
        /* @__PURE__ */ l.jsx(ve, { component: "ol", id: "variant-rows", gap: "xs", m: 0, p: 0, children: a.map(($, M) => /* @__PURE__ */ l.jsx(fo, { component: "li", withBorder: !0, p: "xs", children: /* @__PURE__ */ l.jsxs(Ne, { justify: "space-between", align: "flex-start", wrap: "nowrap", children: [
          /* @__PURE__ */ l.jsxs(ve, { gap: 2, style: { minWidth: 0 }, children: [
            /* @__PURE__ */ l.jsx(ee, { fw: 600, children: $.name }),
            /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: Object.entries($.values).map(([L, I]) => `${L}=${I}`).join("  ") })
          ] }),
          /* @__PURE__ */ l.jsx(ue, { type: "button", size: "xs", variant: "subtle", onClick: () => i((L) => L.filter((I, A) => A !== M)), children: b("templates.removeButton") })
        ] }) }, `${M}-${$.name}`)) }),
        /* @__PURE__ */ l.jsx("input", { ref: R, id: "values-file", type: "file", accept: "application/json,.json", hidden: !0, onChange: ($) => {
          z($);
        } }),
        /* @__PURE__ */ l.jsxs(Ne, { wrap: "wrap", children: [
          /* @__PURE__ */ l.jsx(ue, { id: "load-values", type: "button", variant: "default", onClick: () => R.current?.click(), children: b("templates.loadJson") }),
          /* @__PURE__ */ l.jsx(ue, { id: "render-batch", type: "button", disabled: !a.length, onClick: () => {
            D(b("templates.renderBatch"), a);
          }, children: a.length ? Dt("templates.renderVariants", a.length) : b("templates.renderBatch") }),
          /* @__PURE__ */ l.jsx(ue, { id: "clear-batch", type: "button", variant: "default", disabled: !a.length, onClick: () => i([]), children: b("templates.clear") })
        ] })
      ] }),
      /* @__PURE__ */ l.jsxs(ve, { gap: "sm", children: [
        /* @__PURE__ */ l.jsx(ee, { component: "h3", fw: 600, children: b("templates.renderedVariants") }),
        /* @__PURE__ */ l.jsx("div", { id: "gallery", style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))", gap: "var(--mantine-spacing-sm)" }, children: f.map(({ variant: $, url: M }) => /* @__PURE__ */ l.jsxs(fo, { component: "figure", withBorder: !0, p: "sm", m: 0, children: [
          /* @__PURE__ */ l.jsx("img", { src: M, alt: b("templates.variantAlt", { name: $.name }), style: { display: "block", width: "100%", height: "auto" } }),
          /* @__PURE__ */ l.jsxs(ve, { component: "figcaption", gap: 4, mt: "sm", children: [
            /* @__PURE__ */ l.jsx(ee, { component: "strong", children: $.name }),
            /* @__PURE__ */ l.jsx(ee, { size: "xs", children: b("templates.bytesSize", { width: Ee($.width), height: Ee($.height), bytes: Ee($.bytes) }) }),
            /* @__PURE__ */ l.jsx(ee, { component: "code", size: "xs", title: $.hash, children: $.hash.replace(/^sha256:/, "").slice(0, 12) }),
            /* @__PURE__ */ l.jsx(ue, { component: "a", href: M, download: `${$.name}.png`, variant: "default", size: "xs", children: b("templates.downloadButton") })
          ] })
        ] }, `${$.name}-${$.hash}`)) })
      ] })
    ] })
  ] });
}
function Tw(e) {
  const t = Rw("templates-mantine-mount"), n = { current: null };
  return Ue("templates", t, /* @__PURE__ */ l.jsx(Nw, { host: e, projectController: n })), {
    projectChanged: async (o) => {
      await n.current?.projectChanged(o);
    },
    draft: () => n.current?.draft() ?? { values: /* @__PURE__ */ new Map(), batch: [], variantName: "" },
    setOpen: (o) => n.current?.setOpen(o),
    isVisible: () => n.current?.isVisible() ?? !1
  };
}
const Ia = 64;
class Pw {
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
   * this project. A second open never adds a second tab (D33 (c)).
   */
  open(t, n) {
    const o = this.find(t);
    if (o) return { entry: o, added: !1 };
    if (this.entries.length >= Ia) throw new RangeError(`at most ${Ia} tabs`);
    const r = { id: t, record: n(), changed: !1 };
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
      active: t.id === this.activeId
    }));
  }
  serialize() {
    return { projects: this.entries.map((t) => t.id), active: this.activeId };
  }
}
function Aw(e) {
  const t = { projects: [], active: null };
  if (!e || typeof e != "object" || Array.isArray(e)) return t;
  const n = e.projects;
  if (!Array.isArray(n)) return t;
  const o = [];
  for (const s of n)
    if (!(typeof s != "string" || s.length === 0 || o.includes(s)) && (o.push(s), o.length === Ia))
      break;
  const r = e.active;
  return {
    projects: o,
    active: typeof r == "string" && o.includes(r) ? r : o[0] ?? null
  };
}
const aa = "application/x-assemblash-tab";
function Iw({ host: e, bind: t }) {
  Fe();
  const [n, o] = p.useState([]), [r, s] = p.useState(null), a = p.useRef(null), i = p.useRef(null);
  if (p.useEffect(() => {
    t(o);
  }, [t]), p.useEffect(() => {
    const d = a.current;
    d && (a.current = null, i.current?.querySelector(`[data-tab-id="${CSS.escape(d)}"]`)?.focus());
  }, [n]), n.length === 0) return null;
  const c = (d) => {
    const m = n[(d + n.length) % n.length];
    m && i.current?.querySelector(`[data-tab-id="${CSS.escape(m.id)}"]`)?.focus();
  }, u = (d, m, g) => {
    const v = d.key === "ArrowLeft" ? -1 : d.key === "ArrowRight" ? 1 : 0;
    if ((v !== 0 || ["Home", "End", "Delete"].includes(d.key)) && d.stopPropagation(), v !== 0 && d.altKey && d.shiftKey) {
      d.preventDefault(), a.current = g.id, e.move(g.id, m + v);
      return;
    }
    v !== 0 ? (d.preventDefault(), c(m + v)) : d.key === "Home" || d.key === "End" ? (d.preventDefault(), c(d.key === "Home" ? 0 : n.length - 1)) : d.key === "Delete" && (d.preventDefault(), e.close(g.id));
  }, f = (d, m) => {
    d.button === 1 && (d.preventDefault(), e.close(m));
  }, h = (d, m) => {
    const g = d.currentTarget.getBoundingClientRect();
    return d.clientX > g.left + g.width / 2 ? m + 1 : m;
  };
  return /* @__PURE__ */ l.jsx(
    "div",
    {
      ref: i,
      className: "project-tabs",
      role: "tablist",
      "aria-label": b("tabs.label"),
      title: b("tabs.reorderHint"),
      onDragLeave: (d) => {
        d.currentTarget.contains(d.relatedTarget) || s(null);
      },
      children: n.map((d, m) => /* @__PURE__ */ l.jsxs(
        "div",
        {
          className: "project-tab",
          "data-active": d.active || void 0,
          "data-changed": d.changed || void 0,
          "data-drop": r === m ? "before" : r === m + 1 && m === n.length - 1 ? "after" : void 0,
          draggable: !0,
          onDragStart: (g) => {
            g.dataTransfer.setData(aa, d.id), g.dataTransfer.effectAllowed = "move";
          },
          onDragOver: (g) => {
            g.dataTransfer.types.includes(aa) && (g.preventDefault(), g.dataTransfer.dropEffect = "move", s(h(g, m)));
          },
          onDrop: (g) => {
            const v = g.dataTransfer.getData(aa);
            if (s(null), !v) return;
            g.preventDefault();
            const w = n.findIndex((E) => E.id === v);
            let x = h(g, m);
            w >= 0 && w < x && (x -= 1), e.move(v, x);
          },
          onDragEnd: () => s(null),
          children: [
            /* @__PURE__ */ l.jsxs(
              $n,
              {
                className: "project-tab-button",
                role: "tab",
                id: `project-tab-${d.id}`,
                "data-tab-id": d.id,
                "aria-selected": d.active,
                tabIndex: d.active ? 0 : -1,
                title: d.changed ? `${d.name} — ${b("tabs.changed")}` : d.name,
                onClick: () => e.activate(d.id),
                onAuxClick: (g) => f(g, d.id),
                onMouseDown: (g) => {
                  g.button === 1 && g.preventDefault();
                },
                onKeyDown: (g) => u(g, m, d),
                children: [
                  /* @__PURE__ */ l.jsx("span", { className: "project-tab-name", children: d.name }),
                  d.changed ? /* @__PURE__ */ l.jsx("span", { className: "project-tab-marker", "data-tab-marker": d.id, role: "img", "aria-label": b("tabs.changed") }) : null
                ]
              }
            ),
            /* @__PURE__ */ l.jsx(
              ei,
              {
                size: "sm",
                className: "project-tab-close",
                "data-tab-close": d.id,
                tabIndex: -1,
                "aria-label": b("tabs.close", { name: d.name }),
                title: b("tabs.close", { name: d.name }),
                onClick: () => e.close(d.id)
              }
            )
          ]
        },
        d.id
      ))
    }
  );
}
function Mw(e, t) {
  let n = [], o = null;
  const r = (s) => {
    o = s, s(n);
  };
  return Ue("project-tabs", t, /* @__PURE__ */ l.jsx(Iw, { host: e, bind: r })), {
    setTabs(s) {
      n = s, o?.(s);
    }
  };
}
const Lo = (e) => /* @__PURE__ */ l.jsx("i", { className: `ph ${e}`, "aria-hidden": "true" });
function ns(e) {
  return e.name ?? (e.type === "text" ? e.text : e.type) ?? e.type;
}
function Dw(e) {
  return e.type === "shape" ? { rect: "ph-square", ellipse: "ph-circle", line: "ph-line-segment", path: "ph-bezier-curve" }[Mf(e) ?? ""] ?? "ph-shapes" : { text: "ph-text-t", image: "ph-image", svg: "ph-pen-nib", group: "ph-stack" }[e.type] ?? "ph-square";
}
function Ow({ layer: e, finish: t }) {
  const n = p.useRef(null), o = p.useRef(!1);
  p.useEffect(() => {
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
      defaultValue: ns(e),
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
function $w({ layer: e, depth: t, parent: n, inheritedGuard: o, snapshot: r, commands: s, elementProps: a, renaming: i, startRename: c, finishRename: u, expanded: f, hasChildren: h, toggleExpanded: d }) {
  const [m, g] = p.useState(!1), [v, w] = p.useState(!1), x = p.useRef(null);
  p.useEffect(() => () => {
    x.current && clearTimeout(x.current.timer);
  }, []);
  const E = r.selectedIds.includes(e.id), C = !o && Zo(e), k = o || !!es(e), R = !o && !e.protected && !e.readOnly, P = (y, N) => {
    E || s.select(e.id, !1), s.contextMenu?.(e.id, y, N);
  }, S = () => {
    x.current && clearTimeout(x.current.timer);
  };
  return /* @__PURE__ */ l.jsx(
    Q,
    {
      ...a,
      className: `${a.className} layer${E ? " selected" : ""}${k ? " guarded" : ""}${e.visible === !1 ? " hidden-layer" : ""}${m ? " dragging" : ""}${v ? " drop-target" : ""}`,
      "data-id": e.id,
      "data-type": e.type,
      "data-parent": n ?? "",
      style: { ...a.style, "--layer-depth": t, paddingInlineStart: 8 + t * 16 },
      draggable: C,
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
        const D = Be($e(r.document)), O = n ? D.find((F) => F.layer.id === n)?.layer : null, z = O?.type === "group" ? O.children ?? [] : $e(r.document), _ = Math.max(0, z.findIndex((F) => F.id === e.id) + 1);
        s.reorder(N, e.id, e.type === "group" ? { at: "in", parent: e.id } : n ? { at: "in", parent: n, index: _ } : { at: "root", index: _ });
      },
      children: /* @__PURE__ */ l.jsxs(Ne, { gap: "xs", wrap: "nowrap", children: [
        h ? /* @__PURE__ */ l.jsx(
          Fo,
          {
            className: "layer-control",
            size: "sm",
            variant: "subtle",
            "data-layer-toggle": e.id,
            title: b(f ? "layers.collapseGroup" : "layers.expandGroup"),
            "aria-label": b(f ? "layers.collapseGroup" : "layers.expandGroup"),
            "aria-expanded": f,
            onClick: (y) => {
              y.stopPropagation(), d();
            },
            children: Lo(f ? "ph-caret-down" : "ph-caret-right")
          }
        ) : null,
        /* @__PURE__ */ l.jsx(
          Fo,
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
            children: Lo(e.visible === !1 ? "ph-eye-slash" : "ph-eye")
          }
        ),
        /* @__PURE__ */ l.jsx(Q, { className: "layer-icon", children: Lo(Dw(e)) }),
        /* @__PURE__ */ l.jsx(Q, { style: { flex: 1, minWidth: 0 }, children: i ? /* @__PURE__ */ l.jsx(Ow, { layer: e, finish: (y) => {
          u(), y !== null && y !== (e.name ?? "") && s.rename(e.id, y);
        } }) : /* @__PURE__ */ l.jsx(
          ee,
          {
            component: "span",
            className: "name",
            size: "sm",
            truncate: !0,
            title: es(e) ?? b("layers.renameHint"),
            onDoubleClick: (y) => {
              y.stopPropagation(), C && c();
            },
            children: ns(e)
          }
        ) }),
        /* @__PURE__ */ l.jsx(
          Fo,
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
            children: Lo(e.locked ? "ph-lock" : "ph-lock-open")
          }
        )
      ] })
    }
  );
}
function Lw({ snapshot: e, commands: t }) {
  Fe();
  const [n, o] = p.useState(null), [r, s] = p.useState({}), a = e.document ? $e(e.document) : [], i = p.useMemo(() => {
    const h = e.query.trim().toLowerCase(), d = (g) => ns(g).toLowerCase().includes(h) || g.type === "group" && (g.children ?? []).some(d), m = (g, v, w) => [...g].reverse().filter((x) => !h || d(x)).map((x) => ({
      value: x.id,
      label: ns(x),
      layer: x,
      parent: v,
      guarded: w,
      ...x.type === "group" ? { children: m(x.children ?? [], x.id, w || !Zo(x)) } : {}
    }));
    return m(e.document ? $e(e.document) : [], null, !1);
  }, [e.document, e.query]), c = p.useMemo(() => {
    const h = /* @__PURE__ */ new Map(), d = (m) => {
      for (const g of m)
        h.set(g.value, g), g.children && d(g.children);
    };
    return d(i), h;
  }, [i]), u = p.useMemo(() => Object.fromEntries([...c.keys()].map((h) => [h, r[h] ?? !0])), [c, r]), f = Nf({
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
  return i.length ? /* @__PURE__ */ l.jsx(
    Ls,
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
      onKeyDown: (h) => {
        const d = h.target;
        if (d.getAttribute("role") !== "treeitem" && !d.classList.contains("layer")) return;
        const m = c.get(d.dataset.value ?? "");
        if (m && (h.key === "F2" && (h.preventDefault(), h.stopPropagation(), !m.guarded && Zo(m.layer) && o(m.value)), (h.key === "Enter" || h.key === " ") && (h.preventDefault(), h.stopPropagation(), t.select(m.value, h.shiftKey || h.ctrlKey || h.metaKey)), h.key === "F10" && h.shiftKey)) {
          h.preventDefault(), h.stopPropagation(), e.selectedIds.includes(m.value) || t.select(m.value, !1);
          const g = (d.classList.contains("layer") ? d : d.querySelector(".layer")).getBoundingClientRect();
          t.contextMenu?.(m.value, g.left + 24, g.top + 24);
        }
      },
      renderNode: ({ node: h, level: d, elementProps: m, expanded: g, hasChildren: v }) => {
        const { layer: w, parent: x, guarded: E } = h;
        return /* @__PURE__ */ l.jsx(
          $w,
          {
            layer: w,
            depth: d - 1,
            parent: x,
            inheritedGuard: E,
            snapshot: e,
            commands: t,
            elementProps: m,
            renaming: n === w.id,
            startRename: () => o(w.id),
            finishRename: () => o(null),
            expanded: g,
            hasChildren: v,
            toggleExpanded: () => f.toggleExpanded(w.id)
          }
        );
      }
    }
  ) : /* @__PURE__ */ l.jsx(Q, { component: "ul", id: "layers", role: "tree", "aria-label": b("layers.tab"), m: 0, p: 0, style: { listStyle: "none" }, children: /* @__PURE__ */ l.jsx(Q, { component: "li", className: `layers-empty${a.length ? " compact" : ""}`, p: "md", children: /* @__PURE__ */ l.jsxs(ve, { gap: "xs", align: "center", children: [
    /* @__PURE__ */ l.jsx(Q, { children: Lo(a.length ? "ph-magnifying-glass" : "ph-stack-simple") }),
    /* @__PURE__ */ l.jsx(ee, { fw: 600, children: b(a.length ? "layers.noMatching" : "layers.none") }),
    /* @__PURE__ */ l.jsx(ee, { size: "sm", c: "dimmed", children: b(a.length ? "layers.trySearch" : "layers.emptyHint") })
  ] }) }) });
}
function zw({ snapshot: e }) {
  return Fe(), /* @__PURE__ */ l.jsx(Q, { component: "ol", id: "history", m: 0, p: "sm", children: [...e.history?.entries ?? []].reverse().map((t) => /* @__PURE__ */ l.jsx(
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
function _w({ snapshot: e, commands: t }) {
  Fe();
  const [n, o] = p.useState(e.dock ?? "properties");
  p.useEffect(() => {
    e.dock && o(e.dock);
  }, [e.dock]);
  const r = e.document ? Be($e(e.document)) : [], s = r.filter((c) => e.selectedIds.includes(c.layer.id)), a = s.length > 0 && s.every((c) => {
    if (!Zo(c.layer)) return !1;
    let u = c.parent;
    for (; u; ) {
      const f = r.find((h) => h.layer.id === u);
      if (!f || !Zo(f.layer)) return !1;
      u = f.parent;
    }
    return !0;
  }), i = (c) => {
    (c === "properties" || c === "layers" || c === "history") && (o(c), t.showDock(c));
  };
  return /* @__PURE__ */ l.jsxs(
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
        /* @__PURE__ */ l.jsxs(ht.List, { children: [
          /* @__PURE__ */ l.jsx(ht.Tab, { id: "properties-tab", value: "properties", children: b("properties.tab") }),
          /* @__PURE__ */ l.jsx(ht.Tab, { id: "layers-tab", value: "layers", children: b("layers.tab") }),
          /* @__PURE__ */ l.jsx(ht.Tab, { id: "history-tab", value: "history", children: b("history.tab") })
        ] }),
        /* @__PURE__ */ l.jsx(ht.Panel, { value: "properties", id: "properties-panel", className: "dock-view", children: /* @__PURE__ */ l.jsx("div", { id: "advanced-inspector" }) }),
        /* @__PURE__ */ l.jsx(ht.Panel, { value: "layers", id: "layers-view", className: "dock-view", children: /* @__PURE__ */ l.jsxs(ve, { className: "layers-content", gap: "sm", p: "sm", children: [
          /* @__PURE__ */ l.jsx(
            dt,
            {
              id: "layer-search",
              value: e.query,
              disabled: Nl(e.document),
              placeholder: b(Nl(e.document) ? "layers.noSearch" : "layers.searchPlaceholder"),
              "aria-label": b("layers.searchPlaceholder"),
              onChange: (c) => t.setQuery(c.currentTarget.value)
            }
          ),
          /* @__PURE__ */ l.jsx(Lw, { snapshot: e, commands: t }),
          /* @__PURE__ */ l.jsxs(Ne, { gap: "xs", children: [
            /* @__PURE__ */ l.jsx(ue, { id: "group-layers", variant: "default", size: "xs", disabled: !a || s.length < 2, onClick: t.groupSelection, children: b("layers.groupButton") }),
            /* @__PURE__ */ l.jsx(ue, { id: "delete-layer", variant: "light", color: "red", size: "xs", disabled: !a, onClick: t.deleteSelection, children: b("layers.deleteButton") })
          ] })
        ] }) }),
        /* @__PURE__ */ l.jsx(ht.Panel, { value: "history", id: "history-view", className: "dock-view", children: /* @__PURE__ */ l.jsx(zw, { snapshot: e }) })
      ]
    }
  );
}
function Nl(e) {
  return !e || $e(e).length === 0;
}
function Fw(e, t, n) {
  let o = (a) => {
  };
  function r() {
    const [a, i] = p.useState(t);
    return p.useEffect(() => (o = (c) => i({ ...c }), () => {
      o = () => {
      };
    }), []), /* @__PURE__ */ l.jsx(_w, { snapshot: a, commands: n });
  }
  const s = Ue("structure", e, /* @__PURE__ */ l.jsx(r, {}));
  return { setSnapshot: (a) => o(a), destroy: s };
}
function Bw(e) {
  return typeof e == "string" ? e : JSON.stringify(e, null, 2);
}
function os(e) {
  return Array.isArray(e) ? `[${e.map(os).join(",")}]` : e && typeof e == "object" ? `{${Object.keys(e).sort().map(
    (t) => `${JSON.stringify(t)}:${os(e[t])}`
  ).join(",")}}` : JSON.stringify(e);
}
function Tl(e, t) {
  if (typeof e == "string" && typeof t == "string") {
    const n = (o) => {
      const r = /^#([\da-f]{6})([\da-f]{2})?$/i.exec(o);
      return r ? `${r[1].toLowerCase()}${(r[2] ?? "ff").toLowerCase()}` : o;
    };
    return n(e) === n(t);
  }
  return os(e) === os(t);
}
function Ff({ id: e, label: t, value: n, className: o, compact: r = !1, disabled: s = !1, onCommit: a, clear: i }) {
  Fe();
  const c = typeof n == "string" ? n : "#000000", [u, f] = p.useState(typeof n == "string" ? "solid" : "json"), [h, d] = p.useState(c), [m, g] = p.useState(Bw(n)), [v, w] = p.useState(""), [x, E] = p.useState(!1), C = p.useRef(n);
  function k(y) {
    let N = y.trim();
    /^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(N) && (typeof C.current == "string" && /^#[\da-f]{6}$/i.test(C.current) && /^#([\da-f]{6})ff$/i.test(N) && (N = N.slice(0, 7)), w(""), !Tl(C.current, N) && (C.current = N, a(N)));
  }
  function R() {
    let y;
    try {
      y = JSON.parse(m);
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
    Tl(C.current, N) || (C.current = N, a(N));
  }
  const P = /* @__PURE__ */ l.jsxs(ve, { gap: "xs", className: "paint-input", "data-paint-editor": e, children: [
    /* @__PURE__ */ l.jsx(
      mr,
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
    u === "solid" ? /* @__PURE__ */ l.jsxs(Ne, { align: "end", wrap: "nowrap", gap: "xs", children: [
      /* @__PURE__ */ l.jsx(
        pr,
        {
          id: `${e}-solid`,
          classNames: o ? { input: o } : void 0,
          label: t,
          value: h,
          format: "hexa",
          fixOnBlur: !1,
          disabled: s,
          onChange: (y) => d(y),
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
        ho,
        {
          id: `${e}-json`,
          classNames: { input: o ? `${o} paint-json` : "paint-json" },
          label: t,
          value: m,
          onChange: (y) => g(y.currentTarget.value),
          minRows: 4,
          autosize: !0,
          disabled: s,
          error: v || void 0,
          "aria-label": t,
          "data-paint-json": e
        }
      ),
      /* @__PURE__ */ l.jsxs(Ne, { justify: "space-between", align: "center", children: [
        /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: b("paint.jsonHint") }),
        /* @__PURE__ */ l.jsxs(Ne, { gap: "xs", children: [
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
    He,
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
        /* @__PURE__ */ l.jsx(He.Target, { children: /* @__PURE__ */ l.jsx(
          Fo,
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
        /* @__PURE__ */ l.jsx(He.Dropdown, { className: "paint-popover", "data-paint-popover": e, children: P })
      ]
    }
  );
}
let Vw = 0;
function Hw(e, t) {
  return Ue(`paint-${++Vw}`, e, /* @__PURE__ */ l.jsx(Ff, { ...t }));
}
let Bf = 0;
function Ji(e) {
  return JSON.stringify([e.project, e.document, e.layer]);
}
function Vf(e) {
  const t = e.runs.every(Ma) && e.runs.map((n) => n.text).join("") === e.text;
  return { capture: structuredClone(e), rows: e.runs.map((n) => ({ key: ++Bf, raw: structuredClone(n), legacy: !t || !Ma(n) })), error: "", pending: !1 };
}
function Pl(e = "") {
  return { key: ++Bf, raw: { text: e } };
}
function Vr(e) {
  return !e.legacy && !!e.raw && typeof e.raw == "object" && !Array.isArray(e.raw) && typeof e.raw.text == "string";
}
function Ma(e) {
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
  return !(n != null && !Uw(n));
}
function Uw(e) {
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
function Ww(e, t, n) {
  const o = structuredClone(e);
  return n === void 0 ? delete o[t] : o[t] = structuredClone(n), o;
}
function oo(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function ia(e, t) {
  return Object.fromEntries(Object.entries(structuredClone(e)).filter(([n]) => !t.includes(n)));
}
function Al(e) {
  const t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    if (!oo(o) || typeof o.offset != "number" || !Number.isFinite(o.offset)) continue;
    const r = o.offset;
    t.has(r) && n.add(r), t.set(r, o);
  }
  for (const o of n) t.delete(o);
  return t;
}
function qw(e, t) {
  if (!oo(e) || !oo(t) || e.kind !== t.kind || !["linear", "radial"].includes(String(t.kind))) return structuredClone(t);
  const n = t.kind === "radial", o = {
    ...ia(e, n ? ["kind", "center", "radius", "stops"] : ["kind", "angle", "stops"]),
    ...structuredClone(t)
  };
  if (Array.isArray(e.stops) && Array.isArray(t.stops)) {
    const r = Al(e.stops), s = Al(t.stops);
    o.stops = t.stops.map((a) => {
      if (!oo(a) || typeof a.offset != "number" || !s.has(a.offset)) return structuredClone(a);
      const i = r.get(a.offset);
      return { ...i ? ia(i, ["offset", "color", "alpha"]) : {}, ...structuredClone(a) };
    });
  }
  if (n && oo(e.center)) {
    const r = ia(e.center, ["x", "y"]);
    oo(t.center) ? o.center = { ...r, ...structuredClone(t.center) } : !Object.hasOwn(t, "center") && Object.keys(r).length && (o.center = { ...r, x: 0.5, y: 0.5 });
  }
  return o;
}
function Da(e) {
  return JSON.stringify(e.rows.map((t) => t.raw)) !== JSON.stringify(e.capture.runs);
}
function Kw(e) {
  if (!Da(e)) return null;
  const t = e.rows.map((o) => structuredClone(o.raw)), n = { op: "update", id: e.capture.layer, runs: t };
  if (t.length && e.rows.every(Vr) && t.every(Ma)) {
    const o = t.map((r) => r.text).join("");
    o !== e.capture.text && Object.assign(n, { text: o });
  }
  return n;
}
function Xw(e) {
  Fe();
  const [, t] = p.useState(0), n = p.useRef(null), o = Ji(e.capture), r = e.drafts.get(o), s = e.disabled || !!r?.pending || !!r?.reconcile, a = () => t((g) => g + 1), i = (g) => requestAnimationFrame(() => {
    (n.current ?? [...document.querySelectorAll("[data-runs-editor]")].find((w) => w.dataset.runsIdentity === o))?.querySelector(g)?.focus();
  }), c = (g) => {
    e.drafts.set(o, g), a();
  }, u = () => {
    c(Vf(e.capture)), i("#runs-add");
  }, f = (g, v, w) => {
    if (!r || s) return;
    const x = r.rows[g];
    Vr(x) && (x.raw = Ww(x.raw, v, w), r.error = "", c(r));
  };
  async function h() {
    if (!r || s || !Da(r)) return;
    r.pending = !0, r.error = "", c(r);
    const g = await e.submit(r);
    r.pending = !1, g.status === "applied" ? e.drafts.delete(o) : (r.error = g.error, r.reconcile = g.status === "committed" || g.status === "unknown"), a(), i(g.status === "applied" ? "#runs-edit" : "#runs-error");
  }
  async function d() {
    if (!r || r.pending) return;
    r.pending = !0, c(r);
    const g = await e.reload();
    g ? (r.pending = !1, r.error = g, c(r), i("#runs-error")) : i("textarea[data-run-text], #runs-add");
  }
  function m(g, v, w, x, E) {
    const C = g[w], k = C != null, R = `run-${r.rows[v].key}-${w}`, P = `${b("runs.row", { number: v + 1 })}: ${b(x)}`;
    return /* @__PURE__ */ l.jsxs(ve, { gap: 4, style: { minWidth: 0 }, children: [
      /* @__PURE__ */ l.jsx(
        co,
        {
          "aria-label": `${P}: ${b("runs.mode")}`,
          label: b(x),
          size: "xs",
          value: k ? "value" : "inherit",
          data: [{ value: "inherit", label: b("runs.inherit") }, { value: "value", label: b("runs.override") }],
          disabled: s,
          onChange: (S) => f(v, w, S === "inherit" ? void 0 : E)
        }
      ),
      w === "fontFamily" ? /* @__PURE__ */ l.jsx(iw, { host: e.fonts, label: P, value: String(k ? C : E), disabled: s || !k, onCommit: (S) => f(v, w, S) }) : w === "fontStyle" ? /* @__PURE__ */ l.jsx(
        co,
        {
          id: R,
          "aria-label": P,
          size: "xs",
          value: String(k ? C : E),
          disabled: s || !k,
          data: [{ value: "normal", label: b("runs.normal") }, { value: "italic", label: b("runs.italic") }],
          onChange: (S) => f(v, w, S)
        }
      ) : /* @__PURE__ */ l.jsx(
        dt,
        {
          id: R,
          "aria-label": P,
          size: "xs",
          type: "number",
          value: String(k ? C : E),
          disabled: s || !k,
          onChange: (S) => {
            const y = S.currentTarget.value;
            f(v, w, y === "" ? "" : Number(y));
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
      /* @__PURE__ */ l.jsx(st, { "aria-label": b("runs.title"), style: { tableLayout: "fixed", width: "100%" }, children: /* @__PURE__ */ l.jsx(st.Tbody, { children: r.rows.map((g, v) => /* @__PURE__ */ l.jsx(st.Tr, { "data-run-row": g.key, children: /* @__PURE__ */ l.jsx(st.Td, { style: { padding: "8px 0" }, children: /* @__PURE__ */ l.jsxs(ve, { gap: "xs", children: [
        /* @__PURE__ */ l.jsxs(Ne, { justify: "space-between", gap: 4, children: [
          /* @__PURE__ */ l.jsx(ee, { size: "sm", fw: 600, children: b("runs.row", { number: v + 1 }) }),
          /* @__PURE__ */ l.jsxs(Ne, { gap: 4, wrap: "wrap", children: [
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
        Vr(g) ? /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
          /* @__PURE__ */ l.jsx(
            ho,
            {
              "data-run-text": !0,
              "aria-label": `${b("runs.text")}: ${v + 1}`,
              label: b("runs.text"),
              value: g.raw.text,
              autosize: !0,
              minRows: 2,
              disabled: s,
              onChange: (w) => f(v, "text", w.currentTarget.value)
            }
          ),
          /* @__PURE__ */ l.jsxs(Ja, { cols: 2, spacing: "xs", children: [
            m(g.raw, v, "fontFamily", "editor.fontFamily", e.layer.fontFamily),
            m(g.raw, v, "fontSize", "properties.fontSize", e.layer.fontSize),
            m(g.raw, v, "fontWeight", "properties.weight", e.layer.fontWeight ?? 400),
            m(g.raw, v, "fontStyle", "properties.style", e.layer.fontStyle ?? "normal"),
            m(g.raw, v, "letterSpacing", "properties.letterSpacing", e.layer.letterSpacing ?? 0)
          ] }),
          /* @__PURE__ */ l.jsx(
            co,
            {
              size: "xs",
              label: b("properties.colour"),
              "aria-label": `${b("runs.fillMode")}: ${v + 1}`,
              "data-run-fill-mode": !0,
              value: Object.hasOwn(g.raw, "color") ? g.raw.color === null ? "none" : "value" : "inherit",
              disabled: s,
              data: [{ value: "inherit", label: b("runs.inherit") }, { value: "none", label: b("runs.noFill") }, { value: "value", label: b("runs.override") }],
              onChange: (w) => f(v, "color", w === "inherit" ? void 0 : w === "none" ? null : e.layer.color ?? "#000000")
            }
          ),
          Object.hasOwn(g.raw, "color") && g.raw.color !== null && /* @__PURE__ */ l.jsx(
            Ff,
            {
              id: `run-${g.key}-paint`,
              label: `${b("properties.colour")}: ${v + 1}`,
              value: g.raw.color,
              disabled: s,
              onCommit: (w) => f(v, "color", qw(r.rows[v].raw.color, w))
            },
            `${g.key}-${typeof g.raw.color}`
          )
        ] }) : /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
          /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "orange", children: b("runs.unsupported") }),
          /* @__PURE__ */ l.jsx(ho, { "aria-label": `${b("runs.raw")}: ${v + 1}`, value: JSON.stringify(g.raw, null, 2), readOnly: !0, autosize: !0, maxRows: 6 })
        ] })
      ] }) }) }, g.key)) }) }),
      /* @__PURE__ */ l.jsxs(Ne, { gap: "xs", children: [
        /* @__PURE__ */ l.jsx(ue, { id: "runs-add", size: "xs", variant: "light", disabled: s, onClick: () => {
          const g = Pl(r.rows.length === 0 && r.capture.runs.length === 0 ? r.capture.text : "");
          r.rows.push(g), c(r), i(`[data-run-row="${g.key}"] textarea`);
        }, children: b("runs.add") }),
        /* @__PURE__ */ l.jsx(ue, { id: "runs-clear", size: "xs", variant: "light", disabled: s || !r.rows.length, onClick: () => {
          r.rows = [], c(r), i("#runs-add");
        }, children: b("runs.clear") }),
        r.rows.some((g) => !Vr(g)) && /* @__PURE__ */ l.jsx(ue, { id: "runs-replace", size: "xs", variant: "light", disabled: s, onClick: () => {
          const g = Pl(r.capture.text);
          r.rows = [g], c(r), i(`[data-run-row="${g.key}"] textarea`);
        }, children: b("runs.replace") })
      ] }),
      r.error && /* @__PURE__ */ l.jsx(ee, { id: "runs-error", role: "alert", tabIndex: -1, size: "xs", c: "red", children: r.error }),
      (r.error || r.capture.version !== e.capture.version) && /* @__PURE__ */ l.jsx(ue, { id: "runs-reload", size: "xs", variant: "light", disabled: r.pending, onClick: () => {
        d();
      }, children: b("runs.reload") }),
      /* @__PURE__ */ l.jsxs(Ne, { gap: "xs", children: [
        /* @__PURE__ */ l.jsx(ue, { id: "runs-apply", size: "xs", disabled: s || !Da(r), loading: r.pending, onClick: () => {
          h();
        }, children: b("runs.apply") }),
        /* @__PURE__ */ l.jsx(ue, { id: "runs-cancel", size: "xs", variant: "default", disabled: r.pending, onClick: () => {
          e.drafts.delete(o), a(), i("#runs-edit");
        }, children: b("runs.cancel") })
      ] })
    ] }) : /* @__PURE__ */ l.jsx(ue, { id: "runs-edit", size: "xs", variant: "light", disabled: e.disabled, onClick: u, children: b("runs.edit") })
  ] }) });
}
let Yw = 0;
function Gw(e, t) {
  return Ue(`text-runs-${++Yw}`, e, /* @__PURE__ */ l.jsx(Xw, { ...t }));
}
function Jw({ assets: e, value: t, disabled: n = !1, onChange: o, onUpload: r }) {
  Fe();
  const [s, a] = p.useState(null), [i, c] = p.useState(t);
  p.useEffect(() => c(t), [t]);
  const u = e.filter((h) => h.mediaType.startsWith("image/")), f = [
    { value: "", label: b("canvas.backgroundImageNone") },
    ...u.map((h) => ({
      value: h.id,
      label: `${h.path.split("/").at(-1) ?? h.path} (${h.mediaType})`
    }))
  ];
  return /* @__PURE__ */ l.jsxs(ve, { gap: "xs", className: "canvas-image-input", children: [
    /* @__PURE__ */ l.jsx(
      mo,
      {
        id: "canvas-background-image",
        label: b("canvas.backgroundImage"),
        value: i?.asset ?? "",
        data: f,
        disabled: n,
        onChange: (h) => {
          const d = h.currentTarget.value, m = d ? { asset: d, fit: i?.fit ?? "fill" } : null;
          c(m), o(m);
        }
      }
    ),
    /* @__PURE__ */ l.jsx(
      mo,
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
        onChange: (h) => {
          if (!i) return;
          const d = { ...i, fit: h.currentTarget.value };
          c(d), o(d);
        }
      }
    ),
    /* @__PURE__ */ l.jsxs(Ne, { align: "end", gap: "xs", children: [
      /* @__PURE__ */ l.jsx(
        Li,
        {
          id: "canvas-background-upload",
          label: b("canvas.backgroundImageUpload"),
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
let Zw = 0;
function Qw(e, t) {
  return Ue(
    `canvas-image-${++Zw}`,
    e,
    /* @__PURE__ */ l.jsx(Jw, { ...t })
  );
}
const ex = [
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
function tx({ value: e, disabled: t, onChange: n }) {
  return Fe(), /* @__PURE__ */ l.jsx(
    kn.Group,
    {
      id: "canvas-anchor-group",
      name: "canvas-anchor",
      value: e,
      onChange: (o) => n(o),
      children: /* @__PURE__ */ l.jsx(Ja, { cols: 3, className: "canvas-size-anchor-grid", children: ex.map((o) => /* @__PURE__ */ l.jsx(
        kn,
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
function nx(e, t, n, o) {
  let r = (i, c) => {
  };
  function s() {
    const [i, c] = p.useState(t), [u, f] = p.useState(n);
    return p.useEffect(() => (r = (h, d) => {
      c(h), f(d);
    }, () => {
      r = () => {
      };
    }), []), /* @__PURE__ */ l.jsx(tx, { value: i, disabled: u, onChange: o });
  }
  const a = Ue("canvas-anchor-picker", e, /* @__PURE__ */ l.jsx(s, {}));
  return { setState: (i, c) => r(i, c), destroy: a };
}
const lo = (e) => typeof e == "function" ? e() : e;
function ox(e) {
  Fe();
  const t = lo(e.label), n = e.title === void 0 ? void 0 : lo(e.title), o = p.useRef(e.value), r = (s) => {
    s !== o.current && (o.current = s, e.onCommit(s));
  };
  return e.options ? /* @__PURE__ */ l.jsx(
    mo,
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
      data: e.options.map((s) => ({ value: s.value, label: lo(s.label) })),
      classNames: e.className ? { input: e.className } : void 0,
      onChange: (s) => r(s.currentTarget.value)
    }
  ) : e.type === "textarea" ? /* @__PURE__ */ l.jsx(
    ho,
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
function rx(e) {
  Fe();
  const t = lo(e.label), n = e.title === void 0 ? void 0 : lo(e.title);
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
let Zi = 0;
function sx(e) {
  Fe();
  const [t, n] = p.useState(e.checked);
  return p.useEffect(() => {
    n(e.checked);
  }, [e.checked]), /* @__PURE__ */ l.jsx(
    on,
    {
      id: e.id,
      label: lo(e.label),
      checked: t,
      disabled: e.disabled,
      classNames: e.className ? { input: e.className } : void 0,
      onChange: (o) => {
        n(o.currentTarget.checked), e.onChange(o.currentTarget.checked);
      }
    }
  );
}
function Bo(e, t) {
  return Ue(`inspector-checkbox-${++Zi}`, e, /* @__PURE__ */ l.jsx(sx, { ...t }));
}
function ct(e, t) {
  return Ue(`inspector-field-${++Zi}`, e, /* @__PURE__ */ l.jsx(ox, { ...t }));
}
function ot(e, t) {
  return Ue(`inspector-button-${++Zi}`, e, /* @__PURE__ */ l.jsx(rx, { ...t }));
}
function ax({ state: e, onClose: t }) {
  return Fe(), p.useEffect(() => {
    e.open && document.querySelector("#context-menu button[role=menuitem]:not(:disabled)")?.focus();
  }, [e.open, e.items]), /* @__PURE__ */ l.jsx(
    fo,
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
      children: /* @__PURE__ */ l.jsx(ve, { gap: 4, children: e.items.map((n, o) => n.kind === "separator" ? /* @__PURE__ */ l.jsx(ks, { role: "separator" }, `separator-${o}`) : /* @__PURE__ */ l.jsx(
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
function ix(e) {
  const t = { open: !1, items: [], x: 8, y: 8 };
  let n = t, o = (a) => {
  };
  function r() {
    const [a, i] = p.useState(t);
    return p.useEffect(() => (o = (c) => {
      n = c, i(c);
    }, () => {
      o = () => {
      };
    }), []), /* @__PURE__ */ l.jsx(ax, { state: a, onClose: () => o({ ...n, open: !1 }) });
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
const cx = {
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
}, lx = {
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
function ux({ title: e, initiallyOpen: t, bodyElement: n }) {
  Fe();
  const [o, r] = p.useState(t ? e : null), s = cx[e], a = s ? b(s) : e;
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
        /* @__PURE__ */ l.jsx(Pe.Control, { children: /* @__PURE__ */ l.jsxs(Ne, { gap: "xs", wrap: "nowrap", children: [
          /* @__PURE__ */ l.jsx("span", { className: "dock-section-icon", children: /* @__PURE__ */ l.jsx("i", { className: `ph ${lx[e] ?? "ph-sliders-horizontal"}`, "aria-hidden": "true" }) }),
          /* @__PURE__ */ l.jsx(ee, { component: "span", className: "dock-section-heading", children: a })
        ] }) }),
        /* @__PURE__ */ l.jsx(Pe.Panel, { children: /* @__PURE__ */ l.jsx("div", { ref: (i) => {
          i && n.parentElement !== i && i.append(n);
        } }) })
      ] })
    }
  );
}
let dx = 0;
function fx(e, t, n) {
  const o = document.createElement("div");
  o.className = "dock-section-host", e.append(o);
  const r = document.createElement("div");
  r.className = "dock-section-body";
  const s = `inspector-section-${++dx}`, a = Ue(
    s,
    o,
    /* @__PURE__ */ l.jsx(ux, { title: t, initiallyOpen: n, bodyElement: r })
  );
  return {
    body: r,
    destroy() {
      a(), o.remove();
    }
  };
}
function Qi(e) {
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
let j = Qi(null);
function Hf(e) {
  return {
    state: Qi(e),
    scroll: { left: 0, top: 0 },
    layerQuery: "",
    historySnapshot: null,
    activeDock: "layers",
    templateDraft: null
  };
}
const ke = new Pw(), Tn = new mw(), Oa = /* @__PURE__ */ new Map(), tn = [];
Tn.onSettled = (e) => {
  tn.push({
    label: e.label,
    ok: e.ok,
    superseded: e.superseded,
    at: performance.now() - e.waitedMs,
    waitedMs: e.waitedMs,
    ranMs: e.ranMs,
    previewSettledAt: null
  }), tn.length > 50 && tn.shift(), Wf();
};
function $a(e, t) {
  Lp(e, t);
}
let Uf = !1;
Tn.onActiveChange = (e) => {
  Uf = e, e ? (Dp("info"), $a("ph-circle-notch", "save.working")) : Op() !== "error" && $a("ph-check-circle", "save.allChangesSaved");
};
function px() {
  for (let e = tn.length - 1; e >= 0; e--) {
    const t = tn[e];
    if (t && t.previewSettledAt === null) {
      t.previewSettledAt = performance.now();
      break;
    }
  }
  Wf();
}
const hx = new URLSearchParams(window.location.search).has("perf");
window.__assemblashPerf = tn;
function Wf() {
  if (!hx) return;
  let e = document.getElementById("assemblash-perf");
  e || (e = document.createElement("div"), e.id = "assemblash-perf", e.setAttribute(
    "style",
    "position:fixed;bottom:8px;left:8px;z-index:9999;font:11px/1.5 ui-monospace,monospace;background:rgba(0,0,0,.82);color:#eee;padding:6px 9px;border-radius:6px;pointer-events:none;white-space:pre"
  ), document.body.append(e));
  const t = tn[tn.length - 1], n = t && t.previewSettledAt !== null ? `${Math.round(t.previewSettledAt - t.at)}ms` : "…";
  e.textContent = t ? `${t.label}: waited ${t.waitedMs}ms, ran ${t.ranMs ?? "–"}ms, settled ${n}
queue ${Tn.size}, records ${tn.length}` : "no interactions yet";
}
const ec = "#3366cc";
function mx(e) {
  return typeof e == "string" ? e : null;
}
const qf = "#111111", Kf = 2, gx = ["rect", "ellipse"];
function vx(e) {
  const t = e.clip;
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = t.shape;
    if (typeof n == "string") return n;
  }
  return null;
}
function Il(e) {
  const t = e.clip;
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = t.cornerRadius;
    if (typeof n == "number") return n;
  }
  return 0;
}
function yx(e) {
  if (e.type !== "image") return null;
  const t = e.crop;
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = t, o = n.x, r = n.y, s = n.width, a = n.height;
    if (typeof o == "number" && typeof r == "number" && typeof s == "number" && typeof a == "number")
      return { x: o, y: r, width: s, height: a };
  }
  return null;
}
function bx(e) {
  return e.type !== "image" && e.type !== "svg" ? null : (j.document?.assets ?? []).find((t) => t.id === e.asset) ?? null;
}
let wt = null, tc = 0, vn = null, On = [], zt = null, Qo = null;
function J(e) {
  const t = document.getElementById(e);
  if (!t) throw new Error(`missing element #${e}`);
  return t;
}
function Ml(e) {
  const t = document.createElement("span");
  return t.dataset.i18n = e, t.textContent = b(e), t;
}
const Ft = Cw();
let er = "", br = null, wr = "layers";
const wx = Fw(J("structure-panel"), {
  document: null,
  selectedIds: [],
  query: er,
  history: br,
  dock: wr
}, {
  setQuery(e) {
    er = e, Nt();
  },
  select(e, t) {
    j.selection = t ? j.selection.includes(e) ? j.selection.filter((n) => n !== e) : [...j.selection, e] : [e], Nt(), ft(), lt(), window.matchMedia("(max-width: 720px)").matches && rc()?.type !== "text" && (T.structure.classList.remove("mobile-open"), T.dockToggle.setAttribute("aria-expanded", "false"));
  },
  toggleVisibility(e) {
    const t = j.document && Be($e(j.document)).find((n) => n.layer.id === e)?.layer;
    t && oe(t.visible === !1 ? "show layer" : "hide layer", { op: "setVisible", id: e, visible: t.visible === !1 });
  },
  toggleLocked(e) {
    const t = j.document && Be($e(j.document)).find((n) => n.layer.id === e)?.layer;
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
    j.selection.length < 2 || oe("group", { op: "group", ids: [...j.selection] });
  },
  deleteSelection() {
    rr();
  },
  undo() {
    T.undo.click();
  },
  redo() {
    T.redo.click();
  },
  showDock(e) {
    Io(e);
  },
  contextMenu(e, t, n) {
    ft(), lt(), sr(t, n);
  }
}), xn = ix(J("context-menu-root")), T = {
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
$p(
  T.statusChromeRoot,
  (e) => {
    Jf(e);
  },
  (e) => {
    window.localStorage.setItem("assemblash-update-banner-v1", e), tu(null);
  }
);
const nc = Ew({
  openProject: (e) => fp(e),
  search: () => {
    Oe("search", async () => {
      await kr();
    });
  }
}, document.querySelector(".project-combobox")), xx = ww();
function Fs(e, t, n, o) {
  xx.request(e, t, n, o);
}
function Se(e, t = "info") {
  _p(e, t);
}
const Mn = { families: [], faces: [] }, fn = /* @__PURE__ */ new Map();
let Dl = "";
async function Oe(e, t) {
  await Tn.enqueue({ label: e, coalesceKey: null, run: t, onError: (n) => rn(e, n) });
}
const Sx = {
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
function oc(e) {
  const t = Sx[e.code];
  return t ? b(t) : `${e.message} (${e.code})`;
}
function rn(e, t) {
  $a("ph-warning-circle", "save.needsAttention"), t instanceof Ye ? Se(oc(t), "error") : Se(b("errors.unexpected", { message: String(t) }), "error");
}
J("add-template-section").append(J("templates-mantine-mount"));
const $t = Tw({
  project: () => j.project,
  document: () => j.document,
  say: Se,
  guard: Oe,
  refresh: () => Ge()
}), yo = hw({
  project: () => j.project,
  document: () => j.document,
  say: Se,
  guard: Oe,
  refresh: () => Ge(),
  fontsChanged: (e) => {
    Mn.families = [...e.families], Mn.faces = [...e.faces], lt();
  }
}, J("fonts-mantine-mount")), Cx = Jb({
  project: () => j.project,
  document: () => j.document,
  say: Se,
  guard: Oe
}), jx = yw({
  create: async (e, t, n, o) => {
    let r = !1;
    return await Oe("create", async () => {
      await cb(e, t, n, o, e), await kr(e), Se(b("projects.created", { id: e })), r = !0;
    }), r;
  }
}), Xf = Wb({ say: Se });
T.agents.addEventListener("click", () => {
  Ft.isOpen() && Ft.close();
}, { capture: !0 });
const Yf = "assemblash-follow-v1";
function La() {
  return window.localStorage.getItem(Yf) !== "off";
}
function kx(e = "settings-agents") {
  T.settingFollow.checked = La();
  const t = ti(), n = t === "pseudo" ? "en" : t;
  T.settingLanguage.value = n, Ft.open(e, { follow: La(), language: n });
}
T.settings.addEventListener("click", () => kx());
T.settingLanguage.value = ti();
T.settingLanguage.addEventListener("change", () => {
  Up(T.settingLanguage.value);
});
Mp(() => {
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
  e && (T.canvasImage.alt = b("canvas.previewAlt", { name: e })), j.document && (T.version.textContent = Ee(Le(j.document)), Qa(
    `${Ee(Math.round(j.document.canvas.width))} × ${Ee(Math.round(j.document.canvas.height))}`
  ), To());
});
T.settingFollow.addEventListener("change", () => {
  window.localStorage.setItem(Yf, T.settingFollow.checked ? "on" : "off");
});
T.settingsFontsOpen.addEventListener("click", () => {
  Ft.close(), Oe("fonts", () => yc(!0));
});
const Ex = "assemblash-update-banner-v1";
async function Gf() {
  let e;
  try {
    e = await jb();
  } catch {
    return;
  }
  T.settingUpdateCheck.checked = e.consent === "notify", eu(e.consent === null);
  const t = window.localStorage.getItem(Ex), n = e.newer && !!e.latest && t !== e.latest;
  tu(n && e.latest ? {
    version: e.latest,
    text: b("updates.versionAvailable", { latest: e.latest, current: e.current }),
    notesUrl: e.notesUrl ?? null
  } : null);
}
async function Jf(e) {
  try {
    const t = await kb(e);
    eu(t.consent === null), T.settingUpdateCheck.checked = t.consent === "notify", Se(t.consent === "notify" ? b("updates.checkOn") : b("updates.checkOff"));
  } catch (t) {
    rn(b("updates.saveChoiceFailed"), t), Gf();
  }
}
T.settingUpdateCheck.addEventListener("change", () => {
  Jf(T.settingUpdateCheck.checked ? "notify" : "off");
});
T.settingsForm.addEventListener("submit", (e) => {
  e.submitter?.value === "cancel" && Ft.close();
});
function rc() {
  if (!j.document || j.selection.length !== 1) return null;
  const e = j.selection[0];
  return Be($e(j.document)).find(({ layer: t }) => t.id === e)?.layer ?? null;
}
function Lt() {
  if (!j.document) return [];
  const e = new Set(j.selection);
  return Be($e(j.document)).map(({ layer: t }) => t).filter((t) => e.has(t.id));
}
function bo(e, t = !1) {
  const n = es(e);
  if (n && (!t || e.protected || e.readOnly)) return n;
  if (!j.document) return null;
  const o = Be($e(j.document));
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
function rt(e) {
  return bo(e) === null;
}
function za() {
  if (!j.document || j.selection.length === 0) return !1;
  const e = Be($e(j.document)), t = new Set(j.selection);
  return j.selection.every((n) => {
    const o = e.find((s) => s.layer.id === n);
    if (!o || !rt(o.layer) || !cc(e, o.parent) || o.layer.transform.width <= 0 || o.layer.transform.height <= 0) return !1;
    let r = o.parent;
    for (; r; ) {
      if (t.has(r)) return !1;
      r = e.find((s) => s.layer.id === r)?.parent ?? null;
    }
    return !0;
  });
}
function Rx(e, t) {
  let n = 0, o = { x: 0, y: 0 };
  const r = () => {
    window.clearTimeout(n), n = 0;
  };
  e.addEventListener("pointerdown", (s) => {
    s.pointerType !== "touch" && s.pointerType !== "pen" || (o = { x: s.clientX, y: s.clientY }, n = window.setTimeout(() => {
      sr(o.x, o.y), navigator.vibrate?.(20);
    }, 550));
  }), e.addEventListener("pointermove", (s) => {
    Math.hypot(s.clientX - o.x, s.clientY - o.y) > 8 && r();
  }), e.addEventListener("pointerup", r), e.addEventListener("pointercancel", r);
}
let Ol = null, $l;
function Nx() {
  !j.project || Ol === j.project || (Ol = j.project, T.canvasHints.hidden = !1, window.clearTimeout($l), $l = window.setTimeout(() => {
    T.canvasHints.hidden = !0;
  }, 5e3));
}
let _a = 0;
async function Ge() {
  if (Qe(), !j.project) return;
  const e = ++_a, t = await yr(j.project);
  e !== _a || !j.project || Vn(t);
}
function Vn(e) {
  const t = j.drag?.mode === "resize" ? j.drag : vn;
  t && (e.id !== j.document?.id || Le(e) !== t.version) && Qe(), j.document = e, j.selection = j.selection.filter(
    (n) => Be($e(e)).some(({ layer: o }) => o.id === n)
  ), T.version.textContent = Ee(Le(e)), T.canvasEmpty.hidden = !0, T.canvas.hidden = !1, T.canvasControlsRoot.hidden = !1, Nx(), Qa(
    `${Ee(Math.round(e.canvas.width))} × ${Ee(Math.round(e.canvas.height))}`
  ), j.slots = e.slots ?? [], zt !== null && Le(e) !== zt && Et(), ac(), Nt(), ft(), lt(), Tx().catch((n) => rn("presets", n)), zx().catch((n) => rn("history", n));
}
let Fa = 0;
async function Tx() {
  if (!j.project) return;
  const e = ++Fa, t = await Ab(j.project);
  e === Fa && (j.presets = t);
}
let Hr = null, Do = null, sc = null;
function ac() {
  if (!j.project || !j.document || (sc = tr(), Do = Le(j.document), Hr)) return;
  const e = j.project;
  Hr = (async () => {
    try {
      for (; Do !== null; ) {
        const t = Do;
        Do = null;
        const n = await vo(Qr(e, t, tr())), o = j.document;
        if (j.project !== e || !o || Le(o) !== t) {
          URL.revokeObjectURL(n);
          continue;
        }
        const r = T.canvasImage.src;
        T.canvasImage.src = n, r.startsWith("blob:") && URL.revokeObjectURL(r), !j.drag && (zt === null || t >= zt) && Et(), T.canvasImage.dataset.previewName = o.name ?? e, T.canvasImage.alt = b("canvas.previewAlt", { name: o.name ?? e }), T.canvas.style.aspectRatio = `${o.canvas.width} / ${o.canvas.height}`, To(), px();
      }
    } catch (t) {
      rn("preview", t);
    } finally {
      Hr = null, Do !== null && ac();
    }
  })();
}
function ic() {
  !j.document || tr() === sc || ac();
}
function Px() {
  const e = window.getComputedStyle(T.stage), t = (n) => {
    const o = Number.parseFloat(n);
    return Number.isFinite(o) ? Math.max(0, o) : 0;
  };
  return {
    horizontal: t(e.paddingLeft) + t(e.paddingRight),
    vertical: t(e.paddingTop) + t(e.paddingBottom)
  };
}
function Zf() {
  if (!j.document) return 1;
  const e = Px(), t = Math.max(1, T.stageViewport.clientWidth - e.horizontal), n = Math.max(1, T.stageViewport.clientHeight - e.vertical);
  return Math.min(
    t / j.document.canvas.width,
    n / j.document.canvas.height,
    1
  );
}
function Bs() {
  return j.zoom ?? Zf();
}
function tr() {
  if (!j.document) return 1;
  const e = Math.max(1, window.devicePixelRatio || 1);
  return Math.min(1, Math.max(0.1, Bs() * e));
}
function Nt() {
  wx.setSnapshot({
    document: j.document,
    selectedIds: j.selection,
    query: er,
    history: br,
    dock: wr
  });
}
function nr(e, t) {
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
function cc(e, t) {
  let n = t;
  for (; n; ) {
    const o = e.find((r) => r.layer.id === n);
    if (!o || o.layer.transform.flipHorizontal || o.layer.transform.flipVertical) return null;
    n = o.parent;
  }
  return nr(e, t);
}
function ft() {
  if (T.overlay.replaceChildren(), !j.document) return;
  const { width: e, height: t } = j.document.canvas, n = Be($e(j.document)), o = n.flatMap(({ layer: c, parent: u }) => {
    const f = cc(n, u);
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
      f.shiftKey || f.ctrlKey || f.metaKey ? j.selection = j.selection.includes(c.layer.id) ? j.selection.filter((h) => h !== c.layer.id) : [...j.selection, c.layer.id] : j.selection.includes(c.layer.id) || (j.selection = [c.layer.id]), Nt(), lt(), ft();
    }), u.addEventListener("dblclick", (f) => {
      f.stopPropagation(), c.layer.type === "text" && wo(c.layer);
    }), u.addEventListener("contextmenu", (f) => {
      f.preventDefault(), j.selection.includes(c.layer.id) || (j.selection = [c.layer.id]), Nt(), lt(), ft(), sr(f.clientX, f.clientY);
    }), Rx(u), T.overlay.append(u);
  }
  const r = o.filter(({ layer: c }) => j.selection.includes(c.id));
  if (r.length === 0) return;
  rp(r.map(({ layer: c }) => c.id));
  const s = r.length === 1 ? {
    x: r[0].x,
    y: r[0].y,
    width: r[0].width,
    height: r[0].height
  } : Gi(r.map((c) => ({
    x: c.x,
    y: c.y,
    width: c.width,
    height: c.height,
    rotation: c.layer.transform.rotation ?? 0
  }))), a = document.createElement("div");
  if (a.className = "handle-box", a.style.left = `${s.x / e * 100}%`, a.style.top = `${s.y / t * 100}%`, a.style.width = `${s.width / e * 100}%`, a.style.height = `${s.height / t * 100}%`, a.style.transformOrigin = "center", r.length === 1 && (a.style.transform = `rotate(${r[0]?.layer.transform.rotation ?? 0}deg)`), a.dataset.ids = j.selection.join(","), a.addEventListener("contextmenu", (c) => {
    c.preventDefault(), c.stopPropagation(), sr(c.clientX, c.clientY);
  }), r.every(({ layer: c }) => rt(c))) {
    a.addEventListener("pointerdown", (u) => la(u, r, s, "move")), a.addEventListener("dblclick", (u) => {
      u.stopPropagation();
      const f = r.length === 1 && r[0]?.layer.type === "text" ? r[0].layer : null;
      f && wo(f);
    }), za() || (a.title = b("canvas.resizeUnavailable"));
    for (const u of za() ? ["nw", "n", "ne", "e", "se", "s", "sw", "w"] : []) {
      const f = document.createElement("button");
      f.type = "button", f.className = `resize-handle handle-${u}`, f.dataset.handle = u, f.dataset.resizeHandle = u, f.setAttribute("aria-label", b("canvas.resizeHandle", { handle: u })), f.title = b("canvas.resizeHelp"), f.setAttribute("aria-description", f.title), f.dataset.i18nAttr = "title:canvas.resizeHelp;aria-description:canvas.resizeHelp", f.addEventListener("pointerdown", (h) => {
        h.stopPropagation(), la(h, r, s, "resize", u);
      }), a.append(f);
    }
    const c = document.createElement("button");
    c.type = "button", c.className = "rotation-handle", c.setAttribute("aria-label", b("canvas.rotateSelection")), c.dataset.i18nAttr = "aria-label:canvas.rotateSelection", c.innerHTML = '<i class="ph ph-arrow-clockwise" aria-hidden="true"></i>', c.addEventListener("pointerdown", (u) => {
      u.stopPropagation(), la(u, r, s, "rotate");
    }), a.append(c);
  } else
    a.classList.add("guarded"), a.title = r.map(({ layer: c }) => bo(c)).filter(Boolean).join("; ");
  T.overlay.append(a);
}
function Ax(e) {
  if (!j.document) return;
  const t = j.document.canvas, n = document.createElement("form");
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
  ye.push(ct(o, {
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
  })), ye.push(ct(r, {
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
  const c = n.querySelector("#canvas-transparent-mount"), u = n.querySelector("#canvas-size-anchor-grid"), f = n.querySelector(".canvas-anchor-fieldset"), h = n.querySelector("#canvas-apply-mount");
  let d = t.background ?? "#ffffff", m = t.backgroundImage ?? null, g = t.background == null, v = "top-left";
  Ur(
    n.querySelector("#canvas-background-paint"),
    "canvas-background",
    b("common.background"),
    d,
    !1,
    (P) => {
      d = P, g = !1, E(), R();
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
  let x = Bo(c, w());
  ye.push(() => x());
  function E() {
    Ya(() => {
      x(), x = Bo(c, w());
    });
  }
  const C = nx(u, v, !0, (P) => {
    v = P, R();
  });
  ye.push(C.destroy), ye.push(Qw(n.querySelector("#canvas-background-image-mount"), {
    assets: j.document.assets ?? [],
    value: m,
    onChange(P) {
      m = P, oe(P ? "set canvas background image" : "clear canvas background image", P ? { op: "updateCanvas", backgroundImage: P } : { op: "updateCanvas", clearBackgroundImage: !0 });
    },
    onUpload(P) {
      const S = j.project;
      S && Oe("upload canvas background image", async () => {
        const y = await Yi(S, P), N = {
          op: "updateCanvas",
          backgroundImage: { asset: y.asset.id, fit: m?.fit ?? "fill" }
        }, D = await Bn(S, N, y.version);
        Se(b("status.editDone", { version: D.version })), D.document ? Vn(D.document) : await Ge();
      });
    }
  })), ye.push(ot(h, {
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
      f.disabled = !k(), C.setState(v, !k()), i.disabled = !k() && Ll(g ? null : d, t.background ?? null);
    }
  }
  n.addEventListener("input", R), n.addEventListener("change", R), n.addEventListener("submit", (P) => {
    if (P.preventDefault(), R(), !i || i.disabled || !n.reportValidity() || !s || !a) return;
    const S = g ? null : d, y = {
      op: "updateCanvas",
      ...k() ? { width: Number(s.value), height: Number(a.value), anchor: v } : {},
      ...Ll(S, t.background ?? null) ? {} : { background: S }
    };
    i.disabled = !0, oe("update canvas", y);
  }), R(), e.append(n);
}
function or(e, t) {
  const n = fx(
    e,
    t,
    !["Clip and mirror", "Appearance", "Effects", "Presets", "Slots"].includes(t)
  );
  return ep.push(n.destroy), n.body;
}
const Qf = [], ye = [], ep = [];
let yn = 0;
function Ur(e, t, n, o, r, s, a, i, c = !1) {
  ye.push(Hw(e, { id: t, label: n, value: o, disabled: r, onCommit: s, className: a, clear: i, compact: c }));
}
function Ll(e, t) {
  return JSON.stringify(e) === JSON.stringify(t);
}
function zl(e, t) {
  const n = dw({ store: () => Mn }, (o) => {
    oe("change font", { op: "update", id: e.id, fontFamily: o });
  });
  return Qf.push(n), n.setFamily(e.fontFamily), n.setDisabled(t), n;
}
let _l = "";
function Ix(e) {
  const t = e.map((n) => n.id).join(",");
  t !== _l && e.length === 1 && e[0]?.type === "text" && (Io("properties"), window.matchMedia("(max-width: 720px)").matches && (T.structure.classList.add("mobile-open"), T.dockToggle.setAttribute("aria-expanded", "true"))), _l = t;
}
function lt() {
  Ya(Mx);
}
function Mx() {
  for (const S of Qf.splice(0)) S.destroy();
  for (const S of ye.splice(0)) S();
  for (const S of ep.splice(0)) S();
  Aa(T.inspector), Aa(T.advancedInspector), T.inspector.replaceChildren(), T.advancedInspector.replaceChildren();
  let e = T.advancedInspector;
  const t = (S) => (e = or(T.advancedInspector, S), e), n = Lt(), o = n.length === 1 ? n[0] ?? null : null;
  Ix(n);
  const r = n.map((S) => S.id).join(",");
  if (r !== Dl && (fn.clear(), Dl = r), T.deleteLayer.disabled = n.length === 0 || n.some((S) => !rt(S)), T.groupLayers.disabled = n.length < 2 || n.some((S) => !rt(S)), dc(n), j.document) {
    const S = document.createElement("span");
    S.style.display = "contents", ye.push(ot(S, {
      id: "edit-canvas",
      label: () => b("editor.canvasSizeBackground"),
      icon: "ph-frame-corners",
      className: "toolbar-action",
      onClick() {
        xn.close(), j.selection = [], Nt(), ft(), lt(), Io("properties");
      }
    })), T.inspector.append(S);
  }
  if (n.length === 0) {
    const S = document.createElement("div");
    S.className = "inspector-empty", S.innerHTML = '<i class="ph ph-cursor-click" aria-hidden="true"></i><span data-i18n="editor.selectLayerHint">Select a layer to edit it</span>', T.inspector.append(S);
    const y = document.createElement("p");
    if (y.className = "empty-panel-copy", y.dataset.i18n = j.document ? "editor.setCanvasHint" : "editor.openProjectHint", y.textContent = b(j.document ? "editor.setCanvasHint" : "editor.openProjectHint"), e.append(y), j.document) {
      const N = or(T.advancedInspector, "Canvas");
      Ax(N);
    }
    return;
  }
  const s = n.some((S) => !rt(S));
  let a = 0;
  const i = (S, y, N, D = s, O = "toolbar-action", z, _ = !1) => {
    const F = document.createElement("span");
    return F.className = "inspector-button-host", F.style.display = "contents", ye.push(ot(F, {
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
    S.className = "toolbar-field toolbar-font", S.append(Ml("editor.fontFamily")), S.firstElementChild?.classList.add("sr-only");
    const y = zl(o, s);
    S.append(y.root), T.inspector.append(S);
    const N = document.createElement("span");
    N.className = "toolbar-field toolbar-number", ye.push(ct(N, {
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
    D.className = "toolbar-paint", Ur(
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
    S.className = "selection-label", n.length === 1 ? S.textContent = o?.type ?? b("editor.layerGeneric") : (S.dataset.i18nCount = "editor.layerCount", S.dataset.count = String(n.length), S.textContent = Dt("editor.layerCount", n.length)), T.inspector.append(S);
  }
  const c = n.map((S) => S.id);
  if (T.inspector.append(
    i("editor.centreHorizontally", "ph-align-center-horizontal", () => {
      oe("centre horizontally", { op: "centerOnCanvas", ids: c, axis: "horizontal" });
    }),
    i("editor.centreVertically", "ph-align-center-vertical", () => {
      oe("centre vertically", { op: "centerOnCanvas", ids: c, axis: "vertical" });
    }),
    i("position.title", "ph-bounding-box", () => _n(), !1, "toolbar-action position-button"),
    i("layers.groupButton", "ph-stack", () => {
      c.length > 1 && oe("group", { op: "group", ids: c });
    }, s || c.length < 2),
    i("editor.duplicate", "ph-copy", () => {
      xt("duplicate", c.map((S) => ({ op: "duplicate", id: S })));
    })
  ), !o) {
    const S = document.createElement("p");
    S.className = "empty-panel-copy";
    const y = n.filter((D) => D.type === "text"), N = y.length > 1 && new Set(y.map((D) => D.fontFamily)).size > 1;
    S.dataset.i18n = N ? "properties.mixedFonts" : "editor.selectionCountHint", S.textContent = N ? b("properties.mixedFonts") : b("editor.selectionCountHint", { count: n.length }), e.append(S);
    return;
  }
  const u = bo(o);
  if (u) {
    const S = document.createElement("p");
    S.className = "guarded-note", S.textContent = u, e.append(S);
  }
  const f = (S, y, N, D = "number", O, z, _ = !1) => {
    const F = document.createElement("div");
    F.className = "field", ye.push(ct(F, {
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
  }, h = (S, y, N, D, O, z = !1) => {
    const _ = document.createElement("div");
    _.className = "field", ye.push(ct(_, {
      id: y,
      label: () => b(S),
      value: N,
      className: y,
      disabled: u !== null || z,
      options: D,
      onCommit: O
    })), e.append(_);
  }, d = (S, y, N, D, O) => {
    const z = document.createElement("div");
    z.className = "field paint-field", Ur(
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
    S.style.display = "contents", ye.push(ot(S, {
      id: "edit-layer-text",
      label: () => b("canvas.editText"),
      icon: "ph-pencil-simple",
      className: "wide-action edit-text-button",
      disabled: u !== null,
      onClick: () => wo(o)
    })), e.append(S);
    const y = Mn.families.includes(o.fontFamily), N = document.createElement("div");
    N.className = "current-font-summary";
    const D = document.createElement("strong");
    D.className = "current-font-family", D.textContent = o.fontFamily;
    const O = document.createElement("span");
    if (O.className = "current-font-face", O.textContent = `${o.fontWeight ?? 400} · ${o.fontStyle ?? "normal"} · ${o.fontSize} px`, N.append(D, O), y) {
      const A = document.createElement("span");
      A.className = "current-font-specimen";
      const B = Mn.faces.find(
        (H) => H.family === o.fontFamily && H.weight === (o.fontWeight ?? 400) && H.style === (o.fontStyle ?? "normal")
      );
      if (B)
        Lf(A, B);
      else {
        const H = document.createElement("span");
        H.className = "font-specimen-status", H.textContent = b("fonts.previewUnavailable"), A.append(H);
      }
      N.append(A);
    } else {
      const A = document.createElement("p");
      A.className = "current-font-status", A.dataset.i18n = "properties.fontMissing", A.textContent = b("properties.fontMissing");
      const B = document.createElement("span");
      B.style.display = "contents", ye.push(ot(B, {
        id: "install-fonts",
        label: () => b("fonts.installFonts"),
        className: "small",
        onClick: () => {
          Oe("fonts", () => yc(!0));
        }
      })), N.append(A, B);
    }
    e.append(N);
    const z = document.createElement("label");
    z.className = "field", z.append(Ml("properties.font"));
    const _ = zl(o, u !== null);
    z.append(_.root), e.append(z), f("properties.fontSize", String(o.fontSize), (A) => ({ op: "update", id: o.id, fontSize: Number(A) })), f("properties.lineHeight", String(o.lineHeight ?? 1.2), (A) => ({ op: "update", id: o.id, lineHeight: Number(A) })), f("properties.paragraphSpacing", String(o.paragraphSpacing ?? 0), (A) => ({ op: "update", id: o.id, paragraphSpacing: Number(A) }));
    const F = zf(o.fontFamily, Mn.faces);
    if (F.length) {
      const A = o.fontWeight ?? 400, B = o.fontStyle ?? "normal", H = [.../* @__PURE__ */ new Set([
        ...F.filter((W) => W.style === B).map((W) => W.weight),
        A
      ])].sort((W, Y) => W - Y);
      h(
        "properties.weight",
        "font-weight",
        String(A),
        H.map((W) => ({ value: String(W), label: String(W) })),
        (W) => {
          oe("change Weight", { op: "update", id: o.id, fontWeight: Number(W) });
        }
      );
    } else
      f("properties.weight", String(o.fontWeight ?? 400), (A) => ({ op: "update", id: o.id, fontWeight: Number(A) }));
    f("properties.letterSpacing", String(o.letterSpacing ?? 0), (A) => ({ op: "update", id: o.id, letterSpacing: Number(A) }));
    const $ = o.fontStyle ?? "normal", M = o.fontWeight ?? 400, L = F.filter((A) => A.weight === M).map((A) => A.style === "oblique" ? "italic" : A.style), I = F.length ? [.../* @__PURE__ */ new Set([...L, $])] : [$];
    if (h(
      "properties.style",
      "font-style",
      o.fontStyle ?? "normal",
      I.map((A) => ({ value: A, label: A })),
      (A) => {
        oe("change font style", { op: "update", id: o.id, fontStyle: A });
      }
    ), h(
      "properties.verticalAlign",
      "vertical-align",
      o.verticalAlign ?? "top",
      ["top", "middle", "bottom"].map((A) => ({ value: A, label: A })),
      (A) => {
        oe("change vertical align", { op: "update", id: o.id, verticalAlign: A });
      }
    ), d(
      "properties.colour",
      "text-fill",
      o.color ?? "#000000",
      (A) => ({ op: "update", id: o.id, color: A })
    ), d(
      "properties.strokeColour",
      "text-stroke",
      o.stroke?.color ?? "#000000",
      (A) => ({ op: "update", id: o.id, stroke: { color: A, width: o.stroke?.width ?? 1 } }),
      { className: "text-stroke-none", disabled: !o.stroke, onClear: () => {
        oe("clear text stroke", { op: "update", id: o.id, stroke: null });
      } }
    ), f("properties.strokeWidth", String(o.stroke?.width ?? 1), (A) => ({ op: "update", id: o.id, stroke: { color: o.stroke?.color ?? "#000000", width: Number(A) } })), j.project && j.document) {
      const A = Vl(j.project, j.document, o), B = document.createElement("div");
      e.append(B), ye.push(Gw(B, {
        capture: A,
        layer: o,
        drafts: Oa,
        disabled: u !== null,
        fonts: { store: () => Mn },
        submit: Fx,
        reload: async () => {
          const H = await Tn.outcome("reload runs", async () => {
            if (j.project !== A.project || j.document?.id !== A.document) throw new Error(b("runs.notSent"));
            const W = await yr(A.project);
            if (j.project !== A.project || j.document?.id !== A.document) throw new Error(b("runs.notSent"));
            const Y = Be($e(W)).find((ae) => ae.layer.id === A.layer)?.layer;
            if (!Y || Y.type !== "text") throw new Error(b("runs.notSent"));
            Oa.set(Ji(A), Vf(Vl(A.project, W, Y))), Vn(W);
          });
          return H.status === "refused" ? String(H.error) : null;
        }
      }));
    }
  }
  t("Transform");
  const m = document.createElement("div");
  m.className = "property-grid";
  const g = (S, y, N) => {
    const D = `transform-${S.split(".").at(-1)}`, O = document.createElement("div");
    O.className = "field", ye.push(ct(O, {
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
    })), m.append(O);
  }, v = o.transform;
  if (g("properties.x", String(v.x), (S) => Fl(o, Number(S), v.y)), g("properties.y", String(v.y), (S) => Fl(o, v.x, Number(S))), g("properties.width", String(v.width), (S) => Bl(o, Number(S), v.height)), g("properties.height", String(v.height), (S) => Bl(o, v.width, Number(S))), g("properties.rotation", String(v.rotation ?? 0), (S) => ({ op: "rotate", id: o.id, degrees: Number(S) })), g("properties.opacity", String(o.opacity ?? 1), (S) => ({ op: "update", id: o.id, opacity: Number(S) })), e.append(m), (o.type === "image" || o.type === "svg") && (e = t("Media"), h(
    "properties.fit",
    "layer-fit",
    o.fit ?? "fill",
    Eb.map((S) => ({ value: S, label: S })),
    (S) => {
      oe("change fit", { op: "update", id: o.id, fit: S });
    }
  ), o.type === "image")) {
    const S = yx(o), y = bx(o), N = y?.width ?? null, D = y?.height ?? null, O = typeof N == "number" && N > 0 && typeof D == "number" && D > 0, z = document.createElement("p");
    z.className = "hint";
    const _ = O ? "canvas.cropAvailableHint" : "canvas.cropUnavailableHint";
    z.dataset.i18n = _, z.textContent = b(_), e.append(z);
    const F = S ?? { x: 0, y: 0, width: N ?? 0, height: D ?? 0 }, $ = (A, B, H, W) => {
      f(A, String(H), (Y) => W(Number(Y)), "number", void 0, B, !O);
    }, M = (A) => !Number.isFinite(A.x) || !Number.isFinite(A.y) || !(A.width > 0) || !(A.height > 0) ? null : { op: "update", id: o.id, crop: A };
    $("canvas.cropX", "crop-x", F.x, (A) => M({ ...F, x: A })), $("canvas.cropY", "crop-y", F.y, (A) => M({ ...F, y: A })), $("canvas.cropWidth", "crop-width", F.width, (A) => M({ ...F, width: A })), $("canvas.cropHeight", "crop-height", F.height, (A) => M({ ...F, height: A }));
    const L = document.createElement("div");
    L.className = "field";
    const I = document.createElement("span");
    I.style.display = "contents", ye.push(ot(I, {
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
    const S = Mf(o), y = o.stroke?.color ?? qf, N = o.stroke?.width ?? Kf, D = (A, B, H, W, Y, ae) => {
      const fe = document.createElement("div");
      fe.className = "field shape-field";
      const ie = document.createElement("span");
      ie.dataset.i18n = A, ie.textContent = b(A);
      const te = document.createElement("span");
      te.className = "shape-paint", Ur(
        te,
        B,
        b(A),
        H,
        u !== null,
        (he) => {
          oe(`change ${b(A)}`, Y(he));
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
      o.fill ?? ec,
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
    ), f(
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
    ), S === "rect" && f(
      "properties.cornerRadius",
      String(Rb(o)),
      (A) => ({ op: "update", id: o.id, cornerRadius: Number(A) }),
      "number",
      void 0,
      "shape-corner-radius"
    );
    const O = (A, B) => {
      const H = fn.get(B);
      if (!H) return;
      const W = document.createElement("span");
      W.className = `control-error ${B}-note`, W.textContent = H, A.append(W);
    }, z = (A) => (B) => {
      fn.set(
        A,
        B instanceof Ye ? oc(B) : String(B)
      ), lt();
    }, _ = document.createElement("div");
    _.className = "field shape-field shape-path";
    const F = o.shape, $ = S === "path" && typeof F.d == "string" ? F.d : "";
    ye.push(ct(_, {
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
        !B || B === $ || (fn.delete("path-d"), oe("set path data", {
          op: "update",
          id: o.id,
          shape: { kind: "path", d: B }
        }, z("path-d")));
      }
    })), O(_, "path-d"), e.append(_);
    const M = document.createElement("div");
    M.className = "field shape-field shape-dash-row";
    const L = (o.stroke?.dashArray ?? []).join(", ");
    ye.push(ct(M, {
      id: "shape-dash",
      label: () => b("canvas.dashPattern"),
      type: "text",
      value: L,
      className: "shape-dash",
      placeholder: b("canvas.dashExample"),
      disabled: u !== null,
      onCommit: (A) => {
        const B = A.trim();
        fn.delete("dash");
        const H = B ? B.split(",").map((Y) => Number(Y.trim())) : [];
        if (H.some((Y) => !Number.isFinite(Y) || Y <= 0)) {
          fn.set("dash", b("canvas.dashPositiveError")), lt();
          return;
        }
        if (H.length > vl) {
          fn.set("dash", b("canvas.dashMaxError", { count: vl })), lt();
          return;
        }
        const W = {
          ...o.stroke ?? { color: y, width: N },
          dashArray: H.length ? H : null
        };
        oe("change dash pattern", { op: "update", id: o.id, stroke: W }, z("dash"));
      }
    })), O(M, "dash"), e.append(M);
    const I = (A, B, H, W) => {
      const Y = o.stroke?.[H], ae = typeof Y == "string" ? Y : null, fe = ae && !W.includes(ae) ? [...W, ae] : [...W];
      h(A, B, ae ?? W[0] ?? "", fe.map((ie) => ({ value: ie, label: ie })), (ie) => {
        const te = {
          ...o.stroke ?? { color: y, width: N },
          [H]: ie
        };
        oe(`change ${b(A).toLowerCase()}`, { op: "update", id: o.id, stroke: te });
      });
    };
    if (I("properties.lineCap", "shape-stroke-cap", "lineCap", ["butt", "round", "square"]), I("properties.lineJoin", "shape-stroke-join", "lineJoin", ["miter", "round", "bevel"]), S === "line") {
      const A = (B, H, W) => {
        const Y = F[W], ae = typeof Y == "string" && Y !== "none" && !["arrow", "circle"].includes(Y) ? ["none", "arrow", "circle", Y] : ["none", "arrow", "circle"];
        h(
          B,
          H,
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
  const w = vx(o), x = [...gx];
  w && !x.includes(w) && x.push(w), h("properties.clip", "clip-shape", w ?? "none", ["none", ...x].map((S) => ({ value: S, label: S })), (S) => {
    if (S === (w ?? "none")) return;
    const y = S === "none" ? null : S === "rect" ? { shape: "rect", cornerRadius: Il(o) } : { shape: S };
    oe("change clip", { op: "update", id: o.id, clip: y });
  }), w === "rect" && f(
    "properties.clipRadius",
    String(Il(o)),
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
  const C = (S, y, N, D) => {
    const O = document.createElement("div");
    O.className = "field checkbox", ye.push(Bo(O, {
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
  C("properties.flipHorizontal", "flip-horizontal", "flipHorizontal", o.transform.flipHorizontal ?? !1), C("properties.flipVertical", "flip-vertical", "flipVertical", o.transform.flipVertical ?? !1), e.append(E), e = t("Appearance"), h(
    "properties.blendMode",
    "blend-mode",
    o.blendMode ?? "normal",
    Nb.map((S) => ({ value: S, label: S })),
    (S) => {
      oe("change blend mode", { op: "update", id: o.id, blendMode: S });
    }
  ), Dx(T.advancedInspector, o, u !== null), Ox(T.advancedInspector, o, u !== null), $x(T.advancedInspector, o);
  const k = document.createElement("div");
  k.className = "property-flags";
  const R = document.createElement("div");
  R.className = "field checkbox", ye.push(Bo(R, {
    id: "layer-visible",
    label: () => b("properties.visible"),
    checked: o.visible ?? !0,
    disabled: u !== null,
    onChange: (S) => {
      oe("show/hide", { op: "setVisible", id: o.id, visible: S });
    }
  }));
  const P = document.createElement("div");
  P.className = "field checkbox", ye.push(Bo(P, {
    id: "layer-locked",
    label: () => b("properties.locked"),
    checked: o.locked ?? !1,
    disabled: bo(o, !0) !== null,
    onChange: (S) => {
      oe(S ? "lock layer" : "unlock layer", { op: "setLocked", id: o.id, locked: S });
    }
  })), k.append(R, P), e.append(k);
}
function ca(e) {
  return e === "hueRotate" ? b("effects.hueRotate") : e === "invert" ? b("effects.invert") : e.replace(/([A-Z])/g, " $1").replace(/^./, (t) => t.toUpperCase());
}
function Dx(e, t, n) {
  const o = t.effects ?? [], r = or(e, "Effects"), s = (f) => {
    oe("effects", { op: "update", id: t.id, effects: f });
  };
  for (const [f, h] of o.entries()) {
    const d = document.createElement("div");
    d.className = "effect-row", d.dataset.effect = h.type;
    const m = document.createElement("span");
    m.className = "effect-name", m.textContent = ca(h.type), (h.type === "hueRotate" || h.type === "invert") && (m.dataset.i18n = `effects.${h.type}`), d.append(m);
    const g = Tb(h);
    g.length > 1 && d.classList.add("multi");
    const v = (E) => {
      const C = document.createElement("span");
      C.className = "effect-input-host";
      const k = `effect-${t.id}-${f}-${E.name}`;
      return ye.push(ct(C, {
        id: k,
        label: () => `${ca(h.type)} ${E.name === "degrees" ? b("effects.degrees") : h.type === "invert" && E.name === "amount" ? b("effects.amount") : E.name}`,
        value: String(E.value),
        type: E.kind === "color" ? "text" : "number",
        step: E.kind === "number" ? E.name === "degrees" ? "1" : "0.05" : void 0,
        disabled: n,
        onMount: (R) => {
          R.dataset.field = E.name;
        },
        onCommit: (R) => {
          const P = E.kind === "color" ? R.trim() : Number(R);
          typeof P == "number" && !Number.isFinite(P) || P !== E.value && s(o.map((S, y) => y === f ? { ...S, [E.name]: P } : S));
        }
      })), C;
    };
    if (g.length === 1 && g[0])
      d.append(v(g[0]));
    else if (g.length > 1) {
      const E = document.createElement("span");
      E.className = "effect-fields";
      for (const C of g) {
        const k = document.createElement("label");
        k.className = "effect-field";
        const R = document.createElement("span");
        R.textContent = C.name, k.append(R, v(C)), E.append(k);
      }
      d.append(E);
    }
    const w = (E) => {
      const C = [...o], k = C[f], R = C[E];
      !k || !R || (C[f] = R, C[E] = k, s(C));
    }, x = (E, C, k, R, P) => {
      const S = document.createElement("span");
      return S.style.display = "contents", ye.push(ot(S, {
        id: `effect-action-${t.id}-${f}-${E}`,
        className: E,
        label: C,
        title: C,
        icon: k,
        disabled: R,
        onClick: P
      })), S;
    };
    d.append(
      x("small effect-up", b("effects.moveUp", { effect: h.type }), "ph-arrow-up", n || f === 0, () => w(f - 1)),
      x("small effect-down", b("effects.moveDown", { effect: h.type }), "ph-arrow-down", n || f === o.length - 1, () => w(f + 1)),
      x("small effect-remove", b("effects.remove"), "ph-trash", n, () => s(o.filter((E, C) => C !== f)))
    ), r.append(d);
  }
  const a = document.createElement("div");
  a.className = "effect-add-row";
  let i = yl[0] ?? "brightness";
  const c = document.createElement("span");
  ye.push(ct(c, {
    id: `effect-chooser-${t.id}`,
    label: () => b("effects.choose"),
    value: i,
    className: "effect-chooser",
    disabled: n,
    options: yl.map((f) => ({ value: f, label: () => ca(f) })),
    onCommit: (f) => {
      i = f;
    }
  }));
  const u = document.createElement("span");
  u.style.display = "contents", ye.push(ot(u, {
    id: `effect-add-${t.id}`,
    className: "effect-add",
    icon: "ph-plus",
    label: () => b("effects.add"),
    disabled: n,
    onClick: () => {
      const f = T.advancedInspector.querySelector(".effect-chooser");
      f && (i = f.value), s([...o, Pb(i)]);
    }
  })), a.append(c, u), r.append(a);
}
function Ox(e, t, n) {
  const o = or(e, "Presets");
  if (j.presets.length === 0) {
    const a = document.createElement("p");
    a.className = "hint", a.dataset.i18n = "presets.none", a.textContent = b("presets.none"), o.append(a);
  }
  for (const a of j.presets) {
    const i = document.createElement("div");
    i.className = "preset-row";
    const c = document.createElement("span");
    c.className = "effect-name", c.textContent = a.name, a.description && (c.title = a.description), i.append(c);
    const u = document.createElement("span");
    u.style.display = "contents", ye.push(ot(u, {
      id: `preset-apply-${++yn}`,
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
    f.style.display = "contents", ye.push(ot(f, {
      id: `preset-remove-${++yn}`,
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
  s.style.display = "contents", ye.push(ot(s, {
    id: `preset-save-${++yn}`,
    label: () => b("presets.saveStyle"),
    onClick: () => {
      Fs("presets.saveTitle", "presets.name", "presets.saveButton", (a) => {
        oe(`define ${a}`, {
          op: "definePreset",
          preset: { name: a, properties: Ib(t) }
        });
      });
    }
  })), r.append(s), o.append(r);
}
function $x(e, t) {
  const n = or(e, "Slots");
  for (const i of j.slots) {
    const c = document.createElement("div");
    c.className = "slot-row";
    const u = document.createElement("span");
    u.className = "effect-name", u.textContent = `${i.name}${i.required ? " *" : ""}`, u.title = i.description ?? `${i.kind ?? "text"} → ${i.layer}`, i.layer === t.id && u.classList.add("slot-on-this-layer"), c.append(u);
    const f = document.createElement("span");
    f.style.display = "contents", ye.push(ot(f, {
      id: `slot-edit-${++yn}`,
      label: () => b("common.edit"),
      className: "small slot-edit",
      title: () => b("slots.editHint", { name: i.name }),
      onMount(d) {
        d.dataset.slot = i.name, d.dataset.slotName = i.name;
      },
      onClick: () => Lx(c, i)
    })), c.append(f);
    const h = document.createElement("span");
    h.style.display = "contents", ye.push(ot(h, {
      id: `slot-remove-${++yn}`,
      label: () => b("common.remove"),
      className: "small",
      onClick: () => {
        oe(`remove slot ${i.name}`, {
          op: "removeSlot",
          name: i.name
        });
      }
    })), c.append(h), n.append(c);
  }
  const o = document.createElement("div");
  o.className = "inspector-add-row";
  let r = t.type === "image" ? "image" : "text";
  const s = document.createElement("span");
  s.style.display = "contents", ye.push(ct(s, {
    id: `slot-kind-${++yn}`,
    label: () => b("slots.kind"),
    value: r,
    className: "slot-kind-select",
    options: ["text", "image", "color"].map((i) => ({ value: i, label: i })),
    onCommit: (i) => {
      r = i;
    }
  }));
  const a = document.createElement("span");
  a.style.display = "contents", ye.push(ot(a, {
    id: `slot-offer-${++yn}`,
    label: () => b("slots.offer"),
    onClick: () => {
      Fs("slots.createTitle", "slots.name", "slots.createButton", (i) => {
        oe(`offer ${i}`, {
          op: "defineSlot",
          slot: { name: i, layer: t.id, kind: r }
        });
      });
    }
  })), o.append(s, a), n.append(o);
}
function Lx(e, t) {
  e.replaceChildren();
  const n = document.createElement("span"), o = document.createElement("span"), r = document.createElement("span"), s = document.createElement("span"), a = document.createElement("span");
  for (const u of [n, o, r, s, a]) u.style.display = "contents";
  e.append(n, o, r, s, a);
  const i = ++yn;
  ye.push(ct(n, {
    id: `slot-edit-name-${i}`,
    label: () => b("slots.name"),
    value: t.name,
    className: "slot-edit-name",
    onCommit: () => {
    }
  })), ye.push(ct(o, {
    id: `slot-edit-kind-${i}`,
    label: () => b("slots.kind"),
    value: t.kind ?? "text",
    className: "slot-edit-kind",
    options: ["text", "image", "color"].map((u) => ({ value: u, label: u })),
    onCommit: () => {
    }
  })), ye.push(ct(r, {
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
      lt();
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
  ye.push(ot(s, {
    id: `slot-edit-save-${i}`,
    label: () => b("common.save"),
    className: "small slot-edit-save",
    onClick: () => c(!0)
  })), ye.push(ot(a, {
    id: `slot-edit-cancel-${i}`,
    label: () => b("common.cancel"),
    className: "small",
    onClick: () => c(!1)
  })), e.addEventListener("keydown", (u) => {
    u.key === "Enter" && (u.preventDefault(), c(!0)), u.key === "Escape" && (u.preventDefault(), u.stopPropagation(), c(!1));
  }), e.querySelector(".slot-edit-name")?.focus();
}
let Ba = 0;
async function zx() {
  if (!j.project) return;
  const e = ++Ba, t = await mb(j.project);
  e === Ba && (br = { entries: t.entries, position: t.position, head: t.head }, Nt(), T.undo.disabled = t.position === 0, T.redo.disabled = t.position >= t.head);
}
function Fl(e, t, n) {
  const o = t - e.transform.x, r = n - e.transform.y;
  return o === 0 && r === 0 ? null : { op: "move", id: e.id, dx: o, dy: r };
}
function Bl(e, t, n) {
  return t === e.transform.width && n === e.transform.height ? null : { op: "resize", id: e.id, width: t, height: n };
}
function _x(e) {
  if (!("id" in e) || e.op !== "update") return null;
  const t = e.id;
  if (typeof t != "string") return null;
  const n = Object.keys(e).filter((o) => o !== "op" && o !== "id" && o !== "expectedVersion").sort();
  return n.length > 0 ? `update:${t}:${n.join(",")}` : null;
}
function tp(e) {
  if (!j.document) return !1;
  let t = !1;
  for (const n of e)
    if (n.op === "move" || n.op === "resize" || n.op === "rotate") {
      const o = Be($e(j.document)).find(({ layer: r }) => r.id === n.id)?.layer;
      if (!o) continue;
      n.op === "move" ? (o.transform.x += n.dx, o.transform.y += n.dy) : n.op === "resize" ? (o.transform.width = n.width, o.transform.height = n.height) : o.transform.rotation = n.degrees, t = !0;
    }
  return t && (ft(), Za() && dc(Lt())), t;
}
function np() {
  const e = j.project, t = j.document ? structuredClone(j.document) : null;
  return () => {
    if (!t || j.project !== e) return;
    const n = j.document;
    if (n && Le(n) === Le(t)) {
      Et(), j.document = t, Nt(), ft(), lt();
      return;
    }
    Oe("reload", Ge);
  };
}
function Vl(e, t, n) {
  return { project: e, document: t.id, layer: n.id, version: Le(t), text: n.text, runs: n.runs ?? [] };
}
async function Fx(e) {
  const t = Kw(e);
  if (!t) return { status: "applied" };
  let n = !1;
  const o = await Tn.outcome("apply runs", async () => {
    const r = e.capture;
    if (j.project !== r.project || j.document?.id !== r.document || j.selection.length !== 1 || j.selection[0] !== r.layer) throw new Error(b("runs.notSent"));
    const s = Be($e(j.document)).find((c) => c.layer.id === r.layer)?.layer;
    if (!s || bo(s)) throw new Error(b("runs.notSent"));
    const a = await Bn(r.project, t, r.version);
    n = !0;
    const i = a.document ?? await yr(r.project);
    if (j.project !== r.project || j.document?.id !== r.document) throw new Error(b("runs.notSent"));
    Oa.delete(Ji(r)), Vn(i), Se(b("status.editDone", { version: a.version }));
  });
  return o.status === "applied" ? { status: "applied" } : (rn("apply runs", o.error), { status: n ? "committed" : o.error instanceof Ye ? "refused" : "unknown", error: n ? b("runs.committed") : o.error instanceof Ye ? oc(o.error) : `${b("runs.failed")} ${String(o.error)}` });
}
async function oe(e, t, n) {
  if (!j.project || !j.document) return;
  const o = j.project, r = np();
  let s = !1;
  tp([t]), await Tn.enqueue({
    label: e,
    coalesceKey: _x(t),
    run: async () => {
      if (j.project !== o || !j.document) {
        Se(b("status.editNotSent"), "error");
        return;
      }
      const a = await Bn(
        o,
        t,
        Le(j.document)
      );
      s = !0, Se(b("status.editDone", { version: a.version })), a.created?.length && (j.selection = a.created), a.document ? Vn(a.document) : await Ge();
    },
    onError: (a) => {
      s || r(), n && n(a), rn(e, a);
    },
    onSuperseded: r
  });
}
async function Bx(e, t) {
  await xt(e, t);
}
async function xt(e, t, n) {
  if (!j.project || !j.document || t.length === 0) return;
  const o = j.project, r = np();
  let s = !1;
  tp(t), await Tn.enqueue({
    label: e,
    coalesceKey: null,
    run: async () => {
      if (j.project !== o || !j.document || n && !xr(n)) {
        r(), Et(), Se(b("status.editNotSent"), "error");
        return;
      }
      const a = await gb(
        o,
        e,
        t,
        n?.version ?? Le(j.document)
      );
      s = !0, a.created?.length && (j.selection = a.created), Se(b("status.editDone", { version: a.version })), a.document ? Vn(a.document) : await Ge();
    },
    onError: (a) => {
      s || r(), rn(e, a);
    }
  });
}
function la(e, t, n, o, r) {
  if (e.preventDefault(), !j.document || T.canvas.getBoundingClientRect().width === 0 || j.drag && j.drag.pointerId !== e.pointerId || o === "resize" && !za()) return;
  Qe();
  const s = T.canvas;
  if (j.drag = {
    ids: t.map(({ layer: a }) => a.id),
    mode: o,
    handle: r,
    startX: e.clientX,
    startY: e.clientY,
    pointerId: e.pointerId,
    capture: s,
    project: j.project,
    version: Le(j.document),
    generation: ++tc,
    shift: e.shiftKey,
    alt: e.altKey,
    epoch: 0,
    bounds: n,
    origins: t.map(({ layer: a, x: i, y: c, width: u, height: f }) => ({
      id: a.id,
      x: a.transform.x,
      y: a.transform.y,
      absoluteX: i,
      absoluteY: c,
      width: u,
      height: f,
      rotation: a.transform.rotation ?? 0,
      layer: structuredClone(a)
    })),
    preserveSelectionScale: o === "resize" && t.length === 1 && t[0]?.layer.type === "text"
  }, !Vx(j.drag)) {
    zt !== null && Et(), Hl(j.drag);
    const a = wt;
    !j.drag.previewActive && a && a.pending.then(() => {
      j.drag && wt === a && Hl(j.drag);
    });
  }
  try {
    s.setPointerCapture?.(e.pointerId);
  } catch {
    e.isTrusted && Qe();
  }
}
function Vx(e) {
  return e.mode !== "move" || !j.document || Qo === null || zt !== Le(j.document) ? !1 : (e.adoptedDelta = Qo, e.previewActive = !0, uc(e, e.lastDelta?.x ?? 0, e.lastDelta?.y ?? 0), !0);
}
function lc(e) {
  return !j.project || !j.document ? null : `${j.project}:${Le(j.document)}:${[...e].sort().join(",")}`;
}
function op() {
  const e = wt;
  if (wt = null, !!e) {
    e.baseUrl && !On.includes(e.baseUrl) && URL.revokeObjectURL(e.baseUrl), e.selectionUrl && !On.includes(e.selectionUrl) && URL.revokeObjectURL(e.selectionUrl);
    for (const t of e.items ?? []) On.includes(t.url) || URL.revokeObjectURL(t.url);
  }
}
async function rp(e) {
  const t = lc(e);
  if (!t || !j.project || !j.document) return;
  if (wt?.key === t) return wt.pending;
  op();
  const n = j.project, o = Le(j.document), r = tr(), s = {
    key: t,
    pending: Promise.resolve()
  };
  return wt = s, s.pending = Promise.all([
    vo(Qr(n, o, r, { exclude: e })),
    vo(Qr(n, o, r, { only: e }))
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
function Hl(e) {
  if (e.mode === "resize") {
    ss(e);
    return;
  }
  const t = wt;
  if (e.previewActive || t?.key !== lc(e.ids) || !t.baseUrl || !t.selectionUrl) return;
  const n = document.createElement("img");
  n.id = "drag-preview-base", n.className = "drag-preview-image", n.alt = "", n.src = t.baseUrl;
  const o = document.createElement("img");
  o.id = "drag-preview-selection", o.className = "drag-preview-image drag-preview-selection", o.alt = "", o.src = t.selectionUrl, T.overlay.before(n, o), T.canvasImage.classList.add("drag-preview-hidden"), On = [t.baseUrl, t.selectionUrl], e.previewActive = !0, uc(e, e.lastDelta?.x ?? 0, e.lastDelta?.y ?? 0);
}
function Et() {
  document.getElementById("drag-preview-base")?.remove(), document.getElementById("drag-preview-selection")?.remove(), document.querySelectorAll("[data-resize-preview-item]").forEach((e) => e.remove()), T.canvasImage.classList.remove("drag-preview-hidden");
  for (const e of On) URL.revokeObjectURL(e);
  On = [], zt = null, Qo = null, op();
}
function rs(e) {
  return e.handle?.length === 2 && e.origins.length === 1 && e.origins[0]?.layer.type === "image" ? !e.shift : e.shift;
}
function xr(e) {
  if (e.cancelled || e.generation !== tc || j.project !== e.project || !j.document || Le(j.document) !== e.version) return !1;
  const t = Be($e(j.document));
  return e.ids.every((n) => {
    const o = t.find((r) => r.layer.id === n);
    return o && rt(o.layer) && cc(t, o.parent) !== null;
  });
}
function Va(e) {
  e.capture.hasPointerCapture?.(e.pointerId) && e.capture.releasePointerCapture(e.pointerId);
}
function Qe() {
  const e = j.drag?.mode === "resize" ? j.drag : vn;
  e && (e.cancelled = !0, tc += 1, j.drag === e && (j.drag = null), vn = null, Va(e), Et(), delete T.canvas.dataset.resizePreview, ft());
}
function sp(e, t, n) {
  const o = Qb(
    e.bounds,
    e.origins.length === 1 ? e.origins[0].rotation : 0,
    e.handle ?? "se",
    t,
    n,
    { ratio: rs(e), centre: e.alt },
    e.origins
  ), r = e.measurement;
  return o && r?.height !== void 0 && r.width === o.width && r.epoch === e.epoch && !rs(e) && (o.y += (o.height - r.height) / 2, o.height = r.height), o && Object.values(o).every(Number.isFinite) ? o : null;
}
function ap(e, t) {
  return e.origins.map((n) => ({ origin: n, next: e.origins.length === 1 ? t : $f(
    { x: n.absoluteX, y: n.absoluteY, width: n.width, height: n.height },
    e.bounds,
    t,
    !0
  ) }));
}
function Hx(e, t) {
  const n = e.origins[0];
  if (e.origins.length !== 1 || n?.layer.type !== "text" || rs(e) || e.handle !== "e" && e.handle !== "w" || t.width === e.bounds.width || e.measurement?.width === t.width && e.measurement.epoch === e.epoch) return;
  const o = { width: t.width, epoch: e.epoch, pending: Promise.resolve(), height: void 0 };
  e.measurement = o, o.pending = Of(e.project, n.id, t.width).then((r) => {
    if (!xr(e) || e.measurement !== o || e.epoch !== o.epoch || rs(e)) return;
    const s = Math.max(1, Math.ceil(r.height));
    Number.isFinite(s) && (o.height = s, j.drag === e && Vs(e));
  }).catch(() => {
  });
}
function zo(e) {
  (e.previewActive || zt !== null || document.querySelector(".drag-preview-image")) && Et(), e.previewActive = !1, T.canvas.dataset.resizePreview = "handles-only";
}
function ss(e) {
  if (!j.document || e.cancelled || !xr(e)) return;
  const t = e.next, n = ew(j.document, e.ids), o = t ? ap(e, t) : [], r = o.some(({ origin: u, next: f }) => [
    { x: u.absoluteX, y: u.absoluteY, width: u.width, height: u.height },
    f
  ].some((h) => {
    const d = ts({ ...h, rotation: u.rotation });
    return d.x < 0 || d.y < 0 || d.x + d.width > j.document.canvas.width || d.y + d.height > j.document.canvas.height;
  })), s = T.canvasImage.getBoundingClientRect(), a = s.width === j.document.canvas.width && s.height === j.document.canvas.height;
  if (!t || !n || r || !a) {
    zo(e);
    return;
  }
  const i = wt;
  if (!i || i.key !== lc(e.ids) || !i.baseUrl) {
    zo(e), rp(e.ids).then(() => {
      j.drag === e && ss(e);
    });
    return;
  }
  if (!i.items) {
    zo(e), i.itemsPending ??= (async () => {
      const u = [];
      try {
        for (const f of n) u.push({ id: f.id, url: await vo(Qr(e.project, e.version, tr(), { only: [f.id] })) });
        if (wt !== i) {
          for (const f of u) URL.revokeObjectURL(f.url);
          return;
        }
        i.items = u, j.drag === e && ss(e);
      } catch {
        for (const f of u) URL.revokeObjectURL(f.url);
      }
    })();
    return;
  }
  const c = i.items.map((u) => {
    const f = o.find(({ origin: h }) => h.id === u.id);
    return tw(
      f.origin.layer,
      { x: f.origin.absoluteX, y: f.origin.absoluteY, width: f.origin.width, height: f.origin.height },
      f.next
    );
  });
  if (c.some((u) => !u)) {
    zo(e);
    return;
  }
  if (!e.previewActive) {
    const u = document.createElement("img");
    u.id = "drag-preview-base", u.className = "drag-preview-image", u.alt = "", u.src = i.baseUrl, u.style.objectFit = "contain", T.overlay.before(u);
    for (const f of i.items) {
      const h = document.createElement("img");
      h.className = "drag-preview-image drag-preview-selection", h.dataset.resizePreviewItem = f.id, h.alt = "", h.src = f.url, h.style.objectFit = "contain", T.overlay.before(h);
    }
    T.canvasImage.classList.add("drag-preview-hidden"), On = [i.baseUrl, ...i.items.map((f) => f.url)], e.previewActive = !0;
  }
  for (let u = 0; u < i.items.length; u += 1) {
    const f = document.querySelector(`[data-resize-preview-item="${CSS.escape(i.items[u].id)}"]`), h = c[u];
    f.style.transformOrigin = "0 0", f.style.transform = `matrix(${h[0]},${h[1]},${h[2]},${h[3]},${h[4] * s.width / j.document.canvas.width},${h[5] * s.height / j.document.canvas.height})`;
  }
  T.canvas.dataset.resizePreview = "items";
}
function Vs(e) {
  if (!xr(e)) {
    Qe();
    return;
  }
  const t = sp(e, e.lastDelta?.x ?? 0, e.lastDelta?.y ?? 0);
  if (e.invalid = t === null, e.next = t ?? void 0, !t) {
    zo(e);
    return;
  }
  Hx(e, t);
  const n = T.overlay.querySelector(".handle-box");
  n && j.document && (n.style.left = `${t.x / j.document.canvas.width * 100}%`, n.style.top = `${t.y / j.document.canvas.height * 100}%`, n.style.width = `${t.width / j.document.canvas.width * 100}%`, n.style.height = `${t.height / j.document.canvas.height * 100}%`), ss(e);
}
function uc(e, t, n) {
  if (e.mode === "resize") {
    Vs(e);
    return;
  }
  if (!j.document || !e.previewActive) return;
  const o = document.getElementById("drag-preview-selection");
  if (!o) return;
  const r = j.document.canvas;
  if (o.style.transformOrigin = "0 0", e.mode === "move")
    o.style.transform = `translate(${((e.adoptedDelta?.x ?? 0) + t) / r.width * 100}%, ${((e.adoptedDelta?.y ?? 0) + n) / r.height * 100}%)`;
  else {
    const s = T.canvas.getBoundingClientRect(), a = s.left + (e.bounds.x + e.bounds.width / 2) / r.width * s.width, i = s.top + (e.bounds.y + e.bounds.height / 2) / r.height * s.height, c = Math.atan2(e.startY - i, e.startX - a), u = Math.atan2(e.startY + n / Zt() - i, e.startX + t / Zt() - a);
    o.style.transformOrigin = `${(e.bounds.x + e.bounds.width / 2) / r.width * 100}% ${(e.bounds.y + e.bounds.height / 2) / r.height * 100}%`, o.style.transform = `rotate(${(u - c) * 180 / Math.PI}deg)`;
  }
}
function Zt() {
  const e = T.canvas.getBoundingClientRect();
  return j.document && e.width !== 0 ? j.document.canvas.width / e.width : 1;
}
function ip(e) {
  const t = j.drag;
  if (t?.mode !== "resize") return !1;
  if (e.key === "Escape")
    return e.preventDefault(), Qe(), !0;
  if (e.key !== "Shift" && e.key !== "Alt") return !1;
  const n = e.key === "Shift" ? e.type === "keydown" : e.shiftKey, o = e.key === "Alt" ? e.type === "keydown" : e.altKey;
  return (n !== t.shift || o !== t.alt) && (t.shift = n, t.alt = o, t.epoch += 1, t.measurement = void 0, Vs(t)), !0;
}
window.addEventListener("pointermove", (e) => {
  const t = j.drag;
  if (!t || !j.document || e.pointerId !== t.pointerId) return;
  let n = (e.clientX - t.startX) * Zt(), o = (e.clientY - t.startY) * Zt();
  T.overlay.querySelectorAll(".smart-guide").forEach((s) => s.remove()), t.mode === "move" && ({ dx: n, dy: o } = Ux(n, o, t.bounds, t.ids, Zt())), t.mode === "resize" && (t.shift !== e.shiftKey || t.alt !== e.altKey) && (t.shift = e.shiftKey, t.alt = e.altKey, t.epoch += 1, t.measurement = void 0), t.lastDelta = { x: n, y: o }, uc(t, n, o);
  const r = T.overlay.querySelector(".handle-box");
  if (r) {
    if (t.mode === "move")
      r.style.left = `${(t.bounds.x + n) / j.document.canvas.width * 100}%`, r.style.top = `${(t.bounds.y + o) / j.document.canvas.height * 100}%`;
    else if (t.mode === "rotate") {
      const s = T.canvas.getBoundingClientRect(), a = s.left + (t.bounds.x + t.bounds.width / 2) / j.document.canvas.width * s.width, i = s.top + (t.bounds.y + t.bounds.height / 2) / j.document.canvas.height * s.height, c = (Math.atan2(e.clientY - i, e.clientX - a) - Math.atan2(t.startY - i, t.startX - a)) * 180 / Math.PI;
      r.style.transform = `rotate(${(t.origins.length === 1 ? t.origins[0].rotation : 0) + c}deg)`;
    }
  }
});
window.addEventListener("pointerup", async (e) => {
  const t = j.drag;
  if (!t || e.pointerId !== t.pointerId) return;
  if (t.mode === "resize") {
    if ((t.shift !== e.shiftKey || t.alt !== e.altKey) && (t.shift = e.shiftKey, t.alt = e.altKey, t.epoch += 1, t.measurement = void 0), t.lastDelta = { x: (e.clientX - t.startX) * Zt(), y: (e.clientY - t.startY) * Zt() }, Vs(t), j.drag = null, vn = t, Va(t), await t.measurement?.pending, !xr(t) || t.invalid) {
      vn === t && Qe();
      return;
    }
    const r = sp(t, t.lastDelta.x, t.lastDelta.y);
    if (!r) {
      Qe();
      return;
    }
    if (r.x === t.bounds.x && r.y === t.bounds.y && r.width === t.bounds.width && r.height === t.bounds.height) {
      vn = null, Et(), ft();
      return;
    }
    const s = [];
    for (const { origin: a, next: i } of ap(t, r)) {
      const c = i.x - a.absoluteX, u = i.y - a.absoluteY;
      (c !== 0 || u !== 0) && s.push({ op: "move", id: a.id, dx: c, dy: u }), (i.width !== a.width || i.height !== a.height) && s.push({ op: "resize", id: a.id, width: i.width, height: i.height });
    }
    if (vn = null, !s.length) {
      Et(), ft();
      return;
    }
    zt = t.previewActive ? t.version + 1 : null, Qo = null, await xt("resize selection", s, t), delete T.canvas.dataset.resizePreview;
    return;
  }
  j.drag = null, Va(t);
  const n = Math.round(t.lastDelta?.x ?? (e.clientX - t.startX) * Zt()), o = Math.round(t.lastDelta?.y ?? (e.clientY - t.startY) * Zt());
  if (n === 0 && o === 0) {
    zt === null && Et();
    return;
  }
  if (zt = Le(j.document) + 1, Qo = t.mode === "move" ? { x: (t.adoptedDelta?.x ?? 0) + n, y: (t.adoptedDelta?.y ?? 0) + o } : null, t.mode === "move")
    xt("move selection", t.ids.map((r) => ({ op: "move", id: r, dx: n, dy: o })));
  else {
    const r = T.canvas.getBoundingClientRect(), s = r.left + (t.bounds.x + t.bounds.width / 2) / j.document.canvas.width * r.width, a = r.top + (t.bounds.y + t.bounds.height / 2) / j.document.canvas.height * r.height, i = (Math.atan2(e.clientY - a, e.clientX - s) - Math.atan2(t.startY - a, t.startX - s)) * 180 / Math.PI;
    xt("rotate selection", t.origins.map((c) => ({ op: "rotate", id: c.id, degrees: Math.round((c.rotation + i) * 10) / 10 })));
  }
});
window.addEventListener("pointercancel", (e) => {
  j.drag?.pointerId === e.pointerId && Qe();
});
window.addEventListener("lostpointercapture", (e) => {
  j.drag?.pointerId === e.pointerId && Qe();
}, !0);
window.addEventListener("blur", Qe);
function Ux(e, t, n, o, r) {
  if (!j.document) return { dx: e, dy: t };
  const s = 6 * r, a = Be($e(j.document));
  let i = n;
  if (o.length === 1) {
    const y = a.find(({ layer: D }) => D.id === o[0]), N = y ? nr(a, y.parent) : null;
    y && N && (i = ts({
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
  ], f = [0, j.document.canvas.width / 2, j.document.canvas.width], h = [0, j.document.canvas.height / 2, j.document.canvas.height], d = [];
  for (const { layer: y, parent: N } of a) {
    if (o.includes(y.id)) continue;
    const D = nr(a, N);
    if (!D) continue;
    const O = ts({
      x: y.transform.x + D.x,
      y: y.transform.y + D.y,
      width: y.transform.width,
      height: y.transform.height,
      rotation: y.transform.rotation ?? 0
    });
    d.push({
      left: O.x,
      right: O.x + O.width,
      top: O.y,
      bottom: O.y + O.height
    }), f.push(O.x, O.x + O.width / 2, O.x + O.width), h.push(O.y, O.y + O.height / 2, O.y + O.height);
  }
  const m = (y, N) => {
    let D = null;
    for (const O of y) for (const z of N) {
      const _ = z - O;
      Math.abs(_) <= s && (!D || Math.abs(_) < Math.abs(D.delta)) && (D = { delta: _, target: z });
    }
    return D;
  }, g = m(c, f), v = m(u, h);
  g && (e += g.delta, to("vertical", g.target)), v && (t += v.delta, to("horizontal", v.target));
  const w = i.x + e, x = w + i.width, E = d.filter((y) => y.right <= w + s).sort((y, N) => N.right - y.right)[0], C = d.filter((y) => y.left >= x - s).sort((y, N) => y.left - N.left)[0];
  if (E && C) {
    const N = E.right + (C.left - E.right - i.width) / 2 - w;
    Math.abs(N) <= s && (e += N, to("vertical", E.right), to("vertical", C.left));
  }
  const k = i.y + t, R = k + i.height, P = d.filter((y) => y.bottom <= k + s).sort((y, N) => N.bottom - y.bottom)[0], S = d.filter((y) => y.top >= R - s).sort((y, N) => y.top - N.top)[0];
  if (P && S) {
    const N = P.bottom + (S.top - P.bottom - i.height) / 2 - k;
    Math.abs(N) <= s && (t += N, to("horizontal", P.bottom), to("horizontal", S.top));
  }
  return { dx: e, dy: t };
}
function to(e, t) {
  if (!j.document) return;
  const n = document.createElement("div");
  n.className = `smart-guide ${e}`, e === "vertical" ? n.style.left = `${t / j.document.canvas.width * 100}%` : n.style.top = `${t / j.document.canvas.height * 100}%`, T.overlay.append(n);
}
function Sr() {
  if (!j.document) return [];
  const e = Be($e(j.document));
  return e.flatMap(({ layer: t, parent: n }) => {
    if (!j.selection.includes(t.id)) return [];
    const o = nr(e, n);
    return o ? [{
      layer: t,
      x: t.transform.x + o.x,
      y: t.transform.y + o.y,
      width: t.transform.width,
      height: t.transform.height
    }] : [];
  });
}
function Wx(e = Sr()) {
  if (e.length === 0) return null;
  if (e.length === 1) {
    const t = e[0];
    return { x: t.x, y: t.y, width: t.width, height: t.height };
  }
  return Gi(e.map((t) => ({
    x: t.x,
    y: t.y,
    width: t.width,
    height: t.height,
    rotation: t.layer.transform.rotation ?? 0
  })));
}
function cp(e = Sr()) {
  return e.length === 0 ? null : Gi(e.map((t) => ({
    x: t.x,
    y: t.y,
    width: t.width,
    height: t.height,
    rotation: t.layer.transform.rotation ?? 0
  })));
}
function To() {
  if (!j.document) return;
  const e = Zf(), t = j.zoom ?? e;
  T.canvas.style.width = `${Math.max(1, Math.round(j.document.canvas.width * t))}px`, T.canvas.style.height = `${Math.max(1, Math.round(j.document.canvas.height * t))}px`, T.zoomValue.textContent = j.zoom === null ? b("canvas.zoomFit") : `${Ee(Math.round(t * 100))}%`, T.zoomValue.title = j.zoom === null ? b("canvas.zoomFitPercent", { percent: Ee(Math.round(e * 100)) }) : b("canvas.zoomResetFit");
}
function qx() {
  const e = T.stageViewport.getBoundingClientRect();
  return {
    x: e.left + T.stageViewport.clientLeft + T.stageViewport.clientWidth / 2,
    y: e.top + T.stageViewport.clientTop + T.stageViewport.clientHeight / 2
  };
}
function Cr(e, t = qx()) {
  const n = T.canvas.getBoundingClientRect(), o = n.width > 0 ? (t.x - n.left) / n.width : 0.5, r = n.height > 0 ? (t.y - n.top) / n.height : 0.5;
  if (j.zoom = e === null ? null : Math.min(4, Math.max(0.1, e)), To(), ic(), j.zoom === null) {
    T.stageViewport.scrollLeft = 0, T.stageViewport.scrollTop = 0;
    return;
  }
  if (n.width <= 0 || n.height <= 0) return;
  const s = T.canvas.getBoundingClientRect();
  T.stageViewport.scrollLeft += s.left + o * s.width - t.x, T.stageViewport.scrollTop += s.top + r * s.height - t.y;
}
function wo(e) {
  if (!j.document || !rt(e)) return;
  T.overlay.querySelector(".inline-text-editor")?.remove();
  const t = Be($e(j.document)), n = t.find(({ layer: i }) => i.id === e.id), o = nr(t, n?.parent ?? null);
  if (!o) return;
  const r = document.createElement("textarea");
  r.className = "inline-text-editor", r.value = e.text, r.setAttribute("aria-label", b("canvas.editText")), r.dataset.i18nAttr = "aria-label:canvas.editText", r.style.left = `${(e.transform.x + o.x) / j.document.canvas.width * 100}%`, r.style.top = `${(e.transform.y + o.y) / j.document.canvas.height * 100}%`, r.style.width = `${e.transform.width / j.document.canvas.width * 100}%`, r.style.height = `${e.transform.height / j.document.canvas.height * 100}%`, r.style.transformOrigin = "center", r.style.transform = `rotate(${e.transform.rotation ?? 0}deg)`, r.style.fontFamily = e.fontFamily, r.style.fontSize = `${Math.max(12, e.fontSize * (T.canvas.getBoundingClientRect().width / j.document.canvas.width))}px`, r.style.lineHeight = String(e.lineHeight ?? 1.2), r.style.textAlign = e.align ?? "left", r.style.color = mx(e.color) ?? "#000000", T.overlay.append(r), j.editingText = { id: e.id, original: e.text }, r.focus(), r.select();
  let s = !1;
  const a = (i) => {
    if (s) return;
    s = !0;
    const c = r.value;
    r.remove(), j.editingText = null, i && c !== e.text ? oe("edit text", { op: "update", id: e.id, text: c }) : ft();
  };
  r.addEventListener("keydown", (i) => {
    i.key === "Escape" ? (i.preventDefault(), a(!1)) : i.key === "Enter" && (i.ctrlKey || i.metaKey) && (i.preventDefault(), a(!0));
  }), r.addEventListener("blur", () => a(!0));
}
function dc(e) {
  Ya(() => Kx(e));
}
function Kx(e) {
  for (const r of ua) r();
  ua = [];
  const t = Sr(), n = Wx(t);
  if (!n || e.length === 0) return;
  const o = [
    ["X", n.x, "x"],
    ["Y", n.y, "y"],
    ["W", n.width, "width"],
    ["H", n.height, "height"],
    ["°", e.length === 1 ? e[0]?.transform.rotation ?? 0 : 0, "rotation"]
  ];
  for (const [r, s, a] of o) {
    const i = ct(T.positionFields, {
      id: `position-${a}`,
      label: r,
      type: "number",
      value: String(Math.round(s * 10) / 10),
      className: "position-field-input",
      disabled: e.some((c) => !rt(c)) || a === "rotation" && e.length > 1,
      onCommit: async (c) => {
        const u = Number(c);
        if (Number.isFinite(u))
          if (a === "x" || a === "y") {
            const f = a === "x" ? u - n.x : 0, h = a === "y" ? u - n.y : 0;
            xt("position selection", e.map((d) => ({ op: "move", id: d.id, dx: f, dy: h })));
          } else if (a === "rotation" && e[0])
            oe("rotate layer", { op: "rotate", id: e[0].id, degrees: u });
          else {
            if (a === "width" && e.length === 1 && e[0]?.type === "text" && j.project)
              try {
                const d = await Of(j.project, e[0].id, u);
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
              } : $f(d, n, f), g = m.x - d.x, v = m.y - d.y;
              (g || v) && h.push({ op: "move", id: d.layer.id, dx: g, dy: v }), h.push({
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
    ua.push(i);
  }
}
let ua = [];
function _n(e) {
  const t = e ?? !Za();
  if (zp(t), !t) return;
  dc(Lt());
  const o = T.inspector.querySelector(".position-button")?.getBoundingClientRect(), r = T.inspector.getBoundingClientRect().left + 8, s = T.structure.getBoundingClientRect().left, a = (o?.right ?? r + 320) - 320;
  T.positionPopover.style.left = `${Math.max(r, Math.min(s - 332, a))}px`, T.positionPopover.style.top = `${Math.min(window.innerHeight - 520, (o?.bottom ?? 100) + 8)}px`, T.positionPopover.querySelector("[data-canvas-anchor]")?.focus();
}
const lp = "assemblash-layer-clipboard-v1";
function as() {
  if (!j.project || !j.document || j.selection.length === 0) return !1;
  const e = Be($e(j.document)), t = new Set(j.selection), n = e.filter(({ layer: o, parent: r }) => t.has(o.id) && (!r || !t.has(r))).map(({ layer: o }) => structuredClone(o));
  return sessionStorage.setItem(lp, JSON.stringify({ project: j.project, layers: n })), Se(Dt("editor.copiedLayers", n.length)), n.length > 0;
}
function up() {
  if (!j.project) return null;
  try {
    const e = JSON.parse(sessionStorage.getItem(lp) ?? "null");
    return e?.project === j.project && Array.isArray(e.layers) ? e.layers : null;
  } catch {
    return null;
  }
}
function dp() {
  const e = up();
  if (!e || !j.project) {
    Se(b("editor.nothingToPaste"), "error");
    return;
  }
  xt("paste layers", [{
    op: "insertLayerTree",
    sourceProject: j.project,
    layers: e,
    position: { at: "root" },
    offsetX: 20,
    offsetY: 20
  }]);
}
function rr(e = "delete selection") {
  const t = Lt();
  t.length === 0 || t.some((n) => !rt(n)) || xt(e, t.map((n) => ({ op: "delete", id: n.id })));
}
function Dr(e) {
  if (!j.document || j.selection.length !== 1) return;
  const t = j.selection[0], n = Be($e(j.document)), o = n.find(({ layer: u }) => u.id === t);
  if (!o || !rt(o.layer)) return;
  const r = o.parent ? n.find(({ layer: u }) => u.id === o.parent)?.layer : null, s = r?.type === "group" ? r.children ?? [] : $e(j.document), a = s.findIndex((u) => u.id === t);
  let i = a;
  if (e === "front" && (i = s.length - 1), e === "forward" && (i = Math.min(s.length - 1, a + 1)), e === "backward" && (i = Math.max(0, a - 1)), e === "back" && (i = 0), i === a) return;
  const c = o.parent ? { at: "in", parent: o.parent, index: i } : { at: "root", index: i };
  oe(`send ${e}`, { op: "reorder", id: t, to: c });
}
function sr(e, t) {
  const n = Lt(), o = n.length > 0 && n.every(rt), r = n.length === 1 ? n[0] : null, s = [], a = (c, u, f, h = !1) => {
    s.push({ kind: "item", key: c, icon: u, disabled: h, run: f });
  }, i = () => {
    s.push({ kind: "separator" });
  };
  r?.type === "text" && (a("context.editText", "ph-pencil-simple", () => wo(r), !o), i()), a("context.cut", "ph-scissors", () => {
    as() && rr("cut layers");
  }, !o), a("context.copy", "ph-copy", () => {
    as();
  }, n.length === 0), a("context.paste", "ph-clipboard-text", dp, !up()), a("context.duplicate", "ph-copy-simple", () => {
    xt("duplicate", n.map((c) => ({ op: "duplicate", id: c.id })));
  }, !o), a("context.delete", "ph-trash", rr, !o), i(), a("context.bringFront", "ph-arrow-line-up", () => Dr("front"), !r || !o), a("context.bringForward", "ph-arrow-up", () => Dr("forward"), !r || !o), a("context.sendBackward", "ph-arrow-down", () => Dr("backward"), !r || !o), a("context.sendBack", "ph-arrow-line-down", () => Dr("back"), !r || !o), i(), a("context.group", "ph-stack", () => {
    oe("group", { op: "group", ids: n.map((c) => c.id) });
  }, n.length < 2 || !o), a("context.ungroup", "ph-stack-minus", () => {
    r && oe("ungroup", { op: "ungroup", id: r.id });
  }, r?.type !== "group" || !o), a(r?.locked ? "context.unlock" : "context.lock", r?.locked ? "ph-lock-open" : "ph-lock", () => {
    r && oe(r.locked ? "unlock layer" : "lock layer", { op: "setLocked", id: r.id, locked: !r.locked });
  }, !r || bo(r, !0) !== null), a(r?.visible === !1 ? "context.show" : "context.hide", r?.visible === !1 ? "ph-eye" : "ph-eye-slash", () => {
    r && oe(r.visible === !1 ? "show layer" : "hide layer", { op: "setVisible", id: r.id, visible: r.visible === !1 });
  }, !r || !o), a("context.rename", "ph-pencil-simple", () => {
    if (!r) return;
    Io("layers");
    const c = T.layers.querySelector(`[data-id="${CSS.escape(r.id)}"]`);
    c && (c.focus(), c.dispatchEvent(new KeyboardEvent("keydown", { key: "F2", bubbles: !0 })));
  }, !r || !o), i(), a("context.alignLeft", "ph-align-left-simple", () => no("left"), !o), a("context.alignHorizontalCenters", "ph-align-center-horizontal", () => no("centerHorizontal"), !o), a("context.alignRight", "ph-align-right-simple", () => no("right"), !o), a("context.alignTop", "ph-align-top-simple", () => no("top"), !o), a("context.alignVerticalMiddles", "ph-align-center-vertical", () => no("centerVertical"), !o), a("context.alignBottom", "ph-align-bottom-simple", () => no("bottom"), !o), a("context.distributeHorizontally", "ph-columns", () => {
    oe("distribute horizontally", { op: "distribute", ids: n.map((c) => c.id), axis: "horizontal" });
  }, !o || n.length < 3), a("context.distributeVertically", "ph-rows", () => {
    oe("distribute vertically", { op: "distribute", ids: n.map((c) => c.id), axis: "vertical" });
  }, !o || n.length < 3), xn.open(s, e, t);
}
function no(e) {
  if (!j.document) return;
  const t = Lt(), n = t.map((a) => a.id);
  if (t.length !== 1) {
    oe("align selection", { op: "align", ids: n, edge: e });
    return;
  }
  const o = cp(Sr());
  if (!o) return;
  let r = 0, s = 0;
  e === "left" && (r = -o.x), e === "centerHorizontal" && (r = j.document.canvas.width / 2 - (o.x + o.width / 2)), e === "right" && (r = j.document.canvas.width - (o.x + o.width)), e === "top" && (s = -o.y), e === "centerVertical" && (s = j.document.canvas.height / 2 - (o.y + o.height / 2)), e === "bottom" && (s = j.document.canvas.height - (o.y + o.height)), (r !== 0 || s !== 0) && oe("align layer to canvas", { op: "move", id: t[0].id, dx: r, dy: s });
}
function fp(e) {
  Qe(), Oe("open", () => mc(e));
}
const fc = /* @__PURE__ */ new Map();
function pc(e) {
  return e.record.state.document?.name ?? fc.get(e.id) ?? e.id;
}
const Xx = Mw({
  activate: (e) => {
    ke.active?.id !== e && (Qe(), Oe("switch tab", () => mc(e)));
  },
  close: (e) => {
    Qe(), Oe("close tab", () => Yx(e));
  },
  move: (e, t) => {
    ke.move(e, t) && (Gt(), Sn());
  }
}, J("project-tabs-root"));
function Gt() {
  Xx.setTabs(ke.all.map((e) => ({
    id: e.id,
    name: pc(e),
    active: e === ke.active,
    changed: e.changed
  })));
}
function Sn() {
  pb(ke.serialize()).catch((e) => {
    console.error("could not save the open tabs", e);
  });
}
function hc() {
  const e = ke.active;
  if (!e) return;
  const t = e.record;
  Qe(), t.scroll = { left: T.stageViewport.scrollLeft, top: T.stageViewport.scrollTop }, t.layerQuery = er, t.historySnapshot = br, t.activeDock = wr, t.addSection = T.addPanel.classList.contains("collapsed") ? null : vc, t.templateDraft = $t.draft(), j.drag = null, xn.close(), _n(!1), Et(), pp(), _a++, Fa++, Ba++, fn.clear();
}
function pp() {
  const e = T.canvasImage.src;
  T.canvasImage.removeAttribute("src"), delete T.canvasImage.dataset.previewName, e.startsWith("blob:") && URL.revokeObjectURL(e), sc = null;
}
function uo(e) {
  ke.activate(e?.id ?? null);
  const t = e?.record;
  if (j = t?.state ?? Qi(null), er = t?.layerQuery ?? "", br = t?.historySnapshot ?? null, wr = t?.activeDock ?? "layers", nc.setCurrentProject(e?.id ?? null), t && t.addSection !== void 0) {
    if (t.addSection === null) Ao();
    else if (t.addSection !== vc || T.addPanel.classList.contains("collapsed")) {
      const n = Ua.find(([o]) => o === t.addSection);
      n && Po(n[0], n[2]);
    }
  }
  Gt();
}
async function mc(e) {
  const t = ke.active;
  if (t && t.id === e) {
    j.selection = [], Et(), await Ha();
    return;
  }
  if (hc(), e === null) {
    uo(null), Vo(), Sn();
    return;
  }
  const n = ke.find(e);
  if (n) {
    await ar(n), Sn();
    return;
  }
  const { entry: o } = ke.open(e, () => Hf(e));
  try {
    uo(o), await Ha();
  } catch (r) {
    throw ke.close(o.id), uo(null), t && ke.has(t.id) ? await ar(t).catch(() => Vo()) : Vo(), r;
  }
  Gt(), Sn();
}
async function ar(e) {
  uo(e);
  const t = e.record;
  if (!j.document) {
    await Ha(t.templateDraft);
    return;
  }
  try {
    await Ge();
  } catch (n) {
    throw Vn(j.document), n;
  }
  To(), T.stageViewport.scrollLeft = t.scroll.left, T.stageViewport.scrollTop = t.scroll.top, await $t.projectChanged(t.templateDraft), gc(), Gt(), Se(b("projects.opened", { name: pc(e) }));
}
async function Yx(e) {
  const t = ke.find(e);
  if (!t) return;
  const n = pc(t), o = ke.active === t;
  o && hc();
  const { next: r } = ke.close(e);
  Gt(), Sn(), o && await Hr?.catch(() => {
  }), await hb(e), o && (r ? await ar(r) : (uo(null), Vo())), Se(b("tabs.closed", { name: n }));
}
async function Gx(e) {
  const t = ke.find(e);
  if (!t) return;
  const n = ke.active === t;
  n && hc();
  const { next: o } = ke.close(e);
  n && (o ? await ar(o) : (uo(null), Vo())), Gt(), Sn();
}
async function Jx(e) {
  let t;
  try {
    t = Aw(await fb());
  } catch (o) {
    console.error("could not read the open tabs", o);
    return;
  }
  for (const o of t.projects)
    if (!(!e.has(o) || ke.has(o)))
      try {
        const r = await yr(o), { entry: s } = ke.open(o, () => Hf(o));
        s.record.state.document = r;
      } catch (r) {
        console.error(`could not restore the tab of ${o}`, r);
      }
  if (ke.size === 0) return;
  const n = ke.find(t.active) ?? ke.all[0];
  try {
    await ar(n);
  } catch (o) {
    rn("open", o);
  }
  Gt(), Sn();
}
function gc() {
  T.renameProject.disabled = !j.project, T.deleteProject.disabled = !j.project, T.reload.disabled = !j.project;
}
async function Ha(e = null) {
  try {
    await Ge();
  } catch (t) {
    const n = t instanceof Ye ? t.details : null, o = n && typeof n.pid == "number" ? n.pid : null;
    if (!(t instanceof Ye) || t.code !== "projectLocked" || o === null || !j.project)
      throw t;
    const r = fc.get(j.project) ?? j.project;
    if (!window.confirm(b("projects.recoverLockConfirm", { pid: o, tab: r }))) throw t;
    await db(j.project, o), await Ge(), Se(b("projects.recovered"));
  }
  if (await $t.projectChanged(e), gc(), Gt(), Se(b("projects.opened", { name: j.document?.name ?? j.project ?? "" })), j.project)
    try {
      const t = await ab(j.project);
      if (t.reclaimedLock) {
        const { pid: n, host: o } = t.reclaimedLock;
        Se(
          b("projects.reclaimedLock", { pid: n, host: o })
        );
      }
    } catch (t) {
      console.error("could not check for an automatically reclaimed lock", t);
    }
}
T.reload.addEventListener("click", () => {
  Oe("reload", async () => {
    await Ge(), Se(b("projects.refreshed"));
  });
});
T.newProject.addEventListener("click", () => jx.open());
T.emptyCreate.addEventListener("click", () => T.newProject.click());
T.agents.addEventListener("click", () => {
  Xf.open();
});
const Ua = [
  ["add-text-section", "toolbar.textButton", T.addText],
  ["add-shape-section", "toolbar.elementsButton", T.addShape],
  ["add-upload-section", "toolbar.uploadsButton", T.addImage],
  ["add-template-section", "toolbar.templatesButton", T.templatesToggle],
  ["add-fonts-section", "toolbar.fontsButton", T.selectTool]
];
function hp(e) {
  for (const t of [T.selectTool, T.addText, T.addShape, T.addImage, T.templatesToggle]) {
    const n = t === e;
    t.classList.toggle("active", n), t.setAttribute("aria-pressed", String(n));
  }
}
let vc = null;
function Po(e = "add-text-section", t = T.addText) {
  vc = e, e !== "add-fonts-section" && yo.releaseSamples(), T.addPanel.classList.remove("collapsed"), T.structure.classList.remove("mobile-open"), T.dockToggle.setAttribute("aria-expanded", "false"), $t.setOpen(!1);
  const n = Ua.find(([r]) => r === e)?.[1] ?? "toolbar.textButton";
  T.addPanelTitle.dataset.i18n = n, T.addPanelTitle.textContent = b(n);
  for (const [r] of Ua) {
    const s = document.getElementById(r);
    s && (s.hidden = r !== e);
  }
  const o = e === "add-template-section";
  $t.setOpen(o && $t.isVisible()), T.openTemplates.hidden = o && $t.isVisible(), T.addPanel.scrollTop = 0, hp(t);
}
function Ao() {
  yo.releaseSamples(), T.addPanel.classList.add("collapsed"), hp(T.selectTool);
}
T.addPanelClose.addEventListener("click", Ao);
T.addText.addEventListener("click", () => Po("add-text-section", T.addText));
T.addShape.addEventListener("click", () => Po("add-shape-section", T.addShape));
T.addImage.addEventListener("click", () => Po("add-upload-section", T.addImage));
T.templatesToggle.addEventListener("click", () => Po("add-template-section", T.templatesToggle));
async function yc(e = !1) {
  Po("add-fonts-section", T.selectTool), await yo.reload(), e && yo.focusInstall();
}
async function Zx(e) {
  const n = (await Ob())[0];
  if (!n) {
    Se(b("fonts.noneInstalled"), "error"), await yc(!0);
    return;
  }
  if (!j.project || !j.document) return;
  const o = {
    plain: { text: "Add text", fontSize: 24, width: 460, height: 80 },
    heading: { text: "Add a heading", fontSize: 64, width: 600, height: 100 },
    subheading: { text: "Add a subheading", fontSize: 36, width: 520, height: 64 },
    body: { text: "Add body text", fontSize: 22, width: 460, height: 120 }
  }[e], r = {
    x: Math.round((j.document.canvas.width - o.width) / 2),
    y: Math.round((j.document.canvas.height - o.height) / 2),
    width: o.width,
    height: o.height
  }, a = (await Bn(
    j.project,
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
    Le(j.document)
  )).created?.[0];
  a && (j.selection = [a]);
  const i = { plain: "text.plain", heading: "text.heading", subheading: "text.subheading", body: "text.body" }[e];
  Se(b("editor.addedText", { preset: b(i) })), await Ge();
  const c = rc();
  c?.type === "text" && wo(c);
}
async function Qx(e) {
  if (!j.project || !j.document) return;
  const t = {
    rect: { width: 320, height: 240 },
    ellipse: { width: 320, height: 240 },
    line: { width: 400, height: 24 }
  }[e], n = {
    x: Math.round((j.document.canvas.width - t.width) / 2),
    y: Math.round((j.document.canvas.height - t.height) / 2),
    width: t.width,
    height: t.height
  }, o = e === "line" ? { stroke: { color: qf, width: Kf } } : { fill: ec }, r = e === "rect" ? { kind: "rect", cornerRadius: 0 } : { kind: e }, a = (await Bn(
    j.project,
    {
      op: "create",
      position: { at: "root" },
      transform: n,
      type: "shape",
      shape: r,
      ...o
    },
    Le(j.document)
  )).created?.[0];
  a && (j.selection = [a]);
  const i = { rect: "shapes.rectangle", ellipse: "shapes.ellipse", line: "shapes.line" }[e];
  Se(b("editor.addedShape", { kind: b(i) })), await Ge();
}
async function e0(e) {
  if (!j.project || !j.document) return;
  const t = 320, n = 240, o = {
    x: Math.round((j.document.canvas.width - t) / 2),
    y: Math.round((j.document.canvas.height - n) / 2),
    width: t,
    height: n
  }, s = (await Bn(
    j.project,
    {
      op: "create",
      position: { at: "root" },
      transform: o,
      type: "shape",
      shape: { kind: "path", d: e },
      fill: ec
    },
    Le(j.document)
  )).created?.[0];
  s && (j.selection = [s]), Se(b("editor.addedPath")), await Ge();
}
T.addPanel.addEventListener("click", (e) => {
  const t = e.target, o = t.closest("[data-text-preset]")?.dataset.textPreset;
  o && Oe(`add ${o}`, () => Zx(o));
  const r = t.closest("[data-shape]")?.dataset.shape;
  (r === "rect" || r === "ellipse" || r === "line") && Oe(`add ${r}`, () => Qx(r)), r === "path" && Fs("editor.addPathTitle", "editor.pathDataLabel", "editor.addPathButton", (s) => {
    Oe("add path", () => e0(s));
  });
});
T.undo.addEventListener("click", () => {
  Oe("undo", async () => {
    if (!j.project) return;
    const e = await vb(j.project);
    Se(b("status.undoDone", { version: e.version })), await Ge();
  });
});
T.redo.addEventListener("click", () => {
  Oe("redo", async () => {
    if (!j.project) return;
    const e = await yb(j.project);
    Se(b("status.redoDone", { version: e.version })), await Ge();
  });
});
T.exportButton.addEventListener("click", () => Cx.open());
Bp((e) => Wa(
  e,
  e.type === "image/svg+xml" || e.name.toLowerCase().endsWith(".svg") ? "svg" : "image"
));
function Wa(e, t, n) {
  e && Oe(t === "svg" ? "add vector" : "add image", async () => {
    if (!(!j.project || !j.document)) {
      T.uploadFeedback.textContent = b("uploads.uploading", { name: e.name });
      try {
        const o = await Yi(j.project, e), r = o.asset.mediaType === "image/svg+xml" || t === "svg", { width: s, height: a } = Zb(
          o.asset,
          j.document.canvas
        ), i = Math.round(n?.x ?? (j.document.canvas.width - s) / 2), c = Math.round(n?.y ?? (j.document.canvas.height - a) / 2), u = r ? {
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
        }, f = await Bn(
          j.project,
          u,
          o.version
        );
        f.created?.length && (j.selection = f.created), Se(b("uploads.addedVersion", { name: e.name, version: f.version })), T.uploadFeedback.textContent = b("uploads.added", { name: e.name }), await Ge();
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
  if (!t || !j.document) return;
  const n = T.canvas.getBoundingClientRect();
  if (e.clientX < n.left || e.clientX > n.right || e.clientY < n.top || e.clientY > n.bottom) {
    Wa(t, t.type === "image/svg+xml" ? "svg" : "image");
    return;
  }
  const o = {
    x: (e.clientX - n.left) / n.width * j.document.canvas.width - 150,
    y: (e.clientY - n.top) / n.height * j.document.canvas.height - 100
  };
  Wa(t, t.type === "image/svg+xml" ? "svg" : "image", o);
});
function Io(e) {
  wr = e, Nt();
}
T.historyShortcut.addEventListener("click", () => Io("history"));
T.dockToggle.addEventListener("click", () => {
  const e = T.structure.classList.toggle("mobile-open");
  T.dockToggle.setAttribute("aria-expanded", String(e)), e && (Ao(), T.layersTab.focus());
});
T.selectTool.addEventListener("click", () => {
  j.document && (Ao(), $t.setOpen(!1), T.structure.classList.remove("mobile-open"), T.dockToggle.setAttribute("aria-expanded", "false"), T.canvas.focus());
});
T.positionClose.addEventListener("click", () => _n(!1));
T.positionPopover.addEventListener("click", (e) => {
  const t = e.target.closest(
    "[data-canvas-anchor], [data-layout]"
  ), n = t?.dataset.canvasAnchor;
  if (n && !t.disabled && j.selection.length > 0 && j.document) {
    const a = Sr(), i = cp(a);
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
    const f = [], h = u.horizontal === "left" ? 0 : u.horizontal === "right" ? j.document.canvas.width - i.width : (j.document.canvas.width - i.width) / 2, d = u.vertical === "top" ? 0 : u.vertical === "bottom" ? j.document.canvas.height - i.height : (j.document.canvas.height - i.height) / 2;
    for (const m of Lt())
      f.push({ op: "move", id: m.id, dx: h - i.x, dy: d - i.y });
    _n(!1), Bx(`place layer ${t.title.toLowerCase()}`, f);
    return;
  }
  const o = t?.dataset.layout;
  if (!o || t.disabled || j.selection.length === 0) return;
  const r = [...j.selection];
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
  s && (_n(!1), oe("arrange layers", s));
});
document.addEventListener("pointerdown", (e) => {
  const t = e.target;
  Za() && !T.positionPopover.contains(t) && !T.inspector.contains(t) && _n(!1), xn.isOpen() && !T.contextMenu.contains(t) && xn.close();
});
T.openTemplates.addEventListener("click", () => {
  if (!$t.isVisible()) {
    Se(b("editor.noSlotsHint")), Ao(), Io("properties"), window.matchMedia("(max-width: 1024px)").matches && (T.structure.classList.add("mobile-open"), T.dockToggle.setAttribute("aria-expanded", "true"));
    return;
  }
  $t.setOpen(!0), T.openTemplates.hidden = !0, T.templatesPanel.scrollIntoView({ block: "nearest" });
});
T.templatesClose.addEventListener("click", () => {
  $t.setOpen(!1), T.openTemplates.hidden = !1;
});
T.zoomOut.addEventListener("click", () => Cr(Bs() / 1.2));
T.zoomIn.addEventListener("click", () => Cr(Bs() * 1.2));
T.zoomValue.addEventListener("click", () => Cr(null));
T.zoom100.addEventListener("click", () => Cr(1));
T.stageViewport.addEventListener("wheel", (e) => {
  if (!(e.ctrlKey || e.metaKey)) return;
  e.preventDefault();
  const t = e.deltaMode === WheelEvent.DOM_DELTA_LINE ? e.deltaY * 16 : e.deltaMode === WheelEvent.DOM_DELTA_PAGE ? e.deltaY * T.stageViewport.clientHeight : e.deltaY, n = Math.exp(-t * Math.log(1.1) / 100);
  Cr(Bs() * n, { x: e.clientX, y: e.clientY });
}, { passive: !1 });
function mp() {
  window.matchMedia("(max-width: 1024px)").matches ? (T.structure.classList.remove("mobile-open"), T.dockToggle.setAttribute("aria-expanded", "false"), yo.releaseSamples(), T.addPanel.classList.add("collapsed")) : (T.structure.classList.remove("mobile-open"), T.dockToggle.setAttribute("aria-expanded", "true"));
}
window.addEventListener("resize", () => {
  j.zoom === null && To(), ic(), mp();
});
const t0 = new ResizeObserver(() => {
  j.zoom === null && To(), ic();
});
t0.observe(T.stageViewport);
mp();
let jr = !1, _o = null;
window.addEventListener("keyup", (e) => {
  ip(e) || e.code === "Space" && (jr = !1, T.stageViewport.classList.remove("pan-ready"));
});
window.addEventListener("blur", () => {
  jr = !1, T.stageViewport.classList.remove("pan-ready"), _o?.();
});
T.stageViewport.addEventListener("pointerdown", (e) => {
  if (e.button !== 1 && !(jr && e.button === 0)) return;
  e.preventDefault(), e.stopPropagation(), _o?.();
  const t = { x: e.clientX, y: e.clientY }, n = { x: T.stageViewport.scrollLeft, y: T.stageViewport.scrollTop };
  T.stageViewport.classList.add("panning");
  const o = (a) => {
    a.pointerId === e.pointerId && (T.stageViewport.scrollLeft = n.x - (a.clientX - t.x), T.stageViewport.scrollTop = n.y - (a.clientY - t.y));
  }, r = () => {
    window.removeEventListener("pointermove", o), window.removeEventListener("pointerup", s), window.removeEventListener("pointercancel", s), window.removeEventListener("blur", r), T.stageViewport.classList.remove("panning"), _o === r && (_o = null);
  }, s = (a) => {
    a.pointerId === e.pointerId && r();
  };
  _o = r, window.addEventListener("pointermove", o), window.addEventListener("pointerup", s), window.addEventListener("pointercancel", s), window.addEventListener("blur", r, { once: !0 });
}, { capture: !0 });
T.overlay.addEventListener("pointerdown", (e) => {
  if (jr || e.target !== T.overlay || e.button !== 0 || !j.document) return;
  e.preventDefault();
  const t = T.canvas.getBoundingClientRect(), n = (c) => Math.min(t.right, Math.max(t.left, c)), o = (c) => Math.min(t.bottom, Math.max(t.top, c)), r = { x: n(e.clientX), y: o(e.clientY) }, s = document.createElement("div");
  s.className = "selection-marquee", T.overlay.append(s);
  const a = (c) => {
    const u = n(c.clientX), f = o(c.clientY), h = Math.min(r.x, u), d = Math.min(r.y, f), m = Math.max(r.x, u), g = Math.max(r.y, f);
    s.style.left = `${(h - t.left) / t.width * 100}%`, s.style.top = `${(d - t.top) / t.height * 100}%`, s.style.width = `${(m - h) / t.width * 100}%`, s.style.height = `${(g - d) / t.height * 100}%`;
  }, i = (c) => {
    window.removeEventListener("pointermove", a), window.removeEventListener("pointerup", i);
    const u = n(c.clientX), f = o(c.clientY), h = {
      left: Math.min(r.x, u),
      top: Math.min(r.y, f),
      right: Math.max(r.x, u),
      bottom: Math.max(r.y, f)
    }, d = [...T.overlay.querySelectorAll(".layer-hitbox")].filter((m) => {
      const g = m.getBoundingClientRect();
      return g.right >= h.left && g.left <= h.right && g.bottom >= h.top && g.top <= h.bottom;
    }).map((m) => m.dataset.id).filter((m) => !!m);
    j.selection = e.shiftKey ? [.../* @__PURE__ */ new Set([...j.selection, ...d])] : d, Nt(), lt(), ft();
  };
  window.addEventListener("pointermove", a), window.addEventListener("pointerup", i);
});
function n0(e) {
  const t = e;
  return t ? t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable : !1;
}
window.addEventListener("keydown", (e) => {
  if (ip(e)) return;
  if (e.key === "Escape" && vn) {
    e.preventDefault(), Qe();
    return;
  }
  if (n0(e.target) || e.target instanceof Element && e.target.closest("button[data-text-align]") && (e.key === "Enter" || e.code === "Space")) return;
  const t = e.ctrlKey || e.metaKey;
  if (e.code === "Space") {
    jr = !0, T.stageViewport.classList.add("pan-ready"), e.preventDefault();
    return;
  }
  if (t && e.key.toLowerCase() === "z") {
    e.preventDefault(), (e.shiftKey ? T.redo : T.undo).click();
    return;
  }
  const n = e.key.toLowerCase();
  if (t && n === "c") {
    e.preventDefault(), as();
    return;
  }
  if (t && n === "x") {
    e.preventDefault(), Lt().every(rt) && as() && rr("cut layers");
    return;
  }
  if (t && n === "v") {
    e.preventDefault(), dp();
    return;
  }
  if (t && n === "d") {
    e.preventDefault();
    const c = Lt();
    c.length && c.every(rt) && xt("duplicate", c.map((u) => ({ op: "duplicate", id: u.id })));
    return;
  }
  if (t && n === "g") {
    e.preventDefault();
    const c = Lt();
    if (e.shiftKey) {
      const u = c.length === 1 && c[0]?.type === "group" ? c[0] : null;
      u && oe("ungroup", { op: "ungroup", id: u.id });
    } else c.length > 1 && c.every(rt) && oe("group", { op: "group", ids: c.map((u) => u.id) });
    return;
  }
  if (e.key === "F10" && e.shiftKey) {
    e.preventDefault();
    const c = T.canvas.getBoundingClientRect();
    sr(c.left + c.width / 2, c.top + c.height / 2);
    return;
  }
  if (e.key === "Escape") {
    if (xn.isOpen()) {
      xn.close(), T.canvas.focus();
      return;
    }
    if (Ft.isOpen()) {
      Ft.close();
      return;
    }
    if (!T.addPanel.classList.contains("collapsed")) {
      e.preventDefault(), Ao();
      return;
    }
    j.selection = [], xn.close(), _n(!1), Nt(), ft(), lt();
    return;
  }
  const o = rc(), r = Lt();
  if ((e.key === "Enter" || e.key === "F2") && o?.type === "text" && rt(o)) {
    e.preventDefault(), wo(o);
    return;
  }
  if (r.length === 0 || r.some((c) => !rt(c))) return;
  if (e.key === "Delete" || e.key === "Backspace") {
    e.preventDefault(), rr();
    return;
  }
  const s = e.shiftKey ? 10 : 1, i = {
    ArrowLeft: [-s, 0],
    ArrowRight: [s, 0],
    ArrowUp: [0, -s],
    ArrowDown: [0, s]
  }[e.key];
  i && (e.preventDefault(), xt("nudge selection", r.map((c) => ({
    op: "move",
    id: c.id,
    dx: i[0],
    dy: i[1]
  }))));
});
function Vo() {
  Qe(), Qa(null), T.canvas.hidden = !0, T.canvasControlsRoot.hidden = !0, T.canvasHints.hidden = !0, pp(), T.canvasEmpty.hidden = !1, gc(), T.undo.disabled = !0, T.redo.disabled = !0, T.version.textContent = "–", Nt(), ft(), lt();
}
function gp(e, t) {
  Fs("projects.renameTitle", "common.name", "projects.rename", (n) => {
    Oe("rename project", async () => {
      const o = await lb(e, n);
      Se(b("projects.renamed", { oldName: t ?? e, newName: n }));
      const r = ke.find(e);
      r && ke.rename(e, o.project) && (r.record.state.project = o.project, Sn()), await kr(), r && ke.active === r && (nc.setCurrentProject(o.project), await Ge()), Gt();
    });
  });
}
function vp(e, t) {
  const n = t ?? e, o = b("projects.deleteConfirm", { name: n });
  window.confirm(o) && Oe("delete project", async () => {
    await ub(e), await Gx(e), Se(b("projects.deleted", { name: n })), await kr();
  });
}
T.renameProject.addEventListener("click", () => {
  const e = j.project;
  e && (Ft.isOpen() && Ft.close(), gp(e, j.document?.name ?? null));
});
T.deleteProject.addEventListener("click", () => {
  const e = j.project;
  e && (Ft.isOpen() && Ft.close(), vp(e, j.document?.name ?? null));
});
async function kr(e) {
  e && (T.search.value = "");
  const t = T.search.value.trim(), n = await If(t);
  return yp(n, t), e && await mc(e), await wp(), n;
}
function yp(e, t) {
  bc = bp(e);
  for (const n of e) n.name && fc.set(n.id, n.name);
  nc.setProjects(e, t, j.project);
}
const o0 = 1500;
let bc = "";
function bp(e) {
  return e.map((t) => `${t.id}\0${t.name ?? ""}\0${t.layers}`).join(`
`);
}
let Ul = !0;
async function qa() {
  if (Ul)
    try {
      const { count: e } = await Cb();
      wc(e);
    } catch (e) {
      e instanceof Ye && e.code.startsWith("http4") && (Ul = !1, wc(null));
    }
}
let Qt = null;
function r0(e) {
  return e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement || e instanceof HTMLElement && e.isContentEditable;
}
document.addEventListener("input", (e) => {
  e.target !== T.search && r0(e.target) && (Qt = e.target);
}, !0);
document.addEventListener("change", (e) => {
  e.target === Qt && (Qt = null);
}, !0);
document.addEventListener("focusout", (e) => {
  e.target === Qt && (Qt = null);
}, !0);
function s0() {
  return Qt instanceof Node && !Qt.isConnected && (Qt = null), Qt !== null;
}
function Wl() {
  return document.visibilityState === "visible" && !Uf && !j.drag && !j.editingText && !s0() && !document.body.classList.contains("stopped");
}
let da = !1;
async function a0() {
  if (!(da || !Wl())) {
    if (!La()) {
      qa();
      return;
    }
    da = !0;
    try {
      const e = T.search.value.trim(), t = await If(e);
      if (!Wl()) return;
      qa(), bp(t) !== bc && document.activeElement !== document.getElementById("project-search") && (yp(t, e), j.project || wp().catch(() => {
      })), i0(t);
      const n = j.project, o = t.find((s) => s.id === n), r = j.document;
      if (!n || !o || !r || o.documentId !== r.id || o.version === Le(r)) return;
      Oe("follow", async () => {
        j.project !== n || j.drag || j.editingText || await Ge();
      });
    } catch {
    } finally {
      da = !1;
    }
  }
}
function i0(e) {
  for (const t of ke.all) {
    if (t === ke.active) continue;
    const n = t.record.state.document, o = e.find((r) => r.id === t.id);
    !n || !o || o.documentId !== n.id || o.version === Le(n) || Oe("follow tab", async () => {
      if (ke.active === t || !ke.all.includes(t)) return;
      const r = await yr(t.id);
      if (ke.active === t || !ke.all.includes(t)) return;
      const s = t.record;
      s.state.document = r, s.state.selection = s.state.selection.filter(
        (a) => Be($e(r)).some(({ layer: i }) => i.id === a)
      ), s.historySnapshot = null, ke.markChanged(t.id), Gt();
    });
  }
}
window.setInterval(() => {
  a0();
}, o0);
let fa = [], pa = 0;
async function wp() {
  const e = ++pa;
  for (const o of fa) URL.revokeObjectURL(o);
  fa = [];
  const t = await sb(8);
  if (e !== pa) return;
  const n = await Promise.all(t.map(async (o) => {
    try {
      return { project: o, thumbnail: await vo(ib(o.id)) };
    } catch {
      return { project: o, thumbnail: null };
    }
  }));
  if (e !== pa) {
    for (const { thumbnail: o } of n) o && URL.revokeObjectURL(o);
    return;
  }
  fa = n.flatMap(({ thumbnail: o }) => o ? [o] : []), Fp(
    T.recents,
    n,
    (o) => fp(o),
    (o, r) => gp(o, r),
    (o, r) => vp(o, r)
  );
}
T.shutdown.addEventListener("click", () => {
  window.confirm(b("projects.stopConfirm")) && Oe("stop", async () => {
    await wb(), T.shutdown.disabled = !0, document.body.classList.add("stopped"), Se(b("app.stopped"));
  });
});
Oe("start", async () => {
  const e = await xb();
  T.shutdown.hidden = !e.canShutdown;
  try {
    await yo.reload();
  } catch {
  }
  const t = await kr();
  await Jx(new Set(t.map((n) => n.id))), qa(), Gf(), Se(b("status.ready", { version: e.version })), !bc && !T.search.value.trim() && Xf.offerOnFirstRun();
});
