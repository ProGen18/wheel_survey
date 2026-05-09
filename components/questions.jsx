// Question rendering components — one per kind
import React from 'react';
import { I18N } from './i18n';

const field = (q, name, lang) => {
  const key = name ? `${name}_${lang}` : lang;
  return q[key] != null ? q[key] : q[`${name}_en`];
};

const COUNTRIES = [
  "Afghanistan","Afrique du Sud","Albanie","Algérie","Allemagne","Andorre","Angola","Arabie Saoudite",
  "Argentine","Arménie","Australie","Autriche","Azerbaïdjan","Bahreïn","Bangladesh","Belgique",
  "Bénin","Biélorussie","Birmanie","Bolivie","Bosnie-Herzégovine","Botswana","Brésil","Brunei",
  "Bulgarie","Burkina Faso","Burundi","Cambodge","Cameroun","Canada","Chili","Chine","Chypre",
  "Colombie","Comores","Congo","Corée du Nord","Corée du Sud","Costa Rica","Côte d'Ivoire",
  "Croatie","Cuba","Danemark","Djibouti","Égypte","Émirats arabes unis","Équateur","Érythrée",
  "Espagne","Estonie","États-Unis","Éthiopie","Fidji","Finlande","France","Gabon","Gambie",
  "Géorgie","Ghana","Grèce","Guatemala","Guinée","Haïti","Honduras","Hongrie","Île Maurice",
  "Inde","Indonésie","Irak","Iran","Irlande","Islande","Israël","Italie","Jamaïque","Japon",
  "Jordanie","Kazakhstan","Kenya","Kirghizistan","Kosovo","Koweït","Laos","Lettonie","Liban",
  "Libye","Lituanie","Luxembourg","Macédoine du Nord","Madagascar","Malaisie","Mali","Malte",
  "Maroc","Mexique","Moldavie","Monaco","Mongolie","Monténégro","Mozambique","Namibie","Népal",
  "Nicaragua","Niger","Nigeria","Norvège","Nouvelle-Zélande","Oman","Ouganda","Ouzbékistan",
  "Pakistan","Panama","Paraguay","Pays-Bas","Pérou","Philippines","Pologne","Portugal","Qatar",
  "République dominicaine","République tchèque","Roumanie","Royaume-Uni","Russie","Rwanda",
  "Sénégal","Serbie","Singapour","Slovaquie","Slovénie","Somalie","Soudan","Sri Lanka","Suède",
  "Suisse","Suriname","Syrie","Tadjikistan","Taïwan","Tanzanie","Tchad","Thaïlande","Togo",
  "Tunisie","Turkménistan","Turquie","Ukraine","Uruguay","Venezuela","Vietnam","Yémen","Zambie",
  "Zimbabwe"
];

const Choice = ({ label, selected, onClick, idx, multi = false }) => (
  <button
    type="button"
    className={`choice ${multi ? "is-square" : ""} ${selected ? "is-selected" : ""}`}
    onClick={onClick}
  >
    <span className="choice-mark" />
    <span className="choice-label">{label}</span>
    {idx !== undefined && <span className="choice-idx">{idx}</span>}
  </button>
);

const SingleQuestion = ({ q, lang, value, onChange }) => {
  const opts = field(q, 'opts', lang);
  return (
    <div className="choices">
      {opts.map((label, i) => (
        <Choice
          key={i}
          label={label}
          selected={value === i}
          onClick={() => onChange(i)}
          idx={String(i + 1).padStart(2, "0")}
        />
      ))}
    </div>
  );
};

const MultiQuestion = ({ q, lang, value = [], onChange }) => {
  const opts = field(q, 'opts', lang);

  const isExclusive = (label) => {
    const l = label.toLowerCase().trim();
    return l === "autre" || l === "other" || l === "другое" || l === "其他" ||
           l === "je préfère ne pas répondre" || l === "prefer not to say" || l === "я предпочитаю не отвечать" || l === "我不想说" ||
           l === "aucun" || l === "none" || l === "ничего" || l === "无";
  };

  const toggle = (i) => {
    const label = opts[i];
    const has = value.includes(i);
    
    if (has) {
      // Uncheck
      onChange(value.filter(v => v !== i));
    } else {
      // Check
      if (isExclusive(label)) {
        // Selecting an exclusive option unchecks all others
        onChange([i]);
      } else {
        // Selecting a normal option removes any exclusive options
        const nextValue = value.filter(v => !isExclusive(opts[v]));
        onChange([...nextValue, i]);
      }
    }
  };

  return (
    <div className="choices">
      {opts.map((label, i) => (
        <Choice
          key={i}
          label={label}
          selected={value.includes(i)}
          onClick={() => toggle(i)}
          idx={String(i + 1).padStart(2, "0")}
          multi
        />
      ))}
    </div>
  );
};

// Clean Likert scale — 7 labeled dots on a track
export const LikertDial = ({ value, onChange, endsType = "12", lang }) => {
  const I = I18N[lang];
  const [lowKey, highKey] = endsType === "13"
    ? ["low3", "high3"]
    : endsType === "12"
      ? ["low2", "high2"]
      : ["low1", "high1"];
  const ticks = [1, 2, 3, 4, 5, 6, 7];
  return (
    <div className="likert-scale">
      <div className="likert-track" role="radiogroup">
        <div className="likert-line" />
        {ticks.map(t => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={value === t}
            className={`likert-dot ${value === t ? "is-selected" : ""}`}
            onClick={() => onChange(t)}
          >
            <span className="likert-dot-circle" />
            <span className="likert-dot-n">{t}</span>
          </button>
        ))}
      </div>
      <div className="likert-labels">
        <span>{I.scale_ends[lowKey]}</span>
        <span>{I.scale_ends[highKey]}</span>
      </div>
    </div>
  );
};

