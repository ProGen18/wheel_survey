/**
 * Resolves option-index → readable label and FilterValue → readable label.
 *
 * Background: the survey form saves single/multi answers as the option index
 * (0-based) coerced to string. Likert-matrix answers are saved as { rowIndex: rating }.
 * The /api/admin/stats/full endpoint returns those raw keys verbatim, so the UI
 * sees "0, 1, 2…" instead of "Oui / Non / …". This module rewires the labels
 * using the SURVEY definition.
 */

import { SURVEY } from '../components/survey-data';

const FILTER_LABELS = {
  fr: { reg: 'Réguliers', occ: 'Occasionnels', ex: 'Anciens', curious: 'Curieux', never: 'Jamais', skip: 'Sans réponse' },
  en: { reg: 'Regular', occ: 'Occasional', ex: 'Former', curious: 'Curious', never: 'Never', skip: 'Skipped' },
};

const GENDER_LABELS = {
  fr: { '0': 'Homme', '1': 'Femme', '2': 'Autre', '3': 'Sans réponse' },
  en: { '0': 'Man', '1': 'Woman', '2': 'Other', '3': 'No answer' },
};

const COMMON_BOOL_LABELS = {
  fr: { '0': 'Oui', '1': 'Non', '2': 'Sans réponse' },
  en: { '0': 'Yes', '1': 'No', '2': 'No answer' },
};

const LIKERT_3PT_LABELS = {
  fr: { '1': 'Très facile', '2': 'Modéré', '3': 'Très difficile' },
  en: { '1': 'Very easy', '2': 'Moderate', '3': 'Very hard' },
};

const LIKERT_7PT_DIFFICULTY = {
  fr: { '1': '1 — Très facile', '2': '2', '3': '3', '4': '4 — Moyen', '5': '5', '6': '6', '7': '7 — Très difficile' },
  en: { '1': '1 — Very easy', '2': '2', '3': '3', '4': '4 — Moderate', '5': '5', '6': '6', '7': '7 — Very hard' },
};

const LIKERT_7PT_AGREE = {
  fr: { '1': '1 — Désaccord', '2': '2', '3': '3', '4': '4 — Neutre', '5': '5', '6': '6', '7': '7 — Accord' },
  en: { '1': '1 — Disagree', '2': '2', '3': '3', '4': '4 — Neutral', '5': '5', '6': '6', '7': '7 — Agree' },
};

const LIKERT_7PT_INTENSITY = {
  fr: { '1': '1 — Pas du tout', '2': '2', '3': '3', '4': '4 — Moyen', '5': '5', '6': '6', '7': '7 — Très fortement' },
  en: { '1': '1 — Not at all', '2': '2', '3': '3', '4': '4 — Moderate', '5': '5', '6': '6', '7': '7 — Very much' },
};

/**
 * Build a fast lookup: { questionKey: [labels by index] } for the given lang.
 * Pulls opts_<lang> from SURVEY.parts[].questions[].
 */
function buildOptionMap(lang) {
  const map = {};
  for (const part of SURVEY.parts) {
    for (const q of part.questions) {
      const opts = q[`opts_${lang}`] || q.opts_en;
      if (Array.isArray(opts)) map[q.key] = opts;
    }
  }
  return map;
}

/**
 * Build a row-label lookup for likert-matrix questions:
 * { matrixFieldKey: [rowLabels by index] }
 */
function buildMatrixRowMap(lang) {
  const map = {};
  for (const part of SURVEY.parts) {
    for (const q of part.questions) {
      if (q.kind !== 'likert-matrix') continue;
      const rows = q[`rows_${lang}`] || q.rows_en;
      if (Array.isArray(rows)) {
        // Note: SURVEY uses key="social" for the MCI Social matrix but DB stores "socialMci"
        const key = q.key === 'social' ? 'socialMci' : q.key;
        map[key] = rows;
      }
    }
  }
  return map;
}

