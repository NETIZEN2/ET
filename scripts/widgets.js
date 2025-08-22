export async function getWeather(lat,lon){
  try{
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const data = await fetch(url).then(r=>r.json());
    return data.current_weather;
  }catch{
    return null;
  }
}
