'use client';
import { useEffect } from 'react';
import { useTweaks, TweaksPanel, TweakSection, TweakRadio } from './tweaks-panel';

export { useTweaks };

export const TWEAK_DEFAULTS = {
  lang: 'en',
  font: 'serif',
  density: 'default',
  theme: 'light',
};

const SUPPORTED_LANGS = ['fr', 'en', 'ru', 'zh'];
const LANGUAGE_CHANGE_EVENT = 'gyro:languagechange';

function detectBrowserLang() {
  if (typeof navigator === 'undefined') return 'en';
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const bl of langs) {
    const code = bl.split('-')[0].toLowerCase();
    if (SUPPORTED_LANGS.includes(code)) return code;
  }
  return 'en';
}

// Comme useTweaks mais détecte la langue du navigateur au premier chargement
// si aucune préférence n'a jamais été sauvegardée.
export function useSurveyTweaks(defaults) {
  const [tweaks, setTweaks] = useTweaks(defaults);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('__tweaks_persistence');
      const parsed = saved ? JSON.parse(saved) : null;
      if (!parsed?.lang) {
        setTweaks({ lang: detectBrowserLang() });
      }
    } catch (_) {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return [tweaks, setTweaks];
}

const labels = {
  fr: { lang: "Langue", disp: "Affichage", typo: "Typographie", font: "Police", layout: "Mise en page", density: "Densité", mode: "Mode", spacious: "Spacieux", compact: "Compact", light: "Clair", dark: "Sombre" },
  en: { lang: "Language", disp: "Display", typo: "Typography", font: "Font", layout: "Layout", density: "Density", mode: "Mode", spacious: "Spacious", compact: "Compact", light: "Light", dark: "Dark" },
  ru: { lang: "Язык", disp: "Отображение", typo: "Типографика", font: "Шрифт", layout: "Макет", density: "Плотность", mode: "Режим", spacious: "Просторный", compact: "Компактный", light: "Светлый", dark: "Темный" },
  zh: { lang: "语言", disp: "显示", typo: "排版", font: "字体", layout: "布局", density: "密度", mode: "模式", spacious: "宽敞", compact: "紧凑", light: "浅色", dark: "深色" },
};

export function SurveyTweaks({ tweaks, setTweaks, pct = 0 }) {
  const L = labels[tweaks.lang] || labels.en;

  useEffect(() => {
    document.documentElement.dataset.theme = tweaks.theme;
    document.documentElement.dataset.font = tweaks.font;
    document.documentElement.dataset.density = tweaks.density;
  }, [tweaks.theme, tweaks.font, tweaks.density]);

  useEffect(() => {
    document.documentElement.lang = tweaks.lang;
    const event = new CustomEvent(LANGUAGE_CHANGE_EVENT, {
      detail: { lang: tweaks.lang },
    });
    window.dispatchEvent(event);
    const timer = window.setTimeout(() => {
      window.dispatchEvent(event);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [tweaks.lang]);

  return (
    <TweaksPanel title="Tweaks" pct={pct}>
      <TweakSection label={L.lang}>
        <TweakRadio
          label={L.disp}
          value={tweaks.lang}
          onChange={(v) => setTweaks({ lang: v })}
          options={[
            { value: 'fr', label: 'Français' },
            { value: 'en', label: 'English' },
            { value: 'ru', label: 'Русский' },
            { value: 'zh', label: '中文' },
          ]} />
      </TweakSection>
      <TweakSection label={L.typo}>
        <TweakRadio
          label={L.font}
          value={tweaks.font}
          onChange={(v) => setTweaks({ font: v })}
          options={[
            { value: 'serif', label: 'Serif' },
            { value: 'sans', label: 'Sans' },
            { value: 'mono', label: 'Mono' },
          ]} />
      </TweakSection>
      <TweakSection label={L.layout}>
        <TweakRadio
          label={L.density}
          value={tweaks.density}
          onChange={(v) => setTweaks({ density: v })}
          options={[
            { value: 'default', label: L.spacious },
            { value: 'compact', label: L.compact },
          ]} />
        <TweakRadio
          label={L.mode}
          value={tweaks.theme}
          onChange={(v) => setTweaks({ theme: v })}
          options={[
            { value: 'light', label: L.light },
            { value: 'dark', label: L.dark },
          ]} />
      </TweakSection>
    </TweaksPanel>
  );
}
