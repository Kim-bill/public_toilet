export function initMap(containerId) {
  const container = document.getElementById(containerId);
  const options = {
    center: new kakao.maps.LatLng(37.5600, 127.1800),
    level: 5
  };
  return new kakao.maps.Map(container, options);
}
