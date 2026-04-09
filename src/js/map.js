export function initMap(containerId) {
  const container = document.getElementById(containerId);
  const options = {
    center: new window.kakao.maps.LatLng(37.5600, 127.1800),
    level: 5
  };
  return new window.kakao.maps.Map(container, options);
}

function createMarkerImage(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
    <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="3"/>
  </svg>`;
  const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const size = new window.kakao.maps.Size(32, 32);
  const option = { offset: new window.kakao.maps.Point(16, 16) };
  return new window.kakao.maps.MarkerImage(src, size, option);
}

let MARKER_UNLOCKED = null;
let MARKER_LOCKED = null;

function ensureMarkerImages() {
  if (!MARKER_UNLOCKED) {
    MARKER_UNLOCKED = createMarkerImage('#2ecc71');
    MARKER_LOCKED = createMarkerImage('#e74c3c');
  }
}

export function createMarkers(map, toilets) {
  ensureMarkerImages();
  const markers = [];

  toilets.forEach(function(toilet) {
    const marker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(toilet.latitude, toilet.longitude),
      image: toilet.hasLock ? MARKER_LOCKED : MARKER_UNLOCKED,
      clickable: true
    });

    marker.setMap(map);

    window.kakao.maps.event.addListener(marker, 'click', function() {
      document.dispatchEvent(new CustomEvent('toilet-selected', { detail: toilet }));
    });

    markers.push(marker);
  });

  return markers;
}

export function clearMarkers(markers) {
  markers.forEach(function(marker) {
    marker.setMap(null);
  });
}

let gpsMarker = null;

export function showUserPosition(map, lat, lng) {
  var position = new window.kakao.maps.LatLng(lat, lng);

  if (gpsMarker) {
    gpsMarker.setPosition(position);
    return;
  }

  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">' +
    '<circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="3"/>' +
    '</svg>';
  var src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  var size = new window.kakao.maps.Size(24, 24);
  var option = { offset: new window.kakao.maps.Point(12, 12) };
  var image = new window.kakao.maps.MarkerImage(src, size, option);

  gpsMarker = new window.kakao.maps.Marker({
    position: position,
    image: image,
    map: map
  });
}

export function panTo(map, lat, lng) {
  map.panTo(new window.kakao.maps.LatLng(lat, lng));
}

let searchMarker = null;
var searchLabelEl = null;

export function showSearchMarker(map, lat, lng, name) {
  clearSearchMarker();

  var position = new window.kakao.maps.LatLng(lat, lng);

  searchMarker = new window.kakao.maps.Marker({
    position: position,
    map: map
  });

  // Create floating label as plain DOM above the map
  searchLabelEl = document.createElement('div');
  searchLabelEl.id = 'search-label';
  searchLabelEl.textContent = name;
  searchLabelEl.style.cssText = 'position:fixed;top:68px;left:50%;transform:translateX(-50%);padding:6px 14px;background:#fff;border:1px solid #ccc;border-radius:8px;font-size:14px;color:#000;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.2);z-index:100;';
  document.body.appendChild(searchLabelEl);
}

export function clearSearchMarker() {
  if (searchLabelEl) {
    searchLabelEl.remove();
    searchLabelEl = null;
  }
  if (searchMarker) {
    searchMarker.setMap(null);
    searchMarker = null;
  }
}

export function setupLongPress(map) {
  var longPressTimer = null;
  var mapContainer = document.getElementById('map');

  mapContainer.addEventListener('touchstart', function(e) {
    if (e.touches.length !== 1) return;
    longPressTimer = setTimeout(function() {
      var proj = map.getProjection();
      var rect = mapContainer.getBoundingClientRect();
      var containerPoint = new window.kakao.maps.Point(
        e.touches[0].clientX - rect.left,
        e.touches[0].clientY - rect.top
      );
      var latLng = proj.coordsFromContainerPoint(containerPoint);
      document.dispatchEvent(new CustomEvent('map-longpress', {
        detail: { lat: latLng.getLat(), lng: latLng.getLng() }
      }));
    }, 700);
  }, { passive: true });

  mapContainer.addEventListener('touchend', function() {
    clearTimeout(longPressTimer);
  });

  mapContainer.addEventListener('touchmove', function() {
    clearTimeout(longPressTimer);
  }, { passive: true });
}
