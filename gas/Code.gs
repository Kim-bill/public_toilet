// === SEED DATA FOR GOOGLE SHEETS ===
// Enter these rows into the 'toilets' sheet after the header row.
// Passwords are left empty per D-05 (to be filled after visiting).
//
// Headers: id | buildingName | floor | locationMemo | hasLock | password | latitude | longitude | region | category | createdAt | updatedAt
//
// 1 | 스타필드 미사 | 1F | 1층 중앙 에스컬레이터 옆 | TRUE | | 37.5604 | 127.1802 | 미사신도시 | 상업시설 | 2026-04-08 |
// 2 | 스타필드 미사 | B1 | 지하1층 푸드코트 옆 | TRUE | | 37.5604 | 127.1802 | 미사신도시 | 상업시설 | 2026-04-08 |
// 3 | 홈플러스 미사점 | 1F | 정문 입구 오른쪽 | FALSE | | 37.5631 | 127.1795 | 미사신도시 | 상업시설 | 2026-04-08 |
// 4 | 이마트 미사점 | 1F | 계산대 뒤편 | TRUE | | 37.5589 | 127.1823 | 미사신도시 | 상업시설 | 2026-04-08 |
// 5 | 미사역 | B1 | 지하1층 대합실 | FALSE | | 37.5600 | 127.1800 | 미사신도시 | 공공시설 | 2026-04-08 |
// 6 | 미사강변공원 | 1F | 공원 입구 공중화장실 | FALSE | | 37.5567 | 127.1756 | 미사신도시 | 공공시설 | 2026-04-08 |
// 7 | 미사역 상가 A동 | 2F | 엘리베이터 옆 | TRUE | | 37.5596 | 127.1808 | 미사신도시 | 카페/음식점 | 2026-04-08 |
// 8 | 미사역 상가 B동 | 1F | 편의점 옆 통로 | TRUE | | 37.5598 | 127.1812 | 미사신도시 | 카페/음식점 | 2026-04-08 |

/**
 * GAS Web App entry point.
 * Handles GET requests with action parameter.
 *
 * @param {Object} e - Event object with parameter property
 * @returns {TextOutput} JSON response
 */
function doGet(e) {
  var action = e.parameter.action;

  if (action === 'getAll') {
    return getAllToilets();
  }

  return jsonResponse({ error: 'Unknown action' });
}

/**
 * Read all toilet data from the 'toilets' sheet.
 * Maps each row to a toilet object matching D-06 column structure.
 *
 * @returns {TextOutput} JSON response with status and data array
 */
function getAllToilets() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('toilets');
  var data = sheet.getDataRange().getValues();
  var toilets = [];

  // First row is headers, start from index 1
  for (var i = 1; i < data.length; i++) {
    var row = data[i];

    // Skip rows where id is empty
    if (!row[0]) continue;

    toilets.push({
      id: String(row[0]),
      buildingName: String(row[1]),
      floor: String(row[2]),
      locationMemo: String(row[3]),
      hasLock: row[4] === true || row[4] === 'TRUE',
      password: String(row[5]),
      latitude: parseFloat(row[6]),
      longitude: parseFloat(row[7]),
      region: String(row[8]),
      category: String(row[9]),
      createdAt: String(row[10]),
      updatedAt: String(row[11])
    });
  }

  return jsonResponse({ status: 'ok', data: toilets });
}

/**
 * Create a JSON text output response.
 *
 * @param {Object} data - Data to serialize as JSON
 * @returns {TextOutput} ContentService JSON response
 */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
