class DBHelper {
  static get DATABASE_URL() {
    return "http://localhost:1337/restaurants";
  }static fetchRestaurants(e) {
    fetch(DBHelper.DATABASE_URL).then(e => e.json()).then(t => e(null, t)).catch(t => {
      e(`Request failed with message ${t}`, null);
    });
  }static fetchRestaurantById(e, t) {
    DBHelper.fetchRestaurants((n, r) => {
      if (n) t(n, null);else {
        const n = r.find(t => t.id == e);n ? t(null, n) : t("Restaurant does not exist", null);
      }
    });
  }static fetchRestaurantByCuisine(e, t) {
    DBHelper.fetchRestaurants((n, r) => {
      if (n) t(n, null);else {
        const n = r.filter(t => t.cuisine_type == e);t(null, n);
      }
    });
  }static fetchRestaurantByNeighborhood(e, t) {
    DBHelper.fetchRestaurants((n, r) => {
      if (n) t(n, null);else {
        const n = r.filter(t => t.neighborhood == e);t(null, n);
      }
    });
  }static fetchRestaurantByCuisineAndNeighborhood(e, t, n) {
    DBHelper.fetchRestaurants((r, s) => {
      if (r) n(r, null);else {
        let r = s;"all" != e && (r = r.filter(t => t.cuisine_type == e)), "all" != t && (r = r.filter(e => e.neighborhood == t)), n(null, r);
      }
    });
  }static fetchNeighborhoods(e) {
    DBHelper.fetchRestaurants((t, n) => {
      if (t) e(t, null);else {
        const t = n.map((e, t) => n[t].neighborhood),
              r = t.filter((e, n) => t.indexOf(e) == n);e(null, r);
      }
    });
  }static fetchCuisines(e) {
    DBHelper.fetchRestaurants((t, n) => {
      if (t) e(t, null);else {
        const t = n.map((e, t) => n[t].cuisine_type),
              r = t.filter((e, n) => t.indexOf(e) == n);e(null, r);
      }
    });
  }static urlForRestaurant(e) {
    return `./restaurant.html?id=${e.id}`;
  }static imageUrlForRestaurant(e) {
    return `/img/${e.id}`;
  }static mapMarkerForRestaurant(e, t) {
    return new google.maps.Marker({ position: e.latlng, title: e.name, url: DBHelper.urlForRestaurant(e), map: t, animation: google.maps.Animation.DROP });
  }
}let restaurants, neighborhoods, cuisines;var map,
    markers = [];let installPromptEvent,
    mapToggled = !1;document.addEventListener("DOMContentLoaded", e => {
  fetchNeighborhoods(), fetchCuisines();
}), fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((e, t) => {
    e ? console.error(e) : (self.neighborhoods = t, fillNeighborhoodsHTML());
  });
}, fillNeighborhoodsHTML = (e = self.neighborhoods) => {
  const t = document.getElementById("neighborhoods-select");e.forEach(e => {
    const n = document.createElement("option");n.innerHTML = e, n.value = e, t.append(n);
  });
}, fetchCuisines = () => {
  DBHelper.fetchCuisines((e, t) => {
    e ? console.error(e) : (self.cuisines = t, fillCuisinesHTML());
  });
}, fillCuisinesHTML = (e = self.cuisines) => {
  const t = document.getElementById("cuisines-select");e.forEach(e => {
    const n = document.createElement("option");n.innerHTML = e, n.value = e, t.append(n);
  });
}, window.initMap = () => {
  if (mapToggled) return;self.map = new google.maps.Map(document.getElementById("map"), { zoom: 12, center: { lat: 40.722216, lng: -73.987501 }, scrollwheel: !1 }), google.maps.event.addListenerOnce(self.map, "idle", function () {
    addIframeTitle();
  }), mapToggled = !0, updateRestaurants();
}, window.insertStaticMap = () => {
  let e = document.createElement("img");const t = document.getElementById("map");let { width: n, height: r } = t.getBoundingClientRect();e.src = `https://maps.googleapis.com/maps/api/staticmap?center=40.722216,-73.987501&zoom=12&size=${n}x${r}`, e.alt = "New York Restaurant Reviews", e.height = r, e.width = n, t.appendChild(e), t.addEventListener("click", initMap), updateRestaurants();
}, updateRestaurants = () => {
  const e = document.getElementById("cuisines-select"),
        t = document.getElementById("neighborhoods-select"),
        n = e.selectedIndex,
        r = t.selectedIndex,
        s = e[n].value,
        a = t[r].value;DBHelper.fetchRestaurantByCuisineAndNeighborhood(s, a, (e, t) => {
    e ? console.error(e) : (resetRestaurants(t), fillRestaurantsHTML());
  });
}, resetRestaurants = e => {
  self.restaurants = [], document.getElementById("restaurants-list").innerHTML = "", self.markers.forEach(e => e.setMap(null)), self.markers = [], self.restaurants = e;
}, fillRestaurantsHTML = (e = self.restaurants) => {
  const t = document.getElementById("restaurants-list");e.forEach((n, r) => {
    t.append(createRestaurantHTML(n, r, e.length));
  }), mapToggled && addMarkersToMap();
}, createRestaurantHTML = (e, t, n) => {
  const r = document.createElement("li"),
        s = `\n\t\t<picture>\n\t\t\t<source srcset="/img/${e.id}-540_sml_2x.jpg 2x">\n\t\t\t<img src="/img/${e.id}-280_sml.jpg" alt="Image of ${e.name} restaurant">\n\t\t</picture>\n\t\t<h2>${e.name}</h2>\n\t\t<p>${e.neighborhood}</p>\n\t\t<p>${e.address}</p>\n\t\t<a href="./restaurant.html?id=${e.id}" aria-label="More information on ${e.name} restaurant" role="button">View Details</a>\n\t`;return r.innerHTML = s, r.setAttribute("aria-posinset", t + 1), r.setAttribute("aria-setsize", n), r;
}, mapMarkerForRestaurant = (e, t) => {
  return new google.maps.Marker({ position: e.latlng, title: e.name, url: DBHelper.urlForRestaurant(e), map: t, animation: google.maps.Animation.DROP });
}, addMarkersToMap = (e = self.restaurants) => {
  e.forEach(e => {
    const t = DBHelper.mapMarkerForRestaurant(e, self.map);google.maps.event.addListener(t, "click", () => {
      window.location.href = t.url;
    }), self.markers.push(t);
  });
}, addIframeTitle = () => {
  document.querySelector("iframe").title = "Google Maps";
}, initServiceWorker = () => {
  if (!navigator.serviceWorker) return;const e = function (e) {
    console.log("service worker update ready..."), e.postMessage({ action: "skipWaiting" });
  },
        t = function (t) {
    t.addEventListener("statechange", function () {
      "installed" == t.state && e(t);
    });
  };navigator.serviceWorker.register("sw.js").then(function (n) {
    if (console.log("Service worker registered"), !navigator.serviceWorker.controller) return;if (n.waiting) return void e(n.waiting);let r;n.installing && t(n.installing), n.addEventListener("updatefound", function () {
      t(n.installing);
    }), navigator.serviceWorker.addEventListener("controllerchange", function () {
      r || (window.location.reload(), r = !0);
    });
  }, function (e) {
    console.log("Service worker registration failed with message: " + e);
  });
}, initServiceWorker(), window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault(), installPromptEvent = e, document.querySelector("#install-button").disabled = !1;
});var _extends = Object.assign || function (e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t];for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
  }return e;
},
    _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (e) {
  return typeof e;
} : function (e) {
  return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
};!function (e, t) {
  "object" === ("undefined" == typeof exports ? "undefined" : _typeof(exports)) && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : e.LazyLoad = t();
}(this, function () {
  "use strict";
  var e = function (e, t) {
    return e.getAttribute("data-" + t);
  },
      t = function (t) {
    return t.filter(function (t) {
      return !e(t, "was-processed");
    });
  },
      n = function (e, t) {
    var n,
        r = new e(t);try {
      n = new CustomEvent("LazyLoad::Initialized", { detail: { instance: r } });
    } catch (e) {
      (n = document.createEvent("CustomEvent")).initCustomEvent("LazyLoad::Initialized", !1, !1, { instance: r });
    }window.dispatchEvent(n);
  },
      r = function (t, n) {
    var r = n.data_src,
        s = n.data_srcset,
        a = t.tagName,
        o = e(t, r);if ("IMG" === a) {
      !function (t, n) {
        var r = n.data_srcset,
            s = t.parentNode;if (s && "PICTURE" === s.tagName) for (var a, o = 0; a = s.children[o]; o += 1) if ("SOURCE" === a.tagName) {
          var i = e(a, r);i && a.setAttribute("srcset", i);
        }
      }(t, n);var i = e(t, s);return i && t.setAttribute("srcset", i), void (o && t.setAttribute("src", o));
    }"IFRAME" !== a ? o && (t.style.backgroundImage = 'url("' + o + '")') : o && t.setAttribute("src", o);
  },
      s = "undefined" != typeof window,
      a = s && "IntersectionObserver" in window,
      o = s && "classList" in document.createElement("p"),
      i = function (e, t) {
    o ? e.classList.add(t) : e.className += (e.className ? " " : "") + t;
  },
      l = function (e, t) {
    e && e(t);
  },
      c = function (e, t, n) {
    e.removeEventListener("load", t), e.removeEventListener("error", n);
  },
      u = function (e, t, n) {
    var r = e.target;!function (e, t) {
      o ? e.classList.remove(t) : e.className = e.className.replace(new RegExp("(^|\\s+)" + t + "(\\s+|$)"), " ").replace(/^\s+/, "").replace(/\s+$/, "");
    }(r, n.class_loading), i(r, t ? n.class_loaded : n.class_error), l(t ? n.callback_load : n.callback_error, r);
  },
      d = function (e, t) {
    l(t.callback_enter, e), ["IMG", "IFRAME"].indexOf(e.tagName) > -1 && (!function (e, t) {
      var n = function n(s) {
        u(s, !0, t), c(e, n, r);
      },
          r = function r(s) {
        u(s, !1, t), c(e, n, r);
      };e.addEventListener("load", n), e.addEventListener("error", r);
    }(e, t), i(e, t.class_loading)), r(e, t), function (e, t, n) {
      e.setAttribute("data-" + t, n);
    }(e, "was-processed", !0), l(t.callback_set, e);
  },
      f = function (e, t) {
    this._settings = function (e) {
      var t = { elements_selector: "img", container: document, threshold: 300, data_src: "src", data_srcset: "srcset", class_loading: "loading", class_loaded: "loaded", class_error: "error", callback_load: null, callback_error: null, callback_set: null, callback_enter: null };return _extends({}, t, e);
    }(e), this._setObserver(), this.update(t);
  };f.prototype = { _setObserver: function () {
      var e = this;if (a) {
        var n = this._settings,
            r = { root: n.container === document ? null : n.container, rootMargin: n.threshold + "px" };this._observer = new IntersectionObserver(function (n) {
          n.forEach(function (t) {
            if (function (e) {
              return e.isIntersecting || e.intersectionRatio > 0;
            }(t)) {
              var n = t.target;d(n, e._settings), e._observer.unobserve(n);
            }
          }), e._elements = t(e._elements);
        }, r);
      }
    }, update: function (e) {
      var n = this,
          r = this._settings,
          s = e || r.container.querySelectorAll(r.elements_selector);this._elements = t(Array.prototype.slice.call(s)), this._observer ? this._elements.forEach(function (e) {
        n._observer.observe(e);
      }) : (this._elements.forEach(function (e) {
        d(e, r);
      }), this._elements = t(this._elements));
    }, destroy: function () {
      var e = this;this._observer && (t(this._elements).forEach(function (t) {
        e._observer.unobserve(t);
      }), this._observer = null), this._elements = null, this._settings = null;
    } };var m = window.lazyLoadOptions;return s && m && function (e, t) {
    if (t.length) for (var r, s = 0; r = t[s]; s += 1) n(e, r);else n(e, t);
  }(f, m), f;
});