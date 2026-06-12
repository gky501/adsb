// Change this to your feeder's public JSON URL once Cloudflare Tunnel is set up.
// Common tar1090/readsb examples:
// https://feed.yourdomain.com/data/aircraft.json
// https://feed.yourdomain.com/tar1090/data/aircraft.json

window.ADSB_CONFIG = {
  FEED_URL: "https://feed.yourdomain.com/data/aircraft.json",
  REFRESH_SECONDS: 10,

  // Set this near your receiver location.
  MAP_CENTER: [34.7465, -92.2896],
  MAP_ZOOM: 8
};
