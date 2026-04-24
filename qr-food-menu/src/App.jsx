import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import CustomerMenuPage from "./pages/CustomerMenuPage";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { useI18n } from "./i18n.jsx";

const THEMES = [
  { id: "saffron-thali", labelKey: "themeSaffronThali" },
  { id: "mint-cafe", labelKey: "themeMintCafe" },
  { id: "street-spice", labelKey: "themeStreetSpice" }
];

export default function App() {
  const { t } = useI18n();
  const [theme, setTheme] = useState(() => localStorage.getItem("qr-food-theme") || THEMES[0].id);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("qr-food-theme", theme);
  }, [theme]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-badge">QR</div>
          <div>
            <h1>{t("appTitle")}</h1>
            <p>{t("appSubtitle")}</p>
          </div>
        </div>
        <div className="topbar-actions">
          <Link className="ghost-btn" to="/admin">
            {t("admin")}
          </Link>
          <label className="theme-switch">
            <span>{t("theme")}</span>
            <select value={theme} onChange={(e) => setTheme(e.target.value)}>
              {THEMES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {t(entry.labelKey)}
                </option>
              ))}
            </select>
          </label>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="page-wrap">
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/menu/:shopId" element={<CustomerMenuPage />} />
        </Routes>
      </main>
    </div>
  );
}
