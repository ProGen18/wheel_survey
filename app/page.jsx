// Main survey app — hero, filter gate, progressive section reveal, end card.

"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { I18N } from '../components/i18n';
import { SURVEY, getActiveParts } from '../components/survey-data';
import { WheelLogo, HeroWheel, Arrow, Sprocket, StampMark } from '../components/icons';
import { QuestionBlock, isAnswered } from '../components/questions';
import { useTweaks, TweaksPanel, TweakSection, TweakRadio } from '../components/tweaks-panel';


/* ---------------- PROGRESS RING ---------------- */

const ProgressRing = ({ pct, label, visible }) => {
  const R = 34;
  const C = 2 * Math.PI * R;
  const offset = C - pct / 100 * C;
  return (
    <div className={`progress-ring ${visible ? "is-visible" : ""}`}>
      <svg viewBox="0 0 76 76">
        <circle className="track" cx="38" cy="38" r={R} />
        <circle className="bar" cx="38" cy="38" r={R} strokeDasharray={C} strokeDashoffset={offset} />
      </svg>
      <div className="inner">
        <div className="pct">{Math.round(pct)}%</div>
        <div className="lbl">{label}</div>
      </div>
    </div>);

};

/* ---------------- TOPBAR ---------------- */

const TopBar = ({ visible, lang, pct, filterValue }) => {
  const I = I18N[lang];
  const routeLabel = filterValue ?
    I.filter.opts.find((o) => o.k === filterValue)?.t :
    I.meta.intl;
  return (
    <div className={`topbar ${visible ? "is-visible" : ""}`}>
      <span><span className="tb-dot" />{I.meta.pub} — {I.meta.date}</span>
      <span style={{ fontWeight: 600, color: "var(--ink)" }}>{routeLabel}</span>
      <span>{I.progress_label} · {Math.round(pct)}%</span>
    </div>);

};

/* ---------------- QUESTION WITH MASCOT (inline, alternating) ---------------- */



const Reveal = ({ children, stagger = false, active = true, id }) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!active) { setInView(false); return; }
    const el = ref.current;
    if (!el) return;
    // Immediate fallback for cross-origin iframes where IO may not fire.
    const t = setTimeout(() => setInView(true), 80);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting || !entry.rootBounds) {
          setInView(true);
          io.disconnect();
          clearTimeout(t);
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => { io.disconnect(); clearTimeout(t); };
  }, [active]);
  return (
    <div
      ref={ref}
      id={id}
      className={`${stagger ? "reveal-stagger" : "reveal"} ${inView ? "is-in" : ""}`}>

      {children}
    </div>);

};

/* ---------------- HERO ---------------- */

