import { useI18n } from "../i18n.jsx";
import { businessTypeLabel } from "../utils";

function formatShopTime(shop) {
  const timestamp = shop.updatedAt || shop.createdAt;
  if (!timestamp) return "Just created";

  const date = typeof timestamp.toDate === "function" ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
  if (Number.isNaN(date.getTime())) return "Just created";

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export default function ShopList({ shops, selectedShopId, onSelect, onCreate }) {
  const { t } = useI18n();

  return (
    <aside className="card shop-list">
      <div className="section-head">
        <h2>{t("yourShops")}</h2>
        <button className="primary-btn" type="button" onClick={onCreate}>
          {t("createShop")}
        </button>
      </div>

      <p className="muted-text shop-count">{shops.length} recent shop{shops.length === 1 ? "" : "s"}</p>

      <div className="shop-items">
        {shops.length === 0 && <p className="muted-text">{t("noShops")}</p>}

        {shops.map((shop) => {
          const active = shop.id === selectedShopId;
          return (
            <button
              className={`shop-item ${active ? "active" : ""}`}
              key={shop.id}
              onClick={() => onSelect(shop.id)}
              type="button"
            >
              <strong>{shop.name?.trim() || "Untitled Shop"}</strong>
              <span>{businessTypeLabel(shop.businessType, shop.businessTypeCustom, t)}</span>
              <span>{shop.mobile || "--"}</span>
              <small>{formatShopTime(shop)}</small>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
