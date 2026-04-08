export function initMap(containerId) {
  const container = document.getElementById(containerId);
  const options = {
    center: new kakao.maps.LatLng(37.5600, 127.1800),
    level: 5
  };
  return new kakao.maps.Map(container, options);
}

function createMarkerImage(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
    <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="3"/>
  </svg>`;
  const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const size = new kakao.maps.Size(32, 32);
  const option = { offset: new kakao.maps.Point(16, 16) };
  return new kakao.maps.MarkerImage(src, size, option);
}

const MARKER_UNLOCKED = createMarkerImage('#2ecc71');
const MARKER_LOCKED = createMarkerImage('#e74c3c');

export function createMarkers(map, toilets) {
  const markers = [];

  toilets.forEach(function(toilet) {
    const marker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(toilet.latitude, toilet.longitude),
      image: toilet.hasLock ? MARKER_LOCKED : MARKER_UNLOCKED,
      clickable: true
    });

    marker.setMap(map);

    kakao.maps.event.addListener(marker, 'click', function() {
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
