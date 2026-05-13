import { Astronomy, Body } from 'astronomy-engine';

export async function POST(req: Request) {
  const { lat, lon, date } = await req.json();
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=cloudcover,visibility,windspeed_10m&timezone=auto&start_date=${date}&end_date=${date}`;
  const weather = await fetch(weatherUrl).then(r => r.json());

  const slots: any[] = [];
  for (let i = 0; i < weather.hourly.time.length; i++) {
    const time = new Date(weather.hourly.time[i]);
    const cloud = weather.hourly.cloudcover[i];
    const vis = weather.hourly.visibility[i];
    const wind = weather.hourly.windspeed_10m[i];

    const saturn = Astronomy.Horizon(time, lat, lon, Astronomy.Ecliptic(Body.Saturn), false);
    const moon = Astronomy.Horizon(time, lat, lon, Astronomy.Ecliptic(Body.Moon), false);
    const moonPhase = Astronomy.MoonPhase(time);

    const score = (saturn.altitude > 25 && cloud < 30 ? 20 : 0) +
                  (moonPhase.illumination < 0.4 && moon.altitude < 15 ? 15 : 0) +
                  (vis > 12000 && wind < 12 && cloud < 20 ? 15 : 0) -
                  (cloud > 40 ? 25 : 0);

    slots.push({ time, score, saturnAlt: Math.round(saturn.altitude), cloud, vis, wind });
  }

  const blocks: any[] = [];
  let cur: any = null;
  for (const s of slots) {
    if (s.score >= 50) {
      cur = cur || { start: s.time, end: s.time, objects: [], conditions: [] };
      cur.end = s.time;
      if (s.saturnAlt > 25 && !cur.objects.includes('Saturn')) cur.objects.push('Saturn');
      if (s.vis > 12000 && !cur.conditions.includes('Excellent seeing')) cur.conditions.push('Excellent seeing');
    } else { if (cur) blocks.push(cur); cur = null; }
  }
  if (cur) blocks.push(cur);

  return Response.json(blocks);
}