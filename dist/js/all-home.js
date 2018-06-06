/* eslint-disable */
/**
 * Common database helper functions.
 */
class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  // static get DATABASE_URL() {
  //   const port = 8000; // Change this to your server port
  //   return `http://localhost:${port}/data/restaurants.json`;
  // }

  static get DATABASE_URL() {
    const port = 1337; // stage 2 API server
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  // static fetchRestaurants(callback) {
  //   let xhr = new XMLHttpRequest();
  //   xhr.open("GET", DBHelper.DATABASE_URL);
  //   xhr.onload = () => {
  //     if (xhr.status === 200) {
  //       // Got a success response from server!
  //       const json = JSON.parse(xhr.responseText);
  //       const restaurants = json.restaurants;
  //       callback(null, restaurants);
  //     } else {
  //       // Oops!. Got an error from server.
  //       const error = `Request failed. Returned status of ${xhr.status}`;
  //       callback(error, null);
  //     }
  //   };
  //   xhr.send();
  // }
  static fetchRestaurants(callback) {
    fetch(DBHelper.DATABASE_URL).then(response => response.json()).then(data => callback(null, data)).catch(e => {
      const error = `Request failed with message ${e}`;
      callback(error, null);
    });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) {
          // Got the restaurant
          callback(null, restaurant);
        } else {
          // Restaurant does not exist in the database
          callback("Restaurant does not exist", null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != "all") {
          // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != "all") {
          // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return `/img/${restaurant.id}`;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    });
    return marker;
  }
}

/* eslint-disable */
let restaurants, neighborhoods, cuisines;
var map;
var markers = [];
let mapToggled = false;

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', event => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) {
      // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
};

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  if (mapToggled) return;

  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  google.maps.event.addListenerOnce(self.map, 'idle', function () {
    addIframeTitle();
  });

  mapToggled = true;
  updateRestaurants();
};

window.insertStaticMap = () => {
  let mapImg = document.createElement('img');
  const mapDiv = document.getElementById('map');

  let { width, height } = mapDiv.getBoundingClientRect();

  mapImg.src = `https://maps.googleapis.com/maps/api/staticmap?center=40.722216,-73.987501&zoom=12&size=${width}x${height}`;
  mapImg.alt = 'New York Restaurant Reviews';
  mapImg.height = height;
  mapImg.width = width;
  mapDiv.appendChild(mapImg);

  // create dynamic map on map image click
  mapDiv.addEventListener('click', initMap);

  updateRestaurants();
};

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  });
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = restaurants => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach((restaurant, index) => {
    ul.append(createRestaurantHTML(restaurant, index, restaurants.length));
  });
  if (mapToggled) {
    addMarkersToMap();
  }
};

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant, index, restaurantsCount) => {
  const li = document.createElement('li');

  {/* <picture>
    <source data-srcset="/img/${restaurant.id}-540_sml_2x.jpg 2x">
    <img class="lazy" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" data-src="/img/${restaurant.id}-280_sml.jpg" alt="Image of ${restaurant.name} restaurant">
    </picture> */}

  {/* <picture>
    <source srcset="/img/${restaurant.id}-540_sml_2x.jpg 2x">
    <img src="/img/${restaurant.id}-280_sml.jpg" alt="Image of ${restaurant.name} restaurant">
    </picture> */}

  const restaurantHtml = `
		<picture>
			<source srcset="/img/${restaurant.id}-540_sml_2x.jpg 2x">
			<img src="/img/${restaurant.id}-280_sml.jpg" alt="Image of ${restaurant.name} restaurant">
		</picture>
		<h2>${restaurant.name}</h2>
		<p>${restaurant.neighborhood}</p>
		<p>${restaurant.address}</p>
		<a href="./restaurant.html?id=${restaurant.id}" aria-label="More information on ${restaurant.name} restaurant" role="button">View Details</a>
	`;

  li.innerHTML = restaurantHtml;

  li.setAttribute('aria-posinset', index + 1);
  li.setAttribute('aria-setsize', restaurantsCount);

  // const image = document.createElement('picture');
  // const imageSrc = DBHelper.imageUrlForRestaurant(restaurant);
  // image.innerHTML = `
  //   <source srcset="${imageSrc}-540_sml_2x.jpg 2x">
  //   <img alt="Image of ${restaurant.name} restaurant" src="${imageSrc}-280_sml.jpg">
  // `;
  // li.append(image);

  // const name = document.createElement('h2');
  // name.innerHTML = restaurant.name;
  // li.append(name);

  // const neighborhood = document.createElement('p');
  // neighborhood.innerHTML = restaurant.neighborhood;
  // li.append(neighborhood);

  // const address = document.createElement('p');
  // address.innerHTML = restaurant.address;
  // li.append(address);

  // const more = document.createElement('a');
  // more.innerHTML = 'View Details';
  // more.setAttribute(
  // 	'aria-label',
  // 	'More information on ' + restaurant.name + ' restaurant'
  // );
  // more.setAttribute('role', 'button');
  // more.href = DBHelper.urlForRestaurant(restaurant);
  // li.append(more);

  return li;
};

