# POTA Stats WordPress Block

A light-weight Gutenberg block for WordPress that displays **Parks on the Air (POTA)** statistics for managed operator callsigns.

---

## Features

- **Live POTA API Integration**: Fetches real-time activator/hunter statistics, QSOs, and award counts via `https://api.pota.app/stats/user/{callsign}`.
- **Client-Side Caching**: Uses browser `localStorage` with a configurable cache duration (1-72 hours) to avoid hitting POTA API limits.
- **Interactive Sorting**: Users can click any table column header to sort by callsign, activations, parks, QSOs, or awards.
- **Summary Total Row**: Pinned `tfoot` row dynamically sums all stats across configured callsigns.
- **Direct POTA Links**: Operator callsigns link directly to your custom detailed POTA stats dashboard (`pota-stats.wd4dan.net`).
- **Gutenberg Block Controls**: Manage callsign lists and cache settings directly in the post editor inspector panel.

---

## Installation

1. Download the plugin code [pota-stats-wordpress-block.zip](https://github.com/w0yl/pota-stats-wordpress-block/releases/latest/download/pota-stats-wordpress-block.zip) from the [latest release](https://github.com/w0yl/pota-stats-wordpress-block/releases/latest).
2. Log in to your WordPress Dashboard and navigate to **Plugins --> Add Plugins --> Upload Plugin** and choose the downloaded plugin.
3. Activate **POTA Stats Block**.

---

## Configuration & Usage

Edit any page or post, search for **POTA Stats** in the block inserter, and add it to your layout.

When you select the block in the Gutenberg editor, use the **Block Inspector Settings** in the right sidebar:

1. **Managed Callsigns**:
   - Enter a callsign (e.g., `AE0S`) into the text box and click **Add**.
   - By default, new blocks start with an empty list (`[]`).
   - Remove callsigns anytime by clicking the **x** button next to their name.
2. **Cache Duration**:
   - Adjust the slider between **1 and 72 hours** (default: `12` hours). This determines how long client browsers keep API data in `localStorage` before re-fetching.

---

## Requirements

- **WordPress:** 6.0+
- **PHP:** 7.4+
- **Theme:** Any Gutenberg-compatible theme (e.g., Twenty Twenty-Five).

---

## License
The code has been Licensed under GNU GPLv2.