const optMapCache = {};
const matrixMapCache = {};

function getOptionMap(lang) {
  if (!optMapCache[lang]) optMapCache[lang] = buildOptionMap(lang);
  return optMapCache[lang];
}

function getMatrixRowMap(lang) {
  if (!matrixMapCache[lang]) matrixMapCache[lang] = buildMatrixRowMap(lang);
  return matrixMapCache[lang];
}

/**
 * Translate a stats-API frequency array for a single/multi question.
 * Input rows: [{ key: "0" | "1", label, count }] → [{ name: "Oui", value }]
 * Falls back to raw key when index is out of range.
 */
export function labelFreq(arr, questionKey, lang = 'fr') {
  if (!Array.isArray(arr)) return [];
  const opts = getOptionMap(lang)[questionKey];
  return arr
    .map((d) => {
      const idx = Number(d.key ?? d.label);
      const name = opts && Number.isInteger(idx) && opts[idx] != null
        ? opts[idx]
        : (d.label || String(d.key));
      return { name, value: d.count ?? d.value ?? 0, rawKey: d.key };
    })
    .filter((d) => d.name != null && d.value > 0);
}

/**
 * Translate the q1Dist array (filterValue → readable name).
 * Input: [{ name: "reg" | "occ" | …, value }]
 */
export function labelFilterValue(arr, lang = 'fr') {
  const dict = FILTER_LABELS[lang] || FILTER_LABELS.fr;
  if (!Array.isArray(arr)) return [];
  return arr.map((d) => ({ name: dict[d.name] || d.name, value: d.value }));
}

/** Gender uses dedicated mapping (in case opts_<lang> ordering differs). */
export function labelGender(arr, lang = 'fr') {
  const dict = GENDER_LABELS[lang];
  return labelFreqWithDict(arr, dict);
}

function labelFreqWithDict(arr, dict) {
  if (!Array.isArray(arr)) return [];
  return arr.map((d) => ({ name: dict[d.key] || d.label || d.key, value: d.count ?? d.value ?? 0 }));
}

/**
 * Likert (single, 7-pt) labels — for learningDifficulty.
 */
export function labelLikertDifficulty(arr, lang = 'fr') {
  const dict = LIKERT_7PT_DIFFICULTY[lang];
  return labelFreqWithDict(arr, dict);
}

/**
 * Get the rows for a likert-matrix field. Returns [{ key: "0", label }, …].
 */
export function getMatrixRows(matrixFieldKey, lang = 'fr') {
  const rows = getMatrixRowMap(lang)[matrixFieldKey];
  if (!Array.isArray(rows)) return [];
  return rows.map((label, i) => ({ key: String(i), label }));
}

/**
 * Build the 7 column definitions for a likert-matrix heatmap.
 * type: 'agree' | 'difficulty' | 'intensity'
 */
export function getMatrixCols(type = 'intensity', lang = 'fr') {
  const dict = type === 'agree' ? LIKERT_7PT_AGREE[lang]
    : type === 'difficulty' ? LIKERT_7PT_DIFFICULTY[lang]
    : LIKERT_7PT_INTENSITY[lang];
  return [1, 2, 3, 4, 5, 6, 7].map((v) => ({ key: String(v), label: dict[String(v)] }));
}

/**
 * Sort an already-labeled array by an explicit option ordering (preserves
 * survey-data order, putting "Don't know / Prefer not to say" last).
 */
export function sortByOptionOrder(arr, questionKey, lang = 'fr') {
  const opts = getOptionMap(lang)[questionKey];
  if (!Array.isArray(opts)) return arr;
  const order = new Map(opts.map((o, i) => [o, i]));
  return [...arr].sort((a, b) => {
    const ia = order.get(a.name);
    const ib = order.get(b.name);
    if (ia == null) return 1;
    if (ib == null) return -1;
    return ia - ib;
  });
}

export const FILTER_VALUE_LABELS = FILTER_LABELS;
