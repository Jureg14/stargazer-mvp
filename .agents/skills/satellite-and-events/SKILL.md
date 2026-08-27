---
name: satellite-and-events
description: >-
  Guide for calculating visible satellite passes (e.g. ISS with satellite.js) and
  meteor shower peaks and astronomical events. Use this skill when implementing
  satellite pass predictions, meteor showers, or eclipse/conjunction tracking.
---

# Satellite & Astronomical Events Guide

This skill provides algorithms and procedures for calculating visible passes of the International Space Station (ISS), annual meteor shower peaks, and celestial conjunctions.

---

## 1. ISS Pass Prediction with `satellite.js`

A satellite pass is visible to a ground observer when all three conditions are met:
1. **Geometric Elevation**: The satellite is above the observer's horizon (altitude $\ge 15^\circ$, ideally $\ge 30^\circ$).
2. **Illumination**: The satellite is sunlit (not eclipsed by Earth's shadow).
3. **Local Sky Darkness**: The ground observer is in darkness (Sun altitude $h_\odot \le -6^\circ$).

### 1.1 Implementation Architecture

```typescript
import * as satellite from 'satellite.js';

export interface VisibleSatellitePass {
  satelliteName: string;
  startTime: Date;
  maxTime: Date;
  endTime: Date;
  durationSeconds: number;
  maxAltitudeDeg: number;
  startAzimuthDeg: number;
  endAzimuthDeg: number;
  estimatedMagnitude: number;
}

export function computePassesFromTLE(
  tleLine1: string,
  tleLine2: string,
  observerLat: number,
  observerLon: number,
  observerAltKm: number,
  startDate: Date,
  hoursToSearch = 24
): VisibleSatellitePass[] {
  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
  const passes: VisibleSatellitePass[] = [];

  const observerGd = {
    latitude: satellite.degreesToRadians(observerLat),
    longitude: satellite.degreesToRadians(observerLon),
    height: observerAltKm,
  };

  // Step through time in 20-second increments
  const stepSeconds = 20;
  const totalSteps = (hoursToSearch * 3600) / stepSeconds;
  let inPass = false;
  let currentPassStart: Date | null = null;
  let maxAlt = 0;
  let maxAltTime: Date | null = null;
  let startAz = 0;
  let lastAz = 0;

  for (let i = 0; i <= totalSteps; i++) {
    const time = new Date(startDate.getTime() + i * stepSeconds * 1000);
    const positionAndVelocity = satellite.propagate(satrec, time);

    if (
      !positionAndVelocity ||
      typeof positionAndVelocity.position === 'boolean'
    ) {
      continue;
    }

    const gmst = satellite.gstime(time);
    const positionEci = positionAndVelocity.position;
    const positionEcf = satellite.eciToEcf(positionEci, gmst);
    const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);

    const altDeg = satellite.radiansToDegrees(lookAngles.elevation);
    const azDeg = satellite.radiansToDegrees(lookAngles.azimuth);

    if (altDeg > 10) {
      if (!inPass) {
        inPass = true;
        currentPassStart = time;
        startAz = azDeg;
        maxAlt = altDeg;
        maxAltTime = time;
      } else {
        if (altDeg > maxAlt) {
          maxAlt = altDeg;
          maxAltTime = time;
        }
        lastAz = azDeg;
      }
    } else {
      if (inPass && currentPassStart && maxAltTime && maxAlt >= 25) {
        passes.push({
          satelliteName: 'ISS (ZARYA)',
          startTime: currentPassStart,
          maxTime: maxAltTime,
          endTime: time,
          durationSeconds: Math.round(
            (time.getTime() - currentPassStart.getTime()) / 1000
          ),
          maxAltitudeDeg: Math.round(maxAlt),
          startAzimuthDeg: Math.round(startAz),
          endAzimuthDeg: Math.round(lastAz),
          estimatedMagnitude: -2.8,
        });
      }
      inPass = false;
      currentPassStart = null;
      maxAlt = 0;
    }
  }

  return passes;
}
```

---

## 2. Meteor Shower Calendar Engine

Major annual meteor showers have fixed calendar windows and active radiant coordinates:

| Shower Name | Parent Body | Active Window | Peak Date | Zenithal Hourly Rate (ZHR) | Radiant (RA / Dec) |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **Quadrantids** | 2003 EH1 | Dec 28 – Jan 12 | Jan 3–4 | 110 | $15.3\text{h} / +49^\circ$ |
| **Lyrids** | C/1861 G1 Thatcher | Apr 14 – Apr 30 | Apr 22–23 | 18 | $18.1\text{h} / +34^\circ$ |
| **Eta Aquariids** | 1P/Halley | Apr 19 – May 28 | May 5–6 | 50 | $22.5\text{h} / -1^\circ$ |
| **Perseids** | 109P/Swift-Tuttle | Jul 17 – Aug 24 | Aug 12–13 | 100 | $3.1\text{h} / +58^\circ$ |
| **Orionids** | 1P/Halley | Oct 2 – Nov 7 | Oct 21–22 | 20 | $6.3\text{h} / +16^\circ$ |
| **Leonids** | 55P/Tempel-Tuttle | Nov 6 – Nov 30 | Nov 17–18 | 15 | $10.1\text{h} / +22^\circ$ |
| **Geminids** | 3200 Phaethon | Dec 4 – Dec 17 | Dec 13–14 | 120 | $7.5\text{h} / +33^\circ$ |

---

## 3. References

- Detailed TLE retrieval & CelesTrak API format: [tle-and-iss.md](./references/tle-and-iss.md)
