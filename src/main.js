import { initMap, createMarkers, clearMarkers, showUserPosition, panTo, setupLongPress, showSearchMarker, clearSearchMarker } from './js/map.js';
import { getToilets } from './js/api.js';
import { getCurrentPosition, findNearest } from './js/geo.js';
import { showLoading, hideLoading, showError, hideError, showRegisterSheet } from './js/ui.js';
import './css/style.css';

let map = null;
let markers = [];
let toilets = [];

async function loadToilets() {
  showLoading();
  hideError();
  try {
    var data = await getToilets();
    toilets = data;
    if (markers.length > 0) {
      clearMarkers(markers);
    }
    markers = createMarkers(map, data);
    hideLoading();
  } catch (error) {
    console.error('Failed to load toilets:', error);
    hideLoading();
    showError();
  }
}

window._kakaoReady.then(() => {
  map = initMap('map');
  loadToilets();
  setupLongPress(map);

  // Blur search input when map is touched
  document.getElementById('map').addEventListener('touchstart', function() {
    document.getElementById('search-input').blur();
  }, { passive: true });
});

// Long-press on map opens registration form
document.addEventListener('map-longpress', function(e) {
  showRegisterSheet(e.detail.lat, e.detail.lng);
});

// New toilet registered — add marker immediately
document.addEventListener('toilet-added', function(e) {
  toilets.push(e.detail);
  clearMarkers(markers);
  markers = createMarkers(map, toilets);
});

// Toilet updated — refresh all data
document.addEventListener('toilet-updated', function() {
  loadToilets();
});

// Toilet deleted — remove from list and refresh markers
document.addEventListener('toilet-deleted', function(e) {
  toilets = toilets.filter(function(t) { return t.id !== e.detail.id; });
  clearMarkers(markers);
  markers = createMarkers(map, toilets);
});

// Retry fetch on error state button click
document.addEventListener('retry-fetch', () => {
  loadToilets();
});

// Search functionality
var searchInput = document.getElementById('search-input');
var searchBtn = document.getElementById('search-btn');
var searchClearBtn = document.getElementById('search-clear-btn');
var ps = null;

window._kakaoReady.then(function() {
  ps = new window.kakao.maps.services.Places();
});

function searchPlace() {
  if (!ps) return;
  var keyword = searchInput.value.trim();
  if (!keyword) return;

  ps.keywordSearch(keyword, function(data, status) {
    if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
      var place = data[0];
      var lat = parseFloat(place.y);
      var lng = parseFloat(place.x);
      panTo(map, lat, lng);
      showSearchMarker(map, lat, lng, place.place_name);
      searchInput.blur();
      searchClearBtn.style.display = '';
    } else {
      alert('검색 결과가 없습니다.');
    }
  });
}

searchBtn.addEventListener('click', searchPlace);

searchClearBtn.addEventListener('click', function() {
  clearSearchMarker();
  searchInput.value = '';
  searchClearBtn.style.display = 'none';
});
searchInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    searchPlace();
  }
});

// GPS button click handler
document.getElementById('gps-btn').addEventListener('click', async function() {
  var btn = this;
  btn.classList.add('loading');

  try {
    var pos = await getCurrentPosition();
    showUserPosition(map, pos.lat, pos.lng);

    if (toilets.length > 0) {
      var nearest = findNearest(pos.lat, pos.lng, toilets);
      if (nearest) {
        panTo(map, nearest.latitude, nearest.longitude);
        document.dispatchEvent(new CustomEvent('toilet-selected', { detail: nearest }));
      }
    }
  } catch (err) {
    console.error('GPS error:', err);
    if (err.code === 1) {
      alert('위치 권한이 필요합니다. 브라우저 설정에서 위치 접근을 허용해 주세요.');
    } else if (err.code === 2) {
      alert('위치를 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.');
    } else if (err.code === 3) {
      alert('위치 확인 시간이 초과되었습니다. 다시 시도해 주세요.');
    } else {
      alert('위치를 확인할 수 없습니다: ' + err.message);
    }
  } finally {
    btn.classList.remove('loading');
  }
});
