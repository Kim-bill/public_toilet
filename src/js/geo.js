/**
 * Geolocation and distance calculation utilities.
 * Provides GPS access and Haversine distance for finding nearest toilets.
 */

/**
 * Get the current device position using the browser Geolocation API.
 *
 * @returns {Promise<{lat: number, lng: number, accuracy: number}>} Position object
 * @throws {Error} If geolocation is not supported
 * @throws {GeolocationPositionError} If permission denied or timeout
 */
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  });
}

/**
 * Calculate the distance between two coordinates using the Haversine formula.
 *
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in meters (rounded to integer)
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  var R = 6371000; // Earth radius in meters

  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLng = (lng2 - lng1) * Math.PI / 180;

  var radLat1 = lat1 * Math.PI / 180;
  var radLat2 = lat2 * Math.PI / 180;

  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Format a distance in meters to a human-readable string.
 *
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance (e.g., '450m' or '1.2km')
 */
export function formatDistance(meters) {
  if (meters < 1000) {
    return meters + 'm';
  }
  return (meters / 1000).toFixed(1) + 'km';
}

/**
 * Find the nearest toilet from an array based on user coordinates.
 * Attaches a _distance property (in meters) to each toilet object.
 *
 * @param {number} userLat - User's latitude
 * @param {number} userLng - User's longitude
 * @param {Array<Object>} toilets - Array of toilet objects with latitude/longitude
 * @returns {Object|null} The nearest toilet object, or null if array is empty
 */
export function findNearest(userLat, userLng, toilets) {
  if (!toilets || toilets.length === 0) {
    return null;
  }

  var nearest = null;
  var minDist = Infinity;

  for (var i = 0; i < toilets.length; i++) {
    var dist = haversineDistance(userLat, userLng, toilets[i].latitude, toilets[i].longitude);
    toilets[i]._distance = dist;

    if (dist < minDist) {
      minDist = dist;
      nearest = toilets[i];
    }
  }

  return nearest;
}