/**
 * Map marker function borrowed from DBHelper - Gideon
 */
mapMarkerForRestaurant = (restaurant, map) => {
  const marker = new google.maps.Marker({
    position: restaurant.latlng,
    title: restaurant.name,
    url: DBHelper.urlForRestaurant(restaurant),
    map: map,
    animation: google.maps.Animation.DROP
  });
  return marker;
};

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url;
    });
    self.markers.push(marker);
  });
};
// add title to Google map
addIframeTitle = () => {
  const iframe = document.querySelector('iframe');
  iframe.title = 'Google Maps';
};

/**
 * Add service worker to project
 */

initServiceWorker = () => {
  if (!navigator.serviceWorker) return;

  const swUpdateReady = function (worker) {
    // show message
    console.log('service worker update ready...');
    worker.postMessage({ action: 'skipWaiting' });
  };

  const swTrackInstalling = function (worker) {
    worker.addEventListener('statechange', function () {
      if (worker.state == 'installed') {
        swUpdateReady(worker);
      }
    });
  };

  navigator.serviceWorker.register('sw.js').then(function (reg) {
    // registration successful
    console.log('Service worker registered');

    if (!navigator.serviceWorker.controller) return;

    if (reg.waiting) {
      // update is available...
      // TODO: popup with "new version available" message
      swUpdateReady(reg.waiting);
      return;
    }

    if (reg.installing) {
      swTrackInstalling(reg.installing);
    }

    reg.addEventListener('updatefound', function () {
      swTrackInstalling(reg.installing);
    });

    // Ensure refresh is called only once.
    // Works around a bug in "force update on reload"
    let refreshing;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (refreshing) return;
      window.location.reload();
      refreshing = true;
    });
  }, function (err) {
    // registration failed
    console.log('Service worker registration failed with message: ' + err);
  });
};
initServiceWorker();

/* Add to homescreen update */
let installPromptEvent;

window.addEventListener('beforeinstallprompt', event => {
  // Prevent Chrome <= 67 from automatically showing the prompt
  event.preventDefault();
  // Stash the event so it can be triggered later.
  installPromptEvent = event;
  // Update the install UI to notify the user app can be installed
  document.querySelector('#install-button').disabled = false;
});
var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

