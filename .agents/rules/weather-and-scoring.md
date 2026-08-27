# Weather Integration & Observational Scoring Rules

These rules govern how meteorological variables are interpreted, scored, and clustered into actionable stargazing itineraries.

---

## 1. Meteorological Variables & Sources

### 1.1 Open-Meteo API Fields
- `cloudcover` ($0 - 100\%$): Total cloud fraction.
- `cloudcover_low`, `cloudcover_mid`, `cloudcover_high` ($0 - 100\%$): Layer-specific cloud fractions.
  - *Note*: High thin cirrus clouds cause haloing and dimming, whereas low stratocumulus completely blocks the sky.
- `visibility` (meters): Atmospheric horizontal transparency ($> 15,000\text{ m}$ indicates high transparency).
- `windspeed_10m` ($\text{km/h}$ or $\text{m/s}$): Surface wind speed ($> 25\text{ km/h}$ degrades telescope stability and induces ground-layer turbulence).
- `relative_humidity_2m` ($0 - 100\%$): High humidity ($> 85\%$) risks lens dew and ground fog.
- `dew_point_2m` vs `temperature_2m`: Dew depression ($\Delta T = T - T_{\text{dew}}$). When $\Delta T < 2^\circ\text{C}$, condensation risk is high.

### 1.2 Meteoblue Seeing Index (v3 Expansion)
- `seeing_1` (arcseconds) & `seeing_2`: Atmospheric turbulence and wavefront distortion.
- `jetstream_speed` ($\text{m/s}$): High jet stream speeds ($> 30\text{ m/s}$) correlate with rapid planetary scintillation (twinkling) and poor high-magnification seeing.

---

## 2. Hourly Stargazing Quality Score ($S$)

Every hour $t$ in a night forecast is assigned a composite score $S(t) \in [0, 100]$.

### 2.1 Formula Breakdown

$$S(t) = \text{clamp}\Big(B(t) + W_{\text{cloud}}(t) + W_{\text{dark}}(t) + W_{\text{moon}}(t) + W_{\text{transparency}}(t) + W_{\text{targets}}(t), \, 0, \, 100\Big)$$

Where:

1. **Base Score ($B = 50$)**
2. **Cloud Cover Weight ($W_{\text{cloud}}$)**:
   - $\text{Cloud} \le 10\%$: $+25$
   - $10\% < \text{Cloud} \le 25\%$: $+15$
   - $25\% < \text{Cloud} \le 40\%$: $0$
   - $40\% < \text{Cloud} \le 60\%$: $-30$
   - $\text{Cloud} > 60\%$: Score forced to $0$ immediately (overcast).
3. **Sky Darkness / Solar Depression ($W_{\text{dark}}$)**:
   - Sun altitude $h_\odot > -6^\circ$: Score forced to $0$ (day/civil twilight).
   - $-6^\circ \ge h_\odot > -12^\circ$: $-15$ (nautical twilight; bright planets only).
   - $-12^\circ \ge h_\odot > -18^\circ$: $+10$ (astronomical twilight).
   - $h_\odot \le -18^\circ$: $+20$ (true dark night).
4. **Moon Sky-Glow Penalty ($W_{\text{moon}}$)**:
   - If Moon is below horizon ($h_{\text{moon}} \le 0^\circ$): $+15$ (natural dark sky).
   - If Moon is above horizon ($h_{\text{moon}} > 0^\circ$):
     - Illumination $k \le 0.15$: $+10$
     - $0.15 < k \le 0.40$: $0$
     - $0.40 < k \le 0.70$: $-15$
     - $k > 0.70$: $-25$ (bright moonlight penalty).
5. **Atmospheric Transparency & Stability ($W_{\text{transparency}}$)**:
   - Visibility $> 20,000\text{ m}$ & Wind $< 15\text{ km/h}$: $+10$
   - Visibility $< 8,000\text{ m}$ or Wind $> 30\text{ km/h}$: $-15$
6. **Active Celestial Targets Bonus ($W_{\text{targets}}$)**:
   - Prime planets (Saturn/Jupiter/Mars) with altitude $> 30^\circ$: $+5$ per visible planet (up to $+15$).
   - ISS high-elevation pass during the hour: $+10$.
   - Major meteor shower active radiant above $30^\circ$: $+10$.

---

## 3. Window Clustering Algorithm

To turn discrete hourly scores into continuous, human-actionable viewing windows:

1. **Threshold Filtering**:
   - An hour is designated **Eligible** if $S(t) \ge 60$ and $\text{Cloud} \le 40\%$ and $h_\odot \le -10^\circ$.
2. **Contiguous Grouping**:
   - Merge consecutive eligible hours $[t_1, t_2, \dots, t_n]$ into a single window: $\text{Window}(\text{start} = t_1, \text{end} = t_n)$.
   - Minimum Window Duration: Single 1-hour windows are valid if score is high ($S \ge 75$), but windows $\ge 2\text{ hours}$ are preferred.
3. **Window Metadata Aggregation**:
   - Calculate Average Cloud Cover, Mean Score, and Peak Seeing Hour within each window.
   - Compile all visible celestial objects that maintain altitude $> 20^\circ$ for at least 30 minutes during the window.
4. **Summary & Narrative Generation**:
   - Produce concise time-stamped sentences:
     - *"Thursday 21:00–23:30 will have: 8% cloud cover, low moonlight, Saturn at 47° altitude, Milky Way visible, excellent seeing conditions"*
