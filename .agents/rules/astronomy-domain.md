# Astronomy Domain Rules & Mathematical Standards

These rules define the physical and astronomical constraints for calculations across the Stargazer codebase.

---

## 1. Coordinate Systems & Definitions

### 1.1 Equatorial Coordinates (J2000)
- **Right Ascension ($\alpha$ or RA)**: Measured in sidereal hours $[0, 24\text{h})$ or degrees $[0^\circ, 360^\circ)$.
- **Declination ($\delta$ or Dec)**: Measured in degrees $[-90^\circ, +90^\circ]$ relative to the celestial equator.

### 1.2 Horizontal (Topocentric) Coordinates
- **Altitude ($h$ or Alt)**: Angle above the local horizon $[-90^\circ, +90^\circ]$. $0^\circ$ is true horizon, $+90^\circ$ is zenith, $-90^\circ$ is nadir.
- **Azimuth ($A$ or Az)**: Angle along the horizon measured clockwise from North ($0^\circ = \text{North}, 90^\circ = \text{East}, 180^\circ = \text{South}, 270^\circ = \text{West}$).
- **Refraction**: Always enable `"normal"` atmospheric refraction correction when computing altitude for human observation.

---

## 2. Sun & Twilight Thresholds

Stargazing quality strongly depends on the Sun's depression angle below the local geometric horizon:

| Twilight Stage | Solar Altitude Range | Observable Targets & Sky Brightness |
| :--- | :--- | :--- |
| **Daylight** | $> 0^\circ$ | Sun only (or Venus with extreme precision). |
| **Civil Twilight** | $0^\circ \ge h_\odot > -6^\circ$ | Horizon clearly defined. Brightest planets (Venus, Jupiter) and Moon visible. Stargazing score $= 0$. |
| **Nautical Twilight** | $-6^\circ \ge h_\odot > -12^\circ$ | Horizon still discernible against sky. Major navigation stars (mag $< 2$) visible. Planetary viewing begins. |
| **Astronomical Twilight** | $-12^\circ \ge h_\odot > -18^\circ$ | Sky is dark to casual eye. Moderate DSOs and constellations clear. |
| **True Night (Astronomical Darkness)** | $h_\odot \le -18^\circ$ | Complete absence of solar sky illumination. Milky Way, faint nebulae, and mag $6+$ stars visible under dark skies. |

> **Rule**: Stargazing windows should only open when $h_\odot < -10^\circ$ (for bright planets) and $h_\odot < -14^\circ$ to $-18^\circ$ (for full DSO itineraries).

---

## 3. Moon Phase, Illumination & Sky Glow

The Moon is the single greatest natural light pollutant for deep-sky stargazing:

1. **Moon Altitude ($h_{\text{moon}}$)**:
   - If $h_{\text{moon}} \le 0^\circ$: The Moon is below the horizon; lunar sky glow is $0\%$.
2. **Phase Fraction ($k$) & Phase Angle ($\Phi$)**:
   - $k = 0.0$ ($\Phi = 180^\circ$): New Moon (optimal dark skies all night).
   - $k \le 0.25$: Crescent Moon (minimal sky glow, sets early or rises late).
   - $k = 0.50$: Quarter Moon (half illuminated).
   - $k \ge 0.75$: Gibbous Moon (washes out nebulae, galaxies, and Milky Way).
   - $k = 1.0$ ($\Phi = 0^\circ$): Full Moon (deep-sky observing impossible; ideal only for lunar observing and bright planets).
3. **Lunar Separation**:
   - Celestial objects located $< 30^\circ$ from an illuminated Moon suffer heavy local glare.

---

## 4. Atmospheric Extinction & Altitude Brackets

Light traveling through Earth's atmosphere undergoes scattering (Rayleigh & aerosol) and dispersion:

$$\text{Air Mass } X \approx \frac{1}{\sin(h) + 0.00186 \cdot (h + 3.829)^{-1.253}}$$

- **Altitude $< 15^\circ$**: Poor quality. Air mass $X > 3.8$. Severe turbulence, horizon haze, and local obstruction. Do not recommend faint objects in this zone.
- **Altitude $15^\circ - 30^\circ$**: Fair quality. Air mass $X \approx 2.0 - 3.8$. Suitable for bright planets (Jupiter, Saturn) and bright stars.
- **Altitude $30^\circ - 60^\circ$**: Good to great quality. Air mass $X \approx 1.15 - 2.0$.
- **Altitude $> 60^\circ$**: Prime / Zenith viewing. Air mass $X \approx 1.0 - 1.15$. Best atmospheric clarity and minimal scintillation.

---

## 5. Light Pollution & The Bortle Scale

The Bortle Scale (Class 1–9) estimates the naked-eye limiting magnitude (NELM) and visibility of astronomical phenomena:

| Bortle Class | Sky Description | NELM | DSO / Milky Way Visibility |
| :---: | :--- | :---: | :--- |
| **Class 1** | Excellent Dark Sky | 7.6–8.0 | Milky Way casts shadows; M33 direct vision; Zodiacal light bright. |
| **Class 2** | Truly Dark Site | 7.1–7.5 | Highly structured Milky Way; M31 easily seen naked-eye. |
| **Class 3** | Rural Sky | 6.6–7.0 | Milky Way still complex; faint clouds on horizon. |
| **Class 4** | Rural/Suburban Transition | 6.1–6.5 | Milky Way visible above horizon; light domes moderate. |
| **Class 5** | Suburban Sky | 5.6–6.0 | Milky Way washed out near horizon; M31 faint smudge. |
| **Class 6** | Bright Suburban | 5.1–5.5 | Milky Way only visible near zenith; DSOs need telescope. |
| **Class 7** | Suburban/Urban Transition | 4.6–5.0 | Sky has strong grayish tint; only brightest DSOs visible. |
| **Class 8–9** | City / Inner-City Sky | 4.0–4.5 | Only Moon, planets, and brightest stars (mag $\le 2$) visible. |
