/**
 * Shared chart palette for admin/stats panel.
 *
 * Designed to keep the orange brand accent for the first slot and rotate
 * through clearly-distinct hues afterwards (teal, violet, blue, amber, green,
 * pink, slate). Avoids two adjacent oranges that read as "same colour" at a
 * glance — which was the previous issue.
 */

export const CATEGORY_PALETTE = [
  '#d94d1a', // 1. orange brand
  '#1e4a47', // 2. teal sombre
  '#8b5cf6', // 3. violet
  '#3b82f6', // 4. bleu
  '#f59e0b', // 5. ambre
  '#10b981', // 6. émeraude
  '#ec4899', // 7. rose
  '#5ba8a1', // 8. teal clair
  '#6366f1', // 9. indigo
  '#84cc16', // 10. lime
];

/**
 * Diverging palette for likert-style heatmaps:
 * 1 (strongly disagree) — red → 4 (neutral) — gray → 7 (strongly agree) — teal.
 */
export const DIVERGING_RAMP = [
  '#c1373a', // 1
  '#dd6c4d', // 2
  '#e8a577', // 3
  '#e8e1d4', // 4
  '#9bc6c0', // 5
  '#5a9690', // 6
  '#1e4a47', // 7
];

/** Sequential ramp for ordinal data without polarity (e.g. "0 km → 200 km"). */
export const SEQUENTIAL_RAMP = [
  '#fce7d4',
  '#f9c896',
  '#f0985a',
  '#e87235',
  '#d94d1a',
  '#a83612',
  '#762209',
];

/** Group colours for the 3-way MCI radar comparison. */
export const COMPARATIVE_COLORS = ['#d94d1a', '#1e4a47', '#8b5cf6'];

/** For Q1 routing distribution — semantic mapping (active=warm, former=neutral, non-user=cool). */
export const FILTER_VALUE_COLORS = {
  reg: '#d94d1a',     // orange — actifs
  occ: '#f59e0b',     // ambre — occasionnels
  ex: '#8b5cf6',      // violet — anciens
  curious: '#3b82f6', // bleu — curieux
  never: '#1e4a47',   // teal — jamais
  skip: '#94a3b8',    // gris — sans réponse
};

/** Cross-tab profile colours (consistent with FILTER_VALUE_COLORS). */
export const PROFILE_COLORS_BY_KEY = FILTER_VALUE_COLORS;

/** Pick the i-th colour, wrapping around. */
export function pickColor(i, palette = CATEGORY_PALETTE) {
  return palette[i % palette.length];
}

/**
 * Build a per-bar color array based on an ordered palette.
 * Used for single-series bar charts where each bar is a different category.
 */
export function colorize(data, palette = CATEGORY_PALETTE) {
  return data.map((_, i) => pickColor(i, palette));
}
