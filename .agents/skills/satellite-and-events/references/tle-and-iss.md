# Two-Line Element Sets (TLE) & ISS Tracking Reference

This reference describes how to obtain and update orbital elements for Earth-orbiting satellites.

---

## 1. CelesTrak TLE Endpoints

CelesTrak publishes updated NORAD two-line element sets every few hours.

### 1.1 Live Stations (ISS & Tiangong)
- **URL**: `https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle`
- Returns text with sets of 3 lines per satellite:
  1. Satellite name (e.g. `ISS (ZARYA)`)
  2. Line 1: Catalog number, epoch, mean motion derivatives.
  3. Line 2: Inclination, RA of ascending node, eccentricity, argument of perigee, mean anomaly, mean motion.

### 1.2 Brightest Satellites (Visual Observing)
- **URL**: `https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle`

---

## 2. Example TLE Format
```text
ISS (ZARYA)
1 25544U 98067A   26239.51234567  .00016717  00000+0  30000-3 0  9993
2 25544  51.6415 160.1234 0006789  85.4321 274.5678 15.49876543456789
```

---

## 3. Propagation Best Practices
- **TLE Age**: TLEs for low-Earth orbit (LEO) satellites degrade after 2–3 days due to atmospheric drag. Always cache TLEs with a TTL of 6–12 hours.
- **Elevation Threshold**: For high visibility to naked eye, filter for passes with $\text{maxAltitude} \ge 25^\circ - 30^\circ$. Passes below $20^\circ$ are often obscured by buildings, trees, or atmospheric haze.
- **Sun Elevation**: The observer must be in darkness ($\text{Sun Alt} \le -6^\circ$), while the satellite at $400\text{ km}$ altitude must be sunlit.
