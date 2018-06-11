class DBHelper {
  static get DATABASE_URL() {
    return "http://localhost:1337/restaurants";
  }static fetchRestaurants(e) {
    fetch(DBHelper.DATABASE_URL).then(e => e.json()).then(t => e(null, t)).catch(t => {
      e(`Request failed with message ${t}`, null);
    });
  }static fetchRestaurantById(e, t) {
    DBHelper.fetchRestaurants((n, a) => {
      if (n) t(n, null);else {
        const n = a.find(t => t.id == e);n ? t(null, n) : t("Restaurant does not exist", null);
      }
    });
  }static fetchRestaurantByCuisine(e, t) {
    DBHelper.fetchRestaurants((n, a) => {
      if (n) t(n, null);else {
        const n = a.filter(t => t.cuisine_type == e);t(null, n);
      }
    });
  }static fetchRestaurantByNeighborhood(e, t) {
    DBHelper.fetchRestaurants((n, a) => {
      if (n) t(n, null);else {
        const n = a.filter(t => t.neighborhood == e);t(null, n);
      }
    });
  }static fetchRestaurantByCuisineAndNeighborhood(e, t, n) {
    DBHelper.fetchRestaurants((a, r) => {
      if (a) n(a, null);else {
        let a = r;"all" != e && (a = a.filter(t => t.cuisine_type == e)), "all" != t && (a = a.filter(e => e.neighborhood == t)), n(null, a);
      }
    });
  }static fetchNeighborhoods(e) {
    DBHelper.fetchRestaurants((t, n) => {
      if (t) e(t, null);else {
        const t = n.map((e, t) => n[t].neighborhood),
              a = t.filter((e, n) => t.indexOf(e) == n);e(null, a);
      }
    });
  }static fetchCuisines(e) {
    DBHelper.fetchRestaurants((t, n) => {
      if (t) e(t, null);else {
        const t = n.map((e, t) => n[t].cuisine_type),
              a = t.filter((e, n) => t.indexOf(e) == n);e(null, a);
      }
    });
  }static urlForRestaurant(e) {
    return `./restaurant.html?id=${e.id}`;
  }static imageUrlForRestaurant(e) {
    return `/img/${e.id}`;
  }static mapMarkerForRestaurant(e, t) {
    return new google.maps.Marker({ position: e.latlng, title: e.name, url: DBHelper.urlForRestaurant(e), map: t, animation: google.maps.Animation.DROP });
  }
}let restaurant;var map;let clickedMap = !1;window.initMap = () => {
  clickedMap || fetchRestaurantFromURL((e, t) => {
    e ? console.error(e) : (self.map = new google.maps.Map(document.getElementById("map"), { zoom: 16, center: t.latlng, scrollwheel: !1 }), DBHelper.mapMarkerForRestaurant(self.restaurant, self.map), clickedMap = !0);
  });
}, window.initStaticMap = () => {
  fetchRestaurantFromURL((e, t) => {
    if (e) console.error(e);else {
      let e = document.createElement("img");const n = document.getElementById("map");let { width: a, height: r } = n.getBoundingClientRect(),
          { lat: l, lng: s } = t.latlng;e.src = `https://maps.googleapis.com/maps/api/staticmap?center=${l},${s}&zoom=16&size=${parseInt(a)}x${parseInt(r)}`, e.alt = `${t.name} Restaurant Reviews`, e.height = r, e.width = a, n.appendChild(e), n.addEventListener("click", initMap), fillBreadcrumb();
    }
  });
}, fetchRestaurantFromURL = e => {
  if (self.restaurant) return void e(null, self.restaurant);const t = getParameterByName("id");t ? DBHelper.fetchRestaurantById(t, (t, n) => {
    self.restaurant = n, n ? (fillRestaurantHTML(), e(null, n)) : console.error(t);
  }) : (error = "No restaurant id in URL", e(error, null));
}, fillRestaurantHTML = (e = self.restaurant) => {
  document.getElementById("restaurant-name").innerHTML = e.name, document.getElementById("restaurant-address").innerHTML = e.address;const t = document.getElementById("restaurant-img");t.className = "restaurant-img", t.src = `${DBHelper.imageUrlForRestaurant(e)}.jpg`, t.alt = `Image of ${e.name} restaurant`, document.getElementById("restaurant-cuisine").innerHTML = e.cuisine_type, e.operating_hours && fillRestaurantHoursHTML(), fillReviewsHTML();
}, fillRestaurantHoursHTML = (e = self.restaurant.operating_hours) => {
  const t = document.getElementById("restaurant-hours");for (let n in e) {
    const a = document.createElement("tr"),
          r = document.createElement("td");r.innerHTML = n, a.appendChild(r);const l = document.createElement("td");l.innerHTML = e[n], a.appendChild(l), t.appendChild(a);
  }
}, fillReviewsHTML = (e = self.restaurant.reviews) => {
  const t = document.getElementById("reviews-container"),
        n = document.createElement("h3");if (n.innerHTML = "Reviews", t.appendChild(n), !e) {
    const e = document.createElement("p");return e.innerHTML = "No reviews yet!", void t.appendChild(e);
  }const a = document.getElementById("reviews-list");e.forEach(e => {
    a.appendChild(createReviewHTML(e));
  }), t.appendChild(a);
}, createReviewHTML = e => {
  const t = document.createElement("li"),
        n = document.createElement("span");n.classList.add("review-header");const a = document.createElement("p");a.innerHTML = e.name, n.appendChild(a);const r = document.createElement("p");r.innerHTML = e.date, r.classList.add("review-date"), n.appendChild(r), t.appendChild(n);const l = document.createElement("p");l.innerHTML = `Rating: ${e.rating}`, l.classList.add("review-rating"), t.appendChild(l);const s = document.createElement("p");return s.innerHTML = e.comments, t.appendChild(s), t;
}, fillBreadcrumb = (e = self.restaurant) => {
  const t = document.getElementById("breadcrumb"),
        n = document.createElement("li");n.innerHTML = e.name, n.setAttribute("aria-current", "page"), t.appendChild(n);
}, getParameterByName = (e, t) => {
  t || (t = window.location.href), e = e.replace(/[\[\]]/g, "\\$&");const n = new RegExp(`[?&]${e}(=([^&#]*)|&|#|$)`).exec(t);return n ? n[2] ? decodeURIComponent(n[2].replace(/\+/g, " ")) : "" : null;
};