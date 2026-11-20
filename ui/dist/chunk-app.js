import { r as p, F as $p, H as Cn, t as Ko, v as qt, R as hn, M as Lp, J as zp, f as ce, u as Z, w as ei, y as lr, K as ti, j as c, B as Q, N as nu, a as De, c as ze, o as Ae, z as cs, d as rn, b as ur, O as ou, n as Tt, x as Xo, P as On, l as ru, E as _p, Q as Fp, V as Bp, W as Vp, I as Hp, C as Up, U as zn, X as En, g as at, h as _e, Y as Wr, Z as ls, _ as Co, e as su, $ as Wp, A as Uo, L as qp, m as We, i as Fe, T as ee, S as ye, k as le, G as Ne, a0 as Kp, a1 as ni } from "./chunk-mantine-root.js";
import { m as au, i as iu, c as Jt, u as Ve, O as oi, a as cu, g as jo, b as lu, S as us, s as Xp, d as Yp, e as Gp, p as ri, f as Jp, h as uu, j as Zp, k as Qp, l as du, n as Ec, o as eh, q as si, r as th } from "./chunk-main.js";
import { a as Qe, u as Vt, C as ai, I as Rt, b as nh, d as oh, c as St, r as Rc, T as Nc } from "./chunk-Title.js";
import { t as y, formatNumber as je, formatCount as Ot, getLocale as ii, setLocale as rh } from "./i18n.js";
function qr(e, t) {
  return (n) => {
    if (typeof n != "string" || n.trim().length === 0) throw new Error(t);
    return `${e}-${n}`;
  };
}
function Yo(e, t) {
  let n = e;
  for (; (n = n.parentElement) && !n.matches(t); ) ;
  return n;
}
function Tc(e, t, n) {
  for (let o = e - 1; o >= 0; o -= 1) if (!t[o].disabled) return o;
  if (n) {
    for (let o = t.length - 1; o > -1; o -= 1) if (!t[o].disabled) return o;
  }
  return e;
}
function Pc(e, t, n) {
  for (let o = e + 1; o < t.length; o += 1) if (!t[o].disabled) return o;
  if (n) {
    for (let o = 0; o < t.length; o += 1) if (!t[o].disabled) return o;
  }
  return e;
}
function sh(e, t, n) {
  return Yo(e, n) === Yo(t, n);
}
function fu({ parentSelector: e, siblingSelector: t, onKeyDown: n, loop: o = !0, activateOnFocus: r = !1, dir: s = "rtl", orientation: a }) {
  return (i) => {
    n?.(i);
    const l = Array.from(Yo(i.currentTarget, e)?.querySelectorAll(t) || []).filter((g) => sh(i.currentTarget, g, e)), u = l.findIndex((g) => i.currentTarget === g), f = Pc(u, l, o), h = Tc(u, l, o), d = s === "rtl" ? h : f, m = s === "rtl" ? f : h;
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
        i.stopPropagation(), i.preventDefault(), l[Pc(-1, l, !1)]?.focus();
        break;
      case "End":
        i.stopPropagation(), i.preventDefault(), l[Tc(l.length, l, !1)]?.focus();
    }
  };
}
const Kr = () => {
};
function ah(e, t = { active: !0 }) {
  return typeof e != "function" || !t.active ? t.onKeyDown || Kr : (n) => {
    n.key === "Escape" && (e(n), t.onTrigger?.());
  };
}
function Zn(e, t) {
  return (n) => {
    e?.(n), t?.(n);
  };
}
function wn(e, t, n) {
  return t === void 0 && n === void 0 ? e : t !== void 0 && n === void 0 ? Math.max(e, t) : Math.min(t === void 0 && n !== void 0 ? e : Math.max(e, t), n);
}
function ih(e, t) {
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
  } : t, a = ao(e), i = p.useRef(0), l = p.useRef(0), u = p.useRef(null), f = p.useMemo(() => {
    const h = Object.assign((...d) => {
      window.clearTimeout(i.current), u.current = d;
      const m = h._isFirstCall;
      h._isFirstCall = !1;
      function g() {
        window.clearTimeout(i.current), window.clearTimeout(l.current), i.current = 0, l.current = 0, h._isFirstCall = !0, h._hasPendingCallback = !1;
      }
      function v() {
        s !== void 0 && l.current === 0 && (l.current = window.setTimeout(() => {
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
        }, S = () => {
          i.current !== 0 && (g(), a(...d));
        }, k = () => {
          g();
        };
        h.flush = S, h.cancel = k, i.current = window.setTimeout(E, n), v();
        return;
      }
      if (r && !m) {
        h._hasPendingCallback = !0;
        const E = () => {
          i.current !== 0 && (g(), a(...d));
        }, S = () => {
          g();
        };
        h.flush = E, h.cancel = S;
        const k = () => {
          g();
        };
        i.current = window.setTimeout(k, n), v();
        return;
      }
      h._hasPendingCallback = !0;
      const x = () => {
        i.current !== 0 && (g(), a(...d));
      }, b = () => {
        g();
      };
      h.flush = x, h.cancel = b, i.current = window.setTimeout(x, n), v();
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
const ch = ["mousedown", "touchstart"];
function pu(e, t, n, o = !0, r = !1) {
  const s = p.useRef(null), a = t || ch, i = p.useEffectEvent((u) => {
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
function lh(e, t) {
  return $p("(prefers-color-scheme: dark)", e === "dark", t) ? "dark" : "light";
}
function hu({ opened: e, shouldReturnFocus: t = !0 }) {
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
const uh = /input|select|textarea|button|object/, mu = "a, input, select, textarea, button, object, [tabindex]";
function dh(e) {
  return e.style.display === "none";
}
function fh(e) {
  if (e.getAttribute("aria-hidden") || e.getAttribute("hidden") || e.getAttribute("type") === "hidden") return !1;
  let t = e;
  for (; t && !(t === document.body || t.nodeType === 11); ) {
    if (dh(t)) return !1;
    t = t.parentNode;
  }
  return !0;
}
function gu(e) {
  let t = e.getAttribute("tabindex");
  return t === null && (t = void 0), parseInt(t, 10);
}
function Sa(e) {
  const t = e.nodeName.toLowerCase(), n = !Number.isNaN(gu(e));
  return (uh.test(t) && !e.disabled || e instanceof HTMLAnchorElement && e.href || n) && fh(e);
}
function vu(e) {
  const t = gu(e);
  return (Number.isNaN(t) || t >= 0) && Sa(e);
}
function ph(e) {
  return Array.from(e.querySelectorAll(mu)).filter(vu);
}
function hh(e, t) {
  const n = ph(e);
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
function mh(e = !0) {
  const t = p.useRef(null), n = (r) => {
    let s = r.querySelector("[data-autofocus]");
    if (!s) {
      const a = Array.from(r.querySelectorAll(mu));
      s = a.find(vu) || a.find(Sa) || null, !s && Sa(r) && (s = r);
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
      s.key === "Tab" && t.current && hh(t.current, s);
    };
    return document.addEventListener("keydown", r), () => document.removeEventListener("keydown", r);
  }, [e]), o;
}
const gh = (e) => (e + 1) % 1e6;
function vh() {
  const [, e] = p.useReducer(gh, 0);
  return e;
}
function yh(e, t, n) {
  const o = p.useEffectEvent(t);
  p.useEffect(() => (window.addEventListener(e, o, n), () => window.removeEventListener(e, o, n)), [e]);
}
function yu(e) {
  return {
    x: wn(e.x, 0, 1),
    y: wn(e.y, 0, 1)
  };
}
function bu(e, t, n = "ltr") {
  const o = p.useRef(!1), r = p.useRef(!1), s = p.useRef(0), a = p.useRef(null), [i, l] = p.useState(!1);
  return p.useEffect(() => (o.current = !0, () => {
    a.current?.();
  }), []), {
    ref: p.useCallback((u) => {
      const f = ({ x: S, y: k }) => {
        cancelAnimationFrame(s.current), s.current = requestAnimationFrame(() => {
          if (o.current && u) {
            u.style.userSelect = "none";
            const R = u.getBoundingClientRect();
            if (R.width && R.height) {
              const T = wn((S - R.left) / R.width, 0, 1);
              e({
                x: n === "ltr" ? T : 1 - T,
                y: wn((k - R.top) / R.height, 0, 1)
              });
            }
          }
        });
      }, h = () => {
        document.addEventListener("mousemove", x), document.addEventListener("mouseup", g), document.addEventListener("touchmove", E, { passive: !1 }), document.addEventListener("touchend", g);
      }, d = () => {
        document.removeEventListener("mousemove", x), document.removeEventListener("mouseup", g), document.removeEventListener("touchmove", E), document.removeEventListener("touchend", g);
      }, m = () => {
        !r.current && o.current && (r.current = !0, typeof t?.onScrubStart == "function" && t.onScrubStart(), l(!0), h());
      }, g = () => {
        r.current && o.current && (r.current = !1, l(!1), d(), setTimeout(() => {
          typeof t?.onScrubEnd == "function" && t.onScrubEnd();
        }, 0));
      }, v = (S) => {
        m(), S.preventDefault(), x(S);
      }, x = (S) => f({
        x: S.clientX,
        y: S.clientY
      }), b = (S) => {
        S.cancelable && S.preventDefault(), m(), E(S);
      }, E = (S) => {
        S.cancelable && S.preventDefault(), f({
          x: S.changedTouches[0].clientX,
          y: S.changedTouches[0].clientY
        });
      };
      return u?.addEventListener("mousedown", v), u?.addEventListener("touchstart", b, { passive: !1 }), a.current = () => {
        d(), cancelAnimationFrame(s.current);
      }, () => {
        u && (u.removeEventListener("mousedown", v), u.removeEventListener("touchstart", b));
      };
    }, [n, e]),
    active: i
  };
}
function bh(e, t) {
  if (!e || !t) return !1;
  if (e === t) return !0;
  if (e.length !== t.length) return !1;
  for (let n = 0; n < e.length; n += 1) if (!ih(e[n], t[n])) return !1;
  return !0;
}
function wh(e) {
  const t = p.useRef([]), n = p.useRef(0);
  return bh(t.current, e) || (t.current = e, n.current += 1), [n.current];
}
function Ac(e, t) {
  p.useEffect(e, wh(t));
}
function xh(e, t, n = { autoInvoke: !1 }) {
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
function Sh(e) {
  const t = p.useRef(void 0);
  return p.useEffect(() => {
    t.current = e;
  }, [e]), t.current;
}
function Ch() {
  const [e, t] = p.useState(!1);
  return Ko(() => {
    t(typeof window < "u" && !jh() && "EyeDropper" in window);
  }, []), {
    supported: e,
    open: p.useCallback((n = {}) => e ? new window.EyeDropper().open(n) : Promise.resolve(void 0), [e])
  };
}
function jh() {
  return navigator.userAgent.includes("OPR");
}
function kh(e, t, n) {
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
function Eh() {
  const [e, t] = p.useState(!1);
  return p.useEffect(() => t(!0), []), e;
}
const Rh = ["mouse", "touch"], Nh = 10;
function Th(e, t = {}) {
  const { threshold: n = 400, events: o = Rh, cancelOnMove: r = !1, onStart: s, onFinish: a, onCancel: i } = t, l = p.useRef(!1), u = p.useRef(!1), f = p.useRef(-1), h = p.useRef(null);
  p.useEffect(() => () => window.clearTimeout(f.current), []);
  const d = o.join(",");
  return p.useMemo(() => {
    if (typeof e != "function") return {};
    const m = r !== !1, g = r === !0 ? Nh : r === !1 ? 0 : r, v = (S) => {
      !Mc(S) && !Ca(S) || (s && s(S), h.current = Ic(S), u.current = !0, f.current = window.setTimeout(() => {
        e(S), l.current = !0;
      }, n));
    }, x = (S) => {
      !Mc(S) && !Ca(S) || (l.current ? a && a(S) : u.current && i && i(S), l.current = !1, u.current = !1, h.current = null, f.current !== -1 && (window.clearTimeout(f.current), f.current = -1));
    }, b = (S) => {
      if (!m || !u.current || l.current) return;
      const k = Ic(S);
      if (!k || !h.current) return;
      const R = k.x - h.current.x, T = k.y - h.current.y;
      Math.sqrt(R * R + T * T) > g && x(S);
    }, E = {};
    return o.includes("mouse") && (E.onMouseDown = v, E.onMouseUp = x, E.onMouseLeave = x, m && (E.onMouseMove = b)), o.includes("touch") && (E.onTouchStart = v, E.onTouchEnd = x, E.onTouchCancel = x, m && (E.onTouchMove = b)), E;
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
function Ic(e) {
  if (Ca(e)) {
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
function Ca(e) {
  return window.TouchEvent ? e.nativeEvent instanceof TouchEvent : "touches" in e.nativeEvent;
}
function Mc(e) {
  return e.nativeEvent instanceof MouseEvent;
}
function Ph(e) {
  if (!e || typeof e == "string") return 0;
  const t = e / 36;
  return Math.round((4 + 15 * t ** 0.25 + t / 5) * 10);
}
function Gs(e) {
  return e.current ? e.current.scrollHeight : "auto";
}
function Xr(e) {
  return typeof e == "number" && e > 0;
}
function Ah({ transitionDuration: e, transitionTimingFunction: t = "ease", onTransitionEnd: n, onTransitionStart: o, expanded: r, keepMounted: s }) {
  const a = {
    height: 0,
    overflow: "hidden",
    ...s ? {} : { display: "none" }
  }, i = p.useEffectEvent(() => o?.()), l = p.useEffectEvent(() => n?.()), u = p.useRef(null), [f, h] = p.useState(r ? {} : a), [d, m] = p.useState(r ? "entered" : "exited"), g = (S) => {
    qt.flushSync(() => h(S));
  }, v = (S) => {
    g((k) => ({
      ...k,
      ...S
    }));
  }, x = (S) => {
    const k = e ?? Ph(S);
    return { transition: `height ${k}ms ${t}, opacity ${k}ms ${t}` };
  }, b = p.useRef(0);
  Cn(() => {
    b.current += 1;
    const S = b.current, k = () => b.current === S;
    e !== 0 && i(), r ? window.requestAnimationFrame(() => {
      !k() || !u.current || (qt.flushSync(() => m("entering")), v({
        willChange: "height",
        display: "block",
        overflow: "hidden"
      }), window.requestAnimationFrame(() => {
        if (!k() || !u.current) return;
        const R = Gs(u);
        if (!Xr(R)) {
          g({}), m("entered"), l();
          return;
        }
        v({
          ...x(R),
          height: R
        });
      }));
    }) : window.requestAnimationFrame(() => {
      if (!k() || !u.current) return;
      qt.flushSync(() => m("exiting"));
      const R = Gs(u);
      if (!Xr(R)) {
        g(a), m("exited"), l();
        return;
      }
      v({
        ...x(R),
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
  const E = (S) => {
    if (!(S.target !== u.current || S.propertyName !== "height"))
      if (r) {
        const k = Gs(u);
        k === f.height ? g({}) : v({ height: k }), m("entered"), l();
      } else f.height === 0 && (g(a), m("exited"), l());
  };
  return {
    state: d,
    getCollapseProps: (S) => ({
      "aria-hidden": !r,
      inert: !r,
      ref: au(u, S?.ref),
      onTransitionEnd: E,
      style: {
        boxSizing: "border-box",
        ...S?.style,
        ...f
      }
    })
  };
}
function Ih(e) {
  if (!e || typeof e == "string") return 0;
  const t = e / 36;
  return Math.round((4 + 15 * t ** 0.25 + t / 5) * 10);
}
function Js(e) {
  return e.current ? e.current.scrollWidth : "auto";
}
function Mh({ transitionDuration: e, transitionTimingFunction: t = "ease", onTransitionEnd: n, onTransitionStart: o, expanded: r, keepMounted: s }) {
  const a = {
    width: 0,
    overflow: "hidden",
    ...s ? {} : { display: "none" }
  }, i = p.useEffectEvent(() => o?.()), l = p.useEffectEvent(() => n?.()), u = p.useRef(null), [f, h] = p.useState(r ? {} : a), [d, m] = p.useState(r ? "entered" : "exited"), g = (S) => {
    qt.flushSync(() => h(S));
  }, v = (S) => {
    g((k) => ({
      ...k,
      ...S
    }));
  }, x = (S) => {
    const k = e ?? Ih(S);
    return { transition: `width ${k}ms ${t}, opacity ${k}ms ${t}` };
  }, b = p.useRef(0);
  Cn(() => {
    b.current += 1;
    const S = b.current, k = () => b.current === S;
    e !== 0 && i(), r ? window.requestAnimationFrame(() => {
      !k() || !u.current || (qt.flushSync(() => m("entering")), v({
        willChange: "width",
        display: "block",
        overflow: "hidden"
      }), window.requestAnimationFrame(() => {
        if (!k() || !u.current) return;
        const R = Js(u);
        if (!Xr(R)) {
          g({}), m("entered"), l();
          return;
        }
        v({
          ...x(R),
          width: R
        });
      }));
    }) : window.requestAnimationFrame(() => {
      if (!k() || !u.current) return;
      qt.flushSync(() => m("exiting"));
      const R = Js(u);
      if (!Xr(R)) {
        g(a), m("exited"), l();
        return;
      }
      v({
        ...x(R),
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
  const E = (S) => {
    if (!(S.target !== u.current || S.propertyName !== "width"))
      if (r) {
        const k = Js(u);
        k === f.width ? g({}) : v({ width: k }), m("entered"), l();
      } else f.width === 0 && (g(a), m("exited"), l());
  };
  return {
    state: d,
    getCollapseProps: (S) => ({
      "aria-hidden": !r,
      inert: !r,
      ref: au(u, S?.ref),
      onTransitionEnd: E,
      style: {
        boxSizing: "border-box",
        ...S?.style,
        ...f
      }
    })
  };
}
function wu() {
  return typeof process < "u" && process.env, "development";
}
function xu(e) {
  const t = /* @__PURE__ */ new Map();
  return (...n) => {
    const o = JSON.stringify(n);
    if (t.has(o)) return t.get(o);
    const r = e(...n);
    return t.set(o, r), r;
  };
}
function Su(e) {
  const t = hn.version;
  return typeof hn.version != "string" || t.startsWith("18.") ? e?.ref : e?.props?.ref;
}
function Dh(e) {
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
function dr(e) {
  const t = p.Children.toArray(e);
  return t.length !== 1 || !iu(t[0]) ? null : t[0];
}
function fr(e, t) {
  return typeof e == "boolean" ? e : t.autoContrast;
}
function Dc(e) {
  const t = document.createElement("style");
  return t.setAttribute("data-mantine-styles", "inline"), t.innerHTML = "*, *::before, *::after {transition: none !important;}", t.setAttribute("data-mantine-disable-transition", "true"), e && t.setAttribute("nonce", e), document.head.appendChild(t), () => document.querySelectorAll("[data-mantine-disable-transition]").forEach((o) => o.remove());
}
function Oh({ keepTransitions: e } = {}) {
  const t = p.useRef(Kr), n = p.useRef(-1), o = p.use(Lp), r = zp(), s = p.useRef(r?.());
  if (!o) throw new Error("[@mantine/core] MantineProvider was not found in tree");
  const a = (h) => {
    o.setColorScheme(h), t.current = e ? () => {
    } : Dc(s.current), window.clearTimeout(n.current), n.current = window.setTimeout(() => {
      t.current?.();
    }, 10);
  }, i = () => {
    o.clearColorScheme(), t.current = e ? () => {
    } : Dc(s.current), window.clearTimeout(n.current), n.current = window.setTimeout(() => {
      t.current?.();
    }, 10);
  }, l = lh("light", { getInitialValueInEffect: !1 }), u = o.colorScheme === "auto" ? l : o.colorScheme, f = p.useCallback(() => a(u === "light" ? "dark" : "light"), [a, u]);
  return p.useEffect(() => () => {
    t.current?.(), window.clearTimeout(n.current);
  }, []), {
    colorScheme: o.colorScheme,
    setColorScheme: a,
    clearColorScheme: i,
    toggleColorScheme: f
  };
}
function ja(e, t) {
  return Array.isArray(e) ? [...e].reduce((n, o) => ({
    ...n,
    ...ja(o, t)
  }), {}) : typeof e == "function" ? e(t) : e ?? {};
}
const $h = p.createContext({
  dir: "ltr",
  toggleDirection: () => {
  },
  setDirection: () => {
  }
});
function ko() {
  return p.use($h);
}
const Lh = {
  transitionDuration: 200,
  transitionTimingFunction: "ease",
  animateOpacity: !0,
  orientation: "vertical",
  keepMounted: !0,
  keepMountedMode: "activity"
}, Cu = ce((e) => {
  const { children: t, expanded: n, transitionDuration: o, transitionTimingFunction: r, style: s, onTransitionEnd: a, onTransitionStart: i, animateOpacity: l, keepMounted: u, keepMountedMode: f, ref: h, orientation: d, ...m } = Z("Collapse", Lh, e), g = ei(), v = lr(), x = ti(), b = v.respectReducedMotion && x ? 0 : o, E = (d === "horizontal" ? Mh : Ah)({
    expanded: n,
    transitionDuration: b,
    transitionTimingFunction: r,
    onTransitionEnd: a,
    onTransitionStart: i,
    keepMounted: !1
  });
  if (b === 0)
    return u === !0 && (f === "display-none" || g !== "test") ? f === "display-none" ? /* @__PURE__ */ c.jsx(Q, {
      ...m,
      style: {
        ...ja(s, v),
        ...n ? {} : { display: "none" }
      },
      ref: h,
      children: t
    }) : /* @__PURE__ */ c.jsx(p.Activity, {
      mode: n ? "visible" : "hidden",
      children: /* @__PURE__ */ c.jsx(Q, {
        ...m,
        style: s,
        ref: h,
        children: t
      })
    }) : n ? /* @__PURE__ */ c.jsx(Q, {
      ...m,
      style: s,
      ref: h,
      children: t
    }) : null;
  const S = E.state === "exited";
  let k;
  return u === !1 ? k = S ? null : t : u === !0 ? k = f === "display-none" ? t : /* @__PURE__ */ c.jsx(p.Activity, {
    mode: S ? "hidden" : "visible",
    children: t
  }) : k = t, /* @__PURE__ */ c.jsx(Q, {
    ...m,
    ...E.getCollapseProps({
      style: {
        opacity: n || !l ? 1 : 0,
        transition: l ? `opacity ${b}ms ${r}` : "none",
        ...ja(s, v),
        ...u && f === "display-none" && S ? { display: "none" } : {}
      },
      ref: h
    }),
    children: k
  });
});
Cu.displayName = "@mantine/core/Collapse";
const [zh, Pt] = Jt("ScrollArea.Root component was not found in tree");
function jn(e, t) {
  const n = p.useEffectEvent(t);
  Ko(() => {
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
function _h(e) {
  const { style: t, ...n } = e, o = Pt(), [r, s] = p.useState(0), [a, i] = p.useState(0), l = !!(r && a);
  return jn(o.scrollbarX, () => {
    const u = o.scrollbarX?.offsetHeight || 0;
    o.onCornerHeightChange(u), i(u);
  }), jn(o.scrollbarY, () => {
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
function Fh(e) {
  const t = Pt(), n = !!(t.scrollbarX && t.scrollbarY);
  return t.type !== "scroll" && n ? /* @__PURE__ */ c.jsx(_h, { ...e }) : null;
}
const Bh = {
  scrollHideDelay: 1e3,
  type: "hover"
};
function ju(e) {
  const { type: t, scrollHideDelay: n, scrollbars: o, getStyles: r, ref: s, ...a } = Z("ScrollAreaRoot", Bh, e), [i, l] = p.useState(null), [u, f] = p.useState(null), [h, d] = p.useState(null), [m, g] = p.useState(null), [v, x] = p.useState(null), [b, E] = p.useState(0), [S, k] = p.useState(0), [R, T] = p.useState(!1), [C, w] = p.useState(!1), A = Ve(s, l);
  return /* @__PURE__ */ c.jsx(zh, {
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
      onScrollbarYChange: x,
      scrollbarYEnabled: C,
      onScrollbarYEnabledChange: w,
      onCornerWidthChange: E,
      onCornerHeightChange: k,
      getStyles: r
    },
    children: /* @__PURE__ */ c.jsx(Q, {
      ...a,
      ref: A,
      __vars: {
        "--sa-corner-width": o !== "xy" ? "0px" : `${b}px`,
        "--sa-corner-height": o !== "xy" ? "0px" : `${S}px`
      }
    })
  });
}
ju.displayName = "@mantine/core/ScrollAreaRoot";
function ku(e, t) {
  const n = e / t;
  return Number.isNaN(n) ? 0 : n;
}
function fs(e) {
  const t = ku(e.viewport, e.content), n = e.scrollbar.paddingStart + e.scrollbar.paddingEnd, o = (e.scrollbar.size - n) * t;
  return Math.max(o, 18);
}
function Eu(e, t) {
  return (n) => {
    if (e[0] === e[1] || t[0] === t[1]) return t[0];
    const o = (t[1] - t[0]) / (e[1] - e[0]);
    return t[0] + o * (n - e[0]);
  };
}
function Vh(e, [t, n]) {
  return Math.min(n, Math.max(t, e));
}
function Oc(e, t, n = "ltr") {
  const o = fs(t), r = t.scrollbar.paddingStart + t.scrollbar.paddingEnd, s = t.scrollbar.size - r, a = t.content - t.viewport, i = s - o, l = Vh(e, n === "ltr" ? [0, a] : [a * -1, 0]);
  return Eu([0, a], [0, i])(l);
}
function Hh(e, t, n, o = "ltr") {
  const r = fs(n), s = r / 2, a = t || s, i = r - a, l = n.scrollbar.paddingStart + a, u = n.scrollbar.size - n.scrollbar.paddingEnd - i, f = n.content - n.viewport, h = o === "ltr" ? [0, f] : [f * -1, 0];
  return Eu([l, u], h)(e);
}
function Ru(e, t) {
  return e > 0 && e < t;
}
function gn(e) {
  return e ? parseInt(e, 10) : 0;
}
function $n(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
  return (o) => {
    e?.(o), (n === !1 || !o.defaultPrevented) && t?.(o);
  };
}
const [Uh, Nu] = Jt("ScrollAreaScrollbar was not found in tree");
function Tu(e) {
  const { sizes: t, hasThumb: n, onThumbChange: o, onThumbPointerUp: r, onThumbPointerDown: s, onThumbPositionChange: a, onDragScroll: i, onWheelScroll: l, onResize: u, ref: f, ...h } = e, d = Pt(), [m, g] = p.useState(null), v = Ve(f, g), x = p.useRef(null), b = p.useRef(""), { viewport: E } = d, S = t.content - t.viewport, k = p.useEffectEvent(l), R = ao(a), T = ds(u, 10), C = (w) => {
    if (x.current) {
      const A = w.clientX - x.current.left, $ = w.clientY - x.current.top;
      i({
        x: A,
        y: $
      });
    }
  };
  return p.useEffect(() => {
    const w = (A) => {
      const $ = A.target;
      m?.contains($) && k(A, S);
    };
    return document.addEventListener("wheel", w, { passive: !1 }), () => document.removeEventListener("wheel", w, { passive: !1 });
  }, [
    E,
    m,
    S
  ]), p.useEffect(R, [t, R]), jn(m, T), jn(d.content, T), /* @__PURE__ */ c.jsx(Uh, {
    value: {
      scrollbar: m,
      hasThumb: n,
      onThumbChange: ao(o),
      onThumbPointerUp: ao(r),
      onThumbPositionChange: R,
      onThumbPointerDown: ao(s)
    },
    children: /* @__PURE__ */ c.jsx("div", {
      ...h,
      ref: v,
      "data-mantine-scrollbar": !0,
      style: {
        position: "absolute",
        ...h.style
      },
      onPointerDown: $n(e.onPointerDown, (w) => {
        w.preventDefault(), w.button === 0 && (w.target.setPointerCapture(w.pointerId), x.current = m.getBoundingClientRect(), b.current = document.body.style.webkitUserSelect, document.body.style.webkitUserSelect = "none", C(w));
      }),
      onPointerMove: $n(e.onPointerMove, C),
      onPointerUp: $n(e.onPointerUp, (w) => {
        const A = w.target;
        A.hasPointerCapture(w.pointerId) && (w.preventDefault(), A.releasePointerCapture(w.pointerId));
      }),
      onLostPointerCapture: () => {
        document.body.style.webkitUserSelect = b.current, x.current = null;
      }
    })
  });
}
const Pu = (e) => {
  const { sizes: t, onSizesChange: n, style: o, ref: r, ...s } = e, a = Pt(), [i, l] = p.useState(), u = p.useRef(null), f = Ve(r, u, a.onScrollbarXChange);
  return p.useEffect(() => {
    u.current && l(getComputedStyle(u.current));
  }, [u]), /* @__PURE__ */ c.jsx(Tu, {
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
        e.onWheelScroll(m), Ru(m, d) && h.preventDefault();
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
Pu.displayName = "@mantine/core/ScrollAreaScrollbarX";
function Au(e) {
  const { sizes: t, onSizesChange: n, style: o, ref: r, ...s } = e, a = Pt(), [i, l] = p.useState(), u = p.useRef(null), f = Ve(r, u, a.onScrollbarYChange);
  return p.useEffect(() => {
    u.current && l(window.getComputedStyle(u.current));
  }, []), /* @__PURE__ */ c.jsx(Tu, {
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
        e.onWheelScroll(m), Ru(m, d) && h.preventDefault();
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
Au.displayName = "@mantine/core/ScrollAreaScrollbarY";
function ps(e) {
  const { orientation: t = "vertical", ...n } = e, { dir: o } = ko(), r = Pt(), s = p.useRef(null), a = p.useRef(0), [i, l] = p.useState({
    content: 0,
    viewport: 0,
    scrollbar: {
      size: 0,
      paddingStart: 0,
      paddingEnd: 0
    }
  }), u = ku(i.viewport, i.content), f = {
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
  }, h = (d, m) => Hh(d, a.current, i, m);
  return t === "horizontal" ? /* @__PURE__ */ c.jsx(Pu, {
    ...f,
    onThumbPositionChange: () => {
      if (r.viewport && s.current) {
        const d = r.viewport.scrollLeft, m = Oc(d, i, o);
        s.current.style.transform = `translate3d(${m}px, 0, 0)`;
      }
    },
    onWheelScroll: (d) => {
      r.viewport && (r.viewport.scrollLeft = d);
    },
    onDragScroll: (d) => {
      r.viewport && (r.viewport.scrollLeft = h(d, o));
    }
  }) : t === "vertical" ? /* @__PURE__ */ c.jsx(Au, {
    ...f,
    onThumbPositionChange: () => {
      if (r.viewport && s.current) {
        const d = r.viewport.scrollTop, m = Oc(d, i);
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
function ci(e) {
  const t = Pt(), { forceMount: n, ...o } = e, [r, s] = p.useState(!1), a = e.orientation === "horizontal", i = ds(() => {
    if (t.viewport) {
      const l = t.viewport.offsetWidth < t.viewport.scrollWidth, u = t.viewport.offsetHeight < t.viewport.scrollHeight;
      s(a ? l : u);
    }
  }, 10);
  return jn(t.viewport, i), jn(t.content, i), n || r ? /* @__PURE__ */ c.jsx(ps, {
    "data-state": r ? "visible" : "hidden",
    ...o
  }) : null;
}
ci.displayName = "@mantine/core/ScrollAreaScrollbarAuto";
function Iu(e) {
  const { forceMount: t, ...n } = e, o = Pt(), [r, s] = p.useState(!1);
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
  }, [o.scrollArea, o.scrollHideDelay]), t || r ? /* @__PURE__ */ c.jsx(ci, {
    "data-state": r ? "visible" : "hidden",
    ...n
  }) : null;
}
Iu.displayName = "@mantine/core/ScrollAreaScrollbarHover";
function Wh(e) {
  const { forceMount: t, ...n } = e, o = Pt(), r = e.orientation === "horizontal", [s, a] = p.useState("hidden"), i = ds(() => a("idle"), 100);
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
  ]), t || s !== "hidden" ? /* @__PURE__ */ c.jsx(ps, {
    "data-state": s === "hidden" ? "hidden" : "visible",
    ...n,
    onPointerEnter: $n(e.onPointerEnter, () => a("interacting")),
    onPointerLeave: $n(e.onPointerLeave, () => a("idle"))
  }) : null;
}
function ka(e) {
  const { forceMount: t, ...n } = e, o = Pt(), { onScrollbarXEnabledChange: r, onScrollbarYEnabledChange: s } = o, a = e.orientation === "horizontal";
  return p.useEffect(() => (a ? r(!0) : s(!0), () => {
    a ? r(!1) : s(!1);
  }), [
    a,
    r,
    s
  ]), o.type === "hover" ? /* @__PURE__ */ c.jsx(Iu, {
    ...n,
    forceMount: t
  }) : o.type === "scroll" ? /* @__PURE__ */ c.jsx(Wh, {
    ...n,
    forceMount: t
  }) : o.type === "auto" ? /* @__PURE__ */ c.jsx(ci, {
    ...n,
    forceMount: t
  }) : o.type === "always" ? /* @__PURE__ */ c.jsx(ps, { ...n }) : null;
}
ka.displayName = "@mantine/core/ScrollAreaScrollbar";
function qh(e, t = () => {
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
function Mu(e) {
  const { style: t, ref: n, ...o } = e, r = Pt(), s = Nu(), { onThumbPositionChange: a } = s, i = Ve(n, s.onThumbChange), l = p.useRef(void 0), u = ds(() => {
    l.current && (l.current(), l.current = void 0);
  }, 100);
  return p.useEffect(() => {
    const { viewport: f } = r;
    if (f) {
      const h = () => {
        if (u(), !l.current) {
          const d = qh(f, a);
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
    onPointerDownCapture: $n(e.onPointerDownCapture, (f) => {
      const h = f.target.getBoundingClientRect(), d = f.clientX - h.left, m = f.clientY - h.top;
      s.onThumbPointerDown({
        x: d,
        y: m
      });
    }),
    onPointerUp: $n(e.onPointerUp, s.onThumbPointerUp)
  });
}
Mu.displayName = "@mantine/core/ScrollAreaThumb";
function Ea(e) {
  const { forceMount: t, ...n } = e, o = Nu();
  return t || o.hasThumb ? /* @__PURE__ */ c.jsx(Mu, { ...n }) : null;
}
Ea.displayName = "@mantine/core/ScrollAreaThumb";
function Du({ children: e, style: t, ref: n, onWheel: o, ...r }) {
  const s = Pt(), a = Ve(n, s.onViewportChange), i = (l) => {
    if (o?.(l), s.scrollbarXEnabled && s.viewport && l.shiftKey) {
      const { scrollTop: u, scrollHeight: f, clientHeight: h, scrollWidth: d, clientWidth: m } = s.viewport, g = u < 1, v = u >= f - h - 1;
      d > m && (g || v) && l.stopPropagation();
    }
  };
  return /* @__PURE__ */ c.jsx(Q, {
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
Du.displayName = "@mantine/core/ScrollAreaViewport";
var li = {
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
  return Ou(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function gt(e) {
  var t;
  return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function an(e) {
  var t;
  return (t = (Ou(e) ? e.ownerDocument : e.document) || window.document) == null ? void 0 : t.documentElement;
}
function Ou(e) {
  return hs() ? e instanceof Node || e instanceof gt(e).Node : !1;
}
function mt(e) {
  return hs() ? e instanceof Element || e instanceof gt(e).Element : !1;
}
function Rn(e) {
  return hs() ? e instanceof HTMLElement || e instanceof gt(e).HTMLElement : !1;
}
function $c(e) {
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
function Kh(e) {
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
const Xh = /transform|translate|scale|rotate|perspective|filter/, Yh = /paint|layout|strict|content/, Pn = (e) => !!e && e !== "none";
let Zs;
function ui(e) {
  const t = mt(e) ? Kt(e) : e;
  return Pn(t.transform) || Pn(t.translate) || Pn(t.scale) || Pn(t.rotate) || Pn(t.perspective) || !di() && (Pn(t.backdropFilter) || Pn(t.filter)) || Xh.test(t.willChange || "") || Yh.test(t.contain || "");
}
function Gh(e) {
  let t = _n(e);
  for (; Rn(t) && !Go(t); ) {
    if (ui(t))
      return t;
    if (gs(t))
      return null;
    t = _n(t);
  }
  return null;
}
function di() {
  return Zs == null && (Zs = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), Zs;
}
function Go(e) {
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
function _n(e) {
  if (Eo(e) === "html")
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
function $u(e) {
  const t = _n(e);
  return Go(t) ? (e.ownerDocument || e).body : Rn(t) && ms(t) ? t : $u(t);
}
function Jo(e, t, n) {
  var o;
  t === void 0 && (t = []), n === void 0 && (n = !0);
  const r = $u(e), s = r === ((o = e.ownerDocument) == null ? void 0 : o.body), a = gt(r);
  if (s) {
    const i = Ra(a);
    return t.concat(a, a.visualViewport || [], ms(r) ? r : [], i && n ? Jo(i) : []);
  } else
    return t.concat(r, Jo(r, [], n));
}
function Ra(e) {
  return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
const Jh = ["top", "right", "bottom", "left"], Ft = Math.min, kt = Math.max, Yr = Math.round, Pr = Math.floor, tn = (e) => ({
  x: e,
  y: e
}), Zh = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
function Lu(e, t, n) {
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
function fi(e) {
  return e === "x" ? "y" : "x";
}
function pi(e) {
  return e === "y" ? "height" : "width";
}
function $t(e) {
  const t = e[0];
  return t === "t" || t === "b" ? "y" : "x";
}
function hi(e) {
  return fi($t(e));
}
function Qh(e, t, n) {
  n === void 0 && (n = !1);
  const o = Ro(e), r = hi(e), s = pi(r);
  let a = r === "x" ? o === (n ? "end" : "start") ? "right" : "left" : o === "start" ? "bottom" : "top";
  return t.reference[s] > t.floating[s] && (a = Gr(a)), [a, Gr(a)];
}
function em(e) {
  const t = Gr(e);
  return [Na(e), t, Na(t)];
}
function Na(e) {
  return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
const Lc = ["left", "right"], zc = ["right", "left"], tm = ["top", "bottom"], nm = ["bottom", "top"];
function om(e, t, n) {
  switch (e) {
    case "top":
    case "bottom":
      return n ? t ? zc : Lc : t ? Lc : zc;
    case "left":
    case "right":
      return t ? tm : nm;
    default:
      return [];
  }
}
function rm(e, t, n, o) {
  const r = Ro(e);
  let s = om(Yt(e), n === "start", o);
  return r && (s = s.map((a) => a + "-" + r), t && (s = s.concat(s.map(Na)))), s;
}
function Gr(e) {
  const t = Yt(e);
  return Zh[t] + e.slice(t.length);
}
function sm(e) {
  var t, n, o, r;
  return {
    top: (t = e.top) != null ? t : 0,
    right: (n = e.right) != null ? n : 0,
    bottom: (o = e.bottom) != null ? o : 0,
    left: (r = e.left) != null ? r : 0
  };
}
function mi(e) {
  return typeof e != "number" ? sm(e) : {
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
var am = typeof document < "u", im = function() {
}, Ta = am ? p.useLayoutEffect : im;
const cm = {
  ...nu
}, lm = cm.useInsertionEffect, um = lm || ((e) => e());
function dm(e) {
  const t = p.useRef(() => {
  });
  return um(() => {
    t.current = e;
  }), p.useCallback(function() {
    for (var n = arguments.length, o = new Array(n), r = 0; r < n; r++)
      o[r] = arguments[r];
    return t.current == null ? void 0 : t.current(...o);
  }, []);
}
function _c(e, t, n) {
  let {
    reference: o,
    floating: r
  } = e;
  const s = $t(t), a = hi(t), i = pi(a), l = Yt(t), u = s === "y", f = o.x + o.width / 2 - r.width / 2, h = o.y + o.height / 2 - r.height / 2, d = o[i] / 2 - r[i] / 2;
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
  const g = Ro(t);
  return g && (m[a] += d * (g === "end" ? 1 : -1) * (n && u ? -1 : 1)), m;
}
async function fm(e, t) {
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
  } = Xt(t, e), g = mi(m), x = i[d ? h === "floating" ? "reference" : "floating" : h], b = xn(await s.getClippingRect({
    element: (n = await (s.isElement == null ? void 0 : s.isElement(x))) == null || n ? x : x.contextElement || await (s.getDocumentElement == null ? void 0 : s.getDocumentElement(i.floating)),
    boundary: u,
    rootBoundary: f,
    strategy: l
  })), E = h === "floating" ? {
    x: o,
    y: r,
    width: a.floating.width,
    height: a.floating.height
  } : a.reference, S = await (s.getOffsetParent == null ? void 0 : s.getOffsetParent(i.floating)), k = await (s.isElement == null ? void 0 : s.isElement(S)) && await (s.getScale == null ? void 0 : s.getScale(S)) || {
    x: 1,
    y: 1
  }, R = xn(s.convertOffsetParentRelativeRectToViewportRelativeRect ? await s.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements: i,
    rect: E,
    offsetParent: S,
    strategy: l
  }) : E);
  return {
    top: (b.top - R.top + g.top) / k.y,
    bottom: (R.bottom - b.bottom + g.bottom) / k.y,
    left: (b.left - R.left + g.left) / k.x,
    right: (R.right - b.right + g.right) / k.x
  };
}
const pm = 50, hm = async (e, t, n) => {
  const {
    placement: o = "bottom",
    strategy: r = "absolute",
    middleware: s = [],
    platform: a
  } = n, i = a.detectOverflow ? a : {
    ...a,
    detectOverflow: fm
  }, l = await (a.isRTL == null ? void 0 : a.isRTL(t));
  let u = await a.getElementRects({
    reference: e,
    floating: t,
    strategy: r
  }), {
    x: f,
    y: h
  } = _c(u, o, l), d = o, m = 0;
  const g = {};
  for (let v = 0; v < s.length; v++) {
    const x = s[v];
    if (!x)
      continue;
    const {
      name: b,
      fn: E
    } = x, {
      x: S,
      y: k,
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
    f = S ?? f, h = k ?? h, g[b] = {
      ...g[b],
      ...R
    }, T && m < pm && (m++, typeof T == "object" && (T.placement && (d = T.placement), T.rects && (u = T.rects === !0 ? await a.getElementRects({
      reference: e,
      floating: t,
      strategy: r
    }) : T.rects), {
      x: f,
      y: h
    } = _c(u, d, l)), v = -1);
  }
  return {
    x: f,
    y: h,
    placement: d,
    strategy: r,
    middlewareData: g
  };
}, mm = (e) => ({
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
    } = Xt(e, t) || {};
    if (u == null)
      return {};
    const h = mi(f), d = {
      x: n,
      y: o
    }, m = hi(r), g = pi(m), v = await a.getDimensions(u), x = m === "y", b = x ? "top" : "left", E = x ? "bottom" : "right", S = x ? "clientHeight" : "clientWidth", k = s.reference[g] + s.reference[m] - d[m] - s.floating[g], R = d[m] - s.reference[m], T = await (a.getOffsetParent == null ? void 0 : a.getOffsetParent(u));
    let C = T ? T[S] : 0;
    (!C || !await (a.isElement == null ? void 0 : a.isElement(T))) && (C = i.floating[S] || s.floating[g]);
    const w = k / 2 - R / 2, A = C / 2 - v[g] / 2 - 1, $ = Ft(h[b], A), z = Ft(h[E], A), V = C - v[g] - z, B = C / 2 - v[g] / 2 + w, M = Lu($, B, V), O = !l.arrow && Ro(r) != null && B !== M && s.reference[g] / 2 - (B < $ ? $ : z) - v[g] / 2 < 0, D = O ? B < $ ? B - $ : B - V : 0;
    return {
      [m]: d[m] + D,
      data: {
        [m]: M,
        centerOffset: B - M - D,
        ...O && {
          alignmentOffset: D
        }
      },
      reset: O
    };
  }
}), gm = function(e) {
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
        flipAlignment: v = !0,
        ...x
      } = Xt(e, t);
      if ((n = s.arrow) != null && n.alignmentOffset)
        return {};
      const b = Yt(r), E = $t(i), S = Yt(i) === i, k = await (l.isRTL == null ? void 0 : l.isRTL(u.floating)), R = d || (S || !v ? [Gr(i)] : em(i)), T = g !== "none";
      !d && T && R.push(...rm(i, v, g, k));
      const C = [i, ...R], w = await l.detectOverflow(t, x), A = [];
      let $ = ((o = s.flip) == null ? void 0 : o.overflows) || [];
      if (f && A.push(w[b]), h) {
        const M = Qh(r, a, k);
        A.push(w[M[0]], w[M[1]]);
      }
      if ($ = [...$, {
        placement: r,
        overflows: A
      }], !A.every((M) => M <= 0)) {
        var z, V;
        const M = (((z = s.flip) == null ? void 0 : z.index) || 0) + 1, O = C[M];
        if (O && (!(h === "alignment" ? E !== $t(O) : !1) || // We leave the current main axis only if every placement on that axis
        // overflows the main axis.
        $.every((I) => $t(I.placement) === E ? I.overflows[0] > 0 : !0)))
          return {
            data: {
              index: M,
              overflows: $
            },
            reset: {
              placement: O
            }
          };
        let D = (V = $.filter((L) => L.overflows[0] <= 0).sort((L, I) => L.overflows[1] - I.overflows[1])[0]) == null ? void 0 : V.placement;
        if (!D)
          switch (m) {
            case "bestFit": {
              var B;
              const L = (B = $.filter((I) => {
                if (T) {
                  const P = $t(I.placement);
                  return P === E || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  P === "y";
                }
                return !0;
              }).map((I) => [I.placement, I.overflows.filter((P) => P > 0).reduce((P, F) => P + F, 0)]).sort((I, P) => I[1] - P[1])[0]) == null ? void 0 : B[0];
              L && (D = L);
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
function Fc(e, t) {
  return {
    top: e.top - t.height,
    right: e.right - t.width,
    bottom: e.bottom - t.height,
    left: e.left - t.width
  };
}
function Bc(e) {
  return Jh.some((t) => e[t] >= 0);
}
const vm = function(e) {
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
          }), i = Fc(a, n.reference);
          return {
            data: {
              referenceHiddenOffsets: i,
              referenceHidden: Bc(i)
            }
          };
        }
        case "escaped": {
          const a = await o.detectOverflow(t, {
            ...s,
            altBoundary: !0
          }), i = Fc(a, n.floating);
          return {
            data: {
              escapedOffsets: i,
              escaped: Bc(i)
            }
          };
        }
        default:
          return {};
      }
    }
  };
};
function zu(e) {
  const t = Ft(...e.map((s) => s.left)), n = Ft(...e.map((s) => s.top)), o = kt(...e.map((s) => s.right)), r = kt(...e.map((s) => s.bottom));
  return {
    x: t,
    y: n,
    width: o - t,
    height: r - n
  };
}
function ym(e) {
  const t = e.slice().sort((r, s) => r.y - s.y), n = [];
  let o = null;
  for (let r = 0; r < t.length; r++) {
    const s = t[r];
    !o || s.y - o.y > o.height / 2 ? n.push([s]) : n[n.length - 1].push(s), o = s;
  }
  return n.map((r) => xn(zu(r)));
}
const bm = function(e) {
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
      } = Xt(e, t), f = Array.from(await (s.getClientRects == null ? void 0 : s.getClientRects(o.reference)) || []);
      if (!f.length)
        return {};
      const h = ym(f), d = xn(zu(f)), m = mi(i);
      function g() {
        if (h.length === 2 && (h[0].left > h[1].right || h[1].left > h[0].right) && l != null && u != null)
          return h.find((x) => l > x.left - m.left && l < x.right + m.right && u > x.top - m.top && u < x.bottom + m.bottom) || d;
        if (h.length >= 2) {
          if ($t(n) === "y") {
            const T = h[0], C = h[h.length - 1], w = Yt(n) === "top", A = T.top, $ = C.bottom, z = w ? T.left : C.left, V = w ? T.right : C.right;
            return xn({
              x: z,
              y: A,
              width: V - z,
              height: $ - A
            });
          }
          const x = Yt(n) === "left", b = kt(...h.map((T) => T.right)), E = Ft(...h.map((T) => T.left)), S = h.filter((T) => x ? T.left === E : T.right === b), k = S[0].top, R = S[S.length - 1].bottom;
          return xn({
            x: E,
            y: k,
            width: b - E,
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
}, _u = /* @__PURE__ */ new Set(["left", "top"]);
async function wm(e, t) {
  const {
    placement: n,
    platform: o,
    elements: r
  } = e, s = await (o.isRTL == null ? void 0 : o.isRTL(r.floating)), a = Yt(n), i = Ro(n), l = $t(n) === "y", u = _u.has(a) ? -1 : 1, f = s && l ? -1 : 1, h = Xt(t, e);
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
const xm = function(e) {
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
      } = t, l = await wm(t, e);
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
}, Sm = function(e) {
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
          fn: (E) => {
            let {
              x: S,
              y: k
            } = E;
            return {
              x: S,
              y: k
            };
          }
        },
        ...u
      } = Xt(e, t), f = {
        x: n,
        y: o
      }, h = await s.detectOverflow(t, u), d = $t(r), m = fi(d);
      let g = f[m], v = f[d];
      const x = (E, S) => Lu(S + h[E === "y" ? "top" : "left"], S, S - h[E === "y" ? "bottom" : "right"]);
      a && (g = x(m, g)), i && (v = x(d, v));
      const b = l.fn({
        ...t,
        [m]: g,
        [d]: v
      });
      return {
        ...b,
        data: {
          x: b.x - n,
          y: b.y - o,
          enabled: {
            [m]: a,
            [d]: i
          }
        }
      };
    }
  };
}, Cm = function(e) {
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
      } = Xt(e, t), d = {
        x: r,
        y: s
      }, m = $t(a), g = fi(m);
      let v = d[g], x = d[m];
      const b = Xt(u, t), E = typeof b == "number" ? {
        mainAxis: b,
        crossAxis: 0
      } : {
        mainAxis: (n = b.mainAxis) != null ? n : 0,
        crossAxis: (o = b.crossAxis) != null ? o : 0
      };
      if (f) {
        const R = g === "y" ? "height" : "width", T = i.reference[g] - i.floating[R] + E.mainAxis, C = i.reference[g] + i.reference[R] - E.mainAxis;
        v < T ? v = T : v > C && (v = C);
      }
      if (h) {
        var S, k;
        const R = g === "y" ? "width" : "height", T = _u.has(Yt(a)), C = i.reference[m] - i.floating[R] + (T && ((S = l.offset) == null ? void 0 : S[m]) || 0) + (T ? 0 : E.crossAxis), w = i.reference[m] + i.reference[R] + (T ? 0 : ((k = l.offset) == null ? void 0 : k[m]) || 0) - (T ? E.crossAxis : 0);
        x < C ? x = C : x > w && (x = w);
      }
      return {
        [g]: v,
        [m]: x
      };
    }
  };
}, jm = function(e) {
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
      } = Xt(e, t), l = await r.detectOverflow(t, i), u = Yt(n), f = Ro(n), h = $t(n) === "y", {
        width: d,
        height: m
      } = o.floating;
      let g, v;
      u === "top" || u === "bottom" ? (g = u, v = f === (await (r.isRTL == null ? void 0 : r.isRTL(s.floating)) ? "start" : "end") ? "left" : "right") : (v = u, g = f === "end" ? "top" : "bottom");
      const x = m - l.top - l.bottom, b = d - l.left - l.right, E = Ft(m - l[g], x), S = Ft(d - l[v], b), k = t.middlewareData.shift, R = !k;
      let T = E, C = S;
      k != null && k.enabled.x && (C = b), k != null && k.enabled.y && (T = x), R && !f && (h ? C = d - 2 * kt(l.left, l.right) : T = m - 2 * kt(l.top, l.bottom)), await a({
        ...t,
        availableWidth: C,
        availableHeight: T
      });
      const w = await r.getDimensions(s.floating);
      return d !== w.width || m !== w.height ? {
        reset: {
          rects: !0
        }
      } : {};
    }
  };
};
function Fu(e) {
  const t = Kt(e);
  let n = parseFloat(t.width) || 0, o = parseFloat(t.height) || 0;
  const r = Rn(e), s = r ? e.offsetWidth : n, a = r ? e.offsetHeight : o, i = Yr(n) !== s || Yr(o) !== a;
  return i && (n = s, o = a), {
    width: n,
    height: o,
    $: i
  };
}
function gi(e) {
  return mt(e) ? e : e.contextElement;
}
function io(e) {
  const t = gi(e);
  if (!Rn(t))
    return tn(1);
  const n = t.getBoundingClientRect(), {
    width: o,
    height: r,
    $: s
  } = Fu(t);
  let a = (s ? Yr(n.width) : n.width) / o, i = (s ? Yr(n.height) : n.height) / r;
  return (!a || !Number.isFinite(a)) && (a = 1), (!i || !Number.isFinite(i)) && (i = 1), {
    x: a,
    y: i
  };
}
const km = /* @__PURE__ */ tn(0);
function Bu(e) {
  const t = gt(e);
  return !di() || !t.visualViewport ? km : {
    x: t.visualViewport.offsetLeft,
    y: t.visualViewport.offsetTop
  };
}
function Em(e, t, n) {
  return t === void 0 && (t = !1), !!n && t && n === gt(e);
}
function Fn(e, t, n, o) {
  t === void 0 && (t = !1), n === void 0 && (n = !1);
  const r = e.getBoundingClientRect(), s = gi(e);
  let a = tn(1);
  t && (o ? mt(o) && (a = io(o)) : a = io(e));
  const i = Em(s, n, o) ? Bu(s) : tn(0);
  let l = (r.left + i.x) / a.x, u = (r.top + i.y) / a.y, f = r.width / a.x, h = r.height / a.y;
  if (s && o) {
    const d = gt(s), m = mt(o) ? gt(o) : o;
    let g = d, v = Ra(g);
    for (; v && m !== g; ) {
      const x = io(v), b = v.getBoundingClientRect(), E = Kt(v), S = b.left + (v.clientLeft + parseFloat(E.paddingLeft)) * x.x, k = b.top + (v.clientTop + parseFloat(E.paddingTop)) * x.y;
      l *= x.x, u *= x.y, f *= x.x, h *= x.y, l += S, u += k, g = gt(v), v = Ra(g);
    }
  }
  return xn({
    width: f,
    height: h,
    x: l,
    y: u
  });
}
function ys(e, t) {
  const n = vs(e).scrollLeft;
  return t ? t.left + n : Fn(an(e)).left + n;
}
function Vu(e, t) {
  const n = e.getBoundingClientRect(), o = n.left + t.scrollLeft - ys(e, n), r = n.top + t.scrollTop;
  return {
    x: o,
    y: r
  };
}
function Rm(e) {
  let {
    elements: t,
    rect: n,
    offsetParent: o,
    strategy: r
  } = e;
  const s = r === "fixed", a = an(o), i = t ? gs(t.floating) : !1;
  if (o === a || i && s)
    return n;
  let l = {
    scrollLeft: 0,
    scrollTop: 0
  }, u = tn(1);
  const f = tn(0), h = Rn(o);
  if ((h || !s) && ((Eo(o) !== "body" || ms(a)) && (l = vs(o)), h)) {
    const m = Fn(o);
    u = io(o), f.x = m.x + o.clientLeft, f.y = m.y + o.clientTop;
  }
  const d = a && !h && !s ? Vu(a, l) : tn(0);
  return {
    width: n.width * u.x,
    height: n.height * u.y,
    x: n.x * u.x - l.scrollLeft * u.x + f.x + d.x,
    y: n.y * u.y - l.scrollTop * u.y + f.y + d.y
  };
}
function Nm(e) {
  return e.getClientRects ? Array.from(e.getClientRects()) : [];
}
function Tm(e) {
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
const Pm = 25;
function Am(e, t, n) {
  n === void 0 && (n = "viewport");
  const o = n === "layoutViewport", r = gt(e), s = an(e), a = r.visualViewport;
  let i = s.clientWidth, l = s.clientHeight, u = 0, f = 0;
  if (a) {
    const d = !di() || t === "fixed";
    o ? d || (u = -a.offsetLeft, f = -a.offsetTop) : (i = a.width, l = a.height, d && (u = a.offsetLeft, f = a.offsetTop));
  }
  if (ys(s) <= 0) {
    const d = s.ownerDocument, m = d.body, g = getComputedStyle(m), v = d.compatMode === "CSS1Compat" && parseFloat(g.marginLeft) + parseFloat(g.marginRight) || 0, x = Math.abs(s.clientWidth - m.clientWidth - v), b = getComputedStyle(s).scrollbarGutter === "stable both-edges" ? x / 2 : x;
    b <= Pm && (i -= b);
  }
  return {
    width: i,
    height: l,
    x: u,
    y: f
  };
}
function Im(e, t) {
  const n = Fn(e, !0, t === "fixed"), o = n.top + e.clientTop, r = n.left + e.clientLeft, s = io(e), a = e.clientWidth * s.x, i = e.clientHeight * s.y, l = r * s.x, u = o * s.y;
  return {
    width: a,
    height: i,
    x: l,
    y: u
  };
}
function Vc(e, t, n) {
  let o;
  if (t === "viewport" || t === "layoutViewport")
    o = Am(e, n, t);
  else if (t === "document")
    o = Tm(an(e));
  else if (mt(t))
    o = Im(t, n);
  else {
    const r = Bu(e);
    o = {
      x: t.x - r.x,
      y: t.y - r.y,
      width: t.width,
      height: t.height
    };
  }
  return xn(o);
}
function Mm(e, t) {
  const n = t.get(e);
  if (n)
    return n;
  let o = Jo(e, [], !1).filter((i) => mt(i) && Eo(i) !== "body"), r = null;
  const s = Kt(e).position === "fixed";
  let a = s ? _n(e) : e;
  for (; mt(a) && !Go(a); ) {
    const i = Kt(a), l = ui(a), u = r ? r.position : s ? "fixed" : "";
    !l && (u === "fixed" || u === "absolute" && i.position === "static") ? o = o.filter((h) => h !== a) : r = i, a = _n(a);
  }
  return t.set(e, o), o;
}
function Dm(e) {
  let {
    element: t,
    boundary: n,
    rootBoundary: o,
    strategy: r
  } = e;
  const a = [...n === "clippingAncestors" ? gs(t) ? [] : Mm(t, this._c) : [].concat(n), o], i = Vc(t, a[0], r);
  let l = i.top, u = i.right, f = i.bottom, h = i.left;
  for (let d = 1; d < a.length; d++) {
    const m = Vc(t, a[d], r);
    l = kt(m.top, l), u = Ft(m.right, u), f = Ft(m.bottom, f), h = kt(m.left, h);
  }
  return {
    width: u - h,
    height: f - l,
    x: h,
    y: l
  };
}
function Om(e) {
  const {
    width: t,
    height: n
  } = Fu(e);
  return {
    width: t,
    height: n
  };
}
function $m(e, t, n) {
  const o = Rn(t), r = an(t), s = n === "fixed", a = Fn(e, !0, s, t);
  let i = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const l = tn(0);
  if ((o || !s) && ((Eo(t) !== "body" || ms(r)) && (i = vs(t)), o)) {
    const d = Fn(t, !0, s, t);
    l.x = d.x + t.clientLeft, l.y = d.y + t.clientTop;
  }
  !o && r && (l.x = ys(r));
  const u = r && !o && !s ? Vu(r, i) : tn(0), f = a.left + i.scrollLeft - l.x - u.x, h = a.top + i.scrollTop - l.y - u.y;
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
function Hc(e, t) {
  if (!Rn(e) || Kt(e).position === "fixed")
    return null;
  if (t)
    return t(e);
  let n = e.offsetParent;
  return an(e) === n && (n = n.ownerDocument.body), n;
}
function Hu(e, t) {
  const n = gt(e);
  if (gs(e))
    return n;
  if (!Rn(e)) {
    let r = _n(e);
    for (; r && !Go(r); ) {
      if (mt(r) && !Qs(r))
        return r;
      r = _n(r);
    }
    return n;
  }
  let o = Hc(e, t);
  for (; o && Kh(o) && Qs(o); )
    o = Hc(o, t);
  return o && Go(o) && Qs(o) && !ui(o) ? n : o || Gh(e) || n;
}
const Lm = async function(e) {
  const t = this.getOffsetParent || Hu, n = this.getDimensions, o = await n(e.floating);
  return {
    reference: $m(e.reference, await t(e.floating), e.strategy),
    floating: {
      x: 0,
      y: 0,
      width: o.width,
      height: o.height
    }
  };
};
function zm(e) {
  return Kt(e).direction === "rtl";
}
const _m = {
  convertOffsetParentRelativeRectToViewportRelativeRect: Rm,
  getDocumentElement: an,
  getClippingRect: Dm,
  getOffsetParent: Hu,
  getElementRects: Lm,
  getClientRects: Nm,
  getDimensions: Om,
  getScale: io,
  isElement: mt,
  isRTL: zm
};
function Uu(e, t) {
  return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function Fm(e, t, n) {
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
      height: x
    } = d;
    if (f || t(), !v || !x)
      return;
    const b = Pr(g), E = Pr(s.clientWidth - (m + v)), S = Pr(s.clientHeight - (g + x)), k = Pr(m), T = {
      rootMargin: -b + "px " + -E + "px " + -S + "px " + -k + "px",
      threshold: kt(0, Ft(1, h)) || 1
    };
    let C = !0;
    function w(A) {
      const $ = A[0].intersectionRatio;
      if (!Uu(d, e.getBoundingClientRect()))
        return i();
      if ($ !== h) {
        if (!C)
          return i();
        $ ? i(!1, $) : r = setTimeout(() => {
          i(!1, 1e-7);
        }, 1e3);
      }
      C = !1;
    }
    try {
      o = new IntersectionObserver(w, {
        ...T,
        // Handle <iframe>s
        root: s.ownerDocument
      });
    } catch {
      o = new IntersectionObserver(w, T);
    }
    o.observe(e);
  }
  const l = gt(e), u = () => i(n);
  return l.addEventListener("resize", u), i(!0), () => {
    l.removeEventListener("resize", u), a();
  };
}
function Uc(e, t, n, o) {
  o === void 0 && (o = {});
  const {
    ancestorScroll: r = !0,
    ancestorResize: s = !0,
    elementResize: a = typeof ResizeObserver == "function",
    layoutShift: i = typeof IntersectionObserver == "function",
    animationFrame: l = !1
  } = o, u = gi(e), f = r || s ? [...u ? Jo(u) : [], ...t ? Jo(t) : []] : [];
  f.forEach((b) => {
    r && b.addEventListener("scroll", n), s && b.addEventListener("resize", n);
  });
  const h = u && i ? Fm(u, n, s) : null;
  let d = -1, m = null;
  a && (m = new ResizeObserver((b) => {
    let [E] = b;
    E && E.target === u && m && t && (m.unobserve(t), cancelAnimationFrame(d), d = requestAnimationFrame(() => {
      var S;
      (S = m) == null || S.observe(t);
    })), n();
  }), u && !l && m.observe(u), t && m.observe(t));
  let g, v = l ? Fn(e) : null;
  l && x();
  function x() {
    const b = Fn(e);
    v && !Uu(v, b) && n(), v = b, g = requestAnimationFrame(x);
  }
  return n(), () => {
    var b;
    f.forEach((E) => {
      r && E.removeEventListener("scroll", n), s && E.removeEventListener("resize", n);
    }), h?.(), (b = m) == null || b.disconnect(), m = null, l && cancelAnimationFrame(g);
  };
}
const Bm = xm, Vm = Sm, Hm = gm, Um = jm, Wm = vm, Wc = mm, qm = bm, Km = Cm, Xm = (e, t, n) => {
  const o = /* @__PURE__ */ new Map(), r = n ?? {}, s = {
    ..._m,
    ...r.platform,
    _c: o
  };
  return hm(e, t, {
    ...r,
    platform: s
  });
};
var Ym = typeof document < "u", Gm = function() {
}, $r = Ym ? p.useLayoutEffect : Gm;
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
function Wu(e) {
  return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function qc(e, t) {
  const n = Wu(e);
  return Math.round(t * n) / n;
}
function ea(e) {
  const t = p.useRef(e);
  return $r(() => {
    t.current = e;
  }), t;
}
function Jm(e) {
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
  const [g, v] = p.useState(null), [x, b] = p.useState(null), E = p.useCallback((I) => {
    I !== T.current && (T.current = I, v(I));
  }, []), S = p.useCallback((I) => {
    I !== C.current && (C.current = I, b(I));
  }, []), k = s || g, R = a || x, T = p.useRef(null), C = p.useRef(null), w = p.useRef(f), A = l != null, $ = ea(l), z = ea(r), V = ea(u), B = p.useCallback(() => {
    if (!T.current || !C.current)
      return;
    const I = {
      placement: t,
      strategy: n,
      middleware: d
    };
    z.current && (I.platform = z.current), Xm(T.current, C.current, I).then((P) => {
      const F = {
        ...P,
        // The floating element's position may be recomputed while it's closed
        // but still mounted (such as when transitioning out). To ensure
        // `isPositioned` will be `false` initially on the next open, avoid
        // setting it to `true` when `open === false` (must be specified).
        isPositioned: V.current !== !1
      };
      M.current && !Jr(w.current, F) && (w.current = F, qt.flushSync(() => {
        h(F);
      }));
    });
  }, [d, t, n, z, V]);
  $r(() => {
    u === !1 && w.current.isPositioned && (w.current.isPositioned = !1, h((I) => ({
      ...I,
      isPositioned: !1
    })));
  }, [u]);
  const M = p.useRef(!1);
  $r(() => (M.current = !0, () => {
    M.current = !1;
  }), []), $r(() => {
    if (k && (T.current = k), R && (C.current = R), k && R) {
      if ($.current)
        return $.current(k, R, B);
      B();
    }
  }, [k, R, B, $, A]);
  const O = p.useMemo(() => ({
    reference: T,
    floating: C,
    setReference: E,
    setFloating: S
  }), [E, S]), D = p.useMemo(() => ({
    reference: k,
    floating: R
  }), [k, R]), L = p.useMemo(() => {
    const I = {
      position: n,
      left: 0,
      top: 0
    };
    if (!D.floating)
      return I;
    const P = qc(D.floating, f.x), F = qc(D.floating, f.y);
    return i ? {
      ...I,
      transform: "translate(" + P + "px, " + F + "px)",
      ...Wu(D.floating) >= 1.5 && {
        willChange: "transform"
      }
    } : {
      position: n,
      left: P,
      top: F
    };
  }, [n, i, D.floating, f.x, f.y]);
  return p.useMemo(() => ({
    ...f,
    update: B,
    refs: O,
    elements: D,
    floatingStyles: L
  }), [f, B, O, D, L]);
}
const Zm = (e) => {
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
      return o && t(o) ? o.current != null ? Wc({
        element: o.current,
        padding: r
      }).fn(n) : {} : o ? Wc({
        element: o,
        padding: r
      }).fn(n) : {};
    }
  };
}, Qm = (e, t) => {
  const n = Bm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, eg = (e, t) => {
  const n = Vm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, tg = (e, t) => ({
  fn: Km(e).fn,
  options: [e, t]
}), ng = (e, t) => {
  const n = Hm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, og = (e, t) => {
  const n = Um(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, rg = (e, t) => {
  const n = Wm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, Kc = (e, t) => {
  const n = qm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, sg = (e, t) => {
  const n = Zm(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
};
function qu(e) {
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
const ag = {
  ...nu
};
let Xc = !1, ig = 0;
const Yc = () => (
  // Ensure the id is unique with multiple independent versions of Floating UI
  // on <React 18
  "floating-ui-" + Math.random().toString(36).slice(2, 6) + ig++
);
function cg() {
  const [e, t] = p.useState(() => Xc ? Yc() : void 0);
  return Ta(() => {
    e == null && t(Yc());
  }, []), p.useEffect(() => {
    Xc = !0;
  }, []), e;
}
const lg = ag.useId, ug = lg || cg;
function dg() {
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
const fg = /* @__PURE__ */ p.createContext(null), pg = /* @__PURE__ */ p.createContext(null), hg = () => {
  var e;
  return ((e = p.useContext(fg)) == null ? void 0 : e.id) || null;
}, mg = () => p.useContext(pg);
function gg(e) {
  const {
    open: t = !1,
    onOpenChange: n,
    elements: o
  } = e, r = ug(), s = p.useRef({}), [a] = p.useState(() => dg()), i = hg() != null, [l, u] = p.useState(o.reference), f = dm((m, g, v) => {
    s.current.openEvent = m ? g : void 0, a.emit("openchange", {
      open: m,
      event: g,
      reason: v,
      nested: i
    }), n?.(m, g, v);
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
function vg(e) {
  var t, n;
  let {
    elements: o,
    ...r
  } = e === void 0 ? {} : e;
  const {
    nodeId: s
  } = r, a = gg({
    ...r,
    elements: {
      reference: (t = o?.reference) != null ? t : null,
      floating: (n = o?.floating) != null ? n : null
    }
  }), i = r.rootContext || a, l = i.elements, [u, f] = p.useState(null), [h, d] = p.useState(null), g = l?.domReference || u, v = p.useRef(null), x = mg();
  Ta(() => {
    g && (v.current = g);
  }, [g]);
  const b = Jm({
    ...r,
    elements: {
      ...l,
      ...h && {
        reference: h
      }
    }
  }), E = p.useCallback((C) => {
    const w = mt(C) ? {
      getBoundingClientRect: () => C.getBoundingClientRect(),
      getClientRects: () => C.getClientRects(),
      contextElement: C
    } : C;
    d(w), b.refs.setReference(w);
  }, [b.refs]), S = p.useCallback((C) => {
    (mt(C) || C === null) && (v.current = C, f(C)), (mt(b.refs.reference.current) || b.refs.reference.current === null || // Don't allow setting virtual elements using the old technique back to
    // `null` to support `positionReference` + an unstable `reference`
    // callback ref.
    C !== null && !mt(C)) && b.refs.setReference(C);
  }, [b.refs]), k = p.useMemo(() => ({
    ...b.refs,
    setReference: S,
    setPositionReference: E,
    domReference: v
  }), [b.refs, S, E]), R = p.useMemo(() => ({
    ...b.elements,
    domReference: g
  }), [b.elements, g]), T = p.useMemo(() => ({
    ...b,
    ...i,
    refs: k,
    elements: R,
    nodeId: s
  }), [b, k, R, s, i]);
  return Ta(() => {
    i.dataRef.current.floatingContext = T;
    const C = x?.nodesRef.current.find((w) => w.id === s);
    C && (C.context = T);
  }), p.useMemo(() => ({
    ...b,
    context: T,
    refs: k,
    elements: R
  }), [b, k, R, T]);
}
const Ku = {
  scrollHideDelay: 1e3,
  type: "hover",
  scrollbars: "xy"
}, Xu = ze((e, { scrollbarSize: t, overscrollBehavior: n, scrollbars: o }) => {
  let r = n;
  return n && o && (o === "x" ? r = `${n} auto` : o === "y" && (r = `auto ${n}`)), { root: {
    "--scrollarea-scrollbar-size": Ae(t),
    "--scrollarea-over-scroll-behavior": r
  } };
}), Nn = ce((e) => {
  const t = Z("ScrollArea", Ku, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, scrollbarSize: i, vars: l, type: u, scrollHideDelay: f, viewportProps: h, viewportRef: d, onScrollPositionChange: m, children: g, offsetScrollbars: v, scrollbars: x, onBottomReached: b, onTopReached: E, onLeftReached: S, onRightReached: k, overscrollBehavior: R, startScrollPosition: T, verticalScrollbarPosition: C, attributes: w, ...A } = t, [$, z] = p.useState(!1), [V, B] = p.useState(!1), [M, O] = p.useState(!1), D = p.useRef(!0), L = p.useRef(!1), I = p.useRef(!0), P = p.useRef(!1), F = De({
    name: "ScrollArea",
    props: t,
    classes: li,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: w,
    vars: l,
    varsResolver: Xu
  }), _ = p.useRef(null), [U, X] = p.useState(null), ne = p.useCallback((oe) => {
    X((te) => te === oe ? te : oe);
  }, []), de = qu([
    d,
    _,
    ne
  ]);
  return jn(v === "present" ? U : null, () => {
    const oe = _.current;
    oe && (B(oe.scrollHeight > oe.clientHeight), O(oe.scrollWidth > oe.clientWidth));
  }), Ko(() => {
    T && _.current && _.current.scrollTo({
      left: T.x ?? 0,
      top: T.y ?? 0
    });
  }, []), /* @__PURE__ */ c.jsxs(ju, {
    getStyles: F,
    type: u === "never" ? "always" : u,
    scrollHideDelay: f,
    scrollbars: x,
    ...F("root"),
    ...A,
    children: [
      /* @__PURE__ */ c.jsx(Du, {
        ...h,
        ...F("viewport", { style: h?.style }),
        ref: de,
        "data-offset-scrollbars": v === !0 ? "xy" : v || void 0,
        "data-scrollbars": x || void 0,
        "data-vertical-scrollbar-position": C || void 0,
        "data-horizontal-hidden": v === "present" && !M ? "true" : void 0,
        "data-vertical-hidden": v === "present" && !V ? "true" : void 0,
        onScroll: (oe) => {
          h?.onScroll?.(oe), m?.({
            x: oe.currentTarget.scrollLeft,
            y: oe.currentTarget.scrollTop
          });
          const { scrollTop: te, scrollHeight: fe, clientHeight: K, scrollLeft: q, scrollWidth: ae, clientWidth: be } = oe.currentTarget, he = te - (fe - K) >= -0.8, ke = te === 0;
          he && !L.current && b?.(), ke && !D.current && E?.(), L.current = he, D.current = ke;
          const re = q - (ae - be) >= -0.8, W = q === 0;
          re && !P.current && k?.(), W && !I.current && S?.(), P.current = re, I.current = W;
        },
        children: g
      }),
      (x === "xy" || x === "x") && /* @__PURE__ */ c.jsx(ka, {
        ...F("scrollbar"),
        orientation: "horizontal",
        "data-vertical-scrollbar-position": C || void 0,
        "data-hidden": u === "never" || v === "present" && !M ? !0 : void 0,
        forceMount: !0,
        onMouseEnter: () => z(!0),
        onMouseLeave: () => z(!1),
        children: /* @__PURE__ */ c.jsx(Ea, { ...F("thumb") })
      }),
      (x === "xy" || x === "y") && /* @__PURE__ */ c.jsx(ka, {
        ...F("scrollbar"),
        orientation: "vertical",
        "data-vertical-scrollbar-position": C || void 0,
        "data-hidden": u === "never" || v === "present" && !V ? !0 : void 0,
        forceMount: !0,
        onMouseEnter: () => z(!0),
        onMouseLeave: () => z(!1),
        children: /* @__PURE__ */ c.jsx(Ea, { ...F("thumb") })
      }),
      /* @__PURE__ */ c.jsx(Fh, {
        ...F("corner"),
        "data-vertical-scrollbar-position": C || void 0,
        "data-hovered": $ || void 0,
        "data-hidden": u === "never" || void 0
      })
    ]
  });
});
Nn.displayName = "@mantine/core/ScrollArea";
const vi = ce((e) => {
  const { children: t, classNames: n, styles: o, scrollbarSize: r, scrollHideDelay: s, type: a, dir: i, offsetScrollbars: l, overscrollBehavior: u, viewportRef: f, onScrollPositionChange: h, unstyled: d, variant: m, viewportProps: g, scrollbars: v, style: x, vars: b, onBottomReached: E, onTopReached: S, startScrollPosition: k, verticalScrollbarPosition: R, onOverflowChange: T, ...C } = Z("ScrollAreaAutosize", Ku, e), w = p.useRef(null), [A, $] = p.useState(null), z = p.useCallback((D) => {
    $((L) => L === D ? L : D);
  }, []), V = qu([
    f,
    w,
    z
  ]), B = p.useRef(!1), M = p.useRef(!1), O = p.useEffectEvent(() => {
    const D = w.current;
    if (!D || !T) return;
    const L = D.scrollHeight > D.clientHeight;
    L !== B.current && (M.current ? T(L) : (M.current = !0, L && T(!0)), B.current = L);
  });
  return jn(T ? A : null, O), /* @__PURE__ */ c.jsx(Q, {
    ...C,
    variant: m,
    style: [{
      display: "flex",
      overflow: "hidden"
    }, x],
    children: /* @__PURE__ */ c.jsx(Q, {
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
      children: /* @__PURE__ */ c.jsx(Nn, {
        classNames: n,
        styles: o,
        scrollHideDelay: s,
        scrollbarSize: r,
        type: a,
        dir: i,
        offsetScrollbars: l,
        overscrollBehavior: u,
        viewportRef: V,
        onScrollPositionChange: h,
        unstyled: d,
        variant: m,
        viewportProps: g,
        vars: b,
        scrollbars: v,
        onBottomReached: E,
        onTopReached: S,
        startScrollPosition: k,
        verticalScrollbarPosition: R,
        "data-autosize": "true",
        children: t
      })
    })
  });
});
Nn.classes = li;
Nn.varsResolver = Xu;
vi.displayName = "@mantine/core/ScrollAreaAutosize";
vi.classes = li;
Nn.Autosize = vi;
var Yu = { root: "m_515a97f8" };
const yi = ce((e) => {
  const t = Z("VisuallyHidden", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, attributes: l, ...u } = t, f = De({
    name: "VisuallyHidden",
    classes: Yu,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: l
  });
  return /* @__PURE__ */ c.jsx(Q, {
    component: "span",
    ...f("root"),
    ...u
  });
});
yi.classes = Yu;
yi.displayName = "@mantine/core/VisuallyHidden";
function Gc(e, t, n, o) {
  return e === "center" || o === "center" ? { top: t } : e === "end" ? { bottom: n } : e === "start" ? { top: n } : {};
}
function Jc(e, t, n, o, r) {
  return e === "center" || o === "center" ? { left: t } : e === "end" ? { [r === "ltr" ? "right" : "left"]: n } : e === "start" ? { [r === "ltr" ? "left" : "right"]: n } : {};
}
const yg = {
  bottom: "borderTopLeftRadius",
  left: "borderTopRightRadius",
  right: "borderBottomLeftRadius",
  top: "borderBottomRightRadius"
};
function bg({ position: e, arrowSize: t, dir: n }) {
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
function wg({ position: e, arrowSize: t, arrowOffset: n, arrowRadius: o, arrowPosition: r, arrowX: s, arrowY: a, dir: i }) {
  if (r === "merge") {
    const d = bg({
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
    [yg[l]]: o
  }, h = -t / 2;
  return l === "left" ? {
    ...f,
    ...Gc(u, a, n, r),
    right: h,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    clipPath: "polygon(100% 0, 0 0, 100% 100%)"
  } : l === "right" ? {
    ...f,
    ...Gc(u, a, n, r),
    left: h,
    borderRightColor: "transparent",
    borderTopColor: "transparent",
    clipPath: "polygon(0 100%, 0 0, 100% 100%)"
  } : l === "top" ? {
    ...f,
    ...Jc(u, s, n, r, i),
    bottom: h,
    borderTopColor: "transparent",
    borderLeftColor: "transparent",
    clipPath: "polygon(0 100%, 100% 100%, 100% 0)"
  } : l === "bottom" ? {
    ...f,
    ...Jc(u, s, n, r, i),
    top: h,
    borderBottomColor: "transparent",
    borderRightColor: "transparent",
    clipPath: "polygon(0 100%, 0 0, 100% 0)"
  } : {};
}
function xg({ position: e, dir: t }) {
  const [n, o] = e.split("-");
  if (!o) return;
  const r = o === "start" && t === "ltr" || o === "end" && t === "rtl";
  if (n === "bottom") return r ? { borderTopLeftRadius: 0 } : { borderTopRightRadius: 0 };
  if (n === "top") return r ? { borderBottomLeftRadius: 0 } : { borderBottomRightRadius: 0 };
  if (n === "left") return o === "start" ? { borderTopRightRadius: 0 } : { borderBottomRightRadius: 0 };
  if (n === "right") return o === "start" ? { borderTopLeftRadius: 0 } : { borderBottomLeftRadius: 0 };
}
function Gu({ position: e, arrowSize: t, arrowOffset: n, arrowRadius: o, arrowPosition: r, visible: s, arrowX: a, arrowY: i, style: l, ...u }) {
  const { dir: f } = ko();
  return s ? /* @__PURE__ */ c.jsx("div", {
    role: "presentation",
    ...u,
    style: {
      ...l,
      ...wg({
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
Gu.displayName = "@mantine/core/FloatingArrow";
function Sg(e, t) {
  if (e === "rtl" && (t.includes("right") || t.includes("left"))) {
    const [n, o] = t.split("-"), r = n === "right" ? "left" : "right";
    return o === void 0 ? r : `${r}-${o}`;
  }
  return t;
}
const [Cg, bi] = Jt("Popover component was not found in the tree");
function jg({ childProps: e, disabled: t, opened: n, longPressDelay: o = 500, setReference: r, open: s }) {
  const a = p.useRef(!1), i = p.useRef(!1), l = p.useRef(null), u = p.useRef(t);
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
  }, h = Zn(e.onMouseDown, (g) => {
    t || g.button === 2 && g.stopPropagation();
  }), d = Zn(e.onContextMenu, (g) => {
    t || g.defaultPrevented || (g.preventDefault(), !i.current && (f(g.clientX, g.clientY, g.currentTarget), a.current && (i.current = !0)));
  }), m = Th((g) => {
    if (u.current || i.current) return;
    const v = g, x = v.touches[0] ?? v.changedTouches[0];
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
    onTouchStart: Zn(e.onTouchStart, m.onTouchStart),
    onTouchEnd: Zn(e.onTouchEnd, m.onTouchEnd),
    onTouchCancel: Zn(e.onTouchCancel, m.onTouchCancel),
    onTouchMove: Zn(e.onTouchMove, m.onTouchMove),
    style: t ? e.style : {
      ...e.style,
      WebkitTouchCallout: "none",
      WebkitUserSelect: "none",
      userSelect: "none"
    },
    "data-expanded": n ? !0 : void 0
  };
}
function Ju(e) {
  const { children: t, disabled: n, longPressDelay: o } = Z("PopoverContextMenu", null, e), r = dr(t);
  if (!r) throw new Error("Popover.ContextMenu component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  const s = bi(), a = jg({
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
Ju.displayName = "@mantine/core/PopoverContextMenu";
function bs({ children: e, active: t = !0, refProp: n = "ref", innerRef: o }) {
  const r = mh(t), s = Ve(r, o), a = dr(e);
  return a ? p.cloneElement(a, { [n]: s }) : e;
}
function Zu(e) {
  return /* @__PURE__ */ c.jsx(yi, {
    tabIndex: -1,
    "data-autofocus": !0,
    ...e
  });
}
bs.displayName = "@mantine/core/FocusTrap";
Zu.displayName = "@mantine/core/FocusTrapInitialFocus";
bs.InitialFocus = Zu;
var Qu = {
  dropdown: "m_38a85659",
  arrow: "m_a31dc6c1",
  overlay: "m_3d7bc908"
};
const wi = ce((e) => {
  const t = Z("PopoverDropdown", null, e), { className: n, style: o, vars: r, children: s, onKeyDownCapture: a, variant: i, classNames: l, styles: u, ref: f, ...h } = t, d = bi(), { dir: m } = ko(), g = d.arrowPosition === "merge" && d.withArrow ? xg({
    position: d.placement,
    dir: m
  }) : void 0, v = hu({
    opened: d.opened,
    shouldReturnFocus: d.returnFocus
  }), x = d.withRoles ? {
    "aria-labelledby": d.getTargetId(),
    id: d.getDropdownId(),
    role: "dialog",
    tabIndex: -1
  } : {}, b = Ve(f, d.floating);
  return d.disabled ? null : /* @__PURE__ */ c.jsx(oi, {
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
      children: (E) => /* @__PURE__ */ c.jsx(bs, {
        active: d.trapFocus && d.opened,
        innerRef: b,
        children: /* @__PURE__ */ c.jsxs(Q, {
          ...x,
          ...h,
          variant: i,
          onKeyDownCapture: ah(() => {
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
            classNames: l,
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
          children: [s, /* @__PURE__ */ c.jsx(Gu, {
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
wi.classes = Qu;
wi.displayName = "@mantine/core/PopoverDropdown";
const kg = {
  refProp: "ref",
  popupType: "dialog"
}, ed = ce((e) => {
  const { children: t, refProp: n, popupType: o, ref: r, ...s } = Z("PopoverTarget", kg, e), a = dr(t);
  if (!a) throw new Error("Popover.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  const i = s, l = bi(), u = Ve(l.reference, Su(a), r), f = l.withRoles ? {
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
ed.displayName = "@mantine/core/PopoverTarget";
function Eg(e) {
  if (e === void 0) return {
    shift: !0,
    flip: !0
  };
  const t = { ...e };
  return e.shift === void 0 && (t.shift = !0), e.flip === void 0 && (t.flip = !0), t;
}
function Rg(e, t, n, o) {
  const r = Eg(e.middlewares), s = [Qm(e.offset), rg()];
  if (r.flip && !n) {
    const a = typeof r.flip == "boolean" ? {} : r.flip, i = o ? {
      fallbackStrategy: "initialPlacement",
      ...a
    } : a;
    s.push(ng(i));
  }
  if (r.shift) {
    const a = typeof r.shift == "boolean" ? {} : r.shift;
    s.push(eg((i) => {
      const l = i.placement.startsWith("top") || i.placement.startsWith("bottom");
      return {
        limiter: tg(),
        padding: 5,
        ...e.width === "target" && l ? { mainAxis: !1 } : null,
        ...a
      };
    }));
  }
  return r.inline && s.push(typeof r.inline == "boolean" ? Kc() : Kc(r.inline)), s.push(sg({
    element: e.arrowRef,
    padding: e.arrowOffset
  })), (r.size || e.width === "target") && s.push(og({
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
function Ng(e) {
  const [t, n] = Qe({
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
  }, m = vg({
    open: t,
    strategy: e.strategy,
    placement: i ? s ?? e.position : e.position,
    middleware: Rg(e, () => m, i && s !== null, i),
    whileElementsMounted: e.keepMounted ? void 0 : Uc
  });
  p.useEffect(() => {
    if (!e.keepMounted) return;
    const v = m.refs.reference.current, x = m.refs.floating.current;
    if (t && v && x) return Uc(v, x, m.update);
  }, [
    e.keepMounted,
    t,
    m.update,
    m.elements.reference,
    m.elements.floating
  ]), Ko(() => {
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
  return Ko(() => {
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
const Tg = {
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
}, td = ze((e, { radius: t, shadow: n }) => ({ dropdown: {
  "--popover-radius": t === void 0 ? void 0 : Tt(t),
  "--popover-shadow": ou(n)
} }));
function He(e) {
  const t = Z("Popover", Tg, e), { children: n, position: o, offset: r, onPositionChange: s, opened: a, transitionProps: i, onExitTransitionEnd: l, onEnterTransitionEnd: u, width: f, middlewares: h, withArrow: d, arrowSize: m, arrowOffset: g, arrowRadius: v, arrowPosition: x, unstyled: b, classNames: E, styles: S, closeOnClickOutside: k, withinPortal: R, portalProps: T, closeOnEscape: C, clickOutsideEvents: w, trapFocus: A, onClose: $, onDismiss: z, onOpen: V, onChange: B, zIndex: M, radius: O, shadow: D, id: L, defaultOpened: I, __staticSelector: P, withRoles: F, disabled: _, returnFocus: U, variant: X, keepMounted: ne, keepMountedMode: de, vars: oe, floatingStrategy: te, withOverlay: fe, overlayProps: K, hideDetached: q, attributes: ae, preventPositionChangeWhenVisible: be, ...he } = t, ke = De({
    name: P,
    props: t,
    classes: Qu,
    classNames: E,
    styles: S,
    unstyled: b,
    attributes: ae,
    rootSelector: "dropdown",
    vars: oe,
    varsResolver: td
  }), { resolvedStyles: re } = ur({
    classNames: E,
    styles: S,
    props: t
  }), W = p.useRef(null), [H, Y] = p.useState(null), [ue, Ee] = p.useState(null), { dir: Ie } = ko(), ge = ei(), ve = Vt(L), Se = Ng({
    middlewares: h,
    width: f,
    position: Sg(Ie, o),
    offset: typeof r == "number" ? r + (d ? m / 2 : 0) : r,
    arrowRef: W,
    arrowOffset: g,
    onPositionChange: s,
    opened: a,
    defaultOpened: I,
    onChange: B,
    onOpen: V,
    onClose: $,
    onDismiss: z,
    strategy: te,
    disabled: _,
    preventPositionChangeWhenVisible: be,
    keepMounted: ne
  });
  pu(() => {
    k && (Se.onClose(), z?.());
  }, w, [H, ue]);
  const Oe = p.useCallback((yt) => {
    Y(yt), Se.floating.refs.setReference(yt);
  }, [Se.floating.refs.setReference]), pe = p.useCallback((yt) => {
    Ee(yt), Se.floating.refs.setFloating(yt);
  }, [Se.floating.refs.setFloating]), vt = p.useCallback(() => {
    i?.onExited?.(), l?.(), Se.resetLockedPlacement();
  }, [
    i?.onExited,
    l,
    Se.resetLockedPlacement
  ]), Te = p.useCallback(() => {
    i?.onEntered?.(), u?.();
  }, [i?.onEntered, u]);
  return /* @__PURE__ */ c.jsxs(Cg, {
    value: {
      returnFocus: U,
      disabled: _,
      controlled: Se.controlled,
      reference: Oe,
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
      arrowRadius: v,
      arrowPosition: x,
      placement: Se.floating.placement,
      trapFocus: A,
      withinPortal: R,
      portalProps: T,
      zIndex: M,
      radius: O,
      shadow: D,
      closeOnEscape: C,
      onDismiss: z,
      onClose: Se.onClose,
      onToggle: Se.onToggle,
      getTargetId: () => ve,
      getDropdownId: () => `${ve}-dropdown`,
      withRoles: F,
      targetProps: he,
      __staticSelector: P,
      classNames: E,
      styles: S,
      unstyled: b,
      variant: X,
      keepMounted: ne,
      keepMountedMode: de,
      getStyles: ke,
      resolvedStyles: re,
      floatingStrategy: te,
      referenceHidden: q && ge !== "test" ? Se.floating.middlewareData.hide?.referenceHidden : !1
    },
    children: [n, fe && /* @__PURE__ */ c.jsx(cs, {
      transition: "fade",
      mounted: Se.opened,
      duration: i?.duration || 250,
      exitDuration: i?.exitDuration || 250,
      children: (yt) => /* @__PURE__ */ c.jsx(oi, {
        withinPortal: R,
        children: /* @__PURE__ */ c.jsx(cu, {
          ...K,
          ...ke("overlay", {
            className: K?.className,
            style: [yt, K?.style]
          })
        })
      })
    })]
  });
}
He.Target = ed;
He.Dropdown = wi;
He.ContextMenu = Ju;
He.varsResolver = td;
He.displayName = "@mantine/core/Popover";
He.extend = (e) => e;
He.withProps = (e) => {
  const t = (n) => /* @__PURE__ */ c.jsx(He, {
    ...e,
    ...n
  });
  return t.extend = He.extend, t.displayName = `WithProps(${He.displayName})`, t;
};
const [Pg, cn] = Jt("ModalBase component was not found in tree");
function Ag({ opened: e, transitionDuration: t }) {
  const [n, o] = p.useState(e), r = p.useRef(-1), s = ti() ? 0 : t;
  return p.useEffect(() => (e ? (o(!0), window.clearTimeout(r.current)) : s === 0 ? o(!1) : r.current = window.setTimeout(() => o(!1), s), () => window.clearTimeout(r.current)), [e, s]), n;
}
function Ig({ id: e, transitionProps: t, opened: n, trapFocus: o, closeOnEscape: r, onClose: s, returnFocus: a, handledEscapeEvents: i }) {
  const l = Vt(e), [u, f] = p.useState(!1), [h, d] = p.useState(!1), m = typeof t?.duration == "number" ? t?.duration : 200, g = Ag({
    opened: n,
    transitionDuration: m
  });
  return yh("keydown", (v) => {
    v.key === "Escape" && r && !v.isComposing && n && !i?.has(v) && v.target?.getAttribute("data-mantine-stop-propagation") !== "true" && (i?.add(v), s());
  }, { capture: !0 }), hu({
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
function nd(e, t) {
  var n = {};
  for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var r = 0, o = Object.getOwnPropertySymbols(e); r < o.length; r++)
      t.indexOf(o[r]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[r]) && (n[o[r]] = e[o[r]]);
  return n;
}
function Mg(e, t, n) {
  if (n || arguments.length === 2) for (var o = 0, r = t.length, s; o < r; o++)
    (s || !(o in t)) && (s || (s = Array.prototype.slice.call(t, 0, o)), s[o] = t[o]);
  return e.concat(s || Array.prototype.slice.call(t));
}
var Lr = "right-scroll-bar-position", zr = "width-before-scroll-bar", Dg = "with-scroll-bars-hidden", Og = "--removed-body-scroll-bar-size";
function ta(e, t) {
  return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
function $g(e, t) {
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
var Lg = typeof window < "u" ? p.useLayoutEffect : p.useEffect, Zc = /* @__PURE__ */ new WeakMap();
function zg(e, t) {
  var n = $g(null, function(o) {
    return e.forEach(function(r) {
      return ta(r, o);
    });
  });
  return Lg(function() {
    var o = Zc.get(n);
    if (o) {
      var r = new Set(o), s = new Set(e), a = n.current;
      r.forEach(function(i) {
        s.has(i) || ta(i, null);
      }), s.forEach(function(i) {
        r.has(i) || ta(i, a);
      });
    }
    Zc.set(n, e);
  }, [e]), n;
}
function _g(e) {
  return e;
}
function Fg(e, t) {
  t === void 0 && (t = _g);
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
function Bg(e) {
  e === void 0 && (e = {});
  var t = Fg(null);
  return t.options = Wt({ async: !0, ssr: !1 }, e), t;
}
var od = function(e) {
  var t = e.sideCar, n = nd(e, ["sideCar"]);
  if (!t)
    throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  var o = t.read();
  if (!o)
    throw new Error("Sidecar medium not found");
  return p.createElement(o, Wt({}, n));
};
od.isSideCarExport = !0;
function Vg(e, t) {
  return e.useMedium(t), od;
}
var rd = Bg(), na = function() {
}, ws = p.forwardRef(function(e, t) {
  var n = p.useRef(null), o = p.useState({
    onScrollCapture: na,
    onWheelCapture: na,
    onTouchMoveCapture: na
  }), r = o[0], s = o[1], a = e.forwardProps, i = e.children, l = e.className, u = e.removeScrollBar, f = e.enabled, h = e.shards, d = e.sideCar, m = e.noRelative, g = e.noIsolation, v = e.inert, x = e.allowPinchZoom, b = e.as, E = b === void 0 ? "div" : b, S = e.gapMode, k = nd(e, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]), R = d, T = zg([n, t]), C = Wt(Wt({}, k), r);
  return p.createElement(
    p.Fragment,
    null,
    f && p.createElement(R, { sideCar: rd, removeScrollBar: u, shards: h, noRelative: m, noIsolation: g, inert: v, setCallbacks: s, allowPinchZoom: !!x, lockRef: n, gapMode: S }),
    a ? p.cloneElement(p.Children.only(i), Wt(Wt({}, C), { ref: T })) : p.createElement(E, Wt({}, C, { className: l, ref: T }), i)
  );
});
ws.defaultProps = {
  enabled: !0,
  removeScrollBar: !0,
  inert: !1
};
ws.classNames = {
  fullWidth: zr,
  zeroRight: Lr
};
var Hg = function() {
  if (typeof __webpack_nonce__ < "u")
    return __webpack_nonce__;
};
function Ug() {
  if (!document)
    return null;
  var e = document.createElement("style");
  e.type = "text/css";
  var t = Hg();
  return t && e.setAttribute("nonce", t), e;
}
function Wg(e, t) {
  e.styleSheet ? e.styleSheet.cssText = t : e.appendChild(document.createTextNode(t));
}
function qg(e) {
  var t = document.head || document.getElementsByTagName("head")[0];
  t.appendChild(e);
}
var Kg = function() {
  var e = 0, t = null;
  return {
    add: function(n) {
      e == 0 && (t = Ug()) && (Wg(t, n), qg(t)), e++;
    },
    remove: function() {
      e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), t = null);
    }
  };
}, Xg = function() {
  var e = Kg();
  return function(t, n) {
    p.useEffect(function() {
      return e.add(t), function() {
        e.remove();
      };
    }, [t && n]);
  };
}, sd = function() {
  var e = Xg(), t = function(n) {
    var o = n.styles, r = n.dynamic;
    return e(o, r), null;
  };
  return t;
}, Yg = {
  left: 0,
  top: 0,
  right: 0,
  gap: 0
}, oa = function(e) {
  return parseInt(e || "", 10) || 0;
}, Gg = function(e) {
  var t = window.getComputedStyle(document.body), n = t[e === "padding" ? "paddingLeft" : "marginLeft"], o = t[e === "padding" ? "paddingTop" : "marginTop"], r = t[e === "padding" ? "paddingRight" : "marginRight"];
  return [oa(n), oa(o), oa(r)];
}, Jg = function(e) {
  if (e === void 0 && (e = "margin"), typeof window > "u")
    return Yg;
  var t = Gg(e), n = document.documentElement.clientWidth, o = window.innerWidth;
  return {
    left: t[0],
    top: t[1],
    right: t[2],
    gap: Math.max(0, o - n + t[2] - t[0])
  };
}, Zg = sd(), co = "data-scroll-locked", Qg = function(e, t, n, o) {
  var r = e.left, s = e.top, a = e.right, i = e.gap;
  return n === void 0 && (n = "margin"), `
  .`.concat(Dg, ` {
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
  
  body[`).concat(co, `] {
    `).concat(Og, ": ").concat(i, `px;
  }
`);
}, Qc = function() {
  var e = parseInt(document.body.getAttribute(co) || "0", 10);
  return isFinite(e) ? e : 0;
}, ev = function() {
  p.useEffect(function() {
    return document.body.setAttribute(co, (Qc() + 1).toString()), function() {
      var e = Qc() - 1;
      e <= 0 ? document.body.removeAttribute(co) : document.body.setAttribute(co, e.toString());
    };
  }, []);
}, tv = function(e) {
  var t = e.noRelative, n = e.noImportant, o = e.gapMode, r = o === void 0 ? "margin" : o;
  ev();
  var s = p.useMemo(function() {
    return Jg(r);
  }, [r]);
  return p.createElement(Zg, { styles: Qg(s, !t, r, n ? "" : "!important") });
}, Pa = !1;
if (typeof window < "u")
  try {
    var Ar = Object.defineProperty({}, "passive", {
      get: function() {
        return Pa = !0, !0;
      }
    });
    window.addEventListener("test", Ar, Ar), window.removeEventListener("test", Ar, Ar);
  } catch {
    Pa = !1;
  }
var Qn = Pa ? { passive: !1 } : !1, nv = function(e) {
  return e.tagName === "TEXTAREA";
}, ad = function(e, t) {
  if (!(e instanceof Element))
    return !1;
  var n = window.getComputedStyle(e);
  return (
    // not-not-scrollable
    n[t] !== "hidden" && // contains scroll inside self
    !(n.overflowY === n.overflowX && !nv(e) && n[t] === "visible")
  );
}, ov = function(e) {
  return ad(e, "overflowY");
}, rv = function(e) {
  return ad(e, "overflowX");
}, el = function(e, t) {
  var n = t.ownerDocument, o = t;
  do {
    typeof ShadowRoot < "u" && o instanceof ShadowRoot && (o = o.host);
    var r = id(e, o);
    if (r) {
      var s = cd(e, o), a = s[1], i = s[2];
      if (a > i)
        return !0;
    }
    o = o.parentNode;
  } while (o && o !== n.body);
  return !1;
}, sv = function(e) {
  var t = e.scrollTop, n = e.scrollHeight, o = e.clientHeight;
  return [
    t,
    n,
    o
  ];
}, av = function(e) {
  var t = e.scrollLeft, n = e.scrollWidth, o = e.clientWidth;
  return [
    t,
    n,
    o
  ];
}, id = function(e, t) {
  return e === "v" ? ov(t) : rv(t);
}, cd = function(e, t) {
  return e === "v" ? sv(t) : av(t);
}, iv = function(e, t) {
  return e === "h" && t === "rtl" ? -1 : 1;
}, cv = function(e, t, n, o, r) {
  var s = iv(e, window.getComputedStyle(t).direction), a = s * o, i = n.target, l = t.contains(i), u = !1, f = a > 0, h = 0, d = 0;
  do {
    if (!i)
      break;
    var m = cd(e, i), g = m[0], v = m[1], x = m[2], b = v - x - s * g;
    (g || b) && id(e, i) && (h += b, d += g);
    var E = i.parentNode;
    i = E && E.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? E.host : E;
  } while (
    // portaled content
    !l && i !== document.body || // self content
    l && (t.contains(i) || t === i)
  );
  return (f && Math.abs(h) < 1 || !f && Math.abs(d) < 1) && (u = !0), u;
}, Ir = function(e) {
  return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, tl = function(e) {
  return [e.deltaX, e.deltaY];
}, nl = function(e) {
  return e && "current" in e ? e.current : e;
}, lv = function(e, t) {
  return e[0] === t[0] && e[1] === t[1];
}, uv = function(e) {
  return `
  .block-interactivity-`.concat(e, ` {pointer-events: none;}
  .allow-interactivity-`).concat(e, ` {pointer-events: all;}
`);
}, dv = 0, eo = [];
function fv(e) {
  var t = p.useRef([]), n = p.useRef([0, 0]), o = p.useRef(), r = p.useState(dv++)[0], s = p.useState(sd)[0], a = p.useRef(e);
  p.useEffect(function() {
    a.current = e;
  }, [e]), p.useEffect(function() {
    if (e.inert) {
      document.body.classList.add("block-interactivity-".concat(r));
      var v = Mg([e.lockRef.current], (e.shards || []).map(nl), !0).filter(Boolean);
      return v.forEach(function(x) {
        return x.classList.add("allow-interactivity-".concat(r));
      }), function() {
        document.body.classList.remove("block-interactivity-".concat(r)), v.forEach(function(x) {
          return x.classList.remove("allow-interactivity-".concat(r));
        });
      };
    }
  }, [e.inert, e.lockRef.current, e.shards]);
  var i = p.useCallback(function(v, x) {
    if ("touches" in v && v.touches.length === 2 || v.type === "wheel" && v.ctrlKey)
      return !a.current.allowPinchZoom;
    var b = Ir(v), E = n.current, S = "deltaX" in v ? v.deltaX : E[0] - b[0], k = "deltaY" in v ? v.deltaY : E[1] - b[1], R, T = v.target, C = Math.abs(S) > Math.abs(k) ? "h" : "v";
    if ("touches" in v && C === "h" && T.type === "range")
      return !1;
    var w = window.getSelection(), A = w && w.anchorNode, $ = A ? A === T || A.contains(T) : !1;
    if ($)
      return !1;
    var z = el(C, T);
    if (!z)
      return !0;
    if (z ? R = C : (R = C === "v" ? "h" : "v", z = el(C, T)), !z)
      return !1;
    if (!o.current && "changedTouches" in v && (S || k) && (o.current = R), !R)
      return !0;
    var V = o.current || R;
    return cv(V, x, v, V === "h" ? S : k);
  }, []), l = p.useCallback(function(v) {
    var x = v;
    if (!(!eo.length || eo[eo.length - 1] !== s)) {
      var b = "deltaY" in x ? tl(x) : Ir(x), E = t.current.filter(function(R) {
        return R.name === x.type && (R.target === x.target || x.target === R.shadowParent) && lv(R.delta, b);
      })[0];
      if (E && E.should) {
        x.cancelable && x.preventDefault();
        return;
      }
      if (!E) {
        var S = (a.current.shards || []).map(nl).filter(Boolean).filter(function(R) {
          return R.contains(x.target);
        }), k = S.length > 0 ? i(x, S[0]) : !a.current.noIsolation;
        k && x.cancelable && x.preventDefault();
      }
    }
  }, []), u = p.useCallback(function(v, x, b, E) {
    var S = { name: v, delta: x, target: b, should: E, shadowParent: pv(b) };
    t.current.push(S), setTimeout(function() {
      t.current = t.current.filter(function(k) {
        return k !== S;
      });
    }, 1);
  }, []), f = p.useCallback(function(v) {
    n.current = Ir(v), o.current = void 0;
  }, []), h = p.useCallback(function(v) {
    u(v.type, tl(v), v.target, i(v, e.lockRef.current));
  }, []), d = p.useCallback(function(v) {
    u(v.type, Ir(v), v.target, i(v, e.lockRef.current));
  }, []);
  p.useEffect(function() {
    return eo.push(s), e.setCallbacks({
      onScrollCapture: h,
      onWheelCapture: h,
      onTouchMoveCapture: d
    }), document.addEventListener("wheel", l, Qn), document.addEventListener("touchmove", l, Qn), document.addEventListener("touchstart", f, Qn), function() {
      eo = eo.filter(function(v) {
        return v !== s;
      }), document.removeEventListener("wheel", l, Qn), document.removeEventListener("touchmove", l, Qn), document.removeEventListener("touchstart", f, Qn);
    };
  }, []);
  var m = e.removeScrollBar, g = e.inert;
  return p.createElement(
    p.Fragment,
    null,
    g ? p.createElement(s, { styles: uv(r) }) : null,
    m ? p.createElement(tv, { noRelative: e.noRelative, gapMode: e.gapMode }) : null
  );
}
function pv(e) {
  for (var t = null; e !== null; )
    e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
  return t;
}
const hv = Vg(rd, fv);
var ld = p.forwardRef(function(e, t) {
  return p.createElement(ws, Wt({}, e, { ref: t, sideCar: hv }));
});
ld.classNames = ws.classNames;
function ud({ keepMounted: e, keepMountedMode: t = "activity", opened: n, onClose: o, id: r, transitionProps: s, onExitTransitionEnd: a, onEnterTransitionEnd: i, trapFocus: l, closeOnEscape: u, returnFocus: f, closeOnClickOutside: h, withinPortal: d, portalProps: m, lockScroll: g, children: v, zIndex: x, shadow: b, padding: E, __vars: S, unstyled: k, removeScrollProps: R, __handledEscapeEvents: T, ...C }) {
  const { _id: w, titleMounted: A, bodyMounted: $, shouldLockScroll: z, setTitleMounted: V, setBodyMounted: B } = Ig({
    id: r,
    transitionProps: s,
    opened: n,
    trapFocus: l,
    closeOnEscape: u,
    onClose: o,
    returnFocus: f,
    handledEscapeEvents: T
  }), { key: M, ...O } = R || {};
  return /* @__PURE__ */ c.jsx(oi, {
    ...m,
    withinPortal: d,
    children: /* @__PURE__ */ c.jsx(Pg, {
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
        getTitleId: () => `${w}-title`,
        getBodyId: () => `${w}-body`,
        titleMounted: A,
        bodyMounted: $,
        setTitleMounted: V,
        setBodyMounted: B,
        trapFocus: l,
        closeOnEscape: u,
        zIndex: x,
        unstyled: k
      },
      children: /* @__PURE__ */ c.jsx(ld, {
        enabled: z && g,
        ...O,
        children: /* @__PURE__ */ c.jsx(Q, {
          ...C,
          id: w,
          __vars: {
            ...S,
            "--mb-z-index": (x || jo("modal")).toString(),
            "--mb-shadow": ou(b),
            "--mb-padding": Xo(E)
          },
          children: v
        })
      }, M)
    })
  });
}
ud.displayName = "@mantine/core/ModalBase";
function mv() {
  const e = cn();
  return p.useEffect(() => (e.setBodyMounted(!0), () => e.setBodyMounted(!1)), []), e.getBodyId();
}
var ho = {
  title: "m_615af6c9",
  header: "m_b5489c3c",
  inner: "m_60c222c7",
  content: "m_fd1ab0aa",
  close: "m_606cb269",
  body: "m_5df29311"
};
function dd({ className: e, ...t }) {
  const n = mv(), o = cn();
  return /* @__PURE__ */ c.jsx(Q, {
    id: n,
    className: rn({ [ho.body]: !o.unstyled }, e),
    ...t
  });
}
dd.displayName = "@mantine/core/ModalBaseBody";
function fd({ className: e, onClick: t, ...n }) {
  const o = cn();
  return /* @__PURE__ */ c.jsx(ai, {
    ...n,
    onClick: (r) => {
      o.onClose(), t?.(r);
    },
    className: rn({ [ho.close]: !o.unstyled }, e),
    unstyled: o.unstyled
  });
}
fd.displayName = "@mantine/core/ModalBaseCloseButton";
function pd({ transitionProps: e, className: t, innerProps: n, onKeyDown: o, style: r, ref: s, ...a }) {
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
      className: rn({ [ho.inner]: !i.unstyled }, n.className),
      children: /* @__PURE__ */ c.jsx(bs, {
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
          className: rn({ [ho.content]: !i.unstyled }, t),
          unstyled: i.unstyled,
          children: a.children
        })
      })
    })
  });
}
pd.displayName = "@mantine/core/ModalBaseContent";
function hd({ className: e, ...t }) {
  const n = cn();
  return /* @__PURE__ */ c.jsx(Q, {
    component: "header",
    className: rn({ [ho.header]: !n.unstyled }, e),
    ...t
  });
}
hd.displayName = "@mantine/core/ModalBaseHeader";
const gv = {
  duration: 200,
  timingFunction: "ease",
  transition: "fade"
};
function vv(e) {
  const t = cn();
  return {
    ...gv,
    ...t.transitionProps,
    ...e
  };
}
function md({ onClick: e, transitionProps: t, style: n, visible: o, ...r }) {
  const s = cn(), a = vv(t);
  return /* @__PURE__ */ c.jsx(cs, {
    mounted: o !== void 0 ? o : s.opened,
    ...a,
    transition: "fade",
    children: (i) => /* @__PURE__ */ c.jsx(cu, {
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
md.displayName = "@mantine/core/ModalBaseOverlay";
function yv() {
  const e = cn();
  return p.useEffect(() => (e.setTitleMounted(!0), () => e.setTitleMounted(!1)), []), e.getTitleId();
}
function gd({ className: e, ...t }) {
  const n = yv(), o = cn();
  return /* @__PURE__ */ c.jsx(Q, {
    component: "h2",
    className: rn({ [ho.title]: !o.unstyled }, e),
    id: n,
    ...t
  });
}
gd.displayName = "@mantine/core/ModalBaseTitle";
function bv({ children: e }) {
  return /* @__PURE__ */ c.jsx(c.Fragment, { children: e });
}
const wv = {
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
var vd = { root: "m_8bffd616" };
const lo = ru((e) => {
  const t = Z("Flex", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, gap: l, rowGap: u, columnGap: f, align: h, justify: d, wrap: m, direction: g, attributes: v, ...x } = t, b = De({
    name: "Flex",
    classes: vd,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: v,
    vars: i
  }), E = lr(), S = _p(), k = Fp({
    styleProps: {
      gap: l,
      rowGap: u,
      columnGap: f,
      align: h,
      justify: d,
      wrap: m,
      direction: g
    },
    theme: E,
    data: wv
  }), R = Bp(), T = R && k.hasResponsiveStyles ? Vp(k.styles, k.media) : S;
  return /* @__PURE__ */ c.jsxs(c.Fragment, { children: [k.hasResponsiveStyles && /* @__PURE__ */ c.jsx(Hp, {
    selector: `.${T}`,
    styles: k.styles,
    media: k.media,
    deduplicate: R
  }), /* @__PURE__ */ c.jsx(Q, {
    ...b("root", {
      className: T,
      style: Up(k.inlineStyles)
    }),
    ...x
  })] });
});
lo.classes = vd;
lo.displayName = "@mantine/core/Flex";
function xv(e, t) {
  if (!t || !e) return !1;
  let n = t.parentNode;
  for (; n != null; ) {
    if (n === e) return !0;
    n = n.parentNode;
  }
  return !1;
}
function Sv({ target: e, parent: t, ref: n, displayAfterTransitionEnd: o, onTransitionStart: r, onTransitionEnd: s }) {
  const a = p.useRef(-1), i = p.useRef(e), [l, u] = p.useState(!1), [f, h] = p.useState(typeof o == "boolean" ? o : !1), d = () => {
    if (!e || !t || !n.current) return;
    const x = e.getBoundingClientRect(), b = t.getBoundingClientRect(), E = t.offsetWidth === 0 ? 1 : b.width / t.offsetWidth, S = t.offsetHeight === 0 ? 1 : b.height / t.offsetHeight, k = window.getComputedStyle(e), R = window.getComputedStyle(t), T = gn(k.borderTopWidth) + gn(R.borderTopWidth), C = gn(k.borderLeftWidth) + gn(R.borderLeftWidth), w = {
      top: (x.top - b.top) / S - T,
      left: (x.left - b.left) / E - C,
      width: x.width / E,
      height: x.height / S
    };
    n.current.style.transform = `translateY(${w.top}px) translateX(${w.left}px)`, n.current.style.width = `${w.width}px`, n.current.style.height = `${w.height}px`;
  }, m = () => {
    window.clearTimeout(a.current), n.current && (n.current.style.transitionDuration = "0ms"), d(), a.current = window.setTimeout(() => {
      n.current && (n.current.style.transitionDuration = "");
    }, 30);
  }, g = p.useRef(null), v = p.useRef(null);
  return p.useEffect(() => {
    if (l && i.current !== e && r && r(), i.current = e, d(), e)
      return g.current = new ResizeObserver(m), g.current.observe(e), t && (v.current = new ResizeObserver(m), v.current.observe(t)), () => {
        g.current?.disconnect(), v.current?.disconnect();
      };
  }, [t, e]), p.useEffect(() => {
    if (t) {
      const x = (b) => {
        xv(b.target, t) && (m(), h(!1));
      };
      return t.addEventListener("transitionend", x), () => {
        t.removeEventListener("transitionend", x);
      };
    }
  }, [t]), p.useEffect(() => {
    if (n.current && s) {
      const x = (b) => {
        b.propertyName === "transform" && s();
      };
      return n.current.addEventListener("transitionend", x), () => {
        n.current?.removeEventListener("transitionend", x);
      };
    }
  }, [s]), xh(() => {
    wu() !== "test" && u(!0);
  }, 20, { autoInvoke: !0 }), kh((x) => {
    x.forEach((b) => {
      b.type === "attributes" && b.attributeName === "dir" && m();
    });
  }, {
    attributes: !0,
    attributeFilter: ["dir"]
  }, () => document.documentElement), {
    initialized: l,
    hidden: f
  };
}
var yd = { root: "m_96b553a6" };
const bd = ze((e, { transitionDuration: t }, { shouldReduceMotion: n }) => ({ root: { "--transition-duration": e.respectReducedMotion && n ? "0ms" : typeof t == "number" ? `${t}ms` : t || "150ms" } })), xs = ce((e) => {
  const t = Z("FloatingIndicator", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, target: l, parent: u, transitionDuration: f, mod: h, displayAfterTransitionEnd: d, onTransitionStart: m, onTransitionEnd: g, attributes: v, ref: x, ...b } = t, E = ti(), S = De({
    name: "FloatingIndicator",
    classes: yd,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: v,
    vars: i,
    varsResolver: bd,
    stylesCtx: { shouldReduceMotion: E }
  }), k = p.useRef(null), { initialized: R, hidden: T } = Sv({
    target: l,
    parent: u,
    ref: k,
    displayAfterTransitionEnd: d,
    onTransitionStart: m,
    onTransitionEnd: g
  }), C = Ve(x, k);
  return !l || !u ? null : /* @__PURE__ */ c.jsx(Q, {
    ref: C,
    mod: [{
      initialized: R,
      hidden: T
    }, h],
    ...S("root"),
    ...b
  });
});
xs.displayName = "@mantine/core/FloatingIndicator";
xs.classes = yd;
xs.varsResolver = bd;
const [Cv, xi] = Jt("Accordion component was not found in the tree");
function Si({ style: e, size: t = 16, ...n }) {
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
Si.displayName = "@mantine/core/AccordionChevron";
const [jv, wd] = Jt("Accordion.Item component was not found in the tree");
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
const Ci = ce((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, chevron: a, icon: i, onClick: l, onKeyDown: u, children: f, disabled: h, mod: d, ...m } = Z("AccordionControl", null, e), { value: g } = wd(), v = xi(), x = v.isItemActive(g), b = typeof v.order == "number", E = `h${v.order}`, S = /* @__PURE__ */ c.jsxs(zn, {
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
        disabled: h
      },
      d
    ],
    onClick: (k) => {
      l?.(k), v.onChange(g);
    },
    type: "button",
    disabled: h,
    "aria-expanded": x,
    "aria-controls": v.getRegionId(g),
    id: v.getControlId(g),
    onKeyDown: fu({
      siblingSelector: "[data-accordion-control]",
      parentSelector: "[data-accordion]",
      activateOnFocus: !1,
      loop: v.loop,
      orientation: "vertical",
      onKeyDown: u
    }),
    ...m,
    children: [
      /* @__PURE__ */ c.jsx(Q, {
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
      /* @__PURE__ */ c.jsx("span", {
        ...v.getStyles("label", {
          classNames: t,
          styles: r
        }),
        children: f
      }),
      i && /* @__PURE__ */ c.jsx(Q, {
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
  return b ? /* @__PURE__ */ c.jsx(E, {
    ...v.getStyles("itemTitle", {
      classNames: t,
      styles: r
    }),
    children: S
  }) : S;
});
Ci.displayName = "@mantine/core/AccordionControl";
Ci.classes = pr;
const ji = ce((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, value: a, mod: i, ...l } = Z("AccordionItem", null, e), u = xi();
  return /* @__PURE__ */ c.jsx(jv, {
    value: { value: a },
    children: /* @__PURE__ */ c.jsx(Q, {
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
ji.displayName = "@mantine/core/AccordionItem";
ji.classes = pr;
const ki = ce((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, children: a, keepMounted: i, keepMountedMode: l, ...u } = Z("AccordionPanel", null, e), { value: f } = wd(), h = xi();
  return /* @__PURE__ */ c.jsx(Cu, {
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
ki.displayName = "@mantine/core/AccordionPanel";
ki.classes = pr;
const kv = {
  multiple: !1,
  loop: !0,
  disableChevronRotation: !1,
  disableCollapse: !1,
  chevronPosition: "right",
  variant: "default",
  chevronSize: "auto",
  chevronIconSize: 16,
  keepMountedMode: "activity"
}, xd = ze((e, { transitionDuration: t, chevronSize: n, radius: o }) => ({ root: {
  "--accordion-transition-duration": t === void 0 ? void 0 : `${t}ms`,
  "--accordion-chevron-size": n === void 0 ? void 0 : Ae(n),
  "--accordion-radius": o === void 0 ? void 0 : Tt(o)
} })), Pe = En((e) => {
  const t = Z("Accordion", kv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, children: l, multiple: u, value: f, defaultValue: h, onChange: d, id: m, loop: g, transitionDuration: v, disableChevronRotation: x, disableCollapse: b, chevronPosition: E, chevronSize: S, order: k, chevron: R, variant: T, radius: C, chevronIconSize: w, attributes: A, keepMounted: $, keepMountedMode: z, ...V } = t, B = Vt(m), [M, O] = Qe({
    value: f,
    defaultValue: h,
    finalValue: u ? [] : null,
    onChange: d
  }), D = (P) => Array.isArray(M) ? M.includes(P) : P === M, L = (P) => {
    if (!Array.isArray(M) && b && P === M) return;
    const F = Array.isArray(M) ? M.includes(P) ? M.filter((_) => _ !== P) : [...M, P] : P === M ? null : P;
    O(F);
  }, I = De({
    name: "Accordion",
    classes: pr,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: A,
    vars: i,
    varsResolver: xd
  });
  return /* @__PURE__ */ c.jsx(Cv, {
    value: {
      isItemActive: D,
      onChange: L,
      getControlId: qr(`${B}-control`, "Accordion.Item component was rendered with invalid value or without value"),
      getRegionId: qr(`${B}-panel`, "Accordion.Item component was rendered with invalid value or without value"),
      chevron: R === null ? null : R || /* @__PURE__ */ c.jsx(Si, { size: w }),
      transitionDuration: v,
      disableChevronRotation: x,
      chevronPosition: E,
      order: k,
      loop: g,
      getStyles: I,
      variant: T,
      unstyled: a,
      keepMounted: $,
      keepMountedMode: z
    },
    children: /* @__PURE__ */ c.jsx(Q, {
      ...I("root"),
      id: B,
      ...V,
      variant: T,
      "data-accordion": !0,
      children: l
    })
  });
});
Pe.classes = pr;
Pe.varsResolver = xd;
Pe.displayName = "@mantine/core/Accordion";
Pe.Item = ji;
Pe.Panel = ki;
Pe.Control = Ci;
Pe.Chevron = Si;
function Sd(e) {
  return typeof e == "string" ? {
    value: e,
    label: e
  } : typeof e == "object" && "value" in e && !("label" in e) ? {
    value: e.value,
    label: `${e.value}`,
    disabled: e.disabled
  } : typeof e == "object" && "group" in e ? {
    group: e.group,
    items: e.items.map((t) => Sd(t))
  } : typeof e == "number" || typeof e == "bigint" || typeof e == "boolean" ? {
    value: e,
    label: `${e}`
  } : e;
}
function Cd(e) {
  return e ? e.map((t) => Sd(t)) : [];
}
function jd(e) {
  return e.reduce((t, n) => "group" in n ? {
    ...t,
    ...jd(n.items)
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
const Ev = { error: null }, kd = ze((e, { size: t, color: n }) => ({ chevron: {
  "--combobox-chevron-size": _e(t, "combobox-chevron-size"),
  "--combobox-chevron-color": n ? at(n, e) : void 0
} })), hr = ce((e) => {
  const t = Z("ComboboxChevron", Ev, e), { size: n, error: o, style: r, className: s, classNames: a, styles: i, unstyled: l, vars: u, attributes: f, mod: h, ...d } = t, m = De({
    name: "ComboboxChevron",
    classes: ut,
    props: t,
    style: r,
    className: s,
    classNames: a,
    styles: i,
    unstyled: l,
    vars: u,
    varsResolver: kd,
    attributes: f,
    rootSelector: "chevron"
  });
  return /* @__PURE__ */ c.jsx(Q, {
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
hr.classes = ut;
hr.varsResolver = kd;
hr.displayName = "@mantine/core/ComboboxChevron";
const [Rv, Ct] = Jt("Combobox component was not found in tree");
function Ed({ onMouseDown: e, onClick: t, onClear: n, ...o }) {
  return /* @__PURE__ */ c.jsx(Rt.ClearButton, {
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
Ed.displayName = "@mantine/core/ComboboxClearButton";
const Ei = ce((e) => {
  const { classNames: t, styles: n, className: o, style: r, hidden: s, ...a } = Z("ComboboxDropdown", null, e), i = Ct();
  return /* @__PURE__ */ c.jsx(He.Dropdown, {
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
Ei.classes = ut;
Ei.displayName = "@mantine/core/ComboboxDropdown";
const Nv = { refProp: "ref" }, Rd = ce((e) => {
  const { children: t, refProp: n, ref: o } = Z("ComboboxDropdownTarget", Nv, e);
  if (Ct(), !iu(t)) throw new Error("Combobox.DropdownTarget component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  return /* @__PURE__ */ c.jsx(He.Target, {
    ref: o,
    refProp: n,
    children: t
  });
});
Rd.displayName = "@mantine/core/ComboboxDropdownTarget";
const Ri = ce((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ComboboxEmpty", null, e), i = Ct();
  return /* @__PURE__ */ c.jsx(Q, {
    ...i.getStyles("empty", {
      className: n,
      classNames: t,
      styles: r,
      style: o
    }),
    ...a
  });
});
Ri.classes = ut;
Ri.displayName = "@mantine/core/ComboboxEmpty";
function Ni({ onKeyDown: e, onClick: t, withKeyboardNavigation: n, withAriaAttributes: o, withExpandedAttribute: r, targetType: s, autoComplete: a }) {
  const i = Ct(), [l, u] = p.useState(null), f = (m) => {
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
const Tv = {
  refProp: "ref",
  targetType: "input",
  withKeyboardNavigation: !0,
  withAriaAttributes: !0,
  withExpandedAttribute: !1,
  autoComplete: "off"
}, Nd = ce((e) => {
  const { children: t, refProp: n, withKeyboardNavigation: o, withAriaAttributes: r, withExpandedAttribute: s, targetType: a, autoComplete: i, ref: l, ...u } = Z("ComboboxEventsTarget", Tv, e), f = dr(t);
  if (!f) throw new Error("Combobox.EventsTarget component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  const h = Ct(), d = Ni({
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
    [n]: Ve(l, h.store.targetRef, Su(f))
  });
});
Nd.displayName = "@mantine/core/ComboboxEventsTarget";
const Ti = ce((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ComboboxFooter", null, e), i = Ct();
  return /* @__PURE__ */ c.jsx(Q, {
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
Ti.classes = ut;
Ti.displayName = "@mantine/core/ComboboxFooter";
const Pi = ce((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, children: a, label: i, id: l, ...u } = Z("ComboboxGroup", null, e), f = Ct(), h = Vt(l), d = i != null && i !== !1 && i !== "";
  return /* @__PURE__ */ c.jsxs(Q, {
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
Pi.classes = ut;
Pi.displayName = "@mantine/core/ComboboxGroup";
const Ai = ce((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ComboboxHeader", null, e), i = Ct();
  return /* @__PURE__ */ c.jsx(Q, {
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
Ai.classes = ut;
Ai.displayName = "@mantine/core/ComboboxHeader";
function Td({ value: e, valuesDivider: t = ",", ...n }) {
  return /* @__PURE__ */ c.jsx("input", {
    type: "hidden",
    value: Array.isArray(e) ? e.join(t) : e ? `${e}` : "",
    ...n
  });
}
Td.displayName = "@mantine/core/ComboboxHiddenInput";
const Ii = ce((e) => {
  const t = Z("ComboboxOption", null, e), { classNames: n, className: o, style: r, styles: s, vars: a, onClick: i, id: l, active: u, onMouseDown: f, onMouseOver: h, disabled: d, selected: m, mod: g, ...v } = t, x = Ct(), b = p.useId(), E = l || b;
  return /* @__PURE__ */ c.jsx(Q, {
    ...x.getStyles("option", {
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
Ii.classes = ut;
Ii.displayName = "@mantine/core/ComboboxOption";
const Mi = ce((e) => {
  const { classNames: t, className: n, style: o, styles: r, id: s, onMouseDown: a, labelledBy: i, ...l } = Z("ComboboxOptions", null, e), u = Ct(), f = Vt(s);
  return p.useEffect(() => {
    u.store.setListId(f);
  }, [f]), /* @__PURE__ */ c.jsx(Q, {
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
Mi.classes = ut;
Mi.displayName = "@mantine/core/ComboboxOptions";
const Pv = {
  withAriaAttributes: !0,
  withKeyboardNavigation: !0
}, Di = ce((e) => {
  const { classNames: t, styles: n, unstyled: o, vars: r, withAriaAttributes: s, onKeyDown: a, onClick: i, withKeyboardNavigation: l, size: u, ref: f, ...h } = Z("ComboboxSearch", Pv, e), d = Ct(), m = d.getStyles("search"), g = Ni({
    targetType: "input",
    withAriaAttributes: s,
    withKeyboardNavigation: l,
    withExpandedAttribute: !1,
    onKeyDown: a,
    onClick: i,
    autoComplete: "off"
  });
  return /* @__PURE__ */ c.jsx(Rt, {
    ref: Ve(f, d.store.searchRef),
    classNames: [{ input: m.className }, t],
    styles: [{ input: m.style }, n],
    size: u || d.size,
    ...g,
    ...h,
    __staticSelector: "Combobox"
  });
});
Di.classes = ut;
Di.displayName = "@mantine/core/ComboboxSearch";
const Av = {
  refProp: "ref",
  targetType: "input",
  withKeyboardNavigation: !0,
  withAriaAttributes: !0,
  withExpandedAttribute: !1,
  autoComplete: "off"
}, Pd = ce((e) => {
  const { children: t, refProp: n, withKeyboardNavigation: o, withAriaAttributes: r, withExpandedAttribute: s, targetType: a, autoComplete: i, ref: l, ...u } = Z("ComboboxTarget", Av, e), f = dr(t);
  if (!f) throw new Error("Combobox.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported");
  const h = Ct(), d = Ni({
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
  return /* @__PURE__ */ c.jsx(He.Target, {
    refProp: n,
    ref: Ve(l, h.store.targetRef),
    children: m
  });
});
Pd.displayName = "@mantine/core/ComboboxTarget";
function Iv(e, t, n) {
  for (let o = e - 1; o >= 0; o -= 1) if (!t[o].hasAttribute("data-combobox-disabled")) return o;
  if (n) {
    for (let o = t.length - 1; o > -1; o -= 1) if (!t[o].hasAttribute("data-combobox-disabled")) return o;
  }
  return e;
}
function Mv(e, t, n) {
  for (let o = e + 1; o < t.length; o += 1) if (!t[o].hasAttribute("data-combobox-disabled")) return o;
  if (n) {
    for (let o = 0; o < t.length; o += 1) if (!t[o].hasAttribute("data-combobox-disabled")) return o;
  }
  return e;
}
function Dv(e) {
  for (let t = 0; t < e.length; t += 1) if (!e[t].hasAttribute("data-combobox-disabled")) return t;
  return -1;
}
function Oi({ defaultOpened: e, opened: t, onOpenedChange: n, onDropdownClose: o, onDropdownOpen: r, loop: s = !0, scrollBehavior: a = "instant" } = {}) {
  const [i, l] = Qe({
    value: t,
    defaultValue: e,
    finalValue: !1,
    onChange: n
  }), u = p.useRef(null), f = p.useRef(-1), h = p.useRef(null), d = p.useRef(null), m = p.useRef(-1), g = p.useRef(-1), v = p.useRef(-1), x = p.useCallback((D = "unknown") => {
    i || (l(!0), r?.(D));
  }, [
    l,
    r,
    i
  ]), b = p.useCallback((D = "unknown") => {
    i && (l(!1), o?.(D));
  }, [
    l,
    o,
    i
  ]), E = p.useCallback((D = "unknown") => {
    i ? b(D) : x(D);
  }, [
    b,
    x,
    i
  ]), S = p.useCallback(() => {
    const D = Ut(d.current);
    Or(`#${u.current} [data-combobox-selected]`, D)?.removeAttribute("data-combobox-selected");
  }, []), k = p.useCallback((D) => {
    const L = Ut(d.current), I = Or(`#${u.current}`, L), P = I ? Zt("[data-combobox-option]", I) : null;
    if (!P) return null;
    const F = D >= P.length ? 0 : D < 0 ? P.length - 1 : D;
    return f.current = F, P?.[F] && !P[F].hasAttribute("data-combobox-disabled") ? (S(), P[F].setAttribute("data-combobox-selected", "true"), P[F].scrollIntoView({
      block: "nearest",
      behavior: a
    }), P[F].id) : null;
  }, [a, S]), R = p.useCallback(() => {
    const D = Ut(d.current), L = Or(`#${u.current} [data-combobox-active]`, D);
    if (L) {
      const I = Zt(`#${u.current} [data-combobox-option]`, D).findIndex((P) => P === L);
      return k(I);
    }
    return k(0);
  }, [k]), T = p.useCallback(() => {
    const D = Ut(d.current), L = Zt(`#${u.current} [data-combobox-option]`, D);
    return k(Mv(f.current, L, s));
  }, [k, s]), C = p.useCallback(() => {
    const D = Ut(d.current), L = Zt(`#${u.current} [data-combobox-option]`, D);
    return k(Iv(f.current, L, s));
  }, [k, s]), w = p.useCallback(() => {
    const D = Ut(d.current), L = Zt(`#${u.current} [data-combobox-option]`, D);
    return k(Dv(L));
  }, [k]), A = p.useCallback((D = "selected", L) => {
    if (typeof D == "number") {
      f.current = D;
      const I = Ut(d.current), P = Zt(`#${u.current} [data-combobox-option]`, I);
      L?.scrollIntoView && P[D]?.scrollIntoView({
        block: "nearest",
        behavior: a
      });
      return;
    }
    v.current = window.setTimeout(() => {
      const I = Ut(d.current), P = Zt(`#${u.current} [data-combobox-option]`, I), F = P.findIndex((_) => _.hasAttribute(`data-combobox-${D}`));
      f.current = F, L?.scrollIntoView && P[F]?.scrollIntoView({
        block: "nearest",
        behavior: a
      });
    }, 0);
  }, []), $ = p.useCallback(() => {
    f.current = -1, S();
  }, [S]), z = p.useCallback(() => {
    const D = Ut(d.current);
    Zt(`#${u.current} [data-combobox-option]`, D)?.[f.current]?.click();
  }, []), V = p.useCallback((D) => {
    u.current = D;
  }, []), B = p.useCallback(() => {
    m.current = window.setTimeout(() => h.current?.focus(), 0);
  }, []), M = p.useCallback(() => {
    g.current = window.setTimeout(() => d.current?.focus(), 0);
  }, []), O = p.useCallback(() => f.current, []);
  return p.useEffect(() => () => {
    window.clearTimeout(m.current), window.clearTimeout(g.current), window.clearTimeout(v.current);
  }, []), {
    dropdownOpened: i,
    openDropdown: x,
    closeDropdown: b,
    toggleDropdown: E,
    selectedOptionIndex: f.current,
    getSelectedOptionIndex: O,
    selectOption: k,
    selectFirstOption: w,
    selectActiveOption: R,
    selectNextOption: T,
    selectPreviousOption: C,
    resetSelectedOption: $,
    updateSelectedOptionIndex: A,
    listId: u.current,
    setListId: V,
    clickSelectedOption: z,
    searchRef: h,
    focusSearchInput: B,
    targetRef: d,
    focusTarget: M
  };
}
const Ov = {
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
}, Ad = ze((e, { size: t, dropdownPadding: n }) => ({
  options: {
    "--combobox-option-fz": Wr(t),
    "--combobox-option-padding": _e(t, "combobox-option-padding")
  },
  dropdown: {
    "--combobox-padding": n === void 0 ? void 0 : Ae(n),
    "--combobox-option-fz": Wr(t),
    "--combobox-option-padding": _e(t, "combobox-option-padding")
  }
})), Ce = (e) => {
  const t = Z("Combobox", Ov, e), { classNames: n, styles: o, unstyled: r, children: s, store: a, vars: i, onOptionSubmit: l, onClose: u, size: f, dropdownPadding: h, resetSelectionOnOptionHover: d, __staticSelector: m, readOnly: g, attributes: v, floatingHeight: x, middlewares: b, ...E } = t, S = x === "viewport" ? {
    ...b,
    flip: !1,
    size: {
      ...typeof b?.size == "object" ? b.size : {},
      padding: typeof b?.size == "object" && b.size.padding !== void 0 ? b.size.padding : 10,
      apply: ({ availableHeight: w, availableWidth: A, elements: $, ...z }) => {
        $.floating.style.setProperty("--combobox-floating-max-height", `${w}px`);
        const V = b?.size;
        typeof V == "object" && V.apply ? V.apply({
          availableHeight: w,
          availableWidth: A,
          elements: $,
          ...z
        }) : V && Object.assign($.floating.style, {
          maxWidth: `${A}px`,
          maxHeight: `${w}px`
        });
      }
    }
  } : b, k = Oi(), R = a || k, T = De({
    name: m || "Combobox",
    classes: ut,
    props: t,
    classNames: n,
    styles: o,
    unstyled: r,
    attributes: v,
    vars: i,
    varsResolver: Ad
  }), C = () => {
    u?.(), R.closeDropdown();
  };
  return /* @__PURE__ */ c.jsx(Rv, {
    value: {
      getStyles: T,
      store: R,
      onOptionSubmit: l,
      size: f,
      resetSelectionOnOptionHover: d,
      readOnly: g,
      floatingHeight: x
    },
    children: /* @__PURE__ */ c.jsx(He, {
      opened: R.dropdownOpened,
      ...E,
      middlewares: S,
      onChange: (w) => !w && C(),
      withRoles: !1,
      unstyled: r,
      children: s
    })
  });
}, $v = (e) => e;
Ce.extend = $v;
Ce.classes = ut;
Ce.varsResolver = Ad;
Ce.displayName = "@mantine/core/Combobox";
Ce.Target = Pd;
Ce.Dropdown = Ei;
Ce.Options = Mi;
Ce.Option = Ii;
Ce.Search = Di;
Ce.Empty = Ri;
Ce.Chevron = hr;
Ce.Footer = Ti;
Ce.Header = Ai;
Ce.EventsTarget = Nd;
Ce.DropdownTarget = Rd;
Ce.Group = Pi;
Ce.ClearButton = Ed;
Ce.HiddenInput = Td;
function Id({ children: e, role: t }) {
  const n = p.use(nh);
  return n ? /* @__PURE__ */ c.jsx("div", {
    role: t,
    "aria-labelledby": n.labelId,
    "aria-describedby": n.describedBy,
    children: e
  }) : /* @__PURE__ */ c.jsx(c.Fragment, { children: e });
}
const $i = p.createContext(null), Lv = { hiddenInputValuesSeparator: "," }, Li = En(((e) => {
  const { value: t, defaultValue: n, onChange: o, size: r, wrapperProps: s, children: a, readOnly: i, name: l, hiddenInputValuesSeparator: u, hiddenInputProps: f, maxSelectedValues: h, disabled: d, ...m } = Z("CheckboxGroup", Lv, e), [g, v] = Qe({
    value: t,
    defaultValue: n,
    finalValue: [],
    onChange: o
  }), x = (S) => {
    const k = typeof S == "string" ? S : S.currentTarget.value;
    if (i) return;
    const R = g.includes(k);
    !R && h && g.length >= h || v(R ? g.filter((T) => T !== k) : [...g, k]);
  }, b = (S) => {
    if (d) return !0;
    if (!h) return !1;
    const k = g.includes(S), R = g.length >= h;
    return !k && R;
  }, E = g.join(u);
  return /* @__PURE__ */ c.jsx($i, {
    value: {
      value: g,
      onChange: x,
      size: r,
      isDisabled: b
    },
    children: /* @__PURE__ */ c.jsxs(Rt.Wrapper, {
      size: r,
      ...s,
      ...m,
      labelElement: "div",
      __staticSelector: "CheckboxGroup",
      children: [/* @__PURE__ */ c.jsx(Id, {
        role: "group",
        children: a
      }), /* @__PURE__ */ c.jsx("input", {
        type: "hidden",
        name: l,
        value: E,
        ...f
      })]
    })
  });
}));
Li.classes = Rt.Wrapper.classes;
Li.displayName = "@mantine/core/CheckboxGroup";
var Md = { card: "m_26775b0a" };
const Dd = p.createContext(null), zv = { withBorder: !0 }, Od = ze((e, { radius: t }) => ({ card: { "--card-radius": Tt(t) } })), Ss = ce((e) => {
  const t = Z("CheckboxCard", zv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, checked: l, mod: u, withBorder: f, value: h, onClick: d, defaultChecked: m, onChange: g, indeterminate: v, attributes: x, ...b } = t, E = De({
    name: "CheckboxCard",
    classes: Md,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: x,
    vars: i,
    varsResolver: Od,
    rootSelector: "card"
  }), S = p.use($i), k = typeof l == "boolean" ? l : S ? S.value.includes(h || "") : void 0, [R, T] = Qe({
    value: k,
    defaultValue: m,
    finalValue: !1,
    onChange: g
  });
  return /* @__PURE__ */ c.jsx(Dd, {
    value: {
      checked: R,
      indeterminate: v
    },
    children: /* @__PURE__ */ c.jsx(zn, {
      mod: [{
        "with-border": f,
        checked: R,
        indeterminate: v
      }, u],
      ...E("card"),
      ...b,
      role: "checkbox",
      "aria-checked": v ? "mixed" : R,
      onClick: (C) => {
        d?.(C), S?.onChange(h || ""), T(!R);
      }
    })
  });
});
Ss.displayName = "@mantine/core/CheckboxCard";
Ss.classes = Md;
Ss.varsResolver = Od;
function zi({ size: e, style: t, ...n }) {
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
function $d({ indeterminate: e, ...t }) {
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
  }) : /* @__PURE__ */ c.jsx(zi, { ...t });
}
var Ld = {
  indicator: "m_5e5256ee",
  icon: "m_1b1c543a",
  "indicator--outline": "m_76e20374"
};
const _v = {
  icon: $d,
  variant: "filled",
  radius: "sm"
}, zd = ze((e, { radius: t, color: n, size: o, iconColor: r, variant: s, autoContrast: a }) => {
  const i = ls({
    color: n || e.primaryColor,
    theme: e
  }), l = i.isThemeColor && i.shade === void 0 ? `var(--mantine-color-${i.color}-outline)` : i.color;
  return { indicator: {
    "--checkbox-size": _e(o, "checkbox-size"),
    "--checkbox-radius": t === void 0 ? void 0 : Tt(t),
    "--checkbox-color": s === "outline" ? l : at(n, e),
    "--checkbox-icon-color": r ? at(r, e) : fr(a, e) ? Co({
      color: n,
      theme: e,
      autoContrast: a
    }) : void 0
  } };
}), Cs = ce((e) => {
  const t = Z("CheckboxIndicator", _v, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, icon: l, indeterminate: u, radius: f, color: h, iconColor: d, autoContrast: m, checked: g, mod: v, variant: x, disabled: b, attributes: E, ...S } = t, k = De({
    name: "CheckboxIndicator",
    classes: Ld,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: E,
    vars: i,
    varsResolver: zd,
    rootSelector: "indicator"
  }), R = p.use(Dd), T = typeof u == "boolean" ? u : R?.indeterminate, C = typeof g == "boolean" || typeof u == "boolean" ? g || u : R?.checked || R?.indeterminate || !1;
  return /* @__PURE__ */ c.jsx(Q, {
    ...k("indicator", { variant: x }),
    variant: x,
    mod: [{
      checked: C,
      disabled: b
    }, v],
    ...S,
    children: /* @__PURE__ */ c.jsx(l, {
      indeterminate: T,
      ...k("icon")
    })
  });
});
Cs.displayName = "@mantine/core/CheckboxIndicator";
Cs.classes = Ld;
Cs.varsResolver = zd;
var _d = {
  root: "m_5f75b09e",
  body: "m_5f6e695e",
  labelWrapper: "m_d3ea56bb",
  label: "m_8ee546b8",
  description: "m_328f68c0",
  error: "m_8e8a99cc"
};
const Fv = _d;
function _i({ __staticSelector: e, __stylesApiProps: t, className: n, classNames: o, styles: r, unstyled: s, children: a, label: i, description: l, id: u, disabled: f, error: h, size: d, labelPosition: m = "left", bodyElement: g = "div", labelElement: v = "label", variant: x, style: b, vars: E, mod: S, attributes: k, ...R }) {
  const T = De({
    name: e,
    props: t,
    className: n,
    style: b,
    classes: _d,
    classNames: o,
    styles: r,
    unstyled: s,
    attributes: k
  }), C = l ? `${u}-description` : void 0, w = h && typeof h != "boolean" ? `${u}-error` : void 0;
  return /* @__PURE__ */ c.jsx(Q, {
    ...T("root"),
    __vars: {
      "--label-fz": Wr(d),
      "--label-lh": _e(d, "label-lh")
    },
    mod: [{ "label-position": m }, S],
    variant: x,
    size: d,
    ...R,
    children: /* @__PURE__ */ c.jsxs(Q, {
      component: g,
      htmlFor: g === "label" ? u : void 0,
      ...T("body"),
      children: [a, /* @__PURE__ */ c.jsxs("div", {
        ...T("labelWrapper"),
        "data-disabled": f || void 0,
        children: [
          i && /* @__PURE__ */ c.jsx(Q, {
            component: v,
            htmlFor: v === "label" ? u : void 0,
            ...T("label"),
            "data-disabled": f || void 0,
            children: i
          }),
          l && /* @__PURE__ */ c.jsx(Rt.Description, {
            id: C,
            size: d,
            __inheritStyles: !1,
            ...T("description"),
            children: l
          }),
          h && typeof h != "boolean" && /* @__PURE__ */ c.jsx(Rt.Error, {
            id: w,
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
_i.displayName = "@mantine/core/InlineInput";
var Fd = {
  root: "m_bf2d988c",
  inner: "m_26062bec",
  input: "m_26063560",
  icon: "m_bf295423",
  "input--outline": "m_215c4542"
};
const Bv = {
  labelPosition: "right",
  icon: $d,
  withErrorStyles: !0,
  variant: "filled",
  radius: "sm"
}, Bd = ze((e, { radius: t, color: n, size: o, iconColor: r, variant: s, autoContrast: a }) => {
  const i = ls({
    color: n || e.primaryColor,
    theme: e
  }), l = i.isThemeColor && i.shade === void 0 ? `var(--mantine-color-${i.color}-outline)` : i.color;
  return { root: {
    "--checkbox-size": _e(o, "checkbox-size"),
    "--checkbox-radius": t === void 0 ? void 0 : Tt(t),
    "--checkbox-color": s === "outline" ? l : at(n, e),
    "--checkbox-icon-color": r ? at(r, e) : fr(a, e) ? Co({
      color: n,
      theme: e,
      autoContrast: a
    }) : void 0
  } };
}), Gt = ce((e) => {
  const t = Z("Checkbox", Bv, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, color: l, label: u, id: f, size: h, radius: d, wrapperProps: m, checked: g, labelPosition: v, description: x, error: b, disabled: E, variant: S, indeterminate: k, icon: R, rootRef: T, iconColor: C, onChange: w, autoContrast: A, mod: $, attributes: z, readOnly: V, onClick: B, withErrorStyles: M, ref: O, ...D } = t, L = p.useRef(null), I = p.use($i), P = h || I?.size, F = De({
    name: "Checkbox",
    props: t,
    classes: Fd,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: z,
    vars: i,
    varsResolver: Bd
  }), { styleProps: _, rest: U } = su(D), X = Vt(f), ne = [
    x ? `${X}-description` : void 0,
    b && typeof b != "boolean" ? `${X}-error` : void 0,
    U["aria-describedby"]
  ].filter(Boolean).join(" ") || void 0, de = {
    checked: I?.value.includes(U.value) ?? g,
    onChange: (fe) => {
      V || (I?.onChange(fe), w?.(fe));
    }
  }, oe = I?.isDisabled?.(U.value) ?? !1, te = E || oe;
  return p.useEffect(() => {
    L.current && (L.current.indeterminate = k || !1, k ? L.current.setAttribute("data-indeterminate", "true") : L.current.removeAttribute("data-indeterminate"));
  }, [k]), /* @__PURE__ */ c.jsx(_i, {
    ...F("root"),
    __staticSelector: "Checkbox",
    __stylesApiProps: t,
    id: X,
    size: P,
    labelPosition: v,
    label: u,
    description: x,
    error: b,
    disabled: te,
    classNames: n,
    styles: s,
    unstyled: a,
    "data-checked": de.checked || g || void 0,
    variant: S,
    ref: T,
    mod: $,
    attributes: z,
    inert: U.inert,
    ..._,
    ...m,
    children: /* @__PURE__ */ c.jsxs(Q, {
      ...F("inner"),
      mod: { labelPosition: v },
      children: [/* @__PURE__ */ c.jsx(Q, {
        component: "input",
        id: X,
        ref: Ve(L, O),
        mod: {
          error: !!b,
          "with-error-styles": M
        },
        ...F("input", {
          focusable: !0,
          variant: S
        }),
        ...U,
        ...de,
        "aria-describedby": ne,
        disabled: te,
        inert: U.inert,
        type: "checkbox",
        onClick: (fe) => {
          V && de.checked === void 0 && fe.preventDefault(), B?.(fe);
        }
      }), /* @__PURE__ */ c.jsx(R, {
        indeterminate: k,
        ...F("icon")
      })]
    })
  });
});
Gt.classes = {
  ...Fd,
  ...Fv
};
Gt.varsResolver = Bd;
Gt.displayName = "@mantine/core/Checkbox";
Gt.Group = Li;
Gt.Indicator = Cs;
Gt.Card = Ss;
function Zo(e) {
  return "group" in e;
}
function Vd({ options: e, search: t, limit: n }) {
  const o = t.trim().toLowerCase(), r = [];
  for (let s = 0; s < e.length; s += 1) {
    const a = e[s];
    if (r.length === n) return r;
    Zo(a) && r.push({
      group: a.group,
      items: Vd({
        options: a.items,
        search: t,
        limit: n - r.length
      })
    }), Zo(a) || a.label.toLowerCase().includes(o) && r.push(a);
  }
  return r;
}
function Vv(e) {
  if (e.length === 0) return !0;
  for (const t of e)
    if (!("group" in t) || t.items.length > 0) return !1;
  return !0;
}
function Hd(e, t = /* @__PURE__ */ new Set()) {
  if (Array.isArray(e))
    for (const n of e) if (Zo(n)) Hd(n.items, t);
    else {
      if (typeof n.value > "u") throw new Error("[@mantine/core] Each option must have value property");
      if (t.has(n.value)) throw new Error(`[@mantine/core] Duplicate options are not supported. Option with value "${n.value}" was provided more than once`);
      t.add(n.value);
    }
}
function Hv(e, t) {
  return Array.isArray(e) ? e.includes(t) : e === t;
}
function Ud({ data: e, withCheckIcon: t, withAlignedLabels: n, value: o, checkIconPosition: r, unstyled: s, renderOption: a }) {
  if (!Zo(e)) {
    const l = Hv(o, e.value), u = t && (l ? /* @__PURE__ */ c.jsx(zi, { className: ut.optionsDropdownCheckIcon }) : n ? /* @__PURE__ */ c.jsx("div", { className: ut.optionsDropdownCheckPlaceholder }) : null), f = /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
      r === "left" && u,
      /* @__PURE__ */ c.jsx("span", { children: e.label }),
      r === "right" && u
    ] });
    return /* @__PURE__ */ c.jsx(Ce.Option, {
      value: e.value,
      disabled: e.disabled,
      className: rn({ [ut.optionsDropdownOption]: !s }),
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
  const i = e.items.map((l) => /* @__PURE__ */ c.jsx(Ud, {
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
function Uv({ data: e, hidden: t, hiddenWhenEmpty: n, filter: o, search: r, limit: s, maxDropdownHeight: a, floatingHeight: i, withScrollArea: l = !0, filterOptions: u = !0, withCheckIcon: f = !1, withAlignedLabels: h = !1, value: d, checkIconPosition: m, nothingFoundMessage: g, unstyled: v, labelId: x, renderOption: b, scrollAreaProps: E, "aria-label": S }) {
  const k = Ct();
  Hd(e);
  const R = typeof r == "string" ? (o || Vd)({
    options: e,
    search: u ? r : "",
    limit: s ?? 1 / 0
  }) : e, T = Vv(R), C = R.map((w, A) => /* @__PURE__ */ c.jsx(Ud, {
    data: w,
    withCheckIcon: f,
    withAlignedLabels: h,
    value: d,
    checkIconPosition: m,
    unstyled: v,
    renderOption: b
  }, Zo(w) ? `group-${typeof w.group == "string" ? w.group : A}` : `${w.value}`));
  return /* @__PURE__ */ c.jsx(Ce.Dropdown, {
    hidden: t || n && T,
    "data-composed": !0,
    children: /* @__PURE__ */ c.jsxs(Ce.Options, {
      labelledBy: x,
      "aria-label": S,
      children: [l ? /* @__PURE__ */ c.jsx(Nn.Autosize, {
        mah: (i ?? k.floatingHeight) === "viewport" ? "var(--combobox-floating-options-max-height)" : a ?? 220,
        type: "scroll",
        scrollbarSize: "var(--combobox-padding)",
        offsetScrollbars: "y",
        ...E,
        children: C
      }) : C, T && g && /* @__PURE__ */ c.jsx(Ce.Empty, { children: g })]
    })
  });
}
function Wv(e) {
  const t = e.currentTarget;
  return Ut(t).activeElement !== t;
}
var Wd = {
  root: "m_de3d2490",
  colorOverlay: "m_862f3d1b",
  shadowOverlay: "m_98ae7f22",
  alphaOverlay: "m_95709ac0",
  childrenOverlay: "m_93e74e3"
};
const ol = { withShadow: !0 }, qd = ze((e, { radius: t, size: n }) => ({ root: {
  "--cs-radius": t === void 0 ? void 0 : Tt(t),
  "--cs-size": Ae(n)
} })), No = ru((e) => {
  const t = Z("ColorSwatch", ol, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, color: l, radius: u, withShadow: f, children: h, attributes: d, ...m } = Z("ColorSwatch", ol, t), g = De({
    name: "ColorSwatch",
    props: t,
    classes: Wd,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: d,
    vars: i,
    varsResolver: qd
  });
  return /* @__PURE__ */ c.jsxs(Q, {
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
No.classes = Wd;
No.varsResolver = qd;
No.displayName = "@mantine/core/ColorSwatch";
function jt(e, t = 0, n = 10 ** t) {
  return Math.round(n * e) / n;
}
function qv({ h: e, s: t, l: n, a: o }) {
  const r = t * ((n < 50 ? n : 100 - n) / 100);
  return {
    h: e,
    s: r > 0 ? 2 * r / (n + r) * 100 : 0,
    v: n + r,
    a: o
  };
}
const Kv = {
  grad: 360 / 400,
  turn: 360,
  rad: 360 / (Math.PI * 2)
};
function Xv(e, t = "deg") {
  return Number(e) * (Kv[t] || 1);
}
const Yv = /hsla?\(?\s*(-?\d*\.?\d+)(deg|rad|grad|turn)?[,\s]+(-?\d*\.?\d+)%?[,\s]+(-?\d*\.?\d+)%?,?\s*[/\s]*(-?\d*\.?\d+)?(%)?\s*\)?/i;
function rl(e) {
  const t = Yv.exec(e);
  return t ? qv({
    h: Xv(t[1], t[2]),
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
function Aa({ r: e, g: t, b: n, a: o }) {
  const r = Math.max(e, t, n), s = r - Math.min(e, t, n), a = s ? r === e ? (t - n) / s : r === t ? 2 + (n - e) / s : 4 + (e - t) / s : 0;
  return {
    h: jt(60 * (a < 0 ? a + 6 : a), 3),
    s: jt(r ? s / r * 100 : 0, 3),
    v: jt(r / 255 * 100, 3),
    a: o
  };
}
function Ia(e) {
  const t = e[0] === "#" ? e.slice(1) : e;
  return t.length === 3 ? Aa({
    r: parseInt(t[0] + t[0], 16),
    g: parseInt(t[1] + t[1], 16),
    b: parseInt(t[2] + t[2], 16),
    a: 1
  }) : Aa({
    r: parseInt(t.slice(0, 2), 16),
    g: parseInt(t.slice(2, 4), 16),
    b: parseInt(t.slice(4, 6), 16),
    a: 1
  });
}
function Gv(e) {
  const t = e[0] === "#" ? e.slice(1) : e, n = (s) => jt(parseInt(s, 16) / 255, 3);
  if (t.length === 4) {
    const s = t.slice(0, 3), a = n(t[3] + t[3]);
    return {
      ...Ia(s),
      a
    };
  }
  const o = t.slice(0, 6), r = n(t.slice(6, 8));
  return {
    ...Ia(o),
    a: r
  };
}
const Jv = /rgba?\(?\s*(-?\d*\.?\d+)(%)?[,\s]+(-?\d*\.?\d+)(%)?[,\s]+(-?\d*\.?\d+)(%)?,?\s*[/\s]*(-?\d*\.?\d+)?(%)?\s*\)?/i;
function sl(e) {
  const t = Jv.exec(e);
  return t ? Aa({
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
const Kd = {
  hex: /^#?([0-9A-F]{3}){1,2}$/i,
  hexa: /^#?([0-9A-F]{4}){1,2}$/i,
  rgb: /^rgb\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/i,
  rgba: /^rgba\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/i,
  hsl: /hsl\(\s*(\d+)\s*,\s*(\d+(?:\.\d+)?%)\s*,\s*(\d+(?:\.\d+)?%)\)/i,
  hsla: /^hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*(\d*(?:\.\d+)?)\)$/i
}, Zv = {
  hex: Ia,
  hexa: Gv,
  rgb: sl,
  rgba: sl,
  hsl: rl,
  hsla: rl
};
function _o(e) {
  for (const [, t] of Object.entries(Kd)) if (t.test(e)) return !0;
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
  for (const [n, o] of Object.entries(Kd)) if (o.test(t)) return Zv[n](t);
  return {
    h: 0,
    s: 0,
    v: 0,
    a: 1
  };
}
const js = p.createContext(null);
function Fi({ position: e, ...t }) {
  return /* @__PURE__ */ c.jsx(Q, {
    __vars: {
      "--thumb-y-offset": `${e.y * 100}%`,
      "--thumb-x-offset": `${e.x * 100}%`
    },
    ...t
  });
}
Fi.displayName = "@mantine/core/ColorPickerThumb";
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
const To = ce((e) => {
  const t = Z("ColorSlider", null, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, onChange: l, onChangeEnd: u, maxValue: f, round: h, size: d = "md", focusable: m = !0, value: g, overlays: v, thumbColor: x = "transparent", onScrubStart: b, onScrubEnd: E, __staticSelector: S = "ColorPicker", attributes: k, ref: R, ...T } = t, C = De({
    name: S,
    classes: ks,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: k,
    rootSelector: "slider"
  }), w = p.use(js)?.getStyles || C, A = lr(), [$, z] = p.useState({
    y: 0,
    x: g / f
  }), V = p.useRef($), B = (I) => h ? Math.round(I * f) : I * f, { ref: M } = bu(({ x: I, y: P }) => {
    V.current = {
      x: I,
      y: P
    }, l?.(B(I));
  }, {
    onScrubEnd: () => {
      const { x: I } = V.current;
      u?.(B(I)), E?.();
    },
    onScrubStart: b
  });
  Cn(() => {
    z({
      y: 0,
      x: g / f
    });
  }, [g]);
  const O = (I, P) => {
    I.preventDefault();
    const F = yu(P);
    l?.(B(F.x)), u?.(B(F.x));
  }, D = (I) => {
    switch (I.key) {
      case "ArrowRight":
        O(I, {
          x: $.x + 0.05,
          y: $.y
        });
        break;
      case "ArrowLeft":
        O(I, {
          x: $.x - 0.05,
          y: $.y
        });
    }
  }, L = v.map((I, P) => /* @__PURE__ */ p.createElement("div", {
    ...w("sliderOverlay"),
    style: I,
    key: P
  }));
  return /* @__PURE__ */ c.jsxs(Q, {
    ...T,
    ref: Ve(M, R),
    ...w("slider"),
    size: d,
    role: "slider",
    "aria-valuenow": g,
    "aria-valuemax": f,
    "aria-valuemin": 0,
    tabIndex: m ? 0 : -1,
    onKeyDown: D,
    "data-focus-ring": A.focusRing,
    __vars: { "--cp-thumb-size": `var(--cp-thumb-size-${d})` },
    children: [L, /* @__PURE__ */ c.jsx(Fi, {
      position: $,
      ...w("thumb", { style: {
        top: Ae(1),
        background: x
      } })
    })]
  });
});
To.displayName = "@mantine/core/ColorSlider";
To.classes = ks;
const Qv = { __staticSelector: "AlphaSlider" }, Bi = ce((e) => {
  const { value: t, onChange: n, onChangeEnd: o, color: r, ...s } = Z("AlphaSlider", Qv, e);
  return /* @__PURE__ */ c.jsx(To, {
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
Bi.displayName = "@mantine/core/AlphaSlider";
Bi.classes = To.classes;
function Xd({ h: e, s: t, v: n, a: o }) {
  const r = e / 360 * 6, s = t / 100, a = n / 100, i = Math.floor(r), l = a * (1 - s), u = a * (1 - (r - i) * s), f = a * (1 - (1 - r + i) * s), h = i % 6;
  return {
    r: jt([
      a,
      u,
      l,
      l,
      f,
      a
    ][h] * 255),
    g: jt([
      f,
      a,
      a,
      u,
      l,
      l
    ][h] * 255),
    b: jt([
      l,
      l,
      f,
      a,
      a,
      u
    ][h] * 255),
    a: jt(o, 2)
  };
}
function al(e, t) {
  const { r: n, g: o, b: r, a: s } = Xd(e);
  return t ? `rgba(${n}, ${o}, ${r}, ${jt(s, 2)})` : `rgb(${n}, ${o}, ${r})`;
}
function il({ h: e, s: t, v: n, a: o }, r) {
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
function Yd(e) {
  const { r: t, g: n, b: o } = Xd(e);
  return `#${_r(t)}${_r(n)}${_r(o)}`;
}
function ey(e) {
  const t = Math.round(e.a * 255);
  return `${Yd(e)}${_r(t)}`;
}
const ra = {
  hex: Yd,
  hexa: (e) => ey(e),
  rgb: (e) => al(e, !1),
  rgba: (e) => al(e, !0),
  hsl: (e) => il(e, !1),
  hsla: (e) => il(e, !0)
};
function Dt(e, t) {
  return t ? e in ra ? ra[e](t) : ra.hex(t) : "#000000";
}
const ty = { __staticSelector: "HueSlider" }, Vi = ce((e) => {
  const { value: t, onChange: n, onChangeEnd: o, color: r, ...s } = Z("HueSlider", ty, e);
  return /* @__PURE__ */ c.jsx(To, {
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
Vi.displayName = "@mantine/core/HueSlider";
Vi.classes = To.classes;
function Gd({ className: e, onChange: t, onChangeEnd: n, value: o, saturationLabel: r, focusable: s = !0, size: a, color: i, onScrubStart: l, onScrubEnd: u, ...f }) {
  const { getStyles: h } = p.use(js), [d, m] = p.useState({
    x: o.s / 100,
    y: 1 - o.v / 100
  }), g = p.useRef(d), { ref: v } = bu(({ x: E, y: S }) => {
    g.current = {
      x: E,
      y: S
    }, t({
      s: Math.round(E * 100),
      v: Math.round((1 - S) * 100)
    });
  }, {
    onScrubEnd: () => {
      const { x: E, y: S } = g.current;
      n({
        s: Math.round(E * 100),
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
  const x = (E, S) => {
    E.preventDefault();
    const k = yu(S);
    t({
      s: Math.round(k.x * 100),
      v: Math.round((1 - k.y) * 100)
    }), n({
      s: Math.round(k.x * 100),
      v: Math.round((1 - k.y) * 100)
    });
  }, b = (E) => {
    switch (E.key) {
      case "ArrowUp":
        x(E, {
          y: d.y - 0.05,
          x: d.x
        });
        break;
      case "ArrowDown":
        x(E, {
          y: d.y + 0.05,
          x: d.x
        });
        break;
      case "ArrowRight":
        x(E, {
          x: d.x + 0.05,
          y: d.y
        });
        break;
      case "ArrowLeft":
        x(E, {
          x: d.x - 0.05,
          y: d.y
        });
    }
  };
  return /* @__PURE__ */ c.jsxs(Q, {
    ...h("saturation"),
    ref: v,
    ...f,
    role: "slider",
    "aria-label": r,
    "aria-valuenow": d.x,
    "aria-valuetext": Dt("rgba", o),
    tabIndex: s ? 0 : -1,
    onKeyDown: b,
    children: [
      /* @__PURE__ */ c.jsx("div", { ...h("saturationOverlay", { style: { backgroundColor: `hsl(${o.h}, 100%, 50%)` } }) }),
      /* @__PURE__ */ c.jsx("div", { ...h("saturationOverlay", { style: { backgroundImage: "linear-gradient(90deg, #fff, transparent)" } }) }),
      /* @__PURE__ */ c.jsx("div", { ...h("saturationOverlay", { style: { backgroundImage: "linear-gradient(0deg, #000, transparent)" } }) }),
      /* @__PURE__ */ c.jsx(Fi, {
        position: d,
        ...h("thumb", { style: { backgroundColor: i } })
      })
    ]
  });
}
Gd.displayName = "@mantine/core/Saturation";
function Jd({ className: e, datatype: t, setValue: n, onChangeEnd: o, size: r, focusable: s, data: a, swatchesPerRow: i, value: l, ...u }) {
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
  }, l === d && /* @__PURE__ */ c.jsx(zi, {
    size: "35%",
    color: Wp(d) < 0.5 ? "white" : "black"
  })));
  return /* @__PURE__ */ c.jsx(Q, {
    ...f.getStyles("swatches"),
    ...u,
    children: h
  });
}
Jd.displayName = "@mantine/core/Swatches";
const ny = {
  swatchesPerRow: 7,
  withPicker: !0,
  focusable: !0,
  size: "md",
  __staticSelector: "ColorPicker"
}, Zd = ze((e, { size: t, swatchesPerRow: n }) => ({ wrapper: {
  "--cp-preview-size": _e(t, "cp-preview-size"),
  "--cp-width": _e(t, "cp-width"),
  "--cp-body-spacing": Xo(t),
  "--cp-swatch-size": `${100 / n}%`,
  "--cp-thumb-size": _e(t, "cp-thumb-size"),
  "--cp-saturation-height": _e(t, "cp-saturation-height")
} })), Es = ce((e) => {
  const t = Z("ColorPicker", ny, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, format: l = "hex", value: u, defaultValue: f, onChange: h, onChangeEnd: d, withPicker: m, size: g, saturationLabel: v, hueLabel: x, alphaLabel: b, focusable: E, swatches: S, swatchesPerRow: k, fullWidth: R, onColorSwatchClick: T, __staticSelector: C, mod: w, attributes: A, name: $, hiddenInputProps: z, ...V } = t, B = De({
    name: C,
    props: t,
    classes: ks,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: A,
    rootSelector: "wrapper",
    vars: i,
    varsResolver: Zd
  }), M = p.useRef(l || "hex"), O = p.useRef(""), D = p.useRef(-1), L = p.useRef(!1), I = l === "hexa" || l === "rgba" || l === "hsla", [P, F, _] = Qe({
    value: u,
    defaultValue: f,
    finalValue: "#FFFFFF",
    onChange: h
  }), [U, X] = p.useState(Mn(P)), ne = () => {
    window.clearTimeout(D.current), L.current = !0;
  }, de = () => {
    window.clearTimeout(D.current), D.current = window.setTimeout(() => {
      L.current = !1;
    }, 200);
  }, oe = (te) => {
    X((fe) => {
      const K = {
        ...fe,
        ...te
      };
      return O.current = Dt(M.current, K), K;
    }), F(O.current);
  };
  return Cn(() => {
    typeof u == "string" && _o(u) && !L.current && X(Mn(u));
  }, [u]), Cn(() => {
    M.current = l || "hex", F(Dt(M.current, U));
  }, [l]), /* @__PURE__ */ c.jsx(js, {
    value: {
      getStyles: B,
      unstyled: a
    },
    children: /* @__PURE__ */ c.jsxs(Q, {
      ...B("wrapper"),
      size: g,
      mod: [{ "full-width": R }, w],
      ...V,
      children: [
        $ && /* @__PURE__ */ c.jsx("input", {
          type: "hidden",
          name: $,
          value: P,
          ...z
        }),
        m && /* @__PURE__ */ c.jsxs(c.Fragment, { children: [/* @__PURE__ */ c.jsx(Gd, {
          value: U,
          onChange: oe,
          onChangeEnd: ({ s: te, v: fe }) => d?.(Dt(M.current, {
            ...U,
            s: te,
            v: fe
          })),
          color: P,
          size: g,
          focusable: E,
          saturationLabel: v,
          onScrubStart: ne,
          onScrubEnd: de
        }), /* @__PURE__ */ c.jsxs("div", {
          ...B("body"),
          children: [/* @__PURE__ */ c.jsxs("div", {
            ...B("sliders"),
            children: [/* @__PURE__ */ c.jsx(Vi, {
              value: U.h,
              onChange: (te) => oe({ h: te }),
              onChangeEnd: (te) => d?.(Dt(M.current, {
                ...U,
                h: te
              })),
              size: g,
              focusable: E,
              "aria-label": x,
              onScrubStart: ne,
              onScrubEnd: de
            }), I && /* @__PURE__ */ c.jsx(Bi, {
              value: U.a,
              onChange: (te) => oe({ a: te }),
              onChangeEnd: (te) => {
                d?.(Dt(M.current, {
                  ...U,
                  a: te
                }));
              },
              size: g,
              color: Dt("hex", U),
              focusable: E,
              "aria-label": b,
              onScrubStart: ne,
              onScrubEnd: de
            })]
          }), I && /* @__PURE__ */ c.jsx(No, {
            color: P,
            radius: "sm",
            size: "var(--cp-preview-size)",
            ...B("preview")
          })]
        })] }),
        Array.isArray(S) && /* @__PURE__ */ c.jsx(Jd, {
          data: S,
          swatchesPerRow: k,
          focusable: E,
          setValue: F,
          value: P,
          onChangeEnd: (te) => {
            const fe = Dt(l, Mn(te));
            T?.(fe), d?.(fe), _ || X(Mn(te));
          }
        })
      ]
    })
  });
});
Es.classes = ks;
Es.varsResolver = Zd;
Es.displayName = "@mantine/core/ColorPicker";
function oy({ style: e, ...t }) {
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
var cl = {
  eyeDropperIcon: "m_b077c2bc",
  eyeDropperButton: "m_66a028b5",
  colorPreview: "m_c5ccdcab",
  dropdown: "m_5ece2cd7"
};
const ll = {
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
}, Qd = ze((e, { size: t }) => ({
  eyeDropperIcon: { "--ci-eye-dropper-icon-size": _e(t, "ci-eye-dropper-icon-size") },
  eyeDropperButton: { "--ci-button-size": _e(t, "ci-button-size") },
  colorPreview: { "--ci-preview-size": _e(t, "ci-preview-size") }
})), mr = ce((e) => {
  const t = Z([
    "Input",
    "InputWrapper",
    "ColorInput"
  ], ll, e), { classNames: n, styles: o, unstyled: r, disallowInput: s, fixOnBlur: a, popoverProps: i, withPreview: l, withEyeDropper: u, eyeDropperIcon: f, closeOnColorSwatchClick: h, eyeDropperButtonProps: d, value: m, defaultValue: g, onChange: v, onChangeEnd: x, onClick: b, onFocus: E, onBlur: S, inputProps: k, format: R = "hex", wrapperProps: T, readOnly: C, withPicker: w, swatches: A, disabled: $, leftSection: z, rightSection: V, swatchesPerRow: B, fullWidth: M, ...O } = oh("ColorInput", ll, e), D = De({
    name: "ColorInput",
    props: t,
    classes: cl,
    classNames: n,
    styles: o,
    unstyled: r,
    rootSelector: "wrapper",
    vars: t.vars,
    varsResolver: Qd
  }), { resolvedClassNames: L, resolvedStyles: I } = ur({
    classNames: n,
    styles: o,
    props: t
  }), [P, F] = p.useState(!1), [_, U] = p.useState(""), [X, ne] = Qe({
    value: m,
    defaultValue: g,
    finalValue: "",
    onChange: v
  }), { supported: de, open: oe } = Ch(), te = /* @__PURE__ */ c.jsx(Uo, {
    ...d,
    ...D("eyeDropperButton", {
      className: d?.className,
      style: d?.style
    }),
    variant: "subtle",
    color: "gray",
    unstyled: r,
    onClick: () => oe().then((ae) => {
      if (ae?.sRGBHex) {
        const be = Dt(R, Mn(ae.sRGBHex));
        ne(be), x?.(be);
      }
    }).catch(() => {
    }),
    children: f || /* @__PURE__ */ c.jsx(oy, { ...D("eyeDropperIcon") })
  }), fe = (ae) => {
    E?.(ae), F(!0);
  }, K = (ae) => {
    a && ne(_), S?.(ae), F(!1);
  }, q = (ae) => {
    b?.(ae), F(!0);
  };
  return p.useEffect(() => {
    (_o(X) || X.trim() === "") && U(X);
  }, [X]), Cn(() => {
    _o(X) && ne(Dt(R, Mn(X)));
  }, [R]), /* @__PURE__ */ c.jsx(Rt.Wrapper, {
    ...T,
    classNames: L,
    styles: I,
    __staticSelector: "ColorInput",
    children: /* @__PURE__ */ c.jsxs(He, {
      __staticSelector: "ColorInput",
      position: "bottom-start",
      offset: 5,
      opened: P,
      width: M ? "target" : void 0,
      ...i,
      classNames: L,
      styles: I,
      unstyled: r,
      withRoles: !1,
      disabled: C || w === !1 && (!Array.isArray(A) || A.length === 0),
      children: [/* @__PURE__ */ c.jsx(He.Target, { children: /* @__PURE__ */ c.jsx(Rt, {
        autoComplete: "off",
        ...O,
        ...k,
        classNames: L,
        styles: I,
        disabled: $,
        __staticSelector: "ColorInput",
        onFocus: fe,
        onBlur: K,
        onClick: q,
        spellCheck: !1,
        value: X,
        onChange: (ae) => {
          const be = ae.currentTarget.value;
          ne(be), _o(be) && x?.(Dt(R, Mn(be)));
        },
        leftSection: z || (l ? /* @__PURE__ */ c.jsx(No, {
          color: _o(X) ? X : "#fff",
          size: "var(--ci-preview-size)",
          ...D("colorPreview")
        }) : null),
        readOnly: s || C,
        pointer: s,
        unstyled: r,
        rightSection: V || (u && !$ && !C && de ? te : null)
      }) }), /* @__PURE__ */ c.jsx(He.Dropdown, {
        onMouseDown: (ae) => ae.preventDefault(),
        className: cl.dropdown,
        children: /* @__PURE__ */ c.jsx(Es, {
          __staticSelector: "ColorInput",
          value: X,
          onChange: ne,
          onChangeEnd: x,
          format: R,
          swatches: A,
          swatchesPerRow: B,
          withPicker: w,
          size: k.size,
          focusable: !1,
          unstyled: r,
          styles: I,
          classNames: L,
          onColorSwatchClick: () => h && F(!1),
          attributes: T.attributes,
          fullWidth: M
        })
      })]
    })
  });
});
mr.classes = St.classes;
mr.varsResolver = Qd;
mr.displayName = "@mantine/core/ColorInput";
var ef = {
  root: "m_3eebeb36",
  label: "m_9e365f20"
};
const ry = { orientation: "horizontal" }, tf = ze((e, { color: t, variant: n, size: o }) => ({ root: {
  "--divider-color": t ? at(t, e) : void 0,
  "--divider-border-style": n,
  "--divider-size": _e(o, "divider-size")
} })), Rs = ce((e) => {
  const t = Z("Divider", ry, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, color: l, orientation: u, label: f, labelPosition: h, mod: d, attributes: m, ...g } = t, v = De({
    name: "Divider",
    classes: ef,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: m,
    vars: i,
    varsResolver: tf
  });
  return /* @__PURE__ */ c.jsx(Q, {
    mod: [{
      orientation: u,
      withLabel: !!f
    }, d],
    role: "separator",
    ...v("root"),
    ...g,
    children: f && /* @__PURE__ */ c.jsx(Q, {
      component: "span",
      mod: { position: h },
      ...v("label"),
      children: f
    })
  });
});
Rs.classes = ef;
Rs.varsResolver = tf;
Rs.displayName = "@mantine/core/Divider";
const nf = En((e) => {
  const { onChange: t, children: n, multiple: o, accept: r, name: s, form: a, resetRef: i, disabled: l, capture: u, inputProps: f, ref: h, ...d } = Z("FileButton", null, e), m = p.useRef(null), g = () => {
    !l && m.current?.click();
  }, v = (b) => {
    if (b.currentTarget.files === null) return t(o ? [] : null);
    t(o ? Array.from(b.currentTarget.files) : b.currentTarget.files[0] || null);
  };
  return lu(i, () => {
    m.current && (m.current.value = "");
  }), /* @__PURE__ */ c.jsxs(c.Fragment, { children: [/* @__PURE__ */ c.jsx("input", {
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
nf.displayName = "@mantine/core/FileButton";
const sy = ({ value: e }) => /* @__PURE__ */ c.jsx("div", {
  style: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  children: Array.isArray(e) ? e.map((t) => t.name).join(", ") : e?.name
}), ay = {
  valueComponent: sy,
  size: "sm"
}, Hi = En((e) => {
  const t = Z([
    "Input",
    "InputWrapper",
    "FileInput"
  ], ay, e), { unstyled: n, vars: o, onChange: r, value: s, defaultValue: a, multiple: i, accept: l, name: u, form: f, valueComponent: h, clearable: d, clearSectionMode: m, clearButtonProps: g, readOnly: v, capture: x, fileInputProps: b, rightSection: E, size: S, placeholder: k, component: R, resetRef: T, classNames: C, styles: w, attributes: A, ...$ } = t, z = p.useRef(null), { resolvedClassNames: V, resolvedStyles: B } = ur({
    classNames: C,
    styles: w,
    props: t
  }), [M, O] = Qe({
    value: s,
    defaultValue: a,
    onChange: r,
    finalValue: i ? [] : null
  }), D = Array.isArray(M) ? M.length !== 0 : M !== null, L = /* @__PURE__ */ c.jsx(ai, {
    ...g,
    variant: "subtle",
    onClick: () => O(i ? [] : null),
    size: S,
    unstyled: n
  }), I = d && D && !v;
  return p.useEffect(() => {
    (Array.isArray(M) && M.length === 0 || M === null) && z.current?.();
  }, [M]), /* @__PURE__ */ c.jsx(nf, {
    onChange: O,
    multiple: i,
    accept: l,
    name: u,
    form: f,
    resetRef: Ve(z, T),
    disabled: v,
    capture: x,
    inputProps: b,
    children: (P) => /* @__PURE__ */ c.jsx(St, {
      component: R || "button",
      rightSection: E,
      __clearSection: L,
      __clearable: I,
      __clearSectionMode: m,
      ...P,
      ...$,
      __staticSelector: "FileInput",
      multiline: !0,
      type: "button",
      pointer: !0,
      __stylesApiProps: t,
      unstyled: n,
      size: S,
      classNames: C,
      styles: w,
      attributes: A,
      children: D ? /* @__PURE__ */ c.jsx(h, { value: M }) : /* @__PURE__ */ c.jsx(Rt.Placeholder, {
        __staticSelector: "FileInput",
        classNames: V,
        styles: B,
        attributes: A,
        children: k
      })
    })
  });
});
Hi.classes = St.classes;
Hi.displayName = "@mantine/core/FileInput";
const iy = [
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
], ul = {
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
function dl(e) {
  Object.keys(ul).forEach((t) => {
    e.style.setProperty(t, ul[t], "important");
  });
}
function cy(e) {
  const t = window.getComputedStyle(e);
  if (t === null) return null;
  const n = {};
  for (const o of iy) n[o] = t[o];
  return n.boxSizing === "" ? null : {
    sizingStyle: n,
    paddingSize: parseFloat(n.paddingBottom) + parseFloat(n.paddingTop),
    borderSize: parseFloat(n.borderBottomWidth) + parseFloat(n.borderTopWidth)
  };
}
let Ye = null;
function ly(e, t, n = 1, o = 1 / 0) {
  Ye || (Ye = document.createElement("textarea"), Ye.setAttribute("tabindex", "-1"), Ye.setAttribute("aria-hidden", "true"), Ye.setAttribute("aria-label", "autosize measurement"), dl(Ye)), Ye.parentNode === null && document.body.appendChild(Ye);
  const { paddingSize: r, borderSize: s, sizingStyle: a } = e, { boxSizing: i } = a;
  Object.keys(a).forEach((d) => {
    Ye.style[d] = a[d];
  }), dl(Ye), Ye.value = t;
  let l = i === "border-box" ? Ye.scrollHeight + s : Ye.scrollHeight - r;
  Ye.value = t, l = i === "border-box" ? Ye.scrollHeight + s : Ye.scrollHeight - r, Ye.value = "x";
  const u = Ye.scrollHeight - r;
  let f = u * n;
  i === "border-box" && (f = f + r + s), l = Math.max(f, l);
  let h = u * o;
  return i === "border-box" && (h = h + r + s), l = Math.min(h, l), [l, u];
}
function uy({ maxRows: e, minRows: t, onChange: n, ref: o, ...r }) {
  const s = r.value !== void 0, a = p.useRef(null), i = Ve(a, o), l = p.useRef(0), u = p.useRef(0), f = () => {
    const m = a.current;
    if (!m) return;
    const g = cy(m);
    if (!g) return;
    const [v] = ly(g, m.value || m.placeholder || "x", t, e);
    l.current !== v && (l.current = v, m.style.setProperty("height", `${v}px`, "important"));
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
  }, [s]), /* @__PURE__ */ c.jsx("textarea", {
    rows: t,
    ...r,
    onChange: d,
    ref: i
  });
}
const mo = ce((e) => {
  const { autosize: t, maxRows: n, minRows: o, __staticSelector: r, resize: s, bottomSection: a, bottomSectionProps: i, ...l } = Z([
    "Input",
    "InputWrapper",
    "Textarea"
  ], null, e), u = t && wu() !== "test", f = u ? {
    maxRows: n,
    minRows: o
  } : {};
  return /* @__PURE__ */ c.jsx(St, {
    component: u ? uy : "textarea",
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
mo.classes = St.classes;
mo.displayName = "@mantine/core/Textarea";
function of({ size: e, style: t, ...n }) {
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
const [dy, Po] = Jt("Modal component was not found in tree");
var ln = {
  root: "m_9df02822",
  content: "m_54c44539",
  inner: "m_1f958f16",
  header: "m_d0e2b9cd"
};
const Ns = ce((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ModalBody", null, e), i = Po();
  return /* @__PURE__ */ c.jsx(dd, {
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
const Ts = ce((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ModalCloseButton", null, e), i = Po();
  return /* @__PURE__ */ c.jsx(fd, {
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
const Ps = ce((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, children: a, __hidden: i, ...l } = Z("ModalContent", null, e), u = Po(), f = u.scrollAreaComponent || bv;
  return /* @__PURE__ */ c.jsx(pd, {
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
Ps.classes = ln;
Ps.displayName = "@mantine/core/ModalContent";
const As = ce((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ModalHeader", null, e), i = Po();
  return /* @__PURE__ */ c.jsx(hd, {
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
const Is = ce((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ModalOverlay", null, e), i = Po();
  return /* @__PURE__ */ c.jsx(md, {
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
const fy = {
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
}, rf = ze((e, { radius: t, size: n, yOffset: o, xOffset: r }) => ({ root: {
  "--modal-radius": t === void 0 ? void 0 : Tt(t),
  "--modal-size": _e(n, "modal-size"),
  "--modal-y-offset": Ae(o),
  "--modal-x-offset": Ae(r)
} })), gr = ce((e) => {
  const t = Z("ModalRoot", fy, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, yOffset: l, scrollAreaComponent: u, radius: f, fullScreen: h, centered: d, xOffset: m, __staticSelector: g, attributes: v, ...x } = t, b = De({
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
    varsResolver: rf
  });
  return /* @__PURE__ */ c.jsx(dy, {
    value: {
      yOffset: l,
      scrollAreaComponent: u,
      getStyles: b,
      fullScreen: h
    },
    children: /* @__PURE__ */ c.jsx(ud, {
      ...b("root"),
      "data-full-screen": h || void 0,
      "data-centered": d || void 0,
      "data-offset-scrollbars": u === Nn.Autosize || void 0,
      unstyled: a,
      ...x
    })
  });
});
gr.classes = ln;
gr.varsResolver = rf;
gr.displayName = "@mantine/core/ModalRoot";
const sf = p.createContext(null);
function af({ children: e }) {
  const [t, n] = p.useState([]), [o, r] = p.useState(jo("modal")), [s] = p.useState(() => /* @__PURE__ */ new WeakSet());
  return /* @__PURE__ */ c.jsx(sf, {
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
af.displayName = "@mantine/core/ModalStack";
const Ms = ce((e) => {
  const { classNames: t, className: n, style: o, styles: r, vars: s, ...a } = Z("ModalTitle", null, e), i = Po();
  return /* @__PURE__ */ c.jsx(gd, {
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
const py = {
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
}, pt = ce((e) => {
  const { title: t, withOverlay: n, overlayProps: o, withCloseButton: r, closeButtonProps: s, children: a, radius: i, opened: l, stackId: u, zIndex: f, ...h } = Z("Modal", py, e), d = p.use(sf), m = !!t || r, g = d && u ? {
    closeOnEscape: d.currentId === u,
    trapFocus: d.currentId === u,
    zIndex: d.getZIndex(u),
    __handledEscapeEvents: d.handledEscapeEvents
  } : {}, v = n === !1 ? !1 : u && d ? d.currentId === u : l;
  return p.useEffect(() => {
    d && u && (l ? d.addModal(u, f || jo("modal")) : d.removeModal(u));
  }, [
    l,
    u,
    f
  ]), /* @__PURE__ */ c.jsxs(gr, {
    radius: i,
    opened: l,
    zIndex: d && u ? d.getZIndex(u) : f,
    ...h,
    ...g,
    children: [n && /* @__PURE__ */ c.jsx(Is, {
      visible: v,
      transitionProps: d && u ? { duration: 0 } : void 0,
      ...o
    }), /* @__PURE__ */ c.jsxs(Ps, {
      radius: i,
      __hidden: d && u && l ? u !== d.currentId : !1,
      children: [m && /* @__PURE__ */ c.jsxs(As, { children: [t && /* @__PURE__ */ c.jsx(Ms, { children: t }), r && /* @__PURE__ */ c.jsx(Ts, { ...s })] }), /* @__PURE__ */ c.jsx(Ns, { children: a })]
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
pt.Stack = af;
function hy(e, t) {
  const n = t.trim().toLowerCase();
  if (n === "") return;
  const o = Object.values(e).filter((r) => !r.disabled && r.label.trim().toLowerCase() === n);
  return o.length === 1 ? o[0] : void 0;
}
function my(e) {
  return "group" in e;
}
function Ui({ data: e }) {
  if (my(e)) {
    const r = e.items.map((s) => /* @__PURE__ */ c.jsx(Ui, { data: s }, s.value));
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
Ui.displayName = "@mantine/core/NativeSelectOption";
const gy = {
  size: "sm",
  rightSectionPointerEvents: "none"
}, go = ce((e) => {
  const { data: t, children: n, size: o, error: r, rightSection: s, unstyled: a, ...i } = Z([
    "Input",
    "InputWrapper",
    "NativeSelect"
  ], gy, e), l = Cd(t).map((u, f) => /* @__PURE__ */ c.jsx(Ui, { data: u }, f));
  return /* @__PURE__ */ c.jsx(St, {
    component: "select",
    ...i,
    __staticSelector: "NativeSelect",
    size: o,
    pointer: !0,
    error: r,
    unstyled: a,
    rightSection: s || /* @__PURE__ */ c.jsx(hr, {
      size: o,
      error: r,
      unstyled: a
    }),
    children: n || l
  });
});
go.classes = St.classes;
go.displayName = "@mantine/core/NativeSelect";
function cf(e, t) {
  var n = {};
  for (var o in e)
    Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var r = 0, o = Object.getOwnPropertySymbols(e); r < o.length; r++)
      t.indexOf(o[r]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[r]) && (n[o[r]] = e[o[r]]);
  return n;
}
var vo;
(function(e) {
  e.event = "event", e.props = "prop";
})(vo || (vo = {}));
function mn() {
}
function vy(e) {
  var t, n = void 0;
  return function() {
    for (var o = [], r = arguments.length; r--; ) o[r] = arguments[r];
    return t && o.length === t.length && o.every(function(s, a) {
      return s === t[a];
    }) || (t = o, n = e.apply(void 0, o)), n;
  };
}
function Qo(e) {
  return !!(e || "").match(/\d/);
}
function vn(e) {
  return e == null;
}
function yy(e) {
  return typeof e == "number" && isNaN(e);
}
function lf(e) {
  return vn(e) || yy(e) || typeof e == "number" && !isFinite(e);
}
function uf(e) {
  return e.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
}
function by(e) {
  switch (e) {
    case "lakh":
      return /(\d+?)(?=(\d\d)+(\d)(?!\d))(\.\d+)?/g;
    case "wan":
      return /(\d)(?=(\d{4})+(?!\d))/g;
    default:
      return /(\d)(?=(\d{3})+(?!\d))/g;
  }
}
function wy(e, t, n) {
  var o = by(n), r = e.search(/[1-9]/);
  return r = r === -1 ? e.length : r, e.substring(0, r) + e.substring(r, e.length).replace(o, "$1" + t);
}
function fl(e) {
  var t = p.useRef(e);
  t.current = e;
  var n = p.useRef(function() {
    for (var o = [], r = arguments.length; r--; ) o[r] = arguments[r];
    return t.current.apply(t, o);
  });
  return n.current;
}
function Wi(e, t) {
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
function xy(e) {
  if (!e)
    return e;
  var t = e[0] === "-";
  t && (e = e.substring(1, e.length));
  var n = e.split("."), o = n[0].replace(/^0+/, "") || "0", r = n[1] || "";
  return (t ? "-" : "") + o + (r ? "." + r : "");
}
function df(e, t, n) {
  for (var o = "", r = n ? "0" : "", s = 0; s <= t - 1; s++)
    o += e[s] || r;
  return o;
}
function pl(e, t) {
  return Array(t + 1).join(e);
}
function ff(e) {
  var t = e + "", n = t[0] === "-" ? "-" : "";
  n && (t = t.substring(1));
  var o = t.split(/[eE]/g), r = o[0], s = o[1];
  if (s = Number(s), !s)
    return n + r;
  r = r.replace(".", "");
  var a = 1 + s, i = r.length;
  return a < 0 ? r = "0." + pl("0", Math.abs(a)) + r : a >= i ? r = r + pl("0", a - i) : r = (r.substring(0, a) || "0") + "." + r.substring(a), n + r;
}
function hl(e, t, n) {
  if (["", "-"].indexOf(e) !== -1)
    return e;
  var o = (e.indexOf(".") !== -1 || n) && t, r = Wi(e), s = r.beforeDecimal, a = r.afterDecimal, i = r.hasNegation, l = parseFloat("0." + (a || "0")), u = a.length <= t ? "0." + a : l.toFixed(t), f = u.split("."), h = s;
  s && Number(f[0]) && (h = s.split("").reverse().reduce(function(v, x, b) {
    return v.length > b ? (Number(v[0]) + Number(x)).toString() + v.substring(1, v.length) : x + v;
  }, f[0]));
  var d = df(f[1] || "", t, n), m = i ? "-" : "", g = o ? "." : "";
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
var pf = vy(function(e, t) {
  for (var n = 0, o = 0, r = e.length, s = t.length; e[n] === t[n] && n < r; )
    n++;
  for (; e[r - 1 - o] === t[s - 1 - o] && s - o > n && r - o > n; )
    o++;
  return {
    from: { start: n, end: r - o },
    to: { start: n, end: s - o }
  };
}), Sy = function(e, t) {
  var n = Math.min(e.selectionStart, t);
  return {
    from: { start: n, end: e.selectionEnd },
    to: { start: n, end: t }
  };
};
function Cy(e, t, n) {
  return Math.min(Math.max(e, t), n);
}
function sa(e) {
  return Math.max(e.selectionStart, e.selectionEnd);
}
function jy() {
  return typeof navigator < "u" && !(navigator.platform && /iPhone|iPod/.test(navigator.platform));
}
function ky(e) {
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
function Ey(e) {
  var t = e.currentValue, n = e.formattedValue, o = e.currentValueIndex, r = e.formattedValueIndex;
  return t[o] === n[r];
}
function Ry(e, t, n, o, r, s, a) {
  a === void 0 && (a = Ey);
  var i = r.findIndex(function(k) {
    return k;
  }), l = e.slice(0, i);
  !t && !n.startsWith(l) && (t = l, n = l + n, o = o + l.length);
  for (var u = n.length, f = e.length, h = {}, d = new Array(u), m = 0; m < u; m++) {
    d[m] = -1;
    for (var g = 0, v = f; g < v; g++) {
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
  for (var b = o; b < u && (d[b] === -1 || !s(n[b])); )
    b++;
  var E = b === u || d[b] === -1 ? f : d[b];
  for (b = o - 1; b > 0 && d[b] === -1; )
    b--;
  var S = b === -1 || d[b] === -1 ? 0 : d[b] + 1;
  return S > E ? E : o - S < E - o ? S : E;
}
function ml(e, t, n, o) {
  var r = e.length;
  if (t = Cy(t, 0, r), o === "left") {
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
function Ny(e) {
  for (var t = Array.from({ length: e.length + 1 }).map(function() {
    return !0;
  }), n = 0, o = t.length; n < o; n++)
    t[n] = !!(Qo(e[n]) || Qo(e[n - 1]));
  return t;
}
function hf(e, t, n, o, r, s) {
  s === void 0 && (s = mn);
  var a = fl(function(g, v) {
    var x, b;
    return lf(g) ? (b = "", x = "") : typeof g == "number" || v ? (b = typeof g == "number" ? ff(g) : g, x = o(b)) : (b = r(g, void 0), x = o(b)), { formattedValue: x, numAsString: b };
  }), i = p.useState(function() {
    return a(vn(e) ? t : e, n);
  }), l = i[0], u = i[1], f = fl(function(g, v) {
    g.formattedValue !== l.formattedValue && u({
      formattedValue: g.formattedValue,
      numAsString: g.value
    }), s(g, v);
  }), h = e, d = n;
  vn(e) && (h = l.numAsString, d = !0);
  var m = a(h, d);
  return p.useMemo(function() {
    u(m);
  }, [m.formattedValue]), p.useEffect(function() {
    if (!vn(t) && vn(e) && l.formattedValue !== "") {
      var g = parseFloat(l.numAsString);
      f({
        formattedValue: l.formattedValue,
        value: l.numAsString,
        floatValue: isNaN(g) ? void 0 : g
      }, { event: void 0, source: vo.props });
    }
  }, []), [l, f];
}
function Ty(e) {
  return e.replace(/[^0-9]/g, "");
}
function Py(e) {
  return e;
}
function Ay(e) {
  var t = e.type;
  t === void 0 && (t = "text");
  var n = e.displayType;
  n === void 0 && (n = "input");
  var o = e.customInput, r = e.renderText, s = e.getInputRef, a = e.format;
  a === void 0 && (a = Py);
  var i = e.removeFormatting;
  i === void 0 && (i = Ty);
  var l = e.defaultValue, u = e.valueIsNumericString, f = e.onValueChange, h = e.isAllowed, d = e.onChange;
  d === void 0 && (d = mn);
  var m = e.onKeyDown;
  m === void 0 && (m = mn);
  var g = e.onMouseUp;
  g === void 0 && (g = mn);
  var v = e.onFocus;
  v === void 0 && (v = mn);
  var x = e.onBlur;
  x === void 0 && (x = mn);
  var b = e.value, E = e.getCaretBoundary;
  E === void 0 && (E = Ny);
  var S = e.isValidInputCharacter;
  S === void 0 && (S = Qo);
  var k = e.isCharacterSame, R = cf(e, ["type", "displayType", "customInput", "renderText", "getInputRef", "format", "removeFormatting", "defaultValue", "valueIsNumericString", "onValueChange", "isAllowed", "onChange", "onKeyDown", "onMouseUp", "onFocus", "onBlur", "value", "getCaretBoundary", "isValidInputCharacter", "isCharacterSame"]), T = hf(b, l, !!u, a, i, f), C = T[0], w = C.formattedValue, A = C.numAsString, $ = T[1], z = p.useRef(), V = p.useRef({ formattedValue: w, numAsString: A }), B = function(H, Y) {
    V.current = { formattedValue: H.formattedValue, numAsString: H.value }, $(H, Y);
  }, M = p.useState(!1), O = M[0], D = M[1], L = p.useRef(null), I = p.useRef({
    setCaretTimeout: null,
    focusTimeout: null
  });
  p.useEffect(function() {
    return D(!0), function() {
      clearTimeout(I.current.setCaretTimeout), clearTimeout(I.current.focusTimeout);
    };
  }, []);
  var P = a, F = function(H, Y) {
    var ue = parseFloat(Y);
    return {
      formattedValue: H,
      value: Y,
      floatValue: isNaN(ue) ? void 0 : ue
    };
  }, _ = function(H, Y, ue) {
    H.selectionStart === 0 && H.selectionEnd === H.value.length || (In(H, Y), I.current.setCaretTimeout = setTimeout(function() {
      H.value === ue && H.selectionStart !== Y && In(H, Y);
    }, 0));
  }, U = function(H, Y, ue) {
    return ml(H, Y, E(H), ue);
  }, X = function(H, Y, ue) {
    var Ee = E(Y), Ie = Ry(Y, w, H, ue, Ee, S, k);
    return Ie = ml(Y, Ie, Ee), Ie;
  }, ne = function(H) {
    var Y = H.formattedValue;
    Y === void 0 && (Y = "");
    var ue = H.input, Ee = H.source, Ie = H.event, ge = H.numAsString, ve;
    if (ue) {
      var Se = H.inputValue || ue.value, Oe = sa(ue);
      ue.value = Y, ve = X(Se, Y, Oe), ve !== void 0 && _(ue, ve, Y);
    }
    Y !== w && B(F(Y, ge), { event: Ie, source: Ee });
  };
  p.useEffect(function() {
    var H = V.current, Y = H.formattedValue, ue = H.numAsString;
    (w !== Y || A !== ue) && B(F(w, A), {
      event: void 0,
      source: vo.props
    });
  }, [w, A]);
  var de = L.current ? sa(L.current) : void 0, oe = typeof window < "u" ? p.useLayoutEffect : p.useEffect;
  oe(function() {
    var H = L.current;
    if (w !== V.current.formattedValue && H) {
      var Y = X(V.current.formattedValue, w, de);
      H.value = w, _(H, Y, w);
    }
  }, [w]);
  var te = function(H, Y, ue) {
    var Ee = Y.target, Ie = z.current ? Sy(z.current, Ee.selectionEnd) : pf(w, H), ge = Object.assign(Object.assign({}, Ie), { lastValue: w }), ve = i(H, ge), Se = P(ve);
    if (ve = i(Se, void 0), h && !h(F(Se, ve))) {
      var Oe = Y.target, pe = sa(Oe), vt = X(H, w, pe);
      return Oe.value = w, _(Oe, vt, w), !1;
    }
    return ne({
      formattedValue: Se,
      numAsString: ve,
      inputValue: H,
      event: Y,
      source: ue,
      input: Y.target
    }), !0;
  }, fe = function(H, Y) {
    Y === void 0 && (Y = 0);
    var ue = H.selectionStart, Ee = H.selectionEnd;
    z.current = { selectionStart: ue, selectionEnd: Ee + Y };
  }, K = function(H) {
    var Y = H.target, ue = Y.value, Ee = te(ue, H, vo.event);
    Ee && d(H), z.current = void 0;
  }, q = function(H) {
    var Y = H.target, ue = H.key, Ee = Y.selectionStart, Ie = Y.selectionEnd, ge = Y.value;
    ge === void 0 && (ge = "");
    var ve;
    ue === "ArrowLeft" || ue === "Backspace" ? ve = Math.max(Ee - 1, 0) : ue === "ArrowRight" ? ve = Math.min(Ee + 1, ge.length) : ue === "Delete" && (ve = Ee);
    var Se = 0;
    ue === "Delete" && Ee === Ie && (Se = 1);
    var Oe = ue === "ArrowLeft" || ue === "ArrowRight";
    if (ve === void 0 || Ee !== Ie && !Oe) {
      m(H), fe(Y, Se);
      return;
    }
    var pe = ve;
    if (Oe) {
      var vt = ue === "ArrowLeft" ? "left" : "right";
      pe = U(ge, ve, vt), pe !== ve && H.preventDefault();
    } else ue === "Delete" && !S(ge[ve]) ? pe = U(ge, ve, "right") : ue === "Backspace" && !S(ge[ve]) && (pe = U(ge, ve, "left"));
    pe !== ve && _(Y, pe, ge), m(H), fe(Y, Se);
  }, ae = function(H) {
    var Y = H.target, ue = function() {
      var Ee = Y.selectionStart, Ie = Y.selectionEnd, ge = Y.value;
      if (ge === void 0 && (ge = ""), Ee === Ie) {
        var ve = U(ge, Ee);
        ve !== Ee && _(Y, ve, ge);
      }
    };
    ue(), requestAnimationFrame(function() {
      ue();
    }), g(H), fe(Y);
  }, be = function(H) {
    H.persist && H.persist();
    var Y = H.target, ue = H.currentTarget;
    L.current = Y, I.current.focusTimeout = setTimeout(function() {
      var Ee = Y.selectionStart, Ie = Y.selectionEnd, ge = Y.value;
      ge === void 0 && (ge = "");
      var ve = U(ge, Ee);
      ve !== Ee && !(Ee === 0 && Ie === ge.length) && _(Y, ve, ge), v(Object.assign(Object.assign({}, H), { currentTarget: ue }));
    }, 0);
  }, he = function(H) {
    L.current = null, clearTimeout(I.current.focusTimeout), clearTimeout(I.current.setCaretTimeout), x(H);
  }, ke = O && jy() ? "numeric" : void 0, re = Object.assign({ inputMode: ke }, R, {
    type: t,
    value: w,
    onChange: K,
    onKeyDown: q,
    onMouseUp: ae,
    onFocus: be,
    onBlur: he
  });
  if (n === "text")
    return r ? hn.createElement(hn.Fragment, null, r(w, R) || null) : hn.createElement("span", Object.assign({}, R, { ref: s }), w);
  if (o) {
    var W = o;
    return hn.createElement(W, Object.assign({}, re, { ref: s }));
  }
  return hn.createElement("input", Object.assign({}, re, { ref: s }));
}
function gl(e, t) {
  var n = t.decimalScale, o = t.fixedDecimalScale, r = t.prefix;
  r === void 0 && (r = "");
  var s = t.suffix;
  s === void 0 && (s = "");
  var a = t.allowNegative, i = t.thousandsGroupStyle;
  if (i === void 0 && (i = "thousand"), e === "" || e === "-")
    return e;
  var l = Ds(t), u = l.thousandSeparator, f = l.decimalSeparator, h = n !== 0 && e.indexOf(".") !== -1 || n && o, d = Wi(e, a), m = d.beforeDecimal, g = d.afterDecimal, v = d.addNegation;
  return n !== void 0 && (g = df(g, n, !!o)), u && (m = wy(m, u, i)), r && (m = r + m), s && (g = g + s), v && (m = "-" + m), e = m + (h && f || "") + g, e;
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
function Iy(e, t) {
  e === void 0 && (e = "");
  var n = new RegExp("(-)"), o = new RegExp("(-)(.)*(-)"), r = n.test(e), s = o.test(e);
  return e = e.replace(/-/g, ""), r && !s && t && (e = "-" + e), e;
}
function My(e, t) {
  return new RegExp("(^-)|[0-9]|" + uf(e), "g");
}
function Dy(e, t, n) {
  return e === "" ? !0 : !t?.match(/\d/) && !n?.match(/\d/) && typeof e == "string" && !isNaN(Number(e));
}
function Oy(e, t, n) {
  var o;
  t === void 0 && (t = ky(e));
  var r = n.allowNegative, s = n.prefix;
  s === void 0 && (s = "");
  var a = n.suffix;
  a === void 0 && (a = "");
  var i = n.decimalScale, l = t.from, u = t.to, f = u.start, h = u.end, d = Ds(n), m = d.allowedDecimalSeparators, g = d.decimalSeparator, v = e[h] === g;
  if (Qo(e) && (e === s || e === a) && t.lastValue === "")
    return e;
  if (h - f === 1 && m.indexOf(e[f]) !== -1) {
    var x = i === 0 ? "" : g;
    e = e.substring(0, f) + x + e.substring(f + 1, e.length);
  }
  var b = function(L, I, P) {
    var F = !1, _ = !1;
    s.startsWith("-") ? F = !1 : L.startsWith("--") ? (F = !1, _ = !0) : a.startsWith("-") && L.length === a.length ? F = !1 : L[0] === "-" && (F = !0);
    var U = F ? 1 : 0;
    return _ && (U = 2), U && (L = L.substring(U), I -= U, P -= U), { value: L, start: I, end: P, hasNegation: F };
  }, E = b(e, f, h), S = E.hasNegation;
  o = E, e = o.value, f = o.start, h = o.end;
  var k = b(t.lastValue, l.start, l.end), R = k.start, T = k.end, C = k.value, w = e.substring(f, h);
  e.length && C.length && (R > C.length - a.length || T < s.length) && !(w && a.startsWith(w)) && (e = C);
  var A = 0;
  e.startsWith(s) ? A += s.length : f < s.length && (A = f), e = e.substring(A), h -= A;
  var $ = e.length, z = e.length - a.length;
  e.endsWith(a) ? $ = z : (h > z || h > e.length - a.length) && ($ = h), e = e.substring(0, $), e = Iy(S ? "-" + e : e, r), e = (e.match(My(g)) || []).join("");
  var V = e.indexOf(g);
  e = e.replace(new RegExp(uf(g), "g"), function(L, I) {
    return I === V ? "." : "";
  });
  var B = Wi(e, r), M = B.beforeDecimal, O = B.afterDecimal, D = B.addNegation;
  return u.end - u.start < l.end - l.start && M === "" && v && !parseFloat(O) && (e = D ? "-" : ""), e;
}
function $y(e, t) {
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
function Ly(e) {
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
function zy(e) {
  e = Ly(e), e.decimalSeparator, e.allowedDecimalSeparators, e.thousandsGroupStyle;
  var t = e.suffix, n = e.allowNegative, o = e.allowLeadingZeros, r = e.onKeyDown;
  r === void 0 && (r = mn);
  var s = e.onBlur;
  s === void 0 && (s = mn);
  var a = e.thousandSeparator, i = e.decimalScale, l = e.fixedDecimalScale, u = e.prefix;
  u === void 0 && (u = "");
  var f = e.defaultValue, h = e.value, d = e.valueIsNumericString, m = e.onValueChange, g = cf(e, ["decimalSeparator", "allowedDecimalSeparators", "thousandsGroupStyle", "suffix", "allowNegative", "allowLeadingZeros", "onKeyDown", "onBlur", "thousandSeparator", "decimalScale", "fixedDecimalScale", "prefix", "defaultValue", "value", "valueIsNumericString", "onValueChange"]), v = Ds(e), x = v.decimalSeparator, b = v.allowedDecimalSeparators, E = function(D) {
    return gl(D, e);
  }, S = function(D, L) {
    return Oy(D, L, e);
  }, k = vn(h) ? f : h, R = d ?? Dy(k, u, t);
  vn(h) ? vn(f) || (R = R || typeof f == "number") : R = R || typeof h == "number";
  var T = function(D) {
    return lf(D) ? D : (typeof D == "number" && (D = ff(D)), R && typeof i == "number" ? hl(D, i, !!l) : D);
  }, C = hf(T(h), T(f), !!R, E, S, m), w = C[0], A = w.numAsString, $ = w.formattedValue, z = C[1], V = function(D) {
    var L = D.target, I = D.key, P = L.selectionStart, F = L.selectionEnd, _ = L.value;
    if (_ === void 0 && (_ = ""), (I === "Backspace" || I === "Delete") && F < u.length && _ !== "-") {
      D.preventDefault();
      return;
    }
    if (P !== F) {
      r(D);
      return;
    }
    I === "Backspace" && _[0] === "-" && P === u.length + 1 && n && In(L, 1), i && l && (I === "Backspace" && _[P - 1] === x ? (In(L, P - 1), D.preventDefault()) : I === "Delete" && _[P] === x && D.preventDefault()), b?.includes(I) && _[P] === x && In(L, P + 1);
    var U = a === !0 ? "," : a;
    I === "Backspace" && _[P - 1] === U && In(L, P - 1), I === "Delete" && _[P] === U && In(L, P + 1), r(D);
  }, B = function(D) {
    var L = A;
    if (L.match(/\d/g) || (L = ""), o || (L = xy(L)), l && i && (L = hl(L, i, l)), L !== A) {
      var I = gl(L, e);
      z({
        formattedValue: I,
        value: L,
        floatValue: parseFloat(L)
      }, {
        event: D,
        source: vo.event
      });
    }
    s(D);
  }, M = function(D) {
    return D === x ? !0 : Qo(D);
  }, O = function(D) {
    var L = D.currentValue, I = D.lastValue, P = D.formattedValue, F = D.currentValueIndex, _ = D.formattedValueIndex, U = L[F], X = P[_], ne = pf(I, L), de = ne.to, oe = function(te) {
      return S(te).indexOf(".") + u.length;
    };
    return h === 0 && l && i && L[de.start] === x && oe(L) < F && oe(P) > _ ? !1 : F >= de.start && F < de.end && b && b.includes(U) && X === x ? !0 : U === X;
  };
  return Object.assign(Object.assign({}, g), {
    value: $,
    valueIsNumericString: !1,
    isValidInputCharacter: M,
    isCharacterSame: O,
    onValueChange: z,
    format: E,
    removeFormatting: S,
    getCaretBoundary: function(D) {
      return $y(D, e);
    },
    onKeyDown: V,
    onBlur: B
  });
}
function _y(e) {
  var t = zy(e);
  return hn.createElement(Ay, Object.assign({}, t));
}
function vl(e, t) {
  return /\d/.test(e) || e === t;
}
function Fy(e, t, n, o) {
  let r = 0;
  for (let s = 0; s < t && s < e.length; s += 1) vl(e[s], o) && (r += 1);
  if (r === 0) return Math.min(t, n.length);
  for (let s = 0; s < n.length; s += 1) if (vl(n[s], o) && (r -= 1, r === 0))
    return s + 1;
  return n.length;
}
function By(e, t) {
  let n = 0;
  for (; t + n < e.length && /\d/.test(e[t + n]); ) n += 1;
  return n;
}
function Vy(e, { decimalSeparator: t, thousandSeparator: n, allowedDecimalSeparators: o, thousandsGroupStyle: r }) {
  const s = new Set([...o, t].filter((m) => m.length === 1)), a = e.split(""), i = a.reduce((m, g, v) => (s.has(g) && m.push(v), m), []);
  if (i.length === 0) return e;
  const l = i[i.length - 1], u = a[l], f = i.filter((m) => a[m] === u).length, h = r === "wan" ? 4 : 3;
  let d = -1;
  return f === 1 && (u === t ? d = l : u === n ? d = By(e, l + 1) === h ? -1 : l : d = l), a.map((m, g) => g === d ? t : s.has(m) && m !== n ? "" : m).join("");
}
function yl({ direction: e, style: t, ...n }) {
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
var Ma = {
  root: "m_e2f5cd4e",
  controls: "m_95e17d22",
  control: "m_80b4b171"
};
const Hy = /^(0\.0*|-0(\.0*)?)$/, bl = /^-?0\d+(\.\d+)?\.?$/, Uy = /\.\d*0$/, mf = /^-?\d+\.$/;
function Da(e) {
  return typeof e == "string" && e !== "" && !Number.isNaN(Number(e));
}
function aa(e) {
  return typeof e == "bigint";
}
function ia(e) {
  return typeof e == "number" ? e < Number.MAX_SAFE_INTEGER : e === "" || Da(e) && Number(e) < Number.MAX_SAFE_INTEGER;
}
function gf(e, t) {
  return e === "" || e === "-" || !t && e.startsWith("-") ? !1 : /^-?\d+$/.test(e);
}
function ca(e, t) {
  return typeof e == "bigint" ? !0 : e === "" || gf(e, t);
}
function Fo(e) {
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
function Wy(e) {
  return e.toString().replace(".", "").length;
}
function qy(e, t) {
  return (typeof e == "number" ? e < Number.MAX_SAFE_INTEGER : !Number.isNaN(Number(e))) && !Number.isNaN(e) && Wy(t) < 14 && t !== "";
}
function Ky(e, t, n) {
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
}, vf = ze((e, { size: t }) => ({ controls: { "--ni-chevron-size": _e(t, "ni-chevron-size") } }));
function wl(e, t) {
  return t ? `${e}.` : e;
}
function Xy(e, t) {
  const n = mf.test(e), o = t.trim ? e.replace(/^0+(?=\d)/, "") : e, r = parseFloat(o);
  if (Number.isNaN(r)) return o;
  if (!t.clamp) return t.trim ? wl(r, n) : e;
  const s = r > Number.MAX_SAFE_INTEGER && t.max !== void 0 ? t.max : wn(r, t.min, t.max);
  return !t.trim && s === r ? e : wl(s, n);
}
function Yy(e, t) {
  if (e === "" || e === "-") return e;
  const n = Fo(e);
  return n === null ? e : t.clampBehavior === "blur" ? Fr(n, t.min, t.max) : n;
}
const yo = En((e) => {
  const t = Z([
    "Input",
    "InputWrapper",
    "NumberInput"
  ], la, e), { className: n, classNames: o, styles: r, unstyled: s, vars: a, onChange: i, onValueChange: l, value: u, defaultValue: f, max: h, min: d, step: m, hideControls: g, rightSection: v, isAllowed: x, clampBehavior: b, onBlur: E, allowDecimal: S, decimalScale: k, onKeyDown: R, onKeyDownCapture: T, handlersRef: C, startValue: w, disabled: A, rightSectionPointerEvents: $, allowNegative: z, readOnly: V, size: B, rightSectionWidth: M, stepHoldInterval: O, stepHoldDelay: D, allowLeadingZeros: L, withKeyboardEvents: I, trimLeadingZeroesOnBlur: P, allowedDecimalSeparators: F, selectAllOnFocus: _, onMinReached: U, onMaxReached: X, onFocus: ne, attributes: de, ref: oe, ...te } = t, fe = z ?? !0, K = L ?? !0, q = De({
    name: "NumberInput",
    classes: Ma,
    props: t,
    classNames: o,
    styles: r,
    unstyled: s,
    attributes: de,
    vars: a,
    varsResolver: vf
  }), { resolvedClassNames: ae, resolvedStyles: be } = ur({
    classNames: o,
    styles: r,
    props: t
  }), he = p.useRef(aa(u) || aa(f) ? "bigint" : "number");
  aa(u) ? he.current = "bigint" : typeof u == "number" && (he.current = "number");
  const ke = he.current === "bigint", [re, W] = Qe({
    value: u,
    defaultValue: f,
    finalValue: "",
    onChange: i
  }), H = D !== void 0 && O !== void 0, Y = p.useRef(null), ue = p.useRef(null), Ee = p.useRef(0), Ie = typeof d == "number" ? d : void 0, ge = typeof h == "number" ? h : void 0, ve = typeof m == "number" ? m : la.step, Se = typeof w == "number" ? w : la.startValue, Oe = Mr(d), pe = Mr(h), vt = Mr(m) ?? BigInt(1), Te = Mr(w) ?? BigInt(0), yt = (G) => !gf(G, fe) || K && bl.test(G) ? G : Fo(G) ?? G, qn = (G) => {
    const ie = Number(G);
    return Number.isSafeInteger(ie) ? ie : void 0;
  }, It = (G, ie) => {
    ie.source === "event" && W(ke ? yt(G.value) : qy(G.floatValue, G.value) && !Hy.test(G.value) && !(K && bl.test(G.value)) && !Uy.test(G.value) && !mf.test(G.value) ? G.floatValue : G.value), l?.(G, ie);
  }, un = (G) => {
    const ie = String(G).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    return ie ? Math.max(0, (ie[1] ? ie[1].length : 0) - (ie[2] ? +ie[2] : 0)) : 0;
  }, Mt = (G) => {
    Y.current && typeof G < "u" && Y.current.setSelectionRange(G, G);
  }, Kn = p.useRef(Kr);
  Kn.current = () => {
    if (ke) {
      if (!ca(re, fe)) return;
      let Ke;
      const Xe = re;
      if (typeof Xe == "bigint") {
        const it = Xe + vt;
        pe !== void 0 && it > pe && X?.(), Ke = pe !== void 0 && it > pe ? pe : it;
      } else if (typeof Xe == "string" && Xe !== "") {
        const it = Fo(Xe);
        if (it === null) return;
        const fn = it + vt;
        pe !== void 0 && fn > pe && X?.(), Ke = pe !== void 0 && fn > pe ? pe : fn;
      } else Ke = Fr(Te, Oe, pe);
      const Ze = Ke.toString();
      W(Ke), l?.({
        floatValue: qn(Ke),
        formattedValue: Ze,
        value: Ze
      }, { source: "increment" }), setTimeout(() => Mt(Y.current?.value.length), 0);
      return;
    }
    if (!ia(re)) return;
    let G;
    const ie = un(re), Yn = un(ve), Gn = Math.max(ie, Yn), bt = 10 ** Gn;
    if (!Da(re) && (typeof re != "number" || Number.isNaN(re))) G = wn(Se, Ie, ge);
    else if (ge !== void 0) {
      const Ke = (Math.round(Number(re) * bt) + Math.round(ve * bt)) / bt;
      Ke > ge && X?.(), G = Ke <= ge ? Ke : ge;
    } else G = (Math.round(Number(re) * bt) + Math.round(ve * bt)) / bt;
    const nt = G.toFixed(Gn);
    W(parseFloat(nt)), l?.({
      floatValue: parseFloat(nt),
      formattedValue: nt,
      value: nt
    }, { source: "increment" }), setTimeout(() => Mt(Y.current?.value.length), 0);
  };
  const Xn = p.useRef(Kr);
  Xn.current = () => {
    if (ke) {
      if (!ca(re, fe)) return;
      let Xe;
      const Ze = Oe !== void 0 ? Oe : fe ? void 0 : BigInt(0), it = re;
      if (typeof it == "bigint") {
        const Jn = it - vt;
        Ze !== void 0 && Jn < Ze && U?.(), Xe = Ze !== void 0 && Jn < Ze ? Ze : Jn;
      } else if (typeof it == "string" && it !== "") {
        const Jn = Fo(it);
        if (Jn === null) return;
        const Ys = Jn - vt;
        Ze !== void 0 && Ys < Ze && U?.(), Xe = Ze !== void 0 && Ys < Ze ? Ze : Ys;
      } else Xe = Fr(Te, Ze, pe);
      const fn = Xe.toString();
      W(Xe), l?.({
        floatValue: qn(Xe),
        formattedValue: fn,
        value: fn
      }, { source: "decrement" }), setTimeout(() => Mt(Y.current?.value.length), 0);
      return;
    }
    if (!ia(re)) return;
    let G;
    const ie = Ie !== void 0 ? Ie : fe ? Number.MIN_SAFE_INTEGER : 0, Yn = un(re), Gn = un(ve), bt = Math.max(Yn, Gn), nt = 10 ** bt;
    if (!Da(re) && typeof re != "number" || Number.isNaN(re)) G = wn(Se, ie, ge);
    else {
      const Xe = (Math.round(Number(re) * nt) - Math.round(ve * nt)) / nt;
      ie !== void 0 && Xe < ie && U?.(), G = ie !== void 0 && Xe < ie ? ie : Xe;
    }
    const Ke = G.toFixed(bt);
    W(parseFloat(Ke)), l?.({
      floatValue: parseFloat(Ke),
      formattedValue: Ke,
      value: Ke
    }, { source: "decrement" }), setTimeout(() => Mt(Y.current?.value.length), 0);
  };
  const et = (G) => {
    const ie = G.clipboardData.getData("text"), Yn = te.decimalSeparator || ".", Gn = te.thousandSeparator === !0 ? "," : te.thousandSeparator === !1 ? void 0 : te.thousandSeparator, bt = Vy(ie, {
      decimalSeparator: Yn,
      thousandSeparator: Gn,
      allowedDecimalSeparators: F || [".", ","],
      thousandsGroupStyle: te.thousandsGroupStyle
    });
    if (bt !== ie) {
      G.preventDefault();
      const nt = Y.current;
      if (nt) {
        const Ke = nt.selectionStart ?? 0, Xe = nt.selectionEnd ?? 0, Ze = nt.value, it = Ze.substring(0, Ke) + bt + Ze.substring(Xe);
        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set?.call(nt, it), nt.dispatchEvent(new Event("change", { bubbles: !0 }));
        const fn = Ke + bt.length;
        setTimeout(() => Mt(Fy(it, fn, nt.value, Yn)), 0);
      }
    }
    te.onPaste?.(G);
  }, Ht = (G) => {
    R?.(G), !(V || !I) && (G.key === "ArrowUp" && (G.preventDefault(), Kn.current?.()), G.key === "ArrowDown" && (G.preventDefault(), Xn.current?.()));
  }, Rr = (G) => {
    if (T?.(G), G.key === "Backspace") {
      const ie = Y.current;
      ie && ie.selectionStart === 0 && ie.selectionStart === ie.selectionEnd && (G.preventDefault(), window.setTimeout(() => Mt(0), 0));
    }
  }, Nr = (G) => {
    _ && window.setTimeout(() => Y.current?.select(), 0), ne?.(G);
  }, Xs = (G) => {
    let ie = re;
    ke ? (b === "blur" && typeof ie == "bigint" && (ie = Fr(ie, Oe, pe)), P && typeof ie == "string" && (ie = Yy(ie, {
      min: Oe,
      max: pe,
      clampBehavior: b
    }))) : typeof ie == "number" ? b === "blur" && (ie = wn(ie, Ie, ge)) : typeof ie == "string" && (ie = Xy(ie, {
      min: Ie,
      max: ge,
      trim: !!P && un(ie) < 15,
      clamp: b === "blur"
    })), re !== ie && W(ie), E?.(G);
  };
  lu(C, {
    increment: Kn.current,
    decrement: Xn.current
  });
  const Tr = (G) => {
    G ? Kn.current?.() : Xn.current?.(), Ee.current += 1;
  }, qe = (G) => {
    if (Tr(G), H) {
      const ie = typeof O == "number" ? O : O(Ee.current);
      ue.current = window.setTimeout(() => qe(G), ie);
    }
  }, tt = (G, ie) => {
    G.preventDefault(), Y.current?.focus(), Tr(ie), H && (ue.current = window.setTimeout(() => qe(ie), D));
  }, dn = () => {
    ue.current && window.clearTimeout(ue.current), ue.current = null, Ee.current = 0;
  }, Op = /* @__PURE__ */ c.jsxs("div", {
    ...q("controls"),
    children: [/* @__PURE__ */ c.jsx(zn, {
      ...q("control"),
      tabIndex: -1,
      "aria-hidden": !0,
      disabled: A || typeof re == "number" && ge !== void 0 && re >= ge || typeof re == "bigint" && pe !== void 0 && re >= pe,
      mod: { direction: "up" },
      onMouseDown: (G) => G.preventDefault(),
      onPointerDown: (G) => {
        tt(G, !0);
      },
      onPointerUp: dn,
      onPointerLeave: dn,
      children: /* @__PURE__ */ c.jsx(yl, { direction: "up" })
    }), /* @__PURE__ */ c.jsx(zn, {
      ...q("control"),
      tabIndex: -1,
      "aria-hidden": !0,
      disabled: A || typeof re == "number" && Ie !== void 0 && re <= Ie || typeof re == "bigint" && Oe !== void 0 && re <= Oe,
      mod: { direction: "down" },
      onMouseDown: (G) => G.preventDefault(),
      onPointerDown: (G) => {
        tt(G, !1);
      },
      onPointerUp: dn,
      onPointerLeave: dn,
      children: /* @__PURE__ */ c.jsx(yl, { direction: "down" })
    })]
  });
  return /* @__PURE__ */ c.jsx(St, {
    component: _y,
    allowNegative: z,
    className: rn(Ma.root, n),
    size: B,
    ...te,
    inputMode: ke ? "numeric" : "decimal",
    readOnly: V,
    disabled: A,
    value: typeof re == "bigint" ? re.toString() : re,
    getInputRef: Ve(oe, Y),
    onValueChange: It,
    rightSection: g || V || !(ke ? ca(re, fe) : ia(re)) ? v : v || Op,
    classNames: ae,
    styles: be,
    unstyled: s,
    __staticSelector: "NumberInput",
    decimalScale: ke ? 0 : S ? k : 0,
    onPaste: et,
    onFocus: Nr,
    onKeyDown: Ht,
    onKeyDownCapture: Rr,
    rightSectionPointerEvents: $ ?? (A ? "none" : void 0),
    rightSectionWidth: M ?? `var(--ni-right-section-width-${B || "sm"})`,
    allowLeadingZeros: L,
    allowedDecimalSeparators: F,
    onBlur: Xs,
    attributes: de,
    isAllowed: (G) => {
      if (!(!x || x(G))) return !1;
      if (b !== "strict") return !0;
      if (!ke) return Ky(G.floatValue, Ie, ge);
      if (G.value === "" || G.value === "-") return !0;
      const ie = Fo(G.value);
      return ie === null ? !0 : (Oe === void 0 || ie >= Oe) && (pe === void 0 || ie <= pe);
    }
  });
});
yo.classes = {
  ...St.classes,
  ...Ma
};
yo.varsResolver = vf;
yo.displayName = "@mantine/core/NumberInput";
const qi = p.createContext(null), Ki = En(((e) => {
  const { value: t, defaultValue: n, onChange: o, size: r, wrapperProps: s, children: a, name: i, readOnly: l, disabled: u, ...f } = Z("RadioGroup", null, e), h = Vt(i), [d, m] = Qe({
    value: t,
    defaultValue: n,
    finalValue: "",
    onChange: o
  }), g = (v) => !l && m(typeof v == "string" ? v : v.currentTarget.value);
  return /* @__PURE__ */ c.jsx(qi, {
    value: {
      value: d,
      onChange: g,
      size: r,
      name: h,
      disabled: u
    },
    children: /* @__PURE__ */ c.jsx(Rt.Wrapper, {
      size: r,
      ...s,
      ...f,
      labelElement: "div",
      __staticSelector: "RadioGroup",
      children: /* @__PURE__ */ c.jsx(Id, {
        role: "radiogroup",
        children: a
      })
    })
  });
}));
Ki.classes = Rt.Wrapper.classes;
Ki.displayName = "@mantine/core/RadioGroup";
var yf = { card: "m_9dc8ae12" };
const bf = p.createContext(null), Gy = { withBorder: !0 }, wf = ze((e, { radius: t }) => ({ card: { "--card-radius": Tt(t) } })), Os = ce((e) => {
  const t = Z("RadioCard", Gy, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, checked: l, mod: u, withBorder: f, value: h, onClick: d, name: m, onKeyDown: g, attributes: v, ...x } = t, b = De({
    name: "RadioCard",
    classes: yf,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: v,
    vars: i,
    varsResolver: wf,
    rootSelector: "card"
  }), { dir: E } = ko(), S = p.use(qi), k = typeof l == "boolean" ? l : S?.value === h || !1, R = m || S?.name, T = (C) => {
    if (g?.(C), !!R && [
      "ArrowDown",
      "ArrowUp",
      "ArrowLeft",
      "ArrowRight"
    ].includes(C.nativeEvent.code)) {
      C.preventDefault();
      const w = Array.from(document.querySelectorAll(`[role="radio"][name="${R}"]`)), A = w.findIndex((V) => V === C.target), $ = A + 1 >= w.length ? 0 : A + 1, z = A - 1 < 0 ? w.length - 1 : A - 1;
      C.nativeEvent.code === "ArrowDown" && (w[$].focus(), w[$].click()), C.nativeEvent.code === "ArrowUp" && (w[z].focus(), w[z].click()), C.nativeEvent.code === "ArrowLeft" && (w[E === "ltr" ? z : $].focus(), w[E === "ltr" ? z : $].click()), C.nativeEvent.code === "ArrowRight" && (w[E === "ltr" ? $ : z].focus(), w[E === "ltr" ? $ : z].click());
    }
  };
  return /* @__PURE__ */ c.jsx(bf, {
    value: { checked: k },
    children: /* @__PURE__ */ c.jsx(zn, {
      mod: [{
        "with-border": f,
        checked: k
      }, u],
      ...b("card"),
      ...x,
      role: "radio",
      "aria-checked": k,
      name: R,
      onClick: (C) => {
        d?.(C), S?.onChange(h || "");
      },
      onKeyDown: T
    })
  });
});
Os.displayName = "@mantine/core/RadioCard";
Os.classes = yf;
Os.varsResolver = wf;
var xf = {
  indicator: "m_717d7ff6",
  icon: "m_3e4da632",
  "indicator--outline": "m_2980836c"
};
const Jy = { icon: of }, Sf = ze((e, { radius: t, color: n, size: o, iconColor: r, variant: s, autoContrast: a }) => {
  const i = ls({
    color: n || e.primaryColor,
    theme: e
  }), l = i.isThemeColor && i.shade === void 0 ? `var(--mantine-color-${i.color}-outline)` : i.color;
  return { indicator: {
    "--radio-size": _e(o, "radio-size"),
    "--radio-radius": t === void 0 ? void 0 : Tt(t),
    "--radio-color": s === "outline" ? l : at(n, e),
    "--radio-icon-size": typeof o == "number" ? `calc(${_e(o, "radio-size")} * 0.4)` : _e(o, "radio-icon-size"),
    "--radio-icon-color": r ? at(r, e) : fr(a, e) ? Co({
      color: n,
      theme: e,
      autoContrast: a
    }) : void 0
  } };
}), $s = ce((e) => {
  const t = Z("RadioIndicator", Jy, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, icon: l, radius: u, color: f, iconColor: h, autoContrast: d, checked: m, mod: g, variant: v, disabled: x, attributes: b, ...E } = t, S = De({
    name: "RadioIndicator",
    classes: xf,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: b,
    vars: i,
    varsResolver: Sf,
    rootSelector: "indicator"
  }), k = p.use(bf), R = typeof m == "boolean" ? m : k?.checked || !1;
  return /* @__PURE__ */ c.jsx(Q, {
    ...S("indicator", { variant: v }),
    variant: v,
    mod: [{
      checked: R,
      disabled: x
    }, g],
    ...E,
    children: /* @__PURE__ */ c.jsx(l, { ...S("icon") })
  });
});
$s.displayName = "@mantine/core/RadioIndicator";
$s.classes = xf;
$s.varsResolver = Sf;
var Cf = {
  root: "m_f3f1af94",
  inner: "m_89c4f5e4",
  icon: "m_f3ed6b2b",
  radio: "m_8a3dbb89",
  "radio--outline": "m_1bfe9d39"
};
const Zy = {
  labelPosition: "right",
  withErrorStyles: !0
}, jf = ze((e, { size: t, radius: n, color: o, iconColor: r, variant: s, autoContrast: a }) => {
  const i = ls({
    color: o || e.primaryColor,
    theme: e
  }), l = i.isThemeColor && i.shade === void 0 ? `var(--mantine-color-${i.color}-outline)` : i.color;
  return { root: {
    "--radio-size": _e(t, "radio-size"),
    "--radio-radius": n === void 0 ? void 0 : Tt(n),
    "--radio-color": s === "outline" ? l : at(o, e),
    "--radio-icon-color": r ? at(r, e) : fr(a, e) ? Co({
      color: o,
      theme: e,
      autoContrast: a
    }) : void 0,
    "--radio-icon-size": _e(t, "radio-icon-size")
  } };
}), kn = ce((e) => {
  const t = Z("Radio", Zy, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, id: l, size: u, label: f, labelPosition: h, description: d, error: m, radius: g, color: v, variant: x, disabled: b, wrapperProps: E, icon: S = of, rootRef: k, iconColor: R, onChange: T, mod: C, attributes: w, withErrorStyles: A, checked: $, ...z } = t, V = De({
    name: "Radio",
    classes: Cf,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: w,
    vars: i,
    varsResolver: jf
  }), B = p.use(qi), M = B?.size ?? u, O = t.size ? u : M, { styleProps: D, rest: L } = su(z), I = Vt(l), P = [
    d ? `${I}-description` : void 0,
    m && typeof m != "boolean" ? `${I}-error` : void 0,
    L["aria-describedby"]
  ].filter(Boolean).join(" ") || void 0, F = B ? B.value === L.value : void 0, _ = {
    checked: F ?? $,
    name: L.name ?? B?.name,
    onChange: (U) => {
      B?.onChange(U), T?.(U);
    },
    disabled: B?.disabled ?? b
  };
  return /* @__PURE__ */ c.jsx(_i, {
    ...V("root"),
    __staticSelector: "Radio",
    __stylesApiProps: t,
    id: I,
    size: O,
    labelPosition: h,
    label: f,
    description: d,
    error: m,
    disabled: _.disabled,
    classNames: n,
    styles: s,
    unstyled: a,
    "data-checked": (F ?? $) || void 0,
    variant: x,
    ref: k,
    mod: C,
    attributes: w,
    ...D,
    ...E,
    children: /* @__PURE__ */ c.jsxs(Q, {
      ...V("inner"),
      mod: { "label-position": h },
      children: [/* @__PURE__ */ c.jsx(Q, {
        ...V("radio", {
          focusable: !0,
          variant: x
        }),
        ...L,
        ..._,
        component: "input",
        mod: {
          error: !!m,
          "with-error-styles": A
        },
        id: I,
        type: "radio",
        "aria-describedby": P
      }), /* @__PURE__ */ c.jsx(S, {
        ...V("icon"),
        "aria-hidden": !0
      })]
    })
  });
});
kn.classes = Cf;
kn.varsResolver = jf;
kn.displayName = "@mantine/core/Radio";
kn.Group = Ki;
kn.Card = Os;
kn.Indicator = $s;
var kf = {
  root: "m_cf365364",
  indicator: "m_9e182ccd",
  label: "m_1738fcb2",
  input: "m_1714d588",
  control: "m_69686b9b",
  innerLabel: "m_78882f40"
};
const Qy = { withItemsBorders: !0 }, Ef = ze((e, { radius: t, color: n, transitionDuration: o, size: r, transitionTimingFunction: s }) => ({ root: {
  "--sc-radius": t === void 0 ? void 0 : Tt(t),
  "--sc-color": n ? at(n, e) : void 0,
  "--sc-shadow": n ? void 0 : "var(--mantine-shadow-xs)",
  "--sc-transition-duration": o === void 0 ? void 0 : `${o}ms`,
  "--sc-transition-timing-function": s,
  "--sc-padding": _e(r, "sc-padding"),
  "--sc-font-size": Wr(r)
} })), vr = En((e) => {
  const t = Z("SegmentedControl", Qy, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, data: l, value: u, defaultValue: f, onChange: h, size: d, name: m, disabled: g, readOnly: v, fullWidth: x, orientation: b, radius: E, color: S, transitionDuration: k, transitionTimingFunction: R, variant: T, autoContrast: C, withItemsBorders: w, mod: A, attributes: $, ref: z, ...V } = t, B = De({
    name: "SegmentedControl",
    props: t,
    classes: kf,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: $,
    vars: i,
    varsResolver: Ef
  }), M = lr(), O = l.map((q) => Dh(q) ? {
    label: `${q}`,
    value: q
  } : q), D = Eh(), [L, I] = p.useState(Rc()), [P, F] = p.useState(null), [_, U] = p.useState({}), X = (q, ae) => {
    q === null || _[ae] === q || (_[ae] = q, U({ ..._ }));
  }, [ne, de] = Qe({
    value: u,
    defaultValue: f,
    finalValue: Array.isArray(l) ? O.find((q) => !q.disabled)?.value ?? l[0]?.value ?? null : null,
    onChange: h
  }), oe = Vt(m), te = O.map((q) => `${q.value}`), fe = O.map((q) => /* @__PURE__ */ p.createElement(Q, {
    ...B("control"),
    mod: {
      active: ne === q.value,
      orientation: b
    },
    key: `${q.value}`
  }, /* @__PURE__ */ p.createElement("input", {
    ...B("input"),
    disabled: g || q.disabled,
    type: "radio",
    name: oe,
    value: `${q.value}`,
    id: `${oe}-${q.value}`,
    checked: ne === q.value,
    onChange: () => !v && de(q.value),
    "data-focus-ring": M.focusRing,
    key: `${q.value}-input`
  }), /* @__PURE__ */ p.createElement(Q, {
    component: "label",
    ...B("label"),
    mod: {
      active: ne === q.value && !(g || q.disabled),
      disabled: g || q.disabled,
      "read-only": v
    },
    htmlFor: `${oe}-${q.value}`,
    ref: (ae) => X(ae, `${q.value}`),
    __vars: { "--sc-label-color": S !== void 0 ? Co({
      color: S,
      theme: M,
      autoContrast: C
    }) : void 0 },
    key: `${q.value}-label`
  }, /* @__PURE__ */ c.jsx("span", {
    ...B("innerLabel"),
    children: q.label
  })))), K = Ve(z, F);
  return Ac(() => {
    I(Rc());
  }, [l.length]), Ac(() => {
    U((q) => {
      const ae = {};
      return te.forEach((be) => {
        be in q && (ae[be] = q[be]);
      }), Object.keys(ae).length === Object.keys(q).length ? q : ae;
    });
  }, [te]), l.length === 0 ? null : /* @__PURE__ */ c.jsxs(Q, {
    ...B("root"),
    variant: T,
    size: d,
    ref: K,
    mod: [{
      "full-width": x,
      orientation: b,
      initialized: D,
      "with-items-borders": w
    }, A],
    ...V,
    role: "radiogroup",
    "data-disabled": g,
    children: [typeof ne < "u" && /* @__PURE__ */ c.jsx(xs, {
      target: _[`${ne}`],
      parent: P,
      component: "span",
      transitionDuration: "var(--sc-transition-duration)",
      ...B("indicator")
    }, L), fe]
  });
});
vr.classes = kf;
vr.varsResolver = Ef;
vr.displayName = "@mantine/core/SegmentedControl";
const eb = {
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
  ], eb, e), { classNames: n, styles: o, unstyled: r, vars: s, dropdownOpened: a, defaultDropdownOpened: i, onDropdownClose: l, onDropdownOpen: u, onFocus: f, onBlur: h, onClick: d, onChange: m, data: g, value: v, defaultValue: x, selectFirstOptionOnChange: b, selectFirstOptionOnDropdownOpen: E, onOptionSubmit: S, comboboxProps: k, readOnly: R, disabled: T, filter: C, limit: w, withScrollArea: A, maxDropdownHeight: $, floatingHeight: z, size: V, searchable: B, rightSection: M, checkIconPosition: O, withCheckIcon: D, withAlignedLabels: L, nothingFoundMessage: I, name: P, form: F, searchValue: _, defaultSearchValue: U, onSearchChange: X, allowDeselect: ne, error: de, rightSectionPointerEvents: oe, id: te, clearable: fe, clearSectionMode: K, clearButtonProps: q, hiddenInputProps: ae, renderOption: be, onClear: he, autoComplete: ke, scrollAreaProps: re, __defaultRightSection: W, __clearSection: H, __clearable: Y, chevronColor: ue, autoSelectOnBlur: Ee, openOnFocus: Ie, attributes: ge, ...ve } = t, Se = p.useMemo(() => Cd(g), [g]), Oe = p.useRef({}), pe = p.useMemo(() => jd(Se), [Se]), vt = Vt(te), [Te, yt, qn] = Qe({
    value: v,
    defaultValue: x,
    finalValue: null,
    onChange: m
  }), It = Te != null ? `${Te}` in pe ? pe[`${Te}`] : Oe.current[`${Te}`] : void 0, un = Sh(It), [Mt, Kn, Xn] = Qe({
    value: _,
    defaultValue: U,
    finalValue: It ? It.label : "",
    onChange: X
  }), et = Oi({
    opened: a,
    defaultOpened: i,
    onDropdownOpen: () => {
      u?.(), E ? et.selectFirstOption() : et.updateSelectedOptionIndex("active", { scrollIntoView: !0 });
    },
    onDropdownClose: () => {
      l?.(), setTimeout(et.resetSelectedOption, 0);
    }
  }), Ht = (qe) => {
    Kn(qe), et.resetSelectedOption();
  }, { resolvedClassNames: Rr, resolvedStyles: Nr } = ur({
    props: t,
    styles: o,
    classNames: n
  });
  p.useEffect(() => {
    b && et.selectFirstOption();
  }, [b, Mt]), p.useEffect(() => {
    v === null && Ht(""), v != null && It && (un?.value !== It.value || un?.label !== It.label) && Ht(It.label);
  }, [v, It]), p.useEffect(() => {
    !qn && !Xn && Ht(Te != null ? `${Te}` in pe ? pe[`${Te}`]?.label : Oe.current[`${Te}`]?.label || "" : "");
  }, [pe, Te]), p.useEffect(() => {
    Te && `${Te}` in pe && (Oe.current[`${Te}`] = pe[`${Te}`]);
  }, [pe, Te]);
  const Xs = /* @__PURE__ */ c.jsx(Ce.ClearButton, {
    ...q,
    onClear: () => {
      yt(null, null), Ht(""), he?.();
    }
  }), Tr = fe && Te != null && !T && !R;
  return /* @__PURE__ */ c.jsxs(c.Fragment, { children: [/* @__PURE__ */ c.jsxs(Ce, {
    store: et,
    __staticSelector: "Select",
    classNames: Rr,
    styles: Nr,
    unstyled: r,
    readOnly: R,
    size: V,
    attributes: ge,
    floatingHeight: z,
    keepMounted: Ee,
    onOptionSubmit: (qe) => {
      S?.(qe);
      const tt = ne && `${pe[qe].value}` == `${Te}` ? null : pe[qe], dn = tt ? tt.value : null;
      dn !== Te && yt(dn, tt), !qn && Ht(dn != null && tt?.label || ""), et.closeDropdown();
    },
    ...k,
    children: [/* @__PURE__ */ c.jsx(Ce.Target, {
      targetType: B ? "input" : "button",
      autoComplete: ke,
      withExpandedAttribute: !0,
      children: /* @__PURE__ */ c.jsx(St, {
        id: vt,
        __defaultRightSection: /* @__PURE__ */ c.jsx(Ce.Chevron, {
          size: V,
          error: de,
          unstyled: r,
          color: ue
        }),
        __clearSection: Xs,
        __clearable: Tr,
        __clearSectionMode: K,
        rightSection: M,
        rightSectionPointerEvents: oe || "none",
        ...ve,
        size: V,
        __staticSelector: "Select",
        disabled: T,
        readOnly: R || !B,
        value: Mt,
        onChange: (qe) => {
          if (Wv(qe)) {
            if (!R) {
              const tt = hy(pe, qe.currentTarget.value);
              tt && `${tt.value}` != `${Te}` && (yt(tt.value, tt), !qn && Ht(tt.label));
            }
            return;
          }
          Ht(qe.currentTarget.value), et.openDropdown(), b && et.selectFirstOption();
        },
        onFocus: (qe) => {
          Ie && B && et.openDropdown(), f?.(qe);
        },
        onBlur: (qe) => {
          Ee && et.clickSelectedOption(), et.closeDropdown();
          const tt = Te != null && (`${Te}` in pe ? pe[`${Te}`] : Oe.current[`${Te}`]);
          Ht(tt && tt.label || ""), h?.(qe);
        },
        onClick: (qe) => {
          B ? et.openDropdown() : et.toggleDropdown(), d?.(qe);
        },
        classNames: Rr,
        styles: Nr,
        unstyled: r,
        pointer: !B,
        error: de,
        attributes: ge
      })
    }), /* @__PURE__ */ c.jsx(Uv, {
      data: Se,
      hidden: R || T,
      filter: C,
      search: Mt,
      limit: w,
      hiddenWhenEmpty: !I,
      withScrollArea: A,
      maxDropdownHeight: $,
      filterOptions: !!B && It?.label !== Mt,
      value: Te,
      checkIconPosition: O,
      withCheckIcon: D,
      withAlignedLabels: L,
      nothingFoundMessage: I,
      unstyled: r,
      labelId: ve.label ? `${vt}-label` : void 0,
      "aria-label": ve.label ? void 0 : ve["aria-label"],
      renderOption: be,
      scrollAreaProps: re
    })]
  }), /* @__PURE__ */ c.jsx(Ce.HiddenInput, {
    value: Te,
    name: P,
    form: F,
    disabled: T,
    ...ae
  })] });
});
uo.classes = {
  ...St.classes,
  ...Ce.classes
};
uo.displayName = "@mantine/core/Select";
const [tb, nb] = Jt("Table component was not found in the tree");
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
function ob(e, t) {
  if (!t) return;
  const n = {};
  return t.columnBorder && e.withColumnBorders && (n["data-with-column-border"] = !0), t.rowBorder && e.withRowBorders && (n["data-with-row-border"] = !0), t.striped && e.striped && (n["data-striped"] = e.striped), t.highlightOnHover && e.highlightOnHover && (n["data-hover"] = !0), t.captionSide && e.captionSide && (n["data-side"] = e.captionSide), t.stickyHeader && e.stickyHeader && (n["data-sticky"] = !0), n;
}
function Hn(e, t) {
  const n = `Table${e.charAt(0).toUpperCase()}${e.slice(1)}`, o = ce((r) => {
    const s = Z(n, {}, r), { classNames: a, className: i, style: l, styles: u, ...f } = s, h = nb();
    return /* @__PURE__ */ c.jsx(Q, {
      component: e,
      ...ob(h, t),
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
const Oa = Hn("th", { columnBorder: !0 }), Rf = Hn("td", { columnBorder: !0 }), Br = Hn("tr", {
  rowBorder: !0,
  striped: !0,
  highlightOnHover: !0
}), Nf = Hn("thead", { stickyHeader: !0 }), Tf = Hn("tbody"), Pf = Hn("tfoot"), Af = Hn("caption", { captionSide: !0 }), rb = { type: "scrollarea" }, If = ze((e, { minWidth: t, maxHeight: n, type: o }) => ({ scrollContainer: {
  "--table-min-width": Ae(t),
  "--table-max-height": Ae(n),
  "--table-overflow": o === "native" ? "auto" : void 0
} })), Ls = ce((e) => {
  const t = Z("TableScrollContainer", rb, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, children: l, minWidth: u, maxHeight: f, type: h, scrollAreaProps: d, attributes: m, ...g } = t, v = De({
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
    varsResolver: If,
    rootSelector: "scrollContainer"
  });
  return /* @__PURE__ */ c.jsx(Q, {
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
    children: /* @__PURE__ */ c.jsx("div", {
      ...v("scrollContainerInner"),
      children: l
    })
  });
});
Ls.classes = yr;
Ls.varsResolver = If;
Ls.displayName = "@mantine/core/TableScrollContainer";
function Xi({ data: e }) {
  return /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
    e.caption && /* @__PURE__ */ c.jsx(Af, { children: e.caption }),
    e.head && /* @__PURE__ */ c.jsx(Nf, { children: /* @__PURE__ */ c.jsx(Br, { children: e.head.map((t, n) => /* @__PURE__ */ c.jsx(Oa, { children: t }, n)) }) }),
    e.body && /* @__PURE__ */ c.jsx(Tf, { children: e.body.map((t, n) => /* @__PURE__ */ c.jsx(Br, { children: t.map((o, r) => /* @__PURE__ */ c.jsx(Rf, { children: o }, r)) }, n)) }),
    e.foot && /* @__PURE__ */ c.jsx(Pf, { children: /* @__PURE__ */ c.jsx(Br, { children: e.foot.map((t, n) => /* @__PURE__ */ c.jsx(Oa, { children: t }, n)) }) })
  ] });
}
Xi.displayName = "@mantine/core/TableDataRenderer";
const sb = {
  withRowBorders: !0,
  verticalSpacing: 7
}, Mf = ze((e, { layout: t, captionSide: n, horizontalSpacing: o, verticalSpacing: r, borderColor: s, stripedColor: a, highlightOnHoverColor: i, striped: l, highlightOnHover: u, stickyHeaderOffset: f, stickyHeader: h }) => ({ table: {
  "--table-layout": t,
  "--table-caption-side": n,
  "--table-horizontal-spacing": Xo(o),
  "--table-vertical-spacing": Xo(r),
  "--table-border-color": s ? at(s, e) : void 0,
  "--table-striped-color": l && a ? at(a, e) : void 0,
  "--table-highlight-on-hover-color": u && i ? at(i, e) : void 0,
  "--table-sticky-header-offset": h ? Ae(f) : void 0
} })), st = ce((e) => {
  const t = Z("Table", sb, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, horizontalSpacing: l, verticalSpacing: u, captionSide: f, stripedColor: h, highlightOnHoverColor: d, striped: m, highlightOnHover: g, withColumnBorders: v, withRowBorders: x, withTableBorder: b, borderColor: E, layout: S, data: k, children: R, stickyHeader: T, stickyHeaderOffset: C, mod: w, tabularNums: A, attributes: $, ...z } = t, V = De({
    name: "Table",
    props: t,
    className: o,
    style: r,
    classes: yr,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: $,
    rootSelector: "table",
    vars: i,
    varsResolver: Mf,
    stable: !0
  }), B = m === !0 ? "odd" : m || void 0, M = f || "bottom", O = p.useMemo(() => ({
    getStyles: V,
    stickyHeader: T,
    striped: B,
    highlightOnHover: g,
    withColumnBorders: v,
    withRowBorders: x,
    captionSide: M
  }), [
    V,
    T,
    B,
    g,
    v,
    x,
    M
  ]);
  return /* @__PURE__ */ c.jsx(tb, {
    value: O,
    children: /* @__PURE__ */ c.jsx(Q, {
      component: "table",
      mod: [{
        withTableBorder: b,
        tabularNums: A
      }, w],
      ...V("table"),
      ...z,
      children: R || !!k && /* @__PURE__ */ c.jsx(Xi, { data: k })
    })
  });
});
st.classes = yr;
st.varsResolver = Mf;
st.displayName = "@mantine/core/Table";
st.Td = Rf;
st.Th = Oa;
st.Tr = Br;
st.Thead = Nf;
st.Tbody = Tf;
st.Tfoot = Pf;
st.Caption = Af;
st.ScrollContainer = Ls;
st.DataRenderer = Xi;
const [ab, Yi] = Jt("Tabs component was not found in the tree");
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
const Gi = ce((e) => {
  const t = Z("TabsList", null, e), { children: n, className: o, grow: r, justify: s, classNames: a, styles: i, style: l, mod: u, ...f } = t, h = Yi();
  return /* @__PURE__ */ c.jsx(Q, {
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
Gi.classes = br;
Gi.displayName = "@mantine/core/TabsList";
const Ji = ce((e) => {
  const t = Z("TabsPanel", null, e), { children: n, className: o, value: r, classNames: s, styles: a, style: i, mod: l, keepMounted: u, ...f } = t, h = ei(), d = Yi();
  p.useEffect(() => (d.setMountedPanel(r, !0), () => {
    d.setMountedPanel(r, !1);
  }), [r]);
  const m = d.value === r, g = d.keepMounted || u, v = d.keepMountedMode !== "display-none", x = g && v && h !== "test" ? /* @__PURE__ */ c.jsx(p.Activity, {
    mode: m ? "visible" : "hidden",
    children: n
  }) : g || m ? n : null;
  return /* @__PURE__ */ c.jsx(Q, {
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
Ji.classes = br;
Ji.displayName = "@mantine/core/TabsPanel";
const Zi = ce((e) => {
  const t = Z("TabsTab", null, e), { className: n, children: o, rightSection: r, leftSection: s, value: a, onClick: i, onKeyDown: l, disabled: u, color: f, style: h, classNames: d, styles: m, vars: g, mod: v, tabIndex: x, ...b } = t, E = lr(), { dir: S } = ko(), k = Yi(), R = a === k.value, T = (w) => {
    k.onChange(k.allowTabDeactivation && a === k.value ? null : a), i?.(w);
  }, C = {
    classNames: d,
    styles: m,
    props: t
  };
  return /* @__PURE__ */ c.jsxs(zn, {
    ...k.getStyles("tab", {
      className: n,
      style: h,
      variant: k.variant,
      ...C
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
    tabIndex: x !== void 0 ? x : R || k.value === null ? 0 : -1,
    "aria-controls": k.mountedPanels.current.has(a) ? k.getPanelId(a) : void 0,
    onClick: T,
    __vars: { "--tabs-color": f ? at(f, E) : void 0 },
    onKeyDown: fu({
      siblingSelector: '[role="tab"]',
      parentSelector: '[role="tablist"]',
      activateOnFocus: k.activateTabWithKeyboard,
      loop: k.loop,
      orientation: k.orientation || "horizontal",
      dir: S,
      onKeyDown: l
    }),
    ...b,
    children: [
      s && /* @__PURE__ */ c.jsx("span", {
        ...k.getStyles("tabSection", C),
        "data-position": "left",
        children: s
      }),
      o && /* @__PURE__ */ c.jsx("span", {
        ...k.getStyles("tabLabel", C),
        children: o
      }),
      r && /* @__PURE__ */ c.jsx("span", {
        ...k.getStyles("tabSection", C),
        "data-position": "right",
        children: r
      })
    ]
  });
});
Zi.classes = br;
Zi.displayName = "@mantine/core/TabsTab";
const xl = "Tabs.Tab or Tabs.Panel component was rendered with invalid value or without value", ib = {
  keepMounted: !0,
  keepMountedMode: "activity",
  orientation: "horizontal",
  loop: !0,
  activateTabWithKeyboard: !0,
  variant: "default",
  placement: "left"
}, Df = ze((e, { radius: t, color: n, autoContrast: o }) => ({ root: {
  "--tabs-radius": Tt(t),
  "--tabs-color": at(n, e),
  "--tabs-text-color": fr(o, e) ? Co({
    color: n,
    theme: e,
    autoContrast: o
  }) : void 0
} })), ht = ce((e) => {
  const t = Z("Tabs", ib, e), { defaultValue: n, value: o, onChange: r, orientation: s, children: a, loop: i, id: l, activateTabWithKeyboard: u, allowTabDeactivation: f, variant: h, color: d, radius: m, inverted: g, placement: v, keepMounted: x, keepMountedMode: b, classNames: E, styles: S, unstyled: k, className: R, style: T, vars: C, autoContrast: w, mod: A, attributes: $, ...z } = t, V = Vt(l), B = p.useRef(/* @__PURE__ */ new Set()), M = vh(), O = p.useCallback((P, F) => {
    const _ = B.current;
    F && !_.has(P) ? (_.add(P), M()) : !F && _.has(P) && (_.delete(P), M());
  }, []), [D, L] = Qe({
    value: o,
    defaultValue: n,
    finalValue: null,
    onChange: r
  }), I = De({
    name: "Tabs",
    props: t,
    classes: br,
    className: R,
    style: T,
    classNames: E,
    styles: S,
    unstyled: k,
    attributes: $,
    vars: C,
    varsResolver: Df
  });
  return /* @__PURE__ */ c.jsx(ab, {
    value: {
      placement: v,
      value: D,
      orientation: s,
      id: V,
      loop: i,
      activateTabWithKeyboard: u,
      getTabId: qr(`${V}-tab`, xl),
      getPanelId: qr(`${V}-panel`, xl),
      onChange: L,
      allowTabDeactivation: f,
      variant: h,
      color: d,
      radius: m,
      inverted: g,
      keepMounted: x,
      keepMountedMode: b,
      unstyled: k,
      getStyles: I,
      mountedPanels: B,
      setMountedPanel: O
    },
    children: /* @__PURE__ */ c.jsx(Q, {
      id: V,
      variant: h,
      mod: [{
        orientation: s,
        inverted: s === "horizontal" && g,
        placement: s === "vertical" && v
      }, A],
      ...I("root"),
      ...z,
      children: a
    })
  });
});
ht.classes = br;
ht.varsResolver = Df;
ht.displayName = "@mantine/core/Tabs";
ht.Tab = Zi;
ht.Panel = Ji;
ht.List = Gi;
const dt = ce((e) => {
  const t = Z([
    "Input",
    "InputWrapper",
    "TextInput"
  ], null, e);
  return /* @__PURE__ */ c.jsx(St, {
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
function Zr(e, t, n = []) {
  const o = er(e, t);
  return o ? !Array.isArray(o.children) || o.children.length === 0 ? [o.value] : (o.children.forEach((r) => {
    Array.isArray(r.children) && r.children.length > 0 ? Zr(r.value, t, n) : n.push(r.value);
  }), n) : n;
}
function Of(e) {
  return e.reduce((t, n) => (Array.isArray(n.children) && n.children.length > 0 ? t.push(...Of(n.children)) : t.push(n.value), t), []);
}
function zs(e, t, n = []) {
  const o = [];
  for (const r of e) if (Array.isArray(r.children) && r.children.length > 0) {
    const s = zs(r.children, t, n);
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
function cb(e, t, n) {
  return n.length === 0 ? !1 : n.includes(e) ? !0 : zs(t, n).result.some((o) => o.value === e && o.checked);
}
const lb = xu(cb);
function ub(e, t, n) {
  return n.length === 0 ? !1 : zs(t, n).result.some((o) => o.value === e && o.indeterminate);
}
const db = xu(ub);
function $f(e, t, n, o = {}) {
  return t.forEach((r) => {
    o[r.value] = r.value in e ? e[r.value] : r.value === n, Array.isArray(r.children) && $f(e, r.children, n, o);
  }), o;
}
function fb(e, t, n) {
  if (n) return e;
  const o = [];
  return e.forEach((r) => o.push(...Zr(r, t))), Array.from(new Set(o));
}
function Lf(e) {
  const t = [];
  for (const n of e)
    t.push(n.value), Array.isArray(n.children) && n.children.length > 0 && t.push(...Lf(n.children));
  return t;
}
function zf({ initialSelectedState: e = [], expandedState: t, initialCheckedState: n = [], checkedState: o, initialExpandedState: r = {}, selectedState: s, multiple: a = !1, onNodeCollapse: i, onNodeExpand: l, onCheckedStateChange: u, onSelectedStateChange: f, onExpandedStateChange: h, onLoadChildren: d, checkStrictly: m = !1 } = {}) {
  const [g, v] = p.useState([]), [x, b] = Qe({
    value: t,
    defaultValue: r,
    finalValue: {},
    onChange: h
  }), [E, S] = Qe({
    value: s,
    defaultValue: e,
    finalValue: [],
    onChange: f
  }), [k, R] = Qe({
    value: o,
    defaultValue: n,
    finalValue: [],
    onChange: u
  }), [T, C] = p.useState(null), w = p.useRef(/* @__PURE__ */ new Set()), A = p.useRef(/* @__PURE__ */ new Set()), [$, z] = p.useState([]), [V, B] = p.useState({}), M = p.useCallback((W) => {
    b($f(x, W, E)), R(fb(k, W, m)), v(W);
  }, [
    E,
    k,
    x,
    m
  ]), O = p.useCallback(async (W) => {
    if (d && !(w.current.has(W) || A.current.has(W))) {
      w.current.add(W), z(Array.from(w.current)), B((H) => {
        if (!(W in H)) return H;
        const Y = { ...H };
        return delete Y[W], Y;
      });
      try {
        await d(W), A.current.add(W);
      } catch (H) {
        const Y = H instanceof Error ? H : new Error(String(H));
        B((ue) => ({
          ...ue,
          [W]: Y
        }));
      } finally {
        w.current.delete(W), z(Array.from(w.current));
      }
    }
  }, [d]), D = p.useCallback((W) => {
    if (!d) return;
    const H = er(W, g);
    H && H.hasChildren && !Array.isArray(H.children) && O(W);
  }, [
    d,
    g,
    O
  ]), L = p.useCallback((W) => {
    const H = {
      ...x,
      [W]: !x[W]
    };
    H[W] ? l?.(W) : i?.(W), H[W] && D(W), b(H);
  }, [
    i,
    l,
    x,
    D
  ]), I = p.useCallback((W) => {
    x[W] !== !1 && i?.(W), b({
      ...x,
      [W]: !1
    });
  }, [i, x]), P = p.useCallback((W) => {
    x[W] !== !0 && l?.(W), D(W), b({
      ...x,
      [W]: !0
    });
  }, [
    l,
    x,
    D
  ]), F = p.useCallback(() => {
    const W = { ...x };
    Object.keys(W).forEach((H) => {
      W[H] = !0, D(H);
    }), b(W);
  }, [x, D]), _ = p.useCallback(() => {
    const W = { ...x };
    Object.keys(W).forEach((H) => {
      W[H] = !1;
    }), b(W);
  }, [x]), U = p.useCallback((W) => {
    if (!a)
      return E.includes(W) ? (C(null), []) : (C(W), [W]);
    if (E.includes(W))
      return C(null), E.filter((H) => H !== W);
    C(W), S([...E, W]);
  }, [E]), X = p.useCallback((W) => {
    C(W), S(a ? E.includes(W) ? E : [...E, W] : [W]);
  }, [E]), ne = p.useCallback((W) => {
    T === W && C(null), S(E.filter((H) => H !== W));
  }, [E]), de = p.useCallback(() => {
    S([]), C(null);
  }, []), oe = p.useCallback((W) => {
    if (m)
      k.includes(W) || R([...k, W]);
    else {
      const H = Zr(W, g);
      R(Array.from(/* @__PURE__ */ new Set([...k, ...H])));
    }
  }, [
    g,
    k,
    m
  ]), te = p.useCallback((W) => {
    if (m) R(k.filter((H) => H !== W));
    else {
      const H = Zr(W, g);
      R(k.filter((Y) => !H.includes(Y)));
    }
  }, [
    g,
    k,
    m
  ]), fe = p.useCallback(() => {
    R(m ? Lf(g) : Of(g));
  }, [g, m]), K = p.useCallback(() => {
    R([]);
  }, []), q = p.useCallback(() => m ? k.map((W) => {
    const H = er(W, g);
    return {
      checked: !0,
      indeterminate: !1,
      value: W,
      hasChildren: H ? Array.isArray(H.children) && H.children.length > 0 || !!H.hasChildren : !1
    };
  }) : zs(g, k).result, [
    m,
    k,
    g
  ]), ae = p.useCallback((W) => m ? k.includes(W) : lb(W, g, k), [
    m,
    k,
    g
  ]), be = p.useCallback((W) => m ? !1 : db(W, g, k), [
    m,
    k,
    g
  ]), he = p.useCallback((W) => $.includes(W), [$]), ke = p.useCallback((W) => V[W] || null, [V]), re = p.useCallback((W) => {
    A.current.delete(W), B((H) => {
      if (!(W in H)) return H;
      const Y = { ...H };
      return delete Y[W], Y;
    });
  }, []);
  return p.useMemo(() => ({
    checkStrictly: m,
    multiple: a,
    expandedState: x,
    selectedState: E,
    checkedState: k,
    anchorNode: T,
    initialize: M,
    toggleExpanded: L,
    collapse: I,
    expand: P,
    expandAllNodes: F,
    collapseAllNodes: _,
    setExpandedState: b,
    checkNode: oe,
    uncheckNode: te,
    checkAllNodes: fe,
    uncheckAllNodes: K,
    setCheckedState: R,
    toggleSelected: U,
    select: X,
    deselect: ne,
    clearSelected: de,
    setSelectedState: S,
    getCheckedNodes: q,
    isNodeChecked: ae,
    isNodeIndeterminate: be,
    isNodeLoading: he,
    getNodeLoadError: ke,
    loadNode: O,
    invalidateNode: re
  }), [
    m,
    a,
    x,
    E,
    k,
    T,
    M,
    L,
    I,
    P,
    F,
    _,
    b,
    oe,
    te,
    fe,
    K,
    R,
    U,
    X,
    ne,
    de,
    S,
    q,
    ae,
    be,
    he,
    ke,
    O,
    re
  ]);
}
function pb(e, t, n) {
  const o = er(t, e);
  if (!o || !o.children) return !1;
  function r(s) {
    for (const a of s)
      if (a.value === n || a.children && r(a.children)) return !0;
    return !1;
  }
  return r(o.children);
}
function hb(e, t, n, o) {
  const r = t.getBoundingClientRect(), s = e.clientY - r.top, a = r.height;
  return n ? o ? s < a * 0.5 ? "before" : "inside" : s < a * 0.25 ? "before" : s > a * 0.75 ? "after" : "inside" : s < a * 0.5 ? "before" : "after";
}
const mb = {
  elementProps: {},
  dragHandleProps: void 0
};
function gb({ nodeValue: e, hasChildren: t, isExpanded: n, data: o, onDragDrop: r, dragStateRef: s, allowDrop: a, withDragHandle: i }) {
  const [l, u] = p.useState(!1);
  return p.useEffect(() => {
    if (!i || !l) return;
    const v = () => u(!1);
    return window.addEventListener("mouseup", v), () => window.removeEventListener("mouseup", v);
  }, [i, l]), r ? {
    elementProps: {
      draggable: i ? l : !0,
      onDragStart: (v) => {
        if (i && !l) return;
        v.stopPropagation(), v.dataTransfer.effectAllowed = "move", v.dataTransfer.setData("text/plain", e), s.current.draggedValue = e;
        const x = v.currentTarget, b = x.closest("[role=treeitem]");
        b && b.setAttribute("data-dragging", "true"), requestAnimationFrame(() => {
          x.setAttribute("data-dragging", "true");
        });
      },
      onDragOver: (v) => {
        const x = s.current.draggedValue;
        if (!x || x === e || pb(o, x, e)) return;
        const b = v.currentTarget, E = hb(v, b, t, n);
        if (a && !a({
          draggedNode: x,
          targetNode: e,
          position: E
        })) {
          const k = s.current.currentDropTarget;
          k && k !== b && k.removeAttribute("data-drag-over"), b.removeAttribute("data-drag-over"), s.current.currentDropTarget = null;
          return;
        }
        v.preventDefault(), v.stopPropagation(), v.dataTransfer.dropEffect = "move";
        const S = s.current.currentDropTarget;
        S && S !== b && S.removeAttribute("data-drag-over"), b.setAttribute("data-drag-over", E), s.current.currentDropTarget = b;
      },
      onDragLeave: (v) => {
        const x = v.currentTarget, b = v.relatedTarget;
        b && x.contains(b) || (x.removeAttribute("data-drag-over"), s.current.currentDropTarget === x && (s.current.currentDropTarget = null));
      },
      onDrop: (v) => {
        v.preventDefault(), v.stopPropagation();
        const x = v.currentTarget, b = x.getAttribute("data-drag-over");
        x.removeAttribute("data-drag-over");
        const E = s.current.draggedValue;
        if (E && b && E !== e) {
          const S = {
            draggedNode: E,
            targetNode: e,
            position: b
          };
          (!a || a(S)) && r(S);
        }
        s.current.draggedValue = null, s.current.currentDropTarget = null;
      },
      onDragEnd: (v) => {
        const x = v.currentTarget;
        x.removeAttribute("data-dragging");
        const b = x.closest("[role=treeitem]");
        b && b.removeAttribute("data-dragging");
        const E = s.current.currentDropTarget;
        E && E.removeAttribute("data-drag-over"), s.current.draggedValue = null, s.current.currentDropTarget = null, i && u(!1);
      }
    },
    dragHandleProps: i ? { onMouseDown: () => u(!0) } : void 0
  } : mb;
}
function Sl(e, t, n) {
  if (!e || !t) return [];
  const o = n.indexOf(e), r = n.indexOf(t), s = Math.min(o, r), a = Math.max(o, r);
  return n.slice(s, a + 1);
}
function vb(e, t) {
  for (let n = e; n && n !== t; ) {
    if (n.style.display === "none") return !1;
    n = n.parentElement;
  }
  return !0;
}
function Qi({ node: e, getStyles: t, rootIndex: n, controller: o, expandOnClick: r, selectOnClick: s, isSubtree: a, level: i = 1, renderNode: l, flatValues: u, allowRangeSelection: f, expandOnSpace: h, checkOnSpace: d, keepMounted: m, onDragDrop: g, allowDrop: v, withDragHandle: x, dragStateRef: b, data: E }) {
  const S = p.useRef(null), k = Array.isArray(e.children) && e.children.length > 0, R = !!e.hasChildren && !k, T = k || R, C = o.isNodeLoading(e.value), w = o.getNodeLoadError(e.value), A = o.expandedState[e.value] || !1, $ = (e.children || []).map((I) => /* @__PURE__ */ c.jsx(Qi, {
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
    allowDrop: v,
    withDragHandle: x,
    dragStateRef: b,
    data: E
  }, I.value)), { elementProps: z, dragHandleProps: V } = gb({
    nodeValue: e.value,
    hasChildren: T,
    isExpanded: A,
    data: E,
    onDragDrop: g,
    dragStateRef: b,
    allowDrop: v,
    withDragHandle: x
  }), B = (I) => {
    if (I.nativeEvent.code === "ArrowRight")
      if (I.stopPropagation(), I.preventDefault(), A) {
        const P = I.currentTarget.querySelector("[role=treeitem]");
        P?.setAttribute("data-focus-ring", "true"), P?.focus();
      } else o.expand(e.value);
    if (I.nativeEvent.code === "ArrowLeft") {
      if (I.stopPropagation(), I.preventDefault(), A && T) o.collapse(e.value);
      else if (a) {
        const P = Yo(I.currentTarget, "[role=treeitem]");
        P?.setAttribute("data-focus-ring", "true"), P?.focus();
      }
    }
    if (I.nativeEvent.code === "ArrowDown" || I.nativeEvent.code === "ArrowUp") {
      const P = Yo(I.currentTarget, "[data-tree-root]");
      if (!P) return;
      I.stopPropagation(), I.preventDefault();
      const F = Array.from(P.querySelectorAll("[role=treeitem]")).filter((ne) => vb(ne, P)), _ = F.indexOf(I.currentTarget);
      if (_ === -1) return;
      const U = I.nativeEvent.code === "ArrowDown" ? _ + 1 : _ - 1, X = F[U];
      if (X?.setAttribute("data-focus-ring", "true"), X?.focus(), I.shiftKey) {
        const ne = F[U];
        ne && o.setSelectedState(Sl(o.anchorNode, ne.dataset.value, u));
      }
    }
    I.nativeEvent.code === "Space" && (h && (I.stopPropagation(), I.preventDefault(), o.toggleExpanded(e.value)), d && (I.stopPropagation(), I.preventDefault(), o.isNodeChecked(e.value) ? o.uncheckNode(e.value) : o.checkNode(e.value)));
  }, M = (I) => {
    I.stopPropagation(), f && I.shiftKey && o.anchorNode ? (o.setSelectedState(Sl(o.anchorNode, e.value, u)), S.current?.focus()) : (r && o.toggleExpanded(e.value), s && o.select(e.value), S.current?.focus());
  }, O = o.selectedState.includes(e.value), D = {
    ...t("label"),
    onClick: M,
    "data-selected": O || void 0,
    "data-value": e.value,
    ...z
  }, L = A && C && $.length === 0;
  return /* @__PURE__ */ c.jsxs("li", {
    ...t("node", { style: { "--label-offset": `calc(var(--level-offset) * ${i - 1})` } }),
    role: "treeitem",
    "aria-selected": O,
    "data-value": e.value,
    "data-selected": O || void 0,
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
        selected: O,
        isRoot: i === 1,
        tree: o,
        expanded: A,
        hasChildren: T,
        isLoading: C,
        loadError: w,
        elementProps: D,
        dragHandleProps: V
      }) : /* @__PURE__ */ c.jsx("div", {
        ...D,
        children: e.label
      }),
      L && /* @__PURE__ */ c.jsx(Q, {
        component: "ul",
        role: "group",
        ...t("subtree"),
        "data-level": i,
        children: /* @__PURE__ */ c.jsx("li", {
          ...t("node", { style: { "--label-offset": `calc(var(--level-offset) * ${i})` } }),
          children: /* @__PURE__ */ c.jsx("div", {
            ...t("label"),
            children: /* @__PURE__ */ c.jsx(qp, {
              size: 16,
              style: { marginInlineStart: 4 }
            })
          })
        })
      }),
      m && $.length > 0 ? /* @__PURE__ */ c.jsx(p.Activity, {
        mode: A ? "visible" : "hidden",
        children: /* @__PURE__ */ c.jsx(Q, {
          component: "ul",
          role: "group",
          ...t("subtree"),
          "data-level": i,
          children: $
        })
      }) : A && $.length > 0 && /* @__PURE__ */ c.jsx(Q, {
        component: "ul",
        role: "group",
        ...t("subtree"),
        "data-level": i,
        children: $
      })
    ]
  });
}
Qi.displayName = "@mantine/core/TreeNode";
var _f = {
  root: "m_f698e191",
  subtree: "m_75f3ecf",
  node: "m_f6970eb1",
  label: "m_dc283425",
  flatLine: "m_c03b303c",
  flatLineClosing: "m_bf7448d9"
};
function Ff(e) {
  return e.reduce((t, n) => (t.push(n.value), n.children && t.push(...Ff(n.children)), t), []);
}
const yb = {
  expandOnClick: !0,
  allowRangeSelection: !0,
  expandOnSpace: !0
}, Bf = ze((e, { levelOffset: t }) => ({ root: { "--level-offset": Xo(t) } })), _s = ce((e) => {
  const t = Z("Tree", yb, e), { classNames: n, className: o, style: r, styles: s, unstyled: a, vars: i, data: l, expandOnClick: u, tree: f, renderNode: h, selectOnClick: d, clearSelectionOnOutsideClick: m, allowRangeSelection: g, expandOnSpace: v, levelOffset: x, checkOnSpace: b, keepMounted: E, onDragDrop: S, allowDrop: k, withDragHandle: R, withLines: T, attributes: C, ref: w, ...A } = t, $ = zf(), z = f || $, V = p.useRef({
    draggedValue: null,
    currentDropTarget: null
  }), B = De({
    name: "Tree",
    classes: _f,
    props: t,
    className: o,
    style: r,
    classNames: n,
    styles: s,
    unstyled: a,
    attributes: C,
    vars: i,
    varsResolver: Bf
  }), M = pu(() => m && z.clearSelected()), O = Ve(w, M), D = p.useMemo(() => Ff(l), [l]);
  p.useEffect(() => {
    z.initialize(l);
  }, [l]);
  const L = l.map((I, P) => /* @__PURE__ */ c.jsx(Qi, {
    node: I,
    getStyles: B,
    rootIndex: P,
    expandOnClick: u,
    selectOnClick: d,
    controller: z,
    renderNode: h,
    flatValues: D,
    allowRangeSelection: g,
    expandOnSpace: v,
    checkOnSpace: b,
    keepMounted: E,
    onDragDrop: S,
    allowDrop: k,
    withDragHandle: R,
    dragStateRef: V,
    data: l
  }, I.value));
  return /* @__PURE__ */ c.jsx(Q, {
    component: "ul",
    ref: O,
    ...B("root"),
    ...A,
    role: "tree",
    "aria-multiselectable": z.multiple,
    "data-tree-root": !0,
    "data-with-lines": T || void 0,
    children: L
  });
});
_s.displayName = "@mantine/core/Tree";
_s.classes = _f;
_s.varsResolver = Bf;
function Fs() {
  window.location.pathname !== "/login.html" && window.location.replace("/login.html");
}
function $e(e) {
  return e.layers ?? [];
}
function Le(e) {
  return e.version ?? 0;
}
class Ue extends Error {
  code;
  details;
  constructor(t, n, o) {
    super(n), this.name = "ApiError", this.code = t, this.details = o;
  }
}
async function Re(e, t) {
  const n = await fetch(e, t);
  if (n.status === 401)
    throw Fs(), new Ue("unauthorized", "this server needs an access token", null);
  if (!n.ok) {
    let o = `http${n.status}`, r = n.statusText, s = null;
    try {
      const a = await n.json();
      a?.error && (o = a.error.code ?? o, r = a.error.message ?? r, s = a.error.details ?? null);
    } catch {
    }
    throw new Ue(o, r, s);
  }
  if (n.status !== 204)
    return await n.json();
}
async function Vf(e = "", t = 200) {
  const n = new URLSearchParams({ limit: String(t) });
  return e && n.set("query", e), (await Re(
    `/api/projects?${n.toString()}`
  )).projects;
}
async function bb(e = 8) {
  return (await Re(
    `/api/projects/recent?limit=${e}`
  )).projects;
}
async function wb(e) {
  return Re(`/api/projects/${encodeURIComponent(e)}`);
}
function Hf(e) {
  return `/api/projects/${encodeURIComponent(e)}/thumbnail.png`;
}
async function xb(e, t, n, o, r) {
  return Re("/api/projects", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: e, width: t, height: n, background: o, name: r })
  });
}
async function Sb(e, t) {
  return Re(
    `/api/projects/${encodeURIComponent(e)}/rename`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: t })
    }
  );
}
async function Cb(e) {
  return Re(`/api/projects/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
async function Ao(e) {
  return Re(`/api/projects/${encodeURIComponent(e)}/document`);
}
async function jb(e, t) {
  return (await Re(
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
    throw Fs(), new Ue("unauthorized", "this server needs an access token", null);
  if (!o.ok) {
    let r = `http${o.status}`, s = o.statusText, a = null;
    try {
      const i = await o.json();
      r = i?.error?.code ?? r, s = i?.error?.message ?? s, a = i?.error?.details ?? null;
    } catch {
    }
    throw new Ue(r, s, a);
  }
  return await o.json();
}
async function kb() {
  return Bs("/api/open-tabs", void 0, { projects: [], active: null });
}
async function Eb(e) {
  await Bs("/api/open-tabs", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(e)
  }, null);
}
async function Uf(e) {
  return (await Bs(
    `/api/projects/${encodeURIComponent(e)}/close`,
    { method: "POST", headers: { "content-type": "application/json" }, body: "{}" },
    { closed: !1 }
  )).closed;
}
async function Rb(e, t = 100) {
  const n = new URLSearchParams({ tail: String(t) });
  return Re(`/api/projects/${encodeURIComponent(e)}/history?${n.toString()}`);
}
async function Un(e, t, n, o = !1) {
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
async function Nb(e, t, n, o) {
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
async function Tb(e) {
  return Re(`/api/projects/${encodeURIComponent(e)}/undo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ actor: { kind: "human", name: "reference UI" } })
  });
}
async function Pb(e) {
  return Re(`/api/projects/${encodeURIComponent(e)}/redo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ actor: { kind: "human", name: "reference UI" } })
  });
}
async function Ab(e, t, n, o = {}) {
  const r = { name: t, scale: n };
  for (const s of ["format", "quality", "pages", "print"])
    o[s] !== void 0 && (r[s] = o[s]);
  return Re(`/api/projects/${encodeURIComponent(e)}/export`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(r)
  });
}
async function Ib() {
  const e = await Bs("/api/page-sets", void 0, { pageSets: [] });
  return Array.isArray(e.pageSets) ? e.pageSets.filter((t) => typeof t == "string") : [];
}
async function Mb(e) {
  return Re(`/api/page-sets/${encodeURIComponent(e)}`);
}
async function Db() {
  await Re("/api/shutdown", { method: "POST" });
}
async function Ob() {
  return Re("/api/version");
}
async function $b() {
  return Re("/api/agent-access");
}
async function Lb() {
  return Re("/api/agent-sessions");
}
async function zb() {
  return Re("/api/update-status");
}
async function _b(e) {
  return Re("/api/update-consent", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ updateCheck: e })
  });
}
async function ec(e, t) {
  const n = await fetch(
    `/api/projects/${encodeURIComponent(e)}/assets?filename=${encodeURIComponent(t.name)}`,
    {
      method: "POST",
      headers: { "content-type": t.type || "application/octet-stream" },
      body: t
    }
  );
  if (n.status === 401)
    throw Fs(), new Ue("unauthorized", "this server needs an access token", null);
  if (!n.ok) {
    let o = `http${n.status}`, r = n.statusText;
    try {
      const s = await n.json();
      o = s?.error?.code ?? o, r = s?.error?.message ?? r;
    } catch {
    }
    throw new Ue(o, r, null);
  }
  return await n.json();
}
const Fb = ["fill", "contain", "cover"], Cl = 8;
function Wf(e) {
  if (e.type !== "shape") return null;
  const t = e.shape;
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = t.kind;
    if (typeof n == "string") return n;
  }
  return null;
}
function Bb(e) {
  if (e.type !== "shape") return 0;
  const t = e.shape;
  if (t && typeof t == "object") {
    const n = t.cornerRadius;
    if (typeof n == "number") return n;
  }
  return 0;
}
const Vb = [
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
], jl = [
  "brightness",
  "contrast",
  "saturation",
  "blur",
  "grain",
  "dropShadow",
  "hueRotate",
  "invert"
];
function Hb(e) {
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
function Ub(e) {
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
async function Wb(e) {
  return (await Re(
    `/api/projects/${encodeURIComponent(e)}/presets`
  )).presets;
}
function qb(e) {
  const t = {
    opacity: e.opacity ?? 1,
    blendMode: e.blendMode ?? "normal",
    effects: e.effects ?? []
  };
  return e.type === "text" && (t.fontFamily = e.fontFamily, t.fontSize = e.fontSize, t.color = e.color ?? "#000000", t.align = e.align ?? "left", t.lineHeight = e.lineHeight ?? 1.2, t.paragraphSpacing = e.paragraphSpacing ?? 0), e.type === "shape" && (e.fill && (t.fill = e.fill), e.stroke && (t.stroke = e.stroke)), t;
}
async function Kb(e) {
  return Re(`/api/projects/${encodeURIComponent(e)}/slots`);
}
async function Xb(e, t, n = 1) {
  return Re(
    `/api/projects/${encodeURIComponent(e)}/variants`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ variants: t, scale: n })
    }
  );
}
function qf(e, t, n = "png") {
  return `/api/projects/${encodeURIComponent(e)}/exports/${encodeURIComponent(t)}.${n}`;
}
async function Yb() {
  return (await Re("/api/fonts")).families;
}
function $a(e, t = "Aa Bb 0123") {
  return `/api/fonts/specimen.png?${new URLSearchParams({
    family: e.family,
    weight: String(e.weight),
    style: e.style,
    hash: e.hash,
    sample: t
  }).toString()}`;
}
async function Gb() {
  return (await Re(
    "/catalogue-specimens/manifest.json"
  )).families;
}
async function Jb() {
  const e = await Re("/api/fonts");
  return { families: e.families ?? [], faces: e.faces ?? [] };
}
async function Zb(e) {
  return Re(
    `/api/fonts?filename=${encodeURIComponent(e.name)}`,
    {
      method: "POST",
      headers: { "content-type": e.type || "application/octet-stream" },
      body: e
    }
  );
}
async function Qb(e) {
  return Re(
    `/api/fonts/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function ew() {
  return Re("/api/fonts/catalogue");
}
async function kl(e) {
  return Re("/api/fonts/install", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ pack: e })
  });
}
function tw(e, t) {
  return `/api/projects/${encodeURIComponent(e)}/preview.svg?v=${t}`;
}
async function Bn(e) {
  return URL.createObjectURL(await Vs(e));
}
async function Vs(e) {
  const t = await fetch(e);
  if (t.status === 401)
    throw Fs(), new Ue("unauthorized", "this server needs an access token", null);
  if (!t.ok) {
    let n = `http${t.status}`, o = t.statusText, r = null;
    try {
      const s = await t.json();
      s?.error && (n = s.error.code ?? n, o = s.error.message ?? o, r = s.error.details ?? null);
    } catch {
    }
    throw new Ue(n, o, r);
  }
  return await t.blob();
}
function Qr(e, t, n = 1, o) {
  const r = new URLSearchParams({ scale: String(n), v: String(t) });
  return o?.only?.length && r.set("only", o.only.join(",")), o?.exclude?.length && r.set("exclude", o.exclude.join(",")), `/api/projects/${encodeURIComponent(e)}/preview.png?${r.toString()}`;
}
async function Kf(e, t, n) {
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
function tr(e) {
  return !e.protected && !e.readOnly && !e.locked;
}
function es(e) {
  return e.protected ? "protected — no tool can change this layer" : e.readOnly ? "read-only — inspectable but never mutable" : e.locked ? "locked — unlock it to make changes" : null;
}
function El(e) {
  return !e.includes("'") && !/[\r\n]/.test(e) ? `'${e}'` : JSON.stringify(e);
}
function nw(e) {
  const t = ["mcp", "--workspace", e.workspace], n = JSON.stringify(
    { mcpServers: { assemblash: { command: e.executable, args: t } } },
    null,
    2
  ), o = [
    "[mcp_servers.assemblash]",
    `command = ${El(e.executable)}`,
    `args = [${t.map(El).join(", ")}]`
  ].join(`
`);
  return [
    { id: "json", title: y("agents.jsonTitle"), hint: y("agents.jsonHint"), text: n },
    { id: "codex", title: y("agents.codexTitle"), hint: y("agents.codexHint"), text: o },
    { id: "url", title: y("agents.urlTitle"), hint: y("agents.urlHint"), text: e.mcpUrl }
  ];
}
async function ow(e) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(e);
    return;
  }
  const t = document.createElement("textarea");
  t.value = e, t.setAttribute("readonly", ""), t.style.position = "fixed", t.style.opacity = "0", document.body.append(t), t.select();
  const n = document.execCommand("copy");
  if (t.remove(), !n) throw new Error(y("agents.copyRefused"));
}
const Rl = "assemblash-agent-hint-v1";
function rw({
  host: e,
  controller: t
}) {
  Fe();
  const [n, o] = p.useState(null), [r, s] = p.useState(!1), a = p.useRef(e);
  a.current = e, p.useEffect(() => (t.current = (l) => {
    o(l), s(!0);
  }, () => {
    t.current = null;
  }), [t]);
  const i = n === null ? [] : nw(n);
  return /* @__PURE__ */ c.jsxs(
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
        /* @__PURE__ */ c.jsx(lo, { align: "center", justify: "between", gap: "3", mb: "md", children: /* @__PURE__ */ c.jsxs("div", { children: [
          /* @__PURE__ */ c.jsx(ee, { component: "p", size: "xs", fw: 600, mb: 4, style: { letterSpacing: "0.08em" }, children: y("agents.protocol") }),
          /* @__PURE__ */ c.jsx(Nc, { order: 2, size: "h2", m: 0, children: y("agents.dialogTitle") })
        ] }) }),
        /* @__PURE__ */ c.jsx(ee, { component: "p", size: "sm", c: "dimmed", mb: "sm", children: y("agents.introLocal") }),
        /* @__PURE__ */ c.jsx(ee, { component: "p", size: "sm", c: "dimmed", mb: "md", children: y("agents.introConfig") }),
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
        /* @__PURE__ */ c.jsx(ye, { id: "agents-blocks", gap: "md", children: i.map((l) => /* @__PURE__ */ c.jsxs(ye, { component: "section", className: "agent-block", "data-block": l.id, gap: "xs", children: [
          /* @__PURE__ */ c.jsxs(lo, { align: "center", justify: "between", gap: "md", my: "sm", children: [
            /* @__PURE__ */ c.jsx(Nc, { order: 3, size: "h4", m: 0, children: l.title }),
            /* @__PURE__ */ c.jsxs(
              le,
              {
                size: "xs",
                variant: "light",
                className: "agent-copy",
                onClick: () => {
                  ow(l.text).then(
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
          /* @__PURE__ */ c.jsx(ee, { component: "p", size: "xs", c: "dimmed", mb: "xs", children: l.hint }),
          /* @__PURE__ */ c.jsx("pre", { className: "agents-config", children: /* @__PURE__ */ c.jsx("code", { children: l.text }) })
        ] }, l.id)) }),
        /* @__PURE__ */ c.jsx(lo, { justify: "flex-end", gap: "md", mt: "lg", children: /* @__PURE__ */ c.jsx(le, { id: "agents-done", onClick: () => s(!1), children: y("common.done") }) })
      ]
    }
  );
}
function sw(e) {
  const t = document.createElement("div");
  t.dataset.island = "agents", document.body.append(t);
  const n = { current: null };
  We("agents", t, /* @__PURE__ */ c.jsx(rw, { host: e, controller: n }));
  async function o() {
    try {
      const s = await $b();
      n.current?.(s);
    } catch (s) {
      const a = s instanceof Ue ? s.message : String(s);
      e.say(y("agents.openError", { error: a }), "error");
      return;
    }
  }
  function r() {
    let s = !1;
    try {
      s = window.localStorage.getItem(Rl) !== null, window.localStorage.setItem(Rl, "shown");
    } catch {
    }
    s || o();
  }
  return { open: o, offerOnFirstRun: r };
}
const Xf = [
  { id: "png", label: "PNG", detail: "export.pngDetail", icon: "ph-image" },
  { id: "svg", label: "SVG", detail: "export.svgDetail", icon: "ph-file-svg" },
  { id: "pdf", label: "PDF", detail: "export.pdfDetail", icon: "ph-file-pdf" },
  { id: "jpeg", label: "JPEG", detail: "export.jpegDetail", icon: "ph-file-jpg" },
  { id: "webp", label: "WebP", detail: "export.webpDetail", icon: "ph-file-image" }
];
function aw(e) {
  return e === "jpeg" ? "jpg" : e;
}
const ua = 90;
function Yf(e) {
  const t = e.canvas.bleed;
  return t ? [t.top, t.right, t.bottom, t.left].some((n) => typeof n == "number" && n > 0) : !1;
}
function iw(e, t) {
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
      return e.pageSet && (n.pages = e.pageSet), e.print && Yf(t) && (n.print = !0), n;
    }
  }
}
function cw(e, t, n, o) {
  if (e === "svg")
    return {
      url: tw(t, Le(n)),
      filename: `${o}.svg`
    };
  const r = aw(e);
  return { url: qf(t, o, r), filename: `${o}.${r}` };
}
const da = [
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
const lw = {
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
function Nl(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function An(e, t = "?") {
  return typeof e == "string" && e.length > 0 ? e : t;
}
function Gf(e) {
  const t = lw[e.code];
  if (t) return y(t);
  const n = Nl(e.details);
  switch (e.code) {
    case "pageSetNotFound":
      return y("refusals.pageSetNotFound", { set: An(n.name) });
    case "pageSetMalformed":
      return y("refusals.pageSetMalformed", { set: An(n.set) });
    case "pageSetMemberMissing": {
      const r = (Array.isArray(n.missing) ? n.missing : []).map((s) => An(Nl(s).name)).join(", ");
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
function uw(e) {
  const t = window.document.getElementById(e);
  if (!t) throw new Error(`missing element #${e}`);
  return t;
}
function Tl(e) {
  return e.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "assemblash-export";
}
function Pl(e) {
  return e < 1024 ? y("export.bytes", { count: je(e) }) : e < 1024 * 1024 ? `${je(Math.round(e / 102.4) / 10)} KB` : `${je(Math.round(e / (1024 * 1024) * 10) / 10)} MB`;
}
function fa(e) {
  return Xf.find((t) => t.id === e)?.label ?? e.toUpperCase();
}
function dw(e) {
  return e instanceof Ue ? Gf(e) ?? `${e.message} (${e.code})` : y("errors.unexpected", { message: String(e) });
}
function fw({ host: e, controller: t }) {
  const [n, o] = p.useState("png"), [r, s] = p.useState("8k"), [a, i] = p.useState(ua), [l, u] = p.useState(!1), [f, h] = p.useState(!1), [d, m] = p.useState("assemblash-export"), [g, v] = p.useState(null), [x, b] = p.useState(null), [E, S] = p.useState(!1), [k, R] = p.useState(!1), [T, C] = p.useState(null);
  Fe();
  const w = p.useRef(null), A = e.document(), $ = e.pageSet(), z = n === "svg", V = A ? Yf(A) : !1, B = n === "pdf" && f && $ !== null, M = da.find((_) => _.id === r) ?? da[0];
  function O() {
    w.current && URL.revokeObjectURL(w.current), w.current = null, C(null), b(null), v(null);
  }
  function D() {
    const _ = e.document();
    if (!_) return y("export.noProject");
    if (B && $) return y("export.pageSetSummary", { count: je($.count), set: $.set });
    const U = z ? { width: _.canvas.width, height: _.canvas.height } : $o(_, M), X = `${je(U.width)} × ${je(U.height)}`;
    return n === "svg" ? `${X} ${y("export.svgSummary")}` : n === "png" ? `${X} ${y("export.pngSummary")}` : `${X} ${y("export.rasterSummary", { format: fa(n) })}`;
  }
  p.useEffect(() => {
    const _ = () => {
      const U = e.document(), X = e.project();
      if (!U || !X) {
        e.say(y("export.projectRequired"), "error");
        return;
      }
      O(), m(Tl(U.name ?? X)), o("png"), s("8k"), i(ua), u(!1), h(!1), R(!0);
    };
    return t.current = _, window.addEventListener("assemblash:export-open", _), () => {
      window.removeEventListener("assemblash:export-open", _), t.current = null, w.current && URL.revokeObjectURL(w.current);
    };
  }, [t, e]);
  function L(_) {
    _ !== n && (O(), o(_), _ === "pdf" && s("original"));
  }
  async function I(_) {
    if (_.preventDefault(), !_.currentTarget.reportValidity()) return;
    const U = e.project(), X = e.document();
    if (!U || !X) return;
    const ne = n, de = ne === "svg" ? { width: X.canvas.width, height: X.canvas.height, scale: 1 } : $o(X, M), oe = Tl(d);
    m(oe);
    const te = cw(ne, U, X, oe), fe = iw({
      format: ne,
      quality: a,
      print: l,
      pageSet: B && $ ? $.set : null
    }, X), K = fa(ne);
    await e.guard(y("export.openButton"), async () => {
      O(), S(!0);
      try {
        const q = ne === "svg" ? { width: de.width, height: de.height, bytes: 0, pages: void 0 } : await Ab(U, oe, de.scale, fe), ae = await Vs(te.url);
        w.current = URL.createObjectURL(ae), C({ url: w.current, filename: te.filename });
        const be = ne === "svg" ? ae.size : q.bytes;
        q.pages !== void 0 ? (b(y("export.readyPages", { format: K, pages: je(q.pages), size: Pl(be) })), e.say(y("export.exportedPages", { pages: je(q.pages), format: K }))) : (b(`${je(q.width)} × ${je(q.height)} ${y("export.ready", { format: K, size: Pl(be) })}`), e.say(y("export.exported", { width: je(q.width), height: je(q.height), format: K })));
      } catch (q) {
        throw v({ code: q instanceof Ue ? q.code : "unexpected", text: dw(q) }), q;
      } finally {
        S(!1);
      }
    });
  }
  const P = E ? B && $ ? y("export.pageSetSummary", { count: je($.count), set: $.set }) : y("export.renderingSize", {
    width: je(z || !A ? A?.canvas.width ?? 0 : $o(A, M).width),
    height: je(z || !A ? A?.canvas.height ?? 0 : $o(A, M).height)
  }) : x ?? (g ? "" : D()), F = () => {
    R(!1), O();
  };
  return /* @__PURE__ */ c.jsx(pt, { id: "export-dialog", "data-state": k ? "open" : "closed", opened: k, onClose: F, title: null, withCloseButton: !1, centered: !0, size: "lg", withinPortal: !1, keepMounted: !0, children: /* @__PURE__ */ c.jsx("div", { className: "export-mantine-root", children: /* @__PURE__ */ c.jsx("form", { id: "export-form", onSubmit: (_) => {
    I(_);
  }, children: /* @__PURE__ */ c.jsxs(ye, { gap: "md", children: [
    /* @__PURE__ */ c.jsxs(Ne, { justify: "space-between", align: "flex-start", children: [
      /* @__PURE__ */ c.jsxs("div", { children: [
        /* @__PURE__ */ c.jsx(ee, { size: "xs", c: "dimmed", children: y("export.eyebrow") }),
        /* @__PURE__ */ c.jsx(ee, { component: "h2", fw: 700, size: "lg", children: y("export.title") })
      ] }),
      /* @__PURE__ */ c.jsx(le, { type: "button", variant: "subtle", "aria-label": y("common.close"), onClick: F, children: "×" })
    ] }),
    /* @__PURE__ */ c.jsxs(ye, { gap: "xs", children: [
      /* @__PURE__ */ c.jsx(ee, { fw: 600, children: y("export.format") }),
      /* @__PURE__ */ c.jsx(us, { id: "export-formats", role: "radiogroup", "aria-label": y("export.format"), cols: { base: 2, xs: 3 }, spacing: "xs", children: Xf.map((_) => /* @__PURE__ */ c.jsx(On, { component: "button", type: "button", "data-format": _.id, role: "radio", "aria-checked": n === _.id, withBorder: !0, p: "sm", bg: n === _.id ? "red.0" : void 0, style: { cursor: "pointer", textAlign: "left" }, onClick: () => L(_.id), children: /* @__PURE__ */ c.jsxs(ye, { gap: 4, children: [
        /* @__PURE__ */ c.jsxs(Ne, { gap: "xs", children: [
          /* @__PURE__ */ c.jsx("i", { className: `ph ${_.icon}`, "aria-hidden": "true" }),
          /* @__PURE__ */ c.jsx("b", { children: _.label })
        ] }),
        /* @__PURE__ */ c.jsx(ee, { size: "sm", children: y(_.detail) })
      ] }) }, _.id)) })
    ] }),
    n === "pdf" && $ ? /* @__PURE__ */ c.jsxs(ye, { gap: "xs", children: [
      /* @__PURE__ */ c.jsx(ee, { fw: 600, children: y("export.pages") }),
      /* @__PURE__ */ c.jsx(Ne, { id: "export-pages", role: "radiogroup", "aria-label": y("export.pages"), grow: !0, children: [["this", y("export.pagesThis")], ["set", y("export.pagesSet", { count: je($.count), set: $.set })]].map(([_, U]) => {
        const X = _ === "set" === f;
        return /* @__PURE__ */ c.jsx(On, { component: "button", type: "button", "data-pages": _, role: "radio", "aria-checked": X, withBorder: !0, p: "sm", bg: X ? "red.0" : void 0, style: { cursor: "pointer", textAlign: "left" }, onClick: () => {
          O(), h(_ === "set");
        }, children: /* @__PURE__ */ c.jsxs(Ne, { gap: "xs", children: [
          /* @__PURE__ */ c.jsx("i", { className: `ph ${_ === "set" ? "ph-files" : "ph-file"}`, "aria-hidden": "true" }),
          /* @__PURE__ */ c.jsx("b", { children: U })
        ] }) }, _);
      }) })
    ] }) : null,
    /* @__PURE__ */ c.jsxs(ye, { id: "export-resolution-row", "aria-disabled": z, gap: "xs", children: [
      /* @__PURE__ */ c.jsx(ee, { fw: 600, children: y("export.resolution") }),
      /* @__PURE__ */ c.jsx(Ne, { id: "export-options", role: "radiogroup", "aria-label": y("export.resolution"), "aria-disabled": z, grow: !0, children: da.map((_) => {
        const U = A ? $o(A, _) : null;
        return /* @__PURE__ */ c.jsx(On, { component: "button", type: "button", "data-resolution": _.id, disabled: z, role: "radio", "aria-checked": r === _.id && !z, withBorder: !0, p: "sm", bg: r === _.id && !z ? "red.0" : void 0, style: { cursor: z ? "not-allowed" : "pointer", textAlign: "left" }, onClick: () => {
          s(_.id), O();
        }, children: /* @__PURE__ */ c.jsxs(ye, { gap: 4, children: [
          /* @__PURE__ */ c.jsxs(Ne, { gap: "xs", children: [
            /* @__PURE__ */ c.jsx("i", { className: `ph ${_.icon}`, "aria-hidden": "true" }),
            /* @__PURE__ */ c.jsx("b", { children: _.id === "original" ? y("export.original") : _.id === "8k" ? y("export.resolution8k") : _.label })
          ] }),
          /* @__PURE__ */ c.jsx(ee, { size: "sm", children: U ? `${je(U.width)} × ${je(U.height)}` : y(_.id === "original" ? "export.documentSize" : `export.longEdge${_.id}`) })
        ] }) }, _.id);
      }) })
    ] }),
    n === "jpeg" ? /* @__PURE__ */ c.jsx(yo, { id: "export-quality", label: y("export.quality"), description: y("export.qualityHint"), value: a, min: 1, max: 100, step: 1, clampBehavior: "strict", allowDecimal: !1, required: !0, onChange: (_) => {
      O(), i(typeof _ == "number" ? _ : Number(_) || ua);
    } }) : null,
    n === "pdf" && V ? /* @__PURE__ */ c.jsx(Gt, { id: "export-print", label: y("export.print"), description: y("export.printHint"), checked: l, onChange: (_) => {
      O(), u(_.currentTarget.checked);
    } }) : null,
    /* @__PURE__ */ c.jsx(dt, { id: "export-name", label: y("export.fileName"), value: d, onChange: (_) => m(_.currentTarget.value), pattern: "[A-Za-z0-9_-]+", maxLength: 60, required: !0 }),
    /* @__PURE__ */ c.jsx(ee, { id: "export-summary", "aria-live": "polite", fw: 500, children: P }),
    g ? /* @__PURE__ */ c.jsx(ee, { id: "export-error", role: "alert", c: "red", fw: 500, "data-error-code": g.code, children: g.text }) : null,
    /* @__PURE__ */ c.jsxs(Ne, { justify: "flex-end", children: [
      /* @__PURE__ */ c.jsxs(le, { id: "export-download", component: "a", href: T?.url ?? "#", download: T?.filename, hidden: !T, variant: "default", children: [
        /* @__PURE__ */ c.jsx("i", { className: "ph ph-download-simple", "aria-hidden": "true" }),
        " ",
        y("common.download")
      ] }),
      /* @__PURE__ */ c.jsx(le, { id: "export-cancel", type: "button", variant: "default", onClick: F, children: y("common.cancel") }),
      /* @__PURE__ */ c.jsxs(le, { id: "export-confirm", type: "submit", loading: E, value: "default", children: [
        /* @__PURE__ */ c.jsx("i", { className: `ph ${E ? "ph-circle-notch" : "ph-export"}`, "aria-hidden": "true" }),
        " ",
        E ? y("export.rendering") : y("export.confirm", { format: fa(n) })
      ] })
    ] })
  ] }) }) }) });
}
function pw(e) {
  const t = uw("export-dialog-mount"), n = { current: null };
  return We("export", t, /* @__PURE__ */ c.jsx(fw, { host: e, controller: n })), { open: () => {
    n.current ? n.current() : queueMicrotask(() => n.current?.());
  } };
}
function Al(e, t, n) {
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
function tc(e) {
  if (e.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  const t = e.map(ts), n = Math.min(...t.map((a) => a.x)), o = Math.min(...t.map((a) => a.y)), r = Math.max(...t.map((a) => a.x + a.width)), s = Math.max(...t.map((a) => a.y + a.height));
  return { x: n, y: o, width: r - n, height: s - o };
}
function hw(e, t) {
  const n = e.width ?? 0, o = e.height ?? 0;
  if (!(n > 0) || !(o > 0)) return { width: 300, height: 200 };
  const r = Math.min(t.width / n, t.height / o, 1);
  return {
    width: Math.max(1, Math.round(n * r)),
    height: Math.max(1, Math.round(o * r))
  };
}
function Jf(e, t, n, o = !1) {
  const r = n.width / (o ? t.width : Math.max(1, t.width)), s = n.height / (o ? t.height : Math.max(1, t.height)), a = n.x + (e.x + e.width / 2 - t.x) * r, i = n.y + (e.y + e.height / 2 - t.y) * s, l = o ? e.width * r : Math.max(1, e.width * r), u = o ? e.height * s : Math.max(1, e.height * s);
  return {
    x: a - l / 2,
    y: i - u / 2,
    width: l,
    height: u
  };
}
function pa(e) {
  const t = new DataView(new ArrayBuffer(8));
  return t.setFloat64(0, e), t.setBigUint64(0, t.getBigUint64(0) + 1n), t.getFloat64(0);
}
function mw(e, t, n, o, r, s, a = [e]) {
  if (![e.x, e.y, e.width, e.height, t, o, r].every(Number.isFinite)) return null;
  const i = n.includes("e") ? 1 : n.includes("w") ? -1 : 0, l = n.includes("s") ? 1 : n.includes("n") ? -1 : 0, u = Al(o, r, -t), f = i * u.x * (s.centre ? 2 : 1), h = l * u.y * (s.centre ? 2 : 1);
  if (f === 0 && h === 0) return { ...e };
  if (!(e.width > 0 && e.height > 0) || a.length === 0 || a.some((w) => !Number.isFinite(w.width) || !Number.isFinite(w.height) || w.width <= 0 || w.height <= 0)) return null;
  const d = 1 + f / e.width, m = 1 + h / e.height;
  if (![d, m].every(Number.isFinite)) return null;
  const g = Math.max(...a.map((w) => Math.min(1, w.width) / w.width)), v = Math.max(...a.map((w) => Math.min(1, w.height) / w.height));
  let x, b;
  if (s.ratio) {
    const w = i && l ? Math.abs(d - 1) >= Math.abs(m - 1) ? d : m : i ? d : m;
    x = b = Math.max(w, g, v);
  } else
    x = i ? Math.max(d, g) : 1, b = l ? Math.max(m, v) : 1;
  for (let w = 0; w < 4; w += 1) {
    const A = a.some((z) => z.width * x < Math.min(1, z.width)), $ = a.some((z) => z.height * b < Math.min(1, z.height));
    if (!A && !$) break;
    s.ratio ? x = b = pa(x) : (A && (x = pa(x)), $ && (b = pa(b)));
  }
  if (x === 1 && b === 1) return { ...e };
  const E = e.width * x, S = e.height * b, k = Al(
    s.centre ? 0 : i * (E - e.width) / 2,
    s.centre ? 0 : l * (S - e.height) / 2,
    t
  ), R = {
    x: e.x + e.width / 2 + k.x - E / 2,
    y: e.y + e.height / 2 + k.y - S / 2,
    width: E,
    height: S
  };
  if (t === 0 && (R.x = s.centre || i === 0 ? e.x + (e.width - E) / 2 : i > 0 ? e.x : e.x + e.width - E, R.y = s.centre || l === 0 ? e.y + (e.height - S) / 2 : l > 0 ? e.y : e.y + e.height - S), !Object.values(R).every(Number.isFinite) || E <= 0 || S <= 0) return null;
  const T = R.width / e.width, C = R.height / e.height;
  return a.some((w) => {
    const A = w.width * T, $ = w.height * C;
    return !Number.isFinite(A) || !Number.isFinite($) || A < Math.min(1, w.width) || $ < Math.min(1, w.height);
  }) ? null : R;
}
function gw(e, t) {
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
function vw(e, t, n) {
  const o = (e.transform.rotation ?? 0) * Math.PI / 180, r = Math.cos(o), s = Math.sin(o), a = e.transform.flipHorizontal ? -1 : 1, i = e.transform.flipVertical ? -1 : 1, l = (n.width - t.width) / 2, u = (n.height - t.height) / 2, f = n.x - t.x, h = n.y - t.y;
  if (e.type === "text" || e.type === "group") {
    const k = r * a * l - s * i * u, R = s * a * l + r * i * u, T = e.type === "group" && (a < 0 || i < 0), C = [1, 0, 0, 1, f + (T ? 0 : l) - k, h + (T ? 0 : u) - R];
    return C.every(Number.isFinite) ? C : null;
  }
  const d = n.width / t.width, m = n.height / t.height, g = r * r * d + s * s * m, v = r * s * (d - m), x = s * s * d + r * r * m, b = t.x + t.width / 2, E = t.y + t.height / 2, S = [g, v, v, x, n.x + n.width / 2 - g * b - v * E, n.y + n.height / 2 - v * b - x * E];
  return S.every(Number.isFinite) ? S : null;
}
const yw = "Aa Bb 0123", to = /* @__PURE__ */ new Map(), La = /* @__PURE__ */ new WeakMap(), za = /* @__PURE__ */ new WeakSet();
function bw(e) {
  let t = to.get(e);
  if (!t && (t = Vs(e).catch((n) => {
    throw to.delete(e), n;
  }), to.set(e, t), to.size > 64)) {
    const n = to.keys().next().value;
    n && to.delete(n);
  }
  return t;
}
function _a(e) {
  for (const t of e.querySelectorAll("img[data-font-specimen]")) {
    const n = La.get(t);
    n && URL.revokeObjectURL(n), La.delete(t), za.add(t), t.removeAttribute("src");
  }
}
function ww(e, t, n) {
  const o = window.document.createElement("span");
  o.className = "font-specimen";
  const r = window.document.createElement("img");
  r.className = "font-specimen-image", r.dataset.fontSpecimen = "", r.alt = "", r.setAttribute("aria-hidden", "true");
  const s = window.document.createElement("span");
  s.className = "font-specimen-status", s.hidden = !0, o.append(r, s), e.append(o), bw(t).then((a) => {
    if (!r.isConnected || za.has(r)) return;
    const i = URL.createObjectURL(a);
    La.set(r, i), r.src = i, s.hidden = !0;
  }).catch(() => {
    !r.isConnected || za.has(r) || (s.textContent = y(n), s.hidden = !1);
  });
}
function xw(e) {
  return e.find((t) => t.weight === 400 && t.style === "normal") ?? e.find((t) => t.style === "normal") ?? e[0] ?? null;
}
function Zf(e, t, n = yw) {
  ww(e, $a(t, n), "fonts.previewUnavailable");
}
function Qf(e, t) {
  return t.filter((n) => n.family === e).sort((n, o) => n.weight - o.weight);
}
let Sw = 0;
function Cw({ host: e, value: t, disabled: n, label: o, onCommit: r }) {
  const s = p.useMemo(() => ({ initialFamily: t, initialDisabled: n }), []);
  return p.useEffect(() => {
    s.setFamily?.(t), s.setDisabled?.(n);
  }, [s, t, n]), s.label = o, /* @__PURE__ */ c.jsx("span", { className: "font-selector", children: /* @__PURE__ */ c.jsx(ep, { host: e, actions: s, onCommit: r }) });
}
let jw = 0;
function kw(e, t) {
  const n = e.trim().toLowerCase();
  return n ? t.families.find((o) => o.toLowerCase() === n) ?? null : null;
}
function Ew({
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
      return t && Zf(i, t), () => _a(i);
  }, [t]), /* @__PURE__ */ c.jsx("li", { ref: a, id: r, "data-family": e, className: n ? "active" : void 0, "aria-selected": o, onMouseDown: s, children: /* @__PURE__ */ c.jsxs(Ce.Option, { value: e, active: n, selected: o, children: [
    /* @__PURE__ */ c.jsx("span", { className: "font-selector-family", children: e }),
    /* @__PURE__ */ c.jsx(ee, { component: "span", size: "xs", c: "dimmed", className: "font-selector-faces", children: t ? `${t.style === "italic" ? y("fonts.styleItalic") : y("fonts.styleNormal")} ${je(t.weight)}` : y("fonts.facesUnknown") }),
    !t && /* @__PURE__ */ c.jsx("span", { className: "font-specimen-status", children: y("fonts.previewUnavailable") })
  ] }) });
}
function ep({
  host: e,
  onCommit: t,
  actions: n
}) {
  Fe();
  const [o, r] = p.useState(n.initialFamily), [s, a] = p.useState(!1), [i, l] = p.useState(n.initialDisabled), [u, f] = p.useState(-1), h = p.useRef(null), d = p.useRef(""), m = p.useMemo(() => `font-selector-options-${++jw}`, []), g = Oi({
    loop: !0,
    onDropdownClose: () => f(-1)
  }), v = e.store(), x = o.trim().toLowerCase(), b = x ? v.families.filter((w) => w.toLowerCase().includes(x)) : v.families, E = p.useCallback(() => {
    g.closeDropdown(), f(-1);
  }, [g]), S = p.useCallback((w) => {
    d.current = w, r(w), a(!1), E(), h.current?.blur(), t(w);
  }, [E, t]), k = p.useCallback(() => {
    E();
    const w = h.current?.value.trim() ?? "";
    if (!w || w.toLowerCase() === d.current.toLowerCase()) return;
    const A = kw(w, e.store());
    if (!A) {
      a(!0);
      return;
    }
    d.current = A, r(A), a(!1), t(A);
  }, [E, e, t]), R = p.useCallback(() => {
    r(h.current?.value ?? ""), a(!1), f(-1), g.openDropdown();
  }, [g]), T = p.useCallback((w) => {
    h.current = w, w && (w.onfocus = () => qt.flushSync(() => R()), w.onblur = k, w.oninput = () => {
      qt.flushSync(() => {
        r(w.value), a(!1), f(-1), g.openDropdown();
      });
    }, w.onkeydown = (A) => qt.flushSync(() => C(A)));
  }, [n, k, R, C]);
  n.setFamily = (w) => {
    d.current = w, r(w), a(!1);
  }, n.setDisabled = (w) => {
    l(w), w && E();
  };
  function C(w) {
    if (w.key === "ArrowDown" || w.key === "ArrowUp") {
      w.preventDefault(), g.dropdownOpened || g.openDropdown(), b.length && f((A) => {
        const $ = w.key === "ArrowDown" ? 1 : -1;
        return (A + $ + b.length) % b.length;
      });
      return;
    }
    if (w.key === "Enter" && g.dropdownOpened && u >= 0) {
      const A = b[u];
      A && (w.preventDefault(), S(A));
      return;
    }
    w.key === "Escape" && g.dropdownOpened && (w.preventDefault(), w.stopPropagation(), E());
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
        onDismiss: () => E(),
        children: [
          /* @__PURE__ */ c.jsx(Ce.Target, { withKeyboardNavigation: !1, withAriaAttributes: !1, children: /* @__PURE__ */ c.jsx(
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
              onChange: (w) => {
                r(w.currentTarget.value), a(!1), f(-1), g.openDropdown();
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
                /* @__PURE__ */ c.jsx(ee, { component: "p", size: "xs", fw: 700, c: "dimmed", id: `${m}-heading`, className: "font-selector-heading", "data-i18n": "fonts.selectorHeading", children: y("fonts.selectorHeading") }),
                /* @__PURE__ */ c.jsxs(Ce.Options, { id: m, role: "listbox", children: [
                  b.map((w, A) => {
                    const $ = Qf(w, v.faces);
                    return /* @__PURE__ */ c.jsx(
                      Ew,
                      {
                        id: `${m}-${A}`,
                        family: w,
                        face: xw($),
                        active: A === u,
                        selected: A === u,
                        onMouseDown: (z) => {
                          z.preventDefault(), S(w);
                        }
                      },
                      w
                    );
                  }),
                  b.length === 0 && /* @__PURE__ */ c.jsx(Ce.Empty, { className: "font-selector-none", children: /* @__PURE__ */ c.jsx(ee, { component: "span", size: "xs", c: "dimmed", "data-i18n": "fonts.noFamilyMatches", children: y("fonts.noFamilyMatches") }) })
                ] })
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ c.jsx(ee, { component: "p", size: "xs", c: "dimmed", className: "font-selector-message", "data-i18n": "fonts.notInstalled", hidden: !s, children: y("fonts.notInstalled") })
  ] });
}
function Rw(e, t) {
  const n = window.document.createElement("span");
  n.className = "font-selector";
  const o = {
    initialFamily: "",
    initialDisabled: !1
  }, r = We(
    `font-selector-${++Sw}`,
    n,
    /* @__PURE__ */ c.jsx(ep, { host: e, onCommit: t, actions: o })
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
const Il = "Aa Bb 0123";
function Lo(e) {
  if (e.length <= 1) return e[0] ?? "";
  const t = ii();
  return new Intl.ListFormat(t === "pseudo" ? "en" : t, {
    style: "long",
    type: "conjunction"
  }).format(e);
}
function Ml(e) {
  const t = e / 1048576;
  return t >= 10 ? `${je(Math.round(t))} MB` : `${je(Math.max(0.1, Math.round(t * 10) / 10))} MB`;
}
const no = /* @__PURE__ */ new Map();
function Nw(e) {
  let t = no.get(e);
  if (!t && (t = Vs(e).catch((n) => {
    throw no.delete(e), n;
  }), no.set(e, t), no.size > 64)) {
    const n = no.keys().next().value;
    n && no.delete(n);
  }
  return t;
}
function Dl({
  url: e,
  unavailable: t,
  generation: n
}) {
  const [o, r] = p.useState(""), [s, a] = p.useState(!1);
  return p.useEffect(() => {
    let i = !0, l = "";
    return r(""), a(!1), Nw(e).then((u) => {
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
function Tw({ host: e, controller: t }) {
  const [n, o] = p.useState([]), [r, s] = p.useState([]), [a, i] = p.useState(Il), [l, u] = p.useState(Il), [f, h] = p.useState([]), [d, m] = p.useState(null), [g, v] = p.useState({}), [x, b] = p.useState(!1), [E, S] = p.useState(""), [k, R] = p.useState(!1), [T, C] = p.useState(0), [w, A] = p.useState(null), $ = Fe(), [z, V] = p.useState(!0), B = p.useRef(n), M = p.useRef(null), O = p.useRef(null), D = p.useRef(void 0);
  B.current = n;
  const L = p.useCallback((K, q) => {
    B.current = K, o(K), s(q), e.fontsChanged({ families: K, faces: q });
  }, [e]), I = p.useCallback(async () => {
    V(!0);
    const K = await Jb();
    L([...K.families], [...K.faces]);
  }, [L]);
  p.useLayoutEffect(() => (t.reload = I, t.focusInstall = () => M.current?.focus(), t.hasFamilies = () => B.current.length > 0, t.releaseSamples = () => {
    V(!1), C((K) => K + 1);
  }, I(), () => {
    window.clearTimeout(D.current), t.reload = async () => {
    }, t.focusInstall = () => {
    }, t.hasFamilies = () => !1, t.releaseSamples = () => {
    };
  }), [t, I]);
  const P = p.useCallback(async () => {
    if (d) return d;
    const K = await ew();
    return m(K), K;
  }, [d]);
  p.useEffect(() => {
    P().catch(() => m(null));
  }, [P]);
  const F = p.useCallback(async () => {
    try {
      const K = await P(), q = K.packs.default ?? [], ae = K.families.filter((be) => q.includes(be.family)).reduce((be, he) => be + he.bytes, 0);
      S(q.length ? y("fonts.defaultPackDescription", { names: Lo(q), bytes: Ml(ae) }) : y("fonts.noDefaultPack")), R(!1);
    } catch (K) {
      S(K instanceof Ue ? y("fonts.packDescribeErrorCode", { error: K.message, code: K.code }) : y("fonts.packDescribeError")), R(!0);
    }
  }, [P]);
  p.useEffect(() => {
    n.length || F();
  }, [n.length, F]), p.useEffect(() => {
    let K = !0;
    return Gb().then((q) => {
      K && v(q);
    }).catch(() => {
      K && v({});
    }), () => {
      K = !1;
    };
  }, []);
  const _ = p.useCallback(async () => {
    e.project() && await e.refresh();
  }, [e]), U = async () => {
    await e.guard(y("fonts.installFonts"), async () => {
      b(!0), e.say(y("fonts.downloadingDefault"));
      try {
        const K = await kl("default");
        await I(), await _(), e.say(y("fonts.installedFamilies", { names: Lo(K.families) }));
      } finally {
        b(!1);
      }
    });
  }, X = (K) => {
    e.guard(y("fonts.installNamedPack", { pack: K }), async () => {
      try {
        await kl(K), await I(), await _(), e.say(y("fonts.installedNamedPack", { pack: K }));
      } finally {
        C((q) => q + 1);
      }
    });
  }, ne = (K) => {
    const q = [...K ?? []];
    O.current && (O.current.value = ""), q.length && e.guard(y("fonts.importFont"), async () => {
      h([]);
      let ae = 0;
      const be = [];
      for (const ke of q)
        try {
          const re = await Zb(ke);
          ae += 1;
          const W = [...new Set(re.imported.map((H) => H.family))];
          be.push(W.length ? `${ke.name} → ${Lo(W)}` : y("fonts.importedFile", { file: ke.name }));
        } catch (re) {
          be.push(re instanceof Ue ? `${ke.name}: ${re.message} (${re.code})` : `${ke.name}: ${String(re)}`);
        }
      h(be), await I(), ae && await _();
      const he = q.length - ae;
      ae ? e.say(Ot("fonts.importResult", ae, {
        refused: he ? Ot("fonts.refusedCount", he) : ""
      })) : e.say(y("fonts.noneImported", { refused: Ot("fonts.refusedCount", he) }), "error");
    });
  }, de = (K) => {
    window.confirm(y("fonts.confirmRemove", { family: K })) && e.guard(y("fonts.removeAction", { family: K }), async () => {
      h([]);
      const q = await Qb(K);
      h([Ot("fonts.removedFiles", q.removed, { family: K })]), await I(), await _(), e.say(y("fonts.removedFromStore", { family: K }));
    });
  }, oe = (K) => {
    u(K), window.clearTimeout(D.current), D.current = window.setTimeout(() => {
      const q = K.trim();
      !q || [...q].some((ae) => /[\u0000-\u001f\u007f]/u.test(ae)) || i(q);
    }, 180);
  }, te = d ? ["text", "display", "mono", ...Object.keys(d.packs).filter((K) => !["default", "text", "display", "mono"].includes(K)).sort()] : [], fe = n.length === 0;
  return /* @__PURE__ */ c.jsxs(ye, { gap: "md", "data-testid": "font-manager", children: [
    /* @__PURE__ */ c.jsx(Q, { id: "font-empty", "data-testid": "font-empty", hidden: !fe, children: /* @__PURE__ */ c.jsxs(ye, { gap: "sm", children: [
      /* @__PURE__ */ c.jsx(ee, { component: "p", size: "sm", children: y("fonts.noneInstalled") }),
      /* @__PURE__ */ c.jsx(ee, { component: "p", className: "font-install-copy", size: "sm", c: "dimmed", children: y("fonts.defaultPackCopy") }),
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
          children: /* @__PURE__ */ c.jsxs(ye, { gap: 2, children: [
            /* @__PURE__ */ c.jsx("span", { id: "install-default-label", children: x ? y("fonts.installingDefault") : y("fonts.installDefaultPack") }),
            /* @__PURE__ */ c.jsx(ee, { id: "install-default-detail", component: "span", size: "xs", c: k ? "red" : void 0, children: E })
          ] })
        }
      )
    ] }) }),
    /* @__PURE__ */ c.jsx(
      dt,
      {
        className: "font-sample-field",
        ref: (K) => {
          K && (K.oninput = () => oe(K.value));
        },
        "data-testid": "font-sample",
        label: y("fonts.customSample"),
        "aria-label": y("fonts.customSample"),
        value: l,
        maxLength: 64,
        hidden: fe,
        onChange: (K) => oe(K.currentTarget.value)
      }
    ),
    /* @__PURE__ */ c.jsx("ul", { id: "font-list", "data-testid": "font-list", className: "font-list", hidden: fe, children: n.map((K) => {
      const q = r.filter((he) => he.family === K), ae = q.map(
        (he) => `${he.style === "italic" ? y("fonts.styleItalic") : y("fonts.styleNormal")} ${je(he.weight)}`
      ).join(", "), be = q.find((he) => he.weight === 400 && he.style === "normal") ?? q.find((he) => he.style === "normal") ?? q[0];
      return /* @__PURE__ */ c.jsxs("li", { className: "font-family", "data-family": K, children: [
        /* @__PURE__ */ c.jsxs(Ne, { justify: "space-between", align: "center", wrap: "nowrap", children: [
          /* @__PURE__ */ c.jsxs("div", { className: "font-family-text", children: [
            /* @__PURE__ */ c.jsx("strong", { children: K }),
            /* @__PURE__ */ c.jsx("span", { className: "font-faces", children: Ot("fonts.faceCount", q.length, { described: ae }) })
          ] }),
          /* @__PURE__ */ c.jsx(
            le,
            {
              size: "xs",
              color: "red",
              variant: "light",
              className: "small danger-action",
              "data-remove-family": K,
              "data-testid": `remove-font-${K}`,
              "aria-label": y("fonts.removeFamily", { family: K }),
              onClick: () => de(K),
              children: y("fonts.removeButton")
            }
          )
        ] }),
        z && be ? /* @__PURE__ */ c.jsx(
          Dl,
          {
            url: $a(be, a),
            unavailable: "fonts.previewUnavailable",
            generation: T + $
          }
        ) : z ? /* @__PURE__ */ c.jsx("span", { className: "font-specimen-status", children: y("fonts.previewUnavailable") }) : null
      ] }, K);
    }) }),
    /* @__PURE__ */ c.jsx(
      Pe,
      {
        id: "font-pack-section",
        "data-testid": "font-pack-section",
        className: "font-pack-section",
        hidden: te.length === 0,
        value: w,
        onChange: A,
        keepMounted: !0,
        keepMountedMode: "display-none",
        children: /* @__PURE__ */ c.jsxs(Pe.Item, { value: "packs", children: [
          /* @__PURE__ */ c.jsx(Pe.Control, { children: y("fonts.morePacks") }),
          /* @__PURE__ */ c.jsx(Pe.Panel, { children: /* @__PURE__ */ c.jsx(ye, { id: "font-pack-options", "data-testid": "font-pack-options", className: "font-pack-options", gap: "sm", children: te.map((K) => {
            const q = d?.packs[K] ?? [], ae = q.filter((he) => !n.includes(he)), be = d?.families.filter((he) => ae.includes(he.family)).reduce((he, ke) => he + ke.bytes, 0) ?? 0;
            return /* @__PURE__ */ c.jsx(
              le,
              {
                "data-pack": K,
                "data-testid": `font-pack-${K}`,
                className: "font-pack-button",
                variant: "default",
                disabled: ae.length === 0,
                onClick: () => X(K),
                children: /* @__PURE__ */ c.jsxs(ye, { gap: "xs", align: "stretch", children: [
                  /* @__PURE__ */ c.jsx("strong", { children: y("fonts.namedPackTitle", { pack: K }) }),
                  /* @__PURE__ */ c.jsx(ee, { component: "span", size: "xs", c: "dimmed", children: ae.length ? y("fonts.namedPackDownload", { names: Lo(q), bytes: Ml(be) }) : y("fonts.namedPackInstalled", { names: Lo(q) }) }),
                  /* @__PURE__ */ c.jsx(Ne, { gap: "xs", wrap: "wrap", className: "font-pack-samples", children: q.map((he) => {
                    const ke = r.filter((H) => H.family === he).find((H) => H.weight === 400 && H.style === "normal") ?? r.find((H) => H.family === he), re = g[he], W = ke ? $a(ke) : re ? `/catalogue-specimens/${re.src.replace(/^\.\//u, "")}` : null;
                    return /* @__PURE__ */ c.jsxs("span", { className: "font-pack-family", children: [
                      /* @__PURE__ */ c.jsx(ee, { component: "span", size: "xs", fw: 700, className: "font-pack-family-name", children: he }),
                      z && W ? /* @__PURE__ */ c.jsx(
                        Dl,
                        {
                          url: W,
                          unavailable: ke ? "fonts.previewUnavailable" : "fonts.cataloguePreviewUnavailable",
                          generation: T + $
                        }
                      ) : W ? null : /* @__PURE__ */ c.jsx("span", { className: "font-specimen-status", children: y("fonts.cataloguePreviewUnavailable") })
                    ] }, he);
                  }) })
                ] })
              },
              K
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
        onClick: () => O.current?.click(),
        children: y("fonts.importFile")
      }
    ),
    /* @__PURE__ */ c.jsx(
      "input",
      {
        id: "font-file",
        ref: O,
        type: "file",
        accept: ".ttf,.otf,.ttc,.otc,.woff,.woff2",
        multiple: !0,
        hidden: !0,
        onChange: (K) => ne(K.currentTarget.files)
      }
    ),
    /* @__PURE__ */ c.jsx("div", { id: "font-feedback", "data-testid": "font-feedback", className: "font-feedback", "aria-live": "polite", children: f.map((K, q) => /* @__PURE__ */ c.jsx("p", { children: K }, `${q}-${K}`)) })
  ] });
}
function Pw(e, t) {
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
  return We("font-manager", t, /* @__PURE__ */ c.jsx(Tw, { host: e, controller: n })), {
    reload: () => n.reload(),
    focusInstall: () => n.focusInstall(),
    hasFamilies: () => n.hasFamilies(),
    releaseSamples: () => n.releaseSamples()
  };
}
class Aw {
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
const Iw = [
  { size: "1080x1080", width: 1080, height: 1080, label: "common.square" },
  { size: "1920x1080", width: 1920, height: 1080, label: "common.landscape" },
  { size: "1080x1350", width: 1080, height: 1350, label: "common.portrait" },
  { size: "1080x1920", width: 1080, height: 1920, label: "common.story" }
];
function Mw({
  host: e,
  controller: t
}) {
  const [n, o] = p.useState(!1), [r, s] = p.useState(""), [a, i] = p.useState(1080), [l, u] = p.useState(1080), [f, h] = p.useState("#ffffff"), [d, m] = p.useState("1080x1080"), [g, v] = p.useState(!1);
  Fe(), p.useEffect(() => (t.current = () => {
    s(""), i(1080), u(1080), h("#ffffff"), m("1080x1080"), o(!0);
  }, () => {
    t.current = null;
  }), [t]);
  async function x(b) {
    b.preventDefault();
    const E = r.trim(), S = Number(a), k = Number(l);
    if (!(!E || !Number.isFinite(S) || !Number.isFinite(k)) && !(S <= 0 || k <= 0 || g)) {
      v(!0);
      try {
        await e.create(E, S, k, f) && o(!1);
      } finally {
        v(!1);
      }
    }
  }
  return /* @__PURE__ */ c.jsx(
    pt,
    {
      id: "new-project-dialog",
      "data-state": n ? "open" : "closed",
      opened: n,
      onClose: () => o(!1),
      title: y("dialogs.newProjectTitle"),
      centered: !0,
      size: "lg",
      children: /* @__PURE__ */ c.jsx("form", { id: "new-project-form", onSubmit: (b) => {
        x(b);
      }, children: /* @__PURE__ */ c.jsxs(ye, { gap: "md", children: [
        /* @__PURE__ */ c.jsx(
          dt,
          {
            id: "new-project-name",
            label: y("common.name"),
            placeholder: y("dialogs.projectNamePlaceholder"),
            value: r,
            onChange: (b) => s(b.currentTarget.value),
            autoComplete: "off",
            required: !0,
            "data-autofocus": !0
          }
        ),
        /* @__PURE__ */ c.jsxs(ye, { gap: "xs", children: [
          /* @__PURE__ */ c.jsx(ee, { fw: 600, children: y("canvas.label") }),
          /* @__PURE__ */ c.jsx(us, { id: "canvas-presets", cols: { base: 2, sm: 4 }, children: Iw.map((b) => /* @__PURE__ */ c.jsx(
            le,
            {
              type: "button",
              "data-size": b.size,
              variant: d === b.size ? "light" : "default",
              onClick: () => {
                i(b.width), u(b.height), m(b.size);
              },
              children: y(b.label)
            },
            b.size
          )) })
        ] }),
        /* @__PURE__ */ c.jsxs(Ne, { grow: !0, align: "start", children: [
          /* @__PURE__ */ c.jsx(
            yo,
            {
              id: "new-project-width",
              label: y("common.width"),
              value: a,
              onChange: (b) => {
                i(b), m("");
              },
              min: 1,
              allowDecimal: !1,
              required: !0
            }
          ),
          /* @__PURE__ */ c.jsx(
            yo,
            {
              id: "new-project-height",
              label: y("common.height"),
              value: l,
              onChange: (b) => {
                u(b), m("");
              },
              min: 1,
              allowDecimal: !1,
              required: !0
            }
          ),
          /* @__PURE__ */ c.jsx(
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
        /* @__PURE__ */ c.jsxs(Ne, { justify: "flex-end", children: [
          /* @__PURE__ */ c.jsx(le, { id: "new-project-cancel", type: "button", variant: "default", onClick: () => o(!1), children: y("common.cancel") }),
          /* @__PURE__ */ c.jsx(le, { id: "create-project-confirm", type: "submit", loading: g, children: y("dialogs.createProject") })
        ] })
      ] }) })
    }
  );
}
function Dw(e) {
  const t = document.getElementById("new-project-dialog-mount");
  if (!t) throw new Error("missing element #new-project-dialog-mount");
  const n = { current: null };
  return We("project-create", t, /* @__PURE__ */ c.jsx(Mw, { host: e, controller: n })), { open: () => n.current?.() };
}
function Ow({ controller: e }) {
  const [t, n] = p.useState(null), [o, r] = p.useState(!1);
  Fe();
  const [s, a] = p.useState(""), i = p.useRef(null), l = p.useRef(null), u = p.useRef(null), f = p.useCallback(() => {
    r(!1), n(null), a("");
  }, []), h = p.useCallback((m) => {
    m.preventDefault();
    const g = i.current;
    if (!g?.reportValidity()) return;
    const v = g.value.trim();
    if (!v) return;
    const x = t?.submit;
    f(), x?.(v);
  }, [f, t]), d = p.useCallback((m) => {
    n(m), a(""), r(!0);
  }, []);
  return e.open = d, /* @__PURE__ */ c.jsxs(
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
        /* @__PURE__ */ c.jsx(ee, { component: "p", size: "xs", fw: 600, mb: "xs", style: { letterSpacing: "0.08em" }, children: y("dialogs.documentSetup") }),
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
                dt,
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
              /* @__PURE__ */ c.jsxs(lo, { justify: "flex-end", gap: "sm", mt: "lg", children: [
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
function $w() {
  const e = window.document.createElement("div");
  e.dataset.island = "name-prompt", window.document.body.append(e);
  const t = {};
  We("name-prompt", e, /* @__PURE__ */ c.jsx(Ow, { controller: t }));
  const n = t.open;
  if (!n) throw new Error("Mantine name prompt failed to mount");
  return {
    request(o, r, s, a) {
      n({ titleKey: o, labelKey: r, confirmKey: s, submit: a });
    }
  };
}
function Lw(e) {
  const t = window.document.getElementById(e);
  if (!t) throw new Error(`missing element #${e}`);
  return t;
}
function zw({ controller: e }) {
  const { colorScheme: t, setColorScheme: n } = Oh(), [o, r] = p.useState(!1), [s, a] = p.useState("settings-agents");
  Fe();
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
  return /* @__PURE__ */ c.jsx(pt, { ref: u, id: "settings-dialog", "data-state": o ? "open" : "closed", opened: o, onClose: h, title: null, withCloseButton: !1, centered: !0, size: "xl", withinPortal: !1, keepMounted: !0, keepMountedMode: "display-none", children: /* @__PURE__ */ c.jsx("form", { id: "settings-form", onSubmit: d, children: /* @__PURE__ */ c.jsxs(ye, { gap: "md", children: [
    /* @__PURE__ */ c.jsxs(Ne, { justify: "space-between", align: "flex-start", children: [
      /* @__PURE__ */ c.jsxs("div", { children: [
        /* @__PURE__ */ c.jsx(ee, { size: "xs", c: "dimmed", children: y("settings.preferences") }),
        /* @__PURE__ */ c.jsx(ee, { component: "h2", fw: 700, children: y("settings.openButton") })
      ] }),
      /* @__PURE__ */ c.jsx(le, { id: "settings-close", type: "submit", value: "cancel", variant: "subtle", title: y("common.close"), "aria-label": y("common.close"), children: "×" })
    ] }),
    /* @__PURE__ */ c.jsxs(Pe, { value: s, onChange: (m) => a(m), variant: "separated", keepMounted: !0, keepMountedMode: "display-none", children: [
      /* @__PURE__ */ c.jsxs(Pe.Item, { id: "settings-agents", className: "settings-section", value: "settings-agents", children: [
        /* @__PURE__ */ c.jsx(Pe.Control, { children: /* @__PURE__ */ c.jsxs(Ne, { gap: "sm", children: [
          /* @__PURE__ */ c.jsx("i", { className: "ph ph-robot", "aria-hidden": "true" }),
          /* @__PURE__ */ c.jsxs(ye, { gap: 0, children: [
            /* @__PURE__ */ c.jsx(ee, { size: "xs", c: "dimmed", children: y("settings.collaboration") }),
            /* @__PURE__ */ c.jsx(ee, { id: "settings-agents-heading", fw: 600, children: y("settings.aiAgents") })
          ] })
        ] }) }),
        /* @__PURE__ */ c.jsx(Pe.Panel, { children: /* @__PURE__ */ c.jsxs(ye, { gap: "sm", children: [
          /* @__PURE__ */ c.jsx(le, { id: "agents", type: "button", leftSection: /* @__PURE__ */ c.jsx("i", { className: "ph ph-plugs-connected", "aria-hidden": "true" }), children: y("agents.dialogTitle") }),
          /* @__PURE__ */ c.jsx(Gt, { id: "setting-follow", ref: i, defaultChecked: !0, label: y("agents.followChanges") }),
          /* @__PURE__ */ c.jsx(ee, { size: "sm", c: "dimmed", children: y("agents.followHint") })
        ] }) })
      ] }),
      /* @__PURE__ */ c.jsxs(Pe.Item, { id: "settings-document", className: "settings-section", value: "settings-document", children: [
        /* @__PURE__ */ c.jsx(Pe.Control, { children: /* @__PURE__ */ c.jsxs(Ne, { gap: "sm", children: [
          /* @__PURE__ */ c.jsx("i", { className: "ph ph-file", "aria-hidden": "true" }),
          /* @__PURE__ */ c.jsxs(ye, { gap: 0, children: [
            /* @__PURE__ */ c.jsx(ee, { size: "xs", c: "dimmed", children: y("settings.project") }),
            /* @__PURE__ */ c.jsx(ee, { id: "settings-document-heading", fw: 600, children: y("settings.projectActions") })
          ] })
        ] }) }),
        /* @__PURE__ */ c.jsx(Pe.Panel, { children: /* @__PURE__ */ c.jsxs(ye, { gap: "sm", children: [
          /* @__PURE__ */ c.jsx(le, { id: "rename-project", type: "button", variant: "default", disabled: !0, leftSection: /* @__PURE__ */ c.jsx("i", { className: "ph ph-pencil-simple", "aria-hidden": "true" }), children: y("projects.renameButton") }),
          /* @__PURE__ */ c.jsx(le, { id: "reload", type: "button", variant: "default", disabled: !0, leftSection: /* @__PURE__ */ c.jsx("i", { className: "ph ph-arrows-clockwise", "aria-hidden": "true" }), children: y("projects.reloadButton") }),
          /* @__PURE__ */ c.jsx(le, { id: "delete-project", type: "button", color: "red", variant: "light", disabled: !0, leftSection: /* @__PURE__ */ c.jsx("i", { className: "ph ph-trash", "aria-hidden": "true" }), children: y("projects.deleteButton") })
        ] }) })
      ] }),
      /* @__PURE__ */ c.jsxs(Pe.Item, { id: "settings-fonts", className: "settings-section", value: "settings-fonts", children: [
        /* @__PURE__ */ c.jsx(Pe.Control, { children: /* @__PURE__ */ c.jsxs(Ne, { gap: "sm", children: [
          /* @__PURE__ */ c.jsx("i", { className: "ph ph-text-aa", "aria-hidden": "true" }),
          /* @__PURE__ */ c.jsxs(ye, { gap: 0, children: [
            /* @__PURE__ */ c.jsx(ee, { size: "xs", c: "dimmed", children: y("settings.workspace") }),
            /* @__PURE__ */ c.jsx(ee, { id: "settings-fonts-heading", fw: 600, children: y("toolbar.fontsButton") })
          ] })
        ] }) }),
        /* @__PURE__ */ c.jsx(Pe.Panel, { children: /* @__PURE__ */ c.jsxs(ye, { gap: "sm", children: [
          /* @__PURE__ */ c.jsx(ee, { className: "hint", size: "sm", c: "dimmed", children: y("fonts.settingsHint") }),
          /* @__PURE__ */ c.jsx(le, { id: "settings-fonts-open", type: "button", variant: "default", leftSection: /* @__PURE__ */ c.jsx("i", { className: "ph ph-arrow-square-out", "aria-hidden": "true" }), children: y("fonts.openTools") })
        ] }) })
      ] }),
      /* @__PURE__ */ c.jsxs(Pe.Item, { id: "settings-application", className: "settings-section", value: "settings-application", children: [
        /* @__PURE__ */ c.jsx(Pe.Control, { children: /* @__PURE__ */ c.jsxs(Ne, { gap: "sm", children: [
          /* @__PURE__ */ c.jsx("i", { className: "ph ph-gear-six", "aria-hidden": "true" }),
          /* @__PURE__ */ c.jsxs(ye, { gap: 0, children: [
            /* @__PURE__ */ c.jsx(ee, { size: "xs", c: "dimmed", children: y("settings.application") }),
            /* @__PURE__ */ c.jsx(ee, { id: "settings-application-heading", fw: 600, children: y("settings.updatesControl") })
          ] })
        ] }) }),
        /* @__PURE__ */ c.jsx(Pe.Panel, { children: /* @__PURE__ */ c.jsxs(ye, { gap: "sm", children: [
          /* @__PURE__ */ c.jsx(go, { id: "setting-language", ref: l, label: /* @__PURE__ */ c.jsx("span", { "data-i18n": "settings.languageLabel", children: y("settings.languageLabel") }), defaultValue: "en", data: [
            { value: "en", label: y("settings.languageEnglish") },
            { value: "fr", label: y("settings.languageFrench") },
            { value: "de", label: y("settings.languageGerman") }
          ] }),
          /* @__PURE__ */ c.jsx(
            Rt.Wrapper,
            {
              id: "setting-appearance-wrapper",
              label: y("settings.appearance"),
              labelElement: "div",
              labelProps: { id: "setting-appearance-label" },
              children: /* @__PURE__ */ c.jsx(
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
          /* @__PURE__ */ c.jsx(Gt, { id: "setting-update-check", label: y("updates.dailyCheckSetting") }),
          /* @__PURE__ */ c.jsxs(ee, { size: "sm", c: "dimmed", children: [
            y("updates.dailyCheckBeforeCommand"),
            " ",
            /* @__PURE__ */ c.jsx("code", { children: "assemblash upgrade" }),
            y("updates.dailyCheckAfterCommand")
          ] }),
          /* @__PURE__ */ c.jsx(ee, { id: "update-note", component: "p", size: "sm", c: "dimmed", hidden: !0, "aria-live": "polite" }),
          /* @__PURE__ */ c.jsx(le, { id: "shutdown", type: "button", color: "red", variant: "light", hidden: !0, leftSection: /* @__PURE__ */ c.jsx("i", { className: "ph ph-power", "aria-hidden": "true" }), children: y("app.stop") })
        ] }) })
      ] })
    ] })
  ] }) }) });
}
function _w() {
  const e = Lw("settings-dialog-mount"), t = { current: null };
  return We("settings", e, /* @__PURE__ */ c.jsx(zw, { controller: t })), {
    open: (n, o) => t.current?.open(n, o),
    close: () => t.current?.close(),
    isOpen: () => t.current?.isOpen() ?? !1
  };
}
function Fw(e, t) {
  const n = new Set(t), o = e.filter((a) => !n.has(a)), r = e.findIndex((a) => n.has(a)), s = r < 0 ? o.length : e.slice(0, r).filter((a) => !n.has(a)).length;
  return [...o.slice(0, s), ...t, ...o.slice(s)];
}
const ns = 64;
class Bw {
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
function Vw(e) {
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
function Hw(e, t) {
  const n = t.trim().toLocaleLowerCase();
  return e.filter((o) => !n || o.toLocaleLowerCase().includes(n));
}
function Uw(e, t, n = ns) {
  if (e.length === 0) return { kind: "empty" };
  const o = e.filter((r) => !t.includes(r));
  return t.length + o.length > n ? { kind: "tooMany", count: e.length, max: n } : { kind: "open", pages: [...e], toOpen: o, order: Fw(t, e) };
}
const Ol = {
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
function Ww({ host: e, controller: t, boundary: n }) {
  const [o, r] = p.useState({
    projects: [],
    query: "",
    currentProject: null
  }), [s, a] = p.useState(""), i = p.useRef(""), [l, u] = p.useState(y("projects.searchPlaceholder")), [f, h] = p.useState(!1), [d, m] = p.useState(-1), [g, v] = p.useState(t.pageSets), x = Fe(), b = p.useRef(null), E = p.useRef(void 0), S = p.useRef(o);
  S.current = o, p.useEffect(() => (t.setProjects = (M) => {
    if (S.current = M, r(M), m(-1), !M.query) {
      const O = M.currentProject ? M.projects.find((D) => D.id === M.currentProject) : void 0;
      u(O?.name ?? O?.id ?? (M.projects.length ? y("projects.searchPlaceholder") : y("projects.none")));
    }
  }, t.setCurrentProject = (M) => {
    const O = S.current, D = { ...O, currentProject: M };
    S.current = D, r(D);
    const L = M ? O.projects.find((I) => I.id === M) : void 0;
    u(L?.name ?? L?.id ?? (O.projects.length ? y("projects.searchPlaceholder") : y("projects.none")));
  }, t.setPageSets = (M) => v(M), v(t.pageSets), t.focus = () => b.current?.focus(), () => {
    window.clearTimeout(E.current), t.setProjects = () => {
    }, t.setCurrentProject = () => {
    }, t.setPageSets = () => {
    }, t.focus = () => {
    };
  }), [t]), p.useEffect(() => {
    if (s) return;
    const M = o.currentProject ? o.projects.find((O) => O.id === o.currentProject) : void 0;
    u(M?.name ?? M?.id ?? (o.projects.length ? y("projects.searchPlaceholder") : y("projects.none")));
  }, [x]), p.useEffect(() => {
    const M = (O) => {
      (!(O.target instanceof Node) || !n.contains(O.target)) && (h(!1), m(-1));
    };
    return document.addEventListener("pointerdown", M), () => document.removeEventListener("pointerdown", M);
  }, [n]);
  function k(M) {
    h(M), M || m(-1);
  }
  function R(M) {
    const O = { ...S.current, currentProject: M.id };
    S.current = O, r(O), u(M.name ?? M.id), i.current = "", a(""), b.current && (b.current.value = ""), b.current?.blur(), k(!1), e.openProject(M.id);
  }
  function T(M) {
    i.current = M, a(M), window.clearTimeout(E.current), E.current = window.setTimeout(() => e.search(M.trim()), 150);
  }
  function C(M) {
    i.current = "", a(""), b.current && (b.current.value = ""), b.current?.blur(), k(!1), e.openPageSet(M);
  }
  const w = Hw(g, s), A = o.projects.length + w.length, $ = (M) => M < o.projects.length ? `project-option-${M}` : `page-set-option-${M - o.projects.length}`;
  function z(M) {
    if (f || k(!0), A === 0) return;
    const O = M > 0 ? 0 : A - 1, D = d < 0 ? O : Math.max(0, Math.min(A - 1, d + M));
    m(D), window.requestAnimationFrame(() => {
      document.getElementById($(D))?.scrollIntoView({ block: "nearest" });
    });
  }
  const V = o.projects.length === 0 && w.length === 0 ? o.query ? y("projects.noMatching") : y("projects.none") : "", B = f && d >= 0 && d < A ? $(d) : void 0;
  return /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
    /* @__PURE__ */ c.jsx("i", { className: "ph ph-magnifying-glass", "aria-hidden": "true" }),
    /* @__PURE__ */ c.jsx(
      dt,
      {
        id: "project-search",
        "data-current-project": o.currentProject ?? "",
        ref: b,
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
        onChange: (M) => T(M.currentTarget.value),
        onFocus: () => k(!0),
        onKeyDown: (M) => {
          if (M.key === "ArrowDown" || M.key === "ArrowUp") {
            M.preventDefault(), z(M.key === "ArrowDown" ? 1 : -1);
            return;
          }
          if (M.key === "Escape") {
            k(!1);
            return;
          }
          if (M.key !== "Enter") return;
          const O = b.current?.value ?? i.current;
          O !== i.current && (i.current = O, a(O));
          const D = d >= o.projects.length ? w[d - o.projects.length] : void 0;
          if (D) {
            M.preventDefault(), C(D);
            return;
          }
          const L = o.projects[d], I = O.trim().toLocaleLowerCase(), F = o.projects.find(
            (_) => _.id.toLocaleLowerCase() === I || (_.name ?? _.id).toLocaleLowerCase() === I
          ) ?? L;
          F && (M.preventDefault(), R(F));
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
          k(M), M && b.current?.focus();
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
          o.projects.map((M, O) => /* @__PURE__ */ c.jsxs(
            le,
            {
              id: `project-option-${O}`,
              className: `project-option${O === d ? " active" : ""}`,
              styles: Ol,
              type: "button",
              variant: "subtle",
              title: M.name ?? M.id,
              "data-project-id": M.id,
              role: "option",
              "aria-selected": M.id === o.currentProject,
              onClick: () => R(M),
              children: [
                /* @__PURE__ */ c.jsx("strong", { children: M.name ?? M.id }),
                /* @__PURE__ */ c.jsx(
                  "span",
                  {
                    className: "project-option-count",
                    "data-i18n-count": "projects.layerCount",
                    "data-count": String(M.layers),
                    children: Ot("projects.layerCount", M.layers)
                  }
                )
              ]
            },
            M.id
          )),
          w.length > 0 ? /* @__PURE__ */ c.jsx("p", { className: "project-options-heading", role: "presentation", children: y("pageSets.heading") }) : null,
          w.map((M, O) => /* @__PURE__ */ c.jsxs(
            le,
            {
              id: `page-set-option-${O}`,
              className: `project-option page-set-option${o.projects.length + O === d ? " active" : ""}`,
              styles: Ol,
              type: "button",
              variant: "subtle",
              title: y("pageSets.openLabel", { set: M }),
              "data-page-set": M,
              role: "option",
              "aria-selected": !1,
              onClick: () => C(M),
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
          V ? /* @__PURE__ */ c.jsx("p", { className: "project-options-empty", children: V }) : null
        ]
      }
    )
  ] });
}
function qw(e, t) {
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
  }, o = We(
    "project-picker",
    t,
    /* @__PURE__ */ c.jsx(Ww, { host: e, controller: n, boundary: t })
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
function Kw(e) {
  const t = window.document.getElementById(e);
  if (!t) throw new Error(`missing element #${e}`);
  return t;
}
function $l(e) {
  return e.kind ?? "text";
}
function Xw({ host: e, projectController: t }) {
  const [n, o] = p.useState([]), [r, s] = p.useState(() => /* @__PURE__ */ new Map()), [a, i] = p.useState([]), [l, u] = p.useState(""), [f, h] = p.useState([]), [d, m] = p.useState(!1), [g, v] = p.useState(!1);
  Fe();
  const [x, b] = p.useState(null), E = p.useRef([]), S = p.useRef(d);
  S.current = d;
  const k = p.useRef(null), R = p.useRef(null);
  function T() {
    for (const O of E.current) URL.revokeObjectURL(O);
    E.current = [];
  }
  function C() {
    const O = {};
    for (const D of n) {
      const L = r.get(D.name);
      L && (O[D.name] = L);
    }
    return O;
  }
  function w(O, D) {
    s((L) => new Map(L).set(O, D));
  }
  async function A(O, D) {
    T(), h([]);
    const L = [];
    for (const I of D.variants) {
      const P = await Bn(qf(O, I.name));
      E.current.push(P), L.push({ variant: I, url: P });
    }
    h(L);
  }
  async function $(O, D) {
    await e.guard(O, async () => {
      const L = e.project();
      if (!L) return;
      const I = await Xb(L, D);
      await A(L, I), e.say(Ot("templates.renderedCount", I.variants.length, {
        what: O,
        version: je(I.templateVersion)
      }));
    });
  }
  async function z(O = null) {
    const D = e.project();
    if (s(/* @__PURE__ */ new Map()), i([]), u(""), T(), h([]), !D) {
      o([]), S.current = !1, m(!1);
      return;
    }
    const L = await Kb(D), I = L.isTemplate ? L.slots : [];
    o(I), S.current = I.length > 0, m(I.length > 0);
    const P = /* @__PURE__ */ new Map();
    for (const F of I)
      $l(F) === "color" && P.set(F.name, "#000000");
    if (O) {
      for (const [F, _] of O.values)
        I.some((U) => U.name === F) && P.set(F, _);
      i([...O.batch]), u(O.variantName);
    }
    s(P);
  }
  p.useLayoutEffect(() => {
    t.current = {
      projectChanged: z,
      draft: () => ({ values: new Map(r), batch: [...a], variantName: l }),
      setOpen: v,
      isVisible: () => S.current
    };
  }), p.useEffect(() => () => {
    t.current = null, T();
  }, [t]);
  async function V(O) {
    const D = O.currentTarget.files?.[0];
    O.currentTarget.value = "", D && await e.guard(y("templates.loadValues"), async () => {
      const L = JSON.parse(await D.text());
      if (!Array.isArray(L)) throw new Error(y("templates.expectedArray"));
      const I = [];
      for (const P of L) {
        const F = P;
        if (typeof F.name != "string") throw new Error(y("templates.missingName"));
        const _ = {};
        for (const [U, X] of Object.entries(F.values ?? {})) _[U] = String(X);
        I.push({ name: F.name, values: _ });
      }
      i(I), e.say(Ot("templates.loadedVariants", I.length, { file: D.name }));
    });
  }
  async function B(O) {
    const D = O.currentTarget.files?.[0];
    O.currentTarget.value = "";
    const L = x;
    b(null), !(!D || !L) && await e.guard(y("templates.importImage"), async () => {
      const I = e.project();
      if (!I) return;
      const P = await ec(I, D);
      w(L, P.asset.id), await e.refresh(), s((F) => new Map(F)), e.say(y("templates.importedImage", { file: D.name, slot: L }));
    });
  }
  const M = e.document()?.assets ?? [];
  return /* @__PURE__ */ c.jsxs(ye, { component: "section", id: "templates", className: g ? "templates open" : "templates", hidden: !d, gap: "md", "aria-label": y("templates.drawerLabel"), children: [
    /* @__PURE__ */ c.jsxs(Ne, { justify: "space-between", align: "flex-start", children: [
      /* @__PURE__ */ c.jsxs("div", { children: [
        /* @__PURE__ */ c.jsx(ee, { size: "xs", c: "dimmed", children: y("templates.workspace") }),
        /* @__PURE__ */ c.jsx(ee, { component: "h2", fw: 700, children: y("templates.buildVariants") })
      ] }),
      /* @__PURE__ */ c.jsx(le, { id: "templates-close", type: "button", variant: "subtle", title: y("templates.close"), "aria-label": y("common.close"), children: "×" })
    ] }),
    /* @__PURE__ */ c.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 18rem), 1fr))", gap: "var(--mantine-spacing-md)" }, children: [
      /* @__PURE__ */ c.jsxs(ye, { gap: "sm", children: [
        /* @__PURE__ */ c.jsx(ee, { component: "h3", fw: 600, children: y("templates.fillSlots") }),
        /* @__PURE__ */ c.jsx(ye, { id: "slot-form", gap: "sm", children: n.map((O) => {
          const D = $l(O), L = r.get(O.name) ?? (D === "color" ? "#000000" : "");
          return /* @__PURE__ */ c.jsxs(ye, { gap: 4, "data-slot": O.name, children: [
            D === "image" ? /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
              /* @__PURE__ */ c.jsx(uo, { label: `${O.name}${O.required ? " *" : ""}`, title: O.description ?? void 0, "data-slot": O.name, value: r.get(O.name) ?? "", onChange: (I) => w(O.name, I ?? ""), data: [{ value: "", label: y(M.length ? "templates.leaveAsIs" : "templates.noImages") }, ...M.map((I) => ({ value: I.id, label: I.path }))] }),
              /* @__PURE__ */ c.jsx(le, { type: "button", size: "xs", variant: "default", onClick: () => {
                b(O.name), k.current?.click();
              }, children: y("templates.importButton") })
            ] }) : D === "color" ? /* @__PURE__ */ c.jsx(dt, { type: "color", label: `${O.name}${O.required ? " *" : ""}`, title: O.description ?? void 0, "data-slot": O.name, value: L, onChange: (I) => w(O.name, I.currentTarget.value) }) : /* @__PURE__ */ c.jsx(dt, { label: `${O.name}${O.required ? " *" : ""}`, title: O.description ?? void 0, "data-slot": O.name, value: L, onChange: (I) => w(O.name, I.currentTarget.value) }),
            O.description && /* @__PURE__ */ c.jsx(ee, { size: "xs", c: "dimmed", children: O.description })
          ] }, O.name);
        }) }),
        /* @__PURE__ */ c.jsx("input", { ref: k, id: "slot-image-file", type: "file", accept: "image/*,.svg", hidden: !0, onChange: (O) => {
          B(O);
        } }),
        /* @__PURE__ */ c.jsxs(Ne, { align: "end", wrap: "wrap", children: [
          /* @__PURE__ */ c.jsx(le, { id: "preview-variant", type: "button", onClick: () => {
            $(y("templates.preview"), [{ name: "preview", values: C() }]);
          }, children: y("templates.preview") }),
          /* @__PURE__ */ c.jsx(dt, { id: "variant-name", label: y("templates.variantName"), value: l, onChange: (O) => u(O.currentTarget.value) }),
          /* @__PURE__ */ c.jsx(le, { id: "add-variant", type: "button", variant: "default", onClick: () => {
            const O = l.trim();
            if (!O) {
              e.say(y("templates.variantNameRequired"), "error");
              return;
            }
            i((D) => [...D, { name: O, values: C() }]), u(""), e.say(y("templates.addedToBatch", { name: O }));
          }, children: y("templates.addToBatch") })
        ] })
      ] }),
      /* @__PURE__ */ c.jsxs(ye, { gap: "sm", children: [
        /* @__PURE__ */ c.jsx(ee, { component: "h3", fw: 600, children: y("templates.batch") }),
        /* @__PURE__ */ c.jsx(ye, { component: "ol", id: "variant-rows", gap: "xs", m: 0, p: 0, children: a.map((O, D) => /* @__PURE__ */ c.jsx(On, { component: "li", withBorder: !0, p: "xs", children: /* @__PURE__ */ c.jsxs(Ne, { justify: "space-between", align: "flex-start", wrap: "nowrap", children: [
          /* @__PURE__ */ c.jsxs(ye, { gap: 2, style: { minWidth: 0 }, children: [
            /* @__PURE__ */ c.jsx(ee, { fw: 600, children: O.name }),
            /* @__PURE__ */ c.jsx(ee, { size: "xs", c: "dimmed", children: Object.entries(O.values).map(([L, I]) => `${L}=${I}`).join("  ") })
          ] }),
          /* @__PURE__ */ c.jsx(le, { type: "button", size: "xs", variant: "subtle", onClick: () => i((L) => L.filter((I, P) => P !== D)), children: y("templates.removeButton") })
        ] }) }, `${D}-${O.name}`)) }),
        /* @__PURE__ */ c.jsx("input", { ref: R, id: "values-file", type: "file", accept: "application/json,.json", hidden: !0, onChange: (O) => {
          V(O);
        } }),
        /* @__PURE__ */ c.jsxs(Ne, { wrap: "wrap", children: [
          /* @__PURE__ */ c.jsx(le, { id: "load-values", type: "button", variant: "default", onClick: () => R.current?.click(), children: y("templates.loadJson") }),
          /* @__PURE__ */ c.jsx(le, { id: "render-batch", type: "button", disabled: !a.length, onClick: () => {
            $(y("templates.renderBatch"), a);
          }, children: a.length ? Ot("templates.renderVariants", a.length) : y("templates.renderBatch") }),
          /* @__PURE__ */ c.jsx(le, { id: "clear-batch", type: "button", variant: "default", disabled: !a.length, onClick: () => i([]), children: y("templates.clear") })
        ] })
      ] }),
      /* @__PURE__ */ c.jsxs(ye, { gap: "sm", children: [
        /* @__PURE__ */ c.jsx(ee, { component: "h3", fw: 600, children: y("templates.renderedVariants") }),
        /* @__PURE__ */ c.jsx("div", { id: "gallery", style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))", gap: "var(--mantine-spacing-sm)" }, children: f.map(({ variant: O, url: D }) => /* @__PURE__ */ c.jsxs(On, { component: "figure", withBorder: !0, p: "sm", m: 0, children: [
          /* @__PURE__ */ c.jsx("img", { src: D, alt: y("templates.variantAlt", { name: O.name }), style: { display: "block", width: "100%", height: "auto" } }),
          /* @__PURE__ */ c.jsxs(ye, { component: "figcaption", gap: 4, mt: "sm", children: [
            /* @__PURE__ */ c.jsx(ee, { component: "strong", children: O.name }),
            /* @__PURE__ */ c.jsx(ee, { size: "xs", children: y("templates.bytesSize", { width: je(O.width), height: je(O.height), bytes: je(O.bytes) }) }),
            /* @__PURE__ */ c.jsx(ee, { component: "code", size: "xs", title: O.hash, children: O.hash.replace(/^sha256:/, "").slice(0, 12) }),
            /* @__PURE__ */ c.jsx(le, { component: "a", href: D, download: `${O.name}.png`, variant: "default", size: "xs", children: y("templates.downloadButton") })
          ] })
        ] }, `${O.name}-${O.hash}`)) })
      ] })
    ] })
  ] });
}
function Yw(e) {
  const t = Kw("templates-mantine-mount"), n = { current: null };
  return We("templates", t, /* @__PURE__ */ c.jsx(Xw, { host: e, projectController: n })), {
    projectChanged: async (o) => {
      await n.current?.projectChanged(o);
    },
    draft: () => n.current?.draft() ?? { values: /* @__PURE__ */ new Map(), batch: [], variantName: "" },
    setOpen: (o) => n.current?.setOpen(o),
    isVisible: () => n.current?.isVisible() ?? !1
  };
}
function Ll(e, t) {
  return !!(e?.group && t?.group && e.group.set === t.group.set);
}
const ha = "application/x-assemblash-tab";
function Gw({ host: e, bind: t }) {
  Fe();
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
    const v = d.key === "ArrowLeft" ? -1 : d.key === "ArrowRight" ? 1 : 0;
    if ((v !== 0 || ["Home", "End", "Delete"].includes(d.key)) && d.stopPropagation(), v !== 0 && d.altKey && d.shiftKey) {
      d.preventDefault(), a.current = g.id, e.move(g.id, m + v);
      return;
    }
    v !== 0 ? (d.preventDefault(), l(m + v)) : d.key === "Home" || d.key === "End" ? (d.preventDefault(), l(d.key === "Home" ? 0 : n.length - 1)) : d.key === "Delete" && (d.preventDefault(), e.close(g.id));
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
        const g = d.group, v = !!g && !Ll(n[m - 1], d), x = !!g && !Ll(d, n[m + 1]), b = g ? y("tabs.page", { page: g.page, count: g.count, set: g.set }) : "", E = [d.name, b, d.changed ? y("tabs.changed") : ""].filter(Boolean).join(" — ");
        return /* @__PURE__ */ c.jsxs(
          "div",
          {
            className: "project-tab",
            "data-active": d.active || void 0,
            "data-changed": d.changed || void 0,
            "data-page-set": g?.set,
            "data-page-number": g?.page,
            "data-group-start": v || void 0,
            "data-group-end": x || void 0,
            "data-drop": r === m ? "before" : r === m + 1 && m === n.length - 1 ? "after" : void 0,
            draggable: !0,
            onDragStart: (S) => {
              S.dataTransfer.setData(ha, d.id), S.dataTransfer.effectAllowed = "move";
            },
            onDragOver: (S) => {
              S.dataTransfer.types.includes(ha) && (S.preventDefault(), S.dataTransfer.dropEffect = "move", s(h(S, m)));
            },
            onDrop: (S) => {
              const k = S.dataTransfer.getData(ha);
              if (s(null), !k) return;
              S.preventDefault();
              const R = n.findIndex((C) => C.id === k);
              let T = h(S, m);
              R >= 0 && R < T && (T -= 1), e.move(k, T);
            },
            onDragEnd: () => s(null),
            children: [
              v && g ? /* @__PURE__ */ c.jsxs("span", { className: "project-tab-group-label", "data-group-label": g.set, title: y("tabs.groupLabel", { set: g.set }), children: [
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
                  title: E,
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
                    b ? /* @__PURE__ */ c.jsx("span", { className: "sr-only", children: `, ${b}` }) : null,
                    d.changed ? /* @__PURE__ */ c.jsx("span", { className: "project-tab-marker", "data-tab-marker": d.id, role: "img", "aria-label": y("tabs.changed") }) : null
                  ]
                }
              ),
              /* @__PURE__ */ c.jsx(
                ai,
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
function Jw(e, t) {
  let n = [], o = null;
  const r = (s) => {
    o = s, s(n);
  };
  return We("project-tabs", t, /* @__PURE__ */ c.jsx(Gw, { host: e, bind: r })), {
    setTabs(s) {
      n = s, o?.(s);
    }
  };
}
const Bo = (e) => /* @__PURE__ */ c.jsx("i", { className: `ph ${e}`, "aria-hidden": "true" });
function os(e) {
  return e.name ?? (e.type === "text" ? e.text : e.type) ?? e.type;
}
function Zw(e) {
  return e.type === "shape" ? { rect: "ph-square", ellipse: "ph-circle", line: "ph-line-segment", path: "ph-bezier-curve" }[Wf(e) ?? ""] ?? "ph-shapes" : { text: "ph-text-t", image: "ph-image", svg: "ph-pen-nib", group: "ph-stack" }[e.type] ?? "ph-square";
}
function Qw({ layer: e, finish: t }) {
  const n = p.useRef(null), o = p.useRef(!1);
  p.useEffect(() => {
    n.current?.focus(), n.current?.select();
  }, []);
  const r = (s) => {
    o.current || (o.current = !0, t(s ? n.current?.value.trim() ?? "" : null));
  };
  return /* @__PURE__ */ c.jsx(
    dt,
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
function ex({ layer: e, depth: t, parent: n, inheritedGuard: o, snapshot: r, commands: s, elementProps: a, renaming: i, startRename: l, finishRename: u, expanded: f, hasChildren: h, toggleExpanded: d }) {
  const [m, g] = p.useState(!1), [v, x] = p.useState(!1), b = p.useRef(null);
  p.useEffect(() => () => {
    b.current && clearTimeout(b.current.timer);
  }, []);
  const E = r.selectedIds.includes(e.id), S = !o && tr(e), k = o || !!es(e), R = !o && !e.protected && !e.readOnly, T = (w, A) => {
    E || s.select(e.id, !1), s.contextMenu?.(e.id, w, A);
  }, C = () => {
    b.current && clearTimeout(b.current.timer);
  };
  return /* @__PURE__ */ c.jsx(
    Q,
    {
      ...a,
      className: `${a.className} layer${E ? " selected" : ""}${k ? " guarded" : ""}${e.visible === !1 ? " hidden-layer" : ""}${m ? " dragging" : ""}${v ? " drop-target" : ""}`,
      "data-id": e.id,
      "data-type": e.type,
      "data-parent": n ?? "",
      style: { ...a.style, "--layer-depth": t, paddingInlineStart: 8 + t * 16 },
      draggable: S,
      onClick: (w) => {
        if (b.current?.fired) {
          b.current = null;
          return;
        }
        a.onClick(w), s.select(e.id, w.shiftKey || w.ctrlKey || w.metaKey);
      },
      onContextMenu: (w) => {
        w.preventDefault(), T(w.clientX, w.clientY);
      },
      onPointerDown: (w) => {
        if (w.pointerType !== "touch" || !s.contextMenu) return;
        C();
        const A = w.clientX, $ = w.clientY;
        b.current = { x: A, y: $, fired: !1, timer: setTimeout(() => {
          b.current && (b.current.fired = !0), T(A, $);
        }, 450) };
      },
      onPointerMove: (w) => {
        b.current && Math.hypot(w.clientX - b.current.x, w.clientY - b.current.y) > 8 && C();
      },
      onPointerUp: C,
      onPointerCancel: C,
      onDragStart: (w) => {
        w.dataTransfer.setData("text/plain", e.id), g(!0);
      },
      onDragEnd: () => {
        g(!1), x(!1);
      },
      onDragOver: (w) => {
        w.preventDefault(), x(!0);
      },
      onDragLeave: () => x(!1),
      onDrop: (w) => {
        w.preventDefault(), x(!1);
        const A = w.dataTransfer.getData("text/plain");
        if (!A || A === e.id || !r.document) return;
        const $ = Be($e(r.document)), z = n ? $.find((M) => M.layer.id === n)?.layer : null, V = z?.type === "group" ? z.children ?? [] : $e(r.document), B = Math.max(0, V.findIndex((M) => M.id === e.id) + 1);
        s.reorder(A, e.id, e.type === "group" ? { at: "in", parent: e.id } : n ? { at: "in", parent: n, index: B } : { at: "root", index: B });
      },
      children: /* @__PURE__ */ c.jsxs(Ne, { gap: "xs", wrap: "nowrap", children: [
        h ? /* @__PURE__ */ c.jsx(
          Uo,
          {
            className: "layer-control",
            size: "sm",
            variant: "subtle",
            "data-layer-toggle": e.id,
            title: y(f ? "layers.collapseGroup" : "layers.expandGroup"),
            "aria-label": y(f ? "layers.collapseGroup" : "layers.expandGroup"),
            "aria-expanded": f,
            onClick: (w) => {
              w.stopPropagation(), d();
            },
            children: Bo(f ? "ph-caret-down" : "ph-caret-right")
          }
        ) : null,
        /* @__PURE__ */ c.jsx(
          Uo,
          {
            className: "layer-control",
            size: "sm",
            variant: "subtle",
            disabled: !S,
            title: y(e.visible === !1 ? "layers.show" : "layers.hide"),
            "aria-label": y(e.visible === !1 ? "layers.show" : "layers.hide"),
            onClick: (w) => {
              w.stopPropagation(), s.toggleVisibility(e.id);
            },
            children: Bo(e.visible === !1 ? "ph-eye-slash" : "ph-eye")
          }
        ),
        /* @__PURE__ */ c.jsx(Q, { className: "layer-icon", children: Bo(Zw(e)) }),
        /* @__PURE__ */ c.jsx(Q, { style: { flex: 1, minWidth: 0 }, children: i ? /* @__PURE__ */ c.jsx(Qw, { layer: e, finish: (w) => {
          u(), w !== null && w !== (e.name ?? "") && s.rename(e.id, w);
        } }) : /* @__PURE__ */ c.jsx(
          ee,
          {
            component: "span",
            className: "name",
            size: "sm",
            truncate: !0,
            title: es(e) ?? y("layers.renameHint"),
            onDoubleClick: (w) => {
              w.stopPropagation(), S && l();
            },
            children: os(e)
          }
        ) }),
        /* @__PURE__ */ c.jsx(
          Uo,
          {
            className: "layer-control",
            size: "sm",
            variant: "subtle",
            disabled: !R,
            title: y(e.locked ? "layers.unlock" : "layers.lock"),
            "aria-label": y(e.locked ? "layers.unlock" : "layers.lock"),
            onClick: (w) => {
              w.stopPropagation(), s.toggleLocked(e.id);
            },
            children: Bo(e.locked ? "ph-lock" : "ph-lock-open")
          }
        )
      ] })
    }
  );
}
function tx({ snapshot: e, commands: t }) {
  Fe();
  const [n, o] = p.useState(null), [r, s] = p.useState({}), a = e.document ? $e(e.document) : [], i = p.useMemo(() => {
    const h = e.query.trim().toLowerCase(), d = (g) => os(g).toLowerCase().includes(h) || g.type === "group" && (g.children ?? []).some(d), m = (g, v, x) => [...g].reverse().filter((b) => !h || d(b)).map((b) => ({
      value: b.id,
      label: os(b),
      layer: b,
      parent: v,
      guarded: x,
      ...b.type === "group" ? { children: m(b.children ?? [], b.id, x || !tr(b)) } : {}
    }));
    return m(e.document ? $e(e.document) : [], null, !1);
  }, [e.document, e.query]), l = p.useMemo(() => {
    const h = /* @__PURE__ */ new Map(), d = (m) => {
      for (const g of m)
        h.set(g.value, g), g.children && d(g.children);
    };
    return d(i), h;
  }, [i]), u = p.useMemo(() => Object.fromEntries([...l.keys()].map((h) => [h, r[h] ?? !0])), [l, r]), f = zf({
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
        const m = l.get(d.dataset.value ?? "");
        if (m && (h.key === "F2" && (h.preventDefault(), h.stopPropagation(), !m.guarded && tr(m.layer) && o(m.value)), (h.key === "Enter" || h.key === " ") && (h.preventDefault(), h.stopPropagation(), t.select(m.value, h.shiftKey || h.ctrlKey || h.metaKey)), h.key === "F10" && h.shiftKey)) {
          h.preventDefault(), h.stopPropagation(), e.selectedIds.includes(m.value) || t.select(m.value, !1);
          const g = (d.classList.contains("layer") ? d : d.querySelector(".layer")).getBoundingClientRect();
          t.contextMenu?.(m.value, g.left + 24, g.top + 24);
        }
      },
      renderNode: ({ node: h, level: d, elementProps: m, expanded: g, hasChildren: v }) => {
        const { layer: x, parent: b, guarded: E } = h;
        return /* @__PURE__ */ c.jsx(
          ex,
          {
            layer: x,
            depth: d - 1,
            parent: b,
            inheritedGuard: E,
            snapshot: e,
            commands: t,
            elementProps: m,
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
  ) : /* @__PURE__ */ c.jsx(Q, { component: "ul", id: "layers", role: "tree", "aria-label": y("layers.tab"), m: 0, p: 0, style: { listStyle: "none" }, children: /* @__PURE__ */ c.jsx(Q, { component: "li", className: `layers-empty${a.length ? " compact" : ""}`, p: "md", children: /* @__PURE__ */ c.jsxs(ye, { gap: "xs", align: "center", children: [
    /* @__PURE__ */ c.jsx(Q, { children: Bo(a.length ? "ph-magnifying-glass" : "ph-stack-simple") }),
    /* @__PURE__ */ c.jsx(ee, { fw: 600, children: y(a.length ? "layers.noMatching" : "layers.none") }),
    /* @__PURE__ */ c.jsx(ee, { size: "sm", c: "dimmed", children: y(a.length ? "layers.trySearch" : "layers.emptyHint") })
  ] }) }) });
}
function nx({ snapshot: e }) {
  return Fe(), /* @__PURE__ */ c.jsx(Q, { component: "ol", id: "history", m: 0, p: "sm", children: [...e.history?.entries ?? []].reverse().map((t) => /* @__PURE__ */ c.jsx(
    Q,
    {
      component: "li",
      className: t.position > (e.history?.position ?? 0) ? "undone" : void 0,
      py: "xs",
      children: /* @__PURE__ */ c.jsx(ee, { size: "sm", c: t.position > (e.history?.position ?? 0) ? "dimmed" : void 0, children: `${t.position}. ${t.kind} — ${t.actor.kind}${t.actor.detail ? ` (${t.actor.detail})` : ""}` })
    },
    t.transaction
  )) });
}
function ox({ snapshot: e, commands: t }) {
  Fe();
  const [n, o] = p.useState(e.dock ?? "properties");
  p.useEffect(() => {
    e.dock && o(e.dock);
  }, [e.dock]);
  const r = e.document ? Be($e(e.document)) : [], s = r.filter((l) => e.selectedIds.includes(l.layer.id)), a = s.length > 0 && s.every((l) => {
    if (!tr(l.layer)) return !1;
    let u = l.parent;
    for (; u; ) {
      const f = r.find((h) => h.layer.id === u);
      if (!f || !tr(f.layer)) return !1;
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
        /* @__PURE__ */ c.jsx(ht.Panel, { value: "layers", id: "layers-view", className: "dock-view", children: /* @__PURE__ */ c.jsxs(ye, { className: "layers-content", gap: "sm", p: "sm", children: [
          /* @__PURE__ */ c.jsx(
            dt,
            {
              id: "layer-search",
              value: e.query,
              disabled: zl(e.document),
              placeholder: y(zl(e.document) ? "layers.noSearch" : "layers.searchPlaceholder"),
              "aria-label": y("layers.searchPlaceholder"),
              onChange: (l) => t.setQuery(l.currentTarget.value)
            }
          ),
          /* @__PURE__ */ c.jsx(tx, { snapshot: e, commands: t }),
          /* @__PURE__ */ c.jsxs(Ne, { gap: "xs", children: [
            /* @__PURE__ */ c.jsx(le, { id: "group-layers", variant: "default", size: "xs", disabled: !a || s.length < 2, onClick: t.groupSelection, children: y("layers.groupButton") }),
            /* @__PURE__ */ c.jsx(le, { id: "delete-layer", variant: "light", color: "red", size: "xs", disabled: !a, onClick: t.deleteSelection, children: y("layers.deleteButton") })
          ] })
        ] }) }),
        /* @__PURE__ */ c.jsx(ht.Panel, { value: "history", id: "history-view", className: "dock-view", children: /* @__PURE__ */ c.jsx(nx, { snapshot: e }) })
      ]
    }
  );
}
function zl(e) {
  return !e || $e(e).length === 0;
}
function rx(e, t, n) {
  let o = (a) => {
  };
  function r() {
    const [a, i] = p.useState(t);
    return p.useEffect(() => (o = (l) => i({ ...l }), () => {
      o = () => {
      };
    }), []), /* @__PURE__ */ c.jsx(ox, { snapshot: a, commands: n });
  }
  const s = We("structure", e, /* @__PURE__ */ c.jsx(r, {}));
  return { setSnapshot: (a) => o(a), destroy: s };
}
function sx(e) {
  return typeof e == "string" ? e : JSON.stringify(e, null, 2);
}
function rs(e) {
  return Array.isArray(e) ? `[${e.map(rs).join(",")}]` : e && typeof e == "object" ? `{${Object.keys(e).sort().map(
    (t) => `${JSON.stringify(t)}:${rs(e[t])}`
  ).join(",")}}` : JSON.stringify(e);
}
function _l(e, t) {
  if (typeof e == "string" && typeof t == "string") {
    const n = (o) => {
      const r = /^#([\da-f]{6})([\da-f]{2})?$/i.exec(o);
      return r ? `${r[1].toLowerCase()}${(r[2] ?? "ff").toLowerCase()}` : o;
    };
    return n(e) === n(t);
  }
  return rs(e) === rs(t);
}
function tp({ id: e, label: t, value: n, className: o, compact: r = !1, disabled: s = !1, onCommit: a, clear: i }) {
  Fe();
  const l = typeof n == "string" ? n : "#000000", [u, f] = p.useState(typeof n == "string" ? "solid" : "json"), [h, d] = p.useState(l), [m, g] = p.useState(sx(n)), [v, x] = p.useState(""), [b, E] = p.useState(!1), S = p.useRef(n);
  function k(w) {
    let A = w.trim();
    /^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(A) && (typeof S.current == "string" && /^#[\da-f]{6}$/i.test(S.current) && /^#([\da-f]{6})ff$/i.test(A) && (A = A.slice(0, 7)), x(""), !_l(S.current, A) && (S.current = A, a(A)));
  }
  function R() {
    let w;
    try {
      w = JSON.parse(m);
    } catch {
      x(y("paint.jsonSyntaxError"));
      return;
    }
    if (!w || typeof w != "object" || Array.isArray(w) || !("kind" in w)) {
      x(y("paint.jsonObjectError"));
      return;
    }
    x("");
    const A = w;
    _l(S.current, A) || (S.current = A, a(A));
  }
  const T = /* @__PURE__ */ c.jsxs(ye, { gap: "xs", className: "paint-input", "data-paint-editor": e, children: [
    /* @__PURE__ */ c.jsx(
      vr,
      {
        "aria-label": t,
        value: u,
        onChange: (w) => f(w),
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
        mr,
        {
          id: `${e}-solid`,
          classNames: o ? { input: o } : void 0,
          label: t,
          value: h,
          format: "hexa",
          fixOnBlur: !1,
          disabled: s,
          onChange: (w) => d(w),
          onChangeEnd: k,
          onBlur: (w) => k(w.currentTarget.value),
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
        mo,
        {
          id: `${e}-json`,
          classNames: { input: o ? `${o} paint-json` : "paint-json" },
          label: t,
          value: m,
          onChange: (w) => g(w.currentTarget.value),
          minRows: 4,
          autosize: !0,
          disabled: s,
          error: v || void 0,
          "aria-label": t,
          "data-paint-json": e
        }
      ),
      /* @__PURE__ */ c.jsxs(Ne, { justify: "space-between", align: "center", children: [
        /* @__PURE__ */ c.jsx(ee, { size: "xs", c: "dimmed", children: y("paint.jsonHint") }),
        /* @__PURE__ */ c.jsxs(Ne, { gap: "xs", children: [
          /* @__PURE__ */ c.jsx(le, { id: `${e}-apply-json`, type: "button", size: "xs", variant: "light", disabled: s, onClick: R, children: y("paint.applyJson") }),
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
    v ? /* @__PURE__ */ c.jsx(ee, { size: "xs", c: "red", role: "alert", children: v }) : null
  ] });
  if (!r) return T;
  const C = typeof n == "string" ? { backgroundColor: n } : { background: "linear-gradient(135deg, var(--color-accent) 0 50%, var(--color-surface-subtle) 50% 100%)" };
  return /* @__PURE__ */ c.jsxs(
    He,
    {
      id: e,
      opened: b,
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
        /* @__PURE__ */ c.jsx(He.Target, { children: /* @__PURE__ */ c.jsx(
          Uo,
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
            onClick: () => E((w) => !w),
            children: /* @__PURE__ */ c.jsx("span", { className: "paint-swatch", "aria-hidden": "true", style: C })
          }
        ) }),
        /* @__PURE__ */ c.jsx(He.Dropdown, { className: "paint-popover", "data-paint-popover": e, children: T })
      ]
    }
  );
}
let ax = 0;
function ix(e, t) {
  return We(`paint-${++ax}`, e, /* @__PURE__ */ c.jsx(tp, { ...t }));
}
let np = 0;
function nc(e) {
  return JSON.stringify([e.project, e.document, e.layer]);
}
function op(e) {
  const t = e.runs.every(Fa) && e.runs.map((n) => n.text).join("") === e.text;
  return { capture: structuredClone(e), rows: e.runs.map((n) => ({ key: ++np, raw: structuredClone(n), legacy: !t || !Fa(n) })), error: "", pending: !1 };
}
function Fl(e = "") {
  return { key: ++np, raw: { text: e } };
}
function Vr(e) {
  return !e.legacy && !!e.raw && typeof e.raw == "object" && !Array.isArray(e.raw) && typeof e.raw.text == "string";
}
function Fa(e) {
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
  return !(n != null && !cx(n));
}
function cx(e) {
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
function lx(e, t, n) {
  const o = structuredClone(e);
  return n === void 0 ? delete o[t] : o[t] = structuredClone(n), o;
}
function so(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function ma(e, t) {
  return Object.fromEntries(Object.entries(structuredClone(e)).filter(([n]) => !t.includes(n)));
}
function Bl(e) {
  const t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    if (!so(o) || typeof o.offset != "number" || !Number.isFinite(o.offset)) continue;
    const r = o.offset;
    t.has(r) && n.add(r), t.set(r, o);
  }
  for (const o of n) t.delete(o);
  return t;
}
function ux(e, t) {
  if (!so(e) || !so(t) || e.kind !== t.kind || !["linear", "radial"].includes(String(t.kind))) return structuredClone(t);
  const n = t.kind === "radial", o = {
    ...ma(e, n ? ["kind", "center", "radius", "stops"] : ["kind", "angle", "stops"]),
    ...structuredClone(t)
  };
  if (Array.isArray(e.stops) && Array.isArray(t.stops)) {
    const r = Bl(e.stops), s = Bl(t.stops);
    o.stops = t.stops.map((a) => {
      if (!so(a) || typeof a.offset != "number" || !s.has(a.offset)) return structuredClone(a);
      const i = r.get(a.offset);
      return { ...i ? ma(i, ["offset", "color", "alpha"]) : {}, ...structuredClone(a) };
    });
  }
  if (n && so(e.center)) {
    const r = ma(e.center, ["x", "y"]);
    so(t.center) ? o.center = { ...r, ...structuredClone(t.center) } : !Object.hasOwn(t, "center") && Object.keys(r).length && (o.center = { ...r, x: 0.5, y: 0.5 });
  }
  return o;
}
function Ba(e) {
  return JSON.stringify(e.rows.map((t) => t.raw)) !== JSON.stringify(e.capture.runs);
}
function dx(e) {
  if (!Ba(e)) return null;
  const t = e.rows.map((o) => structuredClone(o.raw)), n = { op: "update", id: e.capture.layer, runs: t };
  if (t.length && e.rows.every(Vr) && t.every(Fa)) {
    const o = t.map((r) => r.text).join("");
    o !== e.capture.text && Object.assign(n, { text: o });
  }
  return n;
}
function fx(e) {
  Fe();
  const [, t] = p.useState(0), n = p.useRef(null), o = nc(e.capture), r = e.drafts.get(o), s = e.disabled || !!r?.pending || !!r?.reconcile, a = () => t((g) => g + 1), i = (g) => requestAnimationFrame(() => {
    (n.current ?? [...document.querySelectorAll("[data-runs-editor]")].find((x) => x.dataset.runsIdentity === o))?.querySelector(g)?.focus();
  }), l = (g) => {
    e.drafts.set(o, g), a();
  }, u = () => {
    l(op(e.capture)), i("#runs-add");
  }, f = (g, v, x) => {
    if (!r || s) return;
    const b = r.rows[g];
    Vr(b) && (b.raw = lx(b.raw, v, x), r.error = "", l(r));
  };
  async function h() {
    if (!r || s || !Ba(r)) return;
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
  function m(g, v, x, b, E) {
    const S = g[x], k = S != null, R = `run-${r.rows[v].key}-${x}`, T = `${y("runs.row", { number: v + 1 })}: ${y(b)}`;
    return /* @__PURE__ */ c.jsxs(ye, { gap: 4, style: { minWidth: 0 }, children: [
      /* @__PURE__ */ c.jsx(
        uo,
        {
          "aria-label": `${T}: ${y("runs.mode")}`,
          label: y(b),
          size: "xs",
          value: k ? "value" : "inherit",
          data: [{ value: "inherit", label: y("runs.inherit") }, { value: "value", label: y("runs.override") }],
          disabled: s,
          onChange: (C) => f(v, x, C === "inherit" ? void 0 : E)
        }
      ),
      x === "fontFamily" ? /* @__PURE__ */ c.jsx(Cw, { host: e.fonts, label: T, value: String(k ? S : E), disabled: s || !k, onCommit: (C) => f(v, x, C) }) : x === "fontStyle" ? /* @__PURE__ */ c.jsx(
        uo,
        {
          id: R,
          "aria-label": T,
          size: "xs",
          value: String(k ? S : E),
          disabled: s || !k,
          data: [{ value: "normal", label: y("runs.normal") }, { value: "italic", label: y("runs.italic") }],
          onChange: (C) => f(v, x, C)
        }
      ) : /* @__PURE__ */ c.jsx(
        dt,
        {
          id: R,
          "aria-label": T,
          size: "xs",
          type: "number",
          value: String(k ? S : E),
          disabled: s || !k,
          onChange: (C) => {
            const w = C.currentTarget.value;
            f(v, x, w === "" ? "" : Number(w));
          }
        }
      )
    ] }, x);
  }
  return /* @__PURE__ */ c.jsx("div", { ref: n, className: "runs-editor", "data-runs-editor": !0, "data-runs-identity": o, onKeyDown: (g) => g.stopPropagation(), children: /* @__PURE__ */ c.jsxs(ye, { gap: "xs", children: [
    /* @__PURE__ */ c.jsx(ee, { fw: 600, children: y("runs.title") }),
    /* @__PURE__ */ c.jsx(ee, { size: "xs", c: "dimmed", children: y("runs.help") }),
    r ? /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
      r.capture.version !== e.capture.version && /* @__PURE__ */ c.jsx(ee, { size: "xs", c: "orange", role: "status", children: y("runs.conflict") }),
      /* @__PURE__ */ c.jsx(st, { "aria-label": y("runs.title"), style: { tableLayout: "fixed", width: "100%" }, children: /* @__PURE__ */ c.jsx(st.Tbody, { children: r.rows.map((g, v) => /* @__PURE__ */ c.jsx(st.Tr, { "data-run-row": g.key, children: /* @__PURE__ */ c.jsx(st.Td, { style: { padding: "8px 0" }, children: /* @__PURE__ */ c.jsxs(ye, { gap: "xs", children: [
        /* @__PURE__ */ c.jsxs(Ne, { justify: "space-between", gap: 4, children: [
          /* @__PURE__ */ c.jsx(ee, { size: "sm", fw: 600, children: y("runs.row", { number: v + 1 }) }),
          /* @__PURE__ */ c.jsxs(Ne, { gap: 4, wrap: "wrap", children: [
            [[-1, "runs.up"], [1, "runs.down"]].map(([x, b]) => /* @__PURE__ */ c.jsx(
              le,
              {
                size: "compact-xs",
                variant: "subtle",
                "aria-label": `${y(b)}: ${v + 1}`,
                "data-run-move": x,
                disabled: s || v + x < 0 || v + x >= r.rows.length,
                onClick: () => {
                  [r.rows[v], r.rows[v + x]] = [r.rows[v + x], r.rows[v]], l(r), i(`[data-run-row="${g.key}"] textarea`);
                },
                children: y(b)
              },
              x
            )),
            /* @__PURE__ */ c.jsx(
              le,
              {
                size: "compact-xs",
                variant: "subtle",
                color: "red",
                "aria-label": `${y("runs.delete")}: ${v + 1}`,
                "data-run-delete": !0,
                disabled: s,
                onClick: () => {
                  r.rows.splice(v, 1), l(r), i(r.rows.length ? `[data-run-row="${r.rows[Math.min(v, r.rows.length - 1)].key}"] textarea` : "#runs-add");
                },
                children: y("runs.delete")
              }
            )
          ] })
        ] }),
        Vr(g) ? /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
          /* @__PURE__ */ c.jsx(
            mo,
            {
              "data-run-text": !0,
              "aria-label": `${y("runs.text")}: ${v + 1}`,
              label: y("runs.text"),
              value: g.raw.text,
              autosize: !0,
              minRows: 2,
              disabled: s,
              onChange: (x) => f(v, "text", x.currentTarget.value)
            }
          ),
          /* @__PURE__ */ c.jsxs(us, { cols: 2, spacing: "xs", children: [
            m(g.raw, v, "fontFamily", "editor.fontFamily", e.layer.fontFamily),
            m(g.raw, v, "fontSize", "properties.fontSize", e.layer.fontSize),
            m(g.raw, v, "fontWeight", "properties.weight", e.layer.fontWeight ?? 400),
            m(g.raw, v, "fontStyle", "properties.style", e.layer.fontStyle ?? "normal"),
            m(g.raw, v, "letterSpacing", "properties.letterSpacing", e.layer.letterSpacing ?? 0)
          ] }),
          /* @__PURE__ */ c.jsx(
            uo,
            {
              size: "xs",
              label: y("properties.colour"),
              "aria-label": `${y("runs.fillMode")}: ${v + 1}`,
              "data-run-fill-mode": !0,
              value: Object.hasOwn(g.raw, "color") ? g.raw.color === null ? "none" : "value" : "inherit",
              disabled: s,
              data: [{ value: "inherit", label: y("runs.inherit") }, { value: "none", label: y("runs.noFill") }, { value: "value", label: y("runs.override") }],
              onChange: (x) => f(v, "color", x === "inherit" ? void 0 : x === "none" ? null : e.layer.color ?? "#000000")
            }
          ),
          Object.hasOwn(g.raw, "color") && g.raw.color !== null && /* @__PURE__ */ c.jsx(
            tp,
            {
              id: `run-${g.key}-paint`,
              label: `${y("properties.colour")}: ${v + 1}`,
              value: g.raw.color,
              disabled: s,
              onCommit: (x) => f(v, "color", ux(r.rows[v].raw.color, x))
            },
            `${g.key}-${typeof g.raw.color}`
          )
        ] }) : /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
          /* @__PURE__ */ c.jsx(ee, { size: "xs", c: "orange", children: y("runs.unsupported") }),
          /* @__PURE__ */ c.jsx(mo, { "aria-label": `${y("runs.raw")}: ${v + 1}`, value: JSON.stringify(g.raw, null, 2), readOnly: !0, autosize: !0, maxRows: 6 })
        ] })
      ] }) }) }, g.key)) }) }),
      /* @__PURE__ */ c.jsxs(Ne, { gap: "xs", children: [
        /* @__PURE__ */ c.jsx(le, { id: "runs-add", size: "xs", variant: "light", disabled: s, onClick: () => {
          const g = Fl(r.rows.length === 0 && r.capture.runs.length === 0 ? r.capture.text : "");
          r.rows.push(g), l(r), i(`[data-run-row="${g.key}"] textarea`);
        }, children: y("runs.add") }),
        /* @__PURE__ */ c.jsx(le, { id: "runs-clear", size: "xs", variant: "light", disabled: s || !r.rows.length, onClick: () => {
          r.rows = [], l(r), i("#runs-add");
        }, children: y("runs.clear") }),
        r.rows.some((g) => !Vr(g)) && /* @__PURE__ */ c.jsx(le, { id: "runs-replace", size: "xs", variant: "light", disabled: s, onClick: () => {
          const g = Fl(r.capture.text);
          r.rows = [g], l(r), i(`[data-run-row="${g.key}"] textarea`);
        }, children: y("runs.replace") })
      ] }),
      r.error && /* @__PURE__ */ c.jsx(ee, { id: "runs-error", role: "alert", tabIndex: -1, size: "xs", c: "red", children: r.error }),
      (r.error || r.capture.version !== e.capture.version) && /* @__PURE__ */ c.jsx(le, { id: "runs-reload", size: "xs", variant: "light", disabled: r.pending, onClick: () => {
        d();
      }, children: y("runs.reload") }),
      /* @__PURE__ */ c.jsxs(Ne, { gap: "xs", children: [
        /* @__PURE__ */ c.jsx(le, { id: "runs-apply", size: "xs", disabled: s || !Ba(r), loading: r.pending, onClick: () => {
          h();
        }, children: y("runs.apply") }),
        /* @__PURE__ */ c.jsx(le, { id: "runs-cancel", size: "xs", variant: "default", disabled: r.pending, onClick: () => {
          e.drafts.delete(o), a(), i("#runs-edit");
        }, children: y("runs.cancel") })
      ] })
    ] }) : /* @__PURE__ */ c.jsx(le, { id: "runs-edit", size: "xs", variant: "light", disabled: e.disabled, onClick: u, children: y("runs.edit") })
  ] }) });
}
let px = 0;
function hx(e, t) {
  return We(`text-runs-${++px}`, e, /* @__PURE__ */ c.jsx(fx, { ...t }));
}
function mx({ assets: e, value: t, disabled: n = !1, onChange: o, onUpload: r }) {
  Fe();
  const [s, a] = p.useState(null), [i, l] = p.useState(t);
  p.useEffect(() => l(t), [t]);
  const u = e.filter((h) => h.mediaType.startsWith("image/")), f = [
    { value: "", label: y("canvas.backgroundImageNone") },
    ...u.map((h) => ({
      value: h.id,
      label: `${h.path.split("/").at(-1) ?? h.path} (${h.mediaType})`
    }))
  ];
  return /* @__PURE__ */ c.jsxs(ye, { gap: "xs", className: "canvas-image-input", children: [
    /* @__PURE__ */ c.jsx(
      go,
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
      go,
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
        Hi,
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
let gx = 0;
function vx(e, t) {
  return We(
    `canvas-image-${++gx}`,
    e,
    /* @__PURE__ */ c.jsx(mx, { ...t })
  );
}
const yx = [
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
function bx({ value: e, disabled: t, onChange: n }) {
  return Fe(), /* @__PURE__ */ c.jsx(
    kn.Group,
    {
      id: "canvas-anchor-group",
      name: "canvas-anchor",
      value: e,
      onChange: (o) => n(o),
      children: /* @__PURE__ */ c.jsx(us, { cols: 3, className: "canvas-size-anchor-grid", children: yx.map((o) => /* @__PURE__ */ c.jsx(
        kn,
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
function wx(e, t, n, o) {
  let r = (i, l) => {
  };
  function s() {
    const [i, l] = p.useState(t), [u, f] = p.useState(n);
    return p.useEffect(() => (r = (h, d) => {
      l(h), f(d);
    }, () => {
      r = () => {
      };
    }), []), /* @__PURE__ */ c.jsx(bx, { value: i, disabled: u, onChange: o });
  }
  const a = We("canvas-anchor-picker", e, /* @__PURE__ */ c.jsx(s, {}));
  return { setState: (i, l) => r(i, l), destroy: a };
}
const fo = (e) => typeof e == "function" ? e() : e;
function xx(e) {
  Fe();
  const t = fo(e.label), n = e.title === void 0 ? void 0 : fo(e.title), o = p.useRef(e.value), r = (s) => {
    s !== o.current && (o.current = s, e.onCommit(s));
  };
  return e.options ? /* @__PURE__ */ c.jsx(
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
      data: e.options.map((s) => ({ value: s.value, label: fo(s.label) })),
      classNames: e.className ? { input: e.className } : void 0,
      onChange: (s) => r(s.currentTarget.value)
    }
  ) : e.type === "textarea" ? /* @__PURE__ */ c.jsx(
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
function Sx(e) {
  Fe();
  const t = fo(e.label), n = e.title === void 0 ? void 0 : fo(e.title);
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
let oc = 0;
function Cx(e) {
  Fe();
  const [t, n] = p.useState(e.checked);
  return p.useEffect(() => {
    n(e.checked);
  }, [e.checked]), /* @__PURE__ */ c.jsx(
    Gt,
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
function Wo(e, t) {
  return We(`inspector-checkbox-${++oc}`, e, /* @__PURE__ */ c.jsx(Cx, { ...t }));
}
function ct(e, t) {
  return We(`inspector-field-${++oc}`, e, /* @__PURE__ */ c.jsx(xx, { ...t }));
}
function ot(e, t) {
  return We(`inspector-button-${++oc}`, e, /* @__PURE__ */ c.jsx(Sx, { ...t }));
}
function jx({ state: e, onClose: t }) {
  return Fe(), p.useEffect(() => {
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
      children: /* @__PURE__ */ c.jsx(ye, { gap: 4, children: e.items.map((n, o) => n.kind === "separator" ? /* @__PURE__ */ c.jsx(Rs, { role: "separator" }, `separator-${o}`) : /* @__PURE__ */ c.jsx(
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
function kx(e) {
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
    }), []), /* @__PURE__ */ c.jsx(jx, { state: a, onClose: () => o({ ...n, open: !1 }) });
  }
  const s = We("context-menu", e, /* @__PURE__ */ c.jsx(r, {}));
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
const Ex = {
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
}, Rx = {
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
function Nx({ title: e, initiallyOpen: t, bodyElement: n }) {
  Fe();
  const [o, r] = p.useState(t ? e : null), s = Ex[e], a = s ? y(s) : e;
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
          /* @__PURE__ */ c.jsx("span", { className: "dock-section-icon", children: /* @__PURE__ */ c.jsx("i", { className: `ph ${Rx[e] ?? "ph-sliders-horizontal"}`, "aria-hidden": "true" }) }),
          /* @__PURE__ */ c.jsx(ee, { component: "span", className: "dock-section-heading", children: a })
        ] }) }),
        /* @__PURE__ */ c.jsx(Pe.Panel, { children: /* @__PURE__ */ c.jsx("div", { ref: (i) => {
          i && n.parentElement !== i && i.append(n);
        } }) })
      ] })
    }
  );
}
let Tx = 0;
function Px(e, t, n) {
  const o = document.createElement("div");
  o.className = "dock-section-host", e.append(o);
  const r = document.createElement("div");
  r.className = "dock-section-body";
  const s = `inspector-section-${++Tx}`, a = We(
    s,
    o,
    /* @__PURE__ */ c.jsx(Nx, { title: t, initiallyOpen: n, bodyElement: r })
  );
  return {
    body: r,
    destroy() {
      a(), o.remove();
    }
  };
}
function rc(e) {
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
let j = rc(null);
function sc(e) {
  return {
    state: rc(e),
    scroll: { left: 0, top: 0 },
    layerQuery: "",
    historySnapshot: null,
    activeDock: "layers",
    templateDraft: null,
    thumbnail: null
  };
}
const me = new Bw(), Tn = new Aw(), Va = /* @__PURE__ */ new Map(), nn = [];
Tn.onSettled = (e) => {
  nn.push({
    label: e.label,
    ok: e.ok,
    superseded: e.superseded,
    at: performance.now() - e.waitedMs,
    waitedMs: e.waitedMs,
    ranMs: e.ranMs,
    previewSettledAt: null
  }), nn.length > 50 && nn.shift(), sp();
};
function Ha(e, t) {
  Jp(e, t);
}
let rp = !1;
Tn.onActiveChange = (e) => {
  rp = e, e ? (Xp("info"), Ha("ph-circle-notch", "save.working")) : Yp() !== "error" && Ha("ph-check-circle", "save.allChangesSaved");
};
function Ax() {
  for (let e = nn.length - 1; e >= 0; e--) {
    const t = nn[e];
    if (t && t.previewSettledAt === null) {
      t.previewSettledAt = performance.now();
      break;
    }
  }
  sp();
}
const Ix = new URLSearchParams(window.location.search).has("perf");
window.__assemblashPerf = nn;
function sp() {
  if (!Ix) return;
  let e = document.getElementById("assemblash-perf");
  e || (e = document.createElement("div"), e.id = "assemblash-perf", e.setAttribute(
    "style",
    "position:fixed;bottom:8px;left:8px;z-index:9999;font:11px/1.5 ui-monospace,monospace;background:rgba(0,0,0,.82);color:#eee;padding:6px 9px;border-radius:6px;pointer-events:none;white-space:pre"
  ), document.body.append(e));
  const t = nn[nn.length - 1], n = t && t.previewSettledAt !== null ? `${Math.round(t.previewSettledAt - t.at)}ms` : "…";
  e.textContent = t ? `${t.label}: waited ${t.waitedMs}ms, ran ${t.ranMs ?? "–"}ms, settled ${n}
queue ${Tn.size}, records ${nn.length}` : "no interactions yet";
}
const ac = "#3366cc";
function Mx(e) {
  return typeof e == "string" ? e : null;
}
const ap = "#111111", ip = 2, Dx = ["rect", "ellipse"];
function Ox(e) {
  const t = e.clip;
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = t.shape;
    if (typeof n == "string") return n;
  }
  return null;
}
function Vl(e) {
  const t = e.clip;
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = t.cornerRadius;
    if (typeof n == "number") return n;
  }
  return 0;
}
function $x(e) {
  if (e.type !== "image") return null;
  const t = e.crop;
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const n = t, o = n.x, r = n.y, s = n.width, a = n.height;
    if (typeof o == "number" && typeof r == "number" && typeof s == "number" && typeof a == "number")
      return { x: o, y: r, width: s, height: a };
  }
  return null;
}
function Lx(e) {
  return e.type !== "image" && e.type !== "svg" ? null : (j.document?.assets ?? []).find((t) => t.id === e.asset) ?? null;
}
let wt = null, ic = 0, yn = null, Ln = [], _t = null, nr = null;
function J(e) {
  const t = document.getElementById(e);
  if (!t) throw new Error(`missing element #${e}`);
  return t;
}
function Hl(e) {
  const t = document.createElement("span");
  return t.dataset.i18n = e, t.textContent = y(e), t;
}
const Bt = _w();
let or = "", wr = null, xr = "layers";
const zx = rx(J("structure-panel"), {
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
    j.selection = t ? j.selection.includes(e) ? j.selection.filter((n) => n !== e) : [...j.selection, e] : [e], Nt(), ft(), lt(), window.matchMedia("(max-width: 720px)").matches && lc()?.type !== "text" && (N.structure.classList.remove("mobile-open"), N.dockToggle.setAttribute("aria-expanded", "false"));
  },
  toggleVisibility(e) {
    const t = j.document && Be($e(j.document)).find((n) => n.layer.id === e)?.layer;
    t && se(t.visible === !1 ? "show layer" : "hide layer", { op: "setVisible", id: e, visible: t.visible === !1 });
  },
  toggleLocked(e) {
    const t = j.document && Be($e(j.document)).find((n) => n.layer.id === e)?.layer;
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
    j.selection.length < 2 || se("group", { op: "group", ids: [...j.selection] });
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
}), Sn = kx(J("context-menu-root")), N = {
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
Gp(
  N.statusChromeRoot,
  (e) => {
    dp(e);
  },
  (e) => {
    window.localStorage.setItem("assemblash-update-banner-v1", e), du(null);
  }
);
const Hs = qw({
  openProject: (e) => Ep(e),
  search: () => {
    Me("search", async () => {
      await Er();
    });
  },
  openPageSet: (e) => {
    Je(), Me("open page set", () => p0(e));
  }
}, document.querySelector(".project-combobox")), _x = $w();
function Us(e, t, n, o) {
  _x.request(e, t, n, o);
}
function xe(e, t = "info") {
  Qp(e, t);
}
const Dn = { families: [], faces: [] }, pn = /* @__PURE__ */ new Map();
let Ul = "";
async function Me(e, t) {
  await Tn.enqueue({ label: e, coalesceKey: null, run: t, onError: (n) => sn(e, n) });
}
const Fx = {
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
function cc(e) {
  const t = Gf(e);
  if (t) return t;
  const n = Fx[e.code];
  return n ? y(n) : `${e.message} (${e.code})`;
}
function sn(e, t) {
  Ha("ph-warning-circle", "save.needsAttention"), t instanceof Ue ? xe(cc(t), "error") : xe(y("errors.unexpected", { message: String(t) }), "error");
}
J("add-template-section").append(J("templates-mantine-mount"));
const Lt = Yw({
  project: () => j.project,
  document: () => j.document,
  say: xe,
  guard: Me,
  refresh: () => Ge()
}), bo = Pw({
  project: () => j.project,
  document: () => j.document,
  say: xe,
  guard: Me,
  refresh: () => Ge(),
  fontsChanged: (e) => {
    Dn.families = [...e.families], Dn.faces = [...e.faces], lt();
  }
}, J("fonts-mantine-mount")), Bx = pw({
  project: () => j.project,
  document: () => j.document,
  pageSet: () => {
    const e = me.active?.group;
    return e ? { set: e.set, count: e.count } : null;
  },
  say: xe,
  guard: Me
}), Vx = Dw({
  create: async (e, t, n, o) => {
    let r = !1;
    return await Me("create", async () => {
      await xb(e, t, n, o, e), await Er(e), xe(y("projects.created", { id: e })), r = !0;
    }), r;
  }
}), cp = sw({ say: xe });
N.agents.addEventListener("click", () => {
  Bt.isOpen() && Bt.close();
}, { capture: !0 });
const lp = "assemblash-follow-v1";
function Ua() {
  return window.localStorage.getItem(lp) !== "off";
}
function Hx(e = "settings-agents") {
  N.settingFollow.checked = Ua();
  const t = ii(), n = t === "pseudo" ? "en" : t;
  N.settingLanguage.value = n, Bt.open(e, { follow: Ua(), language: n });
}
N.settings.addEventListener("click", () => Hx());
N.settingLanguage.value = ii();
N.settingLanguage.addEventListener("change", () => {
  rh(N.settingLanguage.value);
});
Kp(() => {
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
  e && (N.canvasImage.alt = y("canvas.previewAlt", { name: e })), j.document && (N.version.textContent = je(Le(j.document)), si(
    `${je(Math.round(j.document.canvas.width))} × ${je(Math.round(j.document.canvas.height))}`
  ), Io());
});
N.settingFollow.addEventListener("change", () => {
  window.localStorage.setItem(lp, N.settingFollow.checked ? "on" : "off");
});
N.settingsFontsOpen.addEventListener("click", () => {
  Bt.close(), Me("fonts", () => jc(!0));
});
const Ux = "assemblash-update-banner-v1";
async function up() {
  let e;
  try {
    e = await zb();
  } catch {
    return;
  }
  N.settingUpdateCheck.checked = e.consent === "notify", uu(e.consent === null);
  const t = window.localStorage.getItem(Ux), n = e.newer && !!e.latest && t !== e.latest;
  du(n && e.latest ? {
    version: e.latest,
    text: y("updates.versionAvailable", { latest: e.latest, current: e.current }),
    notesUrl: e.notesUrl ?? null
  } : null);
}
async function dp(e) {
  try {
    const t = await _b(e);
    uu(t.consent === null), N.settingUpdateCheck.checked = t.consent === "notify", xe(t.consent === "notify" ? y("updates.checkOn") : y("updates.checkOff"));
  } catch (t) {
    sn(y("updates.saveChoiceFailed"), t), up();
  }
}
N.settingUpdateCheck.addEventListener("change", () => {
  dp(N.settingUpdateCheck.checked ? "notify" : "off");
});
N.settingsForm.addEventListener("submit", (e) => {
  e.submitter?.value === "cancel" && Bt.close();
});
function lc() {
  if (!j.document || j.selection.length !== 1) return null;
  const e = j.selection[0];
  return Be($e(j.document)).find(({ layer: t }) => t.id === e)?.layer ?? null;
}
function zt() {
  if (!j.document) return [];
  const e = new Set(j.selection);
  return Be($e(j.document)).map(({ layer: t }) => t).filter((t) => e.has(t.id));
}
function wo(e, t = !1) {
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
  return wo(e) === null;
}
function Wa() {
  if (!j.document || j.selection.length === 0) return !1;
  const e = Be($e(j.document)), t = new Set(j.selection);
  return j.selection.every((n) => {
    const o = e.find((s) => s.layer.id === n);
    if (!o || !rt(o.layer) || !pc(e, o.parent) || o.layer.transform.width <= 0 || o.layer.transform.height <= 0) return !1;
    let r = o.parent;
    for (; r; ) {
      if (t.has(r)) return !1;
      r = e.find((s) => s.layer.id === r)?.parent ?? null;
    }
    return !0;
  });
}
function Wx(e, t) {
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
let Wl = null, ql;
function qx() {
  !j.project || Wl === j.project || (Wl = j.project, N.canvasHints.hidden = !1, window.clearTimeout(ql), ql = window.setTimeout(() => {
    N.canvasHints.hidden = !0;
  }, 5e3));
}
let qa = 0;
async function Ge() {
  if (Je(), !j.project) return;
  const e = ++qa, t = await Ao(j.project);
  e !== qa || !j.project || Wn(t);
}
function Wn(e) {
  const t = j.drag?.mode === "resize" ? j.drag : yn;
  t && (e.id !== j.document?.id || Le(e) !== t.version) && Je(), j.document = e, j.selection = j.selection.filter(
    (n) => Be($e(e)).some(({ layer: o }) => o.id === n)
  ), N.version.textContent = je(Le(e)), N.canvasEmpty.hidden = !0, N.canvas.hidden = !1, N.canvasControlsRoot.hidden = !1, qx(), si(
    `${je(Math.round(e.canvas.width))} × ${je(Math.round(e.canvas.height))}`
  ), j.slots = e.slots ?? [], _t !== null && Le(e) !== _t && Et(), dc(), Nt(), ft(), lt(), Kx().catch((n) => sn("presets", n)), n0().catch((n) => sn("history", n));
}
let Ka = 0;
async function Kx() {
  if (!j.project) return;
  const e = ++Ka, t = await Wb(j.project);
  e === Ka && (j.presets = t);
}
let Hr = null, zo = null, uc = null;
function dc() {
  if (!j.project || !j.document || (uc = rr(), zo = Le(j.document), Hr)) return;
  const e = j.project;
  Hr = (async () => {
    try {
      for (; zo !== null; ) {
        const t = zo;
        zo = null;
        const n = await Bn(Qr(e, t, rr())), o = j.document;
        if (j.project !== e || !o || Le(o) !== t) {
          URL.revokeObjectURL(n);
          continue;
        }
        const r = N.canvasImage.src;
        N.canvasImage.src = n, r.startsWith("blob:") && URL.revokeObjectURL(r), !j.drag && (_t === null || t >= _t) && Et(), N.canvasImage.dataset.previewName = o.name ?? e, N.canvasImage.alt = y("canvas.previewAlt", { name: o.name ?? e }), N.canvas.style.aspectRatio = `${o.canvas.width} / ${o.canvas.height}`, Io(), Ax();
      }
    } catch (t) {
      sn("preview", t);
    } finally {
      Hr = null, zo !== null && dc();
    }
  })();
}
function fc() {
  !j.document || rr() === uc || dc();
}
function Xx() {
  const e = window.getComputedStyle(N.stage), t = (n) => {
    const o = Number.parseFloat(n);
    return Number.isFinite(o) ? Math.max(0, o) : 0;
  };
  return {
    horizontal: t(e.paddingLeft) + t(e.paddingRight),
    vertical: t(e.paddingTop) + t(e.paddingBottom)
  };
}
function fp() {
  if (!j.document) return 1;
  const e = Xx(), t = Math.max(1, N.stageViewport.clientWidth - e.horizontal), n = Math.max(1, N.stageViewport.clientHeight - e.vertical);
  return Math.min(
    t / j.document.canvas.width,
    n / j.document.canvas.height,
    1
  );
}
function Ws() {
  return j.zoom ?? fp();
}
function rr() {
  if (!j.document) return 1;
  const e = Math.max(1, window.devicePixelRatio || 1);
  return Math.min(1, Math.max(0.1, Ws() * e));
}
function Nt() {
  zx.setSnapshot({
    document: j.document,
    selectedIds: j.selection,
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
function pc(e, t) {
  let n = t;
  for (; n; ) {
    const o = e.find((r) => r.layer.id === n);
    if (!o || o.layer.transform.flipHorizontal || o.layer.transform.flipVertical) return null;
    n = o.parent;
  }
  return sr(e, t);
}
function ft() {
  if (N.overlay.replaceChildren(), !j.document) return;
  const { width: e, height: t } = j.document.canvas, n = Be($e(j.document)), o = n.flatMap(({ layer: l, parent: u }) => {
    const f = pc(n, u);
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
      f.shiftKey || f.ctrlKey || f.metaKey ? j.selection = j.selection.includes(l.layer.id) ? j.selection.filter((h) => h !== l.layer.id) : [...j.selection, l.layer.id] : j.selection.includes(l.layer.id) || (j.selection = [l.layer.id]), Nt(), lt(), ft();
    }), u.addEventListener("dblclick", (f) => {
      f.stopPropagation(), l.layer.type === "text" && xo(l.layer);
    }), u.addEventListener("contextmenu", (f) => {
      f.preventDefault(), j.selection.includes(l.layer.id) || (j.selection = [l.layer.id]), Nt(), lt(), ft(), cr(f.clientX, f.clientY);
    }), Wx(u), N.overlay.append(u);
  }
  const r = o.filter(({ layer: l }) => j.selection.includes(l.id));
  if (r.length === 0) return;
  yp(r.map(({ layer: l }) => l.id));
  const s = r.length === 1 ? {
    x: r[0].x,
    y: r[0].y,
    width: r[0].width,
    height: r[0].height
  } : tc(r.map((l) => ({
    x: l.x,
    y: l.y,
    width: l.width,
    height: l.height,
    rotation: l.layer.transform.rotation ?? 0
  }))), a = document.createElement("div");
  if (a.className = "handle-box", a.style.left = `${s.x / e * 100}%`, a.style.top = `${s.y / t * 100}%`, a.style.width = `${s.width / e * 100}%`, a.style.height = `${s.height / t * 100}%`, a.style.transformOrigin = "center", r.length === 1 && (a.style.transform = `rotate(${r[0]?.layer.transform.rotation ?? 0}deg)`), a.dataset.ids = j.selection.join(","), a.addEventListener("contextmenu", (l) => {
    l.preventDefault(), l.stopPropagation(), cr(l.clientX, l.clientY);
  }), r.every(({ layer: l }) => rt(l))) {
    a.addEventListener("pointerdown", (u) => va(u, r, s, "move")), a.addEventListener("dblclick", (u) => {
      u.stopPropagation();
      const f = r.length === 1 && r[0]?.layer.type === "text" ? r[0].layer : null;
      f && xo(f);
    }), Wa() || (a.title = y("canvas.resizeUnavailable"));
    for (const u of Wa() ? ["nw", "n", "ne", "e", "se", "s", "sw", "w"] : []) {
      const f = document.createElement("button");
      f.type = "button", f.className = `resize-handle handle-${u}`, f.dataset.handle = u, f.dataset.resizeHandle = u, f.setAttribute("aria-label", y("canvas.resizeHandle", { handle: u })), f.title = y("canvas.resizeHelp"), f.setAttribute("aria-description", f.title), f.dataset.i18nAttr = "title:canvas.resizeHelp;aria-description:canvas.resizeHelp", f.addEventListener("pointerdown", (h) => {
        h.stopPropagation(), va(h, r, s, "resize", u);
      }), a.append(f);
    }
    const l = document.createElement("button");
    l.type = "button", l.className = "rotation-handle", l.setAttribute("aria-label", y("canvas.rotateSelection")), l.dataset.i18nAttr = "aria-label:canvas.rotateSelection", l.innerHTML = '<i class="ph ph-arrow-clockwise" aria-hidden="true"></i>', l.addEventListener("pointerdown", (u) => {
      u.stopPropagation(), va(u, r, s, "rotate");
    }), a.append(l);
  } else
    a.classList.add("guarded"), a.title = r.map(({ layer: l }) => wo(l)).filter(Boolean).join("; ");
  N.overlay.append(a);
}
function Yx(e) {
  if (!j.document) return;
  const t = j.document.canvas, n = document.createElement("form");
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
  we.push(ct(o, {
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
  })), we.push(ct(r, {
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
  const l = n.querySelector("#canvas-transparent-mount"), u = n.querySelector("#canvas-size-anchor-grid"), f = n.querySelector(".canvas-anchor-fieldset"), h = n.querySelector("#canvas-apply-mount");
  let d = t.background ?? "#ffffff", m = t.backgroundImage ?? null, g = t.background == null, v = "top-left";
  Ur(
    n.querySelector("#canvas-background-paint"),
    "canvas-background",
    y("common.background"),
    d,
    !1,
    (T) => {
      d = T, g = !1, E(), R();
    }
  );
  const x = () => ({
    id: "canvas-transparent",
    label: () => y("canvas.transparentBackground"),
    checked: g,
    onChange(T) {
      g = T, R();
    }
  });
  let b = Wo(l, x());
  we.push(() => b());
  function E() {
    ni(() => {
      b(), b = Wo(l, x());
    });
  }
  const S = wx(u, v, !0, (T) => {
    v = T, R();
  });
  we.push(S.destroy), we.push(vx(n.querySelector("#canvas-background-image-mount"), {
    assets: j.document.assets ?? [],
    value: m,
    onChange(T) {
      m = T, se(T ? "set canvas background image" : "clear canvas background image", T ? { op: "updateCanvas", backgroundImage: T } : { op: "updateCanvas", clearBackgroundImage: !0 });
    },
    onUpload(T) {
      const C = j.project;
      C && Me("upload canvas background image", async () => {
        const w = await ec(C, T), A = {
          op: "updateCanvas",
          backgroundImage: { asset: w.asset.id, fit: m?.fit ?? "fill" }
        }, $ = await Un(C, A, w.version);
        xe(y("status.editDone", { version: $.version })), $.document ? Wn($.document) : await Ge();
      });
    }
  })), we.push(ot(h, {
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
  const k = () => !!(s && a && (Number(s.value) !== t.width || Number(a.value) !== t.height));
  function R() {
    if (!(!s || !a || !i)) {
      for (const T of [s, a])
        T.setCustomValidity(Number.isFinite(T.valueAsNumber) && T.valueAsNumber > 0 ? "" : y("canvas.invalidDimension"));
      f.disabled = !k(), S.setState(v, !k()), i.disabled = !k() && Kl(g ? null : d, t.background ?? null);
    }
  }
  n.addEventListener("input", R), n.addEventListener("change", R), n.addEventListener("submit", (T) => {
    if (T.preventDefault(), R(), !i || i.disabled || !n.reportValidity() || !s || !a) return;
    const C = g ? null : d, w = {
      op: "updateCanvas",
      ...k() ? { width: Number(s.value), height: Number(a.value), anchor: v } : {},
      ...Kl(C, t.background ?? null) ? {} : { background: C }
    };
    i.disabled = !0, se("update canvas", w);
  }), R(), e.append(n);
}
function ar(e, t) {
  const n = Px(
    e,
    t,
    !["Clip and mirror", "Appearance", "Effects", "Presets", "Slots"].includes(t)
  );
  return hp.push(n.destroy), n.body;
}
const pp = [], we = [], hp = [];
let bn = 0;
function Ur(e, t, n, o, r, s, a, i, l = !1) {
  we.push(ix(e, { id: t, label: n, value: o, disabled: r, onCommit: s, className: a, clear: i, compact: l }));
}
function Kl(e, t) {
  return JSON.stringify(e) === JSON.stringify(t);
}
function Xl(e, t) {
  const n = Rw({ store: () => Dn }, (o) => {
    se("change font", { op: "update", id: e.id, fontFamily: o });
  });
  return pp.push(n), n.setFamily(e.fontFamily), n.setDisabled(t), n;
}
let Yl = "";
function Gx(e) {
  const t = e.map((n) => n.id).join(",");
  t !== Yl && e.length === 1 && e[0]?.type === "text" && (Oo("properties"), window.matchMedia("(max-width: 720px)").matches && (N.structure.classList.add("mobile-open"), N.dockToggle.setAttribute("aria-expanded", "true"))), Yl = t;
}
function lt() {
  ni(Jx);
}
function Jx() {
  for (const C of pp.splice(0)) C.destroy();
  for (const C of we.splice(0)) C();
  for (const C of hp.splice(0)) C();
  _a(N.inspector), _a(N.advancedInspector), N.inspector.replaceChildren(), N.advancedInspector.replaceChildren();
  let e = N.advancedInspector;
  const t = (C) => (e = ar(N.advancedInspector, C), e), n = zt(), o = n.length === 1 ? n[0] ?? null : null;
  Gx(n);
  const r = n.map((C) => C.id).join(",");
  if (r !== Ul && (pn.clear(), Ul = r), N.deleteLayer.disabled = n.length === 0 || n.some((C) => !rt(C)), N.groupLayers.disabled = n.length < 2 || n.some((C) => !rt(C)), gc(n), j.document) {
    const C = document.createElement("span");
    C.style.display = "contents", we.push(ot(C, {
      id: "edit-canvas",
      label: () => y("editor.canvasSizeBackground"),
      icon: "ph-frame-corners",
      className: "toolbar-action",
      onClick() {
        Sn.close(), j.selection = [], Nt(), ft(), lt(), Oo("properties");
      }
    })), N.inspector.append(C);
  }
  if (n.length === 0) {
    const C = document.createElement("div");
    C.className = "inspector-empty", C.innerHTML = '<i class="ph ph-cursor-click" aria-hidden="true"></i><span data-i18n="editor.selectLayerHint">Select a layer to edit it</span>', N.inspector.append(C);
    const w = document.createElement("p");
    if (w.className = "empty-panel-copy", w.dataset.i18n = j.document ? "editor.setCanvasHint" : "editor.openProjectHint", w.textContent = y(j.document ? "editor.setCanvasHint" : "editor.openProjectHint"), e.append(w), j.document) {
      const A = ar(N.advancedInspector, "Canvas");
      Yx(A);
    }
    return;
  }
  const s = n.some((C) => !rt(C));
  let a = 0;
  const i = (C, w, A, $ = s, z = "toolbar-action", V, B = !1) => {
    const M = document.createElement("span");
    return M.className = "inspector-button-host", M.style.display = "contents", we.push(ot(M, {
      id: `inspector-action-${++a}`,
      label: () => y(C),
      icon: w,
      className: z,
      iconOnly: B,
      disabled: $,
      onMount(O) {
        O.title = y(C), V?.(O);
      },
      onClick: A
    })), M;
  };
  if (o?.type === "text") {
    const C = document.createElement("label");
    C.className = "toolbar-field toolbar-font", C.append(Hl("editor.fontFamily")), C.firstElementChild?.classList.add("sr-only");
    const w = Xl(o, s);
    C.append(w.root), N.inspector.append(C);
    const A = document.createElement("span");
    A.className = "toolbar-field toolbar-number", we.push(ct(A, {
      id: "toolbar-font-size",
      label: () => y("editor.fontSize"),
      value: String(o.fontSize),
      type: "number",
      size: "xs",
      min: 1,
      disabled: s,
      className: "toolbar-font-size",
      onCommit: (V) => {
        se("change font size", {
          op: "update",
          id: o.id,
          fontSize: Number(V)
        });
      }
    })), N.inspector.append(A);
    const $ = document.createElement("div");
    $.className = "toolbar-paint", Ur(
      $,
      "text-color",
      y("editor.textColour"),
      o.color ?? "#000000",
      s,
      (V) => {
        se("change colour", { op: "update", id: o.id, color: V });
      },
      "toolbar-colour",
      void 0,
      !0
    ), N.inspector.append($);
    for (const [V, B] of [
      ["left", "ph-text-align-left"],
      ["center", "ph-text-align-center"],
      ["right", "ph-text-align-right"],
      ["justify", "ph-text-align-justify"]
    ]) {
      const M = {
        left: "editor.alignLeft",
        center: "editor.alignCenter",
        right: "editor.alignRight",
        justify: "editor.alignJustify"
      }[V], O = i(M, B, () => {
        se(`align text ${V}`, { op: "update", id: o.id, align: V });
      }, s, "icon-button toolbar-icon", (D) => {
        const L = (o.align ?? "left") === V;
        D.dataset.textAlign = V, D.classList.toggle("selected", L), D.setAttribute("aria-pressed", String(L));
      }, !0);
      N.inspector.append(O);
    }
    const z = document.createElement("span");
    z.className = "toolbar-divider", N.inspector.append(z);
  } else {
    const C = document.createElement("span");
    C.className = "selection-label", n.length === 1 ? C.textContent = o?.type ?? y("editor.layerGeneric") : (C.dataset.i18nCount = "editor.layerCount", C.dataset.count = String(n.length), C.textContent = Ot("editor.layerCount", n.length)), N.inspector.append(C);
  }
  const l = n.map((C) => C.id);
  if (N.inspector.append(
    i("editor.centreHorizontally", "ph-align-center-horizontal", () => {
      se("centre horizontally", { op: "centerOnCanvas", ids: l, axis: "horizontal" });
    }),
    i("editor.centreVertically", "ph-align-center-vertical", () => {
      se("centre vertically", { op: "centerOnCanvas", ids: l, axis: "vertical" });
    }),
    i("position.title", "ph-bounding-box", () => Vn(), !1, "toolbar-action position-button"),
    i("layers.groupButton", "ph-stack", () => {
      l.length > 1 && se("group", { op: "group", ids: l });
    }, s || l.length < 2),
    i("editor.duplicate", "ph-copy", () => {
      xt("duplicate", l.map((C) => ({ op: "duplicate", id: C })));
    })
  ), !o) {
    const C = document.createElement("p");
    C.className = "empty-panel-copy";
    const w = n.filter(($) => $.type === "text"), A = w.length > 1 && new Set(w.map(($) => $.fontFamily)).size > 1;
    C.dataset.i18n = A ? "properties.mixedFonts" : "editor.selectionCountHint", C.textContent = A ? y("properties.mixedFonts") : y("editor.selectionCountHint", { count: n.length }), e.append(C);
    return;
  }
  const u = wo(o);
  if (u) {
    const C = document.createElement("p");
    C.className = "guarded-note", C.textContent = u, e.append(C);
  }
  const f = (C, w, A, $ = "number", z, V, B = !1) => {
    const M = document.createElement("div");
    M.className = "field", we.push(ct(M, {
      id: V ?? `field-${C.replaceAll(".", "-")}`,
      label: () => y(C),
      value: w,
      type: $,
      className: V,
      disabled: u !== null || B,
      list: z,
      onCommit(O) {
        if (O === w) return;
        const D = A(O);
        D && se(`change ${y(C)}`, D);
      }
    })), e.append(M);
  }, h = (C, w, A, $, z, V = !1) => {
    const B = document.createElement("div");
    B.className = "field", we.push(ct(B, {
      id: w,
      label: () => y(C),
      value: A,
      className: w,
      disabled: u !== null || V,
      options: $,
      onCommit: z
    })), e.append(B);
  }, d = (C, w, A, $, z) => {
    const V = document.createElement("div");
    V.className = "field paint-field", Ur(
      V,
      w,
      y(C),
      A,
      u !== null,
      (B) => {
        se(`change ${y(C)}`, $(B));
      },
      w,
      z ? {
        label: y("canvas.none"),
        className: z.className,
        title: y("canvas.removeColor", { label: y(C).toLowerCase() }),
        disabled: z.disabled,
        onClear: z.onClear
      } : void 0
    ), e.append(V);
  };
  if (o.type === "text") {
    e = t("Typography");
    const C = document.createElement("span");
    C.style.display = "contents", we.push(ot(C, {
      id: "edit-layer-text",
      label: () => y("canvas.editText"),
      icon: "ph-pencil-simple",
      className: "wide-action edit-text-button",
      disabled: u !== null,
      onClick: () => xo(o)
    })), e.append(C);
    const w = Dn.families.includes(o.fontFamily), A = document.createElement("div");
    A.className = "current-font-summary";
    const $ = document.createElement("strong");
    $.className = "current-font-family", $.textContent = o.fontFamily;
    const z = document.createElement("span");
    if (z.className = "current-font-face", z.textContent = `${o.fontWeight ?? 400} · ${o.fontStyle ?? "normal"} · ${o.fontSize} px`, A.append($, z), w) {
      const P = document.createElement("span");
      P.className = "current-font-specimen";
      const F = Dn.faces.find(
        (_) => _.family === o.fontFamily && _.weight === (o.fontWeight ?? 400) && _.style === (o.fontStyle ?? "normal")
      );
      if (F)
        Zf(P, F);
      else {
        const _ = document.createElement("span");
        _.className = "font-specimen-status", _.textContent = y("fonts.previewUnavailable"), P.append(_);
      }
      A.append(P);
    } else {
      const P = document.createElement("p");
      P.className = "current-font-status", P.dataset.i18n = "properties.fontMissing", P.textContent = y("properties.fontMissing");
      const F = document.createElement("span");
      F.style.display = "contents", we.push(ot(F, {
        id: "install-fonts",
        label: () => y("fonts.installFonts"),
        className: "small",
        onClick: () => {
          Me("fonts", () => jc(!0));
        }
      })), A.append(P, F);
    }
    e.append(A);
    const V = document.createElement("label");
    V.className = "field", V.append(Hl("properties.font"));
    const B = Xl(o, u !== null);
    V.append(B.root), e.append(V), f("properties.fontSize", String(o.fontSize), (P) => ({ op: "update", id: o.id, fontSize: Number(P) })), f("properties.lineHeight", String(o.lineHeight ?? 1.2), (P) => ({ op: "update", id: o.id, lineHeight: Number(P) })), f("properties.paragraphSpacing", String(o.paragraphSpacing ?? 0), (P) => ({ op: "update", id: o.id, paragraphSpacing: Number(P) }));
    const M = Qf(o.fontFamily, Dn.faces);
    if (M.length) {
      const P = o.fontWeight ?? 400, F = o.fontStyle ?? "normal", _ = [.../* @__PURE__ */ new Set([
        ...M.filter((U) => U.style === F).map((U) => U.weight),
        P
      ])].sort((U, X) => U - X);
      h(
        "properties.weight",
        "font-weight",
        String(P),
        _.map((U) => ({ value: String(U), label: String(U) })),
        (U) => {
          se("change Weight", { op: "update", id: o.id, fontWeight: Number(U) });
        }
      );
    } else
      f("properties.weight", String(o.fontWeight ?? 400), (P) => ({ op: "update", id: o.id, fontWeight: Number(P) }));
    f("properties.letterSpacing", String(o.letterSpacing ?? 0), (P) => ({ op: "update", id: o.id, letterSpacing: Number(P) }));
    const O = o.fontStyle ?? "normal", D = o.fontWeight ?? 400, L = M.filter((P) => P.weight === D).map((P) => P.style === "oblique" ? "italic" : P.style), I = M.length ? [.../* @__PURE__ */ new Set([...L, O])] : [O];
    if (h(
      "properties.style",
      "font-style",
      o.fontStyle ?? "normal",
      I.map((P) => ({ value: P, label: P })),
      (P) => {
        se("change font style", { op: "update", id: o.id, fontStyle: P });
      }
    ), h(
      "properties.verticalAlign",
      "vertical-align",
      o.verticalAlign ?? "top",
      ["top", "middle", "bottom"].map((P) => ({ value: P, label: P })),
      (P) => {
        se("change vertical align", { op: "update", id: o.id, verticalAlign: P });
      }
    ), d(
      "properties.colour",
      "text-fill",
      o.color ?? "#000000",
      (P) => ({ op: "update", id: o.id, color: P })
    ), d(
      "properties.strokeColour",
      "text-stroke",
      o.stroke?.color ?? "#000000",
      (P) => ({ op: "update", id: o.id, stroke: { color: P, width: o.stroke?.width ?? 1 } }),
      { className: "text-stroke-none", disabled: !o.stroke, onClear: () => {
        se("clear text stroke", { op: "update", id: o.id, stroke: null });
      } }
    ), f("properties.strokeWidth", String(o.stroke?.width ?? 1), (P) => ({ op: "update", id: o.id, stroke: { color: o.stroke?.color ?? "#000000", width: Number(P) } })), j.project && j.document) {
      const P = Zl(j.project, j.document, o), F = document.createElement("div");
      e.append(F), we.push(hx(F, {
        capture: P,
        layer: o,
        drafts: Va,
        disabled: u !== null,
        fonts: { store: () => Dn },
        submit: r0,
        reload: async () => {
          const _ = await Tn.outcome("reload runs", async () => {
            if (j.project !== P.project || j.document?.id !== P.document) throw new Error(y("runs.notSent"));
            const U = await Ao(P.project);
            if (j.project !== P.project || j.document?.id !== P.document) throw new Error(y("runs.notSent"));
            const X = Be($e(U)).find((ne) => ne.layer.id === P.layer)?.layer;
            if (!X || X.type !== "text") throw new Error(y("runs.notSent"));
            Va.set(nc(P), op(Zl(P.project, U, X))), Wn(U);
          });
          return _.status === "refused" ? String(_.error) : null;
        }
      }));
    }
  }
  t("Transform");
  const m = document.createElement("div");
  m.className = "property-grid";
  const g = (C, w, A) => {
    const $ = `transform-${C.split(".").at(-1)}`, z = document.createElement("div");
    z.className = "field", we.push(ct(z, {
      id: $,
      label: () => y(C),
      value: w,
      type: "number",
      className: $,
      disabled: u !== null,
      onCommit(V) {
        const B = A(V);
        B && se(`change ${y(C)}`, B);
      }
    })), m.append(z);
  }, v = o.transform;
  if (g("properties.x", String(v.x), (C) => Gl(o, Number(C), v.y)), g("properties.y", String(v.y), (C) => Gl(o, v.x, Number(C))), g("properties.width", String(v.width), (C) => Jl(o, Number(C), v.height)), g("properties.height", String(v.height), (C) => Jl(o, v.width, Number(C))), g("properties.rotation", String(v.rotation ?? 0), (C) => ({ op: "rotate", id: o.id, degrees: Number(C) })), g("properties.opacity", String(o.opacity ?? 1), (C) => ({ op: "update", id: o.id, opacity: Number(C) })), e.append(m), (o.type === "image" || o.type === "svg") && (e = t("Media"), h(
    "properties.fit",
    "layer-fit",
    o.fit ?? "fill",
    Fb.map((C) => ({ value: C, label: C })),
    (C) => {
      se("change fit", { op: "update", id: o.id, fit: C });
    }
  ), o.type === "image")) {
    const C = $x(o), w = Lx(o), A = w?.width ?? null, $ = w?.height ?? null, z = typeof A == "number" && A > 0 && typeof $ == "number" && $ > 0, V = document.createElement("p");
    V.className = "hint";
    const B = z ? "canvas.cropAvailableHint" : "canvas.cropUnavailableHint";
    V.dataset.i18n = B, V.textContent = y(B), e.append(V);
    const M = C ?? { x: 0, y: 0, width: A ?? 0, height: $ ?? 0 }, O = (P, F, _, U) => {
      f(P, String(_), (X) => U(Number(X)), "number", void 0, F, !z);
    }, D = (P) => !Number.isFinite(P.x) || !Number.isFinite(P.y) || !(P.width > 0) || !(P.height > 0) ? null : { op: "update", id: o.id, crop: P };
    O("canvas.cropX", "crop-x", M.x, (P) => D({ ...M, x: P })), O("canvas.cropY", "crop-y", M.y, (P) => D({ ...M, y: P })), O("canvas.cropWidth", "crop-width", M.width, (P) => D({ ...M, width: P })), O("canvas.cropHeight", "crop-height", M.height, (P) => D({ ...M, height: P }));
    const L = document.createElement("div");
    L.className = "field";
    const I = document.createElement("span");
    I.style.display = "contents", we.push(ot(I, {
      id: "clear-image-crop",
      label: () => y("canvas.clearCrop"),
      title: () => y("canvas.wholeImage"),
      className: "small crop-clear",
      disabled: u !== null || C === null,
      onClick: () => {
        se("clear crop", { op: "update", id: o.id, crop: null });
      }
    })), L.append(I), e.append(L);
  }
  if (o.type === "shape") {
    e = t("Shape");
    const C = Wf(o), w = o.stroke?.color ?? ap, A = o.stroke?.width ?? ip, $ = (P, F, _, U, X, ne) => {
      const de = document.createElement("div");
      de.className = "field shape-field";
      const oe = document.createElement("span");
      oe.dataset.i18n = P, oe.textContent = y(P);
      const te = document.createElement("span");
      te.className = "shape-paint", Ur(
        te,
        F,
        y(P),
        _,
        u !== null,
        (fe) => {
          se(`change ${y(P)}`, X(fe));
        },
        F,
        {
          label: y("canvas.none"),
          className: `small ${F}-none`,
          title: y("canvas.removeColor", { label: y(P).toLowerCase() }),
          disabled: !U,
          onClear: () => {
            se(`clear ${y(P)}`, ne());
          }
        }
      ), U || (te.title = y("canvas.noColor", { label: y(P).toLowerCase() })), de.append(oe, te), e.append(de);
    };
    $(
      "properties.fill",
      "shape-fill",
      o.fill ?? ac,
      !!o.fill,
      (P) => ({ op: "update", id: o.id, fill: P }),
      () => ({ op: "update", id: o.id, fill: null })
    ), $(
      "properties.stroke",
      "shape-stroke",
      w,
      !!o.stroke,
      (P) => ({ op: "update", id: o.id, stroke: { color: P, width: A } }),
      () => ({ op: "update", id: o.id, stroke: null })
    ), f(
      "properties.strokeWidth",
      String(A),
      (P) => ({
        op: "update",
        id: o.id,
        stroke: { color: w, width: Number(P) }
      }),
      "number",
      void 0,
      "shape-stroke-width"
    ), C === "rect" && f(
      "properties.cornerRadius",
      String(Bb(o)),
      (P) => ({ op: "update", id: o.id, cornerRadius: Number(P) }),
      "number",
      void 0,
      "shape-corner-radius"
    );
    const z = (P, F) => {
      const _ = pn.get(F);
      if (!_) return;
      const U = document.createElement("span");
      U.className = `control-error ${F}-note`, U.textContent = _, P.append(U);
    }, V = (P) => (F) => {
      pn.set(
        P,
        F instanceof Ue ? cc(F) : String(F)
      ), lt();
    }, B = document.createElement("div");
    B.className = "field shape-field shape-path";
    const M = o.shape, O = C === "path" && typeof M.d == "string" ? M.d : "";
    we.push(ct(B, {
      id: "shape-path-d",
      label: () => y("canvas.pathData"),
      type: "textarea",
      value: O,
      className: "shape-path-d",
      rows: 3,
      maxLength: 2048,
      disabled: u !== null,
      onCommit: (P) => {
        const F = P.trim();
        !F || F === O || (pn.delete("path-d"), se("set path data", {
          op: "update",
          id: o.id,
          shape: { kind: "path", d: F }
        }, V("path-d")));
      }
    })), z(B, "path-d"), e.append(B);
    const D = document.createElement("div");
    D.className = "field shape-field shape-dash-row";
    const L = (o.stroke?.dashArray ?? []).join(", ");
    we.push(ct(D, {
      id: "shape-dash",
      label: () => y("canvas.dashPattern"),
      type: "text",
      value: L,
      className: "shape-dash",
      placeholder: y("canvas.dashExample"),
      disabled: u !== null,
      onCommit: (P) => {
        const F = P.trim();
        pn.delete("dash");
        const _ = F ? F.split(",").map((X) => Number(X.trim())) : [];
        if (_.some((X) => !Number.isFinite(X) || X <= 0)) {
          pn.set("dash", y("canvas.dashPositiveError")), lt();
          return;
        }
        if (_.length > Cl) {
          pn.set("dash", y("canvas.dashMaxError", { count: Cl })), lt();
          return;
        }
        const U = {
          ...o.stroke ?? { color: w, width: A },
          dashArray: _.length ? _ : null
        };
        se("change dash pattern", { op: "update", id: o.id, stroke: U }, V("dash"));
      }
    })), z(D, "dash"), e.append(D);
    const I = (P, F, _, U) => {
      const X = o.stroke?.[_], ne = typeof X == "string" ? X : null, de = ne && !U.includes(ne) ? [...U, ne] : [...U];
      h(P, F, ne ?? U[0] ?? "", de.map((oe) => ({ value: oe, label: oe })), (oe) => {
        const te = {
          ...o.stroke ?? { color: w, width: A },
          [_]: oe
        };
        se(`change ${y(P).toLowerCase()}`, { op: "update", id: o.id, stroke: te });
      });
    };
    if (I("properties.lineCap", "shape-stroke-cap", "lineCap", ["butt", "round", "square"]), I("properties.lineJoin", "shape-stroke-join", "lineJoin", ["miter", "round", "bevel"]), C === "line") {
      const P = (F, _, U) => {
        const X = M[U], ne = typeof X == "string" && X !== "none" && !["arrow", "circle"].includes(X) ? ["none", "arrow", "circle", X] : ["none", "arrow", "circle"];
        h(
          F,
          _,
          typeof X == "string" ? X : "none",
          ne.map((de) => ({ value: de, label: de })),
          (de) => {
            se(`change ${y(F).toLowerCase()}`, {
              op: "update",
              id: o.id,
              [U]: de
            });
          }
        );
      };
      P("properties.markerStart", "shape-marker-start", "markerStart"), P("properties.markerEnd", "shape-marker-end", "markerEnd");
    }
  }
  e = t("Clip and mirror");
  const x = Ox(o), b = [...Dx];
  x && !b.includes(x) && b.push(x), h("properties.clip", "clip-shape", x ?? "none", ["none", ...b].map((C) => ({ value: C, label: C })), (C) => {
    if (C === (x ?? "none")) return;
    const w = C === "none" ? null : C === "rect" ? { shape: "rect", cornerRadius: Vl(o) } : { shape: C };
    se("change clip", { op: "update", id: o.id, clip: w });
  }), x === "rect" && f(
    "properties.clipRadius",
    String(Vl(o)),
    (C) => ({
      op: "update",
      id: o.id,
      clip: { shape: "rect", cornerRadius: Number(C) }
    }),
    "number",
    void 0,
    "clip-radius"
  );
  const E = document.createElement("div");
  E.className = "property-flags";
  const S = (C, w, A, $) => {
    const z = document.createElement("div");
    z.className = "field checkbox", we.push(Wo(z, {
      id: w,
      label: () => y(C),
      checked: $,
      disabled: u !== null,
      className: w,
      onChange: (V) => {
        se(y(C).toLowerCase(), { op: "update", id: o.id, [A]: V });
      }
    })), E.append(z);
  };
  S("properties.flipHorizontal", "flip-horizontal", "flipHorizontal", o.transform.flipHorizontal ?? !1), S("properties.flipVertical", "flip-vertical", "flipVertical", o.transform.flipVertical ?? !1), e.append(E), e = t("Appearance"), h(
    "properties.blendMode",
    "blend-mode",
    o.blendMode ?? "normal",
    Vb.map((C) => ({ value: C, label: C })),
    (C) => {
      se("change blend mode", { op: "update", id: o.id, blendMode: C });
    }
  ), Zx(N.advancedInspector, o, u !== null), Qx(N.advancedInspector, o, u !== null), e0(N.advancedInspector, o);
  const k = document.createElement("div");
  k.className = "property-flags";
  const R = document.createElement("div");
  R.className = "field checkbox", we.push(Wo(R, {
    id: "layer-visible",
    label: () => y("properties.visible"),
    checked: o.visible ?? !0,
    disabled: u !== null,
    onChange: (C) => {
      se("show/hide", { op: "setVisible", id: o.id, visible: C });
    }
  }));
  const T = document.createElement("div");
  T.className = "field checkbox", we.push(Wo(T, {
    id: "layer-locked",
    label: () => y("properties.locked"),
    checked: o.locked ?? !1,
    disabled: wo(o, !0) !== null,
    onChange: (C) => {
      se(C ? "lock layer" : "unlock layer", { op: "setLocked", id: o.id, locked: C });
    }
  })), k.append(R, T), e.append(k);
}
function ga(e) {
  return e === "hueRotate" ? y("effects.hueRotate") : e === "invert" ? y("effects.invert") : e.replace(/([A-Z])/g, " $1").replace(/^./, (t) => t.toUpperCase());
}
function Zx(e, t, n) {
  const o = t.effects ?? [], r = ar(e, "Effects"), s = (f) => {
    se("effects", { op: "update", id: t.id, effects: f });
  };
  for (const [f, h] of o.entries()) {
    const d = document.createElement("div");
    d.className = "effect-row", d.dataset.effect = h.type;
    const m = document.createElement("span");
    m.className = "effect-name", m.textContent = ga(h.type), (h.type === "hueRotate" || h.type === "invert") && (m.dataset.i18n = `effects.${h.type}`), d.append(m);
    const g = Hb(h);
    g.length > 1 && d.classList.add("multi");
    const v = (E) => {
      const S = document.createElement("span");
      S.className = "effect-input-host";
      const k = `effect-${t.id}-${f}-${E.name}`;
      return we.push(ct(S, {
        id: k,
        label: () => `${ga(h.type)} ${E.name === "degrees" ? y("effects.degrees") : h.type === "invert" && E.name === "amount" ? y("effects.amount") : E.name}`,
        value: String(E.value),
        type: E.kind === "color" ? "text" : "number",
        step: E.kind === "number" ? E.name === "degrees" ? "1" : "0.05" : void 0,
        disabled: n,
        onMount: (R) => {
          R.dataset.field = E.name;
        },
        onCommit: (R) => {
          const T = E.kind === "color" ? R.trim() : Number(R);
          typeof T == "number" && !Number.isFinite(T) || T !== E.value && s(o.map((C, w) => w === f ? { ...C, [E.name]: T } : C));
        }
      })), S;
    };
    if (g.length === 1 && g[0])
      d.append(v(g[0]));
    else if (g.length > 1) {
      const E = document.createElement("span");
      E.className = "effect-fields";
      for (const S of g) {
        const k = document.createElement("label");
        k.className = "effect-field";
        const R = document.createElement("span");
        R.textContent = S.name, k.append(R, v(S)), E.append(k);
      }
      d.append(E);
    }
    const x = (E) => {
      const S = [...o], k = S[f], R = S[E];
      !k || !R || (S[f] = R, S[E] = k, s(S));
    }, b = (E, S, k, R, T) => {
      const C = document.createElement("span");
      return C.style.display = "contents", we.push(ot(C, {
        id: `effect-action-${t.id}-${f}-${E}`,
        className: E,
        label: S,
        title: S,
        icon: k,
        disabled: R,
        onClick: T
      })), C;
    };
    d.append(
      b("small effect-up", y("effects.moveUp", { effect: h.type }), "ph-arrow-up", n || f === 0, () => x(f - 1)),
      b("small effect-down", y("effects.moveDown", { effect: h.type }), "ph-arrow-down", n || f === o.length - 1, () => x(f + 1)),
      b("small effect-remove", y("effects.remove"), "ph-trash", n, () => s(o.filter((E, S) => S !== f)))
    ), r.append(d);
  }
  const a = document.createElement("div");
  a.className = "effect-add-row";
  let i = jl[0] ?? "brightness";
  const l = document.createElement("span");
  we.push(ct(l, {
    id: `effect-chooser-${t.id}`,
    label: () => y("effects.choose"),
    value: i,
    className: "effect-chooser",
    disabled: n,
    options: jl.map((f) => ({ value: f, label: () => ga(f) })),
    onCommit: (f) => {
      i = f;
    }
  }));
  const u = document.createElement("span");
  u.style.display = "contents", we.push(ot(u, {
    id: `effect-add-${t.id}`,
    className: "effect-add",
    icon: "ph-plus",
    label: () => y("effects.add"),
    disabled: n,
    onClick: () => {
      const f = N.advancedInspector.querySelector(".effect-chooser");
      f && (i = f.value), s([...o, Ub(i)]);
    }
  })), a.append(l, u), r.append(a);
}
function Qx(e, t, n) {
  const o = ar(e, "Presets");
  if (j.presets.length === 0) {
    const a = document.createElement("p");
    a.className = "hint", a.dataset.i18n = "presets.none", a.textContent = y("presets.none"), o.append(a);
  }
  for (const a of j.presets) {
    const i = document.createElement("div");
    i.className = "preset-row";
    const l = document.createElement("span");
    l.className = "effect-name", l.textContent = a.name, a.description && (l.title = a.description), i.append(l);
    const u = document.createElement("span");
    u.style.display = "contents", we.push(ot(u, {
      id: `preset-apply-${++bn}`,
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
    f.style.display = "contents", we.push(ot(f, {
      id: `preset-remove-${++bn}`,
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
  s.style.display = "contents", we.push(ot(s, {
    id: `preset-save-${++bn}`,
    label: () => y("presets.saveStyle"),
    onClick: () => {
      Us("presets.saveTitle", "presets.name", "presets.saveButton", (a) => {
        se(`define ${a}`, {
          op: "definePreset",
          preset: { name: a, properties: qb(t) }
        });
      });
    }
  })), r.append(s), o.append(r);
}
function e0(e, t) {
  const n = ar(e, "Slots");
  for (const i of j.slots) {
    const l = document.createElement("div");
    l.className = "slot-row";
    const u = document.createElement("span");
    u.className = "effect-name", u.textContent = `${i.name}${i.required ? " *" : ""}`, u.title = i.description ?? `${i.kind ?? "text"} → ${i.layer}`, i.layer === t.id && u.classList.add("slot-on-this-layer"), l.append(u);
    const f = document.createElement("span");
    f.style.display = "contents", we.push(ot(f, {
      id: `slot-edit-${++bn}`,
      label: () => y("common.edit"),
      className: "small slot-edit",
      title: () => y("slots.editHint", { name: i.name }),
      onMount(d) {
        d.dataset.slot = i.name, d.dataset.slotName = i.name;
      },
      onClick: () => t0(l, i)
    })), l.append(f);
    const h = document.createElement("span");
    h.style.display = "contents", we.push(ot(h, {
      id: `slot-remove-${++bn}`,
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
  s.style.display = "contents", we.push(ct(s, {
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
  a.style.display = "contents", we.push(ot(a, {
    id: `slot-offer-${++bn}`,
    label: () => y("slots.offer"),
    onClick: () => {
      Us("slots.createTitle", "slots.name", "slots.createButton", (i) => {
        se(`offer ${i}`, {
          op: "defineSlot",
          slot: { name: i, layer: t.id, kind: r }
        });
      });
    }
  })), o.append(s, a), n.append(o);
}
function t0(e, t) {
  e.replaceChildren();
  const n = document.createElement("span"), o = document.createElement("span"), r = document.createElement("span"), s = document.createElement("span"), a = document.createElement("span");
  for (const u of [n, o, r, s, a]) u.style.display = "contents";
  e.append(n, o, r, s, a);
  const i = ++bn;
  we.push(ct(n, {
    id: `slot-edit-name-${i}`,
    label: () => y("slots.name"),
    value: t.name,
    className: "slot-edit-name",
    onCommit: () => {
    }
  })), we.push(ct(o, {
    id: `slot-edit-kind-${i}`,
    label: () => y("slots.kind"),
    value: t.kind ?? "text",
    className: "slot-edit-kind",
    options: ["text", "image", "color"].map((u) => ({ value: u, label: u })),
    onCommit: () => {
    }
  })), we.push(ct(r, {
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
      lt();
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
  we.push(ot(s, {
    id: `slot-edit-save-${i}`,
    label: () => y("common.save"),
    className: "small slot-edit-save",
    onClick: () => l(!0)
  })), we.push(ot(a, {
    id: `slot-edit-cancel-${i}`,
    label: () => y("common.cancel"),
    className: "small",
    onClick: () => l(!1)
  })), e.addEventListener("keydown", (u) => {
    u.key === "Enter" && (u.preventDefault(), l(!0)), u.key === "Escape" && (u.preventDefault(), u.stopPropagation(), l(!1));
  }), e.querySelector(".slot-edit-name")?.focus();
}
let Xa = 0;
async function n0() {
  if (!j.project) return;
  const e = ++Xa, t = await Rb(j.project);
  e === Xa && (wr = { entries: t.entries, position: t.position, head: t.head }, Nt(), N.undo.disabled = t.position === 0, N.redo.disabled = t.position >= t.head);
}
function Gl(e, t, n) {
  const o = t - e.transform.x, r = n - e.transform.y;
  return o === 0 && r === 0 ? null : { op: "move", id: e.id, dx: o, dy: r };
}
function Jl(e, t, n) {
  return t === e.transform.width && n === e.transform.height ? null : { op: "resize", id: e.id, width: t, height: n };
}
function o0(e) {
  if (!("id" in e) || e.op !== "update") return null;
  const t = e.id;
  if (typeof t != "string") return null;
  const n = Object.keys(e).filter((o) => o !== "op" && o !== "id" && o !== "expectedVersion").sort();
  return n.length > 0 ? `update:${t}:${n.join(",")}` : null;
}
function mp(e) {
  if (!j.document) return !1;
  let t = !1;
  for (const n of e)
    if (n.op === "move" || n.op === "resize" || n.op === "rotate") {
      const o = Be($e(j.document)).find(({ layer: r }) => r.id === n.id)?.layer;
      if (!o) continue;
      n.op === "move" ? (o.transform.x += n.dx, o.transform.y += n.dy) : n.op === "resize" ? (o.transform.width = n.width, o.transform.height = n.height) : o.transform.rotation = n.degrees, t = !0;
    }
  return t && (ft(), ri() && gc(zt())), t;
}
function gp() {
  const e = j.project, t = j.document ? structuredClone(j.document) : null;
  return () => {
    if (!t || j.project !== e) return;
    const n = j.document;
    if (n && Le(n) === Le(t)) {
      Et(), j.document = t, Nt(), ft(), lt();
      return;
    }
    Me("reload", Ge);
  };
}
function Zl(e, t, n) {
  return { project: e, document: t.id, layer: n.id, version: Le(t), text: n.text, runs: n.runs ?? [] };
}
async function r0(e) {
  const t = dx(e);
  if (!t) return { status: "applied" };
  let n = !1;
  const o = await Tn.outcome("apply runs", async () => {
    const r = e.capture;
    if (j.project !== r.project || j.document?.id !== r.document || j.selection.length !== 1 || j.selection[0] !== r.layer) throw new Error(y("runs.notSent"));
    const s = Be($e(j.document)).find((l) => l.layer.id === r.layer)?.layer;
    if (!s || wo(s)) throw new Error(y("runs.notSent"));
    const a = await Un(r.project, t, r.version);
    n = !0;
    const i = a.document ?? await Ao(r.project);
    if (j.project !== r.project || j.document?.id !== r.document) throw new Error(y("runs.notSent"));
    Va.delete(nc(r)), Wn(i), xe(y("status.editDone", { version: a.version }));
  });
  return o.status === "applied" ? { status: "applied" } : (sn("apply runs", o.error), { status: n ? "committed" : o.error instanceof Ue ? "refused" : "unknown", error: n ? y("runs.committed") : o.error instanceof Ue ? cc(o.error) : `${y("runs.failed")} ${String(o.error)}` });
}
async function se(e, t, n) {
  if (!j.project || !j.document) return;
  const o = j.project, r = gp();
  let s = !1;
  mp([t]), await Tn.enqueue({
    label: e,
    coalesceKey: o0(t),
    run: async () => {
      if (j.project !== o || !j.document) {
        xe(y("status.editNotSent"), "error");
        return;
      }
      const a = await Un(
        o,
        t,
        Le(j.document)
      );
      s = !0, xe(y("status.editDone", { version: a.version })), a.created?.length && (j.selection = a.created), a.document ? Wn(a.document) : await Ge();
    },
    onError: (a) => {
      s || r(), n && n(a), sn(e, a);
    },
    onSuperseded: r
  });
}
async function s0(e, t) {
  await xt(e, t);
}
async function xt(e, t, n) {
  if (!j.project || !j.document || t.length === 0) return;
  const o = j.project, r = gp();
  let s = !1;
  mp(t), await Tn.enqueue({
    label: e,
    coalesceKey: null,
    run: async () => {
      if (j.project !== o || !j.document || n && !Sr(n)) {
        r(), Et(), xe(y("status.editNotSent"), "error");
        return;
      }
      const a = await Nb(
        o,
        e,
        t,
        n?.version ?? Le(j.document)
      );
      s = !0, a.created?.length && (j.selection = a.created), xe(y("status.editDone", { version: a.version })), a.document ? Wn(a.document) : await Ge();
    },
    onError: (a) => {
      s || r(), sn(e, a);
    }
  });
}
function va(e, t, n, o, r) {
  if (e.preventDefault(), !j.document || N.canvas.getBoundingClientRect().width === 0 || j.drag && j.drag.pointerId !== e.pointerId || o === "resize" && !Wa()) return;
  Je();
  const s = N.canvas;
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
    generation: ++ic,
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
  }, !a0(j.drag)) {
    _t !== null && Et(), Ql(j.drag);
    const a = wt;
    !j.drag.previewActive && a && a.pending.then(() => {
      j.drag && wt === a && Ql(j.drag);
    });
  }
  try {
    s.setPointerCapture?.(e.pointerId);
  } catch {
    e.isTrusted && Je();
  }
}
function a0(e) {
  return e.mode !== "move" || !j.document || nr === null || _t !== Le(j.document) ? !1 : (e.adoptedDelta = nr, e.previewActive = !0, mc(e, e.lastDelta?.x ?? 0, e.lastDelta?.y ?? 0), !0);
}
function hc(e) {
  return !j.project || !j.document ? null : `${j.project}:${Le(j.document)}:${[...e].sort().join(",")}`;
}
function vp() {
  const e = wt;
  if (wt = null, !!e) {
    e.baseUrl && !Ln.includes(e.baseUrl) && URL.revokeObjectURL(e.baseUrl), e.selectionUrl && !Ln.includes(e.selectionUrl) && URL.revokeObjectURL(e.selectionUrl);
    for (const t of e.items ?? []) Ln.includes(t.url) || URL.revokeObjectURL(t.url);
  }
}
async function yp(e) {
  const t = hc(e);
  if (!t || !j.project || !j.document) return;
  if (wt?.key === t) return wt.pending;
  vp();
  const n = j.project, o = Le(j.document), r = rr(), s = {
    key: t,
    pending: Promise.resolve()
  };
  return wt = s, s.pending = Promise.all([
    Bn(Qr(n, o, r, { exclude: e })),
    Bn(Qr(n, o, r, { only: e }))
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
function Ql(e) {
  if (e.mode === "resize") {
    as(e);
    return;
  }
  const t = wt;
  if (e.previewActive || t?.key !== hc(e.ids) || !t.baseUrl || !t.selectionUrl) return;
  const n = document.createElement("img");
  n.id = "drag-preview-base", n.className = "drag-preview-image", n.alt = "", n.src = t.baseUrl;
  const o = document.createElement("img");
  o.id = "drag-preview-selection", o.className = "drag-preview-image drag-preview-selection", o.alt = "", o.src = t.selectionUrl, N.overlay.before(n, o), N.canvasImage.classList.add("drag-preview-hidden"), Ln = [t.baseUrl, t.selectionUrl], e.previewActive = !0, mc(e, e.lastDelta?.x ?? 0, e.lastDelta?.y ?? 0);
}
function Et() {
  document.getElementById("drag-preview-base")?.remove(), document.getElementById("drag-preview-selection")?.remove(), document.querySelectorAll("[data-resize-preview-item]").forEach((e) => e.remove()), N.canvasImage.classList.remove("drag-preview-hidden");
  for (const e of Ln) URL.revokeObjectURL(e);
  Ln = [], _t = null, nr = null, vp();
}
function ss(e) {
  return e.handle?.length === 2 && e.origins.length === 1 && e.origins[0]?.layer.type === "image" ? !e.shift : e.shift;
}
function Sr(e) {
  if (e.cancelled || e.generation !== ic || j.project !== e.project || !j.document || Le(j.document) !== e.version) return !1;
  const t = Be($e(j.document));
  return e.ids.every((n) => {
    const o = t.find((r) => r.layer.id === n);
    return o && rt(o.layer) && pc(t, o.parent) !== null;
  });
}
function Ya(e) {
  e.capture.hasPointerCapture?.(e.pointerId) && e.capture.releasePointerCapture(e.pointerId);
}
function Je() {
  const e = j.drag?.mode === "resize" ? j.drag : yn;
  e && (e.cancelled = !0, ic += 1, j.drag === e && (j.drag = null), yn = null, Ya(e), Et(), delete N.canvas.dataset.resizePreview, ft());
}
function bp(e, t, n) {
  const o = mw(
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
function wp(e, t) {
  return e.origins.map((n) => ({ origin: n, next: e.origins.length === 1 ? t : Jf(
    { x: n.absoluteX, y: n.absoluteY, width: n.width, height: n.height },
    e.bounds,
    t,
    !0
  ) }));
}
function i0(e, t) {
  const n = e.origins[0];
  if (e.origins.length !== 1 || n?.layer.type !== "text" || ss(e) || e.handle !== "e" && e.handle !== "w" || t.width === e.bounds.width || e.measurement?.width === t.width && e.measurement.epoch === e.epoch) return;
  const o = { width: t.width, epoch: e.epoch, pending: Promise.resolve(), height: void 0 };
  e.measurement = o, o.pending = Kf(e.project, n.id, t.width).then((r) => {
    if (!Sr(e) || e.measurement !== o || e.epoch !== o.epoch || ss(e)) return;
    const s = Math.max(1, Math.ceil(r.height));
    Number.isFinite(s) && (o.height = s, j.drag === e && qs(e));
  }).catch(() => {
  });
}
function Vo(e) {
  (e.previewActive || _t !== null || document.querySelector(".drag-preview-image")) && Et(), e.previewActive = !1, N.canvas.dataset.resizePreview = "handles-only";
}
function as(e) {
  if (!j.document || e.cancelled || !Sr(e)) return;
  const t = e.next, n = gw(j.document, e.ids), o = t ? wp(e, t) : [], r = o.some(({ origin: u, next: f }) => [
    { x: u.absoluteX, y: u.absoluteY, width: u.width, height: u.height },
    f
  ].some((h) => {
    const d = ts({ ...h, rotation: u.rotation });
    return d.x < 0 || d.y < 0 || d.x + d.width > j.document.canvas.width || d.y + d.height > j.document.canvas.height;
  })), s = N.canvasImage.getBoundingClientRect(), a = s.width === j.document.canvas.width && s.height === j.document.canvas.height;
  if (!t || !n || r || !a) {
    Vo(e);
    return;
  }
  const i = wt;
  if (!i || i.key !== hc(e.ids) || !i.baseUrl) {
    Vo(e), yp(e.ids).then(() => {
      j.drag === e && as(e);
    });
    return;
  }
  if (!i.items) {
    Vo(e), i.itemsPending ??= (async () => {
      const u = [];
      try {
        for (const f of n) u.push({ id: f.id, url: await Bn(Qr(e.project, e.version, rr(), { only: [f.id] })) });
        if (wt !== i) {
          for (const f of u) URL.revokeObjectURL(f.url);
          return;
        }
        i.items = u, j.drag === e && as(e);
      } catch {
        for (const f of u) URL.revokeObjectURL(f.url);
      }
    })();
    return;
  }
  const l = i.items.map((u) => {
    const f = o.find(({ origin: h }) => h.id === u.id);
    return vw(
      f.origin.layer,
      { x: f.origin.absoluteX, y: f.origin.absoluteY, width: f.origin.width, height: f.origin.height },
      f.next
    );
  });
  if (l.some((u) => !u)) {
    Vo(e);
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
    const f = document.querySelector(`[data-resize-preview-item="${CSS.escape(i.items[u].id)}"]`), h = l[u];
    f.style.transformOrigin = "0 0", f.style.transform = `matrix(${h[0]},${h[1]},${h[2]},${h[3]},${h[4] * s.width / j.document.canvas.width},${h[5] * s.height / j.document.canvas.height})`;
  }
  N.canvas.dataset.resizePreview = "items";
}
function qs(e) {
  if (!Sr(e)) {
    Je();
    return;
  }
  const t = bp(e, e.lastDelta?.x ?? 0, e.lastDelta?.y ?? 0);
  if (e.invalid = t === null, e.next = t ?? void 0, !t) {
    Vo(e);
    return;
  }
  i0(e, t);
  const n = N.overlay.querySelector(".handle-box");
  n && j.document && (n.style.left = `${t.x / j.document.canvas.width * 100}%`, n.style.top = `${t.y / j.document.canvas.height * 100}%`, n.style.width = `${t.width / j.document.canvas.width * 100}%`, n.style.height = `${t.height / j.document.canvas.height * 100}%`), as(e);
}
function mc(e, t, n) {
  if (e.mode === "resize") {
    qs(e);
    return;
  }
  if (!j.document || !e.previewActive) return;
  const o = document.getElementById("drag-preview-selection");
  if (!o) return;
  const r = j.document.canvas;
  if (o.style.transformOrigin = "0 0", e.mode === "move")
    o.style.transform = `translate(${((e.adoptedDelta?.x ?? 0) + t) / r.width * 100}%, ${((e.adoptedDelta?.y ?? 0) + n) / r.height * 100}%)`;
  else {
    const s = N.canvas.getBoundingClientRect(), a = s.left + (e.bounds.x + e.bounds.width / 2) / r.width * s.width, i = s.top + (e.bounds.y + e.bounds.height / 2) / r.height * s.height, l = Math.atan2(e.startY - i, e.startX - a), u = Math.atan2(e.startY + n / Qt() - i, e.startX + t / Qt() - a);
    o.style.transformOrigin = `${(e.bounds.x + e.bounds.width / 2) / r.width * 100}% ${(e.bounds.y + e.bounds.height / 2) / r.height * 100}%`, o.style.transform = `rotate(${(u - l) * 180 / Math.PI}deg)`;
  }
}
function Qt() {
  const e = N.canvas.getBoundingClientRect();
  return j.document && e.width !== 0 ? j.document.canvas.width / e.width : 1;
}
function xp(e) {
  const t = j.drag;
  if (t?.mode !== "resize") return !1;
  if (e.key === "Escape")
    return e.preventDefault(), Je(), !0;
  if (e.key !== "Shift" && e.key !== "Alt") return !1;
  const n = e.key === "Shift" ? e.type === "keydown" : e.shiftKey, o = e.key === "Alt" ? e.type === "keydown" : e.altKey;
  return (n !== t.shift || o !== t.alt) && (t.shift = n, t.alt = o, t.epoch += 1, t.measurement = void 0, qs(t)), !0;
}
window.addEventListener("pointermove", (e) => {
  const t = j.drag;
  if (!t || !j.document || e.pointerId !== t.pointerId) return;
  let n = (e.clientX - t.startX) * Qt(), o = (e.clientY - t.startY) * Qt();
  N.overlay.querySelectorAll(".smart-guide").forEach((s) => s.remove()), t.mode === "move" && ({ dx: n, dy: o } = c0(n, o, t.bounds, t.ids, Qt())), t.mode === "resize" && (t.shift !== e.shiftKey || t.alt !== e.altKey) && (t.shift = e.shiftKey, t.alt = e.altKey, t.epoch += 1, t.measurement = void 0), t.lastDelta = { x: n, y: o }, mc(t, n, o);
  const r = N.overlay.querySelector(".handle-box");
  if (r) {
    if (t.mode === "move")
      r.style.left = `${(t.bounds.x + n) / j.document.canvas.width * 100}%`, r.style.top = `${(t.bounds.y + o) / j.document.canvas.height * 100}%`;
    else if (t.mode === "rotate") {
      const s = N.canvas.getBoundingClientRect(), a = s.left + (t.bounds.x + t.bounds.width / 2) / j.document.canvas.width * s.width, i = s.top + (t.bounds.y + t.bounds.height / 2) / j.document.canvas.height * s.height, l = (Math.atan2(e.clientY - i, e.clientX - a) - Math.atan2(t.startY - i, t.startX - a)) * 180 / Math.PI;
      r.style.transform = `rotate(${(t.origins.length === 1 ? t.origins[0].rotation : 0) + l}deg)`;
    }
  }
});
window.addEventListener("pointerup", async (e) => {
  const t = j.drag;
  if (!t || e.pointerId !== t.pointerId) return;
  if (t.mode === "resize") {
    if ((t.shift !== e.shiftKey || t.alt !== e.altKey) && (t.shift = e.shiftKey, t.alt = e.altKey, t.epoch += 1, t.measurement = void 0), t.lastDelta = { x: (e.clientX - t.startX) * Qt(), y: (e.clientY - t.startY) * Qt() }, qs(t), j.drag = null, yn = t, Ya(t), await t.measurement?.pending, !Sr(t) || t.invalid) {
      yn === t && Je();
      return;
    }
    const r = bp(t, t.lastDelta.x, t.lastDelta.y);
    if (!r) {
      Je();
      return;
    }
    if (r.x === t.bounds.x && r.y === t.bounds.y && r.width === t.bounds.width && r.height === t.bounds.height) {
      yn = null, Et(), ft();
      return;
    }
    const s = [];
    for (const { origin: a, next: i } of wp(t, r)) {
      const l = i.x - a.absoluteX, u = i.y - a.absoluteY;
      (l !== 0 || u !== 0) && s.push({ op: "move", id: a.id, dx: l, dy: u }), (i.width !== a.width || i.height !== a.height) && s.push({ op: "resize", id: a.id, width: i.width, height: i.height });
    }
    if (yn = null, !s.length) {
      Et(), ft();
      return;
    }
    _t = t.previewActive ? t.version + 1 : null, nr = null, await xt("resize selection", s, t), delete N.canvas.dataset.resizePreview;
    return;
  }
  j.drag = null, Ya(t);
  const n = Math.round(t.lastDelta?.x ?? (e.clientX - t.startX) * Qt()), o = Math.round(t.lastDelta?.y ?? (e.clientY - t.startY) * Qt());
  if (n === 0 && o === 0) {
    _t === null && Et();
    return;
  }
  if (_t = Le(j.document) + 1, nr = t.mode === "move" ? { x: (t.adoptedDelta?.x ?? 0) + n, y: (t.adoptedDelta?.y ?? 0) + o } : null, t.mode === "move")
    xt("move selection", t.ids.map((r) => ({ op: "move", id: r, dx: n, dy: o })));
  else {
    const r = N.canvas.getBoundingClientRect(), s = r.left + (t.bounds.x + t.bounds.width / 2) / j.document.canvas.width * r.width, a = r.top + (t.bounds.y + t.bounds.height / 2) / j.document.canvas.height * r.height, i = (Math.atan2(e.clientY - a, e.clientX - s) - Math.atan2(t.startY - a, t.startX - s)) * 180 / Math.PI;
    xt("rotate selection", t.origins.map((l) => ({ op: "rotate", id: l.id, degrees: Math.round((l.rotation + i) * 10) / 10 })));
  }
});
window.addEventListener("pointercancel", (e) => {
  j.drag?.pointerId === e.pointerId && Je();
});
window.addEventListener("lostpointercapture", (e) => {
  j.drag?.pointerId === e.pointerId && Je();
}, !0);
window.addEventListener("blur", Je);
function c0(e, t, n, o, r) {
  if (!j.document) return { dx: e, dy: t };
  const s = 6 * r, a = Be($e(j.document));
  let i = n;
  if (o.length === 1) {
    const w = a.find(({ layer: $ }) => $.id === o[0]), A = w ? sr(a, w.parent) : null;
    w && A && (i = ts({
      x: w.layer.transform.x + A.x,
      y: w.layer.transform.y + A.y,
      width: w.layer.transform.width,
      height: w.layer.transform.height,
      rotation: w.layer.transform.rotation ?? 0
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
  ], f = [0, j.document.canvas.width / 2, j.document.canvas.width], h = [0, j.document.canvas.height / 2, j.document.canvas.height], d = [];
  for (const { layer: w, parent: A } of a) {
    if (o.includes(w.id)) continue;
    const $ = sr(a, A);
    if (!$) continue;
    const z = ts({
      x: w.transform.x + $.x,
      y: w.transform.y + $.y,
      width: w.transform.width,
      height: w.transform.height,
      rotation: w.transform.rotation ?? 0
    });
    d.push({
      left: z.x,
      right: z.x + z.width,
      top: z.y,
      bottom: z.y + z.height
    }), f.push(z.x, z.x + z.width / 2, z.x + z.width), h.push(z.y, z.y + z.height / 2, z.y + z.height);
  }
  const m = (w, A) => {
    let $ = null;
    for (const z of w) for (const V of A) {
      const B = V - z;
      Math.abs(B) <= s && (!$ || Math.abs(B) < Math.abs($.delta)) && ($ = { delta: B, target: V });
    }
    return $;
  }, g = m(l, f), v = m(u, h);
  g && (e += g.delta, oo("vertical", g.target)), v && (t += v.delta, oo("horizontal", v.target));
  const x = i.x + e, b = x + i.width, E = d.filter((w) => w.right <= x + s).sort((w, A) => A.right - w.right)[0], S = d.filter((w) => w.left >= b - s).sort((w, A) => w.left - A.left)[0];
  if (E && S) {
    const A = E.right + (S.left - E.right - i.width) / 2 - x;
    Math.abs(A) <= s && (e += A, oo("vertical", E.right), oo("vertical", S.left));
  }
  const k = i.y + t, R = k + i.height, T = d.filter((w) => w.bottom <= k + s).sort((w, A) => A.bottom - w.bottom)[0], C = d.filter((w) => w.top >= R - s).sort((w, A) => w.top - A.top)[0];
  if (T && C) {
    const A = T.bottom + (C.top - T.bottom - i.height) / 2 - k;
    Math.abs(A) <= s && (t += A, oo("horizontal", T.bottom), oo("horizontal", C.top));
  }
  return { dx: e, dy: t };
}
function oo(e, t) {
  if (!j.document) return;
  const n = document.createElement("div");
  n.className = `smart-guide ${e}`, e === "vertical" ? n.style.left = `${t / j.document.canvas.width * 100}%` : n.style.top = `${t / j.document.canvas.height * 100}%`, N.overlay.append(n);
}
function Cr() {
  if (!j.document) return [];
  const e = Be($e(j.document));
  return e.flatMap(({ layer: t, parent: n }) => {
    if (!j.selection.includes(t.id)) return [];
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
function l0(e = Cr()) {
  if (e.length === 0) return null;
  if (e.length === 1) {
    const t = e[0];
    return { x: t.x, y: t.y, width: t.width, height: t.height };
  }
  return tc(e.map((t) => ({
    x: t.x,
    y: t.y,
    width: t.width,
    height: t.height,
    rotation: t.layer.transform.rotation ?? 0
  })));
}
function Sp(e = Cr()) {
  return e.length === 0 ? null : tc(e.map((t) => ({
    x: t.x,
    y: t.y,
    width: t.width,
    height: t.height,
    rotation: t.layer.transform.rotation ?? 0
  })));
}
function Io() {
  if (!j.document) return;
  const e = fp(), t = j.zoom ?? e;
  N.canvas.style.width = `${Math.max(1, Math.round(j.document.canvas.width * t))}px`, N.canvas.style.height = `${Math.max(1, Math.round(j.document.canvas.height * t))}px`, N.zoomValue.textContent = j.zoom === null ? y("canvas.zoomFit") : `${je(Math.round(t * 100))}%`, N.zoomValue.title = j.zoom === null ? y("canvas.zoomFitPercent", { percent: je(Math.round(e * 100)) }) : y("canvas.zoomResetFit");
}
function u0() {
  const e = N.stageViewport.getBoundingClientRect();
  return {
    x: e.left + N.stageViewport.clientLeft + N.stageViewport.clientWidth / 2,
    y: e.top + N.stageViewport.clientTop + N.stageViewport.clientHeight / 2
  };
}
function jr(e, t = u0()) {
  const n = N.canvas.getBoundingClientRect(), o = n.width > 0 ? (t.x - n.left) / n.width : 0.5, r = n.height > 0 ? (t.y - n.top) / n.height : 0.5;
  if (j.zoom = e === null ? null : Math.min(4, Math.max(0.1, e)), Io(), fc(), j.zoom === null) {
    N.stageViewport.scrollLeft = 0, N.stageViewport.scrollTop = 0;
    return;
  }
  if (n.width <= 0 || n.height <= 0) return;
  const s = N.canvas.getBoundingClientRect();
  N.stageViewport.scrollLeft += s.left + o * s.width - t.x, N.stageViewport.scrollTop += s.top + r * s.height - t.y;
}
function xo(e) {
  if (!j.document || !rt(e)) return;
  N.overlay.querySelector(".inline-text-editor")?.remove();
  const t = Be($e(j.document)), n = t.find(({ layer: i }) => i.id === e.id), o = sr(t, n?.parent ?? null);
  if (!o) return;
  const r = document.createElement("textarea");
  r.className = "inline-text-editor", r.value = e.text, r.setAttribute("aria-label", y("canvas.editText")), r.dataset.i18nAttr = "aria-label:canvas.editText", r.style.left = `${(e.transform.x + o.x) / j.document.canvas.width * 100}%`, r.style.top = `${(e.transform.y + o.y) / j.document.canvas.height * 100}%`, r.style.width = `${e.transform.width / j.document.canvas.width * 100}%`, r.style.height = `${e.transform.height / j.document.canvas.height * 100}%`, r.style.transformOrigin = "center", r.style.transform = `rotate(${e.transform.rotation ?? 0}deg)`, r.style.fontFamily = e.fontFamily, r.style.fontSize = `${Math.max(12, e.fontSize * (N.canvas.getBoundingClientRect().width / j.document.canvas.width))}px`, r.style.lineHeight = String(e.lineHeight ?? 1.2), r.style.textAlign = e.align ?? "left", r.style.color = Mx(e.color) ?? "#000000", N.overlay.append(r), j.editingText = { id: e.id, original: e.text }, r.focus(), r.select();
  let s = !1;
  const a = (i) => {
    if (s) return;
    s = !0;
    const l = r.value;
    r.remove(), j.editingText = null, i && l !== e.text ? se("edit text", { op: "update", id: e.id, text: l }) : ft();
  };
  r.addEventListener("keydown", (i) => {
    i.key === "Escape" ? (i.preventDefault(), a(!1)) : i.key === "Enter" && (i.ctrlKey || i.metaKey) && (i.preventDefault(), a(!0));
  }), r.addEventListener("blur", () => a(!0));
}
function gc(e) {
  ni(() => d0(e));
}
function d0(e) {
  for (const r of ya) r();
  ya = [];
  const t = Cr(), n = l0(t);
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
      disabled: e.some((l) => !rt(l)) || a === "rotation" && e.length > 1,
      onCommit: async (l) => {
        const u = Number(l);
        if (Number.isFinite(u))
          if (a === "x" || a === "y") {
            const f = a === "x" ? u - n.x : 0, h = a === "y" ? u - n.y : 0;
            xt("position selection", e.map((d) => ({ op: "move", id: d.id, dx: f, dy: h })));
          } else if (a === "rotation" && e[0])
            se("rotate layer", { op: "rotate", id: e[0].id, degrees: u });
          else {
            if (a === "width" && e.length === 1 && e[0]?.type === "text" && j.project)
              try {
                const d = await Kf(j.project, e[0].id, u);
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
              } : Jf(d, n, f), g = m.x - d.x, v = m.y - d.y;
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
    ya.push(i);
  }
}
let ya = [];
function Vn(e) {
  const t = e ?? !ri();
  if (Zp(t), !t) return;
  gc(zt());
  const o = N.inspector.querySelector(".position-button")?.getBoundingClientRect(), r = N.inspector.getBoundingClientRect().left + 8, s = N.structure.getBoundingClientRect().left, a = (o?.right ?? r + 320) - 320;
  N.positionPopover.style.left = `${Math.max(r, Math.min(s - 332, a))}px`, N.positionPopover.style.top = `${Math.min(window.innerHeight - 520, (o?.bottom ?? 100) + 8)}px`, N.positionPopover.querySelector("[data-canvas-anchor]")?.focus();
}
const Cp = "assemblash-layer-clipboard-v1";
function is() {
  if (!j.project || !j.document || j.selection.length === 0) return !1;
  const e = Be($e(j.document)), t = new Set(j.selection), n = e.filter(({ layer: o, parent: r }) => t.has(o.id) && (!r || !t.has(r))).map(({ layer: o }) => structuredClone(o));
  return sessionStorage.setItem(Cp, JSON.stringify({ project: j.project, layers: n })), xe(Ot("editor.copiedLayers", n.length)), n.length > 0;
}
function jp() {
  if (!j.project) return null;
  try {
    const e = JSON.parse(sessionStorage.getItem(Cp) ?? "null");
    return e?.project === j.project && Array.isArray(e.layers) ? e.layers : null;
  } catch {
    return null;
  }
}
function kp() {
  const e = jp();
  if (!e || !j.project) {
    xe(y("editor.nothingToPaste"), "error");
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
function ir(e = "delete selection") {
  const t = zt();
  t.length === 0 || t.some((n) => !rt(n)) || xt(e, t.map((n) => ({ op: "delete", id: n.id })));
}
function Dr(e) {
  if (!j.document || j.selection.length !== 1) return;
  const t = j.selection[0], n = Be($e(j.document)), o = n.find(({ layer: u }) => u.id === t);
  if (!o || !rt(o.layer)) return;
  const r = o.parent ? n.find(({ layer: u }) => u.id === o.parent)?.layer : null, s = r?.type === "group" ? r.children ?? [] : $e(j.document), a = s.findIndex((u) => u.id === t);
  let i = a;
  if (e === "front" && (i = s.length - 1), e === "forward" && (i = Math.min(s.length - 1, a + 1)), e === "backward" && (i = Math.max(0, a - 1)), e === "back" && (i = 0), i === a) return;
  const l = o.parent ? { at: "in", parent: o.parent, index: i } : { at: "root", index: i };
  se(`send ${e}`, { op: "reorder", id: t, to: l });
}
function cr(e, t) {
  const n = zt(), o = n.length > 0 && n.every(rt), r = n.length === 1 ? n[0] : null, s = [], a = (l, u, f, h = !1) => {
    s.push({ kind: "item", key: l, icon: u, disabled: h, run: f });
  }, i = () => {
    s.push({ kind: "separator" });
  };
  r?.type === "text" && (a("context.editText", "ph-pencil-simple", () => xo(r), !o), i()), a("context.cut", "ph-scissors", () => {
    is() && ir("cut layers");
  }, !o), a("context.copy", "ph-copy", () => {
    is();
  }, n.length === 0), a("context.paste", "ph-clipboard-text", kp, !jp()), a("context.duplicate", "ph-copy-simple", () => {
    xt("duplicate", n.map((l) => ({ op: "duplicate", id: l.id })));
  }, !o), a("context.delete", "ph-trash", ir, !o), i(), a("context.bringFront", "ph-arrow-line-up", () => Dr("front"), !r || !o), a("context.bringForward", "ph-arrow-up", () => Dr("forward"), !r || !o), a("context.sendBackward", "ph-arrow-down", () => Dr("backward"), !r || !o), a("context.sendBack", "ph-arrow-line-down", () => Dr("back"), !r || !o), i(), a("context.group", "ph-stack", () => {
    se("group", { op: "group", ids: n.map((l) => l.id) });
  }, n.length < 2 || !o), a("context.ungroup", "ph-stack-minus", () => {
    r && se("ungroup", { op: "ungroup", id: r.id });
  }, r?.type !== "group" || !o), a(r?.locked ? "context.unlock" : "context.lock", r?.locked ? "ph-lock-open" : "ph-lock", () => {
    r && se(r.locked ? "unlock layer" : "lock layer", { op: "setLocked", id: r.id, locked: !r.locked });
  }, !r || wo(r, !0) !== null), a(r?.visible === !1 ? "context.show" : "context.hide", r?.visible === !1 ? "ph-eye" : "ph-eye-slash", () => {
    r && se(r.visible === !1 ? "show layer" : "hide layer", { op: "setVisible", id: r.id, visible: r.visible === !1 });
  }, !r || !o), a("context.rename", "ph-pencil-simple", () => {
    if (!r) return;
    Oo("layers");
    const l = N.layers.querySelector(`[data-id="${CSS.escape(r.id)}"]`);
    l && (l.focus(), l.dispatchEvent(new KeyboardEvent("keydown", { key: "F2", bubbles: !0 })));
  }, !r || !o), i(), a("context.alignLeft", "ph-align-left-simple", () => ro("left"), !o), a("context.alignHorizontalCenters", "ph-align-center-horizontal", () => ro("centerHorizontal"), !o), a("context.alignRight", "ph-align-right-simple", () => ro("right"), !o), a("context.alignTop", "ph-align-top-simple", () => ro("top"), !o), a("context.alignVerticalMiddles", "ph-align-center-vertical", () => ro("centerVertical"), !o), a("context.alignBottom", "ph-align-bottom-simple", () => ro("bottom"), !o), a("context.distributeHorizontally", "ph-columns", () => {
    se("distribute horizontally", { op: "distribute", ids: n.map((l) => l.id), axis: "horizontal" });
  }, !o || n.length < 3), a("context.distributeVertically", "ph-rows", () => {
    se("distribute vertically", { op: "distribute", ids: n.map((l) => l.id), axis: "vertical" });
  }, !o || n.length < 3), Sn.open(s, e, t);
}
function ro(e) {
  if (!j.document) return;
  const t = zt(), n = t.map((a) => a.id);
  if (t.length !== 1) {
    se("align selection", { op: "align", ids: n, edge: e });
    return;
  }
  const o = Sp(Cr());
  if (!o) return;
  let r = 0, s = 0;
  e === "left" && (r = -o.x), e === "centerHorizontal" && (r = j.document.canvas.width / 2 - (o.x + o.width / 2)), e === "right" && (r = j.document.canvas.width - (o.x + o.width)), e === "top" && (s = -o.y), e === "centerVertical" && (s = j.document.canvas.height / 2 - (o.y + o.height / 2)), e === "bottom" && (s = j.document.canvas.height - (o.y + o.height)), (r !== 0 || s !== 0) && se("align layer to canvas", { op: "move", id: t[0].id, dx: r, dy: s });
}
function Ep(e) {
  Je(), Me("open", () => xc(e));
}
const vc = /* @__PURE__ */ new Map();
function yc(e) {
  return e.record.state.document?.name ?? vc.get(e.id) ?? e.id;
}
const f0 = Jw({
  activate: (e) => {
    me.active?.id !== e && (Je(), Me("switch tab", () => xc(e)));
  },
  close: (e) => {
    Je(), Me("close tab", () => h0(e));
  },
  move: (e, t) => {
    me.move(e, t) && (At(), on());
  }
}, J("project-tabs-root"));
function At() {
  f0.setTabs(me.all.map((e) => ({
    id: e.id,
    name: yc(e),
    active: e === me.active,
    changed: e.changed,
    group: e.group,
    thumbnail: e.group ? e.record.thumbnail : null
  })));
}
function bc(e) {
  e.record.thumbnail && URL.revokeObjectURL(e.record.thumbnail), e.record.thumbnail = null;
}
function wc(e) {
  e.group && Me("tab thumbnail", async () => {
    if (!(!e.group || !me.all.includes(e)))
      try {
        const t = await Bn(Hf(e.id));
        if (!e.group || !me.all.includes(e)) {
          URL.revokeObjectURL(t);
          return;
        }
        bc(e), e.record.thumbnail = t, At();
      } catch (t) {
        console.error(`could not read the thumbnail of ${e.id}`, t);
      }
  });
}
async function p0(e) {
  const n = (await Mb(e)).pages.map((s) => s.project), o = Uw(n, me.all.map((s) => s.id));
  if (o.kind === "empty") {
    xe(y("pageSets.empty", { set: e }), "error");
    return;
  }
  if (o.kind === "tooMany") {
    xe(y("pageSets.tooMany", { set: e, count: o.count, max: o.max }), "error");
    return;
  }
  const r = [];
  try {
    for (const s of o.toOpen) r.push([s, await Ao(s)]);
  } catch (s) {
    for (const [a] of r) await Uf(a).catch(() => !1);
    throw s;
  }
  Ks();
  for (const [s, a] of r) {
    const { entry: i } = me.open(s, () => sc(s));
    i.record.state.document = a;
  }
  me.arrange(o.order), me.setGroup(e, o.pages), At(), on(), await So(me.find(o.pages[0]));
  for (const s of o.pages) {
    const a = me.find(s);
    a && wc(a);
  }
  xe(y("pageSets.opened", { set: e, count: o.pages.length }));
}
function on() {
  Eb(me.serialize()).catch((e) => {
    console.error("could not save the open tabs", e);
  });
}
function Ks() {
  const e = me.active;
  if (!e) return;
  const t = e.record;
  Je(), t.scroll = { left: N.stageViewport.scrollLeft, top: N.stageViewport.scrollTop }, t.layerQuery = or, t.historySnapshot = wr, t.activeDock = xr, t.addSection = N.addPanel.classList.contains("collapsed") ? null : Cc, t.templateDraft = Lt.draft(), j.drag = null, Sn.close(), Vn(!1), Et(), Rp(), qa++, Ka++, Xa++, pn.clear(), e.group && wc(e);
}
function Rp() {
  const e = N.canvasImage.src;
  N.canvasImage.removeAttribute("src"), delete N.canvasImage.dataset.previewName, e.startsWith("blob:") && URL.revokeObjectURL(e), uc = null;
}
function po(e) {
  me.activate(e?.id ?? null);
  const t = e?.record;
  if (j = t?.state ?? rc(null), or = t?.layerQuery ?? "", wr = t?.historySnapshot ?? null, xr = t?.activeDock ?? "layers", Hs.setCurrentProject(e?.id ?? null), t && t.addSection !== void 0) {
    if (t.addSection === null) Do();
    else if (t.addSection !== Cc || N.addPanel.classList.contains("collapsed")) {
      const n = Ja.find(([o]) => o === t.addSection);
      n && Mo(n[0], n[2]);
    }
  }
  At();
}
async function xc(e) {
  const t = me.active;
  if (t && t.id === e) {
    j.selection = [], Et(), await Ga();
    return;
  }
  if (Ks(), e === null) {
    po(null), qo(), on();
    return;
  }
  const n = me.find(e);
  if (n) {
    await So(n), on();
    return;
  }
  const { entry: o } = me.open(e, () => sc(e));
  try {
    po(o), await Ga();
  } catch (r) {
    throw me.close(o.id), po(null), t && me.has(t.id) ? await So(t).catch(() => qo()) : qo(), r;
  }
  At(), on();
}
async function So(e) {
  po(e);
  const t = e.record;
  if (!j.document) {
    await Ga(t.templateDraft);
    return;
  }
  try {
    await Ge();
  } catch (n) {
    throw Wn(j.document), n;
  }
  Io(), N.stageViewport.scrollLeft = t.scroll.left, N.stageViewport.scrollTop = t.scroll.top, await Lt.projectChanged(t.templateDraft), Sc(), At(), xe(y("projects.opened", { name: yc(e) }));
}
async function h0(e) {
  const t = me.find(e);
  if (!t) return;
  const n = yc(t), o = me.active === t;
  o && Ks();
  const { next: r } = me.close(e);
  bc(t), At(), on(), o && await Hr?.catch(() => {
  }), await Uf(e), o && (r ? await So(r) : (po(null), qo())), xe(y("tabs.closed", { name: n }));
}
async function m0(e) {
  const t = me.find(e);
  if (!t) return;
  const n = me.active === t;
  n && Ks();
  const { next: o } = me.close(e);
  bc(t), n && (o ? await So(o) : (po(null), qo())), At(), on();
}
async function g0(e) {
  let t;
  try {
    t = Vw(await kb());
  } catch (o) {
    console.error("could not read the open tabs", o);
    return;
  }
  for (const o of t.projects)
    if (!(!e.has(o) || me.has(o)))
      try {
        const r = await Ao(o), { entry: s } = me.open(o, () => sc(o));
        s.record.state.document = r;
      } catch (r) {
        console.error(`could not restore the tab of ${o}`, r);
      }
  if (me.size === 0) return;
  const n = me.find(t.active) ?? me.all[0];
  try {
    await So(n);
  } catch (o) {
    sn("open", o);
  }
  At(), on();
}
function Sc() {
  N.renameProject.disabled = !j.project, N.deleteProject.disabled = !j.project, N.reload.disabled = !j.project;
}
async function Ga(e = null) {
  try {
    await Ge();
  } catch (t) {
    const n = t instanceof Ue ? t.details : null, o = n && typeof n.pid == "number" ? n.pid : null;
    if (!(t instanceof Ue) || t.code !== "projectLocked" || o === null || !j.project)
      throw t;
    const r = vc.get(j.project) ?? j.project;
    if (!window.confirm(y("projects.recoverLockConfirm", { pid: o, tab: r }))) throw t;
    await jb(j.project, o), await Ge(), xe(y("projects.recovered"));
  }
  if (await Lt.projectChanged(e), Sc(), At(), xe(y("projects.opened", { name: j.document?.name ?? j.project ?? "" })), j.project)
    try {
      const t = await wb(j.project);
      if (t.reclaimedLock) {
        const { pid: n, host: o } = t.reclaimedLock;
        xe(
          y("projects.reclaimedLock", { pid: n, host: o })
        );
      }
    } catch (t) {
      console.error("could not check for an automatically reclaimed lock", t);
    }
}
N.reload.addEventListener("click", () => {
  Me("reload", async () => {
    await Ge(), xe(y("projects.refreshed"));
  });
});
N.newProject.addEventListener("click", () => Vx.open());
N.emptyCreate.addEventListener("click", () => N.newProject.click());
N.agents.addEventListener("click", () => {
  cp.open();
});
const Ja = [
  ["add-text-section", "toolbar.textButton", N.addText],
  ["add-shape-section", "toolbar.elementsButton", N.addShape],
  ["add-upload-section", "toolbar.uploadsButton", N.addImage],
  ["add-template-section", "toolbar.templatesButton", N.templatesToggle],
  ["add-fonts-section", "toolbar.fontsButton", N.selectTool]
];
function Np(e) {
  for (const t of [N.selectTool, N.addText, N.addShape, N.addImage, N.templatesToggle]) {
    const n = t === e;
    t.classList.toggle("active", n), t.setAttribute("aria-pressed", String(n));
  }
}
let Cc = null;
function Mo(e = "add-text-section", t = N.addText) {
  Cc = e, e !== "add-fonts-section" && bo.releaseSamples(), N.addPanel.classList.remove("collapsed"), N.structure.classList.remove("mobile-open"), N.dockToggle.setAttribute("aria-expanded", "false"), Lt.setOpen(!1);
  const n = Ja.find(([r]) => r === e)?.[1] ?? "toolbar.textButton";
  N.addPanelTitle.dataset.i18n = n, N.addPanelTitle.textContent = y(n);
  for (const [r] of Ja) {
    const s = document.getElementById(r);
    s && (s.hidden = r !== e);
  }
  const o = e === "add-template-section";
  Lt.setOpen(o && Lt.isVisible()), N.openTemplates.hidden = o && Lt.isVisible(), N.addPanel.scrollTop = 0, Np(t);
}
function Do() {
  bo.releaseSamples(), N.addPanel.classList.add("collapsed"), Np(N.selectTool);
}
N.addPanelClose.addEventListener("click", Do);
N.addText.addEventListener("click", () => Mo("add-text-section", N.addText));
N.addShape.addEventListener("click", () => Mo("add-shape-section", N.addShape));
N.addImage.addEventListener("click", () => Mo("add-upload-section", N.addImage));
N.templatesToggle.addEventListener("click", () => Mo("add-template-section", N.templatesToggle));
async function jc(e = !1) {
  Mo("add-fonts-section", N.selectTool), await bo.reload(), e && bo.focusInstall();
}
async function v0(e) {
  const n = (await Yb())[0];
  if (!n) {
    xe(y("fonts.noneInstalled"), "error"), await jc(!0);
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
  }, a = (await Un(
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
  xe(y("editor.addedText", { preset: y(i) })), await Ge();
  const l = lc();
  l?.type === "text" && xo(l);
}
async function y0(e) {
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
  }, o = e === "line" ? { stroke: { color: ap, width: ip } } : { fill: ac }, r = e === "rect" ? { kind: "rect", cornerRadius: 0 } : { kind: e }, a = (await Un(
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
  xe(y("editor.addedShape", { kind: y(i) })), await Ge();
}
async function b0(e) {
  if (!j.project || !j.document) return;
  const t = 320, n = 240, o = {
    x: Math.round((j.document.canvas.width - t) / 2),
    y: Math.round((j.document.canvas.height - n) / 2),
    width: t,
    height: n
  }, s = (await Un(
    j.project,
    {
      op: "create",
      position: { at: "root" },
      transform: o,
      type: "shape",
      shape: { kind: "path", d: e },
      fill: ac
    },
    Le(j.document)
  )).created?.[0];
  s && (j.selection = [s]), xe(y("editor.addedPath")), await Ge();
}
N.addPanel.addEventListener("click", (e) => {
  const t = e.target, o = t.closest("[data-text-preset]")?.dataset.textPreset;
  o && Me(`add ${o}`, () => v0(o));
  const r = t.closest("[data-shape]")?.dataset.shape;
  (r === "rect" || r === "ellipse" || r === "line") && Me(`add ${r}`, () => y0(r)), r === "path" && Us("editor.addPathTitle", "editor.pathDataLabel", "editor.addPathButton", (s) => {
    Me("add path", () => b0(s));
  });
});
N.undo.addEventListener("click", () => {
  Me("undo", async () => {
    if (!j.project) return;
    const e = await Tb(j.project);
    xe(y("status.undoDone", { version: e.version })), await Ge();
  });
});
N.redo.addEventListener("click", () => {
  Me("redo", async () => {
    if (!j.project) return;
    const e = await Pb(j.project);
    xe(y("status.redoDone", { version: e.version })), await Ge();
  });
});
N.exportButton.addEventListener("click", () => Bx.open());
th((e) => Za(
  e,
  e.type === "image/svg+xml" || e.name.toLowerCase().endsWith(".svg") ? "svg" : "image"
));
function Za(e, t, n) {
  e && Me(t === "svg" ? "add vector" : "add image", async () => {
    if (!(!j.project || !j.document)) {
      N.uploadFeedback.textContent = y("uploads.uploading", { name: e.name });
      try {
        const o = await ec(j.project, e), r = o.asset.mediaType === "image/svg+xml" || t === "svg", { width: s, height: a } = hw(
          o.asset,
          j.document.canvas
        ), i = Math.round(n?.x ?? (j.document.canvas.width - s) / 2), l = Math.round(n?.y ?? (j.document.canvas.height - a) / 2), u = r ? {
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
        }, f = await Un(
          j.project,
          u,
          o.version
        );
        f.created?.length && (j.selection = f.created), xe(y("uploads.addedVersion", { name: e.name, version: f.version })), N.uploadFeedback.textContent = y("uploads.added", { name: e.name }), await Ge();
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
  if (!t || !j.document) return;
  const n = N.canvas.getBoundingClientRect();
  if (e.clientX < n.left || e.clientX > n.right || e.clientY < n.top || e.clientY > n.bottom) {
    Za(t, t.type === "image/svg+xml" ? "svg" : "image");
    return;
  }
  const o = {
    x: (e.clientX - n.left) / n.width * j.document.canvas.width - 150,
    y: (e.clientY - n.top) / n.height * j.document.canvas.height - 100
  };
  Za(t, t.type === "image/svg+xml" ? "svg" : "image", o);
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
  j.document && (Do(), Lt.setOpen(!1), N.structure.classList.remove("mobile-open"), N.dockToggle.setAttribute("aria-expanded", "false"), N.canvas.focus());
});
N.positionClose.addEventListener("click", () => Vn(!1));
N.positionPopover.addEventListener("click", (e) => {
  const t = e.target.closest(
    "[data-canvas-anchor], [data-layout]"
  ), n = t?.dataset.canvasAnchor;
  if (n && !t.disabled && j.selection.length > 0 && j.document) {
    const a = Cr(), i = Sp(a);
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
    for (const m of zt())
      f.push({ op: "move", id: m.id, dx: h - i.x, dy: d - i.y });
    Vn(!1), s0(`place layer ${t.title.toLowerCase()}`, f);
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
  s && (Vn(!1), se("arrange layers", s));
});
document.addEventListener("pointerdown", (e) => {
  const t = e.target;
  ri() && !N.positionPopover.contains(t) && !N.inspector.contains(t) && Vn(!1), Sn.isOpen() && !N.contextMenu.contains(t) && Sn.close();
});
N.openTemplates.addEventListener("click", () => {
  if (!Lt.isVisible()) {
    xe(y("editor.noSlotsHint")), Do(), Oo("properties"), window.matchMedia("(max-width: 1024px)").matches && (N.structure.classList.add("mobile-open"), N.dockToggle.setAttribute("aria-expanded", "true"));
    return;
  }
  Lt.setOpen(!0), N.openTemplates.hidden = !0, N.templatesPanel.scrollIntoView({ block: "nearest" });
});
N.templatesClose.addEventListener("click", () => {
  Lt.setOpen(!1), N.openTemplates.hidden = !1;
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
function Tp() {
  window.matchMedia("(max-width: 1024px)").matches ? (N.structure.classList.remove("mobile-open"), N.dockToggle.setAttribute("aria-expanded", "false"), bo.releaseSamples(), N.addPanel.classList.add("collapsed")) : (N.structure.classList.remove("mobile-open"), N.dockToggle.setAttribute("aria-expanded", "true"));
}
window.addEventListener("resize", () => {
  j.zoom === null && Io(), fc(), Tp();
});
const w0 = new ResizeObserver(() => {
  j.zoom === null && Io(), fc();
});
w0.observe(N.stageViewport);
Tp();
let kr = !1, Ho = null;
window.addEventListener("keyup", (e) => {
  xp(e) || e.code === "Space" && (kr = !1, N.stageViewport.classList.remove("pan-ready"));
});
window.addEventListener("blur", () => {
  kr = !1, N.stageViewport.classList.remove("pan-ready"), Ho?.();
});
N.stageViewport.addEventListener("pointerdown", (e) => {
  if (e.button !== 1 && !(kr && e.button === 0)) return;
  e.preventDefault(), e.stopPropagation(), Ho?.();
  const t = { x: e.clientX, y: e.clientY }, n = { x: N.stageViewport.scrollLeft, y: N.stageViewport.scrollTop };
  N.stageViewport.classList.add("panning");
  const o = (a) => {
    a.pointerId === e.pointerId && (N.stageViewport.scrollLeft = n.x - (a.clientX - t.x), N.stageViewport.scrollTop = n.y - (a.clientY - t.y));
  }, r = () => {
    window.removeEventListener("pointermove", o), window.removeEventListener("pointerup", s), window.removeEventListener("pointercancel", s), window.removeEventListener("blur", r), N.stageViewport.classList.remove("panning"), Ho === r && (Ho = null);
  }, s = (a) => {
    a.pointerId === e.pointerId && r();
  };
  Ho = r, window.addEventListener("pointermove", o), window.addEventListener("pointerup", s), window.addEventListener("pointercancel", s), window.addEventListener("blur", r, { once: !0 });
}, { capture: !0 });
N.overlay.addEventListener("pointerdown", (e) => {
  if (kr || e.target !== N.overlay || e.button !== 0 || !j.document) return;
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
    j.selection = e.shiftKey ? [.../* @__PURE__ */ new Set([...j.selection, ...d])] : d, Nt(), lt(), ft();
  };
  window.addEventListener("pointermove", a), window.addEventListener("pointerup", i);
});
function x0(e) {
  const t = e;
  return t ? t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable : !1;
}
window.addEventListener("keydown", (e) => {
  if (xp(e)) return;
  if (e.key === "Escape" && yn) {
    e.preventDefault(), Je();
    return;
  }
  if (x0(e.target) || e.target instanceof Element && e.target.closest("button[data-text-align]") && (e.key === "Enter" || e.code === "Space")) return;
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
    e.preventDefault(), zt().every(rt) && is() && ir("cut layers");
    return;
  }
  if (t && n === "v") {
    e.preventDefault(), kp();
    return;
  }
  if (t && n === "d") {
    e.preventDefault();
    const l = zt();
    l.length && l.every(rt) && xt("duplicate", l.map((u) => ({ op: "duplicate", id: u.id })));
    return;
  }
  if (t && n === "g") {
    e.preventDefault();
    const l = zt();
    if (e.shiftKey) {
      const u = l.length === 1 && l[0]?.type === "group" ? l[0] : null;
      u && se("ungroup", { op: "ungroup", id: u.id });
    } else l.length > 1 && l.every(rt) && se("group", { op: "group", ids: l.map((u) => u.id) });
    return;
  }
  if (e.key === "F10" && e.shiftKey) {
    e.preventDefault();
    const l = N.canvas.getBoundingClientRect();
    cr(l.left + l.width / 2, l.top + l.height / 2);
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
    j.selection = [], Sn.close(), Vn(!1), Nt(), ft(), lt();
    return;
  }
  const o = lc(), r = zt();
  if ((e.key === "Enter" || e.key === "F2") && o?.type === "text" && rt(o)) {
    e.preventDefault(), xo(o);
    return;
  }
  if (r.length === 0 || r.some((l) => !rt(l))) return;
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
  i && (e.preventDefault(), xt("nudge selection", r.map((l) => ({
    op: "move",
    id: l.id,
    dx: i[0],
    dy: i[1]
  }))));
});
function qo() {
  Je(), si(null), N.canvas.hidden = !0, N.canvasControlsRoot.hidden = !0, N.canvasHints.hidden = !0, Rp(), N.canvasEmpty.hidden = !1, Sc(), N.undo.disabled = !0, N.redo.disabled = !0, N.version.textContent = "–", Nt(), ft(), lt();
}
function Pp(e, t) {
  Us("projects.renameTitle", "common.name", "projects.rename", (n) => {
    Me("rename project", async () => {
      const o = await Sb(e, n);
      xe(y("projects.renamed", { oldName: t ?? e, newName: n }));
      const r = me.find(e);
      r && me.rename(e, o.project) && (r.record.state.project = o.project, on()), await Er(), r && me.active === r && (Hs.setCurrentProject(o.project), await Ge()), At();
    });
  });
}
function Ap(e, t) {
  const n = t ?? e, o = y("projects.deleteConfirm", { name: n });
  window.confirm(o) && Me("delete project", async () => {
    await Cb(e), await m0(e), xe(y("projects.deleted", { name: n })), await Er();
  });
}
N.renameProject.addEventListener("click", () => {
  const e = j.project;
  e && (Bt.isOpen() && Bt.close(), Pp(e, j.document?.name ?? null));
});
N.deleteProject.addEventListener("click", () => {
  const e = j.project;
  e && (Bt.isOpen() && Bt.close(), Ap(e, j.document?.name ?? null));
});
async function Er(e) {
  e && (N.search.value = "");
  const t = N.search.value.trim(), n = await Vf(t);
  Ip(n, t);
  try {
    Hs.setPageSets(await Ib());
  } catch (o) {
    console.error("could not read the page sets", o);
  }
  return e && await xc(e), await Dp(), n;
}
function Ip(e, t) {
  kc = Mp(e);
  for (const n of e) n.name && vc.set(n.id, n.name);
  Hs.setProjects(e, t, j.project);
}
const S0 = 1500;
let kc = "";
function Mp(e) {
  return e.map((t) => `${t.id}\0${t.name ?? ""}\0${t.layers}`).join(`
`);
}
let eu = !0;
async function Qa() {
  if (eu)
    try {
      const { count: e } = await Lb();
      Ec(e);
    } catch (e) {
      e instanceof Ue && e.code.startsWith("http4") && (eu = !1, Ec(null));
    }
}
let en = null;
function C0(e) {
  return e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement || e instanceof HTMLElement && e.isContentEditable;
}
document.addEventListener("input", (e) => {
  e.target !== N.search && C0(e.target) && (en = e.target);
}, !0);
document.addEventListener("change", (e) => {
  e.target === en && (en = null);
}, !0);
document.addEventListener("focusout", (e) => {
  e.target === en && (en = null);
}, !0);
function j0() {
  return en instanceof Node && !en.isConnected && (en = null), en !== null;
}
function tu() {
  return document.visibilityState === "visible" && !rp && !j.drag && !j.editingText && !j0() && !document.body.classList.contains("stopped");
}
let ba = !1;
async function k0() {
  if (!(ba || !tu())) {
    if (!Ua()) {
      Qa();
      return;
    }
    ba = !0;
    try {
      const e = N.search.value.trim(), t = await Vf(e);
      if (!tu()) return;
      Qa(), Mp(t) !== kc && document.activeElement !== document.getElementById("project-search") && (Ip(t, e), j.project || Dp().catch(() => {
      })), E0(t);
      const n = j.project, o = t.find((s) => s.id === n), r = j.document;
      if (!n || !o || !r || o.documentId !== r.id || o.version === Le(r)) return;
      Me("follow", async () => {
        j.project !== n || j.drag || j.editingText || await Ge();
      });
    } catch {
    } finally {
      ba = !1;
    }
  }
}
function E0(e) {
  for (const t of me.all) {
    if (t === me.active) continue;
    const n = t.record.state.document, o = e.find((r) => r.id === t.id);
    !n || !o || o.documentId !== n.id || o.version === Le(n) || Me("follow tab", async () => {
      if (me.active === t || !me.all.includes(t)) return;
      const r = await Ao(t.id);
      if (me.active === t || !me.all.includes(t)) return;
      const s = t.record;
      s.state.document = r, s.state.selection = s.state.selection.filter(
        (a) => Be($e(r)).some(({ layer: i }) => i.id === a)
      ), s.historySnapshot = null, me.markChanged(t.id), At(), wc(t);
    });
  }
}
window.setInterval(() => {
  k0();
}, S0);
let wa = [], xa = 0;
async function Dp() {
  const e = ++xa;
  for (const o of wa) URL.revokeObjectURL(o);
  wa = [];
  const t = await bb(8);
  if (e !== xa) return;
  const n = await Promise.all(t.map(async (o) => {
    try {
      return { project: o, thumbnail: await Bn(Hf(o.id)) };
    } catch {
      return { project: o, thumbnail: null };
    }
  }));
  if (e !== xa) {
    for (const { thumbnail: o } of n) o && URL.revokeObjectURL(o);
    return;
  }
  wa = n.flatMap(({ thumbnail: o }) => o ? [o] : []), eh(
    N.recents,
    n,
    (o) => Ep(o),
    (o, r) => Pp(o, r),
    (o, r) => Ap(o, r)
  );
}
N.shutdown.addEventListener("click", () => {
  window.confirm(y("projects.stopConfirm")) && Me("stop", async () => {
    await Db(), N.shutdown.disabled = !0, document.body.classList.add("stopped"), xe(y("app.stopped"));
  });
});
Me("start", async () => {
  const e = await Ob();
  N.shutdown.hidden = !e.canShutdown;
  try {
    await bo.reload();
  } catch {
  }
  const t = await Er();
  await g0(new Set(t.map((n) => n.id))), Qa(), up(), xe(y("status.ready", { version: e.version })), !kc && !N.search.value.trim() && cp.offerOnFirstRun();
});
