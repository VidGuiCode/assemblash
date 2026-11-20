import { r as p, F as Pp, H as Cn, t as qo, v as qt, R as hn, M as Ap, J as Ip, f as se, u as Z, w as Ja, y as lr, K as Za, j as l, B as Q, N as Ql, a as De, c as ze, o as Ae, z as ls, d as on, b as ur, O as eu, n as Tt, x as Ko, P as ho, l as tu, E as Mp, Q as Dp, V as Op, W as Lp, I as $p, C as zp, U as $n, X as En, g as at, h as _e, Y as qr, Z as us, _ as Co, e as nu, $ as _p, A as Ho, L as Fp, m as Ue, i as Fe, T as ee, S as ye, k as ce, G as Ne, a0 as Bp, a1 as Qa } from "./chunk-mantine-root.js";
import { m as ou, i as ru, c as Gt, u as Ve, O as ei, a as su, g as jo, b as au, S as ti, s as Vp, d as Hp, e as Up, p as ni, f as Wp, h as iu, j as qp, k as Kp, l as cu, n as jc, o as Xp, q as oi, r as Yp } from "./chunk-main.js";
import { a as Qe, u as Vt, C as ri, I as Rt, b as Gp, d as Jp, c as St, r as kc, T as Ec } from "./chunk-Title.js";
import { t as y, formatNumber as Re, formatCount as Ot, getLocale as si, setLocale as Zp } from "./i18n.js";
function Kr(e, t) {
  return (n) => {
    if (typeof n != "string" || n.trim().length === 0) throw new Error(t);
    return `${e}-${n}`;
  };
}
function Xo(e, t) {
  let n = e;
  for (; (n = n.parentElement) && !n.matches(t); ) ;
  return n;
}
function Rc(e, t, n) {
  for (let o = e - 1; o >= 0; o -= 1) if (!t[o].disabled) return o;
  if (n) {
    for (let o = t.length - 1; o > -1; o -= 1) if (!t[o].disabled) return o;
  }
  return e;
}
function Nc(e, t, n) {
  for (let o = e + 1; o < t.length; o += 1) if (!t[o].disabled) return o;
  if (n) {
    for (let o = 0; o < t.length; o += 1) if (!t[o].disabled) return o;
  }
  return e;
}
function Qp(e, t, n) {
  return Xo(e, n) === Xo(t, n);
}
function lu({ parentSelector: e, siblingSelector: t, onKeyDown: n, loop: o = !0, activateOnFocus: r = !1, dir: s = "rtl", orientation: a }) {
  return (i) => {
    n?.(i);
    const c = Array.from(Xo(i.currentTarget, e)?.querySelectorAll(t) || []).filter((g) => Qp(i.currentTarget, g, e)), u = c.findIndex((g) => i.currentTarget === g), f = Nc(u, c, o), h = Rc(u, c, o), d = s === "rtl" ? h : f, m = s === "rtl" ? f : h;
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
        i.stopPropagation(), i.preventDefault(), c[Nc(-1, c, !1)]?.focus();
        break;
      case "End":
        i.stopPropagation(), i.preventDefault(), c[Rc(c.length, c, !1)]?.focus();
    }
  };
}
const Xr = () => {
};
function eh(e, t = { active: !0 }) {
  return typeof e != "function" || !t.active ? t.onKeyDown || Xr : (n) => {
    n.key === "Escape" && (e(n), t.onTrigger?.());
  };
}
function Jn(e, t) {
  return (n) => {
    e?.(n), t?.(n);
  };
}
function wn(e, t, n) {
  return t === void 0 && n === void 0 ? e : t !== void 0 && n === void 0 ? Math.max(e, t) : Math.min(t === void 0 && n !== void 0 ? e : Math.max(e, t), n);
}
function th(e, t) {
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
function ao(e) {
  const t = p.useRef(e);
  return p.useEffect(() => {
    t.current = e;
  }), p.useMemo(() => ((...n) => t.current?.(...n)), []);
}
function ds(e, t) {
  const { delay: n, flushOnUnmount: o, leading: r, maxWait: s } = typeof t == "number" ? {
    delay: t,
    flushOnUnmount: !1,
    leading: !1,
    maxWait: void 0
  } : t, a = ao(e), i = p.useRef(0), c = p.useRef(0), u = p.useRef(null), f = p.useMemo(() => {
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
        }, j = () => {
          g();
        };
        h.flush = C, h.cancel = j, i.current = window.setTimeout(E, n), v();
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
        const j = () => {
          g();
        };
        i.current = window.setTimeout(j, n), v();
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
const nh = ["mousedown", "touchstart"];
function uu(e, t, n, o = !0, r = !1) {
  const s = p.useRef(null), a = t || nh, i = p.useEffectEvent((u) => {
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
function oh(e, t) {
  return Pp("(prefers-color-scheme: dark)", e === "dark", t) ? "dark" : "light";
}
function du({ opened: e, shouldReturnFocus: t = !0 }) {
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
const rh = /input|select|textarea|button|object/, fu = "a, input, select, textarea, button, object, [tabindex]";
function sh(e) {
  return e.style.display === "none";
}
function ah(e) {
  if (e.getAttribute("aria-hidden") || e.getAttribute("hidden") || e.getAttribute("type") === "hidden") return !1;
  let t = e;
  for (; t && !(t === document.body || t.nodeType === 11); ) {
    if (sh(t)) return !1;
    t = t.parentNode;
  }
  return !0;
}
function pu(e) {
  let t = e.getAttribute("tabindex");
  return t === null && (t = void 0), parseInt(t, 10);
}
function ba(e) {
  const t = e.nodeName.toLowerCase(), n = !Number.isNaN(pu(e));
  return (rh.test(t) && !e.disabled || e instanceof HTMLAnchorElement && e.href || n) && ah(e);
}
function hu(e) {
  const t = pu(e);
  return (Number.isNaN(t) || t >= 0) && ba(e);
}
function ih(e) {
  return Array.from(e.querySelectorAll(fu)).filter(hu);
}
function ch(e, t) {
  const n = ih(e);
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
function lh(e = !0) {
  const t = p.useRef(null), n = (r) => {
    let s = r.querySelector("[data-autofocus]");
    if (!s) {
      const a = Array.from(r.querySelectorAll(fu));
      s = a.find(hu) || a.find(ba) || null, !s && ba(r) && (s = r);
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
      s.key === "Tab" && t.current && ch(t.current, s);
    };
    return document.addEventListener("keydown", r), () => document.removeEventListener("keydown", r);
  }, [e]), o;
}
const uh = (e) => (e + 1) % 1e6;
function dh() {
  const [, e] = p.useReducer(uh, 0);
  return e;
}
function fh(e, t, n) {
  const o = p.useEffectEvent(t);
  p.useEffect(() => (window.addEventListener(e, o, n), () => window.removeEventListener(e, o, n)), [e]);
}
function mu(e) {
  return {
    x: wn(e.x, 0, 1),
    y: wn(e.y, 0, 1)
  };
}
function gu(e, t, n = "ltr") {
  const o = p.useRef(!1), r = p.useRef(!1), s = p.useRef(0), a = p.useRef(null), [i, c] = p.useState(!1);
  return p.useEffect(() => (o.current = !0, () => {
    a.current?.();
  }), []), {
    ref: p.useCallback((u) => {
      const f = ({ x: C, y: j }) => {
        cancelAnimationFrame(s.current), s.current = requestAnimationFrame(() => {
          if (o.current && u) {
            u.style.userSelect = "none";
            const R = u.getBoundingClientRect();
            if (R.width && R.height) {
              const T = wn((C - R.left) / R.width, 0, 1);
              e({
                x: n === "ltr" ? T : 1 - T,
                y: wn((j - R.top) / R.height, 0, 1)
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
function ph(e, t) {
  if (!e || !t) return !1;
  if (e === t) return !0;
  if (e.length !== t.length) return !1;
  for (let n = 0; n < e.length; n += 1) if (!th(e[n], t[n])) return !1;
  return !0;
}
function hh(e) {
  const t = p.useRef([]), n = p.useRef(0);
  return ph(t.current, e) || (t.current = e, n.current += 1), [n.current];
}
function Tc(e, t) {
  p.useEffect(e, hh(t));
}
function mh(e, t, n = { autoInvoke: !1 }) {
  const o = p.useRef(null), r = ao(e), s = p.useCallback((...i) => {
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
function gh(e) {
  const t = p.useRef(void 0);
  return p.useEffect(() => {
    t.current = e;
  }, [e]), t.current;
}
function vh() {
  const [e, t] = p.useState(!1);
  return qo(() => {
    t(typeof window < "u" && !yh() && "EyeDropper" in window);
  }, []), {
    supported: e,
    open: p.useCallback((n = {}) => e ? new window.EyeDropper().open(n) : Promise.resolve(void 0), [e])
  };
}
function yh() {
  return navigator.userAgent.includes("OPR");
}
function bh(e, t, n) {
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
function wh() {
  const [e, t] = p.useState(!1);
  return p.useEffect(() => t(!0), []), e;
}
const xh = ["mouse", "touch"], Sh = 10;
function Ch(e, t = {}) {
  const { threshold: n = 400, events: o = xh, cancelOnMove: r = !1, onStart: s, onFinish: a, onCancel: i } = t, c = p.useRef(!1), u = p.useRef(!1), f = p.useRef(-1), h = p.useRef(null);
  p.useEffect(() => () => window.clearTimeout(f.current), []);
  const d = o.join(",");
  return p.useMemo(() => {
    if (typeof e != "function") return {};
    const m = r !== !1, g = r === !0 ? Sh : r === !1 ? 0 : r, v = (C) => {
      !Ac(C) && !wa(C) || (s && s(C), h.current = Pc(C), u.current = !0, f.current = window.setTimeout(() => {
        e(C), c.current = !0;
      }, n));
    }, w = (C) => {
      !Ac(C) && !wa(C) || (c.current ? a && a(C) : u.current && i && i(C), c.current = !1, u.current = !1, h.current = null, f.current !== -1 && (window.clearTimeout(f.current), f.current = -1));
    }, x = (C) => {
      if (!m || !u.current || c.current) return;
      const j = Pc(C);
      if (!j || !h.current) return;
      const R = j.x - h.current.x, T = j.y - h.current.y;
      Math.sqrt(R * R + T * T) > g && w(C);
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
function Pc(e) {
  if (wa(e)) {
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
function wa(e) {
  return window.TouchEvent ? e.nativeEvent instanceof TouchEvent : "touches" in e.nativeEvent;
}
function Ac(e) {
  return e.nativeEvent instanceof MouseEvent;
}
function jh(e) {
  if (!e || typeof e == "string") return 0;
  const t = e / 36;
  return Math.round((4 + 15 * t ** 0.25 + t / 5) * 10);
}
function Gs(e) {
  return e.current ? e.current.scrollHeight : "auto";
}
function Yr(e) {
  return typeof e == "number" && e > 0;
}
function kh({ transitionDuration: e, transitionTimingFunction: t = "ease", onTransitionEnd: n, onTransitionStart: o, expanded: r, keepMounted: s }) {
  const a = {
    height: 0,
    overflow: "hidden",
    ...s ? {} : { display: "none" }
  }, i = p.useEffectEvent(() => o?.()), c = p.useEffectEvent(() => n?.()), u = p.useRef(null), [f, h] = p.useState(r ? {} : a), [d, m] = p.useState(r ? "entered" : "exited"), g = (C) => {
    qt.flushSync(() => h(C));
  }, v = (C) => {
    g((j) => ({
      ...j,
      ...C
    }));
  }, w = (C) => {
    const j = e ?? jh(C);
    return { transition: `height ${j}ms ${t}, opacity ${j}ms ${t}` };
  }, x = p.useRef(0);
  Cn(() => {
    x.current += 1;
    const C = x.current, j = () => x.current === C;
    e !== 0 && i(), r ? window.requestAnimationFrame(() => {
      !j() || !u.current || (qt.flushSync(() => m("entering")), v({
        willChange: "height",
        display: "block",
        overflow: "hidden"
      }), window.requestAnimationFrame(() => {
        if (!j() || !u.current) return;
        const R = Gs(u);
        if (!Yr(R)) {
          g({}), m("entered"), c();
          return;
        }
        v({
          ...w(R),
          height: R
        });
      }));
    }) : window.requestAnimationFrame(() => {
      if (!j() || !u.current) return;
      qt.flushSync(() => m("exiting"));
      const R = Gs(u);
      if (!Yr(R)) {
        g(a), m("exited"), c();
        return;
      }
      v({
        ...w(R),
        willChange: "height",
        height: R
      }), window.requestAnimationFrame(() => {
        !j() || !u.current || v({
          height: 0,
          overflow: "hidden"
        });
      });
    });
  }, [r]);
  const E = (C) => {
    if (!(C.target !== u.current || C.propertyName !== "height"))
      if (r) {
        const j = Gs(u);
        j === f.height ? g({}) : v({ height: j }), m("entered"), c();
      } else f.height === 0 && (g(a), m("exited"), c());
  };
  return {
    state: d,
    getCollapseProps: (C) => ({
      "aria-hidden": !r,
      inert: !r,
      ref: ou(u, C?.ref),
      onTransitionEnd: E,
      style: {
        boxSizing: "border-box",
        ...C?.style,
        ...f
      }
    })
  };
}
function Eh(e) {
  if (!e || typeof e == "string") return 0;
  const t = e / 36;
  return Math.round((4 + 15 * t ** 0.25 + t / 5) * 10);
}
function Js(e) {
  return e.current ? e.current.scrollWidth : "auto";
}
function Rh({ transitionDuration: e, transitionTimingFunction: t = "ease", onTransitionEnd: n, onTransitionStart: o, expanded: r, keepMounted: s }) {
  const a = {
    width: 0,
    overflow: "hidden",
    ...s ? {} : { display: "none" }
  }, i = p.useEffectEvent(() => o?.()), c = p.useEffectEvent(() => n?.()), u = p.useRef(null), [f, h] = p.useState(r ? {} : a), [d, m] = p.useState(r ? "entered" : "exited"), g = (C) => {
    qt.flushSync(() => h(C));
  }, v = (C) => {
    g((j) => ({
      ...j,
      ...C
    }));
  }, w = (C) => {
    const j = e ?? Eh(C);
    return { transition: `width ${j}ms ${t}, opacity ${j}ms ${t}` };
  }, x = p.useRef(0);
  Cn(() => {
    x.current += 1;
    const C = x.current, j = () => x.current === C;
    e !== 0 && i(), r ? window.requestAnimationFrame(() => {
      !j() || !u.current || (qt.flushSync(() => m("entering")), v({
        willChange: "width",
        display: "block",
        overflow: "hidden"
      }), window.requestAnimationFrame(() => {
        if (!j() || !u.current) return;
        const R = Js(u);
        if (!Yr(R)) {
          g({}), m("entered"), c();
          return;
        }
        v({
          ...w(R),
          width: R
        });
      }));
    }) : window.requestAnimationFrame(() => {
      if (!j() || !u.current) return;
      qt.flushSync(() => m("exiting"));
      const R = Js(u);
      if (!Yr(R)) {
        g(a), m("exited"), c();
        return;
      }
      v({
        ...w(R),
        willChange: "width",
        width: R
      }), window.requestAnimationFrame(() => {
        !j() || !u.current || v({
          width: 0,
          overflow: "hidden"
        });
      });
    });
  }, [r]);
  const E = (C) => {
    if (!(C.target !== u.current || C.propertyName !== "width"))
      if (r) {
        const j = Js(u);
        j === f.width ? g({}) : v({ width: j }), m("entered"), c();
      } else f.width === 0 && (g(a), m("exited"), c());
  };
  return {
    state: d,
    getCollapseProps: (C) => ({
      "aria-hidden": !r,
      inert: !r,
      ref: ou(u, C?.ref),
      onTransitionEnd: E,
      style: {
        boxSizing: "border-box",
        ...C?.style,
        ...f
      }
    })
  };
}
function vu() {
  return typeof process < "u" && process.env, "development";
}
function yu(e) {
  const t = /* @__PURE__ */ new Map();
  return (...n) => {
    const o = JSON.stringify(n);
    if (t.has(o)) return t.get(o);
    const r = e(...n);
    return t.set(o, r), r;
  };
}
function bu(e) {
  const t = hn.version;
  return typeof hn.version != "string" || t.startsWith("18.") ? e?.ref : e?.props?.ref;
}
function Nh(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "bigint";
}
function Lr(e, t = document) {
  const n = t.querySelector(e);
  if (n) return n;
  const o = t.querySelectorAll("*");
  for (let r = 0; r < o.length; r += 1) {
    const s = o[r];
    if (s.shadowRoot) {
      const a = Lr(e, s.shadowRoot);
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
function Ut(e) {
  if (!e) return document;
  const t = e.getRootNode();
  return t instanceof ShadowRoot || t instanceof Document ? t : document;
}
function dr(e) {
  const t = p.Children.toArray(e);
  return t.length !== 1 || !ru(t[0]) ? null : t[0];
}
function fr(e, t) {
  return typeof e == "boolean" ? e : t.autoContrast;
}
function Ic(e) {
  const t = document.createElement("style");
  return t.setAttribute("data-mantine-styles", "inline"), t.innerHTML = "*, *::before, *::after {transition: none !important;}", t.setAttribute("data-mantine-disable-transition", "true"), e && t.setAttribute("nonce", e), document.head.appendChild(t), () => document.querySelectorAll("[data-mantine-disable-transition]").forEach((o) => o.remove());
}
function Th({ keepTransitions: e } = {}) {
  const t = p.useRef(Xr), n = p.useRef(-1), o = p.use(Ap), r = Ip(), s = p.useRef(r?.());
  if (!o) throw new Error("[@mantine/core] MantineProvider was not found in tree");
  const a = (h) => {
    o.setColorScheme(h), t.current = e ? () => {
    } : Ic(s.current), window.clearTimeout(n.current), n.current = window.setTimeout(() => {
      t.current?.();
    }, 10);
  }, i = () => {
    o.clearColorScheme(), t.current = e ? () => {
    } : Ic(s.current), window.clearTimeout(n.current), n.current = window.setTimeout(() => {
      t.current?.();
    }, 10);
  }, c = oh("light", { getInitialValueInEffect: !1 }), u = o.colorScheme === "auto" ? c : o.colorScheme, f = p.useCallback(() => a(u === "light" ? "dark" : "light"), [a, u]);
  return p.useEffect(() => () => {
    t.current?.(), window.clearTimeout(n.current);
  }, []), {
    colorScheme: o.colorScheme,
    setColorScheme: a,
    clearColorScheme: i,
    toggleColorScheme: f
  };
}
function xa(e, t) {
  return Array.isArray(e) ? [...e].reduce((n, o) => ({
    ...n,
    ...xa(o, t)
  }), {}) : typeof e == "function" ? e(t) : e ?? {};
}
const Ph = p.createContext({
  dir: "ltr",
  toggleDirection: () => {
  },
  setDirection: () => {
  }
});
function ko() {
  return p.use(Ph);
}
const Ah = {
  transitionDuration: 200,
  transitionTimingFunction: "ease",
  animateOpacity: !0,
  orientation: "vertical",
  keepMounted: !0,
  keepMountedMode: "activity"
}, wu = se((e) => {
  const { children: t, expanded: n, transitionDuration: o, transitionTimingFunction: r, style: s, onTransitionEnd: a, onTransitionStart: i, animateOpacity: c, keepMounted: u, keepMountedMode: f, ref: h, orientation: d, ...m } = Z("Collapse", Ah, e), g = Ja(), v = lr(), w = Za(), x = v.respectReducedMotion && w ? 0 : o, E = (d === "horizontal" ? Rh : kh)({
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
        ...xa(s, v),
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
  let j;
  return u === !1 ? j = C ? null : t : u === !0 ? j = f === "display-none" ? t : /* @__PURE__ */ l.jsx(p.Activity, {
    mode: C ? "hidden" : "visible",
    children: t
  }) : j = t, /* @__PURE__ */ l.jsx(Q, {
    ...m,
    ...E.getCollapseProps({
      style: {
        opacity: n || !c ? 1 : 0,
        transition: c ? `opacity ${x}ms ${r}` : "none",
        ...xa(s, v),
        ...u && f === "display-none" && C ? { display: "none" } : {}
      },
      ref: h
    }),
    children: j
  });
});
wu.displayName = "@mantine/core/Collapse";
const [Ih, Pt] = Gt("ScrollArea.Root component was not found in tree");
function jn(e, t) {
  const n = p.useEffectEvent(t);
  qo(() => {
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
function Mh(e) {
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
function Dh(e) {
  const t = Pt(), n = !!(t.scrollbarX && t.scrollbarY);
  return t.type !== "scroll" && n ? /* @__PURE__ */ l.jsx(Mh, { ...e }) : null;
}
const Oh = {
  scrollHideDelay: 1e3,
  type: "hover"
};
function xu(e) {
  const { type: t, scrollHideDelay: n, scrollbars: o, getStyles: r, ref: s, ...a } = Z("ScrollAreaRoot", Oh, e), [i, c] = p.useState(null), [u, f] = p.useState(null), [h, d] = p.useState(null), [m, g] = p.useState(null), [v, w] = p.useState(null), [x, E] = p.useState(0), [C, j] = p.useState(0), [R, T] = p.useState(!1), [S, b] = p.useState(!1), P = Ve(s, c);
  return /* @__PURE__ */ l.jsx(Ih, {
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
      onScrollbarXEnabledChange: T,
      scrollbarY: v,
      onScrollbarYChange: w,
      scrollbarYEnabled: S,
      onScrollbarYEnabledChange: b,
      onCornerWidthChange: E,
      onCornerHeightChange: j,
      getStyles: r
    },
    children: /* @__PURE__ */ l.jsx(Q, {
      ...a,
      ref: P,
      __vars: {
        "--sa-corner-width": o !== "xy" ? "0px" : `${x}px`,
        "--sa-corner-height": o !== "xy" ? "0px" : `${C}px`
      }
    })
  });
}
xu.displayName = "@mantine/core/ScrollAreaRoot";
function Su(e, t) {
  const n = e / t;
  return Number.isNaN(n) ? 0 : n;
}
function fs(e) {
  const t = Su(e.viewport, e.content), n = e.scrollbar.paddingStart + e.scrollbar.paddingEnd, o = (e.scrollbar.size - n) * t;
  return Math.max(o, 18);
}
function Cu(e, t) {
  return (n) => {
    if (e[0] === e[1] || t[0] === t[1]) return t[0];
    const o = (t[1] - t[0]) / (e[1] - e[0]);
    return t[0] + o * (n - e[0]);
  };
}
function Lh(e, [t, n]) {
  return Math.min(n, Math.max(t, e));
}
function Mc(e, t, n = "ltr") {
  const o = fs(t), r = t.scrollbar.paddingStart + t.scrollbar.paddingEnd, s = t.scrollbar.size - r, a = t.content - t.viewport, i = s - o, c = Lh(e, n === "ltr" ? [0, a] : [a * -1, 0]);
  return Cu([0, a], [0, i])(c);
}
function $h(e, t, n, o = "ltr") {
  const r = fs(n), s = r / 2, a = t || s, i = r - a, c = n.scrollbar.paddingStart + a, u = n.scrollbar.size - n.scrollbar.paddingEnd - i, f = n.content - n.viewport, h = o === "ltr" ? [0, f] : [f * -1, 0];
  return Cu([c, u], h)(e);
}
function ju(e, t) {
  return e > 0 && e < t;
}
function gn(e) {
  return e ? parseInt(e, 10) : 0;
}
function On(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
  return (o) => {
    e?.(o), (n === !1 || !o.defaultPrevented) && t?.(o);
  };
}
const [zh, ku] = Gt("ScrollAreaScrollbar was not found in tree");
function Eu(e) {
  const { sizes: t, hasThumb: n, onThumbChange: o, onThumbPointerUp: r, onThumbPointerDown: s, onThumbPositionChange: a, onDragScroll: i, onWheelScroll: c, onResize: u, ref: f, ...h } = e, d = Pt(), [m, g] = p.useState(null), v = Ve(f, g), w = p.useRef(null), x = p.useRef(""), { viewport: E } = d, C = t.content - t.viewport, j = p.useEffectEvent(c), R = ao(a), T = ds(u, 10), S = (b) => {
    if (w.current) {
      const P = b.clientX - w.current.left, L = b.clientY - w.current.top;
      i({
        x: P,
        y: L
      });
    }
  };
  return p.useEffect(() => {
    const b = (P) => {
      const L = P.target;
      m?.contains(L) && j(P, C);
    };
    return document.addEventListener("wheel", b, { passive: !1 }), () => document.removeEventListener("wheel", b, { passive: !1 });
  }, [
    E,
    m,
    C
  ]), p.useEffect(R, [t, R]), jn(m, T), jn(d.content, T), /* @__PURE__ */ l.jsx(zh, {
    value: {
      scrollbar: m,
      hasThumb: n,
      onThumbChange: ao(o),
      onThumbPointerUp: ao(r),
      onThumbPositionChange: R,
      onThumbPointerDown: ao(s)
    },
    children: /* @__PURE__ */ l.jsx("div", {
      ...h,
      ref: v,
      "data-mantine-scrollbar": !0,
      style: {
        position: "absolute",
        ...h.style
      },
      onPointerDown: On(e.onPointerDown, (b) => {
        b.preventDefault(), b.button === 0 && (b.target.setPointerCapture(b.pointerId), w.current = m.getBoundingClientRect(), x.current = document.body.style.webkitUserSelect, document.body.style.webkitUserSelect = "none", S(b));
      }),
      onPointerMove: On(e.onPointerMove, S),
      onPointerUp: On(e.onPointerUp, (b) => {
        const P = b.target;
        P.hasPointerCapture(b.pointerId) && (b.preventDefault(), P.releasePointerCapture(b.pointerId));
      }),
      onLostPointerCapture: () => {
        document.body.style.webkitUserSelect = x.current, w.current = null;
      }
    })
  });
}
const Ru = (e) => {
  const { sizes: t, onSizesChange: n, style: o, ref: r, ...s } = e, a = Pt(), [i, c] = p.useState(), u = p.useRef(null), f = Ve(r, u, a.onScrollbarXChange);
  return p.useEffect(() => {
    u.current && c(getComputedStyle(u.current));
  }, [u]), /* @__PURE__ */ l.jsx(Eu, {
    "data-orientation": "horizontal",
    ...s,
    ref: f,
    sizes: t,
    style: {
      ...o,
      "--sa-thumb-width": `${fs(t)}px`
    },
    onThumbPointerDown: (h) => e.onThumbPointerDown(h.x),
    onDragScroll: (h) => e.onDragScroll(h.x),
    onWheelScroll: (h, d) => {
      if (a.viewport) {
        const m = a.viewport.scrollLeft + h.deltaX;
        e.onWheelScroll(m), ju(m, d) && h.preventDefault();
      }
    },
    onResize: () => {
      u.current && a.viewport && i && n({
        content: a.viewport.scrollWidth,
        viewport: a.viewport.offsetWidth,
        scrollbar: {
          size: u.current.clientWidth,
          paddingStart: gn(i.paddingLeft),
          paddingEnd: gn(i.paddingRight)
        }
      });
    }
  });
};
Ru.displayName = "@mantine/core/ScrollAreaScrollbarX";
function Nu(e) {
  const { sizes: t, onSizesChange: n, style: o, ref: r, ...s } = e, a = Pt(), [i, c] = p.useState(), u = p.useRef(null), f = Ve(r, u, a.onScrollbarYChange);
  return p.useEffect(() => {
    u.current && c(window.getComputedStyle(u.current));
  }, []), /* @__PURE__ */ l.jsx(Eu, {
    ...s,
    "data-orientation": "vertical",
    ref: f,
    sizes: t,
    style: {
      "--sa-thumb-height": `${fs(t)}px`,
      ...o
    },
    onThumbPointerDown: (h) => e.onThumbPointerDown(h.y),
    onDragScroll: (h) => e.onDragScroll(h.y),
    onWheelScroll: (h, d) => {
      if (a.viewport) {
        const m = a.viewport.scrollTop + h.deltaY;
        e.onWheelScroll(m), ju(m, d) && h.preventDefault();
      }
    },
    onResize: () => {
      u.current && a.viewport && i && n({
        content: a.viewport.scrollHeight,
        viewport: a.viewport.offsetHeight,
        scrollbar: {
          size: u.current.clientHeight,
          paddingStart: gn(i.paddingTop),
          paddingEnd: gn(i.paddingBottom)
        }
      });
    }
  });
}
Nu.displayName = "@mantine/core/ScrollAreaScrollbarY";
function ps(e) {
  const { orientation: t = "vertical", ...n } = e, { dir: o } = ko(), r = Pt(), s = p.useRef(null), a = p.useRef(0), [i, c] = p.useState({
    content: 0,
    viewport: 0,
    scrollbar: {
      size: 0,
      paddingStart: 0,
      paddingEnd: 0
    }
  }), u = Su(i.viewport, i.content), f = {
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
  }, h = (d, m) => $h(d, a.current, i, m);
  return t === "horizontal" ? /* @__PURE__ */ l.jsx(Ru, {
    ...f,
    onThumbPositionChange: () => {
      if (r.viewport && s.current) {
        const d = r.viewport.scrollLeft, m = Mc(d, i, o);
        s.current.style.transform = `translate3d(${m}px, 0, 0)`;
      }
    },
    onWheelScroll: (d) => {
      r.viewport && (r.viewport.scrollLeft = d);
    },
    onDragScroll: (d) => {
      r.viewport && (r.viewport.scrollLeft = h(d, o));
    }
  }) : t === "vertical" ? /* @__PURE__ */ l.jsx(Nu, {
    ...f,
    onThumbPositionChange: () => {
      if (r.viewport && s.current) {
        const d = r.viewport.scrollTop, m = Mc(d, i);
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
ps.displayName = "@mantine/core/ScrollAreaScrollbarVisible";
function ai(e) {
  const t = Pt(), { forceMount: n, ...o } = e, [r, s] = p.useState(!1), a = e.orientation === "horizontal", i = ds(() => {
    if (t.viewport) {
      const c = t.viewport.offsetWidth < t.viewport.scrollWidth, u = t.viewport.offsetHeight < t.viewport.scrollHeight;
      s(a ? c : u);
    }
  }, 10);
  return jn(t.viewport, i), jn(t.content, i), n || r ? /* @__PURE__ */ l.jsx(ps, {
    "data-state": r ? "visible" : "hidden",
    ...o
  }) : null;
}
ai.displayName = "@mantine/core/ScrollAreaScrollbarAuto";
function Tu(e) {
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
  }, [o.scrollArea, o.scrollHideDelay]), t || r ? /* @__PURE__ */ l.jsx(ai, {
    "data-state": r ? "visible" : "hidden",
    ...n
  }) : null;
}
Tu.displayName = "@mantine/core/ScrollAreaScrollbarHover";
function _h(e) {
  const { forceMount: t, ...n } = e, o = Pt(), r = e.orientation === "horizontal", [s, a] = p.useState("hidden"), i = ds(() => a("idle"), 100);
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
  ]), t || s !== "hidden" ? /* @__PURE__ */ l.jsx(ps, {
    "data-state": s === "hidden" ? "hidden" : "visible",
    ...n,
    onPointerEnter: On(e.onPointerEnter, () => a("interacting")),
    onPointerLeave: On(e.onPointerLeave, () => a("idle"))
  }) : null;
}
function Sa(e) {
  const { forceMount: t, ...n } = e, o = Pt(), { onScrollbarXEnabledChange: r, onScrollbarYEnabledChange: s } = o, a = e.orientation === "horizontal";
  return p.useEffect(() => (a ? r(!0) : s(!0), () => {
    a ? r(!1) : s(!1);
  }), [
    a,
    r,
    s
  ]), o.type === "hover" ? /* @__PURE__ */ l.jsx(Tu, {
    ...n,
    forceMount: t
  }) : o.type === "scroll" ? /* @__PURE__ */ l.jsx(_h, {
    ...n,
    forceMount: t
  }) : o.type === "auto" ? /* @__PURE__ */ l.jsx(ai, {
    ...n,
    forceMount: t
  }) : o.type === "always" ? /* @__PURE__ */ l.jsx(ps, { ...n }) : null;
}
Sa.displayName = "@mantine/core/ScrollAreaScrollbar";
function Fh(e, t = () => {
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
function Pu(e) {
  const { style: t, ref: n, ...o } = e, r = Pt(), s = ku(), { onThumbPositionChange: a } = s, i = Ve(n, s.onThumbChange), c = p.useRef(void 0), u = ds(() => {
    c.current && (c.current(), c.current = void 0);
  }, 100);
  return p.useEffect(() => {
    const { viewport: f } = r;
    if (f) {
      const h = () => {
        if (u(), !c.current) {
          const d = Fh(f, a);
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
    onPointerDownCapture: On(e.onPointerDownCapture, (f) => {
      const h = f.target.getBoundingClientRect(), d = f.clientX - h.left, m = f.clientY - h.top;
      s.onThumbPointerDown({
        x: d,
        y: m
      });
    }),
    onPointerUp: On(e.onPointerUp, s.onThumbPointerUp)
  });
}
Pu.displayName = "@mantine/core/ScrollAreaThumb";
function Ca(e) {
  const { forceMount: t, ...n } = e, o = ku();
  return t || o.hasThumb ? /* @__PURE__ */ l.jsx(Pu, { ...n }) : null;
}
Ca.displayName = "@mantine/core/ScrollAreaThumb";
function Au({ children: e, style: t, ref: n, onWheel: o, ...r }) {
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
Au.displayName = "@mantine/core/ScrollAreaViewport";
var ii = {
  root: "m_d57069b5",
  content: "m_b1336c6",
  viewport: "m_c0783ff9",
  viewportInner: "m_f8f631dd",
  scrollbar: "m_c44ba933",
  thumb: "m_d8b5e363",
  corner: "m_21657268"
};
function hs() {
  return typeof window < "u";
}
function Eo(e) {
  return Iu(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function gt(e) {
  var t;
  return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function an(e) {
  var t;
  return (t = (Iu(e) ? e.ownerDocument : e.document) || window.document) == null ? void 0 : t.documentElement;
}
function Iu(e) {
  return hs() ? e instanceof Node || e instanceof gt(e).Node : !1;
}
function mt(e) {
  return hs() ? e instanceof Element || e instanceof gt(e).Element : !1;
}
function Rn(e) {
  return hs() ? e instanceof HTMLElement || e instanceof gt(e).HTMLElement : !1;
}
function Dc(e) {
  return !hs() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof gt(e).ShadowRoot;
}
function ms(e) {
  const {
    overflow: t,
    overflowX: n,
    overflowY: o,
    display: r
  } = Kt(e);
  return /auto|scroll|overlay|hidden|clip/.test(t + o + n) && r !== "inline" && r !== "contents";
}
function Bh(e) {
  return /^(table|td|th)$/.test(Eo(e));
}
function gs(e) {
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
const Vh = /transform|translate|scale|rotate|perspective|filter/, Hh = /paint|layout|strict|content/, Pn = (e) => !!e && e !== "none";
let Zs;
function ci(e) {
  const t = mt(e) ? Kt(e) : e;
  return Pn(t.transform) || Pn(t.translate) || Pn(t.scale) || Pn(t.rotate) || Pn(t.perspective) || !li() && (Pn(t.backdropFilter) || Pn(t.filter)) || Vh.test(t.willChange || "") || Hh.test(t.contain || "");
}
function Uh(e) {
  let t = zn(e);
  for (; Rn(t) && !Yo(t); ) {
    if (ci(t))
      return t;
    if (gs(t))
      return null;
    t = zn(t);
  }
  return null;
}
function li() {
  return Zs == null && (Zs = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), Zs;
}
function Yo(e) {
  return /^(html|body|#document)$/.test(Eo(e));
}
function Kt(e) {
  return gt(e).getComputedStyle(e);
}
function vs(e) {
  return mt(e) ? {
    scrollLeft: e.scrollLeft,
    scrollTop: e.scrollTop
  } : {
    scrollLeft: e.scrollX,
    scrollTop: e.scrollY
  };
}
function zn(e) {
  if (Eo(e) === "html")
    return e;
  const t = (
    // Step into the shadow DOM of the parent of a slotted node.
    e.assignedSlot || // DOM Element detected.
    e.parentNode || // ShadowRoot detected.
    Dc(e) && e.host || // Fallback.
    an(e)
  );
  return Dc(t) ? t.host : t;
}
function Mu(e) {
  const t = zn(e);
  return Yo(t) ? (e.ownerDocument || e).body : Rn(t) && ms(t) ? t : Mu(t);
}
function Go(e, t, n) {
  var o;
  t === void 0 && (t = []), n === void 0 && (n = !0);
  const r = Mu(e), s = r === ((o = e.ownerDocument) == null ? void 0 : o.body), a = gt(r);
  if (s) {
    const i = ja(a);
    return t.concat(a, a.visualViewport || [], ms(r) ? r : [], i && n ? Go(i) : []);
  } else
    return t.concat(r, Go(r, [], n));
}
function ja(e) {
  return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
const Wh = ["top", "right", "bottom", "left"], Ft = Math.min, kt = Math.max, Gr = Math.round, Pr = Math.floor, en = (e) => ({
  x: e,
  y: e
}), qh = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
function Du(e, t, n) {
  return kt(e, Ft(t, n));
}
function Xt(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function Yt(e) {
  return e.split("-")[0];
}
function Ro(e) {
  return e.split("-")[1];
}
function ui(e) {
  return e === "x" ? "y" : "x";
}
function di(e) {
  return e === "y" ? "height" : "width";
}
function Lt(e) {
  const t = e[0];
  return t === "t" || t === "b" ? "y" : "x";
}
function fi(e) {
  return ui(Lt(e));
}
function Kh(e, t, n) {
  n === void 0 && (n = !1);
  const o = Ro(e), r = fi(e), s = di(r);
  let a = r === "x" ? o === (n ? "end" : "start") ? "right" : "left" : o === "start" ? "bottom" : "top";
  return t.reference[s] > t.floating[s] && (a = Jr(a)), [a, Jr(a)];
}
function Xh(e) {
  const t = Jr(e);
  return [ka(e), t, ka(t)];
}
function ka(e) {
  return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
const Oc = ["left", "right"], Lc = ["right", "left"], Yh = ["top", "bottom"], Gh = ["bottom", "top"];
function Jh(e, t, n) {
  switch (e) {
    case "top":
    case "bottom":
      return n ? t ? Lc : Oc : t ? Oc : Lc;
    case "left":
    case "right":
      return t ? Yh : Gh;
    default:
      return [];
  }
}
function Zh(e, t, n, o) {
  const r = Ro(e);
  let s = Jh(Yt(e), n === "start", o);
  return r && (s = s.map((a) => a + "-" + r), t && (s = s.concat(s.map(ka)))), s;
}
function Jr(e) {
  const t = Yt(e);
  return qh[t] + e.slice(t.length);
}
function Qh(e) {
  var t, n, o, r;
  return {
    top: (t = e.top) != null ? t : 0,
    right: (n = e.right) != null ? n : 0,
    bottom: (o = e.bottom) != null ? o : 0,
    left: (r = e.left) != null ? r : 0
  };
}
function pi(e) {
  return typeof e != "number" ? Qh(e) : {
    top: e,
    right: e,
    bottom: e,
    left: e
  };
}
function xn(e) {
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
var em = typeof document < "u", tm = function() {
}, Ea = em ? p.useLayoutEffect : tm;
const nm = {
  ...Ql
}, om = nm.useInsertionEffect, rm = om || ((e) => e());
function sm(e) {
  const t = p.useRef(() => {
  });
  return rm(() => {
    t.current = e;
  }), p.useCallback(function() {
    for (var n = arguments.length, o = new Array(n), r = 0; r < n; r++)
      o[r] = arguments[r];
    return t.current == null ? void 0 : t.current(...o);
  }, []);
}
function $c(e, t, n) {
  let {
    reference: o,
    floating: r
  } = e;
  const s = Lt(t), a = fi(t), i = di(a), c = Yt(t), u = s === "y", f = o.x + o.width / 2 - r.width / 2, h = o.y + o.height / 2 - r.height / 2, d = o[i] / 2 - r[i] / 2;
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
  const g = Ro(t);
  return g && (m[a] += d * (g === "end" ? 1 : -1) * (n && u ? -1 : 1)), m;
}
async function am(e, t) {
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
  } = Xt(t, e), g = pi(m), w = i[d ? h === "floating" ? "reference" : "floating" : h], x = xn(await s.getClippingRect({
    element: (n = await (s.isElement == null ? void 0 : s.isElement(w))) == null || n ? w : w.contextElement || await (s.getDocumentElement == null ? void 0 : s.getDocumentElement(i.floating)),
    boundary: u,
    rootBoundary: f,
    strategy: c
  })), E = h === "floating" ? {
    x: o,
    y: r,
    width: a.floating.width,
    height: a.floating.height
  } : a.reference, C = await (s.getOffsetParent == null ? void 0 : s.getOffsetParent(i.floating)), j = await (s.isElement == null ? void 0 : s.isElement(C)) && await (s.getScale == null ? void 0 : s.getScale(C)) || {
    x: 1,
    y: 1
  }, R = xn(s.convertOffsetParentRelativeRectToViewportRelativeRect ? await s.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements: i,
    rect: E,
    offsetParent: C,
    strategy: c
  }) : E);
  return {
    top: (x.top - R.top + g.top) / j.y,
    bottom: (R.bottom - x.bottom + g.bottom) / j.y,
    left: (x.left - R.left + g.left) / j.x,
    right: (R.right - x.right + g.right) / j.x
  };
}
const im = 50, cm = async (e, t, n) => {
  const {
    placement: o = "bottom",
    strategy: r = "absolute",
    middleware: s = [],
    platform: a
  } = n, i = a.detectOverflow ? a : {
    ...a,
    detectOverflow: am
  }, c = await (a.isRTL == null ? void 0 : a.isRTL(t));
  let u = await a.getElementRects({
    reference: e,
    floating: t,
    strategy: r
  }), {
    x: f,
    y: h
  } = $c(u, o, c), d = o, m = 0;
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
      y: j,
      data: R,
      reset: T
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
    f = C ?? f, h = j ?? h, g[x] = {
      ...g[x],
      ...R
    }, T && m < im && (m++, typeof T == "object" && (T.placement && (d = T.placement), T.rects && (u = T.rects === !0 ? await a.getElementRects({
      reference: e,
      floating: t,
      strategy: r
    }) : T.rects), {
      x: f,
      y: h
    } = $c(u, d, c)), v = -1);
  }
  return {
    x: f,
    y: h,
    placement: d,
    strategy: r,
    middlewareData: g
  };
}, lm = (e) => ({
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
    } = Xt(e, t) || {};
    if (u == null)
      return {};
    const h = pi(f), d = {
      x: n,
      y: o
    }, m = fi(r), g = di(m), v = await a.getDimensions(u), w = m === "y", x = w ? "top" : "left", E = w ? "bottom" : "right", C = w ? "clientHeight" : "clientWidth", j = s.reference[g] + s.reference[m] - d[m] - s.floating[g], R = d[m] - s.reference[m], T = await (a.getOffsetParent == null ? void 0 : a.getOffsetParent(u));
    let S = T ? T[C] : 0;
    (!S || !await (a.isElement == null ? void 0 : a.isElement(T))) && (S = i.floating[C] || s.floating[g]);
    const b = j / 2 - R / 2, P = S / 2 - v[g] / 2 - 1, L = Ft(h[x], P), $ = Ft(h[E], P), F = S - v[g] - $, B = S / 2 - v[g] / 2 + b, I = Du(L, B, F), O = !c.arrow && Ro(r) != null && B !== I && s.reference[g] / 2 - (B < L ? L : $) - v[g] / 2 < 0, D = O ? B < L ? B - L : B - F : 0;
    return {
      [m]: d[m] + D,
      data: {
        [m]: I,
        centerOffset: B - I - D,
        ...O && {
          alignmentOffset: D
        }
      },
      reset: O
    };
  }
}), um = function(e) {
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
      } = Xt(e, t);
      if ((n = s.arrow) != null && n.alignmentOffset)
        return {};
      const x = Yt(r), E = Lt(i), C = Yt(i) === i, j = await (c.isRTL == null ? void 0 : c.isRTL(u.floating)), R = d || (C || !v ? [Jr(i)] : Xh(i)), T = g !== "none";
      !d && T && R.push(...Zh(i, v, g, j));
      const S = [i, ...R], b = await c.detectOverflow(t, w), P = [];
      let L = ((o = s.flip) == null ? void 0 : o.overflows) || [];
      if (f && P.push(b[x]), h) {
        const I = Kh(r, a, j);
        P.push(b[I[0]], b[I[1]]);
      }
      if (L = [...L, {
        placement: r,
        overflows: P
      }], !P.every((I) => I <= 0)) {
        var $, F;
        const I = ((($ = s.flip) == null ? void 0 : $.index) || 0) + 1, O = S[I];
        if (O && (!(h === "alignment" ? E !== Lt(O) : !1) || // We leave the current main axis only if every placement on that axis
        // overflows the main axis.
        L.every((M) => Lt(M.placement) === E ? M.overflows[0] > 0 : !0)))
          return {
            data: {
              index: I,
              overflows: L
            },
            reset: {
              placement: O
            }
          };
        let D = (F = L.filter((z) => z.overflows[0] <= 0).sort((z, M) => z.overflows[1] - M.overflows[1])[0]) == null ? void 0 : F.placement;
        if (!D)
          switch (m) {
            case "bestFit": {
              var B;
              const z = (B = L.filter((M) => {
                if (T) {
                  const A = Lt(M.placement);
                  return A === E || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  A === "y";
                }
                return !0;
              }).map((M) => [M.placement, M.overflows.filter((A) => A > 0).reduce((A, _) => A + _, 0)]).sort((M, A) => M[1] - A[1])[0]) == null ? void 0 : B[0];
              z && (D = z);
              break;
            }
            case "initialPlacement":
              D = i;
              break;
          }
        if (r !== D)
          return {
            reset: {
              placement: D
            }
          };
      }
      return {};
    }
  };
};
function zc(e, t) {
  return {
    top: e.top - t.height,
    right: e.right - t.width,
    bottom: e.bottom - t.height,
    left: e.left - t.width
  };
}
function _c(e) {
  return Wh.some((t) => e[t] >= 0);
}
const dm = function(e) {
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
      } = Xt(e, t);
      switch (r) {
        case "referenceHidden": {
          const a = await o.detectOverflow(t, {
            ...s,
            elementContext: "reference"
          }), i = zc(a, n.reference);
          return {
            data: {
              referenceHiddenOffsets: i,
              referenceHidden: _c(i)
            }
          };
        }
        case "escaped": {
          const a = await o.detectOverflow(t, {
            ...s,
            altBoundary: !0
          }), i = zc(a, n.floating);
          return {
            data: {
              escapedOffsets: i,
              escaped: _c(i)
            }
          };
        }
        default:
          return {};
      }
    }
  };
};
function Ou(e) {
  const t = Ft(...e.map((s) => s.left)), n = Ft(...e.map((s) => s.top)), o = kt(...e.map((s) => s.right)), r = kt(...e.map((s) => s.bottom));
  return {
    x: t,
    y: n,
    width: o - t,
    height: r - n
  };
}
function fm(e) {
  const t = e.slice().sort((r, s) => r.y - s.y), n = [];
  let o = null;
  for (let r = 0; r < t.length; r++) {
    const s = t[r];
    !o || s.y - o.y > o.height / 2 ? n.push([s]) : n[n.length - 1].push(s), o = s;
  }
  return n.map((r) => xn(Ou(r)));
}
const pm = function(e) {
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
      } = Xt(e, t), f = Array.from(await (s.getClientRects == null ? void 0 : s.getClientRects(o.reference)) || []);
      if (!f.length)
        return {};
      const h = fm(f), d = xn(Ou(f)), m = pi(i);
      function g() {
        if (h.length === 2 && (h[0].left > h[1].right || h[1].left > h[0].right) && c != null && u != null)
          return h.find((w) => c > w.left - m.left && c < w.right + m.right && u > w.top - m.top && u < w.bottom + m.bottom) || d;
        if (h.length >= 2) {
          if (Lt(n) === "y") {
            const T = h[0], S = h[h.length - 1], b = Yt(n) === "top", P = T.top, L = S.bottom, $ = b ? T.left : S.left, F = b ? T.right : S.right;
            return xn({
              x: $,
              y: P,
              width: F - $,
              height: L - P
            });
          }
          const w = Yt(n) === "left", x = kt(...h.map((T) => T.right)), E = Ft(...h.map((T) => T.left)), C = h.filter((T) => w ? T.left === E : T.right === x), j = C[0].top, R = C[C.length - 1].bottom;
          return xn({
            x: E,
            y: j,
            width: x - E,
            height: R - j
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
}, Lu = /* @__PURE__ */ new Set(["left", "top"]);
async function hm(e, t) {
  const {
    placement: n,
    platform: o,
    elements: r
  } = e, s = await (o.isRTL == null ? void 0 : o.isRTL(r.floating)), a = Yt(n), i = Ro(n), c = Lt(n) === "y", u = Lu.has(a) ? -1 : 1, f = s && c ? -1 : 1, h = Xt(t, e);
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
const mm = function(e) {
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
      } = t, c = await hm(t, e);
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
}, gm = function(e) {
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
              y: j
            } = E;
            return {
              x: C,
              y: j
            };
          }
        },
        ...u
      } = Xt(e, t), f = {
        x: n,
        y: o
      }, h = await s.detectOverflow(t, u), d = Lt(r), m = ui(d);
      let g = f[m], v = f[d];
      const w = (E, C) => Du(C + h[E === "y" ? "top" : "left"], C, C - h[E === "y" ? "bottom" : "right"]);
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
}, vm = function(e) {
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
      } = Xt(e, t), d = {
        x: r,
        y: s
      }, m = Lt(a), g = ui(m);
      let v = d[g], w = d[m];
      const x = Xt(u, t), E = typeof x == "number" ? {
        mainAxis: x,
        crossAxis: 0
      } : {
        mainAxis: (n = x.mainAxis) != null ? n : 0,
        crossAxis: (o = x.crossAxis) != null ? o : 0
      };
      if (f) {
        const R = g === "y" ? "height" : "width", T = i.reference[g] - i.floating[R] + E.mainAxis, S = i.reference[g] + i.reference[R] - E.mainAxis;
        v < T ? v = T : v > S && (v = S);
      }
      if (h) {
        var C, j;
        const R = g === "y" ? "width" : "height", T = Lu.has(Yt(a)), S = i.reference[m] - i.floating[R] + (T && ((C = c.offset) == null ? void 0 : C[m]) || 0) + (T ? 0 : E.crossAxis), b = i.reference[m] + i.reference[R] + (T ? 0 : ((j = c.offset) == null ? void 0 : j[m]) || 0) - (T ? E.crossAxis : 0);
        w < S ? w = S : w > b && (w = b);
      }
      return {
        [g]: v,
        [m]: w
      };
    }
  };
}, ym = function(e) {
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
      } = Xt(e, t), c = await r.detectOverflow(t, i), u = Yt(n), f = Ro(n), h = Lt(n) === "y", {
        width: d,
        height: m
      } = o.floating;
      let g, v;
      u === "top" || u === "bottom" ? (g = u, v = f === (await (r.isRTL == null ? void 0 : r.isRTL(s.floating)) ? "start" : "end") ? "left" : "right") : (v = u, g = f === "end" ? "top" : "bottom");
      const w = m - c.top - c.bottom, x = d - c.left - c.right, E = Ft(m - c[g], w), C = Ft(d - c[v], x), j = t.middlewareData.shift, R = !j;
      let T = E, S = C;
      j != null && j.enabled.x && (S = x), j != null && j.enabled.y && (T = w), R && !f && (h ? S = d - 2 * kt(c.left, c.right) : T = m - 2 * kt(c.top, c.bottom)), await a({
        ...t,
        availableWidth: S,
        availableHeight: T
      });
      const b = await r.getDimensions(s.floating);
      return d !== b.width || m !== b.height ? {
        reset: {
          rects: !0
        }
      } : {};
    }
  };
};
function $u(e) {
  const t = Kt(e);
  let n = parseFloat(t.width) || 0, o = parseFloat(t.height) || 0;
  const r = Rn(e), s = r ? e.offsetWidth : n, a = r ? e.offsetHeight : o, i = Gr(n) !== s || Gr(o) !== a;
  return i && (n = s, o = a), {
    width: n,
    height: o,
    $: i
  };
}
function hi(e) {
  return mt(e) ? e : e.contextElement;
}
function io(e) {
  const t = hi(e);
  if (!Rn(t))
    return en(1);
  const n = t.getBoundingClientRect(), {
    width: o,
    height: r,
    $: s
  } = $u(t);
  let a = (s ? Gr(n.width) : n.width) / o, i = (s ? Gr(n.height) : n.height) / r;
  return (!a || !Number.isFinite(a)) && (a = 1), (!i || !Number.isFinite(i)) && (i = 1), {
    x: a,
    y: i
  };
}
const bm = /* @__PURE__ */ en(0);
function zu(e) {
  const t = gt(e);
  return !li() || !t.visualViewport ? bm : {
    x: t.visualViewport.offsetLeft,
    y: t.visualViewport.offsetTop
  };
}
function wm(e, t, n) {
  return t === void 0 && (t = !1), !!n && t && n === gt(e);
}
function _n(e, t, n, o) {
  t === void 0 && (t = !1), n === void 0 && (n = !1);
  const r = e.getBoundingClientRect(), s = hi(e);
  let a = en(1);
  t && (o ? mt(o) && (a = io(o)) : a = io(e));
  const i = wm(s, n, o) ? zu(s) : en(0);
  let c = (r.left + i.x) / a.x, u = (r.top + i.y) / a.y, f = r.width / a.x, h = r.height / a.y;
  if (s && o) {
    const d = gt(s), m = mt(o) ? gt(o) : o;
    let g = d, v = ja(g);
    for (; v && m !== g; ) {
      const w = io(v), x = v.getBoundingClientRect(), E = Kt(v), C = x.left + (v.clientLeft + parseFloat(E.paddingLeft)) * w.x, j = x.top + (v.clientTop + parseFloat(E.paddingTop)) * w.y;
      c *= w.x, u *= w.y, f *= w.x, h *= w.y, c += C, u += j, g = gt(v), v = ja(g);
    }
  }
  return xn({
    width: f,
    height: h,
    x: c,
    y: u
  });
}
function ys(e, t) {
  const n = vs(e).scrollLeft;
  return t ? t.left + n : _n(an(e)).left + n;
}
function _u(e, t) {
  const n = e.getBoundingClientRect(), o = n.left + t.scrollLeft - ys(e, n), r = n.top + t.scrollTop;
  return {
    x: o,
    y: r
  };
}
function xm(e) {
  let {
    elements: t,
    rect: n,
    offsetParent: o,
    strategy: r
  } = e;
  const s = r === "fixed", a = an(o), i = t ? gs(t.floating) : !1;
  if (o === a || i && s)
    return n;
  let c = {
    scrollLeft: 0,
    scrollTop: 0
  }, u = en(1);
  const f = en(0), h = Rn(o);
  if ((h || !s) && ((Eo(o) !== "body" || ms(a)) && (c = vs(o)), h)) {
    const m = _n(o);
    u = io(o), f.x = m.x + o.clientLeft, f.y = m.y + o.clientTop;
  }
  const d = a && !h && !s ? _u(a, c) : en(0);
  return {
    width: n.width * u.x,
    height: n.height * u.y,
    x: n.x * u.x - c.scrollLeft * u.x + f.x + d.x,
    y: n.y * u.y - c.scrollTop * u.y + f.y + d.y
  };
}
function Sm(e) {
  return e.getClientRects ? Array.from(e.getClientRects()) : [];
}
function Cm(e) {
  const t = vs(e), n = e.ownerDocument.body, o = kt(e.scrollWidth, e.clientWidth, n.scrollWidth, n.clientWidth), r = kt(e.scrollHeight, e.clientHeight, n.scrollHeight, n.clientHeight);
  let s = -t.scrollLeft + ys(e);
  const a = -t.scrollTop;
  return Kt(n).direction === "rtl" && (s += kt(e.clientWidth, n.clientWidth) - o), {
    width: o,
    height: r,
    x: s,
    y: a
  };
}
const jm = 25;
function km(e, t, n) {
  n === void 0 && (n = "viewport");
  const o = n === "layoutViewport", r = gt(e), s = an(e), a = r.visualViewport;
  let i = s.clientWidth, c = s.clientHeight, u = 0, f = 0;
  if (a) {
    const d = !li() || t === "fixed";
    o ? d || (u = -a.offsetLeft, f = -a.offsetTop) : (i = a.width, c = a.height, d && (u = a.offsetLeft, f = a.offsetTop));
  }
  if (ys(s) <= 0) {
    const d = s.ownerDocument, m = d.body, g = getComputedStyle(m), v = d.compatMode === "CSS1Compat" && parseFloat(g.marginLeft) + parseFloat(g.marginRight) || 0, w = Math.abs(s.clientWidth - m.clientWidth - v), x = getComputedStyle(s).scrollbarGutter === "stable both-edges" ? w / 2 : w;
    x <= jm && (i -= x);
  }
  return {
    width: i,
    height: c,
    x: u,
    y: f
  };
}
function Em(e, t) {
  const n = _n(e, !0, t === "fixed"), o = n.top + e.clientTop, r = n.left + e.clientLeft, s = io(e), a = e.clientWidth * s.x, i = e.clientHeight * s.y, c = r * s.x, u = o * s.y;
  return {
    width: a,
    height: i,
    x: c,
    y: u
  };
}
function Fc(e, t, n) {
  let o;
  if (t === "viewport" || t === "layoutViewport")
    o = km(e, n, t);
  else if (t === "document")
    o = Cm(an(e));
  else if (mt(t))
    o = Em(t, n);
  else {
    const r = zu(e);
    o = {
      x: t.x - r.x,
      y: t.y - r.y,
      width: t.width,
      height: t.height
    };
  }
  return xn(o);
}
function Rm(e, t) {
  const n = t.get(e);
  if (n)
    return n;
  let o = Go(e, [], !1).filter((i) => mt(i) && Eo(i) !== "body"), r = null;
  const s = Kt(e).position === "fixed";
  let a = s ? zn(e) : e;
  for (; mt(a) && !Yo(a); ) {
    const i = Kt(a), c = ci(a), u = r ? r.position : s ? "fixed" : "";
    !c && (u === "fixed" || u === "absolute" && i.position === "static") ? o = o.filter((h) => h !== a) : r = i, a = zn(a);
  }
  return t.set(e, o), o;
}
function Nm(e) {
  let {
    element: t,
    boundary: n,
    rootBoundary: o,
    strategy: r
  } = e;
  const a = [...n === "clippingAncestors" ? gs(t) ? [] : Rm(t, this._c) : [].concat(n), o], i = Fc(t, a[0], r);
  let c = i.top, u = i.right, f = i.bottom, h = i.left;
  for (let d = 1; d < a.length; d++) {
    const m = Fc(t, a[d], r);
    c = kt(m.top, c), u = Ft(m.right, u), f = Ft(m.bottom, f), h = kt(m.left, h);
  }
  return {
    width: u - h,
    height: f - c,
    x: h,
    y: c
  };
}
function Tm(e) {
  const {
    width: t,
    height: n
  } = $u(e);
  return {
    width: t,
    height: n
  };
}
function Pm(e, t, n) {
  const o = Rn(t), r = an(t), s = n === "fixed", a = _n(e, !0, s, t);
  let i = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const c = en(0);
  if ((o || !s) && ((Eo(t) !== "body" || ms(r)) && (i = vs(t)), o)) {
    const d = _n(t, !0, s, t);
    c.x = d.x + t.clientLeft, c.y = d.y + t.clientTop;
  }
  !o && r && (c.x = ys(r));
  const u = r && !o && !s ? _u(r, i) : en(0), f = a.left + i.scrollLeft - c.x - u.x, h = a.top + i.scrollTop - c.y - u.y;
  return {
    x: f,
    y: h,
    width: a.width,
    height: a.height
  };
}
function Qs(e) {
  return Kt(e).position === "static";
}
function Bc(e, t) {
  if (!Rn(e) || Kt(e).position === "fixed")
    return null;
  if (t)
    return t(e);
  let n = e.offsetParent;
  return an(e) === n && (n = n.ownerDocument.body), n;
}
function Fu(e, t) {
  const n = gt(e);
  if (gs(e))
    return n;
  if (!Rn(e)) {
    let r = zn(e);
    for (; r && !Yo(r); ) {
      if (mt(r) && !Qs(r))
        return r;
      r = zn(r);
    }
    return n;
  }
  let o = Bc(e, t);
  for (; o && Bh(o) && Qs(o); )
    o = Bc(o, t);
  return o && Yo(o) && Qs(o) && !ci(o) ? n : o || Uh(e) || n;
}
const Am = async function(e) {
  const t = this.getOffsetParent || Fu, n = this.getDimensions, o = await n(e.floating);
  return {
    reference: Pm(e.reference, await t(e.floating), e.strategy),
    floating: {
      x: 0,
      y: 0,
      width: o.width,
      height: o.height
    }
  };
};
function Im(e) {
  return Kt(e).direction === "rtl";
}
const Mm = {
  convertOffsetParentRelativeRectToViewportRelativeRect: xm,
  getDocumentElement: an,
  getClippingRect: Nm,
  getOffsetParent: Fu,
  getElementRects: Am,
  getClientRects: Sm,
  getDimensions: Tm,
  getScale: io,
  isElement: mt,
  isRTL: Im
};
function Bu(e, t) {
  return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function Dm(e, t, n) {
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
      width: v,
      height: w
    } = d;
    if (f || t(), !v || !w)
      return;
    const x = Pr(g), E = Pr(s.clientWidth - (m + v)), C = Pr(s.clientHeight - (g + w)), j = Pr(m), T = {
      rootMargin: -x + "px " + -E + "px " + -C + "px " + -j + "px",
      threshold: kt(0, Ft(1, h)) || 1
    };
    let S = !0;
    function b(P) {
      const L = P[0].intersectionRatio;
      if (!Bu(d, e.getBoundingClientRect()))
        return i();
      if (L !== h) {
        if (!S)
          return i();
        L ? i(!1, L) : r = setTimeout(() => {
          i(!1, 1e-7);
        }, 1e3);
      }
      S = !1;
    }
    try {
      o = new IntersectionObserver(b, {
        ...T,
        // Handle <iframe>s
        root: s.ownerDocument
      });
    } catch {
      o = new IntersectionObserver(b, T);
    }
    o.observe(e);
  }
  const c = gt(e), u = () => i(n);
  return c.addEventListener("resize", u), i(!0), () => {
    c.removeEventListener("resize", u), a();
  };
}
function Vc(e, t, n, o) {
  o === void 0 && (o = {});
  const {
    ancestorScroll: r = !0,
    ancestorResize: s = !0,
    elementResize: a = typeof ResizeObserver == "function",
    layoutShift: i = typeof IntersectionObserver == "function",
    animationFrame: c = !1
  } = o, u = hi(e), f = r || s ? [...u ? Go(u) : [], ...t ? Go(t) : []] : [];
  f.forEach((x) => {
    r && x.addEventListener("scroll", n), s && x.addEventListener("resize", n);
  });
  const h = u && i ? Dm(u, n, s) : null;
  let d = -1, m = null;
  a && (m = new ResizeObserver((x) => {
    let [E] = x;
    E && E.target === u && m && t && (m.unobserve(t), cancelAnimationFrame(d), d = requestAnimationFrame(() => {
      var C;
      (C = m) == null || C.observe(t);
    })), n();
  }), u && !c && m.observe(u), t && m.observe(t));
  let g, v = c ? _n(e) : null;
  c && w();
  function w() {
    const x = _n(e);
    v && !Bu(v, x) && n(), v = x, g = requestAnimationFrame(w);
  }
  return n(), () => {
    var x;
    f.forEach((E) => {
      r && E.removeEventListener("scroll", n), s && E.removeEventListener("resize", n);
    }), h?.(), (x = m) == null || x.disconnect(), m = null, c && cancelAnimationFrame(g);
  };
}
const Om = mm, Lm = gm, $m = um, zm = ym, _m = dm, Hc = lm, Fm = pm, Bm = vm, Vm = (e, t, n) => {
  const o = /* @__PURE__ */ new Map(), r = n ?? {}, s = {
    ...Mm,
    ...r.platform,
    _c: o
  };
  return cm(e, t, {
    ...r,
    platform: s
  });
};
var Hm = typeof document < "u", Um = function() {
}, $r = Hm ? p.useLayoutEffect : Um;
function Zr(e, t) {
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
        if (!Zr(e[o], t[o]))
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
      if (!(s === "_owner" && e.$$typeof) && !Zr(e[s], t[s]))
        return !1;
    }
    return !0;
  }
  return e !== e && t !== t;
}
function Vu(e) {
  return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function Uc(e, t) {
  const n = Vu(e);
  return Math.round(t * n) / n;
}
function ea(e) {
  const t = p.useRef(e);
  return $r(() => {
    t.current = e;
  }), t;
}
function Wm(e) {
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
  Zr(d, o) || m(o);
  const [g, v] = p.useState(null), [w, x] = p.useState(null), E = p.useCallback((M) => {
    M !== T.current && (T.current = M, v(M));
  }, []), C = p.useCallback((M) => {
    M !== S.current && (S.current = M, x(M));
  }, []), j = s || g, R = a || w, T = p.useRef(null), S = p.useRef(null), b = p.useRef(f), P = c != null, L = ea(c), $ = ea(r), F = ea(u), B = p.useCallback(() => {
    if (!T.current || !S.current)
      return;
    const M = {
      placement: t,
      strategy: n,
      middleware: d
    };
    $.current && (M.platform = $.current), Vm(T.current, S.current, M).then((A) => {
      const _ = {
        ...A,
        // The floating element's position may be recomputed while it's closed
        // but still mounted (such as when transitioning out). To ensure
        // `isPositioned` will be `false` initially on the next open, avoid
        // setting it to `true` when `open === false` (must be specified).
        isPositioned: F.current !== !1
      };
      I.current && !Zr(b.current, _) && (b.current = _, qt.flushSync(() => {
        h(_);
      }));
    });
  }, [d, t, n, $, F]);
  $r(() => {
    u === !1 && b.current.isPositioned && (b.current.isPositioned = !1, h((M) => ({
      ...M,
      isPositioned: !1
    })));
  }, [u]);
  const I = p.useRef(!1);
  $r(() => (I.current = !0, () => {
    I.current = !1;
  }), []), $r(() => {
    if (j && (T.current = j), R && (S.current = R), j && R) {
      if (L.current)
        return L.current(j, R, B);
      B();
    }
  }, [j, R, B, L, P]);
  const O = p.useMemo(() => ({
    reference: T,
    floating: S,
    setReference: E,
    setFloating: C
  }), [E, C]), D = p.useMemo(() => ({
    reference: j,
    floating: R
  }), [j, R]), z = p.useMemo(() => {
    const M = {
      position: n,
      left: 0,
      top: 0
    };
    if (!D.floating)
      return M;
    const A = Uc(D.floating, f.x), _ = Uc(D.floating, f.y);
    return i ? {
      ...M,
      transform: "translate(" + A + "px, " + _ + "px)",
      ...Vu(D.floating) >= 1.5 && {
        willChange: "transform"
      }
    } : {
      position: n,
      left: A,
      top: _
    };
  }, [n, i, D.floating, f.x, f.y]);
  return p.useMemo(() => ({
    ...f,
    update: B,
    refs: O,
    elements: D,
    floatingStyles: z
  }), [f, B, O, D, z]);
}
const qm = (e) => {
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
      return o && t(o) ? o.current != null ? Hc({
        element: o.current,
        padding: r
      }).fn(n) : {} : o ? Hc({
        element: o,
        padding: r
      }).fn(n) : {};
    }
  };
}, Km = (e, t) => {
  const n = Om(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, Xm = (e, t) => {
  const n = Lm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, Ym = (e, t) => ({
  fn: Bm(e).fn,
  options: [e, t]
}), Gm = (e, t) => {
  const n = $m(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, Jm = (e, t) => {
  const n = zm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, Zm = (e, t) => {
  const n = _m(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, Wc = (e, t) => {
  const n = Fm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, Qm = (e, t) => {
  const n = qm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
};
function Hu(e) {
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
const eg = {
  ...Ql
};
let qc = !1, tg = 0;
const Kc = () => (
  // Ensure the id is unique with multiple independent versions of Floating UI
  // on <React 18
  "floating-ui-" + Math.random().toString(36).slice(2, 6) + tg++
);
function ng() {
  const [e, t] = p.useState(() => qc ? Kc() : void 0);
  return Ea(() => {
    e == null && t(Kc());
  }, []), p.useEffect(() => {
    qc = !0;
  }, []), e;
}
const og = eg.useId, rg = og || ng;
function sg() {
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
const ag = /* @__PURE__ */ p.createContext(null), ig = /* @__PURE__ */ p.createContext(null), cg = () => {
  var e;
  return ((e = p.useContext(ag)) == null ? void 0 : e.id) || null;
}, lg = () => p.useContext(ig);
function ug(e) {
  const {
    open: t = !1,
    onOpenChange: n,
    elements: o
  } = e, r = rg(), s = p.useRef({}), [a] = p.useState(() => sg()), i = cg() != null, [c, u] = p.useState(o.reference), f = sm((m, g, v) => {
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
function dg(e) {
  var t, n;
  let {
    elements: o,
    ...r
  } = e === void 0 ? {} : e;
  const {
    nodeId: s
  } = r, a = ug({
    ...r,
    elements: {
      reference: (t = o?.reference) != null ? t : null,
      floating: (n = o?.floating) != null ? n : null
    }
  }), i = r.rootContext || a, c = i.elements, [u, f] = p.useState(null), [h, d] = p.useState(null), g = c?.domReference || u, v = p.useRef(null), w = lg();
  Ea(() => {
    g && (v.current = g);
  }, [g]);
  const x = Wm({
    ...r,
    elements: {
      ...c,
      ...h && {
        reference: h
      }
    }
  }), E = p.useCallback((S) => {
    const b = mt(S) ? {
      getBoundingClientRect: () => S.getBoundingClientRect(),
      getClientRects: () => S.getClientRects(),
      contextElement: S
    } : S;
    d(b), x.refs.setReference(b);
  }, [x.refs]), C = p.useCallback((S) => {
    (mt(S) || S === null) && (v.current = S, f(S)), (mt(x.refs.reference.current) || x.refs.reference.current === null || // Don't allow setting virtual elements using the old technique back to
    // `null` to support `positionReference` + an unstable `reference`
    // callback ref.
    S !== null && !mt(S)) && x.refs.setReference(S);
  }, [x.refs]), j = p.useMemo(() => ({
    ...x.refs,
    setReference: C,
    setPositionReference: E,
    domReference: v
  }), [x.refs, C, E]), R = p.useMemo(() => ({
    ...x.elements,
    domReference: g
  }), [x.elements, g]), T = p.useMemo(() => ({
    ...x,
    ...i,
    refs: j,
    elements: R,
    nodeId: s
  }), [x, j, R, s, i]);
  return Ea(() => {
    i.dataRef.current.floatingContext = T;
    const S = w?.nodesRef.current.find((b) => b.id === s);
    S && (S.context = T);
  }), p.useMemo(() => ({
    ...x,
    context: T,
    refs: j,
    elements: R
  }), [x, j, R, T]);
}
const Uu = {
  scrollHideDelay: 1e3,
  type: "hover",
  scrollbars: "xy"
}, Wu = ze((e, { scrollbarSize: t, overscrollBehavior: n, scrollbars: o }) => {
  let r = n;
  return n && o && (o === "x" ? r = `${n} auto` : o === "y" && (r = `auto ${n}`)), { root: {
    "--scrollarea-scrollbar-size": Ae(t),
    "--scrollarea-over-scroll-behavior": r
  } };
}), Nn = se((e) => {
  const t = Z("ScrollArea", Uu, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, scrollbarSize: i, vars: c, type: u, scrollHideDelay: f, viewportProps: h, viewportRef: d, onScrollPositionChange: m, children: g, offsetScrollbars: v, scrollbars: w, onBottomReached: x, onTopReached: E, onLeftReached: C, onRightReached: j, overscrollBehavior: R, startScrollPosition: T, verticalScrollbarPosition: S, attributes: b, ...P } = t, [L, $] = p.useState(!1), [F, B] = p.useState(!1), [I, O] = p.useState(!1), D = p.useRef(!0), z = p.useRef(!1), M = p.useRef(!0), A = p.useRef(!1), _ = De({
    name: "ScrollArea",
    props: t,
    classes: ii,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: b,
    vars: c,
    varsResolver: Wu
  }), H = p.useRef(null), [W, Y] = p.useState(null), ae = p.useCallback((ie) => {
    Y((te) => te === ie ? te : ie);
  }, []), fe = Hu([
    d,
    H,
    ae
  ]);
  return jn(v === "present" ? W : null, () => {
    const ie = H.current;
    ie && (B(ie.scrollHeight > ie.clientHeight), O(ie.scrollWidth > ie.clientWidth));
  }), qo(() => {
    T && H.current && H.current.scrollTo({
      left: T.x ?? 0,
      top: T.y ?? 0
    });
  }, []), /* @__PURE__ */ l.jsxs(xu, {
    getStyles: _,
    type: u === "never" ? "always" : u,
    scrollHideDelay: f,
    scrollbars: w,
    ..._("root"),
    ...P,
    children: [
      /* @__PURE__ */ l.jsx(Au, {
        ...h,
        ..._("viewport", { style: h?.style }),
        ref: fe,
        "data-offset-scrollbars": v === !0 ? "xy" : v || void 0,
        "data-scrollbars": w || void 0,
        "data-vertical-scrollbar-position": S || void 0,
        "data-horizontal-hidden": v === "present" && !I ? "true" : void 0,
        "data-vertical-hidden": v === "present" && !F ? "true" : void 0,
        onScroll: (ie) => {
          h?.onScroll?.(ie), m?.({
            x: ie.currentTarget.scrollLeft,
            y: ie.currentTarget.scrollTop
          });
          const { scrollTop: te, scrollHeight: he, clientHeight: q, scrollLeft: K, scrollWidth: le, clientWidth: xe } = ie.currentTarget, pe = te - (he - q) >= -0.8, je = te === 0;
          pe && !z.current && x?.(), je && !D.current && E?.(), z.current = pe, D.current = je;
          const ne = K - (le - xe) >= -0.8, U = K === 0;
          ne && !A.current && j?.(), U && !M.current && C?.(), A.current = ne, M.current = U;
        },
        children: g
      }),
      (w === "xy" || w === "x") && /* @__PURE__ */ l.jsx(Sa, {
        ..._("scrollbar"),
        orientation: "horizontal",
        "data-vertical-scrollbar-position": S || void 0,
        "data-hidden": u === "never" || v === "present" && !I ? !0 : void 0,
        forceMount: !0,
        onMouseEnter: () => $(!0),
        onMouseLeave: () => $(!1),
        children: /* @__PURE__ */ l.jsx(Ca, { ..._("thumb") })
      }),
      (w === "xy" || w === "y") && /* @__PURE__ */ l.jsx(Sa, {
        ..._("scrollbar"),
        orientation: "vertical",
        "data-vertical-scrollbar-position": S || void 0,
        "data-hidden": u === "never" || v === "present" && !F ? !0 : void 0,
        forceMount: !0,
        onMouseEnter: () => $(!0),
        onMouseLeave: () => $(!1),
        children: /* @__PURE__ */ l.jsx(Ca, { ..._("thumb") })
      }),
      /* @__PURE__ */ l.jsx(Dh, {
        ..._("corner"),
        "data-vertical-scrollbar-position": S || void 0,
        "data-hovered": L || void 0,
        "data-hidden": u === "never" || void 0
      })
    ]
  });
});
Nn.displayName = "@mantine/core/ScrollArea";
const mi = se((e) => {
  const { children: t, classNames: n, styles: o, scrollbarSize: r, scrollHideDelay: s, type: a, dir: i, offsetScrollbars: c, overscrollBehavior: u, viewportRef: f, onScrollPositionChange: h, unstyled: d, variant: m, viewportProps: g, scrollbars: v, style: w, vars: x, onBottomReached: E, onTopReached: C, startScrollPosition: j, verticalScrollbarPosition: R, onOverflowChange: T, ...S } = Z("ScrollAreaAutosize", Uu, e), b = p.useRef(null), [P, L] = p.useState(null), $ = p.useCallback((D) => {
    L((z) => z === D ? z : D);
  }, []), F = Hu([
    f,
    b,
    $
  ]), B = p.useRef(!1), I = p.useRef(!1), O = p.useEffectEvent(() => {
    const D = b.current;
    if (!D || !T) return;
    const z = D.scrollHeight > D.clientHeight;
    z !== B.current && (I.current ? T(z) : (I.current = !0, z && T(!0)), B.current = z);
  });
  return jn(T ? P : null, O), /* @__PURE__ */ l.jsx(Q, {
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
        viewportRef: F,
        onScrollPositionChange: h,
        unstyled: d,
        variant: m,
        viewportProps: g,
        vars: x,
        scrollbars: v,
        onBottomReached: E,
        onTopReached: C,
        startScrollPosition: j,
        verticalScrollbarPosition: R,
        "data-autosize": "true",
        children: t
      })
    })
  });
});
Nn.classes = ii;
Nn.varsResolver = Wu;
mi.displayName = "@mantine/core/ScrollAreaAutosize";
mi.classes = ii;
Nn.Autosize = mi;
var qu = { root: "m_515a97f8" };
const gi = se((e) => {
  const t = Z("VisuallyHidden", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, attributes: c, ...u } = t, f = De({
    name: "VisuallyHidden",
    classes: qu,
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
gi.classes = qu;
gi.displayName = "@mantine/core/VisuallyHidden";
function Xc(e, t, n, o) {
  return e === "center" || o === "center" ? { top: t } : e === "end" ? { bottom: n } : e === "start" ? { top: n } : {};
}
function Yc(e, t, n, o, r) {
  return e === "center" || o === "center" ? { left: t } : e === "end" ? { [r === "ltr" ? "right" : "left"]: n } : e === "start" ? { [r === "ltr" ? "left" : "right"]: n } : {};
}
const fg = {
  bottom: "borderTopLeftRadius",
  left: "borderTopRightRadius",
  right: "borderBottomLeftRadius",
  top: "borderBottomRightRadius"
};
function pg({ position: e, arrowSize: t, dir: n }) {
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
function hg({ position: e, arrowSize: t, arrowOffset: n, arrowRadius: o, arrowPosition: r, arrowX: s, arrowY: a, dir: i }) {
  if (r === "merge") {
    const d = pg({
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
    [fg[c]]: o
  }, h = -t / 2;
  return c === "left" ? {
    ...f,
    ...Xc(u, a, n, r),
    right: h,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    clipPath: "polygon(100% 0, 0 0, 100% 100%)"
  } : c === "right" ? {
    ...f,
    ...Xc(u, a, n, r),
    left: h,
    borderRightColor: "transparent",
    borderTopColor: "transparent",
    clipPath: "polygon(0 100%, 0 0, 100% 100%)"
  } : c === "top" ? {
    ...f,
    ...Yc(u, s, n, r, i),
    bottom: h,
    borderTopColor: "transparent",
    borderLeftColor: "transparent",
    clipPath: "polygon(0 100%, 100% 100%, 100% 0)"
  } : c === "bottom" ? {
    ...f,
    ...Yc(u, s, n, r, i),
    top: h,
    borderBottomColor: "transparent",
    borderRightColor: "transparent",
    clipPath: "polygon(0 100%, 0 0, 100% 0)"
  } : {};
}
function mg({ position: e, dir: t }) {
  const [n, o] = e.split("-");
  if (!o) return;
  const r = o === "start" && t === "ltr" || o === "end" && t === "rtl";
  if (n === "bottom") return r ? { borderTopLeftRadius: 0 } : { borderTopRightRadius: 0 };
  if (n === "top") return r ? { borderBottomLeftRadius: 0 } : { borderBottomRightRadius: 0 };
  if (n === "left") return o === "start" ? { borderTopRightRadius: 0 } : { borderBottomRightRadius: 0 };
  if (n === "right") return o === "start" ? { borderTopLeftRadius: 0 } : { borderBottomLeftRadius: 0 };
}
function Ku({ position: e, arrowSize: t, arrowOffset: n, arrowRadius: o, arrowPosition: r, visible: s, arrowX: a, arrowY: i, style: c, ...u }) {
  const { dir: f } = ko();
  return s ? /* @__PURE__ */ l.jsx("div", {
    role: "presentation",
    ...u,
    style: {
      ...c,
      ...hg({
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
Ku.displayName = "@mantine/core/FloatingArrow";
function gg(e, t) {
  if (e === "rtl" && (t.includes("right") || t.includes("left"))) {
    const [n, o] = t.split("-"), r = n === "right" ? "left" : "right";
    return o === void 0 ? r : `${r}-${o}`;
  }
  return t;
}
const [vg, vi] = Gt("Popover component was not found in the tree");
function yg({ childProps: e, disabled: t, opened: n, longPressDelay: o = 500, setReference: r, open: s }) {
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
  }, h = Jn(e.onMouseDown, (g) => {
    t || g.button === 2 && g.stopPropagation();
  }), d = Jn(e.onContextMenu, (g) => {
    t || g.defaultPrevented || (g.preventDefault(), !i.current && (f(g.clientX, g.clientY, g.currentTarget), a.current && (i.current = !0)));
  }), m = Ch((g) => {
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
    onTouchStart: Jn(e.onTouchStart, m.onTouchStart),
    onTouchEnd: Jn(e.onTouchEnd, m.onTouchEnd),
    onTouchCancel: Jn(e.onTouchCancel, m.onTouchCancel),
    onTouchMove: Jn(e.onTouchMove, m.onTouchMove),
    style: t ? e.style : {
      ...e.style,
      WebkitTouchCallout: "none",
      WebkitUserSelect: "none",
      userSelect: "none"
    },
    "data-expanded": n ? !0 : void 0
  };
}
function Xu(e) {
  const { children: t, disabled: n, longPressDelay: o } = Z("PopoverContextMenu", null, e), r = dr(t);
  if (!r) throw new Error("Popover.ContextMenu component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  const s = vi(), a = yg({
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
Xu.displayName = "@mantine/core/PopoverContextMenu";
function bs({ children: e, active: t = !0, refProp: n = "ref", innerRef: o }) {
  const r = lh(t), s = Ve(r, o), a = dr(e);
  return a ? p.cloneElement(a, { [n]: s }) : e;
}
function Yu(e) {
  return /* @__PURE__ */ l.jsx(gi, {
    tabIndex: -1,
    "data-autofocus": !0,
    ...e
  });
}
bs.displayName = "@mantine/core/FocusTrap";
Yu.displayName = "@mantine/core/FocusTrapInitialFocus";
bs.InitialFocus = Yu;
var Gu = {
  dropdown: "m_38a85659",
  arrow: "m_a31dc6c1",
  overlay: "m_3d7bc908"
};
const yi = se((e) => {
  const t = Z("PopoverDropdown", null, e), { className: n, style: o, vars: r, children: s, onKeyDownCapture: a, variant: i, classNames: c, styles: u, ref: f, ...h } = t, d = vi(), { dir: m } = ko(), g = d.arrowPosition === "merge" && d.withArrow ? mg({
    position: d.placement,
    dir: m
  }) : void 0, v = du({
    opened: d.opened,
    shouldReturnFocus: d.returnFocus
  }), w = d.withRoles ? {
    "aria-labelledby": d.getTargetId(),
    id: d.getDropdownId(),
    role: "dialog",
    tabIndex: -1
  } : {}, x = Ve(f, d.floating);
  return d.disabled ? null : /* @__PURE__ */ l.jsx(ei, {
    ...d.portalProps,
    withinPortal: d.withinPortal,
    children: /* @__PURE__ */ l.jsx(ls, {
      mounted: d.opened,
      ...d.transitionProps,
      transition: d.transitionProps?.transition || "fade",
      duration: d.transitionProps?.duration ?? 150,
      keepMounted: d.keepMounted,
      keepMountedMode: d.keepMountedMode,
      exitDuration: typeof d.transitionProps?.exitDuration == "number" ? d.transitionProps.exitDuration : d.transitionProps?.duration,
      children: (E) => /* @__PURE__ */ l.jsx(bs, {
        active: d.trapFocus && d.opened,
        innerRef: x,
        children: /* @__PURE__ */ l.jsxs(Q, {
          ...w,
          ...h,
          variant: i,
          onKeyDownCapture: eh(() => {
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
          children: [s, /* @__PURE__ */ l.jsx(Ku, {
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
yi.classes = Gu;
yi.displayName = "@mantine/core/PopoverDropdown";
const bg = {
  refProp: "ref",
  popupType: "dialog"
}, Ju = se((e) => {
  const { children: t, refProp: n, popupType: o, ref: r, ...s } = Z("PopoverTarget", bg, e), a = dr(t);
  if (!a) throw new Error("Popover.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  const i = s, c = vi(), u = Ve(c.reference, bu(a), r), f = c.withRoles ? {
    "aria-haspopup": o,
    "aria-expanded": c.opened,
    "aria-controls": c.opened ? c.getDropdownId() : void 0,
    id: c.getTargetId()
  } : {}, h = a.props;
  return p.cloneElement(a, {
    ...i,
    ...f,
    ...c.targetProps,
    className: on(c.targetProps.className, i.className, h.className),
    [n]: u,
    ...c.controlled ? null : { onClick: (d) => {
      c.onToggle(), h.onClick?.(d);
    } }
  });
});
Ju.displayName = "@mantine/core/PopoverTarget";
function wg(e) {
  if (e === void 0) return {
    shift: !0,
    flip: !0
  };
  const t = { ...e };
  return e.shift === void 0 && (t.shift = !0), e.flip === void 0 && (t.flip = !0), t;
}
function xg(e, t, n, o) {
  const r = wg(e.middlewares), s = [Km(e.offset), Zm()];
  if (r.flip && !n) {
    const a = typeof r.flip == "boolean" ? {} : r.flip, i = o ? {
      fallbackStrategy: "initialPlacement",
      ...a
    } : a;
    s.push(Gm(i));
  }
  if (r.shift) {
    const a = typeof r.shift == "boolean" ? {} : r.shift;
    s.push(Xm((i) => {
      const c = i.placement.startsWith("top") || i.placement.startsWith("bottom");
      return {
        limiter: Ym(),
        padding: 5,
        ...e.width === "target" && c ? { mainAxis: !1 } : null,
        ...a
      };
    }));
  }
  return r.inline && s.push(typeof r.inline == "boolean" ? Wc() : Wc(r.inline)), s.push(Qm({
    element: e.arrowRef,
    padding: e.arrowOffset
  })), (r.size || e.width === "target") && s.push(Jm({
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
function Sg(e) {
  const [t, n] = Qe({
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
  }, m = dg({
    open: t,
    strategy: e.strategy,
    placement: i ? s ?? e.position : e.position,
    middleware: xg(e, () => m, i && s !== null, i),
    whileElementsMounted: e.keepMounted ? void 0 : Vc
  });
  p.useEffect(() => {
    if (!e.keepMounted) return;
    const v = m.refs.reference.current, w = m.refs.floating.current;
    if (t && v && w) return Vc(v, w, m.update);
  }, [
    e.keepMounted,
    t,
    m.update,
    m.elements.reference,
    m.elements.floating
  ]), qo(() => {
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
  return qo(() => {
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
const Cg = {
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
  zIndex: jo("popover"),
  __staticSelector: "Popover",
  width: "max-content"
}, Zu = ze((e, { radius: t, shadow: n }) => ({ dropdown: {
  "--popover-radius": t === void 0 ? void 0 : Tt(t),
  "--popover-shadow": eu(n)
} }));
function He(e) {
  const t = Z("Popover", Cg, e), { children: n, position: o, offset: r, onPositionChange: s, opened: a, transitionProps: i, onExitTransitionEnd: c, onEnterTransitionEnd: u, width: f, middlewares: h, withArrow: d, arrowSize: m, arrowOffset: g, arrowRadius: v, arrowPosition: w, unstyled: x, classNames: E, styles: C, closeOnClickOutside: j, withinPortal: R, portalProps: T, closeOnEscape: S, clickOutsideEvents: b, trapFocus: P, onClose: L, onDismiss: $, onOpen: F, onChange: B, zIndex: I, radius: O, shadow: D, id: z, defaultOpened: M, __staticSelector: A, withRoles: _, disabled: H, returnFocus: W, variant: Y, keepMounted: ae, keepMountedMode: fe, vars: ie, floatingStrategy: te, withOverlay: he, overlayProps: q, hideDetached: K, attributes: le, preventPositionChangeWhenVisible: xe, ...pe } = t, je = De({
    name: A,
    props: t,
    classes: Gu,
    classNames: E,
    styles: C,
    unstyled: x,
    attributes: le,
    rootSelector: "dropdown",
    vars: ie,
    varsResolver: Zu
  }), { resolvedStyles: ne } = ur({
    classNames: E,
    styles: C,
    props: t
  }), U = p.useRef(null), [V, X] = p.useState(null), [ue, ke] = p.useState(null), { dir: Ie } = ko(), me = Ja(), ge = Vt(z), Se = Sg({
    middlewares: h,
    width: f,
    position: gg(Ie, o),
    offset: typeof r == "number" ? r + (d ? m / 2 : 0) : r,
    arrowRef: U,
    arrowOffset: g,
    onPositionChange: s,
    opened: a,
    defaultOpened: M,
    onChange: B,
    onOpen: F,
    onClose: L,
    onDismiss: $,
    strategy: te,
    disabled: H,
    preventPositionChangeWhenVisible: xe,
    keepMounted: ae
  });
  uu(() => {
    j && (Se.onClose(), $?.());
  }, b, [V, ue]);
  const Oe = p.useCallback((yt) => {
    X(yt), Se.floating.refs.setReference(yt);
  }, [Se.floating.refs.setReference]), de = p.useCallback((yt) => {
    ke(yt), Se.floating.refs.setFloating(yt);
  }, [Se.floating.refs.setFloating]), vt = p.useCallback(() => {
    i?.onExited?.(), c?.(), Se.resetLockedPlacement();
  }, [
    i?.onExited,
    c,
    Se.resetLockedPlacement
  ]), Te = p.useCallback(() => {
    i?.onEntered?.(), u?.();
  }, [i?.onEntered, u]);
  return /* @__PURE__ */ l.jsxs(vg, {
    value: {
      returnFocus: W,
      disabled: H,
      controlled: Se.controlled,
      reference: Oe,
      floating: de,
      x: Se.floating.x,
      y: Se.floating.y,
      arrowX: Se.floating?.middlewareData?.arrow?.x,
      arrowY: Se.floating?.middlewareData?.arrow?.y,
      opened: Se.opened,
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
      placement: Se.floating.placement,
      trapFocus: P,
      withinPortal: R,
      portalProps: T,
      zIndex: I,
      radius: O,
      shadow: D,
      closeOnEscape: S,
      onDismiss: $,
      onClose: Se.onClose,
      onToggle: Se.onToggle,
      getTargetId: () => ge,
      getDropdownId: () => `${ge}-dropdown`,
      withRoles: _,
      targetProps: pe,
      __staticSelector: A,
      classNames: E,
      styles: C,
      unstyled: x,
      variant: Y,
      keepMounted: ae,
      keepMountedMode: fe,
      getStyles: je,
      resolvedStyles: ne,
      floatingStrategy: te,
      referenceHidden: K && me !== "test" ? Se.floating.middlewareData.hide?.referenceHidden : !1
    },
    children: [n, he && /* @__PURE__ */ l.jsx(ls, {
      transition: "fade",
      mounted: Se.opened,
      duration: i?.duration || 250,
      exitDuration: i?.exitDuration || 250,
      children: (yt) => /* @__PURE__ */ l.jsx(ei, {
        withinPortal: R,
        children: /* @__PURE__ */ l.jsx(su, {
          ...q,
          ...je("overlay", {
            className: q?.className,
            style: [yt, q?.style]
          })
        })
      })
    })]
  });
}
He.Target = Ju;
He.Dropdown = yi;
He.ContextMenu = Xu;
He.varsResolver = Zu;
He.displayName = "@mantine/core/Popover";
He.extend = (e) => e;
He.withProps = (e) => {
  const t = (n) => /* @__PURE__ */ l.jsx(He, {
    ...e,
    ...n
  });
  return t.extend = He.extend, t.displayName = `WithProps(${He.displayName})`, t;
};
const [jg, cn] = Gt("ModalBase component was not found in tree");
function kg({ opened: e, transitionDuration: t }) {
  const [n, o] = p.useState(e), r = p.useRef(-1), s = Za() ? 0 : t;
  return p.useEffect(() => (e ? (o(!0), window.clearTimeout(r.current)) : s === 0 ? o(!1) : r.current = window.setTimeout(() => o(!1), s), () => window.clearTimeout(r.current)), [e, s]), n;
}
function Eg({ id: e, transitionProps: t, opened: n, trapFocus: o, closeOnEscape: r, onClose: s, returnFocus: a, handledEscapeEvents: i }) {
  const c = Vt(e), [u, f] = p.useState(!1), [h, d] = p.useState(!1), m = typeof t?.duration == "number" ? t?.duration : 200, g = kg({
    opened: n,
    transitionDuration: m
  });
  return fh("keydown", (v) => {
    v.key === "Escape" && r && !v.isComposing && n && !i?.has(v) && v.target?.getAttribute("data-mantine-stop-propagation") !== "true" && (i?.add(v), s());
  }, { capture: !0 }), du({
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
var Wt = function() {
  return Wt = Object.assign || function(t) {
    for (var n, o = 1, r = arguments.length; o < r; o++) {
      n = arguments[o];
      for (var s in n) Object.prototype.hasOwnProperty.call(n, s) && (t[s] = n[s]);
    }
    return t;
  }, Wt.apply(this, arguments);
};
function Qu(e, t) {
  var n = {};
  for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var r = 0, o = Object.getOwnPropertySymbols(e); r < o.length; r++)
      t.indexOf(o[r]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[r]) && (n[o[r]] = e[o[r]]);
  return n;
}
function Rg(e, t, n) {
  if (n || arguments.length === 2) for (var o = 0, r = t.length, s; o < r; o++)
    (s || !(o in t)) && (s || (s = Array.prototype.slice.call(t, 0, o)), s[o] = t[o]);
  return e.concat(s || Array.prototype.slice.call(t));
}
var zr = "right-scroll-bar-position", _r = "width-before-scroll-bar", Ng = "with-scroll-bars-hidden", Tg = "--removed-body-scroll-bar-size";
function ta(e, t) {
  return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
function Pg(e, t) {
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
var Ag = typeof window < "u" ? p.useLayoutEffect : p.useEffect, Gc = /* @__PURE__ */ new WeakMap();
function Ig(e, t) {
  var n = Pg(null, function(o) {
    return e.forEach(function(r) {
      return ta(r, o);
    });
  });
  return Ag(function() {
    var o = Gc.get(n);
    if (o) {
      var r = new Set(o), s = new Set(e), a = n.current;
      r.forEach(function(i) {
        s.has(i) || ta(i, null);
      }), s.forEach(function(i) {
        r.has(i) || ta(i, a);
      });
    }
    Gc.set(n, e);
  }, [e]), n;
}
function Mg(e) {
  return e;
}
function Dg(e, t) {
  t === void 0 && (t = Mg);
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
function Og(e) {
  e === void 0 && (e = {});
  var t = Dg(null);
  return t.options = Wt({ async: !0, ssr: !1 }, e), t;
}
var ed = function(e) {
  var t = e.sideCar, n = Qu(e, ["sideCar"]);
  if (!t)
    throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  var o = t.read();
  if (!o)
    throw new Error("Sidecar medium not found");
  return p.createElement(o, Wt({}, n));
};
ed.isSideCarExport = !0;
function Lg(e, t) {
  return e.useMedium(t), ed;
}
var td = Og(), na = function() {
}, ws = p.forwardRef(function(e, t) {
  var n = p.useRef(null), o = p.useState({
    onScrollCapture: na,
    onWheelCapture: na,
    onTouchMoveCapture: na
  }), r = o[0], s = o[1], a = e.forwardProps, i = e.children, c = e.className, u = e.removeScrollBar, f = e.enabled, h = e.shards, d = e.sideCar, m = e.noRelative, g = e.noIsolation, v = e.inert, w = e.allowPinchZoom, x = e.as, E = x === void 0 ? "div" : x, C = e.gapMode, j = Qu(e, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]), R = d, T = Ig([n, t]), S = Wt(Wt({}, j), r);
  return p.createElement(
    p.Fragment,
    null,
    f && p.createElement(R, { sideCar: td, removeScrollBar: u, shards: h, noRelative: m, noIsolation: g, inert: v, setCallbacks: s, allowPinchZoom: !!w, lockRef: n, gapMode: C }),
    a ? p.cloneElement(p.Children.only(i), Wt(Wt({}, S), { ref: T })) : p.createElement(E, Wt({}, S, { className: c, ref: T }), i)
  );
});
ws.defaultProps = {
  enabled: !0,
  removeScrollBar: !0,
  inert: !1
};
ws.classNames = {
  fullWidth: _r,
  zeroRight: zr
};
var $g = function() {
  if (typeof __webpack_nonce__ < "u")
    return __webpack_nonce__;
};
function zg() {
  if (!document)
    return null;
  var e = document.createElement("style");
  e.type = "text/css";
  var t = $g();
  return t && e.setAttribute("nonce", t), e;
}
function _g(e, t) {
  e.styleSheet ? e.styleSheet.cssText = t : e.appendChild(document.createTextNode(t));
}
function Fg(e) {
  var t = document.head || document.getElementsByTagName("head")[0];
  t.appendChild(e);
}
var Bg = function() {
  var e = 0, t = null;
  return {
    add: function(n) {
      e == 0 && (t = zg()) && (_g(t, n), Fg(t)), e++;
    },
    remove: function() {
      e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), t = null);
    }
  };
}, Vg = function() {
  var e = Bg();
  return function(t, n) {
    p.useEffect(function() {
      return e.add(t), function() {
        e.remove();
      };
    }, [t && n]);
  };
}, nd = function() {
  var e = Vg(), t = function(n) {
    var o = n.styles, r = n.dynamic;
    return e(o, r), null;
  };
  return t;
}, Hg = {
  left: 0,
  top: 0,
  right: 0,
  gap: 0
}, oa = function(e) {
  return parseInt(e || "", 10) || 0;
}, Ug = function(e) {
  var t = window.getComputedStyle(document.body), n = t[e === "padding" ? "paddingLeft" : "marginLeft"], o = t[e === "padding" ? "paddingTop" : "marginTop"], r = t[e === "padding" ? "paddingRight" : "marginRight"];
  return [oa(n), oa(o), oa(r)];
}, Wg = function(e) {
  if (e === void 0 && (e = "margin"), typeof window > "u")
    return Hg;
  var t = Ug(e), n = document.documentElement.clientWidth, o = window.innerWidth;
  return {
    left: t[0],
    top: t[1],
    right: t[2],
    gap: Math.max(0, o - n + t[2] - t[0])
  };
}, qg = nd(), co = "data-scroll-locked", Kg = function(e, t, n, o) {
  var r = e.left, s = e.top, a = e.right, i = e.gap;
  return n === void 0 && (n = "margin"), `
  .`.concat(Ng, ` {
   overflow: hidden `).concat(o, `;
   padding-right: `).concat(i, "px ").concat(o, `;
  }
  body[`).concat(co, `] {
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
  
  .`).concat(zr, ` {
    right: `).concat(i, "px ").concat(o, `;
  }
  
  .`).concat(_r, ` {
    margin-right: `).concat(i, "px ").concat(o, `;
  }
  
  .`).concat(zr, " .").concat(zr, ` {
    right: 0 `).concat(o, `;
  }
  
  .`).concat(_r, " .").concat(_r, ` {
    margin-right: 0 `).concat(o, `;
  }
  
  body[`).concat(co, `] {
    `).concat(Tg, ": ").concat(i, `px;
  }
`);
}, Jc = function() {
  var e = parseInt(document.body.getAttribute(co) || "0", 10);
  return isFinite(e) ? e : 0;
}, Xg = function() {
  p.useEffect(function() {
    return document.body.setAttribute(co, (Jc() + 1).toString()), function() {
      var e = Jc() - 1;
      e <= 0 ? document.body.removeAttribute(co) : document.body.setAttribute(co, e.toString());
    };
  }, []);
}, Yg = function(e) {
  var t = e.noRelative, n = e.noImportant, o = e.gapMode, r = o === void 0 ? "margin" : o;
  Xg();
  var s = p.useMemo(function() {
    return Wg(r);
  }, [r]);
  return p.createElement(qg, { styles: Kg(s, !t, r, n ? "" : "!important") });
}, Ra = !1;
if (typeof window < "u")
  try {
    var Ar = Object.defineProperty({}, "passive", {
      get: function() {
        return Ra = !0, !0;
      }
    });
    window.addEventListener("test", Ar, Ar), window.removeEventListener("test", Ar, Ar);
  } catch {
    Ra = !1;
  }
var Zn = Ra ? { passive: !1 } : !1, Gg = function(e) {
  return e.tagName === "TEXTAREA";
}, od = function(e, t) {
  if (!(e instanceof Element))
    return !1;
  var n = window.getComputedStyle(e);
  return (
    // not-not-scrollable
    n[t] !== "hidden" && // contains scroll inside self
    !(n.overflowY === n.overflowX && !Gg(e) && n[t] === "visible")
  );
}, Jg = function(e) {
  return od(e, "overflowY");
}, Zg = function(e) {
  return od(e, "overflowX");
}, Zc = function(e, t) {
  var n = t.ownerDocument, o = t;
  do {
    typeof ShadowRoot < "u" && o instanceof ShadowRoot && (o = o.host);
    var r = rd(e, o);
    if (r) {
      var s = sd(e, o), a = s[1], i = s[2];
      if (a > i)
        return !0;
    }
    o = o.parentNode;
  } while (o && o !== n.body);
  return !1;
}, Qg = function(e) {
  var t = e.scrollTop, n = e.scrollHeight, o = e.clientHeight;
  return [
    t,
    n,
    o
  ];
}, ev = function(e) {
  var t = e.scrollLeft, n = e.scrollWidth, o = e.clientWidth;
  return [
    t,
    n,
    o
  ];
}, rd = function(e, t) {
  return e === "v" ? Jg(t) : Zg(t);
}, sd = function(e, t) {
  return e === "v" ? Qg(t) : ev(t);
}, tv = function(e, t) {
  return e === "h" && t === "rtl" ? -1 : 1;
}, nv = function(e, t, n, o, r) {
  var s = tv(e, window.getComputedStyle(t).direction), a = s * o, i = n.target, c = t.contains(i), u = !1, f = a > 0, h = 0, d = 0;
  do {
    if (!i)
      break;
    var m = sd(e, i), g = m[0], v = m[1], w = m[2], x = v - w - s * g;
    (g || x) && rd(e, i) && (h += x, d += g);
    var E = i.parentNode;
    i = E && E.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? E.host : E;
  } while (
    // portaled content
    !c && i !== document.body || // self content
    c && (t.contains(i) || t === i)
  );
  return (f && Math.abs(h) < 1 || !f && Math.abs(d) < 1) && (u = !0), u;
}, Ir = function(e) {
  return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, Qc = function(e) {
  return [e.deltaX, e.deltaY];
}, el = function(e) {
  return e && "current" in e ? e.current : e;
}, ov = function(e, t) {
  return e[0] === t[0] && e[1] === t[1];
}, rv = function(e) {
  return `
  .block-interactivity-`.concat(e, ` {pointer-events: none;}
  .allow-interactivity-`).concat(e, ` {pointer-events: all;}
`);
}, sv = 0, Qn = [];
function av(e) {
  var t = p.useRef([]), n = p.useRef([0, 0]), o = p.useRef(), r = p.useState(sv++)[0], s = p.useState(nd)[0], a = p.useRef(e);
  p.useEffect(function() {
    a.current = e;
  }, [e]), p.useEffect(function() {
    if (e.inert) {
      document.body.classList.add("block-interactivity-".concat(r));
      var v = Rg([e.lockRef.current], (e.shards || []).map(el), !0).filter(Boolean);
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
    var x = Ir(v), E = n.current, C = "deltaX" in v ? v.deltaX : E[0] - x[0], j = "deltaY" in v ? v.deltaY : E[1] - x[1], R, T = v.target, S = Math.abs(C) > Math.abs(j) ? "h" : "v";
    if ("touches" in v && S === "h" && T.type === "range")
      return !1;
    var b = window.getSelection(), P = b && b.anchorNode, L = P ? P === T || P.contains(T) : !1;
    if (L)
      return !1;
    var $ = Zc(S, T);
    if (!$)
      return !0;
    if ($ ? R = S : (R = S === "v" ? "h" : "v", $ = Zc(S, T)), !$)
      return !1;
    if (!o.current && "changedTouches" in v && (C || j) && (o.current = R), !R)
      return !0;
    var F = o.current || R;
    return nv(F, w, v, F === "h" ? C : j);
  }, []), c = p.useCallback(function(v) {
    var w = v;
    if (!(!Qn.length || Qn[Qn.length - 1] !== s)) {
      var x = "deltaY" in w ? Qc(w) : Ir(w), E = t.current.filter(function(R) {
        return R.name === w.type && (R.target === w.target || w.target === R.shadowParent) && ov(R.delta, x);
      })[0];
      if (E && E.should) {
        w.cancelable && w.preventDefault();
        return;
      }
      if (!E) {
        var C = (a.current.shards || []).map(el).filter(Boolean).filter(function(R) {
          return R.contains(w.target);
        }), j = C.length > 0 ? i(w, C[0]) : !a.current.noIsolation;
        j && w.cancelable && w.preventDefault();
      }
    }
  }, []), u = p.useCallback(function(v, w, x, E) {
    var C = { name: v, delta: w, target: x, should: E, shadowParent: iv(x) };
    t.current.push(C), setTimeout(function() {
      t.current = t.current.filter(function(j) {
        return j !== C;
      });
    }, 1);
  }, []), f = p.useCallback(function(v) {
    n.current = Ir(v), o.current = void 0;
  }, []), h = p.useCallback(function(v) {
    u(v.type, Qc(v), v.target, i(v, e.lockRef.current));
  }, []), d = p.useCallback(function(v) {
    u(v.type, Ir(v), v.target, i(v, e.lockRef.current));
  }, []);
  p.useEffect(function() {
    return Qn.push(s), e.setCallbacks({
      onScrollCapture: h,
      onWheelCapture: h,
      onTouchMoveCapture: d
    }), document.addEventListener("wheel", c, Zn), document.addEventListener("touchmove", c, Zn), document.addEventListener("touchstart", f, Zn), function() {
      Qn = Qn.filter(function(v) {
        return v !== s;
      }), document.removeEventListener("wheel", c, Zn), document.removeEventListener("touchmove", c, Zn), document.removeEventListener("touchstart", f, Zn);
    };
  }, []);
  var m = e.removeScrollBar, g = e.inert;
  return p.createElement(
    p.Fragment,
    null,
    g ? p.createElement(s, { styles: rv(r) }) : null,
    m ? p.createElement(Yg, { noRelative: e.noRelative, gapMode: e.gapMode }) : null
  );
}
function iv(e) {
  for (var t = null; e !== null; )
    e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
  return t;
}
const cv = Lg(td, av);
var ad = p.forwardRef(function(e, t) {
  return p.createElement(ws, Wt({}, e, { ref: t, sideCar: cv }));
});
ad.classNames = ws.classNames;
function id({ keepMounted: e, keepMountedMode: t = "activity", opened: n, onClose: o, id: r, transitionProps: s, onExitTransitionEnd: a, onEnterTransitionEnd: i, trapFocus: c, closeOnEscape: u, returnFocus: f, closeOnClickOutside: h, withinPortal: d, portalProps: m, lockScroll: g, children: v, zIndex: w, shadow: x, padding: E, __vars: C, unstyled: j, removeScrollProps: R, __handledEscapeEvents: T, ...S }) {
  const { _id: b, titleMounted: P, bodyMounted: L, shouldLockScroll: $, setTitleMounted: F, setBodyMounted: B } = Eg({
    id: r,
    transitionProps: s,
    opened: n,
    trapFocus: c,
    closeOnEscape: u,
    onClose: o,
    returnFocus: f,
    handledEscapeEvents: T
  }), { key: I, ...O } = R || {};
  return /* @__PURE__ */ l.jsx(ei, {
    ...m,
    withinPortal: d,
    children: /* @__PURE__ */ l.jsx(jg, {
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
        getTitleId: () => `${b}-title`,
        getBodyId: () => `${b}-body`,
        titleMounted: P,
        bodyMounted: L,
        setTitleMounted: F,
        setBodyMounted: B,
        trapFocus: c,
        closeOnEscape: u,
        zIndex: w,
        unstyled: j
      },
      children: /* @__PURE__ */ l.jsx(ad, {
        enabled: $ && g,
        ...O,
        children: /* @__PURE__ */ l.jsx(Q, {
          ...S,
          id: b,
          __vars: {
            ...C,
            "--mb-z-index": (w || jo("modal")).toString(),
            "--mb-shadow": eu(x),
            "--mb-padding": Ko(E)
          },
          children: v
        })
      }, I)
    })
  });
}
id.displayName = "@mantine/core/ModalBase";
function lv() {
  const e = cn();
  return p.useEffect(() => (e.setBodyMounted(!0), () => e.setBodyMounted(!1)), []), e.getBodyId();
}
var mo = {
  title: "m_615af6c9",
  header: "m_b5489c3c",
  inner: "m_60c222c7",
  content: "m_fd1ab0aa",
  close: "m_606cb269",
  body: "m_5df29311"
};
function cd({ className: e, ...t }) {
  const n = lv(), o = cn();
  return /* @__PURE__ */ l.jsx(Q, {
    id: n,
    className: on({ [mo.body]: !o.unstyled }, e),
    ...t
  });
}
cd.displayName = "@mantine/core/ModalBaseBody";
function ld({ className: e, onClick: t, ...n }) {
  const o = cn();
  return /* @__PURE__ */ l.jsx(ri, {
    ...n,
    onClick: (r) => {
      o.onClose(), t?.(r);
    },
    className: on({ [mo.close]: !o.unstyled }, e),
    unstyled: o.unstyled
  });
}
ld.displayName = "@mantine/core/ModalBaseCloseButton";
function ud({ transitionProps: e, className: t, innerProps: n, onKeyDown: o, style: r, ref: s, ...a }) {
  const i = cn();
  return /* @__PURE__ */ l.jsx(ls, {
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
      className: on({ [mo.inner]: !i.unstyled }, n.className),
      children: /* @__PURE__ */ l.jsx(bs, {
        active: i.opened && i.trapFocus,
        innerRef: s,
        children: /* @__PURE__ */ l.jsx(ho, {
          ...a,
          component: "section",
          role: "dialog",
          tabIndex: -1,
          "aria-modal": !0,
          "aria-describedby": i.bodyMounted ? i.getBodyId() : void 0,
          "aria-labelledby": i.titleMounted ? i.getTitleId() : void 0,
          style: [r, c],
          className: on({ [mo.content]: !i.unstyled }, t),
          unstyled: i.unstyled,
          children: a.children
        })
      })
    })
  });
}
ud.displayName = "@mantine/core/ModalBaseContent";
function dd({ className: e, ...t }) {
  const n = cn();
  return /* @__PURE__ */ l.jsx(Q, {
    component: "header",
    className: on({ [mo.header]: !n.unstyled }, e),
    ...t
  });
}
dd.displayName = "@mantine/core/ModalBaseHeader";
const uv = {
  duration: 200,
  timingFunction: "ease",
  transition: "fade"
};
function dv(e) {
  const t = cn();
  return {
    ...uv,
    ...t.transitionProps,
    ...e
  };
}
function fd({ onClick: e, transitionProps: t, style: n, visible: o, ...r }) {
  const s = cn(), a = dv(t);
  return /* @__PURE__ */ l.jsx(ls, {
    mounted: o !== void 0 ? o : s.opened,
    ...a,
    transition: "fade",
    children: (i) => /* @__PURE__ */ l.jsx(su, {
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
fd.displayName = "@mantine/core/ModalBaseOverlay";
function fv() {
  const e = cn();
  return p.useEffect(() => (e.setTitleMounted(!0), () => e.setTitleMounted(!1)), []), e.getTitleId();
}
function pd({ className: e, ...t }) {
  const n = fv(), o = cn();
  return /* @__PURE__ */ l.jsx(Q, {
    component: "h2",
    className: on({ [mo.title]: !o.unstyled }, e),
    id: n,
    ...t
  });
}
pd.displayName = "@mantine/core/ModalBaseTitle";
function pv({ children: e }) {
  return /* @__PURE__ */ l.jsx(l.Fragment, { children: e });
}
const hv = {
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
var hd = { root: "m_8bffd616" };
const lo = tu((e) => {
  const t = Z("Flex", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, gap: c, rowGap: u, columnGap: f, align: h, justify: d, wrap: m, direction: g, attributes: v, ...w } = t, x = De({
    name: "Flex",
    classes: hd,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: v,
    vars: i
  }), E = lr(), C = Mp(), j = Dp({
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
    data: hv
  }), R = Op(), T = R && j.hasResponsiveStyles ? Lp(j.styles, j.media) : C;
  return /* @__PURE__ */ l.jsxs(l.Fragment, { children: [j.hasResponsiveStyles && /* @__PURE__ */ l.jsx($p, {
    selector: `.${T}`,
    styles: j.styles,
    media: j.media,
    deduplicate: R
  }), /* @__PURE__ */ l.jsx(Q, {
    ...x("root", {
      className: T,
      style: zp(j.inlineStyles)
    }),
    ...w
  })] });
});
lo.classes = hd;
lo.displayName = "@mantine/core/Flex";
function mv(e, t) {
  if (!t || !e) return !1;
  let n = t.parentNode;
  for (; n != null; ) {
    if (n === e) return !0;
    n = n.parentNode;
  }
  return !1;
}
function gv({ target: e, parent: t, ref: n, displayAfterTransitionEnd: o, onTransitionStart: r, onTransitionEnd: s }) {
  const a = p.useRef(-1), i = p.useRef(e), [c, u] = p.useState(!1), [f, h] = p.useState(typeof o == "boolean" ? o : !1), d = () => {
    if (!e || !t || !n.current) return;
    const w = e.getBoundingClientRect(), x = t.getBoundingClientRect(), E = t.offsetWidth === 0 ? 1 : x.width / t.offsetWidth, C = t.offsetHeight === 0 ? 1 : x.height / t.offsetHeight, j = window.getComputedStyle(e), R = window.getComputedStyle(t), T = gn(j.borderTopWidth) + gn(R.borderTopWidth), S = gn(j.borderLeftWidth) + gn(R.borderLeftWidth), b = {
      top: (w.top - x.top) / C - T,
      left: (w.left - x.left) / E - S,
      width: w.width / E,
      height: w.height / C
    };
    n.current.style.transform = `translateY(${b.top}px) translateX(${b.left}px)`, n.current.style.width = `${b.width}px`, n.current.style.height = `${b.height}px`;
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
        mv(x.target, t) && (m(), h(!1));
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
  }, [s]), mh(() => {
    vu() !== "test" && u(!0);
  }, 20, { autoInvoke: !0 }), bh((w) => {
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
var md = { root: "m_96b553a6" };
const gd = ze((e, { transitionDuration: t }, { shouldReduceMotion: n }) => ({ root: { "--transition-duration": e.respectReducedMotion && n ? "0ms" : typeof t == "number" ? `${t}ms` : t || "150ms" } })), xs = se((e) => {
  const t = Z("FloatingIndicator", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, target: c, parent: u, transitionDuration: f, mod: h, displayAfterTransitionEnd: d, onTransitionStart: m, onTransitionEnd: g, attributes: v, ref: w, ...x } = t, E = Za(), C = De({
    name: "FloatingIndicator",
    classes: md,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: v,
    vars: i,
    varsResolver: gd,
    stylesCtx: { shouldReduceMotion: E }
  }), j = p.useRef(null), { initialized: R, hidden: T } = gv({
    target: c,
    parent: u,
    ref: j,
    displayAfterTransitionEnd: d,
    onTransitionStart: m,
    onTransitionEnd: g
  }), S = Ve(w, j);
  return !c || !u ? null : /* @__PURE__ */ l.jsx(Q, {
    ref: S,
    mod: [{
      initialized: R,
      hidden: T
    }, h],
    ...C("root"),
    ...x
  });
});
xs.displayName = "@mantine/core/FloatingIndicator";
xs.classes = md;
xs.varsResolver = gd;
const [vv, bi] = Gt("Accordion component was not found in the tree");
function wi({ style: e, size: t = 16, ...n }) {
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
wi.displayName = "@mantine/core/AccordionChevron";
const [yv, vd] = Gt("Accordion.Item component was not found in the tree");
var pr = {
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
const xi = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, chevron: a, icon: i, onClick: c, onKeyDown: u, children: f, disabled: h, mod: d, ...m } = Z("AccordionControl", null, e), { value: g } = vd(), v = bi(), w = v.isItemActive(g), x = typeof v.order == "number", E = `h${v.order}`, C = /* @__PURE__ */ l.jsxs($n, {
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
    onClick: (j) => {
      c?.(j), v.onChange(g);
    },
    type: "button",
    disabled: h,
    "aria-expanded": w,
    "aria-controls": v.getRegionId(g),
    id: v.getControlId(g),
    onKeyDown: lu({
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
xi.displayName = "@mantine/core/AccordionControl";
xi.classes = pr;
const Si = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, value: a, mod: i, ...c } = Z("AccordionItem", null, e), u = bi();
  return /* @__PURE__ */ l.jsx(yv, {
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
Si.displayName = "@mantine/core/AccordionItem";
Si.classes = pr;
const Ci = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, children: a, keepMounted: i, keepMountedMode: c, ...u } = Z("AccordionPanel", null, e), { value: f } = vd(), h = bi();
  return /* @__PURE__ */ l.jsx(wu, {
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
Ci.displayName = "@mantine/core/AccordionPanel";
Ci.classes = pr;
const bv = {
  multiple: !1,
  loop: !0,
  disableChevronRotation: !1,
  disableCollapse: !1,
  chevronPosition: "right",
  variant: "default",
  chevronSize: "auto",
  chevronIconSize: 16,
  keepMountedMode: "activity"
}, yd = ze((e, { transitionDuration: t, chevronSize: n, radius: o }) => ({ root: {
  "--accordion-transition-duration": t === void 0 ? void 0 : `${t}ms`,
  "--accordion-chevron-size": n === void 0 ? void 0 : Ae(n),
  "--accordion-radius": o === void 0 ? void 0 : Tt(o)
} })), Pe = En((e) => {
  const t = Z("Accordion", bv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, children: c, multiple: u, value: f, defaultValue: h, onChange: d, id: m, loop: g, transitionDuration: v, disableChevronRotation: w, disableCollapse: x, chevronPosition: E, chevronSize: C, order: j, chevron: R, variant: T, radius: S, chevronIconSize: b, attributes: P, keepMounted: L, keepMountedMode: $, ...F } = t, B = Vt(m), [I, O] = Qe({
    value: f,
    defaultValue: h,
    finalValue: u ? [] : null,
    onChange: d
  }), D = (A) => Array.isArray(I) ? I.includes(A) : A === I, z = (A) => {
    if (!Array.isArray(I) && x && A === I) return;
    const _ = Array.isArray(I) ? I.includes(A) ? I.filter((H) => H !== A) : [...I, A] : A === I ? null : A;
    O(_);
  }, M = De({
    name: "Accordion",
    classes: pr,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: P,
    vars: i,
    varsResolver: yd
  });
  return /* @__PURE__ */ l.jsx(vv, {
    value: {
      isItemActive: D,
      onChange: z,
      getControlId: Kr(`${B}-control`, "Accordion.Item component was rendered with invalid value or without value"),
      getRegionId: Kr(`${B}-panel`, "Accordion.Item component was rendered with invalid value or without value"),
      chevron: R === null ? null : R || /* @__PURE__ */ l.jsx(wi, { size: b }),
      transitionDuration: v,
      disableChevronRotation: w,
      chevronPosition: E,
      order: j,
      loop: g,
      getStyles: M,
      variant: T,
      unstyled: a,
      keepMounted: L,
      keepMountedMode: $
    },
    children: /* @__PURE__ */ l.jsx(Q, {
      ...M("root"),
      id: B,
      ...F,
      variant: T,
      "data-accordion": !0,
      children: c
    })
  });
});
Pe.classes = pr;
Pe.varsResolver = yd;
Pe.displayName = "@mantine/core/Accordion";
Pe.Item = Si;
Pe.Panel = Ci;
Pe.Control = xi;
Pe.Chevron = wi;
function bd(e) {
  return typeof e == "string" ? {
    value: e,
    label: e
  } : typeof e == "object" && "value" in e && !("label" in e) ? {
    value: e.value,
    label: `${e.value}`,
    disabled: e.disabled
  } : typeof e == "object" && "group" in e ? {
    group: e.group,
    items: e.items.map((t) => bd(t))
  } : typeof e == "number" || typeof e == "bigint" || typeof e == "boolean" ? {
    value: e,
    label: `${e}`
  } : e;
}
function wd(e) {
  return e ? e.map((t) => bd(t)) : [];
}
function xd(e) {
  return e.reduce((t, n) => "group" in n ? {
    ...t,
    ...xd(n.items)
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
const wv = { error: null }, Sd = ze((e, { size: t, color: n }) => ({ chevron: {
  "--combobox-chevron-size": _e(t, "combobox-chevron-size"),
  "--combobox-chevron-color": n ? at(n, e) : void 0
} })), hr = se((e) => {
  const t = Z("ComboboxChevron", wv, e), { size: n, error: o, style: r, className: s, classNames: a, styles: i, unstyled: c, vars: u, attributes: f, mod: h, ...d } = t, m = De({
    name: "ComboboxChevron",
    classes: ut,
    props: t,
    style: r,
    className: s,
    classNames: a,
    styles: i,
    unstyled: c,
    vars: u,
    varsResolver: Sd,
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
hr.classes = ut;
hr.varsResolver = Sd;
hr.displayName = "@mantine/core/ComboboxChevron";
const [xv, Ct] = Gt("Combobox component was not found in tree");
function Cd({ onMouseDown: e, onClick: t, onClear: n, ...o }) {
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
Cd.displayName = "@mantine/core/ComboboxClearButton";
const ji = se((e) => {
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
ji.classes = ut;
ji.displayName = "@mantine/core/ComboboxDropdown";
const Sv = { refProp: "ref" }, jd = se((e) => {
  const { children: t, refProp: n, ref: o } = Z("ComboboxDropdownTarget", Sv, e);
  if (Ct(), !ru(t)) throw new Error("Combobox.DropdownTarget component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  return /* @__PURE__ */ l.jsx(He.Target, {
    ref: o,
    refProp: n,
    children: t
  });
});
jd.displayName = "@mantine/core/ComboboxDropdownTarget";
const ki = se((e) => {
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
ki.classes = ut;
ki.displayName = "@mantine/core/ComboboxEmpty";
function Ei({ onKeyDown: e, onClick: t, withKeyboardNavigation: n, withAriaAttributes: o, withExpandedAttribute: r, targetType: s, autoComplete: a }) {
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
const Cv = {
  refProp: "ref",
  targetType: "input",
  withKeyboardNavigation: !0,
  withAriaAttributes: !0,
  withExpandedAttribute: !1,
  autoComplete: "off"
}, kd = se((e) => {
  const { children: t, refProp: n, withKeyboardNavigation: o, withAriaAttributes: r, withExpandedAttribute: s, targetType: a, autoComplete: i, ref: c, ...u } = Z("ComboboxEventsTarget", Cv, e), f = dr(t);
  if (!f) throw new Error("Combobox.EventsTarget component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  const h = Ct(), d = Ei({
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
    [n]: Ve(c, h.store.targetRef, bu(f))
  });
});
kd.displayName = "@mantine/core/ComboboxEventsTarget";
const Ri = se((e) => {
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
Ri.classes = ut;
Ri.displayName = "@mantine/core/ComboboxFooter";
const Ni = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, children: a, label: i, id: c, ...u } = Z("ComboboxGroup", null, e), f = Ct(), h = Vt(c), d = i != null && i !== !1 && i !== "";
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
Ni.classes = ut;
Ni.displayName = "@mantine/core/ComboboxGroup";
const Ti = se((e) => {
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
Ti.classes = ut;
Ti.displayName = "@mantine/core/ComboboxHeader";
function Ed({ value: e, valuesDivider: t = ",", ...n }) {
  return /* @__PURE__ */ l.jsx("input", {
    type: "hidden",
    value: Array.isArray(e) ? e.join(t) : e ? `${e}` : "",
    ...n
  });
}
Ed.displayName = "@mantine/core/ComboboxHiddenInput";
const Pi = se((e) => {
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
Pi.classes = ut;
Pi.displayName = "@mantine/core/ComboboxOption";
const Ai = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, id: s, onMouseDown: a, labelledBy: i, ...c } = Z("ComboboxOptions", null, e), u = Ct(), f = Vt(s);
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
Ai.classes = ut;
Ai.displayName = "@mantine/core/ComboboxOptions";
const jv = {
  withAriaAttributes: !0,
  withKeyboardNavigation: !0
}, Ii = se((e) => {
  const { classNames: t, styles: n, unstyled: o, vars: r, withAriaAttributes: s, onKeyDown: a, onClick: i, withKeyboardNavigation: c, size: u, ref: f, ...h } = Z("ComboboxSearch", jv, e), d = Ct(), m = d.getStyles("search"), g = Ei({
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
Ii.classes = ut;
Ii.displayName = "@mantine/core/ComboboxSearch";
const kv = {
  refProp: "ref",
  targetType: "input",
  withKeyboardNavigation: !0,
  withAriaAttributes: !0,
  withExpandedAttribute: !1,
  autoComplete: "off"
}, Rd = se((e) => {
  const { children: t, refProp: n, withKeyboardNavigation: o, withAriaAttributes: r, withExpandedAttribute: s, targetType: a, autoComplete: i, ref: c, ...u } = Z("ComboboxTarget", kv, e), f = dr(t);
  if (!f) throw new Error("Combobox.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  const h = Ct(), d = Ei({
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
Rd.displayName = "@mantine/core/ComboboxTarget";
function Ev(e, t, n) {
  for (let o = e - 1; o >= 0; o -= 1) if (!t[o].hasAttribute("data-combobox-disabled")) return o;
  if (n) {
    for (let o = t.length - 1; o > -1; o -= 1) if (!t[o].hasAttribute("data-combobox-disabled")) return o;
  }
  return e;
}
function Rv(e, t, n) {
  for (let o = e + 1; o < t.length; o += 1) if (!t[o].hasAttribute("data-combobox-disabled")) return o;
  if (n) {
    for (let o = 0; o < t.length; o += 1) if (!t[o].hasAttribute("data-combobox-disabled")) return o;
  }
  return e;
}
function Nv(e) {
  for (let t = 0; t < e.length; t += 1) if (!e[t].hasAttribute("data-combobox-disabled")) return t;
  return -1;
}
function Mi({ defaultOpened: e, opened: t, onOpenedChange: n, onDropdownClose: o, onDropdownOpen: r, loop: s = !0, scrollBehavior: a = "instant" } = {}) {
  const [i, c] = Qe({
    value: t,
    defaultValue: e,
    finalValue: !1,
    onChange: n
  }), u = p.useRef(null), f = p.useRef(-1), h = p.useRef(null), d = p.useRef(null), m = p.useRef(-1), g = p.useRef(-1), v = p.useRef(-1), w = p.useCallback((D = "unknown") => {
    i || (c(!0), r?.(D));
  }, [
    c,
    r,
    i
  ]), x = p.useCallback((D = "unknown") => {
    i && (c(!1), o?.(D));
  }, [
    c,
    o,
    i
  ]), E = p.useCallback((D = "unknown") => {
    i ? x(D) : w(D);
  }, [
    x,
    w,
    i
  ]), C = p.useCallback(() => {
    const D = Ut(d.current);
    Lr(`#${u.current} [data-combobox-selected]`, D)?.removeAttribute("data-combobox-selected");
  }, []), j = p.useCallback((D) => {
    const z = Ut(d.current), M = Lr(`#${u.current}`, z), A = M ? Jt("[data-combobox-option]", M) : null;
    if (!A) return null;
    const _ = D >= A.length ? 0 : D < 0 ? A.length - 1 : D;
    return f.current = _, A?.[_] && !A[_].hasAttribute("data-combobox-disabled") ? (C(), A[_].setAttribute("data-combobox-selected", "true"), A[_].scrollIntoView({
      block: "nearest",
      behavior: a
    }), A[_].id) : null;
  }, [a, C]), R = p.useCallback(() => {
    const D = Ut(d.current), z = Lr(`#${u.current} [data-combobox-active]`, D);
    if (z) {
      const M = Jt(`#${u.current} [data-combobox-option]`, D).findIndex((A) => A === z);
      return j(M);
    }
    return j(0);
  }, [j]), T = p.useCallback(() => {
    const D = Ut(d.current), z = Jt(`#${u.current} [data-combobox-option]`, D);
    return j(Rv(f.current, z, s));
  }, [j, s]), S = p.useCallback(() => {
    const D = Ut(d.current), z = Jt(`#${u.current} [data-combobox-option]`, D);
    return j(Ev(f.current, z, s));
  }, [j, s]), b = p.useCallback(() => {
    const D = Ut(d.current), z = Jt(`#${u.current} [data-combobox-option]`, D);
    return j(Nv(z));
  }, [j]), P = p.useCallback((D = "selected", z) => {
    if (typeof D == "number") {
      f.current = D;
      const M = Ut(d.current), A = Jt(`#${u.current} [data-combobox-option]`, M);
      z?.scrollIntoView && A[D]?.scrollIntoView({
        block: "nearest",
        behavior: a
      });
      return;
    }
    v.current = window.setTimeout(() => {
      const M = Ut(d.current), A = Jt(`#${u.current} [data-combobox-option]`, M), _ = A.findIndex((H) => H.hasAttribute(`data-combobox-${D}`));
      f.current = _, z?.scrollIntoView && A[_]?.scrollIntoView({
        block: "nearest",
        behavior: a
      });
    }, 0);
  }, []), L = p.useCallback(() => {
    f.current = -1, C();
  }, [C]), $ = p.useCallback(() => {
    const D = Ut(d.current);
    Jt(`#${u.current} [data-combobox-option]`, D)?.[f.current]?.click();
  }, []), F = p.useCallback((D) => {
    u.current = D;
  }, []), B = p.useCallback(() => {
    m.current = window.setTimeout(() => h.current?.focus(), 0);
  }, []), I = p.useCallback(() => {
    g.current = window.setTimeout(() => d.current?.focus(), 0);
  }, []), O = p.useCallback(() => f.current, []);
  return p.useEffect(() => () => {
    window.clearTimeout(m.current), window.clearTimeout(g.current), window.clearTimeout(v.current);
  }, []), {
    dropdownOpened: i,
    openDropdown: w,
    closeDropdown: x,
    toggleDropdown: E,
    selectedOptionIndex: f.current,
    getSelectedOptionIndex: O,
    selectOption: j,
    selectFirstOption: b,
    selectActiveOption: R,
    selectNextOption: T,
    selectPreviousOption: S,
    resetSelectedOption: L,
    updateSelectedOptionIndex: P,
    listId: u.current,
    setListId: F,
    clickSelectedOption: $,
    searchRef: h,
    focusSearchInput: B,
    targetRef: d,
    focusTarget: I
  };
}
const Tv = {
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
}, Nd = ze((e, { size: t, dropdownPadding: n }) => ({
  options: {
    "--combobox-option-fz": qr(t),
    "--combobox-option-padding": _e(t, "combobox-option-padding")
  },
  dropdown: {
    "--combobox-padding": n === void 0 ? void 0 : Ae(n),
    "--combobox-option-fz": qr(t),
    "--combobox-option-padding": _e(t, "combobox-option-padding")
  }
})), Ce = (e) => {
  const t = Z("Combobox", Tv, e), { classNames: n, styles: o, unstyled: r, children: s, store: a, vars: i, onOptionSubmit: c, onClose: u, size: f, dropdownPadding: h, resetSelectionOnOptionHover: d, __staticSelector: m, readOnly: g, attributes: v, floatingHeight: w, middlewares: x, ...E } = t, C = w === "viewport" ? {
    ...x,
    flip: !1,
    size: {
      ...typeof x?.size == "object" ? x.size : {},
      padding: typeof x?.size == "object" && x.size.padding !== void 0 ? x.size.padding : 10,
      apply: ({ availableHeight: b, availableWidth: P, elements: L, ...$ }) => {
        L.floating.style.setProperty("--combobox-floating-max-height", `${b}px`);
        const F = x?.size;
        typeof F == "object" && F.apply ? F.apply({
          availableHeight: b,
          availableWidth: P,
          elements: L,
          ...$
        }) : F && Object.assign(L.floating.style, {
          maxWidth: `${P}px`,
          maxHeight: `${b}px`
        });
      }
    }
  } : x, j = Mi(), R = a || j, T = De({
    name: m || "Combobox",
    classes: ut,
    props: t,
    classNames: n,
    styles: o,
    unstyled: r,
    attributes: v,
    vars: i,
    varsResolver: Nd
  }), S = () => {
    u?.(), R.closeDropdown();
  };
  return /* @__PURE__ */ l.jsx(xv, {
    value: {
      getStyles: T,
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
      onChange: (b) => !b && S(),
      withRoles: !1,
      unstyled: r,
      children: s
    })
  });
}, Pv = (e) => e;
Ce.extend = Pv;
Ce.classes = ut;
Ce.varsResolver = Nd;
Ce.displayName = "@mantine/core/Combobox";
Ce.Target = Rd;
Ce.Dropdown = ji;
Ce.Options = Ai;
Ce.Option = Pi;
Ce.Search = Ii;
Ce.Empty = ki;
Ce.Chevron = hr;
Ce.Footer = Ri;
Ce.Header = Ti;
Ce.EventsTarget = kd;
Ce.DropdownTarget = jd;
Ce.Group = Ni;
Ce.ClearButton = Cd;
Ce.HiddenInput = Ed;
function Td({ children: e, role: t }) {
  const n = p.use(Gp);
  return n ? /* @__PURE__ */ l.jsx("div", {
    role: t,
    "aria-labelledby": n.labelId,
    "aria-describedby": n.describedBy,
    children: e
  }) : /* @__PURE__ */ l.jsx(l.Fragment, { children: e });
}
const Di = p.createContext(null), Av = { hiddenInputValuesSeparator: "," }, Oi = En(((e) => {
  const { value: t, defaultValue: n, onChange: o, size: r, wrapperProps: s, children: a, readOnly: i, name: c, hiddenInputValuesSeparator: u, hiddenInputProps: f, maxSelectedValues: h, disabled: d, ...m } = Z("CheckboxGroup", Av, e), [g, v] = Qe({
    value: t,
    defaultValue: n,
    finalValue: [],
    onChange: o
  }), w = (C) => {
    const j = typeof C == "string" ? C : C.currentTarget.value;
    if (i) return;
    const R = g.includes(j);
    !R && h && g.length >= h || v(R ? g.filter((T) => T !== j) : [...g, j]);
  }, x = (C) => {
    if (d) return !0;
    if (!h) return !1;
    const j = g.includes(C), R = g.length >= h;
    return !j && R;
  }, E = g.join(u);
  return /* @__PURE__ */ l.jsx(Di, {
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
      children: [/* @__PURE__ */ l.jsx(Td, {
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
Oi.classes = Rt.Wrapper.classes;
Oi.displayName = "@mantine/core/CheckboxGroup";
var Pd = { card: "m_26775b0a" };
const Ad = p.createContext(null), Iv = { withBorder: !0 }, Id = ze((e, { radius: t }) => ({ card: { "--card-radius": Tt(t) } })), Ss = se((e) => {
  const t = Z("CheckboxCard", Iv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, checked: c, mod: u, withBorder: f, value: h, onClick: d, defaultChecked: m, onChange: g, indeterminate: v, attributes: w, ...x } = t, E = De({
    name: "CheckboxCard",
    classes: Pd,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: w,
    vars: i,
    varsResolver: Id,
    rootSelector: "card"
  }), C = p.use(Di), j = typeof c == "boolean" ? c : C ? C.value.includes(h || "") : void 0, [R, T] = Qe({
    value: j,
    defaultValue: m,
    finalValue: !1,
    onChange: g
  });
  return /* @__PURE__ */ l.jsx(Ad, {
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
        d?.(S), C?.onChange(h || ""), T(!R);
      }
    })
  });
});
Ss.displayName = "@mantine/core/CheckboxCard";
Ss.classes = Pd;
Ss.varsResolver = Id;
function Li({ size: e, style: t, ...n }) {
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
function Md({ indeterminate: e, ...t }) {
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
  }) : /* @__PURE__ */ l.jsx(Li, { ...t });
}
var Dd = {
  indicator: "m_5e5256ee",
  icon: "m_1b1c543a",
  "indicator--outline": "m_76e20374"
};
const Mv = {
  icon: Md,
  variant: "filled",
  radius: "sm"
}, Od = ze((e, { radius: t, color: n, size: o, iconColor: r, variant: s, autoContrast: a }) => {
  const i = us({
    color: n || e.primaryColor,
    theme: e
  }), c = i.isThemeColor && i.shade === void 0 ? `var(--mantine-color-${i.color}-outline)` : i.color;
  return { indicator: {
    "--checkbox-size": _e(o, "checkbox-size"),
    "--checkbox-radius": t === void 0 ? void 0 : Tt(t),
    "--checkbox-color": s === "outline" ? c : at(n, e),
    "--checkbox-icon-color": r ? at(r, e) : fr(a, e) ? Co({
      color: n,
      theme: e,
      autoContrast: a
    }) : void 0
  } };
}), Cs = se((e) => {
  const t = Z("CheckboxIndicator", Mv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, icon: c, indeterminate: u, radius: f, color: h, iconColor: d, autoContrast: m, checked: g, mod: v, variant: w, disabled: x, attributes: E, ...C } = t, j = De({
    name: "CheckboxIndicator",
    classes: Dd,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: E,
    vars: i,
    varsResolver: Od,
    rootSelector: "indicator"
  }), R = p.use(Ad), T = typeof u == "boolean" ? u : R?.indeterminate, S = typeof g == "boolean" || typeof u == "boolean" ? g || u : R?.checked || R?.indeterminate || !1;
  return /* @__PURE__ */ l.jsx(Q, {
    ...j("indicator", { variant: w }),
    variant: w,
    mod: [{
      checked: S,
      disabled: x
    }, v],
    ...C,
    children: /* @__PURE__ */ l.jsx(c, {
      indeterminate: T,
      ...j("icon")
    })
  });
});
Cs.displayName = "@mantine/core/CheckboxIndicator";
Cs.classes = Dd;
Cs.varsResolver = Od;
var Ld = {
  root: "m_5f75b09e",
  body: "m_5f6e695e",
  labelWrapper: "m_d3ea56bb",
  label: "m_8ee546b8",
  description: "m_328f68c0",
  error: "m_8e8a99cc"
};
const Dv = Ld;
function $i({ __staticSelector: e, __stylesApiProps: t, className: n, classNames: o, styles: r, unstyled: s, children: a, label: i, description: c, id: u, disabled: f, error: h, size: d, labelPosition: m = "left", bodyElement: g = "div", labelElement: v = "label", variant: w, style: x, vars: E, mod: C, attributes: j, ...R }) {
  const T = De({
    name: e,
    props: t,
    className: n,
    style: x,
    classes: Ld,
    classNames: o,
    styles: r,
    unstyled: s,
    attributes: j
  }), S = c ? `${u}-description` : void 0, b = h && typeof h != "boolean" ? `${u}-error` : void 0;
  return /* @__PURE__ */ l.jsx(Q, {
    ...T("root"),
    __vars: {
      "--label-fz": qr(d),
      "--label-lh": _e(d, "label-lh")
    },
    mod: [{ "label-position": m }, C],
    variant: w,
    size: d,
    ...R,
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
          c && /* @__PURE__ */ l.jsx(Rt.Description, {
            id: S,
            size: d,
            __inheritStyles: !1,
            ...T("description"),
            children: c
          }),
          h && typeof h != "boolean" && /* @__PURE__ */ l.jsx(Rt.Error, {
            id: b,
            size: d,
            __inheritStyles: !1,
            ...T("error"),
            children: h
          })
        ]
      })]
    })
  });
}
$i.displayName = "@mantine/core/InlineInput";
var $d = {
  root: "m_bf2d988c",
  inner: "m_26062bec",
  input: "m_26063560",
  icon: "m_bf295423",
  "input--outline": "m_215c4542"
};
const Ov = {
  labelPosition: "right",
  icon: Md,
  withErrorStyles: !0,
  variant: "filled",
  radius: "sm"
}, zd = ze((e, { radius: t, color: n, size: o, iconColor: r, variant: s, autoContrast: a }) => {
  const i = us({
    color: n || e.primaryColor,
    theme: e
  }), c = i.isThemeColor && i.shade === void 0 ? `var(--mantine-color-${i.color}-outline)` : i.color;
  return { root: {
    "--checkbox-size": _e(o, "checkbox-size"),
    "--checkbox-radius": t === void 0 ? void 0 : Tt(t),
    "--checkbox-color": s === "outline" ? c : at(n, e),
    "--checkbox-icon-color": r ? at(r, e) : fr(a, e) ? Co({
      color: n,
      theme: e,
      autoContrast: a
    }) : void 0
  } };
}), rn = se((e) => {
  const t = Z("Checkbox", Ov, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, color: c, label: u, id: f, size: h, radius: d, wrapperProps: m, checked: g, labelPosition: v, description: w, error: x, disabled: E, variant: C, indeterminate: j, icon: R, rootRef: T, iconColor: S, onChange: b, autoContrast: P, mod: L, attributes: $, readOnly: F, onClick: B, withErrorStyles: I, ref: O, ...D } = t, z = p.useRef(null), M = p.use(Di), A = h || M?.size, _ = De({
    name: "Checkbox",
    props: t,
    classes: $d,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: $,
    vars: i,
    varsResolver: zd
  }), { styleProps: H, rest: W } = nu(D), Y = Vt(f), ae = [
    w ? `${Y}-description` : void 0,
    x && typeof x != "boolean" ? `${Y}-error` : void 0,
    W["aria-describedby"]
  ].filter(Boolean).join(" ") || void 0, fe = {
    checked: M?.value.includes(W.value) ?? g,
    onChange: (he) => {
      F || (M?.onChange(he), b?.(he));
    }
  }, ie = M?.isDisabled?.(W.value) ?? !1, te = E || ie;
  return p.useEffect(() => {
    z.current && (z.current.indeterminate = j || !1, j ? z.current.setAttribute("data-indeterminate", "true") : z.current.removeAttribute("data-indeterminate"));
  }, [j]), /* @__PURE__ */ l.jsx($i, {
    ..._("root"),
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
    ref: T,
    mod: L,
    attributes: $,
    inert: W.inert,
    ...H,
    ...m,
    children: /* @__PURE__ */ l.jsxs(Q, {
      ..._("inner"),
      mod: { labelPosition: v },
      children: [/* @__PURE__ */ l.jsx(Q, {
        component: "input",
        id: Y,
        ref: Ve(z, O),
        mod: {
          error: !!x,
          "with-error-styles": I
        },
        ..._("input", {
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
          F && fe.checked === void 0 && he.preventDefault(), B?.(he);
        }
      }), /* @__PURE__ */ l.jsx(R, {
        indeterminate: j,
        ..._("icon")
      })]
    })
  });
});
rn.classes = {
  ...$d,
  ...Dv
};
rn.varsResolver = zd;
rn.displayName = "@mantine/core/Checkbox";
rn.Group = Oi;
rn.Indicator = Cs;
rn.Card = Ss;
function Jo(e) {
  return "group" in e;
}
function _d({ options: e, search: t, limit: n }) {
  const o = t.trim().toLowerCase(), r = [];
  for (let s = 0; s < e.length; s += 1) {
    const a = e[s];
    if (r.length === n) return r;
    Jo(a) && r.push({
      group: a.group,
      items: _d({
        options: a.items,
        search: t,
        limit: n - r.length
      })
    }), Jo(a) || a.label.toLowerCase().includes(o) && r.push(a);
  }
  return r;
}
function Lv(e) {
  if (e.length === 0) return !0;
  for (const t of e)
    if (!("group" in t) || t.items.length > 0) return !1;
  return !0;
}
function Fd(e, t = /* @__PURE__ */ new Set()) {
  if (Array.isArray(e))
    for (const n of e) if (Jo(n)) Fd(n.items, t);
    else {
      if (typeof n.value > "u") throw new Error("[@mantine/core] Each option must have value property");
      if (t.has(n.value)) throw new Error(`[@mantine/core] Duplicate options are not supported. Option with value "${n.value}" was provided more than once`);
      t.add(n.value);
    }
}
function $v(e, t) {
  return Array.isArray(e) ? e.includes(t) : e === t;
}
function Bd({ data: e, withCheckIcon: t, withAlignedLabels: n, value: o, checkIconPosition: r, unstyled: s, renderOption: a }) {
  if (!Jo(e)) {
    const c = $v(o, e.value), u = t && (c ? /* @__PURE__ */ l.jsx(Li, { className: ut.optionsDropdownCheckIcon }) : n ? /* @__PURE__ */ l.jsx("div", { className: ut.optionsDropdownCheckPlaceholder }) : null), f = /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
      r === "left" && u,
      /* @__PURE__ */ l.jsx("span", { children: e.label }),
      r === "right" && u
    ] });
    return /* @__PURE__ */ l.jsx(Ce.Option, {
      value: e.value,
      disabled: e.disabled,
      className: on({ [ut.optionsDropdownOption]: !s }),
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
  const i = e.items.map((c) => /* @__PURE__ */ l.jsx(Bd, {
    data: c,
    value: o,
    unstyled: s,
    withCheckIcon: t,
    withAlignedLabels: n,
    checkIconPosition: r,
    renderOption: a
  }, `${c.value}`));
  return /* @__PURE__ */ l.jsx(Ce.Group, {
    label: e.group,
    children: i
  });
}
function zv({ data: e, hidden: t, hiddenWhenEmpty: n, filter: o, search: r, limit: s, maxDropdownHeight: a, floatingHeight: i, withScrollArea: c = !0, filterOptions: u = !0, withCheckIcon: f = !1, withAlignedLabels: h = !1, value: d, checkIconPosition: m, nothingFoundMessage: g, unstyled: v, labelId: w, renderOption: x, scrollAreaProps: E, "aria-label": C }) {
  const j = Ct();
  Fd(e);
  const R = typeof r == "string" ? (o || _d)({
    options: e,
    search: u ? r : "",
    limit: s ?? 1 / 0
  }) : e, T = Lv(R), S = R.map((b, P) => /* @__PURE__ */ l.jsx(Bd, {
    data: b,
    withCheckIcon: f,
    withAlignedLabels: h,
    value: d,
    checkIconPosition: m,
    unstyled: v,
    renderOption: x
  }, Jo(b) ? `group-${typeof b.group == "string" ? b.group : P}` : `${b.value}`));
  return /* @__PURE__ */ l.jsx(Ce.Dropdown, {
    hidden: t || n && T,
    "data-composed": !0,
    children: /* @__PURE__ */ l.jsxs(Ce.Options, {
      labelledBy: w,
      "aria-label": C,
      children: [c ? /* @__PURE__ */ l.jsx(Nn.Autosize, {
        mah: (i ?? j.floatingHeight) === "viewport" ? "var(--combobox-floating-options-max-height)" : a ?? 220,
        type: "scroll",
        scrollbarSize: "var(--combobox-padding)",
        offsetScrollbars: "y",
        ...E,
        children: S
      }) : S, T && g && /* @__PURE__ */ l.jsx(Ce.Empty, { children: g })]
    })
  });
}
function _v(e) {
  const t = e.currentTarget;
  return Ut(t).activeElement !== t;
}
var Vd = {
  root: "m_de3d2490",
  colorOverlay: "m_862f3d1b",
  shadowOverlay: "m_98ae7f22",
  alphaOverlay: "m_95709ac0",
  childrenOverlay: "m_93e74e3"
};
const tl = { withShadow: !0 }, Hd = ze((e, { radius: t, size: n }) => ({ root: {
  "--cs-radius": t === void 0 ? void 0 : Tt(t),
  "--cs-size": Ae(n)
} })), No = tu((e) => {
  const t = Z("ColorSwatch", tl, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, color: c, radius: u, withShadow: f, children: h, attributes: d, ...m } = Z("ColorSwatch", tl, t), g = De({
    name: "ColorSwatch",
    props: t,
    classes: Vd,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: d,
    vars: i,
    varsResolver: Hd
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
No.classes = Vd;
No.varsResolver = Hd;
No.displayName = "@mantine/core/ColorSwatch";
function jt(e, t = 0, n = 10 ** t) {
  return Math.round(n * e) / n;
}
function Fv({ h: e, s: t, l: n, a: o }) {
  const r = t * ((n < 50 ? n : 100 - n) / 100);
  return {
    h: e,
    s: r > 0 ? 2 * r / (n + r) * 100 : 0,
    v: n + r,
    a: o
  };
}
const Bv = {
  grad: 360 / 400,
  turn: 360,
  rad: 360 / (Math.PI * 2)
};
function Vv(e, t = "deg") {
  return Number(e) * (Bv[t] || 1);
}
const Hv = /hsla?\(?\s*(-?\d*\.?\d+)(deg|rad|grad|turn)?[,\s]+(-?\d*\.?\d+)%?[,\s]+(-?\d*\.?\d+)%?,?\s*[/\s]*(-?\d*\.?\d+)?(%)?\s*\)?/i;
function nl(e) {
  const t = Hv.exec(e);
  return t ? Fv({
    h: Vv(t[1], t[2]),
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
function Na({ r: e, g: t, b: n, a: o }) {
  const r = Math.max(e, t, n), s = r - Math.min(e, t, n), a = s ? r === e ? (t - n) / s : r === t ? 2 + (n - e) / s : 4 + (e - t) / s : 0;
  return {
    h: jt(60 * (a < 0 ? a + 6 : a), 3),
    s: jt(r ? s / r * 100 : 0, 3),
    v: jt(r / 255 * 100, 3),
    a: o
  };
}
function Ta(e) {
  const t = e[0] === "#" ? e.slice(1) : e;
  return t.length === 3 ? Na({
    r: parseInt(t[0] + t[0], 16),
    g: parseInt(t[1] + t[1], 16),
    b: parseInt(t[2] + t[2], 16),
    a: 1
  }) : Na({
    r: parseInt(t.slice(0, 2), 16),
    g: parseInt(t.slice(2, 4), 16),
    b: parseInt(t.slice(4, 6), 16),
    a: 1
  });
}
function Uv(e) {
  const t = e[0] === "#" ? e.slice(1) : e, n = (s) => jt(parseInt(s, 16) / 255, 3);
  if (t.length === 4) {
    const s = t.slice(0, 3), a = n(t[3] + t[3]);
    return {
      ...Ta(s),
      a
    };
  }
  const o = t.slice(0, 6), r = n(t.slice(6, 8));
  return {
    ...Ta(o),
    a: r
  };
}
const Wv = /rgba?\(?\s*(-?\d*\.?\d+)(%)?[,\s]+(-?\d*\.?\d+)(%)?[,\s]+(-?\d*\.?\d+)(%)?,?\s*[/\s]*(-?\d*\.?\d+)?(%)?\s*\)?/i;
function ol(e) {
  const t = Wv.exec(e);
  return t ? Na({
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
const Ud = {
  hex: /^#?([0-9A-F]{3}){1,2}$/i,
  hexa: /^#?([0-9A-F]{4}){1,2}$/i,
  rgb: /^rgb\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/i,
  rgba: /^rgba\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/i,
  hsl: /hsl\(\s*(\d+)\s*,\s*(\d+(?:\.\d+)?%)\s*,\s*(\d+(?:\.\d+)?%)\)/i,
  hsla: /^hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*(\d*(?:\.\d+)?)\)$/i
}, qv = {
  hex: Ta,
  hexa: Uv,
  rgb: ol,
  rgba: ol,
  hsl: nl,
  hsla: nl
};
function zo(e) {
  for (const [, t] of Object.entries(Ud)) if (t.test(e)) return !0;
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
  for (const [n, o] of Object.entries(Ud)) if (o.test(t)) return qv[n](t);
  return {
    h: 0,
    s: 0,
    v: 0,
    a: 1
  };
}
const js = p.createContext(null);
function zi({ position: e, ...t }) {
  return /* @__PURE__ */ l.jsx(Q, {
    __vars: {
      "--thumb-y-offset": `${e.y * 100}%`,
      "--thumb-x-offset": `${e.x * 100}%`
    },
    ...t
  });
}
zi.displayName = "@mantine/core/ColorPickerThumb";
var ks = {
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
const To = se((e) => {
  const t = Z("ColorSlider", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, onChange: c, onChangeEnd: u, maxValue: f, round: h, size: d = "md", focusable: m = !0, value: g, overlays: v, thumbColor: w = "transparent", onScrubStart: x, onScrubEnd: E, __staticSelector: C = "ColorPicker", attributes: j, ref: R, ...T } = t, S = De({
    name: C,
    classes: ks,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: j,
    rootSelector: "slider"
  }), b = p.use(js)?.getStyles || S, P = lr(), [L, $] = p.useState({
    y: 0,
    x: g / f
  }), F = p.useRef(L), B = (M) => h ? Math.round(M * f) : M * f, { ref: I } = gu(({ x: M, y: A }) => {
    F.current = {
      x: M,
      y: A
    }, c?.(B(M));
  }, {
    onScrubEnd: () => {
      const { x: M } = F.current;
      u?.(B(M)), E?.();
    },
    onScrubStart: x
  });
  Cn(() => {
    $({
      y: 0,
      x: g / f
    });
  }, [g]);
  const O = (M, A) => {
    M.preventDefault();
    const _ = mu(A);
    c?.(B(_.x)), u?.(B(_.x));
  }, D = (M) => {
    switch (M.key) {
      case "ArrowRight":
        O(M, {
          x: L.x + 0.05,
          y: L.y
        });
        break;
      case "ArrowLeft":
        O(M, {
          x: L.x - 0.05,
          y: L.y
        });
    }
  }, z = v.map((M, A) => /* @__PURE__ */ p.createElement("div", {
    ...b("sliderOverlay"),
    style: M,
    key: A
  }));
  return /* @__PURE__ */ l.jsxs(Q, {
    ...T,
    ref: Ve(I, R),
    ...b("slider"),
    size: d,
    role: "slider",
    "aria-valuenow": g,
    "aria-valuemax": f,
    "aria-valuemin": 0,
    tabIndex: m ? 0 : -1,
    onKeyDown: D,
    "data-focus-ring": P.focusRing,
    __vars: { "--cp-thumb-size": `var(--cp-thumb-size-${d})` },
    children: [z, /* @__PURE__ */ l.jsx(zi, {
      position: L,
      ...b("thumb", { style: {
        top: Ae(1),
        background: w
      } })
    })]
  });
});
To.displayName = "@mantine/core/ColorSlider";
To.classes = ks;
const Kv = { __staticSelector: "AlphaSlider" }, _i = se((e) => {
  const { value: t, onChange: n, onChangeEnd: o, color: r, ...s } = Z("AlphaSlider", Kv, e);
  return /* @__PURE__ */ l.jsx(To, {
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
_i.displayName = "@mantine/core/AlphaSlider";
_i.classes = To.classes;
function Wd({ h: e, s: t, v: n, a: o }) {
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
function rl(e, t) {
  const { r: n, g: o, b: r, a: s } = Wd(e);
  return t ? `rgba(${n}, ${o}, ${r}, ${jt(s, 2)})` : `rgb(${n}, ${o}, ${r})`;
}
function sl({ h: e, s: t, v: n, a: o }, r) {
  const s = (200 - t) * n / 100, a = {
    h: Math.round(e),
    s: Math.round(s > 0 && s < 200 ? t * n / 100 / (s <= 100 ? s : 200 - s) * 100 : 0),
    l: Math.round(s / 2)
  };
  return r ? `hsla(${a.h}, ${a.s}%, ${a.l}%, ${jt(o, 2)})` : `hsl(${a.h}, ${a.s}%, ${a.l}%)`;
}
function Fr(e) {
  const t = e.toString(16);
  return t.length < 2 ? `0${t}` : t;
}
function qd(e) {
  const { r: t, g: n, b: o } = Wd(e);
  return `#${Fr(t)}${Fr(n)}${Fr(o)}`;
}
function Xv(e) {
  const t = Math.round(e.a * 255);
  return `${qd(e)}${Fr(t)}`;
}
const ra = {
  hex: qd,
  hexa: (e) => Xv(e),
  rgb: (e) => rl(e, !1),
  rgba: (e) => rl(e, !0),
  hsl: (e) => sl(e, !1),
  hsla: (e) => sl(e, !0)
};
function Dt(e, t) {
  return t ? e in ra ? ra[e](t) : ra.hex(t) : "#000000";
}
const Yv = { __staticSelector: "HueSlider" }, Fi = se((e) => {
  const { value: t, onChange: n, onChangeEnd: o, color: r, ...s } = Z("HueSlider", Yv, e);
  return /* @__PURE__ */ l.jsx(To, {
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
Fi.displayName = "@mantine/core/HueSlider";
Fi.classes = To.classes;
function Kd({ className: e, onChange: t, onChangeEnd: n, value: o, saturationLabel: r, focusable: s = !0, size: a, color: i, onScrubStart: c, onScrubEnd: u, ...f }) {
  const { getStyles: h } = p.use(js), [d, m] = p.useState({
    x: o.s / 100,
    y: 1 - o.v / 100
  }), g = p.useRef(d), { ref: v } = gu(({ x: E, y: C }) => {
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
    const j = mu(C);
    t({
      s: Math.round(j.x * 100),
      v: Math.round((1 - j.y) * 100)
    }), n({
      s: Math.round(j.x * 100),
      v: Math.round((1 - j.y) * 100)
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
    "aria-valuetext": Dt("rgba", o),
    tabIndex: s ? 0 : -1,
    onKeyDown: x,
    children: [
      /* @__PURE__ */ l.jsx("div", { ...h("saturationOverlay", { style: { backgroundColor: `hsl(${o.h}, 100%, 50%)` } }) }),
      /* @__PURE__ */ l.jsx("div", { ...h("saturationOverlay", { style: { backgroundImage: "linear-gradient(90deg, #fff, transparent)" } }) }),
      /* @__PURE__ */ l.jsx("div", { ...h("saturationOverlay", { style: { backgroundImage: "linear-gradient(0deg, #000, transparent)" } }) }),
      /* @__PURE__ */ l.jsx(zi, {
        position: d,
        ...h("thumb", { style: { backgroundColor: i } })
      })
    ]
  });
}
Kd.displayName = "@mantine/core/Saturation";
function Xd({ className: e, datatype: t, setValue: n, onChangeEnd: o, size: r, focusable: s, data: a, swatchesPerRow: i, value: c, ...u }) {
  const f = p.use(js), h = a.map((d, m) => /* @__PURE__ */ p.createElement(No, {
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
  }, c === d && /* @__PURE__ */ l.jsx(Li, {
    size: "35%",
    color: _p(d) < 0.5 ? "white" : "black"
  })));
  return /* @__PURE__ */ l.jsx(Q, {
    ...f.getStyles("swatches"),
    ...u,
    children: h
  });
}
Xd.displayName = "@mantine/core/Swatches";
const Gv = {
  swatchesPerRow: 7,
  withPicker: !0,
  focusable: !0,
  size: "md",
  __staticSelector: "ColorPicker"
}, Yd = ze((e, { size: t, swatchesPerRow: n }) => ({ wrapper: {
  "--cp-preview-size": _e(t, "cp-preview-size"),
  "--cp-width": _e(t, "cp-width"),
  "--cp-body-spacing": Ko(t),
  "--cp-swatch-size": `${100 / n}%`,
  "--cp-thumb-size": _e(t, "cp-thumb-size"),
  "--cp-saturation-height": _e(t, "cp-saturation-height")
} })), Es = se((e) => {
  const t = Z("ColorPicker", Gv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, format: c = "hex", value: u, defaultValue: f, onChange: h, onChangeEnd: d, withPicker: m, size: g, saturationLabel: v, hueLabel: w, alphaLabel: x, focusable: E, swatches: C, swatchesPerRow: j, fullWidth: R, onColorSwatchClick: T, __staticSelector: S, mod: b, attributes: P, name: L, hiddenInputProps: $, ...F } = t, B = De({
    name: S,
    props: t,
    classes: ks,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: P,
    rootSelector: "wrapper",
    vars: i,
    varsResolver: Yd
  }), I = p.useRef(c || "hex"), O = p.useRef(""), D = p.useRef(-1), z = p.useRef(!1), M = c === "hexa" || c === "rgba" || c === "hsla", [A, _, H] = Qe({
    value: u,
    defaultValue: f,
    finalValue: "#FFFFFF",
    onChange: h
  }), [W, Y] = p.useState(Mn(A)), ae = () => {
    window.clearTimeout(D.current), z.current = !0;
  }, fe = () => {
    window.clearTimeout(D.current), D.current = window.setTimeout(() => {
      z.current = !1;
    }, 200);
  }, ie = (te) => {
    Y((he) => {
      const q = {
        ...he,
        ...te
      };
      return O.current = Dt(I.current, q), q;
    }), _(O.current);
  };
  return Cn(() => {
    typeof u == "string" && zo(u) && !z.current && Y(Mn(u));
  }, [u]), Cn(() => {
    I.current = c || "hex", _(Dt(I.current, W));
  }, [c]), /* @__PURE__ */ l.jsx(js, {
    value: {
      getStyles: B,
      unstyled: a
    },
    children: /* @__PURE__ */ l.jsxs(Q, {
      ...B("wrapper"),
      size: g,
      mod: [{ "full-width": R }, b],
      ...F,
      children: [
        L && /* @__PURE__ */ l.jsx("input", {
          type: "hidden",
          name: L,
          value: A,
          ...$
        }),
        m && /* @__PURE__ */ l.jsxs(l.Fragment, { children: [/* @__PURE__ */ l.jsx(Kd, {
          value: W,
          onChange: ie,
          onChangeEnd: ({ s: te, v: he }) => d?.(Dt(I.current, {
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
          ...B("body"),
          children: [/* @__PURE__ */ l.jsxs("div", {
            ...B("sliders"),
            children: [/* @__PURE__ */ l.jsx(Fi, {
              value: W.h,
              onChange: (te) => ie({ h: te }),
              onChangeEnd: (te) => d?.(Dt(I.current, {
                ...W,
                h: te
              })),
              size: g,
              focusable: E,
              "aria-label": w,
              onScrubStart: ae,
              onScrubEnd: fe
            }), M && /* @__PURE__ */ l.jsx(_i, {
              value: W.a,
              onChange: (te) => ie({ a: te }),
              onChangeEnd: (te) => {
                d?.(Dt(I.current, {
                  ...W,
                  a: te
                }));
              },
              size: g,
              color: Dt("hex", W),
              focusable: E,
              "aria-label": x,
              onScrubStart: ae,
              onScrubEnd: fe
            })]
          }), M && /* @__PURE__ */ l.jsx(No, {
            color: A,
            radius: "sm",
            size: "var(--cp-preview-size)",
            ...B("preview")
          })]
        })] }),
        Array.isArray(C) && /* @__PURE__ */ l.jsx(Xd, {
          data: C,
          swatchesPerRow: j,
          focusable: E,
          setValue: _,
          value: A,
          onChangeEnd: (te) => {
            const he = Dt(c, Mn(te));
            T?.(he), d?.(he), H || Y(Mn(te));
          }
        })
      ]
    })
  });
});
Es.classes = ks;
Es.varsResolver = Yd;
Es.displayName = "@mantine/core/ColorPicker";
function Jv({ style: e, ...t }) {
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
var al = {
  eyeDropperIcon: "m_b077c2bc",
  eyeDropperButton: "m_66a028b5",
  colorPreview: "m_c5ccdcab",
  dropdown: "m_5ece2cd7"
};
const il = {
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
}, Gd = ze((e, { size: t }) => ({
  eyeDropperIcon: { "--ci-eye-dropper-icon-size": _e(t, "ci-eye-dropper-icon-size") },
  eyeDropperButton: { "--ci-button-size": _e(t, "ci-button-size") },
  colorPreview: { "--ci-preview-size": _e(t, "ci-preview-size") }
})), mr = se((e) => {
  const t = Z([
    "Input",
    "InputWrapper",
    "ColorInput"
  ], il, e), { classNames: n, styles: o, unstyled: r, disallowInput: s, fixOnBlur: a, popoverProps: i, withPreview: c, withEyeDropper: u, eyeDropperIcon: f, closeOnColorSwatchClick: h, eyeDropperButtonProps: d, value: m, defaultValue: g, onChange: v, onChangeEnd: w, onClick: x, onFocus: E, onBlur: C, inputProps: j, format: R = "hex", wrapperProps: T, readOnly: S, withPicker: b, swatches: P, disabled: L, leftSection: $, rightSection: F, swatchesPerRow: B, fullWidth: I, ...O } = Jp("ColorInput", il, e), D = De({
    name: "ColorInput",
    props: t,
    classes: al,
    classNames: n,
    styles: o,
    unstyled: r,
    rootSelector: "wrapper",
    vars: t.vars,
    varsResolver: Gd
  }), { resolvedClassNames: z, resolvedStyles: M } = ur({
    classNames: n,
    styles: o,
    props: t
  }), [A, _] = p.useState(!1), [H, W] = p.useState(""), [Y, ae] = Qe({
    value: m,
    defaultValue: g,
    finalValue: "",
    onChange: v
  }), { supported: fe, open: ie } = vh(), te = /* @__PURE__ */ l.jsx(Ho, {
    ...d,
    ...D("eyeDropperButton", {
      className: d?.className,
      style: d?.style
    }),
    variant: "subtle",
    color: "gray",
    unstyled: r,
    onClick: () => ie().then((le) => {
      if (le?.sRGBHex) {
        const xe = Dt(R, Mn(le.sRGBHex));
        ae(xe), w?.(xe);
      }
    }).catch(() => {
    }),
    children: f || /* @__PURE__ */ l.jsx(Jv, { ...D("eyeDropperIcon") })
  }), he = (le) => {
    E?.(le), _(!0);
  }, q = (le) => {
    a && ae(H), C?.(le), _(!1);
  }, K = (le) => {
    x?.(le), _(!0);
  };
  return p.useEffect(() => {
    (zo(Y) || Y.trim() === "") && W(Y);
  }, [Y]), Cn(() => {
    zo(Y) && ae(Dt(R, Mn(Y)));
  }, [R]), /* @__PURE__ */ l.jsx(Rt.Wrapper, {
    ...T,
    classNames: z,
    styles: M,
    __staticSelector: "ColorInput",
    children: /* @__PURE__ */ l.jsxs(He, {
      __staticSelector: "ColorInput",
      position: "bottom-start",
      offset: 5,
      opened: A,
      width: I ? "target" : void 0,
      ...i,
      classNames: z,
      styles: M,
      unstyled: r,
      withRoles: !1,
      disabled: S || b === !1 && (!Array.isArray(P) || P.length === 0),
      children: [/* @__PURE__ */ l.jsx(He.Target, { children: /* @__PURE__ */ l.jsx(Rt, {
        autoComplete: "off",
        ...O,
        ...j,
        classNames: z,
        styles: M,
        disabled: L,
        __staticSelector: "ColorInput",
        onFocus: he,
        onBlur: q,
        onClick: K,
        spellCheck: !1,
        value: Y,
        onChange: (le) => {
          const xe = le.currentTarget.value;
          ae(xe), zo(xe) && w?.(Dt(R, Mn(xe)));
        },
        leftSection: $ || (c ? /* @__PURE__ */ l.jsx(No, {
          color: zo(Y) ? Y : "#fff",
          size: "var(--ci-preview-size)",
          ...D("colorPreview")
        }) : null),
        readOnly: s || S,
        pointer: s,
        unstyled: r,
        rightSection: F || (u && !L && !S && fe ? te : null)
      }) }), /* @__PURE__ */ l.jsx(He.Dropdown, {
        onMouseDown: (le) => le.preventDefault(),
        className: al.dropdown,
        children: /* @__PURE__ */ l.jsx(Es, {
          __staticSelector: "ColorInput",
          value: Y,
          onChange: ae,
          onChangeEnd: w,
          format: R,
          swatches: P,
          swatchesPerRow: B,
          withPicker: b,
          size: j.size,
          focusable: !1,
          unstyled: r,
          styles: M,
          classNames: z,
          onColorSwatchClick: () => h && _(!1),
          attributes: T.attributes,
          fullWidth: I
        })
      })]
    })
  });
});
mr.classes = St.classes;
mr.varsResolver = Gd;
mr.displayName = "@mantine/core/ColorInput";
var Jd = {
  root: "m_3eebeb36",
  label: "m_9e365f20"
};
const Zv = { orientation: "horizontal" }, Zd = ze((e, { color: t, variant: n, size: o }) => ({ root: {
  "--divider-color": t ? at(t, e) : void 0,
  "--divider-border-style": n,
  "--divider-size": _e(o, "divider-size")
} })), Rs = se((e) => {
  const t = Z("Divider", Zv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, color: c, orientation: u, label: f, labelPosition: h, mod: d, attributes: m, ...g } = t, v = De({
    name: "Divider",
    classes: Jd,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: m,
    vars: i,
    varsResolver: Zd
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
Rs.classes = Jd;
Rs.varsResolver = Zd;
Rs.displayName = "@mantine/core/Divider";
const Qd = En((e) => {
  const { onChange: t, children: n, multiple: o, accept: r, name: s, form: a, resetRef: i, disabled: c, capture: u, inputProps: f, ref: h, ...d } = Z("FileButton", null, e), m = p.useRef(null), g = () => {
    !c && m.current?.click();
  }, v = (x) => {
    if (x.currentTarget.files === null) return t(o ? [] : null);
    t(o ? Array.from(x.currentTarget.files) : x.currentTarget.files[0] || null);
  };
  return au(i, () => {
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
Qd.displayName = "@mantine/core/FileButton";
const Qv = ({ value: e }) => /* @__PURE__ */ l.jsx("div", {
  style: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  children: Array.isArray(e) ? e.map((t) => t.name).join(", ") : e?.name
}), ey = {
  valueComponent: Qv,
  size: "sm"
}, Bi = En((e) => {
  const t = Z([
    "Input",
    "InputWrapper",
    "FileInput"
  ], ey, e), { unstyled: n, vars: o, onChange: r, value: s, defaultValue: a, multiple: i, accept: c, name: u, form: f, valueComponent: h, clearable: d, clearSectionMode: m, clearButtonProps: g, readOnly: v, capture: w, fileInputProps: x, rightSection: E, size: C, placeholder: j, component: R, resetRef: T, classNames: S, styles: b, attributes: P, ...L } = t, $ = p.useRef(null), { resolvedClassNames: F, resolvedStyles: B } = ur({
    classNames: S,
    styles: b,
    props: t
  }), [I, O] = Qe({
    value: s,
    defaultValue: a,
    onChange: r,
    finalValue: i ? [] : null
  }), D = Array.isArray(I) ? I.length !== 0 : I !== null, z = /* @__PURE__ */ l.jsx(ri, {
    ...g,
    variant: "subtle",
    onClick: () => O(i ? [] : null),
    size: C,
    unstyled: n
  }), M = d && D && !v;
  return p.useEffect(() => {
    (Array.isArray(I) && I.length === 0 || I === null) && $.current?.();
  }, [I]), /* @__PURE__ */ l.jsx(Qd, {
    onChange: O,
    multiple: i,
    accept: c,
    name: u,
    form: f,
    resetRef: Ve($, T),
    disabled: v,
    capture: w,
    inputProps: x,
    children: (A) => /* @__PURE__ */ l.jsx(St, {
      component: R || "button",
      rightSection: E,
      __clearSection: z,
      __clearable: M,
      __clearSectionMode: m,
      ...A,
      ...L,
      __staticSelector: "FileInput",
      multiline: !0,
      type: "button",
      pointer: !0,
      __stylesApiProps: t,
      unstyled: n,
      size: C,
      classNames: S,
      styles: b,
      attributes: P,
      children: D ? /* @__PURE__ */ l.jsx(h, { value: I }) : /* @__PURE__ */ l.jsx(Rt.Placeholder, {
        __staticSelector: "FileInput",
        classNames: F,
        styles: B,
        attributes: P,
        children: j
      })
    })
  });
});
Bi.classes = St.classes;
Bi.displayName = "@mantine/core/FileInput";
const ty = [
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
], cl = {
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
function ll(e) {
  Object.keys(cl).forEach((t) => {
    e.style.setProperty(t, cl[t], "important");
  });
}
function ny(e) {
  const t = window.getComputedStyle(e);
  if (t === null) return null;
  const n = {};
  for (const o of ty) n[o] = t[o];
  return n.boxSizing === "" ? null : {
    sizingStyle: n,
    paddingSize: parseFloat(n.paddingBottom) + parseFloat(n.paddingTop),
    borderSize: parseFloat(n.borderBottomWidth) + parseFloat(n.borderTopWidth)
  };
}
let Xe = null;
function oy(e, t, n = 1, o = 1 / 0) {
  Xe || (Xe = document.createElement("textarea"), Xe.setAttribute("tabindex", "-1"), Xe.setAttribute("aria-hidden", "true"), Xe.setAttribute("aria-label", "autosize measurement"), ll(Xe)), Xe.parentNode === null && document.body.appendChild(Xe);
  const { paddingSize: r, borderSize: s, sizingStyle: a } = e, { boxSizing: i } = a;
  Object.keys(a).forEach((d) => {
    Xe.style[d] = a[d];
  }), ll(Xe), Xe.value = t;
  let c = i === "border-box" ? Xe.scrollHeight + s : Xe.scrollHeight - r;
  Xe.value = t, c = i === "border-box" ? Xe.scrollHeight + s : Xe.scrollHeight - r, Xe.value = "x";
  const u = Xe.scrollHeight - r;
  let f = u * n;
  i === "border-box" && (f = f + r + s), c = Math.max(f, c);
  let h = u * o;
  return i === "border-box" && (h = h + r + s), c = Math.min(h, c), [c, u];
}
function ry({ maxRows: e, minRows: t, onChange: n, ref: o, ...r }) {
  const s = r.value !== void 0, a = p.useRef(null), i = Ve(a, o), c = p.useRef(0), u = p.useRef(0), f = () => {
    const m = a.current;
    if (!m) return;
    const g = ny(m);
    if (!g) return;
    const [v] = oy(g, m.value || m.placeholder || "x", t, e);
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
const go = se((e) => {
  const { autosize: t, maxRows: n, minRows: o, __staticSelector: r, resize: s, bottomSection: a, bottomSectionProps: i, ...c } = Z([
    "Input",
    "InputWrapper",
    "Textarea"
  ], null, e), u = t && vu() !== "test", f = u ? {
    maxRows: n,
    minRows: o
  } : {};
  return /* @__PURE__ */ l.jsx(St, {
    component: u ? ry : "textarea",
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
go.classes = St.classes;
go.displayName = "@mantine/core/Textarea";
function ef({ size: e, style: t, ...n }) {
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
const [sy, Po] = Gt("Modal component was not found in tree");
var ln = {
  root: "m_9df02822",
  content: "m_54c44539",
  inner: "m_1f958f16",
  header: "m_d0e2b9cd"
};
const Ns = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ModalBody", null, e), i = Po();
  return /* @__PURE__ */ l.jsx(cd, {
    ...i.getStyles("body", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
Ns.classes = ln;
Ns.displayName = "@mantine/core/ModalBody";
const Ts = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ModalCloseButton", null, e), i = Po();
  return /* @__PURE__ */ l.jsx(ld, {
    ...i.getStyles("close", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
Ts.classes = ln;
Ts.displayName = "@mantine/core/ModalCloseButton";
const Ps = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, children: a, __hidden: i, ...c } = Z("ModalContent", null, e), u = Po(), f = u.scrollAreaComponent || pv;
  return /* @__PURE__ */ l.jsx(ud, {
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
Ps.classes = ln;
Ps.displayName = "@mantine/core/ModalContent";
const As = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ModalHeader", null, e), i = Po();
  return /* @__PURE__ */ l.jsx(dd, {
    ...i.getStyles("header", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
As.classes = ln;
As.displayName = "@mantine/core/ModalHeader";
const Is = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ModalOverlay", null, e), i = Po();
  return /* @__PURE__ */ l.jsx(fd, {
    ...i.getStyles("overlay", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
Is.classes = ln;
Is.displayName = "@mantine/core/ModalOverlay";
const ay = {
  __staticSelector: "Modal",
  closeOnClickOutside: !0,
  withinPortal: !0,
  lockScroll: !0,
  trapFocus: !0,
  returnFocus: !0,
  closeOnEscape: !0,
  keepMounted: !1,
  zIndex: jo("modal"),
  transitionProps: {
    duration: 200,
    transition: "fade-down"
  },
  yOffset: "5dvh"
}, tf = ze((e, { radius: t, size: n, yOffset: o, xOffset: r }) => ({ root: {
  "--modal-radius": t === void 0 ? void 0 : Tt(t),
  "--modal-size": _e(n, "modal-size"),
  "--modal-y-offset": Ae(o),
  "--modal-x-offset": Ae(r)
} })), gr = se((e) => {
  const t = Z("ModalRoot", ay, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, yOffset: c, scrollAreaComponent: u, radius: f, fullScreen: h, centered: d, xOffset: m, __staticSelector: g, attributes: v, ...w } = t, x = De({
    name: g,
    classes: ln,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: v,
    vars: i,
    varsResolver: tf
  });
  return /* @__PURE__ */ l.jsx(sy, {
    value: {
      yOffset: c,
      scrollAreaComponent: u,
      getStyles: x,
      fullScreen: h
    },
    children: /* @__PURE__ */ l.jsx(id, {
      ...x("root"),
      "data-full-screen": h || void 0,
      "data-centered": d || void 0,
      "data-offset-scrollbars": u === Nn.Autosize || void 0,
      unstyled: a,
      ...w
    })
  });
});
gr.classes = ln;
gr.varsResolver = tf;
gr.displayName = "@mantine/core/ModalRoot";
const nf = p.createContext(null);
function of({ children: e }) {
  const [t, n] = p.useState([]), [o, r] = p.useState(jo("modal")), [s] = p.useState(() => /* @__PURE__ */ new WeakSet());
  return /* @__PURE__ */ l.jsx(nf, {
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
of.displayName = "@mantine/core/ModalStack";
const Ms = se((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ModalTitle", null, e), i = Po();
  return /* @__PURE__ */ l.jsx(pd, {
    ...i.getStyles("title", {
      classNames: t,
      style: o,
      styles: r,
      className: n
    }),
    ...a
  });
});
Ms.classes = ln;
Ms.displayName = "@mantine/core/ModalTitle";
const iy = {
  closeOnClickOutside: !0,
  withinPortal: !0,
  lockScroll: !0,
  trapFocus: !0,
  returnFocus: !0,
  closeOnEscape: !0,
  keepMounted: !1,
  zIndex: jo("modal"),
  transitionProps: {
    duration: 200,
    transition: "fade-down"
  },
  withOverlay: !0,
  withCloseButton: !0
}, pt = se((e) => {
  const { title: t, withOverlay: n, overlayProps: o, withCloseButton: r, closeButtonProps: s, children: a, radius: i, opened: c, stackId: u, zIndex: f, ...h } = Z("Modal", iy, e), d = p.use(nf), m = !!t || r, g = d && u ? {
    closeOnEscape: d.currentId === u,
    trapFocus: d.currentId === u,
    zIndex: d.getZIndex(u),
    __handledEscapeEvents: d.handledEscapeEvents
  } : {}, v = n === !1 ? !1 : u && d ? d.currentId === u : c;
  return p.useEffect(() => {
    d && u && (c ? d.addModal(u, f || jo("modal")) : d.removeModal(u));
  }, [
    c,
    u,
    f
  ]), /* @__PURE__ */ l.jsxs(gr, {
    radius: i,
    opened: c,
    zIndex: d && u ? d.getZIndex(u) : f,
    ...h,
    ...g,
    children: [n && /* @__PURE__ */ l.jsx(Is, {
      visible: v,
      transitionProps: d && u ? { duration: 0 } : void 0,
      ...o
    }), /* @__PURE__ */ l.jsxs(Ps, {
      radius: i,
      __hidden: d && u && c ? u !== d.currentId : !1,
      children: [m && /* @__PURE__ */ l.jsxs(As, { children: [t && /* @__PURE__ */ l.jsx(Ms, { children: t }), r && /* @__PURE__ */ l.jsx(Ts, { ...s })] }), /* @__PURE__ */ l.jsx(Ns, { children: a })]
    })]
  });
});
pt.classes = ln;
pt.displayName = "@mantine/core/Modal";
pt.Root = gr;
pt.Overlay = Is;
pt.Content = Ps;
pt.Body = Ns;
pt.Header = As;
pt.Title = Ms;
pt.CloseButton = Ts;
pt.Stack = of;
function cy(e, t) {
  const n = t.trim().toLowerCase();
  if (n === "") return;
  const o = Object.values(e).filter((r) => !r.disabled && r.label.trim().toLowerCase() === n);
  return o.length === 1 ? o[0] : void 0;
}
function ly(e) {
  return "group" in e;
}
function Vi({ data: e }) {
  if (ly(e)) {
    const r = e.items.map((s) => /* @__PURE__ */ l.jsx(Vi, { data: s }, s.value));
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
Vi.displayName = "@mantine/core/NativeSelectOption";
const uy = {
  size: "sm",
  rightSectionPointerEvents: "none"
}, vo = se((e) => {
  const { data: t, children: n, size: o, error: r, rightSection: s, unstyled: a, ...i } = Z([
    "Input",
    "InputWrapper",
    "NativeSelect"
  ], uy, e), c = wd(t).map((u, f) => /* @__PURE__ */ l.jsx(Vi, { data: u }, f));
  return /* @__PURE__ */ l.jsx(St, {
    component: "select",
    ...i,
    __staticSelector: "NativeSelect",
    size: o,
    pointer: !0,
    error: r,
    unstyled: a,
    rightSection: s || /* @__PURE__ */ l.jsx(hr, {
      size: o,
      error: r,
      unstyled: a
    }),
    children: n || c
  });
});
vo.classes = St.classes;
vo.displayName = "@mantine/core/NativeSelect";
function rf(e, t) {
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
function mn() {
}
function dy(e) {
  var t, n = void 0;
  return function() {
    for (var o = [], r = arguments.length; r--; ) o[r] = arguments[r];
    return t && o.length === t.length && o.every(function(s, a) {
      return s === t[a];
    }) || (t = o, n = e.apply(void 0, o)), n;
  };
}
function Zo(e) {
  return !!(e || "").match(/\d/);
}
function vn(e) {
  return e == null;
}
function fy(e) {
  return typeof e == "number" && isNaN(e);
}
function sf(e) {
  return vn(e) || fy(e) || typeof e == "number" && !isFinite(e);
}
function af(e) {
  return e.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
}
function py(e) {
  switch (e) {
    case "lakh":
      return /(\d+?)(?=(\d\d)+(\d)(?!\d))(\.\d+)?/g;
    case "wan":
      return /(\d)(?=(\d{4})+(?!\d))/g;
    default:
      return /(\d)(?=(\d{3})+(?!\d))/g;
  }
}
function hy(e, t, n) {
  var o = py(n), r = e.search(/[1-9]/);
  return r = r === -1 ? e.length : r, e.substring(0, r) + e.substring(r, e.length).replace(o, "$1" + t);
}
function ul(e) {
  var t = p.useRef(e);
  t.current = e;
  var n = p.useRef(function() {
    for (var o = [], r = arguments.length; r--; ) o[r] = arguments[r];
    return t.current.apply(t, o);
  });
  return n.current;
}
function Hi(e, t) {
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
function my(e) {
  if (!e)
    return e;
  var t = e[0] === "-";
  t && (e = e.substring(1, e.length));
  var n = e.split("."), o = n[0].replace(/^0+/, "") || "0", r = n[1] || "";
  return (t ? "-" : "") + o + (r ? "." + r : "");
}
function cf(e, t, n) {
  for (var o = "", r = n ? "0" : "", s = 0; s <= t - 1; s++)
    o += e[s] || r;
  return o;
}
function dl(e, t) {
  return Array(t + 1).join(e);
}
function lf(e) {
  var t = e + "", n = t[0] === "-" ? "-" : "";
  n && (t = t.substring(1));
  var o = t.split(/[eE]/g), r = o[0], s = o[1];
  if (s = Number(s), !s)
    return n + r;
  r = r.replace(".", "");
  var a = 1 + s, i = r.length;
  return a < 0 ? r = "0." + dl("0", Math.abs(a)) + r : a >= i ? r = r + dl("0", a - i) : r = (r.substring(0, a) || "0") + "." + r.substring(a), n + r;
}
function fl(e, t, n) {
  if (["", "-"].indexOf(e) !== -1)
    return e;
  var o = (e.indexOf(".") !== -1 || n) && t, r = Hi(e), s = r.beforeDecimal, a = r.afterDecimal, i = r.hasNegation, c = parseFloat("0." + (a || "0")), u = a.length <= t ? "0." + a : c.toFixed(t), f = u.split("."), h = s;
  s && Number(f[0]) && (h = s.split("").reverse().reduce(function(v, w, x) {
    return v.length > x ? (Number(v[0]) + Number(w)).toString() + v.substring(1, v.length) : w + v;
  }, f[0]));
  var d = cf(f[1] || "", t, n), m = i ? "-" : "", g = o ? "." : "";
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
var uf = dy(function(e, t) {
  for (var n = 0, o = 0, r = e.length, s = t.length; e[n] === t[n] && n < r; )
    n++;
  for (; e[r - 1 - o] === t[s - 1 - o] && s - o > n && r - o > n; )
    o++;
  return {
    from: { start: n, end: r - o },
    to: { start: n, end: s - o }
  };
}), gy = function(e, t) {
  var n = Math.min(e.selectionStart, t);
  return {
    from: { start: n, end: e.selectionEnd },
    to: { start: n, end: t }
  };
};
function vy(e, t, n) {
  return Math.min(Math.max(e, t), n);
}
function sa(e) {
  return Math.max(e.selectionStart, e.selectionEnd);
}
function yy() {
  return typeof navigator < "u" && !(navigator.platform && /iPhone|iPod/.test(navigator.platform));
}
function by(e) {
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
function wy(e) {
  var t = e.currentValue, n = e.formattedValue, o = e.currentValueIndex, r = e.formattedValueIndex;
  return t[o] === n[r];
}
function xy(e, t, n, o, r, s, a) {
  a === void 0 && (a = wy);
  var i = r.findIndex(function(j) {
    return j;
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
function pl(e, t, n, o) {
  var r = e.length;
  if (t = vy(t, 0, r), o === "left") {
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
function Sy(e) {
  for (var t = Array.from({ length: e.length + 1 }).map(function() {
    return !0;
  }), n = 0, o = t.length; n < o; n++)
    t[n] = !!(Zo(e[n]) || Zo(e[n - 1]));
  return t;
}
function df(e, t, n, o, r, s) {
  s === void 0 && (s = mn);
  var a = ul(function(g, v) {
    var w, x;
    return sf(g) ? (x = "", w = "") : typeof g == "number" || v ? (x = typeof g == "number" ? lf(g) : g, w = o(x)) : (x = r(g, void 0), w = o(x)), { formattedValue: w, numAsString: x };
  }), i = p.useState(function() {
    return a(vn(e) ? t : e, n);
  }), c = i[0], u = i[1], f = ul(function(g, v) {
    g.formattedValue !== c.formattedValue && u({
      formattedValue: g.formattedValue,
      numAsString: g.value
    }), s(g, v);
  }), h = e, d = n;
  vn(e) && (h = c.numAsString, d = !0);
  var m = a(h, d);
  return p.useMemo(function() {
    u(m);
  }, [m.formattedValue]), p.useEffect(function() {
    if (!vn(t) && vn(e) && c.formattedValue !== "") {
      var g = parseFloat(c.numAsString);
      f({
        formattedValue: c.formattedValue,
        value: c.numAsString,
        floatValue: isNaN(g) ? void 0 : g
      }, { event: void 0, source: yo.props });
    }
  }, []), [c, f];
}
function Cy(e) {
  return e.replace(/[^0-9]/g, "");
}
function jy(e) {
  return e;
}
function ky(e) {
  var t = e.type;
  t === void 0 && (t = "text");
  var n = e.displayType;
  n === void 0 && (n = "input");
  var o = e.customInput, r = e.renderText, s = e.getInputRef, a = e.format;
  a === void 0 && (a = jy);
  var i = e.removeFormatting;
  i === void 0 && (i = Cy);
  var c = e.defaultValue, u = e.valueIsNumericString, f = e.onValueChange, h = e.isAllowed, d = e.onChange;
  d === void 0 && (d = mn);
  var m = e.onKeyDown;
  m === void 0 && (m = mn);
  var g = e.onMouseUp;
  g === void 0 && (g = mn);
  var v = e.onFocus;
  v === void 0 && (v = mn);
  var w = e.onBlur;
  w === void 0 && (w = mn);
  var x = e.value, E = e.getCaretBoundary;
  E === void 0 && (E = Sy);
  var C = e.isValidInputCharacter;
  C === void 0 && (C = Zo);
  var j = e.isCharacterSame, R = rf(e, ["type", "displayType", "customInput", "renderText", "getInputRef", "format", "removeFormatting", "defaultValue", "valueIsNumericString", "onValueChange", "isAllowed", "onChange", "onKeyDown", "onMouseUp", "onFocus", "onBlur", "value", "getCaretBoundary", "isValidInputCharacter", "isCharacterSame"]), T = df(x, c, !!u, a, i, f), S = T[0], b = S.formattedValue, P = S.numAsString, L = T[1], $ = p.useRef(), F = p.useRef({ formattedValue: b, numAsString: P }), B = function(V, X) {
    F.current = { formattedValue: V.formattedValue, numAsString: V.value }, L(V, X);
  }, I = p.useState(!1), O = I[0], D = I[1], z = p.useRef(null), M = p.useRef({
    setCaretTimeout: null,
    focusTimeout: null
  });
  p.useEffect(function() {
    return D(!0), function() {
      clearTimeout(M.current.setCaretTimeout), clearTimeout(M.current.focusTimeout);
    };
  }, []);
  var A = a, _ = function(V, X) {
    var ue = parseFloat(X);
    return {
      formattedValue: V,
      value: X,
      floatValue: isNaN(ue) ? void 0 : ue
    };
  }, H = function(V, X, ue) {
    V.selectionStart === 0 && V.selectionEnd === V.value.length || (In(V, X), M.current.setCaretTimeout = setTimeout(function() {
      V.value === ue && V.selectionStart !== X && In(V, X);
    }, 0));
  }, W = function(V, X, ue) {
    return pl(V, X, E(V), ue);
  }, Y = function(V, X, ue) {
    var ke = E(X), Ie = xy(X, b, V, ue, ke, C, j);
    return Ie = pl(X, Ie, ke), Ie;
  }, ae = function(V) {
    var X = V.formattedValue;
    X === void 0 && (X = "");
    var ue = V.input, ke = V.source, Ie = V.event, me = V.numAsString, ge;
    if (ue) {
      var Se = V.inputValue || ue.value, Oe = sa(ue);
      ue.value = X, ge = Y(Se, X, Oe), ge !== void 0 && H(ue, ge, X);
    }
    X !== b && B(_(X, me), { event: Ie, source: ke });
  };
  p.useEffect(function() {
    var V = F.current, X = V.formattedValue, ue = V.numAsString;
    (b !== X || P !== ue) && B(_(b, P), {
      event: void 0,
      source: yo.props
    });
  }, [b, P]);
  var fe = z.current ? sa(z.current) : void 0, ie = typeof window < "u" ? p.useLayoutEffect : p.useEffect;
  ie(function() {
    var V = z.current;
    if (b !== F.current.formattedValue && V) {
      var X = Y(F.current.formattedValue, b, fe);
      V.value = b, H(V, X, b);
    }
  }, [b]);
  var te = function(V, X, ue) {
    var ke = X.target, Ie = $.current ? gy($.current, ke.selectionEnd) : uf(b, V), me = Object.assign(Object.assign({}, Ie), { lastValue: b }), ge = i(V, me), Se = A(ge);
    if (ge = i(Se, void 0), h && !h(_(Se, ge))) {
      var Oe = X.target, de = sa(Oe), vt = Y(V, b, de);
      return Oe.value = b, H(Oe, vt, b), !1;
    }
    return ae({
      formattedValue: Se,
      numAsString: ge,
      inputValue: V,
      event: X,
      source: ue,
      input: X.target
    }), !0;
  }, he = function(V, X) {
    X === void 0 && (X = 0);
    var ue = V.selectionStart, ke = V.selectionEnd;
    $.current = { selectionStart: ue, selectionEnd: ke + X };
  }, q = function(V) {
    var X = V.target, ue = X.value, ke = te(ue, V, yo.event);
    ke && d(V), $.current = void 0;
  }, K = function(V) {
    var X = V.target, ue = V.key, ke = X.selectionStart, Ie = X.selectionEnd, me = X.value;
    me === void 0 && (me = "");
    var ge;
    ue === "ArrowLeft" || ue === "Backspace" ? ge = Math.max(ke - 1, 0) : ue === "ArrowRight" ? ge = Math.min(ke + 1, me.length) : ue === "Delete" && (ge = ke);
    var Se = 0;
    ue === "Delete" && ke === Ie && (Se = 1);
    var Oe = ue === "ArrowLeft" || ue === "ArrowRight";
    if (ge === void 0 || ke !== Ie && !Oe) {
      m(V), he(X, Se);
      return;
    }
    var de = ge;
    if (Oe) {
      var vt = ue === "ArrowLeft" ? "left" : "right";
      de = W(me, ge, vt), de !== ge && V.preventDefault();
    } else ue === "Delete" && !C(me[ge]) ? de = W(me, ge, "right") : ue === "Backspace" && !C(me[ge]) && (de = W(me, ge, "left"));
    de !== ge && H(X, de, me), m(V), he(X, Se);
  }, le = function(V) {
    var X = V.target, ue = function() {
      var ke = X.selectionStart, Ie = X.selectionEnd, me = X.value;
      if (me === void 0 && (me = ""), ke === Ie) {
        var ge = W(me, ke);
        ge !== ke && H(X, ge, me);
      }
    };
    ue(), requestAnimationFrame(function() {
      ue();
    }), g(V), he(X);
  }, xe = function(V) {
    V.persist && V.persist();
    var X = V.target, ue = V.currentTarget;
    z.current = X, M.current.focusTimeout = setTimeout(function() {
      var ke = X.selectionStart, Ie = X.selectionEnd, me = X.value;
      me === void 0 && (me = "");
      var ge = W(me, ke);
      ge !== ke && !(ke === 0 && Ie === me.length) && H(X, ge, me), v(Object.assign(Object.assign({}, V), { currentTarget: ue }));
    }, 0);
  }, pe = function(V) {
    z.current = null, clearTimeout(M.current.focusTimeout), clearTimeout(M.current.setCaretTimeout), w(V);
  }, je = O && yy() ? "numeric" : void 0, ne = Object.assign({ inputMode: je }, R, {
    type: t,
    value: b,
    onChange: q,
    onKeyDown: K,
    onMouseUp: le,
    onFocus: xe,
    onBlur: pe
  });
  if (n === "text")
    return r ? hn.createElement(hn.Fragment, null, r(b, R) || null) : hn.createElement("span", Object.assign({}, R, { ref: s }), b);
  if (o) {
    var U = o;
    return hn.createElement(U, Object.assign({}, ne, { ref: s }));
  }
  return hn.createElement("input", Object.assign({}, ne, { ref: s }));
}
function hl(e, t) {
  var n = t.decimalScale, o = t.fixedDecimalScale, r = t.prefix;
  r === void 0 && (r = "");
  var s = t.suffix;
  s === void 0 && (s = "");
  var a = t.allowNegative, i = t.thousandsGroupStyle;
  if (i === void 0 && (i = "thousand"), e === "" || e === "-")
    return e;
  var c = Ds(t), u = c.thousandSeparator, f = c.decimalSeparator, h = n !== 0 && e.indexOf(".") !== -1 || n && o, d = Hi(e, a), m = d.beforeDecimal, g = d.afterDecimal, v = d.addNegation;
  return n !== void 0 && (g = cf(g, n, !!o)), u && (m = hy(m, u, i)), r && (m = r + m), s && (g = g + s), v && (m = "-" + m), e = m + (h && f || "") + g, e;
}
function Ds(e) {
  var t = e.decimalSeparator;
  t === void 0 && (t = ".");
  var n = e.thousandSeparator, o = e.allowedDecimalSeparators;
  return n === !0 && (n = ","), o || (o = [t, "."]), {
    decimalSeparator: t,
    thousandSeparator: n,
    allowedDecimalSeparators: o
  };
}
function Ey(e, t) {
  e === void 0 && (e = "");
  var n = new RegExp("(-)"), o = new RegExp("(-)(.)*(-)"), r = n.test(e), s = o.test(e);
  return e = e.replace(/-/g, ""), r && !s && t && (e = "-" + e), e;
}
function Ry(e, t) {
  return new RegExp("(^-)|[0-9]|" + af(e), "g");
}
function Ny(e, t, n) {
  return e === "" ? !0 : !t?.match(/\d/) && !n?.match(/\d/) && typeof e == "string" && !isNaN(Number(e));
}
function Ty(e, t, n) {
  var o;
  t === void 0 && (t = by(e));
  var r = n.allowNegative, s = n.prefix;
  s === void 0 && (s = "");
  var a = n.suffix;
  a === void 0 && (a = "");
  var i = n.decimalScale, c = t.from, u = t.to, f = u.start, h = u.end, d = Ds(n), m = d.allowedDecimalSeparators, g = d.decimalSeparator, v = e[h] === g;
  if (Zo(e) && (e === s || e === a) && t.lastValue === "")
    return e;
  if (h - f === 1 && m.indexOf(e[f]) !== -1) {
    var w = i === 0 ? "" : g;
    e = e.substring(0, f) + w + e.substring(f + 1, e.length);
  }
  var x = function(z, M, A) {
    var _ = !1, H = !1;
    s.startsWith("-") ? _ = !1 : z.startsWith("--") ? (_ = !1, H = !0) : a.startsWith("-") && z.length === a.length ? _ = !1 : z[0] === "-" && (_ = !0);
    var W = _ ? 1 : 0;
    return H && (W = 2), W && (z = z.substring(W), M -= W, A -= W), { value: z, start: M, end: A, hasNegation: _ };
  }, E = x(e, f, h), C = E.hasNegation;
  o = E, e = o.value, f = o.start, h = o.end;
  var j = x(t.lastValue, c.start, c.end), R = j.start, T = j.end, S = j.value, b = e.substring(f, h);
  e.length && S.length && (R > S.length - a.length || T < s.length) && !(b && a.startsWith(b)) && (e = S);
  var P = 0;
  e.startsWith(s) ? P += s.length : f < s.length && (P = f), e = e.substring(P), h -= P;
  var L = e.length, $ = e.length - a.length;
  e.endsWith(a) ? L = $ : (h > $ || h > e.length - a.length) && (L = h), e = e.substring(0, L), e = Ey(C ? "-" + e : e, r), e = (e.match(Ry(g)) || []).join("");
  var F = e.indexOf(g);
  e = e.replace(new RegExp(af(g), "g"), function(z, M) {
    return M === F ? "." : "";
  });
  var B = Hi(e, r), I = B.beforeDecimal, O = B.afterDecimal, D = B.addNegation;
  return u.end - u.start < c.end - c.start && I === "" && v && !parseFloat(O) && (e = D ? "-" : ""), e;
}
function Py(e, t) {
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
function Ay(e) {
  var t = Ds(e), n = t.thousandSeparator, o = t.decimalSeparator, r = e.prefix;
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
function Iy(e) {
  e = Ay(e), e.decimalSeparator, e.allowedDecimalSeparators, e.thousandsGroupStyle;
  var t = e.suffix, n = e.allowNegative, o = e.allowLeadingZeros, r = e.onKeyDown;
  r === void 0 && (r = mn);
  var s = e.onBlur;
  s === void 0 && (s = mn);
  var a = e.thousandSeparator, i = e.decimalScale, c = e.fixedDecimalScale, u = e.prefix;
  u === void 0 && (u = "");
  var f = e.defaultValue, h = e.value, d = e.valueIsNumericString, m = e.onValueChange, g = rf(e, ["decimalSeparator", "allowedDecimalSeparators", "thousandsGroupStyle", "suffix", "allowNegative", "allowLeadingZeros", "onKeyDown", "onBlur", "thousandSeparator", "decimalScale", "fixedDecimalScale", "prefix", "defaultValue", "value", "valueIsNumericString", "onValueChange"]), v = Ds(e), w = v.decimalSeparator, x = v.allowedDecimalSeparators, E = function(D) {
    return hl(D, e);
  }, C = function(D, z) {
    return Ty(D, z, e);
  }, j = vn(h) ? f : h, R = d ?? Ny(j, u, t);
  vn(h) ? vn(f) || (R = R || typeof f == "number") : R = R || typeof h == "number";
  var T = function(D) {
    return sf(D) ? D : (typeof D == "number" && (D = lf(D)), R && typeof i == "number" ? fl(D, i, !!c) : D);
  }, S = df(T(h), T(f), !!R, E, C, m), b = S[0], P = b.numAsString, L = b.formattedValue, $ = S[1], F = function(D) {
    var z = D.target, M = D.key, A = z.selectionStart, _ = z.selectionEnd, H = z.value;
    if (H === void 0 && (H = ""), (M === "Backspace" || M === "Delete") && _ < u.length && H !== "-") {
      D.preventDefault();
      return;
    }
    if (A !== _) {
      r(D);
      return;
    }
    M === "Backspace" && H[0] === "-" && A === u.length + 1 && n && In(z, 1), i && c && (M === "Backspace" && H[A - 1] === w ? (In(z, A - 1), D.preventDefault()) : M === "Delete" && H[A] === w && D.preventDefault()), x?.includes(M) && H[A] === w && In(z, A + 1);
    var W = a === !0 ? "," : a;
    M === "Backspace" && H[A - 1] === W && In(z, A - 1), M === "Delete" && H[A] === W && In(z, A + 1), r(D);
  }, B = function(D) {
    var z = P;
    if (z.match(/\d/g) || (z = ""), o || (z = my(z)), c && i && (z = fl(z, i, c)), z !== P) {
      var M = hl(z, e);
      $({
        formattedValue: M,
        value: z,
        floatValue: parseFloat(z)
      }, {
        event: D,
        source: yo.event
      });
    }
    s(D);
  }, I = function(D) {
    return D === w ? !0 : Zo(D);
  }, O = function(D) {
    var z = D.currentValue, M = D.lastValue, A = D.formattedValue, _ = D.currentValueIndex, H = D.formattedValueIndex, W = z[_], Y = A[H], ae = uf(M, z), fe = ae.to, ie = function(te) {
      return C(te).indexOf(".") + u.length;
    };
    return h === 0 && c && i && z[fe.start] === w && ie(z) < _ && ie(A) > H ? !1 : _ >= fe.start && _ < fe.end && x && x.includes(W) && Y === w ? !0 : W === Y;
  };
  return Object.assign(Object.assign({}, g), {
    value: L,
    valueIsNumericString: !1,
    isValidInputCharacter: I,
    isCharacterSame: O,
    onValueChange: $,
    format: E,
    removeFormatting: C,
    getCaretBoundary: function(D) {
      return Py(D, e);
    },
    onKeyDown: F,
    onBlur: B
  });
}
function My(e) {
  var t = Iy(e);
  return hn.createElement(ky, Object.assign({}, t));
}
function ml(e, t) {
  return /\d/.test(e) || e === t;
}
function Dy(e, t, n, o) {
  let r = 0;
  for (let s = 0; s < t && s < e.length; s += 1) ml(e[s], o) && (r += 1);
  if (r === 0) return Math.min(t, n.length);
  for (let s = 0; s < n.length; s += 1) if (ml(n[s], o) && (r -= 1, r === 0))
    return s + 1;
  return n.length;
}
function Oy(e, t) {
  let n = 0;
  for (; t + n < e.length && /\d/.test(e[t + n]); ) n += 1;
  return n;
}
function Ly(e, { decimalSeparator: t, thousandSeparator: n, allowedDecimalSeparators: o, thousandsGroupStyle: r }) {
  const s = new Set([...o, t].filter((m) => m.length === 1)), a = e.split(""), i = a.reduce((m, g, v) => (s.has(g) && m.push(v), m), []);
  if (i.length === 0) return e;
  const c = i[i.length - 1], u = a[c], f = i.filter((m) => a[m] === u).length, h = r === "wan" ? 4 : 3;
  let d = -1;
  return f === 1 && (u === t ? d = c : u === n ? d = Oy(e, c + 1) === h ? -1 : c : d = c), a.map((m, g) => g === d ? t : s.has(m) && m !== n ? "" : m).join("");
}
function gl({ direction: e, style: t, ...n }) {
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
var Pa = {
  root: "m_e2f5cd4e",
  controls: "m_95e17d22",
  control: "m_80b4b171"
};
const $y = /^(0\.0*|-0(\.0*)?)$/, vl = /^-?0\d+(\.\d+)?\.?$/, zy = /\.\d*0$/, ff = /^-?\d+\.$/;
function Aa(e) {
  return typeof e == "string" && e !== "" && !Number.isNaN(Number(e));
}
function aa(e) {
  return typeof e == "bigint";
}
function ia(e) {
  return typeof e == "number" ? e < Number.MAX_SAFE_INTEGER : e === "" || Aa(e) && Number(e) < Number.MAX_SAFE_INTEGER;
}
function pf(e, t) {
  return e === "" || e === "-" || !t && e.startsWith("-") ? !1 : /^-?\d+$/.test(e);
}
function ca(e, t) {
  return typeof e == "bigint" ? !0 : e === "" || pf(e, t);
}
function _o(e) {
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
function Br(e, t, n) {
  return t !== void 0 && e < t ? t : n !== void 0 && e > n ? n : e;
}
function _y(e) {
  return e.toString().replace(".", "").length;
}
function Fy(e, t) {
  return (typeof e == "number" ? e < Number.MAX_SAFE_INTEGER : !Number.isNaN(Number(e))) && !Number.isNaN(e) && _y(t) < 14 && t !== "";
}
function By(e, t, n) {
  return e === void 0 ? !0 : (t === void 0 || e >= t) && (n === void 0 || e <= n);
}
const la = {
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
}, hf = ze((e, { size: t }) => ({ controls: { "--ni-chevron-size": _e(t, "ni-chevron-size") } }));
function yl(e, t) {
  return t ? `${e}.` : e;
}
function Vy(e, t) {
  const n = ff.test(e), o = t.trim ? e.replace(/^0+(?=\d)/, "") : e, r = parseFloat(o);
  if (Number.isNaN(r)) return o;
  if (!t.clamp) return t.trim ? yl(r, n) : e;
  const s = r > Number.MAX_SAFE_INTEGER && t.max !== void 0 ? t.max : wn(r, t.min, t.max);
  return !t.trim && s === r ? e : yl(s, n);
}
function Hy(e, t) {
  if (e === "" || e === "-") return e;
  const n = _o(e);
  return n === null ? e : t.clampBehavior === "blur" ? Br(n, t.min, t.max) : n;
}
const Qo = En((e) => {
  const t = Z([
    "Input",
    "InputWrapper",
    "NumberInput"
  ], la, e), { className: n, classNames: o, styles: r, unstyled: s, vars: a, onChange: i, onValueChange: c, value: u, defaultValue: f, max: h, min: d, step: m, hideControls: g, rightSection: v, isAllowed: w, clampBehavior: x, onBlur: E, allowDecimal: C, decimalScale: j, onKeyDown: R, onKeyDownCapture: T, handlersRef: S, startValue: b, disabled: P, rightSectionPointerEvents: L, allowNegative: $, readOnly: F, size: B, rightSectionWidth: I, stepHoldInterval: O, stepHoldDelay: D, allowLeadingZeros: z, withKeyboardEvents: M, trimLeadingZeroesOnBlur: A, allowedDecimalSeparators: _, selectAllOnFocus: H, onMinReached: W, onMaxReached: Y, onFocus: ae, attributes: fe, ref: ie, ...te } = t, he = $ ?? !0, q = z ?? !0, K = De({
    name: "NumberInput",
    classes: Pa,
    props: t,
    classNames: o,
    styles: r,
    unstyled: s,
    attributes: fe,
    vars: a,
    varsResolver: hf
  }), { resolvedClassNames: le, resolvedStyles: xe } = ur({
    classNames: o,
    styles: r,
    props: t
  }), pe = p.useRef(aa(u) || aa(f) ? "bigint" : "number");
  aa(u) ? pe.current = "bigint" : typeof u == "number" && (pe.current = "number");
  const je = pe.current === "bigint", [ne, U] = Qe({
    value: u,
    defaultValue: f,
    finalValue: "",
    onChange: i
  }), V = D !== void 0 && O !== void 0, X = p.useRef(null), ue = p.useRef(null), ke = p.useRef(0), Ie = typeof d == "number" ? d : void 0, me = typeof h == "number" ? h : void 0, ge = typeof m == "number" ? m : la.step, Se = typeof b == "number" ? b : la.startValue, Oe = Mr(d), de = Mr(h), vt = Mr(m) ?? BigInt(1), Te = Mr(b) ?? BigInt(0), yt = (G) => !pf(G, he) || q && vl.test(G) ? G : _o(G) ?? G, Wn = (G) => {
    const re = Number(G);
    return Number.isSafeInteger(re) ? re : void 0;
  }, It = (G, re) => {
    re.source === "event" && U(je ? yt(G.value) : Fy(G.floatValue, G.value) && !$y.test(G.value) && !(q && vl.test(G.value)) && !zy.test(G.value) && !ff.test(G.value) ? G.floatValue : G.value), c?.(G, re);
  }, un = (G) => {
    const re = String(G).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    return re ? Math.max(0, (re[1] ? re[1].length : 0) - (re[2] ? +re[2] : 0)) : 0;
  }, Mt = (G) => {
    X.current && typeof G < "u" && X.current.setSelectionRange(G, G);
  }, qn = p.useRef(Xr);
  qn.current = () => {
    if (je) {
      if (!ca(ne, he)) return;
      let qe;
      const Ke = ne;
      if (typeof Ke == "bigint") {
        const it = Ke + vt;
        de !== void 0 && it > de && Y?.(), qe = de !== void 0 && it > de ? de : it;
      } else if (typeof Ke == "string" && Ke !== "") {
        const it = _o(Ke);
        if (it === null) return;
        const fn = it + vt;
        de !== void 0 && fn > de && Y?.(), qe = de !== void 0 && fn > de ? de : fn;
      } else qe = Br(Te, Oe, de);
      const Ze = qe.toString();
      U(qe), c?.({
        floatValue: Wn(qe),
        formattedValue: Ze,
        value: Ze
      }, { source: "increment" }), setTimeout(() => Mt(X.current?.value.length), 0);
      return;
    }
    if (!ia(ne)) return;
    let G;
    const re = un(ne), Xn = un(ge), Yn = Math.max(re, Xn), bt = 10 ** Yn;
    if (!Aa(ne) && (typeof ne != "number" || Number.isNaN(ne))) G = wn(Se, Ie, me);
    else if (me !== void 0) {
      const qe = (Math.round(Number(ne) * bt) + Math.round(ge * bt)) / bt;
      qe > me && Y?.(), G = qe <= me ? qe : me;
    } else G = (Math.round(Number(ne) * bt) + Math.round(ge * bt)) / bt;
    const nt = G.toFixed(Yn);
    U(parseFloat(nt)), c?.({
      floatValue: parseFloat(nt),
      formattedValue: nt,
      value: nt
    }, { source: "increment" }), setTimeout(() => Mt(X.current?.value.length), 0);
  };
  const Kn = p.useRef(Xr);
  Kn.current = () => {
    if (je) {
      if (!ca(ne, he)) return;
      let Ke;
      const Ze = Oe !== void 0 ? Oe : he ? void 0 : BigInt(0), it = ne;
      if (typeof it == "bigint") {
        const Gn = it - vt;
        Ze !== void 0 && Gn < Ze && W?.(), Ke = Ze !== void 0 && Gn < Ze ? Ze : Gn;
      } else if (typeof it == "string" && it !== "") {
        const Gn = _o(it);
        if (Gn === null) return;
        const Ys = Gn - vt;
        Ze !== void 0 && Ys < Ze && W?.(), Ke = Ze !== void 0 && Ys < Ze ? Ze : Ys;
      } else Ke = Br(Te, Ze, de);
      const fn = Ke.toString();
      U(Ke), c?.({
        floatValue: Wn(Ke),
        formattedValue: fn,
        value: fn
      }, { source: "decrement" }), setTimeout(() => Mt(X.current?.value.length), 0);
      return;
    }
    if (!ia(ne)) return;
    let G;
    const re = Ie !== void 0 ? Ie : he ? Number.MIN_SAFE_INTEGER : 0, Xn = un(ne), Yn = un(ge), bt = Math.max(Xn, Yn), nt = 10 ** bt;
    if (!Aa(ne) && typeof ne != "number" || Number.isNaN(ne)) G = wn(Se, re, me);
    else {
      const Ke = (Math.round(Number(ne) * nt) - Math.round(ge * nt)) / nt;
      re !== void 0 && Ke < re && W?.(), G = re !== void 0 && Ke < re ? re : Ke;
    }
    const qe = G.toFixed(bt);
    U(parseFloat(qe)), c?.({
      floatValue: parseFloat(qe),
      formattedValue: qe,
      value: qe
    }, { source: "decrement" }), setTimeout(() => Mt(X.current?.value.length), 0);
  };
  const et = (G) => {
    const re = G.clipboardData.getData("text"), Xn = te.decimalSeparator || ".", Yn = te.thousandSeparator === !0 ? "," : te.thousandSeparator === !1 ? void 0 : te.thousandSeparator, bt = Ly(re, {
      decimalSeparator: Xn,
      thousandSeparator: Yn,
      allowedDecimalSeparators: _ || [".", ","],
      thousandsGroupStyle: te.thousandsGroupStyle
    });
    if (bt !== re) {
      G.preventDefault();
      const nt = X.current;
      if (nt) {
        const qe = nt.selectionStart ?? 0, Ke = nt.selectionEnd ?? 0, Ze = nt.value, it = Ze.substring(0, qe) + bt + Ze.substring(Ke);
        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set?.call(nt, it), nt.dispatchEvent(new Event("change", { bubbles: !0 }));
        const fn = qe + bt.length;
        setTimeout(() => Mt(Dy(it, fn, nt.value, Xn)), 0);
      }
    }
    te.onPaste?.(G);
  }, Ht = (G) => {
    R?.(G), !(F || !M) && (G.key === "ArrowUp" && (G.preventDefault(), qn.current?.()), G.key === "ArrowDown" && (G.preventDefault(), Kn.current?.()));
  }, Rr = (G) => {
    if (T?.(G), G.key === "Backspace") {
      const re = X.current;
      re && re.selectionStart === 0 && re.selectionStart === re.selectionEnd && (G.preventDefault(), window.setTimeout(() => Mt(0), 0));
    }
  }, Nr = (G) => {
    H && window.setTimeout(() => X.current?.select(), 0), ae?.(G);
  }, Xs = (G) => {
    let re = ne;
    je ? (x === "blur" && typeof re == "bigint" && (re = Br(re, Oe, de)), A && typeof re == "string" && (re = Hy(re, {
      min: Oe,
      max: de,
      clampBehavior: x
    }))) : typeof re == "number" ? x === "blur" && (re = wn(re, Ie, me)) : typeof re == "string" && (re = Vy(re, {
      min: Ie,
      max: me,
      trim: !!A && un(re) < 15,
      clamp: x === "blur"
    })), ne !== re && U(re), E?.(G);
  };
  au(S, {
    increment: qn.current,
    decrement: Kn.current
  });
  const Tr = (G) => {
    G ? qn.current?.() : Kn.current?.(), ke.current += 1;
  }, We = (G) => {
    if (Tr(G), V) {
      const re = typeof O == "number" ? O : O(ke.current);
      ue.current = window.setTimeout(() => We(G), re);
    }
  }, tt = (G, re) => {
    G.preventDefault(), X.current?.focus(), Tr(re), V && (ue.current = window.setTimeout(() => We(re), D));
  }, dn = () => {
    ue.current && window.clearTimeout(ue.current), ue.current = null, ke.current = 0;
  }, Tp = /* @__PURE__ */ l.jsxs("div", {
    ...K("controls"),
    children: [/* @__PURE__ */ l.jsx($n, {
      ...K("control"),
      tabIndex: -1,
      "aria-hidden": !0,
      disabled: P || typeof ne == "number" && me !== void 0 && ne >= me || typeof ne == "bigint" && de !== void 0 && ne >= de,
      mod: { direction: "up" },
      onMouseDown: (G) => G.preventDefault(),
      onPointerDown: (G) => {
        tt(G, !0);
      },
      onPointerUp: dn,
      onPointerLeave: dn,
      children: /* @__PURE__ */ l.jsx(gl, { direction: "up" })
    }), /* @__PURE__ */ l.jsx($n, {
      ...K("control"),
      tabIndex: -1,
      "aria-hidden": !0,
      disabled: P || typeof ne == "number" && Ie !== void 0 && ne <= Ie || typeof ne == "bigint" && Oe !== void 0 && ne <= Oe,
      mod: { direction: "down" },
      onMouseDown: (G) => G.preventDefault(),
      onPointerDown: (G) => {
        tt(G, !1);
      },
      onPointerUp: dn,
      onPointerLeave: dn,
      children: /* @__PURE__ */ l.jsx(gl, { direction: "down" })
    })]
  });
  return /* @__PURE__ */ l.jsx(St, {
    component: My,
    allowNegative: $,
    className: on(Pa.root, n),
    size: B,
    ...te,
    inputMode: je ? "numeric" : "decimal",
    readOnly: F,
    disabled: P,
    value: typeof ne == "bigint" ? ne.toString() : ne,
    getInputRef: Ve(ie, X),
    onValueChange: It,
    rightSection: g || F || !(je ? ca(ne, he) : ia(ne)) ? v : v || Tp,
    classNames: le,
    styles: xe,
    unstyled: s,
    __staticSelector: "NumberInput",
    decimalScale: je ? 0 : C ? j : 0,
    onPaste: et,
    onFocus: Nr,
    onKeyDown: Ht,
    onKeyDownCapture: Rr,
    rightSectionPointerEvents: L ?? (P ? "none" : void 0),
    rightSectionWidth: I ?? `var(--ni-right-section-width-${B || "sm"})`,
    allowLeadingZeros: z,
    allowedDecimalSeparators: _,
    onBlur: Xs,
    attributes: fe,
    isAllowed: (G) => {
      if (!(!w || w(G))) return !1;
      if (x !== "strict") return !0;
      if (!je) return By(G.floatValue, Ie, me);
      if (G.value === "" || G.value === "-") return !0;
      const re = _o(G.value);
      return re === null ? !0 : (Oe === void 0 || re >= Oe) && (de === void 0 || re <= de);
    }
  });
});
Qo.classes = {
  ...St.classes,
  ...Pa
};
Qo.varsResolver = hf;
Qo.displayName = "@mantine/core/NumberInput";
const Ui = p.createContext(null), Wi = En(((e) => {
  const { value: t, defaultValue: n, onChange: o, size: r, wrapperProps: s, children: a, name: i, readOnly: c, disabled: u, ...f } = Z("RadioGroup", null, e), h = Vt(i), [d, m] = Qe({
    value: t,
    defaultValue: n,
    finalValue: "",
    onChange: o
  }), g = (v) => !c && m(typeof v == "string" ? v : v.currentTarget.value);
  return /* @__PURE__ */ l.jsx(Ui, {
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
      children: /* @__PURE__ */ l.jsx(Td, {
        role: "radiogroup",
        children: a
      })
    })
  });
}));
Wi.classes = Rt.Wrapper.classes;
Wi.displayName = "@mantine/core/RadioGroup";
var mf = { card: "m_9dc8ae12" };
const gf = p.createContext(null), Uy = { withBorder: !0 }, vf = ze((e, { radius: t }) => ({ card: { "--card-radius": Tt(t) } })), Os = se((e) => {
  const t = Z("RadioCard", Uy, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, checked: c, mod: u, withBorder: f, value: h, onClick: d, name: m, onKeyDown: g, attributes: v, ...w } = t, x = De({
    name: "RadioCard",
    classes: mf,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: v,
    vars: i,
    varsResolver: vf,
    rootSelector: "card"
  }), { dir: E } = ko(), C = p.use(Ui), j = typeof c == "boolean" ? c : C?.value === h || !1, R = m || C?.name, T = (S) => {
    if (g?.(S), !!R && [
      "ArrowDown",
      "ArrowUp",
      "ArrowLeft",
      "ArrowRight"
    ].includes(S.nativeEvent.code)) {
      S.preventDefault();
      const b = Array.from(document.querySelectorAll(`[role="radio"][name="${R}"]`)), P = b.findIndex((F) => F === S.target), L = P + 1 >= b.length ? 0 : P + 1, $ = P - 1 < 0 ? b.length - 1 : P - 1;
      S.nativeEvent.code === "ArrowDown" && (b[L].focus(), b[L].click()), S.nativeEvent.code === "ArrowUp" && (b[$].focus(), b[$].click()), S.nativeEvent.code === "ArrowLeft" && (b[E === "ltr" ? $ : L].focus(), b[E === "ltr" ? $ : L].click()), S.nativeEvent.code === "ArrowRight" && (b[E === "ltr" ? L : $].focus(), b[E === "ltr" ? L : $].click());
    }
  };
  return /* @__PURE__ */ l.jsx(gf, {
    value: { checked: j },
    children: /* @__PURE__ */ l.jsx($n, {
      mod: [{
        "with-border": f,
        checked: j
      }, u],
      ...x("card"),
      ...w,
      role: "radio",
      "aria-checked": j,
      name: R,
      onClick: (S) => {
        d?.(S), C?.onChange(h || "");
      },
      onKeyDown: T
    })
  });
});
Os.displayName = "@mantine/core/RadioCard";
Os.classes = mf;
Os.varsResolver = vf;
var yf = {
  indicator: "m_717d7ff6",
  icon: "m_3e4da632",
  "indicator--outline": "m_2980836c"
};
const Wy = { icon: ef }, bf = ze((e, { radius: t, color: n, size: o, iconColor: r, variant: s, autoContrast: a }) => {
  const i = us({
    color: n || e.primaryColor,
    theme: e
  }), c = i.isThemeColor && i.shade === void 0 ? `var(--mantine-color-${i.color}-outline)` : i.color;
  return { indicator: {
    "--radio-size": _e(o, "radio-size"),
    "--radio-radius": t === void 0 ? void 0 : Tt(t),
    "--radio-color": s === "outline" ? c : at(n, e),
    "--radio-icon-size": typeof o == "number" ? `calc(${_e(o, "radio-size")} * 0.4)` : _e(o, "radio-icon-size"),
    "--radio-icon-color": r ? at(r, e) : fr(a, e) ? Co({
      color: n,
      theme: e,
      autoContrast: a
    }) : void 0
  } };
}), Ls = se((e) => {
  const t = Z("RadioIndicator", Wy, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, icon: c, radius: u, color: f, iconColor: h, autoContrast: d, checked: m, mod: g, variant: v, disabled: w, attributes: x, ...E } = t, C = De({
    name: "RadioIndicator",
    classes: yf,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: x,
    vars: i,
    varsResolver: bf,
    rootSelector: "indicator"
  }), j = p.use(gf), R = typeof m == "boolean" ? m : j?.checked || !1;
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
Ls.displayName = "@mantine/core/RadioIndicator";
Ls.classes = yf;
Ls.varsResolver = bf;
var wf = {
  root: "m_f3f1af94",
  inner: "m_89c4f5e4",
  icon: "m_f3ed6b2b",
  radio: "m_8a3dbb89",
  "radio--outline": "m_1bfe9d39"
};
const qy = {
  labelPosition: "right",
  withErrorStyles: !0
}, xf = ze((e, { size: t, radius: n, color: o, iconColor: r, variant: s, autoContrast: a }) => {
  const i = us({
    color: o || e.primaryColor,
    theme: e
  }), c = i.isThemeColor && i.shade === void 0 ? `var(--mantine-color-${i.color}-outline)` : i.color;
  return { root: {
    "--radio-size": _e(t, "radio-size"),
    "--radio-radius": n === void 0 ? void 0 : Tt(n),
    "--radio-color": s === "outline" ? c : at(o, e),
    "--radio-icon-color": r ? at(r, e) : fr(a, e) ? Co({
      color: o,
      theme: e,
      autoContrast: a
    }) : void 0,
    "--radio-icon-size": _e(t, "radio-icon-size")
  } };
}), kn = se((e) => {
  const t = Z("Radio", qy, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, id: c, size: u, label: f, labelPosition: h, description: d, error: m, radius: g, color: v, variant: w, disabled: x, wrapperProps: E, icon: C = ef, rootRef: j, iconColor: R, onChange: T, mod: S, attributes: b, withErrorStyles: P, checked: L, ...$ } = t, F = De({
    name: "Radio",
    classes: wf,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: b,
    vars: i,
    varsResolver: xf
  }), B = p.use(Ui), I = B?.size ?? u, O = t.size ? u : I, { styleProps: D, rest: z } = nu($), M = Vt(c), A = [
    d ? `${M}-description` : void 0,
    m && typeof m != "boolean" ? `${M}-error` : void 0,
    z["aria-describedby"]
  ].filter(Boolean).join(" ") || void 0, _ = B ? B.value === z.value : void 0, H = {
    checked: _ ?? L,
    name: z.name ?? B?.name,
    onChange: (W) => {
      B?.onChange(W), T?.(W);
    },
    disabled: B?.disabled ?? x
  };
  return /* @__PURE__ */ l.jsx($i, {
    ...F("root"),
    __staticSelector: "Radio",
    __stylesApiProps: t,
    id: M,
    size: O,
    labelPosition: h,
    label: f,
    description: d,
    error: m,
    disabled: H.disabled,
    classNames: n,
    styles: s,
    unstyled: a,
    "data-checked": (_ ?? L) || void 0,
    variant: w,
    ref: j,
    mod: S,
    attributes: b,
    ...D,
    ...E,
    children: /* @__PURE__ */ l.jsxs(Q, {
      ...F("inner"),
      mod: { "label-position": h },
      children: [/* @__PURE__ */ l.jsx(Q, {
        ...F("radio", {
          focusable: !0,
          variant: w
        }),
        ...z,
        ...H,
        component: "input",
        mod: {
          error: !!m,
          "with-error-styles": P
        },
        id: M,
        type: "radio",
        "aria-describedby": A
      }), /* @__PURE__ */ l.jsx(C, {
        ...F("icon"),
        "aria-hidden": !0
      })]
    })
  });
});
kn.classes = wf;
kn.varsResolver = xf;
kn.displayName = "@mantine/core/Radio";
kn.Group = Wi;
kn.Card = Os;
kn.Indicator = Ls;
var Sf = {
  root: "m_cf365364",
  indicator: "m_9e182ccd",
  label: "m_1738fcb2",
  input: "m_1714d588",
  control: "m_69686b9b",
  innerLabel: "m_78882f40"
};
const Ky = { withItemsBorders: !0 }, Cf = ze((e, { radius: t, color: n, transitionDuration: o, size: r, transitionTimingFunction: s }) => ({ root: {
  "--sc-radius": t === void 0 ? void 0 : Tt(t),
  "--sc-color": n ? at(n, e) : void 0,
  "--sc-shadow": n ? void 0 : "var(--mantine-shadow-xs)",
  "--sc-transition-duration": o === void 0 ? void 0 : `${o}ms`,
  "--sc-transition-timing-function": s,
  "--sc-padding": _e(r, "sc-padding"),
  "--sc-font-size": qr(r)
} })), vr = En((e) => {
  const t = Z("SegmentedControl", Ky, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, data: c, value: u, defaultValue: f, onChange: h, size: d, name: m, disabled: g, readOnly: v, fullWidth: w, orientation: x, radius: E, color: C, transitionDuration: j, transitionTimingFunction: R, variant: T, autoContrast: S, withItemsBorders: b, mod: P, attributes: L, ref: $, ...F } = t, B = De({
    name: "SegmentedControl",
    props: t,
    classes: Sf,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: L,
    vars: i,
    varsResolver: Cf
  }), I = lr(), O = c.map((K) => Nh(K) ? {
    label: `${K}`,
    value: K
  } : K), D = wh(), [z, M] = p.useState(kc()), [A, _] = p.useState(null), [H, W] = p.useState({}), Y = (K, le) => {
    K === null || H[le] === K || (H[le] = K, W({ ...H }));
  }, [ae, fe] = Qe({
    value: u,
    defaultValue: f,
    finalValue: Array.isArray(c) ? O.find((K) => !K.disabled)?.value ?? c[0]?.value ?? null : null,
    onChange: h
  }), ie = Vt(m), te = O.map((K) => `${K.value}`), he = O.map((K) => /* @__PURE__ */ p.createElement(Q, {
    ...B("control"),
    mod: {
      active: ae === K.value,
      orientation: x
    },
    key: `${K.value}`
  }, /* @__PURE__ */ p.createElement("input", {
    ...B("input"),
    disabled: g || K.disabled,
    type: "radio",
    name: ie,
    value: `${K.value}`,
    id: `${ie}-${K.value}`,
    checked: ae === K.value,
    onChange: () => !v && fe(K.value),
    "data-focus-ring": I.focusRing,
    key: `${K.value}-input`
  }), /* @__PURE__ */ p.createElement(Q, {
    component: "label",
    ...B("label"),
    mod: {
      active: ae === K.value && !(g || K.disabled),
      disabled: g || K.disabled,
      "read-only": v
    },
    htmlFor: `${ie}-${K.value}`,
    ref: (le) => Y(le, `${K.value}`),
    __vars: { "--sc-label-color": C !== void 0 ? Co({
      color: C,
      theme: I,
      autoContrast: S
    }) : void 0 },
    key: `${K.value}-label`
  }, /* @__PURE__ */ l.jsx("span", {
    ...B("innerLabel"),
    children: K.label
  })))), q = Ve($, _);
  return Tc(() => {
    M(kc());
  }, [c.length]), Tc(() => {
    W((K) => {
      const le = {};
      return te.forEach((xe) => {
        xe in K && (le[xe] = K[xe]);
      }), Object.keys(le).length === Object.keys(K).length ? K : le;
    });
  }, [te]), c.length === 0 ? null : /* @__PURE__ */ l.jsxs(Q, {
    ...B("root"),
    variant: T,
    size: d,
    ref: q,
    mod: [{
      "full-width": w,
      orientation: x,
      initialized: D,
      "with-items-borders": b
    }, P],
    ...F,
    role: "radiogroup",
    "data-disabled": g,
    children: [typeof ae < "u" && /* @__PURE__ */ l.jsx(xs, {
      target: H[`${ae}`],
      parent: A,
      component: "span",
      transitionDuration: "var(--sc-transition-duration)",
      ...B("indicator")
    }, z), he]
  });
});
vr.classes = Sf;
vr.varsResolver = Cf;
vr.displayName = "@mantine/core/SegmentedControl";
const Xy = {
  size: "sm",
  withCheckIcon: !0,
  allowDeselect: !0,
  checkIconPosition: "left",
  openOnFocus: !0
}, uo = En((e) => {
  const t = Z([
    "Input",
    "InputWrapper",
    "Select"
  ], Xy, e), { classNames: n, styles: o, unstyled: r, vars: s, dropdownOpened: a, defaultDropdownOpened: i, onDropdownClose: c, onDropdownOpen: u, onFocus: f, onBlur: h, onClick: d, onChange: m, data: g, value: v, defaultValue: w, selectFirstOptionOnChange: x, selectFirstOptionOnDropdownOpen: E, onOptionSubmit: C, comboboxProps: j, readOnly: R, disabled: T, filter: S, limit: b, withScrollArea: P, maxDropdownHeight: L, floatingHeight: $, size: F, searchable: B, rightSection: I, checkIconPosition: O, withCheckIcon: D, withAlignedLabels: z, nothingFoundMessage: M, name: A, form: _, searchValue: H, defaultSearchValue: W, onSearchChange: Y, allowDeselect: ae, error: fe, rightSectionPointerEvents: ie, id: te, clearable: he, clearSectionMode: q, clearButtonProps: K, hiddenInputProps: le, renderOption: xe, onClear: pe, autoComplete: je, scrollAreaProps: ne, __defaultRightSection: U, __clearSection: V, __clearable: X, chevronColor: ue, autoSelectOnBlur: ke, openOnFocus: Ie, attributes: me, ...ge } = t, Se = p.useMemo(() => wd(g), [g]), Oe = p.useRef({}), de = p.useMemo(() => xd(Se), [Se]), vt = Vt(te), [Te, yt, Wn] = Qe({
    value: v,
    defaultValue: w,
    finalValue: null,
    onChange: m
  }), It = Te != null ? `${Te}` in de ? de[`${Te}`] : Oe.current[`${Te}`] : void 0, un = gh(It), [Mt, qn, Kn] = Qe({
    value: H,
    defaultValue: W,
    finalValue: It ? It.label : "",
    onChange: Y
  }), et = Mi({
    opened: a,
    defaultOpened: i,
    onDropdownOpen: () => {
      u?.(), E ? et.selectFirstOption() : et.updateSelectedOptionIndex("active", { scrollIntoView: !0 });
    },
    onDropdownClose: () => {
      c?.(), setTimeout(et.resetSelectedOption, 0);
    }
  }), Ht = (We) => {
    qn(We), et.resetSelectedOption();
  }, { resolvedClassNames: Rr, resolvedStyles: Nr } = ur({
    props: t,
    styles: o,
    classNames: n
  });
  p.useEffect(() => {
    x && et.selectFirstOption();
  }, [x, Mt]), p.useEffect(() => {
    v === null && Ht(""), v != null && It && (un?.value !== It.value || un?.label !== It.label) && Ht(It.label);
  }, [v, It]), p.useEffect(() => {
    !Wn && !Kn && Ht(Te != null ? `${Te}` in de ? de[`${Te}`]?.label : Oe.current[`${Te}`]?.label || "" : "");
  }, [de, Te]), p.useEffect(() => {
    Te && `${Te}` in de && (Oe.current[`${Te}`] = de[`${Te}`]);
  }, [de, Te]);
  const Xs = /* @__PURE__ */ l.jsx(Ce.ClearButton, {
    ...K,
    onClear: () => {
      yt(null, null), Ht(""), pe?.();
    }
  }), Tr = he && Te != null && !T && !R;
  return /* @__PURE__ */ l.jsxs(l.Fragment, { children: [/* @__PURE__ */ l.jsxs(Ce, {
    store: et,
    __staticSelector: "Select",
    classNames: Rr,
    styles: Nr,
    unstyled: r,
    readOnly: R,
    size: F,
    attributes: me,
    floatingHeight: $,
    keepMounted: ke,
    onOptionSubmit: (We) => {
      C?.(We);
      const tt = ae && `${de[We].value}` == `${Te}` ? null : de[We], dn = tt ? tt.value : null;
      dn !== Te && yt(dn, tt), !Wn && Ht(dn != null && tt?.label || ""), et.closeDropdown();
    },
    ...j,
    children: [/* @__PURE__ */ l.jsx(Ce.Target, {
      targetType: B ? "input" : "button",
      autoComplete: je,
      withExpandedAttribute: !0,
      children: /* @__PURE__ */ l.jsx(St, {
        id: vt,
        __defaultRightSection: /* @__PURE__ */ l.jsx(Ce.Chevron, {
          size: F,
          error: fe,
          unstyled: r,
          color: ue
        }),
        __clearSection: Xs,
        __clearable: Tr,
        __clearSectionMode: q,
        rightSection: I,
        rightSectionPointerEvents: ie || "none",
        ...ge,
        size: F,
        __staticSelector: "Select",
        disabled: T,
        readOnly: R || !B,
        value: Mt,
        onChange: (We) => {
          if (_v(We)) {
            if (!R) {
              const tt = cy(de, We.currentTarget.value);
              tt && `${tt.value}` != `${Te}` && (yt(tt.value, tt), !Wn && Ht(tt.label));
            }
            return;
          }
          Ht(We.currentTarget.value), et.openDropdown(), x && et.selectFirstOption();
        },
        onFocus: (We) => {
          Ie && B && et.openDropdown(), f?.(We);
        },
        onBlur: (We) => {
          ke && et.clickSelectedOption(), et.closeDropdown();
          const tt = Te != null && (`${Te}` in de ? de[`${Te}`] : Oe.current[`${Te}`]);
          Ht(tt && tt.label || ""), h?.(We);
        },
        onClick: (We) => {
          B ? et.openDropdown() : et.toggleDropdown(), d?.(We);
        },
        classNames: Rr,
        styles: Nr,
        unstyled: r,
        pointer: !B,
        error: fe,
        attributes: me
      })
    }), /* @__PURE__ */ l.jsx(zv, {
      data: Se,
      hidden: R || T,
      filter: S,
      search: Mt,
      limit: b,
      hiddenWhenEmpty: !M,
      withScrollArea: P,
      maxDropdownHeight: L,
      filterOptions: !!B && It?.label !== Mt,
      value: Te,
      checkIconPosition: O,
      withCheckIcon: D,
      withAlignedLabels: z,
      nothingFoundMessage: M,
      unstyled: r,
      labelId: ge.label ? `${vt}-label` : void 0,
      "aria-label": ge.label ? void 0 : ge["aria-label"],
      renderOption: xe,
      scrollAreaProps: ne
    })]
  }), /* @__PURE__ */ l.jsx(Ce.HiddenInput, {
    value: Te,
    name: A,
    form: _,
    disabled: T,
    ...le
  })] });
});
uo.classes = {
  ...St.classes,
  ...Ce.classes
};
uo.displayName = "@mantine/core/Select";
const [Yy, Gy] = Gt("Table component was not found in the tree");
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
function Jy(e, t) {
  if (!t) return;
  const n = {};
  return t.columnBorder && e.withColumnBorders && (n["data-with-column-border"] = !0), t.rowBorder && e.withRowBorders && (n["data-with-row-border"] = !0), t.striped && e.striped && (n["data-striped"] = e.striped), t.highlightOnHover && e.highlightOnHover && (n["data-hover"] = !0), t.captionSide && e.captionSide && (n["data-side"] = e.captionSide), t.stickyHeader && e.stickyHeader && (n["data-sticky"] = !0), n;
}
function Vn(e, t) {
  const n = `Table${e.charAt(0).toUpperCase()}${e.slice(1)}`, o = se((r) => {
    const s = Z(n, {}, r), { classNames: a, className: i, style: c, styles: u, ...f } = s, h = Gy();
    return /* @__PURE__ */ l.jsx(Q, {
      component: e,
      ...Jy(h, t),
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
  return o.displayName = `@mantine/core/${n}`, o.classes = yr, o;
}
const Ia = Vn("th", { columnBorder: !0 }), jf = Vn("td", { columnBorder: !0 }), Vr = Vn("tr", {
  rowBorder: !0,
  striped: !0,
  highlightOnHover: !0
}), kf = Vn("thead", { stickyHeader: !0 }), Ef = Vn("tbody"), Rf = Vn("tfoot"), Nf = Vn("caption", { captionSide: !0 }), Zy = { type: "scrollarea" }, Tf = ze((e, { minWidth: t, maxHeight: n, type: o }) => ({ scrollContainer: {
  "--table-min-width": Ae(t),
  "--table-max-height": Ae(n),
  "--table-overflow": o === "native" ? "auto" : void 0
} })), $s = se((e) => {
  const t = Z("TableScrollContainer", Zy, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, children: c, minWidth: u, maxHeight: f, type: h, scrollAreaProps: d, attributes: m, ...g } = t, v = De({
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
    varsResolver: Tf,
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
$s.classes = yr;
$s.varsResolver = Tf;
$s.displayName = "@mantine/core/TableScrollContainer";
function qi({ data: e }) {
  return /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
    e.caption && /* @__PURE__ */ l.jsx(Nf, { children: e.caption }),
    e.head && /* @__PURE__ */ l.jsx(kf, { children: /* @__PURE__ */ l.jsx(Vr, { children: e.head.map((t, n) => /* @__PURE__ */ l.jsx(Ia, { children: t }, n)) }) }),
    e.body && /* @__PURE__ */ l.jsx(Ef, { children: e.body.map((t, n) => /* @__PURE__ */ l.jsx(Vr, { children: t.map((o, r) => /* @__PURE__ */ l.jsx(jf, { children: o }, r)) }, n)) }),
    e.foot && /* @__PURE__ */ l.jsx(Rf, { children: /* @__PURE__ */ l.jsx(Vr, { children: e.foot.map((t, n) => /* @__PURE__ */ l.jsx(Ia, { children: t }, n)) }) })
  ] });
}
qi.displayName = "@mantine/core/TableDataRenderer";
const Qy = {
  withRowBorders: !0,
  verticalSpacing: 7
}, Pf = ze((e, { layout: t, captionSide: n, horizontalSpacing: o, verticalSpacing: r, borderColor: s, stripedColor: a, highlightOnHoverColor: i, striped: c, highlightOnHover: u, stickyHeaderOffset: f, stickyHeader: h }) => ({ table: {
  "--table-layout": t,
  "--table-caption-side": n,
  "--table-horizontal-spacing": Ko(o),
  "--table-vertical-spacing": Ko(r),
  "--table-border-color": s ? at(s, e) : void 0,
  "--table-striped-color": c && a ? at(a, e) : void 0,
  "--table-highlight-on-hover-color": u && i ? at(i, e) : void 0,
  "--table-sticky-header-offset": h ? Ae(f) : void 0
} })), st = se((e) => {
  const t = Z("Table", Qy, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, horizontalSpacing: c, verticalSpacing: u, captionSide: f, stripedColor: h, highlightOnHoverColor: d, striped: m, highlightOnHover: g, withColumnBorders: v, withRowBorders: w, withTableBorder: x, borderColor: E, layout: C, data: j, children: R, stickyHeader: T, stickyHeaderOffset: S, mod: b, tabularNums: P, attributes: L, ...$ } = t, F = De({
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
    varsResolver: Pf,
    stable: !0
  }), B = m === !0 ? "odd" : m || void 0, I = f || "bottom", O = p.useMemo(() => ({
    getStyles: F,
    stickyHeader: T,
    striped: B,
    highlightOnHover: g,
    withColumnBorders: v,
    withRowBorders: w,
    captionSide: I
  }), [
    F,
    T,
    B,
    g,
    v,
    w,
    I
  ]);
  return /* @__PURE__ */ l.jsx(Yy, {
    value: O,
    children: /* @__PURE__ */ l.jsx(Q, {
      component: "table",
      mod: [{
        withTableBorder: x,
        tabularNums: P
      }, b],
      ...F("table"),
      ...$,
      children: R || !!j && /* @__PURE__ */ l.jsx(qi, { data: j })
    })
  });
});
st.classes = yr;
st.varsResolver = Pf;
st.displayName = "@mantine/core/Table";
st.Td = jf;
st.Th = Ia;
st.Tr = Vr;
st.Thead = kf;
st.Tbody = Ef;
st.Tfoot = Rf;
st.Caption = Nf;
st.ScrollContainer = $s;
st.DataRenderer = qi;
const [eb, Ki] = Gt("Tabs component was not found in the tree");
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
const Xi = se((e) => {
  const t = Z("TabsList", null, e), { children: n, className: o, grow: r, justify: s, classNames: a, styles: i, style: c, mod: u, ...f } = t, h = Ki();
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
Xi.classes = br;
Xi.displayName = "@mantine/core/TabsList";
const Yi = se((e) => {
  const t = Z("TabsPanel", null, e), { children: n, className: o, value: r, classNames: s, styles: a, style: i, mod: c, keepMounted: u, ...f } = t, h = Ja(), d = Ki();
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
Yi.classes = br;
Yi.displayName = "@mantine/core/TabsPanel";
const Gi = se((e) => {
  const t = Z("TabsTab", null, e), { className: n, children: o, rightSection: r, leftSection: s, value: a, onClick: i, onKeyDown: c, disabled: u, color: f, style: h, classNames: d, styles: m, vars: g, mod: v, tabIndex: w, ...x } = t, E = lr(), { dir: C } = ko(), j = Ki(), R = a === j.value, T = (b) => {
    j.onChange(j.allowTabDeactivation && a === j.value ? null : a), i?.(b);
  }, S = {
    classNames: d,
    styles: m,
    props: t
  };
  return /* @__PURE__ */ l.jsxs($n, {
    ...j.getStyles("tab", {
      className: n,
      style: h,
      variant: j.variant,
      ...S
    }),
    disabled: u,
    unstyled: j.unstyled,
    variant: j.variant,
    mod: [{
      active: R,
      disabled: u,
      orientation: j.orientation,
      inverted: j.inverted,
      placement: j.orientation === "vertical" && j.placement
    }, v],
    role: "tab",
    id: j.getTabId(a),
    "aria-selected": R,
    tabIndex: w !== void 0 ? w : R || j.value === null ? 0 : -1,
    "aria-controls": j.mountedPanels.current.has(a) ? j.getPanelId(a) : void 0,
    onClick: T,
    __vars: { "--tabs-color": f ? at(f, E) : void 0 },
    onKeyDown: lu({
      siblingSelector: '[role="tab"]',
      parentSelector: '[role="tablist"]',
      activateOnFocus: j.activateTabWithKeyboard,
      loop: j.loop,
      orientation: j.orientation || "horizontal",
      dir: C,
      onKeyDown: c
    }),
    ...x,
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
Gi.classes = br;
Gi.displayName = "@mantine/core/TabsTab";
const bl = "Tabs.Tab or Tabs.Panel component was rendered with invalid value or without value", tb = {
  keepMounted: !0,
  keepMountedMode: "activity",
  orientation: "horizontal",
  loop: !0,
  activateTabWithKeyboard: !0,
  variant: "default",
  placement: "left"
}, Af = ze((e, { radius: t, color: n, autoContrast: o }) => ({ root: {
  "--tabs-radius": Tt(t),
  "--tabs-color": at(n, e),
  "--tabs-text-color": fr(o, e) ? Co({
    color: n,
    theme: e,
    autoContrast: o
  }) : void 0
} })), ht = se((e) => {
  const t = Z("Tabs", tb, e), { defaultValue: n, value: o, onChange: r, orientation: s, children: a, loop: i, id: c, activateTabWithKeyboard: u, allowTabDeactivation: f, variant: h, color: d, radius: m, inverted: g, placement: v, keepMounted: w, keepMountedMode: x, classNames: E, styles: C, unstyled: j, className: R, style: T, vars: S, autoContrast: b, mod: P, attributes: L, ...$ } = t, F = Vt(c), B = p.useRef(/* @__PURE__ */ new Set()), I = dh(), O = p.useCallback((A, _) => {
    const H = B.current;
    _ && !H.has(A) ? (H.add(A), I()) : !_ && H.has(A) && (H.delete(A), I());
  }, []), [D, z] = Qe({
    value: o,
    defaultValue: n,
    finalValue: null,
    onChange: r
  }), M = De({
    name: "Tabs",
    props: t,
    classes: br,
    className: R,
    style: T,
    classNames: E,
    styles: C,
    unstyled: j,
    attributes: L,
    vars: S,
    varsResolver: Af
  });
  return /* @__PURE__ */ l.jsx(eb, {
    value: {
      placement: v,
      value: D,
      orientation: s,
      id: F,
      loop: i,
      activateTabWithKeyboard: u,
      getTabId: Kr(`${F}-tab`, bl),
      getPanelId: Kr(`${F}-panel`, bl),
      onChange: z,
      allowTabDeactivation: f,
      variant: h,
      color: d,
      radius: m,
      inverted: g,
      keepMounted: w,
      keepMountedMode: x,
      unstyled: j,
      getStyles: M,
      mountedPanels: B,
      setMountedPanel: O
    },
    children: /* @__PURE__ */ l.jsx(Q, {
      id: F,
      variant: h,
      mod: [{
        orientation: s,
        inverted: s === "horizontal" && g,
        placement: s === "vertical" && v
      }, P],
      ...M("root"),
      ...$,
      children: a
    })
  });
});
ht.classes = br;
ht.varsResolver = Af;
ht.displayName = "@mantine/core/Tabs";
ht.Tab = Gi;
ht.Panel = Yi;
ht.List = Xi;
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
function er(e, t) {
  for (const n of t) {
    if (n.value === e) return n;
    if (Array.isArray(n.children)) {
      const o = er(e, n.children);
      if (o) return o;
    }
  }
  return null;
}
function Qr(e, t, n = []) {
  const o = er(e, t);
  return o ? !Array.isArray(o.children) || o.children.length === 0 ? [o.value] : (o.children.forEach((r) => {
    Array.isArray(r.children) && r.children.length > 0 ? Qr(r.value, t, n) : n.push(r.value);
  }), n) : n;
}
function If(e) {
  return e.reduce((t, n) => (Array.isArray(n.children) && n.children.length > 0 ? t.push(...If(n.children)) : t.push(n.value), t), []);
}
function zs(e, t, n = []) {
  const o = [];
  for (const r of e) if (Array.isArray(r.children) && r.children.length > 0) {
    const s = zs(r.children, t, n);
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
function nb(e, t, n) {
  return n.length === 0 ? !1 : n.includes(e) ? !0 : zs(t, n).result.some((o) => o.value === e && o.checked);
}
const ob = yu(nb);
function rb(e, t, n) {
  return n.length === 0 ? !1 : zs(t, n).result.some((o) => o.value === e && o.indeterminate);
}
const sb = yu(rb);
function Mf(e, t, n, o = {}) {
  return t.forEach((r) => {
    o[r.value] = r.value in e ? e[r.value] : r.value === n, Array.isArray(r.children) && Mf(e, r.children, n, o);
  }), o;
}
function ab(e, t, n) {
  if (n) return e;
  const o = [];
  return e.forEach((r) => o.push(...Qr(r, t))), Array.from(new Set(o));
}
function Df(e) {
  const t = [];
  for (const n of e)
    t.push(n.value), Array.isArray(n.children) && n.children.length > 0 && t.push(...Df(n.children));
  return t;
}
function Of({ initialSelectedState: e = [], expandedState: t, initialCheckedState: n = [], checkedState: o, initialExpandedState: r = {}, selectedState: s, multiple: a = !1, onNodeCollapse: i, onNodeExpand: c, onCheckedStateChange: u, onSelectedStateChange: f, onExpandedStateChange: h, onLoadChildren: d, checkStrictly: m = !1 } = {}) {
  const [g, v] = p.useState([]), [w, x] = Qe({
    value: t,
    defaultValue: r,
    finalValue: {},
    onChange: h
  }), [E, C] = Qe({
    value: s,
    defaultValue: e,
    finalValue: [],
    onChange: f
  }), [j, R] = Qe({
    value: o,
    defaultValue: n,
    finalValue: [],
    onChange: u
  }), [T, S] = p.useState(null), b = p.useRef(/* @__PURE__ */ new Set()), P = p.useRef(/* @__PURE__ */ new Set()), [L, $] = p.useState([]), [F, B] = p.useState({}), I = p.useCallback((U) => {
    x(Mf(w, U, E)), R(ab(j, U, m)), v(U);
  }, [
    E,
    j,
    w,
    m
  ]), O = p.useCallback(async (U) => {
    if (d && !(b.current.has(U) || P.current.has(U))) {
      b.current.add(U), $(Array.from(b.current)), B((V) => {
        if (!(U in V)) return V;
        const X = { ...V };
        return delete X[U], X;
      });
      try {
        await d(U), P.current.add(U);
      } catch (V) {
        const X = V instanceof Error ? V : new Error(String(V));
        B((ue) => ({
          ...ue,
          [U]: X
        }));
      } finally {
        b.current.delete(U), $(Array.from(b.current));
      }
    }
  }, [d]), D = p.useCallback((U) => {
    if (!d) return;
    const V = er(U, g);
    V && V.hasChildren && !Array.isArray(V.children) && O(U);
  }, [
    d,
    g,
    O
  ]), z = p.useCallback((U) => {
    const V = {
      ...w,
      [U]: !w[U]
    };
    V[U] ? c?.(U) : i?.(U), V[U] && D(U), x(V);
  }, [
    i,
    c,
    w,
    D
  ]), M = p.useCallback((U) => {
    w[U] !== !1 && i?.(U), x({
      ...w,
      [U]: !1
    });
  }, [i, w]), A = p.useCallback((U) => {
    w[U] !== !0 && c?.(U), D(U), x({
      ...w,
      [U]: !0
    });
  }, [
    c,
    w,
    D
  ]), _ = p.useCallback(() => {
    const U = { ...w };
    Object.keys(U).forEach((V) => {
      U[V] = !0, D(V);
    }), x(U);
  }, [w, D]), H = p.useCallback(() => {
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
    T === U && S(null), C(E.filter((V) => V !== U));
  }, [E]), fe = p.useCallback(() => {
    C([]), S(null);
  }, []), ie = p.useCallback((U) => {
    if (m)
      j.includes(U) || R([...j, U]);
    else {
      const V = Qr(U, g);
      R(Array.from(/* @__PURE__ */ new Set([...j, ...V])));
    }
  }, [
    g,
    j,
    m
  ]), te = p.useCallback((U) => {
    if (m) R(j.filter((V) => V !== U));
    else {
      const V = Qr(U, g);
      R(j.filter((X) => !V.includes(X)));
    }
  }, [
    g,
    j,
    m
  ]), he = p.useCallback(() => {
    R(m ? Df(g) : If(g));
  }, [g, m]), q = p.useCallback(() => {
    R([]);
  }, []), K = p.useCallback(() => m ? j.map((U) => {
    const V = er(U, g);
    return {
      checked: !0,
      indeterminate: !1,
      value: U,
      hasChildren: V ? Array.isArray(V.children) && V.children.length > 0 || !!V.hasChildren : !1
    };
  }) : zs(g, j).result, [
    m,
    j,
    g
  ]), le = p.useCallback((U) => m ? j.includes(U) : ob(U, g, j), [
    m,
    j,
    g
  ]), xe = p.useCallback((U) => m ? !1 : sb(U, g, j), [
    m,
    j,
    g
  ]), pe = p.useCallback((U) => L.includes(U), [L]), je = p.useCallback((U) => F[U] || null, [F]), ne = p.useCallback((U) => {
    P.current.delete(U), B((V) => {
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
    checkedState: j,
    anchorNode: T,
    initialize: I,
    toggleExpanded: z,
    collapse: M,
    expand: A,
    expandAllNodes: _,
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
    isNodeChecked: le,
    isNodeIndeterminate: xe,
    isNodeLoading: pe,
    getNodeLoadError: je,
    loadNode: O,
    invalidateNode: ne
  }), [
    m,
    a,
    w,
    E,
    j,
    T,
    I,
    z,
    M,
    A,
    _,
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
    le,
    xe,
    pe,
    je,
    O,
    ne
  ]);
}
function ib(e, t, n) {
  const o = er(t, e);
  if (!o || !o.children) return !1;
  function r(s) {
    for (const a of s)
      if (a.value === n || a.children && r(a.children)) return !0;
    return !1;
  }
  return r(o.children);
}
function cb(e, t, n, o) {
  const r = t.getBoundingClientRect(), s = e.clientY - r.top, a = r.height;
  return n ? o ? s < a * 0.5 ? "before" : "inside" : s < a * 0.25 ? "before" : s > a * 0.75 ? "after" : "inside" : s < a * 0.5 ? "before" : "after";
}
const lb = {
  elementProps: {},
  dragHandleProps: void 0
};
function ub({ nodeValue: e, hasChildren: t, isExpanded: n, data: o, onDragDrop: r, dragStateRef: s, allowDrop: a, withDragHandle: i }) {
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
        if (!w || w === e || ib(o, w, e)) return;
        const x = v.currentTarget, E = cb(v, x, t, n);
        if (a && !a({
          draggedNode: w,
          targetNode: e,
          position: E
        })) {
          const j = s.current.currentDropTarget;
          j && j !== x && j.removeAttribute("data-drag-over"), x.removeAttribute("data-drag-over"), s.current.currentDropTarget = null;
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
  } : lb;
}
function wl(e, t, n) {
  if (!e || !t) return [];
  const o = n.indexOf(e), r = n.indexOf(t), s = Math.min(o, r), a = Math.max(o, r);
  return n.slice(s, a + 1);
}
function db(e, t) {
  for (let n = e; n && n !== t; ) {
    if (n.style.display === "none") return !1;
    n = n.parentElement;
  }
  return !0;
}
function Ji({ node: e, getStyles: t, rootIndex: n, controller: o, expandOnClick: r, selectOnClick: s, isSubtree: a, level: i = 1, renderNode: c, flatValues: u, allowRangeSelection: f, expandOnSpace: h, checkOnSpace: d, keepMounted: m, onDragDrop: g, allowDrop: v, withDragHandle: w, dragStateRef: x, data: E }) {
  const C = p.useRef(null), j = Array.isArray(e.children) && e.children.length > 0, R = !!e.hasChildren && !j, T = j || R, S = o.isNodeLoading(e.value), b = o.getNodeLoadError(e.value), P = o.expandedState[e.value] || !1, L = (e.children || []).map((M) => /* @__PURE__ */ l.jsx(Ji, {
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
    expandOnSpace: h,
    checkOnSpace: d,
    keepMounted: m,
    onDragDrop: g,
    allowDrop: v,
    withDragHandle: w,
    dragStateRef: x,
    data: E
  }, M.value)), { elementProps: $, dragHandleProps: F } = ub({
    nodeValue: e.value,
    hasChildren: T,
    isExpanded: P,
    data: E,
    onDragDrop: g,
    dragStateRef: x,
    allowDrop: v,
    withDragHandle: w
  }), B = (M) => {
    if (M.nativeEvent.code === "ArrowRight")
      if (M.stopPropagation(), M.preventDefault(), P) {
        const A = M.currentTarget.querySelector("[role=treeitem]");
        A?.setAttribute("data-focus-ring", "true"), A?.focus();
      } else o.expand(e.value);
    if (M.nativeEvent.code === "ArrowLeft") {
      if (M.stopPropagation(), M.preventDefault(), P && T) o.collapse(e.value);
      else if (a) {
        const A = Xo(M.currentTarget, "[role=treeitem]");
        A?.setAttribute("data-focus-ring", "true"), A?.focus();
      }
    }
    if (M.nativeEvent.code === "ArrowDown" || M.nativeEvent.code === "ArrowUp") {
      const A = Xo(M.currentTarget, "[data-tree-root]");
      if (!A) return;
      M.stopPropagation(), M.preventDefault();
      const _ = Array.from(A.querySelectorAll("[role=treeitem]")).filter((ae) => db(ae, A)), H = _.indexOf(M.currentTarget);
      if (H === -1) return;
      const W = M.nativeEvent.code === "ArrowDown" ? H + 1 : H - 1, Y = _[W];
      if (Y?.setAttribute("data-focus-ring", "true"), Y?.focus(), M.shiftKey) {
        const ae = _[W];
        ae && o.setSelectedState(wl(o.anchorNode, ae.dataset.value, u));
      }
    }
    M.nativeEvent.code === "Space" && (h && (M.stopPropagation(), M.preventDefault(), o.toggleExpanded(e.value)), d && (M.stopPropagation(), M.preventDefault(), o.isNodeChecked(e.value) ? o.uncheckNode(e.value) : o.checkNode(e.value)));
  }, I = (M) => {
    M.stopPropagation(), f && M.shiftKey && o.anchorNode ? (o.setSelectedState(wl(o.anchorNode, e.value, u)), C.current?.focus()) : (r && o.toggleExpanded(e.value), s && o.select(e.value), C.current?.focus());
  }, O = o.selectedState.includes(e.value), D = {
    ...t("label"),
    onClick: I,
    "data-selected": O || void 0,
    "data-value": e.value,
    ...$
  }, z = P && S && L.length === 0;
  return /* @__PURE__ */ l.jsxs("li", {
    ...t("node", { style: { "--label-offset": `calc(var(--level-offset) * ${i - 1})` } }),
    role: "treeitem",
    "aria-selected": O,
    "data-value": e.value,
    "data-selected": O || void 0,
    "data-level": i,
    tabIndex: n === 0 ? 0 : -1,
    onKeyDown: B,
    onBlur: (M) => {
      M.currentTarget.contains(M.relatedTarget) || M.currentTarget.removeAttribute("data-focus-ring");
    },
    ref: C,
    children: [
      typeof c == "function" ? c({
        node: e,
        level: i,
        selected: O,
        isRoot: i === 1,
        tree: o,
        expanded: P,
        hasChildren: T,
        isLoading: S,
        loadError: b,
        elementProps: D,
        dragHandleProps: F
      }) : /* @__PURE__ */ l.jsx("div", {
        ...D,
        children: e.label
      }),
      z && /* @__PURE__ */ l.jsx(Q, {
        component: "ul",
        role: "group",
        ...t("subtree"),
        "data-level": i,
        children: /* @__PURE__ */ l.jsx("li", {
          ...t("node", { style: { "--label-offset": `calc(var(--level-offset) * ${i})` } }),
          children: /* @__PURE__ */ l.jsx("div", {
            ...t("label"),
            children: /* @__PURE__ */ l.jsx(Fp, {
              size: 16,
              style: { marginInlineStart: 4 }
            })
          })
        })
      }),
      m && L.length > 0 ? /* @__PURE__ */ l.jsx(p.Activity, {
        mode: P ? "visible" : "hidden",
        children: /* @__PURE__ */ l.jsx(Q, {
          component: "ul",
          role: "group",
          ...t("subtree"),
          "data-level": i,
          children: L
        })
      }) : P && L.length > 0 && /* @__PURE__ */ l.jsx(Q, {
        component: "ul",
        role: "group",
        ...t("subtree"),
        "data-level": i,
        children: L
      })
    ]
  });
}
Ji.displayName = "@mantine/core/TreeNode";
var Lf = {
  root: "m_f698e191",
  subtree: "m_75f3ecf",
  node: "m_f6970eb1",
  label: "m_dc283425",
  flatLine: "m_c03b303c",
  flatLineClosing: "m_bf7448d9"
};
function $f(e) {
  return e.reduce((t, n) => (t.push(n.value), n.children && t.push(...$f(n.children)), t), []);
}
const fb = {
  expandOnClick: !0,
  allowRangeSelection: !0,
  expandOnSpace: !0
}, zf = ze((e, { levelOffset: t }) => ({ root: { "--level-offset": Ko(t) } })), _s = se((e) => {
  const t = Z("Tree", fb, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, data: c, expandOnClick: u, tree: f, renderNode: h, selectOnClick: d, clearSelectionOnOutsideClick: m, allowRangeSelection: g, expandOnSpace: v, levelOffset: w, checkOnSpace: x, keepMounted: E, onDragDrop: C, allowDrop: j, withDragHandle: R, withLines: T, attributes: S, ref: b, ...P } = t, L = Of(), $ = f || L, F = p.useRef({
    draggedValue: null,
    currentDropTarget: null
  }), B = De({
    name: "Tree",
    classes: Lf,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: S,
    vars: i,
    varsResolver: zf
  }), I = uu(() => m && $.clearSelected()), O = Ve(b, I), D = p.useMemo(() => $f(c), [c]);
  p.useEffect(() => {
    $.initialize(c);
  }, [c]);
  const z = c.map((M, A) => /* @__PURE__ */ l.jsx(Ji, {
    node: M,
    getStyles: B,
    rootIndex: A,
    expandOnClick: u,
    selectOnClick: d,
    controller: $,
    renderNode: h,
    flatValues: D,
    allowRangeSelection: g,
    expandOnSpace: v,
    checkOnSpace: x,
    keepMounted: E,
    onDragDrop: C,
    allowDrop: j,
    withDragHandle: R,
    dragStateRef: F,
    data: c
  }, M.value));
  return /* @__PURE__ */ l.jsx(Q, {
    component: "ul",
    ref: O,
    ...B("root"),
    ...P,
    role: "tree",
    "aria-multiselectable": $.multiple,
    "data-tree-root": !0,
    "data-with-lines": T || void 0,
    children: z
  });
});
_s.displayName = "@mantine/core/Tree";
_s.classes = Lf;
_s.varsResolver = zf;
function Fs() {
  window.location.pathname !== "/login.html" && window.location.replace("/login.html");
}
function Le(e) {
  return e.layers ?? [];
}
function $e(e) {
  return e.version ?? 0;
}
class Ye extends Error {
  code;
  details;
  constructor(t, n, o) {
    super(n), this.name = "ApiError", this.code = t, this.details = o;
  }
}
async function Ee(e, t) {
  const n = await fetch(e, t);
  if (n.status === 401)
    throw Fs(), new Ye("unauthorized", "this server needs an access token", null);
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
async function _f(e = "", t = 200) {
  const n = new URLSearchParams({ limit: String(t) });
  return e && n.set("query", e), (await Ee(
    `/api/projects?${n.toString()}`
  )).projects;
}
async function pb(e = 8) {
  return (await Ee(
    `/api/projects/recent?limit=${e}`
  )).projects;
}
async function hb(e) {
  return Ee(`/api/projects/${encodeURIComponent(e)}`);
}
function Ff(e) {
  return `/api/projects/${encodeURIComponent(e)}/thumbnail.png`;
}
async function mb(e, t, n, o, r) {
  return Ee("/api/projects", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: e, width: t, height: n, background: o, name: r })
  });
}
async function gb(e, t) {
  return Ee(
    `/api/projects/${encodeURIComponent(e)}/rename`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: t })
    }
  );
}
async function vb(e) {
  return Ee(`/api/projects/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
async function Ao(e) {
  return Ee(`/api/projects/${encodeURIComponent(e)}/document`);
}
async function yb(e, t) {
  return (await Ee(
    `/api/projects/${encodeURIComponent(e)}/recover-lock`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ expectedPid: t })
    }
  )).unlocked;
}
async function Bs(e, t, n) {
  const o = await fetch(e, { ...t, method: t?.method ?? "GET" });
  if (o.status === 404 || o.status === 405) return n;
  if (o.status === 401)
    throw Fs(), new Ye("unauthorized", "this server needs an access token", null);
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
async function bb() {
  return Bs("/api/open-tabs", void 0, { projects: [], active: null });
}
async function wb(e) {
  await Bs("/api/open-tabs", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(e)
  }, null);
}
async function Bf(e) {
  return (await Bs(
    `/api/projects/${encodeURIComponent(e)}/close`,
    { method: "POST", headers: { "content-type": "application/json" }, body: "{}" },
    { closed: !1 }
  )).closed;
}
async function xb(e, t = 100) {
  const n = new URLSearchParams({ tail: String(t) });
  return Ee(`/api/projects/${encodeURIComponent(e)}/history?${n.toString()}`);
}
async function Hn(e, t, n, o = !1) {
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
async function Sb(e, t, n, o) {
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
async function Cb(e) {
  return Ee(`/api/projects/${encodeURIComponent(e)}/undo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ actor: { kind: "human", name: "reference UI" } })
  });
}
async function jb(e) {
  return Ee(`/api/projects/${encodeURIComponent(e)}/redo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ actor: { kind: "human", name: "reference UI" } })
  });
}
async function kb(e, t, n) {
  return Ee(`/api/projects/${encodeURIComponent(e)}/export`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: t, scale: n })
  });
}
async function Eb() {
  const e = await Bs("/api/page-sets", void 0, { pageSets: [] });
  return Array.isArray(e.pageSets) ? e.pageSets.filter((t) => typeof t == "string") : [];
}
async function Rb(e) {
  return Ee(`/api/page-sets/${encodeURIComponent(e)}`);
}
async function Nb() {
  await Ee("/api/shutdown", { method: "POST" });
}
async function Tb() {
  return Ee("/api/version");
}
async function Pb() {
  return Ee("/api/agent-access");
}
async function Ab() {
  return Ee("/api/agent-sessions");
}
async function Ib() {
  return Ee("/api/update-status");
}
async function Mb(e) {
  return Ee("/api/update-consent", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ updateCheck: e })
  });
}
async function Zi(e, t) {
  const n = await fetch(
    `/api/projects/${encodeURIComponent(e)}/assets?filename=${encodeURIComponent(t.name)}`,
    {
      method: "POST",
      headers: { "content-type": t.type || "application/octet-stream" },
      body: t
    }
  );
  if (n.status === 401)
    throw Fs(), new Ye("unauthorized", "this server needs an access token", null);
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
const Db = ["fill", "contain", "cover"], xl = 8;
function Vf(e) {
  if (e.type !== "shape") return null;
  const t = e.shape;
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = t.kind;
    if (typeof n == "string") return n;
  }
  return null;
}
function Ob(e) {
  if (e.type !== "shape") return 0;
  const t = e.shape;
  if (t && typeof t == "object") {
    const n = t.cornerRadius;
    if (typeof n == "number") return n;
  }
  return 0;
}
const Lb = [
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
], Sl = [
  "brightness",
  "contrast",
  "saturation",
  "blur",
  "grain",
  "dropShadow",
  "hueRotate",
  "invert"
];
function $b(e) {
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
function zb(e) {
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
async function _b(e) {
  return (await Ee(
    `/api/projects/${encodeURIComponent(e)}/presets`
  )).presets;
}
function Fb(e) {
  const t = {
    opacity: e.opacity ?? 1,
    blendMode: e.blendMode ?? "normal",
    effects: e.effects ?? []
  };
  return e.type === "text" && (t.fontFamily = e.fontFamily, t.fontSize = e.fontSize, t.color = e.color ?? "#000000", t.align = e.align ?? "left", t.lineHeight = e.lineHeight ?? 1.2, t.paragraphSpacing = e.paragraphSpacing ?? 0), e.type === "shape" && (e.fill && (t.fill = e.fill), e.stroke && (t.stroke = e.stroke)), t;
}
async function Bb(e) {
  return Ee(`/api/projects/${encodeURIComponent(e)}/slots`);
}
async function Vb(e, t, n = 1) {
  return Ee(
    `/api/projects/${encodeURIComponent(e)}/variants`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ variants: t, scale: n })
    }
  );
}
function Hf(e, t) {
  return `/api/projects/${encodeURIComponent(e)}/exports/${encodeURIComponent(t)}.png`;
}
async function Hb() {
  return (await Ee("/api/fonts")).families;
}
function Ma(e, t = "Aa Bb 0123") {
  return `/api/fonts/specimen.png?${new URLSearchParams({
    family: e.family,
    weight: String(e.weight),
    style: e.style,
    hash: e.hash,
    sample: t
  }).toString()}`;
}
async function Ub() {
  return (await Ee(
    "/catalogue-specimens/manifest.json"
  )).families;
}
async function Wb() {
  const e = await Ee("/api/fonts");
  return { families: e.families ?? [], faces: e.faces ?? [] };
}
async function qb(e) {
  return Ee(
    `/api/fonts?filename=${encodeURIComponent(e.name)}`,
    {
      method: "POST",
      headers: { "content-type": e.type || "application/octet-stream" },
      body: e
    }
  );
}
async function Kb(e) {
  return Ee(
    `/api/fonts/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function Xb() {
  return Ee("/api/fonts/catalogue");
}
async function Cl(e) {
  return Ee("/api/fonts/install", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ pack: e })
  });
}
function Yb(e, t) {
  return `/api/projects/${encodeURIComponent(e)}/preview.svg?v=${t}`;
}
async function Fn(e) {
  return URL.createObjectURL(await Vs(e));
}
async function Vs(e) {
  const t = await fetch(e);
  if (t.status === 401)
    throw Fs(), new Ye("unauthorized", "this server needs an access token", null);
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
function es(e, t, n = 1, o) {
  const r = new URLSearchParams({ scale: String(n), v: String(t) });
  return o?.only?.length && r.set("only", o.only.join(",")), o?.exclude?.length && r.set("exclude", o.exclude.join(",")), `/api/projects/${encodeURIComponent(e)}/preview.png?${r.toString()}`;
}
async function Uf(e, t, n) {
  const o = new URLSearchParams({ id: t, width: String(n) });
  return Ee(
    `/api/projects/${encodeURIComponent(e)}/text-layout?${o.toString()}`
  );
}
function Be(e, t = null, n = 0, o = []) {
  for (const r of e)
    o.push({ layer: r, parent: t, depth: n }), r.type === "group" && Be(r.children ?? [], r.id, n + 1, o);
  return o;
}
function tr(e) {
  return !e.protected && !e.readOnly && !e.locked;
}
function ts(e) {
  return e.protected ? "protected — no tool can change this layer" : e.readOnly ? "read-only — inspectable but never mutable" : e.locked ? "locked — unlock it to make changes" : null;
}
function jl(e) {
  return !e.includes("'") && !/[\r\n]/.test(e) ? `'${e}'` : JSON.stringify(e);
}
function Gb(e) {
  const t = ["mcp", "--workspace", e.workspace], n = JSON.stringify(
    { mcpServers: { assemblash: { command: e.executable, args: t } } },
    null,
    2
  ), o = [
    "[mcp_servers.assemblash]",
    `command = ${jl(e.executable)}`,
    `args = [${t.map(jl).join(", ")}]`
  ].join(`
`);
  return [
    { id: "json", title: y("agents.jsonTitle"), hint: y("agents.jsonHint"), text: n },
    { id: "codex", title: y("agents.codexTitle"), hint: y("agents.codexHint"), text: o },
    { id: "url", title: y("agents.urlTitle"), hint: y("agents.urlHint"), text: e.mcpUrl }
  ];
}
async function Jb(e) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(e);
    return;
  }
  const t = document.createElement("textarea");
  t.value = e, t.setAttribute("readonly", ""), t.style.position = "fixed", t.style.opacity = "0", document.body.append(t), t.select();
  const n = document.execCommand("copy");
  if (t.remove(), !n) throw new Error(y("agents.copyRefused"));
}
const kl = "assemblash-agent-hint-v1";
function Zb({
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
  const i = n === null ? [] : Gb(n);
  return /* @__PURE__ */ l.jsxs(
    pt,
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
        /* @__PURE__ */ l.jsx(lo, { align: "center", justify: "between", gap: "3", mb: "md", children: /* @__PURE__ */ l.jsxs("div", { children: [
          /* @__PURE__ */ l.jsx(ee, { component: "p", size: "xs", fw: 600, mb: 4, style: { letterSpacing: "0.08em" }, children: y("agents.protocol") }),
          /* @__PURE__ */ l.jsx(Ec, { order: 2, size: "h2", m: 0, children: y("agents.dialogTitle") })
        ] }) }),
        /* @__PURE__ */ l.jsx(ee, { component: "p", size: "sm", c: "dimmed", mb: "sm", children: y("agents.introLocal") }),
        /* @__PURE__ */ l.jsx(ee, { component: "p", size: "sm", c: "dimmed", mb: "md", children: y("agents.introConfig") }),
        /* @__PURE__ */ l.jsxs("p", { id: "agents-token", hidden: n?.tokenRequired !== !0, children: [
          y("agents.tokenBeforeCommand"),
          " ",
          /* @__PURE__ */ l.jsx("code", { children: "assemblash token show" }),
          " ",
          y("agents.tokenBetweenCommands"),
          " ",
          /* @__PURE__ */ l.jsx("code", { children: "Authorization: Bearer <token>" }),
          y("agents.tokenAfterCommand")
        ] }),
        /* @__PURE__ */ l.jsx(ye, { id: "agents-blocks", gap: "md", children: i.map((c) => /* @__PURE__ */ l.jsxs(ye, { component: "section", className: "agent-block", "data-block": c.id, gap: "xs", children: [
          /* @__PURE__ */ l.jsxs(lo, { align: "center", justify: "between", gap: "md", my: "sm", children: [
            /* @__PURE__ */ l.jsx(Ec, { order: 3, size: "h4", m: 0, children: c.title }),
            /* @__PURE__ */ l.jsxs(
              ce,
              {
                size: "xs",
                variant: "light",
                className: "agent-copy",
                onClick: () => {
                  Jb(c.text).then(
                    () => a.current.say(y("agents.copied", { title: c.title })),
                    (u) => a.current.say(
                      y("agents.copyError", { error: String(u) }),
                      "error"
                    )
                  );
                },
                children: [
                  /* @__PURE__ */ l.jsx("i", { className: "ph ph-copy", "aria-hidden": "true" }),
                  " ",
                  y("agents.copyButton")
                ]
              }
            )
          ] }),
          /* @__PURE__ */ l.jsx(ee, { component: "p", size: "xs", c: "dimmed", mb: "xs", children: c.hint }),
          /* @__PURE__ */ l.jsx("pre", { className: "agents-config", children: /* @__PURE__ */ l.jsx("code", { children: c.text }) })
        ] }, c.id)) }),
        /* @__PURE__ */ l.jsx(lo, { justify: "flex-end", gap: "md", mt: "lg", children: /* @__PURE__ */ l.jsx(ce, { id: "agents-done", onClick: () => s(!1), children: y("common.done") }) })
      ]
    }
  );
}
function Qb(e) {
  const t = document.createElement("div");
  t.dataset.island = "agents", document.body.append(t);
  const n = { current: null };
  Ue("agents", t, /* @__PURE__ */ l.jsx(Zb, { host: e, controller: n }));
  async function o() {
    try {
      const s = await Pb();
      n.current?.(s);
    } catch (s) {
      const a = s instanceof Ye ? s.message : String(s);
      e.say(y("agents.openError", { error: a }), "error");
      return;
    }
  }
  function r() {
    let s = !1;
    try {
      s = window.localStorage.getItem(kl) !== null, window.localStorage.setItem(kl, "shown");
    } catch {
    }
    s || o();
  }
  return { open: o, offerOnFirstRun: r };
}
const ew = [
  { id: "png", label: "PNG", detail: y("export.pngDetail"), icon: "ph-image" },
  { id: "svg", label: "SVG", detail: y("export.svgDetail"), icon: "ph-file-svg" }
];
function tw(e, t, n, o) {
  return e === "svg" ? {
    url: Yb(t, $e(n)),
    filename: `${o}.svg`
  } : { url: Hf(t, o), filename: `${o}.png` };
}
const eo = [
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
function Dr(e, t) {
  const n = e.canvas.width, o = e.canvas.height, r = t.longEdge === null ? 1 : t.longEdge / Math.max(n, o);
  return {
    width: Math.max(1, Math.round(n * r)),
    height: Math.max(1, Math.round(o * r)),
    scale: r
  };
}
function nw(e) {
  const t = window.document.getElementById(e);
  if (!t) throw new Error(`missing element #${e}`);
  return t;
}
function El(e) {
  return e.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "assemblash-export";
}
function ow(e) {
  return e < 1024 ? y("export.bytes", { count: Re(e) }) : e < 1024 * 1024 ? `${Re(Math.round(e / 102.4) / 10)} KB` : `${Re(Math.round(e / (1024 * 1024) * 10) / 10)} MB`;
}
function rw({ host: e, controller: t }) {
  const [n, o] = p.useState("png"), [r, s] = p.useState("8k"), [a, i] = p.useState("assemblash-export"), [c, u] = p.useState(""), [f, h] = p.useState(!1), [d, m] = p.useState(!1), [g, v] = p.useState(null);
  Fe();
  const w = p.useRef(null), x = e.document(), E = n === "svg", C = eo.find((S) => S.id === r) ?? eo[0];
  function j() {
    w.current && URL.revokeObjectURL(w.current), w.current = null, v(null);
  }
  function R(S = n, b = r) {
    const P = e.document();
    if (!P) {
      u(y("export.noProject"));
      return;
    }
    const L = S === "svg" ? { width: P.canvas.width, height: P.canvas.height } : Dr(P, eo.find(($) => $.id === b) ?? eo[0]);
    u(`${Re(L.width)} × ${Re(L.height)} ${y(S === "svg" ? "export.svgSummary" : "export.pngSummary")}`);
  }
  p.useEffect(() => {
    const S = () => {
      const b = e.document(), P = e.project();
      if (!b || !P) {
        e.say(y("export.projectRequired"), "error");
        return;
      }
      j(), i(El(b.name ?? P)), o("png"), s("8k");
      const L = Dr(b, eo.find(($) => $.id === "8k"));
      u(`${Re(L.width)} × ${Re(L.height)} ${y("export.pngSummary")}`), m(!0);
    };
    return t.current = S, window.addEventListener("assemblash:export-open", S), () => {
      window.removeEventListener("assemblash:export-open", S), t.current = null, w.current && URL.revokeObjectURL(w.current);
    };
  }, [t, e]);
  async function T(S) {
    if (S.preventDefault(), !S.currentTarget.reportValidity()) return;
    const b = e.project(), P = e.document();
    if (!b || !P) return;
    const L = n, $ = L === "svg" ? { width: P.canvas.width, height: P.canvas.height, scale: 1 } : Dr(P, C), F = El(a);
    i(F);
    const B = tw(L, b, P, F);
    await e.guard(y("export.openButton"), async () => {
      j(), h(!0), u(y("export.renderingSize", { width: Re($.width), height: Re($.height) }));
      try {
        const I = L === "svg" ? { width: $.width, height: $.height, bytes: 0 } : await kb(b, F, $.scale), O = await Vs(B.url);
        w.current = URL.createObjectURL(O), v({ url: w.current, filename: B.filename });
        const D = L === "svg" ? O.size : I.bytes;
        u(`${Re(I.width)} × ${Re(I.height)} ${y("export.ready", { format: L.toUpperCase(), size: ow(D) })}`), e.say(y("export.exported", { width: Re(I.width), height: Re(I.height), format: L.toUpperCase() }));
      } finally {
        h(!1);
      }
    });
  }
  return /* @__PURE__ */ l.jsx(pt, { id: "export-dialog", "data-state": d ? "open" : "closed", opened: d, onClose: () => {
    m(!1), j();
  }, title: null, withCloseButton: !1, centered: !0, size: "lg", withinPortal: !1, keepMounted: !0, children: /* @__PURE__ */ l.jsx("div", { className: "export-mantine-root", children: /* @__PURE__ */ l.jsx("form", { id: "export-form", onSubmit: (S) => {
    T(S);
  }, children: /* @__PURE__ */ l.jsxs(ye, { gap: "md", children: [
    /* @__PURE__ */ l.jsxs(Ne, { justify: "space-between", align: "flex-start", children: [
      /* @__PURE__ */ l.jsxs("div", { children: [
        /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: y("export.eyebrow") }),
        /* @__PURE__ */ l.jsx(ee, { component: "h2", fw: 700, size: "lg", children: y("export.title") })
      ] }),
      /* @__PURE__ */ l.jsx(ce, { type: "button", variant: "subtle", "aria-label": y("common.close"), onClick: () => {
        m(!1), j();
      }, children: "×" })
    ] }),
    /* @__PURE__ */ l.jsxs(ye, { gap: "xs", children: [
      /* @__PURE__ */ l.jsx(ee, { fw: 600, children: y("export.format") }),
      /* @__PURE__ */ l.jsx(Ne, { id: "export-formats", role: "radiogroup", "aria-label": y("export.format"), grow: !0, children: ew.map((S) => /* @__PURE__ */ l.jsx(ho, { component: "button", type: "button", "data-format": S.id, role: "radio", "aria-checked": n === S.id, withBorder: !0, p: "sm", bg: n === S.id ? "red.0" : void 0, style: { cursor: "pointer", textAlign: "left" }, onClick: () => {
        n !== S.id && (j(), o(S.id), R(S.id));
      }, children: /* @__PURE__ */ l.jsxs(ye, { gap: 4, children: [
        /* @__PURE__ */ l.jsxs(Ne, { gap: "xs", children: [
          /* @__PURE__ */ l.jsx("i", { className: `ph ${S.icon}`, "aria-hidden": "true" }),
          /* @__PURE__ */ l.jsx("b", { children: S.label })
        ] }),
        /* @__PURE__ */ l.jsx(ee, { size: "sm", children: y(S.id === "png" ? "export.pngDetail" : "export.svgDetail") })
      ] }) }, S.id)) })
    ] }),
    /* @__PURE__ */ l.jsxs(ye, { id: "export-resolution-row", "aria-disabled": E, gap: "xs", children: [
      /* @__PURE__ */ l.jsx(ee, { fw: 600, children: y("export.resolution") }),
      /* @__PURE__ */ l.jsx(Ne, { id: "export-options", role: "radiogroup", "aria-label": y("export.resolution"), "aria-disabled": E, grow: !0, children: eo.map((S) => {
        const b = x ? Dr(x, S) : null;
        return /* @__PURE__ */ l.jsx(ho, { component: "button", type: "button", disabled: E, role: "radio", "aria-checked": r === S.id && !E, withBorder: !0, p: "sm", bg: r === S.id && !E ? "red.0" : void 0, style: { cursor: E ? "not-allowed" : "pointer", textAlign: "left" }, onClick: () => {
          s(S.id), j(), R(n, S.id);
        }, children: /* @__PURE__ */ l.jsxs(ye, { gap: 4, children: [
          /* @__PURE__ */ l.jsxs(Ne, { gap: "xs", children: [
            /* @__PURE__ */ l.jsx("i", { className: `ph ${S.icon}`, "aria-hidden": "true" }),
            /* @__PURE__ */ l.jsx("b", { children: S.id === "original" ? y("export.original") : S.id === "8k" ? y("export.resolution8k") : S.label })
          ] }),
          /* @__PURE__ */ l.jsx(ee, { size: "sm", children: b ? `${Re(b.width)} × ${Re(b.height)}` : y(S.id === "original" ? "export.documentSize" : `export.longEdge${S.id}`) })
        ] }) }, S.id);
      }) })
    ] }),
    /* @__PURE__ */ l.jsx(dt, { id: "export-name", label: y("export.fileName"), value: a, onChange: (S) => i(S.currentTarget.value), pattern: "[A-Za-z0-9_-]+", maxLength: 60, required: !0 }),
    /* @__PURE__ */ l.jsx(ee, { id: "export-summary", "aria-live": "polite", fw: 500, children: c }),
    /* @__PURE__ */ l.jsxs(Ne, { justify: "flex-end", children: [
      /* @__PURE__ */ l.jsxs(ce, { id: "export-download", component: "a", href: g?.url ?? "#", download: g?.filename, hidden: !g, variant: "default", children: [
        /* @__PURE__ */ l.jsx("i", { className: "ph ph-download-simple", "aria-hidden": "true" }),
        " ",
        y("common.download")
      ] }),
      /* @__PURE__ */ l.jsx(ce, { id: "export-cancel", type: "button", variant: "default", onClick: () => {
        m(!1), j();
      }, children: y("common.cancel") }),
      /* @__PURE__ */ l.jsxs(ce, { id: "export-confirm", type: "submit", loading: f, value: "default", children: [
        /* @__PURE__ */ l.jsx("i", { className: `ph ${f ? "ph-circle-notch" : "ph-export"}`, "aria-hidden": "true" }),
        " ",
        f ? y("export.rendering") : y("export.confirm", { format: n.toUpperCase() })
      ] })
    ] })
  ] }) }) }) });
}
function sw(e) {
  const t = nw("export-dialog-mount"), n = { current: null };
  return Ue("export", t, /* @__PURE__ */ l.jsx(rw, { host: e, controller: n })), { open: () => {
    n.current ? n.current() : queueMicrotask(() => n.current?.());
  } };
}
function Rl(e, t, n) {
  const o = n * Math.PI / 180, r = Math.sin(o), s = Math.cos(o);
  return { x: e * s - t * r, y: e * r + t * s };
}
function ns(e) {
  const t = e.rotation * Math.PI / 180, n = Math.abs(Math.sin(t)), o = Math.abs(Math.cos(t)), r = e.width * o + e.height * n, s = e.width * n + e.height * o, a = e.x + e.width / 2, i = e.y + e.height / 2;
  return {
    x: a - r / 2,
    y: i - s / 2,
    width: r,
    height: s
  };
}
function Qi(e) {
  if (e.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  const t = e.map(ns), n = Math.min(...t.map((a) => a.x)), o = Math.min(...t.map((a) => a.y)), r = Math.max(...t.map((a) => a.x + a.width)), s = Math.max(...t.map((a) => a.y + a.height));
  return { x: n, y: o, width: r - n, height: s - o };
}
function aw(e, t) {
  const n = e.width ?? 0, o = e.height ?? 0;
  if (!(n > 0) || !(o > 0)) return { width: 300, height: 200 };
  const r = Math.min(t.width / n, t.height / o, 1);
  return {
    width: Math.max(1, Math.round(n * r)),
    height: Math.max(1, Math.round(o * r))
  };
}
function Wf(e, t, n, o = !1) {
  const r = n.width / (o ? t.width : Math.max(1, t.width)), s = n.height / (o ? t.height : Math.max(1, t.height)), a = n.x + (e.x + e.width / 2 - t.x) * r, i = n.y + (e.y + e.height / 2 - t.y) * s, c = o ? e.width * r : Math.max(1, e.width * r), u = o ? e.height * s : Math.max(1, e.height * s);
  return {
    x: a - c / 2,
    y: i - u / 2,
    width: c,
    height: u
  };
}
function ua(e) {
  const t = new DataView(new ArrayBuffer(8));
  return t.setFloat64(0, e), t.setBigUint64(0, t.getBigUint64(0) + 1n), t.getFloat64(0);
}
function iw(e, t, n, o, r, s, a = [e]) {
  if (![e.x, e.y, e.width, e.height, t, o, r].every(Number.isFinite)) return null;
  const i = n.includes("e") ? 1 : n.includes("w") ? -1 : 0, c = n.includes("s") ? 1 : n.includes("n") ? -1 : 0, u = Rl(o, r, -t), f = i * u.x * (s.centre ? 2 : 1), h = c * u.y * (s.centre ? 2 : 1);
  if (f === 0 && h === 0) return { ...e };
  if (!(e.width > 0 && e.height > 0) || a.length === 0 || a.some((b) => !Number.isFinite(b.width) || !Number.isFinite(b.height) || b.width <= 0 || b.height <= 0)) return null;
  const d = 1 + f / e.width, m = 1 + h / e.height;
  if (![d, m].every(Number.isFinite)) return null;
  const g = Math.max(...a.map((b) => Math.min(1, b.width) / b.width)), v = Math.max(...a.map((b) => Math.min(1, b.height) / b.height));
  let w, x;
  if (s.ratio) {
    const b = i && c ? Math.abs(d - 1) >= Math.abs(m - 1) ? d : m : i ? d : m;
    w = x = Math.max(b, g, v);
  } else
    w = i ? Math.max(d, g) : 1, x = c ? Math.max(m, v) : 1;
  for (let b = 0; b < 4; b += 1) {
    const P = a.some(($) => $.width * w < Math.min(1, $.width)), L = a.some(($) => $.height * x < Math.min(1, $.height));
    if (!P && !L) break;
    s.ratio ? w = x = ua(w) : (P && (w = ua(w)), L && (x = ua(x)));
  }
  if (w === 1 && x === 1) return { ...e };
  const E = e.width * w, C = e.height * x, j = Rl(
    s.centre ? 0 : i * (E - e.width) / 2,
    s.centre ? 0 : c * (C - e.height) / 2,
    t
  ), R = {
    x: e.x + e.width / 2 + j.x - E / 2,
    y: e.y + e.height / 2 + j.y - C / 2,
    width: E,
    height: C
  };
  if (t === 0 && (R.x = s.centre || i === 0 ? e.x + (e.width - E) / 2 : i > 0 ? e.x : e.x + e.width - E, R.y = s.centre || c === 0 ? e.y + (e.height - C) / 2 : c > 0 ? e.y : e.y + e.height - C), !Object.values(R).every(Number.isFinite) || E <= 0 || C <= 0) return null;
  const T = R.width / e.width, S = R.height / e.height;
  return a.some((b) => {
    const P = b.width * T, L = b.height * S;
    return !Number.isFinite(P) || !Number.isFinite(L) || P < Math.min(1, b.width) || L < Math.min(1, b.height);
  }) ? null : R;
}
function cw(e, t) {
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
function lw(e, t, n) {
  const o = (e.transform.rotation ?? 0) * Math.PI / 180, r = Math.cos(o), s = Math.sin(o), a = e.transform.flipHorizontal ? -1 : 1, i = e.transform.flipVertical ? -1 : 1, c = (n.width - t.width) / 2, u = (n.height - t.height) / 2, f = n.x - t.x, h = n.y - t.y;
  if (e.type === "text" || e.type === "group") {
    const j = r * a * c - s * i * u, R = s * a * c + r * i * u, T = e.type === "group" && (a < 0 || i < 0), S = [1, 0, 0, 1, f + (T ? 0 : c) - j, h + (T ? 0 : u) - R];
    return S.every(Number.isFinite) ? S : null;
  }
  const d = n.width / t.width, m = n.height / t.height, g = r * r * d + s * s * m, v = r * s * (d - m), w = s * s * d + r * r * m, x = t.x + t.width / 2, E = t.y + t.height / 2, C = [g, v, v, w, n.x + n.width / 2 - g * x - v * E, n.y + n.height / 2 - v * x - w * E];
  return C.every(Number.isFinite) ? C : null;
}
const uw = "Aa Bb 0123", to = /* @__PURE__ */ new Map(), Da = /* @__PURE__ */ new WeakMap(), Oa = /* @__PURE__ */ new WeakSet();
function dw(e) {
  let t = to.get(e);
  if (!t && (t = Vs(e).catch((n) => {
    throw to.delete(e), n;
  }), to.set(e, t), to.size > 64)) {
    const n = to.keys().next().value;
    n && to.delete(n);
  }
  return t;
}
function La(e) {
  for (const t of e.querySelectorAll("img[data-font-specimen]")) {
    const n = Da.get(t);
    n && URL.revokeObjectURL(n), Da.delete(t), Oa.add(t), t.removeAttribute("src");
  }
}
function fw(e, t, n) {
  const o = window.document.createElement("span");
  o.className = "font-specimen";
  const r = window.document.createElement("img");
  r.className = "font-specimen-image", r.dataset.fontSpecimen = "", r.alt = "", r.setAttribute("aria-hidden", "true");
  const s = window.document.createElement("span");
  s.className = "font-specimen-status", s.hidden = !0, o.append(r, s), e.append(o), dw(t).then((a) => {
    if (!r.isConnected || Oa.has(r)) return;
    const i = URL.createObjectURL(a);
    Da.set(r, i), r.src = i, s.hidden = !0;
  }).catch(() => {
    !r.isConnected || Oa.has(r) || (s.textContent = y(n), s.hidden = !1);
  });
}
function pw(e) {
  return e.find((t) => t.weight === 400 && t.style === "normal") ?? e.find((t) => t.style === "normal") ?? e[0] ?? null;
}
function qf(e, t, n = uw) {
  fw(e, Ma(t, n), "fonts.previewUnavailable");
}
function Kf(e, t) {
  return t.filter((n) => n.family === e).sort((n, o) => n.weight - o.weight);
}
let hw = 0;
function mw({ host: e, value: t, disabled: n, label: o, onCommit: r }) {
  const s = p.useMemo(() => ({ initialFamily: t, initialDisabled: n }), []);
  return p.useEffect(() => {
    s.setFamily?.(t), s.setDisabled?.(n);
  }, [s, t, n]), s.label = o, /* @__PURE__ */ l.jsx("span", { className: "font-selector", children: /* @__PURE__ */ l.jsx(Xf, { host: e, actions: s, onCommit: r }) });
}
let gw = 0;
function vw(e, t) {
  const n = e.trim().toLowerCase();
  return n ? t.families.find((o) => o.toLowerCase() === n) ?? null : null;
}
function yw({
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
      return t && qf(i, t), () => La(i);
  }, [t]), /* @__PURE__ */ l.jsx("li", { ref: a, id: r, "data-family": e, className: n ? "active" : void 0, "aria-selected": o, onMouseDown: s, children: /* @__PURE__ */ l.jsxs(Ce.Option, { value: e, active: n, selected: o, children: [
    /* @__PURE__ */ l.jsx("span", { className: "font-selector-family", children: e }),
    /* @__PURE__ */ l.jsx(ee, { component: "span", size: "xs", c: "dimmed", className: "font-selector-faces", children: t ? `${t.style === "italic" ? y("fonts.styleItalic") : y("fonts.styleNormal")} ${Re(t.weight)}` : y("fonts.facesUnknown") }),
    !t && /* @__PURE__ */ l.jsx("span", { className: "font-specimen-status", children: y("fonts.previewUnavailable") })
  ] }) });
}
function Xf({
  host: e,
  onCommit: t,
  actions: n
}) {
  Fe();
  const [o, r] = p.useState(n.initialFamily), [s, a] = p.useState(!1), [i, c] = p.useState(n.initialDisabled), [u, f] = p.useState(-1), h = p.useRef(null), d = p.useRef(""), m = p.useMemo(() => `font-selector-options-${++gw}`, []), g = Mi({
    loop: !0,
    onDropdownClose: () => f(-1)
  }), v = e.store(), w = o.trim().toLowerCase(), x = w ? v.families.filter((b) => b.toLowerCase().includes(w)) : v.families, E = p.useCallback(() => {
    g.closeDropdown(), f(-1);
  }, [g]), C = p.useCallback((b) => {
    d.current = b, r(b), a(!1), E(), h.current?.blur(), t(b);
  }, [E, t]), j = p.useCallback(() => {
    E();
    const b = h.current?.value.trim() ?? "";
    if (!b || b.toLowerCase() === d.current.toLowerCase()) return;
    const P = vw(b, e.store());
    if (!P) {
      a(!0);
      return;
    }
    d.current = P, r(P), a(!1), t(P);
  }, [E, e, t]), R = p.useCallback(() => {
    r(h.current?.value ?? ""), a(!1), f(-1), g.openDropdown();
  }, [g]), T = p.useCallback((b) => {
    h.current = b, b && (b.onfocus = () => qt.flushSync(() => R()), b.onblur = j, b.oninput = () => {
      qt.flushSync(() => {
        r(b.value), a(!1), f(-1), g.openDropdown();
      });
    }, b.onkeydown = (P) => qt.flushSync(() => S(P)));
  }, [n, j, R, S]);
  n.setFamily = (b) => {
    d.current = b, r(b), a(!1);
  }, n.setDisabled = (b) => {
    c(b), b && E();
  };
  function S(b) {
    if (b.key === "ArrowDown" || b.key === "ArrowUp") {
      b.preventDefault(), g.dropdownOpened || g.openDropdown(), x.length && f((P) => {
        const L = b.key === "ArrowDown" ? 1 : -1;
        return (P + L + x.length) % x.length;
      });
      return;
    }
    if (b.key === "Enter" && g.dropdownOpened && u >= 0) {
      const P = x[u];
      P && (b.preventDefault(), C(P));
      return;
    }
    b.key === "Escape" && g.dropdownOpened && (b.preventDefault(), b.stopPropagation(), E());
  }
  return p.useLayoutEffect(() => {
    u < 0 || document.getElementById(`${m}-${u}`)?.scrollIntoView({ block: "nearest" });
  }, [u, m]), /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
    /* @__PURE__ */ l.jsxs(
      Ce,
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
          /* @__PURE__ */ l.jsx(Ce.Target, { withKeyboardNavigation: !1, withAriaAttributes: !1, children: /* @__PURE__ */ l.jsx(
            dt,
            {
              ref: T,
              value: o,
              autoComplete: "off",
              disabled: i,
              role: "combobox",
              "aria-autocomplete": "list",
              "aria-label": n.label ?? y("editor.fontFamily"),
              "aria-expanded": g.dropdownOpened,
              "aria-controls": m,
              "aria-activedescendant": u >= 0 ? `${m}-${u}` : void 0,
              onChange: (b) => {
                r(b.currentTarget.value), a(!1), f(-1), g.openDropdown();
              }
            }
          ) }),
          /* @__PURE__ */ l.jsxs(
            Ce.Dropdown,
            {
              className: "font-selector-list",
              hidden: !g.dropdownOpened,
              "aria-labelledby": `${m}-heading`,
              children: [
                /* @__PURE__ */ l.jsx(ee, { component: "p", size: "xs", fw: 700, c: "dimmed", id: `${m}-heading`, className: "font-selector-heading", "data-i18n": "fonts.selectorHeading", children: y("fonts.selectorHeading") }),
                /* @__PURE__ */ l.jsxs(Ce.Options, { id: m, role: "listbox", children: [
                  x.map((b, P) => {
                    const L = Kf(b, v.faces);
                    return /* @__PURE__ */ l.jsx(
                      yw,
                      {
                        id: `${m}-${P}`,
                        family: b,
                        face: pw(L),
                        active: P === u,
                        selected: P === u,
                        onMouseDown: ($) => {
                          $.preventDefault(), C(b);
                        }
                      },
                      b
                    );
                  }),
                  x.length === 0 && /* @__PURE__ */ l.jsx(Ce.Empty, { className: "font-selector-none", children: /* @__PURE__ */ l.jsx(ee, { component: "span", size: "xs", c: "dimmed", "data-i18n": "fonts.noFamilyMatches", children: y("fonts.noFamilyMatches") }) })
                ] })
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ l.jsx(ee, { component: "p", size: "xs", c: "dimmed", className: "font-selector-message", "data-i18n": "fonts.notInstalled", hidden: !s, children: y("fonts.notInstalled") })
  ] });
}
function bw(e, t) {
  const n = window.document.createElement("span");
  n.className = "font-selector";
  const o = {
    initialFamily: "",
    initialDisabled: !1
  }, r = Ue(
    `font-selector-${++hw}`,
    n,
    /* @__PURE__ */ l.jsx(Xf, { host: e, onCommit: t, actions: o })
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
const Nl = "Aa Bb 0123";
function Lo(e) {
  if (e.length <= 1) return e[0] ?? "";
  const t = si();
  return new Intl.ListFormat(t === "pseudo" ? "en" : t, {
    style: "long",
    type: "conjunction"
  }).format(e);
}
function Tl(e) {
  const t = e / 1048576;
  return t >= 10 ? `${Re(Math.round(t))} MB` : `${Re(Math.max(0.1, Math.round(t * 10) / 10))} MB`;
}
const no = /* @__PURE__ */ new Map();
function ww(e) {
  let t = no.get(e);
  if (!t && (t = Vs(e).catch((n) => {
    throw no.delete(e), n;
  }), no.set(e, t), no.size > 64)) {
    const n = no.keys().next().value;
    n && no.delete(n);
  }
  return t;
}
function Pl({
  url: e,
  unavailable: t,
  generation: n
}) {
  const [o, r] = p.useState(""), [s, a] = p.useState(!1);
  return p.useEffect(() => {
    let i = !0, c = "";
    return r(""), a(!1), ww(e).then((u) => {
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
    /* @__PURE__ */ l.jsx("span", { className: "font-specimen-status", hidden: !s, children: y(t) })
  ] });
}
function xw({ host: e, controller: t }) {
  const [n, o] = p.useState([]), [r, s] = p.useState([]), [a, i] = p.useState(Nl), [c, u] = p.useState(Nl), [f, h] = p.useState([]), [d, m] = p.useState(null), [g, v] = p.useState({}), [w, x] = p.useState(!1), [E, C] = p.useState(""), [j, R] = p.useState(!1), [T, S] = p.useState(0), [b, P] = p.useState(null), L = Fe(), [$, F] = p.useState(!0), B = p.useRef(n), I = p.useRef(null), O = p.useRef(null), D = p.useRef(void 0);
  B.current = n;
  const z = p.useCallback((q, K) => {
    B.current = q, o(q), s(K), e.fontsChanged({ families: q, faces: K });
  }, [e]), M = p.useCallback(async () => {
    F(!0);
    const q = await Wb();
    z([...q.families], [...q.faces]);
  }, [z]);
  p.useLayoutEffect(() => (t.reload = M, t.focusInstall = () => I.current?.focus(), t.hasFamilies = () => B.current.length > 0, t.releaseSamples = () => {
    F(!1), S((q) => q + 1);
  }, M(), () => {
    window.clearTimeout(D.current), t.reload = async () => {
    }, t.focusInstall = () => {
    }, t.hasFamilies = () => !1, t.releaseSamples = () => {
    };
  }), [t, M]);
  const A = p.useCallback(async () => {
    if (d) return d;
    const q = await Xb();
    return m(q), q;
  }, [d]);
  p.useEffect(() => {
    A().catch(() => m(null));
  }, [A]);
  const _ = p.useCallback(async () => {
    try {
      const q = await A(), K = q.packs.default ?? [], le = q.families.filter((xe) => K.includes(xe.family)).reduce((xe, pe) => xe + pe.bytes, 0);
      C(K.length ? y("fonts.defaultPackDescription", { names: Lo(K), bytes: Tl(le) }) : y("fonts.noDefaultPack")), R(!1);
    } catch (q) {
      C(q instanceof Ye ? y("fonts.packDescribeErrorCode", { error: q.message, code: q.code }) : y("fonts.packDescribeError")), R(!0);
    }
  }, [A]);
  p.useEffect(() => {
    n.length || _();
  }, [n.length, _]), p.useEffect(() => {
    let q = !0;
    return Ub().then((K) => {
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
    await e.guard(y("fonts.installFonts"), async () => {
      x(!0), e.say(y("fonts.downloadingDefault"));
      try {
        const q = await Cl("default");
        await M(), await H(), e.say(y("fonts.installedFamilies", { names: Lo(q.families) }));
      } finally {
        x(!1);
      }
    });
  }, Y = (q) => {
    e.guard(y("fonts.installNamedPack", { pack: q }), async () => {
      try {
        await Cl(q), await M(), await H(), e.say(y("fonts.installedNamedPack", { pack: q }));
      } finally {
        S((K) => K + 1);
      }
    });
  }, ae = (q) => {
    const K = [...q ?? []];
    O.current && (O.current.value = ""), K.length && e.guard(y("fonts.importFont"), async () => {
      h([]);
      let le = 0;
      const xe = [];
      for (const je of K)
        try {
          const ne = await qb(je);
          le += 1;
          const U = [...new Set(ne.imported.map((V) => V.family))];
          xe.push(U.length ? `${je.name} → ${Lo(U)}` : y("fonts.importedFile", { file: je.name }));
        } catch (ne) {
          xe.push(ne instanceof Ye ? `${je.name}: ${ne.message} (${ne.code})` : `${je.name}: ${String(ne)}`);
        }
      h(xe), await M(), le && await H();
      const pe = K.length - le;
      le ? e.say(Ot("fonts.importResult", le, {
        refused: pe ? Ot("fonts.refusedCount", pe) : ""
      })) : e.say(y("fonts.noneImported", { refused: Ot("fonts.refusedCount", pe) }), "error");
    });
  }, fe = (q) => {
    window.confirm(y("fonts.confirmRemove", { family: q })) && e.guard(y("fonts.removeAction", { family: q }), async () => {
      h([]);
      const K = await Kb(q);
      h([Ot("fonts.removedFiles", K.removed, { family: q })]), await M(), await H(), e.say(y("fonts.removedFromStore", { family: q }));
    });
  }, ie = (q) => {
    u(q), window.clearTimeout(D.current), D.current = window.setTimeout(() => {
      const K = q.trim();
      !K || [...K].some((le) => /[\u0000-\u001f\u007f]/u.test(le)) || i(K);
    }, 180);
  }, te = d ? ["text", "display", "mono", ...Object.keys(d.packs).filter((q) => !["default", "text", "display", "mono"].includes(q)).sort()] : [], he = n.length === 0;
  return /* @__PURE__ */ l.jsxs(ye, { gap: "md", "data-testid": "font-manager", children: [
    /* @__PURE__ */ l.jsx(Q, { id: "font-empty", "data-testid": "font-empty", hidden: !he, children: /* @__PURE__ */ l.jsxs(ye, { gap: "sm", children: [
      /* @__PURE__ */ l.jsx(ee, { component: "p", size: "sm", children: y("fonts.noneInstalled") }),
      /* @__PURE__ */ l.jsx(ee, { component: "p", className: "font-install-copy", size: "sm", c: "dimmed", children: y("fonts.defaultPackCopy") }),
      /* @__PURE__ */ l.jsx(
        ce,
        {
          id: "install-default",
          "data-testid": "install-default",
          ref: I,
          disabled: w || d !== null && (d.packs.default ?? []).length === 0,
          onClick: () => {
            W();
          },
          children: /* @__PURE__ */ l.jsxs(ye, { gap: 2, children: [
            /* @__PURE__ */ l.jsx("span", { id: "install-default-label", children: w ? y("fonts.installingDefault") : y("fonts.installDefaultPack") }),
            /* @__PURE__ */ l.jsx(ee, { id: "install-default-detail", component: "span", size: "xs", c: j ? "red" : void 0, children: E })
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
        label: y("fonts.customSample"),
        "aria-label": y("fonts.customSample"),
        value: c,
        maxLength: 64,
        hidden: he,
        onChange: (q) => ie(q.currentTarget.value)
      }
    ),
    /* @__PURE__ */ l.jsx("ul", { id: "font-list", "data-testid": "font-list", className: "font-list", hidden: he, children: n.map((q) => {
      const K = r.filter((pe) => pe.family === q), le = K.map(
        (pe) => `${pe.style === "italic" ? y("fonts.styleItalic") : y("fonts.styleNormal")} ${Re(pe.weight)}`
      ).join(", "), xe = K.find((pe) => pe.weight === 400 && pe.style === "normal") ?? K.find((pe) => pe.style === "normal") ?? K[0];
      return /* @__PURE__ */ l.jsxs("li", { className: "font-family", "data-family": q, children: [
        /* @__PURE__ */ l.jsxs(Ne, { justify: "space-between", align: "center", wrap: "nowrap", children: [
          /* @__PURE__ */ l.jsxs("div", { className: "font-family-text", children: [
            /* @__PURE__ */ l.jsx("strong", { children: q }),
            /* @__PURE__ */ l.jsx("span", { className: "font-faces", children: Ot("fonts.faceCount", K.length, { described: le }) })
          ] }),
          /* @__PURE__ */ l.jsx(
            ce,
            {
              size: "xs",
              color: "red",
              variant: "light",
              className: "small danger-action",
              "data-remove-family": q,
              "data-testid": `remove-font-${q}`,
              "aria-label": y("fonts.removeFamily", { family: q }),
              onClick: () => fe(q),
              children: y("fonts.removeButton")
            }
          )
        ] }),
        $ && xe ? /* @__PURE__ */ l.jsx(
          Pl,
          {
            url: Ma(xe, a),
            unavailable: "fonts.previewUnavailable",
            generation: T + L
          }
        ) : $ ? /* @__PURE__ */ l.jsx("span", { className: "font-specimen-status", children: y("fonts.previewUnavailable") }) : null
      ] }, q);
    }) }),
    /* @__PURE__ */ l.jsx(
      Pe,
      {
        id: "font-pack-section",
        "data-testid": "font-pack-section",
        className: "font-pack-section",
        hidden: te.length === 0,
        value: b,
        onChange: P,
        keepMounted: !0,
        keepMountedMode: "display-none",
        children: /* @__PURE__ */ l.jsxs(Pe.Item, { value: "packs", children: [
          /* @__PURE__ */ l.jsx(Pe.Control, { children: y("fonts.morePacks") }),
          /* @__PURE__ */ l.jsx(Pe.Panel, { children: /* @__PURE__ */ l.jsx(ye, { id: "font-pack-options", "data-testid": "font-pack-options", className: "font-pack-options", gap: "sm", children: te.map((q) => {
            const K = d?.packs[q] ?? [], le = K.filter((pe) => !n.includes(pe)), xe = d?.families.filter((pe) => le.includes(pe.family)).reduce((pe, je) => pe + je.bytes, 0) ?? 0;
            return /* @__PURE__ */ l.jsx(
              ce,
              {
                "data-pack": q,
                "data-testid": `font-pack-${q}`,
                className: "font-pack-button",
                variant: "default",
                disabled: le.length === 0,
                onClick: () => Y(q),
                children: /* @__PURE__ */ l.jsxs(ye, { gap: "xs", align: "stretch", children: [
                  /* @__PURE__ */ l.jsx("strong", { children: y("fonts.namedPackTitle", { pack: q }) }),
                  /* @__PURE__ */ l.jsx(ee, { component: "span", size: "xs", c: "dimmed", children: le.length ? y("fonts.namedPackDownload", { names: Lo(K), bytes: Tl(xe) }) : y("fonts.namedPackInstalled", { names: Lo(K) }) }),
                  /* @__PURE__ */ l.jsx(Ne, { gap: "xs", wrap: "wrap", className: "font-pack-samples", children: K.map((pe) => {
                    const je = r.filter((V) => V.family === pe).find((V) => V.weight === 400 && V.style === "normal") ?? r.find((V) => V.family === pe), ne = g[pe], U = je ? Ma(je) : ne ? `/catalogue-specimens/${ne.src.replace(/^\.\//u, "")}` : null;
                    return /* @__PURE__ */ l.jsxs("span", { className: "font-pack-family", children: [
                      /* @__PURE__ */ l.jsx(ee, { component: "span", size: "xs", fw: 700, className: "font-pack-family-name", children: pe }),
                      $ && U ? /* @__PURE__ */ l.jsx(
                        Pl,
                        {
                          url: U,
                          unavailable: je ? "fonts.previewUnavailable" : "fonts.cataloguePreviewUnavailable",
                          generation: T + L
                        }
                      ) : U ? null : /* @__PURE__ */ l.jsx("span", { className: "font-specimen-status", children: y("fonts.cataloguePreviewUnavailable") })
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
      ce,
      {
        id: "import-font",
        "data-testid": "import-font",
        variant: "default",
        leftSection: /* @__PURE__ */ l.jsx("i", { className: "ph ph-upload-simple", "aria-hidden": "true" }),
        onClick: () => O.current?.click(),
        children: y("fonts.importFile")
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
        onChange: (q) => ae(q.currentTarget.files)
      }
    ),
    /* @__PURE__ */ l.jsx("div", { id: "font-feedback", "data-testid": "font-feedback", className: "font-feedback", "aria-live": "polite", children: f.map((q, K) => /* @__PURE__ */ l.jsx("p", { children: q }, `${K}-${q}`)) })
  ] });
}
function Sw(e, t) {
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
  return Ue("font-manager", t, /* @__PURE__ */ l.jsx(xw, { host: e, controller: n })), {
    reload: () => n.reload(),
    focusInstall: () => n.focusInstall(),
    hasFamilies: () => n.hasFamilies(),
    releaseSamples: () => n.releaseSamples()
  };
}
class Cw {
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
const jw = [
  { size: "1080x1080", width: 1080, height: 1080, label: "common.square" },
  { size: "1920x1080", width: 1920, height: 1080, label: "common.landscape" },
  { size: "1080x1350", width: 1080, height: 1350, label: "common.portrait" },
  { size: "1080x1920", width: 1080, height: 1920, label: "common.story" }
];
function kw({
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
    const E = r.trim(), C = Number(a), j = Number(c);
    if (!(!E || !Number.isFinite(C) || !Number.isFinite(j)) && !(C <= 0 || j <= 0 || g)) {
      v(!0);
      try {
        await e.create(E, C, j, f) && o(!1);
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
      title: y("dialogs.newProjectTitle"),
      centered: !0,
      size: "lg",
      children: /* @__PURE__ */ l.jsx("form", { id: "new-project-form", onSubmit: (x) => {
        w(x);
      }, children: /* @__PURE__ */ l.jsxs(ye, { gap: "md", children: [
        /* @__PURE__ */ l.jsx(
          dt,
          {
            id: "new-project-name",
            label: y("common.name"),
            placeholder: y("dialogs.projectNamePlaceholder"),
            value: r,
            onChange: (x) => s(x.currentTarget.value),
            autoComplete: "off",
            required: !0,
            "data-autofocus": !0
          }
        ),
        /* @__PURE__ */ l.jsxs(ye, { gap: "xs", children: [
          /* @__PURE__ */ l.jsx(ee, { fw: 600, children: y("canvas.label") }),
          /* @__PURE__ */ l.jsx(ti, { id: "canvas-presets", cols: { base: 2, sm: 4 }, children: jw.map((x) => /* @__PURE__ */ l.jsx(
            ce,
            {
              type: "button",
              "data-size": x.size,
              variant: d === x.size ? "light" : "default",
              onClick: () => {
                i(x.width), u(x.height), m(x.size);
              },
              children: y(x.label)
            },
            x.size
          )) })
        ] }),
        /* @__PURE__ */ l.jsxs(Ne, { grow: !0, align: "start", children: [
          /* @__PURE__ */ l.jsx(
            Qo,
            {
              id: "new-project-width",
              label: y("common.width"),
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
            Qo,
            {
              id: "new-project-height",
              label: y("common.height"),
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
            mr,
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
        /* @__PURE__ */ l.jsxs(Ne, { justify: "flex-end", children: [
          /* @__PURE__ */ l.jsx(ce, { id: "new-project-cancel", type: "button", variant: "default", onClick: () => o(!1), children: y("common.cancel") }),
          /* @__PURE__ */ l.jsx(ce, { id: "create-project-confirm", type: "submit", loading: g, children: y("dialogs.createProject") })
        ] })
      ] }) })
    }
  );
}
function Ew(e) {
  const t = document.getElementById("new-project-dialog-mount");
  if (!t) throw new Error("missing element #new-project-dialog-mount");
  const n = { current: null };
  return Ue("project-create", t, /* @__PURE__ */ l.jsx(kw, { host: e, controller: n })), { open: () => n.current?.() };
}
function Rw({ controller: e }) {
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
        /* @__PURE__ */ l.jsx(ee, { component: "p", size: "xs", fw: 600, mb: "xs", style: { letterSpacing: "0.08em" }, children: y("dialogs.documentSetup") }),
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
                  label: /* @__PURE__ */ l.jsx("span", { id: "name-dialog-label", children: t ? y(t.labelKey) : y("common.name") }),
                  value: s,
                  onChange: (m) => a(m.currentTarget.value),
                  autoComplete: "off",
                  maxLength: 80,
                  required: !0,
                  autoFocus: !0
                }
              ),
              /* @__PURE__ */ l.jsxs(lo, { justify: "flex-end", gap: "sm", mt: "lg", children: [
                /* @__PURE__ */ l.jsx(ce, { type: "button", variant: "default", onClick: f, children: y("common.cancel") }),
                /* @__PURE__ */ l.jsx(ce, { id: "name-dialog-confirm", ref: u, type: "submit", children: t ? y(t.confirmKey) : y("common.save") })
              ] })
            ]
          }
        )
      ]
    }
  );
}
function Nw() {
  const e = window.document.createElement("div");
  e.dataset.island = "name-prompt", window.document.body.append(e);
  const t = {};
  Ue("name-prompt", e, /* @__PURE__ */ l.jsx(Rw, { controller: t }));
  const n = t.open;
  if (!n) throw new Error("Mantine name prompt failed to mount");
  return {
    request(o, r, s, a) {
      n({ titleKey: o, labelKey: r, confirmKey: s, submit: a });
    }
  };
}
function Tw(e) {
  const t = window.document.getElementById(e);
  if (!t) throw new Error(`missing element #${e}`);
  return t;
}
function Pw({ controller: e }) {
  const { colorScheme: t, setColorScheme: n } = Th(), [o, r] = p.useState(!1), [s, a] = p.useState("settings-agents");
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
  return /* @__PURE__ */ l.jsx(pt, { ref: u, id: "settings-dialog", "data-state": o ? "open" : "closed", opened: o, onClose: h, title: null, withCloseButton: !1, centered: !0, size: "xl", withinPortal: !1, keepMounted: !0, keepMountedMode: "display-none", children: /* @__PURE__ */ l.jsx("form", { id: "settings-form", onSubmit: d, children: /* @__PURE__ */ l.jsxs(ye, { gap: "md", children: [
    /* @__PURE__ */ l.jsxs(Ne, { justify: "space-between", align: "flex-start", children: [
      /* @__PURE__ */ l.jsxs("div", { children: [
        /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: y("settings.preferences") }),
        /* @__PURE__ */ l.jsx(ee, { component: "h2", fw: 700, children: y("settings.openButton") })
      ] }),
      /* @__PURE__ */ l.jsx(ce, { id: "settings-close", type: "submit", value: "cancel", variant: "subtle", title: y("common.close"), "aria-label": y("common.close"), children: "×" })
    ] }),
    /* @__PURE__ */ l.jsxs(Pe, { value: s, onChange: (m) => a(m), variant: "separated", keepMounted: !0, keepMountedMode: "display-none", children: [
      /* @__PURE__ */ l.jsxs(Pe.Item, { id: "settings-agents", className: "settings-section", value: "settings-agents", children: [
        /* @__PURE__ */ l.jsx(Pe.Control, { children: /* @__PURE__ */ l.jsxs(Ne, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx("i", { className: "ph ph-robot", "aria-hidden": "true" }),
          /* @__PURE__ */ l.jsxs(ye, { gap: 0, children: [
            /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: y("settings.collaboration") }),
            /* @__PURE__ */ l.jsx(ee, { id: "settings-agents-heading", fw: 600, children: y("settings.aiAgents") })
          ] })
        ] }) }),
        /* @__PURE__ */ l.jsx(Pe.Panel, { children: /* @__PURE__ */ l.jsxs(ye, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx(ce, { id: "agents", type: "button", leftSection: /* @__PURE__ */ l.jsx("i", { className: "ph ph-plugs-connected", "aria-hidden": "true" }), children: y("agents.dialogTitle") }),
          /* @__PURE__ */ l.jsx(rn, { id: "setting-follow", ref: i, defaultChecked: !0, label: y("agents.followChanges") }),
          /* @__PURE__ */ l.jsx(ee, { size: "sm", c: "dimmed", children: y("agents.followHint") })
        ] }) })
      ] }),
      /* @__PURE__ */ l.jsxs(Pe.Item, { id: "settings-document", className: "settings-section", value: "settings-document", children: [
        /* @__PURE__ */ l.jsx(Pe.Control, { children: /* @__PURE__ */ l.jsxs(Ne, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx("i", { className: "ph ph-file", "aria-hidden": "true" }),
          /* @__PURE__ */ l.jsxs(ye, { gap: 0, children: [
            /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: y("settings.project") }),
            /* @__PURE__ */ l.jsx(ee, { id: "settings-document-heading", fw: 600, children: y("settings.projectActions") })
          ] })
        ] }) }),
        /* @__PURE__ */ l.jsx(Pe.Panel, { children: /* @__PURE__ */ l.jsxs(ye, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx(ce, { id: "rename-project", type: "button", variant: "default", disabled: !0, leftSection: /* @__PURE__ */ l.jsx("i", { className: "ph ph-pencil-simple", "aria-hidden": "true" }), children: y("projects.renameButton") }),
          /* @__PURE__ */ l.jsx(ce, { id: "reload", type: "button", variant: "default", disabled: !0, leftSection: /* @__PURE__ */ l.jsx("i", { className: "ph ph-arrows-clockwise", "aria-hidden": "true" }), children: y("projects.reloadButton") }),
          /* @__PURE__ */ l.jsx(ce, { id: "delete-project", type: "button", color: "red", variant: "light", disabled: !0, leftSection: /* @__PURE__ */ l.jsx("i", { className: "ph ph-trash", "aria-hidden": "true" }), children: y("projects.deleteButton") })
        ] }) })
      ] }),
      /* @__PURE__ */ l.jsxs(Pe.Item, { id: "settings-fonts", className: "settings-section", value: "settings-fonts", children: [
        /* @__PURE__ */ l.jsx(Pe.Control, { children: /* @__PURE__ */ l.jsxs(Ne, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx("i", { className: "ph ph-text-aa", "aria-hidden": "true" }),
          /* @__PURE__ */ l.jsxs(ye, { gap: 0, children: [
            /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: y("settings.workspace") }),
            /* @__PURE__ */ l.jsx(ee, { id: "settings-fonts-heading", fw: 600, children: y("toolbar.fontsButton") })
          ] })
        ] }) }),
        /* @__PURE__ */ l.jsx(Pe.Panel, { children: /* @__PURE__ */ l.jsxs(ye, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx(ee, { className: "hint", size: "sm", c: "dimmed", children: y("fonts.settingsHint") }),
          /* @__PURE__ */ l.jsx(ce, { id: "settings-fonts-open", type: "button", variant: "default", leftSection: /* @__PURE__ */ l.jsx("i", { className: "ph ph-arrow-square-out", "aria-hidden": "true" }), children: y("fonts.openTools") })
        ] }) })
      ] }),
      /* @__PURE__ */ l.jsxs(Pe.Item, { id: "settings-application", className: "settings-section", value: "settings-application", children: [
        /* @__PURE__ */ l.jsx(Pe.Control, { children: /* @__PURE__ */ l.jsxs(Ne, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx("i", { className: "ph ph-gear-six", "aria-hidden": "true" }),
          /* @__PURE__ */ l.jsxs(ye, { gap: 0, children: [
            /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: y("settings.application") }),
            /* @__PURE__ */ l.jsx(ee, { id: "settings-application-heading", fw: 600, children: y("settings.updatesControl") })
          ] })
        ] }) }),
        /* @__PURE__ */ l.jsx(Pe.Panel, { children: /* @__PURE__ */ l.jsxs(ye, { gap: "sm", children: [
          /* @__PURE__ */ l.jsx(vo, { id: "setting-language", ref: c, label: /* @__PURE__ */ l.jsx("span", { "data-i18n": "settings.languageLabel", children: y("settings.languageLabel") }), defaultValue: "en", data: [
            { value: "en", label: y("settings.languageEnglish") },
            { value: "fr", label: y("settings.languageFrench") },
            { value: "de", label: y("settings.languageGerman") }
          ] }),
          /* @__PURE__ */ l.jsx(
            Rt.Wrapper,
            {
              id: "setting-appearance-wrapper",
              label: y("settings.appearance"),
              labelElement: "div",
              labelProps: { id: "setting-appearance-label" },
              children: /* @__PURE__ */ l.jsx(
                vr,
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
          /* @__PURE__ */ l.jsx(rn, { id: "setting-update-check", label: y("updates.dailyCheckSetting") }),
          /* @__PURE__ */ l.jsxs(ee, { size: "sm", c: "dimmed", children: [
            y("updates.dailyCheckBeforeCommand"),
            " ",
            /* @__PURE__ */ l.jsx("code", { children: "assemblash upgrade" }),
            y("updates.dailyCheckAfterCommand")
          ] }),
          /* @__PURE__ */ l.jsx(ee, { id: "update-note", component: "p", size: "sm", c: "dimmed", hidden: !0, "aria-live": "polite" }),
          /* @__PURE__ */ l.jsx(ce, { id: "shutdown", type: "button", color: "red", variant: "light", hidden: !0, leftSection: /* @__PURE__ */ l.jsx("i", { className: "ph ph-power", "aria-hidden": "true" }), children: y("app.stop") })
        ] }) })
      ] })
    ] })
  ] }) }) });
}
function Aw() {
  const e = Tw("settings-dialog-mount"), t = { current: null };
  return Ue("settings", e, /* @__PURE__ */ l.jsx(Pw, { controller: t })), {
    open: (n, o) => t.current?.open(n, o),
    close: () => t.current?.close(),
    isOpen: () => t.current?.isOpen() ?? !1
  };
}
function Iw(e, t) {
  const n = new Set(t), o = e.filter((a) => !n.has(a)), r = e.findIndex((a) => n.has(a)), s = r < 0 ? o.length : e.slice(0, r).filter((a) => !n.has(a)).length;
  return [...o.slice(0, s), ...t, ...o.slice(s)];
}
const os = 64;
class Mw {
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
    if (this.entries.length >= os) throw new RangeError(`at most ${os} tabs`);
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
function Dw(e) {
  const t = { projects: [], active: null };
  if (!e || typeof e != "object" || Array.isArray(e)) return t;
  const n = e.projects;
  if (!Array.isArray(n)) return t;
  const o = [];
  for (const s of n)
    if (!(typeof s != "string" || s.length === 0 || o.includes(s)) && (o.push(s), o.length === os))
      break;
  const r = e.active;
  return {
    projects: o,
    active: typeof r == "string" && o.includes(r) ? r : o[0] ?? null
  };
}
function Ow(e, t) {
  const n = t.trim().toLocaleLowerCase();
  return e.filter((o) => !n || o.toLocaleLowerCase().includes(n));
}
function Lw(e, t, n = os) {
  if (e.length === 0) return { kind: "empty" };
  const o = e.filter((r) => !t.includes(r));
  return t.length + o.length > n ? { kind: "tooMany", count: e.length, max: n } : { kind: "open", pages: [...e], toOpen: o, order: Iw(t, e) };
}
const Al = {
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
function $w({ host: e, controller: t, boundary: n }) {
  const [o, r] = p.useState({
    projects: [],
    query: "",
    currentProject: null
  }), [s, a] = p.useState(""), i = p.useRef(""), [c, u] = p.useState(y("projects.searchPlaceholder")), [f, h] = p.useState(!1), [d, m] = p.useState(-1), [g, v] = p.useState(t.pageSets), w = Fe(), x = p.useRef(null), E = p.useRef(void 0), C = p.useRef(o);
  C.current = o, p.useEffect(() => (t.setProjects = (I) => {
    if (C.current = I, r(I), m(-1), !I.query) {
      const O = I.currentProject ? I.projects.find((D) => D.id === I.currentProject) : void 0;
      u(O?.name ?? O?.id ?? (I.projects.length ? y("projects.searchPlaceholder") : y("projects.none")));
    }
  }, t.setCurrentProject = (I) => {
    const O = C.current, D = { ...O, currentProject: I };
    C.current = D, r(D);
    const z = I ? O.projects.find((M) => M.id === I) : void 0;
    u(z?.name ?? z?.id ?? (O.projects.length ? y("projects.searchPlaceholder") : y("projects.none")));
  }, t.setPageSets = (I) => v(I), v(t.pageSets), t.focus = () => x.current?.focus(), () => {
    window.clearTimeout(E.current), t.setProjects = () => {
    }, t.setCurrentProject = () => {
    }, t.setPageSets = () => {
    }, t.focus = () => {
    };
  }), [t]), p.useEffect(() => {
    if (s) return;
    const I = o.currentProject ? o.projects.find((O) => O.id === o.currentProject) : void 0;
    u(I?.name ?? I?.id ?? (o.projects.length ? y("projects.searchPlaceholder") : y("projects.none")));
  }, [w]), p.useEffect(() => {
    const I = (O) => {
      (!(O.target instanceof Node) || !n.contains(O.target)) && (h(!1), m(-1));
    };
    return document.addEventListener("pointerdown", I), () => document.removeEventListener("pointerdown", I);
  }, [n]);
  function j(I) {
    h(I), I || m(-1);
  }
  function R(I) {
    const O = { ...C.current, currentProject: I.id };
    C.current = O, r(O), u(I.name ?? I.id), i.current = "", a(""), x.current && (x.current.value = ""), x.current?.blur(), j(!1), e.openProject(I.id);
  }
  function T(I) {
    i.current = I, a(I), window.clearTimeout(E.current), E.current = window.setTimeout(() => e.search(I.trim()), 150);
  }
  function S(I) {
    i.current = "", a(""), x.current && (x.current.value = ""), x.current?.blur(), j(!1), e.openPageSet(I);
  }
  const b = Ow(g, s), P = o.projects.length + b.length, L = (I) => I < o.projects.length ? `project-option-${I}` : `page-set-option-${I - o.projects.length}`;
  function $(I) {
    if (f || j(!0), P === 0) return;
    const O = I > 0 ? 0 : P - 1, D = d < 0 ? O : Math.max(0, Math.min(P - 1, d + I));
    m(D), window.requestAnimationFrame(() => {
      document.getElementById(L(D))?.scrollIntoView({ block: "nearest" });
    });
  }
  const F = o.projects.length === 0 && b.length === 0 ? o.query ? y("projects.noMatching") : y("projects.none") : "", B = f && d >= 0 && d < P ? L(d) : void 0;
  return /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
    /* @__PURE__ */ l.jsx("i", { className: "ph ph-magnifying-glass", "aria-hidden": "true" }),
    /* @__PURE__ */ l.jsx(
      dt,
      {
        id: "project-search",
        "data-current-project": o.currentProject ?? "",
        ref: x,
        type: "search",
        autoComplete: "off",
        defaultValue: "",
        placeholder: c,
        "aria-label": y("projects.searchPlaceholder"),
        "aria-controls": "project-options",
        "aria-expanded": f,
        "aria-autocomplete": "list",
        "aria-activedescendant": B,
        role: "combobox",
        onChange: (I) => T(I.currentTarget.value),
        onFocus: () => j(!0),
        onKeyDown: (I) => {
          if (I.key === "ArrowDown" || I.key === "ArrowUp") {
            I.preventDefault(), $(I.key === "ArrowDown" ? 1 : -1);
            return;
          }
          if (I.key === "Escape") {
            j(!1);
            return;
          }
          if (I.key !== "Enter") return;
          const O = x.current?.value ?? i.current;
          O !== i.current && (i.current = O, a(O));
          const D = d >= o.projects.length ? b[d - o.projects.length] : void 0;
          if (D) {
            I.preventDefault(), S(D);
            return;
          }
          const z = o.projects[d], M = O.trim().toLocaleLowerCase(), _ = o.projects.find(
            (H) => H.id.toLocaleLowerCase() === M || (H.name ?? H.id).toLocaleLowerCase() === M
          ) ?? z;
          _ && (I.preventDefault(), R(_));
        }
      }
    ),
    /* @__PURE__ */ l.jsx(
      ce,
      {
        id: "project-picker-toggle",
        className: "project-picker-toggle",
        type: "button",
        variant: "subtle",
        "aria-label": y("projects.showButton"),
        "aria-controls": "project-options",
        "aria-expanded": f,
        onClick: () => {
          const I = !f;
          j(I), I && x.current?.focus();
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
        "aria-label": y("projects.optionsLabel"),
        hidden: !f,
        children: [
          o.projects.map((I, O) => /* @__PURE__ */ l.jsxs(
            ce,
            {
              id: `project-option-${O}`,
              className: `project-option${O === d ? " active" : ""}`,
              styles: Al,
              type: "button",
              variant: "subtle",
              title: I.name ?? I.id,
              "data-project-id": I.id,
              role: "option",
              "aria-selected": I.id === o.currentProject,
              onClick: () => R(I),
              children: [
                /* @__PURE__ */ l.jsx("strong", { children: I.name ?? I.id }),
                /* @__PURE__ */ l.jsx(
                  "span",
                  {
                    className: "project-option-count",
                    "data-i18n-count": "projects.layerCount",
                    "data-count": String(I.layers),
                    children: Ot("projects.layerCount", I.layers)
                  }
                )
              ]
            },
            I.id
          )),
          b.length > 0 ? /* @__PURE__ */ l.jsx("p", { className: "project-options-heading", role: "presentation", children: y("pageSets.heading") }) : null,
          b.map((I, O) => /* @__PURE__ */ l.jsxs(
            ce,
            {
              id: `page-set-option-${O}`,
              className: `project-option page-set-option${o.projects.length + O === d ? " active" : ""}`,
              styles: Al,
              type: "button",
              variant: "subtle",
              title: y("pageSets.openLabel", { set: I }),
              "data-page-set": I,
              role: "option",
              "aria-selected": !1,
              onClick: () => S(I),
              children: [
                /* @__PURE__ */ l.jsxs("strong", { children: [
                  /* @__PURE__ */ l.jsx("i", { className: "ph ph-files", "aria-hidden": "true" }),
                  " ",
                  I
                ] }),
                /* @__PURE__ */ l.jsx("span", { className: "project-option-count", children: y("pageSets.option") })
              ]
            },
            `set:${I}`
          )),
          F ? /* @__PURE__ */ l.jsx("p", { className: "project-options-empty", children: F }) : null
        ]
      }
    )
  ] });
}
function zw(e, t) {
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
    /* @__PURE__ */ l.jsx($w, { host: e, controller: n, boundary: t })
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
function _w(e) {
  const t = window.document.getElementById(e);
  if (!t) throw new Error(`missing element #${e}`);
  return t;
}
function Il(e) {
  return e.kind ?? "text";
}
function Fw({ host: e, projectController: t }) {
  const [n, o] = p.useState([]), [r, s] = p.useState(() => /* @__PURE__ */ new Map()), [a, i] = p.useState([]), [c, u] = p.useState(""), [f, h] = p.useState([]), [d, m] = p.useState(!1), [g, v] = p.useState(!1);
  Fe();
  const [w, x] = p.useState(null), E = p.useRef([]), C = p.useRef(d);
  C.current = d;
  const j = p.useRef(null), R = p.useRef(null);
  function T() {
    for (const O of E.current) URL.revokeObjectURL(O);
    E.current = [];
  }
  function S() {
    const O = {};
    for (const D of n) {
      const z = r.get(D.name);
      z && (O[D.name] = z);
    }
    return O;
  }
  function b(O, D) {
    s((z) => new Map(z).set(O, D));
  }
  async function P(O, D) {
    T(), h([]);
    const z = [];
    for (const M of D.variants) {
      const A = await Fn(Hf(O, M.name));
      E.current.push(A), z.push({ variant: M, url: A });
    }
    h(z);
  }
  async function L(O, D) {
    await e.guard(O, async () => {
      const z = e.project();
      if (!z) return;
      const M = await Vb(z, D);
      await P(z, M), e.say(Ot("templates.renderedCount", M.variants.length, {
        what: O,
        version: Re(M.templateVersion)
      }));
    });
  }
  async function $(O = null) {
    const D = e.project();
    if (s(/* @__PURE__ */ new Map()), i([]), u(""), T(), h([]), !D) {
      o([]), C.current = !1, m(!1);
      return;
    }
    const z = await Bb(D), M = z.isTemplate ? z.slots : [];
    o(M), C.current = M.length > 0, m(M.length > 0);
    const A = /* @__PURE__ */ new Map();
    for (const _ of M)
      Il(_) === "color" && A.set(_.name, "#000000");
    if (O) {
      for (const [_, H] of O.values)
        M.some((W) => W.name === _) && A.set(_, H);
      i([...O.batch]), u(O.variantName);
    }
    s(A);
  }
  p.useLayoutEffect(() => {
    t.current = {
      projectChanged: $,
      draft: () => ({ values: new Map(r), batch: [...a], variantName: c }),
      setOpen: v,
      isVisible: () => C.current
    };
  }), p.useEffect(() => () => {
    t.current = null, T();
  }, [t]);
  async function F(O) {
    const D = O.currentTarget.files?.[0];
    O.currentTarget.value = "", D && await e.guard(y("templates.loadValues"), async () => {
      const z = JSON.parse(await D.text());
      if (!Array.isArray(z)) throw new Error(y("templates.expectedArray"));
      const M = [];
      for (const A of z) {
        const _ = A;
        if (typeof _.name != "string") throw new Error(y("templates.missingName"));
        const H = {};
        for (const [W, Y] of Object.entries(_.values ?? {})) H[W] = String(Y);
        M.push({ name: _.name, values: H });
      }
      i(M), e.say(Ot("templates.loadedVariants", M.length, { file: D.name }));
    });
  }
  async function B(O) {
    const D = O.currentTarget.files?.[0];
    O.currentTarget.value = "";
    const z = w;
    x(null), !(!D || !z) && await e.guard(y("templates.importImage"), async () => {
      const M = e.project();
      if (!M) return;
      const A = await Zi(M, D);
      b(z, A.asset.id), await e.refresh(), s((_) => new Map(_)), e.say(y("templates.importedImage", { file: D.name, slot: z }));
    });
  }
  const I = e.document()?.assets ?? [];
  return /* @__PURE__ */ l.jsxs(ye, { component: "section", id: "templates", className: g ? "templates open" : "templates", hidden: !d, gap: "md", "aria-label": y("templates.drawerLabel"), children: [
    /* @__PURE__ */ l.jsxs(Ne, { justify: "space-between", align: "flex-start", children: [
      /* @__PURE__ */ l.jsxs("div", { children: [
        /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: y("templates.workspace") }),
        /* @__PURE__ */ l.jsx(ee, { component: "h2", fw: 700, children: y("templates.buildVariants") })
      ] }),
      /* @__PURE__ */ l.jsx(ce, { id: "templates-close", type: "button", variant: "subtle", title: y("templates.close"), "aria-label": y("common.close"), children: "×" })
    ] }),
    /* @__PURE__ */ l.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 18rem), 1fr))", gap: "var(--mantine-spacing-md)" }, children: [
      /* @__PURE__ */ l.jsxs(ye, { gap: "sm", children: [
        /* @__PURE__ */ l.jsx(ee, { component: "h3", fw: 600, children: y("templates.fillSlots") }),
        /* @__PURE__ */ l.jsx(ye, { id: "slot-form", gap: "sm", children: n.map((O) => {
          const D = Il(O), z = r.get(O.name) ?? (D === "color" ? "#000000" : "");
          return /* @__PURE__ */ l.jsxs(ye, { gap: 4, "data-slot": O.name, children: [
            D === "image" ? /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
              /* @__PURE__ */ l.jsx(uo, { label: `${O.name}${O.required ? " *" : ""}`, title: O.description ?? void 0, "data-slot": O.name, value: r.get(O.name) ?? "", onChange: (M) => b(O.name, M ?? ""), data: [{ value: "", label: y(I.length ? "templates.leaveAsIs" : "templates.noImages") }, ...I.map((M) => ({ value: M.id, label: M.path }))] }),
              /* @__PURE__ */ l.jsx(ce, { type: "button", size: "xs", variant: "default", onClick: () => {
                x(O.name), j.current?.click();
              }, children: y("templates.importButton") })
            ] }) : D === "color" ? /* @__PURE__ */ l.jsx(dt, { type: "color", label: `${O.name}${O.required ? " *" : ""}`, title: O.description ?? void 0, "data-slot": O.name, value: z, onChange: (M) => b(O.name, M.currentTarget.value) }) : /* @__PURE__ */ l.jsx(dt, { label: `${O.name}${O.required ? " *" : ""}`, title: O.description ?? void 0, "data-slot": O.name, value: z, onChange: (M) => b(O.name, M.currentTarget.value) }),
            O.description && /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: O.description })
          ] }, O.name);
        }) }),
        /* @__PURE__ */ l.jsx("input", { ref: j, id: "slot-image-file", type: "file", accept: "image/*,.svg", hidden: !0, onChange: (O) => {
          B(O);
        } }),
        /* @__PURE__ */ l.jsxs(Ne, { align: "end", wrap: "wrap", children: [
          /* @__PURE__ */ l.jsx(ce, { id: "preview-variant", type: "button", onClick: () => {
            L(y("templates.preview"), [{ name: "preview", values: S() }]);
          }, children: y("templates.preview") }),
          /* @__PURE__ */ l.jsx(dt, { id: "variant-name", label: y("templates.variantName"), value: c, onChange: (O) => u(O.currentTarget.value) }),
          /* @__PURE__ */ l.jsx(ce, { id: "add-variant", type: "button", variant: "default", onClick: () => {
            const O = c.trim();
            if (!O) {
              e.say(y("templates.variantNameRequired"), "error");
              return;
            }
            i((D) => [...D, { name: O, values: S() }]), u(""), e.say(y("templates.addedToBatch", { name: O }));
          }, children: y("templates.addToBatch") })
        ] })
      ] }),
      /* @__PURE__ */ l.jsxs(ye, { gap: "sm", children: [
        /* @__PURE__ */ l.jsx(ee, { component: "h3", fw: 600, children: y("templates.batch") }),
        /* @__PURE__ */ l.jsx(ye, { component: "ol", id: "variant-rows", gap: "xs", m: 0, p: 0, children: a.map((O, D) => /* @__PURE__ */ l.jsx(ho, { component: "li", withBorder: !0, p: "xs", children: /* @__PURE__ */ l.jsxs(Ne, { justify: "space-between", align: "flex-start", wrap: "nowrap", children: [
          /* @__PURE__ */ l.jsxs(ye, { gap: 2, style: { minWidth: 0 }, children: [
            /* @__PURE__ */ l.jsx(ee, { fw: 600, children: O.name }),
            /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: Object.entries(O.values).map(([z, M]) => `${z}=${M}`).join("  ") })
          ] }),
          /* @__PURE__ */ l.jsx(ce, { type: "button", size: "xs", variant: "subtle", onClick: () => i((z) => z.filter((M, A) => A !== D)), children: y("templates.removeButton") })
        ] }) }, `${D}-${O.name}`)) }),
        /* @__PURE__ */ l.jsx("input", { ref: R, id: "values-file", type: "file", accept: "application/json,.json", hidden: !0, onChange: (O) => {
          F(O);
        } }),
        /* @__PURE__ */ l.jsxs(Ne, { wrap: "wrap", children: [
          /* @__PURE__ */ l.jsx(ce, { id: "load-values", type: "button", variant: "default", onClick: () => R.current?.click(), children: y("templates.loadJson") }),
          /* @__PURE__ */ l.jsx(ce, { id: "render-batch", type: "button", disabled: !a.length, onClick: () => {
            L(y("templates.renderBatch"), a);
          }, children: a.length ? Ot("templates.renderVariants", a.length) : y("templates.renderBatch") }),
          /* @__PURE__ */ l.jsx(ce, { id: "clear-batch", type: "button", variant: "default", disabled: !a.length, onClick: () => i([]), children: y("templates.clear") })
        ] })
      ] }),
      /* @__PURE__ */ l.jsxs(ye, { gap: "sm", children: [
        /* @__PURE__ */ l.jsx(ee, { component: "h3", fw: 600, children: y("templates.renderedVariants") }),
        /* @__PURE__ */ l.jsx("div", { id: "gallery", style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))", gap: "var(--mantine-spacing-sm)" }, children: f.map(({ variant: O, url: D }) => /* @__PURE__ */ l.jsxs(ho, { component: "figure", withBorder: !0, p: "sm", m: 0, children: [
          /* @__PURE__ */ l.jsx("img", { src: D, alt: y("templates.variantAlt", { name: O.name }), style: { display: "block", width: "100%", height: "auto" } }),
          /* @__PURE__ */ l.jsxs(ye, { component: "figcaption", gap: 4, mt: "sm", children: [
            /* @__PURE__ */ l.jsx(ee, { component: "strong", children: O.name }),
            /* @__PURE__ */ l.jsx(ee, { size: "xs", children: y("templates.bytesSize", { width: Re(O.width), height: Re(O.height), bytes: Re(O.bytes) }) }),
            /* @__PURE__ */ l.jsx(ee, { component: "code", size: "xs", title: O.hash, children: O.hash.replace(/^sha256:/, "").slice(0, 12) }),
            /* @__PURE__ */ l.jsx(ce, { component: "a", href: D, download: `${O.name}.png`, variant: "default", size: "xs", children: y("templates.downloadButton") })
          ] })
        ] }, `${O.name}-${O.hash}`)) })
      ] })
    ] })
  ] });
}
function Bw(e) {
  const t = _w("templates-mantine-mount"), n = { current: null };
  return Ue("templates", t, /* @__PURE__ */ l.jsx(Fw, { host: e, projectController: n })), {
    projectChanged: async (o) => {
      await n.current?.projectChanged(o);
    },
    draft: () => n.current?.draft() ?? { values: /* @__PURE__ */ new Map(), batch: [], variantName: "" },
    setOpen: (o) => n.current?.setOpen(o),
    isVisible: () => n.current?.isVisible() ?? !1
  };
}
const Vw = {
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
function Ml(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function An(e, t = "?") {
  return typeof e == "string" && e.length > 0 ? e : t;
}
function Hw(e) {
  const t = Vw[e.code];
  if (t) return y(t);
  const n = Ml(e.details);
  switch (e.code) {
    case "pageSetNotFound":
      return y("refusals.pageSetNotFound", { set: An(n.name) });
    case "pageSetMalformed":
      return y("refusals.pageSetMalformed", { set: An(n.set) });
    case "pageSetMemberMissing": {
      const r = (Array.isArray(n.missing) ? n.missing : []).map((s) => An(Ml(s).name)).join(", ");
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
function Dl(e, t) {
  return !!(e?.group && t?.group && e.group.set === t.group.set);
}
const da = "application/x-assemblash-tab";
function Uw({ host: e, bind: t }) {
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
      "aria-label": y("tabs.label"),
      title: y("tabs.reorderHint"),
      onDragLeave: (d) => {
        d.currentTarget.contains(d.relatedTarget) || s(null);
      },
      children: n.map((d, m) => {
        const g = d.group, v = !!g && !Dl(n[m - 1], d), w = !!g && !Dl(d, n[m + 1]), x = g ? y("tabs.page", { page: g.page, count: g.count, set: g.set }) : "", E = [d.name, x, d.changed ? y("tabs.changed") : ""].filter(Boolean).join(" — ");
        return /* @__PURE__ */ l.jsxs(
          "div",
          {
            className: "project-tab",
            "data-active": d.active || void 0,
            "data-changed": d.changed || void 0,
            "data-page-set": g?.set,
            "data-page-number": g?.page,
            "data-group-start": v || void 0,
            "data-group-end": w || void 0,
            "data-drop": r === m ? "before" : r === m + 1 && m === n.length - 1 ? "after" : void 0,
            draggable: !0,
            onDragStart: (C) => {
              C.dataTransfer.setData(da, d.id), C.dataTransfer.effectAllowed = "move";
            },
            onDragOver: (C) => {
              C.dataTransfer.types.includes(da) && (C.preventDefault(), C.dataTransfer.dropEffect = "move", s(h(C, m)));
            },
            onDrop: (C) => {
              const j = C.dataTransfer.getData(da);
              if (s(null), !j) return;
              C.preventDefault();
              const R = n.findIndex((S) => S.id === j);
              let T = h(C, m);
              R >= 0 && R < T && (T -= 1), e.move(j, T);
            },
            onDragEnd: () => s(null),
            children: [
              v && g ? /* @__PURE__ */ l.jsxs("span", { className: "project-tab-group-label", "data-group-label": g.set, title: y("tabs.groupLabel", { set: g.set }), children: [
                /* @__PURE__ */ l.jsx("i", { className: "ph ph-files", "aria-hidden": "true" }),
                g.set
              ] }) : null,
              /* @__PURE__ */ l.jsxs(
                $n,
                {
                  className: "project-tab-button",
                  role: "tab",
                  id: `project-tab-${d.id}`,
                  "data-tab-id": d.id,
                  "aria-selected": d.active,
                  tabIndex: d.active ? 0 : -1,
                  title: E,
                  onClick: () => e.activate(d.id),
                  onAuxClick: (C) => f(C, d.id),
                  onMouseDown: (C) => {
                    C.button === 1 && C.preventDefault();
                  },
                  onKeyDown: (C) => u(C, m, d),
                  children: [
                    g ? /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
                      /* @__PURE__ */ l.jsx("span", { className: "project-tab-page", "data-tab-page": g.page, "aria-hidden": "true", children: g.page }),
                      /* @__PURE__ */ l.jsx("span", { className: "project-tab-thumb", "aria-hidden": "true", children: d.thumbnail ? /* @__PURE__ */ l.jsx("img", { src: d.thumbnail, alt: "", "data-tab-thumbnail": d.id, draggable: !1 }) : null })
                    ] }) : null,
                    /* @__PURE__ */ l.jsx("span", { className: "project-tab-name", children: d.name }),
                    x ? /* @__PURE__ */ l.jsx("span", { className: "sr-only", children: `, ${x}` }) : null,
                    d.changed ? /* @__PURE__ */ l.jsx("span", { className: "project-tab-marker", "data-tab-marker": d.id, role: "img", "aria-label": y("tabs.changed") }) : null
                  ]
                }
              ),
              /* @__PURE__ */ l.jsx(
                ri,
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
function Ww(e, t) {
  let n = [], o = null;
  const r = (s) => {
    o = s, s(n);
  };
  return Ue("project-tabs", t, /* @__PURE__ */ l.jsx(Uw, { host: e, bind: r })), {
    setTabs(s) {
      n = s, o?.(s);
    }
  };
}
const Fo = (e) => /* @__PURE__ */ l.jsx("i", { className: `ph ${e}`, "aria-hidden": "true" });
function rs(e) {
  return e.name ?? (e.type === "text" ? e.text : e.type) ?? e.type;
}
function qw(e) {
  return e.type === "shape" ? { rect: "ph-square", ellipse: "ph-circle", line: "ph-line-segment", path: "ph-bezier-curve" }[Vf(e) ?? ""] ?? "ph-shapes" : { text: "ph-text-t", image: "ph-image", svg: "ph-pen-nib", group: "ph-stack" }[e.type] ?? "ph-square";
}
function Kw({ layer: e, finish: t }) {
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
      defaultValue: rs(e),
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
function Xw({ layer: e, depth: t, parent: n, inheritedGuard: o, snapshot: r, commands: s, elementProps: a, renaming: i, startRename: c, finishRename: u, expanded: f, hasChildren: h, toggleExpanded: d }) {
  const [m, g] = p.useState(!1), [v, w] = p.useState(!1), x = p.useRef(null);
  p.useEffect(() => () => {
    x.current && clearTimeout(x.current.timer);
  }, []);
  const E = r.selectedIds.includes(e.id), C = !o && tr(e), j = o || !!ts(e), R = !o && !e.protected && !e.readOnly, T = (b, P) => {
    E || s.select(e.id, !1), s.contextMenu?.(e.id, b, P);
  }, S = () => {
    x.current && clearTimeout(x.current.timer);
  };
  return /* @__PURE__ */ l.jsx(
    Q,
    {
      ...a,
      className: `${a.className} layer${E ? " selected" : ""}${j ? " guarded" : ""}${e.visible === !1 ? " hidden-layer" : ""}${m ? " dragging" : ""}${v ? " drop-target" : ""}`,
      "data-id": e.id,
      "data-type": e.type,
      "data-parent": n ?? "",
      style: { ...a.style, "--layer-depth": t, paddingInlineStart: 8 + t * 16 },
      draggable: C,
      onClick: (b) => {
        if (x.current?.fired) {
          x.current = null;
          return;
        }
        a.onClick(b), s.select(e.id, b.shiftKey || b.ctrlKey || b.metaKey);
      },
      onContextMenu: (b) => {
        b.preventDefault(), T(b.clientX, b.clientY);
      },
      onPointerDown: (b) => {
        if (b.pointerType !== "touch" || !s.contextMenu) return;
        S();
        const P = b.clientX, L = b.clientY;
        x.current = { x: P, y: L, fired: !1, timer: setTimeout(() => {
          x.current && (x.current.fired = !0), T(P, L);
        }, 450) };
      },
      onPointerMove: (b) => {
        x.current && Math.hypot(b.clientX - x.current.x, b.clientY - x.current.y) > 8 && S();
      },
      onPointerUp: S,
      onPointerCancel: S,
      onDragStart: (b) => {
        b.dataTransfer.setData("text/plain", e.id), g(!0);
      },
      onDragEnd: () => {
        g(!1), w(!1);
      },
      onDragOver: (b) => {
        b.preventDefault(), w(!0);
      },
      onDragLeave: () => w(!1),
      onDrop: (b) => {
        b.preventDefault(), w(!1);
        const P = b.dataTransfer.getData("text/plain");
        if (!P || P === e.id || !r.document) return;
        const L = Be(Le(r.document)), $ = n ? L.find((I) => I.layer.id === n)?.layer : null, F = $?.type === "group" ? $.children ?? [] : Le(r.document), B = Math.max(0, F.findIndex((I) => I.id === e.id) + 1);
        s.reorder(P, e.id, e.type === "group" ? { at: "in", parent: e.id } : n ? { at: "in", parent: n, index: B } : { at: "root", index: B });
      },
      children: /* @__PURE__ */ l.jsxs(Ne, { gap: "xs", wrap: "nowrap", children: [
        h ? /* @__PURE__ */ l.jsx(
          Ho,
          {
            className: "layer-control",
            size: "sm",
            variant: "subtle",
            "data-layer-toggle": e.id,
            title: y(f ? "layers.collapseGroup" : "layers.expandGroup"),
            "aria-label": y(f ? "layers.collapseGroup" : "layers.expandGroup"),
            "aria-expanded": f,
            onClick: (b) => {
              b.stopPropagation(), d();
            },
            children: Fo(f ? "ph-caret-down" : "ph-caret-right")
          }
        ) : null,
        /* @__PURE__ */ l.jsx(
          Ho,
          {
            className: "layer-control",
            size: "sm",
            variant: "subtle",
            disabled: !C,
            title: y(e.visible === !1 ? "layers.show" : "layers.hide"),
            "aria-label": y(e.visible === !1 ? "layers.show" : "layers.hide"),
            onClick: (b) => {
              b.stopPropagation(), s.toggleVisibility(e.id);
            },
            children: Fo(e.visible === !1 ? "ph-eye-slash" : "ph-eye")
          }
        ),
        /* @__PURE__ */ l.jsx(Q, { className: "layer-icon", children: Fo(qw(e)) }),
        /* @__PURE__ */ l.jsx(Q, { style: { flex: 1, minWidth: 0 }, children: i ? /* @__PURE__ */ l.jsx(Kw, { layer: e, finish: (b) => {
          u(), b !== null && b !== (e.name ?? "") && s.rename(e.id, b);
        } }) : /* @__PURE__ */ l.jsx(
          ee,
          {
            component: "span",
            className: "name",
            size: "sm",
            truncate: !0,
            title: ts(e) ?? y("layers.renameHint"),
            onDoubleClick: (b) => {
              b.stopPropagation(), C && c();
            },
            children: rs(e)
          }
        ) }),
        /* @__PURE__ */ l.jsx(
          Ho,
          {
            className: "layer-control",
            size: "sm",
            variant: "subtle",
            disabled: !R,
            title: y(e.locked ? "layers.unlock" : "layers.lock"),
            "aria-label": y(e.locked ? "layers.unlock" : "layers.lock"),
            onClick: (b) => {
              b.stopPropagation(), s.toggleLocked(e.id);
            },
            children: Fo(e.locked ? "ph-lock" : "ph-lock-open")
          }
        )
      ] })
    }
  );
}
function Yw({ snapshot: e, commands: t }) {
  Fe();
  const [n, o] = p.useState(null), [r, s] = p.useState({}), a = e.document ? Le(e.document) : [], i = p.useMemo(() => {
    const h = e.query.trim().toLowerCase(), d = (g) => rs(g).toLowerCase().includes(h) || g.type === "group" && (g.children ?? []).some(d), m = (g, v, w) => [...g].reverse().filter((x) => !h || d(x)).map((x) => ({
      value: x.id,
      label: rs(x),
      layer: x,
      parent: v,
      guarded: w,
      ...x.type === "group" ? { children: m(x.children ?? [], x.id, w || !tr(x)) } : {}
    }));
    return m(e.document ? Le(e.document) : [], null, !1);
  }, [e.document, e.query]), c = p.useMemo(() => {
    const h = /* @__PURE__ */ new Map(), d = (m) => {
      for (const g of m)
        h.set(g.value, g), g.children && d(g.children);
    };
    return d(i), h;
  }, [i]), u = p.useMemo(() => Object.fromEntries([...c.keys()].map((h) => [h, r[h] ?? !0])), [c, r]), f = Of({
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
    _s,
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
        const m = c.get(d.dataset.value ?? "");
        if (m && (h.key === "F2" && (h.preventDefault(), h.stopPropagation(), !m.guarded && tr(m.layer) && o(m.value)), (h.key === "Enter" || h.key === " ") && (h.preventDefault(), h.stopPropagation(), t.select(m.value, h.shiftKey || h.ctrlKey || h.metaKey)), h.key === "F10" && h.shiftKey)) {
          h.preventDefault(), h.stopPropagation(), e.selectedIds.includes(m.value) || t.select(m.value, !1);
          const g = (d.classList.contains("layer") ? d : d.querySelector(".layer")).getBoundingClientRect();
          t.contextMenu?.(m.value, g.left + 24, g.top + 24);
        }
      },
      renderNode: ({ node: h, level: d, elementProps: m, expanded: g, hasChildren: v }) => {
        const { layer: w, parent: x, guarded: E } = h;
        return /* @__PURE__ */ l.jsx(
          Xw,
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
  ) : /* @__PURE__ */ l.jsx(Q, { component: "ul", id: "layers", role: "tree", "aria-label": y("layers.tab"), m: 0, p: 0, style: { listStyle: "none" }, children: /* @__PURE__ */ l.jsx(Q, { component: "li", className: `layers-empty${a.length ? " compact" : ""}`, p: "md", children: /* @__PURE__ */ l.jsxs(ye, { gap: "xs", align: "center", children: [
    /* @__PURE__ */ l.jsx(Q, { children: Fo(a.length ? "ph-magnifying-glass" : "ph-stack-simple") }),
    /* @__PURE__ */ l.jsx(ee, { fw: 600, children: y(a.length ? "layers.noMatching" : "layers.none") }),
    /* @__PURE__ */ l.jsx(ee, { size: "sm", c: "dimmed", children: y(a.length ? "layers.trySearch" : "layers.emptyHint") })
  ] }) }) });
}
function Gw({ snapshot: e }) {
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
function Jw({ snapshot: e, commands: t }) {
  Fe();
  const [n, o] = p.useState(e.dock ?? "properties");
  p.useEffect(() => {
    e.dock && o(e.dock);
  }, [e.dock]);
  const r = e.document ? Be(Le(e.document)) : [], s = r.filter((c) => e.selectedIds.includes(c.layer.id)), a = s.length > 0 && s.every((c) => {
    if (!tr(c.layer)) return !1;
    let u = c.parent;
    for (; u; ) {
      const f = r.find((h) => h.layer.id === u);
      if (!f || !tr(f.layer)) return !1;
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
          /* @__PURE__ */ l.jsx(ht.Tab, { id: "properties-tab", value: "properties", children: y("properties.tab") }),
          /* @__PURE__ */ l.jsx(ht.Tab, { id: "layers-tab", value: "layers", children: y("layers.tab") }),
          /* @__PURE__ */ l.jsx(ht.Tab, { id: "history-tab", value: "history", children: y("history.tab") })
        ] }),
        /* @__PURE__ */ l.jsx(ht.Panel, { value: "properties", id: "properties-panel", className: "dock-view", children: /* @__PURE__ */ l.jsx("div", { id: "advanced-inspector" }) }),
        /* @__PURE__ */ l.jsx(ht.Panel, { value: "layers", id: "layers-view", className: "dock-view", children: /* @__PURE__ */ l.jsxs(ye, { className: "layers-content", gap: "sm", p: "sm", children: [
          /* @__PURE__ */ l.jsx(
            dt,
            {
              id: "layer-search",
              value: e.query,
              disabled: Ol(e.document),
              placeholder: y(Ol(e.document) ? "layers.noSearch" : "layers.searchPlaceholder"),
              "aria-label": y("layers.searchPlaceholder"),
              onChange: (c) => t.setQuery(c.currentTarget.value)
            }
          ),
          /* @__PURE__ */ l.jsx(Yw, { snapshot: e, commands: t }),
          /* @__PURE__ */ l.jsxs(Ne, { gap: "xs", children: [
            /* @__PURE__ */ l.jsx(ce, { id: "group-layers", variant: "default", size: "xs", disabled: !a || s.length < 2, onClick: t.groupSelection, children: y("layers.groupButton") }),
            /* @__PURE__ */ l.jsx(ce, { id: "delete-layer", variant: "light", color: "red", size: "xs", disabled: !a, onClick: t.deleteSelection, children: y("layers.deleteButton") })
          ] })
        ] }) }),
        /* @__PURE__ */ l.jsx(ht.Panel, { value: "history", id: "history-view", className: "dock-view", children: /* @__PURE__ */ l.jsx(Gw, { snapshot: e }) })
      ]
    }
  );
}
function Ol(e) {
  return !e || Le(e).length === 0;
}
function Zw(e, t, n) {
  let o = (a) => {
  };
  function r() {
    const [a, i] = p.useState(t);
    return p.useEffect(() => (o = (c) => i({ ...c }), () => {
      o = () => {
      };
    }), []), /* @__PURE__ */ l.jsx(Jw, { snapshot: a, commands: n });
  }
  const s = Ue("structure", e, /* @__PURE__ */ l.jsx(r, {}));
  return { setSnapshot: (a) => o(a), destroy: s };
}
function Qw(e) {
  return typeof e == "string" ? e : JSON.stringify(e, null, 2);
}
function ss(e) {
  return Array.isArray(e) ? `[${e.map(ss).join(",")}]` : e && typeof e == "object" ? `{${Object.keys(e).sort().map(
    (t) => `${JSON.stringify(t)}:${ss(e[t])}`
  ).join(",")}}` : JSON.stringify(e);
}
function Ll(e, t) {
  if (typeof e == "string" && typeof t == "string") {
    const n = (o) => {
      const r = /^#([\da-f]{6})([\da-f]{2})?$/i.exec(o);
      return r ? `${r[1].toLowerCase()}${(r[2] ?? "ff").toLowerCase()}` : o;
    };
    return n(e) === n(t);
  }
  return ss(e) === ss(t);
}
function Yf({ id: e, label: t, value: n, className: o, compact: r = !1, disabled: s = !1, onCommit: a, clear: i }) {
  Fe();
  const c = typeof n == "string" ? n : "#000000", [u, f] = p.useState(typeof n == "string" ? "solid" : "json"), [h, d] = p.useState(c), [m, g] = p.useState(Qw(n)), [v, w] = p.useState(""), [x, E] = p.useState(!1), C = p.useRef(n);
  function j(b) {
    let P = b.trim();
    /^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(P) && (typeof C.current == "string" && /^#[\da-f]{6}$/i.test(C.current) && /^#([\da-f]{6})ff$/i.test(P) && (P = P.slice(0, 7)), w(""), !Ll(C.current, P) && (C.current = P, a(P)));
  }
  function R() {
    let b;
    try {
      b = JSON.parse(m);
    } catch {
      w(y("paint.jsonSyntaxError"));
      return;
    }
    if (!b || typeof b != "object" || Array.isArray(b) || !("kind" in b)) {
      w(y("paint.jsonObjectError"));
      return;
    }
    w("");
    const P = b;
    Ll(C.current, P) || (C.current = P, a(P));
  }
  const T = /* @__PURE__ */ l.jsxs(ye, { gap: "xs", className: "paint-input", "data-paint-editor": e, children: [
    /* @__PURE__ */ l.jsx(
      vr,
      {
        "aria-label": t,
        value: u,
        onChange: (b) => f(b),
        data: [
          { value: "solid", label: y("paint.solid") },
          { value: "json", label: y("paint.json") }
        ],
        disabled: s,
        size: "xs"
      }
    ),
    u === "solid" ? /* @__PURE__ */ l.jsxs(Ne, { align: "end", wrap: "nowrap", gap: "xs", children: [
      /* @__PURE__ */ l.jsx(
        mr,
        {
          id: `${e}-solid`,
          classNames: o ? { input: o } : void 0,
          label: t,
          value: h,
          format: "hexa",
          fixOnBlur: !1,
          disabled: s,
          onChange: (b) => d(b),
          onChangeEnd: j,
          onBlur: (b) => j(b.currentTarget.value),
          "aria-label": t,
          "data-paint-solid": e,
          style: { flex: 1 }
        }
      ),
      i ? /* @__PURE__ */ l.jsx(
        ce,
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
        go,
        {
          id: `${e}-json`,
          classNames: { input: o ? `${o} paint-json` : "paint-json" },
          label: t,
          value: m,
          onChange: (b) => g(b.currentTarget.value),
          minRows: 4,
          autosize: !0,
          disabled: s,
          error: v || void 0,
          "aria-label": t,
          "data-paint-json": e
        }
      ),
      /* @__PURE__ */ l.jsxs(Ne, { justify: "space-between", align: "center", children: [
        /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: y("paint.jsonHint") }),
        /* @__PURE__ */ l.jsxs(Ne, { gap: "xs", children: [
          /* @__PURE__ */ l.jsx(ce, { id: `${e}-apply-json`, type: "button", size: "xs", variant: "light", disabled: s, onClick: R, children: y("paint.applyJson") }),
          i ? /* @__PURE__ */ l.jsx(
            ce,
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
          Ho,
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
            onClick: () => E((b) => !b),
            children: /* @__PURE__ */ l.jsx("span", { className: "paint-swatch", "aria-hidden": "true", style: S })
          }
        ) }),
        /* @__PURE__ */ l.jsx(He.Dropdown, { className: "paint-popover", "data-paint-popover": e, children: T })
      ]
    }
  );
}
let ex = 0;
function tx(e, t) {
  return Ue(`paint-${++ex}`, e, /* @__PURE__ */ l.jsx(Yf, { ...t }));
}
let Gf = 0;
function ec(e) {
  return JSON.stringify([e.project, e.document, e.layer]);
}
function Jf(e) {
  const t = e.runs.every($a) && e.runs.map((n) => n.text).join("") === e.text;
  return { capture: structuredClone(e), rows: e.runs.map((n) => ({ key: ++Gf, raw: structuredClone(n), legacy: !t || !$a(n) })), error: "", pending: !1 };
}
function $l(e = "") {
  return { key: ++Gf, raw: { text: e } };
}
function Hr(e) {
  return !e.legacy && !!e.raw && typeof e.raw == "object" && !Array.isArray(e.raw) && typeof e.raw.text == "string";
}
function $a(e) {
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
  return !(n != null && !nx(n));
}
function nx(e) {
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
function ox(e, t, n) {
  const o = structuredClone(e);
  return n === void 0 ? delete o[t] : o[t] = structuredClone(n), o;
}
function so(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function fa(e, t) {
  return Object.fromEntries(Object.entries(structuredClone(e)).filter(([n]) => !t.includes(n)));
}
function zl(e) {
  const t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    if (!so(o) || typeof o.offset != "number" || !Number.isFinite(o.offset)) continue;
    const r = o.offset;
    t.has(r) && n.add(r), t.set(r, o);
  }
  for (const o of n) t.delete(o);
  return t;
}
function rx(e, t) {
  if (!so(e) || !so(t) || e.kind !== t.kind || !["linear", "radial"].includes(String(t.kind))) return structuredClone(t);
  const n = t.kind === "radial", o = {
    ...fa(e, n ? ["kind", "center", "radius", "stops"] : ["kind", "angle", "stops"]),
    ...structuredClone(t)
  };
  if (Array.isArray(e.stops) && Array.isArray(t.stops)) {
    const r = zl(e.stops), s = zl(t.stops);
    o.stops = t.stops.map((a) => {
      if (!so(a) || typeof a.offset != "number" || !s.has(a.offset)) return structuredClone(a);
      const i = r.get(a.offset);
      return { ...i ? fa(i, ["offset", "color", "alpha"]) : {}, ...structuredClone(a) };
    });
  }
  if (n && so(e.center)) {
    const r = fa(e.center, ["x", "y"]);
    so(t.center) ? o.center = { ...r, ...structuredClone(t.center) } : !Object.hasOwn(t, "center") && Object.keys(r).length && (o.center = { ...r, x: 0.5, y: 0.5 });
  }
  return o;
}
function za(e) {
  return JSON.stringify(e.rows.map((t) => t.raw)) !== JSON.stringify(e.capture.runs);
}
function sx(e) {
  if (!za(e)) return null;
  const t = e.rows.map((o) => structuredClone(o.raw)), n = { op: "update", id: e.capture.layer, runs: t };
  if (t.length && e.rows.every(Hr) && t.every($a)) {
    const o = t.map((r) => r.text).join("");
    o !== e.capture.text && Object.assign(n, { text: o });
  }
  return n;
}
function ax(e) {
  Fe();
  const [, t] = p.useState(0), n = p.useRef(null), o = ec(e.capture), r = e.drafts.get(o), s = e.disabled || !!r?.pending || !!r?.reconcile, a = () => t((g) => g + 1), i = (g) => requestAnimationFrame(() => {
    (n.current ?? [...document.querySelectorAll("[data-runs-editor]")].find((w) => w.dataset.runsIdentity === o))?.querySelector(g)?.focus();
  }), c = (g) => {
    e.drafts.set(o, g), a();
  }, u = () => {
    c(Jf(e.capture)), i("#runs-add");
  }, f = (g, v, w) => {
    if (!r || s) return;
    const x = r.rows[g];
    Hr(x) && (x.raw = ox(x.raw, v, w), r.error = "", c(r));
  };
  async function h() {
    if (!r || s || !za(r)) return;
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
    const C = g[w], j = C != null, R = `run-${r.rows[v].key}-${w}`, T = `${y("runs.row", { number: v + 1 })}: ${y(x)}`;
    return /* @__PURE__ */ l.jsxs(ye, { gap: 4, style: { minWidth: 0 }, children: [
      /* @__PURE__ */ l.jsx(
        uo,
        {
          "aria-label": `${T}: ${y("runs.mode")}`,
          label: y(x),
          size: "xs",
          value: j ? "value" : "inherit",
          data: [{ value: "inherit", label: y("runs.inherit") }, { value: "value", label: y("runs.override") }],
          disabled: s,
          onChange: (S) => f(v, w, S === "inherit" ? void 0 : E)
        }
      ),
      w === "fontFamily" ? /* @__PURE__ */ l.jsx(mw, { host: e.fonts, label: T, value: String(j ? C : E), disabled: s || !j, onCommit: (S) => f(v, w, S) }) : w === "fontStyle" ? /* @__PURE__ */ l.jsx(
        uo,
        {
          id: R,
          "aria-label": T,
          size: "xs",
          value: String(j ? C : E),
          disabled: s || !j,
          data: [{ value: "normal", label: y("runs.normal") }, { value: "italic", label: y("runs.italic") }],
          onChange: (S) => f(v, w, S)
        }
      ) : /* @__PURE__ */ l.jsx(
        dt,
        {
          id: R,
          "aria-label": T,
          size: "xs",
          type: "number",
          value: String(j ? C : E),
          disabled: s || !j,
          onChange: (S) => {
            const b = S.currentTarget.value;
            f(v, w, b === "" ? "" : Number(b));
          }
        }
      )
    ] }, w);
  }
  return /* @__PURE__ */ l.jsx("div", { ref: n, className: "runs-editor", "data-runs-editor": !0, "data-runs-identity": o, onKeyDown: (g) => g.stopPropagation(), children: /* @__PURE__ */ l.jsxs(ye, { gap: "xs", children: [
    /* @__PURE__ */ l.jsx(ee, { fw: 600, children: y("runs.title") }),
    /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "dimmed", children: y("runs.help") }),
    r ? /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
      r.capture.version !== e.capture.version && /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "orange", role: "status", children: y("runs.conflict") }),
      /* @__PURE__ */ l.jsx(st, { "aria-label": y("runs.title"), style: { tableLayout: "fixed", width: "100%" }, children: /* @__PURE__ */ l.jsx(st.Tbody, { children: r.rows.map((g, v) => /* @__PURE__ */ l.jsx(st.Tr, { "data-run-row": g.key, children: /* @__PURE__ */ l.jsx(st.Td, { style: { padding: "8px 0" }, children: /* @__PURE__ */ l.jsxs(ye, { gap: "xs", children: [
        /* @__PURE__ */ l.jsxs(Ne, { justify: "space-between", gap: 4, children: [
          /* @__PURE__ */ l.jsx(ee, { size: "sm", fw: 600, children: y("runs.row", { number: v + 1 }) }),
          /* @__PURE__ */ l.jsxs(Ne, { gap: 4, wrap: "wrap", children: [
            [[-1, "runs.up"], [1, "runs.down"]].map(([w, x]) => /* @__PURE__ */ l.jsx(
              ce,
              {
                size: "compact-xs",
                variant: "subtle",
                "aria-label": `${y(x)}: ${v + 1}`,
                "data-run-move": w,
                disabled: s || v + w < 0 || v + w >= r.rows.length,
                onClick: () => {
                  [r.rows[v], r.rows[v + w]] = [r.rows[v + w], r.rows[v]], c(r), i(`[data-run-row="${g.key}"] textarea`);
                },
                children: y(x)
              },
              w
            )),
            /* @__PURE__ */ l.jsx(
              ce,
              {
                size: "compact-xs",
                variant: "subtle",
                color: "red",
                "aria-label": `${y("runs.delete")}: ${v + 1}`,
                "data-run-delete": !0,
                disabled: s,
                onClick: () => {
                  r.rows.splice(v, 1), c(r), i(r.rows.length ? `[data-run-row="${r.rows[Math.min(v, r.rows.length - 1)].key}"] textarea` : "#runs-add");
                },
                children: y("runs.delete")
              }
            )
          ] })
        ] }),
        Hr(g) ? /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
          /* @__PURE__ */ l.jsx(
            go,
            {
              "data-run-text": !0,
              "aria-label": `${y("runs.text")}: ${v + 1}`,
              label: y("runs.text"),
              value: g.raw.text,
              autosize: !0,
              minRows: 2,
              disabled: s,
              onChange: (w) => f(v, "text", w.currentTarget.value)
            }
          ),
          /* @__PURE__ */ l.jsxs(ti, { cols: 2, spacing: "xs", children: [
            m(g.raw, v, "fontFamily", "editor.fontFamily", e.layer.fontFamily),
            m(g.raw, v, "fontSize", "properties.fontSize", e.layer.fontSize),
            m(g.raw, v, "fontWeight", "properties.weight", e.layer.fontWeight ?? 400),
            m(g.raw, v, "fontStyle", "properties.style", e.layer.fontStyle ?? "normal"),
            m(g.raw, v, "letterSpacing", "properties.letterSpacing", e.layer.letterSpacing ?? 0)
          ] }),
          /* @__PURE__ */ l.jsx(
            uo,
            {
              size: "xs",
              label: y("properties.colour"),
              "aria-label": `${y("runs.fillMode")}: ${v + 1}`,
              "data-run-fill-mode": !0,
              value: Object.hasOwn(g.raw, "color") ? g.raw.color === null ? "none" : "value" : "inherit",
              disabled: s,
              data: [{ value: "inherit", label: y("runs.inherit") }, { value: "none", label: y("runs.noFill") }, { value: "value", label: y("runs.override") }],
              onChange: (w) => f(v, "color", w === "inherit" ? void 0 : w === "none" ? null : e.layer.color ?? "#000000")
            }
          ),
          Object.hasOwn(g.raw, "color") && g.raw.color !== null && /* @__PURE__ */ l.jsx(
            Yf,
            {
              id: `run-${g.key}-paint`,
              label: `${y("properties.colour")}: ${v + 1}`,
              value: g.raw.color,
              disabled: s,
              onCommit: (w) => f(v, "color", rx(r.rows[v].raw.color, w))
            },
            `${g.key}-${typeof g.raw.color}`
          )
        ] }) : /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
          /* @__PURE__ */ l.jsx(ee, { size: "xs", c: "orange", children: y("runs.unsupported") }),
          /* @__PURE__ */ l.jsx(go, { "aria-label": `${y("runs.raw")}: ${v + 1}`, value: JSON.stringify(g.raw, null, 2), readOnly: !0, autosize: !0, maxRows: 6 })
        ] })
      ] }) }) }, g.key)) }) }),
      /* @__PURE__ */ l.jsxs(Ne, { gap: "xs", children: [
        /* @__PURE__ */ l.jsx(ce, { id: "runs-add", size: "xs", variant: "light", disabled: s, onClick: () => {
          const g = $l(r.rows.length === 0 && r.capture.runs.length === 0 ? r.capture.text : "");
          r.rows.push(g), c(r), i(`[data-run-row="${g.key}"] textarea`);
        }, children: y("runs.add") }),
        /* @__PURE__ */ l.jsx(ce, { id: "runs-clear", size: "xs", variant: "light", disabled: s || !r.rows.length, onClick: () => {
          r.rows = [], c(r), i("#runs-add");
        }, children: y("runs.clear") }),
        r.rows.some((g) => !Hr(g)) && /* @__PURE__ */ l.jsx(ce, { id: "runs-replace", size: "xs", variant: "light", disabled: s, onClick: () => {
          const g = $l(r.capture.text);
          r.rows = [g], c(r), i(`[data-run-row="${g.key}"] textarea`);
        }, children: y("runs.replace") })
      ] }),
      r.error && /* @__PURE__ */ l.jsx(ee, { id: "runs-error", role: "alert", tabIndex: -1, size: "xs", c: "red", children: r.error }),
      (r.error || r.capture.version !== e.capture.version) && /* @__PURE__ */ l.jsx(ce, { id: "runs-reload", size: "xs", variant: "light", disabled: r.pending, onClick: () => {
        d();
      }, children: y("runs.reload") }),
      /* @__PURE__ */ l.jsxs(Ne, { gap: "xs", children: [
        /* @__PURE__ */ l.jsx(ce, { id: "runs-apply", size: "xs", disabled: s || !za(r), loading: r.pending, onClick: () => {
          h();
        }, children: y("runs.apply") }),
        /* @__PURE__ */ l.jsx(ce, { id: "runs-cancel", size: "xs", variant: "default", disabled: r.pending, onClick: () => {
          e.drafts.delete(o), a(), i("#runs-edit");
        }, children: y("runs.cancel") })
      ] })
    ] }) : /* @__PURE__ */ l.jsx(ce, { id: "runs-edit", size: "xs", variant: "light", disabled: e.disabled, onClick: u, children: y("runs.edit") })
  ] }) });
}
let ix = 0;
function cx(e, t) {
  return Ue(`text-runs-${++ix}`, e, /* @__PURE__ */ l.jsx(ax, { ...t }));
}
function lx({ assets: e, value: t, disabled: n = !1, onChange: o, onUpload: r }) {
  Fe();
  const [s, a] = p.useState(null), [i, c] = p.useState(t);
  p.useEffect(() => c(t), [t]);
  const u = e.filter((h) => h.mediaType.startsWith("image/")), f = [
    { value: "", label: y("canvas.backgroundImageNone") },
    ...u.map((h) => ({
      value: h.id,
      label: `${h.path.split("/").at(-1) ?? h.path} (${h.mediaType})`
    }))
  ];
  return /* @__PURE__ */ l.jsxs(ye, { gap: "xs", className: "canvas-image-input", children: [
    /* @__PURE__ */ l.jsx(
      vo,
      {
        id: "canvas-background-image",
        label: y("canvas.backgroundImage"),
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
      vo,
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
          c(d), o(d);
        }
      }
    ),
    /* @__PURE__ */ l.jsxs(Ne, { align: "end", gap: "xs", children: [
      /* @__PURE__ */ l.jsx(
        Bi,
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
      i ? /* @__PURE__ */ l.jsx(
        ce,
        {
          id: "canvas-background-image-clear",
          type: "button",
          variant: "light",
          color: "red",
          disabled: n,
          onClick: () => {
            c(null), o(null);
          },
          children: y("canvas.removeBackgroundImage")
        }
      ) : null
    ] })
  ] });
}
let ux = 0;
function dx(e, t) {
  return Ue(
    `canvas-image-${++ux}`,
    e,
    /* @__PURE__ */ l.jsx(lx, { ...t })
  );
}
const fx = [
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
function px({ value: e, disabled: t, onChange: n }) {
  return Fe(), /* @__PURE__ */ l.jsx(
    kn.Group,
    {
      id: "canvas-anchor-group",
      name: "canvas-anchor",
      value: e,
      onChange: (o) => n(o),
      children: /* @__PURE__ */ l.jsx(ti, { cols: 3, className: "canvas-size-anchor-grid", children: fx.map((o) => /* @__PURE__ */ l.jsx(
        kn,
        {
          value: o.value,
          label: /* @__PURE__ */ l.jsx("span", { title: y(o.key), children: o.glyph }),
          "aria-label": y(o.key),
          disabled: t,
          className: "canvas-anchor"
        },
        o.value
      )) })
    }
  );
}
function hx(e, t, n, o) {
  let r = (i, c) => {
  };
  function s() {
    const [i, c] = p.useState(t), [u, f] = p.useState(n);
    return p.useEffect(() => (r = (h, d) => {
      c(h), f(d);
    }, () => {
      r = () => {
      };
    }), []), /* @__PURE__ */ l.jsx(px, { value: i, disabled: u, onChange: o });
  }
  const a = Ue("canvas-anchor-picker", e, /* @__PURE__ */ l.jsx(s, {}));
  return { setState: (i, c) => r(i, c), destroy: a };
}
const fo = (e) => typeof e == "function" ? e() : e;
function mx(e) {
  Fe();
  const t = fo(e.label), n = e.title === void 0 ? void 0 : fo(e.title), o = p.useRef(e.value), r = (s) => {
    s !== o.current && (o.current = s, e.onCommit(s));
  };
  return e.options ? /* @__PURE__ */ l.jsx(
    vo,
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
      data: e.options.map((s) => ({ value: s.value, label: fo(s.label) })),
      classNames: e.className ? { input: e.className } : void 0,
      onChange: (s) => r(s.currentTarget.value)
    }
  ) : e.type === "textarea" ? /* @__PURE__ */ l.jsx(
    go,
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
function gx(e) {
  Fe();
  const t = fo(e.label), n = e.title === void 0 ? void 0 : fo(e.title);
  return /* @__PURE__ */ l.jsx(
    ce,
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
let tc = 0;
function vx(e) {
  Fe();
  const [t, n] = p.useState(e.checked);
  return p.useEffect(() => {
    n(e.checked);
  }, [e.checked]), /* @__PURE__ */ l.jsx(
    rn,
    {
      id: e.id,
      label: fo(e.label),
      checked: t,
      disabled: e.disabled,
      classNames: e.className ? { input: e.className } : void 0,
      onChange: (o) => {
        n(o.currentTarget.checked), e.onChange(o.currentTarget.checked);
      }
    }
  );
}
function Uo(e, t) {
  return Ue(`inspector-checkbox-${++tc}`, e, /* @__PURE__ */ l.jsx(vx, { ...t }));
}
function ct(e, t) {
  return Ue(`inspector-field-${++tc}`, e, /* @__PURE__ */ l.jsx(mx, { ...t }));
}
function ot(e, t) {
  return Ue(`inspector-button-${++tc}`, e, /* @__PURE__ */ l.jsx(gx, { ...t }));
}
function yx({ state: e, onClose: t }) {
  return Fe(), p.useEffect(() => {
    e.open && document.querySelector("#context-menu button[role=menuitem]:not(:disabled)")?.focus();
  }, [e.open, e.items]), /* @__PURE__ */ l.jsx(
    ho,
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
      children: /* @__PURE__ */ l.jsx(ye, { gap: 4, children: e.items.map((n, o) => n.kind === "separator" ? /* @__PURE__ */ l.jsx(Rs, { role: "separator" }, `separator-${o}`) : /* @__PURE__ */ l.jsx(
        ce,
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
          children: y(n.key)
        },
        `${n.key}-${o}`
      )) })
    }
  );
}
function bx(e) {
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
    }), []), /* @__PURE__ */ l.jsx(yx, { state: a, onClose: () => o({ ...n, open: !1 }) });
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
const wx = {
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
function Sx({ title: e, initiallyOpen: t, bodyElement: n }) {
  Fe();
  const [o, r] = p.useState(t ? e : null), s = wx[e], a = s ? y(s) : e;
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
          /* @__PURE__ */ l.jsx("span", { className: "dock-section-icon", children: /* @__PURE__ */ l.jsx("i", { className: `ph ${xx[e] ?? "ph-sliders-horizontal"}`, "aria-hidden": "true" }) }),
          /* @__PURE__ */ l.jsx(ee, { component: "span", className: "dock-section-heading", children: a })
        ] }) }),
        /* @__PURE__ */ l.jsx(Pe.Panel, { children: /* @__PURE__ */ l.jsx("div", { ref: (i) => {
          i && n.parentElement !== i && i.append(n);
        } }) })
      ] })
    }
  );
}
let Cx = 0;
function jx(e, t, n) {
  const o = document.createElement("div");
  o.className = "dock-section-host", e.append(o);
  const r = document.createElement("div");
  r.className = "dock-section-body";
  const s = `inspector-section-${++Cx}`, a = Ue(
    s,
    o,
    /* @__PURE__ */ l.jsx(Sx, { title: t, initiallyOpen: n, bodyElement: r })
  );
  return {
    body: r,
    destroy() {
      a(), o.remove();
    }
  };
}
function nc(e) {
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
let k = nc(null);
function oc(e) {
  return {
    state: nc(e),
    scroll: { left: 0, top: 0 },
    layerQuery: "",
    historySnapshot: null,
    activeDock: "layers",
    templateDraft: null,
    thumbnail: null
  };
}
const ve = new Mw(), Tn = new Cw(), _a = /* @__PURE__ */ new Map(), tn = [];
Tn.onSettled = (e) => {
  tn.push({
    label: e.label,
    ok: e.ok,
    superseded: e.superseded,
    at: performance.now() - e.waitedMs,
    waitedMs: e.waitedMs,
    ranMs: e.ranMs,
    previewSettledAt: null
  }), tn.length > 50 && tn.shift(), Qf();
};
function Fa(e, t) {
  Wp(e, t);
}
let Zf = !1;
Tn.onActiveChange = (e) => {
  Zf = e, e ? (Vp("info"), Fa("ph-circle-notch", "save.working")) : Hp() !== "error" && Fa("ph-check-circle", "save.allChangesSaved");
};
function kx() {
  for (let e = tn.length - 1; e >= 0; e--) {
    const t = tn[e];
    if (t && t.previewSettledAt === null) {
      t.previewSettledAt = performance.now();
      break;
    }
  }
  Qf();
}
const Ex = new URLSearchParams(window.location.search).has("perf");
window.__assemblashPerf = tn;
function Qf() {
  if (!Ex) return;
  let e = document.getElementById("assemblash-perf");
  e || (e = document.createElement("div"), e.id = "assemblash-perf", e.setAttribute(
    "style",
    "position:fixed;bottom:8px;left:8px;z-index:9999;font:11px/1.5 ui-monospace,monospace;background:rgba(0,0,0,.82);color:#eee;padding:6px 9px;border-radius:6px;pointer-events:none;white-space:pre"
  ), document.body.append(e));
  const t = tn[tn.length - 1], n = t && t.previewSettledAt !== null ? `${Math.round(t.previewSettledAt - t.at)}ms` : "…";
  e.textContent = t ? `${t.label}: waited ${t.waitedMs}ms, ran ${t.ranMs ?? "–"}ms, settled ${n}
queue ${Tn.size}, records ${tn.length}` : "no interactions yet";
}
const rc = "#3366cc";
function Rx(e) {
  return typeof e == "string" ? e : null;
}
const ep = "#111111", tp = 2, Nx = ["rect", "ellipse"];
function Tx(e) {
  const t = e.clip;
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = t.shape;
    if (typeof n == "string") return n;
  }
  return null;
}
function _l(e) {
  const t = e.clip;
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = t.cornerRadius;
    if (typeof n == "number") return n;
  }
  return 0;
}
function Px(e) {
  if (e.type !== "image") return null;
  const t = e.crop;
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = t, o = n.x, r = n.y, s = n.width, a = n.height;
    if (typeof o == "number" && typeof r == "number" && typeof s == "number" && typeof a == "number")
      return { x: o, y: r, width: s, height: a };
  }
  return null;
}
function Ax(e) {
  return e.type !== "image" && e.type !== "svg" ? null : (k.document?.assets ?? []).find((t) => t.id === e.asset) ?? null;
}
let wt = null, sc = 0, yn = null, Ln = [], _t = null, nr = null;
function J(e) {
  const t = document.getElementById(e);
  if (!t) throw new Error(`missing element #${e}`);
  return t;
}
function Fl(e) {
  const t = document.createElement("span");
  return t.dataset.i18n = e, t.textContent = y(e), t;
}
const Bt = Aw();
let or = "", wr = null, xr = "layers";
const Ix = Zw(J("structure-panel"), {
  document: null,
  selectedIds: [],
  query: or,
  history: wr,
  dock: xr
}, {
  setQuery(e) {
    or = e, Nt();
  },
  select(e, t) {
    k.selection = t ? k.selection.includes(e) ? k.selection.filter((n) => n !== e) : [...k.selection, e] : [e], Nt(), ft(), lt(), window.matchMedia("(max-width: 720px)").matches && ic()?.type !== "text" && (N.structure.classList.remove("mobile-open"), N.dockToggle.setAttribute("aria-expanded", "false"));
  },
  toggleVisibility(e) {
    const t = k.document && Be(Le(k.document)).find((n) => n.layer.id === e)?.layer;
    t && oe(t.visible === !1 ? "show layer" : "hide layer", { op: "setVisible", id: e, visible: t.visible === !1 });
  },
  toggleLocked(e) {
    const t = k.document && Be(Le(k.document)).find((n) => n.layer.id === e)?.layer;
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
    k.selection.length < 2 || oe("group", { op: "group", ids: [...k.selection] });
  },
  deleteSelection() {
    ir();
  },
  undo() {
    N.undo.click();
  },
  redo() {
    N.redo.click();
  },
  showDock(e) {
    Oo(e);
  },
  contextMenu(e, t, n) {
    ft(), lt(), cr(t, n);
  }
}), Sn = bx(J("context-menu-root")), N = {
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
Up(
  N.statusChromeRoot,
  (e) => {
    sp(e);
  },
  (e) => {
    window.localStorage.setItem("assemblash-update-banner-v1", e), cu(null);
  }
);
const Hs = zw({
  openProject: (e) => wp(e),
  search: () => {
    Me("search", async () => {
      await Er();
    });
  },
  openPageSet: (e) => {
    Je(), Me("open page set", () => i0(e));
  }
}, document.querySelector(".project-combobox")), Mx = Nw();
function Us(e, t, n, o) {
  Mx.request(e, t, n, o);
}
function we(e, t = "info") {
  Kp(e, t);
}
const Dn = { families: [], faces: [] }, pn = /* @__PURE__ */ new Map();
let Bl = "";
async function Me(e, t) {
  await Tn.enqueue({ label: e, coalesceKey: null, run: t, onError: (n) => sn(e, n) });
}
const Dx = {
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
function ac(e) {
  const t = Hw(e);
  if (t) return t;
  const n = Dx[e.code];
  return n ? y(n) : `${e.message} (${e.code})`;
}
function sn(e, t) {
  Fa("ph-warning-circle", "save.needsAttention"), t instanceof Ye ? we(ac(t), "error") : we(y("errors.unexpected", { message: String(t) }), "error");
}
J("add-template-section").append(J("templates-mantine-mount"));
const $t = Bw({
  project: () => k.project,
  document: () => k.document,
  say: we,
  guard: Me,
  refresh: () => Ge()
}), bo = Sw({
  project: () => k.project,
  document: () => k.document,
  say: we,
  guard: Me,
  refresh: () => Ge(),
  fontsChanged: (e) => {
    Dn.families = [...e.families], Dn.faces = [...e.faces], lt();
  }
}, J("fonts-mantine-mount")), Ox = sw({
  project: () => k.project,
  document: () => k.document,
  say: we,
  guard: Me
}), Lx = Ew({
  create: async (e, t, n, o) => {
    let r = !1;
    return await Me("create", async () => {
      await mb(e, t, n, o, e), await Er(e), we(y("projects.created", { id: e })), r = !0;
    }), r;
  }
}), np = Qb({ say: we });
N.agents.addEventListener("click", () => {
  Bt.isOpen() && Bt.close();
}, { capture: !0 });
const op = "assemblash-follow-v1";
function Ba() {
  return window.localStorage.getItem(op) !== "off";
}
function $x(e = "settings-agents") {
  N.settingFollow.checked = Ba();
  const t = si(), n = t === "pseudo" ? "en" : t;
  N.settingLanguage.value = n, Bt.open(e, { follow: Ba(), language: n });
}
N.settings.addEventListener("click", () => $x());
N.settingLanguage.value = si();
N.settingLanguage.addEventListener("change", () => {
  Zp(N.settingLanguage.value);
});
Bp(() => {
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
  e && (N.canvasImage.alt = y("canvas.previewAlt", { name: e })), k.document && (N.version.textContent = Re($e(k.document)), oi(
    `${Re(Math.round(k.document.canvas.width))} × ${Re(Math.round(k.document.canvas.height))}`
  ), Io());
});
N.settingFollow.addEventListener("change", () => {
  window.localStorage.setItem(op, N.settingFollow.checked ? "on" : "off");
});
N.settingsFontsOpen.addEventListener("click", () => {
  Bt.close(), Me("fonts", () => Sc(!0));
});
const zx = "assemblash-update-banner-v1";
async function rp() {
  let e;
  try {
    e = await Ib();
  } catch {
    return;
  }
  N.settingUpdateCheck.checked = e.consent === "notify", iu(e.consent === null);
  const t = window.localStorage.getItem(zx), n = e.newer && !!e.latest && t !== e.latest;
  cu(n && e.latest ? {
    version: e.latest,
    text: y("updates.versionAvailable", { latest: e.latest, current: e.current }),
    notesUrl: e.notesUrl ?? null
  } : null);
}
async function sp(e) {
  try {
    const t = await Mb(e);
    iu(t.consent === null), N.settingUpdateCheck.checked = t.consent === "notify", we(t.consent === "notify" ? y("updates.checkOn") : y("updates.checkOff"));
  } catch (t) {
    sn(y("updates.saveChoiceFailed"), t), rp();
  }
}
N.settingUpdateCheck.addEventListener("change", () => {
  sp(N.settingUpdateCheck.checked ? "notify" : "off");
});
N.settingsForm.addEventListener("submit", (e) => {
  e.submitter?.value === "cancel" && Bt.close();
});
function ic() {
  if (!k.document || k.selection.length !== 1) return null;
  const e = k.selection[0];
  return Be(Le(k.document)).find(({ layer: t }) => t.id === e)?.layer ?? null;
}
function zt() {
  if (!k.document) return [];
  const e = new Set(k.selection);
  return Be(Le(k.document)).map(({ layer: t }) => t).filter((t) => e.has(t.id));
}
function wo(e, t = !1) {
  const n = ts(e);
  if (n && (!t || e.protected || e.readOnly)) return n;
  if (!k.document) return null;
  const o = Be(Le(k.document));
  let r = o.find((s) => s.layer.id === e.id)?.parent;
  for (; r; ) {
    const s = o.find((i) => i.layer.id === r);
    if (!s) break;
    const a = ts(s.layer);
    if (a) return a;
    r = s.parent;
  }
  return null;
}
function rt(e) {
  return wo(e) === null;
}
function Va() {
  if (!k.document || k.selection.length === 0) return !1;
  const e = Be(Le(k.document)), t = new Set(k.selection);
  return k.selection.every((n) => {
    const o = e.find((s) => s.layer.id === n);
    if (!o || !rt(o.layer) || !dc(e, o.parent) || o.layer.transform.width <= 0 || o.layer.transform.height <= 0) return !1;
    let r = o.parent;
    for (; r; ) {
      if (t.has(r)) return !1;
      r = e.find((s) => s.layer.id === r)?.parent ?? null;
    }
    return !0;
  });
}
function _x(e, t) {
  let n = 0, o = { x: 0, y: 0 };
  const r = () => {
    window.clearTimeout(n), n = 0;
  };
  e.addEventListener("pointerdown", (s) => {
    s.pointerType !== "touch" && s.pointerType !== "pen" || (o = { x: s.clientX, y: s.clientY }, n = window.setTimeout(() => {
      cr(o.x, o.y), navigator.vibrate?.(20);
    }, 550));
  }), e.addEventListener("pointermove", (s) => {
    Math.hypot(s.clientX - o.x, s.clientY - o.y) > 8 && r();
  }), e.addEventListener("pointerup", r), e.addEventListener("pointercancel", r);
}
let Vl = null, Hl;
function Fx() {
  !k.project || Vl === k.project || (Vl = k.project, N.canvasHints.hidden = !1, window.clearTimeout(Hl), Hl = window.setTimeout(() => {
    N.canvasHints.hidden = !0;
  }, 5e3));
}
let Ha = 0;
async function Ge() {
  if (Je(), !k.project) return;
  const e = ++Ha, t = await Ao(k.project);
  e !== Ha || !k.project || Un(t);
}
function Un(e) {
  const t = k.drag?.mode === "resize" ? k.drag : yn;
  t && (e.id !== k.document?.id || $e(e) !== t.version) && Je(), k.document = e, k.selection = k.selection.filter(
    (n) => Be(Le(e)).some(({ layer: o }) => o.id === n)
  ), N.version.textContent = Re($e(e)), N.canvasEmpty.hidden = !0, N.canvas.hidden = !1, N.canvasControlsRoot.hidden = !1, Fx(), oi(
    `${Re(Math.round(e.canvas.width))} × ${Re(Math.round(e.canvas.height))}`
  ), k.slots = e.slots ?? [], _t !== null && $e(e) !== _t && Et(), lc(), Nt(), ft(), lt(), Bx().catch((n) => sn("presets", n)), Gx().catch((n) => sn("history", n));
}
let Ua = 0;
async function Bx() {
  if (!k.project) return;
  const e = ++Ua, t = await _b(k.project);
  e === Ua && (k.presets = t);
}
let Ur = null, $o = null, cc = null;
function lc() {
  if (!k.project || !k.document || (cc = rr(), $o = $e(k.document), Ur)) return;
  const e = k.project;
  Ur = (async () => {
    try {
      for (; $o !== null; ) {
        const t = $o;
        $o = null;
        const n = await Fn(es(e, t, rr())), o = k.document;
        if (k.project !== e || !o || $e(o) !== t) {
          URL.revokeObjectURL(n);
          continue;
        }
        const r = N.canvasImage.src;
        N.canvasImage.src = n, r.startsWith("blob:") && URL.revokeObjectURL(r), !k.drag && (_t === null || t >= _t) && Et(), N.canvasImage.dataset.previewName = o.name ?? e, N.canvasImage.alt = y("canvas.previewAlt", { name: o.name ?? e }), N.canvas.style.aspectRatio = `${o.canvas.width} / ${o.canvas.height}`, Io(), kx();
      }
    } catch (t) {
      sn("preview", t);
    } finally {
      Ur = null, $o !== null && lc();
    }
  })();
}
function uc() {
  !k.document || rr() === cc || lc();
}
function Vx() {
  const e = window.getComputedStyle(N.stage), t = (n) => {
    const o = Number.parseFloat(n);
    return Number.isFinite(o) ? Math.max(0, o) : 0;
  };
  return {
    horizontal: t(e.paddingLeft) + t(e.paddingRight),
    vertical: t(e.paddingTop) + t(e.paddingBottom)
  };
}
function ap() {
  if (!k.document) return 1;
  const e = Vx(), t = Math.max(1, N.stageViewport.clientWidth - e.horizontal), n = Math.max(1, N.stageViewport.clientHeight - e.vertical);
  return Math.min(
    t / k.document.canvas.width,
    n / k.document.canvas.height,
    1
  );
}
function Ws() {
  return k.zoom ?? ap();
}
function rr() {
  if (!k.document) return 1;
  const e = Math.max(1, window.devicePixelRatio || 1);
  return Math.min(1, Math.max(0.1, Ws() * e));
}
function Nt() {
  Ix.setSnapshot({
    document: k.document,
    selectedIds: k.selection,
    query: or,
    history: wr,
    dock: xr
  });
}
function sr(e, t) {
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
function dc(e, t) {
  let n = t;
  for (; n; ) {
    const o = e.find((r) => r.layer.id === n);
    if (!o || o.layer.transform.flipHorizontal || o.layer.transform.flipVertical) return null;
    n = o.parent;
  }
  return sr(e, t);
}
function ft() {
  if (N.overlay.replaceChildren(), !k.document) return;
  const { width: e, height: t } = k.document.canvas, n = Be(Le(k.document)), o = n.flatMap(({ layer: c, parent: u }) => {
    const f = dc(n, u);
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
      f.shiftKey || f.ctrlKey || f.metaKey ? k.selection = k.selection.includes(c.layer.id) ? k.selection.filter((h) => h !== c.layer.id) : [...k.selection, c.layer.id] : k.selection.includes(c.layer.id) || (k.selection = [c.layer.id]), Nt(), lt(), ft();
    }), u.addEventListener("dblclick", (f) => {
      f.stopPropagation(), c.layer.type === "text" && xo(c.layer);
    }), u.addEventListener("contextmenu", (f) => {
      f.preventDefault(), k.selection.includes(c.layer.id) || (k.selection = [c.layer.id]), Nt(), lt(), ft(), cr(f.clientX, f.clientY);
    }), _x(u), N.overlay.append(u);
  }
  const r = o.filter(({ layer: c }) => k.selection.includes(c.id));
  if (r.length === 0) return;
  fp(r.map(({ layer: c }) => c.id));
  const s = r.length === 1 ? {
    x: r[0].x,
    y: r[0].y,
    width: r[0].width,
    height: r[0].height
  } : Qi(r.map((c) => ({
    x: c.x,
    y: c.y,
    width: c.width,
    height: c.height,
    rotation: c.layer.transform.rotation ?? 0
  }))), a = document.createElement("div");
  if (a.className = "handle-box", a.style.left = `${s.x / e * 100}%`, a.style.top = `${s.y / t * 100}%`, a.style.width = `${s.width / e * 100}%`, a.style.height = `${s.height / t * 100}%`, a.style.transformOrigin = "center", r.length === 1 && (a.style.transform = `rotate(${r[0]?.layer.transform.rotation ?? 0}deg)`), a.dataset.ids = k.selection.join(","), a.addEventListener("contextmenu", (c) => {
    c.preventDefault(), c.stopPropagation(), cr(c.clientX, c.clientY);
  }), r.every(({ layer: c }) => rt(c))) {
    a.addEventListener("pointerdown", (u) => ha(u, r, s, "move")), a.addEventListener("dblclick", (u) => {
      u.stopPropagation();
      const f = r.length === 1 && r[0]?.layer.type === "text" ? r[0].layer : null;
      f && xo(f);
    }), Va() || (a.title = y("canvas.resizeUnavailable"));
    for (const u of Va() ? ["nw", "n", "ne", "e", "se", "s", "sw", "w"] : []) {
      const f = document.createElement("button");
      f.type = "button", f.className = `resize-handle handle-${u}`, f.dataset.handle = u, f.dataset.resizeHandle = u, f.setAttribute("aria-label", y("canvas.resizeHandle", { handle: u })), f.title = y("canvas.resizeHelp"), f.setAttribute("aria-description", f.title), f.dataset.i18nAttr = "title:canvas.resizeHelp;aria-description:canvas.resizeHelp", f.addEventListener("pointerdown", (h) => {
        h.stopPropagation(), ha(h, r, s, "resize", u);
      }), a.append(f);
    }
    const c = document.createElement("button");
    c.type = "button", c.className = "rotation-handle", c.setAttribute("aria-label", y("canvas.rotateSelection")), c.dataset.i18nAttr = "aria-label:canvas.rotateSelection", c.innerHTML = '<i class="ph ph-arrow-clockwise" aria-hidden="true"></i>', c.addEventListener("pointerdown", (u) => {
      u.stopPropagation(), ha(u, r, s, "rotate");
    }), a.append(c);
  } else
    a.classList.add("guarded"), a.title = r.map(({ layer: c }) => wo(c)).filter(Boolean).join("; ");
  N.overlay.append(a);
}
function Hx(e) {
  if (!k.document) return;
  const t = k.document.canvas, n = document.createElement("form");
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
  be.push(ct(o, {
    id: "canvas-width",
    label: () => y("canvas.widthPx"),
    value: String(t.width),
    type: "number",
    min: 0,
    step: "any",
    onMount: (T) => {
      s = T, R();
    },
    onCommit: () => {
    }
  })), be.push(ct(r, {
    id: "canvas-height",
    label: () => y("canvas.heightPx"),
    value: String(t.height),
    type: "number",
    min: 0,
    step: "any",
    onMount: (T) => {
      a = T, R();
    },
    onCommit: () => {
    }
  }));
  const c = n.querySelector("#canvas-transparent-mount"), u = n.querySelector("#canvas-size-anchor-grid"), f = n.querySelector(".canvas-anchor-fieldset"), h = n.querySelector("#canvas-apply-mount");
  let d = t.background ?? "#ffffff", m = t.backgroundImage ?? null, g = t.background == null, v = "top-left";
  Wr(
    n.querySelector("#canvas-background-paint"),
    "canvas-background",
    y("common.background"),
    d,
    !1,
    (T) => {
      d = T, g = !1, E(), R();
    }
  );
  const w = () => ({
    id: "canvas-transparent",
    label: () => y("canvas.transparentBackground"),
    checked: g,
    onChange(T) {
      g = T, R();
    }
  });
  let x = Uo(c, w());
  be.push(() => x());
  function E() {
    Qa(() => {
      x(), x = Uo(c, w());
    });
  }
  const C = hx(u, v, !0, (T) => {
    v = T, R();
  });
  be.push(C.destroy), be.push(dx(n.querySelector("#canvas-background-image-mount"), {
    assets: k.document.assets ?? [],
    value: m,
    onChange(T) {
      m = T, oe(T ? "set canvas background image" : "clear canvas background image", T ? { op: "updateCanvas", backgroundImage: T } : { op: "updateCanvas", clearBackgroundImage: !0 });
    },
    onUpload(T) {
      const S = k.project;
      S && Me("upload canvas background image", async () => {
        const b = await Zi(S, T), P = {
          op: "updateCanvas",
          backgroundImage: { asset: b.asset.id, fit: m?.fit ?? "fill" }
        }, L = await Hn(S, P, b.version);
        we(y("status.editDone", { version: L.version })), L.document ? Un(L.document) : await Ge();
      });
    }
  })), be.push(ot(h, {
    id: "canvas-apply",
    type: "submit",
    label: () => y("canvas.applyChanges"),
    className: "primary",
    disabled: !0,
    onMount: (T) => {
      i = T, R();
    },
    onClick: () => {
    }
  }));
  const j = () => !!(s && a && (Number(s.value) !== t.width || Number(a.value) !== t.height));
  function R() {
    if (!(!s || !a || !i)) {
      for (const T of [s, a])
        T.setCustomValidity(Number.isFinite(T.valueAsNumber) && T.valueAsNumber > 0 ? "" : y("canvas.invalidDimension"));
      f.disabled = !j(), C.setState(v, !j()), i.disabled = !j() && Ul(g ? null : d, t.background ?? null);
    }
  }
  n.addEventListener("input", R), n.addEventListener("change", R), n.addEventListener("submit", (T) => {
    if (T.preventDefault(), R(), !i || i.disabled || !n.reportValidity() || !s || !a) return;
    const S = g ? null : d, b = {
      op: "updateCanvas",
      ...j() ? { width: Number(s.value), height: Number(a.value), anchor: v } : {},
      ...Ul(S, t.background ?? null) ? {} : { background: S }
    };
    i.disabled = !0, oe("update canvas", b);
  }), R(), e.append(n);
}
function ar(e, t) {
  const n = jx(
    e,
    t,
    !["Clip and mirror", "Appearance", "Effects", "Presets", "Slots"].includes(t)
  );
  return cp.push(n.destroy), n.body;
}
const ip = [], be = [], cp = [];
let bn = 0;
function Wr(e, t, n, o, r, s, a, i, c = !1) {
  be.push(tx(e, { id: t, label: n, value: o, disabled: r, onCommit: s, className: a, clear: i, compact: c }));
}
function Ul(e, t) {
  return JSON.stringify(e) === JSON.stringify(t);
}
function Wl(e, t) {
  const n = bw({ store: () => Dn }, (o) => {
    oe("change font", { op: "update", id: e.id, fontFamily: o });
  });
  return ip.push(n), n.setFamily(e.fontFamily), n.setDisabled(t), n;
}
let ql = "";
function Ux(e) {
  const t = e.map((n) => n.id).join(",");
  t !== ql && e.length === 1 && e[0]?.type === "text" && (Oo("properties"), window.matchMedia("(max-width: 720px)").matches && (N.structure.classList.add("mobile-open"), N.dockToggle.setAttribute("aria-expanded", "true"))), ql = t;
}
function lt() {
  Qa(Wx);
}
function Wx() {
  for (const S of ip.splice(0)) S.destroy();
  for (const S of be.splice(0)) S();
  for (const S of cp.splice(0)) S();
  La(N.inspector), La(N.advancedInspector), N.inspector.replaceChildren(), N.advancedInspector.replaceChildren();
  let e = N.advancedInspector;
  const t = (S) => (e = ar(N.advancedInspector, S), e), n = zt(), o = n.length === 1 ? n[0] ?? null : null;
  Ux(n);
  const r = n.map((S) => S.id).join(",");
  if (r !== Bl && (pn.clear(), Bl = r), N.deleteLayer.disabled = n.length === 0 || n.some((S) => !rt(S)), N.groupLayers.disabled = n.length < 2 || n.some((S) => !rt(S)), hc(n), k.document) {
    const S = document.createElement("span");
    S.style.display = "contents", be.push(ot(S, {
      id: "edit-canvas",
      label: () => y("editor.canvasSizeBackground"),
      icon: "ph-frame-corners",
      className: "toolbar-action",
      onClick() {
        Sn.close(), k.selection = [], Nt(), ft(), lt(), Oo("properties");
      }
    })), N.inspector.append(S);
  }
  if (n.length === 0) {
    const S = document.createElement("div");
    S.className = "inspector-empty", S.innerHTML = '<i class="ph ph-cursor-click" aria-hidden="true"></i><span data-i18n="editor.selectLayerHint">Select a layer to edit it</span>', N.inspector.append(S);
    const b = document.createElement("p");
    if (b.className = "empty-panel-copy", b.dataset.i18n = k.document ? "editor.setCanvasHint" : "editor.openProjectHint", b.textContent = y(k.document ? "editor.setCanvasHint" : "editor.openProjectHint"), e.append(b), k.document) {
      const P = ar(N.advancedInspector, "Canvas");
      Hx(P);
    }
    return;
  }
  const s = n.some((S) => !rt(S));
  let a = 0;
  const i = (S, b, P, L = s, $ = "toolbar-action", F, B = !1) => {
    const I = document.createElement("span");
    return I.className = "inspector-button-host", I.style.display = "contents", be.push(ot(I, {
      id: `inspector-action-${++a}`,
      label: () => y(S),
      icon: b,
      className: $,
      iconOnly: B,
      disabled: L,
      onMount(O) {
        O.title = y(S), F?.(O);
      },
      onClick: P
    })), I;
  };
  if (o?.type === "text") {
    const S = document.createElement("label");
    S.className = "toolbar-field toolbar-font", S.append(Fl("editor.fontFamily")), S.firstElementChild?.classList.add("sr-only");
    const b = Wl(o, s);
    S.append(b.root), N.inspector.append(S);
    const P = document.createElement("span");
    P.className = "toolbar-field toolbar-number", be.push(ct(P, {
      id: "toolbar-font-size",
      label: () => y("editor.fontSize"),
      value: String(o.fontSize),
      type: "number",
      size: "xs",
      min: 1,
      disabled: s,
      className: "toolbar-font-size",
      onCommit: (F) => {
        oe("change font size", {
          op: "update",
          id: o.id,
          fontSize: Number(F)
        });
      }
    })), N.inspector.append(P);
    const L = document.createElement("div");
    L.className = "toolbar-paint", Wr(
      L,
      "text-color",
      y("editor.textColour"),
      o.color ?? "#000000",
      s,
      (F) => {
        oe("change colour", { op: "update", id: o.id, color: F });
      },
      "toolbar-colour",
      void 0,
      !0
    ), N.inspector.append(L);
    for (const [F, B] of [
      ["left", "ph-text-align-left"],
      ["center", "ph-text-align-center"],
      ["right", "ph-text-align-right"],
      ["justify", "ph-text-align-justify"]
    ]) {
      const I = {
        left: "editor.alignLeft",
        center: "editor.alignCenter",
        right: "editor.alignRight",
        justify: "editor.alignJustify"
      }[F], O = i(I, B, () => {
        oe(`align text ${F}`, { op: "update", id: o.id, align: F });
      }, s, "icon-button toolbar-icon", (D) => {
        const z = (o.align ?? "left") === F;
        D.dataset.textAlign = F, D.classList.toggle("selected", z), D.setAttribute("aria-pressed", String(z));
      }, !0);
      N.inspector.append(O);
    }
    const $ = document.createElement("span");
    $.className = "toolbar-divider", N.inspector.append($);
  } else {
    const S = document.createElement("span");
    S.className = "selection-label", n.length === 1 ? S.textContent = o?.type ?? y("editor.layerGeneric") : (S.dataset.i18nCount = "editor.layerCount", S.dataset.count = String(n.length), S.textContent = Ot("editor.layerCount", n.length)), N.inspector.append(S);
  }
  const c = n.map((S) => S.id);
  if (N.inspector.append(
    i("editor.centreHorizontally", "ph-align-center-horizontal", () => {
      oe("centre horizontally", { op: "centerOnCanvas", ids: c, axis: "horizontal" });
    }),
    i("editor.centreVertically", "ph-align-center-vertical", () => {
      oe("centre vertically", { op: "centerOnCanvas", ids: c, axis: "vertical" });
    }),
    i("position.title", "ph-bounding-box", () => Bn(), !1, "toolbar-action position-button"),
    i("layers.groupButton", "ph-stack", () => {
      c.length > 1 && oe("group", { op: "group", ids: c });
    }, s || c.length < 2),
    i("editor.duplicate", "ph-copy", () => {
      xt("duplicate", c.map((S) => ({ op: "duplicate", id: S })));
    })
  ), !o) {
    const S = document.createElement("p");
    S.className = "empty-panel-copy";
    const b = n.filter((L) => L.type === "text"), P = b.length > 1 && new Set(b.map((L) => L.fontFamily)).size > 1;
    S.dataset.i18n = P ? "properties.mixedFonts" : "editor.selectionCountHint", S.textContent = P ? y("properties.mixedFonts") : y("editor.selectionCountHint", { count: n.length }), e.append(S);
    return;
  }
  const u = wo(o);
  if (u) {
    const S = document.createElement("p");
    S.className = "guarded-note", S.textContent = u, e.append(S);
  }
  const f = (S, b, P, L = "number", $, F, B = !1) => {
    const I = document.createElement("div");
    I.className = "field", be.push(ct(I, {
      id: F ?? `field-${S.replaceAll(".", "-")}`,
      label: () => y(S),
      value: b,
      type: L,
      className: F,
      disabled: u !== null || B,
      list: $,
      onCommit(O) {
        if (O === b) return;
        const D = P(O);
        D && oe(`change ${y(S)}`, D);
      }
    })), e.append(I);
  }, h = (S, b, P, L, $, F = !1) => {
    const B = document.createElement("div");
    B.className = "field", be.push(ct(B, {
      id: b,
      label: () => y(S),
      value: P,
      className: b,
      disabled: u !== null || F,
      options: L,
      onCommit: $
    })), e.append(B);
  }, d = (S, b, P, L, $) => {
    const F = document.createElement("div");
    F.className = "field paint-field", Wr(
      F,
      b,
      y(S),
      P,
      u !== null,
      (B) => {
        oe(`change ${y(S)}`, L(B));
      },
      b,
      $ ? {
        label: y("canvas.none"),
        className: $.className,
        title: y("canvas.removeColor", { label: y(S).toLowerCase() }),
        disabled: $.disabled,
        onClear: $.onClear
      } : void 0
    ), e.append(F);
  };
  if (o.type === "text") {
    e = t("Typography");
    const S = document.createElement("span");
    S.style.display = "contents", be.push(ot(S, {
      id: "edit-layer-text",
      label: () => y("canvas.editText"),
      icon: "ph-pencil-simple",
      className: "wide-action edit-text-button",
      disabled: u !== null,
      onClick: () => xo(o)
    })), e.append(S);
    const b = Dn.families.includes(o.fontFamily), P = document.createElement("div");
    P.className = "current-font-summary";
    const L = document.createElement("strong");
    L.className = "current-font-family", L.textContent = o.fontFamily;
    const $ = document.createElement("span");
    if ($.className = "current-font-face", $.textContent = `${o.fontWeight ?? 400} · ${o.fontStyle ?? "normal"} · ${o.fontSize} px`, P.append(L, $), b) {
      const A = document.createElement("span");
      A.className = "current-font-specimen";
      const _ = Dn.faces.find(
        (H) => H.family === o.fontFamily && H.weight === (o.fontWeight ?? 400) && H.style === (o.fontStyle ?? "normal")
      );
      if (_)
        qf(A, _);
      else {
        const H = document.createElement("span");
        H.className = "font-specimen-status", H.textContent = y("fonts.previewUnavailable"), A.append(H);
      }
      P.append(A);
    } else {
      const A = document.createElement("p");
      A.className = "current-font-status", A.dataset.i18n = "properties.fontMissing", A.textContent = y("properties.fontMissing");
      const _ = document.createElement("span");
      _.style.display = "contents", be.push(ot(_, {
        id: "install-fonts",
        label: () => y("fonts.installFonts"),
        className: "small",
        onClick: () => {
          Me("fonts", () => Sc(!0));
        }
      })), P.append(A, _);
    }
    e.append(P);
    const F = document.createElement("label");
    F.className = "field", F.append(Fl("properties.font"));
    const B = Wl(o, u !== null);
    F.append(B.root), e.append(F), f("properties.fontSize", String(o.fontSize), (A) => ({ op: "update", id: o.id, fontSize: Number(A) })), f("properties.lineHeight", String(o.lineHeight ?? 1.2), (A) => ({ op: "update", id: o.id, lineHeight: Number(A) })), f("properties.paragraphSpacing", String(o.paragraphSpacing ?? 0), (A) => ({ op: "update", id: o.id, paragraphSpacing: Number(A) }));
    const I = Kf(o.fontFamily, Dn.faces);
    if (I.length) {
      const A = o.fontWeight ?? 400, _ = o.fontStyle ?? "normal", H = [.../* @__PURE__ */ new Set([
        ...I.filter((W) => W.style === _).map((W) => W.weight),
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
    const O = o.fontStyle ?? "normal", D = o.fontWeight ?? 400, z = I.filter((A) => A.weight === D).map((A) => A.style === "oblique" ? "italic" : A.style), M = I.length ? [.../* @__PURE__ */ new Set([...z, O])] : [O];
    if (h(
      "properties.style",
      "font-style",
      o.fontStyle ?? "normal",
      M.map((A) => ({ value: A, label: A })),
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
    ), f("properties.strokeWidth", String(o.stroke?.width ?? 1), (A) => ({ op: "update", id: o.id, stroke: { color: o.stroke?.color ?? "#000000", width: Number(A) } })), k.project && k.document) {
      const A = Yl(k.project, k.document, o), _ = document.createElement("div");
      e.append(_), be.push(cx(_, {
        capture: A,
        layer: o,
        drafts: _a,
        disabled: u !== null,
        fonts: { store: () => Dn },
        submit: Zx,
        reload: async () => {
          const H = await Tn.outcome("reload runs", async () => {
            if (k.project !== A.project || k.document?.id !== A.document) throw new Error(y("runs.notSent"));
            const W = await Ao(A.project);
            if (k.project !== A.project || k.document?.id !== A.document) throw new Error(y("runs.notSent"));
            const Y = Be(Le(W)).find((ae) => ae.layer.id === A.layer)?.layer;
            if (!Y || Y.type !== "text") throw new Error(y("runs.notSent"));
            _a.set(ec(A), Jf(Yl(A.project, W, Y))), Un(W);
          });
          return H.status === "refused" ? String(H.error) : null;
        }
      }));
    }
  }
  t("Transform");
  const m = document.createElement("div");
  m.className = "property-grid";
  const g = (S, b, P) => {
    const L = `transform-${S.split(".").at(-1)}`, $ = document.createElement("div");
    $.className = "field", be.push(ct($, {
      id: L,
      label: () => y(S),
      value: b,
      type: "number",
      className: L,
      disabled: u !== null,
      onCommit(F) {
        const B = P(F);
        B && oe(`change ${y(S)}`, B);
      }
    })), m.append($);
  }, v = o.transform;
  if (g("properties.x", String(v.x), (S) => Kl(o, Number(S), v.y)), g("properties.y", String(v.y), (S) => Kl(o, v.x, Number(S))), g("properties.width", String(v.width), (S) => Xl(o, Number(S), v.height)), g("properties.height", String(v.height), (S) => Xl(o, v.width, Number(S))), g("properties.rotation", String(v.rotation ?? 0), (S) => ({ op: "rotate", id: o.id, degrees: Number(S) })), g("properties.opacity", String(o.opacity ?? 1), (S) => ({ op: "update", id: o.id, opacity: Number(S) })), e.append(m), (o.type === "image" || o.type === "svg") && (e = t("Media"), h(
    "properties.fit",
    "layer-fit",
    o.fit ?? "fill",
    Db.map((S) => ({ value: S, label: S })),
    (S) => {
      oe("change fit", { op: "update", id: o.id, fit: S });
    }
  ), o.type === "image")) {
    const S = Px(o), b = Ax(o), P = b?.width ?? null, L = b?.height ?? null, $ = typeof P == "number" && P > 0 && typeof L == "number" && L > 0, F = document.createElement("p");
    F.className = "hint";
    const B = $ ? "canvas.cropAvailableHint" : "canvas.cropUnavailableHint";
    F.dataset.i18n = B, F.textContent = y(B), e.append(F);
    const I = S ?? { x: 0, y: 0, width: P ?? 0, height: L ?? 0 }, O = (A, _, H, W) => {
      f(A, String(H), (Y) => W(Number(Y)), "number", void 0, _, !$);
    }, D = (A) => !Number.isFinite(A.x) || !Number.isFinite(A.y) || !(A.width > 0) || !(A.height > 0) ? null : { op: "update", id: o.id, crop: A };
    O("canvas.cropX", "crop-x", I.x, (A) => D({ ...I, x: A })), O("canvas.cropY", "crop-y", I.y, (A) => D({ ...I, y: A })), O("canvas.cropWidth", "crop-width", I.width, (A) => D({ ...I, width: A })), O("canvas.cropHeight", "crop-height", I.height, (A) => D({ ...I, height: A }));
    const z = document.createElement("div");
    z.className = "field";
    const M = document.createElement("span");
    M.style.display = "contents", be.push(ot(M, {
      id: "clear-image-crop",
      label: () => y("canvas.clearCrop"),
      title: () => y("canvas.wholeImage"),
      className: "small crop-clear",
      disabled: u !== null || S === null,
      onClick: () => {
        oe("clear crop", { op: "update", id: o.id, crop: null });
      }
    })), z.append(M), e.append(z);
  }
  if (o.type === "shape") {
    e = t("Shape");
    const S = Vf(o), b = o.stroke?.color ?? ep, P = o.stroke?.width ?? tp, L = (A, _, H, W, Y, ae) => {
      const fe = document.createElement("div");
      fe.className = "field shape-field";
      const ie = document.createElement("span");
      ie.dataset.i18n = A, ie.textContent = y(A);
      const te = document.createElement("span");
      te.className = "shape-paint", Wr(
        te,
        _,
        y(A),
        H,
        u !== null,
        (he) => {
          oe(`change ${y(A)}`, Y(he));
        },
        _,
        {
          label: y("canvas.none"),
          className: `small ${_}-none`,
          title: y("canvas.removeColor", { label: y(A).toLowerCase() }),
          disabled: !W,
          onClear: () => {
            oe(`clear ${y(A)}`, ae());
          }
        }
      ), W || (te.title = y("canvas.noColor", { label: y(A).toLowerCase() })), fe.append(ie, te), e.append(fe);
    };
    L(
      "properties.fill",
      "shape-fill",
      o.fill ?? rc,
      !!o.fill,
      (A) => ({ op: "update", id: o.id, fill: A }),
      () => ({ op: "update", id: o.id, fill: null })
    ), L(
      "properties.stroke",
      "shape-stroke",
      b,
      !!o.stroke,
      (A) => ({ op: "update", id: o.id, stroke: { color: A, width: P } }),
      () => ({ op: "update", id: o.id, stroke: null })
    ), f(
      "properties.strokeWidth",
      String(P),
      (A) => ({
        op: "update",
        id: o.id,
        stroke: { color: b, width: Number(A) }
      }),
      "number",
      void 0,
      "shape-stroke-width"
    ), S === "rect" && f(
      "properties.cornerRadius",
      String(Ob(o)),
      (A) => ({ op: "update", id: o.id, cornerRadius: Number(A) }),
      "number",
      void 0,
      "shape-corner-radius"
    );
    const $ = (A, _) => {
      const H = pn.get(_);
      if (!H) return;
      const W = document.createElement("span");
      W.className = `control-error ${_}-note`, W.textContent = H, A.append(W);
    }, F = (A) => (_) => {
      pn.set(
        A,
        _ instanceof Ye ? ac(_) : String(_)
      ), lt();
    }, B = document.createElement("div");
    B.className = "field shape-field shape-path";
    const I = o.shape, O = S === "path" && typeof I.d == "string" ? I.d : "";
    be.push(ct(B, {
      id: "shape-path-d",
      label: () => y("canvas.pathData"),
      type: "textarea",
      value: O,
      className: "shape-path-d",
      rows: 3,
      maxLength: 2048,
      disabled: u !== null,
      onCommit: (A) => {
        const _ = A.trim();
        !_ || _ === O || (pn.delete("path-d"), oe("set path data", {
          op: "update",
          id: o.id,
          shape: { kind: "path", d: _ }
        }, F("path-d")));
      }
    })), $(B, "path-d"), e.append(B);
    const D = document.createElement("div");
    D.className = "field shape-field shape-dash-row";
    const z = (o.stroke?.dashArray ?? []).join(", ");
    be.push(ct(D, {
      id: "shape-dash",
      label: () => y("canvas.dashPattern"),
      type: "text",
      value: z,
      className: "shape-dash",
      placeholder: y("canvas.dashExample"),
      disabled: u !== null,
      onCommit: (A) => {
        const _ = A.trim();
        pn.delete("dash");
        const H = _ ? _.split(",").map((Y) => Number(Y.trim())) : [];
        if (H.some((Y) => !Number.isFinite(Y) || Y <= 0)) {
          pn.set("dash", y("canvas.dashPositiveError")), lt();
          return;
        }
        if (H.length > xl) {
          pn.set("dash", y("canvas.dashMaxError", { count: xl })), lt();
          return;
        }
        const W = {
          ...o.stroke ?? { color: b, width: P },
          dashArray: H.length ? H : null
        };
        oe("change dash pattern", { op: "update", id: o.id, stroke: W }, F("dash"));
      }
    })), $(D, "dash"), e.append(D);
    const M = (A, _, H, W) => {
      const Y = o.stroke?.[H], ae = typeof Y == "string" ? Y : null, fe = ae && !W.includes(ae) ? [...W, ae] : [...W];
      h(A, _, ae ?? W[0] ?? "", fe.map((ie) => ({ value: ie, label: ie })), (ie) => {
        const te = {
          ...o.stroke ?? { color: b, width: P },
          [H]: ie
        };
        oe(`change ${y(A).toLowerCase()}`, { op: "update", id: o.id, stroke: te });
      });
    };
    if (M("properties.lineCap", "shape-stroke-cap", "lineCap", ["butt", "round", "square"]), M("properties.lineJoin", "shape-stroke-join", "lineJoin", ["miter", "round", "bevel"]), S === "line") {
      const A = (_, H, W) => {
        const Y = I[W], ae = typeof Y == "string" && Y !== "none" && !["arrow", "circle"].includes(Y) ? ["none", "arrow", "circle", Y] : ["none", "arrow", "circle"];
        h(
          _,
          H,
          typeof Y == "string" ? Y : "none",
          ae.map((fe) => ({ value: fe, label: fe })),
          (fe) => {
            oe(`change ${y(_).toLowerCase()}`, {
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
  const w = Tx(o), x = [...Nx];
  w && !x.includes(w) && x.push(w), h("properties.clip", "clip-shape", w ?? "none", ["none", ...x].map((S) => ({ value: S, label: S })), (S) => {
    if (S === (w ?? "none")) return;
    const b = S === "none" ? null : S === "rect" ? { shape: "rect", cornerRadius: _l(o) } : { shape: S };
    oe("change clip", { op: "update", id: o.id, clip: b });
  }), w === "rect" && f(
    "properties.clipRadius",
    String(_l(o)),
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
  const C = (S, b, P, L) => {
    const $ = document.createElement("div");
    $.className = "field checkbox", be.push(Uo($, {
      id: b,
      label: () => y(S),
      checked: L,
      disabled: u !== null,
      className: b,
      onChange: (F) => {
        oe(y(S).toLowerCase(), { op: "update", id: o.id, [P]: F });
      }
    })), E.append($);
  };
  C("properties.flipHorizontal", "flip-horizontal", "flipHorizontal", o.transform.flipHorizontal ?? !1), C("properties.flipVertical", "flip-vertical", "flipVertical", o.transform.flipVertical ?? !1), e.append(E), e = t("Appearance"), h(
    "properties.blendMode",
    "blend-mode",
    o.blendMode ?? "normal",
    Lb.map((S) => ({ value: S, label: S })),
    (S) => {
      oe("change blend mode", { op: "update", id: o.id, blendMode: S });
    }
  ), qx(N.advancedInspector, o, u !== null), Kx(N.advancedInspector, o, u !== null), Xx(N.advancedInspector, o);
  const j = document.createElement("div");
  j.className = "property-flags";
  const R = document.createElement("div");
  R.className = "field checkbox", be.push(Uo(R, {
    id: "layer-visible",
    label: () => y("properties.visible"),
    checked: o.visible ?? !0,
    disabled: u !== null,
    onChange: (S) => {
      oe("show/hide", { op: "setVisible", id: o.id, visible: S });
    }
  }));
  const T = document.createElement("div");
  T.className = "field checkbox", be.push(Uo(T, {
    id: "layer-locked",
    label: () => y("properties.locked"),
    checked: o.locked ?? !1,
    disabled: wo(o, !0) !== null,
    onChange: (S) => {
      oe(S ? "lock layer" : "unlock layer", { op: "setLocked", id: o.id, locked: S });
    }
  })), j.append(R, T), e.append(j);
}
function pa(e) {
  return e === "hueRotate" ? y("effects.hueRotate") : e === "invert" ? y("effects.invert") : e.replace(/([A-Z])/g, " $1").replace(/^./, (t) => t.toUpperCase());
}
function qx(e, t, n) {
  const o = t.effects ?? [], r = ar(e, "Effects"), s = (f) => {
    oe("effects", { op: "update", id: t.id, effects: f });
  };
  for (const [f, h] of o.entries()) {
    const d = document.createElement("div");
    d.className = "effect-row", d.dataset.effect = h.type;
    const m = document.createElement("span");
    m.className = "effect-name", m.textContent = pa(h.type), (h.type === "hueRotate" || h.type === "invert") && (m.dataset.i18n = `effects.${h.type}`), d.append(m);
    const g = $b(h);
    g.length > 1 && d.classList.add("multi");
    const v = (E) => {
      const C = document.createElement("span");
      C.className = "effect-input-host";
      const j = `effect-${t.id}-${f}-${E.name}`;
      return be.push(ct(C, {
        id: j,
        label: () => `${pa(h.type)} ${E.name === "degrees" ? y("effects.degrees") : h.type === "invert" && E.name === "amount" ? y("effects.amount") : E.name}`,
        value: String(E.value),
        type: E.kind === "color" ? "text" : "number",
        step: E.kind === "number" ? E.name === "degrees" ? "1" : "0.05" : void 0,
        disabled: n,
        onMount: (R) => {
          R.dataset.field = E.name;
        },
        onCommit: (R) => {
          const T = E.kind === "color" ? R.trim() : Number(R);
          typeof T == "number" && !Number.isFinite(T) || T !== E.value && s(o.map((S, b) => b === f ? { ...S, [E.name]: T } : S));
        }
      })), C;
    };
    if (g.length === 1 && g[0])
      d.append(v(g[0]));
    else if (g.length > 1) {
      const E = document.createElement("span");
      E.className = "effect-fields";
      for (const C of g) {
        const j = document.createElement("label");
        j.className = "effect-field";
        const R = document.createElement("span");
        R.textContent = C.name, j.append(R, v(C)), E.append(j);
      }
      d.append(E);
    }
    const w = (E) => {
      const C = [...o], j = C[f], R = C[E];
      !j || !R || (C[f] = R, C[E] = j, s(C));
    }, x = (E, C, j, R, T) => {
      const S = document.createElement("span");
      return S.style.display = "contents", be.push(ot(S, {
        id: `effect-action-${t.id}-${f}-${E}`,
        className: E,
        label: C,
        title: C,
        icon: j,
        disabled: R,
        onClick: T
      })), S;
    };
    d.append(
      x("small effect-up", y("effects.moveUp", { effect: h.type }), "ph-arrow-up", n || f === 0, () => w(f - 1)),
      x("small effect-down", y("effects.moveDown", { effect: h.type }), "ph-arrow-down", n || f === o.length - 1, () => w(f + 1)),
      x("small effect-remove", y("effects.remove"), "ph-trash", n, () => s(o.filter((E, C) => C !== f)))
    ), r.append(d);
  }
  const a = document.createElement("div");
  a.className = "effect-add-row";
  let i = Sl[0] ?? "brightness";
  const c = document.createElement("span");
  be.push(ct(c, {
    id: `effect-chooser-${t.id}`,
    label: () => y("effects.choose"),
    value: i,
    className: "effect-chooser",
    disabled: n,
    options: Sl.map((f) => ({ value: f, label: () => pa(f) })),
    onCommit: (f) => {
      i = f;
    }
  }));
  const u = document.createElement("span");
  u.style.display = "contents", be.push(ot(u, {
    id: `effect-add-${t.id}`,
    className: "effect-add",
    icon: "ph-plus",
    label: () => y("effects.add"),
    disabled: n,
    onClick: () => {
      const f = N.advancedInspector.querySelector(".effect-chooser");
      f && (i = f.value), s([...o, zb(i)]);
    }
  })), a.append(c, u), r.append(a);
}
function Kx(e, t, n) {
  const o = ar(e, "Presets");
  if (k.presets.length === 0) {
    const a = document.createElement("p");
    a.className = "hint", a.dataset.i18n = "presets.none", a.textContent = y("presets.none"), o.append(a);
  }
  for (const a of k.presets) {
    const i = document.createElement("div");
    i.className = "preset-row";
    const c = document.createElement("span");
    c.className = "effect-name", c.textContent = a.name, a.description && (c.title = a.description), i.append(c);
    const u = document.createElement("span");
    u.style.display = "contents", be.push(ot(u, {
      id: `preset-apply-${++bn}`,
      label: () => y("common.apply"),
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
    f.style.display = "contents", be.push(ot(f, {
      id: `preset-remove-${++bn}`,
      label: () => y("common.delete"),
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
  s.style.display = "contents", be.push(ot(s, {
    id: `preset-save-${++bn}`,
    label: () => y("presets.saveStyle"),
    onClick: () => {
      Us("presets.saveTitle", "presets.name", "presets.saveButton", (a) => {
        oe(`define ${a}`, {
          op: "definePreset",
          preset: { name: a, properties: Fb(t) }
        });
      });
    }
  })), r.append(s), o.append(r);
}
function Xx(e, t) {
  const n = ar(e, "Slots");
  for (const i of k.slots) {
    const c = document.createElement("div");
    c.className = "slot-row";
    const u = document.createElement("span");
    u.className = "effect-name", u.textContent = `${i.name}${i.required ? " *" : ""}`, u.title = i.description ?? `${i.kind ?? "text"} → ${i.layer}`, i.layer === t.id && u.classList.add("slot-on-this-layer"), c.append(u);
    const f = document.createElement("span");
    f.style.display = "contents", be.push(ot(f, {
      id: `slot-edit-${++bn}`,
      label: () => y("common.edit"),
      className: "small slot-edit",
      title: () => y("slots.editHint", { name: i.name }),
      onMount(d) {
        d.dataset.slot = i.name, d.dataset.slotName = i.name;
      },
      onClick: () => Yx(c, i)
    })), c.append(f);
    const h = document.createElement("span");
    h.style.display = "contents", be.push(ot(h, {
      id: `slot-remove-${++bn}`,
      label: () => y("common.remove"),
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
  s.style.display = "contents", be.push(ct(s, {
    id: `slot-kind-${++bn}`,
    label: () => y("slots.kind"),
    value: r,
    className: "slot-kind-select",
    options: ["text", "image", "color"].map((i) => ({ value: i, label: i })),
    onCommit: (i) => {
      r = i;
    }
  }));
  const a = document.createElement("span");
  a.style.display = "contents", be.push(ot(a, {
    id: `slot-offer-${++bn}`,
    label: () => y("slots.offer"),
    onClick: () => {
      Us("slots.createTitle", "slots.name", "slots.createButton", (i) => {
        oe(`offer ${i}`, {
          op: "defineSlot",
          slot: { name: i, layer: t.id, kind: r }
        });
      });
    }
  })), o.append(s, a), n.append(o);
}
function Yx(e, t) {
  e.replaceChildren();
  const n = document.createElement("span"), o = document.createElement("span"), r = document.createElement("span"), s = document.createElement("span"), a = document.createElement("span");
  for (const u of [n, o, r, s, a]) u.style.display = "contents";
  e.append(n, o, r, s, a);
  const i = ++bn;
  be.push(ct(n, {
    id: `slot-edit-name-${i}`,
    label: () => y("slots.name"),
    value: t.name,
    className: "slot-edit-name",
    onCommit: () => {
    }
  })), be.push(ct(o, {
    id: `slot-edit-kind-${i}`,
    label: () => y("slots.kind"),
    value: t.kind ?? "text",
    className: "slot-edit-kind",
    options: ["text", "image", "color"].map((u) => ({ value: u, label: u })),
    onCommit: () => {
    }
  })), be.push(ct(r, {
    id: `slot-edit-layer-${i}`,
    label: () => y("slots.layerId"),
    title: () => y("slots.layerIdHint"),
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
  be.push(ot(s, {
    id: `slot-edit-save-${i}`,
    label: () => y("common.save"),
    className: "small slot-edit-save",
    onClick: () => c(!0)
  })), be.push(ot(a, {
    id: `slot-edit-cancel-${i}`,
    label: () => y("common.cancel"),
    className: "small",
    onClick: () => c(!1)
  })), e.addEventListener("keydown", (u) => {
    u.key === "Enter" && (u.preventDefault(), c(!0)), u.key === "Escape" && (u.preventDefault(), u.stopPropagation(), c(!1));
  }), e.querySelector(".slot-edit-name")?.focus();
}
let Wa = 0;
async function Gx() {
  if (!k.project) return;
  const e = ++Wa, t = await xb(k.project);
  e === Wa && (wr = { entries: t.entries, position: t.position, head: t.head }, Nt(), N.undo.disabled = t.position === 0, N.redo.disabled = t.position >= t.head);
}
function Kl(e, t, n) {
  const o = t - e.transform.x, r = n - e.transform.y;
  return o === 0 && r === 0 ? null : { op: "move", id: e.id, dx: o, dy: r };
}
function Xl(e, t, n) {
  return t === e.transform.width && n === e.transform.height ? null : { op: "resize", id: e.id, width: t, height: n };
}
function Jx(e) {
  if (!("id" in e) || e.op !== "update") return null;
  const t = e.id;
  if (typeof t != "string") return null;
  const n = Object.keys(e).filter((o) => o !== "op" && o !== "id" && o !== "expectedVersion").sort();
  return n.length > 0 ? `update:${t}:${n.join(",")}` : null;
}
function lp(e) {
  if (!k.document) return !1;
  let t = !1;
  for (const n of e)
    if (n.op === "move" || n.op === "resize" || n.op === "rotate") {
      const o = Be(Le(k.document)).find(({ layer: r }) => r.id === n.id)?.layer;
      if (!o) continue;
      n.op === "move" ? (o.transform.x += n.dx, o.transform.y += n.dy) : n.op === "resize" ? (o.transform.width = n.width, o.transform.height = n.height) : o.transform.rotation = n.degrees, t = !0;
    }
  return t && (ft(), ni() && hc(zt())), t;
}
function up() {
  const e = k.project, t = k.document ? structuredClone(k.document) : null;
  return () => {
    if (!t || k.project !== e) return;
    const n = k.document;
    if (n && $e(n) === $e(t)) {
      Et(), k.document = t, Nt(), ft(), lt();
      return;
    }
    Me("reload", Ge);
  };
}
function Yl(e, t, n) {
  return { project: e, document: t.id, layer: n.id, version: $e(t), text: n.text, runs: n.runs ?? [] };
}
async function Zx(e) {
  const t = sx(e);
  if (!t) return { status: "applied" };
  let n = !1;
  const o = await Tn.outcome("apply runs", async () => {
    const r = e.capture;
    if (k.project !== r.project || k.document?.id !== r.document || k.selection.length !== 1 || k.selection[0] !== r.layer) throw new Error(y("runs.notSent"));
    const s = Be(Le(k.document)).find((c) => c.layer.id === r.layer)?.layer;
    if (!s || wo(s)) throw new Error(y("runs.notSent"));
    const a = await Hn(r.project, t, r.version);
    n = !0;
    const i = a.document ?? await Ao(r.project);
    if (k.project !== r.project || k.document?.id !== r.document) throw new Error(y("runs.notSent"));
    _a.delete(ec(r)), Un(i), we(y("status.editDone", { version: a.version }));
  });
  return o.status === "applied" ? { status: "applied" } : (sn("apply runs", o.error), { status: n ? "committed" : o.error instanceof Ye ? "refused" : "unknown", error: n ? y("runs.committed") : o.error instanceof Ye ? ac(o.error) : `${y("runs.failed")} ${String(o.error)}` });
}
async function oe(e, t, n) {
  if (!k.project || !k.document) return;
  const o = k.project, r = up();
  let s = !1;
  lp([t]), await Tn.enqueue({
    label: e,
    coalesceKey: Jx(t),
    run: async () => {
      if (k.project !== o || !k.document) {
        we(y("status.editNotSent"), "error");
        return;
      }
      const a = await Hn(
        o,
        t,
        $e(k.document)
      );
      s = !0, we(y("status.editDone", { version: a.version })), a.created?.length && (k.selection = a.created), a.document ? Un(a.document) : await Ge();
    },
    onError: (a) => {
      s || r(), n && n(a), sn(e, a);
    },
    onSuperseded: r
  });
}
async function Qx(e, t) {
  await xt(e, t);
}
async function xt(e, t, n) {
  if (!k.project || !k.document || t.length === 0) return;
  const o = k.project, r = up();
  let s = !1;
  lp(t), await Tn.enqueue({
    label: e,
    coalesceKey: null,
    run: async () => {
      if (k.project !== o || !k.document || n && !Sr(n)) {
        r(), Et(), we(y("status.editNotSent"), "error");
        return;
      }
      const a = await Sb(
        o,
        e,
        t,
        n?.version ?? $e(k.document)
      );
      s = !0, a.created?.length && (k.selection = a.created), we(y("status.editDone", { version: a.version })), a.document ? Un(a.document) : await Ge();
    },
    onError: (a) => {
      s || r(), sn(e, a);
    }
  });
}
function ha(e, t, n, o, r) {
  if (e.preventDefault(), !k.document || N.canvas.getBoundingClientRect().width === 0 || k.drag && k.drag.pointerId !== e.pointerId || o === "resize" && !Va()) return;
  Je();
  const s = N.canvas;
  if (k.drag = {
    ids: t.map(({ layer: a }) => a.id),
    mode: o,
    handle: r,
    startX: e.clientX,
    startY: e.clientY,
    pointerId: e.pointerId,
    capture: s,
    project: k.project,
    version: $e(k.document),
    generation: ++sc,
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
  }, !e0(k.drag)) {
    _t !== null && Et(), Gl(k.drag);
    const a = wt;
    !k.drag.previewActive && a && a.pending.then(() => {
      k.drag && wt === a && Gl(k.drag);
    });
  }
  try {
    s.setPointerCapture?.(e.pointerId);
  } catch {
    e.isTrusted && Je();
  }
}
function e0(e) {
  return e.mode !== "move" || !k.document || nr === null || _t !== $e(k.document) ? !1 : (e.adoptedDelta = nr, e.previewActive = !0, pc(e, e.lastDelta?.x ?? 0, e.lastDelta?.y ?? 0), !0);
}
function fc(e) {
  return !k.project || !k.document ? null : `${k.project}:${$e(k.document)}:${[...e].sort().join(",")}`;
}
function dp() {
  const e = wt;
  if (wt = null, !!e) {
    e.baseUrl && !Ln.includes(e.baseUrl) && URL.revokeObjectURL(e.baseUrl), e.selectionUrl && !Ln.includes(e.selectionUrl) && URL.revokeObjectURL(e.selectionUrl);
    for (const t of e.items ?? []) Ln.includes(t.url) || URL.revokeObjectURL(t.url);
  }
}
async function fp(e) {
  const t = fc(e);
  if (!t || !k.project || !k.document) return;
  if (wt?.key === t) return wt.pending;
  dp();
  const n = k.project, o = $e(k.document), r = rr(), s = {
    key: t,
    pending: Promise.resolve()
  };
  return wt = s, s.pending = Promise.all([
    Fn(es(n, o, r, { exclude: e })),
    Fn(es(n, o, r, { only: e }))
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
function Gl(e) {
  if (e.mode === "resize") {
    is(e);
    return;
  }
  const t = wt;
  if (e.previewActive || t?.key !== fc(e.ids) || !t.baseUrl || !t.selectionUrl) return;
  const n = document.createElement("img");
  n.id = "drag-preview-base", n.className = "drag-preview-image", n.alt = "", n.src = t.baseUrl;
  const o = document.createElement("img");
  o.id = "drag-preview-selection", o.className = "drag-preview-image drag-preview-selection", o.alt = "", o.src = t.selectionUrl, N.overlay.before(n, o), N.canvasImage.classList.add("drag-preview-hidden"), Ln = [t.baseUrl, t.selectionUrl], e.previewActive = !0, pc(e, e.lastDelta?.x ?? 0, e.lastDelta?.y ?? 0);
}
function Et() {
  document.getElementById("drag-preview-base")?.remove(), document.getElementById("drag-preview-selection")?.remove(), document.querySelectorAll("[data-resize-preview-item]").forEach((e) => e.remove()), N.canvasImage.classList.remove("drag-preview-hidden");
  for (const e of Ln) URL.revokeObjectURL(e);
  Ln = [], _t = null, nr = null, dp();
}
function as(e) {
  return e.handle?.length === 2 && e.origins.length === 1 && e.origins[0]?.layer.type === "image" ? !e.shift : e.shift;
}
function Sr(e) {
  if (e.cancelled || e.generation !== sc || k.project !== e.project || !k.document || $e(k.document) !== e.version) return !1;
  const t = Be(Le(k.document));
  return e.ids.every((n) => {
    const o = t.find((r) => r.layer.id === n);
    return o && rt(o.layer) && dc(t, o.parent) !== null;
  });
}
function qa(e) {
  e.capture.hasPointerCapture?.(e.pointerId) && e.capture.releasePointerCapture(e.pointerId);
}
function Je() {
  const e = k.drag?.mode === "resize" ? k.drag : yn;
  e && (e.cancelled = !0, sc += 1, k.drag === e && (k.drag = null), yn = null, qa(e), Et(), delete N.canvas.dataset.resizePreview, ft());
}
function pp(e, t, n) {
  const o = iw(
    e.bounds,
    e.origins.length === 1 ? e.origins[0].rotation : 0,
    e.handle ?? "se",
    t,
    n,
    { ratio: as(e), centre: e.alt },
    e.origins
  ), r = e.measurement;
  return o && r?.height !== void 0 && r.width === o.width && r.epoch === e.epoch && !as(e) && (o.y += (o.height - r.height) / 2, o.height = r.height), o && Object.values(o).every(Number.isFinite) ? o : null;
}
function hp(e, t) {
  return e.origins.map((n) => ({ origin: n, next: e.origins.length === 1 ? t : Wf(
    { x: n.absoluteX, y: n.absoluteY, width: n.width, height: n.height },
    e.bounds,
    t,
    !0
  ) }));
}
function t0(e, t) {
  const n = e.origins[0];
  if (e.origins.length !== 1 || n?.layer.type !== "text" || as(e) || e.handle !== "e" && e.handle !== "w" || t.width === e.bounds.width || e.measurement?.width === t.width && e.measurement.epoch === e.epoch) return;
  const o = { width: t.width, epoch: e.epoch, pending: Promise.resolve(), height: void 0 };
  e.measurement = o, o.pending = Uf(e.project, n.id, t.width).then((r) => {
    if (!Sr(e) || e.measurement !== o || e.epoch !== o.epoch || as(e)) return;
    const s = Math.max(1, Math.ceil(r.height));
    Number.isFinite(s) && (o.height = s, k.drag === e && qs(e));
  }).catch(() => {
  });
}
function Bo(e) {
  (e.previewActive || _t !== null || document.querySelector(".drag-preview-image")) && Et(), e.previewActive = !1, N.canvas.dataset.resizePreview = "handles-only";
}
function is(e) {
  if (!k.document || e.cancelled || !Sr(e)) return;
  const t = e.next, n = cw(k.document, e.ids), o = t ? hp(e, t) : [], r = o.some(({ origin: u, next: f }) => [
    { x: u.absoluteX, y: u.absoluteY, width: u.width, height: u.height },
    f
  ].some((h) => {
    const d = ns({ ...h, rotation: u.rotation });
    return d.x < 0 || d.y < 0 || d.x + d.width > k.document.canvas.width || d.y + d.height > k.document.canvas.height;
  })), s = N.canvasImage.getBoundingClientRect(), a = s.width === k.document.canvas.width && s.height === k.document.canvas.height;
  if (!t || !n || r || !a) {
    Bo(e);
    return;
  }
  const i = wt;
  if (!i || i.key !== fc(e.ids) || !i.baseUrl) {
    Bo(e), fp(e.ids).then(() => {
      k.drag === e && is(e);
    });
    return;
  }
  if (!i.items) {
    Bo(e), i.itemsPending ??= (async () => {
      const u = [];
      try {
        for (const f of n) u.push({ id: f.id, url: await Fn(es(e.project, e.version, rr(), { only: [f.id] })) });
        if (wt !== i) {
          for (const f of u) URL.revokeObjectURL(f.url);
          return;
        }
        i.items = u, k.drag === e && is(e);
      } catch {
        for (const f of u) URL.revokeObjectURL(f.url);
      }
    })();
    return;
  }
  const c = i.items.map((u) => {
    const f = o.find(({ origin: h }) => h.id === u.id);
    return lw(
      f.origin.layer,
      { x: f.origin.absoluteX, y: f.origin.absoluteY, width: f.origin.width, height: f.origin.height },
      f.next
    );
  });
  if (c.some((u) => !u)) {
    Bo(e);
    return;
  }
  if (!e.previewActive) {
    const u = document.createElement("img");
    u.id = "drag-preview-base", u.className = "drag-preview-image", u.alt = "", u.src = i.baseUrl, u.style.objectFit = "contain", N.overlay.before(u);
    for (const f of i.items) {
      const h = document.createElement("img");
      h.className = "drag-preview-image drag-preview-selection", h.dataset.resizePreviewItem = f.id, h.alt = "", h.src = f.url, h.style.objectFit = "contain", N.overlay.before(h);
    }
    N.canvasImage.classList.add("drag-preview-hidden"), Ln = [i.baseUrl, ...i.items.map((f) => f.url)], e.previewActive = !0;
  }
  for (let u = 0; u < i.items.length; u += 1) {
    const f = document.querySelector(`[data-resize-preview-item="${CSS.escape(i.items[u].id)}"]`), h = c[u];
    f.style.transformOrigin = "0 0", f.style.transform = `matrix(${h[0]},${h[1]},${h[2]},${h[3]},${h[4] * s.width / k.document.canvas.width},${h[5] * s.height / k.document.canvas.height})`;
  }
  N.canvas.dataset.resizePreview = "items";
}
function qs(e) {
  if (!Sr(e)) {
    Je();
    return;
  }
  const t = pp(e, e.lastDelta?.x ?? 0, e.lastDelta?.y ?? 0);
  if (e.invalid = t === null, e.next = t ?? void 0, !t) {
    Bo(e);
    return;
  }
  t0(e, t);
  const n = N.overlay.querySelector(".handle-box");
  n && k.document && (n.style.left = `${t.x / k.document.canvas.width * 100}%`, n.style.top = `${t.y / k.document.canvas.height * 100}%`, n.style.width = `${t.width / k.document.canvas.width * 100}%`, n.style.height = `${t.height / k.document.canvas.height * 100}%`), is(e);
}
function pc(e, t, n) {
  if (e.mode === "resize") {
    qs(e);
    return;
  }
  if (!k.document || !e.previewActive) return;
  const o = document.getElementById("drag-preview-selection");
  if (!o) return;
  const r = k.document.canvas;
  if (o.style.transformOrigin = "0 0", e.mode === "move")
    o.style.transform = `translate(${((e.adoptedDelta?.x ?? 0) + t) / r.width * 100}%, ${((e.adoptedDelta?.y ?? 0) + n) / r.height * 100}%)`;
  else {
    const s = N.canvas.getBoundingClientRect(), a = s.left + (e.bounds.x + e.bounds.width / 2) / r.width * s.width, i = s.top + (e.bounds.y + e.bounds.height / 2) / r.height * s.height, c = Math.atan2(e.startY - i, e.startX - a), u = Math.atan2(e.startY + n / Zt() - i, e.startX + t / Zt() - a);
    o.style.transformOrigin = `${(e.bounds.x + e.bounds.width / 2) / r.width * 100}% ${(e.bounds.y + e.bounds.height / 2) / r.height * 100}%`, o.style.transform = `rotate(${(u - c) * 180 / Math.PI}deg)`;
  }
}
function Zt() {
  const e = N.canvas.getBoundingClientRect();
  return k.document && e.width !== 0 ? k.document.canvas.width / e.width : 1;
}
function mp(e) {
  const t = k.drag;
  if (t?.mode !== "resize") return !1;
  if (e.key === "Escape")
    return e.preventDefault(), Je(), !0;
  if (e.key !== "Shift" && e.key !== "Alt") return !1;
  const n = e.key === "Shift" ? e.type === "keydown" : e.shiftKey, o = e.key === "Alt" ? e.type === "keydown" : e.altKey;
  return (n !== t.shift || o !== t.alt) && (t.shift = n, t.alt = o, t.epoch += 1, t.measurement = void 0, qs(t)), !0;
}
window.addEventListener("pointermove", (e) => {
  const t = k.drag;
  if (!t || !k.document || e.pointerId !== t.pointerId) return;
  let n = (e.clientX - t.startX) * Zt(), o = (e.clientY - t.startY) * Zt();
  N.overlay.querySelectorAll(".smart-guide").forEach((s) => s.remove()), t.mode === "move" && ({ dx: n, dy: o } = n0(n, o, t.bounds, t.ids, Zt())), t.mode === "resize" && (t.shift !== e.shiftKey || t.alt !== e.altKey) && (t.shift = e.shiftKey, t.alt = e.altKey, t.epoch += 1, t.measurement = void 0), t.lastDelta = { x: n, y: o }, pc(t, n, o);
  const r = N.overlay.querySelector(".handle-box");
  if (r) {
    if (t.mode === "move")
      r.style.left = `${(t.bounds.x + n) / k.document.canvas.width * 100}%`, r.style.top = `${(t.bounds.y + o) / k.document.canvas.height * 100}%`;
    else if (t.mode === "rotate") {
      const s = N.canvas.getBoundingClientRect(), a = s.left + (t.bounds.x + t.bounds.width / 2) / k.document.canvas.width * s.width, i = s.top + (t.bounds.y + t.bounds.height / 2) / k.document.canvas.height * s.height, c = (Math.atan2(e.clientY - i, e.clientX - a) - Math.atan2(t.startY - i, t.startX - a)) * 180 / Math.PI;
      r.style.transform = `rotate(${(t.origins.length === 1 ? t.origins[0].rotation : 0) + c}deg)`;
    }
  }
});
window.addEventListener("pointerup", async (e) => {
  const t = k.drag;
  if (!t || e.pointerId !== t.pointerId) return;
  if (t.mode === "resize") {
    if ((t.shift !== e.shiftKey || t.alt !== e.altKey) && (t.shift = e.shiftKey, t.alt = e.altKey, t.epoch += 1, t.measurement = void 0), t.lastDelta = { x: (e.clientX - t.startX) * Zt(), y: (e.clientY - t.startY) * Zt() }, qs(t), k.drag = null, yn = t, qa(t), await t.measurement?.pending, !Sr(t) || t.invalid) {
      yn === t && Je();
      return;
    }
    const r = pp(t, t.lastDelta.x, t.lastDelta.y);
    if (!r) {
      Je();
      return;
    }
    if (r.x === t.bounds.x && r.y === t.bounds.y && r.width === t.bounds.width && r.height === t.bounds.height) {
      yn = null, Et(), ft();
      return;
    }
    const s = [];
    for (const { origin: a, next: i } of hp(t, r)) {
      const c = i.x - a.absoluteX, u = i.y - a.absoluteY;
      (c !== 0 || u !== 0) && s.push({ op: "move", id: a.id, dx: c, dy: u }), (i.width !== a.width || i.height !== a.height) && s.push({ op: "resize", id: a.id, width: i.width, height: i.height });
    }
    if (yn = null, !s.length) {
      Et(), ft();
      return;
    }
    _t = t.previewActive ? t.version + 1 : null, nr = null, await xt("resize selection", s, t), delete N.canvas.dataset.resizePreview;
    return;
  }
  k.drag = null, qa(t);
  const n = Math.round(t.lastDelta?.x ?? (e.clientX - t.startX) * Zt()), o = Math.round(t.lastDelta?.y ?? (e.clientY - t.startY) * Zt());
  if (n === 0 && o === 0) {
    _t === null && Et();
    return;
  }
  if (_t = $e(k.document) + 1, nr = t.mode === "move" ? { x: (t.adoptedDelta?.x ?? 0) + n, y: (t.adoptedDelta?.y ?? 0) + o } : null, t.mode === "move")
    xt("move selection", t.ids.map((r) => ({ op: "move", id: r, dx: n, dy: o })));
  else {
    const r = N.canvas.getBoundingClientRect(), s = r.left + (t.bounds.x + t.bounds.width / 2) / k.document.canvas.width * r.width, a = r.top + (t.bounds.y + t.bounds.height / 2) / k.document.canvas.height * r.height, i = (Math.atan2(e.clientY - a, e.clientX - s) - Math.atan2(t.startY - a, t.startX - s)) * 180 / Math.PI;
    xt("rotate selection", t.origins.map((c) => ({ op: "rotate", id: c.id, degrees: Math.round((c.rotation + i) * 10) / 10 })));
  }
});
window.addEventListener("pointercancel", (e) => {
  k.drag?.pointerId === e.pointerId && Je();
});
window.addEventListener("lostpointercapture", (e) => {
  k.drag?.pointerId === e.pointerId && Je();
}, !0);
window.addEventListener("blur", Je);
function n0(e, t, n, o, r) {
  if (!k.document) return { dx: e, dy: t };
  const s = 6 * r, a = Be(Le(k.document));
  let i = n;
  if (o.length === 1) {
    const b = a.find(({ layer: L }) => L.id === o[0]), P = b ? sr(a, b.parent) : null;
    b && P && (i = ns({
      x: b.layer.transform.x + P.x,
      y: b.layer.transform.y + P.y,
      width: b.layer.transform.width,
      height: b.layer.transform.height,
      rotation: b.layer.transform.rotation ?? 0
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
  ], f = [0, k.document.canvas.width / 2, k.document.canvas.width], h = [0, k.document.canvas.height / 2, k.document.canvas.height], d = [];
  for (const { layer: b, parent: P } of a) {
    if (o.includes(b.id)) continue;
    const L = sr(a, P);
    if (!L) continue;
    const $ = ns({
      x: b.transform.x + L.x,
      y: b.transform.y + L.y,
      width: b.transform.width,
      height: b.transform.height,
      rotation: b.transform.rotation ?? 0
    });
    d.push({
      left: $.x,
      right: $.x + $.width,
      top: $.y,
      bottom: $.y + $.height
    }), f.push($.x, $.x + $.width / 2, $.x + $.width), h.push($.y, $.y + $.height / 2, $.y + $.height);
  }
  const m = (b, P) => {
    let L = null;
    for (const $ of b) for (const F of P) {
      const B = F - $;
      Math.abs(B) <= s && (!L || Math.abs(B) < Math.abs(L.delta)) && (L = { delta: B, target: F });
    }
    return L;
  }, g = m(c, f), v = m(u, h);
  g && (e += g.delta, oo("vertical", g.target)), v && (t += v.delta, oo("horizontal", v.target));
  const w = i.x + e, x = w + i.width, E = d.filter((b) => b.right <= w + s).sort((b, P) => P.right - b.right)[0], C = d.filter((b) => b.left >= x - s).sort((b, P) => b.left - P.left)[0];
  if (E && C) {
    const P = E.right + (C.left - E.right - i.width) / 2 - w;
    Math.abs(P) <= s && (e += P, oo("vertical", E.right), oo("vertical", C.left));
  }
  const j = i.y + t, R = j + i.height, T = d.filter((b) => b.bottom <= j + s).sort((b, P) => P.bottom - b.bottom)[0], S = d.filter((b) => b.top >= R - s).sort((b, P) => b.top - P.top)[0];
  if (T && S) {
    const P = T.bottom + (S.top - T.bottom - i.height) / 2 - j;
    Math.abs(P) <= s && (t += P, oo("horizontal", T.bottom), oo("horizontal", S.top));
  }
  return { dx: e, dy: t };
}
function oo(e, t) {
  if (!k.document) return;
  const n = document.createElement("div");
  n.className = `smart-guide ${e}`, e === "vertical" ? n.style.left = `${t / k.document.canvas.width * 100}%` : n.style.top = `${t / k.document.canvas.height * 100}%`, N.overlay.append(n);
}
function Cr() {
  if (!k.document) return [];
  const e = Be(Le(k.document));
  return e.flatMap(({ layer: t, parent: n }) => {
    if (!k.selection.includes(t.id)) return [];
    const o = sr(e, n);
    return o ? [{
      layer: t,
      x: t.transform.x + o.x,
      y: t.transform.y + o.y,
      width: t.transform.width,
      height: t.transform.height
    }] : [];
  });
}
function o0(e = Cr()) {
  if (e.length === 0) return null;
  if (e.length === 1) {
    const t = e[0];
    return { x: t.x, y: t.y, width: t.width, height: t.height };
  }
  return Qi(e.map((t) => ({
    x: t.x,
    y: t.y,
    width: t.width,
    height: t.height,
    rotation: t.layer.transform.rotation ?? 0
  })));
}
function gp(e = Cr()) {
  return e.length === 0 ? null : Qi(e.map((t) => ({
    x: t.x,
    y: t.y,
    width: t.width,
    height: t.height,
    rotation: t.layer.transform.rotation ?? 0
  })));
}
function Io() {
  if (!k.document) return;
  const e = ap(), t = k.zoom ?? e;
  N.canvas.style.width = `${Math.max(1, Math.round(k.document.canvas.width * t))}px`, N.canvas.style.height = `${Math.max(1, Math.round(k.document.canvas.height * t))}px`, N.zoomValue.textContent = k.zoom === null ? y("canvas.zoomFit") : `${Re(Math.round(t * 100))}%`, N.zoomValue.title = k.zoom === null ? y("canvas.zoomFitPercent", { percent: Re(Math.round(e * 100)) }) : y("canvas.zoomResetFit");
}
function r0() {
  const e = N.stageViewport.getBoundingClientRect();
  return {
    x: e.left + N.stageViewport.clientLeft + N.stageViewport.clientWidth / 2,
    y: e.top + N.stageViewport.clientTop + N.stageViewport.clientHeight / 2
  };
}
function jr(e, t = r0()) {
  const n = N.canvas.getBoundingClientRect(), o = n.width > 0 ? (t.x - n.left) / n.width : 0.5, r = n.height > 0 ? (t.y - n.top) / n.height : 0.5;
  if (k.zoom = e === null ? null : Math.min(4, Math.max(0.1, e)), Io(), uc(), k.zoom === null) {
    N.stageViewport.scrollLeft = 0, N.stageViewport.scrollTop = 0;
    return;
  }
  if (n.width <= 0 || n.height <= 0) return;
  const s = N.canvas.getBoundingClientRect();
  N.stageViewport.scrollLeft += s.left + o * s.width - t.x, N.stageViewport.scrollTop += s.top + r * s.height - t.y;
}
function xo(e) {
  if (!k.document || !rt(e)) return;
  N.overlay.querySelector(".inline-text-editor")?.remove();
  const t = Be(Le(k.document)), n = t.find(({ layer: i }) => i.id === e.id), o = sr(t, n?.parent ?? null);
  if (!o) return;
  const r = document.createElement("textarea");
  r.className = "inline-text-editor", r.value = e.text, r.setAttribute("aria-label", y("canvas.editText")), r.dataset.i18nAttr = "aria-label:canvas.editText", r.style.left = `${(e.transform.x + o.x) / k.document.canvas.width * 100}%`, r.style.top = `${(e.transform.y + o.y) / k.document.canvas.height * 100}%`, r.style.width = `${e.transform.width / k.document.canvas.width * 100}%`, r.style.height = `${e.transform.height / k.document.canvas.height * 100}%`, r.style.transformOrigin = "center", r.style.transform = `rotate(${e.transform.rotation ?? 0}deg)`, r.style.fontFamily = e.fontFamily, r.style.fontSize = `${Math.max(12, e.fontSize * (N.canvas.getBoundingClientRect().width / k.document.canvas.width))}px`, r.style.lineHeight = String(e.lineHeight ?? 1.2), r.style.textAlign = e.align ?? "left", r.style.color = Rx(e.color) ?? "#000000", N.overlay.append(r), k.editingText = { id: e.id, original: e.text }, r.focus(), r.select();
  let s = !1;
  const a = (i) => {
    if (s) return;
    s = !0;
    const c = r.value;
    r.remove(), k.editingText = null, i && c !== e.text ? oe("edit text", { op: "update", id: e.id, text: c }) : ft();
  };
  r.addEventListener("keydown", (i) => {
    i.key === "Escape" ? (i.preventDefault(), a(!1)) : i.key === "Enter" && (i.ctrlKey || i.metaKey) && (i.preventDefault(), a(!0));
  }), r.addEventListener("blur", () => a(!0));
}
function hc(e) {
  Qa(() => s0(e));
}
function s0(e) {
  for (const r of ma) r();
  ma = [];
  const t = Cr(), n = o0(t);
  if (!n || e.length === 0) return;
  const o = [
    ["X", n.x, "x"],
    ["Y", n.y, "y"],
    ["W", n.width, "width"],
    ["H", n.height, "height"],
    ["°", e.length === 1 ? e[0]?.transform.rotation ?? 0 : 0, "rotation"]
  ];
  for (const [r, s, a] of o) {
    const i = ct(N.positionFields, {
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
            if (a === "width" && e.length === 1 && e[0]?.type === "text" && k.project)
              try {
                const d = await Uf(k.project, e[0].id, u);
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
              } : Wf(d, n, f), g = m.x - d.x, v = m.y - d.y;
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
    ma.push(i);
  }
}
let ma = [];
function Bn(e) {
  const t = e ?? !ni();
  if (qp(t), !t) return;
  hc(zt());
  const o = N.inspector.querySelector(".position-button")?.getBoundingClientRect(), r = N.inspector.getBoundingClientRect().left + 8, s = N.structure.getBoundingClientRect().left, a = (o?.right ?? r + 320) - 320;
  N.positionPopover.style.left = `${Math.max(r, Math.min(s - 332, a))}px`, N.positionPopover.style.top = `${Math.min(window.innerHeight - 520, (o?.bottom ?? 100) + 8)}px`, N.positionPopover.querySelector("[data-canvas-anchor]")?.focus();
}
const vp = "assemblash-layer-clipboard-v1";
function cs() {
  if (!k.project || !k.document || k.selection.length === 0) return !1;
  const e = Be(Le(k.document)), t = new Set(k.selection), n = e.filter(({ layer: o, parent: r }) => t.has(o.id) && (!r || !t.has(r))).map(({ layer: o }) => structuredClone(o));
  return sessionStorage.setItem(vp, JSON.stringify({ project: k.project, layers: n })), we(Ot("editor.copiedLayers", n.length)), n.length > 0;
}
function yp() {
  if (!k.project) return null;
  try {
    const e = JSON.parse(sessionStorage.getItem(vp) ?? "null");
    return e?.project === k.project && Array.isArray(e.layers) ? e.layers : null;
  } catch {
    return null;
  }
}
function bp() {
  const e = yp();
  if (!e || !k.project) {
    we(y("editor.nothingToPaste"), "error");
    return;
  }
  xt("paste layers", [{
    op: "insertLayerTree",
    sourceProject: k.project,
    layers: e,
    position: { at: "root" },
    offsetX: 20,
    offsetY: 20
  }]);
}
function ir(e = "delete selection") {
  const t = zt();
  t.length === 0 || t.some((n) => !rt(n)) || xt(e, t.map((n) => ({ op: "delete", id: n.id })));
}
function Or(e) {
  if (!k.document || k.selection.length !== 1) return;
  const t = k.selection[0], n = Be(Le(k.document)), o = n.find(({ layer: u }) => u.id === t);
  if (!o || !rt(o.layer)) return;
  const r = o.parent ? n.find(({ layer: u }) => u.id === o.parent)?.layer : null, s = r?.type === "group" ? r.children ?? [] : Le(k.document), a = s.findIndex((u) => u.id === t);
  let i = a;
  if (e === "front" && (i = s.length - 1), e === "forward" && (i = Math.min(s.length - 1, a + 1)), e === "backward" && (i = Math.max(0, a - 1)), e === "back" && (i = 0), i === a) return;
  const c = o.parent ? { at: "in", parent: o.parent, index: i } : { at: "root", index: i };
  oe(`send ${e}`, { op: "reorder", id: t, to: c });
}
function cr(e, t) {
  const n = zt(), o = n.length > 0 && n.every(rt), r = n.length === 1 ? n[0] : null, s = [], a = (c, u, f, h = !1) => {
    s.push({ kind: "item", key: c, icon: u, disabled: h, run: f });
  }, i = () => {
    s.push({ kind: "separator" });
  };
  r?.type === "text" && (a("context.editText", "ph-pencil-simple", () => xo(r), !o), i()), a("context.cut", "ph-scissors", () => {
    cs() && ir("cut layers");
  }, !o), a("context.copy", "ph-copy", () => {
    cs();
  }, n.length === 0), a("context.paste", "ph-clipboard-text", bp, !yp()), a("context.duplicate", "ph-copy-simple", () => {
    xt("duplicate", n.map((c) => ({ op: "duplicate", id: c.id })));
  }, !o), a("context.delete", "ph-trash", ir, !o), i(), a("context.bringFront", "ph-arrow-line-up", () => Or("front"), !r || !o), a("context.bringForward", "ph-arrow-up", () => Or("forward"), !r || !o), a("context.sendBackward", "ph-arrow-down", () => Or("backward"), !r || !o), a("context.sendBack", "ph-arrow-line-down", () => Or("back"), !r || !o), i(), a("context.group", "ph-stack", () => {
    oe("group", { op: "group", ids: n.map((c) => c.id) });
  }, n.length < 2 || !o), a("context.ungroup", "ph-stack-minus", () => {
    r && oe("ungroup", { op: "ungroup", id: r.id });
  }, r?.type !== "group" || !o), a(r?.locked ? "context.unlock" : "context.lock", r?.locked ? "ph-lock-open" : "ph-lock", () => {
    r && oe(r.locked ? "unlock layer" : "lock layer", { op: "setLocked", id: r.id, locked: !r.locked });
  }, !r || wo(r, !0) !== null), a(r?.visible === !1 ? "context.show" : "context.hide", r?.visible === !1 ? "ph-eye" : "ph-eye-slash", () => {
    r && oe(r.visible === !1 ? "show layer" : "hide layer", { op: "setVisible", id: r.id, visible: r.visible === !1 });
  }, !r || !o), a("context.rename", "ph-pencil-simple", () => {
    if (!r) return;
    Oo("layers");
    const c = N.layers.querySelector(`[data-id="${CSS.escape(r.id)}"]`);
    c && (c.focus(), c.dispatchEvent(new KeyboardEvent("keydown", { key: "F2", bubbles: !0 })));
  }, !r || !o), i(), a("context.alignLeft", "ph-align-left-simple", () => ro("left"), !o), a("context.alignHorizontalCenters", "ph-align-center-horizontal", () => ro("centerHorizontal"), !o), a("context.alignRight", "ph-align-right-simple", () => ro("right"), !o), a("context.alignTop", "ph-align-top-simple", () => ro("top"), !o), a("context.alignVerticalMiddles", "ph-align-center-vertical", () => ro("centerVertical"), !o), a("context.alignBottom", "ph-align-bottom-simple", () => ro("bottom"), !o), a("context.distributeHorizontally", "ph-columns", () => {
    oe("distribute horizontally", { op: "distribute", ids: n.map((c) => c.id), axis: "horizontal" });
  }, !o || n.length < 3), a("context.distributeVertically", "ph-rows", () => {
    oe("distribute vertically", { op: "distribute", ids: n.map((c) => c.id), axis: "vertical" });
  }, !o || n.length < 3), Sn.open(s, e, t);
}
function ro(e) {
  if (!k.document) return;
  const t = zt(), n = t.map((a) => a.id);
  if (t.length !== 1) {
    oe("align selection", { op: "align", ids: n, edge: e });
    return;
  }
  const o = gp(Cr());
  if (!o) return;
  let r = 0, s = 0;
  e === "left" && (r = -o.x), e === "centerHorizontal" && (r = k.document.canvas.width / 2 - (o.x + o.width / 2)), e === "right" && (r = k.document.canvas.width - (o.x + o.width)), e === "top" && (s = -o.y), e === "centerVertical" && (s = k.document.canvas.height / 2 - (o.y + o.height / 2)), e === "bottom" && (s = k.document.canvas.height - (o.y + o.height)), (r !== 0 || s !== 0) && oe("align layer to canvas", { op: "move", id: t[0].id, dx: r, dy: s });
}
function wp(e) {
  Je(), Me("open", () => bc(e));
}
const mc = /* @__PURE__ */ new Map();
function gc(e) {
  return e.record.state.document?.name ?? mc.get(e.id) ?? e.id;
}
const a0 = Ww({
  activate: (e) => {
    ve.active?.id !== e && (Je(), Me("switch tab", () => bc(e)));
  },
  close: (e) => {
    Je(), Me("close tab", () => c0(e));
  },
  move: (e, t) => {
    ve.move(e, t) && (At(), nn());
  }
}, J("project-tabs-root"));
function At() {
  a0.setTabs(ve.all.map((e) => ({
    id: e.id,
    name: gc(e),
    active: e === ve.active,
    changed: e.changed,
    group: e.group,
    thumbnail: e.group ? e.record.thumbnail : null
  })));
}
function vc(e) {
  e.record.thumbnail && URL.revokeObjectURL(e.record.thumbnail), e.record.thumbnail = null;
}
function yc(e) {
  e.group && Me("tab thumbnail", async () => {
    if (!(!e.group || !ve.all.includes(e)))
      try {
        const t = await Fn(Ff(e.id));
        if (!e.group || !ve.all.includes(e)) {
          URL.revokeObjectURL(t);
          return;
        }
        vc(e), e.record.thumbnail = t, At();
      } catch (t) {
        console.error(`could not read the thumbnail of ${e.id}`, t);
      }
  });
}
async function i0(e) {
  const n = (await Rb(e)).pages.map((s) => s.project), o = Lw(n, ve.all.map((s) => s.id));
  if (o.kind === "empty") {
    we(y("pageSets.empty", { set: e }), "error");
    return;
  }
  if (o.kind === "tooMany") {
    we(y("pageSets.tooMany", { set: e, count: o.count, max: o.max }), "error");
    return;
  }
  const r = [];
  try {
    for (const s of o.toOpen) r.push([s, await Ao(s)]);
  } catch (s) {
    for (const [a] of r) await Bf(a).catch(() => !1);
    throw s;
  }
  Ks();
  for (const [s, a] of r) {
    const { entry: i } = ve.open(s, () => oc(s));
    i.record.state.document = a;
  }
  ve.arrange(o.order), ve.setGroup(e, o.pages), At(), nn(), await So(ve.find(o.pages[0]));
  for (const s of o.pages) {
    const a = ve.find(s);
    a && yc(a);
  }
  we(y("pageSets.opened", { set: e, count: o.pages.length }));
}
function nn() {
  wb(ve.serialize()).catch((e) => {
    console.error("could not save the open tabs", e);
  });
}
function Ks() {
  const e = ve.active;
  if (!e) return;
  const t = e.record;
  Je(), t.scroll = { left: N.stageViewport.scrollLeft, top: N.stageViewport.scrollTop }, t.layerQuery = or, t.historySnapshot = wr, t.activeDock = xr, t.addSection = N.addPanel.classList.contains("collapsed") ? null : xc, t.templateDraft = $t.draft(), k.drag = null, Sn.close(), Bn(!1), Et(), xp(), Ha++, Ua++, Wa++, pn.clear(), e.group && yc(e);
}
function xp() {
  const e = N.canvasImage.src;
  N.canvasImage.removeAttribute("src"), delete N.canvasImage.dataset.previewName, e.startsWith("blob:") && URL.revokeObjectURL(e), cc = null;
}
function po(e) {
  ve.activate(e?.id ?? null);
  const t = e?.record;
  if (k = t?.state ?? nc(null), or = t?.layerQuery ?? "", wr = t?.historySnapshot ?? null, xr = t?.activeDock ?? "layers", Hs.setCurrentProject(e?.id ?? null), t && t.addSection !== void 0) {
    if (t.addSection === null) Do();
    else if (t.addSection !== xc || N.addPanel.classList.contains("collapsed")) {
      const n = Xa.find(([o]) => o === t.addSection);
      n && Mo(n[0], n[2]);
    }
  }
  At();
}
async function bc(e) {
  const t = ve.active;
  if (t && t.id === e) {
    k.selection = [], Et(), await Ka();
    return;
  }
  if (Ks(), e === null) {
    po(null), Wo(), nn();
    return;
  }
  const n = ve.find(e);
  if (n) {
    await So(n), nn();
    return;
  }
  const { entry: o } = ve.open(e, () => oc(e));
  try {
    po(o), await Ka();
  } catch (r) {
    throw ve.close(o.id), po(null), t && ve.has(t.id) ? await So(t).catch(() => Wo()) : Wo(), r;
  }
  At(), nn();
}
async function So(e) {
  po(e);
  const t = e.record;
  if (!k.document) {
    await Ka(t.templateDraft);
    return;
  }
  try {
    await Ge();
  } catch (n) {
    throw Un(k.document), n;
  }
  Io(), N.stageViewport.scrollLeft = t.scroll.left, N.stageViewport.scrollTop = t.scroll.top, await $t.projectChanged(t.templateDraft), wc(), At(), we(y("projects.opened", { name: gc(e) }));
}
async function c0(e) {
  const t = ve.find(e);
  if (!t) return;
  const n = gc(t), o = ve.active === t;
  o && Ks();
  const { next: r } = ve.close(e);
  vc(t), At(), nn(), o && await Ur?.catch(() => {
  }), await Bf(e), o && (r ? await So(r) : (po(null), Wo())), we(y("tabs.closed", { name: n }));
}
async function l0(e) {
  const t = ve.find(e);
  if (!t) return;
  const n = ve.active === t;
  n && Ks();
  const { next: o } = ve.close(e);
  vc(t), n && (o ? await So(o) : (po(null), Wo())), At(), nn();
}
async function u0(e) {
  let t;
  try {
    t = Dw(await bb());
  } catch (o) {
    console.error("could not read the open tabs", o);
    return;
  }
  for (const o of t.projects)
    if (!(!e.has(o) || ve.has(o)))
      try {
        const r = await Ao(o), { entry: s } = ve.open(o, () => oc(o));
        s.record.state.document = r;
      } catch (r) {
        console.error(`could not restore the tab of ${o}`, r);
      }
  if (ve.size === 0) return;
  const n = ve.find(t.active) ?? ve.all[0];
  try {
    await So(n);
  } catch (o) {
    sn("open", o);
  }
  At(), nn();
}
function wc() {
  N.renameProject.disabled = !k.project, N.deleteProject.disabled = !k.project, N.reload.disabled = !k.project;
}
async function Ka(e = null) {
  try {
    await Ge();
  } catch (t) {
    const n = t instanceof Ye ? t.details : null, o = n && typeof n.pid == "number" ? n.pid : null;
    if (!(t instanceof Ye) || t.code !== "projectLocked" || o === null || !k.project)
      throw t;
    const r = mc.get(k.project) ?? k.project;
    if (!window.confirm(y("projects.recoverLockConfirm", { pid: o, tab: r }))) throw t;
    await yb(k.project, o), await Ge(), we(y("projects.recovered"));
  }
  if (await $t.projectChanged(e), wc(), At(), we(y("projects.opened", { name: k.document?.name ?? k.project ?? "" })), k.project)
    try {
      const t = await hb(k.project);
      if (t.reclaimedLock) {
        const { pid: n, host: o } = t.reclaimedLock;
        we(
          y("projects.reclaimedLock", { pid: n, host: o })
        );
      }
    } catch (t) {
      console.error("could not check for an automatically reclaimed lock", t);
    }
}
N.reload.addEventListener("click", () => {
  Me("reload", async () => {
    await Ge(), we(y("projects.refreshed"));
  });
});
N.newProject.addEventListener("click", () => Lx.open());
N.emptyCreate.addEventListener("click", () => N.newProject.click());
N.agents.addEventListener("click", () => {
  np.open();
});
const Xa = [
  ["add-text-section", "toolbar.textButton", N.addText],
  ["add-shape-section", "toolbar.elementsButton", N.addShape],
  ["add-upload-section", "toolbar.uploadsButton", N.addImage],
  ["add-template-section", "toolbar.templatesButton", N.templatesToggle],
  ["add-fonts-section", "toolbar.fontsButton", N.selectTool]
];
function Sp(e) {
  for (const t of [N.selectTool, N.addText, N.addShape, N.addImage, N.templatesToggle]) {
    const n = t === e;
    t.classList.toggle("active", n), t.setAttribute("aria-pressed", String(n));
  }
}
let xc = null;
function Mo(e = "add-text-section", t = N.addText) {
  xc = e, e !== "add-fonts-section" && bo.releaseSamples(), N.addPanel.classList.remove("collapsed"), N.structure.classList.remove("mobile-open"), N.dockToggle.setAttribute("aria-expanded", "false"), $t.setOpen(!1);
  const n = Xa.find(([r]) => r === e)?.[1] ?? "toolbar.textButton";
  N.addPanelTitle.dataset.i18n = n, N.addPanelTitle.textContent = y(n);
  for (const [r] of Xa) {
    const s = document.getElementById(r);
    s && (s.hidden = r !== e);
  }
  const o = e === "add-template-section";
  $t.setOpen(o && $t.isVisible()), N.openTemplates.hidden = o && $t.isVisible(), N.addPanel.scrollTop = 0, Sp(t);
}
function Do() {
  bo.releaseSamples(), N.addPanel.classList.add("collapsed"), Sp(N.selectTool);
}
N.addPanelClose.addEventListener("click", Do);
N.addText.addEventListener("click", () => Mo("add-text-section", N.addText));
N.addShape.addEventListener("click", () => Mo("add-shape-section", N.addShape));
N.addImage.addEventListener("click", () => Mo("add-upload-section", N.addImage));
N.templatesToggle.addEventListener("click", () => Mo("add-template-section", N.templatesToggle));
async function Sc(e = !1) {
  Mo("add-fonts-section", N.selectTool), await bo.reload(), e && bo.focusInstall();
}
async function d0(e) {
  const n = (await Hb())[0];
  if (!n) {
    we(y("fonts.noneInstalled"), "error"), await Sc(!0);
    return;
  }
  if (!k.project || !k.document) return;
  const o = {
    plain: { text: "Add text", fontSize: 24, width: 460, height: 80 },
    heading: { text: "Add a heading", fontSize: 64, width: 600, height: 100 },
    subheading: { text: "Add a subheading", fontSize: 36, width: 520, height: 64 },
    body: { text: "Add body text", fontSize: 22, width: 460, height: 120 }
  }[e], r = {
    x: Math.round((k.document.canvas.width - o.width) / 2),
    y: Math.round((k.document.canvas.height - o.height) / 2),
    width: o.width,
    height: o.height
  }, a = (await Hn(
    k.project,
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
    $e(k.document)
  )).created?.[0];
  a && (k.selection = [a]);
  const i = { plain: "text.plain", heading: "text.heading", subheading: "text.subheading", body: "text.body" }[e];
  we(y("editor.addedText", { preset: y(i) })), await Ge();
  const c = ic();
  c?.type === "text" && xo(c);
}
async function f0(e) {
  if (!k.project || !k.document) return;
  const t = {
    rect: { width: 320, height: 240 },
    ellipse: { width: 320, height: 240 },
    line: { width: 400, height: 24 }
  }[e], n = {
    x: Math.round((k.document.canvas.width - t.width) / 2),
    y: Math.round((k.document.canvas.height - t.height) / 2),
    width: t.width,
    height: t.height
  }, o = e === "line" ? { stroke: { color: ep, width: tp } } : { fill: rc }, r = e === "rect" ? { kind: "rect", cornerRadius: 0 } : { kind: e }, a = (await Hn(
    k.project,
    {
      op: "create",
      position: { at: "root" },
      transform: n,
      type: "shape",
      shape: r,
      ...o
    },
    $e(k.document)
  )).created?.[0];
  a && (k.selection = [a]);
  const i = { rect: "shapes.rectangle", ellipse: "shapes.ellipse", line: "shapes.line" }[e];
  we(y("editor.addedShape", { kind: y(i) })), await Ge();
}
async function p0(e) {
  if (!k.project || !k.document) return;
  const t = 320, n = 240, o = {
    x: Math.round((k.document.canvas.width - t) / 2),
    y: Math.round((k.document.canvas.height - n) / 2),
    width: t,
    height: n
  }, s = (await Hn(
    k.project,
    {
      op: "create",
      position: { at: "root" },
      transform: o,
      type: "shape",
      shape: { kind: "path", d: e },
      fill: rc
    },
    $e(k.document)
  )).created?.[0];
  s && (k.selection = [s]), we(y("editor.addedPath")), await Ge();
}
N.addPanel.addEventListener("click", (e) => {
  const t = e.target, o = t.closest("[data-text-preset]")?.dataset.textPreset;
  o && Me(`add ${o}`, () => d0(o));
  const r = t.closest("[data-shape]")?.dataset.shape;
  (r === "rect" || r === "ellipse" || r === "line") && Me(`add ${r}`, () => f0(r)), r === "path" && Us("editor.addPathTitle", "editor.pathDataLabel", "editor.addPathButton", (s) => {
    Me("add path", () => p0(s));
  });
});
N.undo.addEventListener("click", () => {
  Me("undo", async () => {
    if (!k.project) return;
    const e = await Cb(k.project);
    we(y("status.undoDone", { version: e.version })), await Ge();
  });
});
N.redo.addEventListener("click", () => {
  Me("redo", async () => {
    if (!k.project) return;
    const e = await jb(k.project);
    we(y("status.redoDone", { version: e.version })), await Ge();
  });
});
N.exportButton.addEventListener("click", () => Ox.open());
Yp((e) => Ya(
  e,
  e.type === "image/svg+xml" || e.name.toLowerCase().endsWith(".svg") ? "svg" : "image"
));
function Ya(e, t, n) {
  e && Me(t === "svg" ? "add vector" : "add image", async () => {
    if (!(!k.project || !k.document)) {
      N.uploadFeedback.textContent = y("uploads.uploading", { name: e.name });
      try {
        const o = await Zi(k.project, e), r = o.asset.mediaType === "image/svg+xml" || t === "svg", { width: s, height: a } = aw(
          o.asset,
          k.document.canvas
        ), i = Math.round(n?.x ?? (k.document.canvas.width - s) / 2), c = Math.round(n?.y ?? (k.document.canvas.height - a) / 2), u = r ? {
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
        }, f = await Hn(
          k.project,
          u,
          o.version
        );
        f.created?.length && (k.selection = f.created), we(y("uploads.addedVersion", { name: e.name, version: f.version })), N.uploadFeedback.textContent = y("uploads.added", { name: e.name }), await Ge();
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
  if (!t || !k.document) return;
  const n = N.canvas.getBoundingClientRect();
  if (e.clientX < n.left || e.clientX > n.right || e.clientY < n.top || e.clientY > n.bottom) {
    Ya(t, t.type === "image/svg+xml" ? "svg" : "image");
    return;
  }
  const o = {
    x: (e.clientX - n.left) / n.width * k.document.canvas.width - 150,
    y: (e.clientY - n.top) / n.height * k.document.canvas.height - 100
  };
  Ya(t, t.type === "image/svg+xml" ? "svg" : "image", o);
});
function Oo(e) {
  xr = e, Nt();
}
N.historyShortcut.addEventListener("click", () => Oo("history"));
N.dockToggle.addEventListener("click", () => {
  const e = N.structure.classList.toggle("mobile-open");
  N.dockToggle.setAttribute("aria-expanded", String(e)), e && (Do(), N.layersTab.focus());
});
N.selectTool.addEventListener("click", () => {
  k.document && (Do(), $t.setOpen(!1), N.structure.classList.remove("mobile-open"), N.dockToggle.setAttribute("aria-expanded", "false"), N.canvas.focus());
});
N.positionClose.addEventListener("click", () => Bn(!1));
N.positionPopover.addEventListener("click", (e) => {
  const t = e.target.closest(
    "[data-canvas-anchor], [data-layout]"
  ), n = t?.dataset.canvasAnchor;
  if (n && !t.disabled && k.selection.length > 0 && k.document) {
    const a = Cr(), i = gp(a);
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
    const f = [], h = u.horizontal === "left" ? 0 : u.horizontal === "right" ? k.document.canvas.width - i.width : (k.document.canvas.width - i.width) / 2, d = u.vertical === "top" ? 0 : u.vertical === "bottom" ? k.document.canvas.height - i.height : (k.document.canvas.height - i.height) / 2;
    for (const m of zt())
      f.push({ op: "move", id: m.id, dx: h - i.x, dy: d - i.y });
    Bn(!1), Qx(`place layer ${t.title.toLowerCase()}`, f);
    return;
  }
  const o = t?.dataset.layout;
  if (!o || t.disabled || k.selection.length === 0) return;
  const r = [...k.selection];
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
  s && (Bn(!1), oe("arrange layers", s));
});
document.addEventListener("pointerdown", (e) => {
  const t = e.target;
  ni() && !N.positionPopover.contains(t) && !N.inspector.contains(t) && Bn(!1), Sn.isOpen() && !N.contextMenu.contains(t) && Sn.close();
});
N.openTemplates.addEventListener("click", () => {
  if (!$t.isVisible()) {
    we(y("editor.noSlotsHint")), Do(), Oo("properties"), window.matchMedia("(max-width: 1024px)").matches && (N.structure.classList.add("mobile-open"), N.dockToggle.setAttribute("aria-expanded", "true"));
    return;
  }
  $t.setOpen(!0), N.openTemplates.hidden = !0, N.templatesPanel.scrollIntoView({ block: "nearest" });
});
N.templatesClose.addEventListener("click", () => {
  $t.setOpen(!1), N.openTemplates.hidden = !1;
});
N.zoomOut.addEventListener("click", () => jr(Ws() / 1.2));
N.zoomIn.addEventListener("click", () => jr(Ws() * 1.2));
N.zoomValue.addEventListener("click", () => jr(null));
N.zoom100.addEventListener("click", () => jr(1));
N.stageViewport.addEventListener("wheel", (e) => {
  if (!(e.ctrlKey || e.metaKey)) return;
  e.preventDefault();
  const t = e.deltaMode === WheelEvent.DOM_DELTA_LINE ? e.deltaY * 16 : e.deltaMode === WheelEvent.DOM_DELTA_PAGE ? e.deltaY * N.stageViewport.clientHeight : e.deltaY, n = Math.exp(-t * Math.log(1.1) / 100);
  jr(Ws() * n, { x: e.clientX, y: e.clientY });
}, { passive: !1 });
function Cp() {
  window.matchMedia("(max-width: 1024px)").matches ? (N.structure.classList.remove("mobile-open"), N.dockToggle.setAttribute("aria-expanded", "false"), bo.releaseSamples(), N.addPanel.classList.add("collapsed")) : (N.structure.classList.remove("mobile-open"), N.dockToggle.setAttribute("aria-expanded", "true"));
}
window.addEventListener("resize", () => {
  k.zoom === null && Io(), uc(), Cp();
});
const h0 = new ResizeObserver(() => {
  k.zoom === null && Io(), uc();
});
h0.observe(N.stageViewport);
Cp();
let kr = !1, Vo = null;
window.addEventListener("keyup", (e) => {
  mp(e) || e.code === "Space" && (kr = !1, N.stageViewport.classList.remove("pan-ready"));
});
window.addEventListener("blur", () => {
  kr = !1, N.stageViewport.classList.remove("pan-ready"), Vo?.();
});
N.stageViewport.addEventListener("pointerdown", (e) => {
  if (e.button !== 1 && !(kr && e.button === 0)) return;
  e.preventDefault(), e.stopPropagation(), Vo?.();
  const t = { x: e.clientX, y: e.clientY }, n = { x: N.stageViewport.scrollLeft, y: N.stageViewport.scrollTop };
  N.stageViewport.classList.add("panning");
  const o = (a) => {
    a.pointerId === e.pointerId && (N.stageViewport.scrollLeft = n.x - (a.clientX - t.x), N.stageViewport.scrollTop = n.y - (a.clientY - t.y));
  }, r = () => {
    window.removeEventListener("pointermove", o), window.removeEventListener("pointerup", s), window.removeEventListener("pointercancel", s), window.removeEventListener("blur", r), N.stageViewport.classList.remove("panning"), Vo === r && (Vo = null);
  }, s = (a) => {
    a.pointerId === e.pointerId && r();
  };
  Vo = r, window.addEventListener("pointermove", o), window.addEventListener("pointerup", s), window.addEventListener("pointercancel", s), window.addEventListener("blur", r, { once: !0 });
}, { capture: !0 });
N.overlay.addEventListener("pointerdown", (e) => {
  if (kr || e.target !== N.overlay || e.button !== 0 || !k.document) return;
  e.preventDefault();
  const t = N.canvas.getBoundingClientRect(), n = (c) => Math.min(t.right, Math.max(t.left, c)), o = (c) => Math.min(t.bottom, Math.max(t.top, c)), r = { x: n(e.clientX), y: o(e.clientY) }, s = document.createElement("div");
  s.className = "selection-marquee", N.overlay.append(s);
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
    }, d = [...N.overlay.querySelectorAll(".layer-hitbox")].filter((m) => {
      const g = m.getBoundingClientRect();
      return g.right >= h.left && g.left <= h.right && g.bottom >= h.top && g.top <= h.bottom;
    }).map((m) => m.dataset.id).filter((m) => !!m);
    k.selection = e.shiftKey ? [.../* @__PURE__ */ new Set([...k.selection, ...d])] : d, Nt(), lt(), ft();
  };
  window.addEventListener("pointermove", a), window.addEventListener("pointerup", i);
});
function m0(e) {
  const t = e;
  return t ? t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable : !1;
}
window.addEventListener("keydown", (e) => {
  if (mp(e)) return;
  if (e.key === "Escape" && yn) {
    e.preventDefault(), Je();
    return;
  }
  if (m0(e.target) || e.target instanceof Element && e.target.closest("button[data-text-align]") && (e.key === "Enter" || e.code === "Space")) return;
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
    e.preventDefault(), cs();
    return;
  }
  if (t && n === "x") {
    e.preventDefault(), zt().every(rt) && cs() && ir("cut layers");
    return;
  }
  if (t && n === "v") {
    e.preventDefault(), bp();
    return;
  }
  if (t && n === "d") {
    e.preventDefault();
    const c = zt();
    c.length && c.every(rt) && xt("duplicate", c.map((u) => ({ op: "duplicate", id: u.id })));
    return;
  }
  if (t && n === "g") {
    e.preventDefault();
    const c = zt();
    if (e.shiftKey) {
      const u = c.length === 1 && c[0]?.type === "group" ? c[0] : null;
      u && oe("ungroup", { op: "ungroup", id: u.id });
    } else c.length > 1 && c.every(rt) && oe("group", { op: "group", ids: c.map((u) => u.id) });
    return;
  }
  if (e.key === "F10" && e.shiftKey) {
    e.preventDefault();
    const c = N.canvas.getBoundingClientRect();
    cr(c.left + c.width / 2, c.top + c.height / 2);
    return;
  }
  if (e.key === "Escape") {
    if (Sn.isOpen()) {
      Sn.close(), N.canvas.focus();
      return;
    }
    if (Bt.isOpen()) {
      Bt.close();
      return;
    }
    if (!N.addPanel.classList.contains("collapsed")) {
      e.preventDefault(), Do();
      return;
    }
    k.selection = [], Sn.close(), Bn(!1), Nt(), ft(), lt();
    return;
  }
  const o = ic(), r = zt();
  if ((e.key === "Enter" || e.key === "F2") && o?.type === "text" && rt(o)) {
    e.preventDefault(), xo(o);
    return;
  }
  if (r.length === 0 || r.some((c) => !rt(c))) return;
  if (e.key === "Delete" || e.key === "Backspace") {
    e.preventDefault(), ir();
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
function Wo() {
  Je(), oi(null), N.canvas.hidden = !0, N.canvasControlsRoot.hidden = !0, N.canvasHints.hidden = !0, xp(), N.canvasEmpty.hidden = !1, wc(), N.undo.disabled = !0, N.redo.disabled = !0, N.version.textContent = "–", Nt(), ft(), lt();
}
function jp(e, t) {
  Us("projects.renameTitle", "common.name", "projects.rename", (n) => {
    Me("rename project", async () => {
      const o = await gb(e, n);
      we(y("projects.renamed", { oldName: t ?? e, newName: n }));
      const r = ve.find(e);
      r && ve.rename(e, o.project) && (r.record.state.project = o.project, nn()), await Er(), r && ve.active === r && (Hs.setCurrentProject(o.project), await Ge()), At();
    });
  });
}
function kp(e, t) {
  const n = t ?? e, o = y("projects.deleteConfirm", { name: n });
  window.confirm(o) && Me("delete project", async () => {
    await vb(e), await l0(e), we(y("projects.deleted", { name: n })), await Er();
  });
}
N.renameProject.addEventListener("click", () => {
  const e = k.project;
  e && (Bt.isOpen() && Bt.close(), jp(e, k.document?.name ?? null));
});
N.deleteProject.addEventListener("click", () => {
  const e = k.project;
  e && (Bt.isOpen() && Bt.close(), kp(e, k.document?.name ?? null));
});
async function Er(e) {
  e && (N.search.value = "");
  const t = N.search.value.trim(), n = await _f(t);
  Ep(n, t);
  try {
    Hs.setPageSets(await Eb());
  } catch (o) {
    console.error("could not read the page sets", o);
  }
  return e && await bc(e), await Np(), n;
}
function Ep(e, t) {
  Cc = Rp(e);
  for (const n of e) n.name && mc.set(n.id, n.name);
  Hs.setProjects(e, t, k.project);
}
const g0 = 1500;
let Cc = "";
function Rp(e) {
  return e.map((t) => `${t.id}\0${t.name ?? ""}\0${t.layers}`).join(`
`);
}
let Jl = !0;
async function Ga() {
  if (Jl)
    try {
      const { count: e } = await Ab();
      jc(e);
    } catch (e) {
      e instanceof Ye && e.code.startsWith("http4") && (Jl = !1, jc(null));
    }
}
let Qt = null;
function v0(e) {
  return e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement || e instanceof HTMLElement && e.isContentEditable;
}
document.addEventListener("input", (e) => {
  e.target !== N.search && v0(e.target) && (Qt = e.target);
}, !0);
document.addEventListener("change", (e) => {
  e.target === Qt && (Qt = null);
}, !0);
document.addEventListener("focusout", (e) => {
  e.target === Qt && (Qt = null);
}, !0);
function y0() {
  return Qt instanceof Node && !Qt.isConnected && (Qt = null), Qt !== null;
}
function Zl() {
  return document.visibilityState === "visible" && !Zf && !k.drag && !k.editingText && !y0() && !document.body.classList.contains("stopped");
}
let ga = !1;
async function b0() {
  if (!(ga || !Zl())) {
    if (!Ba()) {
      Ga();
      return;
    }
    ga = !0;
    try {
      const e = N.search.value.trim(), t = await _f(e);
      if (!Zl()) return;
      Ga(), Rp(t) !== Cc && document.activeElement !== document.getElementById("project-search") && (Ep(t, e), k.project || Np().catch(() => {
      })), w0(t);
      const n = k.project, o = t.find((s) => s.id === n), r = k.document;
      if (!n || !o || !r || o.documentId !== r.id || o.version === $e(r)) return;
      Me("follow", async () => {
        k.project !== n || k.drag || k.editingText || await Ge();
      });
    } catch {
    } finally {
      ga = !1;
    }
  }
}
function w0(e) {
  for (const t of ve.all) {
    if (t === ve.active) continue;
    const n = t.record.state.document, o = e.find((r) => r.id === t.id);
    !n || !o || o.documentId !== n.id || o.version === $e(n) || Me("follow tab", async () => {
      if (ve.active === t || !ve.all.includes(t)) return;
      const r = await Ao(t.id);
      if (ve.active === t || !ve.all.includes(t)) return;
      const s = t.record;
      s.state.document = r, s.state.selection = s.state.selection.filter(
        (a) => Be(Le(r)).some(({ layer: i }) => i.id === a)
      ), s.historySnapshot = null, ve.markChanged(t.id), At(), yc(t);
    });
  }
}
window.setInterval(() => {
  b0();
}, g0);
let va = [], ya = 0;
async function Np() {
  const e = ++ya;
  for (const o of va) URL.revokeObjectURL(o);
  va = [];
  const t = await pb(8);
  if (e !== ya) return;
  const n = await Promise.all(t.map(async (o) => {
    try {
      return { project: o, thumbnail: await Fn(Ff(o.id)) };
    } catch {
      return { project: o, thumbnail: null };
    }
  }));
  if (e !== ya) {
    for (const { thumbnail: o } of n) o && URL.revokeObjectURL(o);
    return;
  }
  va = n.flatMap(({ thumbnail: o }) => o ? [o] : []), Xp(
    N.recents,
    n,
    (o) => wp(o),
    (o, r) => jp(o, r),
    (o, r) => kp(o, r)
  );
}
N.shutdown.addEventListener("click", () => {
  window.confirm(y("projects.stopConfirm")) && Me("stop", async () => {
    await Nb(), N.shutdown.disabled = !0, document.body.classList.add("stopped"), we(y("app.stopped"));
  });
});
Me("start", async () => {
  const e = await Tb();
  N.shutdown.hidden = !e.canShutdown;
  try {
    await bo.reload();
  } catch {
  }
  const t = await Er();
  await u0(new Set(t.map((n) => n.id))), Ga(), rp(), we(y("status.ready", { version: e.version })), !Cc && !N.search.value.trim() && np.offerOnFirstRun();
});
