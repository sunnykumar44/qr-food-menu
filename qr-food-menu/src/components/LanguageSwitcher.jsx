import { useI18n } from "../i18n.jsx";

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();

  return (
    <label className="lang-switch">
      <span>{t("language")}</span>
      <select value={lang} onChange={(e) => setLang(e.target.value)}>
        <option value="en">{t("english")}</option>
        <option value="te">{t("telugu")}</option>
      </select>
    </label>
  );
}
