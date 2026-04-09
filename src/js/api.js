// GAS Web App URL -- replace with your deployed URL
// Deploy: Google Apps Script Editor > Deploy > New Deployment > Web App
const GAS_URL = 'https://script.google.com/macros/s/AKfycbz-tQgGeRl6xN-AuAQWtben7BTjUGe5ZeCP3S13ZlxR1SOGRGGYhzZHv3FYvDuro3cqFg/exec';

/**
 * Fetch all toilet data from Google Sheets via GAS.
 * @returns {Promise<Array>} Array of toilet objects
 * @throws {Error} If fetch fails or response is not ok
 */
export async function getToilets() {
  const response = await fetch(`${GAS_URL}?action=getAll`, {
    method: 'GET',
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch toilet data: ${response.status}`);
  }

  const result = await response.json();

  if (result.status !== 'ok') {
    throw new Error(result.error || 'Unknown API error');
  }

  return result.data;
}

/**
 * Add a new toilet to Google Sheets via GAS.
 * Uses text/plain content-type as CORS workaround for GAS POST.
 *
 * @param {Object} toiletData - Toilet data to add
 * @returns {Promise<Object>} Response with id and createdAt
 * @throws {Error} If fetch fails or response is not ok
 */
export async function addToilet(toiletData) {
  const response = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'add', data: toiletData }),
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error('Failed to add toilet: ' + response.status);
  }

  return response.json();
}

/**
 * Update an existing toilet in Google Sheets via GAS.
 * Uses text/plain content-type as CORS workaround for GAS POST.
 *
 * @param {Object} toiletData - Toilet data with id and fields to update
 * @returns {Promise<Object>} Response with id and updatedAt
 * @throws {Error} If fetch fails or response is not ok
 */
export async function deleteToilet(id) {
  const response = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'delete', data: { id: id } }),
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error('Failed to delete toilet: ' + response.status);
  }

  return response.json();
}

export async function updateToilet(toiletData) {
  const response = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'update', data: toiletData }),
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error('Failed to update toilet: ' + response.status);
  }

  return response.json();
}
