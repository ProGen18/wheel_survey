/**
 * Build a CSV row following RFC 4180.
 * Arrays and objects are stringified and escaped.
 */
export function buildCSVRow(values) {
  return values.map(escapeCSV).join(',');
}

function escapeCSV(val) {
  if (val == null) return '';
  let str = String(val);
  if (typeof val === 'object') {
    str = JSON.stringify(val);
  }
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

const MATRIX_FIELDS = {
  comparison: ['faster', 'flexible', 'convenient', 'safer', 'eco', 'value'],
  limitingFactors: ['price', 'learning', 'safety', 'regulation', 'infrastructure'],
  hedonic: ['pleasure', 'stimulation', 'joy'],
  instrumental: ['proven', 'risk', 'breadth'],
  socialMci: ['discussion', 'early', 'peer', 'community'],
  symbolic: ['personality', 'image', 'identity', 'originality'],
  cognitive: ['complex', 'time', 'difficult'],
  perception: ['hard', 'dangerous', 'useful', 'expensive'],
};

/**
 * Flatten matrix JSON fields into individual columns.
 * { faster: 2 } → comparison_faster: 2
 */
export function flattenMatrixFields(row) {
  const flat = { ...row };
  for (const [field, keys] of Object.entries(MATRIX_FIELDS)) {
    const val = row[field];
    if (val && typeof val === 'object') {
      for (const key of keys) {
        flat[`${field}_${key}`] = val[key] ?? null;
      }
    } else {
      for (const key of keys) {
        flat[`${field}_${key}`] = null;
      }
    }
  }
  return flat;
}

/**
 * Array fields we want to stringify.
 */
export const ARRAY_FIELDS = ['discovChannels', 'protections', 'barriers'];

/**
 * Build all column names for the CSV header.
 */
export function buildExportColumns(withParentCode = true) {
  const base = [
    'code', 'lang', 'filterValue', 'parentCode',
    'startedAt', 'completedAt',
    'discovChannels', 'socialExposure',
    'adoptYear', 'acquisitionMode', 'priceCat', 'adoptDelay', 'discount',
    'learningTime', 'tutorials', 'learningDifficulty',
    'weeklyDistance', 'mainUse', 'transportReplace', 'carAccess',
    ...MATRIX_FIELDS.comparison.map((k) => `comparison_${k}`),
    ...MATRIX_FIELDS.limitingFactors.map((k) => `limitingFactors_${k}`),
    'protections', 'regulationStatus', 'regulationInfluence', 'regulationRenounced',
    'socialCircle', 'groupRides', 'onlineCommunity',
    ...MATRIX_FIELDS.perception.map((k) => `perception_${k}`),
    'futureLikelihood', 'barriers',
    ...MATRIX_FIELDS.hedonic.map((k) => `hedonic_${k}`),
    ...MATRIX_FIELDS.instrumental.map((k) => `instrumental_${k}`),
    ...MATRIX_FIELDS.socialMci.map((k) => `socialMci_${k}`),
    ...MATRIX_FIELDS.symbolic.map((k) => `symbolic_${k}`),
    ...MATRIX_FIELDS.cognitive.map((k) => `cognitive_${k}`),
    'age', 'gender', 'country', 'citySize', 'occupation', 'income',
  ];
  return withParentCode ? base : base.filter((c) => c !== 'parentCode');
}

export function buildCSVExportRow(row, parentCode, columns) {
  const flat = flattenMatrixFields(row);
  const rowData = {
    code: row.node?.code,
    lang: row.node?.lang,
    filterValue: row.filterValue,
    parentCode: parentCode || null,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    ...flat,
  };
  return buildCSVRow(columns.map((col) => rowData[col]));
}
