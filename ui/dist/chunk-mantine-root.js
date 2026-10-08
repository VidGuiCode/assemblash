function g1(i, o) {
  for (var s = 0; s < o.length; s++) {
    const f = o[s];
    if (typeof f != "string" && !Array.isArray(f)) {
      for (const m in f)
        if (m !== "default" && !(m in i)) {
          const y = Object.getOwnPropertyDescriptor(f, m);
          y && Object.defineProperty(i, m, y.get ? y : {
            enumerable: !0,
            get: () => f[m]
          });
        }
    }
  }
  return Object.freeze(Object.defineProperty(i, Symbol.toStringTag, { value: "Module" }));
}
function jy(i) {
  return i && i.__esModule && Object.prototype.hasOwnProperty.call(i, "default") ? i.default : i;
}
var ur = { exports: {} }, Nu = {};
var dy;
function h1() {
  if (dy) return Nu;
  dy = 1;
  var i = /* @__PURE__ */ Symbol.for("react.transitional.element"), o = /* @__PURE__ */ Symbol.for("react.fragment");
  function s(f, m, y) {
    var z = null;
    if (y !== void 0 && (z = "" + y), m.key !== void 0 && (z = "" + m.key), "key" in m) {
      y = {};
      for (var O in m)
        O !== "key" && (y[O] = m[O]);
    } else y = m;
    return m = y.ref, {
      $$typeof: i,
      type: f,
      key: z,
      ref: m !== void 0 ? m : null,
      props: y
    };
  }
  return Nu.Fragment = o, Nu.jsx = s, Nu.jsxs = s, Nu;
}
var my;
function b1() {
  return my || (my = 1, ur.exports = h1()), ur.exports;
}
var X = b1(), ir = { exports: {} }, I = {};
var yy;
function p1() {
  if (yy) return I;
  yy = 1;
  var i = /* @__PURE__ */ Symbol.for("react.transitional.element"), o = /* @__PURE__ */ Symbol.for("react.portal"), s = /* @__PURE__ */ Symbol.for("react.fragment"), f = /* @__PURE__ */ Symbol.for("react.strict_mode"), m = /* @__PURE__ */ Symbol.for("react.profiler"), y = /* @__PURE__ */ Symbol.for("react.consumer"), z = /* @__PURE__ */ Symbol.for("react.context"), O = /* @__PURE__ */ Symbol.for("react.forward_ref"), C = /* @__PURE__ */ Symbol.for("react.suspense"), j = /* @__PURE__ */ Symbol.for("react.memo"), M = /* @__PURE__ */ Symbol.for("react.lazy"), S = /* @__PURE__ */ Symbol.for("react.activity"), D = /* @__PURE__ */ Symbol.for("react.view_transition"), Q = Symbol.iterator;
  function G(g) {
    return g === null || typeof g != "object" ? null : (g = Q && g[Q] || g["@@iterator"], typeof g == "function" ? g : null);
  }
  var P = {
    isMounted: function() {
      return !1;
    },
    enqueueForceUpdate: function() {
    },
    enqueueReplaceState: function() {
    },
    enqueueSetState: function() {
    }
  }, L = Object.assign, at = {};
  function tt(g, R, w) {
    this.props = g, this.context = R, this.refs = at, this.updater = w || P;
  }
  tt.prototype.isReactComponent = {}, tt.prototype.setState = function(g, R) {
    if (typeof g != "object" && typeof g != "function" && g != null)
      throw Error(
        "takes an object of state variables to update or a function which returns an object of state variables."
      );
    this.updater.enqueueSetState(this, g, R, "setState");
  }, tt.prototype.forceUpdate = function(g) {
    this.updater.enqueueForceUpdate(this, g, "forceUpdate");
  };
  function yt() {
  }
  yt.prototype = tt.prototype;
  function Ot(g, R, w) {
    this.props = g, this.context = R, this.refs = at, this.updater = w || P;
  }
  var ft = Ot.prototype = new yt();
  ft.constructor = Ot, L(ft, tt.prototype), ft.isPureReactComponent = !0;
  var pt = Array.isArray;
  function Y() {
  }
  var Z = { H: null, A: null, T: null, S: null }, jt = Object.prototype.hasOwnProperty;
  function Ht(g, R, w) {
    var K = w.ref;
    return {
      $$typeof: i,
      type: g,
      key: R,
      ref: K !== void 0 ? K : null,
      props: w
    };
  }
  function kt(g, R) {
    return Ht(g.type, R, g.props);
  }
  function Ct(g) {
    return typeof g == "object" && g !== null && g.$$typeof === i;
  }
  function It(g) {
    var R = { "=": "=0", ":": "=2" };
    return "$" + g.replace(/[=:]/g, function(w) {
      return R[w];
    });
  }
  var hl = /\/+/g;
  function Gt(g, R) {
    return typeof g == "object" && g !== null && g.key != null ? It("" + g.key) : R.toString(36);
  }
  function x(g) {
    switch (g.status) {
      case "fulfilled":
        return g.value;
      case "rejected":
        throw g.reason;
      default:
        switch (typeof g.status == "string" ? g.then(Y, Y) : (g.status = "pending", g.then(
          function(R) {
            g.status === "pending" && (g.status = "fulfilled", g.value = R);
          },
          function(R) {
            g.status === "pending" && (g.status = "rejected", g.reason = R);
          }
        )), g.status) {
          case "fulfilled":
            return g.value;
          case "rejected":
            throw g.reason;
        }
    }
    throw g;
  }
  function J(g, R, w, K, st) {
    var dt = typeof g;
    (dt === "undefined" || dt === "boolean") && (g = null);
    var vt = !1;
    if (g === null) vt = !0;
    else
      switch (dt) {
        case "bigint":
        case "string":
        case "number":
          vt = !0;
          break;
        case "object":
          switch (g.$$typeof) {
            case i:
            case o:
              vt = !0;
              break;
            case M:
              return vt = g._init, J(
                vt(g._payload),
                R,
                w,
                K,
                st
              );
          }
      }
    if (vt)
      return st = st(g), vt = K === "" ? "." + Gt(g, 0) : K, pt(st) ? (w = "", vt != null && (w = vt.replace(hl, "$&/") + "/"), J(st, R, w, "", function(wl) {
        return wl;
      })) : st != null && (Ct(st) && (st = kt(
        st,
        w + (st.key == null || g && g.key === st.key ? "" : ("" + st.key).replace(
          hl,
          "$&/"
        ) + "/") + vt
      )), R.push(st)), 1;
    vt = 0;
    var V = K === "" ? "." : K + ":";
    if (pt(g))
      for (var k = 0; k < g.length; k++)
        K = g[k], dt = V + Gt(K, k), vt += J(
          K,
          R,
          w,
          dt,
          st
        );
    else if (k = G(g), typeof k == "function")
      for (g = k.call(g), k = 0; !(K = g.next()).done; )
        K = K.value, dt = V + Gt(K, k++), vt += J(
          K,
          R,
          w,
          dt,
          st
        );
    else if (dt === "object") {
      if (typeof g.then == "function")
        return J(
          x(g),
          R,
          w,
          K,
          st
        );
      throw R = String(g), Error(
        "Objects are not valid as a React child (found: " + (R === "[object Object]" ? "object with keys {" + Object.keys(g).join(", ") + "}" : R) + "). If you meant to render a collection of children, use an array instead."
      );
    }
    return vt;
  }
  function W(g, R, w) {
    if (g == null) return g;
    var K = [], st = 0;
    return J(g, K, "", "", function(dt) {
      return R.call(w, dt, st++);
    }), K;
  }
  function Tt(g) {
    if (g._status === -1) {
      var R = g._result, w = R();
      w.then(
        function(K) {
          (g._status === 0 || g._status === -1) && (g._status = 1, g._result = K, w.status === void 0 && (w.status = "fulfilled", w.value = K));
        },
        function(K) {
          (g._status === 0 || g._status === -1) && (g._status = 2, g._result = K, w.status === void 0 && (w.status = "rejected", w.reason = K));
        }
      ), g._status === -1 && (g._status = 0, g._result = w);
    }
    if (g._status === 1) return g._result.default;
    throw g._result;
  }
  var gt = typeof reportError == "function" ? reportError : function(g) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var R = new window.ErrorEvent("error", {
        bubbles: !0,
        cancelable: !0,
        message: typeof g == "object" && g !== null && typeof g.message == "string" ? String(g.message) : String(g),
        error: g
      });
      if (!window.dispatchEvent(R)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", g);
      return;
    }
    console.error(g);
  };
  function bl(g) {
    var R = Z.T, w = {};
    w.types = R !== null ? R.types : null, Z.T = w;
    try {
      var K = g(), st = Z.S;
      st !== null && st(w, K), typeof K == "object" && K !== null && typeof K.then == "function" && K.then(Y, gt);
    } catch (dt) {
      gt(dt);
    } finally {
      R !== null && w.types !== null && (R.types = w.types), Z.T = R;
    }
  }
  function Zl(g) {
    var R = Z.T;
    if (R !== null) {
      var w = R.types;
      w === null ? R.types = [g] : w.indexOf(g) === -1 && w.push(g);
    } else bl(Zl.bind(null, g));
  }
  var de = {
    map: W,
    forEach: function(g, R, w) {
      W(
        g,
        function() {
          R.apply(this, arguments);
        },
        w
      );
    },
    count: function(g) {
      var R = 0;
      return W(g, function() {
        R++;
      }), R;
    },
    toArray: function(g) {
      return W(g, function(R) {
        return R;
      }) || [];
    },
    only: function(g) {
      if (!Ct(g))
        throw Error(
          "React.Children.only expected to receive a single React element child."
        );
      return g;
    }
  };
  return I.Activity = S, I.Children = de, I.Component = tt, I.Fragment = s, I.Profiler = m, I.PureComponent = Ot, I.StrictMode = f, I.Suspense = C, I.ViewTransition = D, I.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Z, I.__COMPILER_RUNTIME = {
    __proto__: null,
    c: function(g) {
      return Z.H.useMemoCache(g);
    }
  }, I.addTransitionType = Zl, I.cache = function(g) {
    return function() {
      return g.apply(null, arguments);
    };
  }, I.cacheSignal = function() {
    return null;
  }, I.cloneElement = function(g, R, w) {
    if (g == null)
      throw Error(
        "The argument must be a React element, but you passed " + g + "."
      );
    var K = L({}, g.props), st = g.key;
    if (R != null)
      for (dt in R.key !== void 0 && (st = "" + R.key), R)
        !jt.call(R, dt) || dt === "key" || dt === "__self" || dt === "__source" || dt === "ref" && R.ref === void 0 || (K[dt] = R[dt]);
    var dt = arguments.length - 2;
    if (dt === 1) K.children = w;
    else if (1 < dt) {
      for (var vt = Array(dt), V = 0; V < dt; V++)
        vt[V] = arguments[V + 2];
      K.children = vt;
    }
    return Ht(g.type, st, K);
  }, I.createContext = function(g) {
    return g = {
      $$typeof: z,
      _currentValue: g,
      _currentValue2: g,
      _threadCount: 0,
      Provider: null,
      Consumer: null
    }, g.Provider = g, g.Consumer = {
      $$typeof: y,
      _context: g
    }, g;
  }, I.createElement = function(g, R, w) {
    var K, st = {}, dt = null;
    if (R != null)
      for (K in R.key !== void 0 && (dt = "" + R.key), R)
        jt.call(R, K) && K !== "key" && K !== "__self" && K !== "__source" && (st[K] = R[K]);
    var vt = arguments.length - 2;
    if (vt === 1) st.children = w;
    else if (1 < vt) {
      for (var V = Array(vt), k = 0; k < vt; k++)
        V[k] = arguments[k + 2];
      st.children = V;
    }
    if (g && g.defaultProps)
      for (K in vt = g.defaultProps, vt)
        st[K] === void 0 && (st[K] = vt[K]);
    return Ht(g, dt, st);
  }, I.createRef = function() {
    return { current: null };
  }, I.forwardRef = function(g) {
    return { $$typeof: O, render: g };
  }, I.isValidElement = Ct, I.lazy = function(g) {
    return {
      $$typeof: M,
      _payload: { _status: -1, _result: g },
      _init: Tt
    };
  }, I.memo = function(g, R) {
    return {
      $$typeof: j,
      type: g,
      compare: R === void 0 ? null : R
    };
  }, I.startTransition = bl, I.unstable_useCacheRefresh = function() {
    return Z.H.useCacheRefresh();
  }, I.use = function(g) {
    return Z.H.use(g);
  }, I.useActionState = function(g, R, w) {
    return Z.H.useActionState(g, R, w);
  }, I.useCallback = function(g, R) {
    return Z.H.useCallback(g, R);
  }, I.useContext = function(g) {
    return Z.H.useContext(g);
  }, I.useDebugValue = function() {
  }, I.useDeferredValue = function(g, R) {
    return Z.H.useDeferredValue(g, R);
  }, I.useEffect = function(g, R) {
    return Z.H.useEffect(g, R);
  }, I.useEffectEvent = function(g) {
    return Z.H.useEffectEvent(g);
  }, I.useId = function() {
    return Z.H.useId();
  }, I.useImperativeHandle = function(g, R, w) {
    return Z.H.useImperativeHandle(g, R, w);
  }, I.useInsertionEffect = function(g, R) {
    return Z.H.useInsertionEffect(g, R);
  }, I.useLayoutEffect = function(g, R) {
    return Z.H.useLayoutEffect(g, R);
  }, I.useMemo = function(g, R) {
    return Z.H.useMemo(g, R);
  }, I.useOptimistic = function(g, R) {
    return Z.H.useOptimistic(g, R);
  }, I.useReducer = function(g, R, w) {
    return Z.H.useReducer(g, R, w);
  }, I.useRef = function(g) {
    return Z.H.useRef(g);
  }, I.useState = function(g) {
    return Z.H.useState(g);
  }, I.useSyncExternalStore = function(g, R, w) {
    return Z.H.useSyncExternalStore(
      g,
      R,
      w
    );
  }, I.useTransition = function() {
    return Z.H.useTransition();
  }, I.version = "19.3.0", I;
}
var vy;
function Nr() {
  return vy || (vy = 1, ir.exports = p1()), ir.exports;
}
var ct = Nr();
const S1 = /* @__PURE__ */ jy(ct), mp = /* @__PURE__ */ g1({
  __proto__: null,
  default: S1
}, [ct]);
function se(i) {
  return Object.keys(i);
}
function cr(i) {
  return i && typeof i == "object" && !Array.isArray(i);
}
function Ar(i, o) {
  const s = { ...i }, f = o;
  return cr(i) && cr(o) && Object.keys(o).forEach((m) => {
    cr(f[m]) && m in i ? s[m] = Ar(s[m], f[m]) : s[m] = f[m];
  }), s;
}
function T1(i) {
  return i.replace(/[A-Z]/g, (o) => `-${o.toLowerCase()}`);
}
function E1(i) {
  return typeof i != "string" || !i.includes("var(--mantine-scale)") ? i : i.match(/^calc\((.*?)\)$/)?.[1].split("*")[0].trim();
}
function _1(i) {
  const o = E1(i);
  return typeof o == "number" ? o : typeof o == "string" ? o.includes("calc") || o.includes("var") ? o : o.includes("px") ? Number(o.replace("px", "")) : o.includes("rem") ? Number(o.replace("rem", "")) * 16 : o.includes("em") ? Number(o.replace("em", "")) * 16 : Number(o) : NaN;
}
function gy(i) {
  return i === "0rem" ? "0rem" : `calc(${i} * var(--mantine-scale))`;
}
function By(i, { shouldScale: o = !1 } = {}) {
  function s(f) {
    if (f === 0 || f === "0") return `0${i}`;
    if (typeof f == "number") {
      const m = `${f / 16}${i}`;
      return o ? gy(m) : m;
    }
    if (typeof f == "string") {
      if (f === "" || f.startsWith("calc(") || f.startsWith("clamp(") || f.includes("rgba(")) return f;
      if (f.includes(",")) return f.split(",").map((y) => s(y)).join(",");
      if (f.includes(" ")) return f.split(" ").map((y) => s(y)).join(" ");
      const m = f.replace("px", "");
      if (!Number.isNaN(Number(m))) {
        const y = `${Number(m) / 16}${i}`;
        return o ? gy(y) : y;
      }
    }
    return f;
  }
  return s;
}
const U = By("rem", { shouldScale: !0 }), hy = By("em");
function Cr(i) {
  return Object.keys(i).reduce((o, s) => (i[s] !== void 0 && (o[s] = i[s]), o), {});
}
function Yy(i) {
  if (typeof i == "number") return !0;
  if (typeof i == "string") {
    if (i.startsWith("calc(") || i.startsWith("var(") || i.includes(" ") && i.trim() !== "") return !0;
    const o = /^[+-]?[0-9]+(\.[0-9]+)?(px|em|rem|ex|ch|lh|rlh|vw|vh|vmin|vmax|vb|vi|svw|svh|lvw|lvh|dvw|dvh|cm|mm|in|pt|pc|q|cqw|cqh|cqi|cqb|cqmin|cqmax|%)?$/;
    return i.trim().split(/\s+/).every((s) => o.test(s));
  }
  return !1;
}
function Rl(i, o = "size", s = !0) {
  if (i !== void 0)
    return Yy(i) ? s ? U(i) : i : `var(--${o}-${i})`;
}
function Mr(i) {
  return Rl(i, "mantine-spacing");
}
function Hu(i) {
  return i === void 0 ? "var(--mantine-radius-default)" : Rl(i, "mantine-radius");
}
function Cn(i) {
  return Rl(i, "mantine-font-size");
}
function z1(i) {
  return Rl(i, "mantine-line-height", !1);
}
function O1(i) {
  if (i)
    return Rl(i, "mantine-shadow", !1);
}
function N1(i, o) {
  if (typeof window < "u" && "matchMedia" in window) try {
    return window.matchMedia(i).matches;
  } catch {
    return !1;
  }
  return !1;
}
function A1(i, o, { getInitialValueInEffect: s } = { getInitialValueInEffect: !0 }) {
  const [f, m] = ct.useState(s ? o : N1(i));
  return ct.useEffect(() => {
    try {
      if ("matchMedia" in window) {
        const y = window.matchMedia(i);
        m(y.matches);
        const z = (O) => m(O.matches);
        return y.addEventListener("change", z), () => {
          y.removeEventListener("change", z);
        };
      }
    } catch {
      return;
    }
  }, [i]), f || !1;
}
const qy = typeof document < "u" ? ct.useLayoutEffect : ct.useEffect;
function C1(i, o) {
  return i.length !== o.length || o.some((s, f) => !Object.is(s, i[f]));
}
function M1(i, o) {
  const s = ct.useRef(!1), f = ct.useRef(null), m = ct.useRef(void 0), y = {};
  ct.useEffect(() => {
    const z = f.current === y, O = m.current;
    if (f.current = y, m.current = o, !s.current) {
      s.current = !0;
      return;
    }
    if (!z && !(o && O && !C1(O, o)))
      return i();
  }, o);
}
function R1(i, o) {
  return A1("(prefers-reduced-motion: reduce)", i, o);
}
var fr = { exports: {} }, ul = {};
var by;
function D1() {
  if (by) return ul;
  by = 1;
  var i = Nr();
  function o(M) {
    var S = "https://react.dev/errors/" + M;
    if (1 < arguments.length) {
      S += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var D = 2; D < arguments.length; D++)
        S += "&args[]=" + encodeURIComponent(arguments[D]);
    }
    return "Minified React error #" + M + "; visit " + S + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function s() {
  }
  var f = {
    d: {
      f: s,
      r: function() {
        throw Error(o(522));
      },
      D: s,
      C: s,
      L: s,
      m: s,
      X: s,
      S: s,
      M: s
    },
    p: 0,
    findDOMNode: null
  }, m = /* @__PURE__ */ Symbol.for("react.portal"), y = /* @__PURE__ */ Symbol.for("react.recoverable"), z = /* @__PURE__ */ Symbol.for("react.optimistic_key");
  function O(M, S, D) {
    var Q = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return {
      $$typeof: m,
      key: Q == null ? null : Q === z ? z : "" + Q,
      children: M,
      containerInfo: S,
      implementation: D
    };
  }
  var C = i.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  function j(M, S) {
    if (M === "font") return "";
    if (typeof S == "string")
      return S === "use-credentials" ? S : "";
  }
  return ul.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = f, ul.browser = function(M) {
    return { $$typeof: y, _reason: M };
  }, ul.createPortal = function(M, S) {
    var D = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!S || S.nodeType !== 1 && S.nodeType !== 9 && S.nodeType !== 11)
      throw Error(o(299));
    return O(M, S, null, D);
  }, ul.flushSync = function(M) {
    var S = C.T, D = f.p;
    try {
      if (C.T = null, f.p = 2, M) return M();
    } finally {
      C.T = S, f.p = D, f.d.f();
    }
  }, ul.preconnect = function(M, S) {
    typeof M == "string" && (S ? (S = S.crossOrigin, S = typeof S == "string" ? S === "use-credentials" ? S : "" : void 0) : S = null, f.d.C(M, S));
  }, ul.prefetchDNS = function(M) {
    typeof M == "string" && f.d.D(M);
  }, ul.preinit = function(M, S) {
    if (typeof M == "string" && S && typeof S.as == "string") {
      var D = S.as, Q = j(D, S.crossOrigin), G = typeof S.integrity == "string" ? S.integrity : void 0, P = typeof S.fetchPriority == "string" ? S.fetchPriority : void 0;
      D === "style" ? f.d.S(
        M,
        typeof S.precedence == "string" ? S.precedence : void 0,
        {
          crossOrigin: Q,
          integrity: G,
          fetchPriority: P
        }
      ) : D === "script" && f.d.X(M, {
        crossOrigin: Q,
        integrity: G,
        fetchPriority: P,
        nonce: typeof S.nonce == "string" ? S.nonce : void 0
      });
    }
  }, ul.preinitModule = function(M, S) {
    if (typeof M == "string")
      if (typeof S == "object" && S !== null) {
        if (S.as == null || S.as === "script") {
          var D = j(
            S.as,
            S.crossOrigin
          );
          f.d.M(M, {
            crossOrigin: D,
            integrity: typeof S.integrity == "string" ? S.integrity : void 0,
            nonce: typeof S.nonce == "string" ? S.nonce : void 0,
            fetchPriority: typeof S.fetchPriority == "string" ? S.fetchPriority : void 0
          });
        }
      } else S == null && f.d.M(M);
  }, ul.preload = function(M, S) {
    if (typeof M == "string" && typeof S == "object" && S !== null && typeof S.as == "string") {
      var D = S.as, Q = j(D, S.crossOrigin);
      f.d.L(M, D, {
        crossOrigin: Q,
        integrity: typeof S.integrity == "string" ? S.integrity : void 0,
        nonce: typeof S.nonce == "string" ? S.nonce : void 0,
        type: typeof S.type == "string" ? S.type : void 0,
        fetchPriority: typeof S.fetchPriority == "string" ? S.fetchPriority : void 0,
        referrerPolicy: typeof S.referrerPolicy == "string" ? S.referrerPolicy : void 0,
        imageSrcSet: typeof S.imageSrcSet == "string" ? S.imageSrcSet : void 0,
        imageSizes: typeof S.imageSizes == "string" ? S.imageSizes : void 0,
        media: typeof S.media == "string" ? S.media : void 0
      });
    }
  }, ul.preloadModule = function(M, S) {
    if (typeof M == "string")
      if (S) {
        var D = j(S.as, S.crossOrigin);
        f.d.m(M, {
          as: typeof S.as == "string" && S.as !== "script" ? S.as : void 0,
          crossOrigin: D,
          integrity: typeof S.integrity == "string" ? S.integrity : void 0,
          nonce: typeof S.nonce == "string" ? S.nonce : void 0,
          fetchPriority: typeof S.fetchPriority == "string" ? S.fetchPriority : void 0
        });
      } else f.d.m(M);
  }, ul.requestFormReset = function(M) {
    f.d.r(M);
  }, ul.unstable_batchedUpdates = function(M, S) {
    return M(S);
  }, ul.useFormState = function(M, S, D) {
    return C.H.useFormState(M, S, D);
  }, ul.useFormStatus = function() {
    return C.H.useHostTransitionStatus();
  }, ul.version = "19.3.0", ul;
}
var py;
function Gy() {
  if (py) return fr.exports;
  py = 1;
  function i() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(i);
      } catch (o) {
        console.error(o);
      }
  }
  return i(), fr.exports = D1(), fr.exports;
}
var hr = Gy();
const U1 = /* @__PURE__ */ jy(hr);
function yp(i) {
  return i;
}
function Vy(i) {
  var o, s, f = "";
  if (typeof i == "string" || typeof i == "number") f += i;
  else if (typeof i == "object") if (Array.isArray(i)) {
    var m = i.length;
    for (o = 0; o < m; o++) i[o] && (s = Vy(i[o])) && (f && (f += " "), f += s);
  } else for (s in i) i[s] && (f && (f += " "), f += s);
  return f;
}
function Ha() {
  for (var i, o, s = 0, f = "", m = arguments.length; s < m; s++) (i = arguments[s]) && (o = Vy(i)) && (f && (f += " "), f += o);
  return f;
}
const H1 = {};
function x1(i) {
  const o = {};
  return i.forEach((s) => {
    Object.entries(s).forEach(([f, m]) => {
      o[f] ? o[f] = Ha(o[f], m) : o[f] = m;
    });
  }), o;
}
function Du({ theme: i, classNames: o, props: s, stylesCtx: f }) {
  return x1((Array.isArray(o) ? o : [o]).map((m) => typeof m == "function" ? m(i, s, f) : m || H1));
}
function gc({ theme: i, styles: o, props: s, stylesCtx: f }) {
  const m = Array.isArray(o) ? o : [o], y = {};
  for (const z of m) typeof z == "function" ? Object.assign(y, z(i, s, f)) : z && Object.assign(y, z);
  return y;
}
function Sy(i) {
  return i === "auto" || i === "dark" || i === "light";
}
function j1({ key: i = "mantine-color-scheme-value" } = {}) {
  let o;
  return {
    get: (s) => {
      if (typeof window > "u") return s;
      try {
        const f = window.localStorage.getItem(i);
        return Sy(f) ? f : s;
      } catch {
        return s;
      }
    },
    set: (s) => {
      try {
        window.localStorage.setItem(i, s);
      } catch (f) {
        console.warn("[@mantine/core] Local storage color scheme manager was unable to save color scheme.", f);
      }
    },
    subscribe: (s) => {
      o = (f) => {
        f.storageArea === window.localStorage && f.key === i && Sy(f.newValue) && s(f.newValue);
      }, window.addEventListener("storage", o);
    },
    unsubscribe: () => {
      window.removeEventListener("storage", o);
    },
    clear: () => {
      window.localStorage.removeItem(i);
    }
  };
}
function Uu(i, o) {
  return typeof i.primaryShade == "number" ? i.primaryShade : o === "dark" ? i.primaryShade.dark : i.primaryShade.light;
}
function B1(i) {
  return /^#?([0-9A-F]{3}){1,2}([0-9A-F]{2})?$/i.test(i);
}
function Y1(i) {
  let o = i.replace("#", "");
  if (o.length === 3) {
    const f = o.split("");
    o = [
      f[0],
      f[0],
      f[1],
      f[1],
      f[2],
      f[2]
    ].join("");
  }
  if (o.length === 8) {
    const f = parseInt(o.slice(6, 8), 16) / 255;
    return {
      r: parseInt(o.slice(0, 2), 16),
      g: parseInt(o.slice(2, 4), 16),
      b: parseInt(o.slice(4, 6), 16),
      a: f
    };
  }
  const s = parseInt(o, 16);
  return {
    r: s >> 16 & 255,
    g: s >> 8 & 255,
    b: s & 255,
    a: 1
  };
}
function q1(i) {
  const [o, s, f, m] = i.replace(/[^0-9,./]/g, "").split(/[/,]/).map(Number);
  return {
    r: o,
    g: s,
    b: f,
    a: m === void 0 ? 1 : m
  };
}
function G1(i) {
  const o = i.match(/^hsla?\(\s*(\d+)\s*,\s*(\d+%)\s*,\s*(\d+%)\s*(,\s*(0?\.\d+|\d+(\.\d+)?))?\s*\)$/i);
  if (!o) return {
    r: 0,
    g: 0,
    b: 0,
    a: 1
  };
  const s = parseInt(o[1], 10), f = parseInt(o[2], 10) / 100, m = parseInt(o[3], 10) / 100, y = o[5] ? parseFloat(o[5]) : void 0, z = (1 - Math.abs(2 * m - 1)) * f, O = s / 60, C = z * (1 - Math.abs(O % 2 - 1)), j = m - z / 2;
  let M, S, D;
  return O >= 0 && O < 1 ? (M = z, S = C, D = 0) : O >= 1 && O < 2 ? (M = C, S = z, D = 0) : O >= 2 && O < 3 ? (M = 0, S = z, D = C) : O >= 3 && O < 4 ? (M = 0, S = C, D = z) : O >= 4 && O < 5 ? (M = C, S = 0, D = z) : (M = z, S = 0, D = C), {
    r: Math.round((M + j) * 255),
    g: Math.round((S + j) * 255),
    b: Math.round((D + j) * 255),
    a: y || 1
  };
}
function Rr(i) {
  return B1(i) ? Y1(i) : i.startsWith("rgb") ? q1(i) : i.startsWith("hsl") ? G1(i) : {
    r: 0,
    g: 0,
    b: 0,
    a: 1
  };
}
function or(i) {
  return i <= 0.03928 ? i / 12.92 : ((i + 0.055) / 1.055) ** 2.4;
}
function V1(i) {
  const o = i.match(/oklch\((.*?)%\s/);
  return o ? parseFloat(o[1]) : null;
}
function X1(i) {
  if (i.startsWith("oklch(")) return (V1(i) || 0) / 100;
  const { r: o, g: s, b: f } = Rr(i), m = o / 255, y = s / 255, z = f / 255, O = or(m), C = or(y), j = or(z);
  return 0.2126 * O + 0.7152 * C + 0.0722 * j;
}
function Au(i, o = 0.179) {
  return i.startsWith("var(") ? !1 : X1(i) > o;
}
function xu({ color: i, theme: o, colorScheme: s }) {
  if (typeof i != "string") throw new Error(`[@mantine/core] Failed to parse color. Expected color to be a string, instead got ${typeof i}`);
  if (i === "bright") return {
    color: i,
    value: s === "dark" ? o.white : o.black,
    shade: void 0,
    isThemeColor: !1,
    isLight: Au(s === "dark" ? o.white : o.black, o.luminanceThreshold),
    variable: "--mantine-color-bright"
  };
  if (i === "dimmed") return {
    color: i,
    value: s === "dark" ? o.colors.dark[2] : o.colors.gray[7],
    shade: void 0,
    isThemeColor: !1,
    isLight: Au(s === "dark" ? o.colors.dark[2] : o.colors.gray[6], o.luminanceThreshold),
    variable: "--mantine-color-dimmed"
  };
  if (i === "white" || i === "black") return {
    color: i,
    value: i === "white" ? o.white : o.black,
    shade: void 0,
    isThemeColor: !1,
    isLight: Au(i === "white" ? o.white : o.black, o.luminanceThreshold),
    variable: `--mantine-color-${i}`
  };
  const [f, m] = i.split("."), y = m ? Number(m) : void 0, z = f in o.colors;
  if (z) {
    const O = y !== void 0 ? o.colors[f][y] : o.colors[f][Uu(o, s || "light")];
    return {
      color: f,
      value: O,
      shade: y,
      isThemeColor: z,
      isLight: Au(O, o.luminanceThreshold),
      variable: m ? `--mantine-color-${f}-${y}` : `--mantine-color-${f}-filled`
    };
  }
  return {
    color: i,
    value: i,
    isThemeColor: z,
    isLight: Au(i, o.luminanceThreshold),
    shade: y,
    variable: void 0
  };
}
function br(i, o) {
  const s = xu({
    color: i || o.primaryColor,
    theme: o
  });
  return s.variable ? `var(${s.variable})` : i;
}
function Dr(i) {
  return !!i && typeof i == "object" && "mantine-virtual-color" in i;
}
function Ua(i, o) {
  if (i.startsWith("var(")) return `color-mix(in srgb, ${i}, black ${o * 100}%)`;
  const { r: s, g: f, b: m, a: y } = Rr(i), z = 1 - o, O = (C) => Math.round(C * z);
  return `rgba(${O(s)}, ${O(f)}, ${O(m)}, ${y})`;
}
function pr(i, o) {
  const s = {
    from: i?.from || o.defaultGradient.from,
    to: i?.to || o.defaultGradient.to,
    deg: i?.deg ?? o.defaultGradient.deg ?? 0
  }, f = br(s.from, o), m = br(s.to, o);
  return `linear-gradient(${s.deg}deg, ${f} 0%, ${m} 100%)`;
}
function Da(i, o) {
  if (typeof i != "string" || o > 1 || o < 0) return "rgba(0, 0, 0, 1)";
  if (i.startsWith("var(")) return `color-mix(in srgb, ${i}, transparent ${(1 - o) * 100}%)`;
  if (i.startsWith("oklch"))
    return i.includes("/") ? i.replace(/\/\s*[\d.]+\s*\)/, `/ ${o})`) : i.replace(")", ` / ${o})`);
  const { r: s, g: f, b: m } = Rr(i);
  return `rgba(${s}, ${f}, ${m}, ${o})`;
}
const Ty = Da, Q1 = ({ color: i, theme: o, variant: s, gradient: f, autoContrast: m }) => {
  const y = xu({
    color: i,
    theme: o
  }), z = typeof m == "boolean" ? m : o.autoContrast;
  if (s === "none") return {
    background: "transparent",
    hover: "transparent",
    color: "inherit",
    border: "none"
  };
  if (s === "filled") {
    const O = y.isThemeColor && y.shade === void 0 && Dr(o.colors[y.color]), C = z ? O ? `var(--mantine-color-${y.color}-contrast)` : y.isLight ? "var(--mantine-color-black)" : "var(--mantine-color-white)" : "var(--mantine-color-white)";
    return y.isThemeColor ? y.shade === void 0 ? {
      background: `var(--mantine-color-${i}-filled)`,
      hover: `var(--mantine-color-${i}-filled-hover)`,
      color: C,
      border: `${U(1)} solid transparent`
    } : {
      background: `var(--mantine-color-${y.color}-${y.shade})`,
      hover: `var(--mantine-color-${y.color}-${y.shade === 9 ? 8 : y.shade + 1})`,
      color: C,
      border: `${U(1)} solid transparent`
    } : {
      background: i,
      hover: Ua(i, 0.1),
      color: C,
      border: `${U(1)} solid transparent`
    };
  }
  if (s === "light") {
    if (y.isThemeColor) {
      if (y.shade === void 0) return {
        background: `var(--mantine-color-${i}-light)`,
        hover: `var(--mantine-color-${i}-light-hover)`,
        color: `var(--mantine-color-${i}-light-color)`,
        border: `${U(1)} solid transparent`
      };
      const O = o.colors[y.color][y.shade];
      return {
        background: O,
        hover: Ua(O, 0.1),
        color: `var(--mantine-color-${y.color}-light-color)`,
        border: `${U(1)} solid transparent`
      };
    }
    return {
      background: Da(i, 0.1),
      hover: Da(i, 0.12),
      color: i,
      border: `${U(1)} solid transparent`
    };
  }
  if (s === "outline")
    return y.isThemeColor ? y.shade === void 0 ? {
      background: "transparent",
      hover: `var(--mantine-color-${i}-outline-hover)`,
      color: `var(--mantine-color-${i}-outline)`,
      border: `${U(1)} solid var(--mantine-color-${i}-outline)`
    } : {
      background: "transparent",
      hover: Da(o.colors[y.color][y.shade], 0.05),
      color: `var(--mantine-color-${y.color}-${y.shade})`,
      border: `${U(1)} solid var(--mantine-color-${y.color}-${y.shade})`
    } : {
      background: "transparent",
      hover: Da(i, 0.05),
      color: i,
      border: `${U(1)} solid ${i}`
    };
  if (s === "subtle") {
    if (y.isThemeColor) {
      if (y.shade === void 0) return {
        background: "transparent",
        hover: `var(--mantine-color-${i}-light-hover)`,
        color: `var(--mantine-color-${i}-light-color)`,
        border: `${U(1)} solid transparent`
      };
      const O = o.colors[y.color][y.shade];
      return {
        background: "transparent",
        hover: Da(O, 0.12),
        color: `var(--mantine-color-${y.color}-${Math.min(y.shade, 6)})`,
        border: `${U(1)} solid transparent`
      };
    }
    return {
      background: "transparent",
      hover: Da(i, 0.12),
      color: i,
      border: `${U(1)} solid transparent`
    };
  }
  return s === "transparent" ? y.isThemeColor ? y.shade === void 0 ? {
    background: "transparent",
    hover: "transparent",
    color: `var(--mantine-color-${i}-light-color)`,
    border: `${U(1)} solid transparent`
  } : {
    background: "transparent",
    hover: "transparent",
    color: `var(--mantine-color-${y.color}-${Math.min(y.shade, 6)})`,
    border: `${U(1)} solid transparent`
  } : {
    background: "transparent",
    hover: "transparent",
    color: i,
    border: `${U(1)} solid transparent`
  } : s === "white" ? y.isThemeColor ? y.shade === void 0 ? {
    background: "var(--mantine-color-white)",
    hover: Ua(o.white, 0.01),
    color: `var(--mantine-color-${i}-filled)`,
    border: `${U(1)} solid transparent`
  } : {
    background: "var(--mantine-color-white)",
    hover: Ua(o.white, 0.01),
    color: `var(--mantine-color-${y.color}-${y.shade})`,
    border: `${U(1)} solid transparent`
  } : {
    background: "var(--mantine-color-white)",
    hover: Ua(o.white, 0.01),
    color: i,
    border: `${U(1)} solid transparent`
  } : s === "gradient" ? {
    background: pr(f, o),
    hover: pr(f, o),
    color: "var(--mantine-color-white)",
    border: "none"
  } : s === "default" ? {
    background: "var(--mantine-color-default)",
    hover: "var(--mantine-color-default-hover)",
    color: "var(--mantine-color-default-color)",
    border: `${U(1)} solid var(--mantine-color-default-border)`
  } : {};
};
function Xy({ color: i, theme: o, autoContrast: s, colorScheme: f }) {
  return (typeof s == "boolean" ? s : o.autoContrast) && xu({
    color: i || o.primaryColor,
    theme: o,
    colorScheme: f
  }).isLight ? "var(--mantine-color-black)" : "var(--mantine-color-white)";
}
function Sr(i, o, s) {
  return Xy({
    color: s === "dark" ? i.dark : i.light,
    theme: o,
    colorScheme: s,
    autoContrast: !0
  });
}
function Ey(i, o) {
  const s = i.colors[i.primaryColor];
  return Dr(s) ? i.autoContrast ? Sr(s, i, o) : "var(--mantine-color-white)" : Xy({
    color: s[Uu(i, o)],
    theme: i,
    autoContrast: null
  });
}
const Qy = ct.createContext(null);
function Ce() {
  const i = ct.use(Qy);
  if (!i) throw new Error("[@mantine/core] MantineProvider was not found in tree");
  return i;
}
function L1() {
  return Ce().cssVariablesResolver;
}
function Z1() {
  return Ce().classNamesPrefix;
}
function Ur() {
  return Ce().getStyleNonce;
}
function w1() {
  return Ce().withStaticClasses;
}
function K1() {
  return Ce().headless;
}
function $1() {
  return Ce().stylesTransform?.sx;
}
function J1() {
  return Ce().stylesTransform?.styles;
}
function F1() {
  return Ce().env || "default";
}
function W1() {
  return Ce().deduplicateInlineStyles;
}
function An(i, o) {
  const s = typeof window < "u" && "matchMedia" in window && window.matchMedia("(prefers-color-scheme: dark)")?.matches, f = i !== "auto" ? i : s ? "dark" : "light";
  o()?.setAttribute("data-mantine-color-scheme", f);
}
function k1({ manager: i, defaultColorScheme: o, getRootElement: s, forceColorScheme: f }) {
  const m = ct.useRef(null), [y, z] = ct.useState(() => i.get(o)), O = f || y, C = ct.useCallback((M) => {
    f || (An(M, s), z(M), i.set(M));
  }, [
    i.set,
    O,
    f
  ]), j = ct.useCallback(() => {
    z(o), An(o, s), i.clear();
  }, [i.clear, o]);
  return ct.useEffect(() => (i.subscribe(C), i.unsubscribe), [i.subscribe, i.unsubscribe]), qy(() => {
    An(i.get(o), s);
  }, []), ct.useEffect(() => {
    if (f)
      return An(f, s), () => {
      };
    f === void 0 && An(y, s), typeof window < "u" && "matchMedia" in window && (m.current = window.matchMedia("(prefers-color-scheme: dark)"));
    const M = (S) => {
      y === "auto" && An(S.matches ? "dark" : "light", s);
    };
    return m.current?.addEventListener("change", M), () => m.current?.removeEventListener("change", M);
  }, [y, f]), {
    colorScheme: O,
    setColorScheme: C,
    clearColorScheme: j
  };
}
const I1 = {
  dark: [
    "#C9C9C9",
    "#b8b8b8",
    "#828282",
    "#696969",
    "#424242",
    "#3b3b3b",
    "#2e2e2e",
    "#242424",
    "#1f1f1f",
    "#141414"
  ],
  gray: [
    "#f8f9fa",
    "#f1f3f5",
    "#e9ecef",
    "#dee2e6",
    "#ced4da",
    "#adb5bd",
    "#868e96",
    "#495057",
    "#343a40",
    "#212529"
  ],
  red: [
    "#fff5f5",
    "#ffe3e3",
    "#ffc9c9",
    "#ffa8a8",
    "#ff8787",
    "#ff6b6b",
    "#fa5252",
    "#f03e3e",
    "#e03131",
    "#c92a2a"
  ],
  pink: [
    "#fff0f6",
    "#ffdeeb",
    "#fcc2d7",
    "#faa2c1",
    "#f783ac",
    "#f06595",
    "#e64980",
    "#d6336c",
    "#c2255c",
    "#a61e4d"
  ],
  grape: [
    "#f8f0fc",
    "#f3d9fa",
    "#eebefa",
    "#e599f7",
    "#da77f2",
    "#cc5de8",
    "#be4bdb",
    "#ae3ec9",
    "#9c36b5",
    "#862e9c"
  ],
  violet: [
    "#f3f0ff",
    "#e5dbff",
    "#d0bfff",
    "#b197fc",
    "#9775fa",
    "#845ef7",
    "#7950f2",
    "#7048e8",
    "#6741d9",
    "#5f3dc4"
  ],
  indigo: [
    "#edf2ff",
    "#dbe4ff",
    "#bac8ff",
    "#91a7ff",
    "#748ffc",
    "#5c7cfa",
    "#4c6ef5",
    "#4263eb",
    "#3b5bdb",
    "#364fc7"
  ],
  blue: [
    "#e7f5ff",
    "#d0ebff",
    "#a5d8ff",
    "#74c0fc",
    "#4dabf7",
    "#339af0",
    "#228be6",
    "#1c7ed6",
    "#1971c2",
    "#1864ab"
  ],
  cyan: [
    "#e3fafc",
    "#c5f6fa",
    "#99e9f2",
    "#66d9e8",
    "#3bc9db",
    "#22b8cf",
    "#15aabf",
    "#1098ad",
    "#0c8599",
    "#0b7285"
  ],
  teal: [
    "#e6fcf5",
    "#c3fae8",
    "#96f2d7",
    "#63e6be",
    "#38d9a9",
    "#20c997",
    "#12b886",
    "#0ca678",
    "#099268",
    "#087f5b"
  ],
  green: [
    "#ebfbee",
    "#d3f9d8",
    "#b2f2bb",
    "#8ce99a",
    "#69db7c",
    "#51cf66",
    "#40c057",
    "#37b24d",
    "#2f9e44",
    "#2b8a3e"
  ],
  lime: [
    "#f4fce3",
    "#e9fac8",
    "#d8f5a2",
    "#c0eb75",
    "#a9e34b",
    "#94d82d",
    "#82c91e",
    "#74b816",
    "#66a80f",
    "#5c940d"
  ],
  yellow: [
    "#fff9db",
    "#fff3bf",
    "#ffec99",
    "#ffe066",
    "#ffd43b",
    "#fcc419",
    "#fab005",
    "#f59f00",
    "#f08c00",
    "#e67700"
  ],
  orange: [
    "#fff4e6",
    "#ffe8cc",
    "#ffd8a8",
    "#ffc078",
    "#ffa94d",
    "#ff922b",
    "#fd7e14",
    "#f76707",
    "#e8590c",
    "#d9480f"
  ]
}, _y = "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji", Hr = {
  scale: 1,
  fontSmoothing: !0,
  focusRing: "auto",
  white: "#fff",
  black: "#000",
  colors: I1,
  primaryShade: {
    light: 6,
    dark: 8
  },
  primaryColor: "blue",
  variantColorResolver: Q1,
  autoContrast: !1,
  luminanceThreshold: 0.3,
  fontFamily: _y,
  fontFamilyMonospace: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
  respectReducedMotion: !1,
  cursorType: "default",
  defaultGradient: {
    from: "blue",
    to: "cyan",
    deg: 45
  },
  defaultRadius: "md",
  activeClassName: "mantine-active",
  focusClassName: "",
  headings: {
    fontFamily: _y,
    fontWeight: "700",
    textWrap: "wrap",
    sizes: {
      h1: {
        fontSize: U(34),
        lineHeight: "1.3"
      },
      h2: {
        fontSize: U(26),
        lineHeight: "1.35"
      },
      h3: {
        fontSize: U(22),
        lineHeight: "1.4"
      },
      h4: {
        fontSize: U(18),
        lineHeight: "1.45"
      },
      h5: {
        fontSize: U(16),
        lineHeight: "1.5"
      },
      h6: {
        fontSize: U(14),
        lineHeight: "1.5"
      }
    }
  },
  fontSizes: {
    xs: U(12),
    sm: U(14),
    md: U(16),
    lg: U(18),
    xl: U(20)
  },
  lineHeights: {
    xs: "1.4",
    sm: "1.45",
    md: "1.55",
    lg: "1.6",
    xl: "1.65"
  },
  fontWeights: {
    regular: "400",
    medium: "600",
    bold: "700"
  },
  radius: {
    xs: U(2),
    sm: U(4),
    md: U(8),
    lg: U(16),
    xl: U(32)
  },
  spacing: {
    xs: U(10),
    sm: U(12),
    md: U(16),
    lg: U(20),
    xl: U(32)
  },
  breakpoints: {
    xs: "36em",
    sm: "48em",
    md: "62em",
    lg: "75em",
    xl: "88em"
  },
  shadows: {
    xs: `0 ${U(1)} ${U(3)} rgba(0, 0, 0, 0.05), 0 ${U(1)} ${U(2)} rgba(0, 0, 0, 0.1)`,
    sm: `0 ${U(1)} ${U(3)} rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 ${U(10)} ${U(15)} ${U(-5)}, rgba(0, 0, 0, 0.04) 0 ${U(7)} ${U(7)} ${U(-5)}`,
    md: `0 ${U(1)} ${U(3)} rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 ${U(20)} ${U(25)} ${U(-5)}, rgba(0, 0, 0, 0.04) 0 ${U(10)} ${U(10)} ${U(-5)}`,
    lg: `0 ${U(1)} ${U(3)} rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 ${U(28)} ${U(23)} ${U(-7)}, rgba(0, 0, 0, 0.04) 0 ${U(12)} ${U(12)} ${U(-7)}`,
    xl: `0 ${U(1)} ${U(3)} rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 ${U(36)} ${U(28)} ${U(-7)}, rgba(0, 0, 0, 0.04) 0 ${U(17)} ${U(17)} ${U(-7)}`
  },
  other: {},
  components: {}
}, P1 = "[@mantine/core] MantineProvider: Invalid theme.primaryColor, it accepts only key of theme.colors, learn more – https://mantine.dev/theming/colors/#primary-color", zy = "[@mantine/core] MantineProvider: Invalid theme.primaryShade, it accepts only 0-9 integers or an object { light: 0-9, dark: 0-9 }";
function rr(i) {
  return i < 0 || i > 9 ? !1 : parseInt(i.toString(), 10) === i;
}
function Oy(i) {
  if (!(i.primaryColor in i.colors)) throw new Error(P1);
  if (typeof i.primaryShade == "object" && (!rr(i.primaryShade.dark) || !rr(i.primaryShade.light)))
    throw new Error(zy);
  if (typeof i.primaryShade == "number" && !rr(i.primaryShade)) throw new Error(zy);
}
function tb(i, o) {
  if (!o)
    return Oy(i), i;
  const s = Ar(i, o);
  return o.fontFamily && !o.headings?.fontFamily && (s.headings = {
    ...s.headings,
    fontFamily: o.fontFamily
  }), Oy(s), s;
}
const xr = ct.createContext(null), lb = () => ct.use(xr) || Hr;
function xa() {
  const i = ct.use(xr);
  if (!i) throw new Error("@mantine/core: MantineProvider was not found in component tree, make sure you have it in your app");
  return i;
}
function Ly({ theme: i, children: o, inherit: s = !0 }) {
  const f = lb(), m = ct.useMemo(() => tb(s ? f : Hr, i), [
    i,
    f,
    s
  ]);
  return /* @__PURE__ */ X.jsx(xr, {
    value: m,
    children: o
  });
}
Ly.displayName = "@mantine/core/MantineThemeProvider";
function sr(i) {
  return Object.entries(i).map(([o, s]) => `${o}: ${s};`).join("");
}
function Zy(i, o) {
  const s = o ? [o] : [":root", ":host"], f = sr(i.variables), m = f ? `${s.join(", ")}{${f}}` : "", y = sr(i.dark), z = sr(i.light), O = (C) => s.map((j) => j === ":host" ? `${j}([data-mantine-color-scheme="${C}"])` : `${j}[data-mantine-color-scheme="${C}"]`).join(", ");
  return `${m}

${y ? `${O("dark")}{${y}}` : ""}

${z ? `${O("light")}{${z}}` : ""}`;
}
function dc({ theme: i, color: o, colorScheme: s, name: f = o, withColorValues: m = !0 }) {
  if (!i.colors[o]) return {};
  if (s === "light") {
    const O = Uu(i, "light"), C = {
      [`--mantine-color-${f}-text`]: `var(--mantine-color-${f}-filled)`,
      [`--mantine-color-${f}-filled`]: `var(--mantine-color-${f}-${O})`,
      [`--mantine-color-${f}-filled-hover`]: `var(--mantine-color-${f}-${O === 9 ? 8 : O + 1})`,
      [`--mantine-color-${f}-light`]: `var(--mantine-color-${f}-1)`,
      [`--mantine-color-${f}-light-hover`]: `var(--mantine-color-${f}-2)`,
      [`--mantine-color-${f}-light-color`]: `var(--mantine-color-${f}-9)`,
      [`--mantine-color-${f}-outline`]: `var(--mantine-color-${f}-${O})`,
      [`--mantine-color-${f}-outline-hover`]: Ty(i.colors[o][O], 0.05)
    };
    return m ? {
      [`--mantine-color-${f}-0`]: i.colors[o][0],
      [`--mantine-color-${f}-1`]: i.colors[o][1],
      [`--mantine-color-${f}-2`]: i.colors[o][2],
      [`--mantine-color-${f}-3`]: i.colors[o][3],
      [`--mantine-color-${f}-4`]: i.colors[o][4],
      [`--mantine-color-${f}-5`]: i.colors[o][5],
      [`--mantine-color-${f}-6`]: i.colors[o][6],
      [`--mantine-color-${f}-7`]: i.colors[o][7],
      [`--mantine-color-${f}-8`]: i.colors[o][8],
      [`--mantine-color-${f}-9`]: i.colors[o][9],
      ...C
    } : C;
  }
  const y = Uu(i, "dark"), z = {
    [`--mantine-color-${f}-text`]: `var(--mantine-color-${f}-4)`,
    [`--mantine-color-${f}-filled`]: `var(--mantine-color-${f}-${y})`,
    [`--mantine-color-${f}-filled-hover`]: `var(--mantine-color-${f}-${y === 9 ? 8 : y + 1})`,
    [`--mantine-color-${f}-light`]: Ua(i.colors[o][9], 0.5),
    [`--mantine-color-${f}-light-hover`]: Ua(i.colors[o][9], 0.3),
    [`--mantine-color-${f}-light-color`]: `var(--mantine-color-${f}-0)`,
    [`--mantine-color-${f}-outline`]: `var(--mantine-color-${f}-${Math.max(y - 4, 0)})`,
    [`--mantine-color-${f}-outline-hover`]: Ty(i.colors[o][Math.max(y - 4, 0)], 0.05)
  };
  return m ? {
    [`--mantine-color-${f}-0`]: i.colors[o][0],
    [`--mantine-color-${f}-1`]: i.colors[o][1],
    [`--mantine-color-${f}-2`]: i.colors[o][2],
    [`--mantine-color-${f}-3`]: i.colors[o][3],
    [`--mantine-color-${f}-4`]: i.colors[o][4],
    [`--mantine-color-${f}-5`]: i.colors[o][5],
    [`--mantine-color-${f}-6`]: i.colors[o][6],
    [`--mantine-color-${f}-7`]: i.colors[o][7],
    [`--mantine-color-${f}-8`]: i.colors[o][8],
    [`--mantine-color-${f}-9`]: i.colors[o][9],
    ...z
  } : z;
}
function Ra(i, o, s) {
  se(o).forEach((f) => Object.assign(i, { [`--mantine-${s}-${f}`]: o[f] }));
}
const wy = (i) => {
  const o = Uu(i, "light"), s = i.defaultRadius in i.radius ? i.radius[i.defaultRadius] : U(i.defaultRadius), f = {
    variables: {
      "--mantine-z-index-app": "100",
      "--mantine-z-index-modal": "200",
      "--mantine-z-index-popover": "300",
      "--mantine-z-index-overlay": "400",
      "--mantine-z-index-max": "9999",
      "--mantine-scale": i.scale.toString(),
      "--mantine-cursor-type": i.cursorType,
      "--mantine-webkit-font-smoothing": i.fontSmoothing ? "antialiased" : "unset",
      "--mantine-moz-font-smoothing": i.fontSmoothing ? "grayscale" : "unset",
      "--mantine-color-white": i.white,
      "--mantine-color-black": i.black,
      "--mantine-line-height": i.lineHeights.md,
      "--mantine-font-family": i.fontFamily,
      "--mantine-font-family-monospace": i.fontFamilyMonospace,
      "--mantine-font-family-headings": i.headings.fontFamily,
      "--mantine-heading-font-weight": i.headings.fontWeight,
      "--mantine-heading-text-wrap": i.headings.textWrap,
      "--mantine-radius-default": s,
      "--mantine-primary-color-filled": `var(--mantine-color-${i.primaryColor}-filled)`,
      "--mantine-primary-color-filled-hover": `var(--mantine-color-${i.primaryColor}-filled-hover)`,
      "--mantine-primary-color-light": `var(--mantine-color-${i.primaryColor}-light)`,
      "--mantine-primary-color-light-hover": `var(--mantine-color-${i.primaryColor}-light-hover)`,
      "--mantine-primary-color-light-color": `var(--mantine-color-${i.primaryColor}-light-color)`
    },
    light: {
      "--mantine-color-scheme": "light",
      "--mantine-primary-color-contrast": Ey(i, "light"),
      "--mantine-color-bright": "var(--mantine-color-black)",
      "--mantine-color-text": i.black,
      "--mantine-color-body": i.white,
      "--mantine-color-error": "var(--mantine-color-red-6)",
      "--mantine-color-success": "var(--mantine-color-teal-8)",
      "--mantine-color-placeholder": "var(--mantine-color-gray-5)",
      "--mantine-color-anchor": `var(--mantine-color-${i.primaryColor}-${o})`,
      "--mantine-color-default": "var(--mantine-color-white)",
      "--mantine-color-default-hover": "var(--mantine-color-gray-0)",
      "--mantine-color-default-color": "var(--mantine-color-black)",
      "--mantine-color-default-border": "var(--mantine-color-gray-4)",
      "--mantine-color-dimmed": "var(--mantine-color-gray-6)",
      "--mantine-color-disabled": "var(--mantine-color-gray-2)",
      "--mantine-color-disabled-color": "var(--mantine-color-gray-5)",
      "--mantine-color-disabled-border": "var(--mantine-color-gray-3)"
    },
    dark: {
      "--mantine-color-scheme": "dark",
      "--mantine-primary-color-contrast": Ey(i, "dark"),
      "--mantine-color-bright": "var(--mantine-color-white)",
      "--mantine-color-text": "var(--mantine-color-dark-0)",
      "--mantine-color-body": "var(--mantine-color-dark-7)",
      "--mantine-color-error": "var(--mantine-color-red-8)",
      "--mantine-color-success": "var(--mantine-color-teal-8)",
      "--mantine-color-placeholder": "var(--mantine-color-dark-3)",
      "--mantine-color-anchor": `var(--mantine-color-${i.primaryColor}-4)`,
      "--mantine-color-default": "var(--mantine-color-dark-6)",
      "--mantine-color-default-hover": "var(--mantine-color-dark-5)",
      "--mantine-color-default-color": "var(--mantine-color-white)",
      "--mantine-color-default-border": "var(--mantine-color-dark-4)",
      "--mantine-color-dimmed": "var(--mantine-color-dark-2)",
      "--mantine-color-disabled": "var(--mantine-color-dark-6)",
      "--mantine-color-disabled-color": "var(--mantine-color-dark-3)",
      "--mantine-color-disabled-border": "var(--mantine-color-dark-4)"
    }
  };
  Ra(f.variables, i.breakpoints, "breakpoint"), Ra(f.variables, i.spacing, "spacing"), Ra(f.variables, i.fontSizes, "font-size"), Ra(f.variables, i.lineHeights, "line-height"), Ra(f.variables, i.shadows, "shadow"), Ra(f.variables, i.radius, "radius"), Ra(f.variables, i.fontWeights, "font-weight"), i.colors[i.primaryColor].forEach((y, z) => {
    f.variables[`--mantine-primary-color-${z}`] = `var(--mantine-color-${i.primaryColor}-${z})`;
  }), se(i.colors).forEach((y) => {
    const z = i.colors[y];
    if (Dr(z)) {
      Object.assign(f.light, dc({
        theme: i,
        name: z.name,
        color: z.light,
        colorScheme: "light",
        withColorValues: !0
      })), Object.assign(f.dark, dc({
        theme: i,
        name: z.name,
        color: z.dark,
        colorScheme: "dark",
        withColorValues: !0
      })), f.light[`--mantine-color-${z.name}-contrast`] = Sr(z, i, "light"), f.dark[`--mantine-color-${z.name}-contrast`] = Sr(z, i, "dark");
      return;
    }
    z.forEach((O, C) => {
      f.variables[`--mantine-color-${y}-${C}`] = O;
    }), Object.assign(f.light, dc({
      theme: i,
      color: y,
      colorScheme: "light",
      withColorValues: !1
    })), Object.assign(f.dark, dc({
      theme: i,
      color: y,
      colorScheme: "dark",
      withColorValues: !1
    }));
  });
  const m = i.headings.sizes;
  return se(m).forEach((y) => {
    f.variables[`--mantine-${y}-font-size`] = m[y].fontSize, f.variables[`--mantine-${y}-line-height`] = m[y].lineHeight, f.variables[`--mantine-${y}-font-weight`] = m[y].fontWeight || i.headings.fontWeight;
  }), f;
};
function eb() {
  const i = xa(), o = Ur(), s = se(i.breakpoints).reduce((f, m) => {
    const y = i.breakpoints[m].includes("px"), z = _1(i.breakpoints[m]);
    return `${f}@media (max-width: ${y ? `${z - 0.1}px` : hy(z - 0.1)}) {.mantine-visible-from-${m} {display: none !important;}}@media (min-width: ${y ? `${z}px` : hy(z)}) {.mantine-hidden-from-${m} {display: none !important;}}`;
  }, "");
  return /* @__PURE__ */ X.jsx("style", {
    "data-mantine-styles": "classes",
    nonce: o?.(),
    dangerouslySetInnerHTML: { __html: s }
  });
}
function ab({ theme: i, generator: o }) {
  const s = wy(i), f = o?.(i);
  return f ? Ar(s, f) : s;
}
const dr = wy(Hr);
function nb(i) {
  const o = {
    variables: {},
    light: {},
    dark: {}
  };
  return se(i.variables).forEach((s) => {
    dr.variables[s] !== i.variables[s] && (o.variables[s] = i.variables[s]);
  }), se(i.light).forEach((s) => {
    dr.light[s] !== i.light[s] && (o.light[s] = i.light[s]);
  }), se(i.dark).forEach((s) => {
    dr.dark[s] !== i.dark[s] && (o.dark[s] = i.dark[s]);
  }), o;
}
function ub(i) {
  return Zy({
    variables: {},
    dark: { "--mantine-color-scheme": "dark" },
    light: { "--mantine-color-scheme": "light" }
  }, i);
}
function Ky({ cssVariablesSelector: i, deduplicateCssVariables: o }) {
  const s = xa(), f = Ur(), m = L1(), y = ab({
    theme: s,
    generator: m
  }), z = (i === void 0 || i === ":root" || i === ":host") && o, O = z ? nb(y) : y, C = Zy(O, i);
  return C ? /* @__PURE__ */ X.jsx("style", {
    "data-mantine-styles": !0,
    nonce: f?.(),
    dangerouslySetInnerHTML: { __html: `${C}${z ? "" : ub(i)}` }
  }) : null;
}
Ky.displayName = "@mantine/CssVariables";
function ib({ respectReducedMotion: i, getRootElement: o }) {
  qy(() => {
    i && o()?.setAttribute("data-respect-reduced-motion", "true");
  }, [i]);
}
function $y({ theme: i, children: o, getStyleNonce: s, withStaticClasses: f = !0, withGlobalClasses: m = !0, deduplicateCssVariables: y = !0, withCssVariables: z = !0, cssVariablesSelector: O, classNamesPrefix: C = "mantine", colorSchemeManager: j = j1(), defaultColorScheme: M = "light", getRootElement: S = () => document.documentElement, cssVariablesResolver: D, forceColorScheme: Q, stylesTransform: G, env: P, deduplicateInlineStyles: L = !1 }) {
  const { colorScheme: at, setColorScheme: tt, clearColorScheme: yt } = k1({
    defaultColorScheme: M,
    forceColorScheme: Q,
    manager: j,
    getRootElement: S
  });
  return ib({
    respectReducedMotion: i?.respectReducedMotion || !1,
    getRootElement: S
  }), /* @__PURE__ */ X.jsx(Qy, {
    value: {
      colorScheme: at,
      setColorScheme: tt,
      clearColorScheme: yt,
      getRootElement: S,
      classNamesPrefix: C,
      getStyleNonce: s,
      cssVariablesResolver: D,
      cssVariablesSelector: O ?? ":root",
      withStaticClasses: f,
      stylesTransform: G,
      env: P,
      deduplicateInlineStyles: L
    },
    children: /* @__PURE__ */ X.jsxs(Ly, {
      theme: i,
      children: [
        z && /* @__PURE__ */ X.jsx(Ky, {
          cssVariablesSelector: O,
          deduplicateCssVariables: y
        }),
        m && /* @__PURE__ */ X.jsx(eb, {}),
        o
      ]
    })
  });
}
$y.displayName = "@mantine/core/MantineProvider";
function Dl(i, o, s) {
  const f = xa(), m = (Array.isArray(i) ? i : [i]).filter(Boolean);
  let y = {};
  for (const z of m) {
    const O = f.components[z]?.defaultProps, C = typeof O == "function" ? O(f) : O;
    C && (y = {
      ...y,
      ...C
    });
  }
  return {
    ...o,
    ...y,
    ...Cr(s)
  };
}
function vp({ classNames: i, styles: o, props: s, stylesCtx: f }) {
  const m = xa();
  return {
    resolvedClassNames: i === void 0 ? void 0 : Du({
      theme: m,
      classNames: i,
      props: s,
      stylesCtx: f || void 0
    }),
    resolvedStyles: o === void 0 ? void 0 : gc({
      theme: m,
      styles: o,
      props: s,
      stylesCtx: f || void 0
    })
  };
}
const cb = {
  always: "mantine-focus-always",
  auto: "mantine-focus-auto",
  never: "mantine-focus-never"
};
function fb({ theme: i, options: o, unstyled: s }) {
  return Ha(o?.focusable && !s && (i.focusClassName || cb[i.focusRing]), o?.active && !s && i.activeClassName);
}
function Tr(i, o, s = 1) {
  if (Object.is(i, o)) return !0;
  if (s === 0 || typeof i != "object" || typeof o != "object" || i === null || o === null) return !1;
  if (Array.isArray(i) || Array.isArray(o)) {
    if (!Array.isArray(i) || !Array.isArray(o) || i.length !== o.length) return !1;
    for (let m = 0; m < i.length; m += 1) if (!Tr(i[m], o[m], s - 1)) return !1;
    return !0;
  }
  const f = Object.keys(i);
  if (f.length !== Object.keys(o).length) return !1;
  for (const m of f) if (!Object.hasOwn(o, m) || !Tr(i[m], o[m], s - 1)) return !1;
  return !0;
}
function ob({ selector: i, stylesCtx: o, options: s, props: f, theme: m }) {
  return Du({
    theme: m,
    classNames: s?.classNames,
    props: s?.props || f,
    stylesCtx: o
  })[i];
}
function rb({ selector: i, stylesCtx: o, theme: s, classNames: f, props: m }) {
  return Du({
    theme: s,
    classNames: f,
    props: m,
    stylesCtx: o
  })[i];
}
function sb({ rootSelector: i, selector: o, className: s }) {
  return i === o ? s : void 0;
}
function db({ selector: i, classes: o, unstyled: s }) {
  return s ? void 0 : o[i];
}
function mb({ themeName: i, classNamesPrefix: o, selector: s, withStaticClass: f }) {
  return f === !1 ? [] : i.map((m) => `${o}-${m}-${s}`);
}
function yb({ options: i, classes: o, selector: s, unstyled: f }) {
  return i?.variant && !f ? o[`${s}--${i.variant}`] : void 0;
}
function vb({ theme: i, options: o, themeName: s, selector: f, classNamesPrefix: m, resolvedClassNames: y, resolvedThemeClassNames: z, classes: O, unstyled: C, className: j, rootSelector: M, props: S, stylesCtx: D, withStaticClasses: Q, headless: G, transformedStyles: P }) {
  return Ha(fb({
    theme: i,
    options: o,
    unstyled: C || G
  }), z.map((L) => L[f]), yb({
    options: o,
    classes: O,
    selector: f,
    unstyled: C || G
  }), y[f], rb({
    selector: f,
    stylesCtx: D,
    theme: i,
    classNames: P,
    props: S
  }), ob({
    selector: f,
    stylesCtx: D,
    options: o,
    props: S,
    theme: i
  }), sb({
    rootSelector: M,
    selector: f,
    className: j
  }), db({
    selector: f,
    classes: O,
    unstyled: C || G
  }), Q && !G && mb({
    themeName: s,
    classNamesPrefix: m,
    selector: f,
    withStaticClass: o?.withStaticClass
  }), o?.className);
}
function jr({ style: i, theme: o }) {
  return Array.isArray(i) ? i.reduce((s, f) => ({
    ...s,
    ...jr({
      style: f,
      theme: o
    })
  }), {}) : typeof i == "function" ? i(o) : i ?? {};
}
function gb({ theme: i, selector: o, options: s, props: f, stylesCtx: m, rootSelector: y, withStylesTransform: z, resolvedStyles: O, resolvedThemeStyles: C, resolvedVars: j, resolvedRootStyle: M }) {
  return {
    ...C[o],
    ...O[o],
    ...!z && gc({
      theme: i,
      styles: s?.styles,
      props: s?.props || f,
      stylesCtx: m
    })[o],
    ...j[o],
    ...y === o ? M : null,
    ...jr({
      style: s?.style,
      theme: i
    })
  };
}
function hb(i) {
  return i.reduce((o, s) => (s && Object.keys(s).forEach((f) => {
    o[f] = {
      ...o[f],
      ...Cr(s[f])
    };
  }), o), {});
}
function bb({ props: i, stylesCtx: o, themeName: s, theme: f }) {
  const m = J1()?.();
  return {
    getTransformedStyles: (z) => m ? [...z.map((O) => m(O, {
      props: i,
      theme: f,
      ctx: o
    })), ...s.map((O) => m(f.components[O]?.styles, {
      props: i,
      theme: f,
      ctx: o
    }))].filter(Boolean) : [],
    withStylesTransform: !!m
  };
}
function Ll({ name: i, classes: o, props: s, stylesCtx: f, className: m, style: y, rootSelector: z = "root", unstyled: O, classNames: C, styles: j, vars: M, varsResolver: S, attributes: D, stable: Q }) {
  const G = xa(), P = Z1(), L = w1(), at = K1(), tt = (Array.isArray(i) ? i : [i]).filter((Ct) => Ct), { withStylesTransform: yt, getTransformedStyles: Ot } = bb({
    props: s,
    stylesCtx: f,
    themeName: tt,
    theme: G
  }), ft = Du({
    theme: G,
    classNames: C,
    props: s,
    stylesCtx: f
  }), pt = tt.map((Ct) => Du({
    theme: G,
    classNames: G.components[Ct]?.classNames,
    props: s,
    stylesCtx: f
  })), Y = yt ? {} : gc({
    theme: G,
    styles: j,
    props: s,
    stylesCtx: f
  }), Z = {};
  if (!yt) for (const Ct of tt) {
    const It = gc({
      theme: G,
      styles: G.components[Ct]?.styles,
      props: s,
      stylesCtx: f
    });
    for (const hl of Object.keys(It)) Z[hl] = {
      ...Z[hl],
      ...It[hl]
    };
  }
  const jt = hb([
    at ? {} : S?.(G, s, f),
    ...tt.map((Ct) => G.components?.[Ct]?.vars?.(G, s, f)),
    M?.(G, s, f)
  ]), Ht = jr({
    style: y,
    theme: G
  });
  return pb((Ct, It) => ({
    ...D?.[Ct],
    className: vb({
      theme: G,
      options: It,
      themeName: tt,
      selector: Ct,
      classNamesPrefix: P,
      resolvedClassNames: ft,
      resolvedThemeClassNames: pt,
      classes: o,
      unstyled: O,
      className: m,
      rootSelector: z,
      props: s,
      stylesCtx: f,
      withStaticClasses: L,
      headless: at,
      transformedStyles: Ot([It?.styles, j])
    }),
    style: gb({
      theme: G,
      selector: Ct,
      options: It,
      props: s,
      stylesCtx: f,
      rootSelector: z,
      withStylesTransform: yt,
      resolvedStyles: Y,
      resolvedThemeStyles: Z,
      resolvedVars: jt,
      resolvedRootStyle: Ht
    })
  }), !!Q, [
    G,
    P,
    L,
    at,
    yt ? s : null,
    o,
    O,
    m,
    z,
    D,
    f,
    ft,
    pt,
    Y,
    Z,
    jt,
    Ht
  ]);
}
function pb(i, o, s) {
  const f = ct.useRef(null);
  return o ? ((!f.current || !Tr(f.current.deps, s, 3)) && (f.current = {
    deps: s,
    getStyles: i
  }), f.current.getStyles) : i;
}
function Ru(i) {
  return se(i).reduce((o, s) => i[s] !== void 0 ? `${o}${T1(s)}:${i[s]};` : o, "").trim();
}
function Sb({ selector: i, styles: o, media: s, container: f }) {
  const m = o ? Ru(o) : "", y = Array.isArray(s) ? s.map((O) => `@media${O.query}{${i}{${Ru(O.styles)}}}`) : [], z = Array.isArray(f) ? f.map((O) => `@container ${O.query}{${i}{${Ru(O.styles)}}}`) : [];
  return `${m ? `${i}{${m}}` : ""}${y.join("")}${z.join("")}`.trim();
}
function Tb(i) {
  let o = 5381;
  for (let s = 0; s < i.length; s++) o = (o << 5) + o + i.charCodeAt(s) & 4294967295;
  return (o >>> 0).toString(36);
}
function Eb({ deduplicate: i, ...o }) {
  const s = Ur(), f = Sb(o);
  return i ? /* @__PURE__ */ X.jsx("style", {
    href: `mantine-${Tb(f)}`,
    precedence: "mantine",
    nonce: s?.(),
    children: f
  }) : /* @__PURE__ */ X.jsx("style", {
    "data-mantine-styles": "inline",
    nonce: s?.(),
    dangerouslySetInnerHTML: { __html: f }
  });
}
function _b(i) {
  let o = 5381;
  for (let s = 0; s < i.length; s++) o = (o << 5) + o + i.charCodeAt(s) & 4294967295;
  return (o >>> 0).toString(36);
}
function zb(i, o) {
  return `__mdi__-${_b(`${i ? Ru(i) : ""}|${Array.isArray(o) ? o.map((s) => `${s.query}:${Ru(s.styles)}`).join("|") : ""}`)}`;
}
function Ob(i) {
  const { m: o, mx: s, my: f, mt: m, mb: y, ml: z, mr: O, me: C, ms: j, mis: M, mie: S, p: D, px: Q, py: G, pt: P, pb: L, pl: at, pr: tt, pe: yt, ps: Ot, pis: ft, pie: pt, bd: Y, bdrs: Z, bg: jt, c: Ht, opacity: kt, ff: Ct, fz: It, fw: hl, lts: Gt, ta: x, lh: J, fs: W, tt: Tt, td: gt, w: bl, miw: Zl, maw: de, h: g, mih: R, mah: w, bgsz: K, bgp: st, bgr: dt, bga: vt, pos: V, top: k, left: wl, bottom: Un, right: Me, inset: Ul, display: wt, flex: Nt, hiddenFrom: Hl, visibleFrom: ia, lightHidden: Pl, darkHidden: ja, sx: Ba, ...Re } = i;
  return {
    styleProps: Cr({
      m: o,
      mx: s,
      my: f,
      mt: m,
      mb: y,
      ml: z,
      mr: O,
      me: C,
      ms: j,
      mis: M,
      mie: S,
      p: D,
      px: Q,
      py: G,
      pt: P,
      pb: L,
      pl: at,
      pr: tt,
      pis: ft,
      pie: pt,
      pe: yt,
      ps: Ot,
      bd: Y,
      bg: jt,
      c: Ht,
      opacity: kt,
      ff: Ct,
      fz: It,
      fw: hl,
      lts: Gt,
      ta: x,
      lh: J,
      fs: W,
      tt: Tt,
      td: gt,
      w: bl,
      miw: Zl,
      maw: de,
      h: g,
      mih: R,
      mah: w,
      bgsz: K,
      bgp: st,
      bgr: dt,
      bga: vt,
      pos: V,
      top: k,
      left: wl,
      bottom: Un,
      right: Me,
      inset: Ul,
      display: wt,
      flex: Nt,
      bdrs: Z,
      hiddenFrom: Hl,
      visibleFrom: ia,
      lightHidden: Pl,
      darkHidden: ja,
      sx: Ba
    }),
    rest: Re
  };
}
const Nb = {
  m: {
    type: "spacing",
    property: "margin"
  },
  mt: {
    type: "spacing",
    property: "marginTop"
  },
  mb: {
    type: "spacing",
    property: "marginBottom"
  },
  ml: {
    type: "spacing",
    property: "marginLeft"
  },
  mr: {
    type: "spacing",
    property: "marginRight"
  },
  ms: {
    type: "spacing",
    property: "marginInlineStart"
  },
  me: {
    type: "spacing",
    property: "marginInlineEnd"
  },
  mis: {
    type: "spacing",
    property: "marginInlineStart"
  },
  mie: {
    type: "spacing",
    property: "marginInlineEnd"
  },
  mx: {
    type: "spacing",
    property: "marginInline"
  },
  my: {
    type: "spacing",
    property: "marginBlock"
  },
  p: {
    type: "spacing",
    property: "padding"
  },
  pt: {
    type: "spacing",
    property: "paddingTop"
  },
  pb: {
    type: "spacing",
    property: "paddingBottom"
  },
  pl: {
    type: "spacing",
    property: "paddingLeft"
  },
  pr: {
    type: "spacing",
    property: "paddingRight"
  },
  ps: {
    type: "spacing",
    property: "paddingInlineStart"
  },
  pe: {
    type: "spacing",
    property: "paddingInlineEnd"
  },
  pis: {
    type: "spacing",
    property: "paddingInlineStart"
  },
  pie: {
    type: "spacing",
    property: "paddingInlineEnd"
  },
  px: {
    type: "spacing",
    property: "paddingInline"
  },
  py: {
    type: "spacing",
    property: "paddingBlock"
  },
  bd: {
    type: "border",
    property: "border"
  },
  bdrs: {
    type: "radius",
    property: "borderRadius"
  },
  bg: {
    type: "color",
    property: "background"
  },
  c: {
    type: "textColor",
    property: "color"
  },
  opacity: {
    type: "identity",
    property: "opacity"
  },
  ff: {
    type: "fontFamily",
    property: "fontFamily"
  },
  fz: {
    type: "fontSize",
    property: "fontSize"
  },
  fw: {
    type: "identity",
    property: "fontWeight"
  },
  lts: {
    type: "size",
    property: "letterSpacing"
  },
  ta: {
    type: "identity",
    property: "textAlign"
  },
  lh: {
    type: "lineHeight",
    property: "lineHeight"
  },
  fs: {
    type: "identity",
    property: "fontStyle"
  },
  tt: {
    type: "identity",
    property: "textTransform"
  },
  td: {
    type: "identity",
    property: "textDecoration"
  },
  w: {
    type: "spacing",
    property: "width"
  },
  miw: {
    type: "spacing",
    property: "minWidth"
  },
  maw: {
    type: "spacing",
    property: "maxWidth"
  },
  h: {
    type: "spacing",
    property: "height"
  },
  mih: {
    type: "spacing",
    property: "minHeight"
  },
  mah: {
    type: "spacing",
    property: "maxHeight"
  },
  bgsz: {
    type: "size",
    property: "backgroundSize"
  },
  bgp: {
    type: "identity",
    property: "backgroundPosition"
  },
  bgr: {
    type: "identity",
    property: "backgroundRepeat"
  },
  bga: {
    type: "identity",
    property: "backgroundAttachment"
  },
  pos: {
    type: "identity",
    property: "position"
  },
  top: {
    type: "size",
    property: "top"
  },
  left: {
    type: "size",
    property: "left"
  },
  bottom: {
    type: "size",
    property: "bottom"
  },
  right: {
    type: "size",
    property: "right"
  },
  inset: {
    type: "size",
    property: "inset"
  },
  display: {
    type: "identity",
    property: "display"
  },
  flex: {
    type: "identity",
    property: "flex"
  }
};
function Br(i, o) {
  const s = xu({
    color: i,
    theme: o
  });
  return s.color === "dimmed" ? "var(--mantine-color-dimmed)" : s.color === "bright" ? "var(--mantine-color-bright)" : s.variable ? `var(${s.variable})` : s.color;
}
function Ab(i, o) {
  const s = xu({
    color: i,
    theme: o
  });
  return s.isThemeColor && s.shade === void 0 ? `var(--mantine-color-${s.color}-text)` : Br(i, o);
}
function Cb(i, o) {
  if (typeof i == "number") return U(i);
  if (typeof i == "string") {
    const [s, f, ...m] = i.split(" ").filter((z) => z.trim() !== "");
    let y = `${U(s)}`;
    return f && (y += ` ${f}`), m.length > 0 && (y += ` ${Br(m.join(" "), o)}`), y.trim();
  }
  return i;
}
const Ny = {
  text: "var(--mantine-font-family)",
  mono: "var(--mantine-font-family-monospace)",
  monospace: "var(--mantine-font-family-monospace)",
  heading: "var(--mantine-font-family-headings)",
  headings: "var(--mantine-font-family-headings)"
};
function Mb(i) {
  return typeof i == "string" && i in Ny ? Ny[i] : i;
}
const Rb = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6"
];
function Db(i, o) {
  return typeof i == "string" && i in o.fontSizes ? `var(--mantine-font-size-${i})` : typeof i == "string" && Rb.includes(i) ? `var(--mantine-${i}-font-size)` : typeof i == "number" || typeof i == "string" ? U(i) : i;
}
function Ub(i) {
  return i;
}
const Hb = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6"
];
function xb(i, o) {
  return typeof i == "string" && i in o.lineHeights ? `var(--mantine-line-height-${i})` : typeof i == "string" && Hb.includes(i) ? `var(--mantine-${i}-line-height)` : i;
}
function jb(i, o) {
  return typeof i == "string" && i in o.radius ? `var(--mantine-radius-${i})` : typeof i == "number" || typeof i == "string" ? U(i) : i;
}
function Bb(i) {
  return typeof i == "number" ? U(i) : i;
}
function Yb(i, o) {
  if (typeof i == "number") return U(i);
  if (typeof i == "string") {
    const s = i.replace("-", "");
    if (!(s in o.spacing)) return U(i);
    const f = `--mantine-spacing-${s}`;
    return i.startsWith("-") ? `calc(var(${f}) * -1)` : `var(${f})`;
  }
  return i;
}
const mr = {
  color: Br,
  textColor: Ab,
  fontSize: Db,
  spacing: Yb,
  radius: jb,
  identity: Ub,
  size: Bb,
  lineHeight: xb,
  fontFamily: Mb,
  border: Cb
};
function Ay(i) {
  return i.replace("(min-width: ", "").replace("em)", "");
}
function qb({ media: i, ...o }) {
  const s = Object.keys(i).sort((f, m) => Number(Ay(f)) - Number(Ay(m))).map((f) => ({
    query: f,
    styles: i[f]
  }));
  return {
    ...o,
    media: s
  };
}
function Gb(i) {
  if (typeof i != "object" || i === null) return !1;
  const o = Object.keys(i);
  return !(o.length === 1 && o[0] === "base");
}
function Vb(i) {
  return typeof i == "object" && i !== null ? "base" in i ? i.base : void 0 : i;
}
function Xb(i) {
  return typeof i == "object" && i !== null ? se(i).filter((o) => o !== "base") : [];
}
function Qb(i, o) {
  return typeof i == "object" && i !== null && o in i ? i[o] : i;
}
function Lb({ styleProps: i, data: o, theme: s }) {
  return qb(se(i).reduce((f, m) => {
    if (m === "hiddenFrom" || m === "visibleFrom" || m === "sx") return f;
    const y = o[m], z = Array.isArray(y.property) ? y.property : [y.property], O = Vb(i[m]);
    if (!Gb(i[m]))
      return z.forEach((j) => {
        f.inlineStyles[j] = mr[y.type](O, s);
      }), f;
    f.hasResponsiveStyles = !0;
    const C = Xb(i[m]);
    return z.forEach((j) => {
      O != null && (f.styles[j] = mr[y.type](O, s)), C.forEach((M) => {
        const S = `(min-width: ${s.breakpoints[M]})`;
        f.media[S] = {
          ...f.media[S],
          [j]: mr[y.type](Qb(i[m], M), s)
        };
      });
    }), f;
  }, {
    hasResponsiveStyles: !1,
    styles: {},
    inlineStyles: {},
    media: {}
  }));
}
function Zb() {
  return `__m__-${ct.useId().replace(/[:«»]/g, "")}`;
}
function wb(i) {
  return i;
}
const Kb = wb;
function Jy(i) {
  return i;
}
function ua(i) {
  const o = i;
  return o.extend = Jy, o.withProps = (s) => {
    const f = (m) => /* @__PURE__ */ X.jsx(o, {
      ...s,
      ...m
    });
    return f.extend = o.extend, f.displayName = `WithProps(${o.displayName})`, f;
  }, o;
}
function gp(i) {
  return ua(i);
}
function ju(i) {
  const o = i;
  return o.withProps = (s) => {
    const f = (m) => /* @__PURE__ */ X.jsx(o, {
      ...s,
      ...m
    });
    return f.extend = o.extend, f.displayName = `WithProps(${o.displayName})`, f;
  }, o.extend = Jy, o;
}
function Fy(i) {
  return `data-${(i.startsWith("data-") ? i.slice(5) : i).replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}`;
}
function $b(i) {
  return Object.keys(i).reduce((o, s) => {
    const f = i[s];
    return f === void 0 || f === "" || f === !1 || f === null || (o[Fy(s)] = i[s]), o;
  }, {});
}
function Wy(i) {
  return i ? typeof i == "string" ? { [Fy(i)]: !0 } : Array.isArray(i) ? [...i].reduce((o, s) => ({
    ...o,
    ...Wy(s)
  }), {}) : $b(i) : null;
}
function Er(i, o) {
  return Array.isArray(i) ? [...i].reduce((s, f) => ({
    ...s,
    ...Er(f, o)
  }), {}) : typeof i == "function" ? i(o) : i ?? {};
}
function Jb({ theme: i, style: o, vars: s, styleProps: f }) {
  const m = Er(o, i), y = Er(s, i);
  return {
    ...m,
    ...y,
    ...f
  };
}
function ky({ component: i, style: o, __vars: s, className: f, variant: m, mod: y, size: z, hiddenFrom: O, visibleFrom: C, lightHidden: j, darkHidden: M, renderRoot: S, __size: D, ref: Q, ...G }) {
  const P = xa(), L = i || "div", { styleProps: at, rest: tt } = Ob(G), yt = $1()?.()?.(at.sx), Ot = Zb(), ft = Lb({
    styleProps: at,
    theme: P,
    data: Nb
  }), pt = W1(), Y = pt && ft.hasResponsiveStyles ? zb(ft.styles, ft.media) : Ot, Z = {
    ref: Q,
    style: Jb({
      theme: P,
      style: o,
      vars: s,
      styleProps: ft.inlineStyles
    }),
    className: Ha(f, yt, {
      [Y]: ft.hasResponsiveStyles,
      "mantine-light-hidden": j,
      "mantine-dark-hidden": M,
      [`mantine-hidden-from-${O}`]: O,
      [`mantine-visible-from-${C}`]: C
    }),
    "data-variant": m,
    "data-size": Yy(z) ? void 0 : z || void 0,
    size: D,
    ...Wy(y),
    ...tt
  };
  return /* @__PURE__ */ X.jsxs(X.Fragment, { children: [ft.hasResponsiveStyles && /* @__PURE__ */ X.jsx(Eb, {
    selector: `.${Y}`,
    styles: ft.styles,
    media: ft.media,
    deduplicate: pt
  }), typeof S == "function" ? S(Z) : /* @__PURE__ */ X.jsx(L, { ...Z })] });
}
ky.displayName = "@mantine/core/Box";
const Zt = Kb(ky);
var Iy = { root: "m_87cf2631" };
const Fb = { __staticSelector: "UnstyledButton" }, bc = ju((i) => {
  const o = Dl("UnstyledButton", Fb, i), { className: s, component: f = "button", __staticSelector: m, unstyled: y, classNames: z, styles: O, style: C, attributes: j, ...M } = o, S = Ll({
    name: m,
    props: o,
    classes: Iy,
    className: s,
    style: C,
    classNames: z,
    styles: O,
    unstyled: y,
    attributes: j
  });
  return /* @__PURE__ */ X.jsx(Zt, {
    ...S("root", { focusable: !0 }),
    component: f,
    type: f === "button" ? "button" : void 0,
    ...M
  });
});
bc.classes = Iy;
bc.displayName = "@mantine/core/UnstyledButton";
var Py = { root: "m_1b7284a3" };
const tv = (i, { radius: o, shadow: s }) => ({ root: {
  "--paper-radius": o === void 0 ? void 0 : Hu(o),
  "--paper-shadow": O1(s)
} }), Yr = ju((i) => {
  const o = Dl("Paper", null, i), { classNames: s, className: f, style: m, styles: y, unstyled: z, withBorder: O, vars: C, radius: j, shadow: M, variant: S, mod: D, attributes: Q, ...G } = o, P = Ll({
    name: "Paper",
    props: o,
    classes: Py,
    className: f,
    style: m,
    classNames: s,
    styles: y,
    unstyled: z,
    attributes: Q,
    vars: C,
    varsResolver: tv
  });
  return /* @__PURE__ */ X.jsx(Zt, {
    mod: [{ withBorder: O }, D],
    ...P("root"),
    variant: S,
    ...G
  });
});
Yr.classes = Py;
Yr.varsResolver = tv;
Yr.displayName = "@mantine/core/Paper";
const Cu = (i) => ({
  in: {
    opacity: 1,
    transform: "scale(1)"
  },
  out: {
    opacity: 0,
    transform: `scale(.9) translateY(${i === "bottom" ? 10 : -10}px)`
  },
  transitionProperty: "transform, opacity"
}), mc = {
  fade: {
    in: { opacity: 1 },
    out: { opacity: 0 },
    transitionProperty: "opacity"
  },
  "fade-up": {
    in: {
      opacity: 1,
      transform: "translateY(0)"
    },
    out: {
      opacity: 0,
      transform: "translateY(30px)"
    },
    transitionProperty: "opacity, transform"
  },
  "fade-down": {
    in: {
      opacity: 1,
      transform: "translateY(0)"
    },
    out: {
      opacity: 0,
      transform: "translateY(-30px)"
    },
    transitionProperty: "opacity, transform"
  },
  "fade-left": {
    in: {
      opacity: 1,
      transform: "translateX(0)"
    },
    out: {
      opacity: 0,
      transform: "translateX(30px)"
    },
    transitionProperty: "opacity, transform"
  },
  "fade-right": {
    in: {
      opacity: 1,
      transform: "translateX(0)"
    },
    out: {
      opacity: 0,
      transform: "translateX(-30px)"
    },
    transitionProperty: "opacity, transform"
  },
  scale: {
    in: {
      opacity: 1,
      transform: "scale(1)"
    },
    out: {
      opacity: 0,
      transform: "scale(0)"
    },
    common: { transformOrigin: "top" },
    transitionProperty: "transform, opacity"
  },
  "scale-y": {
    in: {
      opacity: 1,
      transform: "scaleY(1)"
    },
    out: {
      opacity: 0,
      transform: "scaleY(0)"
    },
    common: { transformOrigin: "top" },
    transitionProperty: "transform, opacity"
  },
  "scale-x": {
    in: {
      opacity: 1,
      transform: "scaleX(1)"
    },
    out: {
      opacity: 0,
      transform: "scaleX(0)"
    },
    common: { transformOrigin: "left" },
    transitionProperty: "transform, opacity"
  },
  "skew-up": {
    in: {
      opacity: 1,
      transform: "translateY(0) skew(0deg, 0deg)"
    },
    out: {
      opacity: 0,
      transform: "translateY(-20px) skew(-10deg, -5deg)"
    },
    common: { transformOrigin: "top" },
    transitionProperty: "transform, opacity"
  },
  "skew-down": {
    in: {
      opacity: 1,
      transform: "translateY(0) skew(0deg, 0deg)"
    },
    out: {
      opacity: 0,
      transform: "translateY(20px) skew(-10deg, -5deg)"
    },
    common: { transformOrigin: "bottom" },
    transitionProperty: "transform, opacity"
  },
  "rotate-left": {
    in: {
      opacity: 1,
      transform: "translateY(0) rotate(0deg)"
    },
    out: {
      opacity: 0,
      transform: "translateY(20px) rotate(-5deg)"
    },
    common: { transformOrigin: "bottom" },
    transitionProperty: "transform, opacity"
  },
  "rotate-right": {
    in: {
      opacity: 1,
      transform: "translateY(0) rotate(0deg)"
    },
    out: {
      opacity: 0,
      transform: "translateY(20px) rotate(5deg)"
    },
    common: { transformOrigin: "top" },
    transitionProperty: "transform, opacity"
  },
  "slide-down": {
    in: {
      opacity: 1,
      transform: "translateY(0)"
    },
    out: {
      opacity: 0,
      transform: "translateY(-100%)"
    },
    common: { transformOrigin: "top" },
    transitionProperty: "transform, opacity"
  },
  "slide-up": {
    in: {
      opacity: 1,
      transform: "translateY(0)"
    },
    out: {
      opacity: 0,
      transform: "translateY(100%)"
    },
    common: { transformOrigin: "bottom" },
    transitionProperty: "transform, opacity"
  },
  "slide-left": {
    in: {
      opacity: 1,
      transform: "translateX(0)"
    },
    out: {
      opacity: 0,
      transform: "translateX(100%)"
    },
    common: { transformOrigin: "left" },
    transitionProperty: "transform, opacity"
  },
  "slide-right": {
    in: {
      opacity: 1,
      transform: "translateX(0)"
    },
    out: {
      opacity: 0,
      transform: "translateX(-100%)"
    },
    common: { transformOrigin: "right" },
    transitionProperty: "transform, opacity"
  },
  pop: {
    ...Cu("bottom"),
    common: { transformOrigin: "center center" }
  },
  "pop-bottom-left": {
    ...Cu("bottom"),
    common: { transformOrigin: "bottom left" }
  },
  "pop-bottom-right": {
    ...Cu("bottom"),
    common: { transformOrigin: "bottom right" }
  },
  "pop-top-left": {
    ...Cu("top"),
    common: { transformOrigin: "top left" }
  },
  "pop-top-right": {
    ...Cu("top"),
    common: { transformOrigin: "top right" }
  }
}, Cy = {
  entering: "in",
  entered: "in",
  exiting: "out",
  exited: "out",
  "pre-exiting": "out",
  "pre-entering": "out"
};
function My({ transition: i, state: o, duration: s, timingFunction: f }) {
  const m = {
    WebkitBackfaceVisibility: "hidden",
    transitionDuration: `${s}ms`,
    transitionTimingFunction: f
  };
  return typeof i == "string" ? i in mc ? {
    transitionProperty: mc[i].transitionProperty,
    ...m,
    ...mc[i].common,
    ...mc[i][Cy[o]]
  } : {} : {
    transitionProperty: i.transitionProperty,
    ...m,
    ...i.common,
    ...i[Cy[o]]
  };
}
function Wb({ duration: i, exitDuration: o, timingFunction: s, mounted: f, onEnter: m, onExit: y, onEntered: z, onExited: O, enterDelay: C, exitDelay: j }) {
  const M = xa(), S = R1(), D = M.respectReducedMotion ? S : !1, [Q, G] = ct.useState(D ? 0 : i), [P, L] = ct.useState(f ? "entered" : "exited"), at = ct.useRef(-1), tt = ct.useRef(-1), yt = ct.useRef(-1);
  function Ot() {
    window.clearTimeout(at.current), window.clearTimeout(tt.current), cancelAnimationFrame(yt.current);
  }
  const ft = (Y) => {
    Ot();
    const Z = Y ? m : y, jt = Y ? z : O, Ht = D ? 0 : Y ? i : o;
    G(Ht), Ht === 0 ? (typeof Z == "function" && Z(), typeof jt == "function" && jt(), L(Y ? "entered" : "exited")) : yt.current = requestAnimationFrame(() => {
      U1.flushSync(() => {
        L(Y ? "pre-entering" : "pre-exiting");
      }), yt.current = requestAnimationFrame(() => {
        typeof Z == "function" && Z(), L(Y ? "entering" : "exiting"), at.current = window.setTimeout(() => {
          typeof jt == "function" && jt(), L(Y ? "entered" : "exited");
        }, Ht);
      });
    });
  }, pt = (Y) => {
    if (Ot(), typeof (Y ? C : j) != "number") {
      ft(Y);
      return;
    }
    tt.current = window.setTimeout(() => {
      ft(Y);
    }, Y ? C : j);
  };
  return M1(() => {
    pt(f);
  }, [f]), ct.useEffect(() => () => {
    Ot();
  }, []), {
    transitionDuration: Q,
    transitionStatus: P,
    transitionTimingFunction: s || "ease"
  };
}
function qr({ keepMounted: i, keepMountedMode: o = "activity", transition: s = "fade", duration: f = 250, exitDuration: m = f, mounted: y, children: z, timingFunction: O = "ease", onExit: C, onEntered: j, onEnter: M, onExited: S, enterDelay: D, exitDelay: Q }) {
  const G = F1(), { transitionDuration: P, transitionStatus: L, transitionTimingFunction: at } = Wb({
    mounted: y,
    exitDuration: m,
    duration: f,
    timingFunction: O,
    onExit: C,
    onEntered: j,
    onEnter: M,
    onExited: S,
    enterDelay: D,
    exitDelay: Q
  });
  if (G === "test") return y ? /* @__PURE__ */ X.jsx(X.Fragment, { children: z({}) }) : i ? z({ display: "none" }) : null;
  if (P === 0)
    return i ? o === "display-none" ? y ? /* @__PURE__ */ X.jsx(X.Fragment, { children: z({}) }) : z({ display: "none" }) : /* @__PURE__ */ X.jsx(ct.Activity, {
      mode: y ? "visible" : "hidden",
      children: z({})
    }) : y ? /* @__PURE__ */ X.jsx(X.Fragment, { children: z({}) }) : null;
  const tt = L === "exited";
  if (i) {
    const yt = z(tt ? o === "display-none" ? { display: "none" } : {} : My({
      transition: s,
      duration: P,
      state: L,
      timingFunction: at
    }));
    return o === "display-none" ? yt : /* @__PURE__ */ X.jsx(ct.Activity, {
      mode: tt ? "hidden" : "visible",
      children: yt
    });
  }
  return tt ? null : /* @__PURE__ */ X.jsx(X.Fragment, { children: z(My({
    transition: s,
    duration: P,
    state: L,
    timingFunction: at
  })) });
}
qr.displayName = "@mantine/core/Transition";
var Il = {
  root: "m_5ae2e3c",
  barsLoader: "m_7a2bd4cd",
  bar: "m_870bb79",
  "bars-loader-animation": "m_5d2b3b9d",
  dotsLoader: "m_4e3f22d7",
  dot: "m_870c4af",
  "loader-dots-animation": "m_aac34a1",
  ovalLoader: "m_b34414df",
  "oval-loader-animation": "m_f8e89c4b"
};
const lv = ({ className: i, ...o }) => /* @__PURE__ */ X.jsxs(Zt, {
  component: "span",
  className: Ha(Il.barsLoader, i),
  ...o,
  children: [
    /* @__PURE__ */ X.jsx("span", { className: Il.bar }),
    /* @__PURE__ */ X.jsx("span", { className: Il.bar }),
    /* @__PURE__ */ X.jsx("span", { className: Il.bar })
  ]
});
lv.displayName = "@mantine/core/Bars";
const ev = ({ className: i, ...o }) => /* @__PURE__ */ X.jsxs(Zt, {
  component: "span",
  className: Ha(Il.dotsLoader, i),
  ...o,
  children: [
    /* @__PURE__ */ X.jsx("span", { className: Il.dot }),
    /* @__PURE__ */ X.jsx("span", { className: Il.dot }),
    /* @__PURE__ */ X.jsx("span", { className: Il.dot })
  ]
});
ev.displayName = "@mantine/core/Dots";
const av = ({ className: i, ...o }) => /* @__PURE__ */ X.jsx(Zt, {
  component: "span",
  className: Ha(Il.ovalLoader, i),
  ...o
});
av.displayName = "@mantine/core/Oval";
const nv = {
  bars: lv,
  oval: av,
  dots: ev
}, kb = {
  loaders: nv,
  type: "oval"
}, uv = (i, { size: o, color: s }) => ({ root: {
  "--loader-size": Rl(o, "loader-size"),
  "--loader-color": s ? br(s, i) : void 0
} }), Mn = ua((i) => {
  const o = Dl("Loader", kb, i), { size: s, color: f, type: m, vars: y, className: z, style: O, classNames: C, styles: j, unstyled: M, loaders: S, variant: D, children: Q, attributes: G, ...P } = o, L = Ll({
    name: "Loader",
    props: o,
    classes: Il,
    className: z,
    style: O,
    classNames: C,
    styles: j,
    unstyled: M,
    attributes: G,
    vars: y,
    varsResolver: uv
  });
  return Q ? /* @__PURE__ */ X.jsx(Zt, {
    ...L("root"),
    ...P,
    children: Q
  }) : /* @__PURE__ */ X.jsx(Zt, {
    ...L("root"),
    component: S[m],
    variant: D,
    size: s,
    ...P
  });
});
Mn.defaultLoaders = nv;
Mn.classes = Il;
Mn.varsResolver = uv;
Mn.displayName = "@mantine/core/Loader";
var Rn = {
  root: "m_8d3f4000",
  icon: "m_8d3afb97",
  loader: "m_302b9fb1",
  group: "m_1a0f1b21",
  groupSection: "m_437b6484"
};
const Ib = { orientation: "horizontal" }, iv = (i, { borderWidth: o }) => ({ group: { "--ai-border-width": U(o) } }), pc = ua((i) => {
  const o = Dl("ActionIconGroup", Ib, i), { className: s, style: f, classNames: m, styles: y, unstyled: z, orientation: O, vars: C, borderWidth: j, variant: M, mod: S, attributes: D, ...Q } = o, G = Ll({
    name: "ActionIconGroup",
    props: o,
    classes: Rn,
    className: s,
    style: f,
    classNames: m,
    styles: y,
    unstyled: z,
    attributes: D,
    vars: C,
    varsResolver: iv,
    rootSelector: "group"
  });
  return /* @__PURE__ */ X.jsx(Zt, {
    ...G("group"),
    variant: M,
    mod: [{ orientation: O }, S],
    role: "group",
    ...Q
  });
});
pc.classes = Rn;
pc.varsResolver = iv;
pc.displayName = "@mantine/core/ActionIconGroup";
const cv = (i, { radius: o, color: s, gradient: f, variant: m, autoContrast: y, size: z }) => {
  const O = i.variantColorResolver({
    color: s || i.primaryColor,
    theme: i,
    gradient: f,
    variant: m || "filled",
    autoContrast: y
  });
  return { groupSection: {
    "--section-height": Rl(z, "section-height"),
    "--section-padding-x": Rl(z, "section-padding-x"),
    "--section-fz": Cn(z),
    "--section-radius": o === void 0 ? void 0 : Hu(o),
    "--section-bg": s || m ? O.background : void 0,
    "--section-color": O.color,
    "--section-bd": s || m ? O.border : void 0
  } };
}, Sc = ua((i) => {
  const o = Dl("ActionIconGroupSection", null, i), { className: s, style: f, classNames: m, styles: y, unstyled: z, vars: O, variant: C, gradient: j, radius: M, autoContrast: S, attributes: D, ...Q } = o, G = Ll({
    name: "ActionIconGroupSection",
    props: o,
    classes: Rn,
    className: s,
    style: f,
    classNames: m,
    styles: y,
    unstyled: z,
    attributes: D,
    vars: O,
    varsResolver: cv,
    rootSelector: "groupSection"
  });
  return /* @__PURE__ */ X.jsx(Zt, {
    ...G("groupSection"),
    variant: C,
    ...Q
  });
});
Sc.classes = Rn;
Sc.varsResolver = cv;
Sc.displayName = "@mantine/core/ActionIconGroupSection";
const fv = (i, { size: o, radius: s, variant: f, gradient: m, color: y, autoContrast: z }) => {
  const O = i.variantColorResolver({
    color: y || i.primaryColor,
    theme: i,
    gradient: m,
    variant: f || "filled",
    autoContrast: z
  });
  return { root: {
    "--ai-size": Rl(o, "ai-size"),
    "--ai-radius": s === void 0 ? void 0 : Hu(s),
    "--ai-bg": y || f ? O.background : void 0,
    "--ai-hover": y || f ? O.hover : void 0,
    "--ai-hover-color": y || f ? O.hoverColor : void 0,
    "--ai-color": O.color,
    "--ai-bd": y || f ? O.border : void 0
  } };
}, Bu = ju((i) => {
  const o = Dl("ActionIcon", null, i), { className: s, unstyled: f, variant: m, classNames: y, styles: z, style: O, loading: C, loaderProps: j, size: M, color: S, radius: D, __staticSelector: Q, gradient: G, vars: P, children: L, disabled: at, "data-disabled": tt, autoContrast: yt, mod: Ot, attributes: ft, ...pt } = o, Y = Ll({
    name: ["ActionIcon", Q],
    props: o,
    className: s,
    style: O,
    classes: Rn,
    classNames: y,
    styles: z,
    unstyled: f,
    attributes: ft,
    vars: P,
    varsResolver: fv
  });
  return /* @__PURE__ */ X.jsxs(bc, {
    ...Y("root", { active: !at && !C && !tt }),
    "aria-busy": C || void 0,
    ...pt,
    unstyled: f,
    variant: m,
    size: M,
    disabled: at || C,
    mod: [{
      loading: C,
      disabled: at || tt
    }, Ot],
    children: [typeof C == "boolean" && /* @__PURE__ */ X.jsx(qr, {
      mounted: C,
      transition: "slide-down",
      duration: 150,
      children: (Z) => /* @__PURE__ */ X.jsx(Zt, {
        component: "span",
        ...Y("loader", { style: Z }),
        "aria-hidden": !0,
        children: /* @__PURE__ */ X.jsx(Mn, {
          color: "var(--ai-color)",
          size: "calc(var(--ai-size) * 0.55)",
          ...j
        })
      })
    }), /* @__PURE__ */ X.jsx(Zt, {
      component: "span",
      mod: { loading: C },
      ...Y("icon"),
      children: L
    })]
  });
});
Bu.classes = Rn;
Bu.varsResolver = fv;
Bu.displayName = "@mantine/core/ActionIcon";
Bu.Group = pc;
Bu.GroupSection = Sc;
function Pb(i) {
  return ct.Children.toArray(i).filter(Boolean);
}
var ov = { root: "m_4081bf90" };
const tp = {
  preventGrowOverflow: !0,
  gap: "md",
  align: "center",
  justify: "flex-start",
  wrap: "wrap"
}, rv = (i, { grow: o, preventGrowOverflow: s, gap: f, align: m, justify: y, wrap: z }, { childWidth: O }) => ({ root: {
  "--group-child-width": o && s ? O : void 0,
  "--group-gap": Mr(f),
  "--group-align": m,
  "--group-justify": y,
  "--group-wrap": z
} }), Gr = ua((i) => {
  const o = Dl("Group", tp, i), { classNames: s, className: f, style: m, styles: y, unstyled: z, children: O, gap: C, align: j, justify: M, wrap: S, grow: D, preventGrowOverflow: Q, vars: G, variant: P, __size: L, mod: at, attributes: tt, ...yt } = o, Ot = Pb(O), ft = Ot.length, pt = Mr(C ?? "md"), Y = { childWidth: `calc(${100 / ft}% - (${pt} - ${pt} / ${ft}))` }, Z = Ll({
    name: "Group",
    props: o,
    stylesCtx: Y,
    className: f,
    style: m,
    classes: ov,
    classNames: s,
    styles: y,
    unstyled: z,
    attributes: tt,
    vars: G,
    varsResolver: rv
  });
  return /* @__PURE__ */ X.jsx(Zt, {
    ...Z("root"),
    variant: P,
    mod: [{ grow: D }, at],
    size: L,
    ...yt,
    children: Ot
  });
});
Gr.classes = ov;
Gr.varsResolver = rv;
Gr.displayName = "@mantine/core/Group";
var sv = { root: "m_b6d8b162" };
function lp(i) {
  if (i === "start") return "start";
  if (i === "end" || i) return "end";
}
const ep = { inherit: !1 }, dv = (i, { variant: o, lineClamp: s, gradient: f, size: m, textWrap: y }) => ({ root: {
  "--text-fz": Cn(m),
  "--text-lh": z1(m),
  "--text-gradient": o === "gradient" ? pr(f, i) : void 0,
  "--text-line-clamp": typeof s == "number" ? s.toString() : void 0,
  "--text-text-wrap": y
} }), Vr = ju((i) => {
  const o = Dl("Text", ep, i), { lineClamp: s, truncate: f, inline: m, inherit: y, gradient: z, span: O, textWrap: C, __staticSelector: j, vars: M, className: S, style: D, classNames: Q, styles: G, unstyled: P, variant: L, mod: at, size: tt, attributes: yt, ...Ot } = o, ft = Ll({
    name: ["Text", j],
    props: o,
    classes: sv,
    className: S,
    style: D,
    classNames: Q,
    styles: G,
    unstyled: P,
    attributes: yt,
    vars: M,
    varsResolver: dv
  });
  return /* @__PURE__ */ X.jsx(Zt, {
    ...ft("root", { focusable: !0 }),
    component: O ? "span" : "p",
    variant: L,
    mod: [{
      truncate: lp(f),
      lineClamp: typeof s == "number",
      inline: m,
      inherit: y
    }, at],
    size: tt,
    ...Ot
  });
});
Vr.classes = sv;
Vr.varsResolver = dv;
Vr.displayName = "@mantine/core/Text";
var Dn = {
  root: "m_77c9d27d",
  inner: "m_80f1301b",
  label: "m_811560b9",
  section: "m_a74036a",
  loader: "m_a25b86ee",
  group: "m_80d6d844",
  groupSection: "m_70be2a01"
};
const Ry = { orientation: "horizontal" }, mv = (i, { borderWidth: o }) => ({ group: { "--button-border-width": U(o) } }), Tc = ua((i) => {
  const o = Dl("ButtonGroup", Ry, i), { className: s, style: f, classNames: m, styles: y, unstyled: z, orientation: O, vars: C, borderWidth: j, mod: M, attributes: S, ...D } = Dl("ButtonGroup", Ry, i), Q = Ll({
    name: "ButtonGroup",
    props: o,
    classes: Dn,
    className: s,
    style: f,
    classNames: m,
    styles: y,
    unstyled: z,
    attributes: S,
    vars: C,
    varsResolver: mv,
    rootSelector: "group"
  });
  return /* @__PURE__ */ X.jsx(Zt, {
    ...Q("group"),
    mod: [{ orientation: O }, M],
    role: "group",
    ...D
  });
});
Tc.classes = Dn;
Tc.varsResolver = mv;
Tc.displayName = "@mantine/core/ButtonGroup";
const yv = (i, { radius: o, color: s, gradient: f, variant: m, autoContrast: y, size: z }) => {
  const O = i.variantColorResolver({
    color: s || i.primaryColor,
    theme: i,
    gradient: f,
    variant: m || "filled",
    autoContrast: y
  });
  return { groupSection: {
    "--section-height": Rl(z, "section-height"),
    "--section-padding-x": Rl(z, "section-padding-x"),
    "--section-fz": z?.includes("compact") ? Cn(z.replace("compact-", "")) : Cn(z),
    "--section-radius": o === void 0 ? void 0 : Hu(o),
    "--section-bg": s || m ? O.background : void 0,
    "--section-color": O.color,
    "--section-bd": s || m ? O.border : void 0
  } };
}, Ec = ua((i) => {
  const o = Dl("ButtonGroupSection", null, i), { className: s, style: f, classNames: m, styles: y, unstyled: z, vars: O, gradient: C, radius: j, autoContrast: M, attributes: S, ...D } = o, Q = Ll({
    name: "ButtonGroupSection",
    props: o,
    classes: Dn,
    className: s,
    style: f,
    classNames: m,
    styles: y,
    unstyled: z,
    attributes: S,
    vars: O,
    varsResolver: yv,
    rootSelector: "groupSection"
  });
  return /* @__PURE__ */ X.jsx(Zt, {
    ...Q("groupSection"),
    ...D
  });
});
Ec.classes = Dn;
Ec.varsResolver = yv;
Ec.displayName = "@mantine/core/ButtonGroupSection";
const ap = {
  in: {
    opacity: 1,
    transform: `translate(-50%, calc(-50% + ${U(1)}))`
  },
  out: {
    opacity: 0,
    transform: "translate(-50%, -200%)"
  },
  common: { transformOrigin: "center" },
  transitionProperty: "transform, opacity"
}, vv = (i, { radius: o, color: s, gradient: f, variant: m, size: y, justify: z, autoContrast: O }) => {
  const C = i.variantColorResolver({
    color: s || i.primaryColor,
    theme: i,
    gradient: f,
    variant: m || "filled",
    autoContrast: O
  });
  return { root: {
    "--button-justify": z,
    "--button-height": Rl(y, "button-height"),
    "--button-padding-x": Rl(y, "button-padding-x"),
    "--button-fz": y?.includes("compact") ? Cn(y.replace("compact-", "")) : Cn(y),
    "--button-radius": o === void 0 ? void 0 : Hu(o),
    "--button-bg": s || m ? C.background : void 0,
    "--button-hover": s || m ? C.hover : void 0,
    "--button-color": C.color,
    "--button-bd": s || m ? C.border : void 0,
    "--button-hover-color": s || m ? C.hoverColor : void 0
  } };
}, Yu = ju((i) => {
  const o = Dl("Button", null, i), { style: s, vars: f, className: m, color: y, disabled: z, children: O, leftSection: C, rightSection: j, fullWidth: M, variant: S, radius: D, loading: Q, loaderProps: G, gradient: P, classNames: L, styles: at, unstyled: tt, "data-disabled": yt, autoContrast: Ot, mod: ft, attributes: pt, ...Y } = o, Z = Ll({
    name: "Button",
    props: o,
    classes: Dn,
    className: m,
    style: s,
    classNames: L,
    styles: at,
    unstyled: tt,
    attributes: pt,
    vars: f,
    varsResolver: vv
  }), jt = !!C, Ht = !!j;
  return /* @__PURE__ */ X.jsxs(bc, {
    ...Z("root", { active: !z && !Q && !yt }),
    unstyled: tt,
    variant: S,
    disabled: z || Q,
    mod: [{
      disabled: z || yt,
      loading: Q,
      block: M,
      "with-left-section": jt,
      "with-right-section": Ht
    }, ft],
    ...Y,
    children: [typeof Q == "boolean" && /* @__PURE__ */ X.jsx(qr, {
      mounted: Q,
      transition: ap,
      duration: 150,
      children: (kt) => /* @__PURE__ */ X.jsx(Zt, {
        component: "span",
        ...Z("loader", { style: kt }),
        "aria-hidden": !0,
        children: /* @__PURE__ */ X.jsx(Mn, {
          color: "var(--button-color)",
          size: "calc(var(--button-height) / 1.8)",
          ...G
        })
      })
    }), /* @__PURE__ */ X.jsxs("span", {
      ...Z("inner"),
      children: [
        C && /* @__PURE__ */ X.jsx(Zt, {
          component: "span",
          ...Z("section"),
          mod: { position: "left" },
          children: C
        }),
        /* @__PURE__ */ X.jsx(Zt, {
          component: "span",
          mod: { loading: Q },
          ...Z("label"),
          children: O
        }),
        j && /* @__PURE__ */ X.jsx(Zt, {
          component: "span",
          ...Z("section"),
          mod: { position: "right" },
          children: j
        })
      ]
    })]
  });
});
Yu.classes = Dn;
Yu.varsResolver = vv;
Yu.displayName = "@mantine/core/Button";
Yu.Group = Tc;
Yu.GroupSection = Ec;
var gv = { root: "m_6d731127" };
const np = {
  gap: "md",
  align: "stretch",
  justify: "flex-start"
}, hv = (i, { gap: o, align: s, justify: f }) => ({ root: {
  "--stack-gap": Mr(o),
  "--stack-align": s,
  "--stack-justify": f
} }), Xr = ua((i) => {
  const o = Dl("Stack", np, i), { classNames: s, className: f, style: m, styles: y, unstyled: z, vars: O, align: C, justify: j, gap: M, variant: S, attributes: D, ...Q } = o, G = Ll({
    name: "Stack",
    props: o,
    classes: gv,
    className: f,
    style: m,
    classNames: s,
    styles: y,
    unstyled: z,
    attributes: D,
    vars: O,
    varsResolver: hv
  });
  return /* @__PURE__ */ X.jsx(Zt, {
    ...G("root"),
    variant: S,
    ...Q
  });
});
Xr.classes = gv;
Xr.varsResolver = hv;
Xr.displayName = "@mantine/core/Stack";
var yr = { exports: {} }, Mu = {}, vr = { exports: {} }, gr = {};
var Dy;
function up() {
  return Dy || (Dy = 1, (function(i) {
    function o(x, J) {
      var W = x.length;
      x.push(J);
      t: for (; 0 < W; ) {
        var Tt = W - 1 >>> 1, gt = x[Tt];
        if (0 < m(gt, J))
          x[Tt] = J, x[W] = gt, W = Tt;
        else break t;
      }
    }
    function s(x) {
      return x.length === 0 ? null : x[0];
    }
    function f(x) {
      if (x.length === 0) return null;
      var J = x[0], W = x.pop();
      if (W !== J) {
        x[0] = W;
        t: for (var Tt = 0, gt = x.length, bl = gt >>> 1; Tt < bl; ) {
          var Zl = 2 * (Tt + 1) - 1, de = x[Zl], g = Zl + 1, R = x[g];
          if (0 > m(de, W))
            g < gt && 0 > m(R, de) ? (x[Tt] = R, x[g] = W, Tt = g) : (x[Tt] = de, x[Zl] = W, Tt = Zl);
          else if (g < gt && 0 > m(R, W))
            x[Tt] = R, x[g] = W, Tt = g;
          else break t;
        }
      }
      return J;
    }
    function m(x, J) {
      var W = x.sortIndex - J.sortIndex;
      return W !== 0 ? W : x.id - J.id;
    }
    if (i.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
      var y = performance;
      i.unstable_now = function() {
        return y.now();
      };
    } else {
      var z = Date, O = z.now();
      i.unstable_now = function() {
        return z.now() - O;
      };
    }
    var C = [], j = [], M = 1, S = null, D = 3, Q = !1, G = !1, P = !1, L = !1, at = typeof setTimeout == "function" ? setTimeout : null, tt = typeof clearTimeout == "function" ? clearTimeout : null, yt = typeof setImmediate < "u" ? setImmediate : null;
    function Ot(x) {
      for (var J = s(j); J !== null; ) {
        if (J.callback === null) f(j);
        else if (J.startTime <= x)
          f(j), J.sortIndex = J.expirationTime, o(C, J);
        else break;
        J = s(j);
      }
    }
    function ft(x) {
      if (P = !1, Ot(x), !G)
        if (s(C) !== null)
          G = !0, pt || (pt = !0, Ct());
        else {
          var J = s(j);
          J !== null && Gt(ft, J.startTime - x);
        }
    }
    var pt = !1, Y = -1, Z = 5, jt = -1;
    function Ht() {
      return L ? !0 : !(i.unstable_now() - jt < Z);
    }
    function kt() {
      if (L = !1, pt) {
        var x = i.unstable_now();
        jt = x;
        var J = !0;
        try {
          t: {
            G = !1, P && (P = !1, tt(Y), Y = -1), Q = !0;
            var W = D;
            try {
              l: {
                for (Ot(x), S = s(C); S !== null && !(S.expirationTime > x && Ht()); ) {
                  var Tt = S.callback;
                  if (typeof Tt == "function") {
                    S.callback = null, D = S.priorityLevel;
                    var gt = Tt(
                      S.expirationTime <= x
                    );
                    if (x = i.unstable_now(), typeof gt == "function") {
                      S.callback = gt, Ot(x), J = !0;
                      break l;
                    }
                    S === s(C) && f(C), Ot(x);
                  } else f(C);
                  S = s(C);
                }
                if (S !== null) J = !0;
                else {
                  var bl = s(j);
                  bl !== null && Gt(
                    ft,
                    bl.startTime - x
                  ), J = !1;
                }
              }
              break t;
            } finally {
              S = null, D = W, Q = !1;
            }
            J = void 0;
          }
        } finally {
          J ? Ct() : pt = !1;
        }
      }
    }
    var Ct;
    if (typeof yt == "function")
      Ct = function() {
        yt(kt);
      };
    else if (typeof MessageChannel < "u") {
      var It = new MessageChannel(), hl = It.port2;
      It.port1.onmessage = kt, Ct = function() {
        hl.postMessage(null);
      };
    } else
      Ct = function() {
        at(kt, 0);
      };
    function Gt(x, J) {
      Y = at(function() {
        x(i.unstable_now());
      }, J);
    }
    i.unstable_IdlePriority = 5, i.unstable_ImmediatePriority = 1, i.unstable_LowPriority = 4, i.unstable_NormalPriority = 3, i.unstable_Profiling = null, i.unstable_UserBlockingPriority = 2, i.unstable_cancelCallback = function(x) {
      x.callback = null;
    }, i.unstable_forceFrameRate = function(x) {
      0 > x || 125 < x ? console.error(
        "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
      ) : Z = 0 < x ? Math.floor(1e3 / x) : 5;
    }, i.unstable_getCurrentPriorityLevel = function() {
      return D;
    }, i.unstable_next = function(x) {
      switch (D) {
        case 1:
        case 2:
        case 3:
          var J = 3;
          break;
        default:
          J = D;
      }
      var W = D;
      D = J;
      try {
        return x();
      } finally {
        D = W;
      }
    }, i.unstable_requestPaint = function() {
      L = !0;
    }, i.unstable_runWithPriority = function(x, J) {
      switch (x) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          x = 3;
      }
      var W = D;
      D = x;
      try {
        return J();
      } finally {
        D = W;
      }
    }, i.unstable_scheduleCallback = function(x, J, W) {
      var Tt = i.unstable_now();
      switch (typeof W == "object" && W !== null ? (W = W.delay, W = typeof W == "number" && 0 < W ? Tt + W : Tt) : W = Tt, x) {
        case 1:
          var gt = -1;
          break;
        case 2:
          gt = 250;
          break;
        case 5:
          gt = 1073741823;
          break;
        case 4:
          gt = 1e4;
          break;
        default:
          gt = 5e3;
      }
      return gt = W + gt, x = {
        id: M++,
        callback: J,
        priorityLevel: x,
        startTime: W,
        expirationTime: gt,
        sortIndex: -1
      }, W > Tt ? (x.sortIndex = W, o(j, x), s(C) === null && x === s(j) && (P ? (tt(Y), Y = -1) : P = !0, Gt(ft, W - Tt))) : (x.sortIndex = gt, o(C, x), G || Q || (G = !0, pt || (pt = !0, Ct()))), x;
    }, i.unstable_shouldYield = Ht, i.unstable_wrapCallback = function(x) {
      var J = D;
      return function() {
        var W = D;
        D = J;
        try {
          return x.apply(this, arguments);
        } finally {
          D = W;
        }
      };
    };
  })(gr)), gr;
}
var Uy;
function ip() {
  return Uy || (Uy = 1, vr.exports = up()), vr.exports;
}
var Hy;
function cp() {
  if (Hy) return Mu;
  Hy = 1;
  var i = ip(), o = Nr(), s = Gy();
  function f(t) {
    var l = "https://react.dev/errors/" + t;
    if (1 < arguments.length) {
      l += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var e = 2; e < arguments.length; e++)
        l += "&args[]=" + encodeURIComponent(arguments[e]);
    }
    return "Minified React error #" + t + "; visit " + l + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function m(t) {
    return !(!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11);
  }
  function y(t) {
    for (var l = t, e = l; e && !e.alternate; )
      l = e, (l.flags & 4098) !== 0 && (t = l.return), e = l.return;
    for (; l.return; ) l = l.return;
    return l.tag === 3 ? t : null;
  }
  function z(t) {
    if (t.tag === 13) {
      var l = t.memoizedState;
      if (l === null && (t = t.alternate, t !== null && (l = t.memoizedState)), l !== null) return l.dehydrated;
    }
    return null;
  }
  function O(t) {
    if (t.tag === 31) {
      var l = t.memoizedState;
      if (l === null && (t = t.alternate, t !== null && (l = t.memoizedState)), l !== null) return l.dehydrated;
    }
    return null;
  }
  function C(t) {
    if (y(t) !== t)
      throw Error(f(188));
  }
  function j(t) {
    var l = t.alternate;
    if (!l) {
      if (l = y(t), l === null) throw Error(f(188));
      return l !== t ? null : t;
    }
    for (var e = t, a = l; ; ) {
      var n = e.return;
      if (n === null) break;
      var u = n.alternate;
      if (u === null) {
        if (a = n.return, a !== null) {
          e = a;
          continue;
        }
        break;
      }
      if (n.child === u.child) {
        for (u = n.child; u; ) {
          if (u === e) return C(n), t;
          if (u === a) return C(n), l;
          u = u.sibling;
        }
        throw Error(f(188));
      }
      if (e.return !== a.return) e = n, a = u;
      else {
        for (var c = !1, r = n.child; r; ) {
          if (r === e) {
            c = !0, e = n, a = u;
            break;
          }
          if (r === a) {
            c = !0, a = n, e = u;
            break;
          }
          r = r.sibling;
        }
        if (!c) {
          for (r = u.child; r; ) {
            if (r === e) {
              c = !0, e = u, a = n;
              break;
            }
            if (r === a) {
              c = !0, a = u, e = n;
              break;
            }
            r = r.sibling;
          }
          if (!c) throw Error(f(189));
        }
      }
      if (e.alternate !== a) throw Error(f(190));
    }
    if (e.tag !== 3) throw Error(f(188));
    return e.stateNode.current === e ? t : l;
  }
  function M(t) {
    var l = t.tag;
    if (l === 5 || l === 26 || l === 27 || l === 6) return t;
    for (t = t.child; t !== null; ) {
      if (l = M(t), l !== null) return l;
      t = t.sibling;
    }
    return null;
  }
  function S(t, l, e, a, n, u) {
    for (; t !== null; ) {
      if ((t.tag === 5 || t.tag === 27 || t.tag === 6) && e(t, a, n, u) || (t.tag !== 22 || t.memoizedState === null) && (l || t.tag !== 5 && t.tag !== 27) && S(
        t.child,
        l,
        e,
        a,
        n,
        u
      ))
        return !0;
      t = t.sibling;
    }
    return !1;
  }
  function D(t) {
    for (t = t.return; t !== null; ) {
      if (t.tag === 3 || t.tag === 5 || t.tag === 27) return t;
      t = t.return;
    }
    return null;
  }
  function Q(t) {
    var l = !1;
    for (t = t.return; t !== null && (t.tag === 4 && (l = !0), !(t.tag === 3 || t.tag === 5 || t.tag === 27)); )
      t = t.return;
    return l;
  }
  function G(t) {
    var l = [null, null], e = D(t);
    return e === null || P(
      l,
      t,
      e.child,
      { foundSelf: !1 }
    ), l;
  }
  function P(t, l, e, a) {
    for (; e !== null; ) {
      if (e === l) a.foundSelf = !0;
      else if (e.tag === 5 || e.tag === 27 || e.tag === 6) {
        if (a.foundSelf) return t[1] = e, !0;
        t[0] = e;
      } else if ((e.tag !== 22 || e.memoizedState === null) && P(
        t,
        l,
        e.child,
        a
      ))
        return !0;
      e = e.sibling;
    }
    return !1;
  }
  function L(t) {
    switch (t.tag) {
      case 5:
      case 27:
      case 6:
        return t.stateNode;
      case 3:
        return t.stateNode.containerInfo;
      default:
        throw Error(f(559));
    }
  }
  var at = null, tt = null;
  function yt(t, l, e) {
    return t === e ? !0 : t === l ? (at = t, !0) : !1;
  }
  function Ot(t, l, e) {
    return t === e ? (tt = t, !1) : t === l ? (tt !== null && (at = t), !0) : !1;
  }
  function ft(t) {
    if (t === null) return null;
    do
      t = t === null ? null : t.return;
    while (t && t.tag !== 5 && t.tag !== 27 && t.tag !== 3);
    return t || null;
  }
  function pt(t, l, e) {
    for (var a = 0, n = t; n; n = e(n)) a++;
    n = 0;
    for (var u = l; u; u = e(u)) n++;
    for (; 0 < a - n; ) t = e(t), a--;
    for (; 0 < n - a; ) l = e(l), n--;
    for (; a--; ) {
      if (t === l || l !== null && t === l.alternate)
        return t;
      t = e(t), l = e(l);
    }
    return null;
  }
  var Y = Object.assign, Z = /* @__PURE__ */ Symbol.for("react.element"), jt = /* @__PURE__ */ Symbol.for("react.transitional.element"), Ht = /* @__PURE__ */ Symbol.for("react.portal"), kt = /* @__PURE__ */ Symbol.for("react.fragment"), Ct = /* @__PURE__ */ Symbol.for("react.strict_mode"), It = /* @__PURE__ */ Symbol.for("react.profiler"), hl = /* @__PURE__ */ Symbol.for("react.consumer"), Gt = /* @__PURE__ */ Symbol.for("react.context"), x = /* @__PURE__ */ Symbol.for("react.forward_ref"), J = /* @__PURE__ */ Symbol.for("react.suspense"), W = /* @__PURE__ */ Symbol.for("react.suspense_list"), Tt = /* @__PURE__ */ Symbol.for("react.memo"), gt = /* @__PURE__ */ Symbol.for("react.lazy"), bl = /* @__PURE__ */ Symbol.for("react.activity"), Zl = /* @__PURE__ */ Symbol.for("react.legacy_hidden"), de = /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel"), g = /* @__PURE__ */ Symbol.for("react.view_transition"), R = /* @__PURE__ */ Symbol.for("react.recoverable"), w = Symbol.iterator;
  function K(t) {
    return t === null || typeof t != "object" ? null : (t = w && t[w] || t["@@iterator"], typeof t == "function" ? t : null);
  }
  var st = /* @__PURE__ */ Symbol.for("react.client.reference");
  function dt(t) {
    if (t == null) return null;
    if (typeof t == "function")
      return t.$$typeof === st ? null : t.displayName || t.name || null;
    if (typeof t == "string") return t;
    switch (t) {
      case kt:
        return "Fragment";
      case It:
        return "Profiler";
      case Ct:
        return "StrictMode";
      case J:
        return "Suspense";
      case W:
        return "SuspenseList";
      case bl:
        return "Activity";
      case g:
        return "ViewTransition";
    }
    if (typeof t == "object")
      switch (t.$$typeof) {
        case Ht:
          return "Portal";
        case Gt:
          return t.displayName || "Context";
        case hl:
          return (t._context.displayName || "Context") + ".Consumer";
        case x:
          var l = t.render;
          return t = t.displayName, t || (t = l.displayName || l.name || "", t = t !== "" ? "ForwardRef(" + t + ")" : "ForwardRef"), t;
        case Tt:
          return l = t.displayName || null, l !== null ? l : dt(t.type) || "Memo";
        case gt:
          l = t._payload, t = t._init;
          try {
            return dt(t(l));
          } catch {
          }
      }
    return null;
  }
  var vt = Array.isArray, V = o.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, k = s.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, wl = {
    pending: !1,
    data: null,
    method: null,
    action: null
  }, Un = [], Me = -1;
  function Ul(t) {
    return { current: t };
  }
  function wt(t) {
    0 > Me || (t.current = Un[Me], Un[Me] = null, Me--);
  }
  function Nt(t, l) {
    Me++, Un[Me] = t.current, t.current = l;
  }
  var Hl = Ul(null), ia = Ul(null), Pl = Ul(null), ja = Ul(null);
  function Ba(t, l) {
    switch (Nt(Pl, l), Nt(ia, t), Nt(Hl, null), l.nodeType) {
      case 9:
      case 11:
        t = (t = l.documentElement) && (t = t.namespaceURI) ? T0(t) : 0;
        break;
      default:
        if (t = l.tagName, l = l.namespaceURI)
          l = T0(l), t = E0(l, t);
        else
          switch (t) {
            case "svg":
              t = 1;
              break;
            case "math":
              t = 2;
              break;
            default:
              t = 0;
          }
    }
    wt(Hl), Nt(Hl, t);
  }
  function Re() {
    wt(Hl), wt(ia), wt(Pl);
  }
  function _c(t) {
    var l = t.memoizedState;
    l !== null && (zn._currentValue = l.memoizedState, Nt(ja, t)), l = Hl.current;
    var e = E0(l, t.type);
    l !== e && (Nt(ia, t), Nt(Hl, e));
  }
  function qu(t) {
    ia.current === t && (wt(Hl), wt(ia)), ja.current === t && (wt(ja), zn._currentValue = wl);
  }
  var zc, Qr;
  function De(t) {
    if (zc === void 0)
      try {
        throw Error();
      } catch (e) {
        var l = e.stack.trim().match(/\n( *(at )?)/);
        zc = l && l[1] || "", Qr = -1 < e.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < e.stack.indexOf("@") ? "@unknown:0:0" : "";
      }
    return `
` + zc + t + Qr;
  }
  var Oc = !1;
  function Nc(t, l) {
    if (!t || Oc) return "";
    Oc = !0;
    var e = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      var a = {
        DetermineComponentFrameRoot: function() {
          try {
            if (l) {
              var A = function() {
                throw Error();
              };
              if (Object.defineProperty(A.prototype, "props", {
                set: function() {
                  throw Error();
                }
              }), typeof Reflect == "object" && Reflect.construct) {
                try {
                  Reflect.construct(A, []);
                } catch (H) {
                  var h = H;
                }
                Reflect.construct(t, [], A);
              } else {
                try {
                  A.call();
                } catch (H) {
                  h = H;
                }
                A = !1;
                try {
                  var E = Object.getOwnPropertyDescriptor(
                    t.prototype,
                    "props"
                  );
                  Object.defineProperty(t.prototype, "props", {
                    configurable: !0,
                    set: function() {
                      throw Error();
                    }
                  }), A = !0, new t();
                } finally {
                  A && (E !== void 0 ? Object.defineProperty(t.prototype, "props", E) : delete t.prototype.props);
                }
              }
            } else {
              try {
                throw Error();
              } catch (H) {
                h = H;
              }
              (A = t()) && typeof A.catch == "function" && A.catch(function() {
              });
            }
          } catch (H) {
            if (H && h && typeof H.stack == "string")
              return [H.stack, h.stack];
          }
          return [null, null];
        }
      };
      a.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
      var n = Object.getOwnPropertyDescriptor(
        a.DetermineComponentFrameRoot,
        "name"
      );
      n && n.configurable && Object.defineProperty(
        a.DetermineComponentFrameRoot,
        "name",
        { value: "DetermineComponentFrameRoot" }
      );
      var u = a.DetermineComponentFrameRoot(), c = u[0], r = u[1];
      if (c && r) {
        var d = c.split(`
`), p = r.split(`
`);
        for (n = a = 0; a < d.length && !d[a].includes("DetermineComponentFrameRoot"); )
          a++;
        for (; n < p.length && !p[n].includes(
          "DetermineComponentFrameRoot"
        ); )
          n++;
        if (a === d.length || n === p.length)
          for (a = d.length - 1, n = p.length - 1; 1 <= a && 0 <= n && d[a] !== p[n]; )
            n--;
        for (; 1 <= a && 0 <= n; a--, n--)
          if (d[a] !== p[n]) {
            if (a !== 1 || n !== 1)
              do
                if (a--, n--, 0 > n || d[a] !== p[n]) {
                  var _ = `
` + d[a].replace(" at new ", " at ");
                  return t.displayName && _.includes("<anonymous>") && (_ = _.replace("<anonymous>", t.displayName)), _;
                }
              while (1 <= a && 0 <= n);
            break;
          }
      }
    } finally {
      Oc = !1, Error.prepareStackTrace = e;
    }
    return (e = t ? t.displayName || t.name : "") ? De(e) : "";
  }
  function Sv(t, l) {
    switch (t.tag) {
      case 26:
      case 27:
      case 5:
        return De(t.type);
      case 16:
        return De("Lazy");
      case 13:
        return t.child !== l && l !== null ? De("Suspense Fallback") : De("Suspense");
      case 19:
        return De("SuspenseList");
      case 0:
      case 15:
        return Nc(t.type, !1);
      case 11:
        return Nc(t.type.render, !1);
      case 1:
        return Nc(t.type, !0);
      case 31:
        return De("Activity");
      case 30:
        return De("ViewTransition");
      default:
        return "";
    }
  }
  function Lr(t) {
    try {
      var l = "", e = null;
      do
        l += Sv(t, e), e = t, t = t.return;
      while (t);
      return l;
    } catch (a) {
      return `
Error generating stack: ` + a.message + `
` + a.stack;
    }
  }
  var Ac = Object.prototype.hasOwnProperty, Cc = i.unstable_scheduleCallback, Mc = i.unstable_cancelCallback, Tv = i.unstable_shouldYield, Ev = i.unstable_requestPaint, pl = i.unstable_now, _v = i.unstable_getCurrentPriorityLevel, Zr = i.unstable_ImmediatePriority, wr = i.unstable_UserBlockingPriority, Gu = i.unstable_NormalPriority, zv = i.unstable_LowPriority, Kr = i.unstable_IdlePriority, Ov = i.log, Nv = i.unstable_setDisableYieldValue, Hn = null, Sl = null;
  function Ue(t) {
    if (typeof Ov == "function" && Nv(t), Sl && typeof Sl.setStrictMode == "function")
      try {
        Sl.setStrictMode(Hn, t);
      } catch {
      }
  }
  var Tl = Math.clz32 ? Math.clz32 : Mv, Av = Math.log, Cv = Math.LN2;
  function Mv(t) {
    return t >>>= 0, t === 0 ? 32 : 31 - (Av(t) / Cv | 0) | 0;
  }
  var Vu = 256, Xu = 262144, Qu = 4194304;
  function ca(t) {
    var l = t & 42;
    if (l !== 0) return l;
    switch (t & -t) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
        return 64;
      case 128:
        return 128;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
        return t & -t;
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return t & 3932160;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return t & 62914560;
      case 67108864:
        return 67108864;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 0;
      default:
        return t;
    }
  }
  function Lu(t, l, e) {
    var a = t.pendingLanes;
    if (a === 0) return 0;
    var n = 0, u = t.suspendedLanes, c = t.pingedLanes;
    t = t.warmLanes;
    var r = a & 134217727;
    return r !== 0 ? (a = r & ~u, a !== 0 ? n = ca(a) : (c &= r, c !== 0 ? n = ca(c) : e || (e = r & ~t, e !== 0 && (n = ca(e))))) : (r = a & ~u, r !== 0 ? n = ca(r) : c !== 0 ? n = ca(c) : e || (e = a & ~t, e !== 0 && (n = ca(e)))), n === 0 ? 0 : l !== 0 && l !== n && (l & u) === 0 && (u = n & -n, e = l & -l, u >= e || u === 32 && (e & 4194048) !== 0) ? l : n;
  }
  function xn(t, l) {
    return (t.pendingLanes & ~(t.suspendedLanes & ~t.pingedLanes) & l) === 0;
  }
  function $r(t, l) {
    (l & 8) !== 0 && (l |= l & 32);
    var e = t.entangledLanes;
    if (e !== 0)
      for (t = t.entanglements, e &= l; 0 < e; ) {
        var a = 31 - Tl(e), n = 1 << a;
        l |= t[a], e &= ~n;
      }
    return l;
  }
  function Rv(t, l) {
    switch (t) {
      case 1:
      case 2:
      case 4:
      case 8:
      case 64:
        return l + 250;
      case 16:
      case 32:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return l + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return -1;
      case 67108864:
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function Jr() {
    var t = Qu;
    return Qu <<= 1, (Qu & 62914560) === 0 && (Qu = 4194304), t;
  }
  function Rc(t) {
    for (var l = [], e = 0; 31 > e; e++) l.push(t);
    return l;
  }
  function jn(t, l) {
    t.pendingLanes |= l, l !== 268435456 && (t.suspendedLanes = 0, t.pingedLanes = 0, t.warmLanes = 0);
  }
  function Dv(t, l, e, a, n, u) {
    var c = t.pendingLanes;
    t.pendingLanes = e, t.suspendedLanes = 0, t.pingedLanes = 0, t.warmLanes = 0, t.expiredLanes &= e, t.entangledLanes &= e, t.errorRecoveryDisabledLanes &= e, t.shellSuspendCounter = 0;
    var r = t.entanglements, d = t.expirationTimes, p = t.hiddenUpdates;
    for (e = c & ~e; 0 < e; ) {
      var _ = 31 - Tl(e), A = 1 << _;
      r[_] = 0, d[_] = -1;
      var h = p[_];
      if (h !== null)
        for (p[_] = null, _ = 0; _ < h.length; _++) {
          var E = h[_];
          E !== null && (E.lane &= -536870913);
        }
      e &= ~A;
    }
    a !== 0 && Fr(t, a, 0), u !== 0 && n === 0 && t.tag !== 0 && (t.suspendedLanes |= u & ~(c & ~l));
  }
  function Fr(t, l, e) {
    t.pendingLanes |= l, t.suspendedLanes &= ~l;
    var a = 31 - Tl(l);
    t.entangledLanes |= l, t.entanglements[a] = t.entanglements[a] | 1073741824 | e & 261930;
  }
  function Wr(t, l) {
    var e = t.entangledLanes |= l;
    for (t = t.entanglements; e; ) {
      var a = 31 - Tl(e), n = 1 << a;
      n & l | t[a] & l && (t[a] |= l), e &= ~n;
    }
  }
  function kr(t, l) {
    var e = l & -l;
    return e = (e & 42) !== 0 ? 1 : Dc(e), (e & (t.suspendedLanes | l)) !== 0 ? 0 : e;
  }
  function Dc(t) {
    switch (t) {
      case 2:
        t = 1;
        break;
      case 8:
        t = 4;
        break;
      case 32:
        t = 16;
        break;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        t = 128;
        break;
      case 268435456:
        t = 134217728;
        break;
      default:
        t = 0;
    }
    return t;
  }
  function Uc(t) {
    return t &= -t, 2 < t ? 8 < t ? (t & 134217727) !== 0 ? 32 : 268435456 : 8 : 2;
  }
  function Ir() {
    var t = k.p;
    return t !== 0 ? t : (t = window.event, t === void 0 ? 32 : uy(t.type));
  }
  function Pr(t, l) {
    var e = k.p;
    try {
      return k.p = t, l();
    } finally {
      k.p = e;
    }
  }
  var me = Math.random().toString(36).slice(2), Pt = "__reactFiber$" + me, sl = "__reactProps$" + me, Ya = "__reactContainer$" + me, ts = "__reactEvents$" + me, Uv = "__reactListeners$" + me, Hv = "__reactHandles$" + me, ls = "__reactResources$" + me, Bn = "__reactMarker$" + me, Zu = "__reactLoad$" + me;
  function wu(t) {
    delete t[Pt], delete t[sl], delete t[Uv], delete t[Hv];
  }
  function fa(t) {
    var l;
    if (l = t[Pt]) return l;
    for (var e = t.parentNode; e; ) {
      if (l = e[Ya] || e[Pt]) {
        if (e = l.alternate, l.child !== null || e !== null && e.child !== null)
          for (t = G0(t); t !== null; ) {
            if (e = t[Pt]) return e;
            t = G0(t);
          }
        return l;
      }
      t = e, e = t.parentNode;
    }
    return null;
  }
  function qa(t) {
    if (t = t[Pt] || t[Ya]) {
      var l = t.tag;
      if (l === 5 || l === 6 || l === 13 || l === 31 || l === 26 || l === 27 || l === 3)
        return t;
    }
    return null;
  }
  function Yn(t) {
    var l = t.tag;
    if (l === 5 || l === 26 || l === 27 || l === 6) return t.stateNode;
    throw Error(f(33));
  }
  function Ga(t) {
    var l = t[ls];
    return l || (l = t[ls] = { hoistableStyles: /* @__PURE__ */ new Map(), hoistableScripts: /* @__PURE__ */ new Map() }), l;
  }
  function $t(t) {
    t[Bn] = !0;
  }
  function es(t) {
    t[Zu] = void 0;
  }
  var as = /* @__PURE__ */ new Set(), ns = {};
  function oa(t, l) {
    Va(t, l), Va(t + "Capture", l);
  }
  function Va(t, l) {
    for (ns[t] = l, t = 0; t < l.length; t++)
      as.add(l[t]);
  }
  var xv = RegExp(
    "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
  ), us = {}, is = {};
  function jv(t) {
    return Ac.call(is, t) ? !0 : Ac.call(us, t) ? !1 : xv.test(t) ? is[t] = !0 : (us[t] = !0, !1);
  }
  var ht = !1;
  function cs() {
    var t = ht;
    return ht = !1, t;
  }
  function Ku(t, l, e) {
    if (jv(l))
      if (e === null) t.removeAttribute(l);
      else {
        switch (typeof e) {
          case "undefined":
          case "function":
          case "symbol":
            t.removeAttribute(l);
            return;
          case "boolean":
            var a = l.toLowerCase().slice(0, 5);
            if (a !== "data-" && a !== "aria-") {
              t.removeAttribute(l);
              return;
            }
        }
        t.setAttribute(l, e);
      }
  }
  function $u(t, l, e) {
    if (e === null) t.removeAttribute(l);
    else {
      switch (typeof e) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          t.removeAttribute(l);
          return;
      }
      t.setAttribute(l, e);
    }
  }
  function ye(t, l, e, a) {
    if (a === null) t.removeAttribute(e);
    else {
      switch (typeof a) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          t.removeAttribute(e);
          return;
      }
      t.setAttributeNS(l, e, a);
    }
  }
  function El(t) {
    switch (typeof t) {
      case "bigint":
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return t;
      case "object":
        return t;
      default:
        return "";
    }
  }
  function fs(t) {
    var l = t.type;
    return (t = t.nodeName) && t.toLowerCase() === "input" && (l === "checkbox" || l === "radio");
  }
  function Bv(t, l, e) {
    var a = Object.getOwnPropertyDescriptor(
      t.constructor.prototype,
      l
    );
    if (!t.hasOwnProperty(l) && typeof a < "u" && typeof a.get == "function" && typeof a.set == "function") {
      var n = a.get, u = a.set;
      return Object.defineProperty(t, l, {
        configurable: !0,
        get: function() {
          return n.call(this);
        },
        set: function(c) {
          e = "" + c, u.call(this, c);
        }
      }), Object.defineProperty(t, l, {
        enumerable: a.enumerable
      }), {
        getValue: function() {
          return e;
        },
        setValue: function(c) {
          e = "" + c;
        },
        stopTracking: function() {
          t._valueTracker = null, delete t[l];
        }
      };
    }
  }
  function Hc(t) {
    if (!t._valueTracker) {
      var l = fs(t) ? "checked" : "value";
      t._valueTracker = Bv(
        t,
        l,
        "" + t[l]
      );
    }
  }
  function os(t) {
    if (!t) return !1;
    var l = t._valueTracker;
    if (!l) return !0;
    var e = l.getValue(), a = "";
    return t && (a = fs(t) ? t.checked ? "true" : "false" : t.value), t = a, t !== e ? (l.setValue(t), !0) : !1;
  }
  var Yv = /[\n"\\]/g;
  function xl(t) {
    return t.replace(
      Yv,
      function(l) {
        return "\\" + l.charCodeAt(0).toString(16) + " ";
      }
    );
  }
  function xc(t, l, e, a, n, u, c, r) {
    t.name = "", c != null && typeof c != "function" && typeof c != "symbol" && typeof c != "boolean" ? t.type = c : t.removeAttribute("type"), l != null ? c === "number" ? (l === 0 && t.value === "" || t.value != l) && (t.value = "" + El(l)) : t.value !== "" + El(l) && (t.value = "" + El(l)) : c !== "submit" && c !== "reset" || t.removeAttribute("value"), l != null ? c === "number" && t.value == l ? jc(t, El(t.value)) : jc(t, El(l)) : e != null ? jc(t, El(e)) : a != null && t.removeAttribute("value"), n == null && u != null && (t.defaultChecked = !!u), n != null && (t.checked = n && typeof n != "function" && typeof n != "symbol"), r != null && typeof r != "function" && typeof r != "symbol" && typeof r != "boolean" ? t.name = "" + El(r) : t.removeAttribute("name");
  }
  function rs(t, l, e, a, n, u, c, r) {
    if (u != null && typeof u != "function" && typeof u != "symbol" && typeof u != "boolean" && (t.type = u), l != null || e != null) {
      if (!(u !== "submit" && u !== "reset" || l != null)) {
        Hc(t);
        return;
      }
      e = e != null ? "" + El(e) : "", l = l != null ? "" + El(l) : e, r || l === t.value || (t.value = l), t.defaultValue = l;
    }
    a = a ?? n, a = typeof a != "function" && typeof a != "symbol" && !!a, t.checked = r ? t.checked : !!a, t.defaultChecked = !!a, c != null && typeof c != "function" && typeof c != "symbol" && typeof c != "boolean" && (t.name = c), Hc(t);
  }
  function jc(t, l) {
    t.defaultValue !== "" + l && (t.defaultValue = "" + l);
  }
  function Xa(t, l, e, a) {
    if (t = t.options, l) {
      l = {};
      for (var n = 0; n < e.length; n++)
        l["$" + e[n]] = !0;
      for (e = 0; e < t.length; e++)
        n = l.hasOwnProperty("$" + t[e].value), t[e].selected !== n && (t[e].selected = n), n && a && (t[e].defaultSelected = !0);
    } else {
      for (e = "" + El(e), l = null, n = 0; n < t.length; n++) {
        if (t[n].value === e) {
          t[n].selected = !0, a && (t[n].defaultSelected = !0);
          return;
        }
        l !== null || t[n].disabled || (l = t[n]);
      }
      l !== null && (l.selected = !0);
    }
  }
  function ss(t, l, e) {
    if (l != null && (l = "" + El(l), l !== t.value && (t.value = l), e == null)) {
      t.defaultValue !== l && (t.defaultValue = l);
      return;
    }
    t.defaultValue = e != null ? "" + El(e) : "";
  }
  function ds(t, l, e, a) {
    if (l == null) {
      if (a != null) {
        if (e != null) throw Error(f(92));
        if (vt(a)) {
          if (1 < a.length) throw Error(f(93));
          a = a[0];
        }
        e = a;
      }
      e == null && (e = ""), l = e;
    }
    e = El(l), t.defaultValue = e, a = t.textContent, a === e && a !== "" && a !== null && (t.value = a), Hc(t);
  }
  function Qa(t, l) {
    if (l) {
      var e = t.firstChild;
      if (e && e === t.lastChild && e.nodeType === 3) {
        e.nodeValue = l;
        return;
      }
    }
    t.textContent = l;
  }
  var qv = new Set(
    "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
      " "
    )
  );
  function ms(t, l, e) {
    var a = l.indexOf("--") === 0;
    e == null || typeof e == "boolean" || e === "" ? a ? t.setProperty(l, "") : l === "float" ? t.cssFloat = "" : t[l] = "" : a ? t.setProperty(l, e) : typeof e != "number" || e === 0 || qv.has(l) ? l === "float" ? t.cssFloat = e : t[l] = ("" + e).trim() : t[l] = e + "px";
  }
  function ys(t, l, e) {
    if (l != null && typeof l != "object")
      throw Error(f(62));
    if (t = t.style, e != null) {
      for (var a in e)
        !e.hasOwnProperty(a) || l != null && l.hasOwnProperty(a) || (a.indexOf("--") === 0 ? t.setProperty(a, "") : a === "float" ? t.cssFloat = "" : t[a] = "", ht = !0);
      for (var n in l)
        a = l[n], l.hasOwnProperty(n) && e[n] !== a && (ms(t, n, a), ht = !0);
    } else
      for (var u in l)
        l.hasOwnProperty(u) && ms(t, u, l[u]);
  }
  function Bc(t) {
    if (t.indexOf("-") === -1) return !1;
    switch (t) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;
      default:
        return !0;
    }
  }
  var Gv = /* @__PURE__ */ new Map([
    ["acceptCharset", "accept-charset"],
    ["htmlFor", "for"],
    ["httpEquiv", "http-equiv"],
    ["crossOrigin", "crossorigin"],
    ["accentHeight", "accent-height"],
    ["alignmentBaseline", "alignment-baseline"],
    ["arabicForm", "arabic-form"],
    ["baselineShift", "baseline-shift"],
    ["capHeight", "cap-height"],
    ["clipPath", "clip-path"],
    ["clipRule", "clip-rule"],
    ["colorInterpolation", "color-interpolation"],
    ["colorInterpolationFilters", "color-interpolation-filters"],
    ["colorProfile", "color-profile"],
    ["colorRendering", "color-rendering"],
    ["dominantBaseline", "dominant-baseline"],
    ["enableBackground", "enable-background"],
    ["fillOpacity", "fill-opacity"],
    ["fillRule", "fill-rule"],
    ["floodColor", "flood-color"],
    ["floodOpacity", "flood-opacity"],
    ["fontFamily", "font-family"],
    ["fontSize", "font-size"],
    ["fontSizeAdjust", "font-size-adjust"],
    ["fontStretch", "font-stretch"],
    ["fontStyle", "font-style"],
    ["fontVariant", "font-variant"],
    ["fontWeight", "font-weight"],
    ["glyphName", "glyph-name"],
    ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
    ["glyphOrientationVertical", "glyph-orientation-vertical"],
    ["horizAdvX", "horiz-adv-x"],
    ["horizOriginX", "horiz-origin-x"],
    ["imageRendering", "image-rendering"],
    ["letterSpacing", "letter-spacing"],
    ["lightingColor", "lighting-color"],
    ["markerEnd", "marker-end"],
    ["markerMid", "marker-mid"],
    ["markerStart", "marker-start"],
    ["maskType", "mask-type"],
    ["overlinePosition", "overline-position"],
    ["overlineThickness", "overline-thickness"],
    ["paintOrder", "paint-order"],
    ["panose-1", "panose-1"],
    ["pointerEvents", "pointer-events"],
    ["renderingIntent", "rendering-intent"],
    ["shapeRendering", "shape-rendering"],
    ["stopColor", "stop-color"],
    ["stopOpacity", "stop-opacity"],
    ["strikethroughPosition", "strikethrough-position"],
    ["strikethroughThickness", "strikethrough-thickness"],
    ["strokeDasharray", "stroke-dasharray"],
    ["strokeDashoffset", "stroke-dashoffset"],
    ["strokeLinecap", "stroke-linecap"],
    ["strokeLinejoin", "stroke-linejoin"],
    ["strokeMiterlimit", "stroke-miterlimit"],
    ["strokeOpacity", "stroke-opacity"],
    ["strokeWidth", "stroke-width"],
    ["textAnchor", "text-anchor"],
    ["textDecoration", "text-decoration"],
    ["textRendering", "text-rendering"],
    ["transformOrigin", "transform-origin"],
    ["underlinePosition", "underline-position"],
    ["underlineThickness", "underline-thickness"],
    ["unicodeBidi", "unicode-bidi"],
    ["unicodeRange", "unicode-range"],
    ["unitsPerEm", "units-per-em"],
    ["vAlphabetic", "v-alphabetic"],
    ["vHanging", "v-hanging"],
    ["vIdeographic", "v-ideographic"],
    ["vMathematical", "v-mathematical"],
    ["vectorEffect", "vector-effect"],
    ["vertAdvY", "vert-adv-y"],
    ["vertOriginX", "vert-origin-x"],
    ["vertOriginY", "vert-origin-y"],
    ["wordSpacing", "word-spacing"],
    ["writingMode", "writing-mode"],
    ["xmlnsXlink", "xmlns:xlink"],
    ["xHeight", "x-height"]
  ]), Vv = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
  function Ju(t) {
    return Vv.test("" + t) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : t;
  }
  function te() {
  }
  var Yc = null;
  function qc(t) {
    return t = t.target || t.srcElement || window, t.correspondingUseElement && (t = t.correspondingUseElement), t.nodeType === 3 ? t.parentNode : t;
  }
  var La = null, Za = null;
  function vs(t) {
    var l = qa(t);
    if (l && (t = l.stateNode)) {
      var e = t[sl] || null;
      t: switch (t = l.stateNode, l.type) {
        case "input":
          if (xc(
            t,
            e.value,
            e.defaultValue,
            e.defaultValue,
            e.checked,
            e.defaultChecked,
            e.type,
            e.name
          ), l = e.name, e.type === "radio" && l != null) {
            for (e = t; e.parentNode; ) e = e.parentNode;
            for (e = e.querySelectorAll(
              'input[name="' + xl(
                "" + l
              ) + '"][type="radio"]'
            ), l = 0; l < e.length; l++) {
              var a = e[l];
              if (a !== t && a.form === t.form) {
                var n = a[sl] || null;
                if (!n) throw Error(f(90));
                xc(
                  a,
                  n.value,
                  n.defaultValue,
                  n.defaultValue,
                  n.checked,
                  n.defaultChecked,
                  n.type,
                  n.name
                );
              }
            }
            for (l = 0; l < e.length; l++)
              a = e[l], a.form === t.form && os(a);
          }
          break t;
        case "textarea":
          ss(t, e.value, e.defaultValue);
          break t;
        case "select":
          l = e.value, l != null && Xa(t, !!e.multiple, l, !1);
      }
    }
  }
  var Gc = !1;
  function gs(t, l, e) {
    if (Gc) return t(l, e);
    Gc = !0;
    try {
      var a = t(l);
      return a;
    } finally {
      if (Gc = !1, (La !== null || Za !== null) && (Ji(), La && (l = La, t = Za, Za = La = null, vs(l), t)))
        for (l = 0; l < t.length; l++) vs(t[l]);
    }
  }
  function qn(t, l) {
    var e = t.stateNode;
    if (e === null) return null;
    var a = e[sl] || null;
    if (a === null) return null;
    e = a[l];
    t: switch (l) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (a = !a.disabled) || (t = t.type, a = !(t === "button" || t === "input" || t === "select" || t === "textarea")), t = !a;
        break t;
      default:
        t = !1;
    }
    if (t) return null;
    if (e && typeof e != "function")
      throw Error(
        f(231, l, typeof e)
      );
    return e;
  }
  var ve = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), Vc = !1;
  if (ve)
    try {
      var Gn = {};
      Object.defineProperty(Gn, "passive", {
        get: function() {
          Vc = !0;
        }
      }), window.addEventListener("test", Gn, Gn), window.removeEventListener("test", Gn, Gn);
    } catch {
      Vc = !1;
    }
  var He = null, Xc = null, Fu = null;
  function hs() {
    if (Fu) return Fu;
    var t, l = Xc, e = l.length, a, n = "value" in He ? He.value : He.textContent, u = n.length;
    for (t = 0; t < e && l[t] === n[t]; t++) ;
    var c = e - t;
    for (a = 1; a <= c && l[e - a] === n[u - a]; a++) ;
    return Fu = n.slice(t, 1 < a ? 1 - a : void 0);
  }
  function Wu(t) {
    var l = t.keyCode;
    return "charCode" in t ? (t = t.charCode, t === 0 && l === 13 && (t = 13)) : t = l, t === 10 && (t = 13), 32 <= t || t === 13 ? t : 0;
  }
  function ku() {
    return !0;
  }
  function bs() {
    return !1;
  }
  function cl(t) {
    function l(e, a, n, u, c) {
      this._reactName = e, this._targetInst = n, this.type = a, this.nativeEvent = u, this.target = c, this.currentTarget = null;
      for (var r in t)
        t.hasOwnProperty(r) && (e = t[r], this[r] = e ? e(u) : u[r]);
      return this.isDefaultPrevented = (u.defaultPrevented != null ? u.defaultPrevented : u.returnValue === !1) ? ku : bs, this.isPropagationStopped = bs, this;
    }
    return Y(l.prototype, {
      preventDefault: function() {
        this.defaultPrevented = !0;
        var e = this.nativeEvent;
        e && (e.preventDefault ? e.preventDefault() : typeof e.returnValue != "unknown" && (e.returnValue = !1), this.isDefaultPrevented = ku);
      },
      stopPropagation: function() {
        var e = this.nativeEvent;
        e && (e.stopPropagation ? e.stopPropagation() : typeof e.cancelBubble != "unknown" && (e.cancelBubble = !0), this.isPropagationStopped = ku);
      },
      persist: function() {
      },
      isPersistent: ku
    }), l;
  }
  var xe = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function(t) {
      return t.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0
  }, Iu = cl(xe), Vn = Y({}, xe, { view: 0, detail: 0 }), Xv = cl(Vn), Qc, Lc, Xn, Pu = Y({}, Vn, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: wc,
    button: 0,
    buttons: 0,
    relatedTarget: function(t) {
      return t.relatedTarget === void 0 ? t.fromElement === t.srcElement ? t.toElement : t.fromElement : t.relatedTarget;
    },
    movementX: function(t) {
      return "movementX" in t ? t.movementX : (t !== Xn && (Xn && t.type === "mousemove" ? (Qc = t.screenX - Xn.screenX, Lc = t.screenY - Xn.screenY) : Lc = Qc = 0, Xn = t), Qc);
    },
    movementY: function(t) {
      return "movementY" in t ? t.movementY : Lc;
    }
  }), ps = cl(Pu), Qv = Y({}, Pu, { dataTransfer: 0 }), Lv = cl(Qv), Zv = Y({}, Vn, { relatedTarget: 0 }), Zc = cl(Zv), wv = Y({}, xe, {
    animationName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), Kv = cl(wv), $v = Y({}, xe, {
    clipboardData: function(t) {
      return "clipboardData" in t ? t.clipboardData : window.clipboardData;
    }
  }), Jv = cl($v), Fv = Y({}, xe, { data: 0 }), Ss = cl(Fv), Wv = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified"
  }, kv = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
  }, Iv = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey"
  };
  function Pv(t) {
    var l = this.nativeEvent;
    return l.getModifierState ? l.getModifierState(t) : (t = Iv[t]) ? !!l[t] : !1;
  }
  function wc() {
    return Pv;
  }
  var tg = Y({}, Vn, {
    key: function(t) {
      if (t.key) {
        var l = Wv[t.key] || t.key;
        if (l !== "Unidentified") return l;
      }
      return t.type === "keypress" ? (t = Wu(t), t === 13 ? "Enter" : String.fromCharCode(t)) : t.type === "keydown" || t.type === "keyup" ? kv[t.keyCode] || "Unidentified" : "";
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: wc,
    charCode: function(t) {
      return t.type === "keypress" ? Wu(t) : 0;
    },
    keyCode: function(t) {
      return t.type === "keydown" || t.type === "keyup" ? t.keyCode : 0;
    },
    which: function(t) {
      return t.type === "keypress" ? Wu(t) : t.type === "keydown" || t.type === "keyup" ? t.keyCode : 0;
    }
  }), lg = cl(tg), eg = Y({}, Pu, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0
  }), Ts = cl(eg), ag = Y({}, xe, { submitter: 0 }), ng = cl(ag), ug = Y({}, Vn, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: wc
  }), ig = cl(ug), cg = Y({}, xe, {
    propertyName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), fg = cl(cg), og = Y({}, Pu, {
    deltaX: function(t) {
      return "deltaX" in t ? t.deltaX : "wheelDeltaX" in t ? -t.wheelDeltaX : 0;
    },
    deltaY: function(t) {
      return "deltaY" in t ? t.deltaY : "wheelDeltaY" in t ? -t.wheelDeltaY : "wheelDelta" in t ? -t.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), rg = cl(og), sg = Y({}, xe, {
    newState: 0,
    oldState: 0,
    source: 0
  }), dg = cl(sg), mg = [9, 13, 27, 32], Kc = ve && "CompositionEvent" in window, Qn = null;
  ve && "documentMode" in document && (Qn = document.documentMode);
  var yg = ve && "TextEvent" in window && !Qn, Es = ve && (!Kc || Qn && 8 < Qn && 11 >= Qn), _s = " ", zs = !1;
  function Os(t, l) {
    switch (t) {
      case "keyup":
        return mg.indexOf(l.keyCode) !== -1;
      case "keydown":
        return l.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function Ns(t) {
    return t = t.detail, typeof t == "object" && "data" in t ? t.data : null;
  }
  var wa = !1;
  function vg(t, l) {
    switch (t) {
      case "compositionend":
        return Ns(l);
      case "keypress":
        return l.which !== 32 ? null : (zs = !0, _s);
      case "textInput":
        return t = l.data, t === _s && zs ? null : t;
      default:
        return null;
    }
  }
  function gg(t, l) {
    if (wa)
      return t === "compositionend" || !Kc && Os(t, l) ? (t = hs(), Fu = Xc = He = null, wa = !1, t) : null;
    switch (t) {
      case "paste":
        return null;
      case "keypress":
        if (!(l.ctrlKey || l.altKey || l.metaKey) || l.ctrlKey && l.altKey) {
          if (l.char && 1 < l.char.length)
            return l.char;
          if (l.which) return String.fromCharCode(l.which);
        }
        return null;
      case "compositionend":
        return Es && l.locale !== "ko" ? null : l.data;
      default:
        return null;
    }
  }
  var hg = {
    color: !0,
    date: !0,
    datetime: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    password: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0
  };
  function As(t) {
    var l = t && t.nodeName && t.nodeName.toLowerCase();
    return l === "input" ? !!hg[t.type] : l === "textarea";
  }
  function Cs(t, l, e, a) {
    La ? Za ? Za.push(a) : Za = [a] : La = a, l = tc(l, "onChange"), 0 < l.length && (e = new Iu(
      "onChange",
      "change",
      null,
      e,
      a
    ), t.push({ event: e, listeners: l }));
  }
  var Ln = null, Zn = null;
  function bg(t) {
    v0(t, 0);
  }
  function ti(t) {
    var l = Yn(t);
    if (os(l)) return t;
  }
  function Ms(t, l) {
    if (t === "change") return l;
  }
  var Rs = !1;
  if (ve) {
    var $c;
    if (ve) {
      var Jc = "oninput" in document;
      if (!Jc) {
        var Ds = document.createElement("div");
        Ds.setAttribute("oninput", "return;"), Jc = typeof Ds.oninput == "function";
      }
      $c = Jc;
    } else $c = !1;
    Rs = $c && (!document.documentMode || 9 < document.documentMode);
  }
  function Us() {
    Ln && (Ln.detachEvent("onpropertychange", Hs), Zn = Ln = null);
  }
  function Hs(t) {
    if (t.propertyName === "value" && ti(Zn)) {
      var l = [];
      Cs(
        l,
        Zn,
        t,
        qc(t)
      ), gs(bg, l);
    }
  }
  function pg(t, l, e) {
    t === "focusin" ? (Us(), Ln = l, Zn = e, Ln.attachEvent("onpropertychange", Hs)) : t === "focusout" && Us();
  }
  function Sg(t) {
    if (t === "selectionchange" || t === "keyup" || t === "keydown")
      return ti(Zn);
  }
  function Tg(t, l) {
    if (t === "click") return ti(l);
  }
  function Eg(t, l) {
    if (t === "input" || t === "change")
      return ti(l);
  }
  function _g(t, l) {
    return t === l && (t !== 0 || 1 / t === 1 / l) || t !== t && l !== l;
  }
  var _l = typeof Object.is == "function" ? Object.is : _g;
  function wn(t, l) {
    if (_l(t, l)) return !0;
    if (typeof t != "object" || t === null || typeof l != "object" || l === null)
      return !1;
    var e = Object.keys(t), a = Object.keys(l);
    if (e.length !== a.length) return !1;
    for (a = 0; a < e.length; a++) {
      var n = e[a];
      if (!Ac.call(l, n) || !_l(t[n], l[n]))
        return !1;
    }
    return !0;
  }
  function Fc(t) {
    if (t = t || (typeof document < "u" ? document : void 0), typeof t > "u") return null;
    try {
      return t.activeElement || t.body;
    } catch {
      return t.body;
    }
  }
  function xs(t) {
    for (; t && t.firstChild; ) t = t.firstChild;
    return t;
  }
  function js(t, l) {
    var e = xs(t);
    t = 0;
    for (var a; e; ) {
      if (e.nodeType === 3) {
        if (a = t + e.textContent.length, t <= l && a >= l)
          return { node: e, offset: l - t };
        t = a;
      }
      t: {
        for (; e; ) {
          if (e.nextSibling) {
            e = e.nextSibling;
            break t;
          }
          e = e.parentNode;
        }
        e = void 0;
      }
      e = xs(e);
    }
  }
  function Bs(t, l) {
    return t && l ? t === l ? !0 : t && t.nodeType === 3 ? !1 : l && l.nodeType === 3 ? Bs(t, l.parentNode) : "contains" in t ? t.contains(l) : t.compareDocumentPosition ? !!(t.compareDocumentPosition(l) & 16) : !1 : !1;
  }
  function Ys(t) {
    t = t != null && t.ownerDocument != null && t.ownerDocument.defaultView != null ? t.ownerDocument.defaultView : window;
    for (var l = Fc(t.document); l instanceof t.HTMLIFrameElement; ) {
      try {
        var e = typeof l.contentWindow.location.href == "string";
      } catch {
        e = !1;
      }
      if (e) t = l.contentWindow;
      else break;
      l = Fc(t.document);
    }
    return l;
  }
  function Wc(t) {
    var l = t && t.nodeName && t.nodeName.toLowerCase();
    return l && (l === "input" && (t.type === "text" || t.type === "search" || t.type === "tel" || t.type === "url" || t.type === "password") || l === "textarea" || t.contentEditable === "true");
  }
  var zg = ve && "documentMode" in document && 11 >= document.documentMode, Ka = null, kc = null, Kn = null, Ic = !1;
  function qs(t, l, e) {
    var a = e.window === e ? e.document : e.nodeType === 9 ? e : e.ownerDocument;
    Ic || Ka == null || Ka !== Fc(a) || (a = Ka, "selectionStart" in a && Wc(a) ? a = { start: a.selectionStart, end: a.selectionEnd } : (a = (a.ownerDocument && a.ownerDocument.defaultView || window).getSelection(), a = {
      anchorNode: a.anchorNode,
      anchorOffset: a.anchorOffset,
      focusNode: a.focusNode,
      focusOffset: a.focusOffset
    }), Kn && wn(Kn, a) || (Kn = a, a = tc(kc, "onSelect"), 0 < a.length && (l = new Iu(
      "onSelect",
      "select",
      null,
      l,
      e
    ), t.push({ event: l, listeners: a }), l.target = Ka)));
  }
  function ra(t, l) {
    var e = {};
    return e[t.toLowerCase()] = l.toLowerCase(), e["Webkit" + t] = "webkit" + l, e["Moz" + t] = "moz" + l, e;
  }
  var $a = {
    animationend: ra("Animation", "AnimationEnd"),
    animationiteration: ra("Animation", "AnimationIteration"),
    animationstart: ra("Animation", "AnimationStart"),
    transitionrun: ra("Transition", "TransitionRun"),
    transitionstart: ra("Transition", "TransitionStart"),
    transitioncancel: ra("Transition", "TransitionCancel"),
    transitionend: ra("Transition", "TransitionEnd")
  }, Pc = {}, Gs = {};
  ve && (Gs = document.createElement("div").style, "AnimationEvent" in window || (delete $a.animationend.animation, delete $a.animationiteration.animation, delete $a.animationstart.animation), "TransitionEvent" in window || delete $a.transitionend.transition);
  function sa(t) {
    if (Pc[t]) return Pc[t];
    if (!$a[t]) return t;
    var l = $a[t], e;
    for (e in l)
      if (l.hasOwnProperty(e) && e in Gs)
        return Pc[t] = l[e];
    return t;
  }
  var Vs = sa("animationend"), Xs = sa("animationiteration"), Qs = sa("animationstart"), Og = sa("transitionrun"), Ng = sa("transitionstart"), Ag = sa("transitioncancel"), Ls = sa("transitionend"), Zs = /* @__PURE__ */ new Map(), tf = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
    " "
  );
  tf.push("scrollEnd");
  function Kl(t, l) {
    Zs.set(t, l), oa(l, [t]);
  }
  var Cg = 0;
  function ge(t, l) {
    if (t.name != null && t.name !== "auto") return t.name;
    if (l.autoName !== null) return l.autoName;
    t = Wl.identifierPrefix;
    var e = Cg++;
    return t = "_" + t + "t_" + e.toString(32) + "_", l.autoName = t;
  }
  function ws(t) {
    if (t == null || typeof t == "string")
      return t;
    var l = null, e = yn;
    if (e !== null)
      for (var a = 0; a < e.length; a++) {
        var n = t[e[a]];
        if (n != null) {
          if (n === "none") return "none";
          l = l == null ? n : l + (" " + n);
        }
      }
    return l ?? t.default;
  }
  function he(t, l) {
    return t = ws(t), l = ws(l), l == null ? t === "auto" ? null : t : l === "auto" ? null : l;
  }
  var li = typeof reportError == "function" ? reportError : function(t) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var l = new window.ErrorEvent("error", {
        bubbles: !0,
        cancelable: !0,
        message: typeof t == "object" && t !== null && typeof t.message == "string" ? String(t.message) : String(t),
        error: t
      });
      if (!window.dispatchEvent(l)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", t);
      return;
    }
    console.error(t);
  }, jl = [], Ja = 0, lf = 0;
  function ei() {
    for (var t = Ja, l = lf = Ja = 0; l < t; ) {
      var e = jl[l];
      jl[l++] = null;
      var a = jl[l];
      jl[l++] = null;
      var n = jl[l];
      jl[l++] = null;
      var u = jl[l];
      if (jl[l++] = null, a !== null && n !== null) {
        var c = a.pending;
        c === null ? n.next = n : (n.next = c.next, c.next = n), a.pending = n;
      }
      u !== 0 && Ks(e, n, u);
    }
  }
  function ai(t, l, e, a) {
    jl[Ja++] = t, jl[Ja++] = l, jl[Ja++] = e, jl[Ja++] = a, lf |= a, t.lanes |= a, t = t.alternate, t !== null && (t.lanes |= a);
  }
  function ef(t, l, e, a) {
    return ai(t, l, e, a), ni(t);
  }
  function da(t, l) {
    return ai(t, null, null, l), ni(t);
  }
  function Ks(t, l, e) {
    t.lanes |= e;
    var a = t.alternate;
    a !== null && (a.lanes |= e);
    for (var n = !1, u = t.return; u !== null; )
      u.childLanes |= e, a = u.alternate, a !== null && (a.childLanes |= e), u.tag === 22 && (t = u.stateNode, t === null || t._visibility & 1 || (n = !0)), t = u, u = u.return;
    return t.tag === 3 ? (u = t.stateNode, n && l !== null && (n = 31 - Tl(e), t = u.hiddenUpdates, a = t[n], a === null ? t[n] = [l] : a.push(l), l.lane = e | 536870912), u) : null;
  }
  function ni(t) {
    if (50 < yu)
      throw yu = 0, $i = null, Error(f(185));
    for (var l = t.return; l !== null; )
      t = l, l = t.return;
    return t.tag === 3 ? t.stateNode : null;
  }
  var Fa = {};
  function Mg(t, l, e, a) {
    this.tag = t, this.key = e, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = l, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = a, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function dl(t, l, e, a) {
    return new Mg(t, l, e, a);
  }
  function af(t) {
    return t = t.prototype, !(!t || !t.isReactComponent);
  }
  function be(t, l) {
    var e = t.alternate;
    return e === null ? (e = dl(
      t.tag,
      l,
      t.key,
      t.mode
    ), e.elementType = t.elementType, e.type = t.type, e.stateNode = t.stateNode, e.alternate = t, t.alternate = e) : (e.pendingProps = l, e.type = t.type, e.flags = 0, e.subtreeFlags = 0, e.deletions = null), e.flags = t.flags & 1206910976, e.childLanes = t.childLanes, e.lanes = t.lanes, e.child = t.child, e.memoizedProps = t.memoizedProps, e.memoizedState = t.memoizedState, e.updateQueue = t.updateQueue, l = t.dependencies, e.dependencies = l === null ? null : { lanes: l.lanes, firstContext: l.firstContext }, e.sibling = t.sibling, e.index = t.index, e.ref = t.ref, e.refCleanup = t.refCleanup, e;
  }
  function $s(t, l) {
    t.flags &= 1206910978;
    var e = t.alternate;
    return e === null ? (t.childLanes = 0, t.lanes = l, t.child = null, t.subtreeFlags = 0, t.memoizedProps = null, t.memoizedState = null, t.updateQueue = null, t.dependencies = null, t.stateNode = null) : (t.childLanes = e.childLanes, t.lanes = e.lanes, t.child = e.child, t.subtreeFlags = 0, t.deletions = null, t.memoizedProps = e.memoizedProps, t.memoizedState = e.memoizedState, t.updateQueue = e.updateQueue, t.type = e.type, l = e.dependencies, t.dependencies = l === null ? null : {
      lanes: l.lanes,
      firstContext: l.firstContext
    }), t;
  }
  function ui(t, l, e, a, n, u) {
    var c = 0;
    if (a = t, typeof a == "function") af(a) && (c = 1);
    else if (typeof a == "string")
      c = a1(
        t,
        e,
        Hl.current
      ) ? 26 : t === "html" || t === "head" || t === "body" ? 27 : 5;
    else
      t: switch (a) {
        case bl:
          return t = dl(31, e, l, n), t.elementType = bl, t.lanes = u, t;
        case kt:
          return ma(e.children, n, u, l);
        case Ct:
          c = 8, n |= 24;
          break;
        case It:
          return t = dl(12, e, l, n | 2), t.elementType = It, t.lanes = u, t;
        case J:
          return t = dl(13, e, l, n), t.elementType = J, t.lanes = u, t;
        case W:
          return t = dl(19, e, l, n), t.elementType = W, t.lanes = u, t;
        case Zl:
        case g:
          return t = n | 32, t = dl(30, e, l, t), t.elementType = g, t.lanes = u, t.stateNode = {
            autoName: null,
            paired: null,
            clones: null,
            ref: null
          }, t;
        default:
          if (typeof a == "object" && a !== null)
            switch (a.$$typeof) {
              case Gt:
                c = 10;
                break t;
              case hl:
                c = 9;
                break t;
              case x:
                c = 11;
                break t;
              case Tt:
                c = 14;
                break t;
              case gt:
                c = 16, a = null;
                break t;
            }
          c = 29, e = Error(
            f(130, t === null ? "null" : typeof t, "")
          ), a = null;
      }
    return l = dl(c, e, l, n), l.elementType = t, l.type = a, l.lanes = u, l;
  }
  function ma(t, l, e, a) {
    return t = dl(7, t, a, l), t.lanes = e, t;
  }
  function nf(t, l, e) {
    return t = dl(6, t, null, l), t.lanes = e, t;
  }
  function Js(t) {
    var l = dl(18, null, null, 0);
    return l.stateNode = t, l;
  }
  function uf(t, l, e) {
    return l = dl(
      4,
      t.children !== null ? t.children : [],
      t.key,
      l
    ), l.lanes = e, l.stateNode = {
      containerInfo: t.containerInfo,
      pendingChildren: null,
      implementation: t.implementation
    }, l;
  }
  var Fs = /* @__PURE__ */ new WeakMap();
  function Bl(t, l) {
    if (typeof t == "object" && t !== null) {
      var e = Fs.get(t);
      return e !== void 0 ? e : (l = {
        value: t,
        source: l,
        stack: Lr(l)
      }, Fs.set(t, l), l);
    }
    return {
      value: t,
      source: l,
      stack: Lr(l)
    };
  }
  var Wa = [], ka = 0, ii = null, $n = 0, Yl = [], ql = 0, je = null, le = 1, ee = "";
  function pe(t, l) {
    Wa[ka++] = $n, Wa[ka++] = ii, ii = t, $n = l;
  }
  function Ws(t, l, e) {
    Yl[ql++] = le, Yl[ql++] = ee, Yl[ql++] = je, je = t;
    var a = le;
    t = ee;
    var n = 32 - Tl(a) - 1;
    a &= ~(1 << n), e += 1;
    var u = 32 - Tl(l) + n;
    if (30 < u) {
      var c = n - n % 5;
      u = (a & (1 << c) - 1).toString(32), a >>= c, n -= c, le = 1 << 32 - Tl(l) + n | e << n | a, ee = u + t;
    } else
      le = 1 << u | e << n | a, ee = t;
  }
  function ci(t) {
    t.return !== null && (pe(t, 1), Ws(t, 1, 0));
  }
  function cf(t) {
    for (; t === ii; )
      ii = Wa[--ka], Wa[ka] = null, $n = Wa[--ka], Wa[ka] = null;
    for (; t === je; )
      je = Yl[--ql], Yl[ql] = null, ee = Yl[--ql], Yl[ql] = null, le = Yl[--ql], Yl[ql] = null;
  }
  function ks(t, l) {
    Yl[ql++] = le, Yl[ql++] = ee, Yl[ql++] = je, le = l.id, ee = l.overflow, je = t;
  }
  var Jt = null, Rt = null, nt = !1, Be = null, Gl = !1, ff = Error(f(519));
  function Ye(t) {
    var l = Error(
      f(
        418,
        1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML",
        ""
      )
    );
    throw Jn(Bl(l, t)), ff;
  }
  function Is(t) {
    var l = t.stateNode, e = t.type, a = t.memoizedProps;
    switch (l[Pt] = t, l[sl] = a, e) {
      case "dialog":
        it("cancel", l), it("close", l);
        break;
      case "iframe":
      case "object":
      case "embed":
        it("load", l);
        break;
      case "video":
      case "audio":
        for (e = 0; e < gu.length; e++)
          it(gu[e], l);
        break;
      case "source":
        it("error", l);
        break;
      case "img":
      case "image":
      case "link":
        it("error", l), it("load", l);
        break;
      case "details":
        it("toggle", l);
        break;
      case "input":
        it("invalid", l), rs(
          l,
          a.value,
          a.defaultValue,
          a.checked,
          a.defaultChecked,
          a.type,
          a.name,
          !0
        );
        break;
      case "select":
        it("invalid", l);
        break;
      case "textarea":
        it("invalid", l), ds(l, a.value, a.defaultValue, a.children);
    }
    e = a.children, typeof e != "string" && typeof e != "number" && typeof e != "bigint" || l.textContent === "" + e || a.suppressHydrationWarning === !0 || p0(l.textContent, e) ? (a.popover != null && (it("beforetoggle", l), it("toggle", l)), a.onScroll != null && it("scroll", l), a.onScrollEnd != null && it("scrollend", l), a.onClick != null && (l.onclick = te), l = !0) : l = !1, l || Ye(t, !0);
  }
  function fi(t) {
    for (Jt = t.return; Jt; )
      switch (Jt.tag) {
        case 5:
        case 31:
        case 13:
          Gl = !1;
          return;
        case 27:
        case 3:
          Gl = !0;
          return;
        default:
          Jt = Jt.return;
      }
  }
  function Ia(t) {
    if (t !== Jt) return !1;
    if (!nt) return fi(t), nt = !0, !1;
    var l = t.tag, e;
    if ((e = l !== 3 && l !== 27) && ((e = l === 5) && (e = t.type, e = !(e !== "form" && e !== "button") || Go(t.type, t.memoizedProps)), e = !e), e && Rt && Ye(t), fi(t), l === 13) {
      if (t = t.memoizedState, t = t !== null ? t.dehydrated : null, !t) throw Error(f(317));
      Rt = q0(t);
    } else if (l === 31) {
      if (t = t.memoizedState, t = t !== null ? t.dehydrated : null, !t) throw Error(f(317));
      Rt = q0(t);
    } else
      l === 27 ? (l = Rt, Pe(t.type) ? (t = Jo, Jo = null, Rt = t) : Rt = l) : Rt = Jt ? Xl(t.stateNode.nextSibling) : null;
    return !0;
  }
  function ya() {
    Rt = Jt = null, nt = !1;
  }
  function of() {
    var t = Be;
    return t !== null && (vl === null ? vl = t : vl.push.apply(
      vl,
      t
    ), Be = null), t;
  }
  function Jn(t) {
    Be === null ? Be = [t] : Be.push(t);
  }
  var rf = Ul(null), va = null, Se = null;
  function qe(t, l, e) {
    Nt(rf, l._currentValue), l._currentValue = e;
  }
  function Te(t) {
    t._currentValue = rf.current, wt(rf);
  }
  function oi(t, l, e) {
    for (; t !== null; ) {
      var a = t.alternate;
      if ((t.childLanes & l) !== l ? (t.childLanes |= l, a !== null && (a.childLanes |= l)) : a !== null && (a.childLanes & l) !== l && (a.childLanes |= l), t === e) break;
      t = t.return;
    }
  }
  function sf(t, l, e, a) {
    var n = t.child;
    for (n !== null && (n.return = t); n !== null; ) {
      var u = n.dependencies;
      if (u !== null) {
        var c = n.child;
        u = u.firstContext;
        t: for (; u !== null; ) {
          var r = u;
          u = n;
          for (var d = 0; d < l.length; d++)
            if (r.context === l[d]) {
              u.lanes |= e, r = u.alternate, r !== null && (r.lanes |= e), oi(
                u.return,
                e,
                t
              ), a || (c = null);
              break t;
            }
          u = r.next;
        }
      } else if (n.tag === 18) {
        if (c = n.return, c === null) throw Error(f(341));
        c.lanes |= e, u = c.alternate, u !== null && (u.lanes |= e), oi(c, e, t), c = null;
      } else
        n.tag === 13 && n.memoizedState !== null && n.memoizedState.dehydrated === null ? (n.lanes |= e, c = n.alternate, c !== null && (c.lanes |= e), oi(
          n.return,
          e,
          t
        ), c = n.child, c = c !== null ? c.sibling : null) : c = n.child;
      if (c !== null) c.return = n;
      else
        for (c = n; c !== null; ) {
          if (c === t) {
            c = null;
            break;
          }
          if (n = c.sibling, n !== null) {
            n.return = c.return, c = n;
            break;
          }
          c = c.return;
        }
      n = c;
    }
  }
  function ga(t, l, e, a) {
    t = null;
    for (var n = l, u = !1; n !== null; ) {
      if (!u) {
        if ((n.flags & 524288) !== 0) u = !0;
        else if ((n.flags & 262144) !== 0) break;
      }
      if (n.tag === 10) {
        var c = n.alternate;
        if (c === null) throw Error(f(387));
        if (c = c.memoizedProps, c !== null) {
          var r = n.type;
          _l(n.pendingProps.value, c.value) || (t !== null ? t.push(r) : t = [r]);
        }
      } else if (n === ja.current) {
        if (c = n.alternate, c === null) throw Error(f(387));
        c.memoizedState.memoizedState !== n.memoizedState.memoizedState && (t !== null ? t.push(zn) : t = [zn]);
      }
      n = n.return;
    }
    return t !== null && sf(
      l,
      t,
      e,
      a
    ), l.flags |= 262144, t !== null;
  }
  function ri(t) {
    for (t = t.firstContext; t !== null; ) {
      if (!_l(
        t.context._currentValue,
        t.memoizedValue
      ))
        return !0;
      t = t.next;
    }
    return !1;
  }
  function ha(t) {
    va = t, Se = null, t = t.dependencies, t !== null && (t.firstContext = null);
  }
  function tl(t) {
    return Ps(va, t);
  }
  function si(t, l) {
    return va === null && ha(t), Ps(t, l);
  }
  function Ps(t, l) {
    var e = l._currentValue;
    if (l = { context: l, memoizedValue: e, next: null }, Se === null) {
      if (t === null) throw Error(f(308));
      Se = l, t.dependencies = { lanes: 0, firstContext: l }, t.flags |= 524288;
    } else Se = Se.next = l;
    return e;
  }
  var Rg = typeof AbortController < "u" ? AbortController : function() {
    var t = [], l = this.signal = {
      aborted: !1,
      addEventListener: function(e, a) {
        t.push(a);
      }
    };
    this.abort = function() {
      l.aborted = !0, t.forEach(function(e) {
        return e();
      });
    };
  }, Dg = i.unstable_scheduleCallback, Ug = i.unstable_NormalPriority, Vt = {
    $$typeof: Gt,
    Consumer: null,
    Provider: null,
    _currentValue: null,
    _currentValue2: null,
    _threadCount: 0
  };
  function df() {
    return {
      controller: new Rg(),
      data: /* @__PURE__ */ new Map(),
      refCount: 0
    };
  }
  function Fn(t) {
    t.refCount--, t.refCount === 0 && Dg(Ug, function() {
      t.controller.abort();
    });
  }
  function td(t, l) {
    if ((t.pendingLanes & 4194048) !== 0) {
      var e = t.transitionTypes;
      for (e === null && (e = t.transitionTypes = []), t = 0; t < l.length; t++) {
        var a = l[t];
        e.indexOf(a) === -1 && e.push(a);
      }
    }
  }
  var Wn = null;
  function Hg(t) {
    var l = t.transitionTypes;
    return t.transitionTypes = null, l;
  }
  var kn = null, mf = 0, ba = 0, Pa = null;
  function xg(t, l) {
    if (kn === null) {
      var e = kn = [];
      mf = 0, ba = Ro(), Pa = {
        status: "pending",
        value: void 0,
        then: function(a) {
          e.push(a);
        }
      };
    }
    return mf++, l.then(ld, ld), l;
  }
  function ld() {
    if (--mf === 0 && (Wn = null, kn !== null)) {
      Pa !== null && (Pa.status = "fulfilled");
      var t = kn;
      kn = null, ba = 0, Pa = null;
      for (var l = 0; l < t.length; l++) (0, t[l])();
    }
  }
  function jg(t, l) {
    var e = [], a = {
      status: "pending",
      value: null,
      reason: null,
      then: function(n) {
        e.push(n);
      }
    };
    return t.then(
      function() {
        a.status = "fulfilled", a.value = l;
        for (var n = 0; n < e.length; n++) (0, e[n])(l);
      },
      function(n) {
        for (a.status = "rejected", a.reason = n, n = 0; n < e.length; n++)
          (0, e[n])(void 0);
      }
    ), a;
  }
  var ed = V.S;
  V.S = function(t, l) {
    if (Jm = pl(), typeof l == "object" && l !== null && typeof l.then == "function" && xg(t, l), Wn !== null)
      for (var e = bn; e !== null; )
        td(e, Wn), e = e.next;
    if (e = t.types, e !== null) {
      for (var a = bn; a !== null; )
        td(a, e), a = a.next;
      if (ba !== 0) {
        a = Wn, a === null && (a = Wn = []);
        for (var n = 0; n < e.length; n++) {
          var u = e[n];
          a.indexOf(u) === -1 && a.push(u);
        }
      }
    }
    ed !== null && ed(t, l);
  };
  var pa = Ul(null);
  function yf() {
    var t = pa.current;
    return t !== null ? t : Mt.pooledCache;
  }
  function di(t, l) {
    l === null ? Nt(pa, pa.current) : Nt(pa, l.pool);
  }
  function ad() {
    var t = yf();
    return t === null ? null : { parent: Vt._currentValue, pool: t };
  }
  var tn = Error(f(460)), vf = Error(f(474)), mi = Error(f(542)), yi = { then: function() {
  } };
  function nd(t) {
    return t = t.status, t === "fulfilled" || t === "rejected";
  }
  function ud(t, l, e) {
    switch (e = t[e], e === void 0 ? t.push(l) : e !== l && (l.then(te, te), l = e), l.status) {
      case "fulfilled":
        return l.value;
      case "rejected":
        throw t = l.reason, cd(t), t === void 0 && !("reason" in l) ? Error(f(600)) : t;
      default:
        if (typeof l.status == "string") l.then(te, te);
        else {
          if (t = Mt, t !== null && 100 < t.shellSuspendCounter)
            throw Error(f(482));
          t = l, t.status = "pending", t.then(
            function(a) {
              if (l.status === "pending") {
                var n = l;
                n.status = "fulfilled", n.value = a;
              }
            },
            function(a) {
              if (l.status === "pending") {
                var n = l;
                n.status = "rejected", n.reason = a;
              }
            }
          );
        }
        switch (l.status) {
          case "fulfilled":
            return l.value;
          case "rejected":
            throw t = l.reason, cd(t), t;
        }
        throw Ta = l, tn;
    }
  }
  function Sa(t) {
    try {
      var l = t._init;
      return l(t._payload);
    } catch (e) {
      throw e !== null && typeof e == "object" && typeof e.then == "function" ? (Ta = e, tn) : e;
    }
  }
  var Ta = null;
  function id() {
    if (Ta === null) throw Error(f(459));
    var t = Ta;
    return Ta = null, t;
  }
  function cd(t) {
    if (t === tn || t === mi)
      throw Error(f(483));
  }
  var ln = null, In = 0;
  function vi(t) {
    var l = In;
    return In += 1, ln === null && (ln = []), ud(ln, t, l);
  }
  function Ge(t, l) {
    l = l.props.ref, t.ref = l !== void 0 ? l : null;
  }
  function gi(t, l) {
    throw l.$$typeof === Z ? Error(f(525)) : (t = Object.prototype.toString.call(l), Error(
      f(
        31,
        t === "[object Object]" ? "object with keys {" + Object.keys(l).join(", ") + "}" : t
      )
    ));
  }
  function fd(t) {
    function l(b, v) {
      if (t) {
        var T = b.deletions;
        T === null ? (b.deletions = [v], b.flags |= 16) : T.push(v);
      }
    }
    function e(b, v) {
      if (!t) return null;
      for (; v !== null; )
        l(b, v), v = v.sibling;
      return null;
    }
    function a(b) {
      for (var v = /* @__PURE__ */ new Map(); b !== null; )
        b.key === null ? v.set(b.index, b) : v.set(b.key, b), b = b.sibling;
      return v;
    }
    function n(b, v) {
      return b = be(b, v), b.index = 0, b.sibling = null, b;
    }
    function u(b, v, T) {
      return b.index = T, t ? (T = b.alternate, T !== null ? (T = T.index, T < v ? (b.flags |= 2, v) : T) : (b.flags |= 134217730, v)) : (b.flags |= 1048576, v);
    }
    function c(b) {
      return t && b.alternate === null && (b.flags |= 134217730), b;
    }
    function r(b, v, T, N) {
      return v === null || v.tag !== 6 ? (v = nf(T, b.mode, N), v.return = b, v) : (v = n(v, T), v.return = b, v);
    }
    function d(b, v, T, N) {
      var B = T.type;
      return B === kt ? (b = _(
        b,
        v,
        T.props.children,
        N,
        T.key
      ), Ge(b, T), b) : v !== null && (v.elementType === B || typeof B == "object" && B !== null && B.$$typeof === gt && Sa(B) === v.type) ? (v = n(v, T.props), Ge(v, T), v.return = b, v) : (v = ui(
        T.type,
        T.key,
        T.props,
        null,
        b.mode,
        N
      ), Ge(v, T), v.return = b, v);
    }
    function p(b, v, T, N) {
      return v === null || v.tag !== 4 || v.stateNode.containerInfo !== T.containerInfo || v.stateNode.implementation !== T.implementation ? (v = uf(T, b.mode, N), v.return = b, v) : (v = n(v, T.children || []), v.return = b, v);
    }
    function _(b, v, T, N, B) {
      return v === null || v.tag !== 7 ? (v = ma(
        T,
        b.mode,
        N,
        B
      ), v.return = b, v) : (v = n(v, T), v.return = b, v);
    }
    function A(b, v, T) {
      if (typeof v == "string" && v !== "" || typeof v == "number" || typeof v == "bigint")
        return v = nf(
          "" + v,
          b.mode,
          T
        ), v.return = b, v;
      if (typeof v == "object" && v !== null) {
        switch (v.$$typeof) {
          case jt:
            return T = ui(
              v.type,
              v.key,
              v.props,
              null,
              b.mode,
              T
            ), Ge(T, v), T.return = b, T;
          case Ht:
            return v = uf(
              v,
              b.mode,
              T
            ), v.return = b, v;
          case gt:
            return v = Sa(v), A(b, v, T);
        }
        if (vt(v) || K(v))
          return v = ma(
            v,
            b.mode,
            T,
            null
          ), v.return = b, v;
        if (typeof v.then == "function")
          return A(b, vi(v), T);
        if (v.$$typeof === Gt)
          return A(
            b,
            si(b, v),
            T
          );
        gi(b, v);
      }
      return null;
    }
    function h(b, v, T, N) {
      var B = v !== null ? v.key : null;
      if (typeof T == "string" && T !== "" || typeof T == "number" || typeof T == "bigint")
        return B !== null ? null : r(b, v, "" + T, N);
      if (typeof T == "object" && T !== null) {
        switch (T.$$typeof) {
          case jt:
            return T.key === B ? d(b, v, T, N) : null;
          case Ht:
            return T.key === B ? p(b, v, T, N) : null;
          case gt:
            return T = Sa(T), h(b, v, T, N);
        }
        if (vt(T) || K(T))
          return B !== null ? null : _(b, v, T, N, null);
        if (typeof T.then == "function")
          return h(
            b,
            v,
            vi(T),
            N
          );
        if (T.$$typeof === Gt)
          return h(
            b,
            v,
            si(b, T),
            N
          );
        gi(b, T);
      }
      return null;
    }
    function E(b, v, T, N, B) {
      if (typeof N == "string" && N !== "" || typeof N == "number" || typeof N == "bigint")
        return b = b.get(T) || null, r(v, b, "" + N, B);
      if (typeof N == "object" && N !== null) {
        switch (N.$$typeof) {
          case jt:
            return b = b.get(
              N.key === null ? T : N.key
            ) || null, d(v, b, N, B);
          case Ht:
            return b = b.get(
              N.key === null ? T : N.key
            ) || null, p(v, b, N, B);
          case gt:
            return N = Sa(N), E(
              b,
              v,
              T,
              N,
              B
            );
        }
        if (vt(N) || K(N))
          return b = b.get(T) || null, _(v, b, N, B, null);
        if (typeof N.then == "function")
          return E(
            b,
            v,
            T,
            vi(N),
            B
          );
        if (N.$$typeof === Gt)
          return E(
            b,
            v,
            T,
            si(v, N),
            B
          );
        gi(v, N);
      }
      return null;
    }
    function H(b, v, T, N) {
      for (var B = null, rt = null, $ = v, F = v = 0, Lt = null; $ !== null && F < T.length; F++) {
        $.index > F ? (Lt = $, $ = null) : Lt = $.sibling;
        var mt = h(
          b,
          $,
          T[F],
          N
        );
        if (mt === null) {
          $ === null && ($ = Lt);
          break;
        }
        t && $ && mt.alternate === null && l(b, $), v = u(mt, v, F), rt === null ? B = mt : rt.sibling = mt, rt = mt, $ = Lt;
      }
      if (F === T.length)
        return e(b, $), nt && pe(b, F), B;
      if ($ === null) {
        for (; F < T.length; F++)
          $ = A(b, T[F], N), $ !== null && (v = u(
            $,
            v,
            F
          ), rt === null ? B = $ : rt.sibling = $, rt = $);
        return nt && pe(b, F), B;
      }
      for ($ = a($); F < T.length; F++)
        Lt = E(
          $,
          b,
          F,
          T[F],
          N
        ), Lt !== null && (t && (mt = Lt.alternate, mt !== null && $.delete(mt.key === null ? F : mt.key)), v = u(
          Lt,
          v,
          F
        ), rt === null ? B = Lt : rt.sibling = Lt, rt = Lt);
      return t && $.forEach(function(na) {
        return l(b, na);
      }), nt && pe(b, F), B;
    }
    function q(b, v, T, N) {
      if (T == null) throw Error(f(151));
      for (var B = null, rt = null, $ = v, F = v = 0, Lt = null, mt = T.next(); $ !== null && !mt.done; F++, mt = T.next()) {
        $.index > F ? (Lt = $, $ = null) : Lt = $.sibling;
        var na = h(b, $, mt.value, N);
        if (na === null) {
          $ === null && ($ = Lt);
          break;
        }
        t && $ && na.alternate === null && l(b, $), v = u(na, v, F), rt === null ? B = na : rt.sibling = na, rt = na, $ = Lt;
      }
      if (mt.done)
        return e(b, $), nt && pe(b, F), B;
      if ($ === null) {
        for (; !mt.done; F++, mt = T.next())
          mt = A(b, mt.value, N), mt !== null && (v = u(mt, v, F), rt === null ? B = mt : rt.sibling = mt, rt = mt);
        return nt && pe(b, F), B;
      }
      for ($ = a($); !mt.done; F++, mt = T.next())
        mt = E($, b, F, mt.value, N), mt !== null && (t && (Lt = mt.alternate, Lt !== null && $.delete(
          Lt.key === null ? F : Lt.key
        )), v = u(mt, v, F), rt === null ? B = mt : rt.sibling = mt, rt = mt);
      return t && $.forEach(function(v1) {
        return l(b, v1);
      }), nt && pe(b, F), B;
    }
    function et(b, v, T, N) {
      if (typeof T == "object" && T !== null && T.type === kt && T.key === null && T.props.ref === void 0 && (T = T.props.children), typeof T == "object" && T !== null) {
        switch (T.$$typeof) {
          case jt:
            t: {
              for (var B = T.key; v !== null; ) {
                if (v.key === B) {
                  if (B = T.type, B === kt) {
                    if (v.tag === 7) {
                      e(
                        b,
                        v.sibling
                      ), N = n(
                        v,
                        T.props.children
                      ), Ge(N, T), N.return = b, b = N;
                      break t;
                    }
                  } else if (v.elementType === B || typeof B == "object" && B !== null && B.$$typeof === gt && Sa(B) === v.type) {
                    e(
                      b,
                      v.sibling
                    ), N = n(v, T.props), Ge(N, T), N.return = b, b = N;
                    break t;
                  }
                  e(b, v);
                  break;
                } else l(b, v);
                v = v.sibling;
              }
              T.type === kt ? (N = ma(
                T.props.children,
                b.mode,
                N,
                T.key
              ), Ge(N, T), N.return = b, b = N) : (N = ui(
                T.type,
                T.key,
                T.props,
                null,
                b.mode,
                N
              ), Ge(N, T), N.return = b, b = N);
            }
            return c(b);
          case Ht:
            t: {
              for (B = T.key; v !== null; ) {
                if (v.key === B)
                  if (v.tag === 4 && v.stateNode.containerInfo === T.containerInfo && v.stateNode.implementation === T.implementation) {
                    e(
                      b,
                      v.sibling
                    ), N = n(v, T.children || []), N.return = b, b = N;
                    break t;
                  } else {
                    e(b, v);
                    break;
                  }
                else l(b, v);
                v = v.sibling;
              }
              N = uf(T, b.mode, N), N.return = b, b = N;
            }
            return c(b);
          case gt:
            return T = Sa(T), et(
              b,
              v,
              T,
              N
            );
        }
        if (vt(T))
          return H(
            b,
            v,
            T,
            N
          );
        if (K(T)) {
          if (B = K(T), typeof B != "function") throw Error(f(150));
          return T = B.call(T), q(
            b,
            v,
            T,
            N
          );
        }
        if (typeof T.then == "function")
          return et(
            b,
            v,
            vi(T),
            N
          );
        if (T.$$typeof === Gt)
          return et(
            b,
            v,
            si(b, T),
            N
          );
        gi(b, T);
      }
      return typeof T == "string" && T !== "" || typeof T == "number" || typeof T == "bigint" ? (T = "" + T, v !== null && v.tag === 6 ? (e(b, v.sibling), N = n(v, T), N.return = b, b = N) : (e(b, v), N = nf(T, b.mode, N), N.return = b, b = N), c(b)) : e(b, v);
    }
    return function(b, v, T, N) {
      try {
        In = 0;
        var B = et(
          b,
          v,
          T,
          N
        );
        return ln = null, B;
      } catch ($) {
        if ($ === tn || $ === mi) throw $;
        var rt = dl(29, $, null, b.mode);
        return rt.lanes = N, rt.return = b, rt;
      }
    };
  }
  var Ea = fd(!0), od = fd(!1), Ve = !1;
  function gf(t) {
    t.updateQueue = {
      baseState: t.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null, lanes: 0, hiddenCallbacks: null },
      callbacks: null
    };
  }
  function hf(t, l) {
    t = t.updateQueue, l.updateQueue === t && (l.updateQueue = {
      baseState: t.baseState,
      firstBaseUpdate: t.firstBaseUpdate,
      lastBaseUpdate: t.lastBaseUpdate,
      shared: t.shared,
      callbacks: null
    });
  }
  function Xe(t) {
    return { lane: t, tag: 0, payload: null, callback: null, next: null };
  }
  function Qe(t, l, e) {
    var a = t.updateQueue;
    if (a === null) return null;
    if (a = a.shared, (bt & 2) !== 0) {
      var n = a.pending;
      return n === null ? l.next = l : (l.next = n.next, n.next = l), a.pending = l, l = ni(t), Ks(t, null, e), l;
    }
    return ai(t, a, l, e), ni(t);
  }
  function Pn(t, l, e) {
    if (l = l.updateQueue, l !== null && (l = l.shared, (e & 4194048) !== 0)) {
      var a = l.lanes;
      a &= t.pendingLanes, e |= a, l.lanes = e, Wr(t, e);
    }
  }
  function bf(t, l) {
    var e = t.updateQueue, a = t.alternate;
    if (a !== null && (a = a.updateQueue, e === a)) {
      var n = null, u = null;
      if (e = e.firstBaseUpdate, e !== null) {
        do {
          var c = {
            lane: e.lane,
            tag: e.tag,
            payload: e.payload,
            callback: null,
            next: null
          };
          u === null ? n = u = c : u = u.next = c, e = e.next;
        } while (e !== null);
        u === null ? n = u = l : u = u.next = l;
      } else n = u = l;
      e = {
        baseState: a.baseState,
        firstBaseUpdate: n,
        lastBaseUpdate: u,
        shared: a.shared,
        callbacks: a.callbacks
      }, t.updateQueue = e;
      return;
    }
    t = e.lastBaseUpdate, t === null ? e.firstBaseUpdate = l : t.next = l, e.lastBaseUpdate = l;
  }
  var pf = !1;
  function tu() {
    if (pf) {
      var t = Pa;
      if (t !== null) throw t;
    }
  }
  function lu(t, l, e, a) {
    pf = !1;
    var n = t.updateQueue;
    Ve = !1;
    var u = n.firstBaseUpdate, c = n.lastBaseUpdate, r = n.shared.pending;
    if (r !== null) {
      n.shared.pending = null;
      var d = r, p = d.next;
      d.next = null, c === null ? u = p : c.next = p, c = d;
      var _ = t.alternate;
      _ !== null && (_ = _.updateQueue, r = _.lastBaseUpdate, r !== c && (r === null ? _.firstBaseUpdate = p : r.next = p, _.lastBaseUpdate = d));
    }
    if (u !== null) {
      var A = n.baseState;
      c = 0, _ = p = d = null, r = u;
      do {
        var h = r.lane & -536870913, E = h !== r.lane;
        if (E ? (ot & h) === h : (a & h) === h) {
          h !== 0 && h === ba && (pf = !0), _ !== null && (_ = _.next = {
            lane: 0,
            tag: r.tag,
            payload: r.payload,
            callback: null,
            next: null
          });
          t: {
            var H = t, q = r;
            h = l;
            var et = e;
            switch (q.tag) {
              case 1:
                if (H = q.payload, typeof H == "function") {
                  A = H.call(et, A, h);
                  break t;
                }
                A = H;
                break t;
              case 3:
                H.flags = H.flags & -65537 | 128;
              case 0:
                if (H = q.payload, h = typeof H == "function" ? H.call(et, A, h) : H, h == null) break t;
                A = Y({}, A, h);
                break t;
              case 2:
                Ve = !0;
            }
          }
          h = r.callback, h !== null && (t.flags |= 64, E && (t.flags |= 8192), E = n.callbacks, E === null ? n.callbacks = [h] : E.push(h));
        } else
          E = {
            lane: h,
            tag: r.tag,
            payload: r.payload,
            callback: r.callback,
            next: null
          }, _ === null ? (p = _ = E, d = A) : _ = _.next = E, c |= h;
        if (r = r.next, r === null) {
          if (r = n.shared.pending, r === null)
            break;
          E = r, r = E.next, E.next = null, n.lastBaseUpdate = E, n.shared.pending = null;
        }
      } while (!0);
      _ === null && (d = A), n.baseState = d, n.firstBaseUpdate = p, n.lastBaseUpdate = _, u === null && (n.shared.lanes = 0), Fe |= c, t.lanes = c, t.memoizedState = A;
    }
  }
  function rd(t, l) {
    if (typeof t != "function")
      throw Error(f(191, t));
    t.call(l);
  }
  function sd(t, l) {
    var e = t.callbacks;
    if (e !== null)
      for (t.callbacks = null, t = 0; t < e.length; t++)
        rd(e[t], l);
  }
  var Le = Ul(null), hi = Ul(0);
  function dd(t, l) {
    t = Ne, Nt(hi, t), Nt(Le, l), Ne = t | l.baseLanes;
  }
  function Sf() {
    Nt(hi, Ne), Nt(Le, Le.current);
  }
  function Tf() {
    Ne = hi.current, wt(Le), wt(hi);
  }
  var ll = Ul(null), il = null;
  function Ze(t) {
    var l = t.alternate;
    Nt(el, el.current & 1), Nt(ll, t), il === null && (l === null || Le.current !== null || l.memoizedState !== null) && (il = t);
  }
  function Ef(t) {
    Nt(el, el.current), Nt(ll, t), il === null && (il = t);
  }
  function md(t) {
    t.tag === 22 ? (Nt(el, el.current), Nt(ll, t), il === null && (il = t)) : we();
  }
  function we() {
    Nt(el, el.current), Nt(ll, ll.current);
  }
  function zl(t) {
    wt(ll), il === t && (il = null), wt(el);
  }
  var el = Ul(0);
  function eu(t, l) {
    Nt(ll, ll.current), Nt(el, l);
  }
  function _f(t) {
    wt(el), wt(ll), il === t && (il = null);
  }
  function bi(t) {
    for (var l = t; l !== null; ) {
      if (l.tag === 13) {
        var e = l.memoizedState;
        if (e !== null && (e = e.dehydrated, e === null || Ko(e) || $o(e)))
          return l;
      } else if (l.tag === 19 && l.memoizedProps.revealOrder !== "independent") {
        if ((l.flags & 128) !== 0) return l;
      } else if (l.child !== null) {
        l.child.return = l, l = l.child;
        continue;
      }
      if (l === t) break;
      for (; l.sibling === null; ) {
        if (l.return === null || l.return === t) return null;
        l = l.return;
      }
      l.sibling.return = l.return, l = l.sibling;
    }
    return null;
  }
  var Ee = 0, lt = null, At = null, Xt = null, pi = !1, en = !1, _a = !1, Si = 0, au = 0, an = null, Bg = 0;
  function Bt() {
    throw Error(f(321));
  }
  function zf(t, l) {
    if (l === null) return !1;
    for (var e = 0; e < l.length && e < t.length; e++)
      if (!_l(t[e], l[e])) return !1;
    return !0;
  }
  function Of(t, l, e, a, n, u) {
    return Ee = u, lt = l, l.memoizedState = null, l.updateQueue = null, l.lanes = 0, V.H = t === null || t.memoizedState === null ? Wd : kd, _a = !1, u = e(a, n), _a = !1, en && (u = vd(
      l,
      e,
      a,
      n
    )), yd(t), u;
  }
  function yd(t) {
    V.H = Ai;
    var l = At !== null && At.next !== null;
    if (Ee = 0, Xt = At = lt = null, pi = !1, au = 0, an = null, l) throw Error(f(300));
    t === null || Qt || (t = t.dependencies, t !== null && ri(t) && (Qt = !0));
  }
  function vd(t, l, e, a) {
    lt = t;
    var n = 0;
    do {
      if (en && (an = null), au = 0, en = !1, 25 <= n) throw Error(f(301));
      if (n += 1, Xt = At = null, t.updateQueue != null) {
        var u = t.updateQueue;
        u.lastEffect = null, u.events = null, u.stores = null, u.memoCache != null && (u.memoCache.index = 0);
      }
      V.H = Zg, u = l(e, a);
    } while (en);
    return u;
  }
  function Yg() {
    var t = V.H, l = t.useState()[0];
    return l = typeof l.then == "function" ? nu(l) : l, t = t.useState()[0], (At !== null ? At.memoizedState : null) !== t && (lt.flags |= 1024), l;
  }
  function Nf() {
    var t = Si !== 0;
    return Si = 0, t;
  }
  function Af(t, l, e) {
    l.updateQueue = t.updateQueue, l.flags &= -2053, t.lanes &= ~e;
  }
  function Cf(t) {
    if (pi) {
      for (t = t.memoizedState; t !== null; ) {
        var l = t.queue;
        l !== null && (l.pending = null), t = t.next;
      }
      pi = !1;
    }
    Ee = 0, Xt = At = lt = null, en = !1, au = Si = 0, an = null;
  }
  function fl() {
    var t = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null
    };
    return Xt === null ? lt.memoizedState = Xt = t : Xt = Xt.next = t, Xt;
  }
  function qt() {
    if (At === null) {
      var t = lt.alternate;
      t = t !== null ? t.memoizedState : null;
    } else t = At.next;
    var l = Xt === null ? lt.memoizedState : Xt.next;
    if (l !== null)
      Xt = l, At = t;
    else {
      if (t === null)
        throw lt.alternate === null ? Error(f(467)) : Error(f(310));
      At = t, t = {
        memoizedState: At.memoizedState,
        baseState: At.baseState,
        baseQueue: At.baseQueue,
        queue: At.queue,
        next: null
      }, Xt === null ? lt.memoizedState = Xt = t : Xt = Xt.next = t;
    }
    return Xt;
  }
  function Ti() {
    return { lastEffect: null, events: null, stores: null, memoCache: null };
  }
  function nu(t) {
    var l = au;
    return au += 1, an === null && (an = []), t = ud(an, t, l), l = lt, (Xt === null ? l.memoizedState : Xt.next) === null && (l = l.alternate, V.H = l === null || l.memoizedState === null ? Wd : kd), t;
  }
  function Ei(t) {
    if (t !== null && typeof t == "object") {
      if (typeof t.then == "function") return nu(t);
      if (t.$$typeof === R) return;
      if (t.$$typeof === Gt) return tl(t);
    }
    throw Error(f(438, String(t)));
  }
  function Mf(t) {
    var l = null, e = lt.updateQueue;
    if (e !== null && (l = e.memoCache), l == null) {
      var a = lt.alternate;
      a !== null && (a = a.updateQueue, a !== null && (a = a.memoCache, a != null && (l = {
        data: a.data.map(function(n) {
          return n.slice();
        }),
        index: 0
      })));
    }
    if (l == null && (l = { data: [], index: 0 }), e === null && (e = Ti(), lt.updateQueue = e), e.memoCache = l, e = l.data[l.index], e === void 0)
      for (e = l.data[l.index] = Array(t), a = 0; a < t; a++)
        e[a] = de;
    return l.index++, e;
  }
  function _e(t, l) {
    return typeof l == "function" ? l(t) : l;
  }
  function _i(t) {
    var l = qt();
    return Rf(l, At, t);
  }
  function Rf(t, l, e) {
    var a = t.queue;
    if (a === null) throw Error(f(311));
    a.lastRenderedReducer = e;
    var n = t.baseQueue, u = a.pending;
    if (u !== null) {
      if (n !== null) {
        var c = n.next;
        n.next = u.next, u.next = c;
      }
      l.baseQueue = n = u, a.pending = null;
    }
    if (u = t.baseState, n === null) t.memoizedState = u;
    else {
      l = n.next;
      var r = c = null, d = null, p = l, _ = !1;
      do {
        var A = p.lane & -536870913;
        if (A !== p.lane ? (ot & A) === A : (Ee & A) === A) {
          var h = p.revertLane;
          if (h === 0)
            d !== null && (d = d.next = {
              lane: 0,
              revertLane: 0,
              gesture: null,
              action: p.action,
              hasEagerState: p.hasEagerState,
              eagerState: p.eagerState,
              next: null
            }), A === ba && (_ = !0);
          else if ((Ee & h) === h) {
            p = p.next, h === ba && (_ = !0);
            continue;
          } else
            A = {
              lane: 0,
              revertLane: p.revertLane,
              gesture: null,
              action: p.action,
              hasEagerState: p.hasEagerState,
              eagerState: p.eagerState,
              next: null
            }, d === null ? (r = d = A, c = u) : d = d.next = A, lt.lanes |= h, Fe |= h;
          A = p.action, _a && e(u, A), u = p.hasEagerState ? p.eagerState : e(u, A);
        } else
          h = {
            lane: A,
            revertLane: p.revertLane,
            gesture: p.gesture,
            action: p.action,
            hasEagerState: p.hasEagerState,
            eagerState: p.eagerState,
            next: null
          }, d === null ? (r = d = h, c = u) : d = d.next = h, lt.lanes |= A, Fe |= A;
        p = p.next;
      } while (p !== null && p !== l);
      if (d === null ? c = u : d.next = r, !_l(u, t.memoizedState) && (Qt = !0, _ && (e = Pa, e !== null)))
        throw e;
      t.memoizedState = u, t.baseState = c, t.baseQueue = d, a.lastRenderedState = u;
    }
    return n === null && (a.lanes = 0), [t.memoizedState, a.dispatch];
  }
  function Df(t) {
    var l = qt(), e = l.queue;
    if (e === null) throw Error(f(311));
    e.lastRenderedReducer = t;
    var a = e.dispatch, n = e.pending, u = l.memoizedState;
    if (n !== null) {
      e.pending = null;
      var c = n = n.next;
      do
        u = t(u, c.action), c = c.next;
      while (c !== n);
      _l(u, l.memoizedState) || (Qt = !0), l.memoizedState = u, l.baseQueue === null && (l.baseState = u), e.lastRenderedState = u;
    }
    return [u, a];
  }
  function gd(t, l, e) {
    var a = lt, n = qt(), u = nt;
    if (u) {
      if (e === void 0) throw Error(f(407));
      e = e();
    } else e = l();
    var c = !_l(
      (At || n).memoizedState,
      e
    );
    if (c && (n.memoizedState = e, Qt = !0), n = n.queue, xf(pd.bind(null, a, n, t), [
      t
    ]), t = n.getSnapshot !== l || c || Xt !== null && (Xt.memoizedState.tag & 1) !== 0, nn(
      t ? 9 : 8,
      { destroy: void 0 },
      bd.bind(null, a, n, e, l),
      null
    ), t) {
      if (a.flags |= 2048, Mt === null) throw Error(f(349));
      u || (Ee & 127) !== 0 || hd(a, l, e);
    }
    return e;
  }
  function hd(t, l, e) {
    t.flags |= 16384, t = { getSnapshot: l, value: e }, l = lt.updateQueue, l === null ? (l = Ti(), lt.updateQueue = l, l.stores = [t]) : (e = l.stores, e === null ? l.stores = [t] : e.push(t));
  }
  function bd(t, l, e, a) {
    l.value = e, l.getSnapshot = a, Sd(l) && Td(t);
  }
  function pd(t, l, e) {
    return e(function() {
      Sd(l) && Td(t);
    });
  }
  function Sd(t) {
    var l = t.getSnapshot;
    t = t.value;
    try {
      var e = l();
      return !_l(t, e);
    } catch {
      return !0;
    }
  }
  function Td(t) {
    var l = da(t, 2);
    l !== null && gl(l, t, 2);
  }
  function Uf(t) {
    var l = fl();
    if (typeof t == "function") {
      var e = t;
      if (t = e(), _a) {
        Ue(!0);
        try {
          e();
        } finally {
          Ue(!1);
        }
      }
    }
    return l.memoizedState = l.baseState = t, l.queue = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: _e,
      lastRenderedState: t
    }, l;
  }
  function Ed(t, l, e, a) {
    return t.baseState = e, Rf(
      t,
      At,
      typeof a == "function" ? a : _e
    );
  }
  function qg(t, l, e, a, n) {
    if (Ni(t)) throw Error(f(485));
    if (t = l.action, t !== null) {
      var u = {
        payload: n,
        action: t,
        next: null,
        isTransition: !0,
        status: "pending",
        value: null,
        reason: null,
        listeners: [],
        then: function(c) {
          u.listeners.push(c);
        }
      };
      V.T !== null ? e(!0) : u.isTransition = !1, a(u), e = l.pending, e === null ? (u.next = l.pending = u, _d(l, u)) : (u.next = e.next, l.pending = e.next = u);
    }
  }
  function _d(t, l) {
    var e = l.action, a = l.payload, n = t.state;
    if (l.isTransition) {
      var u = V.T, c = {};
      c.types = u !== null ? u.types : null, V.T = c;
      try {
        var r = e(n, a), d = V.S;
        d !== null && d(c, r), zd(t, l, r);
      } catch (p) {
        Hf(t, l, p);
      } finally {
        u !== null && c.types !== null && (u.types = c.types), V.T = u;
      }
    } else
      try {
        u = e(n, a), zd(t, l, u);
      } catch (p) {
        Hf(t, l, p);
      }
  }
  function zd(t, l, e) {
    e !== null && typeof e == "object" && typeof e.then == "function" ? e.then(
      function(a) {
        Od(t, l, a);
      },
      function(a) {
        return Hf(t, l, a);
      }
    ) : Od(t, l, e);
  }
  function Od(t, l, e) {
    l.status = "fulfilled", l.value = e, Nd(l), t.state = e, l = t.pending, l !== null && (e = l.next, e === l ? t.pending = null : (e = e.next, l.next = e, _d(t, e)));
  }
  function Hf(t, l, e) {
    var a = t.pending;
    if (t.pending = null, a !== null) {
      a = a.next;
      do
        l.status = "rejected", l.reason = e, Nd(l), l = l.next;
      while (l !== a);
    }
    t.action = null;
  }
  function Nd(t) {
    t = t.listeners;
    for (var l = 0; l < t.length; l++) (0, t[l])();
  }
  function Ad(t, l) {
    return l;
  }
  function Cd(t, l) {
    if (nt) {
      var e = Mt.formState;
      if (e !== null) {
        t: {
          var a = lt;
          if (nt) {
            if (Rt) {
              l: {
                for (var n = Rt, u = Gl; n.nodeType !== 8; ) {
                  if (!u) {
                    n = null;
                    break l;
                  }
                  if (n = Xl(
                    n.nextSibling
                  ), n === null) {
                    n = null;
                    break l;
                  }
                }
                u = n.data, n = u === "F!" || u === "F" ? n : null;
              }
              if (n) {
                Rt = Xl(
                  n.nextSibling
                ), a = n.data === "F!";
                break t;
              }
            }
            Ye(a);
          }
          a = !1;
        }
        a && (l = e[0]);
      }
    }
    return e = fl(), e.memoizedState = e.baseState = l, a = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: Ad,
      lastRenderedState: l
    }, e.queue = a, e = $d.bind(
      null,
      lt,
      a
    ), a.dispatch = e, a = Uf(!1), u = Gf.bind(
      null,
      lt,
      !1,
      a.queue
    ), a = fl(), n = {
      state: l,
      dispatch: null,
      action: t,
      pending: null
    }, a.queue = n, e = qg.bind(
      null,
      lt,
      n,
      u,
      e
    ), n.dispatch = e, a.memoizedState = t, [l, e, !1];
  }
  function Md(t) {
    var l = qt();
    return Rd(l, At, t);
  }
  function Rd(t, l, e) {
    if (l = Rf(
      t,
      l,
      Ad
    )[0], t = _i(_e)[0], typeof l == "object" && l !== null && typeof l.then == "function")
      try {
        var a = nu(l);
      } catch (c) {
        throw c === tn ? mi : c;
      }
    else a = l;
    l = qt();
    var n = l.queue, u = n.dispatch;
    return e !== l.memoizedState && (lt.flags |= 2048, nn(
      9,
      { destroy: void 0 },
      Gg.bind(null, n, e),
      null
    )), [a, u, t];
  }
  function Gg(t, l) {
    t.action = l;
  }
  function Dd(t) {
    var l = qt(), e = At;
    if (e !== null)
      return Rd(l, e, t);
    qt(), l = l.memoizedState, e = qt();
    var a = e.queue.dispatch;
    return e.memoizedState = t, [l, a, !1];
  }
  function nn(t, l, e, a) {
    return t = { tag: t, create: e, deps: a, inst: l, next: null }, l = lt.updateQueue, l === null && (l = Ti(), lt.updateQueue = l), e = l.lastEffect, e === null ? l.lastEffect = t.next = t : (a = e.next, e.next = t, t.next = a, l.lastEffect = t), t;
  }
  function Ud() {
    return qt().memoizedState;
  }
  function zi(t, l, e, a) {
    var n = fl();
    lt.flags |= t, n.memoizedState = nn(
      1 | l,
      { destroy: void 0 },
      e,
      a === void 0 ? null : a
    );
  }
  function Oi(t, l, e, a) {
    var n = qt();
    a = a === void 0 ? null : a;
    var u = n.memoizedState.inst;
    At !== null && a !== null && zf(a, At.memoizedState.deps) ? n.memoizedState = nn(l, u, e, a) : (lt.flags |= t, n.memoizedState = nn(
      1 | l,
      u,
      e,
      a
    ));
  }
  function Hd(t, l) {
    zi(8390656, 8, t, l);
  }
  function xf(t, l) {
    Oi(2048, 8, t, l);
  }
  function Vg(t) {
    lt.flags |= 4;
    var l = lt.updateQueue;
    if (l === null)
      l = Ti(), lt.updateQueue = l, l.events = [t];
    else {
      var e = l.events;
      e === null ? l.events = [t] : e.push(t);
    }
  }
  function xd(t) {
    var l = qt().memoizedState;
    return Vg({ ref: l, nextImpl: t }), function() {
      if ((bt & 2) !== 0) throw Error(f(440));
      return l.impl.apply(void 0, arguments);
    };
  }
  function jd(t, l) {
    return Oi(4, 2, t, l);
  }
  function Bd(t, l) {
    return Oi(4, 4, t, l);
  }
  function Yd(t, l) {
    if (typeof l == "function") {
      t = t();
      var e = l(t);
      return function() {
        typeof e == "function" ? e() : l(null);
      };
    }
    if (l != null)
      return t = t(), l.current = t, function() {
        l.current = null;
      };
  }
  function qd(t, l, e) {
    e = e != null ? e.concat([t]) : null, Oi(4, 4, Yd.bind(null, l, t), e);
  }
  function jf() {
  }
  function Gd(t, l) {
    var e = qt();
    l = l === void 0 ? null : l;
    var a = e.memoizedState;
    return l !== null && zf(l, a[1]) ? a[0] : (e.memoizedState = [t, l], t);
  }
  function Vd(t, l) {
    var e = qt();
    l = l === void 0 ? null : l;
    var a = e.memoizedState;
    if (l !== null && zf(l, a[1]))
      return a[0];
    if (a = t(), _a) {
      Ue(!0);
      try {
        t();
      } finally {
        Ue(!1);
      }
    }
    return e.memoizedState = [a, l], a;
  }
  function Bf(t, l, e) {
    return e === void 0 || (Ee & 1073741824) !== 0 && (ot & 261930) === 0 ? t.memoizedState = l : (t.memoizedState = e, t = Wm(), lt.lanes |= t, Fe |= t, e);
  }
  function Xd(t, l, e, a) {
    return _l(e, l) ? e : Le.current !== null ? (t = Bf(t, e, a), _l(t, l) || (Qt = !0), t) : (Ee & 106) === 0 || (Ee & 1073741824) !== 0 && (ot & 261930) === 0 ? (Qt = !0, t.memoizedState = e) : (t = Wm(), lt.lanes |= t, Fe |= t, l);
  }
  function Qd(t, l, e, a, n) {
    var u = k.p;
    k.p = u !== 0 && 8 > u ? u : 8;
    var c = V.T, r = {};
    r.types = c !== null ? c.types : null, V.T = r, Gf(t, !1, l, e);
    try {
      var d = n(), p = V.S;
      if (p !== null && p(r, d), d !== null && typeof d == "object" && typeof d.then == "function") {
        var _ = jg(
          d,
          a
        );
        uu(
          t,
          l,
          _,
          Cl(t)
        );
      } else
        uu(
          t,
          l,
          a,
          Cl(t)
        );
    } catch (A) {
      uu(
        t,
        l,
        { then: function() {
        }, status: "rejected", reason: A },
        Cl()
      );
    } finally {
      k.p = u, c !== null && r.types !== null && (c.types = r.types), V.T = c;
    }
  }
  function Xg() {
  }
  function Yf(t, l, e, a) {
    if (t.tag !== 5) throw Error(f(476));
    var n = Ld(t).queue;
    Qd(
      t,
      n,
      l,
      wl,
      e === null ? Xg : function() {
        return Zd(t), e(a);
      }
    );
  }
  function Ld(t) {
    var l = t.memoizedState;
    if (l !== null) return l;
    l = {
      memoizedState: wl,
      baseState: wl,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: _e,
        lastRenderedState: wl
      },
      next: null
    };
    var e = {};
    return l.next = {
      memoizedState: e,
      baseState: e,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: _e,
        lastRenderedState: e
      },
      next: null
    }, t.memoizedState = l, t = t.alternate, t !== null && (t.memoizedState = l), l;
  }
  function Zd(t) {
    var l = Ld(t);
    l.next === null && (l = t.alternate.memoizedState), uu(
      t,
      l.next.queue,
      {},
      Cl()
    );
  }
  function qf() {
    return tl(zn);
  }
  function wd() {
    return qt().memoizedState;
  }
  function Kd() {
    return qt().memoizedState;
  }
  function Qg(t) {
    for (var l = t.return; l !== null; ) {
      switch (l.tag) {
        case 24:
        case 3:
          var e = Cl();
          t = Xe(e);
          var a = Qe(l, t, e);
          a !== null && (gl(a, l, e), Pn(a, l, e)), l = { cache: df() }, t.payload = l;
          return;
      }
      l = l.return;
    }
  }
  function Lg(t, l, e) {
    var a = Cl();
    e = {
      lane: a,
      revertLane: 0,
      gesture: null,
      action: e,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, Ni(t) ? Jd(l, e) : (e = ef(t, l, e, a), e !== null && (gl(e, t, a), Fd(e, l, a)));
  }
  function $d(t, l, e) {
    var a = Cl();
    uu(t, l, e, a);
  }
  function uu(t, l, e, a) {
    var n = {
      lane: a,
      revertLane: 0,
      gesture: null,
      action: e,
      hasEagerState: !1,
      eagerState: null,
      next: null
    };
    if (Ni(t)) Jd(l, n);
    else {
      var u = t.alternate;
      if (t.lanes === 0 && (u === null || u.lanes === 0) && (u = l.lastRenderedReducer, u !== null))
        try {
          var c = l.lastRenderedState, r = u(c, e);
          if (n.hasEagerState = !0, n.eagerState = r, _l(r, c))
            return ai(t, l, n, 0), Mt === null && ei(), !1;
        } catch {
        }
      if (e = ef(t, l, n, a), e !== null)
        return gl(e, t, a), Fd(e, l, a), !0;
    }
    return !1;
  }
  function Gf(t, l, e, a) {
    if (a = {
      lane: 2,
      revertLane: Ro(),
      gesture: null,
      action: a,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, Ni(t)) {
      if (l) throw Error(f(479));
    } else
      l = ef(
        t,
        e,
        a,
        2
      ), l !== null && gl(l, t, 2);
  }
  function Ni(t) {
    var l = t.alternate;
    return t === lt || l !== null && l === lt;
  }
  function Jd(t, l) {
    en = pi = !0;
    var e = t.pending;
    e === null ? l.next = l : (l.next = e.next, e.next = l), t.pending = l;
  }
  function Fd(t, l, e) {
    if ((e & 4194048) !== 0) {
      var a = l.lanes;
      a &= t.pendingLanes, e |= a, l.lanes = e, Wr(t, e);
    }
  }
  var Ai = {
    readContext: tl,
    use: Ei,
    useCallback: Bt,
    useContext: Bt,
    useEffect: Bt,
    useImperativeHandle: Bt,
    useLayoutEffect: Bt,
    useInsertionEffect: Bt,
    useMemo: Bt,
    useReducer: Bt,
    useRef: Bt,
    useState: Bt,
    useDebugValue: Bt,
    useDeferredValue: Bt,
    useTransition: Bt,
    useSyncExternalStore: Bt,
    useId: Bt,
    useHostTransitionStatus: Bt,
    useFormState: Bt,
    useActionState: Bt,
    useOptimistic: Bt,
    useMemoCache: Bt,
    useCacheRefresh: Bt,
    useEffectEvent: Bt
  }, Wd = {
    readContext: tl,
    use: Ei,
    useCallback: function(t, l) {
      return fl().memoizedState = [
        t,
        l === void 0 ? null : l
      ], t;
    },
    useContext: tl,
    useEffect: Hd,
    useImperativeHandle: function(t, l, e) {
      e = e != null ? e.concat([t]) : null, zi(
        4194308,
        4,
        Yd.bind(null, l, t),
        e
      );
    },
    useLayoutEffect: function(t, l) {
      return zi(4194308, 4, t, l);
    },
    useInsertionEffect: function(t, l) {
      zi(4, 2, t, l);
    },
    useMemo: function(t, l) {
      var e = fl();
      l = l === void 0 ? null : l;
      var a = t();
      if (_a) {
        Ue(!0);
        try {
          t();
        } finally {
          Ue(!1);
        }
      }
      return e.memoizedState = [a, l], a;
    },
    useReducer: function(t, l, e) {
      var a = fl();
      if (e !== void 0) {
        var n = e(l);
        if (_a) {
          Ue(!0);
          try {
            e(l);
          } finally {
            Ue(!1);
          }
        }
      } else n = l;
      return a.memoizedState = a.baseState = n, t = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: t,
        lastRenderedState: n
      }, a.queue = t, t = t.dispatch = Lg.bind(
        null,
        lt,
        t
      ), [a.memoizedState, t];
    },
    useRef: function(t) {
      var l = fl();
      return t = { current: t }, l.memoizedState = t;
    },
    useState: function(t) {
      t = Uf(t);
      var l = t.queue, e = $d.bind(null, lt, l);
      return l.dispatch = e, [t.memoizedState, e];
    },
    useDebugValue: jf,
    useDeferredValue: function(t, l) {
      var e = fl();
      return Bf(e, t, l);
    },
    useTransition: function() {
      var t = Uf(!1);
      return t = Qd.bind(
        null,
        lt,
        t.queue,
        !0,
        !1
      ), fl().memoizedState = t, [!1, t];
    },
    useSyncExternalStore: function(t, l, e) {
      var a = lt, n = fl();
      if (nt) {
        if (e === void 0)
          throw Error(f(407));
        e = e();
      } else {
        if (e = l(), Mt === null)
          throw Error(f(349));
        (ot & 127) !== 0 || hd(a, l, e);
      }
      n.memoizedState = e;
      var u = { value: e, getSnapshot: l };
      return n.queue = u, Hd(pd.bind(null, a, u, t), [
        t
      ]), a.flags |= 2048, nn(
        9,
        { destroy: void 0 },
        bd.bind(
          null,
          a,
          u,
          e,
          l
        ),
        null
      ), e;
    },
    useId: function() {
      var t = fl(), l = Mt.identifierPrefix;
      if (nt) {
        var e = ee, a = le;
        e = (a & ~(1 << 32 - Tl(a) - 1)).toString(32) + e, l = "_" + l + "R_" + e, e = Si++, 0 < e && (l += "H" + e.toString(32)), l += "_";
      } else
        e = Bg++, l = "_" + l + "r_" + e.toString(32) + "_";
      return t.memoizedState = l;
    },
    useHostTransitionStatus: qf,
    useFormState: Cd,
    useActionState: Cd,
    useOptimistic: function(t) {
      var l = fl();
      l.memoizedState = l.baseState = t;
      var e = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: null,
        lastRenderedState: null
      };
      return l.queue = e, l = Gf.bind(
        null,
        lt,
        !0,
        e
      ), e.dispatch = l, [t, l];
    },
    useMemoCache: Mf,
    useCacheRefresh: function() {
      return fl().memoizedState = Qg.bind(
        null,
        lt
      );
    },
    useEffectEvent: function(t) {
      var l = fl(), e = { impl: t };
      return l.memoizedState = e, function() {
        if ((bt & 2) !== 0)
          throw Error(f(440));
        return e.impl.apply(void 0, arguments);
      };
    }
  }, kd = {
    readContext: tl,
    use: Ei,
    useCallback: Gd,
    useContext: tl,
    useEffect: xf,
    useImperativeHandle: qd,
    useInsertionEffect: jd,
    useLayoutEffect: Bd,
    useMemo: Vd,
    useReducer: _i,
    useRef: Ud,
    useState: function() {
      return _i(_e);
    },
    useDebugValue: jf,
    useDeferredValue: function(t, l) {
      var e = qt();
      return Xd(
        e,
        At.memoizedState,
        t,
        l
      );
    },
    useTransition: function() {
      var t = _i(_e)[0], l = qt().memoizedState;
      return [
        typeof t == "boolean" ? t : nu(t),
        l
      ];
    },
    useSyncExternalStore: gd,
    useId: wd,
    useHostTransitionStatus: qf,
    useFormState: Md,
    useActionState: Md,
    useOptimistic: function(t, l) {
      var e = qt();
      return Ed(e, At, t, l);
    },
    useMemoCache: Mf,
    useCacheRefresh: Kd,
    useEffectEvent: xd
  }, Zg = {
    readContext: tl,
    use: Ei,
    useCallback: Gd,
    useContext: tl,
    useEffect: xf,
    useImperativeHandle: qd,
    useInsertionEffect: jd,
    useLayoutEffect: Bd,
    useMemo: Vd,
    useReducer: Df,
    useRef: Ud,
    useState: function() {
      return Df(_e);
    },
    useDebugValue: jf,
    useDeferredValue: function(t, l) {
      var e = qt();
      return At === null ? Bf(e, t, l) : Xd(
        e,
        At.memoizedState,
        t,
        l
      );
    },
    useTransition: function() {
      var t = Df(_e)[0], l = qt().memoizedState;
      return [
        typeof t == "boolean" ? t : nu(t),
        l
      ];
    },
    useSyncExternalStore: gd,
    useId: wd,
    useHostTransitionStatus: qf,
    useFormState: Dd,
    useActionState: Dd,
    useOptimistic: function(t, l) {
      var e = qt();
      return At !== null ? Ed(e, At, t, l) : (e.baseState = t, [t, e.queue.dispatch]);
    },
    useMemoCache: Mf,
    useCacheRefresh: Kd,
    useEffectEvent: xd
  };
  function Vf(t, l, e, a) {
    l = t.memoizedState, e = e(a, l), e = e == null ? l : Y({}, l, e), t.memoizedState = e, t.lanes === 0 && (t.updateQueue.baseState = e);
  }
  var Xf = {
    enqueueSetState: function(t, l, e) {
      t = t._reactInternals;
      var a = Cl(), n = Xe(a);
      n.payload = l, e != null && (n.callback = e), l = Qe(t, n, a), l !== null && (gl(l, t, a), Pn(l, t, a));
    },
    enqueueReplaceState: function(t, l, e) {
      t = t._reactInternals;
      var a = Cl(), n = Xe(a);
      n.tag = 1, n.payload = l, e != null && (n.callback = e), l = Qe(t, n, a), l !== null && (gl(l, t, a), Pn(l, t, a));
    },
    enqueueForceUpdate: function(t, l) {
      t = t._reactInternals;
      var e = Cl(), a = Xe(e);
      a.tag = 2, l != null && (a.callback = l), l = Qe(t, a, e), l !== null && (gl(l, t, e), Pn(l, t, e));
    }
  };
  function Id(t, l, e, a, n, u, c) {
    return t = t.stateNode, typeof t.shouldComponentUpdate == "function" ? t.shouldComponentUpdate(a, u, c) : l.prototype && l.prototype.isPureReactComponent ? !wn(e, a) || !wn(n, u) : !0;
  }
  function Pd(t, l, e, a) {
    t = l.state, typeof l.componentWillReceiveProps == "function" && l.componentWillReceiveProps(e, a), typeof l.UNSAFE_componentWillReceiveProps == "function" && l.UNSAFE_componentWillReceiveProps(e, a), l.state !== t && Xf.enqueueReplaceState(l, l.state, null);
  }
  function za(t, l) {
    var e = l;
    if ("ref" in l) {
      e = {};
      for (var a in l)
        a !== "ref" && (e[a] = l[a]);
    }
    if (t = t.defaultProps) {
      e === l && (e = Y({}, e));
      for (var n in t)
        e[n] === void 0 && (e[n] = t[n]);
    }
    return e;
  }
  function tm(t) {
    li(t);
  }
  function lm(t) {
    console.error(t);
  }
  function em(t) {
    li(t);
  }
  function Ci(t, l) {
    try {
      var e = t.onUncaughtError;
      e(l.value, { componentStack: l.stack });
    } catch (a) {
      setTimeout(function() {
        throw a;
      });
    }
  }
  function am(t, l, e) {
    try {
      var a = t.onCaughtError;
      a(e.value, {
        componentStack: e.stack,
        errorBoundary: l.tag === 1 ? l.stateNode : null
      });
    } catch (n) {
      setTimeout(function() {
        throw n;
      });
    }
  }
  function Qf(t, l, e) {
    return e = Xe(e), e.tag = 3, e.payload = { element: null }, e.callback = function() {
      Ci(t, l);
    }, e;
  }
  function nm(t) {
    return t = Xe(t), t.tag = 3, t;
  }
  function um(t, l, e, a) {
    var n = e.type.getDerivedStateFromError;
    if (typeof n == "function") {
      var u = a.value;
      t.payload = function() {
        return n(u);
      }, t.callback = function() {
        am(l, e, a);
      };
    }
    var c = e.stateNode;
    c !== null && typeof c.componentDidCatch == "function" && (t.callback = function() {
      am(l, e, a), typeof n != "function" && (We === null ? We = /* @__PURE__ */ new Set([this]) : We.add(this));
      var r = a.stack;
      this.componentDidCatch(a.value, {
        componentStack: r !== null ? r : ""
      });
    });
  }
  function wg(t, l, e, a, n) {
    if (e.flags |= 32768, a !== null && typeof a == "object" && typeof a.then == "function") {
      if (l = e.alternate, l !== null && ga(
        l,
        e,
        n,
        !0
      ), e = ll.current, e !== null) {
        switch (e.tag) {
          case 31:
          case 13:
          case 19:
            return il === null ? Fi() : e.alternate === null && Yt === 0 && (Yt = 3), e.flags &= -257, e.flags |= 65536, e.lanes = n, a === yi ? e.flags |= 16384 : (l = e.updateQueue, l === null ? e.updateQueue = /* @__PURE__ */ new Set([a]) : l.add(a), Ao(t, a, n)), !1;
          case 22:
            return e.flags |= 65536, a === yi ? e.flags |= 16384 : (l = e.updateQueue, l === null ? (l = {
              transitions: null,
              markerInstances: null,
              retryQueue: /* @__PURE__ */ new Set([a])
            }, e.updateQueue = l) : (e = l.retryQueue, e === null ? l.retryQueue = /* @__PURE__ */ new Set([a]) : e.add(a)), Ao(t, a, n)), !1;
        }
        throw Error(f(435, e.tag));
      }
      return Ao(t, a, n), Fi(), !1;
    }
    if (nt)
      return l = ll.current, l !== null ? ((l.flags & 65536) === 0 && (l.flags |= 256), l.flags |= 65536, l.lanes = n, a !== ff && (t = Error(f(422), { cause: a }), Jn(Bl(t, e)))) : (a !== ff && (l = Error(f(423), {
        cause: a
      }), Jn(
        Bl(l, e)
      )), t = t.current.alternate, t.flags |= 65536, n &= -n, t.lanes |= n, a = Bl(a, e), n = Qf(
        t.stateNode,
        a,
        n
      ), bf(t, n), Yt !== 4 && (Yt = 2)), !1;
    var u = Error(f(520), { cause: a });
    if (u = Bl(u, e), mu === null ? mu = [u] : mu.push(u), Yt !== 4 && (Yt = 2), l === null) return !0;
    a = Bl(a, e), e = l;
    do {
      switch (e.tag) {
        case 3:
          return e.flags |= 65536, t = n & -n, e.lanes |= t, t = Qf(e.stateNode, a, t), bf(e, t), !1;
        case 1:
          if (l = e.type, u = e.stateNode, (e.flags & 128) === 0 && (typeof l.getDerivedStateFromError == "function" || u !== null && typeof u.componentDidCatch == "function" && (We === null || !We.has(u))))
            return e.flags |= 65536, n &= -n, e.lanes |= n, n = nm(n), um(
              n,
              t,
              e,
              a
            ), bf(e, n), !1;
          break;
        case 22:
          if (e.memoizedState !== null)
            return e.flags |= 65536, !1;
      }
      e = e.return;
    } while (e !== null);
    return !1;
  }
  var Lf = Error(f(461)), Qt = !1;
  function Kt(t, l, e, a) {
    l.child = t === null ? od(l, null, e, a) : Ea(
      l,
      t.child,
      e,
      a
    );
  }
  function im(t, l, e, a, n) {
    e = e.render;
    var u = l.ref;
    if ("ref" in a) {
      var c = {};
      for (var r in a)
        r !== "ref" && (c[r] = a[r]);
    } else c = a;
    return ha(l), a = Of(
      t,
      l,
      e,
      c,
      u,
      n
    ), r = Nf(), t !== null && !Qt ? (Af(t, l, n), ze(t, l, n)) : (nt && r && ci(l), l.flags |= 1, Kt(t, l, a, n), l.child);
  }
  function cm(t, l, e, a, n) {
    if (t === null) {
      var u = e.type;
      return typeof u == "function" && !af(u) && u.defaultProps === void 0 && e.compare === null ? (l.tag = 15, l.type = u, fm(
        t,
        l,
        u,
        a,
        n
      )) : (t = ui(
        e.type,
        null,
        a,
        l,
        l.mode,
        n
      ), t.ref = l.ref, t.return = l, l.child = t);
    }
    if (u = t.child, !kf(t, n)) {
      var c = u.memoizedProps;
      if (e = e.compare, e = e !== null ? e : wn, e(c, a) && t.ref === l.ref)
        return ze(t, l, n);
    }
    return l.flags |= 1, t = be(u, a), t.ref = l.ref, t.return = l, l.child = t;
  }
  function fm(t, l, e, a, n) {
    if (t !== null) {
      var u = t.memoizedProps;
      if (wn(u, a) && t.ref === l.ref)
        if (Qt = !1, l.pendingProps = a = u, kf(t, n))
          (t.flags & 131072) !== 0 && (Qt = !0);
        else
          return l.lanes = t.lanes, ze(t, l, n);
    }
    return Zf(
      t,
      l,
      e,
      a,
      n
    );
  }
  function om(t, l, e, a) {
    var n = a.children, u = t !== null ? t.memoizedState : null;
    if (t === null && l.stateNode === null && (l.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    }), a.mode === "hidden") {
      if ((l.flags & 128) !== 0) {
        if (u = u !== null ? u.baseLanes | e : e, t !== null) {
          for (a = l.child = t.child, n = 0; a !== null; )
            n = n | a.lanes | a.childLanes, a = a.sibling;
          a = n & ~u;
        } else a = 0, l.child = null;
        return rm(
          t,
          l,
          u,
          e,
          a
        );
      }
      if ((e & 536870912) !== 0)
        l.memoizedState = { baseLanes: 0, cachePool: null }, t !== null && di(
          l,
          u !== null ? u.cachePool : null
        ), u !== null ? dd(l, u) : Sf(), md(l);
      else
        return a = l.lanes = 536870912, rm(
          t,
          l,
          u !== null ? u.baseLanes | e : e,
          e,
          a
        );
    } else
      u !== null ? (di(l, u.cachePool), dd(l, u), we(), l.memoizedState = null) : (t !== null && di(l, null), Sf(), we());
    return Kt(t, l, n, e), l.child;
  }
  function iu(t, l) {
    return t !== null && t.tag === 22 || l.stateNode !== null || (l.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    }), l.sibling;
  }
  function rm(t, l, e, a, n) {
    var u = yf();
    return u = u === null ? null : { parent: Vt._currentValue, pool: u }, l.memoizedState = {
      baseLanes: e,
      cachePool: u
    }, t !== null && di(l, null), Sf(), md(l), t !== null && ga(t, l, a, !0), l.childLanes = n, null;
  }
  function Mi(t, l) {
    return l = Ri(
      { mode: l.mode, children: l.children },
      t.mode
    ), l.ref = t.ref, t.child = l, l.return = t, l;
  }
  function sm(t, l, e) {
    return Ea(l, t.child, null, e), t = Mi(l, l.pendingProps), t.flags |= 2, zl(l), l.memoizedState = null, t;
  }
  function Kg(t, l, e) {
    var a = l.pendingProps, n = (l.flags & 128) !== 0;
    if (l.flags &= -129, t === null) {
      if (nt) {
        if (a.mode === "hidden")
          return t = Mi(l, a), l.lanes = 536870912, t.memoizedState = { baseLanes: 0, cachePool: null }, iu(null, t);
        if (Ef(l), (t = Rt) ? (t = Y0(
          t,
          Gl
        ), t = t !== null && t.data === "&" ? t : null, t !== null && (l.memoizedState = {
          dehydrated: t,
          treeContext: je !== null ? { id: le, overflow: ee } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, e = Js(t), e.return = l, l.child = e, Jt = l, Rt = null)) : t = null, t === null) throw Ye(l);
        return l.lanes = 536870912, null;
      }
      return Mi(l, a);
    }
    var u = t.memoizedState;
    if (u !== null) {
      var c = u.dehydrated;
      if (Ef(l), n)
        if (l.flags & 256)
          l.flags &= -257, l = sm(
            t,
            l,
            e
          );
        else if (l.memoizedState !== null)
          l.child = t.child, l.flags |= 128, l = null;
        else throw Error(f(558));
      else if (Qt || ga(t, l, e, !1), n = (e & t.childLanes) !== 0, Qt || n) {
        if (Le.current === null) {
          if (a = Mt, a !== null && (c = kr(a, e), c !== 0 && c !== u.retryLane))
            throw u.retryLane = c, da(t, c), gl(a, t, c), Lf;
          Fi();
        }
        l = sm(
          t,
          l,
          e
        );
      } else
        t = u.treeContext, Rt = Xl(c.nextSibling), Jt = l, nt = !0, Be = null, Gl = !1, t !== null && ks(l, t), l = Mi(l, a), l.flags |= 134221824;
      return l;
    }
    return t = be(t.child, {
      mode: a.mode,
      children: a.children
    }), t.ref = l.ref, l.child = t, t.return = l, t;
  }
  function un(t, l) {
    var e = l.ref;
    if (e === null)
      t !== null && t.ref !== null && (l.flags |= 4194816);
    else {
      if (typeof e != "function" && typeof e != "object")
        throw Error(f(284));
      (t === null || t.ref !== e) && (l.flags |= 4194816);
    }
  }
  function Zf(t, l, e, a, n) {
    return ha(l), e = Of(
      t,
      l,
      e,
      a,
      void 0,
      n
    ), a = Nf(), t !== null && !Qt ? (Af(t, l, n), ze(t, l, n)) : (nt && a && ci(l), l.flags |= 1, Kt(t, l, e, n), l.child);
  }
  function dm(t, l, e, a, n, u) {
    return ha(l), l.updateQueue = null, e = vd(
      l,
      a,
      e,
      n
    ), yd(t), a = Nf(), t !== null && !Qt ? (Af(t, l, u), ze(t, l, u)) : (nt && a && ci(l), l.flags |= 1, Kt(t, l, e, u), l.child);
  }
  function mm(t, l, e, a, n) {
    if (ha(l), l.stateNode === null) {
      var u = Fa, c = e.contextType;
      typeof c == "object" && c !== null && (u = tl(c)), u = new e(a, u), l.memoizedState = u.state !== null && u.state !== void 0 ? u.state : null, u.updater = Xf, l.stateNode = u, u._reactInternals = l, u = l.stateNode, u.props = a, u.state = l.memoizedState, u.refs = {}, gf(l), c = e.contextType, u.context = typeof c == "object" && c !== null ? tl(c) : Fa, u.state = l.memoizedState, c = e.getDerivedStateFromProps, typeof c == "function" && (Vf(
        l,
        e,
        c,
        a
      ), u.state = l.memoizedState), typeof e.getDerivedStateFromProps == "function" || typeof u.getSnapshotBeforeUpdate == "function" || typeof u.UNSAFE_componentWillMount != "function" && typeof u.componentWillMount != "function" || (c = u.state, typeof u.componentWillMount == "function" && u.componentWillMount(), typeof u.UNSAFE_componentWillMount == "function" && u.UNSAFE_componentWillMount(), c !== u.state && Xf.enqueueReplaceState(u, u.state, null), lu(l, a, u, n), tu(), u.state = l.memoizedState), typeof u.componentDidMount == "function" && (l.flags |= 4194308), a = !0;
    } else if (t === null) {
      u = l.stateNode;
      var r = l.memoizedProps, d = za(e, r);
      u.props = d;
      var p = u.context, _ = e.contextType;
      c = Fa, typeof _ == "object" && _ !== null && (c = tl(_));
      var A = e.getDerivedStateFromProps;
      _ = typeof A == "function" || typeof u.getSnapshotBeforeUpdate == "function", r = l.pendingProps !== r, _ || typeof u.UNSAFE_componentWillReceiveProps != "function" && typeof u.componentWillReceiveProps != "function" || (r || p !== c) && Pd(
        l,
        u,
        a,
        c
      ), Ve = !1;
      var h = l.memoizedState;
      u.state = h, lu(l, a, u, n), tu(), p = l.memoizedState, r || h !== p || Ve ? (typeof A == "function" && (Vf(
        l,
        e,
        A,
        a
      ), p = l.memoizedState), (d = Ve || Id(
        l,
        e,
        d,
        a,
        h,
        p,
        c
      )) ? (_ || typeof u.UNSAFE_componentWillMount != "function" && typeof u.componentWillMount != "function" || (typeof u.componentWillMount == "function" && u.componentWillMount(), typeof u.UNSAFE_componentWillMount == "function" && u.UNSAFE_componentWillMount()), typeof u.componentDidMount == "function" && (l.flags |= 4194308)) : (typeof u.componentDidMount == "function" && (l.flags |= 4194308), l.memoizedProps = a, l.memoizedState = p), u.props = a, u.state = p, u.context = c, a = d) : (typeof u.componentDidMount == "function" && (l.flags |= 4194308), a = !1);
    } else {
      u = l.stateNode, hf(t, l), c = l.memoizedProps, _ = za(e, c), u.props = _, A = l.pendingProps, h = u.context, p = e.contextType, d = Fa, typeof p == "object" && p !== null && (d = tl(p)), r = e.getDerivedStateFromProps, (p = typeof r == "function" || typeof u.getSnapshotBeforeUpdate == "function") || typeof u.UNSAFE_componentWillReceiveProps != "function" && typeof u.componentWillReceiveProps != "function" || (c !== A || h !== d) && Pd(
        l,
        u,
        a,
        d
      ), Ve = !1, h = l.memoizedState, u.state = h, lu(l, a, u, n), tu();
      var E = l.memoizedState;
      c !== A || h !== E || Ve || t !== null && t.dependencies !== null && ri(t.dependencies) ? (typeof r == "function" && (Vf(
        l,
        e,
        r,
        a
      ), E = l.memoizedState), (_ = Ve || Id(
        l,
        e,
        _,
        a,
        h,
        E,
        d
      ) || t !== null && t.dependencies !== null && ri(t.dependencies)) ? (p || typeof u.UNSAFE_componentWillUpdate != "function" && typeof u.componentWillUpdate != "function" || (typeof u.componentWillUpdate == "function" && u.componentWillUpdate(a, E, d), typeof u.UNSAFE_componentWillUpdate == "function" && u.UNSAFE_componentWillUpdate(
        a,
        E,
        d
      )), typeof u.componentDidUpdate == "function" && (l.flags |= 4), typeof u.getSnapshotBeforeUpdate == "function" && (l.flags |= 1024)) : (typeof u.componentDidUpdate != "function" || c === t.memoizedProps && h === t.memoizedState || (l.flags |= 4), typeof u.getSnapshotBeforeUpdate != "function" || c === t.memoizedProps && h === t.memoizedState || (l.flags |= 1024), l.memoizedProps = a, l.memoizedState = E), u.props = a, u.state = E, u.context = d, a = _) : (typeof u.componentDidUpdate != "function" || c === t.memoizedProps && h === t.memoizedState || (l.flags |= 4), typeof u.getSnapshotBeforeUpdate != "function" || c === t.memoizedProps && h === t.memoizedState || (l.flags |= 1024), a = !1);
    }
    return u = a, un(t, l), a = (l.flags & 128) !== 0, u || a ? (u = l.stateNode, e = a && typeof e.getDerivedStateFromError != "function" ? null : u.render(), l.flags |= 1, t !== null && a ? (l.child = Ea(
      l,
      t.child,
      null,
      n
    ), l.child = Ea(
      l,
      null,
      e,
      n
    )) : Kt(t, l, e, n), l.memoizedState = u.state, t = l.child) : t = ze(
      t,
      l,
      n
    ), t;
  }
  function ym(t, l, e, a) {
    return ya(), l.flags |= 256, Kt(t, l, e, a), l.child;
  }
  var wf = {
    dehydrated: null,
    treeContext: null,
    retryLane: 0,
    hydrationErrors: null
  };
  function Kf(t) {
    return { baseLanes: t, cachePool: ad() };
  }
  function $f(t, l, e) {
    return t = t !== null ? t.childLanes & ~e : 0, l && (t |= Al), t;
  }
  function vm(t, l, e) {
    var a = l.pendingProps, n = !1, u = (l.flags & 128) !== 0, c;
    if ((c = u) || (c = t !== null && t.memoizedState === null ? !1 : (el.current & 2) !== 0), c && (n = !0, l.flags &= -129), c = (l.flags & 32) !== 0, l.flags &= -33, t === null) {
      if (nt) {
        if (n ? Ze(l) : we(), (t = Rt) ? (t = Y0(
          t,
          Gl
        ), t = t !== null && t.data !== "&" ? t : null, t !== null && (l.memoizedState = {
          dehydrated: t,
          treeContext: je !== null ? { id: le, overflow: ee } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, e = Js(t), e.return = l, l.child = e, Jt = l, Rt = null)) : t = null, t === null) throw Ye(l);
        return $o(t) ? l.lanes = 32 : l.lanes = 536870912, null;
      }
      return u = a.children, a = a.fallback, n ? (we(), n = l.mode, u = Ri(
        { mode: "hidden", children: u },
        n
      ), a = ma(
        a,
        n,
        e,
        null
      ), u.return = l, a.return = l, u.sibling = a, l.child = u, a = l.child, a.memoizedState = Kf(e), a.childLanes = $f(
        t,
        c,
        e
      ), l.memoizedState = wf, iu(null, a)) : (Ze(l), Jf(l, u));
    }
    var r = t.memoizedState;
    if (r !== null) {
      var d = r.dehydrated;
      if (d !== null)
        return $g(
          t,
          l,
          u,
          c,
          a,
          d,
          r,
          e
        );
    }
    return n ? (we(), n = a.fallback, u = l.mode, r = t.child, d = r.sibling, a = be(r, {
      mode: "hidden",
      children: a.children
    }), a.subtreeFlags = r.subtreeFlags & 1206910976, d !== null ? n = be(d, n) : (n = ma(
      n,
      u,
      e,
      null
    ), n.flags |= 2), n.return = l, a.return = l, a.sibling = n, l.child = a, iu(null, a), a = l.child, n = t.child.memoizedState, n === null ? n = Kf(e) : (u = n.cachePool, u !== null ? (r = Vt._currentValue, u = u.parent !== r ? { parent: r, pool: r } : u) : u = ad(), n = {
      baseLanes: n.baseLanes | e,
      cachePool: u
    }), a.memoizedState = n, a.childLanes = $f(
      t,
      c,
      e
    ), l.memoizedState = wf, iu(t.child, a)) : (Ze(l), e = t.child, t = e.sibling, e = be(e, {
      mode: "visible",
      children: a.children
    }), e.return = l, e.sibling = null, t !== null && (c = l.deletions, c === null ? (l.deletions = [t], l.flags |= 16) : c.push(t)), l.child = e, l.memoizedState = null, e);
  }
  function Jf(t, l) {
    return l = Ri(
      { mode: "visible", children: l },
      t.mode
    ), l.return = t, t.child = l;
  }
  function Ri(t, l) {
    return t = dl(22, t, null, l), t.lanes = 0, t;
  }
  function Di(t, l, e) {
    return Ea(l, t.child, null, e), t = Jf(
      l,
      l.pendingProps.children
    ), t.flags |= 2, l.memoizedState = null, t;
  }
  function $g(t, l, e, a, n, u, c, r) {
    if (e)
      return l.flags & 256 ? (Ze(l), l.flags &= -257, Di(
        t,
        l,
        r
      )) : l.memoizedState !== null ? (we(), l.child = t.child, l.flags |= 128, null) : (we(), u = n.fallback, c = l.mode, n = Ri(
        { mode: "visible", children: n.children },
        c
      ), u = ma(
        u,
        c,
        r,
        null
      ), u.flags |= 2, n.return = l, u.return = l, n.sibling = u, l.child = n, Ea(l, t.child, null, r), n = l.child, n.memoizedState = Kf(r), n.childLanes = $f(
        t,
        a,
        r
      ), l.memoizedState = wf, iu(null, n));
    if (Ze(l), $o(u)) {
      if (a = u.nextSibling && u.nextSibling.dataset, a) var d = a.dgst;
      return a = d, a !== "" && (n = Error(f(419)), n.stack = "", n.digest = a, Jn({ value: n, source: null, stack: null })), Di(
        t,
        l,
        r
      );
    }
    if (Qt || ga(t, l, r, !1), a = (r & t.childLanes) !== 0, Qt || a) {
      if (Le.current !== null)
        return Di(
          t,
          l,
          r
        );
      if (a = Mt, a !== null && (n = kr(
        a,
        r
      ), n !== 0 && n !== c.retryLane))
        throw c.retryLane = n, da(t, n), gl(a, t, n), Lf;
      return Ko(u) || Fi(), Di(
        t,
        l,
        r
      );
    }
    return Ko(u) ? (l.flags |= 192, l.child = t.child, null) : (t = c.treeContext, Rt = Xl(u.nextSibling), Jt = l, nt = !0, Be = null, Gl = !1, t !== null && ks(l, t), l = Jf(
      l,
      n.children
    ), l.flags |= 134221824, l);
  }
  function gm(t, l, e) {
    t.lanes |= l;
    var a = t.alternate;
    a !== null && (a.lanes |= l), oi(t.return, l, e);
  }
  function hm(t) {
    for (var l = null; t !== null; ) {
      var e = t.alternate;
      e !== null && bi(e) === null && (l = t), t = t.sibling;
    }
    return l;
  }
  function Ui(t, l, e, a, n, u) {
    var c = t.memoizedState;
    c === null ? t.memoizedState = {
      isBackwards: l,
      rendering: null,
      renderingStartTime: 0,
      last: a,
      tail: e,
      tailMode: n,
      treeForkCount: u
    } : (c.isBackwards = l, c.rendering = null, c.renderingStartTime = 0, c.last = a, c.tail = e, c.tailMode = n, c.treeForkCount = u);
  }
  function Ff(t) {
    var l = t.child;
    for (t.child = null; l !== null; ) {
      var e = l.sibling;
      l.sibling = t.child, t.child = l, l = e;
    }
  }
  function Wf(t, l, e) {
    var a = l.pendingProps, n = a.revealOrder, u = a.tail;
    a = a.children;
    var c = el.current;
    if (l.flags & 128)
      return eu(l, c), null;
    var r = (c & 2) !== 0;
    if (r ? (c = c & 1 | 2, l.flags |= 128) : c &= 1, eu(l, c), n === "backwards" && t !== null ? (Ff(t), Kt(t, l, a, e), Ff(t)) : Kt(t, l, a, e), a = nt ? $n : 0, !r && t !== null && (t.flags & 128) !== 0)
      t: for (t = l.child; t !== null; ) {
        if (t.tag === 13)
          t.memoizedState !== null && gm(t, e, l);
        else if (t.tag === 19)
          gm(t, e, l);
        else if (t.child !== null) {
          t.child.return = t, t = t.child;
          continue;
        }
        if (t === l) break t;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === l)
            break t;
          t = t.return;
        }
        t.sibling.return = t.return, t = t.sibling;
      }
    switch (n) {
      case "backwards":
        e = hm(l.child), e === null ? (n = l.child, l.child = null) : (n = e.sibling, e.sibling = null, Ff(l)), Ui(
          l,
          !0,
          n,
          null,
          u,
          a
        );
        break;
      case "unstable_legacy-backwards":
        for (e = null, n = l.child, l.child = null; n !== null; ) {
          if (t = n.alternate, t !== null && bi(t) === null) {
            l.child = n;
            break;
          }
          t = n.sibling, n.sibling = e, e = n, n = t;
        }
        Ui(
          l,
          !0,
          e,
          null,
          u,
          a
        );
        break;
      case "together":
        Ui(
          l,
          !1,
          null,
          null,
          void 0,
          a
        );
        break;
      case "independent":
        l.memoizedState = null;
        break;
      default:
        e = hm(l.child), e === null ? (n = l.child, l.child = null) : (n = e.sibling, e.sibling = null), Ui(
          l,
          !1,
          n,
          e,
          u,
          a
        );
    }
    return l.child;
  }
  function bm(t, l, e) {
    var a = l.pendingProps;
    return qe(l, l.type, a.value), Kt(t, l, a.children, e), l.child;
  }
  function ze(t, l, e) {
    if (t !== null && (l.dependencies = t.dependencies), Fe |= l.lanes, (e & l.childLanes) === 0)
      if (t !== null) {
        if (ga(
          t,
          l,
          e,
          !1
        ), (e & l.childLanes) === 0)
          return null;
      } else return null;
    if (t !== null && l.child !== t.child)
      throw Error(f(153));
    if (l.child !== null) {
      for (t = l.child, e = be(t, t.pendingProps), l.child = e, e.return = l; t.sibling !== null; )
        t = t.sibling, e = e.sibling = be(t, t.pendingProps), e.return = l;
      e.sibling = null;
    }
    return l.child;
  }
  function kf(t, l) {
    return (t.lanes & l) !== 0 ? !0 : (t = t.dependencies, !!(t !== null && ri(t)));
  }
  function Jg(t, l, e) {
    switch (l.tag) {
      case 3:
        Ba(l, l.stateNode.containerInfo), qe(l, Vt, t.memoizedState.cache), ya();
        break;
      case 27:
      case 5:
        _c(l);
        break;
      case 4:
        Ba(l, l.stateNode.containerInfo);
        break;
      case 10:
        qe(
          l,
          l.type,
          l.memoizedProps.value
        );
        break;
      case 31:
        if (l.memoizedState !== null)
          return l.flags |= 128, Ef(l), null;
        break;
      case 13:
        var a = l.memoizedState;
        if (a !== null) {
          if (a.dehydrated !== null)
            return Ze(l), l.flags |= 128, null;
          a = ga(
            t,
            l,
            e,
            !1
          );
          var n = l.child.childLanes;
          return a || (e & n) !== 0 ? vm(t, l, e) : (Ze(l), t = ze(
            t,
            l,
            e
          ), t !== null ? t.sibling : null);
        }
        Ze(l);
        break;
      case 19:
        if (l.flags & 128)
          return Wf(
            t,
            l,
            e
          );
        if (n = (t.flags & 128) !== 0, a = (e & l.childLanes) !== 0, a || (ga(
          t,
          l,
          e,
          !1
        ), a = (e & l.childLanes) !== 0), n) {
          if (a)
            return Wf(
              t,
              l,
              e
            );
          l.flags |= 128;
        }
        if (n = l.memoizedState, n !== null && (n.rendering = null, n.tail = null, n.lastEffect = null), eu(l, el.current), a) break;
        return null;
      case 22:
        return l.lanes = 0, om(
          t,
          l,
          e,
          l.pendingProps
        );
      case 24:
        qe(l, Vt, t.memoizedState.cache);
    }
    return ze(t, l, e);
  }
  function pm(t, l, e) {
    if (t !== null)
      if (t.memoizedProps !== l.pendingProps)
        Qt = !0;
      else {
        if (!kf(t, e) && (l.flags & 128) === 0)
          return Qt = !1, Jg(
            t,
            l,
            e
          );
        Qt = (t.flags & 131072) !== 0;
      }
    else
      Qt = !1, nt && (l.flags & 1048576) !== 0 && Ws(l, $n, l.index);
    switch (l.lanes = 0, l.tag) {
      case 16:
        t: {
          var a = l.pendingProps;
          if (t = Sa(l.elementType), l.type = t, typeof t == "function")
            af(t) ? (a = za(t, a), l.tag = 1, l = mm(
              null,
              l,
              t,
              a,
              e
            )) : (l.tag = 0, l = Zf(
              null,
              l,
              t,
              a,
              e
            ));
          else {
            if (t != null) {
              var n = t.$$typeof;
              if (n === x) {
                l.tag = 11, l = im(
                  null,
                  l,
                  t,
                  a,
                  e
                );
                break t;
              } else if (n === Tt) {
                l.tag = 14, l = cm(
                  null,
                  l,
                  t,
                  a,
                  e
                );
                break t;
              } else if (n === Gt) {
                l.tag = 10, l.type = t, l = bm(
                  null,
                  l,
                  e
                );
                break t;
              }
            }
            throw l = dt(t) || t, Error(f(306, l, ""));
          }
        }
        return l;
      case 0:
        return Zf(
          t,
          l,
          l.type,
          l.pendingProps,
          e
        );
      case 1:
        return a = l.type, n = za(
          a,
          l.pendingProps
        ), mm(
          t,
          l,
          a,
          n,
          e
        );
      case 3:
        t: {
          if (Ba(
            l,
            l.stateNode.containerInfo
          ), t === null) throw Error(f(387));
          a = l.pendingProps;
          var u = l.memoizedState;
          n = u.element, hf(t, l), lu(l, a, null, e);
          var c = l.memoizedState;
          if (a = c.cache, qe(l, Vt, a), a !== u.cache && sf(
            l,
            [Vt],
            e,
            !0
          ), tu(), a = c.element, u.isDehydrated)
            if (u = {
              element: a,
              isDehydrated: !1,
              cache: c.cache
            }, l.updateQueue.baseState = u, l.memoizedState = u, l.flags & 256) {
              l = ym(
                t,
                l,
                a,
                e
              );
              break t;
            } else if (a !== n) {
              n = Bl(
                Error(f(424)),
                l
              ), Jn(n), l = ym(
                t,
                l,
                a,
                e
              );
              break t;
            } else
              for (t = l.stateNode.containerInfo, t.nodeType === 9 ? t = t.body : t = t.nodeName === "HTML" ? t.ownerDocument.body : t, Rt = Xl(t.firstChild), Jt = l, nt = !0, Be = null, Gl = !0, e = od(
                l,
                null,
                a,
                e
              ), l.child = e; e; )
                e.flags = e.flags & -3 | 134221824, e = e.sibling;
          else {
            if (ya(), a === n) {
              l = ze(
                t,
                l,
                e
              );
              break t;
            }
            Kt(t, l, a, e);
          }
          l = l.child;
        }
        return l;
      case 26:
        return un(t, l), t === null ? (e = Z0(
          l.type,
          null,
          l.pendingProps,
          null
        )) ? l.memoizedState = e : nt || (l.stateNode = _0(
          l.type,
          l.pendingProps,
          Pl.current,
          l
        )) : l.memoizedState = Z0(
          l.type,
          t.memoizedProps,
          l.pendingProps,
          t.memoizedState
        ), null;
      case 27:
        return _c(l), t === null && nt && (a = l.stateNode = V0(
          l.type,
          l.pendingProps,
          Pl.current
        ), Jt = l, Gl = !0, n = Rt, Pe(l.type) ? (Jo = n, Rt = Xl(a.firstChild)) : Rt = n), Kt(
          t,
          l,
          l.pendingProps.children,
          e
        ), un(t, l), t === null && (l.flags |= 4194304), l.child;
      case 5:
        return t === null && nt && ((n = a = Rt) && (a = Qh(
          a,
          l.type,
          l.pendingProps,
          Gl
        ), a !== null ? (l.stateNode = a, Jt = l, Rt = Xl(a.firstChild), Gl = !1, n = !0) : n = !1), n || Ye(l)), _c(l), n = l.type, u = l.pendingProps, c = t !== null ? t.memoizedProps : null, a = u.children, Go(n, u) ? a = null : c !== null && Go(n, c) && (l.flags |= 32), l.memoizedState !== null && (n = Of(
          t,
          l,
          Yg,
          null,
          null,
          e
        ), zn._currentValue = n), un(t, l), Kt(t, l, a, e), l.child;
      case 6:
        return t === null && nt && ((t = e = Rt) && (e = Lh(
          e,
          l.pendingProps,
          Gl
        ), e !== null ? (l.stateNode = e, Jt = l, Rt = null, t = !0) : t = !1), t || Ye(l)), null;
      case 13:
        return vm(t, l, e);
      case 4:
        return Ba(
          l,
          l.stateNode.containerInfo
        ), a = l.pendingProps, t === null ? l.child = Ea(
          l,
          null,
          a,
          e
        ) : Kt(t, l, a, e), l.child;
      case 11:
        return im(
          t,
          l,
          l.type,
          l.pendingProps,
          e
        );
      case 7:
        return a = l.pendingProps, un(t, l), Kt(t, l, a, e), l.child;
      case 8:
        return Kt(
          t,
          l,
          l.pendingProps.children,
          e
        ), l.child;
      case 12:
        return Kt(
          t,
          l,
          l.pendingProps.children,
          e
        ), l.child;
      case 10:
        return bm(t, l, e);
      case 9:
        return n = l.type._context, a = l.pendingProps.children, ha(l), n = tl(n), a = a(n), l.flags |= 1, Kt(t, l, a, e), l.child;
      case 14:
        return cm(
          t,
          l,
          l.type,
          l.pendingProps,
          e
        );
      case 15:
        return fm(
          t,
          l,
          l.type,
          l.pendingProps,
          e
        );
      case 19:
        return Wf(t, l, e);
      case 31:
        return Kg(t, l, e);
      case 22:
        return om(
          t,
          l,
          e,
          l.pendingProps
        );
      case 24:
        return ha(l), a = tl(Vt), t === null ? (n = yf(), n === null && (n = Mt, u = df(), n.pooledCache = u, u.refCount++, u !== null && (n.pooledCacheLanes |= e), n = u), l.memoizedState = { parent: a, cache: n }, gf(l), qe(l, Vt, n)) : ((t.lanes & e) !== 0 && (hf(t, l), lu(l, null, null, e), tu()), n = t.memoizedState, u = l.memoizedState, n.parent !== a ? (n = { parent: a, cache: a }, l.memoizedState = n, l.lanes === 0 && (l.memoizedState = l.updateQueue.baseState = n), qe(l, Vt, a)) : (a = u.cache, qe(l, Vt, a), a !== n.cache && sf(
          l,
          [Vt],
          e,
          !0
        ))), Kt(
          t,
          l,
          l.pendingProps.children,
          e
        ), l.child;
      case 30:
        return l.stateNode === null && (l.stateNode = {
          autoName: null,
          paired: null,
          clones: null,
          ref: null
        }), a = l.pendingProps, a.name != null && a.name !== "auto" ? l.flags |= t === null ? 18882560 : 18874368 : nt && ci(l), t !== null && t.memoizedProps.name !== a.name ? l.flags |= 4194816 : un(t, l), Kt(t, l, a.children, e), l.child;
      case 29:
        throw l.pendingProps;
    }
    throw Error(f(156, l.tag));
  }
  function Oe(t) {
    t.flags |= 4;
  }
  function If(t, l, e, a, n) {
    var u;
    if ((u = (t.mode & 32) !== 0) && (u = e === null ? J0(l, a) : J0(l, a) && (a.src !== e.src || a.srcSet !== e.srcSet)), u) {
      if (t.flags |= 16777216, (n & 335544128) === n)
        if (t.stateNode.complete) t.flags |= 8192;
        else if (t0()) t.flags |= 8192;
        else
          throw Ta = yi, vf;
    } else t.flags &= -16777217;
  }
  function Sm(t, l) {
    if (l.type !== "stylesheet" || (l.state.loading & 4) !== 0)
      t.flags &= -16777217;
    else if (t.flags |= 16777216, !F0(l))
      if (t0()) t.flags |= 8192;
      else
        throw Ta = yi, vf;
  }
  function Hi(t, l) {
    l !== null && (t.flags |= 4), t.flags & 16384 && (l = t.tag !== 22 ? Jr() : 536870912, t.lanes |= l, sn |= l);
  }
  function cu(t, l) {
    if (!nt)
      switch (t.tailMode) {
        case "visible":
          break;
        case "collapsed":
          for (var e = t.tail, a = null; e !== null; )
            e.alternate !== null && (a = e), e = e.sibling;
          a === null ? l || t.tail === null ? t.tail = null : t.tail.sibling = null : a.sibling = null;
          break;
        default:
          for (l = t.tail, e = null; l !== null; )
            l.alternate !== null && (e = l), l = l.sibling;
          e === null ? t.tail = null : e.sibling = null;
      }
  }
  function Dt(t) {
    var l = t.alternate !== null && t.alternate.child === t.child, e = 0, a = 0;
    if (l)
      for (var n = t.child; n !== null; )
        e |= n.lanes | n.childLanes, a |= n.subtreeFlags & 1206910976, a |= n.flags & 1206910976, n.return = t, n = n.sibling;
    else
      for (n = t.child; n !== null; )
        e |= n.lanes | n.childLanes, a |= n.subtreeFlags, a |= n.flags, n.return = t, n = n.sibling;
    return t.subtreeFlags |= a, t.childLanes = e, l;
  }
  function Fg(t, l, e) {
    var a = l.pendingProps;
    switch (cf(l), l.tag) {
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return Dt(l), null;
      case 1:
        return Dt(l), null;
      case 3:
        return e = l.stateNode, a = null, t !== null && (a = t.memoizedState.cache), l.memoizedState.cache !== a && (l.flags |= 2048), Te(Vt), Re(), e.pendingContext && (e.context = e.pendingContext, e.pendingContext = null), (t === null || t.child === null) && (Ia(l) ? Oe(l) : t === null || t.memoizedState.isDehydrated && (l.flags & 256) === 0 || (l.flags |= 1024, of())), Dt(l), null;
      case 26:
        var n = l.type, u = l.memoizedState;
        return t === null ? (Oe(l), u !== null ? (Dt(l), Sm(l, u)) : (Dt(l), If(
          l,
          n,
          null,
          a,
          e
        ))) : u ? u !== t.memoizedState ? (Oe(l), Dt(l), Sm(l, u)) : (Dt(l), l.flags &= -16777217) : (t = t.memoizedProps, t !== a && Oe(l), Dt(l), If(
          l,
          n,
          t,
          a,
          e
        )), null;
      case 27:
        if (qu(l), e = Pl.current, n = l.type, t !== null && l.stateNode != null)
          t.memoizedProps !== a && Oe(l);
        else {
          if (!a) {
            if (l.stateNode === null)
              throw Error(f(166));
            return Dt(l), l.subtreeFlags &= -33554433, null;
          }
          t = Hl.current, Ia(l) ? Is(l) : (t = V0(n, a, e), l.stateNode = t, Oe(l));
        }
        return Dt(l), l.subtreeFlags &= -33554433, null;
      case 5:
        if (qu(l), n = l.type, t !== null && l.stateNode != null)
          t.memoizedProps !== a && Oe(l);
        else {
          if (!a) {
            if (l.stateNode === null)
              throw Error(f(166));
            return Dt(l), l.subtreeFlags &= -33554433, null;
          }
          if (u = Hl.current, Ia(l))
            Is(l);
          else {
            var c = bu(
              Pl.current
            );
            switch (u) {
              case 1:
                u = c.createElementNS(
                  "http://www.w3.org/2000/svg",
                  n
                );
                break;
              case 2:
                u = c.createElementNS(
                  "http://www.w3.org/1998/Math/MathML",
                  n
                );
                break;
              default:
                switch (n) {
                  case "svg":
                    u = c.createElementNS(
                      "http://www.w3.org/2000/svg",
                      n
                    );
                    break;
                  case "math":
                    u = c.createElementNS(
                      "http://www.w3.org/1998/Math/MathML",
                      n
                    );
                    break;
                  case "script":
                    u = c.createElement("div"), u.innerHTML = "<script><\/script>", u = u.removeChild(
                      u.firstChild
                    );
                    break;
                  case "select":
                    u = typeof a.is == "string" ? c.createElement("select", {
                      is: a.is
                    }) : c.createElement("select"), a.multiple ? u.multiple = !0 : a.size && (u.size = a.size);
                    break;
                  default:
                    u = typeof a.is == "string" ? c.createElement(n, { is: a.is }) : c.createElement(n);
                }
            }
            u[Pt] = l, u[sl] = a;
            t: for (c = l.child; c !== null; ) {
              if (c.tag === 5 || c.tag === 6)
                u.appendChild(c.stateNode);
              else if (c.tag !== 4 && c.tag !== 27 && c.child !== null) {
                c.child.return = c, c = c.child;
                continue;
              }
              if (c === l) break t;
              for (; c.sibling === null; ) {
                if (c.return === null || c.return === l)
                  break t;
                c = c.return;
              }
              c.sibling.return = c.return, c = c.sibling;
            }
            l.stateNode = u;
            t: switch (nl(u, n, a), n) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                a = !!a.autoFocus;
                break t;
              case "img":
                a = !0;
                break t;
              default:
                a = !1;
            }
            a && Oe(l);
          }
        }
        return Dt(l), l.subtreeFlags &= -33554433, If(
          l,
          l.type,
          t === null ? null : t.memoizedProps,
          l.pendingProps,
          e
        ), null;
      case 6:
        if (t && l.stateNode != null)
          t.memoizedProps !== a && Oe(l);
        else {
          if (typeof a != "string" && l.stateNode === null)
            throw Error(f(166));
          if (t = Pl.current, Ia(l)) {
            if (t = l.stateNode, e = l.memoizedProps, a = null, n = Jt, n !== null)
              switch (n.tag) {
                case 27:
                case 5:
                  a = n.memoizedProps;
              }
            t[Pt] = l, t = !!(t.nodeValue === e || a !== null && a.suppressHydrationWarning === !0 || p0(t.nodeValue, e)), t || Ye(l, !0);
          } else
            t = bu(t).createTextNode(
              a
            ), t[Pt] = l, l.stateNode = t;
        }
        return Dt(l), null;
      case 31:
        if (e = l.memoizedState, t === null || t.memoizedState !== null) {
          if (a = Ia(l), e !== null) {
            if (t === null) {
              if (!a) throw Error(f(318));
              if (t = l.memoizedState, t = t !== null ? t.dehydrated : null, !t) throw Error(f(557));
              t[Pt] = l;
            } else
              ya(), (l.flags & 128) === 0 && (l.memoizedState = null), l.flags |= 4;
            Dt(l), t = !1;
          } else
            e = of(), t !== null && t.memoizedState !== null && (t.memoizedState.hydrationErrors = e), t = !0;
          if (!t)
            return l.flags & 256 ? (zl(l), l) : (zl(l), null);
          if ((l.flags & 128) !== 0)
            throw Error(f(558));
        }
        return Dt(l), null;
      case 13:
        if (a = l.memoizedState, t === null || t.memoizedState !== null && t.memoizedState.dehydrated !== null) {
          if (n = Ia(l), a !== null && a.dehydrated !== null) {
            if (t === null) {
              if (!n) throw Error(f(318));
              if (n = l.memoizedState, n = n !== null ? n.dehydrated : null, !n) throw Error(f(317));
              n[Pt] = l;
            } else
              ya(), (l.flags & 128) === 0 && (l.memoizedState = null), l.flags |= 4;
            Dt(l), n = !1;
          } else
            n = of(), t !== null && t.memoizedState !== null && (t.memoizedState.hydrationErrors = n), n = !0;
          if (!n)
            return l.flags & 256 ? (zl(l), l) : (zl(l), null);
        }
        return zl(l), (l.flags & 128) !== 0 ? (l.lanes = e, l) : (e = a !== null, t = t !== null && t.memoizedState !== null, e && (a = l.child, n = null, a.alternate !== null && a.alternate.memoizedState !== null && a.alternate.memoizedState.cachePool !== null && (n = a.alternate.memoizedState.cachePool.pool), u = null, a.memoizedState !== null && a.memoizedState.cachePool !== null && (u = a.memoizedState.cachePool.pool), u !== n && (a.flags |= 2048)), e !== t && e && (l.child.flags |= 8192), Hi(l, l.updateQueue), Dt(l), null);
      case 4:
        return Re(), t === null && xo(l.stateNode.containerInfo), l.flags |= 67108864, Dt(l), null;
      case 10:
        return Te(l.type), Dt(l), null;
      case 19:
        if (_f(l), a = l.memoizedState, a === null) return Dt(l), null;
        if (n = (l.flags & 128) !== 0, u = a.rendering, u === null)
          if (n) cu(a, !1);
          else {
            if (Yt !== 0 || t !== null && (t.flags & 128) !== 0)
              for (t = l.child; t !== null; ) {
                if (u = bi(t), u !== null) {
                  for (l.flags |= 128, cu(a, !1), t = u.updateQueue, l.updateQueue = t, Hi(l, t), l.subtreeFlags = 0, t = e, e = l.child; e !== null; )
                    $s(e, t), e = e.sibling;
                  return eu(
                    l,
                    el.current & 1 | 2
                  ), nt && pe(l, a.treeForkCount), l.child;
                }
                t = t.sibling;
              }
            a.tail !== null && pl() > wi && (l.flags |= 128, n = !0, cu(a, !1), l.lanes = 4194304);
          }
        else {
          if (!n)
            if (t = bi(u), t !== null) {
              if (l.flags |= 128, n = !0, t = t.updateQueue, l.updateQueue = t, Hi(l, t), cu(a, !0), a.tail === null && a.tailMode !== "collapsed" && a.tailMode !== "visible" && !u.alternate && !nt)
                return Dt(l), null;
            } else
              2 * pl() - a.renderingStartTime > wi && e !== 536870912 && (l.flags |= 128, n = !0, cu(a, !1), l.lanes = 4194304);
          a.isBackwards ? (u.sibling = l.child, l.child = u) : (t = a.last, t !== null ? t.sibling = u : l.child = u, a.last = u);
        }
        if (a.tail !== null) {
          t = a.tail;
          t: {
            for (e = t; e !== null; ) {
              if (e.alternate !== null) {
                e = !1;
                break t;
              }
              e = e.sibling;
            }
            e = !0;
          }
          return a.rendering = t, a.tail = t.sibling, a.renderingStartTime = pl(), t.sibling = null, u = el.current, u = n ? u & 1 | 2 : u & 1, a.tailMode === "visible" || a.tailMode === "collapsed" || !e || nt ? eu(l, u) : (e = u, Nt(ll, l), Nt(el, e), il === null && (il = l)), nt && pe(l, a.treeForkCount), t;
        }
        return Dt(l), null;
      case 22:
      case 23:
        return zl(l), Tf(), a = l.memoizedState !== null, t !== null ? t.memoizedState !== null !== a && (l.flags |= 8192) : a && (l.flags |= 8192), a ? (e & 536870912) !== 0 && (l.flags & 128) === 0 && (Dt(l), l.subtreeFlags & 6 && (l.flags |= 8192)) : Dt(l), e = l.updateQueue, e !== null && Hi(l, e.retryQueue), e = null, t !== null && t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), a = null, l.memoizedState !== null && l.memoizedState.cachePool !== null && (a = l.memoizedState.cachePool.pool), a !== e && (l.flags |= 2048), t !== null && wt(pa), null;
      case 24:
        return e = null, t !== null && (e = t.memoizedState.cache), l.memoizedState.cache !== e && (l.flags |= 2048), Te(Vt), Dt(l), null;
      case 25:
        return null;
      case 30:
        return l.flags |= 33554432, Dt(l), null;
    }
    throw Error(f(156, l.tag));
  }
  function Wg(t, l) {
    switch (cf(l), l.tag) {
      case 1:
        return t = l.flags, t & 65536 ? (l.flags = t & -65537 | 128, l) : null;
      case 3:
        return Te(Vt), Re(), t = l.flags, (t & 65536) !== 0 && (t & 128) === 0 ? (l.flags = t & -65537 | 128, l) : null;
      case 26:
      case 27:
      case 5:
        return qu(l), null;
      case 31:
        if (l.memoizedState !== null) {
          if (zl(l), l.alternate === null)
            throw Error(f(340));
          ya();
        }
        return t = l.flags, t & 65536 ? (l.flags = t & -65537 | 128, l) : null;
      case 13:
        if (zl(l), t = l.memoizedState, t !== null && t.dehydrated !== null) {
          if (l.alternate === null)
            throw Error(f(340));
          ya();
        }
        return t = l.flags, t & 65536 ? (l.flags = t & -65537 | 128, l) : null;
      case 19:
        return _f(l), t = l.flags, t & 65536 ? (l.flags = t & -65537 | 128, t = l.memoizedState, t !== null && (t.rendering = null, t.tail = null), l.flags |= 4, l) : null;
      case 4:
        return Re(), null;
      case 10:
        return Te(l.type), null;
      case 22:
      case 23:
        return zl(l), Tf(), t !== null && wt(pa), t = l.flags, t & 65536 ? (l.flags = t & -65537 | 128, l) : null;
      case 24:
        return Te(Vt), null;
      case 25:
        return null;
      default:
        return null;
    }
  }
  function Tm(t, l) {
    switch (cf(l), l.tag) {
      case 3:
        Te(Vt), Re();
        break;
      case 26:
      case 27:
      case 5:
        qu(l);
        break;
      case 4:
        Re();
        break;
      case 31:
        l.memoizedState !== null && zl(l);
        break;
      case 13:
        zl(l);
        break;
      case 19:
        _f(l);
        break;
      case 10:
        Te(l.type);
        break;
      case 22:
      case 23:
        zl(l), Tf(), t !== null && wt(pa);
        break;
      case 24:
        Te(Vt);
    }
  }
  function fu(t, l) {
    try {
      var e = l.updateQueue, a = e !== null ? e.lastEffect : null;
      if (a !== null) {
        var n = a.next;
        e = n;
        do {
          if ((e.tag & t) === t) {
            a = void 0;
            var u = e.create, c = e.inst;
            a = u(), c.destroy = a;
          }
          e = e.next;
        } while (e !== n);
      }
    } catch (r) {
      _t(l, l.return, r);
    }
  }
  function Ke(t, l, e) {
    try {
      var a = l.updateQueue, n = a !== null ? a.lastEffect : null;
      if (n !== null) {
        var u = n.next;
        a = u;
        do {
          if ((a.tag & t) === t) {
            var c = a.inst, r = c.destroy;
            if (r !== void 0) {
              c.destroy = void 0, n = l;
              var d = e, p = r;
              try {
                p();
              } catch (_) {
                _t(
                  n,
                  d,
                  _
                );
              }
            }
          }
          a = a.next;
        } while (a !== u);
      }
    } catch (_) {
      _t(l, l.return, _);
    }
  }
  function Em(t) {
    var l = t.updateQueue;
    if (l !== null) {
      var e = t.stateNode;
      try {
        sd(l, e);
      } catch (a) {
        _t(t, t.return, a);
      }
    }
  }
  function _m(t, l, e) {
    e.props = za(
      t.type,
      t.memoizedProps
    ), e.state = t.memoizedState;
    try {
      e.componentWillUnmount();
    } catch (a) {
      _t(t, l, a);
    }
  }
  function ae(t, l) {
    try {
      var e = t.ref;
      if (e !== null) {
        switch (t.tag) {
          case 26:
          case 27:
          case 5:
            var a = t.stateNode;
            break;
          case 30:
            var n = t.stateNode, u = ge(t.memoizedProps, n);
            (n.ref === null || n.ref.name !== u) && (n.ref = R0(u)), a = n.ref;
            break;
          case 7:
            if (t.stateNode === null) {
              var c = new Ml(t);
              S(
                t.child,
                !1,
                Vh,
                c,
                void 0,
                void 0
              ), t.stateNode = c;
            }
            a = t.stateNode;
            break;
          default:
            a = t.stateNode;
        }
        typeof e == "function" ? t.refCleanup = e(a) : e.current = a;
      }
    } catch (r) {
      _t(t, l, r);
    }
  }
  function al(t, l) {
    var e = t.ref, a = t.refCleanup;
    if (e !== null)
      if (typeof a == "function")
        try {
          a();
        } catch (n) {
          _t(t, l, n);
        } finally {
          t.refCleanup = null, t = t.alternate, t != null && (t.refCleanup = null);
        }
      else if (typeof e == "function")
        try {
          e(null);
        } catch (n) {
          _t(t, l, n);
        }
      else e.current = null;
  }
  function xi(t, l) {
    if ((t.tag === 5 || t.tag === 27 || t.tag === 6) && t.alternate === null && l !== null)
      for (var e = 0; e < l.length; e++)
        B0(
          t.stateNode,
          l[e]
        );
  }
  function zm(t) {
    for (var l = t.return; l !== null && (to(l) && B0(t.stateNode, l.stateNode), !Pf(l)); )
      l = l.return;
  }
  function ou(t) {
    for (var l = t.return; l !== null && (to(l) && Xh(t.stateNode, l.stateNode), !Pf(l)); )
      l = l.return;
  }
  function Pf(t) {
    return t.tag === 5 || t.tag === 3 || t.tag === 27;
  }
  function to(t) {
    return t && t.tag === 7 && t.stateNode !== null;
  }
  function lo(t) {
    var l = t.type, e = t.memoizedProps, a = t.stateNode;
    try {
      t: switch (l) {
        case "button":
        case "input":
        case "select":
        case "textarea":
          e.autoFocus && a.focus();
          break t;
        case "img":
          e.src ? a.src = e.src : e.srcSet && (a.srcset = e.srcSet);
      }
    } catch (n) {
      _t(t, t.return, n);
    }
  }
  function eo(t, l, e) {
    try {
      var a = t.stateNode;
      Eh(a, t.type, e, l), a[sl] = l;
    } catch (n) {
      _t(t, t.return, n);
    }
  }
  function Om(t) {
    return t.tag === 5 || t.tag === 3 || t.tag === 26 || t.tag === 27 && Pe(t.type) || t.tag === 4;
  }
  function ao(t) {
    t: for (; ; ) {
      for (; t.sibling === null; ) {
        if (t.return === null || Om(t.return)) return null;
        t = t.return;
      }
      for (t.sibling.return = t.return, t = t.sibling; t.tag !== 5 && t.tag !== 6 && t.tag !== 18; ) {
        if (t.tag === 27 && Pe(t.type) || t.flags & 2 || t.child === null || t.tag === 4) continue t;
        t.child.return = t, t = t.child;
      }
      if (!(t.flags & 2)) return t.stateNode;
    }
  }
  function no(t, l, e, a) {
    var n = t.tag;
    if (n === 5 || n === 6)
      n = t.stateNode, l ? (e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e).insertBefore(n, l) : (l = e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, l.appendChild(n), e = e._reactRootContainer, e != null || l.onclick !== null || (l.onclick = te)), xi(t, a), ht = !0;
    else if (n !== 4 && (n === 27 && (xi(t, a), a = null, Pe(t.type) && (e = t.stateNode, l = null)), t = t.child, t !== null))
      for (no(
        t,
        l,
        e,
        a
      ), t = t.sibling; t !== null; )
        no(
          t,
          l,
          e,
          a
        ), t = t.sibling;
  }
  function ji(t, l, e, a) {
    var n = t.tag;
    if (n === 5 || n === 6)
      n = t.stateNode, l ? e.insertBefore(n, l) : e.appendChild(n), xi(t, a), ht = !0;
    else if (n !== 4 && (n === 27 && (xi(t, a), a = null, Pe(t.type) && (e = t.stateNode)), t = t.child, t !== null))
      for (ji(
        t,
        l,
        e,
        a
      ), t = t.sibling; t !== null; )
        ji(
          t,
          l,
          e,
          a
        ), t = t.sibling;
  }
  function Nm(t) {
    var l = t.stateNode, e = t.memoizedProps;
    try {
      for (var a = t.type, n = l.attributes; n.length; )
        l.removeAttributeNode(n[0]);
      nl(l, a, e), l[Pt] = t, l[sl] = e;
    } catch (u) {
      _t(t, t.return, u);
    }
  }
  var Bi = !1, Ol = null;
  function Am(t) {
    (t.tag === 30 || (t.subtreeFlags & 33554432) !== 0) && (Bi = !0);
  }
  var ne = null;
  function Cm() {
    var t = ne;
    return ne = null, t;
  }
  var ml = 0;
  function cn(t, l, e, a, n) {
    return ml = 0, Mm(
      t.child,
      l,
      e,
      a,
      n
    );
  }
  function Mm(t, l, e, a, n) {
    for (var u = !1; t !== null; ) {
      if (t.tag === 5) {
        var c = t.stateNode;
        if (a !== null) {
          var r = Qo(c);
          a.push(r), r.view && (u = !0);
        } else
          u || Qo(c).view && (u = !0);
        Bi = !0, C0(
          c,
          ml === 0 ? l : l + "_" + ml,
          e
        ), ml++;
      } else (t.tag !== 22 || t.memoizedState === null) && (t.tag === 30 && n || Mm(
        t.child,
        l,
        e,
        a,
        n
      ) && (u = !0));
      t = t.sibling;
    }
    return u;
  }
  function ue(t, l) {
    for (; t !== null; )
      t.tag === 5 ? M0(t.stateNode, t.memoizedProps) : (t.tag !== 22 || t.memoizedState === null) && (t.tag === 30 && l || ue(
        t.child,
        l
      )), t = t.sibling;
  }
  function Yi(t) {
    if ((t.subtreeFlags & 18874368) !== 0)
      for (t = t.child; t !== null; ) {
        if ((t.tag !== 22 || t.memoizedState === null) && (Yi(t), t.tag === 30 && (t.flags & 18874368) !== 0 && t.stateNode.paired)) {
          var l = t.memoizedProps;
          if (l.name == null || l.name === "auto")
            throw Error(f(544));
          var e = l.name;
          l = he(l.default, l.share), l !== "none" && (cn(
            t,
            e,
            l,
            null,
            !1
          ) || ue(t.child, !1));
        }
        t = t.sibling;
      }
  }
  function uo(t, l) {
    if (t.tag === 30) {
      var e = t.stateNode, a = t.memoizedProps, n = ge(a, e), u = he(
        a.default,
        e.paired ? a.share : a.enter
      );
      u !== "none" ? cn(t, n, u, null, !1) ? (Yi(t), e.paired || l || vn(t, a.onEnter)) : ue(t.child, !1) : Yi(t);
    } else if ((t.subtreeFlags & 33554432) !== 0)
      for (t = t.child; t !== null; )
        uo(t, l), t = t.sibling;
    else Yi(t);
  }
  function io(t) {
    if (Ol !== null && Ol.size !== 0) {
      var l = Ol;
      if ((t.subtreeFlags & 18874368) !== 0)
        for (t = t.child; t !== null; ) {
          if (t.tag !== 22 || t.memoizedState === null) {
            if (t.tag === 30 && (t.flags & 18874368) !== 0) {
              var e = t.memoizedProps, a = e.name;
              if (a != null && a !== "auto") {
                var n = l.get(a);
                if (n !== void 0) {
                  var u = he(
                    e.default,
                    e.share
                  );
                  if (u !== "none" && (cn(
                    t,
                    a,
                    u,
                    null,
                    !1
                  ) ? (u = t.stateNode, n.paired = u, u.paired = n, vn(t, e.onShare)) : ue(t.child, !1)), l.delete(a), l.size === 0) break;
                }
              }
            }
            io(t);
          }
          t = t.sibling;
        }
    }
  }
  function co(t) {
    if (t.tag === 30) {
      var l = t.memoizedProps, e = ge(l, t.stateNode), a = Ol !== null ? Ol.get(e) : void 0, n = he(
        l.default,
        a !== void 0 ? l.share : l.exit
      );
      n !== "none" && (cn(t, e, n, null, !1) ? a !== void 0 ? (n = t.stateNode, a.paired = n, n.paired = a, Ol.delete(e), vn(t, l.onShare)) : vn(t, l.onExit) : ue(t.child, !1)), Ol !== null && io(t);
    } else if ((t.subtreeFlags & 33554432) !== 0)
      for (t = t.child; t !== null; )
        co(t), t = t.sibling;
    else
      Ol !== null && io(t);
  }
  function Rm(t) {
    for (t = t.child; t !== null; ) {
      if (t.tag === 30) {
        var l = t.memoizedProps, e = ge(l, t.stateNode);
        l = he(l.default, l.update), t.flags &= -5, l !== "none" && cn(
          t,
          e,
          l,
          t.memoizedState = [],
          !1
        );
      } else
        (t.subtreeFlags & 33554432) !== 0 && Rm(t);
      t = t.sibling;
    }
  }
  function fo(t) {
    if ((t.subtreeFlags & 18874368) !== 0)
      for (t = t.child; t !== null; ) {
        if (t.tag !== 22 || t.memoizedState === null) {
          if (t.tag === 30 && (t.flags & 18874368) !== 0) {
            var l = t.stateNode;
            l.paired !== null && (l.paired = null, ue(t.child, !1));
          }
          fo(t);
        }
        t = t.sibling;
      }
  }
  function qi(t) {
    if (t.tag === 30)
      t.stateNode.paired = null, ue(t.child, !1), fo(t);
    else if ((t.subtreeFlags & 33554432) !== 0)
      for (t = t.child; t !== null; )
        qi(t), t = t.sibling;
    else fo(t);
  }
  function Dm(t) {
    for (t = t.child; t !== null; )
      t.tag === 30 ? ue(t.child, !1) : (t.subtreeFlags & 33554432) !== 0 && Dm(t), t = t.sibling;
  }
  function oo(t, l, e, a, n, u, c) {
    for (var r = !1; l !== null; ) {
      if (l.tag === 5) {
        var d = l.stateNode;
        if (u !== null && ml < u.length) {
          var p = u[ml], _ = Qo(d);
          (p.view || _.view) && (r = !0);
          var A;
          if (A = (t.flags & 4) === 0)
            if (_.clip) A = !0;
            else {
              A = p.rect;
              var h = _.rect;
              A = A.y !== h.y || A.x !== h.x || A.height !== h.height || A.width !== h.width;
            }
          A && (t.flags |= 4), _.abs ? _ = !p.abs : (p = p.rect, _ = _.rect, _ = p.height !== _.height || p.width !== _.width), _ && (t.flags |= 32);
        } else t.flags |= 32;
        (t.flags & 4) !== 0 && C0(
          d,
          ml === 0 ? e : e + "_" + ml,
          n
        ), r && (t.flags & 4) !== 0 || (ne === null && (ne = []), ne.push(
          d,
          ml === 0 ? a : a + "_" + ml,
          l.memoizedProps
        )), ml++;
      } else (l.tag !== 22 || l.memoizedState === null) && (l.tag === 30 && c ? t.flags |= l.flags & 32 : oo(
        t,
        l.child,
        e,
        a,
        n,
        u,
        c
      ) && (r = !0));
      l = l.sibling;
    }
    return r;
  }
  function Um(t, l) {
    for (t = t.child; t !== null; ) {
      if (t.tag === 30) {
        var e = t.memoizedProps, a = t.stateNode, n = ge(e, a), u = he(e.default, e.update), c;
        c = t.memoizedState, t.memoizedState = null, a = t;
        var r = t.child;
        ml = 0, n = oo(
          a,
          r,
          n,
          n,
          u,
          c,
          !1
        ), (t.flags & 4) !== 0 && n && vn(t, e.onUpdate);
      } else
        (t.subtreeFlags & 33554432) !== 0 && Um(t);
      t = t.sibling;
    }
  }
  var Ft = !1, St = !1, ie = !1, ro = !1, Hm = typeof WeakSet == "function" ? WeakSet : Set, Wt = null, ce = !1, ru = !1, Gi = !1, so = !1;
  function kg(t, l, e) {
    if (t = t.containerInfo, Yo = On, t = Ys(t), Wc(t)) {
      if ("selectionStart" in t)
        var a = {
          start: t.selectionStart,
          end: t.selectionEnd
        };
      else
        t: {
          a = (a = t.ownerDocument) && a.defaultView || window;
          var n = a.getSelection && a.getSelection();
          if (n && n.rangeCount !== 0) {
            a = n.anchorNode;
            var u = n.anchorOffset, c = n.focusNode;
            n = n.focusOffset;
            try {
              a.nodeType, c.nodeType;
            } catch {
              a = null;
              break t;
            }
            var r = 0, d = -1, p = -1, _ = 0, A = 0, h = t, E = null;
            l: for (; ; ) {
              for (var H; h !== a || u !== 0 && h.nodeType !== 3 || (d = r + u), h !== c || n !== 0 && h.nodeType !== 3 || (p = r + n), h.nodeType === 3 && (r += h.nodeValue.length), (H = h.firstChild) !== null; )
                E = h, h = H;
              for (; ; ) {
                if (h === t) break l;
                if (E === a && ++_ === u && (d = r), E === c && ++A === n && (p = r), (H = h.nextSibling) !== null) break;
                h = E, E = h.parentNode;
              }
              h = H;
            }
            a = d === -1 || p === -1 ? null : { start: d, end: p };
          } else a = null;
        }
      a = a || { start: 0, end: 0 };
    } else a = null;
    for (qo = { focusedElem: t, selectionRange: a }, On = !1, e = (e & 335544064) === e, Wt = l, l = e ? 9270 : 1024; Wt !== null; ) {
      if (t = Wt, e && (a = t.deletions, a !== null))
        for (u = 0; u < a.length; u++)
          e && co(a[u]);
      if (t.alternate === null && (t.flags & 2) !== 0)
        e && Am(t), Vi(e);
      else {
        if (t.tag === 22) {
          if (a = t.alternate, t.memoizedState !== null) {
            a !== null && a.memoizedState === null && e && co(a), Vi(e);
            continue;
          } else if (a !== null && a.memoizedState !== null) {
            e && Am(t), Vi(e);
            continue;
          }
        }
        a = t.child, (t.subtreeFlags & l) !== 0 && a !== null ? (a.return = t, Wt = a) : (e && Rm(t), Vi(e));
      }
    }
    Ol = null;
  }
  function Vi(t) {
    for (; Wt !== null; ) {
      var l = Wt, e = t, a = l.alternate, n = l.flags;
      switch (l.tag) {
        case 0:
        case 11:
        case 15:
          break;
        case 1:
          if ((n & 1024) !== 0 && a !== null) {
            e = void 0, n = a.memoizedProps, a = a.memoizedState;
            var u = l.stateNode;
            try {
              var c = za(
                l.type,
                n
              );
              e = u.getSnapshotBeforeUpdate(
                c,
                a
              ), u.__reactInternalSnapshotBeforeUpdate = e;
            } catch (r) {
              _t(l, l.return, r);
            }
          }
          break;
        case 3:
          if ((n & 1024) !== 0) {
            if (a = l.stateNode.containerInfo, e = a.nodeType, e === 9)
              wo(a);
            else if (e === 1)
              switch (a.nodeName) {
                case "HEAD":
                case "HTML":
                case "BODY":
                  wo(a);
                  break;
                default:
                  a.textContent = "";
              }
          }
          break;
        case 5:
        case 26:
        case 27:
        case 6:
        case 4:
        case 17:
          break;
        case 30:
          e && a !== null && (e = ge(
            a.memoizedProps,
            a.stateNode
          ), n = l.memoizedProps, n = he(n.default, n.update), n !== "none" && cn(
            a,
            e,
            n,
            a.memoizedState = [],
            !0
          ));
          break;
        default:
          if ((n & 1024) !== 0) throw Error(f(163));
      }
      if (a = l.sibling, a !== null) {
        a.return = l.return, Wt = a;
        break;
      }
      Wt = l.return;
    }
  }
  function xm(t, l, e) {
    var a = e.flags;
    switch (e.tag) {
      case 0:
      case 11:
      case 15:
        fe(t, e), a & 4 && fu(5, e);
        break;
      case 1:
        if (fe(t, e), a & 4)
          if (t = e.stateNode, l === null)
            try {
              t.componentDidMount();
            } catch (c) {
              _t(e, e.return, c);
            }
          else {
            var n = za(
              e.type,
              l.memoizedProps
            );
            l = l.memoizedState;
            try {
              t.componentDidUpdate(
                n,
                l,
                t.__reactInternalSnapshotBeforeUpdate
              );
            } catch (c) {
              _t(
                e,
                e.return,
                c
              );
            }
          }
        a & 64 && Em(e), a & 512 && ae(e, e.return);
        break;
      case 3:
        if (fe(t, e), a & 64 && (t = e.updateQueue, t !== null)) {
          if (l = null, e.child !== null)
            switch (e.child.tag) {
              case 27:
              case 5:
                l = e.child.stateNode;
                break;
              case 1:
                l = e.child.stateNode;
            }
          try {
            sd(t, l);
          } catch (c) {
            _t(e, e.return, c);
          }
        }
        break;
      case 27:
        l === null && a & 4 && Nm(e);
      case 26:
      case 5:
        fe(t, e), l === null && a & 4 && lo(e), a & 512 && ae(e, e.return);
        break;
      case 12:
        fe(t, e);
        break;
      case 31:
        fe(t, e), a & 4 && qm(t, e);
        break;
      case 13:
        fe(t, e), a & 4 && Gm(t, e), a & 64 && (t = e.memoizedState, t !== null && (t = t.dehydrated, t !== null && (e = oh.bind(
          null,
          e
        ), Zh(t, e))));
        break;
      case 22:
        if (a = e.memoizedState !== null || Ft, !a) {
          var u = l !== null && l.memoizedState !== null || St;
          l = Ft, n = St, Ft = a, (St = u) && !n ? (a = 2, (e.subtreeFlags & 8772) !== 0 && (a |= 1), Fl(
            t,
            e,
            a
          )) : fe(t, e), Ft = l, St = n;
        }
        break;
      case 30:
        fe(t, e), a & 512 && ae(e, e.return);
        break;
      case 7:
        a & 512 && ae(e, e.return);
      default:
        fe(t, e);
    }
  }
  function mo(t, l) {
    for (t = t.child; t !== null; )
      jm(t, l), t = t.sibling;
  }
  function jm(t, l) {
    switch (t.tag) {
      case 5:
      case 26:
        try {
          var e = t.stateNode;
          if (l) {
            var a = e.style;
            typeof a.setProperty == "function" ? a.setProperty("display", "none", "important") : a.display = "none";
          } else {
            var n = t.stateNode, u = t.memoizedProps.style, c = u != null && u.hasOwnProperty("display") ? u.display : null;
            n.style.display = c == null || typeof c == "boolean" ? "" : ("" + c).trim();
          }
        } catch (d) {
          _t(t, t.return, d);
        }
        yo(t, l);
        break;
      case 6:
        try {
          t.stateNode.nodeValue = l ? "" : t.memoizedProps, ht = !0;
        } catch (d) {
          _t(t, t.return, d);
        }
        break;
      case 18:
        try {
          var r = t.stateNode;
          l ? A0(r, !0) : A0(t.stateNode, !1);
        } catch (d) {
          _t(t, t.return, d);
        }
        break;
      case 22:
      case 23:
        t.memoizedState === null && mo(t, l);
        break;
      default:
        mo(t, l);
    }
  }
  function yo(t, l) {
    if (t.subtreeFlags & 67108864)
      for (t = t.child; t !== null; ) {
        t: {
          var e = t, a = l;
          switch (e.tag) {
            case 4:
              jm(e, a);
              break t;
            case 22:
              e.memoizedState === null && yo(e, a);
              break t;
            default:
              yo(e, a);
          }
        }
        t = t.sibling;
      }
  }
  function Bm(t) {
    var l = t.alternate;
    l !== null && (t.alternate = null, Bm(l)), t.child = null, t.deletions = null, t.sibling = null, t.tag === 5 && (l = t.stateNode, l !== null && wu(l)), t.stateNode = null, t.return = null, t.dependencies = null, t.memoizedProps = null, t.memoizedState = null, t.pendingProps = null, t.stateNode = null, t.updateQueue = null;
  }
  var Ut = null, yl = !1;
  function $l(t, l, e) {
    for (e = e.child; e !== null; )
      Ym(t, l, e), e = e.sibling;
  }
  function Ym(t, l, e) {
    if (Sl && typeof Sl.onCommitFiberUnmount == "function")
      try {
        Sl.onCommitFiberUnmount(Hn, e);
      } catch {
      }
    switch (e.tag) {
      case 26:
        St || al(e, l), $l(
          t,
          l,
          e
        ), e.memoizedState ? e.memoizedState.count-- : e.stateNode && !St && (e = e.stateNode, e.parentNode.removeChild(e));
        break;
      case 27:
        St || al(e, l), ou(e);
        var a = Ut, n = yl;
        Pe(e.type) && (Ut = e.stateNode, yl = !1), $l(
          t,
          l,
          e
        ), X0(
          e.stateNode,
          e.type,
          e.memoizedProps
        ), Ut = a, yl = n;
        break;
      case 5:
        St || al(e, l), ou(e);
      case 6:
        if (e.tag === 6 && ou(e), a = Ut, n = yl, Ut = null, $l(
          t,
          l,
          e
        ), Ut = a, yl = n, Ut !== null)
          if (yl)
            try {
              (Ut.nodeType === 9 ? Ut.body : Ut.nodeName === "HTML" ? Ut.ownerDocument.body : Ut).removeChild(e.stateNode), ht = !0;
            } catch (u) {
              _t(
                e,
                l,
                u
              );
            }
          else
            try {
              Ut.removeChild(e.stateNode), ht = !0;
            } catch (u) {
              _t(
                e,
                l,
                u
              );
            }
        break;
      case 18:
        Ut !== null && (yl ? (t = Ut, N0(
          t.nodeType === 9 ? t.body : t.nodeName === "HTML" ? t.ownerDocument.body : t,
          e.stateNode
        ), Nn(t)) : N0(Ut, e.stateNode));
        break;
      case 4:
        a = Ut, n = yl, Ut = e.stateNode.containerInfo, yl = !0, $l(
          t,
          l,
          e
        ), Ut = a, yl = n;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        Ke(2, e, l), St || Ke(4, e, l), $l(
          t,
          l,
          e
        );
        break;
      case 1:
        St || (al(e, l), a = e.stateNode, typeof a.componentWillUnmount == "function" && _m(
          e,
          l,
          a
        )), $l(
          t,
          l,
          e
        );
        break;
      case 21:
        $l(
          t,
          l,
          e
        );
        break;
      case 22:
        St = (a = St) || e.memoizedState !== null, $l(
          t,
          l,
          e
        ), St = a;
        break;
      case 30:
        al(e, l), $l(
          t,
          l,
          e
        );
        break;
      case 7:
        St || al(e, l), $l(
          t,
          l,
          e
        );
        break;
      default:
        $l(
          t,
          l,
          e
        );
    }
  }
  function qm(t, l) {
    if (l.memoizedState === null && (t = l.alternate, t !== null && (t = t.memoizedState, t !== null))) {
      t = t.dehydrated;
      try {
        Nn(t);
      } catch (e) {
        _t(l, l.return, e);
      }
    }
  }
  function Gm(t, l) {
    if (l.memoizedState === null && (t = l.alternate, t !== null && (t = t.memoizedState, t !== null && (t = t.dehydrated, t !== null))))
      try {
        Nn(t);
      } catch (e) {
        _t(l, l.return, e);
      }
  }
  function Ig(t) {
    switch (t.tag) {
      case 31:
      case 13:
      case 19:
        var l = t.stateNode;
        return l === null && (l = t.stateNode = new Hm()), l;
      case 22:
        return t = t.stateNode, l = t._retryCache, l === null && (l = t._retryCache = new Hm()), l;
      default:
        throw Error(f(435, t.tag));
    }
  }
  function Xi(t, l) {
    var e = Ig(t);
    l.forEach(function(a) {
      if (!e.has(a)) {
        e.add(a);
        var n = rh.bind(null, t, a);
        a.then(n, n);
      }
    });
  }
  function ol(t, l, e) {
    var a = l.deletions;
    if (a !== null)
      for (var n = 0; n < a.length; n++) {
        var u = a[n], c = t, r = l, d = r;
        t: for (; d !== null; ) {
          switch (d.tag) {
            case 27:
              if (Pe(d.type)) {
                Ut = d.stateNode, yl = !1;
                break t;
              }
              break;
            case 5:
              Ut = d.stateNode, yl = !1;
              break t;
            case 3:
            case 4:
              Ut = d.stateNode.containerInfo, yl = !0;
              break t;
          }
          d = d.return;
        }
        if (Ut === null) throw Error(f(160));
        Ym(c, r, u), Ut = null, yl = !1, c = u.alternate, c !== null && (c.return = null), u.return = null;
      }
    if (l.subtreeFlags & 13886)
      for (l = l.child; l !== null; )
        Vm(l, t, e), l = l.sibling;
  }
  var Jl = null;
  function Vm(t, l, e) {
    var a = t.alternate, n = t.flags;
    switch (t.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if (n & 4 && (a = t.updateQueue, a = a !== null ? a.events : null, a !== null))
          for (var u = 0; u < a.length; u++) {
            var c = a[u];
            c.ref.impl = c.nextImpl;
          }
        ol(l, t, e), rl(t), n & 4 && (Ke(3, t, t.return), fu(3, t), Ke(5, t, t.return));
        break;
      case 1:
        ol(l, t, e), rl(t), n & 512 && (St || a === null || al(a, a.return)), n & 64 && Ft && (t = t.updateQueue, t !== null && (l = t.callbacks, l !== null && (e = t.shared.hiddenCallbacks, t.shared.hiddenCallbacks = e === null ? l : e.concat(l))));
        break;
      case 26:
        if (u = Jl, ol(l, t, e), rl(t), n & 512 && (St || a === null || al(a, a.return)), n & 4)
          if (n = a !== null ? a.memoizedState : null, e = t.memoizedState, a === null)
            if (e === null)
              if (t.stateNode === null)
                if (Ft)
                  t.stateNode = _0(
                    t.type,
                    t.memoizedProps,
                    l.containerInfo,
                    t
                  );
                else {
                  t: {
                    l = t.type, e = t.memoizedProps, n = u.ownerDocument || u;
                    l: switch (l) {
                      case "title":
                        a = n.getElementsByTagName("title")[0], (!a || a[Bn] || a[Pt] || a.namespaceURI === "http://www.w3.org/2000/svg" || a.hasAttribute("itemprop")) && (a = n.createElement(l), n.head.insertBefore(
                          a,
                          n.querySelector("head > title")
                        )), nl(a, l, e), a[Pt] = t, $t(a), l = a;
                        break t;
                      case "link":
                        if (u = $0(
                          "link",
                          "href",
                          n
                        ).get(l + (e.href || ""))) {
                          for (c = 0; c < u.length; c++)
                            if (a = u[c], a.getAttribute("href") === (e.href == null || e.href === "" ? null : e.href) && a.getAttribute("rel") === (e.rel == null ? null : e.rel) && a.getAttribute("title") === (e.title == null ? null : e.title) && a.getAttribute("crossorigin") === (e.crossOrigin == null ? null : e.crossOrigin)) {
                              u.splice(c, 1);
                              break l;
                            }
                        }
                        a = n.createElement(l), nl(a, l, e), n.head.appendChild(a);
                        break;
                      case "meta":
                        if (u = $0(
                          "meta",
                          "content",
                          n
                        ).get(l + (e.content || ""))) {
                          for (c = 0; c < u.length; c++)
                            if (a = u[c], a.getAttribute("content") === (e.content == null ? null : "" + e.content) && a.getAttribute("name") === (e.name == null ? null : e.name) && a.getAttribute("property") === (e.property == null ? null : e.property) && a.getAttribute("http-equiv") === (e.httpEquiv == null ? null : e.httpEquiv) && a.getAttribute("charset") === (e.charSet == null ? null : e.charSet)) {
                              u.splice(c, 1);
                              break l;
                            }
                        }
                        a = n.createElement(l), nl(a, l, e), n.head.appendChild(a);
                        break;
                      default:
                        throw Error(f(468, l));
                    }
                    a[Pt] = t, $t(a), l = a;
                  }
                  t.stateNode = l;
                }
              else
                Ft || Io(u, t.type, t.stateNode);
            else
              t.stateNode = K0(
                u,
                e,
                t.memoizedProps
              );
          else
            n !== e ? (n === null ? (l = a.stateNode, l === null || St || l.parentNode.removeChild(l)) : n.count--, e === null ? Ft || Io(u, t.type, t.stateNode) : K0(u, e, t.memoizedProps)) : e === null && t.stateNode !== null && eo(
              t,
              t.memoizedProps,
              a.memoizedProps
            );
        break;
      case 27:
        ol(l, t, e), rl(t), n & 512 && (St || a === null || al(a, a.return)), a !== null && n & 4 && eo(
          t,
          t.memoizedProps,
          a.memoizedProps
        );
        break;
      case 5:
        if (u = ie, ie = !1, ol(l, t, e), ie = u, rl(t), n & 512 && (St || a === null || al(a, a.return)), t.flags & 32) {
          l = t.stateNode;
          try {
            Qa(l, ""), ht = !0;
          } catch (_) {
            _t(t, t.return, _);
          }
        }
        n & 4 && t.stateNode != null && (l = t.memoizedProps, eo(
          t,
          l,
          a !== null ? a.memoizedProps : l
        )), n & 1024 && (ro = !0);
        break;
      case 6:
        if (ol(l, t, e), rl(t), n & 4) {
          if (t.stateNode === null)
            throw Error(f(162));
          l = t.memoizedProps, e = t.stateNode;
          try {
            e.nodeValue = l, ht = !0;
          } catch (_) {
            _t(t, t.return, _);
          }
        }
        break;
      case 3:
        if (ht = !1, ec = null, u = Jl, Jl = pu(l.containerInfo), ol(l, t, e), Jl = u, rl(t), n & 4 && a !== null && a.memoizedState.isDehydrated)
          try {
            Nn(l.containerInfo);
          } catch (_) {
            _t(t, t.return, _);
          }
        ro && (ro = !1, Xm(t)), ht = !1;
        break;
      case 4:
        n = ie, ie = Ft, a = cs(), u = Jl, Jl = pu(
          t.stateNode.containerInfo
        ), ol(l, t, e), rl(t), Jl = u, ht && ru && (Gi = !0), ht = a, ie = n;
        break;
      case 12:
        ol(l, t, e), rl(t);
        break;
      case 31:
        ol(l, t, e), rl(t), n & 4 && (l = t.updateQueue, l !== null && (t.updateQueue = null, Xi(t, l)));
        break;
      case 13:
        ol(l, t, e), rl(t), t.child.flags & 8192 && t.memoizedState !== null != (a !== null && a.memoizedState !== null) && (Zi = pl()), n & 4 && (l = t.updateQueue, l !== null && (t.updateQueue = null, Xi(t, l)));
        break;
      case 22:
        u = t.memoizedState !== null, c = a !== null && a.memoizedState !== null;
        var r = Ft, d = St, p = ie;
        Ft = r || u, ie = p || u, St = d || c, ol(l, t, e), St = d, ie = p, Ft = r, rl(t), n & 8192 && (l = t.stateNode, l._visibility = u ? l._visibility & -2 : l._visibility | 1, !u || a === null || c || Ft || St || (l = c || St, e = Ft, a = St, Ft = u || Ft, St = l, $e(t, 2), Ft = e, St = a), !u && ie || mo(t, u)), n & 4 && (l = t.updateQueue, l !== null && (e = l.retryQueue, e !== null && (l.retryQueue = null, Xi(t, e))));
        break;
      case 19:
        ol(l, t, e), rl(t), n & 4 && (l = t.updateQueue, l !== null && (t.updateQueue = null, Xi(t, l)));
        break;
      case 30:
        n & 512 && (St || a === null || al(a, a.return)), n = cs(), u = ru, c = (e & 335544064) === e, r = t.memoizedProps, ru = c && he(
          r.default,
          r.update
        ) !== "none", ol(l, t, e), rl(t), c && a !== null && ht && (t.flags |= 4), ru = u, ht = n;
        break;
      case 21:
        break;
      case 7:
        n & 512 && (St || a === null || al(a, a.return)), a && a.stateNode !== null && (a.stateNode._fragmentFiber = t);
      default:
        ol(l, t, e), rl(t);
    }
  }
  function rl(t) {
    var l = t.flags;
    if (l & 2) {
      try {
        for (var e, a = t.return; a !== null; ) {
          if (Om(a)) {
            e = a;
            break;
          }
          a = a.return;
        }
        a = null;
        for (var n = t.return; n !== null; ) {
          if (to(n)) {
            var u = n.stateNode;
            a === null ? a = [u] : a.push(u);
          }
          if (Pf(n)) break;
          n = n.return;
        }
        var c = a;
        if (e == null) throw Error(f(160));
        switch (e.tag) {
          case 27:
            var r = e.stateNode, d = ao(t);
            ji(
              t,
              d,
              r,
              c
            );
            break;
          case 5:
            var p = e.stateNode;
            e.flags & 32 && (Qa(p, ""), e.flags &= -33);
            var _ = ao(t);
            ji(
              t,
              _,
              p,
              c
            );
            break;
          case 3:
          case 4:
            var A = e.stateNode.containerInfo, h = ao(t);
            no(
              t,
              h,
              A,
              c
            );
            break;
          default:
            throw Error(f(161));
        }
      } catch (E) {
        _t(t, t.return, E);
      }
      t.flags &= -3;
    }
    l & 4096 && (t.flags &= -4097);
  }
  function Xm(t) {
    if (t.subtreeFlags & 1024)
      for (t = t.child; t !== null; ) {
        var l = t;
        Xm(l), l.tag === 5 && l.flags & 1024 && (l = l.stateNode, On = !0, l.reset(), On = !1), t = t.sibling;
      }
  }
  function fn(t, l) {
    if (l.subtreeFlags & 9270)
      for (l = l.child; l !== null; )
        Qm(l, t), l = l.sibling;
    else Um(l);
  }
  function Qm(t, l) {
    var e = t.alternate;
    if (e === null) uo(t, !1);
    else
      switch (t.tag) {
        case 3:
          if (so = ce = !1, Cm(), fn(l, t), !ce && !Gi) {
            if (t = ne, t !== null)
              for (var a = 0; a < t.length; a += 3) {
                e = t[a];
                var n = t[a + 1];
                M0(e, t[a + 2]), e = e.ownerDocument.documentElement, e !== null && e.animate(
                  { opacity: [0, 0], pointerEvents: ["none", "none"] },
                  {
                    duration: 0,
                    fill: "forwards",
                    pseudoElement: "::view-transition-group(" + n + ")"
                  }
                );
              }
            t = l.containerInfo, t = t.nodeType === 9 ? t.documentElement : t.ownerDocument.documentElement, t !== null && t.style.viewTransitionName === "" && (t.style.viewTransitionName = "none", t.animate(
              { opacity: [0, 0], pointerEvents: ["none", "none"] },
              {
                duration: 0,
                fill: "forwards",
                pseudoElement: "::view-transition-group(root)"
              }
            ), t.animate(
              { width: [0, 0], height: [0, 0] },
              {
                duration: 0,
                fill: "forwards",
                pseudoElement: "::view-transition"
              }
            )), so = !0;
          }
          ne = null;
          break;
        case 5:
          fn(l, t);
          break;
        case 4:
          a = ce, ce = !1, fn(l, t), ce && (Gi = !0), ce = a;
          break;
        case 22:
          t.memoizedState === null && (e.memoizedState !== null ? uo(t, !1) : fn(l, t));
          break;
        case 30:
          a = ce, n = Cm(), ce = !1, fn(l, t), ce && (t.flags |= 4);
          var u = t.memoizedProps, c = t.stateNode;
          l = ge(u, c), c = ge(e.memoizedProps, c);
          var r = he(u.default, u.update);
          r === "none" ? l = !1 : (u = e.memoizedState, e.memoizedState = null, e = t.child, ml = 0, l = oo(
            t,
            e,
            l,
            c,
            r,
            u,
            !0
          ), ml !== (u === null ? 0 : u.length) && (t.flags |= 32)), (t.flags & 4) !== 0 && l ? (vn(
            t,
            t.memoizedProps.onUpdate
          ), ne = n) : n !== null && (n.push.apply(n, ne), ne = n), ce = (t.flags & 32) !== 0 ? !0 : a;
          break;
        default:
          fn(l, t);
      }
  }
  function fe(t, l) {
    if (l.subtreeFlags & 8772)
      for (l = l.child; l !== null; )
        xm(t, l.alternate, l), l = l.sibling;
  }
  function $e(t, l) {
    for (t = t.child; t !== null; ) {
      var e = t, a = l;
      switch (e.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          Ke(4, e, e.return), $e(
            e,
            a
          );
          break;
        case 1:
          al(e, e.return);
          var n = e.stateNode;
          typeof n.componentWillUnmount == "function" && _m(
            e,
            e.return,
            n
          ), $e(
            e,
            a
          );
          break;
        case 27:
          (a & 2) !== 0 && X0(
            e.stateNode,
            e.type,
            e.memoizedProps
          );
        case 5:
          al(e, e.return), e.tag !== 5 && e.tag !== 27 || ou(e), $e(
            e,
            a
          );
          break;
        case 6:
          ou(e);
          break;
        case 26:
          al(e, e.return), n = e.stateNode, e.memoizedState !== null || n === null || St || n.parentNode.removeChild(n), $e(
            e,
            a
          );
          break;
        case 22:
          e.memoizedState === null && $e(
            e,
            a
          );
          break;
        case 30:
          al(e, e.return), $e(
            e,
            a
          );
          break;
        case 7:
          al(e, e.return);
        default:
          $e(
            e,
            a
          );
      }
      t = t.sibling;
    }
  }
  function Fl(t, l, e) {
    for (e = (l.subtreeFlags & 8772) !== 0 ? e : e & -2, l = l.child; l !== null; ) {
      var a = l.alternate, n = t, u = l, c = u.flags, r = (e & 1) !== 0;
      switch (u.tag) {
        case 0:
        case 11:
        case 15:
          Fl(
            n,
            u,
            e
          ), fu(4, u);
          break;
        case 1:
          if (Fl(
            n,
            u,
            e
          ), a = u, n = a.stateNode, typeof n.componentDidMount == "function")
            try {
              n.componentDidMount();
            } catch (_) {
              _t(a, a.return, _);
            }
          if (a = u, n = a.updateQueue, n !== null) {
            var d = a.stateNode;
            try {
              var p = n.shared.hiddenCallbacks;
              if (p !== null)
                for (n.shared.hiddenCallbacks = null, n = 0; n < p.length; n++)
                  rd(p[n], d);
            } catch (_) {
              _t(a, a.return, _);
            }
          }
          r && c & 64 && Em(u), ae(u, u.return);
          break;
        case 27:
          (e & 2) !== 0 && Nm(u);
        case 5:
          u.tag !== 5 && u.tag !== 27 || zm(u), Fl(
            n,
            u,
            e
          ), r && a === null && c & 4 && lo(u), ae(u, u.return);
          break;
        case 6:
          zm(u);
          break;
        case 26:
          d = u.stateNode, u.memoizedState !== null || d === null || Ft || Io(
            pu(d.ownerDocument),
            u.type,
            d
          ), Fl(
            n,
            u,
            e
          ), r && a === null && c & 4 && lo(u), ae(u, u.return);
          break;
        case 12:
          Fl(
            n,
            u,
            e
          );
          break;
        case 31:
          Fl(
            n,
            u,
            e
          ), r && c & 4 && qm(n, u);
          break;
        case 13:
          Fl(
            n,
            u,
            e
          ), r && c & 4 && Gm(n, u);
          break;
        case 22:
          u.memoizedState === null && Fl(
            n,
            u,
            e
          ), ae(u, u.return);
          break;
        case 30:
          Fl(
            n,
            u,
            e
          ), ae(u, u.return);
          break;
        case 7:
          ae(u, u.return);
        default:
          Fl(
            n,
            u,
            e
          );
      }
      l = l.sibling;
    }
  }
  function vo(t, l) {
    var e = null;
    t !== null && t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), t = null, l.memoizedState !== null && l.memoizedState.cachePool !== null && (t = l.memoizedState.cachePool.pool), t !== e && (t != null && t.refCount++, e != null && Fn(e));
  }
  function go(t, l) {
    t = null, l.alternate !== null && (t = l.alternate.memoizedState.cache), l = l.memoizedState.cache, l !== t && (l.refCount++, t != null && Fn(t));
  }
  function Vl(t, l, e, a) {
    var n = (e & 335544064) === e;
    if (l.subtreeFlags & (n ? 10262 : 10256))
      for (l = l.child; l !== null; )
        Lm(
          t,
          l,
          e,
          a
        ), l = l.sibling;
    else n && Dm(l);
  }
  function Lm(t, l, e, a) {
    var n = (e & 335544064) === e;
    n && l.alternate === null && l.return !== null && l.return.alternate !== null && qi(l);
    var u = l.flags;
    switch (l.tag) {
      case 0:
      case 11:
      case 15:
        Vl(
          t,
          l,
          e,
          a
        ), u & 2048 && fu(9, l);
        break;
      case 1:
        Vl(
          t,
          l,
          e,
          a
        );
        break;
      case 3:
        Vl(
          t,
          l,
          e,
          a
        ), n && so && (t = t.containerInfo, t = t.nodeType === 9 ? t.body : t.nodeName === "HTML" ? t.ownerDocument.body : t, t.style.viewTransitionName === "root" && (t.style.viewTransitionName = ""), t = t.ownerDocument.documentElement, t !== null && t.style.viewTransitionName === "none" && (t.style.viewTransitionName = "")), u & 2048 && (u = null, l.alternate !== null && (u = l.alternate.memoizedState.cache), l = l.memoizedState.cache, l !== u && (l.refCount++, u != null && Fn(u)));
        break;
      case 12:
        if (u & 2048) {
          Vl(
            t,
            l,
            e,
            a
          ), u = l.stateNode;
          try {
            var c = l.memoizedProps, r = c.id, d = c.onPostCommit;
            typeof d == "function" && d(
              r,
              l.alternate === null ? "mount" : "update",
              u.passiveEffectDuration,
              -0
            );
          } catch (p) {
            _t(l, l.return, p);
          }
        } else
          Vl(
            t,
            l,
            e,
            a
          );
        break;
      case 31:
        Vl(
          t,
          l,
          e,
          a
        );
        break;
      case 13:
        Vl(
          t,
          l,
          e,
          a
        );
        break;
      case 23:
        break;
      case 22:
        c = l.stateNode, r = l.alternate, l.memoizedState !== null ? (n && r !== null && r.memoizedState === null && qi(r), c._visibility & 2 ? Vl(
          t,
          l,
          e,
          a
        ) : su(
          t,
          l
        )) : (n && r !== null && r.memoizedState !== null && qi(l), c._visibility & 2 ? Vl(
          t,
          l,
          e,
          a
        ) : (c._visibility |= 2, on(
          t,
          l,
          e,
          a,
          (l.subtreeFlags & 10256) !== 0 || !1
        ))), u & 2048 && vo(r, l);
        break;
      case 24:
        Vl(
          t,
          l,
          e,
          a
        ), u & 2048 && go(l.alternate, l);
        break;
      case 30:
        n && (u = l.alternate, u !== null && (ue(u.child, !0), ue(l.child, !0))), Vl(
          t,
          l,
          e,
          a
        );
        break;
      default:
        Vl(
          t,
          l,
          e,
          a
        );
    }
  }
  function on(t, l, e, a, n) {
    for (n = n && ((l.subtreeFlags & 10256) !== 0 || !1), l = l.child; l !== null; ) {
      var u = t, c = l, r = e, d = a, p = c.flags;
      switch (c.tag) {
        case 0:
        case 11:
        case 15:
          on(
            u,
            c,
            r,
            d,
            n
          ), fu(8, c);
          break;
        case 23:
          break;
        case 22:
          var _ = c.stateNode;
          c.memoizedState !== null ? _._visibility & 2 ? on(
            u,
            c,
            r,
            d,
            n
          ) : su(
            u,
            c
          ) : (_._visibility |= 2, on(
            u,
            c,
            r,
            d,
            n
          )), n && p & 2048 && vo(
            c.alternate,
            c
          );
          break;
        case 24:
          on(
            u,
            c,
            r,
            d,
            n
          ), n && p & 2048 && go(c.alternate, c);
          break;
        default:
          on(
            u,
            c,
            r,
            d,
            n
          );
      }
      l = l.sibling;
    }
  }
  function su(t, l) {
    if (l.subtreeFlags & 10256)
      for (l = l.child; l !== null; ) {
        var e = t, a = l, n = a.flags;
        switch (a.tag) {
          case 22:
            su(e, a), n & 2048 && vo(
              a.alternate,
              a
            );
            break;
          case 24:
            su(e, a), n & 2048 && go(a.alternate, a);
            break;
          default:
            su(e, a);
        }
        l = l.sibling;
      }
  }
  var Oa = 8192;
  function Na(t, l, e) {
    if (t.subtreeFlags & Oa)
      for (t = t.child; t !== null; )
        Zm(
          t,
          l,
          e
        ), t = t.sibling;
  }
  function Zm(t, l, e) {
    switch (t.tag) {
      case 26:
        Na(
          t,
          l,
          e
        ), t.flags & Oa && (t.memoizedState !== null ? n1(
          e,
          Jl,
          t.memoizedState,
          t.memoizedProps
        ) : (t = t.stateNode, (l & 335544128) === l && k0(e, t)));
        break;
      case 5:
        Na(
          t,
          l,
          e
        ), t.flags & Oa && (t = t.stateNode, (l & 335544128) === l && k0(e, t));
        break;
      case 3:
      case 4:
        var a = Jl;
        Jl = pu(t.stateNode.containerInfo), Na(
          t,
          l,
          e
        ), Jl = a;
        break;
      case 22:
        t.memoizedState === null && (a = t.alternate, a !== null && a.memoizedState !== null ? (a = Oa, Oa = 16777216, Na(
          t,
          l,
          e
        ), Oa = a) : Na(
          t,
          l,
          e
        ));
        break;
      case 30:
        if ((t.flags & Oa) !== 0 && (a = t.memoizedProps.name, a != null && a !== "auto")) {
          var n = t.stateNode;
          n.paired = null, Ol === null && (Ol = /* @__PURE__ */ new Map()), Ol.set(a, n);
        }
        Na(
          t,
          l,
          e
        );
        break;
      default:
        Na(
          t,
          l,
          e
        );
    }
  }
  function wm(t) {
    var l = t.alternate;
    if (l !== null && (t = l.child, t !== null)) {
      l.child = null;
      do
        l = t.sibling, t.sibling = null, t = l;
      while (t !== null);
    }
  }
  function du(t) {
    var l = t.deletions;
    if ((t.flags & 16) !== 0) {
      if (l !== null)
        for (var e = 0; e < l.length; e++) {
          var a = l[e];
          Wt = a, $m(
            a,
            t
          );
        }
      wm(t);
    }
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null; )
        Km(t), t = t.sibling;
  }
  function Km(t) {
    switch (t.tag) {
      case 0:
      case 11:
      case 15:
        du(t), t.flags & 2048 && Ke(9, t, t.return);
        break;
      case 3:
        du(t);
        break;
      case 12:
        du(t);
        break;
      case 22:
        var l = t.stateNode;
        t.memoizedState !== null && l._visibility & 2 && (t.return === null || t.return.tag !== 13) ? (l._visibility &= -3, Qi(t)) : du(t);
        break;
      default:
        du(t);
    }
  }
  function Qi(t) {
    var l = t.deletions;
    if ((t.flags & 16) !== 0) {
      if (l !== null)
        for (var e = 0; e < l.length; e++) {
          var a = l[e];
          Wt = a, $m(
            a,
            t
          );
        }
      wm(t);
    }
    for (t = t.child; t !== null; ) {
      switch (l = t, l.tag) {
        case 0:
        case 11:
        case 15:
          Ke(8, l, l.return), Qi(l);
          break;
        case 22:
          e = l.stateNode, e._visibility & 2 && (e._visibility &= -3, Qi(l));
          break;
        default:
          Qi(l);
      }
      t = t.sibling;
    }
  }
  function $m(t, l) {
    for (; Wt !== null; ) {
      var e = Wt;
      switch (e.tag) {
        case 0:
        case 11:
        case 15:
          Ke(8, e, l);
          break;
        case 23:
        case 22:
          if (e.memoizedState !== null && e.memoizedState.cachePool !== null) {
            var a = e.memoizedState.cachePool.pool;
            a != null && a.refCount++;
          }
          break;
        case 24:
          Fn(e.memoizedState.cache);
      }
      if (a = e.child, a !== null) a.return = e, Wt = a;
      else
        t: for (e = t; Wt !== null; ) {
          a = Wt;
          var n = a.sibling, u = a.return;
          if (Bm(a), a === e) {
            Wt = null;
            break t;
          }
          if (n !== null) {
            n.return = u, Wt = n;
            break t;
          }
          Wt = u;
        }
    }
  }
  var Pg = {
    getCacheForType: function(t) {
      var l = tl(Vt), e = l.data.get(t);
      return e === void 0 && (e = t(), l.data.set(t, e)), e;
    },
    cacheSignal: function() {
      return tl(Vt).controller.signal;
    }
  }, th = typeof WeakMap == "function" ? WeakMap : Map, bt = 0, Mt = null, ut = null, ot = 0, Et = 0, Nl = null, Je = !1, rn = !1, ho = !1, Ne = 0, Yt = 0, Fe = 0, Aa = 0, Li = 0, Al = 0, sn = 0, mu = null, vl = null, bo = !1, Zi = 0, Jm = 0, wi = 1 / 0, Ki = null, We = null, xt = 0, Wl = null, Ca = null, oe = 0, po = 0, So = null, Fm = null, dn = null, mn = null, yn = null, yu = 0, $i = null;
  function Cl() {
    return (bt & 2) !== 0 && ot !== 0 ? ot & -ot : V.T !== null ? Ro() : Ir();
  }
  function Wm() {
    if (Al === 0)
      if ((ot & 536870912) === 0 || nt) {
        var t = Xu;
        Xu <<= 1, (Xu & 3932160) === 0 && (Xu = 262144), Al = t;
      } else Al = 536870912;
    return t = ll.current, t !== null && (t.flags |= 32), Al;
  }
  function vn(t, l) {
    if (l != null) {
      var e = t.stateNode, a = e.ref;
      a === null && (a = e.ref = R0(
        ge(t.memoizedProps, e)
      )), mn === null && (mn = []), mn.push(l.bind(null, a));
    }
  }
  function gl(t, l, e) {
    (t === Mt && (Et === 2 || Et === 9) || t.cancelPendingCommit !== null) && (gn(t, 0), ke(
      t,
      ot,
      Al,
      !1
    )), jn(t, e), ((bt & 2) === 0 || t !== Mt) && (t === Mt && ((bt & 2) === 0 && (Aa |= e), Yt === 4 && ke(
      t,
      ot,
      Al,
      !1
    )), re(t));
  }
  function km(t, l, e) {
    if ((bt & 6) !== 0) throw Error(f(327));
    var a = !e && (l & 127) === 0 && (l & t.expiredLanes) === 0 || xn(t, l), n = a ? ah(t, l) : Eo(t, l, !0), u = a;
    do {
      if (n === 0) {
        rn && !a && ke(t, l, 0, !1);
        break;
      } else {
        if (e = t.current.alternate, u && !lh(e)) {
          n = Eo(t, l, !1), u = !1;
          continue;
        }
        if (n === 2) {
          if (u = l, t.errorRecoveryDisabledLanes & u)
            var c = 0;
          else
            c = t.pendingLanes & -536870913, c = c !== 0 ? c : c & 536870912 ? 536870912 : 0;
          if (c !== 0) {
            l = c;
            t: {
              var r = t;
              n = mu;
              var d = r.current.memoizedState.isDehydrated;
              if (d && (gn(r, c).flags |= 256), c = Eo(
                r,
                c,
                !1
              ), c !== 2 && c !== 6) {
                if (ho && !d) {
                  r.errorRecoveryDisabledLanes |= u, Aa |= u, n = 4;
                  break t;
                }
                u = vl, vl = n, u !== null && (vl === null ? vl = u : vl.push.apply(
                  vl,
                  u
                ));
              }
              n = c;
            }
            if (u = !1, n !== 2) continue;
          }
        }
        if (n === 1) {
          gn(t, 0), ke(t, l, 0, !0);
          break;
        }
        t: {
          switch (a = t, u = n, u) {
            case 0:
            case 1:
              throw Error(f(345));
            case 4:
              if ((l & 4194048) !== l && (l & 62914560) !== l)
                break;
            case 6:
              ke(
                a,
                l,
                Al,
                !Je
              );
              break t;
            case 2:
              vl = null;
              break;
            case 3:
            case 5:
              break;
            default:
              throw Error(f(329));
          }
          if ((l & 62914560) === l && (n = Zi + 300 - pl(), 10 < n)) {
            if (ke(
              a,
              l,
              Al,
              !Je
            ), Lu(a, 0, !0) !== 0) break t;
            oe = l, a.timeoutHandle = Xo(
              Im.bind(
                null,
                a,
                e,
                vl,
                Ki,
                bo,
                l,
                Al,
                Aa,
                sn,
                Je,
                u,
                "Throttled",
                -0,
                0
              ),
              n
            );
            break t;
          }
          Im(
            a,
            e,
            vl,
            Ki,
            bo,
            l,
            Al,
            Aa,
            sn,
            Je,
            u,
            null,
            -0,
            0
          );
        }
      }
      break;
    } while (!0);
    re(t);
  }
  function Im(t, l, e, a, n, u, c, r, d, p, _, A, h, E) {
    t.timeoutHandle = -1;
    var H = l.subtreeFlags, q = (u & 335544064) === u;
    if (A = null, (q || H & 8192 || (H & 16785408) === 16785408) && (A = {
      stylesheets: null,
      count: 0,
      imgCount: 0,
      imgBytes: 0,
      suspenseyImages: [],
      waitingForImages: !0,
      waitingForViewTransition: !1,
      unsuspend: te
    }, Ol = null, Zm(
      l,
      u,
      A
    ), q && (H = A, q = t.containerInfo, q = (q.nodeType === 9 ? q : q.ownerDocument).__reactViewTransition, q != null && (H.count++, H.waitingForViewTransition = !0, H = Eu.bind(H), q.finished.then(H, H))), H = (u & 62914560) === u ? Zi - pl() : (u & 4194048) === u ? Jm - pl() : 0, H = u1(
      A,
      H
    ), H !== null)) {
      oe = u, t.cancelPendingCommit = H(
        i0.bind(
          null,
          t,
          l,
          u,
          e,
          a,
          n,
          c,
          r,
          d,
          p,
          _,
          A,
          null,
          h,
          E
        )
      ), ke(t, u, c, !p);
      return;
    }
    i0(
      t,
      l,
      u,
      e,
      a,
      n,
      c,
      r,
      d,
      p,
      _,
      A
    );
  }
  function lh(t) {
    for (var l = t; ; ) {
      var e = l.tag;
      if ((e === 0 || e === 11 || e === 15) && l.flags & 16384 && (e = l.updateQueue, e !== null && (e = e.stores, e !== null)))
        for (var a = 0; a < e.length; a++) {
          var n = e[a], u = n.getSnapshot;
          n = n.value;
          try {
            if (!_l(u(), n)) return !1;
          } catch {
            return !1;
          }
        }
      if (e = l.child, l.subtreeFlags & 16384 && e !== null)
        e.return = l, l = e;
      else {
        if (l === t) break;
        for (; l.sibling === null; ) {
          if (l.return === null || l.return === t) return !0;
          l = l.return;
        }
        l.sibling.return = l.return, l = l.sibling;
      }
    }
    return !0;
  }
  function ke(t, l, e, a) {
    l = $r(t, l), l &= ~Li, l &= ~Aa, t.suspendedLanes |= l, t.pingedLanes &= ~l, a && (t.warmLanes |= l), a = t.expirationTimes;
    for (var n = l; 0 < n; ) {
      var u = 31 - Tl(n), c = 1 << u;
      a[u] = -1, n &= ~c;
    }
    e !== 0 && Fr(t, e, l);
  }
  function Ji() {
    return (bt & 6) === 0 ? (vu(0), !1) : !0;
  }
  function To() {
    if (ut !== null) {
      if (Et === 0)
        var t = ut.return;
      else
        t = ut, Se = va = null, Cf(t), ln = null, In = 0, t = ut;
      for (; t !== null; )
        Tm(t.alternate, t), t = t.return;
      ut = null;
    }
  }
  function gn(t, l) {
    var e = t.timeoutHandle;
    return e !== -1 && (t.timeoutHandle = -1, Oh(e)), e = t.cancelPendingCommit, e !== null && (t.cancelPendingCommit = null, e()), oe = 0, To(), Mt = t, ut = e = be(t.current, null), ot = l, Et = 0, Nl = null, Je = !1, rn = xn(t, l), ho = !1, sn = Al = Li = Aa = Fe = Yt = 0, vl = mu = null, bo = !1, Ne = $r(t, l), ei(), e;
  }
  function Pm(t, l) {
    lt = null, V.H = Ai, l === tn || l === mi ? (l = id(), Et = 3) : l === vf ? (l = id(), Et = 4) : Et = l === Lf ? 8 : l !== null && typeof l == "object" && typeof l.then == "function" ? 6 : 1, Nl = l, ut === null && (Yt = 1, Ci(
      t,
      Bl(l, t.current)
    ));
  }
  function t0() {
    var t = ll.current;
    return t === null ? !0 : (ot & 4194048) === ot ? il === null : (ot & 62914560) === ot || (ot & 536870912) !== 0 ? t === il : !1;
  }
  function l0() {
    var t = V.H;
    return V.H = Ai, t === null ? Ai : t;
  }
  function e0() {
    var t = V.A;
    return V.A = Pg, t;
  }
  function Fi() {
    Yt = 4, Je || (ot & 4194048) !== ot && ll.current !== null || (rn = !0), (Fe & 134217727) === 0 && (Aa & 134217727) === 0 || Mt === null || ke(
      Mt,
      ot,
      Al,
      !1
    );
  }
  function Eo(t, l, e) {
    var a = bt;
    bt |= 2;
    var n = l0(), u = e0();
    (Mt !== t || ot !== l) && (Ki = null, gn(t, l)), l = !1;
    var c = Yt;
    t: do
      try {
        if (Et !== 0 && ut !== null) {
          var r = ut, d = Nl;
          switch (Et) {
            case 8:
              To(), c = 6;
              break t;
            case 3:
            case 2:
            case 9:
            case 6:
              ll.current === null && (l = !0);
              var p = Et;
              if (Et = 0, Nl = null, hn(t, r, d, p), e && rn) {
                c = 0;
                break t;
              }
              break;
            default:
              p = Et, Et = 0, Nl = null, hn(t, r, d, p);
          }
        }
        eh(), c = Yt;
        break;
      } catch (_) {
        Pm(t, _);
      }
    while (!0);
    return l && t.shellSuspendCounter++, Se = va = null, bt = a, V.H = n, V.A = u, ut === null && (Mt = null, ot = 0, ei()), c;
  }
  function eh() {
    for (; ut !== null; ) a0(ut);
  }
  function ah(t, l) {
    var e = bt;
    bt |= 2;
    var a = l0(), n = e0();
    Mt !== t || ot !== l ? (Ki = null, wi = pl() + 500, gn(t, l)) : rn = xn(
      t,
      l
    );
    t: do
      try {
        if (Et !== 0 && ut !== null) {
          l = ut;
          var u = Nl;
          l: switch (Et) {
            case 1:
              Et = 0, Nl = null, hn(t, l, u, 1);
              break;
            case 2:
            case 9:
              if (nd(u)) {
                Et = 0, Nl = null, n0(l);
                break;
              }
              l = function() {
                Et !== 2 && Et !== 9 || Mt !== t || (Et = 7), re(t);
              }, u.then(l, l);
              break t;
            case 3:
              Et = 7;
              break t;
            case 4:
              Et = 5;
              break t;
            case 7:
              nd(u) ? (Et = 0, Nl = null, n0(l)) : (Et = 0, Nl = null, hn(t, l, u, 7));
              break;
            case 5:
              var c = null;
              switch (ut.tag) {
                case 26:
                  c = ut.memoizedState;
                case 5:
                case 27:
                  var r = ut;
                  if (c ? F0(c) : r.stateNode.complete) {
                    Et = 0, Nl = null;
                    var d = r.sibling;
                    if (d !== null) ut = d;
                    else {
                      var p = r.return;
                      p !== null ? (ut = p, Wi(p)) : ut = null;
                    }
                    break l;
                  }
              }
              Et = 0, Nl = null, hn(t, l, u, 5);
              break;
            case 6:
              Et = 0, Nl = null, hn(t, l, u, 6);
              break;
            case 8:
              To(), Yt = 6;
              break t;
            default:
              throw Error(f(462));
          }
        }
        nh();
        break;
      } catch (_) {
        Pm(t, _);
      }
    while (!0);
    return Se = va = null, V.H = a, V.A = n, bt = e, ut !== null ? 0 : (Mt = null, ot = 0, ei(), Yt);
  }
  function nh() {
    for (; ut !== null && !Tv(); )
      a0(ut);
  }
  function a0(t) {
    var l = pm(t.alternate, t, Ne);
    t.memoizedProps = t.pendingProps, l === null ? Wi(t) : ut = l;
  }
  function n0(t) {
    var l = t, e = l.alternate;
    switch (l.tag) {
      case 15:
      case 0:
        l = dm(
          e,
          l,
          l.pendingProps,
          l.type,
          void 0,
          ot
        );
        break;
      case 11:
        l = dm(
          e,
          l,
          l.pendingProps,
          l.type.render,
          l.ref,
          ot
        );
        break;
      case 5:
        Cf(l);
        var a = l;
        a === Jt && (nt ? (fi(a), a.tag === 5 && a.stateNode != null && (Rt = a.stateNode)) : (fi(a), nt = !0));
      default:
        Tm(e, l), l = ut = $s(l, Ne), l = pm(e, l, Ne);
    }
    t.memoizedProps = t.pendingProps, l === null ? Wi(t) : ut = l;
  }
  function hn(t, l, e, a) {
    Se = va = null, Cf(l), ln = null, In = 0;
    var n = l.return;
    try {
      if (wg(
        t,
        n,
        l,
        e,
        ot
      )) {
        Yt = 1, Ci(
          t,
          Bl(e, t.current)
        ), ut = null;
        return;
      }
    } catch (u) {
      if (n !== null) throw ut = n, u;
      Yt = 1, Ci(
        t,
        Bl(e, t.current)
      ), ut = null;
      return;
    }
    l.flags & 32768 ? (nt || a === 1 ? t = !0 : rn || (ot & 536870912) !== 0 ? t = !1 : (Je = t = !0, (a === 2 || a === 9 || a === 3 || a === 6) && (a = ll.current, a !== null && a.tag === 13 && (a.flags |= 16384))), u0(l, t)) : Wi(l);
  }
  function Wi(t) {
    var l = t;
    do {
      if ((l.flags & 32768) !== 0) {
        u0(
          l,
          Je
        );
        return;
      }
      t = l.return;
      var e = Fg(
        l.alternate,
        l,
        Ne
      );
      if (e !== null) {
        ut = e;
        return;
      }
      if (l = l.sibling, l !== null) {
        ut = l;
        return;
      }
      ut = l = t;
    } while (l !== null);
    Yt === 0 && (Yt = 5);
  }
  function u0(t, l) {
    do {
      var e = Wg(t.alternate, t);
      if (e !== null) {
        e.flags &= 32767, ut = e;
        return;
      }
      if (e = t.return, e !== null && (e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null), !l && (t = t.sibling, t !== null)) {
        ut = t;
        return;
      }
      ut = t = e;
    } while (t !== null);
    Yt = 6, ut = null;
  }
  function i0(t, l, e, a, n, u, c, r, d, p, _, A) {
    t.cancelPendingCommit = null;
    do
      ki();
    while (xt !== 0);
    if ((bt & 6) !== 0) throw Error(f(327));
    if (l !== null) {
      if (l === t.current) throw Error(f(177));
      t === Mt && (ut = Mt = null, ot = 0), Ca = l, Wl = t, oe = e, So = n, Fm = a, uh(
        t,
        l,
        e,
        c,
        r,
        d,
        A
      );
    }
  }
  function uh(t, l, e, a, n, u, c) {
    var r = l.lanes | l.childLanes;
    if (po = r, r |= lf, Dv(
      t,
      e,
      r,
      a,
      n,
      u
    ), mn = null, (e & 335544064) === e ? (yn = Hg(t), a = 10262) : (yn = null, a = 10256), (l.subtreeFlags & a) !== 0 || (l.flags & a) !== 0 ? (t.callbackNode = null, t.callbackPriority = 0, sh(Gu, function() {
      return No(), null;
    })) : (t.callbackNode = null, t.callbackPriority = 0), Bi = !1, a = (l.flags & 13878) !== 0, (l.subtreeFlags & 13878) !== 0 || a) {
      a = V.T, V.T = null, n = k.p, k.p = 2, u = bt, bt |= 4;
      try {
        kg(t, l, e);
      } finally {
        bt = u, k.p = n, V.T = a;
      }
    }
    xt = 1, Bi ? dn = Dh(
      c,
      t.containerInfo,
      yn,
      _o,
      zo,
      ch,
      Oo,
      No,
      ih
    ) : (_o(), zo(), Oo());
  }
  function ih(t) {
    if (xt !== 0) {
      var l = Wl.onRecoverableError;
      l(t, { componentStack: null });
    }
  }
  function ch() {
    xt === 3 && (xt = 0, Qm(Ca, Wl), xt = 4);
  }
  function _o() {
    if (xt === 1) {
      xt = 0;
      var t = Wl, l = Ca, e = oe, a = (l.flags & 13878) !== 0;
      if ((l.subtreeFlags & 13878) !== 0 || a) {
        a = V.T, V.T = null;
        var n = k.p;
        k.p = 2;
        var u = bt;
        bt |= 4;
        try {
          ru = Gi = !1, Vm(l, t, e), e = qo;
          var c = Ys(t.containerInfo), r = e.focusedElem, d = e.selectionRange;
          if (c !== r && r && r.ownerDocument && Bs(
            r.ownerDocument.documentElement,
            r
          )) {
            if (d !== null && Wc(r)) {
              var p = d.start, _ = d.end;
              if (_ === void 0 && (_ = p), "selectionStart" in r)
                r.selectionStart = p, r.selectionEnd = Math.min(
                  _,
                  r.value.length
                );
              else {
                var A = r.ownerDocument || document, h = A && A.defaultView || window;
                if (h.getSelection) {
                  var E = h.getSelection(), H = r.textContent.length, q = Math.min(d.start, H), et = d.end === void 0 ? q : Math.min(d.end, H);
                  !E.extend && q > et && (c = et, et = q, q = c);
                  var b = js(
                    r,
                    q
                  ), v = js(
                    r,
                    et
                  );
                  if (b && v && (E.rangeCount !== 1 || E.anchorNode !== b.node || E.anchorOffset !== b.offset || E.focusNode !== v.node || E.focusOffset !== v.offset)) {
                    var T = A.createRange();
                    T.setStart(b.node, b.offset), E.removeAllRanges(), q > et ? (E.addRange(T), E.extend(v.node, v.offset)) : (T.setEnd(v.node, v.offset), E.addRange(T));
                  }
                }
              }
            }
            for (A = [], E = r; E = E.parentNode; )
              E.nodeType === 1 && A.push({
                element: E,
                left: E.scrollLeft,
                top: E.scrollTop
              });
            for (typeof r.focus == "function" && r.focus(), r = 0; r < A.length; r++) {
              var N = A[r];
              N.element.scrollLeft = N.left, N.element.scrollTop = N.top;
            }
          }
          On = !!Yo, qo = Yo = null;
        } finally {
          bt = u, k.p = n, V.T = a;
        }
      }
      t.current = l, xt = 2;
    }
  }
  function zo() {
    if (xt === 2) {
      xt = 0;
      var t = Wl, l = Ca, e = (l.flags & 8772) !== 0;
      if ((l.subtreeFlags & 8772) !== 0 || e) {
        e = V.T, V.T = null;
        var a = k.p;
        k.p = 2;
        var n = bt;
        bt |= 4;
        try {
          xm(t, l.alternate, l);
        } finally {
          bt = n, k.p = a, V.T = e;
        }
      }
      xt = 3;
    }
  }
  function Oo() {
    if (xt === 4 || xt === 3) {
      xt = 0;
      var t = dn;
      dn = null, Ev();
      var l = Wl, e = Ca, a = oe, n = Fm, u = (a & 335544064) === a ? 10262 : 10256;
      if ((e.subtreeFlags & u) !== 0 || (e.flags & u) !== 0 ? xt = 5 : (xt = 0, Ca = Wl = null, c0(l, l.pendingLanes)), u = l.pendingLanes, u === 0 && (We = null), Uc(a), e = e.stateNode, Sl && typeof Sl.onCommitFiberRoot == "function")
        try {
          Sl.onCommitFiberRoot(
            Hn,
            e,
            void 0,
            (e.current.flags & 128) === 128
          );
        } catch {
        }
      if (n !== null) {
        e = V.T, u = k.p, k.p = 2, V.T = null;
        try {
          for (var c = l.onRecoverableError, r = 0; r < n.length; r++) {
            var d = n[r];
            c(d.value, {
              componentStack: d.stack
            });
          }
        } finally {
          V.T = e, k.p = u;
        }
      }
      if (n = mn, c = yn, yn = null, n !== null && (mn = null, c === null && (c = []), t !== null))
        for (d = 0; d < n.length; d++)
          e = (0, n[d])(
            c
          ), e !== void 0 && t.finished.finally(e);
      (oe & 3) !== 0 && ki(), re(l), u = l.pendingLanes, (a & 261930) !== 0 && (u & 42) !== 0 ? l === $i ? yu++ : (yu = 0, $i = l) : (yu = 0, $i = null), vu(0);
    }
  }
  function c0(t, l) {
    (t.pooledCacheLanes &= l) === 0 && (l = t.pooledCache, l != null && (t.pooledCache = null, Fn(l)));
  }
  function ki() {
    return dn !== null && (dn.skipTransition(), dn = null), _o(), zo(), Oo(), No();
  }
  function No() {
    if (xt !== 5) return !1;
    var t = Wl, l = po;
    po = 0;
    var e = Uc(oe), a = V.T, n = k.p;
    try {
      k.p = 32 > e ? 32 : e, V.T = null, e = So, So = null;
      var u = Wl, c = oe;
      if (xt = 0, Ca = Wl = null, oe = 0, (bt & 6) !== 0) throw Error(f(331));
      var r = bt;
      if (bt |= 4, Km(u.current), Lm(
        u,
        u.current,
        c,
        e
      ), bt = r, vu(0, !1), Sl && typeof Sl.onPostCommitFiberRoot == "function")
        try {
          Sl.onPostCommitFiberRoot(Hn, u);
        } catch {
        }
      return !0;
    } finally {
      k.p = n, V.T = a, c0(t, l);
    }
  }
  function f0(t, l, e) {
    l = Bl(e, l), l = Qf(t.stateNode, l, 2), t = Qe(t, l, 2), t !== null && (jn(t, 2), re(t));
  }
  function _t(t, l, e) {
    if (t.tag === 3)
      f0(t, t, e);
    else
      for (; l !== null; ) {
        if (l.tag === 3) {
          f0(
            l,
            t,
            e
          );
          break;
        } else if (l.tag === 1) {
          var a = l.stateNode;
          if (typeof l.type.getDerivedStateFromError == "function" || typeof a.componentDidCatch == "function" && (We === null || !We.has(a))) {
            t = Bl(e, t), e = nm(2), a = Qe(l, e, 2), a !== null && (um(
              e,
              a,
              l,
              t
            ), jn(a, 2), re(a));
            break;
          }
        }
        l = l.return;
      }
  }
  function Ao(t, l, e) {
    var a = t.pingCache;
    if (a === null) {
      a = t.pingCache = new th();
      var n = /* @__PURE__ */ new Set();
      a.set(l, n);
    } else
      n = a.get(l), n === void 0 && (n = /* @__PURE__ */ new Set(), a.set(l, n));
    n.has(e) || (ho = !0, n.add(e), t = fh.bind(null, t, l, e), l.then(t, t));
  }
  function fh(t, l, e) {
    var a = t.pingCache;
    a !== null && a.delete(l), t.pingedLanes |= t.suspendedLanes & e, t.warmLanes &= ~e, Mt === t && (ot & e) === e && ((Yt === 4 || Yt === 3 && (ot & 62914560) === ot && 300 > pl() - Zi) && (bt & 2) === 0 ? gn(t, 0) : Li |= e, sn === ot && (sn = 0)), re(t);
  }
  function o0(t, l) {
    l === 0 && (l = Jr()), t = da(t, l), t !== null && (jn(t, l), re(t));
  }
  function oh(t) {
    var l = t.memoizedState, e = 0;
    l !== null && (e = l.retryLane), o0(t, e);
  }
  function rh(t, l) {
    var e = 0;
    switch (t.tag) {
      case 31:
      case 13:
        var a = t.stateNode, n = t.memoizedState;
        n !== null && (e = n.retryLane);
        break;
      case 19:
        a = t.stateNode;
        break;
      case 22:
        a = t.stateNode._retryCache;
        break;
      default:
        throw Error(f(314));
    }
    a !== null && a.delete(l), o0(t, e);
  }
  function sh(t, l) {
    return Cc(t, l);
  }
  var bn = null, pn = null, Co = !1, Ii = !1, Mo = !1, Ie = 0;
  function re(t) {
    t !== pn && t.next === null && (pn === null ? bn = pn = t : pn = pn.next = t), Ii = !0, Co || (Co = !0, mh());
  }
  function vu(t, l) {
    if (!Mo && Ii) {
      Mo = !0;
      do
        for (var e = !1, a = bn; a !== null; ) {
          if (t !== 0) {
            var n = a.pendingLanes;
            if (n === 0) var u = 0;
            else {
              var c = a.suspendedLanes, r = a.pingedLanes;
              u = (1 << 31 - Tl(42 | t) + 1) - 1, u &= n & ~(c & ~r), u = u & 201326741 ? u & 201326741 | 1 : u ? u | 2 : 0;
            }
            u !== 0 && (e = !0, m0(a, u));
          } else
            u = ot, u = Lu(
              a,
              a === Mt ? u : 0,
              a.cancelPendingCommit !== null || a.timeoutHandle !== -1
            ), (u & 3) === 0 || xn(a, u) || (e = !0, m0(a, u));
          a = a.next;
        }
      while (e);
      Mo = !1;
    }
  }
  function dh() {
    r0();
  }
  function r0() {
    Ii = Co = !1;
    var t = 0;
    Ie !== 0 && zh() && (t = Ie);
    for (var l = pl(), e = null, a = bn; a !== null; ) {
      var n = a.next, u = s0(a, l);
      u === 0 ? (a.next = null, e === null ? bn = n : e.next = n, n === null && (pn = e)) : (e = a, (t !== 0 || (u & 3) !== 0) && (Ii = !0)), a = n;
    }
    xt !== 0 && xt !== 5 || vu(t), Ie !== 0 && (Ie = 0);
  }
  function s0(t, l) {
    for (var e = t.suspendedLanes, a = t.pingedLanes, n = t.expirationTimes, u = t.pendingLanes & -62914561; 0 < u; ) {
      var c = 31 - Tl(u), r = 1 << c, d = n[c];
      d === -1 ? ((r & e) === 0 || (r & a) !== 0) && (n[c] = Rv(r, l)) : d <= l && (t.expiredLanes |= r), u &= ~r;
    }
    if (l = Mt, e = ot, e = Lu(
      t,
      t === l ? e : 0,
      t.cancelPendingCommit !== null || t.timeoutHandle !== -1
    ), a = t.callbackNode, e === 0 || t === l && (Et === 2 || Et === 9) || t.cancelPendingCommit !== null)
      return a !== null && a !== null && Mc(a), t.callbackNode = null, t.callbackPriority = 0;
    if ((e & 3) === 0 || xn(t, e)) {
      if (l = e & -e, l === t.callbackPriority) return l;
      switch (a !== null && Mc(a), Uc(e)) {
        case 2:
        case 8:
          e = wr;
          break;
        case 32:
          e = Gu;
          break;
        case 268435456:
          e = Kr;
          break;
        default:
          e = Gu;
      }
      return a = d0.bind(null, t), e = Cc(e, a), t.callbackPriority = l, t.callbackNode = e, l;
    }
    return a !== null && a !== null && Mc(a), t.callbackPriority = 2, t.callbackNode = null, 2;
  }
  function d0(t, l) {
    if (xt !== 0 && xt !== 5)
      return t.callbackNode = null, t.callbackPriority = 0, null;
    var e = t.callbackNode;
    if (ki() && t.callbackNode !== e)
      return null;
    var a = ot;
    return a = Lu(
      t,
      t === Mt ? a : 0,
      t.cancelPendingCommit !== null || t.timeoutHandle !== -1
    ), a === 0 ? null : (km(t, a, l), s0(t, pl()), t.callbackNode != null && t.callbackNode === e ? d0.bind(null, t) : null);
  }
  function m0(t, l) {
    if (ki()) return null;
    km(t, l, !0);
  }
  function mh() {
    Nh(function() {
      (bt & 6) !== 0 ? Cc(
        Zr,
        dh
      ) : r0();
    });
  }
  function Ro() {
    if (Ie === 0) {
      var t = ba;
      t === 0 && (t = Vu, Vu <<= 1, (Vu & 261888) === 0 && (Vu = 256)), Ie = t;
    }
    return Ie;
  }
  function y0(t) {
    return t == null || typeof t == "symbol" || typeof t == "boolean" ? null : typeof t == "function" ? t : Ju(t);
  }
  function yh(t, l, e, a, n) {
    if (l === "submit" && e && e.stateNode === n) {
      var u = y0(
        (n[sl] || null).action
      ), c = a.submitter;
      c && (l = (l = c[sl] || null) ? y0(l.formAction) : c.getAttribute("formAction"), l !== null && (u = l, c = null));
      var r = new Iu(
        "action",
        "action",
        null,
        a,
        n
      );
      t.push({
        event: r,
        listeners: [
          {
            instance: null,
            listener: function() {
              if (a.defaultPrevented) {
                if (Ie !== 0) {
                  var d = new FormData(n, c);
                  Yf(
                    e,
                    {
                      pending: !0,
                      data: d,
                      method: n.method,
                      action: u
                    },
                    null,
                    d
                  );
                }
              } else
                typeof u == "function" && (r.preventDefault(), d = new FormData(n, c), Yf(
                  e,
                  {
                    pending: !0,
                    data: d,
                    method: n.method,
                    action: u
                  },
                  u,
                  d
                ));
            },
            currentTarget: n
          }
        ]
      });
    }
  }
  for (var Do = 0; Do < tf.length; Do++) {
    var Uo = tf[Do], vh = Uo.toLowerCase(), gh = Uo[0].toUpperCase() + Uo.slice(1);
    Kl(
      vh,
      "on" + gh
    );
  }
  Kl(Vs, "onAnimationEnd"), Kl(Xs, "onAnimationIteration"), Kl(Qs, "onAnimationStart"), Kl("dblclick", "onDoubleClick"), Kl("focusin", "onFocus"), Kl("focusout", "onBlur"), Kl(Og, "onTransitionRun"), Kl(Ng, "onTransitionStart"), Kl(Ag, "onTransitionCancel"), Kl(Ls, "onTransitionEnd"), Va("onMouseEnter", ["mouseout", "mouseover"]), Va("onMouseLeave", ["mouseout", "mouseover"]), Va("onPointerEnter", ["pointerout", "pointerover"]), Va("onPointerLeave", ["pointerout", "pointerover"]), oa(
    "onChange",
    "change click focusin focusout input keydown keyup selectionchange".split(" ")
  ), oa(
    "onSelect",
    "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
      " "
    )
  ), oa("onBeforeInput", [
    "compositionend",
    "keypress",
    "textInput",
    "paste"
  ]), oa(
    "onCompositionEnd",
    "compositionend focusout keydown keypress keyup mousedown".split(" ")
  ), oa(
    "onCompositionStart",
    "compositionstart focusout keydown keypress keyup mousedown".split(" ")
  ), oa(
    "onCompositionUpdate",
    "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
  );
  var gu = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
    " "
  ), hh = new Set(
    "beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(gu)
  );
  function v0(t, l) {
    l = (l & 4) !== 0;
    for (var e = 0; e < t.length; e++) {
      var a = t[e], n = a.event;
      a = a.listeners;
      t: {
        var u = void 0;
        if (l)
          for (var c = a.length - 1; 0 <= c; c--) {
            var r = a[c], d = r.instance, p = r.currentTarget;
            if (r = r.listener, d !== u && n.isPropagationStopped())
              break t;
            u = r, n.currentTarget = p;
            try {
              u(n);
            } catch (_) {
              li(_);
            }
            n.currentTarget = null, u = d;
          }
        else
          for (c = 0; c < a.length; c++) {
            if (r = a[c], d = r.instance, p = r.currentTarget, r = r.listener, d !== u && n.isPropagationStopped())
              break t;
            u = r, n.currentTarget = p;
            try {
              u(n);
            } catch (_) {
              li(_);
            }
            n.currentTarget = null, u = d;
          }
      }
    }
  }
  function it(t, l) {
    var e = l[ts];
    e === void 0 && (e = l[ts] = /* @__PURE__ */ new Set());
    var a = t + "__bubble";
    e.has(a) || (g0(l, t, 2, !1), e.add(a));
  }
  function Ho(t, l, e) {
    var a = 0;
    l && (a |= 4), g0(
      e,
      t,
      a,
      l
    );
  }
  var Pi = "_reactListening" + Math.random().toString(36).slice(2);
  function xo(t) {
    if (!t[Pi]) {
      t[Pi] = !0, as.forEach(function(e) {
        e !== "selectionchange" && (hh.has(e) || Ho(e, !1, t), Ho(e, !0, t));
      });
      var l = t.nodeType === 9 ? t : t.ownerDocument;
      l === null || l[Pi] || (l[Pi] = !0, Ho("selectionchange", !1, l));
    }
  }
  function g0(t, l, e, a) {
    switch (uy(l)) {
      case 2:
        var n = o1;
        break;
      case 8:
        n = r1;
        break;
      default:
        n = tr;
    }
    e = n.bind(
      null,
      l,
      e,
      t
    ), n = void 0, !Vc || l !== "touchstart" && l !== "touchmove" && l !== "wheel" || (n = !0), a ? n !== void 0 ? t.addEventListener(l, e, {
      capture: !0,
      passive: n
    }) : t.addEventListener(l, e, !0) : n !== void 0 ? t.addEventListener(l, e, {
      passive: n
    }) : t.addEventListener(l, e, !1);
  }
  function jo(t, l, e, a, n) {
    var u = a;
    if ((l & 1) === 0 && (l & 2) === 0 && a !== null)
      t: for (; ; ) {
        if (a === null) return;
        var c = a.tag;
        if (c === 3 || c === 4) {
          var r = a.stateNode.containerInfo;
          if (r === n) break;
          if (c === 4)
            for (c = a.return; c !== null; ) {
              var d = c.tag;
              if ((d === 3 || d === 4) && c.stateNode.containerInfo === n)
                return;
              c = c.return;
            }
          for (; r !== null; ) {
            if (c = fa(r), c === null) return;
            if (d = c.tag, d === 5 || d === 6 || d === 26 || d === 27) {
              a = u = c;
              continue t;
            }
            r = r.parentNode;
          }
        }
        a = a.return;
      }
    gs(function() {
      var p = u, _ = qc(e), A = [];
      t: {
        var h = Zs.get(t);
        if (h !== void 0) {
          var E = Iu, H = t;
          switch (t) {
            case "keypress":
              if (Wu(e) === 0) break t;
            case "keydown":
            case "keyup":
              E = lg;
              break;
            case "focusin":
              H = "focus", E = Zc;
              break;
            case "focusout":
              H = "blur", E = Zc;
              break;
            case "beforeblur":
            case "afterblur":
              E = Zc;
              break;
            case "click":
              if (e.button === 2) break t;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              E = ps;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              E = Lv;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              E = ig;
              break;
            case Vs:
            case Xs:
            case Qs:
              E = Kv;
              break;
            case Ls:
              E = fg;
              break;
            case "scroll":
            case "scrollend":
              E = Xv;
              break;
            case "wheel":
              E = rg;
              break;
            case "copy":
            case "cut":
            case "paste":
              E = Jv;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              E = Ts;
              break;
            case "submit":
              E = ng;
              break;
            case "toggle":
            case "beforetoggle":
              E = dg;
          }
          var q = (l & 4) !== 0, et = !q && (t === "scroll" || t === "scrollend"), b = q ? h !== null ? h + "Capture" : null : h;
          q = [];
          for (var v = p, T; v !== null; ) {
            var N = v;
            if (T = N.stateNode, N = N.tag, N !== 5 && N !== 26 && N !== 27 || T === null || b === null || (N = qn(v, b), N != null && q.push(
              hu(v, N, T)
            )), et) break;
            v = v.return;
          }
          0 < q.length && (h = new E(
            h,
            H,
            null,
            e,
            _
          ), A.push({ event: h, listeners: q }));
        }
      }
      if ((l & 7) === 0) {
        t: {
          if (E = t === "mouseover" || t === "pointerover", h = t === "mouseout" || t === "pointerout", E && e !== Yc && (H = e.relatedTarget || e.fromElement) && (fa(H) || H[Ya]))
            break t;
          (h || E) && (H = _.window === _ ? _ : (E = _.ownerDocument) ? E.defaultView || E.parentWindow : window, h ? (E = e.relatedTarget || e.toElement, h = p, E = E ? fa(E) : null, E !== null && (et = y(E), q = E.tag, E !== et || q !== 5 && q !== 27 && q !== 6) && (E = null)) : (h = null, E = p), h !== E && (q = ps, N = "onMouseLeave", b = "onMouseEnter", v = "mouse", (t === "pointerout" || t === "pointerover") && (q = Ts, N = "onPointerLeave", b = "onPointerEnter", v = "pointer"), et = h == null ? H : Yn(h), T = E == null ? H : Yn(E), H = new q(
            N,
            v + "leave",
            h,
            e,
            _
          ), H.target = et, H.relatedTarget = T, N = null, fa(_) === p && (q = new q(
            b,
            v + "enter",
            E,
            e,
            _
          ), q.target = T, q.relatedTarget = et, N = q), et = N, q = h && E ? pt(
            h,
            E,
            bh
          ) : null, h !== null && h0(
            A,
            H,
            h,
            q,
            !1
          ), E !== null && et !== null && h0(
            A,
            et,
            E,
            q,
            !0
          )));
        }
        t: {
          if (h = p ? Yn(p) : window, E = h.nodeName && h.nodeName.toLowerCase(), E === "select" || E === "input" && h.type === "file")
            var B = Ms;
          else if (As(h))
            if (Rs)
              B = Eg;
            else {
              B = Sg;
              var rt = pg;
            }
          else
            E = h.nodeName, !E || E.toLowerCase() !== "input" || h.type !== "checkbox" && h.type !== "radio" ? p && Bc(p.elementType) && (B = Ms) : B = Tg;
          if (B && (B = B(t, p))) {
            Cs(
              A,
              B,
              e,
              _
            );
            break t;
          }
          rt && rt(t, h, p);
        }
        switch (rt = p ? Yn(p) : window, t) {
          case "focusin":
            (As(rt) || rt.contentEditable === "true") && (Ka = rt, kc = p, Kn = null);
            break;
          case "focusout":
            Kn = kc = Ka = null;
            break;
          case "mousedown":
            Ic = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            Ic = !1, qs(A, e, _);
            break;
          case "selectionchange":
            if (zg) break;
          case "keydown":
          case "keyup":
            qs(A, e, _);
        }
        var $;
        if (Kc)
          t: {
            switch (t) {
              case "compositionstart":
                var F = "onCompositionStart";
                break t;
              case "compositionend":
                F = "onCompositionEnd";
                break t;
              case "compositionupdate":
                F = "onCompositionUpdate";
                break t;
            }
            F = void 0;
          }
        else
          wa ? Os(t, e) && (F = "onCompositionEnd") : t === "keydown" && e.keyCode === 229 && (F = "onCompositionStart");
        F && (Es && e.locale !== "ko" && (wa || F !== "onCompositionStart" ? F === "onCompositionEnd" && wa && ($ = hs()) : (He = _, Xc = "value" in He ? He.value : He.textContent, wa = !0)), rt = tc(p, F), 0 < rt.length && (F = new Ss(
          F,
          t,
          null,
          e,
          _
        ), A.push({ event: F, listeners: rt }), $ ? F.data = $ : ($ = Ns(e), $ !== null && (F.data = $)))), ($ = yg ? vg(t, e) : gg(t, e)) && (F = tc(p, "onBeforeInput"), 0 < F.length && (rt = new Ss(
          "onBeforeInput",
          "beforeinput",
          null,
          e,
          _
        ), A.push({
          event: rt,
          listeners: F
        }), rt.data = $)), yh(
          A,
          t,
          p,
          e,
          _
        );
      }
      v0(A, l);
    });
  }
  function hu(t, l, e) {
    return {
      instance: t,
      listener: l,
      currentTarget: e
    };
  }
  function tc(t, l) {
    for (var e = l + "Capture", a = []; t !== null; ) {
      var n = t, u = n.stateNode;
      if (n = n.tag, n !== 5 && n !== 26 && n !== 27 || u === null || (n = qn(t, e), n != null && a.unshift(
        hu(t, n, u)
      ), n = qn(t, l), n != null && a.push(
        hu(t, n, u)
      )), t.tag === 3) return a;
      t = t.return;
    }
    return [];
  }
  function bh(t) {
    if (t === null) return null;
    do
      t = t.return;
    while (t && t.tag !== 5 && t.tag !== 27);
    return t || null;
  }
  function h0(t, l, e, a, n) {
    for (var u = l._reactName, c = []; e !== null && e !== a; ) {
      var r = e, d = r.alternate, p = r.stateNode;
      if (r = r.tag, d !== null && d === a) break;
      r !== 5 && r !== 26 && r !== 27 || p === null || (d = p, n ? (p = qn(e, u), p != null && c.unshift(
        hu(e, p, d)
      )) : n || (p = qn(e, u), p != null && c.push(
        hu(e, p, d)
      ))), e = e.return;
    }
    c.length !== 0 && t.push({ event: l, listeners: c });
  }
  var ph = /\r\n?/g, Sh = /\u0000|\uFFFD/g;
  function b0(t) {
    return (typeof t == "string" ? t : "" + t).replace(ph, `
`).replace(Sh, "");
  }
  function p0(t, l) {
    return l = b0(l), b0(t) === l;
  }
  function zt(t, l, e, a, n, u) {
    switch (e) {
      case "children":
        if (typeof a == "string")
          l === "body" || l === "textarea" && a === "" || Qa(t, a);
        else if (typeof a == "number" || typeof a == "bigint")
          l !== "body" && Qa(t, "" + a);
        else return;
        break;
      case "className":
        $u(t, "class", a);
        break;
      case "tabIndex":
        $u(t, "tabindex", a);
        break;
      case "dir":
      case "role":
      case "viewBox":
      case "width":
      case "height":
        $u(t, e, a);
        break;
      case "style":
        ys(t, a, u);
        return;
      case "data":
        if (l !== "object") {
          $u(t, "data", a);
          break;
        }
      case "src":
      case "href":
        if (a === "" && (l !== "a" || e !== "href")) {
          t.removeAttribute(e);
          break;
        }
        if (a == null || typeof a == "function" || typeof a == "symbol" || typeof a == "boolean") {
          t.removeAttribute(e);
          break;
        }
        a = Ju(a), t.setAttribute(e, a);
        break;
      case "action":
      case "formAction":
        if (typeof a == "function") {
          t.setAttribute(
            e,
            "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')"
          );
          break;
        } else
          typeof u == "function" && (e === "formAction" ? (l !== "input" && zt(t, l, "name", n.name, n, null), zt(
            t,
            l,
            "formEncType",
            n.formEncType,
            n,
            null
          ), zt(
            t,
            l,
            "formMethod",
            n.formMethod,
            n,
            null
          ), zt(
            t,
            l,
            "formTarget",
            n.formTarget,
            n,
            null
          )) : (zt(t, l, "encType", n.encType, n, null), zt(t, l, "method", n.method, n, null), zt(t, l, "target", n.target, n, null)));
        if (a == null || typeof a == "symbol" || typeof a == "boolean") {
          t.removeAttribute(e);
          break;
        }
        a = Ju(a), t.setAttribute(e, a);
        break;
      case "onClick":
        a != null && (t.onclick = te);
        return;
      case "onScroll":
        a != null && it("scroll", t);
        return;
      case "onScrollEnd":
        a != null && it("scrollend", t);
        return;
      case "dangerouslySetInnerHTML":
        if (a != null) {
          if (typeof a != "object" || !("__html" in a))
            throw Error(f(61));
          if (e = a.__html, e != null) {
            if (n.children != null) throw Error(f(60));
            u?.__html !== e && (t.innerHTML = e);
          }
        }
        break;
      case "multiple":
        t.multiple = a && typeof a != "function" && typeof a != "symbol";
        break;
      case "muted":
        t.muted = a && typeof a != "function" && typeof a != "symbol";
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "defaultValue":
      case "defaultChecked":
      case "innerHTML":
      case "ref":
        break;
      case "autoFocus":
        break;
      case "xlinkHref":
        if (a == null || typeof a == "function" || typeof a == "boolean" || typeof a == "symbol") {
          t.removeAttribute("xlink:href");
          break;
        }
        e = Ju(a), t.setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "xlink:href",
          e
        );
        break;
      case "contentEditable":
      case "spellCheck":
      case "draggable":
      case "value":
      case "autoReverse":
      case "externalResourcesRequired":
      case "focusable":
      case "preserveAlpha":
        a != null && typeof a != "function" && typeof a != "symbol" ? t.setAttribute(e, a) : t.removeAttribute(e);
        break;
      case "inert":
      case "allowFullScreen":
      case "async":
      case "autoPlay":
      case "controls":
      case "credentialless":
      case "default":
      case "defer":
      case "disabled":
      case "disablePictureInPicture":
      case "disableRemotePlayback":
      case "formNoValidate":
      case "hidden":
      case "loop":
      case "noModule":
      case "noValidate":
      case "open":
      case "playsInline":
      case "readOnly":
      case "required":
      case "reversed":
      case "scoped":
      case "seamless":
      case "itemScope":
        a && typeof a != "function" && typeof a != "symbol" ? t.setAttribute(e, "") : t.removeAttribute(e);
        break;
      case "capture":
      case "download":
        a === !0 ? t.setAttribute(e, "") : a !== !1 && a != null && typeof a != "function" && typeof a != "symbol" ? t.setAttribute(e, a) : t.removeAttribute(e);
        break;
      case "cols":
      case "rows":
      case "size":
      case "span":
        a != null && typeof a != "function" && typeof a != "symbol" && !isNaN(a) && 1 <= a ? t.setAttribute(e, a) : t.removeAttribute(e);
        break;
      case "rowSpan":
      case "start":
        a == null || typeof a == "function" || typeof a == "symbol" || isNaN(a) ? t.removeAttribute(e) : t.setAttribute(e, a);
        break;
      case "popover":
        it("beforetoggle", t), it("toggle", t), Ku(t, "popover", a);
        break;
      case "xlinkActuate":
        ye(
          t,
          "http://www.w3.org/1999/xlink",
          "xlink:actuate",
          a
        );
        break;
      case "xlinkArcrole":
        ye(
          t,
          "http://www.w3.org/1999/xlink",
          "xlink:arcrole",
          a
        );
        break;
      case "xlinkRole":
        ye(
          t,
          "http://www.w3.org/1999/xlink",
          "xlink:role",
          a
        );
        break;
      case "xlinkShow":
        ye(
          t,
          "http://www.w3.org/1999/xlink",
          "xlink:show",
          a
        );
        break;
      case "xlinkTitle":
        ye(
          t,
          "http://www.w3.org/1999/xlink",
          "xlink:title",
          a
        );
        break;
      case "xlinkType":
        ye(
          t,
          "http://www.w3.org/1999/xlink",
          "xlink:type",
          a
        );
        break;
      case "xmlBase":
        ye(
          t,
          "http://www.w3.org/XML/1998/namespace",
          "xml:base",
          a
        );
        break;
      case "xmlLang":
        ye(
          t,
          "http://www.w3.org/XML/1998/namespace",
          "xml:lang",
          a
        );
        break;
      case "xmlSpace":
        ye(
          t,
          "http://www.w3.org/XML/1998/namespace",
          "xml:space",
          a
        );
        break;
      case "is":
        Ku(t, "is", a);
        break;
      case "innerText":
      case "textContent":
        return;
      default:
        if (!(2 < e.length) || e[0] !== "o" && e[0] !== "O" || e[1] !== "n" && e[1] !== "N")
          e = Gv.get(e) || e, Ku(t, e, a);
        else return;
    }
    ht = !0;
  }
  function Bo(t, l, e, a, n, u) {
    switch (e) {
      case "style":
        ys(t, a, u);
        return;
      case "dangerouslySetInnerHTML":
        if (a != null) {
          if (typeof a != "object" || !("__html" in a))
            throw Error(f(61));
          if (e = a.__html, e != null) {
            if (n.children != null) throw Error(f(60));
            u?.__html !== e && (t.innerHTML = e);
          }
        }
        break;
      case "children":
        if (typeof a == "string") Qa(t, a);
        else if (typeof a == "number" || typeof a == "bigint")
          Qa(t, "" + a);
        else return;
        break;
      case "onScroll":
        a != null && it("scroll", t);
        return;
      case "onScrollEnd":
        a != null && it("scrollend", t);
        return;
      case "onClick":
        a != null && (t.onclick = te);
        return;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "innerHTML":
      case "ref":
        return;
      case "innerText":
      case "textContent":
        return;
      default:
        if (!ns.hasOwnProperty(e))
          t: {
            if (e[0] === "o" && e[1] === "n" && (n = e.endsWith("Capture"), u = e.slice(2, n ? e.length - 7 : void 0), l = t[sl] || null, l = l != null ? l[e] : null, typeof l == "function" && t.removeEventListener(u, l, n), typeof a == "function")) {
              typeof l != "function" && l !== null && (e in t ? t[e] = null : t.hasAttribute(e) && t.removeAttribute(e)), t.addEventListener(u, a, n);
              break t;
            }
            ht = !0, e in t ? t[e] = a : a === !0 ? t.setAttribute(e, "") : Ku(t, e, a);
          }
        return;
    }
    ht = !0;
  }
  function nl(t, l, e) {
    switch (l) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "img":
        it("error", t), it("load", t);
        var a = !1, n = !1, u;
        for (u in e)
          if (e.hasOwnProperty(u)) {
            var c = e[u];
            if (c != null)
              switch (u) {
                case "src":
                  a = !0;
                  break;
                case "srcSet":
                  n = !0;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error(f(137, l));
                default:
                  zt(t, l, u, c, e, null);
              }
          }
        n && zt(t, l, "srcSet", e.srcSet, e, null), a && zt(t, l, "src", e.src, e, null);
        return;
      case "input":
        it("invalid", t);
        var r = u = c = n = null, d = null, p = null;
        for (a in e)
          if (e.hasOwnProperty(a)) {
            var _ = e[a];
            if (_ != null)
              switch (a) {
                case "name":
                  n = _;
                  break;
                case "type":
                  c = _;
                  break;
                case "checked":
                  d = _;
                  break;
                case "defaultChecked":
                  p = _;
                  break;
                case "value":
                  u = _;
                  break;
                case "defaultValue":
                  r = _;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  if (_ != null)
                    throw Error(f(137, l));
                  break;
                default:
                  zt(t, l, a, _, e, null);
              }
          }
        rs(
          t,
          u,
          r,
          d,
          p,
          c,
          n,
          !1
        );
        return;
      case "select":
        it("invalid", t), a = c = u = null;
        for (n in e)
          if (e.hasOwnProperty(n) && (r = e[n], r != null))
            switch (n) {
              case "value":
                u = r;
                break;
              case "defaultValue":
                c = r;
                break;
              case "multiple":
                a = r;
              default:
                zt(t, l, n, r, e, null);
            }
        l = u, e = c, t.multiple = !!a, l != null ? Xa(t, !!a, l, !1) : e != null && Xa(t, !!a, e, !0);
        return;
      case "textarea":
        it("invalid", t), u = n = a = null;
        for (c in e)
          if (e.hasOwnProperty(c) && (r = e[c], r != null))
            switch (c) {
              case "value":
                a = r;
                break;
              case "defaultValue":
                n = r;
                break;
              case "children":
                u = r;
                break;
              case "dangerouslySetInnerHTML":
                if (r != null) throw Error(f(91));
                break;
              default:
                zt(t, l, c, r, e, null);
            }
        ds(t, a, n, u);
        return;
      case "option":
        for (d in e)
          e.hasOwnProperty(d) && (a = e[d], a != null) && (d === "selected" ? t.selected = a && typeof a != "function" && typeof a != "symbol" : zt(t, l, d, a, e, null));
        return;
      case "dialog":
        it("beforetoggle", t), it("toggle", t), it("cancel", t), it("close", t);
        break;
      case "iframe":
      case "object":
        it("load", t);
        break;
      case "video":
      case "audio":
        for (a = 0; a < gu.length; a++)
          it(gu[a], t);
        break;
      case "image":
        it("error", t), it("load", t);
        break;
      case "details":
        it("toggle", t);
        break;
      case "embed":
      case "source":
      case "link":
        it("error", t), it("load", t);
      case "area":
      case "base":
      case "br":
      case "col":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "track":
      case "wbr":
      case "menuitem":
        for (p in e)
          if (e.hasOwnProperty(p) && (a = e[p], a != null))
            switch (p) {
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(f(137, l));
              default:
                zt(t, l, p, a, e, null);
            }
        return;
      default:
        if (Bc(l)) {
          for (_ in e)
            e.hasOwnProperty(_) && (a = e[_], a !== void 0 && Bo(
              t,
              l,
              _,
              a,
              e,
              void 0
            ));
          return;
        }
    }
    for (r in e)
      e.hasOwnProperty(r) && (a = e[r], a != null && zt(t, l, r, a, e, null));
  }
  var Th = {};
  function Eh(t, l, e, a) {
    switch (l) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "input":
        var n = null, u = null, c = null, r = null, d = null, p = null, _ = null;
        for (E in e) {
          var A = e[E];
          if (e.hasOwnProperty(E) && A != null)
            switch (E) {
              case "checked":
                break;
              case "value":
                break;
              case "defaultValue":
                d = A;
              default:
                a.hasOwnProperty(E) || zt(t, l, E, null, a, A);
            }
        }
        for (var h in a) {
          var E = a[h];
          if (A = e[h], a.hasOwnProperty(h) && (E != null || A != null))
            switch (h) {
              case "type":
                E !== A && (ht = !0), u = E;
                break;
              case "name":
                E !== A && (ht = !0), n = E;
                break;
              case "checked":
                E !== A && (ht = !0), p = E;
                break;
              case "defaultChecked":
                E !== A && (ht = !0), _ = E;
                break;
              case "value":
                E !== A && (ht = !0), c = E;
                break;
              case "defaultValue":
                E !== A && (ht = !0), r = E;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (E != null)
                  throw Error(f(137, l));
                break;
              default:
                E !== A && zt(
                  t,
                  l,
                  h,
                  E,
                  a,
                  A
                );
            }
        }
        xc(
          t,
          c,
          r,
          d,
          p,
          _,
          u,
          n
        );
        return;
      case "select":
        E = c = r = h = null;
        for (u in e)
          if (d = e[u], e.hasOwnProperty(u) && d != null)
            switch (u) {
              case "value":
                break;
              case "multiple":
                E = d;
              default:
                a.hasOwnProperty(u) || zt(
                  t,
                  l,
                  u,
                  null,
                  a,
                  d
                );
            }
        for (n in a)
          if (u = a[n], d = e[n], a.hasOwnProperty(n) && (u != null || d != null))
            switch (n) {
              case "value":
                u !== d && (ht = !0), h = u;
                break;
              case "defaultValue":
                u !== d && (ht = !0), r = u;
                break;
              case "multiple":
                u !== d && (ht = !0), c = u;
              default:
                u !== d && zt(
                  t,
                  l,
                  n,
                  u,
                  a,
                  d
                );
            }
        l = r, e = c, a = E, h != null ? Xa(t, !!e, h, !1) : !!a != !!e && (l != null ? Xa(t, !!e, l, !0) : Xa(t, !!e, e ? [] : "", !1));
        return;
      case "textarea":
        E = h = null;
        for (r in e)
          if (n = e[r], e.hasOwnProperty(r) && n != null && !a.hasOwnProperty(r))
            switch (r) {
              case "value":
                break;
              case "children":
                break;
              default:
                zt(t, l, r, null, a, n);
            }
        for (c in a)
          if (n = a[c], u = e[c], a.hasOwnProperty(c) && (n != null || u != null))
            switch (c) {
              case "value":
                n !== u && (ht = !0), h = n;
                break;
              case "defaultValue":
                n !== u && (ht = !0), E = n;
                break;
              case "children":
                break;
              case "dangerouslySetInnerHTML":
                if (n != null) throw Error(f(91));
                break;
              default:
                n !== u && zt(t, l, c, n, a, u);
            }
        ss(t, h, E);
        return;
      case "option":
        for (var H in e)
          h = e[H], e.hasOwnProperty(H) && h != null && !a.hasOwnProperty(H) && (H === "selected" ? t.selected = !1 : zt(
            t,
            l,
            H,
            null,
            a,
            h
          ));
        for (d in a)
          h = a[d], E = e[d], a.hasOwnProperty(d) && h !== E && (h != null || E != null) && (d === "selected" ? (h !== E && (ht = !0), t.selected = h && typeof h != "function" && typeof h != "symbol") : zt(
            t,
            l,
            d,
            h,
            a,
            E
          ));
        return;
      case "img":
      case "link":
      case "area":
      case "base":
      case "br":
      case "col":
      case "embed":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "source":
      case "track":
      case "wbr":
      case "menuitem":
        for (var q in e)
          h = e[q], e.hasOwnProperty(q) && h != null && !a.hasOwnProperty(q) && zt(t, l, q, null, a, h);
        for (p in a)
          if (h = a[p], E = e[p], a.hasOwnProperty(p) && h !== E && (h != null || E != null))
            switch (p) {
              case "children":
              case "dangerouslySetInnerHTML":
                if (h != null)
                  throw Error(f(137, l));
                break;
              default:
                zt(
                  t,
                  l,
                  p,
                  h,
                  a,
                  E
                );
            }
        return;
      default:
        if (Bc(l)) {
          for (var et in e)
            h = e[et], e.hasOwnProperty(et) && h !== void 0 && !a.hasOwnProperty(et) && Bo(
              t,
              l,
              et,
              void 0,
              a,
              h
            );
          for (_ in a)
            h = a[_], E = e[_], !a.hasOwnProperty(_) || h === E || h === void 0 && E === void 0 || Bo(
              t,
              l,
              _,
              h,
              a,
              E
            );
          return;
        }
    }
    for (var b in e)
      h = e[b], e.hasOwnProperty(b) && h != null && !a.hasOwnProperty(b) && zt(t, l, b, null, a, h);
    for (A in a)
      h = a[A], E = e[A], !a.hasOwnProperty(A) || h === E || h == null && E == null || zt(t, l, A, h, a, E);
  }
  function S0(t) {
    switch (t) {
      case "css":
      case "script":
      case "font":
      case "img":
      case "image":
      case "input":
      case "link":
        return !0;
      default:
        return !1;
    }
  }
  function _h() {
    if (typeof performance.getEntriesByType == "function") {
      for (var t = 0, l = 0, e = performance.getEntriesByType("resource"), a = 0; a < e.length; a++) {
        var n = e[a], u = n.transferSize, c = n.initiatorType, r = n.duration;
        if (u && r && S0(c)) {
          for (c = 0, r = n.responseEnd, a += 1; a < e.length; a++) {
            var d = e[a], p = d.startTime;
            if (p > r) break;
            var _ = d.transferSize, A = d.initiatorType;
            _ && S0(A) && (d = d.responseEnd, c += _ * (d < r ? 1 : (r - p) / (d - p)));
          }
          if (--a, l += 8 * (u + c) / (n.duration / 1e3), t++, 10 < t) break;
        }
      }
      if (0 < t) return l / t / 1e6;
    }
    return navigator.connection && (t = navigator.connection.downlink, typeof t == "number") ? t : 5;
  }
  var Yo = null, qo = null;
  function bu(t) {
    return t.nodeType === 9 ? t : t.ownerDocument;
  }
  function T0(t) {
    switch (t) {
      case "http://www.w3.org/2000/svg":
        return 1;
      case "http://www.w3.org/1998/Math/MathML":
        return 2;
      default:
        return 0;
    }
  }
  function E0(t, l) {
    if (t === 0)
      switch (l) {
        case "svg":
          return 1;
        case "math":
          return 2;
        default:
          return 0;
      }
    return t === 1 && l === "foreignObject" ? 0 : t;
  }
  function _0(t, l, e, a) {
    return e = bu(
      e
    ).createElement(t), e[Pt] = a, e[sl] = l, nl(e, t, l), $t(e), e;
  }
  function Go(t, l) {
    return t === "textarea" || t === "noscript" || typeof l.children == "string" || typeof l.children == "number" || typeof l.children == "bigint" || typeof l.dangerouslySetInnerHTML == "object" && l.dangerouslySetInnerHTML !== null && l.dangerouslySetInnerHTML.__html != null;
  }
  var Vo = null;
  function zh() {
    var t = window.event;
    return t && t.type === "popstate" ? t === Vo ? !1 : (Vo = t, !0) : (Vo = null, !1);
  }
  var Xo = typeof setTimeout == "function" ? setTimeout : void 0, Oh = typeof clearTimeout == "function" ? clearTimeout : void 0, z0 = typeof Promise == "function" ? Promise : void 0, O0 = typeof requestAnimationFrame == "function" ? requestAnimationFrame : Xo, Nh = typeof queueMicrotask == "function" ? queueMicrotask : typeof z0 < "u" ? function(t) {
    return z0.resolve(null).then(t).catch(Ah);
  } : Xo;
  function Ah(t) {
    setTimeout(function() {
      throw t;
    });
  }
  function Pe(t) {
    return t === "head";
  }
  function N0(t, l) {
    var e = l, a = 0;
    do {
      var n = e.nextSibling;
      if (t.removeChild(e), n && n.nodeType === 8)
        if (e = n.data, e === "/$" || e === "/&") {
          if (a === 0) {
            t.removeChild(n), Nn(l);
            return;
          }
          a--;
        } else if (e === "$" || e === "$?" || e === "$~" || e === "$!" || e === "&")
          a++;
        else if (e === "html")
          Fo(
            t.ownerDocument.documentElement
          );
        else if (e === "head") {
          e = t.ownerDocument.head, Fo(e);
          for (var u = e.firstChild; u; ) {
            var c = u.nextSibling, r = u.nodeName;
            u[Bn] || r === "SCRIPT" || r === "STYLE" || r === "LINK" && u.rel.toLowerCase() === "stylesheet" || e.removeChild(u), u = c;
          }
        } else
          e === "body" && Fo(t.ownerDocument.body);
      e = n;
    } while (e);
    Nn(l);
  }
  function A0(t, l) {
    var e = t;
    t = 0;
    do {
      var a = e.nextSibling;
      if (e.nodeType === 1 ? l ? (e._stashedDisplay = e.style.display, e.style.display = "none") : (e.style.display = e._stashedDisplay || "", e.getAttribute("style") === "" && e.removeAttribute("style")) : e.nodeType === 3 && (l ? (e._stashedText = e.nodeValue, e.nodeValue = "") : e.nodeValue = e._stashedText || ""), a && a.nodeType === 8)
        if (e = a.data, e === "/$") {
          if (t === 0) break;
          t--;
        } else
          e !== "$" && e !== "$?" && e !== "$~" && e !== "$!" || t++;
      e = a;
    } while (e);
  }
  function C0(t, l, e) {
    if (l = CSS.escape(l) !== l ? "r-" + btoa(l).replace(/=/g, "") : l, t.style.viewTransitionName = l, e != null && (t.style.viewTransitionClass = e), e = getComputedStyle(t), e.display === "inline") {
      if (l = t.getClientRects(), l.length === 1) var a = 1;
      else
        for (var n = a = 0; n < l.length; n++) {
          var u = l[n];
          0 < u.width && 0 < u.height && a++;
        }
      a === 1 && (t = t.style, t.display = l.length === 1 ? "inline-block" : "block", t.marginTop = "-" + e.paddingTop, t.marginBottom = "-" + e.paddingBottom);
    }
  }
  function M0(t, l) {
    t = t.style, l = l.style;
    var e = l != null ? l.hasOwnProperty("viewTransitionName") ? l.viewTransitionName : l.hasOwnProperty("view-transition-name") ? l["view-transition-name"] : null : null;
    t.viewTransitionName = e == null || typeof e == "boolean" ? "" : ("" + e).trim(), e = l != null ? l.hasOwnProperty("viewTransitionClass") ? l.viewTransitionClass : l.hasOwnProperty("view-transition-class") ? l["view-transition-class"] : null : null, t.viewTransitionClass = e == null || typeof e == "boolean" ? "" : ("" + e).trim(), t.display === "inline-block" && (l == null ? t.display = t.margin = "" : (e = l.display, t.display = e == null || typeof e == "boolean" ? "" : e, e = l.margin, e != null ? t.margin = e : (e = l.hasOwnProperty("marginTop") ? l.marginTop : l["margin-top"], t.marginTop = e == null || typeof e == "boolean" ? "" : e, l = l.hasOwnProperty("marginBottom") ? l.marginBottom : l["margin-bottom"], t.marginBottom = l == null || typeof l == "boolean" ? "" : l)));
  }
  function Ch(t, l, e) {
    return e = e.ownerDocument.defaultView, {
      rect: t,
      abs: l.position === "absolute" || l.position === "fixed",
      clip: l.clipPath !== "none" || l.overflow !== "visible" || l.filter !== "none" || l.mask !== "none" || l.mask !== "none" || l.borderRadius !== "0px",
      view: 0 <= t.bottom && 0 <= t.right && t.top <= e.innerHeight && t.left <= e.innerWidth
    };
  }
  function Qo(t) {
    var l = t.getBoundingClientRect(), e = getComputedStyle(t);
    return Ch(l, e, t);
  }
  function Mh(t) {
    return t.documentElement.clientHeight;
  }
  function Rh(t) {
    this.addEventListener("load", t), this.addEventListener("error", t);
  }
  function Dh(t, l, e, a, n, u, c, r, d) {
    var p = l.nodeType === 9 ? l : l.ownerDocument;
    try {
      var _ = p.startViewTransition({
        update: function() {
          var h = p.defaultView, E = h.navigation && h.navigation.transition, H = p.fonts.status;
          a();
          var q = [];
          if (H === "loaded" && (Mh(p), p.fonts.status === "loading" && q.push(p.fonts.ready)), H = q.length, t !== null)
            for (var et = t.suspenseyImages, b = 0, v = 0; v < et.length; v++) {
              var T = et[v];
              if (!T.complete) {
                var N = T.getBoundingClientRect();
                if (0 < N.bottom && 0 < N.right && N.top < h.innerHeight && N.left < h.innerWidth) {
                  if (b += W0(T), b > ac) {
                    q.length = H;
                    break;
                  }
                  T = new Promise(
                    Rh.bind(T)
                  ), q.push(T);
                }
              }
            }
          if (0 < q.length)
            return h = Promise.race([
              Promise.all(q),
              new Promise(function(B) {
                return setTimeout(B, 500);
              })
            ]).then(n, n), (E ? Promise.allSettled([E.finished, h]) : h).then(u, u);
          if (n(), E)
            return E.finished.then(
              u,
              u
            );
          u();
        },
        types: e
      });
      p.__reactViewTransition = _;
      var A = [];
      return _.ready.then(
        function() {
          for (var h = p.documentElement.getAnimations({
            subtree: !0
          }), E = 0; E < h.length; E++) {
            var H = h[E], q = H.effect, et = q.pseudoElement;
            if (et != null && et.startsWith("::view-transition")) {
              A.push(H), H = q.getKeyframes();
              for (var b = et = void 0, v = !0, T = 0; T < H.length; T++) {
                var N = H[T], B = N.width;
                if (et === void 0) et = B;
                else if (et !== B) {
                  v = !1;
                  break;
                }
                if (B = N.height, b === void 0) b = B;
                else if (b !== B) {
                  v = !1;
                  break;
                }
                delete N.width, delete N.height, N.transform === "none" && delete N.transform;
              }
              v && et !== void 0 && b !== void 0 && (q.setKeyframes(H), v = getComputedStyle(
                q.target,
                q.pseudoElement
              ), v.width !== et || v.height !== b) && (v = H[0], v.width = et, v.height = b, v = H[H.length - 1], v.width = et, v.height = b, q.setKeyframes(H));
            }
          }
          c();
        },
        function(h) {
          p.__reactViewTransition === _ && (p.__reactViewTransition = null);
          try {
            typeof h == "object" && h !== null && h.name === "InvalidStateError" && (h.message === "View transition was skipped because document visibility state is hidden." || h.message === "Skipping view transition because document visibility state has become hidden." || h.message === "Skipping view transition because viewport size changed." || h.message === "Transition was aborted because of invalid state") && (h = null), h !== null && d(h);
          } finally {
            a(), n(), c();
          }
        }
      ), _.finished.finally(function() {
        for (var h = 0; h < A.length; h++)
          A[h].cancel();
        p.__reactViewTransition === _ && (p.__reactViewTransition = null), r();
      }), _;
    } catch {
      return a(), n(), c(), null;
    }
  }
  function Ma(t, l) {
    this._scope = document.documentElement, this._selector = "::view-transition-" + t + "(" + l + ")";
  }
  Ma.prototype.animate = function(t, l) {
    return l = typeof l == "number" ? { duration: l } : Y({}, l), l.pseudoElement = this._selector, this._scope.animate(t, l);
  }, Ma.prototype.getAnimations = function() {
    for (var t = this._scope, l = this._selector, e = t.getAnimations({ subtree: !0 }), a = [], n = 0; n < e.length; n++) {
      var u = e[n].effect;
      u !== null && u.target === t && u.pseudoElement === l && a.push(e[n]);
    }
    return a;
  }, Ma.prototype.getComputedStyle = function() {
    return getComputedStyle(this._scope, this._selector);
  };
  function R0(t) {
    return {
      name: t,
      group: new Ma("group", t),
      imagePair: new Ma("image-pair", t),
      old: new Ma("old", t),
      new: new Ma("new", t)
    };
  }
  function Ml(t) {
    this._fragmentFiber = t, this._observers = this._eventListeners = null;
  }
  Ml.prototype.addEventListener = function(t, l, e) {
    var a = null, n = null;
    if (!(e != null && typeof e != "boolean" && (a = e.signal || null, a !== null && a.aborted))) {
      this._eventListeners === null && (this._eventListeners = []);
      var u = this._eventListeners;
      if (U0(u, t, l, e) === -1) {
        var c = this, r = l;
        e != null && typeof e != "boolean" && e.once === !0 && (r = function(d) {
          c.removeEventListener(
            t,
            l,
            e
          ), typeof l == "function" ? l.call(this, d) : l.handleEvent(d);
        }), a !== null && (n = c.removeEventListener.bind(
          c,
          t,
          l,
          e
        ), a.addEventListener("abort", n, { once: !0 }), n = a.removeEventListener.bind(a, "abort", n)), a = Sn(e), u.push({
          type: t,
          listener: l,
          optionsOrUseCapture: e,
          attachedListener: r,
          cleanup: n
        }), S(
          this._fragmentFiber.child,
          !1,
          Uh,
          t,
          r,
          a
        );
      }
      this._eventListeners = u;
    }
  };
  function Uh(t, l, e, a) {
    return L(t).addEventListener(
      l,
      e,
      a
    ), !1;
  }
  Ml.prototype.removeEventListener = function(t, l, e) {
    var a = this._eventListeners;
    if (a !== null && (l = U0(
      a,
      t,
      l,
      e
    ), l !== -1)) {
      var n = a[l];
      e = n.attachedListener;
      var u = n.cleanup;
      n = Sn(n.optionsOrUseCapture), S(
        this._fragmentFiber.child,
        !1,
        Hh,
        t,
        e,
        n
      ), a.splice(l, 1), u !== null && u();
    }
  };
  function Hh(t, l, e, a) {
    return L(t).removeEventListener(
      l,
      e,
      a
    ), !1;
  }
  function Sn(t) {
    return t != null && typeof t != "boolean" && (t.once === !0 || t.signal instanceof AbortSignal) ? { capture: t.capture, passive: t.passive } : t;
  }
  function D0(t) {
    return t == null ? "c=0" : typeof t == "boolean" ? "c=" + (t ? "1" : "0") : "c=" + (t.capture ? "1" : "0");
  }
  function U0(t, l, e, a) {
    if (t.length === 0) return -1;
    a = D0(a);
    for (var n = 0; n < t.length; n++) {
      var u = t[n];
      if (u.type === l && u.listener === e && D0(u.optionsOrUseCapture) === a)
        return n;
    }
    return -1;
  }
  Ml.prototype.dispatchEvent = function(t) {
    var l = D(
      this._fragmentFiber
    );
    if (l === null) return !0;
    l = L(l);
    var e = this._eventListeners;
    if (e !== null && 0 < e.length || !t.bubbles) {
      var a = l.nodeType === 9 ? l.createComment("") : document.createTextNode("");
      if (e)
        for (var n = 0; n < e.length; n++) {
          var u = e[n];
          a.addEventListener(
            u.type,
            u.attachedListener,
            Sn(u.optionsOrUseCapture)
          );
        }
      if (l.appendChild(a), t = a.dispatchEvent(t), e)
        for (n = 0; n < e.length; n++)
          u = e[n], a.removeEventListener(
            u.type,
            u.attachedListener,
            Sn(u.optionsOrUseCapture)
          );
      return l.removeChild(a), t;
    }
    return l.dispatchEvent(t);
  }, Ml.prototype.focus = function(t) {
    S(
      this._fragmentFiber.child,
      !0,
      H0,
      t,
      void 0,
      void 0
    );
  };
  function H0(t, l) {
    return t.tag === 6 ? !1 : (t = L(t), wh(t, l));
  }
  Ml.prototype.focusLast = function(t) {
    var l = [];
    S(
      this._fragmentFiber.child,
      !0,
      Lo,
      l,
      void 0,
      void 0
    );
    for (var e = l.length - 1; 0 <= e && !H0(l[e], t); e--) ;
  };
  function Lo(t, l) {
    return l.push(t), !1;
  }
  Ml.prototype.blur = function() {
    var t = D(
      this._fragmentFiber
    );
    t !== null && (t = L(t), t = bu(t).activeElement, t !== null && S(
      this._fragmentFiber.child,
      !1,
      xh,
      t,
      void 0,
      void 0
    ));
  };
  function xh(t, l) {
    return t.tag === 6 ? !1 : (t = L(t), t === l || t.contains(l) ? (l.blur(), !0) : !1);
  }
  Ml.prototype.observeUsing = function(t) {
    this._observers === null && (this._observers = /* @__PURE__ */ new Set()), this._observers.add(t), S(
      this._fragmentFiber.child,
      !1,
      jh,
      t,
      void 0,
      void 0
    );
  };
  function jh(t, l) {
    return t.tag === 6 || (t = L(t), l.observe(t)), !1;
  }
  Ml.prototype.unobserveUsing = function(t) {
    var l = this._observers;
    if (l !== null && l.has(t)) {
      l.delete(t), S(
        this._fragmentFiber.child,
        !1,
        Bh,
        t,
        void 0,
        void 0
      );
      for (var e = l = 0; e < kl.length; e++) {
        var a = kl[e];
        a.fragmentInstance === this && a.observer === t ? t.unobserve(a.instance) : kl[l++] = a;
      }
      kl.length = l;
    }
  };
  function Bh(t, l) {
    return t.tag === 6 || (t = L(t), l.unobserve(t)), !1;
  }
  var kl = [], Zo = !1;
  function Yh(t, l, e) {
    kl.push({
      fragmentInstance: t,
      observer: l,
      instance: e
    }), Zo || (Zo = !0, Kh(function() {
      Zo = !1;
      var a = kl;
      kl = [];
      for (var n = 0; n < a.length; n++) {
        var u = a[n];
        u.observer.unobserve(u.instance);
      }
    }));
  }
  Ml.prototype.getClientRects = function() {
    var t = [];
    return S(
      this._fragmentFiber.child,
      !1,
      qh,
      t,
      void 0,
      void 0
    ), t;
  };
  function qh(t, l) {
    if (t.tag === 6) {
      t = t.stateNode;
      var e = t.ownerDocument.createRange();
      e.selectNodeContents(t), l.push.apply(l, e.getClientRects());
    } else
      t = L(t), l.push.apply(l, t.getClientRects());
    return !1;
  }
  Ml.prototype.getRootNode = function(t) {
    var l = D(
      this._fragmentFiber
    );
    return l === null ? this : L(l).getRootNode(t);
  }, Ml.prototype.compareDocumentPosition = function(t) {
    var l = D(
      this._fragmentFiber
    );
    if (l === null) return Node.DOCUMENT_POSITION_DISCONNECTED;
    var e = [];
    S(
      this._fragmentFiber.child,
      !1,
      Lo,
      e,
      void 0,
      void 0
    );
    var a = L(l);
    if (e.length === 0) {
      if (e = a, Q(this._fragmentFiber)) {
        t: {
          for (l = this._fragmentFiber.return; l !== null; ) {
            if (l.tag === 4) {
              l = l.stateNode.containerInfo;
              break t;
            }
            if (l.tag === 3 || l.tag === 5 || l.tag === 27)
              break;
            l = l.return;
          }
          l = null;
        }
        l != null && (e = l);
      }
      l = this._fragmentFiber;
      var n = a = e.compareDocumentPosition(t);
      return e === t ? n = Node.DOCUMENT_POSITION_CONTAINS : a & Node.DOCUMENT_POSITION_CONTAINED_BY && (e = G(l)[1], e === null ? n = Node.DOCUMENT_POSITION_PRECEDING : (t = L(e).compareDocumentPosition(
        t
      ), n = t === 0 || t & Node.DOCUMENT_POSITION_FOLLOWING ? Node.DOCUMENT_POSITION_FOLLOWING : Node.DOCUMENT_POSITION_PRECEDING)), n |= Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
    }
    l = L(e[0]), n = L(e[e.length - 1]);
    var u = Q(this._fragmentFiber) ? l.parentElement : a;
    if (u == null)
      return Node.DOCUMENT_POSITION_DISCONNECTED;
    a = u.compareDocumentPosition(l) & Node.DOCUMENT_POSITION_CONTAINED_BY, u = u.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_CONTAINED_BY;
    var c = l.compareDocumentPosition(t), r = n.compareDocumentPosition(t), d = c & Node.DOCUMENT_POSITION_CONTAINED_BY || r & Node.DOCUMENT_POSITION_CONTAINED_BY;
    return r = a && u && c & Node.DOCUMENT_POSITION_FOLLOWING && r & Node.DOCUMENT_POSITION_PRECEDING, l = a && l === t || u && n === t || d || r ? Node.DOCUMENT_POSITION_CONTAINED_BY : !a && l === t || !u && n === t ? Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC : c, l & Node.DOCUMENT_POSITION_DISCONNECTED || l & Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC || Gh(
      l,
      this._fragmentFiber,
      e[0],
      e[e.length - 1],
      t
    ) ? l : Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
  };
  function Gh(t, l, e, a, n) {
    var u = fa(n);
    if (t & Node.DOCUMENT_POSITION_CONTAINED_BY) {
      if (e = !!u)
        t: {
          for (; u !== null; ) {
            if (u.tag === 7 && (u === l || u.alternate === l)) {
              e = !0;
              break t;
            }
            u = u.return;
          }
          e = !1;
        }
      return e;
    }
    if (t & Node.DOCUMENT_POSITION_CONTAINS) {
      if (u === null)
        return u = n.ownerDocument, n === u || n === u.documentElement || n === u.body;
      t: {
        for (u = l, l = D(l); u !== null; ) {
          if (!(u.tag !== 5 && u.tag !== 3 && u.tag !== 27 || u !== l && u.alternate !== l)) {
            u = !0;
            break t;
          }
          u = u.return;
        }
        u = !1;
      }
      return u;
    }
    return t & Node.DOCUMENT_POSITION_PRECEDING ? ((l = !!u) && !(l = u === e) && (l = pt(
      e,
      u,
      ft
    ), l === null ? l = !1 : (S(
      l,
      !0,
      yt,
      u,
      e
    ), u = at, at = null, l = u !== null)), l) : t & Node.DOCUMENT_POSITION_FOLLOWING ? ((l = !!u) && !(l = u === a) && (l = pt(
      a,
      u,
      ft
    ), l === null ? l = !1 : (S(
      l,
      !0,
      Ot,
      u,
      a
    ), u = at, tt = at = null, l = u !== null)), l) : !1;
  }
  function x0(t, l) {
    var e = t.ownerDocument.createRange();
    e.selectNodeContents(t), t = e.getBoundingClientRect(), window.scrollTo(
      window.scrollX + t.left,
      l ? window.scrollY + t.top : window.scrollY + t.bottom - window.innerHeight
    );
  }
  Ml.prototype.scrollIntoView = function(t) {
    if (typeof t == "object") throw Error(f(566));
    var l = [];
    S(
      this._fragmentFiber.child,
      !1,
      Lo,
      l,
      void 0,
      void 0
    );
    var e = t !== !1;
    if (l.length === 0) {
      var a = G(
        this._fragmentFiber
      );
      if (a = e ? a[1] || a[0] || D(this._fragmentFiber) : a[0] || a[1], a === null) return;
      if (a.tag === 6) {
        t = L(a), x0(t, e);
        return;
      }
      if (a = L(a), a.nodeType !== 9) {
        if (a.nodeType === 11) {
          e = "host" in a ? a.host : null, e !== null && e.scrollIntoView(t);
          return;
        }
        a.scrollIntoView(t);
      }
    }
    for (a = e ? l.length - 1 : 0; a !== (e ? -1 : l.length); ) {
      var n = l[a];
      n.tag === 6 ? (n = L(n), x0(n, e)) : L(n).scrollIntoView(t), a += e ? -1 : 1;
    }
  };
  function Vh(t, l) {
    return t = L(t), j0(t, l), !1;
  }
  function j0(t, l) {
    t.reactFragments == null && (t.reactFragments = /* @__PURE__ */ new Set()), t.reactFragments.add(l);
  }
  function B0(t, l) {
    var e = l._eventListeners;
    if (e !== null)
      for (var a = 0; a < e.length; a++) {
        var n = e[a];
        t.addEventListener(
          n.type,
          n.attachedListener,
          Sn(n.optionsOrUseCapture)
        );
      }
    t.nodeType !== 3 && (e = l._observers, e !== null && e.forEach(function(u) {
      for (var c = 0, r = 0; r < kl.length; r++) {
        var d = kl[r];
        (d.fragmentInstance !== l || d.observer !== u || d.instance !== t) && (kl[c++] = d);
      }
      kl.length = c, u.observe(t);
    }), j0(t, l));
  }
  function Xh(t, l) {
    var e = l._eventListeners;
    if (e !== null)
      for (var a = 0; a < e.length; a++) {
        var n = e[a];
        t.removeEventListener(
          n.type,
          n.attachedListener,
          Sn(n.optionsOrUseCapture)
        );
      }
    t.nodeType !== 3 && (e = l._observers, e !== null && e.forEach(function(u) {
      typeof u.rootMargin == "string" ? Yh(
        l,
        u,
        t
      ) : u.unobserve(t);
    }), t.reactFragments != null && t.reactFragments.delete(l));
  }
  function wo(t) {
    var l = t.firstChild;
    for (l && l.nodeType === 10 && (l = l.nextSibling); l; ) {
      var e = l;
      switch (l = l.nextSibling, e.nodeName) {
        case "HTML":
        case "HEAD":
        case "BODY":
          wo(e), wu(e);
          continue;
        case "SCRIPT":
        case "STYLE":
          continue;
        case "LINK":
          if (e.rel.toLowerCase() === "stylesheet") continue;
      }
      t.removeChild(e);
    }
  }
  function Qh(t, l, e, a) {
    for (; t.nodeType === 1; ) {
      var n = e;
      if (t.nodeName.toLowerCase() !== l.toLowerCase()) {
        if (!a && (t.nodeName !== "INPUT" || t.type !== "hidden"))
          break;
      } else if (a) {
        if (!t[Bn])
          switch (l) {
            case "meta":
              if (!t.hasAttribute("itemprop")) break;
              return t;
            case "link":
              if (u = t.getAttribute("rel"), u === "stylesheet" && t.hasAttribute("data-precedence"))
                break;
              if (u !== n.rel || t.getAttribute("href") !== (n.href == null || n.href === "" ? null : n.href) || t.getAttribute("crossorigin") !== (n.crossOrigin == null ? null : n.crossOrigin) || t.getAttribute("title") !== (n.title == null ? null : n.title))
                break;
              return t;
            case "style":
              if (t.hasAttribute("data-precedence")) break;
              return t;
            case "script":
              if (u = t.getAttribute("src"), (u !== (n.src == null ? null : n.src) || t.getAttribute("type") !== (n.type == null ? null : n.type) || t.getAttribute("crossorigin") !== (n.crossOrigin == null ? null : n.crossOrigin)) && u && t.hasAttribute("async") && !t.hasAttribute("itemprop"))
                break;
              return t;
            default:
              return t;
          }
      } else if (l === "input" && t.type === "hidden") {
        var u = n.name == null ? null : "" + n.name;
        if (n.type === "hidden" && t.getAttribute("name") === u)
          return t;
      } else return t;
      if (t = Xl(t.nextSibling), t === null) break;
    }
    return null;
  }
  function Lh(t, l, e) {
    if (l === "") return null;
    for (; t.nodeType !== 3; )
      if ((t.nodeType !== 1 || t.nodeName !== "INPUT" || t.type !== "hidden") && !e || (t = Xl(t.nextSibling), t === null)) return null;
    return t;
  }
  function Y0(t, l) {
    for (; t.nodeType !== 8; )
      if ((t.nodeType !== 1 || t.nodeName !== "INPUT" || t.type !== "hidden") && !l || (t = Xl(t.nextSibling), t === null)) return null;
    return t;
  }
  function Ko(t) {
    return t.data === "$?" || t.data === "$~";
  }
  function $o(t) {
    return t.data === "$!" || t.data === "$?" && t.ownerDocument.readyState !== "loading";
  }
  function Zh(t, l) {
    var e = t.ownerDocument;
    if (t.data === "$~") t._reactRetry = l;
    else if (t.data !== "$?" || e.readyState !== "loading")
      l();
    else {
      var a = function() {
        l(), e.removeEventListener("DOMContentLoaded", a);
      };
      e.addEventListener("DOMContentLoaded", a), t._reactRetry = a;
    }
  }
  function Xl(t) {
    for (; t != null; t = t.nextSibling) {
      var l = t.nodeType;
      if (l === 1 || l === 3) break;
      if (l === 8) {
        if (l = t.data, l === "$" || l === "$!" || l === "$?" || l === "$~" || l === "&" || l === "F!" || l === "F")
          break;
        if (l === "/$" || l === "/&") return null;
      }
    }
    return t;
  }
  var Jo = null;
  function q0(t) {
    t = t.nextSibling;
    for (var l = 0; t; ) {
      if (t.nodeType === 8) {
        var e = t.data;
        if (e === "/$" || e === "/&") {
          if (l === 0)
            return Xl(t.nextSibling);
          l--;
        } else
          e !== "$" && e !== "$!" && e !== "$?" && e !== "$~" && e !== "&" || l++;
      }
      t = t.nextSibling;
    }
    return null;
  }
  function G0(t) {
    t = t.previousSibling;
    for (var l = 0; t; ) {
      if (t.nodeType === 8) {
        var e = t.data;
        if (e === "$" || e === "$!" || e === "$?" || e === "$~" || e === "&") {
          if (l === 0) return t;
          l--;
        } else e !== "/$" && e !== "/&" || l++;
      }
      t = t.previousSibling;
    }
    return null;
  }
  function wh(t, l) {
    function e() {
      a = !0;
    }
    if (t.ownerDocument.activeElement === t) return !0;
    var a = !1;
    try {
      t.ownerDocument.addEventListener("focus", e, !0), (t.focus || HTMLElement.prototype.focus).call(t, l);
    } finally {
      t.ownerDocument.removeEventListener("focus", e, !0);
    }
    return a;
  }
  function Kh(t) {
    O0(function() {
      O0(function(l) {
        return t(l);
      });
    });
  }
  function V0(t, l, e) {
    switch (l = bu(e), t) {
      case "html":
        if (t = l.documentElement, !t) throw Error(f(452));
        return t;
      case "head":
        if (t = l.head, !t) throw Error(f(453));
        return t;
      case "body":
        if (t = l.body, !t) throw Error(f(454));
        return t;
      default:
        throw Error(f(451));
    }
  }
  function X0(t, l, e) {
    for (var a in e) {
      var n = e[a];
      e.hasOwnProperty(a) && n != null && zt(t, l, a, null, Th, n);
    }
    e.dangerouslySetInnerHTML != null && (t.textContent = ""), t.onclick === te && (t.onclick = null), wu(t);
  }
  function Fo(t) {
    for (var l = t.attributes; l.length; )
      t.removeAttributeNode(l[0]);
    wu(t);
  }
  var Ql = /* @__PURE__ */ new Map(), Q0 = /* @__PURE__ */ new Set();
  function pu(t) {
    if (typeof t.getRootNode == "function") {
      var l = t.getRootNode();
      if (l.nodeType === 9 || l.nodeType === 11) return l;
    }
    return t.nodeType === 9 ? t : t.ownerDocument;
  }
  var Ae = k.d;
  k.d = {
    f: $h,
    r: Jh,
    D: Fh,
    C: Wh,
    L: kh,
    m: Ih,
    X: t1,
    S: Ph,
    M: l1
  };
  function $h() {
    var t = Ae.f(), l = Ji();
    return t || l;
  }
  function Jh(t) {
    var l = qa(t);
    l !== null && l.tag === 5 && l.type === "form" ? Zd(l) : Ae.r(t);
  }
  var Tn = typeof document > "u" ? null : document;
  function L0(t, l, e) {
    var a = Tn;
    if (a && typeof l == "string" && l) {
      var n = xl(l);
      n = 'link[rel="' + t + '"][href="' + n + '"]', typeof e == "string" && (n += '[crossorigin="' + e + '"]'), Q0.has(n) || (Q0.add(n), t = { rel: t, crossOrigin: e, href: l }, a.querySelector(n) === null && (l = a.createElement("link"), nl(l, "link", t), $t(l), a.head.appendChild(l)));
    }
  }
  function Fh(t) {
    Ae.D(t), L0("dns-prefetch", t, null);
  }
  function Wh(t, l) {
    Ae.C(t, l), L0("preconnect", t, l);
  }
  function kh(t, l, e) {
    Ae.L(t, l, e);
    var a = Tn;
    if (a && t && l) {
      var n = 'link[rel="preload"][as="' + xl(l) + '"]';
      l === "image" && e && e.imageSrcSet ? (n += '[imagesrcset="' + xl(
        e.imageSrcSet
      ) + '"]', typeof e.imageSizes == "string" && (n += '[imagesizes="' + xl(
        e.imageSizes
      ) + '"]')) : n += '[href="' + xl(t) + '"]';
      var u = n;
      switch (l) {
        case "style":
          u = En(t);
          break;
        case "script":
          u = _n(t);
      }
      if (!(Ql.has(u) || (t = Y(
        {
          rel: "preload",
          href: l === "image" && e && e.imageSrcSet ? void 0 : t,
          as: l
        },
        e
      ), Ql.set(u, t), a.querySelector(n) !== null || l === "style" && a.querySelector(Su(u)) || l === "script" && a.querySelector(Tu(u))))) {
        var c = a.createElement("link");
        nl(c, "link", t), l === "style" && (c[Zu] = !0, c.onload = c.onerror = function() {
          es(c);
        }), $t(c), a.head.appendChild(c);
      }
    }
  }
  function Ih(t, l) {
    Ae.m(t, l);
    var e = Tn;
    if (e && t) {
      var a = l && typeof l.as == "string" ? l.as : "script", n = 'link[rel="modulepreload"][as="' + xl(a) + '"][href="' + xl(t) + '"]', u = n;
      switch (a) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          u = _n(t);
      }
      if (!Ql.has(u) && (t = Y({ rel: "modulepreload", href: t }, l), Ql.set(u, t), e.querySelector(n) === null)) {
        switch (a) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            if (e.querySelector(Tu(u)))
              return;
        }
        a = e.createElement("link"), nl(a, "link", t), $t(a), e.head.appendChild(a);
      }
    }
  }
  function Ph(t, l, e) {
    Ae.S(t, l, e);
    var a = Tn;
    if (a && t) {
      var n = Ga(a).hoistableStyles, u = En(t);
      l = l || "default";
      var c = n.get(u);
      if (!c) {
        var r = { loading: 0, preload: null };
        if (c = a.querySelector(
          Su(u)
        ))
          r.loading = 5;
        else {
          t = Y(
            { rel: "stylesheet", href: t, "data-precedence": l },
            e
          ), (e = Ql.get(u)) && Wo(t, e);
          var d = c = a.createElement("link");
          $t(d), nl(d, "link", t), d._p = new Promise(function(p, _) {
            d.onload = p, d.onerror = _;
          }), d.addEventListener("load", function() {
            r.loading |= 1;
          }), d.addEventListener("error", function() {
            r.loading |= 2;
          }), r.loading |= 4, lc(c, l, a);
        }
        c = {
          type: "stylesheet",
          instance: c,
          count: 1,
          state: r
        }, n.set(u, c);
      }
    }
  }
  function t1(t, l) {
    Ae.X(t, l);
    var e = Tn;
    if (e && t) {
      var a = Ga(e).hoistableScripts, n = _n(t), u = a.get(n);
      u || (u = e.querySelector(Tu(n)), u || (t = Y({ src: t, async: !0 }, l), (l = Ql.get(n)) && ko(t, l), u = e.createElement("script"), $t(u), nl(u, "link", t), e.head.appendChild(u)), u = {
        type: "script",
        instance: u,
        count: 1,
        state: null
      }, a.set(n, u));
    }
  }
  function l1(t, l) {
    Ae.M(t, l);
    var e = Tn;
    if (e && t) {
      var a = Ga(e).hoistableScripts, n = _n(t), u = a.get(n);
      u || (u = e.querySelector(Tu(n)), u || (t = Y({ src: t, async: !0, type: "module" }, l), (l = Ql.get(n)) && ko(t, l), u = e.createElement("script"), $t(u), nl(u, "link", t), e.head.appendChild(u)), u = {
        type: "script",
        instance: u,
        count: 1,
        state: null
      }, a.set(n, u));
    }
  }
  function Z0(t, l, e, a) {
    var n = (n = Pl.current) ? pu(n) : null;
    if (!n) throw Error(f(446));
    switch (t) {
      case "meta":
      case "title":
        return null;
      case "style":
        return typeof e.precedence == "string" && typeof e.href == "string" ? (e = En(e.href), l = Ga(
          n
        ).hoistableStyles, a = l.get(e), a || (a = {
          type: "style",
          instance: null,
          count: 0,
          state: null
        }, l.set(e, a)), a) : { type: "void", instance: null, count: 0, state: null };
      case "link":
        if (e.rel === "stylesheet" && typeof e.href == "string" && typeof e.precedence == "string") {
          t = En(e.href);
          var u = Ga(
            n
          ).hoistableStyles, c = u.get(t);
          if (c || (n = n.ownerDocument || n, c = {
            type: "stylesheet",
            instance: null,
            count: 0,
            state: { loading: 0, preload: null }
          }, u.set(t, c), (u = n.querySelector(
            Su(t)
          )) ? u._p || (c.instance = u, c.state.loading = 5) : (u = Ql.get(t), u || (u = {
            rel: "preload",
            as: "style",
            href: e.href,
            crossOrigin: e.crossOrigin,
            integrity: e.integrity,
            media: e.media,
            hrefLang: e.hrefLang,
            referrerPolicy: e.referrerPolicy
          }, Ql.set(t, u)), e1(
            n,
            t,
            u,
            c.state
          ))), l && a === null)
            throw Error(f(528, ""));
          return c;
        }
        if (l && a !== null)
          throw Error(f(529, ""));
        return null;
      case "script":
        return l = e.async, e = e.src, typeof e == "string" && l && typeof l != "function" && typeof l != "symbol" ? (e = _n(e), l = Ga(
          n
        ).hoistableScripts, a = l.get(e), a || (a = {
          type: "script",
          instance: null,
          count: 0,
          state: null
        }, l.set(e, a)), a) : { type: "void", instance: null, count: 0, state: null };
      default:
        throw Error(f(444, t));
    }
  }
  function En(t) {
    return 'href="' + xl(t) + '"';
  }
  function Su(t) {
    return 'link[rel="stylesheet"][' + t + "]";
  }
  function w0(t) {
    return Y({}, t, {
      "data-precedence": t.precedence,
      precedence: null
    });
  }
  function e1(t, l, e, a) {
    if (l = t.querySelector(
      'link[rel="preload"][as="style"][' + l + "]"
    )) {
      if (l[Zu] !== !0) {
        a.loading = 1;
        return;
      }
    } else
      l = t.createElement("link"), l[Zu] = !0, l.onload = l.onerror = es.bind(null, l), nl(l, "link", e), $t(l), t.head.appendChild(l);
    a.preload = l, l.addEventListener("load", function() {
      return a.loading |= 1;
    }), l.addEventListener("error", function() {
      return a.loading |= 2;
    });
  }
  function _n(t) {
    return '[src="' + xl(t) + '"]';
  }
  function Tu(t) {
    return "script[async]" + t;
  }
  function K0(t, l, e) {
    if (l.count++, l.instance === null)
      switch (l.type) {
        case "style":
          var a = t.querySelector(
            'style[data-href~="' + xl(e.href) + '"]'
          );
          if (a)
            return l.instance = a, $t(a), a;
          var n = Y({}, e, {
            "data-href": e.href,
            "data-precedence": e.precedence,
            href: null,
            precedence: null
          });
          return a = (t.ownerDocument || t).createElement(
            "style"
          ), $t(a), nl(a, "style", n), lc(a, e.precedence, t), l.instance = a;
        case "stylesheet":
          n = En(e.href);
          var u = t.querySelector(
            Su(n)
          );
          if (u)
            return l.state.loading |= 4, l.instance = u, $t(u), u;
          a = w0(e), (n = Ql.get(n)) && Wo(a, n), u = (t.ownerDocument || t).createElement("link"), $t(u);
          var c = u;
          return c._p = new Promise(function(r, d) {
            c.onload = r, c.onerror = d;
          }), nl(u, "link", a), l.state.loading |= 4, lc(u, e.precedence, t), l.instance = u;
        case "script":
          return u = _n(e.src), (n = t.querySelector(
            Tu(u)
          )) ? (l.instance = n, $t(n), n) : (a = e, (n = Ql.get(u)) && (a = Y({}, e), ko(a, n)), t = t.ownerDocument || t, n = t.createElement("script"), $t(n), nl(n, "link", a), t.head.appendChild(n), l.instance = n);
        case "void":
          return null;
        default:
          throw Error(f(443, l.type));
      }
    else
      l.type === "stylesheet" && (l.state.loading & 4) === 0 && (a = l.instance, l.state.loading |= 4, lc(a, e.precedence, t));
    return l.instance;
  }
  function lc(t, l, e) {
    for (var a = e.querySelectorAll(
      'link[rel="stylesheet"][data-precedence],style[data-precedence]'
    ), n = a.length ? a[a.length - 1] : null, u = n, c = 0; c < a.length; c++) {
      var r = a[c];
      if (r.dataset.precedence === l) u = r;
      else if (u !== n) break;
    }
    u ? u.parentNode.insertBefore(t, u.nextSibling) : (l = e.nodeType === 9 ? e.head : e, l.insertBefore(t, l.firstChild));
  }
  function Wo(t, l) {
    t.crossOrigin == null && (t.crossOrigin = l.crossOrigin), t.referrerPolicy == null && (t.referrerPolicy = l.referrerPolicy), t.title == null && (t.title = l.title);
  }
  function ko(t, l) {
    t.crossOrigin == null && (t.crossOrigin = l.crossOrigin), t.referrerPolicy == null && (t.referrerPolicy = l.referrerPolicy), t.integrity == null && (t.integrity = l.integrity);
  }
  var ec = null;
  function $0(t, l, e) {
    if (ec === null) {
      var a = /* @__PURE__ */ new Map(), n = ec = /* @__PURE__ */ new Map();
      n.set(e, a);
    } else
      n = ec, a = n.get(e), a || (a = /* @__PURE__ */ new Map(), n.set(e, a));
    if (a.has(t)) return a;
    for (a.set(t, null), e = e.getElementsByTagName(t), n = 0; n < e.length; n++) {
      var u = e[n];
      if (!(u[Bn] || u[Pt] || t === "link" && u.getAttribute("rel") === "stylesheet") && u.namespaceURI !== "http://www.w3.org/2000/svg") {
        var c = u.getAttribute(l) || "";
        c = t + c;
        var r = a.get(c);
        r ? r.push(u) : a.set(c, [u]);
      }
    }
    return a;
  }
  function Io(t, l, e) {
    t = t.ownerDocument || t, t.head.insertBefore(
      e,
      l === "title" ? t.querySelector("head > title") : null
    );
  }
  function a1(t, l, e) {
    if (e === 1 || l.itemProp != null) return !1;
    switch (t) {
      case "meta":
      case "title":
        return !0;
      case "style":
        if (typeof l.precedence != "string" || typeof l.href != "string" || l.href === "")
          break;
        return !0;
      case "link":
        if (typeof l.rel != "string" || typeof l.href != "string" || l.href === "" || l.onLoad || l.onError)
          break;
        return l.rel === "stylesheet" ? (t = l.disabled, typeof l.precedence == "string" && t == null) : !0;
      case "script":
        if (l.async && typeof l.async != "function" && typeof l.async != "symbol" && !l.onLoad && !l.onError && l.src && typeof l.src == "string")
          return !0;
    }
    return !1;
  }
  function J0(t, l) {
    return t === "img" && l.src != null && l.src !== "" && l.onLoad == null && l.loading !== "lazy";
  }
  function F0(t) {
    return !(t.type === "stylesheet" && (t.state.loading & 3) === 0);
  }
  function W0(t) {
    return (t.width || 100) * (t.height || 100) * (typeof devicePixelRatio == "number" ? devicePixelRatio : 1) * 0.25;
  }
  function k0(t, l) {
    typeof l.decode == "function" && (t.imgCount++, l.complete || (t.imgBytes += W0(l), t.suspenseyImages.push(l)), t = i1.bind(t), l.decode().then(t, t));
  }
  function n1(t, l, e, a) {
    if (e.type === "stylesheet" && (typeof a.media != "string" || matchMedia(a.media).matches !== !1) && (e.state.loading & 4) === 0) {
      if (e.instance === null) {
        var n = En(a.href), u = l.querySelector(
          Su(n)
        );
        if (u) {
          l = u._p, l !== null && typeof l == "object" && typeof l.then == "function" && (t.count++, t = Eu.bind(t), l.then(t, t)), e.state.loading |= 4, e.instance = u, $t(u);
          return;
        }
        u = l.ownerDocument || l, a = w0(a), (n = Ql.get(n)) && Wo(a, n), u = u.createElement("link"), $t(u);
        var c = u;
        c._p = new Promise(function(r, d) {
          c.onload = r, c.onerror = d;
        }), nl(u, "link", a), e.instance = u;
      }
      t.stylesheets === null && (t.stylesheets = /* @__PURE__ */ new Map()), t.stylesheets.set(e, l), (l = e.state.preload) && (e.state.loading & 3) === 0 && (t.count++, e = Eu.bind(t), l.addEventListener("load", e), l.addEventListener("error", e));
    }
  }
  var ac = 0;
  function u1(t, l) {
    return t.stylesheets && t.count === 0 && uc(t, t.stylesheets), 0 < t.count || 0 < t.imgCount ? function(e) {
      var a = setTimeout(function() {
        if (t.stylesheets && uc(t, t.stylesheets), t.unsuspend) {
          var u = t.unsuspend;
          t.unsuspend = null, u();
        }
      }, 6e4 + l);
      0 < t.imgBytes && ac === 0 && (ac = 62500 * _h());
      var n = setTimeout(
        function() {
          if (t.waitingForImages = !1, t.count === 0 && (t.stylesheets && uc(t, t.stylesheets), t.unsuspend)) {
            var u = t.unsuspend;
            t.unsuspend = null, u();
          }
        },
        (t.imgBytes > ac ? 50 : 800) + l
      );
      return t.unsuspend = e, function() {
        t.unsuspend = null, clearTimeout(a), clearTimeout(n);
      };
    } : null;
  }
  function I0(t) {
    if (t.count === 0 && (t.imgCount === 0 || !t.waitingForImages)) {
      if (t.stylesheets) uc(t, t.stylesheets);
      else if (t.unsuspend) {
        var l = t.unsuspend;
        t.unsuspend = null, l();
      }
    }
  }
  function Eu() {
    this.count--, I0(this);
  }
  function i1() {
    this.imgCount--, I0(this);
  }
  var nc = null;
  function uc(t, l) {
    t.stylesheets = null, t.unsuspend !== null && (t.count++, nc = /* @__PURE__ */ new Map(), l.forEach(c1, t), nc = null, Eu.call(t));
  }
  function c1(t, l) {
    if (!(l.state.loading & 4)) {
      var e = nc.get(t);
      if (e) var a = e.get(null);
      else {
        e = /* @__PURE__ */ new Map(), nc.set(t, e);
        for (var n = t.querySelectorAll(
          "link[data-precedence],style[data-precedence]"
        ), u = 0; u < n.length; u++) {
          var c = n[u];
          (c.nodeName === "LINK" || c.getAttribute("media") !== "not all") && (e.set(c.dataset.precedence, c), a = c);
        }
        a && e.set(null, a);
      }
      n = l.instance, c = n.getAttribute("data-precedence"), u = e.get(c) || a, u === a && e.set(null, n), e.set(c, n), this.count++, a = Eu.bind(this), n.addEventListener("load", a), n.addEventListener("error", a), u ? u.parentNode.insertBefore(n, u.nextSibling) : (t = t.nodeType === 9 ? t.head : t, t.insertBefore(n, t.firstChild)), l.state.loading |= 4;
    }
  }
  var zn = {
    $$typeof: Gt,
    Provider: null,
    Consumer: null,
    _currentValue: wl,
    _currentValue2: wl,
    _threadCount: 0
  };
  function f1(t, l, e, a, n, u, c, r, d) {
    this.tag = 1, this.containerInfo = t, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = Rc(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Rc(0), this.hiddenUpdates = Rc(null), this.identifierPrefix = a, this.onUncaughtError = n, this.onCaughtError = u, this.onRecoverableError = c, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = d, this.transitionTypes = null, this.incompleteTransitions = /* @__PURE__ */ new Map();
  }
  function P0(t, l, e, a, n, u, c, r, d, p, _, A) {
    return t = new f1(
      t,
      l,
      e,
      c,
      d,
      p,
      _,
      A,
      r
    ), l = 1, u === !0 && (l |= 24), u = dl(3, null, null, l), t.current = u, u.stateNode = t, l = df(), l.refCount++, t.pooledCache = l, l.refCount++, u.memoizedState = {
      element: a,
      isDehydrated: e,
      cache: l
    }, gf(u), t;
  }
  function ty(t) {
    return t ? (t = Fa, t) : Fa;
  }
  function ly(t, l, e, a, n, u) {
    n = ty(n), a.context === null ? a.context = n : a.pendingContext = n, a = Xe(l), a.payload = { element: e }, u = u === void 0 ? null : u, u !== null && (a.callback = u), e = Qe(t, a, l), e !== null && (gl(e, t, l), Pn(e, t, l));
  }
  function ey(t, l) {
    if (t = t.memoizedState, t !== null && t.dehydrated !== null) {
      var e = t.retryLane;
      t.retryLane = e !== 0 && e < l ? e : l;
    }
  }
  function Po(t, l) {
    ey(t, l), (t = t.alternate) && ey(t, l);
  }
  function ay(t) {
    if (t.tag === 13 || t.tag === 31) {
      var l = da(t, 67108864);
      l !== null && gl(l, t, 67108864), Po(t, 67108864);
    }
  }
  function ny(t) {
    if (t.tag === 13 || t.tag === 31) {
      var l = Cl();
      l = Dc(l);
      var e = da(t, l);
      e !== null && gl(e, t, l), Po(t, l);
    }
  }
  var On = !0;
  function o1(t, l, e, a) {
    var n = V.T;
    V.T = null;
    var u = k.p;
    try {
      k.p = 2, tr(t, l, e, a);
    } finally {
      k.p = u, V.T = n;
    }
  }
  function r1(t, l, e, a) {
    var n = V.T;
    V.T = null;
    var u = k.p;
    try {
      k.p = 8, tr(t, l, e, a);
    } finally {
      k.p = u, V.T = n;
    }
  }
  function tr(t, l, e, a) {
    if (On) {
      var n = lr(a);
      if (n === null)
        jo(
          t,
          l,
          a,
          ic,
          e
        ), iy(t, a);
      else if (d1(
        n,
        t,
        l,
        e,
        a
      ))
        a.stopPropagation();
      else if (iy(t, a), l & 4 && -1 < s1.indexOf(t)) {
        for (; n !== null; ) {
          var u = qa(n);
          if (u !== null)
            switch (u.tag) {
              case 3:
                if (u = u.stateNode, u.current.memoizedState.isDehydrated) {
                  var c = ca(u.pendingLanes);
                  if (c !== 0) {
                    var r = u;
                    for (r.pendingLanes |= 2, r.entangledLanes |= 2; c; ) {
                      var d = 1 << 31 - Tl(c);
                      r.entanglements[1] |= d, c &= ~d;
                    }
                    re(u), (bt & 6) === 0 && (wi = pl() + 500, vu(0));
                  }
                }
                break;
              case 31:
              case 13:
                r = da(u, 2), r !== null && gl(r, u, 2), Ji(), Po(u, 2);
            }
          if (u = lr(a), u === null && jo(
            t,
            l,
            a,
            ic,
            e
          ), u === n) break;
          n = u;
        }
        n !== null && a.stopPropagation();
      } else
        jo(
          t,
          l,
          a,
          null,
          e
        );
    }
  }
  function lr(t) {
    return t = qc(t), er(t);
  }
  var ic = null;
  function er(t) {
    if (ic = null, t = fa(t), t !== null) {
      var l = y(t);
      if (l === null) t = null;
      else {
        var e = l.tag;
        if (e === 13) {
          if (t = z(l), t !== null) return t;
          t = null;
        } else if (e === 31) {
          if (t = O(l), t !== null) return t;
          t = null;
        } else if (e === 3) {
          if (l.stateNode.current.memoizedState.isDehydrated)
            return l.tag === 3 ? l.stateNode.containerInfo : null;
          t = null;
        } else l !== t && (t = null);
      }
    }
    return ic = t, null;
  }
  function uy(t) {
    switch (t) {
      case "beforetoggle":
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "seeked":
      case "submit":
      case "toggle":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "fullscreenerror":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 2;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "resize":
      case "scroll":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 8;
      case "message":
        switch (_v()) {
          case Zr:
            return 2;
          case wr:
            return 8;
          case Gu:
          case zv:
            return 32;
          case Kr:
            return 268435456;
          default:
            return 32;
        }
      default:
        return 32;
    }
  }
  var ar = !1, ta = null, la = null, ea = null, _u = /* @__PURE__ */ new Map(), zu = /* @__PURE__ */ new Map(), aa = [], s1 = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
    " "
  );
  function iy(t, l) {
    switch (t) {
      case "focusin":
      case "focusout":
        ta = null;
        break;
      case "dragenter":
      case "dragleave":
        la = null;
        break;
      case "mouseover":
      case "mouseout":
        ea = null;
        break;
      case "pointerover":
      case "pointerout":
        _u.delete(l.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        zu.delete(l.pointerId);
    }
  }
  function Ou(t, l, e, a, n, u) {
    return t === null || t.nativeEvent !== u ? (t = {
      blockedOn: l,
      domEventName: e,
      eventSystemFlags: a,
      nativeEvent: u,
      targetContainers: [n]
    }, l !== null && (l = qa(l), l !== null && ay(l)), t) : (t.eventSystemFlags |= a, l = t.targetContainers, n !== null && l.indexOf(n) === -1 && l.push(n), t);
  }
  function d1(t, l, e, a, n) {
    switch (l) {
      case "focusin":
        return ta = Ou(
          ta,
          t,
          l,
          e,
          a,
          n
        ), !0;
      case "dragenter":
        return la = Ou(
          la,
          t,
          l,
          e,
          a,
          n
        ), !0;
      case "mouseover":
        return ea = Ou(
          ea,
          t,
          l,
          e,
          a,
          n
        ), !0;
      case "pointerover":
        var u = n.pointerId;
        return _u.set(
          u,
          Ou(
            _u.get(u) || null,
            t,
            l,
            e,
            a,
            n
          )
        ), !0;
      case "gotpointercapture":
        return u = n.pointerId, zu.set(
          u,
          Ou(
            zu.get(u) || null,
            t,
            l,
            e,
            a,
            n
          )
        ), !0;
    }
    return !1;
  }
  function cy(t) {
    var l = fa(t.target);
    if (l !== null) {
      var e = y(l);
      if (e !== null) {
        if (l = e.tag, l === 13) {
          if (l = z(e), l !== null) {
            t.blockedOn = l, Pr(t.priority, function() {
              ny(e);
            });
            return;
          }
        } else if (l === 31) {
          if (l = O(e), l !== null) {
            t.blockedOn = l, Pr(t.priority, function() {
              ny(e);
            });
            return;
          }
        } else if (l === 3 && e.stateNode.current.memoizedState.isDehydrated) {
          t.blockedOn = e.tag === 3 ? e.stateNode.containerInfo : null;
          return;
        }
      }
    }
    t.blockedOn = null;
  }
  function cc(t) {
    if (t.blockedOn !== null) return !1;
    for (var l = t.targetContainers; 0 < l.length; ) {
      var e = lr(t.nativeEvent);
      if (e === null) {
        e = t.nativeEvent;
        var a = new e.constructor(
          e.type,
          e
        );
        Yc = a, e.target.dispatchEvent(a), Yc = null;
      } else
        return l = qa(e), l !== null && ay(l), t.blockedOn = e, !1;
      l.shift();
    }
    return !0;
  }
  function fy(t, l, e) {
    cc(t) && e.delete(l);
  }
  function m1() {
    ar = !1, ta !== null && cc(ta) && (ta = null), la !== null && cc(la) && (la = null), ea !== null && cc(ea) && (ea = null), _u.forEach(fy), zu.forEach(fy);
  }
  function fc(t, l) {
    t.blockedOn === l && (t.blockedOn = null, ar || (ar = !0, i.unstable_scheduleCallback(
      i.unstable_NormalPriority,
      m1
    )));
  }
  var oc = null;
  function oy(t) {
    oc !== t && (oc = t, i.unstable_scheduleCallback(
      i.unstable_NormalPriority,
      function() {
        oc === t && (oc = null);
        for (var l = 0; l < t.length; l += 3) {
          var e = t[l], a = t[l + 1], n = t[l + 2];
          if (typeof a != "function") {
            if (er(a || e) === null)
              continue;
            break;
          }
          var u = qa(e);
          u !== null && (t.splice(l, 3), l -= 3, Yf(
            u,
            {
              pending: !0,
              data: n,
              method: e.method,
              action: a
            },
            a,
            n
          ));
        }
      }
    ));
  }
  function Nn(t) {
    function l(d) {
      return fc(d, t);
    }
    ta !== null && fc(ta, t), la !== null && fc(la, t), ea !== null && fc(ea, t), _u.forEach(l), zu.forEach(l);
    for (var e = 0; e < aa.length; e++) {
      var a = aa[e];
      a.blockedOn === t && (a.blockedOn = null);
    }
    for (; 0 < aa.length && (e = aa[0], e.blockedOn === null); )
      cy(e), e.blockedOn === null && aa.shift();
    if (e = (t.ownerDocument || t).$$reactFormReplay, e != null)
      for (a = 0; a < e.length; a += 3) {
        var n = e[a], u = e[a + 1], c = n[sl] || null;
        if (typeof u == "function")
          c || oy(e);
        else if (c) {
          var r = null;
          if (u && u.hasAttribute("formAction")) {
            if (n = u, c = u[sl] || null)
              r = c.formAction;
            else if (er(n) !== null) continue;
          } else r = c.action;
          typeof r == "function" ? e[a + 1] = r : (e.splice(a, 3), a -= 3), oy(e);
        }
      }
  }
  function ry() {
    function t(u) {
      u.canIntercept && u.info === "react-transition" && u.intercept({
        handler: function() {
          return new Promise(function(c) {
            return n = c;
          });
        },
        focusReset: "manual",
        scroll: "manual"
      });
    }
    function l() {
      n !== null && (n(), n = null), a || setTimeout(e, 20);
    }
    function e() {
      if (!a && !navigation.transition) {
        var u = navigation.currentEntry;
        u && u.url != null && navigation.navigate(u.url, {
          state: u.getState(),
          info: "react-transition",
          history: "replace"
        });
      }
    }
    if (typeof navigation == "object") {
      var a = !1, n = null;
      return navigation.addEventListener("navigate", t), navigation.addEventListener("navigatesuccess", l), navigation.addEventListener("navigateerror", l), setTimeout(e, 100), function() {
        a = !0, navigation.removeEventListener("navigate", t), navigation.removeEventListener("navigatesuccess", l), navigation.removeEventListener("navigateerror", l), n !== null && (n(), n = null);
      };
    }
  }
  function nr(t) {
    this._internalRoot = t;
  }
  rc.prototype.render = nr.prototype.render = function(t) {
    var l = this._internalRoot;
    if (l === null) throw Error(f(409));
    var e = l.current, a = Cl();
    ly(e, a, t, l, null, null);
  }, rc.prototype.unmount = nr.prototype.unmount = function() {
    var t = this._internalRoot;
    if (t !== null) {
      this._internalRoot = null;
      var l = t.containerInfo;
      ly(t.current, 2, null, t, null, null), Ji(), l[Ya] = null;
    }
  };
  function rc(t) {
    this._internalRoot = t;
  }
  rc.prototype.unstable_scheduleHydration = function(t) {
    if (t) {
      var l = Ir();
      t = { blockedOn: null, target: t, priority: l };
      for (var e = 0; e < aa.length && l !== 0 && l < aa[e].priority; e++) ;
      aa.splice(e, 0, t), e === 0 && cy(t);
    }
  };
  var sy = o.version;
  if (sy !== "19.3.0")
    throw Error(
      f(
        527,
        sy,
        "19.3.0"
      )
    );
  k.findDOMNode = function(t) {
    var l = t._reactInternals;
    if (l === void 0)
      throw typeof t.render == "function" ? Error(f(188)) : (t = Object.keys(t).join(","), Error(f(268, t)));
    return t = j(l), t = t !== null ? M(t) : null, t = t === null ? null : t.stateNode, t;
  };
  var y1 = {
    bundleType: 0,
    version: "19.3.0",
    rendererPackageName: "react-dom",
    currentDispatcherRef: V,
    reconcilerVersion: "19.3.0"
  };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var sc = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!sc.isDisabled && sc.supportsFiber)
      try {
        Hn = sc.inject(
          y1
        ), Sl = sc;
      } catch {
      }
  }
  return Mu.createRoot = function(t, l) {
    if (!m(t)) throw Error(f(299));
    var e = !1, a = "", n = tm, u = lm, c = em;
    return l != null && (l.unstable_strictMode === !0 && (e = !0), l.identifierPrefix !== void 0 && (a = l.identifierPrefix), l.onUncaughtError !== void 0 && (n = l.onUncaughtError), l.onCaughtError !== void 0 && (u = l.onCaughtError), l.onRecoverableError !== void 0 && (c = l.onRecoverableError)), l = P0(
      t,
      1,
      !1,
      null,
      null,
      e,
      a,
      null,
      n,
      u,
      c,
      ry
    ), t[Ya] = l.current, xo(t), new nr(l);
  }, Mu.hydrateRoot = function(t, l, e) {
    if (!m(t)) throw Error(f(299));
    var a = !1, n = "", u = tm, c = lm, r = em, d = null;
    return e != null && (e.unstable_strictMode === !0 && (a = !0), e.identifierPrefix !== void 0 && (n = e.identifierPrefix), e.onUncaughtError !== void 0 && (u = e.onUncaughtError), e.onCaughtError !== void 0 && (c = e.onCaughtError), e.onRecoverableError !== void 0 && (r = e.onRecoverableError), e.formState !== void 0 && (d = e.formState)), l = P0(
      t,
      1,
      !0,
      l,
      e ?? null,
      a,
      n,
      d,
      u,
      c,
      r,
      ry
    ), l.context = ty(null), e = l.current, a = Cl(), a = Dc(a), n = Xe(a), n.callback = null, Qe(e, n, a), e = a, l.current.lanes = e, jn(l, e), re(l), t[Ya] = l.current, xo(t), new rc(l);
  }, Mu.version = "19.3.0", Mu;
}
var xy;
function fp() {
  if (xy) return yr.exports;
  xy = 1;
  function i() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(i);
      } catch (o) {
        console.error(o);
      }
  }
  return i(), yr.exports = cp(), yr.exports;
}
var op = fp();
const rp = {
  primaryColor: "red",
  colors: {
    red: [
      "#fff0ef",
      "#ffe0dd",
      "#ffc1bb",
      "#ff9f94",
      "#ff7d70",
      "#f35b4c",
      "#dc2f23",
      "#c4261a",
      "#a81e15",
      "#86170f"
    ]
  },
  fontFamily: "Inter, ui-sans-serif, sans-serif"
};
let hc = null;
const yc = /* @__PURE__ */ new Map();
let sp = 0, vc = 0, _r = !1;
const bv = ct.createContext(0), zr = /* @__PURE__ */ new Set();
function dp({ children: i }) {
  const [o, s] = ct.useState(0);
  return ct.useEffect(() => {
    const f = () => {
      s((m) => m + 1);
      for (const m of zr) m();
    };
    return window.addEventListener("assemblash:localechange", f), () => window.removeEventListener("assemblash:localechange", f);
  }, []), /* @__PURE__ */ X.jsx(bv.Provider, { value: o, children: i });
}
function hp() {
  return ct.useContext(bv);
}
function bp(i) {
  return zr.add(i), () => zr.delete(i);
}
function pv() {
  if (!hc) throw new Error("The Mantine root has not started");
  const i = [...yc].map(
    ([o, s]) => hr.createPortal(s.content, s.container, o)
  );
  hr.flushSync(() => hc?.render(
    /* @__PURE__ */ X.jsx(
      $y,
      {
        theme: rp,
        defaultColorScheme: "auto",
        getRootElement: () => document.documentElement,
        children: /* @__PURE__ */ X.jsx(dp, { children: i })
      }
    )
  ));
}
function Or() {
  _r = !0, !(vc > 0) && (_r = !1, pv());
}
function pp(i) {
  vc++;
  try {
    i();
  } finally {
    vc--, vc === 0 && _r && Or();
  }
}
function Sp(i) {
  if (hc) throw new Error("The Mantine root already started");
  hc = op.createRoot(i), pv();
}
function Tp(i, o, s) {
  const f = ++sp;
  return yc.set(i, { container: o, content: s, revision: f }), Or(), () => {
    yc.get(i)?.revision === f && (yc.delete(i), Or());
  };
}
export {
  X1 as $,
  Bu as A,
  Zt as B,
  Cr as C,
  se as D,
  Zb as E,
  A1 as F,
  Gr as G,
  M1 as H,
  Eb as I,
  Ur as J,
  R1 as K,
  Mn as L,
  Qy as M,
  mp as N,
  O1 as O,
  Yr as P,
  Lb as Q,
  S1 as R,
  Xr as S,
  Vr as T,
  bc as U,
  W1 as V,
  zb as W,
  gp as X,
  Cn as Y,
  xu as Z,
  Xy as _,
  Ll as a,
  bp as a0,
  pp as a1,
  vp as b,
  yp as c,
  Ha as d,
  Ob as e,
  ua as f,
  br as g,
  Rl as h,
  hp as i,
  X as j,
  Yu as k,
  ju as l,
  Tp as m,
  Hu as n,
  U as o,
  _1 as p,
  Da as q,
  ct as r,
  Sp as s,
  qy as t,
  Dl as u,
  hr as v,
  F1 as w,
  Mr as x,
  xa as y,
  qr as z
};