const Hero = ({ lang, onBegin }) => {
  const I = I18N[lang];
  return (
    <section className="hero stage">
      <div className="hero-top">
        <div className="hero-mark">
          <div className="logo-wheel"><WheelLogo size={42} spinning /></div>
          <div>
            <div className="name">Gyroroue</div>
            <div className="sub">{I.meta.intl}</div>
          </div>
        </div>
        <div className="hero-meta">
          <span className="meta">{I.meta.pub} · {I.meta.date}</span>
          <span className="meta">{I.meta.wave} · {I.meta.privacy}</span>
        </div>
      </div>

      <div className="hero-body">
        <div className="hero-title">
          <div className="kicker">
            <span className="rule" />
            <span className="eyebrow">{I.hero.kicker}</span>
          </div>
          <h1 className="display-xl">
            {I.hero.title_pre} <em style={{ color: "var(--ember)", fontStyle: "italic" }}>{I.hero.title_em}</em>{" "}
            <em>{I.hero.title_post}</em>
          </h1>
          <p className="lede" style={{ marginTop: "1.75rem" }}>{I.hero.sub}</p>
          <p className="meta" style={{ marginTop: "1rem" }}>{I.hero.authors}</p>
          <div style={{ marginTop: "2.5rem", display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            <button className="btn" onClick={onBegin}>
              {I.hero.begin} <Arrow />
            </button>
            <span className="meta" style={{ maxWidth: "28ch" }}>{I.hero.begin_sub}</span>
          </div>
        </div>
        <div className="hero-art">
          <HeroWheel />
        </div>
      </div>

      <div className="hero-foot">
        <div className="hero-stat"><div className="k">{I.hero.s_time_v}</div><div className="v">{I.hero.s_time}</div></div>
        <div className="hero-stat"><div className="k">{I.hero.s_q_v}</div><div className="v">{I.hero.s_q}</div></div>
        <div className="hero-stat"><div className="k">{I.hero.s_p_v}</div><div className="v">{I.hero.s_p}</div></div>
      </div>
    </section>);

};

/* ---------------- FILTER SECTION ---------------- */

const FilterSection = ({ lang, value, onChange, onContinue, onGoBack }) => {
  const I = I18N[lang];
  const activeParts = value ? getActiveParts(value) : [];
  const btnRef = useRef(null);

  useEffect(() => {
    if (value && btnRef.current) {
      setTimeout(() => {
        btnRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [value]);
  return (
    <section id="filter" className="section stage">
      <Reveal stagger>
        <div className="sec-head">
          <div className="numeral">◷</div>
          <div>
            <div className="eyebrow">{I.filter.eyebrow}</div>
            <h2 className="h-section">
              {I.filter.title}{" "}
              <em style={{ fontStyle: "italic", color: "var(--ember)" }}>{I.filter.title_em}</em>
            </h2>
            <p className="desc">{I.filter.desc}</p>
          </div>
        </div>

        <div className="q">
          <div className="q-num">Q1</div>
          <div className="q-body">
            <h3 className="h-q">{I.filter.q}</h3>
            <div className="choices" style={{ maxWidth: 580 }}>
              {I.filter.opts.map((o, i) =>
                <button
                  key={o.k}
                  type="button"
                  className={`choice ${value === o.k ? "is-selected" : ""}`}
                  onClick={() => onChange(o.k)}>

                  <span className="choice-mark" />
                  <span className="choice-label">{o.l}</span>
                  <span className="choice-idx">{o.t}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {value &&
          <div ref={btnRef} style={{ marginTop: "2rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <button className="btn btn-ghost" onClick={onGoBack}>
              ← {I.back}
            </button>
            <button className="btn" onClick={onContinue}>
              {I.next} <Arrow />
            </button>
          </div>
        }
      </Reveal>
    </section>);

};

/* ---------------- PART SECTION ---------------- */

const PartSection = ({ part, lang, answers, onAnswer, partMeta, onAdvance, onGoBack, isActive, showAdvance, isLastPart, questionOffset = 0 }) => {
  const I = I18N[lang];
  const btnRef = useRef(null);

  useEffect(() => {
    if (showAdvance && btnRef.current) {
      setTimeout(() => {
        btnRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [showAdvance]);

  return (
    <section className="section stage">
      <Reveal stagger>
        {partMeta && (
          <div className="sec-head">
            <div className="numeral">{partMeta.num}</div>
            <div>
              <div className="eyebrow">{I.section_eyebrow} {partMeta.num}</div>
              <h2 className="h-section">{partMeta.title}</h2>
              <p className="desc">{partMeta.desc}</p>
            </div>
          </div>
        )}
        <div>
          {part.questions.map((q, i) =>
            <QuestionBlock
              key={q.id}
              q={q}
              qNum={q.id}
              lang={lang}
              value={answers[q.key]}
              onChange={(v) => onAnswer(q.key, v)} />
          )}
        </div>

        {showAdvance &&
          <div ref={btnRef} style={{ marginTop: "2.5rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <button className="btn btn-ghost" onClick={onGoBack}>
              ← {I.back}
            </button>
            <button className="btn" onClick={onAdvance}>
              {isLastPart ? I.submit : I.next} <Arrow />
            </button>
            {!isLastPart && <span className="meta">{I.keep_scrolling} ↓</span>}
          </div>
        }
      </Reveal>
    </section>);

};

/* ---------------- END CARD ---------------- */

const EndCard = ({ lang, onReset, answers }) => {
  const I = I18N[lang];
  const answered = Object.keys(answers).length;
  return (
    <section className="section stage">
      <Reveal>
        <div className="end-card">
          <StampMark />
          <h2 className="display-l" style={{ marginTop: "1rem" }}>{I.end.title}</h2>
          <p className="lede" style={{ textAlign: "center", maxWidth: "50ch" }}>{I.end.lede}</p>
          <div style={{ display: "flex", gap: "2rem", marginTop: "1rem" }}>
            <div className="hero-stat" style={{ textAlign: "center" }}>
              <div className="k">{answered}</div>
              <div className="v">{{ fr: "réponses", en: "responses", ru: "ответов", zh: "条回答" }[lang] || "responses"}</div>
            </div>
            <div className="hero-stat" style={{ textAlign: "center" }}>
              <div className="k">∞</div>
              <div className="v">{{ fr: "merci", en: "thanks", ru: "спасибо", zh: "感谢" }[lang] || "thanks"}</div>
            </div>
          </div>
          <div className="sig">
            <span>{I.end.sig}</span>
          </div>
          <button className="btn btn-ghost" onClick={onReset} style={{ marginTop: "1.5rem" }}>
            {I.end.again}
          </button>
        </div>
      </Reveal>
    </section>);

};

/* ---------------- TWEAKS ---------------- */

const TWEAK_DEFAULTS = {
  "lang": "fr",
  "font": "serif",
  "density": "default",
  "theme": "light"
}

const SurveyTweaks = ({ tweaks, setTweaks, pct = 0 }) => {
  const labels = {
    fr: { 
      lang: "Langue", disp: "Affichage", typo: "Typographie", font: "Police", 
      layout: "Mise en page", density: "Densité", mode: "Mode",
      spacious: "Spacieux", compact: "Compact", light: "Clair", dark: "Sombre" 
    },
    en: { 
      lang: "Language", disp: "Display", typo: "Typography", font: "Font", 
      layout: "Layout", density: "Density", mode: "Mode",
      spacious: "Spacious", compact: "Compact", light: "Light", dark: "Dark" 
    },
    ru: { 
      lang: "Язык", disp: "Отображение", typo: "Типографика", font: "Шрифт", 
      layout: "Макет", density: "Плотность", mode: "Режим",
      spacious: "Просторный", compact: "Компактный", light: "Светлый", dark: "Темный" 
    },
    zh: { 
      lang: "语言", disp: "显示", typo: "排版", font: "字体", 
      layout: "布局", density: "密度", mode: "模式",
      spacious: "宽敞", compact: "紧凑", light: "浅色", dark: "深色" 
    }
  };
  const L = labels[tweaks.lang] || labels.en;

  return (
    <TweaksPanel title="Tweaks" pct={pct}>
      <TweakSection title={L.lang}>
        <TweakRadio
          label={L.disp}
          value={tweaks.lang}
          onChange={(v) => setTweaks({ lang: v })}
          options={[
            { value: "fr", label: "Français" },
            { value: "en", label: "English" },
            { value: "ru", label: "Русский" },
            { value: "zh", label: "中文" }
          ]} />
      </TweakSection>

      <TweakSection title={L.typo}>
        <TweakRadio
          label={L.font}
          value={tweaks.font}
          onChange={(v) => setTweaks({ font: v })}
          options={[
            { value: "serif", label: "Serif" },
            { value: "sans", label: "Sans" },
            { value: "mono", label: "Mono" }
          ]} />
      </TweakSection>

      <TweakSection title={L.layout}>
        <TweakRadio
          label={L.density}
          value={tweaks.density}
          onChange={(v) => setTweaks({ density: v })}
          options={[
            { value: "default", label: L.spacious },
            { value: "compact", label: L.compact }
          ]} />

        <TweakRadio
          label={L.mode}
          value={tweaks.theme}
          onChange={(v) => setTweaks({ theme: v })}
          options={[
            { value: "light", label: L.light },
            { value: "dark", label: L.dark }
          ]} />
      </TweakSection>
    </TweaksPanel>
  );
};

/* ---------------- MAIN APP ---------------- */

export default function App() {
  const [tweaks, setTweaks] = useTweaks(TWEAK_DEFAULTS);
  const { lang, font, density, theme } = tweaks;

  const [filter, setFilter] = useState(null);
  const [answers, setAnswers] = useState({});
  const [unlockedPartIdx, setUnlockedPartIdx] = useState(-1); // -1 = filter gate only
  const [submitted, setSubmitted] = useState(false);
  const [topbarVisible, setTopbarVisible] = useState(false);

  // Scroll watcher — reveal topbar & progress ring after hero
  useEffect(() => {
    const onScroll = () => setTopbarVisible(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Apply theme/font/density
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.font = font;
    document.documentElement.dataset.density = density;
  }, [theme, font, density]);

  const activePartIds = useMemo(() => filter ? getActiveParts(filter) : [], [filter]);
  const activeParts = useMemo(
    () => SURVEY.parts.filter((p) => activePartIds.includes(p.id)),
    [activePartIds]
  );

  // Count total answerable questions in active path
  const totalQs = useMemo(() => {
    return 1 + activeParts.reduce((acc, p) => acc + p.questions.length, 0);
  }, [activeParts]);

  const answeredCount = useMemo(() => {
    let n = filter ? 1 : 0;
    activeParts.forEach((p) => {
      p.questions.forEach((q) => {
        if (isAnswered(q, answers[q.key])) n++;
      });
    });
    return n;
  }, [filter, activeParts, answers]);

  const pct = totalQs > 0 ? answeredCount / totalQs * 100 : 0;

  const setAnswer = useCallback((key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleBegin = () => {
    document.getElementById("filter")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFilterContinue = () => {
    setUnlockedPartIdx(0);
    setTimeout(() => {
      document.getElementById(`part-0`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const handleAdvance = (currentIdx) => {
    if (currentIdx + 1 >= activeParts.length) {
      setSubmitted(true);
      setTimeout(() => {
        document.getElementById("end")?.scrollIntoView({ behavior: "smooth" });
      }, 60);
    } else {
      setUnlockedPartIdx((prev) => Math.max(prev, currentIdx + 1));
      setTimeout(() => {
        document.getElementById(`part-${currentIdx + 1}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    }
  };

  const handleReset = () => {
    setFilter(null);
    setAnswers({});
    setUnlockedPartIdx(-1);
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoBack = (currentIdx) => {
    // currentIdx: -1 = filter section, 0..n = part index
    if (currentIdx === -1) {
      // From filter → scroll to hero top
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentIdx === 0) {
      // From first part → scroll to filter
      document.getElementById("filter")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // From part N → scroll to part N-1
      document.getElementById(`part-${currentIdx - 1}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Is a part fully answered?
  const isPartComplete = (part) =>
    part.questions.every((q) => isAnswered(q, answers[q.key]));

  return (
    <>
      <TopBar visible={topbarVisible} lang={lang} pct={pct} filterValue={filter} />

      <div className="road-line left" />
      <div className="road-line right" />

      <Hero lang={lang} onBegin={handleBegin} />
      <FilterSection
        lang={lang}
        value={filter}
        onChange={setFilter}
        onContinue={handleFilterContinue}
        onGoBack={() => handleGoBack(-1)} />


      {activeParts.map((part, idx) => {
        const unlocked = idx <= unlockedPartIdx;
        const partMeta = I18N[lang].parts_meta[part.id - 1];
        const complete = isPartComplete(part);
        const isLast = idx === activeParts.length - 1;
        const questionOffset = activeParts.slice(0, idx).reduce((acc, p) => acc + p.questions.length, 0);
        if (!unlocked) return null;
        return (
          <div key={part.id} id={`part-${idx}`}>
            <PartSection
              part={part}
              lang={lang}
              answers={answers}
              onAnswer={setAnswer}
              partMeta={partMeta}
              onAdvance={() => handleAdvance(idx)}
              onGoBack={() => handleGoBack(idx)}
              isActive
              showAdvance={complete}
              isLastPart={isLast}
              questionOffset={questionOffset} />

          </div>);

      })}

      {submitted &&
        <div id="end">
          <EndCard lang={lang} onReset={handleReset} answers={answers} />
        </div>
      }

      <SurveyTweaks tweaks={tweaks} setTweaks={setTweaks} pct={pct} />

    </>
  );
}
