import { formatDistance } from './geo.js';

const sheet = document.getElementById('bottom-sheet');
const backdrop = document.getElementById('backdrop');
const loadingOverlay = document.getElementById('loading-overlay');
const errorState = document.getElementById('error-state');

export function showBottomSheet(toilet) {
  document.getElementById('bs-building').textContent = toilet.buildingName;
  document.getElementById('bs-floor').textContent = toilet.floor || '층 정보 없음';
  document.getElementById('bs-memo').textContent = toilet.locationMemo || '메모 없음';
  document.getElementById('bs-password').textContent = toilet.password || '비밀번호 없음';

  const lockBadge = document.getElementById('bs-lock');
  if (toilet.hasLock) {
    lockBadge.textContent = '잠금 있음';
    lockBadge.className = 'lock-badge locked';
  } else {
    lockBadge.textContent = '잠금 없음';
    lockBadge.className = 'lock-badge unlocked';
  }

  var distanceEl = document.getElementById('bs-distance');
  var distanceLabelEl = document.getElementById('bs-distance-label');
  if (toilet._distance != null) {
    distanceEl.textContent = formatDistance(toilet._distance);
    distanceEl.style.display = '';
    distanceLabelEl.style.display = '';
  } else {
    distanceEl.style.display = 'none';
    distanceLabelEl.style.display = 'none';
  }

  sheet.classList.add('open');
  backdrop.classList.add('visible');
}

export function hideBottomSheet() {
  sheet.classList.remove('open');
  backdrop.classList.remove('visible');
}

export function showLoading() {
  loadingOverlay.style.display = 'flex';
}

export function hideLoading() {
  loadingOverlay.style.display = 'none';
}

export function showError() {
  errorState.style.display = 'flex';
}

export function hideError() {
  errorState.style.display = 'none';
}

// Event listeners
backdrop.addEventListener('click', function() {
  hideBottomSheet();
});

document.addEventListener('toilet-selected', function(e) {
  showBottomSheet(e.detail);
});

// Swipe down on drag handle to close bottom sheet
const dragHandle = document.querySelector('.drag-handle');
let touchStartY = 0;

dragHandle.addEventListener('touchstart', function(e) {
  touchStartY = e.touches[0].clientY;
}, { passive: true });

dragHandle.addEventListener('touchend', function(e) {
  const touchEndY = e.changedTouches[0].clientY;
  const deltaY = touchEndY - touchStartY;
  if (deltaY > 50) {
    hideBottomSheet();
  }
});

// Retry button dispatches retry-fetch event
document.getElementById('retry-btn').addEventListener('click', function() {
  document.dispatchEvent(new CustomEvent('retry-fetch'));
});
