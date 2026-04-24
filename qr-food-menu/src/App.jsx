import { Link, Navigate, Route, Routes } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import CustomerMenuPage from "./pages/CustomerMenuPage";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { useI18n } from "./i18n.jsx";

export default function App() {
  const { t } = useI18n();

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