const LikertQuestion = ({ q, lang, value, onChange }) => {
  const endsType = q.ends || "12";
  return <LikertDial value={value} onChange={onChange} endsType={endsType} lang={lang} />;
};

const LikertMatrixQuestion = ({ q, lang, value = {}, onChange }) => {
  const rows = field(q, 'rows', lang);
  const I = I18N[lang];
  const [lowKey, highKey] = q.ends === "13"
    ? ["low3", "high3"]
    : q.ends === "12"
      ? ["low2", "high2"]
      : ["low1", "high1"];
  return (
    <div className="likert-matrix">
      <div className="likert-matrix-header">
        <span className="likert-matrix-stub" />
        <div className="likert-matrix-cols">
          {[1, 2, 3, 4, 5, 6, 7].map(t => (
            <span key={t} className="likert-matrix-col-n">{t}</span>
          ))}
        </div>
      </div>
      <div className="likert-matrix-labels">
        <span className="likert-matrix-stub" />
        <div className="likert-matrix-cols">
          <span className="likert-matrix-end-label">{I.scale_ends[lowKey]}</span>
          <span className="likert-matrix-end-label" style={{ textAlign: "right" }}>{I.scale_ends[highKey]}</span>
        </div>
      </div>
      {rows.map((stmt, i) => (
        <div key={i} className="likert-matrix-row">
          <span className="likert-matrix-stmt">{stmt}</span>
          <div className="likert-matrix-dots">
            <div className="likert-line" style={{ left: "18px", right: "18px" }} />
            {[1, 2, 3, 4, 5, 6, 7].map(t => (
              <button
                key={t}
                type="button"
                className={`likert-matrix-dot ${value[i] === t ? "is-selected" : ""}`}
                onClick={() => onChange({ ...value, [i]: t })}
              >
                <span className="likert-matrix-dot-inner" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const NumberQuestion = ({ q, lang, value, onChange }) => (
  <div className="text-field">
    <input
      type="number"
      value={value ?? ""}
      onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}
      placeholder="—"
    />
    <span className="suffix">{field(q, 'placeholder', lang)}</span>
  </div>
);

const YearQuestion = ({ q, lang, value, onChange }) => (
  <div className="text-field">
    <input
      type="number"
      min="2000"
      max="2026"
      value={value ?? ""}
      onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}
      placeholder="20—"
    />
    <span className="suffix">{{ fr: "année", en: "year", ru: "год", zh: "年份" }[lang] || "year"}</span>
  </div>
);

const TextQuestion = ({ q, lang, value, onChange }) => {
  const listId = q.key === 'country' ? 'country-list' : null;
  return (
    <div className="text-field">
      <input
        type="text"
        value={value ?? ""}
        onChange={e => onChange(e.target.value)}
        placeholder={field(q, 'placeholder', lang)}
        list={listId}
        autoComplete="off"
      />
      {listId && (
        <datalist id={listId}>
          {COUNTRIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      )}
    </div>
  );
};

export const QuestionRenderer = ({ q, lang, value, onChange }) => {
  switch (q.kind) {
    case "single": return <SingleQuestion q={q} lang={lang} value={value} onChange={onChange} />;
    case "multi": return <MultiQuestion q={q} lang={lang} value={value} onChange={onChange} />;
    case "likert": return <LikertQuestion q={q} lang={lang} value={value} onChange={onChange} />;
    case "likert-matrix": return <LikertMatrixQuestion q={q} lang={lang} value={value} onChange={onChange} />;
    case "number": return <NumberQuestion q={q} lang={lang} value={value} onChange={onChange} />;
    case "year": return <YearQuestion q={q} lang={lang} value={value} onChange={onChange} />;
    case "text": return <TextQuestion q={q} lang={lang} value={value} onChange={onChange} />;
    default: return null;
  }
};

// Check whether a question has a valid answer (for progress + unlock logic)
export const isAnswered = (q, v) => {
  if (v === null || v === undefined) return false;
  if (q.kind === "multi") return Array.isArray(v) && v.length > 0;
  if (q.kind === "likert-matrix") {
    const rows = (q.rows_en || []).length;
    return v && Object.keys(v).length >= rows;
  }
  if (q.kind === "text") return typeof v === "string" && v.trim().length > 0;
  return true;
};

export const QuestionBlock = ({ q, qNum, lang, value, onChange, grouped = false }) => {
  const title = q[lang] != null ? q[lang] : q.en;
  const hint = field(q, 'hint', lang);
  const groupEyebrow = field(q, 'group_eyebrow', lang);
  return (
    <div className="q">
      <div className="q-num">{qNum || q.id}</div>
      <div className="q-body">
        {groupEyebrow && <span className="eyebrow" style={{ color: "var(--ember)" }}>{groupEyebrow}</span>}
        <h3 className="h-q">{title}</h3>
        {hint && <span className="q-hint">↳ {hint}</span>}
        <QuestionRenderer q={q} lang={lang} value={value} onChange={onChange} />
      </div>
    </div>
  );
};

