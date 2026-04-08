import { initMap, createMarkers, clearMarkers } from './js/map.js';
import { getToilets } from './js/api.js';
import { showLoading, hideLoading, showError, hideError } from './js/ui.js';
import './css/style.css';

let map = null;
let markers = [];

async function loadToilets() {
  showLoading();
  hideError();
  try {
    const toilets = await getToilets();
    if (markers.length > 0) {
      clearMarkers(markers);
    }
    markers = createMarkers(map, toilets);
    hideLoading();
  } catch (error) {
    console.error('Failed to load toilets:', error);
    hideLoading();
    showError();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  map = initMap('map');
  loadToilets();
});

// Retry fetch on error state button click
document.addEventListener('retry-fetch', () => {
  loadToilets();
});
