! function (t, e) {
  function n(t) {
    var e = {},
      n = {
        type: "contentType",
        name: "query",
        withParents: "withParent"
      };
    t.parentType && t.parentId && (e[t.parentType + "Id"] = t.parentId);
    for (var a in t) r(t, a) && t[a] && (e[r(n, a) ? n[a] : a] = t[a]);
    return e
  }

  function r(t, e) {
    return t.hasOwnProperty(e)
  }

  function a(t) {
    var n = e.console;
    n && n.error && n.error(t)
  }
  t.kladr = {},
    function () {
      var n = "https:" == e.location.protocol ? "https:" : "http:";
      t.kladr.url = n + "//kladr-api.ru/api.php"
    }(), t.kladr.type = {
      region: "region",
      district: "district",
      city: "city",
      street: "street",
      building: "building"
    }, t.kladr.typeCode = {
      city: 1,
      settlement: 2,
      village: 4
    }, t.kladr.validate = function (e) {
      var n = t.kladr.type;
      switch (e.type) {
        case n.region:
        case n.district:
        case n.city:
          if (e.parentType && !e.parentId) return a("parentId undefined"), !1;
          break;
        case n.street:
          if (e.parentType != n.city && e.parentType != n.street) return a('parentType must equal "city" or "street"'), !1;
          if (!e.parentId) return a("parentId undefined"), !1;
          break;
        case n.building:
          if (!e.zip) {
            if (!~t.inArray(e.parentType, [n.street, n.city])) return a('parentType must equal "street" or "city"'), !1;
            if (!e.parentId) return a("parentId undefined"), !1
          }
          break;
        default:
          if (!e.oneString) return a("type incorrect"), !1
      }
      return e.oneString && e.parentType && !e.parentId ? (a("parentId undefined"), !1) : e.typeCode && e.type != n.city ? (a('type must equal "city"'), !1) : e.limit < 1 ? (a("limit must greater than 0"), !1) : !0
    }, t.kladr.api = function (e, r) {
      if (!r) return void a("Callback undefined");
      if (!t.kladr.validate(e)) return void r([]);
      var i = setTimeout(function () {
        r([]), i = null
      }, 3e3);
      t.ajax({
        url: t.kladr.url + "?callback=?",
        type: "get",
        data: n(e),
        dataType: "jsonp"
      }).done(function (t) {
        i && (r(t.result || []), clearTimeout(i))
      })
    }, t.kladr.check = function (e, n) {
      return n ? (e.withParents = !1, e.limit = 1, void t.kladr.api(e, function (t) {
        n(t && t.length ? t[0] : !1)
      })) : void a("Callback undefined")
    }
}(jQuery, window),
function (t, e, n, r) {
  function a(r, a) {
    function i(t, e) {
      return t.isGet ? s.get(t.str[0]) : (s.set(t), void e())
    }
    var s = function () {
      var e = "kladr-data",
        n = r.data(e);
      return n || (n = t.extend({}, u, d), r.data(e, n)), {
        set: function (t) {
          if (t.obj)
            for (var a in t.obj) l(t.obj, a) && l(u, a) && (n[a] = t.obj[a]);
          else t.str && !t.isGet && l(u, t.str[0]) && (n[t.str[0]] = t.str[1]);
          r.data(e, n)
        },
        get: function (t) {
          return l(u, t) || l(d, t) ? n[t] : void 0
        },
        _set: function (t, a) {
          n[t] = a, r.data(e, n)
        },
        _get: function (t) {
          return l(n, t) ? n[t] : void 0
        }
      }
    }();
    return i(a, function () {
      function a(a) {
        var i = t(n.getElementById("kladr_autocomplete"));
        i.length || (i = t('<div id="kladr_autocomplete"></div>').appendTo(n.body));
        var l = x("guid");
        l ? (V = i.find(".autocomplete" + l), A = i.find(".spinner" + l), t(e).off(L), r.off(L), V.off(L)) : (l = o(), P("guid", l), r.attr("autocomplete", "off"), V = t('<ul class="autocomplete' + l + ' autocomplete" style="display: none;"></ul>').appendTo(i), A = t('<div class="spinner' + l + ' spinner" style="display: none;"></div>').appendTo(i), m(), f(), b()), a()
      }

      function i(e, n) {
        var r, a, i, o;
        if (e.length === 1 && e[0].id === "Free") {
          e[0].name = "Совпадений не найдено";
        } else {
          var index = e.findIndex(el => el.id === "Free");
          e.splice(index, 1);
        }
        V.empty();
        for (var l = 0; l < e.length; l++) r = e[l], a = x("valueFormat")(r, n), i = x("labelFormat")(r, n), o = t('<a data-val="' + a + '">' + i + "</a>"), o.data("kladr-object", r), t("<li></li>").append(o).appendTo(V)
      }

      function d() {
        var e, n, r;
        V.empty(), e = "", n = u.noResultText, null != n && "" != n && (r = t('<a data-val="' + e + '">' + n + "</a>"), r.data("kladr-object", {}), t("<li></li>").append(r).appendTo(V))
      }

      function f() {
        var t = r.offset(),
          e = r.outerWidth(),
          n = r.outerHeight();
        if (t && (f.top != t.top || f.left != t.left || f.width != e || f.height != n)) {
          f.top = t.top, f.left = t.left, f.width = e, f.height = n, V.css({
            top: t.top + n + "px",
            left: t.left
          });
          var a = V.outerWidth() - V.width();
          V.width(e - a);
          var i = A.width(),
            o = A.height();
          A.css({
            top: t.top + (n - o) / 2 - 1,
            left: t.left + e - i - 2
          })
        }
      }

      function p(e) {
        if (!(e.which > 8 && e.which < 46)) {
          if (r.data(z, !1), !w("open_before")) return void v();
          _(null);
          var n = r.val();
          if (!t.trim(n)) return B(!1), void v();
          var a = C(n);
          if (!w("send_before", a)) return void v();
          T(), w("send"), x("source")(a, function (e) {
            return w("receive", e), r.is(":focus") ? t.trim(r.val()) && e.length ? (G = !0, i(e, a), f(), I(), V.slideDown(50), void w("open")) : (I(), _(null), d(), f(), V.slideDown(50), w("open"), void(G = !1)) : (I(), void v())
          })
        }
      }

      function v() {
        w("close_before") && (V.empty().hide(), w("close"))
      }

      function y(t) {
        var e = V.find("li.active");
        switch (t.which) {
          case c.up:
            e.length ? (e.removeClass("active"), e.prev().length && (e = e.prev())) : e = V.find("li").last(),
              function () {
                var t = V.scrollTop(),
                  n = V.offset(),
                  r = e.outerHeight(),
                  a = e.offset();
                a.top - n.top < 0 && V.scrollTop(t - r)
              }(), e.addClass("active"), k();
            break;
          case c.down:
            e.length ? (e.removeClass("active"), e.next().length && (e = e.next())) : e = V.find("li").first(), e.length && ! function () {
              var t = V.scrollTop(),
                n = V.height(),
                r = V.offset(),
                a = e.outerHeight(),
                i = e.offset();
              i.top - r.top + a > n && V.scrollTop(t + a)
            }(), e.addClass("active"), k();
            break;
          case c.enter:
            v()
        }
      }

      function h(e) {
        var n = t(e);
        n.is("a") && (n = n.parents("li")), n.addClass("active"), k(), v()
      }

      function k() {
        if (w("select_before")) {
          var t = V.find(".active a");
          t.length && (r.val(t.attr("data-val")).data(z, !0), B(!1), _(t.data("kladr-object")), w("select", x("current")))
        }
      }

      function g() {
        function e(t, e) {
          B(e), _(t)
        }
        if (x("verify") && w("check_before")) {
          var n = t.trim(r.val());
          if (!n) return void e(null, !1);
          if (x("current")) return void B(!1);
          var a = C(n);
          if (a.withParents = !1, a.limit = 10, !w("send_before", a)) return e(null, !1), void w("check", null);
          T(), w("send"), x("source")(a, function (n) {
            function i(t, n) {
              I(), e(t, n)
            }
            if (w("receive"), !t.trim(r.val())) return void i(null, !1);
            for (var o = a.name.toLowerCase(), l = null, u = null, d = 0; d < n.length; d++)
              if (l = n[d].name.toLowerCase(), o == l) {
                u = n[d];
                break
              } u && r.val(x("valueFormat")(u, a)), i(u, !u), w("check", u)
          })
        }
      }

      function m() {
        function e() {
          r.attr(i, !0)
        }

        function n(t, e) {
          t ? r.val(x("valueFormat")(t, e)) : B(!0), _(t), r.removeAttr(i)
        }
        var a = {
            setValue: function (e) {
              return "object" === t.type(e) ? a.setValueByObject(e) : "number" === t.type(e) ? a.setValueById(e) : "string" === t.type(e) ? a.setValueByName(e) : e ? a : a.clear()
            },
            setValueByName: function (r) {
              if (r = t.trim(r + "")) {
                var i = C("");
                if (i.name = S(r), i.withParents = !1, i.limit = 10, !w("send_before", i)) return n(null, i), a;
                e(), w("send"), x("source")(i, function (t) {
                  w("receive");
                  for (var e = i.name.toLowerCase(), r = null, a = null, o = 0; o < t.length; o++)
                    if (r = t[o].name.toLowerCase(), e == r) {
                      a = t[o];
                      break
                    } n(a, i)
                })
              }
              return a
            },
            setValueById: function (r) {
              var i = C("");
              return i.parentType = i.type, i.parentId = r, i.limit = 1, e(), t.kladr.api(i, function (t) {
                t.length ? n(t[0], i) : n(null, i)
              }), a
            },
            setValueByObject: function (t) {
              return n(t, C("")), a
            },
            clear: function () {
              return n(null, null), a
            }
          },
          i = "data-kladr-autofill-lock";
        P("controller", a)
      }

      function b() {
        function e() {
          var e = r.val();
          if (e) {
            var n, a = C(e),
              i = a.type,
              o = a.parentType,
              l = t.kladr.type,
              u = !0,
              d = x("controller").setValueByName;
            return i == l.street && o != l.city && (u = !1), i != l.building || ~t.inArray(o, [l.street, l.city]) || (u = !1), n = r.attr("data-kladr-autofill-lock"), n && x("current") && u && d(e), !!x("current")
          }
          return !1
        }
        var n = 0;
        ! function a() {
          ++n > 5 || e() || setTimeout(a, 100)
        }()
      }

      function w(e, n) {
        if (!e) return !0;
        var a = e.replace(/_([a-z])/gi, function (t, e) {
          return e.toUpperCase()
        });
        return r.trigger("kladr_" + e, n), "function" === t.type(x(a)) ? x(a).call(r.get(0), n) !== !1 : !0
      }

      function T() {
        x("spinner") && x("showSpinner")(A)
      }

      function I() {
        x("spinner") && x("hideSpinner")(A)
      }

      function C(t) {
        var e, n = {},
          r = ["token", "key", "type", "typeCode", "parentType", "parentId", "oneString", "withParents", "limit", "strict"];
        for (e = 0; e < r.length; e++) n[r[e]] = x(r[e]);
        n.name = S(t);
        var a, i = x("parentInput");
        return i && (a = j(i, n.type), a && (n.parentType = a.type, n.parentId = a.id)), n.oneString && (n.withParents = !0), n
      }

      function j(e, n) {
        var r, a = t.kladr.getInputs(e),
          i = t.kladr.type,
          o = {},
          u = null;
        a.each(function () {
          var e, n = t(this);
          (e = n.attr("data-kladr-id")) && (o[n.attr("data-kladr-type")] = e)
        });
        for (r in i) {
          if (r == n) return u;
          l(i, r) && o[r] && (u = {
            type: r,
            id: o[r]
          })
        }
        return u
      }

      function S(t) {
        for (var e = "abcdefghijklmnopqrstuvwxyz", n = t.toLowerCase(), r = 0; r < n.length; r++)
          if (~e.indexOf(n[r])) return B(!0), t;
        return B(!1), t
      }

      function _(t) {
        var e = x("current");
        (e && e.id) !== (t && t.id) && (P("current", t), t && t.id ? r.attr("data-kladr-id", t.id) : r.removeAttr("data-kladr-id"), x("oneString") && t && t.contentType && r.attr("data-kladr-type", t.contentType), w("change", t))
      }

      function B(t) {
        t ? r.addClass("kladr-error") : r.removeClass("kladr-error")
      }

      function x(t) {
        return s._get(t)
      }

      function P(t, e) {
        s._set(t, e)
      }
      var V = null,
        A = null,
        G = !1,
        L = ".kladr",
        z = "kladrInputChange";
      a(function () {
        var n = !1,
          a = !0,
          i = "";
        r.attr("data-kladr-type", x("type") || "").attr("data-kladr-one-string", x("oneString") || null).on("keyup" + L, p).on("keydown" + L, y).on("blur" + L, function () {
          !n && r.data(z) && i != r.val() && r.change()
        }).on("blur" + L + " change" + L, function (t) {
          return n ? void 0 : ("change" == t.type && (i = r.val()), a && (a = !1, g()), !G && u.checkEmptyRespone && r.val(""), v(), !1)
        }).on("focus" + L, function () {
          a = !0
        }), V.on("touchstart" + L + " mousedown" + L, "li, a", function (t) {
          t.preventDefault(), n = !0, h(this), n = !1
        }), t(e).on("resize" + L, f)
      })
    })
  }

  function i(e, n) {
    var a = {
      obj: !1,
      str: !1,
      isGet: !1
    };
    return "object" === t.type(e) ? (a.obj = e, a) : ("string" === t.type(e) && (a.str = [e, n], a.isGet = n === r), a)
  }

  function o() {
    return o.guid ? ++o.guid : o.guid = 1
  }

  function l(t, e) {
    return t.hasOwnProperty(e)
  }
  var u = {
      token: null,
      key: null,
      type: null,
      typeCode: null,
      parentType: null,
      parentId: null,
      limit: 10,
      oneString: !1,
      withParents: !1,
      noResultText: null,
      checkEmptyRespone: !1,
      strict: null,
      parentInput: null,
      verify: !1,
      spinner: !0,
      open: null,
      close: null,
      send: null,
      receive: null,
      select: null,
      check: null,
      change: null,
      openBefore: null,
      closeBefore: null,
      sendBefore: null,
      selectBefore: null,
      checkBefore: null,
      source: function (e, n) {
        t.kladr.api(e, n)
      },
      labelFormat: function (e, n) {
        var r;
        if (n.oneString) return e.parents ? (r = [].concat(e.parents), r.push(e), t.kladr.buildAddress(r)) : (e.typeShort ? e.typeShort + ". " : "") + e.name;
        var a, i, o, l, u = "";
        return e.typeShort && (u += e.typeShort + ". "), a = e.name, i = a.toLowerCase(), o = n.name.toLowerCase(), l = i.indexOf(o), l = ~l ? l : 0, o.length < i.length ? (u += a.substr(0, l), u += "<strong>", u += a.substr(l, o.length), u += "</strong>", u += a.substr(l + o.length)) : u += "<strong>" + a + "</strong>", u
      },
      valueFormat: function (e, n) {
        var r;
        return n.oneString ? e.parents ? (r = [].concat(e.parents), r.push(e), t.kladr.buildAddress(r)) : (e.typeShort ? e.typeShort + ". " : "") + e.name : e.name
      },
      showSpinner: function (t) {
        var e = -.2,
          n = setInterval(function () {
            return t.is(":visible") ? (t.css("background-position", "0% " + e + "%"), e += 5.555556, void(e > 95 && (e = -.2))) : (clearInterval(n), void(n = null))
          }, 30);
        t.show()
      },
      hideSpinner: function (t) {
        t.hide()
      }
    },
    d = {
      current: null,
      controller: null
    },
    c = {
      up: 38,
      down: 40,
      enter: 13
    };
  t.kladr = t.extend(t.kladr, {
    setDefault: function (t, e) {
      var n = i(t, e);
      if (n.obj)
        for (var r in n.obj) l(u, r) && (u[r] = n.obj[r]);
      else n.str && !n.isGet && l(u, n.str[0]) && (u[n.str[0]] = n.str[1])
    },
    getDefault: function (t) {
      return l(u, t) ? u[t] : void 0
    },
    getInputs: function (e) {
      var r = t(e || n.body),
        a = "[data-kladr-type]";
      return r.filter(a).add(r.find(a))
    },
    setValues: function (e, n) {
      var r, a, i = "kladr_change.setvalues",
        o = t.kladr.type,
        u = {},
        d = [];
      if (~t.inArray(t.type(e), ["object", "array"])) {
        t.each(e, function (t, e) {
          if (e) {
            var n = e.contentType || e.type || t;
            l(o, n) && (u[n] = e)
          }
        });
        for (a in o) l(o, a) && u[a] && (d[a] = u[a]);
        r = t.kladr.getInputs(n),
          function c() {
            var t, e, n;
            for (e in d)
              if (l(d, e)) {
                n = d[e], delete d[e];
                break
              } if (e) return t = r.filter('[data-kladr-type="' + e + '"]'), t.length ? void t.on(i, function () {
              t.off(i), c()
            }).kladr("controller").setValue(n) : void c()
          }()
      }
    },
    getAddress: function (e, n) {
      var r, a = t.kladr.getInputs(e),
        i = t.kladr.type,
        o = {},
        u = {};
      a.each(function () {
        var e, n, r, a = t(this);
        if (a.attr("data-kladr-id"))
          if (e = a.kladr("current"), a.attr("data-kladr-one-string") && e.parents)
            for (n = [].concat(e.parents), n.push(e), r = 0; r < n.length; r++) o[n[r].contentType] = n[r];
          else o[a.attr("data-kladr-type")] = e;
        else o[a.attr("data-kladr-type")] = a.val()
      });
      for (r in i) l(i, r) && o[r] && (u[r] = o[r]);
      return (n || t.kladr.buildAddress)(u)
    },
    buildAddress: function (e) {
      var n = [],
        r = "",
        a = "";
      return t.each(e, function (e, i) {
        var o, l = "",
          u = "";
        if ("object" === t.type(i)) {
          for (o = 0; o < n.length; o++)
            if (n[o] == i.id) return;
          n.push(i.id), l = i.name, u = i.typeShort + ". ", a = i.zip || a
        } else l = i;
        r && (r += ", "), r += u + l
      }), r = (a ? a + ", " : "") + r
    }
  }), t.fn.kladr = function (e, n) {
    var r = i(e, n),
      o = null;
    return this.each(function () {
      var e = a(t(this), r);
      return r.isGet ? (o = e, !1) : void 0
    }), r.isGet ? o : this
  }
}(jQuery, window, document),
function (t) {
  t.fn.kladrZip = function (e) {
    return this.keydown(function (e) {
      var n = e.charCode || e.keyCode || 0,
        r = 8 == n || 9 == n || 13 == n || 46 == n || 110 == n || 190 == n || n >= 35 && 40 >= n || n >= 96 && 105 >= n;
      return t(this).val().length >= 6 ? r : r || n >= 48 && 57 >= n
    }), this.keyup(function () {
      function n(t) {
        t ? r.addClass("kladr-error") : r.removeClass("kladr-error")
      }
      var r = t(this),
        a = r.val();
      return a ? void t.kladr.api({
        type: t.kladr.type.building,
        zip: a,
        withParents: !0,
        limit: 1
      }, function (r) {
        var a = r.length && r[0];
        r = [], a ? (n(!1), a.parents && (r = r.concat(a.parents)), r.push(a), t.kladr.setValues(r, e)) : n(!0)
      }) : void n(!1)
    }), this
  }
}(jQuery);