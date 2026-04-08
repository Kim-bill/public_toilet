// GAS Web App URL -- replace with your deployed URL
// Deploy: Google Apps Script Editor > Deploy > New Deployment > Web App
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxRs8w5m4dCTPGZIYupqKCj3ECtRek9rJft49Bd4txi4kGrFwOEpEL1-_Vv7N98_ZE9hw/exec';

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
