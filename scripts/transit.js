/** Build map links */
export function mapLink(lat,lon){
  const q = `${lat},${lon}`;
  return {
    apple:`https://maps.apple.com/?daddr=${q}`,
    google:`https://www.google.com/maps/dir/?api=1&destination=${q}`
  };
}
