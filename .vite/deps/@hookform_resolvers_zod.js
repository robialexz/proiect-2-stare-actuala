import {
  appendErrors,
  get
} from "./chunk-M3F4TZDX.js";
import "./chunk-UVNPGZG7.js";
import "./chunk-OL46QLBJ.js";

// node_modules/@hookform/resolvers/dist/resolvers.mjs
var t = function(t3, n3, e2) {
  if (t3 && "reportValidity" in t3) {
    var i2 = get(e2, n3);
    t3.setCustomValidity(i2 && i2.message || ""), t3.reportValidity();
  }
};
var n = function(r, n3) {
  var e2 = function(e3) {
    var i3 = n3.fields[e3];
    i3 && i3.ref && "reportValidity" in i3.ref ? t(i3.ref, e3, r) : i3.refs && i3.refs.forEach(function(n4) {
      return t(n4, e3, r);
    });
  };
  for (var i2 in n3.fields) e2(i2);
};
var e = function(r) {
  return r instanceof Date;
};
var i = function(r) {
  return null == r;
};
var a = function(r) {
  return "object" == typeof r;
};
var o = function(r) {
  return !i(r) && !Array.isArray(r) && a(r) && !e(r);
};
var f = function(r) {
  return /^\w*$/.test(r);
};
var s = function(r, t3, n3) {
  for (var e2 = -1, i2 = f(t3) ? [t3] : function(r2) {
    return t4 = r2.replace(/["|']|\]/g, "").split(/\.|\[/), Array.isArray(t4) ? t4.filter(Boolean) : [];
    var t4;
  }(t3), a2 = i2.length, s2 = a2 - 1; ++e2 < a2; ) {
    var u2 = i2[e2], c2 = n3;
    if (e2 !== s2) {
      var l = r[u2];
      c2 = o(l) || Array.isArray(l) ? l : isNaN(+i2[e2 + 1]) ? {} : [];
    }
    r[u2] = c2, r = r[u2];
  }
  return r;
};
var u = function(t3, e2) {
  e2.shouldUseNativeValidation && n(t3, e2);
  var i2 = {};
  for (var a2 in t3) {
    var o2 = get(e2.fields, a2), f2 = Object.assign(t3[a2] || {}, { ref: o2 && o2.ref });
    if (c(e2.names || Object.keys(t3), a2)) {
      var u2 = Object.assign({}, get(i2, a2));
      s(u2, "root", f2), s(i2, a2, u2);
    } else s(i2, a2, f2);
  }
  return i2;
};
var c = function(r, t3) {
  return r.some(function(r2) {
    return r2.startsWith(t3 + ".");
  });
};

// node_modules/@hookform/resolvers/zod/dist/zod.mjs
var n2 = function(e2, o2) {
  for (var n3 = {}; e2.length; ) {
    var t3 = e2[0], s2 = t3.code, i2 = t3.message, a2 = t3.path.join(".");
    if (!n3[a2]) if ("unionErrors" in t3) {
      var u2 = t3.unionErrors[0].errors[0];
      n3[a2] = { message: u2.message, type: u2.code };
    } else n3[a2] = { message: i2, type: s2 };
    if ("unionErrors" in t3 && t3.unionErrors.forEach(function(r) {
      return r.errors.forEach(function(r2) {
        return e2.push(r2);
      });
    }), o2) {
      var c2 = n3[a2].types, f2 = c2 && c2[t3.code];
      n3[a2] = appendErrors(a2, o2, n3, s2, f2 ? [].concat(f2, t3.message) : t3.message);
    }
    e2.shift();
  }
  return n3;
};
var t2 = function(r, t3, s2) {
  return void 0 === s2 && (s2 = {}), function(i2, a2, u2) {
    try {
      return Promise.resolve(function(o2, n3) {
        try {
          var a3 = Promise.resolve(r["sync" === s2.mode ? "parse" : "parseAsync"](i2, t3)).then(function(r2) {
            return u2.shouldUseNativeValidation && n({}, u2), { errors: {}, values: s2.raw ? i2 : r2 };
          });
        } catch (r2) {
          return n3(r2);
        }
        return a3 && a3.then ? a3.then(void 0, n3) : a3;
      }(0, function(r2) {
        if (function(r3) {
          return null != r3.errors;
        }(r2)) return { values: {}, errors: u(n2(r2.errors, !u2.shouldUseNativeValidation && "all" === u2.criteriaMode), u2) };
        throw r2;
      }));
    } catch (r2) {
      return Promise.reject(r2);
    }
  };
};
export {
  t2 as zodResolver
};
//# sourceMappingURL=@hookform_resolvers_zod.js.map
