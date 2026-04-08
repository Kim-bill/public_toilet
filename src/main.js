import { initMap, createMarkers, clearMarkers, showUserPosition, panTo } from './js/map.js';
import { getToilets } from './js/api.js';
import { getCurrentPosition, findNearest } from './js/geo.js';
import { showLoading, hideLoading, showError, hideError } from './js/ui.js';
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
});

// Retry fetch on error state button click
document.addEventListener('retry-fetch', () => {
  loadToilets();
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