(function (global, factory) {
  (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.LazyLoad = factory();
})(this, function () {
  'use strict';

  var getInstanceSettings = function getInstanceSettings(customSettings) {
    var defaultSettings = {
      elements_selector: "img",
      container: document,
      threshold: 300,
      data_src: "src",
      data_srcset: "srcset",
      class_loading: "loading",
      class_loaded: "loaded",
      class_error: "error",
      callback_load: null,
      callback_error: null,
      callback_set: null,
      callback_enter: null
    };

    return _extends({}, defaultSettings, customSettings);
  };

  var dataPrefix = "data-";

  var getData = function getData(element, attribute) {
    return element.getAttribute(dataPrefix + attribute);
  };

  var setData = function setData(element, attribute, value) {
    return element.setAttribute(dataPrefix + attribute, value);
  };

  var purgeElements = function purgeElements(elements) {
    return elements.filter(function (element) {
      return !getData(element, "was-processed");
    });
  };

  /* Creates instance and notifies it through the window element */
  var createInstance = function createInstance(classObj, options) {
    var event;
    var eventString = "LazyLoad::Initialized";
    var instance = new classObj(options);
    try {
      // Works in modern browsers
      event = new CustomEvent(eventString, { detail: { instance: instance } });
    } catch (err) {
      // Works in Internet Explorer (all versions)
      event = document.createEvent("CustomEvent");
      event.initCustomEvent(eventString, false, false, { instance: instance });
    }
    window.dispatchEvent(event);
  };

  /* Auto initialization of one or more instances of lazyload, depending on the
      options passed in (plain object or an array) */
  var autoInitialize = function autoInitialize(classObj, options) {
    if (!options.length) {
      // Plain object
      createInstance(classObj, options);
    } else {
      // Array of objects
      for (var i = 0, optionsItem; optionsItem = options[i]; i += 1) {
        createInstance(classObj, optionsItem);
      }
    }
  };

  var setSourcesForPicture = function setSourcesForPicture(element, settings) {
    var dataSrcSet = settings.data_srcset;

    var parent = element.parentNode;
    if (!parent || parent.tagName !== "PICTURE") {
      return;
    }
    for (var i = 0, pictureChild; pictureChild = parent.children[i]; i += 1) {
      if (pictureChild.tagName === "SOURCE") {
        var sourceSrcset = getData(pictureChild, dataSrcSet);
        if (sourceSrcset) {
          pictureChild.setAttribute("srcset", sourceSrcset);
        }
      }
    }
  };

  var setSources = function setSources(element, settings) {
    var dataSrc = settings.data_src,
        dataSrcSet = settings.data_srcset;

    var tagName = element.tagName;
    var elementSrc = getData(element, dataSrc);
    if (tagName === "IMG") {
      setSourcesForPicture(element, settings);
      var imgSrcset = getData(element, dataSrcSet);
      if (imgSrcset) {
        element.setAttribute("srcset", imgSrcset);
      }
      if (elementSrc) {
        element.setAttribute("src", elementSrc);
      }
      return;
    }
    if (tagName === "IFRAME") {
      if (elementSrc) {
        element.setAttribute("src", elementSrc);
      }
      return;
    }
    if (elementSrc) {
      element.style.backgroundImage = 'url("' + elementSrc + '")';
    }
  };

  var runningOnBrowser = typeof window !== "undefined";

  var supportsIntersectionObserver = runningOnBrowser && "IntersectionObserver" in window;

  var supportsClassList = runningOnBrowser && "classList" in document.createElement("p");

  var addClass = function addClass(element, className) {
    if (supportsClassList) {
      element.classList.add(className);
      return;
    }
    element.className += (element.className ? " " : "") + className;
  };

  var removeClass = function removeClass(element, className) {
    if (supportsClassList) {
      element.classList.remove(className);
      return;
    }
    element.className = element.className.replace(new RegExp("(^|\\s+)" + className + "(\\s+|$)"), " ").replace(/^\s+/, "").replace(/\s+$/, "");
  };

  var callCallback = function callCallback(callback, argument) {
    if (callback) {
      callback(argument);
    }
  };

  var loadString = "load";
  var errorString = "error";

  var removeListeners = function removeListeners(element, loadHandler, errorHandler) {
    element.removeEventListener(loadString, loadHandler);
    element.removeEventListener(errorString, errorHandler);
  };

  var addOneShotListeners = function addOneShotListeners(element, settings) {
    var onLoad = function onLoad(event) {
      onEvent(event, true, settings);
      removeListeners(element, onLoad, onError);
    };
    var onError = function onError(event) {
      onEvent(event, false, settings);
      removeListeners(element, onLoad, onError);
    };
    element.addEventListener(loadString, onLoad);
    element.addEventListener(errorString, onError);
  };

  var onEvent = function onEvent(event, success, settings) {
    var element = event.target;
    removeClass(element, settings.class_loading);
    addClass(element, success ? settings.class_loaded : settings.class_error); // Setting loaded or error class
    callCallback(success ? settings.callback_load : settings.callback_error, element); // Calling loaded or error callback
  };

  var revealElement = function revealElement(element, settings) {
    callCallback(settings.callback_enter, element);
    if (["IMG", "IFRAME"].indexOf(element.tagName) > -1) {
      addOneShotListeners(element, settings);
      addClass(element, settings.class_loading);
    }
    setSources(element, settings);
    setData(element, "was-processed", true);
    callCallback(settings.callback_set, element);
  };

  /* entry.isIntersecting needs fallback because is null on some versions of MS Edge, and
     entry.intersectionRatio is not enough alone because it could be 0 on some intersecting elements */
  var isIntersecting = function isIntersecting(element) {
    return element.isIntersecting || element.intersectionRatio > 0;
  };

  var LazyLoad = function LazyLoad(customSettings, elements) {
    this._settings = getInstanceSettings(customSettings);
    this._setObserver();
    this.update(elements);
  };

  LazyLoad.prototype = {
    _setObserver: function _setObserver() {
      var _this = this;

      if (!supportsIntersectionObserver) {
        return;
      }

      var settings = this._settings;
      var observerSettings = {
        root: settings.container === document ? null : settings.container,
        rootMargin: settings.threshold + "px"
      };
      var revealIntersectingElements = function revealIntersectingElements(entries) {
        entries.forEach(function (entry) {
          if (isIntersecting(entry)) {
            var element = entry.target;
            revealElement(element, _this._settings);
            _this._observer.unobserve(element);
          }
        });
        _this._elements = purgeElements(_this._elements);
      };
      this._observer = new IntersectionObserver(revealIntersectingElements, observerSettings);
    },

    update: function update(elements) {
      var _this2 = this;

      var settings = this._settings;
      var nodeSet = elements || settings.container.querySelectorAll(settings.elements_selector);

      this._elements = purgeElements(Array.prototype.slice.call(nodeSet)); // nodeset to array for IE compatibility
      if (this._observer) {
        this._elements.forEach(function (element) {
          _this2._observer.observe(element);
        });
        return;
      }
      // Fallback: load all elements at once
      this._elements.forEach(function (element) {
        revealElement(element, settings);
      });
      this._elements = purgeElements(this._elements);
    },

    destroy: function destroy() {
      var _this3 = this;

      if (this._observer) {
        purgeElements(this._elements).forEach(function (element) {
          _this3._observer.unobserve(element);
        });
        this._observer = null;
      }
      this._elements = null;
      this._settings = null;
    }
  };

  /* Automatic instances creation if required (useful for async script loading!) */
  var autoInitOptions = window.lazyLoadOptions;
  if (runningOnBrowser && autoInitOptions) {
    autoInitialize(LazyLoad, autoInitOptions);
  }

  return LazyLoad;
});