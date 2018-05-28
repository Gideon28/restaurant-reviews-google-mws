let restaurants, neighborhoods, cuisines;
var map;
var markers = [];

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
// fetchNeighborhoods = () => {
// 	DBHelper.fetchNeighborhoods((error, neighborhoods) => {
// 		if (error) {
// 			// Got an error
// 			console.error(error);
// 		} else {
// 			self.neighborhoods = neighborhoods;
// 			fillNeighborhoodsHTML();
// 		}
// 	});
// };

logError = (e, part) => {
	const container = document.querySelector('#maincontent');
	const errorMsg = `<p class="network-warning">Oh no! There was an error making a requst for the ${part}</p>`;

	container.insertAdjacentHTML('beforebegin', errorMsg);

	console.log(`Error: ${e}`);
};

fetchReducedList = (url, prop, callback) => {
	fetch(url)
		.then(response => response.json())
		.then(data => {
			let reducedData = [];

			// push only unique values
			data.forEach(obj => {
				if (reducedData.includes(obj[prop])) return;
				reducedData.push(obj[prop]);
			});

			// run method to populate list
			callback(reducedData);
		})
		.catch(e => logError(e, 'neighborhoods'));
};

fetchNeighborhoods = () => {
	fetchReducedList('http://localhost:1337/restaurants', 'neighborhood', fillNeighborhoodsHTML);
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
	let loc = {
		lat: 40.722216,
		lng: -73.987501
	};
	self.map = new google.maps.Map(document.getElementById('map'), {
		zoom: 12,
		center: loc,
		scrollwheel: false
	});
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

	DBHelper.fetchRestaurantByCuisineAndNeighborhood(
		cuisine,
		neighborhood,
		(error, restaurants) => {
			if (error) {
				// Got an error!
				console.error(error);
			} else {
				resetRestaurants(restaurants);
				fillRestaurantsHTML();
			}
		}
	);
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
	addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant, index, restaurantsCount) => {
	const li = document.createElement('li');
	li.setAttribute('aria-posinset', index + 1);
	li.setAttribute('aria-setsize', restaurantsCount);

	const image = document.createElement('picture');
	const imageSrc = DBHelper.imageUrlForRestaurant(restaurant);
	image.innerHTML = `
    <source srcset="${imageSrc}-540_sml_2x.jpg 2x">
    <img alt="Image of ${
	restaurant.name
} restaurant" src="${imageSrc}-280_sml.jpg">
  `;
	li.append(image);

	const name = document.createElement('h2');
	name.innerHTML = restaurant.name;
	li.append(name);

	const neighborhood = document.createElement('p');
	neighborhood.innerHTML = restaurant.neighborhood;
	li.append(neighborhood);

	const address = document.createElement('p');
	address.innerHTML = restaurant.address;
	li.append(address);

	const more = document.createElement('a');
	more.innerHTML = 'View Details';
	more.setAttribute(
		'aria-label',
		'More information on ' + restaurant.name + ' restaurant'
	);
	more.setAttribute('role', 'button');
	more.href = DBHelper.urlForRestaurant(restaurant);
	li.append(more);

	return li;
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
window.onload = function() {
	const iframe = document.querySelector('iframe');
	iframe.title = 'Google Maps';
};

/**
 * Add service worker to project
 */

initServiceWorker = () => {
	if (!navigator.serviceWorker) return;

	const swUpdateReady = function(worker) {
		// show message
		console.log('service worker update ready...');
		worker.postMessage({ action: 'skipWaiting' });
	};

	const swTrackInstalling = function(worker) {
		worker.addEventListener('statechange', function() {
			if (worker.state == 'installed') {
				swUpdateReady(worker);
			}
		});
	};

	navigator.serviceWorker.register('sw.js').then(
		function(reg) {
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

			reg.addEventListener('updatefound', function() {
				swTrackInstalling(reg.installing);
			});

			// Ensure refresh is called only once.
			// Works around a bug in "force update on reload"
			let refreshing;
			navigator.serviceWorker.addEventListener('controllerchange', function() {
				if (refreshing) return;
				window.location.reload();
				refreshing = true;
			});
		},
		function(err) {
			// registration failed
			console.log('Service worker registration failed with message: ' + err);
		}
	);
};
initServiceWorker();
