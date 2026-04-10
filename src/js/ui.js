import { formatDistance } from './geo.js';
import { addToilet, updateToilet, deleteToilet } from './api.js';

const sheet = document.getElementById('bottom-sheet');
const backdrop = document.getElementById('backdrop');
const loadingOverlay = document.getElementById('loading-overlay');
const errorState = document.getElementById('error-state');
const registerSheet = document.getElementById('register-sheet');
const registerForm = document.getElementById('register-form');
const editBtn = document.getElementById('edit-btn');
const copyBtn = document.getElementById('copy-btn');
const saveEditBtn = document.getElementById('save-edit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const cancelRegisterBtn = document.getElementById('cancel-register-btn');
const bsActions = document.getElementById('bs-actions');
const bsEditActions = document.getElementById('bs-edit-actions');
const regHasLock = document.getElementById('reg-haslock');
const regPasswordGroup = document.getElementById('reg-password-group');
const toast = document.getElementById('toast');

var currentToilet = null;

export function showBottomSheet(toilet) {
  currentToilet = toilet;

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

  bsActions.style.display = '';
  bsEditActions.style.display = 'none';

  sheet.classList.add('open');
  backdrop.classList.add('visible');
}

export function hideBottomSheet() {
  sheet.classList.remove('open');
  backdrop.classList.remove('visible');
}

export function showRegisterSheet(lat, lng) {
  hideBottomSheet();
  registerForm.reset();
  document.getElementById('reg-lat').value = lat;
  document.getElementById('reg-lng').value = lng;
  regPasswordGroup.style.display = 'none';
  registerSheet.classList.add('open');
  backdrop.classList.add('visible');
}

function hideRegisterSheet() {
  registerSheet.classList.remove('open');
  backdrop.classList.remove('visible');
}

export function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(function() {
    toast.classList.remove('visible');
  }, 1500);
}

function exitEditMode() {
  var fields = ['bs-building', 'bs-floor', 'bs-memo', 'bs-password'];
  fields.forEach(function(id) {
    var el = document.getElementById(id);
    el.contentEditable = 'false';
    el.classList.remove('editable');
  });
  bsActions.style.display = '';
  bsEditActions.style.display = 'none';
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

// Toggle password field visibility
regHasLock.addEventListener('change', function() {
  regPasswordGroup.style.display = this.checked ? '' : 'none';
});

// Registration form submit handler
registerForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  var submitBtn = registerForm.querySelector('button[type="submit"]');
  submitBtn.classList.add('saving');
  submitBtn.disabled = true;
  var formData = new FormData(registerForm);
  var toiletData = {
    buildingName: formData.get('buildingName'),
    floor: formData.get('floor') || '',
    locationMemo: formData.get('locationMemo') || '',
    hasLock: regHasLock.checked,
    password: formData.get('password') || '',
    latitude: parseFloat(formData.get('latitude')),
    longitude: parseFloat(formData.get('longitude')),
    region: 'misa new town',
    category: formData.get('category') || ''
  };

  try {
    var result = await addToilet(toiletData);
    if (result.status === 'ok') {
      hideRegisterSheet();
      showToast('화장실이 등록되었습니다');
      document.dispatchEvent(new CustomEvent('toilet-added', { detail: { ...toiletData, id: result.data.id, createdAt: result.data.createdAt, updatedAt: result.data.createdAt } }));
    } else {
      showToast('등록 실패: ' + (result.error || '알 수 없는 오류'));
    }
  } catch (err) {
    console.error('Registration failed:', err);
    showToast('등록 실패: 네트워크 오류');
  } finally {
    submitBtn.classList.remove('saving');
    submitBtn.disabled = false;
  }
});

// Cancel register button
cancelRegisterBtn.addEventListener('click', function() {
  hideRegisterSheet();
});

// Edit button handler
editBtn.addEventListener('click', function() {
  if (!currentToilet) return;
  var fields = ['bs-building', 'bs-floor', 'bs-memo', 'bs-password'];
  fields.forEach(function(id) {
    var el = document.getElementById(id);
    el.contentEditable = 'true';
    el.classList.add('editable');
  });
  bsActions.style.display = 'none';
  bsEditActions.style.display = '';
});

// Save edit handler
saveEditBtn.addEventListener('click', async function() {
  if (!currentToilet) return;
  saveEditBtn.classList.add('saving');
  saveEditBtn.disabled = true;
  var updateData = {
    id: currentToilet.id,
    buildingName: document.getElementById('bs-building').textContent.trim(),
    floor: document.getElementById('bs-floor').textContent.trim(),
    locationMemo: document.getElementById('bs-memo').textContent.trim(),
    password: document.getElementById('bs-password').textContent.trim()
  };

  try {
    var result = await updateToilet(updateData);
    if (result.status === 'ok') {
      exitEditMode();
      showToast('수정되었습니다');
      document.dispatchEvent(new CustomEvent('toilet-updated'));
    } else {
      showToast('수정 실패: ' + (result.error || '알 수 없는 오류'));
    }
  } catch (err) {
    console.error('Update failed:', err);
    showToast('수정 실패: 네트워크 오류');
  } finally {
    saveEditBtn.classList.remove('saving');
    saveEditBtn.disabled = false;
  }
});

// Cancel edit handler
cancelEditBtn.addEventListener('click', function() {
  exitEditMode();
  if (currentToilet) showBottomSheet(currentToilet);
});

// Delete button handler
var deleteBtn = document.getElementById('delete-btn');
deleteBtn.addEventListener('click', async function() {
  if (!currentToilet) return;
  if (!confirm(currentToilet.buildingName + ' 화장실을 삭제하시겠습니까?')) return;

  deleteBtn.classList.add('saving');
  deleteBtn.disabled = true;
  try {
    var result = await deleteToilet(currentToilet.id);
    if (result.status === 'ok') {
      hideBottomSheet();
      showToast('삭제되었습니다');
      document.dispatchEvent(new CustomEvent('toilet-deleted', { detail: { id: currentToilet.id } }));
      currentToilet = null;
    } else {
      showToast('삭제 실패: ' + (result.error || '알 수 없는 오류'));
    }
  } catch (err) {
    console.error('Delete failed:', err);
    showToast('삭제 실패: 네트워크 오류');
  } finally {
    deleteBtn.classList.remove('saving');
    deleteBtn.disabled = false;
  }
});

// Copy button handler
copyBtn.addEventListener('click', function() {
  var password = document.getElementById('bs-password').textContent;
  if (!password || password === '비밀번호 없음') return;

  navigator.clipboard.writeText(password).then(function() {
    showToast('복사됨');
  }).catch(function() {
    var textarea = document.createElement('textarea');
    textarea.value = password;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('복사됨');
  });
});

// Event listeners
backdrop.addEventListener('click', function() {
  hideBottomSheet();
  hideRegisterSheet();
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
